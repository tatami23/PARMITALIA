(function(){
  "use strict";

  const VERSION = "PMS-V143-EXTERNAL-SIDEBAR-MENU-FINAL";
  const ITEMS = [
    ["dashboard","DB","Dashboard"],
    ["marketTrends","MKT","Andamenti di mercato"],
    ["operativo","OP","Gestione operativa"],
    ["assistant","BO","Backoffice / Segretariato"],
    ["communications","CRM","Comunicazioni / CRM"],
    ["officialCommunications","CU","Comunicazioni ufficiali"],
    ["trattativeInCorso","TRT","Trattative in corso"],
    ["intermediations","INT","Intermediazioni"],
    ["offers","OFF","Offerte commerciali"],
    ["approvals","APP","Autorizzazioni Admin"],
    ["orders","ORD","Ordini"],
    ["products","PRD","Prodotti e articoli"],
    ["productForms","FRM","Moduli prodotto"],
    ["supplierPriceConfirmations","LST","Listini e conferme fornitori"],
    ["tenders","TEN","Gare e richieste"],
    ["commercialBrokerage","BRK","Brokeraggio commerciale"],
    ["contacts","ANA","Anagrafiche clienti e fornitori"],
    ["print","PRN","Centro stampe"],
    ["supplierGeoGroupage","GEO","Geo fornitore"],
    ["transportPrices","TRP","Trasporti"],
    ["packing","PKG","Packing list"],
    ["documents","DOC","Archivio documenti"],
    ["accountant","ACC","Commercialista"],
    ["billingWorkflow","FAT","Fatturazione attiva e passiva"],
    ["banks","BNK","Banche"],
    ["payments","PAY","Pagamenti e garanzie"],
    ["agents","AG","Agenti e provvigioni"],
    ["driverRecruiting","REC","Recruiting autisti"],
    ["humanResources","HR","Dipendenti azienda"],
    ["foreignEmployees","EST","Dipendenti estero"],
    ["legalClaims","SIN","Sinistri e pratiche legali"],
    ["legalProtocols","LEG","Protocolli legali"],
    ["contracts","CTR","Contratti"],
    ["contractTemplates","TPL","Modelli contrattuali"],
    ["customerInternalExtraction","CLI","Estrazione clienti interni"],
    ["desktopCloudApp","APP","App Desktop Windows / macOS"],
    ["desktopRoadmap","DEV","Piano applicazione desktop"],
    ["cryptoMonitor","CRY","Crypto monitor"],
    ["settings","SET","Impostazioni"],
    ["admin","ADM","Gestione utenti e ruoli"]
  ];
  const C = {
    green:"#5f8f6d",
    greenDark:"#3f6b50",
    red:"#bd7a78",
    bg:"#f7faf8",
    text:"#17242b",
    line:"#dfe9e4"
  };

  function esc(v){
    return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function cur(){
    if (typeof current !== "undefined") return current;
    window.current = window.current || {user:"Carlo", role:"admin", page:"dashboard", filters:{}};
    return window.current;
  }
  function item(id){
    return ITEMS.find(x => x[0] === id) || ITEMS[0];
  }
  function visible(){
    const role = cur().role || "admin";
    return ITEMS.filter(x => x[0] !== "admin" || role === "admin");
  }
  function ensureModules(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    ITEMS.forEach(x => {
      let mod = modules.find(m => m.id === x[0]);
      if (!mod) {
        mod = {id:x[0], label:x[2], subtitle:x[2], roles:["admin","assistant","accountant","agent"]};
        modules.push(mod);
      }
      mod.label = x[2];
      mod.subtitle = mod.subtitle || x[2];
      mod.roles = Array.from(new Set([].concat(mod.roles || [], ["admin","assistant","accountant","agent"])));
    });
  }
  function ensureHost(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    let host = document.getElementById("pms143-menu");
    if (!host) {
      host = document.createElement("div");
      host.id = "pms143-menu";
      host.className = "pms143-menu";
      const oldNav = document.getElementById("nav");
      if (oldNav) sidebar.insertBefore(host, oldNav);
      else {
        const footer = sidebar.querySelector(".sidebar-footer");
        if (footer) sidebar.insertBefore(host, footer);
        else sidebar.appendChild(host);
      }
    }
    return host;
  }
  function setTitle(id){
    const x = item(id);
    const t = document.getElementById("page-title");
    const s = document.getElementById("page-subtitle");
    if (t) t.textContent = x[2];
    if (s) s.textContent = x[2];
  }
  function open(id){
    cur().page = id;
    setTitle(id);
    try {
      if (typeof render === "function") render();
    } catch(e) {
      console.warn(VERSION + " render failed", e);
    }
    setTimeout(draw, 0);
    setTimeout(draw, 80);
  }
  function draw(){
    ensureModules();
    applyTheme();
    injectCss();
    const host = ensureHost();
    if (!host) return;
    const page = cur().page || "dashboard";
    host.innerHTML = visible().map(x => {
      const active = x[0] === page ? " active" : "";
      return '<button type="button" class="pms143-button' + active + '" data-pms143-page="' + esc(x[0]) + '"><span>' + esc(x[1]) + '</span><b>' + esc(x[2]) + '</b></button>';
    }).join("");
    host.querySelectorAll("[data-pms143-page]").forEach(btn => {
      btn.onclick = () => open(btn.getAttribute("data-pms143-page"));
    });
    const oldNav = document.getElementById("nav");
    if (oldNav) oldNav.setAttribute("data-pms143-hidden", "1");
  }
  function loginHard(){
    const name = document.getElementById("login-name");
    const role = document.getElementById("login-role");
    cur().user = (name && name.value) || "Carlo";
    cur().role = (role && role.value) || "admin";
    const login = document.getElementById("login-screen");
    const app = document.getElementById("app");
    const user = document.getElementById("current-user");
    if (login) login.classList.add("hidden");
    if (app) app.classList.remove("hidden");
    if (user) user.textContent = cur().user + " - " + cur().role;
    open("dashboard");
  }
  function hook(){
    const loginButton = document.getElementById("login-button");
    if (loginButton && loginButton.dataset.pms143 !== "1") {
      loginButton.dataset.pms143 = "1";
      loginButton.addEventListener("click", e => {
        e.preventDefault();
        e.stopImmediatePropagation();
        loginHard();
      }, true);
    }
  }
  function applyTheme(){
    const root = document.documentElement;
    root.style.setProperty("--bg", C.bg);
    root.style.setProperty("--card", "#fff");
    root.style.setProperty("--text", C.text);
    root.style.setProperty("--primary", C.green);
    root.style.setProperty("--primary-dark", C.greenDark);
    root.style.setProperty("--secondary", C.red);
    root.style.setProperty("--line", C.line);
  }
  function injectCss(){
    let style = document.getElementById("pms-v143-external-menu-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v143-external-menu-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body{background:linear-gradient(120deg,rgba(95,143,109,.055),rgba(255,255,255,.42),rgba(189,122,120,.05)),${C.bg}!important;color:${C.text}!important;text-transform:none!important}
      .sidebar{background:linear-gradient(90deg,rgba(95,143,109,.15),rgba(255,255,255,.88) 50%,rgba(189,122,120,.12)),${C.bg}!important;color:${C.text}!important;border-color:${C.line}!important;overflow:visible!important}
      .sidebar *{color:${C.text}!important;text-shadow:none!important}
      #nav[data-pms143-hidden="1"]{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;max-height:0!important;overflow:hidden!important;padding:0!important;margin:0!important}
      #pms143-menu{display:grid!important;grid-template-columns:1fr!important;gap:6px!important;overflow:auto!important;min-height:220px!important;max-height:calc(100vh - 190px)!important;padding:4px!important;visibility:visible!important;opacity:1!important}
      body.pms108-bottom-menu #pms143-menu{display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;gap:6px!important;overflow-x:auto!important;overflow-y:hidden!important;min-height:66px!important;max-height:78px!important;padding:3px 4px 7px!important}
      .pms143-button{display:grid!important;grid-template-columns:38px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border-radius:8px!important;border:1px solid rgba(95,143,109,.22)!important;background:rgba(255,255,255,.82)!important;text-align:left!important;box-shadow:none!important;cursor:pointer!important}
      body.pms108-bottom-menu .pms143-button{grid-template-columns:1fr!important;justify-items:center!important;width:116px!important;min-width:116px!important;max-width:116px!important;min-height:58px!important;text-align:center!important;padding:6px 5px!important;flex:0 0 auto!important}
      .pms143-button:hover,.pms143-button.active{background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.13))!important;border-color:rgba(95,143,109,.42)!important}
      .pms143-button span{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:21px!important;border-radius:6px!important;background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.16))!important;color:${C.greenDark}!important;font-size:9px!important;font-weight:900!important}
      body.pms108-bottom-menu .pms143-button span{height:18px!important;font-size:8px!important}
      .pms143-button b{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:normal!important;line-height:1.12!important;font-size:11px!important;font-weight:800!important;color:${C.text}!important}
      body.pms108-bottom-menu .pms143-button b{font-size:9.5px!important;max-width:102px!important}
      .brand-mark{background:linear-gradient(135deg,${C.green},#fff 50%,${C.red})!important;color:${C.greenDark}!important;border:1px solid ${C.line}!important}
      .primary-button,button.primary-button{background:${C.green}!important;border-color:${C.green}!important;color:#fff!important}
      .secondary-button,.inline-button,.import-label{background:#fff!important;border-color:${C.line}!important;color:${C.greenDark}!important}
      body.pms108-bottom-menu .pms106-globe,body.pms113-left-globe .pms109-world{background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.9) 0 8%,transparent 9%),radial-gradient(circle at 32% 42%,#5f9b63 0 10%,transparent 11%),radial-gradient(circle at 56% 34%,#74aa64 0 12%,transparent 13%),radial-gradient(circle at 62% 62%,#477b52 0 11%,transparent 12%),radial-gradient(circle at 38% 30%,#8fd2e6 0,#4aa3c5 44%,#2676a5 100%)!important}
    `;
  }
  function install(){
    window.renderNav = draw;
    if (typeof renderNav !== "undefined") renderNav = draw;
    window.setPage = open;
    if (typeof setPage !== "undefined") setPage = open;
    window.login = loginHard;
    if (typeof login !== "undefined") login = loginHard;
    if (typeof render === "function" && !render.pms143Wrapped) {
      const base = render;
      render = function(){
        const out = base.apply(this, arguments);
        setTimeout(draw, 0);
        setTimeout(draw, 120);
        return out;
      };
      render.pms143Wrapped = true;
    }
    hook();
    draw();
    [100,300,800,1500,3000].forEach(ms => setTimeout(draw, ms));
    setInterval(draw, 2000);
    window.PMS_V143_EXTERNAL_SIDEBAR_MENU_FINAL = {version: VERSION};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
})();
