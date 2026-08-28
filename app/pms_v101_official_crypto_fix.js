(function(){
  "use strict";
  const VERSION = "PMS-V101-OFFICIAL-CRYPTO-FIX";
  const OFFICIAL = "officialCommunications";
  const CRYPTO = "cryptoMonitor";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function next(prefix,list,field){
    const y = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + y + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String((field && x[field]) || x.protocol || x.id || "").match(re);
      return m ? Math.max(a, Number(m[1])) : a;
    },0);
    return prefix + "-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code);
    if (typeof renderQrLite === "function") return renderQrLite(code);
    return '<strong>' + esc(code) + '</strong>';
  }
  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.officialCommunications = arr(state.officialCommunications);
    state.cryptoMonitor = arr(state.cryptoMonitor);
    state.cryptoStrategies = arr(state.cryptoStrategies);
    state.cryptoTradeTickets = arr(state.cryptoTradeTickets);
    if (typeof modules !== "undefined") {
      const official = modules.find(m => m.id === OFFICIAL);
      if (official) {
        official.label = "Comunicazioni ufficiali";
        official.subtitle = "Protocollo, carta intestata e scrittura libera";
        official.roles = Array.from(new Set(arr(official.roles).concat(["admin","assistant","accountant"])));
      }
      const crypto = modules.find(m => m.id === CRYPTO);
      if (crypto) {
        crypto.label = "AI trading strategy";
        crypto.subtitle = "Strategie automatiche, ticket operativi e approvazione manuale";
      }
    }
  }
  function css(){
    if (document.getElementById("pms-v101-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v101-style";
    s.textContent = ".pms101-page{display:grid;gap:14px}.pms101-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}.pms101-hero h3{margin:2px 0 6px;color:#fff}.pms101-hero p{margin:0;color:#dbeafe}.pms101-actions{display:flex;gap:8px;flex-wrap:wrap}.pms101-actions button{width:auto!important;margin:0!important}.pms101-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pms101-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.pms101-form .full{grid-column:1/-1}.pms101-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms101-form textarea{min-height:220px;line-height:1.55}.pms101-muted{color:var(--muted);font-size:12px;line-height:1.45}.pms101-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.pms101-kpi{border:1px solid var(--line);border-radius:8px;background:#f8fafc;padding:12px}.pms101-kpi span{display:block;color:var(--muted);font-size:11px;font-weight:900;text-transform:uppercase}.pms101-kpi strong{display:block;font-size:22px;margin-top:6px;color:#0f2f4a}.pms101-pill{display:inline-flex;align-items:center;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:900;border:1px solid #cbd5e1;background:#f8fafc}.pms101-buy{color:#166534;background:#dcfce7;border-color:#86efac}.pms101-hold{color:#854d0e;background:#fef3c7;border-color:#fde68a}.pms101-sell{color:#991b1b;background:#fee2e2;border-color:#fecaca}.pms101-risk{border-left:4px solid #0f2f4a;background:#eff6ff;color:#172554;padding:10px 12px;border-radius:6px}.pms101-letter{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.55;white-space:pre-wrap}@media(max-width:850px){.pms101-hero{display:grid}.pms101-form{grid-template-columns:1fr}}@media print{@page{size:A4;margin:10mm}#print-root .pms101-print{min-height:0!important;height:auto!important;font-size:10pt!important;line-height:1.32!important;break-after:avoid!important;page-break-after:avoid!important}.pms101-no-print{display:none!important}}";
    document.head.appendChild(s);
  }
  function printHeader(title,code,sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    const s = state.settings || {};
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(s.address || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }

  function renderOfficial(){
    ensure(); css();
    const rows = state.officialCommunications.map(d => '<tr><td><span class="code-block">' + esc(d.protocol || d.id) + '</span></td><td><strong>' + esc(d.subject || "-") + '</strong><br><small>' + esc(d.recipient || "-") + '</small></td><td>' + esc(d.date || "") + '</td><td>' + esc(d.language || "IT") + '</td><td><button class="inline-button" data-pms101-official-print="' + esc(d.id || d.protocol) + '">Stampa</button><button class="inline-button" data-pms101-official-edit="' + esc(d.id || d.protocol) + '">Modifica</button><button class="inline-danger" data-pms101-official-delete="' + esc(d.id || d.protocol) + '">Elimina</button></td></tr>').join("");
    return '<div class="pms101-page"><section class="pms101-hero"><div><span>CU</span><h3>Comunicazioni ufficiali</h3><p>Protocollo ufficiale, carta intestata Parmitalia, testo libero e barcode.</p></div><div class="pms101-actions"><button class="primary-button" data-pms101-official-new>+ Nuova comunicazione</button></div></section><div class="pms101-card"><div class="pms101-form"><label>Protocollo<input id="pms101-official-protocol" value="' + esc(next("CU",state.officialCommunications)) + '" readonly></label><label>Data<input id="pms101-official-date" type="date" value="' + esc(today()) + '"></label><label>Lingua<select id="pms101-official-language"><option>IT</option><option>EN</option><option>RO</option><option>AR</option></select></label><label class="full">Destinatario<input id="pms101-official-recipient"></label><label class="full">Oggetto<input id="pms101-official-subject"></label><label class="full">Testo libero<textarea id="pms101-official-body"></textarea></label><label class="full">Chiusura / firma<textarea id="pms101-official-closing" style="min-height:80px">Cordiali saluti,</textarea></label><div class="full pms101-actions"><button class="primary-button" data-pms101-official-save>Salva</button><button class="secondary-button" data-pms101-official-preview>Anteprima stampa</button></div></div></div><div class="pms101-card"><div class="table-wrap"><table><thead><tr><th>Protocollo</th><th>Oggetto</th><th>Data</th><th>Lingua</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Nessuna comunicazione registrata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function readOfficial(existing){
    return {
      id: existing?.id || document.getElementById("pms101-official-protocol")?.value || next("CU",state.officialCommunications),
      protocol: document.getElementById("pms101-official-protocol")?.value || existing?.protocol || next("CU",state.officialCommunications),
      date: document.getElementById("pms101-official-date")?.value || today(),
      language: document.getElementById("pms101-official-language")?.value || "IT",
      recipient: document.getElementById("pms101-official-recipient")?.value || "",
      subject: document.getElementById("pms101-official-subject")?.value || "",
      body: document.getElementById("pms101-official-body")?.value || "",
      closing: document.getElementById("pms101-official-closing")?.value || "",
      status: existing?.status || "Registrata",
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  function officialPrintHtml(doc){
    const code = doc.protocol || doc.id;
    return '<div class="print-document pms101-print">' + printHeader("Comunicazione ufficiale",code,"Carta intestata Parmitalia") + '<table class="print-table"><tr><th>Destinatario</th><td>' + esc(doc.recipient || "-") + '</td><th>Data</th><td>' + esc(doc.date || today()) + '</td></tr><tr><th>Oggetto</th><td colspan="3">' + esc(doc.subject || "-") + '</td></tr></table><div class="pms101-letter">' + esc(doc.body || "-") + '</div><div style="margin-top:12mm;white-space:pre-wrap">' + esc(doc.closing || "") + '</div><div style="margin-top:7mm">' + barcode(code) + '</div><div class="print-footer">Protocollo ' + esc(code) + '</div></div>';
  }
  function saveOfficial(previewOnly){
    const doc = readOfficial();
    if (!doc.subject && !doc.body) return alert("Inserisci oggetto o testo.");
    if (!previewOnly) {
      const idx = state.officialCommunications.findIndex(x => x.id === doc.id || x.protocol === doc.protocol);
      if (idx >= 0) state.officialCommunications[idx] = doc;
      else state.officialCommunications.unshift(doc);
      saveState();
    }
    openPrint(officialPrintHtml(doc));
    if (!previewOnly && typeof render === "function") render();
  }
  function loadOfficial(id){
    const doc = state.officialCommunications.find(x => x.id === id || x.protocol === id);
    if (!doc) return;
    ["protocol","date","language","recipient","subject","body","closing"].forEach(k => {
      const el = document.getElementById("pms101-official-" + k);
      if (el) el.value = doc[k] || "";
    });
  }
  function deleteOfficial(id){
    if (!confirm("Eliminare la comunicazione ufficiale?")) return;
    state.officialCommunications = state.officialCommunications.filter(x => x.id !== id && x.protocol !== id);
    saveState(); render();
  }
  function printOfficial(id){
    const doc = state.officialCommunications.find(x => x.id === id || x.protocol === id);
    if (doc) openPrint(officialPrintHtml(doc));
  }

  const market = [
    {symbol:"BTC",name:"Bitcoin",type:"crypto",vol:82,momentum:74,liquidity:96,risk:70},
    {symbol:"ETH",name:"Ethereum",type:"crypto",vol:76,momentum:68,liquidity:94,risk:66},
    {symbol:"SOL",name:"Solana",type:"crypto",vol:91,momentum:81,liquidity:82,risk:82},
    {symbol:"BNB",name:"BNB",type:"crypto",vol:58,momentum:55,liquidity:79,risk:58},
    {symbol:"MSTR",name:"MicroStrategy",type:"equity",vol:88,momentum:72,liquidity:80,risk:86},
    {symbol:"COIN",name:"Coinbase",type:"equity",vol:84,momentum:70,liquidity:83,risk:78},
    {symbol:"GLD",name:"Gold ETF",type:"etf",vol:22,momentum:44,liquidity:90,risk:25},
    {symbol:"TLT",name:"US Bonds ETF",type:"etf",vol:28,momentum:37,liquidity:88,risk:32}
  ];
  function strategyScore(a,risk,horizon){
    const r = risk === "alta" ? 1.25 : risk === "media" ? 1 : .72;
    const h = horizon === "breve" ? 1.15 : horizon === "medio" ? 1 : .84;
    return Math.round((a.momentum * .42 + a.liquidity * .24 + a.vol * .18 + (100 - a.risk) * .16) * r * h);
  }
  function buildPlan(){
    const capital = num(document.getElementById("pms101-crypto-capital")?.value);
    const target = num(document.getElementById("pms101-crypto-target")?.value);
    const risk = document.getElementById("pms101-crypto-risk")?.value || "media";
    const horizon = document.getElementById("pms101-crypto-horizon")?.value || "medio";
    if (!capital || !target) return alert("Inserisci capitale e obiettivo.");
    const targetPct = target / capital * 100;
    const maxDrawdown = risk === "alta" ? 22 : risk === "media" ? 12 : 6;
    const ranked = market.map(a => Object.assign({},a,{score:strategyScore(a,risk,horizon)})).sort((a,b)=>b.score-a.score);
    const selected = ranked.slice(0, risk === "bassa" ? 4 : 5);
    const totalScore = selected.reduce((a,x)=>a+x.score,0) || 1;
    const id = next("STR",state.cryptoStrategies);
    const tickets = selected.map(a => {
      const weight = a.score / totalScore;
      const amount = Math.round(capital * weight);
      const action = a.score > 80 && targetPct <= 35 ? "BUY" : a.score > 62 ? "WATCH" : "HOLD";
      return {id:next("TCK",state.cryptoTradeTickets),strategyId:id,date:new Date().toISOString(),symbol:a.symbol,name:a.name,type:a.type,action,amount,weight:Math.round(weight*100),status:"Da approvare",score:a.score,risk:a.risk};
    });
    const strategy = {id,date:new Date().toISOString(),capital,target,targetPct:targetPct.toFixed(2),risk,horizon,maxDrawdown,status:"Generata",tickets:tickets.map(t=>t.id)};
    state.cryptoStrategies.unshift(strategy);
    state.cryptoTradeTickets = tickets.concat(state.cryptoTradeTickets);
    saveState(); render();
  }
  function approveTicket(id){
    const t = state.cryptoTradeTickets.find(x => x.id === id);
    if (!t) return;
    t.status = "Approvato manualmente";
    t.approvedAt = new Date().toISOString();
    state.cryptoMonitor.unshift({id:next("CRY",state.cryptoMonitor),asset:t.symbol,qty:"",price:t.amount,note:"Ticket approvato manualmente da strategia " + t.strategyId,date:new Date().toISOString()});
    saveState(); render();
  }
  function renderCrypto(){
    ensure(); css();
    const latest = state.cryptoStrategies[0] || {};
    const tickets = state.cryptoTradeTickets.map(t => '<tr><td><span class="code-block">' + esc(t.id) + '</span></td><td><strong>' + esc(t.symbol) + '</strong><br><small>' + esc(t.name) + '</small></td><td><span class="pms101-pill ' + (t.action === "BUY" ? "pms101-buy" : t.action === "WATCH" ? "pms101-hold" : "pms101-sell") + '">' + esc(t.action) + '</span></td><td>' + money(t.amount,"EUR") + '</td><td>' + esc(t.weight) + '%</td><td>' + esc(t.score) + '</td><td>' + esc(t.status) + '</td><td><button class="inline-button" data-pms101-ticket-approve="' + esc(t.id) + '">Approva</button></td></tr>').join("");
    return '<div class="pms101-page"><section class="pms101-hero"><div><span>AI</span><h3>AI trading strategy</h3><p>Obiettivo, rischio, selezione titoli e ticket operativi da approvare.</p></div><div class="pms101-actions"><button class="primary-button" data-pms101-build-strategy>Genera strategia</button></div></section><div class="pms101-risk">Il modulo genera strategie e ticket. Ordine reale da approvare manualmente sul broker/wallet.</div><div class="pms101-card"><div class="pms101-form"><label>Capitale disponibile EUR<input id="pms101-crypto-capital" type="number" value="' + esc(latest.capital || 10000) + '"></label><label>Guadagno desiderato EUR<input id="pms101-crypto-target" type="number" value="' + esc(latest.target || 1000) + '"></label><label>Rischio<select id="pms101-crypto-risk"><option value="bassa">Bassa</option><option value="media" selected>Media</option><option value="alta">Alta</option></select></label><label>Orizzonte<select id="pms101-crypto-horizon"><option value="breve">Breve</option><option value="medio" selected>Medio</option><option value="lungo">Lungo</option></select></label><label>Mercati<select id="pms101-crypto-market"><option>Crypto + titoli collegati</option><option>Solo crypto liquide</option><option>Difensiva con ETF</option></select></label><label>Stop massimo %<input id="pms101-crypto-stop" type="number" value="' + esc(latest.maxDrawdown || 12) + '"></label></div></div><div class="pms101-kpis"><div class="pms101-kpi"><span>Strategia</span><strong>' + esc(latest.id || "-") + '</strong></div><div class="pms101-kpi"><span>Target</span><strong>' + esc(latest.targetPct || "0") + '%</strong></div><div class="pms101-kpi"><span>Ticket</span><strong>' + esc(state.cryptoTradeTickets.length) + '</strong></div></div><div class="pms101-card"><div class="table-wrap"><table><thead><tr><th>ID</th><th>Titolo</th><th>Azione</th><th>Importo</th><th>Peso</th><th>Score</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (tickets || '<tr><td colspan="8">Nessuna strategia generata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function bind(){
    ensure(); css();
    document.querySelector("[data-pms101-official-save]")?.addEventListener("click",() => saveOfficial(false));
    document.querySelector("[data-pms101-official-preview]")?.addEventListener("click",() => saveOfficial(true));
    document.querySelector("[data-pms101-official-new]")?.addEventListener("click",() => { if (typeof render === "function") render(); });
    document.querySelectorAll("[data-pms101-official-edit]").forEach(b => b.onclick = () => loadOfficial(b.dataset.pms101OfficialEdit));
    document.querySelectorAll("[data-pms101-official-print]").forEach(b => b.onclick = () => printOfficial(b.dataset.pms101OfficialPrint));
    document.querySelectorAll("[data-pms101-official-delete]").forEach(b => b.onclick = () => deleteOfficial(b.dataset.pms101OfficialDelete));
    document.querySelector("[data-pms101-build-strategy]")?.addEventListener("click",buildPlan);
    document.querySelectorAll("[data-pms101-ticket-approve]").forEach(b => b.onclick = () => approveTicket(b.dataset.pms101TicketApprove));
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms101RenderWrapped) {
    window.__pms101RenderWrapped = true;
    render = function(){
      ensure(); css();
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (content && window.current && current.page === OFFICIAL) {
        if (title) title.textContent = "Comunicazioni ufficiali";
        if (subtitle) subtitle.textContent = "Protocollo, carta intestata e scrittura libera";
        content.innerHTML = renderOfficial();
        bind();
        return;
      }
      if (content && window.current && current.page === CRYPTO) {
        if (title) title.textContent = "AI trading strategy";
        if (subtitle) subtitle.textContent = "Strategie automatiche e ticket da approvare";
        content.innerHTML = renderCrypto();
        bind();
        return;
      }
      const result = baseRender.apply(this,arguments);
      setTimeout(bind,40);
      return result;
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms101BindWrapped) {
    window.__pms101BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); return r; };
  }
  ensure(); css(); setTimeout(bind,80);
  window.pmsV101OfficialCryptoFix = {version:VERSION,buildPlan};
})();
