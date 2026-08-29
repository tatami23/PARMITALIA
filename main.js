const { app, BrowserWindow, ipcMain, shell, dialog } = require("electron");
const fs = require("fs/promises");
const path = require("path");
const tls = require("tls");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");

const AI_MODELS = new Set(["gpt-5-mini", "gpt-5", "gpt-4.1-mini"]);
const STATE_BACKUP_LIMIT = 80;
let mainWindow = null;
let storageSaveQueue = Promise.resolve();
let rendererDiagnostics = [];
app.disableHardwareAcceleration();
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");
app.commandLine.appendSwitch("no-sandbox");
app.commandLine.appendSwitch("in-process-gpu");
app.commandLine.appendSwitch("disable-gpu");
app.commandLine.appendSwitch("disable-gpu-compositing");
app.commandLine.appendSwitch("disable-software-rasterizer");
app.commandLine.appendSwitch("disable-direct-composition");
app.commandLine.appendSwitch("disable-vulkan");
app.commandLine.appendSwitch("disable-features", "UseSkiaRenderer,VizDisplayCompositor,Vulkan,CanvasOopRasterization,RawDraw");
app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
const gotSingleInstanceLock = app.requestSingleInstanceLock();

function installedAppHtmlPath() {
  return path.join(__dirname, "app", "APP_UNIFICATA_CLAL_ANDAMENTI_MERCATO_FINALE_UNIFICATA.html");
}

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    mainWindow.webContents.executeJavaScript("!!window.PMS_V253_BROKERAGE_QUANTITY_COMMISSION_PRINTS", true)
      .then(isBrokeragePatchLoaded => {
        if (!isBrokeragePatchLoaded && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadFile(installedAppHtmlPath()).catch(error => {
            recordMainDiagnostic("second-instance-reload-failed", { message: error.message, stack: error.stack });
          });
        }
      })
      .catch(error => {
        recordMainDiagnostic("second-instance-patch-check-failed", { message: error.message, stack: error.stack });
      });
  });
}

function safePdfName(value) {
  const base = String(value || "Parmitalia stampa")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "Parmitalia stampa";
  return base + " - " + new Date().toISOString().replace(/[:.]/g, "-") + ".pdf";
}

function pdfOutputDir() {
  return path.join(app.getPath("documents"), "Parmitalia PDF");
}

async function firstExistingPath(paths) {
  for (const file of paths) {
    try {
      await fs.access(file);
      return file;
    } catch (_) {}
  }
  return "";
}

async function openPdfInReader(pdfPath) {
  const candidates = process.platform === "win32" ? [
    "C:\\Program Files\\Adobe\\Acrobat DC\\Acrobat\\Acrobat.exe",
    "C:\\Program Files\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe",
    "C:\\Program Files (x86)\\Adobe\\Acrobat Reader DC\\Reader\\AcroRd32.exe",
    "C:\\Program Files\\Adobe\\Acrobat Reader\\Reader\\AcroRd32.exe",
    "C:\\Program Files (x86)\\Adobe\\Acrobat Reader\\Reader\\AcroRd32.exe"
  ] : [];
  const reader = await firstExistingPath(candidates);
  if (reader) {
    const child = spawn(reader, [pdfPath], { detached: true, stdio: "ignore" });
    child.unref();
    return { opened: true, app: reader };
  }
  const error = await shell.openPath(pdfPath);
  return { opened: !error, app: "default", error };
}

