(function () {
  "use strict";

  if (window.PMS_V227_FILL_BLANK_SIDEBAR_MENU) return;

  var VERSION = "pms_v227_fill_blank_sidebar_menu";
  var MENU_ID = "pms227-fill-sidebar-menu";
  var STYLE_ID = "pms-v227-fill-blank-sidebar-style";
  var nativeSetTimeout = window.setTimeout.bind(window);

  var LABELS = {
    dashboard: ["DB", "Dashboard"],
    marketTrends: ["MKT", "Andamenti mercato"],
    greenCoffee: ["CAF", "Caffe crudo"],
    operativo: ["OP", "Gestione operativa"],
    assistant: ["BO", "Backoffice"],
    communications: ["CRM", "CRM"],
    officialCommunications: ["CU", "Comunicazioni ufficiali"],
    trattativeInCorso: ["TRT", "Trattative"],
    intermediations: ["INT", "Intermediazioni"],
    offers: ["OFF", "Offerte"],
    approvals: ["APP", "Autorizzazioni"],
    orders: ["ORD", "Ordini"],
    products: ["PRD", "Prodotti"],
    priceHistory: ["PRE", "Storico prezzi"],
    productForms: ["FRM", "Moduli prodotto"],
    supplierPriceConfirmations: ["LST", "Listini fornitori"],
    tenders: ["TEN", "Gare"],
    commercialBrokerage: ["BRK", "Brokeraggio"],
    contacts: ["ANA", "Anagrafiche"],
    print: ["PRN", "Stampe"],
    supplierGeoGroupage: ["GEO", "Geo fornitori"],
    transportPrices: ["TRP", "Trasporti"],
    companyFleet: ["FLT", "Flotta"],
    packing: ["PKG", "Packing list"],
    documents: ["DOC", "Documenti"],
    accountant: ["ACC", "Commercialista"],
    billingWorkflow: ["FAT", "Fatturazione"],
    banks: ["BNK", "Banche"],
    payments: ["PAY", "Pagamenti"],
    agents: ["AG", "Agenti"],
    driverRecruiting: ["REC", "Recruiting autisti"],
    humanResources: ["HR", "Dipendenti"],
    foreignEmployees: ["EST", "Estero"],
    foreignRecruiting: ["FRE", "Recruiting estero"],
    legalClaims: ["SIN", "Sinistri"],
    legalProtocols: ["LEG", "Protocolli legali"],
    contracts: ["CTR", "Contratti"],
    contractTemplates: ["TPL", "Modelli contratti"],
    customerInternalExtraction: ["CLI", "Estrazione clienti"],
    desktopCloudApp: ["APP", "App desktop"],
    desktopRoadmap: ["DEV", "Roadmap"],
    settings: ["SET", "Impostazioni"],
    admin: ["ADM", "Admin"]
  };

  var ORDER = [
    "dashboard", "marketTrends", "greenCoffee", "operativo", "assistant", "communications", "officialCommunications",
    "trattativeInCorso", "intermediations", "offers", "approvals", "orders", "products",
    "priceHistory", "productForms", "supplierPriceConfirmations", "tenders", "commercialBrokerage", "contacts",
    "print", "supplierGeoGroupage", "transportPrices", "companyFleet", "packing", "documents",
    "accountant", "billingWorkflow", "banks", "payments", "agents",
    "driverRecruiting", "humanResources", "foreignEmployees", "foreignRecruiting",
    "legalClaims", "legalProtocols", "contracts", "contractTemplates",
    "customerInternalExtraction", "desktopCloudApp", "desktopRoadmap", "settings", "admin"
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function pageNow() {
    try {
      if (typeof current !== "undefined" && current && current.page) return current.page;
    } catch (error) {}
    return "";
  }

  function moduleSource() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) return modules;
    } catch (error) {}
    return Array.isArray(window.modules) ? window.modules : [];
  }

  function menuItems() {
    var source = moduleSource();
    var byId = {};
    source.forEach(function (module) {
      if (module && module.id && module.id !== "cryptoMonitor") byId[module.id] = module;
    });
    var seen = {};
    var items = [];
    function add(id) {
      if (!id || id === "cryptoMonitor" || seen[id]) return;
      seen[id] = true;
      var module = byId[id] || {};
      var known = LABELS[id] || [String(id).slice(0, 3).toUpperCase(), module.label || id];
      items.push([id, known[0], module.label || known[1]]);
    }
    ORDER.forEach(add);
    source.forEach(function (module) { if (module && module.id) add(module.id); });
    return items;
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "#" + MENU_ID + "{position:fixed!important;left:0!important;top:0!important;bottom:0!important;z-index:2147483600!important;display:flex!important;flex-direction:column!important;width:318px!important;height:100vh!important;padding:12px!important;background:#102f2e!important;color:#fff!important;box-shadow:8px 0 22px rgba(15,23,42,.18)!important;pointer-events:auto!important;overflow:hidden!important;font-family:Inter,Segoe UI,Arial,sans-serif!important}",
      "#" + MENU_ID + " .pms227-brand{display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;align-items:center!important;gap:10px!important;min-height:54px!important;padding:0 0 10px!important;border-bottom:1px solid rgba(255,255,255,.18)!important}",
      "#" + MENU_ID + " .pms227-mark{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;border-radius:10px!important;background:#fff!important;color:#116149!important;font-weight:950!important;font-size:20px!important}",
      "#" + MENU_ID + " strong{display:block!important;color:#fff!important;font-size:16px!important;line-height:1.05!important}",
      "#" + MENU_ID + " .pms227-sub{display:block!important;color:rgba(255,255,255,.72)!important;font-size:12px!important;line-height:1.15!important;margin-top:2px!important}",
      "#" + MENU_ID + " .pms227-list{display:flex!important;flex:1 1 auto!important;min-height:0!important;flex-direction:column!important;gap:6px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 2px 8px!important}",
      "#" + MENU_ID + " button{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important;pointer-events:auto!important;font:inherit!important;white-space:normal!important}",
      "#" + MENU_ID + " button:hover,#" + MENU_ID + " button.active{background:#fff!important;color:#103a34!important;border-color:#fff!important}",
      "#" + MENU_ID + " .pms227-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:23px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important;line-height:1!important}",
      "#" + MENU_ID + " button:hover .pms227-code,#" + MENU_ID + " button.active .pms227-code{background:#116149!important;color:#fff!important}",
      "#" + MENU_ID + " .pms227-label{display:block!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12.5px!important;font-weight:850!important;line-height:1.15!important;letter-spacing:0!important}",
      "#" + MENU_ID + " .pms227-foot{flex:0 0 auto!important;border-top:1px solid rgba(255,255,255,.18)!important;padding-top:8px!important;color:rgba(255,255,255,.7)!important;font-size:11px!important;line-height:1.25!important}",
      "@media(max-width:780px){#" + MENU_ID + "{position:relative!important;width:100%!important;height:auto!important;max-height:58vh!important}body{padding-top:0!important}}",
      "@media print{#" + MENU_ID + "{display:none!important}}"
    ].join("\n");
  }

  function openPage(page) {
    try { document.body.classList.remove("menu-open"); } catch (error) {}
    try {
      if (typeof setPage === "function") setPage(page);
      else {
        if (typeof current !== "undefined" && current) current.page = page;
        if (typeof render === "function") render();
      }
    } catch (error) {
      try {
        if (typeof current !== "undefined" && current) current.page = page;
        if (typeof render === "function") render();
      } catch (inner) {}
    }
    nativeSetTimeout(draw, 30);
    nativeSetTimeout(draw, 180);
  }

  function draw() {
    injectStyle();
    var menu = document.getElementById(MENU_ID);
    if (!menu) {
      menu = document.createElement("aside");
      menu.id = MENU_ID;
      menu.setAttribute("aria-label", "Menu Parmitalia");
      document.body.appendChild(menu);
    }
    var currentPage = pageNow();
    var buttons = menuItems().map(function (item) {
      var active = item[0] === currentPage ? " active" : "";
      return '<button type="button" class="pms227-item' + active + '" data-pms227-page="' + esc(item[0]) + '" title="' + esc(item[2]) + '">' +
        '<span class="pms227-code">' + esc(item[1]) + '</span>' +
        '<span class="pms227-label">' + esc(item[2]) + '</span>' +
        '</button>';
    }).join("");
    var html = '<div class="pms227-brand"><div class="pms227-mark">P</div><div><strong>Parmitalia</strong><span class="pms227-sub">Gestionale</span></div></div>' +
      '<div class="pms227-list">' + buttons + '</div>' +
      '<div class="pms227-foot">Menu stabile</div>';
    if (menu.dataset.pms227Html !== html) {
      menu.innerHTML = html;
      menu.dataset.pms227Html = html;
    }
  }

  function bind() {
    if (document.__pms227Bound) return;
    document.__pms227Bound = true;
    document.addEventListener("click", function (event) {
      var button = event.target && event.target.closest && event.target.closest("#" + MENU_ID + " [data-pms227-page]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      openPage(button.getAttribute("data-pms227-page"));
    }, true);
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms227Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      nativeSetTimeout(draw, 30);
      nativeSetTimeout(draw, 180);
      return result;
    };
    wrapped.__pms227Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function install() {
    bind();
    wrap("render");
    wrap("setPage");
    wrap("login");
    draw();
    [50, 150, 400, 900, 1800, 3000].forEach(function (ms) { nativeSetTimeout(draw, ms); });
    console.info(VERSION + " loaded");
  }

  window.PMS_V227_FILL_BLANK_SIDEBAR_MENU = { version: VERSION, refresh: draw, openPage: openPage };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
