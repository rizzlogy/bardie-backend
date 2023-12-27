const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const chalk = require("chalk");
const Bard = require("./lib/bard");
const app = express();
const PORT = process.env.PORT || 8022 || 8888 || 1923;
const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");

async function getRandomCookie() {
  const cookies = [
    //  "eghq8tYV92dGuAazf5V6mP2ZNiHynaNJgNxJ2Qw9MSZ3_ASv07EOJ5wrnM3szTBeeBMINw.",
    //"eggTf66gQSLG6GgZtDEt9ORyVyuJXYAvN70rQ6dje-CVeL7fK_nGriul0Ilm5_aicTMk3Q.",
    "eQjeimZP8Ag_KvtMo2z4tDtlUSJpEycDTNXr2LpYmimZkb07xCIfCRQbvc2hSdB5qaL2Eg.",
    // "eggTf-BT-Nsi_wiy7e452Dr7gc1Cso1fd3pOz98GveDARacSANTc8m8BmFbThiQS_4pkBQ.",
  ];
  const randomIndex = await Math.floor(Math.random() * cookies.length);
  return cookies[randomIndex];
}

app.set("json spaces", 2);
app.set("trust proxy", true);
app.enable("trust proxy");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(swaggerUi.serve);
app.use(cors());

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

app.all(
  [
    "/backend/conversation",
    "/api/onstage",
    "/backend/conversation/image",
    "/api/onstage/image",
  ],
  (req, res, next) => {
    if (req.method !== "POST") {
      return res.status(405).json({
        content: "Method not allowed",
        status: 405,
        creator: "RizzyFuzz",
      });
    }
    next();
  },
);

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
    const randomCookie = await getRandomCookie();
    await bard.configure(randomCookie);

    const { status, content } = await bard.question(ask);
    if (!status) {
      res.status(500).json({
        content: content,
        status: 500,
        creator: "RizzyFuzz",
      });
    } else {
      res.status(200).json({
        content: content,
        status: 200,
        creator: "RizzyFuzz",
      });
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

app.post(
  ["/backend/conversation/image", "/api/onstage/image"],
  async (req, res) => {
    try {
      const { ask, image } = req.body;
      if (!ask) {
        return res.status(400).json({
          content: "Bad Request: No Query Ask Provided",
          status: 400,
          creator: "RizzyFuzz",
        });
      }
      if (!image) {
        return res.status(400).json({
          content: "Bad Request: No Image Provided",
          status: 400,
          creator: "RizzyFuzz",
        });
      }

      const bard = new Bard();
      const randomCookie = await getRandomCookie();
      await bard.configure(randomCookie);

      const { status, content } = await bard.questionWithImage(ask, image);
      if (!status) {
        res.status(500).json({
          content: content,
          status: 500,
          creator: "RizzyFuzz",
        });
      } else {
        res.status(200).json({
          content: content,
          status: 200,
          creator: "RizzyFuzz",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        content: "Internal Server Error!",
        status: 500,
        creator: "RizzyFuzz",
      });
    }
  },
);

app.get("/", (req, res) => {
  swaggerDocument.host = req.get("host");
  swaggerDocument.schemes = ["https"];
  res.send(
    swaggerUi.generateHTML(swaggerDocument, {
      customCss: `.swagger-ui .topbar .download-url-wrapper { display: none } 
    .swagger-ui .topbar-wrapper img[alt="Bardie API"], .topbar-wrapper span {
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
