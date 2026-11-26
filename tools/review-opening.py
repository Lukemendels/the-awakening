"""Capture a phone-sized, player-visible session. Requires Python Playwright and Chromium."""
from argparse import ArgumentParser
from pathlib import Path
from shutil import which
from time import monotonic

from playwright.sync_api import sync_playwright

parser = ArgumentParser(description=__doc__)
parser.add_argument('url')
parser.add_argument('output', type=Path, help='New directory for frames and a local action log')
parser.add_argument('--portrait', action='store_true')
args = parser.parse_args()
args.output.mkdir(parents=True, exist_ok=False)
with sync_playwright() as pw, (args.output / 'actions.tsv').open('w') as log:
    browser = pw.chromium.launch(executable_path=which('chromium'), args=['--enable-unsafe-swiftshader'])
    width, height = (390, 844) if args.portrait else (844, 390)
    page = browser.new_page(viewport={'width': width, 'height': height}, is_mobile=True, has_touch=True)
    device = page.context.new_cdp_session(page)
    start = monotonic()
    page.goto(args.url, wait_until='domcontentloaded')
    log.write('frame\telapsed_seconds\taction\n')
    def frame(number, action):
        filename = f'{number:03d}.jpg'
        page.screenshot(path=str(args.output / filename), quality=85)
        log.write(f'{filename}\t{monotonic()-start:.1f}\t{action}\n')
        log.flush()
        print(args.output / filename, flush=True)

    print('Use tap x y, drag x1 y1 x2 y2 milliseconds, wait milliseconds, reload, shot, or quit.')
    frame(0, 'open')
    number = 0
    while True:
        try:
            line = input().strip()
        except EOFError:
            break
        command, *fields = line.split() or ['shot']
        if command == 'quit':
            break
        try:
            values = list(map(int, fields))
            if command == 'tap':
                x, y = values
                page.touchscreen.tap(x, y)
            elif command == 'drag':
                x, y, end_x, end_y, ms = values
                def touch(kind, points):
                    device.send('Input.dispatchTouchEvent', {'type': kind, 'touchPoints': points})
                touch('touchStart', [{'x': x, 'y': y}])
                try:
                    for step in range(1, 11):
                        touch('touchMove', [{'x': x+(end_x-x)*step/10, 'y': y+(end_y-y)*step/10}])
                        page.wait_for_timeout(max(0, ms)/10)
                finally:
                    touch('touchEnd', [])
            elif command == 'wait':
                ms, = values
                page.wait_for_timeout(max(0, ms))
            elif command == 'reload':
                page.reload(wait_until='domcontentloaded')
            elif command != 'shot':
                print('Unknown action.')
                continue
        except ValueError:
            print('Check the number of coordinates and the duration.')
            continue
        number += 1
        frame(number, line)
    browser.close()
