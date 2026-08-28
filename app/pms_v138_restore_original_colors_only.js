(function(){
  "use strict";

  const VERSION = "PMS-V138-RESTORE-ORIGINAL-COLORS-ONLY";
  const ORIGINAL_THEME = {
    id: "blue",
    primary: "#1f4e78",
    primaryDark: "#173b5c",
    secondary: "#0f766e",
    sidebar: "#0f2338",
    bg: "#f4f7fb",
    card: "#ffffff",
    text: "#152033",
    muted: "#65758b",
    line: "#d9e2ef",
    danger: "#b42318",
    warning: "#b54708",
    success: "#087443",
    shadow: "0 16px 38px rgba(18, 38, 63, 0.12)",
    radius: "16px"
  };
  const ORIGINAL_PRESETS = {
    blue: {id:"blue", primary:"#1f4e78", primaryDark:"#173b5c", secondary:"#0f766e", sidebar:"#0f2338", bg:"#f4f7fb", card:"#ffffff", text:"#152033", muted:"#65758b", line:"#d9e2ef"},
    bronze: {id:"bronze", primary:"#9a6324", primaryDark:"#6f4518", secondary:"#59613a", sidebar:"#2d241d", bg:"#f7f3ee", card:"#fffaf3", text:"#211a14", muted:"#756658", line:"#e3d5c5"},
    green: {id:"green", primary:"#0f766e", primaryDark:"#115e59", secondary:"#365314", sidebar:"#102a2a", bg:"#f2f8f6", card:"#ffffff", text:"#10201f", muted:"#5d7370", line:"#d2e4df"},
    anthracite: {id:"anthracite", primary:"#334155", primaryDark:"#1f2937", secondary:"#64748b", sidebar:"#111827", bg:"#f3f4f6", card:"#ffffff", text:"#111827", muted:"#6b7280", line:"#d1d5db"},
    violet: {id:"violet", primary:"#6d28d9", primaryDark:"#4c1d95", secondary:"#2563eb", sidebar:"#24133f", bg:"#f6f3ff", card:"#ffffff", text:"#1f1633", muted:"#6b5f82", line:"#ddd3f5"},
    bordeaux: {id:"bordeaux", primary:"#9f1239", primaryDark:"#701a2e", secondary:"#92400e", sidebar:"#2f1018", bg:"#fdf2f5", card:"#ffffff", text:"#2b1218", muted:"#785b64", line:"#efd0d8"}
  };

  function stateRef(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    return state;
  }
  function saveLocal(){
    try {
      if (typeof save === "function") return save();
      if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(stateRef()));
    } catch(error) {
      console.warn(VERSION + " save skipped", error);
    }
  }
  function setVars(theme){
    const root = document.documentElement;
    const pairs = {
      "--bg": theme.bg,
      "--card": theme.card,
      "--text": theme.text,
      "--muted": theme.muted,
      "--primary": theme.primary,
      "--primary-dark": theme.primaryDark,
      "--secondary": theme.secondary,
      "--line": theme.line,
      "--danger": theme.danger || ORIGINAL_THEME.danger,
      "--warning": theme.warning || ORIGINAL_THEME.warning,
      "--success": theme.success || ORIGINAL_THEME.success,
      "--shadow": theme.shadow || ORIGINAL_THEME.shadow,
      "--radius": theme.radius || ORIGINAL_THEME.radius,
      "--sidebar-color": theme.sidebar,
      "--theme-primary": theme.primary,
      "--theme-primary-dark": theme.primaryDark,
      "--theme-primary-deep": theme.primaryDark,
      "--theme-secondary": theme.secondary,
      "--theme-bg": theme.bg,
      "--theme-soft": theme.bg,
      "--theme-soft-2": theme.line,
      "--theme-line": theme.line,
      "--theme-line-strong": theme.line,
      "--theme-shadow": "rgba(18, 38, 63, 0.12)",
      "--pms48-theme-card": theme.card
    };
    Object.entries(pairs).forEach(([key, value]) => root.style.setProperty(key, value));
  }
  function persistTheme(theme){
    const s = stateRef().settings;
    s.pmsThemePreset = theme.id || "blue";
    s.primaryColor = theme.primary;
    s.secondaryColor = theme.secondary;
    s.sidebarColor = theme.sidebar;
    s.backgroundColor = theme.bg;
    s.cardColor = theme.card;
    s.textColor = theme.text;
    s.lineColor = theme.line;
    s.pms134ThemeApplied = "";
    s.pms129ThemeName = "Blu Parmitalia";
    s.pms129Primary = theme.primary;
    s.pms129Secondary = theme.secondary;
    saveLocal();
  }
  function applyOriginalTheme(persist){
    setVars(ORIGINAL_THEME);
    if (persist) persistTheme(ORIGINAL_THEME);
    document.querySelectorAll("[data-pms48-theme]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-pms48-theme") === "blue");
    });
  }
  function applyPreset(themeId){
    const theme = ORIGINAL_PRESETS[themeId] || ORIGINAL_THEME;
    setVars(theme);
    persistTheme(theme);
    document.querySelectorAll("[data-pms48-theme]").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-pms48-theme") === theme.id);
    });
  }
  function injectRestoreCss(){
    let style = document.getElementById("pms-v138-restore-original-colors");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v138-restore-original-colors";
      document.head.appendChild(style);
    }
    style.textContent = `
      body{
        background:var(--bg)!important;
        color:var(--text)!important;
        font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
        text-transform:none!important;
      }
      body input,body textarea,body select,body button{
        font-family:inherit!important;
        text-transform:none!important;
      }
      body .sidebar,
      body.pms108-bottom-menu .sidebar,
      body.pms113-left-globe .sidebar{
        background:var(--sidebar-color,#0f2338)!important;
        color:#fff!important;
        border-color:rgba(255,255,255,.12)!important;
        box-shadow:var(--shadow)!important;
      }
      body .sidebar *,
      body .sidebar-brand strong,
      body .sidebar-brand span,
      body .sidebar-footer span{
        color:#fff!important;
      }
      body .nav-button,
      body.pms108-bottom-menu .nav-button{
        background:rgba(255,255,255,.08)!important;
        border-color:rgba(255,255,255,.12)!important;
        color:#eaf2fb!important;
        box-shadow:none!important;
        border-radius:12px!important;
      }
      body .nav-button:hover,
      body .nav-button.active,
      body.pms108-bottom-menu .nav-button:hover,
      body.pms108-bottom-menu .nav-button.active{
        background:rgba(255,255,255,.18)!important;
        border-color:rgba(255,255,255,.28)!important;
        color:#fff!important;
      }
      body .topbar{
        background:var(--card)!important;
        border-bottom:1px solid var(--line)!important;
        box-shadow:0 8px 24px rgba(18,38,63,.08)!important;
      }
      body .primary-button,
      body button.primary-button,
      body input[type="submit"].primary-button{
        background:var(--primary)!important;
        border-color:var(--primary)!important;
        color:#fff!important;
      }
      body .primary-button:hover,
      body button.primary-button:hover{
        background:var(--primary-dark)!important;
        border-color:var(--primary-dark)!important;
      }
      body .secondary-button,
      body .inline-button,
      body .import-label,
      body .folder-tab{
        background:#fff!important;
        border-color:var(--line)!important;
        color:var(--primary)!important;
        border-radius:12px!important;
      }
      body .secondary-button:hover,
      body .inline-button:hover,
      body .folder-tab.active{
        background:#eef4fb!important;
        border-color:#c9d8ea!important;
        color:var(--primary-dark)!important;
      }
      body .card,
      body .table-wrap,
      body [class*="-panel"],
      body [class*="-box"],
      body .modal-card{
        background:var(--card)!important;
        border-color:var(--line)!important;
        box-shadow:var(--shadow)!important;
        border-radius:var(--radius)!important;
      }
      body th,
      body .table-wrap th{
        background:#eef4fb!important;
        color:var(--primary-dark)!important;
      }
      body [class*="-hero"],
      body .section-header,
      body [class*="-summary"],
      body [class*="-band"]{
        background:#fff!important;
        border-color:var(--line)!important;
        border-left-color:var(--primary)!important;
        box-shadow:0 10px 26px rgba(18,38,63,.08)!important;
        color:var(--text)!important;
      }
      body.pms108-bottom-menu .pms106-hub{width:70px!important;height:70px!important}
      body.pms108-bottom-menu .pms106-globe,
      body.pms113-left-globe .pms109-world{
        width:66px!important;
        height:66px!important;
      }
      #print-root .print-document{
        font-family:Inter,Arial,sans-serif!important;
        text-transform:none!important;
      }
    `;
  }
  function bindOriginalPresetButtons(){
    document.addEventListener("click", event => {
      const button = event.target && event.target.closest && event.target.closest("[data-pms48-theme]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      applyPreset(button.getAttribute("data-pms48-theme"));
    }, true);
  }
  function wrapRenderColorRestore(){
    if (typeof render !== "function" || render.pms138ColorRestore) return;
    const baseRender = render;
    render = function(){
      const result = baseRender.apply(this, arguments);
      setTimeout(() => {
        injectRestoreCss();
        const id = (stateRef().settings.pmsThemePreset || "blue");
        setVars(ORIGINAL_PRESETS[id] || ORIGINAL_THEME);
      }, 0);
      return result;
    };
    render.pms138ColorRestore = true;
  }
  function init(){
    injectRestoreCss();
    applyOriginalTheme(true);
    bindOriginalPresetButtons();
    wrapRenderColorRestore();
    window.PMS_V138_RESTORE_ORIGINAL_COLORS = {version: VERSION};
  }

  init();
})();
