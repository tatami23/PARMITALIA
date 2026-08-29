(function(){
  "use strict";

  const VERSION = "pms_v181_single_top_logo_only_fix";
  const DUPLICATE_SELECTORS = [
    ".sidebar-brand",
    ".pms106-hub",
    ".pms106-globe-label",
    ".pms106-wheel",
    "#pms109-hub",
    ".pms109-hub",
    ".pms109-world",
    ".pms109-led-sign",
    ".pms113-led-sign",
    "#pms144-world-banner",
    ".pms144-world-banner",
    ".pms150-sign"
  ];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function logoUrl(){
    try {
      const settings = JSON.parse(localStorage.getItem("pms_settings") || "{}");
      return settings.logoUrl || "";
    } catch(error) {
      return "";
    }
  }
  function hideNode(node){
    if (!node || node.closest("#pms170-top-globe")) return;
    node.setAttribute("data-pms181-hidden-logo", "1");
    node.setAttribute("aria-hidden", "true");
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("width", "0", "important");
    node.style.setProperty("height", "0", "important");
    node.style.setProperty("min-height", "0", "important");
    node.style.setProperty("margin", "0", "important");
    node.style.setProperty("padding", "0", "important");
    node.style.setProperty("overflow", "hidden", "important");
  }
  function ensureTopBrand(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    let banner = document.getElementById("pms170-top-globe");
    if (!banner) {
      const src = logoUrl();
      banner = document.createElement("div");
      banner.id = "pms170-top-globe";
      banner.innerHTML =
        '<div class="pms170-world">' +
          '<div class="pms170-earth"></div>' +
          '<div class="pms170-ellipse"></div>' +
          '<div class="pms170-ellipse pms170-ellipse-two"></div>' +
          '<div class="pms170-logo-dot">' + (src ? '<img src="' + esc(src) + '" alt="Parmitalia">' : "P") + '</div>' +
        '</div>' +
        '<div class="pms170-lit-name"></div>' +
        '<div class="pms170-payoff"></div>';
    }
    banner.classList.add("pms181-only-top-logo", "pms180-brand-fixed");
    const menu = document.getElementById("pms143-menu") || document.getElementById("nav");
    if (menu && banner.nextElementSibling !== menu) {
      sidebar.insertBefore(banner, menu);
    } else if (!banner.parentElement) {
      sidebar.insertBefore(banner, sidebar.firstChild);
    }
    let name = banner.querySelector(".pms170-lit-name");
    if (!name) {
      name = document.createElement("div");
      name.className = "pms170-lit-name";
      banner.appendChild(name);
    }
    name.textContent = "Parmitalia Distribution";
    name.removeAttribute("aria-hidden");
    let payoff = banner.querySelector(".pms170-payoff");
    if (!payoff) {
      payoff = document.createElement("div");
      payoff.className = "pms170-payoff";
      banner.appendChild(payoff);
    }
    payoff.textContent = "Qualita che nasce dal latte";
    payoff.dataset.pms178Originaltext = "Qualita che nasce dal latte";
    payoff.removeAttribute("aria-hidden");
    return banner;
  }
  function hideDuplicateLogos(){
    DUPLICATE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(hideNode);
    });
    document.querySelectorAll(".sidebar .brand-mark,.sidebar img,.sidebar svg,.sidebar canvas").forEach(node => {
      if (node.closest("#pms170-top-globe")) return;
      if (node.closest(".logo-preview") || node.closest("#pms180-settings-tools")) return;
      const marker = [
        node.id || "",
        node.className || "",
        node.getAttribute && node.getAttribute("alt") || "",
        node.getAttribute && node.getAttribute("title") || ""
      ].join(" ").toLowerCase();
      if (node.classList && node.classList.contains("brand-mark")) hideNode(node);
      else if (/logo|brand|parm|pms106|pms109|pms144|pms150|world|globe/.test(marker)) hideNode(node);
    });
    document.querySelectorAll(".sidebar *").forEach(node => {
      if (node.closest("#pms170-top-globe") || node.closest("#pms143-menu") || node.closest("#nav") || node.id === "logout-button") return;
      const text = (node.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!text) return;
      if (
        text === "parmitalia management system" ||
        text === "parmitalia distribution srl" ||
        text === "parmitalia distribuzione srl" ||
        text === "parmalat distribuzione srl"
      ) {
        hideNode(node);
      }
    });
  }
  function cleanFooter(){
    const footer = document.querySelector(".sidebar-footer");
    const logout = document.getElementById("logout-button");
    if (!footer) return;
    Array.from(footer.children).forEach(node => {
      if (node !== logout) hideNode(node);
    });
    if (logout) {
      logout.textContent = "Esci";
      logout.setAttribute("aria-label", "Esci");
      if (logout.parentElement !== footer) footer.appendChild(logout);
    }
  }
  function injectCss(){
    let style = document.getElementById("pms-v181-single-top-logo-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v181-single-top-logo-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      [data-pms181-hidden-logo="1"],
      body.pms166-restore-sidebar .sidebar-brand,
      body.device-phone.pms166-restore-sidebar .sidebar-brand,
      body.device-tablet.pms166-restore-sidebar .sidebar-brand,
      .sidebar-brand,
      .pms106-hub,.pms109-hub,#pms109-hub,.pms113-led-sign,
      #pms144-world-banner,.pms144-world-banner,.pms150-sign{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        overflow:hidden!important;
      }
      #pms170-top-globe.pms181-only-top-logo,
      body.pms166-restore-sidebar #pms170-top-globe.pms181-only-top-logo{
        order:-50!important;
        display:grid!important;
        width:100%!important;
        min-height:148px!important;
        max-height:148px!important;
        grid-template-rows:72px 30px 26px!important;
        gap:6px!important;
        align-items:center!important;
        justify-items:center!important;
        padding:8px 6px!important;
        margin:0 0 6px!important;
        overflow:visible!important;
        border:1px solid rgba(95,143,109,.18)!important;
        border-radius:8px!important;
        background:linear-gradient(90deg,rgba(95,143,109,.08),rgba(255,255,255,.96),rgba(189,122,120,.08))!important;
      }
      #pms170-top-globe.pms181-only-top-logo .pms170-world{
        display:block!important;
        visibility:visible!important;
        grid-row:1!important;
        width:98px!important;
        height:72px!important;
        margin:0!important;
      }
      #pms170-top-globe.pms181-only-top-logo .pms170-earth{width:58px!important;height:58px!important}
      #pms170-top-globe.pms181-only-top-logo .pms170-ellipse{top:13px!important;height:44px!important}
      #pms170-top-globe.pms181-only-top-logo .pms170-logo-dot{
        display:grid!important;
        visibility:visible!important;
        place-items:center!important;
        width:25px!important;
        height:25px!important;
        top:-11px!important;
        margin-left:-12.5px!important;
        overflow:hidden!important;
      }
      #pms170-top-globe.pms181-only-top-logo .pms170-logo-dot img{
        display:block!important;
        width:100%!important;
        height:100%!important;
        object-fit:contain!important;
      }
      #pms170-top-globe.pms181-only-top-logo .pms170-lit-name{
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
        grid-row:2!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        min-height:30px!important;
        max-height:30px!important;
        padding:6px 10px!important;
        margin:0!important;
        border-radius:8px!important;
        color:#f8fff6!important;
        background:linear-gradient(90deg,#0f766e,#5f8f6d 52%,#643b71)!important;
        border:1px solid rgba(255,255,255,.78)!important;
        font-size:12px!important;
        font-weight:950!important;
        line-height:1!important;
        text-align:center!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-shadow:0 0 8px rgba(255,255,255,.85),0 0 15px rgba(95,143,109,.95)!important;
        box-shadow:0 0 20px rgba(95,143,109,.35)!important;
      }
      #pms170-top-globe.pms181-only-top-logo .pms170-payoff,
      #pms170-top-globe.pms181-only-top-logo [class*="payoff"]{
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
        grid-row:3!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        height:26px!important;
        min-height:26px!important;
        max-height:26px!important;
        padding:5px 9px!important;
        margin:0!important;
        border-radius:999px!important;
        color:#123524!important;
        background:linear-gradient(90deg,#ffffff,#eef9f1,#ffffff)!important;
        border:1px solid rgba(95,143,109,.42)!important;
        font-size:11px!important;
        font-weight:950!important;
        line-height:1!important;
        text-align:center!important;
        white-space:nowrap!important;
        text-shadow:0 0 10px rgba(255,255,255,1),0 0 12px rgba(95,143,109,.55)!important;
      }
      .sidebar-footer > :not(#logout-button),#current-user{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
    `;
  }
  function decorate(){
    injectCss();
    ensureTopBrand();
    hideDuplicateLogos();
    cleanFooter();
  }

  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms181Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 40);
      setTimeout(decorate, 220);
      return result;
    };
    window.render.__pms181Wrapped = true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
  [80, 240, 700, 1400].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 1200);
  window.PMS_V181_SINGLE_TOP_LOGO_ONLY_FIX = {version:VERSION, decorate};
})();
