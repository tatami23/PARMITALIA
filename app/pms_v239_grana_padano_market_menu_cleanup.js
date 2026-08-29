(function(){
  "use strict";

  if (window.PMS_V239_GRANA_PADANO_MARKET_MENU_CLEANUP) return;

  var VERSION = "pms_v239_grana_padano_market_menu_cleanup";
  var HIDDEN_MODULES = ["approvals", "priceHistory", "operationHistory", "operationsHistory", "accessHistory"];
  var LEGACY_IDS = ["MP239-GRANA-PADANO-10M"];
  var LEGACY_NAMES = ["Grana Padano 10 mesi"];
  var SOURCE_ISMEA = "https://www.ismeamercati.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/1667";
  var SOURCE_CONSORZIO = "https://www.granapadano.it/it-it/il-consorzio-di-tutela/i-risultati-produzione-e-consumo/";
  var SOURCE_ASSOLATTE = "https://www.assolatte.it/it/home/eco_graph/quotmer/2017?ec=Grana+Padano+12%2F15+mesi";
  var GRANA_ROW = {
    id: "MP239-GRANA-PADANO-12M",
    group: "Cheese",
    name: "Grana Padano 12 mesi - forme intere",
    market: "Italia",
    unit: "EUR/kg",
    y2024: 11.37,
    y2025: 12.01,
    y2026: 10.89,
    price: 10.89,
    forecastNext: 10.95,
    forecastQ4: 11.05,
    source: "ISMEA / Consorzio Grana Padano / Assolatte - 12/15 mesi, forme intere",
    sourceUrl: SOURCE_ISMEA,
    note: "Prezzi all'origine IVA esclusa, EUR/kg. 2026 ultimo riferimento: media settimanale 12-15 mesi 10,89 EUR/kg; previsione prudente Q4 2026: 11,05 EUR/kg."
  };
  var GRANA_HISTORY = [
    {
      id: "MKT239-GRANA-PADANO-12M-2024",
      date: "2024-12-31",
      year: "2024",
      price: 11.37,
      source: "Assolatte / Borse merci Milano-Cremona-Mantova",
      sourceUrl: SOURCE_ASSOLATTE,
      note: "Riferimento dicembre 2024: 12-15 mesi a 11,374 EUR/kg."
    },
    {
      id: "MKT239-GRANA-PADANO-12M-2025",
      date: "2025-07-31",
      year: "2025",
      price: 12.01,
      source: "ISMEA Mercati - medio mensile ricostruito da luglio 2026",
      sourceUrl: SOURCE_ISMEA,
      note: "Luglio 2026 10,82 EUR/kg con variazione annua -9,9%; luglio 2025 ricostruito circa 12,01 EUR/kg."
    },
    {
      id: "MKT239-GRANA-PADANO-12M-2025-DEC",
      date: "2025-12-20",
      year: "2025",
      price: 10.73,
      source: "BMTI / Camere di Commercio su Informatore Zootecnico",
      sourceUrl: "https://informatorezootecnico.edagricole.it/economia-mercati/bmti-listini-giu-latte-spot-burro-grana-padano-pecorino-romano-su-parmigiano-reggiano/",
      note: "Dicembre 2025: Cremona 10,30-10,90 e Mantova 10,75-10,95 EUR/kg; media operativa circa 10,73 EUR/kg."
    },
    {
      id: "MKT239-GRANA-PADANO-12M-2026",
      date: "2026-08-06",
      year: "2026",
      price: 10.89,
      source: "Consorzio Grana Padano / Borse merci Milano-Cremona-Mantova",
      sourceUrl: SOURCE_CONSORZIO,
      note: "Prezzo medio settimanale 12-15 mesi: 10,89 EUR/kg; range medio 10,72-11,07 EUR/kg."
    }
  ];
  var GRANA_FORECASTS = [
    { id: "MKT239-GRANA-PADANO-12M-FC-2026-09", date: "2026-09-30", price: 10.95, note: "Previsione prudente: recupero leggero dopo il minimo 2026." },
    { id: "MKT239-GRANA-PADANO-12M-FC-2026-10", date: "2026-10-31", price: 11.05, note: "Previsione Q4 2026: stabilizzazione verso 11,00 EUR/kg." },
    { id: "MKT239-GRANA-PADANO-12M-FC-2026-12", date: "2026-12-31", price: 11.15, note: "Scenario dicembre 2026: lieve recupero, da verificare con nuove borse merci." }
  ];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }

  function arr(value){ return Array.isArray(value) ? value : []; }

  function sameText(a, b){
    return String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
  }

  function isLegacyGrana(row){
    var id = String(row && row.id || "");
    var name = String(row && (row.name || row.product) || "");
    return LEGACY_IDS.some(function(value){ return sameText(id, value); }) ||
      LEGACY_NAMES.some(function(value){ return sameText(name, value); });
  }

  function ensureState(){
    state.settings = state.settings || {};
    state.marketPreview52 = arr(state.marketPreview52);
    state.marketTrends = arr(state.marketTrends);
    state.priceHistory = arr(state.priceHistory);
    state.marketForecasts = arr(state.marketForecasts);
    return state;
  }

  function ensureGranaPadano(){
    ensureState();
    var changed = false;
    var previewIndex = state.marketPreview52.findIndex(function(row){
      return sameText(row.id, GRANA_ROW.id) || sameText(row.name, GRANA_ROW.name) || isLegacyGrana(row);
    });
    if (previewIndex >= 0) {
      var merged = Object.assign({}, state.marketPreview52[previewIndex], GRANA_ROW);
      if (JSON.stringify(merged) !== JSON.stringify(state.marketPreview52[previewIndex])) {
        state.marketPreview52[previewIndex] = merged;
        changed = true;
      }
    } else {
      state.marketPreview52.push(Object.assign({}, GRANA_ROW));
      changed = true;
    }
    state.marketPreview52 = state.marketPreview52.map(function(row){
      if (isLegacyGrana(row) || sameText(row.id, GRANA_ROW.id) || sameText(row.name, GRANA_ROW.name)) {
        return Object.assign({}, row, GRANA_ROW);
      }
      return row;
    });
    var previewSeen = false;
    state.marketPreview52 = state.marketPreview52.filter(function(row){
      if (!isLegacyGrana(row) && !sameText(row.id, GRANA_ROW.id) && !sameText(row.name, GRANA_ROW.name)) return true;
      if (previewSeen) return false;
      previewSeen = true;
      return true;
    });

    GRANA_HISTORY.forEach(function(item){
      var year = item.year || String(item.date || "").slice(0, 4);
      var id = item.id;
      var legacyId = "MKT239-GRANA-PADANO-10M-" + year;
      var existing = state.marketTrends.find(function(row){
        return sameText(row.id, id) ||
          sameText(row.id, legacyId) ||
          ((sameText(row.product, GRANA_ROW.name) || isLegacyGrana(row)) && String(row.date || "").slice(0, 4) === year);
      });
      var trend = {
        id: id,
        date: year + "-12-31",
        source: item.source,
        sourceUrl: item.sourceUrl,
        category: "Formaggi / Cheese",
        product: GRANA_ROW.name,
        market: GRANA_ROW.market,
        price: item.price,
        currency: "EUR",
        unit: GRANA_ROW.unit,
        y2024: GRANA_ROW.y2024,
        y2025: GRANA_ROW.y2025,
        y2026: GRANA_ROW.y2026,
        note: item.note,
        createdAt: new Date().toISOString()
      };
      trend.date = item.date || trend.date;
      if (existing) {
        Object.keys(trend).forEach(function(key){
          if (key === "createdAt" && existing[key]) return;
          existing[key] = trend[key];
        });
      } else {
        state.marketTrends.push(trend);
      }
    });
    GRANA_FORECASTS.forEach(function(item){
      var existing = state.marketForecasts.find(function(row){ return sameText(row.id, item.id); });
      var forecast = {
        id: item.id,
        date: item.date,
        product: GRANA_ROW.name,
        market: GRANA_ROW.market,
        price: item.price,
        currency: "EUR",
        unit: GRANA_ROW.unit,
        source: "Previsione Parmitalia su storico ISMEA/Consorzio/Assolatte",
        sourceUrl: SOURCE_ISMEA,
        confidence: "Media",
        note: item.note,
        updatedAt: new Date().toISOString()
      };
      if (existing) Object.assign(existing, forecast);
      else state.marketForecasts.push(forecast);
    });
    GRANA_HISTORY.forEach(function(item){
      var historyId = "PH239-" + item.id;
      var existing = state.priceHistory.find(function(row){ return sameText(row.id, historyId); });
      var row = {
        id: historyId,
        date: item.date,
        product: GRANA_ROW.name,
        productName: GRANA_ROW.name,
        price: item.price,
        newPrice: item.price,
        currency: "EUR",
        unit: "kg",
        source: item.source || "Previsione Parmitalia",
        sourceUrl: item.sourceUrl || SOURCE_ISMEA,
        note: item.note
      };
      if (existing) Object.assign(existing, row);
      else state.priceHistory.push(row);
    });
    state.marketTrends = state.marketTrends.map(function(row){
      if (!isLegacyGrana(row) && !sameText(row.product, GRANA_ROW.name)) return row;
      var year = String(row.date || "").slice(0, 4);
      return Object.assign({}, row, {
        id: year ? "MKT239-GRANA-PADANO-12M-" + year : "MKT239-GRANA-PADANO-12M",
        product: GRANA_ROW.name,
        unit: GRANA_ROW.unit,
        y2024: GRANA_ROW.y2024,
        y2025: GRANA_ROW.y2025,
        y2026: GRANA_ROW.y2026,
        note: row.note ? String(row.note).replace(/10 mesi/g, "12 mesi") : GRANA_ROW.note
      });
    });
    var trendSeen = {};
    state.marketTrends = state.marketTrends.filter(function(row){
      if (!isLegacyGrana(row) && !sameText(row.id, GRANA_ROW.id) && !sameText(row.product, GRANA_ROW.name)) return true;
      var year = String(row.date || "").slice(0, 4);
      var key = year || "no-year";
      if (trendSeen[key]) return false;
      trendSeen[key] = true;
      return true;
    });

    delete state.settings.granaPadano10MMarketAddedV239;
    state.settings.granaPadano12MMarketAddedV239 = "Si";
  }

  function removeHiddenModulesFromSource(){
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) {
        for (var i = modules.length - 1; i >= 0; i--) {
          if (HIDDEN_MODULES.indexOf(modules[i] && modules[i].id) >= 0) modules.splice(i, 1);
        }
      }
      if (Array.isArray(window.modules)) {
        for (var j = window.modules.length - 1; j >= 0; j--) {
          if (HIDDEN_MODULES.indexOf(window.modules[j] && window.modules[j].id) >= 0) window.modules.splice(j, 1);
        }
      }
    } catch(error) {}
  }

  function removeMatchingButton(node){
    if (!node || !node.getAttribute) return;
    var page = node.getAttribute("data-page") || node.getAttribute("data-nav") || node.getAttribute("data-pms227-page") || node.getAttribute("data-pms231-page") || "";
    var label = String(node.textContent || "").toLowerCase();
    var title = String(node.getAttribute("title") || "").toLowerCase();
    var hiddenByPage = HIDDEN_MODULES.indexOf(page) >= 0;
    var hiddenByText = /autorizzazioni?\s+admin|autorizzazioni|storico\s+operazioni|storico\s+prezzi/.test(label + " " + title);
    if (hiddenByPage || hiddenByText) node.remove();
  }

  function cleanupVisibleMenu(){
    removeHiddenModulesFromSource();
    [
      "[data-page]",
      "[data-nav]",
      "[data-pms227-page]",
      "[data-pms231-page]"
    ].forEach(function(selector){
      document.querySelectorAll(selector).forEach(removeMatchingButton);
    });
  }

  function injectMarketNote(){
    if (typeof current === "undefined" || !current || current.page !== "marketTrends") return;
    var content = document.getElementById("content");
    if (!content || document.getElementById("pms239-grana-padano-note")) return;
    var toolbar = document.getElementById("pms56-toolbar");
    var html = '<div id="pms239-grana-padano-note" class="database-note"><strong>Grana Padano 12 mesi a forme intere.</strong> Storico operativo: 2024 ' + esc(GRANA_ROW.y2024) + ' EUR/kg, 2025 ' + esc(GRANA_ROW.y2025) + ' EUR/kg, 2026 ' + esc(GRANA_ROW.y2026) + ' EUR/kg. Previsione prudente Q4 2026: ' + esc(GRANA_ROW.forecastQ4) + ' EUR/kg.</div>' +
      '<div id="pms239-grana-padano-analysis" class="card"><div class="section-header mini"><h3>Analisi Grana Padano 12 mesi - forme intere</h3></div><div class="table-wrap"><table><thead><tr><th>Anno / periodo</th><th>Prezzo</th><th>Fonte</th><th>Nota</th></tr></thead><tbody>' +
      GRANA_HISTORY.map(function(item){ return '<tr><td>' + esc(item.date) + '</td><td><strong>' + esc(item.price) + ' EUR/kg</strong></td><td><a href="' + esc(item.sourceUrl) + '" target="_blank">' + esc(item.source) + '</a></td><td>' + esc(item.note) + '</td></tr>'; }).join("") +
      GRANA_FORECASTS.map(function(item){ return '<tr><td>' + esc(item.date) + '</td><td><strong>' + esc(item.price) + ' EUR/kg</strong></td><td>Previsione Parmitalia</td><td>' + esc(item.note) + '</td></tr>'; }).join("") +
      '</tbody></table></div></div>';
    if (toolbar) toolbar.insertAdjacentHTML("afterend", html);
    else content.insertAdjacentHTML("afterbegin", html);

    var datalist = document.getElementById("pms48-product-list");
    if (datalist && !Array.prototype.some.call(datalist.options, function(option){ return option.value === GRANA_ROW.name; })) {
      datalist.insertAdjacentHTML("beforeend", '<option value="' + esc(GRANA_ROW.name) + '"></option>');
    }
    var forecastSelect = document.getElementById("pms56-forecast-select");
    if (forecastSelect && !Array.prototype.some.call(forecastSelect.options, function(option){ return option.value === GRANA_ROW.id; })) {
      forecastSelect.insertAdjacentHTML("beforeend", '<option value="' + esc(GRANA_ROW.id) + '">' + esc(GRANA_ROW.name) + ' - ' + esc(GRANA_ROW.unit) + '</option>');
    }
  }

  function redirectHiddenPage(){
    try {
      if (typeof current !== "undefined" && current && HIDDEN_MODULES.indexOf(current.page) >= 0) {
        current.page = "dashboard";
      }
    } catch(error) {}
  }

  function afterRender(){
    try {
      ensureGranaPadano();
      redirectHiddenPage();
      setTimeout(cleanupVisibleMenu, 20);
      setTimeout(cleanupVisibleMenu, 180);
      setTimeout(injectMarketNote, 220);
    } catch(error) {
      console.warn(VERSION + " refresh skipped", error);
    }
  }

  function wrap(name){
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms239Wrapped) return;
    var wrapped = function(){
      if (name === "setPage" && HIDDEN_MODULES.indexOf(arguments[0]) >= 0) {
        arguments[0] = "dashboard";
      }
      var result = fn.apply(this, arguments);
      afterRender();
      return result;
    };
    wrapped.__pms239Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch(error) {}
  }

  function install(){
    try {
      ensureGranaPadano();
      removeHiddenModulesFromSource();
      wrap("render");
      wrap("setPage");
      wrap("renderNav");
      document.addEventListener("click", function(event){
        var target = event.target && event.target.closest && event.target.closest("[data-page],[data-nav],[data-pms227-page],[data-pms231-page]");
        if (!target) return;
        var page = target.getAttribute("data-page") || target.getAttribute("data-nav") || target.getAttribute("data-pms227-page") || target.getAttribute("data-pms231-page");
        if (HIDDEN_MODULES.indexOf(page) < 0) return;
        event.preventDefault();
        event.stopPropagation();
        if (typeof setPage === "function") setPage("dashboard");
        else {
          try { current.page = "dashboard"; if (typeof render === "function") render(); } catch(error) {}
        }
      }, true);

      [60, 180, 420, 900, 1800, 3000].forEach(function(ms){ setTimeout(afterRender, ms); });
      window.PMS_V239_GRANA_PADANO_MARKET_MENU_CLEANUP = {
        version: VERSION,
        refresh: afterRender,
        hiddenModules: HIDDEN_MODULES.slice()
      };
      console.info(VERSION + " loaded");
    } catch(error) {
      console.warn(VERSION + " disabled during startup", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
