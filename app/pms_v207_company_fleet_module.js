(function(){
  "use strict";

  var VERSION = "pms_v207_company_fleet_module";
  var MODULE = "companyFleet";
  var PAYMENTS = "companyFleetPayments";
  var SUBLEASE = "companyFleetSubleasePayments";

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
  function uid207(prefix){
    if (typeof uid === "function") return uid(prefix);
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(value, currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function dateAddMonths(date, months){
    var d = new Date(date || today());
    if (Number.isNaN(d.getTime())) d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state[MODULE] = arr(state[MODULE]);
    state[PAYMENTS] = arr(state[PAYMENTS]);
    state[SUBLEASE] = arr(state[SUBLEASE]);
    return state;
  }
  function saveNow(reason){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function vehicleId(item){ return clean(item && (item.id || item.code || item.plate)); }
  function findVehicle(id){
    return arr(st()[MODULE]).find(function(item){ return vehicleId(item) === clean(id); });
  }
  function vehicleLabel(item){
    return [item && item.plate, item && item.brand, item && item.model].filter(Boolean).join(" - ") || vehicleId(item) || "Veicolo";
  }
  function leasePayments(id){
    return arr(st()[PAYMENTS]).filter(function(row){ return clean(row.vehicleId) === clean(id); });
  }
  function subPayments(id){
    return arr(st()[SUBLEASE]).filter(function(row){ return clean(row.vehicleId) === clean(id); });
  }
  function paidLease(id){
    return leasePayments(id).reduce(function(sum,row){ return sum + num(row.amount); }, 0);
  }
  function paidSublease(id){
    return subPayments(id).reduce(function(sum,row){ return sum + num(row.amount); }, 0);
  }
  function leaseTotal(vehicle){
    var amount = num(vehicle.monthlyInstallment || vehicle.rateAmount);
    var count = num(vehicle.installments || vehicle.rateCount);
    return amount && count ? amount * count : num(vehicle.purchasePrice || vehicle.financedAmount);
  }
  function amortizationMonthly(vehicle){
    var base = num(vehicle.purchasePrice || vehicle.financedAmount || leaseTotal(vehicle));
    var residual = num(vehicle.residualValue);
    var months = num(vehicle.amortizationMonths);
    if (!months) months = num(vehicle.installments || vehicle.rateCount);
    return months ? Math.max(0, base - residual) / months : 0;
  }
  function remainingLease(vehicle){
    return Math.max(0, leaseTotal(vehicle) - paidLease(vehicleId(vehicle)));
  }
  function remainingSublease(vehicle){
    var expected = num(vehicle.subleaseMonthlyAmount) * num(vehicle.subleaseMonths || vehicle.installments || 0);
    return Math.max(0, expected - paidSublease(vehicleId(vehicle)));
  }
  function addModule(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    var existing = modules.find(function(item){ return item.id === MODULE; });
    if (existing) {
      existing.label = "Flotta auto aziendale";
      existing.subtitle = "Auto, rate, ammortamenti e subaffitti";
      existing.roles = ["admin","assistant","accountant"];
      return;
    }
    var index = modules.findIndex(function(item){ return item.id === "transportPrices" || item.id === "payments"; });
    modules.splice(index >= 0 ? index + 1 : modules.length, 0, {
      id: MODULE,
      label: "Flotta auto aziendale",
      subtitle: "Auto aziendali, ammortamento, rate e subaffitto",
      roles: ["admin","assistant","accountant"]
    });
  }
  function ensureSchema(){
    if (typeof schemas === "undefined") return;
    schemas[MODULE] = {
      title: "Flotta auto aziendale",
      fields: [
        {key:"plate", label:"Targa", type:"text", required:true},
        {key:"brand", label:"Marca", type:"text"},
        {key:"model", label:"Modello", type:"text"},
        {key:"year", label:"Anno", type:"number"},
        {key:"driver", label:"Assegnata a", type:"text"},
        {key:"status", label:"Stato", type:"select", options:["Attiva","Subaffittata","In manutenzione","Venduta","Dismessa"]},
        {key:"purchaseDate", label:"Data acquisto/leasing", type:"date"},
        {key:"purchasePrice", label:"Valore / prezzo acquisto", type:"number"},
        {key:"currency", label:"Valuta", type:"select", options:["EUR","RON","USD"]},
        {key:"amortizationMonths", label:"Mesi ammortamento", type:"number"},
        {key:"residualValue", label:"Valore residuo", type:"number"},
        {key:"monthlyInstallment", label:"Rata mensile", type:"number"},
        {key:"installments", label:"Numero rate", type:"number"},
        {key:"installmentStart", label:"Prima rata", type:"date"},
        {key:"subleaseClient", label:"Subaffitto a", type:"text"},
        {key:"subleaseMonthlyAmount", label:"Canone subaffitto mensile", type:"number"},
        {key:"subleaseMonths", label:"Mesi subaffitto", type:"number"},
        {key:"subleaseStart", label:"Inizio subaffitto", type:"date"},
        {key:"insurance", label:"Assicurazione", type:"number"},
        {key:"tax", label:"Bollo / tassa", type:"number"},
        {key:"notes", label:"Note", type:"textarea", full:true}
      ]
    };
  }
  function ensure(){
    st();
    addModule();
    ensureSchema();
  }
  function input(name, label, value, type, extra){
    return '<label>' + esc(label) + '<input name="' + esc(name) + '" type="' + esc(type || "text") + '" value="' + esc(value || "") + '"' + (extra || "") + '></label>';
  }
  function select(name, label, value, options){
    return '<label>' + esc(label) + '<select name="' + esc(name) + '">' + options.map(function(option){
      return '<option value="' + esc(option) + '"' + (option === value ? " selected" : "") + '>' + esc(option) + '</option>';
    }).join("") + '</select></label>';
  }
  function formHtml(vehicle){
    var v = vehicle || {};
    var id = vehicleId(v) || uid207("FLT");
    return '<div class="pms207-form">' +
      input("id", "Codice", id, "text", " readonly") +
      input("plate", "Targa", v.plate || "", "text") +
      input("brand", "Marca", v.brand || "", "text") +
      input("model", "Modello", v.model || "", "text") +
      input("year", "Anno", v.year || "", "number") +
      input("driver", "Assegnata a", v.driver || "", "text") +
      select("status", "Stato", v.status || "Attiva", ["Attiva","Subaffittata","In manutenzione","Venduta","Dismessa"]) +
      select("currency", "Valuta", v.currency || "EUR", ["EUR","RON","USD"]) +
      input("purchaseDate", "Data acquisto/leasing", v.purchaseDate || today(), "date") +
      input("purchasePrice", "Valore / prezzo acquisto", v.purchasePrice || "", "number", ' step="0.01"') +
      input("amortizationMonths", "Mesi ammortamento", v.amortizationMonths || "", "number") +
      input("residualValue", "Valore residuo", v.residualValue || "", "number", ' step="0.01"') +
      input("monthlyInstallment", "Rata mensile", v.monthlyInstallment || "", "number", ' step="0.01"') +
      input("installments", "Numero rate", v.installments || "", "number") +
      input("installmentStart", "Prima rata", v.installmentStart || v.purchaseDate || today(), "date") +
      input("subleaseClient", "Subaffitto a", v.subleaseClient || "", "text") +
      input("subleaseMonthlyAmount", "Canone subaffitto mensile", v.subleaseMonthlyAmount || "", "number", ' step="0.01"') +
      input("subleaseMonths", "Mesi subaffitto", v.subleaseMonths || "", "number") +
      input("subleaseStart", "Inizio subaffitto", v.subleaseStart || "", "date") +
      input("insurance", "Assicurazione", v.insurance || "", "number", ' step="0.01"') +
      input("tax", "Bollo / tassa", v.tax || "", "number", ' step="0.01"') +
      '<label class="full">Note<textarea name="notes">' + esc(v.notes || "") + '</textarea></label>' +
    '</div>';
  }
  function readForm(wrap){
    var data = new FormData(wrap.querySelector("form") || wrap);
    var item = {};
    data.forEach(function(value,key){ item[key] = clean(value); });
    ["year","purchasePrice","amortizationMonths","residualValue","monthlyInstallment","installments","subleaseMonthlyAmount","subleaseMonths","insurance","tax"].forEach(function(key){
      item[key] = num(item[key]) || "";
    });
    item.updatedAt = new Date().toISOString();
    return item;
  }
  function modal(title, body, onSave){
    document.querySelectorAll(".pms207-modal-backdrop").forEach(function(node){ node.remove(); });
    var wrap = document.createElement("div");
    wrap.className = "pms207-modal-backdrop";
    wrap.innerHTML = '<div class="pms207-modal"><div class="pms207-modal-head"><h3>' + esc(title) + '</h3><button type="button" class="secondary-button" data-pms207-close>Chiudi</button></div><form><div class="pms207-modal-body">' + body + '</div><div class="pms207-modal-actions"><button type="button" class="secondary-button" data-pms207-close>Annulla</button>' + (onSave ? '<button type="submit" class="primary-button">Salva</button>' : "") + '</div></form></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function(event){
      if (event.target === wrap || event.target.closest("[data-pms207-close]")) wrap.remove();
    });
    if (onSave) {
      wrap.querySelector("form").onsubmit = function(event){
        event.preventDefault();
        onSave(wrap);
      };
    }
    return wrap;
  }
  function editVehicle(id){
    var old = id ? findVehicle(id) : null;
    modal(old ? "Modifica veicolo" : "Nuovo veicolo flotta", formHtml(old), function(wrap){
      var item = readForm(wrap);
      if (!clean(item.plate)) return alert("Inserisci almeno la targa.");
      var list = st()[MODULE];
      var index = list.findIndex(function(row){ return vehicleId(row) === clean(item.id); });
      if (index >= 0) list[index] = Object.assign({}, list[index], item);
      else {
        item.createdAt = new Date().toISOString();
        list.unshift(item);
      }
      saveNow("v207-fleet-save");
      wrap.remove();
      if (typeof render === "function") render();
    });
  }
  function deleteVehicle(id){
    var vehicle = findVehicle(id);
    if (!vehicle) return alert("Veicolo non trovato.");
    if (!confirm("Eliminare definitivamente questo veicolo?\n\n" + vehicleLabel(vehicle))) return;
    st()[MODULE] = arr(st()[MODULE]).filter(function(row){ return vehicleId(row) !== vehicleId(vehicle); });
    st()[PAYMENTS] = arr(st()[PAYMENTS]).filter(function(row){ return clean(row.vehicleId) !== vehicleId(vehicle); });
    st()[SUBLEASE] = arr(st()[SUBLEASE]).filter(function(row){ return clean(row.vehicleId) !== vehicleId(vehicle); });
    saveNow("v207-fleet-delete");
    if (typeof render === "function") render();
  }
  function paymentFormHtml(vehicle, kind){
    var label = kind === "sublease" ? "Pagamento subaffitto ricevuto" : "Rata pagata";
    var amount = kind === "sublease" ? vehicle.subleaseMonthlyAmount : vehicle.monthlyInstallment;
    return '<div class="pms207-form">' +
      input("date", "Data", today(), "date") +
      input("amount", label, amount || "", "number", ' step="0.01"') +
      input("payer", kind === "sublease" ? "Pagato da" : "Pagato a / banca", kind === "sublease" ? vehicle.subleaseClient || "" : "", "text") +
      input("reference", "Riferimento", "", "text") +
      '<label class="full">Note<textarea name="notes"></textarea></label>' +
    '</div>';
  }
  function addPayment(id, kind){
    var vehicle = findVehicle(id);
    if (!vehicle) return alert("Veicolo non trovato.");
    modal(kind === "sublease" ? "Registra pagamento subaffitto" : "Registra rata veicolo", paymentFormHtml(vehicle, kind), function(wrap){
      var data = new FormData(wrap.querySelector("form"));
      var row = {
        id: uid207(kind === "sublease" ? "SBF" : "RAT"),
        vehicleId: id,
        date: clean(data.get("date")) || today(),
        amount: num(data.get("amount")),
        payer: clean(data.get("payer")),
        reference: clean(data.get("reference")),
        notes: clean(data.get("notes")),
        createdAt: new Date().toISOString()
      };
      if (!row.amount) return alert("Inserisci importo pagamento.");
      st()[kind === "sublease" ? SUBLEASE : PAYMENTS].unshift(row);
      if (kind === "sublease" && vehicle.status === "Attiva") vehicle.status = "Subaffittata";
      saveNow("v207-fleet-payment");
      wrap.remove();
      if (typeof render === "function") render();
    });
  }
  function paymentRows(id, kind){
    var list = (kind === "sublease" ? subPayments(id) : leasePayments(id)).sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); });
    return list.map(function(row){
      return '<tr><td>' + esc(row.date || "-") + '</td><td><strong>' + esc(money(row.amount, findVehicle(id)?.currency || "EUR")) + '</strong></td><td>' + esc(row.payer || "-") + '</td><td>' + esc(row.reference || "-") + '</td><td>' + esc(row.notes || "") + '</td></tr>';
    }).join("");
  }
  function scheduleRows(vehicle){
    var months = num(vehicle.installments || vehicle.amortizationMonths);
    var amount = num(vehicle.monthlyInstallment);
    var start = vehicle.installmentStart || vehicle.purchaseDate || today();
    var paid = paidLease(vehicleId(vehicle));
    var rows = [];
    for (var i = 0; i < Math.min(months || 0, 120); i++) {
      var due = dateAddMonths(start, i);
      var status = paid >= amount * (i + 1) ? "Pagata" : due < today() ? "Scaduta" : "Da pagare";
      rows.push('<tr><td>' + (i + 1) + '</td><td>' + esc(due) + '</td><td>' + esc(money(amount, vehicle.currency)) + '</td><td><span class="pms207-pay-status pms207-' + esc(status.toLowerCase().replace(/\s+/g,"-")) + '">' + esc(status) + '</span></td></tr>');
    }
    return rows.join("");
  }
  function viewVehicle(id){
    var v = findVehicle(id);
    if (!v) return alert("Veicolo non trovato.");
    var html = '<div class="pms207-view-actions"><button class="secondary-button" data-pms207-edit="' + esc(id) + '">Modifica</button><button class="secondary-button" data-pms207-add-rate="' + esc(id) + '">Segna rata pagata</button><button class="secondary-button" data-pms207-add-sub="' + esc(id) + '">Segna subaffitto incassato</button><button class="secondary-button" data-pms207-print="' + esc(id) + '">Stampa scheda</button><button class="inline-danger" data-pms207-delete="' + esc(id) + '">Elimina</button></div>' +
      '<div class="pms207-detail-grid">' +
      '<div class="pms207-plate">' + esc(v.plate || "-") + '<small>' + esc([v.brand, v.model, v.year].filter(Boolean).join(" ")) + '</small></div>' +
      '<table class="print-table"><tr><th>Stato</th><td>' + esc(v.status || "-") + '</td><th>Assegnata a</th><td>' + esc(v.driver || "-") + '</td></tr><tr><th>Valore</th><td>' + esc(money(v.purchasePrice, v.currency)) + '</td><th>Ammortamento mese</th><td>' + esc(money(amortizationMonthly(v), v.currency)) + '</td></tr><tr><th>Rata mensile</th><td>' + esc(money(v.monthlyInstallment, v.currency)) + '</td><th>Residuo rate</th><td>' + esc(money(remainingLease(v), v.currency)) + '</td></tr><tr><th>Subaffitto a</th><td>' + esc(v.subleaseClient || "-") + '</td><th>Residuo subaffitto</th><td>' + esc(money(remainingSublease(v), v.currency)) + '</td></tr></table></div>' +
      '<h4>Piano rate / ammortamento</h4><div class="table-wrap"><table><thead><tr><th>#</th><th>Scadenza</th><th>Importo</th><th>Stato</th></tr></thead><tbody>' + (scheduleRows(v) || '<tr><td colspan="4">Nessun piano rate impostato.</td></tr>') + '</tbody></table></div>' +
      '<h4>Rate pagate</h4><div class="table-wrap"><table><thead><tr><th>Data</th><th>Importo</th><th>Pagato a</th><th>Rif.</th><th>Note</th></tr></thead><tbody>' + (paymentRows(id, "rate") || '<tr><td colspan="5">Nessuna rata registrata.</td></tr>') + '</tbody></table></div>' +
      '<h4>Subaffitto incassato</h4><div class="table-wrap"><table><thead><tr><th>Data</th><th>Importo</th><th>Pagato da</th><th>Rif.</th><th>Note</th></tr></thead><tbody>' + (paymentRows(id, "sublease") || '<tr><td colspan="5">Nessun incasso subaffitto registrato.</td></tr>') + '</tbody></table></div>';
    modal("Scheda flotta - " + vehicleLabel(v), html, null);
    bindActions();
  }
  function printVehicle(id){
    var v = findVehicle(id);
    if (!v) return alert("Veicolo non trovato.");
    var header = typeof companyPrintHeader === "function" ? companyPrintHeader("FLOTTA AUTO AZIENDALE", vehicleId(v), vehicleLabel(v)) : '<div class="print-header"><div><h1>FLOTTA AUTO AZIENDALE</h1><strong>PARMITALIA DISTRIBUTION SRL</strong></div><div class="print-meta">' + esc(vehicleId(v)) + '</div></div>';
    var html = '<div class="print-document pms207-print">' + header +
      '<table class="print-table"><tr><th>Targa</th><td>' + esc(v.plate || "-") + '</td><th>Veicolo</th><td>' + esc([v.brand,v.model,v.year].filter(Boolean).join(" ")) + '</td></tr><tr><th>Stato</th><td>' + esc(v.status || "-") + '</td><th>Assegnata a</th><td>' + esc(v.driver || "-") + '</td></tr><tr><th>Valore</th><td>' + esc(money(v.purchasePrice, v.currency)) + '</td><th>Ammortamento mese</th><td>' + esc(money(amortizationMonthly(v), v.currency)) + '</td></tr><tr><th>Totale rate</th><td>' + esc(money(leaseTotal(v), v.currency)) + '</td><th>Residuo rate</th><td>' + esc(money(remainingLease(v), v.currency)) + '</td></tr><tr><th>Subaffitto a</th><td>' + esc(v.subleaseClient || "-") + '</td><th>Incassato subaffitto</th><td>' + esc(money(paidSublease(id), v.currency)) + '</td></tr></table>' +
      '<h3>Rate pagate</h3><table class="print-table"><thead><tr><th>Data</th><th>Importo</th><th>Pagato a</th><th>Rif.</th><th>Note</th></tr></thead><tbody>' + (paymentRows(id, "rate") || '<tr><td colspan="5">Nessuna rata.</td></tr>') + '</tbody></table>' +
      '<h3>Subaffitto incassato</h3><table class="print-table"><thead><tr><th>Data</th><th>Importo</th><th>Pagato da</th><th>Rif.</th><th>Note</th></tr></thead><tbody>' + (paymentRows(id, "sublease") || '<tr><td colspan="5">Nessun incasso.</td></tr>') + '</tbody></table>' +
      '<div class="print-footer">Scheda flotta auto aziendale - Parmitalia</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function row(v){
    var id = vehicleId(v);
    return '<tr><td><span class="code-block">' + esc(id) + '</span><br><strong>' + esc(v.plate || "-") + '</strong></td><td><strong>' + esc([v.brand,v.model].filter(Boolean).join(" ") || "-") + '</strong><br><small>' + esc(v.year || "") + '</small></td><td>' + esc(v.driver || "-") + '</td><td>' + esc(v.status || "Attiva") + '</td><td>' + esc(money(v.purchasePrice, v.currency)) + '<br><small>Amm. mese ' + esc(money(amortizationMonthly(v), v.currency)) + '</small></td><td>' + esc(money(v.monthlyInstallment, v.currency)) + '<br><small>Residuo ' + esc(money(remainingLease(v), v.currency)) + '</small></td><td><strong>' + esc(v.subleaseClient || "-") + '</strong><br><small>Incassato ' + esc(money(paidSublease(id), v.currency)) + '</small></td><td><div class="pms207-actions"><button class="inline-button" data-pms207-view="' + esc(id) + '">Vedi</button><button class="inline-button" data-pms207-edit="' + esc(id) + '">Modifica</button><button class="inline-button" data-pms207-add-rate="' + esc(id) + '">Rata pagata</button><button class="inline-button" data-pms207-add-sub="' + esc(id) + '">Subaffitto pagato</button><button class="inline-button" data-pms207-print="' + esc(id) + '">Stampa</button><button class="inline-danger" data-pms207-delete="' + esc(id) + '">Elimina</button></div></td></tr>';
  }
  function renderFleet(){
    ensure();
    var list = arr(st()[MODULE]);
    var totalValue = list.reduce(function(sum,v){ return sum + num(v.purchasePrice); }, 0);
    var totalRemain = list.reduce(function(sum,v){ return sum + remainingLease(v); }, 0);
    var totalSub = list.reduce(function(sum,v){ return sum + paidSublease(vehicleId(v)); }, 0);
    return '<div class="pms207-page"><section class="pms207-hero"><div><span>FLT</span><h3>Flotta auto aziendale</h3><p>Archivio veicoli, ammortamenti, rate, scadenze e subaffitti incassati.</p></div><div class="pms207-actions"><button class="primary-button" data-pms207-new>Nuovo veicolo</button><button class="secondary-button" data-pms207-print-list>Stampa flotta</button></div></section>' +
      '<div class="pms207-kpis"><div><span>Veicoli</span><strong>' + list.length + '</strong></div><div><span>Valore flotta</span><strong>' + esc(money(totalValue, "EUR")) + '</strong></div><div><span>Residuo rate</span><strong>' + esc(money(totalRemain, "EUR")) + '</strong></div><div><span>Subaffitto incassato</span><strong>' + esc(money(totalSub, "EUR")) + '</strong></div></div>' +
      '<div class="pms207-card"><h3>Archivio flotta</h3><div class="table-wrap"><table class="pms207-table"><thead><tr><th>Codice / Targa</th><th>Modello</th><th>Assegnata</th><th>Stato</th><th>Valore / Ammortamento</th><th>Rate</th><th>Subaffitto</th><th>Azioni</th></tr></thead><tbody>' + (list.map(row).join("") || '<tr><td colspan="8">Nessun veicolo registrato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function printList(){
    var rows = arr(st()[MODULE]).map(function(v){
      return '<tr><td>' + esc(v.plate || vehicleId(v)) + '</td><td>' + esc([v.brand,v.model,v.year].filter(Boolean).join(" ")) + '</td><td>' + esc(v.status || "-") + '</td><td>' + esc(money(v.purchasePrice, v.currency)) + '</td><td>' + esc(money(remainingLease(v), v.currency)) + '</td><td>' + esc(money(paidSublease(vehicleId(v)), v.currency)) + '</td></tr>';
    }).join("");
    var header = typeof companyPrintHeader === "function" ? companyPrintHeader("REGISTRO FLOTTA AUTO", "FLT-" + today(), "Auto aziendali, rate e subaffitti") : '<div class="print-header"><div><h1>REGISTRO FLOTTA AUTO</h1></div></div>';
    if (typeof openPrint === "function") openPrint('<div class="print-document">' + header + '<table class="print-table"><thead><tr><th>Targa</th><th>Modello</th><th>Stato</th><th>Valore</th><th>Residuo rate</th><th>Subaffitto incassato</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun veicolo.</td></tr>') + '</tbody></table><div class="print-footer">Registro flotta Parmitalia</div></div>');
  }
  function bindActions(){
    document.querySelectorAll("[data-pms207-new]").forEach(function(btn){ btn.onclick = function(){ editVehicle(); }; });
    document.querySelectorAll("[data-pms207-view]").forEach(function(btn){ btn.onclick = function(){ viewVehicle(btn.getAttribute("data-pms207-view")); }; });
    document.querySelectorAll("[data-pms207-edit]").forEach(function(btn){ btn.onclick = function(){ editVehicle(btn.getAttribute("data-pms207-edit")); }; });
    document.querySelectorAll("[data-pms207-delete]").forEach(function(btn){ btn.onclick = function(){ deleteVehicle(btn.getAttribute("data-pms207-delete")); }; });
    document.querySelectorAll("[data-pms207-add-rate]").forEach(function(btn){ btn.onclick = function(){ addPayment(btn.getAttribute("data-pms207-add-rate"), "rate"); }; });
    document.querySelectorAll("[data-pms207-add-sub]").forEach(function(btn){ btn.onclick = function(){ addPayment(btn.getAttribute("data-pms207-add-sub"), "sublease"); }; });
    document.querySelectorAll("[data-pms207-print]").forEach(function(btn){ btn.onclick = function(){ printVehicle(btn.getAttribute("data-pms207-print")); }; });
    document.querySelectorAll("[data-pms207-print-list]").forEach(function(btn){ btn.onclick = printList; });
  }
  function decorateNav(){
    document.querySelectorAll('[data-page="' + MODULE + '"]').forEach(function(button){
      var label = button.querySelector(".pms100-label") || button;
      label.textContent = "Flotta auto aziendale";
      var code = button.querySelector(".pms100-code");
      if (code) code.textContent = "FLT";
    });
  }
  function injectCss(){
    var style = document.getElementById("pms-v207-fleet-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v207-fleet-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms207-page{display:grid;gap:14px}.pms207-hero{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;background:#fff;border:1px solid #d7e2dd;border-left:5px solid #14713f;border-radius:8px;padding:14px}.pms207-hero span{font-size:12px;font-weight:950;color:#14713f}.pms207-hero h3{margin:2px 0 4px}.pms207-hero p{margin:0;color:#64748b}",
      ".pms207-actions,.pms207-view-actions{display:flex;flex-wrap:wrap;gap:7px;align-items:center}.pms207-actions button,.pms207-view-actions button{width:auto!important;margin:0!important}",
      ".pms207-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.pms207-kpis>div{background:#fff;border:1px solid #d7e2dd;border-radius:8px;padding:11px}.pms207-kpis span{display:block;font-size:11px;font-weight:950;color:#64748b;text-transform:uppercase}.pms207-kpis strong{display:block;font-size:20px;color:#17362d;margin-top:4px}",
      ".pms207-card{background:#fff;border:1px solid #d7e2dd;border-radius:8px;padding:13px}.pms207-table{min-width:1220px!important}.pms207-table td:last-child{min-width:430px!important}",
      ".pms207-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.pms207-form label{display:grid;gap:4px;font-size:12px;font-weight:850;color:#526172}.pms207-form input,.pms207-form select,.pms207-form textarea{width:100%;min-width:0}.pms207-form .full{grid-column:1/-1}.pms207-form textarea{min-height:95px}",
      ".pms207-modal-backdrop{position:fixed;inset:0;z-index:39000;background:rgba(15,23,42,.56);display:grid;place-items:center;padding:16px}.pms207-modal{width:min(1120px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:8px;border:1px solid #d7e2dd;box-shadow:0 24px 74px rgba(15,23,42,.34)}.pms207-modal-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:13px 15px;border-bottom:1px solid #e2e8f0;position:sticky;top:0;background:#fff;z-index:2}.pms207-modal-head h3{margin:0}.pms207-modal-body{padding:14px}.pms207-modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 15px;border-top:1px solid #e2e8f0;position:sticky;bottom:0;background:#fff}",
      ".pms207-detail-grid{display:grid;grid-template-columns:180px minmax(0,1fr);gap:14px;align-items:start}.pms207-plate{display:grid;place-items:center;min-height:120px;border-radius:8px;border:2px solid #17362d;background:#f8fafc;color:#17362d;font-size:26px;font-weight:950;text-align:center}.pms207-plate small{display:block;font-size:12px;color:#64748b;margin-top:6px}",
      ".pms207-pay-status{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:900;background:#eef2f7}.pms207-pagata{background:#dcfce7;color:#166534}.pms207-scaduta{background:#fee2e2;color:#991b1b}.pms207-da-pagare{background:#fef3c7;color:#854d0e}",
      "@media(max-width:900px){.pms207-hero,.pms207-detail-grid{display:grid;grid-template-columns:1fr}.pms207-form{grid-template-columns:1fr 1fr}.pms207-table td:last-child{min-width:260px!important}}@media(max-width:640px){.pms207-form{grid-template-columns:1fr}}"
    ].join("\n");
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms207Wrapped) {
      var baseRender = render;
      render = function(){
        ensure();
        if (window.current && current.page === MODULE) {
          var content = document.getElementById("content");
          var title = document.getElementById("page-title");
          var subtitle = document.getElementById("page-subtitle");
          if (title) title.textContent = "Flotta auto aziendale";
          if (subtitle) subtitle.textContent = "Auto, ammortamenti, rate e subaffitti";
          if (content) {
            injectCss();
            content.innerHTML = renderFleet();
            bindActions();
            decorateNav();
            return;
          }
        }
        var result = baseRender.apply(this, arguments);
        setTimeout(function(){ decorateNav(); if (current && current.page === MODULE) bindActions(); }, 30);
        return result;
      };
      render.__pms207Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms207Wrapped) {
      var baseNav = renderNav;
      renderNav = function(){
        ensure();
        var result = baseNav.apply(this, arguments);
        setTimeout(decorateNav, 20);
        return result;
      };
      renderNav.__pms207Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }
  function boot(){
    ensure();
    injectCss();
    wrapRender();
    if (typeof renderNav === "function") setTimeout(renderNav, 40);
    if (window.current && current.page === MODULE && typeof render === "function") setTimeout(render, 60);
    setTimeout(decorateNav, 160);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V207_COMPANY_FLEET_MODULE = {version:VERSION, refresh:boot};
})();
