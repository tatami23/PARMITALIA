(function () {
  "use strict";

  if (window.PMS_V200_MAIN_MENU_COMPLETE_FIX) return;
  window.PMS_V200_MAIN_MENU_COMPLETE_FIX = { version: "pms_v200_main_menu_complete_fix" };

  var nativeSetTimeout = window.setTimeout.bind(window);

  var LABELS = {
    dashboard: ["DB", "Dashboard", "Principale"],
    marketTrends: ["MKT", "Andamenti di mercato", "Principale"],
    operativo: ["OP", "Gestione operativa", "Principale"],
    assistant: ["BO", "Backoffice / Segretariato", "Principale"],
    communications: ["CRM", "Comunicazioni / CRM", "Principale"],
    officialCommunications: ["CU", "Comunicazioni ufficiali", "Principale"],
    trattativeInCorso: ["TRT", "Trattative in corso", "Commerciale"],
    intermediations: ["INT", "Intermediazioni", "Commerciale"],
    offers: ["OFF", "Offerte commerciali", "Commerciale"],
    approvals: ["APP", "Autorizzazioni Admin", "Commerciale"],
    orders: ["ORD", "Ordini", "Commerciale"],
    products: ["PRD", "Prodotti e articoli", "Commerciale"],
    priceHistory: ["PRE", "Storico prezzi", "Commerciale"],
    productForms: ["FRM", "Moduli", "Commerciale"],
    supplierPriceConfirmations: ["LST", "Listini e conferme fornitori", "Commerciale"],
    tenders: ["TEN", "Gare e richieste", "Commerciale"],
    commercialBrokerage: ["BRK", "Brokeraggio commerciale", "Commerciale"],
    contacts: ["ANA", "Anagrafiche clienti e fornitori", "Commerciale"],
    print: ["PRN", "Centro stampe", "Commerciale"],
    supplierGeoGroupage: ["GEO", "Geo fornitore", "Operativo"],
    transportPrices: ["TRP", "Trasporti", "Operativo"],
    companyFleet: ["FLT", "Flotta auto aziendale", "Operativo"],
    packing: ["PKG", "Packing list", "Operativo"],
    documents: ["DOC", "Archivio documenti", "Operativo"],
    accountant: ["ACC", "Commercialista", "Amministrazione"],
    billingWorkflow: ["FAT", "Fatturazione attiva e passiva", "Amministrazione"],
    banks: ["BNK", "Banche", "Amministrazione"],
    payments: ["PAY", "Pagamenti e garanzie", "Amministrazione"],
    agents: ["AG", "Agenti e provvigioni", "Amministrazione"],
    driverRecruiting: ["REC", "Recruiting autisti", "Risorse umane"],
    humanResources: ["HR", "Dipendenti azienda", "Risorse umane"],
    foreignEmployees: ["EST", "Dipendenti estero", "Risorse umane"],
    legalClaims: ["SIN", "Sinistri e pratiche legali", "Legale"],
    legalProtocols: ["LEG", "Protocolli legali", "Legale"],
    contracts: ["CTR", "Contratti", "Legale"],
    contractTemplates: ["TPL", "Modelli contrattuali", "Legale"],
    customerInternalExtraction: ["CLI", "Estrazione clienti interni", "Sistema"],
    desktopCloudApp: ["APP", "App Desktop Windows / macOS", "Sistema"],
    desktopRoadmap: ["DEV", "Piano applicazione desktop", "Sistema"],
    settings: ["SET", "Impostazioni", "Sistema"],
    admin: ["ADM", "Gestione utenti e ruoli", "Sistema"]
  };

  var GROUPS = [
    "Principale",
    "Commerciale",
    "Operativo",
    "Amministrazione",
    "Risorse umane",
    "Legale",
    "Sistema",
    "Altri moduli"
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function currentState() {
    if (window.current) return window.current;
    window.current = { user: "Carlo", role: "admin", page: "dashboard", filters: {} };
    return window.current;
  }

  function moduleList() {
    var source = Array.isArray(window.modules) ? window.modules.slice() :
      (typeof modules !== "undefined" && Array.isArray(modules) ? modules.slice() : []);
    var role = currentState().role || "admin";
    var seen = {};
    return source.filter(function (module) {
      if (!module || !module.id || module.id === "cryptoMonitor" || seen[module.id]) return false;
      seen[module.id] = true;
      if (role === "admin") return true;
      return !Array.isArray(module.roles) || module.roles.indexOf(role) >= 0;
    });
  }

  function moduleInfo(module) {
    var known = LABELS[module.id];
    return {
      code: known ? known[0] : String(module.id || "MOD").slice(0, 3).toUpperCase(),
      label: known ? known[1] : String(module.label || module.id || "Modulo"),
      group: known ? known[2] : "Altri moduli"
    };
  }

  function installCss() {
    var style = document.getElementById("pms200-main-menu-complete-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms200-main-menu-complete-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      html body.pms200-complete-menu .sidebar{
        position:sticky!important;
        top:0!important;
        display:flex!important;
        flex:0 0 318px!important;
        flex-direction:column!important;
        width:318px!important;
        min-width:318px!important;
        max-width:318px!important;
        height:100vh!important;
        min-height:100vh!important;
        max-height:100vh!important;
        gap:0!important;
        padding:10px!important;
        overflow:hidden!important;
        box-sizing:border-box!important;
      }
      html body.pms200-complete-menu .main{
        flex:1 1 auto!important;
        width:calc(100% - 318px)!important;
        min-width:0!important;
        max-width:none!important;
      }
      html body.pms200-complete-menu #pms152-menu,
      html body.pms200-complete-menu #nav,
      html body.pms200-complete-menu #pms163-menu-toggle,
      html body.pms200-complete-menu #pms164-menu-wrap,
      html body.pms200-complete-menu #pms165-top-menu{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
      html body.pms200-complete-menu #pms143-menu{
        position:static!important;
        display:flex!important;
        flex:1 1 auto!important;
        flex-direction:column!important;
        align-content:stretch!important;
        width:100%!important;
        min-width:0!important;
        min-height:0!important;
        max-height:none!important;
        gap:10px!important;
        margin:0!important;
        padding:2px 5px 12px 2px!important;
        overflow-x:hidden!important;
        overflow-y:scroll!important;
        scrollbar-gutter:stable!important;
        visibility:visible!important;
        opacity:1!important;
        box-sizing:border-box!important;
      }
      html body.pms200-complete-menu .pms200-menu-group{
        display:flex!important;
        flex:0 0 auto!important;
        flex-direction:column!important;
        width:100%!important;
        min-width:0!important;
        gap:4px!important;
        margin:0!important;
        padding:0!important;
      }
      html body.pms200-complete-menu .pms200-menu-group-title{
        display:block!important;
        width:100%!important;
        margin:0!important;
        padding:7px 8px 3px!important;
        color:#52606d!important;
        font-size:10px!important;
        font-weight:900!important;
        line-height:1.2!important;
        letter-spacing:0!important;
        text-align:left!important;
        text-transform:uppercase!important;
        white-space:normal!important;
      }
      html body.pms200-complete-menu .pms200-menu-button{
        display:grid!important;
        grid-template-columns:39px minmax(0,1fr)!important;
        align-items:center!important;
        gap:9px!important;
        width:100%!important;
        min-width:0!important;
        min-height:41px!important;
        height:auto!important;
        max-height:none!important;
        margin:0!important;
        padding:7px 9px!important;
        border:1px solid rgba(95,143,109,.24)!important;
        border-radius:7px!important;
        background:rgba(255,255,255,.94)!important;
        color:#17242b!important;
        box-shadow:none!important;
        font-family:inherit!important;
        letter-spacing:0!important;
        text-align:left!important;
        text-transform:none!important;
        visibility:visible!important;
        opacity:1!important;
        overflow:visible!important;
        box-sizing:border-box!important;
        cursor:pointer!important;
      }
      html body.pms200-complete-menu .pms200-menu-button:hover,
      html body.pms200-complete-menu .pms200-menu-button.active{
        border-color:#5f8f6d!important;
        background:#edf5ef!important;
      }
      html body.pms200-complete-menu .pms200-menu-code{
        display:inline-grid!important;
        place-items:center!important;
        width:37px!important;
        min-width:37px!important;
        height:22px!important;
        margin:0!important;
        padding:0 3px!important;
        border:1px solid rgba(95,143,109,.28)!important;
        border-radius:5px!important;
        background:#fff!important;
        color:#3f6b50!important;
        font-size:9px!important;
        font-weight:900!important;
        line-height:1!important;
        white-space:nowrap!important;
        box-sizing:border-box!important;
      }
      html body.pms200-complete-menu .pms200-menu-label{
        display:block!important;
        width:100%!important;
        min-width:0!important;
        max-width:100%!important;
        height:auto!important;
        max-height:none!important;
        margin:0!important;
        padding:0!important;
        color:#17242b!important;
        font-size:12.5px!important;
        font-weight:800!important;
        line-height:1.22!important;
        letter-spacing:0!important;
        text-align:left!important;
        white-space:normal!important;
        word-break:normal!important;
        overflow-wrap:break-word!important;
        overflow:visible!important;
        text-overflow:clip!important;
        visibility:visible!important;
        opacity:1!important;
      }
      html body.pms200-complete-menu .sidebar-footer{
        flex:0 0 auto!important;
        width:100%!important;
        margin:0!important;
        padding:8px 2px 0!important;
      }
      @media(max-width:860px){
        html body.pms200-complete-menu .app:not(.hidden){display:flex!important}
        html body.pms200-complete-menu .sidebar{
          position:sticky!important;
          width:292px!important;
          min-width:292px!important;
          max-width:292px!important;
          height:100vh!important;
          min-height:100vh!important;
          max-height:100vh!important;
        }
        html body.pms200-complete-menu .main{width:calc(100% - 292px)!important}
      }
      @media print{html body.pms200-complete-menu .sidebar{display:none!important}}
    `;
    document.body.classList.add("pms200-complete-menu");
  }

  function ensureHost() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    var host = document.getElementById("pms143-menu");
    if (!host) {
      host = document.createElement("div");
      host.id = "pms143-menu";
      var footer = sidebar.querySelector(".sidebar-footer");
      if (footer) sidebar.insertBefore(host, footer);
      else sidebar.appendChild(host);
    }
    host.removeAttribute("data-pms182-remove-sidebar-extra");
    return host;
  }

  function drawMenu() {
    installCss();
    var host = ensureHost();
    if (!host) return;
    var list = moduleList();
    var grouped = {};
    GROUPS.forEach(function (group) { grouped[group] = []; });
    list.forEach(function (module) {
      var info = moduleInfo(module);
      (grouped[info.group] || grouped["Altri moduli"]).push({ module: module, info: info });
    });
    var page = currentState().page;
    var html = "";
    GROUPS.forEach(function (group) {
      var items = grouped[group] || [];
      if (!items.length) return;
      html += '<section class="pms200-menu-group"><div class="pms200-menu-group-title">' + esc(group) + '</div>';
      items.forEach(function (entry) {
        var active = entry.module.id === page ? " active" : "";
        html += '<button type="button" class="pms200-menu-button' + active + '" data-pms200-menu-page="' + esc(entry.module.id) + '" title="' + esc(entry.info.label) + '">' +
          '<span class="pms200-menu-code">' + esc(entry.info.code) + '</span>' +
          '<b class="pms200-menu-label">' + esc(entry.info.label) + '</b>' +
          '</button>';
      });
      html += "</section>";
    });
    if (host.dataset.pms200CompleteHtml !== html) {
      host.innerHTML = html;
      host.dataset.pms200CompleteHtml = html;
    }
  }

  function openPage(id) {
    currentState().page = id;
    if (typeof window.render === "function") {
      try { window.render(); } catch (error) { console.warn("Parmitalia menu: apertura modulo", error); }
    }
    nativeSetTimeout(drawMenu, 30);
    nativeSetTimeout(drawMenu, 180);
  }

  function bindMenu() {
    var host = ensureHost();
    if (!host || host.dataset.pms200CompleteBound === "1") return;
    host.dataset.pms200CompleteBound = "1";
    host.addEventListener("click", function (event) {
      var button = event.target && event.target.closest && event.target.closest("[data-pms200-menu-page]");
      if (!button || !host.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      openPage(button.getAttribute("data-pms200-menu-page"));
    }, true);
  }

  function wrapFunction(name) {
    var original = window[name];
    if (typeof original !== "function" || original.__pms200CompleteMenuWrapped) return;
    var wrapped = function () {
      var result = original.apply(this, arguments);
      nativeSetTimeout(drawMenu, 25);
      nativeSetTimeout(drawMenu, 180);
      nativeSetTimeout(drawMenu, 500);
      return result;
    };
    wrapped.__pms200CompleteMenuWrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }

  function install() {
    installCss();
    bindMenu();
    wrapFunction("render");
    wrapFunction("renderNav");
    wrapFunction("setPage");
    drawMenu();
    nativeSetTimeout(drawMenu, 120);
    nativeSetTimeout(drawMenu, 650);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
