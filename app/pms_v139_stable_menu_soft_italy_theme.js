(function(){
  "use strict";

  const VERSION = "PMS-V139-STABLE-MENU-SOFT-ITALY-THEME";
  const ITALY = {
    primary: "#4f7f62",
    primaryDark: "#365c46",
    secondary: "#b86d6d",
    red: "#b86d6d",
    green: "#4f7f62",
    white: "#ffffff",
    sidebar: "#f6f8f7",
    bg: "#f7faf8",
    card: "#ffffff",
    text: "#17232b",
    muted: "#65736c",
    line: "#dfe8e3",
    softGreen: "#edf5f0",
    softRed: "#f8eeee",
    shadow: "0 12px 30px rgba(31, 55, 43, 0.08)"
  };

  const GROUPS = [
    {title:"Principale", ids:["dashboard","marketTrends","operativo","assistant","communications"]},
    {title:"Commerciale", ids:["offers","orders","supplierPriceConfirmations","products","tenders","intermediations","contacts","print"]},
    {title:"Amministrazione", ids:["accountant","banks","payments","agents"]},
    {title:"Legale / Archivio", ids:["contracts","contractTemplates","documents"]},
    {title:"Sistema", ids:["settings","admin"]}
  ];
  const FALLBACK_MODULES = [
    {id:"dashboard", label:"Dashboard", subtitle:"Visione generale operativa", roles:["admin","assistant","accountant","agent"]},
    {id:"marketTrends", label:"Andamenti di mercato", subtitle:"Prezzi e benchmark", roles:["admin","assistant","agent"]},
    {id:"operativo", label:"Gestione operativa", subtitle:"Calendario settimanale carichi", roles:["admin","assistant","accountant","agent"]},
    {id:"assistant", label:"Assistente Carlo", subtitle:"Promemoria e attivita", roles:["admin","assistant"]},
    {id:"communications", label:"Comunicazioni / CRM", subtitle:"Email e comunicazioni", roles:["admin","assistant","agent"]},
    {id:"offers", label:"Offerte", subtitle:"Offerte e stampe", roles:["admin","assistant","agent"]},
    {id:"orders", label:"Ordini", subtitle:"Ordini cliente", roles:["admin","assistant","agent"]},
    {id:"supplierPriceConfirmations", label:"Conferme prezzi fornitori", subtitle:"Listini e conferme", roles:["admin","assistant"]},
    {id:"products", label:"Prodotti e Articoli", subtitle:"Schede prodotto", roles:["admin","assistant","agent"]},
    {id:"tenders", label:"Gare e tender", subtitle:"Gare commerciali", roles:["admin","assistant"]},
    {id:"intermediations", label:"Intermediazioni", subtitle:"Trattative e provvigioni", roles:["admin","assistant","agent"]},
    {id:"contacts", label:"Database Anagrafiche", subtitle:"Clienti e fornitori", roles:["admin","assistant","accountant","agent"]},
    {id:"print", label:"Stampe", subtitle:"Print Center", roles:["admin","assistant","accountant","agent"]},
    {id:"accountant", label:"Commercialista", subtitle:"Documenti contabili", roles:["admin","assistant","accountant"]},
    {id:"banks", label:"Banche", subtitle:"Banche e garanzie", roles:["admin","assistant","accountant"]},
    {id:"payments", label:"Pagamenti", subtitle:"Scadenze pagamento", roles:["admin","assistant","accountant"]},
    {id:"agents", label:"Agenti", subtitle:"Agenti e commissioni", roles:["admin","assistant","accountant","agent"]},
    {id:"contracts", label:"Contratti", subtitle:"Archivio contratti", roles:["admin","assistant"]},
    {id:"contractTemplates", label:"Modelli contratti", subtitle:"Template legali", roles:["admin","assistant"]},
    {id:"documents", label:"Archivio documenti", subtitle:"Documenti collegati", roles:["admin","assistant","accountant"]},
    {id:"settings", label:"Impostazioni", subtitle:"Preferenze e backup", roles:["admin","assistant","accountant","agent"]},
    {id:"admin", label:"Admin", subtitle:"Controllo dati", roles:["admin"]}
  ];
  const CODES = {
    dashboard:"DB", marketTrends:"MKT", operativo:"OP", assistant:"BO", communications:"CRM",
    offers:"OFF", orders:"ORD", supplierPriceConfirmations:"CLAL", products:"PRD", tenders:"TEN",
    intermediations:"INT", contacts:"ANA", print:"PRN", accountant:"ACC", banks:"BNK",
    payments:"PAY", agents:"AG", contracts:"CTR", contractTemplates:"TPL", documents:"DOC",
    settings:"SET", admin:"ADM"
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
  function ensureModules(){
    window.modules = Array.isArray(window.modules) ? window.modules : (typeof modules !== "undefined" && Array.isArray(modules) ? modules : []);
    FALLBACK_MODULES.forEach(fallback => {
      let found = modules.find(item => item.id === fallback.id);
      if (!found) {
        found = Object.assign({}, fallback);
        modules.push(found);
      }
      found.label = found.label || fallback.label;
      found.subtitle = found.subtitle || fallback.subtitle;
      found.roles = Array.from(new Set([].concat(found.roles || [], fallback.roles || [])));
    });
    const operativo = modules.find(item => item.id === "operativo");
    if (operativo) {
      operativo.label = "Gestione operativa";
      operativo.subtitle = "Calendario settimanale carichi";
      operativo.roles = ["admin","assistant","accountant","agent"];
    }
  }
  function allowedModules(){
    ensureModules();
    const role = (window.current && current.role) || "admin";
    return modules.filter(item => role === "admin" || (item.roles || []).includes(role));
  }
  function goPage(id){
    if (!window.current) window.current = {page:id, filters:{}};
    if (typeof setPage === "function") setPage(id);
    else {
      current.page = id;
      if (typeof render === "function") render();
      stableRenderNav();
    }
  }
  function buttonHtml(module){
    const active = window.current && current.page === module.id ? " active" : "";
    return '<button type="button" class="nav-button' + active + '" data-page="' + esc(module.id) + '" title="' + esc(module.subtitle || module.label || module.id) + '"><span class="pms139-code">' + esc(CODES[module.id] || module.id.slice(0,3).toUpperCase()) + '</span><span class="pms139-label">' + esc(module.label || module.id) + '</span></button>';
  }
  function stableRenderNav(){
    ensureModules();
    const nav = document.getElementById("nav");
    if (!nav) return;
    const allowed = allowedModules();
    const byId = new Map(allowed.map(item => [item.id, item]));
    const used = new Set();
    const chunks = [];
    GROUPS.forEach(group => {
      const buttons = group.ids.map(id => byId.get(id)).filter(Boolean);
      if (!buttons.length) return;
      buttons.forEach(item => used.add(item.id));
      chunks.push('<div class="pms139-menu-group"><div class="pms139-menu-title">' + esc(group.title) + '</div><div class="pms139-menu-buttons">' + buttons.map(buttonHtml).join("") + '</div></div>');
    });
    const leftovers = allowed.filter(item => !used.has(item.id));
    if (leftovers.length) {
      chunks.push('<div class="pms139-menu-group"><div class="pms139-menu-title">Altro</div><div class="pms139-menu-buttons">' + leftovers.map(buttonHtml).join("") + '</div></div>');
    }
    nav.innerHTML = chunks.join("");
    nav.querySelectorAll("[data-page]").forEach(button => {
      button.onclick = () => goPage(button.getAttribute("data-page"));
    });
  }
  function applyItalyVars(){
    const root = document.documentElement;
    const vars = {
      "--bg": ITALY.bg,
      "--card": ITALY.card,
      "--text": ITALY.text,
      "--muted": ITALY.muted,
      "--primary": ITALY.primary,
      "--primary-dark": ITALY.primaryDark,
      "--secondary": ITALY.secondary,
      "--line": ITALY.line,
      "--success": ITALY.green,
      "--danger": ITALY.red,
      "--warning": "#b58a57",
      "--shadow": ITALY.shadow,
      "--radius": "14px",
      "--sidebar-color": ITALY.sidebar,
      "--theme-primary": ITALY.primary,
      "--theme-primary-dark": ITALY.primaryDark,
      "--theme-primary-deep": ITALY.primaryDark,
      "--theme-secondary": ITALY.secondary,
      "--theme-bg": ITALY.bg,
      "--theme-soft": ITALY.softGreen,
      "--theme-soft-2": ITALY.softRed,
      "--theme-line": ITALY.line,
      "--theme-line-strong": "#cbd9d1",
      "--theme-shadow": "rgba(31,55,43,.08)",
      "--pms48-theme-card": ITALY.card
    };
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
    const settings = st().settings;
    settings.pms139Theme = "italia-soft";
    settings.primaryColor = ITALY.primary;
    settings.secondaryColor = ITALY.secondary;
    settings.sidebarColor = ITALY.sidebar;
    settings.backgroundColor = ITALY.bg;
    settings.cardColor = ITALY.card;
    settings.textColor = ITALY.text;
    settings.lineColor = ITALY.line;
    saveLocal();
  }
  function injectCss(){
    let style = document.getElementById("pms-v139-stable-menu-italy");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v139-stable-menu-italy";
      document.head.appendChild(style);
    }
    style.textContent = `
      body{
        background:linear-gradient(115deg,rgba(79,127,98,.055),#f7faf8 38%,rgba(184,109,109,.052))!important;
        color:${ITALY.text}!important;
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        text-transform:none!important;
      }
      body input,body textarea,body select,body button{font-family:inherit!important;text-transform:none!important;letter-spacing:0!important}
      body .sidebar,
      body.pms108-bottom-menu .sidebar,
      body.pms113-left-globe .sidebar{
        background:
          linear-gradient(90deg,rgba(79,127,98,.16),rgba(255,255,255,.72) 48%,rgba(184,109,109,.15)),
          ${ITALY.sidebar}!important;
        color:${ITALY.text}!important;
        border:1px solid ${ITALY.line}!important;
        box-shadow:${ITALY.shadow}!important;
      }
      body .sidebar *,
      body .sidebar-brand strong,
      body .sidebar-brand span,
      body .sidebar-footer span{color:${ITALY.text}!important;text-shadow:none!important}
      #nav{display:flex!important;flex-direction:column!important;gap:9px!important;overflow:auto!important}
      body.pms108-bottom-menu #nav{flex-direction:row!important;align-items:stretch!important;gap:8px!important;max-height:92px!important;padding:3px 4px!important}
      .pms139-menu-group{display:flex;flex-direction:column;gap:5px;min-width:0}
      body.pms108-bottom-menu .pms139-menu-group{flex:0 0 auto;min-width:168px}
      .pms139-menu-title{font-size:10px;font-weight:800;color:#6b7770!important;text-transform:uppercase;padding:0 6px;white-space:nowrap}
      .pms139-menu-buttons{display:flex;flex-direction:column;gap:5px}
      body.pms108-bottom-menu .pms139-menu-buttons{display:grid;grid-template-columns:repeat(2,78px);gap:5px}
      body .nav-button,
      body.pms108-bottom-menu .nav-button{
        display:grid!important;
        grid-template-columns:34px minmax(0,1fr)!important;
        align-items:center!important;
        gap:7px!important;
        width:100%!important;
        min-height:40px!important;
        padding:7px 8px!important;
        border-radius:8px!important;
        border:1px solid rgba(79,127,98,.16)!important;
        background:rgba(255,255,255,.72)!important;
        color:${ITALY.text}!important;
        box-shadow:none!important;
        text-align:left!important;
        overflow:hidden!important;
      }
      body.pms108-bottom-menu .nav-button{
        grid-template-columns:1fr!important;
        justify-items:center!important;
        width:78px!important;
        min-height:50px!important;
        padding:6px 5px!important;
        text-align:center!important;
      }
      body .nav-button:hover,
      body .nav-button.active,
      body.pms108-bottom-menu .nav-button:hover,
      body.pms108-bottom-menu .nav-button.active{
        background:linear-gradient(90deg,rgba(79,127,98,.16),rgba(255,255,255,.92),rgba(184,109,109,.13))!important;
        border-color:rgba(79,127,98,.32)!important;
        color:${ITALY.primaryDark}!important;
      }
      .pms139-code{
        display:inline-flex!important;
        align-items:center!important;
        justify-content:center!important;
        min-width:30px!important;
        height:21px!important;
        border-radius:6px!important;
        background:linear-gradient(90deg,rgba(79,127,98,.18),#fff,rgba(184,109,109,.16))!important;
        color:${ITALY.primaryDark}!important;
        font-size:9px!important;
        font-weight:900!important;
      }
      body.pms108-bottom-menu .pms139-code{min-width:34px;height:18px;font-size:8px}
      .pms139-label{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:normal!important;
        line-height:1.12!important;
        font-size:11px!important;
        font-weight:800!important;
      }
      body.pms108-bottom-menu .pms139-label{font-size:9px!important;max-width:68px!important}
      body .topbar{
        background:rgba(255,255,255,.92)!important;
        border-bottom:1px solid ${ITALY.line}!important;
        box-shadow:0 8px 22px rgba(31,55,43,.055)!important;
      }
      body .primary-button,body button.primary-button{
        background:${ITALY.primary}!important;
        border-color:${ITALY.primary}!important;
        color:#fff!important;
      }
      body .primary-button:hover,body button.primary-button:hover{
        background:${ITALY.primaryDark}!important;
        border-color:${ITALY.primaryDark}!important;
      }
      body .secondary-button,body .inline-button,body .import-label,body .folder-tab{
        background:#fff!important;
        border-color:${ITALY.line}!important;
        color:${ITALY.primaryDark}!important;
        border-radius:8px!important;
      }
      body .secondary-button:hover,body .inline-button:hover,body .folder-tab.active{
        background:${ITALY.softGreen}!important;
        border-color:#c9dbd0!important;
        color:${ITALY.primaryDark}!important;
      }
      body .card,body .table-wrap,body [class*="-panel"],body [class*="-box"],body .modal-card{
        background:${ITALY.card}!important;
        border-color:${ITALY.line}!important;
        box-shadow:${ITALY.shadow}!important;
        border-radius:10px!important;
      }
      body th,body .table-wrap th{background:${ITALY.softGreen}!important;color:${ITALY.primaryDark}!important}
      body [class*="-hero"],body .section-header,body [class*="-summary"],body [class*="-band"]{
        background:linear-gradient(90deg,rgba(79,127,98,.08),rgba(255,255,255,.88),rgba(184,109,109,.07))!important;
        border-color:${ITALY.line}!important;
        border-left-color:${ITALY.primary}!important;
        box-shadow:none!important;
        color:${ITALY.text}!important;
      }
      body.pms108-bottom-menu .pms106-hub{width:58px!important;height:58px!important}
      body.pms108-bottom-menu .pms106-globe,
      body.pms113-left-globe .pms109-world{
        width:56px!important;
        height:56px!important;
        background:
          radial-gradient(circle at 35% 28%,rgba(255,255,255,.96) 0 18%,rgba(255,255,255,.72) 19% 30%,transparent 31%),
          linear-gradient(90deg,rgba(79,127,98,.55) 0 33%,rgba(255,255,255,.92) 33% 66%,rgba(184,109,109,.52) 66% 100%)!important;
        box-shadow:0 0 0 1px rgba(79,127,98,.2),inset -8px -10px 16px rgba(31,55,43,.12)!important;
      }
      body.pms108-bottom-menu .pms106-orbit,
      body.pms113-left-globe .pms109-logo-orbit{opacity:.42!important}
      body.pms113-left-globe .pms113-led-sign{
        background:rgba(255,255,255,.68)!important;
        border-color:${ITALY.line}!important;
        color:${ITALY.text}!important;
        box-shadow:none!important;
      }
      #print-root .print-document{font-family:Inter,Arial,sans-serif!important;text-transform:none!important}
    `;
  }
  function neutralizeOldThemeButtons(){
    document.querySelectorAll("[data-pms48-theme]").forEach(button => {
      const id = button.getAttribute("data-pms48-theme");
      button.setAttribute("data-pms139-theme", id || "italia");
      button.removeAttribute("data-pms48-theme");
      button.onclick = null;
    });
  }
  function bindThemeButtons(){
    document.addEventListener("click", event => {
      const button = event.target && event.target.closest && event.target.closest("[data-pms139-theme]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      applyItalyVars();
      injectCss();
      neutralizeOldThemeButtons();
      document.querySelectorAll("[data-pms139-theme]").forEach(btn => btn.classList.toggle("active", btn === button));
    }, true);
  }
  function installStableMenu(){
    window.renderNav = stableRenderNav;
    if (typeof renderNav !== "undefined") renderNav = stableRenderNav;
  }
  function afterRender(){
    ensureModules();
    applyItalyVars();
    injectCss();
    stableRenderNav();
    neutralizeOldThemeButtons();
  }
  function wrapRender(){
    if (typeof render !== "function" || render.pms139Wrapped) return;
    const baseRender = render;
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(afterRender, 0);
      setTimeout(afterRender, 60);
      return result;
    };
    render.pms139Wrapped = true;
  }
  function init(){
    ensureModules();
    applyItalyVars();
    injectCss();
    installStableMenu();
    wrapRender();
    bindThemeButtons();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", afterRender, {once:true});
    } else {
      afterRender();
    }
    window.PMS_V139_STABLE_MENU_SOFT_ITALY_THEME = {version: VERSION};
  }

  init();
})();
