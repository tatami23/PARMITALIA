(function(){
  "use strict";

  var VERSION = "pms_v246_complete_dairy_moisture_quality";
  var STYLE_ID = "pms-v246-complete-dairy-moisture-quality-style";
  var PANEL_ID = "pms246-dairy-quality-panel";
  var RESULT_ID = "pms246-dairy-quality-results";
  var renderRetrying = false;

  var DEFAULTS = {
    milkFatPct: 3.8,
    milkProteinPct: 3.3,
    milkLactosePct: 4.8,
    milkMineralsPct: 0.7,
    milkDryMatterPct: 12.6,
    milkNonFatSolidsPct: 8.8,
    productMoisturePct: 52,
    productDryMatterPct: 48,
    productFatPct: 22,
    productProteinPct: 18,
    productSaltPct: 1.5,
    productPh: 5.25,
    productAciditySH: 8.5,
    processTemperatureC: 36,
    solidsRecoveryPct: 82
  };

  var FIELDS = [
    ["milkFatPct", "Grasso latte %"],
    ["milkProteinPct", "Proteine latte %"],
    ["milkLactosePct", "Lattosio %"],
    ["milkMineralsPct", "Sali minerali / ceneri %"],
    ["milkDryMatterPct", "Sostanza secca latte %"],
    ["milkNonFatSolidsPct", "Sostanza secca magra latte %"],
    ["productMoisturePct", "Umidita prodotto %"],
    ["productDryMatterPct", "Sostanza secca prodotto %"],
    ["productFatPct", "Grasso prodotto %"],
    ["productProteinPct", "Proteine prodotto %"],
    ["productSaltPct", "Sale %"],
    ["productPh", "pH"],
    ["productAciditySH", "Acidita SH"],
    ["processTemperatureC", "Temperatura processo C"],
    ["solidsRecoveryPct", "Recupero sostanza secca %"]
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }

  function num(value, fallback) {
    var n = Number(String(value == null ? "" : value).replace(",", "."));
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function pct(value) {
    return num(value).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  }

  function kg(value) {
    return num(value).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " kg";
  }

  function root() {
    try {
      if (typeof state !== "undefined" && state) return state;
    } catch(error) {}
    window.state = window.state || {};
    return window.state;
  }

  function persist() {
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(root()));
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }

  function dairy() {
    var s = root();
    s.dairyProduction = s.dairyProduction && typeof s.dairyProduction === "object" ? s.dairyProduction : {};
    Object.keys(DEFAULTS).forEach(function(key){
      if (s.dairyProduction[key] == null || s.dairyProduction[key] === "") s.dairyProduction[key] = DEFAULTS[key];
    });
    var d = s.dairyProduction;
    if (d.productDryMatterPct == null || d.productDryMatterPct === "") d.productDryMatterPct = Math.max(0, 100 - num(d.productMoisturePct, DEFAULTS.productMoisturePct));
    if (d.productMoisturePct == null || d.productMoisturePct === "") d.productMoisturePct = Math.max(0, 100 - num(d.productDryMatterPct, DEFAULTS.productDryMatterPct));
    return d;
  }

  function calc(d) {
    var liters = num(d.rawMilkLiters);
    var curdKg = liters * num(d.yieldKgPer100L) / 100;
    var finishedKg = curdKg * (1 - Math.min(90, Math.max(0, num(d.wastePct))) / 100);
    var milkKg = liters * 1.032;
    var milkDryKg = milkKg * num(d.milkDryMatterPct) / 100;
    var milkFatKg = milkKg * num(d.milkFatPct) / 100;
    var milkProteinKg = milkKg * num(d.milkProteinPct) / 100;
    var productDryPct = num(d.productDryMatterPct);
    var productMoisturePct = num(d.productMoisturePct);
    var productDryKg = finishedKg * productDryPct / 100;
    var productWaterKg = finishedKg * productMoisturePct / 100;
    var productFatKg = finishedKg * num(d.productFatPct) / 100;
    var productProteinKg = finishedKg * num(d.productProteinPct) / 100;
    var productSaltKg = finishedKg * num(d.productSaltPct) / 100;
    var fatDryMatterPct = productDryKg > 0 ? productFatKg / productDryKg * 100 : 0;
    var solidsRecoveryPct = milkDryKg > 0 ? productDryKg / milkDryKg * 100 : 0;
    return {
      finishedKg: finishedKg,
      milkKg: milkKg,
      milkDryKg: milkDryKg,
      milkFatKg: milkFatKg,
      milkProteinKg: milkProteinKg,
      productDryKg: productDryKg,
      productWaterKg: productWaterKg,
      productFatKg: productFatKg,
      productProteinKg: productProteinKg,
      productSaltKg: productSaltKg,
      fatDryMatterPct: fatDryMatterPct,
      solidsRecoveryPct: solidsRecoveryPct
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
      ".pms246-quality-note{border-left:4px solid #1f4e78!important;background:#f8fafc!important;color:#334155!important;padding:10px 12px!important;line-height:1.35!important}",
      ".pms246-mini-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important;margin-top:12px!important}",
      ".pms246-mini{border:1px solid var(--line,#d9e2ef)!important;border-radius:8px!important;background:#fff!important;padding:10px!important;min-height:70px!important}",
      ".pms246-mini span{display:block!important;color:#64748b!important;font-size:11px!important;font-weight:900!important;text-transform:uppercase!important}",
      ".pms246-mini strong{display:block!important;margin-top:5px!important;color:#103a34!important;font-size:20px!important;line-height:1.1!important}",
      "@media(max-width:900px){.pms246-mini-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}}",
      "@media(max-width:560px){.pms246-mini-kpis{grid-template-columns:1fr!important}}"
    ].join("\n");
  }

  function field(name, label) {
    var d = dairy();
    return '<div class="pms230-field"><label>' + esc(label) + '</label><input type="number" step="0.01" data-pms230-field="' + esc(name) + '" value="' + esc(d[name]) + '"></div>';
  }

  function mini(label, value) {
    return '<div class="pms246-mini"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong></div>';
  }

  function qualityPanel() {
    var d = dairy();
    return '<section class="pms230-panel" id="' + PANEL_ID + '">' +
      '<div class="section-header"><div><h3>Umidita e composizione latte</h3></div></div>' +
      '<div class="pms230-grid">' + FIELDS.map(function(item){ return field(item[0], item[1]); }).join("") + '</div>' +
      '<div class="pms246-quality-note">La sostanza secca prodotto e collegata all umidita: se cambi una delle due, l altra viene aggiornata per completare il 100%.</div>' +
    '</section>';
  }

  function resultPanel() {
    var d = dairy();
    var c = calc(d);
    return '<section class="pms230-panel" id="' + RESULT_ID + '">' +
      '<div class="section-header"><h3>Risultato umidita e sostanza secca</h3></div>' +
      '<div class="pms246-mini-kpis">' +
        mini("Umidita prodotto", pct(d.productMoisturePct)) +
        mini("Sostanza secca", pct(d.productDryMatterPct)) +
        mini("Secco nel lotto", kg(c.productDryKg)) +
        mini("Grasso su secco", pct(c.fatDryMatterPct)) +
      '</div>' +
      '<div class="table-wrap" style="margin-top:12px"><table class="pms230-table"><tbody>' +
        '<tr><th>Acqua / umidita nel prodotto</th><td>' + esc(kg(c.productWaterKg)) + '</td><td>' + esc(pct(d.productMoisturePct)) + ' sul prodotto finito</td></tr>' +
        '<tr><th>Sostanza secca prodotto</th><td>' + esc(kg(c.productDryKg)) + '</td><td>' + esc(pct(d.productDryMatterPct)) + ' sul prodotto finito</td></tr>' +
        '<tr><th>Sostanza secca latte in ingresso</th><td>' + esc(kg(c.milkDryKg)) + '</td><td>' + esc(pct(d.milkDryMatterPct)) + ' sul latte stimato in kg</td></tr>' +
        '<tr><th>Grasso latte / prodotto</th><td>' + esc(kg(c.milkFatKg)) + ' / ' + esc(kg(c.productFatKg)) + '</td><td>Grasso sul secco: ' + esc(pct(c.fatDryMatterPct)) + '</td></tr>' +
        '<tr><th>Proteine latte / prodotto</th><td>' + esc(kg(c.milkProteinKg)) + ' / ' + esc(kg(c.productProteinKg)) + '</td><td>Proteine prodotto: ' + esc(pct(d.productProteinPct)) + '</td></tr>' +
        '<tr><th>Sale, pH e acidita</th><td>' + esc(kg(c.productSaltKg)) + '</td><td>Sale ' + esc(pct(d.productSaltPct)) + ' | pH ' + esc(num(d.productPh).toFixed(2)) + ' | SH ' + esc(num(d.productAciditySH).toFixed(2)) + '</td></tr>' +
        '<tr><th>Recupero sostanza secca</th><td>' + esc(pct(c.solidsRecoveryPct)) + '</td><td>Target lotto impostato: ' + esc(pct(d.solidsRecoveryPct)) + '</td></tr>' +
      '</tbody></table></div>' +
    '</section>';
  }

  function isDairyPage() {
    try { return typeof current !== "undefined" && current && current.page === "productionDairy"; } catch(error) {}
    return false;
  }

  function augment() {
    if (!isDairyPage()) return;
    injectStyle();
    dairy();
    var content = document.getElementById("content");
    if (!content) return;
    if (!content.querySelector(".pms230-page") && typeof window.render === "function" && !renderRetrying) {
      renderRetrying = true;
      try { window.render(); } catch(error) {}
      renderRetrying = false;
      content = document.getElementById("content");
      if (!content) return;
    }
    var oldPanel = document.getElementById(PANEL_ID);
    if (oldPanel) oldPanel.remove();
    var oldResult = document.getElementById(RESULT_ID);
    if (oldResult) oldResult.remove();
    var sections = content.querySelectorAll(".pms230-page > section");
    var paramSection = sections[1] || null;
    var resultSection = sections[2] || null;
    if (paramSection) paramSection.insertAdjacentHTML("afterend", qualityPanel());
    if (resultSection) resultSection.insertAdjacentHTML("afterend", resultPanel());
  }

  function syncLinkedFields(changed) {
    var d = dairy();
    if (changed === "productMoisturePct") d.productDryMatterPct = Math.max(0, Math.min(100, 100 - num(d.productMoisturePct))).toFixed(2);
    if (changed === "productDryMatterPct") d.productMoisturePct = Math.max(0, Math.min(100, 100 - num(d.productDryMatterPct))).toFixed(2);
    d.milkNonFatSolidsPct = Math.max(0, num(d.milkDryMatterPct) - num(d.milkFatPct)).toFixed(2);
    persist();
  }

  function bindInput() {
    if (document.__pms246DairyQualityBound) return;
    document.__pms246DairyQualityBound = true;
    document.addEventListener("input", function(event){
      var node = event.target && event.target.closest && event.target.closest("[data-pms230-field]");
      if (!node || !isDairyPage()) return;
      var key = node.getAttribute("data-pms230-field");
      if (!Object.prototype.hasOwnProperty.call(DEFAULTS, key)) return;
      dairy()[key] = node.value;
      syncLinkedFields(key);
      clearTimeout(window.__pms246DairyQualityTimer);
      window.__pms246DairyQualityTimer = setTimeout(augment, 260);
    }, true);
  }

  function wrapRender() {
    if (typeof window.render !== "function" || window.render.__pms246Wrapped) return;
    var base = window.render;
    var wrapped = function(){
      var result = base.apply(this, arguments);
      setTimeout(augment, 0);
      return result;
    };
    wrapped.__pms246Wrapped = true;
    window.render = wrapped;
    try { render = wrapped; } catch(error) {}
  }

  function wrapSetPage() {
    if (typeof window.setPage !== "function" || window.setPage.__pms246Wrapped) return;
    var base = window.setPage;
    var wrapped = function(page) {
      var result = base.apply(this, arguments);
      if (page === "productionDairy") [0, 80, 220, 520].forEach(function(ms){ setTimeout(augment, ms); });
      return result;
    };
    wrapped.__pms246Wrapped = true;
    window.setPage = wrapped;
    try { setPage = wrapped; } catch(error) {}
  }

  function install() {
    injectStyle();
    bindInput();
    wrapRender();
    wrapSetPage();
    augment();
    [120, 450, 1200, 2500].forEach(function(ms){ setTimeout(augment, ms); });
    window.PMS_V246_COMPLETE_DAIRY_MOISTURE_QUALITY = {
      version: VERSION,
      augment: augment,
      defaults: DEFAULTS
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
