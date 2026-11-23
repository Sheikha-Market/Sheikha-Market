const express = require('express');
const router = express.Router();

router.get('/google-workspace-enterprise', (req, res) => {
    const configValue = (name) => String(process.env[name] || '').trim();
    const isConfigured = (value) => Boolean(value) &&
        !/^(?:REPLACE_WITH_|YOUR_|CHANGEME|PLACEHOLDER|<|\*+$)/i.test(value);
    const oauthClientConfigured = isConfigured(configValue('GOOGLE_CLIENT_ID')) &&
        isConfigured(configValue('GOOGLE_CLIENT_SECRET'));
    const redirectConfigured = isConfigured(configValue('GOOGLE_REDIRECT_URI'));
    const oauthConfigured = oauthClientConfigured && redirectConfigured;

    res.json({
        status: oauthConfigured ? 'CONFIGURED_NOT_VERIFIED' : 'NOT_CONFIGURED',
        integrationActive: false,
        subscriptionVerified: false,
        seal: 'BOUND_BY_QURAN_SUNNAH',
        checks: {
            oauthClientConfigured,
            redirectConfigured,
            workspaceDomainConfigured: isConfigured(configValue('GOOGLE_WORKSPACE_DOMAIN')),
            liveAccountVerification: false,
            driveApiConnected: false,
            gmailApiConnected: false,
            calendarApiConnected: false,
            adminSdkConnected: false
        }
    });
});

module.exports = router;
