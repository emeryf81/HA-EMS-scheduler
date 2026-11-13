#!/usr/bin/env bash
# Copies the Slotplanner files and the test configuration into tests/ha.
set -e
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$here/ha/packages" "$here/ha/custom_templates" "$here/ha/www/slotplanner"
cp "$here/../config/packages/slotplanner.yaml" "$here/ha/packages/"
for f in "$here"/../config/custom_templates/slotplanner*.jinja; do
  [ "$(basename "$f")" = slotplanner_config.jinja ] || cp "$f" "$here/ha/custom_templates/"
done
cp "$here/test_slotplanner_config.jinja" "$here/ha/custom_templates/slotplanner_config.jinja"
cp "$here"/../config/www/slotplanner/* "$here/ha/www/slotplanner/" 2>/dev/null || true
