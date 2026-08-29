(function(){
  var VERSION = "pms_v152_force_visible_sidebar_menu";

  var cleanLabels = {
    dashboard: ["DB", "Dashboard"],
    marketTrends: ["MKT", "Andamenti di mercato"],
    operativo: ["OP", "Gestione operativa"],
    assistant: ["BO", "Backoffice / Segretariato"],
    communications: ["CRM", "Comunicazioni / CRM"],
    officialCommunications: ["CU", "Comunicazioni ufficiali"],
    trattativeInCorso: ["TRT", "Trattative in corso"],
    intermediations: ["INT", "Intermediazioni"],
    offers: ["OFF", "Offerte commerciali"],
    approvals: ["APP", "Autorizzazioni Admin"],
    orders: ["ORD", "Ordini"],
    products: ["PRD", "Prodotti e articoli"],
    productForms: ["FRM", "Moduli"],
    supplierPriceConfirmations: ["LST", "Listini e conferme fornitori"],
    tenders: ["TEN", "Gare e richieste"],
    commercialBrokerage: ["BRK", "Brokeraggio commerciale"],
    contacts: ["ANA", "Anagrafiche"],
    print: ["PRN", "Centro stampe"],
    supplierGeoGroupage: ["GEO", "Geo fornitore"],
    transportPrices: ["TRP", "Trasporti"],
    packing: ["PKG", "Packing list"],
    documents: ["DOC", "Archivio documenti"],
    accountant: ["ACC", "Commercialista"],
    billingWorkflow: ["FAT", "Fatturazione"],
    banks: ["BNK", "Banche"],
    payments: ["PAY", "Pagamenti e garanzie"],
    agents: ["AG", "Agenti e provvigioni"],
    driverRecruiting: ["REC", "Recruiting autisti"],
    humanResources: ["HR", "Dipendenti azienda"],
    foreignEmployees: ["EST", "Dipendenti estero"],
    legalClaims: ["SIN", "Sinistri e legale"],
    legalProtocols: ["LEG", "Protocolli legali"],
    contracts: ["CTR", "Contratti"],
    contractTemplates: ["TPL", "Modelli contrattuali"],
    customerInternalExtraction: ["CLI", "Estrazione clienti"],
    desktopCloudApp: ["APP", "App Desktop"],
    desktopRoadmap: ["DEV", "Piano app desktop"],
    settings: ["SET", "Impostazioni"],
    admin: ["ADM", "Admin"]
  };

  var groups = [
    ["Principale", ["dashboard", "marketTrends", "operativo", "assistant", "communications"]],
    ["Commerciale", ["trattativeInCorso", "intermediations", "offers", "orders", "products", "supplierPriceConfirmations", "tenders", "commercialBrokerage", "contacts"]],
    ["Operativo", ["print", "supplierGeoGroupage", "transportPrices", "packing", "documents"]],
    ["Amministrazione", ["accountant", "billingWorkflow", "banks", "payments", "agents"]],
    ["Personale e legale", ["driverRecruiting", "humanResources", "foreignEmployees", "legalClaims", "contracts", "contractTemplates"]],
    ["Sistema", ["customerInternalExtraction", "desktopCloudApp", "desktopRoadmap", "settings", "admin"]]
  ];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch];
    });
  }

  function getCurrent(){
    if (typeof current !== "undefined" && current) return current;
    window.current = window.current || { user: "Carlo", role: "admin", page: "dashboard", filters: {} };
    return window.current;
  }

  function moduleList(){
    var role = getCurrent().role || "admin";
    var source = (typeof modules !== "undefined" && Array.isArray(modules)) ? modules.slice() : [];
    if (!source.length) {
      source = Object.keys(cleanLabels).map(function(id){
        return { id: id, label: cleanLabels[id][1], roles: ["admin", "assistant", "accountant", "agent"] };
      });
    }
    return source.filter(function(mod){
      if (!mod || !mod.id) return false;
      if (role === "admin") return true;
      return Array.isArray(mod.roles) ? mod.roles.indexOf(role) !== -1 : true;
    });
  }

  function infoFor(mod){
    var known = cleanLabels[mod.id];
    return {
      code: known ? known[0] : String(mod.id || "").slice(0, 3).toUpperCase(),
      label: known ? known[1] : String(mod.label || mod.id || "Modulo")
    };
  }

  function ensureCss(){
    var style = document.getElementById("pms-v152-force-sidebar-menu-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v152-force-sidebar-menu-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "body .sidebar{display:flex!important;flex-direction:column!important;width:292px!important;min-width:292px!important;max-width:292px!important;padding:12px!important;background:#102f2e!important;border-right:1px solid rgba(255,255,255,.12)!important;overflow:hidden!important;color:#ffffff!important;}",
      "body .sidebar-brand{display:flex!important;align-items:center!important;gap:10px!important;margin:0 0 10px!important;padding:8px!important;min-height:52px!important;color:#ffffff!important;}",
      "body .brand-mark{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;min-width:42px!important;border-radius:10px!important;background:#ffffff!important;color:#116149!important;font-weight:900!important;font-size:18px!important;overflow:hidden!important;}",
      "body .brand-text strong{display:block!important;color:#ffffff!important;font-size:14px!important;line-height:1.1!important;white-space:normal!important;}",
      "body .brand-text small{display:block!important;color:rgba(255,255,255,.72)!important;font-size:11px!important;line-height:1.2!important;}",
      "#pms143-menu{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;max-height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;}",
      "#nav{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;max-height:0!important;overflow:hidden!important;padding:0!important;margin:0!important;}",
      "#pms152-menu{display:flex!important;flex-direction:column!important;gap:8px!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding:4px 3px 12px!important;visibility:visible!important;opacity:1!important;}",
      ".pms152-group{display:flex!important;flex-direction:column!important;gap:5px!important;margin-bottom:7px!important;}",
      ".pms152-group-title{color:rgba(255,255,255,.58)!important;font-size:10px!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:.04em!important;margin:7px 6px 2px!important;}",
      ".pms152-button{display:grid!important;grid-template-columns:40px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:42px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.11)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#ffffff!important;text-align:left!important;cursor:pointer!important;box-shadow:none!important;}",
      ".pms152-button:hover,.pms152-button.active{background:rgba(255,255,255,.18)!important;border-color:rgba(255,255,255,.26)!important;}",
      ".pms152-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:22px!important;border-radius:6px!important;background:#ffffff!important;color:#116149!important;font-size:9px!important;font-weight:900!important;}",
      ".pms152-label{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:normal!important;color:#ffffff!important;font-size:12px!important;font-weight:800!important;line-height:1.16!important;}",
      "body .sidebar-footer{margin-top:auto!important;color:rgba(255,255,255,.72)!important;}",
      "body .main{min-width:0!important;}",
      "@media(max-width:780px){body .sidebar{width:100%!important;max-width:none!important;min-width:0!important;max-height:48vh!important;}#pms152-menu{max-height:36vh!important;}}"
    ].join("\n");
  }

  function ensureHost(){
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    var host = document.getElementById("pms152-menu");
    if (!host) {
      host = document.createElement("div");
      host.id = "pms152-menu";
      var footer = sidebar.querySelector(".sidebar-footer");
      if (footer) sidebar.insertBefore(host, footer);
      else sidebar.appendChild(host);
    }
    return host;
  }

  function fixBrand(){
    var mark = document.querySelector(".brand-mark");
    if (mark) mark.textContent = "P";
    var strong = document.querySelector(".brand-text strong");
    if (strong) strong.textContent = "Parmitalia";
    var small = document.querySelector(".brand-text small");
    if (small) small.textContent = "Gestionale";
  }

  function openPage(id){
    var cur = getCurrent();
    cur.page = id;
    try {
      if (typeof setPage === "function" && setPage !== openPage) setPage(id);
      else if (typeof render === "function") render();
    } catch(error) {
      try { if (typeof render === "function") render(); } catch(inner) {}
    }
    setTimeout(drawMenu, 0);
    setTimeout(drawMenu, 120);
  }

  function drawMenu(){
    ensureCss();
    fixBrand();
    var host = ensureHost();
    if (!host) return;

    var allowed = moduleList();
    var byId = {};
    allowed.forEach(function(mod){ byId[mod.id] = mod; });
    var rendered = {};
    var html = "";

    groups.forEach(function(group){
      var buttons = group[1].map(function(id){ return byId[id]; }).filter(Boolean);
      if (!buttons.length) return;
      html += '<div class="pms152-group"><div class="pms152-group-title">' + esc(group[0]) + '</div>';
      buttons.forEach(function(mod){
        rendered[mod.id] = true;
        var info = infoFor(mod);
        var active = getCurrent().page === mod.id ? " active" : "";
        html += '<button type="button" class="pms152-button' + active + '" data-pms152-page="' + esc(mod.id) + '"><span class="pms152-code">' + esc(info.code) + '</span><span class="pms152-label">' + esc(info.label) + '</span></button>';
      });
      html += '</div>';
    });

    var leftovers = allowed.filter(function(mod){ return !rendered[mod.id] && mod.id !== "cryptoMonitor"; });
    if (leftovers.length) {
      html += '<div class="pms152-group"><div class="pms152-group-title">Altri moduli</div>';
      leftovers.forEach(function(mod){
        var info = infoFor(mod);
        var active = getCurrent().page === mod.id ? " active" : "";
        html += '<button type="button" class="pms152-button' + active + '" data-pms152-page="' + esc(mod.id) + '"><span class="pms152-code">' + esc(info.code) + '</span><span class="pms152-label">' + esc(info.label) + '</span></button>';
      });
      html += '</div>';
    }

    host.innerHTML = html;
    Array.prototype.slice.call(host.querySelectorAll("[data-pms152-page]")).forEach(function(button){
      button.onclick = function(event){
        event.preventDefault();
        openPage(button.getAttribute("data-pms152-page"));
      };
    });
  }

  var baseRenderNav152 = (typeof renderNav === "function") ? renderNav : null;
  renderNav = function(){
    if (baseRenderNav152) {
      try { baseRenderNav152.apply(this, arguments); } catch(error) {}
    }
    drawMenu();
  };
  try { window.renderNav = renderNav; } catch(error) {}

  if (typeof render === "function" && !render.__pms152ForceMenu) {
    var baseRender152 = render;
    render = function(){
      var out = baseRender152.apply(this, arguments);
      setTimeout(drawMenu, 0);
      setTimeout(drawMenu, 120);
      return out;
    };
    render.__pms152ForceMenu = true;
    try { window.render = render; } catch(error) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", drawMenu);
  } else {
    drawMenu();
  }
  [80, 250, 700, 1400, 3000].forEach(function(ms){ setTimeout(drawMenu, ms); });

  window.PMS_V152_FORCE_VISIBLE_SIDEBAR_MENU = {
    version: VERSION,
    refresh: drawMenu
  };
})();
