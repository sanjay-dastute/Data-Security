const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
  },
  env: {
    apiUrl: 'http://localhost:8000/api',
    testUserEmail: 'test@example.com',
    testUserPassword: 'Password123!',
    testOrgAdminEmail: 'orgadmin@example.com',
    testOrgAdminPassword: 'Password123!',
    testAdminEmail: 'admin@example.com',
    testAdminPassword: 'Password123!',
  },
});
