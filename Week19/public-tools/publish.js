let http = require("http");
let fs = require("fs");
let archiver = require("archiver");

// fs.stat("./sample.html", (err, stats) => {

// });

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
