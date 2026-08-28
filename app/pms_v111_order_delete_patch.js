(function(){
  "use strict";
  const VERSION = "PMS-V111-ORDER-DELETE";

  function arr(v){ return Array.isArray(v) ? v : []; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function orderCode(o){ return o && (o.code || o.id) || "-"; }

  function ensure(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.deletedOrdersLog = arr(state.deletedOrdersLog);
  }
  function css(){
    if (document.getElementById("pms-v111-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v111-style";
    s.textContent = ".pms111-delete{background:#fee2e2!important;border-color:#fecaca!important;color:#991b1b!important}.pms111-delete:hover{background:#fecaca!important;color:#7f1d1d!important}";
    document.head.appendChild(s);
  }
  function deleteOrder(id){
    ensure();
    const idx = state.orders.findIndex(o => String(o.id) === String(id) || String(o.code) === String(id));
    if (idx < 0) return alert("Ordine non trovato.");
    const item = state.orders[idx];
    const label = [orderCode(item), item.client || "", item.product || ""].filter(Boolean).join(" - ");
    if (!confirm("Eliminare definitivamente l'ordine " + label + "?")) return;
    state.deletedOrdersLog.unshift({
      id:"DEL-ORD-" + new Date().toISOString(),
      orderId:item.id || "",
      orderCode:orderCode(item),
      client:item.client || "",
      supplier:item.supplier || "",
      product:item.product || "",
      deletedAt:new Date().toISOString(),
      deletedBy:(window.current && current.user) || "utente"
    });
    state.orders.splice(idx,1);
    saveState();
    if (typeof render === "function") render();
  }
  function addDeleteButton(cell,id){
    if (!cell || !id) return;
    if (Array.from(cell.querySelectorAll("[data-pms111-delete-order]")).some(b => b.dataset.pms111DeleteOrder === id)) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "inline-button pms111-delete";
    btn.dataset.pms111DeleteOrder = id;
    btn.textContent = "Elimina";
    btn.onclick = () => deleteOrder(id);
    cell.appendChild(btn);
  }
  function decorate(){
    ensure(); css();
    if (!window.current || current.page !== "orders") return;
    document.querySelectorAll("[data-pms102-order-edit], [data-edit='orders']").forEach(btn => {
      const id = btn.dataset.pms102OrderEdit || btn.dataset.id;
      addDeleteButton(btn.closest("td") || btn.parentElement,id);
    });
    document.querySelectorAll("[data-print-order], [data-pms110-print-internal], [data-pms110-print-customer], [data-pms110-print-supplier]").forEach(btn => {
      const id = btn.dataset.printOrder || btn.dataset.pms110PrintInternal || btn.dataset.pms110PrintCustomer || btn.dataset.pms110PrintSupplier;
      addDeleteButton(btn.closest("td") || btn.parentElement,id);
    });
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms111RenderWrapped) {
    window.__pms111RenderWrapped = true;
    render = function(){ const r = baseRender.apply(this,arguments); setTimeout(decorate,60); return r; };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms111BindWrapped) {
    window.__pms111BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); setTimeout(decorate,50); return r; };
  }
  ensure(); css(); setTimeout(decorate,140);
  window.pmsV111OrderDelete = {version:VERSION,deleteOrder};
})();
