(function(){
  "use strict";

  const VERSION = "PMS-V140-FIX-DIRECT-MENU-SOFT-ITALY-WORLD-GLOBE";
  const ORDER = [
    "dashboard","marketTrends","operativo","assistant","communications",
    "offers","orders","supplierPriceConfirmations","products","tenders","intermediations","contacts","print",
    "accountant","banks","payments","agents",
    "contracts","contractTemplates","documents",
    "settings","admin"
  ];
  const META = {
    dashboard:["Dashboard","Visione generale","DB"],
    marketTrends:["Andamenti mercato","Prezzi e benchmark","MKT"],
    operativo:["Gestione operativa","Calendario carichi","OP"],
    assistant:["Assistente Carlo","Promemoria e attivita","BO"],
    communications:["Comunicazioni / CRM","Email e CRM","CRM"],
    offers:["Offerte","Offerte e conferme","OFF"],
    orders:["Ordini","Ordini cliente","ORD"],
    supplierPriceConfirmations:["Conferme prezzi","Prezzi fornitori","CLAL"],
    products:["Prodotti e Articoli","Schede prodotto","PRD"],
    tenders:["Gare e tender","Tender commerciali","TEN"],
    intermediations:["Intermediazioni","Trattative e provvigioni","INT"],
    contacts:["Database Anagrafiche","Clienti e fornitori","ANA"],
    print:["Stampe","Print Center","PRN"],
    accountant:["Commercialista","Documenti contabili","ACC"],
    banks:["Banche","Banche e garanzie","BNK"],
    payments:["Pagamenti","Scadenze pagamento","PAY"],
    agents:["Agenti","Agenti e commissioni","AG"],
    contracts:["Contratti","Archivio contratti","CTR"],
    contractTemplates:["Modelli contratti","Template legali","TPL"],
    documents:["Archivio documenti","Documenti collegati","DOC"],
    settings:["Impostazioni","Preferenze e backup","SET"],
    admin:["Admin","Controllo dati","ADM"]
  };
  const SOFT_ITALY = {
    green:"#5f8f6d",
    greenDark:"#3f6b50",
    red:"#bd7a78",
    redDark:"#965e5d",
    white:"#ffffff",
    bg:"#f7faf8",
    card:"#ffffff",
    text:"#17242b",
    muted:"#63736b",
    line:"#dfe9e4",
    sidebar:"#f7faf8",
    softGreen:"#edf6f0",
    softRed:"#f8eeee",
    shadow:"0 10px 28px rgba(35, 67, 49, 0.075)"
  };

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function saveLocal(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
    } catch(error) {
      console.warn(VERSION + " save skipped", error);
    }
  }
  function moduleList(){
    return (typeof modules !== "undefined" && Array.isArray(modules)) ? modules : [];
  }
  function ensureModule(id){
    const list = moduleList();
    const meta = META[id] || [id, "", id.slice(0,3).toUpperCase()];
    let mod = list.find(item => item.id === id);
    if (!mod) {
      mod = {id, label:meta[0], subtitle:meta[1], roles:["admin","assistant","accountant","agent"]};
      list.push(mod);
    }
    mod.label = meta[0];
    mod.subtitle = meta[1];
    mod.roles = Array.from(new Set([].concat(mod.roles || [], ["admin","assistant","accountant","agent"])));
    return mod;
  }
  function orderedModules(){
    const role = (typeof current !== "undefined" && current.role) ? current.role : "admin";
    const items = ORDER.map(ensureModule).filter(Boolean);
    return items.filter(item => item.id !== "admin" || role === "admin");
  }
  function navButton(mod){
    const currentPage = typeof current !== "undefined" ? current.page : "";
    const meta = META[mod.id] || [mod.label || mod.id, mod.subtitle || "", mod.id.slice(0,3).toUpperCase()];
    const active = currentPage === mod.id ? " active" : "";
    return '<button type="button" class="nav-button pms140-nav-button' + active + '" data-page="' + esc(mod.id) + '" title="' + esc(meta[1]) + '"><span class="pms140-code">' + esc(meta[2]) + '</span><span class="pms140-label">' + esc(meta[0]) + '</span></button>';
  }
  function go(id){
    if (typeof setPage === "function") setPage(id);
    else if (typeof current !== "undefined") {
      current.page = id;
      if (typeof render === "function") render();
    }
    setTimeout(renderStableMenu, 0);
  }
  function renderStableMenu(){
    const nav = document.getElementById("nav");
    if (!nav) return;
    nav.classList.add("pms140-direct-nav");
    nav.innerHTML = orderedModules().map(navButton).join("");
    nav.querySelectorAll("[data-page]").forEach(button => {
      button.onclick = () => go(button.getAttribute("data-page"));
    });
  }
  function applySoftItaly(){
    const root = document.documentElement;
    const vars = {
      "--bg":SOFT_ITALY.bg,
      "--card":SOFT_ITALY.card,
      "--text":SOFT_ITALY.text,
      "--muted":SOFT_ITALY.muted,
      "--primary":SOFT_ITALY.green,
      "--primary-dark":SOFT_ITALY.greenDark,
      "--secondary":SOFT_ITALY.red,
      "--line":SOFT_ITALY.line,
      "--danger":SOFT_ITALY.redDark,
      "--warning":"#b18a58",
      "--success":SOFT_ITALY.greenDark,
      "--shadow":SOFT_ITALY.shadow,
      "--radius":"12px",
      "--sidebar-color":SOFT_ITALY.sidebar,
      "--theme-primary":SOFT_ITALY.green,
      "--theme-primary-dark":SOFT_ITALY.greenDark,
      "--theme-secondary":SOFT_ITALY.red,
      "--theme-bg":SOFT_ITALY.bg,
      "--theme-soft":SOFT_ITALY.softGreen,
      "--theme-soft-2":SOFT_ITALY.softRed,
      "--theme-line":SOFT_ITALY.line,
      "--theme-shadow":"rgba(35,67,49,.075)"
    };
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    const settings = st().settings;
    settings.pms140Theme = "italia-leggero";
    settings.primaryColor = SOFT_ITALY.green;
    settings.secondaryColor = SOFT_ITALY.red;
    settings.sidebarColor = SOFT_ITALY.sidebar;
    settings.backgroundColor = SOFT_ITALY.bg;
    settings.cardColor = SOFT_ITALY.card;
    settings.textColor = SOFT_ITALY.text;
    settings.lineColor = SOFT_ITALY.line;
    saveLocal();
  }
  function injectCss(){
    let style = document.getElementById("pms-v140-direct-menu-italy-world");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v140-direct-menu-italy-world";
      document.head.appendChild(style);
    }
    style.textContent = `
      body{
        background:
          linear-gradient(120deg,rgba(95,143,109,.055),rgba(255,255,255,.28) 48%,rgba(189,122,120,.05)),
          ${SOFT_ITALY.bg}!important;
        color:${SOFT_ITALY.text}!important;
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        text-transform:none!important;
      }
      body input,body textarea,body select,body button{font-family:inherit!important;text-transform:none!important;letter-spacing:0!important}
      .login-screen{
        background:
          linear-gradient(120deg,rgba(95,143,109,.11),rgba(255,255,255,.88) 48%,rgba(189,122,120,.1)),
          ${SOFT_ITALY.bg}!important;
      }
      .login-card{
        border-color:${SOFT_ITALY.line}!important;
        border-radius:18px!important;
        box-shadow:${SOFT_ITALY.shadow}!important;
      }
      .brand-mark{
        background:linear-gradient(135deg,${SOFT_ITALY.green},#ffffff 50%,${SOFT_ITALY.red})!important;
        color:${SOFT_ITALY.greenDark}!important;
        border:1px solid ${SOFT_ITALY.line}!important;
      }
      body .sidebar,
      body.pms108-bottom-menu .sidebar,
      body.pms113-left-globe .sidebar{
        background:
          linear-gradient(90deg,rgba(95,143,109,.16),rgba(255,255,255,.78) 50%,rgba(189,122,120,.14)),
          ${SOFT_ITALY.sidebar}!important;
        color:${SOFT_ITALY.text}!important;
        border:1px solid ${SOFT_ITALY.line}!important;
        box-shadow:${SOFT_ITALY.shadow}!important;
        overflow:visible!important;
      }
      body .sidebar *,
      body .sidebar-brand strong,
      body .sidebar-brand span,
      body .sidebar-footer span{color:${SOFT_ITALY.text}!important;text-shadow:none!important}
      #nav.pms140-direct-nav{
        display:grid!important;
        grid-template-columns:1fr!important;
        gap:6px!important;
        overflow:auto!important;
        max-height:none!important;
        padding:2px!important;
        align-items:stretch!important;
      }
      body.pms108-bottom-menu #nav.pms140-direct-nav{
        display:flex!important;
        flex-direction:row!important;
        flex-wrap:nowrap!important;
        gap:6px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        max-height:72px!important;
        padding:2px 4px 6px!important;
      }
      body .nav-button.pms140-nav-button,
      body.pms108-bottom-menu .nav-button.pms140-nav-button{
        display:grid!important;
        grid-template-columns:36px minmax(0,1fr)!important;
        align-items:center!important;
        gap:8px!important;
        width:100%!important;
        min-height:39px!important;
        height:auto!important;
        padding:7px 9px!important;
        margin:0!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.18)!important;
        background:rgba(255,255,255,.74)!important;
        color:${SOFT_ITALY.text}!important;
        box-shadow:none!important;
        text-align:left!important;
        overflow:hidden!important;
        flex:0 0 auto!important;
      }
      body.pms108-bottom-menu .nav-button.pms140-nav-button{
        grid-template-columns:1fr!important;
        justify-items:center!important;
        width:112px!important;
        min-width:112px!important;
        max-width:112px!important;
        min-height:58px!important;
        padding:6px 5px!important;
        text-align:center!important;
      }
      body .nav-button.pms140-nav-button::before,
      body .nav-button.pms140-nav-button::after{display:none!important;content:none!important}
      body .nav-button.pms140-nav-button:hover,
      body .nav-button.pms140-nav-button.active,
      body.pms108-bottom-menu .nav-button.pms140-nav-button:hover,
      body.pms108-bottom-menu .nav-button.pms140-nav-button.active{
        background:linear-gradient(90deg,rgba(95,143,109,.16),rgba(255,255,255,.96),rgba(189,122,120,.12))!important;
        border-color:rgba(95,143,109,.36)!important;
        color:${SOFT_ITALY.greenDark}!important;
      }
      .pms140-code{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        width:34px!important;
        height:21px!important;
        border-radius:6px!important;
        background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.15))!important;
        color:${SOFT_ITALY.greenDark}!important;
        font-size:9px!important;
        font-weight:900!important;
        line-height:1!important;
      }
      body.pms108-bottom-menu .pms140-code{width:36px!important;height:18px!important;font-size:8px!important}
      .pms140-label{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:normal!important;
        line-height:1.12!important;
        font-size:11px!important;
        font-weight:800!important;
      }
      body.pms108-bottom-menu .pms140-label{font-size:9.5px!important;max-width:98px!important}
      body .topbar{
        background:rgba(255,255,255,.94)!important;
        border-bottom:1px solid ${SOFT_ITALY.line}!important;
        box-shadow:0 8px 20px rgba(35,67,49,.055)!important;
      }
      body .primary-button,body button.primary-button{
        background:${SOFT_ITALY.green}!important;
        border-color:${SOFT_ITALY.green}!important;
        color:#fff!important;
      }
      body .primary-button:hover,body button.primary-button:hover{
        background:${SOFT_ITALY.greenDark}!important;
        border-color:${SOFT_ITALY.greenDark}!important;
      }
      body .secondary-button,body .inline-button,body .import-label,body .folder-tab{
        background:#fff!important;
        border-color:${SOFT_ITALY.line}!important;
        color:${SOFT_ITALY.greenDark}!important;
        border-radius:8px!important;
      }
      body .secondary-button:hover,body .inline-button:hover,body .folder-tab.active{
        background:${SOFT_ITALY.softGreen}!important;
        border-color:#c9dbd0!important;
        color:${SOFT_ITALY.greenDark}!important;
      }
      body .card,body .table-wrap,body [class*="-panel"],body [class*="-box"],body .modal-card{
        background:${SOFT_ITALY.card}!important;
        border-color:${SOFT_ITALY.line}!important;
        box-shadow:${SOFT_ITALY.shadow}!important;
        border-radius:10px!important;
      }
      body th,body .table-wrap th{background:${SOFT_ITALY.softGreen}!important;color:${SOFT_ITALY.greenDark}!important}
      body [class*="-hero"],body .section-header,body [class*="-summary"],body [class*="-band"]{
        background:linear-gradient(90deg,rgba(95,143,109,.08),rgba(255,255,255,.9),rgba(189,122,120,.065))!important;
        border-color:${SOFT_ITALY.line}!important;
        border-left-color:${SOFT_ITALY.green}!important;
        box-shadow:none!important;
        color:${SOFT_ITALY.text}!important;
      }
      body.pms108-bottom-menu .pms106-hub{width:58px!important;height:58px!important}
      body.pms108-bottom-menu .pms106-globe,
      body.pms113-left-globe .pms109-world{
        width:56px!important;
        height:56px!important;
        background:
          radial-gradient(circle at 34% 28%,rgba(255,255,255,.9) 0 8%,transparent 9%),
          radial-gradient(circle at 32% 42%,#5f9b63 0 10%,transparent 11%),
          radial-gradient(circle at 56% 34%,#74aa64 0 12%,transparent 13%),
          radial-gradient(circle at 62% 62%,#477b52 0 11%,transparent 12%),
          radial-gradient(circle at 42% 68%,#6da15f 0 8%,transparent 9%),
          radial-gradient(circle at 38% 30%,#8fd2e6 0,#4aa3c5 44%,#2676a5 100%)!important;
        box-shadow:0 0 0 1px rgba(38,118,165,.24),inset -8px -10px 16px rgba(12,42,70,.22)!important;
      }
      body.pms108-bottom-menu .pms106-orbit,
      body.pms113-left-globe .pms109-logo-orbit{opacity:.44!important}
      body.pms113-left-globe .pms113-led-sign{
        background:rgba(255,255,255,.72)!important;
        border-color:${SOFT_ITALY.line}!important;
        color:${SOFT_ITALY.text}!important;
        box-shadow:none!important;
      }
      #print-root .print-document{font-family:Inter,Arial,sans-serif!important;text-transform:none!important}
    `;
  }
  function disableOldThemeButtonInterference(){
    document.querySelectorAll("[data-pms48-theme],[data-pms139-theme]").forEach(button => {
      const id = button.getAttribute("data-pms48-theme") || button.getAttribute("data-pms139-theme") || "italia";
      button.removeAttribute("data-pms48-theme");
      button.removeAttribute("data-pms139-theme");
      button.setAttribute("data-pms140-theme", id);
      button.onclick = null;
    });
  }
  function bindThemeButtons(){
    document.addEventListener("click", event => {
      const button = event.target && event.target.closest && event.target.closest("[data-pms140-theme]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      applySoftItaly();
      injectCss();
      disableOldThemeButtonInterference();
      document.querySelectorAll("[data-pms140-theme]").forEach(btn => btn.classList.toggle("active", btn === button));
    }, true);
  }
  function installMenu(){
    if (typeof renderNav !== "undefined") renderNav = renderStableMenu;
    window.renderNav = renderStableMenu;
  }
  function afterRender(){
    applySoftItaly();
    injectCss();
    installMenu();
    renderStableMenu();
    disableOldThemeButtonInterference();
  }
  function wrapRender(){
    if (typeof render !== "function" || render.pms140Wrapped) return;
    const baseRender = render;
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(afterRender, 0);
      setTimeout(afterRender, 120);
      return result;
    };
    render.pms140Wrapped = true;
  }
  function init(){
    applySoftItaly();
    injectCss();
    installMenu();
    wrapRender();
    bindThemeButtons();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", afterRender, {once:true});
    else afterRender();
    window.PMS_V140_FIX_DIRECT_MENU_SOFT_ITALY_WORLD_GLOBE = {version: VERSION};
  }

  init();
})();
