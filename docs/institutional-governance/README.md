# Institutional knowledge and advisory task framework

This offline framework records public institutions, sourced organization relationships, dated appointments, and advisory assistant configurations. It executes no government action and represents no ministry, official, or international organization. It is not a model training run, trained weight artifact, complete employee directory, or complete world government roster.

The Saudi sample includes the **24 ministries listed by the official HRSD government-entities directory**, two agency examples, a GCC example, and six public leadership examples. This is directory coverage as observed on 2026-10-24, not a guarantee that every government entity or every subsequent reorganization is covered. Ministry names and official URLs do not establish an active integration or API connection. The municipal ministry's current name uses its own ministry page because the directory retained an older label.

Public structure is separate from software role templates. Minister, deputy, undersecretary, department-director, and committee-secretariat templates grant no office, delegation, or legal authority. The 24 institutional analysis assistants are configuration proposals, not assigned public servants and not imitations of named people. Detailed departments and offices are populated only for the small sourced examples; templates do not assert that every ministry has the same internal structure.

The design follows the existing reference-encyclopedia governance boundaries (`core/governance/sheikha-reference-encyclopedia-policy-governance-v1.js`) and license-recognition boundaries: human authority, attributed evidence, no official representation, no automatic approval, and third-party rights retained. Existing government-engine `integrated` and `compliant` labels were not copied as verified facts. No server route, existing registry, SHK ledger, production setting, or model provider was changed.

## Records and validation

- `registry.schema.json` is strict Draft-07 JSON Schema. The dependency-free JS validator implements its used keywords and adds reference, graph, role, provenance, date, and rights checks. Tests also validate the samples with an independent JSON Schema implementation.
- `partOf` edges form an acyclic organizational hierarchy. `memberOf` edges target committees and remain separate from hierarchy; committees support internal, interagency, and international scopes. A meeting is not automatically a partnership, committee mandate, or reporting relationship.
- People are natural persons. `appointedTo` graph edges are generated only from separate appointment records referencing a public office, start/end dates, and an official dated source. Source observation dates never become appointment dates. Unknown appointment dates remain `roleObservations` and generate `observedInOffice` edges instead.
- MC vice-minister appointment 2021-05-03 is sourced to its official biography. MC minister portfolio term 2020-02-25 is an official-history basis, distinct from a newly discovered appointment instrument. MOF minister biography dates the appointment 2016-11-01. Other example dates identify source observation, not appointment.
- `accessStatus` distinguishes a fully fetched page from official indexed content when direct access was blocked or failed. `publishedAt`, `lastUpdatedAt`, and `observedAt` are separate fields. Current snapshots require refreshing; they do not prove future officeholding.
- Public availability does not establish a training license. Every source carries explicit knowledge-use and training-license status. Placeholder model profiles have `training_artifact_status: absent`, no weights, no download, unknown rights, and unknown training license. The commercial catalog contains product definitions with license evidence pending. No full-ownership or government-approval claim is made.

Country adapters translate institutional terminology and record jurisdiction review requirements. `country-template.v1.json` is the reusable global template. Adding another country requires its own official sources and legal review, not copying Saudi structures or scraping private employees.

## Offline use

From the repository root:

```bash
node tools/institutional-governance/registry-cli.cjs validate --input tools/institutional-governance/saudi-sample.v1.json
node tools/institutional-governance/registry-cli.cjs summary --input tools/institutional-governance/saudi-sample.v1.json
node tools/institutional-governance/registry-cli.cjs graph --input tools/institutional-governance/saudi-sample.v1.json --output /tmp/institutional-graph-new.json
node tests/institutional-governance/registry.test.cjs
```

Only an explicit `--output` creates an output file, with exclusive creation and restrictive permissions. Existing outputs, source files, and final-path symlinks are never overwritten. No command downloads data or weights, contacts a provider, or mutates an existing registry.

`proposeTask(registry, { assistantId, task, request })` returns a draft for human review within the assistant's allowed task types. It does not produce an LLM answer or perform an external action. Deployment, publication, communications, payments, legal decisions, procurement, access changes, and official representation require separately authorized integrations and explicit human approval; those integrations are not implemented here.

Official source URLs and their observation/access status are stored in the sample's `sources` array. Key references are the [HRSD directory](https://www.hrsd.gov.sa/دليل-الجهات-الحكومية), [MC organization chart](https://mc.gov.sa/ar/About/Departments/pages/default.aspx), [MC vice-minister biography](https://mc.gov.sa/en/about/cvs-ministry-officials/pages/vice-minister.aspx), and [GCC organization chart](https://www.gcc-sg.org/ar/AboutUs/Pages/OrganizationalStructure.aspx).
