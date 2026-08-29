(function(){
  "use strict";

  var VERSION = "pms_v220_orders_destination_final_fix";
  var ORDER = "orders";
  var INCOTERMS = ["EXW","FCA","FOB","CFR","CIF","DAP","DPU","DDP","Groupage","Camion completo","Container 20'","Container 40' reefer","Da definire"];

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function st(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.settings = state.settings || {};
    window.schemas = window.schemas || {};
    return state;
  }
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
    for (var i = 0; i < keys.length; i += 1) {
      var value = clean(item && item[keys[i]]);
      if (value) return value;
    }
    return "";
  }
  function destination(order){
    return first(order, ["destination","orderDestination","deliveryDestination","shipTo","unloadingPlace","deliveryPlace","destinationAddress","customerDestination","finalDestination"]);
  }
  function code(order){ return first(order, ["code","orderCode","id"]) || "-"; }
  function num(value){
    var n = Number(String(value || "").replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(value, currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function total(order){ return num(order && order.quantity) * num(order && order.unitPrice); }
  function makeCode(){
    if (typeof nextSequentialCode === "function") return nextSequentialCode("ORD", st().orders);
    var year = new Date().getFullYear();
    return "ORD-" + year + "-" + String(st().orders.length + 1).padStart(4, "0");
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function upsertField(fields, key, field, afterKey){
    var existing = fields.find(function(f){ return f && f.key === key; });
    if (existing) Object.assign(existing, field, {key:key});
    else {
      existing = Object.assign({key:key}, field);
      var index = fields.findIndex(function(f){ return f && f.key === afterKey; });
      fields.splice(index >= 0 ? index + 1 : fields.length, 0, existing);
    }
    return existing;
  }
  function ensureSchema(){
    st();
    if (!schemas[ORDER]) schemas[ORDER] = {title:"Ordine / Richiesta cliente", fields:[]};
    var fields = arr(schemas[ORDER].fields);
    schemas[ORDER].title = "Ordine / Richiesta cliente";
    upsertField(fields, "orderType", {label:"Tipo ordine", type:"select", options:["Ordine spot","Ordine continuativo","Ordine quadro","Ricerca prodotto","Campionatura","Previsione cliente"], required:true}, "");
    upsertField(fields, "client", {label:"Cliente", type:"text", required:true}, "orderType");
    upsertField(fields, "supplier", {label:"Fornitore", type:"text"}, "client");
    upsertField(fields, "destination", {label:"DESTINAZIONE MERCE / indirizzo scarico", type:"text", required:true}, "supplier");
    upsertField(fields, "customerOrderNumber", {label:"Numero ordine cliente / riferimento cliente", type:"text"}, "destination");
    upsertField(fields, "product", {label:"Prodotto / articolo", type:"text", required:true}, "customerOrderNumber");
    upsertField(fields, "description", {label:"Descrizione richiesta", type:"textarea", full:true}, "product");
    upsertField(fields, "quantity", {label:"Quantita", type:"number"}, "description");
    upsertField(fields, "unit", {label:"Unita", type:"select", options:["kg","ton","pezzi","cartoni","box","pallet","camion","container","litri"]}, "quantity");
    upsertField(fields, "unitPrice", {label:"Prezzo indicativo", type:"number"}, "unit");
    upsertField(fields, "currency", {label:"Valuta", type:"select", options:(window.currencyOptions || ["EUR","RON","USD","GBP"])}, "unitPrice");
    upsertField(fields, "paymentTerms", {label:"Pagamento", type:"select", options:(window.paymentOptions || ["Anticipato","Alla consegna","30 giorni","60 giorni","Da definire"])}, "currency");
    upsertField(fields, "delivery", {label:"Incoterms / resa commerciale (non destinazione)", type:"select", options:INCOTERMS}, "paymentTerms");
    upsertField(fields, "expectedDelivery", {label:"Data consegna prevista", type:"date"}, "delivery");
    upsertField(fields, "status", {label:"Stato", type:"select", options:["Nuovo","In analisi","Confermato","In evasione","Fatturato","Chiuso","Annullato"]}, "expectedDelivery");
    upsertField(fields, "notes", {label:"Note operative", type:"textarea", full:true}, "status");
    var preferred = ["orderType","client","supplier","destination","customerOrderNumber","product","description","quantity","unit","unitPrice","currency","paymentTerms","delivery","frequency","requestedDate","expectedDelivery","linkedOffer","invoiceReference","status","notes"];
    fields.sort(function(a,b){
      var ia = preferred.indexOf(a.key), ib = preferred.indexOf(b.key);
      ia = ia < 0 ? 999 : ia; ib = ib < 0 ? 999 : ib;
      return ia - ib;
    });
    schemas[ORDER].fields = fields;
    if (Array.isArray(window.modules) && !modules.find(function(m){ return m.id === ORDER; })) {
      var idx = modules.findIndex(function(m){ return m.id === "offers"; });
      modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, {id:ORDER, label:"Ordini", subtitle:"Inserimento ordini con destinazione merce obbligatoria", roles:["admin","assistant","accountant"]});
    }
  }
  function normalizeOrders(){
    ensureSchema();
    st().orders.forEach(function(order){
      var dest = destination(order);
      if (dest) {
        order.destination = dest;
        order.orderDestination = dest;
        order.deliveryDestination = dest;
        order.shipTo = dest;
        order.unloadingPlace = dest;
      }
      if (!clean(order.code)) order.code = code(order) !== "-" ? code(order) : makeCode();
      if (!clean(order.status)) order.status = "Nuovo";
    });
  }

  function injectCss(){
    var style = document.getElementById("pms-v220-orders-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v220-orders-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms220-quick-order{background:#fff;border:2px solid #1f4e78;border-radius:10px;padding:12px;margin:0 0 14px;box-shadow:0 8px 20px rgba(15,23,42,.08)}",
      ".pms220-quick-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;color:#172033}",
      ".pms220-quick-head h3{margin:0;font-size:18px;color:#0f172a;letter-spacing:0}.pms220-quick-head p{margin:4px 0 0;color:#526172;font-size:13px;line-height:1.35}",
      ".pms220-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:9px}.pms220-grid label{display:grid;gap:4px;font-size:12px;font-weight:900;color:#334155}",
      ".pms220-grid input,.pms220-grid select,.pms220-grid textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:7px;padding:8px;background:#fff;color:#0f172a;font:inherit;font-size:13px}",
      ".pms220-grid .full{grid-column:1/-1}.pms220-destination-input{border:2px solid #1f4e78!important;background:#eef6ff!important;font-weight:900!important}",
      ".pms220-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:10px}.pms220-help{background:#eef6ff;border-left:5px solid #1f4e78;color:#17324d;border-radius:7px;padding:8px;font-size:12px;font-weight:800}",
      ".pms220-dest-cell{background:#eef6ff!important;color:#0f172a!important;font-weight:950!important;min-width:180px}.pms220-dest-cell small{display:block;color:#526172;font-weight:800;text-transform:none}",
      ".pms220-missing{background:#fff7ed!important;color:#9a3412!important;font-weight:950!important}",
      "#modal-form[data-pms220-order='1'] .form-field[data-pms220-destination='1']{border:2px solid #1f4e78;background:#eef6ff;border-radius:10px;padding:8px;grid-column:1/-1}",
      "#modal-form[data-pms220-order='1'] .form-field[data-pms220-destination='1'] label{font-size:14px!important;color:#123b63!important;font-weight:950!important}",
      "#modal-form[data-pms220-order='1'] input[name='destination']{font-size:15px!important;font-weight:900!important;background:#fff!important;border:2px solid #1f4e78!important}"
    ].join("\n");
  }

  function val(id){ var el = document.getElementById(id); return el ? clean(el.value) : ""; }
  function quickPanel(){
    return '<div id="pms220-quick-order" class="pms220-quick-order">' +
      '<div class="pms220-quick-head"><div><h3>Inserimento rapido ordine</h3><p>La destinazione merce e separata dagli Incoterms. Scrivi qui il luogo dove deve arrivare/scaricare la merce.</p></div><button class="secondary-button" type="button" data-add="orders">Apri scheda completa</button></div>' +
      '<div class="pms220-grid">' +
        '<label>Cliente<input id="pms220-client" placeholder="Cliente" required></label>' +
        '<label>Fornitore<input id="pms220-supplier" placeholder="Fornitore"></label>' +
        '<label class="full">DESTINAZIONE MERCE / indirizzo scarico<input id="pms220-destination" class="pms220-destination-input" placeholder="Es. Magazzino cliente, citta, indirizzo, paese" required></label>' +
        '<label>Prodotto<input id="pms220-product" placeholder="Prodotto / articolo" required></label>' +
        '<label>Quantita<input id="pms220-quantity" type="number" step="any" placeholder="0"></label>' +
        '<label>Unita<select id="pms220-unit"><option>kg</option><option>ton</option><option>pallet</option><option>cartoni</option><option>camion</option><option>container</option></select></label>' +
        '<label>Prezzo indicativo<input id="pms220-unit-price" type="number" step="any" placeholder="0.00"></label>' +
        '<label>Valuta<select id="pms220-currency"><option>EUR</option><option>RON</option><option>USD</option><option>GBP</option></select></label>' +
        '<label>Incoterms / resa<select id="pms220-delivery">' + INCOTERMS.map(function(x){ return '<option>' + esc(x) + '</option>'; }).join("") + '</select></label>' +
        '<label>Consegna prevista<input id="pms220-expected" type="date"></label>' +
        '<label class="full">Note<textarea id="pms220-notes" placeholder="Note operative ordine"></textarea></label>' +
      '</div>' +
      '<div class="pms220-actions"><button class="primary-button" type="button" data-pms220-save-order>Salva ordine</button><span class="pms220-help">Campo da compilare per far comparire la destinazione: DESTINAZIONE MERCE / indirizzo scarico.</span></div>' +
    '</div>';
  }
  function saveQuickOrder(){
    var client = val("pms220-client");
    var product = val("pms220-product");
    var dest = val("pms220-destination");
    if (!client || !product || !dest) {
      alert("Compila Cliente, Prodotto e DESTINAZIONE MERCE. Sono i tre campi necessari per salvare l'ordine.");
      return;
    }
    var newId = makeCode();
    var item = {
      id:newId,
      code:newId,
      orderType:"Ordine spot",
      client:client,
      supplier:val("pms220-supplier"),
      destination:dest,
      orderDestination:dest,
      deliveryDestination:dest,
      shipTo:dest,
      unloadingPlace:dest,
      product:product,
      quantity:num(val("pms220-quantity")),
      unit:val("pms220-unit") || "kg",
      unitPrice:num(val("pms220-unit-price")),
      currency:val("pms220-currency") || "EUR",
      delivery:val("pms220-delivery") || "Da definire",
      requestedDate:today(),
      expectedDelivery:val("pms220-expected"),
      status:"Nuovo",
      notes:val("pms220-notes")
    };
    st().orders.unshift(item);
    saveNow("v220-quick-order");
    if (typeof render === "function") render();
    alert("Ordine salvato con destinazione merce: " + dest);
  }

  function decorateOrderForm(){
    var form = document.getElementById("modal-form");
    if (!form || form.dataset.pms220Order !== "1") return;
    var dest = form.elements && form.elements.destination;
    if (!dest) {
      var supplier = form.elements && form.elements.supplier;
      var holder = document.createElement("div");
      holder.className = "form-field full";
      holder.dataset.pms220Destination = "1";
      holder.innerHTML = '<label>DESTINAZIONE MERCE / indirizzo scarico</label><input name="destination" type="text" required placeholder="Es. magazzino cliente, citta, indirizzo, paese">';
      if (supplier && supplier.closest(".form-field")) supplier.closest(".form-field").insertAdjacentElement("afterend", holder);
    } else {
      var wrap = dest.closest(".form-field");
      if (wrap) wrap.dataset.pms220Destination = "1";
      dest.required = true;
      dest.placeholder = "Es. magazzino cliente, citta, indirizzo, paese";
    }
    var delivery = form.elements && form.elements.delivery;
    if (delivery) {
      var dw = delivery.closest(".form-field");
      var label = dw && dw.querySelector("label");
      if (label) label.textContent = "Incoterms / resa commerciale (non destinazione)";
    }
    if (!form.querySelector(".pms220-help")) {
      form.insertAdjacentHTML("afterbegin", '<div class="form-field full pms220-help">Attenzione: la destinazione che compare negli ordini si inserisce nel campo blu "DESTINAZIONE MERCE / indirizzo scarico". Il campo Incoterms serve solo per EXW/FCA/DAP/DDP ecc.</div>');
    }
  }
  function formDestination(form){
    var value = clean(form && form.elements && form.elements.destination && form.elements.destination.value);
    return value;
  }
  function applyDestinationToLatest(id, dest){
    if (!dest) return;
    var order = st().orders.find(function(o){ return clean(o.id) === clean(id) || clean(o.code) === clean(id); }) || st().orders[0];
    if (!order) return;
    order.destination = dest;
    order.orderDestination = dest;
    order.deliveryDestination = dest;
    order.shipTo = dest;
    order.unloadingPlace = dest;
    saveNow("v220-destination-submit");
  }

  function findOrderFromRow(row, index){
    var codeText = row && row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return st().orders.find(function(o){ return clean(code(o)) === codeText || clean(o.id) === codeText; }) || st().orders[index] || null;
  }
  function decorateOrdersPage(){
    if (!window.current || current.page !== ORDER) return;
    injectCss();
    normalizeOrders();
    var content = document.getElementById("content");
    if (!content) return;
    if (!document.getElementById("pms220-quick-order")) {
      content.insertAdjacentHTML("afterbegin", quickPanel());
    }
    var saveBtn = document.querySelector("[data-pms220-save-order]");
    if (saveBtn && saveBtn.dataset.pms220Bound !== "1") {
      saveBtn.dataset.pms220Bound = "1";
      saveBtn.onclick = saveQuickOrder;
    }
    var table = content.querySelector("table");
    if (!table) return;
    var headerRow = table.querySelector("thead tr");
    if (!headerRow) return;
    var headers = Array.from(headerRow.children).map(function(th){ return clean(th.textContent).toLowerCase(); });
    var destIndex = headers.findIndex(function(h){ return h.indexOf("destinazione") >= 0; });
    var supplierIndex = headers.findIndex(function(h){ return h.indexOf("fornitore") >= 0; });
    var productIndex = headers.findIndex(function(h){ return h.indexOf("prodotto") >= 0; });
    if (destIndex < 0) {
      var th = document.createElement("th");
      th.textContent = "Destinazione merce";
      var after = supplierIndex >= 0 ? headerRow.children[supplierIndex] : headerRow.children[Math.max(0, productIndex - 1)];
      if (after && after.nextSibling) headerRow.insertBefore(th, after.nextSibling);
      else headerRow.appendChild(th);
      destIndex = Array.from(headerRow.children).indexOf(th);
    } else {
      headerRow.children[destIndex].textContent = "Destinazione merce";
    }
    Array.from(table.querySelectorAll("tbody tr")).forEach(function(row, index){
      if (!row.children.length || row.children.length === 1) return;
      var order = findOrderFromRow(row, index);
      var dest = destination(order);
      var cell = row.children[destIndex];
      if (!cell || row.children.length < headerRow.children.length) {
        cell = document.createElement("td");
        var rowAfter = supplierIndex >= 0 ? row.children[supplierIndex] : row.children[Math.max(0, productIndex - 1)];
        if (rowAfter && rowAfter.nextSibling) row.insertBefore(cell, rowAfter.nextSibling);
        else row.appendChild(cell);
      }
      cell.className = dest ? "pms220-dest-cell" : "pms220-missing";
      cell.innerHTML = dest ? esc(dest) + "<small>indirizzo / luogo scarico</small>" : "MANCA DESTINAZIONE";
    });
  }

  function columns(module, original){
    if (module !== ORDER || !Array.isArray(original)) return original;
    var preferred = ["code","client","supplier","destination","product","quantity","unit","total","delivery","expectedDelivery","status","printOrder","actions"];
    var rest = original.filter(function(c){ return preferred.indexOf(c) < 0 && c !== "orderDestination" && c !== "deliveryDestination"; });
    return preferred.concat(rest);
  }
  function printOrder(id){
    var order = st().orders.find(function(o){ return clean(o.id) === clean(id) || clean(o.code) === clean(id); });
    if (!order) return alert("Ordine non trovato.");
    var dest = destination(order);
    var html = '<div class="print-document">' +
      (typeof companyPrintHeader === "function" ? companyPrintHeader("MODULO ORDINE", code(order), "Ordine cliente / fornitore") : '<h1>MODULO ORDINE</h1>') +
      '<table class="print-table">' +
      '<tr><th>Codice</th><td>' + esc(code(order)) + '</td><th>Stato</th><td>' + esc(order.status || "Nuovo") + '</td></tr>' +
      '<tr><th>Cliente</th><td>' + esc(order.client || "-") + '</td><th>Fornitore</th><td>' + esc(order.supplier || "-") + '</td></tr>' +
      '<tr><th>DESTINAZIONE MERCE</th><td colspan="3"><strong>' + esc(dest || "MANCA DESTINAZIONE") + '</strong></td></tr>' +
      '<tr><th>Incoterms / resa</th><td>' + esc(order.delivery || "-") + '</td><th>Consegna prevista</th><td>' + esc(order.expectedDelivery || "-") + '</td></tr>' +
      '</table>' +
      '<table class="print-table"><tr><th>Prodotto</th><th>Quantita</th><th>Unita</th><th>Prezzo</th><th>Totale</th></tr>' +
      '<tr><td>' + esc(order.product || "-") + '</td><td>' + esc(order.quantity || 0) + '</td><td>' + esc(order.unit || "-") + '</td><td>' + esc(money(order.unitPrice, order.currency)) + '</td><td><strong>' + esc(money(total(order), order.currency)) + '</strong></td></tr></table>' +
      '<table class="print-table"><tr><th>Note</th><td>' + esc(order.notes || order.description || "-") + '</td></tr></table>' +
      '<div class="print-footer">Parmitalia Management System - destinazione merce separata dagli Incoterms</div></div>';
    if (typeof openPrint === "function") openPrint(html);
    else { var root = document.getElementById("print-root"); if (root) root.innerHTML = html; window.print(); }
  }
  function bindPrintButtons(){
    document.querySelectorAll("[data-print-order]").forEach(function(btn){
      btn.onclick = function(){ printOrder(btn.getAttribute("data-print-order")); };
    });
    document.querySelectorAll("[data-pms94-print-order-customer],[data-pms94-print-order-supplier]").forEach(function(btn){
      var id = btn.getAttribute("data-pms94-print-order-customer") || btn.getAttribute("data-pms94-print-order-supplier");
      btn.onclick = function(){ printOrder(id); };
    });
  }

  function install(){
    normalizeOrders();
    injectCss();
    var baseGetColumns = typeof getColumns === "function" ? getColumns : null;
    if (baseGetColumns && !baseGetColumns.__pms220Wrapped) {
      getColumns = function(module){ return columns(module, baseGetColumns.apply(this, arguments)); };
      getColumns.__pms220Wrapped = true;
      try { window.getColumns = getColumns; } catch(error) {}
    }
    var baseColumnLabel = typeof columnLabel === "function" ? columnLabel : null;
    if (baseColumnLabel && !baseColumnLabel.__pms220Wrapped) {
      columnLabel = function(key){
        if (key === "destination") return "Destinazione merce";
        if (key === "delivery") return "Incoterms";
        if (key === "expectedDelivery") return "Consegna prevista";
        return baseColumnLabel.apply(this, arguments);
      };
      columnLabel.__pms220Wrapped = true;
      try { window.columnLabel = columnLabel; } catch(error) {}
    }
    var baseCell = typeof cellValue === "function" ? cellValue : null;
    if (baseCell && !baseCell.__pms220Wrapped) {
      cellValue = function(module, item, c){
        if (module === ORDER && c === "destination") {
          var dest = destination(item);
          return dest ? '<strong class="pms220-dest-cell">' + esc(dest) + '</strong>' : '<strong class="pms220-missing">MANCA DESTINAZIONE</strong>';
        }
        if (module === ORDER && c === "delivery") return esc(clean(item && item.delivery) || "-");
        if (module === ORDER && c === "total") return money(total(item), item && item.currency);
        return baseCell.apply(this, arguments);
      };
      cellValue.__pms220Wrapped = true;
      try { window.cellValue = cellValue; } catch(error) {}
    }
    var baseOpen = typeof openModal === "function" ? openModal : null;
    if (baseOpen && !baseOpen.__pms220Wrapped) {
      openModal = function(module, id){
        ensureSchema();
        var result = baseOpen.apply(this, arguments);
        if (module === ORDER) {
          setTimeout(function(){
            var form = document.getElementById("modal-form");
            if (!form) return;
            form.dataset.pms220Order = "1";
            var order = st().orders.find(function(o){ return clean(o.id) === clean(id) || clean(o.code) === clean(id); });
            decorateOrderForm();
            var dest = form.elements && form.elements.destination;
            if (dest && order && !clean(dest.value)) dest.value = destination(order);
          }, 30);
        }
        return result;
      };
      openModal.__pms220Wrapped = true;
      try { window.openModal = openModal; } catch(error) {}
    }
    var baseSubmit = typeof submitModal === "function" ? submitModal : null;
    if (baseSubmit && !baseSubmit.__pms220Wrapped) {
      submitModal = function(event, module, id){
        ensureSchema();
        var dest = module === ORDER ? formDestination(event && event.target) : "";
        if (module === ORDER && !dest) {
          event.preventDefault();
          alert("Compila DESTINAZIONE MERCE / indirizzo scarico. Senza questo campo l'ordine non mostra la destinazione.");
          return;
        }
        var result = baseSubmit.apply(this, arguments);
        if (module === ORDER) setTimeout(function(){ applyDestinationToLatest(id, dest); if (typeof render === "function") render(); }, 80);
        return result;
      };
      submitModal.__pms220Wrapped = true;
      try { window.submitModal = submitModal; } catch(error) {}
    }
    var baseRender = typeof render === "function" ? render : null;
    if (baseRender && !baseRender.__pms220Wrapped) {
      render = function(){
        normalizeOrders();
        var result = baseRender.apply(this, arguments);
        setTimeout(function(){ decorateOrdersPage(); bindPrintButtons(); }, 30);
        setTimeout(function(){ decorateOrdersPage(); bindPrintButtons(); }, 240);
        return result;
      };
      render.__pms220Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    var baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
    if (baseBind && !baseBind.__pms220Wrapped) {
      bindPageActions = function(){
        var result = baseBind.apply(this, arguments);
        setTimeout(function(){ decorateOrdersPage(); bindPrintButtons(); }, 30);
        return result;
      };
      bindPageActions.__pms220Wrapped = true;
      try { window.bindPageActions = bindPageActions; } catch(error) {}
    }
    [80, 400, 1200].forEach(function(ms){ setTimeout(function(){ decorateOrdersPage(); bindPrintButtons(); }, ms); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
  window.PMS_V220_ORDERS_DESTINATION_FINAL_FIX = {version:VERSION, normalize:normalizeOrders, decorate:decorateOrdersPage, print:printOrder};
  console.info(VERSION + " loaded");
})();
