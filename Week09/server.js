// cSpell:ignore maaa
const http = require("http");

const server = http.createServer((req, res) => {
  let body = [];
  req
    .on("error", (err) => {
      console.log(err);
    })
    .on("data", (chunk) => {
      console.log("chunk:", chunk, chunk.toString());
      body.push(chunk);
    })
    .on("end", () => {
      console.log("body1:", body);
      body = Buffer.concat(body).toString();
      console.log("body2:", body);
      res.writeHead(200, {
        "Content-Type": "text/html",
      });
      res.end(
        `
        <html maaa=a >
        <head>
            <style>
        body div #myId{
            width: 100px;
            background-color: #ff5000;
        }
        body div img {
            width: 30px;
            background-color: #ff1111;
        }
            </style>
        </head>
        <body>
            <div>
                <img id="myId" />
                <img />
                <img />
            </div>
        </body>
        </html>
        `
      );
    });
});

server.listen(8080, () => {
  console.log("服务器已启动");
});
