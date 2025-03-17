describe('Advanced Features', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[name="email"]').type(Cypress.env('testAdminEmail'));
    cy.get('input[name="password"]').type(Cypress.env('testAdminPassword'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should configure HSM integration', () => {
    cy.contains('Advanced Features').click();
    cy.contains('HSM Integration').click();
    
    // Configure HSM
    cy.get('select[name="hsmProvider"]').select('AWS CloudHSM');
    cy.get('input[name="hsmEndpoint"]').type('hsm.example.com');
    cy.get('input[name="hsmPartition"]').type('partition1');
    cy.get('input[name="hsmUsername"]').type('hsmuser');
    cy.get('input[name="hsmPassword"]').type('hsmpassword');
    cy.contains('Test Connection').click();
    
    // Verify connection test
    cy.contains('Connection successful').should('be.visible');
    
    // Save configuration
    cy.contains('Save Configuration').click();
    cy.contains('HSM configuration saved').should('be.visible');
  });

  it('should configure key recovery', () => {
    cy.contains('Advanced Features').click();
    cy.contains('Key Recovery').click();
    
    // Configure key recovery
    cy.contains('Configure Key Recovery').click();
    cy.get('input[name="threshold"]').clear().type('3');
    cy.get('input[name="totalShards"]').clear().type('5');
    
    // Add key custodians
    cy.contains('Add Custodian').click();
    cy.get('input[name="custodianName"]').type('Custodian 1');
    cy.get('input[name="custodianEmail"]').type('custodian1@example.com');
    cy.contains('Add').click();
    
    cy.contains('Add Custodian').click();
    cy.get('input[name="custodianName"]').type('Custodian 2');
    cy.get('input[name="custodianEmail"]').type('custodian2@example.com');
    cy.contains('Add').click();
    
    cy.contains('Add Custodian').click();
    cy.get('input[name="custodianName"]').type('Custodian 3');
    cy.get('input[name="custodianEmail"]').type('custodian3@example.com');
    cy.contains('Add').click();
    
    // Save configuration
    cy.contains('Save Configuration').click();
    cy.contains('Key recovery configuration saved').should('be.visible');
  });

  it('should configure batch processing', () => {
    cy.contains('Advanced Features').click();
    cy.contains('Batch Processing').click();
    
    // Configure batch processing
    cy.get('select[name="processingEngine"]').select('Apache Spark');
    cy.get('input[name="sparkMaster"]').type('spark://master:7077');
    cy.get('input[name="maxConcurrentJobs"]').clear().type('10');
    cy.get('input[name="maxFileSize"]').clear().type('10');
    
    // Save configuration
    cy.contains('Save Configuration').click();
    cy.contains('Batch processing configuration saved').should('be.visible');
  });

  it('should configure multi-cloud deployment', () => {
    cy.contains('Advanced Features').click();
    cy.contains('Multi-Cloud Configuration').click();
    
    // Configure AWS
    cy.contains('Add Cloud Provider').click();
    cy.get('select[name="cloudProvider"]').select('AWS');
    cy.get('input[name="awsRegion"]').type('us-west-2');
    cy.get('input[name="awsAccessKey"]').type('AKIAIOSFODNN7EXAMPLE');
    cy.get('input[name="awsSecretKey"]').type('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
    cy.contains('Save Provider').click();
    
    // Configure Azure
    cy.contains('Add Cloud Provider').click();
    cy.get('select[name="cloudProvider"]').select('Azure');
    cy.get('input[name="azureSubscriptionId"]').type('00000000-0000-0000-0000-000000000000');
    cy.get('input[name="azureTenantId"]').type('00000000-0000-0000-0000-000000000000');
    cy.get('input[name="azureClientId"]').type('00000000-0000-0000-0000-000000000000');
    cy.get('input[name="azureClientSecret"]').type('client-secret');
    cy.contains('Save Provider').click();
    
    // Verify providers added
    cy.contains('AWS (us-west-2)').should('be.visible');
    cy.contains('Azure').should('be.visible');
  });

  it('should configure self-destruct mechanism', () => {
    cy.contains('Advanced Features').click();
    cy.contains('Self-Destruct Configuration').click();
    
    // Configure self-destruct
    cy.get('select[name="selfDestructTrigger"]').select('Unauthorized Access');
    cy.get('input[name="maxFailedAttempts"]').clear().type('5');
    cy.get('select[name="selfDestructAction"]').select('Delete Local Files');
    
    // Save configuration
    cy.contains('Save Configuration').click();
    cy.contains('Self-destruct configuration saved').should('be.visible');
  });
});
