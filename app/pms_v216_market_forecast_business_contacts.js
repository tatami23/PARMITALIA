(function(){
  "use strict";

  var VERSION = "pms_v216_market_forecast_business_contacts";
  var BUSINESS_MODULE = "businessContacts";
  var STYLE_ID = "pms-v216-style";
  var MARKET_BOX_ID = "pms216-market-additions";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).replace(/\s+/g, " ").trim(); }
  function norm(value){ return clean(value).toLowerCase(); }
  function num(value){
    var parsed = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char];
    });
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function uid216(prefix){
    if (typeof uid === "function") return uid(prefix);
    return prefix + "-" + Date.now().toString(36).toUpperCase();
  }
  function stateSafe(){
    window.state = window.state || {};
    state.marketPreview52 = arr(state.marketPreview52);
    state.marketTrends = arr(state.marketTrends);
    state.marketForecast56 = arr(state.marketForecast56);
    state[BUSINESS_MODULE] = arr(state[BUSINESS_MODULE]);
    current.filters = current.filters || {};
    return state;
  }
  function saveNow(reason){
    try {
      if (typeof save === "function") save();
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") {
        window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      }
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }

  var MARKET_ROWS = [
    {id:"PMS216-MILK-RO", group:"Milk", name:"Latte Romania", market:"Romania", unit:"EUR/100 kg", y2024:43.20, y2025:45.80, y2026:48.10, source:"Base operativa interna Romania - aggiornare con CLAL/listini reali"},
    {id:"PMS216-MILK-RO-FARM", group:"Milk", name:"Latte alla stalla Romania", market:"Romania", unit:"EUR/100 kg", y2024:41.90, y2025:44.60, y2026:46.90, source:"Base operativa interna stalla Romania - aggiornare con fonti reali"},
    {id:"PMS216-MILK-EE", group:"Milk", name:"Latte Est Europa", market:"Est Europa", unit:"EUR/100 kg", y2024:42.40, y2025:44.90, y2026:47.20, source:"Media operativa Est Europa - aggiornare con fonti reali"},
    {id:"PMS216-EMM-DE", group:"Cheese", name:"Emmental Germania", market:"Germania", unit:"EUR/kg", y2024:5.18, y2025:5.54, y2026:5.92, source:"Base operativa interna formaggi Germania"},
    {id:"PMS216-EMM-FR", group:"Cheese", name:"Emmental Francia", market:"Francia", unit:"EUR/kg", y2024:5.28, y2025:5.63, y2026:6.04, source:"Base operativa interna formaggi Francia"},
    {id:"PMS216-EMM-EE", group:"Cheese", name:"Emmental Est Europa", market:"Est Europa", unit:"EUR/kg", y2024:4.96, y2025:5.31, y2026:5.68, source:"Base operativa interna formaggi Est Europa"},
    {id:"PMS216-GOUDA-DE", group:"Cheese", name:"Gouda Germania", market:"Germania", unit:"EUR/kg", y2024:4.72, y2025:5.04, y2026:5.36, source:"Base operativa interna formaggi Germania"},
    {id:"PMS216-GOUDA-FR", group:"Cheese", name:"Gouda Francia", market:"Francia", unit:"EUR/kg", y2024:4.86, y2025:5.18, y2026:5.49, source:"Base operativa interna formaggi Francia"},
    {id:"PMS216-GOUDA-EE", group:"Cheese", name:"Gouda Est Europa", market:"Est Europa", unit:"EUR/kg", y2024:4.48, y2025:4.82, y2026:5.14, source:"Base operativa interna formaggi Est Europa"},
    {id:"PMS216-REIBE-DE", group:"Cheese", name:"Reibekaese Germania", market:"Germania", unit:"EUR/kg", y2024:4.92, y2025:5.28, y2026:5.64, source:"Base operativa interna Reibekaese / formaggio grattugiato Germania"},
    {id:"PMS216-REIBE-FR", group:"Cheese", name:"Reibekaese Francia", market:"Francia", unit:"EUR/kg", y2024:5.05, y2025:5.39, y2026:5.76, source:"Base operativa interna Reibekaese / formaggio grattugiato Francia"},
    {id:"PMS216-REIBE-EE", group:"Cheese", name:"Reibekaese Est Europa", market:"Est Europa", unit:"EUR/kg", y2024:4.63, y2025:4.98, y2026:5.31, source:"Base operativa interna Reibekaese / formaggio grattugiato Est Europa"}
  ];

  function ensureMarketRows(){
    stateSafe();
    var changed = false;
    MARKET_ROWS.forEach(function(row){
      var preview = Object.assign({}, row);
      var pIndex = state.marketPreview52.findIndex(function(item){
        return clean(item.id) === row.id || norm(item.name) === norm(row.name);
      });
      if (pIndex >= 0) {
        var merged = Object.assign({}, state.marketPreview52[pIndex], preview);
        if (JSON.stringify(merged) !== JSON.stringify(state.marketPreview52[pIndex])) {
          state.marketPreview52[pIndex] = merged;
          changed = true;
        }
      } else {
        state.marketPreview52.push(preview);
        changed = true;
      }
      [["2024", row.y2024], ["2025", row.y2025], ["2026", row.y2026]].forEach(function(pair){
        var year = pair[0];
        var price = pair[1];
        var id = row.id + "-" + year;
        var existing = state.marketTrends.find(function(item){
          return clean(item.id) === id || (clean(item.product) === row.name && String(item.date || "").slice(0,4) === year && clean(item.market) === row.market);
        });
        var trend = {
          id:id,
          date:year + "-12-31",
          source:"Parmitalia base interna",
          category:row.group === "Milk" ? "Latte / Milk" : "Formaggi / Cheese",
          product:row.name,
          market:row.market,
          price:price,
          currency:"EUR",
          unit:row.unit,
          note:"PMS216 base storico-previsionale; sostituire quando arriva quotazione reale"
        };
        if (existing) {
          Object.keys(trend).forEach(function(key){ existing[key] = trend[key]; });
        } else {
          state.marketTrends.push(trend);
        }
      });
    });
    if (changed) saveNow("v216-market-additions");
  }

  function addBusinessModule(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    var found = modules.find(function(item){ return item.id === BUSINESS_MODULE; });
    if (found) {
      found.label = "Contatti affari";
      found.subtitle = "Nomi, proposte e stato commerciale";
      found.roles = ["admin","assistant","accountant"];
      return;
    }
    var index = modules.findIndex(function(item){ return item.id === "contacts"; });
    modules.splice(index >= 0 ? index + 1 : modules.length, 0, {
      id:BUSINESS_MODULE,
      label:"Contatti affari",
      subtitle:"Affari, proposte, valore e stato con luci",
      roles:["admin","assistant","accountant"]
    });
  }
  function placeBusinessNav(){
    var button = document.querySelector('#nav [data-page="' + BUSINESS_MODULE + '"]');
    if (!button) return;
    var groups = Array.prototype.slice.call(document.querySelectorAll("#nav .nav-group"));
    var commercial = groups.find(function(group){
      var title = group.querySelector(".nav-group-title");
      return title && norm(title.textContent).indexOf("commercial") >= 0;
    });
    if (!commercial) return;
    var contacts = commercial.querySelector('[data-page="contacts"]');
    if (contacts && contacts.nextSibling !== button) commercial.insertBefore(button, contacts.nextSibling);
    else if (!contacts && button.parentElement !== commercial) commercial.appendChild(button);
  }

  function injectStyle(){
    if (document.getElementById(STYLE_ID)) return;
    var css = document.createElement("style");
    css.id = STYLE_ID;
    css.textContent = [
      ".pms216-market{margin:12px 0 16px;padding:14px;border:1px solid var(--line);border-left:5px solid #0f8f57;border-radius:8px;background:#fff;box-shadow:0 8px 18px rgba(15,23,42,.06)}",
      ".pms216-market-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}.pms216-market-head h3{margin:0;font-size:18px}.pms216-market-head p{margin:2px 0 0;color:var(--muted);font-size:12px}",
      ".pms216-business{display:grid;gap:14px}.pms216-toolbar{display:flex;gap:8px;align-items:end;flex-wrap:wrap;padding:12px;border:1px solid var(--line);border-radius:8px;background:#f8fafc}.pms216-toolbar label{margin:0;font-size:12px;font-weight:900;color:var(--muted)}.pms216-toolbar input,.pms216-toolbar select{width:auto;min-width:190px;background:#fff}.pms216-toolbar button{width:auto!important;margin:0!important}",
      ".pms216-form{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:10px;padding:14px;border:1px solid var(--line);border-radius:8px;background:#fff}.pms216-form label{margin:0;font-size:12px;font-weight:900;color:var(--muted)}.pms216-form input,.pms216-form select,.pms216-form textarea{background:#fff}.pms216-form .full{grid-column:1/-1}.pms216-form textarea{min-height:86px}.pms216-form-actions{grid-column:1/-1;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}.pms216-form-actions button{width:auto!important;margin:0!important}",
      ".pms216-card{border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden}.pms216-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line);background:#f8fafc}.pms216-card-head h3{margin:0;font-size:18px}.pms216-card-head p{margin:2px 0 0;color:var(--muted);font-size:12px}",
      ".pms216-status{display:inline-flex;align-items:center;gap:7px;font-weight:900;white-space:nowrap}.pms216-light{width:12px;height:12px;border-radius:999px;display:inline-block;box-shadow:0 0 0 3px rgba(15,23,42,.07),0 0 16px currentColor;animation:pms216-blink 1.05s ease-in-out infinite}.pms216-light.green{color:#16a34a;background:#16a34a}.pms216-light.yellow{color:#eab308;background:#eab308}.pms216-light.red{color:#dc2626;background:#dc2626}.pms216-light.blue{color:#2563eb;background:#2563eb}.pms216-light.gray{color:#64748b;background:#64748b;animation:none}",
      ".pms216-actions{display:flex;gap:6px;flex-wrap:wrap}.pms216-actions button{width:auto!important;margin:0!important;padding:6px 9px!important}.pms216-value{font-weight:900;color:#0f172a}.pms216-mini{color:var(--muted);font-size:12px;line-height:1.35}",
      "@keyframes pms216-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.38;transform:scale(.72)}}",
      "@media(max-width:980px){.pms216-form{grid-template-columns:repeat(2,minmax(150px,1fr))}}@media(max-width:640px){.pms216-form{grid-template-columns:1fr}.pms216-toolbar input,.pms216-toolbar select{width:100%;min-width:0}.pms216-toolbar{display:grid;grid-template-columns:1fr}}"
    ].join("\n");
    document.head.appendChild(css);
  }

  function marketPanelHtml(){
    var body = MARKET_ROWS.map(function(row){
      return '<tr><td><strong>' + esc(row.name) + '</strong><br><small>' + esc(row.market) + '</small></td><td>' + esc(row.unit) + '</td><td>' + esc(row.y2024) + '</td><td>' + esc(row.y2025) + '</td><td>' + esc(row.y2026) + '</td><td>' + esc(row.source) + '</td></tr>';
    }).join("");
    return '<div id="' + MARKET_BOX_ID + '" class="pms216-market"><div class="pms216-market-head"><div><h3>Previsioni aggiunte: latte e formaggi Europa</h3><p>Romania, latte alla stalla, Emmental, Gouda, Reibekaese, Germania, Francia ed Est Europa.</p></div><button class="primary-button" style="width:auto;margin:0" data-pms216-generate-market>Genera previsione su tutto</button></div><div class="table-wrap"><table><thead><tr><th>Voce</th><th>Unita</th><th>2024</th><th>2025</th><th>2026</th><th>Fonte</th></tr></thead><tbody>' + body + '</tbody></table></div></div>';
  }

  function injectMarketPanel(){
    if (!current || current.page !== "marketTrends") return;
    ensureMarketRows();
    injectStyle();
    var mirror = document.getElementById("pms53-clal-price-mirror") || document.getElementById("content");
    if (!mirror || document.getElementById(MARKET_BOX_ID)) return;
    var toolbar = document.getElementById("pms56-toolbar");
    if (toolbar) toolbar.insertAdjacentHTML("afterend", marketPanelHtml());
    else mirror.insertAdjacentHTML("afterbegin", marketPanelHtml());
    bindMarketPanel();
  }

  function bindMarketPanel(){
    var btn = document.querySelector("[data-pms216-generate-market]");
    if (!btn) return;
    btn.onclick = function(){
      ensureMarketRows();
      var select = document.getElementById("pms56-forecast-select");
      if (select) select.value = "all";
      var gen = document.querySelector("[data-pms56-generate-forecast]");
      if (gen) gen.click();
      else alert("Dati aggiunti. Riapri Andamenti mercato per generare la previsione.");
    };
  }

  function statusClass(status){
    var s = norm(status);
    if (s.includes("vinto") || s.includes("accett")) return "green";
    if (s.includes("perso") || s.includes("chius") || s.includes("blocc")) return "red";
    if (s.includes("nuovo")) return "blue";
    if (s.includes("sosp")) return "gray";
    return "yellow";
  }
  function statusHtml(status){
    var label = clean(status) || "In corso";
    return '<span class="pms216-status"><span class="pms216-light ' + esc(statusClass(label)) + '"></span>' + esc(label) + '</span>';
  }
  function money(value, currency){
    if (typeof formatMoney === "function") return formatMoney(num(value), currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function businessRows(){
    stateSafe();
    var search = norm(current.filters.businessContactsSearch || "");
    var status = clean(current.filters.businessContactsStatus || "");
    return state[BUSINESS_MODULE].filter(function(item){
      var hay = norm([item.firstName,item.lastName,item.company,item.business,item.proposal,item.country,item.status,item.notes].join(" "));
      return (!search || hay.indexOf(search) >= 0) && (!status || clean(item.status) === status);
    });
  }
  function field(name, label, value, type, extra){
    return '<label>' + esc(label) + '<input name="' + esc(name) + '" type="' + esc(type || "text") + '" value="' + esc(value || "") + '"' + (extra || "") + '></label>';
  }
  function selectField(name, label, value, options){
    return '<label>' + esc(label) + '<select name="' + esc(name) + '">' + options.map(function(option){
      return '<option value="' + esc(option) + '"' + (option === value ? " selected" : "") + '>' + esc(option) + '</option>';
    }).join("") + '</select></label>';
  }
  function formHtml(item){
    var x = item || {};
    return '<form class="pms216-form" data-pms216-business-form>' +
      '<input name="id" type="hidden" value="' + esc(x.id || "") + '">' +
      field("firstName", "Nome", x.firstName || "", "text", " required") +
      field("lastName", "Cognome", x.lastName || "", "text", " required") +
      field("company", "Azienda / contatto", x.company || "", "text") +
      field("business", "Affare o proposta", x.business || x.proposal || "", "text", " required") +
      selectField("status", "Stato", x.status || "In corso", ["Nuovo","Da contattare","In corso","Proposta inviata","Accettato","Chiuso vinto","Chiuso perso","Sospeso"]) +
      selectField("priority", "Priorita", x.priority || "Media", ["Alta","Media","Bassa"]) +
      field("country", "Paese", x.country || "", "text") +
      field("phone", "Telefono", x.phone || "", "text") +
      field("email", "Email", x.email || "", "email") +
      field("value", "Valore stimato", x.value || "", "number", ' step="0.01"') +
      selectField("currency", "Valuta", x.currency || "EUR", ["EUR","RON","USD","GBP"]) +
      field("expectedDate", "Data prevista", x.expectedDate || today(), "date") +
      '<label class="full">Note<textarea name="notes">' + esc(x.notes || "") + '</textarea></label>' +
      '<div class="pms216-form-actions"><button type="button" class="secondary-button" data-pms216-reset-business>Nuovo pulito</button><button type="submit" class="primary-button">Salva contatto affari</button></div>' +
    '</form>';
  }
  function readBusinessForm(form){
    var data = new FormData(form);
    var item = {};
    data.forEach(function(value,key){ item[key] = clean(value); });
    item.id = item.id || uid216("AFF");
    item.value = num(item.value) || "";
    item.business = item.business || item.proposal || "";
    item.proposal = item.business;
    item.updatedAt = new Date().toISOString();
    return item;
  }
  function renderBusinessContacts(){
    stateSafe();
    injectStyle();
    var rows = businessRows();
    var total = rows.reduce(function(sum,item){ return sum + num(item.value); }, 0);
    var statusOptions = ["","Nuovo","Da contattare","In corso","Proposta inviata","Accettato","Chiuso vinto","Chiuso perso","Sospeso"].map(function(option){
      var label = option || "Tutti gli stati";
      return '<option value="' + esc(option) + '"' + (clean(current.filters.businessContactsStatus || "") === option ? " selected" : "") + '>' + esc(label) + '</option>';
    }).join("");
    var body = rows.map(function(item){
      var fullName = [item.firstName, item.lastName].filter(Boolean).join(" ") || "-";
      return '<tr><td><strong>' + esc(fullName) + '</strong><br><span class="pms216-mini">' + esc(item.company || "-") + '</span></td><td><strong>' + esc(item.business || item.proposal || "-") + '</strong><br><span class="pms216-mini">' + esc(item.country || "") + '</span></td><td>' + statusHtml(item.status) + '<br><span class="pms216-mini">' + esc(item.priority || "Media") + '</span></td><td>' + esc(item.expectedDate || "-") + '</td><td class="pms216-value">' + esc(money(item.value, item.currency || "EUR")) + '</td><td>' + esc(item.phone || "-") + '<br><span class="pms216-mini">' + esc(item.email || "") + '</span></td><td><div class="pms216-actions"><button class="inline-button" data-pms216-edit-business="' + esc(item.id) + '">Modifica</button><button class="inline-button" data-pms216-print-business="' + esc(item.id) + '">Stampa</button><button class="inline-button danger" data-pms216-delete-business="' + esc(item.id) + '">Elimina</button></div></td></tr>';
    }).join("");
    if (!body) body = '<tr><td colspan="7">Nessun contatto affari inserito.</td></tr>';
    return '<div class="pms216-business"><div class="grid cards">' + (typeof kpi === "function" ? kpi("Contatti affari", state[BUSINESS_MODULE].length, "Archivio proposte e opportunita") + kpi("In vista", rows.length, "Risultato filtro") + kpi("Valore filtrato", money(total, "EUR"), "Somma indicativa") : "") + '</div><div class="pms216-toolbar"><label>Cerca<input type="search" value="' + esc(current.filters.businessContactsSearch || "") + '" data-pms216-business-search placeholder="Nome, azienda, affare"></label><label>Stato<select data-pms216-business-status>' + statusOptions + '</select></label><button class="secondary-button" data-pms216-print-business-list>Stampa lista</button></div><div class="pms216-card"><div class="pms216-card-head"><div><h3>Nuovo / modifica contatto affari</h3><p>Nome, cognome, affare o proposta, valore e stato con luce lampeggiante.</p></div></div>' + formHtml(null) + '</div><div class="pms216-card"><div class="pms216-card-head"><div><h3>Archivio contatti affari</h3><p>Modifica, stampa ed elimina sono azioni operative reali.</p></div></div><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Affare / proposta</th><th>Stato</th><th>Data</th><th>Valore</th><th>Contatti</th><th>Azioni</th></tr></thead><tbody>' + body + '</tbody></table></div></div></div>';
  }
  function findBusiness(id){
    return arr(stateSafe()[BUSINESS_MODULE]).find(function(item){ return clean(item.id) === clean(id); });
  }
  function fillBusinessForm(item){
    var host = document.querySelector("[data-pms216-business-form]");
    if (!host || !item) return;
    host.outerHTML = formHtml(item);
    bindBusinessActions();
    var fresh = document.querySelector("[data-pms216-business-form]");
    if (fresh) fresh.scrollIntoView({behavior:"smooth", block:"center"});
  }
  function saveBusiness(form){
    var item = readBusinessForm(form);
    if (!item.firstName || !item.lastName || !item.business) {
      alert("Inserisci nome, cognome e affare/proposta.");
      return;
    }
    var list = stateSafe()[BUSINESS_MODULE];
    var index = list.findIndex(function(row){ return clean(row.id) === clean(item.id); });
    if (index >= 0) list[index] = Object.assign({}, list[index], item);
    else {
      item.createdAt = new Date().toISOString();
      list.unshift(item);
    }
    saveNow("v216-business-save");
    if (typeof render === "function") render();
  }
  function deleteBusiness(id){
    var item = findBusiness(id);
    if (!item) return alert("Contatto affari non trovato.");
    var label = [item.firstName, item.lastName, item.business].filter(Boolean).join(" - ");
    if (!confirm("Eliminare questo contatto affari?\n\n" + label)) return;
    state[BUSINESS_MODULE] = arr(state[BUSINESS_MODULE]).filter(function(row){ return clean(row.id) !== clean(id); });
    saveNow("v216-business-delete");
    if (typeof render === "function") render();
  }
  function businessPrintHtml(item){
    var name = [item.firstName, item.lastName].filter(Boolean).join(" ");
    var rows = [
      ["Nome e cognome", name],
      ["Azienda / contatto", item.company || ""],
      ["Affare o proposta", item.business || item.proposal || ""],
      ["Stato", item.status || ""],
      ["Priorita", item.priority || ""],
      ["Paese", item.country || ""],
      ["Telefono", item.phone || ""],
      ["Email", item.email || ""],
      ["Data prevista", item.expectedDate || ""],
      ["Valore stimato", money(item.value, item.currency || "EUR")],
      ["Note", item.notes || ""]
    ].map(function(row){ return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>'; }).join("");
    var header = typeof companyPrintHeader === "function" ? companyPrintHeader("Contatto affari", item.id || "AFF") : '<div class="print-header"><div><h1>Contatto affari</h1><strong>PARMITALIA</strong></div><div class="print-meta">' + esc(item.id || "") + '<br>' + esc(today()) + '</div></div>';
    return '<div class="print-document">' + header + '<table class="print-table">' + rows + '</table><div class="print-footer">Parmitalia Management System - Contatti affari - ' + esc(today()) + '</div></div>';
  }
  function printBusiness(id){
    var item = findBusiness(id);
    if (!item) return alert("Contatto affari non trovato.");
    var html = businessPrintHtml(item);
    if (typeof openPrint === "function") openPrint(html);
    else window.print();
  }
  function printBusinessList(){
    var rows = businessRows();
    var body = rows.map(function(item){
      var name = [item.firstName, item.lastName].filter(Boolean).join(" ");
      return '<tr><td>' + esc(name) + '</td><td>' + esc(item.company || "") + '</td><td>' + esc(item.business || item.proposal || "") + '</td><td>' + esc(item.status || "") + '</td><td>' + esc(item.expectedDate || "") + '</td><td>' + esc(money(item.value, item.currency || "EUR")) + '</td></tr>';
    }).join("") || '<tr><td colspan="6">Nessun dato.</td></tr>';
    var header = typeof companyPrintHeader === "function" ? companyPrintHeader("Lista contatti affari", "AFF-" + today()) : '<h1>Lista contatti affari</h1>';
    var html = '<div class="print-document">' + header + '<table class="print-table"><thead><tr><th>Nome</th><th>Azienda</th><th>Affare/proposta</th><th>Stato</th><th>Data</th><th>Valore</th></tr></thead><tbody>' + body + '</tbody></table><div class="print-footer">Parmitalia Management System - ' + esc(today()) + '</div></div>';
    if (typeof openPrint === "function") openPrint(html);
    else window.print();
  }
  function bindBusinessActions(){
    var form = document.querySelector("[data-pms216-business-form]");
    if (form) form.onsubmit = function(event){ event.preventDefault(); saveBusiness(form); };
    var reset = document.querySelector("[data-pms216-reset-business]");
    if (reset) reset.onclick = function(){ fillBusinessForm({}); };
    var search = document.querySelector("[data-pms216-business-search]");
    if (search) search.oninput = function(){ current.filters.businessContactsSearch = search.value; if (typeof render === "function") render(); };
    var status = document.querySelector("[data-pms216-business-status]");
    if (status) status.onchange = function(){ current.filters.businessContactsStatus = status.value; if (typeof render === "function") render(); };
    document.querySelectorAll("[data-pms216-edit-business]").forEach(function(button){
      button.onclick = function(){ fillBusinessForm(findBusiness(button.getAttribute("data-pms216-edit-business"))); };
    });
    document.querySelectorAll("[data-pms216-delete-business]").forEach(function(button){
      button.onclick = function(){ deleteBusiness(button.getAttribute("data-pms216-delete-business")); };
    });
    document.querySelectorAll("[data-pms216-print-business]").forEach(function(button){
      button.onclick = function(){ printBusiness(button.getAttribute("data-pms216-print-business")); };
    });
    var printList = document.querySelector("[data-pms216-print-business-list]");
    if (printList) printList.onclick = printBusinessList;
  }

  function bindAll(){
    bindMarketPanel();
    if (current && current.page === BUSINESS_MODULE) bindBusinessActions();
  }
  function boot(){
    stateSafe();
    ensureMarketRows();
    addBusinessModule();
    injectStyle();
    var baseRender = typeof render === "function" ? render : null;
    if (baseRender && !baseRender.__pms216Wrapped) {
      render = function(){
        if (current && current.page === BUSINESS_MODULE) {
          addBusinessModule();
          injectStyle();
          var content = document.getElementById("content");
          if (content) content.innerHTML = renderBusinessContacts();
          bindBusinessActions();
          try { if (typeof renderNav === "function") renderNav(); } catch(error) {}
          return;
        }
        var out = baseRender.apply(this, arguments);
        setTimeout(injectMarketPanel, 120);
        setTimeout(bindAll, 150);
        return out;
      };
      render.__pms216Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
    var baseNav = typeof renderNav === "function" ? renderNav : null;
    if (baseNav && !baseNav.__pms216Wrapped) {
      renderNav = function(){
        addBusinessModule();
        var out = baseNav.apply(this, arguments);
        setTimeout(placeBusinessNav, 20);
        setTimeout(placeBusinessNav, 160);
        return out;
      };
      renderNav.__pms216Wrapped = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
    var baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
    if (baseBind && !baseBind.__pms216Wrapped) {
      bindPageActions = function(){
        baseBind.apply(this, arguments);
        setTimeout(injectMarketPanel, 100);
        setTimeout(bindAll, 120);
      };
      bindPageActions.__pms216Wrapped = true;
      try { window.bindPageActions = bindPageActions; } catch(error) {}
    }
    try { if (typeof renderNav === "function") renderNav(); placeBusinessNav(); } catch(error) {}
    try { if (window.PMS_V215_LEFT_MENU_MILK_LOGO_LAYOUT && typeof window.PMS_V215_LEFT_MENU_MILK_LOGO_LAYOUT.refresh === "function") window.PMS_V215_LEFT_MENU_MILK_LOGO_LAYOUT.refresh(); } catch(error) {}
    setTimeout(injectMarketPanel, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V216_MARKET_FORECAST_BUSINESS_CONTACTS = {version:VERSION, ensureMarketRows:ensureMarketRows, renderBusinessContacts:renderBusinessContacts};
})();
