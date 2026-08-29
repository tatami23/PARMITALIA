(function () {
  "use strict";

  if (window.PMS_V222_FUNCTIONAL_CORE) return;

  var VERSION = "pms_v222_functional_core";
  var MENU_ID = "pms222-menu";
  var STATUS_ID = "pms222-status";
  var nativeSetTimeout = window.setTimeout.bind(window);
  var saveTimer = null;

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

  var RENDERABLE_IDS = {
    dashboard: true,
    settings: true,
    admin: true,
    marketTrends: true,
    operativo: true,
    communications: true,
    officialCommunications: true,
    trattativeInCorso: true,
    approvals: true,
    orders: true,
    priceHistory: true,
    productForms: true,
    supplierPriceConfirmations: true,
    tenders: true,
    commercialBrokerage: true,
    supplierGeoGroupage: true,
    transportPrices: true,
    companyFleet: true,
    billingWorkflow: true,
    driverRecruiting: true,
    humanResources: true,
    foreignEmployees: true,
    foreignRecruiting: true,
    legalClaims: true,
    legalProtocols: true,
    customerInternalExtraction: true,
    desktopCloudApp: true,
    desktopRoadmap: true
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function getCurrent() {
    try {
      if (typeof current !== "undefined" && current) return current;
    } catch (error) {}
    window.current = window.current || { user: "Carlo", role: "admin", page: "dashboard", filters: {} };
    return window.current;
  }

  function getState() {
    try {
      if (typeof state !== "undefined" && state) return state;
    } catch (error) {}
    window.state = window.state || {};
    return window.state;
  }

  function getModules() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) return modules;
    } catch (error) {}
    window.modules = window.modules || [];
    return window.modules;
  }

  function isRenderable(id) {
    if (RENDERABLE_IDS[id]) return true;
    try {
      if (typeof schemas !== "undefined" && schemas && schemas[id]) return true;
    } catch (error) {}
    return getModules().some(function (module) { return module && module.id === id; });
  }

  function infoFor(module) {
    var info = LABELS[module.id] || [String(module.id || "MOD").slice(0, 3).toUpperCase(), module.label || module.id || "Modulo", "Altri moduli"];
    return {
      code: info[0],
      label: module.label || info[1],
      group: info[2] || "Altri moduli"
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
    var style = document.getElementById("pms-v222-functional-core-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v222-functional-core-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "body.pms222-functional .sidebar{position:sticky!important;top:0!important;display:flex!important;flex:0 0 302px!important;width:302px!important;min-width:302px!important;max-width:302px!important;height:100vh!important;min-height:100vh!important;padding:10px!important;background:#102f2e!important;color:#fff!important;overflow:hidden!important}",
      "body.pms222-functional .main{min-width:0!important;flex:1 1 auto!important}",
      "body.pms222-functional #nav,body.pms222-functional #pms143-menu,body.pms222-functional #pms152-menu,body.pms222-functional #pms163-menu-toggle,body.pms222-functional #pms164-menu-wrap,body.pms222-functional #pms165-top-menu,body.pms222-functional #pms200-main-menu{display:none!important;visibility:hidden!important;height:0!important;width:0!important;overflow:hidden!important;margin:0!important;padding:0!important}",
      "html body.pms222-functional .sidebar #" + MENU_ID + "{display:flex!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:5!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;flex:1 1 auto!important;width:100%!important;height:calc(100vh - 250px)!important;min-height:300px!important;max-height:calc(100vh - 250px)!important;flex-direction:column!important;gap:7px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:4px 2px 10px!important;margin:0!important;pointer-events:auto!important}",
      ".pms222-group{display:flex!important;flex-direction:column!important;gap:5px!important;margin:0 0 8px!important}",
      ".pms222-title{color:rgba(255,255,255,.66)!important;font-size:10px!important;font-weight:900!important;line-height:1.1!important;text-transform:uppercase!important;letter-spacing:0!important;margin:7px 7px 2px!important}",
      ".pms222-button{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.16)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important}",
      ".pms222-button:hover,.pms222-button:focus-visible,.pms222-button.active{background:#fff!important;color:#103a34!important;border-color:#fff!important;outline:0!important}",
      ".pms222-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:23px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important;line-height:1!important}",
      ".pms222-button:hover .pms222-code,.pms222-button:focus-visible .pms222-code,.pms222-button.active .pms222-code{background:#116149!important;color:#fff!important}",
      ".pms222-label{display:block!important;min-width:0!important;white-space:normal!important;overflow-wrap:anywhere!important;font-size:12.5px!important;font-weight:850!important;line-height:1.15!important;letter-spacing:0!important}",
      "#" + STATUS_ID + "{display:grid!important;flex:0 0 auto!important;gap:6px!important;padding:6px 2px 8px!important;border-bottom:1px solid rgba(255,255,255,.16)!important;color:rgba(255,255,255,.78)!important;font-size:11px!important;line-height:1.25!important}",
      ".pms222-save{width:100%!important;min-height:34px!important;padding:7px 10px!important;border-radius:7px!important;background:#fff!important;color:#103a34!important;font-size:12px!important;font-weight:900!important}",
      ".sidebar-footer{display:grid!important;gap:6px!important;margin-top:8px!important;color:rgba(255,255,255,.76)!important}",
      ".sidebar-footer #logout-button{width:100%!important;border-radius:7px!important}",
      "@media(max-width:860px){body.pms222-functional .app:not(.hidden){display:flex!important}body.pms222-functional .sidebar{position:sticky!important;flex-basis:286px!important;width:286px!important;min-width:286px!important;max-width:286px!important;height:100vh!important}}",
      "@media(max-width:640px){body.pms222-functional .app:not(.hidden){display:block!important}body.pms222-functional .sidebar{position:relative!important;width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;max-height:58vh!important}html body.pms222-functional .sidebar #" + MENU_ID + "{height:42vh!important;min-height:220px!important;max-height:42vh!important}}",
      "@media print{body.pms222-functional .sidebar,body.pms222-functional #" + MENU_ID + "{display:none!important}}"
    ].join("\n");
    document.body.classList.add("pms222-functional");
  }

  function ensureMenuHost() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    var host = document.getElementById(MENU_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = MENU_ID;
      host.setAttribute("role", "navigation");
      host.setAttribute("aria-label", "Menu moduli Parmitalia");
      var footer = sidebar.querySelector(".sidebar-footer");
      if (footer) sidebar.insertBefore(host, footer);
      else sidebar.appendChild(host);
    }
    forceHostVisible(host);
    if (!host.__pms222VisibilityObserver && typeof MutationObserver === "function") {
      host.__pms222VisibilityObserver = new MutationObserver(function () {
        forceHostVisible(host);
      });
      host.__pms222VisibilityObserver.observe(host, { attributes: true, attributeFilter: ["style", "class", "hidden"] });
    }
    return host;
  }

  function forceHostVisible(host) {
    if (!host) return;
    if (host.hidden) host.hidden = false;
    host.removeAttribute("aria-hidden");
    host.style.setProperty("display", "flex", "important");
    host.style.setProperty("visibility", "visible", "important");
    host.style.setProperty("opacity", "1", "important");
    host.style.setProperty("width", "100%", "important");
    host.style.setProperty("height", "calc(100vh - 250px)", "important");
    host.style.setProperty("min-height", "300px", "important");
    host.style.setProperty("max-height", "calc(100vh - 250px)", "important");
    host.style.setProperty("z-index", "5", "important");
    host.style.setProperty("pointer-events", "auto", "important");
    disableLegacyMenus();
  }

  function disableLegacyMenus() {
    [
      "nav",
      "pms143-menu",
      "pms152-menu",
      "pms163-menu-toggle",
      "pms164-menu-wrap",
      "pms165-top-menu",
      "pms218-menu",
      "pms221-full-menu"
    ].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node || node.id === MENU_ID) return;
      node.setAttribute("aria-hidden", "true");
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("pointer-events", "none", "important");
      node.style.setProperty("width", "0", "important");
      node.style.setProperty("height", "0", "important");
      node.style.setProperty("min-height", "0", "important");
      node.style.setProperty("max-height", "0", "important");
      node.style.setProperty("overflow", "hidden", "important");
    });
  }

  function recordCount() {
    var data = getState();
    return Object.keys(data || {}).reduce(function (total, key) {
      return total + (Array.isArray(data[key]) ? data[key].length : 0);
    }, 0);
  }

  function renderStatus() {
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    var node = document.getElementById(STATUS_ID);
    if (!node) {
      node = document.createElement("div");
      node.id = STATUS_ID;
      var menu = document.getElementById(MENU_ID);
      if (menu) sidebar.insertBefore(node, menu);
      else sidebar.appendChild(node);
    } else {
      var host = document.getElementById(MENU_ID);
      if (host && node.nextElementSibling !== host) sidebar.insertBefore(node, host);
    }
    forceStatusVisible(node);
    if (!node.__pms222VisibilityObserver && typeof MutationObserver === "function") {
      node.__pms222VisibilityObserver = new MutationObserver(function () {
        forceStatusVisible(node);
      });
      node.__pms222VisibilityObserver.observe(node, { attributes: true, attributeFilter: ["style", "class", "hidden", "data-pms182-remove-sidebar-extra"] });
    }
    var report = integrityCheck();
    node.innerHTML = '<button type="button" class="pms222-save" data-pms222-save>Salva ora</button>' +
      '<span>' + esc(recordCount()) + ' record in archivio</span>' +
      '<span>Moduli: ' + esc(report.ok.length) + ' ok' + (report.issues.length ? ', ' + report.issues.length + ' da verificare' : '') + '</span>';
    var saveButton = node.querySelector("[data-pms222-save]");
    if (saveButton) saveButton.onclick = function () { saveNow("manual-menu"); };
  }

  function forceStatusVisible(node) {
    if (!node) return;
    if (node.hidden) node.hidden = false;
    node.removeAttribute("aria-hidden");
    node.removeAttribute("data-pms182-remove-sidebar-extra");
    node.style.setProperty("display", "grid", "important");
    node.style.setProperty("visibility", "visible", "important");
    node.style.setProperty("opacity", "1", "important");
    node.style.setProperty("pointer-events", "auto", "important");
    node.style.setProperty("width", "100%", "important");
    node.style.setProperty("height", "auto", "important");
  }

  function drawMenu() {
    injectCss();
    var host = ensureMenuHost();
    if (!host) return;
    var grouped = {};
    GROUPS.forEach(function (group) { grouped[group] = []; });
    visibleModules().forEach(function (module) {
      var info = infoFor(module);
      (grouped[info.group] || grouped["Altri moduli"]).push({ module: module, info: info });
    });
    var page = getCurrent().page || "dashboard";
    var html = "";
    GROUPS.forEach(function (group) {
      var items = grouped[group] || [];
      if (!items.length) return;
      html += '<section class="pms222-group" aria-label="' + esc(group) + '"><div class="pms222-title">' + esc(group) + '</div>';
      items.forEach(function (entry) {
        var active = entry.module.id === page ? " active" : "";
        var currentAttr = active ? ' aria-current="page"' : "";
        html += '<button type="button" class="pms222-button' + active + '" data-pms222-page="' + esc(entry.module.id) + '"' + currentAttr + ' title="' + esc(entry.info.label) + '">' +
          '<span class="pms222-code">' + esc(entry.info.code) + '</span>' +
          '<span class="pms222-label">' + esc(entry.info.label) + '</span>' +
          '</button>';
      });
      html += "</section>";
    });
    if (host.dataset.pms222Html !== html) {
      host.innerHTML = html;
      host.dataset.pms222Html = html;
    }
    renderStatus();
  }

  function openPage(id) {
    if (!id) return;
    try {
      if (typeof setPage === "function") setPage(id);
      else {
        getCurrent().page = id;
        if (typeof render === "function") render();
      }
    } catch (error) {
      console.warn(VERSION + " navigation failed", id, error);
      try {
        getCurrent().page = id;
        if (typeof render === "function") render();
      } catch (inner) {}
    }
    nativeSetTimeout(drawMenu, 20);
    nativeSetTimeout(drawMenu, 180);
  }

  function bindMenu() {
    var host = ensureMenuHost();
    if (!host || host.dataset.pms222Bound === "1") return;
    host.dataset.pms222Bound = "1";
    host.addEventListener("click", function (event) {
      var button = event.target && event.target.closest && event.target.closest("[data-pms222-page]");
      if (!button || !host.contains(button)) return;
      event.preventDefault();
      event.stopPropagation();
      openPage(button.getAttribute("data-pms222-page"));
    }, true);
    host.addEventListener("keydown", function (event) {
      var buttons = arr(host.querySelectorAll("[data-pms222-page]"));
      var index = buttons.indexOf(document.activeElement);
      if (index < 0) return;
      var next = index;
      if (event.key === "ArrowDown") next = Math.min(buttons.length - 1, index + 1);
      else if (event.key === "ArrowUp") next = Math.max(0, index - 1);
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = buttons.length - 1;
      else return;
      event.preventDefault();
      buttons[next].focus();
    });
  }

  function scheduleSave(reason) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = nativeSetTimeout(function () {
      saveTimer = null;
      saveNow(reason || "debounced");
    }, 700);
  }

  async function saveNow(reason) {
    var data = getState();
    try {
      data._pmsAutosave = Object.assign({}, data._pmsAutosave || {}, {
        version: VERSION,
        updatedAt: new Date().toISOString(),
        reason: reason || "manual",
        records: recordCount()
      });
    } catch (error) {}
    try {
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        return window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || "pms222");
      }
    } catch (error) {
      console.warn(VERSION + " hardened save failed", error);
    }
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn(VERSION + " local save failed", error);
      return { ok: false, error: String(error && error.message || error) };
    }
    renderStatus();
    return { ok: true };
  }

  function wrap(name, after) {
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms222Wrapped) return;
    var wrapped = function () {
      var result = fn.apply(this, arguments);
      after.apply(this, arguments);
      return result;
    };
    wrapped.__pms222Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (error) {}
  }

  function wrapLogout() {
    if (typeof logout !== "function" || logout.__pms222Wrapped) return;
    var baseLogout = logout;
    var wrappedLogout = function () {
      var shouldSave = true;
      try { shouldSave = window.confirm("Vuoi salvare i dati prima di uscire dall'utente?"); } catch (error) {}
      if (shouldSave) saveNow("logout-confirmed");
      return baseLogout.apply(this, arguments);
    };
    wrappedLogout.__pms222Wrapped = true;
    try { logout = wrappedLogout; } catch (error) {}
    window.logout = wrappedLogout;
    var logoutButton = document.getElementById("logout-button");
    if (logoutButton) logoutButton.onclick = wrappedLogout;
  }

  function integrityCheck() {
    var ok = [];
    var issues = [];
    visibleModules().forEach(function (module) {
      var id = module.id;
      if (isRenderable(id)) ok.push(id);
      else issues.push({ id: id, problem: "renderer-missing" });
    });
    return { version: VERSION, ok: ok, issues: issues };
  }

  function installListeners() {
    ["input", "change", "drop"].forEach(function (eventName) {
      document.addEventListener(eventName, function () { scheduleSave(eventName); }, true);
    });
    window.addEventListener("blur", function () { saveNow("window-blur"); });
    window.addEventListener("pagehide", function () { saveNow("pagehide"); });
    window.addEventListener("beforeunload", function () { saveNow("beforeunload"); });
  }

  function install() {
    injectCss();
    bindMenu();
    wrap("render", function () {
      nativeSetTimeout(drawMenu, 20);
      nativeSetTimeout(drawMenu, 180);
    });
    wrap("renderNav", function () {
      nativeSetTimeout(drawMenu, 20);
    });
    wrap("setPage", function () {
      nativeSetTimeout(drawMenu, 20);
      nativeSetTimeout(drawMenu, 180);
    });
    wrap("login", function () {
      nativeSetTimeout(drawMenu, 40);
      nativeSetTimeout(drawMenu, 220);
    });
    wrapLogout();
    installListeners();
    drawMenu();
    [80, 300, 900, 1800].forEach(function (ms) { nativeSetTimeout(drawMenu, ms); });
    var guardRuns = 0;
    var guard = window.setInterval(function () {
      guardRuns += 1;
      forceHostVisible(document.getElementById(MENU_ID));
      forceStatusVisible(document.getElementById(STATUS_ID));
      if (guardRuns > 80) window.clearInterval(guard);
    }, 250);
    console.info(VERSION + " loaded", integrityCheck());
  }

  window.PMS_V222_FUNCTIONAL_CORE = {
    version: VERSION,
    refreshMenu: drawMenu,
    openPage: openPage,
    saveNow: saveNow,
    scheduleSave: scheduleSave,
    integrityCheck: integrityCheck
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
