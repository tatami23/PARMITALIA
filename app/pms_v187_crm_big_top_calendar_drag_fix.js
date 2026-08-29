(function(){
  "use strict";

  const VERSION = "pms_v187_crm_big_top_calendar_drag_fix";
  const CRM_MODULES = ["communications","tasks","crmActivities","crmOpportunities","opportunities"];
  const WEEK_KEY = "pms187CrmWeekStart";
  const DAYS = ["Lunedi","Martedi","Mercoledi","Giovedi","Venerdi","Sabato","Domenica"];
  let selected = null;

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function st(){ window.state = window.state || {}; state.settings = state.settings || {}; return state; }
  function page(){ return window.current && current.page || ""; }
  function todayIso(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseIso(value){
    const parts = String(value || "").slice(0, 10).split("-").map(Number);
    if (parts.length !== 3 || parts.some(n => !Number.isFinite(n))) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  }
  function isoDate(date){
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(value, days){
    const d = parseIso(value) || new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return isoDate(d);
  }
  function mondayOf(value){
    const d = parseIso(value) || new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return isoDate(d);
  }
  function weekStart(){
    st().settings[WEEK_KEY] = mondayOf(st().settings[WEEK_KEY] || todayIso());
    return st().settings[WEEK_KEY];
  }
  function weekDays(){
    const start = weekStart();
    return Array.from({length:7}, (_, index) => addDays(start, index));
  }
  function formatDate(value){
    const d = parseIso(value);
    return d ? d.toLocaleDateString("it-IT", {day:"2-digit", month:"2-digit"}) : "-";
  }
  function recordId(record){
    return String(record && (record.id || record.code || record.protocol || record.practiceCode || record.uid || record.email || record.name) || "");
  }
  function recordTitle(record){
    return clean(record && (record.title || record.subject || record.type || record.company || record.client || record.supplier || record.name || record.fullName || record.linkedTo || record.message || recordId(record))) || "Attivita CRM";
  }
  function recordMeta(record){
    return clean([record.client || record.company || record.supplier || record.linkedTo, record.priority || record.status || record.channel || record.type].filter(Boolean).join(" - "));
  }
  function moduleLabel(module){
    const mod = Array.isArray(window.modules) ? modules.find(item => item && item.id === module) : null;
    const labels = {communications:"CRM",tasks:"Attivita",crmActivities:"Attivita CRM",crmOpportunities:"Opportunita",opportunities:"Opportunita"};
    return (mod && mod.label) || labels[module] || module;
  }
  function crmDate(record){
    return String(record && (record.scheduledDate || record.operationalDate || record.calendarDate || record.dueDate || "") || "").slice(0, 10);
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
  function findRecord(module, id){
    return arr(st()[module]).find(item => recordId(item) === String(id || "")) || null;
  }
  function findAny(id, preferred){
    const modules = Array.from(new Set([].concat(preferred || [], [page()], CRM_MODULES))).filter(Boolean);
    for (const module of modules) {
      const record = findRecord(module, id);
      if (record) return {module, record, id:recordId(record)};
    }
    return null;
  }
  function records(){
    const out = [];
    CRM_MODULES.forEach(module => arr(st()[module]).forEach(record => {
      const id = recordId(record);
      if (id) out.push({module, record, id});
    }));
    return out;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v187-crm-calendar");
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function setDate(module, id, date){
    const found = findAny(id, [module]);
    if (!found) return false;
    const day = String(date || "").slice(0, 10);
    const record = found.record;
    record.scheduledDate = day;
    record.operationalDate = day;
    record.calendarDate = day;
    if (found.module === "tasks" || Object.prototype.hasOwnProperty.call(record, "dueDate")) record.dueDate = day;
    record.updatedAt = new Date().toISOString();
    saveNow();
    return true;
  }
  function rowId(row){
    const explicit = row && row.querySelector("[data-pms187-crm],[data-pms186-crm],[data-pms175-crm],[data-id],[data-edit]");
    if (explicit) {
      const raw = explicit.getAttribute("data-pms187-crm") || explicit.getAttribute("data-pms186-crm") || explicit.getAttribute("data-pms175-crm");
      const data = decode(raw);
      if (data) return data.id;
      return explicit.getAttribute("data-id") || explicit.getAttribute("data-edit") || "";
    }
    const first = row && row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function card(entry, compact){
    const raw = encode(entry.module, entry.id);
    return '<article class="pms187-card" draggable="true" tabindex="0" data-pms187-crm="' + esc(raw) + '">' +
      '<div class="pms187-card-head"><strong>' + esc(recordTitle(entry.record)) + '</strong><span>' + esc(moduleLabel(entry.module)) + '</span></div>' +
      (compact ? "" : '<small>' + esc(recordMeta(entry.record) || "Da programmare") + '</small>') +
      (crmDate(entry.record) ? '<button type="button" data-pms187-clear="' + esc(raw) + '">Togli data</button>' : "") +
    '</article>';
  }
  function dayColumn(day, index){
    const rows = records().filter(entry => crmDate(entry.record) === day);
    return '<section class="pms187-day" data-pms187-day="' + esc(day) + '">' +
      '<header><strong>' + DAYS[index] + '</strong><span>' + esc(formatDate(day)) + '</span></header>' +
      '<div class="pms187-day-list">' + (rows.map(entry => card(entry, true)).join("") || '<div class="pms187-empty">Libero</div>') + '</div>' +
    '</section>';
  }
  function calendarHtml(){
    const days = weekDays();
    const unscheduled = records().filter(entry => !crmDate(entry.record));
    return '<section id="pms187-crm-top-calendar" class="pms187-calendar">' +
      '<div class="pms187-head"><div><span>CRM commerciale</span><h3>Calendario CRM</h3><p>Trascina attivita, comunicazioni, opportunita e aziende nel giorno corretto.</p></div>' +
      '<div class="pms187-actions"><button type="button" data-pms187-week="-7">Indietro</button><button type="button" data-pms187-today>Oggi</button><button type="button" data-pms187-week="7">Avanti</button><button type="button" data-pms187-open-operativo>Apri operativo</button></div></div>' +
      '<div class="pms187-selected" data-pms187-selected>Nessuna scheda selezionata</div>' +
      '<div class="pms187-grid">' + days.map(dayColumn).join("") + '</div>' +
      '<div class="pms187-backlog"><h4>Da trascinare nel calendario</h4><div class="pms187-backlog-list">' + (unscheduled.map(entry => card(entry, false)).join("") || '<div class="pms187-empty">Nessuna attivita CRM da programmare</div>') + '</div></div>' +
    '</section>';
  }
  function calendarSignature(){
    return weekStart() + "|" + records().map(entry => [entry.module, entry.id, crmDate(entry.record), recordTitle(entry.record), recordMeta(entry.record)].join("~")).join("|");
  }
  function setTransfer(event, module, id){
    selected = {module, id};
    const raw = encode(module, id);
    if (event && event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-pms187-crm", raw);
      event.dataTransfer.setData("application/x-pms186-crm", raw);
      event.dataTransfer.setData("application/x-pms175-crm", raw);
      event.dataTransfer.setData("text/plain", "PMSCRM:" + raw);
    }
    updateSelectedLabel();
  }
  function dataFromEvent(event){
    const dt = event && event.dataTransfer;
    const raw = dt && (dt.getData("application/x-pms187-crm") || dt.getData("application/x-pms186-crm") || dt.getData("application/x-pms175-crm") || dt.getData("text/plain"));
    return decode(raw) || selected;
  }
  function updateSelectedLabel(){
    const box = document.querySelector("[data-pms187-selected]");
    if (!box) return;
    if (!selected) {
      box.textContent = "Nessuna scheda selezionata";
      box.classList.remove("is-active");
      return;
    }
    const found = findAny(selected.id, [selected.module]);
    box.textContent = found ? "Selezionata: " + moduleLabel(found.module) + " - " + recordTitle(found.record) + ". Ora clicca un giorno o trascinala." : "Scheda selezionata";
    box.classList.add("is-active");
  }
  function installCalendar(){
    if (page() !== "communications") return;
    const content = document.getElementById("content");
    if (!content) return;
    document.querySelectorAll("#pms186-crm-free-drag-panel,#pms175-crm-calendar-panel").forEach(node => node.remove());
    const sig = calendarSignature();
    const old = document.getElementById("pms187-crm-top-calendar");
    if (old && old.dataset.pms187Sig === sig) {
      if (content.firstElementChild !== old) content.insertBefore(old, content.firstChild);
      return;
    }
    if (old) old.remove();
    content.insertAdjacentHTML("afterbegin", calendarHtml());
    const fresh = document.getElementById("pms187-crm-top-calendar");
    if (fresh) fresh.dataset.pms187Sig = sig;
  }
  function decorateRows(){
    if (page() !== "communications") return;
    document.querySelectorAll("#content table tbody tr").forEach(row => {
      const id = rowId(row);
      const found = findAny(id, ["communications"]);
      if (!found) return;
      const raw = encode(found.module, found.id);
      row.setAttribute("draggable", "true");
      row.setAttribute("data-pms187-crm", raw);
      row.classList.add("pms187-row");
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (cell && !cell.querySelector('[data-pms187-crm="' + raw.replace(/"/g, '\\"') + '"]')) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "inline-button pms187-row-button";
        btn.textContent = "Calendario";
        btn.title = "Trascina o clicca per selezionare";
        btn.setAttribute("draggable", "true");
        btn.setAttribute("data-pms187-crm", raw);
        cell.appendChild(btn);
      }
    });
  }
  function bind(){
    document.querySelectorAll("[data-pms187-crm]").forEach(node => {
      if (node.dataset.pms187DragBound === "1") return;
      node.dataset.pms187DragBound = "1";
      node.setAttribute("draggable", "true");
      node.addEventListener("dragstart", event => {
        const data = decode(node.getAttribute("data-pms187-crm"));
        if (data) setTransfer(event, data.module, data.id);
      });
      node.addEventListener("click", event => {
        if (event.target.closest("[data-pms187-clear]")) return;
        const data = decode(node.getAttribute("data-pms187-crm"));
        if (!data) return;
        selected = data;
        document.querySelectorAll(".pms187-card.is-selected,.pms187-row.is-selected").forEach(el => el.classList.remove("is-selected"));
        node.classList.add("is-selected");
        updateSelectedLabel();
      });
    });
    document.querySelectorAll("[data-pms187-day]").forEach(day => {
      if (day.dataset.pms187DropBound === "1") return;
      day.dataset.pms187DropBound = "1";
      day.addEventListener("dragover", event => {
        event.preventDefault();
        day.classList.add("is-over");
      });
      day.addEventListener("dragleave", () => day.classList.remove("is-over"));
      day.addEventListener("drop", event => {
        const data = dataFromEvent(event);
        if (!data) return;
        event.preventDefault();
        event.stopPropagation();
        day.classList.remove("is-over");
        if (setDate(data.module, data.id, day.getAttribute("data-pms187-day"))) {
          selected = null;
          rerender();
        }
      });
      day.addEventListener("click", event => {
        if (event.target.closest(".pms187-card,button")) return;
        if (selected && setDate(selected.module, selected.id, day.getAttribute("data-pms187-day"))) {
          selected = null;
          rerender();
        }
      });
    });
    document.querySelectorAll("[data-pms187-clear]").forEach(button => {
      if (button.dataset.pms187ClearBound === "1") return;
      button.dataset.pms187ClearBound = "1";
      button.onclick = event => {
        event.preventDefault();
        event.stopPropagation();
        const data = decode(button.getAttribute("data-pms187-clear"));
        if (data && setDate(data.module, data.id, "")) rerender();
      };
    });
    document.querySelectorAll("[data-pms187-week]").forEach(button => {
      if (button.dataset.pms187WeekBound === "1") return;
      button.dataset.pms187WeekBound = "1";
      button.onclick = () => {
        st().settings[WEEK_KEY] = mondayOf(addDays(weekStart(), Number(button.getAttribute("data-pms187-week") || 0)));
        saveNow();
        rerender();
      };
    });
    const today = document.querySelector("[data-pms187-today]");
    if (today && today.dataset.pms187TodayBound !== "1") {
      today.dataset.pms187TodayBound = "1";
      today.onclick = () => { st().settings[WEEK_KEY] = mondayOf(todayIso()); saveNow(); rerender(); };
    }
    const openOp = document.querySelector("[data-pms187-open-operativo]");
    if (openOp && openOp.dataset.pms187OpenBound !== "1") {
      openOp.dataset.pms187OpenBound = "1";
      openOp.onclick = () => { if (window.current) current.page = "operativo"; if (typeof render === "function") render(); };
    }
  }
  function injectCss(){
    let style = document.getElementById("pms-v187-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v187-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      #content>#pms187-crm-top-calendar{order:-9999}
      body:has(#pms187-crm-top-calendar) #pms186-crm-free-drag-panel,body:has(#pms187-crm-top-calendar) #pms175-crm-calendar-panel{display:none!important}
      .pms187-calendar{display:grid;gap:12px;margin:0 0 16px;padding:14px;background:#fff;border:1px solid #cfd8df;border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,.06)}
      .pms187-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px}
      .pms187-head span{display:block;color:#2f7d57;font-size:11px;font-weight:900;text-transform:uppercase}
      .pms187-head h3{margin:2px 0;color:#17242b;font-size:22px;letter-spacing:0;text-transform:uppercase}
      .pms187-head p{margin:0;color:#64748b;font-size:13px}
      .pms187-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
      .pms187-actions button{width:auto!important;margin:0!important;border:1px solid #cfd8df!important;background:#eef7f0!important;color:#204b35!important;border-radius:6px!important;padding:8px 11px!important;font-weight:900!important}
      .pms187-selected{border:1px dashed #cbd5e1;background:#f8fafc;color:#64748b;border-radius:8px;padding:9px 11px;font-size:12px;font-weight:800}
      .pms187-selected.is-active{border-color:#2f7d57;background:#f2fbf5;color:#204b35}
      .pms187-grid{display:grid;grid-template-columns:repeat(7,minmax(138px,1fr));gap:8px;min-height:360px}
      .pms187-day{display:flex;flex-direction:column;min-height:360px;background:#fbfcfd;border:1px solid #d7dee8;border-radius:8px;overflow:hidden}
      .pms187-day.is-over{outline:2px solid #2f7d57;outline-offset:-2px;background:#f2fbf5}
      .pms187-day header{padding:10px;border-bottom:1px solid #d7dee8;background:#f1f5f3}
      .pms187-day header strong{display:block;color:#17242b;font-size:12px;text-transform:uppercase}
      .pms187-day header span{display:block;color:#64748b;font-size:11px;margin-top:2px}
      .pms187-day-list{display:flex;flex-direction:column;gap:7px;padding:8px;flex:1}
      .pms187-card{display:grid;gap:5px;padding:8px;background:#fff;border:1px solid #d7dee8;border-left:4px solid #2f7d57;border-radius:8px;cursor:grab;box-shadow:0 2px 8px rgba(15,23,42,.04)}
      .pms187-card.is-selected,.pms187-row.is-selected{outline:2px solid #2f7d57!important;background:#f2fbf5!important}
      .pms187-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
      .pms187-card strong{font-size:11.5px;color:#17242b;line-height:1.18;word-break:break-word}
      .pms187-card span{font-size:9px;font-weight:900;color:#315a43;background:#eef7f0;border-radius:999px;padding:2px 6px;white-space:nowrap}
      .pms187-card small{font-size:10.5px;color:#64748b;line-height:1.2}
      .pms187-card button,.pms187-row-button{width:auto!important;margin:0!important}
      .pms187-empty{display:grid;place-items:center;min-height:58px;border:1px dashed #cbd5e1;border-radius:7px;color:#7a8794;font-size:11px;text-align:center;padding:8px}
      .pms187-backlog{border-top:1px solid #e2e8f0;padding-top:10px}
      .pms187-backlog h4{margin:0 0 8px;color:#17242b;font-size:13px;text-transform:uppercase}
      .pms187-backlog-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px}
      .pms187-row{cursor:grab}
      @media(max-width:1260px){.pms187-grid{grid-template-columns:repeat(2,minmax(220px,1fr))}.pms187-day{min-height:230px}}
      @media(max-width:760px){.pms187-head{display:grid}.pms187-actions{justify-content:flex-start}.pms187-grid{grid-template-columns:1fr}}
      @media print{.pms187-calendar{display:none!important}}
    `;
  }
  function rerender(){
    if (page() === "communications") {
      installCalendar();
      decorateRows();
      bind();
      updateSelectedLabel();
    } else if (typeof render === "function") {
      render();
    }
  }
  function afterRender(){
    st();
    injectCss();
    installCalendar();
    decorateRows();
    bind();
    updateSelectedLabel();
  }
  function wrapRender(){
    if (typeof render !== "function" || render.__pms187Wrapped) return;
    const base = render;
    render = function(){
      const result = base.apply(this, arguments);
      setTimeout(afterRender, 20);
      setTimeout(afterRender, 180);
      return result;
    };
    render.__pms187Wrapped = true;
    try { window.render = render; } catch(error) {}
  }
  function install(){
    injectCss();
    wrapRender();
    afterRender();
    [80, 250, 800, 1600].forEach(ms => setTimeout(afterRender, ms));
    setInterval(afterRender, 1200);
    window.PMS_V187_CRM_BIG_TOP_CALENDAR_DRAG_FIX = {version:VERSION, afterRender, setDate};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
})();
