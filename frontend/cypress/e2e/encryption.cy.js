describe('Encryption Features', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should navigate to file encryption page', () => {
    cy.contains('File Encryption').click();
    cy.url().should('include', '/dashboard/encryption');
    cy.contains('Encrypt Files').should('be.visible');
  });

  it('should upload and encrypt a file', () => {
    cy.contains('File Encryption').click();
    
    // Create a test file
    cy.fixture('example.json', 'utf8').then((content) => {
      cy.get('input[type="file"]').attachFile({
        fileContent: content,
        fileName: 'test-file.json',
        mimeType: 'application/json',
      });
    });
    
    // Select encryption fields
    cy.contains('Select Fields').should('be.visible');
    cy.get('[data-testid="field-checkbox"]').first().check();
    
    // Encrypt the file
    cy.contains('Encrypt').click();
    
    // Verify encryption success
    cy.contains('File encrypted successfully').should('be.visible');
    cy.contains('Download Encrypted File').should('be.visible');
  });

  it('should generate and manage encryption keys', () => {
    cy.contains('Key Management').click();
    cy.url().should('include', '/dashboard/keys');
    
    // Generate a new key
    cy.contains('Generate New Key').click();
    cy.get('input[name="keyName"]').type('Test Key');
    cy.get('select[name="keyType"]').select('encryption');
    cy.contains('Generate').click();
    
    // Verify key creation
    cy.contains('Key generated successfully').should('be.visible');
    cy.contains('Test Key').should('be.visible');
  });

  it('should configure key rotation', () => {
    cy.contains('Key Management').click();
    cy.url().should('include', '/dashboard/keys');
    
    // Find the key and open rotation settings
    cy.contains('Test Key').parent().contains('Rotation Settings').click();
    
    // Configure rotation
    cy.get('input[name="rotationInterval"]').clear().type('30');
    cy.contains('Save Settings').click();
    
    // Verify settings saved
    cy.contains('Rotation settings updated').should('be.visible');
  });
});
