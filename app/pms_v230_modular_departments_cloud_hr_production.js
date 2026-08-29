(function () {
  "use strict";

  if (window.PMS_V230_MODULAR_DEPARTMENTS) return;

  var VERSION = "pms_v230_modular_departments_cloud_hr_production";
  var STYLE_ID = "pms-v230-modular-departments-style";

  var NEW_MODULES = [
    { id: "secretariatHub", label: "Segreteria", subtitle: "Pratiche in entrata, attivita, comunicazioni e smistamento", roles: ["admin", "assistant", "accountant", "agent", "recruiter"] },
    { id: "commercialHub", label: "Commerciale", subtitle: "Clienti, offerte, trattative, prodotti e follow-up", roles: ["admin", "assistant", "agent"] },
    { id: "administrativeHub", label: "Amministrativo", subtitle: "Pagamenti, dipendenti, presenze, banche e documenti contabili", roles: ["admin", "assistant", "accountant"] },
    { id: "legalHub", label: "Legale", subtitle: "Contratti, comunicazioni ufficiali, protocolli e documenti riservati", roles: ["admin", "assistant"] },
    { id: "distributionBrokerage", label: "Distribuzione / Brokeraggio", subtitle: "Richieste, fornitori, margini, provvigioni e stato trattative", roles: ["admin", "assistant", "agent"] },
    { id: "productShowcase", label: "Vetrina prodotti", subtitle: "Schede prodotto virtuali, disponibilita, link cloud e note commerciali", roles: ["admin", "assistant", "agent"] },
    { id: "productionDairy", label: "Produzione latte", subtitle: "Dal latte alla cagliata/prodotto finito con costo al kg", roles: ["admin", "assistant", "accountant"] },
    { id: "recruitingPersonnel", label: "Recruiting", subtitle: "Candidati, autisti, documenti, colloqui e stato selezione", roles: ["admin", "assistant", "recruiter"] },
    { id: "employeeAttendance", label: "Dipendenti / Presenze", subtitle: "Anagrafica, entrata, uscita, pause, firma e approvazione ore", roles: ["admin", "assistant", "accountant"] },
    { id: "forecastingHub", label: "Previsionale", subtitle: "Indicatori commerciali, produzione, margini e scenari", roles: ["admin", "assistant", "accountant", "agent"] }
  ];

  var DAIRY_DEFAULTS = {
    scenarioName: "Lotto latte demo",
    productName: "Cagliata / prodotto latte",
    currency: "EUR",
    rawMilkLiters: 10000,
    milkPriceLiter: 0.48,
    yieldKgPer100L: 11.5,
    wastePct: 3,
    processingBatch: 850,
    utilitiesBatch: 420,
    laborBatch: 620,
    packagingKg: 0.28,
    transportKg: 0.18,
    analysisBatch: 120,
    certificationBatch: 90,
    overheadPct: 7,
    marginPct: 24,
    vatPct: 0
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char];
    });
  }

  function num(value, fallback) {
    var n = Number(String(value == null ? "" : value).replace(",", "."));
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function money(value, currency) {
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function root() {
    try {
      if (typeof state !== "undefined" && state) return state;
    } catch (error) {}
    window.state = window.state || {};
    return window.state;
  }

  function persist() {
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(root()));
    } catch (error) {
      console.warn(VERSION + " save failed", error);
    }
  }

  function ensureArrays() {
    var s = root();
    s.officeTasks = Array.isArray(s.officeTasks) ? s.officeTasks : [];
    s.officeCommunications = Array.isArray(s.officeCommunications) ? s.officeCommunications : [];
    s.brokerageRequests = Array.isArray(s.brokerageRequests) ? s.brokerageRequests : [];
    s.productShowcaseItems = Array.isArray(s.productShowcaseItems) ? s.productShowcaseItems : [];
    s.dairyProduction = s.dairyProduction && typeof s.dairyProduction === "object" ? s.dairyProduction : JSON.parse(JSON.stringify(DAIRY_DEFAULTS));
    s.dairyProductionScenarios = Array.isArray(s.dairyProductionScenarios) ? s.dairyProductionScenarios : [];
    s.recruitingCandidates = Array.isArray(s.recruitingCandidates) ? s.recruitingCandidates : [];
    s.employees = Array.isArray(s.employees) ? s.employees : [];
    s.employeeTimeEntries = Array.isArray(s.employeeTimeEntries) ? s.employeeTimeEntries : [];
    return s;
  }

  function ensureModules() {
    try {
      if (typeof modules !== "undefined" && Array.isArray(modules)) {
        NEW_MODULES.forEach(function (module) {
          if (!modules.some(function (item) { return item && item.id === module.id; })) modules.push(module);
        });
      }
    } catch (error) {}
  }

  function injectStyle() {
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms230-page{display:grid!important;gap:14px!important}",
      ".pms230-panel{background:#fff!important;border:1px solid var(--line,#d9e2ef)!important;border-radius:8px!important;padding:14px!important;box-shadow:0 8px 18px rgba(18,38,63,.05)!important}",
      ".pms230-head{display:flex!important;justify-content:space-between!important;align-items:flex-start!important;gap:14px!important}",
      ".pms230-head h3{margin:0 0 5px!important;font-size:22px!important;letter-spacing:0!important}",
      ".pms230-head p{margin:0!important;color:#64748b!important;line-height:1.35!important}",
      ".pms230-actions{display:flex!important;gap:8px!important;flex-wrap:wrap!important}",
      ".pms230-actions button,.pms230-inline button{width:auto!important;margin:0!important}",
      ".pms230-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}",
      ".pms230-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))!important}",
      ".pms230-field label{display:block!important;margin:0 0 4px!important;font-size:12px!important;font-weight:900!important;color:#475569!important}",
      ".pms230-field input,.pms230-field select,.pms230-field textarea{width:100%!important;min-width:0!important}",
      ".pms230-field textarea{min-height:76px!important}",
      ".pms230-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important}",
      ".pms230-kpi{border:1px solid var(--line,#d9e2ef)!important;border-radius:8px!important;background:#f8fafc!important;padding:12px!important;min-height:84px!important}",
      ".pms230-kpi span{display:block!important;color:#64748b!important;font-size:11px!important;font-weight:900!important;text-transform:uppercase!important}",
      ".pms230-kpi strong{display:block!important;margin-top:6px!important;font-size:23px!important;color:#103a34!important;line-height:1.08!important}",
      ".pms230-kpi small{display:block!important;margin-top:5px!important;color:#64748b!important;line-height:1.25!important}",
      ".pms230-cards{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}",
      ".pms230-card{border:1px solid var(--line,#d9e2ef)!important;border-radius:8px!important;background:#fff!important;padding:13px!important;display:grid!important;gap:8px!important}",
      ".pms230-card h4{margin:0!important;font-size:16px!important}.pms230-card p{margin:0!important;color:#64748b!important;line-height:1.35!important}",
      ".pms230-table{width:100%!important;min-width:880px!important;border-collapse:collapse!important}",
      ".pms230-table th,.pms230-table td{padding:8px 9px!important;border-bottom:1px solid var(--line,#d9e2ef)!important;vertical-align:middle!important;text-align:left!important}",
      ".pms230-table input,.pms230-table select{min-width:110px!important}",
      ".pms230-badge{display:inline-flex!important;align-items:center!important;border-radius:999px!important;padding:3px 8px!important;font-size:11px!important;font-weight:900!important;background:#e2e8f0!important;color:#334155!important;white-space:nowrap!important}",
      ".pms230-badge.good{background:#dcfce7!important;color:#166534!important}.pms230-badge.warn{background:#fef3c7!important;color:#92400e!important}.pms230-badge.bad{background:#fee2e2!important;color:#991b1b!important}",
      ".pms230-note{border-left:4px solid #0f766e!important;background:#ecfdf5!important;color:#064e3b!important;padding:10px 12px!important;font-size:13px!important;line-height:1.4!important}",
      "@media(max-width:1180px){.pms230-grid,.pms230-kpis,.pms230-cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}}",
      "@media(max-width:760px){.pms230-grid,.pms230-grid.two,.pms230-kpis,.pms230-cards{grid-template-columns:1fr!important}.pms230-head{display:block!important}.pms230-actions{margin-top:10px!important}}"
    ].join("\n");
  }

  function field(name, label, value, type, options) {
    var attr = ' data-pms230-field="' + esc(name) + '"';
    if (options && options.length) {
      return '<div class="pms230-field"><label>' + esc(label) + '</label><select' + attr + '>' + options.map(function (opt) {
        return '<option value="' + esc(opt) + '"' + (String(value || "") === String(opt) ? " selected" : "") + '>' + esc(opt) + '</option>';
      }).join("") + '</select></div>';
    }
    if (type === "textarea") return '<div class="pms230-field"><label>' + esc(label) + '</label><textarea' + attr + '>' + esc(value) + '</textarea></div>';
    return '<div class="pms230-field"><label>' + esc(label) + '</label><input type="' + esc(type || "text") + '"' + attr + ' value="' + esc(value) + '"></div>';
  }

  function navButton(page, text, klass) {
    return '<button type="button" class="' + esc(klass || "secondary-button") + '" data-nav="' + esc(page) + '">' + esc(text) + '</button>';
  }

  function statusBadge(status) {
    var text = status || "Da fare";
    var good = /complet|approv|assunto|firmato|chiuso|confermat|visibile/i.test(text);
    var bad = /blocc|annull|non idoneo|scad/i.test(text);
    return '<span class="pms230-badge ' + (good ? "good" : bad ? "bad" : "warn") + '">' + esc(text) + '</span>';
  }

  function setHead(title, subtitle) {
    var t = document.getElementById("page-title");
    var s = document.getElementById("page-subtitle");
    if (t) t.textContent = title;
    if (s) s.textContent = subtitle || "";
  }

  function pageShell(title, subtitle, body, actions) {
    injectStyle();
    return '<div class="pms230-page"><section class="pms230-panel pms230-head"><div><h3>' + esc(title) + '</h3><p>' + esc(subtitle || "") + '</p></div><div class="pms230-actions">' + (actions || "") + '</div></section>' + body + '</div>';
  }

  function kpi(label, value, hint) {
    return '<div class="pms230-kpi"><span>' + esc(label) + '</span><strong>' + esc(value) + '</strong><small>' + esc(hint || "") + '</small></div>';
  }

  function hubCard(title, text, page) {
    return '<div class="pms230-card"><h4>' + esc(title) + '</h4><p>' + esc(text) + '</p>' + navButton(page, "Apri") + '</div>';
  }

  function renderSecretariat() {
    var s = ensureArrays();
    var open = s.officeTasks.filter(function (x) { return x.status !== "Completato"; }).length;
    var official = s.officeCommunications.filter(function (x) { return x.official === "Si"; }).length;
    var rows = s.officeTasks.slice(0, 12).map(function (x, i) {
      return '<tr><td>' + esc(x.subject) + '</td><td>' + esc(x.area) + '</td><td>' + esc(x.dueDate || "") + '</td><td>' + statusBadge(x.status) + '</td><td>' + esc(x.notes || "") + '</td><td><button class="secondary-button" data-pms230-task-done="' + i + '">Chiudi</button></td></tr>';
    }).join("") || '<tr><td colspan="6">Nessuna attivita inserita.</td></tr>';
    var comms = s.officeCommunications.slice(0, 10).map(function (x) {
      return '<tr><td>' + esc(x.subject) + '</td><td>' + esc(x.type) + '</td><td>' + esc(x.linkedTo || "") + '</td><td>' + esc(x.channel || "") + '</td><td>' + statusBadge(x.status) + '</td></tr>';
    }).join("") || '<tr><td colspan="5">Nessuna comunicazione inserita.</td></tr>';
    return pageShell("Segreteria", "Centro operativo per attivita, pratiche, comunicazioni e documenti.",
      '<section class="pms230-kpis">' +
        kpi("Attivita aperte", open, "Da smistare o completare") +
        kpi("Comunicazioni", s.officeCommunications.length, "Interne e ufficiali") +
        kpi("Ufficiali", official, "Da protocollo o invio formale") +
        kpi("Documenti", (s.documents || []).length, "Archivio condiviso") +
      '</section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Nuova attivita segreteria</h3></div><div class="pms230-grid">' +
        field("taskSubject", "Oggetto", "", "text") +
        field("taskArea", "Reparto", "Segreteria", "select", ["Segreteria", "Commerciale", "Amministrativo", "Legale", "Brokeraggio", "Produzione", "Recruiting"]) +
        field("taskPriority", "Priorita", "Media", "select", ["Alta", "Media", "Bassa"]) +
        field("taskDue", "Scadenza", today(), "date") +
        field("taskNotes", "Note / cosa fare", "", "textarea") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-task>Aggiungi attivita</button>' + navButton("documents", "Archivio documenti") + '</div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Nuova comunicazione</h3></div><div class="pms230-grid">' +
        field("commSubject", "Oggetto", "", "text") +
        field("commType", "Tipo", "Interna", "select", ["Interna", "Ufficiale", "Email", "PEC", "Telefonata", "Nota cliente"]) +
        field("commLinked", "Collegata a", "", "text") +
        field("commChannel", "Canale", "Email", "select", ["Email", "PEC", "WhatsApp", "Telefono", "Lettera", "Riunione"]) +
        field("commNotes", "Testo / note", "", "textarea") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-comm>Aggiungi comunicazione</button>' + navButton("officialCommunications", "Comunicazioni ufficiali") + '</div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Attivita recenti</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Oggetto</th><th>Reparto</th><th>Scadenza</th><th>Stato</th><th>Note</th><th>Azioni</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Comunicazioni recenti</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Oggetto</th><th>Tipo</th><th>Collegata</th><th>Canale</th><th>Stato</th></tr></thead><tbody>' + comms + '</tbody></table></div></section>',
      navButton("assistant", "Backoffice") + navButton("print", "Stampe"));
  }

  function renderCommercialHub() {
    return pageShell("Commerciale", "Area alleggerita per clienti, offerte, prodotti e trattative.",
      '<section class="pms230-cards">' +
      hubCard("Offerte", "Creazione offerte, numerazione, stampa e follow-up.", "offers") +
      hubCard("Anagrafiche", "Clienti, fornitori, agenti e contatti commerciali.", "contacts") +
      hubCard("Prodotti", "Schede articoli, immagini, packaging e listini.", "products") +
      hubCard("Vetrina virtuale", "Catalogo prodotti con disponibilita e link cloud.", "productShowcase") +
      hubCard("Trattative", "Trattative, intermediazioni e stato commerciale.", "intermediations") +
      hubCard("Previsionale", "Indicatori di vendita e margine.", "forecastingHub") +
      '</section>');
  }

  function renderAdministrativeHub() {
    return pageShell("Amministrativo", "Controllo economico, dipendenti, presenze e documenti contabili.",
      '<section class="pms230-cards">' +
      hubCard("Dipendenti / Presenze", "Anagrafica, ore giornaliere, pause, firma e approvazione.", "employeeAttendance") +
      hubCard("Commercialista", "Preparazione mensile documenti, fatture ed estratti.", "accountant") +
      hubCard("Pagamenti", "Scadenze, garanzie, interessi e incassi.", "payments") +
      hubCard("Banche", "Conti, IBAN, valute ed estratti.", "banks") +
      hubCard("Archivio documenti", "File contabili, contratti e allegati collegati.", "documents") +
      hubCard("Stampe", "Riepiloghi e documenti operativi.", "print") +
      '</section>');
  }

  function renderLegalHub() {
    return pageShell("Legale", "Contratti, comunicazioni ufficiali, protocolli e pratiche riservate.",
      '<section class="pms230-cards">' +
      hubCard("Contratti", "Mandati, accordi, rinnovi e scadenze.", "contracts") +
      hubCard("Modelli contratti", "NDA, mandati e testi modificabili.", "contractTemplates") +
      hubCard("Comunicazioni ufficiali", "Lettere, PEC, invii e storico formale.", "officialCommunications") +
      hubCard("Documenti", "Allegati riservati collegati a clienti e pratiche.", "documents") +
      hubCard("Protocolli legali", "Pratiche, contestazioni e avanzamento.", "legalProtocols") +
      hubCard("Segreteria", "Smistamento operativo e promemoria.", "secretariatHub") +
      '</section>');
  }

  function renderBrokerage() {
    var s = ensureArrays();
    var rows = s.brokerageRequests.map(function (x, i) {
      var buy = num(x.buyPrice), sell = num(x.sellPrice), qty = num(x.qty);
      var margin = (sell - buy) * qty;
      var commission = Math.max(0, margin) * num(x.commissionPct) / 100;
      return '<tr><td>' + esc(x.product) + '</td><td>' + esc(x.supplier) + '</td><td>' + esc(x.customer) + '</td><td>' + esc(qty) + '</td><td>' + esc(money(margin, x.currency)) + '</td><td>' + esc(money(commission, x.currency)) + '</td><td>' + statusBadge(x.status) + '</td><td><button class="secondary-button" data-pms230-delete-brokerage="' + i + '">Elimina</button></td></tr>';
    }).join("") || '<tr><td colspan="8">Nessuna richiesta brokeraggio inserita.</td></tr>';
    return pageShell("Distribuzione / Brokeraggio", "Richieste di mercato, fornitori, condizioni, margini e provvigioni.",
      '<section class="pms230-panel"><div class="section-header"><h3>Nuova richiesta</h3></div><div class="pms230-grid">' +
        field("brProduct", "Prodotto", "", "text") +
        field("brSupplier", "Fornitore / broker", "", "text") +
        field("brCustomer", "Cliente / mercato", "", "text") +
        field("brQty", "Quantita", "", "number") +
        field("brBuy", "Prezzo acquisto", "", "number") +
        field("brSell", "Prezzo vendita", "", "number") +
        field("brCurrency", "Valuta", "EUR", "select", ["EUR", "RON", "USD"]) +
        field("brCommission", "Provvigione %", "5", "number") +
        field("brStatus", "Stato", "Nuovo", "select", ["Nuovo", "In valutazione", "Proposta inviata", "Confermato", "Chiuso", "Annullato"]) +
        field("brNotes", "Note / condizioni", "", "textarea") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-brokerage>Aggiungi richiesta</button>' + navButton("products", "Prodotti") + '</div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Richieste brokeraggio</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Prodotto</th><th>Fornitore</th><th>Cliente</th><th>Qta</th><th>Margine</th><th>Provvigione</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>');
  }

  function renderProductShowcase() {
    var s = ensureArrays();
    var rows = s.productShowcaseItems.map(function (x, i) {
      return '<tr><td><strong>' + esc(x.product) + '</strong><br><small>' + esc(x.category || "") + '</small></td><td>' + esc(x.stock || "") + '</td><td>' + esc(money(x.price, x.currency)) + '</td><td>' + statusBadge(x.visible) + '</td><td>' + (x.cloudLink ? '<a href="' + esc(x.cloudLink) + '" target="_blank">Cloud</a>' : "") + '</td><td>' + esc(x.notes || "") + '</td><td><button class="secondary-button" data-pms230-delete-showcase="' + i + '">Elimina</button></td></tr>';
    }).join("") || '<tr><td colspan="7">Nessuna scheda prodotto in vetrina.</td></tr>';
    return pageShell("Vetrina prodotti", "Schede prodotto virtuali separate dal gestionale operativo.",
      '<section class="pms230-panel"><div class="section-header"><h3>Nuova scheda vetrina</h3></div><div class="pms230-grid">' +
        field("showProduct", "Prodotto", "", "text") +
        field("showCategory", "Categoria", "", "text") +
        field("showStock", "Disponibilita", "", "text") +
        field("showPrice", "Prezzo indicativo", "", "number") +
        field("showCurrency", "Valuta", "EUR", "select", ["EUR", "RON", "USD"]) +
        field("showVisible", "Stato", "Bozza", "select", ["Bozza", "Visibile", "Riservato"]) +
        field("showCloud", "Link cloud / foto / scheda", "", "text") +
        field("showNotes", "Note", "", "textarea") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-showcase>Aggiungi prodotto</button>' + navButton("products", "Anagrafica prodotti") + '</div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Vetrina</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Prodotto</th><th>Disponibilita</th><th>Prezzo</th><th>Stato</th><th>Link</th><th>Note</th><th>Azioni</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>');
  }

  function dairyCalc(data) {
    var liters = Math.max(0, num(data.rawMilkLiters));
    var curdKg = liters * num(data.yieldKgPer100L) / 100;
    var finishedKg = curdKg * (1 - Math.min(90, Math.max(0, num(data.wastePct))) / 100);
    var raw = liters * num(data.milkPriceLiter);
    var variable = raw + num(data.processingBatch) + num(data.utilitiesBatch) + num(data.laborBatch) + num(data.analysisBatch) + num(data.certificationBatch) + finishedKg * (num(data.packagingKg) + num(data.transportKg));
    var overhead = variable * num(data.overheadPct) / 100;
    var total = variable + overhead;
    var costKg = finishedKg > 0 ? total / finishedKg : 0;
    var sellKg = costKg * (1 + num(data.marginPct) / 100);
    var vatKg = sellKg * (1 + num(data.vatPct) / 100);
    return { curdKg: curdKg, finishedKg: finishedKg, raw: raw, variable: variable, overhead: overhead, total: total, costKg: costKg, sellKg: sellKg, vatKg: vatKg };
  }

  function dairyInput(name, label, type) {
    var d = ensureArrays().dairyProduction;
    return field(name, label, d[name], type || "number");
  }

  function renderProductionDairy() {
    var s = ensureArrays();
    var d = s.dairyProduction;
    var c = dairyCalc(d);
    var scenarioRows = s.dairyProductionScenarios.slice(0, 10).map(function (x, i) {
      return '<tr><td>' + esc(x.savedAt || "") + '</td><td>' + esc(x.productName) + '</td><td>' + esc(num(x.rawMilkLiters).toLocaleString("it-IT")) + '</td><td>' + esc(money(x.costKg, x.currency)) + '</td><td>' + esc(money(x.sellKg, x.currency)) + '</td><td><button class="secondary-button" data-pms230-load-dairy="' + i + '">Carica</button></td></tr>';
    }).join("") || '<tr><td colspan="6">Nessuno scenario salvato.</td></tr>';
    return pageShell("Produzione latte", "Calcolo dal latte alla cagliata/prodotto finito: resa, costi, utilita e prezzo finale.",
      '<section class="pms230-kpis">' +
        kpi("Latte", num(d.rawMilkLiters).toLocaleString("it-IT") + " L", money(num(d.milkPriceLiter), d.currency) + " / L") +
        kpi("Kg finito", c.finishedKg.toLocaleString("it-IT", { maximumFractionDigits: 1 }), "Resa " + num(d.yieldKgPer100L).toFixed(2) + " kg / 100 L") +
        kpi("Costo / kg", money(c.costKg, d.currency), "Costo industriale stimato") +
        kpi("Prezzo target", money(c.vatKg, d.currency), "Margine " + num(d.marginPct).toFixed(1) + "%") +
      '</section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Parametri lotto latte</h3></div><div class="pms230-grid">' +
        dairyInput("scenarioName", "Nome scenario", "text") +
        dairyInput("productName", "Prodotto finito", "text") +
        dairyInput("rawMilkLiters", "Litri latte") +
        dairyInput("milkPriceLiter", "Prezzo latte / litro") +
        dairyInput("yieldKgPer100L", "Resa kg / 100 L") +
        dairyInput("wastePct", "Scarto / perdita %") +
        dairyInput("processingBatch", "Lavorazione lotto") +
        dairyInput("utilitiesBatch", "Utilita / energia") +
        dairyInput("laborBatch", "Manodopera lotto") +
        dairyInput("packagingKg", "Imballo / kg") +
        dairyInput("transportKg", "Trasporto / kg") +
        dairyInput("analysisBatch", "Analisi lotto") +
        dairyInput("certificationBatch", "Certificazioni lotto") +
        dairyInput("overheadPct", "Spese struttura %") +
        dairyInput("marginPct", "Margine %") +
        dairyInput("vatPct", "IVA %") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-save-dairy>Salva scenario</button><button class="secondary-button" data-pms230-reset-dairy>Ripristina demo</button></div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Risultato costo prodotto finito</h3></div><div class="table-wrap"><table class="pms230-table"><tbody>' +
        '<tr><th>Materia prima latte</th><td>' + esc(money(c.raw, d.currency)) + '</td><td>' + esc(money(num(d.milkPriceLiter), d.currency)) + ' / litro</td></tr>' +
        '<tr><th>Cagliata stimata</th><td>' + esc(c.curdKg.toLocaleString("it-IT", { maximumFractionDigits: 1 })) + ' kg</td><td>prima di scarto/perdita</td></tr>' +
        '<tr><th>Costi diretti + utilita</th><td>' + esc(money(c.variable, d.currency)) + '</td><td>latte + lavorazione + energia + lavoro + analisi + imballo + trasporto</td></tr>' +
        '<tr><th>Spese struttura</th><td>' + esc(money(c.overhead, d.currency)) + '</td><td>' + esc(num(d.overheadPct).toFixed(2)) + '%</td></tr>' +
        '<tr><th>Totale lotto</th><td><strong>' + esc(money(c.total, d.currency)) + '</strong></td><td>' + esc(c.finishedKg.toLocaleString("it-IT", { maximumFractionDigits: 1 })) + ' kg finiti</td></tr>' +
      '</tbody></table></div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Scenari salvati</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Data</th><th>Prodotto</th><th>Litri</th><th>Costo/kg</th><th>Prezzo target</th><th>Azioni</th></tr></thead><tbody>' + scenarioRows + '</tbody></table></div></section>');
  }

  function renderRecruiting() {
    var s = ensureArrays();
    var rows = s.recruitingCandidates.map(function (x, i) {
      return '<tr><td><strong>' + esc(x.name) + '</strong><br><small>' + esc(x.phone || "") + '</small></td><td>' + esc(x.role) + '</td><td>' + esc(x.license || "") + '</td><td>' + statusBadge(x.status) + '</td><td>' + esc(x.documents || "") + '</td><td>' + esc(x.notes || "") + '</td><td><button class="secondary-button" data-pms230-hire-candidate="' + i + '">Assumi</button> <button class="secondary-button" data-pms230-delete-candidate="' + i + '">Elimina</button></td></tr>';
    }).join("") || '<tr><td colspan="7">Nessun candidato inserito.</td></tr>';
    return pageShell("Recruiting", "Selezione personale, autisti, documenti e stato candidatura.",
      '<section class="pms230-panel"><div class="section-header"><h3>Nuovo candidato</h3></div><div class="pms230-grid">' +
        field("candName", "Nome candidato", "", "text") +
        field("candRole", "Ruolo", "Autista", "select", ["Autista", "Magazzino", "Produzione", "Amministrazione", "Commerciale", "Altro"]) +
        field("candPhone", "Telefono", "", "text") +
        field("candLicense", "Patente / CQC / certificati", "", "text") +
        field("candStatus", "Stato", "Nuovo", "select", ["Nuovo", "Da chiamare", "Colloquio fissato", "Idoneo", "Non idoneo", "Assunto"]) +
        field("candDocs", "Documenti allegati", "", "text") +
        field("candNotes", "Note colloquio", "", "textarea") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-candidate>Aggiungi candidato</button>' + navButton("employeeAttendance", "Dipendenti") + '</div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Candidati</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Candidato</th><th>Ruolo</th><th>Patente/CQC</th><th>Stato</th><th>Documenti</th><th>Note</th><th>Azioni</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>');
  }

  function calcHours(entry) {
    var start = String(entry.start || "").split(":");
    var end = String(entry.end || "").split(":");
    if (start.length < 2 || end.length < 2) return 0;
    var sMin = num(start[0]) * 60 + num(start[1]);
    var eMin = num(end[0]) * 60 + num(end[1]);
    if (eMin < sMin) eMin += 24 * 60;
    return Math.max(0, (eMin - sMin - num(entry.pauseMin)) / 60);
  }

  function renderEmployees() {
    var s = ensureArrays();
    var employeeOptions = s.employees.map(function (e) { return e.id + " - " + e.name; });
    var employeesRows = s.employees.map(function (x, i) {
      return '<tr><td><strong>' + esc(x.name) + '</strong><br><small>' + esc(x.phone || "") + '</small></td><td>' + esc(x.role) + '</td><td>' + esc(x.department) + '</td><td>' + esc(x.contract || "") + '</td><td>' + statusBadge(x.status || "Attivo") + '</td><td><button class="secondary-button" data-pms230-delete-employee="' + i + '">Elimina</button></td></tr>';
    }).join("") || '<tr><td colspan="6">Nessun dipendente inserito.</td></tr>';
    var timeRows = s.employeeTimeEntries.slice(0, 20).map(function (x, i) {
      var employee = s.employees.find(function (e) { return e.id === x.employeeId; });
      return '<tr><td>' + esc(x.date) + '</td><td>' + esc(employee ? employee.name : x.employeeId) + '</td><td>' + esc(x.start || "") + '</td><td>' + esc(x.end || "") + '</td><td>' + esc(x.pauseMin || 0) + ' min</td><td>' + esc(calcHours(x).toFixed(2)) + '</td><td>' + statusBadge(x.status) + '</td><td>' + esc(x.signature || "") + '</td><td><button class="secondary-button" data-pms230-sign-time="' + i + '">Firma</button> <button class="secondary-button" data-pms230-approve-time="' + i + '">Approva</button></td></tr>';
    }).join("") || '<tr><td colspan="9">Nessuna presenza registrata.</td></tr>';
    return pageShell("Dipendenti / Presenze", "Registrazione dipendenti, entrata, uscita, pause, firma serale e approvazione.",
      '<section class="pms230-panel"><div class="section-header"><h3>Nuovo dipendente</h3></div><div class="pms230-grid">' +
        field("empName", "Nome dipendente", "", "text") +
        field("empRole", "Mansione", "Autista", "select", ["Autista", "Magazzino", "Produzione", "Amministrazione", "Commerciale", "Altro"]) +
        field("empDepartment", "Reparto", "Distribuzione", "select", ["Segreteria", "Commerciale", "Amministrativo", "Legale", "Distribuzione", "Produzione"]) +
        field("empContract", "Contratto", "", "text") +
        field("empPhone", "Telefono", "", "text") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-employee>Aggiungi dipendente</button></div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Registro ore giornaliere</h3></div><div class="pms230-grid">' +
        field("timeEmployee", "Dipendente", employeeOptions[0] || "", "select", employeeOptions.length ? employeeOptions : ["Nessun dipendente"]) +
        field("timeDate", "Data", today(), "date") +
        field("timeStart", "Entrata", "08:00", "time") +
        field("timeEnd", "Uscita", "17:00", "time") +
        field("timePause", "Pause minuti", "60", "number") +
        field("timeSignature", "Firma / conferma", "", "text") +
        field("timeNotes", "Note", "", "textarea") +
      '</div><div class="pms230-actions" style="margin-top:10px"><button class="primary-button" data-pms230-add-time>Registra giornata</button></div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Dipendenti</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Dipendente</th><th>Mansione</th><th>Reparto</th><th>Contratto</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + employeesRows + '</tbody></table></div></section>' +
      '<section class="pms230-panel"><div class="section-header"><h3>Presenze recenti</h3></div><div class="table-wrap"><table class="pms230-table"><thead><tr><th>Data</th><th>Dipendente</th><th>Entrata</th><th>Uscita</th><th>Pausa</th><th>Ore</th><th>Stato</th><th>Firma</th><th>Azioni</th></tr></thead><tbody>' + timeRows + '</tbody></table></div></section>');
  }

  function renderForecasting() {
    var s = ensureArrays();
    var d = dairyCalc(s.dairyProduction);
    var openBrokerage = s.brokerageRequests.filter(function (x) { return !/chiuso|annullato/i.test(x.status || ""); }).length;
    return pageShell("Previsionale", "Vista direzionale su produzione, brokeraggio, prodotti e margini.",
      '<section class="pms230-kpis">' +
        kpi("Costo latte / kg", money(d.costKg, s.dairyProduction.currency), "Da modulo produzione latte") +
        kpi("Prezzo target latte", money(d.vatKg, s.dairyProduction.currency), "Con margine impostato") +
        kpi("Brokeraggio aperto", openBrokerage, "Richieste non chiuse") +
        kpi("Prodotti in vetrina", s.productShowcaseItems.length, "Schede virtuali") +
      '</section><section class="pms230-cards">' +
        hubCard("Produzione latte", "Simulatore costo prodotto finito.", "productionDairy") +
        hubCard("Caffe crudo", "Simulatore gia presente per materia prima e trasformazione.", "greenCoffee") +
        hubCard("Andamenti mercato", "Indicatori e scenari commerciali.", "marketTrends") +
      '</section>');
  }

  function renderPage(page) {
    ensureModules();
    if (page === "secretariatHub") { setHead("Segreteria", "Centro operativo"); return renderSecretariat(); }
    if (page === "commercialHub") { setHead("Commerciale", "Clienti, offerte e trattative"); return renderCommercialHub(); }
    if (page === "administrativeHub") { setHead("Amministrativo", "Contabilita e personale"); return renderAdministrativeHub(); }
    if (page === "legalHub") { setHead("Legale", "Contratti e comunicazioni ufficiali"); return renderLegalHub(); }
    if (page === "distributionBrokerage") { setHead("Distribuzione / Brokeraggio", "Richieste e provvigioni"); return renderBrokerage(); }
    if (page === "productShowcase") { setHead("Vetrina prodotti", "Schede prodotto virtuali"); return renderProductShowcase(); }
    if (page === "productionDairy") { setHead("Produzione latte", "Costo da materia prima a prodotto finito"); return renderProductionDairy(); }
    if (page === "recruitingPersonnel") { setHead("Recruiting", "Candidati e autisti"); return renderRecruiting(); }
    if (page === "employeeAttendance") { setHead("Dipendenti / Presenze", "Ore, pause e firma"); return renderEmployees(); }
    if (page === "forecastingHub") { setHead("Previsionale", "Indicatori e scenari"); return renderForecasting(); }
    return "";
  }

  function value(name) {
    var node = document.querySelector('[data-pms230-field="' + name + '"]');
    return node ? node.value : "";
  }

  function rerender() {
    try {
      if (typeof render === "function") render();
    } catch (error) {}
  }

  function bindGlobalActions() {
    if (document.__pms230Bound) return;
    document.__pms230Bound = true;
    document.addEventListener("input", function (event) {
      var node = event.target && event.target.closest && event.target.closest("[data-pms230-field]");
      if (!node) return;
      var page = "";
      try { page = current && current.page; } catch (error) {}
      if (page === "productionDairy") {
        var d = ensureArrays().dairyProduction;
        var key = node.getAttribute("data-pms230-field");
        d[key] = node.type === "number" ? num(node.value) : node.value;
        persist();
        clearTimeout(window.__pms230DairyTimer);
        window.__pms230DairyTimer = setTimeout(rerender, 220);
      }
    }, true);
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      var s = ensureArrays();
      function hit(sel) { return target.closest(sel); }
      if (hit("[data-pms230-add-task]")) {
        s.officeTasks.unshift({ id: "SEC-" + Date.now(), subject: value("taskSubject") || "Nuova attivita", area: value("taskArea"), priority: value("taskPriority"), dueDate: value("taskDue"), status: "Da fare", notes: value("taskNotes"), createdAt: new Date().toISOString() });
        persist(); rerender();
      } else if (hit("[data-pms230-add-comm]")) {
        var type = value("commType");
        s.officeCommunications.unshift({ id: "COM-" + Date.now(), subject: value("commSubject") || "Nuova comunicazione", type: type, official: type === "Ufficiale" || type === "PEC" ? "Si" : "No", linkedTo: value("commLinked"), channel: value("commChannel"), notes: value("commNotes"), status: "Bozza", createdAt: new Date().toISOString() });
        persist(); rerender();
      } else if (hit("[data-pms230-task-done]")) {
        s.officeTasks[num(hit("[data-pms230-task-done]").getAttribute("data-pms230-task-done"))].status = "Completato";
        persist(); rerender();
      } else if (hit("[data-pms230-add-brokerage]")) {
        s.brokerageRequests.unshift({ product: value("brProduct") || "Prodotto", supplier: value("brSupplier"), customer: value("brCustomer"), qty: num(value("brQty")), buyPrice: num(value("brBuy")), sellPrice: num(value("brSell")), currency: value("brCurrency") || "EUR", commissionPct: num(value("brCommission")), status: value("brStatus"), notes: value("brNotes"), createdAt: new Date().toISOString() });
        persist(); rerender();
      } else if (hit("[data-pms230-delete-brokerage]")) {
        s.brokerageRequests.splice(num(hit("[data-pms230-delete-brokerage]").getAttribute("data-pms230-delete-brokerage")), 1); persist(); rerender();
      } else if (hit("[data-pms230-add-showcase]")) {
        s.productShowcaseItems.unshift({ product: value("showProduct") || "Prodotto", category: value("showCategory"), stock: value("showStock"), price: num(value("showPrice")), currency: value("showCurrency") || "EUR", visible: value("showVisible"), cloudLink: value("showCloud"), notes: value("showNotes"), createdAt: new Date().toISOString() });
        persist(); rerender();
      } else if (hit("[data-pms230-delete-showcase]")) {
        s.productShowcaseItems.splice(num(hit("[data-pms230-delete-showcase]").getAttribute("data-pms230-delete-showcase")), 1); persist(); rerender();
      } else if (hit("[data-pms230-save-dairy]")) {
        var d = s.dairyProduction, c = dairyCalc(d);
        s.dairyProductionScenarios.unshift(Object.assign({}, d, { savedAt: today(), costKg: c.costKg, sellKg: c.vatKg }));
        persist(); rerender();
      } else if (hit("[data-pms230-reset-dairy]")) {
        s.dairyProduction = JSON.parse(JSON.stringify(DAIRY_DEFAULTS)); persist(); rerender();
      } else if (hit("[data-pms230-load-dairy]")) {
        var scenario = s.dairyProductionScenarios[num(hit("[data-pms230-load-dairy]").getAttribute("data-pms230-load-dairy"))];
        if (scenario) s.dairyProduction = Object.assign({}, DAIRY_DEFAULTS, scenario);
        persist(); rerender();
      } else if (hit("[data-pms230-add-candidate]")) {
        s.recruitingCandidates.unshift({ name: value("candName") || "Candidato", role: value("candRole"), phone: value("candPhone"), license: value("candLicense"), status: value("candStatus"), documents: value("candDocs"), notes: value("candNotes"), createdAt: new Date().toISOString() });
        persist(); rerender();
      } else if (hit("[data-pms230-hire-candidate]")) {
        var cand = s.recruitingCandidates[num(hit("[data-pms230-hire-candidate]").getAttribute("data-pms230-hire-candidate"))];
        if (cand) {
          cand.status = "Assunto";
          s.employees.unshift({ id: "EMP-" + Date.now(), name: cand.name, role: cand.role, department: cand.role === "Autista" ? "Distribuzione" : "Produzione", contract: "", phone: cand.phone, status: "Attivo" });
        }
        persist(); rerender();
      } else if (hit("[data-pms230-delete-candidate]")) {
        s.recruitingCandidates.splice(num(hit("[data-pms230-delete-candidate]").getAttribute("data-pms230-delete-candidate")), 1); persist(); rerender();
      } else if (hit("[data-pms230-add-employee]")) {
        s.employees.unshift({ id: "EMP-" + Date.now(), name: value("empName") || "Dipendente", role: value("empRole"), department: value("empDepartment"), contract: value("empContract"), phone: value("empPhone"), status: "Attivo" });
        persist(); rerender();
      } else if (hit("[data-pms230-delete-employee]")) {
        s.employees.splice(num(hit("[data-pms230-delete-employee]").getAttribute("data-pms230-delete-employee")), 1); persist(); rerender();
      } else if (hit("[data-pms230-add-time]")) {
        var selected = value("timeEmployee");
        var empId = selected.split(" - ")[0];
        if (!s.employees.some(function (e) { return e.id === empId; })) { alert("Prima inserisci almeno un dipendente."); return; }
        s.employeeTimeEntries.unshift({ employeeId: empId, date: value("timeDate") || today(), start: value("timeStart"), end: value("timeEnd"), pauseMin: num(value("timePause")), signature: value("timeSignature"), notes: value("timeNotes"), status: value("timeSignature") ? "Firmato" : "Da firmare", createdAt: new Date().toISOString() });
        persist(); rerender();
      } else if (hit("[data-pms230-sign-time]")) {
        var entry = s.employeeTimeEntries[num(hit("[data-pms230-sign-time]").getAttribute("data-pms230-sign-time"))];
        if (entry) { entry.status = "Firmato"; entry.signature = entry.signature || "Confermato"; entry.signedAt = new Date().toISOString(); }
        persist(); rerender();
      } else if (hit("[data-pms230-approve-time]")) {
        var approved = s.employeeTimeEntries[num(hit("[data-pms230-approve-time]").getAttribute("data-pms230-approve-time"))];
        if (approved) { approved.status = "Approvato"; approved.approvedAt = new Date().toISOString(); }
        persist(); rerender();
      }
    }, true);
  }

  function wrapRender() {
    var base = window.render;
    if (typeof base !== "function" || base.__pms230Wrapped) return;
    var wrapped = function () {
      ensureModules();
      var page = "";
      try { page = current && current.page; } catch (error) {}
      var html = renderPage(page);
      if (html) {
        var content = document.getElementById("content");
        if (content) content.innerHTML = html;
        if (window.PMS_V227_FILL_BLANK_SIDEBAR_MENU && typeof window.PMS_V227_FILL_BLANK_SIDEBAR_MENU.refresh === "function") {
          setTimeout(window.PMS_V227_FILL_BLANK_SIDEBAR_MENU.refresh, 20);
        }
        return;
      }
      return base.apply(this, arguments);
    };
    wrapped.__pms230Wrapped = true;
    window.render = wrapped;
    try { eval("render = window.render"); } catch (error) {}
  }

  function install() {
    ensureArrays();
    ensureModules();
    injectStyle();
    bindGlobalActions();
    wrapRender();
    if (window.PMS_V227_FILL_BLANK_SIDEBAR_MENU && typeof window.PMS_V227_FILL_BLANK_SIDEBAR_MENU.refresh === "function") {
      window.PMS_V227_FILL_BLANK_SIDEBAR_MENU.refresh();
    }
    console.info(VERSION + " loaded");
  }

  window.PMS_V230_MODULAR_DEPARTMENTS = { version: VERSION, renderPage: renderPage, ensure: ensureArrays };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
