(function(){
  "use strict";
  const VERSION = "pms_v171_payoff_footer_cleanup";

  function ensurePayoffVisible(){
    const banner = document.getElementById("pms170-top-globe");
    if (!banner) return;
    let payoff = banner.querySelector(".pms170-payoff");
    if (!payoff) {
      payoff = document.createElement("div");
      payoff.className = "pms170-payoff";
      banner.appendChild(payoff);
    }
    payoff.textContent = "Qualità che nasce dal latte";
    payoff.style.display = "grid";
    payoff.style.visibility = "visible";
    payoff.style.opacity = "1";
  }

  function cleanupFooter(){
    const footer = document.querySelector(".sidebar-footer");
    if (!footer) return;
    const logout = document.getElementById("logout-button");
    Array.from(footer.children).forEach(function(child){
      if (child === logout) return;
      child.setAttribute("aria-hidden", "true");
      child.style.display = "none";
      child.style.visibility = "hidden";
      child.style.width = "0";
      child.style.height = "0";
      child.style.margin = "0";
      child.style.padding = "0";
      child.style.overflow = "hidden";
      child.textContent = "";
    });
    if (logout && logout.parentNode !== footer) footer.appendChild(logout);
    if (logout) {
      logout.style.display = "block";
      logout.style.visibility = "visible";
    }
  }

  function hideBottomLogos(){
    document.querySelectorAll(".sidebar-footer img,.sidebar-footer .brand-mark,.sidebar-footer [class*='logo'],.sidebar-footer [id*='logo'],.sidebar-footer [class*='world'],.sidebar-footer [id*='world'],.sidebar-footer [class*='globe'],.sidebar-footer [id*='globe']").forEach(function(node){
      if (node.id === "logout-button") return;
      node.setAttribute("aria-hidden", "true");
      node.style.display = "none";
      node.style.visibility = "hidden";
    });
  }

  function injectCss(){
    if (document.getElementById("pms-v171-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v171-style";
    style.textContent = `
      #pms170-top-globe .pms170-payoff{
        display:grid!important;
        visibility:visible!important;
        opacity:1!important;
        width:min(224px,94%)!important;
        min-height:25px!important;
        place-items:center!important;
        padding:5px 10px!important;
        margin-top:1px!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.28)!important;
        background:rgba(255,255,255,.92)!important;
        color:#173b2a!important;
        font-size:12px!important;
        line-height:1.15!important;
        font-weight:950!important;
        text-align:center!important;
        text-shadow:0 0 8px rgba(255,255,255,.95),0 1px 0 rgba(255,255,255,.8)!important;
        box-shadow:0 0 14px rgba(95,143,109,.18)!important;
        letter-spacing:0!important;
        white-space:normal!important;
      }
      .sidebar-footer > :not(#logout-button),
      .sidebar-footer img,
      .sidebar-footer .brand-mark,
      .sidebar-footer [class*="logo"],
      .sidebar-footer [id*="logo"],
      .sidebar-footer [class*="world"],
      .sidebar-footer [id*="world"],
      .sidebar-footer [class*="globe"],
      .sidebar-footer [id*="globe"]{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-width:0!important;
        min-height:0!important;
        max-width:0!important;
        max-height:0!important;
        padding:0!important;
        margin:0!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      .sidebar-footer #logout-button{
        display:block!important;
        visibility:visible!important;
        width:100%!important;
        max-width:none!important;
        height:auto!important;
        min-height:0!important;
        margin:0!important;
        pointer-events:auto!important;
      }
    `;
    document.head.appendChild(style);
  }

  function run(){
    injectCss();
    ensurePayoffVisible();
    cleanupFooter();
    hideBottomLogos();
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !render.__pms171Wrapped) {
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(run, 30);
      setTimeout(run, 180);
      return result;
    };
    render.__pms171Wrapped = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, {once:true});
  else run();
  [80, 250, 700, 1500, 3000].forEach(function(ms){ setTimeout(run, ms); });
  setInterval(run, 1800);
  window.PMS_V171_PAYOFF_FOOTER_CLEANUP = {version:VERSION};
})();
