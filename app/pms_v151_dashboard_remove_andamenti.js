(function(){
  var VERSION = "pms_v151_dashboard_remove_andamenti";

  function forceDashboardSettings(){
    if (typeof state !== "object" || !state) return;
    state.settings = state.settings || {};
    state.settings.dashboardWidgets = state.settings.dashboardWidgets || {};
    state.settings.dashboardWidgets.productsTrend = false;
    state.settings.dashboardWidgets.cloudProducts = false;
  }

  function removeByHeading(text){
    var headings = Array.prototype.slice.call(document.querySelectorAll("#content h3"));
    headings.forEach(function(heading){
      if (!heading || !heading.textContent || heading.textContent.indexOf(text) === -1) return;
      var section = heading.closest(".section-header");
      var card = heading.closest(".card");
      if (card) {
        card.remove();
        return;
      }
      if (section) {
        var next = section.nextElementSibling;
        section.remove();
        if (next && next.classList && next.classList.contains("table-wrap")) next.remove();
      }
    });
  }

  function removeDashboardTrends(){
    try {
      forceDashboardSettings();
      if (window.pms79PreviewTimer) {
        clearInterval(window.pms79PreviewTimer);
        window.pms79PreviewTimer = null;
      }
      var preview = document.getElementById("pms79-dynamic-preview");
      if (preview) preview.remove();
      removeByHeading("Andamento prodotti");
      removeByHeading("Prodotti collegati al cloud");
      document.body.classList.add("pms151-dashboard-andamenti-off");
    } catch(error) {}
  }

  function stripDashboardHtml(html){
    if (!html || typeof html !== "string") return html;
    html = html.replace(/<div id="pms79-dynamic-preview"[\s\S]*?<\/div><\/div>/g, "");
    html = html.replace(/<div class="card wide-card">[\s\S]*?<h3>Andamento prodotti<\/h3>[\s\S]*?<\/div><\/div>/g, "");
    html = html.replace(/<div class="section-header"><h3>Prodotti collegati al cloud<\/h3>[\s\S]*?<\/div><div class="table-wrap">[\s\S]*?<\/table><\/div>/g, "");
    return html;
  }

  forceDashboardSettings();

  if (typeof renderDashboard === "function" && !renderDashboard.__pms151NoAndamenti) {
    var baseRenderDashboard151 = renderDashboard;
    renderDashboard = function(){
      forceDashboardSettings();
      return stripDashboardHtml(baseRenderDashboard151.apply(this, arguments));
    };
    renderDashboard.__pms151NoAndamenti = true;
    try { window.renderDashboard = renderDashboard; } catch(error) {}
  }

  if (typeof bindPageActions === "function" && !bindPageActions.__pms151NoAndamenti) {
    var baseBindPageActions151 = bindPageActions;
    bindPageActions = function(){
      var out = baseBindPageActions151.apply(this, arguments);
      removeDashboardTrends();
      return out;
    };
    bindPageActions.__pms151NoAndamenti = true;
    try { window.bindPageActions = bindPageActions; } catch(error) {}
  }

  document.addEventListener("DOMContentLoaded", function(){
    forceDashboardSettings();
    removeDashboardTrends();
  });
  setTimeout(removeDashboardTrends, 100);
  setTimeout(removeDashboardTrends, 800);

  window.PMS_V151_DASHBOARD_REMOVE_ANDAMENTI = {
    version: VERSION,
    refresh: removeDashboardTrends
  };
})();
