const express = require("express");
const Bard = require("./lib/bard");
const app = express();
const PORT = process.env.PORT || 8022 || 8888;

app.set("json spaces", 2);
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("x-powered-by", "RizzyFuzz Backend");
  next();
});

app.get("/api/onstage", async (req, res) => {
  let ask = req.query.ask;
  if (!ask) {
    return res.status(400).json({
      status: 400,
      creator: "RizzyFuzz",
      msg: "Bad Request: No Query Ask Provided",
    });
  }

  const bard = new Bard();
  try {
    await bard.configure(
      1,
      "cgi0zjh5k1ckIk7VU6CZ9PaXwmZOXYz1mdI6Jg7zSuBk6QTCVHWEVsXbZGmowJHmQ4Epiw.",
    );
    const response = await bard.question(decodeURIComponent(ask));
    res.json({ result: response, status: 200, creator: "RizzyFuzz" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      creator: "RizzyFuzz",
      msg: "Internal Server Error!",
    });
  }
});

app.get("/", function (req, res) {
  res.status(200).json({
    status: 200,
    creator: "RizzyFuzz",
    msg: "Server API ON!",
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
