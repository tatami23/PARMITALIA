(function(){
  "use strict";

  const VERSION = "PMS-V149-WORKFLOW-I18N-CRM-COMMERCIAL-FIX";
  const OFFICE_EMAIL = "office@parmitalia.ro";
  const LANGS = ["IT", "EN", "RO", "AR"];
  const CERTS = [
    "HACCP", "ISO 22000", "FSSC 22000", "BRCGS Food", "IFS Food", "ISO 9001", "ISO 14001",
    "Halal", "Kosher", "Biologico / Organic", "GlobalG.A.P.", "Sedex / SMETA",
    "Certificato sanitario", "Certificato veterinario", "Certificato origine", "EUR.1",
    "COA analisi chimica", "COA microbiologico", "Scheda tecnica", "SDS / MSDS",
    "Dichiarazione allergeni", "Dichiarazione OGM", "Packing list", "Temperatura controllata"
  ];

  const TR = {
    "Dashboard":{EN:"Dashboard",RO:"Dashboard",AR:"\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645"},
    "Andamenti di mercato":{EN:"Market trends",RO:"Evolutii piata",AR:"\u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0627\u0644\u0633\u0648\u0642"},
    "Gestione operativa":{EN:"Operations",RO:"Gestiune operationala",AR:"\u0627\u0644\u0627\u062f\u0627\u0631\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u064a\u0629"},
    "Backoffice / Segretariato":{EN:"Back office / Secretariat",RO:"Backoffice / Secretariat",AR:"\u0627\u0644\u0645\u0643\u062a\u0628 \u0627\u0644\u062e\u0644\u0641\u064a"},
    "Comunicazioni / CRM":{EN:"Communications / CRM",RO:"Comunicari / CRM",AR:"\u0627\u0644\u0627\u062a\u0635\u0627\u0644\u0627\u062a / CRM"},
    "Comunicazioni ufficiali":{EN:"Official communications",RO:"Comunicari oficiale",AR:"\u0627\u0644\u0645\u0631\u0627\u0633\u0644\u0627\u062a \u0627\u0644\u0631\u0633\u0645\u064a\u0629"},
    "Trattative in corso":{EN:"Current negotiations",RO:"Negocieri in curs",AR:"\u0627\u0644\u0645\u0641\u0627\u0648\u0636\u0627\u062a \u0627\u0644\u062c\u0627\u0631\u064a\u0629"},
    "Intermediazioni":{EN:"Intermediations",RO:"Intermedieri",AR:"\u0627\u0644\u0648\u0633\u0627\u0637\u0629"},
    "Offerte commerciali":{EN:"Commercial offers",RO:"Oferte comerciale",AR:"\u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629"},
    "Offerte":{EN:"Offers",RO:"Oferte",AR:"\u0627\u0644\u0639\u0631\u0648\u0636"},
    "Ordini":{EN:"Orders",RO:"Comenzi",AR:"\u0627\u0644\u0637\u0644\u0628\u0627\u062a"},
    "Prodotti e articoli":{EN:"Products and articles",RO:"Produse si articole",AR:"\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0648\u0627\u0644\u0645\u0648\u0627\u062f"},
    "Prodotti e Articoli":{EN:"Products and articles",RO:"Produse si articole",AR:"\u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a \u0648\u0627\u0644\u0645\u0648\u0627\u062f"},
    "Listini e conferme fornitori":{EN:"Supplier prices and confirmations",RO:"Preturi si confirmari furnizori",AR:"\u0627\u0633\u0639\u0627\u0631 \u0648\u062a\u0627\u0643\u064a\u062f\u0627\u062a \u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646"},
    "Conferme prezzi fornitori":{EN:"Supplier price confirmations",RO:"Confirmari pret furnizori",AR:"\u062a\u0627\u0643\u064a\u062f \u0627\u0633\u0639\u0627\u0631 \u0627\u0644\u0645\u0648\u0631\u062f\u064a\u0646"},
    "Gare e richieste":{EN:"Tenders and requests",RO:"Licitatii si cereri",AR:"\u0627\u0644\u0645\u0646\u0627\u0642\u0635\u0627\u062a \u0648\u0627\u0644\u0637\u0644\u0628\u0627\u062a"},
    "Brokeraggio commerciale":{EN:"Commercial brokerage",RO:"Brokeraj comercial",AR:"\u0627\u0644\u0648\u0633\u0627\u0637\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629"},
    "Anagrafiche clienti e fornitori":{EN:"Customers and suppliers",RO:"Clienti si furnizori",AR:"\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u0627\u0644\u0645\u0648\u0631\u062f\u0648\u0646"},
    "Centro stampe":{EN:"Print center",RO:"Centru printare",AR:"\u0645\u0631\u0643\u0632 \u0627\u0644\u0637\u0628\u0627\u0639\u0629"},
    "Trasporti":{EN:"Transports",RO:"Transporturi",AR:"\u0627\u0644\u0646\u0642\u0644"},
    "Fatturazione attiva e passiva":{EN:"Sales and purchase invoicing",RO:"Facturare activa si pasiva",AR:"\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0635\u0627\u062f\u0631\u0629 \u0648\u0627\u0644\u0648\u0627\u0631\u062f\u0629"},
    "Fatturazione":{EN:"Invoicing",RO:"Facturare",AR:"\u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631"},
    "Impostazioni":{EN:"Settings",RO:"Setari",AR:"\u0627\u0644\u0627\u0639\u062f\u0627\u062f\u0627\u062a"},
    "Cliente":{EN:"Customer",RO:"Client",AR:"\u0627\u0644\u0639\u0645\u064a\u0644"},
    "Fornitore":{EN:"Supplier",RO:"Furnizor",AR:"\u0627\u0644\u0645\u0648\u0631\u062f"},
    "Prodotto":{EN:"Product",RO:"Produs",AR:"\u0627\u0644\u0645\u0646\u062a\u062c"},
    "Prezzo":{EN:"Price",RO:"Pret",AR:"\u0627\u0644\u0633\u0639\u0631"},
    "Prezzo attuale":{EN:"Current price",RO:"Pret actual",AR:"\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u062d\u0627\u0644\u064a"},
    "Prezzo desiderato":{EN:"Target price",RO:"Pret tinta",AR:"\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641"},
    "Targeted price / Prezzo desiderato":{EN:"Target price",RO:"Pret tinta",AR:"\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0645\u0633\u062a\u0647\u062f\u0641"},
    "Quantita":{EN:"Quantity",RO:"Cantitate",AR:"\u0627\u0644\u0643\u0645\u064a\u0629"},
    "Valuta":{EN:"Currency",RO:"Valuta",AR:"\u0627\u0644\u0639\u0645\u0644\u0629"},
    "Stato":{EN:"Status",RO:"Stare",AR:"\u0627\u0644\u062d\u0627\u0644\u0629"},
    "Azioni":{EN:"Actions",RO:"Actiuni",AR:"\u0627\u062c\u0631\u0627\u0621\u0627\u062a"},
    "Data":{EN:"Date",RO:"Data",AR:"\u0627\u0644\u062a\u0627\u0631\u064a\u062e"},
    "Modifica":{EN:"Edit",RO:"Modifica",AR:"\u062a\u0639\u062f\u064a\u0644"},
    "Elimina":{EN:"Delete",RO:"Sterge",AR:"\u062d\u0630\u0641"},
    "Stampa":{EN:"Print",RO:"Printeaza",AR:"\u0637\u0628\u0627\u0639\u0629"},
    "Salva":{EN:"Save",RO:"Salveaza",AR:"\u062d\u0641\u0638"},
    "Chiudi":{EN:"Close",RO:"Inchide",AR:"\u0627\u063a\u0644\u0627\u0642"},
    "Chiudi pratica":{EN:"Close case",RO:"Inchide dosarul",AR:"\u0627\u063a\u0644\u0627\u0642 \u0627\u0644\u0645\u0644\u0641"},
    "Annulla pratica":{EN:"Undo case",RO:"Anuleaza inchiderea",AR:"\u0627\u0644\u063a\u0627\u0621 \u0627\u0644\u0645\u0644\u0641"},
    "Passa alla fatturazione":{EN:"Move to invoicing",RO:"Trece la facturare",AR:"\u0646\u0642\u0644 \u0627\u0644\u0649 \u0627\u0644\u0641\u0648\u0627\u062a\u064a\u0631"},
    "Fattura ordine":{EN:"Invoice order",RO:"Factura comanda",AR:"\u0641\u0627\u062a\u0648\u0631\u0629 \u0627\u0644\u0637\u0644\u0628"},
    "Crea articolo":{EN:"Create article",RO:"Creeaza articol",AR:"\u0627\u0646\u0634\u0627\u0621 \u0645\u0627\u062f\u0629"},
    "Conferma prezzo cliente":{EN:"Customer price confirmation",RO:"Confirmare pret client",AR:"\u062a\u0627\u0643\u064a\u062f \u0633\u0639\u0631 \u0627\u0644\u0639\u0645\u064a\u0644"},
    "Conferma prezzo fornitore":{EN:"Supplier price confirmation",RO:"Confirmare pret furnizor",AR:"\u062a\u0627\u0643\u064a\u062f \u0633\u0639\u0631 \u0627\u0644\u0645\u0648\u0631\u062f"},
    "Lingua gestionale":{EN:"App language",RO:"Limba aplicatie",AR:"\u0644\u063a\u0629 \u0627\u0644\u0646\u0638\u0627\u0645"},
    "Lingua stampa":{EN:"Print language",RO:"Limba printare",AR:"\u0644\u063a\u0629 \u0627\u0644\u0637\u0628\u0627\u0639\u0629"}
  };

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    ["orders","intermediations","products","supplierPriceConfirmations","tenders","contacts","communications","mailInbox","outgoingInvoices","billingWorkflow","tenderDispatches"].forEach(key => {
      state[key] = Array.isArray(state[key]) ? state[key] : [];
    });
    state.settings.officeEmail = OFFICE_EMAIL;
    if (!state.settings.email || /palmiitalia|parmitalia\.org|gmail/i.test(String(state.settings.email))) state.settings.email = OFFICE_EMAIL;
    state.settings.appLanguage = LANGS.includes(state.settings.appLanguage) ? state.settings.appLanguage : (LANGS.includes(state.settings.defaultLanguage) ? state.settings.defaultLanguage : "IT");
    state.settings.printLanguage = LANGS.includes(state.settings.printLanguage) ? state.settings.printLanguage : state.settings.appLanguage;
    return state;
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function cleanText(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function num(value){ const parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : 0; }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function money(value, currency){ return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2}); }
  function saveLocal(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function nextCode(prefix, list){
    const year = new Date().getFullYear();
    const pattern = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    const max = arr(list).reduce((result, item) => {
      return [item && item.id, item && item.code, item && item.protocol, item && item.articleCode].reduce((inner, value) => {
        const match = String(value || "").match(pattern);
        return match ? Math.max(inner, Number(match[1])) : inner;
      }, result);
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function itemId(item){ return String(item && (item.id || item.code || item.orderCode || item.dealCode || item.protocol) || ""); }
  function rowId(row){
    const node = row && row.querySelector(".pms85-code,.code-block,.pms84-code,.pms82-protocol");
    const raw = cleanText(node ? node.textContent : (row && row.cells && row.cells[0] ? row.cells[0].textContent : ""));
    return raw.split(/\s+/)[0].replace(/[;:,]+$/g, "");
  }
  function findRecord(module, id){
    return arr(st()[module]).find(item => [item.id, item.code, item.orderCode, item.dealCode, item.protocol].map(v => String(v || "")).includes(String(id || "")));
  }

  function injectCss(){
    let style = document.getElementById("pms-v149-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v149-style";
      document.head.appendChild(style);
    }
    if (style.dataset.ready === "1") return;
    style.dataset.ready = "1";
    style.textContent = `
      #pms144-world-banner{margin:8px 0 8px!important;padding:6px 8px 7px!important;border-bottom:1px solid rgba(95,143,109,.14)!important}
      #pms144-world-banner .pms144-sign{display:none!important}
      #pms143-menu{max-height:calc(100vh - 168px)!important}
      .pms149-action-row{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
      .pms149-action-row button,.pms149-mini-button{width:auto!important;margin:0!important;padding:5px 7px!important;border-radius:6px!important;font-size:10px!important;font-weight:900!important}
      .pms149-cancel-practice{background:#fff7ed!important;border:1px solid #e3c598!important;color:#7a4d16!important}
      .pms149-panel{border:1px solid #dfe9e4;border-left:4px solid #5f8f6d;background:#fff;border-radius:8px;padding:12px;margin:0 0 12px;box-shadow:0 3px 12px rgba(23,36,43,.05)}
      .pms149-panel h3{margin:0 0 4px;color:#17242b;font-size:14px;text-transform:uppercase}
      .pms149-panel p{margin:0 0 10px;color:#63736b;font-size:12px;line-height:1.4}
      .pms149-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .pms149-grid label{display:grid;gap:5px;color:#526172;font-size:11px;font-weight:900;text-transform:uppercase}
      .pms149-grid input,.pms149-grid select,.pms149-grid textarea{width:100%;box-sizing:border-box}
      .pms149-full{grid-column:1/-1}
      .pms149-checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:6px;max-height:145px;overflow:auto;border:1px solid #dfe9e4;border-radius:7px;padding:8px;background:#fbfdfb}
      .pms149-checks label{display:flex!important;align-items:center;gap:6px;text-transform:none!important;font-size:11px!important}
      .pms149-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:10px}
      .pms149-actions button{width:auto!important;margin:0!important}
      .pms149-mail-tools{margin-bottom:12px}
      .pms149-info{border:1px solid #cbd5df;background:#f7faf8;border-radius:7px;padding:8px;color:#26394d;font-size:12px;line-height:1.4}
      @media(max-width:760px){.pms149-grid{grid-template-columns:1fr}.pms149-actions{justify-content:flex-start}}
      @media print{.pms149-panel,.pms149-action-row,.pms149-mini-button{display:none!important}}
    `;
  }

  function canonical(value){
    const text = cleanText(value);
    if (!text) return "";
    if (TR[text]) return text;
    for (const [key, map] of Object.entries(TR)) {
      if (Object.values(map).some(v => cleanText(v).toLowerCase() === text.toLowerCase())) return key;
    }
    return "";
  }
  function tr(value, lang){
    const key = canonical(value);
    if (!key || lang === "IT") return value;
    return TR[key] && TR[key][lang] || value;
  }
  function appLang(){ return LANGS.includes(st().settings.appLanguage) ? st().settings.appLanguage : "IT"; }
  function printLang(){ return LANGS.includes(st().settings.printLanguage) ? st().settings.printLanguage : appLang(); }
  function translateElementText(root, lang){
    if (!root || !lang || lang === "IT") return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if (!parent || ["SCRIPT","STYLE","TEXTAREA","INPUT","OPTION"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return cleanText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const original = node.nodeValue;
      const trimmed = cleanText(original);
      const translated = tr(trimmed, lang);
      if (translated !== trimmed) node.nodeValue = original.replace(trimmed, translated);
    });
    root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(el => {
      ["placeholder","title","aria-label"].forEach(attr => {
        const value = el.getAttribute(attr);
        if (!value) return;
        const translated = tr(cleanText(value), lang);
        if (translated !== value) el.setAttribute(attr, translated);
      });
    });
  }
  function localizeVisible(){
    const lang = appLang();
    document.documentElement.lang = lang.toLowerCase();
    document.documentElement.dir = lang === "AR" ? "rtl" : "ltr";
    document.body.classList.toggle("pms149-rtl", lang === "AR");
    if (lang !== "IT") {
      ["#pms143-menu",".topbar","#content",".modal",".pms84-modal",".pms97-modal"].forEach(sel => {
        document.querySelectorAll(sel).forEach(node => translateElementText(node, lang));
      });
    }
    document.querySelectorAll("#pms134-app-lang,#pms149-app-lang").forEach(el => { if (el.value !== lang) el.value = lang; });
    document.querySelectorAll("#pms134-print-lang,#pms149-print-lang,#pms136-print-lang").forEach(el => { if (el.value !== printLang()) el.value = printLang(); });
  }
  function translatePrintHtml(html){
    const lang = printLang();
    if (lang === "IT") return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString('<div id="pms149-print-wrap">' + String(html || "") + '</div>', "text/html");
    const wrap = doc.getElementById("pms149-print-wrap");
    if (!wrap) return html;
    const walker = doc.createTreeWalker(wrap, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if (!parent || ["SCRIPT","STYLE","TEXTAREA","INPUT","OPTION"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return cleanText(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const trimmed = cleanText(node.nodeValue);
      const translated = tr(trimmed, lang);
      if (translated !== trimmed) node.nodeValue = node.nodeValue.replace(trimmed, translated);
    });
    wrap.querySelectorAll(".print-document").forEach(el => {
      el.setAttribute("lang", lang.toLowerCase());
      el.setAttribute("dir", lang === "AR" ? "rtl" : "ltr");
    });
    return wrap.innerHTML;
  }
  function wrapOpenPrint(){
    const base = typeof openPrint === "function" ? openPrint : null;
    if (!base || base.__pms149Wrapped) return;
    const wrapped = function(html){
      return base.call(this, translatePrintHtml(html));
    };
    wrapped.__pms149Wrapped = true;
    window.openPrint = wrapped;
    try { openPrint = wrapped; } catch(error) {}
  }

  function addAction(row, key, label, cls){
    if (!row || row.querySelector('[data-pms149-action="' + key + '"]')) return;
    const cell = row.cells && row.cells[row.cells.length - 1];
    if (!cell) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = cls || "inline-button pms149-mini-button";
    button.dataset.pms149Action = key;
    button.dataset.pms149Id = rowId(row);
    button.textContent = label;
    let host = cell.querySelector(".pms85-action-cell,.pms115-row-actions,.pms102-actions,.pms149-action-row");
    if (!host) {
      host = document.createElement("div");
      host.className = "pms149-action-row";
      cell.appendChild(host);
    }
    host.appendChild(button);
  }
  function decorateCommercialRows(){
    if (!window.current) return;
    const page = current.page;
    const rows = document.querySelectorAll("#content table tbody tr");
    if (!rows.length) return;
    rows.forEach(row => {
      const id = rowId(row);
      if (!id || id === "-") return;
      if (page === "trattativeInCorso" || page === "intermediations") {
        addAction(row, "createProduct", "Crea articolo");
        addAction(row, "dealToBilling", "Passa alla fatturazione");
      }
      if (page === "orders") {
        addAction(row, "orderToBilling", "Fattura ordine");
      }
      if (page === "supplierPriceConfirmations") {
        addAction(row, "printSupplierPrice", "Conferma prezzo fornitore");
        addAction(row, "printClientPrice", "Conferma prezzo cliente");
      }
    });
  }
  function createProductFromDeal(id){
    const deal = findRecord("intermediations", id);
    if (!deal) return alert("Trattativa non trovata.");
    const existing = st().products.find(p => String(p.sourceDealId || "") === String(itemId(deal)));
    if (existing) {
      alert("Articolo gia creato: " + (existing.articleCode || existing.id));
      current.page = "products";
      if (typeof render === "function") render();
      return;
    }
    const code = nextCode("PRD", st().products);
    const product = {
      id: code,
      articleCode: code,
      name: deal.product || deal.productName || deal.description || "Articolo da trattativa",
      category: deal.category || "Da trattativa",
      productType: deal.productType || "",
      supplier: deal.supplier || "",
      targetClient: deal.client || deal.customer || deal.targetClient || "",
      currency: deal.currency || "EUR",
      basePrice: deal.currentPrice || deal.price || "",
      price: deal.targetPrice || deal.currentPrice || deal.price || deal.value || "",
      unit: deal.unit || "kg",
      status: "Creato da trattativa",
      sourceDealId: itemId(deal),
      notes: "Creato automaticamente dalla trattativa " + (deal.id || deal.code || id)
    };
    st().products.unshift(product);
    saveLocal();
    alert("Articolo creato: " + code);
    current.page = "products";
    if (typeof render === "function") render();
  }
  function closeToBilling(type, id){
    if (window.PMS_V147_OPERATIONAL_CLOSE_TO_BILLING && typeof window.PMS_V147_OPERATIONAL_CLOSE_TO_BILLING.closePractice === "function") {
      window.PMS_V147_OPERATIONAL_CLOSE_TO_BILLING.closePractice(type, id);
      return;
    }
    alert("Modulo fatturazione operativa non caricato. Riapri l'app e riprova.");
  }

  function cancelPractice(type, id){
    const module = type === "order" ? "orders" : "intermediations";
    const item = findRecord(module, id);
    if (!item) return alert("Pratica non trovata.");
    if (!confirm("Annullare la chiusura della pratica e riportarla modificabile nel calendario?")) return;
    const code = item.code || item.orderCode || item.dealCode || item.id || "";
    const sourceId = itemId(item);
    const generatedInvoice = item.operationalGeneratedInvoice || item.invoiceReference || "";
    const generatedWorkflow = item.operationalGeneratedWorkflow || item.billingWorkflowId || "";
    st().outgoingInvoices = st().outgoingInvoices.filter(invoice => {
      const linked = String(invoice.protocol || invoice.id || "") === String(generatedInvoice) ||
        (String(invoice.sourceOperationalType || "") === type && String(invoice.sourceOperationalId || "") === sourceId) ||
        (code && String(invoice.linkedPractice || "") === String(code) && /Gestione operativa/i.test(String(invoice.notes || "")));
      if (!linked) return true;
      if (/bozza/i.test(String(invoice.status || "Bozza"))) return false;
      invoice.status = "Stornata";
      invoice.notes = String(invoice.notes || "") + " | Pratica riaperta da Gestione operativa.";
      return true;
    });
    st().billingWorkflow = st().billingWorkflow.filter(record => {
      const linked = String(record.id || "") === String(generatedWorkflow) ||
        (String(record.sourceOperationalType || "") === type && String(record.sourceOperationalId || "") === sourceId) ||
        (code && String(record.practiceCode || "") === String(code) && /calendario operativo/i.test(String(record.notes || "")));
      return !linked;
    });
    item.status = item.operationalPreviousStatus || (type === "order" ? "Aperto" : "In corso");
    item.billingStatus = "";
    item.invoiceStatus = "";
    delete item.operationalClosed;
    delete item.operationalClosedAt;
    delete item.closedAt;
    delete item.billingWorkflowId;
    delete item.invoiceReference;
    delete item.operationalGeneratedInvoice;
    delete item.operationalGeneratedWorkflow;
    saveLocal();
    if (typeof render === "function") render();
  }
  function decorateCalendarUndo(){
    document.querySelectorAll(".pms136-card.pms147-card-closed").forEach(card => {
      if (card.querySelector("[data-pms149-cancel-practice]")) return;
      const type = card.dataset.pms136Type || "";
      const id = card.dataset.pms136Id || "";
      const row = document.createElement("div");
      row.className = "pms149-action-row";
      row.innerHTML = '<button type="button" class="pms149-cancel-practice" data-pms149-cancel-practice="' + esc(type + ":" + id) + '">Annulla pratica</button>';
      card.appendChild(row);
    });
  }

  function parseLines(item){
    for (const key of ["supplierPriceListItemsJson","multiArticleItemsJson","orderLineItemsJson","dealLineItemsJson"]) {
      try {
        const parsed = JSON.parse(item && item[key] || "[]");
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch(error) {}
    }
    return [{product:item.product || item.productName || "Prodotto", description:item.description || "", quantity:item.quantity || "", unit:item.unit || "kg", price:item.price || item.currentPrice || item.value || "", currency:item.currency || "EUR"}];
  }
  function printPriceConfirmation(kind, id){
    const item = findRecord("supplierPriceConfirmations", id);
    if (!item) return alert("Conferma prezzo non trovata.");
    const isClient = kind === "client";
    const title = isClient ? "CONFERMA PREZZO CLIENTE" : "CONFERMA PREZZO FORNITORE";
    const partyLabel = isClient ? "Cliente" : "Fornitore";
    const party = isClient ? (item.client || item.targetClient || "") : (item.supplier || "");
    const lines = parseLines(item);
    const rows = lines.map(line => '<tr><td>' + esc(line.product || line.description || item.product || "-") + '</td><td>' + esc(line.quantity || "") + '</td><td>' + esc(line.unit || item.unit || "") + '</td><td>' + esc(line.currency || item.currency || "EUR") + ' ' + esc(line.price || line.unitPrice || item.price || "") + '</td><td>' + esc(line.notes || item.notes || "") + '</td></tr>').join("");
    const header = typeof companyPrintHeader === "function" ? companyPrintHeader(title, item.protocol || item.id || id, partyLabel) : '<h1>' + esc(title) + '</h1>';
    const note = isClient ? "Comunicazione al cliente con riepilogo prezzi ricevuti dal fornitore, da confermare secondo disponibilita finale." : "Conferma verso fornitore con condizioni, prezzi e note operative.";
    const html = '<div class="print-document">' + header + '<table class="print-table"><tr><th>' + esc(partyLabel) + '</th><td>' + esc(party || "-") + '</td><th>Data</th><td>' + esc(item.date || today()) + '</td></tr><tr><th>Fornitore origine prezzi</th><td>' + esc(item.supplier || "-") + '</td><th>Valuta</th><td>' + esc(item.currency || "EUR") + '</td></tr></table><p>' + esc(note) + '</p><table class="print-table"><thead><tr><th>Prodotto</th><th>Quantita</th><th>Unita</th><th>Prezzo</th><th>Note</th></tr></thead><tbody>' + rows + '</tbody></table><div class="print-footer">Parmitalia Distribution SRL - ' + esc(title) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }

  function ensureTenderSchema(){
    if (typeof schemas === "undefined") return;
    schemas.tenders = schemas.tenders || {title:"Gare e richieste", fields:[]};
    const fields = arr(schemas.tenders.fields);
    function upsert(key, def, afterKey){
      let field = fields.find(x => x.key === key);
      if (field) Object.assign(field, def, {key});
      else {
        const idx = fields.findIndex(x => x.key === afterKey);
        fields.splice(idx >= 0 ? idx + 1 : fields.length, 0, Object.assign({key}, def));
      }
    }
    upsert("deliveryAddress", {label:"Indirizzo consegna / spedizione", type:"textarea", full:true}, "notes");
    upsert("supplierEmails", {label:"Email fornitori per invio tender", type:"textarea", full:true}, "deliveryAddress");
    upsert("certificationsRequired", {label:"Certificazioni richieste", type:"textarea", full:true}, "supplierEmails");
    schemas.tenders.fields = fields;
  }
  function injectTenderTools(){
    if (!window.current || current.page !== "tenders") return;
    ensureTenderSchema();
    const content = document.getElementById("content");
    if (!content || document.getElementById("pms149-tender-panel")) return;
    const tenders = arr(st().tenders);
    const tenderOptions = tenders.map(t => '<option value="' + esc(itemId(t)) + '">' + esc((t.title || t.subject || t.product || "Tender") + " - " + itemId(t)) + '</option>').join("");
    const suppliers = arr(st().contacts).filter(c => /fornit|supplier/i.test(String(c.type || c.commercialRole || "")) && c.email);
    const supplierChecks = suppliers.slice(0, 60).map(c => '<label><input type="checkbox" data-pms149-supplier-email="' + esc(c.email) + '"> ' + esc(c.name || c.email) + '</label>').join("") || '<small>Nessun fornitore con email in anagrafica.</small>';
    const certChecks = CERTS.map(cert => '<label><input type="checkbox" data-pms149-cert="' + esc(cert) + '"> ' + esc(cert) + '</label>').join("");
    content.insertAdjacentHTML("afterbegin", '<div id="pms149-tender-panel" class="pms149-panel"><h3>Invio tender multiplo fornitori</h3><p>Seleziona gara, indirizzi, fornitori e certificazioni richieste. Il gestionale registra l\'invio nel CRM e apre l\'email con tutti i destinatari in BCC.</p><div class="pms149-grid"><label>Tender<select id="pms149-tender-select">' + (tenderOptions || '<option value="">Nessun tender registrato</option>') + '</select></label><label>Indirizzo consegna / destinazione<input id="pms149-tender-address" placeholder="Indirizzo merce / consegna"></label><label class="pms149-full">Email manuali fornitori<textarea id="pms149-tender-emails" placeholder="email1@azienda.com; email2@azienda.com"></textarea></label><div class="pms149-full"><label>Fornitori da anagrafica</label><div class="pms149-checks">' + supplierChecks + '</div></div><div class="pms149-full"><label>Certificazioni richieste</label><div class="pms149-checks">' + certChecks + '</div></div><label class="pms149-full">Note tender<textarea id="pms149-tender-notes" placeholder="Quantita, formato, resa, termini, scadenza risposta"></textarea></label></div><div class="pms149-actions"><button type="button" class="secondary-button" data-pms149-register-tender>Registra invio CRM</button><button type="button" class="primary-button" data-pms149-send-tender>Prepara email a tutti i fornitori</button></div></div>');
  }
  function splitEmails(text){
    return String(text || "").split(/[;,\s]+/).map(x => x.trim()).filter(x => /@/.test(x));
  }
  function selectedTenderEmails(){
    const checked = Array.from(document.querySelectorAll("[data-pms149-supplier-email]:checked")).map(x => x.dataset.pms149SupplierEmail);
    return Array.from(new Set(checked.concat(splitEmails(document.getElementById("pms149-tender-emails")?.value || ""))));
  }
  function selectedCerts(){
    return Array.from(document.querySelectorAll("[data-pms149-cert]:checked")).map(x => x.dataset.pms149Cert);
  }
  function tenderMessage(){
    const id = document.getElementById("pms149-tender-select")?.value || "";
    const tender = findRecord("tenders", id) || {};
    const certs = selectedCerts();
    const address = document.getElementById("pms149-tender-address")?.value || tender.deliveryAddress || "";
    const notes = document.getElementById("pms149-tender-notes")?.value || tender.notes || "";
    const subject = "Tender Parmitalia - " + (tender.title || tender.subject || tender.product || id || "richiesta offerta");
    const body = [
      "Buongiorno,",
      "",
      "inviamo richiesta tender/offerta per:",
      "Prodotto: " + (tender.product || tender.title || "-"),
      "Quantita: " + (tender.quantity || "-") + " " + (tender.unit || ""),
      "Indirizzo consegna: " + (address || "-"),
      "Certificazioni richieste: " + (certs.length ? certs.join(", ") : (tender.certificationsRequired || "-")),
      "",
      "Note operative:",
      notes || "-",
      "",
      "Si prega di rispondere con prezzo, disponibilita, tempi di consegna, documenti e condizioni di pagamento.",
      "",
      "Cordiali saluti,",
      "Parmitalia Distribution SRL"
    ].join("\n");
    return {tender, subject, body};
  }
  function registerTenderDispatch(openMail){
    const emails = selectedTenderEmails();
    if (!emails.length) return alert("Inserisci o seleziona almeno una email fornitore.");
    const msg = tenderMessage();
    const certs = selectedCerts();
    const dispatchId = nextCode("TEN-SEND", st().tenderDispatches);
    st().tenderDispatches.unshift({id:dispatchId, date:new Date().toISOString(), tenderId:itemId(msg.tender), emails:emails.join("; "), certifications:certs.join("; "), subject:msg.subject, body:msg.body, status:openMail ? "Email preparata" : "Registrato"});
    emails.forEach(email => st().communications.unshift({id:nextCode("CRM", st().communications), date:today(), title:msg.subject, subject:msg.subject, channel:"Email", direction:"Uscita", mailAccount:OFFICE_EMAIL, supplierEmail:email, message:msg.body, status:"Preparata", linkedTo:dispatchId}));
    saveLocal();
    if (openMail) {
      const href = "mailto:?bcc=" + encodeURIComponent(emails.join(";")) + "&subject=" + encodeURIComponent(msg.subject) + "&body=" + encodeURIComponent(msg.body);
      window.location.href = href;
    } else alert("Invio tender registrato nel CRM: " + dispatchId);
  }

  function parseMailText(text){
    const raw = String(text || "").replace(/\r\n/g, "\n");
    const header = raw.split(/\n\n/)[0] || "";
    const body = raw.slice(header.length).trim();
    function headerValue(name){
      const re = new RegExp("^" + name + ":\\s*(.+)$", "im");
      const match = header.match(re);
      return match ? match[1].trim() : "";
    }
    const from = headerValue("From") || headerValue("Da");
    const emailMatch = from.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    return {
      id: nextCode("MAIL", st().mailInbox),
      date: headerValue("Date") || today(),
      sender: from.replace(/<[^>]+>/g, "").trim() || "Email importata",
      email: emailMatch ? emailMatch[0] : "",
      subject: headerValue("Subject") || headerValue("Oggetto") || "Email importata",
      body: body || raw,
      category: "Inbox",
      status: "Aperta"
    };
  }
  function importMailText(text){
    const mail = parseMailText(text);
    st().mailInbox.unshift(mail);
    st().communications.unshift({id:nextCode("CRM", st().communications), date:today(), title:mail.subject, subject:mail.subject, channel:"Email", direction:"Entrata", mailAccount:OFFICE_EMAIL, message:mail.body, status:"Aperta", client:mail.sender});
    saveLocal();
    if (typeof render === "function") render();
  }
  async function syncMail(){
    const endpoint = st().settings.mailSyncEndpoint || st().settings.graphMailEndpoint || "";
    if (!endpoint) {
      alert("Per ricevere automaticamente le email serve un collegamento reale Microsoft Graph/IMAP o un endpoint cloud. In questa app locale ho attivato importazione .eml/.txt e registro CRM con office@parmitalia.ro.");
      return;
    }
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      arr(data.messages || data).forEach(item => importMailText("From: " + (item.from || item.sender || "") + "\nSubject: " + (item.subject || "") + "\nDate: " + (item.date || today()) + "\n\n" + (item.body || item.text || "")));
      alert("Email sincronizzate.");
    } catch(error) {
      alert("Sincronizzazione mail non riuscita: " + (error.message || error));
    }
  }
  function injectCrmTools(){
    if (!window.current || current.page !== "communications") return;
    const content = document.getElementById("content");
    if (!content) return;
    const wrongMail = /office@palmiitalia\.org|office@parmitalia\.org|parmitaliadistribution@gmail\.com/g;
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        wrongMail.lastIndex = 0;
        return wrongMail.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => { node.nodeValue = String(node.nodeValue || "").replace(wrongMail, OFFICE_EMAIL); });
    content.querySelectorAll('a[href^="mailto:"],a[href*="outlook"]').forEach(a => {
      if (a.href && a.href.startsWith("mailto:")) a.href = "mailto:" + OFFICE_EMAIL;
    });
    if (document.getElementById("pms149-mail-tools")) return;
    content.insertAdjacentHTML("afterbegin", '<div id="pms149-mail-tools" class="pms149-panel pms149-mail-tools"><h3>Ricezione email CRM</h3><p>Account corretto: <strong>' + OFFICE_EMAIL + '</strong>. Puoi importare email .eml/.txt nel CRM; la sincronizzazione automatica richiede collegamento Microsoft Graph/IMAP o endpoint cloud.</p><div class="pms149-actions"><button type="button" class="secondary-button" data-pms149-sync-mail>Scarica posta</button><button type="button" class="primary-button" data-pms149-import-mail>Importa email / EML</button><input id="pms149-mail-file" type="file" accept=".eml,.txt,message/rfc822,text/plain" hidden></div></div>');
  }

  function handleClicks(event){
    const action = event.target && event.target.closest && event.target.closest("[data-pms149-action]");
    if (action) {
      event.preventDefault();
      const key = action.dataset.pms149Action;
      const id = action.dataset.pms149Id;
      if (key === "createProduct") return createProductFromDeal(id);
      if (key === "dealToBilling") return closeToBilling("deal", id);
      if (key === "orderToBilling") return closeToBilling("order", id);
      if (key === "printSupplierPrice") return printPriceConfirmation("supplier", id);
      if (key === "printClientPrice") return printPriceConfirmation("client", id);
    }
    const cancel = event.target && event.target.closest && event.target.closest("[data-pms149-cancel-practice]");
    if (cancel) {
      event.preventDefault();
      event.stopPropagation();
      const parts = String(cancel.dataset.pms149CancelPractice || "").split(":");
      return cancelPractice(parts[0], parts.slice(1).join(":"));
    }
    if (event.target.closest("[data-pms149-send-tender]")) {
      event.preventDefault();
      return registerTenderDispatch(true);
    }
    if (event.target.closest("[data-pms149-register-tender]")) {
      event.preventDefault();
      return registerTenderDispatch(false);
    }
    if (event.target.closest("[data-pms149-sync-mail]")) {
      event.preventDefault();
      return syncMail();
    }
    if (event.target.closest("[data-pms149-import-mail]")) {
      event.preventDefault();
      document.getElementById("pms149-mail-file")?.click();
    }
  }
  function bindInputs(){
    const file = document.getElementById("pms149-mail-file");
    if (file && file.dataset.bound !== "1") {
      file.dataset.bound = "1";
      file.onchange = async () => {
        const selected = file.files && file.files[0];
        if (!selected) return;
        importMailText(await selected.text());
        file.value = "";
      };
    }
    document.querySelectorAll("#pms134-app-lang,#pms149-app-lang").forEach(sel => {
      if (sel.dataset.pms149Bound === "1") return;
      sel.dataset.pms149Bound = "1";
      sel.addEventListener("change", () => {
        st().settings.appLanguage = sel.value;
        saveLocal();
        if (typeof render === "function") render();
        setTimeout(localizeVisible, 80);
      }, true);
    });
    document.querySelectorAll("#pms134-print-lang,#pms149-print-lang,#pms136-print-lang").forEach(sel => {
      if (sel.dataset.pms149Bound === "1") return;
      sel.dataset.pms149Bound = "1";
      sel.addEventListener("change", () => {
        st().settings.printLanguage = sel.value;
        saveLocal();
        setTimeout(localizeVisible, 80);
      }, true);
    });
  }
  function afterRender(){
    st();
    injectCss();
    ensureTenderSchema();
    decorateCalendarUndo();
    decorateCommercialRows();
    injectTenderTools();
    injectCrmTools();
    bindInputs();
    localizeVisible();
  }

  function init(){
    st();
    injectCss();
    wrapOpenPrint();
    document.addEventListener("click", handleClicks, true);
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !window.__pms149RenderWrapped) {
      window.__pms149RenderWrapped = true;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 60);
        setTimeout(afterRender, 180);
        return result;
      };
    }
    const baseOpenModal = typeof openModal === "function" ? openModal : null;
    if (baseOpenModal && !window.__pms149OpenModalWrapped) {
      window.__pms149OpenModalWrapped = true;
      openModal = function(){
        ensureTenderSchema();
        const result = baseOpenModal.apply(this, arguments);
        setTimeout(afterRender, 80);
        return result;
      };
    }
    [100, 400, 1200, 2500].forEach(ms => setTimeout(afterRender, ms));
    setInterval(() => { decorateCalendarUndo(); bindInputs(); localizeVisible(); }, 2500);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.PMS_V149_WORKFLOW_I18N_CRM_COMMERCIAL_FIX = {version:VERSION, cancelPractice, localizeVisible};
})();
