const express = require('express');
const body = require("body-parser");
const Bard = require('./lib/bard');
const app = express();
const PORT = 8022 || 4500 || 3000;

app.set("json spaces", 2);
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(body.json({ type: "application/json" }));
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("x-powered-by", "RizzyFuzz Backend");
  next();
});

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

    const response = await bard.question(decodeURIComponent(prompts));
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
});

app.get('/', function(req, res) {
    res.status(200).json({
      status: 200,
      creator: "RizzyFuzz",
      msg: "Server API ON!",
    });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

module.exports = app;
