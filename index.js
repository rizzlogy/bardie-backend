const express = require('express');
const app = express();

app.use(express.static('public'))
app.use('/public', express.static('public'));
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

app.listen(process.env.PORT || 3000);

module.exports = app;
