(function(){
  "use strict";
  const VERSION = "pms_v158_calendar_colors_commission_foreign_workers";
  const FOREIGN = "foreignEmployees";
  const OUT = "outgoingInvoices";
  const WORKFLOW = "billingWorkflow";
  const COLORS = ["blue", "green", "yellow", "red"];
  const COLOR_LABELS = {blue:"Azzurro", green:"Verde", yellow:"Giallo", red:"Rosso"};

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function arr(value){ return Array.isArray(value) ? value : []; }
  function num(value){
    const n = Number(String(value == null ? "" : value).replace(/\s/g, "").replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function parseDate(value){
    const parts = String(value || "").slice(0, 10).split("-").map(Number);
    if (parts.length !== 3 || parts.some(function(n){ return !Number.isFinite(n); })) return null;
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
  }
  function isoDate(date){
    const d = new Date(date);
    d.setHours(12, 0, 0, 0);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate() ).padStart(2, "0");
  }
  function addDays(value, days){
    const d = parseDate(value) || new Date();
    d.setDate(d.getDate() + Number(days || 0));
    return isoDate(d);
  }
  function mondayOf(value){
    const d = parseDate(value) || new Date();
    const day = d.getDay() || 7;
    d.setDate(d.getDate() - day + 1);
    return isoDate(d);
  }
  function diffDays(a, b){
    const da = parseDate(a), db = parseDate(b);
    if (!da || !db) return 0;
    return Math.round((da - db) / 86400000);
  }
  function formatDate(value){
    const d = parseDate(value);
    return d ? d.toLocaleDateString("it-IT", {day:"2-digit", month:"2-digit", year:"numeric"}) : "-";
  }
  function money(value, currency){
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT", {minimumFractionDigits:2, maximumFractionDigits:2});
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.orders = arr(state.orders);
    state.intermediations = arr(state.intermediations);
    state.tasks = arr(state.tasks);
    state.dashboardAgenda = arr(state.dashboardAgenda);
    state[OUT] = arr(state[OUT]);
    state[WORKFLOW] = arr(state[WORKFLOW]);
    state[FOREIGN] = arr(state[FOREIGN]);
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio non riuscito.");
      return false;
    }
  }
  function nextCode(prefix, list){
    const year = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + year + "-(\\d{4})$");
    const max = arr(list).reduce(function(found, item){
      return [item && item.id, item && item.code, item && item.protocol, item && item.number].reduce(function(inner, value){
        const m = String(value || "").match(re);
        return m ? Math.max(inner, Number(m[1])) : inner;
      }, found);
    }, 0);
    return prefix + "-" + year + "-" + String(max + 1).padStart(4, "0");
  }
  function badge(text, cls){
    if (typeof window.badge === "function") return window.badge(text || "-", cls || "primary");
    return '<span class="badge ' + esc(cls || "primary") + '">' + esc(text || "-") + '</span>';
  }
  function openPrintSafe(html){
    if (typeof openPrint === "function") openPrint(html);
    else {
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write("<!doctype html><html><head><meta charset='utf-8'><title>Stampa</title></head><body>" + html + "</body></html>");
      win.document.close();
      win.print();
    }
  }

  function ensureModule(){
    if (!Array.isArray(window.modules)) return;
    let module = modules.find(function(m){ return m.id === FOREIGN; });
    if (!module) {
      const idx = modules.findIndex(function(m){ return m.id === "humanResources"; });
      module = {id:FOREIGN, label:"Dipendenti estero", subtitle:"Pratiche lavoratori esteri, documenti, avvocato, pagamenti e calendario", roles:["admin","assistant","accountant","agent","recruiter"]};
      modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, module);
    } else {
      module.label = "Dipendenti estero";
      module.subtitle = "Pratiche lavoratori esteri, documenti, avvocato, pagamenti e calendario";
      module.roles = Array.from(new Set(arr(module.roles).concat(["admin","assistant","accountant","agent","recruiter"])));
    }
  }
  function ensureData(){
    st();
    ensureModule();
    state[FOREIGN].forEach(function(person){
      person.id = person.id || nextCode("EST", state[FOREIGN]);
      person.currency = person.currency || "EUR";
      person.practiceStatus = person.practiceStatus || person.status || "Pratica aperta";
      person.documentStatus = person.documentStatus || "Da controllare";
      person.payments = arr(person.payments || person.incomeLines).map(function(p){
        return {date:p.date || today(), label:p.label || "Pagamento", amount:p.amount || p.value || "", status:p.status || "Pagato", method:p.method || "", notes:p.notes || ""};
      });
      person.expenses = arr(person.expenses || person.expenseLines).map(function(p){
        return {date:p.date || today(), label:p.label || "Costo", amount:p.amount || p.value || "", status:p.status || "Da pagare", notes:p.notes || ""};
      });
      person.attachments = arr(person.attachments);
      person.legalSteps = arr(person.legalSteps);
      person.calendarColor = person.calendarColor || colorForRecord(person);
    });
  }

  function colorForRecord(item){
    const raw = String(item.calendarColor || item.color || item.priority || item.status || item.practiceStatus || "").toLowerCase();
    if (raw.includes("rosso") || raw.includes("red") || raw.includes("alta") || raw.includes("urgente") || raw.includes("scad") || raw.includes("ritardo") || raw.includes("blocc")) return "red";
    if (raw.includes("giallo") || raw.includes("yellow") || raw.includes("media") || raw.includes("attesa") || raw.includes("document")) return "yellow";
    if (raw.includes("verde") || raw.includes("green") || raw.includes("fatto") || raw.includes("complet") || raw.includes("pagato") || raw.includes("ok")) return "green";
    return "blue";
  }
  function colorIndex(color){ return Math.max(0, COLORS.indexOf(color)); }
  function nextColor(current){ return COLORS[(colorIndex(current) + 1) % COLORS.length]; }
  function setRecordColor(kind, id, color){
    let list = [];
    if (kind === "agenda") list = st().dashboardAgenda;
    if (kind === "task") list = st().tasks;
    if (kind === "crmActivity") list = st().crmActivities;
    const item = list.find(function(row){ return String(row.id || "") === String(id || ""); });
    if (!item) return;
    item.calendarColor = color;
    saveNow();
    render();
  }
  function deleteRecord(kind, id){
    if (!confirm("Eliminare questa nota/evento?")) return;
    if (kind === "agenda") state.dashboardAgenda = arr(st().dashboardAgenda).filter(function(row){ return String(row.id || "") !== String(id || ""); });
    if (kind === "task") state.tasks = arr(st().tasks).filter(function(row){ return String(row.id || "") !== String(id || ""); });
    if (kind === "crmActivity") state.crmActivities = arr(st().crmActivities).filter(function(row){ return String(row.id || "") !== String(id || ""); });
    saveNow();
    render();
  }
  function printSimpleEvent(kind, id){
    const lists = {agenda:st().dashboardAgenda, task:st().tasks, crmActivity:arr(st().crmActivities)};
    const item = arr(lists[kind]).find(function(row){ return String(row.id || "") === String(id || ""); });
    if (!item) return;
    const title = item.title || item.subject || item.company || item.client || "Evento";
    const date = item.date || item.dueDate || item.scheduledDate || "";
    const html = '<div class="print-document"><div class="print-header"><div><h1>' + esc(title) + '</h1><strong>Parmitalia Distribution</strong></div><div class="print-meta">' + esc(formatDate(date)) + '</div></div><table class="print-table"><tr><th>ID</th><td>' + esc(item.id || "") + '</td><th>Stato</th><td>' + esc(item.status || item.priority || "") + '</td></tr><tr><th>Data</th><td>' + esc(formatDate(date)) + '</td><th>Colore</th><td>' + esc(COLOR_LABELS[colorForRecord(item)]) + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(item.notes || item.description || item.message || item.nextAction || "") + '</td></tr></table></div>';
    openPrintSafe(html);
  }
  function decorateCalendars(){
    st();
    decoratePms150Calendar();
    decorateOperationalCalendar();
    decorateCrmCalendar();
  }
  function decoratePms150Calendar(){
    document.querySelectorAll(".pms150-card[data-pms150-kind]").forEach(function(card){
      const kind = card.dataset.pms150Kind;
      const id = card.dataset.pms150Id;
      const list = kind === "agenda" ? st().dashboardAgenda : st().tasks;
      const item = arr(list).find(function(row){ return String(row.id || "") === String(id || ""); });
      if (!item) return;
      const color = colorForRecord(item);
      card.classList.remove("pms158-blue","pms158-green","pms158-yellow","pms158-red");
      card.classList.add("pms158-color-card", "pms158-" + color);
      if (!card.querySelector(".pms158-card-tools")) {
        card.insertAdjacentHTML("beforeend", '<div class="pms158-card-tools"><button type="button" data-pms158-print="' + esc(kind) + ':' + esc(id) + '">Stampa</button><button type="button" data-pms158-color="' + esc(kind) + ':' + esc(id) + '">Colore</button><button type="button" class="danger" data-pms158-delete="' + esc(kind) + ':' + esc(id) + '">Elimina</button></div>');
      }
    });
  }
  function normalizeOperationalOriginal(item){
    if (!item || !String(item.scheduledDate || item.operationalDate || "")) return;
    if (!item.operationalOriginalScheduledDate) {
      item.operationalOriginalScheduledDate = String(item.expectedDelivery || item.deliveryDate || item.requestedDate || item.scheduledDate || item.operationalDate || "").slice(0, 10);
      return true;
    }
    return false;
  }
  function operationalDelay(item){
    normalizeOperationalOriginal(item);
    const scheduled = String(item.scheduledDate || item.operationalDate || "").slice(0, 10);
    const planned = String(item.operationalOriginalScheduledDate || item.expectedDelivery || item.deliveryDate || item.requestedDate || "").slice(0, 10);
    return Math.max(0, diffDays(scheduled, planned));
  }
  function decorateOperationalCalendar(){
    let changed = false;
    document.querySelectorAll(".pms136-card[data-pms136-type][data-pms136-id]").forEach(function(card){
      const type = card.dataset.pms136Type;
      const id = card.dataset.pms136Id;
      const list = type === "order" ? st().orders : st().intermediations;
      const item = arr(list).find(function(row){ return [row.id,row.code,row.orderCode,row.dealCode].map(String).includes(String(id)); });
      if (!item) return;
      if (type === "order" && normalizeOperationalOriginal(item)) changed = true;
      const delay = type === "order" ? operationalDelay(item) : 0;
      card.classList.remove("pms158-delay-1","pms158-delay-2","pms158-delay-3","pms158-delay-4");
      if (delay > 0) {
        const level = delay >= 15 ? 4 : delay >= 8 ? 3 : delay >= 3 ? 2 : 1;
        card.classList.add("pms158-delay-" + level);
        if (!card.querySelector(".pms158-delay-line")) card.insertAdjacentHTML("beforeend", '<div class="pms158-delay-line"></div>');
        const line = card.querySelector(".pms158-delay-line");
        line.textContent = "Ritardo consegna: +" + delay + " giorni";
      } else {
        card.classList.add("pms158-color-card", "pms158-" + colorForRecord(item));
      }
    });
    if (changed) saveNow();
  }
  function decorateCrmCalendar(){
    document.querySelectorAll(".pms158-crm-event[data-pms158-crm-id]").forEach(function(card){
      const item = arr(st().crmActivities).find(function(row){ return String(row.id || "") === String(card.dataset.pms158CrmId || ""); });
      if (!item) return;
      const color = colorForRecord(item);
      card.classList.remove("pms158-blue","pms158-green","pms158-yellow","pms158-red");
      card.classList.add("pms158-color-card", "pms158-" + color);
    });
  }

  function calcOrderTotal(item){
    let total = num(item.total || item.value || item.amount);
    if (total) return total;
    try {
      const lines = JSON.parse(item.orderLineItemsJson || item.multiArticleItemsJson || "[]");
      if (Array.isArray(lines)) {
        total = lines.reduce(function(sum, line){ return sum + num(line.quantity) * num(line.unitPrice || line.price); }, 0);
      }
    } catch(error) {}
    if (total) return total;
    return num(item.quantity) * num(item.unitPrice || item.price);
  }
  function commissionAmount(item){
    const direct = num(item.commissionAmount || item.commission || item.parmitaliaCommissionAmount);
    if (direct) return direct;
    const pct = num(item.commissionPct || item.commissionPercent || item.parmitaliaCommissionPct);
    const base = calcOrderTotal(item);
    return pct && base ? base * pct / 100 : 0;
  }
  function findOperationalItem(type, id){
    const list = type === "order" ? st().orders : st().intermediations;
    return arr(list).find(function(item){
      return [item.id, item.code, item.orderCode, item.dealCode].map(function(v){ return String(v || ""); }).includes(String(id || ""));
    });
  }
  function existingCommissionInvoice(type, item){
    const sourceId = String(item.id || item.code || "");
    return arr(st()[OUT]).find(function(inv){
      return String(inv.sourceOperationalType || "") === type &&
        String(inv.sourceOperationalId || "") === sourceId &&
        String(inv.invoiceNature || "").toLowerCase().includes("commission");
    });
  }
  function closePracticeCommission(type, id){
    const item = findOperationalItem(type, id);
    if (!item) return alert("Pratica non trovata.");
    const amount = type === "order" ? commissionAmount(item) : (num(item.commissionAmount || item.commission) || (num(item.value) * num(item.commissionPct) / 100));
    let finalAmount = amount;
    if (!finalAmount) {
      const entered = prompt("Importo provvigione da fatturare", "0");
      finalAmount = num(entered);
      if (!finalAmount) return alert("Inserisci un importo provvigione valido.");
    }
    const protocol = existingCommissionInvoice(type, item) || {};
    const idCode = item.code || item.orderCode || item.dealCode || item.id || "";
    const invoiceId = protocol.id || nextCode("FOUT", st()[OUT]);
    const currency = item.currency || st().settings.defaultCurrency || "EUR";
    const payer = item.commissionPayer || item.commissionClient || item.client || item.customer || "";
    const invoice = protocol.id ? protocol : {
      id: invoiceId,
      protocol: invoiceId,
      number: invoiceId,
      date: today(),
      dueDate: addDays(today(), 30),
      currency: currency,
      status: "Bozza",
      anafStatus: "Da inviare",
      partyName: payer,
      partyVat: item.commissionPayerVat || item.clientVat || "",
      partyAddress: item.commissionPayerAddress || item.clientAddress || "",
      partyCountry: item.commissionPayerCountry || item.clientCountry || "",
      partyEmail: item.commissionPayerEmail || item.clientEmail || "",
      project: idCode,
      linkedPractice: idCode,
      sourceOperationalType: type,
      sourceOperationalId: item.id || item.code || "",
      sourceOrderId: type === "order" ? (item.id || item.code || "") : "",
      sourceIntermediationId: type === "deal" ? (item.id || item.code || "") : "",
      invoiceNature: "Commissione / provvigione",
      paymentTerms: item.paymentTerms || "30 giorni data fattura",
      paymentMethod: "Bonifico bancario",
      items: [{
        description: "Provvigione Parmitalia su " + (type === "order" ? "ordine " : "trattativa ") + idCode + " - " + (item.product || item.productName || ""),
        quantity: 1,
        unit: "servizio",
        unitPrice: Math.round(finalAmount * 100) / 100,
        vatRate: 0
      }],
      amount: Math.round(finalAmount * 100) / 100,
      vatAmount: 0,
      total: Math.round(finalAmount * 100) / 100,
      notes: "Fattura automatica della sola provvigione/commissione. Non e fattura della merce."
    };
    if (!protocol.id) st()[OUT].unshift(invoice);
    const wfId = nextCode("FAT", st()[WORKFLOW]);
    let wf = arr(st()[WORKFLOW]).find(function(row){ return String(row.practiceCode || "") === String(idCode || ""); });
    if (!wf) {
      wf = {id:wfId, practiceCode:idCode, client:item.client || "", supplier:item.supplier || "", invoiceStatus:"Bozza", damageCheck:item.damageCheck || "Tutto a posto", linkedInvoice:invoice.id, sourceOperationalType:type, sourceOperationalId:item.id || item.code || "", notes:"Pratica chiusa: generata fattura della provvigione, non della merce."};
      st()[WORKFLOW].unshift(wf);
    } else {
      wf.linkedInvoice = invoice.id;
      wf.invoiceStatus = wf.invoiceStatus || "Bozza";
      wf.notes = "Pratica chiusa: generata fattura della provvigione, non della merce.";
    }
    const now = new Date().toISOString();
    item.operationalClosed = true;
    item.operationalClosedAt = item.operationalClosedAt || now;
    item.closedAt = item.closedAt || now;
    item.status = "Chiuso - in fatturazione";
    item.billingStatus = "Da fatturare provvigione";
    item.invoiceStatus = "Bozza provvigione";
    item.invoiceReference = invoice.id;
    item.operationalGeneratedInvoice = invoice.id;
    item.operationalGeneratedWorkflow = wf.id;
    saveNow();
    current.filters = current.filters || {};
    current.filters.billingTab82 = "out";
    current.page = "billingWorkflow";
    if (typeof render === "function") render();
    alert("Pratica chiusa. Ho creato la fattura della sola provvigione: " + invoice.id + " per " + money(finalAmount, currency) + ".");
  }

  function field(label, id, value, type, options, full){
    if (options) return '<label class="' + (full ? "full" : "") + '">' + esc(label) + '<select id="' + esc(id) + '">' + options.map(function(option){ return '<option value="' + esc(option) + '" ' + (String(option) === String(value || "") ? "selected" : "") + '>' + esc(option) + '</option>'; }).join("") + '</select></label>';
    if (type === "textarea") return '<label class="' + (full ? "full" : "") + '">' + esc(label) + '<textarea id="' + esc(id) + '">' + esc(value || "") + '</textarea></label>';
    return '<label class="' + (full ? "full" : "") + '">' + esc(label) + '<input id="' + esc(id) + '" type="' + esc(type || "text") + '" step="any" value="' + esc(value == null ? "" : value) + '"></label>';
  }
  function getVal(id){ const el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function setVal(id, value){ const el = document.getElementById(id); if (el) el.value = value == null ? "" : value; }
  function selectedPerson(){
    const id = current.filters.pms158ForeignEdit || "";
    return arr(st()[FOREIGN]).find(function(p){ return String(p.id || "") === String(id); }) || {};
  }
  function personName(p){ return p.fullName || p.name || [p.firstName, p.lastName].filter(Boolean).join(" ") || p.id || "-"; }
  function paidTotal(p){ return arr(p.payments || p.incomeLines).reduce(function(sum, row){ return sum + num(row.amount); }, 0); }
  function expenseTotal(p){ return arr(p.expenses || p.expenseLines).reduce(function(sum, row){ return sum + num(row.amount); }, 0); }
  function dueTotal(p){ return Math.max(0, num(p.amountDue || p.costAmount || p.toPayAmount) - paidTotal(p)); }
  function foreignWeekStart(){
    st().settings.pms158ForeignWeekStart = mondayOf(st().settings.pms158ForeignWeekStart || today());
    return st().settings.pms158ForeignWeekStart;
  }
  function foreignEvents(){
    const events = [];
    arr(st()[FOREIGN]).forEach(function(p){
      [
        ["appointmentDate","Appuntamento","yellow"],
        ["lawyerDate","Avvocato","red"],
        ["arrivalDate","Arrivo","green"],
        ["departureDate","Partenza","blue"],
        ["documentDeadline","Documenti","yellow"],
        ["paymentDeadline","Pagamento","red"]
      ].forEach(function(def){
        const value = String(p[def[0]] || "").slice(0, 10);
        if (!value) return;
        events.push({person:p, field:def[0], label:def[1], color:p.calendarColor || def[2], date:value});
      });
      arr(p.customEvents).forEach(function(ev, index){
        if (ev.date) events.push({person:p, field:"customEvents:" + index, label:ev.title || "Evento", color:ev.color || p.calendarColor || "blue", date:ev.date});
      });
    });
    return events;
  }
  function renderForeignCalendar(){
    const start = foreignWeekStart();
    const days = Array.from({length:7}, function(_, i){ return addDays(start, i); });
    const events = foreignEvents();
    const columns = days.map(function(day){
      const cards = events.filter(function(ev){ return ev.date === day; }).map(function(ev){
        return '<article draggable="true" class="pms158-foreign-event pms158-' + esc(ev.color || "blue") + '" data-pms158-foreign-event="' + esc(ev.person.id) + '|' + esc(ev.field) + '"><strong>' + esc(ev.label) + '</strong><span>' + esc(personName(ev.person)) + '</span><small>' + esc(ev.person.originCountry || ev.person.country || "") + ' - ' + esc(ev.person.practiceStatus || "") + '</small></article>';
      }).join("");
      return '<section class="pms158-fday" data-pms158-foreign-day="' + esc(day) + '"><header><strong>' + esc(new Date(day + "T12:00:00").toLocaleDateString("it-IT", {weekday:"short"})) + '</strong><span>' + esc(formatDate(day)) + '</span></header><div>' + (cards || '<div class="pms158-empty">Libero</div>') + '</div></section>';
    }).join("");
    return '<div class="pms158-panel"><div class="pms158-head"><div><span>Calendario</span><h3>Arrivi, partenze, avvocato, documenti e pagamenti</h3></div><div class="pms158-actions"><button class="secondary-button" data-pms158-foreign-week="-7">Indietro</button><button class="secondary-button" data-pms158-foreign-today>Oggi</button><button class="secondary-button" data-pms158-foreign-week="7">Avanti</button></div></div><div class="pms158-fcalendar">' + columns + '</div></div>';
  }
  function renderForeignForm(){
    const p = selectedPerson();
    return '<div class="pms158-panel"><div class="pms158-head"><div><span>Scheda persona</span><h3>' + (p.id ? "Modifica " + esc(personName(p)) : "Nuova pratica estero") + '</h3></div><div class="pms158-actions"><button class="primary-button" data-pms158-save-foreign>Salva scheda</button><button class="secondary-button" data-pms158-new-foreign>Nuova</button></div></div><div class="pms158-form">' +
      field("Nome completo","pms158-fullName",personName(p) === "-" ? "" : personName(p),"text",null,false) +
      field("Paese origine","pms158-originCountry",p.originCountry || p.country,"text",null,false) +
      field("Nazionalita","pms158-nationality",p.nationality,"text",null,false) +
      field("Citta","pms158-city",p.city,"text",null,false) +
      field("Telefono WhatsApp","pms158-phone",p.phone || p.whatsapp,"text",null,false) +
      field("Email","pms158-email",p.email,"email",null,false) +
      field("Mansione / lavoro","pms158-role",p.role || p.targetJob,"text",null,false) +
      field("Cliente / azienda Romania","pms158-clientCompany",p.clientCompany || p.client || p.employer,"text",null,false) +
      field("Stato pratica","pms158-practiceStatus",p.practiceStatus,"select",["Pratica aperta","Documenti richiesti","Documenti ricevuti","Traduzioni","Avvocato","Permesso lavoro","Visto/ingresso","Arrivato in Romania","Inserito presso cliente","In attesa pagamento","Conclusa","Bloccata"],false) +
      field("Stato documenti","pms158-documentStatus",p.documentStatus,"select",["Da controllare","Richiesti","Parziali","Completi","Tradotti","Consegnati ad avvocato","Scaduti"],false) +
      field("Avvocato / studio","pms158-lawyer",p.lawyer,"text",null,false) +
      field("Colore agenda","pms158-calendarColor",p.calendarColor || colorForRecord(p),"select",["blue","green","yellow","red"],false) +
      field("Appuntamento","pms158-appointmentDate",p.appointmentDate,"date",null,false) +
      field("Data avvocato","pms158-lawyerDate",p.lawyerDate,"date",null,false) +
      field("Arrivo Romania","pms158-arrivalDate",p.arrivalDate,"date",null,false) +
      field("Partenza / rientro","pms158-departureDate",p.departureDate,"date",null,false) +
      field("Scadenza documenti","pms158-documentDeadline",p.documentDeadline,"date",null,false) +
      field("Scadenza pagamento","pms158-paymentDeadline",p.paymentDeadline,"date",null,false) +
      field("Valuta","pms158-currency",p.currency || "EUR","select",["EUR","RON","USD"],false) +
      field("Totale da pagare","pms158-amountDue",p.amountDue || p.costAmount || p.toPayAmount,"number",null,false) +
      field("Pagamento nuovo","pms158-newPayment", "", "number", null, false) +
      field("Nota pagamento","pms158-newPaymentNote", "", "text", null, false) +
      field("Documenti richiesti","pms158-documentsRequired",p.documentsRequired || p.documentRequests,"textarea",null,true) +
      field("Note avvocato / pratica","pms158-legalNotes",p.legalNotes || p.notes,"textarea",null,true) +
      '<label class="full">Carica documenti visibili<input id="pms158-files" type="file" multiple></label>' +
    '</div></div>';
  }
  function renderForeignTable(){
    const rows = arr(st()[FOREIGN]).map(function(p){
      const balance = dueTotal(p);
      const docs = arr(p.attachments).slice(0, 3).map(function(d){ return '<a class="pms158-doc" href="' + esc(d.dataUrl || d.url || "#") + '" target="_blank">' + esc(d.name || "Documento") + '</a>'; }).join("");
      return '<tr><td><strong>' + esc(p.id) + '</strong></td><td><strong>' + esc(personName(p)) + '</strong><br><small>' + esc(p.phone || p.email || "") + '</small></td><td>' + esc(p.originCountry || p.country || "") + '<br><small>' + esc(p.nationality || "") + '</small></td><td>' + esc(p.role || p.targetJob || "") + '<br><small>' + esc(p.clientCompany || "") + '</small></td><td>' + badge(p.practiceStatus || "Pratica aperta", p.practiceStatus === "Bloccata" ? "danger" : "primary") + '<br><small>' + esc(p.documentStatus || "") + '</small></td><td>' + money(paidTotal(p), p.currency) + '<br><small>Da pagare ' + money(balance, p.currency) + '</small></td><td>' + (docs || "-") + '</td><td><div class="pms158-actions"><button class="inline-button" data-pms158-edit-foreign="' + esc(p.id) + '">Modifica</button><button class="inline-button" data-pms158-print-foreign="' + esc(p.id) + '">Stampa</button><button class="inline-danger" data-pms158-delete-foreign="' + esc(p.id) + '">Elimina</button></div></td></tr>';
    }).join("");
    return '<div class="pms158-panel"><div class="pms158-head"><div><span>Archivio</span><h3>Persone e pratiche</h3></div></div><div class="table-wrap"><table><thead><tr><th>ID</th><th>Persona</th><th>Origine</th><th>Lavoro / Cliente</th><th>Pratica</th><th>Contabilita</th><th>Documenti</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8" class="empty">Nessuna pratica estero.</td></tr>') + '</tbody></table></div></div>';
  }
  function renderForeignAccounting(){
    const rows = arr(st()[FOREIGN]).map(function(p){
      return '<tr><td>' + esc(personName(p)) + '</td><td>' + money(p.amountDue || p.costAmount || p.toPayAmount, p.currency) + '</td><td>' + money(paidTotal(p), p.currency) + '</td><td>' + money(expenseTotal(p), p.currency) + '</td><td>' + money(dueTotal(p), p.currency) + '</td><td>' + badge(dueTotal(p) > 0 ? "Da incassare" : "Pagato", dueTotal(p) > 0 ? "warn" : "success") + '</td></tr>';
    }).join("");
    return '<div class="pms158-panel"><div class="pms158-head"><div><span>Contabilita</span><h3>Chi ha pagato e chi no</h3></div></div><div class="table-wrap"><table><thead><tr><th>Persona</th><th>Totale da pagare</th><th>Incassato</th><th>Costi nostri</th><th>Residuo</th><th>Stato</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6" class="empty">Nessun dato contabile.</td></tr>') + '</tbody></table></div></div>';
  }
  function renderForeignPage(){
    ensureData(); injectCss();
    const active = arr(st()[FOREIGN]).filter(function(p){ return !String(p.practiceStatus || "").toLowerCase().includes("conclus"); }).length;
    const unpaid = arr(st()[FOREIGN]).filter(function(p){ return dueTotal(p) > 0; }).length;
    const arrivals = foreignEvents().filter(function(e){ return e.field === "arrivalDate"; }).length;
    return '<div class="pms158-page"><div class="pms158-kpis"><div><strong>' + active + '</strong>Pratiche aperte</div><div><strong>' + unpaid + '</strong>Pagamenti aperti</div><div><strong>' + arrivals + '</strong>Arrivi programmati</div><div><strong>' + arr(st()[FOREIGN]).length + '</strong>Schede totali</div></div>' + renderForeignForm() + renderForeignCalendar() + renderForeignTable() + renderForeignAccounting() + '</div>';
  }
  function filesToDocs(input){
    const files = input && input.files ? Array.from(input.files) : [];
    return Promise.all(files.map(function(file){
      return new Promise(function(resolve){
        const reader = new FileReader();
        reader.onload = function(){ resolve({name:file.name, type:file.type, size:file.size, date:today(), dataUrl:String(reader.result || "")}); };
        reader.onerror = function(){ resolve({name:file.name, type:file.type, size:file.size, date:today(), dataUrl:""}); };
        reader.readAsDataURL(file);
      });
    }));
  }
  async function saveForeign(){
    ensureData();
    const editId = current.filters.pms158ForeignEdit || "";
    const existing = editId ? arr(st()[FOREIGN]).find(function(p){ return String(p.id) === String(editId); }) : null;
    const docs = await filesToDocs(document.getElementById("pms158-files"));
    const record = Object.assign({}, existing || {}, {
      id: editId || nextCode("EST", st()[FOREIGN]),
      updatedAt: today(),
      fullName:getVal("pms158-fullName"),
      originCountry:getVal("pms158-originCountry"),
      country:getVal("pms158-originCountry"),
      nationality:getVal("pms158-nationality"),
      city:getVal("pms158-city"),
      phone:getVal("pms158-phone"),
      whatsapp:getVal("pms158-phone"),
      email:getVal("pms158-email"),
      role:getVal("pms158-role"),
      targetJob:getVal("pms158-role"),
      clientCompany:getVal("pms158-clientCompany"),
      practiceStatus:getVal("pms158-practiceStatus") || "Pratica aperta",
      status:getVal("pms158-practiceStatus") || "Pratica aperta",
      documentStatus:getVal("pms158-documentStatus"),
      lawyer:getVal("pms158-lawyer"),
      calendarColor:getVal("pms158-calendarColor") || "blue",
      appointmentDate:getVal("pms158-appointmentDate"),
      lawyerDate:getVal("pms158-lawyerDate"),
      arrivalDate:getVal("pms158-arrivalDate"),
      departureDate:getVal("pms158-departureDate"),
      documentDeadline:getVal("pms158-documentDeadline"),
      paymentDeadline:getVal("pms158-paymentDeadline"),
      currency:getVal("pms158-currency") || "EUR",
      amountDue:getVal("pms158-amountDue"),
      costAmount:getVal("pms158-amountDue"),
      documentsRequired:getVal("pms158-documentsRequired"),
      documentRequests:getVal("pms158-documentsRequired"),
      legalNotes:getVal("pms158-legalNotes"),
      notes:getVal("pms158-legalNotes")
    });
    record.attachments = arr(existing && existing.attachments).concat(docs);
    record.payments = arr(existing && existing.payments);
    const pay = num(getVal("pms158-newPayment"));
    if (pay) record.payments.push({date:today(), label:getVal("pms158-newPaymentNote") || "Pagamento", amount:pay, status:"Pagato"});
    if (existing) state[FOREIGN] = arr(state[FOREIGN]).map(function(p){ return String(p.id) === String(editId) ? record : p; });
    else state[FOREIGN].unshift(record);
    current.filters.pms158ForeignEdit = record.id;
    saveNow();
    render();
  }
  function printForeign(id){
    const p = arr(st()[FOREIGN]).find(function(row){ return String(row.id) === String(id); });
    if (!p) return;
    const docs = arr(p.attachments).map(function(d){ return esc(d.name || "Documento"); }).join("<br>");
    const html = '<div class="print-document"><div class="print-header"><div><h1>Scheda dipendente estero</h1><strong>' + esc(personName(p)) + '</strong></div><div class="print-meta">' + esc(p.id) + '<br>' + esc(today()) + '</div></div><table class="print-table"><tr><th>Origine</th><td>' + esc(p.originCountry || p.country) + '</td><th>Nazionalita</th><td>' + esc(p.nationality) + '</td></tr><tr><th>Telefono</th><td>' + esc(p.phone) + '</td><th>Email</th><td>' + esc(p.email) + '</td></tr><tr><th>Lavoro</th><td>' + esc(p.role) + '</td><th>Cliente Romania</th><td>' + esc(p.clientCompany) + '</td></tr><tr><th>Pratica</th><td>' + esc(p.practiceStatus) + '</td><th>Avvocato</th><td>' + esc(p.lawyer) + '</td></tr><tr><th>Arrivo</th><td>' + esc(formatDate(p.arrivalDate)) + '</td><th>Pagamento residuo</th><td>' + esc(money(dueTotal(p), p.currency)) + '</td></tr><tr><th>Documenti</th><td colspan="3">' + esc(p.documentsRequired || "") + '<br>' + docs + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(p.legalNotes || p.notes || "") + '</td></tr></table></div>';
    openPrintSafe(html);
  }
  function deleteForeign(id){
    const p = arr(st()[FOREIGN]).find(function(row){ return String(row.id) === String(id); });
    if (!p || !confirm("Eliminare la pratica estero di " + personName(p) + "?")) return;
    state[FOREIGN] = arr(state[FOREIGN]).filter(function(row){ return String(row.id) !== String(id); });
    if (current.filters.pms158ForeignEdit === id) current.filters.pms158ForeignEdit = "";
    saveNow();
    render();
  }
  function updateForeignEvent(ref, day){
    const parts = String(ref || "").split("|");
    const person = arr(st()[FOREIGN]).find(function(p){ return String(p.id) === parts[0]; });
    if (!person) return;
    if (String(parts[1]).startsWith("customEvents:")) {
      const idx = Number(parts[1].split(":")[1]);
      if (person.customEvents && person.customEvents[idx]) person.customEvents[idx].date = day;
    } else person[parts[1]] = day;
    saveNow();
    render();
  }

  function renderCrmCalendar(){
    st().crmActivities = arr(st().crmActivities);
    const start = mondayOf(st().settings.pms158CrmWeekStart || today());
    st().settings.pms158CrmWeekStart = start;
    const days = Array.from({length:7}, function(_, i){ return addDays(start, i); });
    const cols = days.map(function(day){
      const cards = arr(st().crmActivities).filter(function(a){ return String(a.date || "").slice(0, 10) === day; }).map(function(a){
        return '<article class="pms158-crm-event pms158-' + esc(colorForRecord(a)) + '" data-pms158-crm-id="' + esc(a.id) + '"><strong>' + esc(a.subject || a.title || "Attivita") + '</strong><span>' + esc(a.company || a.contact || "") + '</span><div class="pms158-card-tools"><button type="button" data-pms158-print="crmActivity:' + esc(a.id) + '">Stampa</button><button type="button" data-pms158-color="crmActivity:' + esc(a.id) + '">Colore</button><button type="button" class="danger" data-pms158-delete="crmActivity:' + esc(a.id) + '">Elimina</button></div></article>';
      }).join("");
      return '<section class="pms158-fday"><header><strong>' + esc(new Date(day + "T12:00:00").toLocaleDateString("it-IT", {weekday:"short"})) + '</strong><span>' + esc(formatDate(day)) + '</span></header>' + (cards || '<div class="pms158-empty">Libero</div>') + '</section>';
    }).join("");
    return '<div id="pms158-crm-calendar" class="pms158-panel"><div class="pms158-head"><div><span>Calendario CRM</span><h3>Follow-up colorati</h3></div><div class="pms158-actions"><button class="secondary-button" data-pms158-crm-week="-7">Indietro</button><button class="secondary-button" data-pms158-crm-today>Oggi</button><button class="secondary-button" data-pms158-crm-week="7">Avanti</button></div></div><div class="pms158-fcalendar">' + cols + '</div></div>';
  }
  function injectCrmCalendar(){
    if (!window.current || current.page !== "communications") return;
    const content = document.getElementById("content");
    if (!content || document.getElementById("pms158-crm-calendar")) return;
    content.insertAdjacentHTML("afterbegin", renderCrmCalendar());
  }

  function injectCss(){
    if (document.getElementById("pms-v158-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v158-style";
    style.textContent = `
      .pms158-color-card,.pms158-crm-event,.pms158-foreign-event{position:relative;border-bottom-width:4px!important}
      .pms158-blue{border-left-color:#38bdf8!important;border-bottom-color:#38bdf8!important;background:linear-gradient(180deg,#f0f9ff,#fff)!important}
      .pms158-green{border-left-color:#22c55e!important;border-bottom-color:#22c55e!important;background:linear-gradient(180deg,#f0fdf4,#fff)!important}
      .pms158-yellow{border-left-color:#facc15!important;border-bottom-color:#facc15!important;background:linear-gradient(180deg,#fefce8,#fff)!important}
      .pms158-red{border-left-color:#ef4444!important;border-bottom-color:#ef4444!important;background:linear-gradient(180deg,#fef2f2,#fff)!important}
      .pms158-delay-1{border-left-color:#fca5a5!important;border-bottom:4px solid #fca5a5!important;background:#fff7f7!important}
      .pms158-delay-2{border-left-color:#f87171!important;border-bottom:4px solid #f87171!important;background:#fff1f1!important}
      .pms158-delay-3{border-left-color:#ef4444!important;border-bottom:4px solid #ef4444!important;background:#fee2e2!important}
      .pms158-delay-4{border-left-color:#b91c1c!important;border-bottom:4px solid #b91c1c!important;background:#fecaca!important}
      .pms158-delay-line{font-size:10px;font-weight:900;color:#991b1b;background:rgba(255,255,255,.7);border:1px solid rgba(185,28,28,.2);border-radius:6px;padding:4px 6px}
      .pms158-card-tools{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px}
      .pms158-card-tools button{width:auto!important;margin:0!important;padding:4px 7px!important;border:1px solid #cbd5e1!important;border-radius:6px!important;background:#fff!important;color:#1f4e78!important;font-size:10px!important;font-weight:900!important}
      .pms158-card-tools button.danger{border-color:#fecaca!important;color:#991b1b!important;background:#fff5f5!important}
      .pms158-page{display:grid;gap:14px}.pms158-panel{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pms158-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.pms158-head span{display:block;font-size:12px;font-weight:900;color:#1f4e78;text-transform:uppercase}.pms158-head h3{margin:2px 0}
      .pms158-actions{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.pms158-actions button,.pms158-actions .secondary-button,.pms158-actions .primary-button{width:auto!important;margin:0!important}
      .pms158-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.pms158-kpis>div{background:#fff;border:1px solid var(--line);border-radius:8px;padding:12px}.pms158-kpis strong{display:block;font-size:24px;color:var(--primary)}
      .pms158-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.pms158-form label{display:grid;gap:4px;font-size:12px;font-weight:900;color:var(--muted)}.pms158-form .full{grid-column:1/-1}.pms158-form input,.pms158-form select,.pms158-form textarea{width:100%}.pms158-form textarea{min-height:84px}
      .pms158-fcalendar{display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));gap:8px}.pms158-fday{min-height:210px;border:1px solid #dbe5ef;border-radius:8px;background:#f8fafc;padding:8px}.pms158-fday header{display:grid;gap:2px;border-bottom:1px solid #dbe5ef;margin:-8px -8px 8px;padding:8px;background:#eef3f8}.pms158-fday article{display:grid;gap:3px;border:1px solid #dbe5ef;border-left:4px solid #38bdf8;border-radius:7px;padding:8px;margin-bottom:7px;background:#fff}.pms158-fday article strong{font-size:12px}.pms158-fday article span,.pms158-fday article small{font-size:11px;color:#64748b}.pms158-empty{display:grid;place-items:center;min-height:42px;border:1px dashed #cbd5e1;border-radius:7px;color:#64748b;font-size:11px}
      .pms158-doc{display:inline-flex;margin:2px 3px 2px 0;padding:3px 7px;border:1px solid #cbd5e1;border-radius:999px;background:#f8fafc;font-size:11px;font-weight:800;text-decoration:none;color:#1f4e78}
      @media(max-width:1100px){.pms158-kpis,.pms158-fcalendar{grid-template-columns:repeat(2,minmax(0,1fr))}.pms158-form{grid-template-columns:repeat(2,minmax(0,1fr))}.pms158-head{display:block}.pms158-actions{margin-top:9px}}
      @media(max-width:680px){.pms158-kpis,.pms158-fcalendar,.pms158-form{grid-template-columns:1fr}}
      @media print{.pms158-card-tools{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function bindActions(){
    decorateCalendars();
    injectCrmCalendar();
    document.querySelectorAll("[data-pms158-print]").forEach(function(button){
      if (button.dataset.bound158) return; button.dataset.bound158 = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); const p = button.dataset.pms158Print.split(":"); printSimpleEvent(p[0], p.slice(1).join(":")); };
    });
    document.querySelectorAll("[data-pms158-delete]").forEach(function(button){
      if (button.dataset.bound158) return; button.dataset.bound158 = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); const p = button.dataset.pms158Delete.split(":"); deleteRecord(p[0], p.slice(1).join(":")); };
    });
    document.querySelectorAll("[data-pms158-color]").forEach(function(button){
      if (button.dataset.bound158) return; button.dataset.bound158 = "1";
      button.onclick = function(event){ event.preventDefault(); event.stopPropagation(); const p = button.dataset.pms158Color.split(":"); const kind = p[0], id = p.slice(1).join(":"); const lists = {agenda:st().dashboardAgenda, task:st().tasks, crmActivity:arr(st().crmActivities)}; const item = arr(lists[kind]).find(function(row){ return String(row.id || "") === String(id); }); if (item) setRecordColor(kind, id, nextColor(colorForRecord(item))); };
    });
    document.querySelectorAll("[data-pms158-crm-week]").forEach(function(button){
      if (button.dataset.bound158) return; button.dataset.bound158 = "1";
      button.onclick = function(){ st().settings.pms158CrmWeekStart = mondayOf(addDays(st().settings.pms158CrmWeekStart || today(), Number(button.dataset.pms158CrmWeek || 0))); saveNow(); render(); };
    });
    document.querySelectorAll("[data-pms158-crm-today]").forEach(function(button){
      if (button.dataset.bound158) return; button.dataset.bound158 = "1";
      button.onclick = function(){ st().settings.pms158CrmWeekStart = mondayOf(today()); saveNow(); render(); };
    });
    document.querySelectorAll("[data-pms158-save-foreign]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = saveForeign; } });
    document.querySelectorAll("[data-pms158-new-foreign]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = function(){ current.filters.pms158ForeignEdit = ""; render(); }; } });
    document.querySelectorAll("[data-pms158-edit-foreign]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = function(){ current.filters.pms158ForeignEdit = button.dataset.pms158EditForeign; render(); }; } });
    document.querySelectorAll("[data-pms158-print-foreign]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = function(){ printForeign(button.dataset.pms158PrintForeign); }; } });
    document.querySelectorAll("[data-pms158-delete-foreign]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = function(){ deleteForeign(button.dataset.pms158DeleteForeign); }; } });
    document.querySelectorAll("[data-pms158-foreign-week]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = function(){ st().settings.pms158ForeignWeekStart = mondayOf(addDays(foreignWeekStart(), Number(button.dataset.pms158ForeignWeek || 0))); saveNow(); render(); }; } });
    document.querySelectorAll("[data-pms158-foreign-today]").forEach(function(button){ if (!button.dataset.bound158) { button.dataset.bound158 = "1"; button.onclick = function(){ st().settings.pms158ForeignWeekStart = mondayOf(today()); saveNow(); render(); }; } });
    document.querySelectorAll("[data-pms158-foreign-event]").forEach(function(card){
      if (card.dataset.bound158) return; card.dataset.bound158 = "1";
      card.addEventListener("dragstart", function(event){ event.dataTransfer.setData("application/x-pms158-foreign", card.dataset.pms158ForeignEvent); });
    });
    document.querySelectorAll("[data-pms158-foreign-day]").forEach(function(day){
      if (day.dataset.bound158) return; day.dataset.bound158 = "1";
      day.addEventListener("dragover", function(event){ event.preventDefault(); day.classList.add("is-over"); });
      day.addEventListener("dragleave", function(){ day.classList.remove("is-over"); });
      day.addEventListener("drop", function(event){ event.preventDefault(); day.classList.remove("is-over"); const ref = event.dataTransfer.getData("application/x-pms158-foreign"); if (ref) updateForeignEvent(ref, day.dataset.pms158ForeignDay); });
    });
  }

  document.addEventListener("click", function(event){
    const button = event.target && event.target.closest && event.target.closest("[data-pms147-close]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const parts = String(button.dataset.pms147Close || "").split(":");
    closePracticeCommission(parts[0], parts.slice(1).join(":"));
  }, true);

  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !renderNav.__pms158Wrapped) {
    renderNav = function(){ ensureData(); const out = baseRenderNav.apply(this, arguments); return out; };
    renderNav.__pms158Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !render.__pms158Wrapped) {
    render = function(){
      ensureData(); injectCss();
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (current && current.page === FOREIGN && content) {
        if (title) title.textContent = "Dipendenti estero";
        if (subtitle) subtitle.textContent = "Pratiche, avvocato, documenti, pagamenti e calendario arrivi";
        content.innerHTML = renderForeignPage();
        bindActions();
        return;
      }
      const result = baseRender.apply(this, arguments);
      setTimeout(bindActions, 40);
      setTimeout(bindActions, 180);
      return result;
    };
    render.__pms158Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !bindPageActions.__pms158Wrapped) {
    bindPageActions = function(){ const result = baseBind.apply(this, arguments); bindActions(); return result; };
    bindPageActions.__pms158Wrapped = true;
  }

  ensureData();
  injectCss();
  try { if (typeof renderNav === "function") renderNav(); if (typeof render === "function") render(); } catch(error) { console.warn(VERSION, error); }
  setInterval(bindActions, 2500);
  window.pmsV158 = {version:VERSION};
  console.info(VERSION + " loaded");
})();
