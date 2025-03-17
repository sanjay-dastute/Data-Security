// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Import cypress file upload plugin
import 'cypress-file-upload';

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Create a test file with specific content
Cypress.Commands.add('createTestFile', (fileName, content) => {
  cy.writeFile(`cypress/fixtures/${fileName}`, content);
});

// Navigate to a specific dashboard section
Cypress.Commands.add('navigateToDashboardSection', (section) => {
  cy.get(`[data-testid="nav-${section}"]`).click();
  cy.url().should('include', `/dashboard/${section}`);
});

// Check if an element is visible in the viewport
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const bottom = Cypress.$(cy.state('window')).height();
  const rect = subject[0].getBoundingClientRect();
  
  expect(rect.top).to.be.lessThan(bottom);
  expect(rect.bottom).to.be.greaterThan(0);
  
  return subject;
});

// API request with authentication
Cypress.Commands.add('authenticatedRequest', (method, url, body) => {
  const token = localStorage.getItem('token');
  
  return cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${url}`,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
});
