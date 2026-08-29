(function(){
  "use strict";

  const VERSION = "pms_v165_fixed_top_menu_layout";
  const HIDDEN = new Set(["cryptoMonitor", "admin", "approvals"]);
  const QUICK = [
    "dashboard",
    "operativo",
    "assistant",
    "communications",
    "trattativeInCorso",
    "orders",
    "companyFleet",
    "products",
    "foreignEmployees",
    "settings"
  ];
  const FALLBACK = [
    ["dashboard", "Dashboard"],
    ["marketTrends", "Andamenti mercato"],
    ["operativo", "Gestione operativa"],
    ["assistant", "Back office"],
    ["communications", "CRM"],
    ["officialCommunications", "Comunicazioni ufficiali"],
    ["trattativeInCorso", "Trattative"],
    ["intermediations", "Intermediazioni"],
    ["offers", "Offerte"],
    ["orders", "Ordini"],
    ["products", "Prodotti"],
    ["productForms", "Moduli"],
    ["supplierPriceConfirmations", "Listini fornitori"],
    ["tenders", "Gare"],
    ["commercialBrokerage", "Brokeraggio"],
    ["contacts", "Anagrafiche"],
    ["print", "Centro stampe"],
    ["supplierGeoGroupage", "Geo fornitore"],
    ["transportPrices", "Trasporti"],
    ["companyFleet", "Flotta auto aziendale"],
    ["packing", "Packing list"],
    ["documents", "Documenti"],
    ["accountant", "Commercialista"],
    ["billingWorkflow", "Fatturazione"],
    ["banks", "Banche"],
    ["payments", "Pagamenti"],
    ["agents", "Agenti"],
    ["driverRecruiting", "Recruiting autisti"],
    ["humanResources", "Dipendenti azienda"],
    ["foreignEmployees", "Dipendenti estero"],
    ["legalClaims", "Sinistri"],
    ["legalProtocols", "Protocolli legali"],
    ["contracts", "Contratti"],
    ["contractTemplates", "Modelli contratti"],
    ["customerInternalExtraction", "Estrazione clienti"],
    ["desktopCloudApp", "App desktop"],
    ["desktopRoadmap", "Piano desktop"],
    ["settings", "Impostazioni"]
  ];

  function escapeHtml(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g, function(char){
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char];
    });
  }
  function currentState(){
    window.current = window.current || { user:"Carlo", role:"admin", page:"dashboard", filters:{} };
    return window.current;
  }
  function moduleLabel(id){
    const mod = Array.isArray(window.modules) && window.modules.find(function(item){ return item && item.id === id; });
    if (mod && mod.label) return mod.label;
    const fallback = FALLBACK.find(function(item){ return item[0] === id; });
    return fallback ? fallback[1] : id;
  }
  function items(){
    const out = [];
    const seen = new Set();
    FALLBACK.forEach(function(item){
      if (!HIDDEN.has(item[0]) && !seen.has(item[0])) {
        seen.add(item[0]);
        out.push([item[0], moduleLabel(item[0])]);
      }
    });
    if (Array.isArray(window.modules)) {
      window.modules.forEach(function(mod){
        if (!mod || !mod.id || HIDDEN.has(mod.id) || seen.has(mod.id)) return;
        seen.add(mod.id);
        out.push([mod.id, mod.label || mod.subtitle || mod.id]);
      });
    }
    return out;
  }
  function quickItems(){
    return QUICK.map(function(id){ return [id, moduleLabel(id)]; }).filter(function(item){
      return !HIDDEN.has(item[0]);
    });
  }

  function injectCss(){
    let style = document.getElementById("pms-v165-fixed-top-menu-layout-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v165-fixed-top-menu-layout-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      body.pms165-fixed-top-menu .app{display:block!important;min-height:100vh!important;width:100%!important}
      body.pms165-fixed-top-menu .sidebar{
        position:sticky!important;
        top:0!important;
        z-index:9000!important;
        width:100%!important;
        height:auto!important;
        min-height:68px!important;
        display:flex!important;
        flex-direction:row!important;
        align-items:center!important;
        gap:12px!important;
        padding:10px 14px!important;
        overflow:visible!important;
        color:#17242b!important;
        background:linear-gradient(90deg,rgba(95,143,109,.22),rgba(255,255,255,.98) 48%,rgba(189,122,120,.18)),#f7faf8!important;
        border:0!important;
        border-bottom:1px solid #dfe9e4!important;
        box-shadow:0 8px 22px rgba(30,45,60,.08)!important;
      }
      body.pms165-fixed-top-menu .sidebar *{color:#17242b!important;text-shadow:none!important;letter-spacing:0!important}
      body.pms165-fixed-top-menu .sidebar-brand{
        flex:0 0 auto!important;
        display:flex!important;
        align-items:center!important;
        gap:10px!important;
        padding:0!important;
        margin:0!important;
        border:0!important;
        min-width:160px!important;
      }
      body.pms165-fixed-top-menu .brand-mark{width:38px!important;height:38px!important;min-width:38px!important}
      body.pms165-fixed-top-menu .sidebar-brand strong{display:block!important;font-size:16px!important;line-height:1.05!important;white-space:nowrap!important}
      body.pms165-fixed-top-menu .sidebar-brand span{display:block!important;font-size:11px!important;color:#52606d!important;white-space:nowrap!important}
      body.pms165-fixed-top-menu #nav,
      body.pms165-fixed-top-menu #pms143-menu,
      body.pms165-fixed-top-menu #pms163-menu-toggle,
      body.pms165-fixed-top-menu #pms164-menu-wrap,
      body.pms165-fixed-top-menu #pms144-world-banner,
      body.pms165-fixed-top-menu .pms144-world-banner,
      body.pms165-fixed-top-menu .pms144-sign,
      body.pms165-fixed-top-menu .pms113-led-sign{
        display:none!important;
        visibility:hidden!important;
        width:0!important;
        height:0!important;
        min-height:0!important;
        max-height:0!important;
        padding:0!important;
        margin:0!important;
        overflow:hidden!important;
        pointer-events:none!important;
      }
      #pms165-top-menu{
        flex:1 1 auto!important;
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
      }
      #pms165-quick-buttons{
        flex:1 1 auto!important;
        min-width:0!important;
        display:flex!important;
        align-items:center!important;
        gap:6px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        padding:2px 2px 4px!important;
        scrollbar-width:thin!important;
      }
      .pms165-menu-button{
        flex:0 0 auto!important;
        min-height:38px!important;
        max-width:158px!important;
        padding:8px 11px!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.28)!important;
        background:#fff!important;
        color:#17242b!important;
        font-size:12px!important;
        font-weight:950!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        cursor:pointer!important;
        box-shadow:0 3px 10px rgba(30,45,60,.05)!important;
      }
      .pms165-menu-button:hover,
      .pms165-menu-button.active{
        background:linear-gradient(90deg,rgba(95,143,109,.18),#fff,rgba(189,122,120,.13))!important;
        border-color:rgba(95,143,109,.5)!important;
      }
      #pms165-more-wrap{
        flex:0 0 220px!important;
        display:flex!important;
        align-items:center!important;
        gap:7px!important;
      }
      #pms165-more-wrap label{
        font-size:11px!important;
        font-weight:950!important;
        color:#3f6b50!important;
        text-transform:uppercase!important;
        white-space:nowrap!important;
      }
      #pms165-page-select{
        width:100%!important;
        min-width:0!important;
        height:39px!important;
        border-radius:8px!important;
        border:1px solid rgba(95,143,109,.34)!important;
        background:#fff!important;
        color:#17242b!important;
        padding:0 10px!important;
        font-size:12px!important;
        font-weight:900!important;
        cursor:pointer!important;
      }
      body.pms165-fixed-top-menu .sidebar-footer{
        flex:0 0 auto!important;
        margin:0!important;
        padding:0!important;
        border:0!important;
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
      }
      body.pms165-fixed-top-menu .sidebar-footer span,
      body.pms165-fixed-top-menu #current-user{display:none!important}
      body.pms165-fixed-top-menu #logout-button{
        width:auto!important;
        min-width:76px!important;
        height:39px!important;
        margin:0!important;
        padding:8px 13px!important;
        border-radius:8px!important;
        background:#fff!important;
        border:1px solid #dfe9e4!important;
        color:#17242b!important;
        font-weight:950!important;
        box-shadow:0 3px 10px rgba(30,45,60,.08)!important;
      }
      body.pms165-fixed-top-menu .main{width:100%!important;max-width:none!important;min-width:0!important}
      body.pms165-fixed-top-menu .topbar{top:68px!important;z-index:1200!important}
      @media(max-width:980px){
        body.pms165-fixed-top-menu .sidebar{display:grid!important;grid-template-columns:1fr auto!important;gap:9px!important}
        #pms165-top-menu{grid-column:1/-1!important}
        body.pms165-fixed-top-menu .sidebar-footer{grid-column:2!important;grid-row:1!important}
        body.pms165-fixed-top-menu .topbar{top:118px!important}
      }
      @media(max-width:620px){
        body.pms165-fixed-top-menu .sidebar{padding:9px 10px!important}
        body.pms165-fixed-top-menu .sidebar-brand span{display:none!important}
        #pms165-top-menu{display:grid!important;grid-template-columns:1fr!important}
        #pms165-more-wrap{flex:auto!important;width:100%!important}
        .pms165-menu-button{max-width:none!important}
        body.pms165-fixed-top-menu .topbar{top:164px!important}
      }
    `;
  }

  function ensureTopMenu(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return null;
    let menu = document.getElementById("pms165-top-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "pms165-top-menu";
      menu.innerHTML = '<div id="pms165-quick-buttons"></div><div id="pms165-more-wrap"><label for="pms165-page-select">Menu</label><select id="pms165-page-select" aria-label="Menu superiore"></select></div>';
      const brand = sidebar.querySelector(".sidebar-brand");
      if (brand && brand.nextSibling) sidebar.insertBefore(menu, brand.nextSibling);
      else sidebar.insertBefore(menu, sidebar.firstChild);
    }
    return menu;
  }

  function setCurrentHeader(id){
    const label = moduleLabel(id);
    const title = document.getElementById("page-title");
    const subtitle = document.getElementById("page-subtitle");
    if (title) title.textContent = label;
    if (subtitle) subtitle.textContent = label;
  }

  function openPage(id){
    if (!id) return;
    currentState().page = id;
    document.body.classList.remove("pms163-menu-open");
    setCurrentHeader(id);
    try {
      if (typeof window.render === "function") window.render();
      else if (typeof render === "function") render();
    } catch(error) {
      console.warn(VERSION + " render failed", error);
    }
    setTimeout(refresh, 0);
    setTimeout(refresh, 120);
  }

  function drawMenu(){
    const menu = ensureTopMenu();
    if (!menu) return;
    const page = currentState().page || "dashboard";
    const quickHost = document.getElementById("pms165-quick-buttons");
    if (quickHost) {
      quickHost.innerHTML = quickItems().map(function(item){
        const active = item[0] === page ? " active" : "";
        return '<button type="button" class="pms165-menu-button' + active + '" data-pms165-page="' + escapeHtml(item[0]) + '">' + escapeHtml(item[1]) + '</button>';
      }).join("");
      quickHost.querySelectorAll("[data-pms165-page]").forEach(function(button){
        button.onclick = function(){ openPage(button.getAttribute("data-pms165-page")); };
      });
    }
    const select = document.getElementById("pms165-page-select");
    if (select) {
      const html = '<option value="">Altri moduli...</option>' + items().map(function(item){
        return '<option value="' + escapeHtml(item[0]) + '">' + escapeHtml(item[1]) + '</option>';
      }).join("");
      if (select.dataset.pms165Html !== html) {
        select.innerHTML = html;
        select.dataset.pms165Html = html;
      }
      select.value = "";
      if (select.dataset.pms165Bound !== "1") {
        select.dataset.pms165Bound = "1";
        select.onchange = function(){
          if (select.value) openPage(select.value);
        };
      }
    }
  }

  function cleanOldPieces(){
    document.body.classList.remove("pms163-menu-open");
    document.body.classList.remove("pms164-top-select-menu");
    document.querySelectorAll(".pms144-sign").forEach(function(node){ node.remove(); });
    const currentUser = document.getElementById("current-user");
    if (currentUser) currentUser.textContent = "";
    document.querySelectorAll(".sidebar-footer span").forEach(function(node){ node.textContent = ""; });
  }

  function refresh(){
    document.body.classList.remove("pms165-fixed-top-menu");
    const menu = document.getElementById("pms165-top-menu");
    if (menu) {
      menu.style.setProperty("display", "none", "important");
      menu.style.setProperty("visibility", "hidden", "important");
      menu.style.setProperty("height", "0", "important");
      menu.style.setProperty("min-height", "0", "important");
      menu.style.setProperty("max-height", "0", "important");
      menu.style.setProperty("margin", "0", "important");
      menu.style.setProperty("padding", "0", "important");
      menu.style.setProperty("overflow", "hidden", "important");
    }
    cleanOldPieces();
  }

  function wrapRenderers(){
    if (typeof render === "function" && !render.pms165Wrapped) {
      const baseRender = render;
      render = function(){
        const result = baseRender.apply(this, arguments);
        setTimeout(refresh, 0);
        setTimeout(refresh, 120);
        return result;
      };
      render.pms165Wrapped = true;
      window.render = render;
    }
    if (typeof renderNav === "function" && !renderNav.pms165Wrapped) {
      const baseRenderNav = renderNav;
      renderNav = function(){
        const result = baseRenderNav.apply(this, arguments);
        setTimeout(refresh, 0);
        setTimeout(refresh, 120);
        return result;
      };
      renderNav.pms165Wrapped = true;
      window.renderNav = renderNav;
    }
    window.setPage = openPage;
    try {
      if (typeof setPage !== "undefined") setPage = openPage;
    } catch(error) {}
  }

  function install(){
    wrapRenderers();
    refresh();
    [50, 150, 350, 700, 1400].forEach(function(ms){ setTimeout(refresh, ms); });
    window.PMS_V165_FIXED_TOP_MENU_LAYOUT = { version: VERSION, openPage: openPage };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
