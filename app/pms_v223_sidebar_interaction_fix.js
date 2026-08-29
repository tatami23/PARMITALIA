(function () {
  "use strict";

  if (window.PMS_V223_SIDEBAR_INTERACTION_FIX) return;

  var VERSION = "pms_v223_sidebar_interaction_fix";
  var MENU_ID = "pms223-sidebar-menu";
  var STYLE_ID = "pms-v223-sidebar-interaction-style";
  var nativeSetTimeout = window.setTimeout.bind(window);

  var LABELS = {
    dashboard: ["DB", "Dashboard", "Principale"],
    marketTrends: ["MKT", "Andamenti mercato", "Principale"],
    operativo: ["OP", "Gestione operativa", "Principale"],
    assistant: ["BO", "Backoffice", "Principale"],
    communications: ["CRM", "CRM", "Principale"],
    officialCommunications: ["CU", "Comunicazioni ufficiali", "Principale"],
    trattativeInCorso: ["TRT", "Trattative", "Commerciale"],
    intermediations: ["INT", "Intermediazioni", "Commerciale"],
    offers: ["OFF", "Offerte", "Commerciale"],
    approvals: ["APP", "Autorizzazioni", "Commerciale"],
    orders: ["ORD", "Ordini", "Commerciale"],
    products: ["PRD", "Prodotti", "Commerciale"],
    priceHistory: ["PRE", "Storico prezzi", "Commerciale"],
    productForms: ["FRM", "Moduli prodotto", "Commerciale"],
    supplierPriceConfirmations: ["LST", "Listini fornitori", "Commerciale"],
    tenders: ["TEN", "Gare", "Commerciale"],
    commercialBrokerage: ["BRK", "Brokeraggio", "Commerciale"],
    contacts: ["ANA", "Anagrafiche", "Commerciale"],
    print: ["PRN", "Stampe", "Operativo"],
    supplierGeoGroupage: ["GEO", "Geo fornitori", "Operativo"],
    transportPrices: ["TRP", "Trasporti", "Operativo"],
    companyFleet: ["FLT", "Flotta", "Operativo"],
    packing: ["PKG", "Packing list", "Operativo"],
    documents: ["DOC", "Documenti", "Operativo"],
    accountant: ["ACC", "Commercialista", "Amministrazione"],
    billingWorkflow: ["FAT", "Fatturazione", "Amministrazione"],
    banks: ["BNK", "Banche", "Amministrazione"],
    payments: ["PAY", "Pagamenti", "Amministrazione"],
    agents: ["AG", "Agenti", "Amministrazione"],
    driverRecruiting: ["REC", "Recruiting autisti", "Personale"],
    humanResources: ["HR", "Dipendenti", "Personale"],
    foreignEmployees: ["EST", "Estero", "Personale"],
    foreignRecruiting: ["EST", "Recruiting estero", "Personale"],
    legalClaims: ["SIN", "Sinistri", "Legale"],
    legalProtocols: ["LEG", "Protocolli legali", "Legale"],
    contracts: ["CTR", "Contratti", "Legale"],
    contractTemplates: ["TPL", "Modelli contratti", "Legale"],
    customerInternalExtraction: ["CLI", "Estrazione clienti", "Sistema"],
    desktopCloudApp: ["APP", "App desktop", "Sistema"],
    desktopRoadmap: ["DEV", "Roadmap", "Sistema"],
    settings: ["SET", "Impostazioni", "Sistema"],
    admin: ["ADM", "Admin", "Sistema"]
  };

  var GROUPS = [
    "Principale",
    "Commerciale",
    "Operativo",
    "Amministrazione",
    "Personale",
    "Legale",
    "Sistema",
    "Altri moduli"
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function getCurrent() {
    try {
      if (typeof current !== "undefined" && current) return current;
    } catch (error) {}
    window.current = window.current || { user: "Carlo", role: "admin", page: "dashboard", filters: {} };
    return window.current;
  }

  function getModules() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) return modules;
    } catch (error) {}
    window.modules = window.modules || [];
    return window.modules;
  }

  function isRenderable(id) {
    try {
      if (typeof schemas !== "undefined" && schemas && schemas[id]) return true;
    } catch (error) {}
    if (LABELS[id]) return true;
    return getModules().some(function (module) { return module && module.id === id; });
  }

  function moduleInfo(module) {
    var fallback = String(module.id || "MOD");
    var known = LABELS[module.id] || [fallback.slice(0, 3).toUpperCase(), module.label || fallback, "Altri moduli"];
    return {
      code: known[0],
      label: module.label || known[1],
      group: known[2] || "Altri moduli"
    };
  }

  function visibleModules() {
    var role = getCurrent().role || "admin";
    var seen = {};
    return getModules().filter(function (module) {
      if (!module || !module.id || module.id === "cryptoMonitor" || seen[module.id]) return false;
      seen[module.id] = true;
      if (!isRenderable(module.id)) return false;
      if (role === "admin") return true;
      return !Array.isArray(module.roles) || module.roles.indexOf(role) >= 0;
    });
  }

  function injectCss() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "body.pms223-sidebar-fixed #app.app:not(.hidden){display:flex!important;visibility:visible!important;opacity:1!important;min-height:100vh!important}",
      "body.pms223-sidebar-fixed .sidebar{position:sticky!important;top:0!important;left:0!important;display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 312px!important;flex-direction:column!important;width:312px!important;min-width:312px!important;max-width:312px!important;height:100vh!important;min-height:100vh!important;max-height:100vh!important;transform:none!important;transition:none!important;z-index:2147483000!important;padding:10px!important;gap:8px!important;overflow:hidden!important;background:#102f2e!important;color:#fff!important;pointer-events:auto!important;box-shadow:none!important;border-radius:0!important}",
      "body.pms223-sidebar-fixed.device-phone .sidebar,body.pms223-sidebar-fixed.device-tablet .sidebar{position:sticky!important;top:0!important;left:0!important;transform:none!important;width:312px!important;min-width:312px!important;max-width:312px!important;height:100vh!important;max-height:100vh!important}",
      "body.pms223-sidebar-fixed .main{flex:1 1 auto!important;min-width:0!important;width:auto!important;position:relative!important;z-index:1!important}",
      "body.pms223-sidebar-fixed .mobile-menu-toggle{display:none!important;pointer-events:none!important}",
      "body.pms223-sidebar-fixed #nav,body.pms223-sidebar-fixed #pms143-menu,body.pms223-sidebar-fixed #pms152-menu,body.pms223-sidebar-fixed #pms163-menu-toggle,body.pms223-sidebar-fixed #pms164-menu-wrap,body.pms223-sidebar-fixed #pms165-top-menu,body.pms223-sidebar-fixed #pms200-main-menu,body.pms223-sidebar-fixed #pms218-menu,body.pms223-sidebar-fixed #pms221-full-menu,body.pms223-sidebar-fixed #pms222-menu{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;pointer-events:none!important}",
      "#" + MENU_ID + "{display:flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:2147483001!important;flex:1 1 auto!important;min-height:0!important;width:100%!important;flex-direction:column!important;gap:7px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:4px 2px 12px!important;pointer-events:auto!important}",
      ".pms223-group{display:flex!important;flex-direction:column!important;gap:5px!important;margin:0 0 8px!important}",
      ".pms223-title{color:rgba(255,255,255,.66)!important;font-size:10px!important;font-weight:900!important;line-height:1.1!important;text-transform:uppercase!important;letter-spacing:0!important;margin:7px 7px 2px!important}",
      ".pms223-button{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important;pointer-events:auto!important;font:inherit!important}",
      ".pms223-button:hover,.pms223-button:focus-visible,.pms223-button.active{background:#fff!important;color:#103a34!important;border-color:#fff!important;outline:0!important}",
      ".pms223-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:23px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important;line-height:1!important}",
      ".pms223-button:hover .pms223-code,.pms223-button:focus-visible .pms223-code,.pms223-button.active .pms223-code{background:#116149!important;color:#fff!important}",
      ".pms223-label{display:block!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12.5px!important;font-weight:850!important;line-height:1.15!important;letter-spacing:0!important}",
      ".sidebar-brand{display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;min-height:48px!important;margin:0!important;color:#fff!important;pointer-events:auto!important}",
      ".sidebar-footer{display:grid!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;gap:6px!important;margin-top:8px!important;color:rgba(255,255,255,.76)!important;pointer-events:auto!important}",
      "@media(max-width:720px){body.pms223-sidebar-fixed #app.app:not(.hidden){display:block!important}body.pms223-sidebar-fixed .sidebar,body.pms223-sidebar-fixed.device-phone .sidebar,body.pms223-sidebar-fixed.device-tablet .sidebar{position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;max-height:68vh!important}#" + MENU_ID + "{max-height:48vh!important}}",
      "@media print{body.pms223-sidebar-fixed .sidebar,body.pms223-sidebar-fixed #" + MENU_ID + "{display:none!important}}"
    ].join("\n");
    document.body.classList.add("pms223-sidebar-fixed");
  }

  function disableLegacyMenus() {
    [
      "nav",
      "pms143-menu",
      "pms152-menu",
      "pms163-menu-toggle",
      "pms164-menu-wrap",
      "pms165-top-menu",
      "pms200-main-menu",
      "pms218-menu",
      "pms221-full-menu",
      "pms222-menu"
    ].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node || node.id === MENU_ID) return;
      node.setAttribute("aria-hidden", "true");
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("pointer-events", "none", "important");
      node.style.setProperty("width", "0", "important");
      node.style.setProperty("height", "0", "important");
      node.style.setProperty("overflow", "hidden", "important");
    });
  }

  function forceSidebarVisible() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    sidebar.hidden = false;
    sidebar.removeAttribute("aria-hidden");
    sidebar.style.setProperty("display", "flex", "important");
    sidebar.style.setProperty("visibility", "visible", "important");
    sidebar.style.setProperty("opacity", "1", "important");
    sidebar.style.setProperty("transform", "none", "important");
    sidebar.style.setProperty("pointer-events", "auto", "important");
    sidebar.style.setProperty("z-index", "2147483000", "important");
    return sidebar;
  }

  function ensureHost() {
    injectCss();
    var sidebar = forceSidebarVisible();
    if (!sidebar) return null;
    var host = document.getElementById(MENU_ID);
    if (!host) {
      host = document.createElement("nav");
      host.id = MENU_ID;
      host.setAttribute("aria-label", "Menu laterale Parmitalia");
      var footer = sidebar.querySelector(".sidebar-footer");
      if (footer) sidebar.insertBefore(host, footer);
      else sidebar.appendChild(host);
    }
    host.hidden = false;
    host.removeAttribute("aria-hidden");
    host.style.setProperty("display", "flex", "important");
    host.style.setProperty("visibility", "visible", "important");
    host.style.setProperty("opacity", "1", "important");
    host.style.setProperty("pointer-events", "auto", "important");
    host.style.setProperty("z-index", "2147483001", "important");
    disableLegacyMenus();
    return host;
  }

  function drawMenu() {
    var host = ensureHost();
    if (!host) return;
    var grouped = {};
    GROUPS.forEach(function (group) { grouped[group] = []; });
    visibleModules().forEach(function (module) {
      var info = moduleInfo(module);
      (grouped[info.group] || grouped["Altri moduli"]).push({ id: module.id, info: info });
    });
    var page = getCurrent().page || "dashboard";
    var html = "";
    GROUPS.forEach(function (group) {
      var items = grouped[group] || [];
      if (!items.length) return;
      html += '<section class="pms223-group" aria-label="' + esc(group) + '"><div class="pms223-title">' + esc(group) + '</div>';
      items.forEach(function (entry) {
        var active = entry.id === page ? " active" : "";
        var currentAttr = active ? ' aria-current="page"' : "";
        html += '<button type="button" class="pms223-button' + active + '" data-pms223-page="' + esc(entry.id) + '"' + currentAttr + ' title="' + esc(entry.info.label) + '">' +
          '<span class="pms223-code">' + esc(entry.info.code) + '</span>' +
          '<span class="pms223-label">' + esc(entry.info.label) + '</span>' +
          '</button>';
      });
      html += "</section>";
    });
    if (!html) {
      html = '<section class="pms223-group"><div class="pms223-title">Menu</div><button type="button" class="pms223-button active" data-pms223-page="dashboard"><span class="pms223-code">DB</span><span class="pms223-label">Dashboard</span></button></section>';
    }
    if (host.dataset.pms223Html !== html) {
      host.innerHTML = html;
      host.dataset.pms223Html = html;
    }
  }

  function openPage(id) {
    if (!id) return;
    try {
      document.body.classList.remove("menu-open");
      if (typeof setPage === "function") setPage(id);
      else {
        getCurrent().page = id;
        if (typeof render === "function") render();
      }
    } catch (error) {
      try {
        getCurrent().page = id;
        if (typeof render === "function") render();
      } catch (inner) {}
    }
    nativeSetTimeout(drawMenu, 30);
    nativeSetTimeout(drawMenu, 180);
  }

  function bindEvents() {
    if (document.__pms223SidebarBound) return;
    document.__pms223SidebarBound = true;
    document.addEventListener("click", function (event) {
      var target = event.target;
      var button = target && target.closest && target.closest("[data-pms223-page]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      openPage(button.getAttribute("data-pms223-page"));
    }, true);
    document.addEventListener("keydown", function (event) {
      var host = document.getElementById(MENU_ID);
      if (!host || !host.contains(document.activeElement)) return;
      var buttons = Array.prototype.slice.call(host.querySelectorAll("[data-pms223-page]"));
      var index = buttons.indexOf(document.activeElement);
      var next = index;
      if (event.key === "ArrowDown") next = Math.min(buttons.length - 1, index + 1);
      else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      if (buttons[next]) buttons[next].focus();
    }, true);
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms223Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      nativeSetTimeout(drawMenu, 30);
      nativeSetTimeout(drawMenu, 180);
      return result;
    };
    wrapped.__pms223Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function install() {
    injectCss();
    bindEvents();
    wrap("render");
    wrap("renderNav");
    wrap("setPage");
    wrap("login");
    drawMenu();
    [80, 250, 700, 1400, 2600].forEach(function (ms) { nativeSetTimeout(drawMenu, ms); });
    var runs = 0;
    var guard = window.setInterval(function () {
      runs += 1;
      drawMenu();
      if (runs > 120) window.clearInterval(guard);
    }, 500);
    if (typeof MutationObserver === "function") {
      new MutationObserver(function () { nativeSetTimeout(drawMenu, 20); })
        .observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden"] });
    }
    console.info(VERSION + " loaded", { modules: visibleModules().length });
  }

  window.PMS_V223_SIDEBAR_INTERACTION_FIX = {
    version: VERSION,
    refresh: drawMenu,
    openPage: openPage
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
