# Changelog

## 1.0.2

Fixes from the second code review.

- A car stops charging as soon as it reaches its target, also while the charger still draws power.
- A switched-on entity that is unavailable when it should go off stays on the release list, so it is switched off once it comes back.
- An active plan that runs past its block keeps holding that block in the overlap and capacity checks and in the search for new blocks.
- Card: a negative day average no longer turns a lower price into "above average".
- Card: when the chosen day has no prices any more (for example after midnight), the chart goes back to today instead of disappearing with its day buttons.
- Card: a custom device whose `ready_entity` is not on shows as not ready, like the planner itself, and the card redraws when that entity changes.
- The card test plans two devices in one block first and checks that the car is refused there.

## 1.0.1

Fixes from the first code review.

- The "started earlier" message showed the text table instead of the reason.
- An appliance that loses its connection is no longer taken for finished.
- Dates, days and statistics use the Home Assistant time zone, also on hosts that run in UTC, and days of 23 or 25 hours.
- fetch_time, autoplan_time and report_time may be the same; every task runs.
- Run time is learned from the elapsed time, not from the minutes with power.
- The sun is counted per quarter hour when choosing a block per device, the score and the start offset.
- Settings from the card are sent as small operations, so quick clicks no longer overwrite each other.
- A start that arrives after its plan was removed does nothing.
- What the planner switched on is switched off again after a failed attempt or when a device is removed (script.slotplanner_release).
- An appliance that runs past its block keeps its place until it stops.
- Back-to-back blocks keep the pause and respect the main switch. Switching the planner off stops running switches, climate and chargers.
- Waiting for new prices uses a token instead of the count.
- Planning a block where a finished run of the same device sits works again.
- Card: keyboard support, an error when planning fails or gets no answer, previews of an older choice are ignored, days with a clock change are drawn correctly.
- Reports: local day boundaries and the device filter for week, month and year.
- The card test fails when an interaction or the browser fails.

## 1.0.0

First public version.

- Cheap blocks from Frank Energie, Nord Pool (official and HACS), ENTSO-e, Tibber or any price sensor.
- Solar forecast from Forecast.Solar or Solcast, valued at the feed-in price.
- Device types: appliance with remote start, switch, climate, EV charger, custom actions.
- Executor with start, finish detection, early start, manual stop, pause entity, overrun and measurement.
- Learning of peak power, run time and energy per run.
- Diagnostics with a timeline per run and a replan after a failed start.
- Nightly, week, month and year e-mails, reports on demand, phone messages per person and device.
- Card with Plan, Runs, Reports and Setup tabs, in English and Dutch.
