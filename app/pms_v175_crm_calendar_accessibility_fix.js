(function(){
  "use strict";

  const VERSION = "pms_v175_crm_calendar_accessibility_fix";
  const CRM_MODULES = ["communications","tasks","crmActivities","crmOpportunities","opportunities"];
  const ACCESS_MODULES = ["foreignEmployees","foreignRecruiting","accountant","billingWorkflow","banks","payments","outgoingInvoices","documents"];

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function st(){
    window.state = window.state || {};
    CRM_MODULES.concat(ACCESS_MODULES).forEach(key => { if (!Array.isArray(state[key])) state[key] = []; });
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function recordId(record){ return String(record && (record.id || record.code || record.protocol || record.practiceCode || record.uid) || ""); }
  function recordTitle(record){ return clean(record && (record.title || record.subject || record.fullName || record.name || record.company || record.client || record.counterparty || record.month || record.practiceCode || recordId(record))) || "Scheda"; }
  function moduleLabel(module){
    const mod = Array.isArray(window.modules) && modules.find(item => item && item.id === module);
    const fallback = {communications:"Comunicazioni CRM",tasks:"Attivita",contacts:"Aziende CRM",crmOpportunities:"Opportunita",opportunities:"Opportunita",crmActivities:"Attivita CRM",crmCompanies:"Aziende CRM",companies:"Aziende",foreignEmployees:"Dipendenti estero",foreignRecruiting:"Dipendenti estero",accountant:"Contabilita",billingWorkflow:"Fatturazione",banks:"Banche",payments:"Pagamenti",outgoingInvoices:"Fatture",documents:"Documenti"};
    return mod && mod.label || fallback[module] || module;
  }
  function findRecord(module, id){ return arr(st()[module]).find(item => recordId(item) === String(id || "")) || null; }
  function findAnyForeign(id){ return findRecord("foreignEmployees", id) || findRecord("foreignRecruiting", id); }
  function keys(record){ return Object.keys(record || {}).filter(key => typeof record[key] !== "function" && key.charAt(0) !== "_"); }
  function valueText(value){
    if (Array.isArray(value)) return value.map(item => typeof item === "object" ? JSON.stringify(item) : String(item)).join("; ");
    if (value && typeof value === "object") return JSON.stringify(value);
    return String(value == null ? "" : value);
  }
  function setValue(record, key, value){
    if (/amount|value|total|price|cost|qty|quantity|rate|percent|commission|gross|net|deduction/i.test(key) && value !== "") {
      const n = Number(String(value).replace(",", "."));
      record[key] = Number.isFinite(n) ? n : value;
      return;
    }
    record[key] = value;
  }
  function modal(title, body){
    document.querySelectorAll(".pms175-modal-backdrop").forEach(node => node.remove());
    const wrap = document.createElement("div");
    wrap.className = "pms175-modal-backdrop";
    wrap.innerHTML = '<div class="pms175-modal"><div class="pms175-modal-head"><h3>' + esc(title) + '</h3><button type="button" class="secondary-button" data-pms175-close>Chiudi</button></div>' + body + '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", event => { if (event.target === wrap || event.target.closest("[data-pms175-close]")) wrap.remove(); });
    return wrap;
  }
  function tableHtml(record){
    return '<div class="pms175-table"><table><tbody>' + keys(record).map(key => '<tr><th>' + esc(key) + '</th><td>' + esc(valueText(record[key])) + '</td></tr>').join("") + '</tbody></table></div>';
  }
  function printHtml(module, record){
    return '<div class="print-document pms175-print"><div class="print-header"><div><h1>' + esc(moduleLabel(module).toUpperCase()) + '</h1><strong>' + esc(recordTitle(record)) + '</strong></div><div class="print-meta">' + esc(recordId(record)) + '<br>' + esc(today()) + '</div></div>' + tableHtml(record) + '<div class="print-footer">' + esc(moduleLabel(module)) + " - " + esc(recordId(record)) + '</div></div>';
  }
  function openRecord(module, id){
    const record = module === "foreignEmployees" ? findAnyForeign(id) : findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + module + " " + id);
    modal(moduleLabel(module) + " - " + recordTitle(record), '<div class="pms175-actions"><button class="primary-button" data-pms175-edit="' + esc(module) + ':' + esc(recordId(record)) + '">Modifica</button><button class="secondary-button" data-pms175-print="' + esc(module) + ':' + esc(recordId(record)) + '">Stampa / PDF</button><button class="secondary-button" data-pms175-excel="' + esc(module) + ':' + esc(recordId(record)) + '">Excel</button></div>' + tableHtml(record));
    bind();
  }
  function editRecord(module, id){
    const record = module === "foreignEmployees" ? findAnyForeign(id) : findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + module + " " + id);
    const body = '<form class="pms175-form" data-pms175-form="' + esc(module) + ':' + esc(recordId(record)) + '">' + keys(record).map(key => {
      const value = valueText(record[key]);
      if (value.length > 80 || /notes|note|message|body|description|documents|summary|text|address|content/i.test(key)) return '<label>' + esc(key) + '<textarea name="' + esc(key) + '">' + esc(value) + '</textarea></label>';
      return '<label>' + esc(key) + '<input name="' + esc(key) + '" value="' + esc(value) + '"></label>';
    }).join("") + '<div class="pms175-actions"><button type="submit" class="primary-button">Salva modifiche</button><button type="button" class="secondary-button" data-pms175-close>Annulla</button></div></form>';
    modal("Modifica - " + recordTitle(record), body);
    bind();
  }
  function submitEdit(form){
    const parts = String(form.getAttribute("data-pms175-form") || "").split(":");
    const module = parts[0], id = parts.slice(1).join(":");
    const record = module === "foreignEmployees" ? findAnyForeign(id) : findRecord(module, id);
    if (!record) return false;
    Array.from(form.elements).forEach(el => { if (el.name) setValue(record, el.name, el.value); });
    record.updatedAt = new Date().toISOString();
    saveNow();
    document.querySelectorAll(".pms175-modal-backdrop").forEach(node => node.remove());
    if (typeof render === "function") render();
    setTimeout(() => openRecord(module, id), 80);
    return true;
  }
  function printRecord(module, id){
    const record = module === "foreignEmployees" ? findAnyForeign(id) : findRecord(module, id);
    if (!record) return alert("Scheda non trovata: " + module + " " + id);
    if (typeof openPrint === "function") openPrint(printHtml(module, record));
  }
  function exportExcel(module, id){
    const list = id ? [module === "foreignEmployees" ? findAnyForeign(id) : findRecord(module, id)] : arr(st()[module]);
    const records = list.filter(Boolean);
    if (!records.length) return alert("Nessun dato da esportare.");
    const allKeys = Array.from(new Set(records.flatMap(keys)));
    const html = '<html><head><meta charset="utf-8"></head><body><table><thead><tr>' + allKeys.map(key => '<th>' + esc(key) + '</th>').join("") + '</tr></thead><tbody>' + records.map(record => '<tr>' + allKeys.map(key => '<td>' + esc(valueText(record[key])) + '</td>').join("") + '</tr>').join("") + '</tbody></table></body></html>';
    const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (moduleLabel(module) + "-" + (id || "elenco") + ".xls").replace(/[^\w.-]+/g, "_");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector("[data-id],[data-pms128-foreign-open],[data-pms158-edit-foreign],[data-pms168-open],[data-pms175-id]");
    if (explicit) return explicit.getAttribute("data-id") || explicit.getAttribute("data-pms128-foreign-open") || explicit.getAttribute("data-pms158-edit-foreign") || explicit.getAttribute("data-pms168-open") || explicit.getAttribute("data-pms175-id") || "";
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function appendButton(host, label, attr, value, cls){
    if (!host || host.querySelector("[" + attr + '="' + CSS.escape(value) + '"]')) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = cls || "inline-button";
    button.textContent = label;
    button.setAttribute(attr, value);
    host.appendChild(button);
  }
  function currentAccessModule(){
    const page = window.current && current.page || "";
    if (page === "foreignEmployees") return "foreignEmployees";
    if (ACCESS_MODULES.includes(page)) return page;
    return "";
  }
  function decorateAccessRows(){
    const module = currentAccessModule();
    if (!module) return;
    document.querySelectorAll("#content table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || id === "-") return;
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell) return;
      let host = cell.querySelector(".pms175-row-actions,.pms128-row-actions,.pms158-actions,.pms168-actions,.pms85-action-cell");
      if (!host) {
        host = document.createElement("div");
        host.className = "pms175-row-actions";
        cell.appendChild(host);
      }
      appendButton(host, "Apri", "data-pms175-open", module + ":" + id, "inline-button");
      appendButton(host, "Modifica", "data-pms175-edit", module + ":" + id, "inline-button");
      appendButton(host, "PDF", "data-pms175-print", module + ":" + id, "inline-button");
      appendButton(host, "Excel", "data-pms175-excel", module + ":" + id, "inline-button");
    });
  }
  function crmRecords(){
    const out = [];
    CRM_MODULES.forEach(module => arr(st()[module]).forEach(record => {
      const id = recordId(record);
      if (id) out.push({module, record, id});
    }));
    return out;
  }
  function crmDate(record){ return String(record.scheduledDate || record.operationalDate || record.calendarDate || "").slice(0, 10); }
  function crmCard(entry, compact){
    const record = entry.record;
    return '<article class="pms175-calendar-card" draggable="true" tabindex="0" data-pms175-crm="' + esc(entry.module + ":" + entry.id) + '"><div><strong>' + esc(recordTitle(record)) + '</strong><span>' + esc(moduleLabel(entry.module)) + '</span></div>' + (compact ? "" : '<small>' + esc(record.client || record.company || record.linkedTo || record.status || record.email || "") + '</small>') + (crmDate(record) ? '<button type="button" data-pms175-clear-crm="' + esc(entry.module + ":" + entry.id) + '">Togli data</button>' : "") + '</article>';
  }
  function setCrmDate(module, id, date){
    const record = findRecord(module, id);
    if (!record) return false;
    record.scheduledDate = date || "";
    record.operationalDate = record.scheduledDate;
    record.calendarDate = record.scheduledDate;
    record.updatedAt = new Date().toISOString();
    saveNow();
    return true;
  }
  function decorateCalendar(){
    const page = document.querySelector(".pms136-page");
    if (!page) return;
    page.querySelectorAll(".pms175-calendar-card,.pms175-crm-backlog").forEach(node => node.remove());
    const entries = crmRecords();
    page.querySelectorAll(".pms136-day").forEach(day => {
      const list = day.querySelector(".pms136-day-list") || day;
      entries.filter(entry => crmDate(entry.record) === day.getAttribute("data-pms136-day")).forEach(entry => list.insertAdjacentHTML("beforeend", crmCard(entry, true)));
    });
    const backlog = entries.filter(entry => !crmDate(entry.record));
    const host = page.querySelector(".pms136-backlogs") || page;
    host.insertAdjacentHTML("beforeend", '<section class="pms136-backlog pms175-crm-backlog"><header><h3>CRM da programmare</h3><span>' + backlog.length + '</span></header><div class="pms136-backlog-list">' + (backlog.map(entry => crmCard(entry, false)).join("") || '<div class="pms136-empty">Nessuna scheda CRM da programmare.</div>') + '</div></section>');
    bindCalendarCards();
  }
  function bindCalendarCards(){
    document.querySelectorAll("[data-pms175-crm]").forEach(card => {
      card.addEventListener("dragstart", event => {
        event.dataTransfer.setData("application/x-pms175-crm", card.getAttribute("data-pms175-crm"));
        event.dataTransfer.effectAllowed = "move";
      });
    });
    document.querySelectorAll(".pms136-day").forEach(day => {
      if (day.dataset.pms175DropBound === "1") return;
      day.dataset.pms175DropBound = "1";
      day.addEventListener("dragover", event => {
        if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("application/x-pms175-crm")) event.preventDefault();
      });
      day.addEventListener("drop", event => {
        const raw = event.dataTransfer && event.dataTransfer.getData("application/x-pms175-crm");
        if (!raw) return;
        event.preventDefault();
        const parts = raw.split(":");
        if (setCrmDate(parts[0], parts.slice(1).join(":"), day.getAttribute("data-pms136-day")) && typeof render === "function") render();
      });
    });
    document.querySelectorAll("[data-pms175-clear-crm]").forEach(button => {
      button.onclick = event => {
        event.stopPropagation();
        const parts = button.getAttribute("data-pms175-clear-crm").split(":");
        if (setCrmDate(parts[0], parts.slice(1).join(":"), "") && typeof render === "function") render();
      };
    });
  }
  function decorateCrmPage(){
    if (!window.current || current.page !== "communications") return;
    if (!document.getElementById("pms175-crm-calendar-panel")) {
      const content = document.getElementById("content");
      if (content) {
        const entries = crmRecords().slice(0, 24);
        content.insertAdjacentHTML("afterbegin", '<div id="pms175-crm-calendar-panel" class="pms175-panel"><div><strong>Caselle CRM per calendario</strong><small>Trascina una scheda nel calendario operativo oppure apri il calendario e assegnala a un giorno.</small></div><button class="secondary-button" data-pms175-open-calendar>Apri calendario</button><div class="pms175-crm-strip">' + entries.map(entry => crmCard(entry, false)).join("") + '</div></div>');
      }
    }
    document.querySelectorAll("#content table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || !findRecord("communications", id)) return;
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell) return;
      let host = cell.querySelector(".pms175-row-actions");
      if (!host) {
        host = document.createElement("div");
        host.className = "pms175-row-actions";
        cell.appendChild(host);
      }
      appendButton(host, "Calendario", "data-pms175-crm-drag-button", "communications:" + id, "inline-button");
      appendButton(host, "Apri", "data-pms175-open", "communications:" + id, "inline-button");
      appendButton(host, "PDF", "data-pms175-print", "communications:" + id, "inline-button");
      appendButton(host, "Excel", "data-pms175-excel", "communications:" + id, "inline-button");
    });
    bindCalendarCards();
  }
  function injectCss(){
    let style = document.getElementById("pms-v175-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v175-style";
      document.head.appendChild(style);
    }
    style.textContent = `.pms175-row-actions,.pms175-actions{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.pms175-row-actions button,.pms175-actions button{width:auto!important;margin:0!important}.pms175-panel{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:12px;margin:0 0 12px}.pms175-panel strong{display:block;color:#0f172a}.pms175-panel small{display:block;color:#64748b;margin-top:3px}.pms175-crm-strip{grid-column:1/-1;display:flex;gap:8px;overflow:auto;padding-top:4px}.pms175-calendar-card{display:grid;gap:5px;min-width:190px;background:#fff;border:1px solid #d7dee8;border-left:4px solid #5f8f6d;border-radius:8px;padding:8px;cursor:grab;box-shadow:0 2px 8px rgba(15,23,42,.04)}.pms175-calendar-card div{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.pms175-calendar-card strong{font-size:11px;color:#17242b;line-height:1.15}.pms175-calendar-card span{font-size:9px;font-weight:900;color:#3f6b50;background:#eef7f0;border-radius:999px;padding:2px 6px;white-space:nowrap}.pms175-calendar-card small{font-size:10px;color:#64748b;line-height:1.2}.pms175-calendar-card button{width:auto!important;margin:0!important;padding:4px 7px!important;font-size:10px!important}.pms175-modal-backdrop{position:fixed;inset:0;z-index:32000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms175-modal{width:min(1040px,96vw);max-height:90vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px;box-shadow:0 24px 72px rgba(15,23,42,.32)}.pms175-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.pms175-modal-head h3{margin:0;color:#0f172a}.pms175-table{overflow:auto}.pms175-table table{width:100%;border-collapse:collapse}.pms175-table th,.pms175-table td{border:1px solid #e2e8f0;padding:7px 8px;text-align:left;vertical-align:top;word-break:break-word}.pms175-table th{width:210px;background:#f8fafc;color:#334155}.pms175-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pms175-form label{display:grid;gap:4px;font-size:12px;font-weight:800;color:#475569}.pms175-form input,.pms175-form textarea{width:100%;box-sizing:border-box}.pms175-form textarea{min-height:88px}.pms175-form .pms175-actions{grid-column:1/-1}@media(max-width:760px){.pms175-form,.pms175-panel{grid-template-columns:1fr}}@media print{.pms175-panel,.pms175-row-actions{display:none!important}}`;
  }
  function bind(){
    document.querySelectorAll("[data-pms175-open]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); const p = button.getAttribute("data-pms175-open").split(":"); openRecord(p[0], p.slice(1).join(":")); });
    document.querySelectorAll("[data-pms175-edit]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); const p = button.getAttribute("data-pms175-edit").split(":"); editRecord(p[0], p.slice(1).join(":")); });
    document.querySelectorAll("[data-pms175-print]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); const p = button.getAttribute("data-pms175-print").split(":"); printRecord(p[0], p.slice(1).join(":")); });
    document.querySelectorAll("[data-pms175-excel]").forEach(button => button.onclick = event => { event.preventDefault(); event.stopPropagation(); const p = button.getAttribute("data-pms175-excel").split(":"); exportExcel(p[0], p.slice(1).join(":")); });
    document.querySelectorAll("[data-pms175-form]").forEach(form => form.onsubmit = event => { event.preventDefault(); submitEdit(form); });
    document.querySelectorAll("[data-pms175-open-calendar]").forEach(button => button.onclick = () => { if (window.current) current.page = "operativo"; if (typeof render === "function") render(); });
  }
  function globalClick(event){
    const raw = event.target && event.target.closest && event.target.closest("[data-pms128-foreign-open],[data-pms158-edit-foreign],[data-pms158-print-foreign]");
    if (!raw) return;
    const id = raw.getAttribute("data-pms128-foreign-open") || raw.getAttribute("data-pms158-edit-foreign") || raw.getAttribute("data-pms158-print-foreign");
    if (!id) return;
    if (raw.hasAttribute("data-pms158-print-foreign")) { event.preventDefault(); event.stopPropagation(); return printRecord("foreignEmployees", id); }
    if (/modifica/i.test(raw.textContent || "") || raw.hasAttribute("data-pms158-edit-foreign")) { event.preventDefault(); event.stopPropagation(); return editRecord("foreignEmployees", id); }
    event.preventDefault(); event.stopPropagation(); return openRecord("foreignEmployees", id);
  }
  function afterRender(){
    injectCss();
    decorateAccessRows();
    decorateCrmPage();
    decorateCalendar();
    bind();
  }
  function wrapRender(){
    if (typeof render !== "function" || render.__pms175Wrapped) return;
    const base = render;
    render = function(){
      const result = base.apply(this, arguments);
      setTimeout(afterRender, 20);
      setTimeout(afterRender, 180);
      return result;
    };
    render.__pms175Wrapped = true;
    try { window.render = render; } catch(error) {}
  }
  function install(){
    st();
    injectCss();
    wrapRender();
    document.addEventListener("click", globalClick, true);
    afterRender();
    [80, 250, 700, 1500].forEach(ms => setTimeout(afterRender, ms));
    window.PMS_V175_CRM_CALENDAR_ACCESSIBILITY_FIX = {version:VERSION, openRecord, editRecord, printRecord, exportExcel};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
