(function(){
  "use strict";

  const VERSION = "PMS-V147-OPERATIONAL-CLOSE-TO-BILLING";
  const BILLING_PAGE = "billingWorkflow";
  const OUT_INVOICES = "outgoingInvoices";
  const WORKFLOW = "billingWorkflow";
  const CLOSED_STATUS = "Chiuso - in fatturazione";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function num(value){
    const parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(value, days){
    const d = new Date((value || today()) + "T12:00:00");
    d.setDate(d.getDate() + Number(days || 0));
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function stateRef(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.orders = arr(state.orders);
    state.intermediations = arr(state.intermediations);
    state[OUT_INVOICES] = arr(state[OUT_INVOICES]);
    state[WORKFLOW] = arr(state[WORKFLOW]);
    return state;
  }
  function saveLocal(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio non riuscito. Controlla lo spazio disponibile e riprova.");
      return false;
    }
  }
  function nextCode(prefix, list){
    const year = new Date().getFullYear();
    const pattern = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    const max = arr(list).reduce((result, item) => {
      return [item && item.id, item && item.protocol, item && item.number, item && item.practiceCode].reduce((inner, value) => {
        const match = String(value || "").match(pattern);
        return match ? Math.max(inner, Number(match[1])) : inner;
      }, result);
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function itemList(type){
    const st = stateRef();
    return type === "order" ? st.orders : st.intermediations;
  }
  function itemCode(type, item){
    if (!item) return "";
    return String(type === "order" ? (item.code || item.orderCode || item.id || "") : (item.code || item.dealCode || item.id || ""));
  }
  function itemId(type, item){ return String(item && (item.id || item.code || item.orderCode || item.dealCode) || ""); }
  function findItem(type, id){
    return itemList(type).find(item => {
      const keys = [item.id, item.code, item.orderCode, item.dealCode].map(value => String(value || ""));
      return keys.includes(String(id || ""));
    });
  }
  function scheduledDate(item){ return String(item && (item.scheduledDate || item.operationalDate) || "").slice(0, 10); }
  function isOperationalClosed(item){
    const status = String(item && item.status || "");
    return !!(item && (
      item.operationalClosed === true ||
      item.operationalClosed === "true" ||
      item.operationalClosedAt ||
      status.toLowerCase() === CLOSED_STATUS.toLowerCase()
    ));
  }
  function lineDescription(line, item, type){
    return line.description || line.product || line.productName || line.article || line.articleName || item.product || item.productName || (type === "order" ? "Merce ordine" : "Intermediazione");
  }
  function parsedLines(item){
    for (const key of ["multiArticleItemsJson", "orderLineItemsJson", "dealLineItemsJson", "lineItemsJson"]) {
      try {
        const parsed = JSON.parse(item && item[key] || "[]");
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch(error) {}
    }
    return [];
  }
  function commissionValue(item){
    const base = num(item.value || item.total || item.amount || item.price);
    const pct = num(item.commissionPct || item.commissionPercent || item.commissionPercentage);
    const direct = num(item.commission || item.commissionAmount || item.agentCommission);
    if (direct) return direct;
    if (base && pct) return base * pct / 100;
    return base;
  }
  function invoiceLines(type, item){
    const raw = parsedLines(item);
    if (raw.length) {
      return raw.map(line => {
        const quantity = num(line.quantity || line.qty) || 1;
        const total = num(line.total || line.value || line.amount);
        const unitPrice = num(line.unitPrice || line.price || line.targetPrice || line.currentPrice) || (total && quantity ? total / quantity : 0);
        return {
          description: lineDescription(line, item, type),
          quantity,
          unit: line.unit || item.unit || "nr",
          unitPrice,
          vatRate: num(line.vatRate || line.vat || 0)
        };
      });
    }
    if (type === "deal") {
      return [{
        description: "Intermediazione / provvigione " + (itemCode(type, item) || ""),
        quantity: 1,
        unit: "nr",
        unitPrice: commissionValue(item),
        vatRate: 0
      }];
    }
    const quantity = num(item.quantity || item.qty) || 1;
    const total = num(item.total || item.value || item.amount);
    const unitPrice = num(item.unitPrice || item.price || item.currentPrice || item.targetPrice) || (total && quantity ? total / quantity : 0);
    return [{
      description: item.product || item.productName || item.description || "Merce ordine",
      quantity,
      unit: item.unit || "nr",
      unitPrice,
      vatRate: 0
    }];
  }
  function lineTotals(lines){
    return arr(lines).reduce((sum, line) => {
      const net = num(line.quantity) * num(line.unitPrice);
      const vat = net * num(line.vatRate) / 100;
      sum.net += net;
      sum.vat += vat;
      return sum;
    }, {net:0, vat:0});
  }
  function existingInvoice(type, item){
    const code = itemCode(type, item);
    const id = itemId(type, item);
    return stateRef()[OUT_INVOICES].find(invoice => {
      return String(invoice.sourceOperationalType || "") === type && String(invoice.sourceOperationalId || "") === id ||
        (type === "order" && String(invoice.sourceOrderId || "") === id) ||
        (type === "deal" && (String(invoice.sourceIntermediationId || "") === id || String(invoice.sourceDealId || "") === id)) ||
        (!!code && (String(invoice.linkedPractice || "") === code || String(invoice.project || "") === code));
    });
  }
  function upsertInvoice(type, item){
    const st = stateRef();
    const existing = existingInvoice(type, item);
    if (existing) return existing;
    const protocol = nextCode("FOUT", st[OUT_INVOICES]);
    const lines = invoiceLines(type, item);
    const totals = lineTotals(lines);
    const code = itemCode(type, item) || protocol;
    const invoice = {
      id: protocol,
      protocol,
      number: protocol,
      date: today(),
      dueDate: addDays(today(), 30),
      currency: item.currency || state.settings.defaultCurrency || "EUR",
      status: "Bozza",
      anafStatus: "Da inviare",
      partyName: item.client || item.customer || item.targetClient || "",
      partyVat: item.clientVat || item.customerVat || item.targetClientVat || "",
      partyAddress: item.clientAddress || item.customerAddress || "",
      partyCountry: item.clientCountry || item.customerCountry || "",
      partyEmail: item.clientEmail || item.customerEmail || "",
      project: code,
      linkedPractice: code,
      sourceOperationalType: type,
      sourceOperationalId: itemId(type, item),
      sourceOrderId: type === "order" ? itemId(type, item) : "",
      sourceIntermediationId: type === "deal" ? itemId(type, item) : "",
      sourceDealId: type === "deal" ? itemId(type, item) : "",
      paymentTerms: item.paymentTerms || "30 giorni data fattura",
      paymentMethod: "Bonifico bancario",
      items: lines,
      amount: Math.round(totals.net * 100) / 100,
      vatAmount: Math.round(totals.vat * 100) / 100,
      total: Math.round((totals.net + totals.vat) * 100) / 100,
      notes: "Creata automaticamente da Gestione operativa per pratica " + code + ". Verificare dati fiscali prima emissione."
    };
    st[OUT_INVOICES].unshift(invoice);
    return invoice;
  }
  function existingWorkflow(type, item){
    const code = itemCode(type, item);
    const id = itemId(type, item);
    return stateRef()[WORKFLOW].find(record => {
      return String(record.sourceOperationalType || "") === type && String(record.sourceOperationalId || "") === id ||
        (!!code && String(record.practiceCode || "") === code);
    });
  }
  function upsertWorkflow(type, item, invoice){
    const st = stateRef();
    let record = existingWorkflow(type, item);
    const code = itemCode(type, item) || (invoice && invoice.protocol) || nextCode("FAT", st[WORKFLOW]);
    if (!record) {
      record = {
        id: nextCode("FAT", st[WORKFLOW]),
        practiceCode: code,
        client: item.client || item.customer || item.targetClient || "",
        supplier: item.supplier || "",
        damageCheck: item.damageCheck || "Tutto a posto",
        invoiceStatus: "Bozza",
        notes: "Pratica chiusa dal calendario operativo. Fattura bozza collegata: " + ((invoice && (invoice.protocol || invoice.id)) || "-") + ".",
        sourceOperationalType: type,
        sourceOperationalId: itemId(type, item),
        linkedInvoice: invoice && (invoice.protocol || invoice.id) || ""
      };
      st[WORKFLOW].unshift(record);
    } else {
      record.client = record.client || item.client || item.customer || item.targetClient || "";
      record.supplier = record.supplier || item.supplier || "";
      record.invoiceStatus = record.invoiceStatus || "Bozza";
      record.linkedInvoice = record.linkedInvoice || (invoice && (invoice.protocol || invoice.id)) || "";
      record.sourceOperationalType = record.sourceOperationalType || type;
      record.sourceOperationalId = record.sourceOperationalId || itemId(type, item);
    }
    return record;
  }
  function showBillingNotice(code, invoice){
    setTimeout(() => {
      if (!window.current || current.page !== BILLING_PAGE) return;
      const content = document.getElementById("content");
      if (!content || document.getElementById("pms147-billing-notice")) return;
      const notice = document.createElement("div");
      notice.id = "pms147-billing-notice";
      notice.className = "pms147-billing-notice";
      notice.innerHTML = '<strong>Pratica chiusa dal calendario operativo.</strong><span>' + esc(code || "-") + ' e ora in fatturazione come bozza ' + esc(invoice && (invoice.protocol || invoice.id) || "-") + '.</span>';
      content.insertBefore(notice, content.firstChild);
    }, 80);
  }
  function closePractice(type, id){
    const item = findItem(type, id);
    if (!item) return alert("Pratica non trovata.");
    const now = new Date().toISOString();
    const date = scheduledDate(item) || today();
    if (!item.operationalPreviousStatus) item.operationalPreviousStatus = item.status || "";
    item.scheduledDate = date;
    item.operationalDate = date;
    item.operationalClosed = true;
    item.operationalClosedAt = item.operationalClosedAt || now;
    item.closedAt = item.closedAt || now;
    item.status = CLOSED_STATUS;
    item.billingStatus = "Da fatturare";
    item.invoiceStatus = "Bozza";
    const invoice = upsertInvoice(type, item);
    const workflow = upsertWorkflow(type, item, invoice);
    item.billingWorkflowId = workflow && workflow.id || item.billingWorkflowId || "";
    item.invoiceReference = invoice && (invoice.protocol || invoice.id) || item.invoiceReference || "";
    item.operationalGeneratedInvoice = invoice && (invoice.protocol || invoice.id) || item.operationalGeneratedInvoice || "";
    item.operationalGeneratedWorkflow = workflow && workflow.id || item.operationalGeneratedWorkflow || "";
    if (!saveLocal()) return;
    window.current = window.current || {};
    current.filters = current.filters || {};
    current.filters.billingTab82 = "out";
    current.page = BILLING_PAGE;
    if (typeof render === "function") render();
    showBillingNotice(itemCode(type, item), invoice);
  }
  function decorateCard(card){
    if (!card || !card.dataset) return;
    const type = card.dataset.pms136Type;
    const id = card.dataset.pms136Id;
    if (!type || !id) return;
    const item = findItem(type, id);
    if (!item) return;
    const closed = isOperationalClosed(item);
    card.classList.toggle("pms147-card-closed", closed);
    if (card.getAttribute("draggable") !== (closed ? "false" : "true")) card.setAttribute("draggable", closed ? "false" : "true");
    const clear = card.querySelector(".pms136-clear");
    if (clear && clear.style.display !== (closed ? "none" : "")) clear.style.display = closed ? "none" : "";
    if (closed) {
      card.querySelectorAll(".pms147-close-button").forEach(node => node.remove());
      if (!card.querySelector(".pms147-closed-row")) {
        const row = document.createElement("div");
        row.className = "pms147-closed-row";
        row.innerHTML = '<span>Chiusa</span><strong>In fatturazione</strong>';
        card.appendChild(row);
      }
      return;
    }
    card.querySelectorAll(".pms147-closed-row").forEach(node => node.remove());
    if (!card.querySelector(".pms147-close-button")) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pms147-close-button";
      button.dataset.pms147Close = type + ":" + id;
      button.textContent = "Chiudi pratica";
      if (clear) clear.insertAdjacentElement("beforebegin", button);
      else card.appendChild(button);
    }
  }
  function decoratePlanner(){
    injectCss();
    const root = document.querySelector(".pms136-page");
    if (!root) return;
    root.querySelectorAll(".pms136-card").forEach(decorateCard);
  }
  function injectCss(){
    let style = document.getElementById("pms-v147-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v147-style";
      document.head.appendChild(style);
    }
    if (style.dataset.pms147Ready === "1") return;
    style.dataset.pms147Ready = "1";
    style.textContent = `
      .pms147-close-button{
        width:auto!important;
        margin:4px 0 0!important;
        padding:5px 8px!important;
        border:1px solid #b9c9bd!important;
        background:#f3f8f4!important;
        color:#2f6840!important;
        border-radius:6px!important;
        font-size:10px!important;
        font-weight:900!important;
        text-transform:uppercase!important;
        letter-spacing:0!important;
      }
      .pms147-close-button:hover{background:#e8f2ea!important;border-color:#91ad99!important;color:#225132!important}
      .pms136-card.pms147-card-closed{
        border-left-color:#5f8f6d!important;
        background:linear-gradient(90deg,#eef7f0 0%,#ffffff 72%)!important;
        box-shadow:0 2px 8px rgba(47,104,64,.08)!important;
        cursor:default!important;
      }
      .pms136-card.pms147-card-closed .pms136-clear{display:none!important}
      .pms147-closed-row{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        margin-top:4px;
        padding:5px 7px;
        border:1px solid #c9dccd;
        background:#f7fbf8;
        border-radius:6px;
        color:#2f6840;
        font-size:10px;
        font-weight:900;
        text-transform:uppercase;
      }
      .pms147-closed-row span{color:#5f7564}
      .pms147-billing-notice{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin:0 0 12px;
        padding:10px 12px;
        border:1px solid #c9dccd;
        border-left:4px solid #5f8f6d;
        background:#f7fbf8;
        color:#26394d;
        border-radius:8px;
        font-size:12px;
      }
      .pms147-billing-notice strong{color:#2f6840}
      .pms147-billing-notice span{text-align:right;color:#526172}
      @media(max-width:760px){.pms147-billing-notice{display:grid}.pms147-billing-notice span{text-align:left}}
      @media print{.pms147-close-button,.pms147-billing-notice{display:none!important}}
    `;
  }
  function bindGlobal(){
    if (window.__pms147GlobalBound) return;
    window.__pms147GlobalBound = true;
    document.addEventListener("click", event => {
      const button = event.target && event.target.closest && event.target.closest("[data-pms147-close]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const parts = String(button.dataset.pms147Close || "").split(":");
      closePractice(parts[0], parts.slice(1).join(":"));
    }, true);
    document.addEventListener("click", event => {
      const card = event.target && event.target.closest && event.target.closest(".pms147-card-closed");
      if (!card) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    document.addEventListener("keydown", event => {
      const card = event.target && event.target.closest && event.target.closest(".pms147-card-closed");
      if (!card || !["Enter", " "].includes(event.key)) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    document.addEventListener("dragstart", event => {
      const card = event.target && event.target.closest && event.target.closest(".pms147-card-closed");
      if (!card) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }
  function observe(){
    if (window.__pms147Observer || !document.body) return;
    let pending = false;
    window.__pms147Observer = new MutationObserver(() => {
      if (pending || !document.querySelector(".pms136-page")) return;
      pending = true;
      setTimeout(() => {
        pending = false;
        decoratePlanner();
      }, 30);
    });
    window.__pms147Observer.observe(document.body, {childList:true, subtree:true});
  }
  function init(){
    stateRef();
    injectCss();
    bindGlobal();
    observe();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms147RenderWrapped) {
      window.__pms147RenderWrapped = true;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(decoratePlanner, 0);
        return result;
      };
    }
    const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
    if (baseBind && !window.__pms147BindWrapped) {
      window.__pms147BindWrapped = true;
      bindPageActions = function(){
        const result = baseBind.apply(this, arguments);
        setTimeout(decoratePlanner, 0);
        return result;
      };
    }
    setTimeout(decoratePlanner, 80);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.PMS_V147_OPERATIONAL_CLOSE_TO_BILLING = {version: VERSION, closePractice};
})();
