(function(){
  "use strict";

  var VERSION = "pms_v202_restore_italian_menu_foreign_font_fix";
  var FOREIGN_PAGES = ["foreignEmployees", "foreignRecruiting", "humanResources"];
  var IT_MODULES = {
    dashboard:["Dashboard","Visione generale operativa"],
    assistant:["Assistente Carlo","Promemoria, offerte, follow-up e attivita operative"],
    marketTrends:["Andamenti di mercato","Quotazioni e analisi di mercato"],
    operativeManagement:["Gestione operativa","Flussi e controllo operativo"],
    communications:["Comunicazioni / CRM","Opportunita, attivita e comunicazioni"],
    crmActivities:["Attivita CRM","Archivio attivita e calendario"],
    crmOpportunities:["Opportunita CRM","Pipeline opportunita commerciali"],
    opportunities:["Opportunita","Pipeline opportunita commerciali"],
    companiesCrm:["Aziende CRM","Aziende, contatti e relazione commerciale"],
    officialCommunications:["Comunicazioni ufficiali","Protocollo, lettere e stampe"],
    trattativeInCorso:["Trattative in corso","Trattative aperte e storico"],
    deals:["Trattative in corso","Trattative aperte e storico"],
    intermediations:["Intermediazioni","Pratiche commerciali e provvigioni Parmitalia"],
    offers:["Offerte","Numerazione automatica, stampa e codice a barre"],
    orders:["Ordini","Ordini cliente e fornitore"],
    products:["Prodotti e Articoli","Anagrafica articoli, immagini e packaging"],
    supplierPriceConfirmations:["Listini e conferme fornitori","Prezzi fornitori, validita e archivio"],
    tenders:["Gare e richieste","Richieste, gare e documenti"],
    commercialBrokerage:["Commerciale / Brokeraggio","Pipeline commerciale e intermediazioni"],
    contacts:["Database Anagrafiche","Clienti, fornitori, prodotti e articoli"],
    print:["Stampe","Centro stampe: schede, report e documenti"],
    packing:["Packing List","Imballaggio, pesi, pallet e container"],
    supplierGeoGroupage:["Geo fornitore / groupage","Rotte, trasporti e groupage"],
    documents:["Archivio documenti","Documenti collegati a pratiche, ordini e contratti"],
    billingWorkflow:["Fatturazione","Controllo fatture e flusso contabile"],
    accountant:["Commercialista","Fatture, estratti bancari e invii mensili"],
    banks:["Banche","Conti, IBAN, valute ed estratti bancari"],
    payments:["Pagamenti / Garanzie","Scadenze, pagamenti, garanzie e LC"],
    agents:["Agenti / Commissioni","Agenti, commissioni e stato fatture"],
    driverRecruiting:["Recruiting autisti","Autisti, coppie, contratti e provvigioni"],
    humanResources:["Dipendenti azienda","Schede personale, ferie e paghe"],
    foreignEmployees:["Dipendenti estero","Archivio pratiche e schede candidati esteri"],
    foreignRecruiting:["Recruiting estero","Foto, passaporto, privacy bilingue e documenti"],
    legalClaims:["Reclami / Legale","Pratiche legali, reclami e documenti"],
    contracts:["Legale / Contratti","Mandati, contratti, rinnovi e scadenze"],
    contractTemplates:["Modelli contratti","NDA, mandati, accordi e anteprime modificabili"],
    customerInternalExtraction:["Estrazione clienti interni","Elenchi e stampe clienti"],
    settings:["Impostazioni","Logo, dati aziendali, utenti e configurazione"],
    admin:["Admin","Backup, controllo dati e strumenti amministratore"],
    desktopCloudApp:["App desktop Windows macOS","Installazione e aggiornamenti desktop"],
    desktopRoadmap:["Piano applicazione desktop","Piano operativo app desktop"],
    cryptoMonitor:["Crypto monitor","Registro monitoraggio manuale"]
  };
  var TEXT_BACK = {
    "App language":"Lingua gestionale",
    "Print language":"Lingua stampa",
    "Default language":"Lingua default",
    "Settings":"Impostazioni",
    "Open":"Apri",
    "View":"Vedi",
    "Edit":"Modifica",
    "Delete":"Elimina",
    "Print":"Stampa",
    "Actions":"Azioni",
    "New":"Nuovo",
    "Search":"Cerca",
    "Foreign employees":"Dipendenti estero",
    "Foreign recruiting":"Recruiting estero",
    "Foreign employees archive":"Archivio dipendenti estero",
    "Foreign recruiting archive":"Archivio recruiting estero",
    "Foreign candidate file":"Scheda candidato estero",
    "Accounting":"Contabilita",
    "Dashboard":"Dashboard",
    "Market trends":"Andamenti di mercato",
    "Current negotiations":"Trattative in corso",
    "Communications / CRM":"Comunicazioni / CRM",
    "Communications and CRM":"Comunicazioni e CRM",
    "Customers and suppliers":"Clienti e fornitori",
    "Supplier price confirmations":"Conferme prezzi fornitori",
    "Products and items":"Prodotti e articoli",
    "Print center":"Centro stampe"
  };

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v202-italian-menu");
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function forceItalianApp(){
    var settings = st().settings;
    var changed = false;
    if (settings.appLanguage !== "IT") { settings.appLanguage = "IT"; changed = true; }
    if (settings.defaultLanguage !== "IT") { settings.defaultLanguage = "IT"; changed = true; }
    if (settings.menuLanguage !== "IT") { settings.menuLanguage = "IT"; changed = true; }
    if (settings.pms202ItalianMenuRestored !== "1") { settings.pms202ItalianMenuRestored = "1"; changed = true; }
    if (changed) saveNow();
  }
  function forceDirection(){
    document.documentElement.lang = "it";
    document.documentElement.dir = "ltr";
    if (document.body) document.body.dir = "ltr";
    [document.body, document.querySelector(".sidebar"), document.getElementById("nav"), document.querySelector(".topbar"), document.getElementById("content"), document.getElementById("modal")].filter(Boolean).forEach(function(el){
      el.setAttribute("dir", "ltr");
      el.style.direction = "ltr";
      el.style.unicodeBidi = "normal";
    });
  }
  function restoreModules(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    modules.forEach(function(module){
      var item = IT_MODULES[module.id];
      if (!item) return;
      module.label = item[0];
      module.subtitle = item[1];
    });
  }
  function replaceText(root){
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        var parent = node.parentElement;
        if (!parent || ["SCRIPT","STYLE","TEXTAREA","INPUT","SVG","CANVAS"].indexOf(parent.tagName) >= 0) return NodeFilter.FILTER_REJECT;
        return clean(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      var text = clean(node.nodeValue);
      if (TEXT_BACK[text]) node.nodeValue = node.nodeValue.replace(text, TEXT_BACK[text]);
    });
    root.querySelectorAll("[placeholder],[title],[aria-label],option,button").forEach(function(el){
      ["placeholder","title","aria-label"].forEach(function(attr){
        if (!el.hasAttribute(attr)) return;
        var text = clean(el.getAttribute(attr));
        if (TEXT_BACK[text]) el.setAttribute(attr, TEXT_BACK[text]);
      });
      if ((el.tagName === "OPTION" || el.tagName === "BUTTON") && TEXT_BACK[clean(el.textContent)]) {
        el.textContent = TEXT_BACK[clean(el.textContent)];
      }
    });
  }
  function restoreVisibleMenu(){
    restoreModules();
    replaceText(document.querySelector(".sidebar"));
    replaceText(document.querySelector(".topbar"));
    document.querySelectorAll('select[name="appLanguage"],select[name="defaultLanguage"],#pms134-app-lang').forEach(function(select){
      select.value = "IT";
    });
  }
  function currentPage(){
    return window.current && current.page ? current.page : "";
  }
  function isForeignPage(){
    var content = document.getElementById("content");
    return FOREIGN_PAGES.indexOf(currentPage()) >= 0 || !!(content && content.querySelector(".pms197-table,.pms189-actions,.pms176-workspace,[data-pms189-foreign-row]"));
  }
  function normalizeForeignActions(root){
    root = root || document;
    root.querySelectorAll("[data-pms189-open]").forEach(function(btn){ btn.textContent = "Apri scheda"; });
    root.querySelectorAll("[data-pms189-edit],[data-pms197-edit]").forEach(function(btn){ btn.textContent = "Modifica"; });
    root.querySelectorAll("[data-pms189-print],[data-pms197-print]").forEach(function(btn){ btn.textContent = "Stampa"; });
    root.querySelectorAll("[data-pms189-accounting]").forEach(function(btn){ btn.textContent = "Contabilita"; });
    root.querySelectorAll("[data-pms189-delete],[data-pms197-delete]").forEach(function(btn){ btn.textContent = "Elimina"; });
    root.querySelectorAll(".pms189-actions,.pms197-actions").forEach(function(box){
      box.setAttribute("dir", "ltr");
      box.setAttribute("aria-label", "Azioni pratica estero");
      var cell = box.closest("td");
      if (cell) cell.classList.add("pms202-actions-cell");
    });
  }
  function markForeignPage(){
    if (!document.body) return;
    document.body.classList.toggle("pms202-foreign-page", isForeignPage());
  }
  function injectCss(){
    var style = document.getElementById("pms-v202-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v202-style";
      document.head.appendChild(style);
    }
    if (style.dataset.pms202Ready === "1") return;
    style.dataset.pms202Ready = "1";
    style.textContent = [
      "html,body,.app,.sidebar,#nav,.topbar,#content,#modal{direction:ltr!important;unicode-bidi:normal!important}",
      ".sidebar,#nav,.topbar{text-align:left!important}",
      ".sidebar,#pms143-menu,#nav,.pms143-button,.nav-button{transition:none!important;animation:none!important}",
      "body:not(.pms108-bottom-menu) #pms143-menu{display:grid!important;visibility:visible!important;opacity:1!important;grid-template-columns:1fr!important;align-content:start!important}",
      "#pms164-menu-wrap,#pms165-top-menu{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;pointer-events:none!important}",
      ".sidebar .nav-button,#nav .nav-button{direction:ltr!important;text-align:left!important;justify-content:flex-start!important;font-family:'Segoe UI',Arial,sans-serif!important}",
      ".sidebar .nav-button *,.sidebar-brand,.sidebar-brand *{direction:ltr!important;text-align:left!important}",
      "body.pms202-foreign-page #content,body.pms202-foreign-page #content *{font-family:'Segoe UI',Arial,sans-serif!important;letter-spacing:0!important}",
      "body.pms202-foreign-page #content table{direction:ltr!important;text-align:left!important;font-size:12.5px!important;line-height:1.28!important}",
      "body.pms202-foreign-page #content th,body.pms202-foreign-page #content td{writing-mode:horizontal-tb!important;text-orientation:mixed!important;direction:ltr!important;vertical-align:top!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important}",
      "body.pms202-foreign-page #content th{text-align:left!important;font-weight:900!important;color:#17242b!important}",
      "body.pms202-foreign-page .pms197-table,body.pms202-foreign-page .pms189-table{min-width:1050px!important;table-layout:auto!important}",
      "body.pms202-foreign-page .pms202-actions-cell,body.pms202-foreign-page .pms189-stable-cell,body.pms202-foreign-page .pms197-table td:last-child{min-width:390px!important;width:390px!important;text-align:right!important;white-space:normal!important}",
      "body.pms202-foreign-page .pms189-actions,body.pms202-foreign-page .pms197-actions{display:flex!important;flex-direction:row!important;align-items:center!important;justify-content:flex-end!important;gap:7px!important;flex-wrap:nowrap!important;direction:ltr!important;text-align:right!important;min-height:34px!important}",
      "body.pms202-foreign-page .pms189-actions button,body.pms202-foreign-page .pms197-actions button{width:auto!important;min-width:0!important;margin:0!important;padding:7px 9px!important;border-radius:6px!important;font-size:11.5px!important;font-weight:850!important;line-height:1.1!important;white-space:nowrap!important}",
      "body.pms202-foreign-page .pms197-head,body.pms202-foreign-page .pms197-head .filters{direction:ltr!important;text-align:left!important;align-items:center!important}",
      "body.pms202-foreign-page .pms197-head h3{font-size:18px!important;line-height:1.2!important;color:#17242b!important}",
      "@media(max-width:900px){body.pms202-foreign-page .pms202-actions-cell,body.pms202-foreign-page .pms189-stable-cell,body.pms202-foreign-page .pms197-table td:last-child{min-width:260px!important;width:auto!important}body.pms202-foreign-page .pms189-actions,body.pms202-foreign-page .pms197-actions{flex-wrap:wrap!important;justify-content:flex-start!important;text-align:left!important}}"
    ].join("\n");
  }
  function decorate(){
    forceItalianApp();
    forceDirection();
    injectCss();
    restoreVisibleMenu();
    markForeignPage();
    normalizeForeignActions(document);
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms202Wrapped) {
      var baseRender = render;
      render = function(){
        forceItalianApp();
        var result = baseRender.apply(this, arguments);
        setTimeout(decorate, 20);
        setTimeout(decorate, 180);
        return result;
      };
      render.__pms202Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms202Wrapped) {
      var baseRenderNav = renderNav;
      renderNav = function(){
        restoreModules();
        var result = baseRenderNav.apply(this, arguments);
        setTimeout(restoreVisibleMenu, 10);
        setTimeout(forceDirection, 10);
        return result;
      };
      renderNav.__pms202Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }
  function observeChanges(){
    if (window.__pms202StableObserver || !document.body || typeof MutationObserver !== "function") return;
    var scheduled = false;
    window.__pms202StableObserver = new MutationObserver(function(mutations){
      var relevant = mutations.some(function(mutation){
        var target = mutation.target;
        return target && target.closest && !target.closest("#pms143-menu,.sidebar");
      });
      if (!relevant || scheduled) return;
      scheduled = true;
      setTimeout(function(){
        scheduled = false;
        decorate();
      }, 80);
    });
    window.__pms202StableObserver.observe(document.body, {childList:true, subtree:true});
  }

  forceItalianApp();
  restoreModules();
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate);
  else decorate();
  setTimeout(function(){
    try { if (typeof renderNav === "function") renderNav(); } catch(error) {}
    decorate();
    observeChanges();
  }, 80);
  [250, 700, 1400, 2600].forEach(function(ms){ setTimeout(decorate, ms); });
  window.PMS_V202_RESTORE_ITALIAN_MENU_FOREIGN_FONT_FIX = {version:VERSION, refresh:decorate};
})();
