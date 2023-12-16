const axios = require("axios");
const { randomUUID } = require("crypto");

function extractJsonData(match) {
  const jsonData = match.substring(6);
  try {
    return JSON.parse(jsonData);
  } catch (error) {
    return null;
  }
}

function filterDataValues(dataValues) {
  return dataValues.filter((value) => value && value.youChatToken);
}

function buildResString(filteredDataValues) {
  return filteredDataValues.reduce(
    (res, value) => res + value.youChatToken,
    "",
  );
}

function parse(data) {
  const regex = /data:\s+{[^}]*}/g;
  const dataMatches = data.match(regex);

  if (dataMatches) {
    const dataValues = dataMatches.map(extractJsonData);
    const filteredDataValues = filterDataValues(dataValues);

    return buildResString(filteredDataValues)
      .replace(/\[\[\d+\]\]/g, "")
      .replace(/\*\*/g, "*");
  } else {
    return undefined;
  }
}

module.exports = async function YouAI(query) {
  try {
    let uuid = await randomUUID();
    const { data } = await axios({
      method: "GET",
      url: "https://you.com/api/streamingSearch",
      params: {
        q: query,
        page: 1,
        count: 10,
        safeSearch: "Moderate",
        mkt: "id-ID",
        responseFilter:
          "WebPages,translations,TimeZone,Computation,RelatedSearchs",
        domain: "youchat",
        use_personalization_extraction: false,
        queryTraceId: uuid,
        chatId: uuid,
        pastChatLength: 0,
        chat: [],
      },
      headers: {
        Referer: "https://you.com/",
        Origin: "https://you.com",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Cookie: `uuid_guest=${uuid}; uuid_guest_backup=${uuid}; safesearch_guest=Moderate; __cf_bm=cm8dn6K7U9pFO9r1kVkYajhrbp.k3I6cG.mbTTB8rbk-1702751455-1-AeEwWhDpHNVVsmIsuHGQPacXBsuChM6gKAVVjAjkZaCy8lXakFcGId+0nsswv7A3E3Iunc5lGpZozQN0+/j5eYMrM+z6ZeBTW9E/SUu/s9Oa; _cfuvid=FCbrPWnkfx4wnBvmV7pwF9ZOuVsSd.5E.S6SRkb.GFk-1702751455010-0-604800000; chat_mode=default; youpro_subscription=false; you_subscription=free; AF_DEFAULT_MEASUREMENT_STATUS=true; _ga=GA1.1.754605520.1702751459; FPID=FPID2.2.p8bzOcfwLpmjHUPWKHvv4xXsQlY0Mt%2FRPqjR4QoBWpo%3D.1702751459; FPLC=M1Xa47M2vBIDI20ROJQualERCyf7m0gYKNoKNLoXBOu3l%2B4mZRxVYxgFj%2BWdQlhxr5nOwLYywe7Bx4qugpbyBRJPyWBJBFJ83k%2FWypO8Y2KefLCQHU800ojvaVL2jg%3D%3D; FPAU=1.2.2121854728.1702751461; afUserId=${uuid}; AF_SYNC=1702751460501; _ga_2N7ZM9C56V=GS1.1.1702751459.1.1.1702751460.0.0.0; _gtmeec=eyJjdCI6IjdmMjlhNzU1MzZhMjEwY2M2OTJhNzk3MWYxMjBjOTcwMzNjNGRlODIzZjBmNTUwZGI4Zjk4ZGM1ZjczNjkxNWEiLCJzdCI6IjRjZjY4MjlhYTkzNzI4ZThmM2M5N2RmOTEzZmIxYmZhOTVmZTU4MTBlMjkzM2EwNTk0M2Y4MzEyYTk4ZDljZjIiLCJjb3VudHJ5IjoiYTU2MTQ1MjcwY2U2YjNiZWJkMWRkMDEyYjczOTQ4Njc3ZGQ2MThkNDk2NDg4YmM2MDhhM2NiNDNjZTM1NDdkZCJ9; youchat_personalization=true; youchat_smart_learn=true; youchatMobileNudge_VisitCount=1;`,
      },
    });

    const dataFormat = parse(data);

    if (!dataFormat) {
      return {
        message: "Data parsing error.",
        creator: "RizzyFuzz",
        status: false,
      };
    }

    return {
      content: dataFormat,
      creator: "RizzyFuzz",
      status: true,
    };
  } catch (error) {
    console.error("Error in YouAI:", error);
    return {
      message: "Error, please try again later.",
      errorMessage: error.message,
      creator: "RizzyFuzz",
      status: false,
    };
  }
};
