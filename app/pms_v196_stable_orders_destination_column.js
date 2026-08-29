(function(){
  "use strict";

  const VERSION = "pms_v196_stable_orders_destination_column";
  const ORDER = "orders";
  const DEST_KEYS = ["destination","orderDestination","deliveryDestination","shipTo","unloadingPlace","deliveryPlace","destinationAddress","customerDestination","finalDestination","to","delivery"];
  const REF_KEYS = ["customerOrderNumber","clientOrderNumber","customerOrder","customerPo","customerPONumber","poNumber","clientReference","customerReference"];
  const COLUMNS = ["code","client","supplier","destination","product","customerOrderNumber","orderType","quantity","unit","total","status","printOrder","actions"];

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function has(value){ return clean(value) !== ""; }
  function esc(value){
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function page(){ return typeof current !== "undefined" && current ? current.page : ""; }
  function st(){
    if (typeof state === "undefined" || !state) return { orders: [] };
    state.orders = arr(state.orders);
    return state;
  }
  function first(item, keys){
    for (const key of keys) {
      if (has(item && item[key])) return clean(item[key]);
    }
    return "";
  }
  function orderCode(order){ return first(order, ["code","orderCode","id"]); }
  function destination(order){ return first(order, DEST_KEYS); }
  function customerRef(order){ return first(order, REF_KEYS); }
  function total(order){
    const value = Number(order && order.total || 0) || (Number(order && order.quantity || 0) * Number(order && order.unitPrice || order && order.price || 0));
    if (typeof formatMoney === "function") return formatMoney(value, order && order.currency || "EUR");
    return value ? value.toFixed(2) + " " + esc(order && order.currency || "EUR") : "-";
  }
  function saveHard(reason){
    try {
      if (typeof save === "function") save();
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      } else if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow(reason || VERSION);
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function ensureField(key, field, afterKey){
    if (typeof schemas === "undefined") return;
    schemas[ORDER] = schemas[ORDER] || { title: "Ordini", fields: [] };
    const fields = arr(schemas[ORDER].fields);
    let existing = fields.find(function(item){ return item && item.key === key; });
    if (existing) Object.assign(existing, field);
    else {
      existing = Object.assign({ key: key }, field);
      const index = fields.findIndex(function(item){ return item && item.key === afterKey; });
      fields.splice(index >= 0 ? index + 1 : fields.length, 0, existing);
    }
    schemas[ORDER].fields = fields;
  }
  function ensureSchema(){
    ensureField("destination", { label: "Destinazione ordine", type: "text" }, "supplier");
    ensureField("customerOrderNumber", { label: "Numero ordine cliente", type: "text" }, "destination");
  }
  function normalizeOrder(order){
    if (!order || typeof order !== "object") return false;
    let changed = false;
    const dest = destination(order);
    if (dest) {
      ["destination","orderDestination"].forEach(function(key){
        if (clean(order[key]) !== dest) {
          order[key] = dest;
          changed = true;
        }
      });
    }
    const ref = customerRef(order);
    if (ref) {
      ["customerOrderNumber","clientOrderNumber"].forEach(function(key){
        if (clean(order[key]) !== ref) {
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
  function destinationHtml(order){
    const dest = destination(order);
    return dest ? '<strong class="pms196-destination-value">' + esc(dest) + '</strong>' : '<span class="muted-small">-</span>';
  }
  function label(key){
    const labels = {
      code: "Codice",
      client: "Cliente",
      supplier: "Fornitore",
      destination: "Destinazione",
      product: "Prodotto",
      customerOrderNumber: "Ordine cliente",
      orderType: "Tipo",
      quantity: "Quantita",
      unit: "Unita",
      total: "Totale",
      status: "Stato",
      printOrder: "Stampa",
      actions: "Azioni"
    };
    if (labels[key]) return labels[key];
    return typeof columnLabel === "function" ? columnLabel(key) : key;
  }
  function cell(order, column){
    if (column === "code") return '<span class="code-block">' + esc(orderCode(order) || "-") + '</span>';
    if (column === "destination") return destinationHtml(order);
    if (column === "customerOrderNumber") return esc(customerRef(order) || "-");
    if (column === "quantity") return esc(order && order.quantity || 0);
    if (column === "total") return total(order);
    if (column === "status") return typeof badge === "function" ? badge(order && order.status || "Nuovo", "primary") : esc(order && order.status || "Nuovo");
    if (column === "printOrder") return '<button class="inline-button" data-print-order="' + esc(order && order.id || "") + '">Modulo</button>';
    if (column === "actions") return '<button class="inline-button" data-edit="orders" data-id="' + esc(order && order.id || "") + '">Modifica</button> <button class="inline-danger" data-delete="orders" data-id="' + esc(order && order.id || "") + '">Elimina</button>';
    return esc(order && order[column] || "-");
  }
  function stableOrdersHtml(){
    normalizeAll();
    const schema = typeof schemas !== "undefined" && schemas[ORDER] ? schemas[ORDER] : { title: "Ordini" };
    const filters = typeof current !== "undefined" && current && current.filters ? current.filters : {};
    const search = clean(filters[ORDER] || "");
    const list = arr(st().orders);
    const filtered = list.filter(function(item){
      return !search || JSON.stringify(item || {}).toLowerCase().includes(search.toLowerCase());
    });
    const rows = filtered.map(function(order){
      return '<tr class="pms196-order-row">' + COLUMNS.map(function(column){
        return '<td class="' + (column === "destination" ? "pms196-destination-cell" : "") + '" data-mobile-label="' + esc(label(column)) + '">' + cell(order, column) + '</td>';
      }).join("") + '</tr>';
    }).join("");
    return '' +
      '<div class="section-header pms196-orders-header">' +
        '<h3>' + esc(schema.title || "Ordini") + '</h3>' +
        '<div class="filters">' +
          '<input data-search="orders" placeholder="Cerca..." value="' + esc(search) + '">' +
          '<button class="primary-button" style="width:auto;margin:0" data-add="orders">+ Nuovo</button>' +
        '</div>' +
      '</div>' +
      '<div class="table-wrap pms196-orders-table-wrap"><table class="pms196-orders-table"><thead><tr>' +
        COLUMNS.map(function(column){ return '<th class="' + (column === "destination" ? "pms196-destination-head" : "") + '">' + esc(label(column)) + '</th>'; }).join("") +
      '</tr></thead><tbody>' + (rows || (typeof emptyRow === "function" ? emptyRow(COLUMNS.length) : '<tr><td colspan="' + COLUMNS.length + '">Nessun dato disponibile</td></tr>')) + '</tbody></table></div>';
  }
  function readForm(form){
    const elements = form && form.elements;
    function value(keys){
      for (const key of keys) {
        if (elements && elements[key] && has(elements[key].value)) return clean(elements[key].value);
      }
      return "";
    }
    return {
      destination: value(DEST_KEYS),
      customerOrderNumber: value(REF_KEYS)
    };
  }
  function findOrder(id, values){
    const rows = arr(st().orders);
    if (has(id)) {
      const byId = rows.find(function(order){
        return clean(order && order.id) === clean(id) || clean(order && order.code) === clean(id) || clean(order && order.orderCode) === clean(id);
      });
      if (byId) return byId;
    }
    if (!values) return null;
    return rows.find(function(order){
      return has(values.destination) && destination(order).toLowerCase() === values.destination.toLowerCase();
    }) || rows[0] || null;
  }
  function applyFormValues(order, values){
    if (!order || !values) return false;
    let changed = false;
    if (has(values.destination)) {
      ["destination","orderDestination"].forEach(function(key){
        if (clean(order[key]) !== values.destination) {
          order[key] = values.destination;
          changed = true;
        }
      });
    }
    if (has(values.customerOrderNumber)) {
      ["customerOrderNumber","clientOrderNumber"].forEach(function(key){
        if (clean(order[key]) !== values.customerOrderNumber) {
          order[key] = values.customerOrderNumber;
          changed = true;
        }
      });
    }
    return changed;
  }
  function paintExistingTable(){
    if (page() !== ORDER) return;
    const wrap = document.querySelector("#content .table-wrap");
    if (!wrap || wrap.classList.contains("pms196-orders-table-wrap")) return;
    wrap.outerHTML = stableOrdersHtml().match(/<div class="table-wrap[\s\S]*$/)?.[0] || wrap.outerHTML;
  }
  function injectCss(){
    let style = document.getElementById("pms-v196-orders-destination-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v196-orders-destination-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms196-orders-table{min-width:1180px!important}
      .pms196-destination-head,
      .pms196-destination-cell{
        background:#eef6ff!important;
        border-left:4px solid #1f4e78!important;
        min-width:190px!important;
        max-width:310px!important;
      }
      .pms196-destination-value,
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
        line-height:1.25!important;
      }
      .pms196-orders-header .filters{align-items:center!important}
      @media(max-width:760px){
        body.device-phone .pms196-orders-table{min-width:0!important}
        body.device-phone .pms196-destination-cell{max-width:none!important}
      }
    `;
  }
  function install(){
    ensureSchema();
    injectCss();
    normalizeAll();

    const baseGetColumns = typeof getColumns === "function" ? getColumns : null;
    if (baseGetColumns && !window.__pms196GetColumnsWrapped) {
      window.__pms196GetColumnsWrapped = true;
      getColumns = function(module){
        if (module === ORDER) return COLUMNS.slice();
        return baseGetColumns.apply(this, arguments);
      };
    }

    const baseColumnLabel = typeof columnLabel === "function" ? columnLabel : null;
    if (baseColumnLabel && !window.__pms196ColumnLabelWrapped) {
      window.__pms196ColumnLabelWrapped = true;
      columnLabel = function(key){
        if (COLUMNS.includes(key)) return label(key);
        return baseColumnLabel.apply(this, arguments);
      };
    }

    const baseCellValue = typeof cellValue === "function" ? cellValue : null;
    if (baseCellValue && !window.__pms196CellValueWrapped) {
      window.__pms196CellValueWrapped = true;
      cellValue = function(module, item, column){
        if (module === ORDER && COLUMNS.includes(column)) return cell(item, column);
        return baseCellValue.apply(this, arguments);
      };
    }

    const baseRenderList = typeof renderListModule === "function" ? renderListModule : null;
    if (baseRenderList && !window.__pms196RenderListWrapped) {
      window.__pms196RenderListWrapped = true;
      renderListModule = function(module){
        if (module === ORDER) return stableOrdersHtml();
        return baseRenderList.apply(this, arguments);
      };
    }

    const baseSubmit = typeof submitModal === "function" ? submitModal : null;
    if (baseSubmit && !window.__pms196SubmitWrapped) {
      window.__pms196SubmitWrapped = true;
      submitModal = function(event, module, id){
        const values = module === ORDER ? readForm(event && event.target) : null;
        const result = baseSubmit.apply(this, arguments);
        if (module === ORDER && values && (has(values.destination) || has(values.customerOrderNumber))) {
          setTimeout(function(){
            const order = findOrder(id, values);
            if (applyFormValues(order, values) || normalizeAll()) saveHard("v196-order-destination-submit");
            if (page() === ORDER && typeof render === "function") render();
          }, 40);
        }
        return result;
      };
    }

    const baseSave = typeof save === "function" ? save : null;
    if (baseSave && !window.__pms196SaveWrapped) {
      window.__pms196SaveWrapped = true;
      save = function(){
        normalizeAll();
        return baseSave.apply(this, arguments);
      };
    }

    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms196RenderWrapped) {
      window.__pms196RenderWrapped = true;
      render = function(){
        normalizeAll();
        const result = baseRender.apply(this, arguments);
        setTimeout(paintExistingTable, 20);
        return result;
      };
    }

    if (page() === ORDER && typeof render === "function") setTimeout(render, 30);
    setTimeout(paintExistingTable, 120);
    window.PMS_V196_STABLE_ORDERS_DESTINATION_COLUMN = {
      version: VERSION,
      columns: COLUMNS.slice(),
      normalize: normalizeAll,
      renderOrders: stableOrdersHtml
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
