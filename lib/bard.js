const axios = require("axios");
const qs = require("qs");

class BardAI {
  constructor(timeout = 6000, proxies = null) {
    this.timeout = timeout;
    this.proxies = proxies;
    this.session = axios.create();
    this.params = {
      "bl": "boq assistant-bard-web-server_20231120.10_p0",
      "f.sid":  this.generateRandomNumber(),
      "_reqid": String(Number(Math.random().toString().slice(2, 8))),
      "rt": "c",
    };
    this.data = {
      "f.req": "",
      at: "",
    };
    this.bard =
      "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
  }

 async generateRandomNumber() {
    const minValue = -9223372036854775808;
    const maxValue = 9223372036854775807;
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
  }
  
  async configure(cookie) {
    if (!cookie) {
      return {
        content:
          "Authentication Error! Please make sure to initialize with the correct __Secure-1PSID or __Secure-3PSID value. Check your credentials and try again.",
        status: false,
        creator: "RizzyFuzz",
      };
    }

    this.session.defaults.headers = {
      Host: "bard.google.com",
      "X-Same-Domain": "1",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "sec-ch-ua":
        '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Accept: "application/json",
      "accept-encoding": "gzip, deflate, br",
      dnt: "1",
      Origin: "https://bard.google.com",
      Referer: "https://bard.google.com/",
      Cookie:
        typeof cookie === "object"
          ? Object.entries(cookie)
              .map(([key, val]) => `${key}=${val};`)
              .join("")
          : "__Secure-1PSID=" + cookie,
    };
    await this.setSnim0e();
  }

