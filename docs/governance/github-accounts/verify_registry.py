#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import csv,io,json,zipfile,hashlib
from pathlib import Path
p=Path(__file__).resolve().parent
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
try:
 d=json.loads((p/'accounts-registry.json').read_text(encoding='utf-8'))
 assert d['revision']=='R3-VSCODE-DOCUMENTATION-20261016'
 assert d['no_external_actions_performed'] is True
 groups=[d[k] for k in ('accounts','assets','relations','evidence','actions','budgets')]
 ids=[r['id'] for g in groups for r in g]
 assert len(ids)==len(set(ids))
 e={x['id'] for x in d['evidence']}
 accounts={x['id'] for x in d['accounts']}
 entities={x['id'] for x in d['assets']}
 for obj in d['accounts']+d['assets']+d['relations']+d['budgets']:
  assert set(obj.get('evidence_ids',[]))<=e
 for rel in d['relations']:
  assert rel['from_id'] in accounts|entities
  assert rel['to_id'] in accounts|entities|{'GitHub'}
 for b in d['budgets']:
  assert b['account_id'] in accounts
  assert type(b['spent_usd']) in (int,float) and b['spent_usd']>=0
  assert type(b['monthly_limit_usd']) in (int,float) and b['monthly_limit_usd']>=0
 rows=list(csv.DictReader(io.StringIO((p/'accounts-register.csv').read_text('utf-8-sig'))))
 assert [x['id'] for x in rows]==[x['id'] for x in d['accounts']]
 with zipfile.ZipFile(p/'accounts-register.xlsx') as z:
  assert z.testzip() is None and 'xl/workbook.xml' in z.namelist()
 mf=json.loads((p/'FILE_SHA256.json').read_text('utf-8'))
 flags={name:digest(p/name)==h for name,h in mf['files'].items()}
 assert all(flags.values())
 print(json.dumps({'schema':'SHEIKHA_VSCODE_ACCOUNT_REGISTER_READONLY','decision':'DOCUMENTATION_INTEGRITY_PASS_ONLY','account_count':len(d['accounts']),'budgets_count':len(d['budgets']),'checked_file_hashes':flags,'git_merge':False,'external_approval':False},ensure_ascii=False,indent=2))
except Exception as exc:
 print(json.dumps({'decision':'HOLD_LOCAL_REGISTRY_CHECK','reason':type(exc).__name__+':'+str(exc)[:150]},ensure_ascii=False))
 raise SystemExit(2)
