#!/usr/bin/env bash
# Starts a test Home Assistant with mock devices. Usage: tests/run.sh /path/to/venv
set -e
here="$(cd "$(dirname "$0")" && pwd)"
"$here/sync.sh"
exec "${1:-$here/.venv}/bin/hass" -c "$here/ha"
