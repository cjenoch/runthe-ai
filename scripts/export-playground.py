"""Build the static playground using the installed visualization renderer.

Usage: python scripts/export-playground.py /path/to/visualize/scripts/render.py
The deployment serves the committed export; it does not need this renderer.
"""
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'prototypes/doclifts-workout-views.html').read_text(encoding='utf-8')
script = (root / 'prototypes/workout-interactions.js').read_text(encoding='utf-8')
fragment = root / 'output/doclifts-workout-views.html'
fragment.parent.mkdir(exist_ok=True)
fragment.write_text(source.replace('/* WORKOUT_INTERACTIONS */', script), encoding='utf-8')
destination = root / 'public/testing/doclifts.html'
subprocess.run([sys.executable, sys.argv[1], str(fragment), str(destination), '--force'], check=True)
page = destination.read_text(encoding='utf-8')
page = page.replace('<meta name="referrer"', '<meta name="robots" content="noindex, nofollow">\n<meta name="referrer"', 1)
page = page.replace('<title>Doclifts Workout Views</title>', '<title>DocLifts UI testing · runthe.ai</title>', 1)
page = page.replace('</head>', '<style>.testing-note{max-width:390px;margin:0 auto 12px;font:13px/1.5 system-ui,sans-serif;color:light-dark(#49544f,#b9c5bf)}.testing-note strong{display:block;color:light-dark(#14251d,#eff8f2)}@media(max-width:480px){body{padding:8px}}</style>\n</head>', 1)
page = page.replace('<body>', '<body>\n<header class="testing-note"><strong>DocLifts · UI playground</strong>Sample data. Switch layouts below the workout. Tap the clock for timer settings.</header>', 1)
destination.write_text(page, encoding='utf-8')
