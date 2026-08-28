(function(){
  "use strict";
  const VERSION = "PMS-V107-CONTRACT-DELETE";

  function arr(v){ return Array.isArray(v) ? v : []; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }

  function ensure(){
    window.state = window.state || {};
    state.contracts = arr(state.contracts);
    state.deletedContractsLog = arr(state.deletedContractsLog);
  }
  function css(){
    if (document.getElementById("pms-v107-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v107-style";
    s.textContent = ".pms107-delete{background:#fee2e2!important;border-color:#fecaca!important;color:#991b1b!important}.pms107-delete:hover{background:#fecaca!important;color:#7f1d1d!important}";
    document.head.appendChild(s);
  }
  function deleteContract(id){
    ensure();
    const idx = state.contracts.findIndex(c => String(c.id) === String(id));
    if (idx < 0) return alert("Contratto non trovato.");
    const item = state.contracts[idx];
    const label = item.counterparty || item.type || item.id;
    if (!confirm("Eliminare definitivamente il contratto " + item.id + " - " + label + "?")) return;
    state.deletedContractsLog.unshift({
      id:"DEL-CTR-" + new Date().toISOString(),
      contractId:item.id,
      counterparty:item.counterparty || "",
      type:item.type || "",
      deletedAt:new Date().toISOString(),
      deletedBy:(window.current && current.user) || "utente"
    });
    state.contracts.splice(idx,1);
    saveState();
    if (typeof render === "function") render();
  }
  function decorate(){
    ensure(); css();
    if (!window.current || current.page !== "contracts") return;
    document.querySelectorAll("[data-ctr-print]").forEach(printBtn => {
      const id = printBtn.dataset.ctrPrint;
      if (!id) return;
      const cell = printBtn.closest("td") || printBtn.parentElement;
      if (!cell || Array.from(cell.querySelectorAll("[data-ctr-delete]")).some(b => b.dataset.ctrDelete === id)) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inline-button pms107-delete";
      btn.dataset.ctrDelete = id;
      btn.textContent = "Elimina";
      btn.onclick = () => deleteContract(id);
      printBtn.insertAdjacentElement("afterend",btn);
    });
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms107RenderWrapped) {
    window.__pms107RenderWrapped = true;
    render = function(){
      const r = baseRender.apply(this,arguments);
      setTimeout(decorate,40);
      return r;
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms107BindWrapped) {
    window.__pms107BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); setTimeout(decorate,30); return r; };
  }
  ensure(); css(); setTimeout(decorate,120);
  window.pmsV107ContractDelete = {version:VERSION,deleteContract};
})();
