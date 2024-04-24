const { HttpsProxyAgent } = require("https-proxy-agent");
const { getProxySettings } = require("get-proxy-settings");

let fetchOptions = async () => {
  return {
    agent: await httpsAgent(),
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  };
};

async function httpsAgent() {
  const proxy = await getProxySettings();
  if (proxy) {
    return new HttpsProxyAgent(proxy.http);
  } else {
    return false;
  }
}

module.exports = {
  fetchOptions,
  httpsAgent,
};
