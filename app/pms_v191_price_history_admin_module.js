(function(){
  "use strict";

  const VERSION = "pms_v191_price_history_admin_module";
  const MODULE = "priceHistory";
  const PRODUCT = "products";
  const OFFER = "offers";
  const PRICE = "supplierPriceConfirmations";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function num(value){
    const n = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  function boolSetting(key, fallback){
    const value = state && state.settings && state.settings[key];
    if (value == null || value === "") return fallback;
    return value === true || value === "true" || value === "1" || value === "Si" || value === "on";
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function uid191(prefix){
    if (typeof uid === "function") return uid(prefix);
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(value, currency || "EUR");
    return (currency || "EUR") + " " + num(value).toFixed(2);
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state[MODULE] = arr(state[MODULE]);
    state[PRODUCT] = arr(state[PRODUCT]);
    state[OFFER] = arr(state[OFFER]);
    state[PRICE] = arr(state[PRICE]);
    if (state.settings.priceHistoryEnabled == null) state.settings.priceHistoryEnabled = "Si";
    if (state.settings.priceHistoryAdminOnly == null) state.settings.priceHistoryAdminOnly = "Si";
    if (state.settings.priceHistoryAutoArchive == null) state.settings.priceHistoryAutoArchive = "Si";
    return state;
  }
  function moduleEnabled(){ return boolSetting("priceHistoryEnabled", true); }
  function adminOnly(){ return boolSetting("priceHistoryAdminOnly", true); }
  function autoArchive(){ return boolSetting("priceHistoryAutoArchive", true); }
  function canUpdatePrices(){ return !adminOnly() || (typeof current !== "undefined" && current.role === "admin"); }
  function productCode191(item){
    return item && (item.articleCode || item.code || item.id) || "";
  }
  function sourceLabel(module){
    return module === PRODUCT ? "Prodotti / Articoli" : module === OFFER ? "Offerte" : module === PRICE ? "Conferme prezzi fornitori" : module || "Archivio";
  }
  function itemKey(row){
    return clean(row.articleCode || row.productCode || row.productName || row.sourceId || row.id).toLowerCase();
  }
  function samePrice(a,b){ return Math.abs(num(a) - num(b)) < 0.000001; }
  function addModule(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    const roles = adminOnly() ? ["admin"] : ["admin","assistant"];
    const existing = modules.find(function(item){ return item.id === MODULE; });
    if (existing) {
      existing.label = "Storico prezzi";
      existing.subtitle = "Archivio variazioni prezzo articoli, offerte e listini con grafici";
      existing.roles = roles;
      return;
    }
    const index = modules.findIndex(function(item){ return item.id === "products"; });
    modules.splice(index >= 0 ? index + 1 : modules.length, 0, {
      id: MODULE,
      label: "Storico prezzi",
      subtitle: "Archivio variazioni prezzo articoli, offerte e listini con grafici",
      roles: roles
    });
  }
  function ensureSchema(){
    if (typeof schemas === "undefined") return;
    schemas[MODULE] = {
      title: "Storico prezzi",
      fields: [
        {key:"date", label:"Data aggiornamento", type:"date"},
        {key:"sourceModule", label:"Origine", type:"select", options:["products","offers","supplierPriceConfirmations"]},
        {key:"sourceId", label:"Codice origine", type:"text"},
        {key:"articleCode", label:"Codice articolo", type:"text"},
        {key:"productName", label:"Articolo / prodotto", type:"text", required:true},
        {key:"supplier", label:"Fornitore", type:"text"},
        {key:"client", label:"Cliente", type:"text"},
        {key:"oldPrice", label:"Prezzo precedente", type:"number"},
        {key:"newPrice", label:"Prezzo nuovo", type:"number"},
        {key:"currency", label:"Valuta", type:"select", options:["EUR","RON","USD","GBP","CHF"]},
        {key:"unit", label:"Unita", type:"text"},
        {key:"reason", label:"Motivo / nota", type:"textarea", full:true}
      ]
    };
  }
  function ensure(){
    st();
    addModule();
    ensureSchema();
  }
  function existingDuplicate(entry){
    const key = [entry.sourceModule, entry.sourceId, entry.articleCode, entry.productName, entry.oldPrice, entry.newPrice, entry.date].map(clean).join("|").toLowerCase();
    return arr(state[MODULE]).some(function(row){
      return [row.sourceModule, row.sourceId, row.articleCode, row.productName, row.oldPrice, row.newPrice, row.date].map(clean).join("|").toLowerCase() === key;
    });
  }
  function recordPriceChange(entry){
    st();
    if (!moduleEnabled() || !autoArchive()) return false;
    if (samePrice(entry.oldPrice, entry.newPrice)) return false;
    const row = {
      id: uid191("HPR"),
      date: entry.date || today(),
      timestamp: new Date().toISOString(),
      sourceModule: entry.sourceModule || PRODUCT,
      sourceLabel: sourceLabel(entry.sourceModule),
      sourceId: entry.sourceId || "",
      articleCode: entry.articleCode || "",
      productName: entry.productName || "",
      supplier: entry.supplier || "",
      client: entry.client || "",
      oldPrice: num(entry.oldPrice),
      newPrice: num(entry.newPrice),
      currency: entry.currency || "EUR",
      unit: entry.unit || "",
      reason: entry.reason || "Aggiornamento prezzo",
      user: (typeof current !== "undefined" && current.user) || "Utente"
    };
    if (!row.productName && !row.articleCode) return false;
    if (existingDuplicate(row)) return false;
    state[MODULE].unshift(row);
    return true;
  }
  function parseLines(record, keys){
    for (const key of keys) {
      try {
        const parsed = JSON.parse(record && record[key] || "[]");
        if (Array.isArray(parsed)) return parsed;
      } catch(error) {}
    }
    return [];
  }
  function lineId(line,index){
    return clean(line.articleCode || line.supplierArticleCode || line.productCode || line.product || line.productName || ("line-" + index)).toLowerCase();
  }
  function compareLinePrices(oldRecord, newRecord, module){
    const keys = module === PRICE ? ["supplierPriceListItemsJson","priceLineItemsJson"] : ["offerLineItemsJson","orderLineItemsJson","multiArticleItemsJson"];
    const before = parseLines(oldRecord, keys);
    const after = parseLines(newRecord, keys);
    if (!before.length || !after.length) return false;
    let changed = false;
    after.forEach(function(line,index){
      const id = lineId(line,index);
      const oldLine = before.find(function(item,oldIndex){ return lineId(item,oldIndex) === id; }) || before[index];
      if (!oldLine) return;
      const oldPrice = module === PRICE ? oldLine.price : (oldLine.unitPrice == null ? oldLine.price : oldLine.unitPrice);
      const newPrice = module === PRICE ? line.price : (line.unitPrice == null ? line.price : line.unitPrice);
      if (samePrice(oldPrice,newPrice)) return;
      changed = recordPriceChange({
        sourceModule: module,
        sourceId: newRecord.code || newRecord.id,
        articleCode: line.articleCode || line.supplierArticleCode || oldLine.articleCode || oldLine.supplierArticleCode || "",
        productName: line.product || line.productName || oldLine.product || oldLine.productName || newRecord.product || "",
        supplier: newRecord.supplier || "",
        client: newRecord.client || "",
        oldPrice: oldPrice,
        newPrice: newPrice,
        currency: line.currency || newRecord.currency || "EUR",
        unit: line.unit || newRecord.unit || "",
        reason: "Aggiornamento riga prezzo"
      }) || changed;
    });
    return changed;
  }
  function compareRecordPrice(oldRecord, newRecord, module){
    if (!oldRecord || !newRecord) return false;
    let oldPrice = 0;
    let newPrice = 0;
    let productName = "";
    let articleCode = "";
    let unit = "";
    if (module === PRODUCT) {
      oldPrice = oldRecord.price;
      newPrice = newRecord.price;
      productName = newRecord.name || oldRecord.name || "";
      articleCode = productCode191(newRecord) || productCode191(oldRecord);
      unit = newRecord.unit || oldRecord.unit || "";
    } else if (module === OFFER) {
      oldPrice = oldRecord.unitPrice;
      newPrice = newRecord.unitPrice;
      productName = newRecord.product || oldRecord.product || "";
      articleCode = newRecord.articleCode || oldRecord.articleCode || "";
      unit = newRecord.unit || oldRecord.unit || "";
    } else if (module === PRICE) {
      oldPrice = oldRecord.price;
      newPrice = newRecord.price;
      productName = newRecord.product || oldRecord.product || "";
      articleCode = newRecord.articleCode || oldRecord.articleCode || "";
      unit = newRecord.unit || oldRecord.unit || "";
    }
    const directChanged = recordPriceChange({
      sourceModule: module,
      sourceId: newRecord.code || newRecord.id,
      articleCode: articleCode,
      productName: productName,
      supplier: newRecord.supplier || "",
      client: newRecord.client || "",
      oldPrice: oldPrice,
      newPrice: newPrice,
      currency: newRecord.currency || oldRecord.currency || "EUR",
      unit: unit,
      reason: "Aggiornamento prezzo scheda"
    });
    const lineChanged = compareLinePrices(oldRecord, newRecord, module);
    return directChanged || lineChanged;
  }
  function updateProductPrice(id){
    st();
    if (!canUpdatePrices()) return alert("Aggiornamento prezzi autorizzato solo ad admin. Cambia autorizzazione in Impostazioni.");
    const product = state[PRODUCT].find(function(item){ return String(item.id) === String(id); });
    if (!product) return alert("Articolo non trovato.");
    const oldPrice = num(product.price);
    const raw = prompt("Nuovo prezzo per " + (product.name || productCode191(product)) + " (" + (product.currency || "EUR") + " / " + (product.unit || "unita") + ")", oldPrice || "");
    if (raw == null) return;
    const newPrice = num(raw);
    if (!Number.isFinite(newPrice) || newPrice < 0) return alert("Prezzo non valido.");
    if (samePrice(oldPrice,newPrice)) return alert("Prezzo invariato.");
    product.price = newPrice;
    product.updatedAt = new Date().toISOString();
    recordPriceChange({
      sourceModule: PRODUCT,
      sourceId: product.id,
      articleCode: productCode191(product),
      productName: product.name || "",
      supplier: product.supplier || "",
      client: product.targetClient || "",
      oldPrice: oldPrice,
      newPrice: newPrice,
      currency: product.currency || "EUR",
      unit: product.unit || "",
      reason: "Tasto Aggiorna prezzo"
    });
    saveNow();
    if (typeof render === "function") render();
  }
  function filteredHistory(){
    const search = clean(current && current.filters && current.filters.priceHistorySearch).toLowerCase();
    const source = clean(current && current.filters && current.filters.priceHistorySource);
    return arr(st()[MODULE]).filter(function(row){
      const sourceOk = !source || row.sourceModule === source;
      const text = JSON.stringify(row || {}).toLowerCase();
      return sourceOk && (!search || text.includes(search));
    }).sort(function(a,b){ return String(b.timestamp || b.date || "").localeCompare(String(a.timestamp || a.date || "")); });
  }
  function groupedHistory(list){
    const map = new Map();
    list.forEach(function(row){
      const key = itemKey(row);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return Array.from(map.values()).sort(function(a,b){ return b.length - a.length; });
  }
  function chartSvg(rows){
    const sorted = rows.slice().sort(function(a,b){ return String(a.timestamp || a.date || "").localeCompare(String(b.timestamp || b.date || "")); });
    const points = sorted.map(function(row,index){ return {x:index, y:num(row.newPrice), row:row}; });
    if (!points.length) return '<div class="pms191-empty-chart">Nessun grafico</div>';
    const min = Math.min.apply(null, points.map(function(p){ return p.y; }));
    const max = Math.max.apply(null, points.map(function(p){ return p.y; }));
    const span = Math.max(1, max - min);
    const w = 320, h = 110, pad = 18;
    const coords = points.map(function(p,index){
      const x = points.length === 1 ? w / 2 : pad + (index * (w - pad * 2) / (points.length - 1));
      const y = h - pad - ((p.y - min) * (h - pad * 2) / span);
      return {x:x,y:y,p:p};
    });
    const line = coords.map(function(c){ return c.x.toFixed(1) + "," + c.y.toFixed(1); }).join(" ");
    const dots = coords.map(function(c){ return '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="3.5"><title>' + esc(c.p.row.date + " - " + money(c.p.y,c.p.row.currency)) + '</title></circle>'; }).join("");
    return '<svg class="pms191-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img"><polyline points="' + line + '"></polyline>' + dots + '<text x="' + pad + '" y="14">' + esc(money(max, sorted[0].currency)) + '</text><text x="' + pad + '" y="' + (h - 4) + '">' + esc(money(min, sorted[0].currency)) + '</text></svg>';
  }
  function renderHistoryModule(){
    ensure();
    const list = filteredHistory();
    const groups = groupedHistory(list).slice(0, 6);
    const totalChanges = arr(state[MODULE]).length;
    const up = list.filter(function(row){ return num(row.newPrice) > num(row.oldPrice); }).length;
    const down = list.filter(function(row){ return num(row.newPrice) < num(row.oldPrice); }).length;
    const rows = list.map(function(row){
      const delta = num(row.newPrice) - num(row.oldPrice);
      const cls = delta > 0 ? "pms191-up" : delta < 0 ? "pms191-down" : "";
      return '<tr><td>' + esc(row.date || "-") + '</td><td><span class="code-block">' + esc(row.articleCode || row.sourceId || "-") + '</span></td><td><strong>' + esc(row.productName || "-") + '</strong><br><small>' + esc([row.supplier,row.client].filter(Boolean).join(" / ")) + '</small></td><td>' + esc(sourceLabel(row.sourceModule)) + '</td><td>' + esc(money(row.oldPrice,row.currency)) + '</td><td><strong>' + esc(money(row.newPrice,row.currency)) + '</strong></td><td class="' + cls + '">' + esc((delta > 0 ? "+" : "") + delta.toFixed(2) + " " + (row.currency || "")) + '</td><td>' + esc(row.reason || "-") + '</td></tr>';
    }).join("");
    return `
      <div class="pms191-page">
        <div class="section-header">
          <h3>Storico offerte prezzi / articoli</h3>
          <div class="filters">
            <input data-pms191-search placeholder="Cerca articolo, fornitore, cliente..." value="${esc(clean(current.filters.priceHistorySearch))}">
            <select data-pms191-source>
              <option value="">Tutte le origini</option>
              <option value="products" ${current.filters.priceHistorySource === "products" ? "selected" : ""}>Prodotti</option>
              <option value="offers" ${current.filters.priceHistorySource === "offers" ? "selected" : ""}>Offerte</option>
              <option value="supplierPriceConfirmations" ${current.filters.priceHistorySource === "supplierPriceConfirmations" ? "selected" : ""}>Conferme prezzi</option>
            </select>
            <button class="secondary-button" data-pms191-print>Stampa</button>
            <button class="secondary-button" data-pms191-export>Excel</button>
          </div>
        </div>
        <div class="grid cards pms191-kpis">
          ${typeof kpi === "function" ? kpi("Variazioni archiviate", totalChanges, "Vecchi prezzi copiati nello storico") : ""}
          ${typeof kpi === "function" ? kpi("Aumenti", up, "Nuovo prezzo maggiore", up ? "warn" : "") : ""}
          ${typeof kpi === "function" ? kpi("Ribassi", down, "Nuovo prezzo minore", down ? "success" : "") : ""}
        </div>
        <div class="pms191-chart-grid">
          ${groups.map(function(rows){
            const latest = rows.slice().sort(function(a,b){ return String(b.timestamp || b.date || "").localeCompare(String(a.timestamp || a.date || "")); })[0];
            return '<div class="card pms191-chart-card"><div><strong>' + esc(latest.productName || latest.articleCode || "-") + '</strong><small>' + esc(latest.articleCode || latest.sourceId || "") + '</small></div>' + chartSvg(rows) + '</div>';
          }).join("") || '<div class="card">Appena aggiorni un prezzo, qui compare il grafico storico.</div>'}
        </div>
        <div class="table-wrap"><table><thead><tr><th>Data</th><th>Codice</th><th>Articolo</th><th>Origine</th><th>Vecchio</th><th>Nuovo</th><th>Delta</th><th>Nota</th></tr></thead><tbody>${rows || (typeof emptyRow === "function" ? emptyRow(8) : "")}</tbody></table></div>
      </div>`;
  }
  function printHistory(){
    const rows = filteredHistory().map(function(row){
      return "<tr><td>" + esc(row.date || "-") + "</td><td>" + esc(row.articleCode || "-") + "</td><td>" + esc(row.productName || "-") + "</td><td>" + esc(sourceLabel(row.sourceModule)) + "</td><td>" + esc(money(row.oldPrice,row.currency)) + "</td><td>" + esc(money(row.newPrice,row.currency)) + "</td><td>" + esc(row.user || "-") + "</td></tr>";
    }).join("");
    const header = typeof companyPrintHeader === "function" ? companyPrintHeader("STORICO PREZZI", "HPR") : '<div class="print-header"><h1>STORICO PREZZI</h1></div>';
    const html = '<div class="print-document">' + header + '<table class="print-table"><thead><tr><th>Data</th><th>Codice</th><th>Articolo</th><th>Origine</th><th>Vecchio</th><th>Nuovo</th><th>Utente</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">Nessun dato.</td></tr>') + '</tbody></table><div class="print-footer">Archivio storico prezzi Parmitalia</div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function exportHistory(){
    const list = filteredHistory();
    if (!list.length) return alert("Nessun dato da esportare.");
    const cols = ["date","sourceLabel","sourceId","articleCode","productName","supplier","client","oldPrice","newPrice","currency","unit","reason","user"];
    const labels = ["Data","Origine","Codice origine","Codice articolo","Articolo","Fornitore","Cliente","Vecchio prezzo","Nuovo prezzo","Valuta","Unita","Nota","Utente"];
    const rows = list.map(function(row){
      return "<tr>" + cols.map(function(col){
        const value = col === "sourceLabel" ? sourceLabel(row.sourceModule) : row[col];
        return "<td>" + esc(value == null ? "" : value) + "</td>";
      }).join("") + "</tr>";
    }).join("");
    const blob = new Blob(["\ufeff<!doctype html><html><head><meta charset='utf-8'></head><body><table><thead><tr>" + labels.map(function(label){ return "<th>" + esc(label) + "</th>"; }).join("") + "</tr></thead><tbody>" + rows + "</tbody></table></body></html>"], {type:"application/vnd.ms-excel;charset=utf-8"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "storico-prezzi-" + today() + ".xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function(){ URL.revokeObjectURL(link.href); }, 1000);
  }
  function injectCss(){
    if (document.getElementById("pms-v191-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v191-style";
    style.textContent = `
      .pms191-price-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
      .pms191-price-actions button,.pms191-page button{width:auto!important;margin:0!important}
      .pms191-settings{grid-column:1/-1;border:1px solid #cbd5e1;background:#f8fbff;border-radius:8px;padding:12px;display:grid;gap:10px}
      .pms191-settings h4{margin:0;color:#1f4e78}.pms191-checks{display:flex;gap:14px;flex-wrap:wrap}
      .pms191-checks label{display:flex;align-items:center;gap:7px;font-weight:850;color:#17242b}
      .pms191-chart-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin:14px 0}
      .pms191-chart-card{display:grid;gap:8px}.pms191-chart-card small{display:block;color:#64748b;margin-top:2px}
      .pms191-chart{width:100%;height:120px;background:#fff;border:1px solid #d8e2ec;border-radius:8px}
      .pms191-chart polyline{fill:none;stroke:#1f4e78;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
      .pms191-chart circle{fill:#16a34a;stroke:#fff;stroke-width:2}.pms191-chart text{fill:#64748b;font-size:10px;font-weight:800}
      .pms191-up{color:#b45309;font-weight:900}.pms191-down{color:#15803d;font-weight:900}
      .pms191-empty-chart{height:110px;display:grid;place-items:center;color:#64748b;border:1px dashed #cbd5e1;border-radius:8px}
      @media(max-width:760px){.pms191-checks{display:grid}.pms191-page .filters{align-items:stretch}.pms191-page .filters>*{width:100%!important}}
    `;
    document.head.appendChild(style);
  }
  function settingsPanel(){
    const enabled = moduleEnabled();
    const onlyAdmin = adminOnly();
    const automatic = autoArchive();
    return `
      <div class="pms191-settings">
        <h4>Autorizzazione admin modulo prezzi</h4>
        <div class="pms191-checks">
          <label><input type="hidden" name="priceHistoryEnabled" value="No"><input type="checkbox" name="priceHistoryEnabled" value="Si" ${enabled ? "checked" : ""}> Modulo Storico prezzi attivo</label>
          <label><input type="hidden" name="priceHistoryAdminOnly" value="No"><input type="checkbox" name="priceHistoryAdminOnly" value="Si" ${onlyAdmin ? "checked" : ""}> Aggiorna prezzo solo admin</label>
          <label><input type="hidden" name="priceHistoryAutoArchive" value="No"><input type="checkbox" name="priceHistoryAutoArchive" value="Si" ${automatic ? "checked" : ""}> Salva automaticamente vecchio prezzo</label>
        </div>
        <small>Quando un prezzo cambia, il vecchio prezzo viene copiato nello storico con data, articolo, origine e utente.</small>
      </div>`;
  }
  function decorateProductActions(){
    if (!moduleEnabled()) return;
    document.querySelectorAll('[data-edit="products"][data-id]').forEach(function(button){
      const id = button.getAttribute("data-id");
      const holder = button.parentElement;
      if (!holder || holder.querySelector('[data-pms191-update-price="' + id.replace(/"/g,'\\"') + '"]')) return;
      const action = document.createElement("button");
      action.type = "button";
      action.className = "inline-button";
      action.setAttribute("data-pms191-update-price", id);
      action.textContent = "Aggiorna prezzo";
      button.insertAdjacentElement("afterend", action);
    });
  }
  function bindActions(){
    decorateProductActions();
    document.querySelectorAll("[data-pms191-update-price]").forEach(function(button){
      button.onclick = function(){ updateProductPrice(button.getAttribute("data-pms191-update-price")); };
    });
    document.querySelectorAll("[data-pms191-search]").forEach(function(input){
      input.oninput = function(){ current.filters.priceHistorySearch = input.value; render(); };
    });
    document.querySelectorAll("[data-pms191-source]").forEach(function(select){
      select.onchange = function(){ current.filters.priceHistorySource = select.value; render(); };
    });
    document.querySelectorAll("[data-pms191-print]").forEach(function(button){ button.onclick = printHistory; });
    document.querySelectorAll("[data-pms191-export]").forEach(function(button){ button.onclick = exportHistory; });
  }
  function renderCustomPage(){
    const content = document.getElementById("content");
    if (!content || current.page !== MODULE) return false;
    if (!moduleEnabled()) {
      content.innerHTML = '<div class="card"><h3>Storico prezzi non attivo</h3><p>Attivalo da Impostazioni con autorizzazione admin.</p><button class="secondary-button" data-nav="settings">Apri Impostazioni</button></div>';
      if (typeof bindPageActions === "function") bindPageActions();
      return true;
    }
    content.innerHTML = renderHistoryModule();
    if (typeof bindPageActions === "function") bindPageActions();
    bindActions();
    return true;
  }
  function decorate(){
    ensure();
    injectCss();
    bindActions();
  }

  ensure();
  injectCss();

  const baseRenderSettings = typeof renderSettings === "function" ? renderSettings : null;
  if (baseRenderSettings && !baseRenderSettings.__pms191Wrapped) {
    renderSettings = function(){
      ensure();
      const html = baseRenderSettings.apply(this, arguments);
      if (html.includes("pms191-settings")) return html;
      return html.replace("</form>", settingsPanel() + "</form>");
    };
    renderSettings.__pms191Wrapped = true;
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !baseRenderNav.__pms191Wrapped) {
    renderNav = function(){
      ensure();
      const result = baseRenderNav.apply(this, arguments);
      setTimeout(function(){
        if (!moduleEnabled()) document.querySelectorAll('[data-page="' + MODULE + '"]').forEach(function(node){ node.remove(); });
      }, 20);
      return result;
    };
    renderNav.__pms191Wrapped = true;
  }
  const baseSetPage = typeof setPage === "function" ? setPage : null;
  if (baseSetPage && !baseSetPage.__pms191Wrapped) {
    setPage = function(page){
      ensure();
      if (page === MODULE && (!moduleEnabled() || (adminOnly() && current.role !== "admin"))) {
        alert("Modulo Storico prezzi non autorizzato per questo ruolo. Controlla Impostazioni.");
        page = "dashboard";
      }
      return baseSetPage.apply(this, [page]);
    };
    setPage.__pms191Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms191Wrapped) {
    render = function(){
      ensure();
      if (renderCustomPage()) return;
      const result = baseRender.apply(this, arguments);
      setTimeout(decorate, 30);
      setTimeout(decorate, 220);
      return result;
    };
    render.__pms191Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms191Wrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      bindActions();
      return result;
    };
    bindPageActions.__pms191Wrapped = true;
  }
  const baseSubmit = typeof submitModal === "function" ? submitModal : null;
  if (baseSubmit && !baseSubmit.__pms191Wrapped) {
    submitModal = function(event,module,id){
      const watch = [PRODUCT,OFFER,PRICE].includes(module);
      const before = watch && id ? JSON.parse(JSON.stringify((state[module] || []).find(function(item){ return String(item.id) === String(id); }) || null)) : null;
      const result = baseSubmit.apply(this, arguments);
      if (watch && id && before) {
        const after = (state[module] || []).find(function(item){ return String(item.id) === String(id); });
        if (compareRecordPrice(before, after, module)) saveNow();
      }
      return result;
    };
    submitModal.__pms191Wrapped = true;
  }
  const baseSaveSettings = typeof saveSettings === "function" ? saveSettings : null;
  if (baseSaveSettings && !baseSaveSettings.__pms191Wrapped) {
    saveSettings = function(){
      const result = baseSaveSettings.apply(this, arguments);
      ensure();
      if (typeof renderNav === "function") renderNav();
      return result;
    };
    saveSettings.__pms191Wrapped = true;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", decorate, {once:true});
  else decorate();
  [80,260,700,1400].forEach(function(ms){ setTimeout(decorate, ms); });
  window.PMS_V191_PRICE_HISTORY_ADMIN_MODULE = {version:VERSION, recordPriceChange:recordPriceChange, renderHistoryModule:renderHistoryModule, updateProductPrice:updateProductPrice};
  console.info(VERSION + " loaded");
})();
