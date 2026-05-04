/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * بسم الله الرحمن الرحيم
 * ═══════════════════════════════════════════════════════════════════════════════
 * SynapticRouter — موجّه الإشارات بين عقد الشبكة العصبية
 * يُوجّه البيانات من عقدة إلى أخرى بأفضل مسار وبدون ضرر
 *
 * "وَجَعَلْنَا بَيْنَهُمْ وَبَيْنَ الْقُرَى الَّتِي بَارَكْنَا فِيهَا قُرًى ظَاهِرَةً"
 * — سبأ ١٨: المسارات الظاهرة الواضحة بين العقد
 * ═══════════════════════════════════════════════════════════════════════════════
 */
'use strict';

const ROUTING_STRATEGIES = Object.freeze({
    DIRECT:      'direct',      // التوجيه المباشر
    BROADCAST:   'broadcast',   // البثّ لجميع العقد
    SHORTEST:    'shortest',    // أقصر مسار (BFS)
    WEIGHTED:    'weighted',    // أعلى وزن شرعي
    ROUND_ROBIN: 'round-robin'  // توزيع دوري
});

class SynapticRouter {
    /**
     * @param {NeuralNetwork} network - مرجع للشبكة العصبية
     */
    constructor(network) {
        this._network    = network;
        this._routeLog   = [];
        this._rrCounters = {};  // round-robin counters
    }

    // ── التوجيه ───────────────────────────────────────────────────────────────

    /**
     * توجيه إشارة من عقدة إلى هدف
     * @param {string}   sourceId   - معرّف العقدة المرسِلة
     * @param {string}   targetId   - معرّف العقدة الهدف (أو '*' للبث)
     * @param {*}        signal     - الإشارة
     * @param {string}   [strategy] - استراتيجية التوجيه
     * @returns {Promise<RoutingResult>}
     */
    async route(sourceId, targetId, signal, strategy = ROUTING_STRATEGIES.DIRECT) {
        const source = this._network.getNode(sourceId);
        if (!source) {
            return this._fail(sourceId, targetId, `لم يُعثر على العقدة المرسِلة "${sourceId}"`);
        }
        if (!source.isActive()) {
            return this._fail(sourceId, targetId, `العقدة "${sourceId}" غير نشطة`);
        }

        let result;
        switch (strategy) {
            case ROUTING_STRATEGIES.BROADCAST:
                result = await this._broadcast(source, signal);
                break;
            case ROUTING_STRATEGIES.SHORTEST:
                result = await this._routeShortest(source, targetId, signal);
                break;
            case ROUTING_STRATEGIES.WEIGHTED:
                result = await this._routeWeighted(source, signal);
                break;
            case ROUTING_STRATEGIES.ROUND_ROBIN:
                result = await this._routeRoundRobin(source, signal);
                break;
            default:
                result = await this._routeDirect(source, targetId, signal);
        }

        this._log(sourceId, targetId, strategy, result.success);
        return result;
    }

    // ── الاستراتيجيات ─────────────────────────────────────────────────────────

    async _routeDirect(source, targetId, signal) {
        const target = this._network.getNode(targetId);
        if (!target) return this._fail(source.id, targetId, `لم يُعثر على الهدف "${targetId}"`);
        if (!target.isActive()) return this._fail(source.id, targetId, `الهدف "${targetId}" غير نشط`);

        const output = target.process(signal, this._network.activationFn);
        return this._ok(source.id, targetId, output, [targetId]);
    }

    async _broadcast(source, signal) {
        const targets = [...this._network.nodes.values()].filter(
            n => n.id !== source.id && n.isActive()
        );
        const outputs = targets.map(t => ({
            nodeId: t.id,
            output: t.process(signal, this._network.activationFn)
        }));
        return this._ok(source.id, '*', outputs, targets.map(t => t.id));
    }

    async _routeShortest(source, targetId, signal) {
        const path = this._bfs(source.id, targetId);
        if (!path) return this._fail(source.id, targetId, `لا يوجد مسار من "${source.id}" إلى "${targetId}"`);

        let current = signal;
        for (let i = 1; i < path.length; i++) {
            const node = this._network.getNode(path[i]);
            if (!node || !node.isActive()) break;
            current = node.process(current, this._network.activationFn);
        }
        return this._ok(source.id, targetId, current, path);
    }

    async _routeWeighted(source, signal) {
        // اختر العقدة المتصلة بأعلى وزن شرعي
        const candidates = [...source.connections.entries()]
            .map(([id, conn]) => ({ id, connWeight: conn.weight, node: this._network.getNode(id) }))
            .filter(c => c.node && c.node.isActive())
            .sort((a, b) => (b.node.weight * b.connWeight) - (a.node.weight * a.connWeight));

        if (candidates.length === 0) {
            return this._fail(source.id, null, 'لا توجد عقد متصلة نشطة');
        }

        const best   = candidates[0];
        const output = best.node.process(signal, this._network.activationFn);
        return this._ok(source.id, best.id, output, [source.id, best.id]);
    }

    async _routeRoundRobin(source, signal) {
        const active = [...source.connections.keys()]
            .map(id => this._network.getNode(id))
            .filter(n => n && n.isActive());

        if (active.length === 0) {
            return this._fail(source.id, null, 'لا توجد عقد متصلة نشطة');
        }

        const counter = (this._rrCounters[source.id] || 0) % active.length;
        this._rrCounters[source.id] = counter + 1;

        const target = active[counter];
        const output = target.process(signal, this._network.activationFn);
        return this._ok(source.id, target.id, output, [source.id, target.id]);
    }

    // ── BFS لإيجاد أقصر مسار ─────────────────────────────────────────────────

    _bfs(startId, endId) {
        if (startId === endId) return [startId];

        const visited = new Set([startId]);
        const queue   = [[startId]];

        while (queue.length > 0) {
            const path = queue.shift();
            const curr = path[path.length - 1];
            const node = this._network.getNode(curr);
            if (!node) continue;

            for (const nextId of node.connections.keys()) {
                if (visited.has(nextId)) continue;
                const newPath = [...path, nextId];
                if (nextId === endId) return newPath;
                visited.add(nextId);
                queue.push(newPath);
            }
        }
        return null;
    }

    // ── المساعدات ─────────────────────────────────────────────────────────────

    _ok(sourceId, targetId, output, path) {
        return { success: true, sourceId, targetId, output, path, routedAt: new Date().toISOString() };
    }

    _fail(sourceId, targetId, reason) {
        return { success: false, sourceId, targetId, output: null, path: [], reason, routedAt: new Date().toISOString() };
    }

    _log(sourceId, targetId, strategy, success) {
        this._routeLog.push({ sourceId, targetId, strategy, success, at: new Date().toISOString() });
        if (this._routeLog.length > 200) this._routeLog.shift();
    }

    getLog()   { return [...this._routeLog]; }
    clearLog() { this._routeLog = []; }
}

SynapticRouter.STRATEGIES = ROUTING_STRATEGIES;

module.exports = SynapticRouter;
