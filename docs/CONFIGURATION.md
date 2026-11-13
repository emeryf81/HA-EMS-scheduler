# Configuration reference

Everything lives in `custom_templates/slotplanner_config.jinja`. After a change, run **Slotplanner: reload configuration** and look at the Setup tab of the card.

Values are Jinja literals: `'text'`, `3`, `0.7`, `true` / `false`, `['a', 'b']`, `{'key': 'value'}`. Fields you leave out get the default below.

## general

| Field | Default | Meaning |
|---|---|---|
| `language` | `'en'` | `'en'` or `'nl'` for the card, messages and e-mails |
| `currency` | `'€'` | symbol in the card and e-mails |
| `block_hours` | `3` | length of a block, 1 to 6 hours |
| `blocks_per_day` | `6` | how many blocks the planner looks for, 1 to 12 |
| `fetch_time` | `'17:00'` | when it looks for new blocks (tomorrow's prices must be published) |
| `autoplan_time` | `'00:00'` | when devices with autoplan get their block |
| `report_time` | `'00:05'` | when the nightly e-mail goes out |

## prices

| Field | Default | Meaning |
|---|---|---|
| `source` | | `frank`, `nordpool_hacs`, `entsoe`, `nordpool`, `tibber` or `custom` |
| `today` | `''` | sensor with today's prices |
| `tomorrow` | `''` | sensor with tomorrow's prices, when that is a separate sensor |
| `config_entry` | `''` | official Nord Pool: the config entry id. Open the Nord Pool entry under Settings > Devices & services: the id is the last part of the address |
| `area` | `''` | official Nord Pool: price area, for example `'BE'`; empty takes the first one |
| `multiply` | `1.0` | price you pay = source price × multiply + add |
| `add` | `0.0` | |
| `attributes` | preset | `custom`: attribute names that hold the list, for example `['prices']` |
| `time_key` | preset | `custom`: key of the start time in each item |
| `price_key` | preset | `custom`: key of the price in each item |
| `unit` | preset | `custom`: `'kwh'` or `'mwh'` |

Presets per source:

| source | attributes | time_key | price_key | unit |
|---|---|---|---|---|
| `frank` | `prices` | `from` | `total_price_eur_kwh` | kWh |
| `nordpool_hacs` | `raw_today`, `raw_tomorrow` | `start` | `value` | kWh |
| `entsoe` | `prices_today`, `prices_tomorrow`, `prices` | `time` | `price` | kWh |
| `nordpool` | action `nordpool.get_prices_for_date` | `start` | `price` | MWh |
| `tibber` | action `tibber.get_prices` | `start_time` | `price` | kWh |

## solar

| Field | Default | Meaning |
|---|---|---|
| `source` | `'none'` | `forecast_solar`, `solcast` or `none` |
| `today` | `''` | Forecast.Solar: expected kWh today. Solcast: `sensor.solcast_pv_forecast_forecast_today` |
| `tomorrow` | `''` | the same for tomorrow |
| `feed_in_price` | `0` | what one kWh sent to the grid brings, a number or an entity id |
| `covers_kw` | `2.0` | how many kW of a device the sun is assumed to cover |
| `correction` | `{}` | optional `morning`, `midday`, `evening`: entity ids with a factor |

## grid

| Field | Default | Meaning |
|---|---|---|
| `power_sensor` | `''` | grid power in W, positive when importing. Splits the cost of a run between grid and sun |
| `pv_power_sensor` | `''` | solar power in W, only used in messages |
| `monthly_peak_sensor` | `''` | highest quarter-hour peak this month, in W or kW |
| `base_load_kw` | `0.7` | what the house uses next to the planned devices |
| `max_devices_per_block` | `2` | 1 or 2 |
| `pause_entity` | `''` | while this is on, switch, climate and EV devices pause |

## people and notifications

```jinja
{%- set people = [
  {'id': 'alex', 'name': 'Alex', 'notify': 'notify.mobile_app_alex_phone', 'email': 'alex@example.com'},
] -%}
{%- set notifications = {'email_service': 'notify.my_mail', 'remind_minutes': 45} -%}
```

`email_service` must accept `target` (a list of addresses) and `data: {html: ...}`, like the SMTP integration. Who gets what is chosen in the Reports tab of the card, not here.

## devices

Fields for every device:

| Field | Default | Meaning |
|---|---|---|
| `id` | | short, a-z, 0-9 and `_`. Do not change it later: plans and history use it |
| `name` | the id | shown in the card and messages |
| `icon` | per type | an mdi icon |
| `type` | `custom` | `appliance`, `switch`, `climate`, `ev` or `custom` |
| `power_kw` | `2.0` | peak power. Replaced by the measured peak after two runs |
| `power_sensor` | `''` | live power in W. Without it nothing is measured (switch, climate and EV count `power_kw` while running) |
| `autoplan` | `'off'` | `off`, `when_ready`, `daily` or `ev` |
| `autoplan_if` | `''` | only autoplan while this entity is on |
| `max_blocks` | `1` | blocks this device may hold at the same time |
| `start_actions` | `[]` | extra actions after the built-in start |
| `stop_actions` | `[]` | extra actions after the built-in stop |

### appliance

| Field | Default |
|---|---|
| `status` | status sensor (required) |
| `start_button` | start button (required) |
| `door` | door binary sensor, `on` = open |
| `remote` | binary sensor, `on` = remote start allowed |
| `running_states` | `['in_use', 'running']` |
| `ready_states` | `['programmed', 'waiting_to_start']` |
| `pause_states` | `['pause', 'rinse_hold', 'program_interrupted']` |

The defaults fit the official Miele integration. For other brands, look at the states the status sensor shows (Developer tools > States) and fill them in.

### switch

| Field | Default |
|---|---|
| `switch` | the switch (required) |
| `finish_below_w` | `0`: when above 0, the block ends once the power stays below this value... |
| `finish_after_min` | `0`: ...for this many minutes |

### climate

| Field | Default |
|---|---|
| `climates` | list of climate entities (required) |
| `hvac_mode` | `'heat'` |
| `temperature` | `0` = leave the set temperature as it is |

### ev

| Field | Default |
|---|---|
| `switch` | switch that allows charging, or leave empty and use `start_actions` / `stop_actions` |
| `soc` | battery level sensor in % |
| `target_soc` | `80`, or an entity id |
| `battery_kwh` | `50` |
| `charge_kw` | `7.4` |
| `cable` | binary sensor, `on` = car connected |

### custom

| Field | Default |
|---|---|
| `ready_entity` | must be `on` before the block may start |
| `running_entity` | when it goes from `on` to `off`, the run is finished |

### Actions

`start_actions` and `stop_actions` use the same format as a script step, written as a Jinja dictionary:

```jinja
'start_actions': [
  {'action': 'select.select_option', 'target': {'entity_id': 'select.charger_mode'}, 'data': {'option': 'Normal'}},
  {'action': 'notify.mobile_app_alex_phone', 'data': {'message': 'The charger is on'}},
],
```
