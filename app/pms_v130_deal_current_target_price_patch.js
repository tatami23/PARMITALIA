(function(){
  "use strict";
  const VERSION = "PMS-V130-DEAL-CURRENT-TARGET-PRICE";
  const DEALS_PAGE = "trattativeInCorso";
  const DATA_MODULE = "intermediations";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function money(v,currency){ return (currency || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }

  function ensureFields(){
    if (typeof schemas === "undefined") return;
    if (!schemas[DATA_MODULE]) schemas[DATA_MODULE] = {title:"Intermediazioni", fields:[]};
    const fields = arr(schemas[DATA_MODULE].fields);
    function upsert(key, def, afterKey){
      let field = fields.find(item => item.key === key);
      if (field) Object.assign(field, def, {key});
      else {
        field = Object.assign({key}, def);
        const idx = fields.findIndex(item => item.key === afterKey);
        fields.splice(idx >= 0 ? idx + 1 : fields.length, 0, field);
      }
    }
    upsert("currentPrice", {label:"Prezzo attuale", type:"number", step:"0.01"}, "value");
    upsert("targetPrice", {label:"Obiettivo di prezzo / Prezzo desiderato", type:"number", step:"0.01"}, "currentPrice");
    schemas[DATA_MODULE].fields = fields;
  }

  function dealById(id){
    const list = arr(window.state && state[DATA_MODULE]);
    return list.find(item => String(item.id || "") === String(id || ""));
  }

  function priceSummary(item){
    if (!item) return "";
    const hasCurrent = String(item.currentPrice ?? "").trim() !== "" && num(item.currentPrice) !== 0;
    const hasTarget = String(item.targetPrice ?? "").trim() !== "" && num(item.targetPrice) !== 0;
    if (!hasCurrent && !hasTarget) return "";
    const parts = [];
    if (hasCurrent) parts.push("Prezzo attuale: " + money(item.currentPrice, item.currency));
    if (hasTarget) parts.push("Obiettivo: " + money(item.targetPrice, item.currency));
    return parts.join(" | ");
  }

  function decorateDealsTable(){
    ensureFields();
    if (!window.current || current.page !== DEALS_PAGE) return;
    document.querySelectorAll(".pms85-code").forEach(codeEl => {
      const id = String(codeEl.textContent || "").trim();
      const item = dealById(id);
      const summary = priceSummary(item);
      const row = codeEl.closest("tr");
      if (!row || row.dataset.pms130Prices === "1") return;
      row.dataset.pms130Prices = "1";
      const productCell = row.children && row.children[3];
      if (productCell && summary) productCell.insertAdjacentHTML("beforeend", '<br><small class="pms130-price-line">' + esc(summary) + '</small>');
    });
  }

  function css(){
    if (document.getElementById("pms-v130-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v130-style";
    style.textContent = `
      .pms130-price-line{display:inline-block;margin-top:4px;color:#0f766e;font-weight:900;line-height:1.35}
      #pms85-inter-modal input[name="currentPrice"],#pms85-inter-modal input[name="targetPrice"]{border-color:#94a3b8}
    `;
    document.head.appendChild(style);
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms130Wrapped) {
    render = function(){
      ensureFields(); css();
      const result = baseRender.apply(this, arguments);
      setTimeout(decorateDealsTable, 20);
      setTimeout(decorateDealsTable, 120);
      return result;
    };
    render.__pms130Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms130Wrapped) {
    bindPageActions = function(){
      ensureFields(); css();
      const result = baseBind.apply(this, arguments);
      setTimeout(decorateDealsTable, 20);
      return result;
    };
    bindPageActions.__pms130Wrapped = true;
  }

  ensureFields();
  css();
  setTimeout(decorateDealsTable, 100);
  window.pmsV130DealCurrentTargetPrice = {version:VERSION};
})();
