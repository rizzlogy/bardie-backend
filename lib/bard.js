const axios = require("axios");
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

class Bard {
  constructor(timeout = 10000, proxies = null) {
    this.safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];
    this.generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };
    this.chat;
    this.timeout = timeout;
    this.proxies = proxies;
    this.session = axios.create();
    this.params = {
      bl: "boq_assistant-bard-web-server_20240310.18_p0",
      _reqid: String(Number(Math.random().toString().slice(2, 8))),
      rt: "c",
    };
    this.data = {
      "f.req": "",
      at: "",
    };
    this.bard =
      "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
  }

  async configure(cookie) {
    const headers = {
      Host: "gemini.google.com",
      "X-Same-Domain": "1",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Origin: "https://gemini.google.com",
      Referer: "https://gemini.google.com/",
    };
    this.session.defaults.headers = headers;
    this.session.defaults.headers.Cookie = "__Secure-1PSID=" + cookie;
    await this.setSnim0e();
  }

  configureGemini(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.chat = model.startChat({
      generationConfig: this.generationConfig,
      safetySettings: this.safetySettings,
    });
  }

  configureGeminiImage(apiKey) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    this.model = model;
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
            "[GoogleGenerativeAI Error]: Authentication Error, Contact The Admin: support@rizzy.eu.org",
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
        new URLSearchParams(this.data).toString(),
        {
          params: this.params,
          timeout: 120000,
        },
      );

      const chatData = JSON.parse(response.data.split("\n")[3])[0][2];

      if (chatData === null) {
        return {
          content: "[GoogleGenerativeAI Error]: Limited Request, Please Try Again Later",
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
          content: "[GoogleGenerativeAI Error]: Could not fetch Google Bard.",
          status: false,
          creator: "RizzyFuzz",
        };
      } else {
        return {
          content: "[GoogleGenerativeAI Error]: "+error.message,
          status: false,
          creator: "RizzyFuzz",
        };
      }
    }
  }

  async questionGemini(message) {
    if (!message) {
      return {
        content: "Input message!",
        status: false,
        creator: "RizzyFuzz",
      };
    }
    try {
      const result = await this.chat.sendMessage(message);
      const response = result.response;

      return {
        content: response.text(),
        status: true,
        creator: "RizzyFuzz",
      };
    } catch (error) {
      console.error(error);
      return {
        content: error.message,
        status: false,
        creator: "RizzyFuzz",
      };
    }
  }

  async questionGeminiWithImage(message, url) {
    if (!message) {
      return {
        content: "Input message!",
        status: false,
        creator: "RizzyFuzz",
      };
    }
    if (!url) {
      return {
        content: "Input url!",
        status: false,
        creator: "RizzyFuzz",
      };
    }
    try {
      let { data: buffer, headers } = await axios.get(url, {
        responseType: "arraybuffer",
      });

      const contentType = headers["content-type"];
      const validImageTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/webp",
        "image/gif",
      ];

      if (!validImageTypes.includes(contentType)) {
        return {
          content:
            "Please input a valid image, only (png, jpg, jpeg, webp, gif)!",
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const imageParts = {
        inlineData: {
          data: Buffer.from(buffer, "binary").toString("base64"),
          mimeType: contentType,
        },
      };
      const result = await this.model.generateContent([message, imageParts]);
      const response = result.response;

      return {
        content: response.text(),
        status: true,
        creator: "RizzyFuzz",
      };
    } catch (error) {
      console.error(error);
      return {
        content: error.message,
        status: false,
        creator: "RizzyFuzz",
      };
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
          content: "Input url!",
          status: false,
          creator: "RizzyFuzz",
        };
      }
      if (!this.data.at) {
        return {
          content:
            "[GoogleGenerativeAI Error]: Authentication Error, Contact The Admin: support@rizzy.eu.org",
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
        new URLSearchParams(this.data).toString(),
        {
          params: this.params,
          timeout: 120000,
        },
      );

      const chatData = JSON.parse(response.data.split("\n")[3])[0][2];

      if (chatData === null) {
        return {
          content: "[GoogleGenerativeAI Error]: Limited Request, Please Try Again Later",
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
          content: "[GoogleGenerativeAI Error]: Could not fetch Google Bard.",
          status: false,
          creator: "RizzyFuzz",
        };
      } else {
        return {
          content: "[GoogleGenerativeAI Error]: "+error.message,
          status: false,
          creator: "RizzyFuzz",
        };
      }
    }
  }

  async uploadImage(name, url) {
    try {
      let { data: buffer, headers } = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const contentType = headers["content-type"];
      const validImageTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/webp",
        "image/gif",
      ];

      if (!validImageTypes.includes(contentType)) {
        return {
          content:
            "[GoogleGenerativeAI Error]: Please input a valid image, only (png, jpg, jpeg, webp, gif)!",
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const size = buffer.length;
      let params = [
        `${encodeURIComponent("File name")}=${encodeURIComponent([name])}`,
      ];
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
        content: "[GoogleGenerativeAI Error]: Failed to upload photo to google server.",
        status: false,
        creator: "RizzyFuzz",
      };
    }
  }

  async setSnim0e() {
    try {
      const response = await this.session.get("https://gemini.google.com/", {
        timeout: this.timeout,
        proxies: this.proxies,
      });

      if (response.status !== 200) {
        return { content: `Failed to connect in gemini server` };
      }

      if (!response.headers["set-cookie"]) {
        return {
          content: "[GoogleGenerativeAI Error]: Cookie Not Set, Contact The Admin: support@rizzy.eu.org",
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
            "[GoogleGenerativeAI Error]: Failed to retrieve SNlM0e pattern. Contact The Admin: support@rizzy.eu.org",
          status: false,
          creator: "RizzyFuzz",
        };
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Bard;
