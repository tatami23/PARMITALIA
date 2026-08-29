(function () {
  "use strict";

  if (window.PMS_V231_COLLAPSIBLE_ZONE_MENU) return;

  var VERSION = "pms_v231_collapsible_zone_submenu";
  var MENU_ID = "pms231-zone-menu";
  var STYLE_ID = "pms-v231-zone-menu-style";
  var STORE_KEY = "pms_v231_zone_menu_state";
  var nativeSetTimeout = window.setTimeout.bind(window);

  var LABELS = {
    dashboard: ["DB", "Dashboard"],
    marketTrends: ["MKT", "Andamenti mercato"],
    forecastingHub: ["PRE", "Previsionale"],
    greenCoffee: ["CAF", "Caffe crudo"],
    productionDairy: ["LAT", "Produzione latte"],
    operativo: ["OP", "Gestione operativa"],
    secretariatHub: ["SEG", "Segreteria"],
    assistant: ["BO", "Back office"],
    communications: ["CRM", "Comunicazioni CRM"],
    officialCommunications: ["CU", "Comunicazioni ufficiali"],
    contacts: ["ANA", "Anagrafiche"],
    customerInternalExtraction: ["CLI", "Estrazione clienti"],
    commercialHub: ["COM", "Commerciale"],
    trattativeInCorso: ["TRT", "Trattative"],
    intermediations: ["INT", "Intermediazioni"],
    offers: ["OFF", "Offerte"],
    orders: ["ORD", "Ordini"],
    products: ["PRD", "Prodotti"],
    productShowcase: ["VET", "Vetrina prodotti"],
    productForms: ["FRM", "Moduli prodotto"],
    priceHistory: ["PRE", "Storico prezzi"],
    supplierPriceConfirmations: ["LST", "Listini fornitori"],
    distributionBrokerage: ["BRK", "Distribuzione / Brokeraggio"],
    commercialBrokerage: ["BRK", "Brokeraggio"],
    tenders: ["TEN", "Gare"],
    print: ["PRN", "Stampe"],
    documents: ["DOC", "Documenti"],
    packing: ["PKG", "Packing list"],
    transportPrices: ["TRP", "Trasporti"],
    supplierGeoGroupage: ["GEO", "Geo fornitori"],
    companyFleet: ["FLT", "Flotta"],
    administrativeHub: ["AMM", "Amministrativo"],
    accountant: ["ACC", "Commercialista"],
    billingWorkflow: ["FAT", "Fatturazione"],
    banks: ["BNK", "Banche"],
    payments: ["PAY", "Pagamenti"],
    employeeAttendance: ["HR", "Dipendenti / Presenze"],
    recruitingPersonnel: ["REC", "Recruiting"],
    driverRecruiting: ["AUT", "Recruiting autisti"],
    humanResources: ["HR", "Dipendenti"],
    foreignEmployees: ["EST", "Personale estero"],
    foreignRecruiting: ["FRE", "Recruiting estero"],
    agents: ["AG", "Agenti / Commissioni"],
    legalHub: ["LEG", "Legale"],
    legalClaims: ["SIN", "Sinistri"],
    legalProtocols: ["PRO", "Protocolli legali"],
    contracts: ["CTR", "Contratti"],
    contractTemplates: ["TPL", "Modelli contratti"],
    desktopCloudApp: ["APP", "App desktop"],
    desktopRoadmap: ["DEV", "Roadmap"],
    settings: ["SET", "Impostazioni"],
    admin: ["ADM", "Admin"]
  };

  var GROUPS = [
    {
      id: "direction",
      title: "Direzione",
      subtitle: "Dashboard, mercato e previsioni",
      items: ["dashboard", "marketTrends", "forecastingHub", "greenCoffee", "productionDairy"]
    },
    {
      id: "operations",
      title: "Operativo / Segreteria",
      subtitle: "Attivita, pratiche e back office",
      items: ["operativo", "secretariatHub", "assistant", "documents", "print", "packing"]
    },
    {
      id: "crm",
      title: "CRM / Comunicazioni",
      subtitle: "Relazioni, richieste e comunicazioni",
      items: ["communications", "officialCommunications", "contacts", "customerInternalExtraction"]
    },
    {
      id: "commercial",
      title: "Commerciale",
      subtitle: "Offerte, clienti, ordini e prodotti",
      items: ["commercialHub", "offers", "trattativeInCorso", "intermediations", "orders", "products", "productShowcase", "productForms", "priceHistory"]
    },
    {
      id: "brokerage",
      title: "Distribuzione / Brokeraggio",
      subtitle: "Richieste, fornitori, listini e trasporti",
      items: ["distributionBrokerage", "commercialBrokerage", "supplierPriceConfirmations", "tenders", "transportPrices", "supplierGeoGroupage", "companyFleet"]
    },
    {
      id: "administration",
      title: "Amministrativo",
      subtitle: "Fatture, pagamenti e banche",
      items: ["administrativeHub", "accountant", "billingWorkflow", "payments", "banks"]
    },
    {
      id: "people",
      title: "Personale",
      subtitle: "Recruiting, dipendenti e presenze",
      items: ["recruitingPersonnel", "driverRecruiting", "employeeAttendance", "humanResources", "foreignEmployees", "foreignRecruiting", "agents"]
    },
    {
      id: "legal",
      title: "Legale",
      subtitle: "Contratti, protocolli e pratiche riservate",
      items: ["legalHub", "contracts", "contractTemplates", "legalProtocols", "legalClaims"]
    },
    {
      id: "system",
      title: "Sistema",
      subtitle: "Impostazioni, cloud e admin",
      items: ["desktopCloudApp", "desktopRoadmap", "settings", "admin"]
    }
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function readStore() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (parsed && typeof parsed === "object") return parsed;
    } catch (error) {}
    return {};
  }

  function writeStore(data) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data || {})); } catch (error) {}
  }

  function menuState() {
    var saved = readStore();
    var groups = saved.groups && typeof saved.groups === "object" ? saved.groups : {};
    GROUPS.forEach(function (group) {
      if (groups[group.id] == null) groups[group.id] = true;
    });
    return { closed: saved.closed === true, groups: groups };
  }

  function saveClosed(closed) {
    var state = menuState();
    state.closed = !!closed;
    writeStore(state);
  }

  function saveGroup(id, open) {
    var state = menuState();
    state.groups[id] = !!open;
    writeStore(state);
  }

  function currentPage() {
    try {
      if (typeof current !== "undefined" && current && current.page) return current.page;
    } catch (error) {}
    return "";
  }

  function modulesSource() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) return modules;
    } catch (error) {}
    return Array.isArray(window.modules) ? window.modules : [];
  }

  function moduleMap() {
    var map = {};
    modulesSource().forEach(function (module) {
      if (module && module.id && module.id !== "cryptoMonitor") map[module.id] = module;
    });
    return map;
  }

  function knownLabel(id, module) {
    var item = LABELS[id] || [String(id || "").slice(0, 3).toUpperCase(), module && module.label || id];
    return { code: item[0], label: module && module.label || item[1] || id };
  }

  function availableGroupItems(group, byId) {
    return group.items.filter(function (id) { return byId[id]; });
  }

  function extraItems(byId) {
    var known = {};
    GROUPS.forEach(function (group) {
      group.items.forEach(function (id) { known[id] = true; });
    });
    return Object.keys(byId).filter(function (id) { return !known[id] && id !== "cryptoMonitor"; });
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "#pms227-fill-sidebar-menu{display:none!important}",
      ".sidebar{display:none!important}",
      "body.pms231-menu-open .app,body.pms231-menu-closed .app{display:block!important;width:100%!important;min-width:0!important}",
      "body.pms231-menu-open .main,body.pms231-menu-closed .main{margin-left:0!important;padding-left:0!important;width:100%!important;max-width:none!important;min-width:0!important;transition:none!important}",
      "body.pms231-menu-open .topbar,body.pms231-menu-closed .topbar{left:0!important;width:100%!important;max-width:none!important}",
      "body.pms231-menu-open #content,body.pms231-menu-closed #content{width:100%!important;max-width:none!important;min-width:0!important}",
      "#" + MENU_ID + "{position:fixed!important;left:0!important;top:0!important;bottom:0!important;z-index:2147483600!important;width:326px!important;height:100vh!important;background:#102f2e!important;color:#fff!important;box-shadow:8px 0 22px rgba(15,23,42,.22)!important;display:flex!important;flex-direction:column!important;padding:12px!important;font-family:Inter,Segoe UI,Arial,sans-serif!important;transition:transform .18s ease!important}",
      "body.pms231-menu-closed #" + MENU_ID + "{transform:translateX(-336px)!important}",
      "#" + MENU_ID + " *{box-sizing:border-box!important;letter-spacing:0!important}",
      "#" + MENU_ID + " .pms231-brand{display:grid!important;grid-template-columns:42px minmax(0,1fr) 34px!important;align-items:center!important;gap:10px!important;min-height:54px!important;padding-bottom:10px!important;border-bottom:1px solid rgba(255,255,255,.18)!important}",
      "#" + MENU_ID + " .pms231-mark{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;border-radius:10px!important;background:#fff!important;color:#116149!important;font-weight:950!important;font-size:20px!important}",
      "#" + MENU_ID + " strong{display:block!important;color:#fff!important;font-size:16px!important;line-height:1.05!important}",
      "#" + MENU_ID + " .pms231-sub{display:block!important;color:rgba(255,255,255,.72)!important;font-size:11px!important;line-height:1.15!important;margin-top:3px!important}",
      "#" + MENU_ID + " .pms231-close,#pms231-menu-toggle{display:grid!important;place-items:center!important;border:1px solid rgba(255,255,255,.18)!important;background:rgba(255,255,255,.1)!important;color:#fff!important;border-radius:8px!important;cursor:pointer!important;font:inherit!important}",
      "#" + MENU_ID + " .pms231-close{width:34px!important;height:34px!important;padding:0!important}",
      "#pms231-menu-toggle{position:fixed!important;left:12px!important;top:12px!important;z-index:2147483601!important;width:58px!important;height:42px!important;background:#102f2e!important;box-shadow:0 10px 24px rgba(15,23,42,.2)!important;font-size:11px!important;font-weight:900!important}",
      "body.pms231-menu-open #pms231-menu-toggle{display:none!important}",
      "#" + MENU_ID + " .pms231-scroll{display:flex!important;flex:1 1 auto!important;min-height:0!important;max-height:calc(100vh - 92px)!important;flex-direction:column!important;gap:8px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:10px 2px 8px!important;overscroll-behavior:contain!important;scrollbar-width:thin!important}",
      "#" + MENU_ID + " .pms231-group{border:1px solid rgba(255,255,255,.13)!important;border-radius:8px!important;background:rgba(255,255,255,.05)!important;overflow:hidden!important}",
      "#" + MENU_ID + " .pms231-group-head{width:100%!important;margin:0!important;border:0!important;background:transparent!important;color:#fff!important;text-align:left!important;padding:10px!important;display:grid!important;grid-template-columns:minmax(0,1fr) 20px!important;gap:8px!important;cursor:pointer!important;font:inherit!important}",
      "#" + MENU_ID + " .pms231-group-title{font-size:12px!important;font-weight:950!important;line-height:1.1!important;text-transform:uppercase!important}",
      "#" + MENU_ID + " .pms231-group-sub{display:block!important;margin-top:3px!important;font-size:10.5px!important;color:rgba(255,255,255,.62)!important;line-height:1.2!important;text-transform:none!important;font-weight:700!important}",
      "#" + MENU_ID + " .pms231-caret{display:grid!important;place-items:center!important;font-size:13px!important;color:rgba(255,255,255,.72)!important}",
      "#" + MENU_ID + " .pms231-items{display:grid!important;gap:5px!important;max-height:42vh!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;padding:0 8px 9px!important;scrollbar-width:thin!important}",
      "#" + MENU_ID + " .pms231-group.closed .pms231-items{display:none!important}",
      "#" + MENU_ID + " .pms231-page{display:grid!important;grid-template-columns:38px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;width:100%!important;min-height:36px!important;margin:0!important;padding:6px 8px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important;font:inherit!important}",
      "#" + MENU_ID + " .pms231-page:hover,#" + MENU_ID + " .pms231-page.active{background:#fff!important;color:#103a34!important;border-color:#fff!important}",
      "#" + MENU_ID + " .pms231-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:34px!important;height:22px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important;line-height:1!important}",
      "#" + MENU_ID + " .pms231-page:hover .pms231-code,#" + MENU_ID + " .pms231-page.active .pms231-code{background:#116149!important;color:#fff!important}",
      "#" + MENU_ID + " .pms231-label{display:block!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12.5px!important;font-weight:850!important;line-height:1.14!important}",
      "#" + MENU_ID + " .pms231-foot{flex:0 0 auto!important;border-top:1px solid rgba(255,255,255,.18)!important;padding-top:8px!important;color:rgba(255,255,255,.68)!important;font-size:11px!important;line-height:1.25!important}",
      "@media(max-width:920px){#" + MENU_ID + "{width:min(326px,92vw)!important}body.pms231-menu-closed #" + MENU_ID + "{transform:translateX(-96vw)!important}}",
      "@media print{#" + MENU_ID + ",#pms231-menu-toggle{display:none!important}body.pms231-menu-open .main,body.pms231-menu-closed .main{margin-left:0!important}}"
    ].join("\n");
  }

  function renderPageButton(id, byId) {
    var module = byId[id];
    if (!module) return "";
    var meta = knownLabel(id, module);
    var active = currentPage() === id ? " active" : "";
    return '<button type="button" class="pms231-page' + active + '" data-pms231-page="' + esc(id) + '" title="' + esc(module.subtitle || meta.label) + '">' +
      '<span class="pms231-code">' + esc(meta.code) + '</span>' +
      '<span class="pms231-label">' + esc(meta.label) + '</span>' +
      '</button>';
  }

  function renderGroup(group, byId, open) {
    var items = availableGroupItems(group, byId);
    if (!items.length) return "";
    var className = "pms231-group" + (open ? "" : " closed");
    return '<section class="' + className + '" data-pms231-group-box="' + esc(group.id) + '">' +
      '<button type="button" class="pms231-group-head" data-pms231-group="' + esc(group.id) + '">' +
        '<span><span class="pms231-group-title">' + esc(group.title) + '</span><span class="pms231-group-sub">' + esc(group.subtitle) + '</span></span>' +
        '<span class="pms231-caret">' + (open ? "v" : ">") + '</span>' +
      '</button>' +
      '<div class="pms231-items">' + items.map(function (id) { return renderPageButton(id, byId); }).join("") + '</div>' +
    '</section>';
  }

  function draw() {
    injectStyle();
    var state = menuState();
    document.body.classList.toggle("pms231-menu-open", !state.closed);
    document.body.classList.toggle("pms231-menu-closed", state.closed);

    var byId = moduleMap();
    var menu = document.getElementById(MENU_ID);
    if (!menu) {
      menu = document.createElement("aside");
      menu.id = MENU_ID;
      menu.setAttribute("aria-label", "Menu Parmitalia a zone");
      document.body.appendChild(menu);
    }

    var groupsHtml = GROUPS.map(function (group) {
      return renderGroup(group, byId, state.groups[group.id] !== false);
    }).join("");
    var extras = extraItems(byId);
    if (extras.length) {
      groupsHtml += renderGroup({
        id: "other",
        title: "Altri moduli",
        subtitle: "Funzioni aggiuntive",
        items: extras
      }, byId, state.groups.other !== false);
    }

    var html = '<div class="pms231-brand">' +
      '<div class="pms231-mark">P</div>' +
      '<div><strong>Parmitalia</strong><span class="pms231-sub">Gestionale modulare</span></div>' +
      '<button type="button" class="pms231-close" data-pms231-close title="Chiudi menu">x</button>' +
      '</div>' +
      '<div class="pms231-scroll">' + groupsHtml + '</div>' +
      '<div class="pms231-foot">Menu a zone con sottomenù. Chiudi il menu per lavorare a schermo pieno.</div>';

    if (menu.dataset.pms231Html !== html) {
      menu.innerHTML = html;
      menu.dataset.pms231Html = html;
    }

    var toggle = document.getElementById("pms231-menu-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.id = "pms231-menu-toggle";
      toggle.type = "button";
      toggle.setAttribute("title", "Apri menu");
      toggle.setAttribute("data-pms231-open", "1");
      toggle.textContent = "Menu";
      document.body.appendChild(toggle);
    }
  }

  function openPage(page) {
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

  function bind() {
    if (document.__pms231Bound) return;
    document.__pms231Bound = true;
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var close = target.closest("[data-pms231-close]");
      var open = target.closest("[data-pms231-open]");
      var group = target.closest("[data-pms231-group]");
      var page = target.closest("[data-pms231-page]");

      if (close) {
        event.preventDefault();
        saveClosed(true);
        draw();
        return;
      }
      if (open) {
        event.preventDefault();
        saveClosed(false);
        draw();
        return;
      }
      if (group) {
        event.preventDefault();
        var id = group.getAttribute("data-pms231-group");
        var box = document.querySelector('[data-pms231-group-box="' + id + '"]');
        var willOpen = !box || box.classList.contains("closed");
        saveGroup(id, willOpen);
        draw();
        return;
      }
      if (page) {
        event.preventDefault();
        event.stopPropagation();
        openPage(page.getAttribute("data-pms231-page"));
      }
    }, true);
  }

  function wrap(name) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms231Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      nativeSetTimeout(draw, 30);
      nativeSetTimeout(draw, 180);
      return result;
    };
    wrapped.__pms231Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function install() {
    bind();
    wrap("render");
    wrap("setPage");
    wrap("login");
    draw();
    [60, 180, 420, 900, 1800].forEach(function (ms) { nativeSetTimeout(draw, ms); });
    console.info(VERSION + " loaded");
  }

  window.PMS_V231_COLLAPSIBLE_ZONE_MENU = { version: VERSION, refresh: draw, openPage: openPage };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
