"""Export a static Season One game with captions and optional device narration."""
from argparse import ArgumentParser
from pathlib import Path
from tempfile import TemporaryDirectory
from zipfile import ZIP_DEFLATED, ZipFile

repo = Path(__file__).resolve().parents[1]
parser = ArgumentParser(description=__doc__)
parser.add_argument('output', type=Path)
args = parser.parse_args()
target = args.output.resolve()
if target.suffix.lower() != '.zip':
    parser.error('Choose a .zip output file')
target.parent.mkdir(parents=True, exist_ok=True)
files = [repo / name for name in ('index.html', 'LICENSE', 'LICENSE-CONTENT', 'CREDITS.md')]
files.extend(sorted((repo / 'dist').rglob('*')))
with TemporaryDirectory(dir=target.parent) as scratch:
    bundle = Path(scratch) / 'season.zip'
    with ZipFile(bundle, 'w', compression=ZIP_DEFLATED) as archive:
        for file in files:
            if not file.is_file():
                continue
            name = file.relative_to(repo).as_posix()
            if name.startswith('dist/immersive/voice/'):
                continue
            if name == 'dist/immersive/voice-profile.mjs':
                archive.writestr(name, 'export const openingRecording=null;\n')
            elif name == 'dist/immersive/index.html':
                html = file.read_text().replace('The Awakening — Noncommercial Playtest | Voice: ElevenLabs (elevenlabs.io)', 'The Awakening')
                archive.writestr(name, html)
            elif name == 'CREDITS.md':
                archive.writestr(name, file.read_text().partition('## Opening voice playtest')[0].rstrip()+'\n')
            else:
                archive.write(file, name)
    bundle.replace(target)
