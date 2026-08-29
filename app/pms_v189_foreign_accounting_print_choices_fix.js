(function(){
  "use strict";

  const VERSION = "pms_v189_foreign_accounting_print_choices_fix";
  const FOREIGN_MODULES = ["foreignEmployees", "foreignRecruiting"];
  const FOREIGN_PAGES = ["foreignEmployees", "foreignRecruiting", "humanResources"];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function norm(value){
    return clean(value).toLowerCase()
      .normalize ? clean(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9@.+-]+/g, " ").trim()
      : clean(value).toLowerCase().replace(/[^a-z0-9@.+-]+/g, " ").trim();
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    FOREIGN_MODULES.forEach(key => { if (!Array.isArray(state[key])) state[key] = []; });
    if (!Array.isArray(state.accountantDocuments)) state.accountantDocuments = [];
    if (!Array.isArray(state.documents)) state.documents = [];
    return state;
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function uid(prefix){
    if (typeof window.uid === "function") return window.uid(prefix);
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v189-foreign-accounting-print");
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
    return clean(record && (record.fullName || record.name || record.title || record.candidateName || record.email || recordId(record))) || "Scheda estero";
  }
  function haystack(record){
    if (!record) return "";
    return norm([
      recordId(record), record.fullName, record.name, record.title, record.candidateName,
      record.email, record.phone, record.whatsapp, record.passportNumber, record.country,
      record.city, record.nationality, record.role, record.status, record.practiceStatus
    ].filter(Boolean).join(" "));
  }
  function ensureForeignIds(){
    st();
    FOREIGN_MODULES.forEach(module => {
      state[module] = arr(state[module]).map(record => {
        if (record && typeof record === "object" && !recordId(record)) record.id = uid("EST");
        return record;
      });
    });
    const byKey = new Map();
    FOREIGN_MODULES.forEach(module => arr(state[module]).forEach(record => {
      if (!record || typeof record !== "object") return;
      const key = recordId(record) || norm(record.email || record.phone || title(record));
      if (!key) return;
      byKey.set(key, Object.assign({}, byKey.get(key) || {}, record));
    }));
    const merged = Array.from(byKey.values()).filter(record => recordId(record));
    if (merged.length) {
      FOREIGN_MODULES.forEach(module => {
        const existing = arr(state[module]);
        const out = existing.map(record => {
          const id = recordId(record);
          return merged.find(item => recordId(item) === id) || record;
        });
        merged.forEach(record => {
          if (!out.some(item => recordId(item) === recordId(record))) out.unshift(record);
        });
        state[module] = out;
      });
    }
  }
  function allForeign(){
    ensureForeignIds();
    const seen = new Set();
    const out = [];
    FOREIGN_MODULES.forEach(module => arr(state[module]).forEach(record => {
      const id = recordId(record);
      if (!id || seen.has(id)) return;
      seen.add(id);
      out.push(record);
    }));
    return out;
  }
  function resolveForeign(value, row){
    ensureForeignIds();
    const raw = clean(String(value || ""));
    const search = norm(raw.includes(":") ? raw.split(":").pop() : raw);
    const rowText = norm(row && (row.innerText || row.textContent || ""));
    const records = allForeign();
    if (search) {
      const exact = records.find(record => [recordId(record), record.code, record.protocol, record.practiceCode, record.uid].some(v => norm(v) === search));
      if (exact) return exact;
      const loose = records.find(record => {
        const h = haystack(record);
        return h && (h === search || h.includes(search) || search.includes(h) || norm(title(record)).includes(search));
      });
      if (loose) return loose;
    }
    if (rowText) {
      return records.find(record => {
        const id = norm(recordId(record));
        const name = norm(title(record));
        const email = norm(record.email || "");
        const phone = norm(record.phone || record.whatsapp || "");
        return (id && rowText.includes(id)) || (name && rowText.includes(name)) || (email && rowText.includes(email)) || (phone && rowText.includes(phone));
      }) || null;
    }
    return null;
  }
  function writeForeign(record){
    if (!record) return;
    if (!recordId(record)) record.id = uid("EST");
    const id = recordId(record);
    record.updatedAt = new Date().toISOString();
    FOREIGN_MODULES.forEach(module => {
      const list = arr(st()[module]);
      const index = list.findIndex(item => recordId(item) === id || (norm(title(item)) && norm(title(item)) === norm(title(record))));
      if (index >= 0) list[index] = Object.assign({}, list[index], record);
      else list.unshift(record);
      state[module] = list;
    });
    saveNow();
  }
  function deleteForeign(record){
    if (!record) return;
    const id = recordId(record);
    if (!confirm("Eliminare definitivamente la scheda di " + title(record) + "?")) return;
    FOREIGN_MODULES.forEach(module => {
      state[module] = arr(st()[module]).filter(item => recordId(item) !== id);
    });
    saveNow();
    if (typeof render === "function") render();
  }
  function openForeign(record){
    if (!record) return alert("Scheda estero non trovata.");
    writeForeign(record);
    const id = recordId(record);
    if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(id);
      return;
    }
    if (window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX && typeof window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX.openRecord === "function") {
      window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX.openRecord("foreignEmployees", id);
      return;
    }
    alert("Scheda estero trovata ma apertura non disponibile. Riavvia il gestionale.");
  }
  function editForeign(record){
    if (!record) return alert("Scheda estero non trovata.");
    writeForeign(record);
    const id = recordId(record);
    if (window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX && typeof window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX.editRecord === "function") {
      window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX.editRecord("foreignEmployees", id);
      return;
    }
    openForeign(record);
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code || "EST");
    return '<div class="pms189-code">' + esc(code || "") + '</div>';
  }
  function printForeign(record){
    if (!record) return alert("Scheda estero non trovata.");
    writeForeign(record);
    const rows = [
      ["ID pratica", recordId(record)],
      ["Nome", title(record)],
      ["Paese / citta", [record.country, record.city].filter(Boolean).join(" ")],
      ["Nazionalita", record.nationality],
      ["Ruolo", record.role],
      ["Telefono", record.phone || record.whatsapp],
      ["Email", record.email],
      ["Passaporto", record.passportNumber],
      ["Stato", record.status],
      ["Stato pratica", record.practiceStatus],
      ["Documenti", record.documentRequests || record.documents || record.skills],
      ["Note", record.notes]
    ];
    const html = '<div class="print-document pms189-foreign-print"><div class="print-header"><div><h1>Scheda candidato estero</h1><strong>' + esc(title(record)) + '</strong></div><div class="print-meta">' + esc(recordId(record)) + '<br>' + barcode(recordId(record)) + '</div></div><table class="print-table"><tbody>' + rows.map(row => '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>').join("") + '</tbody></table><div class="print-footer">Scheda candidato estero - ' + esc(recordId(record)) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function linkAccounting(record){
    if (!record) return alert("Scheda estero non trovata.");
    writeForeign(record);
    const id = recordId(record);
    const docs = arr(st().accountantDocuments);
    let doc = docs.find(item => String(item.linkedCode || item.foreignEmployeeId || item.practiceCode || "") === id || norm(item.fileName || item.title || "") === norm(title(record)));
    if (!doc) {
      doc = {
        id: uid("ACCDOC"),
        period: today().slice(0, 7),
        docType: "Pratica dipendente estero",
        fileName: title(record),
        linkedCode: id,
        foreignEmployeeId: id,
        amount: record.spentAmount || record.toPayAmount || record.cost || 0,
        currency: record.currency || "EUR",
        status: "Da inviare",
        notes: "Pratica estero collegata automaticamente: " + title(record),
        createdAt: new Date().toISOString()
      };
      state.accountantDocuments.unshift(doc);
    } else {
      doc.linkedCode = id;
      doc.foreignEmployeeId = id;
      doc.fileName = doc.fileName || title(record);
      doc.docType = doc.docType || "Pratica dipendente estero";
      doc.updatedAt = new Date().toISOString();
    }
    if (!arr(state.documents).some(item => String(item.linkedCode || "") === id && /estero|dipendente/i.test(String(item.linkedType || item.docType || "")))) {
      state.documents.unshift({
        id: uid("DOC"),
        linkedCode: id,
        linkedType: "Dipendente estero",
        docType: "Pratica dipendente estero",
        fileName: title(record),
        date: today(),
        status: "Collegato",
        notes: "Collegato alla contabilita: " + (doc.id || "")
      });
    }
    saveNow();
    alert("Pratica collegata alla contabilita: " + title(record));
    if (window.current) current.page = "accountant";
    if (typeof render === "function") render();
  }
  function rawFromTarget(target){
    if (!target) return "";
    const attrs = [
      "data-pms189-open","data-pms189-edit","data-pms189-print","data-pms189-accounting","data-pms189-delete",
      "data-pms176-workspace","data-pms176-save","data-pms176-print-doc","data-pms176-export","data-pms176-open-edit",
      "data-pms177-work","data-pms177-edit","data-pms177-print","data-pms177-delete","data-pms177-schedule",
      "data-pms182-action","data-pms182-id","data-pms175-open","data-pms175-edit","data-pms175-print",
      "data-pms128-foreign-open","data-pms128-foreign-edit","data-pms128-print-employee","data-pms128-foreign-delete",
      "data-id"
    ];
    for (const attr of attrs) {
      const value = target.getAttribute && target.getAttribute(attr);
      if (value && value !== "open" && value !== "edit" && value !== "print" && value !== "delete") return value;
    }
    const holder = target.closest && target.closest("[data-pms182-id],[data-pms189-foreign-id]");
    return holder && (holder.getAttribute("data-pms182-id") || holder.getAttribute("data-pms189-foreign-id")) || "";
  }
  function actionHtml(id){
    return '<div class="pms189-actions" data-pms189-foreign-id="' + esc(id) + '">' +
      '<button type="button" data-pms189-open="' + esc(id) + '">Apri</button>' +
      '<button type="button" data-pms189-edit="' + esc(id) + '">Modifica</button>' +
      '<button type="button" data-pms189-print="' + esc(id) + '">Stampa</button>' +
      '<button type="button" data-pms189-accounting="' + esc(id) + '">Contabilita</button>' +
      '<button type="button" class="pms189-danger" data-pms189-delete="' + esc(id) + '">Elimina</button>' +
    '</div>';
  }
  function decorateForeignRows(){
    const currentPage = window.current && current.page || "";
    if (!FOREIGN_PAGES.includes(currentPage)) return;
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table tbody tr").forEach(row => {
      const raw = rawFromTarget(row.querySelector("button,[data-id],[data-pms175-open]")) || (row.cells && row.cells[0] && row.cells[0].textContent);
      const record = resolveForeign(raw, row);
      if (!record) return;
      writeForeign(record);
      const id = recordId(record);
      row.setAttribute("data-pms189-foreign-row", id);
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell) return;
      let actions = cell.querySelector(".pms189-actions");
      if (!actions || actions.getAttribute("data-pms189-foreign-id") !== id) {
        if (actions) actions.remove();
        cell.insertAdjacentHTML("afterbegin", actionHtml(id));
      }
      cell.classList.add("pms189-stable-cell");
    });
  }
  function installPrintChoicesCss(){
    let style = document.getElementById("pms-v189-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v189-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms189-actions{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
      .pms189-actions button{width:auto!important;margin:0!important;padding:5px 7px!important;border:1px solid #cbd5e1!important;border-radius:7px!important;background:#fff!important;color:#17242b!important;font-size:10.5px!important;font-weight:850!important;line-height:1!important}
      .pms189-actions .pms189-danger{border-color:#dc2626!important;color:#991b1b!important;background:#fff5f5!important}
      .pms189-stable-cell > :not(.pms189-actions){display:none!important;visibility:hidden!important}
      @media screen{
        #print-root.pms189-print-root{position:fixed!important;inset:0!important;z-index:99999!important;background:#dfe7ef!important;overflow:auto!important;padding:0!important}
        .pms189-print-toolbar{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:10px;background:#102a43;color:#fff;padding:10px 14px;box-shadow:0 5px 18px rgba(15,23,42,.24)}
        .pms189-print-toolbar strong{font-size:13px}.pms189-print-toolbar div{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
        .pms189-print-toolbar button{width:auto!important;margin:0!important;border:1px solid rgba(255,255,255,.38)!important;border-radius:7px!important;background:#fff!important;color:#102a43!important;padding:7px 10px!important;font-weight:900!important}
        .pms189-print-toolbar .pms189-primary{background:#dff4e7!important;color:#123321!important}
        .pms189-print-stage{padding:12mm 0}
      }
      @media print{.pms189-print-toolbar{display:none!important}.pms189-print-stage{padding:0!important}}
    `;
  }
  function downloadHtml(html){
    const blob = new Blob(['<!doctype html><html><head><meta charset="utf-8"><title>Stampa Parmitalia</title></head><body>' + html + '</body></html>'], {type:"text/html;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stampa-parmitalia-" + today() + ".html";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function installPrintChoices(){
    if (window.__pms189OpenPrintWrapped || typeof openPrint !== "function") return;
    window.__pms189OpenPrintWrapped = true;
    openPrint = function(innerHtml){
      installPrintChoicesCss();
      const existing = document.getElementById("print-root");
      if (existing) existing.remove();
      const html = String(innerHtml || "");
      const root = document.createElement("div");
      root.id = "print-root";
      root.className = "pms189-print-root";
      root.innerHTML = '<div class="pms189-print-toolbar"><strong>Stampa documento</strong><div><button type="button" class="pms189-primary" data-pms189-print-now>Stampa</button><button type="button" data-pms189-direct-print>Stampa diretta</button><button type="button" data-pms189-save-pdf>Salva PDF</button><button type="button" data-pms189-download-html>Scarica HTML</button><button type="button" data-pms189-close-print>Chiudi</button></div></div><div class="pms189-print-stage">' + html + '</div>';
      document.body.appendChild(root);
      if (window.PMS_V188_GLOBAL_A4_PRINT_TABLE_LAYOUT_FIX && typeof window.PMS_V188_GLOBAL_A4_PRINT_TABLE_LAYOUT_FIX.markPrintRoot === "function") {
        window.PMS_V188_GLOBAL_A4_PRINT_TABLE_LAYOUT_FIX.markPrintRoot();
      }
      root.querySelector("[data-pms189-print-now]").onclick = () => window.print();
      root.querySelector("[data-pms189-direct-print]").onclick = () => window.print();
      root.querySelector("[data-pms189-save-pdf]").onclick = () => {
        alert("Nella finestra di stampa scegli 'Salva come PDF' come destinazione.");
        window.print();
      };
      root.querySelector("[data-pms189-download-html]").onclick = () => downloadHtml(html);
      root.querySelector("[data-pms189-close-print]").onclick = () => root.remove();
    };
    try { window.openPrint = openPrint; } catch(error) {}
  }
  function interceptForeignClicks(event){
    const target = event.target && event.target.closest && event.target.closest("[data-pms189-open],[data-pms189-edit],[data-pms189-print],[data-pms189-accounting],[data-pms189-delete],[data-pms176-workspace],[data-pms177-work],[data-pms177-edit],[data-pms177-print],[data-pms177-delete],[data-pms182-action],[data-pms175-open],[data-pms175-edit],[data-pms175-print],[data-pms128-foreign-open],[data-pms128-foreign-edit],[data-pms128-print-employee],[data-pms128-foreign-delete]");
    if (!target) return;
    const row = target.closest("tr");
    const record = resolveForeign(rawFromTarget(target), row);
    if (!record) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    if (target.hasAttribute("data-pms189-delete") || target.hasAttribute("data-pms177-delete") || target.hasAttribute("data-pms128-foreign-delete")) return deleteForeign(record);
    if (target.hasAttribute("data-pms189-print") || target.hasAttribute("data-pms177-print") || target.hasAttribute("data-pms175-print") || target.hasAttribute("data-pms128-print-employee")) return printForeign(record);
    if (target.hasAttribute("data-pms189-accounting")) return linkAccounting(record);
    if (target.hasAttribute("data-pms189-edit") || target.hasAttribute("data-pms177-edit") || target.hasAttribute("data-pms175-edit") || target.hasAttribute("data-pms128-foreign-edit")) return editForeign(record);
    return openForeign(record);
  }
  function decorate(){
    ensureForeignIds();
    installPrintChoicesCss();
    installPrintChoices();
    decorateForeignRows();
  }
  document.addEventListener("click", interceptForeignClicks, true);
  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms189Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 40);
      setTimeout(decorate, 220);
      return result;
    };
    window.render.__pms189Wrapped = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  [80, 260, 700, 1400].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 1600);
  window.PMS_V189_FOREIGN_ACCOUNTING_PRINT_CHOICES_FIX = {version:VERSION, resolveForeign, linkAccounting, openForeign, editForeign, printForeign};
})();
