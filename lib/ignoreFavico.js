const axios = require('axios');

async function ignoreFavicon(req, res, next) {
  if (/favicon/.test(req.path)) {
    try {
      const response = await axios.get("https://raw.githubusercontent.com/RizzyFuzz/mystgr/main/thisimg.png", {
        responseType: 'arraybuffer' // Ensure the response is treated as a buffer
      });
      const buffer = Buffer.from(response.data, 'binary');
      res.type("png");
      res.send(buffer);
    } catch (error) {
      console.error(error);
      res.sendStatus(500); // Handle errors appropriately
    }
  } else {
    next();
  }
}

module.exports = { ignoreFavicon };
