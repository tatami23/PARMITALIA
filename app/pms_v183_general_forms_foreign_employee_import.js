(function(){
  "use strict";

  const VERSION = "pms_v183_general_forms_foreign_employee_import";
  const PAGE_ID = "productForms";
  const TABS = [
    {id:"products", label:"Raccolta prodotto"},
    {id:"contacts", label:"Raccolta anagrafiche"},
    {id:"foreign", label:"Raccolta dipendenti estero"},
    {id:"sections", label:"Tutte le sezioni"}
  ];

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function st(){
    window.state = window.state || {};
    if (!Array.isArray(state.products)) state.products = [];
    if (!Array.isArray(state.contacts)) state.contacts = [];
    if (!Array.isArray(state.foreignEmployees)) state.foreignEmployees = [];
    if (!Array.isArray(state.foreignRecruiting)) state.foreignRecruiting = [];
    if (!Array.isArray(state.pms183ImportedForms)) state.pms183ImportedForms = [];
    return state;
  }
  function uid(prefix, list){
    if (typeof window.uid === "function") return window.uid(prefix);
    const count = arr(list).length + 1;
    return prefix + "-" + String(count).padStart(4, "0");
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V173_AUTO_SAVE_UPDATE && typeof window.PMS_V173_AUTO_SAVE_UPDATE.saveNow === "function") {
        window.PMS_V173_AUTO_SAVE_UPDATE.saveNow("v183-general-forms");
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function setPageLocal(id){
    if (typeof setPage === "function") setPage(id);
    else {
      window.current = window.current || {page:id, filters:{}};
      current.page = id;
      if (typeof render === "function") render();
    }
  }
  function num(value){
    const n = Number(String(value || "").replace(",", ".").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  function parseForm(text){
    const out = {};
    let currentKey = "";
    String(text || "").split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([^:]+)\s*:\s*(.*)$/);
      if (match) {
        currentKey = normalizeKey(match[1]);
        out[currentKey] = match[2].trim();
      } else if (currentKey && clean(line)) {
        out[currentKey] += (out[currentKey] ? "\n" : "") + line.trim();
      }
    });
    return out;
  }
  function normalizeKey(key){
    return String(key || "")
      .trim()
      .toUpperCase()
      .replace(/[^\w]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }
  function pick(data, keys, fallback){
    for (const key of keys) {
      const value = data[normalizeKey(key)];
      if (clean(value)) return value;
    }
    return fallback || "";
  }
  function templateProducts(){
    return `CODICE_ARTICOLO:
NOME_PRODOTTO:
CATEGORIA:
TIPO_PRODOTTO:
VARIANTE:
FORNITORE:
CLIENTE_TARGET:
DESCRIZIONE_IT:
DESCRIZIONE_RO:
DESCRIZIONE_EN:
VALUTA: EUR
PREZZO_BASE:
TIPO_PREZZO_BASE: Prezzo al kg / Price per kg
MOQ:
SHELF_LIFE:
TIPO_IMBALLAGGIO:
PEZZI_PER_CONFEZIONE:
CONFEZIONI_PER_CARTONE:
IMBALLAGGIO_PRIMARIO:
IMBALLAGGIO_SECONDARIO:
CARTONI_PER_PALLET:
PALLET_PER_CONTAINER:
PREZZO_PALLET:
CONDIZIONE_PALLET:
PREZZO_CAMION:
CONDIZIONE_CAMION:
PREZZO_CONTAINER:
CONDIZIONE_CONTAINER:
DOCUMENTI_RICHIESTI:
LINK_CLOUD:
NOTE_RISERVATE:`;
  }
  function templateContacts(){
    return `TIPO_ANAGRAFICA: Cliente / Fornitore / Agente / Partner
RAGIONE_SOCIALE:
NOME_REFERENTE:
PAESE:
CITTA:
INDIRIZZO:
PARTITA_IVA:
CODICE_FISCALE:
EMAIL:
TELEFONO:
WHATSAPP:
LINGUA:
CATEGORIA:
PRODOTTI_INTERESSE:
CONDIZIONI_PAGAMENTO:
BANCA_IBAN:
NOTE_COMMERCIALI:
STATO: Attivo`;
  }
  function templateForeign(){
    return `NOME_COMPLETO:
PAESE:
CITTA:
NAZIONALITA:
RUOLO:
PROFILO:
CANALE:
RECRUITER:
STUDENTE_O_LAVORATORE: Lavoratore
TELEFONO_WHATSAPP:
EMAIL:
STATO: In valutazione
STATO_PRATICA: Pratica aperta
VALUTA: EUR
COSTO_DA_PAGARE:
DOCUMENTAZIONE_RICHIESTA: Foto passaporto, passaporto, privacy bilingue
NUMERO_PASSAPORTO:
DATE_PASSAPORTO:
PRIVACY_ITALIANO: Il candidato autorizza Parmitalia al trattamento dei dati personali e dei documenti forniti per finalita di recruiting, selezione, verifica documentale e gestione della pratica lavorativa.
PRIVACY_ROMENO: Candidatul autorizeaza Parmitalia sa prelucreze datele personale si documentele furnizate pentru recrutare, selectie, verificare documente si gestionarea dosarului de munca.
SCHEDA_DOCUMENTI_COMPETENZE:
NOTE_INTERNE:`;
  }
  function genericTemplate(moduleId){
    const schema = window.schemas && schemas[moduleId];
    if (schema && Array.isArray(schema.fields)) {
      return schema.fields.map(field => normalizeKey(field.label || field.key) + ":").join("\n");
    }
    return `TITOLO:
NOME:
DATA:
STATO:
DESCRIZIONE:
NOTE:`;
  }
  function productFromData(data, rawText){
    const id = uid("PRD", state.products);
    const basePrice = num(pick(data, ["PREZZO_BASE", "BASE_PRICE"]));
    const priceType = pick(data, ["TIPO_PREZZO_BASE", "BASE_PRICE_TYPE"], "Prezzo al kg / Price per kg");
    const item = {
      id,
      articleCode: pick(data, ["CODICE_ARTICOLO", "PRODUCT_CODE"], id),
      name: pick(data, ["NOME_PRODOTTO", "PRODUCT_NAME"]),
      category: pick(data, ["CATEGORIA", "CATEGORY"]),
      productType: pick(data, ["TIPO_PRODOTTO", "PRODUCT_TYPE"]),
      productVariant: pick(data, ["VARIANTE", "VARIANT"]),
      supplier: pick(data, ["FORNITORE", "SUPPLIER"]),
      targetClient: pick(data, ["CLIENTE_TARGET", "TARGET_CLIENT"]),
      descriptionIt: pick(data, ["DESCRIZIONE_IT"]),
      descriptionRo: pick(data, ["DESCRIZIONE_RO"]),
      descriptionEn: pick(data, ["DESCRIZIONE_EN"]),
      currency: pick(data, ["VALUTA", "CURRENCY"], "EUR"),
      basePrice,
      price: basePrice,
      basePriceType: priceType,
      priceType,
      unit: priceType,
      moq: pick(data, ["MOQ"]),
      shelfLife: pick(data, ["SHELF_LIFE"]),
      packagingType: pick(data, ["TIPO_IMBALLAGGIO", "PACKAGING_TYPE"]),
      piecesPerPack: num(pick(data, ["PEZZI_PER_CONFEZIONE", "PIECES_PER_PACK"])),
      packsPerCarton: num(pick(data, ["CONFEZIONI_PER_CARTONE", "PACKS_PER_CARTON"])),
      primaryPackaging: pick(data, ["IMBALLAGGIO_PRIMARIO", "PRIMARY_PACKAGING"]),
      secondaryPackaging: pick(data, ["IMBALLAGGIO_SECONDARIO", "SECONDARY_PACKAGING"]),
      cartonsPerPallet: num(pick(data, ["CARTONI_PER_PALLET", "CARTONS_PER_PALLET"])),
      palletsPerContainer: num(pick(data, ["PALLET_PER_CONTAINER", "PALLETS_PER_CONTAINER"])),
      tierPalletPrice: num(pick(data, ["PREZZO_PALLET", "PALLET_PRICE"])),
      tierPalletCondition: pick(data, ["CONDIZIONE_PALLET", "PALLET_CONDITION"]),
      tierTruckPrice: num(pick(data, ["PREZZO_CAMION", "TRUCK_PRICE"])),
      tierTruckCondition: pick(data, ["CONDIZIONE_CAMION", "TRUCK_CONDITION"]),
      tierContainerPrice: num(pick(data, ["PREZZO_CONTAINER", "CONTAINER_PRICE"])),
      tierContainerCondition: pick(data, ["CONDIZIONE_CONTAINER", "CONTAINER_CONDITION"]),
      documents: pick(data, ["DOCUMENTI_RICHIESTI", "REQUIRED_DOCUMENTS"]),
      cloudLink: pick(data, ["LINK_CLOUD", "CLOUD_LINK"]),
      reservedNote: pick(data, ["NOTE_RISERVATE", "RESERVED_NOTES"]),
      status: "Da verificare",
      createdAt: new Date().toISOString()
    };
    state.products.unshift(item);
    rememberImport("products", item.id, item.name, rawText);
    return item;
  }
  function contactFromData(data, rawText){
    const id = uid("CNT", state.contacts);
    const item = {
      id,
      type: pick(data, ["TIPO_ANAGRAFICA", "TYPE"], "Cliente / Fornitore"),
      company: pick(data, ["RAGIONE_SOCIALE", "AZIENDA", "COMPANY"]),
      name: pick(data, ["NOME_REFERENTE", "NOME", "NAME"]),
      country: pick(data, ["PAESE", "COUNTRY"]),
      city: pick(data, ["CITTA", "CITY"]),
      address: pick(data, ["INDIRIZZO", "ADDRESS"]),
      vat: pick(data, ["PARTITA_IVA", "VAT"]),
      fiscalCode: pick(data, ["CODICE_FISCALE", "FISCAL_CODE"]),
      email: pick(data, ["EMAIL"]),
      phone: pick(data, ["TELEFONO", "PHONE"]),
      whatsapp: pick(data, ["WHATSAPP"]),
      language: pick(data, ["LINGUA", "LANGUAGE"]),
      category: pick(data, ["CATEGORIA", "CATEGORY"]),
      productsInterest: pick(data, ["PRODOTTI_INTERESSE", "PRODUCTS_INTEREST"]),
      paymentTerms: pick(data, ["CONDIZIONI_PAGAMENTO", "PAYMENT_TERMS"]),
      iban: pick(data, ["BANCA_IBAN", "IBAN"]),
      notes: pick(data, ["NOTE_COMMERCIALI", "NOTE", "NOTES"]),
      status: pick(data, ["STATO", "STATUS"], "Attivo"),
      createdAt: new Date().toISOString()
    };
    state.contacts.unshift(item);
    rememberImport("contacts", item.id, item.company || item.name, rawText);
    return item;
  }
  function foreignFromData(data, rawText){
    const id = uid("EST", state.foreignEmployees);
    const fullName = pick(data, ["NOME_COMPLETO", "FULL_NAME", "NOME"]);
    const phone = pick(data, ["TELEFONO_WHATSAPP", "TELEFONO", "WHATSAPP", "PHONE"]);
    const item = {
      id,
      fullName,
      name: fullName,
      country: pick(data, ["PAESE", "COUNTRY"]),
      city: pick(data, ["CITTA", "CITY"]),
      nationality: pick(data, ["NAZIONALITA", "NATIONALITY"]),
      role: pick(data, ["RUOLO", "ROLE"]),
      profile: pick(data, ["PROFILO", "PROFILE"]),
      sourceChannel: pick(data, ["CANALE", "SOURCE", "CHANNEL"]),
      recruiter: pick(data, ["RECRUITER"]),
      personType: pick(data, ["STUDENTE_O_LAVORATORE", "TYPE"], "Lavoratore"),
      phone,
      whatsapp: phone,
      email: pick(data, ["EMAIL"]),
      status: pick(data, ["STATO", "STATUS"], "In valutazione"),
      practiceStatus: pick(data, ["STATO_PRATICA", "PRACTICE_STATUS"], "Pratica aperta"),
      currency: pick(data, ["VALUTA", "CURRENCY"], "EUR"),
      costAmount: pick(data, ["COSTO_DA_PAGARE", "COSTO", "COST"]),
      toPayAmount: pick(data, ["COSTO_DA_PAGARE", "COSTO", "COST"]),
      documentRequests: pick(data, ["DOCUMENTAZIONE_RICHIESTA", "DOCUMENTI_RICHIESTI"]),
      documents: pick(data, ["SCHEDA_DOCUMENTI_COMPETENZE", "DOCUMENTI", "DOCUMENTS"]),
      skills: pick(data, ["PROFILO", "SCHEDA_DOCUMENTI_COMPETENZE", "SKILLS"]),
      notes: pick(data, ["NOTE_INTERNE", "NOTE", "NOTES"]),
      passportNumber: pick(data, ["NUMERO_PASSAPORTO", "PASSPORT_NUMBER"]),
      pms176DocSlots: {photoPassport:[], passport:[], bilingualPrivacy:[], generatedDocument:[], other:[]},
      pms176DocData: {
        fullName,
        nationality: pick(data, ["NAZIONALITA", "NATIONALITY"]),
        country: pick(data, ["PAESE", "COUNTRY"]),
        city: pick(data, ["CITTA", "CITY"]),
        countryCity: clean(pick(data, ["PAESE", "COUNTRY"]) + " " + pick(data, ["CITTA", "CITY"])),
        role: pick(data, ["RUOLO", "ROLE"]),
        phone,
        email: pick(data, ["EMAIL"]),
        passportNumber: pick(data, ["NUMERO_PASSAPORTO", "PASSPORT_NUMBER"]),
        passportDates: pick(data, ["DATE_PASSAPORTO", "PASSPORT_DATES"]),
        privacyItalian: pick(data, ["PRIVACY_ITALIANO", "PRIVACY_IT"], "Il candidato autorizza Parmitalia al trattamento dei dati personali e dei documenti forniti per finalita di recruiting, selezione, verifica documentale e gestione della pratica lavorativa."),
        privacyRomanian: pick(data, ["PRIVACY_ROMENO", "PRIVACY_RO"], "Candidatul autorizeaza Parmitalia sa prelucreze datele personale si documentele furnizate pentru recrutare, selectie, verificare documente si gestionarea dosarului de munca."),
        documentNotes: pick(data, ["NOTE_INTERNE", "NOTE", "NOTES"])
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.foreignEmployees.unshift(item);
    state.foreignRecruiting.unshift(item);
    rememberImport("foreignEmployees", item.id, item.fullName, rawText);
    return item;
  }
  function genericFromData(moduleId, data, rawText){
    if (!moduleId) return null;
    const list = arr(state[moduleId]);
    state[moduleId] = list;
    const id = uid("MOD", list);
    const item = {id, createdAt:new Date().toISOString(), status:pick(data, ["STATO", "STATUS"], "Da verificare")};
    Object.keys(data).forEach(key => {
      const camel = key.toLowerCase().replace(/_([a-z0-9])/g, (_, ch) => ch.toUpperCase());
      item[camel] = data[key];
    });
    list.unshift(item);
    rememberImport(moduleId, id, item.titolo || item.nome || item.name || id, rawText);
    return item;
  }
  function rememberImport(module, recordId, title, rawText){
    state.pms183ImportedForms.unshift({
      id: uid("FRM", state.pms183ImportedForms),
      module,
      recordId,
      title: title || recordId,
      rawText,
      createdAt: new Date().toISOString()
    });
  }
  function activeTab(){
    const hash = sessionStorage.getItem("pms183FormsTab") || "products";
    return TABS.some(tab => tab.id === hash) ? hash : "products";
  }
  function setActiveTab(tab){
    sessionStorage.setItem("pms183FormsTab", tab);
    renderFormsPage();
  }
  function sectionOptions(){
    const mods = arr(window.modules).filter(m => m && m.id && m.id !== PAGE_ID);
    return mods.map(m => '<option value="' + esc(m.id) + '">' + esc(m.label || m.id) + '</option>').join("");
  }
  function templateForTab(tab){
    if (tab === "contacts") return templateContacts();
    if (tab === "foreign") return templateForeign();
    if (tab === "sections") {
      const moduleId = document.getElementById("pms183-section-select")?.value || "offers";
      return genericTemplate(moduleId);
    }
    return templateProducts();
  }
  function card(tab, title, importTitle, template, importId){
    return '<div class="pms183-grid">' +
      '<section class="pms183-card"><div class="pms183-card-head"><h4>' + esc(title) + '</h4><div><button type="button" class="secondary-button" data-pms183-copy="' + esc(tab) + '">Copia</button><button type="button" class="secondary-button" data-pms183-download="' + esc(tab) + '">Scarica TXT</button></div></div><textarea id="pms183-template-' + esc(tab) + '" class="pms183-textarea" readonly>' + esc(template) + '</textarea></section>' +
      '<section class="pms183-card"><div class="pms183-card-head"><h4>' + esc(importTitle) + '</h4></div><textarea id="' + esc(importId) + '" class="pms183-textarea" placeholder="Incolla qui il modulo compilato..."></textarea><div class="pms183-actions"><button type="button" class="primary-button" data-pms183-import="' + esc(tab) + '">Importa e crea scheda</button><button type="button" class="secondary-button" data-pms183-clear="' + esc(importId) + '">Pulisci</button></div></section>' +
    '</div>';
  }
  function formsHtml(){
    const tab = activeTab();
    let body = "";
    if (tab === "contacts") body = card("contacts", "Modulo raccolta anagrafiche", "Importa anagrafica compilata", templateContacts(), "pms183-import-contacts");
    else if (tab === "foreign") body = card("foreign", "Modulo raccolta dipendenti estero", "Importa dipendente estero compilato", templateForeign(), "pms183-import-foreign");
    else if (tab === "sections") {
      const selected = sessionStorage.getItem("pms183SectionModule") || "offers";
      body = '<div class="pms183-section-picker"><label>Sezione gestionale<select id="pms183-section-select">' + sectionOptions() + '</select></label></div>' +
        card("sections", "Modulo raccolta per sezione selezionata", "Importa scheda generica compilata", genericTemplate(selected), "pms183-import-sections");
    } else body = card("products", "Modulo raccolta prodotto", "Importa prodotto compilato", templateProducts(), "pms183-import-products");
    return '<div class="section-header pms183-header"><h3>Moduli</h3><div class="filters"><button class="secondary-button" style="width:auto;margin:0" data-nav="products">Prodotti</button><button class="secondary-button" style="width:auto;margin:0" data-nav="contacts">Anagrafiche</button><button class="secondary-button" style="width:auto;margin:0" data-nav="foreignEmployees">Dipendenti estero</button></div></div>' +
      '<div class="pms183-tabs">' + TABS.map(item => '<button type="button" class="' + (item.id === tab ? "active" : "") + '" data-pms183-tab="' + esc(item.id) + '">' + esc(item.label) + '</button>').join("") + '</div>' +
      body +
      '<section class="pms183-card pms183-history"><h4>Ultimi moduli importati</h4>' + importHistoryHtml() + '</section>';
  }
  function importHistoryHtml(){
    const rows = arr(st().pms183ImportedForms).slice(0, 8).map(item => '<tr><td>' + esc(item.module) + '</td><td>' + esc(item.title || item.recordId) + '</td><td><span class="code-block">' + esc(item.recordId) + '</span></td><td>' + esc(String(item.createdAt || "").slice(0, 16).replace("T", " ")) + '</td></tr>').join("");
    return '<table class="print-table"><thead><tr><th>Sezione</th><th>Nome</th><th>Codice</th><th>Data</th></tr></thead><tbody>' + (rows || '<tr><td colspan="4">Nessun modulo importato.</td></tr>') + '</tbody></table>';
  }
  function renderFormsPage(){
    const content = document.getElementById("content");
    if (!content) return;
    content.innerHTML = formsHtml();
    const section = document.getElementById("pms183-section-select");
    if (section) {
      section.value = sessionStorage.getItem("pms183SectionModule") || section.value || "offers";
      document.getElementById("pms183-template-sections").value = genericTemplate(section.value);
      section.onchange = () => {
        sessionStorage.setItem("pms183SectionModule", section.value);
        document.getElementById("pms183-template-sections").value = genericTemplate(section.value);
      };
    }
    bindForms();
  }
  function importTab(tab){
    st();
    let id = "pms183-import-products";
    if (tab === "contacts") id = "pms183-import-contacts";
    if (tab === "foreign") id = "pms183-import-foreign";
    if (tab === "sections") id = "pms183-import-sections";
    const text = document.getElementById(id)?.value || "";
    const data = parseForm(text);
    let item = null;
    if (tab === "contacts") {
      if (!pick(data, ["RAGIONE_SOCIALE", "NOME_REFERENTE", "NOME"])) return alert("Modulo incompleto: manca ragione sociale o nome referente.");
      item = contactFromData(data, text);
    } else if (tab === "foreign") {
      if (!pick(data, ["NOME_COMPLETO", "FULL_NAME", "NOME"])) return alert("Modulo incompleto: manca NOME_COMPLETO.");
      item = foreignFromData(data, text);
    } else if (tab === "sections") {
      const moduleId = document.getElementById("pms183-section-select")?.value || sessionStorage.getItem("pms183SectionModule") || "";
      item = genericFromData(moduleId, data, text);
    } else {
      if (!pick(data, ["NOME_PRODOTTO", "PRODUCT_NAME"])) return alert("Modulo incompleto: manca NOME_PRODOTTO.");
      item = productFromData(data, text);
    }
    saveNow();
    alert("Scheda creata: " + (item.fullName || item.name || item.company || item.id) + "\nCodice: " + item.id);
    if (tab === "contacts") setPageLocal("contacts");
    else if (tab === "foreign") setPageLocal("foreignEmployees");
    else if (tab === "sections") renderFormsPage();
    else setPageLocal("products");
  }
  function copyTemplate(tab){
    const text = templateForTab(tab);
    try {
      navigator.clipboard.writeText(text);
      alert("Modulo copiato negli appunti.");
    } catch(error) {
      const area = document.getElementById("pms183-template-" + tab);
      if (area) {
        area.focus();
        area.select();
      }
      alert("Copia manualmente il testo del modulo.");
    }
  }
  function downloadTemplate(tab){
    const names = {products:"modulo_raccolta_prodotto", contacts:"modulo_raccolta_anagrafiche", foreign:"modulo_raccolta_dipendenti_estero", sections:"modulo_raccolta_sezione"};
    const blob = new Blob([templateForTab(tab)], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = (names[tab] || "modulo_raccolta") + "_parmitalia.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function bindForms(){
    document.querySelectorAll("[data-pms183-tab]").forEach(button => {
      button.onclick = () => setActiveTab(button.getAttribute("data-pms183-tab"));
    });
    document.querySelectorAll("[data-pms183-copy]").forEach(button => {
      button.onclick = () => copyTemplate(button.getAttribute("data-pms183-copy"));
    });
    document.querySelectorAll("[data-pms183-download]").forEach(button => {
      button.onclick = () => downloadTemplate(button.getAttribute("data-pms183-download"));
    });
    document.querySelectorAll("[data-pms183-import]").forEach(button => {
      button.onclick = () => importTab(button.getAttribute("data-pms183-import"));
    });
    document.querySelectorAll("[data-pms183-clear]").forEach(button => {
      button.onclick = () => {
        const area = document.getElementById(button.getAttribute("data-pms183-clear"));
        if (area) area.value = "";
      };
    });
    document.querySelectorAll("[data-nav]").forEach(button => {
      button.onclick = () => setPageLocal(button.getAttribute("data-nav"));
    });
  }
  function ensureMenuLabel(){
    if (Array.isArray(window.modules)) {
      const mod = modules.find(item => item && item.id === PAGE_ID);
      if (mod) {
        mod.label = "Moduli";
        mod.subtitle = "Moduli raccolta per prodotti, anagrafiche, dipendenti estero e sezioni";
        mod.roles = Array.from(new Set([].concat(mod.roles || [], ["admin", "assistant", "agent"])));
      }
    }
    document.querySelectorAll('[data-pms143-page="' + PAGE_ID + '"],.nav-button[data-page="' + PAGE_ID + '"],[data-nav="' + PAGE_ID + '"]').forEach(button => {
      const label = button.querySelector("b,.pms100-label") || button;
      if (label) label.textContent = "Moduli";
      button.setAttribute("title", "Moduli");
    });
    document.querySelectorAll('[data-nav="' + PAGE_ID + '"],button').forEach(button => {
      if (clean(button.textContent) === "Moduli prodotto") button.textContent = "Moduli";
    });
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    if (window.current && current.page === PAGE_ID) {
      if (title) title.textContent = "Moduli";
      if (subtitle) subtitle.textContent = "Moduli raccolta per tutte le sezioni";
    }
  }
  function injectCss(){
    let style = document.getElementById("pms-v183-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v183-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms183-header{align-items:center}
      .pms183-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 12px}
      .pms183-tabs button{width:auto!important;margin:0!important;padding:8px 10px!important;border:1px solid #cbd5e1!important;border-radius:8px!important;background:#fff!important;color:#17242b!important;font-size:12px!important;font-weight:900!important}
      .pms183-tabs button.active{background:#eef7f0!important;border-color:#5f8f6d!important;color:#143624!important}
      .pms183-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;align-items:start}
      .pms183-card{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:12px;display:grid;gap:10px}
      .pms183-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
      .pms183-card-head h4,.pms183-history h4{margin:0;color:#0f172a}
      .pms183-card-head div,.pms183-actions{display:flex;flex-wrap:wrap;gap:7px}
      .pms183-card button,.pms183-actions button{width:auto!important;margin:0!important}
      .pms183-textarea{width:100%;min-height:430px;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font-family:Consolas,monospace;font-size:12px;line-height:1.35;resize:vertical;background:#fff;color:#111827}
      .pms183-section-picker{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:10px;margin-bottom:12px}
      .pms183-section-picker label{display:grid;gap:5px;font-size:12px;font-weight:900;color:#475569;max-width:420px}
      .pms183-history{margin-top:12px}
      @media(max-width:900px){.pms183-grid{grid-template-columns:1fr}.pms183-textarea{min-height:320px}}
      @media print{.pms183-tabs,.pms183-actions,.pms183-card-head div{display:none!important}}
    `;
  }
  function install(){
    st();
    injectCss();
    ensureMenuLabel();
    const baseRender = typeof window.render === "function" ? window.render : null;
    if (baseRender && !baseRender.__pms183Wrapped) {
      window.render = function(){
        if (window.current && current.page === PAGE_ID) {
          renderFormsPage();
          ensureMenuLabel();
          return;
        }
        const result = baseRender.apply(this, arguments);
        setTimeout(ensureMenuLabel, 30);
        setTimeout(ensureMenuLabel, 180);
        return result;
      };
      window.render.__pms183Wrapped = true;
    }
    [80, 240, 700, 1400].forEach(ms => setTimeout(ensureMenuLabel, ms));
    setInterval(ensureMenuLabel, 1000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
  window.PMS_V183_GENERAL_FORMS_FOREIGN_EMPLOYEE_IMPORT = {version:VERSION, renderFormsPage, importTab};
})();
