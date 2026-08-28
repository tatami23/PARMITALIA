(function(){
  "use strict";
  const VERSION = "PMS-V100-RESTORE-ALL-MODULES-NAV";

  const DEFINITIONS = [
    {id:"dashboard", label:"Dashboard", subtitle:"Visione generale operativa", roles:["admin","assistant","accountant","agent"], code:"DB", group:"Principale"},
    {id:"marketTrends", label:"Andamenti di mercato", subtitle:"Quotazioni, grafici e aggiornamento fonti", roles:["admin","assistant","accountant","agent"], code:"MKT", group:"Principale"},
    {id:"operativo", label:"Gestione operativa", subtitle:"Area operativa generale", roles:["admin","assistant","accountant"], code:"OP", group:"Principale"},
    {id:"assistant", label:"Backoffice / Segretariato", subtitle:"Promemoria, offerte, follow-up e attivita operative", roles:["admin","assistant"], code:"BO", group:"Principale"},
    {id:"communications", label:"Comunicazioni / CRM", subtitle:"Messaggi, CRM e scrittura intelligente", roles:["admin","assistant","accountant","agent"], code:"CRM", group:"Principale"},
    {id:"officialCommunications", label:"Comunicazioni ufficiali", subtitle:"Protocollo, carta intestata e scrittura libera", roles:["admin","assistant","accountant"], code:"CU", group:"Ufficio"},
    {id:"trattativeInCorso", label:"Trattative in corso", subtitle:"Pipeline commerciale e anteprime stampa", roles:["admin","assistant"], code:"TRT", group:"Commerciale"},
    {id:"intermediations", label:"Intermediazioni", subtitle:"Pratiche commerciali e provvigioni Parmitalia", roles:["admin","assistant"], code:"INT", group:"Commerciale"},
    {id:"offers", label:"Offerte commerciali", subtitle:"Offerte, PDF, barcode e traduzioni", roles:["admin","assistant"], code:"OFF", group:"Commerciale"},
    {id:"approvals", label:"Autorizzazioni Admin", subtitle:"Blocchi procedura, richieste approvazione e controllo offerte", roles:["admin","assistant"], code:"APP", group:"Commerciale"},
    {id:"orders", label:"Ordini", subtitle:"Ordini cliente/fornitore e PDF puliti", roles:["admin","assistant","accountant"], code:"ORD", group:"Commerciale"},
    {id:"products", label:"Prodotti e articoli", subtitle:"Anagrafica articoli e multi-articolo", roles:["admin","assistant","accountant"], code:"PRD", group:"Commerciale"},
    {id:"productForms", label:"Moduli prodotto", subtitle:"Modulo precompilato e import anagrafica prodotto", roles:["admin","assistant","agent"], code:"FRM", group:"Commerciale"},
    {id:"supplierPriceConfirmations", label:"Listini e conferme fornitori", subtitle:"Conferme prezzi fluide multi-articolo", roles:["admin","assistant"], code:"LST", group:"Commerciale"},
    {id:"tenders", label:"Gare e richieste", subtitle:"Richieste commerciali e gare", roles:["admin","assistant"], code:"TEN", group:"Commerciale"},
    {id:"commercialBrokerage", label:"Brokeraggio commerciale", subtitle:"Pipeline broker e creazione offerte", roles:["admin","assistant"], code:"BRK", group:"Commerciale"},
    {id:"contacts", label:"Anagrafiche clienti e fornitori", subtitle:"Database anagrafiche", roles:["admin","assistant","accountant"], code:"ANA", group:"Commerciale"},
    {id:"print", label:"Centro stampe", subtitle:"Print center e anteprime A4", roles:["admin","assistant","accountant"], code:"PRN", group:"Commerciale"},
    {id:"supplierGeoGroupage", label:"Geo fornitore", subtitle:"Rotte, rischi geopolitici e costi teorici", roles:["admin","assistant","accountant"], code:"GEO", group:"Operativo"},
    {id:"transportPrices", label:"Trasporti", subtitle:"Database prezzi trasporto e rotte", roles:["admin","assistant","accountant"], code:"TRP", group:"Operativo"},
    {id:"packing", label:"Packing list", subtitle:"Imballi e packing", roles:["admin","assistant","accountant"], code:"PKG", group:"Operativo"},
    {id:"documents", label:"Archivio documenti", subtitle:"Documenti collegati a offerte, ordini e pratiche", roles:["admin","assistant","accountant"], code:"DOC", group:"Operativo"},
    {id:"accountant", label:"Commercialista", subtitle:"Fascicolo e invio a Sorina Popescu", roles:["admin","assistant","accountant"], code:"ACC", group:"Amministrazione"},
    {id:"billingWorkflow", label:"Fatturazione attiva e passiva", subtitle:"Fatture e flusso amministrativo", roles:["admin","assistant","accountant"], code:"FAT", group:"Amministrazione"},
    {id:"banks", label:"Banche", subtitle:"Conti, IBAN e valute", roles:["admin","assistant","accountant"], code:"BNK", group:"Amministrazione"},
    {id:"payments", label:"Pagamenti e garanzie", subtitle:"Scadenze, garanzie e LC", roles:["admin","assistant","accountant"], code:"PAY", group:"Amministrazione"},
    {id:"agents", label:"Agenti e provvigioni", subtitle:"Agenti e commissioni", roles:["admin","assistant","agent"], code:"AG", group:"Amministrazione"},
    {id:"driverRecruiting", label:"Recruiting autisti", subtitle:"Autisti, coppie cabina, contratti e provvigioni", roles:["admin","assistant","recruiter"], code:"REC", group:"Risorse umane"},
    {id:"humanResources", label:"Dipendenti e risorse umane", subtitle:"Dipendenti, documenti e scadenze HR", roles:["admin","assistant","recruiter"], code:"HR", group:"Risorse umane"},
    {id:"legalClaims", label:"Sinistri e pratiche legali", subtitle:"Sinistri, danni e contestazioni", roles:["admin","assistant"], code:"SIN", group:"Legale"},
    {id:"legalProtocols", label:"Protocolli legali", subtitle:"Testi liberi su carta intestata", roles:["admin","assistant","accountant"], code:"LEG", group:"Legale"},
    {id:"contracts", label:"Contratti", subtitle:"Archivio contratti", roles:["admin","assistant"], code:"CTR", group:"Legale"},
    {id:"contractTemplates", label:"Modelli contrattuali", subtitle:"Modelli legali e commerciali", roles:["admin","assistant"], code:"TPL", group:"Legale"},
    {id:"customerInternalExtraction", label:"Estrazione clienti interni", subtitle:"Modulo interno clienti ed esportazioni", roles:["admin"], code:"CLI", group:"Sistema"},
    {id:"desktopCloudApp", label:"App Desktop Windows / macOS", subtitle:"Pacchetto desktop multipiattaforma e salvataggio locale", roles:["admin"], code:"APP", group:"Sistema"},
    {id:"desktopRoadmap", label:"Piano applicazione desktop", subtitle:"Roadmap tecnica desktop, cloud e Outlook", roles:["admin"], code:"DEV", group:"Sistema"},
    {id:"cryptoMonitor", label:"Crypto monitor", subtitle:"Registro investimenti manuale, senza trading automatico", roles:["admin"], code:"CRY", group:"Sistema"},
    {id:"settings", label:"Impostazioni", subtitle:"Logo, azienda, lingua e utenti", roles:["admin"], code:"SET", group:"Sistema"},
    {id:"admin", label:"Gestione utenti e ruoli", subtitle:"Utenti locali", roles:["admin"], code:"ADM", group:"Sistema"}
  ];

  const GROUPS = ["Principale","Ufficio","Commerciale","Operativo","Amministrazione","Risorse umane","Legale","Sistema","Altri moduli"];

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function css(){
    if (document.getElementById("pms-v100-nav-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v100-nav-style";
    style.textContent = `
      #nav.pms100-nav{display:flex!important;flex-direction:column!important;gap:0!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:7px!important}
      #nav.pms100-nav .nav-group{display:flex!important;flex-direction:column!important;gap:4px!important;margin:0 0 13px!important;padding:0!important}
      #nav.pms100-nav .nav-group-title{padding:8px 10px 5px!important;color:rgba(255,255,255,.58)!important;font-size:11px!important;font-weight:900!important;text-transform:uppercase!important;letter-spacing:0!important}
      #nav.pms100-nav .nav-button.compact{display:grid!important;grid-template-columns:36px minmax(0,1fr)!important;gap:10px!important;align-items:center!important;width:100%!important;min-height:46px!important;height:auto!important;padding:9px 10px!important;white-space:normal!important;overflow:visible!important;text-align:left!important;border-radius:6px!important}
      #nav.pms100-nav .nav-button.compact::before,#nav.pms100-nav .nav-button.compact::after{display:none!important;content:none!important}
      #nav.pms100-nav .pms100-code{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:36px!important;min-width:36px!important;height:24px!important;border:1px solid rgba(255,255,255,.24)!important;border-radius:5px!important;color:rgba(255,255,255,.75)!important;font-family:Consolas,monospace!important;font-size:10px!important;font-weight:900!important}
      #nav.pms100-nav .pms100-label{display:block!important;min-width:0!important;overflow-wrap:anywhere!important;line-height:1.25!important;color:inherit!important;font-size:13px!important;font-weight:800!important}
    `;
    document.head.appendChild(style);
  }
  function ensureDefinitions(){
    window.modules = arr(window.modules);
    DEFINITIONS.forEach(def => {
      const existing = modules.find(m => m.id === def.id);
      if (existing) {
        existing.label = def.label;
        existing.subtitle = existing.subtitle || def.subtitle;
        existing.roles = Array.from(new Set(arr(existing.roles).concat(def.roles)));
      } else {
        modules.push({id:def.id,label:def.label,subtitle:def.subtitle,roles:def.roles.slice()});
      }
    });
  }
  function byId(id){ return DEFINITIONS.find(d => d.id === id) || {id,code:"MOD",label:id,group:"Altri moduli",roles:["admin"]}; }
  function allowed(module){
    const role = (window.current && current.role) || "admin";
    if (role === "recruiter") return ["driverRecruiting","humanResources"].includes(module.id);
    return arr(module.roles).includes(role);
  }
  function renderNav100(){
    ensureDefinitions();
    css();
    const nav = document.getElementById("nav");
    if (!nav) return;
    nav.classList.add("pms100-nav");
    nav.innerHTML = "";
    const allowedModules = modules.filter(allowed);
    const seen = new Set();
    GROUPS.forEach(group => {
      const groupItems = allowedModules.filter(m => {
        const info = byId(m.id);
        return (info.group || "Altri moduli") === group;
      });
      if (!groupItems.length) return;
      const wrap = document.createElement("div");
      wrap.className = "nav-group";
      const title = document.createElement("div");
      title.className = "nav-group-title";
      title.textContent = group;
      wrap.appendChild(title);
      groupItems.forEach(m => {
        seen.add(m.id);
        const info = byId(m.id);
        const button = document.createElement("button");
        button.className = "nav-button compact" + (window.current && current.page === m.id ? " active" : "");
        button.dataset.page = m.id;
        button.innerHTML = '<span class="pms100-code">' + esc(info.code || "MOD") + '</span><span class="pms100-label">' + esc(info.label || m.label || m.id) + '</span>';
        button.onclick = () => {
          if (typeof setPage === "function") setPage(m.id);
          else { current.page = m.id; if (typeof render === "function") render(); }
        };
        wrap.appendChild(button);
      });
      nav.appendChild(wrap);
    });
    const leftovers = allowedModules.filter(m => !seen.has(m.id));
    if (leftovers.length) {
      const wrap = document.createElement("div");
      wrap.className = "nav-group";
      wrap.innerHTML = '<div class="nav-group-title">Altri moduli</div>';
      leftovers.forEach(m => {
        const info = byId(m.id);
        const button = document.createElement("button");
        button.className = "nav-button compact" + (window.current && current.page === m.id ? " active" : "");
        button.dataset.page = m.id;
        button.innerHTML = '<span class="pms100-code">' + esc(info.code || "MOD") + '</span><span class="pms100-label">' + esc(info.label || m.label || m.id) + '</span>';
        button.onclick = () => setPage(m.id);
        wrap.appendChild(button);
      });
      nav.appendChild(wrap);
    }
  }

  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  renderNav = function(){
    ensureDefinitions();
    renderNav100();
  };

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms100RenderWrapped) {
    window.__pms100RenderWrapped = true;
    render = function(){
      ensureDefinitions();
      const result = baseRender.apply(this, arguments);
      setTimeout(renderNav100, 0);
      return result;
    };
  }

  ensureDefinitions();
  css();
  setTimeout(renderNav100, 0);
  setTimeout(renderNav100, 200);
  window.pmsV100RestoreAllModulesNav = {version:VERSION, renderNav:renderNav100, ensure:ensureDefinitions};
})();
