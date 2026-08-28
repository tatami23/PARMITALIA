(function(){
  "use strict";
  const VERSION = "PMS-V102-SIMPLIFY-MODULES";
  const HIDDEN = new Set(["operativo","cryptoMonitor","admin"]);

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function next(prefix,list,field){
    const y = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + y + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String((field && x[field]) || x.protocol || x.code || x.id || "").match(re);
      return m ? Math.max(a, Number(m[1])) : a;
    },0);
    return prefix + "-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code);
    if (typeof renderQrLite === "function") return renderQrLite(code);
    return '<strong>' + esc(code) + '</strong>';
  }
  function printHeader(title,code,sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    const s = state.settings || {};
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(s.address || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.professionalTranslations = arr(state.professionalTranslations);
    state.officialDocuments = arr(state.officialDocuments || state.officialCommunications);
    state.officialCommunications = state.officialDocuments;
    state.accountantDocuments = arr(state.accountantDocuments);
    state.accountantDossiers = arr(state.accountantDossiers);
    state.accountantActions = arr(state.accountantActions);
    state.documents = arr(state.documents);
    state.orders = arr(state.orders);
    state.outgoingInvoices = arr(state.outgoingInvoices);
    state.incomingInvoices = arr(state.incomingInvoices);
    if (typeof modules !== "undefined") {
      modules.forEach(m => {
        if (HIDDEN.has(m.id)) m.roles = [];
        if (m.id === "communications") { m.label = "Traduttore professionale"; m.subtitle = "Traduzione professionale IT, EN, RO, AR senza IA"; }
        if (m.id === "officialCommunications") { m.label = "Documenti protocollati"; m.subtitle = "Scrittura libera, protocollo, barcode, vidimazione e stampe"; }
        if (m.id === "accountant") { m.label = "Commercialista"; m.subtitle = "Documenti, dossier automatico e invio a Sorina Popescu"; }
      });
    }
  }
  function css(){
    if (document.getElementById("pms-v102-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v102-style";
    s.textContent = ".pms102-page{display:grid;gap:14px}.pms102-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}.pms102-hero h3{margin:2px 0 6px;color:#fff}.pms102-hero p{margin:0;color:#dbeafe}.pms102-actions{display:flex;gap:8px;flex-wrap:wrap}.pms102-actions button{width:auto!important;margin:0!important}.pms102-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pms102-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.pms102-form .half{grid-column:span 2}.pms102-form .full{grid-column:1/-1}.pms102-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms102-form textarea{min-height:190px;line-height:1.55}.pms102-muted{color:var(--muted);font-size:12px;line-height:1.45}.pms102-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.pms102-kpi{border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:12px}.pms102-kpi span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.pms102-kpi strong{display:block;font-size:22px;margin-top:6px;color:#0f2f4a}.pms102-doc-body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.55;white-space:pre-wrap}.pms102-stamp{display:inline-block;border:2px solid #1f4e78;color:#1f4e78;padding:4mm 7mm;font-weight:900;text-transform:uppercase;letter-spacing:0}.pms102-tag{display:inline-flex;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:900;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe}@media(max-width:900px){.pms102-hero{display:grid}.pms102-form{grid-template-columns:1fr}.pms102-form .half{grid-column:1/-1}}@media print{@page{size:A4;margin:10mm}#print-root .pms102-print{min-height:0!important;height:auto!important;font-size:10pt!important;line-height:1.3!important;page-break-after:avoid!important;break-after:avoid!important}.pms102-no-print{display:none!important}}";
    document.head.appendChild(s);
  }
  function removeHiddenNav(){
    HIDDEN.forEach(id => document.querySelectorAll('[data-page="' + id + '"]').forEach(el => el.remove()));
    document.querySelectorAll(".nav-group").forEach(g => { if (!g.querySelector(".nav-button")) g.remove(); });
  }

  const gloss = {
    "it>en":{"buongiorno":"good morning","cliente":"client","fornitore":"supplier","ordine":"order","fattura":"invoice","pagamento":"payment","consegna":"delivery","merce":"goods","prezzo":"price","quantita":"quantity","documenti":"documents","cordiali saluti":"kind regards"},
    "it>ro":{"buongiorno":"buna ziua","cliente":"client","fornitore":"furnizor","ordine":"comanda","fattura":"factura","pagamento":"plata","consegna":"livrare","merce":"marfa","prezzo":"pret","quantita":"cantitate","documenti":"documente","cordiali saluti":"cu stima"},
    "en>it":{"good morning":"buongiorno","client":"cliente","supplier":"fornitore","order":"ordine","invoice":"fattura","payment":"pagamento","delivery":"consegna","goods":"merce","price":"prezzo","quantity":"quantita","documents":"documenti","kind regards":"cordiali saluti"},
    "ro>it":{"buna ziua":"buongiorno","client":"cliente","furnizor":"fornitore","comanda":"ordine","factura":"fattura","plata":"pagamento","livrare":"consegna","marfa":"merce","pret":"prezzo","cantitate":"quantita","documente":"documenti","cu stima":"cordiali saluti"}
  };
  function translateText(text,from,to){
    let out = String(text || "");
    const map = gloss[String(from).toLowerCase() + ">" + String(to).toLowerCase()] || {};
    Object.keys(map).sort((a,b)=>b.length-a.length).forEach(k => {
      out = out.replace(new RegExp("\\b" + k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&") + "\\b","gi"), m => {
        const repl = map[k];
        return m[0] === m[0].toUpperCase() ? repl.charAt(0).toUpperCase() + repl.slice(1) : repl;
      });
    });
    return out;
  }
  function renderTranslator(){
    const rows = state.professionalTranslations.slice(0,20).map(x => '<tr><td>' + esc(x.date) + '</td><td>' + esc(x.from) + ' -> ' + esc(x.to) + '</td><td>' + esc(x.subject || '-') + '</td><td><button class="inline-button" data-pms102-load-translation="' + esc(x.id) + '">Apri</button></td></tr>').join("");
    return '<div class="pms102-page"><section class="pms102-hero"><div><span>TRAD</span><h3>Traduttore professionale</h3><p>Traduzione operativa in italiano, inglese, romeno e arabo. Nessuna funzione IA, nessuna generazione automatica di testi.</p></div><div class="pms102-actions"><button class="primary-button" data-pms102-translate>Traduci</button><button class="secondary-button" data-pms102-save-translation>Salva traduzione</button></div></section><div class="pms102-card"><div class="pms102-form"><label>Da<select id="pms102-tr-from"><option value="it">Italiano</option><option value="en">English</option><option value="ro">Romana</option><option value="ar">Arabic</option></select></label><label>A<select id="pms102-tr-to"><option value="en">English</option><option value="it">Italiano</option><option value="ro">Romana</option><option value="ar">Arabic</option></select></label><label class="half">Oggetto<input id="pms102-tr-subject"></label><label class="full">Testo originale<textarea id="pms102-tr-input"></textarea></label><label class="full">Traduzione<textarea id="pms102-tr-output"></textarea></label></div></div><div class="pms102-card"><h4>Archivio traduzioni</h4><div class="table-wrap"><table><thead><tr><th>Data</th><th>Lingue</th><th>Oggetto</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="4">Nessuna traduzione salvata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function runTranslate(){ const from = document.getElementById("pms102-tr-from")?.value || "it"; const to = document.getElementById("pms102-tr-to")?.value || "en"; const input = document.getElementById("pms102-tr-input")?.value || ""; document.getElementById("pms102-tr-output").value = translateText(input,from,to); }
  function saveTranslation(){ const item = {id:next("TRD",state.professionalTranslations),date:new Date().toISOString(),from:document.getElementById("pms102-tr-from")?.value || "it",to:document.getElementById("pms102-tr-to")?.value || "en",subject:document.getElementById("pms102-tr-subject")?.value || "",input:document.getElementById("pms102-tr-input")?.value || "",output:document.getElementById("pms102-tr-output")?.value || ""}; state.professionalTranslations.unshift(item); saveState(); render(); }
  function loadTranslation(id){ const x = state.professionalTranslations.find(r => r.id === id); if (!x) return; document.getElementById("pms102-tr-from").value = x.from || "it"; document.getElementById("pms102-tr-to").value = x.to || "en"; document.getElementById("pms102-tr-subject").value = x.subject || ""; document.getElementById("pms102-tr-input").value = x.input || ""; document.getElementById("pms102-tr-output").value = x.output || ""; }

  function docPrintHtml(doc,kind){
    const code = doc.protocol || doc.id;
    const stamp = kind === "vidimazione" ? '<div style="margin:6mm 0"><span class="pms102-stamp">Vidimato</span></div>' : "";
    return '<div class="print-document pms102-print">' + printHeader(doc.docType || "Documento protocollato",code,"Documento ufficiale Parmitalia") + '<table class="print-table"><tr><th>Destinatario</th><td>' + esc(doc.recipient || "-") + '</td><th>Data</th><td>' + esc(doc.date || today()) + '</td></tr><tr><th>Oggetto</th><td colspan="3">' + esc(doc.subject || "-") + '</td></tr><tr><th>Tipo stampa</th><td colspan="3">' + esc(kind || "documento") + '</td></tr></table>' + stamp + '<div class="pms102-doc-body">' + esc(doc.body || "-") + '</div><div style="margin-top:10mm;white-space:pre-wrap">' + esc(doc.closing || "") + '</div><div style="margin-top:7mm">' + barcode(code) + '</div><div class="print-footer">Protocollo ' + esc(code) + ' - barcode archivio - ' + esc(state.settings?.legalName || "Parmitalia") + '</div></div>';
  }
  function renderOfficialDocs(){
    const rows = state.officialDocuments.map(d => '<tr><td><span class="code-block">' + esc(d.protocol || d.id) + '</span></td><td><strong>' + esc(d.subject || "-") + '</strong><br><small>' + esc(d.docType || "Documento libero") + '</small></td><td>' + esc(d.recipient || "-") + '</td><td>' + esc(d.date || "") + '</td><td><button class="inline-button" data-pms102-doc-load="' + esc(d.id || d.protocol) + '">Apri</button><button class="inline-button" data-pms102-doc-print="' + esc(d.id || d.protocol) + '" data-kind="documento">Stampa</button><button class="inline-button" data-pms102-doc-print="' + esc(d.id || d.protocol) + '" data-kind="vidimazione">Vidimazione</button></td></tr>').join("");
    return '<div class="pms102-page"><section class="pms102-hero"><div><span>DOC</span><h3>Documenti protocollati</h3><p>Scrittura libera con protocollo automatico, codice a barre, carta intestata e vidimazione.</p></div><div class="pms102-actions"><button class="primary-button" data-pms102-doc-save>Salva documento</button><button class="secondary-button" data-pms102-doc-preview>Anteprima</button></div></section><div class="pms102-card"><div class="pms102-form"><label>Protocollo<input id="pms102-doc-protocol" value="' + esc(next("DOCU",state.officialDocuments)) + '" readonly></label><label>Data<input id="pms102-doc-date" type="date" value="' + esc(today()) + '"></label><label>Tipo documento<select id="pms102-doc-type"><option>Comunicazione ufficiale</option><option>Dichiarazione</option><option>Diffida</option><option>Verbale</option><option>Lettera commerciale</option><option>Documento libero</option></select></label><label>Lingua<select id="pms102-doc-lang"><option>IT</option><option>EN</option><option>RO</option><option>AR</option></select></label><label class="full">Destinatario<input id="pms102-doc-recipient"></label><label class="full">Oggetto<input id="pms102-doc-subject"></label><label class="full">Testo libero<textarea id="pms102-doc-body"></textarea></label><label class="full">Firma / chiusura<textarea id="pms102-doc-closing" style="min-height:75px">Parmitalia Distribution SRL</textarea></label></div></div><div class="pms102-card"><h4>Archivio documenti protocollati</h4><div class="table-wrap"><table><thead><tr><th>Protocollo</th><th>Documento</th><th>Destinatario</th><th>Data</th><th>Stampe</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Nessun documento protocollato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function readDoc(){ return {id:document.getElementById("pms102-doc-protocol")?.value || next("DOCU",state.officialDocuments),protocol:document.getElementById("pms102-doc-protocol")?.value || "",date:document.getElementById("pms102-doc-date")?.value || today(),docType:document.getElementById("pms102-doc-type")?.value || "Documento libero",language:document.getElementById("pms102-doc-lang")?.value || "IT",recipient:document.getElementById("pms102-doc-recipient")?.value || "",subject:document.getElementById("pms102-doc-subject")?.value || "",body:document.getElementById("pms102-doc-body")?.value || "",closing:document.getElementById("pms102-doc-closing")?.value || "",createdAt:new Date().toISOString()}; }
  function saveDoc(preview){ const d = readDoc(); if (!preview) { const idx = state.officialDocuments.findIndex(x => x.id === d.id || x.protocol === d.protocol); if (idx >= 0) state.officialDocuments[idx] = Object.assign({},state.officialDocuments[idx],d,{updatedAt:new Date().toISOString()}); else state.officialDocuments.unshift(d); saveState(); } openPrint(docPrintHtml(d, preview ? "anteprima" : "documento")); if (!preview) render(); }
  function loadDoc(id){ const d = state.officialDocuments.find(x => x.id === id || x.protocol === id); if (!d) return; const map = {protocol:"protocol",date:"date",type:"docType",lang:"language",recipient:"recipient",subject:"subject",body:"body",closing:"closing"}; Object.keys(map).forEach(k => { const el = document.getElementById("pms102-doc-" + k); if (el) el.value = d[map[k]] || ""; }); }
  function printDoc(id,kind){ const d = state.officialDocuments.find(x => x.id === id || x.protocol === id); if (d) openPrint(docPrintHtml(d,kind)); }

  function renderAccountant(){
    const docs = state.accountantDocuments.map(d => '<tr><td><span class="code-block">' + esc(d.id) + '</span></td><td><strong>' + esc(d.docType) + '</strong><br><small>' + esc(d.period) + '</small></td><td>' + esc(d.fileName || d.externalLink || "-") + '</td><td>' + money(d.amount,d.currency) + '</td><td>' + esc(d.status) + '</td></tr>').join("");
    const dossiers = state.accountantDossiers.slice(0,10).map(d => '<tr><td>' + esc(d.id) + '</td><td>' + esc(d.period) + '</td><td>' + esc(d.docsCount) + '</td><td>' + esc(d.createdAt) + '</td><td><button class="inline-button" data-pms102-print-dossier="' + esc(d.id) + '">Stampa</button></td></tr>').join("");
    return '<div class="pms102-page"><section class="pms102-hero"><div><span>ACC</span><h3>Commercialista</h3><p>Sorina Popescu - sorina.popescu@horgaconsulting.ro</p></div><div class="pms102-actions"><button class="primary-button" data-pms102-add-accountant-doc>Inserisci documento</button><button class="secondary-button" data-pms102-build-dossier>Crea dossier automatico</button><button class="secondary-button" data-pms102-email-dossier>Prepara email</button></div></section><div class="pms102-card"><div class="pms102-form"><label>Periodo<input id="pms102-acc-period" value="' + esc(new Date().toISOString().slice(0,7)) + '"></label><label>Tipo documento<select id="pms102-acc-type"><option>Fattura vendita</option><option>Fattura acquisto</option><option>Estratto banca</option><option>Pagamento</option><option>Contratto</option><option>Ordine</option><option>Altro</option></select></label><label>Nome file<input id="pms102-acc-file"></label><label>Link documento<input id="pms102-acc-link"></label><label>Importo<input id="pms102-acc-amount" type="number" step="0.01"></label><label>Valuta<select id="pms102-acc-currency"><option>EUR</option><option>RON</option><option>USD</option></select></label><label>Stato<select id="pms102-acc-status"><option>Da inviare</option><option>Completo</option><option>Mancante dati</option><option>Inviato</option></select></label><label>Collegato a<input id="pms102-acc-linked"></label><label class="full">Note<textarea id="pms102-acc-notes"></textarea></label></div></div><div class="pms102-kpis"><div class="pms102-kpi"><span>Documenti</span><strong>' + esc(state.accountantDocuments.length) + '</strong></div><div class="pms102-kpi"><span>Da inviare</span><strong>' + esc(state.accountantDocuments.filter(d => d.status !== "Inviato").length) + '</strong></div><div class="pms102-kpi"><span>Dossier</span><strong>' + esc(state.accountantDossiers.length) + '</strong></div></div><div class="pms102-card"><h4>Documenti inseriti</h4><div class="table-wrap"><table><thead><tr><th>ID</th><th>Tipo</th><th>File/link</th><th>Importo</th><th>Stato</th></tr></thead><tbody>' + (docs || '<tr><td colspan="5">Nessun documento inserito.</td></tr>') + '</tbody></table></div></div><div class="pms102-card"><h4>Dossier automatici</h4><div class="table-wrap"><table><tbody>' + (dossiers || '<tr><td>Nessun dossier creato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function addAccountantDoc(){ const doc = {id:next("ACCDOC",state.accountantDocuments),period:document.getElementById("pms102-acc-period")?.value || today().slice(0,7),docType:document.getElementById("pms102-acc-type")?.value || "Altro",fileName:document.getElementById("pms102-acc-file")?.value || "",externalLink:document.getElementById("pms102-acc-link")?.value || "",amount:document.getElementById("pms102-acc-amount")?.value || 0,currency:document.getElementById("pms102-acc-currency")?.value || "EUR",status:document.getElementById("pms102-acc-status")?.value || "Da inviare",linkedCode:document.getElementById("pms102-acc-linked")?.value || "",notes:document.getElementById("pms102-acc-notes")?.value || "",createdAt:new Date().toISOString()}; state.accountantDocuments.unshift(doc); state.documents.unshift({id:next("DOC",state.documents),linkedCode:doc.linkedCode,linkedType:"Commercialista",docType:doc.docType,fileName:doc.fileName,externalLink:doc.externalLink,date:today(),amount:doc.amount,currency:doc.currency,status:doc.status,notes:doc.notes}); saveState(); render(); }
  function dossierHtml(dossier){
    const period = dossier?.period || document.getElementById("pms102-acc-period")?.value || today().slice(0,7);
    const docs = state.accountantDocuments.filter(d => d.period === period);
    const groups = ["Fattura vendita","Fattura acquisto","Estratto banca","Pagamento","Contratto","Ordine","Altro"];
    const body = groups.map(g => { const rows = docs.filter(d => d.docType === g).map(d => '<tr><td>' + esc(d.id) + '</td><td>' + esc(d.fileName || d.externalLink || "-") + '</td><td>' + money(d.amount,d.currency) + '</td><td>' + esc(d.status) + '</td><td>' + esc(d.notes || "") + '</td></tr>').join(""); return '<h3>' + esc(g) + '</h3><table class="print-table"><thead><tr><th>ID</th><th>Documento</th><th>Importo</th><th>Stato</th><th>Note</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Nessun documento.</td></tr>') + '</tbody></table>'; }).join("");
    return '<div class="print-document pms102-print">' + printHeader("Dossier commercialista",dossier?.id || ("DOS-" + period),"Periodo " + period) + body + '<div>' + barcode(dossier?.id || ("DOS-" + period)) + '</div><div class="print-footer">Dossier organizzato per Sorina Popescu - ' + esc(state.settings?.accountantEmail || "sorina.popescu@horgaconsulting.ro") + '</div></div>';
  }
  function buildDossier(){ const period = document.getElementById("pms102-acc-period")?.value || today().slice(0,7); const docs = state.accountantDocuments.filter(d => d.period === period); const dossier = {id:next("DOS",state.accountantDossiers),period,docsCount:docs.length,createdAt:new Date().toISOString(),status:"Creato"}; state.accountantDossiers.unshift(dossier); state.accountantActions.unshift({id:next("ACCLOG",state.accountantActions),date:new Date().toISOString(),type:"Dossier automatico",recipient:state.settings.accountantEmail || "sorina.popescu@horgaconsulting.ro",status:"Creato",note:dossier.id + " - " + period}); saveState(); openPrint(dossierHtml(dossier)); render(); }
  function printDossier(id){ const d = state.accountantDossiers.find(x => x.id === id); openPrint(dossierHtml(d)); }
  function emailDossier(){ const period = document.getElementById("pms102-acc-period")?.value || today().slice(0,7); const email = state.settings.accountantEmail || "sorina.popescu@horgaconsulting.ro"; const docs = state.accountantDocuments.filter(d => d.period === period); const body = "Gentile Sorina,%0D%0A%0D%0Apreparato dossier Parmitalia periodo " + encodeURIComponent(period) + " con " + docs.length + " documenti organizzati per categoria.%0D%0A%0D%0AIl registro azioni e stato aggiornato nel gestionale."; state.accountantActions.unshift({id:next("ACCLOG",state.accountantActions),date:new Date().toISOString(),type:"Preparazione email dossier",recipient:email,status:"Preparata",note:period}); saveState(); location.href = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent("Dossier commercialista Parmitalia " + period) + "&body=" + body; }

  function orderCode(o){ return o.code || o.id || "-"; }
  function closedOrder(o){ return /chius|confermat|complet|accett/i.test(String(o.status || "")); }
  function orderLines(o){ for (const k of ["multiArticleItemsJson","orderLineItemsJson","dealLineItemsJson"]) { try { const p = JSON.parse(o[k] || "[]"); if (Array.isArray(p) && p.length) return p; } catch(e){} } return [{product:o.product || "Merce",description:o.description || o.product || "Merce",quantity:o.quantity || 1,unit:o.unit || "kg",unitPrice:o.unitPrice || o.price || o.total || 0,currency:o.currency || "EUR"}]; }
  function renderOrders(){
    const rows = state.orders.map(o => '<tr><td><span class="code-block">' + esc(orderCode(o)) + '</span></td><td>' + esc(o.client || "-") + '</td><td>' + esc(o.supplier || "-") + '</td><td><strong>' + esc(o.product || "-") + '</strong></td><td>' + esc(o.quantity || "") + ' ' + esc(o.unit || "") + '</td><td>' + esc(o.status || "Nuovo") + '</td><td><button class="inline-button" data-pms102-order-edit="' + esc(o.id) + '">Modifica</button><button class="inline-button" data-pms102-order-close="' + esc(o.id) + '">Chiudi</button>' + (closedOrder(o) ? '<button class="inline-button" data-pms102-order-invoice="' + esc(o.id) + '">Passa a fatturazione</button>' : "") + '</td></tr>').join("");
    return '<div class="pms102-page"><section class="pms102-hero"><div><span>ORD</span><h3>Ordini</h3><p>Quando un ordine e chiuso puoi trasferirlo direttamente in Fatturazione.</p></div><div class="pms102-actions"><button class="primary-button" data-pms102-new-order>+ Nuovo ordine</button><button class="secondary-button" data-nav="billingWorkflow">Apri fatturazione</button></div></section><div class="pms102-card"><div class="table-wrap"><table><thead><tr><th>Codice</th><th>Cliente</th><th>Fornitore</th><th>Prodotto</th><th>Quantita</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">Nessun ordine.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function closeOrder(id){ const o = state.orders.find(x => String(x.id) === String(id)); if (!o) return; o.status = "Chiuso"; o.closedAt = new Date().toISOString(); saveState(); render(); }
  function orderToInvoice(id){
    const o = state.orders.find(x => String(x.id) === String(id));
    if (!o) return alert("Ordine non trovato.");
    if (!closedOrder(o)) return alert("Prima chiudi l'ordine.");
    const existing = state.outgoingInvoices.find(i => i.linkedPractice === orderCode(o) || i.sourceOrderId === o.id);
    if (existing) { current.page = "billingWorkflow"; render(); return alert("La fattura esiste gia: " + (existing.protocol || existing.id)); }
    const protocol = next("FOUT",state.outgoingInvoices);
    const items = orderLines(o).map(line => ({description:line.description || line.product || o.product || "Merce",quantity:num(line.quantity) || 1,unit:line.unit || o.unit || "kg",unitPrice:num(line.unitPrice || line.price || o.unitPrice || o.price || 0),vatRate:num(line.vatRate || 0)}));
    const net = items.reduce((a,l)=>a + num(l.quantity) * num(l.unitPrice),0) || num(o.total || o.value || 0);
    const invoice = {id:protocol,protocol,number:protocol,date:today(),dueDate:today(),currency:o.currency || "EUR",status:"Bozza",anafStatus:"Da inviare",partyName:o.client || "",partyVat:o.clientVat || "",partyAddress:o.clientAddress || "",partyCountry:o.clientCountry || "",partyEmail:o.clientEmail || "",project:orderCode(o),linkedPractice:orderCode(o),sourceOrderId:o.id,paymentTerms:o.paymentTerms || "",paymentMethod:"Bonifico bancario",items,amount:net,vatAmount:0,total:net,notes:"Creata automaticamente da ordine " + orderCode(o)};
    state.outgoingInvoices.unshift(invoice);
    o.invoiceReference = protocol;
    o.status = "Fatturato";
    saveState();
    current.page = "billingWorkflow";
    render();
  }
  function bind(){
    ensure(); css(); removeHiddenNav();
    document.querySelector("[data-pms102-translate]")?.addEventListener("click",runTranslate);
    document.querySelector("[data-pms102-save-translation]")?.addEventListener("click",saveTranslation);
    document.querySelectorAll("[data-pms102-load-translation]").forEach(b => b.onclick = () => loadTranslation(b.dataset.pms102LoadTranslation));
    document.querySelector("[data-pms102-doc-save]")?.addEventListener("click",() => saveDoc(false));
    document.querySelector("[data-pms102-doc-preview]")?.addEventListener("click",() => saveDoc(true));
    document.querySelectorAll("[data-pms102-doc-load]").forEach(b => b.onclick = () => loadDoc(b.dataset.pms102DocLoad));
    document.querySelectorAll("[data-pms102-doc-print]").forEach(b => b.onclick = () => printDoc(b.dataset.pms102DocPrint,b.dataset.kind));
    document.querySelector("[data-pms102-add-accountant-doc]")?.addEventListener("click",addAccountantDoc);
    document.querySelector("[data-pms102-build-dossier]")?.addEventListener("click",buildDossier);
    document.querySelector("[data-pms102-email-dossier]")?.addEventListener("click",emailDossier);
    document.querySelectorAll("[data-pms102-print-dossier]").forEach(b => b.onclick = () => printDossier(b.dataset.pms102PrintDossier));
    document.querySelector("[data-pms102-new-order]")?.addEventListener("click",() => typeof openModal === "function" ? openModal("orders") : null);
    document.querySelectorAll("[data-pms102-order-edit]").forEach(b => b.onclick = () => typeof openModal === "function" ? openModal("orders",b.dataset.pms102OrderEdit) : null);
    document.querySelectorAll("[data-pms102-order-close]").forEach(b => b.onclick = () => closeOrder(b.dataset.pms102OrderClose));
    document.querySelectorAll("[data-pms102-order-invoice]").forEach(b => b.onclick = () => orderToInvoice(b.dataset.pms102OrderInvoice));
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms102RenderWrapped) {
    window.__pms102RenderWrapped = true;
    render = function(){
      ensure(); css();
      if (window.current && HIDDEN.has(current.page)) current.page = "dashboard";
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (content && current && current.page === "communications") { if (title) title.textContent = "Traduttore professionale"; if (subtitle) subtitle.textContent = "Traduzione professionale senza IA"; content.innerHTML = renderTranslator(); bind(); return; }
      if (content && current && current.page === "officialCommunications") { if (title) title.textContent = "Documenti protocollati"; if (subtitle) subtitle.textContent = "Scrittura libera, stampe, barcode e vidimazione"; content.innerHTML = renderOfficialDocs(); bind(); return; }
      if (content && current && current.page === "accountant") { if (title) title.textContent = "Commercialista"; if (subtitle) subtitle.textContent = "Documenti e dossier automatico"; content.innerHTML = renderAccountant(); bind(); return; }
      if (content && current && current.page === "orders") { if (title) title.textContent = "Ordini"; if (subtitle) subtitle.textContent = "Chiusura ordine e passaggio diretto a fatturazione"; content.innerHTML = renderOrders(); bind(); return; }
      const result = baseRender.apply(this,arguments);
      setTimeout(bind,30);
      return result;
    };
  }
  const baseNav = typeof renderNav === "function" ? renderNav : null;
  if (baseNav && !window.__pms102NavWrapped) { window.__pms102NavWrapped = true; renderNav = function(){ ensure(); const r = baseNav.apply(this,arguments); removeHiddenNav(); return r; }; }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms102BindWrapped) { window.__pms102BindWrapped = true; bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); return r; }; }
  ensure(); css(); setTimeout(bind,80);
  window.pmsV102SimplifyModules = {version:VERSION,orderToInvoice,buildDossier};
})();