  async question(message) {
    try {
      if (!message) {
        return {
          content: "Input message!",
          status: false,
          creator: "RizzyFuzz",
        };
      }
      if (!this.data.at) {
        return {
          content:
            "Authentication Error! Please make sure to initialize with the correct __Secure-1PSID or __Secure-3PSID value. Check your credentials and try again.",
          status: false,
          creator: "RizzyFuzz",
        };
      }
      const messageStruct = [[message], null, [null, null, null]];
      this.data["f.req"] = JSON.stringify([
        null,
        JSON.stringify(messageStruct),
      ]);

      const response = await this.session.post(
        this.bard,
        qs.stringify(this.data),
        {
          params: this.params,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response.status !== 200) {
        return {
          content: `Response Status: ${response.status}`,
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const chatData = JSON.parse(response.data.split("\n")[3])[0][2];

      if (chatData === null) {
        return {
          content: `Response Error: ${response.data}.`,
          status: false,
          creator: "RizzyFuzz",
        };
      }
      let chatDataParsed = JSON.parse(chatData);
      let formatMarkdown = (text, images) => {
        if (!images) return text;

        for (let imageData of images) {
          const formattedTag = `!${imageData.tag}(${imageData.url})`;
          text = text.replace(
            new RegExp(`(?!\\!)\\[${imageData.tag.slice(1, -1)}\\]`),
            formattedTag,
          );
        }

        return text;
      };
      const answer = chatDataParsed[4][0];
      const text = answer[1][0];
      const images =
        answer[4]?.map((x) => ({
          tag: x[2],
          url: x[3][0][0],
        })) ?? [];
      return {
        content: formatMarkdown(text, images),
        status: true,
        creator: "RizzyFuzz",
      };
    } catch (error) {
      console.error(error);
      if (error.code === "ECONNRESET") {
        return {
          content:
            "Could not fetch Google Bard. You may be disconnected from internet",
          status: false,
          creator: "RizzyFuzz",
        };
      } else {
        return {
          content: "Internal Server Error",
          status: false,
          creator: "RizzyFuzz",
        };
      }
    }
  }

  async questionWithImage(message, url) {
    try {
      if (!message) {
        return {
          content: "Input message!",
          status: false,
          creator: "RizzyFuzz",
        };
      }
      if (!url) {
        return {
          content: "Input message!",
          status: false,
          creator: "RizzyFuzz",
        };
      }
      if (!this.data.at) {
        return {
          content:
            "Authentication Error! Please make sure to initialize with the correct __Secure-1PSID or __Secure-3PSID value. Check your credentials and try again.",
          status: false,
          creator: "RizzyFuzz",
        };
      }
      const messageStruct = [[message], null, [null, null, null]];
      if (url) {
        let imageLocation = await this.uploadImage("bard-ai_upload", url);
        messageStruct[0].push(0, null, [
          [[imageLocation, 1], "bard-ai_upload"],
        ]);
      }
      this.data["f.req"] = JSON.stringify([
        null,
        JSON.stringify(messageStruct),
      ]);
      const response = await this.session.post(
        this.bard,
        qs.stringify(this.data),
        {
          params: this.params,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response.status !== 200) {
        return {
          content: `Response Status: ${response.status}`,
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const chatData = JSON.parse(response.data.split("\n")[3])[0][2];

      if (chatData === null) {
        return {
          content: `Response Error: ${response.data}.`,
          status: false,
          creator: "RizzyFuzz",
        };
      }
      let chatDataParsed = JSON.parse(chatData);
      let formatMarkdown = (text, images) => {
        if (!images) return text;

        for (let imageData of images) {
          const formattedTag = `!${imageData.tag}(${imageData.url})`;
          text = text.replace(
            new RegExp(`(?!\\!)\\[${imageData.tag.slice(1, -1)}\\]`),
            formattedTag,
          );
        }

        return text;
      };
      const answer = chatDataParsed[4][0];
      const text = answer[1][0];
      const images =
        answer[4]?.map((x) => ({
          tag: x[2],
          url: x[3][0][0],
        })) ?? [];
      return {
        content: formatMarkdown(text, images),
        status: true,
        creator: "RizzyFuzz",
      };
    } catch (error) {
      console.error(error);
      if (error.code === "ECONNRESET") {
        return {
          content:
            "Could not fetch Google Bard. You may be disconnected from internet",
          status: false,
          creator: "RizzyFuzz",
        };
      } else {
        return {
          content: "Internal Server Error",
          status: false,
          creator: "RizzyFuzz",
        };
      }
    }
  }

  async uploadImage(name, url) {
    try {
      let { data: buffer } = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const size = buffer.length;
      let params = qs.stringify({
        "File name": [name],
      });
      const response = await axios.post(
        "https://content-push.googleapis.com/upload/",
        params,
        {
          headers: {
            "X-Goog-Upload-Command": "start",
            "X-Goog-Upload-Protocol": "resumable",
            "X-Goog-Upload-Header-Content-Length": size,
            "X-Tenant-Id": "bard-storage",
            "Push-Id": "feeds/mcudyrk2a4khkz",
          },
        },
      );

      const uploadUrl = response.headers["x-goog-upload-url"];
      const imageResponse = await axios.post(uploadUrl, buffer, {
        headers: {
          "X-Goog-Upload-Command": "upload, finalize",
          "X-Goog-Upload-Offset": 0,
          "X-Tenant-Id": "bard-storage",
        },
      });

      const imageFileLocation = imageResponse.data;
      return imageFileLocation;
    } catch (error) {
      console.error(error);
      return {
        content: "Failed to upload photo to google server.",
        status: false,
        creator: "RizzyFuzz",
      };
    }
  }

  async setSnim0e() {
    try {
      const response = await this.session.get("https://bard.google.com/", {
        timeout: this.timeout,
        proxies: this.proxies,
      });

      if (response.status !== 200) {
        return { content: `Response Status: ${response.status}` };
      }

      if (!response.headers["set-cookie"]) {
        return {
          content:
            "Invalid __Secure-1PSID or __Secure-3PSID value. Please ensure you provide a valid __Secure-1PSID or __Secure-3PSID value.",
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const regex = /SNlM0e":"(.*?)"/;
      const match = response.data.match(regex);

      if (match) {
        this.data.at = match[1];
      } else {
        return {
          content:
            "Failed to retrieve SNlM0e pattern. Please ensure you provide a valid __Secure-1PSID or __Secure-3PSID value.",
          status: false,
          creator: "RizzyFuzz",
        };
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = BardAI;
