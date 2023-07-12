<template>
  <div>
    <h1>Créer une personne</h1>
    <form @submit.prevent="createPerson">
      <label for="nom">Nom:</label>
      <input type="text" id="nom" v-model="newPerson.nom" required>

      <label for="prenom">Prénom:</label>
      <input type="text" id="prenom" v-model="newPerson.prenom" required>

      <label for="mail">Adresse e-mail:</label>
      <input type="text" id="mail" v-model="newPerson.mail" required>

      <label for="phone">Téléphone:</label>
      <input type="text" id="phone" v-model="newPerson.phone" required>

      <button type="submit">Créer</button>
    </form>

    <form v-if="editingPerson" @submit.prevent="updatePerson">
      <!-- Champ de formulaire pour le nom -->
      <label for="edit-nom">Nom:</label>
      <input type="text" id="edit-nom" v-model="editingPerson.nom" required>

      <!-- Champ de formulaire pour le prénom -->
      <label for="edit-prenom">Prénom:</label>
      <input type="text" id="edit-prenom" v-model="editingPerson.prenom" required>

      <!-- Champ de formulaire pour l'adresse e-mail -->
      <label for="edit-mail">Adresse e-mail:</label>
      <input type="text" id="edit-mail" v-model="editingPerson.mail" required>

      <!-- Champ de formulaire pour le téléphone -->
      <label for="edit-phone">Téléphone:</label>
      <input type="text" id="edit-phone" v-model="editingPerson.phone" required>

      <!-- Bouton de soumission du formulaire de modification -->
      <button type="submit">Enregistrer</button>
    </form>

    <h1> Liste des personnes</h1>
    <ul>
      <li v-for="person in people" :key="person.id">
      {{ person.nom }} {{ person.prenom}} {{ person.mail }} {{ person.phone }} {{ person.id }}
      <button @click="editPerson(person)">Modifier</button>
      <button @click="deletePerson(person.id)">Supprimer</button>
      </li>
    </ul>
  </div>
</template>

<script>

import axios from 'axios';

export default {
  data() {
    return {
      editingPerson: null,
      newPerson: {
        nom: '',
        prenom: '',
        mail: '',
        phone: ''
      },
      people: []
    };
  },
  mounted() {
    this.fetchPeople();
  },
  methods: {
    fetchPeople() {
      axios.get('http://localhost:3000/people')
      .then(response => {
        this.people = response.data;
      })
      .catch(error => {
        console.error(error);
      });
    },
    createPerson() {
      axios.post('http://localhost:3000/people', this.newPerson)
        .then(response => {
          this.people.push(response.data);
          this.newPerson = {
          // Réinitialiser les valeurs des champs du formulaire
          nom: '',
          prenom: '',
          mail: '',
          phone: ''
          };
        })
        .catch(error => {
          // Une erreur s'est produite lors de la création de la personne
          console.error(error);
        });
    },
    editPerson(person) {
      const personId = person.id;
      axios.get(`http://localhost:3000/people/${personId}`)
      .then(response => {
        const personDetails = response.data;
        this.editingPerson = {
            id: personId,
            nom: personDetails.nom,
            prenom: personDetails.prenom,
            mail: personDetails.mail,
            phone: personDetails.phone
          };
        })
        .catch(error => {
          console.error(error);
        });
    },
    updatePerson()
    {
      const personId = this.editingPerson.id;
      axios.put(`http://localhost:3000/people/${personId}`, this.editPerson)
      .then(response => {
        const updatedPerson = response.data;
        this.people = this.people.map(person => {
          if (person.id === updatedPerson.id) {
            return updatedPerson;
          } else {
            return person;
          }
      });
      this.editingPerson = null;
    })
    .catch(error => {
      console.error(error);
    
    });
  },
    deletePerson(person) {
      axios.delete(`http://localhost:3000/people/${personId}`)
         .then(response => {
           // Supprimer la personne de la liste des personnes affichées
           this.people = this.people.filter(person => person.id !== personId);
         })
         .catch(error => {
           console.error(error);
         });
    }
  }
};
</script>