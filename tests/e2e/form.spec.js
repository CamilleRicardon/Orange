describe('Form Tests', () => {
    it('should create a person successfully', () => {
      cy.request('POST', 'http://localhost:3000/people', {
        nom: 'John',
        prenom: 'Doe',
        mail: 'john.doe@example.com',
        phone: '1234567890'
      }).then(response => {
        // Vérifiez que la personne a été créée avec succès
        expect(response.status).to.equal(201);
    
        // Vérifiez que la personne créée est affichée dans la liste des personnes
        cy.request('GET', 'http://localhost:3000/people').then(response => {
          const people = response.body;
          const createdPerson = people.find(person => person.nom === 'John' && person.prenom === 'Doe');
  
          expect(createdPerson).to.exist;
          expect(createdPerson.mail).to.equal('john.doe@example.com');
          expect(createdPerson.phone).to.equal('1234567890');
        });
      });
    });
  });
  
  