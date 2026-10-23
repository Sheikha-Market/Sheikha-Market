'use strict';
const { createFederationStore } = require('../../core/industrial/sheikha-industrial-federation-v1.cjs');
const { createFederationArchive } = require('../../core/industrial/sheikha-industrial-archive-v1.cjs');
const { createFederationReviews } = require('../../core/industrial/sheikha-industrial-review-v1.cjs');
const { createFederationImprovements } = require('../../core/industrial/sheikha-industrial-improvement-v1.cjs');
const { createFederationComparisons } = require('../../core/industrial/sheikha-industrial-comparison-v1.cjs');
const { createFederationLineage } = require('../../core/industrial/sheikha-industrial-lineage-v1.cjs');

function attachIndustrialFederation(app, api, token, options = {}) {
  const store = createFederationStore();
  const archive = createFederationArchive(options.archive);
  const reviews = createFederationReviews({ ...options.reviews, archive });
  const improvements = createFederationImprovements({ store, archive, reviews });
  const comparisons = createFederationComparisons({ archive });
  const lineage = createFederationLineage({ archive });
  const root = `${api}/industry/simulations`;
  const archiveRoot = `${api}/industry/archives`;
  const derivationRoot = `${api}/industry/derivations`;
  app.use([root, archiveRoot, derivationRoot], (req, res, next) => {
    if (req.headers['x-sheikha-session'] !== token) return res.status(403).json({ error: 'SESSION_REQUIRED' });
    next();
  });
  const respond = fn => (req, res) => {
    try { res.json(fn(req)); }
    catch (error) {
      const statuses = { SIMULATION_INPUT_REJECTED: 400, SIMULATION_NOT_FOUND: 404,
        SIMULATION_REVISION_CONFLICT: 409, SIMULATION_STATE_CONFLICT: 409, SIMULATION_CAPACITY_LIMIT: 429,
        ARCHIVE_INPUT_REJECTED: 400, ARCHIVE_NOT_FOUND: 404, ARCHIVE_RECORD_REJECTED: 422,
        ARCHIVE_BUSY: 409, ARCHIVE_CAPACITY_LIMIT: 429, ARCHIVE_UNAVAILABLE: 503,
        REVIEW_INPUT_REJECTED: 400, REVIEW_RECORD_REJECTED: 422, REVIEW_UNAVAILABLE: 503,
        REVIEW_BUSY: 409, REVIEW_CAPACITY_LIMIT: 429, REVIEW_REVISION_CONFLICT: 409,
        REVIEW_REQUEST_CONFLICT: 409, REVIEW_STATE_CONFLICT: 409,
        DERIVATION_INPUT_REJECTED: 400, DERIVATION_NOT_FOUND: 404, DERIVATION_EXPIRED: 410,
        DERIVATION_REQUEST_CONFLICT: 409, DERIVATION_REVIEW_CONFLICT: 409, DERIVATION_REQUEST_CLOSED: 409,
        DERIVATION_CAPACITY_LIMIT: 429,
        COMPARISON_INPUT_REJECTED: 400, COMPARISON_SOURCE_REQUIRED: 409, COMPARISON_SOURCE_NOT_FOUND: 404,
        COMPARISON_LINEAGE_MISMATCH: 422, COMPARISON_EVIDENCE_REJECTED: 422,
        LINEAGE_INPUT_REJECTED: 400, LINEAGE_CAPACITY_LIMIT: 429 };
      const status = statuses[error.message];
      res.status(status || 500).json({ error: status ? error.message : 'SIMULATION_UNAVAILABLE' });
    }
  };
  app.post(root, respond(req => store.create(req.body)));
  app.get(`${root}/:id`, respond(req => store.read(req.params.id)));
  app.post(`${root}/:id/actions`, respond(req => store.act(req.params.id, req.body)));
  app.post(`${root}/:id/discard`, respond(req => store.discard(req.params.id, req.body)));
  app.post(`${root}/:id/archive`, respond(req => {
    if (!req.body || Object.keys(req.body).join(',') !== 'expectedRevision'
      || !Number.isSafeInteger(req.body.expectedRevision)) throw Error('ARCHIVE_INPUT_REJECTED');
    const snapshot = store.read(req.params.id);
    if (snapshot.revision !== req.body.expectedRevision) throw Error('SIMULATION_REVISION_CONFLICT');
    return archive.save(snapshot);
  }));
  app.get(archiveRoot, respond(() => archive.list()));
  app.get(`${archiveRoot}/lineage`, respond(req => {
    if (Object.keys(req.query).length) throw Error('LINEAGE_INPUT_REJECTED');
    return lineage.read();
  }));
  app.get(`${archiveRoot}/:id`, respond(req => archive.read(req.params.id)));
  app.get(`${archiveRoot}/:id/comparison`, respond(req => {
    if (Object.keys(req.query).length) throw Error('COMPARISON_INPUT_REJECTED');
    return comparisons.read(req.params.id);
  }));
  app.get(`${archiveRoot}/:id/reviews`, respond(req => reviews.read(req.params.id)));
  app.post(`${archiveRoot}/:id/reviews`, respond(req => reviews.append(req.params.id, req.body)));
  app.post(`${archiveRoot}/:id/derive`, respond(req => improvements.derive(req.params.id, req.body)));
  app.get(`${derivationRoot}/:requestId`, respond(req => improvements.read(req.params.requestId)));
}
module.exports = { attachIndustrialFederation };
