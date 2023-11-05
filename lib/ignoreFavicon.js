const axios = require("axios");

async function ignoreFavicon(req, res, next) {
  if (/favicon/.test(req.path)) {
    try {
      const response = await axios.get(
        "https://www.gstatic.com/lamda/images/favicon_v1_150160cddff7f294ce30.svg",
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
