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

    <h1> Liste des personnes</h1>
    <ul>
      <li v-for="person in people" :key="person.id">
      {{ person.nom }} {{ person.prenom}} {{ person.mail }} {{ person.phone }}
    </li>
    </ul>
  </div>
</template>

<script>

import axios from 'axios';

export default {
  data() {
    return {
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
    }
  }
};
</script>