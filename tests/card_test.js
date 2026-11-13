// Renders the Slotplanner card in Chromium against a running test Home Assistant.
// Usage: HA_URL=http://127.0.0.1:8123 HA_TOKEN=... node tests/card_test.js [outdir]
const { chromium } = require('playwright');
const path = require('path');
const URL_ = process.env.HA_URL || 'http://127.0.0.1:8123';
const TOKEN = process.env.HA_TOKEN;
const out = process.argv[2] || __dirname;
const api = async (p, body) => {
  const r = await fetch(URL_ + p, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); if (!r.ok) throw new Error(t); try { return JSON.parse(t); } catch (e) { return t; }
};
(async () => {
  const b = await chromium.launch();
  const errs = []; const fails = [];
  for (const [w, tag] of [[430, 'm'], [1100, 'd']]) {
    const c = await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, timezoneId: 'Europe/Brussels' });
    const p = await c.newPage();
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p.exposeFunction('haApi', (pth, body) => api(pth, body));
    await p.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#0b0f17;color:#e5e7eb;font-family:Arial;padding:8px"><div id="x"></div></body></html>');
    await p.addScriptTag({ path: path.join(__dirname, 'haicon_shim.js') });
    await p.addScriptTag({ path: path.join(__dirname, '..', 'config', 'www', 'slotplanner', 'slotplanner-card.js'), type: 'module' });
    await p.evaluate(async () => {
      const load = async () => { const l = await window.haApi('/api/states'); const S = {}; l.forEach((s) => (S[s.entity_id] = s)); return S; };
      window.calls = [];
      const mk = async () => ({ states: await load(), callService: async (d, s, data) => { window.calls.push([d, s, data]); const r = await window.haApi(`/api/services/${d}/${s}`, data || {}); setTimeout(async () => { window.e.hass = await mk(); }, 1500); return r; },
        connection: { subscribeMessage: async (cb, m) => { const r = await window.haApi('/api/template', { template: m.template }); cb({ result: r }); return () => {}; } } });
      window.mk = mk;
      await customElements.whenDefined('slotplanner-card');
      const e = document.createElement('slotplanner-card'); e.setConfig({}); window.e = e; document.getElementById('x').appendChild(e); e.hass = await mk();
    });
    await p.waitForTimeout(800);
    for (const tab of ['plan', 'runs', 'reports', 'setup']) {
      await p.evaluate((t) => { e._tab = t; e._sig = ''; e._render(); }, tab);
      await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(out, `card_${tab}_${tag}.png`), fullPage: true });
    }
    if (tag === 'd') {
      // Interactions: plan the car in the last free block, remove it again, add a message subscription, preview a report.
      await p.evaluate(() => { e._tab = 'plan'; e._sig = ''; e._render(); });
      const r = await p.evaluate(async () => {
        const R = e.shadowRoot; const out = {};
        // Keyboard: Enter on a device selects it.
        const dv = R.querySelector('[data-dev="pool_pump"]'); dv.focus(); dv.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await new Promise((r) => setTimeout(r, 100)); out.keyboard = e._sel === 'pool_pump'; e._sel = ''; e._sig = ''; e._render();
        R.querySelector('[data-dev="car"]').click(); await new Promise((r) => setTimeout(r, 100));
        out.hint = (R.querySelector('.hint') || {}).textContent;
        const free = [...R.querySelectorAll('.blk')].filter((b) => !b.classList.contains('full')).pop();
        if (!free) return { error: 'no free block to plan in: clear the plan of the test house first' };
        free.click(); await new Promise((r) => setTimeout(r, 9000));
        out.msg = (R.querySelector('.msg') || {}).textContent;
        out.carPlans = (e._h.states['sensor.slotplanner_state'].attributes.plans || []).filter((x) => x.d === 'car').map((x) => x.s);
        const pid = 'car:' + free.dataset.slot;
        const del = R.querySelector(`[data-del="${pid}"]`); if (del) del.click(); await new Promise((r) => setTimeout(r, 2500));
        out.afterDel = (e._h.states['sensor.slotplanner_state'].attributes.plans || []).filter((x) => x.d === 'car').map((x) => x.s);
        // conflict: fill one block with dishwasher + pool pump, then try to add the car to it.
        const plansOf = () => e._h.states['sensor.slotplanner_state'].attributes.plans || [];
        const fx = [...R.querySelectorAll('.blk')].filter((b) => !b.classList.contains('full')).pop();
        out.conflictRan = false;
        if (fx) {
          const fs = Number(fx.dataset.slot);
          for (const d of ['dishwasher', 'pool_pump']) { await e._h.callService('script', 'slotplanner_plan', { device: d, start: fs }); await new Promise((r) => setTimeout(r, 3000)); }
          out.fixture = plansOf().filter((x) => x.s === fs && x.st === 'planned').map((x) => x.d).sort();
          e._sel = ''; e._sig = ''; e._render(); await new Promise((r) => setTimeout(r, 300));
          const carBefore = plansOf().filter((x) => x.d === 'car').length;
          e._sel = 'car'; e._sig = ''; e._render(); await new Promise((r) => setTimeout(r, 300));
          const blk = e.shadowRoot.querySelector(`.blk.full[data-slot="${fs}"]`);
          if (blk) { out.conflictRan = true; blk.click(); await new Promise((r) => setTimeout(r, 9000)); }
          out.conflict = (e.shadowRoot.querySelector('.msg') || {}).textContent;
          out.carAdded = plansOf().filter((x) => x.d === 'car').length - carBefore;
          for (const d of ['dishwasher', 'pool_pump']) await e._h.callService('script', 'slotplanner_unplan', { plan_id: d + ':' + fs });
          await new Promise((r) => setTimeout(r, 2500));
        }
        e._tab = 'reports'; e._sig = ''; e._render();
        e.shadowRoot.querySelector('[data-sl="all"]').click(); e.shadowRoot.querySelector('[data-act="subadd"]').click(); await new Promise((r) => setTimeout(r, 2500));
        out.subs = e._h.states['sensor.slotplanner_state'].attributes.settings.subs;
        out.subCount = (out.subs || []).length;
        e.shadowRoot.querySelector('[data-act="preview"]').click(); await new Promise((r) => setTimeout(r, 2500));
        out.preview = (e._previewHtml || '').length; out.previewStart = (e._previewHtml || '').slice(0, 120);
        return out;
      });
      console.log('interactions', JSON.stringify(r));
      const check = (ok, what) => { if (!ok) fails.push(what); };
      check(!r.error, r.error || '');
      check(r.keyboard === true, 'Enter on a device does not select it');
      check(/Car/.test(r.hint || ''), 'no hint after choosing a device');
      check(r.msg && r.msg !== '…' && /planned|gepland/i.test(r.msg), 'planning a free block did not report success: ' + r.msg);
      check(Array.isArray(r.carPlans) && Array.isArray(r.afterDel) && r.afterDel.length === r.carPlans.length - 1, 'removing the plan did not work');
      check(JSON.stringify(r.fixture) === '["dishwasher","pool_pump"]', 'conflict fixture did not plan two devices in one block: ' + JSON.stringify(r.fixture));
      check(r.conflictRan === true, 'the conflict request did not run (no full block)');
      check(/two devices|twee toestellen/i.test(r.conflict || ''), 'a full block did not report the conflict: ' + r.conflict);
      check(r.carAdded === 0, 'a full block accepted the car');
      check(r.subCount >= 1 && (r.subs || []).every((x) => x.sid), 'subscription not stored with an id');
      check((r.preview || 0) > 1000 && /<html/.test(r.previewStart || ''), 'report preview is empty');
      await p.waitForTimeout(300);
      await p.screenshot({ path: path.join(out, 'card_reports_preview_d.png'), fullPage: true });
    }
    const ov = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    console.log(tag, 'overflow', ov);
    if (ov[0] > ov[1]) fails.push(`${tag}: horizontal scroll (${ov[0]} > ${ov[1]})`);
    await c.close();
  }
  console.log('errors', errs);
  if (errs.length) fails.push('browser errors: ' + errs.join(' | '));
  await b.close();
  if (fails.length) { console.error('FAILED:\n- ' + fails.join('\n- ')); process.exit(1); }
  console.log('PASSED');
})().catch((e) => { console.error(e); process.exit(1); });
