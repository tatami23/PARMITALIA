(function(){
  "use strict";

  var VERSION = "pms_v212_hide_top_useless_letters";

  function isShortNoise(text){
    var value = String(text || "").replace(/\s+/g, "").trim();
    return /^(ACLE|AEA|DB|MKT|OP|BO|CRM|TRT|INT|OFF|ORD|PRD|FRM|LST|TEN|BRK|ANA|PRN|GEO|TRP|FLT|PKG|DOC|ACC|FAT|BNK|PAY|AG|REC|HR|ARO|SIN|LEG|CTR|TPL|SET|ADM|APP|DEV|MOD)$/i.test(value) ||
      /^[A-Z]{2,5}$/.test(value);
  }
  function hide(node){
    if (!node || node.closest("#pms210-world-ellipse-logo")) return;
    node.setAttribute("data-pms212-hidden-letters", "1");
    node.setAttribute("aria-hidden", "true");
  }
  function removeBareText(root){
    Array.prototype.slice.call(root.childNodes || []).forEach(function(child){
      if (child.nodeType === 3 && isShortNoise(child.nodeValue)) child.nodeValue = "";
    });
  }
  function cleanTopLetters(){
    document.querySelectorAll(".pms100-code,#pms208-fleet-launcher span,.pms208-fleet-nav .pms100-code").forEach(hide);
    document.querySelectorAll(".sidebar *,.topbar *").forEach(function(node){
      if (node.closest("#pms210-world-ellipse-logo")) return;
      removeBareText(node);
      if (node.matches("select,input,textarea,option")) return;
      if (node.classList && (node.classList.contains("pms100-code") || node.classList.contains("brand-mark"))) return hide(node);
      var text = String(node.textContent || "").replace(/\s+/g, "").trim();
      if (!isShortNoise(text)) return;
      var isUsefulButton = node.matches("button,a") && text.length > 5;
      if (!isUsefulButton) hide(node);
    });
  }
  function css(){
    var style = document.getElementById("pms-v212-hide-top-letters-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v212-hide-top-letters-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      '[data-pms212-hidden-letters="1"],.pms100-code,#pms208-fleet-launcher span{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-width:0!important;min-height:0!important;max-width:0!important;max-height:0!important;margin:0!important;padding:0!important;border:0!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important}',
      '#nav.pms100-nav .nav-button.compact{grid-template-columns:minmax(0,1fr)!important}',
      '#nav.pms100-nav .pms100-label{grid-column:1!important}',
      '#pms208-fleet-launcher{gap:0!important}'
    ].join("\n");
  }
  function refresh(){
    css();
    cleanTopLetters();
  }
  function wrap(){
    if (typeof render === "function" && !render.__pms212Wrapped) {
      var baseRender = render;
      render = function(){
        var result = baseRender.apply(this, arguments);
        setTimeout(refresh, 30);
        setTimeout(refresh, 220);
        return result;
      };
      render.__pms212Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms212Wrapped) {
      var baseNav = renderNav;
      renderNav = function(){
        var result = baseNav.apply(this, arguments);
        setTimeout(refresh, 30);
        setTimeout(refresh, 220);
        return result;
      };
      renderNav.__pms212Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }
  function boot(){
    wrap();
    refresh();
    [80, 240, 700, 1400].forEach(function(ms){ setTimeout(refresh, ms); });
    setInterval(refresh, 2200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V212_HIDE_TOP_USELESS_LETTERS = {version:VERSION, refresh:refresh};
})();
