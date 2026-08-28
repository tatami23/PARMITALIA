(function(){
  "use strict";
  const VERSION = "PMS-V108-BOTTOM-WORLD-MENU";

  function css(){
    if (document.getElementById("pms-v108-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v108-style";
    s.textContent = `
      body.pms108-bottom-menu .app{
        display:block!important;
        padding-bottom:142px;
      }
      body.pms108-bottom-menu .main{
        min-height:100vh;
      }
      body.pms108-bottom-menu .sidebar{
        position:fixed!important;
        left:14px!important;
        right:14px!important;
        bottom:12px!important;
        top:auto!important;
        width:auto!important;
        height:118px!important;
        min-height:0!important;
        z-index:26000!important;
        display:grid!important;
        grid-template-columns:104px minmax(0,1fr) 96px;
        gap:12px;
        align-items:center;
        padding:10px 14px!important;
        border-radius:18px;
        overflow:visible!important;
        border:1px solid rgba(125,211,252,.34)!important;
        background:
          radial-gradient(circle at 82px 54px, rgba(34,211,238,.28), transparent 96px),
          linear-gradient(90deg,#061a2d 0%,#0b1220 52%,#08111f 100%)!important;
        box-shadow:0 -18px 48px rgba(15,23,42,.24), inset 0 0 44px rgba(14,165,233,.12)!important;
      }
      body.pms108-bottom-menu .sidebar::before{
        border-radius:18px;
        opacity:.20!important;
        mask-image:linear-gradient(90deg,#000,transparent 92%)!important;
      }
      body.pms108-bottom-menu .sidebar-brand{
        display:none!important;
      }
      body.pms108-bottom-menu .pms106-hub{
        grid-column:1;
        grid-row:1;
        margin:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        box-shadow:none!important;
        align-self:center;
        justify-self:center;
        width:96px;
        height:96px;
      }
      body.pms108-bottom-menu .pms106-globe{
        width:92px!important;
        height:92px!important;
        margin:0!important;
        box-shadow:0 0 0 1px rgba(186,230,253,.48),0 0 28px rgba(56,189,248,.32),inset -16px -18px 28px rgba(2,6,23,.42)!important;
      }
      body.pms108-bottom-menu .pms106-globe-core{
        inset:28px!important;
        font-size:10px;
      }
      body.pms108-bottom-menu .pms106-orbit i:nth-child(1){transform:rotate(18deg) translateX(49px)}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(2){transform:rotate(92deg) translateX(47px)}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(3){transform:rotate(176deg) translateX(50px)}
      body.pms108-bottom-menu .pms106-orbit i:nth-child(4){transform:rotate(264deg) translateX(46px)}
      body.pms108-bottom-menu .pms106-wheel{
        position:absolute;
        left:82px;
        bottom:82px;
        width:min(620px,calc(100vw - 190px));
        display:flex!important;
        gap:6px;
        opacity:.98;
      }
      body.pms108-bottom-menu .pms106-wheel button{
        width:44px;
        height:28px!important;
        flex:0 0 auto;
        border-radius:999px;
        font-size:10px;
        box-shadow:0 8px 18px rgba(15,23,42,.18);
      }
      body.pms108-bottom-menu #nav{
        grid-column:2;
        grid-row:1;
        display:flex!important;
        flex-direction:row!important;
        gap:8px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        max-height:98px!important;
        padding:4px 6px 8px!important;
        scroll-snap-type:x proximity;
        scrollbar-width:thin;
      }
      body.pms108-bottom-menu #nav::-webkit-scrollbar{height:8px}
      body.pms108-bottom-menu #nav::-webkit-scrollbar-thumb{background:rgba(186,230,253,.38);border-radius:999px}
      body.pms108-bottom-menu .nav-button{
        flex:0 0 142px;
        width:142px!important;
        min-height:74px!important;
        max-height:78px;
        border-radius:12px!important;
        display:grid!important;
        grid-template-columns:1fr!important;
        justify-items:start;
        align-content:center;
        gap:6px!important;
        scroll-snap-align:center;
        padding:9px 10px!important;
        line-height:1.15;
        white-space:normal;
      }
      body.pms108-bottom-menu .nav-button::before{
        min-width:42px!important;
        height:22px!important;
      }
      body.pms108-bottom-menu .sidebar-footer{
        grid-column:3;
        grid-row:1;
        margin:0!important;
        padding:0 0 0 10px!important;
        border-top:0!important;
        border-left:1px solid rgba(125,211,252,.22);
        align-self:stretch;
        display:grid!important;
        align-content:center;
        gap:8px!important;
        position:relative;
        z-index:3;
      }
      body.pms108-bottom-menu .sidebar-footer span{
        font-size:11px!important;
        line-height:1.2;
      }
      body.pms108-bottom-menu .sidebar-footer button{
        min-height:30px;
        padding:6px 8px;
      }
      body.pms108-bottom-menu .topbar{
        padding-bottom:12px;
      }
      body.pms108-bottom-menu .main::before{
        bottom:148px!important;
      }
      body.device-phone.pms108-bottom-menu .sidebar,
      body.device-tablet.pms108-bottom-menu .sidebar{
        transform:none!important;
        width:auto!important;
        height:128px!important;
        grid-template-columns:78px minmax(0,1fr);
        right:8px!important;
        left:8px!important;
        bottom:8px!important;
        padding:9px!important;
      }
      body.device-phone.pms108-bottom-menu .app,
      body.device-tablet.pms108-bottom-menu .app{
        padding-bottom:154px;
      }
      body.device-phone.pms108-bottom-menu .pms106-hub,
      body.device-tablet.pms108-bottom-menu .pms106-hub{
        width:74px;height:74px;
      }
      body.device-phone.pms108-bottom-menu .pms106-globe,
      body.device-tablet.pms108-bottom-menu .pms106-globe{
        width:72px!important;height:72px!important;
      }
      body.device-phone.pms108-bottom-menu .pms106-globe-core,
      body.device-tablet.pms108-bottom-menu .pms106-globe-core{
        inset:22px!important;font-size:8px;
      }
      body.device-phone.pms108-bottom-menu .pms106-wheel,
      body.device-tablet.pms108-bottom-menu .pms106-wheel{
        display:none!important;
      }
      body.device-phone.pms108-bottom-menu .sidebar-footer,
      body.device-tablet.pms108-bottom-menu .sidebar-footer{
        display:none!important;
      }
      body.device-phone.pms108-bottom-menu #nav,
      body.device-tablet.pms108-bottom-menu #nav{
        grid-column:2;
        max-height:104px!important;
      }
      body.device-phone.pms108-bottom-menu .nav-button,
      body.device-tablet.pms108-bottom-menu .nav-button{
        flex-basis:112px;
        width:112px!important;
        min-height:78px!important;
        font-size:12px!important;
      }
      @media print{
        body.pms108-bottom-menu .app{padding-bottom:0!important}
        body.pms108-bottom-menu .sidebar{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }
  function activate(){
    css();
    document.body.classList.add("pms108-bottom-menu");
    const hub = document.getElementById("pms106-hub");
    const nav = document.getElementById("nav");
    if (hub && nav && hub.parentElement !== nav.parentElement) return;
    if (nav) {
      const active = nav.querySelector(".nav-button.active");
      if (active && typeof active.scrollIntoView === "function") {
        setTimeout(() => active.scrollIntoView({block:"nearest",inline:"center"}),80);
      }
    }
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !window.__pms108NavWrapped) {
    window.__pms108NavWrapped = true;
    renderNav = function(){
      const r = baseRenderNav.apply(this,arguments);
      setTimeout(activate,20);
      return r;
    };
  }
  const baseSetPage = typeof setPage === "function" ? setPage : null;
  if (baseSetPage && !window.__pms108SetPageWrapped) {
    window.__pms108SetPageWrapped = true;
    setPage = function(){
      const r = baseSetPage.apply(this,arguments);
      setTimeout(activate,30);
      return r;
    };
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms108RenderWrapped) {
    window.__pms108RenderWrapped = true;
    render = function(){
      const r = baseRender.apply(this,arguments);
      setTimeout(activate,40);
      return r;
    };
  }
  css();
  setTimeout(activate,120);
  window.pmsV108BottomWorldMenu = {version:VERSION,activate};
})();
