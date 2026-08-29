(function () {
  "use strict";

  if (window.PMS_V224_NATIVE_SIDEBAR_STABLE) return;

  var VERSION = "pms_v224_native_sidebar_stable";
  var STYLE_ID = "pms-v224-native-sidebar-style";
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

  var ORDER = [
    "dashboard", "marketTrends", "operativo", "assistant", "communications", "officialCommunications",
    "trattativeInCorso", "intermediations", "offers", "approvals", "orders", "products", "priceHistory",
    "productForms", "supplierPriceConfirmations", "tenders", "commercialBrokerage", "contacts",
    "print", "supplierGeoGroupage", "transportPrices", "companyFleet", "packing", "documents",
    "accountant", "billingWorkflow", "banks", "payments", "agents",
    "driverRecruiting", "humanResources", "foreignEmployees", "foreignRecruiting",
    "legalClaims", "legalProtocols", "contracts", "contractTemplates",
    "customerInternalExtraction", "desktopCloudApp", "desktopRoadmap", "settings", "admin"
  ];

  var GROUPS = ["Principale", "Commerciale", "Operativo", "Amministrazione", "Personale", "Legale", "Sistema", "Altri moduli"];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function cur() {
    try {
      if (typeof current !== "undefined" && current) return current;
    } catch (error) {}
    window.current = window.current || { user: "Carlo", role: "admin", page: "dashboard", filters: {} };
    return window.current;
  }

  function moduleSource() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) return modules;
    } catch (error) {}
    return Array.isArray(window.modules) ? window.modules : [];
  }

  function visibleIds() {
    var role = cur().role || "admin";
    var seen = {};
    var ids = [];

    function allow(module) {
      if (!module || !module.id || module.id === "cryptoMonitor" || seen[module.id]) return;
      if (role !== "admin" && Array.isArray(module.roles) && module.roles.indexOf(role) < 0) return;
      seen[module.id] = true;
      ids.push(module.id);
    }

    ORDER.forEach(function (id) { allow({ id: id, roles: ["admin", "assistant", "accountant", "agent", "recruiter"] }); });
    moduleSource().forEach(allow);
    return ids;
  }

  function info(id) {
    var module = moduleSource().find(function (item) { return item && item.id === id; }) || {};
    var known = LABELS[id] || [String(id || "MOD").slice(0, 3).toUpperCase(), module.label || id, "Altri moduli"];
    return {
      code: known[0],
      label: module.label || known[1],
      group: known[2] || "Altri moduli"
    };
  }

  function css() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "body.pms224-menu-ok #app.app:not(.hidden){display:flex!important;visibility:visible!important;opacity:1!important;min-height:100vh!important}",
      "body.pms224-menu-ok .sidebar{position:sticky!important;top:0!important;left:0!important;display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 306px!important;flex-direction:column!important;width:306px!important;min-width:306px!important;max-width:306px!important;height:100vh!important;min-height:100vh!important;max-height:100vh!important;transform:none!important;z-index:999999!important;padding:10px!important;gap:8px!important;overflow:hidden!important;background:#102f2e!important;color:#fff!important;pointer-events:auto!important;border-radius:0!important}",
      "body.pms224-menu-ok.device-phone .sidebar,body.pms224-menu-ok.device-tablet .sidebar{position:sticky!important;top:0!important;left:0!important;transform:none!important;width:306px!important;min-width:306px!important;max-width:306px!important;height:100vh!important;max-height:100vh!important}",
      "body.pms224-menu-ok .main{flex:1 1 auto!important;min-width:0!important;width:auto!important;position:relative!important;z-index:1!important}",
      "body.pms224-menu-ok .mobile-menu-toggle{display:none!important;pointer-events:none!important}",
      "body.pms224-menu-ok #pms143-menu,body.pms224-menu-ok #pms152-menu,body.pms224-menu-ok #pms163-menu-toggle,body.pms224-menu-ok #pms164-menu-wrap,body.pms224-menu-ok #pms165-top-menu,body.pms224-menu-ok #pms200-main-menu,body.pms224-menu-ok #pms218-menu,body.pms224-menu-ok #pms221-full-menu,body.pms224-menu-ok #pms222-menu,body.pms224-menu-ok #pms223-sidebar-menu{display:none!important;visibility:hidden!important;width:0!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;pointer-events:none!important}",
      "html body.pms224-menu-ok #nav{display:flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:1000000!important;flex:1 1 auto!important;min-height:0!important;width:100%!important;height:auto!important;max-height:none!important;flex-direction:column!important;gap:7px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:4px 2px 12px!important;margin:0!important;pointer-events:auto!important}",
      "body.pms224-menu-ok #nav .pms224-group{display:flex!important;flex-direction:column!important;gap:5px!important;margin:0 0 8px!important}",
      "body.pms224-menu-ok #nav .pms224-title{color:rgba(255,255,255,.66)!important;font-size:10px!important;font-weight:900!important;line-height:1.1!important;text-transform:uppercase!important;letter-spacing:0!important;margin:7px 7px 2px!important}",
      "body.pms224-menu-ok #nav .nav-button{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important;pointer-events:auto!important;font:inherit!important;white-space:normal!important;overflow:visible!important}",
      "body.pms224-menu-ok #nav .nav-button:hover,body.pms224-menu-ok #nav .nav-button.active{background:#fff!important;color:#103a34!important;border-color:#fff!important}",
      "body.pms224-menu-ok #nav .pms224-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:23px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important;line-height:1!important}",
      "body.pms224-menu-ok #nav .nav-button:hover .pms224-code,body.pms224-menu-ok #nav .nav-button.active .pms224-code{background:#116149!important;color:#fff!important}",
      "body.pms224-menu-ok #nav .pms224-label{display:block!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12.5px!important;font-weight:850!important;line-height:1.15!important;letter-spacing:0!important}",
      "body.pms224-menu-ok .sidebar-brand,body.pms224-menu-ok .sidebar-footer{display:flex!important;visibility:visible!important;opacity:1!important;flex:0 0 auto!important;pointer-events:auto!important}",
      "body.pms224-menu-ok .sidebar-footer{display:grid!important;margin-top:8px!important;gap:6px!important}",
      "@media(max-width:720px){body.pms224-menu-ok #app.app:not(.hidden){display:block!important}body.pms224-menu-ok .sidebar,body.pms224-menu-ok.device-phone .sidebar,body.pms224-menu-ok.device-tablet .sidebar{position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;max-height:70vh!important}html body.pms224-menu-ok #nav{max-height:50vh!important}}"
    ].join("\n");
    document.body.classList.add("pms224-menu-ok");
  }

  function open(id) {
    if (!id) return;
    try { document.body.classList.remove("menu-open"); } catch (error) {}
    try {
      if (typeof setPage === "function") setPage(id);
      else {
        cur().page = id;
        if (typeof render === "function") render();
      }
    } catch (error) {
      cur().page = id;
      try { if (typeof render === "function") render(); } catch (inner) {}
    }
    nativeSetTimeout(build, 20);
    nativeSetTimeout(build, 160);
  }

  function build() {
    css();
    var sidebar = document.querySelector(".sidebar");
    var nav = document.getElementById("nav");
    if (!sidebar || !nav) return;

    sidebar.style.setProperty("display", "flex", "important");
    sidebar.style.setProperty("visibility", "visible", "important");
    sidebar.style.setProperty("opacity", "1", "important");
    sidebar.style.setProperty("transform", "none", "important");
    sidebar.style.setProperty("pointer-events", "auto", "important");

    nav.removeAttribute("aria-hidden");
    nav.hidden = false;
    nav.style.setProperty("display", "flex", "important");
    nav.style.setProperty("visibility", "visible", "important");
    nav.style.setProperty("opacity", "1", "important");
    nav.style.setProperty("pointer-events", "auto", "important");

    var grouped = {};
    GROUPS.forEach(function (group) { grouped[group] = []; });
    visibleIds().forEach(function (id) {
      var item = info(id);
      (grouped[item.group] || grouped["Altri moduli"]).push({ id: id, info: item });
    });

    var page = cur().page || "dashboard";
    var html = "";
    GROUPS.forEach(function (group) {
      var items = grouped[group] || [];
      if (!items.length) return;
      html += '<div class="pms224-group"><div class="pms224-title">' + esc(group) + '</div>';
      items.forEach(function (item) {
        var active = item.id === page ? " active" : "";
        html += '<button type="button" class="nav-button compact pms224-button' + active + '" data-page="' + esc(item.id) + '" data-pms224-page="' + esc(item.id) + '" title="' + esc(item.info.label) + '">' +
          '<span class="pms224-code">' + esc(item.info.code) + '</span><span class="pms224-label">' + esc(item.info.label) + '</span></button>';
      });
      html += "</div>";
    });

    if (nav.dataset.pms224Html !== html) {
      nav.innerHTML = html;
      nav.dataset.pms224Html = html;
    }
  }

  function bind() {
    if (document.__pms224Bound) return;
    document.__pms224Bound = true;
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest && event.target.closest("#nav [data-pms224-page]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      open(button.getAttribute("data-pms224-page"));
    }, true);
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms224Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      nativeSetTimeout(build, 20);
      nativeSetTimeout(build, 160);
      return result;
    };
    wrapped.__pms224Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function install() {
    bind();
    wrap("render");
    wrap("renderNav");
    wrap("setPage");
    wrap("login");
    build();
    [50, 150, 400, 900, 1800, 3000].forEach(function (ms) { nativeSetTimeout(build, ms); });
    var runs = 0;
    var guard = window.setInterval(function () {
      runs += 1;
      build();
      if (runs > 180) window.clearInterval(guard);
    }, 500);
    console.info(VERSION + " loaded", { menu: "native-nav", ids: visibleIds().length });
  }

  window.PMS_V224_NATIVE_SIDEBAR_STABLE = { version: VERSION, refresh: build, openPage: open };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
