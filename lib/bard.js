const axios = require("axios");
const qs = require("qs");

class BardAI {
  constructor() {
    this.session = axios.create();
    this.params = {
      bl: "boq assistant-bard-web-server_20231112.15_p0",
      _reqid: String(Number(Math.random().toString().slice(2, 8))),
      rt: "c",
    };
    this.data = {
      "f.req": "",
      at: "",
    };
    this.bardie =
      "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
  }

  async configure(keyType, apiKey) {
    console.log("[ 🚀 ] Starting Initialization");
    const sessionMap = {
      1: "__Secure-1PSID",
      2: "__Secure-3PSID",
    };

    const key = sessionMap[keyType];

    if (!key) {
      return {
        content:
          "Invalid session type. Use 1 for __Secure-1PSID or 2 for __Secure-3PSID session type.",
        status: false,
        creator: "RizzyFuzz",
      };
    }

    this.session.defaults.headers = {
      Host: "bard.google.com",
      "X-Same-Domain": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Origin: "https://bard.google.com",
      Referer: "https://bard.google.com/",
      Cookie: `${key}=${apiKey};`,
    };

    await this.setSnim0e();
  }

  async question(message) {
    try {
      if (!this.data.at) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content:
            "Authentication Error! Please make sure to initialize with the correct __Secure-1PSID or __Secure-3PSID value. Check your credentials and try again.",
          status: false,
          creator: "RizzyFuzz",
        };
      }

      console.log("[ 🔎 ] Starting Bard Query");
      console.log("[ 🔎 ] Message: " + message);

      const messageStruct = [[message], null, [null, null, null]];

      console.log("[ 🏗️ ] Building Request");
      this.data["f.req"] = JSON.stringify([
        null,
        JSON.stringify(messageStruct),
      ]);

      console.log("[ 💭 ] Sending Message To Bard");
      const response = await this.session.post(
        this.bardie,
        qs.stringify(this.data),
        {
          params: this.params,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response.status !== 200) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content: `Response Status: ${response.status}`,
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const chatData = JSON.parse(response.data.split("\n")[3])[0][2];

      if (chatData === null) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content: `Response Error: ${response.data}.`,
          status: false,
          creator: "RizzyFuzz",
        };
      }
      console.log("[ 🧩 ] Parsing Output");
      let chatDataParsed = JSON.parse(chatData);
      const formatMarkdown = (text, images) => {
        if (!images) return text;

        for (const imageData of images) {
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
      console.log("[ ✅ ] All Done!\n");
      return {
        content: formatMarkdown(text, images),
        status: true,
        creator: "RizzyFuzz",
      };
    } catch (error) {
      console.log("[ ✖️ ] Failed!\n");
      if (error.code === "ECONNRESET") {
        return {
          content: "Internal Socket Error! Please try again.",
          status: false,
          creator: "RizzyFuzz",
        };
      } else {
        console.error(error);
        return {
          content: "Internal Server Error.",
          status: false,
          creator: "RizzyFuzz",
        };
      }
    }
  }

  async questionWithImage(message, url) {
    try {
      if (!this.data.at) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content:
            "Authentication Error! Please make sure to initialize with the correct __Secure-1PSID or __Secure-3PSID value. Check your credentials and try again.",
          status: false,
          creator: "RizzyFuzz",
        };
      }

      console.log("[ 🔎 ] Starting Bard Query");
      console.log("[ 🔎 ] Message: " + message);
      console.log("[ 🔎 ] Url Image: " + url);

      const messageStruct = [
            [message],
            null,
            [null, null, null],
        ];

        if (url) {
            let imageLocation = await this.#uploadImage(
                `bard-ai_upload`,
                imageBuffer
            );
            messageStruct[0].push(0, null, [
                [[imageLocation, 1], "bard-ai_upload"],
            ]);
        }
      console.log("[ 🏗️ ] Building Request");
      this.data["f.req"] = JSON.stringify([
        null,
        JSON.stringify(messageStruct),
      ]);

      console.log("[ 💭 ] Sending Message To Bard");
      const response = await this.session.post(
        this.bardie,
        qs.stringify(this.data),
        {
          params: this.paras,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response.status !== 200) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content: `Response Status: ${response.status}`,
          status: false,
          creator: "RizzyFuzz",
        };
      }

      const chatData = JSON.parse(response.data.split("\n")[3])[0][2];

      if (chatData === null) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content: `Response Error: ${response.data}.`,
          status: false,
          creator: "RizzyFuzz",
        };
      }
      console.log("[ 🧩 ] Parsing Output");
      let chatDataParsed = JSON.parse(chatData);
      const formatMarkdown = (text, images) => {
        if (!images) return text;

        for (const imageData of images) {
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
      console.log("[ ✅ ] All Done!\n");
      return {
        content: formatMarkdown(text, images),
        status: true,
        creator: "RizzyFuzz",
      };
    } catch (error) {
      console.log("[ ✖️ ] Failed!\n");
      if (error.code === "ECONNRESET") {
        return {
          content: "Internal Socket Error! Please try again.",
          status: false,
          creator: "RizzyFuzz",
        };
      } else {
        console.error(error);
        return {
          content: "Internal Server Error.",
          status: false,
          creator: "RizzyFuzz",
        };
      }
    }
  }

  async #uploadImage(name, url) {
    try {
      console.log("[ 🖼️ ] Starting Image Processing");
      let { data: buffer } = await axios.get(url, {
        responseType: "arraybuffer",
      });
      const size = buffer.length;
      let params = qs.stringify({
        "File name": [name],
      });
      console.log("[ 💻 ] Finding Google Server Destination");
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
      console.log("[ 📤 ] Sending Your Image");
      const imageResponse = await axios.post(uploadUrl, buffer, {
        headers: {
          "X-Goog-Upload-Command": "upload, finalize",
          "X-Goog-Upload-Offset": 0,
          "X-Tenant-Id": "bard-storage",
        },
      });

      const imageFileLocation = imageResponse.data;
      console.log("[ ✅ ] Image Processing Finished\n");
      return imageFileLocation;
    } catch (error) {
      console.error("[ ✖️ ] Image Processing Failed!");
      throw error;
    }
  }

  async setSnim0e() {
    try {
      console.log("[ 🔒 ] Authenticating Google Account");
      const response = await this.session.get("https://bard.google.com/", {
        timeout: 6000,
      });

      if (response.status !== 200) {
        console.log("✖️ Failed!\n");
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
        console.log("[ ✅ ] Initialization Finished\n");
      } else {
        console.log("[ ✖️ ] Failed!\n");
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
