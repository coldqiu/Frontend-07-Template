// 在浏览器里执行 看效果

let desc = {
  green: 10,
  yellow: 2,
  red: 5,
};
let dom = document.getElementsByTagName("body")[0];

async function turn(obj) {
  while (obj) {
    for (let color in obj) {
      await light(color, obj[color]);
    }
  }
}
function light(color, time) {
  dom.style.background = color;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time * 1000);
  });
}

turn(desc);
