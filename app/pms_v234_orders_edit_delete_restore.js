(function () {
  "use strict";

  if (window.PMS_V234_ORDERS_EDIT_DELETE_RESTORE) return;

  var VERSION = "pms_v234_orders_edit_delete_restore";
  var STYLE_ID = "pms-v234-orders-edit-delete-style";

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

  function orderCode(order) {
    return clean(order && (order.code || order.orderCode || order.id));
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

  function findOrderForRow(row, rowIndex) {
    var direct = row && row.getAttribute && row.getAttribute("data-pms234-order-id");
    if (direct && findOrder(direct)) return findOrder(direct);
    var existing = row && row.querySelector && row.querySelector('[data-id], [data-pms102-order-edit], [data-print-order]');
    var existingId = existing && (existing.getAttribute("data-id") || existing.getAttribute("data-pms102-order-edit") || existing.getAttribute("data-print-order"));
    if (existingId && findOrder(existingId)) return findOrder(existingId);
    var firstCell = row && row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    if (firstCell && findOrder(firstCell)) return findOrder(firstCell);
    return arr(stateRoot().orders)[rowIndex] || null;
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms234-order-actions{display:flex!important;gap:7px!important;align-items:center!important;flex-wrap:wrap!important;min-width:160px!important}",
      ".pms234-order-actions button{width:auto!important;margin:0!important;white-space:nowrap!important}",
      ".pms234-order-actions .pms234-delete{background:#b42318!important;color:#fff!important;border-color:#b42318!important}",
      ".pms196-orders-table th:last-child,.pms196-orders-table td:last-child{min-width:170px!important}",
      "button[data-pms234-order-edit],button[data-pms234-order-delete]{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:30px!important}"
    ].join("\n");
  }

  function ensureActionHeader(table) {
    var headRow = table && table.tHead && table.tHead.rows && table.tHead.rows[0];
    if (!headRow) return false;
    var last = headRow.cells[headRow.cells.length - 1];
    if (last && /azioni/i.test(clean(last.textContent))) return true;
    var th = document.createElement("th");
    th.textContent = "Azioni";
    th.setAttribute("data-pms234-actions-head", "1");
    headRow.appendChild(th);
    return false;
  }

  function actionHtml(order) {
    var id = clean(order && (order.id || order.code || order.orderCode));
    return '<div class="pms234-order-actions">' +
      '<button type="button" class="inline-button" data-pms234-order-edit="' + esc(id) + '">Modifica</button>' +
      '<button type="button" class="inline-danger pms234-delete" data-pms234-order-delete="' + esc(id) + '">Elimina</button>' +
    '</div>';
  }

  function isEmptyRow(row) {
    return !row || /nessun|nessuna|disponibile/i.test(clean(row.textContent || ""));
  }

  function decorateOrders() {
    if (!isOrdersPage()) return;
    injectStyle();
    var content = document.getElementById("content");
    if (!content) return;
    var table = content.querySelector(".pms196-orders-table") || content.querySelector("table");
    if (!table || !table.tBodies || !table.tBodies[0]) return;
    var hadActionHeader = ensureActionHeader(table);
    var rows = Array.from(table.tBodies[0].rows || []).filter(function (row) { return !isEmptyRow(row); });
    rows.forEach(function (row, index) {
      var order = findOrderForRow(row, index);
      if (!order) return;
      var id = clean(order.id || order.code || order.orderCode);
      row.setAttribute("data-pms234-order-id", id);
      var actionCell = row.querySelector("[data-pms234-actions-cell]");
      if (!actionCell && hadActionHeader) actionCell = row.cells[row.cells.length - 1];
      if (!actionCell) {
        actionCell = document.createElement("td");
        row.appendChild(actionCell);
      }
      actionCell.setAttribute("data-pms234-actions-cell", "1");
      actionCell.setAttribute("data-mobile-label", "Azioni");
      actionCell.innerHTML = actionHtml(order);
    });
  }

  function editOrder(id) {
    var order = findOrder(id);
    if (!order) {
      alert("Ordine non trovato.");
      return;
    }
    if (typeof openModal === "function") {
      openModal("orders", order.id || order.code || id);
      return;
    }
    alert("Funzione modifica non disponibile in questa schermata.");
  }

  function deleteOrder(id) {
    var s = stateRoot();
    var order = findOrder(id);
    if (!order) {
      alert("Ordine non trovato.");
      return;
    }
    var label = orderCode(order) || clean(order.id) || "ordine";
    if (!confirm("Eliminare definitivamente l'ordine " + label + "?")) return;
    s.orders = arr(s.orders).filter(function (item) { return item !== order; });
    saveNow("v234-delete-order");
    if (typeof render === "function") render();
    else decorateOrders();
  }

  function bindClicks() {
    if (document.__pms234OrderActionsBound) return;
    document.__pms234OrderActionsBound = true;
    document.addEventListener("click", function (event) {
      var target = event.target && event.target.closest && event.target.closest("[data-pms234-order-edit], [data-pms234-order-delete], [data-delete='orders'], [data-edit='orders']");
      if (!target) return;
      if (!isOrdersPage()) return;
      var id = target.getAttribute("data-pms234-order-edit") ||
        target.getAttribute("data-pms234-order-delete") ||
        target.getAttribute("data-id");
      if (!id) return;
      if (target.matches("[data-pms234-order-edit], [data-edit='orders']")) {
        event.preventDefault();
        event.stopPropagation();
        editOrder(id);
        return;
      }
      if (target.matches("[data-pms234-order-delete], [data-delete='orders']")) {
        event.preventDefault();
        event.stopPropagation();
        deleteOrder(id);
      }
    }, true);
  }

  function scheduleDecorate() {
    setTimeout(decorateOrders, 20);
    setTimeout(decorateOrders, 160);
    setTimeout(decorateOrders, 420);
  }

  function wrapRender() {
    if (typeof render === "function" && !render.__pms234Wrapped) {
      var baseRender = render;
      render = function () {
        var result = baseRender.apply(this, arguments);
        scheduleDecorate();
        return result;
      };
      render.__pms234Wrapped = true;
      try { window.render = render; } catch (error) {}
    }
    if (typeof bindPageActions === "function" && !bindPageActions.__pms234Wrapped) {
      var baseBind = bindPageActions;
      bindPageActions = function () {
        var result = baseBind.apply(this, arguments);
        scheduleDecorate();
        return result;
      };
      bindPageActions.__pms234Wrapped = true;
      try { window.bindPageActions = bindPageActions; } catch (error) {}
    }
  }

  function install() {
    bindClicks();
    wrapRender();
    scheduleDecorate();
    window.PMS_V234_ORDERS_EDIT_DELETE_RESTORE = {
      version: VERSION,
      refresh: decorateOrders,
      edit: editOrder,
      remove: deleteOrder
    };
    console.info(VERSION + " loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
