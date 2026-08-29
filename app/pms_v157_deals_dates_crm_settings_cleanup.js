(function(){
  "use strict";
  const VERSION = "pms_v157_deals_dates_crm_settings_cleanup";
  const DEALS = "trattativeInCorso";
  const INTER = "intermediations";
  const CRM = "communications";
  const CRM_COMPANIES = "crmCompanies";
  const CRM_OPPS = "crmOpportunities";
  const CRM_ACTIVITIES = "crmActivities";

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function num(value){
    const parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function today(){ return new Date().toISOString().slice(0, 10); }
  function money(value, currency){
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function uid(prefix, list){
    if (typeof nextSequentialCode === "function") return nextSequentialCode(prefix, list || []);
    return prefix + "-" + Date.now();
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio non riuscito. Riprova dopo aver chiuso altre finestre.");
      return false;
    }
  }
  function badgeSafe(text, cls){
    return typeof badge === "function" ? badge(text || "-", cls || "primary") : '<span class="badge">' + esc(text || "-") + '</span>';
  }
  function openPrintSafe(html){
    if (typeof openPrint === "function") openPrint(html);
    else {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write("<!doctype html><html><head><meta charset='utf-8'><title>Stampa</title></head><body>" + html + "</body></html>");
      win.document.close();
      win.print();
    }
  }

  function ensureField(module, field, afterKey){
    schemas[module] = schemas[module] || {title: module, fields: []};
    const fields = schemas[module].fields || (schemas[module].fields = []);
    const existing = fields.find(function(item){ return item.key === field.key; });
    if (existing) Object.assign(existing, field);
    else {
      const idx = fields.findIndex(function(item){ return item.key === afterKey; });
      fields.splice(idx >= 0 ? idx + 1 : fields.length, 0, field);
    }
  }
  function ensureModule(id, label, subtitle, after){
    if (!Array.isArray(modules)) return;
    let module = modules.find(function(item){ return item.id === id; });
    if (module) {
      module.label = label;
      module.subtitle = subtitle;
      return module;
    }
    module = {id:id, label:label, subtitle:subtitle, roles:["admin","assistant","agent"]};
    const idx = modules.findIndex(function(item){ return item.id === after; });
    modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, module);
    return module;
  }
  function removeUnusedModules(){
    if (!Array.isArray(modules)) return;
    const removeIds = new Set(["admin", "approvals", "userRoles", "usersRoles", "adminApprovals"]);
    for (let i = modules.length - 1; i >= 0; i--) {
      const text = [modules[i].id, modules[i].label, modules[i].subtitle].join(" ").toLowerCase();
      if (removeIds.has(modules[i].id) || text.includes("autorizzazioni admin") || text.includes("utenti e ruoli")) modules.splice(i, 1);
    }
    const settings = modules.find(function(item){ return item.id === "settings"; });
    if (settings) {
      settings.label = "Backup";
      settings.subtitle = "Importa ed esporta il backup del gestionale";
    }
  }
  function ensureData(){
    if (typeof state === "undefined") return;
    state[INTER] = arr(state[INTER]);
    state[CRM] = arr(state[CRM]);
    state[CRM_COMPANIES] = arr(state[CRM_COMPANIES]);
    state[CRM_OPPS] = arr(state[CRM_OPPS]);
    state[CRM_ACTIVITIES] = arr(state[CRM_ACTIVITIES]);

    ensureField(INTER, {key:"currentPrice", label:"Prezzo attuale", type:"number", step:"0.01"}, "value");
    ensureField(INTER, {key:"targetPrice", label:"Target price", type:"number", step:"0.01"}, "currentPrice");
    ensureField(INTER, {key:"negotiationStatus", label:"Stato trattativa", type:"select", options:["Aperta","In trattativa","Campionatura","Offerta inviata","Prezzo accettato","In attesa","Chiusa vinta","Chiusa persa","Bloccata"]}, "targetPrice");
    ensureField(INTER, {key:"negotiationStage", label:"Fase negoziazione", type:"select", options:["Primo contatto","Richiesta prezzo","Negoziazione prezzo","Campione inviato","Attesa risposta","Contratto/ordine","Chiusura"]}, "negotiationStatus");
    ensureField(INTER, {key:"nextAction", label:"Prossima azione", type:"text"}, "negotiationStage");
    ensureField(INTER, {key:"negotiationNotes", label:"Note negoziazione", type:"textarea", full:true}, "nextAction");

    state[INTER].forEach(function(item){
      item.negotiationHistory = arr(item.negotiationHistory);
      if (!item.negotiationStatus) item.negotiationStatus = item.status || "Aperta";
      if (!item.date) item.date = item.orderDate || item.createdAt || today();
      if (!item.currency) item.currency = "EUR";
    });

    schemas[CRM_COMPANIES] = {title:"azienda CRM", fields:[
      {key:"name", label:"Azienda", type:"text", required:true},
      {key:"type", label:"Tipo", type:"select", options:["Cliente","Fornitore","Prospect","Partner","Agente"]},
      {key:"country", label:"Paese", type:"text"},
      {key:"referent", label:"Referente", type:"text"},
      {key:"phone", label:"Telefono", type:"text"},
      {key:"email", label:"Email", type:"email"},
      {key:"stage", label:"Stato relazione", type:"select", options:["Nuovo","Attivo","Da richiamare","In trattativa","Dormiente","Bloccato"]},
      {key:"nextActionDate", label:"Prossima azione", type:"date"},
      {key:"notes", label:"Note", type:"textarea", full:true}
    ]};
    schemas[CRM_OPPS] = {title:"opportunita CRM", fields:[
      {key:"title", label:"Opportunita", type:"text", required:true},
      {key:"company", label:"Azienda", type:"text", required:true},
      {key:"product", label:"Prodotto", type:"text"},
      {key:"value", label:"Valore previsto", type:"number", step:"0.01"},
      {key:"currency", label:"Valuta", type:"select", options:["EUR","RON","USD"]},
      {key:"stage", label:"Fase", type:"select", options:["Lead","Qualificata","Offerta","Negoziazione","Campionatura","Vinta","Persa"]},
      {key:"probability", label:"Probabilita %", type:"number", step:"1"},
      {key:"expectedClose", label:"Chiusura prevista", type:"date"},
      {key:"nextAction", label:"Prossima azione", type:"text"},
      {key:"notes", label:"Note", type:"textarea", full:true}
    ]};
    schemas[CRM_ACTIVITIES] = {title:"attivita CRM", fields:[
      {key:"date", label:"Data", type:"date", required:true},
      {key:"company", label:"Azienda", type:"text"},
      {key:"contact", label:"Contatto", type:"text"},
      {key:"channel", label:"Canale", type:"select", options:["Telefono","Email","WhatsApp","Riunione","Visita","Nota interna"]},
      {key:"subject", label:"Oggetto", type:"text", required:true},
      {key:"priority", label:"Priorita", type:"select", options:["Alta","Media","Bassa"]},
      {key:"status", label:"Stato", type:"select", options:["Da fare","In corso","Fatto","Rimandato"]},
      {key:"notes", label:"Note", type:"textarea", full:true}
    ]};

    ensureModule(CRM, "CRM Commerciale", "Clienti, opportunita, attivita e comunicazioni", "assistant");
    removeUnusedModules();
  }

  function injectStyle(){
    if (document.getElementById("pms-v157-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v157-style";
    style.textContent = `
      #export-json,#import-json,.pms79-admin-safe{display:none!important}
      .pms157-page{display:grid;gap:14px}
      .pms157-panel{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}
      .pms157-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px}
      .pms157-head h3{margin:2px 0}.pms157-head span{display:block;font-size:12px;font-weight:900;text-transform:uppercase;color:#1f4e78}
      .pms157-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.pms157-actions button,.pms157-actions .secondary-button,.pms157-actions .primary-button{width:auto!important;margin:0!important}
      .pms157-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.pms157-kpi{background:#fff;border:1px solid var(--line);border-radius:8px;padding:12px}.pms157-kpi strong{display:block;font-size:22px;color:var(--primary)}
      .pms157-price{font-weight:900;color:#0f766e}.pms157-target{font-weight:900;color:#1f4e78}.pms157-gap.positive{color:#0f766e;font-weight:900}.pms157-gap.negative{color:#b91c1c;font-weight:900}
      .pms157-modal{position:fixed;inset:0;z-index:10050;background:rgba(15,23,42,.45);display:flex;align-items:flex-start;justify-content:center;padding:26px 14px;overflow:auto}
      .pms157-modal-card{width:min(1180px,100%);background:#fff;border-radius:10px;box-shadow:0 24px 70px rgba(15,23,42,.35);overflow:hidden}
      .pms157-modal-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--line);background:#f8fafc}
      .pms157-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;padding:16px 18px}.pms157-form .full{grid-column:1/-1}
      .pms157-form label{display:block;font-size:12px;font-weight:900;color:var(--muted);margin-bottom:4px}.pms157-form input,.pms157-form select,.pms157-form textarea{width:100%}.pms157-form textarea{min-height:84px}
      .pms157-section{grid-column:1/-1;border-bottom:1px solid #dbe5ef;color:#1f4e78;font-weight:900;padding:7px 0 5px}.pms157-history{grid-column:1/-1;background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px}
      .pms157-calendar{position:fixed;z-index:11000;width:282px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;box-shadow:0 18px 50px rgba(15,23,42,.22);padding:10px}
      .pms157-cal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.pms157-cal-head button{width:32px!important;height:30px;margin:0!important;padding:0!important}
      .pms157-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}.pms157-cal-grid span{font-size:11px;font-weight:900;color:#64748b;text-align:center;padding:4px 0}
      .pms157-cal-grid button{width:100%!important;margin:0!important;padding:7px 0!important;background:#f8fafc;color:#111827;border:1px solid #e2e8f0}.pms157-cal-grid button.active{background:#1f4e78;color:#fff}.pms157-date-btn{margin-left:6px!important;width:auto!important;padding:7px 9px!important}
      .pms157-tabs{display:flex;gap:8px;flex-wrap:wrap}.pms157-tab{width:auto!important;margin:0!important;background:#eef3f8;color:var(--primary);border:1px solid var(--line)}.pms157-tab.active{background:var(--primary);color:#fff}
      .pms157-board{display:grid;grid-template-columns:repeat(4,minmax(180px,1fr));gap:10px}.pms157-column{background:#f8fafc;border:1px solid var(--line);border-radius:8px;padding:10px}.pms157-column h4{margin:0 0 8px}.pms157-card{background:#fff;border:1px solid #dbe5ef;border-radius:8px;padding:9px;margin-bottom:8px}
      .pms157-backup-box{max-width:920px;margin:0 auto}.pms157-backup-box .pms157-actions{margin-top:12px}
      @media(max-width:980px){.pms157-kpis,.pms157-board{grid-template-columns:repeat(2,minmax(0,1fr))}.pms157-form{grid-template-columns:repeat(2,minmax(0,1fr))}.pms157-head{display:block}.pms157-actions{margin-top:10px}}
      @media(max-width:640px){.pms157-kpis,.pms157-board,.pms157-form{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function latestHistory(item){
    const history = arr(item.negotiationHistory);
    if (!history.length) return item.negotiationNotes || item.nextAction || "-";
    const last = history[history.length - 1];
    return [last.date, last.status, last.note].filter(Boolean).join(" - ");
  }
  function dealOpen(item){
    return !["Completato","Chiuso","Scaduto","Annullato","Chiusa vinta","Chiusa persa"].includes(String(item.negotiationStatus || item.status || ""));
  }
  function renderDeals(){
    const search = String(current.filters.deals157 || "").toLowerCase();
    const base = arr(state[INTER]).filter(dealOpen);
    const list = base.filter(function(item){ return !search || JSON.stringify(item).toLowerCase().includes(search); });
    const value = list.reduce(function(sum, item){ return sum + num(item.value || item.dealValue); }, 0);
    const targetOk = list.filter(function(item){ return num(item.currentPrice) && num(item.targetPrice) && num(item.currentPrice) <= num(item.targetPrice); }).length;
    const rows = list.map(function(item){
      const currentPrice = num(item.currentPrice);
      const targetPrice = num(item.targetPrice);
      const gap = currentPrice && targetPrice ? targetPrice - currentPrice : 0;
      return '<tr><td><span class="pms85-code">' + esc(item.id) + '</span></td><td>' + esc(item.date || "-") + '</td><td><strong>' + esc(item.client || "-") + '</strong><br><small>' + esc(item.supplier || "") + '</small></td><td><strong>' + esc(item.product || "-") + '</strong><br><small>' + esc(item.category || "") + '</small></td><td class="pms157-price">' + (currentPrice ? money(currentPrice, item.currency) : "-") + '</td><td class="pms157-target">' + (targetPrice ? money(targetPrice, item.currency) : "-") + '</td><td class="pms157-gap ' + (gap >= 0 ? "positive" : "negative") + '">' + (currentPrice && targetPrice ? money(gap, item.currency) : "-") + '</td><td>' + badgeSafe(item.negotiationStatus || item.status || "Aperta", dealOpen(item) ? "warn" : "success") + '<br><small>' + esc(item.negotiationStage || "") + '</small></td><td>' + esc(latestHistory(item)) + '</td><td><div class="pms85-action-cell"><button class="inline-button" data-pms157-edit-deal="' + esc(item.id) + '">Modifica</button><button class="inline-button" data-pms157-print-deal="' + esc(item.id) + '">Stampa</button></div></td></tr>';
    }).join("");
    return '<div class="pms157-page"><div class="pms157-kpis"><div class="pms157-kpi"><strong>' + list.length + '</strong>Trattative aperte<br><small>Pipeline attiva</small></div><div class="pms157-kpi"><strong>' + money(value, "EUR") + '</strong>Valore stimato<br><small>Totale indicativo</small></div><div class="pms157-kpi"><strong>' + targetOk + '</strong>Target raggiunti<br><small>Prezzo attuale entro obiettivo</small></div><div class="pms157-kpi"><strong>' + arr(state[INTER]).length + '</strong>Storico<br><small>Trattative totali</small></div></div><div class="pms157-panel"><div class="pms157-head"><div><span>Pipeline commerciale</span><h3>Trattative in corso</h3><div class="pms85-muted">Prezzo attuale, target price, stato e storico delle negoziazioni.</div></div><div class="pms157-actions"><input data-pms157-search-deals placeholder="Cerca trattativa..." value="' + esc(current.filters.deals157 || "") + '"><button class="primary-button" data-pms157-new-deal>+ Nuova trattativa</button><button class="secondary-button" data-pms157-print-deals>Stampa</button><button class="secondary-button" data-pms157-export-deals>Excel</button></div></div><div class="table-wrap"><table><thead><tr><th>Protocollo</th><th>Data</th><th>Cliente / Fornitore</th><th>Prodotto</th><th>Prezzo attuale</th><th>Target price</th><th>Differenza</th><th>Stato</th><th>Ultima negoziazione</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="10" class="empty">Nessuna trattativa aperta.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function fieldHtml(label, name, value, type, options, full){
    if (options) return '<div class="' + (full ? "full" : "") + '"><label>' + esc(label) + '</label><select name="' + esc(name) + '">' + ["", ...options].map(function(option){ return '<option value="' + esc(option) + '" ' + (String(option) === String(value || "") ? "selected" : "") + '>' + esc(option || "--") + '</option>'; }).join("") + '</select></div>';
    if (type === "textarea") return '<div class="' + (full ? "full" : "") + '"><label>' + esc(label) + '</label><textarea name="' + esc(name) + '">' + esc(value || "") + '</textarea></div>';
    return '<div class="' + (full ? "full" : "") + '"><label>' + esc(label) + '</label><input name="' + esc(name) + '" type="' + esc(type || "text") + '" step="any" value="' + esc(value == null ? "" : value) + '"></div>';
  }
  function openDealModal(id){
    ensureData(); injectStyle();
    const existing = id ? arr(state[INTER]).find(function(item){ return String(item.id) === String(id); }) : null;
    const record = existing || {id: uid("INT", state[INTER]), date: today(), currency:"EUR", negotiationStatus:"Aperta", negotiationStage:"Primo contatto"};
    const history = arr(record.negotiationHistory);
    const historyRows = history.map(function(row){
      return '<tr><td>' + esc(row.date || "") + '</td><td>' + esc(row.status || "") + '</td><td>' + money(row.currentPrice, record.currency) + '</td><td>' + money(row.targetPrice, record.currency) + '</td><td>' + esc(row.note || "") + '</td></tr>';
    }).join("");
    const modal = document.createElement("div");
    modal.className = "pms157-modal";
    modal.id = "pms157-deal-modal";
    modal.innerHTML = '<div class="pms157-modal-card"><div class="pms157-modal-head"><div><h3>' + (existing ? "Modifica trattativa " : "Nuova trattativa ") + esc(record.id) + '</h3><small>Prezzo attuale, target price e storico negoziazioni</small></div><button type="button" class="icon-button" data-pms157-close aria-label="Chiudi">X</button></div><form id="pms157-deal-form"><div class="pms157-form"><div class="pms157-section">Dati trattativa</div>' +
      fieldHtml("Protocollo", "id", record.id, "text") +
      fieldHtml("Data", "date", record.date, "date") +
      fieldHtml("Cliente", "client", record.client, "text") +
      fieldHtml("Fornitore", "supplier", record.supplier, "text") +
      fieldHtml("Prodotto", "product", record.product, "text") +
      fieldHtml("Categoria", "category", record.category, "text") +
      fieldHtml("Valuta", "currency", record.currency || "EUR", "select", ["EUR","RON","USD"]) +
      fieldHtml("Valore trattativa", "value", record.value || record.dealValue, "number") +
      '<div class="pms157-section">Prezzi e negoziazione</div>' +
      fieldHtml("Prezzo attuale", "currentPrice", record.currentPrice, "number") +
      fieldHtml("Target price", "targetPrice", record.targetPrice, "number") +
      fieldHtml("Stato trattativa", "negotiationStatus", record.negotiationStatus || record.status, "select", ["Aperta","In trattativa","Campionatura","Offerta inviata","Prezzo accettato","In attesa","Chiusa vinta","Chiusa persa","Bloccata"]) +
      fieldHtml("Fase negoziazione", "negotiationStage", record.negotiationStage, "select", ["Primo contatto","Richiesta prezzo","Negoziazione prezzo","Campione inviato","Attesa risposta","Contratto/ordine","Chiusura"]) +
      fieldHtml("Prossima azione", "nextAction", record.nextAction, "text", null, true) +
      fieldHtml("Note negoziazione", "negotiationNotes", record.negotiationNotes || record.notes, "textarea", null, true) +
      fieldHtml("Nuovo aggiornamento storico", "newHistoryNote", "", "textarea", null, true) +
      '<div class="pms157-history"><strong>Storico prezzi e negoziazioni</strong><div class="table-wrap" style="margin-top:8px"><table><thead><tr><th>Data</th><th>Stato</th><th>Prezzo attuale</th><th>Target</th><th>Nota</th></tr></thead><tbody>' + (historyRows || '<tr><td colspan="5" class="empty">Nessuno storico registrato.</td></tr>') + '</tbody></table></div></div></div><div class="pms84-modal-actions"><button type="button" class="secondary-button" data-pms157-close>Annulla</button><button type="submit" class="primary-button">Salva trattativa</button></div></form></div>';
    document.body.appendChild(modal);
    bindDatePickers();
    modal.querySelectorAll("[data-pms157-close]").forEach(function(button){ button.onclick = function(){ modal.remove(); }; });
    modal.addEventListener("click", function(event){ if (event.target === modal) modal.remove(); });
    modal.querySelector("form").onsubmit = function(event){
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target).entries());
      const next = Object.assign({}, record, data);
      next.currentPrice = num(data.currentPrice);
      next.targetPrice = num(data.targetPrice);
      next.value = num(data.value);
      next.status = data.negotiationStatus || data.status || "Aperta";
      next.negotiationHistory = arr(record.negotiationHistory).slice();
      const changed = !existing || num(record.currentPrice) !== next.currentPrice || num(record.targetPrice) !== next.targetPrice || String(record.negotiationStatus || record.status || "") !== String(next.negotiationStatus || "");
      if (changed || String(data.newHistoryNote || "").trim()) {
        next.negotiationHistory.push({date: today(), currentPrice: next.currentPrice, targetPrice: next.targetPrice, status: next.negotiationStatus, stage: next.negotiationStage, note: String(data.newHistoryNote || next.negotiationNotes || "").trim()});
      }
      delete next.newHistoryNote;
      if (existing) Object.assign(existing, next);
      else state[INTER].unshift(next);
      if (!saveNow()) return;
      modal.remove();
      render();
    };
  }
  function printDeals(){
    const html = '<div class="print-document">' + (typeof companyPrintHeader === "function" ? companyPrintHeader("TRATTATIVE IN CORSO", "TRT-" + today()) : "<h1>Trattative in corso</h1>") + renderDeals() + '</div>';
    openPrintSafe(html);
  }
  function exportDeals(){
    const headers = ["Protocollo","Data","Cliente","Fornitore","Prodotto","Prezzo attuale","Target price","Valuta","Stato","Fase","Prossima azione","Ultima negoziazione"];
    const rows = arr(state[INTER]).filter(dealOpen).map(function(item){ return [item.id,item.date,item.client,item.supplier,item.product,item.currentPrice,item.targetPrice,item.currency,item.negotiationStatus || item.status,item.negotiationStage,item.nextAction,latestHistory(item)]; });
    downloadTable("trattative_in_corso_parmitalia.xls", headers, rows);
  }
  function printDeal(id){
    const item = arr(state[INTER]).find(function(row){ return String(row.id) === String(id); });
    if (!item) return;
    const history = arr(item.negotiationHistory).map(function(row){ return '<tr><td>' + esc(row.date) + '</td><td>' + esc(row.status) + '</td><td>' + money(row.currentPrice, item.currency) + '</td><td>' + money(row.targetPrice, item.currency) + '</td><td>' + esc(row.note) + '</td></tr>'; }).join("");
    const header = typeof companyPrintHeader === "function" ? companyPrintHeader("TRATTATIVA IN CORSO", item.id) : "<h1>Trattativa in corso</h1>";
    openPrintSafe('<div class="print-document">' + header + '<table class="print-table"><tr><th>Cliente</th><td>' + esc(item.client) + '</td><th>Fornitore</th><td>' + esc(item.supplier) + '</td></tr><tr><th>Prodotto</th><td>' + esc(item.product) + '</td><th>Data</th><td>' + esc(item.date) + '</td></tr><tr><th>Prezzo attuale</th><td>' + money(item.currentPrice, item.currency) + '</td><th>Target price</th><td>' + money(item.targetPrice, item.currency) + '</td></tr><tr><th>Stato</th><td>' + esc(item.negotiationStatus || item.status) + '</td><th>Prossima azione</th><td>' + esc(item.nextAction) + '</td></tr></table><h3>Storico negoziazioni</h3><table class="print-table"><thead><tr><th>Data</th><th>Stato</th><th>Prezzo attuale</th><th>Target</th><th>Nota</th></tr></thead><tbody>' + (history || '<tr><td colspan="5">Nessuno storico.</td></tr>') + '</tbody></table></div>');
  }

  function crmTab(){ return current.filters.crmTab157 || "dashboard"; }
  function tabButton(id, label){ return '<button class="pms157-tab ' + (crmTab() === id ? "active" : "") + '" data-pms157-crm-tab="' + esc(id) + '">' + esc(label) + '</button>'; }
  function combinedCompanies(){
    const map = new Map();
    arr(state.contacts).forEach(function(contact){
      const name = contact.name || contact.client || contact.supplier;
      if (!name) return;
      map.set(String(name).toLowerCase(), {name:name, type:contact.type || "Anagrafica", country:contact.country, referent:contact.contactPerson, phone:contact.phone, email:contact.email, stage:contact.status || "Attivo", source:"Anagrafiche"});
    });
    arr(state[CRM_COMPANIES]).forEach(function(company){ if (company.name) map.set(String(company.name).toLowerCase(), Object.assign({source:"CRM"}, company)); });
    return Array.from(map.values());
  }
  function renderCRM(){
    const companies = combinedCompanies();
    const opps = arr(state[CRM_OPPS]);
    const acts = arr(state[CRM_ACTIVITIES]);
    const comms = arr(state[CRM]);
    const openOpps = opps.filter(function(o){ return !["Vinta","Persa"].includes(String(o.stage || "")); });
    const body = crmTab() === "companies" ? renderCRMCompanies(companies) : crmTab() === "opps" ? renderCRMOpportunities(opps) : crmTab() === "activities" ? renderCRMActivities(acts) : crmTab() === "comms" ? renderCRMComms(comms) : renderCRMDashboard(companies, opps, acts, comms);
    return '<div class="pms157-page"><div class="pms157-kpis"><div class="pms157-kpi"><strong>' + companies.length + '</strong>Aziende<br><small>Clienti, fornitori e prospect</small></div><div class="pms157-kpi"><strong>' + openOpps.length + '</strong>Opportunita aperte<br><small>Pipeline CRM</small></div><div class="pms157-kpi"><strong>' + acts.filter(function(a){ return a.status !== "Fatto"; }).length + '</strong>Attivita aperte<br><small>Follow-up commerciali</small></div><div class="pms157-kpi"><strong>' + comms.length + '</strong>Comunicazioni<br><small>Registro storico</small></div></div><div class="pms157-tabs">' + tabButton("dashboard","Agenda CRM") + tabButton("companies","Aziende") + tabButton("opps","Opportunita") + tabButton("activities","Attivita") + tabButton("comms","Comunicazioni") + '</div>' + body + '</div>';
  }
  function renderCRMDashboard(companies, opps, acts, comms){
    const stages = ["Lead","Qualificata","Offerta","Negoziazione"];
    const board = stages.map(function(stage){
      const cards = opps.filter(function(o){ return String(o.stage || "Lead") === stage; }).slice(0, 8).map(function(o){ return '<div class="pms157-card"><strong>' + esc(o.title || o.company || "-") + '</strong><br><small>' + esc(o.company || "") + '</small><br>' + money(o.value, o.currency) + '<br>' + badgeSafe(o.probability ? o.probability + "%" : stage, "primary") + '</div>'; }).join("");
      return '<div class="pms157-column"><h4>' + esc(stage) + '</h4>' + (cards || '<small>Nessuna opportunita.</small>') + '</div>';
    }).join("");
    const next = acts.filter(function(a){ return a.status !== "Fatto"; }).sort(function(a,b){ return String(a.date || "").localeCompare(String(b.date || "")); }).slice(0, 8).map(function(a){ return '<tr><td>' + esc(a.date || "") + '</td><td><strong>' + esc(a.subject || "") + '</strong><br><small>' + esc(a.company || "") + '</small></td><td>' + esc(a.channel || "") + '</td><td>' + badgeSafe(a.priority || "Media", a.priority === "Alta" ? "danger" : "primary") + '</td></tr>'; }).join("");
    return '<div class="pms157-panel"><div class="pms157-head"><div><span>CRM operativo</span><h3>Agenda commerciale e pipeline</h3></div><div class="pms157-actions"><button class="primary-button" data-add="' + CRM_ACTIVITIES + '">+ Attivita</button><button class="secondary-button" data-add="' + CRM_OPPS + '">+ Opportunita</button><button class="secondary-button" data-add="' + CRM_COMPANIES + '">+ Azienda</button></div></div><div class="pms157-board">' + board + '</div></div><div class="pms157-panel"><div class="pms157-head"><div><span>Follow-up</span><h3>Prossime attivita</h3></div><div class="pms157-actions"><button class="secondary-button" data-pms157-export-crm>Excel CRM</button></div></div><div class="table-wrap"><table><thead><tr><th>Data</th><th>Oggetto</th><th>Canale</th><th>Priorita</th></tr></thead><tbody>' + (next || '<tr><td colspan="4" class="empty">Nessuna attivita aperta.</td></tr>') + '</tbody></table></div></div>';
  }
  function renderCRMCompanies(companies){
    const rows = companies.map(function(c){ return '<tr><td><strong>' + esc(c.name) + '</strong><br><small>' + esc(c.source || "CRM") + '</small></td><td>' + esc(c.type || "") + '</td><td>' + esc(c.country || "") + '</td><td>' + esc(c.referent || "") + '<br><small>' + esc(c.phone || c.email || "") + '</small></td><td>' + badgeSafe(c.stage || "Attivo", "primary") + '</td></tr>'; }).join("");
    return '<div class="pms157-panel"><div class="pms157-head"><div><span>Database CRM</span><h3>Aziende e referenti</h3></div><div class="pms157-actions"><button class="primary-button" data-add="' + CRM_COMPANIES + '">+ Nuova azienda</button></div></div><div class="table-wrap"><table><thead><tr><th>Azienda</th><th>Tipo</th><th>Paese</th><th>Referente</th><th>Stato</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="empty">Nessuna azienda.</td></tr>') + '</tbody></table></div></div>';
  }
  function renderCRMOpportunities(opps){
    const rows = opps.map(function(o){ return '<tr><td><strong>' + esc(o.title || "-") + '</strong><br><small>' + esc(o.company || "") + '</small></td><td>' + esc(o.product || "") + '</td><td>' + money(o.value, o.currency) + '</td><td>' + badgeSafe(o.stage || "Lead", ["Vinta"].includes(o.stage) ? "success" : "warn") + '</td><td>' + esc(o.probability || 0) + '%</td><td>' + esc(o.expectedClose || "") + '</td><td><button class="inline-button" data-edit="' + CRM_OPPS + '" data-id="' + esc(o.id) + '">Modifica</button></td></tr>'; }).join("");
    return '<div class="pms157-panel"><div class="pms157-head"><div><span>Pipeline</span><h3>Opportunita commerciali</h3></div><div class="pms157-actions"><button class="primary-button" data-add="' + CRM_OPPS + '">+ Nuova opportunita</button></div></div><div class="table-wrap"><table><thead><tr><th>Opportunita</th><th>Prodotto</th><th>Valore</th><th>Fase</th><th>Prob.</th><th>Chiusura</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7" class="empty">Nessuna opportunita.</td></tr>') + '</tbody></table></div></div>';
  }
  function renderCRMActivities(acts){
    const rows = acts.map(function(a){ return '<tr><td>' + esc(a.date || "") + '</td><td><strong>' + esc(a.subject || "") + '</strong><br><small>' + esc(a.company || "") + '</small></td><td>' + esc(a.channel || "") + '</td><td>' + badgeSafe(a.priority || "Media", a.priority === "Alta" ? "danger" : "primary") + '</td><td>' + badgeSafe(a.status || "Da fare", a.status === "Fatto" ? "success" : "warn") + '</td><td><button class="inline-button" data-edit="' + CRM_ACTIVITIES + '" data-id="' + esc(a.id) + '">Modifica</button></td></tr>'; }).join("");
    return '<div class="pms157-panel"><div class="pms157-head"><div><span>Agenda CRM</span><h3>Attivita e follow-up</h3></div><div class="pms157-actions"><button class="primary-button" data-add="' + CRM_ACTIVITIES + '">+ Nuova attivita</button></div></div><div class="table-wrap"><table><thead><tr><th>Data</th><th>Oggetto</th><th>Canale</th><th>Priorita</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="empty">Nessuna attivita CRM.</td></tr>') + '</tbody></table></div></div>';
  }
  function renderCRMComms(comms){
    const rows = comms.map(function(c){ return '<tr><td>' + esc(c.id || "") + '</td><td><strong>' + esc(c.title || c.subject || "Comunicazione") + '</strong><br><small>' + esc(c.message || c.aiSummary || "") + '</small></td><td>' + esc(c.client || c.supplier || c.linkedTo || "") + '</td><td>' + esc(c.channel || c.type || "") + '</td><td>' + badgeSafe(c.status || "Aperta", c.status === "Completato" ? "success" : "warn") + '</td><td><button class="inline-button" data-add="' + CRM + '">+ Registra</button></td></tr>'; }).join("");
    return '<div class="pms157-panel"><div class="pms157-head"><div><span>Registro</span><h3>Comunicazioni CRM</h3></div><div class="pms157-actions"><button class="primary-button" data-add="' + CRM + '">+ Nuova comunicazione</button></div></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Messaggio</th><th>Collegato</th><th>Canale</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="empty">Nessuna comunicazione registrata.</td></tr>') + '</tbody></table></div></div>';
  }
  function exportCRM(){
    const headers = ["Tipo","Azienda","Oggetto","Valore","Fase/Stato","Data","Note"];
    const rows = [];
    combinedCompanies().forEach(function(c){ rows.push(["Azienda", c.name, c.referent || "", "", c.stage || "", c.nextActionDate || "", c.notes || ""]); });
    arr(state[CRM_OPPS]).forEach(function(o){ rows.push(["Opportunita", o.company, o.title, o.value, o.stage, o.expectedClose, o.notes]); });
    arr(state[CRM_ACTIVITIES]).forEach(function(a){ rows.push(["Attivita", a.company, a.subject, "", a.status, a.date, a.notes]); });
    downloadTable("crm_parmitalia.xls", headers, rows);
  }
  function downloadTable(filename, headers, rows){
    const html = '<!doctype html><html><head><meta charset="utf-8"></head><body><table border="1"><thead><tr>' + headers.map(function(h){ return '<th>' + esc(h) + '</th>'; }).join("") + '</tr></thead><tbody>' + rows.map(function(row){ return '<tr>' + row.map(function(cell){ return '<td>' + esc(cell == null ? "" : cell) + '</td>'; }).join("") + '</tr>'; }).join("") + '</tbody></table></body></html>';
    const blob = new Blob([html], {type:"application/vnd.ms-excel;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ URL.revokeObjectURL(url); link.remove(); }, 250);
  }

  function renderSettingsClean(){
    const counts = Object.keys(state || {}).filter(function(key){ return Array.isArray(state[key]); }).map(function(key){ return '<tr><td>' + esc(key) + '</td><td>' + arr(state[key]).length + '</td></tr>'; }).join("");
    return '<div class="pms157-page pms157-backup-box"><div class="pms157-panel"><div class="pms157-head"><div><span>Backup gestionale</span><h3>Importa / esporta backup</h3><div class="pms85-muted">Un solo punto per salvare o ricaricare tutti i dati del gestionale.</div></div></div><div class="pms157-actions"><button class="primary-button" data-pms157-export-backup>Esporta backup JSON</button><button class="secondary-button" data-pms157-import-click>Importa backup JSON</button><input type="file" accept="application/json,.json" data-pms157-import-file hidden></div></div><div class="pms157-panel"><div class="pms157-head"><div><span>Archivio locale</span><h3>Record presenti</h3></div></div><div class="table-wrap"><table><thead><tr><th>Archivio</th><th>Record</th></tr></thead><tbody>' + (counts || '<tr><td colspan="2" class="empty">Nessun dato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function exportBackupClean(){
    if (typeof exportBackup === "function") return exportBackup();
    const blob = new Blob([JSON.stringify(state, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "parmitalia-backup-" + today() + ".json";
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ URL.revokeObjectURL(url); link.remove(); }, 250);
  }
  function importBackupClean(file){
    if (!file) return;
    if (typeof importBackup === "function") return importBackup(file);
    const reader = new FileReader();
    reader.onload = function(){
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof normalizeState === "function") state = normalizeState(parsed);
        else state = parsed;
        saveNow();
        render();
        alert("Backup importato correttamente.");
      } catch(error) {
        alert("File backup non valido.");
      }
    };
    reader.readAsText(file);
  }

  let calendarInput = null;
  let calendarMonth = new Date();
  function bindDatePickers(){
    document.querySelectorAll('input[type="date"]').forEach(function(input){
      if (input.dataset.pms157DateBound === "1") return;
      input.dataset.pms157DateBound = "1";
      input.addEventListener("click", function(event){
        try { if (typeof input.showPicker === "function") input.showPicker(); }
        catch(error) { showCalendar(input); }
      });
      input.addEventListener("keydown", function(event){ if (event.key === "F4" || event.key === "ArrowDown") showCalendar(input); });
      const button = document.createElement("button");
      button.type = "button";
      button.className = "secondary-button pms157-date-btn";
      button.textContent = "Scegli";
      button.onclick = function(){ showCalendar(input); };
      if (input.parentElement && !input.parentElement.querySelector(".pms157-date-btn")) input.insertAdjacentElement("afterend", button);
    });
  }
  function showCalendar(input){
    calendarInput = input;
    calendarMonth = input.value ? new Date(input.value + "T12:00:00") : new Date();
    drawCalendar();
  }
  function drawCalendar(){
    let box = document.getElementById("pms157-calendar");
    if (!box) {
      box = document.createElement("div");
      box.id = "pms157-calendar";
      box.className = "pms157-calendar";
      document.body.appendChild(box);
    }
    if (!calendarInput) return;
    const selected = calendarInput.value;
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const first = new Date(year, month, 1);
    const start = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const names = ["L","M","M","G","V","S","D"];
    let cells = names.map(function(name){ return "<span>" + name + "</span>"; }).join("");
    for (let i = 0; i < start; i++) cells += "<span></span>";
    for (let day = 1; day <= days; day++) {
      const value = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
      cells += '<button type="button" class="' + (value === selected ? "active" : "") + '" data-pms157-day="' + value + '">' + day + '</button>';
    }
    box.innerHTML = '<div class="pms157-cal-head"><button type="button" data-pms157-prev>&lt;</button><strong>' + calendarMonth.toLocaleDateString("it-IT", {month:"long", year:"numeric"}) + '</strong><button type="button" data-pms157-next>&gt;</button></div><div class="pms157-cal-grid">' + cells + '</div>';
    const rect = calendarInput.getBoundingClientRect();
    box.style.left = Math.min(rect.left, window.innerWidth - 300) + "px";
    box.style.top = Math.min(rect.bottom + 6, window.innerHeight - 330) + "px";
    box.querySelector("[data-pms157-prev]").onclick = function(){ calendarMonth = new Date(year, month - 1, 1); drawCalendar(); };
    box.querySelector("[data-pms157-next]").onclick = function(){ calendarMonth = new Date(year, month + 1, 1); drawCalendar(); };
    box.querySelectorAll("[data-pms157-day]").forEach(function(button){
      button.onclick = function(){
        calendarInput.value = button.dataset.pms157Day;
        calendarInput.dispatchEvent(new Event("input", {bubbles:true}));
        calendarInput.dispatchEvent(new Event("change", {bubbles:true}));
        box.remove();
      };
    });
  }
  document.addEventListener("mousedown", function(event){
    const box = document.getElementById("pms157-calendar");
    if (!box) return;
    if (box.contains(event.target) || event.target === calendarInput || event.target.classList.contains("pms157-date-btn")) return;
    box.remove();
  }, true);

  function bindActions(){
    bindDatePickers();
    document.querySelectorAll("[data-pms157-new-deal]").forEach(function(button){ button.onclick = function(){ openDealModal(); }; });
    document.querySelectorAll("[data-pms157-edit-deal]").forEach(function(button){ button.onclick = function(){ openDealModal(button.dataset.pms157EditDeal); }; });
    document.querySelectorAll("[data-pms157-print-deal]").forEach(function(button){ button.onclick = function(){ printDeal(button.dataset.pms157PrintDeal); }; });
    document.querySelectorAll("[data-pms157-print-deals]").forEach(function(button){ button.onclick = printDeals; });
    document.querySelectorAll("[data-pms157-export-deals]").forEach(function(button){ button.onclick = exportDeals; });
    document.querySelectorAll("[data-pms157-search-deals]").forEach(function(input){ input.oninput = function(){ current.filters.deals157 = input.value; clearTimeout(window.__pms157DealSearch); window.__pms157DealSearch = setTimeout(render, 200); }; });
    document.querySelectorAll("[data-pms157-crm-tab]").forEach(function(button){ button.onclick = function(){ current.filters.crmTab157 = button.dataset.pms157CrmTab; render(); }; });
    document.querySelectorAll("[data-pms157-export-crm]").forEach(function(button){ button.onclick = exportCRM; });
    document.querySelectorAll("[data-pms157-export-backup]").forEach(function(button){ button.onclick = exportBackupClean; });
    document.querySelectorAll("[data-pms157-import-click]").forEach(function(button){ button.onclick = function(){ document.querySelector("[data-pms157-import-file]")?.click(); }; });
    document.querySelectorAll("[data-pms157-import-file]").forEach(function(input){ input.onchange = function(){ importBackupClean(input.files && input.files[0]); input.value = ""; }; });
  }

  const baseModulePrefix = typeof modulePrefix === "function" ? modulePrefix : null;
  if (baseModulePrefix && !modulePrefix.__pms157Wrapped) {
    modulePrefix = function(module){
      if (module === CRM_COMPANIES) return "CRM-AZ";
      if (module === CRM_OPPS) return "CRM-OP";
      if (module === CRM_ACTIVITIES) return "CRM-AT";
      return baseModulePrefix.apply(this, arguments);
    };
    modulePrefix.__pms157Wrapped = true;
  }
  const baseOpenModal = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal && !openModal.__pms157Wrapped) {
    openModal = function(){
      const result = baseOpenModal.apply(this, arguments);
      setTimeout(bindDatePickers, 0);
      setTimeout(bindDatePickers, 80);
      return result;
    };
    openModal.__pms157Wrapped = true;
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !renderNav.__pms157Wrapped) {
    renderNav = function(){
      ensureData(); injectStyle(); removeUnusedModules();
      const result = baseRenderNav.apply(this, arguments);
      document.querySelectorAll('#nav .nav-button[data-page="admin"],#nav .nav-button[data-page="approvals"]').forEach(function(button){ button.remove(); });
      return result;
    };
    renderNav.__pms157Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !render.__pms157Wrapped) {
    render = function(){
      ensureData(); injectStyle(); removeUnusedModules();
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (current.page === "admin" || current.page === "approvals") current.page = "settings";
      if (current.page === DEALS && content) {
        if (title) title.textContent = "Trattative in corso";
        if (subtitle) subtitle.textContent = "Prezzo attuale, target price e storico negoziazioni";
        content.innerHTML = renderDeals();
        if (typeof bindPageActions === "function") bindPageActions();
        bindActions();
        return;
      }
      if (current.page === CRM && content) {
        if (title) title.textContent = "CRM Commerciale";
        if (subtitle) subtitle.textContent = "Aziende, opportunita, follow-up e comunicazioni";
        content.innerHTML = renderCRM();
        if (typeof bindPageActions === "function") bindPageActions();
        bindActions();
        return;
      }
      if (current.page === "settings" && content) {
        if (title) title.textContent = "Backup";
        if (subtitle) subtitle.textContent = "Importa ed esporta il backup del gestionale";
        content.innerHTML = renderSettingsClean();
        bindActions();
        return;
      }
      const output = baseRender.apply(this, arguments);
      bindActions();
      return output;
    };
    render.__pms157Wrapped = true;
  }
  const baseBindPageActions = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBindPageActions && !bindPageActions.__pms157Wrapped) {
    bindPageActions = function(){
      const result = baseBindPageActions.apply(this, arguments);
      bindActions();
      return result;
    };
    bindPageActions.__pms157Wrapped = true;
  }

  ensureData();
  injectStyle();
  removeUnusedModules();
  try { if (typeof save === "function") save(); } catch(error) {}
  try { if (typeof renderNav === "function") renderNav(); if (typeof render === "function") render(); } catch(error) { console.warn(VERSION, error); }
  window.pmsV157 = {version: VERSION, bindDatePickers: bindDatePickers};
  console.info(VERSION + " loaded");
})();
