(function(){
  "use strict";

  const VERSION = "PMS-V133-REFINED-UNIFORM-THEME";

  function appState(){
    try {
      if (typeof state !== "undefined" && state && typeof state === "object") return state;
    } catch(e) {}
    window.state = window.state || {};
    return window.state;
  }

  function hexRgb(hex){
    const clean = String(hex || "#1f4e78").replace("#","");
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return {r:31,g:78,b:120};
    const n = parseInt(clean, 16);
    return {r:(n >> 16) & 255, g:(n >> 8) & 255, b:n & 255};
  }

  function rgba(hex, alpha){
    const c = hexRgb(hex);
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha + ")";
  }

  function darken(hex, factor){
    const c = hexRgb(hex);
    return "#" + [c.r,c.g,c.b].map(v => Math.max(0, Math.round(v * factor)).toString(16).padStart(2,"0")).join("");
  }

  function applyVars(){
    const s = appState();
    s.settings = s.settings || {};
    const primary = s.settings.pms129Primary || s.settings.primaryColor || "#1f4e78";
    const secondary = s.settings.pms129Secondary || s.settings.secondaryColor || "#0f766e";
    const primaryDark = darken(primary, .72);
    const primaryDeep = darken(primary, .52);
    const secondaryDark = darken(secondary, .76);
    const root = document.documentElement;

    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-dark", primaryDark);
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--success", secondaryDark);
    root.style.setProperty("--bg", rgba(primary, .035));
    root.style.setProperty("--card", "#ffffff");
    root.style.setProperty("--line", rgba(primary, .18));
    root.style.setProperty("--muted", "#5d6b7f");
    root.style.setProperty("--theme-primary", primary);
    root.style.setProperty("--theme-primary-dark", primaryDark);
    root.style.setProperty("--theme-primary-deep", primaryDeep);
    root.style.setProperty("--theme-secondary", secondary);
    root.style.setProperty("--theme-secondary-dark", secondaryDark);
    root.style.setProperty("--theme-bg", rgba(primary, .035));
    root.style.setProperty("--theme-soft", rgba(primary, .055));
    root.style.setProperty("--theme-soft-2", rgba(primary, .09));
    root.style.setProperty("--theme-line", rgba(primary, .20));
    root.style.setProperty("--theme-line-strong", rgba(primary, .34));
    root.style.setProperty("--theme-secondary-soft", rgba(secondary, .10));
    root.style.setProperty("--theme-secondary-line", rgba(secondary, .28));
    root.style.setProperty("--theme-shadow", rgba(primary, .11));
  }

  function injectCss(){
    const oldHeavy = document.getElementById("pms-v132-uniform-theme-style");
    if (oldHeavy) oldHeavy.textContent = "";

    let style = document.getElementById("pms-v133-refined-theme-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v133-refined-theme-style";
      document.head.appendChild(style);
    }

    style.textContent = `
      body{
        background:var(--theme-bg)!important;
        color:var(--text)!important;
      }
      body .main,
      body .content,
      body #content{
        background:transparent!important;
      }
      body .sidebar,
      body .app-sidebar,
      body.device-phone .sidebar,
      body.device-tablet .sidebar,
      body.pms106-ui .sidebar,
      body.pms108-bottom-menu .sidebar{
        background:linear-gradient(180deg,var(--theme-primary-deep) 0%,var(--theme-primary-dark) 52%,var(--theme-primary) 100%)!important;
        color:#fff!important;
        border-color:var(--theme-secondary-line)!important;
        box-shadow:0 14px 32px var(--theme-shadow)!important;
      }
      body.pms108-bottom-menu .sidebar{
        background:linear-gradient(90deg,var(--theme-primary-deep) 0%,var(--theme-primary-dark) 58%,var(--theme-primary) 100%)!important;
      }
      body .sidebar *,
      body .nav-button{
        color:rgba(255,255,255,.88)!important;
      }
      body .nav-button:hover,
      body .nav-button.active,
      body.pms106-ui .nav-button:hover,
      body.pms106-ui .nav-button.active,
      body.pms108-bottom-menu .nav-button:hover,
      body.pms108-bottom-menu .nav-button.active{
        background:rgba(255,255,255,.16)!important;
        border-color:rgba(255,255,255,.26)!important;
        color:#fff!important;
      }
      body .topbar,
      body.device-desktop .topbar,
      body.device-tablet .topbar,
      body.device-phone .topbar{
        background:rgba(255,255,255,.96)!important;
        border-bottom:3px solid var(--theme-secondary)!important;
        box-shadow:0 8px 20px var(--theme-shadow)!important;
      }
      body .topbar::before{
        content:"";
        display:block;
        position:absolute;
        left:0;
        right:0;
        top:0;
        height:3px;
        background:linear-gradient(90deg,var(--theme-primary),var(--theme-secondary));
      }
      body .topbar h1,
      body .topbar h2,
      body #page-title,
      body .section-header h3,
      body .card h3,
      body .card h4,
      body .modal-header h3,
      body [class*="-panel"] h3,
      body [class*="-panel"] h4{
        color:var(--theme-primary)!important;
      }
      body .topbar p,
      body #page-subtitle,
      body .kpi-title,
      body .kpi-note,
      body small,
      body .database-note{
        color:var(--muted)!important;
      }
      body .card,
      body .table-wrap,
      body .database-note,
      body .preview-box,
      body .modal-card,
      body dialog,
      body [class*="-panel"],
      body [class*="-widget"],
      body [class*="-box"]{
        background:#fff!important;
        border-color:var(--theme-line)!important;
        box-shadow:0 6px 18px var(--theme-shadow)!important;
      }
      body .section-header,
      body [class*="-toolbar"],
      body [class*="-band"],
      body [class*="-summary"],
      body [class*="-status"],
      body .database-note,
      body .preview-box{
        background:linear-gradient(90deg,var(--theme-soft),rgba(255,255,255,.92))!important;
        border-color:var(--theme-line)!important;
      }
      body .section-header{
        border-left:4px solid var(--theme-primary)!important;
        border-radius:8px!important;
        padding:10px 12px!important;
      }
      body [class*="-hero"],
      body .pms89-ai-head,
      body .pms95-hero,
      body .pms105-hero,
      body .pms127-hero,
      body .pms128-hero,
      body .pms129-hero{
        background:linear-gradient(90deg,var(--theme-soft),#fff 72%)!important;
        border:1px solid var(--theme-line)!important;
        border-left:5px solid var(--theme-primary)!important;
        box-shadow:0 6px 18px var(--theme-shadow)!important;
        color:var(--text)!important;
      }
      body [class*="-hero"] *,
      body .pms89-ai-head *,
      body .pms95-hero *,
      body .pms105-hero *,
      body .pms127-hero *,
      body .pms128-hero *,
      body .pms129-hero *{
        color:inherit!important;
      }
      body [class*="-hero"] h3,
      body .pms89-ai-head h3,
      body .pms95-hero h3,
      body .pms105-hero h3,
      body .pms127-hero h3,
      body .pms128-hero h3,
      body .pms129-hero h3{
        color:var(--theme-primary)!important;
      }
      body [class*="-hero"] p,
      body [class*="-hero"] small,
      body .pms89-ai-head p,
      body .pms95-hero p,
      body .pms105-hero p,
      body .pms127-hero p,
      body .pms128-hero p,
      body .pms129-hero p,
      body .pms129-hero small{
        color:var(--muted)!important;
      }
      body .primary-button,
      body button.primary-button,
      body input[type="submit"].primary-button{
        background:var(--theme-primary)!important;
        border-color:var(--theme-primary)!important;
        color:#fff!important;
      }
      body .primary-button:hover,
      body button.primary-button:hover{
        background:var(--theme-primary-dark)!important;
        border-color:var(--theme-primary-dark)!important;
      }
      body .secondary-button,
      body .import-label,
      body .inline-button,
      body .folder-tab,
      body .pms128-tab,
      body [class*="-tab"],
      body [class*="-modes"] button{
        background:var(--theme-soft)!important;
        border-color:var(--theme-line-strong)!important;
        color:var(--theme-primary)!important;
      }
      body .secondary-button:hover,
      body .inline-button:hover,
      body .folder-tab:hover,
      body .folder-tab.active,
      body .pms128-tab.active,
      body [class*="-tab"].active,
      body [class*="-modes"] button.active{
        background:var(--theme-primary)!important;
        border-color:var(--theme-primary)!important;
        color:#fff!important;
      }
      body .danger-button,
      body .inline-danger,
      body .pms129-danger{
        background:#fff1f2!important;
        border-color:#fecdd3!important;
        color:#9f1239!important;
      }
      body th,
      body .table-wrap th,
      body [class*="-table"] th{
        background:var(--theme-soft-2)!important;
        color:var(--theme-primary-dark)!important;
        border-color:var(--theme-line)!important;
      }
      body td,
      body .table-wrap td,
      body [class*="-table"] td{
        border-color:var(--theme-line)!important;
      }
      body tr:hover td{
        background:var(--theme-soft)!important;
      }
      body input,
      body select,
      body textarea{
        background:#fff!important;
        border-color:var(--theme-line-strong)!important;
        color:var(--text)!important;
      }
      body input:focus,
      body select:focus,
      body textarea:focus{
        border-color:var(--theme-secondary)!important;
        box-shadow:0 0 0 3px var(--theme-secondary-soft)!important;
        outline:none!important;
      }
      body .kpi-value,
      body [class*="-value"],
      body [class*="-total"],
      body [class*="-score"],
      body [class*="-protocol"],
      body .pms81-kpi strong,
      body .pms85-kpi strong,
      body .pms90-commission-band strong,
      body #pms69-offer-total,
      body .pms69-line-total,
      body .pms79-preview-value,
      body .pms95-kpi{
        color:var(--theme-primary)!important;
      }
      body .badge,
      body .badge.primary,
      body [class*="-badge"],
      body [class*="-chip"],
      body .filter-pill{
        background:var(--theme-secondary-soft)!important;
        border-color:var(--theme-secondary-line)!important;
        color:var(--theme-secondary-dark)!important;
      }
      body [class*="-bar"],
      body [class*="-progress"],
      body [class*="-meter"]{
        background:var(--theme-soft)!important;
        border-color:var(--theme-line)!important;
      }
      body [class*="-bar"] span,
      body [class*="-bar"] i,
      body [class*="-progress"] span,
      body [class*="-progress"] i,
      body [class*="-meter"] span,
      body [class*="-meter"] i,
      body progress::-webkit-progress-value{
        background:linear-gradient(90deg,var(--theme-primary),var(--theme-secondary))!important;
      }
      body .modal{
        background:rgba(15,23,42,.56)!important;
        box-shadow:none!important;
      }
      body .modal-header,
      body .modal-form{
        background:#fff!important;
        border-color:var(--theme-line)!important;
      }
      body .print-header,
      body .print-footer{
        border-color:var(--theme-primary)!important;
      }
      body .print-table th{
        background:var(--theme-primary)!important;
        color:#fff!important;
      }
    `;
  }

  function refresh(){
    applyVars();
    injectCss();
  }

  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !baseRender.__pms133RefinedThemeWrapped) {
    render = function(){
      refresh();
      const result = baseRender.apply(this, arguments);
      setTimeout(refresh, 25);
      setTimeout(refresh, 150);
      return result;
    };
    render.__pms133RefinedThemeWrapped = true;
  }

  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !baseBind.__pms133RefinedThemeWrapped) {
    bindPageActions = function(){
      const result = baseBind.apply(this, arguments);
      setTimeout(refresh, 25);
      return result;
    };
    bindPageActions.__pms133RefinedThemeWrapped = true;
  }

  const baseSaveSettings = typeof saveSettings === "function" ? saveSettings : null;
  if (baseSaveSettings && !baseSaveSettings.__pms133RefinedThemeWrapped) {
    saveSettings = function(){
      const result = baseSaveSettings.apply(this, arguments);
      refresh();
      setTimeout(refresh, 120);
      return result;
    };
    saveSettings.__pms133RefinedThemeWrapped = true;
  }

  document.addEventListener("input", function(event){
    if (event.target && (event.target.id === "pms129-primary" || event.target.id === "pms129-secondary")) {
      setTimeout(refresh, 0);
      setTimeout(refresh, 80);
    }
  }, true);

  document.addEventListener("click", function(event){
    if (event.target && event.target.closest && event.target.closest("[data-pms129-preset]")) {
      setTimeout(refresh, 0);
      setTimeout(refresh, 120);
    }
  }, true);

  refresh();
  setTimeout(refresh, 120);
  setTimeout(refresh, 700);

  window.pmsV133RefinedUniformTheme = {version:VERSION, refresh};
})();
