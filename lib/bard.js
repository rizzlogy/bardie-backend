const axios = require("axios");
const qs = require("qs");
const https = require("https");

class BardAI {
  constructor() {
    this.session = axios.create();
    this.params = {
      bl: "boq_assistant-bard-web-server_20230419.00_p1",
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

    const headers = {
      Host: "bard.google.com",
      Accept: "*/*",
      "Sec-Fetch-Site": "same-origin",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-User": "?1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "X-Same-Domain": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Origin: "https://bard.google.com",
      Referer: "https://bard.google.com/",
    };
    this.session.defaults.headers = headers;
    this.session.defaults.headers.Cookie = `${key}=${apiKey}`;
    await this.setSnim0e();
  }

  async question(input_text) {
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
      console.log("[ 🔎 ] Query: " + input_text);
      const input_text_struct = [[input_text], null, [null, null, null]];

      console.log("[ 🏗️ ] Building Request");
      this.data["f.req"] = JSON.stringify([
        null,
        JSON.stringify(input_text_struct),
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

      const cum = JSON.parse(response.data.split("\n")[3])[0][2];

      if (cum === null) {
        console.log("[ ✖️ ] Failed!\n");
        return {
          content: `Response Error: ${response.data}.`,
          status: false,
          creator: "RizzyFuzz",
        };
      }
      console.log("[ 🧩 ] Parsing Output");
      const cin = JSON.parse(cum);

      console.log("[ ✅ ] All Done!\n");
      return {
        content: cin[4][0][1][0],
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

  async setSnim0e() {
    try {
      console.log("[ 🔒 ] Authenticating Google Account");
      const agent = new https.Agent({
        rejectUnauthorized: false,
      });

      const response = await this.session.get("https://bard.google.com/", {
        timeout: 6000,
        httpsAgent: agent,
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
