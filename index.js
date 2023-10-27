const express = require('express');
const body = require("body-parser");
const app = express();
const PORT = 8022 || 4500 || 3000;

app.use(express.static('public'))
app.use('/public', express.static('public'));
app.set("json spaces", 2);
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(body.json({ type: "application/json" }));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("x-powered-by", "RizzyFuzz Backend");
  next();
});

app.get('/eval', async (req, res) => {
  let code = req.query.query || req.query.q || req.query.code
	let evaled
	try {
		evaled = await eval(`(async () => { ${code} })()`)
	} catch (e) {
		evaled = e
	} finally {
		res.send(require('util').format(evaled))
	}
})

app.get('/', function(req, res) {
    res.send('Welcome to Node JS V1');
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

module.exports = app;
