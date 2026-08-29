(function(){
  "use strict";

  var VERSION = "pms_v200_backoffice_calendar_stability_fix";

  function isAssistant(){
    return !!(window.current && current.page === "assistant");
  }
  function injectCss(){
    var style = document.getElementById("pms-v200-backoffice-calendar-stability-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v200-backoffice-calendar-stability-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "#pms150-task-calendar{overflow-x:auto!important;overflow-y:visible!important;contain:none!important;padding:14px!important}",
      "#pms150-task-calendar #pms160-task-backlog{display:none!important}",
      "#pms150-task-calendar .pms150-backlog{display:block!important;margin-top:14px!important;border-top:1px solid #dfe5ea!important;padding-top:12px!important}",
      "#pms150-task-calendar .pms150-grid{display:grid!important;grid-template-columns:repeat(7,minmax(178px,1fr))!important;align-items:stretch!important;gap:10px!important;min-height:0!important}",
      "#pms150-task-calendar .pms150-day{display:flex!important;flex-direction:column!important;min-height:390px!important;overflow:visible!important;contain:none!important;isolation:auto!important;background:#fbfcfd!important}",
      "#pms150-task-calendar .pms150-list{display:flex!important;flex-direction:column!important;gap:8px!important;min-height:230px!important;max-height:520px!important;overflow-y:auto!important;overflow-x:visible!important;align-content:start!important;padding:9px!important}",
      "#pms150-task-calendar .pms150-card{position:relative!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:5px!important;min-height:auto!important;height:auto!important;max-height:none!important;overflow:visible!important;white-space:normal!important;line-height:1.25!important;padding:9px!important}",
      "#pms150-task-calendar .pms150-card strong{display:block!important;font-size:12px!important;line-height:1.22!important;max-width:100%!important;overflow-wrap:anywhere!important;white-space:normal!important;color:#17242b!important}",
      "#pms150-task-calendar .pms150-card span,#pms150-task-calendar .pms150-card small{display:block!important;font-size:10.5px!important;line-height:1.2!important;max-width:100%!important;overflow-wrap:anywhere!important;white-space:normal!important}",
      "#pms150-task-calendar .pms150-quick{position:relative!important;z-index:1!important;display:grid!important;grid-template-columns:minmax(0,1fr) 36px!important;gap:6px!important;padding:8px!important;background:#fff!important;border-top:1px solid #dfe5ea!important}",
      "#pms150-task-calendar .pms150-quick input{min-width:0!important;height:34px!important;font-size:12px!important}",
      "#pms150-task-calendar .pms150-backlog-list{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:8px!important}",
      "#pms150-task-calendar .pms192-clear-task{justify-self:start!important;white-space:nowrap!important}",
      "body.pms200-backoffice-calendar-stable #pms150-task-calendar *{letter-spacing:0!important}",
      ".sidebar #pms210-world-ellipse-logo,.sidebar #pms170-top-globe,.sidebar .pms170-top-globe,.sidebar #pms144-world-banner,.sidebar .pms144-world-banner,.sidebar .pms144-globe-wrap,.sidebar .pms144-globe,.sidebar .pms144-sign,.sidebar #pms109-hub,.sidebar .pms109-hub,.sidebar .pms109-world,.sidebar .pms109-world-label,.sidebar .pms109-logo-orbit,.sidebar .pms109-logo-sat,.sidebar .pms113-led-sign,.sidebar #pms106-hub,.sidebar .pms106-hub,.sidebar .pms106-globe,.sidebar .pms106-globe-label,.sidebar .pms106-globe-core,.sidebar .pms106-wheel,.sidebar .pms120-fallback-globe,.sidebar .pms120-fallback-hub,.sidebar .pms150-sign{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}",
      ".sidebar .pms100-code,.sidebar .pms52-nav-code,.sidebar .nav-button::before{display:none!important;content:none!important}",
      "body.pms113-left-globe .main::before,body.pms194-parmitalia-logo-bg .main::before,body.pms194-parmitalia-logo-bg .main::after{content:none!important;display:none!important;background:none!important;background-image:none!important}",
      "@media(max-width:1260px){#pms150-task-calendar .pms150-grid{grid-template-columns:repeat(2,minmax(240px,1fr))!important}#pms150-task-calendar .pms150-day{min-height:280px!important}}",
      "@media(max-width:760px){#pms150-task-calendar .pms150-grid{grid-template-columns:1fr!important}#pms150-task-calendar .pms150-list{max-height:none!important}}"
    ].join("\n");
  }
  function fixText(value){
    var text = String(value == null ? "" : value);
    var replacements = [
      ["\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a0","\u00e0"],["\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a8","\u00e8"],["\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00a9","\u00e9"],["\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00ac","\u00ec"],["\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00b2","\u00f2"],["\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00b9","\u00f9"],
      ["\u00c3\u0192\u00c2\u00a0","\u00e0"],["\u00c3\u0192\u00c2\u00a8","\u00e8"],["\u00c3\u0192\u00c2\u00a9","\u00e9"],["\u00c3\u0192\u00c2\u00ac","\u00ec"],["\u00c3\u0192\u00c2\u00b2","\u00f2"],["\u00c3\u0192\u00c2\u00b9","\u00f9"],
      ["S\u00c3\u0192\u00c6\u2019\u00c3\u201a\u00c2\u00ac","S\u00ec"],["S\u00c3\u0192\u00c2\u00ac","S\u00ec"],["\u00c3\u0192\u00e2\u20ac\u0161\u00c3\u201a\u00c2\u00b7"," - "],["\u00c3\u201a\u00c2\u00b7"," - "],["\u00c2\u00b7"," - "],
      ["\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u00e2\u20ac\u017e\u00c2\u00a2","'"],["\u00c3\u00a2\u00e2\u20ac\u0161\u00c2\u00ac\u00c3\u00a2\u00e2\u20ac\u017e\u00c2\u00a2","'"],
      ["\u00c3\u0192\u00e2\u20ac\u0161",""],["\u00c3\u201a",""],["\u00c2",""],["\ufffd",""]
    ];
    replacements.forEach(function(pair){ text = text.split(pair[0]).join(pair[1]); });
    text = text
      .replace(/Attivit.{0,14}/g, function(match){ return /^Attivit/i.test(match) && /[\u00c3\u0192\u00c6\u2019\u00c2]/.test(match) ? "Attivit\u00e0" : match; })
      .replace(/attivit.{0,14}/g, function(match){ return /^attivit/i.test(match) && /[\u00c3\u0192\u00c6\u2019\u00c2]/.test(match) ? "attivit\u00e0" : match; })
      .replace(/Priorit.{0,14}/g, function(match){ return /^Priorit/i.test(match) && /[\u00c3\u0192\u00c6\u2019\u00c2]/.test(match) ? "Priorit\u00e0" : match; })
      .replace(/priorit.{0,14}/g, function(match){ return /^priorit/i.test(match) && /[\u00c3\u0192\u00c6\u2019\u00c2]/.test(match) ? "priorit\u00e0" : match; });
    text = text
      .replace(/\battivita\b/g, "attivit\u00e0")
      .replace(/\bAttivita\b/g, "Attivit\u00e0")
      .replace(/\bpriorita\b/g, "priorit\u00e0")
      .replace(/\bPriorita\b/g, "Priorit\u00e0")
      .replace(/\bquantita\b/g, "quantit\u00e0")
      .replace(/\bQuantita\b/g, "Quantit\u00e0")
      .replace(/\bunita\b/g, "unit\u00e0")
      .replace(/\bUnita\b/g, "Unit\u00e0")
      .replace(/\bvalidita\b/g, "validit\u00e0")
      .replace(/\bValidita\b/g, "Validit\u00e0")
      .replace(/\bpuo\b/g, "pu\u00f2")
      .replace(/\bPuo\b/g, "Pu\u00f2")
      .replace(/\bpiu\b/g, "pi\u00f9")
      .replace(/\bPiu\b/g, "Pi\u00f9");
    return text.replace(/\s{2,}/g, " ").trim();
  }
  function cleanupText(root){
    var base = root || document.getElementById("content");
    if (!base) return;
    var walker = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        var parent = node.parentElement;
        if (!parent || /^(script|style|textarea|input|select|option)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return /[\u00c3\u00c2\u00e2\ufffd]|\b(attivita|Attivita|priorita|Priorita|quantita|Quantita|unita|Unita|validita|Validita|puo|Puo|piu|Piu)\b/.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var fixed = fixText(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    });
    base.querySelectorAll("[placeholder],[title],[aria-label]").forEach(function(node){
      ["placeholder", "title", "aria-label"].forEach(function(attr){
        if (!node.hasAttribute(attr)) return;
        var fixed = fixText(node.getAttribute(attr));
        if (fixed !== node.getAttribute(attr)) node.setAttribute(attr, fixed);
      });
    });
  }
  function stabilize(){
    injectCss();
    removeWorldMenu();
    cleanupText(document.querySelector(".sidebar"));
    cleanupText(document.querySelector(".topbar"));
    cleanupText(document.getElementById("content"));
    document.body.classList.toggle("pms200-backoffice-calendar-stable", isAssistant());
    if (!isAssistant()) return;
    document.querySelectorAll("#pms150-task-calendar #pms160-task-backlog").forEach(function(node){ node.remove(); });
    var calendar = document.getElementById("pms150-task-calendar");
    if (calendar) cleanupText(calendar);
  }
  function removeWorldMenu(){
    var selectors = [
      "#pms210-world-ellipse-logo", "#pms170-top-globe", ".pms170-top-globe", "#pms144-world-banner", ".pms144-world-banner",
      ".pms144-globe-wrap", ".pms144-globe", ".pms144-sign", "#pms109-hub", ".pms109-hub", ".pms109-world",
      ".pms109-world-label", ".pms109-logo-orbit", ".pms109-logo-sat", ".pms113-led-sign", "#pms106-hub",
      ".pms106-hub", ".pms106-globe", ".pms106-globe-label", ".pms106-globe-core", ".pms106-wheel",
      ".pms120-fallback-globe", ".pms120-fallback-hub", ".pms150-sign"
    ].join(",");
    document.querySelectorAll(selectors).forEach(function(node){
      if (node.closest && node.closest("#print-root,.modal,.modal-card")) return;
      node.remove();
    });
  }

  var baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms200BackofficeCalendarStability) {
    render = function(){
      var result = baseRender.apply(this, arguments);
      setTimeout(stabilize, 60);
      setTimeout(stabilize, 240);
      return result;
    };
    render.__pms200BackofficeCalendarStability = true;
    try { window.render = render; } catch(error) {}
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", stabilize, {once:true});
  else stabilize();
  [120, 500, 1400, 3000].forEach(function(ms){ setTimeout(stabilize, ms); });
  setInterval(function(){
    injectCss();
    removeWorldMenu();
    cleanupText(document.querySelector(".sidebar"));
    cleanupText(document.querySelector(".topbar"));
    if (isAssistant()) cleanupText(document.getElementById("content"));
  }, 2400);
  window.PMS_V200_BACKOFFICE_CALENDAR_STABILITY_FIX = {version:VERSION, stabilize:stabilize, cleanupText:cleanupText};
  console.info(VERSION + " loaded");
})();
