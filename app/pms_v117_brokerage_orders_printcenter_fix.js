(function(){
  "use strict";
  const VERSION = "PMS-V117-BROKERAGE-ORDERS-PRINTCENTER-FIX";

  function arr(v){ return Array.isArray(v) ? v : []; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(v,c){ return (typeof formatMoney === "function") ? formatMoney(v,c || "EUR") : (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY,JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function next(prefix,list){
    const year = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String(x && (x.id || x.code || x.protocol) || "").match(re);
      return m ? Math.max(a,Number(m[1])) : a;
    },0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4,"0");
  }
  function header(title,code,sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    const s = state.settings || {};
    const logo = s.logoUrl ? '<img class="print-logo" src="' + esc(s.logoUrl) + '" alt="Logo">' : "";
    return '<div class="print-header"><div>' + logo + '<h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(sub || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code || "PMS");
    if (typeof renderQrLite === "function") return renderQrLite(code || "PMS");
    return '<strong>' + esc(code || "") + '</strong>';
  }
  function printHtml(html){ if (typeof openPrint === "function") openPrint(html); else { const root = document.getElementById("print-root"); if (root) root.innerHTML = html; window.print(); } }

  function ensure(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.brokerageDeals = arr(state.brokerageDeals);
    state.deletedOrdersLog = arr(state.deletedOrdersLog);
    state.deletedBrokerageLog = arr(state.deletedBrokerageLog);
    state.settings = state.settings || {};
    state.settings.orderPrintProtocolCounters = state.settings.orderPrintProtocolCounters || {};
    if (typeof modules !== "undefined") {
      const b = modules.find(m => m.id === "commercialBrokerage");
      if (b) { b.label = "Commerciale / Brokeraggio"; b.subtitle = "Operazioni commerciali modificabili con cliente, fornitore, prodotto, valore e margine"; }
      const p = modules.find(m => m.id === "print");
      if (p) { p.label = "Centro stampe"; p.subtitle = "Stampa qualsiasi documento presente nel gestionale"; }
    }
  }

  function css(){
    if (document.getElementById("pms-v117-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v117-style";
    s.textContent = [
      ".pms117-page{display:grid;gap:14px}",
      ".pms117-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}",
      ".pms117-hero h3{margin:2px 0 6px;color:#fff}.pms117-hero p{margin:0;color:#dbeafe}",
      ".pms117-actions,.pms117-row-actions,.pms117-print-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
      ".pms117-actions button,.pms117-row-actions button,.pms117-print-actions button{width:auto!important;margin:0!important}",
      ".pms117-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}",
      ".pms117-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}",
      ".pms117-kpi{border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:12px}.pms117-kpi span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.pms117-kpi strong{display:block;font-size:22px;color:#0f2f4a;margin-top:5px}",
      ".pms117-table{width:100%;border-collapse:collapse}.pms117-table th,.pms117-table td{border-bottom:1px solid var(--line);padding:9px;text-align:left;vertical-align:top}.pms117-table th{font-size:11px;text-transform:uppercase;color:var(--muted);background:#eef4fb}",
      ".pms117-delete{background:#fee2e2!important;border-color:#fecaca!important;color:#991b1b!important}",
      ".pms117-modal{position:fixed;inset:0;z-index:26000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:14px}",
      ".pms117-modal-card{width:min(1120px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.32)}",
      ".pms117-modal-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:2}.pms117-modal-body{padding:16px}.pms117-modal-actions{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--line);padding:12px 16px;display:flex;justify-content:flex-end;gap:8px}",
      ".pms117-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.pms117-form .half{grid-column:span 2}.pms117-form .full{grid-column:1/-1}.pms117-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms117-form textarea{min-height:110px;line-height:1.45}",
      ".pms117-print-selectors{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;align-items:end}.pms117-print-selectors label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}",
      "@media(max-width:900px){.pms117-hero{display:grid}.pms117-form{grid-template-columns:1fr}.pms117-form .half{grid-column:1/-1}}"
    ].join("");
    document.head.appendChild(s);
  }

  function contactOptions(role){
    const items = [];
    arr(state.contacts).forEach(c => {
      const name = c.name || c.company || c.businessName || c.client || c.supplier;
      if (!name) return;
      const type = String(c.type || c.role || c.category || "").toLowerCase();
      if (!role || type.includes(role) || role === "client" && /cliente|client/.test(type) || role === "supplier" && /fornitore|supplier/.test(type)) items.push(name);
    });
    arr(state.clients).forEach(c => c && (c.name || c.company) && items.push(c.name || c.company));
    arr(state.suppliers).forEach(c => c && (c.name || c.company) && items.push(c.name || c.company));
    return Array.from(new Set(items)).sort();
  }
  function productOptions(){
    const items = [];
    arr(state.products).forEach(p => { const name = p.name || p.product || p.articleCode || p.code; if (name) items.push(name); });
    arr(state.offers).forEach(o => { if (o.product) items.push(o.product); });
    arr(state.orders).forEach(o => { if (o.product) items.push(o.product); });
    return Array.from(new Set(items)).sort();
  }
  function datalist(id,items){ return '<datalist id="' + esc(id) + '">' + items.map(x => '<option value="' + esc(x) + '"></option>').join("") + '</datalist>'; }
  function optionList(items,current){ return items.map(x => '<option ' + (String(x) === String(current || "") ? "selected" : "") + '>' + esc(x) + '</option>').join(""); }
  function readNamed(w,base){
    const item = Object.assign({},base || {});
    w.querySelectorAll("[name]").forEach(el => item[el.name] = el.value);
    item.updatedAt = new Date().toISOString();
    item.createdAt = item.createdAt || item.updatedAt;
    return item;
  }
  function modal(title,body,onSave){
    document.getElementById("pms117-modal")?.remove();
    const w = document.createElement("div");
    w.id = "pms117-modal";
    w.className = "pms117-modal";
    w.innerHTML = '<div class="pms117-modal-card"><div class="pms117-modal-head"><h3>' + esc(title) + '</h3><button class="secondary-button" data-close>Chiudi</button></div><div class="pms117-modal-body">' + body + '</div><div class="pms117-modal-actions"><button class="secondary-button" data-close>Annulla</button><button class="primary-button" data-save>Salva</button></div></div>';
    document.body.appendChild(w);
    w.querySelectorAll("[data-close]").forEach(b => b.onclick = () => w.remove());
    w.querySelector("[data-save]").onclick = () => onSave(w);
    return w;
  }

  function brokerForm(item){
    item = item || {};
    const id = item.id || next("BRK",state.brokerageDeals);
    return datalist("pms117-clients",contactOptions("client")) + datalist("pms117-suppliers",contactOptions("supplier")) + datalist("pms117-products",productOptions()) +
      '<div class="pms117-form">' +
      '<label>Protocollo<input name="id" value="' + esc(id) + '" readonly></label>' +
      '<label>Data<input type="date" name="date" value="' + esc(item.date || today()) + '"></label>' +
      '<label>Stato<select name="status">' + optionList(["Aperta","In trattativa","Offerta inviata","In attesa","Confermata","Persa","Chiusa"],item.status || "Aperta") + '</select></label>' +
      '<label>Prossima azione<input name="nextAction" value="' + esc(item.nextAction || "") + '" placeholder="Telefonare, inviare offerta, confermare prezzo"></label>' +
      '<label class="half">Cliente<input name="client" list="pms117-clients" value="' + esc(item.client || "") + '" placeholder="Scrivi o scegli cliente"></label>' +
      '<label class="half">Fornitore<input name="supplier" list="pms117-suppliers" value="' + esc(item.supplier || "") + '" placeholder="Scrivi o scegli fornitore"></label>' +
      '<label class="half">Prodotto<input name="product" list="pms117-products" value="' + esc(item.product || "") + '" placeholder="Scrivi o scegli prodotto"></label>' +
      '<label>Quantita<input type="number" step="0.01" name="quantity" value="' + esc(item.quantity || "") + '"></label>' +
      '<label>Unita<select name="unit">' + optionList(["kg","ton","pallet","camion","container","pezzi","cartoni"],item.unit || "kg") + '</select></label>' +
      '<label>Valore operazione<input type="number" step="0.01" name="value" value="' + esc(item.value || "") + '"></label>' +
      '<label>Valuta<select name="currency">' + optionList(["EUR","RON","USD"],item.currency || "EUR") + '</select></label>' +
      '<label>Margine %<input type="number" step="0.01" name="marginPct" value="' + esc(item.marginPct || "") + '"></label>' +
      '<label>Margine importo<input type="number" step="0.01" name="marginValue" value="' + esc(item.marginValue || "") + '"></label>' +
      '<label>Probabilita %<input type="number" step="1" name="probability" value="' + esc(item.probability || "") + '"></label>' +
      '<label>Responsabile<input name="owner" value="' + esc(item.owner || (window.current && current.user) || "") + '"></label>' +
      '<label class="full">Note operazione<textarea name="notes">' + esc(item.notes || "") + '</textarea></label>' +
      '</div>';
  }
  function editBroker(id){
    ensure();
    const old = state.brokerageDeals.find(x => String(x.id) === String(id));
    modal(old ? "Modifica operazione brokeraggio " + old.id : "Nuova operazione brokeraggio",brokerForm(old),w => {
      const item = readNamed(w,old || {});
      if (!item.marginValue && item.value && item.marginPct) item.marginValue = (num(item.value) * num(item.marginPct) / 100).toFixed(2);
      const i = state.brokerageDeals.findIndex(x => String(x.id) === String(item.id));
      if (i >= 0) state.brokerageDeals[i] = item; else state.brokerageDeals.unshift(item);
      saveState();
      w.remove();
      render();
    });
  }
  function deleteBroker(id){
    ensure();
    const i = state.brokerageDeals.findIndex(x => String(x.id) === String(id));
    if (i < 0) return alert("Operazione non trovata.");
    const item = state.brokerageDeals[i];
    if (!confirm("Eliminare definitivamente l'operazione " + id + " - " + (item.client || item.product || "") + "?")) return;
    state.deletedBrokerageLog.unshift({id:"DEL-BRK-" + Date.now(),brokerageId:id,deletedAt:new Date().toISOString(),deletedBy:(window.current && current.user) || "utente"});
    state.brokerageDeals.splice(i,1);
    saveState();
    render();
  }
  function brokerPrintHtml(item){
    const code = item.id || "BRK";
    return '<div class="print-document">' + header("SCHEDA BROKERAGGIO",code,"Documento riservato commerciale") +
      '<table class="print-table"><tr><th>Cliente</th><td>' + esc(item.client || "-") + '</td><th>Fornitore</th><td>' + esc(item.supplier || "-") + '</td></tr><tr><th>Prodotto</th><td>' + esc(item.product || "-") + '</td><th>Stato</th><td>' + esc(item.status || "-") + '</td></tr><tr><th>Quantita</th><td>' + esc(item.quantity || "-") + " " + esc(item.unit || "") + '</td><th>Valore</th><td>' + esc(money(item.value,item.currency)) + '</td></tr><tr><th>Margine</th><td>' + esc(item.marginPct || "-") + '% / ' + esc(money(item.marginValue,item.currency)) + '</td><th>Probabilita</th><td>' + esc(item.probability || "-") + '%</td></tr><tr><th>Prossima azione</th><td colspan="3">' + esc(item.nextAction || "-") + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(item.notes || "-") + '</td></tr></table>' +
      '<div style="margin-top:5mm">' + barcode(code) + '</div><div class="print-footer">Documento riservato Parmitalia - Brokeraggio - ' + esc(code) + '</div></div>';
  }
  function printBroker(id){
    const item = state.brokerageDeals.find(x => String(x.id) === String(id));
    if (!item) return alert("Operazione non trovata.");
    printHtml(brokerPrintHtml(item));
  }
  function renderBrokerage(){
    ensure(); css();
    const total = state.brokerageDeals.reduce((a,x) => a + num(x.value),0);
    const margin = state.brokerageDeals.reduce((a,x) => a + num(x.marginValue || (num(x.value) * num(x.marginPct) / 100)),0);
    const rows = state.brokerageDeals.map(x => '<tr><td><span class="code-block">' + esc(x.id) + '</span><br><small>' + esc(x.date || "") + '</small></td><td><strong>' + esc(x.client || "-") + '</strong><br><small>Forn. ' + esc(x.supplier || "-") + '</small></td><td><strong>' + esc(x.product || "-") + '</strong><br><small>' + esc(x.quantity || "-") + " " + esc(x.unit || "") + '</small></td><td>' + esc(money(x.value,x.currency)) + '<br><small>Margine ' + esc(x.marginPct || "-") + '% / ' + esc(money(x.marginValue || (num(x.value) * num(x.marginPct) / 100),x.currency)) + '</small></td><td>' + esc(x.status || "Aperta") + '<br><small>' + esc(x.nextAction || "") + '</small></td><td><div class="pms117-row-actions"><button class="inline-button" data-pms117-brk-edit="' + esc(x.id) + '">Modifica</button><button class="inline-button" data-pms117-brk-print="' + esc(x.id) + '">Stampa</button><button class="inline-button pms117-delete" data-pms117-brk-delete="' + esc(x.id) + '">Elimina</button></div></td></tr>').join("");
    return '<div class="pms117-page"><section class="pms117-hero"><div><span>BRK</span><h3>Commerciale / Brokeraggio</h3><p>Operazioni commerciali con cliente, fornitore, prodotto, valore, margine, probabilita e prossima azione.</p></div><div class="pms117-actions"><button class="primary-button" data-pms117-brk-new>+ Nuova operazione</button><button class="secondary-button" data-pms117-brk-print-all>Stampa registro</button></div></section><div class="pms117-grid"><div class="pms117-kpi"><span>Operazioni</span><strong>' + state.brokerageDeals.length + '</strong></div><div class="pms117-kpi"><span>Valore</span><strong>' + esc(money(total,"EUR")) + '</strong></div><div class="pms117-kpi"><span>Margine</span><strong>' + esc(money(margin,"EUR")) + '</strong></div></div><div class="pms117-card"><div class="table-wrap"><table class="pms117-table"><thead><tr><th>Protocollo</th><th>Cliente / Fornitore</th><th>Prodotto</th><th>Valore / Margine</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessuna operazione registrata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function printBrokerRegister(){
    const rows = state.brokerageDeals.map(x => '<tr><td>' + esc(x.id) + '</td><td>' + esc(x.client || "-") + '</td><td>' + esc(x.supplier || "-") + '</td><td>' + esc(x.product || "-") + '</td><td>' + esc(money(x.value,x.currency)) + '</td><td>' + esc(x.marginPct || "-") + '%</td><td>' + esc(x.status || "-") + '</td></tr>').join("");
    printHtml('<div class="print-document">' + header("REGISTRO BROKERAGGIO","BRK-" + today(),"Operazioni commerciali") + '<table class="print-table"><thead><tr><th>ID</th><th>Cliente</th><th>Fornitore</th><th>Prodotto</th><th>Valore</th><th>Margine</th><th>Stato</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">Nessuna operazione.</td></tr>') + '</tbody></table><div class="print-footer">Registro brokeraggio Parmitalia</div></div>');
  }

  function orderCode(o){ return o && (o.code || o.id) || "-"; }
  function findOrder(id){ return state.orders.find(o => String(o.id) === String(id) || String(o.code) === String(id)); }
  function parseLines(order){
    if (order && order.orderLineItemsJson) { try { const x = JSON.parse(order.orderLineItemsJson); if (Array.isArray(x) && x.length) return x; } catch(e){} }
    if (Array.isArray(order && order.lines) && order.lines.length) return order.lines;
    return [{articleCode:order.articleCode || "",product:order.product || "",description:order.description || "",quantity:order.quantity || "",unit:order.unit || "",unitPrice:order.unitPrice || order.price || "",currency:order.currency || "EUR",discountPct:order.discountPct || 0}];
  }
  function lineTotal(line){ return num(line.quantity) * num(line.unitPrice == null ? line.price : line.unitPrice) * (1 - Math.max(0,Math.min(100,num(line.discountPct))) / 100); }
  function orderTotal(o){ const lines = parseLines(o); const total = lines.reduce((a,l) => a + lineTotal(l),0); return total || num(o.total || o.value); }
  function nextOrderProtocol(type){
    const prefix = type === "supplier" ? "ORD-FOR" : type === "internal" ? "ORD-INT" : "ORD-CLI";
    const year = new Date().getFullYear();
    const key = prefix + "-" + year;
    const current = num(state.settings.orderPrintProtocolCounters[key]);
    state.settings.orderPrintProtocolCounters[key] = current + 1;
    return prefix + "-" + year + "-" + String(current + 1).padStart(4,"0");
  }
  function ensureOrderProtocol(order,type){
    const field = type === "supplier" ? "supplierPrintProtocol" : type === "internal" ? "internalPrintProtocol" : "customerPrintProtocol";
    if (!order[field]) { order[field] = nextOrderProtocol(type); order[field + "Date"] = today(); saveState(); }
    return order[field];
  }
  function linesTable(order,type){
    const showPrices = type !== "supplier";
    const rows = parseLines(order).filter(l => l.product || l.articleCode || l.quantity || l.unitPrice).map((l,i) => {
      const desc = l.description ? '<br><small>' + esc(l.description) + '</small>' : "";
      if (showPrices) return '<tr><td>' + (i + 1) + '</td><td>' + esc(l.articleCode || l.supplierArticleCode || "-") + '</td><td><strong>' + esc(l.product || "-") + '</strong>' + desc + '</td><td>' + esc(l.quantity || "-") + '</td><td>' + esc(l.unit || "-") + '</td><td>' + esc(money(l.unitPrice == null ? l.price : l.unitPrice,l.currency || order.currency)) + '</td><td><strong>' + esc(money(lineTotal(l),l.currency || order.currency)) + '</strong></td></tr>';
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(l.articleCode || l.supplierArticleCode || "-") + '</td><td><strong>' + esc(l.product || "-") + '</strong>' + desc + '</td><td>' + esc(l.quantity || "-") + '</td><td>' + esc(l.unit || "-") + '</td><td>' + esc(l.supplierNotes || order.supplierPrintNotes || "-") + '</td></tr>';
    }).join("");
    return showPrices ? '<table class="print-table"><thead><tr><th>#</th><th>Codice</th><th>Articolo</th><th>Quantita</th><th>Unita</th><th>Prezzo</th><th>Subtotale</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">Nessun articolo.</td></tr>') + '</tbody></table><div class="pms110-total"><strong>Totale ordine:</strong> ' + esc(money(orderTotal(order),order.currency || "EUR")) + '</div>' : '<table class="print-table"><thead><tr><th>#</th><th>Codice</th><th>Articolo</th><th>Quantita</th><th>Unita</th><th>Note fornitore</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun articolo.</td></tr>') + '</tbody></table>';
  }
  function orderPrintHtml(order,type){
    const protocol = ensureOrderProtocol(order,type);
    const title = type === "supplier" ? "CONFERMA ORDINE FORNITORE" : type === "internal" ? "ORDINE INTERNO RISERVATO" : "CONFERMA ORDINE CLIENTE";
    const sub = type === "supplier" ? "Copia fornitore" : type === "internal" ? "Uso interno Parmitalia" : "Copia cliente";
    const parties = type === "supplier" ?
      '<table class="print-table"><tr><th>Fornitore</th><td>' + esc(order.supplier || "-") + '</td><th>Protocollo fornitore</th><td>' + esc(protocol) + '</td></tr><tr><th>Cliente finale</th><td>' + esc(order.client || "-") + '</td><th>Data ordine</th><td>' + esc(order.orderDate || order.requestedDate || today()) + '</td></tr></table>' :
      '<table class="print-table"><tr><th>Cliente</th><td>' + esc(order.client || "-") + '</td><th>Protocollo cliente</th><td>' + esc(protocol) + '</td></tr><tr><th>Fornitore</th><td>' + esc(order.supplier || "-") + '</td><th>Data ordine</th><td>' + esc(order.orderDate || order.requestedDate || today()) + '</td></tr></table>';
    const terms = '<table class="print-table"><tr><th>Pagamento</th><td>' + esc(order.paymentTerms || "-") + '</td><th>Consegna/logistica</th><td>' + esc(order.delivery || "-") + '</td></tr><tr><th>Consegna prevista</th><td>' + esc(order.expectedDelivery || "-") + '</td><th>Offerta collegata</th><td>' + esc(order.linkedOffer || "-") + '</td></tr><tr><th>Note</th><td colspan="3">' + esc((type === "supplier" ? order.supplierPrintNotes : order.customerPrintNotes) || order.notes || order.description || "-") + '</td></tr>' + (type === "internal" ? '<tr><th>Margine/provvigione interna</th><td colspan="3">' + esc(order.commission || order.margin || order.commissionStatus || "-") + '</td></tr>' : "") + '</table>';
    return '<div class="print-document">' + header(title,protocol,sub) + parties + linesTable(order,type) + terms + '<div style="margin-top:5mm">' + barcode(protocol) + '</div><div class="pms110-signatures"><div>Firma Parmitalia</div><div>Firma per conferma</div></div><div class="print-footer">Documento riservato Parmitalia - Protocollo ' + esc(protocol) + ' - Ordine ' + esc(orderCode(order)) + '</div></div>';
  }
  function printOrder(id,type){
    const o = findOrder(id);
    if (!o) return alert("Ordine non trovato.");
    printHtml(orderPrintHtml(o,type || "internal"));
  }
  function deleteOrder(id){
    const i = state.orders.findIndex(o => String(o.id) === String(id) || String(o.code) === String(id));
    if (i < 0) return alert("Ordine non trovato.");
    const item = state.orders[i];
    if (!confirm("Eliminare definitivamente l'ordine " + orderCode(item) + " - " + (item.client || item.product || "") + "?")) return;
    state.deletedOrdersLog.unshift({id:"DEL-ORD-" + Date.now(),orderId:item.id,code:orderCode(item),deletedAt:new Date().toISOString(),deletedBy:(window.current && current.user) || "utente"});
    state.orders.splice(i,1);
    saveState();
    render();
  }
  function renderOrdersFixed(){
    ensure(); css();
    const open = state.orders.filter(o => !/chius|annull|fatturat/i.test(String(o.status || ""))).length;
    const rows = state.orders.map(o => '<tr><td><span class="code-block">' + esc(orderCode(o)) + '</span><br><small>' + esc(o.orderDate || o.requestedDate || "") + '</small></td><td><strong>' + esc(o.client || "-") + '</strong><br><small>Forn. ' + esc(o.supplier || "-") + '</small></td><td><strong>' + esc(o.product || "-") + '</strong><br><small>' + esc(o.orderType || "") + '</small></td><td>' + esc(o.quantity || "") + " " + esc(o.unit || "") + '<br><small>' + esc(money(orderTotal(o),o.currency || "EUR")) + '</small></td><td>' + esc(o.status || "Nuovo") + '</td><td><div class="pms117-row-actions"><button class="inline-button" data-edit="orders" data-id="' + esc(o.id) + '">Modifica</button><button class="inline-button" data-pms117-order-print-customer="' + esc(o.id) + '">Stampa cliente</button><button class="inline-button" data-pms117-order-print-supplier="' + esc(o.id) + '">Stampa fornitore</button><button class="inline-button" data-pms117-order-print-internal="' + esc(o.id) + '">Stampa interna</button><button class="inline-button pms117-delete" data-pms117-order-delete="' + esc(o.id) + '">Elimina</button></div></td></tr>').join("");
    return '<div class="pms117-page"><section class="pms117-hero"><div><span>ORD</span><h3>Ordini</h3><p>Gestione ordini con stampa cliente, stampa fornitore, stampa interna, modifica ed eliminazione.</p></div><div class="pms117-actions"><button class="primary-button" data-new="orders">+ Nuovo ordine</button><button class="secondary-button" data-nav="print">Centro stampe</button></div></section><div class="pms117-grid"><div class="pms117-kpi"><span>Ordini totali</span><strong>' + state.orders.length + '</strong></div><div class="pms117-kpi"><span>Aperti</span><strong>' + open + '</strong></div><div class="pms117-kpi"><span>Valore</span><strong>' + esc(money(state.orders.reduce((a,o) => a + orderTotal(o),0),"EUR")) + '</strong></div></div><div class="pms117-card"><div class="table-wrap"><table class="pms117-table"><thead><tr><th>Codice</th><th>Cliente / Fornitore</th><th>Prodotto</th><th>Quantita / valore</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun ordine registrato.</td></tr>') + '</tbody></table></div></div></div>';
  }

  const registries = [
    {key:"orders",label:"Ordini",title:"ORDINE",print:(item,type) => orderPrintHtml(item,type || "internal"),id:x => x.id || x.code,labelOf:x => (orderCode(x) + " - " + (x.client || "-") + " - " + (x.product || "-"))},
    {key:"brokerageDeals",label:"Brokeraggio commerciale",title:"SCHEDA BROKERAGGIO",print:brokerPrintHtml,id:x => x.id,labelOf:x => (x.id + " - " + (x.client || "-") + " - " + (x.product || "-"))},
    {key:"offers",label:"Offerte",title:"OFFERTA",id:x => x.id || x.code,labelOf:x => ((x.code || x.id) + " - " + (x.client || "-") + " - " + (x.product || "-"))},
    {key:"contracts",label:"Contratti",title:"CONTRATTO",id:x => x.id,labelOf:x => (x.id + " - " + (x.counterparty || x.type || "-"))},
    {key:"officialDocuments",label:"Comunicazioni ufficiali",title:"DOCUMENTO PROTOCOLLATO",id:x => x.id || x.protocol,labelOf:x => ((x.protocol || x.id) + " - " + (x.subject || x.recipient || "-"))},
    {key:"officialCommunications",label:"Comunicazioni ufficiali",title:"DOCUMENTO PROTOCOLLATO",id:x => x.id || x.protocol,labelOf:x => ((x.protocol || x.id) + " - " + (x.subject || x.recipient || "-"))},
    {key:"tenders",label:"Tender / Gare",title:"TENDER",id:x => x.id || x.code,labelOf:x => ((x.id || x.code) + " - " + (x.client || x.title || x.product || "-"))},
    {key:"products",label:"Prodotti",title:"SCHEDA PRODOTTO",id:x => x.id || x.code || x.name,labelOf:x => ((x.code || x.id || "") + " - " + (x.name || x.product || "-"))},
    {key:"contacts",label:"Anagrafiche",title:"SCHEDA ANAGRAFICA",id:x => x.id || x.name || x.company,labelOf:x => ((x.id || "") + " - " + (x.name || x.company || "-"))},
    {key:"supplierPriceConfirmations",label:"Conferme prezzi fornitori",title:"CONFERMA PREZZI",id:x => x.id || x.code,labelOf:x => ((x.id || x.code) + " - " + (x.supplier || "-") + " - " + (x.product || "-"))},
    {key:"negotiations",label:"Trattative in corso",title:"SCHEDA TRATTATIVA",id:x => x.id,labelOf:x => (x.id + " - " + (x.client || "-") + " - " + (x.product || "-"))},
    {key:"intermediations",label:"Intermediazioni",title:"INTERMEDIAZIONE",id:x => x.id,labelOf:x => (x.id + " - " + (x.client || "-") + " - " + (x.product || "-"))},
    {key:"documents",label:"Archivio documenti",title:"DOCUMENTO",id:x => x.id || x.code,labelOf:x => ((x.id || x.code) + " - " + (x.title || x.docType || "-"))},
    {key:"legalClaims",label:"Pratiche legali",title:"PRATICA LEGALE",id:x => x.id || x.protocol,labelOf:x => ((x.id || x.protocol) + " - " + (x.counterparty || x.subject || "-"))},
    {key:"outgoingInvoices",label:"Fatture uscita",title:"FATTURA USCITA",id:x => x.id || x.protocol || x.number,labelOf:x => ((x.protocol || x.number || x.id) + " - " + (x.partyName || x.client || "-"))},
    {key:"incomingInvoices",label:"Fatture entrata",title:"FATTURA ENTRATA",id:x => x.id || x.protocol || x.number,labelOf:x => ((x.protocol || x.number || x.id) + " - " + (x.partyName || x.supplier || "-"))},
    {key:"payments",label:"Pagamenti",title:"PAGAMENTO",id:x => x.id || x.code,labelOf:x => ((x.id || x.code) + " - " + (x.party || x.client || x.supplier || "-"))},
    {key:"accountantDocuments",label:"Commercialista",title:"DOSSIER COMMERCIALISTA",id:x => x.id || x.protocol,labelOf:x => ((x.id || x.protocol) + " - " + (x.title || x.type || "-"))}
  ];
  function availableRegistries(){
    const seen = new Set();
    return registries.filter(r => !seen.has(r.key) && seen.add(r.key) && arr(state[r.key]).length);
  }
  function genericPrintHtml(reg,item){
    const code = (reg.id && reg.id(item)) || item.id || item.code || item.protocol || "DOC";
    const rows = Object.keys(item).filter(k => !/json|html/i.test(k)).slice(0,60).map(k => '<tr><th>' + esc(k) + '</th><td>' + esc(Array.isArray(item[k]) ? JSON.stringify(item[k]) : item[k]) + '</td></tr>').join("");
    return '<div class="print-document">' + header(reg.title || reg.label,code,"Documento riservato Parmitalia") + '<table class="print-table"><tbody>' + rows + '</tbody></table><div style="margin-top:5mm">' + barcode(code) + '</div><div class="print-footer">Documento riservato Parmitalia - ' + esc(reg.label) + ' - ' + esc(code) + '</div></div>';
  }
  function printAny(moduleKey,id,type){
    const reg = registries.find(r => r.key === moduleKey);
    if (!reg) return alert("Archivio non trovato.");
    const item = arr(state[moduleKey]).find(x => String((reg.id && reg.id(x)) || x.id || x.code || x.protocol) === String(id));
    if (!item) return alert("Documento non trovato.");
    printHtml(reg.print ? reg.print(item,type) : genericPrintHtml(reg,item));
  }
  function renderPrintCenterFixed(){
    ensure(); css();
    const regs = availableRegistries();
    const first = regs[0];
    const moduleOptions = regs.map(r => '<option value="' + esc(r.key) + '">' + esc(r.label) + " (" + arr(state[r.key]).length + ')</option>').join("");
    const docs = first ? arr(state[first.key]).map(x => '<option value="' + esc((first.id && first.id(x)) || x.id || x.code || x.protocol) + '">' + esc(first.labelOf ? first.labelOf(x) : ((first.id && first.id(x)) || x.id || x.code || "-")) + '</option>').join("") : "";
    return '<div class="pms117-page"><section class="pms117-hero"><div><span>PRN</span><h3>Centro stampe</h3><p>Seleziona qualsiasi archivio e stampa il documento presente nel gestionale.</p></div><div class="pms117-actions"><button class="secondary-button" data-pms117-refresh-print>Ricarica elenco</button></div></section><div class="pms117-card"><div class="pms117-print-selectors"><label>Archivio<select id="pms117-print-module">' + (moduleOptions || '<option value="">Nessun documento disponibile</option>') + '</select></label><label>Documento<select id="pms117-print-doc">' + (docs || '<option value="">Nessun documento</option>') + '</select></label><div class="pms117-print-actions"><button class="primary-button" data-pms117-print-any>Stampa documento</button><button class="secondary-button" data-pms117-print-order-customer style="display:none">Stampa cliente</button><button class="secondary-button" data-pms117-print-order-supplier style="display:none">Stampa fornitore</button><button class="secondary-button" data-pms117-print-order-internal style="display:none">Stampa interna</button></div></div></div><div class="pms117-card"><div class="table-wrap"><table class="pms117-table"><thead><tr><th>Archivio</th><th>Documenti disponibili</th></tr></thead><tbody>' + (regs.map(r => '<tr><td>' + esc(r.label) + '</td><td>' + arr(state[r.key]).length + '</td></tr>').join("") || '<tr><td colspan="2">Nessun documento disponibile.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function refreshPrintDocs(){
    const mod = document.getElementById("pms117-print-module");
    const doc = document.getElementById("pms117-print-doc");
    if (!mod || !doc) return;
    const reg = registries.find(r => r.key === mod.value);
    doc.innerHTML = reg ? arr(state[reg.key]).map(x => '<option value="' + esc((reg.id && reg.id(x)) || x.id || x.code || x.protocol) + '">' + esc(reg.labelOf ? reg.labelOf(x) : ((reg.id && reg.id(x)) || x.id || x.code || "-")) + '</option>').join("") : "";
    const isOrder = mod.value === "orders";
    document.querySelectorAll("[data-pms117-print-order-customer],[data-pms117-print-order-supplier],[data-pms117-print-order-internal]").forEach(b => b.style.display = isOrder ? "" : "none");
  }

  function bind(){
    ensure(); css();
    document.querySelector("[data-pms117-brk-new]")?.addEventListener("click",() => editBroker());
    document.querySelector("[data-pms117-brk-print-all]")?.addEventListener("click",printBrokerRegister);
    document.querySelectorAll("[data-pms117-brk-edit]").forEach(b => b.onclick = () => editBroker(b.dataset.pms117BrkEdit));
    document.querySelectorAll("[data-pms117-brk-print]").forEach(b => b.onclick = () => printBroker(b.dataset.pms117BrkPrint));
    document.querySelectorAll("[data-pms117-brk-delete]").forEach(b => b.onclick = () => deleteBroker(b.dataset.pms117BrkDelete));
    document.querySelectorAll("[data-pms117-order-print-customer]").forEach(b => b.onclick = () => printOrder(b.dataset.pms117OrderPrintCustomer,"customer"));
    document.querySelectorAll("[data-pms117-order-print-supplier]").forEach(b => b.onclick = () => printOrder(b.dataset.pms117OrderPrintSupplier,"supplier"));
    document.querySelectorAll("[data-pms117-order-print-internal]").forEach(b => b.onclick = () => printOrder(b.dataset.pms117OrderPrintInternal,"internal"));
    document.querySelectorAll("[data-pms117-order-delete]").forEach(b => b.onclick = () => deleteOrder(b.dataset.pms117OrderDelete));
    const mod = document.getElementById("pms117-print-module");
    if (mod) { mod.onchange = refreshPrintDocs; refreshPrintDocs(); }
    document.querySelector("[data-pms117-refresh-print]")?.addEventListener("click",() => { if (typeof render === "function") render(); });
    document.querySelector("[data-pms117-print-any]")?.addEventListener("click",() => { const m = document.getElementById("pms117-print-module"); const d = document.getElementById("pms117-print-doc"); if (m && d && m.value && d.value) printAny(m.value,d.value,m.value === "orders" ? "internal" : "generic"); });
    document.querySelector("[data-pms117-print-order-customer]")?.addEventListener("click",() => { const d = document.getElementById("pms117-print-doc"); if (d && d.value) printAny("orders",d.value,"customer"); });
    document.querySelector("[data-pms117-print-order-supplier]")?.addEventListener("click",() => { const d = document.getElementById("pms117-print-doc"); if (d && d.value) printAny("orders",d.value,"supplier"); });
    document.querySelector("[data-pms117-print-order-internal]")?.addEventListener("click",() => { const d = document.getElementById("pms117-print-doc"); if (d && d.value) printAny("orders",d.value,"internal"); });
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms117RenderWrapped) {
    window.__pms117RenderWrapped = true;
    render = function(){
      ensure(); css();
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (content && window.current && current.page === "commercialBrokerage") {
        if (title) title.textContent = "Commerciale / Brokeraggio";
        if (subtitle) subtitle.textContent = "Operazioni commerciali con inserimento completo";
        content.innerHTML = renderBrokerage();
        bind();
        return;
      }
      if (content && window.current && current.page === "orders") {
        if (title) title.textContent = "Ordini";
        if (subtitle) subtitle.textContent = "Stampa cliente, stampa fornitore, stampa interna, modifica ed elimina";
        content.innerHTML = renderOrdersFixed();
        bind();
        if (typeof bindPageActions === "function") bindPageActions();
        return;
      }
      if (content && window.current && current.page === "print") {
        if (title) title.textContent = "Centro stampe";
        if (subtitle) subtitle.textContent = "Stampa qualsiasi documento presente nel gestionale";
        content.innerHTML = renderPrintCenterFixed();
        bind();
        return;
      }
      const r = baseRender.apply(this,arguments);
      setTimeout(bind,120);
      return r;
    };
  }
  if (typeof renderPrintCenter === "function" && !window.__pms117PrintCenterWrapped) {
    window.__pms117PrintCenterWrapped = true;
    renderPrintCenter = renderPrintCenterFixed;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms117BindWrapped) {
    window.__pms117BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); setTimeout(bind,80); return r; };
  }
  ensure(); css(); setTimeout(bind,220);
  window.pmsV117BrokerageOrdersPrintCenterFix = {version:VERSION,printOrder:printOrder,printAny:printAny,editBroker:editBroker};
})();
