(function(){
  "use strict";
  const VERSION = "PMS-V110-ORDER-PRINT-BUTTONS";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function orderCode(o){ return o && (o.code || o.id) || "-"; }
  function findOrder(id){ return arr(state && state.orders).find(o => String(o.id) === String(id) || String(o.code) === String(id)); }
  function barcode(code){ return typeof renderBarcode === "function" ? renderBarcode(code) : (typeof renderQrLite === "function" ? renderQrLite(code) : "<strong>" + esc(code) + "</strong>"); }
  function header(title,code,sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    const s = state.settings || {};
    const logo = s.logoUrl ? '<img class="print-logo" src="' + esc(s.logoUrl) + '" alt="Logo">' : "";
    return '<div class="print-header"><div>' + logo + '<h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(sub || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function nextProtocol(prefix,field){
    state.settings = state.settings || {};
    state.settings.orderPrintProtocolCounters110 = state.settings.orderPrintProtocolCounters110 || {};
    const year = new Date().getFullYear();
    const key = prefix + "-" + year;
    const used = arr(state.orders).map(o => String(o && o[field] || "")).filter(v => v.indexOf(key + "-") === 0).map(v => num(v.slice((key + "-").length)));
    const next = Math.max(num(state.settings.orderPrintProtocolCounters110[key]),0,...used) + 1;
    state.settings.orderPrintProtocolCounters110[key] = next;
    return key + "-" + String(next).padStart(4,"0");
  }
  function ensureProtocol(order,type){
    const cfg = type === "customer" ? {field:"customerOrderProtocol",prefix:"ORD-CLI"} : type === "supplier" ? {field:"supplierOrderProtocol",prefix:"ORD-FOR"} : {field:"internalOrderProtocol",prefix:"ORD-INT"};
    if (!order[cfg.field]) {
      order[cfg.field] = nextProtocol(cfg.prefix,cfg.field);
      order[cfg.field + "Date"] = today();
      saveState();
    }
    return order[cfg.field];
  }
  function parseLines(order){
    for (const key of ["multiArticleItemsJson","orderLineItemsJson","dealLineItemsJson","itemsJson"]) {
      try {
        const parsed = JSON.parse(order[key] || "[]");
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch(e){}
    }
    return [{
      articleCode:order.articleCode || order.productCode || "",
      product:order.product || "Merce",
      description:order.description || "",
      quantity:order.quantity || 1,
      unit:order.unit || "kg",
      unitPrice:order.unitPrice || order.price || 0,
      currency:order.currency || "EUR",
      supplierNotes:order.supplierPrintNotes || order.notes || ""
    }];
  }
  function lineTotal(line){ return num(line.quantity) * num(line.unitPrice || line.price); }
  function totalText(lines,currency){
    const totals = {};
    lines.forEach(line => {
      const c = line.currency || currency || "EUR";
      totals[c] = (totals[c] || 0) + lineTotal(line);
    });
    return Object.keys(totals).map(c => money(totals[c],c)).join(" / ") || money(0,currency || "EUR");
  }
  function linesTable(order,type){
    const lines = parseLines(order).filter(line => line.product || line.articleCode || num(line.quantity) || num(line.unitPrice || line.price));
    const showPrice = type !== "supplier";
    const head = showPrice ? '<tr><th>#</th><th>Codice</th><th>Articolo</th><th>Quantita</th><th>Unita</th><th>Prezzo</th><th>Subtotale</th></tr>' : '<tr><th>#</th><th>Codice</th><th>Articolo</th><th>Quantita</th><th>Unita</th><th>Note fornitore</th></tr>';
    const rows = lines.map((line,i) => {
      const desc = line.description ? '<br><small>' + esc(line.description) + '</small>' : "";
      if (showPrice) return '<tr><td>' + (i+1) + '</td><td>' + esc(line.articleCode || line.supplierArticleCode || "-") + '</td><td><strong>' + esc(line.product || line.description || "-") + '</strong>' + desc + '</td><td>' + esc(line.quantity || "-") + '</td><td>' + esc(line.unit || "-") + '</td><td>' + esc(money(line.unitPrice || line.price, line.currency || order.currency)) + '</td><td><strong>' + esc(money(lineTotal(line), line.currency || order.currency)) + '</strong></td></tr>';
      return '<tr><td>' + (i+1) + '</td><td>' + esc(line.articleCode || line.supplierArticleCode || "-") + '</td><td><strong>' + esc(line.product || line.description || "-") + '</strong>' + desc + '</td><td>' + esc(line.quantity || "-") + '</td><td>' + esc(line.unit || "-") + '</td><td>' + esc(line.supplierNotes || order.supplierPrintNotes || "-") + '</td></tr>';
    }).join("");
    return '<table class="print-table"><thead>' + head + '</thead><tbody>' + (rows || '<tr><td colspan="' + (showPrice ? "7" : "6") + '">Nessun articolo.</td></tr>') + '</tbody></table>' + (showPrice ? '<div class="pms110-total"><strong>Totale ordine:</strong> ' + esc(totalText(lines,order.currency)) + '</div>' : "");
  }
  function cleanText(v){ return String(v == null || v === "" ? "-" : v); }
  function printOrder(id,type){
    const order = findOrder(id);
    if (!order) return alert("Ordine non trovato.");
    type = type === "customer" || type === "supplier" ? type : "internal";
    const protocol = ensureProtocol(order,type);
    const code = orderCode(order);
    const title = type === "customer" ? "ORDINE CLIENTE" : type === "supplier" ? "ORDINE FORNITORE" : "ORDINE INTERNO";
    const sub = type === "customer" ? "Copia cliente" : type === "supplier" ? "Copia fornitore" : "Copia interna Parmitalia";
    const firstTable = type === "supplier"
      ? '<table class="print-table"><tr><th>Fornitore</th><td>' + esc(cleanText(order.supplier)) + '</td><th>Protocollo fornitore</th><td>' + esc(protocol) + '</td></tr><tr><th>Cliente finale</th><td>' + esc(cleanText(order.client)) + '</td><th>Data ordine</th><td>' + esc(cleanText(order.orderDate || order.requestedDate || today())) + '</td></tr><tr><th>Tipo ordine</th><td colspan="3">' + esc(cleanText(order.orderType)) + '</td></tr></table>'
      : '<table class="print-table"><tr><th>Cliente</th><td>' + esc(cleanText(order.client)) + '</td><th>Protocollo</th><td>' + esc(protocol) + '</td></tr><tr><th>Fornitore</th><td>' + esc(cleanText(order.supplier)) + '</td><th>Data ordine</th><td>' + esc(cleanText(order.orderDate || order.requestedDate || today())) + '</td></tr><tr><th>Tipo ordine</th><td colspan="3">' + esc(cleanText(order.orderType)) + '</td></tr></table>';
    const terms = type === "supplier"
      ? '<table class="print-table"><tr><th>Consegna/logistica</th><td>' + esc(cleanText(order.delivery)) + '</td><th>Consegna prevista</th><td>' + esc(cleanText(order.expectedDelivery)) + '</td></tr><tr><th>Rif. fattura/proforma</th><td>' + esc(cleanText(order.invoiceReference)) + '</td><th>Ordine interno</th><td>' + esc(code) + '</td></tr><tr><th>Note operative</th><td colspan="3">' + esc(cleanText(order.supplierPrintNotes || order.notes || order.description)) + '</td></tr></table>'
      : '<table class="print-table"><tr><th>Pagamento</th><td>' + esc(cleanText(order.paymentTerms)) + '</td><th>Consegna/logistica</th><td>' + esc(cleanText(order.delivery)) + '</td></tr><tr><th>Consegna prevista</th><td>' + esc(cleanText(order.expectedDelivery)) + '</td><th>Offerta collegata</th><td>' + esc(cleanText(order.linkedOffer)) + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(cleanText(type === "customer" ? (order.customerPrintNotes || order.notes || order.description) : (order.notes || order.description))) + '</td></tr></table>';
    const internal = type === "internal" ? '<table class="print-table"><tr><th>Codice interno</th><td>' + esc(code) + '</td><th>Stato</th><td>' + esc(cleanText(order.status || "Nuovo")) + '</td></tr><tr><th>Responsabile</th><td>' + esc(cleanText(order.responsible || order.owner)) + '</td><th>Rif. fattura</th><td>' + esc(cleanText(order.invoiceReference)) + '</td></tr></table>' : "";
    const html = '<div class="print-document pms110-print">' + header(title,protocol,sub) + firstTable + internal + linesTable(order,type) + terms + '<div style="margin-top:6mm">' + barcode(protocol) + '</div><div class="pms110-signatures"><div>Firma Parmitalia</div><div>Firma per conferma</div></div><div class="print-footer">Parmitalia Distribution SRL - Protocollo ' + esc(protocol) + ' - Ordine ' + esc(code) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html); else window.print();
  }
  function css(){
    if (document.getElementById("pms-v110-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v110-style";
    s.textContent = ".pms110-print-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.pms110-print-actions button{width:auto!important;margin:0!important}.pms110-total{border:1px solid #cbd5e1;background:#f8fafc;padding:8px 10px;margin:8px 0}.pms110-signatures{display:grid;grid-template-columns:1fr 1fr;gap:14mm;margin-top:8mm}.pms110-signatures div{border-top:1px solid #334155;padding-top:2mm;font-size:9pt;color:#475569}@media print{#print-root .pms110-print{min-height:0!important;height:auto!important;font-size:9.2pt!important;line-height:1.24!important;break-after:avoid!important;page-break-after:avoid!important}.pms110-signatures{margin-top:5mm}}";
    document.head.appendChild(s);
  }
  function decorate(){
    css();
    if (!window.current || current.page !== "orders") return;
    document.querySelectorAll("[data-pms102-order-edit], [data-edit='orders']").forEach(btn => {
      const id = btn.dataset.pms102OrderEdit || btn.dataset.id;
      const cell = btn.closest("td") || btn.parentElement;
      if (!id || !cell || cell.querySelector("[data-pms110-order-print='" + esc(id) + "']")) return;
      const wrap = document.createElement("div");
      wrap.className = "pms110-print-actions";
      wrap.dataset.pms110OrderPrint = id;
      wrap.innerHTML = '<button class="inline-button" data-pms110-print-internal="' + esc(id) + '">Stampa interna</button><button class="inline-button" data-pms110-print-customer="' + esc(id) + '">PDF cliente</button><button class="inline-button" data-pms110-print-supplier="' + esc(id) + '">PDF fornitore</button>';
      cell.appendChild(wrap);
    });
    document.querySelectorAll("[data-print-order]").forEach(btn => {
      const id = btn.dataset.printOrder;
      btn.textContent = "Stampa interna";
      btn.onclick = () => printOrder(id,"internal");
      const cell = btn.closest("td") || btn.parentElement;
      if (cell && id && !cell.querySelector("[data-pms110-print-customer='" + esc(id) + "']")) {
        btn.insertAdjacentHTML("afterend", '<button class="inline-button" data-pms110-print-customer="' + esc(id) + '">PDF cliente</button><button class="inline-button" data-pms110-print-supplier="' + esc(id) + '">PDF fornitore</button>');
      }
    });
    document.querySelectorAll("[data-pms110-print-internal]").forEach(b => b.onclick = () => printOrder(b.dataset.pms110PrintInternal,"internal"));
    document.querySelectorAll("[data-pms110-print-customer]").forEach(b => b.onclick = () => printOrder(b.dataset.pms110PrintCustomer,"customer"));
    document.querySelectorAll("[data-pms110-print-supplier]").forEach(b => b.onclick = () => printOrder(b.dataset.pms110PrintSupplier,"supplier"));
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms110RenderWrapped) {
    window.__pms110RenderWrapped = true;
    render = function(){ const r = baseRender.apply(this,arguments); setTimeout(decorate,50); return r; };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms110BindWrapped) {
    window.__pms110BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); setTimeout(decorate,40); return r; };
  }
  css(); setTimeout(decorate,120);
  window.pmsV110OrderPrintButtons = {version:VERSION,printOrder,decorate};
})();
