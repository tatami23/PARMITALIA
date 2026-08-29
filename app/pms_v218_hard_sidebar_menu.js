(function(){
  var STYLE_ID = "pms-v218-hard-sidebar-style";
  var MENU_ID = "pms218-menu";
  var labels = {
    dashboard: "Dashboard",
    marketTrends: "Andamenti di mercato",
    operativo: "Gestione operativa",
    assistant: "Backoffice / Segretariato",
    communications: "Comunicazioni / CRM",
    officialCommunications: "Comunicazioni ufficiali",
    trattativeInCorso: "Trattative in corso",
    intermediations: "Intermediazioni",
    offers: "Offerte commerciali",
    approvals: "Autorizzazioni Admin",
    orders: "Ordini",
    products: "Prodotti e articoli",
    productForms: "Moduli",
    supplierPriceConfirmations: "Listini e conferme fornitori",
    tenders: "Gare e richieste",
    commercialBrokerage: "Brokeraggio commerciale",
    contacts: "Anagrafiche",
    print: "Centro stampe",
    supplierGeoGroupage: "Geo fornitore",
    transportPrices: "Trasporti",
    packing: "Packing list",
    documents: "Archivio documenti",
    accountant: "Commercialista",
    billingWorkflow: "Fatturazione",
    banks: "Banche",
    payments: "Pagamenti e garanzie",
    agents: "Agenti e provvigioni",
    driverRecruiting: "Recruiting autisti",
    humanResources: "Dipendenti azienda",
    foreignEmployees: "Dipendenti estero",
    legalClaims: "Sinistri e legale",
    legalProtocols: "Protocolli legali",
    contracts: "Contratti",
    contractTemplates: "Modelli contrattuali",
    customerInternalExtraction: "Estrazione clienti",
    desktopCloudApp: "App Desktop",
    desktopRoadmap: "Piano app desktop",
    settings: "Impostazioni",
    admin: "Admin",
    companyFleet: "Flotta auto aziendale"
  };

  function installStyle(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ".sidebar{display:flex!important;flex-direction:column!important;width:292px!important;min-width:292px!important;max-width:292px!important;height:100vh!important;padding:12px!important;background:#102f2e!important;color:#fff!important;overflow:hidden!important}",
      ".sidebar-brand,#pms143-menu,#nav{display:none!important}",
      "#" + MENU_ID + "{display:flex!important;flex:1 1 auto!important;min-height:0!important;flex-direction:column!important;gap:5px!important;overflow-y:auto!important;overflow-x:hidden!important;padding:4px 2px 12px!important;visibility:visible!important;opacity:1!important}",
      "#" + MENU_ID + " button{display:block!important;width:100%!important;min-height:39px!important;margin:0!important;padding:9px 12px!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:7px!important;background:rgba(255,255,255,.08)!important;color:#fff!important;text-align:left!important;font:800 12px/1.2 'Segoe UI',Arial,sans-serif!important;cursor:pointer!important}",
      "#" + MENU_ID + " button:hover,#" + MENU_ID + " button.active{background:#fff!important;color:#123f35!important;border-color:#fff!important}",
      ".sidebar-footer{display:grid!important;flex:0 0 auto!important;margin-top:8px!important;color:#fff!important}",
      ".main{min-width:0!important;flex:1 1 auto!important}",
      "@media(max-width:780px){.sidebar{width:100%!important;min-width:0!important;max-width:none!important;height:auto!important;max-height:50vh!important}}"
    ].join("\n");
  }

  function availableIds(){
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) {
        return modules.filter(function(mod){
          if (!mod || !mod.id || mod.id === "cryptoMonitor") return false;
          try {
            if (typeof current !== "undefined" && current.role !== "admin" && Array.isArray(mod.roles)) {
              return mod.roles.indexOf(current.role) !== -1;
            }
          } catch(error) {}
          return true;
        }).map(function(mod){ return mod.id; });
      }
    } catch(error) {}
    return Object.keys(labels);
  }

  function currentPage(){
    try { return typeof current !== "undefined" ? current.page : "dashboard"; }
    catch(error) { return "dashboard"; }
  }

  function openPage(page){
    try {
      if (typeof setPage === "function") {
        setPage(page);
        return;
      }
    } catch(error) {}
    try {
      if (typeof current !== "undefined") current.page = page;
      if (typeof render === "function") render();
    } catch(error) {}
  }

  function build(){
    try {
      installStyle();
      var sidebar = document.querySelector(".sidebar");
      if (!sidebar) return;
      var host = document.getElementById(MENU_ID);
      if (!host) {
        host = document.createElement("nav");
        host.id = MENU_ID;
        host.setAttribute("aria-label", "Menu principale");
        var footer = sidebar.querySelector(".sidebar-footer");
        if (footer) sidebar.insertBefore(host, footer);
        else sidebar.appendChild(host);
      }
      var ids = availableIds();
      if (host.children.length !== ids.length) {
        host.textContent = "";
        ids.forEach(function(id){
          var button = document.createElement("button");
          button.type = "button";
          button.setAttribute("data-pms218-page", id);
          button.textContent = labels[id] || id;
          button.addEventListener("click", function(event){
            event.preventDefault();
            openPage(id);
            setTimeout(build, 50);
          });
          host.appendChild(button);
        });
      }
      var active = currentPage();
      Array.prototype.forEach.call(host.querySelectorAll("button"), function(button){
        button.classList.toggle("active", button.getAttribute("data-pms218-page") === active);
      });
    } catch(error) {}
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
  setInterval(build, 750);
  window.PMS_V218_HARD_SIDEBAR_MENU = { refresh: build };
})();
