(function(){
  "use strict";

  if (window.PMS_V240_SIMPLE_PRICE_CONFIRMATIONS) return;

  var VERSION = "pms_v240_simple_price_confirmations";
  var MODULE = "supplierPriceConfirmations";
  var STYLE_ID = "pms-v240-simple-price-confirmations-style";

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
  function uid240(prefix){
    if (typeof uid === "function") return uid(prefix);
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }
  function money(value, currency, unit){
    var amount = num(value);
    var text = (currency || "EUR") + " " + amount.toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:4});
    return unit ? text + " / " + unit : text;
  }
  function stateSafe(){
    state[MODULE] = arr(state[MODULE]);
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(reason){
    var payload = stateSafe();
    var savedLocal = false;
    try {
      if (typeof STORAGE_KEY !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        savedLocal = true;
      }
    } catch(error) {
      console.warn(VERSION + " local save failed", error);
    }
    try {
      if (window.PMS_V252_REAL_SAVE && typeof window.PMS_V252_REAL_SAVE.saveNow === "function") {
        window.PMS_V252_REAL_SAVE.saveNow(reason || VERSION, { silent: true });
      } else if (window.parmitaliaStorage && typeof window.parmitaliaStorage.save === "function") {
        window.parmitaliaStorage.save(payload).catch(function(error){
          console.warn(VERSION + " desktop save failed", error);
        });
      } else if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION).catch(function(error){
          console.warn(VERSION + " autosave failed", error);
        });
      }
    } catch(error) {
      console.warn(VERSION + " save scheduling failed", error);
    }
    return savedLocal;
  }
  function recordId(item){ return clean(item && (item.id || item.code || item.protocol)); }
  function directionOf(item){
    var value = clean(item && (item.direction || item.confirmationType || item.type));
    if (/client|cliente/i.test(value)) return "Cliente";
    if (/supplier|fornitore/i.test(value)) return "Fornitore";
    if (clean(item && item.client) && !clean(item && item.supplier)) return "Cliente";
    return "Fornitore";
  }
  function counterpartyOf(item){
    return clean(item && (item.counterparty || item.supplier || item.client || item.customer || item.company));
  }
  function productOf(item){
    return clean(item && (item.product || item.productName || item.article || item.description));
  }
  function priceOf(item){
    if (item && item.price != null && item.price !== "") return item.price;
    if (item && item.unitPrice != null && item.unitPrice !== "") return item.unitPrice;
    return "";
  }
  function validityOf(item){
    if (item && item.validity) return item.validity;
    var from = clean(item && item.validFrom);
    var until = clean(item && item.validUntil);
    if (from && until) return from + " - " + until;
    return until || from || "";
  }
  function simplified(item){
    item = item || {};
    return {
      id: recordId(item) || uid240("CPR"),
      date: clean(item.date || item.confirmationDate || item.requestDate) || today(),
      direction: directionOf(item),
      counterparty: counterpartyOf(item),
      product: productOf(item),
      price: priceOf(item),
      currency: clean(item.currency) || "EUR",
      unit: clean(item.unit) || "kg",
      validity: validityOf(item),
      paymentTerms: clean(item.paymentTerms),
      deliveryTerms: clean(item.deliveryTerms || item.incoterm || item.delivery),
      status: clean(item.status) || "Bozza",
      notes: clean(item.notes || item.note),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || ""
    };
  }
  function ensureModule(){
    stateSafe();
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      var existing = modules.find(function(item){ return item.id === MODULE; });
      if (existing) {
        existing.label = "Conferme prezzi";
        existing.subtitle = "Conferme semplici per cliente o fornitore, non collegate ad altri moduli";
        existing.roles = ["admin", "assistant", "agent", "accountant"];
      } else {
        modules.push({
          id: MODULE,
          label: "Conferme prezzi",
          subtitle: "Conferme semplici per cliente o fornitore",
          roles: ["admin", "assistant", "agent", "accountant"]
        });
      }
    }
    if (typeof schemas !== "undefined") {
      schemas[MODULE] = {
        title: "Conferma prezzi",
        fields: [
          {key:"date", label:"Data", type:"date"},
          {key:"direction", label:"Tipo conferma", type:"select", options:["Cliente","Fornitore"], required:true},
          {key:"counterparty", label:"Cliente / Fornitore", type:"text", required:true},
          {key:"product", label:"Prodotto / servizio", type:"text", required:true},
          {key:"price", label:"Prezzo", type:"number", step:"0.0001", required:true},
          {key:"currency", label:"Valuta", type:"select", options:["EUR","RON","USD","GBP","CHF"]},
          {key:"unit", label:"Unita", type:"text"},
          {key:"validity", label:"Validita", type:"text"},
          {key:"paymentTerms", label:"Pagamento", type:"text"},
          {key:"deliveryTerms", label:"Consegna / Incoterm", type:"text"},
          {key:"status", label:"Stato", type:"select", options:["Bozza","Inviata","Confermata","Scaduta","Annullata"]},
          {key:"notes", label:"Note", type:"textarea", full:true}
        ]
      };
    }
  }
  function injectStyle(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms240-page{display:grid;gap:14px;color:#172033}",
      ".pms240-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:15px;border:1px solid #d7dee8;border-left:5px solid #2f6f5e;border-radius:8px;background:#fff}",
      ".pms240-hero h3{margin:2px 0 5px;font-size:22px;color:#0f172a}.pms240-hero p{margin:0;color:#52606d;line-height:1.38}.pms240-hero span{font-size:12px;text-transform:uppercase;letter-spacing:.06em;font-weight:900;color:#2f6f5e}",
      ".pms240-actions{display:flex;gap:7px;flex-wrap:wrap}.pms240-actions button,.pms240-page button{width:auto!important;margin:0!important}",
      ".pms240-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}.pms240-kpi{border:1px solid #d7dee8;border-radius:8px;background:#fff;padding:11px}.pms240-kpi span{display:block;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase}.pms240-kpi strong{display:block;margin-top:4px;color:#0f172a;font-size:20px}",
      ".pms240-panel{border:1px solid #d7dee8;border-radius:8px;background:#fff;overflow:hidden}.pms240-panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #e5edf5;background:#f8fafc}.pms240-panel-head h3{margin:0;color:#0f172a}",
      ".pms240-filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pms240-filters input,.pms240-filters select{width:auto;min-width:170px;background:#fff}",
      ".pms240-table{overflow:auto}.pms240-table table{width:100%;min-width:980px;border-collapse:collapse}.pms240-table th,.pms240-table td{padding:9px 10px;border-bottom:1px solid #e5edf5;vertical-align:top;text-align:left}.pms240-table th{background:#eef2f7;color:#253447;font-size:12px}.pms240-table small{display:block;color:#64748b;margin-top:3px;line-height:1.25}",
      ".pms240-badge{display:inline-flex;border-radius:999px;padding:4px 8px;font-weight:900;font-size:12px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8}.pms240-badge.supplier{background:#ecfdf5;border-color:#bbf7d0;color:#047857}.pms240-badge.client{background:#fff7ed;border-color:#fed7aa;color:#c2410c}",
      ".pms240-row-actions{display:flex;gap:6px;flex-wrap:wrap}.pms240-row-actions button{padding:6px 9px!important}",
      ".pms240-modal-backdrop{position:fixed;inset:0;z-index:28000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms240-modal{width:min(820px,96vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;box-shadow:0 24px 74px rgba(15,23,42,.34)}",
      ".pms240-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px;border-bottom:1px solid #e5edf5}.pms240-modal-head h3{margin:0;color:#0f172a}.pms240-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:14px}.pms240-form label{margin:0;font-size:12px;font-weight:900;color:#475569}.pms240-form input,.pms240-form select,.pms240-form textarea{background:#fff}.pms240-form .full{grid-column:1/-1}.pms240-form textarea{min-height:82px}.pms240-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;padding-top:4px}",
      "@media(max-width:760px){.pms240-hero,.pms240-panel-head{display:grid}.pms240-form{grid-template-columns:1fr}.pms240-filters input,.pms240-filters select,.pms240-filters button{width:100%!important;min-width:0}}",
      "@media print{.pms240-modal-backdrop,.pms240-page{display:none!important}}"
    ].join("\n");
  }
  function listRows(){
    var query = clean(current && current.filters && current.filters.pms240PriceSearch).toLowerCase();
    var dir = clean(current && current.filters && current.filters.pms240PriceDirection);
    return arr(stateSafe()[MODULE]).map(simplified).filter(function(row){
      var okDir = !dir || row.direction === dir;
      var text = JSON.stringify(row).toLowerCase();
      return okDir && (!query || text.indexOf(query) >= 0);
    }).sort(function(a,b){ return String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")); });
  }
  function rowHtml(row){
    var cls = row.direction === "Cliente" ? "client" : "supplier";
    return '<tr><td><span class="code-block">' + esc(row.id) + '</span><small>' + esc(row.date || "-") + '</small></td>' +
      '<td><span class="pms240-badge ' + cls + '">' + esc(row.direction) + '</span></td>' +
      '<td><strong>' + esc(row.counterparty || "-") + '</strong><small>Campo libero, non collegato</small></td>' +
      '<td><strong>' + esc(row.product || "-") + '</strong><small>' + esc(row.validity || "Validita non indicata") + '</small></td>' +
      '<td><strong>' + esc(money(row.price, row.currency, row.unit)) + '</strong><small>' + esc(row.paymentTerms || "-") + '</small></td>' +
      '<td>' + esc(row.deliveryTerms || "-") + '</td>' +
      '<td>' + esc(row.status || "Bozza") + '</td>' +
      '<td><div class="pms240-row-actions"><button class="inline-button" data-pms240-edit="' + esc(row.id) + '">Modifica</button><button class="inline-button" data-pms240-print="' + esc(row.id) + '">Stampa</button><button class="inline-button danger-button" data-pms240-delete="' + esc(row.id) + '">Elimina</button></div></td></tr>';
  }
  function renderPage(){
    ensureModule();
    injectStyle();
    var rows = listRows();
    var clientCount = arr(state[MODULE]).map(simplified).filter(function(row){ return row.direction === "Cliente"; }).length;
    var supplierCount = arr(state[MODULE]).map(simplified).filter(function(row){ return row.direction === "Fornitore"; }).length;
    return '<div class="pms240-page">' +
      '<section class="pms240-hero"><div><span>Modulo semplice</span><h3>Conferme prezzi</h3><p>Registrazione libera di una conferma prezzo per cliente o fornitore. Nessun collegamento obbligatorio a prodotti, offerte, anagrafiche o altri moduli.</p></div><div class="pms240-actions"><button class="primary-button" data-pms240-new>+ Nuova conferma</button></div></section>' +
      '<div class="pms240-kpis"><div class="pms240-kpi"><span>Totali</span><strong>' + arr(state[MODULE]).length + '</strong></div><div class="pms240-kpi"><span>Clienti</span><strong>' + clientCount + '</strong></div><div class="pms240-kpi"><span>Fornitori</span><strong>' + supplierCount + '</strong></div></div>' +
      '<div class="pms240-panel"><div class="pms240-panel-head"><h3>Archivio conferme</h3><div class="pms240-filters"><input data-pms240-search placeholder="Cerca conferma..." value="' + esc(clean(current.filters.pms240PriceSearch)) + '"><select data-pms240-direction><option value="">Cliente e fornitore</option><option value="Cliente" ' + (current.filters.pms240PriceDirection === "Cliente" ? "selected" : "") + '>Cliente</option><option value="Fornitore" ' + (current.filters.pms240PriceDirection === "Fornitore" ? "selected" : "") + '>Fornitore</option></select></div></div>' +
      '<div class="pms240-table"><table><thead><tr><th>Protocollo</th><th>Tipo</th><th>Controparte</th><th>Prodotto / validita</th><th>Prezzo / pagamento</th><th>Consegna</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows.map(rowHtml).join("") || '<tr><td colspan="8" class="empty">Nessuna conferma prezzo registrata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function findRecord(id){
    return arr(stateSafe()[MODULE]).find(function(item){ return recordId(item) === String(id || ""); });
  }
  function modal(record){
    record = simplified(record || { id: uid240("CPR"), date: today(), direction: "Cliente", currency: "EUR", unit: "kg", status: "Bozza" });
    document.querySelectorAll(".pms240-modal-backdrop").forEach(function(node){ node.remove(); });
    var wrap = document.createElement("div");
    wrap.className = "pms240-modal-backdrop";
    wrap.innerHTML = '<div class="pms240-modal"><div class="pms240-modal-head"><h3>' + (findRecord(record.id) ? "Modifica conferma" : "Nuova conferma prezzi") + '</h3><button type="button" class="secondary-button" data-pms240-close>Chiudi</button></div>' +
      '<form id="pms240-form" class="pms240-form">' +
      '<input type="hidden" name="id" value="' + esc(record.id) + '">' +
      '<label>Data<input name="date" type="date" value="' + esc(record.date) + '"></label>' +
      '<label>Tipo conferma<select name="direction"><option ' + (record.direction === "Cliente" ? "selected" : "") + '>Cliente</option><option ' + (record.direction === "Fornitore" ? "selected" : "") + '>Fornitore</option></select></label>' +
      '<label class="full">Cliente / Fornitore<input name="counterparty" value="' + esc(record.counterparty) + '" placeholder="Nome libero, non collegato ad anagrafica"></label>' +
      '<label class="full">Prodotto / servizio<input name="product" value="' + esc(record.product) + '" placeholder="Es. Grana Padano 10 mesi, latte, trasporto, servizio"></label>' +
      '<label>Prezzo<input name="price" type="number" step="0.0001" value="' + esc(record.price) + '"></label>' +
      '<label>Valuta<select name="currency">' + ["EUR","RON","USD","GBP","CHF"].map(function(c){ return '<option ' + (record.currency === c ? "selected" : "") + '>' + c + '</option>'; }).join("") + '</select></label>' +
      '<label>Unita<input name="unit" value="' + esc(record.unit) + '" placeholder="kg, ton, pz, servizio"></label>' +
      '<label>Validita<input name="validity" value="' + esc(record.validity) + '" placeholder="Es. fino al 31/12/2026"></label>' +
      '<label>Pagamento<input name="paymentTerms" value="' + esc(record.paymentTerms) + '" placeholder="Es. bonifico 30 gg"></label>' +
      '<label>Consegna / Incoterm<input name="deliveryTerms" value="' + esc(record.deliveryTerms) + '" placeholder="Es. EXW, DAP, franco destino"></label>' +
      '<label>Stato<select name="status">' + ["Bozza","Inviata","Confermata","Scaduta","Annullata"].map(function(s){ return '<option ' + (record.status === s ? "selected" : "") + '>' + s + '</option>'; }).join("") + '</select></label>' +
      '<label class="full">Note<textarea name="notes" placeholder="Solo informazioni utili alla conferma.">' + esc(record.notes) + '</textarea></label>' +
      '<div class="pms240-modal-actions"><button type="button" class="secondary-button" data-pms240-close>Annulla</button><button type="submit" class="primary-button">Salva</button></div>' +
      '</form></div>';
    document.body.appendChild(wrap);
  }
  function readForm(form){
    var data = {};
    Array.prototype.forEach.call(form.elements, function(el){
      if (!el.name) return;
      data[el.name] = el.value;
    });
    return simplified(Object.assign(data, { updatedAt: new Date().toISOString() }));
  }
  function saveForm(event){
    event.preventDefault();
    var row = readForm(event.currentTarget);
    if (!row.counterparty) return alert("Inserisci cliente o fornitore.");
    if (!row.product) return alert("Inserisci prodotto o servizio.");
    if (!num(row.price)) return alert("Inserisci un prezzo valido.");
    var list = stateSafe()[MODULE];
    var index = list.findIndex(function(item){ return recordId(item) === row.id; });
    if (index >= 0) list[index] = Object.assign({}, list[index], row);
    else list.unshift(row);
    saveNow("v240-simple-price-confirmation");
    document.querySelectorAll(".pms240-modal-backdrop").forEach(function(node){ node.remove(); });
    if (!tryRenderCustom() && typeof render === "function") setTimeout(function(){ render(); }, 0);
  }
  function deleteRecord(id){
    var row = findRecord(id);
    if (!row) return;
    if (!confirm("Eliminare questa conferma prezzi?")) return;
    state[MODULE] = arr(state[MODULE]).filter(function(item){ return recordId(item) !== String(id); });
    saveNow("v240-delete-price-confirmation");
    if (!tryRenderCustom() && typeof render === "function") setTimeout(function(){ render(); }, 0);
  }
  function printRecord(id){
    var row = simplified(findRecord(id));
    if (!row.id) return alert("Conferma non trovata.");
    var title = row.direction === "Cliente" ? "CONFERMA PREZZO CLIENTE" : "CONFERMA PREZZO FORNITORE";
    var intro = row.direction === "Cliente"
      ? "Documento semplice per confermare al cliente prezzo, validita e condizioni essenziali."
      : "Documento semplice per registrare o confermare il prezzo ricevuto dal fornitore.";
    var header = typeof companyPrintHeader === "function" ? companyPrintHeader(title, row.id, row.counterparty) : '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>PARMITALIA</strong></div><div class="print-meta">' + esc(row.id) + '<br>' + esc(row.date) + '</div></div>';
    var html = '<div class="print-document">' + header +
      '<p>' + esc(intro) + '</p>' +
      '<table class="print-table"><tr><th>Data</th><td>' + esc(row.date || "-") + '</td><th>Tipo</th><td>' + esc(row.direction) + '</td></tr>' +
      '<tr><th>Controparte</th><td colspan="3">' + esc(row.counterparty || "-") + '</td></tr>' +
      '<tr><th>Prodotto / servizio</th><td colspan="3">' + esc(row.product || "-") + '</td></tr>' +
      '<tr><th>Prezzo</th><td>' + esc(money(row.price, row.currency, row.unit)) + '</td><th>Validita</th><td>' + esc(row.validity || "-") + '</td></tr>' +
      '<tr><th>Pagamento</th><td>' + esc(row.paymentTerms || "-") + '</td><th>Consegna / Incoterm</th><td>' + esc(row.deliveryTerms || "-") + '</td></tr>' +
      '<tr><th>Stato</th><td colspan="3">' + esc(row.status || "-") + '</td></tr>' +
      '<tr><th>Note</th><td colspan="3">' + esc(row.notes || "-") + '</td></tr></table>' +
      '<div class="print-signatures"><div>Parmitalia</div><div>Conferma controparte</div></div>' +
      '<div class="print-footer">Conferma prezzi Parmitalia - documento autonomo non collegato ad altri moduli</div></div>';
    if (typeof openPrint === "function") openPrint(html);
    else {
      var root = document.getElementById("print-root");
      if (root) root.innerHTML = html;
      window.print();
    }
  }
  function bindActions(){
    document.querySelectorAll("[data-pms240-new]").forEach(function(button){ button.onclick = function(){ modal(); }; });
    document.querySelectorAll("[data-pms240-edit]").forEach(function(button){ button.onclick = function(){ modal(findRecord(button.getAttribute("data-pms240-edit"))); }; });
    document.querySelectorAll("[data-pms240-print]").forEach(function(button){ button.onclick = function(){ printRecord(button.getAttribute("data-pms240-print")); }; });
    document.querySelectorAll("[data-pms240-delete]").forEach(function(button){ button.onclick = function(){ deleteRecord(button.getAttribute("data-pms240-delete")); }; });
    document.querySelectorAll("[data-pms240-search]").forEach(function(input){
      input.oninput = function(){ current.filters.pms240PriceSearch = input.value; if (typeof render === "function") render(); };
    });
    document.querySelectorAll("[data-pms240-direction]").forEach(function(select){
      select.onchange = function(){ current.filters.pms240PriceDirection = select.value; if (typeof render === "function") render(); };
    });
  }
  function cleanupLabels(){
    ensureModule();
    document.querySelectorAll('[data-page="' + MODULE + '"],[data-nav="' + MODULE + '"],[data-pms227-page="' + MODULE + '"],[data-pms231-page="' + MODULE + '"]').forEach(function(node){
      var label = node.querySelector(".pms227-label,.pms231-label,.nav-label,span:last-child");
      if (label && label.textContent !== "Conferme prezzi") label.textContent = "Conferme prezzi";
      else if (!label && /listini|fornitori|clal|prezzi/i.test(node.textContent || "") && node.textContent !== "Conferme prezzi") node.textContent = "Conferme prezzi";
      if (node.getAttribute("title") !== "Conferme prezzi") node.setAttribute("title", "Conferme prezzi");
    });
  }
  function tryRenderCustom(){
    if (typeof current === "undefined" || !current || current.page !== MODULE) return false;
    var content = document.getElementById("content");
    if (!content) return false;
    current.filters = current.filters || {};
    var title = document.getElementById("page-title");
    var subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = "Conferme prezzi";
    if (subtitle) subtitle.textContent = "Modulo semplice e autonomo";
    content.innerHTML = renderPage();
    bindActions();
    cleanupLabels();
    return true;
  }
  function wrap(name){
    var fn = window[name];
    if (typeof fn !== "function" || fn.__pms240Wrapped) return;
    var wrapped = function(){
      var result = fn.apply(this, arguments);
      try {
        ensureModule();
        if (!tryRenderCustom()) {
          setTimeout(function(){ cleanupLabels(); bindActions(); }, 60);
          setTimeout(cleanupLabels, 220);
        }
      } catch(error) {
        console.warn(VERSION + " render extension skipped", error);
      }
      return result;
    };
    wrapped.__pms240Wrapped = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch(error) {}
  }
  function install(){
    try {
      ensureModule();
      injectStyle();
      wrap("render");
      wrap("setPage");
      wrap("renderNav");
      document.addEventListener("click", function(event){
        var add = event.target && event.target.closest && event.target.closest('[data-add="' + MODULE + '"]');
        if (add) {
          event.preventDefault();
          event.stopPropagation();
          modal();
        }
        var close = event.target && event.target.closest && event.target.closest("[data-pms240-close]");
        if (close) {
          event.preventDefault();
          document.querySelectorAll(".pms240-modal-backdrop").forEach(function(node){ node.remove(); });
        }
      }, true);
      document.addEventListener("submit", function(event){
        if (event.target && event.target.id === "pms240-form") saveForm(event);
      }, true);
      [80, 240, 800, 1600].forEach(function(ms){
        setTimeout(function(){
          try {
            tryRenderCustom();
            cleanupLabels();
          } catch(error) {
            console.warn(VERSION + " deferred startup skipped", error);
          }
        }, ms);
      });
      window.PMS_V240_SIMPLE_PRICE_CONFIRMATIONS = {
        version: VERSION,
        refresh: function(){
          try {
            ensureModule();
            tryRenderCustom();
            cleanupLabels();
          } catch(error) {
            console.warn(VERSION + " manual refresh skipped", error);
          }
        }
      };
      console.info(VERSION + " loaded");
    } catch(error) {
      console.warn(VERSION + " disabled during startup", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
