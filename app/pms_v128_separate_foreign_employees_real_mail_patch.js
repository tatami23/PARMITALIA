(function(){
  "use strict";
  const VERSION = "PMS-V128-SEPARATE-FOREIGN-EMPLOYEES-REAL-MAIL";
  const OFFICE_EMAIL = "office@palmiitalia.org";
  const FOREIGN_MODULE = "foreignEmployees";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function digits(v){ return String(v || "").replace(/[^\d]/g,""); }
  function num(v){ const n = Number(String(v || 0).replace(",", ".")); return Number.isFinite(n) ? n : 0; }
  function money(v, cur){ return (cur || "EUR") + " " + num(v).toFixed(2); }
  function makeId(prefix, list){ return prefix + "-" + String(arr(list).length + 1).padStart(4,"0"); }
  function isClosedPractice(r){ return String((r && (r.practiceStatus || r.status)) || "").toLowerCase().includes("conclus"); }
  function saveState(){
    try {
      if (typeof window.save === "function") return window.save();
      if (window.state && window.STORAGE_KEY) localStorage.setItem(window.STORAGE_KEY, JSON.stringify(window.state));
    } catch(e) { console.warn("PMS v128 save failed", e); }
  }

  function ensure(){
    window.state = window.state || {};
    window.current = window.current || {};
    current.filters = current.filters || {};
    state.settings = state.settings || {};
    state.settings.officeEmail = OFFICE_EMAIL;
    state.mailInbox = arr(state.mailInbox);
    state.mailAccount = state.mailAccount || {email:OFFICE_EMAIL, host:"imap." + OFFICE_EMAIL.split("@")[1], port:993, user:OFFICE_EMAIL, limit:20, rejectUnauthorized:true};
    state.whatsappContacts = arr(state.whatsappContacts);
    state.foreignEmployees = arr(state.foreignEmployees);
    state.foreignRecruiting = arr(state.foreignRecruiting);
    if (state.foreignRecruiting.length && !state.foreignEmployees.length) state.foreignEmployees = state.foreignRecruiting.slice();
    state.employees = arr(state.employees);
    state.employeeLeaves = arr(state.employeeLeaves);
    state.employeePayments = arr(state.employeePayments);
    state.communications = arr(state.communications);
    if (Array.isArray(window.modules)) {
      const hr = modules.find(m => m.id === "humanResources");
      if (hr) {
        hr.label = "Dipendenti azienda";
        hr.subtitle = "Dipendenti interni, ferie, assenze e pagamenti";
      }
      let foreign = modules.find(m => m.id === FOREIGN_MODULE);
      if (!foreign) {
        foreign = {id:FOREIGN_MODULE, label:"Dipendenti estero", subtitle:"Business recruiting estero, costi e pagamenti", roles:["admin","assistant","accountant","agent","recruiter"]};
        const idx = modules.findIndex(m => m.id === "humanResources");
        modules.splice(idx >= 0 ? idx + 1 : modules.length, 0, foreign);
      }
      const crm = modules.find(m => m.id === "communications");
      if (crm) crm.subtitle = "Posta gestionale, WhatsApp e CRM";
    }
  }

  function css(){
    if (document.getElementById("pms-v128-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v128-style";
    s.textContent = `
      #content .pms128-page{display:flex;flex-direction:column;gap:16px;color:#172033;max-width:100%;min-width:0}
      #content .pms128-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:16px;box-shadow:0 8px 22px rgba(15,23,42,.06)}
      #content .pms128-hero h3{margin:3px 0 6px;color:#0f172a;font-size:22px;line-height:1.18;letter-spacing:0}
      #content .pms128-hero p,#content .pms128-hero small{margin:0;color:#475569;line-height:1.45}
      #content .pms128-grid{display:grid;grid-template-columns:repeat(2,minmax(310px,1fr));gap:14px;align-items:start}
      #content .pms128-panel{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px;box-shadow:0 8px 20px rgba(15,23,42,.05);min-width:0;overflow:hidden}
      #content .pms128-panel h4{margin:0 0 10px;color:#0f172a;font-size:15px}
      #content .pms128-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
      #content .pms128-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      #content .pms128-form label{display:flex;flex-direction:column;gap:5px;min-width:0;color:#334155;font-size:12px;font-weight:800}
      #content .pms128-form input,#content .pms128-form select,#content .pms128-form textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:7px;padding:9px;font:inherit;font-size:13px}
      #content .pms128-form textarea{min-height:84px;resize:vertical}
      #content .pms128-span{grid-column:1/-1}
      #content .pms128-table{width:100%;max-width:100%;overflow-x:auto;background:#fff;border:1px solid #d7dee8;border-radius:8px}
      #content .pms128-table table{min-width:900px;width:100%;border-collapse:collapse;margin:0}
      #content .pms128-table th{background:#eef2f7;color:#1e293b;text-align:left;font-size:12px}
      #content .pms128-table th,#content .pms128-table td{padding:9px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top;white-space:nowrap;color:#172033}
      #content .pms128-note{max-width:340px;min-width:220px;white-space:normal;line-height:1.35}
      #content .pms128-badge{display:inline-flex;padding:4px 8px;border-radius:999px;background:#e0f2fe;color:#075985;border:1px solid #bae6fd;font-size:12px;font-weight:900;white-space:nowrap}
      #content .pms128-warning{background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:8px;padding:10px;line-height:1.4;font-size:13px}
      #content .pms128-ok{background:#ecfdf5;border:1px solid #bbf7d0;color:#166534;border-radius:8px;padding:10px;line-height:1.4;font-size:13px}
      #content .pms128-photo-field{display:grid;grid-template-columns:94px minmax(0,1fr);gap:10px;align-items:center}
      #content .pms128-photo-preview{width:86px;height:86px;border:1px solid #cbd5e1;border-radius:8px;background:#f1f5f9;object-fit:cover;display:block}
      #content .pms128-photo-empty{width:86px;height:86px;border:1px dashed #94a3b8;border-radius:8px;background:#f8fafc;color:#64748b;display:flex;align-items:center;justify-content:center;text-align:center;font-size:11px;font-weight:900}
      #content .pms128-money-grid{display:grid;grid-template-columns:repeat(2,minmax(280px,1fr));gap:12px;align-items:start}
      #content .pms128-line-box{border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#f8fafc;display:flex;flex-direction:column;gap:8px}
      #content .pms128-line-row{display:grid;grid-template-columns:minmax(0,1.35fr) 120px 34px;gap:8px;align-items:center}
      #content .pms128-line-row input{height:36px}
      #content .pms128-icon-btn{height:34px;width:34px;border-radius:7px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:900;cursor:pointer}
      #content .pms128-totals{display:grid;grid-template-columns:repeat(4,minmax(120px,1fr));gap:8px;margin-top:10px}
      #content .pms128-total-card{border:1px solid #d7dee8;border-radius:8px;padding:10px;background:#fff}
      #content .pms128-total-card small{display:block;color:#64748b;font-weight:800}
      #content .pms128-total-card strong{display:block;color:#0f172a;font-size:16px;margin-top:3px}
      #content .pms128-doc-list,.pms128-doc-list{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}
      #content .pms128-doc-pill,.pms128-doc-pill{display:inline-flex;align-items:center;gap:6px;border:1px solid #cbd5e1;border-radius:999px;padding:5px 9px;background:#fff;color:#0f172a;text-decoration:none;font-size:12px;font-weight:800}
      #content .pms128-row-actions{display:flex;flex-wrap:wrap;gap:5px}
      #content .pms128-danger{border-color:#fecaca!important;background:#fef2f2!important;color:#991b1b!important}
      .pms128-print-sheet{font-family:Arial,sans-serif;color:#111827;padding:24px;line-height:1.35}
      .pms128-print-sheet h1{font-size:22px;margin:0 0 8px}
      .pms128-print-sheet h2{font-size:15px;margin:18px 0 8px;border-bottom:1px solid #d1d5db;padding-bottom:5px}
      .pms128-print-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 16px}
      .pms128-print-row{font-size:13px}
      .pms128-print-row strong{display:block;color:#374151;font-size:11px;text-transform:uppercase}
      .pms128-print-photo{width:96px;height:96px;object-fit:cover;border:1px solid #d1d5db;border-radius:6px;float:right;margin-left:14px}
      #content .pms128-tabs{display:flex;flex-wrap:wrap;gap:8px}
      #content .pms128-tab{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:7px;padding:8px 10px;font-weight:900;cursor:pointer}
      #content .pms128-tab.active{background:#0f172a;color:#fff;border-color:#0f172a}
      .pms128-modal-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.56);display:flex;align-items:center;justify-content:center;padding:18px}
      .pms128-modal{width:min(760px,100%);max-height:88vh;overflow:auto;background:#fff;color:#172033;border:1px solid #cbd5e1;border-radius:8px;padding:16px;box-shadow:0 22px 70px rgba(0,0,0,.28)}
      .pms128-body{white-space:pre-wrap;background:#f8fafc;border:1px solid #d7dee8;border-radius:8px;padding:12px;line-height:1.45;color:#172033}
      @media(max-width:1050px){#content .pms128-hero,#content .pms128-grid,#content .pms128-money-grid{grid-template-columns:1fr}}
      @media(max-width:850px){#content .pms128-totals{grid-template-columns:repeat(2,minmax(120px,1fr))}}
      @media(max-width:760px){#content .pms128-form{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function val(id){ const el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function setVal(id, value){ const el = document.getElementById(id); if (el) el.value = value == null ? "" : value; }
  function status(v){ return '<span class="pms128-badge">' + esc(v || "-") + '</span>'; }
  function headers(t,s){ const a = document.getElementById("page-title"), b = document.getElementById("page-subtitle"); if (a) a.textContent = t; if (b) b.textContent = s; }
  function modal(title, body){ const box = document.createElement("div"); box.className = "pms128-modal-backdrop"; box.innerHTML = '<div class="pms128-modal"><div class="pms128-actions" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">' + esc(title) + '</h3><button class="secondary-button" data-pms128-close>Chiudi</button></div>' + body + '</div>'; document.body.appendChild(box); box.addEventListener("click", e => { if (e.target === box || e.target.closest("[data-pms128-close]")) box.remove(); }); }
  function fileToData(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({name:file.name, type:file.type || "application/octet-stream", size:file.size || 0, dataUrl:String(reader.result || ""), date:today()});
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  async function readFiles(id, multiple){
    const el = document.getElementById(id);
    const files = el && el.files ? Array.from(el.files) : [];
    if (!files.length) return multiple ? [] : null;
    const docs = await Promise.all(files.map(fileToData));
    return multiple ? docs : docs[0];
  }
  function docLinks(docs){
    return arr(docs).filter(d => d && d.dataUrl).map(d => `<a class="pms128-doc-pill" href="${esc(d.dataUrl)}" target="_blank" rel="noopener">${esc(d.name || "Documento")}</a>`).join("");
  }
  function financeTotal(lines){ return arr(lines).reduce((sum, x) => sum + num(x && x.amount), 0); }
  function collectFinanceRows(kind){
    return Array.from(document.querySelectorAll(`[data-pms128-${kind}-row]`)).map(row => ({
      label: (row.querySelector(`[data-pms128-${kind}-label]`) || {}).value || "",
      amount: (row.querySelector(`[data-pms128-${kind}-amount]`) || {}).value || ""
    })).filter(x => x.label.trim() || num(x.amount));
  }
  function financeRows(kind, rows){
    const clean = arr(rows).length ? arr(rows) : [{label:"", amount:""}];
    return clean.map(x => `<div class="pms128-line-row" data-pms128-${kind}-row><input data-pms128-${kind}-label placeholder="Voce" value="${esc(x.label || "")}"><input data-pms128-${kind}-amount type="number" step="0.01" placeholder="0.00" value="${esc(x.amount || "")}"><button type="button" class="pms128-icon-btn" data-pms128-remove-line title="Rimuovi">X</button></div>`).join("");
  }
  function addFinanceRow(kind){
    const box = document.querySelector(`[data-pms128-${kind}-box]`);
    if (!box) return;
    box.insertAdjacentHTML("beforeend", financeRows(kind, [{label:"", amount:""}]));
    bindFinance();
    updateFinanceTotals();
  }
  function bindFinance(){
    document.querySelectorAll("[data-pms128-add-expense]").forEach(b => b.onclick = () => addFinanceRow("expense"));
    document.querySelectorAll("[data-pms128-add-income]").forEach(b => b.onclick = () => addFinanceRow("income"));
    document.querySelectorAll("[data-pms128-remove-line]").forEach(b => b.onclick = () => { const row = b.closest(".pms128-line-row"); if (row) row.remove(); updateFinanceTotals(); });
    document.querySelectorAll("[data-pms128-expense-amount],[data-pms128-income-amount],[data-pms128-foreign-cost]").forEach(el => el.oninput = updateFinanceTotals);
  }
  function updateFinanceTotals(){
    const cur = val("pms128-foreign-currency") || "EUR";
    const cost = num(val("pms128-foreign-cost"));
    const expenses = financeTotal(collectFinanceRows("expense"));
    const income = financeTotal(collectFinanceRows("income"));
    const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = money(value, cur); };
    set("pms128-total-cost", cost);
    set("pms128-total-expenses", expenses);
    set("pms128-total-income", income);
    set("pms128-total-balance", income - expenses);
  }
  function resetForeignForm(){
    ["edit-id","name","country","city","nationality","role","profile","source","recruiter","investment","phone","email","cost","doc-requests","docs","notes"].forEach(k => setVal("pms128-foreign-" + k, ""));
    setVal("pms128-foreign-type", "Lavoratore");
    setVal("pms128-foreign-status", "In valutazione");
    setVal("pms128-foreign-practice", "Pratica aperta");
    setVal("pms128-foreign-currency", "EUR");
    const exp = document.querySelector("[data-pms128-expense-box]");
    const inc = document.querySelector("[data-pms128-income-box]");
    if (exp) exp.innerHTML = financeRows("expense", [{label:"", amount:""}]);
    if (inc) inc.innerHTML = financeRows("income", [{label:"Acconto", amount:""}]);
    const preview = document.getElementById("pms128-photo-preview-wrap");
    if (preview) preview.innerHTML = '<div class="pms128-photo-empty">Foto</div>';
    const btn = document.querySelector("[data-pms128-save-foreign]");
    if (btn) btn.textContent = "Salva persona estero";
    bindFinance();
    updateFinanceTotals();
  }
  function fillForeignForm(id){
    const r = arr(state.foreignEmployees).find(x => x.id === id);
    if (!r) return;
    setVal("pms128-foreign-edit-id", r.id);
    setVal("pms128-foreign-name", r.fullName);
    setVal("pms128-foreign-country", r.country);
    setVal("pms128-foreign-city", r.city);
    setVal("pms128-foreign-nationality", r.nationality);
    setVal("pms128-foreign-role", r.role);
    setVal("pms128-foreign-profile", r.profile || r.skills);
    setVal("pms128-foreign-source", r.sourceChannel);
    setVal("pms128-foreign-recruiter", r.recruiter);
    setVal("pms128-foreign-investment", r.investment);
    setVal("pms128-foreign-type", r.personType || "Lavoratore");
    setVal("pms128-foreign-phone", r.phone || r.whatsapp);
    setVal("pms128-foreign-email", r.email);
    setVal("pms128-foreign-status", r.status || "In valutazione");
    setVal("pms128-foreign-practice", r.practiceStatus || (isClosedPractice(r) ? "Pratica conclusa" : "Pratica aperta"));
    setVal("pms128-foreign-currency", r.currency || "EUR");
    setVal("pms128-foreign-cost", r.costAmount || r.toPayAmount || "");
    setVal("pms128-foreign-doc-requests", r.documentRequests || "");
    setVal("pms128-foreign-docs", r.documents || "");
    setVal("pms128-foreign-notes", r.notes || "");
    const exp = document.querySelector("[data-pms128-expense-box]");
    const inc = document.querySelector("[data-pms128-income-box]");
    if (exp) exp.innerHTML = financeRows("expense", r.expenseLines || (r.spentAmount ? [{label:"Costo sostenuto", amount:r.spentAmount}] : [{label:"", amount:""}]));
    if (inc) inc.innerHTML = financeRows("income", r.incomeLines || [{label:"Acconto", amount:""}]);
    const preview = document.getElementById("pms128-photo-preview-wrap");
    if (preview) preview.innerHTML = r.photo && r.photo.dataUrl ? `<img class="pms128-photo-preview" src="${esc(r.photo.dataUrl)}" alt="Foto">` : '<div class="pms128-photo-empty">Foto</div>';
    const btn = document.querySelector("[data-pms128-save-foreign]");
    if (btn) btn.textContent = "Aggiorna scheda";
    bindFinance();
    updateFinanceTotals();
    const form = document.getElementById("pms128-foreign-form-panel");
    if (form) form.scrollIntoView({behavior:"smooth", block:"start"});
  }
  function financeHtml(r, internal){
    const cur = r.currency || "EUR";
    const expenses = r.expenseLines || (r.spentAmount ? [{label:"Costo sostenuto", amount:r.spentAmount}] : []);
    const incomes = r.incomeLines || [];
    const expenseTotal = financeTotal(expenses);
    const incomeTotal = financeTotal(incomes);
    const list = arr(internal ? expenses : incomes).map(x => `<div>${esc(x.label || "-")}: <strong>${money(x.amount, cur)}</strong></div>`).join("") || "<div>-</div>";
    return `<h4>Piano finanziario</h4><div class="pms128-body">${internal ? `<strong>Costi sostenuti da noi</strong><br>${list}<br><br><strong>Totale costi:</strong> ${money(expenseTotal, cur)}<br><strong>Totale incassato:</strong> ${money(incomeTotal, cur)}<br><strong>Saldo interno:</strong> ${money(incomeTotal - expenseTotal, cur)}` : `<strong>Costo per il dipendente:</strong> ${money(r.costAmount || r.toPayAmount, cur)}<br><strong>Pagamenti / acconti:</strong><br>${list}<br><br><strong>Totale incassato:</strong> ${money(incomeTotal, cur)}`}</div>`;
  }
  function foreignCardHtml(r, internal){
    const docs = docLinks(r.attachments);
    return `${r.photo && r.photo.dataUrl ? `<img class="pms128-print-photo" src="${esc(r.photo.dataUrl)}" alt="Foto">` : ""}<div class="pms128-print-grid">
      <div class="pms128-print-row"><strong>ID</strong>${esc(r.id || "-")}</div><div class="pms128-print-row"><strong>Nome completo</strong>${esc(r.fullName || "-")}</div>
      <div class="pms128-print-row"><strong>Paese / citta</strong>${esc(r.country || "-")} ${esc(r.city || "")}</div><div class="pms128-print-row"><strong>Nazionalita</strong>${esc(r.nationality || "-")}</div>
      <div class="pms128-print-row"><strong>Ruolo</strong>${esc(r.role || "-")}</div><div class="pms128-print-row"><strong>Profilo</strong>${esc(r.profile || r.skills || "-")}</div>
      <div class="pms128-print-row"><strong>Studente / lavoratore</strong>${esc(r.personType || "-")}</div><div class="pms128-print-row"><strong>Canale / recruiter</strong>${esc(r.sourceChannel || "-")} ${esc(r.recruiter ? " - " + r.recruiter : "")}</div>
      <div class="pms128-print-row"><strong>Telefono WhatsApp</strong>${esc(r.phone || r.whatsapp || "-")}</div><div class="pms128-print-row"><strong>Email</strong>${esc(r.email || "-")}</div>
      <div class="pms128-print-row"><strong>Stato</strong>${esc(r.status || "-")}</div><div class="pms128-print-row"><strong>Stato pratica</strong>${esc(r.practiceStatus || "-")}</div>
    </div><h2>Documentazione</h2><div class="pms128-body">${esc((r.documentRequests ? "Documenti richiesti:\n" + r.documentRequests + "\n\n" : "") + (r.documents || ""))}</div>${docs ? `<div class="pms128-doc-list">${docs}</div>` : ""}${financeHtml(r, internal)}${internal ? `<h4>Note interne</h4><div class="pms128-body">${esc((r.investment ? "Investimenti / situazione:\n" + r.investment + "\n\n" : "") + (r.notes || ""))}</div>` : ""}`;
  }
  function openForeignModal(id){
    const r = arr(state.foreignEmployees).find(x => x.id === id);
    if (!r) return;
    const body = `<div class="pms128-actions" style="margin-bottom:10px"><button class="primary-button" data-pms128-foreign-edit="${esc(r.id)}">Modifica</button><button class="secondary-button" data-pms128-print-employee="${esc(r.id)}">Stampa scheda dipendente</button><button class="secondary-button" data-pms128-print-internal="${esc(r.id)}">Stampa scheda interna</button><button class="secondary-button pms128-danger" data-pms128-foreign-delete="${esc(r.id)}">Elimina</button></div>${foreignCardHtml(r, true)}`;
    modal(r.fullName || "Scheda estero", body);
    bind();
  }
  function printForeign(id, internal){
    const r = arr(state.foreignEmployees).find(x => x.id === id);
    if (!r) return;
    const title = internal ? "Scheda interna dipendente estero" : "Scheda dipendente estero";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${Array.from(document.styleSheets).map(ss => { try { return Array.from(ss.cssRules || []).map(rule => rule.cssText).join("\n"); } catch(e) { return ""; } }).join("\n")}</style></head><body><div class="pms128-print-sheet"><h1>${esc(title)}</h1><p>${esc(today())} - ${esc(r.fullName || "")}</p>${foreignCardHtml(r, internal)}</div><script>window.onload=function(){window.print();};<\/script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.open(); w.document.write(html); w.document.close(); }
  }
  function deleteForeign(id){
    const r = arr(state.foreignEmployees).find(x => x.id === id);
    if (!r || !confirm("Vuoi eliminare definitivamente la scheda di " + (r.fullName || r.id) + "?")) return;
    state.foreignEmployees = arr(state.foreignEmployees).filter(x => x.id !== id);
    state.foreignRecruiting = state.foreignEmployees.slice();
    saveState();
    render();
  }

  function saveMailConfig(){
    ensure();
    state.mailAccount = {
      email: val("pms128-mail-email") || OFFICE_EMAIL,
      host: val("pms128-mail-host"),
      port: Number(val("pms128-mail-port") || 993),
      user: val("pms128-mail-user"),
      password: val("pms128-mail-password"),
      limit: Number(val("pms128-mail-limit") || 20),
      rejectUnauthorized: true
    };
    saveState();
    alert("Account posta salvato nel gestionale.");
  }

  async function fetchInbox(){
    ensure();
    const statusEl = document.getElementById("pms128-mail-status");
    saveMailConfig();
    if (!window.parmitaliaMail || typeof window.parmitaliaMail.fetchInbox !== "function") {
      if (statusEl) statusEl.textContent = "Apri l'app desktop installata: nel browser semplice non posso ricevere direttamente le mail.";
      return;
    }
    if (statusEl) statusEl.textContent = "Connessione alla casella in corso...";
    try {
      const result = await window.parmitaliaMail.fetchInbox(state.mailAccount);
      const messages = arr(result && result.messages);
      const known = new Set(arr(state.mailInbox).map(m => String(m.uid || m.id)));
      messages.forEach(msg => {
        if (known.has(String(msg.uid))) return;
        state.mailInbox.unshift({id:makeId("MAIL", state.mailInbox), uid:msg.uid, date:msg.date || today(), sender:msg.from, email:msg.from, subject:msg.subject, category:"Inbox", body:msg.raw || msg.preview, preview:msg.preview, status:"Nuova", linkedTo:"Posta gestionale"});
      });
      saveState();
      if (statusEl) statusEl.textContent = "Scaricate " + messages.length + " mail dalla casella.";
      setTimeout(() => { if (typeof render === "function") render(); }, 500);
    } catch(err) {
      if (statusEl) statusEl.textContent = "Errore posta: " + (err && err.message ? err.message : err);
    }
  }

  function renderCRM(){
    ensure(); css();
    const acc = state.mailAccount || {};
    const rows = arr(state.mailInbox).slice(0,100).map(m => `<tr><td>${esc(m.date || "")}</td><td><strong>${esc(m.sender || "-")}</strong></td><td class="pms128-note"><strong>${esc(m.subject || "-")}</strong><br><small>${esc(String(m.preview || m.body || "").slice(0,130))}</small></td><td>${esc(m.category || "Inbox")}</td><td>${status(m.status || "Aperta")}</td><td><button class="inline-button" data-pms128-mail-open="${esc(m.id)}">Apri</button> <button class="inline-button" data-pms128-mail-catalog="${esc(m.id)}">Catalogo</button></td></tr>`).join("");
    const waRows = arr(state.whatsappContacts).slice(0,40).map(c => { const phone = digits(c.phone); return `<tr><td>${esc(c.date || "")}</td><td><strong>${esc(c.name || "-")}</strong></td><td>${esc(c.phone || "-")}</td><td>${esc(c.category || "")}</td><td class="pms128-note">${esc(c.notes || "")}</td><td>${phone ? `<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/${esc(phone)}">Apri chat</a>` : ""}</td></tr>`; }).join("");
    return `<div class="pms128-page"><div class="pms128-hero"><div><small>Comunicazioni / CRM</small><h3>Posta ricevuta dentro il gestionale</h3><p>Configura la tua casella dominio via IMAP e scarica le mail direttamente nel registro CRM. WhatsApp resta disponibile come accesso rapido e rubrica contatti.</p></div><div class="pms128-actions"><button class="primary-button" data-pms128-fetch-mail>Scarica posta</button><a class="secondary-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">WhatsApp Web</a></div></div>
      <div class="pms128-grid"><div class="pms128-panel"><h4>Account email gestionale</h4><div class="pms128-warning">Per molti domini serve una password specifica per app/IMAP. La password viene salvata localmente su questo PC: usala solo su computer protetto.</div><div class="pms128-form" style="margin-top:10px"><label>Email<input id="pms128-mail-email" value="${esc(acc.email || OFFICE_EMAIL)}"></label><label>Utente<input id="pms128-mail-user" value="${esc(acc.user || acc.email || OFFICE_EMAIL)}"></label><label>Host IMAP<input id="pms128-mail-host" value="${esc(acc.host || "imap." + OFFICE_EMAIL.split("@")[1])}"></label><label>Porta<input id="pms128-mail-port" type="number" value="${esc(acc.port || 993)}"></label><label>Password<input id="pms128-mail-password" type="password" value="${esc(acc.password || "")}"></label><label>Numero mail<input id="pms128-mail-limit" type="number" value="${esc(acc.limit || 20)}"></label><div class="pms128-actions pms128-span"><button class="secondary-button" data-pms128-save-mail-config>Salva account</button><button class="primary-button" data-pms128-fetch-mail>Scarica posta</button></div></div><div id="pms128-mail-status" class="pms128-ok" style="margin-top:10px">Pronto per collegare la casella.</div></div>
      <div class="pms128-panel"><h4>WhatsApp CRM</h4><div class="pms128-ok">Apri WhatsApp Web e scansiona dal telefono. Poi registra qui i contatti ricevuti.</div><div class="pms128-form" style="margin-top:10px"><label>Nome<input id="pms128-wa-name"></label><label>Telefono<input id="pms128-wa-phone"></label><label>Origine<input id="pms128-wa-source"></label><label>Categoria<select id="pms128-wa-category"><option>Cliente</option><option>Fornitore</option><option>Candidato estero</option><option>Altro</option></select></label><label class="pms128-span">Note<textarea id="pms128-wa-notes"></textarea></label><div class="pms128-actions pms128-span"><button class="primary-button" data-pms128-save-wa>Salva contatto</button><a class="secondary-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">Apri WhatsApp Web</a></div></div></div></div>
      <div class="section-header"><h3>Mail ricevute nel gestionale</h3></div><div class="pms128-table"><table><thead><tr><th>Data</th><th>Mittente</th><th>Oggetto</th><th>Categoria</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="empty">Nessuna mail scaricata nel gestionale.</td></tr>'}</tbody></table></div>
      <div class="section-header"><h3>Contatti WhatsApp</h3></div><div class="pms128-table"><table><thead><tr><th>Data</th><th>Nome</th><th>Telefono</th><th>Categoria</th><th>Note</th><th>Azioni</th></tr></thead><tbody>${waRows || '<tr><td colspan="6" class="empty">Nessun contatto WhatsApp registrato.</td></tr>'}</tbody></table></div></div>`;
  }

  function renderInternalHR(){
    ensure(); css();
    const tab = current.filters.hrInternalTab || "employees";
    const active = id => "pms128-tab" + (tab === id ? " active" : "");
    const empRows = arr(state.employees).map(e => `<tr><td>${esc(e.id)}</td><td><strong>${esc((e.firstName || "") + " " + (e.lastName || ""))}</strong><br><small>${esc(e.email || "")}</small></td><td>${esc(e.jobTitle || "-")}</td><td>${esc(e.department || "-")}</td><td>${esc(e.hireDate || "-")}</td><td>${esc(e.contractType || "-")}</td><td>${money(e.grossSalary,e.currency)}</td><td>${status(e.status || "Attivo")}</td><td><button class="inline-button" data-edit="employees" data-id="${esc(e.id)}">Modifica</button></td></tr>`).join("");
    const leaveRows = arr(state.employeeLeaves).map(e => `<tr><td>${esc(e.id)}</td><td>${esc(e.employeeName || "-")}</td><td>${esc(e.leaveType || "-")}</td><td>${esc(e.startDate || "-")}</td><td>${esc(e.endDate || "-")}</td><td>${esc(e.days || "-")}</td><td>${status(e.status || "Richiesta")}</td><td><button class="inline-button" data-edit="employeeLeaves" data-id="${esc(e.id)}">Modifica</button></td></tr>`).join("");
    const payRows = arr(state.employeePayments).map(e => `<tr><td>${esc(e.id)}</td><td>${esc(e.employeeName || "-")}</td><td>${esc(e.month || "-")}</td><td>${money(e.grossAmount,e.currency)}</td><td>${money(e.deductions,e.currency)}</td><td>${money(e.netAmount || (num(e.grossAmount)-num(e.deductions)),e.currency)}</td><td>${status(e.status || "Da pagare")}</td><td><button class="inline-button" data-edit="employeePayments" data-id="${esc(e.id)}">Modifica</button></td></tr>`).join("");
    const table = tab === "leaves" ? `<div class="pms128-table"><table><thead><tr><th>ID</th><th>Dipendente</th><th>Tipo</th><th>Dal</th><th>Al</th><th>Giorni</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${leaveRows || '<tr><td colspan="8" class="empty">Nessuna assenza registrata.</td></tr>'}</tbody></table></div>` : tab === "payments" ? `<div class="pms128-table"><table><thead><tr><th>ID</th><th>Dipendente</th><th>Mese</th><th>Lordo</th><th>Trattenute</th><th>Netto</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${payRows || '<tr><td colspan="8" class="empty">Nessun pagamento registrato.</td></tr>'}</tbody></table></div>` : `<div class="pms128-table"><table><thead><tr><th>ID</th><th>Dipendente</th><th>Mansione</th><th>Reparto</th><th>Assunzione</th><th>Contratto</th><th>Retribuzione</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${empRows || '<tr><td colspan="9" class="empty">Nessun dipendente aziendale registrato.</td></tr>'}</tbody></table></div>`;
    return `<div class="pms128-page"><div class="pms128-hero"><div><small>Risorse umane interne</small><h3>Dipendenti azienda</h3><p>Questa sezione resta solo per i dipendenti della tua azienda: anagrafica, ferie, assenze e pagamenti.</p></div><div class="pms128-actions"><button class="primary-button" data-add="${tab === "leaves" ? "employeeLeaves" : tab === "payments" ? "employeePayments" : "employees"}">Nuovo</button><button class="secondary-button" data-nav="${FOREIGN_MODULE}">Vai a dipendenti estero</button></div></div><div class="pms128-tabs"><button class="${active("employees")}" data-pms128-hrtab="employees">Dipendenti</button><button class="${active("leaves")}" data-pms128-hrtab="leaves">Ferie / assenze</button><button class="${active("payments")}" data-pms128-hrtab="payments">Pagamenti</button></div>${table}</div>`;
  }

  function renderForeign(){
    ensure(); css();
    const row = r => {
      const phone = digits(r.phone || r.whatsapp);
      const expenseTotal = financeTotal(r.expenseLines || (r.spentAmount ? [{amount:r.spentAmount}] : []));
      const incomeTotal = financeTotal(r.incomeLines || []);
      const links = docLinks(r.attachments);
      return `<tr><td>${esc(r.id || "")}</td><td><strong>${esc(r.fullName || "-")}</strong><br><small>${esc(r.email || "")}</small></td><td>${esc(r.country || "-")}<br><small>${esc(r.city || "")}</small></td><td>${esc(r.role || "-")}<br><small>${esc(r.personType || "")}</small></td><td class="pms128-note">${esc(r.documentRequests || r.documents || r.skills || "-")}${links ? `<div class="pms128-doc-list">${links}</div>` : ""}</td><td>${money(r.costAmount || r.toPayAmount,r.currency)}</td><td>${money(expenseTotal,r.currency)}<br><small>Incassato ${money(incomeTotal,r.currency)}</small></td><td>${status(r.status || "In valutazione")}<br><small>${esc(r.practiceStatus || "Pratica aperta")}</small></td><td><div class="pms128-row-actions">${phone ? `<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/${esc(phone)}">WhatsApp</a>` : ""}<button class="inline-button" data-pms128-foreign-open="${esc(r.id)}">Scheda</button><button class="inline-button" data-pms128-foreign-edit="${esc(r.id)}">Modifica</button><button class="inline-button" data-pms128-print-employee="${esc(r.id)}">Stampa lui</button><button class="inline-button" data-pms128-print-internal="${esc(r.id)}">Stampa interna</button><button class="inline-button pms128-danger" data-pms128-foreign-delete="${esc(r.id)}">Elimina</button></div></td></tr>`;
    };
    const activeRows = arr(state.foreignEmployees).filter(r => !isClosedPractice(r)).map(row).join("");
    const closedRows = arr(state.foreignEmployees).filter(isClosedPractice).map(row).join("");
    return `<div class="pms128-page"><div class="pms128-hero"><div><small>Modulo separato</small><h3>Dipendenti estero / business recruiting</h3><p>Gestione completa della persona estera: foto, anagrafica, documenti sempre visualizzabili, stato pratica, schede stampabili e piano finanziario con costi, acconti e incassi.</p></div><div class="pms128-actions"><button class="primary-button" data-pms128-save-foreign>Salva persona estero</button><button class="secondary-button" data-pms128-reset-foreign>Pulisci scheda</button><button class="secondary-button" data-nav="humanResources">Dipendenti azienda</button></div></div>
      <div class="pms128-panel" id="pms128-foreign-form-panel"><h4>Nuova scheda estero</h4><input id="pms128-foreign-edit-id" type="hidden"><div class="pms128-form">
        <label class="pms128-span">Foto dipendente<div class="pms128-photo-field"><span id="pms128-photo-preview-wrap"><span class="pms128-photo-empty">Foto</span></span><input id="pms128-foreign-photo" type="file" accept="image/*"></div></label>
        <label>Nome completo<input id="pms128-foreign-name"></label><label>Paese<input id="pms128-foreign-country"></label><label>Citta<input id="pms128-foreign-city"></label><label>Nazionalita<input id="pms128-foreign-nationality"></label>
        <label>Ruolo<input id="pms128-foreign-role"></label><label>Profilo<input id="pms128-foreign-profile"></label><label>Canale<input id="pms128-foreign-source"></label><label>Recruiter<input id="pms128-foreign-recruiter"></label>
        <label>Investimenti / situazione<input id="pms128-foreign-investment"></label><label>Studente o lavoratore<select id="pms128-foreign-type"><option>Studente</option><option selected>Lavoratore</option></select></label>
        <label>Telefono WhatsApp<input id="pms128-foreign-phone"></label><label>Email<input id="pms128-foreign-email" type="email"></label>
        <label>Stato<select id="pms128-foreign-status"><option>In valutazione</option><option>Documenti richiesti</option><option>Colloquio fissato</option><option>Disponibile</option><option>Inserito presso cliente</option><option>In attesa pagamento</option><option>Archiviato</option></select></label>
        <label>Stato pratica<select id="pms128-foreign-practice"><option>Pratica aperta</option><option>Documenti richiesti</option><option>In lavorazione</option><option>In attesa pagamento</option><option>Pratica conclusa</option></select></label>
        <label>Valuta<select id="pms128-foreign-currency"><option>EUR</option><option>RON</option><option>GBP</option><option>USD</option></select></label><label>Costo (quanto deve pagare)<input id="pms128-foreign-cost" type="number" step="0.01"></label>
        <label class="pms128-span">Documentazione richiesta<textarea id="pms128-foreign-doc-requests" placeholder="Es. passaporto, patente, certificati, CV, permesso..."></textarea></label>
        <label class="pms128-span">Carica documenti sempre visualizzabili<input id="pms128-foreign-attachments" type="file" multiple></label>
        <label class="pms128-span">Scheda / documenti / competenze<textarea id="pms128-foreign-docs"></textarea></label><label class="pms128-span">Note interne / business<textarea id="pms128-foreign-notes"></textarea></label>
      </div></div>
      <div class="pms128-panel"><h4>Piano finanziario</h4><div class="pms128-money-grid"><div class="pms128-line-box"><strong>Voci che stiamo spendendo noi</strong><div data-pms128-expense-box>${financeRows("expense", [{label:"", amount:""}])}</div><button class="secondary-button" type="button" data-pms128-add-expense>Aggiungi costo</button></div><div class="pms128-line-box"><strong>Pagamenti / incassi dal dipendente</strong><div data-pms128-income-box>${financeRows("income", [{label:"Acconto", amount:""}])}</div><button class="secondary-button" type="button" data-pms128-add-income>Aggiungi incasso</button></div></div><div class="pms128-totals"><div class="pms128-total-card"><small>Costo da pagare</small><strong id="pms128-total-cost">EUR 0.00</strong></div><div class="pms128-total-card"><small>Totale costi nostri</small><strong id="pms128-total-expenses">EUR 0.00</strong></div><div class="pms128-total-card"><small>Totale incassato</small><strong id="pms128-total-income">EUR 0.00</strong></div><div class="pms128-total-card"><small>Saldo incassi - costi</small><strong id="pms128-total-balance">EUR 0.00</strong></div></div></div>
      <div class="section-header"><h3>Archivio dipendenti estero</h3></div><div class="pms128-table"><table><thead><tr><th>ID</th><th>Persona</th><th>Origine</th><th>Ruolo</th><th>Documenti</th><th>Costo</th><th>Piano finanziario</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${activeRows || '<tr><td colspan="9" class="empty">Nessuna pratica estera aperta.</td></tr>'}</tbody></table></div>
      <div class="section-header"><h3>Pratiche concluse</h3></div><div class="pms128-table"><table><thead><tr><th>ID</th><th>Persona</th><th>Origine</th><th>Ruolo</th><th>Documenti</th><th>Costo</th><th>Piano finanziario</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${closedRows || '<tr><td colspan="9" class="empty">Nessuna pratica conclusa.</td></tr>'}</tbody></table></div></div>`;
  }

  function saveWa(){ ensure(); state.whatsappContacts.unshift({id:makeId("WA", state.whatsappContacts), date:today(), name:val("pms128-wa-name"), phone:val("pms128-wa-phone"), source:val("pms128-wa-source"), category:val("pms128-wa-category"), notes:val("pms128-wa-notes")}); saveState(); render(); }
  async function saveForeign(){
    ensure();
    const editId = val("pms128-foreign-edit-id");
    const existing = editId ? arr(state.foreignEmployees).find(x => x.id === editId) : null;
    const photo = await readFiles("pms128-foreign-photo", false);
    const attachments = await readFiles("pms128-foreign-attachments", true);
    const record = Object.assign({}, existing || {}, {
      id: editId || makeId("EST", state.foreignEmployees),
      date: (existing && existing.date) || today(),
      updatedAt: today(),
      fullName: val("pms128-foreign-name"),
      country: val("pms128-foreign-country"),
      city: val("pms128-foreign-city"),
      nationality: val("pms128-foreign-nationality"),
      role: val("pms128-foreign-role"),
      profile: val("pms128-foreign-profile"),
      sourceChannel: val("pms128-foreign-source"),
      recruiter: val("pms128-foreign-recruiter"),
      investment: val("pms128-foreign-investment"),
      personType: val("pms128-foreign-type"),
      phone: val("pms128-foreign-phone"),
      whatsapp: val("pms128-foreign-phone"),
      email: val("pms128-foreign-email"),
      status: val("pms128-foreign-status") || "In valutazione",
      practiceStatus: val("pms128-foreign-practice") || "Pratica aperta",
      currency: val("pms128-foreign-currency") || "EUR",
      costAmount: val("pms128-foreign-cost"),
      toPayAmount: val("pms128-foreign-cost"),
      documentRequests: val("pms128-foreign-doc-requests"),
      documents: val("pms128-foreign-docs"),
      skills: val("pms128-foreign-profile") || val("pms128-foreign-docs"),
      notes: val("pms128-foreign-notes"),
      expenseLines: collectFinanceRows("expense"),
      incomeLines: collectFinanceRows("income")
    });
    if (photo) record.photo = photo;
    record.attachments = arr(existing && existing.attachments).concat(attachments);
    record.spentAmount = financeTotal(record.expenseLines);
    record.totalReceived = financeTotal(record.incomeLines);
    if (existing) state.foreignEmployees = arr(state.foreignEmployees).map(x => x.id === editId ? record : x);
    else state.foreignEmployees.unshift(record);
    state.foreignRecruiting = state.foreignEmployees.slice();
    saveState();
    render();
  }

  function bind(){
    document.querySelectorAll("[data-pms128-hrtab]").forEach(b => b.onclick = () => { current.filters.hrInternalTab = b.getAttribute("data-pms128-hrtab"); render(); });
    document.querySelectorAll("[data-pms128-save-mail-config]").forEach(b => b.onclick = saveMailConfig);
    document.querySelectorAll("[data-pms128-fetch-mail]").forEach(b => b.onclick = fetchInbox);
    document.querySelectorAll("[data-pms128-save-wa]").forEach(b => b.onclick = saveWa);
    document.querySelectorAll("[data-pms128-save-foreign]").forEach(b => b.onclick = saveForeign);
    document.querySelectorAll("[data-pms128-reset-foreign]").forEach(b => b.onclick = resetForeignForm);
    bindFinance();
    updateFinanceTotals();
    const photoInput = document.getElementById("pms128-foreign-photo");
    if (photoInput) photoInput.onchange = async () => {
      const photo = await readFiles("pms128-foreign-photo", false);
      const preview = document.getElementById("pms128-photo-preview-wrap");
      if (photo && preview) preview.innerHTML = `<img class="pms128-photo-preview" src="${esc(photo.dataUrl)}" alt="Foto">`;
    };
    document.querySelectorAll("[data-pms128-mail-open]").forEach(b => b.onclick = () => { const m = arr(state.mailInbox).find(x => x.id === b.getAttribute("data-pms128-mail-open")); if (m) modal(m.subject || "Email", '<p><strong>Mittente:</strong> ' + esc(m.sender || "-") + '</p><div class="pms128-body">' + esc(m.body || m.preview || "") + '</div>'); });
    document.querySelectorAll("[data-pms128-mail-catalog]").forEach(b => b.onclick = () => { const m = arr(state.mailInbox).find(x => x.id === b.getAttribute("data-pms128-mail-catalog")); if (!m) return; const cat = prompt("Categoria", m.category || "Inbox"); if (cat) m.category = cat; const st = prompt("Stato", m.status || "Aperta"); if (st) m.status = st; saveState(); render(); });
    document.querySelectorAll("[data-pms128-foreign-open]").forEach(b => b.onclick = () => openForeignModal(b.getAttribute("data-pms128-foreign-open")));
    document.querySelectorAll("[data-pms128-foreign-edit]").forEach(b => b.onclick = () => { document.querySelectorAll(".pms128-modal-backdrop").forEach(x => x.remove()); fillForeignForm(b.getAttribute("data-pms128-foreign-edit")); });
    document.querySelectorAll("[data-pms128-print-employee]").forEach(b => b.onclick = () => printForeign(b.getAttribute("data-pms128-print-employee"), false));
    document.querySelectorAll("[data-pms128-print-internal]").forEach(b => b.onclick = () => printForeign(b.getAttribute("data-pms128-print-internal"), true));
    document.querySelectorAll("[data-pms128-foreign-delete]").forEach(b => b.onclick = () => deleteForeign(b.getAttribute("data-pms128-foreign-delete")));
  }

  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms128Wrapped) {
    window.render = function(){
      ensure();
      const content = document.getElementById("content");
      if (content && current && current.page === "communications") { headers("Comunicazioni / CRM", "Posta gestionale, WhatsApp e catalogazione"); content.innerHTML = renderCRM(); bind(); return; }
      if (content && current && current.page === "humanResources") { headers("Dipendenti azienda", "Dipendenti interni, ferie, assenze e pagamenti"); content.innerHTML = renderInternalHR(); bind(); if (typeof bindPageActions === "function") bindPageActions(); return; }
      if (content && current && current.page === FOREIGN_MODULE) { headers("Dipendenti estero", "Business recruiting estero separato"); content.innerHTML = renderForeign(); bind(); return; }
      return baseRender.apply(this, arguments);
    };
    window.render.__pms128Wrapped = true;
  }

  const baseNav = typeof window.renderNav === "function" ? window.renderNav : null;
  if (baseNav && !baseNav.__pms128Wrapped) {
    window.renderNav = function(){ ensure(); const out = baseNav.apply(this, arguments); return out; };
    window.renderNav.__pms128Wrapped = true;
  }

  ensure();
  css();
  setTimeout(() => { if (typeof renderNav === "function") renderNav(); if (typeof render === "function" && current && ["communications","humanResources",FOREIGN_MODULE].includes(current.page)) render(); }, 100);
  window.pmsV128SeparateForeignEmployeesRealMail = {version:VERSION};
})();
