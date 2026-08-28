(function(){
  "use strict";
  const VERSION = "PMS-V115-ORDERS-PAGE-PRINT-DELETE-FIX";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function orderCode(o){ return o && (o.code || o.id) || "-"; }
  function closed(o){ return /chius|confermat|complet|accett|fatturat/i.test(String(o && o.status || "")); }
  function findOrder(id){ return arr(state && state.orders).find(o => String(o.id) === String(id) || String(o.code) === String(id)); }
  function total(o){
    if (o.total) return o.total;
    try {
      const rows = JSON.parse(o.multiArticleItemsJson || o.orderLineItemsJson || "[]");
      if (Array.isArray(rows) && rows.length) return rows.reduce((a,r) => a + num(r.quantity) * num(r.unitPrice || r.price),0);
    } catch(e){}
    return num(o.quantity) * num(o.unitPrice || o.price);
  }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function ensure(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.deletedOrdersLog = arr(state.deletedOrdersLog);
    state.outgoingInvoices = arr(state.outgoingInvoices);
  }
  function css(){
    if (document.getElementById("pms-v115-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v115-style";
    s.textContent = `
      .pms115-page{display:grid;gap:14px}
      .pms115-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}
      .pms115-hero h3{margin:2px 0 6px;color:#fff}
      .pms115-hero p{margin:0;color:#dbeafe}
      .pms115-actions,.pms115-row-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
      .pms115-actions button,.pms115-row-actions button{width:auto!important;margin:0!important}
      .pms115-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}
      .pms115-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
      .pms115-kpi{border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:12px}
      .pms115-kpi span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}
      .pms115-kpi strong{display:block;font-size:22px;margin-top:6px;color:#0f2f4a}
      .pms115-delete{background:#fee2e2!important;border-color:#fecaca!important;color:#991b1b!important}
      .pms115-delete:hover{background:#fecaca!important;color:#7f1d1d!important}
      .pms115-print-main{background:#0f2f4a!important;color:#fff!important;border-color:#0f2f4a!important}
      .pms115-muted{color:var(--muted);font-size:12px;line-height:1.35}
      .pms115-table td{vertical-align:top}
      @media(max-width:900px){.pms115-hero{display:grid}.pms115-row-actions{min-width:220px}}
    `;
    document.head.appendChild(s);
  }
  function printOrder(id,type){
    if (window.pmsV110OrderPrintButtons && typeof window.pmsV110OrderPrintButtons.printOrder === "function") {
      window.pmsV110OrderPrintButtons.printOrder(id,type);
      return;
    }
    alert("Modulo stampa ordine non caricato. Aggiorna la pagina con Ctrl+F5.");
  }
  function deleteOrder(id){
    ensure();
    const idx = state.orders.findIndex(o => String(o.id) === String(id) || String(o.code) === String(id));
    if (idx < 0) return alert("Ordine non trovato.");
    const item = state.orders[idx];
    const label = [orderCode(item), item.client || "", item.product || ""].filter(Boolean).join(" - ");
    if (!confirm("Eliminare definitivamente l'ordine " + label + "?")) return;
    state.deletedOrdersLog.unshift({
      id:"DEL-ORD-" + new Date().toISOString(),
      orderId:item.id || "",
      orderCode:orderCode(item),
      client:item.client || "",
      supplier:item.supplier || "",
      product:item.product || "",
      deletedAt:new Date().toISOString(),
      deletedBy:(window.current && current.user) || "utente"
    });
    state.orders.splice(idx,1);
    saveState();
    render();
  }
  function closeOrder(id){
    const o = findOrder(id);
    if (!o) return alert("Ordine non trovato.");
    o.status = "Chiuso";
    o.closedAt = new Date().toISOString();
    saveState();
    render();
  }
  function orderLines(o){
    for (const key of ["multiArticleItemsJson","orderLineItemsJson","dealLineItemsJson"]) {
      try {
        const parsed = JSON.parse(o[key] || "[]");
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch(e){}
    }
    return [{description:o.product || "Merce",quantity:o.quantity || 1,unit:o.unit || "kg",unitPrice:o.unitPrice || o.price || 0,vatRate:0}];
  }
  function next(prefix,list,field){
    const year = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String((field && x[field]) || x.protocol || x.code || x.id || "").match(re);
      return m ? Math.max(a,Number(m[1])) : a;
    },0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4,"0");
  }
  function orderToInvoice(id){
    const o = findOrder(id);
    if (!o) return alert("Ordine non trovato.");
    if (!closed(o)) return alert("Prima chiudi l'ordine.");
    const existing = state.outgoingInvoices.find(i => i.linkedPractice === orderCode(o) || i.sourceOrderId === o.id);
    if (existing) { current.page = "billingWorkflow"; render(); return alert("La fattura esiste gia: " + (existing.protocol || existing.id)); }
    const protocol = next("FOUT",state.outgoingInvoices);
    const items = orderLines(o).map(line => ({description:line.description || line.product || o.product || "Merce",quantity:num(line.quantity) || 1,unit:line.unit || o.unit || "kg",unitPrice:num(line.unitPrice || line.price || o.unitPrice || o.price || 0),vatRate:num(line.vatRate || 0)}));
    const net = items.reduce((a,l)=>a + num(l.quantity) * num(l.unitPrice),0) || num(o.total || o.value || 0);
    state.outgoingInvoices.unshift({id:protocol,protocol,number:protocol,date:new Date().toISOString().slice(0,10),dueDate:new Date().toISOString().slice(0,10),currency:o.currency || "EUR",status:"Bozza",anafStatus:"Da inviare",partyName:o.client || "",partyVat:o.clientVat || "",partyAddress:o.clientAddress || "",partyCountry:o.clientCountry || "",partyEmail:o.clientEmail || "",project:orderCode(o),linkedPractice:orderCode(o),sourceOrderId:o.id,paymentTerms:o.paymentTerms || "",paymentMethod:"Bonifico bancario",items,amount:net,vatAmount:0,total:net,notes:"Creata automaticamente da ordine " + orderCode(o)});
    o.invoiceReference = protocol;
    o.status = "Fatturato";
    saveState();
    current.page = "billingWorkflow";
    render();
  }
  function rowActions(o){
    const id = esc(o.id || o.code || "");
    const invoice = closed(o) ? '<button class="inline-button" data-pms115-invoice="' + id + '">Passa fatturazione</button>' : '<button class="inline-button" data-pms115-close="' + id + '">Chiudi</button>';
    return '<div class="pms115-row-actions">' +
      '<button class="inline-button" data-pms115-edit="' + id + '">Modifica</button>' +
      '<button class="inline-button pms115-print-main" data-pms115-print-customer="' + id + '">Conferma ordine cliente PDF</button>' +
      '<button class="inline-button pms115-print-main" data-pms115-print-supplier="' + id + '">Conferma ordine fornitore PDF</button>' +
      '<button class="inline-button" data-pms115-print-internal="' + id + '">Stampa interna</button>' +
      '<button class="inline-button pms115-delete" data-pms115-delete="' + id + '">Elimina</button>' +
      invoice +
      '</div>';
  }
  function renderOrders(){
    ensure(); css();
    const open = state.orders.filter(o => !/chius|annull|fatturat/i.test(String(o.status || ""))).length;
    const closedCount = state.orders.filter(closed).length;
    const rows = state.orders.map(o => '<tr><td><span class="code-block">' + esc(orderCode(o)) + '</span><br><small>' + esc(o.orderDate || o.requestedDate || "") + '</small></td><td><strong>' + esc(o.client || "-") + '</strong><br><small>' + esc(o.supplier || "-") + '</small></td><td><strong>' + esc(o.product || "-") + '</strong><br><small>' + esc(o.orderType || "") + '</small></td><td>' + esc(o.quantity || "") + ' ' + esc(o.unit || "") + '<br><small>' + esc(money(total(o),o.currency || "EUR")) + '</small></td><td>' + esc(o.status || "Nuovo") + '</td><td>' + rowActions(o) + '</td></tr>').join("");
    return '<div class="pms115-page"><section class="pms115-hero"><div><span>ORD</span><h3>Ordini</h3><p>Gestione ordine con modifica, conferma cliente PDF, conferma fornitore PDF, stampa interna, eliminazione e passaggio a fatturazione.</p></div><div class="pms115-actions"><button class="primary-button" data-pms115-new-order>+ Nuovo ordine</button><button class="secondary-button" data-nav="billingWorkflow">Apri fatturazione</button></div></section><div class="pms115-kpis"><div class="pms115-kpi"><span>Ordini totali</span><strong>' + state.orders.length + '</strong></div><div class="pms115-kpi"><span>Aperti</span><strong>' + open + '</strong></div><div class="pms115-kpi"><span>Chiusi/fatturabili</span><strong>' + closedCount + '</strong></div></div><div class="pms115-card"><div class="table-wrap"><table class="pms115-table"><thead><tr><th>Codice</th><th>Cliente / Fornitore</th><th>Prodotto</th><th>Quantita / valore</th><th>Stato</th><th>Azioni ordine</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun ordine registrato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function bind(){
    document.querySelector("[data-pms115-new-order]")?.addEventListener("click",() => typeof openModal === "function" ? openModal("orders") : null);
    document.querySelectorAll("[data-pms115-edit]").forEach(b => b.onclick = () => typeof openModal === "function" ? openModal("orders",b.dataset.pms115Edit) : null);
    document.querySelectorAll("[data-pms115-print-customer]").forEach(b => b.onclick = () => printOrder(b.dataset.pms115PrintCustomer,"customer"));
    document.querySelectorAll("[data-pms115-print-supplier]").forEach(b => b.onclick = () => printOrder(b.dataset.pms115PrintSupplier,"supplier"));
    document.querySelectorAll("[data-pms115-print-internal]").forEach(b => b.onclick = () => printOrder(b.dataset.pms115PrintInternal,"internal"));
    document.querySelectorAll("[data-pms115-delete]").forEach(b => b.onclick = () => deleteOrder(b.dataset.pms115Delete));
    document.querySelectorAll("[data-pms115-close]").forEach(b => b.onclick = () => closeOrder(b.dataset.pms115Close));
    document.querySelectorAll("[data-pms115-invoice]").forEach(b => b.onclick = () => orderToInvoice(b.dataset.pms115Invoice));
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms115RenderWrapped) {
    window.__pms115RenderWrapped = true;
    render = function(){
      ensure(); css();
      const content = document.getElementById("content"), title = document.getElementById("page-title"), subtitle = document.getElementById("page-subtitle");
      if (content && window.current && current.page === "orders") {
        if (title) title.textContent = "Ordini";
        if (subtitle) subtitle.textContent = "Conferme d'ordine cliente/fornitore, stampa interna, modifica ed eliminazione";
        content.innerHTML = renderOrders();
        bind();
        return;
      }
      const r = baseRender.apply(this,arguments);
      setTimeout(bind,40);
      return r;
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms115BindWrapped) {
    window.__pms115BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); return r; };
  }
  ensure(); css(); setTimeout(bind,120);
  window.pmsV115OrdersPagePrintDeleteFix = {version:VERSION,renderOrders,printOrder,deleteOrder};
})();
