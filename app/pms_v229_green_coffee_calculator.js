(function () {
  "use strict";

  if (window.PMS_V229_GREEN_COFFEE_CALCULATOR) return;

  var VERSION = "pms_v229_green_coffee_calculator";
  var MODULE_ID = "greenCoffee";
  var STYLE_ID = "pms-v229-green-coffee-style";

  var DEFAULTS = {
    profileName: "Lotto caffe demo",
    coffeeType: "Arabica Brasile Santos",
    currency: "EUR",
    rawKg: 1000,
    rawPrice: 5.55,
    roastLossPct: 16,
    defectLossPct: 2,
    moistureLossPct: 1,
    freightKg: 0.42,
    customsKg: 0.08,
    roastingKg: 0.55,
    packagingKg: 0.36,
    laborKg: 0.22,
    energyKg: 0.18,
    financePct: 2.5,
    overheadPct: 6,
    marginPct: 22,
    vatPct: 0,
    forecast: {
      2023: { arabica: 4.25, robusta: 2.75, blend: 3.65, note: "mercato normalizzato" },
      2024: { arabica: 5.10, robusta: 4.35, blend: 4.78, note: "robusta forte, offerta tesa" },
      2025: { arabica: 7.35, robusta: 5.80, blend: 6.74, note: "stress climatico e scorte basse" },
      2026: { arabica: 6.05, robusta: 4.65, blend: 5.48, note: "stima prudente, volatilita alta" }
    }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function num(value, fallback) {
    var n = Number(String(value == null ? "" : value).replace(",", "."));
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function money(value, currency) {
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function getStateRoot() {
    try {
      if (typeof state !== "undefined" && state) return state;
    } catch (error) {}
    window.state = window.state || {};
    return window.state;
  }

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }

  function settings() {
    var root = getStateRoot();
    if (!root.greenCoffeeCalculator || typeof root.greenCoffeeCalculator !== "object") {
      root.greenCoffeeCalculator = cloneDefaults();
    }
    var data = root.greenCoffeeCalculator;
    Object.keys(DEFAULTS).forEach(function (key) {
      if (data[key] == null) data[key] = JSON.parse(JSON.stringify(DEFAULTS[key]));
    });
    data.forecast = data.forecast || cloneDefaults().forecast;
    Object.keys(DEFAULTS.forecast).forEach(function (year) {
      data.forecast[year] = Object.assign({}, DEFAULTS.forecast[year], data.forecast[year] || {});
    });
    return data;
  }

  function persist() {
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(getStateRoot()));
    } catch (error) {
      console.warn(VERSION + " save failed", error);
    }
  }

  function ensureModule() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules) && !modules.some(function (m) { return m && m.id === MODULE_ID; })) {
        modules.push({
          id: MODULE_ID,
          label: "Caffe crudo",
          subtitle: "Calcolo dal chicco crudo al prodotto tostato finito",
          roles: ["admin", "assistant", "accountant", "agent", "recruiter"]
        });
      }
    } catch (error) {}
  }

  function calc(data) {
    var rawKg = Math.max(0, num(data.rawKg));
    var lossPct = Math.min(85, Math.max(0, num(data.roastLossPct) + num(data.defectLossPct) + num(data.moistureLossPct)));
    var finishedKg = rawKg * (1 - lossPct / 100);
    var rawCost = rawKg * num(data.rawPrice);
    var direct = rawCost +
      rawKg * num(data.freightKg) +
      rawKg * num(data.customsKg) +
      rawKg * num(data.roastingKg) +
      finishedKg * num(data.packagingKg) +
      finishedKg * num(data.laborKg) +
      finishedKg * num(data.energyKg);
    var finance = direct * num(data.financePct) / 100;
    var overhead = direct * num(data.overheadPct) / 100;
    var total = direct + finance + overhead;
    var costKg = finishedKg > 0 ? total / finishedKg : 0;
    var sellKg = costKg * (1 + num(data.marginPct) / 100);
    var sellVatKg = sellKg * (1 + num(data.vatPct) / 100);
    return {
      lossPct: lossPct,
      finishedKg: finishedKg,
      rawCost: rawCost,
      direct: direct,
      finance: finance,
      overhead: overhead,
      total: total,
      costKg: costKg,
      sellKg: sellKg,
      sellVatKg: sellVatKg,
      marginValue: Math.max(0, sellKg - costKg) * finishedKg
    };
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms229-page{display:grid!important;gap:16px!important}",
      ".pms229-panel{background:#fff!important;border:1px solid var(--line,#d9e2ef)!important;border-radius:8px!important;padding:14px!important;box-shadow:0 8px 18px rgba(18,38,63,.05)!important}",
      ".pms229-head{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;gap:14px!important}",
      ".pms229-head h3{margin:2px 0 4px!important;font-size:22px!important}",
      ".pms229-head p{margin:0!important;color:#65758b!important;line-height:1.35!important}",
      ".pms229-actions{display:flex!important;gap:8px!important;flex-wrap:wrap!important}",
      ".pms229-actions button{width:auto!important;margin:0!important}",
      ".pms229-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important}",
      ".pms229-field label{display:block!important;margin:0 0 4px!important;font-size:12px!important;font-weight:900!important;color:#475569!important}",
      ".pms229-field input,.pms229-field select{width:100%!important;min-width:0!important}",
      ".pms229-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important}",
      ".pms229-kpi{border:1px solid var(--line,#d9e2ef)!important;border-radius:8px!important;background:#f8fafc!important;padding:12px!important}",
      ".pms229-kpi span{display:block!important;color:#64748b!important;font-size:12px!important;font-weight:900!important;text-transform:uppercase!important}",
      ".pms229-kpi strong{display:block!important;margin-top:6px!important;font-size:24px!important;color:#102f2e!important}",
      ".pms229-kpi small{display:block!important;margin-top:4px!important;color:#64748b!important}",
      ".pms229-table{width:100%!important;min-width:900px!important;border-collapse:collapse!important}",
      ".pms229-table th,.pms229-table td{padding:9px 10px!important;border-bottom:1px solid var(--line,#d9e2ef)!important;vertical-align:middle!important}",
      ".pms229-table input{min-width:90px!important}",
      ".pms229-note{border-left:4px solid #0f766e!important;background:#ecfdf5!important;color:#064e3b!important;padding:10px 12px!important;font-size:13px!important;line-height:1.4!important}",
      "@media(max-width:1100px){.pms229-grid,.pms229-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}}",
      "@media(max-width:720px){.pms229-grid,.pms229-kpis{grid-template-columns:1fr!important}.pms229-head{display:block!important}.pms229-actions{margin-top:10px!important}}"
    ].join("\n");
  }

  function input(name, label, type, step) {
    var data = settings();
    return '<div class="pms229-field"><label>' + esc(label) + '</label><input type="' + (type || "number") + '" step="' + (step || "0.01") + '" data-pms229-field="' + esc(name) + '" value="' + esc(data[name]) + '"></div>';
  }

  function renderForecastRows(data) {
    return Object.keys(data.forecast).sort().map(function (year) {
      var row = data.forecast[year];
      return '<tr>' +
        '<td><strong>' + esc(year) + '</strong></td>' +
        '<td><input type="number" step="0.01" data-pms229-forecast="' + esc(year) + '" data-key="arabica" value="' + esc(row.arabica) + '"></td>' +
        '<td><input type="number" step="0.01" data-pms229-forecast="' + esc(year) + '" data-key="robusta" value="' + esc(row.robusta) + '"></td>' +
        '<td><input type="number" step="0.01" data-pms229-forecast="' + esc(year) + '" data-key="blend" value="' + esc(row.blend) + '"></td>' +
        '<td><input type="text" data-pms229-forecast="' + esc(year) + '" data-key="note" value="' + esc(row.note) + '"></td>' +
        '</tr>';
    }).join("");
  }

  function renderCoffee() {
    ensureModule();
    injectStyle();
    var data = settings();
    var out = calc(data);
    return '<div class="pms229-page">' +
      '<section class="pms229-panel pms229-head"><div><h3>Caffe crudo - calcolo da chicco crudo a finito</h3><p>Simulatore operativo: prezzo materia prima, calo tostatura, scarti, costi industriali, margine e prezzo finale. Le previsioni sono stime modificabili, non quotazioni ufficiali.</p></div><div class="pms229-actions"><button type="button" class="secondary-button" data-pms229-reset>Ripristina stime</button><button type="button" class="primary-button" data-pms229-save>Salva scenario</button></div></section>' +
      '<section class="pms229-kpis">' +
        '<div class="pms229-kpi"><span>Kg crudo</span><strong>' + esc(num(data.rawKg).toLocaleString("it-IT")) + '</strong><small>' + esc(data.coffeeType) + '</small></div>' +
        '<div class="pms229-kpi"><span>Kg finito stimato</span><strong>' + esc(out.finishedKg.toLocaleString("it-IT", { maximumFractionDigits: 1 })) + '</strong><small>Calo totale ' + esc(out.lossPct.toFixed(1)) + '%</small></div>' +
        '<div class="pms229-kpi"><span>Costo / kg finito</span><strong>' + esc(money(out.costKg, data.currency)) + '</strong><small>prima del margine</small></div>' +
        '<div class="pms229-kpi"><span>Prezzo vendita target</span><strong>' + esc(money(out.sellVatKg, data.currency)) + '</strong><small>margine ' + esc(num(data.marginPct).toFixed(1)) + '%</small></div>' +
      '</section>' +
      '<section class="pms229-panel"><div class="section-header"><h3>Parametri lotto</h3></div><div class="pms229-grid">' +
        input("profileName", "Nome scenario", "text") +
        input("coffeeType", "Origine / qualita", "text") +
        input("rawKg", "Kg chicco crudo") +
        input("rawPrice", "Prezzo crudo EUR/kg") +
        input("roastLossPct", "Calo tostatura %") +
        input("defectLossPct", "Scarto/difetti %") +
        input("moistureLossPct", "Umidita/residuo %") +
        input("freightKg", "Trasporto EUR/kg crudo") +
        input("customsKg", "Dazio/oneri EUR/kg crudo") +
        input("roastingKg", "Tostatura EUR/kg crudo") +
        input("packagingKg", "Imballo EUR/kg finito") +
        input("laborKg", "Manodopera EUR/kg finito") +
        input("energyKg", "Energia EUR/kg finito") +
        input("financePct", "Finanza/anticipo %") +
        input("overheadPct", "Overhead %") +
        input("marginPct", "Margine commerciale %") +
        input("vatPct", "IVA %") +
      '</div></section>' +
      '<section class="pms229-panel"><div class="section-header"><h3>Risultato costo finale</h3></div><div class="table-wrap"><table class="pms229-table"><tbody>' +
        '<tr><th>Materia prima</th><td>' + esc(money(out.rawCost, data.currency)) + '</td><td>' + esc(money(num(data.rawPrice), data.currency)) + ' / kg crudo</td></tr>' +
        '<tr><th>Costi diretti inclusi</th><td>' + esc(money(out.direct, data.currency)) + '</td><td>crudo + trasporto + dazi + tostatura + imballo + lavoro + energia</td></tr>' +
        '<tr><th>Finanza</th><td>' + esc(money(out.finance, data.currency)) + '</td><td>' + esc(num(data.financePct).toFixed(2)) + '% sui diretti</td></tr>' +
        '<tr><th>Struttura / rischio</th><td>' + esc(money(out.overhead, data.currency)) + '</td><td>' + esc(num(data.overheadPct).toFixed(2)) + '% sui diretti</td></tr>' +
        '<tr><th>Totale lotto</th><td><strong>' + esc(money(out.total, data.currency)) + '</strong></td><td>' + esc(out.finishedKg.toFixed(1)) + ' kg finiti</td></tr>' +
        '<tr><th>Margine lordo stimato</th><td>' + esc(money(out.marginValue, data.currency)) + '</td><td>se vendi a prezzo target</td></tr>' +
      '</tbody></table></div></section>' +
      '<section class="pms229-panel"><div class="section-header"><h3>Previsioni prezzo crudo 2023-2026</h3></div><div class="pms229-note">Base indicativa ispirata agli indicatori internazionali del caffe: usa questi numeri come scenario commerciale interno, poi correggili con offerte reali, qualita, origine, certificazioni, cambio EUR/USD e logistica.</div><div class="table-wrap" style="margin-top:12px"><table class="pms229-table"><thead><tr><th>Anno</th><th>Arabica EUR/kg</th><th>Robusta EUR/kg</th><th>Blend medio EUR/kg</th><th>Nota</th></tr></thead><tbody>' + renderForecastRows(data) + '</tbody></table></div></section>' +
    '</div>';
  }

  function bindCoffee() {
    document.querySelectorAll("[data-pms229-field]").forEach(function (node) {
      node.oninput = function () {
        var data = settings();
        var key = node.getAttribute("data-pms229-field");
        data[key] = node.type === "number" ? num(node.value) : node.value;
        persist();
        scheduleRender();
      };
    });
    document.querySelectorAll("[data-pms229-forecast]").forEach(function (node) {
      node.oninput = function () {
        var data = settings();
        var year = node.getAttribute("data-pms229-forecast");
        var key = node.getAttribute("data-key");
        data.forecast[year][key] = node.type === "number" ? num(node.value) : node.value;
        persist();
      };
    });
    var saveBtn = document.querySelector("[data-pms229-save]");
    if (saveBtn) saveBtn.onclick = function () { persist(); alert("Scenario caffe salvato."); };
    var resetBtn = document.querySelector("[data-pms229-reset]");
    if (resetBtn) resetBtn.onclick = function () {
      getStateRoot().greenCoffeeCalculator = cloneDefaults();
      persist();
      renderCoffeePage();
    };
  }

  var renderTimer = null;
  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(renderCoffeePage, 250);
  }

  function renderCoffeePage() {
    var content = document.getElementById("content");
    if (!content) return;
    var title = document.getElementById("page-title");
    var subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = "Caffe crudo";
    if (subtitle) subtitle.textContent = "Dal chicco crudo al chicco tostato finito";
    content.innerHTML = renderCoffee();
    bindCoffee();
  }

  function wrapRender() {
    var base = window.render;
    if (typeof base !== "function" || base.__pms229Wrapped) return;
    var wrapped = function () {
      ensureModule();
      try {
        if (typeof current !== "undefined" && current && current.page === MODULE_ID) {
          renderCoffeePage();
          return;
        }
      } catch (error) {}
      return base.apply(this, arguments);
    };
    wrapped.__pms229Wrapped = true;
    window.render = wrapped;
    try { eval("render = window.render"); } catch (error) {}
  }

  function install() {
    ensureModule();
    wrapRender();
    if (typeof current !== "undefined" && current && current.page === MODULE_ID) renderCoffeePage();
    if (window.PMS_V227_FILL_BLANK_SIDEBAR_MENU && typeof window.PMS_V227_FILL_BLANK_SIDEBAR_MENU.refresh === "function") {
      window.PMS_V227_FILL_BLANK_SIDEBAR_MENU.refresh();
    }
    console.info(VERSION + " loaded");
  }

  window.PMS_V229_GREEN_COFFEE_CALCULATOR = { version: VERSION, render: renderCoffeePage, settings: settings };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
