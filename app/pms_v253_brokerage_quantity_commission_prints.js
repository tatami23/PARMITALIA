(function(){
  "use strict";

  var VERSION = "pms_v253_brokerage_quantity_commission_prints";
  var MODULE = "commercialBrokerage";
  var STORE = "brokerageDeals";
  var STYLE_ID = "pms-v253-brokerage-style";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function num(value){
    var parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(num(value), currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function nextCode(prefix, list){
    var year = new Date().getFullYear();
    var re = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    var max = arr(list).reduce(function(acc, item){
      var match = String(item && (item.id || item.code || "") || "").match(re);
      return match ? Math.max(acc, Number(match[1])) : acc;
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function ensure(){
    window.state = window.state || {};
    state[STORE] = arr(state[STORE]).map(normalizeDeal);
    state.settings = state.settings || {};
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      var module = modules.find(function(item){ return item.id === MODULE; });
      if (module) {
        module.label = "Brokeraggio commerciale";
        module.subtitle = "Quantita, prezzo, forme intere e commissione Parmitalia";
      }
    }
  }
  function normalizeDeal(item){
    item = item && typeof item === "object" ? item : {};
    var quantity = item.totalQuantity != null && item.totalQuantity !== "" ? item.totalQuantity : (item.quantity != null && item.quantity !== "" ? item.quantity : "");
    var unitPrice = item.unitPrice != null && item.unitPrice !== "" ? item.unitPrice : (item.price != null && item.price !== "" ? item.price : "");
    var commissionPct = item.parmitaliaCommissionPct != null && item.parmitaliaCommissionPct !== "" ? item.parmitaliaCommissionPct : (item.commissionPct != null ? item.commissionPct : "");
    return Object.assign({}, item, {
      id: clean(item.id || item.code) || nextCode("BRK", state && state[STORE]),
      date: clean(item.date) || today(),
      client: clean(item.client),
      supplier: clean(item.supplier),
      product: clean(item.product),
      totalQuantity: quantity,
      unitType: clean(item.unitType || item.unit) || "kg",
      wholeWheels: item.wholeWheels != null ? item.wholeWheels : "",
      unitPrice: unitPrice,
      currency: clean(item.currency) || "EUR",
      parmitaliaCommissionPct: commissionPct,
      commissionPaymentType: clean(item.commissionPaymentType || item.paymentTerms || item.commissionPaymentTerms) || "All'incasso cliente",
      commissionPaymentMethod: clean(item.commissionPaymentMethod) || "Bonifico bancario",
      commissionNote: clean(item.commissionNote || item.notes),
      status: clean(item.status) || "Aperta",
      nextAction: clean(item.nextAction),
      notes: clean(item.notes),
      createdAt: clean(item.createdAt) || new Date().toISOString(),
      updatedAt: clean(item.updatedAt)
    });
  }
  function operationValue(deal){
    var qty = num(deal.totalQuantity);
    var price = num(deal.unitPrice);
    if (qty && price) return qty * price;
    return num(deal.value || deal.total || deal.operationValue);
  }
  function commissionAmount(deal){
    return operationValue(deal) * num(deal.parmitaliaCommissionPct) / 100;
  }
  function commissionText(deal, includeAmount){
    var parts = [];
    if (deal.parmitaliaCommissionPct !== "" && deal.parmitaliaCommissionPct != null) parts.push("Provvigione Parmitalia " + clean(deal.parmitaliaCommissionPct) + "%");
    if (deal.commissionPaymentType) parts.push(deal.commissionPaymentType);
    if (deal.commissionPaymentMethod) parts.push(deal.commissionPaymentMethod);
    if (deal.commissionNote) parts.push(deal.commissionNote);
    if (includeAmount) parts.push("Guadagno calcolato: " + money(commissionAmount(deal), deal.currency));
    return parts.join(" - ") || "-";
  }
  function saveState(){
    try {
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn(VERSION + " local save failed", error);
    }
    try {
      if (window.PMS_V252_REAL_SAVE && typeof window.PMS_V252_REAL_SAVE.saveNow === "function") {
        window.PMS_V252_REAL_SAVE.saveNow("v253-brokerage-save", { silent: true });
      } else if (window.parmitaliaStorage && typeof window.parmitaliaStorage.save === "function") {
        window.parmitaliaStorage.save(state).catch(function(error){ console.warn(VERSION + " desktop save failed", error); });
      } else if (typeof save === "function") {
        save();
      }
    } catch (error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function header(title, code, subtitle){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, subtitle || "");
    var s = state.settings || {};
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(subtitle || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function openPrintSafe(html){
    if (typeof openPrint === "function") openPrint(html);
    else {
      var root = document.getElementById("print-root");
      if (root) root.innerHTML = html;
      window.print();
    }
  }
  function css(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".pms253-page{display:grid;gap:14px;color:#172033}",
      ".pms253-hero{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;padding:15px 16px;background:#fff;border:1px solid #d7dee8;border-left:5px solid #14532d;border-radius:8px}",
      ".pms253-hero h3{margin:0 0 5px;color:#0f172a;font-size:22px}.pms253-hero p{margin:0;color:#52606d;line-height:1.35}.pms253-hero span{display:block;color:#14532d;font-size:12px;font-weight:900;text-transform:uppercase}",
      ".pms253-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.pms253-actions button,.pms253-page button{width:auto!important;margin:0!important}",
      ".pms253-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.pms253-kpi{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:11px}.pms253-kpi span{display:block;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase}.pms253-kpi strong{display:block;margin-top:4px;color:#0f172a;font-size:20px}",
      ".pms253-panel{background:#fff;border:1px solid #d7dee8;border-radius:8px;overflow:hidden}.pms253-table{overflow:auto}.pms253-table table{width:100%;min-width:1100px;border-collapse:collapse}.pms253-table th,.pms253-table td{padding:9px 10px;border-bottom:1px solid #e5edf5;text-align:left;vertical-align:top}.pms253-table th{background:#eef2f7;color:#253447;font-size:12px}.pms253-table small{display:block;color:#64748b;margin-top:3px;line-height:1.25}",
      ".pms253-modal-backdrop{position:fixed;inset:0;z-index:2147483300;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms253-modal{width:min(1000px,96vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;box-shadow:0 24px 74px rgba(15,23,42,.34)}",
      ".pms253-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px;border-bottom:1px solid #e5edf5}.pms253-modal-head h3{margin:0;color:#0f172a}.pms253-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px}.pms253-form label{margin:0;font-size:12px;font-weight:900;color:#475569}.pms253-form input,.pms253-form select,.pms253-form textarea{background:#fff}.pms253-form .half{grid-column:span 2}.pms253-form .full{grid-column:1/-1}.pms253-form textarea{min-height:82px}.pms253-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}",
      "@media(max-width:880px){.pms253-hero{display:grid}.pms253-form{grid-template-columns:1fr}.pms253-form .half{grid-column:1/-1}}",
      "@media print{.pms253-modal-backdrop{display:none!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function options(values, current){
    return values.map(function(value){
      return '<option value="' + esc(value) + '" ' + (String(value) === String(current || "") ? "selected" : "") + '>' + esc(value) + '</option>';
    }).join("");
  }
  function contactDatalist(id){
    var names = [];
    arr(state.contacts).forEach(function(c){
      var name = c && (c.name || c.company || c.businessName || c.client || c.supplier);
      if (name) names.push(name);
    });
    return '<datalist id="' + esc(id) + '">' + Array.from(new Set(names)).sort().map(function(name){ return '<option value="' + esc(name) + '"></option>'; }).join("") + '</datalist>';
  }
  function productDatalist(){
    var names = [];
    arr(state.products).forEach(function(p){ if (p && (p.name || p.product || p.code)) names.push(p.name || p.product || p.code); });
    arr(state.offers).forEach(function(o){ if (o && o.product) names.push(o.product); });
    arr(state.orders).forEach(function(o){ if (o && o.product) names.push(o.product); });
    return '<datalist id="pms253-products">' + Array.from(new Set(names)).sort().map(function(name){ return '<option value="' + esc(name) + '"></option>'; }).join("") + '</datalist>';
  }
  function formHtml(deal){
    deal = normalizeDeal(deal || { id: nextCode("BRK", state[STORE]), date: today(), currency: "EUR", unitType: "kg", status: "Aperta" });
    return contactDatalist("pms253-clients") + contactDatalist("pms253-suppliers") + productDatalist() +
      '<form id="pms253-form" class="pms253-form">' +
      '<input type="hidden" name="createdAt" value="' + esc(deal.createdAt || new Date().toISOString()) + '">' +
      '<label>Protocollo<input name="id" value="' + esc(deal.id) + '" readonly></label>' +
      '<label>Data<input type="date" name="date" value="' + esc(deal.date || today()) + '"></label>' +
      '<label>Stato<select name="status">' + options(["Aperta","In trattativa","Offerta inviata","In attesa","Confermata","Chiusa","Persa","Annullata"], deal.status) + '</select></label>' +
      '<label>Valuta<select name="currency">' + options(["EUR","RON","USD","GBP","CHF"], deal.currency) + '</select></label>' +
      '<label class="half">Cliente<input name="client" list="pms253-clients" value="' + esc(deal.client) + '"></label>' +
      '<label class="half">Fornitore<input name="supplier" list="pms253-suppliers" value="' + esc(deal.supplier) + '"></label>' +
      '<label class="half">Prodotto<input name="product" list="pms253-products" value="' + esc(deal.product) + '"></label>' +
      '<label>Quantita totale operazione<input type="number" step="0.001" name="totalQuantity" value="' + esc(deal.totalQuantity) + '"></label>' +
      '<label>Tipo unita<select name="unitType">' + options(["kg","ton","pallet","camion","container","cartoni","pezzi","forme intere","litri","servizio"], deal.unitType) + '</select></label>' +
      '<label>Forme intere<input type="number" step="1" name="wholeWheels" value="' + esc(deal.wholeWheels) + '"></label>' +
      '<label>Prezzo<input type="number" step="0.0001" name="unitPrice" value="' + esc(deal.unitPrice) + '"></label>' +
      '<label>Commissione Parmitalia %<input type="number" step="0.01" name="parmitaliaCommissionPct" value="' + esc(deal.parmitaliaCommissionPct) + '"></label>' +
      '<label class="half">Pagamento commissione<select name="commissionPaymentType">' + options(["All'incasso cliente","Alla conferma ordine","Alla fatturazione","Alla consegna merce","Dopo pagamento fornitore","Mensile fine mese","Anticipo + saldo","A saldo operazione","Altro da concordare"], deal.commissionPaymentType) + '</select></label>' +
      '<label>Metodo pagamento<select name="commissionPaymentMethod">' + options(["Bonifico bancario","Fattura provvigione","Nota provvigione","Compensazione commerciale","Contanti","Altro"], deal.commissionPaymentMethod) + '</select></label>' +
      '<label class="half">Prossima azione<input name="nextAction" value="' + esc(deal.nextAction) + '"></label>' +
      '<label class="full">Nota provvigione Parmitalia<textarea name="commissionNote">' + esc(deal.commissionNote) + '</textarea></label>' +
      '<label class="full">Note interne operazione<textarea name="notes">' + esc(deal.notes) + '</textarea></label>' +
      '<div class="pms253-modal-actions"><button type="button" class="secondary-button" data-pms253-close>Annulla</button><button type="submit" class="primary-button">Salva</button></div>' +
      '</form>';
  }
  function readForm(form, old){
    var data = Object.assign({}, old || {});
    Array.prototype.forEach.call(form.elements, function(el){
      if (el.name) data[el.name] = el.value;
    });
    data.updatedAt = new Date().toISOString();
    return normalizeDeal(data);
  }
  function closeModal(){
    document.querySelectorAll(".pms253-modal-backdrop").forEach(function(node){ node.remove(); });
  }
  function openModal253(id){
    ensure(); css();
    var old = arr(state[STORE]).find(function(item){ return String(item.id) === String(id || ""); });
    var wrap = document.createElement("div");
    wrap.className = "pms253-modal-backdrop";
    wrap.innerHTML = '<div class="pms253-modal"><div class="pms253-modal-head"><h3>' + esc(old ? "Modifica operazione brokeraggio" : "Nuova operazione brokeraggio") + '</h3><button type="button" class="secondary-button" data-pms253-close>Chiudi</button></div>' + formHtml(old) + '</div>';
    closeModal();
    document.body.appendChild(wrap);
    wrap.querySelectorAll("[data-pms253-close]").forEach(function(button){ button.onclick = closeModal; });
    wrap.querySelector("#pms253-form").onsubmit = function(event){
      event.preventDefault();
      var row = readForm(event.currentTarget, old);
      if (!row.client && !row.supplier) return alert("Inserisci cliente o fornitore.");
      if (!row.product) return alert("Inserisci il prodotto.");
      var list = arr(state[STORE]).map(normalizeDeal);
      var index = list.findIndex(function(item){ return String(item.id) === String(row.id); });
      if (index >= 0) list[index] = row; else list.unshift(row);
      state[STORE] = list;
      saveState();
      closeModal();
      renderCurrent();
    };
  }
  function deleteDeal(id){
    ensure();
    var row = arr(state[STORE]).find(function(item){ return String(item.id) === String(id); });
    if (!row) return;
    if (!confirm("Eliminare questa operazione di brokeraggio?")) return;
    state[STORE] = arr(state[STORE]).filter(function(item){ return String(item.id) !== String(id); });
    saveState();
    renderCurrent();
  }
  function printHtml(deal, type){
    deal = normalizeDeal(deal);
    var internal = type === "internal";
    var title = internal ? "BROKERAGGIO COMMERCIALE - STAMPA INTERNA" : (type === "supplier" ? "BROKERAGGIO COMMERCIALE - STAMPA FORNITORE" : "BROKERAGGIO COMMERCIALE - STAMPA CLIENTE");
    var commissionLine = internal ? commissionText(deal, true) : commissionText(deal, false);
    var valueRows = internal
      ? '<tr><th>Valore totale operazione</th><td>' + esc(money(operationValue(deal), deal.currency)) + '</td><th>Guadagno operazione Parmitalia</th><td><strong>' + esc(money(commissionAmount(deal), deal.currency)) + '</strong></td></tr>'
      : '';
    return '<div class="print-document">' + header(title, deal.id, internal ? "Documento interno riservato" : "Documento esterno senza importo guadagno") +
      '<table class="print-table"><tr><th>Cliente</th><td>' + esc(deal.client || "-") + '</td><th>Fornitore</th><td>' + esc(deal.supplier || "-") + '</td></tr>' +
      '<tr><th>Prodotto</th><td>' + esc(deal.product || "-") + '</td><th>Stato</th><td>' + esc(deal.status || "-") + '</td></tr>' +
      '<tr><th>Quantita totale operazione</th><td>' + esc(deal.totalQuantity || "-") + '</td><th>Tipo unita</th><td>' + esc(deal.unitType || "-") + '</td></tr>' +
      '<tr><th>Forme intere</th><td>' + esc(deal.wholeWheels || "-") + '</td><th>Prezzo</th><td>' + esc(money(deal.unitPrice, deal.currency)) + '</td></tr>' +
      valueRows +
      '<tr><th>Commissione Parmitalia</th><td colspan="3">' + esc(commissionLine) + '</td></tr>' +
      '<tr><th>Pagamento commissione</th><td>' + esc(deal.commissionPaymentType || "-") + '</td><th>Metodo</th><td>' + esc(deal.commissionPaymentMethod || "-") + '</td></tr>' +
      (internal ? '<tr><th>Prossima azione</th><td colspan="3">' + esc(deal.nextAction || "-") + '</td></tr><tr><th>Note interne</th><td colspan="3">' + esc(deal.notes || "-") + '</td></tr>' : '') +
      '</table><div class="print-footer">' + esc(internal ? "Uso interno Parmitalia - importo guadagno visibile solo internamente" : "Documento per cliente/fornitore - importo guadagno non esposto") + ' - ' + esc(deal.id) + '</div></div>';
  }
  function printDeal(id, type){
    var deal = arr(state[STORE]).find(function(item){ return String(item.id) === String(id); });
    if (!deal) return alert("Operazione non trovata.");
    openPrintSafe(printHtml(deal, type || "internal"));
  }
  function rowHtml(deal){
    deal = normalizeDeal(deal);
    return '<tr><td><span class="code-block">' + esc(deal.id) + '</span><small>' + esc(deal.date) + '</small></td>' +
      '<td><strong>' + esc(deal.client || "-") + '</strong><small>Fornitore: ' + esc(deal.supplier || "-") + '</small></td>' +
      '<td><strong>' + esc(deal.product || "-") + '</strong><small>' + esc(deal.totalQuantity || "-") + ' ' + esc(deal.unitType || "") + ' - Forme intere: ' + esc(deal.wholeWheels || "-") + '</small></td>' +
      '<td><strong>' + esc(money(deal.unitPrice, deal.currency)) + '</strong><small>Valore: ' + esc(money(operationValue(deal), deal.currency)) + '</small></td>' +
      '<td><strong>' + esc(deal.parmitaliaCommissionPct || "0") + '%</strong><small>' + esc(deal.commissionPaymentType || "-") + '</small></td>' +
      '<td>' + esc(deal.status || "Aperta") + '<small>' + esc(deal.nextAction || "") + '</small></td>' +
      '<td><div class="pms253-actions"><button class="inline-button" data-pms253-edit="' + esc(deal.id) + '">Modifica</button><button class="inline-button" data-pms253-print-internal="' + esc(deal.id) + '">Stampa interna</button><button class="inline-button" data-pms253-print-client="' + esc(deal.id) + '">Stampa cliente</button><button class="inline-button" data-pms253-print-supplier="' + esc(deal.id) + '">Stampa fornitore</button><button class="inline-button danger-button" data-pms253-delete="' + esc(deal.id) + '">Elimina</button></div></td></tr>';
  }
  function pageHtml(){
    ensure(); css();
    var rows = arr(state[STORE]).map(normalizeDeal);
    var totalQty = rows.reduce(function(sum, row){ return sum + num(row.totalQuantity); }, 0);
    var totalValue = rows.reduce(function(sum, row){ return sum + operationValue(row); }, 0);
    var totalGain = rows.reduce(function(sum, row){ return sum + commissionAmount(row); }, 0);
    return '<div class="pms253-page"><section class="pms253-hero"><div><span>BRK</span><h3>Brokeraggio commerciale</h3><p>Operazioni con quantita totale, tipo unita, forme intere, prezzo e commissione Parmitalia.</p></div><div class="pms253-actions"><button class="primary-button" data-pms253-new>+ Nuova operazione</button></div></section>' +
      '<div class="pms253-grid"><div class="pms253-kpi"><span>Operazioni</span><strong>' + rows.length + '</strong></div><div class="pms253-kpi"><span>Quantita totale</span><strong>' + esc(totalQty.toLocaleString("it-IT")) + '</strong></div><div class="pms253-kpi"><span>Valore stimato</span><strong>' + esc(money(totalValue, "EUR")) + '</strong></div><div class="pms253-kpi"><span>Guadagno interno</span><strong>' + esc(money(totalGain, "EUR")) + '</strong></div></div>' +
      '<section class="pms253-panel"><div class="pms253-table"><table><thead><tr><th>Protocollo</th><th>Cliente / Fornitore</th><th>Prodotto / Quantita</th><th>Prezzo</th><th>Commissione Parmitalia</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows.map(rowHtml).join("") || '<tr><td colspan="7" class="empty">Nessuna operazione di brokeraggio registrata.</td></tr>') + '</tbody></table></div></section></div>';
  }
  function bind(){
    document.querySelectorAll("[data-pms253-new]").forEach(function(button){ button.onclick = function(){ openModal253(); }; });
    document.querySelectorAll("[data-pms253-edit]").forEach(function(button){ button.onclick = function(){ openModal253(button.getAttribute("data-pms253-edit")); }; });
    document.querySelectorAll("[data-pms253-delete]").forEach(function(button){ button.onclick = function(){ deleteDeal(button.getAttribute("data-pms253-delete")); }; });
    document.querySelectorAll("[data-pms253-print-internal]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms253-print-internal"), "internal"); }; });
    document.querySelectorAll("[data-pms253-print-client]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms253-print-client"), "client"); }; });
    document.querySelectorAll("[data-pms253-print-supplier]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms253-print-supplier"), "supplier"); }; });
  }
  function renderCurrent(){
    var pageState = window.current || (typeof current !== "undefined" ? current : null);
    if (!pageState || pageState.page !== MODULE) return false;
    var content = document.getElementById("content");
    if (!content) return false;
    var title = document.getElementById("page-title");
    var subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = "Brokeraggio commerciale";
    if (subtitle) subtitle.textContent = "Quantita, forme intere, prezzo e commissione Parmitalia";
    content.innerHTML = pageHtml();
    bind();
    return true;
  }
  function wrapRender(){
    var original = window.render;
    if (typeof original !== "function" || original.__pms253Brokerage) return;
    var wrapped = function(){
      ensure();
      if (renderCurrent()) return true;
      var result = original.apply(this, arguments);
      setTimeout(function(){ try { if (current && current.page === MODULE) { renderCurrent(); } } catch (_) {} }, 80);
      return result;
    };
    wrapped.__pms253Brokerage = true;
    window.render = wrapped;
    try { render = wrapped; } catch (_) {}
  }
  function wrapSetPage(){
    var original = window.setPage;
    if (typeof original !== "function" || original.__pms253Brokerage) return;
    var wrapped = function(page){
      if (page === MODULE) {
        var pageState = window.current || (typeof current !== "undefined" ? current : {});
        pageState.page = MODULE;
        pageState.filters = pageState.filters || {};
        window.current = pageState;
        try { current = pageState; } catch (_) {}
        renderCurrent();
        return true;
      }
      return original.apply(this, arguments);
    };
    wrapped.__pms253Brokerage = true;
    window.setPage = wrapped;
    try { setPage = wrapped; } catch (_) {}
  }
  function install(){
    ensure();
    css();
    wrapRender();
    wrapSetPage();
    document.addEventListener("click", function(event){
      var close = event.target && event.target.closest && event.target.closest("[data-pms253-close]");
      if (close) {
        event.preventDefault();
        closeModal();
      }
    }, true);
    try {
      var pageState = window.current || (typeof current !== "undefined" ? current : null);
      if (pageState && pageState.page === MODULE) renderCurrent();
    } catch (_) {}
    window.PMS_V253_BROKERAGE_QUANTITY_COMMISSION_PRINTS = {
      version: VERSION,
      render: renderCurrent,
      open: openModal253,
      print: printDeal
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
