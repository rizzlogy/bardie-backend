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

app.use((req, res, next) => {
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    res
      .status(500)
      .json({
        content: "Server not responding, try again",
        status: 500,
        creator: "RizzyFuzz",
      });
  }, 10000);

  res.on("finish", () => {
    if (!timedOut) {
      clearTimeout(timeout);
    }
  });

  next();
});

app.post("/api/onstage", async (req, res) => {
  const { ask } = req.body;
  if (!ask) {
    return res.status(400).json({
      content: "Bad Request: No Query Ask Provided",
      status: 400,
      creator: "RizzyFuzz",
    });
  }

  const bard = new Bard();
  try {
    await bard.configure(
      1,
      "cgi0zjh5k1ckIk7VU6CZ9PaXwmZOXYz1mdI6Jg7zSuBk6QTCVHWEVsXbZGmowJHmQ4Epiw.",
    );
    const response = await bard.question(ask);
    if (!response.status)
      res.json({
        content: response.content,
        status: 500,
        creator: "RizzyFuzz",
      });
    res.json({ content: response.content, status: 200, creator: "RizzyFuzz" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      content: "Internal Server Error!",
      status: 500,
      creator: "RizzyFuzz",
    });
  }
});

app.all("/api/onstage", (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({
      content: "Method not allowed",
      status: 405,
      creator: "RizzyFuzz",
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
