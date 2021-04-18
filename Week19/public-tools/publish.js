let http = require("http");
let fs = require("fs");
let archiver = require("archiver");
let child_process = require("child_process");
let querystring = require("querystring");

// fs.stat("./sample.html", (err, stats) => {

// });

// 1.打开 https://github.com/login/oauth/authorize
// child_process.exec(`open http://www.baidu.com`);
child_process.exec(`open https://github.com/login/oauth/authorize?client_id=Iv1.d2b01b7b68014ca4`);

// 3.创建server，接受token,后点击发布

http
  .createServer(function (request, response) {
    let query = querystring.parse(request.url.match(/^\/\?([\s\S]+)$/)[1]);
    console.log("query", query);
  })
  .listen(8083);


let request = http.request(
  {
    hostname: "127.0.0.1",
    port: 8082,
    // port: 8882,
    method: "POST",
    header: {
      "Content-Type": "application/octet-stream",
      // "Content-Length": stats.size,
    },
  },
  (response) => {
    console.log("publish.js response");
  }
);
const archive = archiver("zip", {
  zlib: { level: 9 },
});

archive.directory("./sample/", false);
archive.finalize();

archive.pipe(request);
// archive.pipe(fs.createWriteStream("tmp.zip"));



