class RollbackSnapshot {
  constructor() {
    this.snapshots = [];
  }

  async create(label = 'runtime') {
    const snapshot = {
      id: `${label}-${Date.now()}`,
      label,
      createdAt: new Date().toISOString()
    };

    this.snapshots.push(snapshot);
    return snapshot;
  }

  async rollback(snapshot) {
    if (!snapshot || !snapshot.id) {
      throw new Error('Valid snapshot is required for rollback');
    }

    return {
      rolledBack: true,
      snapshotId: snapshot.id,
      timestamp: new Date().toISOString()
    };
  }

  list() {
    return [...this.snapshots];
  }
}

module.exports = { RollbackSnapshot };
