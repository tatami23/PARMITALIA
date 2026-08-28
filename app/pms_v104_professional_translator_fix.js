(function(){
  "use strict";
  const VERSION = "PMS-V104-PROFESSIONAL-TRANSLATOR-FIX";
  const LANGS = {auto:"Automatico", it:"Italiano", en:"English", ro:"Romana", ar:"Arabo"};

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function next(prefix,list,field){
    const y = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + y + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String((field && x[field]) || x.protocol || x.code || x.id || "").match(re);
      return m ? Math.max(a, Number(m[1])) : a;
    },0);
    return prefix + "-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function barcode(code){
    if (typeof renderBarcode === "function") return renderBarcode(code);
    if (typeof renderQrLite === "function") return renderQrLite(code);
    return "<strong>" + esc(code) + "</strong>";
  }
  function header(title,code,sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    const s = state.settings || {};
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(s.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong><br><span>' + esc(s.address || "") + '</span></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function ensure(){
    window.state = window.state || {};
    state.professionalTranslations = arr(state.professionalTranslations);
    if (typeof modules !== "undefined") {
      modules.forEach(m => {
        if (m.id === "communications") {
          m.label = "Traduttore professionale";
          m.subtitle = "Traduzione testi e documenti in italiano, inglese, arabo e romeno";
        }
      });
    }
  }
  function css(){
    if (document.getElementById("pms-v104-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v104-style";
    s.textContent = ".pms104-page{display:grid;gap:14px}.pms104-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}.pms104-hero h3{margin:2px 0 6px;color:#fff}.pms104-hero p{margin:0;color:#dbeafe}.pms104-actions{display:flex;gap:8px;flex-wrap:wrap}.pms104-actions button{width:auto!important;margin:0!important}.pms104-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pms104-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.pms104-form .half{grid-column:span 2}.pms104-form .full{grid-column:1/-1}.pms104-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms104-form textarea{min-height:245px;line-height:1.55;font-size:14px}.pms104-status{border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;border-radius:8px;padding:9px 11px;font-size:13px;font-weight:700}.pms104-status.warn{border-color:#fde68a;background:#fffbeb;color:#92400e}.pms104-status.ok{border-color:#bbf7d0;background:#f0fdf4;color:#166534}.pms104-muted{color:var(--muted);font-size:12px;line-height:1.45}.pms104-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pms104-toolbar button{width:auto!important;margin:0!important}.pms104-rtl{direction:rtl;text-align:right}.pms104-print-grid{display:grid;grid-template-columns:1fr 1fr;gap:5mm}.pms104-print-box{border:1px solid #cbd5e1;padding:4mm;min-height:90mm;white-space:pre-wrap;line-height:1.35}@media(max-width:900px){.pms104-hero{display:grid}.pms104-form{grid-template-columns:1fr}.pms104-form .half{grid-column:1/-1}}@media print{@page{size:A4;margin:10mm}#print-root .pms104-print{min-height:0!important;height:auto!important;font-size:9.5pt!important;line-height:1.25!important;page-break-after:avoid!important;break-after:avoid!important}.pms104-print-grid{gap:4mm}.pms104-print-box{min-height:65mm;padding:3mm}}";
    document.head.appendChild(s);
  }

  function detectLang(text){
    const t = String(text || "");
    if (/[\u0600-\u06ff]/.test(t)) return "ar";
    const lower = t.toLowerCase();
    const roHits = [" buna "," ziua "," va rog "," multumesc "," factura "," marfa "," livrare "," pret "," comanda "," plata "].filter(w => (" " + lower + " ").includes(w)).length;
    const itHits = [" buongiorno "," grazie "," fattura "," merce "," consegna "," prezzo "," ordine "," pagamento "," cliente "," fornitore "].filter(w => (" " + lower + " ").includes(w)).length;
    const enHits = [" good "," morning "," invoice "," goods "," delivery "," price "," order "," payment "," customer "," supplier "].filter(w => (" " + lower + " ").includes(w)).length;
    const best = [["ro",roHits],["it",itHits],["en",enHits]].sort((a,b)=>b[1]-a[1])[0];
    return best && best[1] > 0 ? best[0] : "it";
  }
  function escapeRegex(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g,"\\$&"); }
  function preserveCase(source,repl){
    if (!source || !repl) return repl;
    if (source === source.toUpperCase()) return repl.toUpperCase();
    if (source[0] === source[0].toUpperCase()) return repl.charAt(0).toUpperCase() + repl.slice(1);
    return repl;
  }
  const TERMS = {
    "it>en":{
      "buongiorno":"good morning","buonasera":"good evening","gentile":"dear","spettabile":"dear","cliente":"customer","fornitore":"supplier","ordine":"order","conferma ordine":"order confirmation","offerta":"offer","fattura":"invoice","fattura proforma":"proforma invoice","pagamento":"payment","bonifico":"bank transfer","consegna":"delivery","merce":"goods","prodotto":"product","prezzo":"price","quantita":"quantity","imballo":"packaging","trasporto":"transport","camion":"truck","pallet":"pallet","container":"container","documenti":"documents","certificato sanitario":"health certificate","scheda tecnica":"technical sheet","contratto":"contract","scadenza":"deadline","campionatura":"sample shipment","campione":"sample","resa":"delivery terms","franco fabbrica":"ex works","ritiro":"collection","destinazione":"destination","cordiali saluti":"kind regards","in attesa di riscontro":"awaiting your reply","restiamo in attesa":"we await","vi chiediamo":"we kindly ask","si prega di confermare":"please confirm"
    },
    "it>ro":{
      "buongiorno":"buna ziua","buonasera":"buna seara","gentile":"stimate","spettabile":"stimate","cliente":"client","fornitore":"furnizor","ordine":"comanda","conferma ordine":"confirmare comanda","offerta":"oferta","fattura":"factura","fattura proforma":"factura proforma","pagamento":"plata","bonifico":"transfer bancar","consegna":"livrare","merce":"marfa","prodotto":"produs","prezzo":"pret","quantita":"cantitate","imballo":"ambalaj","trasporto":"transport","camion":"camion","pallet":"palet","container":"container","documenti":"documente","certificato sanitario":"certificat sanitar","scheda tecnica":"fisa tehnica","contratto":"contract","scadenza":"termen","campionatura":"trimitere mostre","campione":"mostra","resa":"conditii de livrare","franco fabbrica":"ex works","ritiro":"ridicare","destinazione":"destinatie","cordiali saluti":"cu stima","in attesa di riscontro":"asteptam raspunsul dumneavoastra","restiamo in attesa":"ramanem in asteptare","vi chiediamo":"va rugam","si prega di confermare":"va rugam sa confirmati"
    },
    "en>it":{
      "good morning":"buongiorno","good evening":"buonasera","dear":"gentile","customer":"cliente","client":"cliente","supplier":"fornitore","order":"ordine","order confirmation":"conferma ordine","offer":"offerta","invoice":"fattura","proforma invoice":"fattura proforma","payment":"pagamento","bank transfer":"bonifico bancario","delivery":"consegna","goods":"merce","product":"prodotto","price":"prezzo","quantity":"quantita","packaging":"imballo","transport":"trasporto","truck":"camion","documents":"documenti","health certificate":"certificato sanitario","technical sheet":"scheda tecnica","contract":"contratto","deadline":"scadenza","sample":"campione","delivery terms":"resa","collection":"ritiro","destination":"destinazione","kind regards":"cordiali saluti","awaiting your reply":"in attesa di riscontro","please confirm":"si prega di confermare"
    },
    "ro>it":{
      "buna ziua":"buongiorno","buna seara":"buonasera","stimate":"gentile","client":"cliente","furnizor":"fornitore","comanda":"ordine","confirmare comanda":"conferma ordine","oferta":"offerta","factura":"fattura","factura proforma":"fattura proforma","plata":"pagamento","transfer bancar":"bonifico bancario","livrare":"consegna","marfa":"merce","produs":"prodotto","pret":"prezzo","cantitate":"quantita","ambalaj":"imballo","transport":"trasporto","camion":"camion","documente":"documenti","certificat sanitar":"certificato sanitario","fisa tehnica":"scheda tecnica","contract":"contratto","termen":"scadenza","mostra":"campione","conditii de livrare":"resa","ridicare":"ritiro","destinatie":"destinazione","cu stima":"cordiali saluti","asteptam raspunsul dumneavoastra":"in attesa di riscontro","va rugam sa confirmati":"si prega di confermare"
    },
    "it>ar":{
      "buongiorno":"صباح الخير","buonasera":"مساء الخير","gentile":"السيد/السيدة المحترم/ة","cliente":"العميل","fornitore":"المورد","ordine":"طلب","conferma ordine":"تأكيد الطلب","offerta":"عرض","fattura":"فاتورة","pagamento":"الدفع","consegna":"التسليم","merce":"البضاعة","prodotto":"المنتج","prezzo":"السعر","quantita":"الكمية","documenti":"المستندات","contratto":"العقد","trasporto":"النقل","destinazione":"الوجهة","cordiali saluti":"مع خالص التحية","si prega di confermare":"يرجى التأكيد"
    },
    "en>ar":{
      "good morning":"صباح الخير","dear":"السيد/السيدة المحترم/ة","customer":"العميل","supplier":"المورد","order":"طلب","invoice":"فاتورة","payment":"الدفع","delivery":"التسليم","goods":"البضاعة","product":"المنتج","price":"السعر","quantity":"الكمية","documents":"المستندات","contract":"العقد","transport":"النقل","destination":"الوجهة","kind regards":"مع خالص التحية","please confirm":"يرجى التأكيد"
    },
    "ar>it":{
      "صباح الخير":"buongiorno","مساء الخير":"buonasera","العميل":"cliente","المورد":"fornitore","طلب":"ordine","تأكيد الطلب":"conferma ordine","عرض":"offerta","فاتورة":"fattura","الدفع":"pagamento","التسليم":"consegna","البضاعة":"merce","المنتج":"prodotto","السعر":"prezzo","الكمية":"quantita","المستندات":"documenti","العقد":"contratto","النقل":"trasporto","الوجهة":"destinazione","مع خالص التحية":"cordiali saluti","يرجى التأكيد":"si prega di confermare"
    }
  };
  function localTranslate(text,from,to){
    let source = from === "auto" ? detectLang(text) : from;
    if (source === to) return {text:String(text || ""), source, partial:false};
    let out = String(text || "");
    let hits = 0;
    const direct = TERMS[source + ">" + to] || {};
    Object.keys(direct).sort((a,b)=>b.length-a.length).forEach(k => {
      const before = out;
      const flags = /[\u0600-\u06ff]/.test(k) ? "g" : "gi";
      out = out.replace(new RegExp(escapeRegex(k), flags), m => preserveCase(m,direct[k]));
      if (out !== before) hits++;
    });
    if (!hits && source !== "it" && to !== "it") {
      const step = localTranslate(out,source,"it");
      const step2 = localTranslate(step.text,"it",to);
      out = step2.text;
      hits = step.partial && step2.partial ? 0 : 1;
    }
    return {text:out, source, partial:hits === 0};
  }
  function chunks(text,limit){
    const parts = String(text || "").split(/(\n{2,})/);
    const out = [];
    let buf = "";
    parts.forEach(p => {
      if ((buf + p).length > limit && buf) { out.push(buf); buf = p; }
      else buf += p;
    });
    if (buf) out.push(buf);
    return out.flatMap(part => {
      if (part.length <= limit) return [part];
      const small = [];
      for (let i=0;i<part.length;i+=limit) small.push(part.slice(i,i+limit));
      return small;
    });
  }
  async function onlineTranslate(text,from,to){
    const source = from === "auto" ? detectLang(text) : from;
    if (source === to) return {text:String(text || ""), source};
    const pieces = chunks(text,430);
    const translated = [];
    for (const piece of pieces) {
      if (!piece.trim()) { translated.push(piece); continue; }
      const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(piece) + "&langpair=" + encodeURIComponent(source + "|" + to);
      const res = await fetch(url, {cache:"no-store"});
      if (!res.ok) throw new Error("Servizio traduzione non disponibile");
      const data = await res.json();
      const value = data && data.responseData && data.responseData.translatedText;
      if (!value) throw new Error("Risposta traduzione vuota");
      translated.push(value);
    }
    return {text:translated.join(""), source};
  }
  function setStatus(text,type){
    const el = document.getElementById("pms104-status");
    if (!el) return;
    el.className = "pms104-status" + (type ? " " + type : "");
    el.textContent = text;
  }
  function opts(selected,auto){
    return Object.keys(LANGS).filter(k => auto || k !== "auto").map(k => '<option value="' + esc(k) + '" ' + (k === selected ? "selected" : "") + '>' + esc(LANGS[k]) + '</option>').join("");
  }
  function renderTranslator(){
    ensure(); css();
    const rows = state.professionalTranslations.slice(0,30).map(x => '<tr><td><span class="code-block">' + esc(x.id) + '</span></td><td>' + esc(x.date || "") + '</td><td>' + esc(LANGS[x.from] || x.from) + ' -> ' + esc(LANGS[x.to] || x.to) + '</td><td><strong>' + esc(x.subject || "-") + '</strong><br><small>' + esc(x.engine || "") + '</small></td><td><button class="inline-button" data-pms104-load="' + esc(x.id) + '">Apri</button><button class="inline-button" data-pms104-print-saved="' + esc(x.id) + '">Stampa</button></td></tr>').join("");
    return '<div class="pms104-page"><section class="pms104-hero"><div><span>TRAD</span><h3>Traduttore professionale</h3><p>Traduzione di testi commerciali, legali e logistici in italiano, inglese, arabo e romeno.</p></div><div class="pms104-actions"><button class="primary-button" data-pms104-online>Traduci online</button><button class="secondary-button" data-pms104-local>Traduci locale</button><button class="secondary-button" data-pms104-print>Stampa</button></div></section><div class="pms104-card"><div class="pms104-form"><label>Da<select id="pms104-from">' + opts("auto",true) + '</select></label><label>A<select id="pms104-to">' + opts("en",false) + '</select></label><label class="half">Oggetto<input id="pms104-subject" placeholder="Oggetto della traduzione"></label><label class="full">Testo originale<textarea id="pms104-input" placeholder="Incolla o scrivi qui il testo da tradurre"></textarea></label><label class="full">Traduzione<textarea id="pms104-output" placeholder="La traduzione comparira qui"></textarea></label><div class="full pms104-toolbar"><button class="primary-button" data-pms104-online>Traduci online</button><button class="secondary-button" data-pms104-local>Traduci locale</button><button class="secondary-button" data-pms104-swap>Scambia lingue</button><button class="secondary-button" data-pms104-copy>Copia</button><button class="secondary-button" data-pms104-save>Salva</button><button class="secondary-button" data-pms104-print>Stampa</button><button class="secondary-button" data-pms104-clear>Pulisci</button></div><div id="pms104-status" class="pms104-status full">Pronto. Usa Traduci online per la traduzione completa; se la rete non risponde il sistema usa il dizionario locale.</div></div></div><div class="pms104-card"><h4>Archivio traduzioni</h4><div class="table-wrap"><table><thead><tr><th>Protocollo</th><th>Data</th><th>Lingue</th><th>Oggetto</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="5">Nessuna traduzione salvata.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function fields(){
    return {
      from:document.getElementById("pms104-from"),
      to:document.getElementById("pms104-to"),
      subject:document.getElementById("pms104-subject"),
      input:document.getElementById("pms104-input"),
      output:document.getElementById("pms104-output")
    };
  }
  async function runOnline(){
    const f = fields();
    const text = f.input?.value || "";
    if (!text.trim()) return setStatus("Inserisci un testo da tradurre.","warn");
    setStatus("Traduzione online in corso...","warn");
    try {
      const result = await onlineTranslate(text,f.from.value,f.to.value);
      f.output.value = result.text;
      f.output.classList.toggle("pms104-rtl", f.to.value === "ar");
      setStatus("Traduzione completata online da " + (LANGS[result.source] || result.source) + " a " + (LANGS[f.to.value] || f.to.value) + ".","ok");
    } catch(error) {
      const local = localTranslate(text,f.from.value,f.to.value);
      f.output.value = local.text;
      f.output.classList.toggle("pms104-rtl", f.to.value === "ar");
      setStatus("Servizio online non raggiungibile. Ho applicato la traduzione locale " + (local.partial ? "parziale: controllare il testo finale." : "disponibile.") ,"warn");
    }
  }
  function runLocal(){
    const f = fields();
    const text = f.input?.value || "";
    if (!text.trim()) return setStatus("Inserisci un testo da tradurre.","warn");
    const local = localTranslate(text,f.from.value,f.to.value);
    f.output.value = local.text;
    f.output.classList.toggle("pms104-rtl", f.to.value === "ar");
    setStatus(local.partial ? "Traduzione locale parziale: il testo non contiene termini presenti nel dizionario professionale." : "Traduzione locale completata.","ok");
  }
  function readTranslation(engine){
    const f = fields();
    const from = f.from?.value || "auto";
    const to = f.to?.value || "en";
    return {id:next("TRAD",state.professionalTranslations),protocol:"TRAD-" + new Date().getFullYear() + "-" + String(state.professionalTranslations.length + 1).padStart(4,"0"),date:today(),from,to,subject:f.subject?.value || "",input:f.input?.value || "",output:f.output?.value || "",engine:engine || "Traduttore professionale",createdAt:new Date().toISOString()};
  }
  function saveTranslation(){
    const item = readTranslation("Traduzione salvata");
    if (!item.input.trim() && !item.output.trim()) return setStatus("Non c'e testo da salvare.","warn");
    state.professionalTranslations.unshift(item);
    saveState();
    render();
    setTimeout(() => setStatus("Traduzione salvata con protocollo " + item.id + ".","ok"),50);
  }
  function loadTranslation(id){
    const item = state.professionalTranslations.find(x => x.id === id || x.protocol === id);
    if (!item) return;
    const f = fields();
    f.from.value = item.from || "auto";
    f.to.value = item.to || "en";
    f.subject.value = item.subject || "";
    f.input.value = item.input || "";
    f.output.value = item.output || "";
    f.output.classList.toggle("pms104-rtl", f.to.value === "ar");
    setStatus("Traduzione caricata: " + (item.id || item.protocol) + ".","ok");
  }
  function printHtml(item){
    const code = item.id || item.protocol || next("TRAD",state.professionalTranslations);
    const rtl = item.to === "ar" ? " pms104-rtl" : "";
    return '<div class="print-document pms104-print">' + header("TRADUZIONE PROFESSIONALE",code,item.subject || "Documento tradotto") + '<table class="print-table"><tr><th>Data</th><td>' + esc(item.date || today()) + '</td><th>Lingue</th><td>' + esc(LANGS[item.from] || item.from) + ' -> ' + esc(LANGS[item.to] || item.to) + '</td></tr><tr><th>Oggetto</th><td colspan="3">' + esc(item.subject || "-") + '</td></tr></table><div class="pms104-print-grid"><div><h3>Testo originale</h3><div class="pms104-print-box">' + esc(item.input || "-") + '</div></div><div><h3>Traduzione</h3><div class="pms104-print-box' + rtl + '">' + esc(item.output || "-") + '</div></div></div><div style="margin-top:6mm">' + barcode(code) + '</div><div class="print-footer">Traduzione professionale Parmitalia - Protocollo ' + esc(code) + '</div></div>';
  }
  function printCurrent(){
    const item = readTranslation("Stampa");
    if (!item.input.trim() && !item.output.trim()) return setStatus("Non c'e testo da stampare.","warn");
    if (typeof openPrint === "function") openPrint(printHtml(item)); else window.print();
  }
  function printSaved(id){
    const item = state.professionalTranslations.find(x => x.id === id || x.protocol === id);
    if (!item) return;
    if (typeof openPrint === "function") openPrint(printHtml(item)); else window.print();
  }
  function swap(){
    const f = fields();
    const oldFrom = f.from.value === "auto" ? detectLang(f.input.value) : f.from.value;
    const oldTo = f.to.value;
    f.from.value = oldTo;
    f.to.value = oldFrom === "auto" ? "it" : oldFrom;
    const input = f.input.value;
    f.input.value = f.output.value;
    f.output.value = input;
    f.output.classList.toggle("pms104-rtl", f.to.value === "ar");
    setStatus("Lingue e testi scambiati.","ok");
  }
  async function copyOutput(){
    const value = fields().output?.value || "";
    if (!value.trim()) return setStatus("Non c'e traduzione da copiare.","warn");
    try { await navigator.clipboard.writeText(value); setStatus("Traduzione copiata negli appunti.","ok"); }
    catch(e){ fields().output.select(); document.execCommand("copy"); setStatus("Traduzione selezionata e copiata.","ok"); }
  }
  function clearAll(){
    const f = fields();
    f.subject.value = "";
    f.input.value = "";
    f.output.value = "";
    f.output.classList.remove("pms104-rtl");
    setStatus("Campi puliti.","ok");
  }
  function bind(){
    ensure(); css();
    document.querySelectorAll("[data-pms104-online]").forEach(b => b.onclick = runOnline);
    document.querySelectorAll("[data-pms104-local]").forEach(b => b.onclick = runLocal);
    document.querySelector("[data-pms104-swap]")?.addEventListener("click",swap);
    document.querySelector("[data-pms104-copy]")?.addEventListener("click",copyOutput);
    document.querySelector("[data-pms104-save]")?.addEventListener("click",saveTranslation);
    document.querySelectorAll("[data-pms104-print]").forEach(b => b.onclick = printCurrent);
    document.querySelector("[data-pms104-clear]")?.addEventListener("click",clearAll);
    document.querySelectorAll("[data-pms104-load]").forEach(b => b.onclick = () => loadTranslation(b.dataset.pms104Load));
    document.querySelectorAll("[data-pms104-print-saved]").forEach(b => b.onclick = () => printSaved(b.dataset.pms104PrintSaved));
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms104RenderWrapped) {
    window.__pms104RenderWrapped = true;
    render = function(){
      ensure(); css();
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (content && window.current && current.page === "communications") {
        if (title) title.textContent = "Traduttore professionale";
        if (subtitle) subtitle.textContent = "Traduzione testi e documenti in italiano, inglese, arabo e romeno";
        content.innerHTML = renderTranslator();
        bind();
        return;
      }
      const r = baseRender.apply(this,arguments);
      setTimeout(bind,40);
      return r;
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms104BindWrapped) {
    window.__pms104BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); return r; };
  }
  const baseNav = typeof renderNav === "function" ? renderNav : null;
  if (baseNav && !window.__pms104NavWrapped) {
    window.__pms104NavWrapped = true;
    renderNav = function(){ ensure(); return baseNav.apply(this,arguments); };
  }
  ensure(); css(); setTimeout(bind,80);
  window.pmsV104ProfessionalTranslator = {version:VERSION,runOnline,runLocal,localTranslate,onlineTranslate};
})();
