(function(){
  "use strict";
  const VERSION = "PMS-V99-CLEAN-ORDER-PRINT";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function today(){ const d = new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
  function fmtDate(v){ if(!v) return "-"; const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[3]+"/"+m[2]+"/"+m[1] : String(v); }
  function orderCode(o){ return o && (o.code || o.id) || "-"; }
  function findOrder(id){ return arr(state && state.orders).find(o => String(o.id) === String(id) || String(o.code) === String(id)); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e) { console.warn(e); return false; } }
  function protocolPrefix(type){ return type === "supplier" ? "ORD-FOR" : "ORD-CLI"; }
  function protocolField(type){ return type === "supplier" ? "supplierPrintProtocol" : "customerPrintProtocol"; }
  function nextProtocol(type){
    state.settings = state.settings || {};
    state.settings.orderPrintProtocolCounters = state.settings.orderPrintProtocolCounters || {};
    const prefix = protocolPrefix(type), year = new Date().getFullYear(), key = prefix + "-" + year;
    const used = arr(state.orders).map(o => String(o.customerPrintProtocol || "")).concat(arr(state.orders).map(o => String(o.supplierPrintProtocol || ""))).map(code => {
      const m = code.match(new RegExp("^" + prefix + "-" + year + "-(\\d{4})$"));
      return m ? Number(m[1]) : 0;
    });
    const next = Math.max(num(state.settings.orderPrintProtocolCounters[key]), 0, ...used) + 1;
    state.settings.orderPrintProtocolCounters[key] = next;
    return prefix + "-" + year + "-" + String(next).padStart(4,"0");
  }
  function ensureProtocol(order,type){
    const field = protocolField(type);
    if (!order[field]) {
      order[field] = nextProtocol(type);
      order[field + "Date"] = today();
      saveState();
    }
    return order[field];
  }
  function parseLines(order){
    if (order && order.orderLineItemsJson) {
      try { const parsed = JSON.parse(order.orderLineItemsJson); if (Array.isArray(parsed) && parsed.length) return parsed; } catch(e) {}
    }
    if (order && order.multiArticleItemsJson) {
      try { const parsed = JSON.parse(order.multiArticleItemsJson); if (Array.isArray(parsed) && parsed.length) return parsed; } catch(e) {}
    }
    return [{articleCode:order && order.articleCode || "",product:order && order.product || "",description:order && order.description || "",quantity:order && order.quantity || "",unit:order && order.unit || "",unitPrice:order && order.unitPrice || "",currency:order && order.currency || "EUR"}];
  }
  function lineTotal(line){ return num(line.quantity) * num(line.unitPrice == null ? line.price : line.unitPrice); }
  function totalText(lines,currency){
    const totals = {};
    lines.forEach(line => {
      const cur = String(line.currency || currency || "EUR").toUpperCase();
      totals[cur] = (totals[cur] || 0) + lineTotal(line);
    });
    return Object.entries(totals).map(([cur,val]) => money(val,cur)).join(" | ") || money(0,currency || "EUR");
  }
  function header(title,protocol,subtitle){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, protocol, subtitle || "");
    const s = state.settings || {};
    const logo = s.logoUrl ? '<img class="print-logo" src="'+esc(s.logoUrl)+'" alt="Logo">' : '<div class="brand-mark small">P</div>';
    return '<div class="print-header"><div>'+logo+'<h1>'+esc(title)+'</h1><strong>'+esc(s.legalName || "PARMITALIA DISTRIBUTION SRL")+'</strong><br><span>'+esc(subtitle || "")+'</span></div><div class="print-meta"><strong>'+esc(protocol)+'</strong><br>'+fmtDate(today())+'</div></div>';
  }
  function barcode(code){ return typeof renderBarcode === "function" ? renderBarcode(code) : (typeof renderQrLite === "function" ? renderQrLite(code) : '<strong>'+esc(code)+'</strong>'); }
  function linesTable(order,type){
    const lines = parseLines(order).filter(l => l.product || l.articleCode || num(l.quantity) || num(l.unitPrice));
    const showPrice = type !== "supplier";
    const head = showPrice
      ? '<tr><th style="width:6%">#</th><th style="width:14%">Codice</th><th>Articolo</th><th style="width:13%">Quantita</th><th style="width:10%">Unita</th><th style="width:13%">Prezzo</th><th style="width:16%">Subtotale</th></tr>'
      : '<tr><th style="width:6%">#</th><th style="width:16%">Codice</th><th>Articolo</th><th style="width:15%">Quantita</th><th style="width:11%">Unita</th><th style="width:22%">Note</th></tr>';
    const rows = lines.map((line,i) => {
      const desc = line.description ? '<br><small>'+esc(line.description)+'</small>' : "";
      if (showPrice) return '<tr><td>'+(i+1)+'</td><td>'+esc(line.articleCode || "-")+'</td><td><strong>'+esc(line.product || "-")+'</strong>'+desc+'</td><td>'+esc(line.quantity || "-")+'</td><td>'+esc(line.unit || "-")+'</td><td>'+esc(money(line.unitPrice == null ? line.price : line.unitPrice,line.currency || order.currency))+'</td><td><strong>'+esc(money(lineTotal(line),line.currency || order.currency))+'</strong></td></tr>';
      return '<tr><td>'+(i+1)+'</td><td>'+esc(line.articleCode || "-")+'</td><td><strong>'+esc(line.product || "-")+'</strong>'+desc+'</td><td>'+esc(line.quantity || "-")+'</td><td>'+esc(line.unit || "-")+'</td><td>'+esc(line.supplierNotes || "-")+'</td></tr>';
    }).join("");
    return '<table class="print-table pms99-order-lines"><thead>'+head+'</thead><tbody>'+(rows || '<tr><td colspan="'+(showPrice ? "7" : "6")+'">-</td></tr>')+'</tbody></table>' + (showPrice ? '<div class="pms99-total"><strong>Totale ordine:</strong> '+esc(totalText(lines,order.currency))+'</div>' : "");
  }
  function orderPrintHtml(id,type){
    const order = findOrder(id);
    if (!order) return "";
    type = type === "supplier" ? "supplier" : "customer";
    const protocol = ensureProtocol(order,type);
    const title = type === "supplier" ? "ORDINE FORNITORE" : "CONFERMA ORDINE";
    const subtitle = type === "supplier" ? "Copia fornitore" : "Copia cliente";
    const subject = type === "supplier"
      ? '<table class="print-table pms99-meta"><tr><th>Fornitore</th><td>'+esc(order.supplier || "-")+'</td><th>Protocollo</th><td>'+esc(protocol)+'</td></tr><tr><th>Cliente finale</th><td>'+esc(order.client || "-")+'</td><th>Data ordine</th><td>'+esc(fmtDate(order.orderDate || order.requestedDate || today()))+'</td></tr><tr><th>Tipo ordine</th><td>'+esc(order.orderType || "-")+'</td><th>Codice interno</th><td>'+esc(orderCode(order))+'</td></tr></table>'
      : '<table class="print-table pms99-meta"><tr><th>Cliente</th><td>'+esc(order.client || "-")+'</td><th>Protocollo</th><td>'+esc(protocol)+'</td></tr><tr><th>Fornitore</th><td>'+esc(order.supplier || "-")+'</td><th>Data ordine</th><td>'+esc(fmtDate(order.orderDate || order.requestedDate || today()))+'</td></tr><tr><th>Tipo ordine</th><td>'+esc(order.orderType || "-")+'</td><th>Codice interno</th><td>'+esc(orderCode(order))+'</td></tr></table>';
    const terms = type === "supplier"
      ? '<table class="print-table pms99-terms"><tr><th>Consegna/logistica</th><td>'+esc(order.delivery || "-")+'</td><th>Consegna prevista</th><td>'+esc(fmtDate(order.expectedDelivery))+'</td></tr><tr><th>Rif. fattura/proforma</th><td>'+esc(order.invoiceReference || "-")+'</td><th>Pagamento</th><td>'+esc(order.paymentTerms || "-")+'</td></tr><tr><th>Note operative</th><td colspan="3">'+esc(order.supplierPrintNotes || order.description || order.notes || "-")+'</td></tr></table>'
      : '<table class="print-table pms99-terms"><tr><th>Pagamento</th><td>'+esc(order.paymentTerms || "-")+'</td><th>Consegna/logistica</th><td>'+esc(order.delivery || "-")+'</td></tr><tr><th>Consegna prevista</th><td>'+esc(fmtDate(order.expectedDelivery))+'</td><th>Offerta collegata</th><td>'+esc(order.linkedOffer || "-")+'</td></tr><tr><th>Note</th><td colspan="3">'+esc(order.customerPrintNotes || order.description || order.notes || "-")+'</td></tr></table>';
    return '<div class="print-document pms99-order-print">'+header(title,protocol,subtitle)+subject+linesTable(order,type)+terms+'<div class="pms99-barcode">'+barcode(protocol)+'</div><div class="pms99-signatures"><div>Parmitalia Distribution SRL</div><div>Firma per conferma</div></div><div class="print-footer">Protocollo '+esc(protocol)+' · Ordine interno '+esc(orderCode(order))+'</div></div>';
  }
  function printOrder(id,type){
    const html = orderPrintHtml(id,type);
    if (!html) return alert("Ordine non trovato.");
    if (typeof openPrint === "function") openPrint(html);
    else {
      let root = document.getElementById("print-root");
      if (!root) { root = document.createElement("div"); root.id = "print-root"; document.body.appendChild(root); }
      root.innerHTML = html;
      window.print();
    }
  }
  function injectStyle(){
    if (document.getElementById("pms-v99-clean-order-print-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v99-clean-order-print-style";
    style.textContent = `
      .pms99-order-print .pms94-print-note,
      .pms99-order-print .pms95-warn,
      .pms99-order-print .pms96-note{display:none!important}
      .pms99-order-print{overflow:hidden!important}
      .pms99-order-print .print-header{margin-bottom:4mm!important;padding-bottom:3mm!important}
      .pms99-order-print .print-table{table-layout:fixed!important;width:100%!important;margin:3mm 0!important}
      .pms99-order-print .print-table th,
      .pms99-order-print .print-table td{white-space:normal!important;overflow-wrap:anywhere!important;word-break:break-word!important;padding:2mm!important;font-size:8.6pt!important;line-height:1.18!important}
      .pms99-total{border:1px solid #cbd5e1;padding:2.4mm;margin:3mm 0;font-size:8.8pt}
      .pms99-barcode{width:70mm;max-width:70mm;margin-top:3mm}
      .pms99-barcode .barcode-svg,.pms99-barcode svg{width:70mm!important;max-width:70mm!important;height:auto!important}
      .pms99-signatures{display:grid;grid-template-columns:1fr 1fr;gap:12mm;margin-top:7mm;break-inside:avoid}
      .pms99-signatures div{border-top:1px solid #64748b;padding-top:2mm;font-size:8.4pt;color:#334155}
      @media print{
        @page{size:A4 portrait;margin:7mm}
        html,body{width:210mm!important;height:auto!important;min-height:0!important;overflow:visible!important;background:#fff!important}
        #print-root{width:100%!important;height:auto!important;min-height:0!important;overflow:visible!important;padding:0!important;margin:0!important}
        #print-root .pms99-order-print{
          width:100%!important;max-width:100%!important;min-height:0!important;height:auto!important;
          page-break-after:avoid!important;break-after:avoid!important;overflow:visible!important;
          font-size:7.8pt!important;line-height:1.12!important;
        }
        #print-root .pms99-order-print .print-header{margin-bottom:2mm!important;padding-bottom:1.5mm!important}
        #print-root .pms99-order-print .print-header h1{font-size:13pt!important;line-height:1.02!important}
        #print-root .pms99-order-print .print-meta{font-size:7.2pt!important}
        #print-root .pms99-order-print .print-table{margin:1.5mm 0!important;table-layout:fixed!important}
        #print-root .pms99-order-print .print-table th,
        #print-root .pms99-order-print .print-table td{padding:1.05mm!important;font-size:6.85pt!important;line-height:1.08!important}
        #print-root .pms99-total{padding:1.2mm!important;margin:1.6mm 0!important;font-size:7pt!important}
        #print-root .pms99-barcode{width:55mm!important;max-width:55mm!important;margin-top:1.5mm!important}
        #print-root .pms99-barcode .barcode-svg,#print-root .pms99-barcode svg{width:55mm!important;max-width:55mm!important;height:auto!important}
        #print-root .pms99-signatures{gap:8mm!important;margin-top:4mm!important}
        #print-root .pms99-signatures div{font-size:7pt!important;padding-top:1.3mm!important}
        #print-root .pms99-order-print .print-footer{position:static!important;margin-top:1.4mm!important;padding-top:1mm!important;font-size:6.6pt!important}
      }
    `;
    document.head.appendChild(style);
  }
  function bind(){
    injectStyle();
    document.querySelectorAll("[data-pms94-print-order-customer]").forEach(btn => btn.onclick = () => printOrder(btn.dataset.pms94PrintOrderCustomer,"customer"));
    document.querySelectorAll("[data-pms94-print-order-supplier]").forEach(btn => btn.onclick = () => printOrder(btn.dataset.pms94PrintOrderSupplier,"supplier"));
    document.querySelectorAll("[data-pms94-print-selected-order-customer]").forEach(btn => btn.onclick = () => { const s = document.getElementById("print-order-select"); if (s && s.value) printOrder(s.value,"customer"); });
    document.querySelectorAll("[data-pms94-print-selected-order-supplier]").forEach(btn => btn.onclick = () => { const s = document.getElementById("print-order-select"); if (s && s.value) printOrder(s.value,"supplier"); });
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind) bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); setTimeout(bind,60); return r; };
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender) render = function(){ const r = baseRender.apply(this,arguments); bind(); setTimeout(bind,60); return r; };
  if (window.pmsOrderExternalPrint94) window.pmsOrderExternalPrint94.print = printOrder;
  injectStyle();
  setTimeout(bind,80);
  window.pmsV99CleanOrderPrint = {version:"PMS-V99-CLEAN-ORDER-PRINT",print:printOrder,html:orderPrintHtml};
})();
