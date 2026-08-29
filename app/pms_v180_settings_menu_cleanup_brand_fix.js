(function(){
  "use strict";

  const VERSION = "pms_v180_settings_menu_cleanup_brand_fix";
  const SETTINGS_PAGES = [
    {id:"desktopCloudApp", code:"APP", label:"App Desktop Windows / macOS", text:"Pacchetto desktop e salvataggio locale"},
    {id:"desktopRoadmap", code:"DEV", label:"Piano applicazione desktop", text:"Roadmap tecnica desktop, cloud e Outlook"},
    {id:"admin", code:"ADM", label:"Gestione utenti e ruoli", text:"Utenti locali, ruoli e accessi"},
    {id:"cryptoMonitor", code:"CRY", label:"Crypto monitor", text:"Registro manuale investimenti"}
  ];

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function currentPage(){ return window.current && current.page || ""; }
  function saveCurrentPage(id){
    if (!window.current) window.current = {page:id, filters:{}};
    current.page = id;
    if (!current.filters) current.filters = {};
    if (typeof render === "function") render();
  }
  function ensureModules(){
    if (!Array.isArray(window.modules)) return;
    SETTINGS_PAGES.forEach(page => {
      const mod = modules.find(item => item && item.id === page.id);
      if (mod) {
        mod.label = page.label;
        mod.subtitle = page.text;
        mod.roles = Array.from(new Set([].concat(mod.roles || [], ["admin"])));
      }
    });
    const settings = modules.find(item => item && item.id === "settings");
    if (settings) {
      settings.label = "Impostazioni";
      settings.subtitle = "Logo, dati aziendali, lingua, utenti e strumenti tecnici";
    }
  }
  function hideTechnicalMenuItems(){
    SETTINGS_PAGES.forEach(page => {
      document.querySelectorAll([
        '[data-pms143-page="' + page.id + '"]',
        '[data-nav="' + page.id + '"]',
        '[data-page="' + page.id + '"]',
        '[data-module="' + page.id + '"]',
        '.nav-button[data-page="' + page.id + '"]',
        '.nav-button[data-nav="' + page.id + '"]',
        '.pms143-button[data-pms143-page="' + page.id + '"]'
      ].join(",")).forEach(node => {
        if (node.closest("#pms180-settings-tools")) return;
        node.style.display = "none";
        node.style.visibility = "hidden";
        node.setAttribute("aria-hidden", "true");
      });
    });
  }
  function removeColorPanels(){
    document.querySelectorAll(".pms129-color-panel,.pms134-pantone-grid").forEach(node => node.remove());
    document.querySelectorAll("#content .card,#content [class*='panel'],#content section,#content div").forEach(node => {
      if (node.id === "pms180-settings-tools") return;
      const text = (node.textContent || "").toLowerCase();
      if (
        text.includes("colori gestionale gia pronti") ||
        text.includes("colori gestionale gi") ||
        text.includes("palette pronta") ||
        text.includes("palette selezionata") ||
        text.includes("pantone simile")
      ) {
        node.remove();
      }
    });
  }
  function settingsToolsHtml(){
    return '<div id="pms180-settings-tools" class="card pms180-settings-tools"><h3>Strumenti dentro impostazioni</h3><div class="pms180-settings-grid">' +
      SETTINGS_PAGES.map(page => '<button type="button" class="pms180-settings-tile" data-pms180-open="' + esc(page.id) + '"><span>' + esc(page.code) + '</span><strong>' + esc(page.label) + '</strong><small>' + esc(page.text) + '</small></button>').join("") +
      '</div></div>';
  }
  function injectSettingsTools(){
    if (currentPage() !== "settings") return;
    const content = document.getElementById("content");
    if (!content) return;
    removeColorPanels();
    if (!document.getElementById("pms180-settings-tools")) {
      content.insertAdjacentHTML("beforeend", settingsToolsHtml());
    }
    document.querySelectorAll("[data-pms180-open]").forEach(button => {
      button.onclick = event => {
        event.preventDefault();
        saveCurrentPage(button.getAttribute("data-pms180-open"));
      };
    });
  }
  function cleanFooter(){
    const footer = document.querySelector(".sidebar-footer");
    const logout = document.getElementById("logout-button");
    if (footer) {
      Array.from(footer.childNodes).forEach(node => {
        if (node === logout) return;
        if (node.nodeType === 1 && node.id === "logout-button") return;
        node.remove();
      });
      if (logout && logout.parentElement !== footer) footer.appendChild(logout);
    }
    const currentUser = document.getElementById("current-user");
    if (currentUser) {
      currentUser.textContent = "";
      currentUser.style.display = "none";
      currentUser.setAttribute("aria-hidden", "true");
    }
    if (logout) {
      logout.textContent = "Esci";
      logout.setAttribute("aria-label", "Esci");
    }
    document.querySelectorAll(".sidebar *").forEach(node => {
      if (node.id === "logout-button" || node.closest("#pms170-top-globe") || node.closest(".sidebar-brand")) return;
      const text = (node.textContent || "").trim().toLowerCase();
      if (/^parmi?talia distribution srl$|^parmitalia distribuzione srl$|^parmalat distribuzione srl$/.test(text)) {
        node.remove();
      }
    });
  }
  function ensureBrand(){
    const banner = document.getElementById("pms170-top-globe");
    if (!banner) return;
    banner.classList.add("pms180-brand-fixed");
    let name = banner.querySelector(".pms170-lit-name");
    if (!name) {
      name = document.createElement("div");
      name.className = "pms170-lit-name";
      banner.appendChild(name);
    }
    name.textContent = "Parmitalia Distribution";
    name.style.display = "block";
    name.style.visibility = "visible";
    name.removeAttribute("aria-hidden");
    let payoff = banner.querySelector(".pms170-payoff");
    if (!payoff) {
      payoff = document.createElement("div");
      payoff.className = "pms170-payoff";
      banner.appendChild(payoff);
    }
    payoff.textContent = "Qualita che nasce dal latte";
    payoff.dataset.pms178Originaltext = "Qualita che nasce dal latte";
    payoff.style.display = "block";
    payoff.style.visibility = "visible";
    payoff.style.opacity = "1";
    payoff.removeAttribute("aria-hidden");
  }
  function injectCss(){
    let style = document.getElementById("pms-v180-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v180-style";
      document.head.appendChild(style);
    }
    const hiddenSelectors = SETTINGS_PAGES.map(page => '.pms143-button[data-pms143-page="' + page.id + '"],#nav [data-nav="' + page.id + '"],#nav [data-page="' + page.id + '"],.nav-button[data-nav="' + page.id + '"],.nav-button[data-page="' + page.id + '"]').join(",");
    style.textContent = `
      ${hiddenSelectors}{display:none!important;visibility:hidden!important;width:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
      .pms129-color-panel,.pms134-pantone-grid{display:none!important}
      #pms170-top-globe.pms180-brand-fixed,
      body.pms166-restore-sidebar #pms170-top-globe.pms180-brand-fixed{
        min-height:146px!important;
        max-height:146px!important;
        grid-template-rows:70px 29px 26px!important;
        gap:6px!important;
        padding:8px 6px!important;
        overflow:visible!important;
      }
      #pms170-top-globe.pms180-brand-fixed .pms170-world{grid-row:1!important}
      #pms170-top-globe.pms180-brand-fixed .pms170-lit-name{
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
        grid-row:2!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        min-height:29px!important;
        max-height:29px!important;
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
      #pms170-top-globe.pms180-brand-fixed .pms170-payoff,
      #pms170-top-globe.pms180-brand-fixed [class*="payoff"]{
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
        box-shadow:0 0 18px rgba(255,255,255,.88),0 0 16px rgba(95,143,109,.22)!important;
      }
      .sidebar-footer{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        gap:0!important;
        padding:10px 0 2px!important;
        margin:0!important;
        border-top:1px solid rgba(95,143,109,.18)!important;
        background:transparent!important;
        min-height:58px!important;
      }
      .sidebar-footer > :not(#logout-button),#current-user{display:none!important;visibility:hidden!important;width:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
      #logout-button{
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:100%!important;
        min-height:48px!important;
        margin:0!important;
        padding:12px 16px!important;
        border-radius:10px!important;
        border:1px solid rgba(95,143,109,.32)!important;
        background:linear-gradient(90deg,#ffffff,#eef7f0,#ffffff)!important;
        color:#123524!important;
        font-size:15px!important;
        font-weight:950!important;
        letter-spacing:0!important;
        box-shadow:0 2px 10px rgba(15,23,42,.07)!important;
      }
      #logout-button:hover{background:linear-gradient(90deg,#eef7f0,#ffffff,#f9eeee)!important}
      .pms180-settings-tools{display:grid!important;gap:12px!important}
      .pms180-settings-tools h3{margin:0!important}
      .pms180-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
      .pms180-settings-tile{
        display:grid!important;
        grid-template-columns:42px minmax(0,1fr)!important;
        grid-template-rows:auto auto!important;
        gap:3px 9px!important;
        align-items:center!important;
        width:100%!important;
        margin:0!important;
        padding:12px!important;
        border:1px solid #d7dee8!important;
        border-radius:8px!important;
        background:#fff!important;
        color:#17242b!important;
        text-align:left!important;
      }
      .pms180-settings-tile span{grid-row:1/3;display:grid;place-items:center;width:38px;height:28px;border-radius:7px;background:#eef7f0;color:#376f52;font-weight:950;font-size:10px}
      .pms180-settings-tile strong{font-size:12px;color:#0f172a;line-height:1.15}
      .pms180-settings-tile small{font-size:10px;color:#64748b;line-height:1.2}
      @media(max-width:420px){#logout-button{min-height:44px!important;font-size:14px!important}.pms180-settings-grid{grid-template-columns:1fr}}
    `;
  }
  function decorate(){
    ensureModules();
    injectCss();
    hideTechnicalMenuItems();
    cleanFooter();
    ensureBrand();
    injectSettingsTools();
  }

  document.addEventListener("click", event => {
    const button = event.target && event.target.closest && event.target.closest("[data-pms180-open]");
    if (!button) return;
    event.preventDefault();
    saveCurrentPage(button.getAttribute("data-pms180-open"));
  }, true);

  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms180Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 80);
      setTimeout(decorate, 260);
      return result;
    };
    window.render.__pms180Wrapped = true;
  }

  [80, 240, 700, 1400].forEach(ms => setTimeout(decorate, ms));
  setInterval(decorate, 1200);
  window.PMS_V180_SETTINGS_MENU_CLEANUP_BRAND_FIX = {version:VERSION, decorate};
})();
