(function(){
  "use strict";
  const VERSION = "PMS-V125-CRM-MAIL-WHATSAPP-RECRUITING-ESTERO";
  const OFFICE_EMAIL = "office@parmitalia.ro";

  function esc(v){ return String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(v){ const n = Number(String(v || 0).replace(",", ".")); return Number.isFinite(n) ? n.toFixed(2) : "0.00"; }
  function digits(v){ return String(v || "").replace(/[^\d]/g,""); }
  function id(prefix, list){ return prefix + "-" + String(arr(list).length + 1).padStart(4,"0"); }
  function saveState(){
    try {
      if (typeof window.save === "function") return window.save();
      if (window.state && window.STORAGE_KEY) localStorage.setItem(window.STORAGE_KEY, JSON.stringify(window.state));
    } catch(e) { console.warn("PMS v125 save failed", e); }
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
        crm.subtitle = "Email office, WhatsApp e catalogazione messaggi";
        crm.code = "CRM";
      }
      const hr = modules.find(m => m.id === "humanResources");
      if (hr) {
        hr.label = "Risorse umane / Recruiting estero";
        hr.subtitle = "Candidati esteri, schede, costi e pagamenti";
        hr.code = "HR";
      }
    }
  }

  function css(){
    if (document.getElementById("pms-v125-style")) return;
    const s = document.createElement("style");
    s.id = "pms-v125-style";
    s.textContent = `
      #content .pms125-page{display:flex;flex-direction:column;gap:18px;max-width:100%;min-width:0}
      #content .pms125-hero{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:start;padding:16px;border:1px solid rgba(59,130,246,.22);background:linear-gradient(135deg,rgba(15,23,42,.92),rgba(30,41,59,.88));border-radius:8px;max-width:100%;overflow:hidden}
      #content .pms125-hero h3{margin:4px 0 6px;font-size:21px;line-height:1.18;color:#f8fafc;letter-spacing:0}
      #content .pms125-hero p,#content .pms125-hero small{margin:0;color:rgba(226,232,240,.84);max-width:780px;line-height:1.45}
      #content .pms125-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:flex-start}
      #content .pms125-hero>.pms125-actions{justify-content:flex-end;max-width:330px}
      #content .pms125-grid{display:grid;grid-template-columns:repeat(2,minmax(280px,1fr));gap:14px;align-items:start}
      #content .pms125-card{border:1px solid rgba(148,163,184,.20);background:rgba(15,23,42,.64);border-radius:8px;padding:14px;min-width:0;overflow:hidden}
      #content .pms125-card h4{margin:0 0 10px;font-size:15px;color:#f8fafc;letter-spacing:0}
      #content .pms125-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;min-width:0}
      #content .pms125-form label{display:flex;flex-direction:column;gap:5px;min-width:0;font-size:12px;color:rgba(226,232,240,.82);font-weight:700}
      #content .pms125-form input,#content .pms125-form select,#content .pms125-form textarea{width:100%;min-width:0;box-sizing:border-box;border:1px solid rgba(148,163,184,.34);background:rgba(2,6,23,.66);color:#f8fafc;border-radius:7px;padding:9px;font:inherit;font-size:13px;line-height:1.35}
      #content .pms125-form textarea{min-height:86px;resize:vertical}
      #content .pms125-span{grid-column:1/-1}
      #content .pms125-table-wrap{width:100%;max-width:100%;overflow-x:auto;border:1px solid rgba(148,163,184,.16);border-radius:8px;background:rgba(2,6,23,.18)}
      #content .pms125-table-wrap table{min-width:980px;margin:0}
      #content .pms125-table-wrap th,#content .pms125-table-wrap td{vertical-align:top;white-space:nowrap}
      #content .pms125-table-note{max-width:300px;min-width:220px;white-space:normal;line-height:1.35}
      #content .pms125-table-note small{display:block;color:rgba(226,232,240,.72);line-height:1.35}
      #content .pms125-badge{display:inline-flex;align-items:center;white-space:nowrap;padding:4px 8px;border-radius:999px;border:1px solid rgba(125,211,252,.28);background:rgba(14,165,233,.12);color:#bae6fd;font-size:12px;font-weight:800}
      #content .pms125-actions .primary-button,#content .pms125-actions .secondary-button,#content .pms125-actions .inline-button{white-space:nowrap}
      .pms125-modal-backdrop{position:fixed;inset:0;z-index:10000;background:rgba(2,6,23,.76);display:flex;align-items:center;justify-content:center;padding:18px}
      .pms125-modal{width:min(760px,100%);max-height:88vh;overflow:auto;border:1px solid rgba(125,211,252,.32);background:#0f172a;border-radius:8px;padding:16px;box-shadow:0 22px 70px rgba(0,0,0,.48)}
      .pms125-modal-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}
      .pms125-modal-head h3{margin:0;font-size:18px}
      .pms125-email-body{white-space:pre-wrap;border:1px solid rgba(148,163,184,.22);background:rgba(2,6,23,.52);border-radius:8px;padding:12px;line-height:1.45}
      @media(max-width:1100px){#content .pms125-hero{grid-template-columns:1fr}#content .pms125-hero>.pms125-actions{justify-content:flex-start;max-width:none}}
      @media(max-width:900px){#content .pms125-grid{grid-template-columns:1fr}#content .pms125-form{grid-template-columns:1fr}#content .pms125-actions{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function statusBadge(value){
    const v = value || "Aperta";
    if (typeof window.badge === "function") return badge(v, /chius|complet|pagato/i.test(v) ? "success" : /attesa|da pagare|urgente/i.test(v) ? "warn" : "primary");
    return '<span class="pms125-badge">' + esc(v) + '</span>';
  }

  function renderCRM(){
    ensure(); css();
    const email = esc(state.settings.officeEmail || OFFICE_EMAIL);
    const mailRows = arr(state.mailInbox).slice(0,80).map(m => {
      const wa = digits(m.phone);
      return '<tr><td>' + esc(m.date || "") + '</td><td><strong>' + esc(m.sender || "-") + '</strong><br><small>' + esc(m.email || "") + '</small></td><td class="pms125-table-note"><strong>' + esc(m.subject || "-") + '</strong><br><small>' + esc(String(m.body || "").slice(0,110)) + '</small></td><td>' + esc(m.category || "Inbox") + '</td><td>' + statusBadge(m.status) + '</td><td>' + esc(m.linkedTo || "-") + '</td><td><button class="inline-button" data-pms125-mail-open="' + esc(m.id) + '">Apri</button> <button class="inline-button" data-pms125-mail-catalog="' + esc(m.id) + '">Catalogo</button> ' + (wa ? '<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/' + esc(wa) + '">WhatsApp</a>' : '') + '</td></tr>';
    }).join("");
    const waRows = arr(state.whatsappContacts).slice(0,80).map(c => {
      const phone = digits(c.phone);
      return '<tr><td>' + esc(c.date || "") + '</td><td><strong>' + esc(c.name || "-") + '</strong><br><small>' + esc(c.source || "") + '</small></td><td>' + esc(c.phone || "-") + '</td><td>' + esc(c.category || "Contatto") + '</td><td class="pms125-table-note">' + esc(c.notes || "") + '</td><td>' + (phone ? '<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/' + esc(phone) + '">Apri chat</a>' : '<a class="inline-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">WhatsApp Web</a>') + '</td></tr>';
    }).join("");
    return '<div class="pms125-page"><div class="pms125-hero"><div><small>CRM operativo</small><h3>Comunicazioni, email Office e WhatsApp</h3><p>Account diretto: <strong>' + email + '</strong>. Qui registri le mail in entrata, le apri, le visualizzi e le cataloghi per lavoro, offerte, ordini, pagamenti o recruiting.</p></div><div class="pms125-actions"><a class="secondary-button" target="_blank" rel="noopener" href="https://outlook.office.com/mail/">Apri Outlook</a><a class="secondary-button" href="mailto:' + email + '">Nuova email</a><a class="secondary-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">WhatsApp Web</a><button class="primary-button" data-pms125-add-mail>Registra email</button></div></div><div class="pms125-grid"><div class="pms125-card"><h4>Nuova email in entrata</h4><div class="pms125-form"><label>Mittente<input id="pms125-mail-sender" placeholder="Nome o azienda"></label><label>Email<input id="pms125-mail-email" type="email" placeholder="mittente@email.com"></label><label>Oggetto<input id="pms125-mail-subject" placeholder="Oggetto email"></label><label>Categoria<select id="pms125-mail-category"><option>Inbox</option><option>Ordini</option><option>Offerte</option><option>Fornitori</option><option>Clienti</option><option>Pagamenti</option><option>Sinistri</option><option>Recruiting</option><option>Altro</option></select></label><label>Telefono / WhatsApp<input id="pms125-mail-phone" placeholder="+39 ..."></label><label>Collegato a<input id="pms125-mail-linked" placeholder="Cliente, pratica, offerta"></label><label class="pms125-span">Testo email<textarea id="pms125-mail-body" placeholder="Incolla qui il contenuto della mail ricevuta"></textarea></label><div class="pms125-actions pms125-span"><button class="primary-button" data-pms125-save-mail>Salva e cataloga</button><button class="secondary-button" data-pms125-clear-mail>Pulisci</button></div></div></div><div class="pms125-card"><h4>Contatti WhatsApp</h4><div class="pms125-form"><label>Nome<input id="pms125-wa-name" placeholder="Nome contatto"></label><label>Telefono<input id="pms125-wa-phone" placeholder="+40 ..."></label><label>Origine<input id="pms125-wa-source" placeholder="Email, sito, cliente, agente"></label><label>Categoria<select id="pms125-wa-category"><option>Cliente</option><option>Fornitore</option><option>Autista</option><option>Candidato</option><option>Intermediario</option><option>Altro</option></select></label><label class="pms125-span">Note<textarea id="pms125-wa-notes" placeholder="Richiesta, prodotto, priorita, prossima azione"></textarea></label><div class="pms125-actions pms125-span"><button class="primary-button" data-pms125-save-wa>Salva contatto</button><a class="secondary-button" target="_blank" rel="noopener" href="https://web.whatsapp.com">Apri WhatsApp</a></div></div></div></div><div class="section-header"><h3>Email catalogate</h3><div class="filters"><input data-pms125-mail-filter placeholder="Cerca mittente, oggetto, categoria..."></div></div><div class="pms125-table-wrap"><table><thead><tr><th>Data</th><th>Mittente</th><th>Oggetto</th><th>Categoria</th><th>Stato</th><th>Collegato</th><th>Azioni</th></tr></thead><tbody id="pms125-mail-rows">' + (mailRows || '<tr><td colspan="7" class="empty">Nessuna email registrata.</td></tr>') + '</tbody></table></div><div class="section-header"><h3>Rubrica WhatsApp CRM</h3></div><div class="pms125-table-wrap"><table><thead><tr><th>Data</th><th>Contatto</th><th>Telefono</th><th>Categoria</th><th>Note</th><th>Azioni</th></tr></thead><tbody>' + (waRows || '<tr><td colspan="6" class="empty">Nessun contatto WhatsApp salvato.</td></tr>') + '</tbody></table></div></div>';
  }

  function renderHR(){
    ensure(); css();
    const rows = arr(state.foreignRecruiting).slice(0,100).map(r => {
      const phone = digits(r.phone || r.whatsapp);
      const total = Number(String(r.spentAmount || 0).replace(",", ".")) + Number(String(r.toPayAmount || 0).replace(",", "."));
      return '<tr><td>' + esc(r.date || "") + '</td><td><strong>' + esc(r.fullName || "-") + '</strong><br><small>' + esc(r.email || "") + '</small></td><td>' + esc(r.country || "-") + '<br><small>' + esc(r.city || "") + '</small></td><td>' + esc(r.role || "-") + '<br><small>' + esc(r.sourceChannel || "") + '</small></td><td class="pms125-table-note">' + esc(r.documents || r.skills || "-") + '</td><td>' + esc(r.currency || "EUR") + ' ' + money(r.spentAmount) + '</td><td>' + esc(r.currency || "EUR") + ' ' + money(r.toPayAmount) + '</td><td>' + esc(r.currency || "EUR") + ' ' + money(total) + '</td><td>' + statusBadge(r.status || "In valutazione") + '</td><td>' + (phone ? '<a class="inline-button" target="_blank" rel="noopener" href="https://wa.me/' + esc(phone) + '">WhatsApp</a>' : '') + ' <button class="inline-button" data-pms125-rec-open="' + esc(r.id) + '">Scheda</button></td></tr>';
    }).join("");
    return '<div class="pms125-page"><div class="pms125-hero"><div><small>Risorse umane</small><h3>Recruiting estero</h3><p>Schede candidate, provenienza, documenti, competenze, costi gia spesi e importi ancora da pagare.</p></div><div class="pms125-actions"><button class="primary-button" data-pms125-save-rec>Salva candidato</button><button class="secondary-button" data-pms125-clear-rec>Pulisci scheda</button></div></div><div class="pms125-card"><h4>Nuova scheda candidato estero</h4><div class="pms125-form"><label>Nome e cognome<input id="pms125-rec-name" placeholder="Candidato"></label><label>Paese di provenienza<input id="pms125-rec-country" placeholder="Romania, Ucraina, India..."></label><label>Citta<input id="pms125-rec-city" placeholder="Citta"></label><label>Nazionalita<input id="pms125-rec-nationality" placeholder="Nazionalita"></label><label>Ruolo richiesto<input id="pms125-rec-role" placeholder="Autista, produzione, magazzino..."></label><label>Canale / recruiter<input id="pms125-rec-source" placeholder="Agenzia, passaparola, sito"></label><label>Telefono / WhatsApp<input id="pms125-rec-phone" placeholder="+40 ..."></label><label>Email<input id="pms125-rec-email" type="email" placeholder="email candidato"></label><label>Stato<select id="pms125-rec-status"><option>In valutazione</option><option>Documenti richiesti</option><option>Colloquio fissato</option><option>Idoneo</option><option>Assunto</option><option>In attesa pagamento</option><option>Archiviato</option></select></label><label>Valuta<select id="pms125-rec-currency"><option>EUR</option><option>RON</option><option>GBP</option><option>USD</option></select></label><label>Costo gia speso<input id="pms125-rec-spent" type="number" step="0.01" placeholder="0.00"></label><label>Da pagare<input id="pms125-rec-topay" type="number" step="0.01" placeholder="0.00"></label><label class="pms125-span">Documenti, competenze, lingue<textarea id="pms125-rec-docs" placeholder="Passaporto, patente, permesso, lingua, esperienza, certificati"></textarea></label><label class="pms125-span">Note e prossime azioni<textarea id="pms125-rec-notes" placeholder="Cosa manca, appuntamenti, costi, accordi"></textarea></label></div></div><div class="section-header"><h3>Archivio recruiting estero</h3><div class="filters"><input data-pms125-rec-filter placeholder="Cerca candidato, paese, ruolo..."></div></div><div class="pms125-table-wrap"><table><thead><tr><th>Data</th><th>Candidato</th><th>Origine</th><th>Ruolo</th><th>Scheda</th><th>Speso</th><th>Da pagare</th><th>Totale</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>' + (rows || '<tr><td colspan="10" class="empty">Nessun candidato estero registrato.</td></tr>') + '</tbody></table></div></div>';
  }

  function showModal(title, bodyHtml){
    document.querySelectorAll(".pms125-modal-backdrop").forEach(x => x.remove());
    const box = document.createElement("div");
    box.className = "pms125-modal-backdrop";
    box.innerHTML = '<div class="pms125-modal"><div class="pms125-modal-head"><h3>' + esc(title) + '</h3><button class="secondary-button" data-pms125-close-modal>Chiudi</button></div>' + bodyHtml + '</div>';
    document.body.appendChild(box);
    box.addEventListener("click", e => {
      if (e.target === box || e.target.closest("[data-pms125-close-modal]")) box.remove();
    });
  }

  function val(id){ const el = document.getElementById(id); return el ? el.value.trim() : ""; }
  function clear(ids){ ids.forEach(x => { const el = document.getElementById(x); if (el) el.value = ""; }); }

  function saveMail(){
    ensure();
    const item = {
      id: id("MAIL", state.mailInbox),
      date: today(),
      sender: val("pms125-mail-sender"),
      email: val("pms125-mail-email"),
      subject: val("pms125-mail-subject") || "Email ricevuta",
      category: val("pms125-mail-category") || "Inbox",
      phone: val("pms125-mail-phone"),
      linkedTo: val("pms125-mail-linked"),
      body: val("pms125-mail-body"),
      status: "Aperta"
    };
    state.mailInbox.unshift(item);
    state.communications.unshift({id:id("CRM", state.communications), type:"Email", title:item.subject, channel:"Email Office", direction:"Entrata", mailAccount:OFFICE_EMAIL, message:item.body, status:"Aperta", priority:item.category === "Sinistri" ? "Alta" : "Media", linkedTo:item.linkedTo || item.category, client:item.sender});
    saveState();
    if (typeof render === "function") render();
  }

  function saveWhatsapp(){
    ensure();
    state.whatsappContacts.unshift({id:id("WA", state.whatsappContacts), date:today(), name:val("pms125-wa-name"), phone:val("pms125-wa-phone"), source:val("pms125-wa-source"), category:val("pms125-wa-category") || "Contatto", notes:val("pms125-wa-notes")});
    saveState();
    if (typeof render === "function") render();
  }

  function saveRecruit(){
    ensure();
    state.foreignRecruiting.unshift({id:id("REC-EST", state.foreignRecruiting), date:today(), fullName:val("pms125-rec-name"), country:val("pms125-rec-country"), city:val("pms125-rec-city"), nationality:val("pms125-rec-nationality"), role:val("pms125-rec-role"), sourceChannel:val("pms125-rec-source"), phone:val("pms125-rec-phone"), whatsapp:val("pms125-rec-phone"), email:val("pms125-rec-email"), status:val("pms125-rec-status") || "In valutazione", currency:val("pms125-rec-currency") || "EUR", spentAmount:val("pms125-rec-spent"), toPayAmount:val("pms125-rec-topay"), documents:val("pms125-rec-docs"), skills:val("pms125-rec-docs"), notes:val("pms125-rec-notes")});
    saveState();
    if (typeof render === "function") render();
  }

  function bind(){
    const saveMailBtn = document.querySelector("[data-pms125-save-mail]");
    const clearMailBtn = document.querySelector("[data-pms125-clear-mail]");
    const addMailBtn = document.querySelector("[data-pms125-add-mail]");
    const saveWaBtn = document.querySelector("[data-pms125-save-wa]");
    const saveRecBtn = document.querySelector("[data-pms125-save-rec]");
    const clearRecBtn = document.querySelector("[data-pms125-clear-rec]");
    if (saveMailBtn) saveMailBtn.addEventListener("click", saveMail);
    if (clearMailBtn) clearMailBtn.addEventListener("click", () => clear(["pms125-mail-sender","pms125-mail-email","pms125-mail-subject","pms125-mail-phone","pms125-mail-linked","pms125-mail-body"]));
    if (addMailBtn) addMailBtn.addEventListener("click", () => { const el = document.getElementById("pms125-mail-sender"); if (el) el.focus(); });
    if (saveWaBtn) saveWaBtn.addEventListener("click", saveWhatsapp);
    if (saveRecBtn) saveRecBtn.addEventListener("click", saveRecruit);
    if (clearRecBtn) clearRecBtn.addEventListener("click", () => clear(["pms125-rec-name","pms125-rec-country","pms125-rec-city","pms125-rec-nationality","pms125-rec-role","pms125-rec-source","pms125-rec-phone","pms125-rec-email","pms125-rec-spent","pms125-rec-topay","pms125-rec-docs","pms125-rec-notes"]));
    document.querySelectorAll("[data-pms125-mail-open]").forEach(btn => btn.addEventListener("click", () => {
      const item = arr(state.mailInbox).find(x => x.id === btn.getAttribute("data-pms125-mail-open"));
      if (!item) return;
      showModal(item.subject || "Email", '<p><strong>Mittente:</strong> ' + esc(item.sender || "-") + ' &lt;' + esc(item.email || "") + '&gt;</p><p><strong>Categoria:</strong> ' + esc(item.category || "Inbox") + ' - <strong>Stato:</strong> ' + esc(item.status || "Aperta") + '</p><div class="pms125-email-body">' + esc(item.body || "Nessun testo salvato.") + '</div>');
    }));
    document.querySelectorAll("[data-pms125-mail-catalog]").forEach(btn => btn.addEventListener("click", () => {
      const item = arr(state.mailInbox).find(x => x.id === btn.getAttribute("data-pms125-mail-catalog"));
      if (!item) return;
      const cat = prompt("Categoria email", item.category || "Inbox");
      if (cat != null && cat.trim()) item.category = cat.trim();
      const st = prompt("Stato email", item.status || "Aperta");
      if (st != null && st.trim()) item.status = st.trim();
      saveState();
      if (typeof render === "function") render();
    }));
    document.querySelectorAll("[data-pms125-rec-open]").forEach(btn => btn.addEventListener("click", () => {
      const r = arr(state.foreignRecruiting).find(x => x.id === btn.getAttribute("data-pms125-rec-open"));
      if (!r) return;
      showModal(r.fullName || "Scheda candidato", '<p><strong>Origine:</strong> ' + esc(r.country || "-") + ' ' + esc(r.city || "") + '</p><p><strong>Ruolo:</strong> ' + esc(r.role || "-") + ' - <strong>Stato:</strong> ' + esc(r.status || "-") + '</p><p><strong>Costi:</strong> ' + esc(r.currency || "EUR") + ' speso ' + money(r.spentAmount) + ', da pagare ' + money(r.toPayAmount) + '</p><div class="pms125-email-body">' + esc((r.documents || "") + "\n\n" + (r.notes || "")) + '</div>');
    }));
  }

  function setHeaders(titleText, subText){
    const title = document.getElementById("page-title") || document.querySelector(".page-title h1,.content h1");
    const subtitle = document.getElementById("page-subtitle") || document.querySelector(".page-subtitle,.content .subtitle");
    if (title) title.textContent = titleText;
    if (subtitle) subtitle.textContent = subText;
  }

  const oldRender = typeof window.render === "function" ? window.render : null;
  if (oldRender && !oldRender.__pms125Wrapped) {
    window.render = function(){
      ensure();
      const content = document.getElementById("content") || document.querySelector("main .content,.content");
      if (content && current && current.page === "communications") {
        setHeaders("Comunicazioni / CRM", "Email office@parmitalia.ro, WhatsApp e catalogazione messaggi");
        content.innerHTML = renderCRM();
        bind();
        return;
      }
      if (content && current && current.page === "humanResources") {
        setHeaders("Risorse umane / Recruiting estero", "Candidati esteri, schede, costi e pagamenti");
        content.innerHTML = renderHR();
        bind();
        return;
      }
      const result = oldRender.apply(this, arguments);
      setTimeout(() => { ensure(); }, 20);
      return result;
    };
    window.render.__pms125Wrapped = true;
  }

  const oldRenderNav = typeof window.renderNav === "function" ? window.renderNav : null;
  if (oldRenderNav && !oldRenderNav.__pms125Wrapped) {
    window.renderNav = function(){
      ensure();
      return oldRenderNav.apply(this, arguments);
    };
    window.renderNav.__pms125Wrapped = true;
  }

  ensure();
  css();
  setTimeout(() => { ensure(); if (window.current && (current.page === "communications" || current.page === "humanResources") && typeof render === "function") render(); }, 120);
  window.pmsV125CrmMailWhatsappForeignRecruiting = {version:VERSION, renderCRM, renderHR};
})();
