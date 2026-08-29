(function(){
  "use strict";

  const VERSION = "pms_v185_stable_accounting_delete_actions";
  const ACCOUNTING_MODULES = [
    "accountant",
    "accountantDocuments",
    "accountantDossiers",
    "accountantActions",
    "billingWorkflow",
    "outgoingInvoices",
    "incomingInvoices",
    "invoices",
    "banks",
    "payments"
  ];
  const PAGE_MODULES = ["accountant", "billingWorkflow", "banks", "payments"];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function st(){ window.state = window.state || {}; return state; }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v185-accounting-delete");
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function recordId(record){
    return String(record && (record.id || record.code || record.protocol || record.number || record.invoiceNo || record.uid || record.period || record.month) || "");
  }
  function recordTitle(record){
    return clean(record && (record.title || record.subject || record.name || record.company || record.partyName || record.client || record.supplier || record.period || record.month || record.fileName || recordId(record))) || "record";
  }
  function moduleLabel(module){
    const mod = Array.isArray(window.modules) ? modules.find(item => item && item.id === module) : null;
    const labels = {
      accountant:"Contabilita",
      accountantDocuments:"Documenti contabilita",
      accountantDossiers:"Dossier contabilita",
      accountantActions:"Azioni contabilita",
      billingWorkflow:"Fatturazione",
      outgoingInvoices:"Fatture emesse",
      incomingInvoices:"Fatture ricevute",
      invoices:"Fatture",
      banks:"Banche",
      payments:"Pagamenti"
    };
    return (mod && mod.label) || labels[module] || module;
  }
  function currentPage(){
    return window.current && current.page || "";
  }
  function pageCandidateModules(){
    const page = currentPage();
    if (page === "accountant") return ["accountant", "accountantDocuments", "accountantDossiers", "accountantActions"];
    if (page === "billingWorkflow") return ["billingWorkflow", "outgoingInvoices", "incomingInvoices", "invoices"];
    if (page === "banks") return ["banks"];
    if (page === "payments") return ["payments"];
    return ACCOUNTING_MODULES;
  }
  function findRecord(module, id){
    const value = String(id || "");
    if (!value) return null;
    return arr(st()[module]).find(item => recordId(item) === value) || null;
  }
  function findAnywhere(id, preferred){
    const modules = Array.from(new Set([].concat(preferred || [], pageCandidateModules(), ACCOUNTING_MODULES)));
    for (const module of modules) {
      const record = findRecord(module, id);
      if (record) return {module, record};
    }
    return null;
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector("[data-pms185-id],[data-pms179-id],[data-id],[data-edit],[data-delete],[data-pms102-print-dossier],[data-pms102-doc-print],[data-pms84-open-invoice],[data-pms84-edit-invoice]");
    if (explicit) {
      const attrs = ["data-pms185-id","data-pms179-id","data-id","data-edit","data-delete","data-pms102-print-dossier","data-pms102-doc-print","data-pms84-open-invoice","data-pms84-edit-invoice"];
      for (const attr of attrs) {
        const raw = explicit.getAttribute(attr);
        if (raw) return raw.includes(":") ? raw.split(":").pop() : raw;
      }
    }
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function keys(record){
    return Object.keys(record || {}).filter(key => key.charAt(0) !== "_" && typeof record[key] !== "function");
  }
  function valueText(value){
    if (Array.isArray(value)) return value.map(item => item && typeof item === "object" ? JSON.stringify(item) : String(item)).join("; ");
    if (value && typeof value === "object") return JSON.stringify(value);
    return String(value == null ? "" : value);
  }
  function tableHtml(record){
    return '<div class="pms185-table"><table><tbody>' + keys(record).map(key => '<tr><th>' + esc(key) + '</th><td>' + esc(valueText(record[key])) + '</td></tr>').join("") + '</tbody></table></div>';
  }
  function actionHtml(module, id){
    return '<div class="pms185-actions" data-pms185-module="' + esc(module) + '" data-pms185-id="' + esc(id) + '">' +
      '<button type="button" data-pms185-action="open">Apri</button>' +
      '<button type="button" data-pms185-action="edit">Modifica</button>' +
      '<button type="button" data-pms185-action="print">Stampa</button>' +
      '<button type="button" data-pms185-action="excel">Excel</button>' +
      '<button type="button" class="pms185-danger" data-pms185-action="delete">Elimina</button>' +
    '</div>';
  }
  function ensureHeader(table){
    if (!table || table.dataset.pms185Header === "1") return;
    const headRow = table.querySelector("thead tr");
    if (headRow && !headRow.querySelector("[data-pms185-head]")) {
      const th = document.createElement("th");
      th.textContent = "Azioni";
      th.setAttribute("data-pms185-head", "1");
      headRow.appendChild(th);
    }
    table.dataset.pms185Header = "1";
  }
  function actionCell(row){
    const existing = row.querySelector(".pms185-actions");
    if (existing) return existing.closest("td");
    const buttonCell = Array.from(row.cells || []).find(cell => cell.querySelector("button"));
    if (buttonCell) return buttonCell;
    const td = document.createElement("td");
    row.appendChild(td);
    return td;
  }
  function decorateAccounting(){
    const page = currentPage();
    if (!PAGE_MODULES.includes(page)) return;
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table").forEach(ensureHeader);
    content.querySelectorAll("table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || id === "-") return;
      const found = findAnywhere(id);
      if (!found) return;
      const cell = actionCell(row);
      if (!cell) return;
      let actions = cell.querySelector(".pms185-actions");
      if (!actions || actions.getAttribute("data-pms185-id") !== id || actions.getAttribute("data-pms185-module") !== found.module) {
        if (actions) actions.remove();
        cell.insertAdjacentHTML("afterbegin", actionHtml(found.module, id));
        actions = cell.querySelector(".pms185-actions");
      }
      cell.classList.add("pms185-stable-action-cell");
      cell.querySelectorAll("button:not([data-pms185-action])").forEach(button => {
        button.setAttribute("aria-hidden", "true");
        button.style.setProperty("display", "none", "important");
        button.style.setProperty("visibility", "hidden", "important");
      });
    });
  }
  function openRecord(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + id);
    document.querySelectorAll(".pms185-modal-backdrop").forEach(node => node.remove());
    const wrap = document.createElement("div");
    wrap.className = "pms185-modal-backdrop";
    wrap.innerHTML = '<div class="pms185-modal"><div class="pms185-modal-head"><h3>' + esc(moduleLabel(module)) + " - " + esc(recordTitle(record)) + '</h3><button type="button" class="secondary-button" data-pms185-close>Chiudi</button></div><div class="pms185-actions pms185-modal-actions" data-pms185-module="' + esc(module) + '" data-pms185-id="' + esc(id) + '"><button type="button" data-pms185-action="edit">Modifica</button><button type="button" data-pms185-action="print">Stampa</button><button type="button" data-pms185-action="excel">Excel</button><button type="button" class="pms185-danger" data-pms185-action="delete">Elimina</button></div>' + tableHtml(record) + '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", event => { if (event.target === wrap || event.target.closest("[data-pms185-close]")) wrap.remove(); });
  }
  function editRecord(module, id){
    if (typeof openModal === "function" && window.schemas && schemas[module]) {
      openModal(module, id);
      return;
    }
    openRecord(module, id);
  }
  function printRecord(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + id);
    const html = '<div class="print-document pms185-print"><div class="print-header"><div><h1>' + esc(moduleLabel(module)) + '</h1><strong>' + esc(recordTitle(record)) + '</strong></div><div class="print-meta">' + esc(recordId(record)) + '</div></div>' + tableHtml(record) + '<div class="print-footer">' + esc(moduleLabel(module)) + " - " + esc(recordId(record)) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function exportExcel(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + id);
    const html = '<html><head><meta charset="utf-8"></head><body><table><tbody>' + keys(record).map(key => '<tr><th>' + esc(key) + '</th><td>' + esc(valueText(record[key])) + '</td></tr>').join("") + '</tbody></table></body></html>';
    const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (moduleLabel(module) + "-" + id + ".xls").replace(/[^\w.-]+/g, "_");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function deleteRecord(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Record non trovato: " + id);
    if (!confirm("Eliminare definitivamente " + recordTitle(record) + " (" + recordId(record) + ")?")) return;
    state[module] = arr(st()[module]).filter(item => recordId(item) !== String(id));
    saveNow();
    document.querySelectorAll(".pms185-modal-backdrop,.pms179-modal-backdrop").forEach(node => node.remove());
    if (typeof render === "function") render();
    setTimeout(decorateAccounting, 150);
  }
  function handleClick(event){
    const button = event.target && event.target.closest && event.target.closest("[data-pms185-action]");
    if (!button) return;
    const host = button.closest(".pms185-actions");
    if (!host) return;
    const module = host.getAttribute("data-pms185-module");
    const id = host.getAttribute("data-pms185-id");
    if (!module || !id) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    const action = button.getAttribute("data-pms185-action");
    if (action === "delete") deleteRecord(module, id);
    else if (action === "edit") editRecord(module, id);
    else if (action === "print") printRecord(module, id);
    else if (action === "excel") exportExcel(module, id);
    else openRecord(module, id);
  }
  function injectCss(){
    let style = document.getElementById("pms-v185-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v185-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms185-actions{display:flex!important;flex-wrap:wrap!important;gap:5px!important;align-items:center!important;visibility:visible!important}
      .pms185-actions button{width:auto!important;margin:0!important;padding:5px 7px!important;border:1px solid #cbd5e1!important;border-radius:7px!important;background:#fff!important;color:#17242b!important;font-size:10.5px!important;font-weight:850!important;line-height:1!important}
      .pms185-actions .pms185-danger{border-color:#dc2626!important;color:#991b1b!important;background:#fff5f5!important}
      .pms185-stable-action-cell > button:not([data-pms185-action]),.pms185-stable-action-cell > :not(.pms185-actions){display:none!important;visibility:hidden!important}
      .pms185-modal-backdrop{position:fixed;inset:0;z-index:39500;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}
      .pms185-modal{width:min(1060px,96vw);max-height:90vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px;box-shadow:0 24px 72px rgba(15,23,42,.32)}
      .pms185-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
      .pms185-modal-head h3{margin:0;color:#0f172a}
      .pms185-modal-actions{margin-bottom:10px}
      .pms185-table{overflow:auto}
      .pms185-table table{width:100%;border-collapse:collapse}
      .pms185-table th,.pms185-table td{border:1px solid #e2e8f0;padding:7px 8px;text-align:left;vertical-align:top;word-break:break-word}
      .pms185-table th{width:210px;background:#f8fafc;color:#334155}
      @media print{.pms185-actions{display:none!important}}
    `;
  }
  function decorate(){
    injectCss();
    decorateAccounting();
  }

  document.addEventListener("click", handleClick, true);
  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms185Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 80);
      setTimeout(decorate, 260);
      return result;
    };
    window.render.__pms185Wrapped = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
  [120, 420, 1000].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 1500);
  window.PMS_V185_STABLE_ACCOUNTING_DELETE_ACTIONS = {version:VERSION, decorate, deleteRecord};
})();
