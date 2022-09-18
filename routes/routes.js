/**
 * @swagger
 *
 * tags:
 *   - name:
 *     description:
 * /:
 *   post:
 *     tags:
 *     -
 *     summary:
 *     description:
 *     parameters:
 *         - in: query
 *           name: amount
 *           required: true
 *           schema:
 *             type: integer
 *           description:
 *
 */


const express = require('express');
const router = express.Router();
require("dotenv").config();
const bodyParser = require("body-parser");

let jsonParser = bodyParser.json()

router.post('/',jsonParser, async (req, res) => {
    res.json({
    });
})


module.exports.router = router;