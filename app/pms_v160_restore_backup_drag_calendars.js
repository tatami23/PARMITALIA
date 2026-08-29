(function(){
  "use strict";

  const VERSION = "pms_v160_restore_backup_drag_calendars";
  const FOREIGN = "foreignEmployees";
  const RESTORE_FLAG = "__pms160RecoveredFromBackup";

  const BACKUP_SOURCE = "parmitalia-backup-2026-07-15.json";
  const RECOVERY_ORDERS = [
    {
      id:"ORD-24801",
      code:"ORD-2026-0007",
      orderType:"Ordine continuativo",
      orderDate:"2026-07-15",
      client:"BERGAMASCHI SRL",
      supplier:"M E S INTERMEDIAZIONI S.R.L.S.",
      product:"GRANA PADANO WHEELS ",
      description:"",
      quantity:6000,
      unit:"kg",
      priceType:"Multi-articolo",
      unitPrice:9.33,
      currency:"EUR",
      commissionPct:1,
      commissionStatus:"Da maturare",
      paymentTerms:"60 giorni",
      delivery:"EXW",
      frequency:"Settimanale",
      requestedDate:"",
      expectedDelivery:"",
      linkedOffer:"",
      invoiceReference:"",
      status:"In evasione",
      notes:"",
      destination:"",
      customerOrderNumber:"",
      orderLineItemsJson:"[{\"articleCode\":\"\",\"product\":\"GRANA PADANO WHEELS \",\"description\":\"GRANA PADANO WHEELS\",\"quantity\":\"6000\",\"unit\":\"kg\",\"unitPrice\":\"9.33\",\"currency\":\"EUR\",\"discountPct\":\"0\"}]"
    }
  ];

  const RECOVERY_DEALS = [
    {
      id:"INT-2026-0002",
      date:"2026-07-14",
      client:"Whiteland Food Trading Company LLC",
      supplier:"Zarpellon",
      product:"Hard Cheese",
      category:"Dairy",
      currency:"EUR",
      value:7,
      currentPrice:7,
      targetPrice:"",
      commissionPct:1,
      commissionStatus:"Da maturare",
      agent:"",
      agentCommissionPct:0,
      paymentTerms:"Alla consegna",
      status:"In corso",
      negotiationStatus:"In trattativa",
      negotiationStage:"Negoziazione prezzo",
      damageCheck:"Tutto a posto",
      priority:"Alta",
      nextAction:"",
      notes:"",
      dealLineItemsJson:"",
      negotiationHistory:[
        {date:"2026-07-14", currentPrice:7, targetPrice:"", status:"In corso", stage:"Negoziazione prezzo", note:"Dati ripristinati dal backup del 15/07/2026."}
      ]
    },
    {
      id:"INT-2026-0001",
      date:"2026-07-14",
      client:"Whiteland Food Trading Company LLC",
      supplier:"Zarpellon",
      product:"Grana padano",
      category:"Dairy",
      currency:"EUR",
      value:9.85,
      currentPrice:9.85,
      targetPrice:"",
      commissionPct:1,
      commissionStatus:"Da maturare",
      agent:"",
      agentCommissionPct:0,
      paymentTerms:"Alla consegna",
      status:"In corso",
      negotiationStatus:"In trattativa",
      negotiationStage:"Negoziazione prezzo",
      damageCheck:"",
      priority:"Alta",
      nextAction:"negoziazione crescita prezzo, verifica andamento e compensazione con sconto sul hardcheese",
      notes:"",
      dealLineItemsJson:"",
      negotiationHistory:[
        {date:"2026-07-14", currentPrice:9.85, targetPrice:"", status:"In corso", stage:"Negoziazione prezzo", note:"Dati ripristinati dal backup del 15/07/2026."}
      ]
    }
  ];

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function st(){
    window.state = window.state || {};
    state.orders = arr(state.orders);
    state.intermediations = arr(state.intermediations);
    state.tasks = arr(state.tasks);
    state[FOREIGN] = arr(state[FOREIGN]);
    state.settings = state.settings || {};
    return state;
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
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
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
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      return false;
    }
  }
  function identity(item){
    return [item && item.code, item && item.orderCode, item && item.id, item && item.protocol]
      .filter(Boolean).map(function(value){ return String(value).trim().toLowerCase(); });
  }
  function hasSame(list, sample){
    const keys = identity(sample);
    return arr(list).some(function(item){
      const current = identity(item);
      return keys.some(function(key){ return current.includes(key); });
    });
  }
  function fillMissing(target, source){
    let changed = false;
    Object.keys(source).forEach(function(key){
      if (key === "productPhoto") return;
      if (target[key] == null || target[key] === "") {
        target[key] = source[key];
        changed = true;
      }
    });
    return changed;
  }
  function restoreBackupData(){
    const s = st();
    let changed = false;
    RECOVERY_ORDERS.forEach(function(order){
      if (!hasSame(s.orders, order)) {
        const restored = Object.assign({}, order);
        restored[RESTORE_FLAG] = BACKUP_SOURCE;
        s.orders.unshift(restored);
        changed = true;
      } else {
        s.orders.forEach(function(existing){
          if (hasSame([existing], order) && fillMissing(existing, order)) changed = true;
        });
      }
    });
    RECOVERY_DEALS.forEach(function(deal){
      if (!hasSame(s.intermediations, deal)) {
        const restored = Object.assign({}, deal);
        restored[RESTORE_FLAG] = BACKUP_SOURCE;
        s.intermediations.unshift(restored);
        changed = true;
      } else {
        s.intermediations.forEach(function(existing){
          if (hasSame([existing], deal)) {
            if (fillMissing(existing, deal)) changed = true;
            existing.negotiationHistory = arr(existing.negotiationHistory);
            if (!existing.negotiationHistory.length && arr(deal.negotiationHistory).length) {
              existing.negotiationHistory = deal.negotiationHistory.slice();
              changed = true;
            }
          }
        });
      }
    });
    if (changed) {
      s.__pms160Restore = {source:BACKUP_SOURCE, restoredAt:new Date().toISOString()};
      saveNow();
    }
    return changed;
  }

  function personName(person){ return person.fullName || [person.firstName, person.lastName].filter(Boolean).join(" ") || person.name || person.candidateName || "-"; }
  function personDate(person){ return String(person.appointmentDate || person.arrivalDate || person.lawyerDate || "").slice(0, 10); }
  function personColor(person){
    const raw = String(person.calendarColor || person.practiceStatus || "").toLowerCase();
    if (raw.includes("rosso") || raw.includes("urgent") || raw.includes("blocc") || raw.includes("scad")) return "red";
    if (raw.includes("giallo") || raw.includes("document") || raw.includes("attesa")) return "yellow";
    if (raw.includes("verde") || raw.includes("conclus") || raw.includes("pagato") || raw.includes("arriv")) return "green";
    return "blue";
  }
  function colorLabel(color){ return {blue:"Azzurro", green:"Verde", yellow:"Giallo", red:"Rosso"}[color] || "Azzurro"; }
  function taskDate(task){ return String(task.dueDate || task.scheduledDate || "").slice(0, 10); }
  function titleOf(item){ return item.title || item.subject || item.client || item.supplier || item.type || "Attivita"; }

  function injectCss(){
    let style = document.getElementById("pms-v160-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v160-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .pms160-person-backlog,.pms160-task-backlog{margin:10px 0 12px;padding:10px;border:1px solid #dbe5ef;border-radius:8px;background:#f8fafc}
      .pms160-person-backlog h4,.pms160-task-backlog h4{margin:0 0 8px;color:#25384a;font-size:13px;text-transform:uppercase}
      .pms160-chip-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:7px}
      .pms160-chip{display:grid;gap:3px;padding:8px 9px;border:1px solid #d9e2ec;border-left:4px solid #1f4e78;border-radius:7px;background:#fff;cursor:grab;box-shadow:0 2px 8px rgba(18,38,63,.05)}
      .pms160-chip strong{font-size:12px;color:#17242b;line-height:1.25;word-break:break-word}
      .pms160-chip span,.pms160-chip small{font-size:10px;color:#64748b;font-weight:800}
      .pms160-chip.red{border-left-color:#b91c1c;background:#fff7f7}
      .pms160-chip.yellow{border-left-color:#d97706;background:#fffbeb}
      .pms160-chip.green{border-left-color:#15803d;background:#f0fdf4}
      .pms160-chip.blue{border-left-color:#1f4e78;background:#fff}
      [data-pms158-foreign-day].is-over,[data-pms150-drop].is-over{outline:2px solid #1f4e78;outline-offset:-2px;background:#eef6ff!important}
      #pms150-task-calendar .pms150-backlog{display:none!important}
    `;
  }

  function reorderForeignCalendar(){
    if (!window.current || current.page !== FOREIGN) return;
    const page = document.querySelector(".pms158-page");
    if (!page || page.dataset.pms160Ordered === "1") return;
    const kpis = page.querySelector(".pms158-kpis");
    const panels = Array.from(page.querySelectorAll(":scope > .pms158-panel"));
    const calendar = panels.find(function(panel){ return panel.querySelector(".pms158-fcalendar"); });
    if (kpis && calendar) {
      kpis.insertAdjacentElement("afterend", calendar);
      page.dataset.pms160Ordered = "1";
    }
  }

  function foreignBacklogHtml(){
    const rows = arr(st()[FOREIGN]).filter(function(person){ return !personDate(person) || !String(person.practiceStatus || "").toLowerCase().includes("conclus"); });
    return '<div id="pms160-foreign-backlog" class="pms160-person-backlog"><h4>Pratiche da trascinare negli appuntamenti</h4><div class="pms160-chip-list">' +
      (rows.map(function(person){
        const color = personColor(person);
        return '<article class="pms160-chip ' + esc(color) + '" draggable="true" data-pms160-foreign-person="' + esc(person.id || "") + '"><strong>' + esc(personName(person)) + '</strong><span>' + esc(person.practiceStatus || "Pratica aperta") + '</span><small>' + esc((person.originCountry || person.country || "") + (personDate(person) ? " - " + personDate(person) : "")) + '</small></article>';
      }).join("") || '<div class="pms150-empty">Nessuna pratica da programmare</div>') +
    '</div></div>';
  }
  function mountForeignBacklog(){
    if (!window.current || current.page !== FOREIGN) return;
    const calendar = document.querySelector(".pms158-panel .pms158-fcalendar");
    if (!calendar) return;
    const panel = calendar.closest(".pms158-panel");
    if (!panel) return;
    const old = document.getElementById("pms160-foreign-backlog");
    if (old) old.remove();
    panel.insertAdjacentHTML("beforeend", foreignBacklogHtml());
  }
  function setForeignAppointment(id, day){
    const person = arr(st()[FOREIGN]).find(function(item){ return String(item.id || "") === String(id || ""); });
    if (!person) return false;
    person.appointmentDate = day;
    person.calendarColor = person.calendarColor || "blue";
    person.updatedAt = today();
    saveNow();
    return true;
  }

  function taskBacklogHtml(){
    const rows = arr(st().tasks).filter(function(task){ return !task.completed && (!taskDate(task) || task.status !== "Completato"); });
    return '<div id="pms160-task-backlog" class="pms160-task-backlog"><h4>Attivita da trascinare nel calendario</h4><div class="pms160-chip-list">' +
      (rows.map(function(task){
        const color = String(task.calendarColor || task.priority || "").toLowerCase().includes("alta") ? "red" : String(task.calendarColor || task.priority || "").toLowerCase().includes("media") ? "yellow" : "blue";
        return '<article class="pms160-chip ' + esc(color) + '" draggable="true" data-pms160-task="' + esc(task.id || "") + '"><strong>' + esc(titleOf(task)) + '</strong><span>' + esc(task.priority || task.type || "Backoffice") + '</span><small>' + esc(task.status || "Da fare") + '</small></article>';
      }).join("") || '<div class="pms150-empty">Nessuna attivita da programmare</div>') +
    '</div></div>';
  }
  function mountTaskBacklog(){
    if (!window.current || current.page !== "assistant") return;
    const calendar = document.getElementById("pms150-task-calendar");
    if (!calendar) return;
    const old = document.getElementById("pms160-task-backlog");
    if (old) old.remove();
    calendar.insertAdjacentHTML("afterbegin", taskBacklogHtml());
  }
  function setTaskCalendarDate(id, day){
    const task = arr(st().tasks).find(function(item){ return String(item.id || "") === String(id || ""); });
    if (!task) return false;
    task.dueDate = day;
    task.scheduledDate = day;
    task.updatedAt = today();
    saveNow();
    return true;
  }

  function bindDrag(){
    document.querySelectorAll("[data-pms160-foreign-person]").forEach(function(card){
      if (card.dataset.bound160) return;
      card.dataset.bound160 = "1";
      card.addEventListener("dragstart", function(event){
        event.dataTransfer.setData("application/x-pms160-foreign-person", card.dataset.pms160ForeignPerson);
        event.dataTransfer.effectAllowed = "move";
      });
    });
    document.querySelectorAll("[data-pms158-foreign-day]").forEach(function(day){
      if (!day.dataset.bound160Over) {
        day.dataset.bound160Over = "1";
        day.addEventListener("dragover", function(event){
          if (event.dataTransfer.types && Array.from(event.dataTransfer.types).includes("application/x-pms160-foreign-person")) {
            event.preventDefault();
            day.classList.add("is-over");
          }
        });
        day.addEventListener("dragleave", function(){ day.classList.remove("is-over"); });
      }
      if (day.dataset.bound160Drop) return;
      day.dataset.bound160Drop = "1";
      day.addEventListener("drop", function(event){
        const id = event.dataTransfer.getData("application/x-pms160-foreign-person");
        if (!id) return;
        event.preventDefault();
        event.stopPropagation();
        day.classList.remove("is-over");
        if (setForeignAppointment(id, day.dataset.pms158ForeignDay) && typeof render === "function") render();
      }, true);
    });

    document.querySelectorAll("[data-pms160-task]").forEach(function(card){
      if (card.dataset.bound160) return;
      card.dataset.bound160 = "1";
      card.addEventListener("dragstart", function(event){
        event.dataTransfer.setData("application/x-pms160-task", card.dataset.pms160Task);
        event.dataTransfer.effectAllowed = "move";
      });
    });
    document.querySelectorAll('[data-pms150-drop="task"]').forEach(function(day){
      if (!day.dataset.bound160TaskDrop) {
        day.dataset.bound160TaskDrop = "1";
        day.addEventListener("drop", function(event){
          const id = event.dataTransfer.getData("application/x-pms160-task");
          if (!id) return;
          event.preventDefault();
          event.stopPropagation();
          day.classList.remove("is-over");
          if (setTaskCalendarDate(id, day.dataset.pms150Day) && typeof render === "function") render();
        }, true);
      }
    });
  }

  function afterRender(){
    st();
    injectCss();
    reorderForeignCalendar();
    mountForeignBacklog();
    mountTaskBacklog();
    bindDrag();
  }

  function init(){
    st();
    injectCss();
    restoreBackupData();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !render.__pms160Wrapped) {
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 40);
        setTimeout(afterRender, 180);
        return result;
      };
      render.__pms160Wrapped = true;
    }
    [80, 300, 900, 1800].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(afterRender, 2500);
    try { if (typeof renderNav === "function") renderNav(); if (typeof render === "function") render(); } catch(error) { console.warn(VERSION, error); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.pmsV160 = {version:VERSION, restoreBackupData:restoreBackupData};
  console.info(VERSION + " loaded");
})();
