(function(){
  "use strict";

  var VERSION = "pms_v250_safe_price_confirmations_and_backup_load";
  var MODULE = "supplierPriceConfirmations";
  var STYLE_ID = "pms-v250-safe-price-style";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function num(value){
    var parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function uidSafe(prefix){
    try { if (typeof uid === "function") return uid(prefix); } catch (_) {}
    return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(Math.random() * 900);
  }
  function ensureStateShape(data){
    var target = data || state || {};
    target[MODULE] = arr(target[MODULE]).map(sanitizeRecord);
    target.settings = target.settings && typeof target.settings === "object" && !Array.isArray(target.settings) ? target.settings : {};
    return target;
  }
  function parseLines(value){
    if (Array.isArray(value)) return value;
    var raw = clean(value);
    if (!raw) return [];
    if (raw.length > 250000) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.slice(0, 250).map(function(row){ return row && typeof row === "object" ? row : {}; }) : [];
    } catch (_) {
      return [];
    }
  }
  function safeJsonLines(value){
    var lines = parseLines(value).slice(0, 250);
    try { return JSON.stringify(lines); } catch (_) { return "[]"; }
  }
  function sanitizeRecord(item){
    item = item && typeof item === "object" ? item : {};
    var direction = clean(item.direction || item.confirmationType || item.type);
    if (!/cliente|client/i.test(direction)) direction = "Fornitore";
    else direction = "Cliente";
    var price = item.price != null && item.price !== "" ? item.price : item.unitPrice;
    return {
      id: clean(item.id || item.code || item.protocol) || uidSafe("LST"),
      date: clean(item.date || item.confirmationDate || item.requestDate) || today(),
      direction: direction,
      supplier: clean(item.supplier || (direction === "Fornitore" ? item.counterparty : "")),
      client: clean(item.client || item.customer || (direction === "Cliente" ? item.counterparty : "")),
      counterparty: clean(item.counterparty || item.supplier || item.client || item.customer || item.company),
      product: clean(item.product || item.productName || item.article || item.description).slice(0, 240),
      articleCode: clean(item.articleCode).slice(0, 80),
      supplierArticleCode: clean(item.supplierArticleCode).slice(0, 80),
      price: num(price),
      currency: clean(item.currency) || "EUR",
      unit: clean(item.unit) || "kg",
      validity: clean(item.validity || [item.validFrom, item.validUntil].filter(Boolean).join(" - ")).slice(0, 160),
      validFrom: clean(item.validFrom),
      validUntil: clean(item.validUntil),
      paymentTerms: clean(item.paymentTerms).slice(0, 220),
      deliveryTerms: clean(item.deliveryTerms || item.incoterm || item.delivery).slice(0, 220),
      status: clean(item.status) || "Bozza",
      notes: clean(item.notes || item.note).slice(0, 1200),
      supplierPriceListItemsJson: safeJsonLines(item.supplierPriceListItemsJson || item.priceListItems),
      createdAt: clean(item.createdAt) || new Date().toISOString(),
      updatedAt: clean(item.updatedAt)
    };
  }
  function labelOf(row){
    return row.counterparty || row.supplier || row.client || "-";
  }
  function saveImmediate(){
    try {
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn(VERSION + " local save failed", error);
    }
    try {
      if (window.parmitaliaStorage && typeof window.parmitaliaStorage.save === "function") window.parmitaliaStorage.save(state);
    } catch (error) {
      console.warn(VERSION + " desktop save failed", error);
    }
    return true;
  }
  function installCss(){
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".pms250-page{display:grid;gap:12px;color:#172033}.pms250-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;border:1px solid #d7dee8;border-left:5px solid #2f6f5e;border-radius:8px;background:#fff;padding:14px}.pms250-head h3{margin:0 0 4px;font-size:22px;color:#0f172a}.pms250-head p{margin:0;color:#52606d;line-height:1.35}",
      ".pms250-actions{display:flex;gap:7px;flex-wrap:wrap}.pms250-actions button,.pms250-page button{width:auto!important;margin:0!important}",
      ".pms250-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.pms250-kpi{border:1px solid #d7dee8;border-radius:8px;background:#fff;padding:10px}.pms250-kpi span{display:block;font-size:11px;text-transform:uppercase;font-weight:900;color:#64748b}.pms250-kpi strong{display:block;margin-top:4px;font-size:20px;color:#0f172a}",
      ".pms250-panel{border:1px solid #d7dee8;border-radius:8px;background:#fff;overflow:hidden}.pms250-tools{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid #e5edf5;background:#f8fafc}.pms250-tools input,.pms250-tools select{width:auto;min-width:170px;background:#fff}",
      ".pms250-table{overflow:auto}.pms250-table table{width:100%;min-width:920px;border-collapse:collapse}.pms250-table th,.pms250-table td{padding:8px 9px;border-bottom:1px solid #e5edf5;text-align:left;vertical-align:top}.pms250-table th{background:#eef2f7;color:#253447;font-size:12px}.pms250-table small{display:block;color:#64748b;margin-top:3px;line-height:1.25}.pms250-pill{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:900;border:1px solid #bbf7d0;background:#ecfdf5;color:#047857}.pms250-pill.client{border-color:#fed7aa;background:#fff7ed;color:#c2410c}",
      ".pms250-modal-backdrop{position:fixed;inset:0;z-index:2147483200;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms250-modal{width:min(780px,96vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px;box-shadow:0 24px 74px rgba(15,23,42,.34)}.pms250-modal-head{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px;border-bottom:1px solid #e5edf5}.pms250-modal-head h3{margin:0;color:#0f172a}.pms250-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:13px}.pms250-form label{margin:0;font-size:12px;font-weight:900;color:#475569}.pms250-form input,.pms250-form select,.pms250-form textarea{background:#fff}.pms250-form .full{grid-column:1/-1}.pms250-form textarea{min-height:78px}.pms250-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}",
      "@media(max-width:760px){.pms250-head,.pms250-tools{display:grid}.pms250-form{grid-template-columns:1fr}.pms250-tools input,.pms250-tools select,.pms250-tools button{width:100%!important;min-width:0}}"
    ].join("\n");
    document.head.appendChild(style);
  }
  function ensureModule(){
    ensureStateShape(state);
    try {
      if (Array.isArray(modules) && !modules.some(function(item){ return item.id === MODULE; })) {
        modules.push({ id: MODULE, label: "Conferme prezzi", subtitle: "Archivio stabile conferme cliente/fornitore", roles: ["admin","assistant","agent","accountant"] });
      }
      arr(modules).forEach(function(item){
        if (item && item.id === MODULE) {
          item.label = "Conferme prezzi";
          item.subtitle = "Archivio stabile conferme cliente/fornitore";
          item.roles = ["admin","assistant","agent","accountant"];
        }
      });
    } catch (_) {}
  }
  function filteredRows(){
    var filters = current && current.filters ? current.filters : {};
    var query = clean(filters.pms250PriceSearch).toLowerCase();
    var dir = clean(filters.pms250PriceDirection);
    return arr(state[MODULE]).map(sanitizeRecord).filter(function(row){
      if (dir && row.direction !== dir) return false;
      if (!query) return true;
      return JSON.stringify([row.id, row.direction, labelOf(row), row.product, row.price, row.currency, row.status]).toLowerCase().indexOf(query) >= 0;
    }).sort(function(a,b){ return String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")); });
  }
  function renderSafePage(){
    ensureModule();
    installCss();
    var rows = filteredRows();
    var total = arr(state[MODULE]).length;
    var clients = arr(state[MODULE]).filter(function(row){ return sanitizeRecord(row).direction === "Cliente"; }).length;
    var suppliers = total - clients;
    return '<div class="pms250-page"><section class="pms250-head"><div><h3>Conferme prezzi</h3><p>Modulo stabile per registrare conferme prezzo cliente o fornitore senza collegamenti pesanti agli altri archivi.</p></div><div class="pms250-actions"><button class="primary-button" data-pms250-new>+ Nuova conferma</button></div></section>' +
      '<div class="pms250-grid"><div class="pms250-kpi"><span>Totali</span><strong>' + total + '</strong></div><div class="pms250-kpi"><span>Fornitori</span><strong>' + suppliers + '</strong></div><div class="pms250-kpi"><span>Clienti</span><strong>' + clients + '</strong></div></div>' +
      '<section class="pms250-panel"><div class="pms250-tools"><strong>Archivio conferme</strong><div class="pms250-actions"><input data-pms250-search placeholder="Cerca..." value="' + esc(clean(current.filters.pms250PriceSearch)) + '"><select data-pms250-direction><option value="">Tutti</option><option value="Fornitore" ' + (current.filters.pms250PriceDirection === "Fornitore" ? "selected" : "") + '>Fornitore</option><option value="Cliente" ' + (current.filters.pms250PriceDirection === "Cliente" ? "selected" : "") + '>Cliente</option></select></div></div>' +
      '<div class="pms250-table"><table><thead><tr><th>ID/Data</th><th>Tipo</th><th>Controparte</th><th>Prodotto</th><th>Prezzo</th><th>Validita</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows.map(rowHtml).join("") || '<tr><td colspan="8" class="empty">Nessuna conferma prezzo registrata.</td></tr>') + '</tbody></table></div></section></div>';
  }
  function rowHtml(row){
    var cls = row.direction === "Cliente" ? "client" : "";
    return '<tr><td><span class="code-block">' + esc(row.id) + '</span><small>' + esc(row.date || "-") + '</small></td><td><span class="pms250-pill ' + cls + '">' + esc(row.direction) + '</span></td><td><strong>' + esc(labelOf(row)) + '</strong><small>' + esc(row.paymentTerms || "-") + '</small></td><td><strong>' + esc(row.product || "-") + '</strong><small>' + esc(row.articleCode || row.supplierArticleCode || "") + '</small></td><td><strong>' + esc(row.currency + " " + num(row.price).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:4})) + '</strong><small>/' + esc(row.unit || "kg") + '</small></td><td>' + esc(row.validity || row.validUntil || "-") + '</td><td>' + esc(row.status || "Bozza") + '</td><td><div class="pms250-actions"><button class="inline-button" data-pms250-edit="' + esc(row.id) + '">Modifica</button><button class="inline-button danger-button" data-pms250-delete="' + esc(row.id) + '">Elimina</button></div></td></tr>';
  }
  function findRecord(id){
    return arr(state[MODULE]).map(sanitizeRecord).find(function(row){ return row.id === String(id || ""); });
  }
  function closeSafeModal(){
    document.querySelectorAll(".pms250-modal-backdrop,.pms240-modal-backdrop").forEach(function(node){ node.remove(); });
  }
  function openSafeModal(record){
    installCss();
    record = sanitizeRecord(record || { id: uidSafe("LST"), date: today(), direction: "Fornitore", currency: "EUR", unit: "kg", status: "Bozza" });
    closeSafeModal();
    var wrap = document.createElement("div");
    wrap.className = "pms250-modal-backdrop";
    wrap.innerHTML = '<div class="pms250-modal"><div class="pms250-modal-head"><h3>' + (findRecord(record.id) ? "Modifica conferma" : "Nuova conferma prezzo") + '</h3><button type="button" class="secondary-button" data-pms250-close>Chiudi</button></div><form id="pms250-form" class="pms250-form">' +
      '<input type="hidden" name="id" value="' + esc(record.id) + '">' +
      '<label>Data<input name="date" type="date" value="' + esc(record.date) + '"></label>' +
      '<label>Tipo<select name="direction"><option ' + (record.direction === "Fornitore" ? "selected" : "") + '>Fornitore</option><option ' + (record.direction === "Cliente" ? "selected" : "") + '>Cliente</option></select></label>' +
      '<label class="full">Cliente / Fornitore<input name="counterparty" value="' + esc(labelOf(record) === "-" ? "" : labelOf(record)) + '"></label>' +
      '<label class="full">Prodotto<input name="product" value="' + esc(record.product) + '"></label>' +
      '<label>Prezzo<input name="price" type="number" step="0.0001" value="' + esc(record.price) + '"></label>' +
      '<label>Valuta<select name="currency">' + ["EUR","RON","USD","GBP","CHF"].map(function(c){ return '<option ' + (record.currency === c ? "selected" : "") + '>' + c + '</option>'; }).join("") + '</select></label>' +
      '<label>Unita<input name="unit" value="' + esc(record.unit) + '"></label>' +
      '<label>Validita<input name="validity" value="' + esc(record.validity) + '"></label>' +
      '<label>Pagamento<input name="paymentTerms" value="' + esc(record.paymentTerms) + '"></label>' +
      '<label>Consegna<input name="deliveryTerms" value="' + esc(record.deliveryTerms) + '"></label>' +
      '<label>Stato<select name="status">' + ["Bozza","Inviata","Confermata","Scaduta","Annullata"].map(function(s){ return '<option ' + (record.status === s ? "selected" : "") + '>' + s + '</option>'; }).join("") + '</select></label>' +
      '<label class="full">Note<textarea name="notes">' + esc(record.notes) + '</textarea></label>' +
      '<div class="pms250-modal-actions"><button type="button" class="secondary-button" data-pms250-close>Annulla</button><button type="submit" class="primary-button">Salva</button></div></form></div>';
    document.body.appendChild(wrap);
  }
  function readSafeForm(form){
    var data = {};
    Array.prototype.forEach.call(form.elements, function(el){ if (el.name) data[el.name] = el.value; });
    var row = sanitizeRecord(data);
    if (row.direction === "Fornitore") row.supplier = row.counterparty;
    if (row.direction === "Cliente") row.client = row.counterparty;
    row.updatedAt = new Date().toISOString();
    return row;
  }
  function saveSafeRecord(row){
    ensureModule();
    row = sanitizeRecord(row);
    if (!labelOf(row) || labelOf(row) === "-") throw new Error("Inserisci cliente o fornitore.");
    if (!row.product) throw new Error("Inserisci prodotto.");
    if (!num(row.price)) throw new Error("Inserisci un prezzo valido.");
    var list = arr(state[MODULE]).map(sanitizeRecord);
    var index = list.findIndex(function(item){ return item.id === row.id; });
    if (index >= 0) list[index] = Object.assign({}, list[index], row);
    else list.unshift(row);
    state[MODULE] = list;
    saveImmediate();
  }
  function renderIfCurrent(){
    if (current && current.page === MODULE) {
      var content = document.getElementById("content");
      if (content) content.innerHTML = renderSafePage();
      bindSafePage();
      var title = document.getElementById("page-title");
      var subtitle = document.getElementById("page-subtitle");
      if (title) title.textContent = "Conferme prezzi";
      if (subtitle) subtitle.textContent = "Archivio stabile conferme cliente/fornitore";
      return true;
    }
    return false;
  }
  function bindSafePage(){
    document.querySelectorAll("[data-pms250-new]").forEach(function(btn){ btn.onclick = function(){ openSafeModal(); }; });
    document.querySelectorAll("[data-pms250-edit]").forEach(function(btn){ btn.onclick = function(){ openSafeModal(findRecord(btn.getAttribute("data-pms250-edit"))); }; });
    document.querySelectorAll("[data-pms250-delete]").forEach(function(btn){
      btn.onclick = function(){
        var id = btn.getAttribute("data-pms250-delete");
        if (!confirm("Eliminare questa conferma prezzo?")) return;
        state[MODULE] = arr(state[MODULE]).map(sanitizeRecord).filter(function(row){ return row.id !== id; });
        saveImmediate();
        renderIfCurrent();
      };
    });
    document.querySelectorAll("[data-pms250-search]").forEach(function(input){
      input.oninput = function(){ current.filters = current.filters || {}; current.filters.pms250PriceSearch = input.value; renderIfCurrent(); };
    });
    document.querySelectorAll("[data-pms250-direction]").forEach(function(select){
      select.onchange = function(){ current.filters = current.filters || {}; current.filters.pms250PriceDirection = select.value; renderIfCurrent(); };
    });
  }
  function wrapRender(){
    var original = window.render;
    if (typeof original !== "function" || original.__pms250SafePrice) return;
    var wrapped = function(){
      try {
        ensureModule();
        if (renderIfCurrent()) return true;
        return original.apply(this, arguments);
      } catch (error) {
        console.warn(VERSION + " render recovered", error);
        try {
          if (current) current.page = "dashboard";
          return original.apply(this, arguments);
        } catch (_) {
          return false;
        }
      }
    };
    wrapped.__pms250SafePrice = true;
    window.render = wrapped;
    try { render = wrapped; } catch (_) {}
  }
  function wrapSetPage(){
    var original = window.setPage;
    if (typeof original !== "function" || original.__pms250SafePrice) return;
    var wrapped = function(page){
      if (page === MODULE) {
        ensureModule();
        current.page = MODULE;
        document.querySelectorAll(".nav-button").forEach(function(btn){ btn.classList.toggle("active", btn.dataset.page === page); });
        renderIfCurrent();
        return true;
      }
      return original.apply(this, arguments);
    };
    wrapped.__pms250SafePrice = true;
    window.setPage = wrapped;
    try { setPage = wrapped; } catch (_) {}
  }
  function wrapOpenModal(){
    var original = window.openModal;
    if (typeof original === "function" && !original.__pms250SafePrice) {
      var wrapped = function(module, id){
        if (module === MODULE) {
          openSafeModal(findRecord(id));
          return true;
        }
        return original.apply(this, arguments);
      };
      wrapped.__pms250SafePrice = true;
      window.openModal = wrapped;
      try { openModal = wrapped; } catch (_) {}
    }
  }
  function wrapSubmitModal(){
    var original = window.submitModal;
    if (typeof original === "function" && !original.__pms250SafePrice) {
      var wrapped = function(event, module, id){
        if (module === MODULE) {
          if (event && event.preventDefault) event.preventDefault();
          var form = event && event.target;
          var data = {};
          if (form && form.elements) Array.prototype.forEach.call(form.elements, function(el){ if (el.name) data[el.name] = el.value; });
          data.id = id || data.id || uidSafe("LST");
          saveSafeRecord(data);
          try { if (typeof closeModal === "function") closeModal(); } catch (_) {}
          renderIfCurrent();
          return true;
        }
        return original.apply(this, arguments);
      };
      wrapped.__pms250SafePrice = true;
      window.submitModal = wrapped;
      try { submitModal = wrapped; } catch (_) {}
    }
  }
  function installCaptureHandlers(){
    document.addEventListener("click", function(event){
      var target = event.target && event.target.closest ? event.target.closest("[data-add],[data-pms240-new],[data-pms250-new],[data-pms250-close]") : null;
      if (!target) return;
      if (target.getAttribute("data-add") === MODULE || target.hasAttribute("data-pms240-new") || target.hasAttribute("data-pms250-new")) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();
        openSafeModal();
      } else if (target.hasAttribute("data-pms250-close")) {
        event.preventDefault();
        event.stopPropagation();
        closeSafeModal();
      }
    }, true);
    document.addEventListener("submit", function(event){
      if (!event.target || (event.target.id !== "pms250-form" && event.target.id !== "pms240-form")) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.stopImmediatePropagation) event.stopImmediatePropagation();
      try {
        saveSafeRecord(readSafeForm(event.target));
        closeSafeModal();
        renderIfCurrent();
      } catch (error) {
        alert(error.message || "Conferma prezzo non salvata.");
      }
    }, true);
  }
  function wrapImportBackup(){
    var original = window.importBackup;
    if (typeof original !== "function" || original.__pms250SafeBackup) return;
    var wrapped = function(file){
      var reader = new FileReader();
      reader.onload = function(){
        try {
          var parsed = JSON.parse(reader.result);
          var normalized = typeof normalizeState === "function" ? normalizeState(parsed) : parsed;
          state = ensureStateShape(normalized);
          current = current || {};
          current.filters = current.filters || {};
          current.page = "dashboard";
          saveImmediate();
          closeSafeModal();
          if (typeof renderNav === "function") renderNav();
          if (typeof render === "function") render();
          alert("Backup importato correttamente.");
        } catch (error) {
          console.warn(VERSION + " backup import failed", error);
          alert("File non valido o troppo pesante. Il gestionale resta aperto.");
        }
      };
      reader.onerror = function(){ alert("Impossibile leggere il file di backup."); };
      reader.readAsText(file);
    };
    wrapped.__pms250SafeBackup = true;
    window.importBackup = wrapped;
    try { importBackup = wrapped; } catch (_) {}
  }
  function install(){
    try {
      ensureModule();
      installCss();
      wrapRender();
      wrapSetPage();
      wrapOpenModal();
      wrapSubmitModal();
      wrapImportBackup();
      installCaptureHandlers();
      if (current && current.page === MODULE) renderIfCurrent();
      window.PMS_V250_SAFE_PRICE_CONFIRMATIONS_AND_BACKUP_LOAD = {
        version: VERSION,
        sanitizeState: function(){ state = ensureStateShape(state); saveImmediate(); },
        open: openSafeModal,
        render: renderIfCurrent
      };
      console.info(VERSION + " loaded");
    } catch (error) {
      console.warn(VERSION + " install skipped", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
