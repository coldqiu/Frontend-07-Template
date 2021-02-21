// parser 逐步接受response信息 来构造response的不同部分
// 构造一个ResponseParser而不是一个 Response类
// 在Request的构造函数中收集信息
// send函数把信息发送给服务器
// send函数是异步的，所以返回Promise
// Response必须是分段构造，所以用ResponseParser来“装配”
// ResponseParser分段处理ResponseText,用状态机来分析处理文本结构

const net = require("net");
const parser = require("./parser.js");
const render = require("./render");
const images = require("images");

class Request {
  constructor(options) {
    this.method = options.method || "GET";
    this.host = options.host || "127.0.0.1";
    this.port = options.port || "8080";
    this.path = options.path || "/";
    this.headers = options.headers || {};
    this.body = options.body || {};

    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    if (this.headers["Content-Type"] === "application/x-www-form-urlencoded") {
      this.bodyText = Object.keys(this.body)
        .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
        .join("&");
    } else if (headers["Content-Type"] === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    }

    this.headers["Content-Length"] = this.bodyText.length;
  }

  // construct request content
  // each line can not has space in the front of line!!!
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers)
  .map((key) => `${key}: ${this.headers[key]}`)
  .join("\r\n")}\r
\r
${this.bodyText}
`;
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      const parser = new ResponseParser();
      if (connection) {
        // if has connection, then use it to send request content.
        connection.write(this.toString());
      } else {
        // if has not connection, then create one to send request content.
        connection = net.createConnection(
          {
            host: this.host,
            port: this.port,
          },
          () => {
            console.log("Client Connected!");
            connection.write(this.toString());
          }
        );
      }

      connection.on("data", (data) => {
        console.log("connection on data: \n", data.toString());
        parser.receive(data.toString());
        if (parser.isFinished) {
          resolve(parser.response);
          console.log("Client end after parsing.");
          connection.end();
        }
      });

      connection.on("error", (err) => {
        reject(err);
        console.log(`Client end on error: ${err}`);
        connection.end();
      });

      connection.on("end", () => {
        console.log("Client end.");
      });
    });
  }
}

/**
 * ResponseParser 类的实现
 * 逐步接受 response 文本并分析
 */
class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0; //\r状态
    this.WAITING_STATUS_LINE_END = 1; //\n状态
    this.WAITING_HEADER_NAME = 2; //header name 状态
    this.WAITING_HEADER_SPACE = 3; //":"+"空格"状态
    this.WAITING_HEADER_VALUE = 4; //header value状态
    this.WAITING_HEADER_LINE_END = 5; //\n状态
    this.WAITING_HEADER_BLOCK_END = 6; //header之后的空行状态
    this.WAITING_BODY = 7; //body格式不固定，无法在同一个Response Parser中解决状态

    this.current = this.WAITING_STATUS_LINE; //开始置为初始状态
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\S\s]+)/);
    return {
      statusCode: RegExp.$1, //RegExp.$1是RegExp的一个属性,指的是与正则表达式匹配的第一个子匹配(以括号为标志)字符串
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join(""),
    };
  }

  receive(str) {
    for (let i = 0; i < str.length; i++) {
      this.receiveCharState(str.charAt(i));
    }
  }

  //状态机代码
  receiveCharState(char) {
    if (this.current === this.WAITING_STATUS_LINE) {
      if (char === "\r") {
        this.current = this.WAITING_STATUS_LINE_END;
      } else {
        this.statusLine += char;
      }
    } else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === "\n") {
        this.current = this.WAITING_HEADER_NAME;
      }
    } else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ":") {
        this.current = this.WAITING_HEADER_SPACE;
      } else if (char === "\r") {
        //此时所有的header已经收到
        this.current = this.WAITING_HEADER_BLOCK_END;
        //”Transfer-Encoding“在 node 中是”chunked“形式，在此根据不同的值，调用不同的 bodyParser;
        if (this.headers["Transfer-Encoding"] === "chunked") {
          this.bodyParser = new TrunkedBodyParser();
        } else if (this.headers["Transfer-Encoding"] === "xxx") {
          //写其它的 bodyParser
        }
      } else {
        this.headerName += char;
      }
    } else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === " ") {
        this.current = this.WAITING_HEADER_VALUE;
      }
    } else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === "\r") {
        this.current = this.WAITING_HEADER_LINE_END;
        this.headers[this.headerName] = this.headerValue;
        this.headerName = "";
        this.headerValue = "";
      } else {
        this.headerValue += char;
      }
    } else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === "\n") {
        this.current = this.WAITING_HEADER_NAME;
      }
    } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === "\n") {
        this.current = this.WAITING_BODY;
      }
    } else if (this.current === this.WAITING_BODY) {
      this.bodyParser.receiveCharState(char);
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    /**分析chunk：
     * f                                        //trunk长度
     * hello word zhz                           //trunk内容
     *                                          //trunk结束
     * 0                                        //trunk长度，遇到body为0的chunk，结束body
     *                                          //trunk内容，内容为空
     *                                          //trunk结束
     */
    this.WAITING_LENGTH = 0; //读取长度，遇到\r，退出当前状态，到下一个状态；
    this.WAITING_LENGTH_LINE_END = 1; //遇到\n，退出当前状态，到下一个状态；
    this.READING_TRUNK = 2; //计算内容长度，匹配读取的长度，退出当前状态，到下一个状态；
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;

    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }

  receiveCharState(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === "\r") {
        //此时读取完length，若为0，则isFinished；
        if (this.length === 0) {
          this.isFinished = true;
        }
        this.current = this.WAITING_LENGTH_LINE_END;
      } else {
        //f3(16) ==> 243(10)
        this.length *= 16;
        this.length += parseInt(char, 16);
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) {
      if (char === "\n") {
        this.current = this.READING_TRUNK;
      }
    } else if (this.current === this.READING_TRUNK) {
      this.content.push(char);
      this.length--;
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE;
      }
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === "\r") {
        this.current = this.WAITING_NEW_LINE_END;
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === "\n") {
        this.current = this.WAITING_LENGTH;
      }
    }
  }
}

/**
 * 请求方法的使用
 */
void (async function () {
  let request = new Request({
    method: "POST", //http
    host: "127.0.0.1", //IP层
    port: "8080", //tcp
    path: "/", //http
    headers: {
      //http
      ["X-Foo2"]: "custom",
    },
    body: {
      name: "winter",
    },
  });
  let response = await request.send();
  // console.log("response.body:", response.body);
  let dom = parser.parseHTML(response.body);
  console.log("dom", dom);
  let viewport = images(800, 600);
  render(viewport, dom);
  viewport.save("viewport1.jpg");
})();
