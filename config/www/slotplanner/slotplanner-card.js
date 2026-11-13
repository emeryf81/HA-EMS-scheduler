/* Slotplanner card for Home Assistant.
 * Plans devices in the cheapest blocks of the day. Reads the sensors of the Slotplanner package
 * (sensor.slotplanner_config, _state, _slots, _prices, _history, _stats) and calls its scripts.
 * Add as resource: /local/slotplanner/slotplanner-card.js (JavaScript module), card: type: custom:slotplanner-card
 */
const SP_VERSION = '1.0.1';

const I18N = {
  en: {
    plan: 'Plan', runs: 'Runs', reports: 'Reports', setup: 'Setup',
    sub: 'Every device in a cheap block. The planner starts and stops it, measures it and reports on it.',
    priceNow: 'Price now', cheapest: 'Cheapest block', running: 'Running now', savedToday: 'Saved today',
    belowAvg: '{0} % below the day average', aboveAvg: '{0} % above the day average', thisMonth: 'this month {0}',
    nothing: 'nothing', until: 'until {0}', free: 'free', taken: 'taken',
    useNow: 'Use now', total: 'Total', elapsed: 'Elapsed', left: 'Left', cost: 'Cost', saving: 'Saving', grid: 'from the grid',
    step1: 'Choose a device', step2: 'Put it in a cheap block', allBlocks: 'All blocks',
    autoplan: 'Automatic', notPlanned: 'Not planned', planned: 'Planned {0}', active: 'Active until {0}',
    tapBlock: 'Tap a block to plan {0}.', planOk: '{0} planned at {1}.', removeOk: 'Removed.',
    fetch: 'Fetch blocks', autoNow: 'Plan automatically', clear: 'Clear plan', confirmClear: 'Remove every block that has not started?',
    lowest: 'lowest {0} ct', highest: 'highest {0} ct', sun: 'sun {0} kWh', score: 'score',
    legend: 'Bars: price per quarter hour. Dashed: the cheap blocks with their score (100 = best moment of that day). Yellow line: expected sun.',
    noPrices: 'No prices yet. Check the price settings, then press Fetch blocks.',
    filterAll: 'All', resOk: 'Done', resFixed: 'Recovered', resFail: 'Failed', resBusy: 'Running', resPlanned: 'Planned', resNone: 'No result',
    stepsTitle: 'Steps', session: 'Measurement', noRuns: 'No runs yet.', early: 'Started earlier than planned', cause: 'Possible cause: {0}',
    mailTitle: 'E-mail a report', what: 'What', devices: 'Devices', allDevices: 'All devices', toWhom: 'To whom', send: 'Send',
    preview: 'Preview', hide: 'Hide preview', sent: 'Sent to {0}.', noMail: 'Set email_service in the configuration to send e-mail.',
    rToday: 'Today so far', rDay: 'A day', rWeek: 'Week', rMonth: 'Month', rYear: 'Year', rDiag: 'Diagnostics', rPlan: 'Plan', rAll: 'All in one',
    day: 'Day', days: 'Days',
    msgTitle: 'Messages on the phone', msgSub: 'Choose who hears what, per device, for as long as you want.',
    person: 'Person', how: 'About', howAll: 'Everything', howImp: 'Done and failed', howFail: 'Only problems',
    howLong: 'How long', today: 'Today', week: '7 days', always: 'Until I stop it', add: 'Add', none: 'None yet.',
    fixed: 'Automatic messages', fixedSub: 'Nobody ticked means nothing is sent.',
    nightly: 'Nightly e-mail', nightlySub: 'Every night: yesterday and the plan of today.',
    overview: 'Week, month and year e-mail', overviewSub: 'On Monday, the 1st of the month and 1 January.',
    earlyN: 'Device started earlier', earlyNSub: 'A phone message when a device starts before its block.',
    remindN: 'Not ready reminder', remindNSub: 'A phone message before the block when a device is not ready.',
    checkTitle: 'Setup check', checkOk: 'The configuration looks fine.', enabled: 'Slotplanner on',
    enabledSub: 'Off: nothing starts and running switches, climate and chargers stop. The plan stays.', cfgFile: 'Change devices and sources in custom_templates/slotplanner_config.jinja, then run script Slotplanner: reload configuration.',
    blockLen: 'Block length {0} h, {1} blocks per day.', prices: 'Prices: {0}', solar: 'Solar: {0}', reload: 'Reload configuration',
    learned: 'Learned', learnedSub: 'After two runs the planner uses the measured peak and run time.',
    wNotReady: 'device not ready', wOff: 'not reachable', wDoor: 'door open', wRemote: 'remote start is off', wProg: 'no program set ({0})', wCable: 'car not connected',
    error: 'Error: {0}', noAnswer: 'No answer from Home Assistant. Check the plan or try again.', ready: 'ready', notReady: 'not ready: {0}', stParked: 'paused',
  },
  nl: {
    plan: 'Plannen', runs: 'Cycli', reports: 'Rapporten', setup: 'Instellen',
    sub: 'Zet elk toestel in een goedkoop blok. De planner start en stopt het, meet het en brengt verslag uit.',
    priceNow: 'Prijs nu', cheapest: 'Goedkoopste blok', running: 'Nu bezig', savedToday: 'Bespaard vandaag',
    belowAvg: '{0} % onder het daggemiddelde', aboveAvg: '{0} % boven het daggemiddelde', thisMonth: 'deze maand {0}',
    nothing: 'niets', until: 'tot {0}', free: 'vrij', taken: 'bezet',
    useNow: 'Verbruik nu', total: 'Totaal', elapsed: 'Verstreken', left: 'Te gaan', cost: 'Kost', saving: 'Besparing', grid: 'van het net',
    step1: 'Kies een toestel', step2: 'Zet het in een goedkoop blok', allBlocks: 'Alle blokken',
    autoplan: 'Automatisch', notPlanned: 'Niet gepland', planned: 'Gepland {0}', active: 'Actief tot {0}',
    tapBlock: 'Tik op een blok om {0} in te plannen.', planOk: '{0} gepland om {1}.', removeOk: 'Verwijderd.',
    fetch: 'Blokken ophalen', autoNow: 'Automatisch plannen', clear: 'Planning leegmaken', confirmClear: 'Elk blok dat nog niet begonnen is weghalen?',
    lowest: 'laagste {0} ct', highest: 'hoogste {0} ct', sun: 'zon {0} kWh', score: 'score',
    legend: 'Staafjes: prijs per kwartier. Gestippeld: de goedkope blokken met hun score (100 = beste moment van die dag). Gele lijn: verwachte zon.',
    noPrices: 'Nog geen prijzen. Kijk de prijsinstellingen na en druk op Blokken ophalen.',
    filterAll: 'Alle', resOk: 'Gelukt', resFixed: 'Hersteld', resFail: 'Mislukt', resBusy: 'Bezig', resPlanned: 'Gepland', resNone: 'Geen resultaat',
    stepsTitle: 'Stappen', session: 'Meting', noRuns: 'Nog geen cycli.', early: 'Vroeger gestart dan gepland', cause: 'Mogelijke oorzaak: {0}',
    mailTitle: 'Verslag mailen', what: 'Wat', devices: 'Toestellen', allDevices: 'Alle toestellen', toWhom: 'Naar wie', send: 'Versturen',
    preview: 'Voorbeeld', hide: 'Voorbeeld verbergen', sent: 'Verstuurd naar {0}.', noMail: 'Vul email_service in de configuratie in om te mailen.',
    rToday: 'Vandaag tot nu', rDay: 'Een dag', rWeek: 'Week', rMonth: 'Maand', rYear: 'Jaar', rDiag: 'Foutanalyse', rPlan: 'Planning', rAll: 'Alles in één',
    day: 'Dag', days: 'Dagen',
    msgTitle: 'Berichten op de telefoon', msgSub: 'Kies wie wat hoort, per toestel, zo lang als je wil.',
    person: 'Persoon', how: 'Waarover', howAll: 'Alles', howImp: 'Gelukt en mislukt', howFail: 'Enkel problemen',
    howLong: 'Hoe lang', today: 'Vandaag', week: '7 dagen', always: 'Tot ik het uitzet', add: 'Toevoegen', none: 'Nog geen.',
    fixed: 'Vaste berichten', fixedSub: 'Niemand aangevinkt betekent niets.',
    nightly: 'Nachtverslag', nightlySub: 'Elke nacht: gisteren en de planning van vandaag.',
    overview: 'Week-, maand- en jaarmail', overviewSub: 'Op maandag, de 1e van de maand en 1 januari.',
    earlyN: 'Toestel vroeger gestart', earlyNSub: 'Een bericht als een toestel start voor zijn blok.',
    remindN: 'Herinnering niet klaar', remindNSub: 'Een bericht voor het blok als een toestel niet klaar staat.',
    checkTitle: 'Controle van de instellingen', checkOk: 'De configuratie ziet er goed uit.', enabled: 'Slotplanner aan',
    enabledSub: 'Uit: er start niets en lopende schakelaars, airco\'s en laadpalen stoppen. De planning blijft.', cfgFile: 'Toestellen en bronnen pas je aan in custom_templates/slotplanner_config.jinja. Draai daarna script Slotplanner: reload configuration.',
    blockLen: 'Blokken van {0} u, {1} per dag.', prices: 'Prijzen: {0}', solar: 'Zon: {0}', reload: 'Configuratie herladen',
    learned: 'Geleerd', learnedSub: 'Na twee keer gebruikt de planner het gemeten piekvermogen en de looptijd.',
    wNotReady: 'toestel niet klaar', wOff: 'niet bereikbaar', wDoor: 'deur open', wRemote: 'starten op afstand staat uit', wProg: 'geen programma gekozen ({0})', wCable: 'auto niet aangesloten',
    error: 'Fout: {0}', noAnswer: 'Geen antwoord van Home Assistant. Kijk de planning na of probeer opnieuw.', ready: 'staat klaar', notReady: 'niet klaar: {0}', stParked: 'gepauzeerd',
  },
};

