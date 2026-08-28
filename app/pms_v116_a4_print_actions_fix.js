(function(){
  "use strict";
  const VERSION = "PMS-V116-A4-PRINT-ACTIONS-FIX";

  function arr(v){ return Array.isArray(v) ? v : []; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function pageLabel(){
    const id = window.current && current.page || "";
    const mod = typeof modules !== "undefined" ? arr(modules).find(m => m.id === id) : null;
    return (mod && mod.label) || id || "Modulo";
  }
  function companyHeader(title, code, sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, sub || "");
    const s = window.state && state.settings || {};
    const logo = s.logoUrl ? '<img class="print-logo" src="' + esc(s.logoUrl) + '" alt="Logo">' : "";
    return '<div class="print-header"><div>' + logo + '<h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(sub || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code || "PMS");
    if (typeof renderQrLite === "function") return renderQrLite(code || "PMS");
    return '<strong>' + esc(code || "") + '</strong>';
  }

  function css(){
    if (document.getElementById("pms-v116-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v116-style";
    s.textContent = [
      ".pms116-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
      ".pms116-actions button{width:auto!important;margin:0!important}",
      ".pms116-delete{background:#fee2e2!important;border-color:#fecaca!important;color:#991b1b!important}",
      ".pms116-delete:hover{background:#fecaca!important;color:#7f1d1d!important}",
      ".pms116-print-sheet{box-sizing:border-box;background:#fff;color:#0f172a}",
      "@media screen{#print-root{position:fixed!important;inset:0!important;z-index:99999!important;background:#e5edf6!important;overflow:auto!important;padding:12mm 0!important}#print-root .print-document{width:190mm!important;min-height:267mm!important;margin:0 auto 12mm!important;background:#fff!important;box-shadow:0 18px 50px rgba(15,23,42,.22)!important}}",
      "@page{size:A4 portrait;margin:10mm}",
      "@media print{html,body{width:210mm!important;min-height:297mm!important;background:#fff!important}body *{visibility:hidden!important}#print-root,#print-root *{visibility:visible!important}#print-root{position:absolute!important;left:0!important;top:0!important;width:210mm!important;margin:0!important;padding:0!important;background:#fff!important;overflow:visible!important}#print-root .print-document{width:190mm!important;max-width:190mm!important;min-height:auto!important;height:auto!important;margin:0 auto!important;padding:0!important;box-sizing:border-box!important;color:#0f172a!important;font-family:Arial,Helvetica,sans-serif!important;font-size:11pt!important;line-height:1.38!important;transform:none!important;zoom:1!important;break-after:avoid!important;page-break-after:avoid!important;overflow:visible!important}#print-root .print-header{display:grid!important;grid-template-columns:1fr auto!important;gap:8mm!important;align-items:start!important;margin:0 0 6mm!important;padding:0 0 4mm!important;border-bottom:1.5px solid #1f4e78!important;break-inside:avoid!important;page-break-inside:avoid!important}#print-root .print-header h1{font-size:21pt!important;line-height:1.08!important;margin:0 0 2mm!important;letter-spacing:0!important}#print-root .print-header strong{font-size:11pt!important}#print-root .print-meta{font-size:10.5pt!important;text-align:right!important;white-space:nowrap!important}#print-root .print-logo{max-width:36mm!important;max-height:20mm!important;object-fit:contain!important}#print-root .print-table{width:100%!important;table-layout:fixed!important;border-collapse:collapse!important;margin:5mm 0!important;page-break-inside:auto!important;break-inside:auto!important}#print-root .print-table th,#print-root .print-table td{font-size:10pt!important;line-height:1.28!important;padding:2.8mm!important;border:1px solid #c7d2e2!important;vertical-align:top!important;overflow-wrap:anywhere!important;word-break:break-word!important}#print-root .print-table th{background:#eef4fb!important;color:#0f2f4a!important;font-weight:800!important}#print-root pre,#print-root .pms103-body,#print-root .pms114-body,#print-root .pms105-print-body,#print-root .pms104-print-box{font-size:11pt!important;line-height:1.45!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;margin:5mm 0!important}#print-root .pms103-print,#print-root .pms114-print,#print-root .pms110-print,#print-root .pms104-print,#print-root .pms105-print,#print-root .pms101-print{font-size:11pt!important;line-height:1.38!important;min-height:auto!important;height:auto!important;break-after:avoid!important;page-break-after:avoid!important}#print-root .barcode-svg{max-width:82mm!important;height:auto!important;padding:2mm!important;margin-top:4mm!important}#print-root .print-footer{position:static!important;margin-top:6mm!important;padding-top:3mm!important;border-top:1px solid #cbd5e1!important;font-size:9.5pt!important;color:#475569!important;break-inside:avoid!important;page-break-inside:avoid!important}.pms101-no-print,.pms104-no-print,.pms105-no-print,.no-print{display:none!important}}"
    ].join("");
    document.head.appendChild(s);
  }

  function cleanPrintHtml(html){
    let out = String(html == null ? "" : html);
    out = out.replace(/<div class="pms94-print-note">\s*Documento per il cliente:[\s\S]*?<\/div>/gi,"");
    out = out.replace(/<div class="pms94-print-note">\s*Documento per il fornitore:[\s\S]*?<\/div>/gi,"");
    out = out.replace(/class="print-document(?![^"]*pms116-print-sheet)/g,'class="print-document pms116-print-sheet');
    return out;
  }

  function wrapOpenPrint(){
    if (window.__pms116OpenPrintWrapped || typeof openPrint !== "function") return;
    const base = openPrint;
    window.__pms116OpenPrintWrapped = true;
    openPrint = function(innerHtml){
      return base.call(this, cleanPrintHtml(innerHtml));
    };
  }

  const moduleKeys = {
    contracts:["contracts"],
    trattativeInCorso:["negotiations","trattativeInCorso","intermediations"],
    orders:["orders"],
    offers:["offers"],
    products:["products"],
    contacts:["contacts","customers","suppliers"],
    tenders:["tenders"],
    officialCommunications:["officialDocuments","officialCommunications"],
    documents:["documents"],
    payments:["payments"],
    banks:["banks"],
    accountant:["accountantDocuments","accountantFiles"],
    legalClaims:["legalClaims"],
    supplierPriceConfirmations:["supplierPriceConfirmations"],
    commercialBrokerage:["brokerageDeals","commercialBrokerage"],
    driverRecruiting:["driverRecruitingDrivers","driverRecruitingContracts","driverRecruitingPractices"],
    humanResources:["employees","hrEmployees","leaves","payments"]
  };
  function candidateKeys(){
    const page = window.current && current.page || "";
    const keys = (moduleKeys[page] || [page]).slice();
    if (page && !keys.includes(page)) keys.push(page);
    return keys;
  }
  function idOfRow(row){
    const code = row.querySelector(".code-block,.pms85-code");
    const txt = (code && code.textContent || row.cells && row.cells[0] && row.cells[0].textContent || "").trim();
    return txt.split(/\s+/)[0] || "";
  }
  function findRecord(id){
    if (!window.state || !id) return null;
    for (const key of candidateKeys()){
      const list = arr(state[key]);
      const idx = list.findIndex(x => [x.id,x.code,x.protocol,x.number,x.practiceCode,x.orderCode].some(v => String(v || "") === String(id)));
      if (idx >= 0) return {key,list,idx,item:list[idx]};
    }
    return null;
  }
  function printRow(row){
    const cells = Array.from(row.cells || []);
    const table = row.closest("table");
    const heads = table ? Array.from(table.querySelectorAll("thead th")).map(th => th.textContent.trim()) : [];
    const useful = cells.slice(0, Math.max(1, cells.length - 1));
    const code = idOfRow(row) || "PMS-" + today();
    const rows = useful.map((cell,i) => '<tr><th>' + esc(heads[i] || ("Campo " + (i+1))) + '</th><td>' + esc(cell.innerText || cell.textContent || "-") + '</td></tr>').join("");
    const html = '<div class="print-document pms116-print-sheet">' + companyHeader("SCHEDA " + pageLabel().toUpperCase(), code, "Documento riservato Parmitalia") + '<table class="print-table"><tbody>' + rows + '</tbody></table><div style="margin-top:5mm">' + barcode(code) + '</div><div class="print-footer">Documento riservato Parmitalia - ' + esc(pageLabel()) + ' - ' + esc(code) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html); else window.print();
  }
  function deleteRow(row){
    const id = idOfRow(row);
    const found = findRecord(id);
    if (!found) return alert("Eliminazione non disponibile per questo record: apri Modifica o usa il comando dedicato del modulo.");
    const name = found.item.name || found.item.title || found.item.counterparty || found.item.client || found.item.supplier || found.item.product || id;
    if (!confirm("Eliminare definitivamente " + id + " - " + name + "?")) return;
    found.list.splice(found.idx,1);
    state.deletedRecordsLog = arr(state.deletedRecordsLog);
    state.deletedRecordsLog.unshift({id:"DEL-" + Date.now(), module:found.key, recordId:id, label:name, deletedAt:new Date().toISOString(), deletedBy:(window.current && current.user) || "utente"});
    saveState();
    if (typeof render === "function") render();
  }
  function ensureActionCell(row){
    const cells = row.cells || [];
    if (!cells.length) return null;
    let cell = cells[cells.length - 1];
    const hasButton = cell.querySelector("button");
    if (!hasButton && cells.length > 1) {
      cell = row.insertCell(-1);
      const th = row.closest("table") && row.closest("table").querySelector("thead tr");
      if (th && !Array.from(th.cells).some(x => /azioni/i.test(x.textContent || ""))) {
        const h = document.createElement("th");
        h.textContent = "Azioni";
        th.appendChild(h);
      }
    }
    return cell;
  }
  function addGenericActions(){
    const content = document.getElementById("content");
    if (!content || !window.current) return;
    content.querySelectorAll("tbody tr").forEach(row => {
      if (!row.cells || row.cells.length < 2 || row.dataset.pms116Actions === "1") return;
      const cell = ensureActionCell(row);
      if (!cell) return;
      let wrap = cell.querySelector(".pms116-actions");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "pms116-actions";
        cell.appendChild(wrap);
      }
      const cellText = cell.textContent || "";
      if (!/stampa|pdf|print/i.test(cellText)) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "inline-button";
        b.textContent = "Stampa";
        b.addEventListener("click", () => printRow(row));
        wrap.appendChild(b);
      }
      if (!/elimina|delete/i.test(cellText) && findRecord(idOfRow(row))) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "inline-button pms116-delete";
        b.textContent = "Elimina";
        b.addEventListener("click", () => deleteRow(row));
        wrap.appendChild(b);
      }
      row.dataset.pms116Actions = "1";
    });
  }
  function strengthenContracts(){
    if (!window.current || current.page !== "contracts") return;
    document.querySelectorAll("[data-ctr-print], [data-pms114-contract-print]").forEach(btn => {
      const id = btn.dataset.ctrPrint || btn.dataset.pms114ContractPrint;
      const cell = btn.closest("td") || btn.parentElement;
      if (!id || !cell || cell.querySelector('[data-pms116-contract-delete="' + id + '"]')) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "inline-button pms116-delete";
      b.dataset.pms116ContractDelete = id;
      b.textContent = "Elimina";
      b.addEventListener("click", function(){
        const found = {key:"contracts",list:arr(state.contracts)};
        found.idx = found.list.findIndex(x => String(x.id) === String(id));
        if (found.idx < 0) return alert("Contratto non trovato.");
        const item = found.list[found.idx];
        if (!confirm("Eliminare definitivamente il contratto " + id + " - " + (item.counterparty || item.type || "") + "?")) return;
        found.list.splice(found.idx,1);
        state.deletedContractsLog = arr(state.deletedContractsLog);
        state.deletedContractsLog.unshift({id:"DEL-CTR-" + Date.now(), contractId:id, deletedAt:new Date().toISOString(), deletedBy:(window.current && current.user) || "utente"});
        saveState();
        if (typeof render === "function") render();
      });
      const wrap = cell.querySelector(".pms114-actions") || cell.querySelector(".pms116-actions") || cell;
      wrap.appendChild(b);
    });
  }
  function decorate(){
    css();
    wrapOpenPrint();
    addGenericActions();
    strengthenContracts();
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms116RenderWrapped) {
    window.__pms116RenderWrapped = true;
    render = function(){
      const r = baseRender.apply(this,arguments);
      setTimeout(decorate,120);
      return r;
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms116BindWrapped) {
    window.__pms116BindWrapped = true;
    bindPageActions = function(){
      const r = baseBind.apply(this,arguments);
      setTimeout(decorate,80);
      return r;
    };
  }
  css();
  wrapOpenPrint();
  setTimeout(decorate,220);
  window.pmsV116A4PrintActionsFix = {version:VERSION,decorate:decorate,cleanPrintHtml:cleanPrintHtml};
})();
