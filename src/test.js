const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const progressStream = require("progress-stream");

function dowloadFile() {
  //下载 的文件 地址
  let fileURL = "https://ghproxy.net/https://github.com/node-fetch/node-fetch/archive/refs/tags/v3.3.2.zip";
  let fileName = "node-fetch v3.3.2.zip"; //path.basename(fileURL);
  //下载保存的文件路径
  let fileSavePath = path.join(__dirname, fileName);
  //缓存文件路径
  let tmpFileSavePath = fileSavePath + ".tmp";
  //下载进度信息保存文件
  let cfgFileSavePath = fileSavePath + ".cfg.json";

  let downCfg = {
    rh: {}, //请求头
    percentage: 0, //进度
    transferred: 0, //已完成
    length: 0, //文件大小
    remaining: 0, //剩余
    first: true, //首次下载
  };
  let tmpFileStat = { size: 0 };
  //判断文件缓存 与 进度信息文件是否存在
  if (fs.existsSync(tmpFileSavePath) && fs.existsSync(cfgFileSavePath)) {
    tmpFileStat = fs.statSync(tmpFileSavePath);
    downCfg = JSON.parse(fs.readFileSync(cfgFileSavePath, "utf-8").trim());
    downCfg.first = false;
    //设置文件
    downCfg.transferred = tmpFileStat.size;
  }

  //创建写入流
  let writeStream = null;

  //请求头
  let fetchHeaders = {
    "Content-Type": "application/octet-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    Pragma: "no-cache",
  };
  //追加请求范围
  if (downCfg.length != 0) {
    fetchHeaders.Range = "bytes=" + downCfg.transferred + "-" + downCfg.length; //71777113
  }
  if (downCfg.rh["last-modified"]) {
    fetchHeaders["last-modified"] = downCfg.rh["last-modified"];
  }
  //校验文件头
  const checkHerder = [
    "last-modified", //文件最后修改时间
    "server", //服务器
    "content-length", //文件大小
    "content-type", //返回类型
    "etag", //文件标识
  ];

  fetch(fileURL, {
    method: "GET",
    headers: fetchHeaders,
    // timeout: 100,
  })
    .then((res) => {
      let h = {};
      res.headers.forEach(function (v, i, a) {
        h[i.toLowerCase()] = v;
      });
      // console.log(h);
      //文件是否发生变化
      let fileIsChange = false;
      //是否首次下载
      if (downCfg.first) {
        //记录相关信息
        for (let k of checkHerder) downCfg.rh[k] = h[k];
        downCfg.length = h["content-length"];
      } else {
        //比较响应变化
        for (let k of checkHerder) {
          if (downCfg.rh[k] != h[k]) {
            fileIsChange = true;
            break;
          }
        }
        //是否运行范围下载
        downCfg.range = res.headers.get("content-range") ? true : false;
      }
      //创建文件写入流
      writeStream = fs
        .createWriteStream(tmpFileSavePath, {
          flags: !downCfg.range || fileIsChange ? "w" : "a",
        })
        .on("error", function (e) {
          console.error("error==>", e);
        })
        .on("ready", function () {
          console.log("开始下载:", fileURL);
        })
        .on("finish", function () {
          //下载完成后重命名文件
          fs.renameSync(tmpFileSavePath, fileSavePath);
          fs.unlinkSync(cfgFileSavePath);
          console.log("文件下载完成:", fileSavePath);
        });

      //写入信息文件
      fs.writeFileSync(cfgFileSavePath, JSON.stringify(downCfg));
      //获取请求头中的文件大小数据
      let fsize = h["content-length"];
      //创建进度
      let str = progressStream({
        length: fsize,
        time: 200 /* ms */,
      });
      //创建进度对象
      str.on("progress", function (progressData) {
        //不换行输出
        // let percentage = Math.round(progressData.percentage);
        // console.log(percentage);
        //     console.log(`
        //     进度 ${progressData.percentage}
        //     已完成 ${progressData.transferred}
        //     文件大小 ${progressData.length}
        //     剩余 ${progressData.remaining}
        //         ${progressData.eta}
        //     运行时 ${progressData.runtime}
        //         ${ progressData.delta}
        //    速度 ${ progressData.speed}
        //             `);
        //console.log(progress);
        /*
        {
            percentage: 9.05,
            transferred: 949624,
            length: 10485760,
            remaining: 9536136,
            eta: 42,
            runtime: 3,
            delta: 295396,
            speed: 949624
        }
        */
      });
      res.body.pipe(str).pipe(writeStream);
      // res.headers.forEach(function (v, i, a) {
      //     console.log(i + " : " + v);
      // })
    })
    .catch((e) => {
      //自定义异常处理
      console.log(e);
    });
}

dowloadFile()
