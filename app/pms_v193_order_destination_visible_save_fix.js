(function(){
  "use strict";

  const VERSION = "pms_v193_order_destination_visible_save_fix";
  const ORDER = "orders";
  const DEST_KEYS = ["destination","orderDestination","deliveryDestination","shipTo","unloadingPlace","deliveryPlace","destinationAddress","customerDestination","finalDestination","to"];
  const REF_KEYS = ["customerOrderNumber","clientOrderNumber","customerOrder","customerPo","customerPONumber","poNumber","clientReference","customerReference"];

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function has(value){ return clean(value) !== ""; }
  function page(){ return typeof current !== "undefined" && current ? current.page : ""; }
  function st(){
    if (typeof state === "undefined") return {orders:[]};
    state.orders = arr(state.orders);
    return state;
  }
  function first(item, keys){
    for (const key of keys) {
      const value = item && item[key];
      if (has(value)) return clean(value);
    }
    return "";
  }
  function orderCode(order){ return first(order, ["code","orderCode","id"]); }
  function destination(order){ return first(order, DEST_KEYS); }
  function customerRef(order){ return first(order, REF_KEYS); }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v193-order-destination");
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function ensureField(key, field, afterKey){
    if (typeof schemas === "undefined") return;
    schemas[ORDER] = schemas[ORDER] || {title:"Ordini", fields:[]};
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
  function ensureSchema(){
    ensureField("destination", {label:"Destinazione ordine", type:"text"}, "supplier");
    ensureField("customerOrderNumber", {label:"Numero ordine cliente", type:"text"}, "destination");
  }
  function normalizeOrder(order){
    if (!order || typeof order !== "object") return false;
    let changed = false;
    const dest = destination(order);
    if (dest) {
      DEST_KEYS.forEach(function(key){
        if ((key === "destination" || key === "orderDestination") && order[key] !== dest) {
          order[key] = dest;
          changed = true;
        }
      });
    }
    const ref = customerRef(order);
    if (ref) {
      ["customerOrderNumber","clientOrderNumber"].forEach(function(key){
        if (order[key] !== ref) {
          order[key] = ref;
          changed = true;
        }
      });
    }
    return changed;
  }
  function normalizeAll(){
    ensureSchema();
    let changed = false;
    arr(st().orders).forEach(function(order){ changed = normalizeOrder(order) || changed; });
    return changed;
  }
  function readForm(form){
    const el = form && form.elements;
    function value(keys){
      for (const key of keys) {
        if (el && el[key] && has(el[key].value)) return clean(el[key].value);
      }
      return "";
    }
    return {
      client:value(["client","customer","targetClient"]),
      supplier:value(["supplier"]),
      product:value(["product","productName"]),
      destination:value(DEST_KEYS),
      customerOrderNumber:value(REF_KEYS)
    };
  }
  function same(a,b){ return clean(a).toLowerCase() === clean(b).toLowerCase(); }
  function findOrder(id, values){
    const rows = arr(st().orders);
    if (has(id)) {
      const found = rows.find(function(order){
        return same(order && order.id, id) || same(order && order.code, id) || same(order && order.orderCode, id);
      });
      if (found) return found;
    }
    if (values) {
      return rows.find(function(order){
        return (!has(values.client) || same(order && order.client, values.client)) &&
          (!has(values.supplier) || same(order && order.supplier, values.supplier)) &&
          (!has(values.product) || same(order && order.product, values.product)) &&
          (!destination(order) || same(destination(order), values.destination));
      }) || rows.find(function(order){
        return has(values.client) && same(order && order.client, values.client) &&
          (!has(values.product) || same(order && order.product, values.product));
      });
    }
    return null;
  }
  function applyValues(order, values){
    if (!order || !values) return false;
    let changed = false;
    if (has(values.destination)) {
      ["destination","orderDestination"].forEach(function(key){
        if (order[key] !== values.destination) {
          order[key] = values.destination;
          changed = true;
        }
      });
    }
    if (has(values.customerOrderNumber)) {
      ["customerOrderNumber","clientOrderNumber"].forEach(function(key){
        if (order[key] !== values.customerOrderNumber) {
          order[key] = values.customerOrderNumber;
          changed = true;
        }
      });
    }
    return changed;
  }
  function destinationHtml(order){
    const dest = destination(order);
    return dest ? '<strong class="pms193-destination">' + esc(dest) + '</strong>' : '<span class="muted-small">-</span>';
  }
  function decorateForm(){
    const form = document.getElementById("modal-form");
    if (!form) return;
    ["destination","orderDestination","deliveryDestination","deliveryPlace","destinationAddress","shipTo"].forEach(function(name){
      const field = form.elements && form.elements[name];
      if (!field) return;
      field.classList.add("pms193-destination-input");
      if (!field.placeholder) field.placeholder = "Destinazione ordine / luogo scarico";
      const label = field.closest && field.closest(".form-field");
      if (label) label.classList.add("pms193-destination-field");
    });
  }
  function decorateTable(){
    if (page() !== ORDER) return;
    injectCss();
    normalizeAll();
    const content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table").forEach(function(table){
      const headerRow = table.querySelector("thead tr");
      if (!headerRow) return;
      let headers = Array.from(headerRow.children);
      const text = headers.map(function(th){ return clean(th.textContent).toLowerCase(); });
      let destIndex = text.findIndex(function(label){ return label.includes("destinazione"); });
      const supplierIndex = text.findIndex(function(label){ return label.includes("fornitore"); });
      const productIndex = text.findIndex(function(label){ return label.includes("prodotto"); });
      const codeIndex = text.findIndex(function(label){ return label.includes("codice") || label === "id"; });
      if (destIndex < 0) {
        const th = document.createElement("th");
        th.textContent = "Destinazione";
        const anchor = supplierIndex >= 0 ? headers[supplierIndex] : headers[Math.max(0, productIndex - 1)];
        if (anchor && anchor.nextSibling) headerRow.insertBefore(th, anchor.nextSibling);
        else headerRow.appendChild(th);
        headers = Array.from(headerRow.children);
        destIndex = headers.indexOf(th);
      }
      table.querySelectorAll("tbody tr").forEach(function(row,index){
        if (!row.children.length || row.children.length === 1) return;
        const cells = Array.from(row.children);
        const codeText = codeIndex >= 0 && cells[codeIndex] ? clean(cells[codeIndex].textContent) : "";
        const order = findOrder(codeText) || arr(st().orders)[index];
        let cell = row.children[destIndex];
        if (!cell || row.children.length < headers.length) {
          cell = document.createElement("td");
          const after = supplierIndex >= 0 ? row.children[supplierIndex] : row.children[Math.max(0, productIndex - 1)];
          if (after && after.nextSibling) row.insertBefore(cell, after.nextSibling);
          else row.appendChild(cell);
        }
        cell.classList.add("pms193-destination-cell");
        cell.innerHTML = order ? destinationHtml(order) : '<span class="muted-small">-</span>';
      });
    });
  }
  function injectCss(){
    let style = document.getElementById("pms-v193-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v193-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms193-destination,
      .pms190-destination-value,
      .pms153-destination{
        display:inline-block!important;
        color:#0f172a!important;
        font-weight:950!important;
        text-transform:uppercase!important;
        text-decoration-line:underline!important;
        text-decoration-thickness:2px!important;
        text-underline-offset:3px!important;
        text-decoration-color:#1f4e78!important;
      }
      .pms193-destination-cell,
      .pms190-destination-cell,
      .pms153-destination-cell{
        background:#eef6ff!important;
        border-left:4px solid #1f4e78!important;
      }
      .pms193-destination-input{
        border-bottom:3px solid #1f4e78!important;
        background:#f8fbff!important;
        font-weight:850!important;
      }
      .pms193-destination-field label{color:#1f4e78!important;font-weight:950!important}
    `;
  }
  function decorate(){
    ensureSchema();
    injectCss();
    decorateForm();
    decorateTable();
  }

  ensureSchema();
  injectCss();

  const baseGetColumns = typeof getColumns === "function" ? getColumns : null;
  if (baseGetColumns && !baseGetColumns.__pms193Wrapped) {
    getColumns = function(module){
      const original = baseGetColumns.apply(this, arguments);
      if (module !== ORDER || !Array.isArray(original)) return original;
      const preferred = ["code","client","supplier","destination","product","customerOrderNumber"];
      const rest = original.filter(function(col){ return !preferred.includes(col) && col !== "orderDestination"; });
      return preferred.concat(rest);
    };
    getColumns.__pms193Wrapped = true;
  }
  const baseColumnLabel = typeof columnLabel === "function" ? columnLabel : null;
  if (baseColumnLabel && !baseColumnLabel.__pms193Wrapped) {
    columnLabel = function(key){
      if (key === "destination" || key === "orderDestination") return "Destinazione";
      if (key === "customerOrderNumber" || key === "clientOrderNumber") return "Ordine cliente";
      return baseColumnLabel.apply(this, arguments);
    };
    columnLabel.__pms193Wrapped = true;
  }
  const baseCellValue = typeof cellValue === "function" ? cellValue : null;
  if (baseCellValue && !baseCellValue.__pms193Wrapped) {
    cellValue = function(module,item,column){
      if (module === ORDER && (column === "destination" || column === "orderDestination")) return destinationHtml(item);
      if (module === ORDER && (column === "customerOrderNumber" || column === "clientOrderNumber")) return esc(customerRef(item) || "-");
      return baseCellValue.apply(this, arguments);
    };
    cellValue.__pms193Wrapped = true;
  }
  const baseSubmit = typeof submitModal === "function" ? submitModal : null;
  if (baseSubmit && !baseSubmit.__pms193Wrapped) {
    submitModal = function(event,module,id){
      const values = module === ORDER ? readForm(event && event.target) : null;
      const result = baseSubmit.apply(this, arguments);
      if (module === ORDER && values && (has(values.destination) || has(values.customerOrderNumber))) {
        [0,80,240,600].forEach(function(delay){
          setTimeout(function(){
            const order = findOrder(id, values);
            if (applyValues(order, values)) saveNow();
            decorateTable();
          }, delay);
        });
      }
      return result;
    };
    submitModal.__pms193Wrapped = true;
  }
  const baseOpenModal = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal && !baseOpenModal.__pms193Wrapped) {
    openModal = function(module,id){
      ensureSchema();
      const result = baseOpenModal.apply(this, arguments);
      if (module === ORDER) {
        setTimeout(function(){
          const order = findOrder(id);
          const form = document.getElementById("modal-form");
          if (form && order && form.elements.destination && !has(form.elements.destination.value)) {
            form.elements.destination.value = destination(order);
          }
          decorateForm();
        }, 40);
      }
      return result;
    };
    openModal.__pms193Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms193Wrapped) {
    render = function(){
      normalizeAll();
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 30);
      setTimeout(decorate, 220);
      return result;
    };
    render.__pms193Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms193Wrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      setTimeout(decorate, 30);
      return result;
    };
    bindPageActions.__pms193Wrapped = true;
  }
  const baseSave = typeof save === "function" ? save : null;
  if (baseSave && !baseSave.__pms193Wrapped) {
    save = function(){
      normalizeAll();
      return baseSave.apply(this, arguments);
    };
    save.__pms193Wrapped = true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  [80,260,700,1400].forEach(function(ms){ setTimeout(decorate, ms); });
  window.PMS_V193_ORDER_DESTINATION_VISIBLE_SAVE_FIX = {version:VERSION, decorate:decorate, normalize:normalizeAll};
  console.info(VERSION + " loaded");
})();
