(function(){
  "use strict";

  const VERSION = "pms_v177_foreign_calendar_archive_print_barcode_fix";

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function st(){
    window.state = window.state || {};
    if (!Array.isArray(state.foreignEmployees)) state.foreignEmployees = [];
    if (!Array.isArray(state.foreignRecruiting)) state.foreignRecruiting = [];
    if (state.foreignRecruiting.length && !state.foreignEmployees.length) state.foreignEmployees = state.foreignRecruiting.slice();
    if (state.foreignEmployees.length && !state.foreignRecruiting.length) state.foreignRecruiting = state.foreignEmployees.slice();
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v177-foreign-calendar");
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function recordId(record){ return String(record && (record.id || record.code || record.protocol || record.practiceCode) || ""); }
  function title(record){ return clean(record && (record.fullName || record.name || record.title || record.email || recordId(record))) || "Candidato estero"; }
  function findForeign(id){
    const value = String(id || "");
    return arr(st().foreignEmployees).find(item => recordId(item) === value) || arr(st().foreignRecruiting).find(item => recordId(item) === value) || null;
  }
  function writeForeign(record){
    if (!record) return;
    const id = recordId(record);
    ["foreignEmployees","foreignRecruiting"].forEach(module => {
      const list = arr(st()[module]);
      const index = list.findIndex(item => recordId(item) === id);
      if (index >= 0) list[index] = record;
      else if (module === "foreignEmployees") list.unshift(record);
      state[module] = list;
    });
    record.updatedAt = new Date().toISOString();
    saveNow();
  }
  function deleteForeign(id){
    const record = findForeign(id);
    if (!record) return alert("Scheda non trovata: " + id);
    if (!confirm("Eliminare definitivamente la scheda di " + title(record) + "?")) return;
    state.foreignEmployees = arr(st().foreignEmployees).filter(item => recordId(item) !== String(id));
    state.foreignRecruiting = arr(st().foreignRecruiting).filter(item => recordId(item) !== String(id));
    saveNow();
    if (typeof render === "function") render();
  }
  function cssEscape(value){
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }
  function barcode(code){
    code = clean(code || "PARMITALIA-" + today()) || "PARMITALIA";
    const chars = String(code).split("");
    let x = 8;
    const bars = chars.map((ch, index) => {
      const n = ch.charCodeAt(0) + index * 17;
      const w = 1 + (n % 4);
      const gap = 1 + ((n >> 2) % 3);
      const h = 36 + (n % 22);
      const out = '<rect x="' + x + '" y="' + (62 - h) + '" width="' + w + '" height="' + h + '" fill="#111"/>';
      x += w + gap;
      return out;
    }).join("");
    const width = Math.max(160, x + 8);
    return '<svg class="barcode-svg pms177-barcode" width="' + width + '" height="82" viewBox="0 0 ' + width + ' 82" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Codice a barre ' + esc(code) + '"><rect width="100%" height="100%" fill="#fff"/>' + bars + '<text x="' + (width / 2) + '" y="76" text-anchor="middle" font-family="monospace" font-size="10" fill="#111">' + esc(code) + '</text></svg>';
  }
  function printShell(titleText, code, body){
    return '<div class="print-document pms177-print-doc"><div class="print-header"><div><h1>' + esc(titleText) + '</h1><strong>PARMITALIA DISTRIBUTION</strong></div><div class="print-meta">' + esc(today()) + '<br>' + barcode(code) + '</div></div>' + body + '<div class="print-footer">Codice automatico e codice a barre - ' + esc(code) + '</div></div>';
  }
  function foreignTable(record){
    const rows = [
      ["ID", recordId(record)],
      ["Nome", record.fullName || record.name],
      ["Paese / citta", [record.country, record.city].filter(Boolean).join(" ")],
      ["Nazionalita", record.nationality],
      ["Ruolo", record.role],
      ["Telefono", record.phone || record.whatsapp],
      ["Email", record.email],
      ["Stato", record.status],
      ["Stato pratica", record.practiceStatus],
      ["Documenti", record.documentRequests || record.documents || record.skills],
      ["Note", record.notes]
    ];
    return '<table class="print-table"><tbody>' + rows.map(row => '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>').join("") + '</tbody></table>';
  }
  function printForeign(id){
    const record = findForeign(id);
    if (!record) return alert("Scheda non trovata: " + id);
    const html = printShell("Scheda candidato estero", recordId(record), foreignTable(record));
    if (typeof openPrint === "function") openPrint(html);
  }
  function editForeign(id){
    if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(id);
      return;
    }
    if (window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX && typeof window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX.editRecord === "function") {
      window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX.editRecord("foreignEmployees", id);
      return;
    }
    alert("Apri scheda lavoro non disponibile. Riavvia il gestionale.");
  }
  function openWorkspace(id){
    if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(id);
    } else {
      printForeign(id);
    }
  }
  function scheduleDate(record){ return String(record && (record.scheduledDate || record.operationalDate || record.calendarDate || record.appointmentDate) || "").slice(0, 10); }
  function setAppointment(id, date){
    const record = findForeign(id);
    if (!record) return false;
    record.scheduledDate = date || "";
    record.operationalDate = record.scheduledDate;
    record.calendarDate = record.scheduledDate;
    record.appointmentDate = record.scheduledDate;
    record.practiceStatus = record.scheduledDate ? "Appuntamento programmato" : (record.practiceStatus || "Pratica aperta");
    writeForeign(record);
    return true;
  }
  function clearAppointment(id){
    const record = findForeign(id);
    if (!record) return;
    if (!confirm("Eliminare l'appuntamento dal calendario per " + title(record) + "? La scheda resta in archivio.")) return;
    setAppointment(id, "");
    if (typeof render === "function") render();
  }
  function printAppointment(id){
    const record = findForeign(id);
    if (!record) return alert("Appuntamento non trovato: " + id);
    const body = '<table class="print-table"><tbody>' +
      '<tr><th>Candidato</th><td>' + esc(title(record)) + '</td></tr>' +
      '<tr><th>Data appuntamento</th><td>' + esc(scheduleDate(record) || "-") + '</td></tr>' +
      '<tr><th>Telefono</th><td>' + esc(record.phone || record.whatsapp || "-") + '</td></tr>' +
      '<tr><th>Email</th><td>' + esc(record.email || "-") + '</td></tr>' +
      '<tr><th>Documenti da controllare</th><td>Foto passaporto, passaporto, privacy bilingue</td></tr>' +
      '<tr><th>Note</th><td>' + esc(record.notes || record.documents || "-") + '</td></tr>' +
    '</tbody></table>';
    if (typeof openPrint === "function") openPrint(printShell("Appuntamento recruiting extra UE", recordId(record), body));
  }
  function candidateCard(record, compact){
    const id = recordId(record);
    const meta = [record.country, record.city, record.role].filter(Boolean).join(" - ");
    return '<article class="pms177-foreign-card" draggable="true" tabindex="0" data-pms177-foreign="' + esc(id) + '">' +
      '<div><strong>' + esc(title(record)) + '</strong><span>Extra UE</span></div>' +
      (compact ? "" : '<small>' + esc(meta || record.status || record.practiceStatus || "") + '</small>') +
      '<div class="pms177-card-actions">' +
        '<button type="button" data-pms177-work="' + esc(id) + '">Scheda</button>' +
        (compact ? '<button type="button" data-pms177-print-appt="' + esc(id) + '">Stampa appuntamento</button>' : '<button type="button" data-pms177-print="' + esc(id) + '">Stampa scheda</button>') +
        (!compact && scheduleDate(record) ? '<button type="button" data-pms177-print-appt="' + esc(id) + '">Stampa appuntamento</button>' : "") +
        (scheduleDate(record) ? '<button type="button" data-pms177-clear-appt="' + esc(id) + '">Elimina appuntamento</button>' : "") +
      '</div>' +
    '</article>';
  }
  function decorateCalendar(){
    const page = document.querySelector(".pms136-page");
    if (!page) return;
    page.querySelectorAll(".pms177-foreign-card,.pms177-foreign-backlog").forEach(node => node.remove());
    const records = arr(st().foreignEmployees).concat(arr(st().foreignRecruiting)).filter((record, index, list) => recordId(record) && list.findIndex(item => recordId(item) === recordId(record)) === index);
    page.querySelectorAll(".pms136-day").forEach(day => {
      const dayValue = day.getAttribute("data-pms136-day");
      const list = day.querySelector(".pms136-day-list") || day;
      records.filter(record => scheduleDate(record) === dayValue).forEach(record => {
        const empty = list.querySelector(".pms136-empty");
        if (empty) empty.remove();
        list.insertAdjacentHTML("beforeend", candidateCard(record, true));
      });
      if (day.dataset.pms177Bound !== "1") {
        day.dataset.pms177Bound = "1";
        day.addEventListener("dragover", event => {
          if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("application/x-pms177-foreign")) event.preventDefault();
        });
        day.addEventListener("drop", event => {
          const id = event.dataTransfer && event.dataTransfer.getData("application/x-pms177-foreign");
          if (!id) return;
          event.preventDefault();
          event.stopPropagation();
          if (setAppointment(id, day.getAttribute("data-pms136-day")) && typeof render === "function") render();
        }, true);
      }
    });
    const backlog = records.filter(record => !scheduleDate(record));
    const host = page.querySelector(".pms136-backlogs") || page;
    host.insertAdjacentHTML("beforeend", '<section class="pms136-backlog pms177-foreign-backlog"><header><h3>Candidati estero da programmare</h3><span>' + backlog.length + '</span></header><div class="pms136-backlog-list">' + (backlog.map(record => candidateCard(record, false)).join("") || '<div class="pms136-empty">Nessun candidato da programmare.</div>') + '</div></section>');
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector("[data-pms128-foreign-open],[data-pms128-foreign-edit],[data-pms128-print-employee],[data-pms128-foreign-delete],[data-pms125-rec-open],[data-pms175-open],[data-pms175-edit],[data-pms175-print],[data-id]");
    if (explicit) {
      const raw = explicit.getAttribute("data-pms128-foreign-open") || explicit.getAttribute("data-pms128-foreign-edit") || explicit.getAttribute("data-pms128-print-employee") || explicit.getAttribute("data-pms128-foreign-delete") || explicit.getAttribute("data-pms125-rec-open") || explicit.getAttribute("data-pms175-open") || explicit.getAttribute("data-pms175-edit") || explicit.getAttribute("data-pms175-print") || explicit.getAttribute("data-id") || "";
      return raw.includes(":") ? raw.split(":").pop() : raw;
    }
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function appendButton(host, label, attr, id, cls){
    if (!host || host.querySelector("[" + attr + '="' + cssEscape(id) + '"]')) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = cls || "inline-button";
    button.textContent = label;
    button.setAttribute(attr, id);
    host.appendChild(button);
  }
  function decorateArchive(){
    const page = window.current && current.page || "";
    const content = document.getElementById("content");
    if (!content || !["foreignEmployees","foreignRecruiting","humanResources"].includes(page)) return;
    if (!document.getElementById("pms177-foreign-drag-panel")) {
      const records = arr(st().foreignEmployees).filter(record => recordId(record)).slice(0, 60);
      content.insertAdjacentHTML("afterbegin", '<div id="pms177-foreign-drag-panel" class="pms177-panel"><div><strong>Candidati extra UE trascinabili</strong><small>Trascina il candidato nel calendario oppure apri la scheda lavoro per foto, passaporto e privacy bilingue.</small></div><button type="button" class="secondary-button" data-pms177-open-calendar>Apri calendario</button><div class="pms177-strip">' + records.map(record => candidateCard(record, false)).join("") + '</div></div>');
    }
    content.querySelectorAll("table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || !findForeign(id)) return;
      row.setAttribute("draggable", "true");
      row.setAttribute("data-pms177-foreign-row", id);
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell) return;
      let host = cell.querySelector(".pms177-actions,.pms128-row-actions,.pms175-row-actions") || cell.querySelector("div");
      if (!host) {
        host = document.createElement("div");
        host.className = "pms177-actions";
        cell.appendChild(host);
      }
      appendButton(host, "Apri scheda lavoro", "data-pms177-work", id);
      appendButton(host, "Modifica", "data-pms177-edit", id);
      appendButton(host, "Stampa", "data-pms177-print", id);
      appendButton(host, "Calendario", "data-pms177-schedule", id);
      appendButton(host, "Elimina", "data-pms177-delete", id, "inline-button pms177-danger");
    });
  }
  function enhanceWorkspaceDrops(){
    document.querySelectorAll(".pms176-slot").forEach(slot => {
      if (slot.dataset.pms177SlotBound === "1") return;
      slot.dataset.pms177SlotBound = "1";
      slot.addEventListener("dragover", event => {
        if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("application/x-pms177-foreign")) event.preventDefault();
      });
      slot.addEventListener("drop", event => {
        const sourceId = event.dataTransfer && event.dataTransfer.getData("application/x-pms177-foreign");
        if (!sourceId) return;
        event.preventDefault();
        event.stopPropagation();
        const workspace = slot.closest(".pms176-workspace");
        const targetId = workspace && workspace.getAttribute("data-pms176-record");
        const target = findForeign(targetId);
        const source = findForeign(sourceId);
        if (!target || !source) return;
        target.pms176DocSlots = target.pms176DocSlots || {};
        const key = slot.getAttribute("data-pms176-slot") || "other";
        if (!Array.isArray(target.pms176DocSlots[key])) target.pms176DocSlots[key] = [];
        target.pms176DocSlots[key].push({_pms176Id:"LINK-" + sourceId + "-" + Date.now(), name:"Scheda candidato - " + title(source), type:"text/plain", size:0, dataUrl:"", uploadedAt:today(), linkedCandidate:sourceId});
        target.pms176DocData = target.pms176DocData || {};
        target.pms176DocData.fullName = target.pms176DocData.fullName || source.fullName || source.name || "";
        target.pms176DocData.nationality = target.pms176DocData.nationality || source.nationality || "";
        target.pms176DocData.role = target.pms176DocData.role || source.role || "";
        target.pms176DocData.phone = target.pms176DocData.phone || source.phone || source.whatsapp || "";
        target.pms176DocData.email = target.pms176DocData.email || source.email || "";
        writeForeign(target);
        if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(targetId);
      }, true);
    });
  }
  function bindActions(){
    document.querySelectorAll("[data-pms177-foreign],[data-pms177-foreign-row]").forEach(node => {
      if (node.dataset.pms177DragBound === "1") return;
      node.dataset.pms177DragBound = "1";
      node.addEventListener("dragstart", event => {
        const id = node.getAttribute("data-pms177-foreign") || node.getAttribute("data-pms177-foreign-row");
        event.dataTransfer.setData("application/x-pms177-foreign", id);
        event.dataTransfer.setData("text/plain", title(findForeign(id) || {id}));
        event.dataTransfer.effectAllowed = "move";
      });
    });
    document.querySelectorAll("[data-pms177-work]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); openWorkspace(button.getAttribute("data-pms177-work")); });
    document.querySelectorAll("[data-pms177-edit]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); editForeign(button.getAttribute("data-pms177-edit")); });
    document.querySelectorAll("[data-pms177-print]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); printForeign(button.getAttribute("data-pms177-print")); });
    document.querySelectorAll("[data-pms177-print-appt]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); printAppointment(button.getAttribute("data-pms177-print-appt")); });
    document.querySelectorAll("[data-pms177-delete]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); deleteForeign(button.getAttribute("data-pms177-delete")); });
    document.querySelectorAll("[data-pms177-clear-appt]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); clearAppointment(button.getAttribute("data-pms177-clear-appt")); });
    document.querySelectorAll("[data-pms177-schedule]").forEach(button => button.onclick = event => {
      event.preventDefault();
      event.stopPropagation();
      const id = button.getAttribute("data-pms177-schedule");
      const record = findForeign(id);
      if (!record) return;
      const value = prompt("Data appuntamento calendario (AAAA-MM-GG)", scheduleDate(record) || today());
      if (value != null && setAppointment(id, value.trim())) {
        if (typeof render === "function") render();
      }
    });
    document.querySelectorAll("[data-pms177-open-calendar]").forEach(button => button.onclick = () => { if (window.current) current.page = "operativo"; if (typeof render === "function") render(); });
  }
  function interceptOldArchiveActions(event){
    const target = event.target && event.target.closest("[data-pms128-foreign-open],[data-pms128-foreign-edit],[data-pms128-print-employee],[data-pms128-print-internal],[data-pms128-foreign-delete],[data-pms125-rec-open]");
    if (!target) return;
    const id = target.getAttribute("data-pms128-foreign-open") || target.getAttribute("data-pms128-foreign-edit") || target.getAttribute("data-pms128-print-employee") || target.getAttribute("data-pms128-print-internal") || target.getAttribute("data-pms128-foreign-delete") || target.getAttribute("data-pms125-rec-open");
    if (!id || !findForeign(id)) return;
    event.preventDefault();
    event.stopPropagation();
    if (target.hasAttribute("data-pms128-foreign-delete")) return deleteForeign(id);
    if (target.hasAttribute("data-pms128-print-employee") || target.hasAttribute("data-pms128-print-internal")) return printForeign(id);
    if (target.hasAttribute("data-pms128-foreign-edit")) return editForeign(id);
    return openWorkspace(id);
  }
  function enforceMenuText(){
    const banner = document.getElementById("pms170-top-globe");
    if (!banner) return;
    banner.classList.add("pms177-brand-glow");
    let name = banner.querySelector(".pms170-lit-name");
    if (!name) {
      name = document.createElement("div");
      name.className = "pms170-lit-name";
      banner.appendChild(name);
    }
    name.textContent = "Parmitalia Distribution";
    name.style.display = "block";
    name.removeAttribute("aria-hidden");
    let payoff = banner.querySelector(".pms170-payoff");
    if (!payoff) {
      payoff = document.createElement("div");
      payoff.className = "pms170-payoff";
      banner.appendChild(payoff);
    }
    payoff.textContent = "Qualita che nasce dal latte";
    payoff.style.display = "block";
    payoff.style.visibility = "visible";
    payoff.removeAttribute("aria-hidden");
  }
  function replaceQrInDom(root){
    (root || document).querySelectorAll("[class*='qr'],[id*='qr'],svg.qr,canvas.qr").forEach(node => {
      if (node.classList && (node.classList.contains("pms177-qr-replaced") || node.classList.contains("pms177-barcode"))) return;
      if (node.closest(".pms177-barcode,.pms177-qr-replaced")) return;
      const text = clean(node.textContent || node.getAttribute("data-code") || node.getAttribute("aria-label") || "PARMITALIA");
      const wrap = document.createElement("div");
      wrap.className = "pms177-qr-replaced";
      wrap.innerHTML = barcode(text);
      node.replaceWith(wrap);
    });
  }
  function ensureBarcodeInPrintHtml(html){
    if (/barcode-svg|pms177-barcode/i.test(html)) return html;
    const codeMatch = html.match(/\b([A-Z]{2,8}[-/][0-9A-Z-]{3,})\b/);
    const code = codeMatch ? codeMatch[1] : "PARMITALIA-" + today();
    const insert = '<div class="pms177-auto-barcode"><strong>Codice automatico</strong>' + barcode(code) + '</div>';
    return html.replace(/(<\/div>\s*)$/i, insert + "$1");
  }
  function wrapPrinting(){
    if (!window.__pms177PrintWrapped && typeof openPrint === "function") {
      const base = openPrint;
      window.__pms177PrintWrapped = true;
      openPrint = function(html){
        injectCss();
        html = ensureBarcodeInPrintHtml(String(html || ""));
        html = html.replace(/QR\s*(interno|code|archivio)?/gi, "codice a barre");
        const result = base.call(this, html);
        setTimeout(() => replaceQrInDom(document.getElementById("print-root") || document), 80);
        return result;
      };
      try { window.openPrint = openPrint; } catch(error) {}
    }
    if (!window.__pms177QrWrapped) {
      const baseBarcode = typeof renderBarcode === "function" ? renderBarcode : null;
      window.renderQrLite = function(code){ return baseBarcode ? baseBarcode(code) : barcode(code); };
      window.__pms177QrWrapped = true;
    }
  }
  function injectCss(){
    let style = document.getElementById("pms-v177-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v177-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      #pms170-top-globe.pms177-brand-glow{min-height:132px!important;max-height:132px!important;grid-template-rows:70px 25px 22px!important;overflow:hidden!important}
      #pms170-top-globe.pms177-brand-glow .pms170-lit-name{display:block!important;visibility:visible!important;grid-row:2!important;color:#f8fff6!important;background:linear-gradient(90deg,#0d6f62,#643b71)!important;border-radius:8px!important;padding:6px 12px!important;font-size:12px!important;font-weight:950!important;line-height:1!important;text-align:center!important;text-shadow:0 0 8px rgba(255,255,255,.85),0 0 12px rgba(80,202,152,.75)!important;box-shadow:0 0 18px rgba(95,143,109,.28)!important}
      #pms170-top-globe.pms177-brand-glow .pms170-payoff{display:block!important;visibility:visible!important;grid-row:3!important;color:#376f52!important;background:rgba(255,255,255,.92)!important;border:1px solid rgba(95,143,109,.24)!important;border-radius:999px!important;padding:4px 10px!important;font-size:10px!important;font-weight:950!important;line-height:1!important;text-align:center!important;text-shadow:0 0 10px rgba(255,255,255,.9)!important;box-shadow:0 0 16px rgba(255,255,255,.82)!important;white-space:nowrap!important}
      .pms177-panel{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:12px;margin:0 0 12px}
      .pms177-panel strong{display:block;color:#0f172a}.pms177-panel small{display:block;color:#64748b;margin-top:3px}
      .pms177-strip{grid-column:1/-1;display:flex;gap:8px;overflow:auto;padding-top:4px}
      .pms177-foreign-card{display:grid;gap:6px;min-width:205px;background:#fff;border:1px solid #d7dee8;border-left:4px solid #376f52;border-radius:8px;padding:8px;cursor:grab;box-shadow:0 2px 8px rgba(15,23,42,.04)}
      .pms177-foreign-card div:first-child{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.pms177-foreign-card strong{font-size:11px;color:#17242b;line-height:1.18}.pms177-foreign-card span{font-size:9px;font-weight:900;color:#376f52;background:#eef7f0;border-radius:999px;padding:2px 6px;white-space:nowrap}.pms177-foreign-card small{font-size:10px;color:#64748b;line-height:1.2}
      .pms177-card-actions,.pms177-actions{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.pms177-card-actions button,.pms177-actions button{width:auto!important;margin:0!important;padding:4px 7px!important;font-size:10px!important}
      .pms177-danger{border-color:#dc2626!important;color:#991b1b!important;background:#fff5f5!important}
      .pms177-qr-replaced,.pms177-auto-barcode{display:grid;justify-items:center;gap:3px;margin:4mm 0}.pms177-barcode{background:#fff;border:1px solid #d8dee5;border-radius:6px;padding:3px;max-width:72mm;height:auto}
      @media print{
        @page{size:A4 portrait;margin:7mm}
        html,body{width:210mm!important;min-height:0!important;height:auto!important;overflow:visible!important;background:#fff!important}
        #print-root{width:196mm!important;max-width:196mm!important;margin:0!important;padding:0!important;overflow:visible!important;box-sizing:border-box!important}
        #print-root .print-document,#print-root .pms177-print-doc{width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;box-sizing:border-box!important;overflow:visible!important;break-after:avoid!important;page-break-after:avoid!important;font-size:8.2pt!important;line-height:1.16!important}
        #print-root .print-header{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(42mm,68mm)!important;gap:5mm!important;align-items:start!important;margin:0 0 2mm!important;padding:0 0 2mm!important}
        #print-root .print-header h1{font-size:14pt!important;line-height:1.05!important;margin:0!important;overflow-wrap:anywhere!important}
        #print-root .print-meta{font-size:7.5pt!important;text-align:right!important;overflow-wrap:anywhere!important}
        #print-root table,#print-root .print-table{width:100%!important;max-width:100%!important;table-layout:fixed!important;border-collapse:collapse!important;margin:1.8mm 0!important}
        #print-root th,#print-root td,#print-root .print-table th,#print-root .print-table td{max-width:0!important;padding:1.15mm!important;font-size:7.2pt!important;line-height:1.12!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:break-word!important;vertical-align:top!important}
        #print-root .barcode-svg,#print-root .pms177-barcode{max-width:62mm!important;width:100%!important;height:auto!important}
        #print-root .print-footer{position:static!important;margin-top:2mm!important;padding-top:1mm!important;font-size:6.8pt!important}
        #print-root [class*="qr"],#print-root [id*="qr"]{display:none!important}
      }
      @media(max-width:760px){.pms177-panel{grid-template-columns:1fr}.pms177-strip{display:grid;grid-template-columns:1fr}.pms177-foreign-card{min-width:0}}
    `;
  }
  function decorate(){
    st();
    injectCss();
    wrapPrinting();
    enforceMenuText();
    decorateArchive();
    decorateCalendar();
    enhanceWorkspaceDrops();
    bindActions();
    replaceQrInDom(document.getElementById("print-root") || document.querySelector(".pms96-print-stage"));
  }

  document.addEventListener("click", interceptOldArchiveActions, true);
  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms177Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 80);
      setTimeout(decorate, 260);
      return result;
    };
    window.render.__pms177Wrapped = true;
  }
  [120, 400, 900, 1600].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 1200);
  window.PMS_V177_FOREIGN_CALENDAR_ARCHIVE_PRINT_BARCODE_FIX = {version:VERSION, openWorkspace, printForeign, printAppointment, clearAppointment};
})();
