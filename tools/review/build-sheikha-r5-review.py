#!/usr/bin/env python3
"""Read R5 as data; emit a self-contained, offline review workspace."""
import argparse
import base64
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path('/home/sheikha/مستندات/شيخة الهوية/SHEIKHA_R5_REVIEW(1).html')
OUTPUT = ROOT / 'runtime/r5-review'
SECTIONS = ('architecture', 'systems', 'integration', 'rfq', 'daily', 'product', 'source', 'verification')


class ReferenceParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = {}
        self.current = None
        self.capture = None
        self.parts = []
        self.table = None
        self.row = None
        self.cell = None
        self.blocked = 0
        self.visuals = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'style', 'iframe', 'object'):
            self.blocked += 1
        if self.blocked:
            return
        if tag == 'section':
            self.current = attrs.get('id')
            if self.current in SECTIONS:
                if self.current in self.sections:
                    raise ValueError('Duplicate section')
                self.sections[self.current] = []
            else:
                self.current = None
        if tag == 'img':
            uri = attrs.get('src', '')
            match = re.fullmatch(r'data:image/(webp|png|jpeg);base64,([A-Za-z0-9+/=]+)', uri)
            if match and len(uri) < 2_000_000 and len(self.visuals) < 4:
                base64.b64decode(match[2], validate=True)
                self.visuals.append({'src': uri, 'alt': attrs.get('alt', 'مرجع بصري')})
        if not self.current:
            return
        if tag == 'table':
            self.table = []
        elif tag == 'tr':
            self.row = []
        elif tag in ('td', 'th'):
            self.cell = []
        elif self.table is None and tag in ('h1', 'h2', 'h3', 'p', 'li', 'pre'):
            self.capture, self.parts = tag, []
        elif tag == 'br':
            self.handle_data('\n')

    def handle_data(self, data):
        if self.blocked:
            return
        if self.cell is not None:
            self.cell.append(data)
        elif self.capture:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'iframe', 'object') and self.blocked:
            self.blocked -= 1
            return
        if self.blocked or not self.current:
            return
        if tag in ('td', 'th') and self.cell is not None:
            self.row.append(' '.join(''.join(self.cell).split()))
            self.cell = None
        elif tag == 'tr' and self.row is not None:
            self.table.append(self.row)
            self.row = None
        elif tag == 'table' and self.table is not None:
            self.sections[self.current].append({'type': 'table', 'rows': self.table})
            self.table = None
        elif tag == self.capture:
            text = ''.join(self.parts).strip()
            if text:
                self.sections[self.current].append({'type': tag, 'text': text})
            self.capture, self.parts = None, []
        elif tag == 'section':
            self.current = None


def extract(source):
    if len(source) > 4_000_000:
        raise ValueError('R5 source exceeds 4 MB')
    parser = ReferenceParser()
    parser.feed(source.decode('utf-8'))
    parser.close()
    if set(parser.sections) != set(SECTIONS):
        raise ValueError('Missing R5 sections')
    families, systems = [], []
    family_table = next(b['rows'] for b in parser.sections['systems'] if b['type'] == 'table')
    for row in family_table[1:]:
        if len(row) != 4:
            raise ValueError('Invalid family row')
        code, name = row[0].split(' — ', 1)
        if not re.fullmatch(r'[A-Z]{2,4}', code):
            raise ValueError('Invalid family code')
        units = [part.strip() for part in row[1].split('؛') if part.strip()]
        families.append({'id': code, 'name': name, 'owner': row[2], 'output': row[3], 'count': len(units)})
        for index, title in enumerate(units, 1):
            systems.append({'id': f'{code}-{index:02}', 'name': title, 'family': code,
                            'owner': row[2], 'output': row[3], 'status': 'DESIGN_REFERENCE',
                            'idOrigin': 'FAMILY_CODE_AND_SOURCE_UNIT_ORDER'})
    flow_table = next(b['rows'] for b in parser.sections['integration'] if b['type'] == 'table')
    if any(len(row) != 5 for row in flow_table):
        raise ValueError('Invalid flow row')
    flows = [dict(zip(('id', 'source', 'target', 'event', 'gate'), row)) for row in flow_table[1:]]
    acceptance_tables = [b['rows'] for b in parser.sections['rfq']
                         if b['type'] == 'table' and len(b['rows']) > 1 and b['rows'][1][0] == 'RFQ-01']
    if len(acceptance_tables) != 1:
        raise ValueError('Acceptance matrix missing or ambiguous')
    if any(len(row) != 3 for row in acceptance_tables[0]):
        raise ValueError('Invalid acceptance row')
    criteria = [dict(zip(('id', 'scenario', 'expected'), row)) for row in acceptance_tables[0][1:]]
    if (len(families), len(systems), len(flows), len(criteria)) != (20, 88, 14, 34):
        raise ValueError('Unexpected R5 catalog counts')
    for records in (families, systems, flows, criteria):
        if len({row['id'] for row in records}) != len(records):
            raise ValueError('Duplicate identifier')
    ids = {row['id'] for row in systems}
    if any(len(row) != 5 or row['source'] not in ids or row['target'] not in ids for row in flows):
        raise ValueError('Unresolved flow endpoint')
    return {'schema': 'SHEIKHA_R5_REVIEW_DATA_V1', 'sourceSha256': hashlib.sha256(source).hexdigest(),
            'sourceVersion': 'R5', 'sourceFilename': SOURCE.name, 'systems': systems, 'families': families,
            'flows': flows, 'criteria': criteria, 'sections': parser.sections, 'visuals': parser.visuals,
            'publicationApproval': False, 'executionEvidence': 'NOT_EVALUATED_BY_THIS_REVIEW'}


