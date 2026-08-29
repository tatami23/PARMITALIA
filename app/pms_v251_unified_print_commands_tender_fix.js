(function () {
  "use strict";

  if (window.PMS_V251_UNIFIED_PRINT_COMMANDS_TENDER_FIX) return;
  window.PMS_V251_UNIFIED_PRINT_COMMANDS_TENDER_FIX = { version: "pms_v251_unified_print_commands_tender_fix" };

  var nativeSetTimeout = window.setTimeout.bind(window);
  var LOGO_PATH = "assets/parmitalia_logo_background.jpeg";
  var COMMANDS = [
    ["edit", "Modifica"], ["print", "Stampa"], ["client", "Stampa cliente"],
    ["supplier", "Stampa fornitore"], ["internal", "Stampa interna"], ["protocol", "Protocollo interno"]
  ];
  var RECORD_MAP = {
    assistant: "tasks", communications: "communications", officialCommunications: "officialDocuments",
    operativo: "orders", print: "documents", marketTrends: "marketTrends",
    billingWorkflow: "outgoingInvoices", driverRecruiting: "drivers", humanResources: "employees"
  };

  function clean(value) { return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }
  function appState() {
    try { if (window.state && typeof window.state === "object") return window.state; } catch (_) {}
    try { if (typeof state !== "undefined" && state && typeof state === "object") return state; } catch (_) {}
    return {};
  }
  function currentState() {
    try { if (typeof current !== "undefined" && current && typeof current === "object") return current; } catch (_) {}
    try { if (window.current && typeof window.current === "object") return window.current; } catch (_) {}
    return null;
  }
  function pageId() {
    var active = currentState();
    return clean(active && active.page) || "dashboard";
  }
  function pageTitle() {
    var title = document.getElementById("page-title");
    return clean(title && title.textContent) || clean(pageId()).replace(/([a-z])([A-Z])/g, "$1 $2");
  }
  function settings() { var st = appState(); st.settings = st.settings || {}; return st.settings; }
  function saveState() {
    try {
      if (typeof window.save === "function") return window.save();
      if (typeof save === "function") return save();
    } catch (error) { console.warn("Parmitalia: salvataggio protocollo", error); }
    return false;
  }
  function absoluteUrl(value) { try { return new URL(value, document.baseURI).href; } catch (_) { return value; } }
  function companyName() {
    var data = settings();
    return clean(data.legalName || data.companyName) || "PARMITALIA DISTRIBUTION SRL";
  }
  function contactRows() {
    var data = settings();
    var rows = [
      ["TEL", clean(data.phone) || "+39 0521 808 732"],
      ["MAIL", clean(data.email) || "info@parmitaliadistribution.it"],
      ["WEB", clean(data.website) || "www.parmitaliadistribution.it"],
      ["VAT", clean(data.vat || data.taxId) || "P.IVA / C.F. 02988930345"]
    ];
    return rows.map(function (row) {
      return '<div><span>' + esc(row[0]) + '</span><b>' + esc(row[1]) + '</b></div>';
    }).join("");
  }
  function todayIt() {
    try { return new Date().toLocaleDateString("it-IT"); } catch (_) { return new Date().toISOString().slice(0, 10); }
  }
  function buildLetterhead(title, protocol, subtitle) {
    var code = clean(protocol) || "DA ASSEGNARE";
    var sub = clean(subtitle);
    return '<header class="pms251-letterhead" data-pms251-protocol="' + esc(code) + '">' +
      '<div class="pms251-contact"><strong>' + esc(companyName()) + '</strong>' + contactRows() + '</div>' +
      '<div class="pms251-brand"><img src="' + esc(absoluteUrl(LOGO_PATH)) + '" alt="Parmitalia Distribution"><h1>' + esc(title || "DOCUMENTO") + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : "") + '</div>' +
      '<div class="pms251-protocol"><strong>RISERVATO ALL\'AZIENDA</strong><span>Protocollo interno n.</span><b>' + esc(code) + '</b><span>Data protocollazione</span><b>' + esc(todayIt()) + '</b></div>' +
      '</header>';
  }
  function barcodeHtml(code) {
    var value = clean(code) || "PARMITALIA";
    try {
      if (typeof renderBarcode === "function") {
        return '<div class="pms251-barcode-block"><span>CODICE A BARRE</span>' + renderBarcode(value) + '<b>' + esc(value) + '</b></div>';
      }
    } catch (_) {}
    return '<div class="pms251-barcode-block"><span>CODICE A BARRE</span><div class="pms251-bars"></div><b>' + esc(value) + '</b></div>';
  }
  function nextProtocol(moduleName) {
    var data = settings();
    data.pms251ProtocolCounters = data.pms251ProtocolCounters || {};
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, "0");
    var moduleCode = clean(moduleName).replace(/[^a-z0-9]/gi, "").slice(0, 4).toUpperCase() || "DOC";
    var key = year + "-" + month + "-" + moduleCode;
    var next = Number(data.pms251ProtocolCounters[key] || 0) + 1;
    data.pms251ProtocolCounters[key] = next;
    return "PI-" + year + "-" + month + "-" + moduleCode + "-" + String(next).padStart(4, "0");
  }
  function recordId(record) {
    if (!record || typeof record !== "object") return "";
    return clean(record.id || record.code || record.protocol || record.practiceCode || record.orderCode);
  }
  function ensureProtocol(record, moduleName) {
    var target = record && typeof record === "object" ? record : null;
    if (target) {
      var existing = clean(target.internalProtocol || target.protocolInternal);
      if (existing) return existing;
      var generated = nextProtocol(moduleName);
      target.internalProtocol = generated;
      target.protocolInternal = generated;
      target.internalProtocolDate = new Date().toISOString();
      saveState();
      return generated;
    }
    var data = settings();
    data.pms251ModuleProtocols = data.pms251ModuleProtocols || {};
    var key = clean(moduleName) || "document";
    if (!data.pms251ModuleProtocols[key]) data.pms251ModuleProtocols[key] = nextProtocol(key);
    saveState();
    return data.pms251ModuleProtocols[key];
  }
  function recordsForPage(moduleName) {
    var st = appState();
    var key = RECORD_MAP[moduleName] || moduleName;
    var list = st[key];
    if (!Array.isArray(list) && moduleName === "billingWorkflow") {
      list = [].concat(Array.isArray(st.outgoingInvoices) ? st.outgoingInvoices : [], Array.isArray(st.incomingInvoices) ? st.incomingInvoices : []);
    }
    return Array.isArray(list) ? list.filter(function (item) { return item && typeof item === "object"; }) : [];
  }
  function recordLabel(record, index) {
    return clean(record.code || record.protocol || record.id || record.title || record.name || record.client || record.authority) || "Record " + (index + 1);
  }
  function selectedRecord() {
    var select = document.getElementById("pms251-record-select");
    var list = recordsForPage(pageId());
    if (!list.length) return null;
    var id = clean(select && select.value);
    return list.find(function (item) { return recordId(item) === id; }) || list[0];
  }

  function installCss() {
    var style = document.getElementById("pms-v251-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v251-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms251-commandbar{display:grid;grid-template-columns:minmax(190px,1fr) repeat(6,auto);gap:6px;align-items:end;margin:0 0 12px;padding:9px 10px;border:1px solid #cfd8d3;border-left:4px solid #075b2b;border-radius:7px;background:#f8fbf9;box-shadow:none}
      .pms251-commandbar label{display:grid;gap:4px;min-width:0;color:#475569;font-size:10px;font-weight:900;text-transform:uppercase}
      .pms251-commandbar select{width:100%;min-width:0;height:32px;padding:4px 7px;font-size:12px}
      .pms251-commandbar button{width:auto!important;min-width:0!important;height:32px!important;margin:0!important;padding:5px 8px!important;border:1px solid #b9c9c0!important;border-radius:5px!important;background:#fff!important;color:#153526!important;font-size:10.5px!important;font-weight:850!important;line-height:1!important;white-space:nowrap!important}
      .pms251-commandbar button[data-pms251-command="print"],.pms251-commandbar button[data-pms251-command="internal"]{background:#075b2b!important;border-color:#075b2b!important;color:#fff!important}
      .pms251-tender-actions{display:flex!important;flex-wrap:wrap!important;gap:4px!important;min-width:320px!important}
      .pms251-tender-actions button{width:auto!important;margin:0!important;padding:5px 7px!important;font-size:10px!important;white-space:nowrap!important}
      .pms251-letterhead{display:grid!important;grid-template-columns:47mm minmax(0,1fr) 40mm!important;gap:5mm!important;align-items:start!important;width:100%!important;margin:0 0 5mm!important;padding:0 0 4mm!important;border-bottom:0!important;background:#fff!important;color:#111!important;break-inside:avoid!important;page-break-inside:avoid!important;box-sizing:border-box!important}
      .pms251-contact{display:grid!important;gap:2mm!important;padding-top:1mm!important;font:7.6pt/1.25 Arial,sans-serif!important;color:#111!important}
      .pms251-contact>strong{font-size:8.5pt!important;color:#111!important;margin-bottom:1mm!important}
      .pms251-contact>div{display:grid!important;grid-template-columns:10mm minmax(0,1fr)!important;gap:1.5mm!important;align-items:start!important}
      .pms251-contact span{display:inline-grid!important;place-items:center!important;width:9mm!important;min-height:4.5mm!important;border:.7pt solid #08713a!important;border-radius:2mm!important;color:#075b2b!important;font-size:6pt!important;font-weight:900!important}
      .pms251-contact b{font-weight:500!important;overflow-wrap:anywhere!important}
      .pms251-brand{text-align:center!important;min-width:0!important}
      .pms251-brand img{display:block!important;width:100%!important;height:34mm!important;max-width:none!important;max-height:none!important;margin:0 auto 2mm!important;object-fit:cover!important;object-position:center 46%!important;border:0!important;background:#fff!important;filter:none!important;opacity:1!important}
      .pms251-brand h1{margin:0!important;color:#075b2b!important;font:900 16pt/1.05 Arial,sans-serif!important;letter-spacing:0!important;text-transform:uppercase!important;overflow-wrap:anywhere!important}
      .pms251-brand p{margin:1mm 0 0!important;color:#27352e!important;font:7.5pt/1.2 Arial,sans-serif!important;letter-spacing:0!important}
      .pms251-protocol{display:grid!important;grid-template-columns:1fr!important;border:.8pt solid #4b5563!important;font:7pt/1.2 Arial,sans-serif!important;background:#fff!important}
      .pms251-protocol>strong{padding:2mm!important;background:#075b2b!important;color:#fff!important;text-align:center!important;font-size:7pt!important}
      .pms251-protocol>span{padding:2.5mm 2mm 1mm!important;color:#222!important}
      .pms251-protocol>b{min-height:7mm!important;margin:0 2mm!important;padding:1mm 0!important;border-bottom:.6pt solid #777!important;color:#111!important;font-size:7pt!important;overflow-wrap:anywhere!important}
      #print-root .print-document{width:100%!important;max-width:100%!important;min-height:0!important;margin:0 auto!important;padding:0!important;background:#fff!important;color:#111!important;font:8.4pt/1.3 Arial,Helvetica,sans-serif!important;box-sizing:border-box!important}
      #print-root .print-header,#print-root .pms247-header,#print-root .pms244-header{display:none!important}
      #print-root h2,#print-root h3,#print-root h4,#print-root .pms251-section-title{display:block!important;margin:4mm 0 0!important;padding:1.4mm 2mm!important;background:#075b2b!important;color:#fff!important;font:900 8.5pt/1.15 Arial,sans-serif!important;letter-spacing:0!important;text-transform:uppercase!important;break-after:avoid!important}
      #print-root table,#print-root .print-table{width:100%!important;max-width:100%!important;margin:0 0 3mm!important;border-collapse:collapse!important;table-layout:fixed!important;background:#fff!important}
      #print-root th,#print-root td,#print-root .print-table th,#print-root .print-table td{padding:1.7mm 2mm!important;border:.55pt solid #7d8581!important;background:#fff!important;color:#111!important;font-size:7.7pt!important;line-height:1.22!important;vertical-align:top!important;white-space:normal!important;word-break:normal!important;overflow-wrap:anywhere!important}
      #print-root thead th,#print-root .print-table thead th{background:#075b2b!important;color:#fff!important;font-weight:900!important;text-align:left!important}
      #print-root .pms251-audience{margin:0 0 3mm!important;padding:2mm!important;border:.7pt solid #075b2b!important;color:#075b2b!important;font-weight:900!important;text-align:center!important;text-transform:uppercase!important}
      #print-root .pms251-barcode-block{display:grid!important;justify-items:center!important;gap:1mm!important;width:72mm!important;margin:5mm auto 3mm!important;padding:2mm!important;border:.7pt solid #b9c2bd!important;break-inside:avoid!important}
      #print-root .pms251-barcode-block>span{font-size:6.5pt!important;font-weight:900!important;color:#075b2b!important}
      #print-root .pms251-barcode-block svg,#print-root .pms251-barcode-block canvas{display:block!important;width:68mm!important;max-width:68mm!important;height:14mm!important}
      #print-root .pms251-barcode-block>b{font:700 7pt/1 Consolas,monospace!important;letter-spacing:0!important}
      #print-root .pms251-bars{width:68mm!important;height:13mm!important;background:repeating-linear-gradient(90deg,#111 0 1px,transparent 1px 3px,#111 3px 5px,transparent 5px 7px)!important}
      #print-root .print-footer,#print-root .pms251-footer{position:relative!important;margin-top:4mm!important;padding:3mm 0 2mm!important;border-top:0!important;color:#374151!important;font-size:6.8pt!important;text-align:center!important}
      #print-root .print-footer::after,#print-root .pms251-footer::after{content:""!important;display:block!important;height:1mm!important;margin-top:3mm!important;background:linear-gradient(90deg,#008c45 0 33.333%,#fff 33.333% 66.666%,#cd212a 66.666% 100%)!important;border:.3pt solid #d1d5db!important}
      @media(max-width:1180px){.pms251-commandbar{grid-template-columns:repeat(3,minmax(0,1fr))}.pms251-commandbar label{grid-column:1/-1}.pms251-commandbar button{width:100%!important}}
      @media print{@page{size:A4;margin:8mm}.pms251-commandbar{display:none!important}.pms251-letterhead,#print-root thead th,#print-root .print-footer::after{print-color-adjust:exact!important;-webkit-print-color-adjust:exact!important}}
    `;
  }

  function prettifyKey(key) {
    var known = {
      id:"Codice",code:"Codice",protocol:"Protocollo",internalProtocol:"Protocollo interno",
      client:"Cliente",supplier:"Fornitore",authority:"Ente / cliente",title:"Titolo",
      product:"Prodotto",description:"Descrizione",quantity:"Quantita",totalQuantity:"Quantita totale",
      quantityUnit:"Unita",frequency:"Frequenza",frequencyDetails:"Dettaglio frequenza",
      status:"Stato",deadline:"Scadenza",receivedDate:"Data ricezione",country:"Paese",
      currency:"Valuta",estimatedValue:"Valore stimato",requirements:"Capitolato / requisiti",
      commercialOffer:"Offerta economica / strategia",notes:"Note"
    };
    if (known[key]) return known[key];
    return clean(key).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,function(char){ return char.toUpperCase(); });
  }

  function printableEntries(record, audience) {
    if (!record) return [];
    var excluded = /password|token|secret|base64|photo|image|attachment|json$/i;
    var internal = /internal|commission|cost|margin|private|riservat/i;
    var clientOnly = /supplier|fornitore/i;
    var supplierOnly = /client|cliente/i;
    return Object.keys(record).filter(function(key){
      if (excluded.test(key) || typeof record[key] === "function") return false;
      if (audience === "client" && (internal.test(key) || clientOnly.test(key))) return false;
      if (audience === "supplier" && (internal.test(key) || supplierOnly.test(key))) return false;
      return record[key] != null && record[key] !== "";
    }).slice(0,34).map(function(key){
      var value = record[key];
      if (Array.isArray(value)) value = value.map(clean).filter(Boolean).join(", ");
      else if (value && typeof value === "object") { try { value = JSON.stringify(value); } catch (_) { value = clean(value); } }
      return [prettifyKey(key), clean(value)];
    });
  }

  function audienceLabel(audience) {
    return ({client:"Copia cliente",supplier:"Copia fornitore",internal:"Copia interna",print:"Documento generale"})[audience] || "Documento generale";
  }

  function genericPrint(audience) {
    var moduleName = pageId();
    var record = selectedRecord();
    var protocol = ensureProtocol(record,moduleName);
    var entries = printableEntries(record,audience);
    var body = entries.length ? '<h2 class="pms251-section-title">Dati documento</h2><table class="print-table"><tbody>' + entries.map(function(row){
      return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>';
    }).join("") + '</tbody></table>' : '<h2 class="pms251-section-title">Riepilogo modulo</h2><table class="print-table"><tr><th>Modulo</th><td>' + esc(pageTitle()) + '</td></tr><tr><th>Data</th><td>' + esc(todayIt()) + '</td></tr></table>';
    var html = '<div class="print-document pms251-print-document">' + buildLetterhead(pageTitle(),protocol,audienceLabel(audience)) + '<div class="pms251-audience">' + esc(audienceLabel(audience)) + '</div>' + body + barcodeHtml(protocol) + '<div class="print-footer pms251-footer">' + esc(companyName()) + ' - ' + esc(protocol) + '</div></div>';
    if (typeof window.openPrint === "function") window.openPrint(html);
  }

  function actionSignature(button) {
    var attrs = Array.prototype.slice.call(button.attributes || []).map(function(attr){ return attr.name + "=" + attr.value; }).join(" ");
    return clean(attrs + " " + button.textContent).toLowerCase();
  }
  function findExistingAction(record,action) {
    var content = document.getElementById("content");
    if (!content) return null;
    var id = recordId(record);
    var buttons = Array.prototype.slice.call(content.querySelectorAll("button")).filter(function(button){
      if (button.closest(".pms251-commandbar")) return false;
      var signature = actionSignature(button);
      if (id && signature.indexOf(id.toLowerCase()) < 0 && clean(button.getAttribute("data-id")) !== id) return false;
      if (action === "edit") return /edit|modifica/.test(signature);
      if (action === "client") return /print.*(client|customer)|stampa cliente|external/.test(signature);
      if (action === "supplier") return /print.*(supplier|fornitore)|stampa fornitore/.test(signature);
      if (action === "internal") return /print.*(internal|interna)|stampa interna/.test(signature);
      if (action === "print") return /print|stampa/.test(signature) && !/register|registro|summary|riepilogo/.test(signature);
      return false;
    });
    return buttons[0] || null;
  }
  function editSelected() {
    var record = selectedRecord();
    var existing = findExistingAction(record,"edit");
    if (existing) { existing.click(); return; }
    var id = recordId(record);
    try { if (id && typeof window.openModal === "function") { window.openModal(pageId(),id); return; } } catch (_) {}
    alert(record ? "Comando Modifica non disponibile in questa vista. Aprire la riga del record selezionato." : "Nessun record disponibile da modificare.");
  }
  function printCommand(audience) {
    var record = selectedRecord();
    if (pageId() === "tenders") { genericPrint(audience); return; }
    var existing = findExistingAction(record,audience);
    if (existing) { existing.click(); return; }
    genericPrint(audience);
  }

  function renderCommandBar() {
    var content = document.getElementById("content");
    var active = currentState();
    if (!content || !active || !active.page || document.getElementById("print-root")) return;
    var list = recordsForPage(pageId());
    var options = list.map(function(record,index){
      return '<option value="' + esc(recordId(record)) + '">' + esc(recordLabel(record,index)) + '</option>';
    }).join("");
    var old = document.getElementById("pms251-commandbar");
    var selected = old && old.querySelector("select") ? old.querySelector("select").value : "";
    if (!old) {
      old = document.createElement("div");
      old.id = "pms251-commandbar";
      old.className = "pms251-commandbar";
      content.insertBefore(old,content.firstChild);
    }
    old.innerHTML = '<label>Documento / record<select id="pms251-record-select">' + (options || '<option value="">Modulo corrente</option>') + '</select></label>' + COMMANDS.map(function(command){
      return '<button type="button" data-pms251-command="' + command[0] + '">' + command[1] + '</button>';
    }).join("");
    if (selected) {
      Array.prototype.slice.call(old.querySelectorAll("option")).some(function(option){
        if (option.value === selected) { old.querySelector("select").value = selected; return true; }
        return false;
      });
    }
  }

  function tenderRecord(id) {
    var list = appState().tenders;
    return Array.isArray(list) ? list.find(function(item){ return clean(item && item.id) === clean(id); }) : null;
  }
  function selectOptions(values,selected) {
    return values.map(function(value){ return '<option' + (value === selected ? " selected" : "") + '>' + esc(value) + '</option>'; }).join("");
  }
  function patchTenderForm() {
    var modal = document.getElementById("pms105-modal");
    if (!modal || modal.dataset.pms251TenderForm === "1") return;
    var probability = modal.querySelector('[name="probability"]');
    if (!probability) return;
    var label = probability.closest("label");
    if (!label) return;
    var idInput = modal.querySelector('[name="id"]');
    var tender = tenderRecord(idInput && idInput.value) || {};
    var holder = document.createElement("div");
    holder.className = "pms251-tender-fields";
    holder.style.display = "contents";
    holder.innerHTML = '<label>Quantita totale<input type="number" min="0" step="any" name="totalQuantity" value="' + esc(tender.totalQuantity || "") + '" placeholder="0"></label>' +
      '<label>Unita quantita<select name="quantityUnit">' + selectOptions(["tons","kg","pallet","camion","container","litri","pezzi","lotto"],tender.quantityUnit || "tons") + '</select></label>' +
      '<label>Frequenza<select name="frequency">' + selectOptions(["Spot","Settimanale","Quindicinale","Mensile","Bimestrale","Trimestrale","Semestrale","Annuale","Continuativa","Su richiesta"],tender.frequency || "Spot") + '</select></label>' +
      '<label>Dettaglio frequenza<input name="frequencyDetails" value="' + esc(tender.frequencyDetails || "") + '" placeholder="Es. 2 camion ogni settimana"></label>';
    label.parentNode.insertBefore(holder,label);
    label.remove();
    modal.dataset.pms251TenderForm = "1";
  }
  function normalizeTenders() {
    var list = appState().tenders;
    if (!Array.isArray(list)) return;
    list.forEach(function(item){ if (item && Object.prototype.hasOwnProperty.call(item,"probability")) delete item.probability; });
    saveState();
  }
  function decorateTenderTable() {
    if (pageId() !== "tenders") return;
    var content = document.getElementById("content");
    if (!content) return;
    var table = Array.prototype.slice.call(content.querySelectorAll("table")).find(function(candidate){ return candidate.querySelector("[data-ten-edit]"); });
    if (!table || table.dataset.pms251TenderTable === "1") return;
    var headerRow = table.querySelector("thead tr");
    if (!headerRow) return;
    var actionHeader = headerRow.lastElementChild;
    var quantityHead = document.createElement("th"); quantityHead.textContent = "Quantita totale";
    var frequencyHead = document.createElement("th"); frequencyHead.textContent = "Frequenza";
    headerRow.insertBefore(quantityHead,actionHeader);
    headerRow.insertBefore(frequencyHead,actionHeader);
    Array.prototype.slice.call(table.querySelectorAll("tbody tr")).forEach(function(row){
      var edit = row.querySelector("[data-ten-edit]");
      if (!edit) return;
      var tender = tenderRecord(edit.getAttribute("data-ten-edit")) || {};
      Array.prototype.slice.call(row.querySelectorAll("small")).forEach(function(node){ if (/prob\.?/i.test(node.textContent || "")) node.remove(); });
      var actions = row.lastElementChild;
      var quantityCell = document.createElement("td");
      quantityCell.innerHTML = '<strong>' + esc(tender.totalQuantity || "-") + '</strong> ' + esc(tender.quantityUnit || "tons");
      var frequencyCell = document.createElement("td");
      frequencyCell.innerHTML = '<strong>' + esc(tender.frequency || "Spot") + '</strong>' + (tender.frequencyDetails ? '<br><small>' + esc(tender.frequencyDetails) + '</small>' : "");
      row.insertBefore(quantityCell,actions);
      row.insertBefore(frequencyCell,actions);
      actions.classList.add("pms251-tender-actions");
    });
    table.dataset.pms251TenderTable = "1";
  }

  function extractLegacyHeader(wrap) {
    var header = wrap.querySelector(".print-header,.pms97-letterhead,.pms80-letterhead");
    var title = clean(header && header.querySelector("h1") && header.querySelector("h1").textContent) || pageTitle();
    var meta = clean(header && header.querySelector(".print-meta") && header.querySelector(".print-meta").textContent);
    var subtitle = clean(header && header.querySelector("strong") && header.querySelector("strong").textContent);
    return {node:header,title:title,meta:meta,subtitle:subtitle};
  }
  function standardizePrintHtml(innerHtml) {
    var wrap = document.createElement("div");
    wrap.innerHTML = String(innerHtml || "");
    var documentNode = wrap.querySelector(".print-document") || wrap.firstElementChild;
    if (!documentNode) {
      documentNode = document.createElement("div");
      documentNode.className = "print-document";
      wrap.appendChild(documentNode);
    }
    documentNode.classList.add("pms251-print-document");
    var existing = documentNode.querySelector(".pms251-letterhead");
    var protocol = clean(existing && existing.getAttribute("data-pms251-protocol"));
    if (!existing) {
      var legacy = extractLegacyHeader(documentNode);
      var match = legacy.meta.match(/[A-Z]{2,5}[-/][A-Z0-9-/]+/i);
      protocol = match ? match[0] : ensureProtocol(null,pageId());
      if (legacy.node) legacy.node.remove();
      documentNode.insertAdjacentHTML("afterbegin",buildLetterhead(legacy.title,protocol,legacy.subtitle));
    }
    if (!documentNode.querySelector("[class*='barcode' i],[data-barcode]")) {
      var footer = documentNode.querySelector(".print-footer");
      if (footer) footer.insertAdjacentHTML("beforebegin",barcodeHtml(protocol));
      else documentNode.insertAdjacentHTML("beforeend",barcodeHtml(protocol));
    }
    var footerNode = documentNode.querySelector(".print-footer");
    if (!footerNode) {
      footerNode = document.createElement("div");
      footerNode.className = "print-footer";
      footerNode.textContent = companyName() + " - " + protocol;
      documentNode.appendChild(footerNode);
    }
    footerNode.classList.add("pms251-footer");
    return wrap.innerHTML;
  }
  function installPrintSystem() {
    var header = function(title,code,subtitle){ return buildLetterhead(title,code || ensureProtocol(null,pageId()),subtitle); };
    window.companyPrintHeader = header;
    try { companyPrintHeader = header; } catch (_) {}
    var base = window.openPrint;
    if (typeof base === "function" && !base.__pms251UnifiedPrint) {
      var wrapped = function(innerHtml){ installCss(); return base.call(this,standardizePrintHtml(innerHtml)); };
      wrapped.__pms251UnifiedPrint = true;
      wrapped.__pms251Base = base;
      window.openPrint = wrapped;
      try { openPrint = wrapped; } catch (_) {}
    }
  }
  function decorate() {
    installCss();
    renderCommandBar();
    decorateTenderTable();
    patchTenderForm();
  }
  function wrapRender(name) {
    var original = window[name];
    if (typeof original !== "function" || original.__pms251Decorated) return;
    var wrapped = function(){
      var result = original.apply(this,arguments);
      nativeSetTimeout(decorate,35);
      nativeSetTimeout(decorate,220);
      return result;
    };
    wrapped.__pms251Decorated = true;
    window[name] = wrapped;
    try { eval(name + " = window[name]"); } catch (_) {}
  }
  function handleClick(event) {
    var command = event.target && event.target.closest && event.target.closest("[data-pms251-command]");
    if (command) {
      event.preventDefault();
      event.stopPropagation();
      var action = command.getAttribute("data-pms251-command");
      if (action === "edit") editSelected();
      else if (action === "protocol") {
        var record = selectedRecord();
        var protocol = ensureProtocol(record,pageId());
        alert("Protocollo interno assegnato: " + protocol);
        renderCommandBar();
      } else printCommand(action);
      return;
    }
    if (event.target && event.target.closest && event.target.closest("[data-ten-new],[data-ten-edit]")) {
      nativeSetTimeout(patchTenderForm,40);
      nativeSetTimeout(patchTenderForm,160);
    }
  }
  function handleSavedTender(event) {
    if (!event.target || !event.target.closest || !event.target.closest("#pms105-modal [data-save]")) return;
    nativeSetTimeout(function(){ normalizeTenders(); decorate(); },80);
  }
  function install() {
    installCss();
    installPrintSystem();
    wrapRender("render");
    wrapRender("setPage");
    wrapRender("bindPageActions");
    document.addEventListener("click",handleClick,true);
    document.addEventListener("click",handleSavedTender,false);
    var observer = new MutationObserver(function(){ nativeSetTimeout(patchTenderForm,30); });
    observer.observe(document.body,{childList:true,subtree:true});
    decorate();
    nativeSetTimeout(decorate,150);
    nativeSetTimeout(decorate,700);
    console.info("pms_v251_unified_print_commands_tender_fix loaded");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",install,{once:true});
  else install();
})();
