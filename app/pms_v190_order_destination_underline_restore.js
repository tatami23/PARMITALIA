(function(){
  "use strict";

  const VERSION = "pms_v190_order_destination_underline_restore";
  const ORDER = "orders";
  const OPERATIONAL = "operativo";
  const DEST_KEYS = [
    "destination",
    "orderDestination",
    "deliveryDestination",
    "shipTo",
    "unloadingPlace",
    "deliveryPlace",
    "destinationAddress",
    "customerDestination",
    "finalDestination",
    "to"
  ];

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
    return state;
  }
  function first(item, keys){
    for (const key of keys) {
      const value = item && item[key];
      if (clean(value)) return clean(value);
    }
    return "";
  }
  function orderCode(order){ return first(order, ["code","orderCode","id"]) || "-"; }
  function orderDestination(order){ return first(order, DEST_KEYS); }
  function customerOrder(order){
    return first(order, ["customerOrderNumber","clientOrderNumber","customerOrder","customerPo","customerPONumber","poNumber","clientReference","customerReference"]);
  }
  function findOrder(id){
    const wanted = clean(id).toLowerCase();
    return st().orders.find(function(order){
      return [order && order.id, order && order.code, order && order.orderCode].some(function(value){
        return clean(value).toLowerCase() === wanted;
      });
    });
  }
  function parseLines(order){
    for (const key of ["orderLineItemsJson","multiArticleItemsJson","dealLineItemsJson"]) {
      try {
        const parsed = JSON.parse(order && order[key] || "[]");
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch(error) {}
    }
    return [];
  }
  function orderProduct(order){
    const direct = first(order, ["product","productName","description"]);
    if (direct) return direct;
    const firstLine = parseLines(order)[0] || {};
    return first(firstLine, ["product","productName","description","articleCode"]) || "-";
  }
  function orderQuantity(order){
    const direct = [order && order.quantity, order && order.unit].filter(function(value){ return clean(value); }).join(" ");
    if (clean(direct)) return direct;
    const lines = parseLines(order);
    if (!lines.length) return "-";
    if (lines.length === 1) return [lines[0].quantity, lines[0].unit].filter(function(value){ return clean(value); }).join(" ") || "-";
    const unit = first(lines[0], ["unit"]) || "";
    const total = lines.reduce(function(sum, line){
      const n = Number(String(line.quantity || "").replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
    return total ? String(total) + (unit ? " " + unit : "") : String(lines.length) + " articoli";
  }
  function ensureField(key, field, afterKey){
    if (typeof schemas === "undefined") return;
    if (!schemas[ORDER]) schemas[ORDER] = {title:"Ordini", fields:[]};
    const fields = arr(schemas[ORDER].fields);
    let existing = fields.find(function(item){ return item.key === key; });
    if (existing) Object.assign(existing, field);
    else {
      existing = Object.assign({key:key}, field);
      const index = fields.findIndex(function(item){ return item.key === afterKey; });
      fields.splice(index >= 0 ? index + 1 : fields.length, 0, existing);
    }
    schemas[ORDER].fields = fields;
  }
  function ensureOrderSchema(){
    ensureField("destination", {label:"Destinazione ordine", type:"text"}, "supplier");
    ensureField("customerOrderNumber", {label:"Numero ordine cliente", type:"text"}, "destination");
  }
  function injectCss(){
    let style = document.getElementById("pms-v190-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v190-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms153-destination,
      .pms190-destination-value{
        display:inline-block!important;
        color:#0f172a!important;
        font-weight:950!important;
        text-transform:uppercase!important;
        text-decoration-line:underline!important;
        text-decoration-thickness:2px!important;
        text-underline-offset:3px!important;
        text-decoration-color:#1f4e78!important;
        letter-spacing:0!important;
      }
      .pms153-destination-cell,
      .pms190-destination-cell{
        background:#eef6ff!important;
        border-left:4px solid #1f4e78!important;
        box-shadow:inset 0 -1px 0 rgba(31,78,120,.24)!important;
      }
      .pms190-destination-label{
        border-bottom:2px solid #1f4e78!important;
        padding-bottom:5px!important;
      }
      .pms190-destination-field{
        border-bottom:3px solid #1f4e78!important;
        background:#f8fbff!important;
        font-weight:850!important;
      }
      .pms190-order-details{display:grid;gap:5px;margin-top:5px}
      .pms190-order-row{display:grid;grid-template-columns:82px minmax(0,1fr);gap:7px;font-size:10.8px;line-height:1.25}
      .pms190-order-row b{color:#687684;font-weight:900}
      .pms190-order-row span{color:#263545;word-break:break-word;font-weight:750}
      .pms190-order-row.destination{border-left:4px solid #1f4e78;background:#eef6ff;border-radius:6px;padding:5px 6px}
      .pms190-order-row.destination b{color:#1f4e78}
      .pms190-order-row.destination span{font-size:12px}
    `;
  }
  function destinationCell(order){
    const dest = orderDestination(order);
    return dest ? '<strong class="pms190-destination-value">' + esc(dest) + '</strong>' : '<span class="muted-small">-</span>';
  }
  function decorateOrderForm(){
    const form = document.getElementById("modal-form");
    if (!form) return;
    ["destination","orderDestination","deliveryDestination","deliveryPlace","destinationAddress","shipTo"].forEach(function(name){
      const field = form.elements && form.elements[name];
      if (!field) return;
      field.classList.add("pms190-destination-field");
      if (!field.getAttribute("placeholder")) field.setAttribute("placeholder", "Destinazione ordine / luogo scarico");
      const label = field.closest && field.closest("label");
      if (label) label.classList.add("pms190-destination-label");
    });
  }
  function decorateOrdersTable(){
    if (!window.current || current.page !== ORDER) return;
    injectCss();
    ensureOrderSchema();
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table").forEach(function(table){
      const headerRow = table.querySelector("thead tr");
      if (!headerRow) return;
      let headers = Array.from(headerRow.children);
      const headerText = headers.map(function(th){ return clean(th.textContent).toLowerCase(); });
      let destinationIndex = headerText.findIndex(function(text){ return text === "destinazione" || text.includes("destinazione"); });
      const supplierIndex = headerText.findIndex(function(text){ return text === "fornitore" || text.includes("fornitore"); });
      const productIndex = headerText.findIndex(function(text){ return text === "prodotto" || text.includes("prodotto"); });
      const codeIndex = headerText.findIndex(function(text){ return text === "codice" || text.includes("codice"); });
      if (destinationIndex < 0) {
        const th = document.createElement("th");
        th.textContent = "Destinazione";
        const insertAfter = supplierIndex >= 0 ? headers[supplierIndex] : headers[Math.max(0, productIndex - 1)];
        if (insertAfter && insertAfter.nextSibling) headerRow.insertBefore(th, insertAfter.nextSibling);
        else headerRow.appendChild(th);
        headers = Array.from(headerRow.children);
        destinationIndex = headers.indexOf(th);
      }
      table.querySelectorAll("tbody tr").forEach(function(row){
        if (!row.children.length || row.children.length === 1) return;
        const cells = Array.from(row.children);
        const codeText = codeIndex >= 0 && cells[codeIndex] ? clean(cells[codeIndex].textContent) : "";
        const order = st().orders.find(function(item){
          return [orderCode(item), item && item.id, item && item.code].filter(Boolean).some(function(value){
            return clean(value) === codeText;
          });
        });
        let cell = row.children[destinationIndex];
        if (!cell || row.children.length < headers.length) {
          cell = document.createElement("td");
          const after = supplierIndex >= 0 ? row.children[supplierIndex] : row.children[Math.max(0, productIndex - 1)];
          if (after && after.nextSibling) row.insertBefore(cell, after.nextSibling);
          else row.appendChild(cell);
        }
        cell.classList.add("pms190-destination-cell");
        cell.innerHTML = order ? destinationCell(order) : '<span class="muted-small">-</span>';
      });
    });
  }
  function row(label, value, cls){
    return '<div class="pms190-order-row ' + esc(cls || "") + '"><b>' + esc(label) + '</b><span class="' + (cls === "destination" ? "pms190-destination-value" : "") + '">' + esc(clean(value) || "-") + '</span></div>';
  }
  function orderDetails(order){
    return '<div class="pms190-order-details">' +
      row("Cliente", first(order, ["client","customer","targetClient"])) +
      row("Fornitore", first(order, ["supplier"])) +
      row("Destinazione", orderDestination(order), "destination") +
      row("Prodotto", orderProduct(order)) +
      row("Quantita", orderQuantity(order)) +
      row("Ord. cliente", customerOrder(order)) +
    '</div>';
  }
  function decorateOperationalOrders(){
    if (!window.current || current.page !== OPERATIONAL) return;
    injectCss();
    document.querySelectorAll('.pms136-card[data-pms136-type="order"]').forEach(function(card){
      const order = findOrder(card.dataset.pms136Id);
      if (!order) return;
      const html = orderDetails(order);
      const existing = card.querySelector(".pms190-order-details");
      if (existing) existing.outerHTML = html;
      else {
        const clear = card.querySelector(".pms136-clear");
        if (clear) clear.insertAdjacentHTML("beforebegin", html);
        else card.insertAdjacentHTML("beforeend", html);
      }
    });
  }
  function decorate(){
    st();
    ensureOrderSchema();
    injectCss();
    decorateOrderForm();
    decorateOrdersTable();
    decorateOperationalOrders();
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms190Wrapped) {
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 30);
      setTimeout(decorate, 220);
      return result;
    };
    render.__pms190Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms190Wrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      setTimeout(decorate, 30);
      setTimeout(decorate, 220);
      return result;
    };
    bindPageActions.__pms190Wrapped = true;
  }
  const baseOpenModal = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal && !baseOpenModal.__pms190Wrapped) {
    openModal = function(){
      const result = baseOpenModal.apply(this, arguments);
      setTimeout(decorateOrderForm, 30);
      setTimeout(decorateOrderForm, 180);
      return result;
    };
    openModal.__pms190Wrapped = true;
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  [80, 260, 700, 1400].forEach(function(ms){ setTimeout(decorate, ms); });
  setInterval(decorate, 1800);
  window.PMS_V190_ORDER_DESTINATION_UNDERLINE_RESTORE = {version:VERSION, decorate:decorate};
  console.info(VERSION + " loaded");
})();
