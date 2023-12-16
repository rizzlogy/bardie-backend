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
        use_personalization_extraction: true,
        queryTraceId: uuid,
        chatId: uuid,
        pastChatLength: 0,
        chat: [],
      },
      headers: {
        Host: "you.com",
        "X-Same-Domain": "1",
        Referer: "https://you.com/",
        Origin: "https://you.com",
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
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
