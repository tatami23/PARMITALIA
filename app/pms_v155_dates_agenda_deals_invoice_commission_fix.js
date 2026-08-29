/* === PMS v155 - Date, agenda colori, storico prezzi, articoli trattative, fatture commissione === */
(function(){
  "use strict";
  const VERSION155 = "PMS-V155-DATES-AGENDA-DEALS-INVOICE-COMMISSION";
  const AGENDA_KEY = "dashboardAgenda";
  const DEAL = "intermediations";
  const PRODUCTS = "products";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function clean(value){ return String(value == null ? "" : value).trim(); }
  function has(value){ return clean(value) !== ""; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g,function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char];
    });
  }
  function num(value){
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(String(value == null ? "" : value).trim().replace(/\s/g,"").replace(",","."));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  }
  function money(value,currency){
    if (typeof formatMoney === "function") return formatMoney(value,currency || "EUR");
    return (currency || "EUR") + " " + num(value).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
      return true;
    } catch(error) {
      console.warn(VERSION155 + " save failed", error);
      return false;
    }
  }
  function uid(prefix){
    return prefix + "-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2,5).toUpperCase();
  }
  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state[AGENDA_KEY] = arr(state[AGENDA_KEY]);
    state.tasks = arr(state.tasks);
    state.orders = arr(state.orders);
    state[DEAL] = arr(state[DEAL]);
    state[PRODUCTS] = arr(state[PRODUCTS]);
    state.outgoingInvoices = arr(state.outgoingInvoices);
  }
  function injectStyle(){
    if (document.getElementById("pms-v155-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v155-style";
    style.textContent = [
      ".pms155-date-wrap{display:flex;gap:6px;align-items:center}.pms155-date-wrap input{min-width:0}.pms155-date-button{width:auto!important;margin:0!important;padding:7px 9px!important;border-radius:6px!important;background:#eef3f8!important;color:#1f4e78!important;border:1px solid #cbd5e1!important;font-weight:900!important}",
      ".pms155-red{border-left-color:#dc2626!important;background:#fff1f2!important}.pms155-yellow{border-left-color:#f59e0b!important;background:#fffbeb!important}.pms155-green{border-left-color:#16a34a!important;background:#f0fdf4!important}.pms155-blue{border-left-color:#1d4ed8!important;background:#eff6ff!important}",
      ".pms155-colorbar{display:flex;gap:4px;flex-wrap:wrap;margin-top:5px}.pms155-colorbar button{width:auto!important;margin:0!important;padding:3px 6px!important;font-size:10px!important;border-radius:5px!important}.pms155-colorbar .red{background:#fee2e2!important;color:#991b1b!important}.pms155-colorbar .yellow{background:#fef3c7!important;color:#92400e!important}.pms155-colorbar .green{background:#dcfce7!important;color:#166534!important}.pms155-colorbar .blue{background:#dbeafe!important;color:#1e40af!important}",
      ".pms155-agenda-tools{display:grid;grid-template-columns:1fr 76px 86px;gap:5px;padding:0 8px 8px;background:#fff}.pms155-agenda-tools select{height:34px;font-size:12px}.pms155-agenda-tools label{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:900;color:#475569}.pms155-agenda-tools input[type=checkbox]{width:auto!important}",
      ".pms155-deal-panel{grid-column:1/-1;border:1px solid var(--line);border-left:5px solid #0f766e;background:#f8fafc;border-radius:8px;padding:12px;margin:8px 0}.pms155-deal-panel h4{margin:0 0 8px}.pms155-deal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:8px}.pms155-deal-grid label{display:block;font-size:12px;font-weight:900;color:var(--muted);margin-bottom:4px}.pms155-deal-panel button{width:auto!important;margin:8px 0 0!important}",
      ".pms155-history-table{margin-top:8px}.pms155-settings-panel{border:1px solid var(--line);border-left:5px solid #1d4ed8;border-radius:8px;background:#fff;padding:14px;margin:14px 0}.pms155-settings-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.pms155-settings-panel button{width:auto!important;margin:10px 0 0!important}"
    ].join("");
    document.head.appendChild(style);
  }

  function normalizeDate(value){
    const raw = clean(value);
    if (!raw) return "";
    const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return raw;
    const it = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (it) return it[3] + "-" + String(it[2]).padStart(2,"0") + "-" + String(it[1]).padStart(2,"0");
    return raw;
  }
  function setNativeValue(input,value){
    const next = normalizeDate(value);
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value");
    if (descriptor && descriptor.set) descriptor.set.call(input,next);
    else input.value = next;
    input.dispatchEvent(new Event("input",{bubbles:true}));
    input.dispatchEvent(new Event("change",{bubbles:true}));
  }
  function askDate(input){
    const current = input.value || today();
    const value = prompt("Inserisci data (AAAA-MM-GG oppure GG/MM/AAAA)", current);
    if (value == null) return;
    setNativeValue(input,value);
  }
  function fixDates(){
    injectStyle();
    document.querySelectorAll('input[type="date"]').forEach(function(input){
      input.removeAttribute("readonly");
      input.disabled = false;
      input.style.pointerEvents = "auto";
      if (input.dataset.pms155Date === "1") return;
      input.dataset.pms155Date = "1";
      const wrapper = document.createElement("span");
      wrapper.className = "pms155-date-wrap";
      input.parentNode.insertBefore(wrapper,input);
      wrapper.appendChild(input);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pms155-date-button";
      button.textContent = "Data";
      wrapper.appendChild(button);
      button.onclick = function(event){
        event.preventDefault();
        event.stopPropagation();
        if (typeof input.showPicker === "function") {
          try { input.showPicker(); return; } catch(error) {}
        }
        askDate(input);
      };
      input.addEventListener("dblclick",function(event){ event.preventDefault(); askDate(input); });
      input.addEventListener("click",function(){
        if (typeof input.showPicker === "function") {
          try { input.showPicker(); } catch(error) {}
        }
      });
    });
  }

  function itemColor(item){
    const raw = clean(item && (item.color || item.priorityColor || item.agendaColor || item.operationalColor)).toLowerCase();
    if (/rosso|red|urgent|urgente|alta/.test(raw)) return "red";
    if (/giallo|yellow|media|warning|importante/.test(raw)) return "yellow";
    if (/verde|green|ok|bassa/.test(raw)) return "green";
    if (/blu|blue/.test(raw)) return "blue";
    return "";
  }
  function applyColorClass(node,color){
    node.classList.remove("pms155-red","pms155-yellow","pms155-green","pms155-blue");
    if (color) node.classList.add("pms155-" + color);
  }
  function findAgenda(kind,id){
    if (kind === "agenda") return arr(state[AGENDA_KEY]).find(function(item){ return String(item.id) === String(id); });
    if (kind === "task") return arr(state.tasks).find(function(item){ return String(item.id) === String(id); });
    return null;
  }
  function addColorBar(node,kind,id){
    if (node.querySelector(".pms155-colorbar")) return;
    const bar = document.createElement("div");
    bar.className = "pms155-colorbar";
    [["red","Rosso"],["yellow","Giallo"],["green","Verde"],["blue","Blu"]].forEach(function(pair){
      const button = document.createElement("button");
      button.type = "button";
      button.className = pair[0];
      button.textContent = pair[1];
      button.onclick = function(event){
        event.preventDefault();
        event.stopPropagation();
        const item = findAgenda(kind,id) || findOperational(kind,id);
        if (!item) return;
        item.color = pair[0];
        item.priorityColor = pair[0];
        item.operationalColor = pair[0];
        saveNow();
        applyColorClass(node,pair[0]);
      };
      bar.appendChild(button);
    });
    node.appendChild(bar);
  }
  function decorateAgendaTools(){
    document.querySelectorAll(".pms150-quick").forEach(function(quick){
      if (quick.dataset.pms155Tools === "1") return;
      quick.dataset.pms155Tools = "1";
      const input = quick.querySelector("[data-pms150-new]");
      if (!input) return;
      const tools = document.createElement("div");
      tools.className = "pms155-agenda-tools";
      tools.innerHTML = '<select data-pms155-new-color><option value="blue">Blu</option><option value="yellow">Giallo</option><option value="red">Rosso urgente</option><option value="green">Verde ok</option></select><label><input type="checkbox" data-pms155-new-reminder checked> Memo</label><button type="button" data-pms155-add>Salva</button>';
      quick.insertAdjacentElement("afterend",tools);
      tools.querySelector("[data-pms155-add]").onclick = function(){
        addAgendaFromInput(input,tools);
      };
      input.addEventListener("keydown",function(event){
        if (event.key === "Enter") {
          event.preventDefault();
          event.stopImmediatePropagation();
          addAgendaFromInput(input,tools);
        }
      },true);
    });
  }
  function addAgendaFromInput(input,tools){
    ensure();
    const mode = input.dataset.pms150New;
    const day = input.dataset.pms150Day;
    const title = clean(input.value);
    if (!title) return;
    const color = tools.querySelector("[data-pms155-new-color]")?.value || "blue";
    const reminder = !!tools.querySelector("[data-pms155-new-reminder]")?.checked;
    if (mode === "agenda") {
      state[AGENDA_KEY].unshift({id:uid("AGE"),date:day,title:title,status:"Aperto",color:color,priorityColor:color,reminder:reminder,createdAt:new Date().toISOString()});
    } else {
      state.tasks.unshift({id:uid("TSK"),dueDate:day,scheduledDate:day,subject:title,type:reminder ? "Promemoria" : "Attivita",priority:color === "red" ? "Alta" : color === "yellow" ? "Media" : "Bassa",status:"Da fare",completed:false,color:color,priorityColor:color,reminder:reminder ? title : "",createdAt:new Date().toISOString()});
    }
    input.value = "";
    saveNow();
    if (typeof render === "function") render();
  }
  function decorateAgenda(){
    ensure(); injectStyle(); decorateAgendaTools();
    document.querySelectorAll(".pms150-card").forEach(function(node){
      const item = findAgenda(node.dataset.pms150Kind,node.dataset.pms150Id);
      if (!item) return;
      applyColorClass(node,itemColor(item));
      addColorBar(node,node.dataset.pms150Kind,node.dataset.pms150Id);
    });
  }
  function findOperational(type,id){
    const list = type === "order" ? state.orders : type === "deal" ? state.intermediations : [];
    return arr(list).find(function(item){ return String(item.id || item.code || item.orderCode || item.dealCode) === String(id); });
  }
  function decorateOperational(){
    ensure(); injectStyle();
    document.querySelectorAll(".pms136-card").forEach(function(node){
      const item = findOperational(node.dataset.pms136Type,node.dataset.pms136Id);
      if (!item) return;
      applyColorClass(node,itemColor(item));
      addColorBar(node,node.dataset.pms136Type,node.dataset.pms136Id);
    });
  }

  function ensureDealFields(form){
    if (!form || form.dataset.pms155Deal === "1") return;
    form.dataset.pms155Deal = "1";
    const readonly = form.querySelector('input[readonly]');
    const id = clean(readonly && readonly.value);
    const record = arr(state.intermediations).find(function(item){ return String(item.id) === id; });
    const host = form.querySelector(".pms85-modal-form") || form;
    const panel = document.createElement("div");
    panel.className = "pms155-deal-panel";
    const history = arr(record && record.priceHistory);
    const rows = history.slice(0,10).map(function(row){
      return "<tr><td>" + esc(row.date || "-") + "</td><td>" + esc(money(row.previousCurrentPrice || row.previousPrice || 0,record?.currency || "EUR")) + "</td><td><strong>" + esc(money(row.currentPrice || row.price || 0,record?.currency || "EUR")) + "</strong></td><td>" + esc(money(row.targetPrice || 0,record?.currency || "EUR")) + "</td><td>" + esc(row.note || "") + "</td></tr>";
    }).join("");
    panel.innerHTML = '<h4>Prezzi e storico trattativa</h4><div class="pms155-deal-grid"><div><label>Prezzo attuale</label><input name="pms155CurrentPrice" type="number" step="0.0001" value="' + esc(record?.currentPrice || record?.price || record?.value || "") + '"></div><div><label>Target price</label><input name="pms155TargetPrice" type="number" step="0.0001" value="' + esc(record?.targetPrice || "") + '"></div><div><label>Stato trattativa</label><select name="pms155DealStage"><option>Aperta</option><option>In trattativa</option><option>Campionatura</option><option>Offerta inviata</option><option>In attesa cliente</option><option>In attesa fornitore</option><option>Chiusa vinta</option><option>Chiusa persa</option></select></div><div><label>Nota modifica prezzo</label><input name="pms155PriceNote" value=""></div></div><button type="button" class="secondary-button" data-pms155-create-product>Crea articolo da questa trattativa</button><div class="pms155-history-table table-wrap"><table><thead><tr><th>Data</th><th>Prezzo precedente</th><th>Prezzo nuovo</th><th>Target</th><th>Nota</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Nessuno storico ancora registrato.</td></tr>') + '</tbody></table></div>';
    host.appendChild(panel);
    const stage = panel.querySelector('[name="pms155DealStage"]');
    if (stage && record) stage.value = record.dealStage || record.status || "Aperta";
    panel.querySelector("[data-pms155-create-product]").onclick = function(){
      createProductFromDealForm(form,id);
    };
    form.addEventListener("submit",function(){
      persistDealPrice(form,id);
    },true);
  }
  function createProductFromDealForm(form,id){
    ensure();
    const productName = clean(form.elements.product?.value);
    if (!productName) return alert("Inserisci prima il prodotto nella trattativa.");
    let product = state.products.find(function(item){ return clean(item.name).toLowerCase() === productName.toLowerCase(); });
    if (!product) {
      product = {
        id:uid("PRD"),
        articleCode:uid("ART"),
        name:productName,
        supplier:clean(form.elements.supplier?.value),
        targetClient:clean(form.elements.client?.value),
        currency:clean(form.elements.currency?.value) || "EUR",
        price:clean(form.elements.pms155CurrentPrice?.value || form.elements.value?.value),
        basePrice:clean(form.elements.pms155CurrentPrice?.value || form.elements.value?.value),
        status:"Attivo",
        createdFromDeal:id || "",
        priceHistory:[{date:today(),price:clean(form.elements.pms155CurrentPrice?.value || form.elements.value?.value),targetPrice:clean(form.elements.pms155TargetPrice?.value),note:"Creato da trattativa"}]
      };
      state.products.unshift(product);
    }
    saveNow();
    alert("Articolo creato/aggiornato: " + product.name);
  }
  function persistDealPrice(form,id){
    setTimeout(function(){
      ensure();
      const record = arr(state.intermediations).find(function(item){ return String(item.id) === String(id); }) || arr(state.intermediations)[0];
      if (!record) return;
      const oldCurrent = record.currentPrice || record.price || record.value || "";
      const oldTarget = record.targetPrice || "";
      const current = clean(form.elements.pms155CurrentPrice?.value || form.elements.currentPrice?.value || form.elements.value?.value);
      const target = clean(form.elements.pms155TargetPrice?.value || form.elements.targetPrice?.value);
      const stage = clean(form.elements.pms155DealStage?.value || form.elements.dealStage?.value || form.elements.status?.value);
      if (has(current)) {
        record.currentPrice = current;
        record.price = current;
        record.value = current;
      }
      if (has(target)) record.targetPrice = target;
      if (has(stage)) {
        record.dealStage = stage;
        record.status = stage;
      }
      if (num(oldCurrent) !== num(current) || num(oldTarget) !== num(target)) {
        record.priceHistory = arr(record.priceHistory);
        record.priceHistory.unshift({date:today(),previousCurrentPrice:oldCurrent,currentPrice:current,previousTargetPrice:oldTarget,targetPrice:target,note:clean(form.elements.pms155PriceNote?.value)});
      }
      saveNow();
    },80);
  }
  function decorateDeals(){
    ensure(); injectStyle();
    const form = document.getElementById("pms85-inter-form");
    if (form) ensureDealFields(form);
  }

  function nextInvoiceNumber(){
    ensure();
    const series = clean(state.settings.invoiceSeries || "FATT");
    const next = Math.max(1,num(state.settings.invoiceNextNumber || 1));
    const pad = Math.max(1,num(state.settings.invoiceNumberPadding || 4));
    state.settings.invoiceNextNumber = next + 1;
    return series + "-" + String(next).padStart(pad,"0");
  }
  function orderTotal(order){
    if (!order) return 0;
    try {
      const rows = JSON.parse(order.multiArticleItemsJson || order.orderLineItemsJson || "[]");
      if (Array.isArray(rows) && rows.length) return rows.reduce(function(sum,line){ return sum + num(line.quantity || 1) * num(line.unitPrice || line.price); },0);
    } catch(error) {}
    return num(order.total || order.value || order.amount) || num(order.quantity || 1) * num(order.unitPrice || order.price);
  }
  function commissionAmount(order){
    const direct = num(order.commissionAmount || order.commissionValue || order.commission);
    if (direct) return direct;
    const pct = num(order.commissionPct || order.commissionPercent || order.commissionPercentage);
    return orderTotal(order) * pct / 100;
  }
  function findOrderForInvoice(invoice){
    const id = clean(invoice.sourceOrderId || invoice.sourceOperationalId || "");
    const code = clean(invoice.linkedPractice || invoice.project || "");
    return arr(state.orders).find(function(order){
      return clean(order.id || order.code || order.orderCode) === id || clean(order.code || order.id) === code;
    });
  }
  function normalizeInvoiceNumbering(){
    ensure();
    state.outgoingInvoices.forEach(function(invoice){
      if (invoice.pms155Numbered) return;
      const isGenerated = /^FOUT-\d{4}-\d{4}$/.test(clean(invoice.number || invoice.protocol || invoice.id));
      if (!isGenerated && invoice.number && invoice.protocol) {
        invoice.pms155Numbered = true;
        return;
      }
      const number = nextInvoiceNumber();
      invoice.number = number;
      invoice.protocol = number;
      invoice.id = invoice.id || number;
      invoice.pms155Numbered = true;
    });
  }
  function normalizeOperationalCommissionInvoices(){
    ensure();
    state.outgoingInvoices.forEach(function(invoice){
      if (invoice.invoiceKind === "commission") return;
      const isOrderOperational = clean(invoice.sourceOperationalType) === "order" || has(invoice.sourceOrderId);
      if (!isOrderOperational) return;
      const order = findOrderForInvoice(invoice);
      if (!order) return;
      const amount = commissionAmount(order);
      invoice.invoiceKind = "commission";
      invoice.items = [{
        description:"Provvigione / commissione Parmitalia su ordine " + clean(order.code || order.id || invoice.linkedPractice || ""),
        quantity:1,
        unit:"commissione",
        unitPrice:amount,
        vatRate:num(state.settings.defaultCommissionVatRate || 0)
      }];
      invoice.amount = amount;
      invoice.vatAmount = amount * num(state.settings.defaultCommissionVatRate || 0) / 100;
      invoice.total = invoice.amount + invoice.vatAmount;
      invoice.notes = "Fattura automatica di sola provvigione/commissione. Non fattura la merce.";
      order.commissionStatus = amount ? "Fatturata" : "Da fatturare";
    });
  }
  function decorateSettings(){
    ensure(); injectStyle();
    if (!current || current.page !== "settings") return;
    if (document.getElementById("pms155-invoice-settings")) return;
    const content = document.getElementById("content");
    if (!content) return;
    const panel = document.createElement("div");
    panel.id = "pms155-invoice-settings";
    panel.className = "pms155-settings-panel";
    panel.innerHTML = '<h3>Serie e numero fattura</h3><div class="pms155-settings-grid"><div><label>Serie</label><input id="pms155-series" value="' + esc(state.settings.invoiceSeries || "FATT") + '"></div><div><label>Prossimo numero</label><input id="pms155-next" type="number" min="1" value="' + esc(state.settings.invoiceNextNumber || 1) + '"></div><div><label>Cifre</label><input id="pms155-pad" type="number" min="1" value="' + esc(state.settings.invoiceNumberPadding || 4) + '"></div><div><label>IVA commissione %</label><input id="pms155-vat" type="number" step="0.01" value="' + esc(state.settings.defaultCommissionVatRate || 0) + '"></div></div><button class="primary-button" id="pms155-save-settings">Salva serie fatture</button>';
    content.prepend(panel);
    panel.querySelector("#pms155-save-settings").onclick = function(){
      state.settings.invoiceSeries = clean(panel.querySelector("#pms155-series").value) || "FATT";
      state.settings.invoiceNextNumber = Math.max(1,num(panel.querySelector("#pms155-next").value || 1));
      state.settings.invoiceNumberPadding = Math.max(1,num(panel.querySelector("#pms155-pad").value || 4));
      state.settings.defaultCommissionVatRate = num(panel.querySelector("#pms155-vat").value || 0);
      saveNow();
      alert("Serie e prossimo numero fattura salvati.");
    };
  }

  const baseSave155 = typeof save === "function" ? save : null;
  if (baseSave155 && !window.__pms155SaveWrapped) {
    window.__pms155SaveWrapped = true;
    save = function(){
      normalizeOperationalCommissionInvoices();
      normalizeInvoiceNumbering();
      return baseSave155.apply(this,arguments);
    };
  }
  const baseRender155 = typeof render === "function" ? render : null;
  if (baseRender155 && !window.__pms155RenderWrapped) {
    window.__pms155RenderWrapped = true;
    render = function(){
      const result = baseRender155.apply(this,arguments);
      setTimeout(function(){ fixDates(); decorateAgenda(); decorateOperational(); decorateDeals(); decorateSettings(); normalizeOperationalCommissionInvoices(); },40);
      setTimeout(function(){ fixDates(); decorateAgenda(); decorateOperational(); decorateDeals(); decorateSettings(); },260);
      return result;
    };
  }
  const baseBind155 = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind155 && !window.__pms155BindWrapped) {
    window.__pms155BindWrapped = true;
    bindPageActions = function(){
      const result = baseBind155.apply(this,arguments);
      setTimeout(function(){ fixDates(); decorateAgenda(); decorateOperational(); decorateDeals(); decorateSettings(); },40);
      return result;
    };
  }
  document.addEventListener("click",function(event){
    if (event.target.closest("[data-pms85-new-inter],[data-pms85-edit-inter],[data-pms85-open-selected-deal]")) setTimeout(decorateDeals,260);
    setTimeout(fixDates,80);
  },true);
  document.addEventListener("submit",function(event){
    const form = event.target;
    if (form && form.id === "pms85-inter-form") decorateDeals();
  },true);

  ensure();
  injectStyle();
  setTimeout(function(){ fixDates(); decorateAgenda(); decorateOperational(); decorateDeals(); decorateSettings(); normalizeOperationalCommissionInvoices(); },180);
  window.pmsV155DatesAgendaDealsInvoiceCommission = {version:VERSION155,fixDates:fixDates,normalizeOperationalCommissionInvoices:normalizeOperationalCommissionInvoices};
  console.info(VERSION155 + " loaded");
})();
