(function(){
  "use strict";

  const VERSION = "pms_v167_drag_drop_document_archive";
  const MAX_EMBED_BYTES = 12 * 1024 * 1024;
  const DOC_TYPES = ["Tutti", "Fattura", "Proforma", "Contratto", "Packing List", "Listino", "Trasporto", "Pagamento", "Documento prodotto", "Email / Comunicazione", "Identita / personale", "Altro"];

  function st(){
    window.state = window.state || {};
    state.documents = Array.isArray(state.documents) ? state.documents : [];
    window.current = window.current || { filters:{} };
    current.filters = current.filters || {};
    return state;
  }
  function esc(value){
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      localStorage.setItem(typeof STORAGE_KEY !== "undefined" ? STORAGE_KEY : "parmitalia-management-state", JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Documento registrato, ma il salvataggio locale non e riuscito. Il file potrebbe essere troppo grande.");
      return false;
    }
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function nextDocId(){
    if (typeof nextSequentialCode === "function") return nextSequentialCode("DOC", st().documents);
    const year = new Date().getFullYear();
    const re = new RegExp("^DOC-" + year + "-(\\d{4})$");
    const max = st().documents.reduce(function(acc, doc){
      const m = String(doc.id || "").match(re);
      return m ? Math.max(acc, Number(m[1])) : acc;
    }, 0);
    return "DOC-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function extensionOf(name){
    const clean = String(name || "").split(/[\\/]/).pop();
    const dot = clean.lastIndexOf(".");
    return dot >= 0 ? clean.slice(dot + 1).toLowerCase() : "";
  }
  function humanSize(bytes){
    const n = Number(bytes || 0);
    if (!n) return "-";
    if (n < 1024) return n + " B";
    if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace(".0", "") + " KB";
    return (n / 1024 / 1024).toFixed(1).replace(".0", "") + " MB";
  }
  function detectDocType(file){
    const name = String(file && file.name || "").toLowerCase();
    const ext = extensionOf(name);
    const type = String(file && file.type || "").toLowerCase();
    if (/fatt|factur|invoice|inv-|fattura/.test(name)) return "Fattura";
    if (/proforma|pro-forma|prof/.test(name)) return "Proforma";
    if (/contratt|contract|agreement|accord|mandato|nda|loi/.test(name)) return "Contratto";
    if (/packing|pallet|container|pack-list|packlist/.test(name)) return "Packing List";
    if (/listino|price|prezzo|prices|quotation|offerta|offer/.test(name)) return "Listino";
    if (/trasport|transport|cmr|awb|bill.of.lading|bl_|b-l|delivery|consegna/.test(name)) return "Trasporto";
    if (/pagament|payment|bonifico|swift|bank|banca|estratto|statement|receipt|ricevuta/.test(name)) return "Pagamento";
    if (/scheda|product|prodotto|certificat|certificate|spec|technical|analisi|analysis|haccp|halal|kosher/.test(name)) return "Documento prodotto";
    if (/mail|email|pec|comunicazione|lettera|letter/.test(name)) return "Email / Comunicazione";
    if (/passport|passaport|identity|identita|idcard|permesso|visa|cv|resume|candidato|candidate/.test(name)) return "Identita / personale";
    if (["pdf"].includes(ext) || type.includes("pdf")) return "Altro";
    if (["xls", "xlsx", "csv"].includes(ext)) return "Listino";
    if (["doc", "docx", "rtf", "odt"].includes(ext)) return "Contratto";
    if (["jpg", "jpeg", "png", "webp", "gif", "tif", "tiff"].includes(ext)) return "Altro";
    return "Altro";
  }
  function linkedTypeForDocType(docType){
    if (docType === "Fattura" || docType === "Pagamento") return "Pagamento";
    if (docType === "Contratto") return "Contratto";
    if (docType === "Packing List") return "Ordine";
    if (docType === "Documento prodotto" || docType === "Listino") return "Altro";
    return "Altro";
  }
  function possibleLinkedCode(fileName){
    const text = String(fileName || "");
    const match = text.match(/\b(OFF|ORD|INT|DOC|CTR|PAY|PRD|ACC|EST|TASK)[-_ ]?\d{3,4}(?:[-_ ]?\d{2,4})?\b/i) || text.match(/\b(OFF|ORD|INT|DOC|CTR|PAY|PRD)-\d{4}-\d{4}\b/i);
    return match ? match[0].replace(/_/g, "-").replace(/\s+/g, "-").toUpperCase() : "";
  }
  function readFileAsDataUrl(file){
    return new Promise(function(resolve){
      if (!file || Number(file.size || 0) > MAX_EMBED_BYTES) return resolve("");
      const reader = new FileReader();
      reader.onload = function(){ resolve(String(reader.result || "")); };
      reader.onerror = function(){ resolve(""); };
      reader.readAsDataURL(file);
    });
  }
  async function registerFiles(files){
    const list = Array.from(files || []).filter(Boolean);
    if (!list.length) return;
    st();
    let added = 0;
    for (const file of list) {
      const docType = detectDocType(file);
      const dataUrl = await readFileAsDataUrl(file);
      const filePath = file.path || file.localPath || "";
      const id = nextDocId();
      const duplicate = state.documents.find(function(doc){
        return String(doc.fileName || "") === String(file.name || "") && Number(doc.fileSize || 0) === Number(file.size || 0);
      });
      if (duplicate) continue;
      state.documents.unshift({
        id: id,
        linkedCode: possibleLinkedCode(file.name),
        linkedType: linkedTypeForDocType(docType),
        docType: docType,
        category: docType,
        genre: docType,
        fileName: file.name || "Documento senza nome",
        fileExtension: extensionOf(file.name),
        mimeType: file.type || "",
        fileSize: Number(file.size || 0),
        fileSizeText: humanSize(file.size),
        filePath: filePath,
        externalLink: filePath || "",
        embeddedDataUrl: dataUrl,
        storedInArchive: dataUrl ? "Si" : "Solo riferimento",
        date: today(),
        importedAt: new Date().toISOString(),
        status: "Archiviato",
        notes: dataUrl ? "Importato con trascinamento nell'archivio documenti." : "File registrato automaticamente. Contenuto non incorporato per dimensione elevata o limitazione browser."
      });
      added += 1;
    }
    saveNow();
    if (typeof render === "function") render();
    setTimeout(function(){
      const msg = document.getElementById("pms167-doc-message");
      if (msg) msg.textContent = added ? (added + " documenti registrati e catalogati.") : "Documento gia presente in archivio.";
    }, 80);
  }
  function categoryCounts(){
    const counts = {};
    st().documents.forEach(function(doc){
      const key = doc.category || doc.genre || doc.docType || "Altro";
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }
  function renderDropZone(){
    const counts = categoryCounts();
    const currentCat = current.filters.documentsCategory || "Tutti";
    const chips = DOC_TYPES.map(function(type){
      const active = type === currentCat ? " active" : "";
      const count = type === "Tutti" ? st().documents.length : (counts[type] || 0);
      return '<button type="button" class="pms167-chip' + active + '" data-pms167-category="' + esc(type) + '">' + esc(type) + ' <span>' + count + '</span></button>';
    }).join("");
    return '<section class="pms167-doc-hero">' +
      '<div class="pms167-drop" id="pms167-doc-drop" tabindex="0">' +
        '<input id="pms167-doc-file-input" type="file" multiple hidden>' +
        '<div class="pms167-drop-icon">DOC</div>' +
        '<div><h3>Trascina qui PDF, Word, Excel, immagini o qualsiasi documento</h3><p>Il gestionale li registra automaticamente, riconosce il genere e li salva nell&apos;Archivio documenti.</p><div id="pms167-doc-message">Puoi anche usare il pulsante Scegli file.</div></div>' +
        '<button type="button" class="primary-button" data-pms167-choose>Scegli file</button>' +
      '</div>' +
      '<div class="pms167-categories">' + chips + '</div>' +
    '</section>';
  }
  function filteredDocuments(){
    const search = String(current.filters.documents || "").toLowerCase();
    const cat = current.filters.documentsCategory || "Tutti";
    return st().documents.filter(function(doc){
      const docCat = doc.category || doc.genre || doc.docType || "Altro";
      if (cat !== "Tutti" && docCat !== cat) return false;
      if (!search) return true;
      return JSON.stringify(doc).toLowerCase().includes(search);
    });
  }
  function renderDocumentsArchive(){
    const search = current.filters.documents || "";
    const rows = filteredDocuments().map(function(doc){
      const docType = doc.category || doc.genre || doc.docType || "Altro";
      const canOpen = doc.embeddedDataUrl || doc.filePath || doc.externalLink;
      return '<tr>' +
        '<td><span class="code-block">' + esc(doc.id || "") + '</span></td>' +
        '<td><strong>' + esc(docType) + '</strong><br><small>' + esc(doc.mimeType || doc.fileExtension || "") + '</small></td>' +
        '<td><strong>' + esc(doc.fileName || "-") + '</strong><br><small>' + esc(doc.fileSizeText || humanSize(doc.fileSize)) + '</small></td>' +
        '<td>' + esc(doc.linkedCode || "-") + '<br><small>' + esc(doc.linkedType || "-") + '</small></td>' +
        '<td>' + esc(doc.date || "-") + '<br><small>' + esc(doc.status || "Archiviato") + '</small></td>' +
        '<td class="pms167-actions">' +
          (canOpen ? '<button class="inline-button" data-pms167-open="' + esc(doc.id) + '">Apri</button>' : '') +
          (doc.embeddedDataUrl ? '<button class="inline-button" data-pms167-download="' + esc(doc.id) + '">Scarica</button>' : '') +
          '<button class="inline-button" data-edit="documents" data-id="' + esc(doc.id) + '">Modifica</button> ' +
          '<button class="inline-danger" data-delete="documents" data-id="' + esc(doc.id) + '">Elimina</button>' +
        '</td>' +
      '</tr>';
    }).join("");
    return renderDropZone() +
      '<div class="section-header pms167-doc-head"><h3>Archivio documenti</h3><div class="filters"><input data-search="documents" placeholder="Cerca documento, codice, cliente..." value="' + esc(search) + '"><button class="primary-button" style="width:auto;margin:0" data-add="documents">+ Nuovo manuale</button></div></div>' +
      '<div class="table-wrap pms167-doc-table"><table><thead><tr><th>Codice</th><th>Genere</th><th>File</th><th>Collegamento</th><th>Data / Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="empty">Nessun documento in questa categoria.</td></tr>') + '</tbody></table></div>';
  }
  function openDoc(id, download){
    const doc = st().documents.find(function(item){ return item.id === id; });
    if (!doc) return alert("Documento non trovato.");
    if (doc.embeddedDataUrl) {
      if (download) {
        const a = document.createElement("a");
        a.href = doc.embeddedDataUrl;
        a.download = doc.fileName || (doc.id + "." + (doc.fileExtension || "dat"));
        document.body.appendChild(a);
        a.click();
        setTimeout(function(){ a.remove(); }, 100);
      } else {
        const w = window.open();
        if (w) {
          w.document.write('<iframe src="' + esc(doc.embeddedDataUrl) + '" style="border:0;width:100%;height:100vh"></iframe>');
          w.document.close();
        }
      }
      return;
    }
    const link = doc.filePath || doc.externalLink;
    if (link) {
      const href = /^[a-z]+:/i.test(link) ? link : "file:///" + String(link).replace(/\\/g, "/");
      window.open(href, "_blank");
      return;
    }
    alert("Il documento e registrato, ma non contiene un file apribile. Ricaricalo trascinandolo di nuovo nell'archivio.");
  }
  function bindDocuments(){
    const drop = document.getElementById("pms167-doc-drop");
    const input = document.getElementById("pms167-doc-file-input");
    const choose = document.querySelector("[data-pms167-choose]");
    if (choose && input) choose.onclick = function(){ input.click(); };
    if (input) input.onchange = function(event){
      registerFiles(event.target.files);
      input.value = "";
    };
    if (drop && drop.dataset.pms167Bound !== "1") {
      drop.dataset.pms167Bound = "1";
      ["dragenter", "dragover"].forEach(function(name){
        drop.addEventListener(name, function(event){
          event.preventDefault();
          event.stopPropagation();
          drop.classList.add("dragging");
        });
      });
      ["dragleave", "drop"].forEach(function(name){
        drop.addEventListener(name, function(event){
          event.preventDefault();
          event.stopPropagation();
          drop.classList.remove("dragging");
        });
      });
      drop.addEventListener("drop", function(event){
        registerFiles(event.dataTransfer && event.dataTransfer.files);
      });
    }
    document.querySelectorAll("[data-pms167-category]").forEach(function(btn){
      btn.onclick = function(){
        current.filters.documentsCategory = btn.getAttribute("data-pms167-category") || "Tutti";
        if (typeof render === "function") render();
      };
    });
    document.querySelectorAll("[data-pms167-open]").forEach(function(btn){
      btn.onclick = function(){ openDoc(btn.getAttribute("data-pms167-open"), false); };
    });
    document.querySelectorAll("[data-pms167-download]").forEach(function(btn){
      btn.onclick = function(){ openDoc(btn.getAttribute("data-pms167-download"), true); };
    });
  }
  function injectCss(){
    let style = document.getElementById("pms-v167-drag-drop-document-archive-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v167-drag-drop-document-archive-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms167-doc-hero{display:grid;gap:12px;margin-bottom:14px}
      .pms167-drop{display:grid;grid-template-columns:76px minmax(0,1fr) auto;align-items:center;gap:14px;border:2px dashed rgba(95,143,109,.45);border-radius:8px;background:linear-gradient(90deg,rgba(95,143,109,.12),#fff,rgba(189,122,120,.1));padding:18px;box-shadow:0 6px 20px rgba(30,45,60,.06)}
      .pms167-drop.dragging{border-color:#3f6b50;background:linear-gradient(90deg,rgba(95,143,109,.24),#fff,rgba(189,122,120,.18));box-shadow:0 0 0 4px rgba(95,143,109,.12)}
      .pms167-drop-icon{width:64px;height:64px;border-radius:8px;display:grid;place-items:center;background:linear-gradient(135deg,#5f8f6d,#fff 52%,#bd7a78);border:1px solid rgba(95,143,109,.28);font-weight:950;color:#17242b}
      .pms167-drop h3{margin:0 0 4px;color:#17242b;font-size:18px}
      .pms167-drop p{margin:0;color:#52606d;font-size:13px;line-height:1.35}
      #pms167-doc-message{margin-top:6px;font-size:12px;font-weight:900;color:#3f6b50}
      .pms167-categories{display:flex;gap:7px;flex-wrap:wrap}
      .pms167-chip{border:1px solid #dfe9e4;background:#fff;border-radius:8px;padding:7px 10px;font-size:12px;font-weight:900;color:#17242b;cursor:pointer}
      .pms167-chip.active,.pms167-chip:hover{border-color:rgba(95,143,109,.5);background:linear-gradient(90deg,rgba(95,143,109,.16),#fff,rgba(189,122,120,.12))}
      .pms167-chip span{display:inline-flex;margin-left:5px;color:#3f6b50}
      .pms167-doc-head{margin-top:14px}
      .pms167-doc-table td{vertical-align:top}
      .pms167-actions{white-space:nowrap}
      .pms167-actions button{margin-right:4px}
      @media(max-width:860px){.pms167-drop{grid-template-columns:1fr}.pms167-drop .primary-button{width:100%!important}}
    `;
  }
  function patchSchemas(){
    if (!window.schemas) return;
    schemas.documents = schemas.documents || { title:"Documento archiviato", fields:[] };
    schemas.documents.title = "Documento archiviato";
    const keys = new Set((schemas.documents.fields || []).map(function(field){ return field.key; }));
    const add = function(field){ if (!keys.has(field.key)) { schemas.documents.fields.push(field); keys.add(field.key); } };
    add({ key:"category", label:"Categoria automatica", type:"select", options:DOC_TYPES.filter(function(x){ return x !== "Tutti"; }) });
    add({ key:"fileExtension", label:"Formato file", type:"text" });
    add({ key:"fileSizeText", label:"Dimensione", type:"text" });
    add({ key:"filePath", label:"Percorso file locale", type:"text", full:true });
  }
  function wrapRender(){
    if (typeof render !== "function" || render.pms167Wrapped) return;
    const base = render;
    render = function(){
      if (window.current && current.page === "documents") {
        const content = document.getElementById("content");
        if (!content) return base.apply(this, arguments);
        patchSchemas();
        injectCss();
        content.innerHTML = renderDocumentsArchive();
        if (typeof bindPageActions === "function") bindPageActions();
        bindDocuments();
        return;
      }
      const result = base.apply(this, arguments);
      setTimeout(function(){
        if (window.current && current.page === "documents") bindDocuments();
      }, 0);
      return result;
    };
    render.pms167Wrapped = true;
    window.render = render;
  }
  function install(){
    st();
    patchSchemas();
    injectCss();
    wrapRender();
    if (window.current && current.page === "documents" && typeof render === "function") render();
    window.PMS_V167_DRAG_DROP_DOCUMENT_ARCHIVE = { version: VERSION, registerFiles: registerFiles };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
