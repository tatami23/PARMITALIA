(function () {
  "use strict";

  function installCss() {
    if (document.getElementById("pms-v200-stability-repair-style")) return;
    var style = document.createElement("style");
    style.id = "pms-v200-stability-repair-style";
    style.textContent = [
      "html,body,#app,#content{scroll-behavior:auto!important}",
      "body{overflow-anchor:none!important}",
      "#content,.content,.main{min-width:0!important}",
      ".table-wrap{overflow:auto!important;scrollbar-gutter:stable both-edges!important}",
      "table{table-layout:fixed!important;width:100%!important}",
      "th,td{overflow:hidden!important;text-overflow:ellipsis!important;max-width:360px!important;overflow-wrap:anywhere!important}",
      ".nav-button,.card,.panel,.table-wrap,.content,#content,.topbar{transition:none!important}",
      ".topbar{backdrop-filter:none!important}",
      ".pms195-autosave-status,#pms195-autosave-status{transition:none!important}",
      "#modal,.modal,.pms83-modal,.pms84-modal,.pms92-modal{position:fixed!important;inset:0!important;z-index:2147483000!important;display:grid!important;place-items:center!important;padding:18px!important;background:rgba(15,23,42,.46)!important;overflow:auto!important}",
      "#modal.hidden,.modal.hidden{display:none!important}",
      ".modal-card,.pms83-modal-card,.pms84-modal-card,.pms92-modal-card{width:min(1180px,calc(100vw - 38px))!important;max-height:calc(100vh - 38px)!important;border-radius:8px!important;box-shadow:0 24px 80px rgba(15,23,42,.34)!important;overflow:auto!important;background:#fff!important}",
      ".modal-header,.pms83-modal-head,.pms84-modal-head,.pms92-modal-head{position:sticky!important;top:0!important;z-index:2!important;background:#fff!important}",
      ".modal-form,.pms83-form,.pms84-form,.pms85-modal-form,.pms92-form{align-items:start!important}",
      ".form-actions,.pms83-modal-actions,.pms84-modal-actions,.pms92-modal-actions{position:sticky!important;bottom:0!important;background:#fff!important;z-index:2!important}",
      "body:has(#modal:not(.hidden)),body:has(.pms83-modal),body:has(.pms84-modal),body:has(.pms92-modal){overflow:hidden!important}",
      "@media (prefers-reduced-motion: no-preference){.pms200-status i,.pms216-light{animation-duration:2.8s!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function preserveScrollDuringRender() {
    if (typeof render !== "function" || render.__pms200StableWrapped) return;
    var base = render;
    var pending = false;
    var queued = false;
    render = function () {
      if (pending) {
        queued = true;
        return;
      }
      pending = true;
      var content = document.getElementById("content");
      var sx = window.scrollX || 0;
      var sy = window.scrollY || 0;
      var cx = content ? content.scrollLeft : 0;
      var cy = content ? content.scrollTop : 0;
      try {
        return base.apply(this, arguments);
      } finally {
        requestAnimationFrame(function () {
          try {
            window.scrollTo(sx, sy);
            if (content) {
              content.scrollLeft = cx;
              content.scrollTop = cy;
          }
        } catch (_) {}
          pending = false;
          if (queued) {
            queued = false;
            setTimeout(function () {
              try { render(); } catch (_) {}
            }, 80);
          }
        });
      }
    };
    render.__pms200StableWrapped = true;
  }

  function stabilizeOpenModal() {
    if (typeof openModal !== "function" || openModal.__pms200WindowWrapped) return;
    var baseOpenModal = openModal;
    openModal = function () {
      var result = baseOpenModal.apply(this, arguments);
      setTimeout(function () {
        var modal = document.getElementById("modal") || document.querySelector(".modal:not(.hidden),.pms83-modal,.pms84-modal,.pms92-modal");
        if (modal) {
          modal.classList.add("pms200-window-modal");
          modal.style.zIndex = "2147483000";
          try { modal.scrollTop = 0; } catch (_) {}
          var first = modal.querySelector("input:not([type='hidden']),select,textarea,button");
          if (first && typeof first.focus === "function") first.focus({ preventScroll: true });
        }
      }, 30);
      return result;
    };
    openModal.__pms200WindowWrapped = true;
  }

  function install() {
    installCss();
    preserveScrollDuringRender();
    stabilizeOpenModal();
    setTimeout(preserveScrollDuringRender, 500);
    setTimeout(preserveScrollDuringRender, 1500);
    setTimeout(stabilizeOpenModal, 500);
    setTimeout(stabilizeOpenModal, 1500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