async function printHtmlToPdf(payload) {
  const html = String(payload && payload.html || "");
  if (!html.trim()) throw new Error("Documento di stampa vuoto.");
  const title = String(payload && payload.title || "Parmitalia PDF");
  const outDir = pdfOutputDir();
  await fs.mkdir(outDir, { recursive: true });
  const pdfPath = path.join(outDir, safePdfName(title));
  const htmlPath = path.join(app.getPath("temp"), "parmitalia-print-" + process.pid + "-" + Date.now() + ".html");
  const appBaseHref = pathToFileURL(path.join(__dirname, "app") + path.sep).href;
  const htmlWithBase = /<base\s/i.test(html)
    ? html
    : html.replace(/<head([^>]*)>/i, '<head$1><base href="' + appBaseHref + '">');
  await fs.writeFile(htmlPath, htmlWithBase, "utf8");
  const printWindow = new BrowserWindow({
    show: false,
    width: 1240,
    height: 1754,
    backgroundColor: "#ffffff",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  try {
    await printWindow.loadFile(htmlPath);
    await new Promise(resolve => setTimeout(resolve, 350));
    const pdf = await printWindow.webContents.printToPDF({
      printBackground: true,
      preferCSSPageSize: true,
      landscape: false,
      pageSize: "A4"
    });
    await fs.writeFile(pdfPath, pdf);
    const opened = await openPdfInReader(pdfPath);
    return { ok: true, file: pdfPath, opened };
  } finally {
    try { printWindow.close(); } catch (_) {}
    fs.unlink(htmlPath).catch(() => {});
  }
}

function stateFilePath() {
  return path.join(app.getPath("userData"), "parmitalia-state.json");
}

function backupDirPath() {
  return path.join(app.getPath("userData"), "backups");
}

function mirrorBackupDirPath() {
  const configured = String(process.env.PARMITALIA_CLOUD_DIR || "").trim();
  if (configured) return path.join(configured, "sync-backups");
  const oneDriveCandidates = [
    process.env.OneDriveCommercial,
    process.env.OneDriveConsumer,
    process.env.OneDrive,
    path.join(app.getPath("home"), "OneDrive")
  ].filter(Boolean);
  const base = oneDriveCandidates[0] || path.join(app.getPath("documents"), "Parmitalia Cloud");
  return path.join(base, "Apps", "Documente", "gestionale parmitalia", "sync-backups");
}

function backupStamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function rendererDiagnosticPath() {
  return path.join(mirrorBackupDirPath(), "parmitalia-live-renderer-diagnostic.json");
}

async function writeRendererDiagnostic(extra) {
  try {
    const payload = {
      at: new Date().toISOString(),
      extra: extra || null,
      events: rendererDiagnostics.slice(-80)
    };
    await fs.mkdir(path.dirname(rendererDiagnosticPath()), { recursive: true });
    await fs.writeFile(rendererDiagnosticPath(), JSON.stringify(payload, null, 2), "utf8");
  } catch (_) {}
}

function recordMainDiagnostic(type, details) {
  rendererDiagnostics.push({ type, details, at: new Date().toISOString() });
  writeRendererDiagnostic();
}

process.on("uncaughtException", error => {
  recordMainDiagnostic("main-uncaught-exception", { message: error && error.message, stack: error && error.stack });
});

process.on("unhandledRejection", reason => {
  recordMainDiagnostic("main-unhandled-rejection", { message: reason && reason.message || String(reason || ""), stack: reason && reason.stack });
});

function recordScore(data) {
  if (!data || typeof data !== "object") return 0;
  const important = [
    "orders", "offers", "products", "contacts", "intermediations", "documents",
    "payments", "contracts", "contractTemplates", "tasks", "accountant",
    "agents", "communications", "foreignEmployees", "priceHistory",
    "supplierPriceConfirmations", "operationalAgenda", "trattativeInCorso",
    "companyFleet", "foreignRecruiting", "officeTasks", "officeCommunications",
    "brokerageRequests", "productShowcaseItems", "dairyProductionScenarios",
    "recruitingCandidates", "employees", "employeeTimeEntries"
  ];
  let score = 0;
  for (const key of important) {
    if (Array.isArray(data[key])) score += data[key].length * 100;
  }
  try { score += Math.min(JSON.stringify(data).length, 250000) / 1000; } catch (_) {}
  return score;
}

function stableStateJson(data) {
  return JSON.stringify(data || {}, (key, value) => key === "_pmsAutosave" ? undefined : value);
}

async function readJsonFile(file) {
  const raw = await fs.readFile(file, "utf8");
  return { file, raw, data: JSON.parse(raw) };
}

async function existingStateCandidates() {
  const files = [stateFilePath()];
  try {
    const entries = await fs.readdir(backupDirPath(), { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /^parmitalia-state-.*\.json$/i.test(entry.name)) {
        files.push(path.join(backupDirPath(), entry.name));
      }
    }
  } catch (_) {}
  try {
    const mirrorDir = mirrorBackupDirPath();
    files.push(path.join(mirrorDir, "parmitalia-state-latest.json"));
    const entries = await fs.readdir(mirrorDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && /^parmitalia-state-.*\.json$/i.test(entry.name)) {
        files.push(path.join(mirrorDir, entry.name));
      }
    }
  } catch (_) {}
  const results = [];
  for (const file of files) {
    try {
      const parsed = await readJsonFile(file);
      const stat = await fs.stat(file);
      results.push({ ...parsed, mtimeMs: stat.mtimeMs, score: recordScore(parsed.data) });
    } catch (_) {}
  }
  return results;
}

function newerStamp(data) {
  return String(data && data._pmsAutosave && data._pmsAutosave.updatedAt || "");
}

function bestStateCandidate(candidates) {
  return candidates.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 200) return b.score - a.score;
    const stampA = newerStamp(a.data);
    const stampB = newerStamp(b.data);
    if (stampA && stampB && stampA !== stampB) return stampB.localeCompare(stampA);
    return b.mtimeMs - a.mtimeMs;
  })[0] || null;
}

