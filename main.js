const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const tls = require("tls");

const AI_MODELS = new Set(["gpt-5-mini", "gpt-5", "gpt-4.1-mini"]);

ipcMain.handle("parmitalia-ai-generate", async (_event, request) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY non configurata nell'ambiente dell'app desktop.");

  const model = AI_MODELS.has(request?.model) ? request.model : "gpt-5-mini";
  const instructions = String(request?.instructions || "").slice(0, 12000);
  const input = String(request?.input || "").slice(0, 16000);
  if (!input.trim()) throw new Error("Testo da elaborare mancante.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 70000);
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, instructions, input })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error?.message || `Connessione IA non riuscita (${response.status}).`);
    return data;
  } finally {
    clearTimeout(timer);
  }
});

function quoteImap(value) {
  return `"${String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function parseHeaders(raw) {
  const headerText = String(raw || "").split(/\r?\n\r?\n/)[0] || "";
  const unfolded = headerText.replace(/\r?\n[ \t]+/g, " ");
  const get = name => {
    const match = unfolded.match(new RegExp("^" + name + ":\\s*(.*)$", "im"));
    return match ? match[1].trim() : "";
  };
  return {
    from: get("From"),
    subject: get("Subject"),
    date: get("Date"),
    to: get("To")
  };
}

function splitImapMessages(raw) {
  const chunks = String(raw || "").split(/\r?\n\* \d+ FETCH /).filter(Boolean);
  return chunks.map(chunk => {
    const uid = (chunk.match(/UID\s+(\d+)/i) || [])[1] || "";
    const bodyMatch = chunk.match(/\{(\d+)\}\r?\n([\s\S]*?)(?:\r?\n\)|\r?\n[A-Z0-9]+ OK|\r?\n\* \d+ FETCH|$)/i);
    const text = bodyMatch ? bodyMatch[2] : chunk;
    const headers = parseHeaders(text);
    return {
      uid,
      from: headers.from || "-",
      subject: headers.subject || "(senza oggetto)",
      date: headers.date || "",
      to: headers.to || "",
      preview: String(text || "").replace(/\s+/g, " ").slice(0, 650),
      raw: String(text || "").slice(0, 8000)
    };
  }).filter(item => item.uid || item.from || item.subject);
}

function fetchImapInbox(config) {
  const host = String(config?.host || "").trim();
  const port = Number(config?.port || 993);
  const user = String(config?.user || "").trim();
  const password = String(config?.password || "");
  const limit = Math.max(1, Math.min(50, Number(config?.limit || 20)));
  if (!host || !user || !password) throw new Error("Host IMAP, utente e password sono obbligatori.");

  return new Promise((resolve, reject) => {
    let tagNo = 1;
    let buffer = "";
    let settled = false;
    const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: config?.rejectUnauthorized !== false });
    const timer = setTimeout(() => fail(new Error("Timeout connessione IMAP.")), 45000);

    function tag() { return "A" + String(tagNo++).padStart(4, "0"); }
    function send(command) { socket.write(command + "\r\n"); }
    function fail(err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.destroy(); } catch (_) {}
      reject(err);
    }
    function waitFor(doneTag) {
      return new Promise((res, rej) => {
        const check = () => {
          const done = buffer.match(new RegExp("\\r?\\n" + doneTag + " (OK|NO|BAD) ([^\\r\\n]*)", "i"));
          if (!done) return false;
          if (done[1].toUpperCase() !== "OK") rej(new Error(done[2] || "Comando IMAP non riuscito."));
          else res(buffer);
          return true;
        };
        const onData = data => { buffer += data.toString("utf8"); check(); };
        socket.on("data", onData);
        const cleanup = () => socket.off("data", onData);
        res.finally?.(cleanup);
        rej.finally?.(cleanup);
        check();
      });
    }
    async function command(text) {
      buffer = "";
      const t = tag();
      send(t + " " + text);
      return waitFor(t);
    }

    socket.on("error", fail);
    socket.on("secureConnect", async () => {
      try {
        await new Promise(res => socket.once("data", data => { buffer += data.toString("utf8"); res(); }));
        await command("LOGIN " + quoteImap(user) + " " + quoteImap(password));
        await command("SELECT INBOX");
        const search = await command("UID SEARCH ALL");
        const uidLine = (search.match(/\* SEARCH\s+([0-9 ]+)/i) || [])[1] || "";
        const uids = uidLine.trim().split(/\s+/).filter(Boolean).slice(-limit);
        if (!uids.length) {
          await command("LOGOUT").catch(() => {});
          settled = true;
          clearTimeout(timer);
          socket.end();
          resolve({ messages: [] });
          return;
        }
        const fetched = await command("UID FETCH " + uids.join(",") + " (UID BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[TEXT]<0.1800>)");
        await command("LOGOUT").catch(() => {});
        settled = true;
        clearTimeout(timer);
        socket.end();
        resolve({ messages: splitImapMessages(fetched).slice(-limit).reverse() });
      } catch (err) {
        fail(err);
      }
    });
  });
}

ipcMain.handle("parmitalia-mail-fetch-inbox", async (_event, config) => {
  return fetchImapInbox(config);
});

function createWindow() {
  const window = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: "#f4f7fb",
    show: false,
    autoHideMenuBar: true,
    title: "Parmitalia Management System",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.loadFile(path.join(__dirname, "app", "APP_UNIFICATA_CLAL_ANDAMENTI_MERCATO_FINALE_UNIFICATA.html"));
  window.once("ready-to-show", () => window.show());
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
