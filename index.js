const express = require('express');
const app = express();
const routes = require('./routes');

// Pour activer la doc Swagger

//const swaggerJSDoc = require('swagger-jsdoc');
//const swaggerUi = require('swagger-ui-express');
//const swaggerDocument = require('./swaggerdoc.json');
//const options = { customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.14.0/swagger-ui.min.css'};

app.use(express.static('public'))
app.use('/api', routes.router);
app.use('/public', express.static('public'));


/*
app.use('/', swaggerUi.serve);
app.get('/', swaggerUi.setup(swaggerDocument, options));
 */

app.listen(process.env.PORT || 3000);

module.exports = app;