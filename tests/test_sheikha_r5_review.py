import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('r5_builder', ROOT / 'tools/review/build-sheikha-r5-review.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


def fixture():
    families = ['GOV', 'TEN', 'DAT', 'COM', 'CRM', 'FIN', 'SCM', 'LOG', 'MFG', 'ENG',
                'QHSE', 'AST', 'PMO', 'HCM', 'CX', 'PUB', 'CST', 'AI', 'INT', 'VFD']
    family_rows = []
    for family in families:
        count = 8 if family == 'FIN' else 6 if family in ('ENG', 'INT') else 4
        units = '؛'.join(f'Unit {i}' for i in range(count))
        family_rows.append(f'<tr><td>{family} — Family</td><td>{units}</td><td>Owner</td><td>Output</td></tr>')
    flows = [f'<tr><td>FLOW-{i:02}</td><td>COM-03</td><td>CRM-02</td><td>event.{i}.v1</td><td>Review required</td></tr>' for i in range(1, 15)]
    criteria = [f'<tr><td>RFQ-{i:02}</td><td>Case {i}</td><td>Expected {i}</td></tr>' for i in range(1, 35)]
    def table(headers, rows):
        return '<table><tr>' + ''.join(f'<th>{h}</th>' for h in headers) + '</tr>' + ''.join(rows) + '</table>'
    blocks = {'systems': table(['Family', 'Units', 'Owner', 'Output'], family_rows),
              'integration': table(['ID', 'Source', 'Target', 'Event', 'Gate'], flows),
              'rfq': table(['ID', 'Case', 'Expected'], criteria)}
    return ('<!doctype html><html><body>' + ''.join(f'<section id="{id}"><h2>{id}</h2>{blocks.get(id, "<p>Reference</p>")}</section>' for id in builder.SECTIONS) + '</body></html>').encode()


class R5ReviewTests(unittest.TestCase):
    def test_extracts_counts_and_resolves_flow_endpoints(self):
        data = builder.extract(fixture())
        self.assertEqual([len(data[key]) for key in ('families', 'systems', 'flows', 'criteria')], [20, 88, 14, 34])
        self.assertEqual(data['systems'][0]['id'], 'GOV-01')
        self.assertTrue(all(row['status'] == 'DESIGN_REFERENCE' for row in data['systems']))
        self.assertFalse(data['publicationApproval'])

    def test_rejects_broken_counts_duplicates_and_unresolved_endpoints(self):
        for source in [fixture().replace(b'COM-03', b'BAD-09'), fixture().replace(b'FLOW-14', b'FLOW-13'),
                       fixture().replace(b'<section id="source">', b'<section id="unknown">'), fixture() + b' ' * 4_000_000]:
            with self.subTest(source_length=len(source)), self.assertRaises(ValueError):
                builder.extract(source)

    def test_treats_html_as_data_and_only_keeps_embedded_bitmap_references(self):
        source = fixture().replace(b'<p>Reference</p>', b'<p>&lt;img onerror=alert(1)&gt;</p><script>stealSecrets()</script><iframe src="https://example.com">ignore me</iframe><img src="https://example.com/a.png">', 1)
        data = builder.extract(source)
        dumped = json.dumps(data)
        self.assertNotIn('stealSecrets', dumped)
        self.assertNotIn('ignore me', dumped)
        self.assertIn('<img onerror=alert(1)>', dumped)
        self.assertEqual(data['visuals'], [])

    def test_build_is_deterministic_preserves_source_and_escapes_script_boundaries(self):
        source = fixture().replace(b'Owner', b'&lt;/script&gt;&lt;script&gt;bad()&lt;/script&gt;')
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            original = path / 'reference.html'
            original.write_bytes(source)
            first = builder.build(original, path / 'output')
            second = builder.build(original, path / 'output')
            self.assertEqual(first, second)
            self.assertEqual(original.read_bytes(), source)
            output = (path / 'output/index.html').read_text()
            self.assertNotIn('</script><script>bad()', output)
            self.assertIn('\\u003c/script\\u003e', output)
            self.assertIn('Content-Security-Policy', output)
            self.assertIn('connect-src &#x27;none&#x27;', output)

    def test_output_symlink_is_not_followed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            original = root / 'reference.html'
            original.write_bytes(fixture())
            output = root / 'output'
            output.mkdir()
            (output / 'index.html').symlink_to(original)
            with self.assertRaisesRegex(ValueError, 'Symlink'):
                builder.build(original, output)
            self.assertEqual(original.read_bytes(), fixture())

    def test_output_directory_and_evidence_symlinks_are_rejected_before_writing(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            original = root / 'reference.html'
            original.write_bytes(fixture())
            target = root / 'target'
            target.mkdir()
            linked = root / 'linked'
            linked.symlink_to(target, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, 'Symlink'):
                builder.build(original, linked / 'child')
            (target / 'build.json').symlink_to(original)
            with self.assertRaisesRegex(ValueError, 'Symlink'):
                builder.build(original, target)
            self.assertFalse((target / 'index.html').exists())


if __name__ == '__main__':
    unittest.main()
