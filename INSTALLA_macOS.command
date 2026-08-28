#!/bin/sh
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
DEST="$HOME/Applications/ParmitaliaManagement"
echo "Installazione Parmitalia Management System..."
mkdir -p "$DEST"
cp -R "$SCRIPT_DIR/"* "$DEST/"
chmod +x "$DEST/Avvia_Parmitalia_macOS.command" "$DEST/INSTALLA_macOS.command" 2>/dev/null
cat > "$HOME/Desktop/Parmitalia Management System.command" <<EOF
#!/bin/sh
open "$DEST/app/APP_UNIFICATA_CLAL_ANDAMENTI_MERCATO_FINALE_UNIFICATA.html"
EOF
chmod +x "$HOME/Desktop/Parmitalia Management System.command"
echo "Installazione completata. Avvio creato sul Desktop."
