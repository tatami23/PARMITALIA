(function(){
  "use strict";

  var VERSION = "pms_v198_backoffice_drag_text_stabilizer";
  var selected = null;
  var savedScroll = null;
  var renderTimer = null;
  var cleanupTimer = null;

  function arr(value){ return Array.isArray(value) ? value : []; }
  function st(){
    window.state = window.state || {};
    window.state.settings = window.state.settings || {};
    window.state.tasks = arr(window.state.tasks);
    window.state.dashboardAgenda = arr(window.state.dashboardAgenda);
    window.state.orders = arr(window.state.orders);
    window.state.intermediations = arr(window.state.intermediations);
    return window.state;
  }
  function same(a, b){ return String(a == null ? "" : a) === String(b == null ? "" : b); }
  function iso(value){ return String(value || "").slice(0, 10); }
  function now(){ return new Date().toISOString(); }

  function saveNow(){
    try {
      if (typeof save === "function") save();
    } catch(error) {
      console.warn(VERSION + " base save failed", error);
    }
    try {
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v198-backoffice-drag");
      } else if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v198-backoffice-drag");
      }
    } catch(error) {
      console.warn(VERSION + " hardened save failed", error);
    }
  }

  function rememberScroll(){
    var content = document.getElementById("content");
    var taskCal = document.getElementById("pms150-task-calendar");
    var agendaCal = document.getElementById("pms150-agenda-calendar");
    var opPage = document.querySelector(".pms136-page");
    savedScroll = {
      x: window.scrollX || document.documentElement.scrollLeft || 0,
      y: window.scrollY || document.documentElement.scrollTop || 0,
      bodyTop: document.body ? document.body.scrollTop : 0,
      htmlTop: document.documentElement ? document.documentElement.scrollTop : 0,
      contentTop: content ? content.scrollTop : 0,
      contentLeft: content ? content.scrollLeft : 0,
      taskLeft: taskCal ? taskCal.scrollLeft : 0,
      agendaLeft: agendaCal ? agendaCal.scrollLeft : 0,
      opTop: opPage ? opPage.scrollTop : 0
    };
  }
  function restoreScroll(){
    var point = savedScroll;
    if (!point) return;
    function apply(){
      var content = document.getElementById("content");
      var taskCal = document.getElementById("pms150-task-calendar");
      var agendaCal = document.getElementById("pms150-agenda-calendar");
      var opPage = document.querySelector(".pms136-page");
      window.scrollTo(point.x, point.y);
      if (document.documentElement) document.documentElement.scrollTop = point.htmlTop;
      if (document.body) document.body.scrollTop = point.bodyTop;
      if (content) {
        content.scrollTop = point.contentTop;
        content.scrollLeft = point.contentLeft;
      }
      if (taskCal) taskCal.scrollLeft = point.taskLeft;
      if (agendaCal) agendaCal.scrollLeft = point.agendaLeft;
      if (opPage) opPage.scrollTop = point.opTop;
    }
    requestAnimationFrame(function(){
      apply();
      setTimeout(apply, 35);
      setTimeout(apply, 120);
    });
  }
  function stableRender(){
    rememberScroll();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(function(){
      try {
        if (typeof render === "function") render();
      } catch(error) {
        console.warn(VERSION + " render failed", error);
      }
      afterDom();
      restoreScroll();
    }, 0);
  }

  function cardPayload(card){
    if (!card) return null;
    if (card.matches(".pms150-card[data-pms150-kind][data-pms150-id]")) {
      return {calendar:"pms150", kind:card.dataset.pms150Kind, id:card.dataset.pms150Id};
    }
    if (card.matches(".pms136-card[data-pms136-type][data-pms136-id]")) {
      return {calendar:"pms136", type:card.dataset.pms136Type, id:card.dataset.pms136Id};
    }
    return null;
  }
  function payloadFromTransfer(event){
    var dt = event && event.dataTransfer;
    var types = ["application/x-pms198-backoffice", "application/x-pms150", "application/x-pms136", "text/plain"];
    for (var i = 0; i < types.length; i += 1) {
      try {
        var raw = dt && dt.getData(types[i]);
        if (!raw) continue;
        var data = JSON.parse(raw);
        if (data && (data.id || data.kind || data.type)) {
          if (!data.calendar && (data.kind === "task" || data.kind === "agenda")) data.calendar = "pms150";
          if (!data.calendar && (data.type === "order" || data.type === "deal")) data.calendar = "pms136";
          return data;
        }
      } catch(error) {}
    }
    return selected;
  }
  function markSelected(card, payload){
    document.querySelectorAll(".pms198-selected,.pms198-drag-source").forEach(function(node){
      node.classList.remove("pms198-selected", "pms198-drag-source");
    });
    selected = payload || cardPayload(card);
    if (card && selected) card.classList.add("pms198-selected");
  }

  function taskDate(item, date){
    item.dueDate = date || "";
    item.scheduledDate = date || "";
    item.calendarDate = date || "";
    item.updatedAt = now();
  }
  function setPms150Date(kind, id, date){
    var data = st();
    if (kind === "task") {
      var task = data.tasks.find(function(row){ return same(row.id, id) || same(row.code, id); });
      if (!task) return false;
      taskDate(task, date);
      saveNow();
      return true;
    }
    if (kind === "agenda") {
      var entry = data.dashboardAgenda.find(function(row){ return same(row.id, id) || same(row.code, id); });
      if (!entry) return false;
      entry.date = date || "";
      entry.updatedAt = now();
      saveNow();
      return true;
    }
    return false;
  }
  function scheduledDate(item, date){
    item.scheduledDate = date || "";
    item.operationalDate = date || "";
    item.loadingDate = item.loadingDate || date || "";
    item.updatedAt = now();
  }
  function setPms136Date(type, id, date){
    var data = st();
    var list = type === "order" ? data.orders : data.intermediations;
    var item = list.find(function(row){
      return same(row.id, id) || same(row.code, id) || same(row.orderCode, id);
    });
    if (!item) return false;
    scheduledDate(item, date);
    saveNow();
    return true;
  }

  function dropTarget(event){
    var target = event.target && event.target.closest;
    if (!target) return null;
    var pms150 = event.target.closest("[data-pms150-drop][data-pms150-day]");
    if (pms150) return {calendar:"pms150", node:pms150, day:pms150.dataset.pms150Day, mode:pms150.dataset.pms150Drop};
    var pms136 = event.target.closest(".pms136-day[data-pms136-day]");
    if (pms136) return {calendar:"pms136", node:pms136, day:pms136.dataset.pms136Day};
    return null;
  }
  function movePayload(target, payload){
    if (!target || !payload) return false;
    var changed = false;
    if (target.calendar === "pms150") {
      var kind = payload.kind || (payload.calendar === "pms150" ? payload.type : "");
      if (target.mode === "task" && kind === "task") changed = setPms150Date("task", payload.id, target.day);
      if (target.mode === "agenda" && kind === "agenda") changed = setPms150Date("agenda", payload.id, target.day);
    }
    if (target.calendar === "pms136") {
      var type = payload.type || "";
      if (type === "order" || type === "deal") changed = setPms136Date(type, payload.id, target.day);
    }
    return changed;
  }

  function onDragStart(event){
    var card = event.target && event.target.closest && event.target.closest(".pms150-card[data-pms150-kind][data-pms150-id],.pms136-card[data-pms136-type][data-pms136-id]");
    var payload = cardPayload(card);
    if (!payload) return;
    rememberScroll();
    selected = payload;
    document.body.classList.add("pms198-dragging");
    card.classList.add("pms198-drag-source", "pms198-selected");
    if (event.dataTransfer) {
      var text = JSON.stringify(payload);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-pms198-backoffice", text);
      event.dataTransfer.setData(payload.calendar === "pms150" ? "application/x-pms150" : "application/x-pms136", text);
      event.dataTransfer.setData("text/plain", text);
    }
  }
  function onDragOver(event){
    var target = dropTarget(event);
    if (!target) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    target.node.classList.add("pms198-over", "is-over");
  }
  function onDragLeave(event){
    var target = dropTarget(event);
    if (!target || target.node.contains(event.relatedTarget)) return;
    target.node.classList.remove("pms198-over", "is-over");
  }
  function onDrop(event){
    var target = dropTarget(event);
    if (!target) return;
    var payload = payloadFromTransfer(event);
    if (!payload) return;
    rememberScroll();
    var changed = movePayload(target, payload);
    target.node.classList.remove("pms198-over", "is-over");
    document.body.classList.remove("pms198-dragging");
    document.querySelectorAll(".pms198-drag-source").forEach(function(node){ node.classList.remove("pms198-drag-source"); });
    if (changed) {
      event.preventDefault();
      event.stopPropagation();
      stableRender();
    }
  }
  function onDragEnd(){
    document.body.classList.remove("pms198-dragging");
    document.querySelectorAll(".pms198-over,.pms198-drag-source").forEach(function(node){
      node.classList.remove("pms198-over", "is-over", "pms198-drag-source");
    });
    restoreScroll();
  }
  function onClick(event){
    var card = event.target && event.target.closest && event.target.closest(".pms150-card[data-pms150-kind][data-pms150-id],.pms136-card[data-pms136-type][data-pms136-id]");
    if (card && !event.target.closest("button,input,select,textarea,a")) {
      markSelected(card);
      return;
    }
    var target = dropTarget(event);
    if (!target || !selected || event.target.closest(".pms150-card,.pms136-card,button,input,select,textarea,a")) return;
    rememberScroll();
    if (movePayload(target, selected)) {
      selected = null;
      stableRender();
    }
  }

  function fixMojibake(value){
    var text = String(value == null ? "" : value);
    if (!/[ÃÂâ€�â€œâ€˜â€™�]/.test(text)) return text;
    var replacements = [
      ["ÃƒÂ ","a"],["ÃƒÂ¡","a"],["ÃƒÂ¨","e"],["ÃƒÂ©","e"],["ÃƒÂ¬","i"],["ÃƒÂ²","o"],["ÃƒÂ¹","u"],
      ["Ãƒâ‚¬","A"],["ÃƒÅ’","SI"],["Ãƒâ€™","O"],["Ãƒâ€œ","O"],["Ãƒâ€¹","E"],["Ãƒâ€°","E"],
      ["Ã ","a"],["Ã¡","a"],["Ã¨","e"],["Ã©","e"],["Ã¬","i"],["Ã²","o"],["Ã¹","u"],
      ["Ã€","A"],["Ãˆ","E"],["Ã‰","E"],["ÃŒ","I"],["Ã’","O"],["Ã™","U"],
      ["Ã¢â‚¬â„¢","'"],["Ã¢â‚¬Ëœ","'"],["â€™","'"],["â€˜","'"],
      ["Ã¢â‚¬Å“","\""],["Ã¢â‚¬Â","\""],["â€œ","\""],["â€�","\""],
      ["Ã¢â‚¬â€œ","-"],["Ã¢â‚¬â€","-"],["â€“","-"],["â€”","-"],
      ["Ã‚Â°"," deg"],["Ã‚Â·"," - "],["Ã‚",""],["Â",""],["�",""]
    ];
    replacements.forEach(function(pair){ text = text.split(pair[0]).join(pair[1]); });
    return text.replace(/\s{2,}/g, " ").trim();
  }
  function cleanupText(root){
    var base = root || document.getElementById("content") || document.body;
    if (!base) return;
    var walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        var parent = node.parentElement;
        if (!parent || /^(script|style|textarea|input|select|option)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return /[ÃÂâ€�â€œâ€˜â€™�]/.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var fixed = fixMojibake(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    });
    base.querySelectorAll("[placeholder],[title],[aria-label]").forEach(function(node){
      ["placeholder", "title", "aria-label"].forEach(function(attr){
        if (!node.hasAttribute(attr)) return;
        var fixed = fixMojibake(node.getAttribute(attr));
        if (fixed !== node.getAttribute(attr)) node.setAttribute(attr, fixed);
      });
    });
  }

  function injectCss(){
    var style = document.getElementById("pms-v198-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v198-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "#pms150-task-calendar,.pms136-page{letter-spacing:0!important;text-rendering:geometricPrecision!important}",
      "#pms150-task-calendar{overflow-x:auto!important;overflow-y:visible!important;scrollbar-gutter:stable both-edges!important;overscroll-behavior:contain!important}",
      "#pms150-task-calendar .pms150-grid{display:grid!important;align-items:stretch!important;grid-auto-rows:minmax(260px,auto)!important;gap:8px!important}",
      "#pms150-task-calendar .pms150-day,.pms136-day{box-sizing:border-box!important;min-width:0!important;overflow:hidden!important;contain:layout!important}",
      "#pms150-task-calendar .pms150-list,.pms136-day-list{box-sizing:border-box!important;align-content:start!important;scrollbar-gutter:stable!important;overflow-y:auto!important;overflow-x:hidden!important}",
      "#pms150-task-calendar .pms150-list{min-height:170px!important;max-height:310px!important}",
      ".pms136-day-list{min-height:190px!important;max-height:360px!important}",
      "#pms150-task-calendar .pms150-card,.pms136-card{box-sizing:border-box!important;width:100%!important;max-width:100%!important;overflow:hidden!important;cursor:grab!important;touch-action:none!important;user-select:none!important;line-height:1.24!important;word-break:break-word!important}",
      "#pms150-task-calendar .pms150-card strong,#pms150-task-calendar .pms150-card span,#pms150-task-calendar .pms150-card small,.pms136-card strong,.pms136-card span,.pms136-card b{max-width:100%!important;overflow-wrap:anywhere!important;letter-spacing:0!important}",
      ".pms198-selected{outline:2px solid #0b7a3b!important;outline-offset:2px!important}",
      ".pms198-drag-source{opacity:.64!important}",
      ".pms198-over{outline:3px solid #0b7a3b!important;outline-offset:-3px!important;background:#eefaf2!important}",
      "body.pms198-dragging,body.pms198-dragging #content{scroll-behavior:auto!important;overscroll-behavior:contain!important}",
      "@media(max-width:1260px){#pms150-task-calendar .pms150-grid{grid-template-columns:repeat(2,minmax(230px,1fr))!important}}",
      "@media(max-width:760px){#pms150-task-calendar .pms150-grid{grid-template-columns:1fr!important}.pms136-day-list{max-height:none!important}}"
    ].join("\n");
  }

  function afterDom(){
    injectCss();
    clearTimeout(cleanupTimer);
    cleanupTimer = setTimeout(function(){
      cleanupText(document.getElementById("content") || document.body);
    }, 30);
  }

  document.addEventListener("dragstart", onDragStart, true);
  document.addEventListener("dragover", onDragOver, true);
  document.addEventListener("dragleave", onDragLeave, true);
  document.addEventListener("drop", onDrop, true);
  document.addEventListener("dragend", onDragEnd, true);
  document.addEventListener("click", onClick, true);

  if (typeof render === "function" && !render.__pms198Wrapped) {
    var baseRender = render;
    render = function(){
      rememberScroll();
      var result = baseRender.apply(this, arguments);
      afterDom();
      restoreScroll();
      return result;
    };
    render.__pms198Wrapped = true;
  }

  var observer = new MutationObserver(function(){
    clearTimeout(cleanupTimer);
    cleanupTimer = setTimeout(function(){ cleanupText(document.getElementById("content") || document.body); }, 80);
  });
  function boot(){
    st();
    afterDom();
    try { observer.observe(document.body, {childList:true, subtree:true}); } catch(error) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
  window.PMS_V198_BACKOFFICE_DRAG_TEXT_STABILIZER = {version:VERSION, saveNow:saveNow, cleanupText:cleanupText};
  console.info(VERSION + " loaded");
})();
