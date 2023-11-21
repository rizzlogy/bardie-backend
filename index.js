const { join: pathJoin } = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const chalk = require("chalk");
const Bard = require("./lib/bard");
const app = express();
const PORT = 8022 || 8888 || 1923;
const speed = require("performance-now");
const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");
const cookieParser = require("cookie-parser");
const { ignoreFavicon } = require("./lib/ignoreFavicon");
const STATIC_ROOT = pathJoin(__dirname, "assets/bard/assets");
const ROOT = pathJoin(__dirname, "assets/bard");
const rateLimit = require("express-rate-limit");

app.set("json spaces", 2);
app.set("trust proxy", true);
app.enable("trust proxy");
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/assets", express.static(STATIC_ROOT));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ignoreFavicon);
app.use(swaggerUi.serve);
app.use(cors());
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 2000,
  message: "Oops too many requests",
});
app.use(limiter);

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

app.all(["/backend/conversation", "/api/onstage"], (req, res, next) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      content: "Method not allowed",
      status: 405,
      creator: "RizzyFuzz",
    });
  }
  next();
});

app.get("/", function (req, res) {
  res.redirect("/chat");
});

app.post(["/backend/conversation", "/api/onstage"], async (req, res) => {
  try {
    const { ask } = req.body;
    if (!ask) {
      return res.status(400).json({
        content: "Bad Request: No Query Ask Provided",
        status: 400,
        creator: "RizzyFuzz",
      });
    }

    const bard = new Bard();
    await bard.configure(
      "dAi0zsDXmgvjqCJIOmO_AYdWcjsmONk2RzACTWebfE0AEoLC3mPu0BDPqgJRMk56rIGoCg.",
    );

    const response = await bard.question(ask);
    if (!response.status) {
      res.status(500).json({
        content: response.content,
        status: 500,
        creator: "RizzyFuzz",
      });
    } else {
     res.status(200).json(response)
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      content: "Internal Server Error!",
      status: 500,
      creator: "RizzyFuzz",
    });
  }
});

app.post(["/backend/conversation/v2", "/api/onstage/v2"], async (req, res) => {
  try {
    const { ask, image } = req.body;
    if (!ask) {
      return res.status(400).json({
        content: "Bad Request: No Query Ask Provided",
        status: 400,
        creator: "RizzyFuzz",
      });
    }

    const bard = new Bard();
    await bard.configure(
      "dAi0zsDXmgvjqCJIOmO_AYdWcjsmONk2RzACTWebfE0AEoLC3mPu0BDPqgJRMk56rIGoCg.",
    );

    const response = await bard.questionWithImage(ask, image);
    if (!response.status) {
      res.status(500).json({
        content: response.content,
        status: 500,
        creator: "RizzyFuzz",
      });
    } else {
      res.status(200).json(response)
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      content: "Internal Server Error!",
      status: 500,
      creator: "RizzyFuzz",
    });
  }
});

app.get("/chat", function (req, res) {
  res.sendFile(pathJoin(ROOT, "index.html"));
});

app.get("/developer", (req, res) => {
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
