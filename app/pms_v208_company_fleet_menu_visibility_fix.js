(function(){
  "use strict";

  var VERSION = "pms_v208_company_fleet_menu_visibility_fix";
  var MODULE = "companyFleet";

  function arr(value){ return Array.isArray(value) ? value : []; }

  function ensureModule(){
    window.modules = arr(window.modules);
    var found = modules.find(function(item){ return item && item.id === MODULE; });
    if (!found) {
      var after = modules.findIndex(function(item){ return item && item.id === "transportPrices"; });
      found = {
        id: MODULE,
        label: "Flotta auto aziendale",
        subtitle: "Auto, ammortamenti, rate e subaffitti",
        roles: ["admin","assistant","accountant"]
      };
      modules.splice(after >= 0 ? after + 1 : modules.length, 0, found);
    } else {
      found.label = "Flotta auto aziendale";
      found.subtitle = "Auto, ammortamenti, rate e subaffitti";
      found.roles = Array.from(new Set(arr(found.roles).concat(["admin","assistant","accountant"])));
    }
  }

  function openFleet(){
    ensureModule();
    window.current = window.current || {user:"Carlo", role:"admin", page:"dashboard", filters:{}};
    current.page = MODULE;
    try {
      if (typeof setPage === "function") setPage(MODULE);
      else if (typeof render === "function") render();
    } catch(error) {
      console.warn(VERSION + " open failed", error);
      try { if (typeof render === "function") render(); } catch(innerError) {}
    }
  }

  function injectNavEntry(){
    var nav = document.getElementById("nav");
    if (!nav || nav.querySelector("[data-pms208-open-fleet]")) return;
    var groups = Array.prototype.slice.call(nav.querySelectorAll(".nav-group"));
    var operativo = groups.find(function(group){
      var title = group.querySelector(".nav-group-title");
      return title && /operativo/i.test(title.textContent || "");
    });
    if (!operativo) {
      operativo = document.createElement("div");
      operativo.className = "nav-group pms208-fleet-group";
      operativo.innerHTML = '<div class="nav-group-title">Operativo</div>';
      nav.appendChild(operativo);
    }
    var button = document.createElement("button");
    button.type = "button";
    button.className = "nav-button compact pms208-fleet-nav";
    button.dataset.page = MODULE;
    button.setAttribute("data-pms208-open-fleet", "1");
    button.innerHTML = '<span class="pms100-code">FLT</span><span class="pms100-label">Flotta auto aziendale</span>';
    var transport = operativo.querySelector('[data-page="transportPrices"]');
    if (transport && transport.nextSibling) operativo.insertBefore(button, transport.nextSibling);
    else operativo.appendChild(button);
  }

  function injectTopEntry(){
    var quick = document.getElementById("pms165-quick-buttons");
    if (!quick || quick.querySelector("[data-pms208-open-fleet]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pms165-menu-button pms208-fleet-top";
    btn.setAttribute("data-pms208-open-fleet", "1");
    btn.textContent = "Flotta auto aziendale";
    var orders = quick.querySelector('[data-pms165-page="orders"]');
    if (orders && orders.nextSibling) quick.insertBefore(btn, orders.nextSibling);
    else quick.appendChild(btn);
  }

  function injectSelectEntry(){
    var select = document.getElementById("pms165-page-select");
    if (!select || select.querySelector('option[value="' + MODULE + '"]')) return;
    var option = document.createElement("option");
    option.value = MODULE;
    option.textContent = "Flotta auto aziendale";
    var transport = select.querySelector('option[value="transportPrices"]');
    if (transport && transport.nextSibling) select.insertBefore(option, transport.nextSibling);
    else select.appendChild(option);
  }

  function injectLauncher(){
    if (document.getElementById("pms208-fleet-launcher")) return;
    var host = document.querySelector(".topbar") || document.querySelector(".sidebar") || document.body;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "pms208-fleet-launcher";
    btn.setAttribute("data-pms208-open-fleet", "1");
    btn.innerHTML = '<span>FLT</span> Flotta auto aziendale';
    host.appendChild(btn);
  }

  function bind(){
    document.querySelectorAll("[data-pms208-open-fleet]").forEach(function(button){
      if (button.dataset.pms208Bound === "1") return;
      button.dataset.pms208Bound = "1";
      button.addEventListener("click", function(event){
        event.preventDefault();
        openFleet();
      });
    });
  }

  function css(){
    if (document.getElementById("pms-v208-fleet-menu-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v208-fleet-menu-style";
    style.textContent = [
      "#pms208-fleet-launcher{display:inline-flex!important;align-items:center!important;gap:7px!important;width:auto!important;min-height:38px!important;margin-left:auto!important;padding:8px 12px!important;border-radius:8px!important;border:1px solid rgba(20,113,63,.36)!important;background:#ffffff!important;color:#133f2b!important;font-size:12px!important;font-weight:950!important;white-space:nowrap!important;cursor:pointer!important;box-shadow:0 5px 14px rgba(20,113,63,.12)!important}",
      "#pms208-fleet-launcher span{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:30px!important;height:22px!important;border-radius:5px!important;background:#14713f!important;color:#fff!important;font-size:10px!important;font-weight:950!important}",
      ".pms208-fleet-nav .pms100-code{background:rgba(20,113,63,.22)!important;border-color:rgba(255,255,255,.38)!important}",
      ".pms208-fleet-top{border-color:rgba(20,113,63,.48)!important;background:linear-gradient(90deg,rgba(20,113,63,.16),#fff)!important}",
      "@media(max-width:760px){#pms208-fleet-launcher{width:100%!important;justify-content:center!important;margin-left:0!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function refresh(){
    ensureModule();
    css();
    injectNavEntry();
    injectTopEntry();
    injectSelectEntry();
    injectLauncher();
    bind();
  }

  function wrap(){
    if (typeof render === "function" && !render.__pms208FleetVisible) {
      var baseRender = render;
      render = function(){
        var result = baseRender.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      render.__pms208FleetVisible = true;
      try { window.render = render; } catch(error) {}
    }
    if (typeof renderNav === "function" && !renderNav.__pms208FleetVisible) {
      var baseNav = renderNav;
      renderNav = function(){
        var result = baseNav.apply(this, arguments);
        setTimeout(refresh, 20);
        setTimeout(refresh, 180);
        return result;
      };
      renderNav.__pms208FleetVisible = true;
      try { window.renderNav = renderNav; } catch(error) {}
    }
  }

  function boot(){
    ensureModule();
    wrap();
    refresh();
    [60, 200, 600, 1200].forEach(function(ms){ setTimeout(refresh, ms); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V208_COMPANY_FLEET_MENU_VISIBILITY_FIX = {version:VERSION, refresh:refresh, open:openFleet};
})();