const fmt = (s, ...a) => String(s).replace(/\{(\d)\}/g, (_, i) => (a[i] !== undefined ? a[i] : ''));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

class SlotplannerCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    this._tab = this._tab || this._config.tab || 'plan';
    this._sel = '';
    this._msg = '';
    this._open = {};
    this._filter = { d: '', r: '' };
    this._mail = { kind: 'today', day: '', days: 7, devices: [], people: null };
    this._sub = { person: '', devices: [], level: 'important', until: 'today' };
  }
  static getStubConfig() { return {}; }
  getCardSize() { return 12; }

  set hass(h) {
    this._h = h;
    if (!this.shadowRoot) { this.attachShadow({ mode: 'open' }); this._timer = setInterval(() => { this._sig = ''; this._render(); }, 30000); }
    const ids = ['config', 'state', 'slots', 'prices', 'history', 'stats'].map((k) => `sensor.slotplanner_${k}`);
    const devs = (this._cfg().devices || []).flatMap((d) => [d.status, d.switch, d.power_sensor, d.soc, d.cable, d.door, d.remote, d.ready_entity].filter(Boolean));
    const sig = ids.concat(devs).map((e) => (h.states[e] ? h.states[e].last_updated : '')).join('|') + this._tab;
    if (sig === this._sig) return;
    this._sig = sig;
    this._render();
  }
  disconnectedCallback() { clearInterval(this._timer); this._timer = null; this.shadowRoot && (this.shadowRoot.innerHTML = ''); }
  connectedCallback() { if (this.shadowRoot && !this._timer) { this._timer = setInterval(() => { this._sig = ''; this._render(); }, 30000); this._sig = ''; this._render(); } }

  // ---------------------------------------------------------------- data
  _a(e, a) { const s = this._h && this._h.states[e]; return s ? s.attributes[a] : undefined; }
  _cfg() { return (this._h && this._a('sensor.slotplanner_config', 'config')) || { general: {}, devices: [], people: [], notifications: {} }; }
  _t(k, ...a) { const l = (this._cfg().general || {}).language || 'en'; return fmt((I18N[l] || I18N.en)[k] || I18N.en[k] || k, ...a); }
  _B() { return ((this._cfg().general || {}).block_hours || 3) * 3600; }
  _plans() { return this._a('sensor.slotplanner_state', 'plans') || []; }
  _settings() {
    const s = this._a('sensor.slotplanner_state', 'settings') || {};
    const c = this._cfg(); const first = (c.people || []).slice(0, 1).map((p) => p.id);
    const ap = {}; (c.devices || []).forEach((d) => { ap[d.id] = s.autoplan && d.id in s.autoplan ? s.autoplan[d.id] : d.autoplan !== 'off'; });
    return { enabled: s.enabled !== false, autoplan: ap, subs: s.subs || [], nightly: s.nightly || first, overview: s.overview || first, early: s.early || first, remind: s.remind || (c.people || []).map((p) => p.id) };
  }
  _prices() { return this._a('sensor.slotplanner_prices', 'prices') || []; }
  _slots() { return this._a('sensor.slotplanner_slots', 'slots') || []; }
  _dev(id) { return (this._cfg().devices || []).find((d) => d.id === id) || { id, name: id, icon: 'mdi:help' }; }
  _st(e) { const s = this._h.states[e]; return s ? s.state : 'unavailable'; }
  _num(v, d = 1) { const l = (this._cfg().general || {}).language; const s = Number(v || 0).toFixed(d); return l === 'nl' ? s.replace('.', ',') : s; }
  _cur(v) { return `${(this._cfg().general || {}).currency || '€'} ${this._num(v, 2)}`; }
  _hm(ts) { return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); }
  _dhm(ts) { const d = new Date(ts * 1000); return `${d.toLocaleDateString([], { weekday: 'short' })} ${this._hm(ts)}`; }
  _win(p) { const s = p.rs > 0 && p.rs < p.s ? p.rs : p.s; let e = s + this._B(); const n = Date.now() / 1000; if (p.st === 'active' && e <= n && this._plans().some((x) => x.id === p.id)) e = n + 900; return [s, e]; }
  _check(d) {
    const x = this._dev(d); const st = (e) => this._st(e); const why = []; let run = false;
    if (x.type === 'appliance') {
      const s = st(x.status); run = (x.running_states || []).includes(s) || (x.pause_states || []).includes(s);
      if (['unavailable', 'unknown'].includes(s)) why.push(this._t('wOff'));
      if (x.door && st(x.door) === 'on') why.push(this._t('wDoor'));
      if (x.remote && st(x.remote) !== 'on') why.push(this._t('wRemote'));
      if (!run && !(x.ready_states || []).includes(s) && !['unavailable', 'unknown'].includes(s)) why.push(this._t('wProg', s));
    } else if (x.switch) {
      run = st(x.switch) === 'on'; if (st(x.switch) === 'unavailable') why.push(this._t('wOff'));
      if (x.cable && st(x.cable) === 'off') why.push(this._t('wCable'));
    } else if (x.type === 'climate') {
      run = (x.climates || []).some((c) => !['off', 'unavailable', 'unknown'].includes(st(c)));
      if ((x.climates || []).every((c) => st(c) === 'unavailable')) why.push(this._t('wOff'));
    } else if (x.type === 'ev' && x.cable && st(x.cable) === 'off') why.push(this._t('wCable'));
    if (x.type === 'custom' && x.ready_entity && st(x.ready_entity) !== 'on') why.push(this._t('wNotReady'));
    return { ready: !why.length, running: run, why: why.join(', ') };
  }
  _res(p) {
    if (p.st === 'active') return this._plans().some((x) => x.id === p.id) ? 'busy' : 'ok';
    if (p.st === 'planned') return p.s > Date.now() / 1000 ? 'planned' : 'none';
    if (p.st === 'failed' || p.st === 'stopped') return 'fail';
    if (p.st === 'done') return (p.steps || []).some((z) => z.r === 'fail') ? 'fixed' : 'ok';
    return 'none';
  }
  async _call(script, data, okMsg) {
    try { await this._h.callService('script', script, data); this._msg = okMsg || ''; }
    catch (e) { this._msg = this._t('error', (e && (e.message || e.error)) || e); }
    this._sig = ''; this._render();
  }
  // Plans a device and waits for the result the script stores in settings.last.
  async _planReq(d, s) {
    const req = `r${Date.now()}${Math.floor(Math.random() * 1000)}`;
    this._msg = '…'; this._sig = ''; this._render();
    let err = '';
    try { await this._h.callService('script', 'slotplanner_plan', { device: d, start: s, req }); } catch (e) { err = (e && (e.message || e.error)) || String(e); }
    let got = false;
    for (let i = 0; i < 40; i++) {
      const last = (this._a('sensor.slotplanner_state', 'settings') || {}).last;
      if (last && String(last.req) === req) { got = true; this._msg = last.ok ? this._t('planOk', this._dev(d).name, this._dhm(s)) : last.msg; if (last.ok) this._sel = ''; break; }
      await new Promise((r) => setTimeout(r, 250));
    }
    if (!got) this._msg = err ? this._t('error', err) : this._t('noAnswer');
    this._sig = ''; this._render();
  }
  _saveSettings(f) { return this._call('slotplanner_settings', { settings: f }); }
  // Small changes go to the writer as operations, so two quick clicks never overwrite each other.
  _ops(ops) { return this._call('slotplanner_write', { ops }); }

  // ---------------------------------------------------------------- render
  _render() {
    if (!this._h || !this.shadowRoot) return;
    const c = this._cfg();
    const tabs = ['plan', 'runs', 'reports', 'setup'];
    const errs = this._a('sensor.slotplanner_config', 'errors') || [];
    let body = '';
    if (!this._h.states['sensor.slotplanner_config']) body = `<div class="empty">sensor.slotplanner_config not found. Is packages/slotplanner.yaml loaded?</div>`;
    else if (this._tab === 'runs') body = this._runsTab();
    else if (this._tab === 'reports') body = this._reportsTab();
    else if (this._tab === 'setup') body = this._setupTab();
    else body = this._planTab();
    this.shadowRoot.innerHTML = `<style>${CSS}</style><ha-card><div class="wrap">
      <div class="ey">Slotplanner</div><h2>${esc(this._config.title || 'Slotplanner')}</h2><div class="sub">${this._t('sub')}</div>
      <div class="tabs">${tabs.map((k) => `<button class="tab ${this._tab === k ? 'on' : ''}" data-tab="${k}">${this._t(k)}${k === 'setup' && errs.length ? ' <span class="dot"></span>' : ''}</button>`).join('')}</div>
      ${this._msg ? `<div class="msg">${esc(this._msg)}</div>` : ''}
      ${body}</div></ha-card>`;
    this._bind();
  }

  _planTab() {
    const c = this._cfg(); const now = Date.now() / 1000; const B = this._B();
    const pr = this._prices(); const slots = this._slots(); const plans = this._plans();
    const cur = pr.find((x) => x[0] <= now && now < x[0] + 900);
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); const t0 = d0.getTime() / 1000;
    const d1 = new Date(d0); d1.setDate(d1.getDate() + 1); const t1 = d1.getTime() / 1000;
    const today = pr.filter((x) => x[0] >= t0 && x[0] < t1).map((x) => x[1]);
    const avg = today.length ? today.reduce((a, b) => a + b, 0) / today.length : 0;
    const busyStarts = plans.filter((p) => ['planned', 'active'].includes(p.st)).map((p) => this._win(p)[0]);
    const freeSlots = slots.filter((s) => s.e > now && !plans.some((p) => ['planned', 'active'].includes(p.st) && p.s === s.s));
    const best = freeSlots.slice().sort((a, b) => a.p - b.p)[0];
    const act = plans.filter((p) => p.st === 'active');
    const stats = this._h.states['sensor.slotplanner_stats'];
    const mk = `${d0.getFullYear()}-${String(d0.getMonth() + 1).padStart(2, '0')}`;
    const month = stats && stats.attributes.month ? (stats.attributes.month[mk] || {}).bes || 0 : 0;
    const hist = this._a('sensor.slotplanner_history', 'runs') || [];
    const savedToday = plans.concat(hist).filter((p, i, arr) => p.s >= t0 && arr.findIndex((q) => q.id === p.id) === i).reduce((a, p) => a + ((p.m || {}).bes || 0), 0);
    const rel = cur && avg ? Math.round((avg - cur[1]) / Math.abs(avg) * 100) : 0;
    let h = `<div class="kpis">
      <div class="k"><div class="kl">${this._t('priceNow')}</div><div class="kv ${rel >= 0 ? 'good' : 'bad'}">${cur ? this._num(cur[1] * 100, 1) + ' ct' : '-'}</div><div class="ks">${cur && avg ? (rel >= 0 ? this._t('belowAvg', rel) : this._t('aboveAvg', -rel)) : ''}</div></div>
      <div class="k"><div class="kl">${this._t('cheapest')}</div><div class="kv">${best ? this._num(best.p, 1) + ' ct' : '-'}</div><div class="ks">${best ? this._dhm(best.s) : ''}</div></div>
      <div class="k"><div class="kl">${this._t('running')}</div><div class="kv sm">${act.length ? act.map((p) => esc(this._dev(p.d).name)).join(', ') : this._t('nothing')}</div><div class="ks">${act.length ? this._t('until', this._hm(this._win(act[0])[1])) : ''}</div></div>
      <div class="k"><div class="kl">${this._t('savedToday')}</div><div class="kv ${savedToday >= 0 ? 'good' : 'bad'}">${this._cur(savedToday)}</div><div class="ks">${this._t('thisMonth', this._cur(month))}</div></div>
    </div>`;
    h += act.map((p) => this._activeBox(p)).join('');
    // devices
    h += `<div class="sec"><span class="n">1</span>${this._t('step1')}</div><div class="devs">`;
    const set = this._settings();
    for (const x of c.devices || []) {
      const mine = plans.filter((p) => p.d === x.id && ['planned', 'active'].includes(p.st)).sort((a, b) => a.s - b.s);
      const k = this._check(x.id);
      const a = mine.find((p) => p.st === 'active');
      const line = a ? this._t('active', this._hm(this._win(a)[1])) : mine.length ? this._t('planned', mine.map((p) => this._dhm(p.s)).join(', ')) : this._t('notPlanned');
      h += `<div class="dev ${this._sel === x.id ? 'sel' : ''} ${a ? 'act' : ''}" data-dev="${esc(x.id)}" role="button" tabindex="0" aria-pressed="${this._sel === x.id}">
        <div class="dt"><ha-icon icon="${esc(x.icon)}"></ha-icon><div><b>${esc(x.name)}</b><small>${esc(line)}</small>
        <small class="${k.ready ? 'ok' : 'warn'}">${k.ready ? this._t('ready') : this._t('notReady', esc(k.why))}</small></div></div>
        ${x.autoplan !== 'off' ? `<label class="ap" data-stop="1"><input type="checkbox" data-ap="${esc(x.id)}" ${set.autoplan[x.id] ? 'checked' : ''}>${this._t('autoplan')}</label>` : ''}
        ${mine.map((p) => `<span class="pl">${this._dhm(p.s)} <button class="x" data-del="${esc(p.id)}" title="remove">✕</button></span>`).join('')}
      </div>`;
    }
    h += `</div><div class="sec"><span class="n">2</span>${this._t('step2')}</div>`;
    if (this._sel) h += `<div class="hint">${this._t('tapBlock', esc(this._dev(this._sel).name))}</div>`;
    h += pr.length ? this._chart(pr, slots, plans) : `<div class="empty">${this._t('noPrices')}</div>`;
    h += `<div class="sec small">${this._t('allBlocks')}</div><div class="blocks">`;
    for (const s of slots.filter((s) => s.e > now)) {
      const inn = plans.filter((p) => ['planned', 'active'].includes(p.st) && p.s === s.s);
      const sc = s.sc >= 0 ? `<span class="sc ${s.sc >= 70 ? 'g' : s.sc >= 40 ? 'm' : 'b'}">${s.sc}</span>` : '';
      h += `<button class="blk ${inn.length ? 'full' : ''}" data-slot="${s.s}">${sc}<b>${this._dhm(s.s)} → ${this._hm(s.e)}</b>
        <small>${this._num(s.p, 1)} ct/kWh · ${this._t('sun', this._num(s.z * B / 3600, 1))}</small>
        <small>${inn.length ? inn.map((p) => esc(this._dev(p.d).name)).join(', ') : this._t('free')}</small></button>`;
    }
    h += `</div><div class="acts"><button class="btn" data-act="fetch"><ha-icon icon="mdi:refresh"></ha-icon>${this._t('fetch')}</button>
      <button class="btn pri" data-act="auto"><ha-icon icon="mdi:calendar-star"></ha-icon>${this._t('autoNow')}</button>
      <button class="btn" data-act="clear"><ha-icon icon="mdi:calendar-remove"></ha-icon>${this._t('clear')}</button></div>
      <div class="legend">${this._t('legend')}</div>`;
    return h;
  }

  _activeBox(p) {
    const x = this._dev(p.d); const m = p.m || {}; const [s, e] = this._win(p); const now = Date.now() / 1000;
    const w = x.power_sensor ? Number(this._st(x.power_sensor)) || 0 : 0;
    const el = Math.max(0, now - (p.rs || s)); const left = Math.max(0, e - now);
    const hm = (sec) => `${Math.floor(sec / 3600)} h ${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}`;
    return `<div class="actbox"><div class="ah"><ha-icon icon="${esc(x.icon)}"></ha-icon><b>${esc(x.name)}</b><span>${this._dhm(s)} → ${this._hm(e)}${m.kwh ? ` · ${Math.round(((m.net || 0) / m.kwh) * 100)} % ${this._t('grid')}` : ''}</span>${(p.f || {}).paused ? `<span class="badge m">${this._t('stParked')}</span>` : `<span class="badge busy">${this._t('resBusy')}</span>`}</div>
      <div class="ag"><div><small>${this._t('useNow')}</small><b>${Math.round(w)} W</b></div><div><small>${this._t('total')}</small><b>${this._num(m.kwh, 2)} kWh</b></div><div><small>${this._t('elapsed')}</small><b>${hm(el)}</b></div>
      <div><small>${this._t('left')}</small><b>${hm(left)}</b></div><div><small>${this._t('cost')}</small><b>${this._cur(m.eur)}</b></div><div><small>${this._t('saving')}</small><b class="${(m.bes || 0) >= 0 ? 'good' : 'bad'}">${this._cur(m.bes)}</b></div></div></div>`;
  }

  _chart(pr, slots, plans) {
    const now = Date.now() / 1000; const d0 = new Date(); d0.setHours(0, 0, 0, 0); const t0 = d0.getTime() / 1000;
    const days = this._chartDay || 0;
    const da = new Date(d0); da.setDate(da.getDate() + days); const db = new Date(da); db.setDate(db.getDate() + 1);
    const a = da.getTime() / 1000; const b = db.getTime() / 1000; const NQ = Math.round((b - a) / 900);
    const q = pr.filter((x) => x[0] >= a && x[0] < b); if (!q.length) {
      if (days) { this._chartDay = 0; return this._chart(pr, slots, plans); }
      return `<div class="chh"><button class="mini" data-cday="1">▶</button></div><div class="empty">${this._t('noPrices')}</div>`;
    }
    const vals = q.map((x) => x[1]); const mn = Math.min(...vals); const mx = Math.max(...vals); const sp = Math.max(mx - mn, 0.001);
    const W = 960; const H = 200; const bw = W / NQ; const y = (v) => H - 14 - ((v - mn) / sp) * (H - 50);
    const col = (v) => { const r = (v - mn) / sp; return r < 0.33 ? '#84cc16' : r < 0.66 ? '#eab308' : r < 0.85 ? '#f97316' : '#ef4444'; };
    let svg = `<svg viewBox="0 0 ${W} ${H + 18}" class="ch" preserveAspectRatio="none">`;
    q.forEach((x) => { const i = Math.round((x[0] - a) / 900); svg += `<rect x="${i * bw + 0.5}" y="${y(x[1])}" width="${bw - 1}" height="${H - 14 - y(x[1]) + 1}" fill="${col(x[1])}" opacity="${x[0] + 900 < now ? 0.35 : 0.9}"/>`; });
    for (const s of slots.filter((s) => s.e > a && s.s < b)) {
      const i0 = Math.max(0, (s.s - a) / 900); const i1 = Math.min(NQ, (s.e - a) / 900);
      const full = plans.some((p) => ['planned', 'active'].includes(p.st) && p.s === s.s);
      svg += `<rect class="slot" data-slot="${s.s}" x="${i0 * bw}" y="4" width="${(i1 - i0) * bw}" height="${H - 18}" fill="${full ? 'rgba(99,102,241,.18)' : 'rgba(255,255,255,.04)'}" stroke="#eab308" stroke-dasharray="5 4" rx="6"/>`;
      if (s.sc >= 0) svg += `<text x="${((i0 + i1) / 2) * bw}" y="20" text-anchor="middle" class="tsc ${s.sc >= 70 ? 'g' : s.sc >= 40 ? 'm' : 'b'}">${s.sc}</text>`;
    }
    for (const p of plans.filter((p) => ['planned', 'active'].includes(p.st) && !slots.some((s) => s.s === p.s))) {
      const [ps, pe] = this._win(p); if (pe <= a || ps >= b) continue;
      const i0 = Math.max(0, (ps - a) / 900); const i1 = Math.min(NQ, (pe - a) / 900);
      svg += `<rect x="${i0 * bw}" y="4" width="${(i1 - i0) * bw}" height="${H - 18}" fill="rgba(99,102,241,.18)" stroke="#818cf8" stroke-dasharray="2 3" rx="6"/>`;
    }
    const sun = (this._a('sensor.slotplanner_slots', 'solar') || []).filter((x) => x[0] >= a && x[0] < b);
    if (sun.length > 1) {
      const zmax = Math.max(2, ...sun.map((x) => x[1]));
      svg += `<polyline fill="none" stroke="#facc15" stroke-width="2.5" opacity=".9" points="${sun.map((x) => `${((x[0] - a) / 900 + 0.5) * bw},${H - 14 - (x[1] / zmax) * (H - 60)}`).join(' ')}"/>`;
    }
    if (now >= a && now < b) { const i = (now - a) / 900; svg += `<line x1="${i * bw}" x2="${i * bw}" y1="0" y2="${H - 14}" stroke="#fff" stroke-width="2"/>`; }
    for (let i = 0; i < NQ; i++) { const dt = new Date((a + i * 900) * 1000); if (dt.getMinutes() === 0 && dt.getHours() % 4 === 0) svg += `<text x="${i * bw + 2}" y="${H + 12}" class="tx">${String(dt.getHours()).padStart(2, '0')}h</text>`; }
    svg += '</svg>';
    const tm = new Date(d0); tm.setDate(tm.getDate() + 1); const hasTomorrow = pr.some((x) => x[0] >= tm.getTime() / 1000);
    return `<div class="chh"><b>${new Date(a * 1000).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'numeric' })}</b>
      <span>${this._t('lowest', this._num(mn * 100, 1))} · ${this._t('highest', this._num(mx * 100, 1))}</span>
      ${hasTomorrow ? `<button class="mini" data-cday="${days ? 0 : 1}">${days ? '◀' : '▶'}</button>` : ''}</div><div class="chw">${svg}</div>`;
  }

  _runsTab() {
    const c = this._cfg(); const live = this._plans(); const hist = this._a('sensor.slotplanner_history', 'runs') || [];
    const ids = new Set(); let all = live.concat(hist).filter((p) => (ids.has(p.id) ? false : ids.add(p.id))).sort((a, b) => b.s - a.s);
    const f = this._filter;
    const list = all.filter((p) => (!f.d || p.d === f.d) && (!f.r || this._res(p) === f.r));
    const cnt = (r) => all.filter((p) => this._res(p) === r).length;
    let h = `<div class="kpis"><div class="k"><div class="kl">${this._t('runs')}</div><div class="kv">${all.length}</div></div>
      <div class="k"><div class="kl">${this._t('resOk')}</div><div class="kv good">${cnt('ok')}</div></div>
      <div class="k"><div class="kl">${this._t('resFixed')}</div><div class="kv m">${cnt('fixed')}</div></div>
      <div class="k"><div class="kl">${this._t('resFail')}</div><div class="kv bad">${cnt('fail')}</div></div></div>
      <div class="filt"><select data-fd="1"><option value="">${this._t('allDevices')}</option>${(c.devices || []).map((d) => `<option value="${esc(d.id)}" ${f.d === d.id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select>
      ${['', 'ok', 'fixed', 'fail', 'busy', 'planned'].map((r) => `<button class="chip ${f.r === r ? 'on' : ''}" data-fr="${r}">${r ? this._t('res' + r[0].toUpperCase() + r.slice(1)) : this._t('filterAll')}</button>`).join('')}</div>`;
    if (!list.length) return h + `<div class="empty">${this._t('noRuns')}</div>`;
    for (const p of list.slice(0, 60)) {
      const x = this._dev(p.d); const r = this._res(p); const m = p.m || {}; const [s, e] = this._win(p); const open = this._open[p.id];
      h += `<div class="run r-${r}"><div class="rh" data-open="${esc(p.id)}" role="button" tabindex="0" aria-expanded="${!!open}"><ha-icon icon="${esc(x.icon)}"></ha-icon><div><b>${esc(x.name)}</b><small>${this._dhm(s)} → ${this._hm(e)}${m.kwh ? ' · ' + this._num(m.kwh, 2) + ' kWh · ' + this._cur(m.eur) : ''}</small></div><span class="badge ${r}">${this._t('res' + r[0].toUpperCase() + r.slice(1))}</span><span class="chev">${open ? '▴' : '▾'}</span></div>`;
      if (open) {
        if ((p.f || {}).early) h += `<div class="early">⏩ ${this._t('early')}</div>`;
        if (m.kwh !== undefined) h += `<div class="ses"><div><small>${this._t('total')}</small><b>${this._num(m.kwh, 2)} kWh</b></div><div><small>${this._t('grid')}</small><b>${this._num(m.net, 2)} kWh</b></div><div><small>${this._t('cost')}</small><b>${this._cur(m.eur)}</b></div><div><small>${this._t('saving')}</small><b class="${(m.bes || 0) >= 0 ? 'good' : 'bad'}">${this._cur(m.bes)}</b></div><div><small>min</small><b>${m.min || 0}</b></div><div><small>peak</small><b>${this._num((m.pk || 0) / 1000, 2)} kW</b></div></div>`;
        h += `<div class="steps">${(p.steps || []).map((z) => `<div class="st"><span class="t">${this._dhm(z.t)}</span><span class="d ${z.r}"></span><span>${esc(z.w)}${z.o ? `<br><em>${this._t('cause', esc(z.o))}</em>` : ''}</span></div>`).join('')}</div>`;
      }
      h += '</div>';
    }
    return h;
  }

  _reportsTab() {
    const c = this._cfg(); const set = this._settings(); const people = c.people || []; const M = this._mail;
    if (M.people === null) M.people = people.slice(0, 1).map((p) => p.id);
    if (!this._sub.person && people.length) this._sub.person = people[0].id;
    const kinds = [['today', 'rToday'], ['day', 'rDay'], ['week', 'rWeek'], ['month', 'rMonth'], ['year', 'rYear'], ['diagnostics', 'rDiag'], ['plan', 'rPlan'], ['all', 'rAll']];
    const devChips = (sel, attr) => `<button class="chip ${!sel.length ? 'on' : ''}" data-${attr}="">${this._t('allDevices')}</button>` + (c.devices || []).map((d) => `<button class="chip ${sel.includes(d.id) ? 'on' : ''}" data-${attr}="${esc(d.id)}">${esc(d.name)}</button>`).join('');
    let h = `<div class="box"><div class="bt">${this._t('mailTitle')}</div>
      ${!(c.notifications || {}).email_service ? `<div class="warnbox">${this._t('noMail')}</div>` : ''}
      <div class="lab">${this._t('what')}</div><div class="chips">${kinds.map(([k, l]) => `<button class="chip ${M.kind === k ? 'on' : ''}" data-mk="${k}">${this._t(l)}</button>`).join('')}</div>
      ${M.kind === 'day' ? `<div class="lab">${this._t('day')}</div><input type="date" data-mday="1" value="${esc(M.day || dayKey(new Date(Date.now() - 86400000)))}">` : ''}
      ${M.kind === 'diagnostics' ? `<div class="lab">${this._t('days')}</div><div class="chips">${[1, 3, 7, 14, 30].map((n) => `<button class="chip ${M.days === n ? 'on' : ''}" data-mdays="${n}">${n}</button>`).join('')}</div>` : ''}
      <div class="lab">${this._t('devices')}</div><div class="chips">${devChips(M.devices, 'mdev')}</div>
      <div class="lab">${this._t('toWhom')}</div><div class="chips">${people.map((p) => `<label class="tg"><input type="checkbox" data-mp="${esc(p.id)}" ${M.people.includes(p.id) ? 'checked' : ''}>${esc(p.name)}</label>`).join('')}</div>
      <div class="acts"><button class="btn pri" data-act="mail" ${!M.people.length ? 'disabled' : ''}><ha-icon icon="mdi:send"></ha-icon>${this._t('send')}</button>
      <button class="btn" data-act="preview"><ha-icon icon="mdi:eye"></ha-icon>${this._preview ? this._t('hide') : this._t('preview')}</button></div>
      ${this._preview ? `<iframe class="pv" sandbox="" srcdoc="${esc(this._previewHtml || '…')}"></iframe>` : ''}</div>`;
    // subscriptions
    const S = this._sub;
    const lvl = { all: 'howAll', important: 'howImp', fail: 'howFail' };
    h += `<div class="box"><div class="bt">${this._t('msgTitle')}</div><div class="bs">${this._t('msgSub')}</div>
      <div class="subs">${set.subs.length ? set.subs.map((a) => `<div class="subi"><b>${esc((people.find((p) => p.id === a.person) || { name: a.person }).name)}</b><span>${this._t(lvl[a.level] || 'howAll')} · ${a.devices && a.devices.length ? a.devices.map((d) => esc(this._dev(d).name)).join(', ') : this._t('allDevices')} · ${a.until || '∞'}</span><button class="x" data-subdel="${esc(a.sid || '')}" aria-label="remove">✕</button></div>`).join('') : `<div class="empty sm">${this._t('none')}</div>`}</div>
      <div class="lab">${this._t('person')}</div><div class="chips">${people.map((p) => `<button class="chip ${S.person === p.id ? 'on' : ''}" data-sp="${esc(p.id)}">${esc(p.name)}</button>`).join('')}</div>
      <div class="lab">${this._t('how')}</div><div class="chips">${Object.entries(lvl).map(([k, l]) => `<button class="chip ${S.level === k ? 'on' : ''}" data-sl="${k}">${this._t(l)}</button>`).join('')}</div>
      <div class="lab">${this._t('howLong')}</div><div class="chips">${[['today', 'today'], ['week', 'week'], ['always', 'always']].map(([k, l]) => `<button class="chip ${S.until === k ? 'on' : ''}" data-su="${k}">${this._t(l)}</button>`).join('')}</div>
      <div class="lab">${this._t('devices')}</div><div class="chips">${devChips(S.devices, 'sdev')}</div>
      <div class="acts"><button class="btn pri" data-act="subadd"><ha-icon icon="mdi:bell-plus"></ha-icon>${this._t('add')}</button></div></div>`;
    // fixed
    const row = (key, t, s) => `<div class="fx"><b>${this._t(t)}</b><small>${this._t(s)}</small><div class="chips">${people.map((p) => `<label class="tg"><input type="checkbox" data-fx="${key}" data-p="${esc(p.id)}" ${set[key].includes(p.id) ? 'checked' : ''}>${esc(p.name)}</label>`).join('')}</div></div>`;
    h += `<div class="box"><div class="bt">${this._t('fixed')}</div><div class="bs">${this._t('fixedSub')}</div><div class="fxg">
      ${row('nightly', 'nightly', 'nightlySub')}${row('overview', 'overview', 'overviewSub')}${row('early', 'earlyN', 'earlyNSub')}${row('remind', 'remindN', 'remindNSub')}</div></div>`;
    return h;
  }

  _setupTab() {
    const c = this._cfg(); const errs = this._a('sensor.slotplanner_config', 'errors') || []; const set = this._settings();
    const learn = (this._a('sensor.slotplanner_stats', 'learn')) || {};
    const g = c.general || {};
    let h = `<div class="box"><div class="bt">${this._t('checkTitle')}</div>${errs.length ? `<ul class="errs">${errs.map((e) => `<li>${esc(e)}</li>`).join('')}</ul>` : `<div class="okbox">✓ ${this._t('checkOk')}</div>`}
      <div class="bs">${this._t('cfgFile')}</div>
      <div class="bs">${this._t('blockLen', g.block_hours, g.blocks_per_day)} ${this._t('prices', esc((c.prices || {}).source))} · ${this._t('solar', esc((c.solar || {}).source))} · v${esc(this._a('sensor.slotplanner_config', 'version') || '')}/${SP_VERSION}</div>
      <div class="acts"><button class="btn" data-act="reload"><ha-icon icon="mdi:reload"></ha-icon>${this._t('reload')}</button></div></div>
      <div class="box"><label class="tg big"><input type="checkbox" data-en="1" ${set.enabled ? 'checked' : ''}>${this._t('enabled')}</label><div class="bs">${this._t('enabledSub')}</div></div>
      <div class="box"><div class="bt">${this._t('learned')}</div><div class="bs">${this._t('learnedSub')}</div><table class="lt">
      ${(c.devices || []).map((d) => { const pk = learn[d.id + '_pk'] || []; const mi = learn[d.id + '_min'] || []; const kw = learn[d.id + '_kwh'] || [];
        const av = (l) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0);
        return `<tr><td>${esc(d.name)}</td><td>${pk.length >= 2 ? this._num(Math.max(...pk) / 1000, 2) : this._num(d.power_kw, 1) + '*'} kW</td><td>${mi.length >= 2 ? Math.round(av(mi)) + ' min' : '-'}</td><td>${kw.length ? this._num(av(kw), 2) + ' kWh' : '-'}</td></tr>`; }).join('')}</table></div>`;
    return h;
  }

  // ---------------------------------------------------------------- events
  _bind() {
    const r = this.shadowRoot; const q = (s) => r.querySelectorAll(s);
    q('[data-tab]').forEach((b) => (b.onclick = () => { this._tab = b.dataset.tab; this._msg = ''; this._sig = ''; this._render(); }));
    q('[data-dev]').forEach((b) => (b.onclick = (ev) => { if (ev.target.closest('[data-stop],[data-del]')) return; this._sel = this._sel === b.dataset.dev ? '' : b.dataset.dev; this._msg = ''; this._sig = ''; this._render(); }));
    q('[data-ap]').forEach((i) => (i.onchange = () => { const ap = {}; ap[i.dataset.ap] = i.checked; this._saveSettings({ autoplan: ap }); }));
    q('[role="button"][tabindex="0"]').forEach((el) => (el.onkeydown = (ev) => { if ((ev.key === 'Enter' || ev.key === ' ') && ev.target === el) { ev.preventDefault(); el.click(); } }));
    q('[data-del]').forEach((b) => (b.onclick = (ev) => { ev.stopPropagation(); this._call('slotplanner_unplan', { plan_id: b.dataset.del }, this._t('removeOk')); }));
    q('[data-slot]').forEach((b) => (b.onclick = () => {
      if (!this._sel) { this._msg = this._t('step1'); this._sig = ''; this._render(); return; }
      const s = Number(b.dataset.slot); const d = this._sel;
      this._planReq(d, s);
    }));
    q('[data-cday]').forEach((b) => (b.onclick = () => { this._chartDay = Number(b.dataset.cday); this._sig = ''; this._render(); }));
    q('[data-act]').forEach((b) => (b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'fetch') this._call('slotplanner_refresh', {});
      if (a === 'auto') this._call('slotplanner_autoplan', {});
      if (a === 'clear' && confirm(this._t('confirmClear'))) this._call('slotplanner_clear', {});
      if (a === 'reload') this._call('slotplanner_reload', {});
      if (a === 'mail') { const M = this._mail; const people = this._cfg().people || []; this._call('slotplanner_mail', { report: M.kind, day: M.day || dayKey(new Date(Date.now() - 86400000)), days: M.days, devices: M.devices, people: M.people }, this._t('sent', M.people.map((p) => (people.find((x) => x.id === p) || { name: p }).name).join(', '))); }
      if (a === 'preview') { this._preview = !this._preview; if (this._preview) this._loadPreview(); this._sig = ''; this._render(); }
      if (a === 'subadd') {
        const S = this._sub; const d = new Date(); const until = S.until === 'always' ? '' : S.until === 'week' ? dayKey(new Date(Date.now() + 6 * 86400000)) : dayKey(d);
        this._ops([{ op: 'sub_add', sub: { person: S.person, devices: S.devices, level: S.level, until } }]);
      }
    }));
    q('[data-mk]').forEach((b) => (b.onclick = () => { this._mail.kind = b.dataset.mk; this._previewHtml = ''; if (this._preview) this._loadPreview(); this._sig = ''; this._render(); }));
    q('[data-mday]').forEach((i) => (i.onchange = () => { this._mail.day = i.value; if (this._preview) this._loadPreview(); }));
    q('[data-mdays]').forEach((b) => (b.onclick = () => { this._mail.days = Number(b.dataset.mdays); if (this._preview) this._loadPreview(); this._sig = ''; this._render(); }));
    const toggle = (list, v) => (v === '' ? [] : list.includes(v) ? list.filter((x) => x !== v) : list.concat([v]));
    q('[data-mdev]').forEach((b) => (b.onclick = () => { this._mail.devices = toggle(this._mail.devices, b.dataset.mdev); if (this._preview) this._loadPreview(); this._sig = ''; this._render(); }));
    q('[data-mp]').forEach((i) => (i.onchange = () => { this._mail.people = toggle(this._mail.people, i.dataset.mp); this._sig = ''; this._render(); }));
    q('[data-sp]').forEach((b) => (b.onclick = () => { this._sub.person = b.dataset.sp; this._sig = ''; this._render(); }));
    q('[data-sl]').forEach((b) => (b.onclick = () => { this._sub.level = b.dataset.sl; this._sig = ''; this._render(); }));
    q('[data-su]').forEach((b) => (b.onclick = () => { this._sub.until = b.dataset.su; this._sig = ''; this._render(); }));
    q('[data-sdev]').forEach((b) => (b.onclick = () => { this._sub.devices = toggle(this._sub.devices, b.dataset.sdev); this._sig = ''; this._render(); }));
    q('[data-subdel]').forEach((b) => (b.onclick = () => this._ops([{ op: 'sub_del', sid: b.dataset.subdel }])));
    q('[data-fx]').forEach((i) => (i.onchange = () => this._ops([{ op: 'list_set', key: i.dataset.fx, person: i.dataset.p, on: i.checked, default: this._settings()[i.dataset.fx] }])));
    q('[data-en]').forEach((i) => (i.onchange = () => this._saveSettings({ enabled: i.checked })));
    q('[data-open]').forEach((b) => (b.onclick = () => { const id = b.dataset.open; this._open[id] = !this._open[id]; this._sig = ''; this._render(); }));
    q('[data-fd]').forEach((s) => (s.onchange = () => { this._filter.d = s.value; this._sig = ''; this._render(); }));
    q('[data-fr]').forEach((b) => (b.onclick = () => { this._filter.r = b.dataset.fr; this._sig = ''; this._render(); }));
  }

  async _loadPreview() {
    const M = this._mail; const token = (this._pvTok = (this._pvTok || 0) + 1);
    const tpl = `{% from 'slotplanner_report.jinja' import sp_report %}{{ sp_report(${JSON.stringify(M.kind)}, ${JSON.stringify(M.day || dayKey(new Date(Date.now() - 86400000)))}, ${Number(M.days) || 7}, ${JSON.stringify(M.devices)}, '') }}`;
    try {
      let unsub = null; let done = false;
      unsub = await this._h.connection.subscribeMessage((msg) => { done = true; if (unsub) unsub(); if (token !== this._pvTok) return; this._previewHtml = msg.result; this._sig = ''; this._render(); }, { type: 'render_template', template: tpl });
      if (done && unsub) unsub();
    } catch (e) { if (token !== this._pvTok) return; this._previewHtml = `<p>${esc(e.message || e)}</p>`; this._sig = ''; this._render(); }
  }
}

const CSS = `
:host{--bg:var(--card-background-color,#111827);--fg:var(--primary-text-color,#e5e7eb);--mut:var(--secondary-text-color,#9ca3af);--ln:var(--divider-color,rgba(255,255,255,.12));--acc:var(--primary-color,#6366f1);--good:#22c55e;--bad:#ef4444;--warn:#f59e0b}
.wrap{padding:18px}
.ey{font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#d4ab4e;font-weight:700}
h2{margin:4px 0 2px;font-size:24px}
.sub{color:var(--mut);font-size:14px;margin-bottom:12px}
.tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.tab{background:none;border:1px solid var(--ln);color:var(--fg);padding:8px 14px;border-radius:999px;font:inherit;cursor:pointer}
.tab.on{background:var(--acc);border-color:var(--acc);color:#fff}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--bad)}
.msg{padding:10px 12px;border-radius:10px;background:rgba(99,102,241,.15);margin-bottom:10px;font-size:14px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:10px}
.k{border:1px solid var(--ln);border-radius:12px;padding:10px 12px}
.kl{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--mut);font-weight:700}
.kv{font-size:22px;font-weight:800;margin-top:4px}.kv.sm{font-size:17px}
.ks{font-size:12px;color:var(--mut)}
.good{color:var(--good)}.bad{color:var(--bad)}.m{color:var(--warn)}
.actbox{border:1px solid rgba(34,211,238,.5);background:rgba(34,211,238,.06);border-radius:14px;padding:12px;margin-bottom:10px}
.ah{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ah span{color:var(--mut);font-size:13px}.ah .badge{margin-left:auto}
.ag{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}.ag small,.ses small{display:block;color:var(--mut);font-size:12px}.ag b{font-size:17px}
.sec{display:flex;align-items:center;gap:8px;margin:16px 0 8px;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:var(--mut)}
.sec.small{margin-top:12px}
.n{display:inline-flex;width:22px;height:22px;border-radius:50%;background:#d4ab4e;color:#111;align-items:center;justify-content:center;font-size:12px}
.devs{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px}
.dev{border:1px solid var(--ln);border-radius:14px;padding:10px;cursor:pointer}
.dev:focus-visible,.rh:focus-visible,.blk:focus-visible,.chip:focus-visible,.btn:focus-visible,.tab:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.dev.sel{border-color:var(--acc);box-shadow:0 0 0 1px var(--acc)}.dev.act{border-color:rgba(34,211,238,.6)}
.dt{display:flex;gap:10px;align-items:flex-start}.dt b{display:block}.dt small{display:block;color:var(--mut);font-size:12px}.dt small.warn{color:var(--warn)}.dt small.ok{color:var(--good)}
.ap{display:flex;align-items:center;gap:6px;font-size:13px;margin-top:8px;border-top:1px solid var(--ln);padding-top:6px}
.pl{display:inline-flex;align-items:center;gap:4px;margin:6px 6px 0 0;padding:2px 4px 2px 8px;border-radius:999px;background:rgba(99,102,241,.18);font-size:12px}
.x{background:none;border:none;color:var(--mut);cursor:pointer;font-size:13px;padding:2px 4px}
.hint{font-size:13px;color:var(--mut);margin-bottom:6px}
.chh{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--mut);margin-bottom:4px}.chh b{color:var(--fg)}
.mini{margin-left:auto;background:none;border:1px solid var(--ln);color:var(--fg);border-radius:8px;padding:2px 10px;cursor:pointer}
.chw{border:1px solid var(--ln);border-radius:12px;padding:6px}
.ch{width:100%;height:190px;display:block}.ch .slot{cursor:pointer}
.tx{fill:var(--mut);font-size:12px}.tsc{font-size:15px;font-weight:800}.tsc.g{fill:#22c55e}.tsc.m{fill:#eab308}.tsc.b{fill:#ef4444}
.blocks{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.blk{text-align:left;border:1px dashed #eab308;background:rgba(234,179,8,.05);color:var(--fg);border-radius:12px;padding:8px 10px;font:inherit;cursor:pointer}
.blk.full{background:rgba(99,102,241,.12)}.blk b{display:inline}.blk small{display:block;color:var(--mut);font-size:12px}
.sc{display:inline-block;padding:0 7px;border-radius:999px;font-weight:800;font-size:12px;margin-right:6px}.sc.g{background:#dcfce7;color:#166534}.sc.m{background:#fef3c7;color:#92400e}.sc.b{background:#fee2e2;color:#991b1b}
.acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.btn{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--ln);background:none;color:var(--fg);border-radius:10px;padding:8px 12px;font:inherit;cursor:pointer}
.btn.pri{background:var(--acc);border-color:var(--acc);color:#fff}.btn[disabled]{opacity:.5}
.legend{font-size:12px;color:var(--mut);margin-top:10px}
.empty{color:var(--mut);padding:14px;border:1px dashed var(--ln);border-radius:12px}.empty.sm{padding:6px 10px}
.filt{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
select,input[type=date]{background:var(--bg);color:var(--fg);border:1px solid var(--ln);border-radius:8px;padding:6px 8px;font:inherit}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{border:1px solid var(--ln);background:none;color:var(--fg);border-radius:999px;padding:5px 11px;font:inherit;font-size:13px;cursor:pointer}.chip.on{background:var(--acc);border-color:var(--acc);color:#fff}
.run{border:1px solid var(--ln);border-left:4px solid #64748b;border-radius:12px;margin-bottom:8px}
.run.r-ok{border-left-color:var(--good)}.run.r-fail{border-left-color:var(--bad)}.run.r-fixed{border-left-color:var(--warn)}.run.r-busy{border-left-color:#3b82f6}
.rh{display:flex;align-items:center;gap:10px;padding:10px;cursor:pointer}.rh small{display:block;color:var(--mut);font-size:12px}.rh .badge{margin-left:auto}.chev{color:var(--mut)}
.badge{padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;background:#334155;color:#e2e8f0}
.badge.ok{background:#dcfce7;color:#166534}.badge.fixed,.badge.m{background:#fef3c7;color:#92400e}.badge.fail{background:#fee2e2;color:#991b1b}.badge.busy{background:#dbeafe;color:#1e40af}
.early{margin:0 10px 8px;padding:6px 10px;border-radius:8px;background:rgba(245,158,11,.15);color:#fbbf24;font-size:13px}
.ses{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:0 10px 8px;padding:8px;border-radius:10px;background:rgba(255,255,255,.04)}
.steps{padding:0 10px 10px}.st{display:grid;grid-template-columns:90px 12px 1fr;gap:6px;font-size:13px;padding:3px 0}.st .t{color:var(--mut);font-size:12px}
.st .d{width:8px;height:8px;border-radius:50%;background:#94a3b8;margin-top:5px}.st .d.ok{background:var(--good)}.st .d.fail{background:var(--bad)}.st em{color:var(--warn);font-style:normal;font-size:12px}
.box{border:1px solid var(--ln);border-radius:14px;padding:12px;margin-bottom:10px}
.bt{font-weight:700;font-size:16px}.bs{color:var(--mut);font-size:13px;margin:4px 0}
.lab{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:var(--mut);font-weight:700;margin:10px 0 6px}
.tg{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--ln);border-radius:999px;padding:5px 11px;font-size:13px}.tg.big{font-size:15px;font-weight:700}
.warnbox{background:rgba(245,158,11,.15);color:#fbbf24;padding:8px 10px;border-radius:10px;font-size:13px;margin-top:8px}
.okbox{background:rgba(34,197,94,.12);color:var(--good);padding:8px 10px;border-radius:10px;font-size:14px;margin:8px 0}
.errs{color:var(--bad);margin:8px 0;padding-left:18px}
.pv{width:100%;height:520px;border:1px solid var(--ln);border-radius:10px;margin-top:10px;background:#fff}
.subi{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--ln);font-size:13px}.subi span{color:var(--mut)}.subi .x{margin-left:auto}
.fxg{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;margin-top:8px}.fx{border:1px solid var(--ln);border-radius:12px;padding:10px}.fx small{display:block;color:var(--mut);font-size:12px;margin:2px 0 8px}
.lt{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px}.lt td{padding:6px 4px;border-top:1px solid var(--ln)}
ha-icon{--mdc-icon-size:22px;color:var(--mut)}
@media (max-width:480px){.wrap{padding:12px}.ag,.ses{grid-template-columns:repeat(2,1fr)}h2{font-size:21px}}
`;

if (!customElements.get('slotplanner-card')) {
  customElements.define('slotplanner-card', SlotplannerCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: 'slotplanner-card', name: 'Slotplanner', description: 'Plan devices in the cheapest blocks of the day.' });
}
