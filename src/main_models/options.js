const urlheader = "https://ghproxy.net/";

const urlsToTest = [
  "https://mirror.ghproxy.com/",
  "https://ghproxy.net/",
  "https://moeyy.cn/gh-proxy/",
  "",
];

const fetchOptions = {
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
};

async function initurlheader(
  testUrl = "https://raw.githubusercontent.com/LiteLoaderQQNT/LiteLoaderQQNT/main/package.json",
  urls = urlsToTest
) {
  const requests = urls.map(async (url) => {
    const start = performance.now();
    try {
      await fetch(url + testUrl);
      const end = performance.now();
      return { url, responseTime: end - start };
    } catch (error) {
      return { url, responseTime: Infinity };
    }
  });

  const results = await Promise.all(requests);

  const fastest = results.reduce(
    (min, result) => {
      return result.responseTime < min.responseTime ? result : min;
    },
    { responseTime: Infinity }
  );

  urlheader = fastest.url;
}


module.exports = {
  urlheader,
  fetchOptions,
  initurlheader
};
