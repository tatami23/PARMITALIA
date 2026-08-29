(function(){
  "use strict";

  const VERSION = "pms_v161_operational_destination_remove_crypto";
  const CRYPTO = "cryptoMonitor";
  const OPERATIONAL = "operativo";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function clean(value){ return String(value == null ? "" : value).trim(); }
  function st(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.settings = state.settings || {};
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
  function orderDestination(order){
    return first(order, [
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
    ]);
  }
  function lineItems(order){
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
    const firstLine = lineItems(order)[0] || {};
    return first(firstLine, ["product","productName","description","articleCode"]) || "-";
  }
  function orderQuantity(order){
    const direct = [order && order.quantity, order && order.unit].filter(function(value){ return clean(value); }).join(" ");
    if (clean(direct)) return direct;
    const lines = lineItems(order);
    if (!lines.length) return "-";
    if (lines.length === 1) return [lines[0].quantity, lines[0].unit].filter(function(value){ return clean(value); }).join(" ") || "-";
    const unit = first(lines[0], ["unit"]) || "";
    const total = lines.reduce(function(sum, line){
      const n = Number(String(line.quantity || "").replace(/\s/g, "").replace(",", "."));
      return Number.isFinite(n) ? sum + n : sum;
    }, 0);
    return total ? String(total) + (unit ? " " + unit : "") : String(lines.length) + " articoli";
  }
  function findOrder(id){
    const wanted = clean(id).toLowerCase();
    return st().orders.find(function(order){
      return [order && order.id, order && order.code, order && order.orderCode].some(function(value){
        return clean(value).toLowerCase() === wanted;
      });
    });
  }
  function row(label, value, cls){
    return '<div class="pms161-order-row ' + esc(cls || "") + '"><b>' + esc(label) + '</b><span>' + esc(clean(value) || "-") + '</span></div>';
  }
  function details(order){
    return '<div class="pms161-order-details">' +
      row("Cliente", first(order, ["client","customer","targetClient"])) +
      row("Fornitore", first(order, ["supplier"])) +
      row("Destinazione", orderDestination(order), "destination") +
      row("Prodotto", orderProduct(order)) +
      row("Quantita", orderQuantity(order)) +
      row("Stato", first(order, ["status"]) || "Nuovo") +
    '</div>';
  }

  function injectCss(){
    let style = document.getElementById("pms-v161-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v161-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      [data-page="cryptoMonitor"],[data-page="cryptoMonitor"].nav-button{display:none!important}
      .pms161-order-details{display:grid;gap:5px;margin-top:2px}
      .pms161-order-row{display:grid;grid-template-columns:76px minmax(0,1fr);gap:7px;font-size:10.8px;line-height:1.25}
      .pms161-order-row b{color:#687684;font-weight:900}
      .pms161-order-row span{color:#263545;word-break:break-word;font-weight:750}
      .pms161-order-row.destination{border-left:4px solid #1f4e78;background:#eef6ff;border-radius:6px;padding:5px 6px;grid-template-columns:82px minmax(0,1fr)}
      .pms161-order-row.destination b{color:#1f4e78}
      .pms161-order-row.destination span{font-size:12px;font-weight:950;color:#0f172a;text-transform:uppercase}
      .pms136-card[data-pms136-type="order"] .pms136-card-row{display:none!important}
      .pms136-card[data-pms136-type="order"] .pms136-card-head strong:after{content:"";display:block;margin-top:2px}
    `;
  }

  function decorateOperationalOrders(){
    if (!window.current || current.page !== OPERATIONAL) return;
    document.querySelectorAll('.pms136-card[data-pms136-type="order"]').forEach(function(card){
      const order = findOrder(card.dataset.pms136Id);
      if (!order) return;
      const existing = card.querySelector(".pms161-order-details");
      const html = details(order);
      if (existing) existing.outerHTML = html;
      else {
        const clear = card.querySelector(".pms136-clear");
        if (clear) clear.insertAdjacentHTML("beforebegin", html);
        else card.insertAdjacentHTML("beforeend", html);
      }
    });
  }

  function removeCrypto(){
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      for (let i = modules.length - 1; i >= 0; i -= 1) {
        if (modules[i] && modules[i].id === CRYPTO) modules.splice(i, 1);
      }
    }
    document.querySelectorAll('[data-page="' + CRYPTO + '"]').forEach(function(node){ node.remove(); });
    document.querySelectorAll(".nav-group").forEach(function(group){
      if (!group.querySelector(".nav-button:not([style*='display: none'])")) {
        const visible = Array.from(group.querySelectorAll(".nav-button")).some(function(btn){
          return getComputedStyle(btn).display !== "none";
        });
        if (!visible) group.remove();
      }
    });
    if (window.current && current.page === CRYPTO) {
      current.page = "dashboard";
      setTimeout(function(){ if (typeof render === "function") render(); }, 0);
    }
  }

  function afterRender(){
    st();
    injectCss();
    removeCrypto();
    decorateOperationalOrders();
  }

  function init(){
    st();
    injectCss();
    removeCrypto();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !render.__pms161Wrapped) {
      render = function(){
        if (window.current && current.page === CRYPTO) current.page = "dashboard";
        removeCrypto();
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 30);
        setTimeout(afterRender, 180);
        return result;
      };
      render.__pms161Wrapped = true;
    }
    const baseNav = typeof renderNav === "function" ? renderNav : null;
    if (baseNav && !renderNav.__pms161Wrapped) {
      renderNav = function(){
        removeCrypto();
        const result = baseNav.apply(this, arguments);
        setTimeout(removeCrypto, 20);
        return result;
      };
      renderNav.__pms161Wrapped = true;
    }
    [80, 300, 900, 1800].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(afterRender, 1800);
    try { if (typeof renderNav === "function") renderNav(); if (typeof render === "function") render(); } catch(error) { console.warn(VERSION, error); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.pmsV161 = {version:VERSION};
  console.info(VERSION + " loaded");
})();