def build(source_path=SOURCE, output=OUTPUT):
    if source_path.stat().st_size > 4_000_000:
        raise ValueError('R5 source exceeds 4 MB')
    if any(parent.is_symlink() for parent in (output, *output.parents)):
        raise ValueError('Symlink output denied')
    for name in ('index.html', 'catalog.json', 'LUCIDE-LICENSE.txt', 'build.json'):
        if (output / name).is_symlink():
            raise ValueError('Symlink output denied')
    source = source_path.read_bytes()
    data = extract(source)
    data['sourceFilename'] = source_path.name
    template = (ROOT / 'core/review/r5-review.html').read_text()
    css = (ROOT / 'core/review/r5-review.css').read_text()
    script = (ROOT / 'core/review/r5-review-state.js').read_text() + '\n' + (ROOT / 'core/review/r5-review.js').read_text()
    encoded = json.dumps(data, ensure_ascii=False).replace('<', '\\u003c').replace('>', '\\u003e').replace('&', '\\u0026')
    script_hash = base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
    csp = f"default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'sha256-{script_hash}'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
    def substitute(match):
        token = match[1]
        if token.startswith('ICON:'):
            name = token[5:]
            return (ROOT / 'public/architecture-explorer/icons' / f'{name}.svg').read_text()
        return {'STYLE': css, 'DATA': encoded, 'SCRIPT': script, 'CSP': html.escape(csp, quote=True)}[token]
    rendered = re.sub(r'\{\{([A-Za-z:-]+)\}\}', substitute, template)
    if '{{' in rendered:
        raise ValueError('Unresolved template placeholder')
    output.mkdir(parents=True, exist_ok=True, mode=0o700)
    artifacts = {'index.html': rendered.encode(), 'catalog.json': json.dumps(data, ensure_ascii=False, indent=2).encode(),
                 'LUCIDE-LICENSE.txt': (ROOT / 'public/architecture-explorer/icons/LICENSE').read_bytes()}
    for name, content in artifacts.items():
        target = output / name
        if target.is_symlink():
            raise ValueError('Symlink output denied')
        target.write_bytes(content)
        target.chmod(0o600)
    evidence = {'source': str(source_path), 'sourceSha256': data['sourceSha256'],
                'artifacts': {name: hashlib.sha256(content).hexdigest() for name, content in artifacts.items()},
                'counts': {name: len(data[name]) for name in ('systems', 'families', 'flows', 'criteria')},
                'sourceModified': source_path.read_bytes() != source, 'published': False}
    if evidence['sourceModified']:
        raise ValueError('Source changed during build')
    (output / 'build.json').write_text(json.dumps(evidence, ensure_ascii=False, indent=2))
    (output / 'build.json').chmod(0o600)
    return evidence


if __name__ == '__main__':
    cli = argparse.ArgumentParser()
    cli.add_argument('--source', type=Path, default=SOURCE)
    cli.add_argument('--output', type=Path, default=OUTPUT)
    args = cli.parse_args()
    print(json.dumps(build(args.source, args.output), ensure_ascii=False, indent=2))
