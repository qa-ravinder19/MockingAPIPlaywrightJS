const { test, expect } = require('@playwright/test');

test('mock invalid token for auth profile API', async ({ page }) => {

  // Intercept the GET request
  await page.route('https://supremetechnologies.us/api/v1/auth/profile', async (route, request) => {

    // Check if the Authorization header is present and it includes "Bearer"
    const authorizationHeader = request.headers()['authorization'];
    console.log('Authorization header:', authorizationHeader);

    const mockResponse = {
      status: 401,
      body: {
        message: 'invalid or expired token mock',
        testMessage: 'Mocked response',
        serverVersion: 'apache/2.2.10',
        connection: 'keep-alive'
      },
    };

    // If token is invalid, respond with the mock response
    if (authorizationHeader && authorizationHeader.startsWith('Bearer')) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify(mockResponse),
      });
    }
  });

  // Simulate making the GET request to the API with an invalid token using fetch
  const response = await page.evaluate(async () => {
    const url = 'https://supremetechnologies.us/api/v1/auth/profile';

    // Simulate an invalid token
    const invalidToken = 'Bearer invalid_token_dfasflsjdflksjafslf';

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': invalidToken },
      });

      const data = await res.json();
      return data;  // Return the mocked response
    } catch (error) {
      return { error: 'Request failed' };
    }
  });

  // mocked response
  console.log('Response:', response);

  // Assert that the response is the expected "invalid token" message
   expect(response.body.message).toContain('invalid or expired token mock');
});
