const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'External API',
    version: '1.0.0',
    description: 'API externe qui appelle directement GraphQL, cartography, IRVE, SOAP, etc.',
  },
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, 'routes', '*.js')], // ou ['./routes/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
