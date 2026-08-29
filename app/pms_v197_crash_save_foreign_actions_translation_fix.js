(function(){
  "use strict";

  const VERSION = "pms_v197_crash_save_foreign_actions_translation_fix";
  const FOREIGN_MODULES = ["foreignEmployees", "foreignRecruiting"];
  const COLUMNS = ["id", "fullName", "country", "role", "phone", "status", "practiceStatus", "actions"];
  const LOCAL_DICT = {
    EN: {
      "Archivio dipendenti estero":"Foreign employees archive","Archivio recruiting estero":"Foreign recruiting archive","Modifica":"Edit","Stampa":"Print","Elimina":"Delete","Nuovo":"New","Cerca":"Search","Azioni":"Actions","Nome completo":"Full name","Paese":"Country","Ruolo":"Role","Telefono":"Phone","Stato":"Status","Stato pratica":"Case status","Documenti":"Documents","Note":"Notes","Dipendenti estero":"Foreign employees","Recruiting estero":"Foreign recruiting","Scheda candidato estero":"Foreign candidate file","Eliminare definitivamente questa scheda estero?":"Delete this foreign file permanently?","Scheda non trovata":"File not found"
    },
    RO: {
      "Archivio dipendenti estero":"Arhiva angajati strainatate","Archivio recruiting estero":"Arhiva recrutare externa","Modifica":"Modifica","Stampa":"Printeaza","Elimina":"Sterge","Nuovo":"Nou","Cerca":"Cauta","Azioni":"Actiuni","Nome completo":"Nume complet","Paese":"Tara","Ruolo":"Rol","Telefono":"Telefon","Stato":"Stare","Stato pratica":"Stare dosar","Documenti":"Documente","Note":"Note","Dipendenti estero":"Angajati strainatate","Recruiting estero":"Recrutare externa","Scheda candidato estero":"Fisa candidat strain","Eliminare definitivamente questa scheda estero?":"Stergeti definitiv aceasta fisa externa?","Scheda non trovata":"Fisa nu a fost gasita"
    },
    AR: {
      "Archivio dipendenti estero":"Foreign employees archive","Archivio recruiting estero":"Foreign recruiting archive","Modifica":"Edit","Stampa":"Print","Elimina":"Delete","Nuovo":"New","Cerca":"Search","Azioni":"Actions","Nome completo":"Full name","Paese":"Country","Ruolo":"Role","Telefono":"Phone","Stato":"Status","Stato pratica":"Case status","Documenti":"Documents","Note":"Notes","Dipendenti estero":"Foreign employees","Recruiting estero":"Foreign recruiting","Scheda candidato estero":"Foreign candidate file","Eliminare definitivamente questa scheda estero?":"Delete this foreign file permanently?","Scheda non trovata":"File not found"
    }
  };
  const originalTextNodes = new WeakMap();

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function st(){
    if (typeof state === "undefined" || !state) window.state = window.state || {};
    FOREIGN_MODULES.forEach(function(key){ if (!Array.isArray(state[key])) state[key] = []; });
    if (state.foreignEmployees.length && !state.foreignRecruiting.length) state.foreignRecruiting = state.foreignEmployees.slice();
    if (state.foreignRecruiting.length && !state.foreignEmployees.length) state.foreignEmployees = state.foreignRecruiting.slice();
    return state;
  }
  function lang(){
    const s = st().settings || {};
    const code = s.appLanguage || s.defaultLanguage || s.printLanguage || "IT";
    return ["IT","EN","RO","AR"].includes(code) ? code : "IT";
  }
  function tr(text, target){
    const code = target || lang();
    if (code === "IT") return text;
    const value = clean(text);
    const local = LOCAL_DICT[code] && LOCAL_DICT[code][value];
    if (local) return local;
    const api = window.PMS_V178_FULL_LANGUAGE_AND_CODE128_BARCODE_FIX;
    if (api && typeof api.translateText === "function") {
      if (String(text || "").length < 850) return api.translateText(text, code);
      return String(text || "").split(/(\n+|[.!?]\s+)/).map(function(piece){
        return piece.length > 850 ? piece : api.translateText(piece, code);
      }).join("");
    }
    return text;
  }
  function saveNow(reason){
    try {
      if (typeof save === "function") save();
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      } else if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow(reason || VERSION);
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function idOf(record){ return clean(record && (record.id || record.code || record.protocol || record.practiceCode)); }
  function titleOf(record){ return clean(record && (record.fullName || record.name || record.title || record.email || idOf(record))) || "Scheda estero"; }
  function phoneOf(record){ return clean(record && (record.phone || record.whatsapp || record.telephone)); }
  function unique(list){
    const seen = new Set();
    return arr(list).filter(function(record){
      const id = idOf(record);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  function listFor(module){
    st();
    return unique(state[module]);
  }
  function findForeign(id){
    const value = clean(id);
    let found = null;
    FOREIGN_MODULES.some(function(module){
      found = arr(st()[module]).find(function(record){ return idOf(record) === value; });
      return !!found;
    });
    return found;
  }
  function writeForeign(record){
    if (!record) return;
    const id = idOf(record);
    FOREIGN_MODULES.forEach(function(module){
      const list = arr(st()[module]);
      const index = list.findIndex(function(item){ return idOf(item) === id; });
      if (index >= 0) list[index] = record;
      else if (module === "foreignEmployees") list.unshift(record);
      state[module] = unique(list);
    });
    record.updatedAt = new Date().toISOString();
    saveNow("v197-foreign-write");
  }
  function deleteForeign(id){
    const record = findForeign(id);
    if (!record) return alert(tr("Scheda non trovata") + ": " + id);
    if (!confirm(tr("Eliminare definitivamente questa scheda estero?") + "\n" + titleOf(record))) return;
    FOREIGN_MODULES.forEach(function(module){
      state[module] = arr(st()[module]).filter(function(item){ return idOf(item) !== idOf(record); });
    });
    saveNow("v197-foreign-delete");
    if (typeof render === "function") render();
  }
  function editForeign(id){
    const record = findForeign(id);
    if (!record) return alert(tr("Scheda non trovata") + ": " + id);
    if (window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE && typeof window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace === "function") {
      window.PMS_V176_FOREIGN_RECRUITING_DOCUMENT_WORKSPACE.openWorkspace(idOf(record));
      return;
    }
    if (typeof openModal === "function") {
      openModal("foreignEmployees", idOf(record));
      return;
    }
    printForeign(idOf(record));
  }
  function printForeign(id){
    const record = findForeign(id);
    if (!record) return alert(tr("Scheda non trovata") + ": " + id);
    if (window.PMS_V177_FOREIGN_CALENDAR_ARCHIVE_PRINT_BARCODE_FIX && typeof window.PMS_V177_FOREIGN_CALENDAR_ARCHIVE_PRINT_BARCODE_FIX.printForeign === "function") {
      window.PMS_V177_FOREIGN_CALENDAR_ARCHIVE_PRINT_BARCODE_FIX.printForeign(idOf(record));
      return;
    }
    const rows = [
      ["ID", idOf(record)],
      [tr("Nome completo"), titleOf(record)],
      [tr("Paese"), [record.country, record.city].filter(Boolean).join(" ")],
      [tr("Ruolo"), record.role || "-"],
      [tr("Telefono"), phoneOf(record) || "-"],
      ["Email", record.email || "-"],
      [tr("Stato"), record.status || "-"],
      [tr("Stato pratica"), record.practiceStatus || "-"],
      [tr("Documenti"), record.documentRequests || record.documents || record.skills || "-"],
      [tr("Note"), record.notes || "-"]
    ];
    const table = '<table class="print-table"><tbody>' + rows.map(function(row){
      return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>';
    }).join("") + '</tbody></table>';
    const html = '<div class="print-document"><div class="print-header"><div><h1>' + esc(tr("Scheda candidato estero")) + '</h1><strong>PARMITALIA DISTRIBUTION SRL</strong></div><div class="print-meta">' + esc(idOf(record)) + '</div></div>' + table + '<div class="print-footer">Parmitalia Management System</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function label(column){
    const labels = { id:"ID", fullName:"Nome completo", country:"Paese", role:"Ruolo", phone:"Telefono", status:"Stato", practiceStatus:"Stato pratica", actions:"Azioni" };
    return tr(labels[column] || column);
  }
  function cell(record, column){
    if (column === "id") return '<span class="code-block">' + esc(idOf(record)) + '</span>';
    if (column === "fullName") return '<strong>' + esc(titleOf(record)) + '</strong><br><small>' + esc(record.email || "") + '</small>';
    if (column === "country") return esc([record.country, record.city, record.nationality].filter(Boolean).join(" - ") || "-");
    if (column === "phone") return esc(phoneOf(record) || "-");
    if (column === "status") return typeof badge === "function" ? badge(record.status || "In valutazione", "primary") : esc(record.status || "-");
    if (column === "practiceStatus") return esc(record.practiceStatus || "-");
    if (column === "actions") {
      const id = esc(idOf(record));
      return '<div class="pms197-actions">' +
        '<button type="button" class="inline-button" data-pms197-edit="' + id + '">' + esc(tr("Modifica")) + '</button>' +
        '<button type="button" class="inline-button" data-pms197-print="' + id + '">' + esc(tr("Stampa")) + '</button>' +
        '<button type="button" class="inline-danger" data-pms197-delete="' + id + '">' + esc(tr("Elimina")) + '</button>' +
      '</div>';
    }
    return esc(record[column] || "-");
  }
  function archiveHtml(module){
    const title = module === "foreignRecruiting" ? "Archivio recruiting estero" : "Archivio dipendenti estero";
    const filters = typeof current !== "undefined" && current && current.filters ? current.filters : {};
    const search = clean(filters[module] || "");
    const rows = listFor(module).filter(function(record){
      return !search || JSON.stringify(record || {}).toLowerCase().includes(search.toLowerCase());
    }).map(function(record){
      return '<tr data-pms197-row="' + esc(idOf(record)) + '">' + COLUMNS.map(function(column){
        return '<td data-mobile-label="' + esc(label(column)) + '">' + cell(record, column) + '</td>';
      }).join("") + '</tr>';
    }).join("");
    return '<div class="section-header pms197-head"><h3>' + esc(tr(title)) + '</h3><div class="filters">' +
      '<input data-search="' + esc(module) + '" placeholder="' + esc(tr("Cerca")) + '..." value="' + esc(search) + '">' +
      '<button class="primary-button" style="width:auto;margin:0" data-add="' + esc(module) + '">+ ' + esc(tr("Nuovo")) + '</button>' +
      '</div></div><div class="table-wrap pms197-table-wrap"><table class="pms197-table"><thead><tr>' +
      COLUMNS.map(function(column){ return '<th>' + esc(label(column)) + '</th>'; }).join("") +
      '</tr></thead><tbody>' + (rows || (typeof emptyRow === "function" ? emptyRow(COLUMNS.length) : '<tr><td colspan="' + COLUMNS.length + '">Nessun dato disponibile</td></tr>')) + '</tbody></table></div>';
  }
  function translateFullText(value, code){
    if (code === "IT" || !clean(value)) return value;
    const api = window.PMS_V178_FULL_LANGUAGE_AND_CODE128_BARCODE_FIX;
    if (!api || typeof api.translateText !== "function") return tr(value, code);
    return String(value).split(/(\n+|[.!?]\s+)/).map(function(part){
      if (!clean(part)) return part;
      if (part.length > 850) {
        return part.match(/.{1,700}(\s|$)/g)?.map(function(chunk){ return api.translateText(chunk, code); }).join("") || api.translateText(part.slice(0, 850), code) + part.slice(850);
      }
      return api.translateText(part, code);
    }).join("");
  }
  function translateVisible(root){
    const code = lang();
    if (code === "IT" || !root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        const parent = node.parentElement;
        if (!parent || ["SCRIPT","STYLE","SVG","CANVAS"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".barcode-svg,.pms178-barcode,svg,canvas")) return NodeFilter.FILTER_REJECT;
        return clean(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue);
      node.nodeValue = translateFullText(originalTextNodes.get(node), code);
    });
    root.querySelectorAll("input[placeholder],textarea[placeholder],button,[title],[aria-label],option").forEach(function(el){
      if (el.placeholder != null) {
        if (!el.dataset.pms197OriginalPlaceholder) el.dataset.pms197OriginalPlaceholder = el.getAttribute("placeholder") || "";
        el.setAttribute("placeholder", translateFullText(el.dataset.pms197OriginalPlaceholder, code));
      }
      if (el.tagName === "OPTION" || el.tagName === "BUTTON") {
        if (!el.dataset.pms197OriginalLabel) el.dataset.pms197OriginalLabel = el.textContent || "";
        el.textContent = translateFullText(el.dataset.pms197OriginalLabel, code);
      }
      ["title","aria-label"].forEach(function(attr){
        if (!el.hasAttribute(attr)) return;
        const key = "pms197Original" + attr.replace(/[^a-z]/gi, "");
        if (!el.dataset[key]) el.dataset[key] = el.getAttribute(attr) || "";
        el.setAttribute(attr, translateFullText(el.dataset[key], code));
      });
    });
  }
  function bindActions(root){
    root = root || document;
    root.querySelectorAll("[data-pms197-edit]").forEach(function(button){
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); editForeign(button.getAttribute("data-pms197-edit")); };
    });
    root.querySelectorAll("[data-pms197-print]").forEach(function(button){
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); printForeign(button.getAttribute("data-pms197-print")); };
    });
    root.querySelectorAll("[data-pms197-delete]").forEach(function(button){
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); deleteForeign(button.getAttribute("data-pms197-delete")); };
    });
  }
  function injectCss(){
    let style = document.getElementById("pms-v197-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v197-style";
      document.head.appendChild(style);
    }
    style.textContent = '.pms197-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.pms197-actions button{width:auto!important;margin:0!important}.pms197-table{min-width:980px!important}.pms197-table td:last-child{min-width:220px!important}.pms197-head .filters{align-items:center!important}@media(max-width:760px){body.device-phone .pms197-table{min-width:0!important}.pms197-actions{display:grid;grid-template-columns:1fr 1fr 1fr}}';
  }
  function install(){
    st();
    injectCss();

    const baseRenderList = typeof renderListModule === "function" ? renderListModule : null;
    if (baseRenderList && !window.__pms197RenderListWrapped) {
      window.__pms197RenderListWrapped = true;
      renderListModule = function(module){
        if (FOREIGN_MODULES.includes(module)) return archiveHtml(module);
        return baseRenderList.apply(this, arguments);
      };
    }

    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms197RenderWrapped) {
      window.__pms197RenderWrapped = true;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(function(){
          bindActions(document);
          translateVisible(document.getElementById("content"));
        }, 40);
        return result;
      };
    }

    document.addEventListener("click", function(event){
      const edit = event.target && event.target.closest("[data-pms197-edit]");
      const print = event.target && event.target.closest("[data-pms197-print]");
      const del = event.target && event.target.closest("[data-pms197-delete]");
      if (edit) { event.preventDefault(); event.stopPropagation(); return editForeign(edit.getAttribute("data-pms197-edit")); }
      if (print) { event.preventDefault(); event.stopPropagation(); return printForeign(print.getAttribute("data-pms197-print")); }
      if (del) { event.preventDefault(); event.stopPropagation(); return deleteForeign(del.getAttribute("data-pms197-delete")); }
    }, true);

    setTimeout(function(){ bindActions(document); translateVisible(document.getElementById("content")); }, 120);
    window.PMS_V197_CRASH_SAVE_FOREIGN_ACTIONS_TRANSLATION_FIX = {
      version: VERSION,
      renderForeignArchive: archiveHtml,
      editForeign: editForeign,
      printForeign: printForeign,
      deleteForeign: deleteForeign,
      translateVisible: translateVisible
    };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
