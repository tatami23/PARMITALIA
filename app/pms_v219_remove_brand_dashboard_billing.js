(function(){
  "use strict";

  var VERSION = "pms_v219_static_clean";
  var STYLE_ID = "pms-v219-static-clean-style";
  var HIDDEN = {
    dashboard: true,
    billingWorkflow: true,
    outgoingInvoices: true,
    incomingInvoices: true,
    invoices: true
  };
  var FALLBACKS = ["assistant", "operativo", "orders", "communications", "contacts", "offers", "products", "print", "settings"];

  function hidden(id){
    return !!HIDDEN[String(id || "").trim()];
  }

  function injectStyle(){
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = [
      "html,body{min-height:100%!important;background:#f7faf8!important}",
      "#login-screen.login-screen:not(.hidden){display:grid!important;visibility:visible!important;opacity:1!important;position:fixed!important;inset:0!important;z-index:999999!important;background:#f7faf8!important;place-items:center!important}",
      "#login-screen.login-screen:not(.hidden) *{visibility:visible!important;opacity:1!important}",
      "#app.app:not(.hidden){display:grid!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:1!important;min-height:100vh!important}",
      ".sidebar-brand,.brand-text,.sidebar .brand-mark,#pms170-top-globe,.pms170-top-globe,#pms144-world-banner,.pms144-world-banner,.pms144-globe-wrap,.pms144-globe,.pms144-sign,.pms109-hub,.pms109-world,.pms109-world-label,.pms109-logo-orbit,.pms109-logo-sat,.pms113-led-sign,.pms106-hub,.pms106-wheel,.pms106-globe-core,[id*='globe' i],[class*='globe' i],[id*='world-banner' i],[class*='world-banner' i],[id*='world-logo' i],[class*='world-logo' i]{display:none!important;visibility:hidden!important;width:0!important;height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}",
      "[data-page='dashboard'],[data-nav='dashboard'],[data-pms165-page='dashboard'],[data-print-summary='dashboard'],option[value='dashboard'],[data-page='billingWorkflow'],[data-nav='billingWorkflow'],[data-pms165-page='billingWorkflow'],option[value='billingWorkflow'],[data-page='outgoingInvoices'],[data-page='incomingInvoices'],[data-page='invoices']{display:none!important;visibility:hidden!important}",
      "body .main::before,body.pms113-left-globe .main::before{content:none!important;display:none!important;background:none!important;background-image:none!important}"
    ].join("\n");
  }

  function filterModules(){
    if (typeof modules === "undefined" || !Array.isArray(modules)) return;
    for (var i = modules.length - 1; i >= 0; i -= 1) {
      if (modules[i] && hidden(modules[i].id)) modules.splice(i, 1);
    }
  }

  function fallbackPage(){
    var role = current && current.role;
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      for (var i = 0; i < FALLBACKS.length; i += 1) {
        var id = FALLBACKS[i];
        var mod = modules.find(function(item){
          return item && item.id === id && (!role || !Array.isArray(item.roles) || item.roles.indexOf(role) >= 0);
        });
        if (mod) return id;
      }
    }
    return "assistant";
  }

  function cleanDom(){
    injectStyle();
    document.querySelectorAll(".sidebar-brand,.brand-text,.sidebar .brand-mark,#pms170-top-globe,.pms170-top-globe,#pms144-world-banner,.pms144-world-banner,.pms144-globe-wrap,.pms144-globe,.pms144-sign,.pms109-hub,.pms109-world,.pms109-world-label,.pms109-logo-orbit,.pms109-logo-sat,.pms113-led-sign,.pms106-hub,.pms106-wheel,.pms106-globe-core").forEach(function(node){
      node.remove();
    });
    document.querySelectorAll("[data-page],[data-nav],[data-pms165-page],[data-print-summary],option").forEach(function(node){
      var value = node.getAttribute("data-page") || node.getAttribute("data-nav") || node.getAttribute("data-pms165-page") || node.getAttribute("value") || "";
      if (hidden(value)) node.remove();
    });
  }

  function installLogin(){
    if (typeof login !== "function" || login.__pms219StaticClean) return;
    login = function(){
      filterModules();
      current.user = document.getElementById("login-name").value || "Carlo";
      current.role = document.getElementById("login-role").value;
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("app").classList.remove("hidden");
      document.getElementById("current-user").textContent = current.user + " - " + current.role;
      renderNav();
      setPage(fallbackPage());
      cleanDom();
    };
    login.__pms219StaticClean = true;
    window.login = login;
    var button = document.getElementById("login-button");
    if (button) {
      button.onclick = login;
      button.disabled = false;
      button.textContent = "Entra";
    }
  }

  function install(){
    injectStyle();
    filterModules();
    installLogin();
    if (typeof renderDashboard === "function") {
      renderDashboard = function(){
        return typeof renderListModule === "function" ? renderListModule("tasks") : "";
      };
      window.renderDashboard = renderDashboard;
    }
    if (current && hidden(current.page)) current.page = fallbackPage();
    cleanDom();
    var button = document.getElementById("login-button");
    if (button) {
      button.disabled = false;
      button.textContent = "Entra";
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
  setTimeout(install, 100);
  setTimeout(install, 600);

  window.PMS_V219_REMOVE_BRAND_DASHBOARD_BILLING = { version: VERSION, refresh: install };
})();
