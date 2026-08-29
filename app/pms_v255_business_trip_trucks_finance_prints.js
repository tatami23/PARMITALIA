(function () {
  "use strict";

  var VERSION = "20260828-v255-business-trip-trucks-finance";
  var HIDDEN_MODULES = { greenCoffee: true, foreignRecruiting: true, humanResources: true };

  function has(fn) { return typeof window[fn] === "function"; }
  function hasRenderList() {
    try { return typeof renderListModule === "function"; } catch (e) { return has("renderListModule"); }
  }
  function callRenderList(module) {
    try { if (typeof renderListModule === "function") return renderListModule(module); } catch (e) {}
    return has("renderListModule") ? window.renderListModule(module) : "";
  }
  function callRenderNav() {
    try { if (typeof renderNav === "function") return renderNav(); } catch (e) {}
    if (has("renderNav")) return window.renderNav();
  }
  function callRender() {
    try { if (typeof render === "function") return render(); } catch (e) {}
    if (has("render")) return window.render();
  }
  function callSetPage(page) {
    if (["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"].indexOf(page) >= 0) {
      ensure();
      appCurrent().page = page;
      var content = document.getElementById("content") || window.app;
      if (content) content.innerHTML = callRenderList(page);
      try { if (typeof bindPageActions === "function") bindPageActions(); else if (has("bindPageActions")) window.bindPageActions(); } catch (e) {}
      cleanupNav();
      return;
    }
    try { if (typeof setPage === "function") return setPage(page); } catch (e) {}
    if (has("setPage")) return window.setPage(page);
    appCurrent().page = page;
    callRenderNav();
    callRender();
  }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function appState() {
    try { if (typeof state !== "undefined") return state; } catch (e) {}
    window.state = window.state || {};
    return window.state;
  }
  function appSchemas() {
    try { if (typeof schemas !== "undefined") return schemas; } catch (e) {}
    window.schemas = window.schemas || {};
    return window.schemas;
  }
  function appModules() {
    try { if (typeof modules !== "undefined") return modules; } catch (e) {}
    window.modules = window.modules || [];
    return window.modules;
  }
  function appCurrent() {
    try { if (typeof current !== "undefined") return current; } catch (e) {}
    window.current = window.current || {};
    return window.current;
  }
  function stateArr(module) {
    var s = appState();
    if (!Array.isArray(s[module])) s[module] = [];
    return s[module];
  }
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function money(value, currency) {
    var n = Number(value || 0);
    if (!n) return "";
    return n.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + (currency || "EUR");
  }
  function dateText(value) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("it-IT");
    } catch (e) {
      return String(value);
    }
  }
  function pct(value) {
    var n = Number(value || 0);
    return n ? n.toLocaleString("it-IT", { maximumFractionDigits: 2 }) + "%" : "";
  }
  function getSetting(keys, fallback) {
    var settings = appState().settings;
    for (var i = 0; i < keys.length; i += 1) {
      if (settings && settings[keys[i]]) return settings[keys[i]];
    }
    return fallback || "";
  }
  function textLine(label, value) {
    if (!value && value !== 0) return "";
    return '<div class="pms255-meta"><span>' + esc(label) + '</span><strong>' + esc(value) + "</strong></div>";
  }
  function cell(label, value) {
    return '<td><span>' + esc(label) + '</span><strong>' + esc(value || "") + "</strong></td>";
  }
  function section(title, body) {
    return '<section class="pms255-section"><h3>' + esc(title) + "</h3>" + body + "</section>";
  }
  function rows(items) {
    return '<table class="pms255-grid"><tbody>' + items.map(function (item) {
      return "<tr>" + item + "</tr>";
    }).join("") + "</tbody></table>";
  }

  function printStyles() {
    return [
      "<style>",
      "@page{size:A4;margin:14mm}",
      "body{font-family:Arial,Helvetica,sans-serif;color:#17201b;margin:0;background:#fff;font-size:12px}",
      ".pms255-wrap{max-width:780px;margin:0 auto}",
      ".pms255-head{text-align:center;padding:4px 0 14px;margin-bottom:18px;border-bottom:1px solid #d9e2dc}",
      ".pms255-logo{font-size:31px;line-height:1;font-weight:800;letter-spacing:2px;color:#155734}",
      ".pms255-logo small{display:block;font-size:10px;letter-spacing:3px;margin-top:4px;color:#7b1f1f}",
      ".pms255-rule{display:grid;grid-template-columns:1fr 1fr 1fr;height:4px;margin:11px auto 9px;max-width:310px;border-radius:8px;overflow:hidden}",
      ".pms255-rule i:nth-child(1){background:#166534}.pms255-rule i:nth-child(2){background:#fff;border-top:1px solid #ddd;border-bottom:1px solid #ddd}.pms255-rule i:nth-child(3){background:#b91c1c}",
      ".pms255-company{font-size:10px;color:#475569;line-height:1.45;text-transform:uppercase}",
      "h1{font-size:19px;color:#163b2a;margin:0 0 12px;text-align:center}",
      "h2{font-size:14px;color:#163b2a;margin:12px 0 8px}",
      ".pms255-sub{font-size:11px;color:#64748b;text-align:center;margin-top:-6px;margin-bottom:14px}",
      ".pms255-meta-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}",
      ".pms255-meta{border:1px solid #d9e2dc;border-radius:6px;padding:7px;min-height:32px}",
      ".pms255-meta span,.pms255-grid span{display:block;color:#64748b;font-size:9px;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px}",
      ".pms255-meta strong,.pms255-grid strong{display:block;color:#17201b;font-weight:700;white-space:pre-wrap}",
      ".pms255-section{margin-top:12px;break-inside:avoid}",
      ".pms255-section h3{font-size:12px;color:#155734;margin:0 0 6px;border-bottom:2px solid #155734;padding-bottom:4px}",
      ".pms255-grid{width:100%;border-collapse:collapse;table-layout:fixed}",
      ".pms255-grid td,.pms255-grid th{border:1px solid #d9e2dc;padding:7px;vertical-align:top;word-break:break-word}",
      ".pms255-grid th{background:#155734;color:#fff;text-align:left}",
      ".pms255-note{border-left:4px solid #b91c1c;background:#fff7f7;padding:9px;margin-top:10px;line-height:1.45}",
      ".pms255-foot{margin-top:22px;border-top:1px solid #d9e2dc;padding-top:8px;font-size:10px;color:#64748b;text-align:center}",
      "@media print{button{display:none!important}.pms255-wrap{max-width:none}}",
      "</style>"
    ].join("");
  }

  function companyHeader(title, code, subtitle) {
    var legal = getSetting(["legalName", "companyName", "ragioneSociale"], "PARMITALIA DISTRIBUTION SRL");
    var address = getSetting(["address", "companyAddress", "sede"], "");
    var vat = getSetting(["vat", "vatNumber", "piva", "partitaIva"], "");
    var phone = getSetting(["phone", "companyPhone", "telefono"], "");
    var email = getSetting(["email", "companyEmail"], "");
    var contactBits = [address, vat ? "P.IVA " + vat : "", phone, email].filter(Boolean).join(" | ");
    return [
      '<header class="pms255-head">',
      '<div class="pms255-logo">PARMITALIA<small>DISTRIBUTION SRL</small></div>',
      '<div class="pms255-rule"><i></i><i></i><i></i></div>',
      '<div class="pms255-company"><strong>' + esc(legal) + "</strong>" + (contactBits ? "<br>" + esc(contactBits) : "") + "</div>",
      title ? '<div class="pms255-meta-row">' + textLine("Documento", title) + textLine("Codice", code || "") + textLine("Data", new Date().toLocaleDateString("it-IT")) + "</div>" : "",
      subtitle ? '<div class="pms255-sub">' + esc(subtitle) + "</div>" : "",
      "</header>"
    ].join("");
  }

  function printHtml(title, subtitle, body) {
    return "<!doctype html><html><head><meta charset=\"utf-8\"><title>" + esc(title) + "</title>" + printStyles() + "</head><body><div class=\"pms255-wrap\">" + companyHeader() + "<h1>" + esc(title) + "</h1>" + (subtitle ? '<div class="pms255-sub">' + esc(subtitle) + "</div>" : "") + body + "<div class=\"pms255-foot\">Documento generato dal gestionale PARMITALIA</div></div></body></html>";
  }

  function openPrint(title, subtitle, body) {
    var w = window.open("", "_blank");
    if (!w) {
      alert("Popup bloccato. Abilitare le finestre popup per stampare il documento.");
      return;
    }
    w.document.open();
    w.document.write(printHtml(title, subtitle, body));
    w.document.close();
    setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 350);
  }

  function field(name, label, type, options) {
    var out = { key: name, label: label, type: type || "text" };
    if (options) out.options = options;
    return out;
  }

  function ensureModules() {
    var list = appModules();
    for (var i = list.length - 1; i >= 0; i -= 1) {
      if (!list[i] || HIDDEN_MODULES[list[i].id]) list.splice(i, 1);
    }
    [
      { id: "businessTrips", label: "Business Trip", subtitle: "Road trip clienti, fornitori, hotel e budget", roles: ["admin", "assistant", "agent"] },
      { id: "driverRecruiting", label: "Recruiting Autisti", subtitle: "Autisti, documenti e condizioni lavoro modificabili", roles: ["admin", "assistant", "recruiter"] },
      { id: "tractorIntermediations", label: "Trattori Autostradali", subtitle: "Intermediazione vendita mezzi e destinazioni extra UE", roles: ["admin", "assistant", "agent"] },
      { id: "financialChecks", label: "Verifica Finanziaria", subtitle: "Clienti, fornitori e stima rischio", roles: ["admin", "assistant", "accountant", "agent"] }
    ].forEach(function (module) {
      if (!list.some(function (m) { return m.id === module.id; })) list.push(module);
    });
  }

  function ensureSchemas() {
    var sx = appSchemas();
    sx.businessTrips = {
      title: "Business Trip / Road Trip Clienti",
      fields: [
        field("tripCode", "Codice trasferta"), field("client", "Cliente"), field("participants", "Partecipanti", "textarea"),
        field("startDate", "Data inizio", "date"), field("endDate", "Data fine", "date"), field("citiesCountries", "Citta / Paesi"),
        field("tripObjective", "Obiettivo viaggio", "textarea"), field("mainSupplier", "Fornitore/partner principale"),
        field("selectedSuppliers", "Fornitori/partner selezionati", "textarea"), field("supplierAddress", "Indirizzo fornitore"),
        field("supplierContact", "Referente"), field("supplierContacts", "Contatti"), field("visitReason", "Motivo visita", "textarea"),
        field("priority", "Priorita", "select", ["Alta", "Media", "Bassa"]), field("confirmationStatus", "Stato conferma", "select", ["Da confermare", "Confermato", "Opzione", "Annullato"]),
        field("appointmentAt", "Data/ora appuntamento", "datetime-local"), field("supplierNotes", "Note fornitore", "textarea"),
        field("newSupplierCode", "Codice nuovo fornitore"), field("newSupplierName", "Nuovo fornitore/partner da codificare"),
        field("newSupplierPhone", "Telefono nuovo fornitore"), field("newSupplierEmail", "Email nuovo fornitore"),
        field("itinerary", "Itinerario / tappe", "textarea"), field("estimatedKm", "Km stimati", "number"), field("estimatedTravelTime", "Tempi stimati"),
        field("transfers", "Trasferimenti", "textarea"), field("flightsAirports", "Voli / aeroporti", "textarea"), field("carRentalDriver", "Auto / noleggio / driver", "textarea"),
        field("hotelOptions", "Opzioni hotel", "textarea"), field("hotelCity", "Citta hotel"), field("hotelName", "Hotel selezionato"),
        field("hotelAddress", "Indirizzo hotel"), field("checkIn", "Check-in", "date"), field("checkOut", "Check-out", "date"),
        field("hotelCost", "Costo hotel", "number"), field("hotelBookingStatus", "Stato prenotazione hotel", "select", ["Da prenotare", "Opzione", "Prenotato", "Pagato", "Annullato"]),
        field("restaurantsHospitality", "Ristoranti / ospitalita", "textarea"), field("estimatedBudget", "Budget stimato", "number"),
        field("actualBudget", "Budget consuntivo", "number"), field("currency", "Valuta", "select", ["EUR", "USD", "GBP"]),
        field("documentsLinks", "Documenti / allegati", "textarea"), field("operationalNotes", "Note operative", "textarea"),
        field("finalOutcome", "Esito finale", "textarea"), field("followUp", "Follow-up", "textarea")
      ]
    };
    sx.driverRecruiting = {
      title: "Recruiting Autisti",
      fields: [
        field("candidateName", "Autista / candidato"), field("phone", "Telefono"), field("email", "Email"), field("country", "Paese"),
        field("licenseType", "Patente / CQC"), field("experienceYears", "Anni esperienza", "number"), field("routes", "Tratte disponibili"),
        field("availabilityDate", "Disponibilita dal", "date"), field("contractType", "Tipo contratto"), field("salary", "Retribuzione"), field("workingHours", "Orario lavoro"),
        field("restDays", "Riposi"), field("allowances", "Indennita / trasferte"), field("vehicleType", "Mezzo assegnabile"),
        field("workConditions", "Condizioni lavoro modificabili", "textarea"), field("documentsStatus", "Documenti", "select", ["Da verificare", "Completi", "Mancanti", "Non idoneo"]),
        field("status", "Stato", "select", ["Nuovo", "In valutazione", "Colloquio", "Idoneo", "Non idoneo", "Assunto"]), field("notes", "Note", "textarea")
      ]
    };
    sx.tractorIntermediations = {
      title: "Intermediazione Trattori Autostradali",
      fields: [
        field("practiceCode", "Codice pratica"), field("client", "Cliente acquirente"), field("seller", "Venditore"), field("brand", "Marca", "select", ["DAF", "Iveco", "MAN", "Mercedes-Benz", "Renault Trucks", "Scania", "Volvo", "Altro"]),
        field("model", "Modello"), field("year", "Anno", "number"), field("vin", "Telaio / VIN"), field("plate", "Targa"), field("km", "Km", "number"),
        field("emissionClass", "Classe emissioni", "select", ["Euro 3", "Euro 4", "Euro 5", "Euro 6", "Altro"]), field("condition", "Stato mezzo", "select", ["Da verificare", "Disponibile", "Opzionato", "Venduto", "Non idoneo"]),
        field("salePrice", "Prezzo vendita", "number"), field("currency", "Valuta", "select", ["EUR", "USD", "GBP"]), field("commissionPct", "% commissione", "number"), field("commissionAmount", "Commissione importo", "number"),
        field("registrationCountry", "Paese immatricolazione"), field("registrationDate", "Data immatricolazione", "date"), field("documents", "Documenti mezzo", "textarea"), field("technicalNotes", "Scheda tecnica / note vendita", "textarea"),
        field("destinationCountry", "Paese extra UE destinazione"), field("finalDestination", "Destinazione finale trattore"), field("exportLaws", "Leggi / requisiti da rispettare", "textarea"),
        field("customsDocs", "Dogana / export / documenti", "textarea"), field("complianceStatus", "Stato conformita", "select", ["Da verificare", "In verifica", "Conforme", "Da integrare", "Bloccato"]), field("notes", "Note", "textarea")
      ]
    };
    sx.financialChecks = {
      title: "Verifica Finanziaria Clienti/Fornitori",
      fields: [
        field("date", "Data verifica", "date"), field("subjectName", "Cliente / fornitore"), field("subjectType", "Tipo soggetto", "select", ["Cliente", "Fornitore", "Partner", "Altro"]),
        field("vat", "P.IVA / Tax ID"), field("country", "Paese"), field("requestedLimit", "Fido / esposizione richiesta", "number"), field("currency", "Valuta", "select", ["EUR", "USD", "GBP"]),
        field("paymentTerms", "Condizioni pagamento"), field("yearsActive", "Anni attivita", "number"), field("turnoverEstimate", "Fatturato stimato", "number"),
        field("overdueHistory", "Storico insoluti/ritardi", "select", ["Nessuno", "Limitato", "Ricorrente", "Grave"]), field("documentsStatus", "Documenti finanziari", "select", ["Completi", "Parziali", "Mancanti"]),
        field("insuranceStatus", "Copertura assicurativa credito", "select", ["Presente", "Non presente", "Da verificare"]), field("publicInfo", "Informazioni pubbliche / banche dati", "textarea"),
        field("riskEstimate", "Stima rischio", "select", ["Basso", "Medio", "Alto"]), field("riskReason", "Motivazione rischio", "textarea"),
        field("recommendedAction", "Azione consigliata", "textarea"), field("status", "Stato verifica", "select", ["Bozza", "In verifica", "Approvato", "Approvato con limiti", "Non approvato"])
      ]
    };

    if (sx.orders && Array.isArray(sx.orders.fields)) {
      [["destination", "Destinazione merce"], ["destinationCountry", "Paese destinazione"], ["deliveryAddress", "Indirizzo destinazione"]].forEach(function (f) {
        if (!sx.orders.fields.some(function (x) { return x.key === f[0]; })) sx.orders.fields.push(field(f[0], f[1]));
      });
    }
    if (sx.offers && Array.isArray(sx.offers.fields)) {
      if (!sx.offers.fields.some(function (x) { return x.key === "offerKind"; })) {
        sx.offers.fields.push(field("offerKind", "Tipo offerta", "select", ["Diretta", "Intermediazione", "Brokeraggio"]));
      }
      if (!sx.offers.fields.some(function (x) { return x.key === "commissionPct"; })) {
        sx.offers.fields.push(field("commissionPct", "% commissione / brokeraggio / margine", "number"));
      }
    }
  }

  function ensurePrefixes() {
    if (window.__pms255PrefixWrapped) return;
    var basePrefix = null;
    try { if (typeof modulePrefix === "function") basePrefix = modulePrefix; } catch (e) { basePrefix = typeof window.modulePrefix === "function" ? window.modulePrefix : null; }
    var nextPrefix = function (module) {
      var map = { businessTrips: "BT", driverRecruiting: "DRV", tractorIntermediations: "TRK", financialChecks: "FIN" };
      return map[module] || (basePrefix ? basePrefix(module) : "REC");
    };
    try { modulePrefix = nextPrefix; } catch (e) {}
    window.modulePrefix = nextPrefix;
    window.__pms255PrefixWrapped = true;
  }

  function calcCommissionAmount(row) {
    var price = Number(row.salePrice || row.price || row.total || 0);
    var percent = Number(row.commissionPct || row.parmitaliaCommissionPct || row.marginPct || 0);
    return price && percent ? price * percent / 100 : Number(row.commissionAmount || 0);
  }

  function computeRisk(row) {
    var score = 0;
    var limit = Number(row.requestedLimit || 0);
    if (limit > 100000) score += 2;
    else if (limit > 30000) score += 1;
    if (Number(row.yearsActive || 0) < 2) score += 1;
    if (row.overdueHistory === "Ricorrente") score += 2;
    if (row.overdueHistory === "Grave") score += 3;
    if (row.documentsStatus === "Parziali") score += 1;
    if (row.documentsStatus === "Mancanti") score += 2;
    if (row.insuranceStatus === "Non presente") score += 1;
    if (row.status === "Non approvato") score += 3;
    return score >= 4 ? "Alto" : score >= 2 ? "Medio" : "Basso";
  }

  function normalizeData() {
    stateArr("businessTrips");
    stateArr("driverRecruiting");
    stateArr("tractorIntermediations");
    stateArr("financialChecks");
    stateArr("orders").forEach(function (order) {
      order.destination = order.destination || order.destinationCity || order.city || order.deliveryPlace || "";
      order.destinationCountry = order.destinationCountry || order.country || "";
      order.deliveryAddress = order.deliveryAddress || order.address || order.deliveryAddressText || "";
    });
    stateArr("offers").forEach(function (offer) {
      if (offer.commissionPct == null && offer.parmitaliaCommissionPct != null) offer.commissionPct = offer.parmitaliaCommissionPct;
      if (!offer.offerKind && Number(offer.commissionPct || 0) > 0) offer.offerKind = "Intermediazione";
    });
    stateArr("tractorIntermediations").forEach(function (row) {
      if (!row.commissionAmount) row.commissionAmount = calcCommissionAmount(row);
    });
    stateArr("financialChecks").forEach(function (row) {
      if (!row.riskEstimate) row.riskEstimate = computeRisk(row);
    });
  }

  function maybeCreateSupplier(row) {
    if (!row || !row.newSupplierName) return;
    var contacts = stateArr("contacts");
    var exists = contacts.some(function (c) {
      return String(c.name || c.company || "").toLowerCase() === String(row.newSupplierName).toLowerCase();
    });
    if (exists) return;
    var code = row.newSupplierCode || ("CNT-" + String(contacts.length + 1).padStart(4, "0"));
    contacts.push({
      id: code,
      code: code,
      name: row.newSupplierName,
      company: row.newSupplierName,
      type: "Fornitore",
      address: row.supplierAddress || "",
      phone: row.newSupplierPhone || row.supplierContacts || "",
      email: row.newSupplierEmail || "",
      contactPerson: row.supplierContact || "",
      notes: "Creato da modulo Business Trip " + (row.tripCode || "")
    });
  }

  var oldGetColumns = null;
  try { if (typeof getColumns === "function") oldGetColumns = getColumns; } catch (e) { oldGetColumns = window.getColumns; }
  var nextGetColumns = function (module) {
    if (module === "businessTrips") return ["tripCode", "client", "citiesCountries", "startDate", "mainSupplier", "confirmationStatus", "estimatedBudget", "actions"];
    if (module === "driverRecruiting") return ["candidateName", "phone", "licenseType", "availabilityDate", "salary", "status", "actions"];
    if (module === "tractorIntermediations") return ["practiceCode", "client", "brand", "model", "year", "destinationCountry", "commissionPct", "complianceStatus", "actions"];
    if (module === "financialChecks") return ["date", "subjectName", "subjectType", "requestedLimit", "riskEstimate", "status", "actions"];
    return oldGetColumns ? oldGetColumns(module) : [];
  };
  try { getColumns = nextGetColumns; } catch (e) {}
  window.getColumns = nextGetColumns;

  var oldColumnLabel = null;
  try { if (typeof columnLabel === "function") oldColumnLabel = columnLabel; } catch (e) { oldColumnLabel = window.columnLabel; }
  var nextColumnLabel = function (column) {
    var labels = {
      tripCode: "Codice", client: "Cliente", citiesCountries: "Citta/Paesi", startDate: "Inizio", mainSupplier: "Fornitore", confirmationStatus: "Conferma", estimatedBudget: "Budget",
      candidateName: "Autista", licenseType: "Patente", availabilityDate: "Disponibile", salary: "Condizioni", practiceCode: "Pratica", brand: "Marca", model: "Modello", year: "Anno",
      destinationCountry: "Destinazione", commissionPct: "% Comm.", complianceStatus: "Conformita", date: "Data", subjectName: "Soggetto", subjectType: "Tipo", requestedLimit: "Fido", riskEstimate: "Rischio"
    };
    return labels[column] || (oldColumnLabel ? oldColumnLabel(column) : column);
  };
  try { columnLabel = nextColumnLabel; } catch (e) {}
  window.columnLabel = nextColumnLabel;

  var oldCellValue = null;
  try { if (typeof cellValue === "function") oldCellValue = cellValue; } catch (e) { oldCellValue = window.cellValue; }
  var nextCellValue = function (module, item, column) {
    if (["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"].indexOf(module) >= 0 && column === "actions") {
      return '<button class="inline-button" data-edit="' + esc(module) + '" data-id="' + esc(item.id) + '">Modifica</button> <button class="inline-button" data-pms255-print="' + esc(module + "|" + item.id) + '">Stampa</button> <button class="inline-danger" data-delete="' + esc(module) + '" data-id="' + esc(item.id) + '">Elimina</button>';
    }
    if (column === "estimatedBudget" || column === "requestedLimit") return money(item[column], item.currency);
    if (column === "commissionPct") return pct(item[column]);
    if (column === "startDate" || column === "availabilityDate" || column === "date") return dateText(item[column]);
    if (["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"].indexOf(module) >= 0) return item[column] || "";
    return oldCellValue ? oldCellValue(module, item, column) : (item && item[column]) || "";
  };
  try { cellValue = nextCellValue; } catch (e) {}
  window.cellValue = nextCellValue;

  var oldSubmitModal = null;
  try { if (typeof submitModal === "function") oldSubmitModal = submitModal; } catch (e) { oldSubmitModal = window.submitModal; }
  var nextSubmitModal = function (event, module, id) {
    var result = oldSubmitModal ? oldSubmitModal(event, module, id) : undefined;
    setTimeout(function () {
      stateArr(module).forEach(function (row) {
        if (module === "businessTrips") maybeCreateSupplier(row);
        if (module === "financialChecks") row.riskEstimate = row.riskEstimate || computeRisk(row);
        if (module === "tractorIntermediations" && !row.commissionAmount) row.commissionAmount = calcCommissionAmount(row);
      });
      if (has("save")) window.save();
    }, 60);
    return result;
  };
  try { submitModal = nextSubmitModal; } catch (e) {}
  window.submitModal = nextSubmitModal;

  function isBrokerageOffer(offer) {
    var kind = String(offer.offerKind || offer.type || offer.offerType || "").toLowerCase();
    return kind.indexOf("intermedia") >= 0 || kind.indexOf("broker") >= 0 || Number(offer.commissionPct || offer.parmitaliaCommissionPct || 0) > 0;
  }

  function offerAmount(offer) {
    return Number(offer.price || offer.unitPrice || offer.amount || offer.total || offer.value || 0);
  }

  function printOffer255(id) {
    var offer = stateArr("offers").find(function (x) { return String(x.id) === String(id); });
    if (!offer) return alert("Offerta non trovata.");
    var amount = offerAmount(offer);
    var commissionPercent = Number(offer.commissionPct || offer.parmitaliaCommissionPct || 0);
    var commissionAmount = amount && commissionPercent ? amount * commissionPercent / 100 : Number(offer.commissionAmount || 0);
    var body = "";
    body += '<div class="pms255-meta-row">' + textLine("Numero offerta", offer.id || offer.code || "") + textLine("Cliente", offer.client || offer.customer || "") + textLine("Data", dateText(offer.date || offer.createdAt)) + "</div>";
    body += section("Dettagli commerciali", rows([
      cell("Prodotto / merce", offer.product || offer.productName || offer.item || ""),
      cell("Descrizione merce", offer.description || offer.goodsDescription || offer.productDescription || ""),
      cell("Quantita", offer.quantity || offer.qty || ""),
      cell("Prezzo / valore", money(amount, offer.currency)),
      cell("% commissione / brokeraggio / margine", pct(commissionPercent)),
      cell("Commissione stimata", money(commissionAmount, offer.currency))
    ]));
    body += section("Condizioni", rows([
      cell("Pagamento", offer.payment || offer.paymentTerms || ""),
      cell("Consegna", offer.delivery || offer.deliveryTerms || ""),
      cell("Validita", offer.validity || offer.expiry || ""),
      cell("Note", offer.notes || "")
    ]));
    if (isBrokerageOffer(offer)) {
      body += '<div class="pms255-note"><strong>Intermediazione commerciale</strong><br>PARMITALIA DISTRIBUTION SRL opera quale intermediario commerciale principale per le operazioni e le attivita di intermediazione oggetto della presente offerta.<br>PARMITALIA DISTRIBUTION SRL acts as the principal commercial intermediary/broker for the transactions and commercial intermediation activities covered by this offer.</div>';
    }
    openPrint("Offerta commerciale", "Descrizione merce riportata una sola volta", body);
  }

  function printOrder255(id) {
    var order = stateArr("orders").find(function (x) { return String(x.id) === String(id); });
    if (!order) return alert("Ordine non trovato.");
    var body = "";
    body += '<div class="pms255-meta-row">' + textLine("Numero ordine", order.id || order.code || "") + textLine("Cliente", order.client || order.customer || "") + textLine("Fornitore", order.supplier || "") + "</div>";
    body += section("Merce e condizioni", rows([
      cell("Prodotto", order.product || order.productName || ""),
      cell("Descrizione", order.description || order.goodsDescription || ""),
      cell("Quantita", order.quantity || order.qty || ""),
      cell("Pagamento", order.payment || order.paymentTerms || ""),
      cell("Consegna", order.delivery || order.deliveryTerms || ""),
      cell("Date", [dateText(order.date), dateText(order.deliveryDate)].filter(Boolean).join(" - "))
    ]));
    body += section("Destinazione", rows([
      cell("Destinazione merce", order.destination || order.destinationCity || order.deliveryPlace || ""),
      cell("Paese destinazione", order.destinationCountry || order.country || ""),
      cell("Indirizzo destinazione", order.deliveryAddress || order.address || "")
    ]));
    if (order.notes) body += section("Note", '<p>' + esc(order.notes) + "</p>");
    openPrint("Ordine", "Stampa ordine con destinazione merce", body);
  }

  function printBusinessTrip(id) {
    var row = stateArr("businessTrips").find(function (x) { return String(x.id) === String(id); });
    if (!row) return alert("Business trip non trovato.");
    var body = "";
    body += '<div class="pms255-meta-row">' + textLine("Codice trasferta", row.tripCode || row.id) + textLine("Cliente", row.client) + textLine("Date", [dateText(row.startDate), dateText(row.endDate)].filter(Boolean).join(" - ")) + "</div>";
    body += section("Obiettivo e partecipanti", rows([cell("Partecipanti", row.participants), cell("Citta / Paesi", row.citiesCountries), cell("Obiettivo", row.tripObjective)]));
    body += section("Fornitori / partner", rows([cell("Fornitore principale", row.mainSupplier), cell("Fornitori selezionati", row.selectedSuppliers), cell("Indirizzo", row.supplierAddress), cell("Referente", row.supplierContact), cell("Contatti", row.supplierContacts), cell("Motivo visita", row.visitReason), cell("Priorita", row.priority), cell("Conferma", row.confirmationStatus), cell("Appuntamento", row.appointmentAt), cell("Note", row.supplierNotes)]));
    body += section("Itinerario e trasferimenti", rows([cell("Tappe", row.itinerary), cell("Km stimati", row.estimatedKm), cell("Tempi stimati", row.estimatedTravelTime), cell("Trasferimenti", row.transfers), cell("Voli / aeroporti", row.flightsAirports), cell("Auto / driver", row.carRentalDriver)]));
    body += section("Hotel e ospitalita", rows([cell("Opzioni hotel", row.hotelOptions), cell("Citta", row.hotelCity), cell("Hotel", row.hotelName), cell("Indirizzo", row.hotelAddress), cell("Check-in/out", [dateText(row.checkIn), dateText(row.checkOut)].filter(Boolean).join(" - ")), cell("Costo", money(row.hotelCost, row.currency)), cell("Prenotazione", row.hotelBookingStatus), cell("Ristoranti / ospitalita", row.restaurantsHospitality)]));
    body += section("Budget, documenti, follow-up", rows([cell("Budget stimato", money(row.estimatedBudget, row.currency)), cell("Budget consuntivo", money(row.actualBudget, row.currency)), cell("Documenti / allegati", row.documentsLinks), cell("Note operative", row.operationalNotes), cell("Esito finale", row.finalOutcome), cell("Follow-up", row.followUp)]));
    openPrint("Business Trip / Road Trip Clienti", row.client || "", body);
  }

  function printDriver(id) {
    var row = stateArr("driverRecruiting").find(function (x) { return String(x.id) === String(id); });
    if (!row) return alert("Scheda autista non trovata.");
    var body = section("Scheda Recruiting Autisti", rows([
      cell("Autista", row.candidateName), cell("Contatti", [row.phone, row.email].filter(Boolean).join(" | ")), cell("Paese", row.country),
      cell("Patente / CQC", row.licenseType), cell("Esperienza", row.experienceYears), cell("Disponibilita", dateText(row.availabilityDate)),
      cell("Contratto", row.contractType), cell("Retribuzione", row.salary), cell("Orario", row.workingHours), cell("Riposi", row.restDays),
      cell("Indennita", row.allowances), cell("Mezzo", row.vehicleType), cell("Condizioni lavoro modificabili", row.workConditions),
      cell("Documenti", row.documentsStatus), cell("Stato", row.status), cell("Note", row.notes)
    ]));
    openPrint("Recruiting Autisti", row.candidateName || "", body);
  }

  function printTractor(id) {
    var row = stateArr("tractorIntermediations").find(function (x) { return String(x.id) === String(id); });
    if (!row) return alert("Scheda trattore non trovata.");
    var amount = row.commissionAmount || calcCommissionAmount(row);
    var body = "";
    body += '<div class="pms255-meta-row">' + textLine("Pratica", row.practiceCode || row.id) + textLine("Cliente", row.client) + textLine("Venditore", row.seller) + "</div>";
    body += section("Scheda mezzo", rows([cell("Marca", row.brand), cell("Modello", row.model), cell("Anno", row.year), cell("VIN", row.vin), cell("Targa", row.plate), cell("Km", row.km), cell("Classe emissioni", row.emissionClass), cell("Stato", row.condition), cell("Prezzo", money(row.salePrice, row.currency)), cell("% commissione", pct(row.commissionPct)), cell("Commissione", money(amount, row.currency))]));
    body += section("Destinazione extra UE e conformita", rows([cell("Paese destinazione", row.destinationCountry), cell("Destinazione finale", row.finalDestination), cell("Leggi / requisiti", row.exportLaws), cell("Dogana / export", row.customsDocs), cell("Stato conformita", row.complianceStatus)]));
    body += section("Documenti e note", rows([cell("Paese immatricolazione", row.registrationCountry), cell("Data immatricolazione", dateText(row.registrationDate)), cell("Documenti", row.documents), cell("Scheda tecnica", row.technicalNotes), cell("Note", row.notes)]));
    openPrint("Intermediazione Trattori Autostradali", [row.brand, row.model].filter(Boolean).join(" "), body);
  }

  function printFinancial(id) {
    var row = stateArr("financialChecks").find(function (x) { return String(x.id) === String(id); });
    if (!row) return alert("Verifica finanziaria non trovata.");
    row.riskEstimate = row.riskEstimate || computeRisk(row);
    var body = section("Verifica finanziaria", rows([
      cell("Data", dateText(row.date)), cell("Soggetto", row.subjectName), cell("Tipo", row.subjectType), cell("P.IVA / Tax ID", row.vat), cell("Paese", row.country),
      cell("Fido / esposizione", money(row.requestedLimit, row.currency)), cell("Condizioni pagamento", row.paymentTerms), cell("Anni attivita", row.yearsActive),
      cell("Fatturato stimato", money(row.turnoverEstimate, row.currency)), cell("Storico insoluti", row.overdueHistory), cell("Documenti", row.documentsStatus),
      cell("Assicurazione credito", row.insuranceStatus), cell("Informazioni pubbliche", row.publicInfo), cell("Stima rischio", row.riskEstimate),
      cell("Motivazione", row.riskReason), cell("Azione consigliata", row.recommendedAction), cell("Stato", row.status)
    ]));
    openPrint("Verifica Finanziaria", row.subjectName || "", body);
  }

  var oldRender = null;
  try { if (typeof render === "function") oldRender = render; } catch (e) { oldRender = window.render; }
  var nextRender = function () {
    var cur = appCurrent();
    if (["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"].indexOf(cur && cur.page) >= 0 && hasRenderList()) {
      var content = document.getElementById("content") || window.app;
      if (content) content.innerHTML = callRenderList(cur.page);
      try { if (typeof bindPageActions === "function") bindPageActions(); else if (has("bindPageActions")) window.bindPageActions(); } catch (e) {}
      return;
    }
    return oldRender ? oldRender() : undefined;
  };
  try { render = nextRender; } catch (e) {}
  window.render = nextRender;

  var oldRenderListModule = null;
  try { if (typeof renderListModule === "function") oldRenderListModule = renderListModule; } catch (e) { oldRenderListModule = window.renderListModule; }
  var nextRenderListModule = function (module) {
    return oldRenderListModule ? oldRenderListModule(module) : "";
  };
  try { renderListModule = nextRenderListModule; } catch (e) {}
  window.renderListModule = nextRenderListModule;

  function fallbackPrintButtons() {
    setTimeout(function () {
      document.querySelectorAll("[data-edit]").forEach(function (btn) {
        var module = appCurrent() && appCurrent().page;
        if (["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"].indexOf(module) < 0) return;
        var row = btn.closest("tr");
        if (!row || row.querySelector("[data-pms255-print]")) return;
        var id = btn.getAttribute("data-id") || btn.getAttribute("data-edit");
        var b = document.createElement("button");
        b.className = "btn ghost";
        b.setAttribute("data-pms255-print", module + "|" + id);
        b.textContent = module === "businessTrips" ? "Stampa trasferta" : module === "driverRecruiting" ? "Stampa autista" : module === "tractorIntermediations" ? "Stampa trattore" : "Stampa verifica";
        btn.insertAdjacentElement("afterend", b);
      });
    }, 100);
  }

  var oldBind = null;
  try { if (typeof bindPageActions === "function") oldBind = bindPageActions; } catch (e) { oldBind = window.bindPageActions; }
  var nextBind = function () {
    if (oldBind) oldBind();
    fallbackPrintButtons();
    document.querySelectorAll("[data-pms255-print]").forEach(function (btn) {
      if (btn.dataset.pms255Bound) return;
      btn.dataset.pms255Bound = "1";
      btn.addEventListener("click", function () {
        var parts = String(btn.getAttribute("data-pms255-print") || "").split("|");
        var module = parts[0], id = parts[1];
        if (module === "businessTrips") return printBusinessTrip(id);
        if (module === "driverRecruiting") return printDriver(id);
        if (module === "tractorIntermediations") return printTractor(id);
        if (module === "financialChecks") return printFinancial(id);
      });
    });
  };
  try { bindPageActions = nextBind; } catch (e) {}
  window.bindPageActions = nextBind;

  document.addEventListener("click", function (event) {
    var pageBtn = event.target.closest && event.target.closest("[data-pms152-page],[data-pms227-page],[data-nav]");
    if (pageBtn) {
      var page = pageBtn.getAttribute("data-pms152-page") || pageBtn.getAttribute("data-pms227-page") || pageBtn.getAttribute("data-nav");
      if (["businessTrips", "driverRecruiting", "tractorIntermediations", "financialChecks"].indexOf(page) >= 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        callSetPage(page);
        return;
      }
    }
    var offerBtn = event.target.closest && event.target.closest("[data-print-offer]");
    if (offerBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return printOffer255(offerBtn.getAttribute("data-print-offer"));
    }
    var orderBtn = event.target.closest && event.target.closest([
      "[data-print-order]",
      "[data-pms94-print-order-customer]",
      "[data-pms94-print-order-supplier]",
      "[data-pms110-print-internal]",
      "[data-pms110-print-customer]",
      "[data-pms110-print-supplier]",
      "[data-pms112-print-internal]",
      "[data-pms112-print-customer]",
      "[data-pms112-print-supplier]",
      "[data-pms115-print-internal]",
      "[data-pms115-print-customer]",
      "[data-pms115-print-supplier]",
      "[data-pms117-order-print-customer]",
      "[data-pms117-order-print-supplier]"
    ].join(","));
    if (orderBtn) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var id = ["data-print-order", "data-pms94-print-order-customer", "data-pms94-print-order-supplier", "data-pms110-print-internal", "data-pms110-print-customer", "data-pms110-print-supplier", "data-pms112-print-internal", "data-pms112-print-customer", "data-pms112-print-supplier", "data-pms115-print-internal", "data-pms115-print-customer", "data-pms115-print-supplier", "data-pms117-order-print-customer", "data-pms117-order-print-supplier"].map(function (name) { return orderBtn.getAttribute(name); }).find(Boolean);
      return printOrder255(id);
    }
  }, true);

  function cleanupNav() {
    document.querySelectorAll("[data-nav],button,a,.nav-item,.module-card").forEach(function (el) {
      var target = el.getAttribute && (el.getAttribute("data-nav") || el.getAttribute("href") || "");
      var text = (el.textContent || "").toLowerCase();
      var hideCoffee = target.indexOf("greenCoffee") >= 0 || text.indexOf("caffe crudo") >= 0 || text.indexOf("coffee") >= 0;
      var hideRecruiting = target.indexOf("foreignRecruiting") >= 0 || target.indexOf("humanResources") >= 0 || (text.indexOf("recruiting") >= 0 && text.indexOf("autisti") < 0);
      if (hideCoffee || hideRecruiting) el.style.setProperty("display", "none", "important");
    });
  }

  function ensure() {
    ensureModules();
    ensureSchemas();
    ensurePrefixes();
    normalizeData();
    cleanupNav();
  }

  var obs = new MutationObserver(function () { cleanupNav(); fallbackPrintButtons(); });
  if (document.body) obs.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", ensure);
  [100, 500, 1200, 2500, 5000, 8000].forEach(function (ms) { setTimeout(ensure, ms); });

  ensure();
  if (appCurrent() && appCurrent().user) {
    try { callRenderNav(); callRender(); } catch (e) { console.warn("PMS v255 refresh", e); }
  }
  window.companyPrintHeader = companyHeader;
  window.printOffer = printOffer255;
  window.printOrderV16 = printOrder255;
  window.printBusinessTrip = printBusinessTrip;
  window.printDriverRecruiting = printDriver;
  window.printTractorIntermediation = printTractor;
  window.printFinancialCheck = printFinancial;
  window.PMS_V255_BUSINESS_TRIP_TRUCKS_FINANCE_PRINTS = { version: VERSION, ensure: ensure, printOffer: printOffer255, printOrder: printOrder255 };
  console.log("PMS", VERSION, "loaded");
})();
