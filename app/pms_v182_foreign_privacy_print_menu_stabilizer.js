(function(){
  "use strict";

  const VERSION = "pms_v182_foreign_privacy_print_menu_stabilizer";
  const FOREIGN_PAGES = ["foreignEmployees", "foreignRecruiting", "humanResources"];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function st(){
    window.state = window.state || {};
    if (!Array.isArray(state.foreignEmployees)) state.foreignEmployees = [];
    if (!Array.isArray(state.foreignRecruiting)) state.foreignRecruiting = [];
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v182-foreign-privacy");
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function recordId(record){
    return String(record && (record.id || record.code || record.protocol || record.practiceCode || record.uid) || "");
  }
  function title(record){
    return clean(record && (record.fullName || record.name || record.title || record.email || recordId(record))) || "Candidato estero";
  }
  function findForeign(id){
    const value = String(id || "");
    if (!value) return null;
    return arr(st().foreignEmployees).find(item => recordId(item) === value) ||
      arr(st().foreignRecruiting).find(item => recordId(item) === value) ||
      null;
  }
  function writeForeign(record){
    if (!record) return;
    const id = recordId(record);
    if (!id) return;
    ["foreignEmployees", "foreignRecruiting"].forEach(key => {
      const list = arr(st()[key]);
      const index = list.findIndex(item => recordId(item) === id);
      if (index >= 0) list[index] = record;
      else if (key === "foreignEmployees") list.unshift(record);
      state[key] = list;
    });
    record.updatedAt = new Date().toISOString();
    saveNow();
  }
  function cssEscape(value){
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }
  function collectPrivacyForm(record){
    if (!record) return;
    const id = recordId(record);
    const form = document.querySelector('[data-pms176-form="' + cssEscape(id) + '"]');
    record.pms176DocData = record.pms176DocData && typeof record.pms176DocData === "object" ? record.pms176DocData : {};
    if (form) {
      Array.from(form.elements || []).forEach(el => {
        if (el.name) record.pms176DocData[el.name] = el.value;
      });
    }
    const data = record.pms176DocData;
    record.fullName = data.fullName || record.fullName || record.name || "";
    record.nationality = data.nationality || record.nationality || "";
    record.role = data.role || record.role || "";
    record.phone = data.phone || record.phone || record.whatsapp || "";
    record.whatsapp = record.phone || record.whatsapp || "";
    record.email = data.email || record.email || "";
    record.passportNumber = data.passportNumber || record.passportNumber || "";
    if (!data.privacyItalian) {
      data.privacyItalian = "Il candidato autorizza Parmitalia al trattamento dei dati personali e dei documenti forniti per finalita di recruiting, selezione, verifica documentale e gestione della pratica lavorativa.";
    }
    if (!data.privacyRomanian) {
      data.privacyRomanian = "Candidatul autorizeaza Parmitalia sa prelucreze datele personale si documentele furnizate pentru recrutare, selectie, verificare documente si gestionarea dosarului de munca.";
    }
    if (!data.privacyArabic) {
      data.privacyArabic = "The candidate authorizes Parmitalia to process personal data and documents supplied for recruiting, selection, document verification and work file management.";
    }
    writeForeign(record);
  }
  function slotFiles(record, key){
    const slots = record && record.pms176DocSlots || {};
    return arr(slots[key]).map(file => clean(file && (file.name || file.fileName || file._pms176Id))).filter(Boolean);
  }
  function photoSrc(record){
    const slots = record && record.pms176DocSlots || {};
    const photo = arr(slots.photoPassport).find(file => /^data:image\//.test(file && file.dataUrl || "") || String(file && file.type || "").startsWith("image/"));
    if (photo && photo.dataUrl) return photo.dataUrl;
    if (record && record.photo && record.photo.dataUrl) return record.photo.dataUrl;
    return "";
  }
  function barcode(code){
    if (typeof window.renderBarcode === "function") return window.renderBarcode(code);
    const text = clean(code || "PARMITALIA-" + today()) || "PARMITALIA";
    let x = 10;
    const bars = String(text).split("").map((ch, index) => {
      const n = ch.charCodeAt(0) + index * 13;
      const w = 1 + (n % 3);
      const h = 34 + (n % 24);
      const out = '<rect x="' + x + '" y="' + (64 - h) + '" width="' + w + '" height="' + h + '" fill="#111"/>';
      x += w + 2;
      return out;
    }).join("");
    const width = Math.max(170, x + 10);
    return '<svg class="barcode-svg pms182-barcode" width="' + width + '" height="84" viewBox="0 0 ' + width + ' 84" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#fff"/>' + bars + '<text x="' + (width / 2) + '" y="78" text-anchor="middle" font-family="Consolas,monospace" font-size="10">' + esc(text) + '</text></svg>';
  }
  function privacyHtml(record, format){
    collectPrivacyForm(record);
    const data = record.pms176DocData || {};
    const id = recordId(record);
    const photo = photoSrc(record);
    const pass = slotFiles(record, "passport");
    const privacy = slotFiles(record, "bilingualPrivacy");
    const fmt = format || "a4";
    const rows = [
      ["Nome e cognome", data.fullName || record.fullName || record.name],
      ["Nazionalita", data.nationality || record.nationality],
      ["Paese / citta", data.countryCity || [record.country, record.city].filter(Boolean).join(" ")],
      ["Ruolo", data.role || record.role],
      ["Telefono", data.phone || record.phone || record.whatsapp],
      ["Email", data.email || record.email],
      ["Numero passaporto", data.passportNumber || record.passportNumber],
      ["Date passaporto", data.passportDates],
      ["File passaporto", pass.join(", ") || "-"],
      ["Privacy caricata", privacy.join(", ") || "-"]
    ];
    return '<div class="print-document pms182-privacy-doc pms182-format-' + esc(fmt) + '">' +
      '<header class="pms182-doc-head"><div><h1>Privacy RO / AR - Foto passaporto</h1><strong>Parmitalia Distribution</strong><small>Documento candidato estero generato dal gestionale</small></div><div class="pms182-code">' + esc(today()) + '<br>' + barcode(id) + '</div></header>' +
      '<section class="pms182-doc-main"><div class="pms182-doc-photo">' + (photo ? '<img src="' + esc(photo) + '" alt="Foto passaporto">' : '<span>Foto passaporto</span>') + '</div><table class="print-table"><tbody>' + rows.map(row => '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>').join("") + '</tbody></table></section>' +
      '<section class="pms182-privacy-block"><h2>Informativa privacy - Italiano</h2><p>' + esc(data.privacyItalian || "") + '</p></section>' +
      '<section class="pms182-privacy-block"><h2>Confidentialitate - Romana</h2><p>' + esc(data.privacyRomanian || "") + '</p></section>' +
      '<section class="pms182-privacy-block pms182-ar"><h2>Privacy - AR</h2><p>' + esc(data.privacyArabic || "") + '</p></section>' +
      '<section class="pms182-privacy-block"><h2>Note documento</h2><p>' + esc(data.documentNotes || record.notes || "") + '</p></section>' +
      '<footer class="pms182-sign"><div>Firma candidato</div><div>Firma Parmitalia</div></footer>' +
    '</div>';
  }
  function setPrintFormat(format){
    let style = document.getElementById("pms-v182-page-format-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v182-page-format-style";
      document.head.appendChild(style);
    }
    const size = format === "letter" ? "Letter portrait" : (format === "a5" ? "A5 portrait" : "A4 portrait");
    const width = format === "letter" ? "196mm" : (format === "a5" ? "132mm" : "194mm");
    style.textContent = '@page{size:' + size + ';margin:8mm}@media print{#print-root .print-document{width:' + width + '!important;max-width:' + width + '!important}}';
  }
  function printHtml(html, format){
    setPrintFormat(format || "a4");
    const existing = document.getElementById("print-root");
    if (existing) existing.remove();
    const root = document.createElement("div");
    root.id = "print-root";
    root.innerHTML = html;
    document.body.appendChild(root);
    const cleanup = () => {
      const node = document.getElementById("print-root");
      if (node) node.remove();
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(() => {
      window.print();
      setTimeout(cleanup, 2500);
    }, 80);
  }
  function downloadHtml(filename, html){
    const blob = new Blob(['<!doctype html><html><head><meta charset="utf-8"><title>' + esc(filename) + '</title><style>' + document.getElementById("pms-v182-style").textContent + '</style></head><body>' + html + '</body></html>'], {type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/[^\w.-]+/g, "_") + ".html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }
  function openPrivacyPreview(id){
    const record = findForeign(id);
    if (!record) return alert("Scheda estero non trovata: " + id);
    collectPrivacyForm(record);
    document.querySelectorAll(".pms182-modal-backdrop").forEach(node => node.remove());
    const wrap = document.createElement("div");
    wrap.className = "pms182-modal-backdrop";
    wrap.innerHTML = '<div class="pms182-modal"><div class="pms182-modal-head"><h3>Privacy RO / AR - ' + esc(title(record)) + '</h3><button type="button" class="secondary-button" data-pms182-close>Chiudi</button></div><div class="pms182-print-toolbar"><label>Formato<select data-pms182-format><option value="a4">A4 PDF</option><option value="a5">A5</option><option value="letter">Letter</option></select></label><button type="button" class="primary-button" data-pms182-print-privacy="' + esc(id) + '">Stampa / salva PDF</button><button type="button" class="secondary-button" data-pms182-download-privacy="' + esc(id) + '">Scarica HTML</button></div><div class="pms182-preview"></div></div>';
    document.body.appendChild(wrap);
    const preview = wrap.querySelector(".pms182-preview");
    const select = wrap.querySelector("[data-pms182-format]");
    const refresh = () => { preview.innerHTML = privacyHtml(record, select.value); };
    refresh();
    select.onchange = refresh;
    wrap.addEventListener("click", event => {
      if (event.target === wrap || event.target.closest("[data-pms182-close]")) wrap.remove();
      const printBtn = event.target.closest("[data-pms182-print-privacy]");
      if (printBtn) {
        event.preventDefault();
        printHtml(privacyHtml(record, select.value), select.value);
      }
      const downBtn = event.target.closest("[data-pms182-download-privacy]");
      if (downBtn) {
        event.preventDefault();
        downloadHtml("privacy-" + id, privacyHtml(record, select.value));
      }
    });
  }
  function exportExcel(id){
    const record = findForeign(id);
    if (!record) return;
    collectPrivacyForm(record);
    const keys = Array.from(new Set(Object.keys(record).concat(Object.keys(record.pms176DocData || {}))));
    const html = '<html><head><meta charset="utf-8"></head><body><table><tbody>' + keys.map(key => '<tr><th>' + esc(key) + '</th><td>' + esc(typeof record[key] === "object" ? JSON.stringify(record[key]) : (record[key] != null ? record[key] : (record.pms176DocData || {})[key] || "")) + '</td></tr>').join("") + '</tbody></table></body></html>';
    const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = ("scheda-estero-" + id + ".xls").replace(/[^\w.-]+/g, "_");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function deleteForeign(id){
    const record = findForeign(id);
    if (!record) return alert("Scheda non trovata: " + id);
    if (!confirm("Eliminare definitivamente la scheda di " + title(record) + "?")) return;
    state.foreignEmployees = arr(st().foreignEmployees).filter(item => recordId(item) !== String(id));
    state.foreignRecruiting = arr(st().foreignRecruiting).filter(item => recordId(item) !== String(id));
    saveNow();
    document.querySelectorAll(".pms176-modal-backdrop,.pms179-modal-backdrop,.pms182-modal-backdrop").forEach(node => node.remove());
    if (typeof render === "function") render();
  }
  function scheduleForeign(id){
    const record = findForeign(id);
    if (!record) return;
    const value = prompt("Data appuntamento calendario (AAAA-MM-GG)", String(record.scheduledDate || record.calendarDate || record.appointmentDate || today()).slice(0, 10));
    if (value == null) return;
    const date = value.trim();
    record.scheduledDate = date;
    record.calendarDate = date;
    record.appointmentDate = date;
    record.operationalDate = date;
    record.practiceStatus = date ? "Appuntamento programmato" : (record.practiceStatus || "Pratica aperta");
    writeForeign(record);
    if (typeof render === "function") render();
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector("[data-pms182-id],[data-pms177-work],[data-pms177-delete],[data-pms128-foreign-open],[data-pms128-foreign-edit],[data-pms128-foreign-delete],[data-pms175-open],[data-id]");
    if (explicit) {
      const attrs = ["data-pms182-id","data-pms177-work","data-pms177-delete","data-pms128-foreign-open","data-pms128-foreign-edit","data-pms128-foreign-delete","data-pms175-open","data-id"];
      for (const attr of attrs) {
        const raw = explicit.getAttribute(attr);
        if (raw) return raw.includes(":") ? raw.split(":").pop() : raw;
      }
    }
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function actionHtml(id){
    return '<div class="pms182-actions" data-pms182-id="' + esc(id) + '">' +
      '<button type="button" data-pms182-action="open" data-pms182-id="' + esc(id) + '">Apri</button>' +
      '<button type="button" data-pms182-action="edit" data-pms182-id="' + esc(id) + '">Modifica</button>' +
      '<button type="button" data-pms182-action="print" data-pms182-id="' + esc(id) + '">Stampa</button>' +
      '<button type="button" data-pms182-action="privacy" data-pms182-id="' + esc(id) + '">Privacy RO/AR</button>' +
      '<button type="button" data-pms182-action="excel" data-pms182-id="' + esc(id) + '">Excel</button>' +
      '<button type="button" data-pms182-action="calendar" data-pms182-id="' + esc(id) + '">Calendario</button>' +
      '<button type="button" class="pms182-danger" data-pms182-action="delete" data-pms182-id="' + esc(id) + '">Elimina</button>' +
    '</div>';
  }
  function decorateArchiveActions(){
    const page = window.current && current.page || "";
    if (!FOREIGN_PAGES.includes(page)) return;
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || !findForeign(id)) return;
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell) return;
      const current = cell.querySelector(".pms182-actions");
      if (!current || current.getAttribute("data-pms182-id") !== id) {
        cell.insertAdjacentHTML("afterbegin", actionHtml(id));
      }
      cell.querySelectorAll(".pms182-actions").forEach((node, index) => {
        if (index > 0) node.remove();
      });
      cell.querySelectorAll("button:not([data-pms182-action])").forEach(button => {
        button.setAttribute("aria-hidden", "true");
        button.style.setProperty("display", "none", "important");
        button.style.setProperty("visibility", "hidden", "important");
      }
      );
      row.setAttribute("draggable", "true");
      row.setAttribute("data-pms177-foreign-row", id);
    });
  }
  function decorateWorkspaceButtons(){
    document.querySelectorAll(".pms176-workspace").forEach(workspace => {
      const id = workspace.getAttribute("data-pms176-record");
      if (!id) return;
      const old = workspace.querySelector("[data-pms176-print-doc]");
      if (old) {
        old.textContent = "Genera privacy RO/AR";
        old.setAttribute("data-pms182-privacy", id);
      }
      const actions = workspace.querySelector(".pms176-actions");
      if (actions && !actions.querySelector('[data-pms182-privacy="' + cssEscape(id) + '"]')) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "secondary-button";
        button.textContent = "Genera privacy RO/AR";
        button.setAttribute("data-pms182-privacy", id);
        actions.appendChild(button);
      }
    });
  }
  function openWorkspace(id){
    if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(id);
      setTimeout(decorateWorkspaceButtons, 120);
      return;
    }
    openPrivacyPreview(id);
  }
  function printForeign(id){
    const record = findForeign(id);
    if (!record) return;
    const rows = [
      ["ID", recordId(record)],["Nome", title(record)],["Paese", record.country],["Citta", record.city],
      ["Nazionalita", record.nationality],["Ruolo", record.role],["Telefono", record.phone || record.whatsapp],
      ["Email", record.email],["Stato", record.status],["Stato pratica", record.practiceStatus],["Note", record.notes]
    ];
    const html = '<div class="print-document pms182-simple-print"><div class="print-header"><div><h1>Scheda candidato estero</h1><strong>' + esc(title(record)) + '</strong></div><div class="print-meta">' + esc(recordId(record)) + '<br>' + barcode(recordId(record)) + '</div></div><table class="print-table"><tbody>' + rows.map(row => '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>').join("") + '</tbody></table><div class="print-footer">Scheda candidato estero - codice automatico e codice a barre</div></div>';
    printHtml(html, "a4");
  }
  function handleAction(action, id){
    if (action === "open" || action === "edit") openWorkspace(id);
    else if (action === "print") printForeign(id);
    else if (action === "privacy") openPrivacyPreview(id);
    else if (action === "excel") exportExcel(id);
    else if (action === "calendar") scheduleForeign(id);
    else if (action === "delete") deleteForeign(id);
  }
  function handleClick(event){
    const privacy = event.target && event.target.closest && event.target.closest("[data-pms182-privacy],[data-pms176-print-doc]");
    if (privacy) {
      const id = privacy.getAttribute("data-pms182-privacy") || privacy.getAttribute("data-pms176-print-doc");
      if (id && findForeign(id)) {
        event.preventDefault();
        event.stopPropagation();
        if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
        openPrivacyPreview(id);
        return;
      }
    }
    const button = event.target && event.target.closest && event.target.closest("[data-pms182-action]");
    if (!button) return;
    const id = button.getAttribute("data-pms182-id");
    if (!id || !findForeign(id)) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    handleAction(button.getAttribute("data-pms182-action"), id);
  }
  function removeDuplicateSidebarLogos(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    Array.from(sidebar.children).forEach(node => {
      if (node.id === "pms170-top-globe" || node.id === "pms143-menu" || node.id === "nav" || node.classList.contains("sidebar-footer")) return;
      node.setAttribute("data-pms182-remove-sidebar-extra", "1");
      node.style.setProperty("display", "none", "important");
    });
    sidebar.querySelectorAll(".pms106-hub,.pms109-hub,#pms109-hub,.pms109-world,.pms113-led-sign,#pms144-world-banner,.pms144-world-banner,.pms150-sign,.sidebar-brand").forEach(node => {
      if (!node.closest("#pms170-top-globe")) {
        node.setAttribute("data-pms182-remove-sidebar-extra", "1");
        node.style.setProperty("display", "none", "important");
      }
    });
  }
  function installMenuObserver(){
    if (window.__pms182MenuObserver) return;
    window.__pms182MenuObserver = true;
    const observer = new MutationObserver(() => removeDuplicateSidebarLogos());
    observer.observe(document.body, {childList:true, subtree:true});
  }
  function injectCss(){
    let style = document.getElementById("pms-v182-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v182-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body.pms166-restore-sidebar .sidebar{gap:6px!important;padding-top:10px!important}
      body.pms166-restore-sidebar .sidebar > :not(#pms170-top-globe):not(#pms143-menu):not(#nav):not(.sidebar-footer),
      .sidebar > [data-pms182-remove-sidebar-extra="1"],
      .sidebar .sidebar-brand,.sidebar .pms106-hub,.sidebar .pms109-hub,.sidebar #pms109-hub,.sidebar .pms113-led-sign,.sidebar #pms144-world-banner,.sidebar .pms144-world-banner,.sidebar .pms150-sign{
        display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important
      }
      #pms170-top-globe.pms181-only-top-logo{margin:0!important;min-height:138px!important;max-height:138px!important}
      body.pms166-restore-sidebar #pms143-menu,body.pms166-restore-sidebar #nav{margin-top:0!important;padding-top:0!important;flex:1 1 auto!important;min-height:0!important}
      .pms182-actions{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
      .pms182-actions button{width:auto!important;margin:0!important;padding:5px 7px!important;border:1px solid #cbd5e1!important;border-radius:7px!important;background:#fff!important;color:#17242b!important;font-size:10.5px!important;font-weight:850!important;line-height:1!important}
      .pms182-actions .pms182-danger{border-color:#dc2626!important;color:#991b1b!important;background:#fff5f5!important}
      .pms182-modal-backdrop{position:fixed;inset:0;z-index:39000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}
      .pms182-modal{width:min(1120px,96vw);max-height:94vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;box-shadow:0 24px 80px rgba(15,23,42,.35);padding:14px}
      .pms182-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.pms182-modal-head h3{margin:0;color:#0f172a}
      .pms182-print-toolbar{display:flex;flex-wrap:wrap;gap:8px;align-items:end;margin-bottom:12px;padding:10px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc}
      .pms182-print-toolbar label{display:grid;gap:4px;font-size:11px;font-weight:900;color:#475569}.pms182-print-toolbar select{min-width:120px}
      .pms182-preview{background:#eef2f7;padding:14px;border-radius:8px;overflow:auto}
      .pms182-privacy-doc,.pms182-simple-print{width:194mm;max-width:100%;min-height:277mm;margin:0 auto;background:#fff;color:#111827;font-family:Arial,Helvetica,sans-serif;font-size:9pt;line-height:1.24;box-sizing:border-box;padding:8mm;border:1px solid #e5e7eb}
      .pms182-format-a5{width:132mm;min-height:190mm}.pms182-format-letter{width:196mm;min-height:254mm}
      .pms182-doc-head,.pms182-privacy-doc .print-header,.pms182-simple-print .print-header{display:grid;grid-template-columns:minmax(0,1fr) 68mm;gap:6mm;align-items:start;border-bottom:1.2pt solid #1f2937;padding-bottom:4mm;margin-bottom:4mm}
      .pms182-doc-head h1,.pms182-simple-print h1{font-size:16pt;line-height:1.05;margin:0 0 1mm;color:#0f172a}.pms182-doc-head strong{display:block}.pms182-doc-head small{display:block;color:#64748b;margin-top:1mm}
      .pms182-code,.pms182-simple-print .print-meta{text-align:right;font-size:8pt;overflow:hidden}.pms182-code svg,.pms182-simple-print svg{max-width:62mm;height:auto}
      .pms182-doc-main{display:grid;grid-template-columns:38mm minmax(0,1fr);gap:4mm;align-items:start}.pms182-doc-photo{height:48mm;border:1px solid #94a3b8;display:grid;place-items:center;text-align:center;color:#64748b;overflow:hidden}.pms182-doc-photo img{width:100%;height:100%;object-fit:cover}
      .pms182-privacy-doc table,.pms182-simple-print table{width:100%;border-collapse:collapse;table-layout:fixed;margin:0 0 3mm}.pms182-privacy-doc th,.pms182-privacy-doc td,.pms182-simple-print th,.pms182-simple-print td{border:0.7pt solid #cbd5e1;padding:1.3mm;font-size:8pt;line-height:1.14;vertical-align:top;overflow-wrap:anywhere;word-break:break-word}.pms182-privacy-doc th,.pms182-simple-print th{width:32%;background:#f8fafc;color:#334155}
      .pms182-privacy-block{break-inside:avoid;margin-top:3mm}.pms182-privacy-block h2{font-size:10pt;margin:0 0 1.2mm;color:#0f172a}.pms182-privacy-block p{min-height:16mm;border:0.7pt solid #cbd5e1;margin:0;padding:2mm;white-space:pre-wrap;overflow-wrap:anywhere}.pms182-ar{direction:rtl;text-align:right}
      .pms182-sign{display:grid;grid-template-columns:1fr 1fr;gap:12mm;margin-top:7mm}.pms182-sign div{border-top:0.8pt solid #64748b;padding-top:2mm;text-align:center;min-height:14mm}
      @media print{
        html,body{background:#fff!important;overflow:visible!important}
        body *{visibility:hidden!important}
        #print-root,#print-root *{visibility:visible!important}
        #print-root{position:absolute!important;left:0!important;top:0!important;width:100%!important;margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important}
        #print-root .print-document{border:0!important;box-shadow:none!important;margin:0 auto!important;padding:0!important;min-height:0!important;height:auto!important;break-after:avoid!important;page-break-after:avoid!important}
        #print-root table,#print-root .print-table{table-layout:fixed!important;width:100%!important;max-width:100%!important}
        #print-root tr{break-inside:avoid!important;page-break-inside:avoid!important}
        #print-root img,#print-root svg,#print-root canvas{max-width:100%!important;height:auto!important;break-inside:avoid!important}
        #print-root [class*="qr"],#print-root [id*="qr"]{display:none!important}
      }
      @media(max-width:760px){.pms182-doc-main,.pms182-doc-head,.pms182-simple-print .print-header{grid-template-columns:1fr}.pms182-code,.pms182-simple-print .print-meta{text-align:left}.pms182-privacy-doc{width:100%;padding:5mm}.pms182-actions button{font-size:10px!important}}
    `;
  }
  function decorate(){
    st();
    injectCss();
    installMenuObserver();
    removeDuplicateSidebarLogos();
    decorateArchiveActions();
    decorateWorkspaceButtons();
  }

  document.addEventListener("click", handleClick, true);
  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms182Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 40);
      setTimeout(decorate, 220);
      setTimeout(decorate, 700);
      return result;
    };
    window.render.__pms182Wrapped = true;
  }
  if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE) {
    window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.printDocument = openPrivacyPreview;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
  [80, 240, 700, 1400].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 900);
  window.PMS_V182_FOREIGN_PRIVACY_PRINT_MENU_STABILIZER = {version:VERSION, openPrivacyPreview, printHtml, decorate};
})();
