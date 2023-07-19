const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mon API',
      version: '1.0.0',
      description: 'API pour gérer les personnes et les métiers.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
  },
  apis: ['./src/app.ts'], // Remplacez 'app.js' par le chemin vers votre fichier principal contenant les routes.
};

const specs = swaggerJsdoc(options);

module.exports = specs;
