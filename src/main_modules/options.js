const { getProxySettings } = require("get-proxy-settings");
const { HttpsProxyAgent } = require("https-proxy-agent");


const fetchOptions = async () => {
  return {
    agent: await httpsAgent(),
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  };
};

const httpsAgent = async () => {
  const proxy = await getProxySettings();
  if (proxy) {
    return new HttpsProxyAgent(proxy.http);
  } else {
    return false;
  }
}

module.exports = {
  fetchOptions,
  httpsAgent
};
