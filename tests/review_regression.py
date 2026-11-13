"""Focused regressions for planning costs, occupancy and executor transitions.
Run with .venv/bin/python tests/review_regression.py.
"""
import asyncio
import json
import copy
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from jinja2 import ChoiceLoader, DictLoader, FileSystemLoader
from homeassistant.core import HomeAssistant, Context
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.script import Script
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.template import TemplateEnvironment
from homeassistant.util import dt
from homeassistant.util.yaml import load_yaml

ROOT = Path(__file__).resolve().parents[1]


async def main():
    hass = HomeAssistant(str(ROOT / 'tests/ha'))
    package = load_yaml(str(ROOT / 'config/packages/slotplanner.yaml'))
    for script in package['script'].values():
        cv.SCRIPT_SCHEMA(script['sequence'])
    for automation in package['automation']:
        cv.SCRIPT_SCHEMA(automation['actions'])
    env = TemplateEnvironment(hass)
    env.loader = ChoiceLoader([DictLoader({}), FileSystemLoader(ROOT / 'config/custom_templates')])
    config = {
        'general': {'block_hours': 1, 'blocks_per_day': 3}, 'prices': {},
        'solar': {'source': 'solcast', 'today': 'sensor.solar', 'covers_kw': 2},
        'grid': {'pause_entity': 'input_boolean.pause'}, 'people': [], 'notifications': {},
        'devices': [
            {'id': 'washer', 'type': 'appliance', 'status': 'sensor.washer', 'start_button': 'button.start', 'power_kw': 2, 'max_blocks': 4},
            {'id': 'pump', 'type': 'switch', 'switch': 'switch.pump', 'max_blocks': 4},
        ],
    }
    def render(name, *args, file='slotplanner.jinja'):
        env.cache.clear()
        env.loader.loaders[0].mapping['slotplanner_config.jinja'] = '{% macro slotplanner_config() %}' + json.dumps(config) + '{% endmacro %}'
        return getattr(env.get_template(file).module, name)(*args).strip()

    local = ZoneInfo('Europe/Brussels')
    dt.set_default_time_zone(local)
    start = int(datetime(2026, 11, 13, 12, tzinfo=local).timestamp())
    clock = [datetime.fromtimestamp(start + 3700, local)]
    env.globals['now'] = lambda: clock[0]
    def state(plans, touched=None, enabled=True):
        hass.states.async_set('sensor.slotplanner_state', '1', {'plans': plans, 'touched': touched or [], 'settings': {'enabled': enabled}})
    plan = {'id': 'w', 'd': 'washer', 's': start, 'rs': start + 60, 'st': 'active', 'f': {'seen': 1, 'idle': 1}}
    state([plan])
    assert json.loads(render('sp_window_j', plan, 3600)) == [start, start + 10800]
    assert render('sp_conflict', 'pump', start + 3600, '') == 'peak'
    hass.states.async_set('sensor.slotplanner_slots', '1', {'slots': [{'s': start + 3600, 'e': start + 7200, 'p': 10, 'z': 0}]})
    assert render('sp_free_slot', 'pump', 0) == '0'
    prices = [[start + i * 900, .4 if i < 2 else .5] for i in range(24)]
    hass.states.async_set('sensor.slotplanner_prices', '24', {'prices': prices})
    slots = json.loads(render('sp_find_slots_j'))
    assert all(sl['s'] == start or sl['s'] >= start + 10800 for sl in slots)
    for status in ['unknown', 'unavailable', 'idle']:
        clock[0] = datetime.fromtimestamp(start + 300, local)
        hass.states.async_set('sensor.washer', status)
        tick = json.loads(render('sp_tick_j', file='slotplanner_tick.jinja'))
        changed = [o for o in tick['ops'] if o['op'] == 'set'][0]['f']
        assert (changed.get('st') == 'done') == (status == 'idle')
        assert changed['f']['idle'] == (2 if status == 'idle' else 0)
    pump = {'id': 'p', 'd': 'pump', 's': start, 'rs': start, 'st': 'active', 'owned': ['switch.pump'], 'f': {'paused': 1, 'on': 1}}
    nxt = {'id': 'n', 'd': 'pump', 's': start + 3600, 'rs': 0, 'st': 'planned', 'f': {}}
    clock[0] = datetime.fromtimestamp(start + 3601, local)
    hass.states.async_set('input_boolean.pause', 'on')
    for enabled in [True, False]:
        state([pump, nxt], ['switch.pump'], enabled)
        tick = json.loads(render('sp_tick_j', file='slotplanner_tick.jinja'))
        handoff = [o for o in tick['ops'] if o.get('id') == 'n' and o['op'] == 'set']
        assert bool(handoff) == enabled
        if enabled:
            assert handoff[0]['f']['f']['paused'] == 1
            assert handoff[0]['f']['owned'] == ['switch.pump']
        else:
            assert any(c['script'] == 'slotplanner_stop' for c in tick['calls'])
    state([dict(pump, d='removed')], ['switch.pump'])
    tick = json.loads(render('sp_tick_j', file='slotplanner_tick.jinja'))
    assert any(c['script'] == 'slotplanner_stop' for c in tick['calls'])
    assert any(o['op'] == 'del' for o in tick['ops'])
    # Expensive sunny quarters should beat cheap grid quarters for the start offset.
    clock[0] = datetime.fromtimestamp(start - 100, local)
    state([])
    hass.states.async_set('sensor.slotplanner_stats', '0', {'learn': {'washer_min': [15, 15]}})
    hass.states.async_set('sensor.solar', '0', {'detailedForecast': [{'period_start': datetime.fromtimestamp(start + 1800, local).isoformat(), 'pv_estimate': 2}]})
    assert render('sp_offset', 'washer', start) == '1800'
    # Quarter-level reference score for a day with varying prices and solar.
    q = json.loads(render('sp_quarters_j', start, 2))
    costs = [sum(x[3] for x in q[i:i+4]) / 4 for i in range(len(q)-3)]
    worst = max(sum(x[1] for x in q[i:i+4]) / 4 for i in range(len(q)-3))
    expected = round(100 * (worst - costs[0]) / (worst - min(costs)))
    assert int(render('sp_score', start)) == expected
    # Local day boundary differs from the process UTC day.
    midnight = int(datetime(2026, 11, 13, 0, tzinfo=local).timestamp())
    hass.states.async_set('sensor.slotplanner_prices', '2', {'prices': [[midnight, .1], [midnight + 86400, .9]]})
    assert float(render('sp_day_mean', midnight)) == .1
    # Execute the actual shutdown sequence with synthetic services: a failed stop
    # must retain ownership and force a later quiet stop to retry the shutdown.
    state([pump], ['switch.pump'])
    hass.states.async_set('switch.pump', 'on')
    fail = [True]
    stopped = []
    async def turn_off(call):
        stopped.append(call.data['entity_id'])
        if fail[0]:
            raise HomeAssistantError('synthetic shutdown failure')
        hass.states.async_set('switch.pump', 'off')
    async def write(call):
        cur = {'plans': hass.states.get('sensor.slotplanner_state').attributes['plans'],
               'touched': list(hass.states.get('sensor.slotplanner_state').attributes['touched'])}
        res = json.loads(render('sp_apply_j', cur, call.data['ops'], start, file='slotplanner_store.jinja'))
        state(res['state']['plans'], res['state']['touched'])
    hass.services.async_register('homeassistant', 'turn_off', turn_off)
    hass.services.async_register('script', 'slotplanner_write', write)
    sequence = copy.deepcopy(package['script']['slotplanner_stop']['sequence'])
    # Isolate device lookup; exercise the remaining production sequence unchanged.
    sequence[0]['variables']['x'] = {'type': 'switch', 'switch': 'switch.pump', 'stop_actions': []}
    stop = Script(hass, cv.SCRIPT_SCHEMA(sequence), 'regression stop', 'script')
    try:
        await stop.async_run({'device': 'pump', 'plan_id': 'p'}, Context())
        raise AssertionError('shutdown failure was swallowed')
    except HomeAssistantError:
        pass
    current = hass.states.get('sensor.slotplanner_state').attributes
    assert list(current['touched']) == ['switch.pump']
    assert current['plans'][0]['shutdown_pending']
    fail[0] = False
    await stop.async_run({'device': 'pump', 'plan_id': 'p', 'quiet': True}, Context())
    current = hass.states.get('sensor.slotplanner_state').attributes
    assert not current['touched'] and not current['plans'][0]['shutdown_pending']
    assert len(stopped) == 2
    print('PASS: HA script schemas and executor, occupancy, solar-cost, timezone regressions')


asyncio.run(main())
