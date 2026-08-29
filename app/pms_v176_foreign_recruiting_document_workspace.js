(function(){
  "use strict";

  const VERSION = "pms_v176_foreign_recruiting_document_workspace";
  const MODULES = ["foreignEmployees", "foreignRecruiting"];
  const SLOTS = [
    {key:"photoPassport", label:"Foto passaporto", hint:"Foto tessera o immagine volto"},
    {key:"passport", label:"Passaporto", hint:"PDF, foto o scansione passaporto"},
    {key:"bilingualPrivacy", label:"Privacy bilingue", hint:"Modulo privacy IT/RO o traduzione"},
    {key:"generatedDocument", label:"Documento generato", hint:"Scheda finale pronta da stampare"},
    {key:"other", label:"Altri documenti", hint:"CV, patente, certificati, note"}
  ];
  const FIELD_LABELS = {
    fullName:"Nome completo",
    country:"Paese",
    city:"Citta",
    nationality:"Nazionalita",
    role:"Ruolo",
    profile:"Profilo",
    sourceChannel:"Canale",
    recruiter:"Recruiter",
    phone:"Telefono",
    whatsapp:"WhatsApp",
    email:"Email",
    status:"Stato",
    practiceStatus:"Stato pratica",
    documents:"Documenti",
    notes:"Note"
  };

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function uid(prefix){ return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8); }
  function st(){
    window.state = window.state || {};
    MODULES.forEach(key => { if (!Array.isArray(state[key])) state[key] = []; });
    if (state.foreignRecruiting.length && !state.foreignEmployees.length) state.foreignEmployees = state.foreignRecruiting.slice();
    if (state.foreignEmployees.length && !state.foreignRecruiting.length) state.foreignRecruiting = state.foreignEmployees.slice();
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v176-doc-workspace");
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function recordId(record){ return String(record && (record.id || record.code || record.protocol || record.practiceCode) || ""); }
  function recordTitle(record){ return clean(record && (record.fullName || record.name || record.title || record.email || recordId(record))) || "Scheda estero"; }
  function findForeign(id){
    const value = String(id || "");
    return arr(st().foreignEmployees).find(item => recordId(item) === value) || arr(st().foreignRecruiting).find(item => recordId(item) === value) || null;
  }
  function writeForeign(record){
    if (!record) return;
    const id = recordId(record);
    if (!id) return;
    ["foreignEmployees", "foreignRecruiting"].forEach(module => {
      const list = arr(st()[module]);
      const index = list.findIndex(item => recordId(item) === id);
      if (index >= 0) list[index] = record;
      else if (module === "foreignEmployees") list.unshift(record);
      state[module] = list;
    });
    record.updatedAt = new Date().toISOString();
    saveNow();
  }
  function ensureWorkspace(record){
    if (!record.pms176DocSlots || typeof record.pms176DocSlots !== "object") record.pms176DocSlots = {};
    SLOTS.forEach(slot => { if (!Array.isArray(record.pms176DocSlots[slot.key])) record.pms176DocSlots[slot.key] = []; });
    const seen = new Set(SLOTS.flatMap(slot => arr(record.pms176DocSlots[slot.key]).map(file => file && file._pms176Id).filter(Boolean)));
    arr(record.attachments).forEach(file => {
      const normalized = normalizeFile(file);
      if (!normalized || seen.has(normalized._pms176Id)) return;
      record.pms176DocSlots.other.push(normalized);
      seen.add(normalized._pms176Id);
    });
    if (!record.pms176DocData || typeof record.pms176DocData !== "object") record.pms176DocData = {};
    const data = record.pms176DocData;
    if (!data.fullName) data.fullName = record.fullName || "";
    if (!data.nationality) data.nationality = record.nationality || "";
    if (!data.country) data.country = record.country || "";
    if (!data.city) data.city = record.city || "";
    if (!data.role) data.role = record.role || "";
    if (!data.phone) data.phone = record.phone || record.whatsapp || "";
    if (!data.email) data.email = record.email || "";
    if (!data.passportNumber) data.passportNumber = record.passportNumber || "";
    if (!data.privacyItalian) data.privacyItalian = "Il candidato autorizza Parmitalia al trattamento dei dati personali e dei documenti forniti per finalita di recruiting, selezione, verifica documentale e gestione della pratica lavorativa.";
    if (!data.privacyRomanian) data.privacyRomanian = "Candidatul autorizeaza Parmitalia sa prelucreze datele personale si documentele furnizate pentru recrutare, selectie, verificare documente si gestionarea dosarului de munca.";
    return record;
  }
  function normalizeFile(file){
    if (!file || typeof file !== "object") return null;
    const id = file._pms176Id || file.id || uid("DOC");
    return {
      _pms176Id:id,
      name:file.name || file.fileName || "documento",
      type:file.type || file.mime || "",
      size:file.size || 0,
      dataUrl:file.dataUrl || file.url || "",
      uploadedAt:file.uploadedAt || today()
    };
  }
  function readFile(file){
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve({_pms176Id:uid("DOC"), name:file.name, type:file.type || "", size:file.size || 0, dataUrl:reader.result || "", uploadedAt:today()});
      reader.onerror = () => resolve({_pms176Id:uid("DOC"), name:file.name, type:file.type || "", size:file.size || 0, dataUrl:"", uploadedAt:today()});
      reader.readAsDataURL(file);
    });
  }
  async function readFiles(fileList){
    const files = Array.from(fileList || []);
    const out = [];
    for (const file of files) out.push(await readFile(file));
    return out;
  }
  function fileIcon(file){
    if (String(file.type || "").startsWith("image/") || /^data:image\//.test(file.dataUrl || "")) return '<img src="' + esc(file.dataUrl) + '" alt="">';
    return '<span>PDF</span>';
  }
  function slotFiles(record, slotKey){
    return arr(record.pms176DocSlots && record.pms176DocSlots[slotKey]).map(file => {
      file = normalizeFile(file);
      return '<article class="pms176-file" draggable="true" data-pms176-file="' + esc(slotKey + ":" + file._pms176Id) + '">' + fileIcon(file) + '<div><strong>' + esc(file.name) + '</strong><small>' + esc(file.uploadedAt || "") + '</small></div><button type="button" title="Rimuovi" data-pms176-remove="' + esc(slotKey + ":" + file._pms176Id) + '">x</button></article>';
    }).join("");
  }
  function photoSrc(record){
    const first = arr(record.pms176DocSlots && record.pms176DocSlots.photoPassport).find(file => String(file.type || "").startsWith("image/") || /^data:image\//.test(file.dataUrl || ""));
    if (first && first.dataUrl) return first.dataUrl;
    if (record.photo && record.photo.dataUrl) return record.photo.dataUrl;
    return "";
  }
  function chips(record){
    const keys = Object.keys(FIELD_LABELS).filter(key => clean(record[key]));
    return keys.map(key => '<button type="button" class="pms176-chip" draggable="true" data-pms176-chip="' + esc(record[key]) + '"><span>' + esc(FIELD_LABELS[key]) + '</span>' + esc(record[key]) + '</button>').join("");
  }
  function field(label, name, value, textarea){
    const input = textarea ? '<textarea name="' + esc(name) + '" data-pms176-dropfield>' + esc(value || "") + '</textarea>' : '<input name="' + esc(name) + '" value="' + esc(value || "") + '" data-pms176-dropfield>';
    return '<label>' + esc(label) + input + '</label>';
  }
  function workspaceHtml(record){
    ensureWorkspace(record);
    const data = record.pms176DocData || {};
    const photo = photoSrc(record);
    return '<div class="pms176-workspace" data-pms176-record="' + esc(recordId(record)) + '">' +
      '<div class="pms176-top"><div class="pms176-photo">' + (photo ? '<img src="' + esc(photo) + '" alt="Foto passaporto">' : '<span>Foto<br>passaporto</span>') + '</div><div><h3>' + esc(recordTitle(record)) + '</h3><p>' + esc(recordId(record)) + ' - ' + esc(record.role || "") + ' - ' + esc(record.practiceStatus || record.status || "") + '</p><div class="pms176-actions"><button class="primary-button" data-pms176-save="' + esc(recordId(record)) + '">Salva scheda lavoro</button><button class="secondary-button" data-pms176-print-doc="' + esc(recordId(record)) + '">Documento foto/passaporto/privacy bilingue</button><button class="secondary-button" data-pms176-open-edit="' + esc(recordId(record)) + '">Modifica dati pratica</button><button class="secondary-button" data-pms176-export="' + esc(recordId(record)) + '">Excel</button></div></div></div>' +
      '<section class="pms176-panel"><h4>Dati trascinabili</h4><div class="pms176-chips">' + (chips(record) || '<small>Nessun dato disponibile.</small>') + '</div></section>' +
      '<section class="pms176-grid">' + SLOTS.map(slot => '<div class="pms176-slot" data-pms176-slot="' + esc(slot.key) + '"><header><strong>' + esc(slot.label) + '</strong><small>' + esc(slot.hint) + '</small></header><div class="pms176-slot-files">' + slotFiles(record, slot.key) + '</div><label class="pms176-upload">Carica file<input type="file" multiple data-pms176-upload="' + esc(slot.key) + '"></label></div>').join("") + '</section>' +
      '<section class="pms176-panel"><h4>Caselle documento</h4><form class="pms176-form" data-pms176-form="' + esc(recordId(record)) + '">' +
        field("Nome e cognome", "fullName", data.fullName) +
        field("Nazionalita", "nationality", data.nationality) +
        field("Paese / citta", "countryCity", data.countryCity || clean((data.country || record.country || "") + " " + (data.city || record.city || ""))) +
        field("Ruolo", "role", data.role) +
        field("Telefono", "phone", data.phone) +
        field("Email", "email", data.email) +
        field("Numero passaporto", "passportNumber", data.passportNumber) +
        field("Data rilascio / scadenza", "passportDates", data.passportDates) +
        field("Privacy italiano", "privacyItalian", data.privacyItalian, true) +
        field("Privacy romana", "privacyRomanian", data.privacyRomanian, true) +
        field("Note documento", "documentNotes", data.documentNotes, true) +
      '</form></section>' +
    '</div>';
  }
  function editRecordHtml(record){
    const fields = [
      ["fullName", "Nome completo", false],
      ["country", "Paese", false],
      ["city", "Citta", false],
      ["nationality", "Nazionalita", false],
      ["role", "Ruolo", false],
      ["profile", "Profilo", false],
      ["sourceChannel", "Canale", false],
      ["recruiter", "Recruiter", false],
      ["phone", "Telefono WhatsApp", false],
      ["email", "Email", false],
      ["status", "Stato", false],
      ["practiceStatus", "Stato pratica", false],
      ["documentRequests", "Documentazione richiesta", true],
      ["documents", "Scheda / documenti / competenze", true],
      ["notes", "Note interne", true]
    ];
    return '<form class="pms176-form" data-pms176-main-edit="' + esc(recordId(record)) + '">' + fields.map(item => {
      const key = item[0], label = item[1], textarea = item[2];
      const value = record[key] || "";
      return field(label, key, value, textarea);
    }).join("") + '<div class="pms176-actions"><button type="submit" class="primary-button">Salva dati pratica</button><button type="button" class="secondary-button" data-pms176-back-workspace="' + esc(recordId(record)) + '">Torna alla scheda lavoro</button></div></form>';
  }
  function modal(title, body){
    document.querySelectorAll(".pms176-modal-backdrop").forEach(node => node.remove());
    const wrap = document.createElement("div");
    wrap.className = "pms176-modal-backdrop";
    wrap.innerHTML = '<div class="pms176-modal"><div class="pms176-modal-head"><h3>' + esc(title) + '</h3><button type="button" class="secondary-button" data-pms176-close>Chiudi</button></div>' + body + '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", event => { if (event.target === wrap || event.target.closest("[data-pms176-close]")) wrap.remove(); });
    bindWorkspace(wrap);
    return wrap;
  }
  function openWorkspace(id){
    const record = findForeign(id);
    if (!record) return alert("Scheda estero non trovata: " + id);
    ensureWorkspace(record);
    writeForeign(record);
    modal("Scheda lavoro estero - " + recordTitle(record), workspaceHtml(record));
  }
  function openRecordEditor(id){
    const record = findForeign(id);
    if (!record) return alert("Scheda estero non trovata: " + id);
    modal("Modifica dati pratica - " + recordTitle(record), editRecordHtml(record));
  }
  function refreshWorkspace(id){
    const record = findForeign(id);
    const current = document.querySelector(".pms176-modal .pms176-workspace");
    if (!record || !current) return;
    current.outerHTML = workspaceHtml(record);
    bindWorkspace(document.querySelector(".pms176-modal-backdrop"));
  }
  function collectForm(record){
    const form = document.querySelector('[data-pms176-form="' + cssEscape(recordId(record)) + '"]');
    if (!form) return;
    record.pms176DocData = record.pms176DocData || {};
    Array.from(form.elements).forEach(el => { if (el.name) record.pms176DocData[el.name] = el.value; });
    record.fullName = record.pms176DocData.fullName || record.fullName;
    record.nationality = record.pms176DocData.nationality || record.nationality;
    record.role = record.pms176DocData.role || record.role;
    record.phone = record.pms176DocData.phone || record.phone;
    record.whatsapp = record.phone;
    record.email = record.pms176DocData.email || record.email;
    record.passportNumber = record.pms176DocData.passportNumber || record.passportNumber;
  }
  function saveWorkspace(id){
    const record = findForeign(id);
    if (!record) return;
    collectForm(record);
    record.practiceStatus = record.practiceStatus || "In lavorazione";
    writeForeign(record);
    refreshWorkspace(id);
  }
  function moveFile(record, fromSlot, fileId, toSlot){
    if (!record || fromSlot === toSlot) return;
    const from = arr(record.pms176DocSlots[fromSlot]);
    const index = from.findIndex(file => file && file._pms176Id === fileId);
    if (index < 0) return;
    const file = from.splice(index, 1)[0];
    record.pms176DocSlots[fromSlot] = from;
    record.pms176DocSlots[toSlot] = arr(record.pms176DocSlots[toSlot]).concat([file]);
    writeForeign(record);
  }
  function removeFile(record, slot, fileId){
    record.pms176DocSlots[slot] = arr(record.pms176DocSlots[slot]).filter(file => file && file._pms176Id !== fileId);
    writeForeign(record);
  }
  async function addFiles(record, slot, fileList){
    const files = await readFiles(fileList);
    record.pms176DocSlots[slot] = arr(record.pms176DocSlots[slot]).concat(files);
    if (slot === "photoPassport") {
      const img = files.find(file => String(file.type || "").startsWith("image/") || /^data:image\//.test(file.dataUrl || ""));
      if (img) record.photo = {name:img.name, type:img.type, dataUrl:img.dataUrl};
    }
    writeForeign(record);
  }
  function printableDocument(record){
    collectForm(record);
    ensureWorkspace(record);
    const data = record.pms176DocData || {};
    const photo = photoSrc(record);
    const passportFiles = arr(record.pms176DocSlots.passport);
    const privacyFiles = arr(record.pms176DocSlots.bilingualPrivacy);
    const attachmentLine = function(files){ return files.map(file => esc(file.name)).join("<br>") || "-"; };
    return '<div class="pms176-print-sheet">' +
      '<div class="pms176-print-head"><div><h1>Foto passaporto / Privacy bilingue</h1><strong>Parmitalia Management System</strong></div><div>' + esc(today()) + '<br>' + esc(recordId(record)) + '</div></div>' +
      '<div class="pms176-print-main"><div class="pms176-print-photo">' + (photo ? '<img src="' + esc(photo) + '" alt="Foto passaporto">' : '<span>Foto passaporto</span>') + '</div><table><tbody>' +
      '<tr><th>Nome e cognome</th><td>' + esc(data.fullName || record.fullName || "") + '</td></tr>' +
      '<tr><th>Nazionalita</th><td>' + esc(data.nationality || record.nationality || "") + '</td></tr>' +
      '<tr><th>Paese / citta</th><td>' + esc(data.countryCity || clean((record.country || "") + " " + (record.city || ""))) + '</td></tr>' +
      '<tr><th>Ruolo</th><td>' + esc(data.role || record.role || "") + '</td></tr>' +
      '<tr><th>Telefono / email</th><td>' + esc((data.phone || record.phone || "") + " " + (data.email || record.email || "")) + '</td></tr>' +
      '<tr><th>Passaporto</th><td>' + esc(data.passportNumber || record.passportNumber || "") + '<br>' + attachmentLine(passportFiles) + '</td></tr>' +
      '<tr><th>Privacy bilingue allegata</th><td>' + attachmentLine(privacyFiles) + '</td></tr>' +
      '</tbody></table></div>' +
      '<h2>Informativa privacy - Italiano</h2><p>' + esc(data.privacyItalian || "") + '</p>' +
      '<h2>Informare confidentialitate - Romana</h2><p>' + esc(data.privacyRomanian || "") + '</p>' +
      '<h2>Note documento</h2><p>' + esc(data.documentNotes || record.notes || "") + '</p>' +
      '<div class="pms176-sign"><div>Firma candidato<br><br></div><div>Firma Parmitalia<br><br></div></div>' +
    '</div>';
  }
  function printDocument(id){
    const record = findForeign(id);
    if (!record) return;
    const html = printableDocument(record);
    writeForeign(record);
    if (typeof openPrint === "function") {
      openPrint(html);
      return;
    }
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Documento estero</title><style>' + printCss() + '</style></head><body>' + html + '<script>window.onload=function(){window.print();};<\/script></body></html>');
    w.document.close();
  }
  function exportRecord(id){
    const record = findForeign(id);
    if (!record) return;
    ensureWorkspace(record);
    const rows = [];
    Object.keys(record).forEach(key => {
      let value = record[key];
      if (key === "pms176DocSlots") value = SLOTS.map(slot => slot.label + ": " + arr(record.pms176DocSlots[slot.key]).map(file => file.name).join(", ")).join(" | ");
      else if (value && typeof value === "object") value = JSON.stringify(value);
      rows.push([key, value == null ? "" : value]);
    });
    const table = '<html><head><meta charset="utf-8"></head><body><table>' + rows.map(row => '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1]) + '</td></tr>').join("") + '</table></body></html>';
    const blob = new Blob([table], {type:"application/vnd.ms-excel;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = ("scheda-estero-" + id + ".xls").replace(/[^\w.-]+/g, "_");
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function cssEscape(value){
    if (window.CSS && typeof CSS.escape === "function") return CSS.escape(String(value));
    return String(value).replace(/["\\]/g, "\\$&");
  }
  function rowId(row){
    if (!row) return "";
    const explicit = row.querySelector("[data-pms128-foreign-open],[data-pms125-rec-open],[data-pms175-open],[data-id]");
    if (explicit) {
      const raw = explicit.getAttribute("data-pms128-foreign-open") || explicit.getAttribute("data-pms125-rec-open") || explicit.getAttribute("data-pms175-open") || explicit.getAttribute("data-id") || "";
      return raw.includes(":") ? raw.split(":").pop() : raw;
    }
    const first = row.cells && row.cells[0] ? clean(row.cells[0].textContent).split(/\s+/)[0] : "";
    return first.replace(/[;:,]+$/g, "");
  }
  function appendWorkspaceButtons(){
    const page = window.current && current.page || "";
    if (!["foreignEmployees", "foreignRecruiting", "humanResources"].includes(page)) return;
    document.querySelectorAll("#content table tbody tr").forEach(row => {
      const id = rowId(row);
      if (!id || !findForeign(id)) return;
      const cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell || cell.querySelector('[data-pms176-workspace="' + cssEscape(id) + '"]')) return;
      let host = cell.querySelector(".pms128-row-actions,.pms175-row-actions,.pms125-actions") || cell.querySelector("div") || cell;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "inline-button pms176-work-btn";
      button.textContent = "Apri scheda lavoro";
      button.setAttribute("data-pms176-workspace", id);
      host.appendChild(button);
    });
  }
  function bindWorkspace(root){
    root = root || document;
    root.querySelectorAll("[data-pms176-chip]").forEach(chip => {
      chip.ondragstart = event => {
        event.dataTransfer.setData("text/plain", chip.getAttribute("data-pms176-chip") || chip.textContent || "");
        event.dataTransfer.effectAllowed = "copy";
      };
    });
    root.querySelectorAll("[data-pms176-dropfield]").forEach(field => {
      field.ondragover = event => { event.preventDefault(); };
      field.ondrop = event => {
        const text = event.dataTransfer && event.dataTransfer.getData("text/plain");
        if (!text) return;
        event.preventDefault();
        const start = field.selectionStart || field.value.length;
        const end = field.selectionEnd || field.value.length;
        const prefix = field.value.slice(0, start);
        const suffix = field.value.slice(end);
        field.value = prefix + text + suffix;
      };
    });
    root.querySelectorAll("[data-pms176-file]").forEach(card => {
      card.ondragstart = event => {
        event.dataTransfer.setData("application/x-pms176-file", card.getAttribute("data-pms176-file"));
        event.dataTransfer.effectAllowed = "move";
      };
    });
    root.querySelectorAll("[data-pms176-slot]").forEach(slot => {
      slot.ondragover = event => { event.preventDefault(); slot.classList.add("pms176-over"); };
      slot.ondragleave = () => slot.classList.remove("pms176-over");
      slot.ondrop = async event => {
        event.preventDefault();
        slot.classList.remove("pms176-over");
        const recordIdValue = root.querySelector(".pms176-workspace")?.getAttribute("data-pms176-record") || "";
        const record = findForeign(recordIdValue);
        if (!record) return;
        const targetSlot = slot.getAttribute("data-pms176-slot");
        const raw = event.dataTransfer && event.dataTransfer.getData("application/x-pms176-file");
        if (raw) {
          const parts = raw.split(":");
          moveFile(record, parts[0], parts.slice(1).join(":"), targetSlot);
        } else if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          await addFiles(record, targetSlot, event.dataTransfer.files);
        }
        refreshWorkspace(recordIdValue);
      };
    });
  }
  function bindActions(){
    document.querySelectorAll("[data-pms176-workspace]").forEach(button => {
      button.onclick = event => { event.preventDefault(); event.stopPropagation(); openWorkspace(button.getAttribute("data-pms176-workspace")); };
    });
    document.querySelectorAll("[data-pms176-save]").forEach(button => {
      button.onclick = event => { event.preventDefault(); saveWorkspace(button.getAttribute("data-pms176-save")); };
    });
    document.querySelectorAll("[data-pms176-print-doc]").forEach(button => {
      button.onclick = event => { event.preventDefault(); printDocument(button.getAttribute("data-pms176-print-doc")); };
    });
    document.querySelectorAll("[data-pms176-export]").forEach(button => {
      button.onclick = event => { event.preventDefault(); exportRecord(button.getAttribute("data-pms176-export")); };
    });
    document.querySelectorAll("[data-pms176-open-edit]").forEach(button => {
      button.onclick = event => {
        event.preventDefault();
        openRecordEditor(button.getAttribute("data-pms176-open-edit"));
      };
    });
    document.querySelectorAll("[data-pms176-main-edit]").forEach(form => {
      form.onsubmit = event => {
        event.preventDefault();
        const id = form.getAttribute("data-pms176-main-edit");
        const record = findForeign(id);
        if (!record) return;
        Array.from(form.elements).forEach(el => { if (el.name) record[el.name] = el.value; });
        record.whatsapp = record.phone || record.whatsapp;
        writeForeign(record);
        openWorkspace(id);
      };
    });
    document.querySelectorAll("[data-pms176-back-workspace]").forEach(button => {
      button.onclick = event => { event.preventDefault(); openWorkspace(button.getAttribute("data-pms176-back-workspace")); };
    });
    document.querySelectorAll("[data-pms176-upload]").forEach(input => {
      input.onchange = async () => {
        const workspace = input.closest(".pms176-workspace");
        const id = workspace && workspace.getAttribute("data-pms176-record");
        const record = findForeign(id);
        if (!record) return;
        await addFiles(record, input.getAttribute("data-pms176-upload"), input.files);
        refreshWorkspace(id);
      };
    });
    document.querySelectorAll("[data-pms176-remove]").forEach(button => {
      button.onclick = event => {
        event.preventDefault();
        const workspace = button.closest(".pms176-workspace");
        const id = workspace && workspace.getAttribute("data-pms176-record");
        const record = findForeign(id);
        if (!record || !confirm("Rimuovere questo documento dalla scheda lavoro?")) return;
        const parts = button.getAttribute("data-pms176-remove").split(":");
        removeFile(record, parts[0], parts.slice(1).join(":"));
        refreshWorkspace(id);
      };
    });
    bindWorkspace(document);
  }
  function interceptOldClicks(event){
    const target = event.target && event.target.closest("[data-pms128-foreign-open],[data-pms125-rec-open]");
    if (!target) return;
    const id = target.getAttribute("data-pms128-foreign-open") || target.getAttribute("data-pms125-rec-open");
    if (!id || !findForeign(id)) return;
    event.preventDefault();
    event.stopPropagation();
    openWorkspace(id);
  }
  function printCss(){
    return ".pms176-print-sheet{width:190mm;min-height:277mm;margin:0 auto;background:#fff;color:#111;font-family:Arial,sans-serif;font-size:11px}.pms176-print-head{display:flex;justify-content:space-between;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:10px}.pms176-print-head h1{font-size:20px;margin:0 0 4px}.pms176-print-main{display:grid;grid-template-columns:42mm 1fr;gap:10px}.pms176-print-photo{border:1px solid #111;min-height:52mm;display:grid;place-items:center;text-align:center}.pms176-print-photo img{max-width:100%;max-height:54mm;object-fit:cover}.pms176-print-main table{width:100%;border-collapse:collapse}.pms176-print-main th,.pms176-print-main td{border:1px solid #111;padding:5px;text-align:left;vertical-align:top}.pms176-print-sheet h2{font-size:13px;margin:12px 0 4px}.pms176-print-sheet p{border:1px solid #111;min-height:26mm;margin:0;padding:6px;white-space:pre-wrap}.pms176-sign{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:18px}.pms176-sign div{border-top:1px solid #111;padding-top:8px;min-height:24mm}@page{size:A4;margin:10mm}@media print{body{margin:0}.pms176-print-sheet{width:auto;min-height:auto}}";
  }
  function injectCss(){
    let style = document.getElementById("pms-v176-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v176-style";
      document.head.appendChild(style);
    }
    style.textContent = ".pms176-work-btn{border-color:#376f52!important;background:#eef7f0!important;color:#143624!important}.pms176-modal-backdrop{position:fixed;inset:0;z-index:33000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:14px}.pms176-modal{width:min(1180px,97vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px;box-shadow:0 24px 80px rgba(15,23,42,.35)}.pms176-modal-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.pms176-modal-head h3{margin:0;color:#0f172a}.pms176-workspace{display:grid;gap:12px}.pms176-top{display:grid;grid-template-columns:92px 1fr;gap:12px;align-items:center;border:1px solid #d7dee8;background:#f8fafc;padding:10px;border-radius:8px}.pms176-top h3{margin:0 0 3px;color:#10251d}.pms176-top p{margin:0 0 8px;color:#64748b}.pms176-photo{width:88px;height:108px;border:1px solid #b8c7d8;background:#fff;display:grid;place-items:center;text-align:center;font-size:11px;color:#64748b;overflow:hidden}.pms176-photo img{width:100%;height:100%;object-fit:cover}.pms176-actions{display:flex;flex-wrap:wrap;gap:7px}.pms176-actions button{width:auto!important;margin:0!important}.pms176-panel{border:1px solid #d7dee8;background:#fff;border-radius:8px;padding:10px}.pms176-panel h4{margin:0 0 8px;color:#0f172a}.pms176-chips{display:flex;flex-wrap:wrap;gap:7px}.pms176-chip{width:auto!important;margin:0!important;border:1px solid #cbd5e1!important;background:#fff!important;color:#17242b!important;border-radius:999px!important;padding:5px 9px!important;cursor:grab!important;font-size:11px!important}.pms176-chip span{font-weight:900;color:#3f6b50;margin-right:5px}.pms176-grid{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:10px}.pms176-slot{border:1px dashed #aebdca;border-radius:8px;background:#fbfdff;min-height:170px;padding:9px;display:grid;grid-template-rows:auto 1fr auto;gap:8px}.pms176-slot.pms176-over{background:#eef7f0;border-color:#376f52}.pms176-slot header strong{display:block;color:#0f172a}.pms176-slot header small{display:block;color:#64748b;font-size:10px;line-height:1.25}.pms176-slot-files{display:grid;gap:7px;align-content:start}.pms176-file{display:grid;grid-template-columns:36px 1fr auto;gap:7px;align-items:center;border:1px solid #e2e8f0;background:#fff;border-radius:7px;padding:6px;cursor:grab}.pms176-file img,.pms176-file span{width:34px;height:34px;border:1px solid #d7dee8;display:grid;place-items:center;object-fit:cover;font-size:9px;font-weight:900;color:#475569;background:#f8fafc}.pms176-file strong{display:block;font-size:10px;color:#0f172a;word-break:break-word}.pms176-file small{display:block;font-size:9px;color:#64748b}.pms176-file button{width:22px!important;height:22px!important;padding:0!important;margin:0!important}.pms176-upload{display:grid;place-items:center;border:1px solid #d7dee8;border-radius:7px;background:#fff;padding:7px;font-size:11px;font-weight:800;color:#315a43;cursor:pointer}.pms176-upload input{display:none}.pms176-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pms176-form label{display:grid;gap:4px;color:#475569;font-size:12px;font-weight:800}.pms176-form input,.pms176-form textarea{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:6px;padding:7px;font:inherit}.pms176-form textarea{min-height:88px}.pms176-form label:nth-last-child(-n+3){grid-column:1/-1}@media(max-width:1100px){.pms176-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.pms176-top,.pms176-form,.pms176-grid{grid-template-columns:1fr}.pms176-photo{width:100%;height:150px}}@media print{.pms176-modal-backdrop{position:static;display:block;background:#fff;padding:0}.pms176-modal-head,.pms176-actions,.pms176-panel,.pms176-grid{display:none!important}}" + printCss();
  }
  function decorate(){
    st();
    injectCss();
    appendWorkspaceButtons();
    bindActions();
  }

  document.addEventListener("click", interceptOldClicks, true);

  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms176Wrapped) {
    window.render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 60);
      return result;
    };
    window.render.__pms176Wrapped = true;
  }

  setInterval(decorate, 1600);
  setTimeout(decorate, 150);
  window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE = {version:VERSION, openWorkspace, printDocument};
})();
