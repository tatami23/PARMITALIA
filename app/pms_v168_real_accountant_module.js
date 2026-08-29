(function(){
  "use strict";

  const VERSION = "pms_v168_real_accountant_module";
  const MODULE = "accountant";
  const STATUS = ["Da fare", "Parziale", "Completo", "Inviato", "Non applicabile"];
  const CHECKS = [
    { key:"issuedInvoicesStatus", label:"Fatture emesse", docTypes:["Fattura", "Proforma"], hint:"Fatture attive, proforme e documenti vendite del mese." },
    { key:"receivedInvoicesStatus", label:"Fatture ricevute", docTypes:["Fattura"], hint:"Fatture passive fornitori, servizi, consulenze, logistica." },
    { key:"bankStatementsStatus", label:"Estratti conto banca", docTypes:["Pagamento"], hint:"Estratti bancari, ricevute bonifici, movimenti e incassi." },
    { key:"paymentsStatus", label:"Pagamenti e incassi", docTypes:["Pagamento"], hint:"Bonifici, saldi, acconti, garanzie, ricevute." },
    { key:"contractsStatus", label:"Contratti e mandati", docTypes:["Contratto"], hint:"Contratti, mandati, NDA, accordi provvigionali." },
    { key:"logisticsStatus", label:"Documenti logistici", docTypes:["Packing List", "Trasporto"], hint:"Packing list, CMR, documenti trasporto e consegna." },
    { key:"payrollStatus", label:"Paghe / dipendenti", docTypes:["Identita / personale"], hint:"Documenti dipendenti, candidati, paghe, pratiche personale." },
    { key:"taxNotesStatus", label:"Note fiscali e varie", docTypes:["Altro", "Email / Comunicazione"], hint:"Note per il commercialista e comunicazioni da conservare." }
  ];

  function esc(value){
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function st(){
    window.state = window.state || {};
    state.accountant = Array.isArray(state.accountant) ? state.accountant : [];
    state.documents = Array.isArray(state.documents) ? state.documents : [];
    state.payments = Array.isArray(state.payments) ? state.payments : [];
    state.banks = Array.isArray(state.banks) ? state.banks : [];
    window.current = window.current || { filters:{} };
    current.filters = current.filters || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      localStorage.setItem(typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "parmitalia-management-state", JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Impossibile salvare il modulo commercialista.");
      return false;
    }
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function currentMonth(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }
  function nextMonthDue(month){
    const parts = String(month || currentMonth()).split("-");
    const y = Number(parts[0]) || new Date().getFullYear();
    const m = Number(parts[1]) || (new Date().getMonth() + 1);
    const d = new Date(y, m, 5);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-05";
  }
  function fmtMonth(month){
    const parts = String(month || "").split("-");
    if (parts.length !== 2) return month || "-";
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    return d.toLocaleDateString("it-IT", { month:"long", year:"numeric" });
  }
  function docType(doc){
    return doc.category || doc.genre || doc.docType || "Altro";
  }
  function docMonth(doc){
    const date = String(doc.date || doc.importedAt || "");
    return date.slice(0, 7);
  }
  function periodDocs(month){
    return st().documents.filter(function(doc){ return docMonth(doc) === month; });
  }
  function docsForCheck(month, check){
    const types = new Set(check.docTypes);
    return periodDocs(month).filter(function(doc){ return types.has(docType(doc)); });
  }
  function money(value, currency){
    const n = Number(value || 0);
    const c = currency || "EUR";
    if (typeof formatMoney === "function") return formatMoney(n, c);
    return c + " " + n.toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function recordMonth(record){
    return record.month || record.period || String(record.dueDate || "").slice(0, 7) || currentMonth();
  }
  function ensureRecord(month){
    st();
    const target = month || current.filters.accountantMonth || currentMonth();
    let record = state.accountant.find(function(item){ return recordMonth(item) === target; });
    if (!record) {
      record = {
        id: "ACC-" + target,
        month: target,
        dueDate: nextMonthDue(target),
        issuedInvoicesStatus: "Da fare",
        receivedInvoicesStatus: "Da fare",
        bankStatementsStatus: "Da fare",
        paymentsStatus: "Da fare",
        contractsStatus: "Da fare",
        logisticsStatus: "Da fare",
        payrollStatus: "Da fare",
        taxNotesStatus: "Da fare",
        responsible: "Assistente",
        accountantEmail: (state.settings && (state.settings.accountantEmail || state.settings.pecEmail)) || "",
        status: "Da fare",
        notes: ""
      };
      state.accountant.unshift(record);
      saveNow();
    }
    current.filters.accountantMonth = target;
    return record;
  }
  function allMonths(){
    st();
    const set = new Set([currentMonth()]);
    state.accountant.forEach(function(record){ set.add(recordMonth(record)); });
    state.documents.forEach(function(doc){ if (docMonth(doc)) set.add(docMonth(doc)); });
    return Array.from(set).sort().reverse();
  }
  function statusClass(status){
    if (status === "Completo" || status === "Inviato") return "success";
    if (status === "Parziale") return "warn";
    if (status === "Non applicabile") return "neutral";
    return "danger";
  }
  function badge168(text, kind){
    if (typeof badge === "function") return badge(text, kind);
    return '<span class="badge ' + esc(kind || "neutral") + '">' + esc(text) + '</span>';
  }
  function calculateProgress(record){
    const values = CHECKS.map(function(check){ return record[check.key] || "Da fare"; });
    const done = values.filter(function(v){ return v === "Completo" || v === "Inviato" || v === "Non applicabile"; }).length;
    return Math.round(done / CHECKS.length * 100);
  }
  function missingList(record, month){
    return CHECKS.filter(function(check){
      const value = record[check.key] || "Da fare";
      return value !== "Completo" && value !== "Inviato" && value !== "Non applicabile";
    }).map(function(check){
      const count = docsForCheck(month, check).length;
      return check.label + (count ? " (" + count + " documento/i presenti, da verificare)" : "");
    });
  }
  function updateOverall(record){
    const progress = calculateProgress(record);
    const missing = missingList(record, recordMonth(record));
    record.progress = progress;
    record.missingDocs = missing.join("; ");
    record.status = record.sentAt ? "Inviato" : (progress >= 100 ? "Completo" : progress > 0 ? "Parziale" : "Da fare");
    return record;
  }
  function summarizeMonth(month){
    const docs = periodDocs(month);
    const payments = (st().payments || []).filter(function(pay){
      const date = String(pay.dueDate || pay.paymentDate || pay.date || "");
      return date.slice(0, 7) === month;
    });
    const totals = payments.reduce(function(acc, pay){
      const c = pay.currency || "EUR";
      acc[c] = (acc[c] || 0) + Number(pay.amount || 0);
      return acc;
    }, {});
    return {
      docs: docs,
      docsCount: docs.length,
      issuedCount: docs.filter(function(doc){ return docType(doc) === "Fattura" && /emess|attiv|cliente|sales|out/i.test(JSON.stringify(doc)); }).length,
      passiveCount: docs.filter(function(doc){ return docType(doc) === "Fattura"; }).length,
      payments: payments,
      paymentTotals: Object.keys(totals).map(function(c){ return money(totals[c], c); }).join(" | ") || money(0, "EUR")
    };
  }
  function statusSelect(record, check){
    const value = record[check.key] || "Da fare";
    return '<select class="pms168-status-select" data-pms168-status="' + esc(check.key) + '">' +
      STATUS.map(function(item){ return '<option value="' + esc(item) + '" ' + (item === value ? "selected" : "") + '>' + esc(item) + '</option>'; }).join("") +
    '</select>';
  }
  function renderChecklist(record, month){
    return CHECKS.map(function(check){
      const docs = docsForCheck(month, check);
      const value = record[check.key] || "Da fare";
      return '<div class="pms168-check">' +
        '<div><strong>' + esc(check.label) + '</strong><p>' + esc(check.hint) + '</p></div>' +
        '<div class="pms168-check-meta">' + badge168(value, statusClass(value)) + '<span>' + docs.length + ' doc</span></div>' +
        statusSelect(record, check) +
      '</div>';
    }).join("");
  }
  function renderMonthTabs(month){
    return allMonths().map(function(item){
      return '<button type="button" class="pms168-month-tab ' + (item === month ? "active" : "") + '" data-pms168-month="' + esc(item) + '">' + esc(fmtMonth(item)) + '</button>';
    }).join("");
  }
  function renderDocsTable(month){
    const docs = periodDocs(month);
    const rows = docs.map(function(doc){
      return '<tr>' +
        '<td><span class="code-block">' + esc(doc.id || "") + '</span></td>' +
        '<td><strong>' + esc(docType(doc)) + '</strong><br><small>' + esc(doc.fileExtension || doc.mimeType || "") + '</small></td>' +
        '<td>' + esc(doc.fileName || "-") + '<br><small>' + esc(doc.fileSizeText || "") + '</small></td>' +
        '<td>' + esc(doc.linkedCode || "-") + '</td>' +
        '<td>' + esc(doc.date || "-") + '</td>' +
      '</tr>';
    }).join("");
    return '<div class="table-wrap"><table><thead><tr><th>Codice</th><th>Tipo</th><th>File</th><th>Collegato</th><th>Data</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5" class="empty">Nessun documento archiviato per questo mese.</td></tr>') + '</tbody></table></div>';
  }
  function renderAccountantModule(){
    st();
    const month = current.filters.accountantMonth || currentMonth();
    const record = updateOverall(ensureRecord(month));
    const summary = summarizeMonth(month);
    const missing = missingList(record, month);
    const progress = calculateProgress(record);
    saveNow();
    return '<div class="pms168-accountant">' +
      '<section class="pms168-hero">' +
        '<div><span>Commercialista</span><h3>Pacchetto contabile ' + esc(fmtMonth(month)) + '</h3><p>Controllo mensile dei documenti da preparare, inviare e conservare.</p></div>' +
        '<div class="pms168-actions"><button type="button" class="primary-button" data-pms168-new-month>Nuovo mese</button><button type="button" class="secondary-button" data-pms168-print>Stampa pacchetto</button><button type="button" class="secondary-button" data-pms168-export>Excel</button></div>' +
      '</section>' +
      '<div class="pms168-tabs">' + renderMonthTabs(month) + '</div>' +
      '<div class="pms168-kpis">' +
        '<div><span>Avanzamento</span><strong>' + progress + '%</strong><em>' + esc(record.status || "Da fare") + '</em></div>' +
        '<div><span>Documenti mese</span><strong>' + summary.docsCount + '</strong><em>da archivio documenti</em></div>' +
        '<div><span>Scadenza invio</span><strong>' + esc(record.dueDate || "-") + '</strong><em>commercialista</em></div>' +
        '<div><span>Pagamenti mese</span><strong>' + esc(summary.payments.length) + '</strong><em>' + esc(summary.paymentTotals) + '</em></div>' +
      '</div>' +
      '<section class="pms168-panel">' +
        '<div class="pms168-panel-head"><div><span>Checklist reale</span><h4>Documenti da preparare</h4></div><button type="button" class="secondary-button" data-nav="documents">Apri archivio documenti</button></div>' +
        '<div class="pms168-check-grid">' + renderChecklist(record, month) + '</div>' +
      '</section>' +
      '<section class="pms168-panel pms168-form">' +
        '<div class="pms168-panel-head"><div><span>Dati invio</span><h4>Commercialista e note mese</h4></div><button type="button" class="primary-button" data-pms168-save>Salva</button></div>' +
        '<div class="pms168-fields">' +
          '<label><span>Mese</span><input name="month" value="' + esc(month) + '" data-pms168-field="month"></label>' +
          '<label><span>Scadenza invio</span><input type="date" name="dueDate" value="' + esc(record.dueDate || "") + '" data-pms168-field="dueDate"></label>' +
          '<label><span>Email commercialista</span><input type="email" name="accountantEmail" value="' + esc(record.accountantEmail || "") + '" data-pms168-field="accountantEmail"></label>' +
          '<label><span>Responsabile</span><input name="responsible" value="' + esc(record.responsible || "") + '" data-pms168-field="responsible"></label>' +
          '<label class="wide"><span>Note per il commercialista</span><textarea data-pms168-field="notes">' + esc(record.notes || "") + '</textarea></label>' +
          '<label class="wide"><span>Documenti mancanti</span><textarea readonly>' + esc(missing.join("\\n") || "Nessun documento mancante.") + '</textarea></label>' +
        '</div>' +
        '<div class="pms168-actions bottom"><button type="button" class="secondary-button" data-pms168-mark-sent>Segna inviato</button><button type="button" class="secondary-button" data-add="accountant">Apri scheda classica</button></div>' +
      '</section>' +
      '<section class="pms168-panel">' +
        '<div class="pms168-panel-head"><div><span>Documenti collegati</span><h4>Archivio documenti del mese</h4></div></div>' +
        renderDocsTable(month) +
      '</section>' +
    '</div>';
  }
  function selectedRecord(){
    return ensureRecord(current.filters.accountantMonth || currentMonth());
  }
  function bindAccountant(){
    document.querySelectorAll("[data-pms168-month]").forEach(function(btn){
      btn.onclick = function(){
        current.filters.accountantMonth = btn.getAttribute("data-pms168-month") || currentMonth();
        if (typeof render === "function") render();
      };
    });
    document.querySelectorAll("[data-pms168-status]").forEach(function(select){
      select.onchange = function(){
        const record = selectedRecord();
        record[select.getAttribute("data-pms168-status")] = select.value;
        updateOverall(record);
        saveNow();
        if (typeof render === "function") render();
      };
    });
    document.querySelectorAll("[data-pms168-field]").forEach(function(field){
      field.onchange = function(){
        const record = selectedRecord();
        const key = field.getAttribute("data-pms168-field");
        record[key] = field.value;
        if (key === "month") current.filters.accountantMonth = field.value || currentMonth();
        updateOverall(record);
        saveNow();
      };
    });
    const saveBtn = document.querySelector("[data-pms168-save]");
    if (saveBtn) saveBtn.onclick = function(){ updateOverall(selectedRecord()); saveNow(); alert("Modulo commercialista salvato."); if (typeof render === "function") render(); };
    const newBtn = document.querySelector("[data-pms168-new-month]");
    if (newBtn) newBtn.onclick = function(){
      const value = prompt("Inserisci mese contabile nel formato YYYY-MM", currentMonth());
      if (!value) return;
      current.filters.accountantMonth = value;
      ensureRecord(value);
      saveNow();
      if (typeof render === "function") render();
    };
    const sentBtn = document.querySelector("[data-pms168-mark-sent]");
    if (sentBtn) sentBtn.onclick = function(){
      const record = selectedRecord();
      CHECKS.forEach(function(check){ if ((record[check.key] || "Da fare") !== "Non applicabile") record[check.key] = "Inviato"; });
      record.sentAt = new Date().toISOString();
      updateOverall(record);
      saveNow();
      if (typeof render === "function") render();
    };
    const printBtn = document.querySelector("[data-pms168-print]");
    if (printBtn) printBtn.onclick = printPackage;
    const exportBtn = document.querySelector("[data-pms168-export]");
    if (exportBtn) exportBtn.onclick = exportPackage;
  }
  function packageRows(){
    const record = updateOverall(selectedRecord());
    const month = recordMonth(record);
    const rows = [
      ["Mese", fmtMonth(month)],
      ["Scadenza invio", record.dueDate || ""],
      ["Stato", record.status || ""],
      ["Avanzamento", calculateProgress(record) + "%"],
      ["Responsabile", record.responsible || ""],
      ["Email commercialista", record.accountantEmail || ""],
      ["Documenti mancanti", record.missingDocs || ""],
      ["Note", record.notes || ""]
    ];
    CHECKS.forEach(function(check){ rows.push([check.label, record[check.key] || "Da fare"]); });
    periodDocs(month).forEach(function(doc){ rows.push(["Documento", [doc.id, docType(doc), doc.fileName, doc.date, doc.linkedCode].filter(Boolean).join(" | ")]); });
    return rows;
  }
  function printPackage(){
    const rows = packageRows();
    const html = '<div class="print-document"><div class="print-header"><div><h1>Pacchetto commercialista</h1><strong>Parmitalia Distribution</strong></div><div class="print-meta">' + esc(today()) + '</div></div><table class="print-table">' + rows.map(function(row){ return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1]) + '</td></tr>'; }).join("") + '</table><div class="print-footer">Generato da Parmitalia Management System</div></div>';
    if (typeof openPrint === "function") openPrint(html);
    else { const root = document.getElementById("print-root"); if (root) root.innerHTML = html; window.print(); }
  }
  function exportPackage(){
    const rows = packageRows();
    const table = '<html><head><meta charset="utf-8"></head><body><table border="1">' + rows.map(function(row){ return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1]) + '</td></tr>'; }).join("") + '</table></body></html>';
    const blob = new Blob([table], { type:"application/vnd.ms-excel;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "commercialista-" + (current.filters.accountantMonth || currentMonth()) + ".xls";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 300);
  }
  function patchSchemas(){
    if (!window.schemas) return;
    schemas.accountant = schemas.accountant || { title:"Pacchetto commercialista", fields:[] };
    schemas.accountant.title = "Pacchetto commercialista";
    schemas.accountant.fields = [
      { key:"month", label:"Mese contabile", type:"month", required:true },
      { key:"dueDate", label:"Scadenza invio", type:"date" },
      { key:"issuedInvoicesStatus", label:"Fatture emesse", type:"select", options:STATUS },
      { key:"receivedInvoicesStatus", label:"Fatture ricevute", type:"select", options:STATUS },
      { key:"bankStatementsStatus", label:"Estratti conto", type:"select", options:STATUS },
      { key:"paymentsStatus", label:"Pagamenti/incassi", type:"select", options:STATUS },
      { key:"contractsStatus", label:"Contratti/mandati", type:"select", options:STATUS },
      { key:"logisticsStatus", label:"Documenti logistici", type:"select", options:STATUS },
      { key:"payrollStatus", label:"Paghe/dipendenti", type:"select", options:STATUS },
      { key:"taxNotesStatus", label:"Note fiscali varie", type:"select", options:STATUS },
      { key:"accountantEmail", label:"Email commercialista", type:"email" },
      { key:"responsible", label:"Responsabile interno", type:"text" },
      { key:"status", label:"Stato pacchetto", type:"select", options:STATUS },
      { key:"missingDocs", label:"Documenti mancanti", type:"textarea", full:true },
      { key:"notes", label:"Note", type:"textarea", full:true }
    ];
  }
  function injectCss(){
    let style = document.getElementById("pms-v168-real-accountant-module-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v168-real-accountant-module-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms168-accountant{display:grid;gap:14px;color:#17242b}
      .pms168-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.13));border:1px solid #dfe9e4;border-radius:8px;padding:16px;box-shadow:0 5px 18px rgba(30,45,60,.06)}
      .pms168-hero span,.pms168-panel-head span{font-size:11px;font-weight:950;text-transform:uppercase;color:#3f6b50}
      .pms168-hero h3,.pms168-panel h4{margin:2px 0 4px;text-transform:uppercase;color:#17242b}
      .pms168-hero p{margin:0;color:#52606d;font-size:13px}
      .pms168-actions{display:flex;gap:8px;flex-wrap:wrap}
      .pms168-actions button{width:auto!important;margin:0!important}
      .pms168-tabs{display:flex;gap:7px;overflow:auto;padding-bottom:2px}
      .pms168-month-tab{flex:0 0 auto;border:1px solid #dfe9e4;background:#fff;border-radius:8px;padding:8px 11px;font-weight:900;cursor:pointer}
      .pms168-month-tab.active,.pms168-month-tab:hover{border-color:rgba(95,143,109,.5);background:linear-gradient(90deg,rgba(95,143,109,.16),#fff,rgba(189,122,120,.12))}
      .pms168-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .pms168-kpis div{background:#fff;border:1px solid #dfe9e4;border-radius:8px;padding:12px;box-shadow:0 3px 12px rgba(30,45,60,.045)}
      .pms168-kpis span{display:block;font-size:11px;text-transform:uppercase;font-weight:950;color:#52606d}
      .pms168-kpis strong{display:block;font-size:22px;margin:4px 0;color:#17242b}
      .pms168-kpis em{display:block;font-size:11px;color:#64748b;font-style:normal}
      .pms168-panel{background:#fff;border:1px solid #dfe9e4;border-radius:8px;padding:14px;box-shadow:0 3px 12px rgba(30,45,60,.045)}
      .pms168-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
      .pms168-panel-head button{width:auto!important;margin:0!important}
      .pms168-check-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .pms168-check{display:grid;grid-template-columns:minmax(0,1fr) auto 150px;align-items:center;gap:10px;border:1px solid #edf1f4;border-radius:8px;padding:10px;background:#fbfcfd}
      .pms168-check strong{display:block;font-size:13px}
      .pms168-check p{margin:2px 0 0;color:#64748b;font-size:11px;line-height:1.3}
      .pms168-check-meta{display:grid;gap:4px;justify-items:end;font-size:11px;color:#64748b}
      .pms168-status-select{height:34px;border-radius:8px;border:1px solid #dfe9e4;background:#fff;font-weight:900}
      .pms168-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .pms168-fields label{display:grid;gap:5px;font-size:12px;font-weight:900;color:#52606d}
      .pms168-fields label.wide{grid-column:1/-1}
      .pms168-fields input,.pms168-fields textarea{width:100%;min-width:0}
      .pms168-fields textarea{min-height:84px}
      .pms168-actions.bottom{margin-top:12px}
      @media(max-width:1040px){.pms168-kpis,.pms168-check-grid{grid-template-columns:1fr 1fr}.pms168-check{grid-template-columns:1fr}}
      @media(max-width:760px){.pms168-hero,.pms168-panel-head{display:grid}.pms168-kpis,.pms168-check-grid,.pms168-fields{grid-template-columns:1fr}}
    `;
  }
  function wrapRender(){
    if (typeof render !== "function" || render.pms168Wrapped) return;
    const base = render;
    render = function(){
      if (window.current && current.page === MODULE) {
        const content = document.getElementById("content");
        if (!content) return base.apply(this, arguments);
        patchSchemas();
        injectCss();
        content.innerHTML = renderAccountantModule();
        if (typeof bindPageActions === "function") bindPageActions();
        bindAccountant();
        return;
      }
      return base.apply(this, arguments);
    };
    render.pms168Wrapped = true;
    window.render = render;
  }
  function install(){
    st();
    patchSchemas();
    injectCss();
    ensureRecord(current.filters.accountantMonth || currentMonth());
    wrapRender();
    if (window.current && current.page === MODULE && typeof render === "function") render();
    window.PMS_V168_REAL_ACCOUNTANT_MODULE = { version: VERSION };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
