(function(){
  "use strict";

  if (window.PMS_V257_MARKET_FORECAST_REPORTS_PRICE_GUARD) return;

  var VERSION = "pms_v257_market_forecast_reports_price_guard";
  var FORECAST_PAGES = ["marketTrends", "forecastingHub", "aiMarketForecast"];
  var PRICE_MODULE = "supplierPriceConfirmations";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function num(value){
    var parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", ".").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function uid(prefix){
    try { if (typeof window.uid === "function") return window.uid(prefix); } catch (_) {}
    return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 9000);
  }
  function getState(){
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") {
        window.state = state;
        return state;
      }
    } catch (_) {}
    window.state = window.state && typeof window.state === "object" ? window.state : {};
    return window.state;
  }
  function getCurrent(){
    try {
      if (typeof current !== "undefined" && current && typeof current === "object") {
        current.filters = current.filters && typeof current.filters === "object" ? current.filters : {};
        window.current = current;
        return current;
      }
    } catch (_) {}
    window.current = window.current && typeof window.current === "object" ? window.current : { page: "dashboard", filters: {} };
    window.current.filters = window.current.filters && typeof window.current.filters === "object" ? window.current.filters : {};
    return window.current;
  }
  function saveNow(reason){
    var data = getState();
    data.settings = data.settings && typeof data.settings === "object" ? data.settings : {};
    data.settings.pms257UpdatedAt = new Date().toISOString();
    try { if (typeof save === "function") save(); } catch (error) { console.warn(VERSION + " base save skipped", error); }
    try { if (window.PMS_V252_REAL_SAVE && typeof window.PMS_V252_REAL_SAVE.saveNow === "function") window.PMS_V252_REAL_SAVE.saveNow(reason || VERSION, { silent: true }); } catch (_) {}
    try {
      var key = typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "parmitalia_management_state_v1";
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) { console.warn(VERSION + " local save skipped", error); }
  }
  function renderAgain(){
    try { if (typeof render === "function") return render(); } catch (error) { console.warn(VERSION + " render skipped", error); }
  }
  function openPrintSafe(html){
    try { if (typeof openPrint === "function") return openPrint(html); } catch (_) {}
    var root = document.getElementById("print-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "print-root";
      document.body.appendChild(root);
    }
    root.innerHTML = html;
    window.print();
  }
  function printHeader(title, code, subtitle){
    try { if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, subtitle); } catch (_) {}
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>PARMITALIA DISTRIBUTION SRL</strong></div><div class="print-meta">' + esc(code || "") + '<br>' + esc(today()) + '</div></div>';
  }
  function money(value, currency, unit){
    var amount = num(value);
    if (!amount) return "-";
    return (currency || "EUR") + " " + amount.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) + (unit ? " / " + unit : "");
  }
  function normalizeUnitPrice(row){
    var value = num(row.price != null ? row.price : (row.y2026 != null ? row.y2026 : (row.unitPrice != null ? row.unitPrice : row.value)));
    var unit = clean(row.unit || row.priceUnit || "kg").toLowerCase();
    if (!value) return 0;
    if (unit.indexOf("/t") >= 0 || unit === "t" || unit.indexOf("ton") >= 0 || unit.indexOf("tonn") >= 0) return value / 1000;
    if (unit.indexOf("100") >= 0 || unit.indexOf("quint") >= 0 || unit === "q") return value / 100;
    return value;
  }
  function productName(row){
    return clean(row.product || row.productName || row.name || row.article || row.descriptionIt || row.description || row.articleCode || row.id || "Mercato generale");
  }
  function rowDate(row, fallback){
    return clean(row.date || row.confirmationDate || row.validFrom || row.updatedAt || row.createdAt || fallback || today()).slice(0, 10);
  }
  function collectRows(){
    var s = getState();
    var out = [];
    arr(s.marketTrends).forEach(function(row){
      out.push({ product: productName(row), date: rowDate(row), price: normalizeUnitPrice(row), currency: row.currency || "EUR", unit: "kg", source: clean(row.source || "Andamento mercato"), note: clean(row.note || row.notes), sourceUrl: clean(row.sourceUrl || row.url) });
    });
    arr(s.marketPreview52).forEach(function(row){
      ["y2024", "y2025", "y2026"].forEach(function(key){
        if (!num(row[key])) return;
        out.push({ product: productName(row), date: key.slice(1) + "-06-30", price: normalizeUnitPrice({ price: row[key], unit: row.unit || "kg" }), currency: row.currency || "EUR", unit: "kg", source: clean(row.source || "Storico gestionale"), note: clean(row.note || row.notes), sourceUrl: clean(row.sourceUrl || row.url) });
      });
    });
    arr(s.marketForecasts).forEach(function(row){
      out.push({ product: productName(row), date: rowDate(row), price: normalizeUnitPrice(row), currency: row.currency || "EUR", unit: "kg", source: clean(row.source || "Forecast storico"), note: clean(row.note || row.notes), sourceUrl: clean(row.sourceUrl || row.url), forecast: true });
    });
    arr(s.supplierPriceConfirmations).forEach(function(row){
      out.push({ product: productName(row), date: rowDate(row), price: normalizeUnitPrice(row), currency: row.currency || "EUR", unit: "kg", source: "Conferma prezzo " + clean(row.direction || "fornitore"), note: clean(row.notes || row.note || row.validity), sourceUrl: "" });
    });
    arr(s.products).forEach(function(row){
      var price = normalizeUnitPrice(row);
      if (!price) return;
      out.push({ product: productName(row), date: today(), price: price, currency: row.currency || "EUR", unit: "kg", source: "Anagrafica prodotti", note: clean(row.trendNotes || row.forecastNotes || row.notes), sourceUrl: clean(row.cloudLink || row.url) });
    });
    return out.filter(function(row){ return row.product && row.price > 0; }).sort(function(a, b){ return String(a.date).localeCompare(String(b.date)); });
  }
  function productList(){
    var seen = {};
    return collectRows().map(function(row){ return row.product; }).filter(function(name){
      var key = name.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    }).sort(function(a, b){ return a.localeCompare(b, "it"); });
  }
  function buildForecast(product, months){
    months = Math.max(1, Math.min(12, parseInt(months, 10) || 3));
    var rows = collectRows().filter(function(row){ return !product || row.product === product; });
    if (!rows.length) return null;
    var prices = rows.map(function(row){ return row.price; });
    var latest = prices[prices.length - 1];
    var first = prices[0];
    var avg = prices.reduce(function(sum, value){ return sum + value; }, 0) / prices.length;
    var recent = prices.slice(Math.max(0, prices.length - 4));
    var recentAvg = recent.reduce(function(sum, value){ return sum + value; }, 0) / recent.length;
    var changes = [];
    for (var i = 1; i < prices.length; i += 1) {
      if (prices[i - 1]) changes.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    var avgMonthlyChange = changes.length ? changes.reduce(function(sum, value){ return sum + value; }, 0) / changes.length : 0;
    var longTrend = prices.length > 1 && first ? (latest - first) / first : 0;
    var volatility = changes.length ? changes.reduce(function(sum, value){ return sum + Math.abs(value - avgMonthlyChange); }, 0) / changes.length : 0.06;
    volatility = Math.max(0.025, Math.min(0.28, volatility));
    var projected = latest;
    var monthRows = [];
    for (var month = 1; month <= months; month += 1) {
      projected = Math.max(0.01, projected * (1 + avgMonthlyChange * 0.55) + (recentAvg - projected) * 0.12);
      var band = volatility * Math.sqrt(month) * 0.85;
      monthRows.push({
        label: "+" + month + " mese" + (month > 1 ? "i" : ""),
        value: projected,
        low: projected * (1 - band),
        high: projected * (1 + band)
      });
    }
    var outliers = rows.filter(function(row){ return avg && Math.abs(row.price - avg) / avg > 0.35; });
    var confidenceScore = Math.max(0, Math.min(100, 92 - Math.max(0, 6 - rows.length) * 9 - volatility * 120 - outliers.length * 5));
    var confidence = confidenceScore >= 72 ? "Alta" : confidenceScore >= 50 ? "Media" : "Bassa";
    var direction = monthRows[monthRows.length - 1].value > latest * 1.015 ? "rialzo" : monthRows[monthRows.length - 1].value < latest * 0.985 ? "ribasso" : "stabilita";
    var reasons = [
      "Storico disponibile: " + rows.length + " rilevazioni utili.",
      "Ultimo prezzo normalizzato: " + money(latest, "EUR", "kg") + ".",
      "Media recente: " + money(recentAvg, "EUR", "kg") + ".",
      "Trend storico complessivo: " + (longTrend * 100).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + "%.",
      "Volatilita stimata: " + (volatility * 100).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + "%."
    ];
    if (outliers.length) reasons.push("Sono presenti prezzi fuori scala da riverificare prima dell'invio esterno.");
    else reasons.push("Nessuna anomalia forte rispetto alla media interna.");
    return { product: product, months: months, rows: rows, latest: latest, recentAvg: recentAvg, avg: avg, volatility: volatility, outliers: outliers, monthRows: monthRows, confidence: confidence, confidenceScore: Math.round(confidenceScore), direction: direction, reasons: reasons };
  }
  function currentSelection(){
    var s = getState();
    s.settings = s.settings && typeof s.settings === "object" ? s.settings : {};
    var products = productList();
    var selected = clean(s.settings.pms257ForecastProduct || s.settings.pms256ForecastProduct || products[0] || "");
    if (products.length && products.indexOf(selected) < 0) selected = products[0];
    var months = clean(s.settings.pms257ForecastMonths || s.settings.pms256ForecastMonths || "3");
    if (["1", "3", "6", "12"].indexOf(months) < 0) months = "3";
    return { products: products, product: selected, months: months };
  }
  function relationFromModel(model){
    if (!model) return null;
    return {
      id: uid("FRC"),
      date: today(),
      product: model.product,
      horizonMonths: model.months,
      latestPrice: model.latest,
      forecastPrice: model.monthRows[model.monthRows.length - 1].value,
      lowRange: model.monthRows[model.monthRows.length - 1].low,
      highRange: model.monthRows[model.monthRows.length - 1].high,
      confidence: model.confidence,
      confidenceScore: model.confidenceScore,
      direction: model.direction,
      reasons: model.reasons.join("\n"),
      sources: model.rows.slice(-8).map(function(row){ return [row.date, row.source, money(row.price, "EUR", "kg"), row.note].filter(Boolean).join(" | "); }).join("\n"),
      internalNotes: model.outliers.length ? "Riverificare prezzi anomali prima di inoltrare." : "",
      createdAt: new Date().toISOString()
    };
  }
  function ensureForecastStore(){
    var s = getState();
    s.marketForecastReports = arr(s.marketForecastReports);
    s.settings = s.settings && typeof s.settings === "object" ? s.settings : {};
    return s.marketForecastReports;
  }
  function createOrUpdateReport(){
    var sel = currentSelection();
    var productNode = document.getElementById("pms257-product");
    var monthNode = document.getElementById("pms257-months");
    if (productNode) sel.product = productNode.value;
    if (monthNode) sel.months = monthNode.value;
    var model = buildForecast(sel.product, sel.months);
    if (!model) {
      alert("Non ci sono dati sufficienti per generare la previsione del prodotto selezionato.");
      return;
    }
    var s = getState();
    s.settings.pms257ForecastProduct = sel.product;
    s.settings.pms257ForecastMonths = String(model.months);
    var report = relationFromModel(model);
    var editId = clean(s.settings.pms257EditingReportId);
    var list = ensureForecastStore();
    var index = list.findIndex(function(row){ return row.id === editId; });
    if (index >= 0) list[index] = Object.assign({}, list[index], report, { id: editId, updatedAt: new Date().toISOString() });
    else list.unshift(report);
    delete s.settings.pms257EditingReportId;
    saveNow("market-forecast-report");
    renderAgain();
  }
  function hideLegacyGranaBlocks(){
    ["pms239-grana-padano-note", "pms239-grana-padano-analysis", "pms56-toolbar", "pms56-forecast-panel"].forEach(function(id){
      var node = document.getElementById(id);
      if (node) node.style.setProperty("display", "none", "important");
    });
    document.querySelectorAll(".database-note,.card,.pms56-forecast-panel").forEach(function(node){
      var text = clean(node.innerText || "");
      if (/Analisi\s+Grana\s+Padano\s+12\s+mesi|Grana\s+Padano\s+12\s+mesi\s+a\s+forme\s+intere/i.test(text)) {
        node.style.setProperty("display", "none", "important");
      }
    });
  }
  function injectCss(){
    if (document.getElementById("pms-v257-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v257-style";
    style.textContent = [
      "#pms239-grana-padano-note,#pms239-grana-padano-analysis,#pms56-toolbar,#pms56-forecast-panel{display:none!important}",
      ".pms257-panel{border:1px solid #cfd8d2;border-left:5px solid #0b6b35;background:#fff;border-radius:8px;padding:14px;margin:0 0 16px;display:grid;gap:12px}",
      ".pms257-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap}.pms257-head h3{margin:0;color:#0f5132}.pms257-head p{margin:3px 0 0;color:#64748b}",
      ".pms257-controls{display:flex;gap:8px;align-items:end;flex-wrap:wrap}.pms257-controls label{display:grid;gap:4px;font-size:12px;font-weight:900;color:#475569}.pms257-controls select{min-width:220px;background:#fff}.pms257-actions{display:flex;gap:6px;flex-wrap:wrap}.pms257-actions button{width:auto!important;margin:0!important}",
      ".pms257-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.pms257-kpi{background:#f8faf8;border:1px solid #d8e2dc;border-radius:8px;padding:9px}.pms257-kpi span{display:block;font-size:10px;text-transform:uppercase;font-weight:900;color:#64748b}.pms257-kpi strong{display:block;margin-top:3px;color:#0f5132;font-size:16px}",
      ".pms257-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pms257-box{border:1px solid #d8e2dc;border-radius:8px;padding:10px;background:#fff}.pms257-box h4{margin:0 0 6px;color:#0f172a}.pms257-box ul{margin:0;padding-left:18px;line-height:1.45}",
      ".pms257-table{width:100%;border-collapse:collapse}.pms257-table th,.pms257-table td{border:1px solid #d8e2dc;padding:7px;text-align:left;vertical-align:top}.pms257-table th{background:#0f5132;color:#fff}.pms257-warning{border-left:4px solid #b91c1c;background:#fff7f7;padding:8px;line-height:1.4}",
      ".pms257-reports{border:1px solid #d8e2dc;border-radius:8px;overflow:auto}.pms257-reports table{min-width:980px}",
      "@media(max-width:900px){.pms257-kpis{grid-template-columns:1fr 1fr}.pms257-grid{grid-template-columns:1fr}.pms257-controls,.pms257-controls select,.pms257-actions button{width:100%!important;min-width:0}}",
      "@media print{.pms257-print h2{color:#0a5128;text-align:center}.pms257-print .pms257-table th{background:#065f2f!important;color:#fff!important}.pms257-print-note{border:1px solid #cbd5e1;padding:10px;margin:10px 0;background:#f8fafc}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function forecastHtml(model){
    if (!model) return '<div class="pms257-warning">Seleziona un prodotto con dati prezzo e genera la relazione previsionale.</div>';
    var monthRows = model.monthRows.map(function(row){
      return '<tr><td>' + esc(row.label) + '</td><td><strong>' + esc(money(row.value, "EUR", "kg")) + '</strong></td><td>' + esc(money(row.low, "EUR", "kg")) + ' - ' + esc(money(row.high, "EUR", "kg")) + '</td></tr>';
    }).join("");
    var sourceRows = model.rows.slice(-8).map(function(row){
      return '<tr><td>' + esc(row.date) + '</td><td>' + esc(row.source) + '</td><td>' + esc(money(row.price, "EUR", "kg")) + '</td><td>' + esc(row.note || "") + '</td></tr>';
    }).join("");
    return '<div class="pms257-kpis">' +
      '<div class="pms257-kpi"><span>Prodotto</span><strong>' + esc(model.product) + '</strong></div>' +
      '<div class="pms257-kpi"><span>Orizzonte</span><strong>' + esc(model.months) + ' mesi</strong></div>' +
      '<div class="pms257-kpi"><span>Ultimo prezzo</span><strong>' + esc(money(model.latest, "EUR", "kg")) + '</strong></div>' +
      '<div class="pms257-kpi"><span>Previsione finale</span><strong>' + esc(money(model.monthRows[model.monthRows.length - 1].value, "EUR", "kg")) + '</strong></div>' +
      '<div class="pms257-kpi"><span>Attendibilita</span><strong>' + esc(model.confidence) + ' ' + esc(model.confidenceScore) + '%</strong></div></div>' +
      (model.outliers.length ? '<div class="pms257-warning"><strong>Prezzi da riverificare:</strong> ' + esc(model.outliers.slice(0, 5).map(function(row){ return row.date + " " + row.source + " " + money(row.price, "EUR", "kg"); }).join(" | ")) + '</div>' : '') +
      '<div class="pms257-grid"><div class="pms257-box"><h4>Motivazioni previsione</h4><ul>' + model.reasons.map(function(reason){ return '<li>' + esc(reason) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="pms257-box"><h4>Scenario</h4><p>Direzione stimata: <strong>' + esc(model.direction) + '</strong>. La forchetta tiene conto della volatilita interna e va sempre validata con listini/fonte ufficiale prima dell invio definitivo.</p><table class="pms257-table"><thead><tr><th>Mese</th><th>Stima</th><th>Range prudenziale</th></tr></thead><tbody>' + monthRows + '</tbody></table></div></div>' +
      '<div class="pms257-box"><h4>Fonti usate</h4><table class="pms257-table"><thead><tr><th>Data</th><th>Fonte</th><th>Prezzo</th><th>Note</th></tr></thead><tbody>' + sourceRows + '</tbody></table></div>';
  }
  function reportsHtml(){
    var rows = arr(getState().marketForecastReports);
    if (!rows.length) return '<div class="database-note">Nessuna relazione previsionale salvata. Genera una previsione per creare la prima relazione stampabile.</div>';
    return '<div class="pms257-reports"><table class="pms257-table"><thead><tr><th>Data</th><th>Prodotto</th><th>Orizzonte</th><th>Previsione</th><th>Attendibilita</th><th>Azioni</th></tr></thead><tbody>' + rows.map(function(row){
      return '<tr><td>' + esc(row.date || "-") + '<br><small>' + esc(row.id || "") + '</small></td><td><strong>' + esc(row.product || "-") + '</strong></td><td>' + esc(row.horizonMonths || "-") + ' mesi</td><td>' + esc(money(row.forecastPrice, "EUR", "kg")) + '<br><small>' + esc(money(row.lowRange, "EUR", "kg")) + ' - ' + esc(money(row.highRange, "EUR", "kg")) + '</small></td><td>' + esc(row.confidence || "-") + ' ' + esc(row.confidenceScore || "") + '%</td><td><div class="pms257-actions"><button class="inline-button" data-pms257-report-edit="' + esc(row.id) + '">Modifica</button><button class="inline-button" data-pms257-report-copy="' + esc(row.id) + '">Copia</button><button class="inline-button" data-pms257-report-print-internal="' + esc(row.id) + '">Stampa interna</button><button class="inline-button" data-pms257-report-print-client="' + esc(row.id) + '">Stampa cliente</button><button class="inline-button" data-pms257-report-print-supplier="' + esc(row.id) + '">Stampa fornitore</button><button class="inline-danger" data-pms257-report-delete="' + esc(row.id) + '">Elimina</button></div></td></tr>';
    }).join("") + '</tbody></table></div>';
  }
  function panelHtml(){
    var sel = currentSelection();
    var model = buildForecast(sel.product, sel.months);
    var options = sel.products.map(function(name){ return '<option value="' + esc(name) + '"' + (name === sel.product ? " selected" : "") + '>' + esc(name) + '</option>'; }).join("");
    var monthOptions = ["1", "3", "6", "12"].map(function(value){
      return '<option value="' + value + '"' + (value === String(sel.months) ? " selected" : "") + '>' + value + ' mese' + (value === "1" ? "" : "i") + '</option>';
    }).join("");
    return '<section id="pms257-market-report-panel" class="pms257-panel"><div class="pms257-head"><div><h3>Previsionale mercato per prodotto</h3><p>Il prodotto e l orizzonte non sono piu fissi: scegli la voce, genera la relazione e stampala per uso interno, cliente o fornitore.</p></div><div class="pms257-controls"><label>Prodotto<select id="pms257-product">' + options + '</select></label><label>Orizzonte<select id="pms257-months">' + monthOptions + '</select></label><div class="pms257-actions"><button class="primary-button" data-pms257-generate>Genera / aggiorna relazione</button><button class="secondary-button" data-pms257-print-current-internal>Stampa interna</button><button class="secondary-button" data-pms257-print-current-client>Stampa cliente</button><button class="secondary-button" data-pms257-print-current-supplier>Stampa fornitore</button></div></div></div><div id="pms257-current-forecast">' + forecastHtml(model) + '</div><div class="section-header mini"><h3>Relazioni previsionali salvate</h3></div>' + reportsHtml() + '</section>';
  }
  function decorateMarket(){
    var cur = getCurrent();
    if (FORECAST_PAGES.indexOf(cur.page) < 0) return;
    injectCss();
    hideLegacyGranaBlocks();
    var content = document.getElementById("content");
    if (!content) return;
    var old256 = document.getElementById("pms256-market-forecast");
    if (old256) old256.style.setProperty("display", "none", "important");
    var existing = document.getElementById("pms257-market-report-panel");
    if (existing) return;
    content.insertAdjacentHTML("afterbegin", panelHtml());
  }
  function reportById(id){
    return arr(getState().marketForecastReports).find(function(row){ return row && row.id === id; });
  }
  function reportHtml(report, mode){
    var audience = mode === "client" ? "CLIENTE" : mode === "supplier" ? "FORNITORE" : "INTERNA";
    var note = mode === "internal"
      ? "Relazione interna riservata: include motivazioni, attendibilita e note operative."
      : "Relazione previsionale indicativa basata sui dati disponibili nel gestionale Parmitalia. Le quotazioni definitive restano soggette a conferma commerciale.";
    var reasons = clean(report.reasons).split("\n").filter(Boolean).map(function(line){ return '<li>' + esc(line) + '</li>'; }).join("");
    var sources = clean(report.sources).split("\n").filter(Boolean).map(function(line){ return '<tr><td>' + esc(line) + '</td></tr>'; }).join("");
    return '<div class="print-document pms257-print">' + printHeader("RELAZIONE PREVISIONALE MERCATO", report.id, "Stampa " + audience) +
      '<div class="pms257-print-note"><strong>' + esc(note) + '</strong></div>' +
      '<table class="pms257-table"><tr><th>Prodotto</th><td>' + esc(report.product) + '</td><th>Data</th><td>' + esc(report.date) + '</td></tr>' +
      '<tr><th>Orizzonte</th><td>' + esc(report.horizonMonths) + ' mesi</td><th>Direzione stimata</th><td>' + esc(report.direction) + '</td></tr>' +
      '<tr><th>Ultimo prezzo</th><td>' + esc(money(report.latestPrice, "EUR", "kg")) + '</td><th>Previsione finale</th><td>' + esc(money(report.forecastPrice, "EUR", "kg")) + '</td></tr>' +
      '<tr><th>Range prudenziale</th><td>' + esc(money(report.lowRange, "EUR", "kg")) + ' - ' + esc(money(report.highRange, "EUR", "kg")) + '</td><th>Attendibilita</th><td>' + esc(report.confidence) + ' ' + esc(report.confidenceScore) + '%</td></tr></table>' +
      '<h2>Motivazioni</h2><ul>' + reasons + '</ul>' +
      (mode === "internal" && report.internalNotes ? '<h2>Note operative interne</h2><p>' + esc(report.internalNotes) + '</p>' : '') +
      '<h2>Fonti e dati utilizzati</h2><table class="pms257-table"><tbody>' + (sources || '<tr><td>Nessuna fonte indicata.</td></tr>') + '</tbody></table>' +
      '<div class="print-footer">PARMITALIA DISTRIBUTION SRL - Relazione generata dal gestionale il ' + esc(new Date().toLocaleString("it-IT")) + '</div></div>';
  }
  function printReport(id, mode){
    var report = reportById(id);
    if (!report) return alert("Relazione previsionale non trovata.");
    openPrintSafe(reportHtml(report, mode || "internal"));
  }
  function printCurrent(mode){
    var sel = currentSelection();
    var productNode = document.getElementById("pms257-product");
    var monthNode = document.getElementById("pms257-months");
    if (productNode) sel.product = productNode.value;
    if (monthNode) sel.months = monthNode.value;
    var model = buildForecast(sel.product, sel.months);
    var report = relationFromModel(model);
    if (!report) return alert("Non ci sono dati sufficienti per stampare la previsione.");
    openPrintSafe(reportHtml(report, mode || "internal"));
  }
  function editReport(id){
    var report = reportById(id);
    if (!report) return;
    var s = getState();
    s.settings = s.settings && typeof s.settings === "object" ? s.settings : {};
    s.settings.pms257EditingReportId = report.id;
    s.settings.pms257ForecastProduct = report.product;
    s.settings.pms257ForecastMonths = String(report.horizonMonths || "3");
    saveNow("market-forecast-edit");
    renderAgain();
  }
  function copyReport(id){
    var report = reportById(id);
    if (!report) return;
    ensureForecastStore().unshift(Object.assign({}, report, { id: uid("FRC"), date: today(), createdAt: new Date().toISOString(), copiedFrom: report.id }));
    saveNow("market-forecast-copy");
    renderAgain();
  }
  function deleteReport(id){
    if (!confirm("Eliminare questa relazione previsionale?")) return;
    getState().marketForecastReports = arr(getState().marketForecastReports).filter(function(row){ return row && row.id !== id; });
    saveNow("market-forecast-delete");
    renderAgain();
  }
  function bindClicks(){
    if (document.__pms257Bound) return;
    document.__pms257Bound = true;
    document.addEventListener("change", function(event){
      var target = event.target;
      if (!target || (target.id !== "pms257-product" && target.id !== "pms257-months")) return;
      var s = getState();
      s.settings = s.settings && typeof s.settings === "object" ? s.settings : {};
      s.settings.pms257ForecastProduct = document.getElementById("pms257-product") ? document.getElementById("pms257-product").value : "";
      s.settings.pms257ForecastMonths = document.getElementById("pms257-months") ? document.getElementById("pms257-months").value : "3";
      saveNow("market-forecast-selection");
      var panel = document.getElementById("pms257-market-report-panel");
      if (panel) panel.outerHTML = panelHtml();
    }, true);
    document.addEventListener("click", function(event){
      var target = event.target && event.target.closest && event.target.closest("[data-pms257-generate],[data-pms257-print-current-internal],[data-pms257-print-current-client],[data-pms257-print-current-supplier],[data-pms257-report-edit],[data-pms257-report-copy],[data-pms257-report-print-internal],[data-pms257-report-print-client],[data-pms257-report-print-supplier],[data-pms257-report-delete]");
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      if (target.hasAttribute("data-pms257-generate")) return createOrUpdateReport();
      if (target.hasAttribute("data-pms257-print-current-internal")) return printCurrent("internal");
      if (target.hasAttribute("data-pms257-print-current-client")) return printCurrent("client");
      if (target.hasAttribute("data-pms257-print-current-supplier")) return printCurrent("supplier");
      if (target.hasAttribute("data-pms257-report-edit")) return editReport(target.getAttribute("data-pms257-report-edit"));
      if (target.hasAttribute("data-pms257-report-copy")) return copyReport(target.getAttribute("data-pms257-report-copy"));
      if (target.hasAttribute("data-pms257-report-print-internal")) return printReport(target.getAttribute("data-pms257-report-print-internal"), "internal");
      if (target.hasAttribute("data-pms257-report-print-client")) return printReport(target.getAttribute("data-pms257-report-print-client"), "client");
      if (target.hasAttribute("data-pms257-report-print-supplier")) return printReport(target.getAttribute("data-pms257-report-print-supplier"), "supplier");
      if (target.hasAttribute("data-pms257-report-delete")) return deleteReport(target.getAttribute("data-pms257-report-delete"));
    }, true);
  }
  function sanitizePriceConfirmations(){
    var s = getState();
    s[PRICE_MODULE] = arr(s[PRICE_MODULE]).map(function(item){
      item = item && typeof item === "object" ? item : {};
      var out = Object.assign({}, item);
      out.id = clean(out.id || out.code || out.protocol) || uid("CPR");
      out.direction = /cliente|client/i.test(clean(out.direction || out.confirmationType || out.type)) ? "Cliente" : "Fornitore";
      out.counterparty = clean(out.counterparty || out.supplier || out.client || out.customer || out.company);
      out.product = clean(out.product || out.productName || out.article || out.description);
      out.price = num(out.price != null ? out.price : out.unitPrice);
      out.currency = clean(out.currency) || "EUR";
      out.unit = clean(out.unit) || "kg";
      out.status = clean(out.status) || "Bozza";
      out.date = clean(out.date || out.confirmationDate || out.requestDate) || today();
      return out;
    });
    return s[PRICE_MODULE];
  }
  function installPriceCrashGuard(){
    sanitizePriceConfirmations();
    var cur = getCurrent();
    cur.filters = cur.filters || {};
  }
  function wrapRender(){
    try {
      if (typeof render === "function" && !render.__pms257Wrapped) {
        var baseRender = render;
        render = function(){
          try { installPriceCrashGuard(); } catch (error) { console.warn(VERSION + " pre-render guard", error); }
          var result;
          try { result = baseRender.apply(this, arguments); }
          catch (error) {
            console.warn(VERSION + " render recovered", error);
            try {
              if (getCurrent().page === PRICE_MODULE) {
                getCurrent().page = "dashboard";
                result = baseRender.apply(this, arguments);
              }
            } catch (_) {}
          }
          setTimeout(function(){ decorateMarket(); }, 70);
          setTimeout(hideLegacyGranaBlocks, 150);
          return result;
        };
        render.__pms257Wrapped = true;
        try { window.render = render; } catch (_) {}
      }
    } catch (error) { console.warn(VERSION + " wrap render skipped", error); }
  }
  function boot(){
    try {
      injectCss();
      installPriceCrashGuard();
      bindClicks();
      wrapRender();
      decorateMarket();
      [120, 320, 900, 1800, 3500].forEach(function(ms){ setTimeout(function(){ decorateMarket(); hideLegacyGranaBlocks(); installPriceCrashGuard(); }, ms); });
      if (typeof MutationObserver === "function" && document.body) {
        new MutationObserver(function(){ setTimeout(function(){ decorateMarket(); hideLegacyGranaBlocks(); }, 60); }).observe(document.body, { childList: true, subtree: true });
      }
      window.PMS_V257_MARKET_FORECAST_REPORTS_PRICE_GUARD = {
        version: VERSION,
        collectRows: collectRows,
        buildForecast: buildForecast,
        refresh: function(){ decorateMarket(); hideLegacyGranaBlocks(); installPriceCrashGuard(); }
      };
      console.info(VERSION + " loaded");
    } catch (error) {
      console.warn(VERSION + " install skipped", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
