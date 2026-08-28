(function(){
  "use strict";
  const VERSION = "PMS-V114-MULTILANG-CONTRACT-DOCUMENT-PRINTS";
  const LANGS = {
    IT:{name:"Italiano",contract:"CONTRATTO",document:"DOCUMENTO PROTOCOLLATO",registry:"Registro",counterparty:"Controparte",status:"Stato",start:"Decorrenza",end:"Scadenza",owner:"Responsabile",template:"Modello",recipient:"Destinatario",date:"Data",subject:"Oggetto",type:"Tipo documento",language:"Lingua",body:"Testo",signature:"Firma / chiusura",protocol:"Protocollo",reserved:"DOCUMENTO RISERVATO INTERNO",archive:"Uso controllato / archivio Parmitalia",print:"Stampa",printLang:"Stampa lingua",verified:"Vidimazione",notFound:"Documento non trovato."},
    EN:{name:"English",contract:"CONTRACT",document:"PROTOCOLLED DOCUMENT",registry:"Register",counterparty:"Counterparty",status:"Status",start:"Start date",end:"Expiry date",owner:"Owner",template:"Template",recipient:"Recipient",date:"Date",subject:"Subject",type:"Document type",language:"Language",body:"Body",signature:"Signature / closing",protocol:"Protocol",reserved:"INTERNAL CONFIDENTIAL DOCUMENT",archive:"Controlled use / Parmitalia archive",print:"Print",printLang:"Print language",verified:"Validation",notFound:"Document not found."},
    RO:{name:"Romana",contract:"CONTRACT",document:"DOCUMENT PROTOCOLAT",registry:"Registru",counterparty:"Contraparte",status:"Stare",start:"Data inceput",end:"Data expirare",owner:"Responsabil",template:"Model",recipient:"Destinatar",date:"Data",subject:"Subiect",type:"Tip document",language:"Limba",body:"Text",signature:"Semnatura / incheiere",protocol:"Protocol",reserved:"DOCUMENT INTERN CONFIDENTIAL",archive:"Utilizare controlata / arhiva Parmitalia",print:"Printare",printLang:"Limba printare",verified:"Vizare",notFound:"Documentul nu a fost gasit."},
    AR:{name:"Arabic",contract:"العقد",document:"وثيقة مرقمة",registry:"السجل",counterparty:"الطرف المقابل",status:"الحالة",start:"تاريخ البدء",end:"تاريخ الانتهاء",owner:"المسؤول",template:"النموذج",recipient:"المستلم",date:"التاريخ",subject:"الموضوع",type:"نوع الوثيقة",language:"اللغة",body:"النص",signature:"التوقيع / الخاتمة",protocol:"رقم البروتوكول",reserved:"وثيقة داخلية سرية",archive:"استخدام مراقب / أرشيف Parmitalia",print:"طباعة",printLang:"لغة الطباعة",verified:"تصديق",notFound:"لم يتم العثور على الوثيقة."}
  };
  function tr(lang,key){ return (LANGS[lang] || LANGS.IT)[key] || LANGS.IT[key] || key; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function barcode(code){ return typeof renderBarcode === "function" ? renderBarcode(code) : (typeof renderQrLite === "function" ? renderQrLite(code) : "<strong>" + esc(code) + "</strong>"); }
  function header(title,code,sub,lang){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    const s = state.settings || {};
    const logo = s.logoUrl ? '<img class="print-logo" src="' + esc(s.logoUrl) + '" alt="Logo">' : "";
    return '<div class="print-header"><div>' + logo + '<h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(sub || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function langSelect(id,cls){
    return '<select class="' + esc(cls || "pms114-lang") + '" data-pms114-lang-for="' + esc(id || "") + '"><option value="IT">Italiano</option><option value="EN">English</option><option value="RO">Romana</option><option value="AR">Arabic</option></select>';
  }
  function css(){
    if (document.getElementById("pms-v114-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v114-style";
    s.textContent = ".pms114-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px}.pms114-actions select{width:auto!important;min-width:96px;height:32px;padding:4px 8px}.pms114-actions button{width:auto!important;margin:0!important}.pms114-rtl{direction:rtl;text-align:right}.pms114-reserved{border:1px solid #0f2f4a;background:#eef6ff;color:#0f2f4a;font-size:9pt;font-weight:900;text-transform:uppercase;padding:2.5mm 3mm;margin-bottom:4mm;display:flex;justify-content:space-between;gap:8mm}.pms114-body{white-space:pre-wrap;line-height:1.45;margin:5mm 0}.pms114-sign{white-space:pre-wrap;margin-top:8mm}.pms114-print table{table-layout:fixed}@media print{@page{size:A4;margin:9mm}#print-root .pms114-print{min-height:0!important;height:auto!important;font-size:9.4pt!important;line-height:1.25!important;break-after:avoid!important;page-break-after:avoid!important}}";
    document.head.appendChild(s);
  }
  function contractHtml(c,lang){
    lang = lang || "IT";
    const code = c.id || "CTR";
    const rtl = lang === "AR" ? " pms114-rtl" : "";
    return '<div class="print-document pms114-print' + rtl + '"><div class="pms114-reserved"><strong>' + esc(tr(lang,"reserved")) + '</strong><span>' + esc(tr(lang,"archive")) + '</span></div>' + header(tr(lang,"contract"),code,c.type || "",lang) + '<table class="print-table"><tr><th>' + esc(tr(lang,"counterparty")) + '</th><td>' + esc(c.counterparty || "-") + '</td><th>' + esc(tr(lang,"status")) + '</th><td>' + esc(c.status || "-") + '</td></tr><tr><th>' + esc(tr(lang,"start")) + '</th><td>' + esc(c.startDate || "-") + '</td><th>' + esc(tr(lang,"end")) + '</th><td>' + esc(c.endDate || "-") + '</td></tr><tr><th>' + esc(tr(lang,"owner")) + '</th><td>' + esc(c.responsible || "-") + '</td><th>' + esc(tr(lang,"template")) + '</th><td>' + esc(c.template || "-") + '</td></tr></table><div class="pms114-body">' + esc(c.contractBody || c.notes || "-") + '</div><div>' + barcode(code) + '</div><div class="print-footer">' + esc(tr(lang,"protocol")) + ' ' + esc(code) + ' - Parmitalia</div></div>';
  }
  function documentHtml(d,lang,kind){
    lang = lang || d.language || "IT";
    const code = d.protocol || d.id || "DOC";
    const rtl = lang === "AR" ? " pms114-rtl" : "";
    const title = kind === "vidimazione" ? tr(lang,"verified") : tr(lang,"document");
    return '<div class="print-document pms114-print' + rtl + '"><div class="pms114-reserved"><strong>' + esc(tr(lang,"reserved")) + '</strong><span>' + esc(tr(lang,"archive")) + '</span></div>' + header(title,code,d.docType || "",lang) + '<table class="print-table"><tr><th>' + esc(tr(lang,"recipient")) + '</th><td>' + esc(d.recipient || "-") + '</td><th>' + esc(tr(lang,"date")) + '</th><td>' + esc(d.date || today()) + '</td></tr><tr><th>' + esc(tr(lang,"subject")) + '</th><td colspan="3">' + esc(d.subject || "-") + '</td></tr><tr><th>' + esc(tr(lang,"type")) + '</th><td>' + esc(d.docType || "-") + '</td><th>' + esc(tr(lang,"language")) + '</th><td>' + esc(LANGS[lang]?.name || lang) + '</td></tr></table><div class="pms114-body">' + esc(d.body || "-") + '</div><div class="pms114-sign">' + esc(d.closing || "") + '</div><div style="margin-top:6mm">' + barcode(code) + '</div><div class="print-footer">' + esc(tr(lang,"protocol")) + ' ' + esc(code) + ' - Parmitalia</div></div>';
  }
  function selectedLangNear(el, fallback){
    const holder = el.closest("td") || el.parentElement || document;
    const sel = holder.querySelector("[data-pms114-lang-for]");
    return (sel && sel.value) || fallback || "IT";
  }
  function printContract(id,lang){
    const c = arr(state.contracts).find(x => String(x.id) === String(id));
    if (!c) return alert(tr(lang || "IT","notFound"));
    openPrint(contractHtml(c,lang || "IT"));
  }
  function printDoc(id,lang,kind){
    const docs = arr(state.officialDocuments || state.officialCommunications);
    const d = docs.find(x => String(x.id) === String(id) || String(x.protocol) === String(id));
    if (!d) return alert(tr(lang || "IT","notFound"));
    openPrint(documentHtml(d,lang || d.language || "IT",kind || "documento"));
  }
  function decorateContracts(){
    if (!window.current || current.page !== "contracts") return;
    document.querySelectorAll("[data-ctr-print]").forEach(btn => {
      const id = btn.dataset.ctrPrint;
      const cell = btn.closest("td") || btn.parentElement;
      if (!id || !cell || cell.querySelector('[data-pms114-contract-print="' + esc(id) + '"]')) return;
      const wrap = document.createElement("div");
      wrap.className = "pms114-actions";
      wrap.innerHTML = langSelect(id) + '<button class="inline-button" data-pms114-contract-print="' + esc(id) + '">' + esc(tr("IT","print")) + '</button>';
      btn.insertAdjacentElement("afterend",wrap);
      btn.style.display = "none";
    });
    document.querySelectorAll("[data-pms114-contract-print]").forEach(b => b.onclick = () => printContract(b.dataset.pms114ContractPrint,selectedLangNear(b,"IT")));
  }
  function decorateDocuments(){
    if (!window.current || current.page !== "officialCommunications") return;
    document.querySelectorAll("[data-pms102-doc-print]").forEach(btn => {
      const id = btn.dataset.pms102DocPrint;
      const kind = btn.dataset.kind || "documento";
      const cell = btn.closest("td") || btn.parentElement;
      const key = id + "-" + kind;
      if (!id || !cell || cell.querySelector('[data-pms114-doc-key="' + esc(key) + '"]')) return;
      const wrap = document.createElement("div");
      wrap.className = "pms114-actions";
      wrap.dataset.pms114DocKey = key;
      wrap.innerHTML = langSelect(id) + '<button class="inline-button" data-pms114-doc-print="' + esc(id) + '" data-kind="' + esc(kind) + '">' + esc(kind === "vidimazione" ? tr("IT","verified") : tr("IT","print")) + '</button>';
      btn.insertAdjacentElement("afterend",wrap);
      btn.style.display = "none";
    });
    document.querySelectorAll("[data-pms114-doc-print]").forEach(b => b.onclick = () => printDoc(b.dataset.pms114DocPrint,selectedLangNear(b,"IT"),b.dataset.kind));
  }
  function decorate(){
    css();
    decorateContracts();
    decorateDocuments();
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms114RenderWrapped) {
    window.__pms114RenderWrapped = true;
    render = function(){ const r = baseRender.apply(this,arguments); setTimeout(decorate,80); return r; };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms114BindWrapped) {
    window.__pms114BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); setTimeout(decorate,60); return r; };
  }
  css(); setTimeout(decorate,180);
  window.pmsV114MultiLangPrints = {version:VERSION,printContract,printDoc};
})();
