const { join: pathJoin } = require("path");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const chalk = require("chalk");
const Bard = require("./lib/bard");
const os = require("os");
const app = express();
const PORT = 8022 || 8888 || 1923;
const speed = require("performance-now");
const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");
const { ignoreFavicon } = require("./lib/ignoreFavicon");
const STATIC_ROOT = pathJoin(__dirname, "assets/bard/assets");
app.use("/assets", express.static(STATIC_ROOT));
const ROOT = pathJoin(__dirname, "assets/bard");
app.get("/tes", function (req, res) {
  res.sendFile(pathJoin(ROOT, "index.html"));
});
app.set("json spaces", 2);
app.set("trust proxy", true);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(ignoreFavicon);
app.use(swaggerUi.serve);
app.use(cors());
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

function runtime(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600 * 24));
  var h = Math.floor((seconds % (3600 * 24)) / 3600);
  var m = Math.floor((seconds % 3600) / 60);
  var s = Math.floor(seconds % 60);
  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
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
    return (
      "[ ✨ ] " +
      [
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
      ].join(" | ")
    );
  }),
);

app.use((req, res, next) => {
  const REVERSE_PROXY = eval(true);
  const ALLOW = ["bard.rizzy.eu.org"];
  if (REVERSE_PROXY && !ALLOW.includes(req.get("host")))
    return res.status(403).json({
      content: "Sorry, Access Denied!",
      status: 403,
      creator: "RizzyFuzz",
    });
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

app.get("/", (req, res) => {
  swaggerDocument.host = req.get("host");
  swaggerDocument.schemes = ["https"];
  res.send(
    swaggerUi.generateHTML(swaggerDocument, {
      customCss: `.swagger-ui .topbar .download-url-wrapper { display: none } 
    .swagger-ui .topbar-wrapper img[alt="Bardie Web API"], .topbar-wrapper span {
      visibility: colapse;
    }
    .swagger-ui .topbar-wrapper img {
      content: url("https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg");
    }
    .swagger-ui .opblock-section-body .parameters-col_description {
     width: 50px;
    }
    `,
      customfavIcon:
        "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg",
      customSiteTitle: swaggerDocument.info.title,
      customSiteDesc: swaggerDocument.info.description,
    }),
  );
});

app.get("/swagger.json", (req, res) => {
  swaggerDocument.host = req.get("host");
  swaggerDocument.schemes = ["https"];
  res.json(swaggerDocument);
});

app.get("/status", async (req, res, next) => {
  try {
    const bard = new Bard();
    await bard.configure(
      1,
      "cgi0zjh5k1ckIk7VU6CZ9PaXwmZOXYz1mdI6Jg7zSuBk6QTCVHWEVsXbZGmowJHmQ4Epiw.",
    );
    const timestamp = speed();
    const latensi = speed() - timestamp;
    const response = await bard.question("ping!");
    res.send({
      stats: {
        ping: `${latensi.toFixed(4)} s`,
        cpu: `${os.cpus()[0].model}${
          os.cpus().length > 1 ? " (" + os.cpus().length + "x)" : ""
        }`,
        platfrom: os.platform(),
        arch: os.arch(),
        memoryRAM: `${formatBytes(
          os.totalmem() - os.freemem(),
        )} / ${formatBytes(os.totalmem())}`,
        runtime: runtime(os.uptime()),
      },
      status: response.status ? "Bard On 🟢" : "Bard Maintenance 🔴",
      creator: "RizzyFuzz ©Vercel Inc.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      content: "Internal Server Error!",
      status: 500,
      creator: "RizzyFuzz",
    });
  }
});

app.use((req, res, next) => {
  res.status(404).json({
    content: "Not Found!",
    status: 404,
    creator: "RizzyFuzz",
  });
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

module.exports = app;
