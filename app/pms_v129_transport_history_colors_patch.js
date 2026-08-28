(function(){
  "use strict";
  const VERSION = "PMS-V129-TRANSPORT-HISTORY-COLORS";
  const MODULE = "transportPrices";
  const PRESETS = [
    {name:"Blu Parmitalia", primary:"#1f4e78", secondary:"#0f766e"},
    {name:"Verde operativo", primary:"#166534", secondary:"#0f766e"},
    {name:"Bordeaux executive", primary:"#7f1d1d", secondary:"#b45309"},
    {name:"Petrolio moderno", primary:"#0f3f46", secondary:"#2563eb"},
    {name:"Indaco professionale", primary:"#3730a3", secondary:"#0891b2"},
    {name:"Grafite e oro", primary:"#374151", secondary:"#ca8a04"},
    {name:"Nero business", primary:"#111827", secondary:"#64748b"},
    {name:"Rame logistico", primary:"#9a3412", secondary:"#0e7490"},
    {name:"Rubino e acciaio", primary:"#881337", secondary:"#475569"},
    {name:"Foresta e lime", primary:"#14532d", secondary:"#65a30d"},
    {name:"Oceano e corallo", primary:"#075985", secondary:"#e11d48"},
    {name:"Viola sobrio", primary:"#581c87", secondary:"#0284c7"}
  ];

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function saveState(){ try { if (typeof save === "function") return save(); if (window.STORAGE_KEY) localStorage.setItem(window.STORAGE_KEY, JSON.stringify(state)); return true; } catch(e) { console.warn(e); return false; } }
  function next(prefix,list){
    const y = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + y + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => { const m = String(x.id || "").match(re); return m ? Math.max(a, Number(m[1])) : a; }, 0);
    return prefix + "-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function field(id){ const el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function setField(id,value){ const el = document.getElementById(id); if (el) el.value = value == null ? "" : value; }
  function darken(hex){
    const clean = String(hex || "#1f4e78").replace("#","");
    if (clean.length !== 6) return "#173b5c";
    const n = parseInt(clean,16);
    const r = Math.max(0, Math.round(((n >> 16) & 255) * .76));
    const g = Math.max(0, Math.round(((n >> 8) & 255) * .76));
    const b = Math.max(0, Math.round((n & 255) * .76));
    return "#" + [r,g,b].map(x => x.toString(16).padStart(2,"0")).join("");
  }
  function hexRgb(hex){
    const clean = String(hex || "#1f4e78").replace("#","");
    if (clean.length !== 6) return {r:31,g:78,b:120};
    const n = parseInt(clean,16);
    return {r:(n >> 16) & 255,g:(n >> 8) & 255,b:n & 255};
  }
  function rgba(hex,alpha){ const c = hexRgb(hex); return "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha + ")"; }

  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.transportPrices = arr(state.transportPrices);
    state.routeStudies = arr(state.routeStudies);
    state.transportCompleted = arr(state.transportCompleted || state.transportHistory);
    state.transportHistory = state.transportCompleted;
    state.settings.pms129Primary = state.settings.pms129Primary || state.settings.primaryColor || "#1f4e78";
    state.settings.pms129Secondary = state.settings.pms129Secondary || state.settings.secondaryColor || "#0f766e";
    state.settings.pms129ThemeName = state.settings.pms129ThemeName || "Blu Parmitalia";
  }

  function applyTheme(){
    ensure();
    const root = document.documentElement;
    const primary = state.settings.pms129Primary || "#1f4e78";
    const secondary = state.settings.pms129Secondary || "#0f766e";
    const primaryDark = darken(primary);
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-dark", primaryDark);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--theme-primary", primary);
    root.style.setProperty("--theme-primary-dark", primaryDark);
    root.style.setProperty("--theme-secondary", secondary);
    root.style.setProperty("--sidebar-color", primaryDark);
    root.style.setProperty("--bg", rgba(primary,.05));
    root.style.setProperty("--card", "#ffffff");
    root.style.setProperty("--line", rgba(primary,.20));
    root.style.setProperty("--theme-primary-soft", rgba(primary,.10));
    root.style.setProperty("--theme-primary-mid", rgba(primary,.18));
    root.style.setProperty("--theme-primary-strong", rgba(primary,.88));
    root.style.setProperty("--theme-secondary-soft", rgba(secondary,.12));
    root.style.setProperty("--theme-secondary-mid", rgba(secondary,.22));
    root.style.setProperty("--theme-shadow", rgba(primary,.18));
    state.settings.primaryColor = primary;
    state.settings.secondaryColor = secondary;
    state.settings.sidebarColor = primaryDark;
    state.settings.bgColor = rgba(primary,.05);
    state.settings.lineColor = rgba(primary,.20);
  }

  function css(){
    if (document.getElementById("pms-v129-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v129-style";
    s.textContent = `
      body .sidebar,body .app-sidebar{background:linear-gradient(180deg,var(--theme-primary-dark),var(--theme-primary))!important;color:#fff!important}
      body.pms106-ui .sidebar,
      body.pms108-bottom-menu .sidebar,
      body.pms106-ui.pms108-bottom-menu .sidebar,
      body.device-phone.pms106-ui .sidebar,
      body.device-tablet.pms106-ui .sidebar,
      body.device-phone.pms108-bottom-menu .sidebar,
      body.device-tablet.pms108-bottom-menu .sidebar{
        background:radial-gradient(circle at 82px 54px,var(--theme-secondary-mid),transparent 110px),linear-gradient(180deg,var(--theme-primary-dark) 0%,var(--theme-primary) 62%,var(--theme-secondary) 100%)!important;
        border-color:var(--theme-secondary-mid)!important;
        box-shadow:0 18px 48px var(--theme-shadow),inset 0 0 44px var(--theme-secondary-soft)!important;
      }
      body.pms108-bottom-menu .sidebar{background:radial-gradient(circle at 82px 54px,var(--theme-secondary-mid),transparent 96px),linear-gradient(90deg,var(--theme-primary-dark) 0%,var(--theme-primary) 54%,var(--theme-secondary) 100%)!important}
      body .sidebar-brand,body .sidebar-footer{border-color:rgba(255,255,255,.18)!important}
      body .sidebar-brand strong,body .sidebar-brand span,body .sidebar-footer span{color:#fff!important}
      body .nav-button{color:rgba(255,255,255,.86)!important}
      body .nav-button:hover,body .nav-button.active{background:rgba(255,255,255,.16)!important;color:#fff!important;border-color:rgba(255,255,255,.18)!important}
      body.pms106-ui .nav-button,
      body.pms106-ui #nav.pms86-nav .nav-button,
      body.pms106-ui #nav.pms86-nav .nav-button.compact,
      body.pms108-bottom-menu .nav-button,
      body.pms108-bottom-menu #nav.pms86-nav .nav-button,
      body.pms108-bottom-menu #nav.pms86-nav .nav-button.compact{
        background:var(--theme-primary-strong)!important;
        color:#fff!important;
        border-color:var(--theme-secondary-mid)!important;
      }
      body.pms106-ui .nav-button:hover,
      body.pms106-ui .nav-button.active,
      body.pms106-ui #nav.pms86-nav .nav-button:hover,
      body.pms106-ui #nav.pms86-nav .nav-button.active,
      body.pms108-bottom-menu .nav-button:hover,
      body.pms108-bottom-menu .nav-button.active,
      body.pms108-bottom-menu #nav.pms86-nav .nav-button:hover,
      body.pms108-bottom-menu #nav.pms86-nav .nav-button.active{
        background:linear-gradient(90deg,var(--theme-secondary),var(--theme-primary))!important;
        color:#fff!important;
        border-color:rgba(255,255,255,.38)!important;
      }
      body.pms106-ui .nav-button::before,
      body.pms106-ui #nav.pms86-nav .pms52-nav-code,
      body.pms106-ui #nav.pms86-nav .pms86-nav-code,
      body.pms108-bottom-menu .nav-button::before,
      body.pms108-bottom-menu #nav.pms86-nav .pms52-nav-code,
      body.pms108-bottom-menu #nav.pms86-nav .pms86-nav-code{
        background:var(--theme-secondary)!important;
        border-color:rgba(255,255,255,.35)!important;
        color:#fff!important;
      }
      body.pms106-ui .pms106-hub,
      body.pms108-bottom-menu .pms106-hub{border-color:var(--theme-secondary-mid)!important;background:var(--theme-primary-strong)!important}
      body.pms106-ui .pms106-wheel button,
      body.pms108-bottom-menu .pms106-wheel button{background:var(--theme-primary)!important;border-color:var(--theme-secondary-mid)!important;color:#fff!important}
      body.pms106-ui .pms106-wheel button:hover,
      body.pms106-ui .pms106-wheel button.active,
      body.pms108-bottom-menu .pms106-wheel button:hover,
      body.pms108-bottom-menu .pms106-wheel button.active{background:var(--theme-secondary)!important;color:#fff!important}
      body .topbar{border-bottom:3px solid var(--theme-secondary)!important;box-shadow:0 10px 22px var(--theme-shadow)!important}
      body .topbar h1,body #page-title,body .section-header h3{color:var(--theme-primary)!important}
      body .primary-button,body button.primary-button,body input[type="submit"].primary-button{background:var(--theme-primary)!important;border-color:var(--theme-primary)!important;color:#fff!important}
      body .primary-button:hover{background:var(--theme-primary-dark)!important}
      body .secondary-button,body .import-label,body .inline-button{background:var(--theme-primary-soft)!important;color:var(--theme-primary)!important;border-color:var(--theme-primary-mid)!important}
      body .secondary-button:hover,body .inline-button:hover{background:var(--theme-primary-mid)!important}
      body .folder-tab.active,body .pms128-tab.active{background:var(--theme-primary)!important;border-color:var(--theme-primary)!important;color:#fff!important}
      body .folder-tab,body .pms128-tab{background:var(--theme-primary-soft)!important;color:var(--theme-primary)!important;border-color:var(--theme-primary-mid)!important}
      body .card,body .pms84-panel,body .pms85-panel,body .pms95-card,body .pms128-panel,body .pms129-panel{border-color:var(--theme-primary-mid)!important;box-shadow:0 8px 22px var(--theme-shadow)!important}
      body .kpi-value,body .pms95-kpi,body .pms85-kpi strong,body .pms129-panel h4{color:var(--theme-primary)!important}
      body th,body .pms128-table th,body .pms129-table th{background:var(--theme-primary-soft)!important;color:var(--theme-primary-dark)!important}
      body .badge.primary,body .pms128-badge{background:var(--theme-secondary-soft)!important;color:var(--theme-secondary)!important;border-color:var(--theme-secondary-mid)!important}
      body .pms95-hero,body .pms105-hero,body .pms127-hero,body .pms128-hero,body .pms129-hero,body .pms89-ai-head{background:linear-gradient(135deg,var(--theme-primary),var(--theme-secondary))!important;color:#fff!important;border-color:var(--theme-primary)!important}
      body .pms95-hero h3,body .pms95-hero p,body .pms105-hero h3,body .pms105-hero p,body .pms127-hero h3,body .pms127-hero p,body .pms128-hero h3,body .pms128-hero p,body .pms128-hero small,body .pms129-hero h3,body .pms129-hero p,body .pms129-hero small{color:#fff!important}
      body .pms95-bar span,body .pms89-ai-generate{background:var(--theme-secondary)!important}
      body a:not(.nav-button){color:var(--theme-primary)!important}
      body input:focus,body select:focus,body textarea:focus{border-color:var(--theme-secondary)!important;box-shadow:0 0 0 3px var(--theme-secondary-soft)!important;outline:none!important}
      body .print-header h1{color:var(--theme-primary)!important}
      body .print-table th{background:var(--theme-primary)!important;color:#fff!important}
      #content .pms129-page{display:flex;flex-direction:column;gap:14px;color:#172033}
      #content .pms129-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start;background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:16px}
      #content .pms129-hero h3{margin:2px 0 6px;color:#0f172a;font-size:22px;letter-spacing:0}
      #content .pms129-hero p{margin:0;color:#475569;line-height:1.45}
      #content .pms129-actions{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
      #content .pms129-actions button{width:auto!important;margin:0!important}
      #content .pms129-grid{display:grid;grid-template-columns:repeat(2,minmax(310px,1fr));gap:12px;align-items:start}
      #content .pms129-panel{background:#fff;border:1px solid #d7dee8;border-radius:8px;padding:14px;overflow:hidden}
      #content .pms129-panel h4{margin:0 0 10px;color:#0f172a}
      #content .pms129-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      #content .pms129-form label{display:flex;flex-direction:column;gap:5px;min-width:0;color:#334155;font-size:12px;font-weight:800}
      #content .pms129-form input,#content .pms129-form select,#content .pms129-form textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:7px;padding:8px;font:inherit;font-size:13px;background:#fff;color:#0f172a}
      #content .pms129-form textarea{min-height:74px;resize:vertical}
      #content .pms129-span{grid-column:1/-1}
      #content .pms129-table{overflow:auto;border:1px solid #d7dee8;border-radius:8px;background:#fff}
      #content .pms129-table table{min-width:960px;width:100%;border-collapse:collapse;margin:0}
      #content .pms129-table th{background:#eef2f7;color:#1e293b;text-align:left;font-size:12px}
      #content .pms129-table th,#content .pms129-table td{padding:9px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top;white-space:nowrap}
      #content .pms129-note{max-width:280px;white-space:normal;line-height:1.35}
      #content .pms129-danger{border-color:#fecaca!important;background:#fef2f2!important;color:#991b1b!important}
      #content .pms129-color-panel{margin-top:14px}
      #content .pms129-swatches{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:10px 0}
      #content .pms129-swatch{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:9px;display:grid;grid-template-columns:42px minmax(0,1fr);gap:8px;align-items:center;cursor:pointer;text-align:left}
      #content .pms129-swatch-bars{display:flex;height:34px;border-radius:6px;overflow:hidden;border:1px solid #e2e8f0}
      #content .pms129-swatch-bars span{flex:1}
      #content .pms129-swatch strong{font-size:12px;color:#0f172a;display:block}
      #content .pms129-swatch small{margin:2px 0 0;color:#64748b;font-size:11px}
      @media(max-width:1050px){#content .pms129-hero,#content .pms129-grid{grid-template-columns:1fr}}
      @media(max-width:850px){#content .pms129-form{grid-template-columns:1fr 1fr}}
      @media(max-width:640px){#content .pms129-form{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function printHtml(title, code, rows, footer){
    const head = typeof companyPrintHeader === "function" ? companyPrintHeader(title, code, "Database trasporti") : '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(state.settings?.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong></div><div class="print-meta"><strong>' + esc(code) + '</strong><br>' + esc(today()) + '</div></div>';
    return '<div class="print-document">' + head + rows + '<div class="print-footer">' + esc(footer || "Parmitalia Management System") + '</div></div>';
  }
  function printItem(item,type){
    const isDone = type === "done";
    const title = isDone ? "SCHEDA TRASPORTO ESEGUITO" : "SCHEDA PREZZO TRASPORTO";
    const rows = isDone
      ? '<table class="print-table"><tr><th>Vettore</th><td>' + esc(item.carrier || "-") + '</td><th>Nome</th><td>' + esc(item.name || "-") + '</td></tr><tr><th>Tratta</th><td>' + esc(item.route || "-") + '</td><th>Prezzo</th><td>' + esc(money(item.price,item.currency)) + '</td></tr><tr><th>Data</th><td>' + esc(item.date || "-") + '</td><th>Merce</th><td>' + esc(item.goods || "-") + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(item.notes || "-") + '</td></tr></table>'
      : '<table class="print-table"><tr><th>Rotta</th><td>' + esc(item.route || "-") + '</td><th>Modalita</th><td>' + esc(item.mode || "-") + '</td></tr><tr><th>Prezzo</th><td>' + esc(money(item.price,item.currency)) + '</td><th>Unita</th><td>' + esc(item.unit || "-") + '</td></tr><tr><th>Data</th><td>' + esc(item.date || "-") + '</td><th>Fonte</th><td>' + esc(item.source || "-") + '</td></tr><tr><th>Note</th><td colspan="3">' + esc(item.notes || "-") + '</td></tr></table>';
    openPrint(printHtml(title, item.id || "TRP", rows, "Scheda trasporto " + (item.id || "")));
  }
  function printReport(type){
    const list = type === "done" ? arr(state.transportCompleted) : arr(state.transportPrices);
    const title = type === "done" ? "STORICO TRASPORTI ESEGUITI" : "DATABASE PREZZI TRASPORTO";
    const rows = list.map(x => type === "done"
      ? '<tr><td>' + esc(x.id) + '</td><td>' + esc(x.date) + '</td><td>' + esc(x.carrier) + '</td><td>' + esc(x.name) + '</td><td>' + esc(x.route) + '</td><td>' + esc(money(x.price,x.currency)) + '</td></tr>'
      : '<tr><td>' + esc(x.id) + '</td><td>' + esc(x.date) + '</td><td>' + esc(x.route) + '</td><td>' + esc(x.mode) + '</td><td>' + esc(money(x.price,x.currency)) + '</td><td>' + esc(x.source) + '</td></tr>'
    ).join("");
    const table = type === "done"
      ? '<table class="print-table"><thead><tr><th>ID</th><th>Data</th><th>Vettore</th><th>Nome</th><th>Tratta</th><th>Prezzo</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun trasporto.</td></tr>') + '</tbody></table>'
      : '<table class="print-table"><thead><tr><th>ID</th><th>Data</th><th>Rotta</th><th>Modo</th><th>Prezzo</th><th>Fonte</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun prezzo.</td></tr>') + '</tbody></table>';
    openPrint(printHtml(title, "TRP-" + today(), table, "Report trasporti"));
  }

  function renderTransport(){
    ensure(); css();
    const priceRows = arr(state.transportPrices).map(r => '<tr><td>' + esc(r.id || "") + '</td><td><strong>' + esc(r.route || "-") + '</strong><br><small>' + esc(r.source || "") + '</small></td><td>' + esc(r.mode || "-") + '</td><td>' + money(r.price,r.currency || "EUR") + '</td><td>' + esc(r.unit || "-") + '</td><td>' + esc(r.date || "-") + '</td><td class="pms129-note">' + esc(r.notes || "") + '</td><td><div class="pms129-actions"><button class="inline-button" data-pms129-print-price="' + esc(r.id) + '">Stampa</button><button class="inline-button" data-pms129-edit-price="' + esc(r.id) + '">Modifica</button><button class="inline-button pms129-danger" data-pms129-delete-price="' + esc(r.id) + '">Elimina</button></div></td></tr>').join("");
    const doneRows = arr(state.transportCompleted).map(r => '<tr><td>' + esc(r.id || "") + '</td><td>' + esc(r.date || "-") + '</td><td><strong>' + esc(r.carrier || "-") + '</strong></td><td>' + esc(r.name || "-") + '</td><td>' + esc(r.route || "-") + '</td><td>' + money(r.price,r.currency || "EUR") + '</td><td class="pms129-note">' + esc((r.goods ? "Merce: " + r.goods + ". " : "") + (r.notes || "")) + '</td><td><div class="pms129-actions"><button class="inline-button" data-pms129-print-done="' + esc(r.id) + '">Stampa</button><button class="inline-button" data-pms129-edit-done="' + esc(r.id) + '">Modifica</button><button class="inline-button pms129-danger" data-pms129-delete-done="' + esc(r.id) + '">Elimina</button></div></td></tr>').join("");
    return '<div class="pms129-page"><div class="pms129-hero"><div><small>Logistica</small><h3>Database trasporti</h3><p>Prezzi trasporto, rotte e storico dei trasporti realmente eseguiti. Ogni riga puo essere stampata, modificata o eliminata.</p></div><div class="pms129-actions"><button class="primary-button" data-pms129-save-price>Salva prezzo</button><button class="secondary-button" data-pms129-save-done>Salva trasporto fatto</button><button class="secondary-button" data-pms129-print-price-report>Stampa prezzi</button><button class="secondary-button" data-pms129-print-done-report>Stampa storico</button></div></div><div class="pms129-grid"><div class="pms129-panel" id="pms129-price-panel"><h4>Prezzo / rotta trasporto</h4><input id="pms129-price-edit" type="hidden"><div class="pms129-form"><label class="pms129-span">Rotta<input id="pms129-price-route" placeholder="Italia -> Bucarest"></label><label>Modalita<select id="pms129-price-mode"><option>Strada</option><option>Mare</option><option>Aereo</option><option>Intermodale</option></select></label><label>Prezzo<input id="pms129-price-price" type="number" step="0.01"></label><label>Valuta<select id="pms129-price-currency"><option>EUR</option><option>RON</option><option>USD</option><option>GBP</option></select></label><label>Unita<input id="pms129-price-unit" placeholder="viaggio, camion, pallet"></label><label>Data<input id="pms129-price-date" type="date" value="' + esc(today()) + '"></label><label>Fonte / vettore<input id="pms129-price-source"></label><label class="pms129-span">Note<textarea id="pms129-price-notes"></textarea></label><div class="pms129-actions pms129-span"><button class="primary-button" data-pms129-save-price>Salva prezzo</button><button class="secondary-button" data-pms129-clear-price>Pulisci</button></div></div></div><div class="pms129-panel" id="pms129-done-panel"><h4>Trasporto fatto / eseguito</h4><input id="pms129-done-edit" type="hidden"><div class="pms129-form"><label>Vettore<input id="pms129-done-carrier" placeholder="Nome societa vettore"></label><label>Nome<input id="pms129-done-name" placeholder="Autista, referente o trasporto"></label><label class="pms129-span">Tratta<input id="pms129-done-route" placeholder="Origine -> destinazione"></label><label>Prezzo<input id="pms129-done-price" type="number" step="0.01"></label><label>Valuta<select id="pms129-done-currency"><option>EUR</option><option>RON</option><option>USD</option><option>GBP</option></select></label><label>Data<input id="pms129-done-date" type="date" value="' + esc(today()) + '"></label><label>Merce<input id="pms129-done-goods"></label><label class="pms129-span">Note<textarea id="pms129-done-notes"></textarea></label><div class="pms129-actions pms129-span"><button class="primary-button" data-pms129-save-done>Salva trasporto fatto</button><button class="secondary-button" data-pms129-clear-done>Pulisci</button></div></div></div></div><div class="section-header"><h3>Database prezzi trasporto</h3></div><div class="pms129-table"><table><thead><tr><th>ID</th><th>Rotta</th><th>Modo</th><th>Prezzo</th><th>Unita</th><th>Data</th><th>Note</th><th>Azioni</th></tr></thead><tbody>' + (priceRows || '<tr><td colspan="8" class="empty">Nessun prezzo trasporto registrato.</td></tr>') + '</tbody></table></div><div class="section-header"><h3>Storico trasporti fatti / eseguiti</h3></div><div class="pms129-table"><table><thead><tr><th>ID</th><th>Data</th><th>Vettore</th><th>Nome</th><th>Tratta</th><th>Prezzo</th><th>Note</th><th>Azioni</th></tr></thead><tbody>' + (doneRows || '<tr><td colspan="8" class="empty">Nessun trasporto eseguito registrato.</td></tr>') + '</tbody></table></div></div>';
  }

  function clearPrice(){ ["edit","route","price","unit","source","notes"].forEach(k => setField("pms129-price-" + k,"")); setField("pms129-price-mode","Strada"); setField("pms129-price-currency","EUR"); setField("pms129-price-date",today()); }
  function clearDone(){ ["edit","carrier","name","route","price","goods","notes"].forEach(k => setField("pms129-done-" + k,"")); setField("pms129-done-currency","EUR"); setField("pms129-done-date",today()); }
  function savePrice(){
    ensure();
    const id = field("pms129-price-edit");
    const old = id ? state.transportPrices.find(x => x.id === id) : null;
    const rec = Object.assign({}, old || {}, {id:id || next("TRP",state.transportPrices), route:field("pms129-price-route"), mode:field("pms129-price-mode"), price:field("pms129-price-price"), currency:field("pms129-price-currency") || "EUR", unit:field("pms129-price-unit"), date:field("pms129-price-date") || today(), source:field("pms129-price-source"), notes:field("pms129-price-notes")});
    state.transportPrices = old ? state.transportPrices.map(x => x.id === id ? rec : x) : [rec].concat(state.transportPrices);
    saveState(); render();
  }
  function saveDone(){
    ensure();
    const id = field("pms129-done-edit");
    const old = id ? state.transportCompleted.find(x => x.id === id) : null;
    const rec = Object.assign({}, old || {}, {id:id || next("TRF",state.transportCompleted), carrier:field("pms129-done-carrier"), name:field("pms129-done-name"), route:field("pms129-done-route"), price:field("pms129-done-price"), currency:field("pms129-done-currency") || "EUR", date:field("pms129-done-date") || today(), goods:field("pms129-done-goods"), notes:field("pms129-done-notes")});
    state.transportCompleted = old ? state.transportCompleted.map(x => x.id === id ? rec : x) : [rec].concat(state.transportCompleted);
    state.transportHistory = state.transportCompleted;
    saveState(); render();
  }
  function editPrice(id){ const r = state.transportPrices.find(x => x.id === id); if (!r) return; setField("pms129-price-edit",r.id); setField("pms129-price-route",r.route); setField("pms129-price-mode",r.mode || "Strada"); setField("pms129-price-price",r.price); setField("pms129-price-currency",r.currency || "EUR"); setField("pms129-price-unit",r.unit); setField("pms129-price-date",r.date || today()); setField("pms129-price-source",r.source); setField("pms129-price-notes",r.notes); document.getElementById("pms129-price-panel")?.scrollIntoView({behavior:"smooth",block:"start"}); }
  function editDone(id){ const r = state.transportCompleted.find(x => x.id === id); if (!r) return; setField("pms129-done-edit",r.id); setField("pms129-done-carrier",r.carrier); setField("pms129-done-name",r.name); setField("pms129-done-route",r.route); setField("pms129-done-price",r.price); setField("pms129-done-currency",r.currency || "EUR"); setField("pms129-done-date",r.date || today()); setField("pms129-done-goods",r.goods); setField("pms129-done-notes",r.notes); document.getElementById("pms129-done-panel")?.scrollIntoView({behavior:"smooth",block:"start"}); }
  function removePrice(id){ const r = state.transportPrices.find(x => x.id === id); if (!r || !confirm("Eliminare il prezzo trasporto " + id + "?")) return; state.transportPrices = state.transportPrices.filter(x => x.id !== id); saveState(); render(); }
  function removeDone(id){ const r = state.transportCompleted.find(x => x.id === id); if (!r || !confirm("Eliminare il trasporto eseguito " + id + "?")) return; state.transportCompleted = state.transportCompleted.filter(x => x.id !== id); state.transportHistory = state.transportCompleted; saveState(); render(); }

  function colorPanel(){
    ensure();
    const swatches = PRESETS.map(p => '<button type="button" class="pms129-swatch" data-pms129-preset="' + esc(p.name) + '"><span class="pms129-swatch-bars"><span style="background:' + esc(p.primary) + '"></span><span style="background:' + esc(p.secondary) + '"></span></span><span><strong>' + esc(p.name) + '</strong><small>' + esc(p.primary) + ' / ' + esc(p.secondary) + '</small></span></button>').join("");
    return '<div class="card pms129-color-panel"><h3>Colori gestionale</h3><p class="database-note">Scegli una palette pronta o imposta manualmente i colori principali del gestionale.</p><div class="pms129-swatches">' + swatches + '</div><div class="settings-grid"><div><label>Palette selezionata</label><input name="pms129ThemeName" id="pms129-theme-name" value="' + esc(state.settings.pms129ThemeName || "Blu Parmitalia") + '"></div><div><label>Colore principale</label><input name="pms129Primary" id="pms129-primary" type="color" value="' + esc(state.settings.pms129Primary || "#1f4e78") + '"></div><div><label>Colore secondario</label><input name="pms129Secondary" id="pms129-secondary" type="color" value="' + esc(state.settings.pms129Secondary || "#0f766e") + '"></div></div></div>';
  }
  function enhanceSettings(html){
    if (!html || html.includes("pms129-color-panel")) return html;
    return html.replace('<div class="section-header"><h3>Utenti e password locali/demo</h3>', colorPanel() + '<div class="section-header"><h3>Utenti e password locali/demo</h3>');
  }
  function bindColors(){
    document.querySelectorAll("[data-pms129-preset]").forEach(btn => btn.onclick = () => {
      const preset = PRESETS.find(p => p.name === btn.getAttribute("data-pms129-preset"));
      if (!preset) return;
      setField("pms129-theme-name", preset.name);
      setField("pms129-primary", preset.primary);
      setField("pms129-secondary", preset.secondary);
      state.settings.pms129ThemeName = preset.name;
      state.settings.pms129Primary = preset.primary;
      state.settings.pms129Secondary = preset.secondary;
      applyTheme(); saveState();
    });
    ["pms129-primary","pms129-secondary"].forEach(id => { const el = document.getElementById(id); if (el) el.oninput = () => { state.settings.pms129Primary = field("pms129-primary") || state.settings.pms129Primary; state.settings.pms129Secondary = field("pms129-secondary") || state.settings.pms129Secondary; state.settings.pms129ThemeName = field("pms129-theme-name") || "Personalizzato"; applyTheme(); }; });
  }
  function bind(){
    css(); applyTheme();
    document.querySelectorAll("[data-pms129-save-price]").forEach(b => b.onclick = savePrice);
    document.querySelectorAll("[data-pms129-save-done]").forEach(b => b.onclick = saveDone);
    document.querySelectorAll("[data-pms129-clear-price]").forEach(b => b.onclick = clearPrice);
    document.querySelectorAll("[data-pms129-clear-done]").forEach(b => b.onclick = clearDone);
    document.querySelectorAll("[data-pms129-edit-price]").forEach(b => b.onclick = () => editPrice(b.getAttribute("data-pms129-edit-price")));
    document.querySelectorAll("[data-pms129-edit-done]").forEach(b => b.onclick = () => editDone(b.getAttribute("data-pms129-edit-done")));
    document.querySelectorAll("[data-pms129-delete-price]").forEach(b => b.onclick = () => removePrice(b.getAttribute("data-pms129-delete-price")));
    document.querySelectorAll("[data-pms129-delete-done]").forEach(b => b.onclick = () => removeDone(b.getAttribute("data-pms129-delete-done")));
    document.querySelectorAll("[data-pms129-print-price]").forEach(b => b.onclick = () => { const r = state.transportPrices.find(x => x.id === b.getAttribute("data-pms129-print-price")); if (r) printItem(r,"price"); });
    document.querySelectorAll("[data-pms129-print-done]").forEach(b => b.onclick = () => { const r = state.transportCompleted.find(x => x.id === b.getAttribute("data-pms129-print-done")); if (r) printItem(r,"done"); });
    document.querySelectorAll("[data-pms129-print-price-report]").forEach(b => b.onclick = () => printReport("price"));
    document.querySelectorAll("[data-pms129-print-done-report]").forEach(b => b.onclick = () => printReport("done"));
    bindColors();
  }

  const baseRenderSettings = typeof renderSettings === "function" ? renderSettings : null;
  if (baseRenderSettings && !baseRenderSettings.__pms129Wrapped) {
    renderSettings = function(){ ensure(); return enhanceSettings(baseRenderSettings.apply(this, arguments)); };
    renderSettings.__pms129Wrapped = true;
  }
  const baseSaveSettings = typeof saveSettings === "function" ? saveSettings : null;
  if (baseSaveSettings && !baseSaveSettings.__pms129Wrapped) {
    saveSettings = function(){ const out = baseSaveSettings.apply(this, arguments); ensure(); applyTheme(); return out; };
    saveSettings.__pms129Wrapped = true;
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms129Wrapped) {
    render = function(){
      ensure(); css(); applyTheme();
      const content = document.getElementById("content");
      if (content && current && current.page === MODULE) {
        const title = document.getElementById("page-title"), subtitle = document.getElementById("page-subtitle");
        if (title) title.textContent = "Trasporti";
        if (subtitle) subtitle.textContent = "Database prezzi, storico trasporti eseguiti, stampe e modifiche";
        content.innerHTML = renderTransport();
        bind();
        return;
      }
      const result = baseRender.apply(this, arguments);
      if (content && current && current.page === "settings") {
        content.innerHTML = enhanceSettings(content.innerHTML);
      }
      setTimeout(bind, 30);
      return result;
    };
    render.__pms129Wrapped = true;
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms129Wrapped) {
    bindPageActions = function(){ const out = baseBind.apply(this, arguments); bind(); setTimeout(bind,30); return out; };
    bindPageActions.__pms129Wrapped = true;
  }
  ensure(); css(); applyTheme(); setTimeout(bind, 80);
  window.pmsV129TransportHistoryColors = {version:VERSION};
})();
