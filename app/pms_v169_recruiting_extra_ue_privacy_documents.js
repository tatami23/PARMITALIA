(function(){
  "use strict";
  const VERSION = "pms_v169_recruiting_extra_ue_privacy_documents";
  const FOREIGN = "foreignEmployees";
  const DOC_STORE = "foreignRecruitingPrivacyDocs";
  const MODULE_LABEL = "Recruiting Extra UE";
  const MODULE_SUBTITLE = "Candidati extra UE, passaporto, privacy bilingue, contratti e calendario pratiche";

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function nowStamp(){
    const d = new Date();
    return today() + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function st(){
    window.state = window.state || {};
    state[FOREIGN] = arr(state[FOREIGN]);
    state[DOC_STORE] = arr(state[DOC_STORE]);
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio non riuscito. Se hai caricato immagini molto grandi, riducile e riprova.");
      return false;
    }
  }
  function fullName(person){
    return person && (person.fullName || [person.firstName, person.lastName].filter(Boolean).join(" ") || person.name || person.candidateName || person.id) || "-";
  }
  function byId(id){
    return arr(st()[FOREIGN]).find(function(person){ return String(person.id || "") === String(id || ""); }) || null;
  }
  function selectedId(){
    return (window.current && current.filters && current.filters.pms158ForeignEdit) || "";
  }
  function selectedPerson(){
    return byId(selectedId());
  }
  function ensureModule(){
    st();
    if (Array.isArray(window.modules)) {
      let module = modules.find(function(item){ return item && item.id === FOREIGN; });
      if (!module) {
        const idx = modules.findIndex(function(item){ return item && (item.id === "humanResources" || item.id === "commercialista"); });
        module = {id:FOREIGN, label:MODULE_LABEL, subtitle:MODULE_SUBTITLE, roles:["admin","assistant","accountant","agent","recruiter"]};
        modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, module);
      }
      module.label = MODULE_LABEL;
      module.subtitle = MODULE_SUBTITLE;
      module.roles = Array.from(new Set(arr(module.roles).concat(["admin","assistant","accountant","agent","recruiter"])));
    }
  }
  function patchVisibleLabels(){
    if (window.current && current.page === FOREIGN) {
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (title) title.textContent = MODULE_LABEL;
      if (subtitle) subtitle.textContent = MODULE_SUBTITLE;
      document.querySelectorAll(".pms158-head h3").forEach(function(node){
        node.textContent = node.textContent.replace("Nuova pratica estero", "Nuova pratica Recruiting Extra UE");
      });
      document.querySelectorAll(".print-header h1, h1, h2, h3, th, td, span, button, small").forEach(function(node){
        if (node.childNodes.length === 1 && node.textContent) {
          node.textContent = node.textContent.replace("Dipendenti estero", MODULE_LABEL).replace("pratica estero", "pratica Recruiting Extra UE").replace("Nessuna pratica estero", "Nessuna pratica Recruiting Extra UE");
        }
      });
    }
    document.querySelectorAll("button, a, .nav-item, .menu-item, .sidebar button, [data-page], [data-module]").forEach(function(node){
      if (node.childNodes.length === 1 && node.textContent && node.textContent.indexOf("Dipendenti estero") >= 0) {
        node.textContent = node.textContent.replace("Dipendenti estero", MODULE_LABEL);
      }
    });
  }
  function candidateDocs(id){
    return arr(st()[DOC_STORE]).filter(function(doc){ return String(doc.candidateId || "") === String(id || ""); });
  }
  function nextDocId(){
    const year = new Date().getFullYear();
    const prefix = "RUE-" + year + "-";
    const max = arr(st()[DOC_STORE]).reduce(function(found, doc){
      const match = String(doc.id || "").match(new RegExp("^" + prefix + "(\\d{4})$"));
      return match ? Math.max(found, Number(match[1])) : found;
    }, 0);
    return prefix + String(max + 1).padStart(4, "0");
  }
  function field(label, id, value, type){
    return '<label>' + esc(label) + '<input id="' + esc(id) + '" type="' + esc(type || "text") + '" value="' + esc(value || "") + '"></label>';
  }
  function textarea(label, id, value){
    return '<label class="full">' + esc(label) + '<textarea id="' + esc(id) + '">' + esc(value || "") + '</textarea></label>';
  }
  function renderFileBox(kind, label, person){
    const name = person && person[kind + "FileName"] ? person[kind + "FileName"] : "Nessun file caricato";
    const dataUrl = person && person[kind + "DataUrl"];
    const mime = String(person && person[kind + "Mime"] || "");
    const isImage = dataUrl && (mime.indexOf("image/") === 0 || String(dataUrl).indexOf("data:image/") === 0);
    const preview = isImage ? '<img src="' + esc(dataUrl) + '" alt="' + esc(label) + '">' : (dataUrl ? '<a class="pms169-file-link" href="' + esc(dataUrl) + '" target="_blank">Apri file</a>' : '<div class="pms169-placeholder">+</div>');
    return '<div class="pms169-filebox"><strong>' + esc(label) + '</strong><div class="pms169-preview">' + preview + '</div><small>' + esc(name) + '</small><input id="pms169-' + esc(kind) + '" type="file" accept="' + (kind === "passport" ? "image/*,.pdf" : "image/*") + '"></div>';
  }
  function renderExtraPanel(){
    const person = selectedPerson();
    if (!person) {
      return '<div id="pms169-recruiting-extra" class="pms169-panel"><div class="pms169-head"><div><span>Recruiting Extra UE</span><h3>Foto, passaporto e privacy bilingue</h3></div></div><div class="pms169-empty">Seleziona una scheda o salva una nuova pratica. Dopo il salvataggio potrai caricare foto, passaporto e generare il documento privacy.</div></div>';
    }
    const docs = candidateDocs(person.id);
    return '<div id="pms169-recruiting-extra" class="pms169-panel">' +
      '<div class="pms169-head"><div><span>Recruiting Extra UE</span><h3>Foto, passaporto e modelli privacy</h3><small>' + esc(person.id) + " - " + esc(fullName(person)) + '</small></div><div class="pms169-actions"><button class="primary-button" data-pms169-save-extra>Salva dati privacy</button><button class="secondary-button" data-pms169-generate="' + esc(person.id) + '">Genera privacy RO/AR</button></div></div>' +
      '<div class="pms169-layout"><section class="pms169-media">' + renderFileBox("photo", "Foto candidato", person) + renderFileBox("passport", "Foto / PDF passaporto", person) + '</section>' +
      '<section class="pms169-form">' +
        field("Numero passaporto", "pms169-passportNumber", person.passportNumber, "text") +
        field("Scadenza passaporto", "pms169-passportExpiry", person.passportExpiry, "date") +
        field("Data di nascita", "pms169-birthDate", person.birthDate, "date") +
        field("Luogo di nascita", "pms169-birthPlace", person.birthPlace, "text") +
        field("Indirizzo residenza", "pms169-address", person.address, "text") +
        field("Referente emergenza", "pms169-emergencyContact", person.emergencyContact, "text") +
        textarea("Note consenso / documenti", "pms169-consentNotes", person.consentNotes) +
      '</section></div>' +
      renderDocList(person, docs) +
    '</div>';
  }
  function renderDocList(person, docs){
    const rows = docs.map(function(doc){
      return '<tr><td><strong>' + esc(doc.id) + '</strong><br><small>' + esc(doc.createdAt || "") + '</small></td><td>' + esc(doc.title || "Richiesta trattamento dati") + '<br><small>' + esc(doc.status || "Generato") + '</small></td><td>' + esc(doc.updatedAt || doc.createdAt || "") + '</td><td><div class="pms169-actions"><button class="inline-button" data-pms169-edit-doc="' + esc(doc.id) + '">Modifica</button><button class="inline-button" data-pms169-print-doc="' + esc(doc.id) + '">Stampa</button><button class="inline-button" data-pms169-mail-doc="' + esc(doc.id) + '">Outlook</button><button class="inline-danger" data-pms169-delete-doc="' + esc(doc.id) + '">Elimina</button></div></td></tr>';
    }).join("");
    return '<div class="pms169-docs"><div class="pms169-head small"><div><span>Contratti e modelli generati</span><h3>Privacy bilingue romeno / arabo</h3></div></div><div class="table-wrap"><table><thead><tr><th>Codice</th><th>Documento</th><th>Ultima modifica</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="4" class="empty">Nessun modello ancora generato per ' + esc(fullName(person)) + '.</td></tr>') + '</tbody></table></div></div>';
  }
  function docTextRo(person){
    const name = fullName(person);
    return [
      "CERERE SI CONSIMTAMANT PRIVIND PRELUCRAREA DATELOR CU CARACTER PERSONAL",
      "",
      "Subsemnatul/a " + name + ", cetatenie " + (person.nationality || "-") + ", nascut/a la data de " + (person.birthDate || "-") + " in " + (person.birthPlace || "-") + ", domiciliat/a in " + (person.address || "-") + ", posesor/posesoare al/a pasaportului nr. " + (person.passportNumber || "-") + " valabil pana la " + (person.passportExpiry || "-") + ", declar ca transmit datele si documentele mele catre Parmitalia Distribution SRL pentru recrutare, verificarea dosarului si pregatirea procedurilor necesare angajarii si/sau obtinerii documentelor de munca in Romania.",
      "",
      "Sunt de acord ca datele mele de identificare, contact, experienta profesionala, documentele de calatorie, fotografiile, copiile actelor, informatiile privind programari, plati si comunicari sa fie prelucrate si transmise, atunci cand este necesar, catre angajator/client, avocat, traducator autorizat, institutii publice si autoritati competente.",
      "",
      "Prelucrarea se face pentru gestionarea dosarului meu Recruiting Extra UE, pentru comunicarea etapelor, arhivarea documentelor si indeplinirea obligatiilor legale. Am fost informat/a ca pot solicita accesul, rectificarea, restrictionarea, stergerea datelor, portabilitatea si opozitia, in limitele prevazute de legislatia aplicabila.",
      "",
      "Prin semnatura confirm ca datele furnizate sunt corecte si ca inteleg scopul prelucrarii.",
      "",
      "Candidat: " + name,
      "Telefon: " + (person.phone || person.whatsapp || "-") + " | Email: " + (person.email || "-"),
      "Data: " + today(),
      "Semnatura: ______________________________"
    ].join("\n");
  }
  function docTextAr(person){
    const name = fullName(person);
    return [
      "طلب وموافقة على معالجة البيانات الشخصية",
      "",
      "أنا الموقع/ة أدناه " + name + "، الجنسية " + (person.nationality || "-") + "، تاريخ الميلاد " + (person.birthDate || "-") + "، مكان الميلاد " + (person.birthPlace || "-") + "، العنوان " + (person.address || "-") + "، حامل/ة جواز السفر رقم " + (person.passportNumber || "-") + " والصالح إلى " + (person.passportExpiry || "-") + "، أصرح بأنني أقدم بياناتي ووثائقي إلى شركة Parmitalia Distribution SRL لأغراض التوظيف، مراجعة الملف، وتحضير الإجراءات اللازمة للعمل أو للحصول على الوثائق المطلوبة في رومانيا.",
      "",
      "أوافق على معالجة بيانات الهوية وبيانات الاتصال والخبرة المهنية ووثائق السفر والصور ونسخ المستندات والمعلومات المتعلقة بالمواعيد والمدفوعات والمراسلات، وعلى إرسالها عند الحاجة إلى صاحب العمل أو العميل أو المحامي أو المترجم المعتمد أو المؤسسات والسلطات المختصة.",
      "",
      "تتم المعالجة لإدارة ملف Recruiting Extra UE الخاص بي، ومتابعة المراحل، وحفظ الوثائق، والامتثال للالتزامات القانونية. تم إبلاغي بأن لي الحق في طلب الاطلاع أو التصحيح أو تقييد المعالجة أو الحذف أو نقل البيانات أو الاعتراض، ضمن الحدود التي يسمح بها القانون المعمول به.",
      "",
      "بتوقيعي أؤكد أن البيانات المقدمة صحيحة وأنني أفهم غرض معالجة البيانات.",
      "",
      "المرشح/ة: " + name,
      "الهاتف: " + (person.phone || person.whatsapp || "-") + " | البريد الإلكتروني: " + (person.email || "-"),
      "التاريخ: " + today(),
      "التوقيع: ______________________________"
    ].join("\n");
  }
  function generateDoc(id){
    const person = byId(id);
    if (!person) return;
    const doc = {
      id: nextDocId(),
      candidateId: person.id,
      candidateName: fullName(person),
      type: "privacy",
      title: "Richiesta trattamento dati - " + fullName(person),
      status: "Generato",
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
      textRo: docTextRo(person),
      textAr: docTextAr(person)
    };
    st()[DOC_STORE].unshift(doc);
    saveNow();
    render();
  }
  function readFile(file){
    return new Promise(function(resolve){
      const reader = new FileReader();
      reader.onload = function(){ resolve(String(reader.result || "")); };
      reader.onerror = function(){ resolve(""); };
      reader.readAsDataURL(file);
    });
  }
  async function saveExtra(){
    const person = selectedPerson();
    if (!person) return;
    person.passportNumber = value("pms169-passportNumber");
    person.passportExpiry = value("pms169-passportExpiry");
    person.birthDate = value("pms169-birthDate");
    person.birthPlace = value("pms169-birthPlace");
    person.address = value("pms169-address");
    person.emergencyContact = value("pms169-emergencyContact");
    person.consentNotes = value("pms169-consentNotes");
    const photo = fileFrom("pms169-photo");
    const passport = fileFrom("pms169-passport");
    if (photo) {
      if (photo.size > 3500000) return alert("La foto e troppo grande. Usa un file sotto 3,5 MB per mantenere stabile il salvataggio.");
      person.photoFileName = photo.name;
      person.photoMime = photo.type || "image/*";
      person.photoDataUrl = await readFile(photo);
    }
    if (passport) {
      if (passport.size > 4500000) return alert("Il file passaporto e troppo grande. Usa un file sotto 4,5 MB per mantenere stabile il salvataggio.");
      person.passportFileName = passport.name;
      person.passportMime = passport.type || "";
      person.passportDataUrl = await readFile(passport);
    }
    person.updatedAt = today();
    saveNow();
    render();
  }
  function value(id){
    const el = document.getElementById(id);
    return el ? el.value : "";
  }
  function fileFrom(id){
    const el = document.getElementById(id);
    return el && el.files && el.files[0] ? el.files[0] : null;
  }
  function findDoc(id){
    return arr(st()[DOC_STORE]).find(function(doc){ return String(doc.id || "") === String(id || ""); }) || null;
  }
  function documentHtml(doc){
    const person = byId(doc.candidateId) || {};
    return '<div class="pms169-print"><style>.pms169-print{font-family:Arial,sans-serif;color:#102033}.pms169-print h1{font-size:20px;margin:0 0 6px}.pms169-meta{display:flex;justify-content:space-between;border-bottom:2px solid #1f4e78;padding-bottom:10px;margin-bottom:16px}.pms169-cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}.pms169-col{border:1px solid #dbe5ef;border-radius:8px;padding:14px;white-space:pre-wrap;line-height:1.45;font-size:13px}.pms169-ar{direction:rtl;text-align:right;font-family:Arial,Tahoma,sans-serif}.pms169-ro{direction:ltr}.pms169-sign{margin-top:28px;border-top:1px solid #dbe5ef;padding-top:12px}@media print{.pms169-cols{grid-template-columns:1fr 1fr}}</style><div class="pms169-meta"><div><h1>' + esc(doc.title || "Richiesta trattamento dati") + '</h1><strong>Parmitalia Distribution SRL</strong><br><span>' + esc(MODULE_LABEL) + '</span></div><div><strong>' + esc(doc.id || "") + '</strong><br>' + esc(doc.updatedAt || doc.createdAt || "") + '<br>' + esc(fullName(person)) + '</div></div><div class="pms169-cols"><section class="pms169-col pms169-ro">' + esc(doc.textRo || "") + '</section><section class="pms169-col pms169-ar" lang="ar">' + esc(doc.textAr || "") + '</section></div></div>';
  }
  function printDoc(id){
    const doc = findDoc(id);
    if (!doc) return;
    const html = documentHtml(doc);
    if (typeof openPrint === "function") openPrint(html);
    else {
      const win = window.open("", "_blank");
      if (!win) return alert("Popup bloccato. Abilita le finestre di stampa.");
      win.document.write("<!doctype html><html><head><meta charset='utf-8'><title>" + esc(doc.title || doc.id) + "</title></head><body>" + html + "</body></html>");
      win.document.close();
      win.print();
    }
  }
  function deleteDoc(id){
    const doc = findDoc(id);
    if (!doc || !confirm("Eliminare il documento generato " + doc.id + "?")) return;
    state[DOC_STORE] = arr(st()[DOC_STORE]).filter(function(item){ return String(item.id || "") !== String(id || ""); });
    saveNow();
    render();
  }
  function openEditor(id){
    const doc = findDoc(id);
    if (!doc) return;
    closeEditor();
    const wrap = document.createElement("div");
    wrap.id = "pms169-editor";
    wrap.innerHTML = '<div class="pms169-modal"><div class="pms169-head"><div><span>Modifica documento</span><h3>' + esc(doc.title || doc.id) + '</h3></div><div class="pms169-actions"><button class="primary-button" data-pms169-save-editor="' + esc(doc.id) + '">Salva modifiche</button><button class="secondary-button" data-pms169-close-editor>Chiudi</button></div></div><label>Titolo<input id="pms169-edit-title" value="' + esc(doc.title || "") + '"></label><div class="pms169-editor-cols"><label>Testo rumeno<textarea id="pms169-edit-ro">' + esc(doc.textRo || "") + '</textarea></label><label>Testo arabo<textarea id="pms169-edit-ar" dir="rtl">' + esc(doc.textAr || "") + '</textarea></label></div></div>';
    document.body.appendChild(wrap);
    bindEditor();
  }
  function closeEditor(){
    const old = document.getElementById("pms169-editor");
    if (old) old.remove();
  }
  function bindEditor(){
    const close = document.querySelector("[data-pms169-close-editor]");
    if (close) close.onclick = closeEditor;
    const saveButton = document.querySelector("[data-pms169-save-editor]");
    if (saveButton) saveButton.onclick = function(){
      const doc = findDoc(saveButton.dataset.pms169SaveEditor);
      if (!doc) return;
      doc.title = value("pms169-edit-title") || doc.title;
      doc.textRo = value("pms169-edit-ro");
      doc.textAr = value("pms169-edit-ar");
      doc.updatedAt = nowStamp();
      doc.status = "Modificato";
      saveNow();
      closeEditor();
      render();
    };
  }
  function sendOutlook(id){
    const doc = findDoc(id);
    if (!doc) return;
    const person = byId(doc.candidateId) || {};
    const to = person.email || "";
    const body = [
      "Buongiorno,",
      "",
      "invio il documento bilingue per la richiesta di trattamento dei dati.",
      "",
      "=== ROMANA ===",
      doc.textRo || "",
      "",
      "=== العربية ===",
      doc.textAr || "",
      "",
      "Parmitalia Distribution SRL"
    ].join("\n");
    const link = "mailto:" + encodeURIComponent(to) + "?subject=" + encodeURIComponent(doc.title || "Recruiting Extra UE") + "&body=" + encodeURIComponent(body);
    window.location.href = link;
  }
  function decorateTableActions(){
    document.querySelectorAll("[data-pms158-edit-foreign]").forEach(function(button){
      const id = button.dataset.pms158EditForeign;
      const parent = button.closest(".pms158-actions");
      const exists = parent && Array.from(parent.querySelectorAll("[data-pms169-generate]")).some(function(item){
        return String(item.dataset.pms169Generate || "") === String(id || "");
      });
      if (!parent || exists) return;
      button.insertAdjacentHTML("afterend", '<button class="inline-button" data-pms169-generate="' + esc(id) + '">Privacy RO/AR</button>');
    });
  }
  function decorateForeignPage(){
    if (!window.current || current.page !== FOREIGN) return;
    injectCss();
    patchVisibleLabels();
    const page = document.querySelector(".pms158-page");
    if (page && !document.getElementById("pms169-recruiting-extra")) {
      const form = page.querySelector(".pms158-panel");
      if (form) form.insertAdjacentHTML("afterend", renderExtraPanel());
      else page.insertAdjacentHTML("afterbegin", renderExtraPanel());
    }
    decorateTableActions();
    bindActions();
  }
  function bindActions(){
    document.querySelectorAll("[data-pms169-save-extra]").forEach(function(button){
      if (button.dataset.bound169) return;
      button.dataset.bound169 = "1";
      button.onclick = function(event){ event.preventDefault(); saveExtra(); };
    });
    document.querySelectorAll("[data-pms169-generate]").forEach(function(button){
      if (button.dataset.bound169) return;
      button.dataset.bound169 = "1";
      button.onclick = function(event){ event.preventDefault(); generateDoc(button.dataset.pms169Generate); };
    });
    document.querySelectorAll("[data-pms169-edit-doc]").forEach(function(button){
      if (button.dataset.bound169) return;
      button.dataset.bound169 = "1";
      button.onclick = function(event){ event.preventDefault(); openEditor(button.dataset.pms169EditDoc); };
    });
    document.querySelectorAll("[data-pms169-print-doc]").forEach(function(button){
      if (button.dataset.bound169) return;
      button.dataset.bound169 = "1";
      button.onclick = function(event){ event.preventDefault(); printDoc(button.dataset.pms169PrintDoc); };
    });
    document.querySelectorAll("[data-pms169-delete-doc]").forEach(function(button){
      if (button.dataset.bound169) return;
      button.dataset.bound169 = "1";
      button.onclick = function(event){ event.preventDefault(); deleteDoc(button.dataset.pms169DeleteDoc); };
    });
    document.querySelectorAll("[data-pms169-mail-doc]").forEach(function(button){
      if (button.dataset.bound169) return;
      button.dataset.bound169 = "1";
      button.onclick = function(event){ event.preventDefault(); sendOutlook(button.dataset.pms169MailDoc); };
    });
  }
  function injectCss(){
    if (document.getElementById("pms-v169-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v169-style";
    style.textContent = `
      .pms169-panel{background:#fff;border:1px solid var(--line,#dbe5ef);border-radius:8px;padding:14px;display:grid;gap:12px}
      .pms169-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
      .pms169-head span{display:block;font-size:12px;font-weight:900;color:#1f4e78;text-transform:uppercase}
      .pms169-head h3{margin:2px 0}.pms169-head small{color:#64748b;font-weight:800}
      .pms169-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.pms169-actions button{width:auto!important;margin:0!important}
      .pms169-layout{display:grid;grid-template-columns:320px minmax(0,1fr);gap:14px;align-items:start}
      .pms169-media{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pms169-filebox{border:1px solid #dbe5ef;border-radius:8px;padding:10px;display:grid;gap:8px;background:#f8fafc}.pms169-filebox strong{font-size:12px;color:#102033}.pms169-filebox small{font-size:11px;color:#64748b;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pms169-preview{height:138px;border:1px dashed #b9c7d6;border-radius:8px;background:#fff;display:grid;place-items:center;overflow:hidden}.pms169-preview img{width:100%;height:100%;object-fit:cover}.pms169-placeholder{font-size:32px;color:#9ca3af;font-weight:700}.pms169-file-link{font-size:12px;font-weight:900;color:#1f4e78;text-decoration:none}
      .pms169-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.pms169-form label,.pms169-modal label{display:grid;gap:4px;font-size:12px;font-weight:900;color:#64748b}.pms169-form .full{grid-column:1/-1}.pms169-form input,.pms169-form textarea,.pms169-modal input,.pms169-modal textarea{width:100%}.pms169-form textarea{min-height:72px}
      .pms169-docs{display:grid;gap:10px}.pms169-empty{border:1px dashed #cbd5e1;background:#f8fafc;border-radius:8px;padding:18px;color:#64748b;font-weight:800;text-align:center}
      #pms169-editor{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:grid;place-items:center;padding:24px}
      .pms169-modal{width:min(1100px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:8px;border:1px solid #dbe5ef;box-shadow:0 24px 80px rgba(15,23,42,.28);padding:18px;display:grid;gap:12px}
      .pms169-editor-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px}.pms169-editor-cols textarea{min-height:430px;line-height:1.45}
      @media(max-width:1100px){.pms169-layout{grid-template-columns:1fr}.pms169-form{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:720px){.pms169-media,.pms169-form,.pms169-editor-cols{grid-template-columns:1fr}.pms169-head{display:block}.pms169-actions{margin-top:9px}}
    `;
    document.head.appendChild(style);
  }

  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !renderNav.__pms169Wrapped) {
    renderNav = function(){
      const result = baseRenderNav.apply(this, arguments);
      ensureModule();
      setTimeout(patchVisibleLabels, 20);
      return result;
    };
    renderNav.__pms169Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !render.__pms169Wrapped) {
    render = function(){
      ensureModule();
      const result = baseRender.apply(this, arguments);
      ensureModule();
      decorateForeignPage();
      setTimeout(decorateForeignPage, 80);
      return result;
    };
    render.__pms169Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !bindPageActions.__pms169Wrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      decorateForeignPage();
      return result;
    };
    bindPageActions.__pms169Wrapped = true;
  }

  ensureModule();
  injectCss();
  try {
    if (typeof renderNav === "function") renderNav();
    if (typeof render === "function") render();
  } catch(error) {
    console.warn(VERSION, error);
  }
  setInterval(function(){ ensureModule(); patchVisibleLabels(); bindActions(); }, 2500);
  window.pmsV169 = {version:VERSION, generatePrivacyDocument:generateDoc};
  console.info(VERSION + " loaded");
})();
