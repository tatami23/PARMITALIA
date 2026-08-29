(function(){
  "use strict";

  const VERSION = "PMS-V150-BANNER-AGENDA-PERSISTENCE-FIX";
  const DASH_KEY = "dashboardAgenda";
  const FALLBACK_KEY = "pms150_last_good_backup";
  const DAY_NAMES = ["Lunedi", "Martedi", "Mercoledi", "Giovedi", "Venerdi", "Sabato", "Domenica"];
  let diskTimer = null;
  let selectedDrag = null;

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.tasks = Array.isArray(state.tasks) ? state.tasks : [];
    state[DASH_KEY] = Array.isArray(state[DASH_KEY]) ? state[DASH_KEY] : [];
    return state;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function todayIso(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseIso(value){
    const parts = String(value || "").slice(0, 10).split("-").map(Number);
    if (parts.length !== 3 || parts.some(function(n){ return !Number.isFinite(n); })) return null;
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
  function weekStart(key){
    const settings = st().settings;
    settings[key] = mondayOf(settings[key] || todayIso());
    return settings[key];
  }
  function weekDays(key){
    const start = weekStart(key);
    return Array.from({length: 7}, function(_, index){ return addDays(start, index); });
  }
  function formatDate(value){
    const d = parseIso(value);
    return d ? d.toLocaleDateString("it-IT", {day:"2-digit", month:"2-digit"}) : "-";
  }
  function uid(prefix){
    return (typeof window.uid === "function" ? window.uid(prefix) : prefix + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000));
  }

  function snapshot(){
    const copy = JSON.parse(JSON.stringify(st()));
    copy.__pms150SavedAt = new Date().toISOString();
    copy.__pms150Version = VERSION;
    state.__pms150SavedAt = copy.__pms150SavedAt;
    state.__pms150Version = VERSION;
    return copy;
  }
  function scheduleDiskSave(payload){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.save !== "function") return;
    clearTimeout(diskTimer);
    diskTimer = setTimeout(function(){
      window.parmitaliaStorage.save(payload).catch(function(error){
        console.warn(VERSION + " disk save failed", error);
      });
    }, 450);
  }
  function persist(){
    const data = snapshot();
    try {
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch(error) {
      console.warn(VERSION + " localStorage primary save failed", error);
    }
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(data));
    } catch(error) {
      console.warn(VERSION + " localStorage fallback save failed", error);
    }
    scheduleDiskSave(data);
    return true;
  }
  function wrapSave(){
    if (window.__pms150SaveWrapped) return;
    window.__pms150SaveWrapped = true;
    const previous = typeof save === "function" ? save : null;
    if (previous) {
      save = function(){
        let result = true;
        try { result = previous.apply(this, arguments); }
        catch(error) { console.warn(VERSION + " base save failed", error); }
        persist();
        return result;
      };
    } else {
      window.save = persist;
      try { save = persist; } catch(error) {}
    }
  }
  async function loadDiskState(){
    if (!window.parmitaliaStorage || typeof window.parmitaliaStorage.load !== "function") return;
    try {
      const disk = await window.parmitaliaStorage.load();
      if (!disk || typeof disk !== "object") return;
      const localTime = Date.parse(st().__pms150SavedAt || "") || 0;
      const diskTime = Date.parse(disk.__pms150SavedAt || "") || 0;
      if (diskTime && diskTime > localTime) {
        Object.keys(state).forEach(function(key){ delete state[key]; });
        Object.assign(state, disk);
        if (typeof renderNav === "function") renderNav();
        if (typeof render === "function") render();
      }
    } catch(error) {
      console.warn(VERSION + " disk load failed", error);
    }
  }
  function bindAutosave(){
    window.addEventListener("beforeunload", persist);
    window.addEventListener("pagehide", persist);
    window.addEventListener("blur", persist);
    document.addEventListener("visibilitychange", function(){
      if (document.visibilityState === "hidden") persist();
    });
    setInterval(persist, 10000);
  }

  function ensureBanner(){
    const banner = document.getElementById("pms144-world-banner");
    if (!banner) return;
    const sign = banner.querySelector(".pms144-sign");
    if (sign) {
      sign.innerHTML = '<strong>ParmItalia Distribution</strong><span>Qualit&agrave; che nasce dal latte</span>';
    }
    const wrap = banner.querySelector(".pms144-globe-wrap");
    if (wrap && !wrap.querySelector(".pms150-orbit-glow")) {
      wrap.insertAdjacentHTML("beforeend", '<span class="pms150-orbit-glow"></span>');
    }
    const sat = banner.querySelector("[data-pms144-satellite-logo]");
    const logo = st().settings.logoUrl || "";
    if (sat && logo && sat.dataset.pms150Src !== logo) {
      sat.dataset.pms150Src = logo;
      sat.innerHTML = '<img src="' + esc(logo) + '" alt="ParmItalia">';
    }
    document.querySelectorAll("#pms148-entry-news").forEach(function(node){ node.remove(); });
  }

  function eventTitle(item){
    return item.title || item.subject || item.client || item.supplier || item.type || "Attivita";
  }
  function taskDate(item){
    return String(item.dueDate || item.scheduledDate || "").slice(0, 10);
  }
  function setTaskDate(id, date){
    const task = st().tasks.find(function(item){ return String(item.id) === String(id); });
    if (!task) return false;
    task.dueDate = date || "";
    task.scheduledDate = task.dueDate;
    persist();
    return true;
  }
  function setAgendaDate(id, date){
    const item = st()[DASH_KEY].find(function(row){ return String(row.id) === String(id); });
    if (!item) return false;
    item.date = date || todayIso();
    persist();
    return true;
  }
  function card(kind, item){
    const id = item.id || item.code || "";
    const date = kind === "task" ? taskDate(item) : item.date;
    const cls = kind === "task" && (item.completed || item.status === "Completato") ? " is-done" : "";
    return '<article class="pms150-card' + cls + '" draggable="true" data-pms150-kind="' + esc(kind) + '" data-pms150-id="' + esc(id) + '">' +
      '<strong>' + esc(eventTitle(item)) + '</strong>' +
      '<span>' + esc(kind === "task" ? (item.priority || item.type || "Backoffice") : (item.status || "Agenda")) + '</span>' +
      (date ? '<small>' + esc(formatDate(date)) + '</small>' : "") +
      '</article>';
  }
  function agendaItems(day){
    return st()[DASH_KEY].filter(function(item){ return String(item.date || "").slice(0, 10) === day; });
  }
  function taskItems(day){
    return st().tasks.filter(function(item){ return taskDate(item) === day && !item.completed; });
  }
  function dayColumn(day, index, mode){
    const items = mode === "agenda" ? agendaItems(day) : taskItems(day);
    return '<section class="pms150-day" data-pms150-drop="' + esc(mode) + '" data-pms150-day="' + esc(day) + '">' +
      '<header><strong>' + DAY_NAMES[index] + '</strong><span>' + esc(formatDate(day)) + '</span></header>' +
      '<div class="pms150-list">' + (items.map(function(item){ return card(mode === "agenda" ? "agenda" : "task", item); }).join("") || '<div class="pms150-empty">Libero</div>') + '</div>' +
      '<div class="pms150-quick"><input placeholder="' + (mode === "agenda" ? "Scrivi agenda..." : "Nuova attivita...") + '" data-pms150-new="' + esc(mode) + '" data-pms150-day="' + esc(day) + '"><button type="button" data-pms150-add="' + esc(mode) + '" data-pms150-day="' + esc(day) + '">+</button></div>' +
    '</section>';
  }
  function weekControls(mode, key, title, subtitle){
    const days = weekDays(key);
    return '<div class="pms150-head">' +
      '<div><span>' + esc(subtitle) + '</span><h3>' + esc(title) + '</h3><p>' + esc(formatDate(days[0])) + ' - ' + esc(formatDate(days[6])) + '</p></div>' +
      '<div class="pms150-actions"><button type="button" data-pms150-week="' + esc(mode) + '" data-step="-7">Indietro</button><button type="button" data-pms150-today="' + esc(mode) + '">Oggi</button><button type="button" data-pms150-week="' + esc(mode) + '" data-step="7">Avanti</button></div>' +
    '</div>';
  }
  function renderCalendar(mode){
    const key = mode === "agenda" ? "pms150DashboardWeekStart" : "pms150BackofficeWeekStart";
    const days = weekDays(key);
    const title = mode === "agenda" ? "Agenda dashboard" : "Calendario backoffice e segretariato";
    const subtitle = mode === "agenda" ? "Agenda sempre davanti agli occhi" : "Trascina le attivita nel giorno giusto";
    return '<div id="pms150-' + mode + '-calendar" class="pms150-calendar pms150-' + mode + '">' +
      weekControls(mode, key, title, subtitle) +
      '<div class="pms150-grid">' + days.map(function(day, index){ return dayColumn(day, index, mode); }).join("") + '</div>' +
      (mode === "task" ? renderTaskBacklog() : "") +
    '</div>';
  }
  function renderTaskBacklog(){
    const rows = st().tasks.filter(function(item){ return !taskDate(item) && !item.completed; });
    return '<div class="pms150-backlog"><h4>Da programmare</h4><div class="pms150-backlog-list">' +
      (rows.map(function(item){ return card("task", item); }).join("") || '<div class="pms150-empty">Nessuna attivita da programmare</div>') +
    '</div></div>';
  }
  function injectDashboardAgenda(){
    if (!window.current || current.page !== "dashboard") return;
    const content = document.getElementById("content");
    if (!content) return;
    const old = document.getElementById("pms150-agenda-calendar");
    if (old) old.remove();
    content.insertAdjacentHTML("afterbegin", renderCalendar("agenda"));
    bindCalendars();
  }
  function injectBackofficeCalendar(){
    if (!window.current || current.page !== "assistant") return;
    const content = document.getElementById("content");
    if (!content) return;
    const old = document.getElementById("pms150-task-calendar");
    if (old) old.remove();
    content.insertAdjacentHTML("afterbegin", renderCalendar("task"));
    bindCalendars();
  }
  function rerenderCurrentCalendar(mode){
    if (mode === "agenda") injectDashboardAgenda();
    else injectBackofficeCalendar();
  }
  function addQuick(mode, day){
    const input = document.querySelector('[data-pms150-new="' + mode + '"][data-pms150-day="' + day + '"]');
    const title = input ? input.value.trim() : "";
    if (!title) return;
    if (mode === "agenda") {
      st()[DASH_KEY].unshift({id:uid("AGE"), date:day, title:title, status:"Aperto", createdAt:new Date().toISOString()});
    } else {
      st().tasks.unshift({id:uid("TSK"), dueDate:day, scheduledDate:day, subject:title, type:"Promemoria", priority:"Media", status:"Da fare", completed:false, createdAt:new Date().toISOString()});
    }
    if (input) input.value = "";
    persist();
    rerenderCurrentCalendar(mode);
  }
  function bindCalendars(){
    document.querySelectorAll("[data-pms150-week]").forEach(function(button){
      if (button.dataset.bound150) return;
      button.dataset.bound150 = "1";
      button.onclick = function(){
        const mode = button.dataset.pms150Week;
        const key = mode === "agenda" ? "pms150DashboardWeekStart" : "pms150BackofficeWeekStart";
        st().settings[key] = mondayOf(addDays(weekStart(key), Number(button.dataset.step || 0)));
        persist();
        rerenderCurrentCalendar(mode);
      };
    });
    document.querySelectorAll("[data-pms150-today]").forEach(function(button){
      if (button.dataset.bound150) return;
      button.dataset.bound150 = "1";
      button.onclick = function(){
        const mode = button.dataset.pms150Today;
        const key = mode === "agenda" ? "pms150DashboardWeekStart" : "pms150BackofficeWeekStart";
        st().settings[key] = mondayOf(todayIso());
        persist();
        rerenderCurrentCalendar(mode);
      };
    });
    document.querySelectorAll("[data-pms150-add]").forEach(function(button){
      if (button.dataset.bound150) return;
      button.dataset.bound150 = "1";
      button.onclick = function(){ addQuick(button.dataset.pms150Add, button.dataset.pms150Day); };
    });
    document.querySelectorAll("[data-pms150-new]").forEach(function(input){
      if (input.dataset.bound150) return;
      input.dataset.bound150 = "1";
      input.addEventListener("keydown", function(event){
        if (event.key === "Enter") {
          event.preventDefault();
          addQuick(input.dataset.pms150New, input.dataset.pms150Day);
        }
      });
    });
    document.querySelectorAll(".pms150-card").forEach(function(node){
      if (node.dataset.bound150) return;
      node.dataset.bound150 = "1";
      node.addEventListener("dragstart", function(event){
        selectedDrag = {kind:node.dataset.pms150Kind, id:node.dataset.pms150Id};
        event.dataTransfer.setData("application/x-pms150", JSON.stringify(selectedDrag));
        event.dataTransfer.effectAllowed = "move";
      });
    });
    document.querySelectorAll("[data-pms150-drop]").forEach(function(day){
      if (day.dataset.bound150) return;
      day.dataset.bound150 = "1";
      day.addEventListener("dragover", function(event){
        event.preventDefault();
        day.classList.add("is-over");
      });
      day.addEventListener("dragleave", function(){ day.classList.remove("is-over"); });
      day.addEventListener("drop", function(event){
        event.preventDefault();
        day.classList.remove("is-over");
        let data = selectedDrag;
        try { data = JSON.parse(event.dataTransfer.getData("application/x-pms150")) || data; } catch(error) {}
        if (!data) return;
        const mode = day.dataset.pms150Drop;
        if (mode === "agenda" && data.kind === "agenda" && setAgendaDate(data.id, day.dataset.pms150Day)) rerenderCurrentCalendar("agenda");
        if (mode === "task" && data.kind === "task" && setTaskDate(data.id, day.dataset.pms150Day)) rerenderCurrentCalendar("task");
      });
    });
  }

  function injectCss(){
    let style = document.getElementById("pms-v150-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v150-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      #pms148-entry-news{display:none!important}
      #pms144-world-banner{display:grid!important;gap:7px!important;padding:8px 8px 10px!important;margin:8px 0 10px!important;background:linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.03))!important;border:0!important;border-bottom:1px solid rgba(255,255,255,.16)!important}
      #pms144-world-banner .pms144-globe-wrap{width:104px!important;height:90px!important}
      #pms144-world-banner .pms144-globe{width:64px!important;height:64px!important;animation:pms144-globe-turn 18s linear infinite!important}
      #pms144-world-banner .pms144-orbit{inset:19px -15px!important;border-radius:50%!important;animation:pms150-orbit 6.8s linear infinite!important}
      #pms144-world-banner .pms144-orbit:before{inset:0!important;border:1px solid rgba(180,220,255,.48)!important;box-shadow:0 0 14px rgba(125,190,255,.25)!important;transform:rotate(-13deg)!important}
      #pms144-world-banner .pms150-orbit-glow{position:absolute!important;inset:19px -15px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.20)!important;transform:rotate(-13deg)!important;pointer-events:none!important}
      #pms144-world-banner .pms144-satellite{top:-9px!important;width:28px!important;height:28px!important;margin-left:-14px!important;background:#fff!important;color:#1f4e78!important;box-shadow:0 0 10px rgba(255,255,255,.90),0 0 22px rgba(125,190,255,.55)!important}
      #pms144-world-banner .pms144-sign{display:grid!important;place-items:center!important;width:min(248px,94%)!important;min-height:46px!important;padding:8px 10px!important;border-radius:8px!important;background:linear-gradient(90deg,rgba(32,92,58,.95),rgba(255,255,255,.18) 48%,rgba(122,28,33,.92)),linear-gradient(180deg,#102334,#1f4e78)!important;border:1px solid rgba(255,255,255,.36)!important;box-shadow:0 0 18px rgba(255,255,255,.18),0 0 20px rgba(95,143,109,.25),0 8px 20px rgba(0,0,0,.18)!important}
      #pms144-world-banner .pms144-sign:before{display:none!important}
      #pms144-world-banner .pms144-sign strong{position:relative!important;z-index:1!important;color:#fff!important;font-size:13px!important;line-height:1.1!important;font-weight:950!important;letter-spacing:.02em!important;text-align:center!important;text-shadow:0 0 8px rgba(255,255,255,.82),0 1px 3px rgba(0,0,0,.6)!important}
      #pms144-world-banner .pms144-sign span{position:relative!important;z-index:1!important;color:#f7fbff!important;font-size:10px!important;line-height:1.2!important;font-weight:800!important;letter-spacing:0!important;text-align:center!important;text-transform:none!important;text-shadow:0 0 7px rgba(255,255,255,.65)!important;white-space:normal!important}
      .pms150-calendar{grid-column:1/-1;background:#fff;border:1px solid var(--line);border-radius:8px;padding:12px;margin:0 0 14px;box-shadow:0 6px 18px rgba(18,38,63,.05)}
      .pms150-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
      .pms150-head span{display:block;color:var(--primary);font-size:11px;font-weight:900;text-transform:uppercase}
      .pms150-head h3{margin:2px 0;color:var(--text);font-size:18px;text-transform:uppercase}
      .pms150-head p{margin:0;color:var(--muted);font-size:12px}
      .pms150-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}
      .pms150-actions button,.pms150-quick button{width:auto!important;margin:0!important;border:1px solid var(--line)!important;background:#eef3f8!important;color:var(--primary)!important;border-radius:6px!important;padding:7px 10px!important;font-weight:900!important}
      .pms150-grid{display:grid;grid-template-columns:repeat(7,minmax(118px,1fr));gap:7px;min-height:360px}
      .pms150-day{display:flex;flex-direction:column;min-height:360px;border:1px solid #dfe5ea;border-radius:8px;background:#fbfcfd;overflow:hidden}
      .pms150-day.is-over{border-color:#1f4e78;background:#eef6ff}
      .pms150-day header{padding:9px 10px;background:#f1f5f9;border-bottom:1px solid #dfe5ea}
      .pms150-day header strong{display:block;color:#25384a;font-size:11px;text-transform:uppercase}
      .pms150-day header span{color:#64748b;font-size:11px}
      .pms150-list{display:flex;flex-direction:column;gap:7px;padding:8px;flex:1}
      .pms150-card{display:grid;gap:3px;padding:8px;border:1px solid #d9e2ec;border-left:3px solid #1f4e78;border-radius:7px;background:#fff;cursor:grab;box-shadow:0 2px 8px rgba(18,38,63,.04)}
      .pms150-card strong{font-size:12px;color:#17242b;line-height:1.25;word-break:break-word}
      .pms150-card span,.pms150-card small{font-size:10px;color:#64748b;font-weight:800}
      .pms150-card.is-done{opacity:.55}
      .pms150-empty{display:grid;place-items:center;min-height:48px;border:1px dashed #cbd5e1;border-radius:7px;color:#7a8794;font-size:11px;text-align:center;padding:6px}
      .pms150-quick{display:grid;grid-template-columns:1fr 34px;gap:5px;padding:8px;border-top:1px solid #dfe5ea;background:#fff}
      .pms150-quick input{min-width:0;height:34px;font-size:12px}
      .pms150-backlog{margin-top:10px;border-top:1px solid var(--line);padding-top:10px}
      .pms150-backlog h4{margin:0 0 8px;color:#25384a;font-size:13px;text-transform:uppercase}
      .pms150-backlog-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:7px}
      @keyframes pms150-orbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @media(max-width:1260px){.pms150-grid{grid-template-columns:repeat(2,minmax(180px,1fr))}.pms150-day{min-height:230px}}
      @media(max-width:760px){.pms150-head{display:grid}.pms150-actions{justify-content:flex-start}.pms150-grid{grid-template-columns:1fr}}
      @media print{.pms150-calendar{display:none!important}}
    `;
  }
  function afterRender(){
    st();
    injectCss();
    ensureBanner();
    injectDashboardAgenda();
    injectBackofficeCalendar();
  }
  function init(){
    st();
    injectCss();
    wrapSave();
    bindAutosave();
    loadDiskState();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms150RenderWrapped) {
      window.__pms150RenderWrapped = true;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 40);
        setTimeout(afterRender, 160);
        return result;
      };
    }
    [50, 250, 800, 1600, 3000].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(function(){ ensureBanner(); bindCalendars(); }, 2200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.PMS_V150_BANNER_AGENDA_PERSISTENCE_FIX = {version:VERSION, persist:persist, afterRender:afterRender};
})();
