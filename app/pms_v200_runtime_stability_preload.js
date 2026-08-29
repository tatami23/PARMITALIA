(function () {
  "use strict";

  if (window.PMS_V200_RUNTIME_STABILITY_PRELOAD) return;
  window.PMS_V200_RUNTIME_STABILITY_PRELOAD = true;

  var nativeSetInterval = window.setInterval.bind(window);
  var nativeClearInterval = window.clearInterval.bind(window);
  var MIN_BACKGROUND_INTERVAL = 5000;

  window.setInterval = function (handler, delay) {
    var ms = Number(delay || 0);
    if (ms > 0 && ms < MIN_BACKGROUND_INTERVAL) ms = MIN_BACKGROUND_INTERVAL;
    return nativeSetInterval(handler, ms || delay);
  };
  window.clearInterval = function (id) {
    return nativeClearInterval(id);
  };

  document.documentElement.classList.add("pms-runtime-stable");
})();
