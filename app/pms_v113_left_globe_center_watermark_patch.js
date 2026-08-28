(function(){
  "use strict";
  const VERSION = "PMS-V113-LEFT-GLOBE-CENTER-WATERMARK";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function logoSrc(){ return (state && state.settings && (state.settings.backgroundLogoUrl || state.settings.logoUrl)) || ""; }
  function cssUrl(src){ return 'url("' + String(src || "").replace(/\\/g,"/").replace(/"/g,"%22") + '")'; }
  function opacity(){
    const n = Number(state && state.settings && state.settings.backgroundLogoOpacity);
    return Number.isFinite(n) ? Math.max(0.045,Math.min(0.18,n)) : 0.075;
  }
  function css(){
    if (document.getElementById("pms-v113-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v113-style";
    s.textContent = `
      body.pms113-left-globe .sidebar-brand{
        margin-bottom:2px!important;
      }
      body.pms113-left-globe .pms109-hub{
        display:grid!important;
        position:relative;
        z-index:3;
        place-items:center;
        padding:6px 0 18px;
        margin:0 0 4px;
        border-bottom:1px solid rgba(125,211,252,.18);
      }
      body.pms113-left-globe .pms109-world{
        width:118px!important;
        height:118px!important;
        margin:0 auto 13px!important;
        border-radius:50%;
        background:
          radial-gradient(circle at 30% 24%, #e0f2fe 0, #38bdf8 9%, #0f766e 34%, #0f2f4a 66%, #061627 100%)!important;
        box-shadow:
          0 0 0 1px rgba(186,230,253,.46),
          0 0 24px rgba(56,189,248,.26),
          inset -18px -20px 30px rgba(2,6,23,.42)!important;
      }
      body.pms113-left-globe .pms109-world::before{
        inset:10px!important;
      }
      body.pms113-left-globe .pms109-world::after{
        inset:-20%!important;
      }
      body.pms113-left-globe .pms109-world-label{
        display:none!important;
        content:""!important;
        color:transparent!important;
        font-size:0!important;
      }
      body.pms113-left-globe .pms113-led-sign{
        display:block!important;
        width:min(230px,100%)!important;
        padding:6px 9px!important;
        border-radius:7px!important;
        border:1px solid rgba(125,211,252,.48)!important;
        background:linear-gradient(180deg,rgba(2,6,23,.86),rgba(8,25,43,.70))!important;
        color:#e0f2fe!important;
        font-size:12px!important;
        line-height:1.12!important;
        font-weight:900!important;
        letter-spacing:.06em!important;
        text-align:center!important;
        text-transform:uppercase!important;
        text-shadow:0 0 6px rgba(224,242,254,.95),0 0 14px rgba(56,189,248,.92),0 0 28px rgba(14,165,233,.72)!important;
        box-shadow:0 0 0 1px rgba(186,230,253,.12),0 0 18px rgba(56,189,248,.34),inset 0 0 18px rgba(14,165,233,.18)!important;
      }
      body.pms113-left-globe .pms109-logo-orbit{
        inset:-13px!important;
        animation:pms109-orbit 16s linear infinite!important;
      }
      body.pms113-left-globe .pms109-logo-sat{
        width:36px!important;
        height:36px!important;
        margin:-18px!important;
        transform:translateX(74px)!important;
        border-width:2px!important;
      }
      body.pms113-left-globe .main{
        position:relative;
        isolation:isolate;
      }
      body.pms113-left-globe .main::before{
        content:""!important;
        position:fixed!important;
        inset:0!important;
        width:auto!important;
        height:auto!important;
        background-image:
          var(--pms113-centered-logo),
          linear-gradient(90deg,rgba(0,146,70,.08) 0 33.33%,rgba(255,255,255,.06) 33.33% 66.66%,rgba(206,43,55,.075) 66.66% 100%)!important;
        background-repeat:no-repeat,no-repeat!important;
        background-position:center center,center center!important;
        background-size:min(42vw,430px) auto,100% 100%!important;
        opacity:1!important;
        pointer-events:none!important;
        z-index:0!important;
        filter:none!important;
      }
      body.pms113-left-globe .topbar,
      body.pms113-left-globe #content{
        position:relative;
        z-index:2;
      }
      @media(max-width:780px){
        body.pms113-left-globe .pms109-hub{display:none!important}
        body.pms113-left-globe .main::before{background-size:min(70vw,300px) auto,100% 100%!important}
      }
      @media print{
        body.pms113-left-globe .pms109-hub{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }
  function addHub(){
    const sidebar = document.querySelector(".sidebar");
    const nav = document.getElementById("nav");
    if (!sidebar || !nav) return;
    document.getElementById("pms109-hub")?.remove();
    const src = (state && state.settings && state.settings.logoUrl) || "";
    const hub = document.createElement("div");
    hub.id = "pms109-hub";
    hub.className = "pms109-hub";
    hub.innerHTML = '<div class="pms109-world"><div class="pms109-world-label"></div><div class="pms109-logo-orbit"><div class="pms109-logo-sat">' + (src ? '<img src="' + esc(src) + '" alt="Parmitalia">' : "P") + '</div></div></div><div class="pms113-led-sign">Parmitalia Distribution SRL</div>';
    sidebar.insertBefore(hub,nav);
  }
  function removeWorldText(){
    document.querySelectorAll(".pms106-globe-core,.pms109-world-label").forEach(el => {
      if (/world/i.test(el.textContent || "")) el.textContent = "";
    });
  }
  function apply(){
    css();
    const src = logoSrc();
    document.body.classList.add("pms113-left-globe");
    document.documentElement.style.setProperty("--pms113-centered-logo", src ? cssUrl(src) : "none");
    document.documentElement.style.setProperty("--pms106-bg-opacity", String(opacity()));
    addHub();
    removeWorldText();
  }
  const baseRenderNav = typeof renderNav === "function" ? renderNav : null;
  if (baseRenderNav && !window.__pms113NavWrapped) {
    window.__pms113NavWrapped = true;
    renderNav = function(){ const r = baseRenderNav.apply(this,arguments); setTimeout(apply,40); return r; };
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms113RenderWrapped) {
    window.__pms113RenderWrapped = true;
    render = function(){ const r = baseRender.apply(this,arguments); setTimeout(apply,60); return r; };
  }
  css();
  setTimeout(apply,160);
  window.pmsV113LeftGlobeCenterWatermark = {version:VERSION,apply};
})();
