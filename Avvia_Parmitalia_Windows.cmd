@echo off
if exist "%~dp0node_modules\electron\dist\electron.exe" (
  pushd "%~dp0"
  start "Parmitalia Management System" "%~dp0node_modules\electron\dist\electron.exe" . --js-flags="--max-old-space-size=4096" --no-sandbox --in-process-gpu --disable-gpu --disable-gpu-compositing --disable-software-rasterizer --disable-direct-composition --disable-vulkan --disable-features=UseSkiaRenderer,VizDisplayCompositor,Vulkan,CanvasOopRasterization,RawDraw
  popd
) else (
  start "Parmitalia Management System" "%~dp0app\APP_UNIFICATA_CLAL_ANDAMENTI_MERCATO_FINALE_UNIFICATA.html"
)
