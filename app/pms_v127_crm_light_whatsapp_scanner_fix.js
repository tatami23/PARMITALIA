(function(){
  "use strict";
  const VERSION = "PMS-V127-CRM-LIGHT-WHATSAPP-SCANNER";
  const OFFICE_EMAIL = "office@palmiitalia.org";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function digits(v){ return String(v || "").replace(/[^\d]/g,""); }
  function money(v){ const n = Number(String(v || 0).replace(",", ".")); return Number.isFinite(n) ? n.toFixed(2) : "0.00"; }
  function makeId(prefix, list){ return prefix + "-" + String(arr(list).length + 1).padStart(4,"0"); }
  function saveState(){
    try {
      if (typeof window.save === "function") return window.save();
      if (window.state && window.STORAGE_KEY) localStorage.setItem(window.STORAGE_KEY, JSON.stringify(window.state));
    } catch(e) { console.warn("PMS v127 save failed", e); }
  }
  function ensure(){
    window.state = window.state || {};
    window.current = window.current || {};
    state.settings = state.settings || {};
    state.settings.officeEmail = OFFICE_EMAIL;
    state.mailInbox = arr(state.mailInbox);
    state.whatsappContacts = arr(state.whatsappContacts);
    state.foreignRecruiting = arr(state.foreignRecruiting);
    state.communications = arr(state.communications);
    if (Array.isArray(window.modules)) {
      const crm = modules.find(m => m.id === "communications");
      if (crm) {
        crm.label = "Comunicazioni / CRM";
        crm.subtitle = "Email office, WhatsApp e catalogazione";
      }
      const hr = modules.find(m => m.id === "humanResources");
      if (hr) {
        hr.label = "Risorse umane / Recruiting estero";
        hr.subtitle = "Candidati, provenienza, costi e pagamenti";
      }
    }
  }

  function css(){
    if (document.getElementById("pms-v127-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v127-style";
    s.textContent = `
      #content .pms127-page{display:flex;flex-direction:column;gap:16px;max-width:100%;min-width:0;color:#172033}
      #content .pms127-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:start;padding:18px;border:1px solid #cbd5e1;background:#f8fafc;border-radius:8px;box-shadow:0 10px 28px rgba(15,23,42,.08)}
      #content .pms127-hero h3{margin:3px 0 6px;font-size:22px;line-height:1.18;color:#0f172a;letter-spacing:0}
      #content .pms127-hero p,#content .pms127-hero small{margin:0;color:#475569;line-height:1.45}
      #content .pms127-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-start}
      #content .pms127-hero>.pms127-actions{justify-content:flex-end;max-width:350px}
      #content .pms127-panel{border:1px solid #d7dee8;background:#ffffff;border-radius:8px;padding:14px;box-shadow:0 8px 20px rgba(15,23,42,.06);min-width:0;overflow:hidden}
      #content .pms127-panel h4{margin:0 0 10px;font-size:15px;color:#0f172a;letter-spacing:0}
      #content .pms127-grid{display:grid;grid-template-columns:minmax(320px,1.15fr) minmax(300px,.85fr);gap:14px;align-items:start}
      #content .pms127-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      #content .pms127-form label{display:flex;flex-direction:column;gap:5px;min-width:0;color:#334155;font-size:12px;font-weight:800}
      #content .pms127-form input,#content .pms127-form select,#content .pms127-form textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid #cbd5e1;background:#ffffff;color:#0f172a;border-radius:7px;padding:9px;font:inherit;font-size:13px;line-height:1.35}
      #content .pms127-form textarea{min-height:88px;resize:vertical}
      #content .pms127-span{grid-column:1/-1}
      #content .pms127-table{width:100%;max-width:100%;overflow-x:auto;border:1px solid #d7dee8;border-radius:8px;background:#fff}
      #content .pms127-table table{min-width:900px;width:100%;border-collapse:collapse;margin:0}
      #content .pms127-table th{background:#eef2f7;color:#1e293b;font-size:12px;text-align:left}
      #content .pms127-table th,#content .pms127-table td{padding:9px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top;white-space:nowrap;color:#172033}
      #content .pms127-note{max-width:330px;min-width:220px;white-space:normal;line-height:1.35}
      #content .pms127-note small{display:block;color:#64748b;line-height:1.35}
      #content .pms127-badge{display:inline-flex;padding:4px 8px;border-radius:999px;background:#e0f2fe;color:#075985;border:1px solid #bae6fd;font-size:12px;font-weight:900;white-space:nowrap}
      #content .pms127-whatsapp{display:grid;grid-template-columns:132px minmax(0,1fr);gap:14px;align-items:center;background:#ecfdf5;border:1px solid #bbf7d0;border-radius:8px;padding:12px}
      #content .pms127-qr{width:132px;height:132px;border-radius:6px;background:#fff;border:8px solid #fff;box-shadow:0 0 0 1px #86efac;display:grid;grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(7,1fr);gap:3px;padding:5px;box-sizing:border-box}
      #content .pms127-qr span{background:#0f172a;border-radius:1px}
      #content .pms127-qr span:nth-child(3n){background:#16a34a}
      #content .pms127-qr span:nth-child(5n){background:#fff}
      #content .pms127-qr strong{grid-column:1/-1;align-self:center;text-align:center;font-size:11px;color:#166534;background:#dcfce7;border-radius:4px;padding:4px}
      #content .pms127-whatsapp p{margin:0 0 8px;color:#166534;line-height:1.4}
      #content .pms127-empty{color:#64748b;text-align:center;padding:14px}
      #content .pms127-modal-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(15,23,42,.56);display:flex;align-items:center;justify-content:center;padding:18px}
      #content .pms127-modal,.pms127-modal{width:min(760px,100%);max-height:88vh;overflow:auto;border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:16px;color:#172033;box-shadow:0 22px 70px rgba(0,0,0,.28)}
      #content .pms127-body,.pms127-body{white-space:pre-wrap;background:#f8fafc;border:1px solid #d7dee8;border-radius:8px;padding:12px;line-height:1.45;color:#172033}
      @media(max-width:1120px){#content .pms127-hero,#content .pms127-grid{grid-template-columns:1fr}#content .pms127-hero>.pms127-actions{justify-content:flex-start;max-width:none}}
      @media(max-width:760px){#content .pms127-form,#content .pms127-whatsapp{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function qr(){
    let cells = "";
    for (let i = 0; i < 42; i++) cells += "<span></span>";
    return '<div class="pms127-qr" aria-label="Scanner WhatsApp Web">' + cells + '<strong>SCAN<br>WHATSAPP</strong></div>';
  }

  function status(v){ return '<span class="pms127-badge">' + esc(v || "Aperta") + '</span>'; }
  function val(id){ const el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function clear(ids){ ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; }); }

  function renderCRM(){
    ensure(); css();
    const email = esc(OFFICE_EMAIL);
    const mailRows = arr(state.mailInbox).slice(0,80).map(m => {
      const wa = digits(m.phone);
      return `<tr><td>${esc(m.date || "")}</td><td><strong>${esc(m.sender || "-")}</strong><br><small>${esc(m.email || "")}</small></td><td class="pms127-note"><strong>${esc(m.subject || "-")}</strong><small>${esc(String(m.body || "").slice(0,120))}</small></td><td>${esc(m.category || "Inbox")}</td><td>${status(m.status)}</td><td>${esc(m.linkedTo || "-")}</td><td><button class="inline-button" data-pms127-mail-open="${esc(m.id)}">Apri</button> <button class="inline-button" data-pms127-mail-catalog="${esc(m.id)}">Catalogo</button> ${wa ? `<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/${esc(wa)}">WhatsApp</a>` : ""}</td></tr>`;
    }).join("");
    const waRows = arr(state.whatsappContacts).slice(0,80).map(c => {
      const phone = digits(c.phone);
      return `<tr><td>${esc(c.date || "")}</td><td><strong>${esc(c.name || "-")}</strong><br><small>${esc(c.source || "")}</small></td><td>${esc(c.phone || "-")}</td><td>${esc(c.category || "Contatto")}</td><td class="pms127-note">${esc(c.notes || "")}</td><td>${phone ? `<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/${esc(phone)}">Apri chat</a>` : `<a class="inline-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">WhatsApp Web</a>`}</td></tr>`;
    }).join("");
    return `<div class="pms127-page">
      <div class="pms127-hero">
        <div><small>Comunicazioni / CRM</small><h3>Email Office e WhatsApp in un unico pannello</h3><p>Account: <strong>${email}</strong>. Registra le mail ricevute, aprile, catalogale e collega ogni contatto WhatsApp alla pratica corretta.</p></div>
        <div class="pms127-actions"><a class="secondary-button" target="_blank" rel="noopener" href="https://outlook.office.com/mail/">Apri Outlook</a><a class="secondary-button" href="mailto:${email}">Nuova email</a><a class="primary-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">Apri WhatsApp Web</a></div>
      </div>
      <div class="pms127-grid">
        <div class="pms127-panel"><h4>Registra email in entrata</h4><div class="pms127-form">
          <label>Mittente<input id="pms127-mail-sender" placeholder="Nome o azienda"></label><label>Email<input id="pms127-mail-email" type="email" placeholder="mittente@email.com"></label>
          <label>Oggetto<input id="pms127-mail-subject" placeholder="Oggetto email"></label><label>Categoria<select id="pms127-mail-category"><option>Inbox</option><option>Ordini</option><option>Offerte</option><option>Fornitori</option><option>Clienti</option><option>Pagamenti</option><option>Sinistri</option><option>Recruiting</option><option>Altro</option></select></label>
          <label>Telefono / WhatsApp<input id="pms127-mail-phone" placeholder="+39 ..."></label><label>Collegato a<input id="pms127-mail-linked" placeholder="Cliente, pratica, offerta"></label>
          <label class="pms127-span">Testo email<textarea id="pms127-mail-body" placeholder="Incolla qui il contenuto della mail ricevuta"></textarea></label>
          <div class="pms127-actions pms127-span"><button class="primary-button" data-pms127-save-mail>Salva e cataloga</button><button class="secondary-button" data-pms127-clear-mail>Pulisci</button></div>
        </div></div>
        <div class="pms127-panel"><h4>Scanner WhatsApp Web</h4><div class="pms127-whatsapp">${qr()}<div><p><strong>Per collegare WhatsApp:</strong><br>apri WhatsApp Web, poi dal telefono vai su Dispositivi collegati e scansiona il codice.</p><div class="pms127-actions"><a class="primary-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">Vai a WhatsApp Web</a></div></div></div><hr><h4>Salva contatto WhatsApp</h4><div class="pms127-form"><label>Nome<input id="pms127-wa-name" placeholder="Nome contatto"></label><label>Telefono<input id="pms127-wa-phone" placeholder="+40 ..."></label><label>Origine<input id="pms127-wa-source" placeholder="Email, sito, cliente, agente"></label><label>Categoria<select id="pms127-wa-category"><option>Cliente</option><option>Fornitore</option><option>Autista</option><option>Candidato</option><option>Intermediario</option><option>Altro</option></select></label><label class="pms127-span">Note<textarea id="pms127-wa-notes" placeholder="Richiesta, prodotto, priorita, prossima azione"></textarea></label><div class="pms127-actions pms127-span"><button class="primary-button" data-pms127-save-wa>Salva contatto</button></div></div></div>
      </div>
      <div class="section-header"><h3>Email catalogate</h3></div><div class="pms127-table"><table><thead><tr><th>Data</th><th>Mittente</th><th>Oggetto</th><th>Categoria</th><th>Stato</th><th>Collegato</th><th>Azioni</th></tr></thead><tbody>${mailRows || '<tr><td colspan="7" class="pms127-empty">Nessuna email registrata.</td></tr>'}</tbody></table></div>
      <div class="section-header"><h3>Contatti WhatsApp salvati</h3></div><div class="pms127-table"><table><thead><tr><th>Data</th><th>Contatto</th><th>Telefono</th><th>Categoria</th><th>Note</th><th>Azioni</th></tr></thead><tbody>${waRows || '<tr><td colspan="6" class="pms127-empty">Nessun contatto WhatsApp salvato.</td></tr>'}</tbody></table></div>
    </div>`;
  }

  function renderHR(){
    ensure(); css();
    const rows = arr(state.foreignRecruiting).slice(0,100).map(r => {
      const phone = digits(r.phone || r.whatsapp);
      const total = Number(String(r.spentAmount || 0).replace(",", ".")) + Number(String(r.toPayAmount || 0).replace(",", "."));
      return `<tr><td>${esc(r.date || "")}</td><td><strong>${esc(r.fullName || "-")}</strong><br><small>${esc(r.email || "")}</small></td><td>${esc(r.country || "-")}<br><small>${esc(r.city || "")}</small></td><td>${esc(r.role || "-")}</td><td class="pms127-note">${esc(r.documents || r.skills || "-")}</td><td>${esc(r.currency || "EUR")} ${money(r.spentAmount)}</td><td>${esc(r.currency || "EUR")} ${money(r.toPayAmount)}</td><td>${esc(r.currency || "EUR")} ${money(total)}</td><td>${status(r.status || "In valutazione")}</td><td>${phone ? `<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/${esc(phone)}">WhatsApp</a>` : ""} <button class="inline-button" data-pms127-rec-open="${esc(r.id)}">Scheda</button></td></tr>`;
    }).join("");
    return `<div class="pms127-page"><div class="pms127-hero"><div><small>Risorse umane</small><h3>Recruiting estero</h3><p>Schede candidate leggibili: paese, ruolo, documenti, costi sostenuti e importi da pagare.</p></div><div class="pms127-actions"><button class="primary-button" data-pms127-save-rec>Salva candidato</button><button class="secondary-button" data-pms127-clear-rec>Pulisci</button></div></div>
      <div class="pms127-panel"><h4>Nuova scheda candidato</h4><div class="pms127-form"><label>Nome e cognome<input id="pms127-rec-name"></label><label>Paese<input id="pms127-rec-country"></label><label>Citta<input id="pms127-rec-city"></label><label>Nazionalita<input id="pms127-rec-nationality"></label><label>Ruolo<input id="pms127-rec-role"></label><label>Canale / recruiter<input id="pms127-rec-source"></label><label>Telefono / WhatsApp<input id="pms127-rec-phone"></label><label>Email<input id="pms127-rec-email" type="email"></label><label>Stato<select id="pms127-rec-status"><option>In valutazione</option><option>Documenti richiesti</option><option>Colloquio fissato</option><option>Idoneo</option><option>Assunto</option><option>In attesa pagamento</option><option>Archiviato</option></select></label><label>Valuta<select id="pms127-rec-currency"><option>EUR</option><option>RON</option><option>GBP</option><option>USD</option></select></label><label>Costo gia speso<input id="pms127-rec-spent" type="number" step="0.01"></label><label>Da pagare<input id="pms127-rec-topay" type="number" step="0.01"></label><label class="pms127-span">Documenti, competenze, lingue<textarea id="pms127-rec-docs"></textarea></label><label class="pms127-span">Note<textarea id="pms127-rec-notes"></textarea></label></div></div>
      <div class="section-header"><h3>Archivio recruiting estero</h3></div><div class="pms127-table"><table><thead><tr><th>Data</th><th>Candidato</th><th>Origine</th><th>Ruolo</th><th>Scheda</th><th>Speso</th><th>Da pagare</th><th>Totale</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${rows || '<tr><td colspan="10" class="pms127-empty">Nessun candidato registrato.</td></tr>'}</tbody></table></div></div>`;
  }

  function showModal(title, bodyHtml){
    document.querySelectorAll(".pms127-modal-backdrop").forEach(x => x.remove());
    const box = document.createElement("div");
    box.className = "pms127-modal-backdrop";
    box.innerHTML = '<div class="pms127-modal"><div class="pms127-actions" style="justify-content:space-between;margin-bottom:10px"><h3 style="margin:0">' + esc(title) + '</h3><button class="secondary-button" data-pms127-close>Chiudi</button></div>' + bodyHtml + '</div>';
    document.body.appendChild(box);
    box.addEventListener("click", e => { if (e.target === box || e.target.closest("[data-pms127-close]")) box.remove(); });
  }

  function saveMail(){
    ensure();
    const item = {id:makeId("MAIL", state.mailInbox), date:today(), sender:val("pms127-mail-sender"), email:val("pms127-mail-email"), subject:val("pms127-mail-subject") || "Email ricevuta", category:val("pms127-mail-category") || "Inbox", phone:val("pms127-mail-phone"), linkedTo:val("pms127-mail-linked"), body:val("pms127-mail-body"), status:"Aperta"};
    state.mailInbox.unshift(item);
    state.communications.unshift({id:makeId("CRM", state.communications), type:"Email", title:item.subject, channel:"Email Office", direction:"Entrata", mailAccount:OFFICE_EMAIL, message:item.body, status:"Aperta", priority:item.category === "Sinistri" ? "Alta" : "Media", linkedTo:item.linkedTo || item.category, client:item.sender});
    saveState();
    if (typeof render === "function") render();
  }
  function saveWa(){
    ensure();
    state.whatsappContacts.unshift({id:makeId("WA", state.whatsappContacts), date:today(), name:val("pms127-wa-name"), phone:val("pms127-wa-phone"), source:val("pms127-wa-source"), category:val("pms127-wa-category") || "Contatto", notes:val("pms127-wa-notes")});
    saveState();
    if (typeof render === "function") render();
  }
  function saveRec(){
    ensure();
    state.foreignRecruiting.unshift({id:makeId("REC-EST", state.foreignRecruiting), date:today(), fullName:val("pms127-rec-name"), country:val("pms127-rec-country"), city:val("pms127-rec-city"), nationality:val("pms127-rec-nationality"), role:val("pms127-rec-role"), sourceChannel:val("pms127-rec-source"), phone:val("pms127-rec-phone"), email:val("pms127-rec-email"), status:val("pms127-rec-status") || "In valutazione", currency:val("pms127-rec-currency") || "EUR", spentAmount:val("pms127-rec-spent"), toPayAmount:val("pms127-rec-topay"), documents:val("pms127-rec-docs"), notes:val("pms127-rec-notes")});
    saveState();
    if (typeof render === "function") render();
  }

  function bind(){
    const sm = document.querySelector("[data-pms127-save-mail]");
    const cm = document.querySelector("[data-pms127-clear-mail]");
    const sw = document.querySelector("[data-pms127-save-wa]");
    const sr = document.querySelector("[data-pms127-save-rec]");
    const cr = document.querySelector("[data-pms127-clear-rec]");
    if (sm) sm.addEventListener("click", saveMail);
    if (cm) cm.addEventListener("click", () => clear(["pms127-mail-sender","pms127-mail-email","pms127-mail-subject","pms127-mail-phone","pms127-mail-linked","pms127-mail-body"]));
    if (sw) sw.addEventListener("click", saveWa);
    if (sr) sr.addEventListener("click", saveRec);
    if (cr) cr.addEventListener("click", () => clear(["pms127-rec-name","pms127-rec-country","pms127-rec-city","pms127-rec-nationality","pms127-rec-role","pms127-rec-source","pms127-rec-phone","pms127-rec-email","pms127-rec-spent","pms127-rec-topay","pms127-rec-docs","pms127-rec-notes"]));
    document.querySelectorAll("[data-pms127-mail-open]").forEach(btn => btn.addEventListener("click", () => {
      const item = arr(state.mailInbox).find(x => x.id === btn.getAttribute("data-pms127-mail-open"));
      if (item) showModal(item.subject || "Email", '<p><strong>Mittente:</strong> ' + esc(item.sender || "-") + ' &lt;' + esc(item.email || "") + '&gt;</p><div class="pms127-body">' + esc(item.body || "Nessun testo salvato.") + '</div>');
    }));
    document.querySelectorAll("[data-pms127-mail-catalog]").forEach(btn => btn.addEventListener("click", () => {
      const item = arr(state.mailInbox).find(x => x.id === btn.getAttribute("data-pms127-mail-catalog"));
      if (!item) return;
      const cat = prompt("Categoria email", item.category || "Inbox");
      if (cat != null && cat.trim()) item.category = cat.trim();
      const st = prompt("Stato email", item.status || "Aperta");
      if (st != null && st.trim()) item.status = st.trim();
      saveState();
      if (typeof render === "function") render();
    }));
    document.querySelectorAll("[data-pms127-rec-open]").forEach(btn => btn.addEventListener("click", () => {
      const r = arr(state.foreignRecruiting).find(x => x.id === btn.getAttribute("data-pms127-rec-open"));
      if (r) showModal(r.fullName || "Scheda candidato", '<p><strong>Origine:</strong> ' + esc(r.country || "-") + ' ' + esc(r.city || "") + '</p><p><strong>Costi:</strong> ' + esc(r.currency || "EUR") + ' speso ' + money(r.spentAmount) + ', da pagare ' + money(r.toPayAmount) + '</p><div class="pms127-body">' + esc((r.documents || "") + "\n\n" + (r.notes || "")) + '</div>');
    }));
  }

  function headers(t,s){
    const title = document.getElementById("page-title");
    const sub = document.getElementById("page-subtitle");
    if (title) title.textContent = t;
    if (sub) sub.textContent = s;
  }

  const baseRender = typeof window.render === "function" ? window.render : null;
  if (baseRender && !baseRender.__pms127Wrapped) {
    window.render = function(){
      ensure();
      const content = document.getElementById("content");
      if (content && current && current.page === "communications") {
        headers("Comunicazioni / CRM", "Email office@palmiitalia.org, WhatsApp Web e catalogazione");
        content.innerHTML = renderCRM();
        bind();
        return;
      }
      if (content && current && current.page === "humanResources") {
        headers("Risorse umane / Recruiting estero", "Candidati esteri, costi e pagamenti");
        content.innerHTML = renderHR();
        bind();
        return;
      }
      return baseRender.apply(this, arguments);
    };
    window.render.__pms127Wrapped = true;
  }

  ensure();
  css();
  setTimeout(() => { if (window.current && (current.page === "communications" || current.page === "humanResources") && typeof render === "function") render(); }, 80);
  window.pmsV127CrmLightWhatsappScanner = {version:VERSION};
})();
