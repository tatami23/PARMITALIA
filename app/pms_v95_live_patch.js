(function(){
  "use strict";
  const VERSION = "PMS-V95-LIVE-PATCH";
  const TXT = {
    IT:{market:"Andamenti di mercato",refresh:"Aggiorna dati dai siti",charts:"Grafici",quotes:"Quotazioni",last:"Ultimo aggiornamento",print:"Stampa",route:"Calcola rotta intelligente",broker:"Brokeraggio commerciale",accountant:"Commercialista",legal:"Protocolli legali",crypto:"Crypto monitor",save:"Salva",origin:"Origine",destination:"Destinazione"},
    EN:{market:"Market trends",refresh:"Update data from sources",charts:"Charts",quotes:"Quotations",last:"Last update",print:"Print",route:"Calculate smart route",broker:"Commercial brokerage",accountant:"Accountant",legal:"Legal protocols",crypto:"Crypto monitor",save:"Save",origin:"Origin",destination:"Destination"},
    RO:{market:"Evolutii de piata",refresh:"Actualizeaza datele din surse",charts:"Grafice",quotes:"Cotatii",last:"Ultima actualizare",print:"Printare",route:"Calculeaza ruta inteligenta",broker:"Brokeraj comercial",accountant:"Contabil",legal:"Protocoale juridice",crypto:"Monitor crypto",save:"Salveaza",origin:"Origine",destination:"Destinatie"},
    AR:{market:"مؤشرات السوق",refresh:"تحديث البيانات من المصادر",charts:"الرسوم البيانية",quotes:"الأسعار",last:"آخر تحديث",print:"طباعة",route:"حساب المسار الذكي",broker:"الوساطة التجارية",accountant:"المحاسب",legal:"البروتوكولات القانونية",crypto:"مراقبة العملات الرقمية",save:"حفظ",origin:"نقطة الانطلاق",destination:"الوجهة"}
  };
  const marketSeeds = [
    {id:"MKT95-GRANA-16",group:"Dairy",name:"Grana Padano 16 mesi",product:"Grana Padano",market:"Milano",unit:"EUR/kg",source:"CLAL / CCIAA Milano Monza Brianza Lodi",sourceUrl:"https://www.clal.it/?section=grana",date:"2026-07-13",price:10.925,y2024:10.91,y2025:12.25,y2026:10.93,note:"13/07/2026 min 10,80 max 11,05; media 10,925."},
    {id:"MKT95-DURO-IT",group:"Cereals",name:"Frumento duro italiano - Fino",product:"Frumento duro italiano",market:"Milano/Italia",unit:"EUR/t",source:"ISMEA Mercati",sourceUrl:"https://www.ismeamercati.it/seminativi",date:"2026-07-12",price:269.50,y2024:288,y2025:302,y2026:269.50,note:"ISMEA 06/07/2026-12/07/2026, Milano."},
    {id:"MKT95-DURO-EST",group:"Cereals",name:"Frumento duro estero comunitario",product:"Frumento duro estero",market:"Milano arrivo",unit:"EUR/t",source:"ISMEA Prezzi per piazza",sourceUrl:"https://www.ismeamercati.it/flex/cm/pages/ServeBLOB.php/L/IT/IDPagina/439/ISUQC7/26/DT7/1782770400",date:"2026-06-30",price:280.50,y2024:301,y2025:294,y2026:280.50,note:"Franco magazzino - arrivo."},
    {id:"MKT95-DURO-CUN",group:"Cereals",name:"CUN grano duro Centro - Fino",product:"Grano duro CUN Centro",market:"Centro Italia",unit:"EUR/t",source:"CUN/BMTI",sourceUrl:"https://www.bmti.it/",date:"2026-07-06",price:259.50,y2024:276,y2025:288,y2026:259.50,note:"Range 257-262 EUR/t; media 259,50."}
  ];
  function lang(){ return String((window.state && state.settings && state.settings.defaultLanguage) || "IT").toUpperCase(); }
  function tr(k){ return (TXT[lang()] || TXT.IT)[k] || TXT.IT[k] || k; }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function today(){ const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e) { console.warn(e); return false; } }
  function nextCode(prefix, list, field){
    const y = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + y + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String((field && x[field]) || x.id || "").match(re);
      return m ? Math.max(a, Number(m[1])) : a;
    }, 0);
    return prefix + "-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function money(v, c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function header(title, code, sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title, code, sub || "");
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(state.settings && state.settings.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(sub || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + new Date().toLocaleDateString() + '</div></div>';
  }
  function barcode(code){ return typeof renderBarcode === "function" ? renderBarcode(code) : (typeof renderQrLite === "function" ? renderQrLite(code) : "<strong>" + esc(code) + "</strong>"); }
  function addModule(id,label,subtitle,roles){ if (typeof modules !== "undefined" && !modules.some(m => m.id === id)) modules.push({id,label,subtitle,roles}); }
  function css(){
    if (document.getElementById("pms-v95-live-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v95-live-style";
    s.textContent = ".pms95-page{display:grid;gap:14px}.pms95-hero{display:flex;justify-content:space-between;gap:16px;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}.pms95-hero h3{margin:2px 0 6px;color:#fff}.pms95-hero p{margin:0;color:#dbeafe}.pms95-actions{display:flex;gap:8px;flex-wrap:wrap}.pms95-actions button{width:auto!important;margin:0!important}.pms95-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.pms95-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:13px}.pms95-kpi{font-size:28px;font-weight:900;color:var(--primary)}.pms95-muted{color:var(--muted);font-size:12px;line-height:1.45}.pms95-chart-row{display:grid;grid-template-columns:180px 1fr 96px;gap:9px;align-items:center;margin:8px 0}.pms95-bar{height:14px;border-radius:999px;background:#dbeafe;overflow:hidden}.pms95-bar span{display:block;height:100%;background:#0f766e}.pms95-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.pms95-form .full{grid-column:1/-1}.pms95-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms95-textarea{width:100%;min-height:150px}.pms95-langbar{display:flex;justify-content:flex-end;margin-bottom:8px}.pms95-langbar select{width:auto;margin:0}.pms95-ar{direction:rtl;text-align:right}.pms95-warn{border-left:4px solid #b7791f;background:#fffbeb;color:#713f12;padding:10px 12px;border-radius:6px}@media(max-width:850px){.pms95-hero{display:grid}.pms95-form{grid-template-columns:1fr}.pms95-chart-row{grid-template-columns:1fr}}@media print{@page{size:A4;margin:7mm}html,body{height:auto!important;min-height:0!important;overflow:visible!important}#print-root{position:absolute!important;left:0!important;top:0!important;width:100%!important;min-height:0!important;height:auto!important;padding:0!important;overflow:visible!important}#print-root .print-document{min-height:0!important;height:auto!important;margin:0!important;padding:0!important;break-after:avoid!important;page-break-after:avoid!important;font-size:8.8pt!important;line-height:1.22!important;zoom:.86}#print-root .print-header{margin-bottom:3mm!important;padding-bottom:2mm!important}#print-root .print-header h1{font-size:15pt!important}#print-root .print-table{margin:2.3mm 0!important;table-layout:fixed!important}#print-root .print-table th,#print-root .print-table td{font-size:8pt!important;padding:1.5mm!important;overflow-wrap:anywhere!important}#print-root .print-footer{position:static!important;margin-top:3mm!important;font-size:7.5pt!important}#print-root .barcode-svg{max-height:22mm!important;width:auto!important}.pms95-no-print{display:none!important}}";
    document.head.appendChild(s);
  }
  function langBar(){ return '<div class="pms95-langbar pms95-no-print"><label>Lingua <select id="pms95-lang"><option value="IT">Italiano</option><option value="EN">English</option><option value="RO">Romana</option><option value="AR">العربية</option></select></label></div>'; }
  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.settings.defaultLanguage = state.settings.defaultLanguage || "IT";
    state.marketPreview52 = arr(state.marketPreview52);
    marketSeeds.forEach(s => {
      if (!state.marketPreview52.some(x => x.id === s.id)) state.marketPreview52.unshift({id:s.id,group:s.group,name:s.name,unit:s.unit,source:s.source,y2024:s.y2024,y2025:s.y2025,y2026:s.y2026,sourceUrl:s.sourceUrl});
    });
    state.marketTrends = arr(state.marketTrends);
    marketSeeds.forEach(s => {
      if (!state.marketTrends.some(x => x.id === s.id)) state.marketTrends.unshift(Object.assign({}, s, {category:s.group,currency:"EUR"}));
    });
    state.marketSourceUpdates = arr(state.marketSourceUpdates);
    state.transportPrices = arr(state.transportPrices);
    state.routeStudies = arr(state.routeStudies);
    state.legalProtocols = arr(state.legalProtocols);
    state.brokerageDeals = arr(state.brokerageDeals);
    state.accountantActions = arr(state.accountantActions);
    state.cryptoMonitor = arr(state.cryptoMonitor);
    state.settings.accountantName = state.settings.accountantName || "Sorina Popescu";
    state.settings.accountantEmail = state.settings.accountantEmail || "sorina.popescu@horgaconsulting.ro";
    addModule("transportPrices","Trasporti","Database prezzi trasporto e rotte",["admin","assistant","accountant"]);
    addModule("legalProtocols","Protocolli legali","Testi liberi su carta intestata",["admin","assistant","accountant"]);
    addModule("cryptoMonitor","Crypto monitor","Registro investimenti senza trading automatico",["admin"]);
  }
  function logSource(kind,status,message){
    state.marketSourceUpdates.unshift({id:nextCode("SRC",state.marketSourceUpdates),kind,status,message,date:new Date().toISOString()});
    state.marketSourceUpdates = state.marketSourceUpdates.slice(0,30);
    saveState();
  }
  async function refreshMarket(){
    ensure();
    logSource("market","Avviato","Aggiornamento fonti CLAL / ISMEA / BMTI. Se il browser blocca CORS, i link restano tracciati per verifica manuale.");
    await Promise.all(marketSeeds.map(async s => {
      try { await fetch(s.sourceUrl,{mode:"no-cors"}); logSource(s.name,"Collegato","Fonte raggiunta: " + s.source); }
      catch(e) { logSource(s.name,"Da verificare","Fonte non leggibile automaticamente dal browser locale: " + s.source); }
    }));
    state.settings.marketLastRefresh = new Date().toISOString();
    saveState();
    render();
  }
  function bar(row,max){
    const v = num(row.y2026 || row.price);
    const pct = Math.max(3, Math.min(100, Math.round(v / (max || 1) * 100)));
    return '<div class="pms95-chart-row"><strong>' + esc(row.name) + '</strong><div class="pms95-bar"><span style="width:' + pct + '%"></span></div><span>' + esc(row.y2026 || row.price) + ' ' + esc(row.unit) + '</span></div>';
  }
  function renderMarket(){
    ensure(); css();
    const rows = arr(state.marketPreview52);
    const max = Math.max(1, ...rows.map(r => num(r.y2026 || r.price)));
    const table = rows.map(r => '<tr><td><strong>' + esc(r.name) + '</strong><br><small>' + esc(r.source) + '</small></td><td>' + esc(r.unit) + '</td><td>' + esc(r.y2024) + '</td><td>' + esc(r.y2025) + '</td><td><strong>' + esc(r.y2026) + '</strong></td><td><a href="' + esc(r.sourceUrl || "#") + '" target="_blank">Fonte</a></td></tr>').join("");
    const trendRows = arr(state.marketTrends).map(r => '<tr><td>' + esc(r.date) + '</td><td>' + esc(r.product || r.name) + '</td><td>' + esc(r.market) + '</td><td><strong>' + esc(r.price) + '</strong></td><td>' + esc(r.unit) + '</td><td>' + esc(r.source) + '</td></tr>').join("");
    const logs = arr(state.marketSourceUpdates).slice(0,8).map(x => '<tr><td>' + esc(new Date(x.date).toLocaleString()) + '</td><td>' + esc(x.kind) + '</td><td>' + esc(x.status) + '</td><td>' + esc(x.message) + '</td></tr>').join("");
    return '<div class="pms95-page ' + (lang()==="AR" ? "pms95-ar" : "") + '">' + langBar() + '<section class="pms95-hero"><div><span>MKT</span><h3>' + tr("market") + '</h3><p>Grafici in alto, fonti verificabili, Grana Padano, duro italiano e duro estero.</p></div><div class="pms95-actions"><button class="primary-button" data-pms95-refresh-market>' + tr("refresh") + '</button><button class="secondary-button" data-pms95-print-market>' + tr("print") + '</button></div></section><div class="pms95-grid"><div class="pms95-card"><h4>' + tr("last") + '</h4><div class="pms95-kpi">' + esc(state.settings.marketLastRefresh ? new Date(state.settings.marketLastRefresh).toLocaleDateString() : "-") + '</div><div class="pms95-muted">CLAL, ISMEA, BMTI/CUN con log aggiornamento.</div></div><div class="pms95-card"><h4>Grana Padano</h4><div class="pms95-kpi">10,925</div><div class="pms95-muted">EUR/kg, Milano, 13/07/2026</div></div><div class="pms95-card"><h4>Duro italiano</h4><div class="pms95-kpi">269,50</div><div class="pms95-muted">EUR/t, ISMEA Milano</div></div><div class="pms95-card"><h4>Duro estero</h4><div class="pms95-kpi">280,50</div><div class="pms95-muted">EUR/t, Milano arrivo</div></div></div><div class="pms95-card"><h4>' + tr("charts") + '</h4>' + rows.map(r => bar(r,max)).join("") + '</div><div class="pms95-card"><h4>' + tr("quotes") + '</h4><div class="table-wrap"><table><thead><tr><th>Voce</th><th>Unita</th><th>2024</th><th>2025</th><th>2026</th><th>Fonte</th></tr></thead><tbody>' + table + '</tbody></table></div></div><div class="pms95-card"><h4>Quotazioni operative</h4><div class="table-wrap"><table><thead><tr><th>Data</th><th>Prodotto</th><th>Mercato</th><th>Prezzo</th><th>Unita</th><th>Fonte</th></tr></thead><tbody>' + trendRows + '</tbody></table></div></div><div class="pms95-card"><h4>Log aggiornamento</h4><div class="table-wrap"><table><tbody>' + logs + '</tbody></table></div></div></div>';
  }
  function printMarket(){
    const code = "MKT-" + today();
    const rows = arr(state.marketPreview52).map(r => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.group) + '</td><td>' + esc(r.y2026) + '</td><td>' + esc(r.unit) + '</td><td>' + esc(r.source) + '</td></tr>').join("");
    const html = '<div class="print-document">' + header(tr("market"), code, "CLAL / ISMEA / BMTI") + '<table class="print-table"><tr><th>Prodotto</th><th>Mercato</th><th>Prezzo 2026</th><th>Unita</th><th>Fonte</th></tr>' + rows + '</table><div>' + barcode(code) + '</div><div class="print-footer">' + esc(tr("last")) + ': ' + esc(state.settings.marketLastRefresh || today()) + '</div></div>';
    openPrint(html);
  }
  function routeEstimate(origin,dest,mode,weight){
    const d = String(dest || "").toLowerCase(), o = String(origin || "").toLowerCase();
    let km = 900, risk = "Basso", notes = "Rotta UE standard.";
    if (d.includes("romania") || d.includes("bucarest") || d.includes("arad")) { km = o.includes("ital") ? 1450 : 900; notes = "Corridoio Italia-Austria/Ungheria-Romania; preferire frontiere UE principali."; }
    if (d.includes("ukrain") || d.includes("mold") || d.includes("black sea")) { risk = "Alto"; notes = "Verificare guerra, dogane, assicurazione e deviazioni Mar Nero."; }
    if (d.includes("middle east") || d.includes("israel") || d.includes("red sea")) { risk = "Alto"; notes = "Considerare rischio Mar Rosso/Suez, assicurazione guerra e rotte alternative."; }
    const base = mode === "sea" ? 1.4 : mode === "air" ? 4.8 : 1.75;
    const cost = Math.round(km * base + num(weight) * 18 + (risk === "Alto" ? 650 : 120));
    return {km,risk,notes,cost};
  }
  function renderGeo(){
    ensure(); css();
    const rows = arr(state.routeStudies).map(r => '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.origin) + '</td><td>' + esc(r.destination) + '</td><td>' + esc(r.mode) + '</td><td>' + esc(r.km) + '</td><td>' + money(r.cost,"EUR") + '</td><td>' + esc(r.risk) + '</td><td>' + esc(r.notes) + '</td></tr>').join("");
    const prices = arr(state.transportPrices).map(r => '<tr><td>' + esc(r.route) + '</td><td>' + esc(r.mode) + '</td><td>' + money(r.price,"EUR") + '</td><td>' + esc(r.unit) + '</td><td>' + esc(r.date) + '</td><td>' + esc(r.source) + '</td></tr>').join("");
    return '<div class="pms95-page"><section class="pms95-hero"><div><span>GEO</span><h3>Geo fornitore e rotta intelligente</h3><p>Analisi rotta, rischio geopolitico, costo teorico e database prezzi trasporto.</p></div></section><div class="pms95-card"><div class="pms95-form"><label>' + tr("origin") + '<input id="pms95-route-origin" value="Italia"></label><label>' + tr("destination") + '<input id="pms95-route-destination" placeholder="es. Bucarest, Romania"></label><label>Modalita<select id="pms95-route-mode"><option value="road">Strada</option><option value="sea">Mare</option><option value="air">Aereo</option></select></label><label>Peso ton<input id="pms95-route-weight" type="number" value="22"></label><div class="full pms95-actions"><button class="primary-button" data-pms95-calc-route>' + tr("route") + '</button></div></div></div><div class="pms95-grid"><div class="pms95-card"><h4>Studi rotta</h4><div class="table-wrap"><table><thead><tr><th>ID</th><th>Origine</th><th>Destinazione</th><th>Modo</th><th>Km</th><th>Costo</th><th>Rischio</th><th>Note</th></tr></thead><tbody>' + (rows || '<tr><td colspan="8">Nessuna rotta calcolata.</td></tr>') + '</tbody></table></div></div><div class="pms95-card"><h4>Database prezzi trasporto</h4><div class="table-wrap"><table><thead><tr><th>Rotta</th><th>Modo</th><th>Prezzo</th><th>Unita</th><th>Data</th><th>Fonte</th></tr></thead><tbody>' + (prices || '<tr><td colspan="6">Calcola una rotta per popolare il database.</td></tr>') + '</tbody></table></div></div></div></div>';
  }
  function calcRoute(){
    const origin = document.getElementById("pms95-route-origin")?.value || "";
    const destination = document.getElementById("pms95-route-destination")?.value || "";
    const mode = document.getElementById("pms95-route-mode")?.value || "road";
    const weight = document.getElementById("pms95-route-weight")?.value || 0;
    if (!destination.trim()) return alert("Inserisci una destinazione.");
    const r = routeEstimate(origin,destination,mode,weight);
    const id = nextCode("RTE",state.routeStudies);
    state.routeStudies.unshift({id,origin,destination,mode,weight,km:r.km,cost:r.cost,risk:r.risk,notes:r.notes,date:new Date().toISOString()});
    state.transportPrices.unshift({id:nextCode("TRP",state.transportPrices),route:origin + " -> " + destination,mode,price:r.cost,unit:"viaggio stimato " + weight + " ton",date:today(),source:"Stima interna rotta intelligente"});
    saveState(); render();
  }
  function smartText(input,language,format,tone){
    const x = String(input || "").trim(), l = String(language || lang()).toUpperCase();
    const seed = (x.length + Date.now()) % 4;
    const open = {IT:["Buongiorno,","Gentile Cliente,","Salve,","Gentile Partner,"],EN:["Good morning,","Dear Customer,","Hello,","Dear Partner,"],RO:["Buna ziua,","Stimate client,","Salut,","Stimate partener,"],AR:["صباح الخير،","عميلنا العزيز،","مرحباً،","شريكنا العزيز،"]};
    const action = {IT:"Le chiediamo conferma di quantita, tempi e condizioni richieste.",EN:"Please confirm quantities, timing and required terms.",RO:"Va rugam sa confirmati cantitatile, termenele si conditiile necesare.",AR:"يرجى تأكيد الكميات والمواعيد والشروط المطلوبة."};
    const close = {IT:"Cordiali saluti,\nParmitalia Distribution SRL",EN:"Kind regards,\nParmitalia Distribution SRL",RO:"Cu stima,\nParmitalia Distribution SRL",AR:"مع أطيب التحيات،\nParmitalia Distribution SRL"};
    if (format === "whatsapp") return (open[l] || open.IT)[seed] + "\n\n" + x + "\n\n" + (action[l] || action.IT);
    return (open[l] || open.IT)[seed] + "\n\nIn riferimento a: " + x + "\n\n" + (tone === "decisive" ? "Proponiamo di definire subito i prossimi passaggi, evitando tempi morti e dati incompleti." : "Abbiamo analizzato le informazioni disponibili e possiamo predisporre una risposta commerciale coerente, completa e pronta per l'invio.") + "\n\n" + (action[l] || action.IT) + "\n\n" + (close[l] || close.IT);
  }
  function bindSmartWriter(){
    const root = document.getElementById("pms89-ai-studio");
    if (!root || root.dataset.pms95Smart === "1") return;
    root.dataset.pms95Smart = "1";
    const langSelect = document.getElementById("pms89-ai-language");
    if (langSelect && !Array.from(langSelect.options).some(o => o.value === "ar")) langSelect.insertAdjacentHTML("beforeend",'<option value="ar">Arabo</option>');
    root.querySelector("[data-pms89-generate]")?.addEventListener("click", function(e){
      const connected = Boolean(window.parmitaliaAI && window.parmitaliaAI.generate || sessionStorage.getItem("pms89_openai_key"));
      if (connected) return;
      e.stopImmediatePropagation(); e.preventDefault();
      const input = document.getElementById("pms89-ai-input")?.value || "";
      if (!input.trim()) return alert("Scrivi alcune indicazioni.");
      const out = document.getElementById("pms89-ai-output");
      if (out) out.value = smartText(input, document.getElementById("pms89-ai-language")?.value || lang(), document.getElementById("pms89-ai-format")?.value, document.getElementById("pms89-ai-tone")?.value);
    }, true);
  }
  function renderBroker(){
    ensure(); css();
    const rows = arr(state.brokerageDeals).map(b => '<tr><td>' + esc(b.id) + '</td><td>' + esc(b.client) + '</td><td>' + esc(b.supplier) + '</td><td>' + esc(b.product) + '</td><td>' + money(b.value,b.currency||"EUR") + '</td><td>' + esc(b.margin || "") + '</td><td>' + esc(b.nextAction || "") + '</td><td><button class="inline-button" data-pms95-broker-offer="' + esc(b.id) + '">Crea offerta</button></td></tr>').join("");
    return '<div class="pms95-page"><section class="pms95-hero"><div><span>BRK</span><h3>' + tr("broker") + '</h3><p>Pipeline attiva: opportunita, margine, prossimo contatto e conversione in offerta.</p></div><div class="pms95-actions"><button class="primary-button" data-pms95-new-broker>+ Inserisci operazione</button></div></section><div class="pms95-card"><div class="table-wrap"><table><thead><tr><th>ID</th><th>Cliente</th><th>Fornitore</th><th>Prodotto</th><th>Valore</th><th>Margine</th><th>Prossima azione</th><th>Azioni</th></tr></thead><tbody>' + rows + '</tbody></table></div></div></div>';
  }
  function newBroker(){
    const id = nextCode("BRK",state.brokerageDeals);
    state.brokerageDeals.unshift({id,client:"Da definire",supplier:"Da definire",product:"Prodotto",value:0,currency:"EUR",margin:"Da calcolare",nextAction:"Contattare cliente/fornitore",status:"Nuova"});
    saveState(); render();
  }
  function brokerToOffer(id){
    const b = state.brokerageDeals.find(x => x.id === id);
    if (!b) return;
    state.offers = arr(state.offers);
    const code = nextCode("OFF",state.offers,"code");
    state.offers.unshift({id:code,code,client:b.client,supplier:b.supplier,product:b.product,quantity:1,unit:"lotto",unitPrice:b.value||0,currency:b.currency||"EUR",status:"Bozza",notes:"Creata da brokeraggio " + id});
    saveState(); alert("Offerta creata: " + code);
  }
  function renderAccountant(){
    ensure(); css();
    const rows = arr(state.accountantActions).map(a => '<tr><td>' + esc(a.date) + '</td><td>' + esc(a.type) + '</td><td>' + esc(a.recipient) + '</td><td>' + esc(a.status) + '</td><td>' + esc(a.note) + '</td></tr>').join("");
    return '<div class="pms95-page"><section class="pms95-hero"><div><span>ACC</span><h3>' + tr("accountant") + '</h3><p>' + esc(state.settings.accountantName) + ' - ' + esc(state.settings.accountantEmail) + '</p></div><div class="pms95-actions"><button class="primary-button" data-pms95-send-accountant>Prepara invio a Sorina</button></div></section><div class="pms95-card"><h4>Fascicolo mensile</h4><p class="pms95-muted">Prepara email con riepilogo fatture, banche, pagamenti e documenti. L\'invio effettivo parte dal client email e viene registrato.</p><textarea id="pms95-accountant-note" class="pms95-textarea">Gentile Sorina, inviamo il fascicolo contabile aggiornato con fatture, estratti, pagamenti, documenti e note operative Parmitalia.</textarea></div><div class="pms95-card"><h4>Registro azioni</h4><table class="print-table"><tbody>' + rows + '</tbody></table></div></div>';
  }
  function sendAccountant(){
    const email = state.settings.accountantEmail || "sorina.popescu@horgaconsulting.ro";
    const subject = "Fascicolo contabile Parmitalia " + today();
    const note = document.getElementById("pms95-accountant-note")?.value || "";
    const body = note + "\n\nRiepilogo: documenti " + arr(state.documents).length + ", pagamenti " + arr(state.payments).length + ", banche " + arr(state.banks).length + ".\n\nAzione registrata nel gestionale.";
    state.accountantActions.unshift({id:nextCode("ACCLOG",state.accountantActions),date:new Date().toISOString(),type:"Preparazione fascicolo",recipient:email,status:"Preparata email",note:subject});
    saveState();
    location.href = "mailto:" + encodeURIComponent(email) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  function renderLegal(){
    ensure(); css();
    const rows = arr(state.legalProtocols).map(p => '<tr><td>' + esc(p.protocol) + '</td><td>' + esc(p.title) + '</td><td>' + esc(p.language) + '</td><td>' + esc(p.createdAt) + '</td><td><button class="inline-button" data-pms95-print-protocol="' + esc(p.id) + '">Stampa</button></td></tr>').join("");
    return '<div class="pms95-page"><section class="pms95-hero"><div><span>LEG</span><h3>' + tr("legal") + '</h3><p>Testo libero su carta intestata, protocollo automatico e barcode.</p></div></section><div class="pms95-card"><div class="pms95-form"><label>Titolo<input id="pms95-protocol-title" value="Comunicazione legale"></label><label>Lingua<select id="pms95-protocol-lang"><option>IT</option><option>EN</option><option>RO</option><option>AR</option></select></label><div class="full"><label>Testo<textarea id="pms95-protocol-body" class="pms95-textarea"></textarea></label></div><div class="full pms95-actions"><button class="primary-button" data-pms95-save-protocol>' + tr("save") + '</button></div></div></div><div class="pms95-card"><table class="print-table"><tbody>' + rows + '</tbody></table></div></div>';
  }
  function saveProtocol(){
    const id = nextCode("LEG",state.legalProtocols);
    const p = {id,protocol:id,title:document.getElementById("pms95-protocol-title")?.value || "Protocollo",language:document.getElementById("pms95-protocol-lang")?.value || lang(),body:document.getElementById("pms95-protocol-body")?.value || "",createdAt:new Date().toISOString()};
    state.legalProtocols.unshift(p); saveState(); printProtocol(id); render();
  }
  function printProtocol(id){
    const p = state.legalProtocols.find(x => x.id === id);
    if (!p) return;
    const html = '<div class="print-document ' + (p.language === "AR" ? "pms95-ar" : "") + '">' + header(p.title,p.protocol,"Protocollo legale") + '<div style="white-space:pre-wrap;line-height:1.45">' + esc(p.body || "-") + '</div><div>' + barcode(p.protocol) + '</div><div class="print-footer">Protocollo ' + esc(p.protocol) + ' - ' + esc(state.settings?.legalName || "Parmitalia") + '</div></div>';
    openPrint(html);
  }
  function renderCrypto(){
    ensure(); css();
    const rows = arr(state.cryptoMonitor).map(c => '<tr><td>' + esc(c.asset) + '</td><td>' + esc(c.qty) + '</td><td>' + money(c.price,"EUR") + '</td><td>' + esc(c.note) + '</td><td>' + esc(c.date) + '</td></tr>').join("");
    return '<div class="pms95-page"><section class="pms95-hero"><div><span>CRY</span><h3>' + tr("crypto") + '</h3><p>Registro monitoraggio. Nessun ordine automatico o collegamento wallet operativo.</p></div></section><div class="pms95-warn">Non posso creare trading automatico o wallet che investe da solo. Questo modulo registra decisioni manuali, rischio e note.</div><div class="pms95-card"><div class="pms95-form"><label>Asset<input id="pms95-crypto-asset" placeholder="BTC / ETH"></label><label>Quantita<input id="pms95-crypto-qty" type="number" step="0.000001"></label><label>Prezzo medio<input id="pms95-crypto-price" type="number" step="0.01"></label><div class="full"><label>Nota rischio<textarea id="pms95-crypto-note" class="pms95-textarea"></textarea></label></div><div class="full pms95-actions"><button class="primary-button" data-pms95-save-crypto>Registra manualmente</button></div></div></div><div class="pms95-card"><table class="print-table"><tbody>' + rows + '</tbody></table></div></div>';
  }
  function saveCrypto(){
    state.cryptoMonitor.unshift({id:nextCode("CRY",state.cryptoMonitor),asset:document.getElementById("pms95-crypto-asset")?.value || "",qty:document.getElementById("pms95-crypto-qty")?.value || "",price:document.getElementById("pms95-crypto-price")?.value || "",note:document.getElementById("pms95-crypto-note")?.value || "",date:new Date().toISOString()});
    saveState(); render();
  }
  function bind(){
    css();
    const langSelect = document.getElementById("pms95-lang");
    if (langSelect) { langSelect.value = lang(); langSelect.onchange = e => { state.settings.defaultLanguage = e.target.value; saveState(); render(); }; }
    document.documentElement.dir = lang() === "AR" ? "rtl" : "ltr";
    document.querySelector("[data-pms95-refresh-market]")?.addEventListener("click",refreshMarket);
    document.querySelector("[data-pms95-print-market]")?.addEventListener("click",printMarket);
    document.querySelector("[data-pms95-calc-route]")?.addEventListener("click",calcRoute);
    document.querySelector("[data-pms95-new-broker]")?.addEventListener("click",newBroker);
    document.querySelectorAll("[data-pms95-broker-offer]").forEach(b => b.onclick = () => brokerToOffer(b.dataset.pms95BrokerOffer));
    document.querySelector("[data-pms95-send-accountant]")?.addEventListener("click",sendAccountant);
    document.querySelector("[data-pms95-save-protocol]")?.addEventListener("click",saveProtocol);
    document.querySelectorAll("[data-pms95-print-protocol]").forEach(b => b.onclick = () => printProtocol(b.dataset.pms95PrintProtocol));
    document.querySelector("[data-pms95-save-crypto]")?.addEventListener("click",saveCrypto);
    bindSmartWriter();
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender) render = function(){
    ensure(); css();
    const content = document.getElementById("content"), title = document.getElementById("page-title"), subtitle = document.getElementById("page-subtitle");
    const pages = {
      marketTrends:[tr("market"),renderMarket],
      supplierGeoGroupage:["Geo fornitore",renderGeo],
      transportPrices:["Trasporti",renderGeo],
      commercialBrokerage:[tr("broker"),renderBroker],
      accountant:[tr("accountant"),renderAccountant],
      legalProtocols:[tr("legal"),renderLegal],
      cryptoMonitor:[tr("crypto"),renderCrypto]
    };
    if (content && current && pages[current.page]) {
      if (title) title.textContent = pages[current.page][0];
      if (subtitle) subtitle.textContent = VERSION;
      content.innerHTML = pages[current.page][1]();
      bind();
      return;
    }
    const result = baseRender.apply(this,arguments);
    setTimeout(bind,40);
    return result;
  };
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind) bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); setTimeout(bind,40); return r; };
  const baseNav = typeof renderNav === "function" ? renderNav : null;
  if (baseNav) renderNav = function(){ ensure(); const r = baseNav.apply(this,arguments); return r; };
  ensure(); css(); saveState(); setTimeout(bind,60);
  window.pmsV95 = {version:VERSION,refreshMarket,smartText};
})();