async function pruneBackups() {
  try {
    const dir = backupDirPath();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const backups = [];
    for (const entry of entries) {
      if (!entry.isFile() || !/^parmitalia-state-.*\.json$/i.test(entry.name)) continue;
      const file = path.join(dir, entry.name);
      const stat = await fs.stat(file);
      backups.push({ file, mtimeMs: stat.mtimeMs });
    }
    backups.sort((a, b) => b.mtimeMs - a.mtimeMs);
    await Promise.all(backups.slice(STATE_BACKUP_LIMIT).map(item => fs.unlink(item.file).catch(() => {})));
  } catch (_) {}
}

async function pruneMirrorBackups() {
  try {
    const dir = mirrorBackupDirPath();
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const backups = [];
    for (const entry of entries) {
      if (!entry.isFile() || !/^parmitalia-state-.*\.json$/i.test(entry.name)) continue;
      const file = path.join(dir, entry.name);
      const stat = await fs.stat(file);
      backups.push({ file, mtimeMs: stat.mtimeMs });
    }
    backups.sort((a, b) => b.mtimeMs - a.mtimeMs);
    await Promise.all(backups.slice(STATE_BACKUP_LIMIT).map(item => fs.unlink(item.file).catch(() => {})));
  } catch (_) {}
}

async function saveStoragePayload(payload) {
  const file = stateFilePath();
  const incoming = payload && typeof payload === "object" ? payload : {};
  const incomingScore = recordScore(incoming);
  const incomingJson = JSON.stringify(incoming, null, 2);
  const incomingStableJson = stableStateJson(incoming);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.mkdir(backupDirPath(), { recursive: true });
  const existing = await existingStateCandidates();
  const best = bestStateCandidate(existing);
  if (best && best.score > 850 && incomingScore < Math.max(120, best.score * 0.28)) {
    if (incomingScore < 120) {
      const rejected = path.join(backupDirPath(), "rejected-empty-save-" + backupStamp() + ".json");
      await fs.writeFile(rejected, incomingJson, "utf8");
    }
    return { ok: true, ignored: true, reason: "incoming-state-smaller-than-preserved-archive", file, preserved: best.file };
  }
  let contentChanged = true;
  try {
    const raw = await fs.readFile(file, "utf8");
    const previous = JSON.parse(raw);
    contentChanged = stableStateJson(previous) !== incomingStableJson;
    if (!contentChanged) {
      await fs.writeFile(path.join(backupDirPath(), "parmitalia-state-latest.json"), incomingJson, "utf8").catch(() => {});
      return { ok: true, unchanged: true, file };
    }
    const backup = path.join(backupDirPath(), "parmitalia-state-" + backupStamp() + ".json");
    await fs.writeFile(backup, raw, "utf8");
  } catch (_) {}
  const tmp = file + "." + process.pid + "." + Date.now() + "." + Math.random().toString(36).slice(2) + ".tmp";
  await fs.writeFile(tmp, incomingJson, "utf8");
  await fs.rename(tmp, file);
  await fs.writeFile(path.join(backupDirPath(), "parmitalia-state-latest.json"), incomingJson, "utf8").catch(() => {});
  try {
    const mirrorDir = mirrorBackupDirPath();
    await fs.mkdir(mirrorDir, { recursive: true });
    await fs.writeFile(path.join(mirrorDir, "parmitalia-state-latest.json"), incomingJson, "utf8");
    await fs.writeFile(path.join(mirrorDir, "parmitalia-state-" + backupStamp() + ".json"), incomingJson, "utf8");
    pruneMirrorBackups();
  } catch (error) {
    console.warn("Backup mirror OneDrive non completato:", error);
  }
  pruneBackups();
  return { ok: true, file };
}

