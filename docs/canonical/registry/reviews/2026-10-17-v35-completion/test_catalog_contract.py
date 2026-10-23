"""Validate the draft using the installed jsonschema package, with remote refs denied."""

import copy
import json
from pathlib import Path
import unittest
import uuid

from jsonschema import Draft7Validator, FormatChecker, RefResolver


def identifier(kind):
    return 'urn:sheikha:' + kind + ':' + str(uuid.uuid4())


def deny_remote_reference(_uri):
    raise AssertionError('Remote reference access is forbidden in this test')


class CatalogContractTests(unittest.TestCase):
    def setUp(self):
        path = Path(__file__).absolute().with_name('catalog-contract.schema.json')
        self.schema = json.loads(path.read_text())
        resolver = RefResolver('', self.schema,
                               store={'': self.schema, self.schema['$id']: self.schema},
                               handlers={scheme: deny_remote_reference
                                         for scheme in ('http', 'https', 'urn')})
        self.validator = Draft7Validator(self.schema, resolver=resolver,
                                         format_checker=FormatChecker())
        entity, jurisdiction, source = (identifier(x) for x in ('entity', 'jurisdiction', 'source'))
        self.catalog = {
            'schema': 'SHEIKHA_ENTITY_ARTICLE_EVIDENCE_CATALOG_V1',
            'status': 'DRAFT_NOT_DEPLOYED',
            'entities': [{'entity_id': entity, 'name': 'Synthetic project',
                          'kind': 'PROJECT_PROPOSAL', 'jurisdiction_ids': [jurisdiction],
                          'registration_identifiers': [], 'legal_existence_state': 'NOT_CHECKED',
                          'source_ids': []}],
            'jurisdictions': [{'jurisdiction_id': jurisdiction, 'name': 'Synthetic jurisdiction',
                               'kind': 'NATIONAL', 'official_code': None, 'source_ids': []}],
            'sources': [{'source_id': source, 'official_url': 'https://example.invalid/test-source',
                         'publisher': 'Synthetic fixture', 'retrieved_at': '2026-10-17T00:00:00+03:00',
                         'content_sha256': None, 'verification_state': 'RETRIEVED'}],
            'instruments': [], 'articles': [], 'article_versions': [], 'assessments': [], 'assets': []}
        for i in range(2):
            instrument = identifier('instrument')
            self.catalog['instruments'].append({
                'instrument_id': instrument, 'issuer_entity_id': entity,
                'title': 'Synthetic bylaw ' + str(i), 'kind': 'BYLAW',
                'jurisdiction_ids': [jurisdiction], 'official_identifier': None,
                'source_ids': [source]})
            for j in range(2):
                article = identifier('article')
                self.catalog['articles'].append({'article_id': article,
                                                 'instrument_id': instrument,
                                                 'article_locator': str(j + 1)})
                previous = None
                for k in range(2):
                    version = identifier('version')
                    self.catalog['article_versions'].append({
                        'version_id': version, 'article_id': article,
                        'text': 'Synthetic article version ' + str(k), 'language': 'ar',
                        'enacted_on': None, 'valid_from': None, 'valid_to': None,
                        'source_ids': [source], 'supersedes_version_id': previous,
                        'text_verification_state': 'UNVERIFIED',
                        'source_locator': 'Synthetic page ' + str(j + 1),
                        'effective_date_verification_state': 'DATE_UNKNOWN'})
                    previous = version

    def assert_rejected(self, value):
        self.assertTrue(list(self.validator.iter_errors(value)))

    def test_schema_is_valid_draft_07(self):
        Draft7Validator.check_schema(self.schema)

    def test_multiple_instruments_articles_and_versions_are_retained(self):
        self.validator.validate(self.catalog)
        self.assertEqual(len(self.catalog['instruments']), 2)
        self.assertEqual(len(self.catalog['articles']), 4)
        self.assertEqual(len(self.catalog['article_versions']), 8)
        self.assertEqual(len({x['version_id'] for x in self.catalog['article_versions']}), 8)

    def test_article_without_text_is_rejected(self):
        del self.catalog['article_versions'][0]['text']
        self.assert_rejected(self.catalog)

    def test_internal_entity_id_cannot_be_replaced_by_a_cr_label(self):
        self.catalog['entities'][0]['entity_id'] = 'CR:synthetic'
        self.assert_rejected(self.catalog)

    def test_official_source_state_requires_digest(self):
        self.catalog['sources'][0]['verification_state'] = 'OFFICIAL_SOURCE_REVIEWED'
        self.assert_rejected(self.catalog)

    def test_unretrieved_source_allows_null_time_but_retrieved_does_not(self):
        source = self.catalog['sources'][0]
        source['retrieved_at'] = None
        source['verification_state'] = 'NOT_CHECKED'
        self.validator.validate(self.catalog)
        source['verification_state'] = 'RETRIEVED'
        self.assert_rejected(self.catalog)

    def test_verified_effective_date_cannot_be_unknown(self):
        self.catalog['article_versions'][0]['effective_date_verification_state'] = 'OFFICIAL_DATE_REVIEWED'
        self.assert_rejected(self.catalog)

    def test_qualified_review_requires_human_reviewer_and_evidence(self):
        assessment = {
            'assessment_id': identifier('assessment'),
            'version_id': self.catalog['article_versions'][0]['version_id'],
            'jurisdiction_ids': [self.catalog['jurisdictions'][0]['jurisdiction_id']],
            'assessment_date': '2026-10-17', 'legal_scope_notes': 'Synthetic scope',
            'treaty_declarations_considered': False, 'shariah_references': [],
            'review_state': 'QUALIFIED_REVIEW_RECORDED', 'reviewer_reference': None,
            'reviewed_at': None, 'reasoned_conclusion': None,
            'review_evidence_source_ids': [], 'assessment_type': 'SHARIAH_REVIEW',
            'reviewer_kind': None}
        self.catalog['assessments'] = [assessment]
        self.assert_rejected(self.catalog)

    def test_assessment_type_keeps_legal_and_shariah_records_distinct(self):
        base = {
            'assessment_id': identifier('assessment'),
            'version_id': self.catalog['article_versions'][0]['version_id'],
            'jurisdiction_ids': [self.catalog['jurisdictions'][0]['jurisdiction_id']],
            'assessment_date': '2026-10-17', 'legal_scope_notes': 'Synthetic scope',
            'treaty_declarations_considered': False, 'shariah_references': [],
            'review_state': 'PENDING_QUALIFIED_REVIEW', 'reviewer_reference': None,
            'reviewed_at': None, 'reasoned_conclusion': None,
            'review_evidence_source_ids': [], 'assessment_type': 'LEGAL_APPLICABILITY',
            'reviewer_kind': None}
        other = copy.deepcopy(base)
        other.update(assessment_id=identifier('assessment'), assessment_type='SHARIAH_REVIEW')
        self.catalog['assessments'] = [base, other]
        self.validator.validate(self.catalog)
        self.assertEqual({x['assessment_type'] for x in self.catalog['assessments']},
                         {'LEGAL_APPLICABILITY', 'SHARIAH_REVIEW'})


if __name__ == '__main__':
    unittest.main()
