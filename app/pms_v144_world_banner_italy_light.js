(function(){
  "use strict";

  const VERSION = "PMS-V144-WORLD-BANNER-ITALY-LIGHT";

  function ensureBanner(){
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    let banner = document.getElementById("pms144-world-banner");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "pms144-world-banner";
      banner.className = "pms144-world-banner";
      banner.innerHTML = [
        '<div class="pms144-globe-wrap" aria-hidden="true">',
          '<div class="pms144-globe">',
            '<span class="pms144-land pms144-land-1"></span>',
            '<span class="pms144-land pms144-land-2"></span>',
            '<span class="pms144-land pms144-land-3"></span>',
            '<span class="pms144-land pms144-land-4"></span>',
            '<span class="pms144-land pms144-land-5"></span>',
            '<span class="pms144-lat pms144-lat-1"></span>',
            '<span class="pms144-lat pms144-lat-2"></span>',
            '<span class="pms144-mer pms144-mer-1"></span>',
            '<span class="pms144-mer pms144-mer-2"></span>',
          '</div>',
          '<div class="pms144-orbit">',
            '<span class="pms144-satellite" data-pms144-satellite-logo>P</span>',
          '</div>',
        '</div>',
        '<div class="pms144-sign">',
          '<span>PARMITALIA DISTRIBUTION SRL</span>',
        '</div>'
      ].join("");
      const brand = sidebar.querySelector(".sidebar-brand");
      const menu = document.getElementById("pms143-menu") || document.getElementById("nav");
      if (brand && brand.nextSibling) sidebar.insertBefore(banner, brand.nextSibling);
      else if (menu) sidebar.insertBefore(banner, menu);
      else sidebar.appendChild(banner);
    }
    const menu = document.getElementById("pms143-menu") || document.getElementById("nav");
    if (menu && banner.nextSibling !== menu) {
      sidebar.insertBefore(banner, menu);
    }
    ensureSatelliteLogo(banner);
    hideOldWorldPieces();
  }

  function ensureSatelliteLogo(banner){
    const target = banner && banner.querySelector("[data-pms144-satellite-logo]");
    if (!target) return;
    const logo = window.state && state.settings && state.settings.logoUrl ? String(state.settings.logoUrl || "") : "";
    if (logo && target.dataset.src !== logo) {
      target.dataset.src = logo;
      target.innerHTML = '<img src="' + logo.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])) + '" alt="Parmitalia">';
    } else if (!logo && target.dataset.src !== "fallback") {
      target.dataset.src = "fallback";
      target.textContent = "P";
    }
  }

  function hideOldWorldPieces(){
    document.querySelectorAll(".pms106-hub,.pms109-world,.pms113-led-sign,.pms106-wheel").forEach(node => {
      if (!node.closest("#pms144-world-banner")) node.setAttribute("data-pms144-hidden", "1");
    });
  }

  function injectCss(){
    let style = document.getElementById("pms-v144-world-banner-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v144-world-banner-style";
      document.head.appendChild(style);
    }
    style.textContent = `
      [data-pms144-hidden="1"]{display:none!important}
      #pms144-world-banner{
        display:grid!important;
        justify-items:center!important;
        gap:8px!important;
        margin:12px 0 14px!important;
        padding:8px 8px 12px!important;
        border-bottom:1px solid rgba(95,143,109,.18)!important;
      }
      .pms144-globe-wrap{
        position:relative!important;
        width:82px!important;
        height:82px!important;
        display:grid!important;
        place-items:center!important;
      }
      .pms144-globe-wrap:before{
        content:""!important;
        position:absolute!important;
        inset:9px!important;
        border-radius:999px!important;
        background:radial-gradient(circle,rgba(77,163,197,.24),transparent 62%)!important;
        filter:blur(8px)!important;
      }
      .pms144-globe{
        position:relative!important;
        width:68px!important;
        height:68px!important;
        border-radius:999px!important;
        overflow:hidden!important;
        background:
          radial-gradient(circle at 28% 24%,rgba(255,255,255,.9) 0 7%,transparent 8%),
          radial-gradient(circle at 38% 30%,#8fd2e6 0,#4aa3c5 43%,#2676a5 100%)!important;
        border:1px solid rgba(38,118,165,.34)!important;
        box-shadow:
          0 0 0 1px rgba(255,255,255,.72),
          0 10px 22px rgba(38,118,165,.2),
          inset -10px -12px 18px rgba(8,40,66,.24),
          inset 8px 8px 16px rgba(255,255,255,.26)!important;
        animation:pms144-globe-turn 16s linear infinite!important;
      }
      .pms144-orbit{
        position:absolute!important;
        inset:1px!important;
        border-radius:999px!important;
        pointer-events:none!important;
        animation:pms144-satellite-orbit 5.6s linear infinite!important;
        z-index:3!important;
      }
      .pms144-orbit:before{
        content:""!important;
        position:absolute!important;
        inset:4px!important;
        border:1px solid rgba(38,118,165,.16)!important;
        border-radius:999px!important;
      }
      .pms144-satellite{
        position:absolute!important;
        left:50%!important;
        top:-1px!important;
        width:24px!important;
        height:24px!important;
        margin-left:-12px!important;
        display:grid!important;
        place-items:center!important;
        border-radius:999px!important;
        overflow:hidden!important;
        background:linear-gradient(135deg,rgba(95,143,109,.95),#fff 52%,rgba(189,122,120,.95))!important;
        border:1px solid rgba(255,255,255,.88)!important;
        color:#173b2a!important;
        font-size:11px!important;
        font-weight:950!important;
        box-shadow:0 2px 8px rgba(23,59,92,.25),0 0 10px rgba(255,255,255,.72)!important;
        transform:rotate(0deg)!important;
      }
      .pms144-satellite img{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
        display:block!important;
      }
      .pms144-land{
        position:absolute!important;
        display:block!important;
        background:linear-gradient(135deg,#81b86f,#437b50)!important;
        border-radius:55% 45% 58% 42%!important;
        box-shadow:inset -2px -2px 4px rgba(24,74,44,.2)!important;
      }
      .pms144-land-1{width:18px!important;height:22px!important;left:15px!important;top:18px!important;transform:rotate(18deg)!important}
      .pms144-land-2{width:21px!important;height:16px!important;left:34px!important;top:16px!important;transform:rotate(-15deg)!important}
      .pms144-land-3{width:17px!important;height:20px!important;left:39px!important;top:39px!important;transform:rotate(24deg)!important}
      .pms144-land-4{width:15px!important;height:12px!important;left:20px!important;top:45px!important;transform:rotate(-22deg)!important}
      .pms144-land-5{width:10px!important;height:10px!important;left:49px!important;top:31px!important;background:#6fa65f!important}
      .pms144-lat,.pms144-mer{
        position:absolute!important;
        pointer-events:none!important;
        border:1px solid rgba(255,255,255,.26)!important;
        border-radius:999px!important;
      }
      .pms144-lat-1{left:3px!important;right:3px!important;top:24px!important;height:15px!important;border-left:0!important;border-right:0!important}
      .pms144-lat-2{left:5px!important;right:5px!important;top:39px!important;height:14px!important;border-left:0!important;border-right:0!important}
      .pms144-mer-1{top:3px!important;bottom:3px!important;left:25px!important;width:17px!important;border-top:0!important;border-bottom:0!important}
      .pms144-mer-2{top:5px!important;bottom:5px!important;left:12px!important;width:42px!important;border-top:0!important;border-bottom:0!important;transform:rotate(19deg)!important}
      .pms144-sign{
        position:relative!important;
        width:min(236px,92%)!important;
        min-height:30px!important;
        display:grid!important;
        place-items:center!important;
        padding:6px 12px!important;
        border-radius:8px!important;
        overflow:hidden!important;
        background:
          linear-gradient(90deg,rgba(95,143,109,.28),rgba(255,255,255,.86) 50%,rgba(189,122,120,.28)),
          linear-gradient(180deg,#1f4e78,#173b5c)!important;
        border:1px solid rgba(255,255,255,.46)!important;
        box-shadow:
          0 0 18px rgba(95,143,109,.22),
          0 0 18px rgba(189,122,120,.18),
          0 8px 18px rgba(23,59,92,.18)!important;
      }
      .pms144-sign:before{
        content:""!important;
        position:absolute!important;
        inset:0!important;
        background:linear-gradient(90deg,rgba(0,146,70,.5),rgba(255,255,255,.35),rgba(206,43,55,.45))!important;
        opacity:.42!important;
        mix-blend-mode:screen!important;
      }
      .pms144-sign span{
        position:relative!important;
        z-index:1!important;
        color:#ffffff!important;
        font-size:11px!important;
        font-weight:900!important;
        letter-spacing:.05em!important;
        text-align:center!important;
        text-shadow:
          0 0 5px rgba(255,255,255,.7),
          0 1px 2px rgba(10,31,48,.62)!important;
        white-space:nowrap!important;
      }
      body.pms108-bottom-menu #pms144-world-banner{
        flex:0 0 266px!important;
        align-self:center!important;
        margin:0 8px 0 0!important;
        padding:4px 8px!important;
        border-bottom:0!important;
        border-right:1px solid rgba(95,143,109,.18)!important;
        grid-template-columns:70px 1fr!important;
        gap:8px!important;
      }
      body.pms108-bottom-menu .pms144-globe-wrap{width:70px!important;height:70px!important}
      body.pms108-bottom-menu .pms144-globe{width:58px!important;height:58px!important}
      body.pms108-bottom-menu .pms144-satellite{width:21px!important;height:21px!important;margin-left:-10.5px!important;top:0!important}
      body.pms108-bottom-menu .pms144-sign{width:178px!important}
      body.pms108-bottom-menu .pms144-sign span{font-size:9px!important}
      @keyframes pms144-globe-turn{
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }
      @keyframes pms144-satellite-orbit{
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }
    `;
  }

  function run(){
    injectCss();
    ensureBanner();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, {once:true});
  else run();
  [100, 500, 1200, 2500].forEach(ms => setTimeout(run, ms));
  setInterval(run, 3000);
  window.PMS_V144_WORLD_BANNER_ITALY_LIGHT = {version: VERSION};
})();
