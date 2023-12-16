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
        queryTraceId: randomUUID(),
        chatId: randomUUID(),
        pastChatLength: 0,
        chat: [],
      },
      headers: {
        Referer: "https://you.com/",
        Origin: "https://you.com",
        "User-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3",
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
    console.log(error);
    return {
      message: "Error, please try again later.",
      errorMessage: error.message,
      creator: "RizzyFuzz",
      status: false,
    };
  }
};
