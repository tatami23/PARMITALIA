(function(){
  "use strict";

  const VERSION = "pms_v162_restore_company_settings_clean_footer";
  const PAGE = "settings";

  function arr(value){ return Array.isArray(value) ? value : []; }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function today(){
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function saveNow(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      return true;
    } catch(error) {
      console.warn(VERSION + " save failed", error);
      alert("Salvataggio impostazioni non riuscito.");
      return false;
    }
  }
  function setting(key, fallback){ return st().settings[key] == null ? (fallback || "") : st().settings[key]; }

  function field(label, name, type, options, wide){
    const value = setting(name);
    if (options) {
      return '<label class="' + (wide ? "wide" : "") + '"><span>' + esc(label) + '</span><select name="' + esc(name) + '">' +
        options.map(function(option){ return '<option value="' + esc(option) + '" ' + (String(option) === String(value || "") ? "selected" : "") + '>' + esc(option) + '</option>'; }).join("") +
      '</select></label>';
    }
    if (type === "textarea") return '<label class="wide"><span>' + esc(label) + '</span><textarea name="' + esc(name) + '">' + esc(value) + '</textarea></label>';
    return '<label class="' + (wide ? "wide" : "") + '"><span>' + esc(label) + '</span><input name="' + esc(name) + '" type="' + esc(type || "text") + '" value="' + esc(value) + '"></label>';
  }

  function logoPreview(){
    const logo = setting("logoUrl");
    return logo ? '<img src="' + esc(logo) + '" alt="Logo Parmitalia">' : '<strong>P</strong><span>Logo</span>';
  }

  function renderSettings(){
    const s = st().settings;
    if (!s.companyName) s.companyName = "Parmitalia Distribution";
    if (!s.legalName) s.legalName = "PARMITALIA DISTRIBUTION SRL";
    if (!s.vat) s.vat = "CUI 36828897";
    if (!s.address) s.address = "Arad, Romania";
    if (!s.email) s.email = "parmitaliadistribution@gmail.com";
    if (!s.defaultCurrency) s.defaultCurrency = "EUR";
    if (!s.defaultLanguage) s.defaultLanguage = "IT";
    return '<div class="pms162-settings">' +
      '<section class="pms162-hero"><div><span>Impostazioni</span><h3>Dati aziendali e logo</h3><p>Logo, intestazioni, contatti, numerazione fatture e backup del gestionale.</p></div><button type="button" class="primary-button" data-pms162-save>Salva impostazioni</button></section>' +
      '<form id="pms162-settings-form">' +
        '<section class="pms162-panel pms162-logo-panel"><div><h4>Logo aziendale</h4><p>Usato nella stampa, nei documenti e nelle intestazioni del gestionale.</p><div class="pms162-logo-actions"><button type="button" class="secondary-button" data-pms162-logo-file>Scegli file logo</button><button type="button" class="secondary-button" data-pms162-logo-clear>Rimuovi logo</button></div><input id="pms162-logo-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden><input name="logoUrl" value="' + esc(setting("logoUrl")) + '" placeholder="URL logo o file caricato"></div><div class="pms162-logo-preview" id="pms162-logo-preview">' + logoPreview() + '</div></section>' +
        '<section class="pms162-panel"><div class="pms162-panel-head"><span>Azienda</span><h4>Dati principali</h4></div><div class="pms162-grid">' +
          field("Nome commerciale", "companyName") +
          field("Ragione sociale", "legalName") +
          field("VAT / CUI", "vat") +
          field("Registro / Nr. ordine", "registryNumber") +
          field("Email aziendale", "email", "email") +
          field("PEC / Email amministrativa", "pecEmail", "email") +
          field("Telefono", "phone") +
          field("Sito web", "website") +
          field("Indirizzo", "address", "textarea") +
          field("Note intestazione documenti", "letterheadNotes", "textarea") +
        '</div></section>' +
        '<section class="pms162-panel"><div class="pms162-panel-head"><span>Fatturazione</span><h4>Numerazione e dati fiscali</h4></div><div class="pms162-grid">' +
          field("Serie fattura", "invoiceSeries") +
          field("Prossimo numero fattura", "nextInvoiceNumber", "number") +
          field("Valuta default", "defaultCurrency", "select", ["EUR","RON","USD","GBP"]) +
          field("Lingua default", "defaultLanguage", "select", ["IT","RO","EN","AR"]) +
          field("Banca", "bankName") +
          field("IBAN", "iban") +
          field("SWIFT / BIC", "swift") +
          field("Termini pagamento default", "defaultPaymentTerms") +
        '</div></section>' +
        '<section class="pms162-panel"><div class="pms162-panel-head"><span>Contatti operativi</span><h4>Riferimenti utili</h4></div><div class="pms162-grid">' +
          field("Commercialista", "accountantName") +
          field("Email commercialista", "accountantEmail", "email") +
          field("Responsabile operativo", "operationsManager") +
          field("Email ufficio", "officeEmail", "email") +
        '</div></section>' +
      '</form>' +
      '<section class="pms162-panel pms162-backup"><div><span>Backup</span><h4>Importa / esporta dati</h4><p>Un solo punto pulito per salvare o ripristinare il gestionale.</p></div><div class="pms162-backup-actions"><button type="button" class="primary-button" data-pms162-export>Esporta backup JSON</button><button type="button" class="secondary-button" data-pms162-import-click>Importa backup JSON</button><input type="file" accept="application/json,.json" data-pms162-import-file hidden></div></section>' +
    '</div>';
  }

  function saveSettings(){
    const form = document.getElementById("pms162-settings-form");
    if (!form) return;
    const data = Object.fromEntries(new FormData(form).entries());
    state.settings = Object.assign({}, st().settings, data);
    saveNow();
    updateFooter();
    if (typeof renderNav === "function") renderNav();
    if (typeof render === "function") render();
    alert("Impostazioni salvate.");
  }
  function exportBackup(){
    if (typeof window.exportBackup === "function") return window.exportBackup();
    const blob = new Blob([JSON.stringify(st(), null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "parmitalia-backup-" + today() + ".json";
    document.body.appendChild(link);
    link.click();
    setTimeout(function(){ URL.revokeObjectURL(url); link.remove(); }, 250);
  }
  function importBackupFile(file){
    if (!file) return;
    if (typeof window.importBackup === "function") return window.importBackup(file);
    const reader = new FileReader();
    reader.onload = function(){
      try {
        const parsed = JSON.parse(reader.result);
        if (typeof normalizeState === "function") window.state = normalizeState(parsed);
        else window.state = parsed;
        saveNow();
        if (typeof renderNav === "function") renderNav();
        if (typeof render === "function") render();
        alert("Backup importato correttamente.");
      } catch(error) {
        alert("File backup non valido.");
      }
    };
    reader.readAsText(file);
  }
  function bindLogo(){
    const file = document.getElementById("pms162-logo-input");
    const choose = document.querySelector("[data-pms162-logo-file]");
    const clear = document.querySelector("[data-pms162-logo-clear]");
    const form = document.getElementById("pms162-settings-form");
    const url = form && form.elements.logoUrl;
    const preview = document.getElementById("pms162-logo-preview");
    if (choose && file) choose.onclick = function(){ file.click(); };
    if (clear && url) clear.onclick = function(){
      url.value = "";
      if (preview) preview.innerHTML = "<strong>P</strong><span>Logo</span>";
    };
    if (file && url) file.onchange = function(){
      const selected = file.files && file.files[0];
      if (!selected) return;
      if (!/^image\//.test(selected.type || "")) {
        alert("Seleziona un file immagine per il logo.");
        file.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function(){
        url.value = String(reader.result || "");
        if (preview) preview.innerHTML = '<img src="' + esc(url.value) + '" alt="Logo Parmitalia">';
      };
      reader.readAsDataURL(selected);
    };
  }
  function bindSettings(){
    document.querySelector("[data-pms162-save]")?.addEventListener("click", saveSettings);
    document.querySelector("[data-pms162-export]")?.addEventListener("click", exportBackup);
    document.querySelector("[data-pms162-import-click]")?.addEventListener("click", function(){
      document.querySelector("[data-pms162-import-file]")?.click();
    });
    document.querySelector("[data-pms162-import-file]")?.addEventListener("change", function(event){
      importBackupFile(event.target.files && event.target.files[0]);
      event.target.value = "";
    });
    bindLogo();
  }

  function injectCss(){
    let style = document.getElementById("pms-v162-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v162-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      .sidebar-footer span,#current-user{display:none!important}
      .sidebar-footer{gap:0!important;padding-top:10px!important}
      .pms162-settings{display:grid;gap:14px;color:#1f2933}
      .pms162-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;background:linear-gradient(90deg,#1f6f43 0%,#ffffff 52%,#9f1d2b 100%);border:1px solid #dfe5ea;border-radius:8px;padding:16px 18px;box-shadow:0 5px 18px rgba(30,45,60,.06)}
      .pms162-hero span,.pms162-panel-head span,.pms162-backup span{display:block;font-size:11px;font-weight:950;text-transform:uppercase;color:#1f4e78}
      .pms162-hero h3,.pms162-panel h4{margin:2px 0 4px;color:#17242b;text-transform:uppercase;letter-spacing:0}
      .pms162-hero p,.pms162-panel p{margin:0;color:#445565;font-size:12px;line-height:1.45}
      .pms162-hero button,.pms162-backup-actions button,.pms162-logo-actions button{width:auto!important;margin:0!important}
      .pms162-panel{background:#fff;border:1px solid #dfe5ea;border-radius:8px;padding:14px;box-shadow:0 3px 12px rgba(30,45,60,.045)}
      .pms162-panel-head{margin-bottom:10px}
      .pms162-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
      .pms162-grid label,.pms162-logo-panel label{display:grid;gap:5px;font-size:12px;font-weight:900;color:#5e6b77}
      .pms162-grid label.wide{grid-column:1/-1}
      .pms162-grid input,.pms162-grid select,.pms162-grid textarea,.pms162-logo-panel input{width:100%;min-width:0}
      .pms162-grid textarea{min-height:82px}
      .pms162-logo-panel{display:grid;grid-template-columns:minmax(0,1fr) 170px;gap:16px;align-items:center}
      .pms162-logo-actions,.pms162-backup-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
      .pms162-logo-preview{width:150px;height:104px;border:1px dashed #cfd8df;border-radius:8px;background:#f8fafc;display:grid;place-items:center;overflow:hidden;color:#1f4e78;font-weight:950}
      .pms162-logo-preview img{max-width:100%;max-height:100%;object-fit:contain}
      .pms162-logo-preview strong{font-size:32px}
      .pms162-logo-preview span{font-size:11px;color:#6b7682}
      .pms162-backup{display:flex;align-items:center;justify-content:space-between;gap:16px}
      @media(max-width:860px){.pms162-hero,.pms162-backup,.pms162-logo-panel{display:grid}.pms162-grid{grid-template-columns:1fr}.pms162-logo-preview{width:100%;max-width:220px}}
    `;
  }

  function updateModule(){
    if (!Array.isArray(window.modules)) return;
    const module = modules.find(function(item){ return item.id === PAGE; });
    if (module) {
      module.label = "Impostazioni";
      module.subtitle = "Logo, dati aziendali, fatturazione e backup";
      module.roles = Array.from(new Set(arr(module.roles).concat(["admin"])));
    }
  }
  function updateFooter(){
    document.querySelectorAll(".sidebar-footer span,#current-user").forEach(function(node){
      node.textContent = "";
      node.style.display = "none";
    });
  }
  function renderSettingsPage(){
    const content = document.getElementById("content");
    if (!content) return false;
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = "Impostazioni";
    if (subtitle) subtitle.textContent = "Logo, dati aziendali, fatturazione e backup";
    content.innerHTML = renderSettings();
    bindSettings();
    updateFooter();
    return true;
  }
  function afterRender(){
    st();
    injectCss();
    updateModule();
    updateFooter();
    if (window.current && current.page === PAGE) bindSettings();
  }

  function init(){
    st();
    injectCss();
    updateModule();
    updateFooter();
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !render.__pms162Wrapped) {
      render = function(){
        st();
        injectCss();
        updateModule();
        if (window.current && current.page === PAGE) return renderSettingsPage();
        const result = baseRender.apply(this, arguments);
        setTimeout(afterRender, 30);
        setTimeout(afterRender, 180);
        return result;
      };
      render.__pms162Wrapped = true;
    }
    const baseNav = typeof renderNav === "function" ? renderNav : null;
    if (baseNav && !renderNav.__pms162Wrapped) {
      renderNav = function(){
        updateModule();
        const result = baseNav.apply(this, arguments);
        setTimeout(function(){ updateModule(); updateFooter(); }, 20);
        return result;
      };
      renderNav.__pms162Wrapped = true;
    }
    [80, 300, 900, 1800].forEach(function(ms){ setTimeout(afterRender, ms); });
    setInterval(afterRender, 2200);
    try { if (typeof renderNav === "function") renderNav(); if (typeof render === "function") render(); } catch(error) { console.warn(VERSION, error); }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
  window.pmsV162 = {version:VERSION};
  console.info(VERSION + " loaded");
})();
