const express = require('express');
const body = require("body-parser");
let { realistic } = require("./lib/stablediff");
const Bard = require('./lib/bard');
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

app.get("/bard", async (req, res) => {
  let prompts = req.query.prompt;
  if (!prompts)
    return res.status(424).json({
      status: 424,
      creator: "RizzyFuzz",
      msg: "No Prompt Provided",
    });
  const bard = new Bard();
  try {
    await bard.configure(1, "cgi0zjh5k1ckIk7VU6CZ9PaXwmZOXYz1mdI6Jg7zSuBk6QTCVHWEVsXbZGmowJHmQ4Epiw.");

    const response = await bard.question(prompts);
    res.json({ result: response, status: 200, creator: "RizzyFuzz" 
    });
  } catch (error) {
    console.log(error);
  res.status(500).json({
      status: 500,
      creator: "RizzyFuzz",
      msg: "Internal Server Error!",
    });
  }
})

app.get("/stablediff", async (req, res) => {
  let prompts = req.query.prompt;
  if (!prompts)
    return res.status(424).json({
      status: 424,
      creator: "RizzyFuzz",
      msg: "No Prompt Provided",
    });
  try {
    let { secondSpeed:second,
	 model,
	 prompt, 
	 negative_prompt, 
	 height,
	 width, 
	 resultImage 
	} = await realistic(
       "absolutereality_v181.safetensors [3d9d4d2b]",
        prompts
    );
    res.json({ result: {
	    speed,
	    model,
	    prompt,
	    negative_prompt,
	    height,
	    width,
	    resultImage	    
    },
	    status: 200, creator: "RizzyFuzz" 
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      status: 500,
      creator: "RizzyFuzz",
      msg: e.message,
    });
  }
});

app.get('/', function(req, res) {
    res.send('Welcome to Node JS V1');
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

module.exports = app;
