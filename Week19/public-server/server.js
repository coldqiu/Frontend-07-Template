let http = require("http");
let fs = require("fs");
let unzipper = require("unzipper");
let querystring = require("querystring");

// 2.auth路由： 接受code 用code+client_id+client_secret换token

function auth(request, response) {
  let query = querystring.parse(request.url.match(/^\/auth\?([\s\S]+)$/)[1]);
  // console.log("query", query);
  getToken(query.code, function (info) {
    console.log("info", info);
    // response.write(JSON.stringify(info));
    response.write(`<a href='http://localhost:8083/?token=${info.access_token}'>publish</a>`);
    response.end();
  });
}

function getToken(code, callback) {
  let request = https.request(
    {
      hostname: "github.com",
      path: `/login/oauth/access_token?code=${code}&client_id=${client_id}&client_secret=${client_secret}`,
      port: 443,
      method: "POST",
    },
    function (response) {
      console.log("response", response);
      let body = "";
      response.on("data", (chunk) => {
        // console.log("chunk.toString()", chunk.toString());
        body += chunk.toString();
      });

      response.on("end", () => {});
      console.log("body", body);
      let o = querystring.parse(body);
      // console.log("o", o);
      callback(o);
    }
  );
  request.end();
}
//
// 4.publish路由：用token获取用户信息，检查权限 接受发布
function publish(request, response) {
  let query = querystring.parse(request.url.match(/^\/publish\?([\s\S]+)$/)[1]);
  // if (query.token) {
  // }
  getUser(query.token, (info) => {
    // 应该接入权限系统
    if (info.login === "coldqiu") {
      request.pipe(unzipper.Extract({ path: "../server/public/" }));
      request.on("end", function () {
        response.end("success");
      });
    }
  });
  // https://docs.github.com/cn/developers/apps/authorizing-oauth-apps
  // Authorization: token OAUTH-TOKEN
  // GET https://api.github.com/user
}

function getUser(token, callback) {
  let request = https.request(
    {
      hostname: "api.github.com",
      path: `user`,
      port: 443,
      method: "GET",
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "toy-publish",
      },
    },
    function (response) {
      console.log("response", response);
      let body = "";
      response.on("data", (chunk) => {
        // console.log("chunk.toString()", chunk.toString());
        body += chunk.toString();
      });

      response.on("end", () => {});
      console.log("body", body);
      let o = querystring.parse(body);
      // console.log("o", o);
      callback(o);
    }
  );
  request.end();
}

http
  .createServer(function (request, response) {
    // console.log("request");
    if (request.url.match(/^\/auth\?/)) {
      return auth(request, response);
    }
    if (request.url.match(/^\/publish\?/)) {
      return publish(request, response);
    }
  })
  .listen(8082);
