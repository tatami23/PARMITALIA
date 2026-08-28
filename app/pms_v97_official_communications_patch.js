(function(){
  "use strict";
  const VERSION = "PMS-V97-OFFICIAL-COMMUNICATIONS";
  const MODULE = "officialCommunications";
  const LABELS = {
    IT:{title:"Comunicazioni ufficiali",subtitle:"Scrittura libera protocollata su carta intestata elegante",newDoc:"+ Nuova comunicazione",subject:"Oggetto",recipient:"Destinatario",language:"Lingua",body:"Testo libero",save:"Salva e stampa",print:"Stampa",edit:"Modifica",delete:"Elimina",protocol:"Protocollo",status:"Stato",date:"Data",letterhead:"Carta intestata ufficiale",closing:"Firma / chiusura",free:"Testo libero ufficiale"},
    EN:{title:"Official communications",subtitle:"Free official writing with protocol number and elegant letterhead",newDoc:"+ New communication",subject:"Subject",recipient:"Recipient",language:"Language",body:"Free text",save:"Save and print",print:"Print",edit:"Edit",delete:"Delete",protocol:"Protocol",status:"Status",date:"Date",letterhead:"Official letterhead",closing:"Signature / closing",free:"Official free text"},
    RO:{title:"Comunicari oficiale",subtitle:"Text liber protocolat pe antet elegant",newDoc:"+ Comunicare noua",subject:"Subiect",recipient:"Destinatar",language:"Limba",body:"Text liber",save:"Salveaza si printeaza",print:"Printare",edit:"Modifica",delete:"Sterge",protocol:"Protocol",status:"Status",date:"Data",letterhead:"Antet oficial",closing:"Semnatura / inchidere",free:"Text liber oficial"},
    AR:{title:"المراسلات الرسمية",subtitle:"كتابة رسمية حرة مع بروتوكول وترويسة أنيقة",newDoc:"+ مراسلة جديدة",subject:"الموضوع",recipient:"المستلم",language:"اللغة",body:"نص حر",save:"حفظ وطباعة",print:"طباعة",edit:"تعديل",delete:"حذف",protocol:"البروتوكول",status:"الحالة",date:"التاريخ",letterhead:"ترويسة رسمية",closing:"التوقيع / الخاتمة",free:"نص رسمي حر"}
  };
  function lang(){ return String((window.state && state.settings && state.settings.defaultLanguage) || "IT").toUpperCase(); }
  function t(k){ return (LABELS[lang()] || LABELS.IT)[k] || LABELS.IT[k] || k; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e) { console.warn(e); return false; } }
  function nextCode(){
    const y = new Date().getFullYear();
    const re = new RegExp("^CU-" + y + "-(\\d{4})$");
    const max = arr(state.officialCommunications).reduce((a,x) => {
      const m = String(x.protocol || x.id || "").match(re);
      return m ? Math.max(a, Number(m[1])) : a;
    }, 0);
    return "CU-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function dateIso(){ return new Date().toISOString().slice(0,10); }
  function dateHuman(v){
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d) ? String(v) : d.toLocaleDateString(lang()==="EN" ? "en-GB" : "it-IT");
  }
  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.officialCommunications = arr(state.officialCommunications);
    if (typeof modules !== "undefined" && !modules.some(m => m.id === MODULE)) {
      const idx = modules.findIndex(m => m.id === "communications");
      modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, {
        id:MODULE,
        label:"Comunicazioni ufficiali",
        subtitle:"Testi liberi protocollati con carta intestata",
        roles:["admin","assistant","accountant"]
      });
    }
  }
  function css(){
    if (document.getElementById("pms-v97-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v97-style";
    style.textContent = ".pms97-page{display:grid;gap:14px}.pms97-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#102a43;color:#fff;border-radius:8px;padding:16px 18px}.pms97-hero h3{margin:2px 0 6px;color:#fff}.pms97-hero p{margin:0;color:#dbeafe}.pms97-actions{display:flex;gap:8px;flex-wrap:wrap}.pms97-actions button{width:auto!important;margin:0!important}.pms97-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pms97-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.pms97-form .full{grid-column:1/-1}.pms97-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms97-form textarea{min-height:260px;line-height:1.55}.pms97-muted{font-size:12px;color:var(--muted);line-height:1.45}.pms97-doc-title{font-weight:900;color:#102a43}.pms97-modal{position:fixed;inset:0;z-index:21000;background:rgba(15,23,42,.55);display:grid;place-items:center;padding:14px}.pms97-modal-card{width:min(1100px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.32)}.pms97-modal-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:2}.pms97-modal-head h3{margin:0}.pms97-modal-body{padding:16px}.pms97-modal-actions{display:flex;justify-content:flex-end;gap:8px;position:sticky;bottom:0;background:#fff;border-top:1px solid var(--line);padding:12px 16px}.pms97-modal-actions button,.pms97-modal-head button{width:auto!important;margin:0!important}.pms97-letterhead{border-bottom:2px solid #102a43;padding-bottom:7mm;margin-bottom:7mm;display:flex;justify-content:space-between;gap:8mm;align-items:flex-start}.pms97-brand{display:flex;gap:5mm;align-items:flex-start}.pms97-logo{width:28mm;height:20mm;object-fit:contain}.pms97-mark{width:18mm;height:18mm;border-radius:50%;background:#102a43;color:#fff;display:grid;place-items:center;font-weight:900;font-size:20pt}.pms97-company h1{font-size:17pt;margin:0;color:#102a43;line-height:1.1}.pms97-company strong{display:block;font-size:10pt;margin-top:1mm}.pms97-company small{display:block;color:#475569;line-height:1.35}.pms97-meta{text-align:right;font-size:9pt;color:#334155;line-height:1.45}.pms97-body{font-family:Georgia,'Times New Roman',serif;font-size:11.2pt;line-height:1.55;white-space:pre-wrap;color:#111827}.pms97-subject{font-size:13pt;font-weight:900;color:#102a43;margin:5mm 0}.pms97-recipient{border:1px solid #cbd5e1;background:#f8fafc;padding:3mm;margin:4mm 0 6mm}.pms97-signature{margin-top:12mm;display:grid;grid-template-columns:1fr 55mm;gap:12mm;align-items:end}.pms97-signature-line{border-top:1px solid #64748b;padding-top:2mm;text-align:center;color:#334155}.pms97-ar{direction:rtl;text-align:right}@media(max-width:850px){.pms97-hero{display:grid}.pms97-form{grid-template-columns:1fr}}@media print{@page{size:A4;margin:10mm}#print-root .print-document.pms97-print{font-size:10pt!important;line-height:1.35!important;min-height:0!important;height:auto!important;page-break-after:avoid!important;break-after:avoid!important}#print-root .pms97-letterhead{break-inside:avoid}.pms97-body{font-size:10.8pt!important}}";
    document.head.appendChild(style);
  }
  function renderDoc(doc){
    const s = state.settings || {};
    const protocol = doc.protocol || doc.id || "";
    const isAr = String(doc.language || "").toUpperCase() === "AR";
    const logo = s.logoUrl ? '<img class="pms97-logo" src="' + esc(s.logoUrl) + '" alt="Logo">' : '<div class="pms97-mark">P</div>';
    const barcode = typeof renderBarcode === "function" ? renderBarcode(protocol) : (typeof renderQrLite === "function" ? renderQrLite(protocol) : '<strong>' + esc(protocol) + '</strong>');
    return '<div class="print-document pms97-print ' + (isAr ? "pms97-ar" : "") + '"><div class="pms97-letterhead"><div class="pms97-brand">' + logo + '<div class="pms97-company"><h1>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</h1><strong>' + esc(s.vat || "") + '</strong><small>' + esc(s.address || "") + '<br>' + esc(s.email || "") + (s.phone ? " · " + esc(s.phone) : "") + '</small></div></div><div class="pms97-meta"><strong>' + esc(t("protocol")) + ': ' + esc(protocol) + '</strong><br>' + esc(t("date")) + ': ' + esc(dateHuman(doc.date || doc.createdAt)) + '<div style="margin-top:3mm">' + barcode + '</div></div></div><div class="pms97-recipient"><strong>' + esc(t("recipient")) + ':</strong><br>' + esc(doc.recipient || "-") + '</div><div class="pms97-subject">' + esc(t("subject")) + ': ' + esc(doc.subject || "-") + '</div><div class="pms97-body">' + esc(doc.body || "-") + '</div><div class="pms97-signature"><div>' + esc(doc.closing || "") + '</div><div class="pms97-signature-line">Parmitalia Distribution SRL</div></div><div class="print-footer">Comunicazione ufficiale protocollata · ' + esc(protocol) + '</div></div>';
  }
  function printDoc(id){
    const doc = state.officialCommunications.find(x => x.id === id || x.protocol === id);
    if (!doc) return alert("Comunicazione non trovata.");
    openPrint(renderDoc(doc));
  }
  function openEditor(id){
    ensure(); css();
    const existing = id ? state.officialCommunications.find(x => x.id === id || x.protocol === id) : null;
    const doc = existing || {protocol:nextCode(),date:dateIso(),language:lang(),subject:"",recipient:"",body:"",closing:"Cordiali saluti,"};
    document.getElementById("pms97-modal")?.remove();
    const modal = document.createElement("div");
    modal.id = "pms97-modal";
    modal.className = "pms97-modal";
    modal.innerHTML = '<div class="pms97-modal-card"><div class="pms97-modal-head"><div><h3>' + esc(t("title")) + '</h3><small>' + esc(doc.protocol) + '</small></div><button type="button" class="secondary-button" data-pms97-close>' + esc(t("close") || "Chiudi") + '</button></div><form id="pms97-form"><div class="pms97-modal-body"><div class="pms97-form"><label>' + esc(t("protocol")) + '<input name="protocol" value="' + esc(doc.protocol) + '" readonly></label><label>' + esc(t("date")) + '<input name="date" type="date" value="' + esc(doc.date || dateIso()) + '"></label><label>' + esc(t("language")) + '<select name="language"><option value="IT">Italiano</option><option value="EN">English</option><option value="RO">Romana</option><option value="AR">العربية</option></select></label><label class="full">' + esc(t("recipient")) + '<input name="recipient" value="' + esc(doc.recipient || "") + '"></label><label class="full">' + esc(t("subject")) + '<input name="subject" value="' + esc(doc.subject || "") + '"></label><label class="full">' + esc(t("body")) + '<textarea name="body">' + esc(doc.body || "") + '</textarea></label><label class="full">' + esc(t("closing")) + '<textarea name="closing" style="min-height:80px">' + esc(doc.closing || "") + '</textarea></label></div></div><div class="pms97-modal-actions"><button type="button" class="secondary-button" data-pms97-preview>' + esc(t("preview") || "Anteprima") + '</button><button type="submit" class="primary-button">' + esc(t("save")) + '</button></div></form></div>';
    document.body.appendChild(modal);
    const form = modal.querySelector("#pms97-form");
    form.elements.language.value = doc.language || lang();
    modal.querySelector("[data-pms97-close]").onclick = () => modal.remove();
    modal.querySelector("[data-pms97-preview]").onclick = () => {
      const d = readForm(form, existing);
      openPrint(renderDoc(d));
    };
    form.onsubmit = e => {
      e.preventDefault();
      const saved = readForm(form, existing);
      if (existing) Object.assign(existing, saved);
      else state.officialCommunications.unshift(saved);
      saveState();
      modal.remove();
      printDoc(saved.id);
      if (typeof render === "function") render();
    };
  }
  function readForm(form, existing){
    return {
      id: existing?.id || form.elements.protocol.value,
      protocol: form.elements.protocol.value,
      date: form.elements.date.value || dateIso(),
      language: form.elements.language.value || lang(),
      recipient: form.elements.recipient.value || "",
      subject: form.elements.subject.value || "",
      body: form.elements.body.value || "",
      closing: form.elements.closing.value || "",
      status: existing?.status || "Bozza",
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  function removeDoc(id){
    if (!confirm("Eliminare questa comunicazione ufficiale?")) return;
    state.officialCommunications = state.officialCommunications.filter(x => x.id !== id && x.protocol !== id);
    saveState();
    render();
  }
  function renderPage(){
    ensure(); css();
    const rows = state.officialCommunications.map(doc => '<tr><td><span class="code-block">' + esc(doc.protocol) + '</span></td><td><strong class="pms97-doc-title">' + esc(doc.subject || "-") + '</strong><br><small>' + esc(doc.recipient || "-") + '</small></td><td>' + esc(doc.language || "") + '</td><td>' + esc(dateHuman(doc.date || doc.createdAt)) + '</td><td>' + esc(doc.status || "Bozza") + '</td><td><div class="pms97-actions"><button class="inline-button" data-pms97-print="' + esc(doc.id) + '">' + esc(t("print")) + '</button><button class="inline-button" data-pms97-edit="' + esc(doc.id) + '">' + esc(t("edit")) + '</button><button class="inline-danger" data-pms97-delete="' + esc(doc.id) + '">' + esc(t("delete")) + '</button></div></td></tr>').join("");
    return '<div class="pms97-page"><section class="pms97-hero"><div><span>CU</span><h3>' + esc(t("title")) + '</h3><p>' + esc(t("subtitle")) + '</p></div><div class="pms97-actions"><button class="primary-button" data-pms97-new>' + esc(t("newDoc")) + '</button></div></section><div class="pms97-card"><h4>' + esc(t("letterhead")) + '</h4><p class="pms97-muted">Modulo per comunicazioni ufficiali libere: scrivi qualsiasi testo, il sistema assegna protocollo automatico CU-anno-numero, barcode e carta intestata Parmitalia elegante.</p></div><div class="pms97-card"><div class="table-wrap"><table><thead><tr><th>' + esc(t("protocol")) + '</th><th>' + esc(t("subject")) + '</th><th>' + esc(t("language")) + '</th><th>' + esc(t("date")) + '</th><th>' + esc(t("status")) + '</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessuna comunicazione ufficiale registrata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function bind(){
    ensure(); css();
    document.querySelector("[data-pms97-new]")?.addEventListener("click", () => openEditor());
    document.querySelectorAll("[data-pms97-print]").forEach(b => b.onclick = () => printDoc(b.dataset.pms97Print));
    document.querySelectorAll("[data-pms97-edit]").forEach(b => b.onclick = () => openEditor(b.dataset.pms97Edit));
    document.querySelectorAll("[data-pms97-delete]").forEach(b => b.onclick = () => removeDoc(b.dataset.pms97Delete));
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender) render = function(){
    ensure();
    const content = document.getElementById("content");
    if (content && window.current && current.page === MODULE) {
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (title) title.textContent = t("title");
      if (subtitle) subtitle.textContent = t("subtitle");
      content.innerHTML = renderPage();
      bind();
      return;
    }
    const result = baseRender.apply(this, arguments);
    setTimeout(bind, 40);
    return result;
  };
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind) bindPageActions = function(){ const r = baseBind.apply(this, arguments); bind(); return r; };
  const baseNav = typeof renderNav === "function" ? renderNav : null;
  if (baseNav) renderNav = function(){ ensure(); const r = baseNav.apply(this, arguments); return r; };
  ensure(); css(); setTimeout(bind, 80);
  window.pmsV97OfficialCommunications = {version:VERSION,openEditor,printDoc};
})();
