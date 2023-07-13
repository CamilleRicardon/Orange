describe('Delete Tests', () => {
    it('should delete a person successfully', () => {
      cy.request('POST', 'http://localhost:3000/people', {
        nom: 'Lara',
        prenom: 'Fabian',
        mail: 'lara.fabian@example.com',
        phone: '1234567890'
      }).then(response => {
        const personId = response.body.id; // Récupérez l'ID de la personne créée
  
        cy.request('DELETE', `http://localhost:3000/people/${personId}`).then(response => {
          // Vérifiez que la personne a été supprimée avec succès
          expect(response.status).to.equal(200);
        });
      });
    });
  });
  