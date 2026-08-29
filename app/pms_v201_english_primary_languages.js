(function(){
  "use strict";

  var VERSION = "pms_v201_english_primary_languages";
  var ALLOWED = ["EN", "IT", "AR"];
  var NAMES = {EN:"English", IT:"Italiano", AR:"Arabo"};
  var textMemory = new WeakMap();

  var EN = {
    "Lingua gestionale":"App language",
    "Lingua stampa":"Print language",
    "Lingua stampa predefinita":"Default print language",
    "Lingua default":"Default language",
    "Lingue e stile documenti":"Languages and document style",
    "Impostazioni":"Settings",
    "Salva":"Save",
    "Salva impostazioni":"Save settings",
    "Salva modifiche":"Save changes",
    "Annulla":"Cancel",
    "Chiudi":"Close",
    "Apri":"Open",
    "Vedi":"View",
    "Modifica":"Edit",
    "Elimina":"Delete",
    "Stampa":"Print",
    "Stampa registro":"Print register",
    "Stampa storico":"Print history",
    "Stampa interna":"Internal print",
    "PDF cliente":"Customer PDF",
    "PDF fornitore":"Supplier PDF",
    "PDF interno":"Internal PDF",
    "Cliente PDF":"Customer PDF",
    "Fornitore PDF":"Supplier PDF",
    "Interna":"Internal",
    "Cliente":"Customer",
    "Fornitore":"Supplier",
    "Cliente / Fornitore":"Customer / Supplier",
    "Cliente finale":"Final customer",
    "Prodotto":"Product",
    "Articolo":"Item",
    "Quantita":"Quantity",
    "Unita":"Unit",
    "Prezzo":"Price",
    "Prezzo attuale":"Current price",
    "Prezzo desiderato":"Target price",
    "Target price":"Target price",
    "Differenza":"Difference",
    "Valore":"Value",
    "Totale":"Total",
    "Subtotale":"Subtotal",
    "Valuta":"Currency",
    "Pagamento":"Payment",
    "Condizioni":"Terms",
    "Consegna":"Delivery",
    "Consegna/logistica":"Delivery / logistics",
    "Consegna prevista":"Expected delivery",
    "Data":"Date",
    "Data ordine":"Order date",
    "Data trattativa":"Negotiation date",
    "Data prossima azione":"Next action date",
    "Prossima azione":"Next action",
    "Stato":"Status",
    "Stato luce":"Status light",
    "Luce stato":"Status light",
    "Fase":"Stage",
    "Priorita":"Priority",
    "Note":"Notes",
    "Note interne":"Internal notes",
    "Descrizione":"Description",
    "Riepilogo":"Summary",
    "Riepilogo trattativa":"Negotiation summary",
    "Eventi":"Events",
    "Evento":"Event",
    "Registro eventi":"Event register",
    "Operatore":"Operator",
    "Esito":"Outcome",
    "Protocollo":"Protocol",
    "Codice":"Code",
    "Codice automatico":"Automatic code",
    "Codice ordine interno":"Internal order code",
    "Codice a barre":"Barcode",
    "Oggetto":"Subject",
    "Destinatario":"Recipient",
    "Lingua":"Language",
    "Azioni":"Actions",
    "Nuovo":"New",
    "Nuova trattativa":"New negotiation",
    "Trattativa":"Negotiation",
    "Trattative in corso":"Current negotiations",
    "Trattative aperte":"Open negotiations",
    "Storico":"History",
    "Storico accettate / chiuse":"Accepted / closed history",
    "Nessuna trattativa aperta.":"No open negotiation.",
    "Nessuna trattativa nello storico.":"No negotiation in history.",
    "Nessuna trattativa.":"No negotiation.",
    "Nessun evento registrato.":"No event recorded.",
    "Nessun evento.":"No event.",
    "Foto":"Photo",
    "Carica foto":"Upload photo",
    "In corso":"In progress",
    "Accettata":"Accepted",
    "Accettate":"Accepted",
    "Chiusa":"Closed",
    "Chiuse":"Closed",
    "Con foto":"With photo",
    "Aperta":"Open",
    "Aperte":"Open",
    "Chiuso":"Closed",
    "Bozza":"Draft",
    "Attivo":"Active",
    "Archiviato":"Archived",
    "Da verificare":"To check",
    "Da definire":"To be defined",
    "Da pagare":"To pay",
    "Ordini":"Orders",
    "Ordine":"Order",
    "Tipo ordine":"Order type",
    "Modulo ordine":"Order form",
    "Nessun ordine.":"No order.",
    "Offerte":"Offers",
    "Offerte commerciali":"Commercial offers",
    "Intermediazioni":"Intermediations",
    "Prodotti e Articoli":"Products and items",
    "Prodotti e articoli":"Products and items",
    "Conferme prezzi fornitori":"Supplier price confirmations",
    "Backoffice / Segretariato":"Back office / Secretariat",
    "Comunicazioni / CRM":"Communications / CRM",
    "Comunicazioni e CRM":"Communications and CRM",
    "Comunicazioni ufficiali":"Official communications",
    "Gare e richieste":"Tenders and requests",
    "Anagrafiche clienti e fornitori":"Customers and suppliers",
    "Stampe":"Print center",
    "Centro stampe":"Print center",
    "Dipendenti estero":"Foreign employees",
    "Recruiting estero":"Foreign recruiting",
    "Dipendenti azienda":"Company employees",
    "Archivio dipendenti estero":"Foreign employees archive",
    "Archivio recruiting estero":"Foreign recruiting archive",
    "Nome":"Name",
    "Nome completo":"Full name",
    "Nome e cognome":"Full name",
    "Paese":"Country",
    "Citta":"City",
    "Nazionalita":"Nationality",
    "Ruolo":"Role",
    "Telefono":"Phone",
    "Telefono WhatsApp":"WhatsApp phone",
    "Cerca":"Search",
    "Scheda":"File",
    "Scheda lavoro":"Work file",
    "Scheda candidato estero":"Foreign candidate file",
    "Documenti":"Documents",
    "Documento":"Document",
    "Contratti":"Contracts",
    "Archivio documenti":"Document archive",
    "Contabilita":"Accounting",
    "Fatturazione":"Invoicing",
    "Banche":"Banks",
    "Pagamenti":"Payments",
    "Dashboard":"Dashboard",
    "Andamenti di mercato":"Market trends",
    "Gestione operativa":"Operations",
    "Backup":"Backup",
    "Esporta backup":"Export backup",
    "Importa backup":"Import backup",
    "Reset dati":"Reset data",
    "Eliminare definitivamente questa trattativa?":"Delete this negotiation permanently?",
    "Eliminare definitivamente questa scheda estero?":"Delete this foreign file permanently?",
    "Scheda non trovata":"File not found",
    "Ordine non trovato.":"Order not found.",
    "Trattativa non trovata.":"Negotiation not found.",
    "Generato da Parmitalia Management System":"Generated by Parmitalia Management System",
    "Parmitalia aggiornato automaticamente":"Parmitalia updated automatically"
  };

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v201-language-primary-english");
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function currentLang(){
    var s = st().settings;
    var code = s.appLanguage || s.defaultLanguage || "IT";
    return ALLOWED.indexOf(code) >= 0 ? code : "IT";
  }
  function printLang(){
    var s = st().settings;
    var code = s.printLanguage || s.appLanguage || s.defaultLanguage || "IT";
    return ALLOWED.indexOf(code) >= 0 ? code : "IT";
  }
  function enforcePrimary(){
    var s = st().settings;
    if (!s.pms201EnglishPrimaryApplied) {
      s.appLanguage = "IT";
      s.defaultLanguage = "IT";
      s.printLanguage = "IT";
      s.pms201EnglishPrimaryApplied = "1";
      saveNow();
    }
    var changed = false;
    ["appLanguage", "defaultLanguage", "printLanguage"].forEach(function(key){
      if (ALLOWED.indexOf(s[key]) < 0) {
        s[key] = "IT";
        changed = true;
      }
    });
    if (changed) saveNow();
    document.documentElement.lang = currentLang().toLowerCase();
    document.documentElement.dir = currentLang() === "AR" ? "rtl" : "ltr";
  }
  function optionHtml(selected){
    return ALLOWED.map(function(code){
      return '<option value="' + code + '"' + (code === selected ? " selected" : "") + ">" + NAMES[code] + "</option>";
    }).join("");
  }
  function normalizeLanguageSelect(select, kind){
    if (!select) return;
    var selected = kind === "print" ? printLang() : currentLang();
    if (ALLOWED.indexOf(select.value) >= 0) selected = select.value;
    var wanted = optionHtml(selected);
    if (select.innerHTML !== wanted) select.innerHTML = wanted;
    select.value = selected;
    if (select.dataset.pms201Bound === "1") return;
    select.dataset.pms201Bound = "1";
    select.addEventListener("change", function(){
      var value = ALLOWED.indexOf(select.value) >= 0 ? select.value : "IT";
      if (kind === "print") st().settings.printLanguage = value;
      else {
        st().settings.appLanguage = value;
        st().settings.defaultLanguage = value;
      }
      saveNow();
      setTimeout(refresh, 30);
      setTimeout(refresh, 220);
    });
  }
  function normalizeAllSelectors(){
    var appSelectors = 'select[name="appLanguage"],select[name="defaultLanguage"],#pms134-app-lang';
    var printSelectors = 'select[name="printLanguage"],#pms134-print-lang,#pms136-print-lang,.pms135-print-lang';
    document.querySelectorAll(appSelectors).forEach(function(select){ normalizeLanguageSelect(select, "app"); });
    document.querySelectorAll(printSelectors).forEach(function(select){ normalizeLanguageSelect(select, "print"); });
    document.querySelectorAll("select").forEach(function(select){
      var txt = clean(select.textContent);
      if (/Italiano|English|Arabic|Romana|RO/.test(txt) && /Lingua|language|lang/i.test((select.name || "") + " " + (select.id || "") + " " + (select.className || ""))) {
        normalizeLanguageSelect(select, /print/i.test((select.name || "") + " " + (select.id || "") + " " + (select.className || "")) ? "print" : "app");
      }
    });
  }
  function exact(text, code){
    var value = clean(text).replace(/\s*:\s*$/, "");
    var suffix = /:\s*$/.test(clean(text)) ? ":" : "";
    if (code === "IT") return "";
    if (code === "EN" && EN[value]) return EN[value] + suffix;
    var api = window.PMS_V178_FULL_LANGUAGE_AND_CODE128_BARCODE_FIX;
    if (api && typeof api.translateText === "function") return api.translateText(text, code);
    return "";
  }
  function eligibleText(node){
    var parent = node.parentElement;
    if (!parent) return false;
    if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SVG", "CANVAS"].indexOf(parent.tagName) >= 0) return false;
    if (parent.closest("svg,canvas,.barcode-svg,.pms178-barcode")) return false;
    var text = clean(node.nodeValue);
    if (!text || text.length > 600) return false;
    if (/^[\d\s.,:/\\()[\]%+-]+$/.test(text)) return false;
    if (/@|https?:|www\.|CUI|VAT|PARMITALIA DISTRIBUTION SRL/i.test(text)) return false;
    if (parent.closest("button,th,label,legend,h1,h2,h3,h4,h5,h6,option,.nav-button,.topbar,.section-header,[class*='-hero'],[class*='-actions'],[class*='-kpi'],[class*='-status'],[class*='-head']")) return true;
    return !!EN[text.replace(/\s*:\s*$/, "")];
  }
  function translateRoot(root, forcedCode){
    if (!root) return;
    var code = forcedCode || currentLang();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){ return eligibleText(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      if (!textMemory.has(node)) textMemory.set(node, node.nodeValue);
      if (code === "IT") {
        node.nodeValue = textMemory.get(node);
        return;
      }
      var translated = exact(textMemory.get(node), code);
      if (translated) node.nodeValue = node.nodeValue.replace(clean(node.nodeValue), translated);
    });
    root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(function(el){
      ["placeholder", "title", "aria-label"].forEach(function(attr){
        if (!el.hasAttribute(attr)) return;
        var key = "pms201Original" + attr.replace(/[^a-z]/gi, "");
        if (!el.dataset[key]) el.dataset[key] = el.getAttribute(attr) || "";
        if (code === "IT") el.setAttribute(attr, el.dataset[key]);
        else {
          var translated = exact(el.dataset[key], code);
          if (translated) el.setAttribute(attr, translated);
        }
      });
    });
  }
  function wrapPrint(){
    if (typeof openPrint !== "function" || openPrint.__pms201Wrapped) return;
    var base = openPrint;
    var wrapped = function(html){
      enforcePrimary();
      var code = printLang();
      if (code === "IT") return base.call(this, html);
      var box = document.createElement("div");
      box.innerHTML = String(html || "");
      translateRoot(box, code);
      box.querySelectorAll(".print-document").forEach(function(doc){
        doc.setAttribute("lang", code.toLowerCase());
        doc.setAttribute("dir", code === "AR" ? "rtl" : "ltr");
      });
      return base.call(this, box.innerHTML);
    };
    wrapped.__pms201Wrapped = true;
    openPrint = wrapped;
    try { window.openPrint = wrapped; } catch(error) {}
  }
  function refresh(){
    enforcePrimary();
    normalizeAllSelectors();
    wrapPrint();
    if (currentLang() !== "IT") translateRoot(document.querySelector(".topbar"));
    translateRoot(document.getElementById("content"));
    document.querySelectorAll(".modal,.modal-card,.pms200-modal,.pms197-modal,.pms179-modal,.pms175-modal,.pms172-modal").forEach(translateRoot);
    if (window.PMS_V178_FULL_LANGUAGE_AND_CODE128_BARCODE_FIX && typeof window.PMS_V178_FULL_LANGUAGE_AND_CODE128_BARCODE_FIX.localizePage === "function") {
      try { window.PMS_V178_FULL_LANGUAGE_AND_CODE128_BARCODE_FIX.localizePage(); } catch(error) {}
    }
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms201Wrapped) {
      var baseRender = render;
      render = function(){
        enforcePrimary();
        var result = baseRender.apply(this, arguments);
        setTimeout(refresh, 40);
        setTimeout(refresh, 260);
        return result;
      };
      render.__pms201Wrapped = true;
    }
    if (typeof bindPageActions === "function" && !bindPageActions.__pms201Wrapped) {
      var baseBind = bindPageActions;
      bindPageActions = function(){
        var result = baseBind.apply(this, arguments);
        setTimeout(refresh, 30);
        return result;
      };
      bindPageActions.__pms201Wrapped = true;
    }
  }

  enforcePrimary();
  wrapPrint();
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh);
  else refresh();
  [120, 500, 1200, 2400].forEach(function(ms){ setTimeout(refresh, ms); });
  setInterval(refresh, 2200);
  window.PMS_V201_ENGLISH_PRIMARY_LANGUAGES = {version:VERSION, refresh:refresh};
})();
