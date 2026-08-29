(function(){
  "use strict";

  var VERSION = "pms_v205_orders_filters_logo_pdf_fix";
  var LOGO = "assets/parmitalia_logo_background.jpeg";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.orders = arr(state.orders);
    return state;
  }
  function page(){ return window.current && current.page || ""; }
  function saveNow(reason){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function first(item, keys){
    for (var i = 0; i < keys.length; i++) {
      var value = clean(item && item[keys[i]]);
      if (value) return value;
    }
    return "";
  }
  function orderCode(order){ return first(order, ["code","orderCode","id"]); }
  function orderField(order, field){
    if (field === "client") return first(order, ["client","customer","customerName","buyer"]);
    if (field === "supplier") return first(order, ["supplier","vendor","seller"]);
    if (field === "destination") return first(order, ["destination","orderDestination","deliveryDestination","shipTo","unloadingPlace","deliveryPlace","destinationAddress","customerDestination","finalDestination","to","delivery"]);
    if (field === "product") return first(order, ["product","productName","article","item","description"]);
    if (field === "status") return first(order, ["status","state"]);
    if (field === "orderType") return first(order, ["orderType","type"]);
    return "";
  }
  function uniqueOptions(field){
    var seen = {};
    arr(st().orders).forEach(function(order){
      var value = orderField(order, field);
      if (value) seen[value] = true;
    });
    return Object.keys(seen).sort(function(a,b){ return a.localeCompare(b, "it"); });
  }
  function filters(){
    var s = st().settings;
    s.pms205OrderFilters = s.pms205OrderFilters || {};
    return s.pms205OrderFilters;
  }
  function selectHtml(key, label){
    var f = filters();
    var selected = clean(f[key]);
    var options = uniqueOptions(key).map(function(value){
      return '<option value="' + esc(value) + '"' + (value === selected ? " selected" : "") + '>' + esc(value) + '</option>';
    }).join("");
    return '<label>' + esc(label) + '<select data-pms205-order-filter="' + esc(key) + '"><option value="">Tutti</option>' + options + '</select></label>';
  }
  function panelHtml(){
    var f = filters();
    return '<div id="pms205-order-filters" class="pms205-order-filters">' +
      '<div class="pms205-filter-title"><strong>Filtri ordini</strong><span data-pms205-order-count></span></div>' +
      '<div class="pms205-filter-grid">' +
        '<label>Ricerca libera<input data-pms205-order-filter="text" value="' + esc(f.text || "") + '" placeholder="Codice, cliente, prodotto, destinazione..."></label>' +
        selectHtml("client", "Cliente") +
        selectHtml("supplier", "Fornitore") +
        selectHtml("destination", "Destinazione") +
        selectHtml("product", "Prodotto") +
        selectHtml("status", "Stato") +
        selectHtml("orderType", "Tipo ordine") +
        '<div class="pms205-filter-actions"><button type="button" class="secondary-button" data-pms205-clear-order-filters>Pulisci filtri</button></div>' +
      '</div>' +
    '</div>';
  }
  function findOrderForRow(row, index){
    var list = arr(st().orders);
    var code = row && row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    var found = list.find(function(order){ return orderCode(order) === code || clean(order && order.id) === code; });
    return found || list[index] || null;
  }
  function matches(order, row){
    var f = filters();
    var rowText = clean(row && row.textContent).toLowerCase();
    if (clean(f.text) && rowText.indexOf(clean(f.text).toLowerCase()) < 0) return false;
    var keys = ["client","supplier","destination","product","status","orderType"];
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (clean(f[key]) && orderField(order, key) !== clean(f[key])) return false;
    }
    return true;
  }
  function applyFilters(){
    if (page() !== "orders") return;
    var rows = Array.from(document.querySelectorAll("#content table tbody tr"));
    var visible = 0;
    rows.forEach(function(row, index){
      if (/nessun|nessuna/i.test(row.textContent || "")) return;
      var order = findOrderForRow(row, index);
      var show = !order || matches(order, row);
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });
    var count = document.querySelector("[data-pms205-order-count]");
    if (count) count.textContent = visible + " visualizzati / " + arr(st().orders).length + " totali";
  }
  function bindFilters(root){
    root = root || document;
    root.querySelectorAll("[data-pms205-order-filter]").forEach(function(input){
      if (input.dataset.pms205Bound === "1") return;
      input.dataset.pms205Bound = "1";
      input.addEventListener("input", function(){
        filters()[input.getAttribute("data-pms205-order-filter")] = input.value;
        saveNow("v205-order-filter");
        applyFilters();
      });
      input.addEventListener("change", function(){
        filters()[input.getAttribute("data-pms205-order-filter")] = input.value;
        saveNow("v205-order-filter");
        applyFilters();
      });
    });
    root.querySelectorAll("[data-pms205-clear-order-filters]").forEach(function(button){
      if (button.dataset.pms205Bound === "1") return;
      button.dataset.pms205Bound = "1";
      button.onclick = function(){
        st().settings.pms205OrderFilters = {};
        saveNow("v205-order-filter-clear");
        var panel = document.getElementById("pms205-order-filters");
        if (panel) panel.remove();
        decorateOrders();
      };
    });
  }
  function decorateOrders(){
    if (page() !== "orders") return;
    var tableWrap = document.querySelector("#content .pms196-orders-table-wrap,#content .table-wrap");
    if (!tableWrap) return;
    if (!document.getElementById("pms205-order-filters")) {
      tableWrap.insertAdjacentHTML("beforebegin", panelHtml());
    }
    bindFilters(document);
    applyFilters();
  }
  function ensureLogo(){
    var settings = st().settings;
    if (!clean(settings.logoUrl)) {
      settings.logoUrl = LOGO;
      settings.pms205LogoFallback = "1";
      saveNow("v205-logo-fallback");
    }
  }
  function installPrintHeader(){
    if (window.__pms205CompanyHeaderWrapped) return;
    window.__pms205CompanyHeaderWrapped = true;
    var fallbackHeader = function(title, code, subtitle){
      var s = st().settings || {};
      var logo = clean(s.logoUrl) || LOGO;
      return '<div class="print-header"><div>' +
        '<img class="print-logo" src="' + esc(logo) + '" alt="Parmitalia logo">' +
        '<h1>' + esc(title || "") + '</h1>' +
        '<strong>' + esc(s.legalName || s.companyName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br>' +
        '<span>' + esc(subtitle || s.address || "") + '</span>' +
      '</div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(new Date().toLocaleDateString("it-IT")) + '</div></div>';
    };
    try {
      companyPrintHeader = function(title, code, subtitle){ ensureLogo(); return fallbackHeader(title, code, subtitle); };
      window.companyPrintHeader = companyPrintHeader;
    } catch(error) {
      window.companyPrintHeader = function(title, code, subtitle){ ensureLogo(); return fallbackHeader(title, code, subtitle); };
    }
  }
  function injectCss(){
    var style = document.getElementById("pms-v205-orders-filters-logo-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v205-orders-filters-logo-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms205-order-filters{border:1px solid #d7dee8;background:#fff;border-radius:8px;padding:10px;margin:0 0 12px;max-width:100%;overflow:visible}",
      ".pms205-filter-title{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:8px;color:#17242b}",
      ".pms205-filter-title span{font-size:12px;color:#64748b;font-weight:800}",
      ".pms205-filter-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;align-items:end}",
      ".pms205-filter-grid label{display:grid;gap:4px;font-size:11px;font-weight:850;color:#526172;min-width:0}",
      ".pms205-filter-grid input,.pms205-filter-grid select{width:100%!important;min-width:0!important;height:34px!important;margin:0!important;padding:6px 8px!important;font-size:12px!important}",
      ".pms205-filter-actions{display:flex;align-items:end}.pms205-filter-actions button{width:100%!important;margin:0!important;min-height:34px!important}",
      ".print-logo{display:block!important;max-width:38mm!important;max-height:22mm!important;width:auto!important;height:auto!important;object-fit:contain!important;margin:0 0 2mm!important}"
    ].join("\n");
  }
  function refresh(){
    injectCss();
    ensureLogo();
    installPrintHeader();
    decorateOrders();
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms205Wrapped) {
      var base = render;
      render = function(){
        var result = base.apply(this, arguments);
        setTimeout(refresh, 40);
        setTimeout(refresh, 240);
        return result;
      };
      render.__pms205Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof bindPageActions === "function" && !bindPageActions.__pms205Wrapped) {
      var baseBind = bindPageActions;
      bindPageActions = function(){
        var result = baseBind.apply(this, arguments);
        setTimeout(refresh, 40);
        return result;
      };
      bindPageActions.__pms205Wrapped = true;
      try { window.bindPageActions = bindPageActions; } catch(error) {}
    }
  }

  injectCss();
  ensureLogo();
  installPrintHeader();
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
  [120, 600, 1400].forEach(function(ms){ setTimeout(refresh, ms); });
  window.PMS_V205_ORDERS_FILTERS_LOGO_PDF_FIX = {version:VERSION, refresh:refresh};
})();
