const { test, expect } = require('@playwright/test');

test('API health endpoint responds with ok', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:8080/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body.status).toBe('ok');
});
