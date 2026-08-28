(function(){
  "use strict";

  const VERSION = "PMS-V134-ELEGANT-PRINT-LANGUAGE-CRM-TRANSPORT";
  const DEALS_MODULE = "intermediations";
  const LANGS = ["IT","EN","RO","AR"];
  const LANG_NAMES = {IT:"Italiano",EN:"English",RO:"Romana",AR:"Arabic"};
  const DEFAULT_THEME = {name:"Parmitalia elegante", primary:"#26394d", secondary:"#6f7f8f"};

  const TR = {
    EN:{
      "Dashboard":"Dashboard","Andamenti di mercato":"Market trends","Assistente Carlo":"Carlo Assistant","Comunicazioni / CRM":"Communications / CRM","Comunicazioni e CRM":"Communications and CRM","Trattative in corso":"Current negotiations","Intermediazioni":"Intermediations","Offerte":"Offers","Ordini":"Orders","Prodotti e Articoli":"Products and articles","Conferme prezzi fornitori":"Supplier price confirmations","Stampe":"Print Center","Impostazioni":"Settings","Salva":"Save","Salva impostazioni":"Save settings","Modifica":"Edit","Elimina":"Delete","Stampa":"Print","Interna":"Internal","Cliente":"Customer","Fornitore":"Supplier","Agente":"Agent","Azioni":"Actions","Data":"Date","Cliente target":"Target customer","Prodotto":"Product","Prezzo":"Price","Prezzo attuale":"Current price","Obiettivo di prezzo / Prezzo desiderato":"Target price","Targeted price / Prezzo desiderato":"Target price","Prezzo desiderato":"Target price","Valore":"Value","Stato":"Status","Priorita":"Priority","Pagamento":"Payment","Condizioni":"Terms","Note interne":"Internal notes","Lingua gestionale":"App language","Lingua stampa":"Print language","Scarica posta":"Download mail","Mail ricevute nel gestionale":"Mail received in CRM","Database trasporti":"Transport database","Comparatore mercato trasporti":"Transport market comparator","Prezzi mercato internazionale":"International market prices","Backup":"Backup","Esporta backup":"Export backup","Importa backup":"Import backup","Reset dati":"Reset data"
    },
    RO:{
      "Dashboard":"Tablou de bord","Andamenti di mercato":"Tendinte piata","Assistente Carlo":"Asistent Carlo","Comunicazioni / CRM":"Comunicari / CRM","Comunicazioni e CRM":"Comunicari si CRM","Trattative in corso":"Negocieri in curs","Intermediazioni":"Intermedieri","Offerte":"Oferte","Ordini":"Comenzi","Prodotti e Articoli":"Produse si articole","Conferme prezzi fornitori":"Confirmari pret furnizori","Stampe":"Printare","Impostazioni":"Setari","Salva":"Salveaza","Salva impostazioni":"Salveaza setarile","Modifica":"Modifica","Elimina":"Sterge","Stampa":"Printeaza","Interna":"Interna","Cliente":"Client","Fornitore":"Furnizor","Agente":"Agent","Azioni":"Actiuni","Data":"Data","Cliente target":"Client tinta","Prodotto":"Produs","Prezzo":"Pret","Prezzo attuale":"Pret actual","Obiettivo di prezzo / Prezzo desiderato":"Pret tinta","Targeted price / Prezzo desiderato":"Pret tinta","Prezzo desiderato":"Pret tinta","Valore":"Valoare","Stato":"Stare","Priorita":"Prioritate","Pagamento":"Plata","Condizioni":"Conditii","Note interne":"Note interne","Lingua gestionale":"Limba aplicatie","Lingua stampa":"Limba printare","Scarica posta":"Descarca email","Mail ricevute nel gestionale":"Emailuri primite in CRM","Database trasporti":"Baza date transport","Comparatore mercato trasporti":"Comparator piata transport","Prezzi mercato internazionale":"Preturi piata internationala","Backup":"Backup","Esporta backup":"Export backup","Importa backup":"Import backup","Reset dati":"Reset date"
    },
    AR:{
      "Dashboard":"لوحة التحكم","Andamenti di mercato":"اتجاهات السوق","Assistente Carlo":"مساعد كارلو","Comunicazioni / CRM":"الاتصالات / CRM","Comunicazioni e CRM":"الاتصالات و CRM","Trattative in corso":"المفاوضات الجارية","Intermediazioni":"الوساطة","Offerte":"العروض","Ordini":"الطلبات","Prodotti e Articoli":"المنتجات والمواد","Conferme prezzi fornitori":"تأكيد أسعار الموردين","Stampe":"الطباعة","Impostazioni":"الإعدادات","Salva":"حفظ","Salva impostazioni":"حفظ الإعدادات","Modifica":"تعديل","Elimina":"حذف","Stampa":"طباعة","Interna":"داخلي","Cliente":"عميل","Fornitore":"مورد","Agente":"وكيل","Azioni":"إجراءات","Data":"التاريخ","Cliente target":"العميل المستهدف","Prodotto":"المنتج","Prezzo":"السعر","Prezzo attuale":"السعر الحالي","Obiettivo di prezzo / Prezzo desiderato":"السعر المستهدف","Targeted price / Prezzo desiderato":"السعر المستهدف","Prezzo desiderato":"السعر المستهدف","Valore":"القيمة","Stato":"الحالة","Priorita":"الأولوية","Pagamento":"الدفع","Condizioni":"الشروط","Note interne":"ملاحظات داخلية","Lingua gestionale":"لغة النظام","Lingua stampa":"لغة الطباعة","Scarica posta":"تنزيل البريد","Mail ricevute nel gestionale":"البريد المستلم في CRM","Database trasporti":"قاعدة بيانات النقل","Comparatore mercato trasporti":"مقارن سوق النقل","Prezzi mercato internazionale":"أسعار السوق الدولية","Backup":"نسخة احتياطية","Esporta backup":"تصدير النسخة","Importa backup":"استيراد النسخة","Reset dati":"إعادة ضبط البيانات"
    }
  };

  const MOJIBAKE = [
    [/ÃƒÂ /g,"a"],[/ÃƒÂ¨/g,"e"],[/ÃƒÂ©/g,"e"],[/ÃƒÂ¬/g,"i"],[/ÃƒÂ²/g,"o"],[/ÃƒÂ¹/g,"u"],
    [/Ãƒâ‚¬/g,"A"],[/ÃƒË†/g,"E"],[/ÃƒÂ®/g,"i"],[/Ã„Æ’/g,"a"],[/Ãˆâ€º/g,"t"],[/Ãˆâ„¢/g,"s"],
    [/Ã‚Â·/g,"-"],[/Ã¢â€ â€™/g,"->"],[/Ãƒâ€”/g,"X"],[/Â·/g,"-"]
  ];

  const MARKET_DEFAULTS = [
    {id:"TMI-001", lane:"Italia Nord -> Romania", mode:"Strada", market:"UE Est", price:2100, currency:"EUR", unit:"camion", source:"benchmark operativo", date:"2026-07-19"},
    {id:"TMI-002", lane:"Germania -> Romania", mode:"Strada", market:"UE Centrale", price:1850, currency:"EUR", unit:"camion", source:"benchmark operativo", date:"2026-07-19"},
    {id:"TMI-003", lane:"Polonia -> Romania", mode:"Strada", market:"UE Est", price:1450, currency:"EUR", unit:"camion", source:"benchmark operativo", date:"2026-07-19"},
    {id:"TMI-004", lane:"Italia -> GCC", mode:"Mare", market:"Extra UE", price:3900, currency:"EUR", unit:"container", source:"benchmark operativo", date:"2026-07-19"}
  ];

  function st(){ window.state = window.state || {}; state.settings = state.settings || {}; return state; }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function saveLocal(){ try { if (typeof save === "function") return save(); if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st())); } catch(e) { console.warn(e); } }
  function repairText(value){ let out = String(value == null ? "" : value); MOJIBAKE.forEach(pair => { out = out.replace(pair[0], pair[1]); }); return out; }
  function lang(){ const s = st().settings; return LANGS.includes(s.appLanguage) ? s.appLanguage : "IT"; }
  function printLang(){ const s = st().settings; return LANGS.includes(s.printLanguage) ? s.printLanguage : lang(); }
  function canonicalText(value){
    const clean = repairText(String(value == null ? "" : value).trim()).replace(/\s+/g," ");
    if (!clean) return clean;
    if (TR.EN[clean] || TR.RO[clean] || TR.AR[clean]) return clean;
    for (const dict of Object.values(TR)) {
      const found = Object.entries(dict).find(entry => entry[1] === clean);
      if (found) return found[0];
    }
    return clean;
  }
  function t(value, selected){
    const clean = canonicalText(value);
    const code = selected || lang();
    if (code === "IT") return clean;
    const dict = TR[code] || {};
    return dict[clean] || clean;
  }

  function ensureDefaults(){
    const s = st().settings;
    if (!s.pms134ThemeApplied) {
      s.pms129ThemeName = DEFAULT_THEME.name;
      s.pms129Primary = DEFAULT_THEME.primary;
      s.pms129Secondary = DEFAULT_THEME.secondary;
      s.primaryColor = DEFAULT_THEME.primary;
      s.secondaryColor = DEFAULT_THEME.secondary;
      s.pms134ThemeApplied = "1";
    }
    s.appLanguage = LANGS.includes(s.appLanguage) ? s.appLanguage : "IT";
    s.printLanguage = LANGS.includes(s.printLanguage) ? s.printLanguage : s.appLanguage;
    state.transportMarketBenchmarks = arr(state.transportMarketBenchmarks);
    if (!state.transportMarketBenchmarks.length) state.transportMarketBenchmarks = MARKET_DEFAULTS.slice();
  }

  function ensureDealTargetPrice(){
    if (typeof schemas === "undefined") return;
    schemas[DEALS_MODULE] = schemas[DEALS_MODULE] || {title:"Intermediazioni", fields:[]};
    const fields = arr(schemas[DEALS_MODULE].fields);
    function upsert(key, def, afterKey){
      let field = fields.find(item => item.key === key);
      if (field) Object.assign(field, def, {key});
      else {
        field = Object.assign({key}, def);
        const idx = fields.findIndex(item => item.key === afterKey);
        fields.splice(idx >= 0 ? idx + 1 : fields.length, 0, field);
      }
    }
    upsert("currentPrice", {label:"Prezzo attuale", type:"number", step:"0.01"}, "value");
    upsert("targetPrice", {label:"Targeted price / Prezzo desiderato", type:"number", step:"0.01"}, "currentPrice");
    schemas[DEALS_MODULE].fields = fields;
  }

  function injectTargetFieldInOpenModal(){
    const form = document.getElementById("pms85-inter-form");
    if (!form || form.elements.targetPrice) return;
    const holder = document.createElement("div");
    holder.className = "form-field pms134-target-price-field";
    holder.innerHTML = '<label>Targeted price / Prezzo desiderato</label><input name="targetPrice" type="number" step="0.01">';
    const current = form.elements.currentPrice && form.elements.currentPrice.closest(".form-field");
    const value = form.elements.value && form.elements.value.closest(".form-field");
    (current || value || form.querySelector(".pms85-section-title:last-of-type"))?.insertAdjacentElement("afterend", holder);
  }

  function injectCss(){
    let style = document.getElementById("pms-v134-style");
    if (!style) { style = document.createElement("style"); style.id = "pms-v134-style"; document.head.appendChild(style); }
    style.textContent = `
      :root{--primary:#26394d!important;--primary-dark:#1d2b3b!important;--secondary:#6f7f8f!important;--theme-primary:#26394d!important;--theme-primary-dark:#1d2b3b!important;--theme-primary-deep:#172231!important;--theme-secondary:#6f7f8f!important;--theme-bg:#f5f7f9!important;--theme-soft:#f2f5f7!important;--theme-soft-2:#e9eef2!important;--theme-line:#d8e0e7!important;--theme-line-strong:#bcc8d3!important;--theme-shadow:rgba(20,34,48,.09)!important}
      body{font-family:Arial,Helvetica,sans-serif!important;font-size:13px!important;text-transform:uppercase;letter-spacing:0!important;background:#f5f7f9!important}
      body.pms134-rtl{direction:rtl;text-align:right;text-transform:none}
      body input,body textarea,body select,body option{font-family:Arial,Helvetica,sans-serif!important;font-size:12px!important;letter-spacing:0!important;text-transform:uppercase}
      body.pms134-rtl input,body.pms134-rtl textarea,body.pms134-rtl select,body.pms134-rtl option{text-transform:none}
      body .sidebar,body.pms108-bottom-menu .sidebar{background:#24384d!important;border-color:#d8e0e7!important;box-shadow:0 10px 24px rgba(20,34,48,.14)!important}
      body.pms108-bottom-menu .sidebar{min-height:106px!important;padding:10px 14px!important;border-radius:10px!important}
      body.pms108-bottom-menu .app{padding-bottom:124px!important}
      body.pms108-bottom-menu .pms106-hub{width:70px!important;height:70px!important}
      body.pms108-bottom-menu .pms106-globe{width:66px!important;height:66px!important;box-shadow:0 0 0 1px rgba(255,255,255,.28),inset -10px -12px 20px rgba(2,6,23,.34)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(1){transform:rotate(18deg) translateX(35px)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(2){transform:rotate(92deg) translateX(34px)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(3){transform:rotate(176deg) translateX(35px)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(4){transform:rotate(264deg) translateX(33px)!important}
      body.pms113-left-globe .pms109-world{width:76px!important;height:76px!important;margin:0 auto 8px!important;box-shadow:0 0 0 1px rgba(255,255,255,.28),inset -10px -12px 20px rgba(2,6,23,.32)!important}
      body.pms113-left-globe .pms113-led-sign{font-size:10px!important;letter-spacing:0!important;padding:4px 7px!important;background:rgba(255,255,255,.08)!important;box-shadow:none!important}
      body.pms108-bottom-menu #nav{gap:6px!important;max-height:88px!important;padding:2px 4px 6px!important}
      body.pms108-bottom-menu .nav-button{flex:0 0 126px!important;width:126px!important;min-height:62px!important;max-height:66px!important;border-radius:8px!important;font-size:10.5px!important;line-height:1.12!important;padding:7px 8px!important}
      body.pms108-bottom-menu .nav-button::before{min-width:34px!important;height:18px!important;font-size:9px!important;border-radius:5px!important}
      body .primary-button,body button.primary-button{background:#26394d!important;border-color:#26394d!important;color:#fff!important}
      body .secondary-button,body .import-label,body .inline-button,body .folder-tab,body [class*="-tab"]{background:#f3f6f8!important;border-color:#cbd5df!important;color:#26394d!important;border-radius:6px!important}
      body .secondary-button:hover,body .inline-button:hover,body .folder-tab.active,body [class*="-tab"].active{background:#e5ebf0!important;border-color:#aebdca!important;color:#1d2b3b!important}
      body .card,body .table-wrap,body [class*="-panel"],body [class*="-hero"],body .database-note,body .preview-box{border-radius:8px!important;box-shadow:0 4px 14px rgba(20,34,48,.07)!important;border-color:#d8e0e7!important}
      body [class*="-hero"],body .section-header,body [class*="-summary"],body [class*="-band"]{background:#f7f9fb!important;border-left:3px solid #6f7f8f!important;color:#182536!important}
      body th,body .table-wrap th,body [class*="-table"] th{background:#eef2f5!important;color:#26394d!important}
      body tr:hover td{background:#f6f8fa!important}
      .pms134-langbar{display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap}
      .pms134-langbar label{display:inline-flex;gap:5px;align-items:center;margin:0;color:#526172;font-size:10px;font-weight:800}
      .pms134-langbar select{height:32px!important;min-width:74px!important;width:auto!important;padding:4px 7px!important}
      .pms134-pantone-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:10px}
      .pms134-pantone{display:flex;align-items:center;gap:8px;border:1px solid #d8e0e7;border-radius:7px;padding:8px;background:#fff}
      .pms134-chip{width:34px;height:24px;border:1px solid rgba(0,0,0,.12);border-radius:4px;flex:0 0 auto}
      .pms134-transport-compare{margin:12px 0;border:1px solid #d8e0e7;border-radius:8px;background:#fff;padding:12px}
      .pms134-transport-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
      .pms134-transport-form{display:grid;grid-template-columns:1.4fr .8fr .8fr .7fr .8fr 1fr auto;gap:8px;align-items:end}
      .pms134-transport-form label{display:grid;gap:4px;font-size:10.5px;font-weight:800;color:#526172}
      .pms134-transport-form button{width:auto!important;margin:0!important}
      .pms134-mail-status{margin-top:8px;border:1px solid #d8e0e7;background:#f7f9fb;color:#26394d;border-radius:7px;padding:8px;font-weight:800}
      .pms134-target-price-field label{color:#26394d!important}
      #print-root .print-document{font-family:Arial,Helvetica,sans-serif!important;text-transform:uppercase!important;color:#111827!important}
      #print-root .print-header{border-bottom:1.2pt solid #7a8794!important}
      #print-root .print-header h1{color:#26394d!important;font-size:16pt!important;letter-spacing:0!important}
      #print-root .print-table th,#print-root th{background:#f1f4f6!important;color:#26394d!important;border-color:#cbd5df!important}
      #print-root .print-table td,#print-root td{border-color:#d6dee6!important}
      #print-root .print-footer{border-color:#cbd5df!important;color:#526172!important}
      @media(max-width:900px){.pms134-transport-form{grid-template-columns:1fr 1fr}.pms134-transport-form button{grid-column:1/-1}}
      @media print{body{text-transform:uppercase!important}#print-root .print-document{font-size:8.8pt!important;line-height:1.28!important}#print-root .print-table th,#print-root .print-table td{font-size:8pt!important;padding:1.8mm!important}}
    `;
  }

  function options(selected){ return LANGS.map(code => '<option value="' + code + '"' + (code === selected ? " selected" : "") + ">" + LANG_NAMES[code] + "</option>").join(""); }

  function injectLanguageControls(){
    const actions = document.querySelector(".topbar-actions");
    if (!actions || document.getElementById("pms134-langbar")) return;
    const wrap = document.createElement("div");
    wrap.id = "pms134-langbar";
    wrap.className = "pms134-langbar";
    wrap.innerHTML = '<label><span data-pms134-i18n="Lingua gestionale">Lingua gestionale</span><select id="pms134-app-lang">' + options(lang()) + '</select></label><label><span data-pms134-i18n="Lingua stampa">Lingua stampa</span><select id="pms134-print-lang">' + options(printLang()) + '</select></label>';
    actions.insertBefore(wrap, actions.firstChild);
    wrap.querySelector("#pms134-app-lang").onchange = e => { st().settings.appLanguage = e.target.value; st().settings.printLanguage = st().settings.printLanguage || e.target.value; saveLocal(); localizePage(); };
    wrap.querySelector("#pms134-print-lang").onchange = e => { st().settings.printLanguage = e.target.value; saveLocal(); localizePage(); };
  }

  function localizeElementText(root, selected){
    const doc = root.ownerDocument || document;
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if (!parent || ["SCRIPT","STYLE","TEXTAREA","INPUT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const original = node.nodeValue;
      const repaired = repairText(original);
      const translated = t(repaired, selected);
      if (translated !== original.trim() || repaired !== original) node.nodeValue = original.replace(original.trim(), translated);
    });
    root.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el => { el.placeholder = t(el.placeholder, selected); });
  }

  function localizePage(){
    const selected = lang();
    document.body.classList.toggle("pms134-rtl", selected === "AR");
    document.documentElement.dir = selected === "AR" ? "rtl" : "ltr";
    injectLanguageControls();
    document.querySelectorAll("[data-pms134-i18n]").forEach(el => { el.textContent = t(el.dataset.pms134I18n, selected); });
    ["#nav",".topbar","#content",".modal"].forEach(sel => { document.querySelectorAll(sel).forEach(el => localizeElementText(el, selected)); });
  }

  function translatePrintHtml(html, selected){
    selected = selected || printLang();
    const parser = new DOMParser();
    const doc = parser.parseFromString('<div id="pms134-print-wrap">' + String(html || "") + '</div>', "text/html");
    const wrap = doc.getElementById("pms134-print-wrap");
    if (!wrap) return html;
    localizeElementText(wrap, selected);
    wrap.querySelectorAll(".print-document").forEach(el => {
      el.setAttribute("lang", selected.toLowerCase());
      if (selected === "AR") { el.setAttribute("dir","rtl"); el.style.textAlign = "right"; el.style.textTransform = "none"; }
    });
    return wrap.innerHTML;
  }

  function wrapOpenPrint(){
    if (typeof openPrint !== "function" || openPrint.__pms134Wrapped) return;
    const base = openPrint;
    openPrint = function(innerHtml){ return base.call(this, translatePrintHtml(innerHtml, printLang())); };
    openPrint.__pms134Wrapped = true;
  }

  function enhanceSettingsPanel(){
    if (!document.getElementById("settings-form") || document.getElementById("pms134-language-settings")) return;
    const form = document.getElementById("settings-form");
    const panel = document.createElement("div");
    panel.id = "pms134-language-settings";
    panel.className = "card";
    panel.innerHTML = '<h3>Lingue e stile documenti</h3><div class="settings-grid"><div><label>Lingua gestionale</label><select name="appLanguage">' + options(lang()) + '</select></div><div><label>Lingua stampa predefinita</label><select name="printLanguage">' + options(printLang()) + '</select></div></div><div class="pms134-pantone-grid"><div class="pms134-pantone"><span class="pms134-chip" style="background:#26394d"></span><span><strong>Pantone simile 7546 C</strong><small>Blu grafite elegante</small></span></div><div class="pms134-pantone"><span class="pms134-chip" style="background:#6f7f8f"></span><span><strong>Pantone simile 5415 C</strong><small>Grigio blu secondario</small></span></div><div class="pms134-pantone"><span class="pms134-chip" style="background:#f1f4f6"></span><span><strong>Pantone simile Cool Gray 1 C</strong><small>Fondo stampa leggero</small></span></div></div>';
    form.insertAdjacentElement("beforebegin", panel);
    panel.querySelector('[name="appLanguage"]').onchange = event => {
      st().settings.appLanguage = event.target.value;
      document.getElementById("pms134-app-lang") && (document.getElementById("pms134-app-lang").value = event.target.value);
      saveLocal();
      localizePage();
    };
    panel.querySelector('[name="printLanguage"]').onchange = event => {
      st().settings.printLanguage = event.target.value;
      document.getElementById("pms134-print-lang") && (document.getElementById("pms134-print-lang").value = event.target.value);
      saveLocal();
      localizePage();
    };
  }

  function enhanceCrmMail(){
    if (!window.current || current.page !== "communications") return;
    const panel = document.querySelector(".pms128-panel");
    if (!panel || document.getElementById("pms134-mail-help")) return;
    const box = document.createElement("div");
    box.id = "pms134-mail-help";
    box.className = "pms134-mail-status";
    const desktop = !!(window.parmitaliaMail && typeof window.parmitaliaMail.fetchInbox === "function");
    box.textContent = desktop ? "Posta reale attiva nell'app desktop: salva account IMAP e premi Scarica posta. Le email entrano nella tabella CRM sotto." : "Per ricevere email reali devi aprire l'app desktop installata: nel browser semplice il collegamento IMAP non e disponibile.";
    panel.appendChild(box);
    if (desktop && st().mailAccount && st().mailAccount.password && !st().settings.pms134MailAutoTried) {
      st().settings.pms134MailAutoTried = today();
      setTimeout(() => document.querySelector("[data-pms128-fetch-mail]")?.click(), 350);
    }
  }

  function transportRows(){
    ensureDefaults();
    const benchmarks = arr(st().transportMarketBenchmarks);
    const prices = arr(st().transportPrices);
    const all = benchmarks.concat(prices.map(item => ({id:item.id || "TRP",lane:item.route || item.lane || "-",mode:item.mode || "-",market:item.market || "Database interno",price:item.price,currency:item.currency || "EUR",unit:item.unit || "viaggio",source:item.source || "interno",date:item.date || ""})));
    const eur = all.filter(item => String(item.currency || "EUR").toUpperCase() === "EUR" && num(item.price) > 0);
    const min = eur.length ? Math.min.apply(null, eur.map(item => num(item.price))) : 0;
    const max = eur.length ? Math.max.apply(null, eur.map(item => num(item.price))) : 0;
    const avg = eur.length ? eur.reduce((sum,item) => sum + num(item.price), 0) / eur.length : 0;
    const rows = all.map(item => '<tr><td>' + esc(item.lane) + '</td><td>' + esc(item.mode) + '</td><td>' + esc(item.market) + '</td><td><strong>' + esc(money(item.price,item.currency)) + '</strong><br><small>' + esc(item.unit) + '</small></td><td>' + esc(item.source) + '</td><td>' + esc(item.date || "-") + '</td></tr>').join("");
    return {rows, min, max, avg, count:all.length};
  }

  function enhanceTransport(){
    if (!window.current || current.page !== "transportPrices") return;
    const page = document.querySelector("#content .pms129-page");
    if (!page || document.getElementById("pms134-transport-compare")) return;
    const data = transportRows();
    const panel = document.createElement("div");
    panel.id = "pms134-transport-compare";
    panel.className = "pms134-transport-compare";
    panel.innerHTML = '<div class="pms134-transport-head"><div><h3>Comparatore mercato trasporti</h3><small>Prezzi di mercato internazionale affiancati al database interno e allo storico trasporti.</small></div><div><strong>Min</strong> ' + esc(money(data.min,"EUR")) + ' &nbsp; <strong>Media</strong> ' + esc(money(data.avg,"EUR")) + ' &nbsp; <strong>Max</strong> ' + esc(money(data.max,"EUR")) + '</div></div><div class="pms134-transport-form"><label>Rotta<input id="pms134-tr-lane" placeholder="Italia -> Romania"></label><label>Modo<select id="pms134-tr-mode"><option>Strada</option><option>Mare</option><option>Aereo</option><option>Intermodale</option></select></label><label>Mercato<input id="pms134-tr-market" placeholder="UE / Extra UE"></label><label>Prezzo<input id="pms134-tr-price" type="number" step="0.01"></label><label>Unita<input id="pms134-tr-unit" placeholder="camion"></label><label>Fonte<input id="pms134-tr-source" placeholder="borsa, broker, vettore"></label><button class="secondary-button" data-pms134-save-transport-market>Salva benchmark</button></div><div class="table-wrap" style="margin-top:10px"><table><thead><tr><th>Rotta</th><th>Modo</th><th>Mercato</th><th>Prezzo</th><th>Fonte</th><th>Data</th></tr></thead><tbody>' + (data.rows || '<tr><td colspan="6" class="empty">Nessun prezzo mercato.</td></tr>') + '</tbody></table></div>';
    const hero = page.querySelector(".pms129-hero");
    if (hero) hero.insertAdjacentElement("afterend", panel);
    else page.insertAdjacentElement("afterbegin", panel);
  }

  function saveTransportBenchmark(){
    const lane = document.getElementById("pms134-tr-lane")?.value || "";
    if (!lane.trim()) return alert("Inserisci la rotta.");
    const record = {id:"TMI-" + Date.now(), lane, mode:document.getElementById("pms134-tr-mode")?.value || "Strada", market:document.getElementById("pms134-tr-market")?.value || "Mercato internazionale", price:document.getElementById("pms134-tr-price")?.value || 0, currency:"EUR", unit:document.getElementById("pms134-tr-unit")?.value || "viaggio", source:document.getElementById("pms134-tr-source")?.value || "manuale", date:today()};
    st().transportMarketBenchmarks.unshift(record);
    saveLocal();
    render();
  }

  function bindBackupAliases(){
    const exp = document.getElementById("export-json");
    const imp = document.getElementById("import-json");
    const label = document.querySelector(".import-label");
    const reset = document.getElementById("reset-data");
    if (exp && typeof window.pmsV131BackupButtonsFix?.exportBackup === "function") exp.onclick = window.pmsV131BackupButtonsFix.exportBackup;
    if (imp && typeof window.pmsV131BackupButtonsFix?.importBackup === "function") imp.onchange = e => { const file = e.target.files && e.target.files[0]; window.pmsV131BackupButtonsFix.importBackup(file); e.target.value = ""; };
    if (label && imp) label.onclick = event => { if (event.target !== imp) { event.preventDefault(); imp.click(); } };
    if (reset && typeof resetData === "function") reset.onclick = resetData;
  }

  function bindActions(){
    document.querySelectorAll("[data-pms134-save-transport-market]").forEach(btn => btn.onclick = saveTransportBenchmark);
    bindBackupAliases();
    injectTargetFieldInOpenModal();
    enhanceSettingsPanel();
    enhanceCrmMail();
    enhanceTransport();
    localizePage();
  }

  function wrapRender(){
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !baseRender.__pms134Wrapped) {
      render = function(){
        ensureDefaults();
        ensureDealTargetPrice();
        injectCss();
        wrapOpenPrint();
        const result = baseRender.apply(this, arguments);
        setTimeout(bindActions, 20);
        setTimeout(bindActions, 160);
        return result;
      };
      render.__pms134Wrapped = true;
    }
    const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
    if (baseBind && !baseBind.__pms134Wrapped) {
      bindPageActions = function(){
        const result = baseBind.apply(this, arguments);
        setTimeout(bindActions, 20);
        return result;
      };
      bindPageActions.__pms134Wrapped = true;
    }
    const baseSettings = typeof saveSettings === "function" ? saveSettings : null;
    if (baseSettings && !baseSettings.__pms134Wrapped) {
      saveSettings = function(){
        const result = baseSettings.apply(this, arguments);
        const form = document.getElementById("settings-form");
        if (form) {
          const data = new FormData(form);
          st().settings.appLanguage = data.get("appLanguage") || st().settings.appLanguage || "IT";
          st().settings.printLanguage = data.get("printLanguage") || st().settings.printLanguage || st().settings.appLanguage;
          saveLocal();
        }
        setTimeout(bindActions, 80);
        return result;
      };
      saveSettings.__pms134Wrapped = true;
    }
  }

  document.addEventListener("click", event => {
    if (event.target.closest("[data-pms85-new-inter],[data-pms85-edit-inter],[data-pms85-open-selected-deal]")) {
      ensureDealTargetPrice();
      setTimeout(injectTargetFieldInOpenModal, 260);
    }
  }, true);

  ensureDefaults();
  ensureDealTargetPrice();
  injectCss();
  wrapOpenPrint();
  wrapRender();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bindActions);
  else bindActions();
  setTimeout(bindActions, 250);
  setTimeout(bindActions, 900);
  window.pmsV134ElegantPrintLanguageCrmTransport = {version:VERSION, refresh:bindActions, translatePrintHtml};
})();
