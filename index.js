const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const chalk = require("chalk");
const Bard = require("./lib/bard");
const app = express();
const PORT = process.env.PORT || 8022 || 8888 || 1923;

app.set("json spaces", 2);
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.setHeader("x-powered-by", "RizzyFuzz Backend");
  next();
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function status(code) {
  if (code > 400 && code < 499) return chalk.yellow(code);
  if (code > 500 && code < 599) return chalk.red(code);
  if (code > 299 && code < 399) return chalk.cyan(code);
  if (code > 199) return chalk.green(code);
  return chalk.yellow(code);
}

app.use(
  logger(function (tokens, req, res) {
    return "[ ✨ ] " + [
      req.ip,
      tokens.method(req, res),
      tokens.url(req, res),
      status(tokens.status(req, res)),
      tokens["response-time"](req, res) + " ms",
      formatBytes(
        isNaN(tokens.res(req, res, "content-length"))
          ? 0
          : tokens.res(req, res, "content-length"),
      ),
    ].join(" | ");
  }),
);

app.use((req, res, next) => {
  const REVERSE_PROXY = eval(true);
  const ALLOW = ["bard.rizzy.eu.org"];
  if (REVERSE_PROXY && !ALLOW.includes(req.get("host")))
    return res
      .status(403)
      .send(`<center><h1>Sorry, Access Denied</h1></center>`);
  next();
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    content: "Something broke!",
    status: 500,
    creator: "RizzyFuzz",
  });
});

app.post("/api/onstage", cors(), async (req, res) => {
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

module.exports = app;
