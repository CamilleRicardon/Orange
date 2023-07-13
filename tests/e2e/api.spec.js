describe('API Tests', () => {
    it('should return 200 status code', () => {
        cy.request('GET', 'http://localhost:3000/people')
            .its('status')
            .should('equal', 200);
    });
});