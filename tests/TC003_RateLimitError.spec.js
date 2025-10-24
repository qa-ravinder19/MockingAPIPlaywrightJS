const { test, expect } = require('@playwright/test');
const assert = require('assert');
const { AssertionError } = require('assert');

test('mock API without hitting the actual API - Rate limit', async ({ page }) => {

    // Intercept the request to the UUID validation API
    await page.route('https://supremetechnologies.us/api/validate-uuid', async (route, request) => {

        
            // You can inspect the request body here
            const requestBody = JSON.parse(await request.postData());
            console.log('Request Body:', requestBody);

            // Mock Response data with the "too many request" message
            const mockResponse = {
                status: 429,
                message: 'too many request',
                body:  {
                    message: 'too many request mocked',
                    testMessage: 'Mocked response',
                    serverVersion: 'apache/2.2.10',
                    connection: 'keep-alive'
                },
            };

            // Fulfill the request with the mock response
            await route.fulfill({
                status: 429, 
                contentType: 'application/json',
                body: JSON.stringify(mockResponse),
            });        
    });

    // Simulate making the API request
    const response = await page.evaluate(() => {
        const url = 'https://supremetechnologies.us/api/validate-uuid';
        const requestData = { uuid: 'a7b784c3-0df5-4a9b-a162-bef6a0ea2f2c-test-st-qa' };

        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData),
        }).then(response => response.json());
    });

    // mocked response
    console.log('Response:', response);

    await expect(response.status).toEqual(429);
});
