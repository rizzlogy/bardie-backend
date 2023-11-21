const axios = require("axios");

async function ignoreFavicon(req, res, next) {
  if (/favicon|favicon.ico/.test(req.path)) {
    try {
      const response = await axios.get(
        "https://www.gstatic.com/lamda/images/favicon_v1_70c80ffdf27202fd2e84f.png",
        {
          responseType: "arraybuffer",
        },
      );
      const buffer = Buffer.from(response.data, "binary");
      res.type("png");
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  } else {
    next();
  }
}

module.exports = { ignoreFavicon };
