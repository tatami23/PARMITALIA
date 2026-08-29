(function(){
  "use strict";

  const VERSION = "PMS-V172-ACCESS-HISTORY-PRINT-IMPORT-FIX";
  const DEALS_PAGE = "trattativeInCorso";
  const FOREIGN_PAGE = "foreignEmployees";
  const TEMPLATE_FILE = "modulo_dipendente_estero.csv";

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]; }); }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function num(value){ const parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : 0; }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function money(value, currency){ return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2}); }
  function st(){
    window.state = window.state || {};
    state.negotiations = arr(state.negotiations);
    state.negotiationEvents = arr(state.negotiationEvents);
    state.contracts = arr(state.contracts);
    state.foreignEmployees = arr(state.foreignEmployees);
    state.foreignRecruiting = arr(state.foreignRecruiting);
    if (state.foreignRecruiting.length && !state.foreignEmployees.length) state.foreignEmployees = state.foreignRecruiting.slice();
    return state;
  }
  function saveLocal(){
    try {
      if (typeof window.save === "function") return window.save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function nextCode(prefix, list){
    const year = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    const max = arr(list).reduce(function(result, item){
      return [item && item.id, item && item.code, item && item.protocol].reduce(function(inner, value){
        const match = String(value || "").match(re);
        return match ? Math.max(inner, Number(match[1])) : inner;
      }, result);
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function itemId(item){ return String(item && (item.id || item.code || item.protocol || item.dealCode || item.orderCode) || ""); }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code);
    if (typeof renderQrLite === "function") return renderQrLite(code);
    return '<strong>' + esc(code || "") + '</strong>';
  }
  function header(title, code, subtitle){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, subtitle || "");
    const legal = st().settings && st().settings.legalName || "PARMITALIA DISTRIBUTION SRL";
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(legal) + '</strong><br><span>' + esc(subtitle || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function isClosedDeal(item){ return /chius|conclus|positiv|negativ|sospes|archiv/i.test(String(item && (item.status || item.practiceStatus || item.stage) || "")); }
  function dealEvents(id){ return arr(st().negotiationEvents).filter(function(event){ return String(event.dealId || "") === String(id || ""); }).sort(function(a,b){ return String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")); }); }

  function injectCss(){
    let style = document.getElementById("pms-v172-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v172-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body.pms165-fixed-top-menu .sidebar{align-items:center!important;min-height:74px!important}
      body.pms165-fixed-top-menu .sidebar-brand{min-width:210px!important;max-width:260px!important;align-self:center!important}
      body.pms165-fixed-top-menu .sidebar-brand strong{font-size:15px!important;line-height:1.14!important;white-space:normal!important;max-width:190px!important}
      body.pms165-fixed-top-menu .sidebar-brand span{display:block!important;font-size:11px!important;line-height:1.18!important;white-space:normal!important;max-width:190px!important;color:#52606d!important}
      body.pms165-fixed-top-menu .sidebar-footer span,
      body.pms165-fixed-top-menu .sidebar-footer strong,
      body.pms165-fixed-top-menu .sidebar-footer small,
      body.pms165-fixed-top-menu #current-user{display:none!important;visibility:hidden!important;width:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}
      .pms172-page{display:grid;gap:14px;color:#172033}
      .pms172-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;background:#f8fafc;border:1px solid #d7dee8;border-radius:8px;padding:15px}
      .pms172-hero h3{margin:2px 0 6px;font-size:21px;line-height:1.18;color:#0f172a}
      .pms172-hero p{margin:0;color:#475569;line-height:1.4}
      .pms172-actions,.pms172-row-actions{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
      .pms172-actions button,.pms172-row-actions button,.pms172-actions a{width:auto!important;margin:0!important}
      .pms172-card{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:13px;min-width:0}
      .pms172-card h3,.pms172-card h4{margin:0 0 9px;color:#0f172a}
      .pms172-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
      .pms172-kpi{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:11px}
      .pms172-kpi span{display:block;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase}
      .pms172-kpi strong{display:block;color:#0f172a;font-size:20px;margin-top:4px}
      .pms172-table{width:100%;overflow:auto;border:1px solid #d7dee8;border-radius:8px;background:#fff}
      .pms172-table table{width:100%;min-width:980px;border-collapse:collapse;margin:0}
      .pms172-table th,.pms172-table td{padding:9px 10px;border-bottom:1px solid #e5edf5;vertical-align:top}
      .pms172-table th{background:#eef2f7;text-align:left;font-size:12px;color:#253447}
      .pms172-badge{display:inline-flex;border-radius:999px;padding:4px 8px;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-size:12px;font-weight:900}
      .pms172-muted{color:#64748b;font-size:12px;line-height:1.35}
      .pms172-modal-backdrop{position:fixed;inset:0;z-index:28000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}
      .pms172-modal{width:min(980px,96vw);max-height:90vh;overflow:auto;background:#fff;border-radius:8px;border:1px solid #d7dee8;box-shadow:0 24px 74px rgba(15,23,42,.34);padding:15px}
      .pms172-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}
      .pms172-modal-head h3{margin:0;color:#0f172a}
      .pms172-body{white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:11px;line-height:1.42;color:#172033}
      .pms172-import{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center}
      .pms172-import input{min-width:0}
      @media(max-width:820px){.pms172-hero,.pms172-import{display:grid;grid-template-columns:1fr}.pms172-table table{min-width:860px}}
      @media print{
        @page{size:A4;margin:7mm}
        html,body{height:auto!important;min-height:0!important;overflow:visible!important;background:#fff!important}
        body *{visibility:hidden!important}
        #print-root,#print-root *{visibility:visible!important}
        #print-root{position:absolute!important;left:0!important;top:0!important;width:100%!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;overflow:visible!important;background:#fff!important}
        #print-root .print-document,#print-root .pms128-print-sheet,#print-root .pms172-print{box-sizing:border-box!important;width:100%!important;max-width:194mm!important;min-height:0!important;height:auto!important;margin:0 auto!important;padding:0!important;background:#fff!important;color:#111827!important;font-size:8.6pt!important;line-height:1.2!important;break-after:avoid!important;page-break-after:avoid!important;overflow:visible!important}
        #print-root .print-header{margin:0 0 2.5mm!important;padding:0 0 2mm!important;border-bottom:1px solid #cbd5e1!important;display:flex!important;justify-content:space-between!important;gap:5mm!important;break-inside:avoid!important}
        #print-root .print-header h1{font-size:14pt!important;line-height:1.05!important;margin:0 0 1mm!important}
        #print-root .print-meta{font-size:8pt!important;text-align:right!important}
        #print-root .print-table{width:100%!important;margin:2mm 0!important;border-collapse:collapse!important;table-layout:fixed!important;break-inside:auto!important}
        #print-root .print-table th,#print-root .print-table td{font-size:7.7pt!important;line-height:1.16!important;padding:1.2mm!important;border:1px solid #d7dee8!important;overflow-wrap:anywhere!important;word-break:break-word!important;vertical-align:top!important}
        #print-root h2,#print-root h3{font-size:10.5pt!important;margin:2.5mm 0 1.4mm!important;break-after:avoid!important}
        #print-root p,#print-root div{overflow-wrap:anywhere!important}
        #print-root .print-footer{position:static!important;margin-top:2.5mm!important;font-size:7pt!important;color:#475569!important}
        #print-root .barcode-svg,#print-root svg{max-height:18mm!important;width:auto!important}
        #print-root img{max-width:100%!important;max-height:32mm!important;object-fit:contain!important}
        #print-root button{display:none!important}
      }
    `;
  }

  function modal(title, body){
    document.querySelectorAll(".pms172-modal-backdrop").forEach(function(node){ node.remove(); });
    const wrap = document.createElement("div");
    wrap.className = "pms172-modal-backdrop";
    wrap.innerHTML = '<div class="pms172-modal"><div class="pms172-modal-head"><h3>' + esc(title) + '</h3><button type="button" class="secondary-button" data-pms172-close>Chiudi</button></div>' + body + '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function(event){ if (event.target === wrap || event.target.closest("[data-pms172-close]")) wrap.remove(); });
    return wrap;
  }

  function dealPrintHtml(deal){
    const id = itemId(deal);
    const events = dealEvents(id).map(function(event){ return '<tr><td>' + esc(event.date || event.createdAt || "") + '</td><td>' + esc(event.type || "") + '</td><td>' + esc(event.actor || "") + '</td><td>' + esc(event.text || "") + '</td><td>' + esc(event.result || "") + '</td></tr>'; }).join("");
    return '<div class="print-document pms172-print">' + header("SCHEDA TRATTATIVA", id, "Storico e registro negoziazione") +
      '<table class="print-table"><tr><th>Cliente</th><td>' + esc(deal.client || "-") + '</td><th>Fornitore</th><td>' + esc(deal.supplier || "-") + '</td></tr><tr><th>Prodotto</th><td>' + esc(deal.product || deal.productName || "-") + '</td><th>Stato</th><td>' + esc(deal.status || "-") + '</td></tr><tr><th>Fase</th><td>' + esc(deal.stage || "-") + '</td><th>Valore</th><td>' + money(deal.value || deal.price || deal.total, deal.currency) + '</td></tr><tr><th>Responsabile</th><td>' + esc(deal.owner || deal.responsible || "-") + '</td><th>Prossima azione</th><td>' + esc(deal.nextAction || "-") + '</td></tr></table>' +
      '<h3>Riepilogo</h3><div class="pms172-body">' + esc(deal.summary || deal.notes || deal.description || "-") + '</div>' +
      '<h3>Registro eventi</h3><table class="print-table"><thead><tr><th>Data</th><th>Tipo</th><th>Operatore</th><th>Evento</th><th>Esito</th></tr></thead><tbody>' + (events || '<tr><td colspan="5">Nessun evento registrato.</td></tr>') + '</tbody></table><div>' + barcode(id) + '</div><div class="print-footer">Scheda trattativa - ' + esc(id) + '</div></div>';
  }
  function printDeal(id){
    const deal = arr(st().negotiations).find(function(item){ return itemId(item) === String(id || ""); });
    if (!deal) return alert("Trattativa non trovata.");
    if (window.pmsV103ContractsNegotiations && typeof window.pmsV103ContractsNegotiations.printDeal === "function") return window.pmsV103ContractsNegotiations.printDeal(id);
    if (typeof openPrint === "function") openPrint(dealPrintHtml(deal));
  }
  function viewDeal(id){
    const deal = arr(st().negotiations).find(function(item){ return itemId(item) === String(id || ""); });
    if (!deal) return alert("Trattativa non trovata.");
    const events = dealEvents(id).map(function(event){ return '<div class="pms172-body" style="margin-top:7px"><strong>' + esc(event.type || "Evento") + ' - ' + esc(event.date || event.createdAt || "") + '</strong><br>' + esc(event.text || "") + '<br><small>' + esc(event.actor || "") + (event.result ? " - " + esc(event.result) : "") + '</small></div>'; }).join("");
    modal("Trattativa " + id, '<div class="pms172-actions" style="margin-bottom:10px"><button class="primary-button" data-pms172-deal-edit="' + esc(id) + '">Modifica</button><button class="secondary-button" data-pms172-deal-event="' + esc(id) + '">Evento</button><button class="secondary-button" data-pms172-deal-print="' + esc(id) + '">Stampa</button></div><table class="print-table"><tr><th>Cliente</th><td>' + esc(deal.client || "-") + '</td><th>Fornitore</th><td>' + esc(deal.supplier || "-") + '</td></tr><tr><th>Prodotto</th><td>' + esc(deal.product || deal.productName || "-") + '</td><th>Stato</th><td>' + esc(deal.status || "-") + '</td></tr><tr><th>Valore</th><td>' + money(deal.value || deal.price || deal.total, deal.currency) + '</td><th>Prossima azione</th><td>' + esc(deal.nextAction || "-") + '</td></tr></table><h4>Riepilogo</h4><div class="pms172-body">' + esc(deal.summary || deal.notes || deal.description || "-") + '</div><h4>Eventi</h4>' + (events || '<div class="pms172-body">Nessun evento registrato.</div>'));
  }
  function addDealEvent(id){
    const text = prompt("Evento / nota da aggiungere alla trattativa", "");
    if (!text) return;
    st().negotiationEvents.unshift({id:nextCode("EVT", st().negotiationEvents), dealId:id, date:new Date().toISOString().slice(0,16), type:"Nota", actor:window.current && current.user || "Carlo", text:text, result:"", createdAt:new Date().toISOString()});
    saveLocal();
    if (typeof render === "function") render();
  }
  function editDeal(id){
    if (window.pmsV103ContractsNegotiations && typeof window.pmsV103ContractsNegotiations.editDeal === "function") return window.pmsV103ContractsNegotiations.editDeal(id);
    alert("Modulo modifica trattativa non disponibile.");
  }
  function dealRow(deal){
    const id = itemId(deal);
    return '<tr><td><span class="code-block">' + esc(id) + '</span></td><td><strong>' + esc(deal.client || "-") + '</strong><br><small>' + esc(deal.supplier || "") + '</small></td><td>' + esc(deal.product || deal.productName || "-") + '</td><td>' + esc(deal.stage || "-") + '</td><td><span class="pms172-badge">' + esc(deal.status || "Aperta") + '</span></td><td>' + money(deal.value || deal.price || deal.total, deal.currency) + '<br><small>Prob. ' + esc(deal.probability || 0) + '%</small></td><td>' + esc(deal.nextAction || "-") + '<br><small>' + esc(deal.nextDate || "") + '</small></td><td><div class="pms172-row-actions"><button class="inline-button" data-pms172-deal-view="' + esc(id) + '">Vedi</button><button class="inline-button" data-pms172-deal-edit="' + esc(id) + '">Modifica</button><button class="inline-button" data-pms172-deal-event="' + esc(id) + '">Evento</button><button class="inline-button" data-pms172-deal-print="' + esc(id) + '">Stampa</button></div></td></tr>';
  }
  function dealsTable(title, rows, empty){
    return '<div class="pms172-card" id="' + (title.indexOf("Storico") >= 0 ? "pms172-deal-history" : "pms172-deal-open") + '"><h3>' + esc(title) + '</h3><div class="pms172-table"><table><thead><tr><th>Protocollo</th><th>Cliente / Fornitore</th><th>Prodotto</th><th>Fase</th><th>Stato</th><th>Valore</th><th>Prossima azione</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8" class="empty">' + esc(empty) + '</td></tr>') + '</tbody></table></div></div>';
  }
  function renderDeals(){
    st(); injectCss();
    const openDeals = arr(state.negotiations).filter(function(item){ return !isClosedDeal(item); });
    const closedDeals = arr(state.negotiations).filter(isClosedDeal);
    const due = arr(state.negotiations).filter(function(item){ return item.nextDate && new Date(item.nextDate) <= new Date(Date.now() + 3 * 86400000); }).length;
    return '<div class="pms172-page"><section class="pms172-hero"><div><span>TRT</span><h3>Trattative in corso</h3><p>Le trattative aperte e lo storico delle trattative chiuse restano sempre accessibili: puoi vedere, modificare, aggiungere eventi e stampare ogni scheda.</p></div><div class="pms172-actions"><button class="primary-button" data-pms172-deal-new>Nuova trattativa</button><button class="secondary-button" data-pms172-scroll-history>Storico</button><button class="secondary-button" data-pms172-print-history>Stampa storico</button></div></section><div class="pms172-kpis"><div class="pms172-kpi"><span>Aperte</span><strong>' + openDeals.length + '</strong></div><div class="pms172-kpi"><span>Storico chiuse</span><strong>' + closedDeals.length + '</strong></div><div class="pms172-kpi"><span>Azioni entro 3 giorni</span><strong>' + due + '</strong></div></div>' + dealsTable("Trattative aperte", openDeals.map(dealRow).join(""), "Nessuna trattativa aperta.") + dealsTable("Storico trattative chiuse", closedDeals.map(dealRow).join(""), "Nessuna trattativa chiusa nello storico.") + '</div>';
  }
  function printDealHistory(){
    const rows = arr(st().negotiations).map(function(deal){ return '<tr><td>' + esc(itemId(deal)) + '</td><td>' + esc(deal.client || "-") + '</td><td>' + esc(deal.product || deal.productName || "-") + '</td><td>' + esc(deal.status || "-") + '</td><td>' + money(deal.value || deal.price || deal.total, deal.currency) + '</td><td>' + esc(deal.nextAction || "-") + '</td></tr>'; }).join("");
    if (typeof openPrint === "function") openPrint('<div class="print-document pms172-print">' + header("STORICO TRATTATIVE", "TRT-" + today(), "Aperte e chiuse") + '<table class="print-table"><thead><tr><th>ID</th><th>Cliente</th><th>Prodotto</th><th>Stato</th><th>Valore</th><th>Prossima azione</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessuna trattativa.</td></tr>') + '</tbody></table><div class="print-footer">Storico trattative Parmitalia</div></div>');
  }

  function foreignId(item){ return String(item && (item.id || item.code || item.protocol) || ""); }
  function findForeign(id){ return arr(st().foreignEmployees).concat(arr(st().foreignRecruiting)).find(function(item){ return foreignId(item) === String(id || ""); }); }
  function foreignName(item){ return clean(item.fullName || item.name || [item.firstName, item.lastName].filter(Boolean).join(" ")) || foreignId(item); }
  function foreignPrintHtml(item, internal){
    const id = foreignId(item);
    const expenses = arr(item.expenseLines || (item.spentAmount ? [{label:"Costo sostenuto", amount:item.spentAmount}] : []));
    const incomes = arr(item.incomeLines || (item.totalReceived ? [{label:"Incasso", amount:item.totalReceived}] : []));
    const expenseRows = expenses.map(function(line){ return '<tr><td>' + esc(line.label || "-") + '</td><td>' + money(line.amount, item.currency) + '</td></tr>'; }).join("");
    const incomeRows = incomes.map(function(line){ return '<tr><td>' + esc(line.label || "-") + '</td><td>' + money(line.amount, item.currency) + '</td></tr>'; }).join("");
    return '<div class="print-document pms172-print">' + header(internal ? "SCHEDA INTERNA DIPENDENTE ESTERO" : "SCHEDA DIPENDENTE ESTERO", id, foreignName(item)) +
      '<table class="print-table"><tr><th>Nome</th><td>' + esc(foreignName(item)) + '</td><th>Stato pratica</th><td>' + esc(item.practiceStatus || item.status || "-") + '</td></tr><tr><th>Paese</th><td>' + esc(item.country || item.originCountry || "-") + '</td><th>Citta</th><td>' + esc(item.city || "-") + '</td></tr><tr><th>Nazionalita</th><td>' + esc(item.nationality || "-") + '</td><th>Ruolo</th><td>' + esc(item.role || item.targetJob || "-") + '</td></tr><tr><th>Telefono</th><td>' + esc(item.phone || item.whatsapp || "-") + '</td><th>Email</th><td>' + esc(item.email || "-") + '</td></tr></table>' +
      '<h3>Documenti e pratica</h3><div class="pms172-body">' + esc((item.documentRequests ? "Documenti richiesti:\n" + item.documentRequests + "\n\n" : "") + (item.documents || item.skills || item.profile || "-")) + '</div>' +
      '<h3>Piano finanziario</h3><table class="print-table"><tr><th>Costo da pagare</th><td>' + money(item.costAmount || item.toPayAmount, item.currency) + '</td><th>Totale incassato</th><td>' + money(item.totalReceived || incomes.reduce(function(sum,line){ return sum + num(line.amount); }, 0), item.currency) + '</td></tr></table>' +
      (internal ? '<h3>Costi interni</h3><table class="print-table"><tbody>' + (expenseRows || '<tr><td colspan="2">Nessun costo registrato.</td></tr>') + '</tbody></table><h3>Incassi</h3><table class="print-table"><tbody>' + (incomeRows || '<tr><td colspan="2">Nessun incasso registrato.</td></tr>') + '</tbody></table><h3>Note interne</h3><div class="pms172-body">' + esc((item.investment ? "Investimenti / situazione:\n" + item.investment + "\n\n" : "") + (item.notes || "-")) + '</div>' : "") +
      '<div>' + barcode(id) + '</div><div class="print-footer">Scheda dipendente estero - ' + esc(id) + '</div></div>';
  }
  function viewForeign(id){
    const item = findForeign(id);
    if (!item) return alert("Pratica dipendente estero non trovata.");
    modal("Dipendente estero " + foreignId(item), '<div class="pms172-actions" style="margin-bottom:10px"><button class="primary-button" data-pms172-foreign-edit="' + esc(foreignId(item)) + '">Modifica</button><button class="secondary-button" data-pms172-foreign-print="' + esc(foreignId(item)) + '">Stampa dipendente</button><button class="secondary-button" data-pms172-foreign-print-internal="' + esc(foreignId(item)) + '">Stampa interna</button></div>' + foreignPrintHtml(item, true));
  }
  function printForeign(id, internal){
    const item = findForeign(id);
    if (!item) return alert("Pratica dipendente estero non trovata.");
    if (typeof openPrint === "function") openPrint(foreignPrintHtml(item, internal));
  }
  function setValue(id, value){ const node = document.getElementById(id); if (node) node.value = value == null ? "" : value; }
  function editForeign(id){
    const item = findForeign(id);
    if (!item) return alert("Pratica dipendente estero non trovata.");
    document.querySelectorAll(".pms172-modal-backdrop,.pms128-modal-backdrop").forEach(function(node){ node.remove(); });
    if (window.current) current.page = FOREIGN_PAGE;
    if (typeof render === "function") render();
    setTimeout(function(){
      setValue("pms128-foreign-edit-id", foreignId(item));
      setValue("pms128-foreign-name", foreignName(item));
      setValue("pms128-foreign-country", item.country || item.originCountry || "");
      setValue("pms128-foreign-city", item.city || "");
      setValue("pms128-foreign-nationality", item.nationality || "");
      setValue("pms128-foreign-role", item.role || item.targetJob || "");
      setValue("pms128-foreign-profile", item.profile || item.skills || "");
      setValue("pms128-foreign-source", item.sourceChannel || item.source || "");
      setValue("pms128-foreign-recruiter", item.recruiter || "");
      setValue("pms128-foreign-investment", item.investment || "");
      setValue("pms128-foreign-type", item.personType || "Lavoratore");
      setValue("pms128-foreign-phone", item.phone || item.whatsapp || "");
      setValue("pms128-foreign-email", item.email || "");
      setValue("pms128-foreign-status", item.status || "In valutazione");
      setValue("pms128-foreign-practice", item.practiceStatus || "Pratica aperta");
      setValue("pms128-foreign-currency", item.currency || "EUR");
      setValue("pms128-foreign-cost", item.costAmount || item.toPayAmount || "");
      setValue("pms128-foreign-doc-requests", item.documentRequests || "");
      setValue("pms128-foreign-docs", item.documents || "");
      setValue("pms128-foreign-notes", item.notes || "");
      const panel = document.getElementById("pms128-foreign-form-panel");
      if (panel) panel.scrollIntoView({behavior:"smooth", block:"start"});
    }, 80);
  }

  function csvEscape(value){ const text = String(value == null ? "" : value); return /[;"\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text; }
  function templateCsv(){
    const headers = ["nome_completo","paese","citta","nazionalita","ruolo","profilo","canale","recruiter","studente_o_lavoratore","telefono_whatsapp","email","stato","stato_pratica","valuta","costo_da_pagare","documentazione_richiesta","scheda_documenti_competenze","note_interne"];
    const sample = ["Mario Rossi","Marocco","Casablanca","Marocchina","Autista","Patente C/E, esperienza logistica","WhatsApp","Carlo","Lavoratore","+212600000000","mario@example.com","In valutazione","Pratica aperta","EUR","0","Passaporto; patente; CV","Competenze e documenti disponibili","Note operative"];
    return headers.join(";") + "\n" + sample.map(csvEscape).join(";");
  }
  function downloadTemplate(){
    const blob = new Blob([templateCsv()], {type:"text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = TEMPLATE_FILE;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }
  function parseCsv(text){
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i], next = text[i + 1];
      if (char === '"' && quoted && next === '"') { field += '"'; i += 1; continue; }
      if (char === '"') { quoted = !quoted; continue; }
      if (!quoted && (char === ";" || char === ",")) { row.push(field); field = ""; continue; }
      if (!quoted && (char === "\n" || char === "\r")) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(field); field = "";
        if (row.some(function(cell){ return clean(cell); })) rows.push(row);
        row = [];
        continue;
      }
      field += char;
    }
    row.push(field);
    if (row.some(function(cell){ return clean(cell); })) rows.push(row);
    if (!rows.length) return [];
    const headers = rows.shift().map(function(h){ return clean(h).toLowerCase(); });
    return rows.map(function(values){
      const item = {};
      headers.forEach(function(header, index){ item[header] = values[index] || ""; });
      return item;
    });
  }
  function addImportedForeign(raw){
    const record = {
      id: nextCode("EST", st().foreignEmployees),
      date: today(),
      updatedAt: today(),
      fullName: raw.nome_completo || raw.fullname || raw.nome || raw.name || "",
      country: raw.paese || raw.country || "",
      city: raw.citta || raw.city || "",
      nationality: raw.nazionalita || raw.nationality || "",
      role: raw.ruolo || raw.role || "",
      profile: raw.profilo || raw.profile || "",
      sourceChannel: raw.canale || raw.source || "",
      recruiter: raw.recruiter || "",
      personType: raw.studente_o_lavoratore || raw.tipo || "Lavoratore",
      phone: raw.telefono_whatsapp || raw.telefono || raw.phone || "",
      whatsapp: raw.telefono_whatsapp || raw.telefono || raw.phone || "",
      email: raw.email || "",
      status: raw.stato || raw.status || "In valutazione",
      practiceStatus: raw.stato_pratica || raw.pratica || "Pratica aperta",
      currency: raw.valuta || raw.currency || "EUR",
      costAmount: raw.costo_da_pagare || raw.costo || "",
      toPayAmount: raw.costo_da_pagare || raw.costo || "",
      documentRequests: raw.documentazione_richiesta || raw.documenti_richiesti || "",
      documents: raw.scheda_documenti_competenze || raw.documenti || "",
      skills: raw.profilo || raw.scheda_documenti_competenze || "",
      notes: raw.note_interne || raw.note || "",
      expenseLines: [],
      incomeLines: []
    };
    if (!record.fullName) return false;
    st().foreignEmployees.unshift(record);
    state.foreignRecruiting = state.foreignEmployees.slice();
    return true;
  }
  function importForeignFile(file){
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(){
      const records = parseCsv(String(reader.result || ""));
      let added = 0;
      records.forEach(function(record){ if (addImportedForeign(record)) added += 1; });
      saveLocal();
      alert("Importate " + added + " schede dipendente estero.");
      if (typeof render === "function") render();
    };
    reader.readAsText(file, "utf-8");
  }
  function ensureForeignImportPanel(){
    if (!window.current || current.page !== FOREIGN_PAGE) return;
    const page = document.querySelector("#content .pms128-page");
    const form = document.getElementById("pms128-foreign-form-panel");
    if (!page || !form || document.getElementById("pms172-foreign-import-panel")) return;
    const panel = document.createElement("div");
    panel.id = "pms172-foreign-import-panel";
    panel.className = "pms172-card";
    panel.innerHTML = '<h3>Modulo compilabile dipendente estero</h3><div class="pms172-import"><div><p class="pms172-muted">Scarica il CSV, compilalo e reimportalo: il gestionale crea automaticamente la scheda dipendente estero.</p><input type="file" accept=".csv,text/csv" data-pms172-import-foreign></div><div class="pms172-actions"><button type="button" class="secondary-button" data-pms172-download-foreign-template>Scarica modulo CSV</button></div></div>';
    page.insertBefore(panel, form);
  }

  function contractPrintHtml(contract){
    const id = itemId(contract);
    return '<div class="print-document pms172-print">' + header("CONTRATTO", id, contract.type || "") +
      '<table class="print-table"><tr><th>Controparte</th><td>' + esc(contract.counterparty || "-") + '</td><th>Stato</th><td>' + esc(contract.status || "-") + '</td></tr><tr><th>Decorrenza</th><td>' + esc(contract.startDate || "-") + '</td><th>Scadenza</th><td>' + esc(contract.endDate || "-") + '</td></tr><tr><th>Responsabile</th><td>' + esc(contract.responsible || "-") + '</td><th>Modello</th><td>' + esc(contract.template || "-") + '</td></tr></table><div class="pms172-body">' + esc(contract.contractBody || contract.notes || "Testo contratto non inserito.") + '</div><div>' + barcode(id) + '</div><div class="print-footer">Contratto - ' + esc(id) + '</div></div>';
  }
  function viewContract(id){
    const item = arr(st().contracts).find(function(contract){ return itemId(contract) === String(id || ""); });
    if (!item) return alert("Contratto non trovato.");
    modal("Contratto " + itemId(item), '<div class="pms172-actions" style="margin-bottom:10px"><button class="primary-button" data-ctr-edit="' + esc(itemId(item)) + '">Modifica</button><button class="secondary-button" data-ctr-print="' + esc(itemId(item)) + '">Stampa</button></div>' + contractPrintHtml(item));
  }
  function printContract(id){
    const item = arr(st().contracts).find(function(contract){ return itemId(contract) === String(id || ""); });
    if (!item) return alert("Contratto non trovato.");
    if (window.pmsV103ContractsNegotiations && typeof window.pmsV103ContractsNegotiations.printContract === "function") return window.pmsV103ContractsNegotiations.printContract(id);
    if (typeof openPrint === "function") openPrint(contractPrintHtml(item));
  }
  function editContract(id){
    if (window.pmsV103ContractsNegotiations && typeof window.pmsV103ContractsNegotiations.editContract === "function") return window.pmsV103ContractsNegotiations.editContract(id);
    alert("Modulo modifica contratto non disponibile.");
  }

  function bind(){
    document.querySelectorAll("[data-pms172-deal-new]").forEach(function(button){ button.onclick = function(){ editDeal(); }; });
    document.querySelectorAll("[data-pms172-deal-view]").forEach(function(button){ button.onclick = function(){ viewDeal(button.getAttribute("data-pms172-deal-view")); }; });
    document.querySelectorAll("[data-pms172-deal-edit]").forEach(function(button){ button.onclick = function(){ editDeal(button.getAttribute("data-pms172-deal-edit")); }; });
    document.querySelectorAll("[data-pms172-deal-event]").forEach(function(button){ button.onclick = function(){ addDealEvent(button.getAttribute("data-pms172-deal-event")); }; });
    document.querySelectorAll("[data-pms172-deal-print]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms172-deal-print")); }; });
    document.querySelectorAll("[data-pms172-scroll-history]").forEach(function(button){ button.onclick = function(){ const target = document.getElementById("pms172-deal-history"); if (target) target.scrollIntoView({behavior:"smooth", block:"start"}); }; });
    document.querySelectorAll("[data-pms172-print-history]").forEach(function(button){ button.onclick = printDealHistory; });
    document.querySelectorAll("[data-pms172-foreign-edit]").forEach(function(button){ button.onclick = function(){ editForeign(button.getAttribute("data-pms172-foreign-edit")); }; });
    document.querySelectorAll("[data-pms172-foreign-print]").forEach(function(button){ button.onclick = function(){ printForeign(button.getAttribute("data-pms172-foreign-print"), false); }; });
    document.querySelectorAll("[data-pms172-foreign-print-internal]").forEach(function(button){ button.onclick = function(){ printForeign(button.getAttribute("data-pms172-foreign-print-internal"), true); }; });
    document.querySelectorAll("[data-pms172-download-foreign-template]").forEach(function(button){ button.onclick = downloadTemplate; });
    document.querySelectorAll("[data-pms172-import-foreign]").forEach(function(input){ input.onchange = function(){ importForeignFile(input.files && input.files[0]); }; });
  }

  function wrapRender(){
    if (typeof window.render !== "function" || window.render.__pms172Wrapped) return;
    const base = window.render;
    window.render = function(){
      st(); injectCss(); cleanMenuFooter();
      const content = document.getElementById("content");
      if (content && window.current && current.page === DEALS_PAGE) {
        const title = document.getElementById("page-title");
        const subtitle = document.getElementById("page-subtitle");
        if (title) title.textContent = "Trattative in corso";
        if (subtitle) subtitle.textContent = "Aperte e storico sempre accessibile";
        content.innerHTML = renderDeals();
        bind();
        return;
      }
      const result = base.apply(this, arguments);
      setTimeout(afterRender, 0);
      setTimeout(afterRender, 120);
      return result;
    };
    window.render.__pms172Wrapped = true;
    try { render = window.render; } catch(error) {}
  }
  function wrapOpenPrint(){
    if (typeof window.openPrint !== "function" || window.openPrint.__pms172Wrapped) return;
    const base = window.openPrint;
    const wrapped = function(innerHtml){
      injectCss();
      const printStyle = '<style id="pms172-print-inline">@page{size:A4;margin:7mm}.print-document{max-width:194mm;margin:0 auto;font-family:Arial,sans-serif}.print-table{width:100%;border-collapse:collapse;table-layout:fixed}.print-table th,.print-table td{border:1px solid #d7dee8;padding:1.2mm;overflow-wrap:anywhere;vertical-align:top}.print-header{display:flex;justify-content:space-between;gap:5mm;border-bottom:1px solid #cbd5e1;margin-bottom:2.5mm;padding-bottom:2mm}.print-header h1{font-size:14pt;margin:0 0 1mm}.print-footer{font-size:7pt;margin-top:2.5mm;color:#475569}</style>';
      return base.call(this, printStyle + String(innerHtml || ""));
    };
    wrapped.__pms172Wrapped = true;
    window.openPrint = wrapped;
    try { openPrint = wrapped; } catch(error) {}
  }
  function cleanMenuFooter(){
    document.querySelectorAll(".sidebar-footer").forEach(function(footer){
      Array.from(footer.childNodes).forEach(function(node){
        if (node.nodeType === 3) node.nodeValue = "";
        if (node.nodeType === 1 && !node.matches("button,#logout-button")) {
          node.textContent = "";
          node.style.display = "none";
        }
      });
    });
    const currentUser = document.getElementById("current-user");
    if (currentUser) currentUser.textContent = "";
  }
  function clickFallback(event){
    const target = event.target && event.target.closest && event.target.closest("[data-ctr-view],[data-ctr-print],[data-ctr-edit],[data-pms128-foreign-open],[data-pms128-print-employee],[data-pms128-print-internal],[data-pms128-foreign-edit]");
    if (!target) return;
    const ctrView = target.getAttribute("data-ctr-view");
    const ctrPrint = target.getAttribute("data-ctr-print");
    const ctrEdit = target.getAttribute("data-ctr-edit");
    const foreignOpen = target.getAttribute("data-pms128-foreign-open");
    const foreignPrint = target.getAttribute("data-pms128-print-employee");
    const foreignInternal = target.getAttribute("data-pms128-print-internal");
    const foreignEdit = target.getAttribute("data-pms128-foreign-edit");
    if (ctrView) { event.preventDefault(); event.stopPropagation(); return viewContract(ctrView); }
    if (ctrPrint) { event.preventDefault(); event.stopPropagation(); return printContract(ctrPrint); }
    if (ctrEdit && !target.__pms172LetBaseEdit) { event.preventDefault(); event.stopPropagation(); target.__pms172LetBaseEdit = true; setTimeout(function(){ target.__pms172LetBaseEdit = false; }, 400); return editContract(ctrEdit); }
    if (foreignOpen) { event.preventDefault(); event.stopPropagation(); return viewForeign(foreignOpen); }
    if (foreignPrint) { event.preventDefault(); event.stopPropagation(); return printForeign(foreignPrint, false); }
    if (foreignInternal) { event.preventDefault(); event.stopPropagation(); return printForeign(foreignInternal, true); }
    if (foreignEdit) { event.preventDefault(); event.stopPropagation(); return editForeign(foreignEdit); }
  }
  function afterRender(){
    injectCss();
    cleanMenuFooter();
    ensureForeignImportPanel();
    bind();
  }
  function install(){
    st();
    injectCss();
    wrapOpenPrint();
    wrapRender();
    document.addEventListener("click", clickFallback, true);
    afterRender();
    [80, 200, 500, 1000, 1800].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(function(){ cleanMenuFooter(); ensureForeignImportPanel(); }, 1500);
    window.PMS_V172_ACCESS_HISTORY_PRINT_IMPORT_FIX = {version:VERSION, renderDeals:renderDeals, printForeign:printForeign, printDeal:printDeal};
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
