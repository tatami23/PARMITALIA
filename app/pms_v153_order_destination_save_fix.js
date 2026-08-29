/* === PMS v153 - Salvataggio reale destinazione ordine e colonna principale === */
(function(){
  "use strict";
  const VERSION153 = "PMS-V153-ORDER-DESTINATION-SAVE-FIX";
  const ORDER = "orders";
  const pendingWrites = [];

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function clean(value){ return String(value == null ? "" : value).trim(); }
  function has(value){ return clean(value) !== ""; }
  function orderCode(order){ return order && (order.code || order.id || order.orderCode) || ""; }
  function destination(order){
    return clean(order && (order.destination || order.orderDestination || order.deliveryDestination || order.shipTo || order.unloadingPlace || order.deliveryPlace || order.destinationAddress || order.customerDestination));
  }
  function customerOrder(order){
    return clean(order && (order.customerOrderNumber || order.clientOrderNumber || order.customerOrder || order.customerPo || order.customerPONumber || order.poNumber || order.clientReference || order.customerReference));
  }
  function findOrder(id){
    return arr(state && state.orders).find(function(order){
      return String(order && order.id) === String(id) || String(order && order.code) === String(id);
    });
  }
  function ensureField(key, field, afterKey){
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
  function ensureSchema(){
    ensureField("destination", {label:"Destinazione ordine", type:"text"}, "supplier");
    ensureField("customerOrderNumber", {label:"Numero ordine cliente", type:"text"}, "destination");
  }
  function applyDestination(order, dest, clientOrder){
    if (!order) return false;
    let changed = false;
    if (dest != null) {
      const value = clean(dest);
      order.destination = value;
      order.orderDestination = value;
      changed = true;
    }
    if (clientOrder != null) {
      const value = clean(clientOrder);
      order.customerOrderNumber = value;
      order.clientOrderNumber = value;
      changed = true;
    }
    return changed;
  }
  function formValues(form){
    const elements = form && form.elements;
    return {
      client: clean(elements && elements.client && elements.client.value),
      supplier: clean(elements && elements.supplier && elements.supplier.value),
      product: clean(elements && elements.product && elements.product.value),
      destination: clean(elements && (elements.destination?.value || elements.orderDestination?.value || elements.deliveryDestination?.value || "")),
      customerOrderNumber: clean(elements && (elements.customerOrderNumber?.value || elements.clientOrderNumber?.value || elements.customerOrder?.value || ""))
    };
  }
  function same(a,b){ return clean(a).toLowerCase() === clean(b).toLowerCase(); }
  function findOrderByValues(values){
    const rows = arr(state && state.orders);
    return rows.find(function(order){
      return has(values.client) && same(order && order.client, values.client) &&
        (!has(values.supplier) || same(order && order.supplier, values.supplier)) &&
        (!has(values.product) || same(order && order.product, values.product));
    }) || rows[0];
  }
  function persistValues(id, values){
    if (!values || (!has(values.destination) && !has(values.customerOrderNumber))) return false;
    const modal = document.getElementById("modal");
    if (!id && modal && !modal.classList.contains("hidden")) return false;
    const order = findOrder(id) || findOrderByValues(values);
    if (!order) return false;
    if (!applyDestination(order, values.destination, values.customerOrderNumber)) return false;
    saveNow();
    decorateOrdersTable();
    return true;
  }
  function schedulePersist(id, values){
    if (!values || (!has(values.destination) && !has(values.customerOrderNumber))) return;
    pendingWrites.push({id:id || "", values:Object.assign({}, values), at:Date.now()});
    [0, 80, 260, 700].forEach(function(delay){
      setTimeout(function(){
        persistValues(id, values);
        if (typeof render === "function" && delay === 260) render();
      }, delay);
    });
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch(error) {
      console.warn(VERSION153 + " save failed", error);
      return false;
    }
  }
  function normalizeExisting(){
    ensureSchema();
    arr(state && state.orders).forEach(function(order){
      const dest = destination(order);
      if (dest && order.destination !== dest) {
        order.destination = dest;
        order.orderDestination = dest;
      }
      const co = customerOrder(order);
      if (co && order.customerOrderNumber !== co) {
        order.customerOrderNumber = co;
        order.clientOrderNumber = co;
      }
    });
  }
  function destinationCell(order){
    const dest = destination(order);
    return dest ? '<strong class="pms153-destination">' + esc(dest) + '</strong>' : '<span class="muted-small">-</span>';
  }
  function injectStyle(){
    if (document.getElementById("pms-v153-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v153-style";
    style.textContent = ".pms153-destination{font-weight:900;color:#0f172a;letter-spacing:0}.pms153-destination-cell{background:#f8fafc}.pms153-destination-cell strong{display:inline-block;min-width:64px}";
    document.head.appendChild(style);
  }
  function decorateOrdersTable(){
    if (!current || current.page !== ORDER) return;
    injectStyle();
    document.querySelectorAll("#content table").forEach(function(table){
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
        const order = arr(state && state.orders).find(function(item){
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
        cell.classList.add("pms153-destination-cell");
        cell.innerHTML = order ? destinationCell(order) : '<span class="muted-small">-</span>';
      });
    });
  }

  normalizeExisting();

  const baseGetColumns153 = typeof getColumns === "function" ? getColumns : null;
  if (baseGetColumns153) getColumns = function(module){
    const original = baseGetColumns153.apply(this, arguments);
    if (module !== ORDER || !Array.isArray(original)) return original;
    const preferred = ["code","client","supplier","destination","product","customerOrderNumber"];
    const rest = original.filter(function(column){ return !preferred.includes(column) && column !== "orderDestination"; });
    return preferred.concat(rest);
  };

  const baseColumnLabel153 = typeof columnLabel === "function" ? columnLabel : null;
  if (baseColumnLabel153) columnLabel = function(key){
    if (key === "destination" || key === "orderDestination") return "Destinazione";
    if (key === "customerOrderNumber") return "Ordine cliente";
    return baseColumnLabel153.apply(this, arguments);
  };

  const baseCellValue153 = typeof cellValue === "function" ? cellValue : null;
  if (baseCellValue153) cellValue = function(module, item, column){
    if (module === ORDER && (column === "destination" || column === "orderDestination")) return destinationCell(item);
    if (module === ORDER && column === "customerOrderNumber") return esc(customerOrder(item) || "-");
    return baseCellValue153.apply(this, arguments);
  };

  const baseOpenModal153 = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal153) openModal = function(module, id){
    normalizeExisting();
    const result = baseOpenModal153.apply(this, arguments);
    if (module === ORDER) {
      setTimeout(function(){
        const order = findOrder(id);
        const form = document.getElementById("modal-form");
        if (!form) return;
        form.dataset.pms153Module = ORDER;
        form.dataset.pms153OrderId = id || "";
        if (form.elements.destination && order && !has(form.elements.destination.value)) form.elements.destination.value = destination(order);
        if (form.elements.customerOrderNumber && order && !has(form.elements.customerOrderNumber.value)) form.elements.customerOrderNumber.value = customerOrder(order);
      }, 40);
    }
    return result;
  };

  const baseSubmit153 = typeof submitModal === "function" ? submitModal : null;
  if (baseSubmit153) submitModal = function(event, module, id){
    const values = module === ORDER ? formValues(event && event.target) : null;
    if (module === ORDER) schedulePersist(id, values);
    const result = baseSubmit153.apply(this, arguments);
    if (module === ORDER && values && (has(values.destination) || has(values.customerOrderNumber))) {
      schedulePersist(id, values);
    }
    return result;
  };

  document.addEventListener("submit", function(event){
    const form = event.target;
    if (!form || form.id !== "modal-form" || form.dataset.pms153Module !== ORDER) return;
    const values = formValues(form);
    schedulePersist(form.dataset.pms153OrderId || "", values);
  }, true);

  const baseSave153 = typeof save === "function" ? save : null;
  if (baseSave153) save = function(){
    normalizeExisting();
    return baseSave153.apply(this, arguments);
  };

  const baseBind153 = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind153) bindPageActions = function(){
    const result = baseBind153.apply(this, arguments);
    setTimeout(decorateOrdersTable, 20);
    setTimeout(decorateOrdersTable, 180);
    return result;
  };

  const baseRender153 = typeof render === "function" ? render : null;
  if (baseRender153) render = function(){
    normalizeExisting();
    const result = baseRender153.apply(this, arguments);
    setTimeout(decorateOrdersTable, 20);
    setTimeout(decorateOrdersTable, 220);
    return result;
  };

  setTimeout(function(){
    normalizeExisting();
    decorateOrdersTable();
  }, 120);

  window.pmsV153OrderDestinationSaveFix = {
    version: VERSION153,
    normalize: normalizeExisting,
    decorate: decorateOrdersTable
  };
  console.info(VERSION153 + " loaded");
})();
