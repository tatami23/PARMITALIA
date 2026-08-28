(function(){
  "use strict";
  const VERSION = "PMS-V112-LEFT-MENU-ORDER-ACTIONS";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function orderCode(o){ return o && (o.code || o.id) || "-"; }
  function findOrder(id){ return arr(state && state.orders).find(o => String(o.id) === String(id) || String(o.code) === String(id)); }
  function closedOrder(o){ return /chius|confermat|complet|accett|fatturat/i.test(String(o && o.status || "")); }

  function css(){
    if (document.getElementById("pms-v112-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v112-style";
    s.textContent = `
      body.pms112-left-menu .app{
        display:flex!important;
        padding:0!important;
        min-height:100vh;
      }
      body.pms112-left-menu .sidebar{
        position:sticky!important;
        left:0!important;
        right:auto!important;
        top:0!important;
        bottom:auto!important;
        width:304px!important;
        height:100vh!important;
        min-height:100vh!important;
        z-index:20!important;
        display:flex!important;
        flex-direction:column!important;
        gap:12px!important;
        padding:18px!important;
        border-radius:0!important;
        overflow:hidden!important;
        border-left:0!important;
        border-right:1px solid rgba(125,211,252,.34)!important;
        background:
          radial-gradient(circle at 50% 116px, rgba(34,211,238,.20), transparent 150px),
          linear-gradient(180deg,#061a2d 0%,#0b1220 58%,#08111f 100%)!important;
        box-shadow:18px 0 48px rgba(15,23,42,.18), inset 0 0 44px rgba(14,165,233,.10)!important;
        transform:none!important;
      }
      body.pms112-left-menu .sidebar-brand{
        display:flex!important;
        position:relative;
        z-index:3;
      }
      body.pms112-left-menu .pms109-hub{
        display:none!important;
      }
      body.pms112-left-menu .pms106-hub{
        display:none!important;
      }
      body.pms112-left-menu #nav{
        display:flex!important;
        flex-direction:column!important;
        gap:7px!important;
        overflow-y:auto!important;
        overflow-x:hidden!important;
        max-height:none!important;
        padding:2px 4px 8px 0!important;
      }
      body.pms112-left-menu .nav-button{
        width:100%!important;
        min-height:42px!important;
        max-height:none!important;
        border-radius:8px!important;
        display:flex!important;
        align-items:center!important;
        gap:9px!important;
        padding:10px 11px!important;
        line-height:1.15!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        font-size:14px!important;
        text-align:left!important;
      }
      body.pms112-left-menu .nav-button::before{
        min-width:34px!important;
        height:24px!important;
      }
      body.pms112-left-menu .sidebar-footer{
        display:grid!important;
        margin-top:auto!important;
        padding-top:14px!important;
        border-top:1px solid rgba(255,255,255,.15)!important;
      }
      body.pms112-left-menu .main{
        min-width:0!important;
        width:auto!important;
        flex:1!important;
      }
      body.pms112-left-menu .main::before{
        inset:0!important;
      }
      body.pms112-left-menu .main::after{
        display:none!important;
      }
      .pms112-order-actions{
        display:flex;
        flex-wrap:wrap;
        gap:6px;
        min-width:230px;
      }
      .pms112-order-actions button{
        width:auto!important;
        margin:0!important;
      }
      .pms112-order-delete{
        background:#fee2e2!important;
        border-color:#fecaca!important;
        color:#991b1b!important;
      }
      .pms112-order-delete:hover{
        background:#fecaca!important;
        color:#7f1d1d!important;
      }
      @media(max-width:780px){
        body.pms112-left-menu .app{display:block!important}
        body.pms112-left-menu .sidebar{
          position:relative!important;
          width:100%!important;
          height:auto!important;
          min-height:0!important;
        }
      }
      @media print{
        body.pms112-left-menu .sidebar{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }
  function forceLeftMenu(){
    css();
    document.body.classList.remove("pms108-bottom-menu","pms109-right-menu");
    document.body.classList.add("pms112-left-menu");
  }
  function printOrder(id,type){
    if (window.pmsV110OrderPrintButtons && typeof window.pmsV110OrderPrintButtons.printOrder === "function") {
      window.pmsV110OrderPrintButtons.printOrder(id,type);
      return;
    }
    const old = document.querySelector('[data-print-order="' + esc(id) + '"]');
    if (old) old.click();
  }
  function deleteOrder(id){
    if (window.pmsV111OrderDelete && typeof window.pmsV111OrderDelete.deleteOrder === "function") {
      window.pmsV111OrderDelete.deleteOrder(id);
      return;
    }
    const idx = arr(state.orders).findIndex(o => String(o.id) === String(id) || String(o.code) === String(id));
    if (idx < 0) return alert("Ordine non trovato.");
    const o = state.orders[idx];
    if (!confirm("Eliminare definitivamente l'ordine " + orderCode(o) + "?")) return;
    state.orders.splice(idx,1);
    saveState();
    if (typeof render === "function") render();
  }
  function closeOrder(id){
    const o = findOrder(id);
    if (!o) return alert("Ordine non trovato.");
    o.status = "Chiuso";
    o.closedAt = new Date().toISOString();
    saveState();
    if (typeof render === "function") render();
  }
  function orderToInvoice(id){
    if (window.pmsV102SimplifyModules && typeof window.pmsV102SimplifyModules.orderToInvoice === "function") {
      window.pmsV102SimplifyModules.orderToInvoice(id);
      return;
    }
    alert("Passaggio a fatturazione non disponibile in questa vista.");
  }
  function actionHtml(id,o){
    const extra = closedOrder(o)
      ? '<button class="inline-button" data-pms112-invoice="' + esc(id) + '">Passa fatturazione</button>'
      : '<button class="inline-button" data-pms112-close="' + esc(id) + '">Chiudi</button>';
    return '<div class="pms112-order-actions" data-pms112-order-actions="' + esc(id) + '">' +
      '<button class="inline-button" data-pms112-edit="' + esc(id) + '">Modifica</button>' +
      '<button class="inline-button" data-pms112-print-internal="' + esc(id) + '">Stampa interna</button>' +
      '<button class="inline-button" data-pms112-print-customer="' + esc(id) + '">Stampa cliente</button>' +
      '<button class="inline-button" data-pms112-print-supplier="' + esc(id) + '">Stampa fornitore</button>' +
      '<button class="inline-button pms112-order-delete" data-pms112-delete="' + esc(id) + '">Elimina</button>' +
      extra +
      '</div>';
  }
  function decorateOrders(){
    if (!window.current || current.page !== "orders") return;
    arr(state.orders).forEach(o => {
      const id = String(o.id || o.code || "");
      if (!id) return;
      const candidates = Array.from(document.querySelectorAll("[data-pms102-order-edit], [data-edit='orders'], [data-print-order], [data-pms110-print-internal], [data-pms111-delete-order]"));
      const anchor = candidates.find(el =>
        el.dataset.pms102OrderEdit === id ||
        (el.dataset.edit === "orders" && el.dataset.id === id) ||
        el.dataset.printOrder === id ||
        el.dataset.pms110PrintInternal === id ||
        el.dataset.pms111DeleteOrder === id
      );
      if (!anchor) return;
      const cell = anchor.closest("td") || anchor.parentElement;
      if (!cell) return;
      cell.innerHTML = actionHtml(id,o);
    });
    document.querySelectorAll("[data-pms112-edit]").forEach(b => b.onclick = () => {
      if (typeof openModal === "function") openModal("orders",b.dataset.pms112Edit);
    });
    document.querySelectorAll("[data-pms112-print-internal]").forEach(b => b.onclick = () => printOrder(b.dataset.pms112PrintInternal,"internal"));
    document.querySelectorAll("[data-pms112-print-customer]").forEach(b => b.onclick = () => printOrder(b.dataset.pms112PrintCustomer,"customer"));
    document.querySelectorAll("[data-pms112-print-supplier]").forEach(b => b.onclick = () => printOrder(b.dataset.pms112PrintSupplier,"supplier"));
    document.querySelectorAll("[data-pms112-delete]").forEach(b => b.onclick = () => deleteOrder(b.dataset.pms112Delete));
    document.querySelectorAll("[data-pms112-close]").forEach(b => b.onclick = () => closeOrder(b.dataset.pms112Close));
    document.querySelectorAll("[data-pms112-invoice]").forEach(b => b.onclick = () => orderToInvoice(b.dataset.pms112Invoice));
  }
  function activate(){
    forceLeftMenu();
    decorateOrders();
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !window.__pms112NavWrapped) {
    window.__pms112NavWrapped = true;
    renderNav = function(){ const r = baseRenderNav.apply(this,arguments); setTimeout(activate,80); return r; };
  }
  const baseSetPage = typeof setPage === "function" ? setPage : null;
  if (baseSetPage && !window.__pms112SetPageWrapped) {
    window.__pms112SetPageWrapped = true;
    setPage = function(){ const r = baseSetPage.apply(this,arguments); setTimeout(activate,90); return r; };
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms112RenderWrapped) {
    window.__pms112RenderWrapped = true;
    render = function(){ const r = baseRender.apply(this,arguments); setTimeout(activate,100); return r; };
  }
  css();
  setTimeout(activate,180);
  setTimeout(activate,360);
  window.pmsV112LeftMenuOrderActions = {version:VERSION,activate};
})();
