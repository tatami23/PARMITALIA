(function(){
  "use strict";

  const VERSION = "PMS-V141-DESKTOP-MENU-HARD-FIX";
  const ORDER = [
    "dashboard","marketTrends","operativo","assistant","communications",
    "offers","orders","supplierPriceConfirmations","products","tenders","intermediations","contacts","print",
    "accountant","banks","payments","agents",
    "contracts","contractTemplates","documents","settings","admin"
  ];
  const META = {
    dashboard:{label:"Dashboard", subtitle:"Visione generale", code:"DB", roles:["admin","assistant","accountant","agent"]},
    marketTrends:{label:"Andamenti mercato", subtitle:"Prezzi e benchmark", code:"MKT", roles:["admin","assistant","agent"]},
    operativo:{label:"Gestione operativa", subtitle:"Calendario settimanale carichi", code:"OP", roles:["admin","assistant","accountant","agent"]},
    assistant:{label:"Assistente Carlo", subtitle:"Promemoria e attivita", code:"BO", roles:["admin","assistant"]},
    communications:{label:"Comunicazioni / CRM", subtitle:"Email e CRM", code:"CRM", roles:["admin","assistant","agent"]},
    offers:{label:"Offerte", subtitle:"Offerte e conferme", code:"OFF", roles:["admin","assistant","agent"]},
    orders:{label:"Ordini", subtitle:"Ordini cliente", code:"ORD", roles:["admin","assistant","agent"]},
    supplierPriceConfirmations:{label:"Conferme prezzi", subtitle:"Prezzi fornitori", code:"CLAL", roles:["admin","assistant"]},
    products:{label:"Prodotti e Articoli", subtitle:"Schede prodotto", code:"PRD", roles:["admin","assistant","agent"]},
    tenders:{label:"Gare e tender", subtitle:"Tender commerciali", code:"TEN", roles:["admin","assistant"]},
    intermediations:{label:"Intermediazioni", subtitle:"Trattative e provvigioni", code:"INT", roles:["admin","assistant","agent"]},
    contacts:{label:"Database Anagrafiche", subtitle:"Clienti e fornitori", code:"ANA", roles:["admin","assistant","accountant","agent"]},
    print:{label:"Stampe", subtitle:"Print Center", code:"PRN", roles:["admin","assistant","accountant","agent"]},
    accountant:{label:"Commercialista", subtitle:"Documenti contabili", code:"ACC", roles:["admin","assistant","accountant"]},
    banks:{label:"Banche", subtitle:"Banche e garanzie", code:"BNK", roles:["admin","assistant","accountant"]},
    payments:{label:"Pagamenti", subtitle:"Scadenze pagamento", code:"PAY", roles:["admin","assistant","accountant"]},
    agents:{label:"Agenti", subtitle:"Agenti e commissioni", code:"AG", roles:["admin","assistant","accountant","agent"]},
    contracts:{label:"Contratti", subtitle:"Archivio contratti", code:"CTR", roles:["admin","assistant"]},
    contractTemplates:{label:"Modelli contratti", subtitle:"Template legali", code:"TPL", roles:["admin","assistant"]},
    documents:{label:"Archivio documenti", subtitle:"Documenti collegati", code:"DOC", roles:["admin","assistant","accountant"]},
    settings:{label:"Impostazioni", subtitle:"Preferenze e backup", code:"SET", roles:["admin","assistant","accountant","agent"]},
    admin:{label:"Admin", subtitle:"Controllo dati", code:"ADM", roles:["admin"]}
  };
  const COLORS = {
    green:"#5f8f6d", greenDark:"#3f6b50", red:"#bd7a78", redDark:"#965e5d",
    bg:"#f7faf8", card:"#ffffff", text:"#17242b", muted:"#63736b", line:"#dfe9e4",
    softGreen:"#edf6f0", softRed:"#f8eeee", shadow:"0 10px 28px rgba(35,67,49,.075)"
  };

  let enforcing = false;

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function role(){
    return (typeof current !== "undefined" && current.role) || "admin";
  }
  function page(){
    return (typeof current !== "undefined" && current.page) || "dashboard";
  }
  function setTitle(id){
    const meta = META[id] || META.dashboard;
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = meta.label;
    if (subtitle) subtitle.textContent = meta.subtitle || "";
  }
  function ensureModules(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    ORDER.forEach(id => {
      const meta = META[id];
      let mod = modules.find(item => item.id === id);
      if (!mod) {
        mod = {id, label:meta.label, subtitle:meta.subtitle, roles:meta.roles.slice()};
        modules.push(mod);
      }
      mod.label = meta.label;
      mod.subtitle = meta.subtitle;
      mod.roles = Array.from(new Set([].concat(mod.roles || [], meta.roles)));
    });
  }
  function visibleIds(){
    const r = role();
    return ORDER.filter(id => id !== "admin" || r === "admin").filter(id => {
      const meta = META[id];
      return r === "admin" || !meta || meta.roles.includes(r);
    });
  }
  function button(id){
    const meta = META[id] || {label:id, subtitle:"", code:id.slice(0,3).toUpperCase()};
    const active = page() === id ? " active" : "";
    return '<button type="button" class="nav-button pms141-menu-button' + active + '" data-page="' + esc(id) + '" title="' + esc(meta.subtitle) + '"><span class="pms141-code">' + esc(meta.code) + '</span><span class="pms141-text">' + esc(meta.label) + '</span></button>';
  }
  function drawMenu(){
    const nav = document.getElementById("nav");
    if (!nav) return;
    const ids = visibleIds();
    const existing = Array.from(nav.children).map(node => node.getAttribute && node.getAttribute("data-page")).filter(Boolean);
    if (existing.length === ids.length && existing.every((id, index) => id === ids[index]) && nav.classList.contains("pms141-direct-menu")) {
      nav.querySelectorAll("[data-page]").forEach(btn => btn.classList.toggle("active", btn.getAttribute("data-page") === page()));
      return;
    }
    nav.className = (nav.className || "").replace(/\bpms139[^\s]*/g, "").replace(/\bpms140[^\s]*/g, "");
    nav.classList.add("pms141-direct-menu");
    nav.innerHTML = ids.map(button).join("");
    nav.querySelectorAll("[data-page]").forEach(btn => {
      btn.onclick = () => hardSetPage(btn.getAttribute("data-page"));
    });
  }
  function hardSetPage(id){
    if (typeof current !== "undefined") current.page = id;
    setTitle(id);
    if (typeof render === "function") render();
    setTimeout(enforce, 0);
    setTimeout(enforce, 80);
  }
  function hardRenderNav(){
    ensureModules();
    drawMenu();
  }
  function hardLogin(){
    if (typeof current !== "undefined") {
      const name = document.getElementById("login-name");
      const loginRole = document.getElementById("login-role");
      current.user = (name && name.value) || "Carlo";
      current.role = (loginRole && loginRole.value) || "admin";
    }
    const loginScreen = document.getElementById("login-screen");
    const app = document.getElementById("app");
    const user = document.getElementById("current-user");
    if (loginScreen) loginScreen.classList.add("hidden");
    if (app) app.classList.remove("hidden");
    if (user && typeof current !== "undefined") user.textContent = current.user + " - " + current.role;
    hardRenderNav();
    hardSetPage("dashboard");
  }
  function applyColors(){
    const root = document.documentElement;
    const vars = {
      "--bg":COLORS.bg, "--card":COLORS.card, "--text":COLORS.text, "--muted":COLORS.muted,
      "--primary":COLORS.green, "--primary-dark":COLORS.greenDark, "--secondary":COLORS.red,
      "--line":COLORS.line, "--danger":COLORS.redDark, "--warning":"#b18a58", "--success":COLORS.greenDark,
      "--shadow":COLORS.shadow, "--radius":"12px", "--sidebar-color":COLORS.bg,
      "--theme-primary":COLORS.green, "--theme-primary-dark":COLORS.greenDark, "--theme-secondary":COLORS.red,
      "--theme-bg":COLORS.bg, "--theme-soft":COLORS.softGreen, "--theme-soft-2":COLORS.softRed,
      "--theme-line":COLORS.line, "--theme-shadow":"rgba(35,67,49,.075)"
    };
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  }
  function injectCss(){
    let style = document.getElementById("pms-v141-desktop-menu-hard-fix");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v141-desktop-menu-hard-fix";
      document.head.appendChild(style);
    }
    style.textContent = `
      body{background:linear-gradient(120deg,rgba(95,143,109,.055),rgba(255,255,255,.35) 50%,rgba(189,122,120,.05)),${COLORS.bg}!important;color:${COLORS.text}!important;text-transform:none!important}
      body input,body textarea,body select,body button{font-family:inherit!important;text-transform:none!important;letter-spacing:0!important}
      .login-screen{background:linear-gradient(120deg,rgba(95,143,109,.12),rgba(255,255,255,.9) 50%,rgba(189,122,120,.1)),${COLORS.bg}!important}
      .login-card{border-color:${COLORS.line}!important;border-radius:18px!important;box-shadow:${COLORS.shadow}!important}
      .brand-mark{background:linear-gradient(135deg,${COLORS.green},#fff 50%,${COLORS.red})!important;color:${COLORS.greenDark}!important;border:1px solid ${COLORS.line}!important}
      body .sidebar,body.pms108-bottom-menu .sidebar,body.pms113-left-globe .sidebar{background:linear-gradient(90deg,rgba(95,143,109,.15),rgba(255,255,255,.82) 50%,rgba(189,122,120,.13)),${COLORS.bg}!important;color:${COLORS.text}!important;border:1px solid ${COLORS.line}!important;box-shadow:${COLORS.shadow}!important;overflow:visible!important}
      body .sidebar *,body .sidebar-brand strong,body .sidebar-brand span,body .sidebar-footer span{color:${COLORS.text}!important;text-shadow:none!important}
      #nav.pms141-direct-menu{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;overflow:auto!important;max-height:none!important;padding:2px!important;align-items:stretch!important}
      body.pms108-bottom-menu #nav.pms141-direct-menu{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:6px!important;overflow-x:auto!important;overflow-y:hidden!important;max-height:76px!important;padding:2px 4px 6px!important}
      body .nav-button.pms141-menu-button,body.pms108-bottom-menu .nav-button.pms141-menu-button{display:grid!important;grid-template-columns:36px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:39px!important;height:auto!important;padding:7px 9px!important;margin:0!important;border-radius:8px!important;border:1px solid rgba(95,143,109,.18)!important;background:rgba(255,255,255,.76)!important;color:${COLORS.text}!important;box-shadow:none!important;text-align:left!important;overflow:hidden!important;flex:0 0 auto!important}
      body.pms108-bottom-menu .nav-button.pms141-menu-button{grid-template-columns:1fr!important;justify-items:center!important;width:112px!important;min-width:112px!important;max-width:112px!important;min-height:58px!important;padding:6px 5px!important;text-align:center!important}
      body .nav-button.pms141-menu-button::before,body .nav-button.pms141-menu-button::after{display:none!important;content:none!important}
      body .nav-button.pms141-menu-button:hover,body .nav-button.pms141-menu-button.active{background:linear-gradient(90deg,rgba(95,143,109,.16),rgba(255,255,255,.96),rgba(189,122,120,.12))!important;border-color:rgba(95,143,109,.36)!important;color:${COLORS.greenDark}!important}
      .pms141-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:34px!important;height:21px!important;border-radius:6px!important;background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.15))!important;color:${COLORS.greenDark}!important;font-size:9px!important;font-weight:900!important;line-height:1!important}
      body.pms108-bottom-menu .pms141-code{width:36px!important;height:18px!important;font-size:8px!important}
      .pms141-text{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:normal!important;line-height:1.12!important;font-size:11px!important;font-weight:800!important}
      body.pms108-bottom-menu .pms141-text{font-size:9.5px!important;max-width:98px!important}
      body .topbar{background:rgba(255,255,255,.94)!important;border-bottom:1px solid ${COLORS.line}!important;box-shadow:0 8px 20px rgba(35,67,49,.055)!important}
      body .primary-button,body button.primary-button{background:${COLORS.green}!important;border-color:${COLORS.green}!important;color:#fff!important}
      body .primary-button:hover,body button.primary-button:hover{background:${COLORS.greenDark}!important;border-color:${COLORS.greenDark}!important}
      body .secondary-button,body .inline-button,body .import-label,body .folder-tab{background:#fff!important;border-color:${COLORS.line}!important;color:${COLORS.greenDark}!important;border-radius:8px!important}
      body .secondary-button:hover,body .inline-button:hover,body .folder-tab.active{background:${COLORS.softGreen}!important;border-color:#c9dbd0!important;color:${COLORS.greenDark}!important}
      body .card,body .table-wrap,body [class*="-panel"],body [class*="-box"],body .modal-card{background:${COLORS.card}!important;border-color:${COLORS.line}!important;box-shadow:${COLORS.shadow}!important;border-radius:10px!important}
      body th,body .table-wrap th{background:${COLORS.softGreen}!important;color:${COLORS.greenDark}!important}
      body [class*="-hero"],body .section-header,body [class*="-summary"],body [class*="-band"]{background:linear-gradient(90deg,rgba(95,143,109,.08),rgba(255,255,255,.9),rgba(189,122,120,.065))!important;border-color:${COLORS.line}!important;border-left-color:${COLORS.green}!important;box-shadow:none!important;color:${COLORS.text}!important}
      body.pms108-bottom-menu .pms106-hub{width:58px!important;height:58px!important}
      body.pms108-bottom-menu .pms106-globe,body.pms113-left-globe .pms109-world{width:56px!important;height:56px!important;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.9) 0 8%,transparent 9%),radial-gradient(circle at 32% 42%,#5f9b63 0 10%,transparent 11%),radial-gradient(circle at 56% 34%,#74aa64 0 12%,transparent 13%),radial-gradient(circle at 62% 62%,#477b52 0 11%,transparent 12%),radial-gradient(circle at 42% 68%,#6da15f 0 8%,transparent 9%),radial-gradient(circle at 38% 30%,#8fd2e6 0,#4aa3c5 44%,#2676a5 100%)!important;box-shadow:0 0 0 1px rgba(38,118,165,.24),inset -8px -10px 16px rgba(12,42,70,.22)!important}
    `;
  }
  function enforce(){
    if (enforcing) return;
    enforcing = true;
    try {
      applyColors();
      injectCss();
      ensureModules();
      drawMenu();
    } finally {
      enforcing = false;
    }
  }
  function wrapRender(){
    if (typeof render !== "function" || render.pms141Wrapped) return;
    const baseRender = render;
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(enforce, 0);
      setTimeout(enforce, 100);
      return result;
    };
    render.pms141Wrapped = true;
  }
  function install(){
    ensureModules();
    applyColors();
    injectCss();
    if (typeof renderNav !== "undefined") renderNav = hardRenderNav;
    window.renderNav = hardRenderNav;
    if (typeof setPage !== "undefined") setPage = hardSetPage;
    window.setPage = hardSetPage;
    if (typeof login !== "undefined") login = hardLogin;
    window.login = hardLogin;
    wrapRender();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enforce, {once:true});
    else enforce();
    setTimeout(enforce, 250);
    setTimeout(enforce, 1000);
    window.PMS_V141_DESKTOP_MENU_HARD_FIX = {version: VERSION};
  }

  install();
})();
