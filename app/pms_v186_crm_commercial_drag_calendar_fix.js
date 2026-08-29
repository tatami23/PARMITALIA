(function(){
  "use strict";

  const VERSION = "pms_v186_crm_commercial_drag_calendar_fix";
  const CRM_MODULES = ["communications","tasks","crmActivities","crmOpportunities","opportunities"];
  let selectedCrm = null;

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function st(){ window.state = window.state || {}; state.settings = state.settings || {}; return state; }
  function currentPage(){ return window.current && current.page || ""; }
  function recordId(record){
    return String(record && (record.id || record.code || record.protocol || record.practiceCode || record.uid || record.email || record.name) || "");
  }
  function recordTitle(record){
    return clean(record && (record.title || record.subject || record.type || record.company || record.client || record.supplier || record.name || record.fullName || record.linkedTo || record.message || recordId(record))) || "Attivita CRM";
  }
  function moduleLabel(module){
    const mod = Array.isArray(window.modules) ? modules.find(item => item && item.id === module) : null;
    const labels = {
      communications:"CRM",
      tasks:"Attivita",
      crmActivities:"Attivita CRM",
      crmOpportunities:"Opportunita",
      opportunities:"Opportunita"
    };
    return (mod && mod.label) || labels[module] || module;
  }
  function crmDate(record){
    return String(record && (record.scheduledDate || record.operationalDate || record.calendarDate || record.dueDate || record.date) || "").slice(0, 10);
  }
  function findRecord(module, id){
    return arr(st()[module]).find(item => recordId(item) === String(id || "")) || null;
  }
  function findAnywhere(id, preferred){
    const modules = Array.from(new Set([].concat(preferred || [], [currentPage()], CRM_MODULES))).filter(Boolean);
    for (const module of modules) {
      const record = findRecord(module, id);
      if (record) return {module, record, id:recordId(record)};
    }
    return null;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v186-crm-calendar-drag");
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function encode(module, id){ return module + ":" + id; }
  function decode(raw){
    raw = String(raw || "").trim();
    if (!raw) return null;
    if (raw.indexOf("PMSCRM:") === 0) raw = raw.slice(7);
    try {
      const json = JSON.parse(raw);
      if (json && json.module && json.id) return {module:String(json.module), id:String(json.id)};
    } catch(error) {}
    const parts = raw.split(":");
    if (parts.length < 2) return null;
    return {module:parts.shift(), id:parts.join(":")};
  }
  function payloadFromEvent(event){
    const dt = event && event.dataTransfer;
    const raw = dt && (dt.getData("application/x-pms186-crm") || dt.getData("application/x-pms175-crm") || dt.getData("text/plain"));
    return decode(raw) || selectedCrm;
  }
  function setTransfer(event, module, id){
    selectedCrm = {module, id};
    const raw = encode(module, id);
    if (!event.dataTransfer) return;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/x-pms186-crm", raw);
    event.dataTransfer.setData("application/x-pms175-crm", raw);
    event.dataTransfer.setData("text/plain", "PMSCRM:" + raw);
  }
  function setCrmDate(module, id, date){
    const found = findAnywhere(id, [module]);
    if (!found) return false;
    const record = found.record;
    const day = String(date || "").slice(0, 10);
    record.scheduledDate = day;
    record.operationalDate = day;
    record.calendarDate = day;
    if (found.module === "tasks" || Object.prototype.hasOwnProperty.call(record, "dueDate")) record.dueDate = day;
    record.updatedAt = new Date().toISOString();
    saveNow();
    return true;
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector("[data-pms186-crm],[data-pms175-crm],[data-id],[data-edit],[data-pms175-open]");
    if (explicit) {
      const raw = explicit.getAttribute("data-pms186-crm") || explicit.getAttribute("data-pms175-crm");
      if (raw) {
        const data = decode(raw);
        if (data) return data.id;
      }
      return explicit.getAttribute("data-id") || explicit.getAttribute("data-edit") || explicit.getAttribute("data-pms175-open") || "";
    }
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function isCrmPage(){
    const page = currentPage();
    return CRM_MODULES.includes(page) || page === "communications";
  }
  function cardHtml(entry, compact){
    const record = entry.record;
    const id = recordId(record);
    const raw = encode(entry.module, id);
    const meta = clean(record.client || record.supplier || record.company || record.linkedTo || record.status || record.priority || "");
    return '<article class="pms186-crm-card" draggable="true" tabindex="0" data-pms186-crm="' + esc(raw) + '">' +
      '<div><strong>' + esc(recordTitle(record)) + '</strong><span>' + esc(moduleLabel(entry.module)) + '</span></div>' +
      (compact ? "" : '<small>' + esc(meta) + '</small>') +
      (crmDate(record) ? '<button type="button" data-pms186-clear="' + esc(raw) + '">Togli data</button>' : "") +
    '</article>';
  }
  function allCrmRecords(){
    const out = [];
    CRM_MODULES.forEach(module => arr(st()[module]).forEach(record => {
      const id = recordId(record);
      if (id) out.push({module, record, id});
    }));
    return out;
  }
  function decorateCrmRows(){
    if (!isCrmPage()) return;
    const page = currentPage();
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table tbody tr").forEach(row => {
      const id = rowId(row);
      const found = findAnywhere(id, [page]);
      if (!found) return;
      const raw = encode(found.module, found.id);
      row.setAttribute("draggable", "true");
      row.setAttribute("data-pms186-crm", raw);
      row.classList.add("pms186-draggable-row");
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (cell && !cell.querySelector('[data-pms186-crm="' + raw.replace(/"/g, '\\"') + '"]')) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "inline-button pms186-drag-button";
        button.textContent = "Calendario";
        button.title = "Trascina questa attivita nel calendario";
        button.setAttribute("draggable", "true");
        button.setAttribute("data-pms186-crm", raw);
        cell.appendChild(button);
      }
    });
    if (!document.getElementById("pms186-crm-free-drag-panel")) {
      const entries = allCrmRecords().slice(0, 30);
      content.insertAdjacentHTML("afterbegin", '<section id="pms186-crm-free-drag-panel" class="pms186-panel"><div><strong>CRM commerciale da programmare</strong><small>Trascina una scheda o una riga direttamente nel calendario.</small></div><button type="button" class="secondary-button" data-pms186-open-calendar>Apri calendario</button><div class="pms186-strip">' + entries.map(entry => cardHtml(entry, false)).join("") + '</div></section>');
    }
  }
  function decorateOperationalCalendar(){
    const page = document.querySelector(".pms136-page");
    if (!page) return;
    page.querySelectorAll(".pms186-crm-card,#pms186-operational-backlog").forEach(node => node.remove());
    const entries = allCrmRecords();
    page.querySelectorAll(".pms136-day").forEach(day => {
      const date = day.getAttribute("data-pms136-day");
      const list = day.querySelector(".pms136-day-list") || day;
      entries.filter(entry => crmDate(entry.record) === date).forEach(entry => list.insertAdjacentHTML("beforeend", cardHtml(entry, true)));
    });
    const backlog = entries.filter(entry => !crmDate(entry.record));
    const host = page.querySelector(".pms136-backlogs");
    if (host) {
      host.insertAdjacentHTML("beforeend", '<section id="pms186-operational-backlog" class="pms136-backlog pms186-backlog"><header><h3>CRM commerciale da programmare</h3><span>' + backlog.length + '</span></header><div class="pms136-backlog-list">' + (backlog.map(entry => cardHtml(entry, false)).join("") || '<div class="pms136-empty">Nessuna attivita CRM da programmare.</div>') + '</div></section>');
    }
  }
  function decoratePms150Calendars(){
    document.querySelectorAll(".pms150-calendar").forEach(calendar => {
      calendar.querySelectorAll(".pms186-crm-card").forEach(node => node.remove());
      const entries = allCrmRecords();
      calendar.querySelectorAll("[data-pms150-day]").forEach(day => {
        const date = day.getAttribute("data-pms150-day");
        const list = day.querySelector(".pms150-list") || day;
        entries.filter(entry => crmDate(entry.record) === date).forEach(entry => list.insertAdjacentHTML("beforeend", cardHtml(entry, true)));
      });
    });
  }
  function bindDragSources(){
    document.querySelectorAll("[data-pms186-crm],[data-pms175-crm]").forEach(node => {
      if (node.dataset.pms186DragBound === "1") return;
      node.dataset.pms186DragBound = "1";
      node.setAttribute("draggable", "true");
      node.addEventListener("dragstart", event => {
        const data = decode(node.getAttribute("data-pms186-crm") || node.getAttribute("data-pms175-crm"));
        if (!data) return;
        setTransfer(event, data.module, data.id);
        node.classList.add("pms186-dragging");
      });
      node.addEventListener("dragend", () => node.classList.remove("pms186-dragging"));
    });
  }
  function bindDrops(){
    document.querySelectorAll(".pms136-day,[data-pms150-day]").forEach(day => {
      if (day.dataset.pms186DropBound === "1") return;
      day.dataset.pms186DropBound = "1";
      day.addEventListener("dragover", event => {
        if (!selectedCrm && event.dataTransfer && !Array.from(event.dataTransfer.types || []).includes("application/x-pms186-crm")) return;
        event.preventDefault();
        day.classList.add("pms186-over");
      });
      day.addEventListener("dragleave", () => day.classList.remove("pms186-over"));
      day.addEventListener("drop", event => {
        const data = payloadFromEvent(event);
        if (!data) return;
        const date = day.getAttribute("data-pms136-day") || day.getAttribute("data-pms150-day");
        if (!date) return;
        event.preventDefault();
        event.stopPropagation();
        day.classList.remove("pms186-over");
        if (setCrmDate(data.module, data.id, date)) {
          selectedCrm = null;
          if (typeof render === "function") render();
          setTimeout(afterRender, 120);
        }
      });
    });
  }
  function bindClearAndOpen(){
    document.querySelectorAll("[data-pms186-clear]").forEach(button => {
      if (button.dataset.pms186ClearBound === "1") return;
      button.dataset.pms186ClearBound = "1";
      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const data = decode(button.getAttribute("data-pms186-clear"));
        if (data && setCrmDate(data.module, data.id, "")) {
          if (typeof render === "function") render();
          setTimeout(afterRender, 120);
        }
      };
    });
    document.querySelectorAll("[data-pms186-open-calendar]").forEach(button => {
      if (button.dataset.pms186OpenBound === "1") return;
      button.dataset.pms186OpenBound = "1";
      button.onclick = () => { if (window.current) current.page = "operativo"; if (typeof render === "function") render(); };
    });
  }
  function injectCss(){
    let style = document.getElementById("pms-v186-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v186-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms186-panel{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;margin:0 0 12px;padding:12px;border:1px solid #d7dee8;border-radius:8px;background:#fff}
      .pms186-panel strong{display:block;color:#0f172a}.pms186-panel small{display:block;color:#64748b;margin-top:3px}
      .pms186-strip{grid-column:1/-1;display:flex;gap:8px;overflow:auto;padding-top:4px}
      .pms186-crm-card{display:grid;gap:5px;min-width:190px;background:#fff;border:1px solid #d7dee8;border-left:4px solid #2f7d57;border-radius:8px;padding:8px;cursor:grab;box-shadow:0 2px 8px rgba(15,23,42,.04)}
      .pms186-crm-card:active,.pms186-draggable-row:active{cursor:grabbing}
      .pms186-crm-card div{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}
      .pms186-crm-card strong{font-size:11px;color:#17242b;line-height:1.15;word-break:break-word}
      .pms186-crm-card span{font-size:9px;font-weight:900;color:#315a43;background:#eef7f0;border-radius:999px;padding:2px 6px;white-space:nowrap}
      .pms186-crm-card small{font-size:10px;color:#64748b;line-height:1.2}
      .pms186-crm-card button,.pms186-drag-button{width:auto!important;margin:0!important}
      .pms186-draggable-row{cursor:grab}
      .pms186-over{outline:2px solid #2f7d57!important;outline-offset:-2px;background:#f2fbf5!important}
      .pms186-dragging{opacity:.72}
      @media(max-width:760px){.pms186-panel{grid-template-columns:1fr}}
    `;
  }
  function afterRender(){
    st();
    injectCss();
    decorateCrmRows();
    decorateOperationalCalendar();
    decoratePms150Calendars();
    bindDragSources();
    bindDrops();
    bindClearAndOpen();
  }
  function wrapRender(){
    if (typeof render !== "function" || render.__pms186Wrapped) return;
    const base = render;
    render = function(){
      const result = base.apply(this, arguments);
      setTimeout(afterRender, 30);
      setTimeout(afterRender, 180);
      return result;
    };
    render.__pms186Wrapped = true;
    try { window.render = render; } catch(error) {}
  }
  function install(){
    injectCss();
    wrapRender();
    afterRender();
    [80, 250, 800, 1600].forEach(ms => setTimeout(afterRender, ms));
    setInterval(afterRender, 2500);
    window.PMS_V186_CRM_COMMERCIAL_DRAG_CALENDAR_FIX = {version:VERSION, afterRender, setCrmDate};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
})();
