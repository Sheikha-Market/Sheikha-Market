const {
  createKnowledgeLakeV2
} = require('../../runtime/knowledge-lake-v2/sheikha-knowledge-lake-v2');

describe('Sheikha Knowledge Lake V2', () => {
  test('creates governed knowledge lake', () => {
    const lake = createKnowledgeLakeV2();

    expect(lake.status).toBe('ACTIVE');
    expect(lake.stores).toContain('warnings');
    expect(lake.stores).toContain('evidence');
    expect(lake.principle).toBe('NO_KNOWLEDGE_LOSS');
    expect(lake.governedAccess).toBe(true);
  });
});
