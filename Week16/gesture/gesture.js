// cSpell:ignore panend pressend

// let element = document.documentElement; // <html>

// let handler;
// let startX, startY; // 是否移动10px
// let isPan = false,
//   isTap = true,
//   isPress = false; // 一次性判断

// 这些变量放在调用函数的上下文中

// export function dispatch(type, properties) {
//   let event = new Event(type);
//   // console.log("event", event);
//   for (let name in properties) {
//     event[name] = properties[name];
//   }
//   element.dispatchEvent(event);
// }

export class Dispatcher {
  constructor(element) {
    this.element = element;
  }
  dispatch(type, properties) {
    let event = new Event(type);
    // console.log("event", event);
    for (let name in properties) {
      event[name] = properties[name];
    }
    this.element.dispatchEvent(event);
  }
}
// 解耦 分成三部分
// listen => recognize => dispatch

// new Listener(new Recognize(dispatch))

export class Listener {
  constructor(element, recognize) {
    let contexts = new Map();

    let isListeningMouse = false; // 处理同时按两个按键 多次监听

    element.addEventListener("mousedown", (event) => {
      // console.log(event.button);　鼠标有五个键

      let context = Object.create(null);
      contexts.set("mouse" + (1 << event.button), context);

      recognize.start(event, context);
      let mousemove = (event) => {
        // mousemove 不需要按键就能触发， 不分按键 没有event.button
        // mousemove 有event.buttons 用掩码表示那些按键被按下来了
        let button = 1;
        while (button <= event.buttons) {
          if (button & event.buttons) {
            // 调整 中键和右键顺序
            // order of buttons & button property is not same
            let key;
            if (button === 2) key = 4;
            else if (button === 4) key = 2;
            else key = button;
            let context = contexts.get("mouse" + key);
            recognize.move(event, context);
          }
          button = button << 1;
        }
        // console.log(event.clientX, event.clientY);
      };

      let mouseup = (event) => {
        let context = contexts.get("mouse" + (1 << event.button));
        recognize.end(event, context);
        contexts.delete("mouse" + (1 << event.button));
        // 不全部取消事件监听 可能有多个按键
        if (event.buttons == 0) {
          document.removeEventListener("mousemove", mousemove);
          document.removeEventListener("mouseup", mouseup);
          isListeningMouse = false;
        }
      };
      // 不多次监听
      if (!isListeningMouse) {
        document.addEventListener("mousemove", mousemove);
        document.addEventListener("mouseup", mouseup);
        isListeningMouse = true;
      }
    });

    element.addEventListener("touchstart", (event) => {
      for (let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognize.start(touch, context);
      }
    });
    element.addEventListener("touchmove", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.move(touch, context);
      }
    });
    element.addEventListener("touchend", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);

        recognize.end(touch, context);
        contexts.delete(touch.identifier);
      }
    });
    // touch事件被打断触发 touchcancel
    element.addEventListener("touchcancel", (event) => {
      for (let touch of event.changedTouches) {
        let context = contexts.get(touch.identifier);
        recognize.cancel(touch, context);
        contexts.delete(touch.identifier);
      }
    });
  }
}

export class Recognize {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  start(point, context) {
    //   console.log("start", point.clientX, point.clientY);
    (context.startX = point.clientX), (context.startY = point.clientY);

    this.dispatcher.dispatch("start", {
      clientX: point.clientX,
      clientY: point.clientY,
    });

    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      },
    ];

    context.isTap = true;
    context.isPan = false;
    context.isPress = false;

    context.handler = setTimeout(() => {
      context.isTap = false;
      context.isPan = false;
      context.isPress = true;
      // console.log("press");
      this.dispatcher.dispatch("press", {});
      context.handler = null;
    }, 500);
  }
  move(point, context) {
    //   console.log("move", point.clientX, point.clientY);

    let dx = point.clientX - context.startX,
      dy = point.clientY - context.startY;

    if (!context.isPan && dx ** 2 + dy ** 2 > 100) {
      context.isTap = false;
      context.isPan = true;
      context.isPress = false;
      // console.log("panStart");
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      this.dispatcher.dispatch("panStart", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
      clearTimeout(context.handler);
    }

    if (context.isPan) {
      // console.log("dx, dy", dx, dy);
      console.log("pan");
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      this.dispatcher.dispatch("pan", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
    }

    // 放新的点, 总是存最新的 500ms内的点
    context.points = context.points.filter((point) => Date.now() - point.t < 500);
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  }
  end(point, context) {
    //   console.log("end", point.clientX, point.clientY);
    if (context.isTap) {
      console.log("tap");
      this.dispatcher.dispatch("tap", {});
      clearTimeout(context.handler);
    }

    if (context.isPress) {
      // console.log("pressend");
      this.dispatcher.dispatch("pressend", {});
    }
    // 计算速度
    context.points = context.points.filter((point) => Date.now() - point.t < 500);

    let v, d;
    if (context.points.length !== 0) {
      d = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
      v = d / (Date.now() - context.points[0].t);
    } else {
      v = 0;
    }
    // console.log("v", v);

    if (v > 1.5) {
      // 像素每毫秒
      context.isFlick = true;
    } else {
      context.isFlick = false;
    }
    if (context.isFlick) {
      // console.log("flick");
      // dispatch("flick", context);
      this.dispatcher.dispatch("flick", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity: v,
      });
    }

    if (context.isPan) {
      // console.log("panend");
      this.dispatcher.dispatch("panend", {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
      });
    }
  }
  cancel(point, context) {
    //   console.log("cancel", point.clientX, point.clientY);
    clearTimeout(context.handler);
    this.dispatcher.dispatch("cancel", {});
  }
}

export function enableGesture(element) {
  new Listener(element, new Recognize(new Dispatcher(element)));
}
