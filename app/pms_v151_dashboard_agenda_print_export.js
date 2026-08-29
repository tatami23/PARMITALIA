(function(){
  "use strict";

  const VERSION = "PMS-V151-DASHBOARD-AGENDA-PRINT-EXPORT";
  const AGENDA_KEY = "dashboardAgenda";

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state[AGENDA_KEY] = Array.isArray(state[AGENDA_KEY]) ? state[AGENDA_KEY] : [];
    return state;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function text(value){
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
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
  function formatDate(value, long){
    const d = parseIso(value);
    if (!d) return "-";
    return d.toLocaleDateString("it-IT", long ? {weekday:"long", day:"2-digit", month:"long", year:"numeric"} : {day:"2-digit", month:"2-digit", year:"numeric"});
  }
  function safeName(value){
    return text(value || "agenda").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 80) || "agenda";
  }
  function eventTitle(item){
    return item.title || item.subject || item.client || item.supplier || "Evento agenda";
  }
  function eventNotes(item){
    return item.notes || item.description || item.action || item.reminder || "";
  }
  function agenda(){
    return st()[AGENDA_KEY];
  }
  function findEvent(id){
    return agenda().find(function(item){ return String(item.id || "") === String(id || ""); });
  }
  function dashboardWeekDays(){
    const domDays = Array.from(document.querySelectorAll("#pms150-agenda-calendar [data-pms150-day]"))
      .map(function(node){ return node.dataset.pms150Day; })
      .filter(Boolean);
    const unique = Array.from(new Set(domDays)).slice(0, 7);
    if (unique.length) return unique;
    const start = mondayOf(st().settings.pms150DashboardWeekStart || isoDate(new Date()));
    return Array.from({length:7}, function(_, index){ return addDays(start, index); });
  }
  function eventsForDay(day){
    return agenda().filter(function(item){ return String(item.date || "").slice(0, 10) === day; });
  }
  function weekEvents(){
    const days = dashboardWeekDays();
    const rows = [];
    days.forEach(function(day){
      eventsForDay(day).forEach(function(item){ rows.push({day:day, item:item}); });
    });
    return rows;
  }
  function printHtml(title, body){
    return '<div class="print-document pms151-print">' +
      '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(st().settings.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>Agenda dashboard</span></div><div class="print-meta">' + esc(new Date().toLocaleString("it-IT")) + '</div></div>' +
      body +
      '<div class="print-footer">Parmitalia Management System - Agenda dashboard</div>' +
    '</div>';
  }
  function eventTable(item, day){
    return '<table class="print-table pms151-table"><tbody>' +
      '<tr><th>ID</th><td>' + esc(item.id || "-") + '</td><th>Data</th><td>' + esc(formatDate(day || item.date, true)) + '</td></tr>' +
      '<tr><th>Titolo</th><td colspan="3"><strong>' + esc(eventTitle(item)) + '</strong></td></tr>' +
      '<tr><th>Stato</th><td>' + esc(item.status || "Aperto") + '</td><th>Creato</th><td>' + esc(item.createdAt ? new Date(item.createdAt).toLocaleString("it-IT") : "-") + '</td></tr>' +
      '<tr><th>Note</th><td colspan="3">' + esc(eventNotes(item) || "-") + '</td></tr>' +
    '</tbody></table>';
  }
  function printEvent(id){
    const item = findEvent(id);
    if (!item) return alert("Evento agenda non trovato.");
    const html = printHtml("Evento agenda - " + eventTitle(item), eventTable(item, item.date));
    if (typeof openPrint === "function") openPrint(html);
    else {
      const root = document.createElement("div");
      root.id = "print-root";
      root.innerHTML = html;
      document.body.appendChild(root);
      window.print();
      setTimeout(function(){ root.remove(); }, 1200);
    }
  }
  function printWeek(){
    const days = dashboardWeekDays();
    const body = days.map(function(day){
      const events = eventsForDay(day);
      return '<h2 class="pms151-day-title">' + esc(formatDate(day, true)) + '</h2>' +
        (events.length ? events.map(function(item){ return eventTable(item, day); }).join("") : '<p class="pms151-empty-print">Nessun evento registrato.</p>');
    }).join("");
    const html = printHtml("Agenda settimana", body);
    if (typeof openPrint === "function") openPrint(html);
    else window.print();
  }
  function download(filename, content, type){
    const blob = new Blob([content], {type:type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 800);
  }
  function excelDocument(title, rows){
    const bodyRows = rows.map(function(row){
      return '<tr>' + row.map(function(cell){ return '<td>' + esc(cell) + '</td>'; }).join("") + '</tr>';
    }).join("");
    return '<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif}table{border-collapse:collapse}th,td{border:1px solid #9ca3af;padding:7px;vertical-align:top}th{background:#1f4e78;color:#fff}</style></head><body><h2>' + esc(title) + '</h2><table><thead><tr><th>Data</th><th>ID</th><th>Titolo</th><th>Stato</th><th>Note</th><th>Creato</th></tr></thead><tbody>' + bodyRows + '</tbody></table></body></html>';
  }
  function rowFor(item, day){
    return [
      formatDate(day || item.date, false),
      item.id || "",
      eventTitle(item),
      item.status || "Aperto",
      eventNotes(item),
      item.createdAt ? new Date(item.createdAt).toLocaleString("it-IT") : ""
    ];
  }
  function exportEvent(id){
    const item = findEvent(id);
    if (!item) return alert("Evento agenda non trovato.");
    const html = excelDocument("Evento agenda - " + eventTitle(item), [rowFor(item, item.date)]);
    download("parmitalia-agenda-evento-" + safeName(eventTitle(item)) + ".xls", html, "application/vnd.ms-excel;charset=utf-8");
  }
  function exportWeek(){
    const rows = weekEvents().map(function(entry){ return rowFor(entry.item, entry.day); });
    const days = dashboardWeekDays();
    const html = excelDocument("Agenda settimana " + formatDate(days[0], false) + " - " + formatDate(days[6], false), rows.length ? rows : [["", "", "Nessun evento registrato", "", "", ""]]);
    download("parmitalia-agenda-settimana-" + days[0] + ".xls", html, "application/vnd.ms-excel;charset=utf-8");
  }
  function decorateAgenda(){
    const root = document.getElementById("pms150-agenda-calendar");
    if (!root) return;
    const actions = root.querySelector(".pms150-head .pms150-actions");
    if (actions && !actions.querySelector("[data-pms151-print-week]")) {
      actions.insertAdjacentHTML("beforeend",
        '<button type="button" data-pms151-print-week>PDF settimana</button>' +
        '<button type="button" data-pms151-export-week>Excel settimana</button>'
      );
    }
    root.querySelectorAll('.pms150-card[data-pms150-kind="agenda"]').forEach(function(card){
      if (card.querySelector(".pms151-card-actions")) return;
      const id = card.dataset.pms150Id || "";
      card.insertAdjacentHTML("beforeend",
        '<div class="pms151-card-actions">' +
          '<button type="button" data-pms151-print-event="' + esc(id) + '">PDF</button>' +
          '<button type="button" data-pms151-export-event="' + esc(id) + '">Excel</button>' +
        '</div>'
      );
    });
    bindAgendaButtons(root);
  }
  function bindAgendaButtons(root){
    root.querySelectorAll("[data-pms151-print-week]").forEach(function(button){
      if (button.dataset.pms151Bound) return;
      button.dataset.pms151Bound = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); printWeek(); };
    });
    root.querySelectorAll("[data-pms151-export-week]").forEach(function(button){
      if (button.dataset.pms151Bound) return;
      button.dataset.pms151Bound = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); exportWeek(); };
    });
    root.querySelectorAll("[data-pms151-print-event]").forEach(function(button){
      if (button.dataset.pms151Bound) return;
      button.dataset.pms151Bound = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); printEvent(button.dataset.pms151PrintEvent); };
    });
    root.querySelectorAll("[data-pms151-export-event]").forEach(function(button){
      if (button.dataset.pms151Bound) return;
      button.dataset.pms151Bound = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); exportEvent(button.dataset.pms151ExportEvent); };
    });
  }
  function injectCss(){
    let style = document.getElementById("pms-v151-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v151-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms151-card-actions{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
      .pms151-card-actions button{width:auto!important;margin:0!important;padding:4px 7px!important;border:1px solid #cbd5e1!important;border-radius:6px!important;background:#f8fafc!important;color:#1f4e78!important;font-size:10px!important;font-weight:900!important;cursor:pointer!important}
      .pms151-card-actions button:hover{background:#eef6ff!important}
      #pms150-agenda-calendar [data-pms151-print-week],#pms150-agenda-calendar [data-pms151-export-week]{background:#1f4e78!important;color:#fff!important;border-color:#1f4e78!important}
      #print-root .pms151-print h2.pms151-day-title{margin:6mm 0 2mm;color:#1f4e78;font-size:12pt;text-transform:uppercase}
      #print-root .pms151-table{width:100%;border-collapse:collapse;margin:2mm 0 5mm}
      #print-root .pms151-table th,#print-root .pms151-table td{border:1px solid #cbd5e1;padding:2.2mm;font-size:9pt;vertical-align:top}
      #print-root .pms151-table th{background:#eef3f8;color:#1f4e78;text-align:left;width:25mm}
      #print-root .pms151-empty-print{border:1px dashed #cbd5e1;padding:4mm;color:#64748b}
      @media print{.pms151-card-actions{display:none!important}}
    `;
  }
  function afterRender(){
    injectCss();
    decorateAgenda();
  }
  function init(){
    st();
    injectCss();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms151RenderWrapped) {
      window.__pms151RenderWrapped = true;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 80);
        setTimeout(afterRender, 220);
        return result;
      };
    }
    [100, 400, 1200, 2400].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(afterRender, 2500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.PMS_V151_DASHBOARD_AGENDA_PRINT_EXPORT = {version:VERSION, printWeek:printWeek, exportWeek:exportWeek, printEvent:printEvent, exportEvent:exportEvent};
})();
