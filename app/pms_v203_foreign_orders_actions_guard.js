(function(){
  "use strict";

  var VERSION = "pms_v203_foreign_orders_actions_guard";
  var FOREIGN = ["foreignEmployees", "foreignRecruiting"];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.foreignEmployees = arr(state.foreignEmployees);
    state.foreignRecruiting = arr(state.foreignRecruiting);
    state.orders = arr(state.orders);
    return state;
  }
  function page(){ return window.current && current.page || ""; }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v203-actions-guard");
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function idOf(record){
    return String(record && (record.id || record.code || record.practiceCode || record.protocol || record.orderCode || record.uid) || "");
  }
  function titleOf(record){
    return clean(record && (record.fullName || record.name || record.client || record.customer || record.product || record.email || idOf(record))) || "Scheda";
  }
  function rowText(row){ return clean(row && row.textContent || "").toLowerCase(); }
  function foreignList(){
    var data = page() === "foreignRecruiting" ? st().foreignRecruiting : st().foreignEmployees;
    return data.length ? data : st().foreignEmployees.concat(st().foreignRecruiting);
  }
  function matchRecord(list, row, index){
    if (!row) return null;
    var explicit = row.getAttribute("data-pms189-foreign-row") || row.getAttribute("data-pms197-row") || "";
    var first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    var candidates = [explicit, first].filter(Boolean);
    var found = list.find(function(item){
      var id = idOf(item);
      return id && candidates.some(function(value){ return String(value) === id; });
    });
    if (found) return found;
    var text = rowText(row);
    found = list.find(function(item){
      return [idOf(item), item.fullName, item.name, item.email, item.phone, item.whatsapp, item.passportNumber].some(function(value){
        value = clean(value).toLowerCase();
        return value && text.indexOf(value) >= 0;
      });
    });
    return found || list[index] || null;
  }
  function orderCode(order){ return String(order && (order.code || order.orderCode || order.id) || ""); }
  function orderList(){ return st().orders; }
  function matchOrder(row, index){
    var list = orderList();
    var first = row && row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    var text = rowText(row);
    var found = list.find(function(order){
      var code = orderCode(order).toLowerCase();
      var id = idOf(order).toLowerCase();
      return (code && (first.toLowerCase() === code || text.indexOf(code) >= 0)) || (id && (first.toLowerCase() === id || text.indexOf(id) >= 0));
    });
    return found || list[index] || null;
  }
  function ensureHeader(table, label){
    var head = table && table.querySelector("thead tr");
    if (!head) return;
    var last = head.lastElementChild;
    if (last && /azioni/i.test(last.textContent || "")) return;
    var th = document.createElement("th");
    th.textContent = label || "Azioni";
    th.setAttribute("data-pms203-actions-head", "1");
    head.appendChild(th);
  }
  function actionCell(row){
    if (!row || !row.cells || !row.cells.length) return null;
    var found = row.querySelector(".pms203-actions,.pms189-actions,.pms197-actions,.pms179-actions,.pms115-actions,.pms117-row-actions,.pms112-order-actions");
    if (found) return found.closest("td") || row.cells[row.cells.length - 1];
    return row.cells[row.cells.length - 1];
  }
  function makeForeignActions(id){
    return '<div class="pms203-actions pms203-foreign-actions" data-pms203-foreign-id="' + esc(id) + '">' +
      '<button type="button" data-pms203-foreign-open="' + esc(id) + '">Apri scheda</button>' +
      '<button type="button" data-pms203-foreign-edit="' + esc(id) + '">Modifica</button>' +
      '<button type="button" data-pms203-foreign-print="' + esc(id) + '">Stampa</button>' +
      '<button type="button" data-pms203-foreign-excel="' + esc(id) + '">Excel</button>' +
      '<button type="button" data-pms203-foreign-accounting="' + esc(id) + '">Contabilita</button>' +
      '<button type="button" class="pms203-danger" data-pms203-foreign-delete="' + esc(id) + '">Elimina</button>' +
    '</div>';
  }
  function makeOrderActions(id){
    return '<div class="pms203-actions pms203-order-actions" data-pms203-order-id="' + esc(id) + '">' +
      '<button type="button" data-pms203-order-open="' + esc(id) + '">Apri</button>' +
      '<button type="button" data-pms203-order-edit="' + esc(id) + '">Modifica</button>' +
      '<button type="button" data-pms203-order-print-internal="' + esc(id) + '">Stampa interna</button>' +
      '<button type="button" data-pms203-order-print-customer="' + esc(id) + '">PDF cliente</button>' +
      '<button type="button" data-pms203-order-print-supplier="' + esc(id) + '">PDF fornitore</button>' +
      '<button type="button" class="pms203-danger" data-pms203-order-delete="' + esc(id) + '">Elimina</button>' +
    '</div>';
  }
  function decorateForeign(){
    if (FOREIGN.indexOf(page()) < 0 && page() !== "humanResources") return;
    var content = document.getElementById("content");
    if (!content) return;
    var list = foreignList();
    content.querySelectorAll("table").forEach(function(table){
      ensureHeader(table, "Azioni");
      Array.from(table.querySelectorAll("tbody tr")).forEach(function(row, index){
        if (!row.cells || !row.cells.length || /nessun|nessuna/i.test(row.textContent || "")) return;
        var record = matchRecord(list, row, index);
        if (!record) return;
        var id = idOf(record);
        if (!id) return;
        var cell = actionCell(row);
        if (!cell) {
          cell = document.createElement("td");
          row.appendChild(cell);
        }
        row.setAttribute("data-pms203-foreign-row", id);
        cell.classList.add("pms203-actions-cell");
        cell.querySelectorAll(".pms182-actions,.pms189-actions,.pms197-actions,.pms179-actions").forEach(function(old){
          if (!old.classList.contains("pms203-actions")) old.classList.add("pms203-old-actions");
        });
        var host = cell.querySelector(".pms203-foreign-actions");
        if (!host || host.getAttribute("data-pms203-foreign-id") !== id) {
          if (host) host.remove();
          cell.insertAdjacentHTML("afterbegin", makeForeignActions(id));
        }
      });
    });
  }
  function decorateOrders(){
    if (page() !== "orders") return;
    var content = document.getElementById("content");
    if (!content) return;
    content.querySelectorAll("table").forEach(function(table){
      ensureHeader(table, "Azioni ordine");
      Array.from(table.querySelectorAll("tbody tr")).forEach(function(row, index){
        if (!row.cells || !row.cells.length || /nessun|nessuna/i.test(row.textContent || "")) return;
        var order = matchOrder(row, index);
        if (!order) return;
        var id = idOf(order);
        if (!id) return;
        var cell = actionCell(row);
        if (!cell) {
          cell = document.createElement("td");
          row.appendChild(cell);
        }
        row.setAttribute("data-pms203-order-row", id);
        cell.classList.add("pms203-actions-cell");
        cell.querySelectorAll(".pms112-order-actions,.pms115-actions,.pms117-row-actions,.pms179-actions,.pms94-order-print-actions").forEach(function(old){
          if (!old.classList.contains("pms203-actions")) old.classList.add("pms203-old-actions");
        });
        var host = cell.querySelector(".pms203-order-actions");
        if (!host || host.getAttribute("data-pms203-order-id") !== id) {
          if (host) host.remove();
          cell.insertAdjacentHTML("afterbegin", makeOrderActions(id));
        }
      });
    });
  }
  function foreignApi(action, id){
    var api = window.PMS_V179_UNIFIED_ACTIONS_REAL_DELETE_FIX;
    if (api) {
      if (action === "open" && typeof api.openRecord === "function") return api.openRecord("foreignEmployees", id);
      if (action === "edit" && typeof api.editRecord === "function") return api.editRecord("foreignEmployees", id);
      if (action === "print" && typeof api.printRecord === "function") return api.printRecord("foreignEmployees", id);
      if (action === "excel" && typeof api.exportExcel === "function") return api.exportExcel("foreignEmployees", id);
      if (action === "delete" && typeof api.deleteRecord === "function") return api.deleteRecord("foreignEmployees", id);
    }
    var api189 = window.PMS_V189_FOREIGN_ACCOUNTING_PRINT_CHOICES_FIX;
    var record = foreignList().find(function(item){ return idOf(item) === String(id); });
    if (api189 && record) {
      if (action === "open" && typeof api189.openForeign === "function") return api189.openForeign(record);
      if (action === "edit" && typeof api189.editForeign === "function") return api189.editForeign(record);
      if (action === "print" && typeof api189.printForeign === "function") return api189.printForeign(record);
      if (action === "accounting" && typeof api189.linkAccounting === "function") return api189.linkAccounting(record);
    }
    if (action === "edit" && typeof openModal === "function") return openModal("foreignEmployees", id);
  }
  function deleteOrder(id){
    var order = orderList().find(function(item){ return idOf(item) === String(id) || orderCode(item) === String(id); });
    if (!order) return alert("Ordine non trovato.");
    if (!confirm("Eliminare definitivamente l'ordine " + (orderCode(order) || id) + "?")) return;
    st().orders = orderList().filter(function(item){ return idOf(item) !== String(id) && orderCode(item) !== String(id); });
    saveNow();
    if (typeof render === "function") render();
  }
  function printOrder(id, type){
    if (window.pmsV110OrderPrintButtons && typeof window.pmsV110OrderPrintButtons.printOrder === "function") {
      return window.pmsV110OrderPrintButtons.printOrder(id, type || "internal");
    }
    var api = window.PMS_V179_UNIFIED_ACTIONS_REAL_DELETE_FIX;
    if (api && typeof api.printRecord === "function") return api.printRecord("orders", id);
    var btn = document.querySelector('[data-print-order="' + esc(id) + '"],[data-pms110-print-internal="' + esc(id) + '"],[data-pms115-print-internal="' + esc(id) + '"]');
    if (btn && typeof btn.onclick === "function") return btn.onclick();
    alert("Stampa ordine non disponibile per questo record.");
  }
  function handleClick(event){
    var target = event.target && event.target.closest && event.target.closest("[data-pms203-foreign-open],[data-pms203-foreign-edit],[data-pms203-foreign-print],[data-pms203-foreign-excel],[data-pms203-foreign-accounting],[data-pms203-foreign-delete],[data-pms203-order-open],[data-pms203-order-edit],[data-pms203-order-print-internal],[data-pms203-order-print-customer],[data-pms203-order-print-supplier],[data-pms203-order-delete]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    if (target.hasAttribute("data-pms203-foreign-open")) return foreignApi("open", target.getAttribute("data-pms203-foreign-open"));
    if (target.hasAttribute("data-pms203-foreign-edit")) return foreignApi("edit", target.getAttribute("data-pms203-foreign-edit"));
    if (target.hasAttribute("data-pms203-foreign-print")) return foreignApi("print", target.getAttribute("data-pms203-foreign-print"));
    if (target.hasAttribute("data-pms203-foreign-excel")) return foreignApi("excel", target.getAttribute("data-pms203-foreign-excel"));
    if (target.hasAttribute("data-pms203-foreign-accounting")) return foreignApi("accounting", target.getAttribute("data-pms203-foreign-accounting"));
    if (target.hasAttribute("data-pms203-foreign-delete")) return foreignApi("delete", target.getAttribute("data-pms203-foreign-delete"));
    if (target.hasAttribute("data-pms203-order-open") || target.hasAttribute("data-pms203-order-edit")) return typeof openModal === "function" ? openModal("orders", target.getAttribute("data-pms203-order-open") || target.getAttribute("data-pms203-order-edit")) : null;
    if (target.hasAttribute("data-pms203-order-print-internal")) return printOrder(target.getAttribute("data-pms203-order-print-internal"), "internal");
    if (target.hasAttribute("data-pms203-order-print-customer")) return printOrder(target.getAttribute("data-pms203-order-print-customer"), "customer");
    if (target.hasAttribute("data-pms203-order-print-supplier")) return printOrder(target.getAttribute("data-pms203-order-print-supplier"), "supplier");
    if (target.hasAttribute("data-pms203-order-delete")) return deleteOrder(target.getAttribute("data-pms203-order-delete"));
  }
  function injectCss(){
    var style = document.getElementById("pms-v203-actions-guard-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v203-actions-guard-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms203-actions-cell{min-width:430px!important;width:430px!important;vertical-align:top!important;text-align:right!important}",
      ".pms203-actions{display:flex!important;visibility:visible!important;opacity:1!important;flex-wrap:wrap!important;gap:6px!important;align-items:center!important;justify-content:flex-end!important;direction:ltr!important}",
      ".pms203-actions button{display:inline-flex!important;visibility:visible!important;opacity:1!important;width:auto!important;min-width:0!important;margin:0!important;padding:7px 9px!important;border:1px solid #cbd5e1!important;border-radius:6px!important;background:#fff!important;color:#17242b!important;font-size:11.5px!important;font-weight:850!important;line-height:1.1!important;white-space:nowrap!important;cursor:pointer!important}",
      ".pms203-actions .pms203-danger{border-color:#dc2626!important;color:#991b1b!important;background:#fff5f5!important}",
      ".pms203-old-actions{display:none!important;visibility:hidden!important;height:0!important;max-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}",
      ".pms184-stable-actions-cell>.pms203-actions,.pms184-stable-actions-cell>.pms189-actions{display:flex!important;visibility:visible!important;height:auto!important;max-height:none!important;overflow:visible!important}",
      "@media(max-width:900px){.pms203-actions-cell{min-width:260px!important;width:auto!important;text-align:left!important}.pms203-actions{justify-content:flex-start!important}}"
    ].join("\n");
  }
  function decorate(){
    st();
    injectCss();
    decorateForeign();
    decorateOrders();
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms203Wrapped) {
      var base = render;
      render = function(){
        var result = base.apply(this, arguments);
        setTimeout(decorate, 30);
        setTimeout(decorate, 180);
        return result;
      };
      render.__pms203Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
  }

  document.addEventListener("click", handleClick, true);
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  [120, 380, 900, 1800].forEach(function(ms){ setTimeout(decorate, ms); });
  window.PMS_V203_FOREIGN_ORDERS_ACTIONS_GUARD = {version:VERSION, refresh:decorate};
})();
