/* === PMS v152 - Ordini, testi, prezzi, previsioni hard cheese, no autorizzazioni admin === */
(function(){
  "use strict";
  const VERSION152 = "PMS-V152-ORDINI-TESTI-PREZZI-HARD-CHEESE";
  const ORDER = "orders";
  const PRODUCTS = "products";
  const OFFERS = "offers";
  const DEAL_MODULES = ["trattativeInCorso", "intermediations"];
  const BAD_FORECAST_RE = /(grano\s+duro|frumento\s+duro|durum\s+wheat|hard\s+wheat)/i;

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function num(value){
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value == null ? "" : value).trim().replace(/\s/g,"").replace(",","."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function hasValue(value){ return value != null && String(value).trim() !== ""; }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(value, currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function parseJsonArray(value){
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch(error) {
      return [];
    }
  }
  function firstValue(item, keys){
    for (const key of keys) if (hasValue(item && item[key])) return item[key];
    return "";
  }
  function destinationOf(order){
    return firstValue(order, ["destination","orderDestination","deliveryDestination","shipTo","unloadingPlace","deliveryPlace","destinationAddress","customerDestination","delivery"]);
  }
  function customerOrderOf(order){
    return firstValue(order, ["customerOrderNumber","clientOrderNumber","customerOrder","customerPo","customerPONumber","poNumber","clientReference","customerReference"]);
  }
  function productPrice(product){
    return firstValue(product, ["basePrice","price","unitPrice","currentPrice","targetPrice","listPrice"]);
  }
  function productCurrency(product){ return product && (product.currency || product.defaultCurrency) || "EUR"; }
  function productUnit(product){ return product && (product.unit || product.basePriceType || "unità") || "unità"; }
  function lineTotal(line){
    const price = firstValue(line, ["unitPrice","price","currentPrice","targetPrice"]);
    const qty = hasValue(line && line.quantity) ? num(line.quantity) : 1;
    return qty * num(price) * (1 - Math.max(0, Math.min(100, num(line && line.discountPct))) / 100);
  }
  function recordLines(item, jsonKey){
    const lines = parseJsonArray(item && item[jsonKey]);
    return lines.length ? lines : [];
  }
  function totalsText(lines, fallbackCurrency){
    const totals = {};
    arr(lines).forEach(function(line){
      const currency = String(line.currency || fallbackCurrency || "EUR").toUpperCase();
      totals[currency] = (totals[currency] || 0) + lineTotal(line);
    });
    const entries = Object.entries(totals);
    return entries.length ? entries.map(function(entry){ return money(entry[1], entry[0]); }).join(" | ") : "";
  }

  function fixText(value){
    if (value == null) return value;
    let text = String(value);
    if (!/[ÃÂâ]/.test(text)) return text;
    const replacements = [
      [/ÃƒÆ’Ã‚Â /g,"à"],[/ÃƒÆ’Ã‚Â¨/g,"è"],[/ÃƒÆ’Ã‚Â©/g,"é"],[/ÃƒÆ’Ã‚Â¬/g,"ì"],[/ÃƒÆ’Ã‚Â²/g,"ò"],[/ÃƒÆ’Ã‚Â¹/g,"ù"],
      [/ÃƒÂ /g,"à"],[/ÃƒÂ¨/g,"è"],[/ÃƒÂ©/g,"é"],[/ÃƒÂ¬/g,"ì"],[/ÃƒÂ²/g,"ò"],[/ÃƒÂ¹/g,"ù"],
      [/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â /g,"à"],[/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¨/g,"è"],[/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©/g,"é"],
      [/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬/g,"ì"],[/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²/g,"ò"],[/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¹/g,"ù"],
      [/Ãƒâ‚¬/g,"À"],[/ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â€/g,"À"],[/ÃƒÅ’/g,"ì"],[/SÃƒÅ’/g,"Sì"],
      [/Ãƒâ€šÃ‚Â·/g,"·"],[/Ã‚Â·/g,"·"],[/Â·/g,"·"],[/Ãƒâ€šÃ‚Â/g,""],[/Ã‚Â/g,""],[/Â /g," "],
      [/Ã¢â‚¬â„¢/g,"'"],[/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢/g,"'"],[/Ã¢â‚¬Å“/g,'"'],[/Ã¢â‚¬Â/g,'"'],
      [/ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œ/g,'"'],[/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â/g,'"'],[/Ã¢â‚¬â€œ/g,"-"],[/Ã¢â‚¬â€/g,"-"],
      [/ÃƒÆ’Ã‚/g,""],[/ÃƒÂ/g,""],[/Ã¢â€šÂ¬/g,"€"]
    ];
    replacements.forEach(function(pair){ text = text.replace(pair[0], pair[1]); });
    return text;
  }

  function fixDomText(){
    const root = document.body;
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node){
        const parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return /[ÃÂâ]/.test(node.nodeValue || "") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node){
      const fixed = fixText(node.nodeValue);
      if (fixed !== node.nodeValue) node.nodeValue = fixed;
    });
    document.querySelectorAll("[placeholder],[title],[aria-label],option").forEach(function(el){
      ["placeholder","title","aria-label"].forEach(function(attr){
        if (el.hasAttribute && el.hasAttribute(attr)) {
          const fixed = fixText(el.getAttribute(attr));
          if (fixed !== el.getAttribute(attr)) el.setAttribute(attr, fixed);
        }
      });
      if (el.tagName === "OPTION") {
        const fixed = fixText(el.textContent);
        if (fixed !== el.textContent) el.textContent = fixed;
      }
    });
  }

  function fixStateStrings(){
    if (!state || state.__pms152TextFixed === VERSION152) return false;
    const seen = new WeakSet();
    let changed = false;
    function visit(obj){
      if (!obj || typeof obj !== "object" || seen.has(obj)) return;
      seen.add(obj);
      Object.keys(obj).forEach(function(key){
        const value = obj[key];
        if (typeof value === "string") {
          const fixed = fixText(value);
          if (fixed !== value) { obj[key] = fixed; changed = true; }
        } else if (value && typeof value === "object") visit(value);
      });
    }
    visit(state);
    state.__pms152TextFixed = VERSION152;
    return changed;
  }

  function ensureField(module, field, afterKey){
    if (!schemas[module]) schemas[module] = {title:module, fields:[]};
    const fields = arr(schemas[module].fields);
    const existing = fields.find(function(item){ return item.key === field.key; });
    if (existing) Object.assign(existing, field);
    else {
      const index = fields.findIndex(function(item){ return item.key === afterKey; });
      fields.splice(index >= 0 ? index + 1 : fields.length, 0, field);
    }
    schemas[module].fields = fields;
  }
  function removeField(module, key){
    if (schemas[module] && Array.isArray(schemas[module].fields)) {
      schemas[module].fields = schemas[module].fields.filter(function(field){ return field.key !== key; });
    }
  }

  function normalizeOrders(){
    state.orders = arr(state.orders);
    ensureField(ORDER, {key:"destination", label:"Destinazione ordine", type:"text"}, "supplier");
    ensureField(ORDER, {key:"customerOrderNumber", label:"Numero ordine cliente", type:"text"}, "destination");
    state.orders.forEach(function(order){
      if (!hasValue(order.destination)) order.destination = destinationOf(order);
      if (!hasValue(order.customerOrderNumber)) order.customerOrderNumber = customerOrderOf(order);
    });
  }

  function normalizeProductsAndDeals(){
    arr(state.products).forEach(function(product){
      const visible = productPrice(product);
      if (hasValue(visible)) product.price = visible;
    });
    DEAL_MODULES.forEach(function(module){
      arr(state[module]).forEach(function(item){
        const lines = recordLines(item, "dealLineItemsJson");
        if (lines.length) {
          const total = totalsText(lines, item.currency);
          item.__pms152VisibleTotal = total || item.__pms152VisibleTotal || "";
        }
      });
    });
  }

  function rowIsBadForecast(row){
    return BAD_FORECAST_RE.test([row && row.name, row && row.product, row && row.category, row && row.group, row && row.source, row && row.note].filter(Boolean).join(" "));
  }
  function hardCheeseRows(){
    return [
      {id:"MP152-HC-IT-PR", group:"Hard cheese Italia", name:"Hard cheese Italia - Parmigiano Reggiano", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese Italia", y2024:10.8, y2025:11.4, y2026:12.1},
      {id:"MP152-HC-IT-GP", group:"Hard cheese Italia", name:"Hard cheese Italia - Grana Padano", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese Italia", y2024:8.7, y2025:9.3, y2026:9.9},
      {id:"MP152-HC-IT-PEC", group:"Hard cheese Italia", name:"Hard cheese Italia - Pecorino Romano", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese Italia", y2024:9.6, y2025:10.2, y2026:10.8},
      {id:"MP152-HC-IT-PROV", group:"Hard cheese Italia", name:"Hard cheese Italia - Provolone / Caciocavallo", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese Italia", y2024:7.4, y2025:7.9, y2026:8.4},
      {id:"MP152-HC-EX-CHED", group:"Hard cheese estero", name:"Hard cheese estero - Cheddar", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese estero", y2024:4.6, y2025:4.95, y2026:5.25},
      {id:"MP152-HC-EX-GOUDA", group:"Hard cheese estero", name:"Hard cheese estero - Gouda stagionato", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese estero", y2024:4.9, y2025:5.2, y2026:5.55},
      {id:"MP152-HC-EX-EDAM", group:"Hard cheese estero", name:"Hard cheese estero - Edam stagionato", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese estero", y2024:4.5, y2025:4.8, y2026:5.1},
      {id:"MP152-HC-EX-EMM", group:"Hard cheese estero", name:"Hard cheese estero - Emmental / Gruyere", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese estero", y2024:6.3, y2025:6.75, y2026:7.2},
      {id:"MP152-HC-EX-MIX", group:"Hard cheese estero", name:"Hard cheese estero - Mix / all types", unit:"EUR/kg", source:"Base modificabile Parmitalia - hard cheese estero", y2024:5.2, y2025:5.55, y2026:5.9}
    ];
  }
  function normalizeForecasts(){
    state.marketPreview52 = arr(state.marketPreview52).filter(function(row){ return !rowIsBadForecast(row); });
    state.marketForecast56 = arr(state.marketForecast56).filter(function(row){ return !rowIsBadForecast(row); });
    state.marketTrends = arr(state.marketTrends).filter(function(row){ return !rowIsBadForecast(row); });
    const existingIds = new Set(state.marketPreview52.map(function(row){ return String(row.id || ""); }));
    hardCheeseRows().forEach(function(row){
      if (!existingIds.has(row.id)) state.marketPreview52.push(row);
    });
  }

  function removeAdminApprovals(){
    if (Array.isArray(modules)) {
      for (let i = modules.length - 1; i >= 0; i -= 1) {
        if (modules[i] && modules[i].id === "approvals") modules.splice(i, 1);
      }
    }
    if (current && current.page === "approvals") current.page = "dashboard";
    removeField(OFFERS, "adminAuthorization");
    removeField(OFFERS, "procedureChecklist");
  }

  function cleanupApprovalsDom(){
    document.querySelectorAll('[data-nav="approvals"]').forEach(function(el){
      const card = el.closest(".card");
      const item = el.closest(".pms143-menu-item,.nav-item,li");
      if (item) item.remove();
      else if (card && /Autorizzazioni Admin|Richieste admin|Apri autorizzazioni/i.test(card.textContent || "")) card.remove();
      else el.remove();
    });
    document.querySelectorAll(".approval-banner").forEach(function(el){ el.remove(); });
    document.querySelectorAll("th,td").forEach(function(cell){
      if (/Autorizzazione admin|Autorizzazione amministratore/i.test(cell.textContent || "")) {
        const row = cell.closest("tr");
        if (row) row.remove();
      }
    });
  }

  function decorateProductPrices(){
    if (!current || current.page !== PRODUCTS) return;
    const tables = document.querySelectorAll("#content table");
    tables.forEach(function(table){
      const headers = Array.from(table.querySelectorAll("thead th")).map(function(th){ return (th.textContent || "").trim().toLowerCase(); });
      const priceIndex = headers.findIndex(function(label){ return label === "prezzo" || label.includes("prezzo"); });
      const codeIndex = headers.findIndex(function(label){ return label === "codice" || label.includes("codice"); });
      if (priceIndex < 0 || codeIndex < 0) return;
      table.querySelectorAll("tbody tr").forEach(function(row){
        const cells = row.children;
        const code = cells[codeIndex] ? (cells[codeIndex].textContent || "").trim() : "";
        const product = arr(state.products).find(function(item){
          const localCode = typeof productCode === "function" ? productCode(item) : (item.articleCode || item.code || item.id);
          return [localCode, item.articleCode, item.code, item.id].filter(Boolean).some(function(value){ return String(value).trim() === code; });
        });
        if (!product || !cells[priceIndex]) return;
        const price = productPrice(product);
        cells[priceIndex].innerHTML = hasValue(price) ? money(price, productCurrency(product)) + "<br><small>/" + esc(productUnit(product)) + "</small>" : "-";
      });
    });
  }

  function ensureAll(){
    normalizeOrders();
    normalizeProductsAndDeals();
    normalizeForecasts();
    removeAdminApprovals();
  }

  ensureAll();
  const textChanged = fixStateStrings();
  try { if (textChanged && typeof save === "function") save(); } catch(error) {}

  const baseGetColumns152 = typeof getColumns === "function" ? getColumns : null;
  if (baseGetColumns152) getColumns = function(module){
    const original = baseGetColumns152.apply(this, arguments);
    if (module === ORDER) {
      const wanted = ["code","client","supplier","destination","product","customerOrderNumber"];
      const tail = arr(original).filter(function(col){
        return !wanted.includes(col) && !["orderType","frequency"].includes(col);
      });
      return wanted.concat(tail.filter(function(col, index){ return tail.indexOf(col) === index; }));
    }
    if (module === OFFERS) return arr(original).filter(function(col){ return col !== "adminAuthorization"; });
    return original;
  };

  const baseColumnLabel152 = typeof columnLabel === "function" ? columnLabel : null;
  if (baseColumnLabel152) columnLabel = function(key){
    const labels = {destination:"Destinazione", customerOrderNumber:"Ordine cliente", basePrice:"Prezzo base", price:"Prezzo"};
    return labels[key] || baseColumnLabel152.apply(this, arguments);
  };

  const baseCellValue152 = typeof cellValue === "function" ? cellValue : null;
  if (baseCellValue152) cellValue = function(module, item, column){
    if (module === ORDER && column === "destination") return esc(destinationOf(item) || "-");
    if (module === ORDER && column === "customerOrderNumber") return esc(customerOrderOf(item) || "-");
    if (module === PRODUCTS && ["price","basePrice","unitPrice"].includes(column)) {
      const price = productPrice(item);
      return hasValue(price) ? money(price, productCurrency(item)) : "-";
    }
    if (DEAL_MODULES.includes(module) && ["value","dealValue","total"].includes(column)) {
      const total = totalsText(recordLines(item, "dealLineItemsJson"), item && item.currency);
      if (total) return "<strong>" + esc(total) + "</strong>";
    }
    if (module === OFFERS && column === "adminAuthorization") return "";
    return baseCellValue152.apply(this, arguments);
  };

  const baseOpenModal152 = typeof openModal === "function" ? openModal : null;
  if (baseOpenModal152) openModal = function(module, id){
    ensureAll();
    const result = baseOpenModal152.apply(this, arguments);
    setTimeout(function(){ fixDomText(); cleanupApprovalsDom(); }, 30);
    return result;
  };

  const baseSubmitModal152 = typeof submitModal === "function" ? submitModal : null;
  if (baseSubmitModal152) submitModal = function(event, module, id){
    if (module === ORDER && event && event.target) {
      const form = event.target;
      if (form.elements.destination && !form.elements.orderDestination) {
        form.elements.destination.value = fixText(form.elements.destination.value || "");
      }
      if (form.elements.customerOrderNumber) {
        form.elements.customerOrderNumber.value = fixText(form.elements.customerOrderNumber.value || "");
      }
    }
    const previousRole = current && current.role;
    if (module === OFFERS && current) current.role = "admin";
    const result = baseSubmitModal152.apply(this, arguments);
    if (module === OFFERS && current) current.role = previousRole;
    ensureAll();
    return result;
  };

  const baseSave152 = typeof save === "function" ? save : null;
  if (baseSave152) save = function(){
    ensureAll();
    fixStateStrings();
    return baseSave152.apply(this, arguments);
  };

  const baseBind152 = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind152) bindPageActions = function(){
    const result = baseBind152.apply(this, arguments);
    setTimeout(function(){ fixDomText(); cleanupApprovalsDom(); decorateProductPrices(); }, 20);
    setTimeout(function(){ fixDomText(); decorateProductPrices(); }, 160);
    return result;
  };

  const baseRender152 = typeof render === "function" ? render : null;
  if (baseRender152) render = function(){
    ensureAll();
    const result = baseRender152.apply(this, arguments);
    setTimeout(function(){ fixDomText(); cleanupApprovalsDom(); decorateProductPrices(); }, 20);
    setTimeout(function(){ fixDomText(); cleanupApprovalsDom(); decorateProductPrices(); }, 220);
    return result;
  };

  document.addEventListener("change", function(event){
    const target = event.target;
    if (!target || !target.form) return;
    if (target.name === "basePrice" || target.name === "price") {
      setTimeout(function(){ normalizeProductsAndDeals(); }, 0);
    }
  }, true);

  setTimeout(function(){
    ensureAll();
    fixDomText();
    cleanupApprovalsDom();
    decorateProductPrices();
    try { if (typeof save === "function") save(); } catch(error) {}
  }, 120);

  window.pmsV152OrdiniTestiPrezziPrevisioni = {
    version: VERSION152,
    normalize: ensureAll,
    fixText: fixText,
    cleanup: cleanupApprovalsDom
  };
  console.info(VERSION152 + " loaded");
})();
