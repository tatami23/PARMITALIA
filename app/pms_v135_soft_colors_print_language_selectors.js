(function(){
  "use strict";

  const VERSION = "PMS-V135-SOFT-COLORS-PRINT-LANGUAGE-SELECTORS";
  const LANGS = [
    {code:"IT", label:"IT"},
    {code:"EN", label:"EN"},
    {code:"RO", label:"RO"},
    {code:"AR", label:"AR"}
  ];
  const PRINT_SELECTORS = [
    "[data-print-offer]",
    "[data-print-offer-external]",
    "[data-print-offer-internal]",
    "[data-print-selected-offer]",
    "[data-print-selected-offer-external]",
    "[data-print-selected-offer-internal]",
    "[data-print-order]",
    "[data-print-selected-order]",
    "[data-pms94-print-order-customer]",
    "[data-pms94-print-order-supplier]",
    "[data-pms94-print-selected-order-customer]",
    "[data-pms94-print-selected-order-supplier]",
    "[data-print-product]",
    "[data-print-selected-product]",
    "[data-pms85-print-inter]",
    "[data-pms85-print-inter-report]",
    "[data-print-summary]",
    "[data-print-preview-v20]",
    "[data-print-offer-preview-v49]"
  ];

  function appState(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }
  function currentPrintLang(){
    const code = appState().settings.printLanguage || appState().settings.appLanguage || "IT";
    return LANGS.some(item => item.code === code) ? code : "IT";
  }
  function persist(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(appState()));
    } catch(error) {
      console.warn("Lingua stampa non salvata", error);
    }
  }
  function setPrintLang(code){
    if (!LANGS.some(item => item.code === code)) return;
    appState().settings.printLanguage = code;
    persist();
    const top = document.getElementById("pms134-print-lang");
    if (top) top.value = code;
    document.querySelectorAll(".pms135-print-lang").forEach(select => { select.value = code; });
  }
  function optionHtml(selected){
    return LANGS.map(item => '<option value="' + item.code + '"' + (item.code === selected ? " selected" : "") + ">" + item.label + "</option>").join("");
  }
  function printTargetKey(button){
    for (const attr of button.getAttributeNames()) {
      if (attr.indexOf("data-") === 0 && /print/i.test(attr)) return attr + ":" + (button.getAttribute(attr) || "");
    }
    return button.textContent || "print";
  }
  function shouldDecorate(button){
    if (!button || button.dataset.pms135LangReady === "1") return false;
    if (button.closest(".pms135-print-control")) return false;
    const text = String(button.textContent || "");
    const attrs = button.getAttributeNames().join(" ");
    return /print|stampa|pdf|cliente|fornitore|interna/i.test(text + " " + attrs);
  }
  function decorateButton(button){
    if (!shouldDecorate(button)) return;
    button.dataset.pms135LangReady = "1";
    const wrapper = document.createElement("span");
    wrapper.className = "pms135-print-control";
    wrapper.dataset.pms135Target = printTargetKey(button);
    const select = document.createElement("select");
    select.className = "pms135-print-lang";
    select.title = "Lingua stampa";
    select.innerHTML = optionHtml(currentPrintLang());
    select.onchange = () => setPrintLang(select.value);
    button.parentNode.insertBefore(wrapper, button);
    wrapper.appendChild(select);
    wrapper.appendChild(button);
  }
  function decoratePrintLanguageSelectors(){
    PRINT_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(decorateButton);
    });
    document.querySelectorAll(".print-actions button,.preview-actions-v20 button,.preview-actions-v49 button,.pms94-order-print-actions button,.pms85-action-cell button").forEach(button => {
      if (/stampa|print|pdf|cliente|fornitore|interna/i.test(button.textContent || "")) decorateButton(button);
    });
  }
  function syncLangFromClick(event){
    const button = event.target && event.target.closest && event.target.closest(PRINT_SELECTORS.join(","));
    if (!button) return;
    const control = button.closest(".pms135-print-control");
    const selected = control && control.querySelector(".pms135-print-lang");
    if (selected) setPrintLang(selected.value);
  }

  function injectCss(){
    let style = document.getElementById("pms-v135-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v135-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      :root{
        --primary:#4b5f73!important;
        --primary-dark:#3e5164!important;
        --secondary:#7d8b99!important;
        --success:#4f6f62!important;
        --bg:#f7f8fa!important;
        --card:#ffffff!important;
        --line:#dfe5ea!important;
        --muted:#6b7682!important;
        --theme-primary:#4b5f73!important;
        --theme-primary-dark:#3e5164!important;
        --theme-primary-deep:#364757!important;
        --theme-secondary:#7d8b99!important;
        --theme-bg:#f7f8fa!important;
        --theme-soft:#f5f7f9!important;
        --theme-soft-2:#edf1f4!important;
        --theme-line:#dfe5ea!important;
        --theme-line-strong:#cbd4dc!important;
        --theme-secondary-soft:#eef2f4!important;
        --theme-secondary-line:#cfd8df!important;
        --theme-shadow:rgba(30,45,60,.055)!important;
      }
      body{
        background:#f7f8fa!important;
        color:#1f2933!important;
      }
      body .sidebar,
      body .app-sidebar,
      body.pms106-ui .sidebar,
      body.pms108-bottom-menu .sidebar,
      body.pms113-left-globe .sidebar{
        background:#eef3f6!important;
        color:#243241!important;
        border:1px solid #d7e0e7!important;
        box-shadow:0 8px 22px rgba(30,45,60,.08)!important;
      }
      body .sidebar *,
      body .nav-button,
      body .sidebar-footer span,
      body .sidebar-brand strong,
      body .sidebar-brand span{
        color:#263545!important;
        text-shadow:none!important;
      }
      body .nav-button,
      body.pms108-bottom-menu .nav-button{
        background:#f8fafb!important;
        border:1px solid #dbe3e9!important;
        box-shadow:none!important;
      }
      body .nav-button:hover,
      body .nav-button.active,
      body.pms106-ui .nav-button:hover,
      body.pms106-ui .nav-button.active,
      body.pms108-bottom-menu .nav-button:hover,
      body.pms108-bottom-menu .nav-button.active{
        background:#e3ebf0!important;
        border-color:#c8d4dd!important;
        color:#1f2d3a!important;
      }
      body.pms108-bottom-menu .sidebar{
        min-height:98px!important;
        padding:9px 12px!important;
        border-radius:10px!important;
      }
      body.pms108-bottom-menu .app{padding-bottom:114px!important}
      body.pms108-bottom-menu .pms106-hub{width:58px!important;height:58px!important}
      body.pms108-bottom-menu .pms106-globe,
      body.pms113-left-globe .pms109-world{
        width:54px!important;
        height:54px!important;
        background:radial-gradient(circle at 34% 28%,#ffffff 0,#e6eef3 22%,#aebdcc 58%,#6e7f90 100%)!important;
        box-shadow:0 0 0 1px #d8e1e8, inset -8px -10px 18px rgba(52,65,80,.18)!important;
      }
      body.pms108-bottom-menu .pms106-orbit,
      body.pms113-left-globe .pms109-logo-orbit{
        opacity:.35!important;
      }
      body.pms108-bottom-menu .pms106-orbit i:nth-child(1){transform:rotate(18deg) translateX(29px)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(2){transform:rotate(92deg) translateX(28px)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(3){transform:rotate(176deg) translateX(29px)!important}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(4){transform:rotate(264deg) translateX(27px)!important}
      body.pms113-left-globe .pms113-led-sign{
        background:#f8fafb!important;
        border:1px solid #dbe3e9!important;
        box-shadow:none!important;
        color:#263545!important;
        font-size:9.5px!important;
      }
      body.pms108-bottom-menu .pms106-wheel{display:none!important}
      body.pms108-bottom-menu #nav{max-height:78px!important;gap:6px!important}
      body.pms108-bottom-menu .nav-button{
        flex-basis:118px!important;
        width:118px!important;
        min-height:56px!important;
        max-height:60px!important;
        padding:6px 7px!important;
        font-size:10px!important;
      }
      body .topbar,
      body.device-desktop .topbar,
      body.device-tablet .topbar,
      body.device-phone .topbar{
        background:#ffffff!important;
        border-bottom:1px solid #dfe5ea!important;
        box-shadow:0 4px 14px rgba(30,45,60,.045)!important;
      }
      body .topbar::before{background:#dfe5ea!important;height:1px!important}
      body [class*="-hero"],
      body .section-header,
      body [class*="-summary"],
      body [class*="-band"],
      body .database-note,
      body .preview-box{
        background:#fbfcfd!important;
        border-color:#dfe5ea!important;
        border-left-color:#c4ced7!important;
        box-shadow:none!important;
      }
      body .card,
      body .table-wrap,
      body [class*="-panel"],
      body [class*="-widget"],
      body [class*="-box"],
      body .modal-card{
        background:#ffffff!important;
        border-color:#dfe5ea!important;
        box-shadow:0 3px 12px rgba(30,45,60,.045)!important;
      }
      body .primary-button,
      body button.primary-button,
      body input[type="submit"].primary-button{
        background:#51677b!important;
        border-color:#51677b!important;
        color:#fff!important;
      }
      body .primary-button:hover,
      body button.primary-button:hover{
        background:#46596b!important;
        border-color:#46596b!important;
      }
      body .secondary-button,
      body .import-label,
      body .inline-button,
      body .folder-tab,
      body [class*="-tab"],
      body [class*="-modes"] button{
        background:#f7f9fa!important;
        border-color:#d6dee5!important;
        color:#344456!important;
        box-shadow:none!important;
      }
      body .secondary-button:hover,
      body .inline-button:hover,
      body .folder-tab.active,
      body [class*="-tab"].active,
      body [class*="-modes"] button.active{
        background:#e9eef2!important;
        border-color:#c6d0d9!important;
        color:#263545!important;
      }
      body th,
      body .table-wrap th,
      body [class*="-table"] th{
        background:#f4f6f8!important;
        color:#344456!important;
        border-color:#dfe5ea!important;
      }
      body tr:hover td{background:#fafbfc!important}
      body input,
      body select,
      body textarea{
        background:#fff!important;
        border-color:#d6dee5!important;
        color:#1f2933!important;
      }
      body input:focus,
      body select:focus,
      body textarea:focus{
        border-color:#9fb0bf!important;
        box-shadow:0 0 0 3px rgba(159,176,191,.18)!important;
      }
      body .badge,
      body [class*="-badge"],
      body [class*="-chip"],
      body .filter-pill{
        background:#f1f4f6!important;
        border-color:#d8e0e7!important;
        color:#3d4d5d!important;
      }
      .pms135-print-control{
        display:inline-flex;
        align-items:center;
        gap:5px;
        flex-wrap:nowrap;
        margin:2px 4px 2px 0;
        vertical-align:middle;
      }
      .pms135-print-control .pms135-print-lang{
        width:auto!important;
        min-width:48px!important;
        height:29px!important;
        padding:3px 5px!important;
        margin:0!important;
        font-size:10px!important;
        font-weight:800!important;
        border-radius:5px!important;
        background:#fff!important;
        border:1px solid #cfd8df!important;
        color:#344456!important;
      }
      .pms135-print-control button{
        margin:0!important;
      }
      #print-root .print-document{
        background:#fff!important;
        color:#111827!important;
        font-family:Arial,Helvetica,sans-serif!important;
      }
      #print-root .print-header{
        border-bottom:1pt solid #9aa7b3!important;
      }
      #print-root .print-header h1{
        color:#344456!important;
      }
      #print-root .print-table th,
      #print-root th{
        background:#f8f9fa!important;
        color:#344456!important;
        border-color:#d7dee5!important;
      }
      #print-root .print-table td,
      #print-root td{
        border-color:#e1e6eb!important;
      }
      #print-root .print-footer{
        border-color:#d7dee5!important;
        color:#64717d!important;
      }
      #print-root .print-mode-badge,
      #print-root .approval-banner,
      #print-root .pms94-print-note,
      #print-root .pms114-reserved{
        background:#f8f9fa!important;
        border-color:#d7dee5!important;
        color:#344456!important;
      }
      @media print{
        #print-root .print-table th,
        #print-root th{
          background:#f8f9fa!important;
          color:#344456!important;
          -webkit-print-color-adjust:exact;
          print-color-adjust:exact;
        }
      }
    `;
  }

  function refresh(){
    appState();
    injectCss();
    decoratePrintLanguageSelectors();
  }

  function wrapRender(){
    const baseRender = typeof render === "function" ? render : null;
    if (baseRender && !baseRender.__pms135Wrapped) {
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      render.__pms135Wrapped = true;
    }
    const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
    if (baseBind && !baseBind.__pms135Wrapped) {
      bindPageActions = function(){
        const result = baseBind.apply(this, arguments);
        setTimeout(refresh, 20);
        return result;
      };
      bindPageActions.__pms135Wrapped = true;
    }
  }

  document.addEventListener("click", syncLangFromClick, true);
  document.addEventListener("change", event => {
    if (event.target && event.target.classList && event.target.classList.contains("pms135-print-lang")) setPrintLang(event.target.value);
  }, true);

  wrapRender();
  refresh();
  setTimeout(refresh, 250);
  setTimeout(refresh, 1000);
  window.pmsV135SoftColorsPrintLanguageSelectors = {version:VERSION, refresh};
})();
