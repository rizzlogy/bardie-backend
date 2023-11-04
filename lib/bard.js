const axios = require("axios");
const qs = require("qs");

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
    this.post_url =
      "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate";
  }

  async configure(keyType, apiKey) {
    console.log("🚀 Starting intialization");
    const sessionMap = {
      1: "__Secure-1PSID",
      2: "__Secure-3PSID",
    };

    const key = sessionMap[keyType];

    if (!key) {
      return {
        content:
          "Invalid session type. Use 1 for __Secure_1PSID or 2 for __Secure_3PSID session type.",
      };
    }

    const headers = {
      Host: "bard.google.com",
      "X-Same-Domain": "1",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      Origin: "https://bard.google.com",
      Referer: "https://bard.google.com/",
    };
    this.session.defaults.headers = headers;
    this.session.defaults.headers.Cookie = `${key}=${apiKey}`;
    await this.setSnim0e();
  }

  async question(input_text) {
    if (!this.data.at) {
      return {
        content:
          "Authentication Error! Please make sure to initialize with the correct __Secure-1PSID or __Secure-3PSID value. Check your credentials and try again.",
      };
    }
    console.log("🔎 Starting Bard Query");
    const input_text_struct = [[input_text], null, ["", "", ""]];

    console.log("🏗️ Building Request");
    this.data["f.req"] = JSON.stringify([
      null,
      JSON.stringify(input_text_struct),
    ]);

    console.log("💭 Sending message to Bard");
    const response = await this.session.post(
      this.post_url,
      qs.stringify(this.data),
      {
        params: this.params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    if (response.status !== 200) {
      throw new Error(`Response Status: ${response.status}`);
    }

    const resp_dict = JSON.parse(response.data.split("\n")[3])[0][2];

    if (resp_dict === null) {
      return { content: `Response Error: ${response.data}.` };
    }
    console.log("🧩 Parsing output");
    const parsed_answer = JSON.parse(resp_dict);

    const bard_answer = {
      content: parsed_answer[4][0][1][0],
    };
    console.log("✅ All done!\n");
    console.log(parsed_answer);
    return bard_answer;
  }

  async setSnim0e() {
    try {
      console.log("🔒 Authenticating your Google account");
      const response = await this.session.get("https://bard.google.com/");

      if (response.status !== 200) {
        throw new Error(`Response Status: ${response.status}`);
      }

      if (!response.headers["set-cookie"]) {
        throw new Error(
          "Invalid __Secure-1PSID or __Secure-3PSID value. Please ensure you provide a valid __Secure-1PSID or __Secure-3PSID value.",
        );
      }

      const regex = /SNlM0e":"(.*?)"/;
      const match = response.data.match(regex);

      if (match) {
        this.data.at = match[1];
        console.log("✅ Initialization finished\n");
      } else {
        throw new Error(
          "Failed to retrieve SNlM0e pattern. Please ensure you provide a valid __Secure-1PSID or __Secure-3PSID value.",
        );
      }
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = BardAI;
