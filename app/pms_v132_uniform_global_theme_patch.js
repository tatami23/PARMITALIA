(function(){
  "use strict";

  const VERSION = "PMS-V132-DISABLED-SUPERSEDED-BY-V133";

  function stateRef(){
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

  function applyThemeVariablesOnly(){
    const s = stateRef();
    s.settings = s.settings || {};
    const primary = s.settings.pms129Primary || s.settings.primaryColor || "#1f4e78";
    const secondary = s.settings.pms129Secondary || s.settings.secondaryColor || "#0f766e";
    const root = document.documentElement;
    root.style.setProperty("--primary", primary);
    root.style.setProperty("--primary-dark", darken(primary, .72));
    root.style.setProperty("--secondary", secondary);
    root.style.setProperty("--bg", rgba(primary, .035));
    root.style.setProperty("--card", "#ffffff");
    root.style.setProperty("--line", rgba(primary, .18));
    root.style.setProperty("--theme-primary", primary);
    root.style.setProperty("--theme-secondary", secondary);
  }

  const heavyStyle = document.getElementById("pms-v132-uniform-theme-style");
  if (heavyStyle) heavyStyle.remove();
  applyThemeVariablesOnly();
  window.pmsV132UniformGlobalTheme = {version:VERSION, refresh:applyThemeVariablesOnly};
})();
