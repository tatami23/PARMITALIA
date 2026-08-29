(function () {
  "use strict";

  var VERSION = "20260828-v256-market-finance-print-actions";
  var NEW_PAGES = ["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"];
  var HIDE_TEXTS = ["Candidati estero da programmare", "CMR da programmare", "CRM commerciale da programmare"];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function arr(value) { return Array.isArray(value) ? value : []; }
  function num(value) {
    var n = Number(String(value == null ? "" : value).replace(",", ".").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  function appState() {
    try { if (typeof state !== "undefined") return state; } catch (e) {}
    window.state = window.state || {};
    return window.state;
  }
  function appCurrent() {
    try { if (typeof current !== "undefined") return current; } catch (e) {}
    window.current = window.current || { page: "dashboard", filters: {} };
    return window.current;
  }
  function appSchemas() {
    try { if (typeof schemas !== "undefined") return schemas; } catch (e) {}
    window.schemas = window.schemas || {};
    return window.schemas;
  }
  function appModules() {
    try { if (typeof modules !== "undefined") return modules; } catch (e) {}
    window.modules = window.modules || [];
    return window.modules;
  }
  function saveData() {
    try { if (typeof save === "function") return save(); } catch (e) {}
    try { localStorage.setItem("parmitalia-state", JSON.stringify(appState())); } catch (e) {}
  }
  function callRender() {
    try { if (typeof render === "function") return render(); } catch (e) {}
    if (typeof window.render === "function") return window.render();
  }
  function callOpenPrint(html) {
    try { if (typeof openPrint === "function") return openPrint(html); } catch (e) {}
    var root = document.getElementById("print-root") || document.createElement("div");
    root.id = "print-root";
    root.innerHTML = html;
    if (!root.parentNode) document.body.appendChild(root);
    window.print();
  }
  function money(value, currency) {
    var n = num(value);
    if (!n) return "-";
    return (currency || "EUR") + " " + n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function uid(prefix) { return prefix + "-" + Date.now().toString(36).toUpperCase(); }

  function injectCss() {
    if (document.getElementById("pms-v256-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v256-style";
    style.textContent = [
      ".pms256-forecast{border:1px solid #cfd8d2;background:#fff;border-radius:8px;padding:14px;margin:0 0 16px;display:grid;gap:12px}",
      ".pms256-forecast-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap}",
      ".pms256-forecast h3{margin:0;color:#0f5132}.pms256-forecast label{font-size:12px;font-weight:800;color:#475569;display:grid;gap:4px}",
      ".pms256-forecast select,.pms256-forecast input{min-width:190px}",
      ".pms256-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.pms256-kpi{border:1px solid #d8e2dc;border-radius:8px;padding:9px;background:#f8faf8}",
      ".pms256-kpi span{display:block;font-size:10px;text-transform:uppercase;color:#64748b;font-weight:900}.pms256-kpi strong{display:block;font-size:17px;color:#0f5132;margin-top:3px}",
      ".pms256-mini-table{width:100%;border-collapse:collapse}.pms256-mini-table th,.pms256-mini-table td{border:1px solid #d8e2dc;padding:7px;text-align:left;vertical-align:top}.pms256-mini-table th{background:#0f5132;color:#fff}",
      ".pms256-warning{border-left:4px solid #b91c1c;background:#fff7f7;padding:8px;line-height:1.4}",
      ".pms256-actions{display:flex;gap:6px;flex-wrap:wrap}.pms256-actions button{width:auto!important;margin:0!important}",
      ".pms256-office-stable #content{overflow:visible!important;max-height:none!important}.pms256-office-stable .content{overflow:visible!important}",
      "@media(max-width:850px){.pms256-kpis{grid-template-columns:1fr 1fr}.pms256-forecast-head{display:grid}.pms256-forecast select,.pms256-forecast input{min-width:0;width:100%}}",
      "@media print{.pms256-company-sheet{font-family:Arial,Helvetica,sans-serif;color:#111}.pms256-print-top{display:grid;grid-template-columns:.7fr 2fr .85fr;gap:18px;align-items:start;margin-bottom:22px}.pms256-contact{font-size:10.5px;line-height:1.5;min-height:90px}.pms256-contact b{display:block;font-size:12px;color:#0a5128}.pms256-logo-center{text-align:center}.pms256-map{font-size:36px;line-height:1;color:#111;font-weight:900}.pms256-logo-title{font-size:28px;font-weight:900;color:#0a5128;letter-spacing:1px}.pms256-quality{font-size:11px;letter-spacing:7px;font-weight:800;margin-top:8px}.pms256-flag{display:grid;grid-template-columns:1fr 1fr;height:4px;margin:12px 0}.pms256-flag i:first-child{background:#00843d}.pms256-flag i:last-child{background:#cf142b}.pms256-reserved{border:1px solid #111;font-size:11px;min-height:118px}.pms256-reserved h4{margin:0;background:#065f2f;color:#fff;text-align:center;padding:7px;font-size:11px;text-transform:uppercase}.pms256-reserved div{padding:12px}.pms256-title{text-align:center;color:#0a5128;font-size:22px;font-weight:900;margin:18px 0}.pms256-table{width:100%;border-collapse:collapse;table-layout:fixed}.pms256-table th{background:#065f2f;color:#fff;text-align:left;padding:6px;border:1px solid #333}.pms256-table td{border:1px solid #777;padding:7px;vertical-align:top;word-break:break-word}.pms256-stamp,.print-document:after{display:inline-block;border:3px solid #b91c1c;color:#b91c1c;font-weight:900;text-transform:uppercase;transform:rotate(-8deg);padding:8px 16px;margin:10px 0;font-size:16px}.print-document:after{content:'CONFIDENZIALE';position:fixed;right:18mm;bottom:18mm;opacity:.72}.print-header{border:0!important}}"
    ].join("\n");
    document.head.appendChild(style);
    document.body.classList.add("pms256-office-stable");
  }

  function companyHeader256(title, code, subtitle) {
    var s = appState().settings || {};
    var legal = s.legalName || s.companyName || "PARMITALIA DISTRIBUTION SRL";
    return '<div class="pms256-company-sheet"><div class="pms256-print-top">' +
      '<div class="pms256-contact"><b>' + esc(legal) + '</b></div>' +
      '<div class="pms256-logo-center"><div class="pms256-map">ITALIA</div><div class="pms256-logo-title">PARMITALIA DISTRIBUTION</div><div class="pms256-flag"><i></i><i></i></div><div class="pms256-quality">QUALITA CHE DERIVA DAL LATTE</div></div>' +
      '<div class="pms256-reserved"><h4>Riservato all azienda</h4><div>Protocollo interno n.<br><strong>' + esc(code || "") + '</strong><br><br>Data protocollazione<br>' + esc(new Date().toLocaleDateString("it-IT")) + '</div></div>' +
      '</div>' + (title ? '<div class="pms256-title">' + esc(title) + '</div>' : "") + (subtitle ? '<p style="text-align:center;margin-top:-10px;color:#475569">' + esc(subtitle) + '</p>' : "") + '</div>';
  }
  function installPrintHeader() {
    var fn = function (title, code, subtitle) { return companyHeader256(title, code, subtitle); };
    try { companyPrintHeader = fn; } catch (e) {}
    window.companyPrintHeader = fn;
  }

  function productName(row) { return String(row.product || row.productName || row.name || row.article || row.articleCode || row.id || "Mercato generale").trim(); }
  function normalizePrice(row) {
    var value = num(row.price || row.y2026 || row.unitPrice || row.basePrice || row.value);
    var unit = String(row.unit || row.priceUnit || "kg").toLowerCase();
    if (!value) return 0;
    if (unit.indexOf("/t") >= 0 || unit === "t" || unit.indexOf("ton") >= 0) return value / 1000;
    if (unit.indexOf("100") >= 0 || unit.indexOf("quint") >= 0) return value / 100;
    return value;
  }
  function collectMarketRows() {
    var s = appState(), rows = [];
    arr(s.marketTrends).forEach(function (r) { rows.push({ source: r.source || "Mercato", product: productName(r), date: String(r.date || today()).slice(0, 10), price: normalizePrice(r), note: r.note || "", url: r.sourceUrl || r.url || "" }); });
    arr(s.marketPreview52).forEach(function (r) {
      ["y2024", "y2025", "y2026"].forEach(function (key) {
        if (r[key]) rows.push({ source: r.source || "Storico gestionale", product: productName(r), date: key.slice(1) + "-06-30", price: normalizePrice({ price: r[key], unit: r.unit }), note: r.note || "", url: r.sourceUrl || r.url || "" });
      });
    });
    arr(s.supplierPriceConfirmations).forEach(function (r) { rows.push({ source: "Conferma fornitore", product: productName(r), date: String(r.confirmationDate || r.validFrom || today()).slice(0, 10), price: normalizePrice(r), note: r.notes || "" }); });
    arr(s.products).forEach(function (r) { rows.push({ source: "Anagrafica prodotti", product: productName(r), date: today(), price: normalizePrice(r), note: r.trendNotes || "", url: r.cloudLink || "" }); });
    return rows.filter(function (r) { return r.product && r.price > 0; }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
  }
  function forecastProduct(product, months) {
    var rows = collectMarketRows().filter(function (r) { return !product || r.product === product; });
    if (!rows.length) return null;
    var prices = rows.map(function (r) { return r.price; });
    var latest = prices[prices.length - 1], first = prices[0];
    var avg = prices.reduce(function (a, b) { return a + b; }, 0) / prices.length;
    var trend = prices.length > 1 ? (latest - first) / Math.max(1, prices.length - 1) : 0;
    var changes = [];
    for (var i = 1; i < prices.length; i += 1) if (prices[i - 1]) changes.push(Math.abs(prices[i] - prices[i - 1]) / prices[i - 1]);
    var volatility = changes.length ? changes.reduce(function (a, b) { return a + b; }, 0) / changes.length : 0.08;
    var predicted = Math.max(0.01, latest + trend * num(months));
    var band = Math.min(0.22, volatility * 1.3);
    var outliers = rows.filter(function (r) { return avg && Math.abs(r.price - avg) / avg > 0.35; });
    return { rows: rows, latest: latest, predicted: predicted, low: predicted * (1 - band), high: predicted * (1 + band), avg: avg, volatility: volatility, outliers: outliers };
  }
  function renderMarketForecastPanel() {
    var products = Array.from(new Set(collectMarketRows().map(function (r) { return r.product; }))).sort();
    var settings = appState().settings = appState().settings || {};
    var selected = settings.pms256ForecastProduct || products[0] || "";
    var months = settings.pms256ForecastMonths || "3";
    var model = forecastProduct(selected, months);
    var options = products.map(function (p) { return '<option value="' + esc(p) + '" ' + (p === selected ? "selected" : "") + ">" + esc(p) + "</option>"; }).join("");
    var body = model ? '<div class="pms256-kpis">' +
      '<div class="pms256-kpi"><span>Ultimo prezzo</span><strong>' + esc(money(model.latest, "EUR")) + '/kg</strong></div>' +
      '<div class="pms256-kpi"><span>Previsione</span><strong>' + esc(money(model.predicted, "EUR")) + '/kg</strong></div>' +
      '<div class="pms256-kpi"><span>Forchetta</span><strong>' + esc(money(model.low, "EUR")) + ' - ' + esc(money(model.high, "EUR")) + '</strong></div>' +
      '<div class="pms256-kpi"><span>Dati usati</span><strong>' + model.rows.length + '</strong></div></div>' +
      (model.outliers.length ? '<div class="pms256-warning"><strong>Prezzi da riverificare:</strong> ' + esc(model.outliers.slice(0, 5).map(function (r) { return r.product + " " + money(r.price, "EUR") + "/kg"; }).join(" | ")) + '</div>' : '<div class="database-note">Nessuna anomalia forte rilevata rispetto alla media interna disponibile.</div>') +
      '<table class="pms256-mini-table"><thead><tr><th>Data</th><th>Fonte</th><th>Prezzo normalizzato</th><th>Note</th></tr></thead><tbody>' + model.rows.slice(-8).map(function (r) { return '<tr><td>' + esc(r.date) + '</td><td>' + esc(r.source) + '</td><td>' + esc(money(r.price, "EUR")) + '/kg</td><td>' + esc(r.note || "") + '</td></tr>'; }).join("") + '</tbody></table>' : '<div class="pms256-warning">Nessun dato disponibile per generare la previsione.</div>';
    return '<section id="pms256-market-forecast" class="pms256-forecast"><div class="pms256-forecast-head"><div><h3>Previsione prodotto selezionabile</h3><p class="muted-small">Scegli qualsiasi prodotto presente in storico, conferme fornitori o anagrafica. Il sistema segnala i prezzi fuori scala da riverificare.</p></div><label>Prodotto<select id="pms256-forecast-product">' + options + '</select></label><label>Orizzonte<select id="pms256-forecast-months"><option value="1">1 mese</option><option value="3">3 mesi</option><option value="6">6 mesi</option><option value="12">12 mesi</option></select></label><div class="pms256-actions"><button class="primary-button" data-pms256-generate-forecast>Genera previsione</button><button class="secondary-button" data-pms256-open-market-sources>Fonti pubbliche</button></div></div><div id="pms256-forecast-result">' + body + '</div></section>';
  }
  function decorateMarket() {
    if (["marketTrends", "forecastingHub", "aiMarketForecast"].indexOf(appCurrent().page) < 0) return;
    var content = document.getElementById("content");
    if (!content || document.getElementById("pms256-market-forecast")) return;
    content.insertAdjacentHTML("afterbegin", renderMarketForecastPanel());
    var months = document.getElementById("pms256-forecast-months");
    if (months) months.value = appState().settings.pms256ForecastMonths || "3";
  }
  function bindMarket() {
    var product = document.getElementById("pms256-forecast-product");
    var months = document.getElementById("pms256-forecast-months");
    var gen = document.querySelector("[data-pms256-generate-forecast]");
    if (gen && !gen.__pms256) {
      gen.__pms256 = true;
      gen.onclick = function () {
        appState().settings.pms256ForecastProduct = product ? product.value : "";
        appState().settings.pms256ForecastMonths = months ? months.value : "3";
        saveData();
        var panel = document.getElementById("pms256-market-forecast");
        if (panel) panel.outerHTML = renderMarketForecastPanel();
        bindMarket();
      };
    }
    var sources = document.querySelector("[data-pms256-open-market-sources]");
    if (sources && !sources.__pms256) {
      sources.__pms256 = true;
      sources.onclick = function () {
        ["https://www.clal.it/", "https://agriculture.ec.europa.eu/data-and-analysis/markets/overviews/market-observatories/milk_en", "https://www.ismeamercati.it/"].forEach(function (url) { window.open(url, "_blank", "noopener"); });
      };
    }
  }

  function cleanupOperationalNoise() {
    document.querySelectorAll("section,article,.card,.pms136-backlog,.pms230-panel,.pms200-card,div").forEach(function (node) {
      var text = (node.innerText || "").replace(/\s+/g, " ");
      if (!text || text.length > 420) return;
      if (HIDE_TEXTS.some(function (needle) { return text.indexOf(needle) >= 0; })) node.style.setProperty("display", "none", "important");
    });
  }

  var AR = {
    "Intermediazioni": "الوساطة التجارية", "Cliente": "العميل", "Fornitore": "المورد", "Prodotto": "المنتج", "Valore": "القيمة", "Stato": "الحالة",
    "Azioni": "الإجراءات", "Modifica": "تعديل", "Stampa": "طباعة", "Elimina": "حذف", "Nuovo": "جديد", "Cerca": "بحث", "Commissione": "العمولة",
    "Provvigione": "العمولة", "Pagamento": "الدفع", "Consegna": "التسليم", "Note": "ملاحظات", "Descrizione": "الوصف", "Data": "التاريخ",
    "Offerta": "العرض", "Ordine": "الطلب", "Aperto": "مفتوح", "Chiuso": "مغلق", "In corso": "قيد التنفيذ", "Completato": "مكتمل",
    "Commerciale": "تجاري", "Operazione": "عملية", "Pratica": "ملف", "Valuta": "العملة", "Quantita": "الكمية",
    "Prezzo": "السعر", "Totale": "الإجمالي", "Scadenza": "الموعد النهائي", "Responsabile": "المسؤول",
    "Fase": "المرحلة", "Prossima azione": "الإجراء التالي", "Archivio": "الأرشيف", "Storico": "السجل",
    "Cliente finale": "العميل النهائي", "Fornitore principale": "المورد الرئيسي", "Margine": "الهامش"
  };
  function isArabic() {
    var s = appState().settings || {};
    return /ar|arab/i.test(String(s.defaultLanguage || s.printLanguage || s.language || "")) || Array.from(document.querySelectorAll("select")).some(function (x) { return /arab/i.test(x.value || ""); });
  }
  function translateIntermediations() {
    if (appCurrent().page !== "intermediations" || !isArabic()) return;
    var root = document.getElementById("content");
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue;
      Object.keys(AR).forEach(function (key) {
        text = text.replace(new RegExp("\\b" + key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), AR[key]);
      });
      node.nodeValue = text;
    }
    root.setAttribute("dir", "rtl");
    root.style.textAlign = "right";
  }

  function rowBy(module, id) { return arr(appState()[module]).find(function (x) { return String(x.id) === String(id) || String(x.code) === String(id) || String(x.practiceCode) === String(id); }); }
  function tractorPrint(id, mode) {
    var r = rowBy("tractorIntermediations", id);
    if (!r) return alert("Scheda trattore non trovata.");
    var code = r.practiceCode || r.id || uid("TRK");
    var stamp = mode === "internal" ? '<div class="pms256-stamp">Confidenziale</div>' : "";
    var title = mode === "client" ? "Scheda trattore per cliente" : mode === "supplier" ? "Scheda trattore per fornitore" : "Scheda interna trattore";
    var body = companyHeader256(title, code, "Intermediazione trattori autostradali") + stamp +
      '<table class="pms256-table"><tr><th>Marca</th><td>' + esc(r.brand) + '</td><th>Modello</th><td>' + esc(r.model) + '</td></tr>' +
      '<tr><th>Anno</th><td>' + esc(r.year) + '</td><th>VIN</th><td>' + esc(r.vin) + '</td></tr>' +
      '<tr><th>Km</th><td>' + esc(r.km) + '</td><th>Classe emissioni</th><td>' + esc(r.emissionClass) + '</td></tr>' +
      '<tr><th>Prezzo</th><td>' + esc(money(r.salePrice, r.currency)) + '</td><th>Commissione</th><td>' + esc(r.commissionPct || "") + '% / ' + esc(money(r.commissionAmount, r.currency)) + '</td></tr>' +
      '<tr><th>Cliente</th><td>' + esc(r.client) + '</td><th>Venditore</th><td>' + esc(r.seller) + '</td></tr>' +
      '<tr><th>Paese extra UE destinazione</th><td>' + esc(r.destinationCountry) + '</td><th>Destinazione finale</th><td>' + esc(r.finalDestination) + '</td></tr>' +
      '<tr><th>Leggi / requisiti</th><td colspan="3">' + esc(r.exportLaws) + '</td></tr><tr><th>Documenti</th><td colspan="3">' + esc(r.documents || r.customsDocs) + '</td></tr></table>';
    callOpenPrint('<div class="print-document pms256-company-sheet">' + body + '</div>');
  }
  function tractorView(id) {
    var r = rowBy("tractorIntermediations", id);
    if (!r) return;
    var html = '<div class="pms256-actions"><button class="primary-button" data-edit="tractorIntermediations" data-id="' + esc(r.id) + '">Modifica</button><button class="secondary-button" data-pms256-tractor-copy="' + esc(r.id) + '">Copia</button><button class="secondary-button" data-pms256-tractor-print-internal="' + esc(r.id) + '">Stampa interna</button><button class="secondary-button" data-pms256-tractor-print-client="' + esc(r.id) + '">Stampa cliente</button><button class="secondary-button" data-pms256-tractor-print-supplier="' + esc(r.id) + '">Stampa fornitore</button></div><table class="pms256-mini-table"><tbody>' +
      Object.keys(r).map(function (k) { return '<tr><th>' + esc(k) + '</th><td>' + esc(r[k]) + '</td></tr>'; }).join("") + '</tbody></table>';
    var modal = document.getElementById("modal"), title = document.getElementById("modal-title"), form = document.getElementById("modal-form");
    if (modal && title && form) { title.textContent = "Scheda trattore"; form.innerHTML = html + '<div class="form-actions"><button type="button" class="secondary-button" id="modal-cancel">Chiudi</button></div>'; document.getElementById("modal-cancel").onclick = function () { modal.classList.add("hidden"); }; modal.classList.remove("hidden"); }
  }
  function tractorCopy(id) {
    var s = appState(), r = rowBy("tractorIntermediations", id);
    if (!r) return;
    s.tractorIntermediations = arr(s.tractorIntermediations);
    s.tractorIntermediations.unshift(Object.assign({}, r, { id: uid("TRK"), practiceCode: (r.practiceCode || r.id || "TRK") + "-COPY", condition: "Da verificare" }));
    saveData();
    callRender();
  }
  function financialPublicSearch(id) {
    var r = rowBy("financialChecks", id);
    if (!r) return alert("Verifica finanziaria non trovata.");
    var q = encodeURIComponent([r.subjectName, r.vat, r.country, "bilancio financial statements"].filter(Boolean).join(" "));
    r.publicSourceLinks = ["https://ec.europa.eu/taxation_customs/vies?locale=en", "https://e-justice.europa.eu/topics/registers-business-insolvency-land/business-registers-search-company-eu_en", "https://unioncamere.gov.it/registro-imprese-e-semplificazione/registro-delle-imprese-e-anagrafi-camerali", "https://www.google.com/search?q=" + q].join("\n");
    r.lastPublicSearch = new Date().toISOString();
    saveData();
    window.open("https://www.google.com/search?q=" + q, "_blank", "noopener");
    alert("Ricerca pubblica avviata. I link sono stati salvati nella scheda verifica finanziaria.");
  }

  function wrapCellValue() {
    var base = null;
    try { if (typeof cellValue === "function") base = cellValue; } catch (e) { base = window.cellValue; }
    if (!base || base.__pms256) return;
    var next = function (module, item, column) {
      if (column === "actions" && module === "tractorIntermediations") {
        return '<div class="pms256-actions"><button class="inline-button" data-pms256-tractor-open="' + esc(item.id) + '">Apri scheda</button><button class="inline-button" data-edit="tractorIntermediations" data-id="' + esc(item.id) + '">Modifica</button><button class="inline-button" data-pms256-tractor-copy="' + esc(item.id) + '">Copia</button><button class="inline-button" data-pms256-tractor-print-client="' + esc(item.id) + '">Stampa cliente</button><button class="inline-button" data-pms256-tractor-print-supplier="' + esc(item.id) + '">Stampa fornitore</button><button class="inline-button" data-pms256-tractor-print-internal="' + esc(item.id) + '">Stampa interna</button><button class="inline-danger" data-delete="tractorIntermediations" data-id="' + esc(item.id) + '">Elimina</button></div>';
      }
      if (column === "actions" && module === "financialChecks") {
        return '<div class="pms256-actions"><button class="inline-button" data-edit="financialChecks" data-id="' + esc(item.id) + '">Modifica</button><button class="inline-button" data-pms256-fin-search="' + esc(item.id) + '">Ricerca pubblica bilanci</button><button class="inline-button" data-pms255-print="financialChecks|' + esc(item.id) + '">Stampa</button><button class="inline-danger" data-delete="financialChecks" data-id="' + esc(item.id) + '">Elimina</button></div>';
      }
      return base(module, item, column);
    };
    next.__pms256 = true;
    try { cellValue = next; } catch (e) {}
    window.cellValue = next;
  }

  function decorateShowcase() {
    if (appCurrent().page !== "productShowcase") return;
    document.querySelectorAll("[data-pms230-delete-showcase]").forEach(function (del) {
      var cell = del.closest("td") || del.parentElement, idx = del.getAttribute("data-pms230-delete-showcase");
      if (!cell || cell.dataset.pms256Showcase === idx) return;
      cell.dataset.pms256Showcase = idx;
      del.insertAdjacentHTML("beforebegin", '<button class="secondary-button" data-pms256-showcase-edit="' + esc(idx) + '">Modifica</button> <button class="secondary-button" data-pms256-showcase-copy="' + esc(idx) + '">Copia</button> <button class="secondary-button" data-pms256-showcase-print="' + esc(idx) + '">Stampa</button> ');
    });
  }
  function showcaseEdit(index) {
    var item = arr(appState().productShowcaseItems)[num(index)];
    if (!item) return;
    [["showProduct", item.product], ["showCategory", item.category], ["showStock", item.stock], ["showPrice", item.price], ["showCurrency", item.currency], ["showVisible", item.visible], ["showCloud", item.cloudLink], ["showNotes", item.notes]].forEach(function (pair) {
      var node = document.querySelector('[data-pms230-field="' + pair[0] + '"]');
      if (node) node.value = pair[1] || "";
    });
    var add = document.querySelector("[data-pms230-add-showcase]");
    if (add) { add.dataset.pms256Editing = String(index); add.textContent = "Salva modifiche"; }
  }
  function showcaseSaveEdit(button) {
    var index = num(button.dataset.pms256Editing), list = arr(appState().productShowcaseItems);
    if (!list[index]) return false;
    function value(name) { var node = document.querySelector('[data-pms230-field="' + name + '"]'); return node ? node.value : ""; }
    list[index] = { product: value("showProduct") || "Prodotto", category: value("showCategory"), stock: value("showStock"), price: num(value("showPrice")), currency: value("showCurrency") || "EUR", visible: value("showVisible"), cloudLink: value("showCloud"), notes: value("showNotes"), updatedAt: new Date().toISOString() };
    delete button.dataset.pms256Editing;
    saveData();
    callRender();
    return true;
  }
  function showcasePrint(index) {
    var item = arr(appState().productShowcaseItems)[num(index)];
    if (!item) return;
    var body = companyHeader256("Scheda vetrina prodotto", item.product || "Prodotto", "Vetrina prodotti") +
      '<table class="pms256-table"><tr><th>Prodotto</th><td>' + esc(item.product) + '</td><th>Categoria</th><td>' + esc(item.category) + '</td></tr><tr><th>Disponibilita</th><td>' + esc(item.stock) + '</td><th>Prezzo</th><td>' + esc(money(item.price, item.currency)) + '</td></tr><tr><th>Stato</th><td>' + esc(item.visible) + '</td><th>Link</th><td>' + esc(item.cloudLink) + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(item.notes) + '</td></tr></table>';
    callOpenPrint('<div class="print-document pms256-company-sheet">' + body + '</div>');
  }

  function extendSchemas() {
    var sx = appSchemas();
    if (sx.financialChecks && Array.isArray(sx.financialChecks.fields)) {
      [["publicSourceLinks", "Link fonti pubbliche / bilanci", "textarea"], ["lastPublicSearch", "Ultima ricerca pubblica", "text"]].forEach(function (f) {
        if (!sx.financialChecks.fields.some(function (x) { return x.key === f[0]; })) sx.financialChecks.fields.push({ key: f[0], label: f[1], type: f[2], full: true });
      });
    }
  }
  function bindClicks() {
    if (document.__pms256ClickBound) return;
    document.__pms256ClickBound = true;
    document.addEventListener("click", function (event) {
      var t = event.target && event.target.closest && event.target.closest("[data-pms256-tractor-open],[data-pms256-tractor-copy],[data-pms256-tractor-print-client],[data-pms256-tractor-print-supplier],[data-pms256-tractor-print-internal],[data-pms256-fin-search],[data-pms256-showcase-edit],[data-pms256-showcase-copy],[data-pms256-showcase-print],[data-pms230-add-showcase]");
      if (!t) return;
      if (t.hasAttribute("data-pms230-add-showcase") && t.dataset.pms256Editing != null) { event.preventDefault(); event.stopImmediatePropagation(); showcaseSaveEdit(t); return; }
      event.preventDefault(); event.stopImmediatePropagation();
      if (t.hasAttribute("data-pms256-tractor-open")) return tractorView(t.getAttribute("data-pms256-tractor-open"));
      if (t.hasAttribute("data-pms256-tractor-copy")) return tractorCopy(t.getAttribute("data-pms256-tractor-copy"));
      if (t.hasAttribute("data-pms256-tractor-print-client")) return tractorPrint(t.getAttribute("data-pms256-tractor-print-client"), "client");
      if (t.hasAttribute("data-pms256-tractor-print-supplier")) return tractorPrint(t.getAttribute("data-pms256-tractor-print-supplier"), "supplier");
      if (t.hasAttribute("data-pms256-tractor-print-internal")) return tractorPrint(t.getAttribute("data-pms256-tractor-print-internal"), "internal");
      if (t.hasAttribute("data-pms256-fin-search")) return financialPublicSearch(t.getAttribute("data-pms256-fin-search"));
      if (t.hasAttribute("data-pms256-showcase-edit")) return showcaseEdit(t.getAttribute("data-pms256-showcase-edit"));
      if (t.hasAttribute("data-pms256-showcase-copy")) { var item = arr(appState().productShowcaseItems)[num(t.getAttribute("data-pms256-showcase-copy"))]; if (item) { appState().productShowcaseItems.unshift(Object.assign({}, item, { product: (item.product || "Prodotto") + " - copia", createdAt: new Date().toISOString() })); saveData(); callRender(); } return; }
      if (t.hasAttribute("data-pms256-showcase-print")) return showcasePrint(t.getAttribute("data-pms256-showcase-print"));
    }, true);
  }

  function decorate() {
    injectCss();
    installPrintHeader();
    extendSchemas();
    wrapCellValue();
    decorateMarket();
    bindMarket();
    cleanupOperationalNoise();
    translateIntermediations();
    decorateShowcase();
  }
  function wrapRenderBind() {
    try {
      if (typeof render === "function" && !render.__pms256) {
        var baseRender = render;
        render = function () { var out = baseRender.apply(this, arguments); setTimeout(decorate, 80); return out; };
        render.__pms256 = true;
      }
    } catch (e) {}
    try {
      if (typeof bindPageActions === "function" && !bindPageActions.__pms256) {
        var baseBind = bindPageActions;
        bindPageActions = function () { var out = baseBind.apply(this, arguments); setTimeout(decorate, 40); return out; };
        bindPageActions.__pms256 = true;
      }
    } catch (e) {}
  }
  function ensure() {
    var list = appModules();
    ["greenCoffee", "foreignRecruiting"].forEach(function (id) {
      for (var i = list.length - 1; i >= 0; i -= 1) if (list[i] && list[i].id === id) list.splice(i, 1);
    });
    NEW_PAGES.forEach(function (id) {
      if (!list.some(function (m) { return m.id === id; })) {
        list.push({ id: id, label: id === "businessTrips" ? "Business Trip" : id === "tractorIntermediations" ? "Trattori Autostradali" : id === "financialChecks" ? "Verifica Finanziaria" : "Recruiting Autisti", roles: ["admin", "assistant", "agent", "accountant", "recruiter"] });
      }
    });
  }

  bindClicks();
  wrapRenderBind();
  ensure();
  decorate();
  [200, 800, 1800, 3500, 7000].forEach(function (ms) { setTimeout(decorate, ms); });
  if (typeof MutationObserver === "function" && document.body) new MutationObserver(function () { setTimeout(decorate, 40); }).observe(document.body, { childList: true, subtree: true });
  window.PMS_V256_MARKET_FINANCE_PRINT_ACTIONS = { version: VERSION, decorate: decorate, forecastProduct: forecastProduct };
  console.log("PMS", VERSION, "loaded");
})();
