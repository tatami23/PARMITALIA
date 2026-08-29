(function(){
  "use strict";

  const VERSION = "pms_v192_backoffice_drag_admin_settings_fix";
  const AGENDA = "dashboardAgenda";
  let dragging150 = null;
  let savedScroll = null;

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.tasks = arr(state.tasks);
    state.approvals = arr(state.approvals);
    state.offers = arr(state.offers);
    state[AGENDA] = arr(state[AGENDA]);
    return state;
  }
  function uid192(prefix){
    if (typeof uid === "function") return uid(prefix);
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }
  function nextCode(prefix, list){
    if (typeof nextSequentialCode === "function") return nextSequentialCode(prefix, list || []);
    const year = new Date().getFullYear();
    const max = arr(list).reduce(function(n,row){
      const text = String(row && (row.code || row.id) || "");
      const match = text.match(/(\d+)$/);
      return match ? Math.max(n, Number(match[1])) : n;
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v192-backoffice-drag-admin-settings");
      }
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v192-backoffice-drag-admin-settings");
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function page(){ return typeof current !== "undefined" && current ? current.page : ""; }
  function rememberScroll(){
    const content = document.getElementById("content");
    const taskCalendar = document.getElementById("pms150-task-calendar");
    const agendaCalendar = document.getElementById("pms150-agenda-calendar");
    savedScroll = {
      x: window.scrollX || document.documentElement.scrollLeft || 0,
      y: window.scrollY || document.documentElement.scrollTop || 0,
      contentTop: content ? content.scrollTop : 0,
      contentLeft: content ? content.scrollLeft : 0,
      taskLeft: taskCalendar ? taskCalendar.scrollLeft : 0,
      agendaLeft: agendaCalendar ? agendaCalendar.scrollLeft : 0,
      active: document.activeElement && document.activeElement.id
    };
  }
  function restoreScroll(){
    const point = savedScroll;
    if (!point) return;
    requestAnimationFrame(function(){
      const content = document.getElementById("content");
      const taskCalendar = document.getElementById("pms150-task-calendar");
      const agendaCalendar = document.getElementById("pms150-agenda-calendar");
      window.scrollTo(point.x, point.y);
      if (content) {
        content.scrollTop = point.contentTop;
        content.scrollLeft = point.contentLeft;
      }
      if (taskCalendar) taskCalendar.scrollLeft = point.taskLeft;
      if (agendaCalendar) agendaCalendar.scrollLeft = point.agendaLeft;
      setTimeout(function(){
        const lateContent = document.getElementById("content");
        const lateTaskCalendar = document.getElementById("pms150-task-calendar");
        const lateAgendaCalendar = document.getElementById("pms150-agenda-calendar");
        window.scrollTo(point.x, point.y);
        if (lateContent) {
          lateContent.scrollTop = point.contentTop;
          lateContent.scrollLeft = point.contentLeft;
        }
        if (lateTaskCalendar) lateTaskCalendar.scrollLeft = point.taskLeft;
        if (lateAgendaCalendar) lateAgendaCalendar.scrollLeft = point.agendaLeft;
      }, 40);
    });
  }
  function stableRender(){
    rememberScroll();
    if (typeof render === "function") render();
    restoreScroll();
  }
  function setTaskDate(id, date){
    const item = st().tasks.find(function(row){ return String(row.id) === String(id); });
    if (!item) return false;
    item.dueDate = date || "";
    item.scheduledDate = date || "";
    item.calendarDate = date || "";
    item.updatedAt = new Date().toISOString();
    saveNow();
    return true;
  }
  function setAgendaDate(id, date){
    const item = st()[AGENDA].find(function(row){ return String(row.id) === String(id); });
    if (!item) return false;
    item.date = date || "";
    item.updatedAt = new Date().toISOString();
    saveNow();
    return true;
  }
  function dataFromTransfer(event){
    const dt = event && event.dataTransfer;
    let raw = "";
    try { raw = dt && dt.getData("application/x-pms150"); } catch(error) {}
    if (!raw) {
      try { raw = dt && dt.getData("text/plain"); } catch(error) {}
    }
    try {
      const parsed = JSON.parse(raw || "");
      if (parsed && parsed.kind && parsed.id) return parsed;
    } catch(error) {}
    return dragging150;
  }
  function onDragStart(event){
    const card = event.target && event.target.closest && event.target.closest(".pms150-card[data-pms150-kind][data-pms150-id]");
    if (!card) return;
    dragging150 = {kind:card.dataset.pms150Kind, id:card.dataset.pms150Id};
    rememberScroll();
    document.body.classList.add("pms192-dragging-backoffice");
    card.classList.add("pms192-source");
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-pms150", JSON.stringify(dragging150));
      event.dataTransfer.setData("text/plain", JSON.stringify(dragging150));
    }
  }
  function onDragEnd(){
    dragging150 = null;
    document.body.classList.remove("pms192-dragging-backoffice");
    document.querySelectorAll(".pms150-day.is-over,.pms192-source").forEach(function(node){
      node.classList.remove("is-over", "pms192-source");
    });
    restoreScroll();
  }
  function onDragOver(event){
    const day = event.target && event.target.closest && event.target.closest("[data-pms150-drop][data-pms150-day]");
    if (!day) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    day.classList.add("is-over");
  }
  function onDrop(event){
    const day = event.target && event.target.closest && event.target.closest("[data-pms150-drop][data-pms150-day]");
    if (!day) return;
    const data = dataFromTransfer(event);
    if (!data) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    document.querySelectorAll(".pms150-day.is-over").forEach(function(node){ node.classList.remove("is-over"); });
    const date = day.dataset.pms150Day;
    const mode = day.dataset.pms150Drop;
    let changed = false;
    if (mode === "task" && data.kind === "task") changed = setTaskDate(data.id, date);
    if (mode === "agenda" && data.kind === "agenda") changed = setAgendaDate(data.id, date);
    dragging150 = null;
    document.body.classList.remove("pms192-dragging-backoffice");
    if (changed) stableRender();
  }
  function addQuick(mode, day, input){
    const title = clean(input && input.value);
    if (!title) return false;
    if (mode === "agenda") {
      st()[AGENDA].unshift({id:uid192("AGE"), date:day, title:title, status:"Aperto", createdAt:new Date().toISOString()});
    } else {
      st().tasks.unshift({id:uid192("TSK"), dueDate:day, scheduledDate:day, calendarDate:day, subject:title, type:"Promemoria", priority:"Media", status:"Da fare", completed:false, createdAt:new Date().toISOString()});
    }
    if (input) input.value = "";
    saveNow();
    stableRender();
    return true;
  }
  function onQuickClick(event){
    const button = event.target && event.target.closest && event.target.closest("[data-pms150-add][data-pms150-day]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    const mode = button.dataset.pms150Add;
    const day = button.dataset.pms150Day;
    const input = document.querySelector('[data-pms150-new="' + mode + '"][data-pms150-day="' + day + '"]');
    addQuick(mode, day, input);
  }
  function onQuickKey(event){
    const input = event.target && event.target.closest && event.target.closest("[data-pms150-new][data-pms150-day]");
    if (!input || event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    addQuick(input.dataset.pms150New, input.dataset.pms150Day, input);
  }
  function clearTaskDate(id){
    if (!setTaskDate(id, "")) return;
    stableRender();
  }
  function decorateBackofficeCalendar(){
    const calendar = document.getElementById("pms150-task-calendar");
    if (!calendar) return;
    calendar.querySelectorAll('.pms150-card[data-pms150-kind="task"]').forEach(function(card){
      if (card.querySelector("[data-pms192-clear-task]")) return;
      const id = card.dataset.pms150Id || "";
      const task = st().tasks.find(function(row){ return String(row.id) === String(id); });
      if (!task || (!task.dueDate && !task.scheduledDate && !task.calendarDate)) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pms192-clear-task";
      button.setAttribute("data-pms192-clear-task", id);
      button.textContent = "Togli data";
      card.appendChild(button);
    });
    calendar.querySelectorAll("[data-pms192-clear-task]").forEach(function(button){
      if (button.dataset.pms192Bound === "1") return;
      button.dataset.pms192Bound = "1";
      button.onclick = function(event){
        event.preventDefault();
        event.stopPropagation();
        clearTaskDate(button.getAttribute("data-pms192-clear-task"));
      };
    });
  }
  function hideApprovalsModule(){
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      modules.forEach(function(mod){
        if (mod && mod.id === "approvals") mod.roles = ["__hidden__"];
      });
    }
    document.querySelectorAll('[data-page="approvals"]').forEach(function(node){ node.remove(); });
    document.querySelectorAll('[data-nav="approvals"]').forEach(function(node){
      node.setAttribute("data-nav", "settings");
      if (/Autorizzazioni|approvazioni/i.test(node.textContent || "")) node.textContent = "Impostazioni";
    });
    if (page() === "approvals") {
      current.page = "settings";
      stableRender();
    }
  }
  function approvalsPanel(){
    const pending = st().approvals.filter(function(row){ return row.status === "In attesa" || row.status === "In attesa approvazione"; }).length;
    const rows = st().approvals.map(function(row){
      const canAct = page() === "settings" && typeof current !== "undefined" && current.role === "admin" && (row.status === "In attesa" || row.status === "In attesa approvazione");
      return '<tr><td><span class="code-block">' + esc(row.id || "-") + '</span></td><td><strong>' + esc(row.type || "Richiesta") + '</strong><br><small>' + esc([row.client,row.supplier,row.product].filter(Boolean).join(" / ")) + '</small></td><td>' + esc(row.requestedBy || "-") + '</td><td>' + esc(row.status || "-") + '</td><td>' + (canAct ? '<div class="approval-actions"><button class="inline-button" data-pms192-approve="' + esc(row.id) + '">Approva</button><button class="inline-danger" data-pms192-reject="' + esc(row.id) + '">Respingi</button></div>' : "-") + '</td></tr>';
    }).join("");
    return '<div class="card pms192-approvals-panel"><div class="section-header"><h3>Autorizzazioni Admin</h3><span class="badge ' + (pending ? "warn" : "success") + '">' + pending + ' in attesa</span></div><div class="approval-banner"><strong>Dentro Impostazioni</strong>Le richieste admin restano qui: controllo offerte, blocchi procedura e approvazioni Carlo/Admin.</div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Richiesta</th><th>Richiedente</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="empty">Nessuna autorizzazione registrata.</td></tr>') + '</tbody></table></div></div>';
  }
  function approveRequest(id){
    const req = st().approvals.find(function(row){ return String(row.id) === String(id); });
    if (!req) return alert("Richiesta non trovata.");
    req.status = "Approvata";
    req.approvedBy = (typeof current !== "undefined" && current.user) || "Admin";
    req.approvedAt = new Date().toISOString();
    if (req.payload && !req.offerId) {
      const code = nextCode("OFF", state.offers);
      state.offers.unshift(Object.assign({}, req.payload, {id:code, code:code, approvalId:req.id, adminAuthorization:"Approvata", status:req.payload.status || "Bozza"}));
      req.offerId = code;
    }
    saveNow();
    stableRender();
  }
  function rejectRequest(id){
    const req = st().approvals.find(function(row){ return String(row.id) === String(id); });
    if (!req) return alert("Richiesta non trovata.");
    req.status = "Respinta";
    req.rejectedBy = (typeof current !== "undefined" && current.user) || "Admin";
    req.rejectedAt = new Date().toISOString();
    saveNow();
    stableRender();
  }
  function bindApprovals(){
    document.querySelectorAll("[data-pms192-approve]").forEach(function(button){
      if (button.dataset.pms192Bound === "1") return;
      button.dataset.pms192Bound = "1";
      button.onclick = function(){ approveRequest(button.getAttribute("data-pms192-approve")); };
    });
    document.querySelectorAll("[data-pms192-reject]").forEach(function(button){
      if (button.dataset.pms192Bound === "1") return;
      button.dataset.pms192Bound = "1";
      button.onclick = function(){ rejectRequest(button.getAttribute("data-pms192-reject")); };
    });
  }
  function decorate(){
    st();
    injectCss();
    hideApprovalsModule();
    decorateBackofficeCalendar();
    bindApprovals();
  }
  function injectCss(){
    let style = document.getElementById("pms-v192-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v192-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      #pms150-task-calendar{overflow-x:auto!important;overflow-y:visible!important;contain:layout paint!important;scrollbar-gutter:stable}
      #pms150-task-calendar .pms150-grid{grid-template-columns:repeat(7,minmax(164px,1fr))!important;align-items:stretch!important}
      #pms150-task-calendar .pms150-day{min-width:0!important;position:relative!important;isolation:isolate!important}
      #pms150-task-calendar .pms150-list{min-height:168px!important;align-content:start!important}
      #pms150-task-calendar .pms150-card{position:relative!important;min-height:72px!important;touch-action:none!important;user-select:none!important}
      #pms150-task-calendar .pms150-card.pms192-source{opacity:.62!important;outline:2px solid #1f4e78!important}
      body.pms192-dragging-backoffice{overscroll-behavior:contain!important}
      body.pms192-dragging-backoffice #content{scroll-behavior:auto!important}
      #pms150-task-calendar .pms150-day.is-over{outline:3px solid #1f4e78!important;outline-offset:-3px!important;background:#eef6ff!important}
      .pms192-clear-task{width:auto!important;margin:5px 0 0!important;padding:4px 7px!important;border:1px solid #cbd5e1!important;border-radius:6px!important;background:#fff!important;color:#1f4e78!important;font-size:10px!important;font-weight:900!important;cursor:pointer!important}
      .pms192-approvals-panel{grid-column:1/-1;margin-top:14px}
      .pms192-approvals-panel .section-header{margin-bottom:8px}
      @media(max-width:1260px){#pms150-task-calendar .pms150-grid{grid-template-columns:repeat(2,minmax(240px,1fr))!important}}
      @media(max-width:760px){#pms150-task-calendar .pms150-grid{grid-template-columns:1fr!important}}
    `;
  }

  document.addEventListener("dragstart", onDragStart, true);
  document.addEventListener("dragend", onDragEnd, true);
  document.addEventListener("dragover", onDragOver, true);
  document.addEventListener("drop", onDrop, true);
  document.addEventListener("click", onQuickClick, true);
  document.addEventListener("keydown", onQuickKey, true);

  const baseRenderSettings = typeof renderSettings === "function" ? renderSettings : null;
  if (baseRenderSettings && !baseRenderSettings.__pms192Wrapped) {
    renderSettings = function(){
      const html = baseRenderSettings.apply(this, arguments);
      if (html.includes("pms192-approvals-panel")) return html;
      return html + approvalsPanel();
    };
    renderSettings.__pms192Wrapped = true;
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !baseRenderNav.__pms192Wrapped) {
    renderNav = function(){
      const result = baseRenderNav.apply(this, arguments);
      setTimeout(hideApprovalsModule, 20);
      return result;
    };
    renderNav.__pms192Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms192Wrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      setTimeout(decorate, 0);
      return result;
    };
    bindPageActions.__pms192Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms192Wrapped) {
    render = function(){
      hideApprovalsModule();
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 30);
      setTimeout(decorate, 180);
      return result;
    };
    render.__pms192Wrapped = true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  [80,260,700,1400].forEach(function(ms){ setTimeout(decorate, ms); });
  window.PMS_V192_BACKOFFICE_DRAG_ADMIN_SETTINGS_FIX = {version:VERSION, decorate:decorate};
  console.info(VERSION + " loaded");
})();
