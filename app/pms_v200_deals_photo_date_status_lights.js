(function(){
  "use strict";

  var VERSION = "pms_v200_deals_photo_date_status_lights";
  var PAGE = "trattativeInCorso";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function num(value){
    var parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(value, currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function st(){
    window.state = window.state || {};
    window.state.negotiations = arr(window.state.negotiations);
    window.state.negotiationEvents = arr(window.state.negotiationEvents);
    window.state.intermediations = arr(window.state.intermediations);
    return window.state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow("v200-deals-photo-status");
      }
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function nextCode(prefix, list){
    if (typeof nextSequentialCode === "function") return nextSequentialCode(prefix, list || []);
    var year = new Date().getFullYear();
    var re = new RegExp("^" + prefix + "-" + year + "-(\\d+)$");
    var max = arr(list).reduce(function(result, item){
      [item && item.id, item && item.code, item && item.protocol].forEach(function(value){
        var match = String(value || "").match(re);
        if (match) result = Math.max(result, Number(match[1]));
      });
      return result;
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function itemId(item){ return String(item && (item.id || item.code || item.protocol || item.dealCode) || ""); }
  function findDeal(id){ return arr(st().negotiations).find(function(item){ return itemId(item) === String(id || ""); }); }
  function linkedSource(item){
    if (!item) return null;
    var id = item.sourceId || item.intermediationId || item.linkedDeal || item.dealId || item.id;
    return arr(st().intermediations).find(function(row){
      return String(row.id || row.code || row.protocol || "") === String(id || "");
    }) || null;
  }
  function dealDate(item){ return String(item && (item.date || item.dealDate || item.createdAt || "") || "").slice(0, 10); }
  function photoOf(item){ return item && (item.photoUrl || item.imageUrl || item.pictureUrl || item.photo || item.image) || ""; }
  function currentPriceOf(item){
    var source = linkedSource(item);
    return item && (item.currentPrice || item.basePrice || item.price || item.value || item.total) || source && (source.currentPrice || source.basePrice || source.price || source.value || source.total) || "";
  }
  function targetPriceOf(item){
    var source = linkedSource(item);
    return item && (item.targetPrice || item.desiredPrice || item.goalPrice) || source && (source.targetPrice || source.desiredPrice || source.goalPrice) || "";
  }
  function hasPrice(value){ return clean(value) !== "" && num(value) !== 0; }
  function priceDiff(item){
    var current = num(currentPriceOf(item));
    var target = num(targetPriceOf(item));
    if (!current || !target) return null;
    var diff = target - current;
    var pct = current ? diff / current * 100 : 0;
    return {current:current, target:target, diff:diff, pct:pct};
  }
  function priceBox(item){
    var currency = item && item.currency || "EUR";
    var currentRaw = currentPriceOf(item);
    var targetRaw = targetPriceOf(item);
    var diff = priceDiff(item);
    var rows = [];
    if (hasPrice(currentRaw)) rows.push('<span>Attuale <strong>' + esc(money(currentRaw, currency)) + '</strong></span>');
    if (hasPrice(targetRaw)) rows.push('<span>Target <strong>' + esc(money(targetRaw, currency)) + '</strong></span>');
    if (diff) {
      var cls = diff.diff >= 0 ? "up" : "down";
      rows.push('<span class="' + cls + '">Differenza <strong>' + esc(money(diff.diff, currency)) + ' (' + esc(diff.pct.toFixed(2)) + '%)</strong></span>');
    }
    return '<div class="pms200-pricebox">' + (rows.join("") || '<span>Target price <strong>-</strong></span>') + '</div>';
  }
  function statusInfo(status){
    var text = clean(status || "In corso");
    var low = text.toLowerCase();
    if (/accett|positiv|approvat|confermat|vint|firmat|ok/.test(low)) return {key:"accepted", label:text || "Accettata", color:"verde"};
    if (/chius|negativ|sospes|archiv|pers|rifiut|annull/.test(low)) return {key:"closed", label:text || "Chiusa", color:"rossa"};
    return {key:"progress", label:text || "In corso", color:"gialla"};
  }
  function isArchivedDeal(item){
    var key = statusInfo(item && (item.status || item.stage)).key;
    return key === "accepted" || key === "closed";
  }
  function statusLamp(status){
    var info = statusInfo(status);
    return '<span class="pms200-status pms200-' + esc(info.key) + '"><i></i><span>' + esc(info.label) + '</span></span>';
  }
  function thumb(item){
    var src = photoOf(item);
    return '<div class="pms200-thumb">' + (src ? '<img src="' + esc(src) + '" alt="Foto trattativa">' : '<span>Foto</span>') + '</div>';
  }
  function header(title, code, subtitle){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, subtitle || "");
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>PARMITALIA DISTRIBUTION SRL</strong><br><span>' + esc(subtitle || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code);
    if (typeof renderQrLite === "function") return renderQrLite(code);
    return '<strong>' + esc(code || "") + '</strong>';
  }
  function eventsFor(id){
    return arr(st().negotiationEvents).filter(function(event){ return String(event.dealId || "") === String(id || ""); }).sort(function(a,b){
      return String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || ""));
    });
  }

  function injectCss(){
    var style = document.getElementById("pms-v200-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v200-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms200-page,.pms200-modal,.pms200-print{direction:ltr!important;text-align:left!important;unicode-bidi:isolate}",
      ".pms200-page{display:grid;gap:14px;color:#172033}",
      ".pms200-hero{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;background:#f8fafc;border:1px solid #d7dee8;border-radius:8px;padding:15px}",
      ".pms200-hero h3{margin:2px 0 6px;font-size:21px;line-height:1.18;color:#0f172a}.pms200-hero p{margin:0;color:#475569;line-height:1.4}",
      ".pms200-actions,.pms200-row-actions{direction:ltr!important;display:flex;flex-wrap:wrap;gap:7px;align-items:center;justify-content:flex-end;text-align:right}.pms200-actions button,.pms200-row-actions button{width:auto!important;margin:0!important}",
      ".pms200-card{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:13px;min-width:0}.pms200-card h3{margin:0 0 9px;color:#0f172a}",
      ".pms200-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}.pms200-kpi{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:11px}.pms200-kpi span{display:block;color:#64748b;font-size:11px;font-weight:900;text-transform:uppercase}.pms200-kpi strong{display:block;color:#0f172a;font-size:20px;margin-top:4px}",
      ".pms200-table{direction:ltr!important;width:100%;overflow:auto;border:1px solid #d7dee8;border-radius:8px;background:#fff}.pms200-table table{direction:ltr!important;width:100%;min-width:1120px;border-collapse:collapse;margin:0}.pms200-table th,.pms200-table td{direction:ltr!important;padding:8px 9px;border-bottom:1px solid #e5edf5;vertical-align:middle;text-align:left}.pms200-table th{background:#eef2f7;text-align:left;font-size:12px;color:#253447}.pms200-table th:last-child,.pms200-table td:last-child{text-align:right!important}",
      ".pms200-thumb{width:58px;height:46px;border:1px solid #cbd5e1;border-radius:6px;background:#f8fafc;display:grid;place-items:center;overflow:hidden;color:#64748b;font-size:10px;font-weight:900}.pms200-thumb img{width:100%;height:100%;object-fit:cover;display:block}",
      ".pms200-status{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:4px 9px;border:1px solid #cbd5e1;background:#fff;font-size:12px;font-weight:900;white-space:nowrap}.pms200-status i{width:11px;height:11px;border-radius:50%;display:inline-block;animation:pms200-blink 1s infinite;box-shadow:0 0 0 0 rgba(0,0,0,.2)}.pms200-progress{color:#854d0e;border-color:#fde68a;background:#fffbeb}.pms200-progress i{background:#facc15;box-shadow:0 0 10px rgba(250,204,21,.85)}.pms200-accepted{color:#166534;border-color:#86efac;background:#f0fdf4}.pms200-accepted i{background:#22c55e;box-shadow:0 0 10px rgba(34,197,94,.85)}.pms200-closed{color:#991b1b;border-color:#fecaca;background:#fef2f2}.pms200-closed i{background:#ef4444;box-shadow:0 0 10px rgba(239,68,68,.85)}",
      ".pms200-pricebox{display:grid;gap:3px;min-width:160px;color:#334155;font-size:11px;line-height:1.2}.pms200-pricebox span{display:flex;justify-content:space-between;gap:8px;white-space:nowrap}.pms200-pricebox strong{color:#0f172a}.pms200-pricebox .up strong{color:#166534}.pms200-pricebox .down strong{color:#b42318}",
      "@keyframes pms200-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.32;transform:scale(.72)}}",
      ".pms200-modal-backdrop{position:fixed;inset:0;z-index:30000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms200-modal{width:min(1080px,96vw);max-height:92vh;overflow:auto;background:#fff;border-radius:8px;border:1px solid #d7dee8;box-shadow:0 24px 74px rgba(15,23,42,.34)}.pms200-modal-head{direction:ltr!important;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 15px;border-bottom:1px solid #e2e8f0;position:sticky;top:0;background:#fff;z-index:2}.pms200-modal-head h3{margin:0;color:#0f172a}.pms200-modal-body{direction:ltr!important;text-align:left!important;padding:15px}.pms200-modal-actions{direction:ltr!important;display:flex;justify-content:flex-end;gap:8px;padding:12px 15px;border-top:1px solid #e2e8f0;position:sticky;bottom:0;background:#fff}.pms200-modal-actions button,.pms200-modal-head button{width:auto!important;margin:0!important}",
      ".pms200-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.pms200-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:#64748b}.pms200-form input,.pms200-form select,.pms200-form textarea{min-width:0}.pms200-form .half{grid-column:span 2}.pms200-form .full{grid-column:1/-1}.pms200-form textarea{min-height:130px;line-height:1.4}.pms200-photo-row{display:grid;grid-template-columns:120px minmax(0,1fr);gap:12px;align-items:start}.pms200-photo-preview{width:120px;height:90px;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;display:grid;place-items:center;overflow:hidden;color:#64748b;font-weight:900}.pms200-photo-preview img{width:100%;height:100%;object-fit:cover}",
      ".pms200-view-grid{display:grid;grid-template-columns:160px minmax(0,1fr);gap:14px}.pms200-view-photo{width:160px;min-height:120px;border:1px solid #cbd5e1;border-radius:7px;background:#f8fafc;display:grid;place-items:center;overflow:hidden;color:#64748b;font-weight:900}.pms200-view-photo img{width:100%;height:100%;object-fit:cover}.pms200-body{white-space:pre-wrap;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:11px;line-height:1.42;color:#172033}",
      "#print-root .pms200-print-photo{width:42mm;height:30mm;border:1px solid #cbd5e1;object-fit:cover;float:right;margin:0 0 4mm 5mm}",
      "@media(max-width:880px){.pms200-hero,.pms200-view-grid,.pms200-photo-row{display:grid;grid-template-columns:1fr}.pms200-form{grid-template-columns:1fr}.pms200-form .half{grid-column:1/-1}.pms200-table table{min-width:980px}}"
    ].join("\n");
  }

  function modal(title, body, onSave){
    document.querySelectorAll(".pms200-modal-backdrop,.pms172-modal-backdrop,#pms103-modal").forEach(function(node){ node.remove(); });
    var wrap = document.createElement("div");
    wrap.className = "pms200-modal-backdrop";
    wrap.innerHTML = '<div class="pms200-modal"><div class="pms200-modal-head"><h3>' + esc(title) + '</h3><button type="button" class="secondary-button" data-pms200-close>Chiudi</button></div><div class="pms200-modal-body">' + body + '</div><div class="pms200-modal-actions"><button type="button" class="secondary-button" data-pms200-close>Annulla</button>' + (onSave ? '<button type="button" class="primary-button" data-pms200-save>Salva</button>' : "") + '</div></div>';
    document.body.appendChild(wrap);
    wrap.addEventListener("click", function(event){
      if (event.target === wrap || event.target.closest("[data-pms200-close]")) wrap.remove();
      if (onSave && event.target.closest("[data-pms200-save]")) onSave(wrap);
    });
    return wrap;
  }
  function statusOptions(selected){
    var values = ["In corso","Accettata","Chiusa","Aperta","In trattativa","Campionatura","Offerta inviata","In attesa risposta","Positiva","Negativa","Sospesa"];
    var current = clean(selected || "In corso");
    if (values.indexOf(current) < 0) values.unshift(current);
    return values.map(function(value){ return '<option value="' + esc(value) + '"' + (value === current ? " selected" : "") + '>' + esc(value) + '</option>'; }).join("");
  }
  function currencyOptions(selected){
    return ["EUR","RON","USD"].map(function(value){ return '<option value="' + value + '"' + (value === (selected || "EUR") ? " selected" : "") + '>' + value + '</option>'; }).join("");
  }
  function formHtml(deal){
    var d = deal || {};
    var id = itemId(d) || nextCode("TRT", st().negotiations);
    var src = photoOf(d);
    return '<div class="pms200-form">' +
      '<label>Protocollo<input name="id" value="' + esc(id) + '" readonly></label>' +
      '<label>Data trattativa<input type="date" name="date" value="' + esc(dealDate(d) || today()) + '"></label>' +
      '<label>Stato luce<select name="status">' + statusOptions(d.status) + '</select></label>' +
      '<label>Priorita<select name="priority">' + ["Alta","Media","Bassa"].map(function(value){ return '<option' + (value === (d.priority || "Media") ? " selected" : "") + '>' + value + '</option>'; }).join("") + '</select></label>' +
      '<label class="half">Cliente<input name="client" value="' + esc(d.client || "") + '"></label>' +
      '<label class="half">Fornitore<input name="supplier" value="' + esc(d.supplier || "") + '"></label>' +
      '<label class="half">Prodotto<input name="product" value="' + esc(d.product || d.productName || "") + '"></label>' +
      '<label>Fase<input name="stage" value="' + esc(d.stage || "Primo contatto") + '"></label>' +
      '<label>Valore stimato<input type="number" name="value" value="' + esc(d.value || d.price || d.total || 0) + '"></label>' +
      '<label>Valuta<select name="currency">' + currencyOptions(d.currency) + '</select></label>' +
      '<label>Probabilita %<input type="number" name="probability" value="' + esc(d.probability || 50) + '"></label>' +
      '<label>Responsabile<input name="owner" value="' + esc(d.owner || d.responsible || (window.current && current.user) || "Carlo") + '"></label>' +
      '<label>Prezzo attuale<input type="number" step="0.01" name="currentPrice" value="' + esc(currentPriceOf(d)) + '"></label>' +
      '<label>Target price<input type="number" step="0.01" name="targetPrice" value="' + esc(targetPriceOf(d)) + '"></label>' +
      '<label class="half">Prossima azione<input name="nextAction" value="' + esc(d.nextAction || "") + '"></label>' +
      '<label>Data prossima azione<input type="date" name="nextDate" value="' + esc(String(d.nextDate || "").slice(0, 10)) + '"></label>' +
      '<div class="full pms200-photo-row"><div class="pms200-photo-preview" data-pms200-photo-preview>' + (src ? '<img src="' + esc(src) + '" alt="Foto trattativa">' : '<span>Foto</span>') + '</div><div class="pms200-form"><label class="full">Carica foto / immagine<input type="file" accept="image/*" data-pms200-photo-file></label><label class="full">Oppure URL immagine<input name="photoUrl" value="' + esc(src) + '" placeholder="https://..."></label></div></div>' +
      '<label class="full">Riepilogo trattativa<textarea name="summary">' + esc(d.summary || d.notes || d.description || "") + '</textarea></label>' +
    '</div>';
  }
  function readForm(wrap, base){
    var item = Object.assign({}, base || {});
    wrap.querySelectorAll("[name]").forEach(function(node){ item[node.name] = node.value; });
    item.id = item.id || nextCode("TRT", st().negotiations);
    item.date = item.date || today();
    item.dealDate = item.date;
    item.currentPrice = clean(item.currentPrice || "");
    item.targetPrice = clean(item.targetPrice || "");
    if (!item.value && item.currentPrice) item.value = item.currentPrice;
    if (!item.price && item.currentPrice) item.price = item.currentPrice;
    item.photoUrl = clean(item.photoUrl || "");
    item.updatedAt = new Date().toISOString();
    item.createdAt = item.createdAt || item.updatedAt;
    return item;
  }
  function compressImage(file){
    return new Promise(function(resolve, reject){
      if (!file) return resolve("");
      var reader = new FileReader();
      reader.onerror = function(){ reject(reader.error); };
      reader.onload = function(){
        var img = new Image();
        img.onerror = function(){ resolve(String(reader.result || "")); };
        img.onload = function(){
          var max = 900;
          var scale = Math.min(1, max / Math.max(img.width || 1, img.height || 1));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round((img.width || 1) * scale));
          canvas.height = Math.max(1, Math.round((img.height || 1) * scale));
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.src = String(reader.result || "");
      };
      reader.readAsDataURL(file);
    });
  }
  function bindPhotoPreview(wrap){
    var input = wrap.querySelector("[data-pms200-photo-file]");
    var preview = wrap.querySelector("[data-pms200-photo-preview]");
    var url = wrap.querySelector('[name="photoUrl"]');
    if (!input || !preview) return;
    input.onchange = function(){
      var file = input.files && input.files[0];
      if (!file) return;
      compressImage(file).then(function(dataUrl){
        if (url) url.value = dataUrl;
        preview.innerHTML = '<img src="' + esc(dataUrl) + '" alt="Foto trattativa">';
      }).catch(function(error){ console.warn(VERSION + " photo preview failed", error); });
    };
  }
  function editDeal(id){
    var old = id ? findDeal(id) : null;
    var wrap = modal(old ? "Modifica trattativa " + itemId(old) : "Nuova trattativa", formHtml(old), function(modalNode){
      var file = modalNode.querySelector("[data-pms200-photo-file]") && modalNode.querySelector("[data-pms200-photo-file]").files && modalNode.querySelector("[data-pms200-photo-file]").files[0];
      Promise.resolve(file ? compressImage(file) : "").then(function(dataUrl){
        var item = readForm(modalNode, old || {});
        if (dataUrl) item.photoUrl = dataUrl;
        var list = st().negotiations;
        var index = list.findIndex(function(row){ return itemId(row) === itemId(item); });
        if (index >= 0) list[index] = item;
        else list.unshift(item);
        saveNow();
        modalNode.remove();
        if (typeof render === "function") render();
      }).catch(function(error){
        console.warn(VERSION + " photo save failed", error);
        alert("Foto non caricata correttamente. Riprova con un'immagine piu' leggera.");
      });
    });
    bindPhotoPreview(wrap);
  }
  function addEvent(id){
    var body = '<div class="pms200-form"><label>Trattativa<input name="dealId" value="' + esc(id) + '" readonly></label><label>Data<input type="datetime-local" name="date" value="' + esc(new Date().toISOString().slice(0,16)) + '"></label><label>Tipo<select name="type"><option>Telefonata</option><option>Email</option><option>WhatsApp</option><option>Incontro</option><option>Offerta</option><option>Campione</option><option>Decisione</option><option>Nota interna</option></select></label><label>Operatore<input name="actor" value="' + esc((window.current && current.user) || "Carlo") + '"></label><label class="full">Evento<textarea name="text"></textarea></label><label class="full">Esito / prossima mossa<textarea name="result"></textarea></label></div>';
    modal("Evento trattativa", body, function(wrap){
      var event = {};
      wrap.querySelectorAll("[name]").forEach(function(node){ event[node.name] = node.value; });
      event.id = nextCode("EVT", st().negotiationEvents);
      event.createdAt = new Date().toISOString();
      st().negotiationEvents.unshift(event);
      var deal = findDeal(id);
      if (deal && event.result) deal.nextAction = event.result;
      saveNow();
      wrap.remove();
      if (typeof render === "function") render();
    });
  }
  function printButtons(id){
    return '<button class="secondary-button" data-pms200-deal-print-client="' + esc(id) + '">PDF cliente</button><button class="secondary-button" data-pms200-deal-print-supplier="' + esc(id) + '">PDF fornitore</button><button class="primary-button" data-pms200-deal-print-internal="' + esc(id) + '">PDF interno</button>';
  }
  function deleteDeal(id){
    var d = findDeal(id);
    if (!d) return alert("Trattativa non trovata.");
    var label = [itemId(d), d.client, d.product || d.productName].filter(Boolean).join(" - ");
    if (!confirm("Eliminare definitivamente questa trattativa?\n\n" + label)) return;
    state.negotiations = arr(st().negotiations).filter(function(item){ return itemId(item) !== String(id || ""); });
    state.negotiationEvents = arr(st().negotiationEvents).filter(function(event){ return String(event.dealId || "") !== String(id || ""); });
    saveNow();
    document.querySelectorAll(".pms200-modal-backdrop,.pms172-modal-backdrop,#pms103-modal").forEach(function(node){ node.remove(); });
    if (typeof render === "function") render();
  }
  function viewDeal(id){
    var d = findDeal(id);
    if (!d) return alert("Trattativa non trovata.");
    var photo = photoOf(d);
    var events = eventsFor(id).map(function(event){
      return '<div class="pms200-body" style="margin-top:7px"><strong>' + esc(event.type || "Evento") + ' - ' + esc(event.date || event.createdAt || "") + '</strong><br>' + esc(event.text || "") + '<br><small>' + esc(event.actor || "") + (event.result ? " - " + esc(event.result) : "") + '</small></div>';
    }).join("");
    modal("Trattativa " + itemId(d), '<div class="pms200-actions" style="margin-bottom:10px"><button class="secondary-button" data-pms200-deal-edit="' + esc(id) + '">Modifica</button><button class="secondary-button" data-pms200-deal-event="' + esc(id) + '">Evento</button>' + printButtons(id) + '<button class="inline-danger" data-pms200-deal-delete="' + esc(id) + '">Elimina</button></div><div class="pms200-view-grid"><div class="pms200-view-photo">' + (photo ? '<img src="' + esc(photo) + '" alt="Foto trattativa">' : '<span>Foto</span>') + '</div><div><table class="print-table"><tr><th>Data</th><td>' + esc(dealDate(d) || "-") + '</td><th>Stato</th><td>' + statusLamp(d.status) + '</td></tr><tr><th>Cliente</th><td>' + esc(d.client || "-") + '</td><th>Fornitore</th><td>' + esc(d.supplier || "-") + '</td></tr><tr><th>Prodotto</th><td>' + esc(d.product || d.productName || "-") + '</td><th>Valore</th><td>' + money(d.value || d.price || d.total, d.currency) + '</td></tr><tr><th>Prezzi</th><td colspan="3">' + priceBox(d) + '</td></tr><tr><th>Fase</th><td>' + esc(d.stage || "-") + '</td><th>Prossima azione</th><td>' + esc(d.nextAction || "-") + '</td></tr></table></div></div><h4>Riepilogo</h4><div class="pms200-body">' + esc(d.summary || d.notes || d.description || "-") + '</div><h4>Eventi</h4>' + (events || '<div class="pms200-body">Nessun evento registrato.</div>'));
  }
  function printHtml(d, mode){
    var id = itemId(d);
    var photo = photoOf(d);
    var kind = mode === "client" ? "cliente" : mode === "supplier" ? "fornitore" : "interno";
    var internal = kind === "interno";
    var events = eventsFor(id).map(function(event){ return '<tr><td>' + esc(event.date || event.createdAt || "") + '</td><td>' + esc(event.type || "") + '</td><td>' + esc(event.actor || "") + '</td><td>' + esc(event.text || "") + '</td><td>' + esc(event.result || "") + '</td></tr>'; }).join("");
    var title = internal ? "SCHEDA TRATTATIVA INTERNA" : kind === "cliente" ? "SCHEDA TRATTATIVA CLIENTE" : "SCHEDA TRATTATIVA FORNITORE";
    var partyRows = kind === "cliente"
      ? '<tr><th>Cliente</th><td>' + esc(d.client || "-") + '</td><th>Prodotto</th><td>' + esc(d.product || d.productName || "-") + '</td></tr>'
      : kind === "fornitore"
        ? '<tr><th>Fornitore</th><td>' + esc(d.supplier || "-") + '</td><th>Prodotto</th><td>' + esc(d.product || d.productName || "-") + '</td></tr>'
        : '<tr><th>Cliente</th><td>' + esc(d.client || "-") + '</td><th>Fornitore</th><td>' + esc(d.supplier || "-") + '</td></tr><tr><th>Prodotto</th><td>' + esc(d.product || d.productName || "-") + '</td><th>Fase</th><td>' + esc(d.stage || "-") + '</td></tr>';
    var publicRows = '<tr><th>Data trattativa</th><td>' + esc(dealDate(d) || "-") + '</td><th>Stato</th><td>' + esc(d.status || "In corso") + '</td></tr>' + partyRows + '<tr><th>Prossima azione</th><td colspan="3">' + esc(d.nextAction || "-") + '</td></tr>';
    var internalRows = '<tr><th>Valore</th><td>' + money(d.value || d.price || d.total, d.currency) + '</td><th>Probabilita</th><td>' + esc(d.probability || 0) + '%</td></tr><tr><th>Prezzo attuale</th><td>' + esc(hasPrice(currentPriceOf(d)) ? money(currentPriceOf(d), d.currency) : "-") + '</td><th>Target price</th><td>' + esc(hasPrice(targetPriceOf(d)) ? money(targetPriceOf(d), d.currency) : "-") + '</td></tr><tr><th>Differenza target</th><td colspan="3">' + priceBox(d) + '</td></tr><tr><th>Responsabile</th><td>' + esc(d.owner || d.responsible || "-") + '</td><th>Uso documento</th><td>Interno Parmitalia</td></tr>';
    return '<div class="print-document pms200-print pms200-print-' + esc(kind) + '">' + header(title, id, internal ? "Completa con target, differenze ed eventi" : "Documento PDF per " + kind) + (photo && internal ? '<img class="pms200-print-photo" src="' + esc(photo) + '" alt="Foto trattativa">' : "") + '<table class="print-table">' + publicRows + (internal ? internalRows : "") + '</table><h3>Riepilogo</h3><div class="pms200-body">' + esc(d.summary || d.notes || d.description || "-") + '</div>' + (internal ? '<h3>Registro eventi</h3><table class="print-table"><thead><tr><th>Data</th><th>Tipo</th><th>Operatore</th><th>Evento</th><th>Esito</th></tr></thead><tbody>' + (events || '<tr><td colspan="5">Nessun evento.</td></tr>') + '</tbody></table>' : "") + '<div>' + barcode(id) + '</div><div class="print-footer">PDF ' + esc(kind) + ' - Trattativa ' + esc(id) + '</div></div>';
  }
  function printDeal(id, mode){
    var d = findDeal(id);
    if (!d) return alert("Trattativa non trovata.");
    if (typeof openPrint === "function") openPrint(printHtml(d, mode || "internal"));
  }
  function row(d){
    var id = itemId(d);
    return '<tr><td>' + thumb(d) + '</td><td><span class="code-block">' + esc(id) + '</span></td><td><strong>' + esc(dealDate(d) || "-") + '</strong></td><td><strong>' + esc(d.client || "-") + '</strong><br><small>' + esc(d.supplier || "") + '</small></td><td>' + esc(d.product || d.productName || "-") + '</td><td>' + esc(d.stage || "-") + '</td><td>' + statusLamp(d.status) + '</td><td>' + priceBox(d) + '</td><td>' + esc(d.nextAction || "-") + '<br><small>' + esc(String(d.nextDate || "").slice(0, 10)) + '</small></td><td><div class="pms200-row-actions"><button class="inline-button" data-pms200-deal-view="' + esc(id) + '">Vedi</button><button class="inline-button" data-pms200-deal-edit="' + esc(id) + '">Modifica</button><button class="inline-button" data-pms200-deal-event="' + esc(id) + '">Evento</button><button class="inline-button" data-pms200-deal-print-client="' + esc(id) + '">PDF cliente</button><button class="inline-button" data-pms200-deal-print-supplier="' + esc(id) + '">PDF fornitore</button><button class="inline-button" data-pms200-deal-print-internal="' + esc(id) + '">PDF interno</button><button class="inline-danger" data-pms200-deal-delete="' + esc(id) + '">Elimina</button></div></td></tr>';
  }
  function table(title, rows, empty){
    return '<div class="pms200-card"><h3>' + esc(title) + '</h3><div class="pms200-table"><table><thead><tr><th>Foto</th><th>Protocollo</th><th>Data</th><th>Cliente / Fornitore</th><th>Prodotto</th><th>Fase</th><th>Luce stato</th><th>Target price</th><th>Prossima azione</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="10" class="empty">' + esc(empty) + '</td></tr>') + '</tbody></table></div></div>';
  }
  function renderDeals(){
    st();
    injectCss();
    var open = arr(state.negotiations).filter(function(item){ return !isArchivedDeal(item); });
    var archived = arr(state.negotiations).filter(isArchivedDeal);
    var accepted = arr(state.negotiations).filter(function(item){ return statusInfo(item.status).key === "accepted"; }).length;
    var closed = arr(state.negotiations).filter(function(item){ return statusInfo(item.status).key === "closed"; }).length;
    var withPhotos = arr(state.negotiations).filter(function(item){ return !!photoOf(item); }).length;
    return '<div class="pms200-page"><section class="pms200-hero"><div><span>TRT</span><h3>Trattative in corso</h3><p>Registro trattative con data, foto e luce stato: gialla in corso, verde accettata, rossa chiusa.</p></div><div class="pms200-actions"><button class="primary-button" data-pms200-deal-new>Nuova trattativa</button><button class="secondary-button" data-pms200-scroll-archive>Storico</button><button class="secondary-button" data-pms200-print-history>Stampa registro</button></div></section><div class="pms200-kpis"><div class="pms200-kpi"><span>In corso</span><strong>' + open.length + '</strong></div><div class="pms200-kpi"><span>Accettate</span><strong>' + accepted + '</strong></div><div class="pms200-kpi"><span>Chiuse</span><strong>' + closed + '</strong></div><div class="pms200-kpi"><span>Con foto</span><strong>' + withPhotos + '</strong></div></div>' + table("Trattative aperte", open.map(row).join(""), "Nessuna trattativa aperta.") + '<div id="pms200-deal-archive">' + table("Storico accettate / chiuse", archived.map(row).join(""), "Nessuna trattativa nello storico.") + '</div></div>';
  }
  function printHistory(){
    var rows = arr(st().negotiations).map(function(d){ return '<tr><td>' + esc(itemId(d)) + '</td><td>' + esc(dealDate(d) || "-") + '</td><td>' + esc(d.client || "-") + '</td><td>' + esc(d.product || d.productName || "-") + '</td><td>' + esc(d.status || "In corso") + '</td><td>' + esc(hasPrice(currentPriceOf(d)) ? money(currentPriceOf(d), d.currency) : "-") + '</td><td>' + esc(hasPrice(targetPriceOf(d)) ? money(targetPriceOf(d), d.currency) : "-") + '</td><td>' + esc(d.nextAction || "-") + '</td></tr>'; }).join("");
    if (typeof openPrint === "function") openPrint('<div class="print-document pms200-print">' + header("REGISTRO TRATTATIVE", "TRT-" + today(), "Aperte, accettate e chiuse") + '<table class="print-table"><thead><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Prodotto</th><th>Stato</th><th>Prezzo attuale</th><th>Target price</th><th>Prossima azione</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8">Nessuna trattativa.</td></tr>') + '</tbody></table><div class="print-footer">Registro trattative Parmitalia</div></div>');
  }
  function bind(){
    injectCss();
    document.querySelectorAll("[data-pms200-deal-new]").forEach(function(button){ button.onclick = function(){ editDeal(); }; });
    document.querySelectorAll("[data-pms200-deal-view]").forEach(function(button){ button.onclick = function(){ viewDeal(button.getAttribute("data-pms200-deal-view")); }; });
    document.querySelectorAll("[data-pms200-deal-edit]").forEach(function(button){ button.onclick = function(){ editDeal(button.getAttribute("data-pms200-deal-edit")); }; });
    document.querySelectorAll("[data-pms200-deal-event]").forEach(function(button){ button.onclick = function(){ addEvent(button.getAttribute("data-pms200-deal-event")); }; });
    document.querySelectorAll("[data-pms200-deal-print-client]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms200-deal-print-client"), "client"); }; });
    document.querySelectorAll("[data-pms200-deal-print-supplier]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms200-deal-print-supplier"), "supplier"); }; });
    document.querySelectorAll("[data-pms200-deal-print-internal]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms200-deal-print-internal"), "internal"); }; });
    document.querySelectorAll("[data-pms200-deal-print]").forEach(function(button){ button.onclick = function(){ printDeal(button.getAttribute("data-pms200-deal-print"), "internal"); }; });
    document.querySelectorAll("[data-pms200-deal-delete]").forEach(function(button){ button.onclick = function(){ deleteDeal(button.getAttribute("data-pms200-deal-delete")); }; });
    document.querySelectorAll("[data-pms200-scroll-archive]").forEach(function(button){ button.onclick = function(){ var target = document.getElementById("pms200-deal-archive"); if (target) target.scrollIntoView({behavior:"smooth", block:"start"}); }; });
    document.querySelectorAll("[data-pms200-print-history]").forEach(function(button){ button.onclick = printHistory; });
  }
  function install(){
    injectCss();
    if (typeof render === "function" && !render.__pms200Wrapped) {
      var baseRender = render;
      render = function(){
        st();
        if (window.current && current.page === PAGE) {
          var content = document.getElementById("content");
          var title = document.getElementById("page-title");
          var subtitle = document.getElementById("page-subtitle");
          if (title) title.textContent = "Trattative in corso";
          if (subtitle) subtitle.textContent = "Data, foto, stato luminoso e storico trattative";
          if (content) {
            content.innerHTML = renderDeals();
            bind();
            return;
          }
        }
        var result = baseRender.apply(this, arguments);
        setTimeout(bind, 40);
        return result;
      };
      render.__pms200Wrapped = true;
    }
    if (typeof bindPageActions === "function" && !bindPageActions.__pms200Wrapped) {
      var baseBind = bindPageActions;
      bindPageActions = function(){
        var result = baseBind.apply(this, arguments);
        bind();
        return result;
      };
      bindPageActions.__pms200Wrapped = true;
    }
    bind();
    window.PMS_V200_DEALS_PHOTO_DATE_STATUS_LIGHTS = {version:VERSION, editDeal:editDeal, printDeal:printDeal, renderDeals:renderDeals};
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, {once:true});
  else install();
  [120, 400, 900, 1600].forEach(function(ms){ setTimeout(install, ms); });
  console.info(VERSION + " loaded");
})();