ipcMain.handle("parmitalia-storage-load", async () => {
  try {
    const best = bestStateCandidate(await existingStateCandidates());
    return best ? best.data : null;
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    throw error;
  }
});

ipcMain.handle("parmitalia-storage-save", async (_event, payload) => {
  storageSaveQueue = storageSaveQueue.catch(() => {}).then(() => saveStoragePayload(payload));
  return storageSaveQueue;
});

ipcMain.handle("parmitalia-print-to-pdf", async (_event, payload) => {
  return printHtmlToPdf(payload);
});

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
  const appHtmlPath = installedAppHtmlPath();
  let rendererRecoveryAttempts = 0;
  let rendererRecoveryWindowStartedAt = Date.now();
  const window = new BrowserWindow({
    width: 1500,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    backgroundColor: "#f4f7fb",
    show: true,
    autoHideMenuBar: true,
    title: "Parmitalia Management System",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow = window;
  window.on("closed", () => {
    if (mainWindow === window) mainWindow = null;
  });
  window.webContents.on("console-message", (_event, level, message, line, sourceId) => {
    rendererDiagnostics.push({ type: "console", level, message, line, sourceId, at: new Date().toISOString() });
    writeRendererDiagnostic();
  });
  function recoverRenderer(reason, details) {
    recordMainDiagnostic("renderer-recovery-requested", { reason, details, attempt: rendererRecoveryAttempts + 1 });
    if (window.isDestroyed()) return;
    if (Date.now() - rendererRecoveryWindowStartedAt > 120000) {
      rendererRecoveryWindowStartedAt = Date.now();
      rendererRecoveryAttempts = 0;
    }
    if (rendererRecoveryAttempts >= 6) {
      recordMainDiagnostic("renderer-recovery-paused", { reason, attempts: rendererRecoveryAttempts });
      return;
    }
    rendererRecoveryAttempts += 1;
    setTimeout(() => {
      if (window.isDestroyed()) return;
      try { window.webContents.stop(); } catch (_) {}
      window.loadFile(appHtmlPath).then(() => {
        recordMainDiagnostic("renderer-reloaded", { reason, attempt: rendererRecoveryAttempts });
      }).catch(error => {
        recordMainDiagnostic("renderer-reload-failed", { message: error.message, stack: error.stack });
      });
      window.show();
      if (reason !== "unresponsive") window.focus();
    }, reason === "unresponsive" ? 1200 : 500);
  }
  window.webContents.on("render-process-gone", (_event, details) => {
    rendererDiagnostics.push({ type: "render-process-gone", details, at: new Date().toISOString() });
    writeRendererDiagnostic();
    if (!details || details.reason !== "clean-exit") recoverRenderer("render-process-gone", details);
  });
  window.webContents.on("unresponsive", () => {
    recoverRenderer("unresponsive", { page: window.webContents.getURL() });
  });
  window.webContents.on("responsive", () => {
    recordMainDiagnostic("renderer-responsive", { page: window.webContents.getURL() });
  });
  window.webContents.on("did-fail-load", (_event, code, description, url) => {
    rendererDiagnostics.push({ type: "did-fail-load", code, description, url, at: new Date().toISOString() });
    writeRendererDiagnostic();
  });

  let allowClose = false;
  let closeInProgress = false;
  async function requestRendererSave(reason) {
    if (window.isDestroyed() || window.webContents.isDestroyed()) return false;
    const saveScript = `
      (async function(){
        if (window.PMS_V222_FUNCTIONAL_CORE && typeof window.PMS_V222_FUNCTIONAL_CORE.saveNow === "function") {
          await window.PMS_V222_FUNCTIONAL_CORE.saveNow(${JSON.stringify(reason)});
          return true;
        }
        if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
          await window.PMS_V195_HARDENED_AUTOSAVE.saveNow(${JSON.stringify(reason)});
          return true;
        }
        if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
          await window.PMS_V173_AUTO_SAVE_UPDATE.saveNow(${JSON.stringify(reason)});
          return true;
        }
        if (typeof window.save === "function") window.save();
        return true;
      })();
    `;
    return Promise.race([
      window.webContents.executeJavaScript(saveScript, true),
      new Promise(resolve => setTimeout(() => resolve(false), 3500))
    ]).catch(error => {
      console.warn("Salvataggio automatico in uscita non completato:", error);
      return false;
    });
  }
  window.on("close", event => {
    if (allowClose || window.webContents.isDestroyed()) return;
    event.preventDefault();
    if (closeInProgress) return;
    closeInProgress = true;
    dialog.showMessageBox(window, {
      type: "question",
      title: "Uscire da Parmitalia",
      message: "Vuoi salvare i dati prima di uscire?",
      detail: "Scegli Salva ed esci per creare subito una copia aggiornata nell'archivio locale e nei backup.",
      buttons: ["Salva ed esci", "Esci senza salvare", "Annulla"],
      defaultId: 0,
      cancelId: 2,
      noLink: true
    }).then(async result => {
      if (result.response === 2) {
        closeInProgress = false;
        return;
      }
      if (result.response === 0) {
        await requestRendererSave("electron-close-confirmed");
      }
      allowClose = true;
      window.close();
    }).catch(async error => {
      console.warn("Conferma uscita non completata:", error);
      await requestRendererSave("electron-close-fallback");
      allowClose = true;
      window.close();
    });
  });

  window.webContents.on("did-finish-load", () => {
    if (!window.isDestroyed() && !window.isVisible()) window.show();
  });
  window.webContents.on("did-fail-load", (_event, code, description) => {
    console.error("Parmitalia load failed:", code, description);
    if (!window.isDestroyed()) window.show();
  });
  setTimeout(() => {
    if (!window.isDestroyed() && !window.isVisible()) window.show();
  }, 2500);
  setInterval(() => {
    if (window.isDestroyed()) return;
    window.webContents.executeJavaScript(`(function(){
      function q(s){return document.querySelector(s)}
      function css(s,p){var n=q(s); return n ? getComputedStyle(n)[p] : null}
      function html(s){var n=q(s); return n ? String(n.innerHTML || "").slice(0, 1000) : null}
      return {
        readyState: document.readyState,
        bodyBg: css("body","backgroundColor"),
        loginClass: q("#login-screen") && q("#login-screen").className,
        loginDisplay: css("#login-screen","display"),
        appClass: q("#app") && q("#app").className,
        appDisplay: css("#app","display"),
        appVisibility: css("#app","visibility"),
        pageTitle: q("#page-title") && q("#page-title").textContent,
        current: typeof current === "undefined" ? null : { page: current.page, role: current.role, user: current.user },
        modulesCount: typeof modules === "undefined" || !Array.isArray(modules) ? null : modules.length,
        navHtml: html("#nav"),
        contentHtml: html("#content"),
        patchLoaded: !!window.PMS_V219_REMOVE_BRAND_DASHBOARD_BILLING
      };
    })();`, true).then(snapshot => writeRendererDiagnostic({ snapshot })).catch(error => {
      rendererDiagnostics.push({ type: "snapshot-error", message: error.message, at: new Date().toISOString() });
      writeRendererDiagnostic();
    });
  }, 120000);
  window.loadFile(appHtmlPath).catch(error => {
    rendererDiagnostics.push({ type: "initial-load-failed", message: error.message, at: new Date().toISOString() });
    writeRendererDiagnostic();
    console.error("Parmitalia initial load failed:", error);
  });
  window.once("ready-to-show", () => window.show());
}

if (gotSingleInstanceLock) {
  app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
