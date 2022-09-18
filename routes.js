const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios')

const router = express.Router();

router.get('/', function(req, res) {
    res.send('Welcome to Node JS V1');
});

router.use('/routes', require('./routes/routes').router);

module.exports.router = router;