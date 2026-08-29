(function(){
  "use strict";
  const VERSION = "pms_v159_stable_large_dashboard_agenda";
  const KEY = "dashboardAgenda";
  const COLORS = ["blue", "green", "yellow", "red"];
  const LABELS = {blue:"Azzurro", green:"Verde", yellow:"Giallo", red:"Rosso"};
  let draggingId = "";

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state[KEY] = Array.isArray(state[KEY]) ? state[KEY] : [];
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio agenda non riuscito.");
      return false;
    }
  }
  function parseDate(value){
    const parts = String(value || "").slice(0, 10).split("-").map(Number);
    if (parts.length !== 3 || parts.some(function(n){ return !Number.isFinite(n); })) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  }
  function isoDate(date){
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function today(){ return isoDate(new Date()); }
  function addDays(value, days){
    const d = parseDate(value) || new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return isoDate(d);
  }
  function mondayOf(value){
    const d = parseDate(value) || new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return isoDate(d);
  }
  function weekStart(){
    st().settings.pms159DashboardWeekStart = mondayOf(st().settings.pms159DashboardWeekStart || st().settings.pms150DashboardWeekStart || today());
    return st().settings.pms159DashboardWeekStart;
  }
  function weekDays(){
    const start = weekStart();
    return Array.from({length:7}, function(_, index){ return addDays(start, index); });
  }
  function formatDate(value, long){
    const d = parseDate(value);
    if (!d) return "-";
    return d.toLocaleDateString("it-IT", long ? {weekday:"long", day:"2-digit", month:"long", year:"numeric"} : {day:"2-digit", month:"2-digit"});
  }
  function uid(){
    return "AGE-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  }
  function colorFor(item){
    const raw = String(item.calendarColor || item.color || item.priority || item.status || "").toLowerCase();
    if (raw.includes("red") || raw.includes("rosso") || raw.includes("urgent") || raw.includes("alta") || raw.includes("scad")) return "red";
    if (raw.includes("yellow") || raw.includes("giallo") || raw.includes("media") || raw.includes("attesa")) return "yellow";
    if (raw.includes("green") || raw.includes("verde") || raw.includes("fatto") || raw.includes("complet")) return "green";
    return "blue";
  }
  function nextColor(color){
    const index = COLORS.indexOf(color);
    return COLORS[(index < 0 ? 0 : index + 1) % COLORS.length];
  }
  function titleOf(item){
    return item.title || item.subject || item.client || item.supplier || "Evento agenda";
  }
  function notesOf(item){
    return item.notes || item.description || item.action || item.reminder || "";
  }
  function eventsFor(day){
    return st()[KEY].filter(function(item){ return String(item.date || "").slice(0, 10) === day; });
  }
  function eventCard(item){
    const color = colorFor(item);
    return '<article class="pms159-event pms159-' + esc(color) + '" draggable="true" data-pms159-event="' + esc(item.id || "") + '">' +
      '<strong>' + esc(titleOf(item)) + '</strong>' +
      '<span>' + esc(item.status || LABELS[color] || "Agenda") + '</span>' +
      (notesOf(item) ? '<small>' + esc(notesOf(item)).slice(0, 110) + '</small>' : "") +
      '<div class="pms159-event-actions">' +
        '<button type="button" data-pms159-print="' + esc(item.id || "") + '">Stampa</button>' +
        '<button type="button" data-pms159-color="' + esc(item.id || "") + '">Colore</button>' +
        '<button type="button" class="danger" data-pms159-delete="' + esc(item.id || "") + '">Elimina</button>' +
      '</div>' +
    '</article>';
  }
  function renderDay(day){
    const d = parseDate(day);
    const weekday = d ? d.toLocaleDateString("it-IT", {weekday:"long"}) : "";
    const events = eventsFor(day);
    return '<section class="pms159-day" data-pms159-day="' + esc(day) + '">' +
      '<header><strong>' + esc(weekday) + '</strong><span>' + esc(formatDate(day, false)) + '</span></header>' +
      '<div class="pms159-list">' + (events.map(eventCard).join("") || '<div class="pms159-empty">Libero</div>') + '</div>' +
      '<div class="pms159-new"><input data-pms159-new="' + esc(day) + '" placeholder="Scrivi una nota o appuntamento..."><button type="button" data-pms159-add="' + esc(day) + '">+</button></div>' +
    '</section>';
  }
  function renderAgenda(){
    const days = weekDays();
    return '<div id="pms159-dashboard-agenda" class="pms159-agenda">' +
      '<div class="pms159-head"><div><span>Agenda dashboard</span><h2>Agenda settimanale</h2><p>' + esc(formatDate(days[0], true)) + ' - ' + esc(formatDate(days[6], true)) + '</p></div><div class="pms159-actions"><button type="button" data-pms159-week="-7">Indietro</button><button type="button" data-pms159-today>Oggi</button><button type="button" data-pms159-week="7">Avanti</button><button type="button" data-pms159-print-week>Stampa settimana</button></div></div>' +
      '<div class="pms159-legend"><span class="pms159-dot blue"></span>Azzurro normale <span class="pms159-dot green"></span>Verde completato/ok <span class="pms159-dot yellow"></span>Giallo attenzione <span class="pms159-dot red"></span>Rosso urgente</div>' +
      '<div class="pms159-grid">' + days.map(renderDay).join("") + '</div>' +
    '</div>';
  }
  function mount(){
    if (!window.current || current.page !== "dashboard") return;
    const content = document.getElementById("content");
    if (!content) return;
    let agenda = document.getElementById("pms159-dashboard-agenda");
    if (!agenda) {
      content.insertAdjacentHTML("afterbegin", renderAgenda());
    }
    bind();
  }
  function refreshAgenda(){
    const old = document.getElementById("pms159-dashboard-agenda");
    if (old) old.outerHTML = renderAgenda();
    else mount();
    bind();
  }
  function addEvent(day){
    const input = document.querySelector('[data-pms159-new="' + day + '"]');
    const title = input ? input.value.trim() : "";
    if (!title) return;
    st()[KEY].unshift({id:uid(), date:day, title:title, status:"Aperto", calendarColor:"blue", createdAt:new Date().toISOString()});
    if (input) input.value = "";
    saveNow();
    refreshAgenda();
  }
  function findEvent(id){
    return st()[KEY].find(function(item){ return String(item.id || "") === String(id || ""); });
  }
  function setEventDate(id, day){
    const item = findEvent(id);
    if (!item) return;
    item.date = day;
    saveNow();
    refreshAgenda();
  }
  function deleteEvent(id){
    const item = findEvent(id);
    if (!item || !confirm("Eliminare questo evento dall'agenda?")) return;
    state[KEY] = st()[KEY].filter(function(row){ return String(row.id || "") !== String(id || ""); });
    saveNow();
    refreshAgenda();
  }
  function cycleColor(id){
    const item = findEvent(id);
    if (!item) return;
    item.calendarColor = nextColor(colorFor(item));
    saveNow();
    refreshAgenda();
  }
  function printEvent(id){
    const item = findEvent(id);
    if (!item) return;
    const html = '<div class="print-document"><div class="print-header"><div><h1>' + esc(titleOf(item)) + '</h1><strong>Parmitalia Distribution</strong></div><div class="print-meta">' + esc(formatDate(item.date, true)) + '</div></div><table class="print-table"><tr><th>Data</th><td>' + esc(formatDate(item.date, true)) + '</td><th>Stato</th><td>' + esc(item.status || "") + '</td></tr><tr><th>Colore</th><td>' + esc(LABELS[colorFor(item)]) + '</td><th>ID</th><td>' + esc(item.id || "") + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(notesOf(item) || "-") + '</td></tr></table></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function printWeek(){
    const days = weekDays();
    const body = days.map(function(day){
      const rows = eventsFor(day).map(function(item){
        return '<tr><td>' + esc(formatDate(day, true)) + '</td><td><strong>' + esc(titleOf(item)) + '</strong></td><td>' + esc(item.status || "") + '</td><td>' + esc(LABELS[colorFor(item)]) + '</td><td>' + esc(notesOf(item)) + '</td></tr>';
      }).join("");
      return rows || '<tr><td>' + esc(formatDate(day, true)) + '</td><td colspan="4">Nessun evento</td></tr>';
    }).join("");
    const html = '<div class="print-document"><div class="print-header"><div><h1>Agenda settimana</h1><strong>Parmitalia Distribution</strong></div><div class="print-meta">' + esc(formatDate(days[0], false)) + ' - ' + esc(formatDate(days[6], false)) + '</div></div><table class="print-table"><thead><tr><th>Data</th><th>Evento</th><th>Stato</th><th>Colore</th><th>Note</th></tr></thead><tbody>' + body + '</tbody></table></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function bind(){
    const root = document.getElementById("pms159-dashboard-agenda");
    if (!root || root.dataset.bound159 === "1") return;
    root.dataset.bound159 = "1";
    root.querySelectorAll("[data-pms159-week]").forEach(function(button){
      button.onclick = function(){
        st().settings.pms159DashboardWeekStart = mondayOf(addDays(weekStart(), Number(button.dataset.pms159Week || 0)));
        st().settings.pms150DashboardWeekStart = st().settings.pms159DashboardWeekStart;
        saveNow();
        refreshAgenda();
      };
    });
    root.querySelector("[data-pms159-today]").onclick = function(){
      st().settings.pms159DashboardWeekStart = mondayOf(today());
      st().settings.pms150DashboardWeekStart = st().settings.pms159DashboardWeekStart;
      saveNow();
      refreshAgenda();
    };
    root.querySelector("[data-pms159-print-week]").onclick = printWeek;
    root.querySelectorAll("[data-pms159-add]").forEach(function(button){ button.onclick = function(){ addEvent(button.dataset.pms159Add); }; });
    root.querySelectorAll("[data-pms159-new]").forEach(function(input){
      input.addEventListener("keydown", function(event){
        if (event.key === "Enter") {
          event.preventDefault();
          addEvent(input.dataset.pms159New);
        }
      });
    });
    root.querySelectorAll("[data-pms159-event]").forEach(function(card){
      card.addEventListener("dragstart", function(event){
        draggingId = card.dataset.pms159Event;
        event.dataTransfer.setData("application/x-pms159-agenda", draggingId);
      });
    });
    root.querySelectorAll("[data-pms159-day]").forEach(function(day){
      day.addEventListener("dragover", function(event){ event.preventDefault(); day.classList.add("is-over"); });
      day.addEventListener("dragleave", function(){ day.classList.remove("is-over"); });
      day.addEventListener("drop", function(event){
        event.preventDefault();
        day.classList.remove("is-over");
        const id = event.dataTransfer.getData("application/x-pms159-agenda") || draggingId;
        if (id) setEventDate(id, day.dataset.pms159Day);
      });
    });
    root.querySelectorAll("[data-pms159-delete]").forEach(function(button){ button.onclick = function(event){ event.stopPropagation(); deleteEvent(button.dataset.pms159Delete); }; });
    root.querySelectorAll("[data-pms159-color]").forEach(function(button){ button.onclick = function(event){ event.stopPropagation(); cycleColor(button.dataset.pms159Color); }; });
    root.querySelectorAll("[data-pms159-print]").forEach(function(button){ button.onclick = function(event){ event.stopPropagation(); printEvent(button.dataset.pms159Print); }; });
  }
  function injectCss(){
    if (document.getElementById("pms-v159-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v159-style";
    style.textContent = `
      #pms150-agenda-calendar{display:none!important}
      .pms159-agenda{grid-column:1/-1;background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px;margin:0 0 18px;box-shadow:0 8px 24px rgba(18,38,63,.07)}
      .pms159-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:10px}
      .pms159-head span{display:block;color:#1f4e78;font-size:12px;font-weight:900;text-transform:uppercase}
      .pms159-head h2{margin:2px 0;color:#17242b;font-size:26px;letter-spacing:0}
      .pms159-head p{margin:0;color:#64748b;font-size:13px}
      .pms159-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      .pms159-actions button,.pms159-new button{width:auto!important;margin:0!important;border:1px solid #cbd5e1!important;background:#eef3f8!important;color:#1f4e78!important;border-radius:6px!important;padding:8px 11px!important;font-weight:900!important}
      .pms159-legend{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin:8px 0 12px;color:#475569;font-size:12px;font-weight:800}
      .pms159-dot{width:12px;height:12px;border-radius:999px;display:inline-block;margin-right:-6px}.pms159-dot.blue{background:#38bdf8}.pms159-dot.green{background:#22c55e}.pms159-dot.yellow{background:#facc15}.pms159-dot.red{background:#ef4444}
      .pms159-grid{display:grid;grid-template-columns:repeat(7,minmax(150px,1fr));gap:9px;min-height:560px}
      .pms159-day{display:flex;flex-direction:column;min-height:560px;border:1px solid #dbe5ef;border-radius:8px;background:#fbfcfd;overflow:hidden}
      .pms159-day.is-over{border-color:#1f4e78;background:#eef6ff}
      .pms159-day header{padding:11px 12px;background:#f1f5f9;border-bottom:1px solid #dbe5ef}
      .pms159-day header strong{display:block;color:#25384a;font-size:13px;text-transform:uppercase}
      .pms159-day header span{color:#64748b;font-size:12px}
      .pms159-list{display:flex;flex-direction:column;gap:8px;padding:9px;flex:1}
      .pms159-event{display:grid;gap:4px;padding:10px;border:1px solid #d9e2ec;border-left:5px solid #38bdf8;border-bottom:4px solid #38bdf8;border-radius:8px;background:#fff;cursor:grab;box-shadow:0 2px 8px rgba(18,38,63,.05)}
      .pms159-event strong{font-size:13px;color:#17242b;line-height:1.25;word-break:break-word}
      .pms159-event span,.pms159-event small{font-size:11px;color:#64748b;font-weight:800;line-height:1.25}
      .pms159-blue{border-left-color:#38bdf8!important;border-bottom-color:#38bdf8!important;background:linear-gradient(180deg,#f0f9ff,#fff)!important}
      .pms159-green{border-left-color:#22c55e!important;border-bottom-color:#22c55e!important;background:linear-gradient(180deg,#f0fdf4,#fff)!important}
      .pms159-yellow{border-left-color:#facc15!important;border-bottom-color:#facc15!important;background:linear-gradient(180deg,#fefce8,#fff)!important}
      .pms159-red{border-left-color:#ef4444!important;border-bottom-color:#ef4444!important;background:linear-gradient(180deg,#fef2f2,#fff)!important}
      .pms159-event-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
      .pms159-event-actions button{width:auto!important;margin:0!important;padding:4px 7px!important;border:1px solid #cbd5e1!important;border-radius:6px!important;background:#fff!important;color:#1f4e78!important;font-size:10px!important;font-weight:900!important}
      .pms159-event-actions button.danger{border-color:#fecaca!important;color:#991b1b!important;background:#fff5f5!important}
      .pms159-empty{display:grid;place-items:center;min-height:80px;border:1px dashed #cbd5e1;border-radius:8px;color:#7a8794;font-size:12px;text-align:center;padding:8px}
      .pms159-new{display:grid;grid-template-columns:1fr 42px;gap:6px;padding:9px;border-top:1px solid #dbe5ef;background:#fff}
      .pms159-new input{min-width:0;height:38px;font-size:13px}
      @media(max-width:1360px){.pms159-grid{grid-template-columns:repeat(2,minmax(220px,1fr))}.pms159-day{min-height:320px}.pms159-grid{min-height:0}}
      @media(max-width:760px){.pms159-head{display:grid}.pms159-actions{justify-content:flex-start}.pms159-grid{grid-template-columns:1fr}.pms159-day{min-height:260px}}
      @media print{.pms159-agenda{display:none!important}}
    `;
    document.head.appendChild(style);
  }
  function afterRender(){
    st();
    injectCss();
    mount();
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !render.__pms159Wrapped) {
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(afterRender, 20);
      setTimeout(afterRender, 180);
      return result;
    };
    render.__pms159Wrapped = true;
  }
  injectCss();
  [50, 200, 600, 1400].forEach(function(ms){ setTimeout(afterRender, ms); });
  setInterval(function(){
    if (window.current && current.page === "dashboard" && !document.getElementById("pms159-dashboard-agenda")) mount();
  }, 1500);
  window.pmsV159StableLargeDashboardAgenda = {version:VERSION, mount:mount};
  console.info(VERSION + " loaded");
})();
