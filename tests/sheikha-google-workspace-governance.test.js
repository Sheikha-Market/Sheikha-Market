'use strict';

const express = require('express');
const { once } = require('node:events');
const workspaceRouter = require('../routes/sheikha-workspace');

const OAUTH_KEYS = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
    'GOOGLE_WORKSPACE_DOMAIN'
];

describe('Google Workspace integration governance', () => {
    let server;
    let baseUrl;
    let previousEnvironment;

    beforeAll(async () => {
        previousEnvironment = Object.fromEntries(
            OAUTH_KEYS.map((key) => [key, process.env[key]])
        );
        OAUTH_KEYS.forEach((key) => delete process.env[key]);

        const app = express();
        app.use('/api/sheikha-unified', workspaceRouter);
        server = app.listen(0, '127.0.0.1');
        await once(server, 'listening');
        baseUrl = `http://127.0.0.1:${server.address().port}`;
    });

    afterAll(async () => {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
        OAUTH_KEYS.forEach((key) => {
            if (previousEnvironment[key] === undefined) delete process.env[key];
            else process.env[key] = previousEnvironment[key];
        });
    });

    async function readWorkspaceStatus() {
        const response = await fetch(
            `${baseUrl}/api/sheikha-unified/google-workspace-enterprise`
        );
        return { response, body: await response.json() };
    }

    test('does not claim an active subscription when OAuth is absent', async () => {
        const { response, body } = await readWorkspaceStatus();

        expect(response.status).toBe(200);
        expect(body.status).toBe('NOT_CONFIGURED');
        expect(body.integrationActive).toBe(false);
        expect(body.subscriptionVerified).toBe(false);
        expect(body.checks.driveApiConnected).toBe(false);
        expect(body.checks.gmailApiConnected).toBe(false);
        expect(body.checks.calendarApiConnected).toBe(false);
        expect(body.checks.adminSdkConnected).toBe(false);
        expect(body).not.toHaveProperty('license');
    });

    test('rejects placeholder OAuth values and requires a redirect URI', async () => {
        process.env.GOOGLE_CLIENT_ID = 'REPLACE_WITH_CLIENT_ID';
        process.env.GOOGLE_CLIENT_SECRET = 'REPLACE_WITH_CLIENT_SECRET';

        const { body } = await readWorkspaceStatus();

        expect(body.status).toBe('NOT_CONFIGURED');
        expect(body.checks.oauthClientConfigured).toBe(false);
        expect(body.checks.redirectConfigured).toBe(false);
    });

    test('configured OAuth remains unverified until live APIs are tested', async () => {
        process.env.GOOGLE_CLIENT_ID = 'synthetic-client-id';
        process.env.GOOGLE_CLIENT_SECRET = 'synthetic-client-secret';
        process.env.GOOGLE_REDIRECT_URI = 'http://127.0.0.1/callback';

        const { body } = await readWorkspaceStatus();

        expect(body.status).toBe('CONFIGURED_NOT_VERIFIED');
        expect(body.subscriptionVerified).toBe(false);
        expect(body.checks.liveAccountVerification).toBe(false);
        expect(JSON.stringify(body)).not.toContain('synthetic-client-secret');
    });
});