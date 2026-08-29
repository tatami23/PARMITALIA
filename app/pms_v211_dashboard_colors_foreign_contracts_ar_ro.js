(function(){
  "use strict";

  var VERSION = "pms_v211_dashboard_colors_foreign_contracts_ar_ro";
  var CONTRACTS = "foreignContracts";

  function arr(v){ return Array.isArray(v) ? v : []; }
  function clean(v){ return String(v == null ? "" : v).replace(/\s+/g, " ").trim(); }
  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]; }); }
  function today(){ var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function uid(prefix){ return (typeof window.uid === "function" ? window.uid(prefix) : prefix + "-" + Date.now().toString(36).toUpperCase()); }
  function st(){
    window.state = window.state || {};
    state.dashboardAgenda = arr(state.dashboardAgenda);
    state.tasks = arr(state.tasks);
    state.foreignEmployees = arr(state.foreignEmployees);
    state.foreignRecruiting = arr(state.foreignRecruiting);
    state[CONTRACTS] = arr(state[CONTRACTS]);
    return state;
  }
  function saveNow(reason){
    try {
      if (typeof save === "function") save();
      else if (typeof STORAGE_KEY !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(st()));
      if (window.PMS_V195_HARDENED_AUTOSAVE && typeof window.PMS_V195_HARDENED_AUTOSAVE.saveNow === "function") window.PMS_V195_HARDENED_AUTOSAVE.saveNow(reason || VERSION);
      return true;
    } catch(error) { console.warn(VERSION + " save failed", error); return false; }
  }
  function rid(r){ return clean(r && (r.id || r.code || r.employeeCode || r.passportNumber)); }
  function nameOf(r){ return clean(r && (r.fullName || r.name || r.candidateName || r.driverName || r.employeeName)) || rid(r) || "Candidato estero"; }
  function findForeign(id){
    id = clean(id);
    return arr(st().foreignEmployees).find(function(r){ return rid(r) === id; }) || arr(st().foreignRecruiting).find(function(r){ return rid(r) === id; }) || null;
  }
  function writeForeign(record){
    if (!record) return;
    var id = rid(record);
    ["foreignEmployees", "foreignRecruiting"].forEach(function(key){
      state[key] = arr(state[key]);
      var i = state[key].findIndex(function(r){ return rid(r) === id; });
      if (i >= 0) state[key][i] = Object.assign({}, state[key][i], record);
      else if (key === "foreignEmployees") state[key].unshift(record);
    });
  }

  function ensureModule(){
    st();
    if (typeof modules !== "undefined" && Array.isArray(modules)) {
      var existing = modules.find(function(m){ return m && m.id === CONTRACTS; });
      if (!existing) {
        var after = modules.findIndex(function(m){ return m && (m.id === "foreignEmployees" || m.id === "humanResources"); });
        modules.splice(after >= 0 ? after + 1 : modules.length, 0, {id:CONTRACTS, label:"Contratti estero AR/RO", subtitle:"Contratti bilingue arabo e rumeno", roles:["admin","assistant","recruiter"]});
      } else {
        existing.label = "Contratti estero AR/RO";
        existing.subtitle = "Contratti bilingue arabo e rumeno";
        existing.roles = Array.from(new Set(arr(existing.roles).concat(["admin","assistant","recruiter"])));
      }
    }
  }

  function itemColor(item){
    var raw = clean(item && (item.color || item.priorityColor || item.agendaColor || item.operationalColor || item.priority)).toLowerCase();
    if (/rosso|red|urgent|urgente|alta/.test(raw)) return "red";
    if (/giallo|yellow|media|warning|importante/.test(raw)) return "yellow";
    if (/verde|green|ok|bassa|done|complet/.test(raw)) return "green";
    return "blue";
  }
  function findDash(kind, id){
    if (kind === "agenda") return st().dashboardAgenda.find(function(x){ return clean(x.id || x.code) === clean(id); });
    if (kind === "task") return st().tasks.find(function(x){ return clean(x.id || x.code) === clean(id); });
    return null;
  }
  function setDashColor(kind, id, color){
    var item = findDash(kind, id);
    if (!item) return false;
    item.color = color;
    item.priorityColor = color;
    item.agendaColor = color;
    item.operationalColor = color;
    if (kind === "task") item.priority = color === "red" ? "Alta" : color === "yellow" ? "Media" : color === "green" ? "Bassa" : "Blu";
    item.updatedAt = new Date().toISOString();
    saveNow("v211-dashboard-color");
    return true;
  }
  function decorateDashboardColors(){
    document.querySelectorAll(".pms150-card").forEach(function(card){
      var kind = card.getAttribute("data-pms150-kind") || "";
      var id = card.getAttribute("data-pms150-id") || "";
      var item = findDash(kind, id);
      var color = itemColor(item);
      card.classList.remove("pms211-red","pms211-yellow","pms211-green","pms211-blue");
      card.classList.add("pms211-" + color);
      if (!card.querySelector(".pms211-colorbar")) {
        var bar = document.createElement("div");
        bar.className = "pms211-colorbar";
        [["red","Rosso"],["yellow","Giallo"],["green","Verde"],["blue","Blu"]].forEach(function(pair){
          bar.insertAdjacentHTML("beforeend", '<button type="button" class="pms211-pick-' + pair[0] + '" data-pms211-color="' + pair[0] + '">' + pair[1] + '</button>');
        });
        card.appendChild(bar);
      }
      card.querySelectorAll("[data-pms211-color]").forEach(function(btn){
        if (btn.dataset.pms211Bound === "1") return;
        btn.dataset.pms211Bound = "1";
        btn.onclick = function(event){
          event.preventDefault();
          event.stopPropagation();
          if (setDashColor(kind, id, btn.getAttribute("data-pms211-color"))) decorateDashboardColors();
        };
      });
    });
  }

  function roText(c){
    return [
      "CONTRACT DE COLABORARE / MUNCA - CANDIDAT STRAIN",
      "",
      "Parti: Parmitalia Distribution SRL si " + (c.candidateName || "candidatul") + ".",
      "Rol / functie: " + (c.role || "sofer / lucrator desemnat") + ".",
      "Data inceperii: " + (c.startDate || today()) + ". Durata: " + (c.duration || "conform acordului dintre parti") + ".",
      "Locul activitatii: " + (c.workPlace || "Romania / Uniunea Europeana, conform repartizarii") + ".",
      "Remuneratie / conditii economice: " + (c.salary || "conform ofertei si anexelor") + ".",
      "",
      "Candidatul autorizeaza Parmitalia sa utilizeze datele personale, fotografia, copia pasaportului si documentele transmise pentru recrutare, verificare documentara, pregatirea dosarului si intocmirea contractului.",
      "Candidatul declara ca informatiile comunicate sunt corecte si se obliga sa anunte imediat orice modificare privind identitatea, documentele, adresa, telefonul sau disponibilitatea.",
      "Partile respecta confidentialitatea datelor si regulile interne Parmitalia. Prezentul document poate fi completat cu anexe, fisa postului si documente legale.",
      "",
      "Semnatura candidatului: ____________________",
      "Semnatura Parmitalia: ____________________"
    ].join("\n");
  }
  function arText(c){
    return [
      "عقد تعاون / عمل - مرشح أجنبي",
      "",
      "الأطراف: شركة Parmitalia Distribution SRL و " + (c.candidateName || "المرشح") + ".",
      "الوظيفة / الدور: " + (c.role || "سائق / عامل حسب التعيين") + ".",
      "تاريخ البداية: " + (c.startDate || today()) + ". المدة: " + (c.duration || "حسب الاتفاق بين الطرفين") + ".",
      "مكان العمل: " + (c.workPlace || "رومانيا / الاتحاد الأوروبي حسب التعيين") + ".",
      "الأجر / الشروط المالية: " + (c.salary || "حسب العرض والملاحق") + ".",
      "",
      "يوافق المرشح على استخدام البيانات الشخصية والصورة وصورة جواز السفر والوثائق المرسلة لأغراض التوظيف والتحقق من المستندات وتجهيز الملف وإعداد العقد.",
      "يقر المرشح بأن المعلومات المقدمة صحيحة ويتعهد بإبلاغ Parmitalia فوراً بأي تغيير يتعلق بالهوية أو الوثائق أو العنوان أو الهاتف أو التوفر للعمل.",
      "يلتزم الطرفان بسرية البيانات واحترام القواعد الداخلية لشركة Parmitalia. يمكن استكمال هذا المستند بملاحق ووصف وظيفي ووثائق قانونية.",
      "",
      "توقيع المرشح: ____________________",
      "توقيع Parmitalia: ____________________"
    ].join("\n");
  }
  function makeContract(record){
    var c = {
      id: uid("CAR"),
      candidateId: rid(record),
      candidateName: nameOf(record),
      passportNumber: record.passportNumber || "",
      nationality: record.nationality || "",
      role: record.role || record.position || "Autista / lavoratore estero",
      startDate: today(),
      duration: "12 mesi, rinnovabile secondo accordo",
      workPlace: "Romania / Unione Europea secondo assegnazione",
      salary: record.salary || record.expectedSalary || "",
      status: "Bozza",
      createdAt: new Date().toISOString()
    };
    c.romanianText = roText(c);
    c.arabicText = arText(c);
    return c;
  }
  function findContract(id){ return arr(st()[CONTRACTS]).find(function(c){ return clean(c.id) === clean(id); }); }
  function saveContract(c){
    var list = st()[CONTRACTS];
    var i = list.findIndex(function(x){ return clean(x.id) === clean(c.id); });
    if (i >= 0) list[i] = Object.assign({}, list[i], c);
    else list.unshift(c);
    saveNow("v211-contract");
  }
  function createContractFromCandidate(id){
    var record = findForeign(id);
    if (!record) return alert("Candidato estero non trovato.");
    var c = makeContract(record);
    saveContract(c);
    if (window.current) current.page = CONTRACTS;
    if (typeof render === "function") render();
    setTimeout(function(){ editContract(c.id); }, 120);
  }
  function input(label, name, value, type){
    return '<label>' + esc(label) + '<input name="' + esc(name) + '" type="' + esc(type || "text") + '" value="' + esc(value || "") + '"></label>';
  }
  function area(label, name, value, rtl){
    return '<label class="pms211-full ' + (rtl ? "pms211-rtl" : "") + '">' + esc(label) + '<textarea name="' + esc(name) + '">' + esc(value || "") + '</textarea></label>';
  }
  function editContract(id){
    var c = findContract(id);
    if (!c) return;
    document.querySelectorAll(".pms211-contract-modal").forEach(function(n){ n.remove(); });
    var wrap = document.createElement("div");
    wrap.className = "pms211-contract-modal";
    wrap.innerHTML = '<div class="pms211-modal"><div class="pms211-modal-head"><h3>Contratto AR/RO - ' + esc(c.candidateName) + '</h3><button type="button" class="secondary-button" data-pms211-close>Chiudi</button></div><form class="pms211-contract-form">' +
      input("Candidato", "candidateName", c.candidateName) + input("Ruolo", "role", c.role) + input("Data inizio", "startDate", c.startDate, "date") + input("Durata", "duration", c.duration) +
      input("Luogo lavoro", "workPlace", c.workPlace) + input("Retribuzione / condizioni", "salary", c.salary) + input("Stato", "status", c.status) +
      area("Contratto rumeno", "romanianText", c.romanianText || roText(c), false) + area("العقد باللغة العربية", "arabicText", c.arabicText || arText(c), true) +
      '<div class="pms211-modal-actions"><button type="button" class="secondary-button" data-pms211-print-contract="' + esc(c.id) + '">Stampa PDF</button><button type="submit" class="primary-button">Salva</button></div></form></div>';
    document.body.appendChild(wrap);
    wrap.querySelector("[data-pms211-close]").onclick = function(){ wrap.remove(); };
    wrap.onclick = function(event){ if (event.target === wrap) wrap.remove(); };
    wrap.querySelector("form").onsubmit = function(event){
      event.preventDefault();
      var data = new FormData(event.target);
      Array.from(data.entries()).forEach(function(pair){ c[pair[0]] = clean(pair[1]); });
      c.updatedAt = new Date().toISOString();
      saveContract(c);
      wrap.remove();
      if (typeof render === "function") render();
    };
    wrap.querySelector("[data-pms211-print-contract]").onclick = function(event){ event.preventDefault(); printContract(c.id); };
  }
  function printContract(id){
    var c = findContract(id);
    if (!c) return;
    var header = typeof companyPrintHeader === "function" ? companyPrintHeader("CONTRACT ESTERO AR/RO", c.id, c.candidateName) : '<div class="print-header"><div><h1>CONTRACT ESTERO AR/RO</h1><strong>PARMITALIA DISTRIBUTION SRL</strong></div><div class="print-meta">' + esc(c.id) + '</div></div>';
    var html = '<div class="print-document pms211-contract-print">' + header +
      '<table class="print-table"><tr><th>Candidato</th><td>' + esc(c.candidateName) + '</td><th>Passaporto</th><td>' + esc(c.passportNumber || "-") + '</td></tr><tr><th>Ruolo</th><td>' + esc(c.role || "-") + '</td><th>Inizio</th><td>' + esc(c.startDate || "-") + '</td></tr></table>' +
      '<section><h2>Romana</h2><pre>' + esc(c.romanianText || roText(c)) + '</pre></section><section class="pms211-ar"><h2>العربية</h2><pre>' + esc(c.arabicText || arText(c)) + '</pre></section>' +
      '<div class="pms211-sign"><div>Semnatura candidatului<br>توقيع المرشح</div><div>Semnatura Parmitalia<br>توقيع Parmitalia</div></div></div>';
    if (typeof openPrint === "function") openPrint(html);
  }
  function deleteContract(id){
    if (!confirm("Eliminare questo contratto?")) return;
    st()[CONTRACTS] = arr(st()[CONTRACTS]).filter(function(c){ return clean(c.id) !== clean(id); });
    saveNow("v211-delete-contract");
    if (typeof render === "function") render();
  }
  function renderContracts(){
    ensureModule();
    var seen = {};
    var candidates = arr(st().foreignEmployees).concat(arr(st().foreignRecruiting)).filter(function(r){ var id = rid(r); if (!id || seen[id]) return false; seen[id] = true; return true; });
    var cards = candidates.map(function(r){ var id = rid(r); return '<article class="pms211-candidate" draggable="true" data-pms211-candidate="' + esc(id) + '"><strong>' + esc(nameOf(r)) + '</strong><span>' + esc([r.role, r.nationality, r.passportNumber].filter(Boolean).join(" - ")) + '</span><button type="button" data-pms211-create-contract="' + esc(id) + '">Crea contratto</button></article>'; }).join("");
    var rows = arr(st()[CONTRACTS]).map(function(c){ return '<tr><td><span class="code-block">' + esc(c.id) + '</span></td><td><strong>' + esc(c.candidateName) + '</strong><br><small>' + esc(c.candidateId || "") + '</small></td><td>' + esc(c.role || "-") + '</td><td>' + esc(c.startDate || "-") + '</td><td>' + esc(c.status || "Bozza") + '</td><td><div class="pms211-row-actions"><button class="inline-button" data-pms211-edit-contract="' + esc(c.id) + '">Modifica</button><button class="inline-button" data-pms211-print-contract="' + esc(c.id) + '">Stampa PDF</button><button class="inline-danger" data-pms211-delete-contract="' + esc(c.id) + '">Elimina</button></div></td></tr>'; }).join("");
    return '<div class="pms211-page"><section class="pms211-hero"><div><span>AR/RO</span><h3>Contratti estero AR/RO</h3><p>Trascina qui un candidato estero: il gestionale prepara automaticamente il contratto bilingue rumeno e arabo.</p></div><div class="pms211-drop" data-pms211-drop-contract>Trascina candidato qui<br><small>oppure usa Crea contratto</small></div></section><div class="pms211-grid"><section class="pms211-panel"><h3>Candidati estero</h3><div class="pms211-candidates">' + (cards || '<div class="pms211-empty">Nessun candidato estero registrato.</div>') + '</div></section><section class="pms211-panel"><h3>Archivio contratti</h3><div class="table-wrap"><table><thead><tr><th>Codice</th><th>Candidato</th><th>Ruolo</th><th>Inizio</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="6">Nessun contratto creato.</td></tr>') + '</tbody></table></div></section></div></div>';
  }
  function bindContracts(){
    document.querySelectorAll("[data-pms211-candidate]").forEach(function(card){
      if (card.dataset.pms211Bound === "1") return;
      card.dataset.pms211Bound = "1";
      card.addEventListener("dragstart", function(event){
        var id = card.getAttribute("data-pms211-candidate");
        event.dataTransfer.setData("application/x-pms211-candidate", id);
        event.dataTransfer.setData("text/plain", id);
        event.dataTransfer.effectAllowed = "copy";
      });
    });
    document.querySelectorAll("[data-pms211-drop-contract]").forEach(function(drop){
      if (drop.dataset.pms211Bound === "1") return;
      drop.dataset.pms211Bound = "1";
      drop.addEventListener("dragover", function(event){ event.preventDefault(); drop.classList.add("is-over"); });
      drop.addEventListener("dragleave", function(){ drop.classList.remove("is-over"); });
      drop.addEventListener("drop", function(event){ event.preventDefault(); drop.classList.remove("is-over"); var id = event.dataTransfer.getData("application/x-pms211-candidate") || event.dataTransfer.getData("text/plain"); if (id) createContractFromCandidate(id); });
    });
    document.querySelectorAll("[data-pms211-create-contract]").forEach(function(b){ b.onclick = function(){ createContractFromCandidate(b.getAttribute("data-pms211-create-contract")); }; });
    document.querySelectorAll("[data-pms211-edit-contract]").forEach(function(b){ b.onclick = function(){ editContract(b.getAttribute("data-pms211-edit-contract")); }; });
    document.querySelectorAll("[data-pms211-print-contract]").forEach(function(b){ b.onclick = function(){ printContract(b.getAttribute("data-pms211-print-contract")); }; });
    document.querySelectorAll("[data-pms211-delete-contract]").forEach(function(b){ b.onclick = function(){ deleteContract(b.getAttribute("data-pms211-delete-contract")); }; });
  }

  function decorateForeignPages(){
    var page = window.current && current.page || "";
    if (!["foreignEmployees","foreignRecruiting","humanResources"].includes(page)) return;
    document.querySelectorAll("[data-pms177-foreign],[data-pms128-foreign-open],[data-pms125-rec-open]").forEach(function(node){
      var id = node.getAttribute("data-pms177-foreign") || node.getAttribute("data-pms128-foreign-open") || node.getAttribute("data-pms125-rec-open") || "";
      if (!id || !findForeign(id)) return;
      node.setAttribute("draggable", "true");
      if (node.dataset.pms211DragBound !== "1") {
        node.dataset.pms211DragBound = "1";
        node.addEventListener("dragstart", function(event){ event.dataTransfer.setData("application/x-pms211-candidate", id); event.dataTransfer.setData("text/plain", id); event.dataTransfer.effectAllowed = "copy"; });
      }
    });
    document.querySelectorAll("#content table tbody tr").forEach(function(row){
      var explicit = row.querySelector("[data-pms128-foreign-open],[data-pms128-foreign-edit],[data-pms177-print],[data-id]");
      var id = explicit && (explicit.getAttribute("data-pms128-foreign-open") || explicit.getAttribute("data-pms128-foreign-edit") || explicit.getAttribute("data-pms177-print") || explicit.getAttribute("data-id"));
      if (!id || !findForeign(id)) return;
      var cell = row.cells && row.cells[row.cells.length - 1];
      if (!cell || cell.querySelector('[data-pms211-create-contract="' + cssEscape(id) + '"]')) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "inline-button";
      btn.textContent = "Contratto AR/RO";
      btn.setAttribute("data-pms211-create-contract", id);
      (cell.querySelector("div") || cell).appendChild(btn);
    });
    bindContracts();
  }
  function cssEscape(v){ return window.CSS && CSS.escape ? CSS.escape(String(v)) : String(v).replace(/["\\]/g, "\\$&"); }

  function ensurePrivacy(record){
    if (!record) return;
    record.pms176DocData = record.pms176DocData && typeof record.pms176DocData === "object" ? record.pms176DocData : {};
    var d = record.pms176DocData;
    if (!clean(d.privacyItalian)) d.privacyItalian = "Il candidato autorizza Parmitalia al trattamento dei dati personali, della foto passaporto e dei documenti forniti per recruiting, selezione, verifica documentale, preparazione contrattuale e gestione della pratica lavorativa.";
    if (!clean(d.privacyRomanian)) d.privacyRomanian = "Candidatul autorizeaza Parmitalia sa prelucreze datele personale, fotografia de pasaport si documentele furnizate pentru recrutare, selectie, verificare documentara, pregatirea contractului si gestionarea dosarului de munca.";
    if (!clean(d.privacyArabic) || /^the candidate authorizes/i.test(clean(d.privacyArabic))) d.privacyArabic = "يوافق المرشح على قيام شركة Parmitalia بمعالجة البيانات الشخصية وصورة جواز السفر والوثائق المقدمة لأغراض التوظيف والاختيار والتحقق من المستندات وإعداد العقد وإدارة ملف العمل. يحق للمرشح طلب تصحيح البيانات أو تحديثها، ويتم استخدام المعلومات فقط للأغراض المهنية والإدارية المرتبطة بالملف.";
    writeForeign(record);
  }
  function slotNames(record, key){ return arr(record && record.pms176DocSlots && record.pms176DocSlots[key]).map(function(f){ return clean(f && (f.name || f.fileName || f._pms176Id)); }).filter(Boolean).join(", "); }
  function photoSrc(record){
    var photo = arr(record && record.pms176DocSlots && record.pms176DocSlots.photoPassport).find(function(f){ return /^data:image\//.test(f && f.dataUrl || "") || String(f && f.type || "").startsWith("image/"); });
    return photo && photo.dataUrl ? photo.dataUrl : record && record.photo && record.photo.dataUrl || "";
  }
  function barcode(code){ return typeof renderBarcode === "function" ? renderBarcode(code) : '<strong>' + esc(code) + '</strong>'; }
  function privacyHtml(record){
    ensurePrivacy(record);
    var d = record.pms176DocData || {};
    var id = rid(record);
    var rows = [
      ["Nome e cognome", d.fullName || record.fullName || record.name],
      ["Nazionalita", d.nationality || record.nationality],
      ["Paese / citta", d.countryCity || [record.country, record.city].filter(Boolean).join(" ")],
      ["Ruolo", d.role || record.role],
      ["Telefono", d.phone || record.phone || record.whatsapp],
      ["Email", d.email || record.email],
      ["Numero passaporto", d.passportNumber || record.passportNumber],
      ["Date passaporto", d.passportDates],
      ["File passaporto", slotNames(record, "passport") || "-"],
      ["Privacy caricata", slotNames(record, "bilingualPrivacy") || "-"]
    ];
    var photo = photoSrc(record);
    return '<div class="print-document pms211-privacy-print"><header class="pms211-doc-head"><div><h1>Documento candidato estero - Privacy IT / RO / AR</h1><strong>Parmitalia Distribution</strong><small>Foto passaporto, dati pratica e privacy in italiano, rumeno e arabo</small></div><div class="pms211-code">' + esc(today()) + '<br>' + barcode(id) + '</div></header>' +
      '<section class="pms211-doc-main"><div class="pms211-doc-photo">' + (photo ? '<img src="' + esc(photo) + '" alt="Foto passaporto">' : '<span>Foto passaporto</span>') + '</div><table class="print-table"><tbody>' + rows.map(function(row){ return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1] || "-") + '</td></tr>'; }).join("") + '</tbody></table></section>' +
      '<section class="pms211-privacy-block"><h2>Informativa privacy - Italiano</h2><p>' + esc(d.privacyItalian) + '</p></section>' +
      '<section class="pms211-privacy-block"><h2>Confidentialitate - Romana</h2><p>' + esc(d.privacyRomanian) + '</p></section>' +
      '<section class="pms211-privacy-block pms211-ar"><h2>الخصوصية - العربية</h2><p>' + esc(d.privacyArabic) + '</p></section>' +
      '<section class="pms211-privacy-block"><h2>Note documento</h2><p>' + esc(d.documentNotes || record.notes || "") + '</p></section>' +
      '<footer class="pms211-sign"><div>Firma candidato<br>توقيع المرشح</div><div>Firma Parmitalia<br>توقيع Parmitalia</div></footer></div>';
  }
  function printPrivacy(id){
    var record = findForeign(id);
    if (!record) return alert("Candidato estero non trovato.");
    var html = privacyHtml(record);
    if (window.PMS_V182_FOREIGN_PRIVACY_PRINT_MENU_STABILIZER && typeof window.PMS_V182_FOREIGN_PRIVACY_PRINT_MENU_STABILIZER.printHtml === "function") window.PMS_V182_FOREIGN_PRIVACY_PRINT_MENU_STABILIZER.printHtml(html, "a4");
    else if (typeof openPrint === "function") openPrint(html);
  }
  function patchPrivacyClicks(){
    document.addEventListener("click", function(event){
      var b = event.target && event.target.closest && event.target.closest("[data-pms182-privacy],[data-pms176-print-doc]");
      if (!b) return;
      var id = b.getAttribute("data-pms182-privacy") || b.getAttribute("data-pms176-print-doc");
      if (!id || !findForeign(id)) return;
      event.preventDefault();
      event.stopPropagation();
      printPrivacy(id);
    }, true);
  }

  function injectCss(){
    var style = document.getElementById("pms-v211-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "pms-v211-style";
      document.head.appendChild(style);
    }
    style.textContent = [
      ".pms150-card.pms211-red{border-left-color:#dc2626!important;background:#fff1f2!important}.pms150-card.pms211-yellow{border-left-color:#f59e0b!important;background:#fffbeb!important}.pms150-card.pms211-green{border-left-color:#16a34a!important;background:#f0fdf4!important}.pms150-card.pms211-blue{border-left-color:#2563eb!important;background:#eff6ff!important}",
      ".pms211-colorbar{display:flex!important;gap:4px!important;flex-wrap:wrap!important;margin-top:5px!important}.pms211-colorbar button{width:auto!important;margin:0!important;padding:3px 6px!important;border-radius:5px!important;border:1px solid transparent!important;font-size:10px!important;font-weight:950!important;cursor:pointer!important}.pms211-pick-red{background:#fee2e2!important;color:#991b1b!important}.pms211-pick-yellow{background:#fef3c7!important;color:#92400e!important}.pms211-pick-green{background:#dcfce7!important;color:#166534!important}.pms211-pick-blue{background:#dbeafe!important;color:#1e40af!important}",
      ".pms211-page{display:grid;gap:14px}.pms211-hero{display:flex;justify-content:space-between;gap:14px;align-items:stretch;border:1px solid #d7e2dd;border-left:5px solid #14713f;background:#fff;border-radius:8px;padding:14px}.pms211-drop{min-width:220px;display:grid;place-items:center;text-align:center;border:2px dashed #94a3b8;border-radius:8px;background:#f8fafc;color:#17362d;font-weight:950;padding:12px}.pms211-drop.is-over{border-color:#14713f;background:#ecfdf5}.pms211-grid{display:grid;grid-template-columns:minmax(260px,.8fr) minmax(420px,1.2fr);gap:12px}.pms211-panel{background:#fff;border:1px solid #d7e2dd;border-radius:8px;padding:13px}.pms211-candidates{display:grid;gap:8px;max-height:520px;overflow:auto}.pms211-candidate{display:grid;gap:4px;border:1px solid #d7e2dd;border-left:4px solid #14713f;border-radius:8px;background:#fff;padding:9px;cursor:grab}.pms211-candidate span{font-size:12px;color:#64748b}.pms211-candidate button,.pms211-row-actions button{width:auto!important;margin:0!important}.pms211-row-actions{display:flex;gap:6px;flex-wrap:wrap}",
      ".pms211-contract-modal{position:fixed;inset:0;z-index:41000;background:rgba(15,23,42,.58);display:grid;place-items:center;padding:16px}.pms211-modal{width:min(1120px,96vw);max-height:92vh;overflow:auto;background:#fff;border:1px solid #d7e2dd;border-radius:8px;box-shadow:0 24px 72px rgba(15,23,42,.34)}.pms211-modal-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:13px 15px;border-bottom:1px solid #e2e8f0}.pms211-contract-form{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:14px}.pms211-contract-form label{display:grid;gap:4px;font-size:12px;font-weight:900;color:#526172}.pms211-contract-form input,.pms211-contract-form textarea{width:100%;min-width:0}.pms211-contract-form textarea{min-height:190px}.pms211-full{grid-column:1/-1}.pms211-rtl textarea,.pms211-ar{direction:rtl;text-align:right}.pms211-modal-actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #e2e8f0;padding-top:10px}",
      ".pms211-contract-print pre{white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;border:1px solid #cbd5e1;padding:3mm;line-height:1.45}.pms211-sign{display:grid;grid-template-columns:1fr 1fr;gap:12mm;margin-top:9mm}.pms211-sign div{border-top:1px solid #64748b;padding-top:3mm;min-height:18mm}.pms211-doc-head{display:grid;grid-template-columns:minmax(0,1fr) 68mm;gap:6mm;align-items:start;border-bottom:1.2pt solid #1f2937;padding-bottom:4mm;margin-bottom:4mm}.pms211-doc-main{display:grid;grid-template-columns:42mm minmax(0,1fr);gap:4mm;align-items:start}.pms211-doc-photo{width:42mm;min-height:42mm;border:1px solid #cbd5e1;display:grid;place-items:center;color:#64748b;text-align:center}.pms211-doc-photo img{width:100%;height:auto;object-fit:contain}.pms211-privacy-block{break-inside:avoid;margin-top:3mm}.pms211-privacy-block h2{font-size:10pt;margin:0 0 1.2mm;color:#0f172a}.pms211-privacy-block p{min-height:15mm;border:0.7pt solid #cbd5e1;margin:0;padding:2mm;white-space:pre-wrap;overflow-wrap:anywhere}",
      "@media(max-width:980px){.pms211-grid,.pms211-hero{grid-template-columns:1fr;display:grid}.pms211-contract-form{grid-template-columns:1fr 1fr}}@media(max-width:650px){.pms211-contract-form{grid-template-columns:1fr}.pms211-doc-head,.pms211-doc-main{grid-template-columns:1fr}}"
    ].join("\n");
  }
  function openPage(id){ ensureModule(); if (!window.current) window.current = {page:id, role:"admin", filters:{}}; current.page = id; if (typeof render === "function") render(); }
  function decorateMenu(){
    if (document.querySelector("[data-pms211-open-contracts]")) return;
    var quick = document.getElementById("pms165-quick-buttons");
    if (quick) quick.insertAdjacentHTML("beforeend", '<button type="button" class="pms165-menu-button" data-pms211-open-contracts>Contratti estero AR/RO</button>');
    var nav = document.getElementById("nav");
    if (nav) nav.insertAdjacentHTML("beforeend", '<div class="nav-group"><div class="nav-group-title">Risorse umane</div><button type="button" class="nav-button compact" data-pms211-open-contracts><span class="pms100-code">ARO</span><span class="pms100-label">Contratti estero AR/RO</span></button></div>');
    document.querySelectorAll("[data-pms211-open-contracts]").forEach(function(b){ b.onclick = function(){ openPage(CONTRACTS); }; });
  }
  function wrapRender(){
    if (typeof render === "function" && !render.__pms211Wrapped) {
      var base = render;
      render = function(){
        ensureModule();
        if (window.current && current.page === CONTRACTS) {
          var title = document.getElementById("page-title");
          var subtitle = document.getElementById("page-subtitle");
          var content = document.getElementById("content");
          if (title) title.textContent = "Contratti estero AR/RO";
          if (subtitle) subtitle.textContent = "Contratto semplice bilingue arabo e rumeno";
          if (content) { injectCss(); content.innerHTML = renderContracts(); bindContracts(); decorateMenu(); return; }
        }
        var result = base.apply(this, arguments);
        setTimeout(refresh, 40);
        setTimeout(refresh, 220);
        return result;
      };
      render.__pms211Wrapped = true;
      try { window.render = render; } catch(error) {}
    }
  }
  function refresh(){
    ensureModule();
    injectCss();
    decorateDashboardColors();
    decorateForeignPages();
    decorateMenu();
  }
  function boot(){
    ensureModule();
    injectCss();
    wrapRender();
    patchPrivacyClicks();
    refresh();
    [100, 350, 900, 1800].forEach(function(ms){ setTimeout(refresh, ms); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.PMS_V211_DASHBOARD_COLORS_FOREIGN_CONTRACTS_AR_RO = {version:VERSION, refresh:refresh, printPrivacy:printPrivacy, createContractFromCandidate:createContractFromCandidate};
})();
