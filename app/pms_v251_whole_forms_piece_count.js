(function pmsV251WholeFormsPieceCount() {
  "use strict";

  const OFFER_MODULE = "offers";
  const SUPPLIER_MODULE = "supplierPriceConfirmations";
  const UNIT_OPTIONS = [
    "kg",
    "forme intere",
    "pezzi",
    "100 kg",
    "quintale",
    "tonnellata",
    "litro",
    "confezione",
    "cartone",
    "pallet",
    "container",
    "lotto"
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    })[char]);
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function appState() {
    if (typeof state !== "undefined") return state;
    return window.state || {};
  }

  function number(value) {
    const parsed = Number(String(value == null ? "" : value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function money(value, currency) {
    return `${currency || "EUR"} ${number(value).toLocaleString("it-IT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    })}`;
  }

  function pieceValue(item) {
    if (!item) return "";
    return item.pieceCount ?? item.numberOfPieces ?? item.pieces ?? item.formCount ?? "";
  }

  function hasPieceValue(item) {
    return String(pieceValue(item)).trim() !== "";
  }

  function offerLines(offer) {
    if (offer && offer.offerLineItemsJson) {
      try {
        const parsed = JSON.parse(offer.offerLineItemsJson);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      } catch (error) {}
    }
    return [{
      product: offer?.product || "",
      description: offer?.description || "",
      quantity: offer?.quantity || "",
      unit: offer?.unit || "",
      priceType: offer?.priceType || "",
      unitPrice: offer?.unitPrice || "",
      currency: offer?.currency || "EUR",
      pieceCount: pieceValue(offer)
    }];
  }

  function lineTotal(line) {
    return number(line.quantity) * number(line.unitPrice);
  }

  function offerTotal(lines) {
    return list(lines).reduce((sum, line) => sum + lineTotal(line), 0);
  }

  function ensureOfferSchema() {
    if (typeof schemas === "undefined" || !schemas?.offers) return;
    const fields = list(schemas.offers.fields);
    const unitField = fields.find(field => field.key === "unit");
    if (unitField) {
      unitField.type = "select";
      unitField.options = Array.from(new Set([...(list(unitField.options)), ...UNIT_OPTIONS]));
    }
    let pieceField = fields.find(field => field.key === "pieceCount");
    if (!pieceField) {
      pieceField = {
        key: "pieceCount",
        label: "N. forme / pezzi (facoltativo)",
        type: "number",
        step: "1"
      };
      const unitIndex = fields.findIndex(field => field.key === "unit");
      fields.splice(unitIndex >= 0 ? unitIndex + 1 : fields.length, 0, pieceField);
    }
    schemas.offers.fields = fields;
  }

  function ensureUnitDatalist(form) {
    if (!form || document.getElementById("pms251-unit-options")) return;
    const datalist = document.createElement("datalist");
    datalist.id = "pms251-unit-options";
    datalist.innerHTML = UNIT_OPTIONS.map(unit => `<option value="${esc(unit)}"></option>`).join("");
    form.appendChild(datalist);
  }

  function readOfferWidget(form) {
    return Array.from(form.querySelectorAll("[data-pms69-line]")).map(row => {
      const line = {};
      row.querySelectorAll("[data-pms69-line-field]").forEach(input => {
        line[input.getAttribute("data-pms69-line-field")] = input.value || "";
      });
      line.currency = form.elements.currency?.value || "EUR";
      return line;
    });
  }

  function syncOfferWidget(form) {
    const field = form?.elements?.offerLineItemsJson;
    if (!field) return;
    const lines = readOfferWidget(form);
    field.value = JSON.stringify(lines);
    if (lines[0]) {
      if (form.elements.quantity) form.elements.quantity.value = lines[0].quantity || 0;
      if (form.elements.unit) form.elements.unit.value = lines[0].unit || "";
      if (form.elements.unitPrice) form.elements.unitPrice.value = lines[0].unitPrice || 0;
      if (form.elements.priceType) form.elements.priceType.value = lines[0].priceType || "";
    }
  }

  function decorateOfferWidget() {
    const widget = document.getElementById("pms69-lines-widget");
    const form = widget?.closest("form") || document.getElementById("modal-form");
    if (!widget || !form || !form.elements?.offerLineItemsJson) return;

    ensureUnitDatalist(form);
    let storedLines = [];
    try {
      const parsed = JSON.parse(form.elements.offerLineItemsJson.value || "[]");
      if (Array.isArray(parsed)) storedLines = parsed;
    } catch (error) {}

    widget.querySelectorAll('[data-pms69-line-field="unit"]').forEach(input => {
      input.setAttribute("list", "pms251-unit-options");
      input.setAttribute("placeholder", "kg, forme intere, pezzi...");
    });

    const headerRow = widget.querySelector("thead tr");
    if (headerRow && !headerRow.querySelector(".pms251-piece-heading")) {
      const cells = headerRow.querySelectorAll("th");
      const unitHeader = cells[3];
      const heading = document.createElement("th");
      heading.className = "pms251-piece-heading";
      heading.textContent = "N. forme / pezzi";
      heading.title = "Campo facoltativo: lasciare vuoto quando non deve comparire";
      unitHeader?.insertAdjacentElement("afterend", heading);
    }

    widget.querySelectorAll("[data-pms69-line]").forEach((row, index) => {
      if (row.querySelector('[data-pms69-line-field="pieceCount"]')) return;
      const unitInput = row.querySelector('[data-pms69-line-field="unit"]');
      const unitCell = unitInput?.closest("td");
      if (!unitCell) return;
      const cell = document.createElement("td");
      cell.className = "pms251-piece-cell";
      cell.innerHTML = `<input data-pms69-line-field="pieceCount" type="number" min="0" step="1" inputmode="numeric" value="${esc(pieceValue(storedLines[index]))}" placeholder="es. 650" title="Numero facoltativo di forme o pezzi">`;
      unitCell.insertAdjacentElement("afterend", cell);
      const input = cell.querySelector("input");
      input.addEventListener("input", () => syncOfferWidget(form));
      input.addEventListener("change", () => syncOfferWidget(form));
    });

    const footerLabel = widget.querySelector("tfoot th[colspan]");
    if (footerLabel && footerLabel.dataset.pms251Adjusted !== "1") {
      footerLabel.colSpan = Number(footerLabel.colSpan || 6) + 1;
      footerLabel.dataset.pms251Adjusted = "1";
    }

    const help = widget.querySelector(".pms69-widget-head small");
    if (help && !help.dataset.pms251Updated) {
      help.textContent = "Inserisci quantita, unita e prezzo. Il numero di forme o pezzi e facoltativo e viene riportato nelle stampe.";
      help.dataset.pms251Updated = "1";
    }
  }

  function decorateSimpleOfferModal() {
    const form = document.getElementById("modal-form");
    const title = document.getElementById("modal-title")?.textContent || "";
    if (!form || !/offerta/i.test(title) || !form.elements?.unit || form.elements?.offerLineItemsJson) return;

    const unit = form.elements.unit;
    if (unit.tagName === "SELECT" && !Array.from(unit.options).some(option => option.value === "forme intere")) {
      const option = document.createElement("option");
      option.value = "forme intere";
      option.textContent = "forme intere";
      const piecesOption = Array.from(unit.options).find(item => /pezz/i.test(item.value));
      if (piecesOption) piecesOption.insertAdjacentElement("afterend", option);
      else unit.appendChild(option);
    }

    if (!form.elements.pieceCount) {
      const label = document.createElement("label");
      label.className = "form-field pms251-simple-piece";
      label.innerHTML = 'N. forme / pezzi (facoltativo)<input name="pieceCount" type="number" min="0" step="1" inputmode="numeric" placeholder="es. 650"><small>Lasciare vuoto quando il numero non deve comparire in stampa.</small>';
      unit.closest("label,.form-field")?.insertAdjacentElement("afterend", label);
    }
  }

  function supplierRecordFromForm(form) {
    const supplier = form?.elements?.supplier?.value || "";
    const product = form?.elements?.product?.value || "";
    const validUntil = form?.elements?.validUntil?.value || "";
    const price = form?.elements?.price?.value || "";
    return list(appState()[SUPPLIER_MODULE]).find(item =>
      String(item.supplier || "") === String(supplier) &&
      String(item.product || "") === String(product) &&
      String(item.validUntil || "") === String(validUntil) &&
      String(item.price ?? "") === String(price)
    );
  }

  function decorateSupplierModal() {
    const form = document.getElementById("modal-form");
    const title = document.getElementById("modal-title");
    if (!form || !/conferma prezzo/i.test(title?.textContent || "") || !form.elements?.unit) return;

    let unitControl = form.elements.unit;
    if (unitControl.tagName !== "SELECT") {
      const select = document.createElement("select");
      select.name = "unit";
      const currentValue = unitControl.value || "kg";
      const options = UNIT_OPTIONS.includes(currentValue) ? UNIT_OPTIONS : [currentValue, ...UNIT_OPTIONS];
      select.innerHTML = options.map(unit => `<option value="${esc(unit)}"${unit === currentValue ? " selected" : ""}>${esc(unit)}</option>`).join("");
      unitControl.replaceWith(select);
      unitControl = select;
    }

    if (!form.elements.pieceCount) {
      const record = supplierRecordFromForm(form);
      const label = document.createElement("label");
      label.className = "pms251-supplier-piece";
      label.innerHTML = `N. forme / pezzi (facoltativo)<input name="pieceCount" type="number" min="0" step="1" inputmode="numeric" value="${esc(pieceValue(record))}" placeholder="es. 650"><small>Lasciare vuoto per non indicarlo nella stampa.</small>`;
      unitControl.closest("label")?.insertAdjacentElement("afterend", label);
    }
  }

  function supplierPrint(id) {
    const item = list(appState()[SUPPLIER_MODULE]).find(entry => String(entry.id) === String(id));
    if (!item) return alert("Conferma prezzo non trovata.");
    const code = item.id || "LST";
    const header = typeof companyPrintHeader === "function"
      ? companyPrintHeader("CONFERMA PREZZO FORNITORE", code)
      : `<div class="print-header"><h1>CONFERMA PREZZO FORNITORE</h1><strong>PARMITALIA DISTRIBUTION S.R.L.</strong></div>`;
    const html = `<div class="print-document">${header}<table class="print-table"><tr><th>Fornitore</th><td>${esc(item.supplier || "-")}</td><th>Prodotto</th><td>${esc(item.product || "-")}</td></tr><tr><th>Codice articolo</th><td>${esc(item.articleCode || "-")}</td><th>Codice fornitore</th><td>${esc(item.supplierArticleCode || "-")}</td></tr></table><table class="print-table"><thead><tr><th>Prezzo</th><th>Unita prezzo</th><th>N. forme / pezzi</th><th>Validita</th></tr></thead><tbody><tr><td><strong>${money(item.price, item.currency)}</strong></td><td>${esc(item.unit || "-")}</td><td>${hasPieceValue(item) ? esc(pieceValue(item)) : "-"}</td><td>${esc(item.validFrom || "-")} / ${esc(item.validUntil || "-")}</td></tr></tbody></table><table class="print-table"><tr><th>Incoterm</th><td>${esc(item.incoterm || "-")}</td><th>Pagamento</th><td>${esc(item.paymentTerms || "-")}</td></tr><tr><th>Note</th><td colspan="3">${esc(item.notes || "-")}</td></tr></table><div class="print-footer">Parmitalia Distribution S.R.L. - Conferma prezzo - ${esc(code)}</div></div>`;
    if (typeof openPrint === "function") openPrint(html);
  }

  function decorateSupplierTable() {
    document.querySelectorAll("[data-pms184-supplier-edit]").forEach(editButton => {
      const id = editButton.getAttribute("data-pms184-supplier-edit");
      const item = list(appState()[SUPPLIER_MODULE]).find(entry => String(entry.id) === String(id));
      const row = editButton.closest("tr");
      if (!row) return;
      const priceCell = row.children[3];
      if (priceCell && item && hasPieceValue(item) && !priceCell.querySelector(".pms251-piece-summary")) {
        priceCell.insertAdjacentHTML("beforeend", `<small class="pms251-piece-summary"><strong>N. forme/pezzi:</strong> ${esc(pieceValue(item))}</small>`);
      }
      const actionCell = editButton.closest("td");
      if (actionCell && !actionCell.querySelector("[data-pms251-supplier-print]")) {
        const printButton = document.createElement("button");
        printButton.type = "button";
        printButton.className = "inline-button";
        printButton.setAttribute("data-pms251-supplier-print", id);
        printButton.textContent = "Stampa";
        printButton.onclick = () => supplierPrint(id);
        actionCell.insertBefore(printButton, editButton);
      }
    });
  }

  function offerPrint(id, mode) {
    const currentState = appState();
    const offer = list(currentState[OFFER_MODULE]).find(item => String(item.id) === String(id));
    if (!offer) return alert("Offerta non trovata.");
    const internal = mode === "internal";
    const code = offer.code || offer.id;
    const rows = offerLines(offer);
    const currency = offer.currency || rows[0]?.currency || "EUR";
    const title = internal ? "STAMPA INTERNA / INTERNAL COPY" : (offer.offerType || "OFFERTA COMMERCIALE");
    const lineRows = rows.map((line, index) => `<tr><td>${index + 1}</td><td><strong>${esc(line.product || "-")}</strong><br><small>${esc(line.description || "")}</small></td><td>${esc(line.quantity || "-")}</td><td>${esc(line.unit || "-")}</td><td>${esc(line.priceType || "-")}</td><td>${money(line.unitPrice, currency)}</td><td><strong>${hasPieceValue(line) ? esc(pieceValue(line)) : "-"}</strong></td><td><strong>${money(lineTotal(line), currency)}</strong></td></tr>`).join("");
    const header = typeof companyPrintHeader === "function"
      ? companyPrintHeader(title, code)
      : `<div class="print-header"><div><h1>${esc(title)}</h1><strong>${esc(currentState.settings?.legalName || "PARMITALIA DISTRIBUTION S.R.L.")}</strong><br><span>${esc(code)}</span></div></div>`;
    const html = `<div class="print-document" style="position:relative;">${internal ? "<div class='internal-watermark'>USO INTERNO PARMITALIA</div>" : ""}${header}<div style="margin:10px 0 16px;">${internal ? "<span class='print-mode-badge internal'>STAMPA INTERNA</span>" : "<span class='print-mode-badge'>STAMPA CLIENTE/FORNITORE</span>"}</div><p style="line-height:1.55;margin:18px 0;">${esc(offer.introText || offer.description || "Trasmettiamo la nostra proposta commerciale per gli articoli indicati.")}</p><table class="print-table"><tr><th>Cliente</th><td>${esc(offer.client || "-")}</td><th>Fornitore</th><td>${esc(offer.supplier || "-")}</td></tr><tr><th>Codice interno collegato</th><td>${esc(offer.linkedPractice || "-")}</td><th>Validita</th><td>${esc(offer.validUntil || "-")}</td></tr></table><table class="print-table"><thead><tr><th>#</th><th>Articolo / descrizione</th><th>Quantita</th><th>Unita</th><th>Tipo prezzo</th><th>Prezzo</th><th>N. forme / pezzi</th><th>Totale</th></tr></thead><tbody>${lineRows}</tbody><tfoot><tr><th colspan="7">Totale offerta</th><th>${money(offerTotal(rows), currency)}</th></tr></tfoot></table><table class="print-table"><tr><th>Pagamento</th><td>${esc(offer.paymentTerms || "-")}</td><th>Incoterms</th><td>${esc(offer.delivery || "-")}</td></tr><tr><th>Condizioni</th><td colspan="3">${esc(offer.termsText || "-")}</td></tr>${internal ? `<tr><th>Note interne</th><td colspan="3">${esc(offer.notes || "-")}</td></tr>` : ""}</table>${offer.closingText ? `<p style="line-height:1.55;margin:18px 0;">${esc(offer.closingText)}</p>` : ""}<div class="print-footer">${internal ? "Documento interno riservato Parmitalia" : "Documento commerciale"} - Codice: ${esc(code)}</div></div>`;
    if (typeof openPrint === "function") openPrint(html);
  }

  function selectedValue(selectIds) {
    for (const id of selectIds) {
      const select = document.getElementById(id);
      if (select?.value) return select.value;
    }
    return "";
  }

  function bindPrintButtons() {
    document.querySelectorAll("[data-print-offer],[data-print-offer-external]").forEach(button => {
      button.onclick = () => offerPrint(button.dataset.printOffer || button.dataset.printOfferExternal, "external");
    });
    document.querySelectorAll("[data-print-offer-internal]").forEach(button => {
      button.onclick = () => offerPrint(button.dataset.printOfferInternal, "internal");
    });
    document.querySelectorAll('[data-pms179-action="print"][data-pms179-module="offers"]').forEach(button => {
      button.onclick = () => offerPrint(button.getAttribute("data-pms179-id"), "external");
    });
    document.querySelectorAll("[data-print-selected-offer],[data-print-selected-offer-external]").forEach(button => {
      button.onclick = () => {
        const id = selectedValue(["print-offer-select", "print-offer-external-select"]);
        if (id) offerPrint(id, "external");
      };
    });
    document.querySelectorAll("[data-print-selected-offer-internal]").forEach(button => {
      button.onclick = () => {
        const id = selectedValue(["print-offer-internal-select", "print-offer-select"]);
        if (id) offerPrint(id, "internal");
      };
    });
  }

  function injectStyle() {
    if (document.getElementById("pms-v251-style")) return;
    const style = document.createElement("style");
    style.id = "pms-v251-style";
    style.textContent = ".pms251-piece-heading,.pms251-piece-cell{min-width:118px}.pms251-piece-cell input{min-width:105px!important}.pms251-supplier-piece small{display:block;color:var(--muted);font-size:11px;margin-top:4px}.pms251-piece-summary{display:block;margin-top:5px;color:var(--text)!important}.pms184-supplier-table td:last-child{white-space:nowrap}.pms184-supplier-table td:last-child button{margin:2px!important}@media print{.print-table th,.print-table td{font-size:10px!important;padding:6px!important}}";
    document.head.appendChild(style);
  }

  function refresh() {
    injectStyle();
    ensureOfferSchema();
    decorateOfferWidget();
    decorateSimpleOfferModal();
    decorateSupplierModal();
    decorateSupplierTable();
    bindPrintButtons();
  }

  window.printOfferV251 = offerPrint;
  window.printSupplierPriceV251 = supplierPrint;
  try { window.printOffer = id => offerPrint(id, "external"); } catch (error) {}

  if (typeof window.bindPageActions === "function") {
    const baseBind = window.bindPageActions;
    window.bindPageActions = function pms251BindPageActions() {
      const result = baseBind.apply(this, arguments);
      setTimeout(refresh, 0);
      return result;
    };
    try { bindPageActions = window.bindPageActions; } catch (error) {}
  }

  const observer = new MutationObserver(() => {
    window.clearTimeout(window.pms251RefreshTimer);
    window.pms251RefreshTimer = window.setTimeout(refresh, 20);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(refresh, 0);
  console.info("pms_v251_whole_forms_piece_count loaded");
})();
