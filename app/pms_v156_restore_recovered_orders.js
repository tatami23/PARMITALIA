(function(){
  const VERSION = "pms_v156_restore_recovered_orders";

  const RECOVERED_ORDERS = [
    {
      "id": "ORD-83011",
      "orderType": "Ordine continuativo",
      "client": "Whiteland Food Trading Company LLC",
      "supplier": "Zarpellon",
      "orderLineItemsJson": "[{\"articleCode\":\"FGO-L1-20260627-0231\",\"product\":\"GRANA PADANO \",\"description\":\"Grana padano 1/8\",\"quantity\":\"3000\",\"unit\":\"kg\",\"unitPrice\":\"9.85\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"PRD-002\",\"product\":\"HARD CHEESE\",\"description\":\"HARD CHEESE 1/8\",\"quantity\":\"16000\",\"unit\":\"kg\",\"unitPrice\":\"7\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"\",\"product\":\"EMMENTAL\",\"description\":\"EMMENTHAL \",\"quantity\":\"1000\",\"unit\":\"kg\",\"unitPrice\":\"4.25\",\"currency\":\"EUR\",\"discountPct\":\"0\"}]",
      "product": "GRANA PADANO  (+2 articoli)",
      "description": "",
      "quantity": 20000,
      "unit": "kg",
      "priceType": "Multi-articolo",
      "unitPrice": 7.29,
      "currency": "EUR",
      "paymentTerms": "Alla consegna",
      "delivery": "FOB",
      "frequency": "Settimanale",
      "requestedDate": "2026-07-08",
      "expectedDelivery": "2026-07-17",
      "linkedOffer": "",
      "invoiceReference": "",
      "status": "In evasione",
      "notes": "C1003-GP1004",
      "code": "ORD-2026-0001",
      "orderDate": "2026-07-08",
      "commissionPct": 1,
      "commissionStatus": "Da maturare"
    },
    {
      "id": "ORD-75962",
      "orderType": "Ordine continuativo",
      "orderDate": "2026-07-13",
      "client": "Whiteland Food Trading Company LLC",
      "supplier": "Zarpellon",
      "orderLineItemsJson": "[{\"articleCode\":\"PRD-002\",\"product\":\"Hard Cheese\",\"description\":\"HARD CHEESE 1/8\",\"quantity\":\"6000\",\"unit\":\"kg\",\"unitPrice\":\"7\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"FGO-L1-20260627-0231\",\"product\":\"GRANA PADANO \",\"description\":\"Grana padano 1/8 \",\"quantity\":\"2000\",\"unit\":\"kg\",\"unitPrice\":\"9.85\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"\",\"product\":\"EMMENTHAL\",\"description\":\"EMMENTHAL \",\"quantity\":\"4000\",\"unit\":\"kg\",\"unitPrice\":\"4.25\",\"currency\":\"EUR\",\"discountPct\":\"0\"}]",
      "product": "Hard Cheese (+2 articoli)",
      "description": "",
      "quantity": 12000,
      "unit": "kg",
      "priceType": "Multi-articolo",
      "unitPrice": 6.558333333333334,
      "currency": "EUR",
      "commissionPct": 1,
      "commissionStatus": "Da maturare",
      "paymentTerms": "Alla consegna",
      "delivery": "EXW",
      "frequency": "Settimanale",
      "requestedDate": "2026-07-13",
      "expectedDelivery": "",
      "linkedOffer": "",
      "invoiceReference": "",
      "status": "In evasione",
      "notes": "",
      "code": "ORD-2026-0004"
    },
    {
      "id": "ORD-15403",
      "orderType": "Ordine continuativo",
      "orderDate": "2026-07-13",
      "client": "Whiteland Food Trading Company LLC",
      "supplier": "Zarpellon",
      "orderLineItemsJson": "[{\"articleCode\":\"FGO-L1-20260627-0231\",\"product\":\"GRANA PADANO \",\"description\":\"Grana padano 1/8\",\"quantity\":\"3000\",\"unit\":\"kg\",\"unitPrice\":\"9.85\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"PRD-002\",\"product\":\"Hard Cheese\",\"description\":\"HARD CHEESE 1/8 \",\"quantity\":\"14500\",\"unit\":\"kg\",\"unitPrice\":\"7\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"\",\"product\":\"EMMENTHAL\",\"description\":\"EMMENTHAL\",\"quantity\":\"2500\",\"unit\":\"kg\",\"unitPrice\":\"4.25\",\"currency\":\"EUR\",\"discountPct\":\"0\"}]",
      "product": "GRANA PADANO  (+2 articoli)",
      "description": "",
      "quantity": 20000,
      "unit": "kg",
      "priceType": "Multi-articolo",
      "unitPrice": 7.08375,
      "currency": "EUR",
      "commissionPct": 1,
      "commissionStatus": "Da maturare",
      "paymentTerms": "30 giorni",
      "delivery": "EXW",
      "frequency": "Settimanale",
      "requestedDate": "2026-07-13",
      "expectedDelivery": "",
      "linkedOffer": "",
      "invoiceReference": "",
      "status": "In evasione",
      "notes": "",
      "code": "ORD-2026-0003"
    },
    {
      "id": "ORD-53488",
      "orderType": "Ordine continuativo",
      "orderDate": "2026-07-13",
      "client": "Whiteland Food Trading Company LLC",
      "supplier": "Zarpellon",
      "orderLineItemsJson": "[{\"articleCode\":\"PRD-002\",\"product\":\"Hard Cheese\",\"description\":\"HARD CHEESE 1/8\",\"quantity\":\"15000\",\"unit\":\"kg\",\"unitPrice\":\"7\",\"currency\":\"EUR\",\"discountPct\":\"0\"},{\"articleCode\":\"FGO-L1-20260627-0231\",\"product\":\"GRANA PADANO \",\"description\":\"Grana padano 1/8\",\"quantity\":\"5000\",\"unit\":\"kg\",\"unitPrice\":\"9.85\",\"currency\":\"EUR\",\"discountPct\":\"0\"}]",
      "product": "Hard Cheese (+1 articoli)",
      "description": "",
      "quantity": 20000,
      "unit": "kg",
      "priceType": "Multi-articolo",
      "unitPrice": 7.7125,
      "currency": "EUR",
      "commissionPct": 1,
      "commissionStatus": "Da maturare",
      "paymentTerms": "Alla consegna",
      "delivery": "EXW",
      "frequency": "Settimanale",
      "requestedDate": "2026-07-13",
      "expectedDelivery": "",
      "linkedOffer": "",
      "invoiceReference": "",
      "status": "In evasione",
      "notes": "",
      "code": "ORD-2026-0002"
    },
    {
      "id": "ORD-92906",
      "orderType": "Riordino",
      "orderDate": "2026-07-15",
      "client": "DELIZIE DORA SRL",
      "supplier": "GEACOM SRL",
      "orderLineItemsJson": "[{\"product\":\"WHEYPOWDER CONCENTRATE \",\"description\":\"WHEYPOWDER CONCENTRASTE 70%\",\"quantity\":\"400\",\"unit\":\"kg\",\"priceType\":\"Prezzo al kg\",\"unitPrice\":\"17.30\",\"currency\":\"EUR\"}]",
      "product": "WHEYPOWDER CONCENTRATE ",
      "description": "WHEYPOWDER CONCENTRATE 70%",
      "quantity": 400,
      "unit": "kg",
      "priceType": "Prezzo al kg",
      "unitPrice": 17.3,
      "currency": "EUR",
      "commissionPct": 1.76,
      "commissionStatus": "Da maturare",
      "paymentTerms": "Alla consegna",
      "delivery": "EXW",
      "frequency": "Mensile",
      "requestedDate": "2026-07-15",
      "expectedDelivery": "2026-07-21",
      "linkedOffer": "",
      "invoiceReference": "",
      "status": "Confermato",
      "notes": "TRASPORTO IN CARICO A NOI FATTURATO SEPARATAMENTE ",
      "code": "ORD-2026-0005"
    },
    {
      "id": "ORD-33189",
      "orderType": "Campionatura",
      "orderDate": "2026-07-07",
      "client": "DELIZIE DORA SRL",
      "supplier": "GEACOM SRL",
      "orderLineItemsJson": "[{\"articleCode\":\"\",\"product\":\"WHEYPOWDER \",\"description\":\"WHEYPOWDER 70% \",\"quantity\":\"200\",\"unit\":\"kg\",\"unitPrice\":\"17.30\",\"currency\":\"EUR\",\"discountPct\":\"0\"}]",
      "product": "WHEYPOWDER ",
      "description": "",
      "quantity": 200,
      "unit": "kg",
      "priceType": "Multi-articolo",
      "unitPrice": 17.3,
      "currency": "EUR",
      "commissionPct": 1.76,
      "commissionStatus": "Da fatturare",
      "paymentTerms": "Alla consegna",
      "delivery": "EXW",
      "frequency": "Mensile",
      "requestedDate": "2026-07-01",
      "expectedDelivery": "2026-07-07",
      "linkedOffer": "",
      "invoiceReference": "",
      "status": "Fatturato",
      "notes": "",
      "code": "ORD-2026-0006"
    }
  ];

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function sameOrder(a, b){
    return Boolean((a.id && b.id && a.id === b.id) || (a.code && b.code && a.code === b.code));
  }

  function restoreRecoveredOrders(){
    if (typeof state === "undefined" || !state) return 0;
    state.orders = Array.isArray(state.orders) ? state.orders : [];

    let added = 0;
    RECOVERED_ORDERS.forEach(function(recovered){
      const exists = state.orders.some(function(existing){ return sameOrder(existing || {}, recovered); });
      if (!exists) {
        state.orders.push(clone(recovered));
        added += 1;
      }
    });

    if (added) {
      state.__pms156RecoveredOrdersAt = new Date().toISOString();
      state.__pms156RecoveredOrdersCount = added;
      try {
        if (typeof save === "function") save();
        else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch(error) {
        console.warn(VERSION + " save failed", error);
      }
      try {
        if (typeof render === "function") render();
      } catch(error) {
        console.warn(VERSION + " render failed", error);
      }
    }
    return added;
  }

  window.pmsV156RestoreRecoveredOrders = restoreRecoveredOrders;

  function run(){
    const added = restoreRecoveredOrders();
    if (added) console.info(VERSION + " restored " + added + " orders");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
})();
