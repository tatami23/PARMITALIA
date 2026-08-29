(function(){
  "use strict";

  var VERSION = "pms_v221_restore_full_menu_all_screens";
  var MENU_ID = "pms221-full-menu";

  var LABELS = {
    dashboard:["DB","Dashboard / Agenda"],
    marketTrends:["MKT","Andamenti di mercato"],
    operativo:["OP","Gestione operativa / Agenda"],
    assistant:["BO","Backoffice / Segretariato"],
    communications:["CRM","Comunicazioni / CRM"],
    officialCommunications:["CU","Comunicazioni ufficiali"],
    trattativeInCorso:["TRT","Trattative in corso"],
    intermediations:["INT","Intermediazioni"],
    offers:["OFF","Offerte commerciali"],
    approvals:["APP","Autorizzazioni Admin"],
    orders:["ORD","Ordini"],
    products:["PRD","Prodotti e articoli"],
    productForms:["FRM","Moduli prodotto"],
    supplierPriceConfirmations:["LST","Listini e conferme fornitori"],
    tenders:["TEN","Gare e richieste"],
    commercialBrokerage:["BRK","Brokeraggio commerciale"],
    contacts:["ANA","Anagrafiche"],
    print:["PRN","Centro stampe"],
    supplierGeoGroupage:["GEO","Geo fornitori / Groupage"],
    transportPrices:["TRP","Trasporti"],
    packing:["PKG","Packing list"],
    documents:["DOC","Archivio documenti"],
    billingWorkflow:["FAT","Fatturazione"],
    accountant:["ACC","Commercialista"],
    banks:["BNK","Banche"],
    payments:["PAY","Pagamenti e garanzie"],
    agents:["AG","Agenti e provvigioni"],
    driverRecruiting:["REC","Recruiting autisti"],
    humanResources:["HR","Dipendenti azienda"],
    foreignEmployees:["EST","Dipendenti estero"],
    legalClaims:["SIN","Sinistri e legale"],
    legalProtocols:["LEG","Protocolli legali"],
    contracts:["CTR","Contratti"],
    contractTemplates:["TPL","Modelli contrattuali"],
    customerInternalExtraction:["CLI","Estrazione clienti"],
    desktopCloudApp:["APP","App Desktop"],
    desktopRoadmap:["DEV","Piano app desktop"],
    companyFleet:["FLT","Flotta auto aziendale"],
    settings:["SET","Impostazioni"],
    admin:["ADM","Admin"]
  };

  var GROUPS = [
    ["Principale", ["dashboard","marketTrends","operativo","assistant","communications","officialCommunications"]],
    ["Commerciale", ["trattativeInCorso","intermediations","offers","orders","products","productForms","supplierPriceConfirmations","tenders","commercialBrokerage","contacts"]],
    ["Operativo e documenti", ["print","supplierGeoGroupage","transportPrices","packing","documents","companyFleet"]],
    ["Amministrazione", ["billingWorkflow","accountant","banks","payments","agents","approvals"]],
    ["Personale e legale", ["driverRecruiting","humanResources","foreignEmployees","legalClaims","legalProtocols","contracts","contractTemplates"]],
    ["Sistema", ["customerInternalExtraction","desktopCloudApp","desktopRoadmap","settings","admin"]]
  ];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch];
    });
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function hasRenderer(id){
    if (id === "dashboard") return typeof renderDashboard === "function";
    if (id === "settings") return typeof renderSettings === "function";
    if (id === "admin") return typeof renderAdmin === "function";
    if (typeof schemas !== "undefined" && schemas && schemas[id]) return true;
    if (typeof modules !== "undefined" && arr(modules).some(function(m){ return m && m.id === id; })) return true;
    return ["marketTrends","operativo","communications","billingWorkflow","driverRecruiting","humanResources","foreignEmployees","orders"].indexOf(id) >= 0;
  }
  function upsertModule(id){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    var label = LABELS[id] || [id.slice(0,3).toUpperCase(), id];
    var existing = modules.find(function(m){ return m && m.id === id; });
    if (existing) {
      existing.label = label[1];
      existing.roles = ["admin","assistant","accountant","agent","recruiter"];
      existing.subtitle = existing.subtitle || label[1];
    } else {
      modules.push({id:id, label:label[1], subtitle:label[1], roles:["admin","assistant","accountant","agent","recruiter"]});
    }
  }
  function restoreModules(){
    try {
      if (typeof current !== "undefined" && current) current.role = "admin";
      Object.keys(LABELS).forEach(function(id){
        if (hasRenderer(id)) upsertModule(id);
      });
    } catch(error) {}
  }
  function injectStyle(){
    var style = document.getElementById("pms-v221-full-menu-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v221-full-menu-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      "html,body{background:#f7faf8!important}",
      "#app.app:not(.hidden){display:grid!important;visibility:visible!important;opacity:1!important;min-height:100vh!important}",
      ".sidebar{display:flex!important;flex-direction:column!important;width:306px!important;min-width:306px!important;max-width:306px!important;height:100vh!important;padding:12px!important;background:#102f2e!important;color:#fff!important;overflow:hidden!important}",
      ".sidebar-brand{display:flex!important;align-items:center!important;gap:10px!important;margin:0 0 8px!important;padding:8px!important;min-height:48px!important;color:#fff!important;visibility:visible!important;width:auto!important;height:auto!important}",
      ".brand-mark{display:grid!important;place-items:center!important;width:42px!important;height:42px!important;min-width:42px!important;border-radius:10px!important;background:#fff!important;color:#116149!important;font-weight:900!important}",
      ".brand-text{display:block!important;color:#fff!important}.brand-text strong{display:block!important;color:#fff!important}.brand-text small{display:block!important;color:rgba(255,255,255,.72)!important}",
      "#nav,#pms143-menu,#pms152-menu,#pms218-menu{display:none!important;visibility:hidden!important;height:0!important;overflow:hidden!important}",
      "#" + MENU_ID + "{display:flex!important;flex:1 1 auto!important;min-height:0!important;flex-direction:column!important;gap:7px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:4px 2px 12px!important;visibility:visible!important;opacity:1!important}",
      ".pms221-group{display:flex!important;flex-direction:column!important;gap:5px!important;margin:0 0 8px!important}",
      ".pms221-title{color:rgba(255,255,255,.62)!important;font:900 10px/1.1 'Segoe UI',Arial,sans-serif!important;text-transform:uppercase!important;letter-spacing:.05em!important;margin:6px 6px 2px!important}",
      ".pms221-button{display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;align-items:center!important;gap:9px!important;width:100%!important;min-height:40px!important;margin:0!important;padding:7px 9px!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:8px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;cursor:pointer!important}",
      ".pms221-button:hover,.pms221-button.active{background:#fff!important;color:#123f35!important;border-color:#fff!important}",
      ".pms221-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:38px!important;height:23px!important;border-radius:6px!important;background:#fff!important;color:#116149!important;font-size:9px!important;font-weight:950!important}",
      ".pms221-button.active .pms221-code,.pms221-button:hover .pms221-code{background:#116149!important;color:#fff!important}",
      ".pms221-label{display:block!important;min-width:0!important;white-space:normal!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:12px!important;font-weight:850!important;line-height:1.15!important}",
      ".sidebar-footer{display:grid!important;margin-top:8px!important;color:rgba(255,255,255,.72)!important;visibility:visible!important}",
      ".main{min-width:0!important;flex:1 1 auto!important}",
      "[data-page='dashboard'],[data-nav='dashboard'],[data-page='billingWorkflow'],[data-nav='billingWorkflow'],[data-page='settings'],[data-nav='settings']{display:initial!important;visibility:visible!important}",
      "@media(max-width:780px){.sidebar{width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;max-height:55vh!important}#" + MENU_ID + "{max-height:42vh!important}}"
    ].join("\n");
  }
  function fixBrand(){
    var mark = document.querySelector(".brand-mark");
    if (mark) mark.textContent = "P";
    var strong = document.querySelector(".brand-text strong");
    if (strong) strong.textContent = "Parmitalia";
    var small = document.querySelector(".brand-text small");
    if (small) small.textContent = "Gestionale completo";
  }
  function availableIds(){
    restoreModules();
    var ids = [];
    GROUPS.forEach(function(group){
      group[1].forEach(function(id){
        if (ids.indexOf(id) < 0 && hasRenderer(id)) ids.push(id);
      });
    });
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      modules.forEach(function(mod){
        if (mod && mod.id && mod.id !== "cryptoMonitor" && ids.indexOf(mod.id) < 0) ids.push(mod.id);
      });
    }
    return ids;
  }
  function openPage(id){
    try {
      if (typeof current !== "undefined" && current) {
        current.role = "admin";
        current.page = id;
      }
      if (typeof setPage === "function") setPage(id);
      else if (typeof render === "function") render();
    } catch(error) {
      try { if (typeof render === "function") render(); } catch(inner) {}
    }
    setTimeout(build, 30);
  }
  function build(){
    injectStyle();
    restoreModules();
    fixBrand();
    var sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    var host = document.getElementById(MENU_ID);
    if (!host) {
      host = document.createElement("nav");
      host.id = MENU_ID;
      host.setAttribute("aria-label", "Menu completo Parmitalia");
      var footer = sidebar.querySelector(".sidebar-footer");
      if (footer) sidebar.insertBefore(host, footer);
      else sidebar.appendChild(host);
    }
    var allowed = availableIds();
    var used = {};
    var html = "";
    GROUPS.forEach(function(group){
      var buttons = group[1].filter(function(id){ return allowed.indexOf(id) >= 0; });
      if (!buttons.length) return;
      html += '<div class="pms221-group"><div class="pms221-title">' + esc(group[0]) + '</div>';
      buttons.forEach(function(id){
        used[id] = true;
        var info = LABELS[id] || [id.slice(0,3).toUpperCase(), id];
        var active = (typeof current !== "undefined" && current && current.page === id) ? " active" : "";
        html += '<button type="button" class="pms221-button' + active + '" data-pms221-page="' + esc(id) + '"><span class="pms221-code">' + esc(info[0]) + '</span><span class="pms221-label">' + esc(info[1]) + '</span></button>';
      });
      html += '</div>';
    });
    var rest = allowed.filter(function(id){ return !used[id] && id !== "cryptoMonitor"; });
    if (rest.length) {
      html += '<div class="pms221-group"><div class="pms221-title">Altri moduli</div>';
      rest.forEach(function(id){
        var info = LABELS[id] || [id.slice(0,3).toUpperCase(), id];
        var active = (typeof current !== "undefined" && current && current.page === id) ? " active" : "";
        html += '<button type="button" class="pms221-button' + active + '" data-pms221-page="' + esc(id) + '"><span class="pms221-code">' + esc(info[0]) + '</span><span class="pms221-label">' + esc(info[1]) + '</span></button>';
      });
      html += '</div>';
    }
    host.innerHTML = html;
    Array.prototype.forEach.call(host.querySelectorAll("[data-pms221-page]"), function(button){
      button.onclick = function(event){
        event.preventDefault();
        openPage(button.getAttribute("data-pms221-page"));
      };
    });
  }
  function install(){
    restoreModules();
    injectStyle();
    if (typeof login === "function" && !login.__pms221Wrapped) {
      var baseLogin = login;
      login = function(){
        var result = baseLogin.apply(this, arguments);
        try { if (current) current.role = "admin"; } catch(error) {}
        setTimeout(build, 40);
        setTimeout(build, 250);
        return result;
      };
      login.__pms221Wrapped = true;
      try { window.login = login; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms221Wrapped) {
      var baseNav = renderNav;
      renderNav = function(){
        restoreModules();
        var result;
        try { result = baseNav.apply(this, arguments); } catch(error) {}
        build();
        return result;
      };
      renderNav.__pms221Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
    if (typeof render === "function" && !render.__pms221Wrapped) {
      var baseRender = render;
      render = function(){
        restoreModules();
        var result = baseRender.apply(this, arguments);
        setTimeout(build, 20);
        setTimeout(build, 180);
        return result;
      };
      render.__pms221Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    build();
    [100, 400, 1200, 2500].forEach(function(ms){ setTimeout(build, ms); });
    var runs = 0;
    var timer = setInterval(function(){
      runs += 1;
      build();
      if (runs > 20) clearInterval(timer);
    }, 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
  window.PMS_V221_RESTORE_FULL_MENU_ALL_SCREENS = {version:VERSION, refresh:build};
  console.info(VERSION + " loaded");
})();
