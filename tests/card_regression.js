// Focused card event and concurrent settings checks; no browser required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let Card;
vm.runInNewContext(fs.readFileSync('config/www/slotplanner/slotplanner-card.js', 'utf8'), {
  HTMLElement: class {}, window: {},
  customElements: { get() {}, define(_, c) { Card = c; } },
  console, setInterval, clearInterval, Date, setTimeout,
});
(async () => {
  const card = new Card();
  card.setConfig({});
  card._render = () => {};
  const settings = { autoplan: { a: false, b: false }, subs: [] };
  const calls = [];
  const pending = [];
  card._h = { states: {
    'sensor.slotplanner_state': { attributes: { settings } },
    'sensor.slotplanner_config': { attributes: { config: { devices: [{ id: 'a' }, { id: 'b' }] } } },
  }, callService: (_, name, data) => {
    calls.push(data.settings);
    return new Promise((resolve, reject) => pending.push({ resolve, reject }));
  } };
  const first = card._saveSettings({ autoplan: { ...card._settings().autoplan, a: true } });
  const second = card._saveSettings({ autoplan: { ...card._settings().autoplan, b: true } });
  assert.equal(calls[1].autoplan.a, true);
  pending[0].reject(new Error('first failed'));
  await first;
  assert.equal(card._settings().autoplan.a, true); // older failure cannot clear newer update
  pending[1].resolve(); await second;
  settings.autoplan = { b: true, a: true };
  card._sig = '';
  card.shadowRoot = { querySelectorAll: () => [] };
  card.hass = card._h;
  assert.equal(card._pendingSettings.autoplan, undefined);
  const add1 = card._saveSettings({ subs: card._settings().subs.concat([{ person: 'a' }]) });
  const add2 = card._saveSettings({ subs: card._settings().subs.concat([{ person: 'b' }]) });
  assert.equal(calls[3].subs.length, 2);
  pending[2].resolve(); pending[3].resolve(); await Promise.all([add1, add2]);
  const remove = card._saveSettings({ subs: card._settings().subs.slice(1) });
  assert.equal(calls[4].subs[0].person, 'b');
  pending[4].reject(new Error('remove failed')); await remove;
  assert.equal(card._pendingSettings.subs, undefined);
  let clicks = 0;
  const device = { dataset: { dev: 'a' }, click() { clicks++; } };
  card.shadowRoot = { querySelectorAll: (selector) => selector === '[data-dev],[data-open]' ? [device] : [] };
  card._bind();
  for (const key of ['Enter', ' ']) {
    let prevented = false;
    device.onkeydown({ target: device, key, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
  }
  device.onkeydown({ target: {}, key: ' ', preventDefault() { throw Error('child key intercepted'); } });
  assert.equal(clicks, 2);
  console.log('PASS: concurrent autoplan/subscription updates, failure/acknowledgement cleanup and keyboard activation');
})().catch(e => { console.error(e); process.exitCode = 1; });
