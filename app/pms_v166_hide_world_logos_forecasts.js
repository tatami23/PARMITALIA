(function(){
  "use strict";

  const STYLE_ID = "pms-v166-hide-world-logos-forecasts-style";
  const FORECAST_TERMS = [
    "anteprima andamenti",
    "previsione andamento",
    "previsioni andamento",
    "andamenti e cambi",
    "prodotti collegati al cloud",
    "previsione prodotti"
  ];

  function normalize(value){
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function installStyle(){
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = `
      #pms144-world-banner,
      .pms144-world-banner,
      .pms144-sign,
      .pms113-led-sign,
      .sidebar-brand,
      .brand-mark,
      .brand-text,
      [id*="world" i],
      [class*="world" i],
      [id*="globe" i],
      [class*="globe" i],
      [id*="logo" i],
      .sidebar [class*="logo" i],
      .sidebar img,
      .sidebar svg,
      #pms79-dynamic-preview,
      #pms52-market-preview,
      [data-dashboard-widget="products"],
      [data-dashboard-widget="productTrend"],
      [data-dashboard-widget="marketPreview"],
      [data-dashboard-widget="cloudProducts"]{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-width:0!important;
        min-height:0!important;
        margin:0!important;
        padding:0!important;
        overflow:hidden!important;
      }
    `;
  }

  function isDashboard(){
    const title = normalize(document.querySelector(".topbar h2, .page-title, h1")?.textContent);
    return !title || title.includes("dashboard");
  }

  function removeForecastCards(){
    if (!isDashboard()) return;
    const nodes = Array.from(document.querySelectorAll(
      "#content section, #content article, #content .card, #content [class*='preview'], #content [id*='preview']"
    ));
    nodes.forEach(function(node){
      if (node.id === "pms159-dashboard-agenda" || node.closest("#pms159-dashboard-agenda")) return;
      const text = normalize(node.textContent);
      if (!FORECAST_TERMS.some(function(term){ return text.includes(term); })) return;

      let target = node;
      while (
        target.parentElement &&
        target.parentElement.id !== "content" &&
        target.parentElement.children.length === 1 &&
        !target.parentElement.matches("#pms159-dashboard-agenda")
      ) {
        target = target.parentElement;
      }
      target.remove();
    });
  }

  function removeCorruptedBranding(){
    document.querySelectorAll(
      "#pms144-world-banner,.pms144-world-banner,.pms144-sign,.pms113-led-sign," +
      ".sidebar-brand,.brand-mark,.brand-text,[id*='world' i],[class*='world' i]," +
      "[id*='globe' i],[class*='globe' i],.sidebar [id*='logo' i],.sidebar [class*='logo' i]"
    ).forEach(function(node){ node.remove(); });

    document.querySelectorAll(".sidebar > *, body > *").forEach(function(node){
      if (node.id === "pms163-menu-toggle" || node.closest("#pms163-menu-toggle")) return;
      const ownText = Array.from(node.childNodes)
        .filter(function(child){ return child.nodeType === Node.TEXT_NODE; })
        .map(function(child){ return child.textContent; })
        .join("");
      if (/[ÃÂ�]/.test(ownText)) node.remove();
    });
  }

  function clean(){
    installStyle();
    removeCorruptedBranding();
    removeForecastCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clean);
  } else {
    clean();
  }
  [100, 400, 1000, 2200].forEach(function(delay){ setTimeout(clean, delay); });
  setInterval(clean, 1800);
  window.PMS_V166_HIDE_WORLD_LOGOS_FORECASTS = { refresh: clean };
})();
