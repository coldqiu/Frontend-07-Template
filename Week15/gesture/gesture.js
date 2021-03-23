// cSpell:ignore panend pressend

let element = document.documentElement; // <html>

element.addEventListener("mousedown", (event) => {
  start(event);
  let mousemove = (event) => {
    move(event);
    // console.log(event.clientX, event.clientY);
  };

  let mouseup = (event) => {
    end(event);
    element.removeEventListener("mousemove", mousemove);
    element.removeEventListener("mouseup", mouseup);
  };

  element.addEventListener("mousemove", mousemove);
  element.addEventListener("mouseup", mouseup);
});

element.addEventListener("touchstart", (event) => {
  for (let touch of event.changedTouches) {
    start(touch);
  }
});
element.addEventListener("touchmove", (event) => {
  for (let touch of event.changedTouches) {
    move(touch);
  }
});
element.addEventListener("touchend", (event) => {
  for (let touch of event.changedTouches) {
    end(touch);
  }
});
// touch事件被打断触发 touchcancel
element.addEventListener("touchcancel", (event) => {
  for (let touch of event.changedTouches) {
    cancel(touch);
  }
});

let handler;
let startX, startY; // 是否移动10px
let isPan = false,
  isTap = true,
  isPress = false; // 一次性判断
let start = (point) => {
  //   console.log("start", point.clientX, point.clientY);
  (startX = point.clientX), (startY = point.clientY);

  isTap = true;
  isPan = false;
  isPress = false;

  handler = setTimeout(() => {
    isTap = false;
    isPan = false;
    isPress = true;
    console.log("press");
    handler = null;
  }, 500);
};

let move = (point) => {
  //   console.log("move", point.clientX, point.clientY);

  let dx = point.clientX - startX,
    dy = point.clientY - startY;

  if (!isPan && dx ** 2 + dy ** 2 > 100) {
    isTap = false;
    isPan = true;
    isPress = false;
    console.log("panStart");
    clearTimeout(handler);
  }

  if (isPan) {
    // console.log("dx, dy", dx, dy);
    console.log("pan");
  }
};
let end = (point) => {
  //   console.log("end", point.clientX, point.clientY);
  if (isTap) {
    console.log("tap");
    clearTimeout(handler);
  }
  if (isPan) {
    console.log("panend");
  }
  if (isPress) {
    console.log("pressend");
  }
};
let cancel = (point) => {
  //   console.log("cancel", point.clientX, point.clientY);
  clearTimeout(handler);
};
