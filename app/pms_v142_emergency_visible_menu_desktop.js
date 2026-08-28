(function(){
  "use strict";

  const VERSION = "PMS-V142-EMERGENCY-VISIBLE-MENU-DESKTOP";
  const ITEMS = [
    ["dashboard","DB","Dashboard","Visione generale"],
    ["marketTrends","MKT","Andamenti mercato","Prezzi e benchmark"],
    ["operativo","OP","Gestione operativa","Calendario carichi"],
    ["assistant","BO","Assistente Carlo","Promemoria"],
    ["communications","CRM","Comunicazioni / CRM","Email e CRM"],
    ["offers","OFF","Offerte","Offerte"],
    ["orders","ORD","Ordini","Ordini cliente"],
    ["supplierPriceConfirmations","CLAL","Conferme prezzi","Prezzi fornitori"],
    ["products","PRD","Prodotti e Articoli","Schede prodotto"],
    ["tenders","TEN","Gare e tender","Tender"],
    ["intermediations","INT","Intermediazioni","Trattative"],
    ["contacts","ANA","Database Anagrafiche","Clienti e fornitori"],
    ["print","PRN","Stampe","Print Center"],
    ["accountant","ACC","Commercialista","Contabilita"],
    ["banks","BNK","Banche","Banche"],
    ["payments","PAY","Pagamenti","Scadenze"],
    ["agents","AG","Agenti","Commissioni"],
    ["contracts","CTR","Contratti","Contratti"],
    ["contractTemplates","TPL","Modelli contratti","Template"],
    ["documents","DOC","Archivio documenti","Documenti"],
    ["settings","SET","Impostazioni","Preferenze"],
    ["admin","ADM","Admin","Controllo dati"]
  ];
  const COLORS = {
    green:"#5f8f6d",
    greenDark:"#3f6b50",
    red:"#bd7a78",
    bg:"#f7faf8",
    card:"#ffffff",
    text:"#17242b",
    line:"#dfe9e4",
    softGreen:"#edf6f0",
    softRed:"#f8eeee"
  };
  let busy = false;

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function getCurrent(){
    if (typeof current !== "undefined") return current;
    window.current = window.current || {user:"Carlo", role:"admin", page:"dashboard", filters:{}};
    return window.current;
  }
  function itemById(id){
    return ITEMS.find(item => item[0] === id) || ITEMS[0];
  }
  function visibleItems(){
    const role = getCurrent().role || "admin";
    return ITEMS.filter(item => item[0] !== "admin" || role === "admin");
  }
  function applyTheme(){
    const root = document.documentElement;
    const vars = {
      "--bg":COLORS.bg,
      "--card":COLORS.card,
      "--text":COLORS.text,
      "--primary":COLORS.green,
      "--primary-dark":COLORS.greenDark,
      "--secondary":COLORS.red,
      "--line":COLORS.line,
      "--sidebar-color":COLORS.bg,
      "--theme-primary":COLORS.green,
      "--theme-primary-dark":COLORS.greenDark,
      "--theme-secondary":COLORS.red,
      "--theme-bg":COLORS.bg,
      "--theme-soft":COLORS.softGreen,
      "--theme-soft-2":COLORS.softRed,
      "--theme-line":COLORS.line
    };
    Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
  }
  function injectCss(){
    let style = document.getElementById("pms-v142-emergency-visible-menu");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v142-emergency-visible-menu";
      document.head.appendChild(style);
    }
    style.textContent = `
      body{background:linear-gradient(120deg,rgba(95,143,109,.055),rgba(255,255,255,.42),rgba(189,122,120,.05)),${COLORS.bg}!important;color:${COLORS.text}!important;text-transform:none!important}
      body button,body input,body select,body textarea{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;text-transform:none!important;letter-spacing:0!important}
      #app.app{display:flex!important}
      #app.hidden{display:none!important}
      .sidebar{display:flex!important;flex-direction:column!important;visibility:visible!important;opacity:1!important;background:linear-gradient(90deg,rgba(95,143,109,.15),rgba(255,255,255,.86) 50%,rgba(189,122,120,.13)),${COLORS.bg}!important;color:${COLORS.text}!important;border-color:${COLORS.line}!important;box-shadow:0 10px 28px rgba(35,67,49,.075)!important}
      .sidebar *{color:${COLORS.text}!important;text-shadow:none!important}
      #nav{display:flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
      #nav.pms142-menu{flex:1 1 auto!important;min-height:0!important;max-height:none!important;overflow:auto!important;display:grid!important;grid-template-columns:1fr!important;gap:6px!important;padding:4px!important}
      body.pms108-bottom-menu #nav.pms142-menu{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;overflow-x:auto!important;overflow-y:hidden!important;max-height:78px!important;min-height:66px!important;padding:3px 4px 7px!important}
      .pms142-button{display:grid!important;grid-template-columns:38px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:40px!important;height:auto!important;margin:0!important;padding:7px 9px!important;border-radius:8px!important;border:1px solid rgba(95,143,109,.2)!important;background:rgba(255,255,255,.8)!important;color:${COLORS.text}!important;text-align:left!important;box-shadow:none!important;overflow:hidden!important;flex:0 0 auto!important}
      body.pms108-bottom-menu .pms142-button{grid-template-columns:1fr!important;justify-items:center!important;width:116px!important;min-width:116px!important;max-width:116px!important;min-height:58px!important;text-align:center!important;padding:6px 5px!important}
      .pms142-button::before,.pms142-button::after{display:none!important;content:none!important}
      .pms142-button:hover,.pms142-button.active{background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.13))!important;border-color:rgba(95,143,109,.42)!important;color:${COLORS.greenDark}!important}
      .pms142-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:21px!important;border-radius:6px!important;background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.16))!important;color:${COLORS.greenDark}!important;font-size:9px!important;font-weight:900!important;line-height:1!important}
      body.pms108-bottom-menu .pms142-code{height:18px!important;font-size:8px!important}
      .pms142-label{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:normal!important;line-height:1.12!important;font-size:11px!important;font-weight:800!important;color:${COLORS.text}!important}
      body.pms108-bottom-menu .pms142-label{font-size:9.5px!important;max-width:102px!important}
      .login-screen{background:linear-gradient(120deg,rgba(95,143,109,.12),rgba(255,255,255,.92) 50%,rgba(189,122,120,.1)),${COLORS.bg}!important}
      .brand-mark{background:linear-gradient(135deg,${COLORS.green},#fff 50%,${COLORS.red})!important;color:${COLORS.greenDark}!important;border:1px solid ${COLORS.line}!important}
      .primary-button,button.primary-button{background:${COLORS.green}!important;border-color:${COLORS.green}!important;color:#fff!important}
      .secondary-button,.inline-button,.import-label{background:#fff!important;border-color:${COLORS.line}!important;color:${COLORS.greenDark}!important}
      .card,.table-wrap,[class*="-panel"],[class*="-box"],.modal-card{border-color:${COLORS.line}!important;box-shadow:0 10px 28px rgba(35,67,49,.06)!important}
      body.pms108-bottom-menu .pms106-globe,body.pms113-left-globe .pms109-world{background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.9) 0 8%,transparent 9%),radial-gradient(circle at 32% 42%,#5f9b63 0 10%,transparent 11%),radial-gradient(circle at 56% 34%,#74aa64 0 12%,transparent 13%),radial-gradient(circle at 62% 62%,#477b52 0 11%,transparent 12%),radial-gradient(circle at 38% 30%,#8fd2e6 0,#4aa3c5 44%,#2676a5 100%)!important}
    `;
  }
  function ensureNavElement(){
    let nav = document.getElementById("nav");
    if (nav) return nav;
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    nav = document.createElement("nav");
    nav.id = "nav";
    const footer = sidebar.querySelector(".sidebar-footer");
    if (footer) sidebar.insertBefore(nav, footer);
    else sidebar.appendChild(nav);
    return nav;
  }
  function renderMenu(){
    const nav = ensureNavElement();
    if (!nav) return;
    const cur = getCurrent();
    nav.className = "pms142-menu";
    nav.innerHTML = visibleItems().map(item => {
      const active = cur.page === item[0] ? " active" : "";
      return '<button type="button" class="nav-button pms142-button' + active + '" data-page="' + esc(item[0]) + '" title="' + esc(item[3]) + '"><span class="pms142-code">' + esc(item[1]) + '</span><span class="pms142-label">' + esc(item[2]) + '</span></button>';
    }).join("");
    nav.querySelectorAll("[data-page]").forEach(button => {
      button.onclick = () => openPage(button.getAttribute("data-page"));
    });
  }
  function updateTitle(id){
    const item = itemById(id);
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = item[2];
    if (subtitle) subtitle.textContent = item[3] || "";
  }
  function openPage(id){
    const cur = getCurrent();
    cur.page = id;
    updateTitle(id);
    try {
      if (typeof render === "function") render();
    } catch(error) {
      console.warn(VERSION + " render failed", error);
    }
    setTimeout(enforce, 0);
    setTimeout(enforce, 80);
  }
  function loginHard(){
    const cur = getCurrent();
    const name = document.getElementById("login-name");
    const role = document.getElementById("login-role");
    cur.user = (name && name.value) || "Carlo";
    cur.role = (role && role.value) || "admin";
    const loginScreen = document.getElementById("login-screen");
    const app = document.getElementById("app");
    const currentUser = document.getElementById("current-user");
    if (loginScreen) loginScreen.classList.add("hidden");
    if (app) app.classList.remove("hidden");
    if (currentUser) currentUser.textContent = cur.user + " - " + cur.role;
    openPage("dashboard");
  }
  function hookButtons(){
    const loginButton = document.getElementById("login-button");
    if (loginButton && loginButton.dataset.pms142Ready !== "1") {
      loginButton.dataset.pms142Ready = "1";
      loginButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        loginHard();
      }, true);
    }
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton && logoutButton.dataset.pms142Ready !== "1") {
      logoutButton.dataset.pms142Ready = "1";
      logoutButton.addEventListener("click", () => setTimeout(enforce, 0), true);
    }
  }
  function installGlobals(){
    window.renderNav = renderMenu;
    if (typeof renderNav !== "undefined") renderNav = renderMenu;
    window.setPage = openPage;
    if (typeof setPage !== "undefined") setPage = openPage;
    window.login = loginHard;
    if (typeof login !== "undefined") login = loginHard;
  }
  function wrapRender(){
    if (typeof render !== "function" || render.pms142Wrapped) return;
    const base = render;
    render = function(){
      const result = base.apply(this, arguments);
      setTimeout(enforce, 0);
      setTimeout(enforce, 120);
      return result;
    };
    render.pms142Wrapped = true;
  }
  function enforce(){
    if (busy) return;
    busy = true;
    try {
      applyTheme();
      injectCss();
      hookButtons();
      installGlobals();
      renderMenu();
    } finally {
      busy = false;
    }
  }
  function start(){
    installGlobals();
    wrapRender();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enforce, {once:true});
    else enforce();
    [100, 300, 800, 1500, 3000].forEach(ms => setTimeout(enforce, ms));
    setInterval(enforce, 2500);
    window.PMS_V142_EMERGENCY_VISIBLE_MENU_DESKTOP = {version: VERSION};
  }

  start();
})();
