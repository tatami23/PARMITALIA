(function(){
  "use strict";

  var VERSION = "pms_v200_crm_single_drag_calendar_fix";

  function isCrmPage(){
    return !!(window.current && current.page === "communications");
  }
  function injectCss(){
    var style = document.getElementById("pms-v200-crm-single-drag-calendar-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v200-crm-single-drag-calendar-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "#pms158-crm-calendar,#pms175-crm-calendar-panel,#pms186-crm-free-drag-panel{display:none!important}",
      "#pms187-crm-top-calendar{display:grid!important}",
      "body.pms200-crm-single-calendar #content>#pms187-crm-top-calendar{margin-top:0!important}"
    ].join("\n");
  }
  function cleanup(){
    injectCss();
    document.body.classList.toggle("pms200-crm-single-calendar", isCrmPage());
    if (!isCrmPage()) return;
    document.querySelectorAll("#pms158-crm-calendar,#pms175-crm-calendar-panel,#pms186-crm-free-drag-panel").forEach(function(node){
      node.remove();
    });
    var calendar = document.getElementById("pms187-crm-top-calendar");
    var content = document.getElementById("content");
    if (calendar && content && content.firstElementChild !== calendar) {
      content.insertBefore(calendar, content.firstChild);
    }
  }

  var baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms200CrmSingleDragCalendar) {
    render = function(){
      var result = baseRender.apply(this, arguments);
      setTimeout(cleanup, 40);
      setTimeout(cleanup, 220);
      return result;
    };
    render.__pms200CrmSingleDragCalendar = true;
    try { window.render = render; } catch(error) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", cleanup, {once:true});
  else cleanup();
  [120, 500, 1200, 2600].forEach(function(ms){ setTimeout(cleanup, ms); });
  window.PMS_V200_CRM_SINGLE_DRAG_CALENDAR_FIX = {version:VERSION, cleanup:cleanup};
  console.info(VERSION + " loaded");
})();
