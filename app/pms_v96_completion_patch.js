(function(){
  "use strict";
  const VERSION = "PMS-V96-COMPLETION-PATCH";

  const I18N = {
    IT:{print:"Stampa / PDF",close:"Chiudi",preview:"Anteprima stampa",addLine:"+ Aggiungi articolo",remove:"Elimina",items:"Articoli",qty:"Quantita",unit:"Unita",price:"Prezzo",currency:"Valuta",total:"Totale",product:"Prodotto",description:"Descrizione",code:"Codice",supplierPrices:"Conferma prezzi fornitore",notBlocking:"Modulo fluido: puoi salvare anche se mancano dati non essenziali.",newModules:"Completamenti"},
    EN:{print:"Print / PDF",close:"Close",preview:"Print preview",addLine:"+ Add item",remove:"Delete",items:"Items",qty:"Quantity",unit:"Unit",price:"Price",currency:"Currency",total:"Total",product:"Product",description:"Description",code:"Code",supplierPrices:"Supplier price confirmation",notBlocking:"Fluid form: you can save even if non-essential data is missing.",newModules:"Completion"},
    RO:{print:"Printare / PDF",close:"Inchide",preview:"Previzualizare print",addLine:"+ Adauga articol",remove:"Sterge",items:"Articole",qty:"Cantitate",unit:"Unitate",price:"Pret",currency:"Valuta",total:"Total",product:"Produs",description:"Descriere",code:"Cod",supplierPrices:"Confirmare pret furnizor",notBlocking:"Formular flexibil: poti salva chiar daca lipsesc date neesentiale.",newModules:"Completari"},
    AR:{print:"طباعة / PDF",close:"إغلاق",preview:"معاينة الطباعة",addLine:"+ إضافة صنف",remove:"حذف",items:"الأصناف",qty:"الكمية",unit:"الوحدة",price:"السعر",currency:"العملة",total:"الإجمالي",product:"المنتج",description:"الوصف",code:"الكود",supplierPrices:"تأكيد سعر المورد",notBlocking:"نموذج مرن: يمكن الحفظ حتى عند غياب بيانات غير أساسية.",newModules:"إكمالات"}
  };
  const labels = {
    transportPrices:{code:"TRP",label:"Trasporti"},
    legalProtocols:{code:"LEG",label:"Protocolli legali"},
    cryptoMonitor:{code:"CRY",label:"Crypto monitor"},
    commercialBrokerage:{code:"BRK",label:"Brokeraggio commerciale"},
    supplierGeoGroupage:{code:"GEO",label:"Geo fornitore"},
    marketTrends:{code:"MKT",label:"Andamenti di mercato"}
  };
  const printableReplacements = {
    EN:{"Cliente":"Client","Fornitore":"Supplier","Prodotto":"Product","Quantita":"Quantity","Quantità":"Quantity","Pagamento":"Payment","Consegna":"Delivery","Note":"Notes","Protocollo":"Protocol","Data":"Date","Prezzo":"Price","Totale":"Total","Valuta":"Currency","Firma":"Signature","Documento":"Document"},
    RO:{"Cliente":"Client","Fornitore":"Furnizor","Prodotto":"Produs","Quantita":"Cantitate","Quantità":"Cantitate","Pagamento":"Plata","Consegna":"Livrare","Note":"Note","Protocollo":"Protocol","Data":"Data","Prezzo":"Pret","Totale":"Total","Valuta":"Valuta","Firma":"Semnatura","Documento":"Document"},
    AR:{"Cliente":"العميل","Fornitore":"المورد","Prodotto":"المنتج","Quantita":"الكمية","Quantità":"الكمية","Pagamento":"الدفع","Consegna":"التسليم","Note":"ملاحظات","Protocollo":"البروتوكول","Data":"التاريخ","Prezzo":"السعر","Totale":"الإجمالي","Valuta":"العملة","Firma":"التوقيع","Documento":"المستند"}
  };
  function lang(){ return String((window.state && state.settings && state.settings.defaultLanguage) || "IT").toUpperCase(); }
  function t(k){ return (I18N[lang()] || I18N.IT)[k] || I18N.IT[k] || k; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e) { console.warn(e); return false; } }
  function css(){
    if (document.getElementById("pms-v96-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v96-style";
    s.textContent = ".pms96-nav-group{display:grid;gap:4px;margin:0 0 13px}.pms96-lines{grid-column:1/-1;border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden}.pms96-lines-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;background:#f8fafc;border-bottom:1px solid var(--line)}.pms96-lines-head strong{display:block}.pms96-lines-head small{display:block;color:var(--muted);font-size:12px}.pms96-lines-head button{width:auto!important;margin:0!important}.pms96-lines table{margin:0!important;table-layout:fixed}.pms96-lines input,.pms96-lines select{min-width:0!important;width:100%!important}.pms96-line-total{font-weight:900;white-space:nowrap}.pms96-note{grid-column:1/-1;border-left:4px solid #0f766e;background:#f0fdfa;color:#134e4a;padding:10px 12px;border-radius:6px;font-size:12px}.pms96-print-modal{position:fixed;inset:0;z-index:20000;background:rgba(15,23,42,.58);display:grid;grid-template-rows:auto 1fr;padding:16px}.pms96-print-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;background:#fff;border-radius:8px 8px 0 0;padding:10px 12px;border-bottom:1px solid #cbd5e1}.pms96-print-toolbar h3{margin:0}.pms96-print-toolbar div{display:flex;gap:8px;flex-wrap:wrap}.pms96-print-toolbar button{width:auto!important;margin:0!important}.pms96-print-stage{overflow:auto;background:#e2e8f0;border-radius:0 0 8px 8px;padding:18px}.pms96-print-sheet{width:210mm;min-height:297mm;margin:0 auto;background:#fff;box-shadow:0 12px 34px rgba(15,23,42,.22);padding:11mm;box-sizing:border-box}.pms96-print-sheet .print-document{min-height:auto!important;margin:0!important;padding:0!important;box-shadow:none!important}.pms96-ai-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.pms96-ai-tools button{width:auto!important;margin:0!important}@media(max-width:900px){.pms96-print-sheet{width:100%;min-height:0;padding:12px}.pms96-print-modal{padding:8px}.pms96-lines table{min-width:760px}}@media print{.pms96-print-modal,.pms96-print-toolbar,.pms96-print-stage{display:none!important}#print-root .print-document{page-break-after:avoid!important;break-after:avoid!important}}";
    document.head.appendChild(s);
  }
  function ensureModules(){
    if (typeof modules === "undefined") return;
    [
      {id:"transportPrices",label:"Trasporti",subtitle:"Database prezzi trasporto e rotte",roles:["admin","assistant","accountant"]},
      {id:"legalProtocols",label:"Protocolli legali",subtitle:"Testi liberi protocollati",roles:["admin","assistant","accountant"]},
      {id:"cryptoMonitor",label:"Crypto monitor",subtitle:"Registro manuale, senza trading automatico",roles:["admin"]}
    ].forEach(m => { if (!modules.some(x => x.id === m.id)) modules.push(m); });
  }
  function addMissingNav(){
    const nav = document.getElementById("nav");
    if (!nav || !window.current) return;
    const role = current.role || "admin";
    const ids = ["transportPrices","legalProtocols","cryptoMonitor"];
    const visible = ids.filter(id => {
      const mod = modules.find(m => m.id === id);
      return mod && arr(mod.roles).includes(role) && !nav.querySelector('[data-page="' + id + '"]');
    });
    if (!visible.length) return;
    let group = document.getElementById("pms96-nav-group");
    if (!group) {
      group = document.createElement("div");
      group.id = "pms96-nav-group";
      group.className = "nav-group pms96-nav-group";
      group.innerHTML = '<div class="nav-group-title">' + esc(t("newModules")) + '</div>';
      nav.appendChild(group);
    }
    visible.forEach(id => {
      const info = labels[id] || {code:"MOD",label:id};
      const button = document.createElement("button");
      button.className = "nav-button compact" + (current.page === id ? " active" : "");
      button.dataset.page = id;
      button.innerHTML = '<span class="pms52-nav-code">' + esc(info.code) + '</span><span class="pms52-nav-label">' + esc(info.label) + '</span>';
      button.onclick = () => setPage(id);
      group.appendChild(button);
    });
  }
  function addSupplierNotice(){
    const form = document.getElementById("modal-form");
    if (!form || form.dataset.pms96SupplierDone === "1") return;
    if (!form.elements.supplierPriceListItemsJson && !form.elements.price && !form.elements.supplier) return;
    const title = document.querySelector(".modal-header h3,.pms84-modal-head h3")?.textContent || "";
    if (!/prezz|fornitor|listin/i.test(title) && !form.elements.supplierPriceListItemsJson) return;
    form.dataset.pms96SupplierDone = "1";
    Array.from(form.elements).forEach(el => {
      if (el.required && !["supplier","product"].includes(el.name)) el.required = false;
    });
    const note = document.createElement("div");
    note.className = "pms96-note";
    note.textContent = t("notBlocking");
    const target = form.querySelector(".form-grid,.pms84-form") || form;
    target.insertAdjacentElement("afterbegin", note);
  }
  function readInitialLines(form){
    const raw = form.elements.multiArticleItemsJson?.value || form.elements.orderLineItemsJson?.value || form.elements.dealLineItemsJson?.value;
    if (raw) {
      try { const parsed = JSON.parse(raw); if (Array.isArray(parsed) && parsed.length) return parsed; } catch(e) {}
    }
    return [{articleCode:form.elements.articleCode?.value || "",product:form.elements.product?.value || "",description:form.elements.description?.value || "",quantity:form.elements.quantity?.value || "1",unit:form.elements.unit?.value || "kg",unitPrice:form.elements.unitPrice?.value || form.elements.price?.value || "",currency:form.elements.currency?.value || "EUR"}];
  }
  function lineHtml(line,index){
    return '<tr data-pms96-line="' + index + '"><td><input data-pms96-field="articleCode" value="' + esc(line.articleCode || "") + '"></td><td><input data-pms96-field="product" value="' + esc(line.product || "") + '"></td><td><input data-pms96-field="description" value="' + esc(line.description || "") + '"></td><td><input type="number" step="0.001" data-pms96-field="quantity" value="' + esc(line.quantity || "1") + '"></td><td><input data-pms96-field="unit" value="' + esc(line.unit || "kg") + '"></td><td><input type="number" step="0.0001" data-pms96-field="unitPrice" value="' + esc(line.unitPrice || line.price || "") + '"></td><td><input data-pms96-field="currency" value="' + esc(line.currency || "EUR") + '"></td><td><span class="pms96-line-total"></span></td><td><button type="button" class="inline-danger" data-pms96-remove-line>' + esc(t("remove")) + '</button></td></tr>';
  }
  function syncLines(form){
    const widget = form.querySelector(".pms96-lines");
    if (!widget) return [];
    const lines = Array.from(widget.querySelectorAll("[data-pms96-line]")).map(row => {
      const line = {};
      row.querySelectorAll("[data-pms96-field]").forEach(input => line[input.dataset.pms96Field] = input.value || "");
      const total = num(line.quantity) * num(line.unitPrice);
      row.querySelector(".pms96-line-total").textContent = money(total,line.currency || "EUR");
      return line;
    }).filter(line => line.product || line.articleCode);
    const hidden = form.elements.multiArticleItemsJson || (() => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "multiArticleItemsJson";
      form.appendChild(input);
      return input;
    })();
    hidden.value = JSON.stringify(lines);
    const first = lines[0] || {};
    if (form.elements.product) form.elements.product.value = first.product || form.elements.product.value || "";
    if (form.elements.quantity) form.elements.quantity.value = lines.reduce((a,l)=>a+num(l.quantity),0) || form.elements.quantity.value || "";
    if (form.elements.unit && first.unit) form.elements.unit.value = first.unit;
    if (form.elements.currency && first.currency) form.elements.currency.value = first.currency;
    if (form.elements.unitPrice && lines.length) {
      const qty = lines.reduce((a,l)=>a+num(l.quantity),0);
      const total = lines.reduce((a,l)=>a+num(l.quantity)*num(l.unitPrice),0);
      form.elements.unitPrice.value = qty ? (total / qty).toFixed(4) : form.elements.unitPrice.value;
    }
    return lines;
  }
  function decorateMultiArticleForm(){
    const form = document.getElementById("modal-form") || document.getElementById("pms85-inter-form");
    if (!form || form.dataset.pms96Lines === "1") return;
    if (!form.elements.product && !form.elements.articleCode && !form.elements.supplierPriceListItemsJson) return;
    if (form.querySelector('[data-pms88-widget],#pms73-listino-widget')) return;
    form.dataset.pms96Lines = "1";
    const holder = document.createElement("div");
    holder.className = "pms96-lines";
    holder.innerHTML = '<div class="pms96-lines-head"><div><strong>' + esc(t("items")) + '</strong><small>Multi-articolo universale: i primi dati vengono sincronizzati nei campi classici del modulo.</small></div><button type="button" class="secondary-button" data-pms96-add-line>' + esc(t("addLine")) + '</button></div><div class="table-wrap"><table><thead><tr><th>' + esc(t("code")) + '</th><th>' + esc(t("product")) + '</th><th>' + esc(t("description")) + '</th><th>' + esc(t("qty")) + '</th><th>' + esc(t("unit")) + '</th><th>' + esc(t("price")) + '</th><th>' + esc(t("currency")) + '</th><th>' + esc(t("total")) + '</th><th></th></tr></thead><tbody></tbody></table></div>';
    const field = form.elements.product || form.elements.articleCode || form.elements.supplierPriceListItemsJson;
    const fieldWrap = field?.closest(".form-field") || form.querySelector(".form-grid,.pms84-form") || form;
    fieldWrap.insertAdjacentElement(field?.closest(".form-field") ? "beforebegin" : "afterbegin", holder);
    const tbody = holder.querySelector("tbody");
    readInitialLines(form).forEach((line,i) => tbody.insertAdjacentHTML("beforeend", lineHtml(line,i)));
    holder.querySelector("[data-pms96-add-line]").onclick = () => {
      tbody.insertAdjacentHTML("beforeend", lineHtml({quantity:"1",unit:"kg",currency:form.elements.currency?.value || "EUR"}, tbody.children.length));
      syncLines(form);
    };
    holder.addEventListener("input", () => syncLines(form));
    holder.addEventListener("click", e => {
      if (!e.target.closest("[data-pms96-remove-line]")) return;
      const rows = tbody.querySelectorAll("tr");
      if (rows.length <= 1) rows[0].querySelectorAll("input").forEach((input,i) => input.value = i === 3 ? "1" : "");
      else e.target.closest("tr").remove();
      syncLines(form);
    });
    syncLines(form);
  }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function translatePrintHtml(html){
    const l = lang();
    if (l === "IT") return html;
    const map = printableReplacements[l] || {};
    let out = String(html || "");
    Object.keys(map).forEach(k => { out = out.replace(new RegExp(k,"g"), map[k]); });
    if (l === "AR") out = out.replace(/class="print-document/g,'class="print-document pms95-ar');
    return out;
  }
  function installPrintPreview(){
    if (window.__pms96PrintPreviewInstalled) return;
    window.__pms96PrintPreviewInstalled = true;
    const original = typeof openPrint === "function" ? openPrint : null;
    window.__pms96OriginalOpenPrint = original;
    window.openPrint = function(innerHtml){
      css();
      const html = translatePrintHtml(innerHtml);
      document.getElementById("pms96-print-modal")?.remove();
      const modal = document.createElement("div");
      modal.id = "pms96-print-modal";
      modal.className = "pms96-print-modal";
      modal.innerHTML = '<div class="pms96-print-toolbar"><h3>' + esc(t("preview")) + '</h3><div><button type="button" class="primary-button" data-pms96-print-now>' + esc(t("print")) + '</button><button type="button" class="secondary-button" data-pms96-close-print>' + esc(t("close")) + '</button></div></div><div class="pms96-print-stage"><div class="pms96-print-sheet">' + html + '</div></div>';
      document.body.appendChild(modal);
      modal.querySelector("[data-pms96-close-print]").onclick = () => modal.remove();
      modal.querySelector("[data-pms96-print-now]").onclick = () => {
        let root = document.getElementById("print-root");
        if (!root) { root = document.createElement("div"); root.id = "print-root"; document.body.appendChild(root); }
        root.innerHTML = html;
        window.print();
      };
    };
  }
  function smarterLocalText(input,language,format,tone){
    const text = String(input || "").trim();
    const l = String(language || lang()).toUpperCase();
    const qty = (text.match(/(\d+[,.]?\d*)\s*(ton|kg|pallet|cartoni|box|container)/i) || [])[0] || "";
    const dest = (text.match(/\b(?:a|in|per|to)\s+([A-ZÀ-ÿ][\wÀ-ÿ -]{2,})/i) || [])[1] || "";
    const price = (text.match(/(\d+[,.]?\d*)\s*(eur|€|ron|usd)/i) || [])[0] || "";
    const facts = [qty && "quantita " + qty, dest && "destinazione " + dest, price && "prezzo " + price].filter(Boolean).join(", ");
    const base = facts ? text + "\nDati rilevati: " + facts + "." : text;
    const templates = {
      IT:"Buongiorno,\n\nabbiamo analizzato la richiesta seguente:\n" + base + "\n\nProponiamo di procedere con verifica disponibilita, conferma prezzo, tempi logistici e documenti necessari. La preghiamo di confermare quantita, destinazione finale e termine entro cui desidera ricevere conferma operativa.\n\nCordiali saluti,\nParmitalia Distribution SRL",
      EN:"Good morning,\n\nwe reviewed the following request:\n" + base + "\n\nWe suggest proceeding with availability check, price confirmation, logistics timing and required documents. Please confirm quantity, final destination and the deadline for operational confirmation.\n\nKind regards,\nParmitalia Distribution SRL",
      RO:"Buna ziua,\n\nam analizat solicitarea urmatoare:\n" + base + "\n\nPropunem sa verificam disponibilitatea, pretul, termenele logistice si documentele necesare. Va rugam sa confirmati cantitatea, destinatia finala si termenul pentru confirmarea operationala.\n\nCu stima,\nParmitalia Distribution SRL",
      AR:"صباح الخير،\n\nقمنا بمراجعة الطلب التالي:\n" + base + "\n\nنقترح متابعة التحقق من التوفر والسعر والمواعيد اللوجستية والمستندات المطلوبة. يرجى تأكيد الكمية والوجهة النهائية والموعد المطلوب للتأكيد التشغيلي.\n\nمع أطيب التحيات،\nParmitalia Distribution SRL"
    };
    if (format === "whatsapp") return templates[l] || templates.IT;
    return templates[l] || templates.IT;
  }
  function enhanceAI(){
    const root = document.getElementById("pms89-ai-studio");
    if (!root || root.dataset.pms96Ai === "1") return;
    root.dataset.pms96Ai = "1";
    const langSelect = document.getElementById("pms89-ai-language");
    if (langSelect && !Array.from(langSelect.options).some(o => o.value === "ar")) langSelect.insertAdjacentHTML("beforeend",'<option value="ar">Arabo</option>');
    const tools = document.createElement("div");
    tools.className = "pms96-ai-tools";
    tools.innerHTML = '<button type="button" class="secondary-button" data-pms96-smart-variant>Variante intelligente locale</button>';
    root.querySelector(".pms89-ai-actions")?.insertAdjacentElement("afterend", tools);
    tools.querySelector("[data-pms96-smart-variant]").onclick = () => {
      const input = document.getElementById("pms89-ai-input")?.value || "";
      if (!input.trim()) return alert("Scrivi alcune indicazioni.");
      const out = document.getElementById("pms89-ai-output");
      if (out) out.value = smarterLocalText(input, document.getElementById("pms89-ai-language")?.value || lang(), document.getElementById("pms89-ai-format")?.value, document.getElementById("pms89-ai-tone")?.value);
    };
  }
  function bind(){
    css(); ensureModules(); addMissingNav(); installPrintPreview();
    addSupplierNotice(); decorateMultiArticleForm(); enhanceAI();
    document.querySelectorAll("[data-pms96-print-now]").forEach(btn => btn.onclick = () => window.print());
  }
  const baseOpenModal = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal) openModal = function(module,id){
    const result = baseOpenModal.apply(this,arguments);
    setTimeout(() => { addSupplierNotice(); decorateMultiArticleForm(); }, 80);
    setTimeout(() => { addSupplierNotice(); decorateMultiArticleForm(); }, 260);
    return result;
  };
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender) render = function(){
    const result = baseRender.apply(this,arguments);
    setTimeout(bind,30);
    setTimeout(bind,160);
    return result;
  };
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind) bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); setTimeout(bind,80); return r; };
  const baseNav = typeof renderNav === "function" ? renderNav : null;
  if (baseNav) renderNav = function(){ ensureModules(); const r = baseNav.apply(this,arguments); addMissingNav(); return r; };
  ensureModules(); css(); installPrintPreview(); setTimeout(bind,80);
  window.pmsV96 = {version:VERSION,bind,smarterLocalText};
})();
