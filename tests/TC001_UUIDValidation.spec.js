const { test, expect } = require('@playwright/test');

test('mock UUID validation API without hitting the actual API', async ({ page }) => {

  // Intercept the request to the UUID validation API
  await page.route('https://supremetechnologies.us/api/validate-uuid', async (route, request) => {

    // Check if it's a POST request we want to mock
    if (request.method() === 'POST') {
      const requestBody = JSON.parse(await request.postData());
      console.log('Request Body:', requestBody);

      // Mock Response data
      const mockResponse = {
        status: 200,
        body: {
          valid: true,
          testMessage: 'Mocked response',
          serverVersion: 'apache/2.2.22',
          connection: 'keep-alive'
        },
      };

      // Fulfill the request with the mock response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    } else {
      await route.continue();
    }
  });

  // Simulate making the API request
  const response = await page.evaluate(() => {
    const url = 'https://supremetechnologies.us/api/validate-uuid';
    const requestData = { uuid: 'a7b784c3-0df5-4a9b-a162-bef6a0ea2f2c_test_st_qa' };

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    }).then(response => response.json());
  });

  // mocked response
  console.log('Response:', response);

  await expect(response.status).toEqual(200);

});
