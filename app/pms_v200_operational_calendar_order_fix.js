(function(){
  "use strict";

  var VERSION = "pms_v200_operational_calendar_order_fix";
  var OPERATIONAL = "operativo";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch];
    });
  }
  function same(a, b){
    return String(a == null ? "" : a).trim().toLowerCase() === String(b == null ? "" : b).trim().toLowerCase();
  }
  function st(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.intermediations = arr(state.intermediations);
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
    return false;
  }
  function findItem(type, id){
    var list = type === "order" ? st().orders : st().intermediations;
    return list.find(function(item){
      return same(item && item.id, id) || same(item && item.code, id) || same(item && item.orderCode, id);
    });
  }
  function itemDate(item){
    return String(item && (item.scheduledDate || item.operationalDate || item.calendarDate) || "").slice(0, 10);
  }
  function clearCalendarDate(type, id){
    var item = findItem(type, id);
    if (!item) return false;
    item.scheduledDate = "";
    item.operationalDate = "";
    item.calendarDate = "";
    item.updatedAt = new Date().toISOString();
    saveNow();
    return true;
  }
  function stableRender(){
    var content = document.getElementById("content");
    var top = content ? content.scrollTop : 0;
    if (typeof render === "function") render();
    setTimeout(function(){
      var refreshed = document.getElementById("content");
      if (refreshed) refreshed.scrollTop = top;
      decorate();
    }, 60);
  }
  function openItem(type, id){
    var module = type === "order" ? "orders" : "intermediations";
    if (typeof openModal === "function") {
      openModal(module, id);
      return;
    }
    if (window.current) current.page = module;
    stableRender();
  }
  function injectCss(){
    var style = document.getElementById("pms-v200-operational-calendar-order-fix-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v200-operational-calendar-order-fix-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms136-page{overflow-x:auto!important}",
      ".pms136-calendar{align-items:stretch!important}",
      ".pms136-day{overflow:visible!important;contain:none!important}",
      ".pms136-day-list{overflow-y:auto!important;overflow-x:visible!important;padding-bottom:12px!important}",
      ".pms136-card[data-pms136-type='order']{overflow:visible!important;display:grid!important;gap:7px!important;min-height:auto!important;align-content:start!important}",
      ".pms200op-actions{display:flex!important;flex-wrap:wrap!important;gap:6px!important;align-items:center!important;margin-top:3px!important}",
      ".pms200op-actions button{width:auto!important;margin:0!important;min-height:26px!important;padding:5px 8px!important;border-radius:6px!important;font-size:10.5px!important;line-height:1.15!important;white-space:nowrap!important}",
      ".pms200op-edit{border:1px solid #1f4e78!important;background:#eef6ff!important;color:#163a5c!important;font-weight:900!important}",
      ".pms200op-clear{border:1px solid #d8e0e7!important;background:#fff7ed!important;color:#8a3a0a!important;font-weight:900!important}",
      ".pms136-card[data-pms136-type='order']>.pms136-clear{display:none!important}",
      ".pms136-card[data-pms136-type='order'].pms147-card-closed .pms200op-actions{display:flex!important}",
      "@media(max-width:760px){.pms136-day-list{max-height:none!important}.pms200op-actions button{flex:1 1 120px!important}}"
    ].join("\n");
  }
  function actionHtml(type, id, hasDate){
    var editLabel = type === "order" ? "Modifica ordine" : "Modifica pratica";
    var clear = hasDate ? '<button type="button" class="pms200op-clear" data-pms200op-clear="' + esc(type) + '" data-pms200op-id="' + esc(id) + '">Togli data</button>' : "";
    return '<div class="pms200op-actions" data-pms200op-actions><button type="button" class="pms200op-edit" data-pms200op-edit="' + esc(type) + '" data-pms200op-id="' + esc(id) + '">' + esc(editLabel) + '</button>' + clear + '</div>';
  }
  function decorate(){
    if (!window.current || current.page !== OPERATIONAL) return;
    injectCss();
    document.querySelectorAll(".pms136-card[data-pms136-type='order'][data-pms136-id]").forEach(function(card){
      var id = card.dataset.pms136Id || "";
      var item = findItem("order", id);
      var existing = card.querySelector("[data-pms200op-actions]");
      if (!item) {
        if (existing) existing.remove();
        return;
      }
      var html = actionHtml("order", id, !!itemDate(item));
      if (existing) {
        if (existing.outerHTML !== html) existing.outerHTML = html;
        return;
      }
      card.insertAdjacentHTML("beforeend", html);
    });
  }
  function onClick(event){
    var edit = event.target && event.target.closest && event.target.closest("[data-pms200op-edit]");
    if (edit) {
      event.preventDefault();
      event.stopPropagation();
      openItem(edit.dataset.pms200opEdit, edit.dataset.pms200opId);
      return;
    }
    var clear = event.target && event.target.closest && event.target.closest("[data-pms200op-clear]");
    if (clear) {
      event.preventDefault();
      event.stopPropagation();
      if (clearCalendarDate(clear.dataset.pms200opClear, clear.dataset.pms200opId)) stableRender();
    }
  }

  document.addEventListener("click", onClick, true);
  var baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms200OperationalCalendarOrderFix) {
    render = function(){
      var result = baseRender.apply(this, arguments);
      setTimeout(decorate, 40);
      setTimeout(decorate, 180);
      return result;
    };
    render.__pms200OperationalCalendarOrderFix = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  setTimeout(decorate, 250);
  setTimeout(decorate, 900);
  window.PMS_V200_OPERATIONAL_CALENDAR_ORDER_FIX = {version:VERSION, decorate:decorate, clearCalendarDate:clearCalendarDate};
  console.info(VERSION + " loaded");
})();
