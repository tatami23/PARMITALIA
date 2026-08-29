(function(){
  "use strict";

  if (window.PMS_V258_OPERATIONAL_WEEK_LAYOUT_COMPACT_FIX) return;

  var VERSION = "pms_v258_operational_week_layout_compact_fix";
  var PAGE = "operativo";

  function clean(value){
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }
  function isOperational(){
    try { return typeof current !== "undefined" && current && current.page === PAGE; } catch (_) {}
    return window.current && window.current.page === PAGE;
  }
  function injectCss(){
    if (document.getElementById("pms-v258-operational-compact-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v258-operational-compact-style";
    style.textContent = [
      ".pms136-page{overflow-x:hidden!important;max-width:100%!important}",
      ".pms136-toolbar{align-items:center!important}",
      ".pms136-calendar{grid-template-columns:repeat(7,minmax(128px,1fr))!important;gap:8px!important;min-height:0!important}",
      ".pms136-day{min-width:0!important;min-height:420px!important;max-height:420px!important;overflow:hidden!important}",
      ".pms136-day-list{min-height:0!important;max-height:358px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:8px!important}",
      ".pms136-card{min-width:0!important;max-width:100%!important;box-sizing:border-box!important;overflow:hidden!important;display:grid!important;gap:5px!important;padding:8px!important;border-radius:7px!important}",
      ".pms136-day .pms136-card{max-height:168px!important}",
      ".pms136-backlog .pms136-card{max-height:190px!important}",
      ".pms136-card-head{min-width:0!important}",
      ".pms136-card-head strong{font-size:11px!important;line-height:1.2!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}",
      ".pms136-card-head span{font-size:9px!important;line-height:1.1!important;white-space:nowrap!important;flex:0 0 auto!important}",
      ".pms136-card-row{grid-template-columns:76px minmax(0,1fr)!important;gap:5px!important;font-size:10.5px!important;line-height:1.18!important;margin:0!important}",
      ".pms136-card-row b,.pms136-card-row span{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important}",
      ".pms136-card-row span{display:block!important;max-height:28px!important}",
      ".pms136-day .pms136-card-row:nth-of-type(n+7){display:none!important}",
      ".pms136-card-row.pms258-destination b,.pms136-card-row.pms258-destination span{font-weight:900!important;color:#0b3f75!important}",
      ".pms136-card-row.pms258-destination{background:#eef6ff!important;border-radius:6px!important;padding:3px 5px!important;margin:1px 0!important}",
      ".pms136-card .pms136-clear{display:none!important}",
      ".pms136-card .pms200op-actions{display:grid!important;grid-template-columns:1fr!important;gap:4px!important;margin-top:2px!important}",
      ".pms136-day .pms200op-actions button:not(:first-child){display:none!important}",
      ".pms136-card .pms200op-actions button{width:100%!important;min-height:24px!important;padding:4px 6px!important;font-size:9.5px!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}",
      ".pms136-backlog-list{grid-template-columns:repeat(auto-fit,minmax(235px,1fr))!important}",
      ".pms136-backlog .pms136-card-row:nth-of-type(n+8){display:none!important}",
      ".pms136-empty{min-height:52px!important}",
      "@media(max-width:1500px){.pms136-calendar{grid-template-columns:repeat(7,minmax(118px,1fr))!important}.pms136-card-row{grid-template-columns:68px minmax(0,1fr)!important;font-size:10px!important}.pms136-day .pms136-card{max-height:158px!important}}",
      "@media(max-width:1180px){.pms136-calendar{grid-template-columns:repeat(2,minmax(220px,1fr))!important}.pms136-day{max-height:none!important;min-height:260px!important}.pms136-day-list{max-height:none!important}}",
      "@media(max-width:760px){.pms136-calendar{grid-template-columns:1fr!important}.pms136-backlogs{grid-template-columns:1fr!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function rowSignature(row){
    var label = clean(row.querySelector("b") ? row.querySelector("b").textContent : "");
    var value = clean(row.querySelector("span") ? row.querySelector("span").textContent : "");
    return (label + "|" + value).toLowerCase();
  }
  function isDestinationRow(row){
    var text = clean(row.textContent || "");
    return /destinazione|destination|destino|kuwait|exw|dap|fca|fob|cif|ddp/i.test(text);
  }
  function compactCard(card){
    if (!card || card.__pms258Compacted) return;
    card.__pms258Compacted = true;
    var seen = {};
    Array.prototype.slice.call(card.querySelectorAll(".pms136-card-row")).forEach(function(row){
      var sig = rowSignature(row);
      if (seen[sig]) {
        row.remove();
        return;
      }
      seen[sig] = true;
      if (isDestinationRow(row)) row.classList.add("pms258-destination");
    });
    var rows = Array.prototype.slice.call(card.querySelectorAll(".pms136-card-row"));
    var destination = rows.find(isDestinationRow);
    var firstRow = rows[0];
    if (destination && firstRow && destination !== firstRow && firstRow.parentNode) {
      firstRow.parentNode.insertBefore(destination, firstRow);
    }
    var title = card.querySelector(".pms136-card-head strong");
    if (title) title.title = clean(title.textContent);
    rows.forEach(function(row){
      var span = row.querySelector("span");
      if (span) span.title = clean(span.textContent);
    });
  }
  function compactOperational(){
    if (!isOperational()) return;
    injectCss();
    document.querySelectorAll(".pms136-card").forEach(compactCard);
    document.querySelectorAll(".pms136-day-list").forEach(function(list){
      list.style.scrollbarWidth = "thin";
    });
  }
  function wrapRender(){
    try {
      if (typeof render === "function" && !render.__pms258Compact) {
        var base = render;
        render = function(){
          var result = base.apply(this, arguments);
          setTimeout(compactOperational, 30);
          setTimeout(compactOperational, 160);
          return result;
        };
        render.__pms258Compact = true;
        try { window.render = render; } catch (_) {}
      }
    } catch (error) {
      console.warn(VERSION + " wrap skipped", error);
    }
  }
  function boot(){
    try {
      injectCss();
      wrapRender();
      compactOperational();
      [120, 320, 900, 1800].forEach(function(ms){ setTimeout(compactOperational, ms); });
      if (typeof MutationObserver === "function" && document.body) {
        new MutationObserver(function(){ setTimeout(compactOperational, 40); }).observe(document.body, { childList: true, subtree: true });
      }
      window.PMS_V258_OPERATIONAL_WEEK_LAYOUT_COMPACT_FIX = { version: VERSION, refresh: compactOperational };
      console.info(VERSION + " loaded");
    } catch (error) {
      console.warn(VERSION + " install skipped", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
