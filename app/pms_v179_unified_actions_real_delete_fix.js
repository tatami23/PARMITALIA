(function(){
  "use strict";

  const VERSION = "pms_v179_unified_actions_real_delete_fix";
  const COMMON_MODULES = [
    "contacts","tasks","communications","offers","orders","intermediations","products","documents",
    "accountant","banks","payments","agents","contracts","contractTemplates","users","categories",
    "billingWorkflow","outgoingInvoices","incomingInvoices","invoices","accountantDocuments",
    "foreignEmployees","foreignRecruiting","employees","employeeLeaves","employeePayments"
  ];
  const LABELS = {
    foreignEmployees:"Dipendenti estero",
    foreignRecruiting:"Recruiting estero",
    accountant:"Contabilita",
    banks:"Banche",
    payments:"Pagamenti",
    documents:"Documenti",
    contacts:"Anagrafiche",
    communications:"Comunicazioni CRM",
    offers:"Offerte",
    orders:"Ordini",
    intermediations:"Intermediazioni"
  };

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v179-unified-delete");
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function recordId(record){
    return String(record && (record.id || record.code || record.protocol || record.orderCode || record.practiceCode || record.uid || record.invoiceNo || record.number) || "");
  }
  function recordTitle(record){
    return clean(record && (record.fullName || record.name || record.title || record.subject || record.company || record.client || record.customer || record.counterparty || record.month || record.product || record.email || recordId(record))) || "Record";
  }
  function moduleLabel(module){
    const mod = Array.isArray(window.modules) ? modules.find(item => item && item.id === module) : null;
    return (mod && mod.label) || LABELS[module] || module;
  }
  function cssEscape(value){
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }
  function keys(record){
    return Object.keys(record || {}).filter(key => key.charAt(0) !== "_" && typeof record[key] !== "function");
  }
  function valueText(value){
    if (Array.isArray(value)) return value.map(item => item && typeof item === "object" ? JSON.stringify(item) : String(item)).join("; ");
    if (value && typeof value === "object") return JSON.stringify(value);
    return String(value == null ? "" : value);
  }
  function currentPage(){
    return window.current && current.page || "";
  }
  function isForeignModule(module){
    return module === "foreignEmployees" || module === "foreignRecruiting";
  }
  function normalizeModule(module, id){
    if (module === "humanResources" && findRecord("foreignEmployees", id)) return "foreignEmployees";
    if (module === "commercialista") return "accountant";
    if (module === "contabilita") return "accountant";
    return module;
  }
  function findRecord(module, id){
    const value = String(id || "");
    if (!value) return null;
    if (isForeignModule(module)) {
      return arr(st().foreignEmployees).find(item => recordId(item) === value) || arr(st().foreignRecruiting).find(item => recordId(item) === value) || null;
    }
    return arr(st()[module]).find(item => recordId(item) === value) || null;
  }
  function findAnywhere(id){
    const value = String(id || "");
    const modules = COMMON_MODULES.concat(Object.keys(st()).filter(key => Array.isArray(st()[key])));
    for (const module of Array.from(new Set(modules))) {
      const record = findRecord(module, value);
      if (record) return {module, record};
    }
    return null;
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector([
      "[data-id]","[data-delete]","[data-edit]",
      "[data-pms177-delete]","[data-pms177-edit]","[data-pms177-print]","[data-pms177-work]",
      "[data-pms128-foreign-open]","[data-pms128-foreign-edit]","[data-pms128-foreign-delete]","[data-pms128-print-employee]",
      "[data-pms175-open]","[data-pms175-edit]","[data-pms175-print]","[data-pms175-excel]",
      "[data-pms168-open]","[data-pms84-delete-product]","[data-pms84-edit-product]"
    ].join(","));
    if (explicit) {
      const attrs = ["data-id","data-delete","data-edit","data-pms177-delete","data-pms177-edit","data-pms177-print","data-pms177-work","data-pms128-foreign-open","data-pms128-foreign-edit","data-pms128-foreign-delete","data-pms128-print-employee","data-pms175-open","data-pms175-edit","data-pms175-print","data-pms175-excel","data-pms168-open","data-pms84-delete-product","data-pms84-edit-product"];
      for (const attr of attrs) {
        const raw = explicit.getAttribute(attr);
        if (raw) return raw.includes(":") ? raw.split(":").pop() : raw;
      }
    }
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function moduleFromElement(el, id){
    const dataModule = el && (el.getAttribute("data-module") || el.getAttribute("data-edit") || el.getAttribute("data-delete"));
    if (dataModule && arr(st()[dataModule]).length) return dataModule;
    const p175 = el && (el.getAttribute("data-pms175-open") || el.getAttribute("data-pms175-edit") || el.getAttribute("data-pms175-print") || el.getAttribute("data-pms175-excel"));
    if (p175 && p175.includes(":")) return normalizeModule(p175.split(":")[0], id);
    if (el && (el.hasAttribute("data-pms128-foreign-open") || el.hasAttribute("data-pms128-foreign-edit") || el.hasAttribute("data-pms128-foreign-delete") || el.hasAttribute("data-pms128-print-employee") || el.hasAttribute("data-pms177-delete"))) return "foreignEmployees";
    const page = normalizeModule(currentPage(), id);
    if (arr(st()[page]).length || page === "foreignEmployees" || page === "foreignRecruiting" || page === "accountant") return page;
    const found = findAnywhere(id);
    return found ? found.module : page;
  }
  function extractAction(target){
    const el = target && target.closest && target.closest("[data-pms179-action],[data-delete],[data-edit],[data-pms177-delete],[data-pms177-edit],[data-pms177-print],[data-pms177-work],[data-pms128-foreign-delete],[data-pms128-foreign-edit],[data-pms128-print-employee],[data-pms128-foreign-open],[data-pms175-open],[data-pms175-edit],[data-pms175-print],[data-pms175-excel]");
    if (!el) return null;
    let action = el.getAttribute("data-pms179-action") || "";
    if (!action) {
      if (el.hasAttribute("data-delete") || el.hasAttribute("data-pms177-delete") || el.hasAttribute("data-pms128-foreign-delete")) action = "delete";
      else if (el.hasAttribute("data-edit") || el.hasAttribute("data-pms177-edit") || el.hasAttribute("data-pms128-foreign-edit") || el.hasAttribute("data-pms175-edit")) action = "edit";
      else if (el.hasAttribute("data-pms177-print") || el.hasAttribute("data-pms128-print-employee") || el.hasAttribute("data-pms175-print")) action = "print";
      else if (el.hasAttribute("data-pms175-excel")) action = "excel";
      else action = "open";
    }
    const row = el.closest("tr");
    let id = el.getAttribute("data-pms179-id") || el.getAttribute("data-id") || el.getAttribute("data-pms177-delete") || el.getAttribute("data-pms177-edit") || el.getAttribute("data-pms177-print") || el.getAttribute("data-pms177-work") || el.getAttribute("data-pms128-foreign-delete") || el.getAttribute("data-pms128-foreign-edit") || el.getAttribute("data-pms128-print-employee") || el.getAttribute("data-pms128-foreign-open") || "";
    const p175 = el.getAttribute("data-pms175-open") || el.getAttribute("data-pms175-edit") || el.getAttribute("data-pms175-print") || el.getAttribute("data-pms175-excel") || "";
    if (!id && p175) id = p175.includes(":") ? p175.split(":").slice(1).join(":") : p175;
    if (!id && row) id = rowId(row);
    id = id && id.includes(":") ? id.split(":").pop() : id;
    const module = normalizeModule(el.getAttribute("data-pms179-module") || moduleFromElement(el, id), id);
    return {el, action, module, id};
  }
  function tableHtml(record){
    return '<div class="pms179-table"><table><tbody>' + keys(record).map(key => '<tr><th>' + esc(key) + '</th><td>' + esc(valueText(record[key])) + '</td></tr>').join("") + '</tbody></table></div>';
  }
  function openRecord(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + module + " " + id);
    if (isForeignModule(module) && window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(id);
      return;
    }
    document.querySelectorAll(".pms179-modal-backdrop").forEach(node => node.remove());
    const wrap = document.createElement("div");
    wrap.className = "pms179-modal-backdrop";
    wrap.innerHTML = '<div class="pms179-modal"><div class="pms179-modal-head"><h3>' + esc(moduleLabel(module)) + " - " + esc(recordTitle(record)) + '</h3><button type="button" class="secondary-button" data-pms179-close>Chiudi</button></div><div class="pms179-actions"><button class="primary-button" data-pms179-action="edit" data-pms179-module="' + esc(module) + '" data-pms179-id="' + esc(id) + '">Modifica</button><button class="secondary-button" data-pms179-action="print" data-pms179-module="' + esc(module) + '" data-pms179-id="' + esc(id) + '">Stampa</button><button class="secondary-button" data-pms179-action="excel" data-pms179-module="' + esc(module) + '" data-pms179-id="' + esc(id) + '">Excel</button><button class="secondary-button pms179-danger" data-pms179-action="delete" data-pms179-module="' + esc(module) + '" data-pms179-id="' + esc(id) + '">Elimina</button></div>' + tableHtml(record) + '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", event => { if (event.target === wrap || event.target.closest("[data-pms179-close]")) wrap.remove(); });
  }
  function editRecord(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + module + " " + id);
    if (isForeignModule(module) && window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(id);
      return;
    }
    document.querySelectorAll(".pms179-modal-backdrop").forEach(node => node.remove());
    const wrap = document.createElement("div");
    wrap.className = "pms179-modal-backdrop";
    const fields = keys(record).map(key => {
      const value = valueText(record[key]);
      const input = value.length > 80 || /note|notes|body|description|content|message|documents|address/i.test(key)
        ? '<textarea name="' + esc(key) + '">' + esc(value) + '</textarea>'
        : '<input name="' + esc(key) + '" value="' + esc(value) + '">';
      return '<label>' + esc(key) + input + '</label>';
    }).join("");
    wrap.innerHTML = '<div class="pms179-modal"><div class="pms179-modal-head"><h3>Modifica - ' + esc(recordTitle(record)) + '</h3><button type="button" class="secondary-button" data-pms179-close>Chiudi</button></div><form class="pms179-form" data-pms179-edit-form="' + esc(module) + ':' + esc(id) + '">' + fields + '<div class="pms179-actions"><button type="submit" class="primary-button">Salva modifiche</button><button type="button" class="secondary-button" data-pms179-close>Annulla</button></div></form></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", event => { if (event.target === wrap || event.target.closest("[data-pms179-close]")) wrap.remove(); });
  }
  function submitEdit(form){
    const raw = form.getAttribute("data-pms179-edit-form") || "";
    const parts = raw.split(":");
    const module = parts[0];
    const id = parts.slice(1).join(":");
    const record = findRecord(module, id);
    if (!record) return;
    Array.from(form.elements).forEach(el => {
      if (!el.name) return;
      const oldValue = record[el.name];
      if (typeof oldValue === "number" && el.value !== "") {
        const n = Number(String(el.value).replace(",", "."));
        record[el.name] = Number.isFinite(n) ? n : el.value;
      } else {
        record[el.name] = el.value;
      }
    });
    record.updatedAt = new Date().toISOString();
    saveNow();
    document.querySelectorAll(".pms179-modal-backdrop").forEach(node => node.remove());
    if (typeof render === "function") render();
    setTimeout(() => openRecord(module, id), 80);
  }
  function printRecord(module, id){
    const record = findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + module + " " + id);
    const html = '<div class="print-document pms179-print"><div class="print-header"><div><h1>' + esc(moduleLabel(module)) + '</h1><strong>' + esc(recordTitle(record)) + '</strong></div><div class="print-meta">' + esc(recordId(record)) + '</div></div>' + tableHtml(record) + '<div class="print-footer">' + esc(moduleLabel(module)) + " - " + esc(recordId(record)) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function exportExcel(module, id){
    const record = findRecord(module, id);
    const records = record ? [record] : arr(st()[module]);
    if (!records.length) return alert("Nessun dato da esportare.");
    const allKeys = Array.from(new Set(records.flatMap(keys)));
    const html = '<html><head><meta charset="utf-8"></head><body><table><thead><tr>' + allKeys.map(key => '<th>' + esc(key) + '</th>').join("") + '</tr></thead><tbody>' + records.map(item => '<tr>' + allKeys.map(key => '<td>' + esc(valueText(item[key])) + '</td>').join("") + '</tr>').join("") + '</tbody></table></body></html>';
    const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (moduleLabel(module) + "-" + (id || "elenco") + ".xls").replace(/[^\w.-]+/g, "_");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function deleteRecord(module, id){
    module = normalizeModule(module, id);
    let record = findRecord(module, id);
    const found = record ? {module, record} : findAnywhere(id);
    if (!record && found) {
      module = found.module;
      record = found.record;
    }
    if (!record) return alert("Record non trovato da eliminare: " + id);
    if (!confirm("Eliminare definitivamente " + recordTitle(record) + " (" + recordId(record) + ")?")) return;
    if (isForeignModule(module)) {
      st().foreignEmployees = arr(st().foreignEmployees).filter(item => recordId(item) !== String(id));
      st().foreignRecruiting = arr(st().foreignRecruiting).filter(item => recordId(item) !== String(id));
    } else {
      st()[module] = arr(st()[module]).filter(item => recordId(item) !== String(id));
    }
    saveNow();
    document.querySelectorAll(".pms175-modal-backdrop,.pms176-modal-backdrop,.pms179-modal-backdrop").forEach(node => node.remove());
    if (typeof render === "function") render();
    setTimeout(decorate, 120);
  }
  function handleAction(action){
    if (!action || !action.id) return false;
    const module = normalizeModule(action.module, action.id);
    if (action.action === "delete") deleteRecord(module, action.id);
    else if (action.action === "edit") editRecord(module, action.id);
    else if (action.action === "print") printRecord(module, action.id);
    else if (action.action === "excel") exportExcel(module, action.id);
    else openRecord(module, action.id);
    return true;
  }
  function appendButton(host, label, action, module, id, danger){
    if (!host || host.querySelector('[data-pms179-action="' + action + '"][data-pms179-id="' + cssEscape(id) + '"]')) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = danger ? "inline-button pms179-danger" : "inline-button";
    button.textContent = label;
    button.setAttribute("data-pms179-action", action);
    button.setAttribute("data-pms179-module", module);
    button.setAttribute("data-pms179-id", id);
    host.appendChild(button);
  }
  function moduleForRow(row, id){
    const page = normalizeModule(currentPage(), id);
    if (page === "humanResources" && findRecord("foreignEmployees", id)) return "foreignEmployees";
    if (findRecord(page, id)) return page;
    const found = findAnywhere(id);
    return found ? found.module : page;
  }
  function decorateRows(){
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || id === "-") return;
      const module = moduleForRow(row, id);
      if (!findRecord(module, id)) return;
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell) return;
      let host = cell.querySelector(".pms179-actions,.pms177-actions,.pms175-row-actions,.pms128-row-actions,.pms85-action-cell,.pms84-action-cell") || cell.querySelector("div");
      if (!host) {
        host = document.createElement("div");
        host.className = "pms179-actions";
        cell.appendChild(host);
      }
      appendButton(host, "Apri", "open", module, id);
      appendButton(host, "Modifica", "edit", module, id);
      appendButton(host, "Stampa", "print", module, id);
      appendButton(host, "Excel", "excel", module, id);
      appendButton(host, "Elimina", "delete", module, id, true);
    });
  }
  function interceptClick(event){
    const action = extractAction(event.target);
    if (!action || !action.id) return;
    const record = findRecord(normalizeModule(action.module, action.id), action.id) || (findAnywhere(action.id) || {}).record;
    if (!record) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    handleAction(action);
  }
  function injectCss(){
    let style = document.getElementById("pms-v179-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v179-style";
      document.head.appendChild(style);
    }
    style.textContent = ".pms179-actions{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.pms179-actions button{width:auto!important;margin:0!important}.pms179-danger{border-color:#dc2626!important;color:#991b1b!important;background:#fff5f5!important}.pms179-modal-backdrop{position:fixed;inset:0;z-index:36000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms179-modal{width:min(1060px,96vw);max-height:90vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px;box-shadow:0 24px 72px rgba(15,23,42,.32)}.pms179-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.pms179-modal-head h3{margin:0;color:#0f172a}.pms179-table{overflow:auto}.pms179-table table{width:100%;border-collapse:collapse}.pms179-table th,.pms179-table td{border:1px solid #e2e8f0;padding:7px 8px;text-align:left;vertical-align:top;word-break:break-word}.pms179-table th{width:210px;background:#f8fafc;color:#334155}.pms179-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pms179-form label{display:grid;gap:4px;font-size:12px;font-weight:800;color:#475569}.pms179-form input,.pms179-form textarea{width:100%;box-sizing:border-box}.pms179-form textarea{min-height:88px}.pms179-form .pms179-actions{grid-column:1/-1}@media(max-width:760px){.pms179-form{grid-template-columns:1fr}}@media print{.pms179-actions{display:none!important}}";
  }
  function decorate(){
    st();
    injectCss();
    decorateRows();
  }

  document.addEventListener("click", interceptClick, true);
  document.addEventListener("submit", event => {
    const form = event.target && event.target.closest && event.target.closest("[data-pms179-edit-form]");
    if (!form) return;
    event.preventDefault();
    event.stopPropagation();
    submitEdit(form);
  }, true);

  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms179Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 70);
      setTimeout(decorate, 240);
      return result;
    };
    window.render.__pms179Wrapped = true;
  }

  [100, 350, 900, 1600].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 1500);
  window.PMS_V179_UNIFIED_ACTIONS_REAL_DELETE_FIX = {version:VERSION, deleteRecord, openRecord, editRecord, printRecord, exportExcel};
})();
