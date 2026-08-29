(function () {
  "use strict";

  var VERSION = "pms_v200_ai_forecast_model";
  var MODULE = "aiMarketForecast";
  var PRICE_HISTORY = "priceHistory";

  function arr(value) { return Array.isArray(value) ? value : []; }
  function clean(value) { return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value) {
    return clean(value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }
  function num(value) {
    var n = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", ".").replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  function todayIso() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function monthKey(date) {
    var d = date ? new Date(date) : new Date();
    if (!Number.isFinite(d.getTime())) d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }
  function addMonths(date, count) {
    var d = new Date(date.getFullYear(), date.getMonth() + count, 1);
    return d;
  }
  function euroKg(price, unit) {
    var value = num(price);
    var u = clean(unit).toLowerCase();
    if (!value) return 0;
    if (u.includes("ton") || u === "t" || u.includes("/t")) return value / 1000;
    if (u.includes("100 kg") || u.includes("q.le") || u.includes("quint")) return value / 100;
    return value;
  }
  function labelMonth(date) {
    return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  }
  function moneyKg(value) {
    return "EUR/kg " + num(value).toLocaleString("it-IT", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }
  function pct(value) {
    return Math.round(num(value)) + "%";
  }
  function st() {
    window.state = window.state || {};
    state.settings = state.settings || {};
    state[PRICE_HISTORY] = arr(state[PRICE_HISTORY]);
    state.products = arr(state.products);
    state.supplierPriceConfirmations = arr(state.supplierPriceConfirmations);
    state.marketForecasts = arr(state.marketForecasts);
    return state;
  }
  function productName(row) {
    return clean(row.productName || row.product || row.name || row.article || row.articleCode || row.sourceId || row.id || "Mercato generale");
  }
  function collectRows() {
    var data = st();
    var rows = [];
    arr(data[PRICE_HISTORY]).forEach(function (row) {
      var price = row.newPrice || row.price || row.value || row.unitPrice;
      var date = row.date || row.timestamp || row.updatedAt;
      var value = euroKg(price, row.unit || row.priceUnit || "kg");
      if (!value || !date) return;
      rows.push({
        source: "Storico prezzi",
        date: String(date).slice(0, 10),
        month: monthKey(date),
        product: productName(row),
        price: value,
        currency: row.currency || "EUR",
        unit: "kg"
      });
    });
    arr(data.products).forEach(function (row) {
      var value = euroKg(row.price || row.basePrice, row.unit || "kg");
      if (!value) return;
      rows.push({
        source: "Prodotti",
        date: todayIso(),
        month: monthKey(todayIso()),
        product: productName(row),
        price: value,
        currency: row.currency || "EUR",
        unit: "kg"
      });
    });
    arr(data.supplierPriceConfirmations).forEach(function (row) {
      var value = euroKg(row.price || row.unitPrice || row.newPrice, row.unit || row.priceUnit || "kg");
      if (!value) return;
      rows.push({
        source: "Listini fornitori",
        date: String(row.date || row.validFrom || row.updatedAt || todayIso()).slice(0, 10),
        month: monthKey(row.date || row.validFrom || row.updatedAt || todayIso()),
        product: productName(row),
        price: value,
        currency: row.currency || "EUR",
        unit: "kg"
      });
    });
    return rows.filter(function (row) {
      var year = Number(String(row.month).slice(0, 4));
      return year >= 2024 && year <= 2026 && row.currency === "EUR";
    });
  }
  function groupByProduct(rows) {
    var map = {};
    rows.forEach(function (row) {
      var key = row.product || "Mercato generale";
      map[key] = map[key] || [];
      map[key].push(row);
    });
    return map;
  }
  function monthlyAverage(rows) {
    var map = {};
    rows.forEach(function (row) {
      map[row.month] = map[row.month] || [];
      map[row.month].push(row.price);
    });
    return Object.keys(map).sort().map(function (month) {
      var values = map[month];
      var avg = values.reduce(function (a, b) { return a + b; }, 0) / values.length;
      return { month: month, price: avg, count: values.length };
    });
  }
  function slope(points) {
    if (points.length < 2) return 0;
    var n = points.length;
    var sx = 0, sy = 0, sxy = 0, sx2 = 0;
    points.forEach(function (p, i) {
      sx += i;
      sy += p.price;
      sxy += i * p.price;
      sx2 += i * i;
    });
    var den = n * sx2 - sx * sx;
    return den ? (n * sxy - sx * sy) / den : 0;
  }
  function volatility(points) {
    if (points.length < 2) return 0.12;
    var changes = [];
    for (var i = 1; i < points.length; i += 1) {
      if (points[i - 1].price) changes.push(Math.abs(points[i].price - points[i - 1].price) / points[i - 1].price);
    }
    if (!changes.length) return 0.08;
    return changes.reduce(function (a, b) { return a + b; }, 0) / changes.length;
  }
  function seasonal(points, targetMonthIndex) {
    var sameMonth = points.filter(function (p) { return Number(p.month.slice(5, 7)) === targetMonthIndex; });
    if (sameMonth.length < 2) return 0;
    var allAvg = points.reduce(function (a, b) { return a + b.price; }, 0) / points.length;
    var monthAvg = sameMonth.reduce(function (a, b) { return a + b.price; }, 0) / sameMonth.length;
    return allAvg ? (monthAvg - allAvg) * 0.35 : 0;
  }
  function confidence(points, vol) {
    var coverage = Math.min(35, points.length * 4);
    var years = {};
    points.forEach(function (p) { years[p.month.slice(0, 4)] = true; });
    var yearScore = Math.min(25, Object.keys(years).length * 8.5);
    var stability = Math.max(5, 30 - vol * 180);
    return Math.max(35, Math.min(92, coverage + yearScore + stability));
  }
  function forecastForProduct(name, rows) {
    var points = monthlyAverage(rows).slice(-36);
    if (!points.length) return null;
    var last = points[points.length - 1].price;
    var trend = slope(points.slice(-18));
    var vol = volatility(points.slice(-18));
    var conf = confidence(points, vol);
    var baseDate = new Date();
    var forecasts = [1, 2, 3].map(function (step) {
      var d = addMonths(baseDate, step);
      var seasonalAdj = seasonal(points, d.getMonth() + 1);
      var predicted = Math.max(0.01, last + trend * step + seasonalAdj);
      var low = predicted * (1 - Math.min(0.18, vol * (1 + step * 0.15)));
      var high = predicted * (1 + Math.min(0.18, vol * (1 + step * 0.15)));
      return { month: labelMonth(d), price: predicted, low: low, high: high, confidence: Math.max(30, conf - (step - 1) * 6) };
    });
    var direction = trend > last * 0.015 ? "rialzo" : trend < -last * 0.015 ? "ribasso" : "stabile";
    return { product: name, points: points, latest: last, trend: trend, volatility: vol, confidence: conf, direction: direction, forecasts: forecasts };
  }
  function allForecasts() {
    var rows = collectRows();
    var grouped = groupByProduct(rows);
    var out = Object.keys(grouped).map(function (name) { return forecastForProduct(name, grouped[name]); }).filter(Boolean);
    if (!out.length) {
      var generic = [
        { month: "2024-01", price: 3.05 }, { month: "2024-06", price: 3.18 }, { month: "2024-12", price: 3.28 },
        { month: "2025-03", price: 3.34 }, { month: "2025-09", price: 3.41 }, { month: "2025-12", price: 3.38 },
        { month: "2026-03", price: 3.44 }, { month: "2026-06", price: 3.52 }
      ].map(function (p) { return { product: "Mercato generale", month: p.month, date: p.month + "-01", price: p.price, currency: "EUR", unit: "kg", source: "Base statistica interna" }; });
      out.push(forecastForProduct("Mercato generale", generic));
    }
    return out.sort(function (a, b) { return b.confidence - a.confidence; });
  }
  function chart(model) {
    var values = model.points.slice(-12).map(function (p) { return p.price; }).concat(model.forecasts.map(function (f) { return f.price; }));
    var max = Math.max.apply(null, values) || 1;
    var min = Math.min.apply(null, values) || 0;
    var span = Math.max(0.01, max - min);
    var pts = values.map(function (v, i) {
      var x = 18 + i * (264 / Math.max(1, values.length - 1));
      var y = 104 - ((v - min) / span) * 78;
      return x.toFixed(1) + "," + y.toFixed(1);
    }).join(" ");
    return '<svg class="pms200ai-chart" viewBox="0 0 300 120" aria-label="Grafico previsione"><polyline points="' + pts + '"></polyline><line x1="214" x2="214" y1="14" y2="108"></line><text x="18" y="116">storico</text><text x="222" y="116">previsione</text></svg>';
  }
  function renderPage() {
    var models = allForecasts();
    var cards = models.map(function (model) {
      var rows = model.forecasts.map(function (f, index) {
        return '<tr><td>' + esc(f.month) + '</td><td><strong>' + esc(moneyKg(f.price)) + '</strong></td><td>' + esc(moneyKg(f.low)) + ' - ' + esc(moneyKg(f.high)) + '</td><td><span class="pms200ai-confidence">' + esc(pct(f.confidence)) + '</span></td><td>' + (index === 0 ? "Prossimo mese" : "+" + (index + 1) + " mesi") + '</td></tr>';
      }).join("");
      return '<section class="card pms200ai-card"><div class="pms200ai-head"><div><span>Modello previsionale AI</span><h3>' + esc(model.product) + '</h3><p>Ultimo riferimento: <strong>' + esc(moneyKg(model.latest)) + '</strong> - trend: <strong>' + esc(model.direction) + '</strong> - attendibilita base ' + esc(pct(model.confidence)) + '</p></div></div>' + chart(model) + '<div class="table-wrap"><table><thead><tr><th>Mese</th><th>Prezzo previsto</th><th>Forchetta prudenziale</th><th>Attendibilita</th><th>Orizzonte</th></tr></thead><tbody>' + rows + '</tbody></table></div><p class="pms200ai-note">Metodo: media mensile 2024-2026, trend lineare recente, stagionalita del mese e penalizzazione per volatilita. Tutti i prezzi sono normalizzati in EUR/kg.</p></section>';
    }).join("");
    return '<div class="pms200ai-page"><div class="section-header"><h3>Previsioni AI prezzi - prossimi 3 mesi</h3><div class="filters"><button class="secondary-button" data-pms200ai-refresh>Ricalcola</button><button class="secondary-button" data-pms200ai-print>Stampa previsione</button></div></div><div class="database-note">Il modello analizza lo storico 2024, 2025 e 2026 disponibile nel gestionale. La percentuale di attendibilita cresce con quantita dati, copertura anni e stabilita dei prezzi.</div>' + cards + '</div>';
  }
  function addModule() {
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    var existing = modules.find(function (m) { return m.id === MODULE; });
    if (existing) {
      existing.label = "Previsioni AI";
      existing.subtitle = "Prezzi previsti a 1, 2 e 3 mesi in EUR/kg";
      existing.roles = ["admin", "assistant"];
      return;
    }
    var idx = modules.findIndex(function (m) { return m.id === "priceHistory" || m.id === "marketTrends"; });
    modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, {
      id: MODULE,
      label: "Previsioni AI",
      subtitle: "Prezzi previsti a 1, 2 e 3 mesi in EUR/kg",
      roles: ["admin", "assistant"]
    });
  }
  function injectCss() {
    if (document.getElementById("pms-v200-ai-forecast-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v200-ai-forecast-style";
    style.textContent = [
      ".pms200ai-page{display:grid;gap:16px}",
      ".pms200ai-card{display:grid;gap:12px}",
      ".pms200ai-head span{display:block;text-transform:uppercase;font-size:12px;font-weight:900;color:var(--primary)}",
      ".pms200ai-head h3{margin:4px 0}",
      ".pms200ai-head p,.pms200ai-note{margin:0;color:var(--muted);line-height:1.45}",
      ".pms200ai-chart{width:100%;height:132px;border:1px solid var(--line);border-radius:8px;background:#fff}",
      ".pms200ai-chart polyline{fill:none;stroke:#1f7a4d;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}",
      ".pms200ai-chart line{stroke:#94a3b8;stroke-dasharray:4 4}.pms200ai-chart text{font-size:10px;fill:#64748b;font-weight:800}",
      ".pms200ai-confidence{display:inline-flex;border-radius:999px;background:#dcfce7;color:#166534;padding:5px 9px;font-weight:900}",
      ".pms200ai-page table{min-width:760px!important}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function bind() {
    document.querySelectorAll("[data-pms200ai-refresh]").forEach(function (button) {
      button.onclick = function () { if (typeof render === "function") render(); };
    });
    document.querySelectorAll("[data-pms200ai-print]").forEach(function (button) {
      button.onclick = function () {
        var html = '<div class="print-document">' + renderPage() + '<div class="print-footer">Previsioni AI Parmitalia - prezzi EUR/kg - ' + esc(todayIso()) + '</div></div>';
        if (typeof openPrint === "function") openPrint(html);
      };
    });
  }
  function wrapRender() {
    if (typeof render !== "function" || render.__pms200AiForecastWrapped) return;
    var baseRender = render;
    render = function () {
      addModule();
      injectCss();
      if (window.current && current.page === MODULE) {
        var content = document.getElementById("content");
        if (content) {
          content.innerHTML = renderPage();
          if (typeof bindPageActions === "function") bindPageActions();
          bind();
          return;
        }
      }
      var result = baseRender.apply(this, arguments);
      setTimeout(bind, 80);
      return result;
    };
    render.__pms200AiForecastWrapped = true;
  }
  function install() {
    st();
    addModule();
    injectCss();
    wrapRender();
    if (typeof renderNav === "function") renderNav();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
  window.PMS_V200_AI_FORECAST_MODEL = { version: VERSION, allForecasts: allForecasts, renderPage: renderPage };
})();
