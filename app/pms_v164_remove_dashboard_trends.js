(function(){
  "use strict";

  const VERSION = "pms_v164_remove_dashboard_trends";

  function isDashboard(){
    try {
      if (typeof current !== "undefined" && current) return current.page === "dashboard";
    } catch(error) {}
    const title = document.querySelector(".topbar h1,.topbar h2,.page-title");
    return !!(title && /dashboard/i.test(title.textContent || ""));
  }

  function disableSettings(){
    try {
      if (typeof state === "undefined" || !state) return;
      state.settings = state.settings || {};
      state.settings.dashboardWidgets = state.settings.dashboardWidgets || {};
      state.settings.dashboardWidgets.productsTrend = false;
      state.settings.dashboardWidgets.cloudProducts = false;
      state.settings.dashboardWidgets.productTrend = false;
      state.settings.dashboardWidgets.cloudLinks = false;
    } catch(error) {}
  }

  function removeCardByText(pattern){
    document.querySelectorAll("#content h2,#content h3,#content strong").forEach(function(node){
      if (!pattern.test(String(node.textContent || "").trim())) return;
      const card = node.closest(".card");
      if (card) {
        card.remove();
        return;
      }
      const header = node.closest(".section-header");
      if (header) {
        const table = header.nextElementSibling;
        header.remove();
        if (table && table.classList.contains("table-wrap")) table.remove();
      }
    });
  }

  function removeConfigOptions(){
    [
      "productTrend",
      "cloudLinks",
      "productsTrend",
      "cloudProducts"
    ].forEach(function(key){
      document.querySelectorAll(
        '[data-dash-widget="' + key + '"],[data-dashboard-widget="' + key + '"]'
      ).forEach(function(input){
        const label = input.closest("label");
        if (label) label.remove();
        else input.remove();
      });
    });
  }

  function cleanDashboard(){
    disableSettings();
    if (!isDashboard()) return;

    if (window.pms79PreviewTimer) {
      clearInterval(window.pms79PreviewTimer);
      window.pms79PreviewTimer = null;
    }

    [
      "pms79-dynamic-preview",
      "pms52-market-preview"
    ].forEach(function(id){
      const node = document.getElementById(id);
      if (node) node.remove();
    });

    removeCardByText(/^(Anteprima andamenti|Anteprima andamenti e cambi|Previsione andamento prodotti|Andamento prodotti|Prodotti collegati al cloud)/i);
    removeConfigOptions();
    document.body.classList.add("pms164-dashboard-trends-removed");
  }

  if (typeof renderDashboard === "function" && !renderDashboard.pms164Wrapped) {
    const baseRenderDashboard = renderDashboard;
    renderDashboard = function(){
      disableSettings();
      const output = baseRenderDashboard.apply(this, arguments);
      setTimeout(cleanDashboard, 0);
      setTimeout(cleanDashboard, 120);
      return output;
    };
    renderDashboard.pms164Wrapped = true;
    window.renderDashboard = renderDashboard;
  }

  if (typeof render === "function" && !render.pms164TrendsWrapped) {
    const baseRender = render;
    render = function(){
      disableSettings();
      const output = baseRender.apply(this, arguments);
      setTimeout(cleanDashboard, 0);
      setTimeout(cleanDashboard, 120);
      return output;
    };
    render.pms164TrendsWrapped = true;
    window.render = render;
  }

  disableSettings();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", cleanDashboard);
  } else {
    cleanDashboard();
  }
  [80, 250, 700, 1500, 3000].forEach(function(delay){
    setTimeout(cleanDashboard, delay);
  });
  setInterval(cleanDashboard, 1500);

  window.PMS_V164_REMOVE_DASHBOARD_TRENDS = {
    version: VERSION,
    refresh: cleanDashboard
  };
})();
