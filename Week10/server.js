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
            body {
              display: flex;
              background-color: rgba(255, 255, 255);
            }
        body #myId{
            width: 100px;
            height: 100px;
            background-color: #00a1d6;
        }
        body img {
            width: 220px;
            height: 220px;
            background-color: #ffa726;
        }
            </style>
        </head>
        <body>
              <img id="myId" />
              <img />
              <img />
        </body>
        </html>
        `
      );
    });
});

server.listen(8080, () => {
  console.log("服务器已启动");
});
