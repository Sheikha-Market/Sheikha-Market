'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class GeminiContextBridge {
    constructor(options = {}) {
        this.rootDir = options.rootDir || process.cwd();
        this.dataDir = options.dataDir || path.join(this.rootDir, 'data');
        this.reportsDir = options.reportsDir || path.join(this.rootDir, 'reports');
        this.operatorEmail = options.operatorEmail || 'market@sheikha.top';
        this.projectId = options.projectId || 'sheikha-marketplace';
        this.storageDir = path.join(this.dataDir, 'ai-memory');
        this.conversationsFile = path.join(this.storageDir, 'conversations.json');
        this.knowledgeFile = path.join(this.storageDir, 'knowledge.json');
        this.handoffsFile = path.join(this.storageDir, 'gemini-handoffs.json');
        this._ensureStorage();
    }

    _ensureStorage() {
        fs.mkdirSync(this.storageDir, { recursive: true });
        fs.mkdirSync(this.reportsDir, { recursive: true });
        this._ensureJsonFile(this.conversationsFile, []);
        this._ensureJsonFile(this.knowledgeFile, []);
        this._ensureJsonFile(this.handoffsFile, []);
    }

    _ensureJsonFile(filePath, fallbackValue) {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(fallbackValue, null, 2), 'utf8');
        }
    }

    _readJson(filePath, fallbackValue) {
        try {
            if (!fs.existsSync(filePath)) {
                return fallbackValue;
            }
            const raw = fs.readFileSync(filePath, 'utf8');
            return raw.trim() ? JSON.parse(raw) : fallbackValue;
        } catch (_) {
            return fallbackValue;
        }
    }

    _writeJson(filePath, value) {
        fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8');
        return value;
    }

    getConversations() {
        return this._readJson(this.conversationsFile, []);
    }

    saveConversations(conversations) {
        const normalized = Array.isArray(conversations) ? conversations.slice(-5000) : [];
        return this._writeJson(this.conversationsFile, normalized);
    }

    appendConversation(conversation) {
        const conversations = this.getConversations();
        conversations.push(conversation);
        return this.saveConversations(conversations);
    }

    getKnowledge() {
        return this._readJson(this.knowledgeFile, []);
    }

    saveKnowledge(knowledge) {
        const normalized = Array.isArray(knowledge) ? knowledge.slice(-5000) : [];
        return this._writeJson(this.knowledgeFile, normalized);
    }

    appendKnowledge(entry) {
        const knowledge = this.getKnowledge();
        knowledge.push(entry);
        return this.saveKnowledge(knowledge);
    }

    getHandoffs() {
        return this._readJson(this.handoffsFile, []);
    }

    saveHandoffs(handoffs) {
        const normalized = Array.isArray(handoffs) ? handoffs.slice(-500) : [];
        return this._writeJson(this.handoffsFile, normalized);
    }

    getLatestHandoff() {
        const handoffs = this.getHandoffs();
        return handoffs.length ? handoffs[handoffs.length - 1] : null;
    }

    _extractSummary(conversations) {
        const totals = { user: 0, assistant: 0, system: 0 };
        const recentTopics = [];

        conversations.forEach(item => {
            const role = item.role || 'system';
            if (!totals[role] && totals[role] !== 0) {
                totals[role] = 0;
            }
            totals[role]++;

            const text = String(item.content || '').trim();
            if (text) {
                recentTopics.push(text.substring(0, 140));
            }
        });

        return {
            totals,
            recentTopics: recentTopics.slice(-8)
        };
    }

    createGeminiPrompt(options = {}) {
        const includeMessages =
            Number(options.includeMessages) > 0 ? Number(options.includeMessages) : 20;
        const includeKnowledge =
            Number(options.includeKnowledge) > 0 ? Number(options.includeKnowledge) : 10;
        const conversations = this.getConversations().slice(-includeMessages);
        const knowledge = this.getKnowledge().slice(-includeKnowledge);
        const summary = this._extractSummary(conversations);

        const conversationBlock = conversations
            .map(item => {
                return `- ${item.role || 'system'} | ${item.timestamp || new Date().toISOString()} | ${String(
                    item.content || ''
                )
                    .replace(/\s+/g, ' ')
                    .trim()}`;
            })
            .join('\n');

        const knowledgeBlock = knowledge
            .map(item => {
                const label = item.topic || item.category || item.source || 'memory';
                return `- ${label}: ${String(item.content || '')
                    .replace(/\s+/g, ' ')
                    .trim()}`;
            })
            .join('\n');

        const prompt = [
            'Secure Sheikha Context Handoff',
            `Project: ${this.projectId}`,
            `Operator: ${this.operatorEmail}`,
            'Instruction: Use this as carry-forward context only after explicit user request. Preserve privacy and do not assume unseen external chat history.',
            '',
            'Conversation summary:',
            `- user messages: ${summary.totals.user || 0}`,
            `- assistant messages: ${summary.totals.assistant || 0}`,
            `- recent topics: ${(summary.recentTopics || []).join(' | ') || 'N/A'}`,
            '',
            'Recent messages:',
            conversationBlock || '- No stored messages',
            '',
            'Relevant knowledge:',
            knowledgeBlock || '- No stored knowledge'
        ].join('\n');

        return {
            prompt,
            summary,
            conversations,
            knowledge
        };
    }

    createHandoffReport(options = {}) {
        const now = new Date();
        const requestedBy = options.requestedBy || this.operatorEmail;
        const promptBundle = this.createGeminiPrompt(options);
        const id = `GEMCTX-${Date.now()}`;
        const payload = {
            id,
            createdAt: now.toISOString(),
            requestedBy,
            projectId: this.projectId,
            operatorEmail: this.operatorEmail,
            deliveryMode: options.deliveryMode || 'on-demand-report',
            conversationId: options.conversationId || null,
            includeMessages: promptBundle.conversations.length,
            includeKnowledge: promptBundle.knowledge.length,
            summary: promptBundle.summary,
            latestConversationAt: promptBundle.conversations.length
                ? promptBundle.conversations[promptBundle.conversations.length - 1].timestamp ||
                  null
                : null,
            geminiPrompt: promptBundle.prompt,
            privacy: {
                externalAutoSync: false,
                onDemandOnly: true,
                localStorageOnly: true
            }
        };

        payload.integrity = crypto
            .createHash('sha256')
            .update(JSON.stringify(payload))
            .digest('hex');

        const stamp = now.toISOString().replace(/[.:]/g, '-');
        const jsonFileName = `gemini-context-report-${stamp}.json`;
        const mdFileName = `gemini-context-report-${stamp}.md`;
        const jsonPath = path.join(this.reportsDir, jsonFileName);
        const mdPath = path.join(this.reportsDir, mdFileName);

        const md = [
            '# Gemini Secure Context Report',
            '',
            `- ID: ${payload.id}`,
            `- Created At: ${payload.createdAt}`,
            `- Project: ${payload.projectId}`,
            `- Requested By: ${payload.requestedBy}`,
            `- Operator: ${payload.operatorEmail}`,
            `- Integrity: ${payload.integrity}`,
            `- Delivery Mode: ${payload.deliveryMode}`,
            '',
            '## Security Model',
            '- External auto-sync: disabled',
            '- On-demand export only: enabled',
            '- Local storage only: enabled',
            '',
            '## Summary',
            `- User messages: ${payload.summary.totals.user || 0}`,
            `- Assistant messages: ${payload.summary.totals.assistant || 0}`,
            `- Recent topics: ${(payload.summary.recentTopics || []).join(' | ') || 'N/A'}`,
            '',
            '## Prompt For Gemini',
            '',
            payload.geminiPrompt
        ].join('\n');

        fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
        fs.writeFileSync(mdPath, md, 'utf8');

        const enriched = {
            ...payload,
            files: {
                json: jsonPath,
                markdown: mdPath
            }
        };

        if (options.persist !== false) {
            const handoffs = this.getHandoffs();
            handoffs.push(enriched);
            this.saveHandoffs(handoffs);
        }

        return enriched;
    }
}

module.exports = GeminiContextBridge;
