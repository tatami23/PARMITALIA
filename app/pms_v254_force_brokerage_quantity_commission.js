(function(){
  "use strict";

  var VERSION = "pms_v254_force_brokerage_quantity_commission";
  var STORE = "brokerageDeals";
  var MODULE = "commercialBrokerage";

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
  function appState(){
    try { if (typeof state !== "undefined" && state) return state; } catch (_) {}
    window.state = window.state || {};
    return window.state;
  }
  function currentPage(){
    try { if (typeof current !== "undefined" && current) return current.page || ""; } catch (_) {}
    return window.current && window.current.page || "";
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
  function normalizeDeal(item, data){
    item = item && typeof item === "object" ? item : {};
    var quantity = item.totalQuantity != null && item.totalQuantity !== "" ? item.totalQuantity : (item.quantity != null && item.quantity !== "" ? item.quantity : "");
    var unitPrice = item.unitPrice != null && item.unitPrice !== "" ? item.unitPrice : (item.price != null && item.price !== "" ? item.price : "");
    var commissionPct = item.parmitaliaCommissionPct != null && item.parmitaliaCommissionPct !== "" ? item.parmitaliaCommissionPct : (item.commissionPct != null && item.commissionPct !== "" ? item.commissionPct : item.marginPct);
    return Object.assign({}, item, {
      id: clean(item.id || item.code) || nextCode("BRK", data && data[STORE]),
      date: clean(item.date) || today(),
      client: clean(item.client),
      supplier: clean(item.supplier),
      product: clean(item.product),
      totalQuantity: quantity,
      unitType: clean(item.unitType || item.unit) || "kg",
      wholeWheels: item.wholeWheels != null ? item.wholeWheels : "",
      unitPrice: unitPrice,
      currency: clean(item.currency) || "EUR",
      parmitaliaCommissionPct: commissionPct != null ? commissionPct : "",
      commissionPaymentType: clean(item.commissionPaymentType || item.paymentTerms || item.commissionPaymentTerms) || "All'incasso cliente",
      commissionPaymentMethod: clean(item.commissionPaymentMethod) || "Bonifico bancario",
      commissionNote: clean(item.commissionNote || ""),
      status: clean(item.status) || "Aperta",
      nextAction: clean(item.nextAction),
      notes: clean(item.notes),
      createdAt: clean(item.createdAt) || new Date().toISOString(),
      updatedAt: clean(item.updatedAt)
    });
  }
  function ensure(){
    var data = appState();
    data[STORE] = arr(data[STORE]).map(function(item){ return normalizeDeal(item, data); });
    data.settings = data.settings || {};
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) {
        var module = modules.find(function(item){ return item.id === MODULE; });
        if (module) {
          module.label = "Brokeraggio commerciale";
          module.subtitle = "Quantita totale, tipo unita, forme intere, prezzo e commissione Parmitalia";
        }
      }
    } catch (_) {}
    return data;
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
    var data = appState();
    try { if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    try {
      if (window.PMS_V252_REAL_SAVE && typeof window.PMS_V252_REAL_SAVE.saveNow === "function") {
        window.PMS_V252_REAL_SAVE.saveNow("v254-brokerage-save", { silent: true });
      } else if (window.parmitaliaStorage && typeof window.parmitaliaStorage.save === "function") {
        window.parmitaliaStorage.save(data).catch(function(error){ console.warn(VERSION + " desktop save failed", error); });
      } else if (typeof save === "function") {
        save();
      }
    } catch (error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function css(){
    if (document.getElementById("pms-v254-brokerage-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v254-brokerage-style";
    style.textContent = [
      ".pms254-page{display:grid;gap:14px}",
      ".pms254-hero{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;background:#fff;border:1px solid var(--line,#d7dee8);border-left:5px solid #14532d;border-radius:8px;padding:15px 16px}",
      ".pms254-hero h3{margin:2px 0 6px;color:#0f172a}.pms254-hero p{margin:0;color:#52606d}.pms254-hero span{display:block;color:#14532d;font-size:12px;font-weight:900;text-transform:uppercase}",
      ".pms254-actions{display:flex;gap:7px;flex-wrap:wrap;align-items:center}.pms254-actions button,.pms254-page button{width:auto!important;margin:0!important}",
      ".pms254-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.pms254-kpi{background:#fff;border:1px solid var(--line,#d7dee8);border-radius:8px;padding:12px}.pms254-kpi span{display:block;color:var(--muted,#64748b);font-size:11px;font-weight:900;text-transform:uppercase}.pms254-kpi strong{display:block;margin-top:5px;color:#0f172a;font-size:22px}",
      ".pms254-card{background:#fff;border:1px solid var(--line,#d7dee8);border-radius:8px;padding:14px}.pms254-table{width:100%;border-collapse:collapse}.pms254-table th,.pms254-table td{padding:9px;border-bottom:1px solid var(--line,#e5edf5);text-align:left;vertical-align:top}.pms254-table th{background:#eef4fb;color:var(--muted,#64748b);font-size:11px;text-transform:uppercase}.pms254-table small{display:block;color:var(--muted,#64748b);margin-top:3px}",
      ".pms254-modal{position:fixed;inset:0;z-index:2147483400;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:14px}.pms254-modal-card{width:min(1120px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.32)}",
      ".pms254-modal-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line,#d7dee8);position:sticky;top:0;background:#fff;z-index:2}.pms254-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px;padding:16px}.pms254-form .half{grid-column:span 2}.pms254-form .full{grid-column:1/-1}.pms254-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted,#64748b)}.pms254-form textarea{min-height:100px}.pms254-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}",
      "@media(max-width:900px){.pms254-hero{display:grid}.pms254-form{grid-template-columns:1fr}.pms254-form .half{grid-column:1/-1}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function options(values, current){
    return values.map(function(value){
      return '<option value="' + esc(value) + '" ' + (String(value) === String(current || "") ? "selected" : "") + '>' + esc(value) + '</option>';
    }).join("");
  }
  function datalist(id, items){
    return '<datalist id="' + esc(id) + '">' + Array.from(new Set(items)).sort().map(function(name){ return '<option value="' + esc(name) + '"></option>'; }).join("") + '</datalist>';
  }
  function contactNames(data){
    var names = [];
    arr(data.contacts).concat(arr(data.clients), arr(data.suppliers)).forEach(function(c){
      var name = c && (c.name || c.company || c.businessName || c.client || c.supplier);
      if (name) names.push(name);
    });
    return names;
  }
  function productNames(data){
    var names = [];
    arr(data.products).forEach(function(p){ if (p && (p.name || p.product || p.code)) names.push(p.name || p.product || p.code); });
    arr(data.offers).forEach(function(o){ if (o && o.product) names.push(o.product); });
    arr(data.orders).forEach(function(o){ if (o && o.product) names.push(o.product); });
    return names;
  }
  function formHtml(deal){
    var data = ensure();
    deal = normalizeDeal(deal || { id: nextCode("BRK", data[STORE]), date: today(), currency: "EUR", unitType: "kg", status: "Aperta" }, data);
    return datalist("pms254-contacts", contactNames(data)) + datalist("pms254-products", productNames(data)) +
      '<form id="pms254-form" class="pms254-form">' +
      '<input type="hidden" name="createdAt" value="' + esc(deal.createdAt || new Date().toISOString()) + '">' +
      '<label>Protocollo<input name="id" value="' + esc(deal.id) + '" readonly></label>' +
      '<label>Data<input type="date" name="date" value="' + esc(deal.date || today()) + '"></label>' +
      '<label>Stato<select name="status">' + options(["Aperta","In trattativa","Offerta inviata","In attesa","Confermata","Chiusa","Persa","Annullata"], deal.status) + '</select></label>' +
      '<label>Valuta<select name="currency">' + options(["EUR","RON","USD","GBP","CHF"], deal.currency) + '</select></label>' +
      '<label class="half">Cliente<input name="client" list="pms254-contacts" value="' + esc(deal.client) + '"></label>' +
      '<label class="half">Fornitore<input name="supplier" list="pms254-contacts" value="' + esc(deal.supplier) + '"></label>' +
      '<label class="half">Prodotto<input name="product" list="pms254-products" value="' + esc(deal.product) + '"></label>' +
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
      '<div class="pms254-modal-actions"><button type="button" class="secondary-button" data-pms254-close>Annulla</button><button type="submit" class="primary-button">Salva</button></div>' +
      '</form>';
  }
  function closeModal(){
    document.querySelectorAll(".pms254-modal").forEach(function(node){ node.remove(); });
  }
  function openModal(id){
    var data = ensure();
    var old = arr(data[STORE]).find(function(item){ return String(item.id) === String(id || ""); });
    closeModal();
    var wrap = document.createElement("div");
    wrap.className = "pms254-modal";
    wrap.innerHTML = '<div class="pms254-modal-card"><div class="pms254-modal-head"><h3>' + esc(old ? "Modifica operazione brokeraggio" : "Nuova operazione brokeraggio") + '</h3><button type="button" class="secondary-button" data-pms254-close>Chiudi</button></div>' + formHtml(old) + '</div>';
    document.body.appendChild(wrap);
    wrap.querySelector("#pms254-form").onsubmit = function(event){
      event.preventDefault();
      var row = Object.assign({}, old || {});
      Array.prototype.forEach.call(event.currentTarget.elements, function(el){ if (el.name) row[el.name] = el.value; });
      row = normalizeDeal(row, data);
      row.quantity = row.totalQuantity;
      row.unit = row.unitType;
      row.price = row.unitPrice;
      row.commissionPct = row.parmitaliaCommissionPct;
      row.value = operationValue(row) || row.value || "";
      row.updatedAt = new Date().toISOString();
      if (!row.client && !row.supplier) return alert("Inserisci cliente o fornitore.");
      if (!row.product) return alert("Inserisci il prodotto.");
      var list = arr(data[STORE]).map(function(item){ return normalizeDeal(item, data); });
      var index = list.findIndex(function(item){ return String(item.id) === String(row.id); });
      if (index >= 0) list[index] = row; else list.unshift(row);
      data[STORE] = list;
      saveState();
      closeModal();
      renderBrokerage(true);
    };
  }
  function deleteDeal(id){
    var data = ensure();
    if (!confirm("Eliminare questa operazione di brokeraggio?")) return;
    data[STORE] = arr(data[STORE]).filter(function(item){ return String(item.id) !== String(id); });
    saveState();
    renderBrokerage(true);
  }
  function printHeader(title, code, subtitle){
    var data = appState();
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, subtitle || "");
    var settings = data.settings || {};
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(settings.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(subtitle || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function printHtml(deal, type){
    deal = normalizeDeal(deal, appState());
    var internal = type === "internal";
    var title = internal ? "BROKERAGGIO COMMERCIALE - STAMPA INTERNA" : (type === "supplier" ? "BROKERAGGIO COMMERCIALE - STAMPA FORNITORE" : "BROKERAGGIO COMMERCIALE - STAMPA CLIENTE");
    var valueRows = internal ? '<tr><th>Valore totale operazione</th><td>' + esc(money(operationValue(deal), deal.currency)) + '</td><th>Guadagno operazione Parmitalia</th><td><strong>' + esc(money(commissionAmount(deal), deal.currency)) + '</strong></td></tr>' : "";
    return '<div class="print-document">' + printHeader(title, deal.id, internal ? "Documento interno riservato" : "Documento esterno senza importo guadagno") +
      '<table class="print-table"><tr><th>Cliente</th><td>' + esc(deal.client || "-") + '</td><th>Fornitore</th><td>' + esc(deal.supplier || "-") + '</td></tr>' +
      '<tr><th>Prodotto</th><td>' + esc(deal.product || "-") + '</td><th>Stato</th><td>' + esc(deal.status || "-") + '</td></tr>' +
      '<tr><th>Quantita totale operazione</th><td>' + esc(deal.totalQuantity || "-") + '</td><th>Tipo unita</th><td>' + esc(deal.unitType || "-") + '</td></tr>' +
      '<tr><th>Forme intere</th><td>' + esc(deal.wholeWheels || "-") + '</td><th>Prezzo</th><td>' + esc(money(deal.unitPrice, deal.currency)) + '</td></tr>' +
      valueRows +
      '<tr><th>Commissione Parmitalia</th><td colspan="3">' + esc(commissionText(deal, internal)) + '</td></tr>' +
      '<tr><th>Pagamento commissione</th><td>' + esc(deal.commissionPaymentType || "-") + '</td><th>Metodo</th><td>' + esc(deal.commissionPaymentMethod || "-") + '</td></tr>' +
      (internal ? '<tr><th>Prossima azione</th><td colspan="3">' + esc(deal.nextAction || "-") + '</td></tr><tr><th>Note interne</th><td colspan="3">' + esc(deal.notes || "-") + '</td></tr>' : '') +
      '</table><div class="print-footer">' + esc(internal ? "Uso interno Parmitalia - importo guadagno visibile solo internamente" : "Documento per cliente/fornitore - importo guadagno non esposto") + ' - ' + esc(deal.id) + '</div></div>';
  }
  function printDeal(id, type){
    var deal = arr(appState()[STORE]).find(function(item){ return String(item.id) === String(id); });
    if (!deal) return alert("Operazione non trovata.");
    var html = printHtml(deal, type || "internal");
    if (typeof openPrint === "function") openPrint(html);
    else {
      var root = document.getElementById("print-root");
      if (root) root.innerHTML = html;
      window.print();
    }
  }
  function rowHtml(deal){
    deal = normalizeDeal(deal, appState());
    return '<tr><td><span class="code-block">' + esc(deal.id) + '</span><br><small>' + esc(deal.date) + '</small></td>' +
      '<td><strong>' + esc(deal.client || "-") + '</strong><br><small>Fornitore: ' + esc(deal.supplier || "-") + '</small></td>' +
      '<td><strong>' + esc(deal.product || "-") + '</strong><br><small>' + esc(deal.totalQuantity || "-") + ' ' + esc(deal.unitType || "") + ' - Forme intere: ' + esc(deal.wholeWheels || "-") + '</small></td>' +
      '<td><strong>' + esc(money(deal.unitPrice, deal.currency)) + '</strong><br><small>Valore: ' + esc(money(operationValue(deal), deal.currency)) + '</small></td>' +
      '<td><strong>' + esc(deal.parmitaliaCommissionPct || "0") + '%</strong><br><small>' + esc(deal.commissionPaymentType || "-") + '</small></td>' +
      '<td>' + esc(deal.status || "Aperta") + '<br><small>' + esc(deal.nextAction || "") + '</small></td>' +
      '<td><div class="pms254-actions"><button class="inline-button" data-pms254-edit="' + esc(deal.id) + '">Modifica</button><button class="inline-button" data-pms254-print-internal="' + esc(deal.id) + '">Stampa interna</button><button class="inline-button" data-pms254-print-client="' + esc(deal.id) + '">Stampa cliente</button><button class="inline-button" data-pms254-print-supplier="' + esc(deal.id) + '">Stampa fornitore</button><button class="inline-button danger-button" data-pms254-delete="' + esc(deal.id) + '">Elimina</button></div></td></tr>';
  }
  function renderBrokerage(force){
    var content = document.getElementById("content");
    if (!content) return false;
    if (!force && currentPage() !== MODULE && !/Brokeraggio/i.test((document.getElementById("page-title") || {}).textContent || "")) return false;
    if (!force && content.dataset.pms254Brokerage === "active") return true;
    var data = ensure();
    var rows = arr(data[STORE]).map(function(item){ return normalizeDeal(item, data); });
    var totalQty = rows.reduce(function(sum, row){ return sum + num(row.totalQuantity); }, 0);
    var totalValue = rows.reduce(function(sum, row){ return sum + operationValue(row); }, 0);
    var totalGain = rows.reduce(function(sum, row){ return sum + commissionAmount(row); }, 0);
    var title = document.getElementById("page-title");
    var subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = "Brokeraggio commerciale";
    if (subtitle) subtitle.textContent = "Quantita totale, forme intere, prezzo e commissione Parmitalia";
    content.dataset.pms254Brokerage = "active";
    content.innerHTML = '<div class="pms254-page"><section class="pms254-hero"><div><span>BRK</span><h3>Brokeraggio commerciale</h3><p>Operazioni con quantita totale, tipo unita, forme intere, prezzo e commissione Parmitalia.</p></div><div class="pms254-actions"><button class="primary-button" data-pms254-new>+ Nuova operazione</button></div></section>' +
      '<div class="pms254-grid"><div class="pms254-kpi"><span>Operazioni</span><strong>' + rows.length + '</strong></div><div class="pms254-kpi"><span>Quantita totale</span><strong>' + esc(totalQty.toLocaleString("it-IT")) + '</strong></div><div class="pms254-kpi"><span>Valore stimato</span><strong>' + esc(money(totalValue, "EUR")) + '</strong></div><div class="pms254-kpi"><span>Guadagno interno</span><strong>' + esc(money(totalGain, "EUR")) + '</strong></div></div>' +
      '<div class="pms254-card"><div class="table-wrap"><table class="pms254-table"><thead><tr><th>Protocollo</th><th>Cliente / Fornitore</th><th>Prodotto / Quantita</th><th>Prezzo</th><th>Commissione Parmitalia</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows.map(rowHtml).join("") || '<tr><td colspan="7">Nessuna operazione di brokeraggio registrata.</td></tr>') + '</tbody></table></div></div></div>';
    return true;
  }

  css();
  document.addEventListener("click", function(event){
    var target = event.target && event.target.closest && event.target.closest("[data-pms254-new],[data-pms254-edit],[data-pms254-delete],[data-pms254-print-internal],[data-pms254-print-client],[data-pms254-print-supplier],[data-pms254-close],[data-pms117-brk-new],[data-pms117-brk-edit],[data-pms117-brk-delete],[data-pms117-brk-print]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    if (target.hasAttribute("data-pms254-close")) { closeModal(); return; }
    if (target.hasAttribute("data-pms254-new") || target.hasAttribute("data-pms117-brk-new")) { openModal(); return; }
    if (target.hasAttribute("data-pms254-edit")) { openModal(target.getAttribute("data-pms254-edit")); return; }
    if (target.hasAttribute("data-pms117-brk-edit")) { openModal(target.getAttribute("data-pms117-brk-edit")); return; }
    if (target.hasAttribute("data-pms254-delete")) { deleteDeal(target.getAttribute("data-pms254-delete")); return; }
    if (target.hasAttribute("data-pms117-brk-delete")) { deleteDeal(target.getAttribute("data-pms117-brk-delete")); return; }
    if (target.hasAttribute("data-pms254-print-internal")) { printDeal(target.getAttribute("data-pms254-print-internal"), "internal"); return; }
    if (target.hasAttribute("data-pms254-print-client")) { printDeal(target.getAttribute("data-pms254-print-client"), "client"); return; }
    if (target.hasAttribute("data-pms254-print-supplier")) { printDeal(target.getAttribute("data-pms254-print-supplier"), "supplier"); return; }
    if (target.hasAttribute("data-pms117-brk-print")) { printDeal(target.getAttribute("data-pms117-brk-print"), "internal"); }
  }, true);
  try {
    var observer = new MutationObserver(function(){ setTimeout(function(){ try { renderBrokerage(false); } catch (error) { console.warn(VERSION, error); } }, 40); });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (_) {}
  setInterval(function(){ try { renderBrokerage(false); } catch (error) { console.warn(VERSION, error); } }, 500);
  setTimeout(function(){ try { renderBrokerage(false); } catch (_) {} }, 100);
  setTimeout(function(){ try { renderBrokerage(false); } catch (_) {} }, 1000);

  window.PMS_V254_FORCE_BROKERAGE_QUANTITY_COMMISSION = {
    version: VERSION,
    render: function(){ return renderBrokerage(true); },
    open: openModal,
    print: printDeal
  };
  console.info(VERSION + " loaded");
})();
