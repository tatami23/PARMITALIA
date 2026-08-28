(function(){
  "use strict";

  const VERSION = "PMS-V137-RECOVERY-MENU-PRINT-BACKUP-COLORS";
  const LANGS = [
    {code:"IT", label:"Italiano"},
    {code:"EN", label:"English"},
    {code:"RO", label:"Romana"},
    {code:"AR", label:"Arabic"}
  ];
  const TR = {
    IT:{
      operativo:"Gestione operativa", subtitle:"Calendario settimanale carichi", printLang:"Lingua stampa",
      appLang:"Lingua gestionale", print:"Stampa", printAll:"Stampa tutto", general:"Riepilogo generale",
      backupOk:"Backup JSON esportato.", importOk:"Backup JSON importato.", resetAsk:"Vuoi davvero resettare tutti i dati del gestionale?",
      resetOk:"Dati resettati. Ricarico il gestionale.", chooseFile:"Seleziona un file JSON di backup valido."
    },
    EN:{
      operativo:"Operations", subtitle:"Weekly loading calendar", printLang:"Print language",
      appLang:"App language", print:"Print", printAll:"Print all", general:"General summary",
      backupOk:"JSON backup exported.", importOk:"JSON backup imported.", resetAsk:"Do you really want to reset all management data?",
      resetOk:"Data reset. Reloading the app.", chooseFile:"Select a valid JSON backup file."
    },
    RO:{
      operativo:"Gestiune operationala", subtitle:"Calendar saptamanal incarcari", printLang:"Limba printare",
      appLang:"Limba aplicatie", print:"Printeaza", printAll:"Printeaza tot", general:"Rezumat general",
      backupOk:"Backup JSON exportat.", importOk:"Backup JSON importat.", resetAsk:"Sigur vrei sa resetezi toate datele aplicatiei?",
      resetOk:"Date resetate. Reincarc aplicatia.", chooseFile:"Selecteaza un fisier JSON de backup valid."
    },
    AR:{
      operativo:"\u0627\u0644\u0627\u062f\u0627\u0631\u0629 \u0627\u0644\u062a\u0634\u063a\u064a\u0644\u064a\u0629", subtitle:"\u062a\u0642\u0648\u064a\u0645 \u0627\u0644\u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0627\u0633\u0628\u0648\u0639\u064a", printLang:"\u0644\u063a\u0629 \u0627\u0644\u0637\u0628\u0627\u0639\u0629",
      appLang:"\u0644\u063a\u0629 \u0627\u0644\u0646\u0638\u0627\u0645", print:"\u0637\u0628\u0627\u0639\u0629", printAll:"\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0643\u0644", general:"\u0645\u0644\u062e\u0635 \u0639\u0627\u0645",
      backupOk:"\u062a\u0645 \u062a\u0635\u062f\u064a\u0631 \u0646\u0633\u062e\u0629 JSON.", importOk:"\u062a\u0645 \u0627\u0633\u062a\u064a\u0631\u0627\u062f \u0646\u0633\u062e\u0629 JSON.", resetAsk:"\u0647\u0644 \u062a\u0631\u064a\u062f \u062d\u0642\u0627 \u0627\u0639\u0627\u062f\u0629 \u0636\u0628\u0637 \u0643\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a\u061f",
      resetOk:"\u062a\u0645\u062a \u0627\u0639\u0627\u062f\u0629 \u0627\u0644\u0636\u0628\u0637.", chooseFile:"\u0627\u062e\u062a\u0631 \u0645\u0644\u0641 JSON \u0635\u0627\u0644\u062d."
    }
  };

  function st(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function lang(kind){
    const s = st().settings;
    const code = kind === "print" ? (s.printLanguage || s.appLanguage) : s.appLanguage;
    return LANGS.some(l => l.code === code) ? code : "IT";
  }
  function tx(key, code){
    return (TR[code || lang()] || TR.IT)[key] || TR.IT[key] || key;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function saveLocal(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
    } catch(error) {
      console.warn(VERSION + " save failed", error);
    }
  }
  function optionHtml(selected){
    return LANGS.map(item => '<option value="' + item.code + '"' + (item.code === selected ? " selected" : "") + ">" + item.label + "</option>").join("");
  }

  function injectCss(){
    let style = document.getElementById("pms-v137-recovery-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v137-recovery-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      :root{
        --primary:#566879!important;--primary-dark:#485969!important;--secondary:#87929c!important;
        --success:#667b70!important;--danger:#9b6b67!important;--warning:#9a855e!important;
        --bg:#f7f8f9!important;--card:#ffffff!important;--line:#e1e6ea!important;--muted:#6d7780!important;
        --theme-primary:#566879!important;--theme-primary-dark:#485969!important;--theme-primary-deep:#3e4d5a!important;
        --theme-secondary:#87929c!important;--theme-bg:#f7f8f9!important;--theme-soft:#f5f7f8!important;
        --theme-soft-2:#edf1f3!important;--theme-line:#e1e6ea!important;--theme-line-strong:#ccd5dc!important;
        --theme-shadow:rgba(32,45,58,.045)!important;
      }
      body{background:#f7f8f9!important;color:#202a33!important;font-family:Arial,Helvetica,sans-serif!important;text-transform:uppercase;letter-spacing:0!important}
      body input,body textarea,body select,body button{font-family:Arial,Helvetica,sans-serif!important;letter-spacing:0!important}
      body .sidebar,body.pms108-bottom-menu .sidebar,body.pms113-left-globe .sidebar{
        background:#f0f4f6!important;border-color:#dce4e9!important;box-shadow:0 6px 18px rgba(32,45,58,.06)!important;color:#253240!important;
      }
      body .sidebar *,body .nav-button{color:#253240!important;text-shadow:none!important}
      body .nav-button,body.pms108-bottom-menu .nav-button{
        background:#fbfcfd!important;border:1px solid #dfe6eb!important;box-shadow:none!important;border-radius:7px!important;
      }
      body .nav-button.active,body .nav-button:hover,body.pms108-bottom-menu .nav-button.active,body.pms108-bottom-menu .nav-button:hover{
        background:#e8eef2!important;border-color:#cbd6de!important;color:#1f2b36!important;
      }
      body .primary-button,body button.primary-button{background:#5b6e80!important;border-color:#5b6e80!important;color:#fff!important}
      body .primary-button:hover,body button.primary-button:hover{background:#4d5f70!important;border-color:#4d5f70!important}
      body .secondary-button,body .inline-button,body .import-label,body .folder-tab{
        background:#f7f9fa!important;border-color:#d7e0e6!important;color:#334354!important;border-radius:6px!important;
      }
      body .secondary-button:hover,body .inline-button:hover,body .folder-tab.active{
        background:#e9eef2!important;border-color:#c7d2da!important;color:#263442!important;
      }
      body .card,body .table-wrap,body [class*="-panel"],body [class*="-box"],body .modal-card{
        border-color:#e1e6ea!important;box-shadow:0 2px 10px rgba(32,45,58,.04)!important;border-radius:8px!important;
      }
      body th,body .table-wrap th{background:#f0f4f6!important;color:#34475a!important}
      body [class*="-hero"],body .section-header,body [class*="-summary"],body [class*="-band"]{
        background:#fbfcfd!important;border-color:#e1e6ea!important;border-left-color:#aab7c2!important;box-shadow:none!important;color:#263442!important;
      }
      .pms137-lang-line{display:inline-flex;align-items:center;gap:6px;margin:2px 0}
      .pms137-lang-line label{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;color:#61707e;margin:0}
      .pms137-lang-line select{width:auto!important;min-width:84px;height:30px;padding:3px 6px!important}
      .pms137-print-wrap{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap;margin:2px 4px 2px 0}
      .pms137-print-wrap select{width:auto!important;min-width:74px;height:30px;padding:3px 6px!important}
      body.pms108-bottom-menu .pms106-hub{width:52px!important;height:52px!important}
      body.pms108-bottom-menu .pms106-globe,body.pms113-left-globe .pms109-world{width:50px!important;height:50px!important;box-shadow:0 0 0 1px #d8e1e7,inset -6px -8px 14px rgba(52,65,80,.14)!important}
      @media print{
        #print-root .print-document{font-family:Arial,Helvetica,sans-serif!important;color:#111827!important;text-transform:uppercase!important}
        #print-root th{background:#f0f4f6!important;color:#34475a!important}
      }
    `;
  }

  function ensureOperativo(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    let mod = modules.find(m => m.id === "operativo");
    if (!mod) {
      const after = modules.findIndex(m => m.id === "dashboard");
      mod = {id:"operativo", label:tx("operativo"), subtitle:tx("subtitle"), roles:["admin","assistant","accountant","agent"]};
      modules.splice(after >= 0 ? after + 1 : modules.length, 0, mod);
    }
    mod.label = tx("operativo");
    mod.subtitle = tx("subtitle");
    mod.roles = Array.from(new Set([].concat(mod.roles || [], ["admin","assistant","accountant","agent"])));
  }

  function setLang(code, kind){
    if (!LANGS.some(item => item.code === code)) return;
    const s = st().settings;
    if (kind === "print") s.printLanguage = code;
    else s.appLanguage = code;
    if (!s.printLanguage) s.printLanguage = s.appLanguage || "IT";
    saveLocal();
    document.querySelectorAll(".pms137-print-lang,.pms135-print-lang,#pms134-print-lang,#pms136-print-lang").forEach(el => { el.value = lang("print"); });
    document.querySelectorAll("#pms137-app-lang,#pms134-app-lang").forEach(el => { el.value = lang(); });
    document.documentElement.dir = lang() === "AR" ? "rtl" : "ltr";
  }

  function ensureTopLanguageControls(){
    const actions = document.querySelector(".topbar-actions");
    if (!actions || document.getElementById("pms137-lang-line")) return;
    const wrap = document.createElement("div");
    wrap.id = "pms137-lang-line";
    wrap.className = "pms137-lang-line";
    wrap.innerHTML = '<label>' + esc(tx("appLang")) + '<select id="pms137-app-lang">' + optionHtml(lang()) + '</select></label><label>' + esc(tx("printLang")) + '<select id="pms137-print-lang-top">' + optionHtml(lang("print")) + '</select></label>';
    actions.insertBefore(wrap, actions.firstChild);
    wrap.querySelector("#pms137-app-lang").onchange = event => {
      setLang(event.target.value, "app");
      ensureOperativo();
      if (typeof renderNav === "function") renderNav();
      if (typeof render === "function") render();
    };
    wrap.querySelector("#pms137-print-lang-top").onchange = event => setLang(event.target.value, "print");
  }

  function isPrintButton(button){
    if (!button || button.dataset.pms137PrintReady === "1") return false;
    if (button.closest(".pms137-print-wrap")) return false;
    const text = String(button.textContent || "");
    const attrs = button.getAttributeNames ? button.getAttributeNames().join(" ") : "";
    return /stampa|print|pdf|cliente|fornitore|intern|summary|riepilogo/i.test(text + " " + attrs);
  }
  function decoratePrintButtons(root){
    (root || document).querySelectorAll("button").forEach(button => {
      if (!isPrintButton(button)) return;
      button.dataset.pms137PrintReady = "1";
      const wrap = document.createElement("span");
      wrap.className = "pms137-print-wrap";
      const select = document.createElement("select");
      select.className = "pms137-print-lang";
      select.title = tx("printLang");
      select.innerHTML = optionHtml(lang("print"));
      select.onchange = event => setLang(event.target.value, "print");
      button.parentNode.insertBefore(wrap, button);
      wrap.appendChild(select);
      wrap.appendChild(button);
    });
  }

  function normalizePrintLanguageBeforeClick(event){
    const button = event.target && event.target.closest && event.target.closest("button");
    if (!button) return;
    const wrap = button.closest(".pms137-print-wrap,.pms135-print-control");
    const select = wrap && wrap.querySelector("select");
    if (select) setLang(select.value, "print");
  }

  const SOFT_THEMES = {
    classic:{primary:"#566879", primaryDark:"#485969", secondary:"#87929c", sidebar:"#f0f4f6", bg:"#f7f8f9", card:"#ffffff", text:"#202a33", muted:"#6d7780", line:"#e1e6ea"},
    elegant:{primary:"#5d6d76", primaryDark:"#4c5b64", secondary:"#8b948c", sidebar:"#f2f5f4", bg:"#f8f9f8", card:"#ffffff", text:"#232b2e", muted:"#707a7c", line:"#e1e7e5"},
    blue:{primary:"#5b6f82", primaryDark:"#4d6071", secondary:"#8796a3", sidebar:"#eef3f6", bg:"#f7f9fa", card:"#ffffff", text:"#21303d", muted:"#687783", line:"#dfe7ec"},
    green:{primary:"#5f7468", primaryDark:"#506258", secondary:"#8a988f", sidebar:"#f0f5f2", bg:"#f7f9f7", card:"#ffffff", text:"#24302a", muted:"#6d7871", line:"#dfe7e2"},
    violet:{primary:"#6a6478", primaryDark:"#5a5568", secondary:"#9290a0", sidebar:"#f2f1f5", bg:"#f8f7fa", card:"#ffffff", text:"#292734", muted:"#737080", line:"#e3e1ea"},
    bordeaux:{primary:"#765f64", primaryDark:"#654f54", secondary:"#97888a", sidebar:"#f5f1f2", bg:"#f9f7f7", card:"#ffffff", text:"#33282a", muted:"#7b7072", line:"#e8e0e1"}
  };
  function applySoftTheme(themeId){
    const t = SOFT_THEMES[themeId] || SOFT_THEMES.classic;
    const root = document.documentElement;
    Object.entries({
      "--primary":t.primary,
      "--primary-dark":t.primaryDark,
      "--secondary":t.secondary,
      "--bg":t.bg,
      "--card":t.card,
      "--text":t.text,
      "--muted":t.muted,
      "--line":t.line,
      "--sidebar-color":t.sidebar,
      "--theme-primary":t.primary,
      "--theme-primary-dark":t.primaryDark,
      "--theme-secondary":t.secondary,
      "--theme-bg":t.bg,
      "--theme-soft":t.bg,
      "--theme-line":t.line
    }).forEach(([key, value]) => root.style.setProperty(key, value));
    const s = st().settings;
    s.pmsThemePreset = themeId;
    s.primaryColor = t.primary;
    s.secondaryColor = t.secondary;
    s.sidebarColor = t.sidebar;
    s.backgroundColor = t.bg;
    s.cardColor = t.card;
    s.textColor = t.text;
    s.lineColor = t.line;
    saveLocal();
    document.querySelectorAll("[data-pms48-theme]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-pms48-theme") === themeId);
    });
  }

  function exportBackupJson(){
    const payload = JSON.stringify(st(), null, 2);
    const name = "parmitalia-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    const blob = new Blob([payload], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
  }
  function importBackupJson(file){
    if (!file) {
      alert(tx("chooseFile"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || "{}"));
        if (!data || typeof data !== "object") throw new Error("invalid");
        window.state = data;
        saveLocal();
        alert(tx("importOk"));
        location.reload();
      } catch(error) {
        alert(tx("chooseFile"));
      }
    };
    reader.readAsText(file);
  }
  function resetData(){
    if (!confirm(tx("resetAsk"))) return;
    try {
      if (typeof STORAGE_KEY !== "undefined") localStorage.removeItem(STORAGE_KEY);
    } catch(error) {}
    alert(tx("resetOk"));
    location.reload();
  }
  function bindBackupButtons(root){
    const scope = root || document;
    scope.querySelectorAll("button,input,label").forEach(el => {
      const text = String(el.textContent || el.value || "").toLowerCase();
      const attrs = el.getAttributeNames ? el.getAttributeNames().map(a => a + "=" + el.getAttribute(a)).join(" ").toLowerCase() : "";
      if (/export|esporta/.test(text + " " + attrs) && /backup|json/.test(text + " " + attrs)) {
        el.dataset.pms137BackupExport = "1";
      }
      if (/reset|ripristina|azzera/.test(text + " " + attrs) && /dati|data/.test(text + " " + attrs)) {
        el.dataset.pms137BackupReset = "1";
      }
    });
    scope.querySelectorAll('input[type="file"]').forEach(input => {
      const attrs = input.outerHTML.toLowerCase();
      if (/backup|json|import/.test(attrs)) input.dataset.pms137BackupImport = "1";
    });
  }
  function globalClickHandler(event){
    normalizePrintLanguageBeforeClick(event);
    const themeButton = event.target && event.target.closest && event.target.closest("[data-pms48-theme]");
    if (themeButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      applySoftTheme(themeButton.getAttribute("data-pms48-theme"));
      return;
    }
    const target = event.target && event.target.closest && event.target.closest("[data-pms137-backup-export],[data-pms137-backup-reset]");
    if (!target) return;
    if (target.dataset.pms137BackupExport === "1") {
      event.preventDefault();
      exportBackupJson();
    } else if (target.dataset.pms137BackupReset === "1") {
      event.preventDefault();
      resetData();
    }
  }
  function globalChangeHandler(event){
    const target = event.target;
    if (target && target.matches && target.matches("[data-pms137-backup-import]")) {
      importBackupJson(target.files && target.files[0]);
    } else if (target && target.matches && target.matches('input[type="file"]')) {
      const file = target.files && target.files[0];
      const page = current && current.page;
      if (file && /\.json$/i.test(file.name || "") && (page === "settings" || page === "admin")) importBackupJson(file);
    }
  }

  function renderRecoveryPrintCenter(){
    const code = lang();
    const printCode = lang("print");
    return `
      <div class="section-header">
        <h3>Print Center</h3>
        <div class="filters">
          <label>${esc(tx("printLang", code))}<select id="pms137-print-center-lang">${optionHtml(printCode)}</select></label>
          <button class="primary-button" style="width:auto;margin:0" data-pms137-print-all>${esc(tx("printAll", code))}</button>
        </div>
      </div>
      ${typeof renderPrintCenter === "function" && renderPrintCenter !== renderRecoveryPrintCenter ? renderPrintCenter() : ""}
    `;
  }

  function wrapRender(){
    if (typeof render !== "function" || render.pms137Wrapped) return;
    const baseRender = render;
    render = function(){
      ensureOperativo();
      const result = baseRender.apply(this, arguments);
      ensureTopLanguageControls();
      decoratePrintButtons(document);
      bindBackupButtons(document);
      const pcLang = document.getElementById("pms137-print-center-lang");
      if (pcLang) pcLang.onchange = event => setLang(event.target.value, "print");
      const printAll = document.querySelector("[data-pms137-print-all]");
      if (printAll) printAll.onclick = () => {
        if (typeof printSummary === "function") printSummary("dashboard");
      };
      return result;
    };
    render.pms137Wrapped = true;
  }
  function wrapRenderNav(){
    if (typeof renderNav !== "function" || renderNav.pms137Wrapped) return;
    const baseRenderNav = renderNav;
    renderNav = function(){
      ensureOperativo();
      return baseRenderNav.apply(this, arguments);
    };
    renderNav.pms137Wrapped = true;
  }
  function wrapPrintCenter(){
    if (typeof renderPrintCenter !== "function" || renderPrintCenter.pms137Wrapped) return;
    const basePrintCenter = renderPrintCenter;
    renderPrintCenter = function(){
      const code = lang();
      const printCode = lang("print");
      const base = basePrintCenter.apply(this, arguments);
      return `
        <div class="section-header">
          <h3>Print Center</h3>
          <div class="filters">
            <label>${esc(tx("printLang", code))}<select id="pms137-print-center-lang">${optionHtml(printCode)}</select></label>
          </div>
        </div>` + base;
    };
    renderPrintCenter.pms137Wrapped = true;
  }
  function wrapOpenPrint(){
    if (typeof openPrint !== "function" || openPrint.pms137Wrapped) return;
    const baseOpenPrint = openPrint;
    openPrint = function(innerHtml){
      const code = lang("print");
      const dir = code === "AR" ? "rtl" : "ltr";
      const html = String(innerHtml || "").replace(/<div class="print-document"/, '<div class="print-document" lang="' + code.toLowerCase() + '" dir="' + dir + '"');
      return baseOpenPrint.call(this, html);
    };
    openPrint.pms137Wrapped = true;
  }
  function observe(){
    const obs = new MutationObserver(mutations => {
      let touched = false;
      mutations.forEach(m => m.addedNodes && m.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          touched = true;
          decoratePrintButtons(node);
          bindBackupButtons(node);
        }
      }));
      if (touched) ensureTopLanguageControls();
    });
    obs.observe(document.body, {childList:true, subtree:true});
  }

  function init(){
    st().settings.appLanguage = lang();
    st().settings.printLanguage = lang("print");
    injectCss();
    ensureOperativo();
    wrapOpenPrint();
    wrapPrintCenter();
    wrapRenderNav();
    wrapRender();
    document.addEventListener("click", globalClickHandler, true);
    document.addEventListener("change", globalChangeHandler, true);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        ensureTopLanguageControls();
        decoratePrintButtons(document);
        bindBackupButtons(document);
        observe();
      }, {once:true});
    } else {
      ensureTopLanguageControls();
      decoratePrintButtons(document);
      bindBackupButtons(document);
      observe();
    }
    try {
      if (typeof renderNav === "function") renderNav();
      if (typeof render === "function") render();
    } catch(error) {
      console.warn(VERSION + " initial render skipped", error);
    }
    window.PMS_V137_RECOVERY = {version: VERSION};
  }

  init();
})();
