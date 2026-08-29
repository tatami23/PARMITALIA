(function () {
  "use strict";

  if (window.PMS_V238_ORDERS_BULK_DELETE) return;

  var VERSION = "pms_v238_orders_bulk_delete";
  var STYLE_ID = "pms-v238-orders-bulk-delete-style";
  var selectedIds = new Set();

  function arr(value) {
    return Array.isArray(value) ? value : [];
  }

  function clean(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function stateRoot() {
    try {
      if (typeof state !== "undefined" && state) {
        state.orders = arr(state.orders);
        return state;
      }
    } catch (error) {}
    window.state = window.state || {};
    window.state.orders = arr(window.state.orders);
    return window.state;
  }

  function isOrdersPage() {
    try {
      return typeof current !== "undefined" && current && current.page === "orders";
    } catch (error) {
      return false;
    }
  }

  function orderId(order) {
    return clean(order && (order.id || order.code || order.orderCode));
  }

  function orderLabel(order) {
    return clean(order && (order.code || order.orderCode || order.id)) || "ordine";
  }

  function findOrder(id) {
    var wanted = clean(id);
    if (!wanted) return null;
    return arr(stateRoot().orders).find(function (order) {
      return clean(order && order.id) === wanted ||
        clean(order && order.code) === wanted ||
        clean(order && order.orderCode) === wanted;
    }) || null;
  }

  function findOrderForRow(row, index) {
    var direct = row && row.getAttribute && row.getAttribute("data-pms234-order-id");
    if (direct && findOrder(direct)) return findOrder(direct);
    var control = row && row.querySelector && row.querySelector("[data-id], [data-pms234-order-edit], [data-print-order]");
    var existingId = control && (control.getAttribute("data-id") || control.getAttribute("data-pms234-order-edit") || control.getAttribute("data-print-order"));
    if (existingId && findOrder(existingId)) return findOrder(existingId);
    var firstCell = row && row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    if (firstCell && findOrder(firstCell)) return findOrder(firstCell);
    return arr(stateRoot().orders)[index] || null;
  }

  function saveNow(reason) {
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRoot()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      }
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow(reason || VERSION);
      }
    } catch (error) {
      console.warn(VERSION + " save failed", error);
    }
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms238-order-toolbar{display:flex!important;align-items:center!important;gap:8px!important;flex-wrap:wrap!important;margin:0 0 10px!important;padding:10px 12px!important;border:1px solid #dbe5ef!important;background:#f8fafc!important;border-radius:8px!important}",
      ".pms238-order-toolbar button{width:auto!important;margin:0!important;white-space:nowrap!important}",
      ".pms238-order-toolbar .pms238-delete-selected{background:#b42318!important;color:#fff!important}",
      ".pms238-selected-count{font-size:12px!important;font-weight:800!important;color:#475569!important;margin-left:auto!important}",
      ".pms238-select-head,.pms238-select-cell{width:46px!important;min-width:46px!important;text-align:center!important}",
      ".pms238-order-check,.pms238-select-all{width:18px!important;height:18px!important;min-width:18px!important;max-width:18px!important;margin:0!important;cursor:pointer!important;pointer-events:auto!important}",
      "tr.pms238-row-selected td{background:#fff7ed!important}"
    ].join("\n");
  }

  function tableNode() {
    var content = document.getElementById("content");
    if (!content) return null;
    return content.querySelector(".pms196-orders-table") || content.querySelector("table");
  }

  function rowsFor(table) {
    if (!table || !table.tBodies || !table.tBodies[0]) return [];
    return Array.from(table.tBodies[0].rows || []).filter(function (row) {
      return !/nessun|nessuna|disponibile/i.test(clean(row.textContent || ""));
    });
  }

  function ensureHeader(table) {
    var row = table && table.tHead && table.tHead.rows && table.tHead.rows[0];
    if (!row) return;
    var first = row.cells[0];
    if (first && first.getAttribute("data-pms238-select-head") === "1") return;
    var th = document.createElement("th");
    th.className = "pms238-select-head";
    th.setAttribute("data-pms238-select-head", "1");
    th.innerHTML = '<input type="checkbox" class="pms238-select-all" aria-label="Seleziona tutti gli ordini visibili">';
    row.insertBefore(th, first || null);
  }

  function ensureToolbar(table) {
    var wrap = table && table.closest && table.closest(".table-wrap");
    var parent = wrap && wrap.parentElement ? wrap.parentElement : table.parentElement;
    if (!parent) return;
    var existing = parent.querySelector(".pms238-order-toolbar");
    if (existing) return;
    var toolbar = document.createElement("div");
    toolbar.className = "pms238-order-toolbar";
    toolbar.innerHTML = '<button type="button" class="inline-danger pms238-delete-selected" data-pms238-delete-selected>Elimina selezionati</button>' +
      '<button type="button" class="inline-button" data-pms238-clear-selected>Deseleziona</button>' +
      '<span class="pms238-selected-count" data-pms238-count>0 selezionati</span>';
    parent.insertBefore(toolbar, wrap || table);
  }

  function visibleIds(table) {
    return rowsFor(table).map(function (row, index) {
      var order = findOrderForRow(row, index);
      return orderId(order);
    }).filter(Boolean);
  }

  function updateControls(table) {
    var ids = visibleIds(table);
    var selectedVisible = ids.filter(function (id) { return selectedIds.has(id); }).length;
    var all = table && table.querySelector(".pms238-select-all");
    if (all) {
      all.checked = ids.length > 0 && selectedVisible === ids.length;
      all.indeterminate = selectedVisible > 0 && selectedVisible < ids.length;
    }
    var count = document.querySelector("[data-pms238-count]");
    if (count) count.textContent = selectedIds.size + (selectedIds.size === 1 ? " selezionato" : " selezionati");
  }

  function decorate() {
    if (!isOrdersPage()) return;
    injectStyle();
    var table = tableNode();
    if (!table) return;
    ensureHeader(table);
    ensureToolbar(table);
    rowsFor(table).forEach(function (row, index) {
      var order = findOrderForRow(row, index);
      var id = orderId(order);
      if (!id) return;
      var first = row.cells[0];
      var cell = first && first.getAttribute("data-pms238-select-cell") === "1" ? first : null;
      if (!cell) {
        cell = document.createElement("td");
        cell.className = "pms238-select-cell";
        cell.setAttribute("data-pms238-select-cell", "1");
        row.insertBefore(cell, first || null);
      }
      cell.innerHTML = '<input type="checkbox" class="pms238-order-check" data-pms238-order-id="' + esc(id) + '" aria-label="Seleziona ordine ' + esc(orderLabel(order)) + '">';
      var check = cell.querySelector(".pms238-order-check");
      check.checked = selectedIds.has(id);
      row.classList.toggle("pms238-row-selected", check.checked);
    });
    updateControls(table);
  }

  function clearSelection() {
    selectedIds.clear();
    decorate();
  }

  function deleteSelected() {
    var ids = Array.from(selectedIds).filter(function (id) { return !!findOrder(id); });
    if (!ids.length) {
      alert("Seleziona almeno un ordine da eliminare.");
      return;
    }
    var message = ids.length === 1 ?
      "Eliminare definitivamente l'ordine selezionato?" :
      "Eliminare definitivamente " + ids.length + " ordini selezionati?";
    if (!confirm(message)) return;
    var toDelete = new Set(ids);
    var s = stateRoot();
    s.orders = arr(s.orders).filter(function (order) {
      return !toDelete.has(orderId(order)) &&
        !toDelete.has(clean(order && order.code)) &&
        !toDelete.has(clean(order && order.orderCode));
    });
    selectedIds.clear();
    saveNow("v238-delete-selected-orders");
    if (typeof render === "function") render();
    else decorate();
  }

  function bind() {
    if (document.__pms238OrdersBulkBound) return;
    document.__pms238OrdersBulkBound = true;
    document.addEventListener("change", function (event) {
      var check = event.target && event.target.closest && event.target.closest(".pms238-order-check,.pms238-select-all");
      if (!check || !isOrdersPage()) return;
      if (check.classList.contains("pms238-select-all")) {
        visibleIds(tableNode()).forEach(function (id) {
          if (check.checked) selectedIds.add(id);
          else selectedIds.delete(id);
        });
      } else {
        var id = check.getAttribute("data-pms238-order-id");
        if (check.checked) selectedIds.add(id);
        else selectedIds.delete(id);
      }
      decorate();
    }, true);
    document.addEventListener("click", function (event) {
      var deleteButton = event.target && event.target.closest && event.target.closest("[data-pms238-delete-selected]");
      var clearButton = event.target && event.target.closest && event.target.closest("[data-pms238-clear-selected]");
      if (!deleteButton && !clearButton) return;
      if (!isOrdersPage()) return;
      event.preventDefault();
      event.stopPropagation();
      if (deleteButton) deleteSelected();
      else clearSelection();
    }, true);
  }

  function scheduleDecorate() {
    setTimeout(decorate, 30);
    setTimeout(decorate, 180);
    setTimeout(decorate, 450);
  }

  function wrapRender() {
    if (typeof render === "function" && !render.__pms238Wrapped) {
      var baseRender = render;
      render = function () {
        var result = baseRender.apply(this, arguments);
        scheduleDecorate();
        return result;
      };
      render.__pms238Wrapped = true;
      try { window.render = render; } catch (error) {}
    }
  }

  function install() {
    bind();
    wrapRender();
    scheduleDecorate();
    window.PMS_V238_ORDERS_BULK_DELETE = {
      version: VERSION,
      refresh: decorate,
      clearSelection: clearSelection,
      deleteSelected: deleteSelected
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
