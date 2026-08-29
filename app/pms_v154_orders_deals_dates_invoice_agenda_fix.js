/* === PMS v154 - Ordini, trattative, date, fatture commissioni e agenda === */
(function(){
  "use strict";
  const VERSION154 = "PMS-V154-ORDERS-DEALS-DATES-INVOICE-AGENDA";
  const ORDER = "orders";
  const DEAL = "intermediations";
  const DEAL_PAGE = "trattativeInCorso";
  const PRODUCTS = "products";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function clean(value){ return String(value == null ? "" : value).trim(); }
  function has(value){ return clean(value) !== ""; }
  function num(value){
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value == null ? "" : value).trim().replace(/\s/g,"").replace(",","."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function money(value,currency){
    if (typeof formatMoney === "function") return formatMoney(value,currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function today(){ return new Date().toISOString().slice(0,10); }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      return true;
    } catch(error) {
      console.warn(VERSION154 + " save failed", error);
      return false;
    }
  }

  function ensureField(module,key,field,afterKey){
    schemas[module] = schemas[module] || {title:module, fields:[]};
    const fields = arr(schemas[module].fields);
    let existing = fields.find(function(item){ return item.key === key; });
    if (existing) Object.assign(existing,field,{key:key});
    else {
      existing = Object.assign({key:key},field);
      const index = fields.findIndex(function(item){ return item.key === afterKey; });
      fields.splice(index >= 0 ? index + 1 : fields.length,0,existing);
    }
    schemas[module].fields = fields;
  }
  function ensureAll(){
    state.orders = arr(state.orders);
    state.intermediations = arr(state.intermediations);
    state.products = arr(state.products);
    state.outgoingInvoices = arr(state.outgoingInvoices);
    state.settings = state.settings || {};
    ensureField(ORDER,"destination",{label:"DESTINAZIONE ORDINE - scrivi qui dove va la merce",type:"text"},"supplier");
    ensureField(ORDER,"customerOrderNumber",{label:"Numero ordine cliente",type:"text"},"destination");
    ensureField(DEAL,"currentPrice",{label:"Prezzo attuale",type:"number",step:"0.0001"},"value");
    ensureField(DEAL,"targetPrice",{label:"Target price da raggiungere",type:"number",step:"0.0001"},"currentPrice");
    ensureField(DEAL,"dealStage",{label:"Stato trattativa",type:"select",options:["Aperta","In trattativa","Campionatura","Offerta inviata","In attesa cliente","In attesa fornitore","Chiusa vinta","Chiusa persa","Annullata"]},"targetPrice");
    ensureField(DEAL,"priceHistoryNote",{label:"Nota storico prezzo",type:"text"},"dealStage");
    ensureField(PRODUCTS,"priceHistoryNote",{label:"Nota modifica prezzo",type:"text"},"price");
  }

  function orderCode(order){ return order && (order.code || order.id || order.orderCode) || "-"; }
  function orderDestination(order){
    return clean(order && (order.destination || order.orderDestination || order.deliveryDestination || order.shipTo || order.unloadingPlace || order.deliveryPlace || order.destinationAddress || order.customerDestination));
  }
  function orderTotal(order){
    if (!order) return 0;
    try {
      const rows = JSON.parse(order.multiArticleItemsJson || order.orderLineItemsJson || "[]");
      if (Array.isArray(rows) && rows.length) {
        return rows.reduce(function(total,line){ return total + num(line.quantity || 1) * num(line.unitPrice || line.price); },0);
      }
    } catch(error) {}
    return num(order.total || order.value) || num(order.quantity || 1) * num(order.unitPrice || order.price);
  }
  function findOrder(id){
    return arr(state && state.orders).find(function(order){
      return String(order && order.id) === String(id) || String(order && order.code) === String(id);
    });
  }
  function setOrderDestination(id,value){
    const order = findOrder(id);
    if (!order) return false;
    order.destination = clean(value);
    order.orderDestination = clean(value);
    return saveNow();
  }

  function injectStyle(){
    if (document.getElementById("pms-v154-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v154-style";
    style.textContent = [
      ".pms154-order-destination-panel{grid-column:1/-1;border:2px solid #1d4ed8;background:#eff6ff;padding:12px;border-radius:8px;margin:4px 0 8px}",
      ".pms154-order-destination-panel label{display:block;color:#1d4ed8!important;font-size:13px!important;font-weight:900!important;text-transform:uppercase;margin-bottom:6px}",
      ".pms154-order-destination-panel input{font-size:18px!important;font-weight:900!important;border:2px solid #1d4ed8!important;background:#fff!important}",
      ".pms154-dest-badge{font-weight:900;color:#0f172a;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:4px 7px;display:inline-block}",
      ".pms154-order-table td{vertical-align:top}.pms154-actions{display:flex;gap:6px;flex-wrap:wrap}.pms154-actions button{width:auto!important;margin:0!important}",
      ".pms154-price-history{grid-column:1/-1;border:1px solid var(--line);border-left:5px solid #0f766e;background:#f8fafc;border-radius:8px;padding:12px;margin-top:8px}",
      ".pms154-price-history h4{margin:0 0 8px}.pms154-price-history table{margin:0!important}.pms154-date-ready{cursor:pointer}",
      ".pms154-settings-panel{border:1px solid var(--line);border-left:5px solid #1d4ed8;background:#fff;padding:14px;border-radius:8px;margin:14px 0}.pms154-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.pms154-settings-panel button{width:auto!important;margin:8px 0 0!important}",
      ".pms154-agenda-color{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:6px}.pms154-urgent{border-left:5px solid #dc2626!important}.pms154-warning{border-left:5px solid #f59e0b!important}.pms154-ok{border-left:5px solid #16a34a!important}"
    ].join("");
    document.head.appendChild(style);
  }

  function renderOrders154(){
    ensureAll(); injectStyle();
    const open = state.orders.filter(function(order){ return !/chius|annull|fatturat/i.test(String(order.status || "")); }).length;
    const rows = state.orders.map(function(order){
      const id = esc(order.id || order.code || "");
      const closed = /chius|confermat|complet|accett|fatturat/i.test(String(order.status || ""));
      const dest = orderDestination(order);
      const invoiceButton = closed
        ? '<button class="inline-button" data-pms154-invoice-commission="' + id + '">Fattura commissione</button>'
        : '<button class="inline-button" data-pms154-close-order="' + id + '">Chiudi</button>';
      return '<tr><td><span class="code-block">' + esc(orderCode(order)) + '</span><br><small>' + esc(order.orderDate || order.requestedDate || "") + '</small></td>' +
        '<td><strong>' + esc(order.client || "-") + '</strong></td>' +
        '<td><strong>' + esc(order.supplier || "-") + '</strong></td>' +
        '<td>' + (dest ? '<span class="pms154-dest-badge">' + esc(dest) + '</span>' : '<span class="muted-small">-</span>') + '</td>' +
        '<td><strong>' + esc(order.product || "-") + '</strong><br><small>' + esc(order.orderType || "") + '</small></td>' +
        '<td>' + esc(order.customerOrderNumber || order.clientOrderNumber || "-") + '</td>' +
        '<td>' + esc(order.quantity || "") + ' ' + esc(order.unit || "") + '<br><small>' + esc(money(orderTotal(order),order.currency || "EUR")) + '</small></td>' +
        '<td>' + esc(order.status || "Nuovo") + '</td>' +
        '<td><div class="pms154-actions"><button class="inline-button" data-edit="orders" data-id="' + id + '">Modifica</button><button class="inline-button" data-pms154-print-order="' + id + '" data-type="customer">Cliente PDF</button><button class="inline-button" data-pms154-print-order="' + id + '" data-type="supplier">Fornitore PDF</button><button class="inline-button" data-pms154-print-order="' + id + '" data-type="internal">Interna</button>' + invoiceButton + '</div></td></tr>';
    }).join("");
    return '<div class="pms117-page"><section class="pms117-hero"><div><span>ORD</span><h3>Ordini</h3><p>La destinazione va scritta nel campo evidenziato dentro Modifica ordine e compare qui in grassetto.</p></div><div class="pms117-actions"><button class="primary-button" data-new="orders">+ Nuovo ordine</button><button class="secondary-button" data-nav="print">Centro stampe</button></div></section><div class="pms117-grid"><div class="pms117-kpi"><span>Ordini totali</span><strong>' + state.orders.length + '</strong></div><div class="pms117-kpi"><span>Aperti</span><strong>' + open + '</strong></div><div class="pms117-kpi"><span>Valore merce</span><strong>' + esc(money(state.orders.reduce(function(sum,order){ return sum + orderTotal(order); },0),"EUR")) + '</strong></div></div><div class="pms117-card"><div class="table-wrap"><table class="pms154-order-table"><thead><tr><th>Codice</th><th>Cliente</th><th>Fornitore</th><th>Destinazione</th><th>Prodotto</th><th>Ordine cliente</th><th>Quantita / valore</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="9">Nessun ordine registrato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function bindOrders154(){
    document.querySelectorAll('[data-new="orders"],[data-pms115-new-order]').forEach(function(button){
      button.onclick = function(){ if (typeof openModal === "function") openModal("orders"); };
    });
    document.querySelectorAll('[data-edit="orders"],[data-pms115-edit]').forEach(function(button){
      button.onclick = function(){
        const id = button.dataset.id || button.dataset.pms115Edit || "";
        if (typeof openModal === "function") openModal("orders",id);
      };
    });
    document.querySelectorAll("[data-pms154-close-order]").forEach(function(button){
      button.onclick = function(){
        const order = findOrder(button.dataset.pms154CloseOrder);
        if (!order) return alert("Ordine non trovato.");
        order.status = "Chiuso";
        order.closedAt = new Date().toISOString();
        saveNow();
        render();
      };
    });
    document.querySelectorAll("[data-pms154-print-order]").forEach(function(button){
      button.onclick = function(){
        const id = button.dataset.pms154PrintOrder;
        const type = button.dataset.type || "internal";
        if (window.pmsV110OrderPrintButtons && typeof window.pmsV110OrderPrintButtons.printOrder === "function") return window.pmsV110OrderPrintButtons.printOrder(id,type);
        if (window.pmsV117BrokerageOrdersPrintCenter && typeof window.pmsV117BrokerageOrdersPrintCenter.printAny === "function") return window.pmsV117BrokerageOrdersPrintCenter.printAny("orders",id,type);
        alert("Stampa ordine non disponibile.");
      };
    });
    document.querySelectorAll("[data-pms154-invoice-commission]").forEach(function(button){
      button.onclick = function(){ createCommissionInvoice(button.dataset.pms154InvoiceCommission); };
    });
  }

  function invoiceNumber(){
    state.settings = state.settings || {};
    const series = clean(state.settings.invoiceSeries || "FATT");
    const next = Math.max(1, num(state.settings.invoiceNextNumber || 1));
    const pad = Math.max(1, num(state.settings.invoiceNumberPadding || 4));
    state.settings.invoiceNextNumber = next + 1;
    return series + "-" + String(next).padStart(pad,"0");
  }
  function createCommissionInvoice(orderId){
    const order = findOrder(orderId);
    if (!order) return alert("Ordine non trovato.");
    state.outgoingInvoices = arr(state.outgoingInvoices);
    const existing = state.outgoingInvoices.find(function(invoice){ return invoice.sourceOrderId === order.id && invoice.invoiceKind === "commission"; });
    if (existing) {
      current.page = "billingWorkflow";
      render();
      return alert("La fattura commissione esiste gia: " + (existing.number || existing.protocol || existing.id));
    }
    const number = invoiceNumber();
    const pct = num(order.commissionPct || order.commissionPercent || 0);
    const amount = num(order.commissionAmount || order.commissionValue) || (orderTotal(order) * pct / 100);
    if (!amount) return alert("Inserisci la provvigione Parmitalia % nell'ordine prima di creare la fattura commissione.");
    const description = "Provvigione / commissione Parmitalia su ordine " + orderCode(order) + (orderDestination(order) ? " - destinazione " + orderDestination(order) : "");
    const invoice = {
      id:number, protocol:number, number:number, invoiceKind:"commission", date:today(), dueDate:today(),
      currency:order.currency || "EUR", status:"Bozza", anafStatus:"Da inviare",
      partyName:order.client || order.finalClient || "", partyVat:order.clientVat || "", partyAddress:order.clientAddress || "", partyCountry:order.clientCountry || "", partyEmail:order.clientEmail || "",
      project:orderCode(order), linkedPractice:orderCode(order), sourceOrderId:order.id,
      paymentTerms:order.paymentTerms || "", paymentMethod:"Bonifico bancario",
      items:[{description:description, quantity:1, unit:"commissione", unitPrice:amount, vatRate:num(state.settings.defaultCommissionVatRate || 0)}],
      amount:amount, vatAmount:amount * num(state.settings.defaultCommissionVatRate || 0) / 100, total:amount * (1 + num(state.settings.defaultCommissionVatRate || 0) / 100),
      notes:"Fattura automatica di sola provvigione/commissione. Non fattura la merce."
    };
    state.outgoingInvoices.unshift(invoice);
    order.invoiceReference = number;
    order.commissionStatus = "Fatturata";
    saveNow();
    current.page = "billingWorkflow";
    render();
  }

  function decorateOrderModal(){
    const form = document.getElementById("modal-form");
    if (!form || form.dataset.pms154OrderDecorated === "1") return;
    const title = document.getElementById("modal-title");
    if (!title || !/ordine/i.test(title.textContent || "")) return;
    form.dataset.pms154OrderDecorated = "1";
    const id = clean(form.dataset.pms154OrderId || form.dataset.pms153OrderId || "");
    const order = findOrder(id);
    const panel = document.createElement("div");
    panel.className = "pms154-order-destination-panel";
    panel.innerHTML = '<label>SCRIVI QUI LA DESTINAZIONE DA VEDERE NELLA TABELLA PRINCIPALE</label><input id="pms154-order-destination-direct" type="text" value="' + esc(orderDestination(order)) + '" placeholder="Esempio: Kuwait, Dubai, Roma, cliente finale..."><small>Questo campo salva la destinazione dell ordine e la mostra in grassetto nella lista Ordini.</small>';
    form.insertBefore(panel,form.firstChild);
    const direct = panel.querySelector("input");
    const internal = form.elements.destination || form.elements.orderDestination;
    if (internal) {
      internal.closest(".form-field")?.classList.add("pms154-order-destination-panel");
      internal.placeholder = "Esempio: Kuwait";
      if (!has(internal.value)) internal.value = direct.value;
    }
    const sync = function(){
      if (internal) internal.value = direct.value;
      if (id) setOrderDestination(id,direct.value);
    };
    direct.addEventListener("input",sync);
    direct.addEventListener("change",sync);
    form.addEventListener("submit",function(){ sync(); },true);
  }

  function dealPrice(item){ return num(item.currentPrice || item.price || item.value || item.dealValue); }
  function dealTarget(item){ return num(item.targetPrice); }
  function dealStage(item){ return item.dealStage || item.status || "Aperta"; }
  function history(item){ return arr(item && item.priceHistory); }
  function addHistory(item,oldCurrent,oldTarget,newCurrent,newTarget,note){
    if (!item) return;
    item.priceHistory = history(item);
    if (num(oldCurrent) === num(newCurrent) && num(oldTarget) === num(newTarget)) return;
    item.priceHistory.unshift({date:today(), currentPrice:newCurrent, targetPrice:newTarget, previousCurrentPrice:oldCurrent, previousTargetPrice:oldTarget, note:note || ""});
  }
  function productPrice(product){ return product && (product.basePrice || product.price || product.unitPrice || product.currentPrice || ""); }
  function addProductHistory(product,oldPrice,newPrice,note){
    if (!product || num(oldPrice) === num(newPrice)) return;
    product.priceHistory = arr(product.priceHistory);
    product.priceHistory.unshift({date:today(), previousPrice:oldPrice, price:newPrice, note:note || ""});
  }

  function decorateDealModal(){
    const form = document.getElementById("pms85-inter-form");
    if (!form || form.dataset.pms154DealDecorated === "1") return;
    form.dataset.pms154DealDecorated = "1";
    const modal = document.getElementById("pms85-inter-modal");
    const title = modal && modal.querySelector(".pms84-modal-head h3");
    const idMatch = title && (title.textContent || "").match(/(INT-\d[^\s]*)/i);
    const item = idMatch ? arr(state.intermediations).find(function(row){ return String(row.id) === idMatch[1]; }) : null;
    form.dataset.pms154DealOldCurrent = item ? String(dealPrice(item)) : String(num(form.elements.currentPrice?.value || form.elements.value?.value));
    form.dataset.pms154DealOldTarget = item ? String(dealTarget(item)) : String(num(form.elements.targetPrice?.value));
    if (form.elements.currentPrice && item && !has(form.elements.currentPrice.value)) form.elements.currentPrice.value = dealPrice(item) || "";
    if (form.elements.targetPrice && item && !has(form.elements.targetPrice.value)) form.elements.targetPrice.value = dealTarget(item) || "";
    if (form.elements.dealStage && item && !has(form.elements.dealStage.value)) form.elements.dealStage.value = dealStage(item);
    const panel = document.createElement("div");
    panel.className = "pms154-price-history";
    const rows = history(item).slice(0,8).map(function(row){
      return '<tr><td>' + esc(row.date || "-") + '</td><td>' + esc(money(row.previousCurrentPrice || 0,item?.currency || "EUR")) + '</td><td><strong>' + esc(money(row.currentPrice || 0,item?.currency || "EUR")) + '</strong></td><td>' + esc(money(row.targetPrice || 0,item?.currency || "EUR")) + '</td><td>' + esc(row.note || "") + '</td></tr>';
    }).join("");
    panel.innerHTML = '<h4>Storico prezzi trattativa</h4><div class="table-wrap"><table><thead><tr><th>Data</th><th>Prezzo precedente</th><th>Prezzo nuovo</th><th>Target price</th><th>Nota</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Nessuna modifica prezzo registrata.</td></tr>') + '</tbody></table></div>';
    form.querySelector(".pms85-modal-form")?.appendChild(panel);
    form.addEventListener("submit",function(){
      setTimeout(function(){
        const record = item || arr(state.intermediations)[0];
        if (!record) return;
        addHistory(record,form.dataset.pms154DealOldCurrent,form.dataset.pms154DealOldTarget,form.elements.currentPrice?.value || form.elements.value?.value,form.elements.targetPrice?.value,form.elements.priceHistoryNote?.value || "");
        if (form.elements.currentPrice) record.currentPrice = form.elements.currentPrice.value;
        if (form.elements.targetPrice) record.targetPrice = form.elements.targetPrice.value;
        if (form.elements.dealStage) record.dealStage = form.elements.dealStage.value;
        saveNow();
      },40);
    },true);
  }

  function decorateDealTable(){
    if (!current || current.page !== DEAL_PAGE) return;
    const table = document.querySelector("#content table");
    if (!table || table.dataset.pms154DealTable === "1") return;
    table.dataset.pms154DealTable = "1";
    const header = table.querySelector("thead tr");
    if (!header) return;
    header.innerHTML = '<th>Protocollo</th><th>Data</th><th>Foto</th><th>Prodotto</th><th>Cliente / Fornitore</th><th>Prezzo attuale</th><th>Target price</th><th>Stato trattativa</th><th>Storico</th><th>Azioni</th>';
    table.querySelectorAll("tbody tr").forEach(function(row){
      const id = clean(row.querySelector(".pms85-code")?.textContent);
      const item = arr(state.intermediations).find(function(entry){ return String(entry.id) === id; });
      if (!item) return;
      const actionCell = row.lastElementChild ? row.lastElementChild.outerHTML : "<td></td>";
      const cells = row.children;
      row.innerHTML = (cells[0]?.outerHTML || "<td></td>") + (cells[1]?.outerHTML || "<td></td>") + (cells[2]?.outerHTML || "<td></td>") + (cells[3]?.outerHTML || "<td></td>") + (cells[4]?.outerHTML || "<td></td>") +
        '<td><strong>' + esc(money(dealPrice(item),item.currency || "EUR")) + '</strong></td><td><strong>' + esc(money(dealTarget(item),item.currency || "EUR")) + '</strong></td><td>' + esc(dealStage(item)) + '</td><td>' + history(item).length + ' modifiche</td>' + actionCell;
    });
  }

  function decorateProductSubmit(){
    document.addEventListener("submit",function(event){
      const form = event.target;
      if (!form || form.dataset.pms154ProductTracked === "1") return;
      const isProduct = form.id === "pms84-product-form" || (document.getElementById("modal-title") && /prodotto|articolo/i.test(document.getElementById("modal-title").textContent || ""));
      if (!isProduct) return;
      form.dataset.pms154ProductTracked = "1";
      const code = clean(form.elements.articleCode?.value || form.elements.id?.value || "");
      const name = clean(form.elements.name?.value || form.elements.product?.value || "");
      const existing = arr(state.products).find(function(product){ return clean(product.articleCode || product.id) === code || (name && clean(product.name).toLowerCase() === name.toLowerCase()); });
      const oldPrice = productPrice(existing);
      setTimeout(function(){
        const product = existing || arr(state.products).find(function(p){ return name && clean(p.name).toLowerCase() === name.toLowerCase(); });
        if (!product) return;
        const newPrice = productPrice(product);
        addProductHistory(product,oldPrice,newPrice,form.elements.priceHistoryNote?.value || "");
        saveNow();
      },80);
    },true);
  }

  function fixDateInputs(){
    document.querySelectorAll('input[type="date"]').forEach(function(input){
      if (input.dataset.pms154DateReady === "1") return;
      input.dataset.pms154DateReady = "1";
      input.classList.add("pms154-date-ready");
      input.removeAttribute("readonly");
      input.style.pointerEvents = "auto";
      input.addEventListener("click",function(event){
        event.stopPropagation();
        if (typeof input.showPicker === "function") {
          try { input.showPicker(); } catch(error) {}
        }
      });
    });
  }

  function decorateSettings(){
    if (!current || current.page !== "settings") return;
    if (document.getElementById("pms154-invoice-settings")) return;
    const content = document.getElementById("content");
    if (!content) return;
    const panel = document.createElement("div");
    panel.id = "pms154-invoice-settings";
    panel.className = "pms154-settings-panel";
    panel.innerHTML = '<h3>Numerazione fatture</h3><div class="pms154-settings-grid"><div><label>Serie fattura</label><input id="pms154-invoice-series" value="' + esc(state.settings.invoiceSeries || "FATT") + '"></div><div><label>Prossimo numero</label><input id="pms154-invoice-next" type="number" min="1" value="' + esc(state.settings.invoiceNextNumber || 1) + '"></div><div><label>Cifre numero</label><input id="pms154-invoice-pad" type="number" min="1" value="' + esc(state.settings.invoiceNumberPadding || 4) + '"></div><div><label>IVA commissione %</label><input id="pms154-commission-vat" type="number" step="0.01" value="' + esc(state.settings.defaultCommissionVatRate || 0) + '"></div></div><button class="primary-button" id="pms154-save-invoice-settings">Salva numerazione</button>';
    content.prepend(panel);
    panel.querySelector("#pms154-save-invoice-settings").onclick = function(){
      state.settings.invoiceSeries = clean(panel.querySelector("#pms154-invoice-series").value) || "FATT";
      state.settings.invoiceNextNumber = Math.max(1,num(panel.querySelector("#pms154-invoice-next").value || 1));
      state.settings.invoiceNumberPadding = Math.max(1,num(panel.querySelector("#pms154-invoice-pad").value || 4));
      state.settings.defaultCommissionVatRate = num(panel.querySelector("#pms154-commission-vat").value || 0);
      saveNow();
      alert("Numerazione fatture salvata.");
    };
  }

  function decorateAgenda(){
    document.querySelectorAll("[data-pms150-agenda-id], .pms150-agenda-item, .pms151-agenda-row").forEach(function(card){
      if (card.dataset.pms154AgendaDecorated === "1") return;
      card.dataset.pms154AgendaDecorated = "1";
      const text = (card.textContent || "").toLowerCase();
      if (text.includes("urgent") || text.includes("urgente")) card.classList.add("pms154-urgent");
      else if (text.includes("attenzione") || text.includes("importante")) card.classList.add("pms154-warning");
      else card.classList.add("pms154-ok");
    });
  }

  const baseRender154 = typeof render === "function" ? render : null;
  if (baseRender154) render = function(){
    ensureAll(); injectStyle();
    if (current && current.page === ORDER) {
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (title) title.textContent = "Ordini";
      if (subtitle) subtitle.textContent = "Destinazione evidenziata, modifica ordine e fattura commissione";
      if (content) content.innerHTML = renderOrders154();
      bindOrders154();
      return;
    }
    const result = baseRender154.apply(this,arguments);
    setTimeout(function(){ decorateOrderModal(); decorateDealModal(); decorateDealTable(); fixDateInputs(); decorateSettings(); decorateAgenda(); },40);
    setTimeout(function(){ decorateOrderModal(); decorateDealModal(); decorateDealTable(); fixDateInputs(); decorateSettings(); decorateAgenda(); },240);
    return result;
  };

  const baseBind154 = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind154) bindPageActions = function(){
    const result = baseBind154.apply(this,arguments);
    setTimeout(function(){ bindOrders154(); decorateOrderModal(); decorateDealModal(); decorateDealTable(); fixDateInputs(); decorateSettings(); decorateAgenda(); },30);
    return result;
  };

  const baseOpenModal154 = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal154) openModal = function(module,id){
    ensureAll();
    const result = baseOpenModal154.apply(this,arguments);
    if (module === ORDER) setTimeout(function(){
      const form = document.getElementById("modal-form");
      if (form) form.dataset.pms154OrderId = id || "";
      decorateOrderModal();
    },40);
    setTimeout(fixDateInputs,80);
    return result;
  };

  const baseCell154 = typeof cellValue === "function" ? cellValue : null;
  if (baseCell154) cellValue = function(module,item,column){
    if (module === ORDER && column === "destination") return orderDestination(item) ? '<span class="pms154-dest-badge">' + esc(orderDestination(item)) + '</span>' : "-";
    if (module === DEAL && (column === "currentPrice" || column === "value")) return esc(money(dealPrice(item),item.currency || "EUR"));
    if (module === DEAL && column === "targetPrice") return esc(money(dealTarget(item),item.currency || "EUR"));
    if (module === DEAL && column === "dealStage") return esc(dealStage(item));
    return baseCell154.apply(this,arguments);
  };

  document.addEventListener("click",function(event){
    const editOrder = event.target.closest('[data-edit="orders"],[data-pms115-edit]');
    if (editOrder) setTimeout(decorateOrderModal,120);
    const editDeal = event.target.closest("[data-pms85-edit-inter],[data-pms85-new-inter],[data-pms85-open-selected-deal]");
    if (editDeal) setTimeout(decorateDealModal,220);
    setTimeout(fixDateInputs,80);
  },true);
  document.addEventListener("input",function(event){
    const input = event.target;
    if (input && input.id === "pms154-order-destination-direct") {
      const form = document.getElementById("modal-form");
      const id = clean(form && form.dataset.pms153OrderId);
      if (id) setOrderDestination(id,input.value);
    }
  },true);

  ensureAll();
  injectStyle();
  decorateProductSubmit();
  setTimeout(function(){ fixDateInputs(); decorateSettings(); decorateAgenda(); },200);
  window.pmsV154OrdersDealsDatesInvoiceAgenda = {
    version: VERSION154,
    renderOrders: renderOrders154,
    createCommissionInvoice: createCommissionInvoice,
    fixDateInputs: fixDateInputs
  };
  console.info(VERSION154 + " loaded");
})();
