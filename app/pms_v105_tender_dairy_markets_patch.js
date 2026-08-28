(function(){
  "use strict";
  const VERSION = "PMS-V105-TENDER-DAIRY-MARKETS";
  const DAIRY_MARKETS = [
    {id:"MKT105-CREAM-MI",group:"Panna",name:"Crema di latte 40% m.g.",product:"Panna / crema di latte",market:"Italia - Milano",unit:"EUR/kg",source:"CLAL / CCIAA Milano Monza Brianza Lodi",sourceUrl:"https://teseo.clal.it/clal20/?section=panna_italia",date:"2026-07-06",price:1.72,y2024:1.68,y2025:1.46,y2026:1.72,note:"Prezzo settimanale crema di latte 40% m.g. Milano."},
    {id:"MKT105-CREAM-IT",group:"Panna",name:"Crema da latte italiana 40% m.g.",product:"Panna italiana",market:"Italia - Milano",unit:"EUR/kg",source:"CLAL / CCIAA Milano Monza Brianza Lodi",sourceUrl:"https://teseo.clal.it/clal20/?section=panna_italia",date:"2026-07-06",price:1.86,y2024:1.76,y2025:1.58,y2026:1.86,note:"Crema da latte italiano 40% m.g.; riferimento operativo per panna."},
    {id:"MKT105-BUTTER-MI",group:"Burro",name:"Burro Reg. CEE 1308/2013",product:"Burro",market:"Italia - Milano",unit:"EUR/kg",source:"CLAL / CCIAA Milano Monza Brianza Lodi",sourceUrl:"https://www.clal.it/clal20/?section=burro_milano",date:"2026-07-06",price:3.75,y2024:4.65,y2025:7.31,y2026:3.75,note:"Burro Reg. CEE Milano, franco partenza, IVA esclusa."},
    {id:"MKT105-BUTTER-KEMPTEN",group:"Burro",name:"Deutsche Markenbutter",product:"Burro",market:"Germania - Kempten",unit:"EUR/kg",source:"CLAL / Butter-und Kaese-Boerse Kempten",sourceUrl:"https://www.clal.it/en/?section=burro_germania",date:"2026-07-15",price:4.23,y2024:5.89,y2025:8.65,y2026:4.23,note:"Media Kempten normalizzata in EUR/kg."},
    {id:"MKT105-BUTTER-EU",group:"Burro",name:"Burro industriale Europa",product:"Burro",market:"Europa - principali piazze",unit:"EUR/kg",source:"CLAL / MMO Europa",sourceUrl:"https://www.clal.it/en/?prodotto_tabella=butter&section=panoramica_prezzi&title=Butter%2F&zona=E",date:"2026-07-03",price:4.10,y2024:6.62,y2025:6.47,y2026:4.10,note:"Panoramica Europa normalizzata in EUR/kg."},
    {id:"MKT105-DAIRY-EU",group:"Latticini",name:"Latticini UE - indice formaggi",product:"Latticini / formaggi",market:"UE-27",unit:"EUR/kg",source:"CLAL / European Commission Milk Market Observatory",sourceUrl:"https://teseo.clal.it/clal20/en/?campo=gouda&section=prezzi_prodotti_mmo",date:"2026-07-05",price:3.84,y2024:4.36,y2025:4.86,y2026:3.84,note:"Gouda EU-27 come indicatore generale latticini/formaggi, normalizzato in EUR/kg."},
    {id:"MKT105-CURD-IT",group:"Cagliate",name:"Cagliata lattica 45-48%",product:"Cagliata",market:"Italia / UE fornitori",unit:"EUR/kg",source:"Listini fornitori / CLAL da aggiornare",sourceUrl:"https://www.clal.it/",date:"2026-07-17",price:3.35,y2024:3.05,y2025:3.48,y2026:3.35,note:"Voce operativa da aggiornare con listini reali cagliate."},
    {id:"MKT105-CURD-FROZEN",group:"Cagliate",name:"Cagliata frozen 15%",product:"Cagliata frozen",market:"UE fornitori",unit:"EUR/kg",source:"Listini fornitori / CLAL da aggiornare",sourceUrl:"https://www.clal.it/",date:"2026-07-17",price:2.18,y2024:2.02,y2025:2.34,y2026:2.18,note:"Voce operativa per cagliate congelate."}
  ];
  const EU_MARKETS = [
    {name:"Italia",area:"Milano, Verona, Parma, Reggio Emilia",focus:"panna, burro, formaggi, cagliate"},
    {name:"Germania",area:"Kempten / Hannover",focus:"burro, formaggi, polveri latte"},
    {name:"Paesi Bassi",area:"Dutch dairy market",focus:"burro e commodity lattiero-casearie"},
    {name:"Francia",area:"FranceAgriMer",focus:"burro industriale, panna, latte"},
    {name:"Belgio",area:"MMO Belgio / fornitori Benelux",focus:"crema 26%, SMP, vegetale pizza"},
    {name:"Polonia",area:"Ministero agricoltura / mercato lattiero",focus:"burro e latticini EU"},
    {name:"Lituania",area:"MMO Lituania / Baltico",focus:"crema 26%, preparati vegetali, commodity latte"},
    {name:"Romania",area:"MMO Romania / mercato regionale",focus:"crema 26%, mozzarella, preparato pizza"},
    {name:"Ucraina",area:"Monitoraggio fornitori e rischio logistico",focus:"preparati alimentari base grasso vegetale"},
    {name:"Nuova Zelanda",area:"Export dairy e food preparations",focus:"preparato pizza, polveri e derivati latte"}
  ];
  const EXTRA_DAIRY_MARKETS = [
    {id:"MKT118-CREAM26-FR",group:"Crema di latte 26%",name:"Crema di latte 26% Francia",product:"Crema di latte 26%",market:"Francia",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / FranceAgriMer",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:1.22,y2024:1.68,y2025:1.28,y2026:1.22,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-CREAM26-DE",group:"Crema di latte 26%",name:"Crema di latte 26% Germania",product:"Crema di latte 26%",market:"Germania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / Kempten-MMO",sourceUrl:"https://agriculture.ec.europa.eu/data-and-analysis/markets/price-data/price-monitoring-sector/milk-and-dairy-products_en",date:"2026-07-17",price:1.18,y2024:1.62,y2025:1.24,y2026:1.18,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-CREAM26-BE",group:"Crema di latte 26%",name:"Crema di latte 26% Belgio",product:"Crema di latte 26%",market:"Belgio",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / MMO Belgio",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:1.20,y2024:1.65,y2025:1.26,y2026:1.20,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-CREAM26-NL",group:"Crema di latte 26%",name:"Crema di latte 26% Olanda",product:"Crema di latte 26%",market:"Paesi Bassi",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / ZuivelNL-MMO",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:1.17,y2024:1.61,y2025:1.23,y2026:1.17,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-CREAM26-PL",group:"Crema di latte 26%",name:"Crema di latte 26% Polonia",product:"Crema di latte 26%",market:"Polonia",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / MMO Polonia",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:1.12,y2024:1.54,y2025:1.18,y2026:1.12,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-CREAM26-LT",group:"Crema di latte 26%",name:"Crema di latte 26% Lituania",product:"Crema di latte 26%",market:"Lituania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / MMO Lituania",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:1.10,y2024:1.50,y2025:1.15,y2026:1.10,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-CREAM26-IT",group:"Crema di latte 26%",name:"Crema di latte 26% Italia",product:"Crema di latte 26%",market:"Italia",unit:"EUR/kg",source:"CLAL / Milano-Verona, normalizzazione 26%",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-13",price:1.25,y2024:2.35,y2025:1.17,y2026:1.25,note:"Derivata da crema italiana 40% Milano 1,92 EUR/kg e normalizzata al 26% m.g."},
    {id:"MKT118-CREAM26-RO",group:"Crema di latte 26%",name:"Crema di latte 26% Romania",product:"Crema di latte 26%",market:"Romania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / MMO Romania",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:1.16,y2024:1.58,y2025:1.22,y2026:1.16,note:"Voce da tenere monitorata; normalizzata 26% m.g., da confermare con fornitore."},
    {id:"MKT118-MPC-EU",group:"Polveri latte",name:"Milk powder concentrate / MPC",product:"Milk powder concentrate",market:"UE-27 export",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / CLAL WPC-MPC",sourceUrl:"https://www.clal.it/en/?section=demi",date:"2026-07-17",price:4.85,y2024:4.35,y2025:4.56,y2026:4.85,note:"Voce da monitorare per concentrati proteici del latte; prezzo operativo in EUR/kg."},
    {id:"MKT118-SMP-FR",group:"Polveri latte",name:"Latte scremato in polvere SMP Francia",product:"SMP",market:"Francia",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-04",price:2.64,y2024:2.36,y2025:2.88,y2026:2.64,note:"Quotazione CLAL normalizzata in EUR/kg."},
    {id:"MKT118-SMP-DE",group:"Polveri latte",name:"Latte scremato in polvere SMP Germania",product:"SMP",market:"Germania",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-08",price:2.75,y2024:2.38,y2025:2.81,y2026:2.75,note:"SMP ADPI-Extra Germania normalizzato in EUR/kg."},
    {id:"MKT118-SMP-NL",group:"Polveri latte",name:"Latte scremato in polvere SMP Olanda",product:"SMP",market:"Paesi Bassi",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-08",price:2.69,y2024:2.38,y2025:2.76,y2026:2.69,note:"SMP uso alimentare Paesi Bassi normalizzato in EUR/kg."},
    {id:"MKT118-SMP-EU",group:"Polveri latte",name:"Latte scremato in polvere SMP UE",product:"SMP",market:"UE-27",unit:"EUR/kg",source:"European Commission Milk Market Observatory",sourceUrl:"https://agriculture.ec.europa.eu/data-and-analysis/markets/price-data/price-monitoring-sector/milk-and-dairy-products_en",date:"2026-07-16",price:2.70,y2024:2.79,y2025:2.79,y2026:2.70,note:"Quotazione MMO normalizzata in EUR/kg."},
    {id:"MKT118-WMP26-DE",group:"Polveri latte",name:"Latte intero in polvere 26% Germania",product:"WMP 26%",market:"Germania",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-08",price:3.09,y2024:4.35,y2025:3.18,y2026:3.09,note:"WMP 26% Germania normalizzato in EUR/kg."},
    {id:"MKT118-WMP26-NL",group:"Polveri latte",name:"Latte intero in polvere 26% Olanda",product:"WMP 26%",market:"Paesi Bassi",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-08",price:3.08,y2024:4.34,y2025:3.20,y2026:3.08,note:"WMP 26% Paesi Bassi normalizzato in EUR/kg."},
    {id:"MKT118-WMP26-EU",group:"Polveri latte",name:"Latte intero in polvere WMP UE",product:"WMP 26%",market:"UE-27",unit:"EUR/kg",source:"European Commission Milk Market Observatory",sourceUrl:"https://agriculture.ec.europa.eu/data-and-analysis/markets/price-data/price-monitoring-sector/milk-and-dairy-products_en",date:"2026-07-16",price:3.25,y2024:3.34,y2025:3.34,y2026:3.25,note:"Quotazione MMO normalizzata in EUR/kg."},
    {id:"MKT118-WHEY-FR",group:"Siero",name:"Siero di latte in polvere Francia",product:"Siero di latte in polvere",market:"Francia",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-04-25",price:1.47,y2024:0.77,y2025:1.03,y2026:1.47,note:"Polvere di siero Francia normalizzata in EUR/kg."},
    {id:"MKT118-WHEY-NL",group:"Siero",name:"Siero di latte in polvere Olanda",product:"Siero di latte in polvere",market:"Paesi Bassi",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-08",price:1.30,y2024:0.80,y2025:1.48,y2026:1.30,note:"Polvere di siero Paesi Bassi normalizzata in EUR/kg."},
    {id:"MKT118-WHEY-DE",group:"Siero",name:"Whey powder uso alimentare Germania",product:"Siero di latte in polvere",market:"Germania",unit:"EUR/kg",source:"CLAL / riepilogo prezzi",sourceUrl:"https://teseo.clal.it/en/en/clal20/?section=riepilogo",date:"2026-07-08",price:1.92,y2024:1.42,y2025:1.92,y2026:1.92,note:"Whey powder food Germania normalizzato in EUR/kg."},
    {id:"MKT118-WHEY-EU",group:"Siero",name:"Siero di latte in polvere UE",product:"Siero di latte in polvere",market:"UE-27",unit:"EUR/kg",source:"European Commission Milk Market Observatory",sourceUrl:"https://agriculture.ec.europa.eu/data-and-analysis/markets/price-data/price-monitoring-sector/milk-and-dairy-products_en",date:"2026-07-16",price:1.37,y2024:1.41,y2025:1.41,y2026:1.37,note:"Quotazione MMO normalizzata in EUR/kg."},
    {id:"MKT118-WPC35-EU",group:"Siero proteico",name:"WPC 35 Europa",product:"WPC 35",market:"UE-27 export",unit:"EUR/kg",source:"CLAL / export WPC 35",sourceUrl:"https://www.clal.it/en/?section=demi",date:"2026-05-31",price:5.14,y2024:4.54,y2025:4.56,y2026:5.14,note:"CLAL: EU export HS 04041014 WPC 35, normalizzato in EUR/kg."},
    {id:"MKT118-WPC80-EU",group:"Siero proteico",name:"WPC 80 Europa",product:"WPC 80",market:"UE-27 export",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / CLAL WPC",sourceUrl:"https://www.clal.it/en/?section=demi",date:"2026-07-17",price:8.90,y2024:7.60,y2025:8.20,y2026:8.90,note:"Voce da monitorare: WPC 80 alimentare, prezzo operativo in EUR/kg da confermare con fornitore."}
  ];
  const PIZZA_VEGETABLE_MARKETS = [
    {id:"MKT118-PIZZA-UK",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Inghilterra",product:"Preparato alimentare da pizza vegetale",market:"Inghilterra",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.95,y2024:2.75,y2025:2.86,y2026:2.95,note:"Analogo mozzarella / pizza topping vegetale; prezzo operativo convertito a EUR/kg."},
    {id:"MKT118-PIZZA-NL",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Olanda",product:"Preparato alimentare da pizza vegetale",market:"Paesi Bassi",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.78,y2024:2.60,y2025:2.70,y2026:2.78,note:"Analogo mozzarella / pizza topping vegetale; confermare resa, blocco o julienne."},
    {id:"MKT118-PIZZA-NZ",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Nuova Zelanda",product:"Preparato alimentare da pizza vegetale",market:"Nuova Zelanda",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:3.20,y2024:2.95,y2025:3.08,y2026:3.20,note:"Analogo mozzarella / pizza topping vegetale; prezzo operativo import/export."},
    {id:"MKT118-PIZZA-DE",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Germania",product:"Preparato alimentare da pizza vegetale",market:"Germania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.82,y2024:2.62,y2025:2.73,y2026:2.82,note:"Analogo mozzarella / pizza topping vegetale; confermare con fornitore Germania."},
    {id:"MKT118-PIZZA-PL",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Polonia",product:"Preparato alimentare da pizza vegetale",market:"Polonia",unit:"EUR/kg",source:"Foodcom / B2B Central Europe",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.70,y2024:2.52,y2025:2.62,y2026:2.70,note:"Foodcom indica 2,70 EUR/kg per analogo mozzarella / pizza topping vegetale."},
    {id:"MKT118-PIZZA-LT",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Lituania",product:"Preparato alimentare da pizza vegetale",market:"Lituania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.66,y2024:2.48,y2025:2.58,y2026:2.66,note:"Analogo mozzarella / pizza topping vegetale; confermare con fornitore Lituania."},
    {id:"MKT118-PIZZA-IT",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Italia",product:"Preparato alimentare da pizza vegetale",market:"Italia",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / listini italiani",sourceUrl:"https://www.mozzarellaperpizza.it/en/products/preparato-alimentare-filaverde-2-kg",date:"2026-07-17",price:3.05,y2024:2.82,y2025:2.96,y2026:3.05,note:"B2B indicativo per prodotto food-service; retail vegan a 7,50 EUR/kg usato solo come limite superiore."},
    {id:"MKT118-PIZZA-RO",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Romania",product:"Preparato alimentare da pizza vegetale",market:"Romania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.74,y2024:2.55,y2025:2.65,y2026:2.74,note:"Analogo mozzarella / pizza topping vegetale; confermare con fornitore Romania."},
    {id:"MKT118-PIZZA-UA",group:"Vegetale pizza",name:"Preparato alimentare pizza base grasso vegetale - Ucraina",product:"Preparato alimentare da pizza vegetale",market:"Ucraina",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / B2B cheese analogue",sourceUrl:"https://foodcom.pl/en/products/cheese-analogue/",date:"2026-07-17",price:2.58,y2024:2.42,y2025:2.50,y2026:2.58,note:"Analogo mozzarella / pizza topping vegetale; prezzo operativo da confermare con rischio logistico."}
  ];
  const MOZZARELLA_100_MARKETS = [
    {id:"MKT123-MOZZ100-IT",group:"Mozzarella 100%",name:"Mozzarella 100% latte - Italia",product:"Mozzarella 100% latte",market:"Italia",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / listini mozzarella latte",sourceUrl:"https://www.clal.it/",date:"2026-07-17",price:4.35,y2024:4.05,y2025:4.58,y2026:4.35,note:"Mozzarella 100% latte vaccino per pizza/food service; prezzo operativo da confermare con fornitore."},
    {id:"MKT123-MOZZ100-DE",group:"Mozzarella 100%",name:"Mozzarella 100% latte - Germania",product:"Mozzarella 100% latte",market:"Germania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / mercato mozzarella UE",sourceUrl:"https://agriculture.ec.europa.eu/data-and-analysis/markets/price-data/price-monitoring-sector/milk-and-dairy-products_en",date:"2026-07-17",price:4.10,y2024:3.86,y2025:4.32,y2026:4.10,note:"Mozzarella 100% latte vaccino; riferimento operativo Germania/UE."},
    {id:"MKT123-MOZZ100-NL",group:"Mozzarella 100%",name:"Mozzarella 100% latte - Olanda",product:"Mozzarella 100% latte",market:"Paesi Bassi",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / mercato mozzarella Benelux",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:4.05,y2024:3.82,y2025:4.25,y2026:4.05,note:"Mozzarella 100% latte vaccino; riferimento operativo Olanda/Benelux."},
    {id:"MKT123-MOZZ100-PL",group:"Mozzarella 100%",name:"Mozzarella 100% latte - Polonia",product:"Mozzarella 100% latte",market:"Polonia",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / listini Polonia",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:3.85,y2024:3.62,y2025:4.05,y2026:3.85,note:"Mozzarella 100% latte vaccino; prezzo operativo Polonia."},
    {id:"MKT123-MOZZ100-RO",group:"Mozzarella 100%",name:"Mozzarella 100% latte - Romania",product:"Mozzarella 100% latte",market:"Romania",unit:"EUR/kg",source:"Monitoraggio operativo Parmitalia / mercato Romania",sourceUrl:"https://agridata.ec.europa.eu/extensions/DataPortal/milk.html",date:"2026-07-17",price:4.00,y2024:3.75,y2025:4.18,y2026:4.00,note:"Mozzarella 100% latte vaccino; prezzo operativo Romania."}
  ];
  const ALL_MARKET_SEEDS = DAIRY_MARKETS.concat(EXTRA_DAIRY_MARKETS,MOZZARELLA_100_MARKETS,PIZZA_VEGETABLE_MARKETS);
  const CEREAL_RE = /(grano|frumento|duro|cereal|semola|seminativi|mais|corn|wheat|durum)/i;

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v){ const n = Number(String(v == null ? "" : v).replace(/\s/g,"").replace(",",".")); return Number.isFinite(n) ? n : 0; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function saveState(){ try { if (typeof save === "function") return save(); localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; } catch(e){ console.warn(e); return false; } }
  function next(prefix,list,field){
    const y = new Date().getFullYear();
    const re = new RegExp("^" + prefix + "-" + y + "-(\\d{4})$");
    const max = arr(list).reduce((a,x) => {
      const m = String((field && x[field]) || x.protocol || x.code || x.id || "").match(re);
      return m ? Math.max(a, Number(m[1])) : a;
    },0);
    return prefix + "-" + y + "-" + String(max + 1).padStart(4,"0");
  }
  function money(v,c){ return (c || "EUR") + " " + num(v).toLocaleString("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function barcode(code){ return typeof renderBarcode === "function" ? renderBarcode(code) : (typeof renderQrLite === "function" ? renderQrLite(code) : "<strong>" + esc(code) + "</strong>"); }
  function header(title,code,sub){
    if (typeof companyPrintHeader === "function") return companyPrintHeader(title,code,sub || "");
    return '<div class="print-header"><div><h1>' + esc(title) + '</h1><strong>' + esc(state.settings?.legalName || "PARMITALIA DISTRIBUTION SRL") + '</strong></div><div class="print-meta"><strong>' + esc(code || "") + '</strong><br>' + esc(today()) + '</div></div>';
  }
  function isCereal(row){
    return CEREAL_RE.test([row.id,row.group,row.category,row.name,row.product,row.market,row.source,row.note].filter(Boolean).join(" "));
  }
  function toKgValue(value,unit){
    const n = num(value);
    if (!n) return value;
    if (/EUR\/t|EUR\/MT|EUR\s*\/\s*ton/i.test(unit || "")) return Number((n / 1000).toFixed(2));
    if (/100\s*kg/i.test(unit || "")) return Number((n / 100).toFixed(2));
    return Number(n.toFixed(2));
  }
  function normalizeKg(row){
    const unit = row && row.unit;
    if (!/EUR\/t|EUR\/MT|EUR\s*\/\s*ton|100\s*kg/i.test(unit || "")) {
      if (row && row.unit === "EUR/kg") {
        ["price","y2024","y2025","y2026"].forEach(k => { if (row[k] != null) row[k] = toKgValue(row[k],row.unit); });
      }
      return row;
    }
    ["price","y2024","y2025","y2026"].forEach(k => { if (row[k] != null) row[k] = toKgValue(row[k],unit); });
    row.unit = "EUR/kg";
    row.note = (row.note ? row.note + " " : "") + "Valori normalizzati in EUR/kg.";
    return row;
  }
  function ensure(){
    window.state = window.state || {};
    state.settings = state.settings || {};
    state.marketPreview52 = arr(state.marketPreview52).filter(r => !isCereal(r)).map(r => normalizeKg(r));
    state.marketTrends = arr(state.marketTrends).filter(r => !isCereal(r)).map(r => normalizeKg(r));
    ALL_MARKET_SEEDS.forEach(seed => {
      const s = normalizeKg(Object.assign({},seed));
      const preview = {id:s.id,group:s.group,name:s.name,unit:s.unit,source:s.source,sourceUrl:s.sourceUrl,y2024:s.y2024,y2025:s.y2025,y2026:s.y2026,note:s.note};
      const pIdx = state.marketPreview52.findIndex(x => x.id === s.id);
      if (pIdx >= 0) state.marketPreview52[pIdx] = Object.assign({},state.marketPreview52[pIdx],preview);
      else state.marketPreview52.unshift(preview);
      const tIdx = state.marketTrends.findIndex(x => x.id === s.id);
      const trend = Object.assign({},s,{category:s.group,currency:"EUR"});
      if (tIdx >= 0) state.marketTrends[tIdx] = Object.assign({},state.marketTrends[tIdx],trend);
      else state.marketTrends.unshift(trend);
    });
    state.marketSourceUpdates = arr(state.marketSourceUpdates);
    state.tenders = arr(state.tenders);
    state.tenderEvents = arr(state.tenderEvents);
    if (typeof modules !== "undefined") {
      let mod = modules.find(m => m.id === "tenders");
      if (!mod) { modules.push({id:"tenders",label:"Tender",subtitle:"Gare, richieste, capitolati e offerte economiche",roles:["admin","assistant"],code:"TEN",group:"Commerciale"}); mod = modules[modules.length - 1]; }
      mod.label = "Tender";
      mod.subtitle = "Gare, richieste, capitolati e offerte economiche";
      mod.code = mod.code || "TEN";
      const market = modules.find(m => m.id === "marketTrends");
      if (market) market.subtitle = "Prezzi e previsioni in EUR/kg: crema, polveri, siero, WPC e vegetale pizza";
    }
  }
  function css(){
    if (document.getElementById("pms-v105-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v105-style";
    s.textContent = ".pms105-page{display:grid;gap:14px}.pms105-hero{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;background:#0f2f4a;color:#fff;border-radius:8px;padding:16px 18px}.pms105-hero h3{margin:2px 0 6px;color:#fff}.pms105-hero p{margin:0;color:#dbeafe}.pms105-actions{display:flex;gap:8px;flex-wrap:wrap}.pms105-actions button{width:auto!important;margin:0!important}.pms105-ticker{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;overflow:hidden;border:1px solid rgba(56,189,248,.36);border-radius:8px;background:#061a2d;color:#e0f2fe;box-shadow:0 10px 24px rgba(15,23,42,.14),inset 0 0 22px rgba(14,165,233,.10)}.pms105-ticker-label{height:38px;display:grid;place-items:center;padding:0 12px;background:#0f766e;color:#fff;font-size:12px;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.pms105-ticker-window{overflow:hidden;white-space:nowrap;min-width:0}.pms105-ticker-track{display:inline-flex;gap:34px;align-items:center;min-width:max-content;padding:0 0 0 100%;animation:pms105-ticker-scroll 140s linear infinite}.pms105-ticker:hover .pms105-ticker-track{animation-play-state:paused}.pms105-ticker-item{display:inline-flex;align-items:center;gap:8px;height:38px;font-size:13px;font-weight:800}.pms105-ticker-item strong{color:#fff}.pms105-ticker-item span{color:#bae6fd}.pms105-ticker-dot{width:6px;height:6px;border-radius:50%;background:#22d3ee;box-shadow:0 0 10px #67e8f9}@keyframes pms105-ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-100%)}}.pms105-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.pms105-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:14px}.pms105-kpi{font-size:25px;font-weight:900;color:#0f2f4a}.pms105-muted{color:var(--muted);font-size:12px;line-height:1.45}.pms105-chart-row{display:grid;grid-template-columns:190px 1fr 96px;gap:9px;align-items:center;margin:8px 0}.pms105-bar{height:14px;border-radius:999px;background:#dbeafe;overflow:hidden}.pms105-bar span{display:block;height:100%;background:#0f766e}.pms105-pill{display:inline-flex;border:1px solid #bfdbfe;background:#eff6ff;color:#1d4ed8;border-radius:999px;padding:4px 9px;font-size:12px;font-weight:900}.pms105-modal{position:fixed;inset:0;z-index:24000;background:rgba(15,23,42,.55);display:grid;place-items:center;padding:14px}.pms105-modal-card{width:min(1120px,96vw);max-height:94vh;overflow:auto;background:#fff;border-radius:8px;box-shadow:0 24px 70px rgba(15,23,42,.32)}.pms105-modal-head{display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:2}.pms105-modal-body{padding:16px}.pms105-modal-actions{position:sticky;bottom:0;background:#fff;border-top:1px solid var(--line);padding:12px 16px;display:flex;justify-content:flex-end;gap:8px}.pms105-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:11px}.pms105-form .half{grid-column:span 2}.pms105-form .full{grid-column:1/-1}.pms105-form label{display:grid;gap:5px;font-size:12px;font-weight:800;color:var(--muted)}.pms105-form textarea{min-height:120px;line-height:1.45}.pms105-tabs{display:flex;gap:8px;flex-wrap:wrap}.pms105-tabs span{border:1px solid var(--line);border-radius:999px;padding:6px 10px;background:#f8fafc;font-weight:800;font-size:12px}.pms105-print-body{white-space:pre-wrap;line-height:1.35}@media(max-width:900px){.pms105-hero{display:grid}.pms105-form{grid-template-columns:1fr}.pms105-form .half{grid-column:1/-1}.pms105-chart-row{grid-template-columns:1fr}.pms105-ticker{grid-template-columns:1fr}.pms105-ticker-label{height:30px}.pms105-ticker-item{height:36px;font-size:12px}}@media print{@page{size:A4;margin:9mm}#print-root .pms105-print{min-height:0!important;height:auto!important;font-size:9pt!important;line-height:1.22!important;break-after:avoid!important;page-break-after:avoid!important}.pms105-no-print,.pms105-ticker{display:none!important}}";
    document.head.appendChild(s);
  }
  function logSource(kind,status,message){
    state.marketSourceUpdates.unshift({id:next("SRC",state.marketSourceUpdates),kind,status,message,date:new Date().toISOString()});
    state.marketSourceUpdates = state.marketSourceUpdates.slice(0,40);
    saveState();
  }
  async function refreshMarket(){
    ensure();
    logSource("Lattiero-caseario","Avviato","Aggiornamento fonti: CLAL, MMO UE, Kempten, WPC e preparati vegetali pizza.");
    await Promise.all(ALL_MARKET_SEEDS.map(async s => {
      try { await fetch(s.sourceUrl,{mode:"no-cors"}); logSource(s.name,"Collegato","Fonte raggiunta o aperta dal browser: " + s.source); }
      catch(e){ logSource(s.name,"Da verificare","Fonte non leggibile automaticamente dal browser locale: " + s.source); }
    }));
    state.settings.marketLastRefresh = new Date().toISOString();
    saveState();
    render();
  }
  function bar(row,max){
    const v = num(row.y2026 || row.price);
    const pct = Math.max(4,Math.min(100,Math.round(v / (max || 1) * 100)));
    return '<div class="pms105-chart-row"><strong>' + esc(row.name) + '<br><small>' + esc(row.market || row.group || "") + '</small></strong><div class="pms105-bar"><span style="width:' + pct + '%"></span></div><span>' + esc(row.y2026 || row.price) + '<br><small>' + esc(row.unit) + '</small></span></div>';
  }
  function marketTicker(rows){
    const preferred = ["MKT118-CREAM26-FR","MKT118-CREAM26-DE","MKT123-MOZZ100-IT","MKT123-MOZZ100-DE","MKT123-MOZZ100-PL","MKT118-SMP-EU","MKT118-WMP26-EU","MKT118-WHEY-EU","MKT118-WPC35-EU","MKT118-WPC80-EU","MKT118-PIZZA-PL","MKT118-PIZZA-IT","MKT118-PIZZA-UA"];
    const byId = id => rows.find(r => r.id === id);
    const selected = preferred.map(byId).filter(Boolean).concat(rows.filter(r => !preferred.includes(r.id))).slice(0,18);
    const items = selected.map(r => {
      const value = r.y2026 || r.price || "-";
      return '<span class="pms105-ticker-item"><i class="pms105-ticker-dot"></i><strong>' + esc(r.name || r.product) + '</strong><span>' + esc(r.market || r.group || "") + '</span><strong>' + esc(value) + ' ' + esc(r.unit || "EUR/kg") + '</strong></span>';
    }).join("");
    return '<div class="pms105-ticker" aria-label="Aggiornamenti mercato scorrevoli"><div class="pms105-ticker-label">Market news</div><div class="pms105-ticker-window"><div class="pms105-ticker-track">' + items + items + '</div></div></div>';
  }
  function renderMarket(){
    ensure(); css();
    const rows = arr(state.marketPreview52).filter(r => !isCereal(r));
    const trends = arr(state.marketTrends).filter(r => !isCereal(r));
    const max = Math.max(1,...rows.map(r => num(r.y2026 || r.price)));
    const kpi = (title,value,sub) => '<div class="pms105-card"><h4>' + esc(title) + '</h4><div class="pms105-kpi">' + esc(value) + '</div><div class="pms105-muted">' + esc(sub || "") + '</div></div>';
    const table = rows.map(r => '<tr><td><strong>' + esc(r.name) + '</strong><br><small>' + esc(r.note || r.source) + '</small></td><td>' + esc(r.group || r.category) + '</td><td>' + esc(r.unit) + '</td><td>' + esc(r.y2024) + '</td><td>' + esc(r.y2025) + '</td><td><strong>' + esc(r.y2026) + '</strong></td><td><a href="' + esc(r.sourceUrl || "#") + '" target="_blank">Fonte</a></td></tr>').join("");
    const trendRows = trends.map(r => '<tr><td>' + esc(r.date) + '</td><td><strong>' + esc(r.product || r.name) + '</strong><br><small>' + esc(r.group || r.category || "") + '</small></td><td>' + esc(r.market) + '</td><td><strong>' + esc(r.price) + '</strong></td><td>' + esc(r.unit) + '</td><td>' + esc(r.source) + '</td></tr>').join("");
    const markets = EU_MARKETS.map(m => '<tr><td><strong>' + esc(m.name) + '</strong></td><td>' + esc(m.area) + '</td><td>' + esc(m.focus) + '</td></tr>').join("");
    const logs = arr(state.marketSourceUpdates).slice(0,10).map(x => '<tr><td>' + esc(x.date ? new Date(x.date).toLocaleString() : "") + '</td><td>' + esc(x.kind) + '</td><td>' + esc(x.status) + '</td><td>' + esc(x.message) + '</td></tr>').join("");
    return '<div class="pms105-page"><section class="pms105-hero"><div><span>MKT</span><h3>Andamenti di mercato</h3><p>Prezzi e previsioni sempre in EUR/kg: crema 26%, polveri latte, siero, WPC, mozzarella e preparati vegetali pizza.</p></div><div class="pms105-actions"><button class="primary-button" data-pms105-refresh-market>Aggiorna dati dai siti</button><button class="secondary-button" data-pms105-print-market>Stampa</button></div></section>' + marketTicker(rows) + '<div class="pms105-grid">' + kpi("Ultimo aggiornamento",state.settings.marketLastRefresh ? new Date(state.settings.marketLastRefresh).toLocaleDateString() : "-", "Fonti lattiero-casearie e vegetale pizza") + kpi("Crema 26% Italia","1,25", "EUR/kg, normalizzata da crema 40%") + kpi("SMP UE","2,70", "EUR/kg, Milk Market Observatory") + kpi("Preparato pizza PL","2,70", "EUR/kg, base grasso vegetale") + '</div><div class="pms105-card"><h4>Grafici lattiero-caseari e vegetale</h4>' + rows.map(r => bar(r,max)).join("") + '</div><div class="pms105-card"><h4>Quotazioni e previsioni</h4><div class="table-wrap"><table><thead><tr><th>Voce</th><th>Gruppo</th><th>Unita</th><th>2024</th><th>2025</th><th>2026</th><th>Fonte</th></tr></thead><tbody>' + table + '</tbody></table></div></div><div class="pms105-card"><h4>Mercati europei principali</h4><div class="table-wrap"><table><thead><tr><th>Paese</th><th>Piazza / fonte</th><th>Focus</th></tr></thead><tbody>' + markets + '</tbody></table></div></div><div class="pms105-card"><h4>Quotazioni operative</h4><div class="table-wrap"><table><thead><tr><th>Data</th><th>Prodotto</th><th>Mercato</th><th>Prezzo</th><th>Unita</th><th>Fonte</th></tr></thead><tbody>' + trendRows + '</tbody></table></div></div><div class="pms105-card"><h4>Log aggiornamento</h4><div class="table-wrap"><table><tbody>' + (logs || '<tr><td>Nessun aggiornamento registrato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function printMarket(){
    const code = "MKT-" + today();
    const rows = arr(state.marketPreview52).filter(r => !isCereal(r)).map(r => '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.group) + '</td><td>' + esc(r.y2026) + '</td><td>' + esc(r.unit) + '</td><td>' + esc(r.source) + '</td></tr>').join("");
    openPrint('<div class="print-document pms105-print">' + header("ANDAMENTI MERCATO LATTIERO-CASEARIO",code,"Prezzi in EUR/kg: crema, polveri, siero, WPC, mozzarella e vegetale pizza") + '<table class="print-table"><thead><tr><th>Prodotto</th><th>Gruppo</th><th>Prezzo/indice</th><th>Unita</th><th>Fonte</th></tr></thead><tbody>' + rows + '</tbody></table><div>' + barcode(code) + '</div><div class="print-footer">Aggiornamento: ' + esc(state.settings.marketLastRefresh || today()) + '</div></div>');
  }
  function statusClass(status){
    return /aggiudicat/i.test(status || "") ? "success" : /pers|annull/i.test(status || "") ? "neutral" : /scad/i.test(status || "") ? "warn" : "primary";
  }
  function tenderItems(t){
    try { const p = JSON.parse(t.itemsJson || "[]"); if (Array.isArray(p)) return p; } catch(e){}
    return [];
  }
  function itemsText(items){
    return arr(items).map(x => [x.description || x.product || "", x.quantity || "", x.unit || "", x.targetPrice || ""].join(" | ")).join("\n");
  }
  function parseItems(text){
    return String(text || "").split(/\n+/).map(line => line.trim()).filter(Boolean).map(line => {
      const p = line.split("|").map(x => x.trim());
      return {description:p[0] || "",quantity:p[1] || "",unit:p[2] || "",targetPrice:p[3] || ""};
    });
  }
  function modal(title,body,onSave){
    document.getElementById("pms105-modal")?.remove();
    const w = document.createElement("div");
    w.id = "pms105-modal";
    w.className = "pms105-modal";
    w.innerHTML = '<div class="pms105-modal-card"><div class="pms105-modal-head"><h3>' + esc(title) + '</h3><button class="secondary-button" data-close>Chiudi</button></div><div class="pms105-modal-body">' + body + '</div><div class="pms105-modal-actions"><button class="secondary-button" data-close>Annulla</button>' + (onSave ? '<button class="primary-button" data-save>Salva</button>' : "") + '</div></div>';
    document.body.appendChild(w);
    w.querySelectorAll("[data-close]").forEach(b => b.onclick = () => w.remove());
    if (onSave) w.querySelector("[data-save]").onclick = () => onSave(w);
    return w;
  }
  function tenderForm(t){
    t = t || {};
    const id = t.id || next("TEN",state.tenders);
    const opts = ["Nuovo","Analisi capitolato","Da quotare","Offerta preparata","Inviato","In chiarimento","Aggiudicato","Perso","Annullato"].map(x => '<option ' + (x === (t.status || "Nuovo") ? "selected" : "") + '>' + x + '</option>').join("");
    const docs = arr(t.documents).join("\n");
    return '<div class="pms105-tabs"><span>Registro</span><span>Capitolato</span><span>Articoli richiesti</span><span>Offerta economica</span><span>Scadenze</span></div><div class="pms105-form" style="margin-top:12px"><label>Protocollo<input name="id" value="' + esc(id) + '" readonly></label><label>Data ricezione<input type="date" name="receivedDate" value="' + esc(t.receivedDate || today()) + '"></label><label>Scadenza tender<input type="date" name="deadline" value="' + esc(t.deadline || "") + '"></label><label>Stato<select name="status">' + opts + '</select></label><label class="half">Ente / cliente richiedente<input name="authority" value="' + esc(t.authority || t.client || "") + '"></label><label class="half">Referente<input name="contact" value="' + esc(t.contact || "") + '"></label><label class="half">Oggetto tender<input name="title" value="' + esc(t.title || "") + '"></label><label>Paese<input name="country" value="' + esc(t.country || "") + '"></label><label>Valore stimato<input type="number" step="0.01" name="estimatedValue" value="' + esc(t.estimatedValue || "") + '"></label><label>Valuta<select name="currency"><option ' + ((t.currency || "EUR") === "EUR" ? "selected" : "") + '>EUR</option><option ' + (t.currency === "RON" ? "selected" : "") + '>RON</option><option ' + (t.currency === "USD" ? "selected" : "") + '>USD</option></select></label><label>Responsabile<input name="owner" value="' + esc(t.owner || current?.user || "Carlo") + '"></label><label>Probabilita %<input type="number" name="probability" value="' + esc(t.probability || 50) + '"></label><label class="full">Articoli richiesti - una riga per articolo: descrizione | quantita | unita | prezzo target<textarea name="itemsText">' + esc(itemsText(tenderItems(t))) + '</textarea></label><label class="full">Capitolato / requisiti<textarea name="requirements">' + esc(t.requirements || "") + '</textarea></label><label class="full">Documenti richiesti / link documenti<textarea name="documentsText">' + esc(docs) + '</textarea></label><label class="full">Offerta economica / strategia<textarea name="commercialOffer">' + esc(t.commercialOffer || "") + '</textarea></label><label class="half">Prossima azione<input name="nextAction" value="' + esc(t.nextAction || "Analizzare capitolato e quotare articoli") + '"></label><label>Data prossima azione<input type="date" name="nextDate" value="' + esc(t.nextDate || "") + '"></label><label class="full">Note interne<textarea name="notes">' + esc(t.notes || "") + '</textarea></label></div>';
  }
  function readTender(w,base){
    const item = Object.assign({},base || {});
    w.querySelectorAll("[name]").forEach(el => item[el.name] = el.value);
    item.client = item.authority;
    item.itemsJson = JSON.stringify(parseItems(item.itemsText));
    item.documents = String(item.documentsText || "").split(/\n+/).map(x => x.trim()).filter(Boolean);
    delete item.itemsText;
    delete item.documentsText;
    item.updatedAt = new Date().toISOString();
    item.createdAt = item.createdAt || item.updatedAt;
    return item;
  }
  function editTender(id){
    const old = state.tenders.find(x => x.id === id);
    modal(old ? "Modifica tender " + old.id : "Nuovo Tender", tenderForm(old), w => {
      const item = readTender(w,old);
      const idx = state.tenders.findIndex(x => x.id === item.id);
      if (idx >= 0) state.tenders[idx] = item; else state.tenders.unshift(item);
      state.tenderEvents.unshift({id:next("TEV",state.tenderEvents),tenderId:item.id,date:new Date().toISOString(),type:old ? "Modifica" : "Creazione",text:item.nextAction || "Tender registrato"});
      saveState();
      w.remove();
      render();
    });
  }
  function viewTender(id){
    const t = state.tenders.find(x => x.id === id);
    if (!t) return alert("Tender non trovato.");
    modal("Tender " + t.id, tenderViewHtml(t), null);
  }
  function tenderViewHtml(t){
    const items = tenderItems(t).map(x => '<tr><td>' + esc(x.description) + '</td><td>' + esc(x.quantity) + '</td><td>' + esc(x.unit) + '</td><td>' + esc(x.targetPrice) + '</td></tr>').join("");
    const docs = arr(t.documents).map(d => '<li>' + esc(d) + '</li>').join("");
    return '<table class="print-table"><tr><th>Cliente/ente</th><td>' + esc(t.authority || "-") + '</td><th>Scadenza</th><td>' + esc(t.deadline || "-") + '</td></tr><tr><th>Oggetto</th><td colspan="3">' + esc(t.title || "-") + '</td></tr><tr><th>Stato</th><td>' + esc(t.status || "-") + '</td><th>Valore</th><td>' + money(t.estimatedValue,t.currency) + '</td></tr></table><h4>Articoli richiesti</h4><table class="print-table"><thead><tr><th>Descrizione</th><th>Quantita</th><th>Unita</th><th>Prezzo target</th></tr></thead><tbody>' + (items || '<tr><td colspan="4">Nessun articolo inserito.</td></tr>') + '</tbody></table><h4>Capitolato / requisiti</h4><div class="pms105-print-body">' + esc(t.requirements || "-") + '</div><h4>Documenti</h4><ul>' + (docs || '<li>Nessun documento indicato.</li>') + '</ul><h4>Offerta economica / strategia</h4><div class="pms105-print-body">' + esc(t.commercialOffer || "-") + '</div><h4>Prossima azione</h4><div>' + esc(t.nextAction || "-") + ' ' + esc(t.nextDate || "") + '</div>';
  }
  function tenderPrintHtml(t){
    return '<div class="print-document pms105-print">' + header("SCHEDA TENDER",t.id,t.title || "Gara / richiesta") + tenderViewHtml(t) + '<div style="margin-top:6mm">' + barcode(t.id) + '</div><div class="print-footer">Tender Parmitalia - protocollo ' + esc(t.id) + '</div></div>';
  }
  function printTender(id){
    const t = state.tenders.find(x => x.id === id);
    if (!t) return alert("Tender non trovato.");
    openPrint(tenderPrintHtml(t));
  }
  function printTenderRegister(){
    const rows = state.tenders.map(t => '<tr><td>' + esc(t.id) + '</td><td>' + esc(t.authority || "-") + '</td><td>' + esc(t.title || "-") + '</td><td>' + esc(t.deadline || "-") + '</td><td>' + esc(t.status || "-") + '</td><td>' + money(t.estimatedValue,t.currency) + '</td></tr>').join("");
    openPrint('<div class="print-document pms105-print">' + header("REGISTRO TENDER","TEN-" + today(),"Gare, richieste e offerte economiche") + '<table class="print-table"><thead><tr><th>ID</th><th>Cliente/ente</th><th>Oggetto</th><th>Scadenza</th><th>Stato</th><th>Valore</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun tender.</td></tr>') + '</tbody></table><div class="print-footer">Registro Tender Parmitalia</div></div>');
  }
  function tenderToOffer(id){
    const t = state.tenders.find(x => x.id === id);
    if (!t) return;
    state.offers = arr(state.offers);
    const code = next("OFF",state.offers,"code");
    const first = tenderItems(t)[0] || {};
    state.offers.unshift({id:code,code,client:t.authority || "",supplier:"Da definire",product:first.description || t.title || "Tender",quantity:first.quantity || 1,unit:first.unit || "lotto",unitPrice:t.estimatedValue || 0,currency:t.currency || "EUR",status:"Bozza",linkedPractice:t.id,notes:"Offerta creata da Tender " + t.id + ". " + (t.commercialOffer || "")});
    t.linkedOffer = code;
    t.status = "Offerta preparata";
    saveState();
    current.page = "offers";
    render();
    alert("Offerta creata: " + code);
  }
  function dueSoon(t){
    if (!t.deadline) return false;
    const diff = (new Date(t.deadline) - new Date(today())) / 86400000;
    return diff >= 0 && diff <= 7;
  }
  function renderTenders(){
    ensure(); css();
    const open = state.tenders.filter(t => !/aggiudicat|pers|annull/i.test(t.status || "")).length;
    const due = state.tenders.filter(dueSoon).length;
    const quote = state.tenders.filter(t => /quotare|analisi|nuovo/i.test(t.status || "")).length;
    const won = state.tenders.filter(t => /aggiudicat/i.test(t.status || "")).length;
    const rows = state.tenders.map(t => '<tr><td><span class="code-block">' + esc(t.id) + '</span></td><td><strong>' + esc(t.authority || "-") + '</strong><br><small>' + esc(t.country || "") + '</small></td><td><strong>' + esc(t.title || "-") + '</strong><br><small>' + esc(t.nextAction || "") + '</small></td><td>' + esc(t.deadline || "-") + '</td><td>' + (typeof badge === "function" ? badge(t.status || "Nuovo",statusClass(t.status)) : '<span class="pms105-pill">' + esc(t.status || "Nuovo") + '</span>') + '</td><td>' + money(t.estimatedValue,t.currency) + '<br><small>Prob. ' + esc(t.probability || 0) + '%</small></td><td><button class="inline-button" data-ten-view="' + esc(t.id) + '">Vedi</button><button class="inline-button" data-ten-edit="' + esc(t.id) + '">Modifica</button><button class="inline-button" data-ten-print="' + esc(t.id) + '">Stampa</button><button class="inline-button" data-ten-offer="' + esc(t.id) + '">Crea offerta</button></td></tr>').join("");
    return '<div class="pms105-page"><section class="pms105-hero"><div><span>TEN</span><h3>Tender</h3><p>Modulo per gare e richieste: capitolato, articoli richiesti, documenti, scadenze, offerta economica, stampa scheda e conversione in offerta.</p></div><div class="pms105-actions"><button class="primary-button" data-ten-new>+ Nuovo Tender</button><button class="secondary-button" data-ten-print-register>Stampa registro</button></div></section><div class="pms105-grid"><div class="pms105-card"><h4>Aperti</h4><div class="pms105-kpi">' + open + '</div><div class="pms105-muted">Tender in lavorazione</div></div><div class="pms105-card"><h4>Scadenze 7 giorni</h4><div class="pms105-kpi">' + due + '</div><div class="pms105-muted">Priorita immediata</div></div><div class="pms105-card"><h4>Da quotare</h4><div class="pms105-kpi">' + quote + '</div><div class="pms105-muted">Analisi e prezzi mancanti</div></div><div class="pms105-card"><h4>Aggiudicati</h4><div class="pms105-kpi">' + won + '</div><div class="pms105-muted">Esiti positivi</div></div></div><div class="pms105-card"><div class="pms105-tabs"><span>Registro Tender</span><span>Capitolato</span><span>Articoli</span><span>Documenti</span><span>Offerta economica</span><span>Scadenze</span></div></div><div class="pms105-card"><div class="table-wrap"><table><thead><tr><th>Protocollo</th><th>Ente / cliente</th><th>Oggetto</th><th>Scadenza</th><th>Stato</th><th>Valore</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="7">Nessun tender registrato.</td></tr>') + '</tbody></table></div></div></div>';
  }
  function bind(){
    ensure(); css();
    document.querySelector("[data-pms105-refresh-market]")?.addEventListener("click",refreshMarket);
    document.querySelector("[data-pms105-print-market]")?.addEventListener("click",printMarket);
    document.querySelector("[data-ten-new]")?.addEventListener("click",() => editTender());
    document.querySelector("[data-ten-print-register]")?.addEventListener("click",printTenderRegister);
    document.querySelectorAll("[data-ten-view]").forEach(b => b.onclick = () => viewTender(b.dataset.tenView));
    document.querySelectorAll("[data-ten-edit]").forEach(b => b.onclick = () => editTender(b.dataset.tenEdit));
    document.querySelectorAll("[data-ten-print]").forEach(b => b.onclick = () => printTender(b.dataset.tenPrint));
    document.querySelectorAll("[data-ten-offer]").forEach(b => b.onclick = () => tenderToOffer(b.dataset.tenOffer));
  }
  const baseRender = typeof render === "function" ? render : null;
  if (baseRender && !window.__pms105RenderWrapped) {
    window.__pms105RenderWrapped = true;
    render = function(){
      ensure(); css();
      const content = document.getElementById("content");
      const title = document.getElementById("page-title");
      const subtitle = document.getElementById("page-subtitle");
      if (content && current && current.page === "marketTrends") {
        if (title) title.textContent = "Andamenti di mercato";
        if (subtitle) subtitle.textContent = "Prezzi e previsioni in EUR/kg: lattiero-caseario, WPC e vegetale pizza";
        content.innerHTML = renderMarket();
        bind();
        return;
      }
      if (content && current && current.page === "tenders") {
        if (title) title.textContent = "Tender";
        if (subtitle) subtitle.textContent = "Gare, richieste, capitolati e offerte economiche";
        content.innerHTML = renderTenders();
        bind();
        return;
      }
      const r = baseRender.apply(this,arguments);
      setTimeout(bind,40);
      return r;
    };
  }
  const baseBind = typeof bindPageActions === "function" ? bindPageActions : null;
  if (baseBind && !window.__pms105BindWrapped) {
    window.__pms105BindWrapped = true;
    bindPageActions = function(){ const r = baseBind.apply(this,arguments); bind(); return r; };
  }
  const baseNav = typeof renderNav === "function" ? renderNav : null;
  if (baseNav && !window.__pms105NavWrapped) {
    window.__pms105NavWrapped = true;
    renderNav = function(){ ensure(); return baseNav.apply(this,arguments); };
  }
  ensure(); css(); saveState(); setTimeout(bind,80);
  window.pmsV105TenderDairyMarkets = {version:VERSION,refreshMarket,renderTenders,renderMarket};
})();
