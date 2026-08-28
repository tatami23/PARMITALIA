(function(){
  "use strict";
  const VERSION = "PMS-V109-RIGHT-MENU-ITALY-FLAG";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function logoSrc(){ return (state && state.settings && state.settings.logoUrl) || ""; }

  function css(){
    if (document.getElementById("pms-v109-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v109-style";
    s.textContent = `
      body.pms109-right-menu .app{
        display:block!important;
        padding:0 352px 0 0!important;
        min-height:100vh;
      }
      body.pms109-right-menu .main{
        min-height:100vh;
        position:relative;
        isolation:isolate;
      }
      body.pms109-right-menu .main::before{
        content:""!important;
        position:fixed!important;
        inset:0 352px 0 0!important;
        width:auto!important;
        height:auto!important;
        background:
          linear-gradient(90deg,
            rgba(0,146,70,.115) 0 33.33%,
            rgba(255,255,255,.08) 33.33% 66.66%,
            rgba(206,43,55,.105) 66.66% 100%)!important;
        opacity:1!important;
        pointer-events:none!important;
        z-index:0!important;
        filter:none!important;
      }
      body.pms109-right-menu .main::after{
        content:"PARMITALIA";
        position:fixed;
        left:6vw;
        bottom:8vh;
        font-size:min(10vw,112px);
        font-weight:900;
        letter-spacing:0;
        color:rgba(15,47,74,.045);
        pointer-events:none;
        z-index:0;
      }
      body.pms109-right-menu .topbar,
      body.pms109-right-menu #content{
        position:relative;
        z-index:2;
      }
      body.pms109-right-menu .sidebar{
        position:fixed!important;
        right:0!important;
        left:auto!important;
        top:0!important;
        bottom:0!important;
        width:336px!important;
        height:100vh!important;
        min-height:100vh!important;
        z-index:26000!important;
        display:grid!important;
        grid-template-rows:auto auto minmax(0,1fr) auto;
        gap:12px;
        padding:16px 14px!important;
        border-radius:0!important;
        overflow:hidden!important;
        border-left:1px solid rgba(125,211,252,.34)!important;
        border-right:0!important;
        background:
          radial-gradient(circle at 50% 110px, rgba(34,211,238,.20), transparent 155px),
          linear-gradient(180deg,#061a2d 0%,#0b1220 58%,#08111f 100%)!important;
        box-shadow:-18px 0 48px rgba(15,23,42,.22), inset 0 0 44px rgba(14,165,233,.10)!important;
        transform:none!important;
      }
      body.pms109-right-menu .sidebar::before{
        content:"";
        position:absolute;
        inset:0;
        pointer-events:none;
        opacity:.18!important;
        background-image:
          linear-gradient(rgba(125,211,252,.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(125,211,252,.07) 1px, transparent 1px);
        background-size:22px 22px;
        mask-image:linear-gradient(#000,transparent 92%)!important;
      }
      body.pms109-right-menu .sidebar-brand{
        display:flex!important;
        grid-row:1;
        position:relative;
        z-index:3;
        border-bottom:1px solid rgba(125,211,252,.22)!important;
        padding-bottom:12px!important;
      }
      body.pms109-right-menu .pms106-brand-logo{
        width:42px!important;
        height:42px!important;
      }
      body.pms109-right-menu .pms106-hub{
        display:none!important;
      }
      .pms109-hub{
        grid-row:2;
        position:relative;
        z-index:3;
        display:grid;
        place-items:center;
        padding:8px 0 16px;
        border-bottom:1px solid rgba(125,211,252,.18);
      }
      .pms109-world{
        position:relative;
        width:174px;
        height:174px;
        border-radius:50%;
        background:
          radial-gradient(circle at 30% 24%, #e0f2fe 0, #38bdf8 9%, #0f766e 34%, #0f2f4a 66%, #061627 100%);
        box-shadow:
          0 0 0 1px rgba(186,230,253,.46),
          0 0 34px rgba(56,189,248,.28),
          inset -24px -26px 38px rgba(2,6,23,.42);
        overflow:visible;
      }
      .pms109-world::before{
        content:"";
        position:absolute;
        inset:14px;
        border-radius:50%;
        background:
          repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,255,255,.25) 19px 20px, transparent 21px 36px),
          repeating-linear-gradient(0deg, transparent 0 23px, rgba(255,255,255,.20) 24px 25px, transparent 26px 46px);
        mix-blend-mode:screen;
        opacity:.72;
      }
      .pms109-world::after{
        content:"";
        position:absolute;
        inset:-22%;
        border-radius:50%;
        border:2px solid rgba(186,230,253,.42);
        transform:rotate(-25deg) scaleX(.48);
      }
      .pms109-world-label{
        display:none!important;
        content:""!important;
        color:transparent!important;
        font-size:0!important;
      }
      .pms109-led-sign{
        margin:12px auto 0;
        width:230px;
        max-width:100%;
        padding:6px 9px;
        border-radius:7px;
        border:1px solid rgba(125,211,252,.48);
        background:linear-gradient(180deg,rgba(2,6,23,.86),rgba(8,25,43,.70));
        color:#e0f2fe;
        font-size:12px;
        line-height:1.12;
        font-weight:900;
        letter-spacing:.06em;
        text-align:center;
        text-transform:uppercase;
        text-shadow:0 0 6px rgba(224,242,254,.95),0 0 14px rgba(56,189,248,.92),0 0 28px rgba(14,165,233,.72);
        box-shadow:0 0 0 1px rgba(186,230,253,.12),0 0 18px rgba(56,189,248,.34),inset 0 0 18px rgba(14,165,233,.18);
      }
      .pms109-logo-orbit{
        position:absolute;
        inset:-20px;
        border-radius:50%;
        animation:pms109-orbit 18s linear infinite;
        z-index:4;
      }
      .pms109-logo-sat{
        position:absolute;
        left:50%;
        top:50%;
        width:48px;
        height:48px;
        margin:-24px;
        transform:translateX(106px);
        border-radius:50%;
        display:grid;
        place-items:center;
        overflow:hidden;
        background:#fff;
        border:2px solid rgba(186,230,253,.82);
        box-shadow:0 8px 24px rgba(15,23,42,.28),0 0 18px rgba(56,189,248,.38);
        color:#0f2f4a;
        font-weight:900;
      }
      .pms109-logo-sat img{
        width:100%;
        height:100%;
        object-fit:contain;
      }
      @keyframes pms109-orbit{to{transform:rotate(360deg)}}
      body.pms109-right-menu #nav{
        grid-row:3;
        position:relative;
        z-index:3;
        display:grid!important;
        grid-template-columns:1fr 1fr;
        align-content:start;
        gap:8px!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
        padding:2px 2px 8px!important;
        max-height:none!important;
        scrollbar-width:thin;
      }
      body.pms109-right-menu #nav::-webkit-scrollbar{width:8px}
      body.pms109-right-menu #nav::-webkit-scrollbar-thumb{background:rgba(186,230,253,.36);border-radius:999px}
      body.pms109-right-menu .nav-button{
        width:100%!important;
        min-height:62px!important;
        max-height:none!important;
        border-radius:12px!important;
        display:grid!important;
        grid-template-columns:1fr!important;
        justify-items:start;
        align-content:center;
        gap:6px!important;
        padding:9px 10px!important;
        line-height:1.12;
        white-space:normal;
        overflow-wrap:anywhere;
        font-size:12px!important;
        text-align:left!important;
        border:1px solid rgba(125,211,252,.18)!important;
        background:rgba(15,23,42,.32)!important;
        color:#dbeafe!important;
      }
      body.pms109-right-menu .nav-button::before{
        min-width:42px!important;
        height:22px!important;
        content:attr(data-code);
        display:inline-grid;
        place-items:center;
        border-radius:999px;
        background:rgba(14,165,233,.14);
        border:1px solid rgba(125,211,252,.24);
        color:#bae6fd;
        font-size:10px;
        font-weight:900;
      }
      body.pms109-right-menu .nav-button:hover,
      body.pms109-right-menu .nav-button.active{
        background:linear-gradient(135deg,rgba(14,165,233,.34),rgba(15,23,42,.48))!important;
        border-color:rgba(186,230,253,.52)!important;
        color:#fff!important;
      }
      body.pms109-right-menu .sidebar-footer{
        grid-row:4;
        position:relative;
        z-index:3;
        margin:0!important;
        padding-top:12px!important;
        border-top:1px solid rgba(125,211,252,.22)!important;
        display:grid!important;
        gap:8px!important;
      }
      body.pms109-right-menu .sidebar-footer span{
        font-size:12px!important;
        line-height:1.25;
      }
      body.pms109-right-menu .sidebar-footer button{
        min-height:32px;
      }
      body.pms109-right-menu.pms108-bottom-menu .app{
        padding-bottom:0!important;
      }
      @media(max-width:980px){
        body.pms109-right-menu .app{padding-right:292px!important}
        body.pms109-right-menu .main::before{inset:0 292px 0 0!important}
        body.pms109-right-menu .sidebar{width:280px!important}
        body.pms109-right-menu #nav{grid-template-columns:1fr}
        .pms109-world{width:132px;height:132px}
        .pms109-led-sign{width:210px;font-size:11px}
        .pms109-logo-sat{width:40px;height:40px;margin:-20px;transform:translateX(82px)}
      }
      @media(max-width:720px){
        body.pms109-right-menu .app{padding-right:0!important;padding-bottom:0!important}
        body.pms109-right-menu .main::before{inset:0!important}
        body.pms109-right-menu .sidebar{
          position:relative!important;
          width:100%!important;
          height:auto!important;
          min-height:0!important;
          right:auto!important;
          top:auto!important;
          bottom:auto!important;
          grid-template-rows:auto auto auto auto;
          border-left:0!important;
          border-bottom:1px solid rgba(125,211,252,.34)!important;
        }
        body.pms109-right-menu #nav{grid-template-columns:repeat(2,minmax(0,1fr));max-height:none!important}
      }
      @media print{
        body.pms109-right-menu .app{padding-right:0!important}
        body.pms109-right-menu .sidebar{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }
  function codeFor(m){
    return m.code || ({dashboard:"DB",marketTrends:"MKT",tenders:"TEN",trattativeInCorso:"TRT",offers:"OFF",orders:"ORD",products:"PRD",contracts:"CTR",accountant:"ACC",settings:"SET"}[m.id]) || String(m.label || m.id || "MOD").slice(0,3).toUpperCase();
  }
  function addHub(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    document.getElementById("pms109-hub")?.remove();
    const src = logoSrc();
    const hub = document.createElement("div");
    hub.id = "pms109-hub";
    hub.className = "pms109-hub";
    hub.innerHTML = '<div class="pms109-world"><div class="pms109-world-label"></div><div class="pms109-logo-orbit"><div class="pms109-logo-sat">' + (src ? '<img src="' + esc(src) + '" alt="Parmitalia">' : "P") + '</div></div></div><div class="pms109-led-sign">Parmitalia Distribution SRL</div>';
    const nav = document.getElementById("nav");
    if (nav) sidebar.insertBefore(hub,nav);
  }
  function activate(){
    css();
    document.body.classList.remove("pms108-bottom-menu");
    document.body.classList.add("pms109-right-menu");
    addHub();
    const allModules = typeof modules !== "undefined" ? modules : [];
    document.querySelectorAll(".nav-button").forEach(btn => {
      const m = arr(allModules).find(x => x.id === btn.dataset.page);
      if (m) btn.dataset.code = codeFor(m);
    });
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !window.__pms109NavWrapped) {
    window.__pms109NavWrapped = true;
    renderNav = function(){ const r = baseRenderNav.apply(this,arguments); setTimeout(activate,20); return r; };
  }
  const baseSetPage = typeof setPage === "function" ? setPage : null;
  if (baseSetPage && !window.__pms109SetPageWrapped) {
    window.__pms109SetPageWrapped = true;
    setPage = function(){ const r = baseSetPage.apply(this,arguments); setTimeout(activate,30); return r; };
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms109RenderWrapped) {
    window.__pms109RenderWrapped = true;
    render = function(){ const r = baseRender.apply(this,arguments); setTimeout(activate,40); return r; };
  }
  css();
  setTimeout(activate,120);
  window.pmsV109RightWorldMenu = {version:VERSION,activate};
})();
