describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.contains('Sign in to your account');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should display registration page', () => {
    cy.visit('/register');
    cy.contains('Create an account');
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="confirmPassword"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should show error for invalid login', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid email or password').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome').should('be.visible');
  });

  it('should logout successfully', () => {
    // Login first
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Then logout
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Logout').click();
    cy.url().should('include', '/login');
  });
});
