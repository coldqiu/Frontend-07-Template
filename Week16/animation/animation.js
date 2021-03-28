// cSpell:ignore Inited
// 动画
// js 处理帧的几种方法：
/**
 * setInterval setTimeout 16 requestAnimationFrame
 *
 * let tick =() => {
 *  requestAnimationFrame(tick)
 * }
 * 把这种执行自身的tick 包装成一个概念 Timeline
 */
const TICK = Symbol("tick");
const TICK_HANDLER = Symbol("tick-handler");
const ANIMATIONS = Symbol("animation");
const START_TIME = Symbol("start-time");
const PAUSE_START = Symbol("pause-start");
const PAUSE_TIME = Symbol("pause-time");

export class Timeline {
  constructor() {
    this.state = "Inited";
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }
  start() {
    if (this.state !== "Inited") {
      return;
    }
    this.state = "started";
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      // tick 钟表的嘀嗒声
      // console.log("tick");
      let now = Date.now();
      // console.log("now t", now);
      for (let animation of this[ANIMATIONS]) {
        let t;
        if (this[START_TIME].get(animation) < startTime) {
          t = now - startTime - this[PAUSE_TIME] - animation.delay;
        } else {
          t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay;
        }

        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          t = animation.duration;
        }

        if (t > 0) {
          animation.receive(t);
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    };
    this[TICK]();
  }
  // 速率
  // set rate() {

  // }
  // get rate() {

  // }
  pause() {
    if (this.state !== "started") {
      return;
    }
    this.state = "paused";
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }
  // 恢复
  resume() {
    if (this.state !== "paused") {
      return;
    }
    this.state = "started";
    this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
    this[TICK]();
  }

  reset() {
    this.pause();
    this.state = "Inited";
    this[PAUSE_TIME] = 0;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[PAUSE_START] = 0;
    this[TICK_HANDLER] = null;
  }

  add(animation, startTime) {
    if (arguments.length < 2) {
      startTime = Date.now();
    }
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, startTime);
  }
}

export class Animation {
  constructor(object, property, startValue, endValue, duration, delay, timingFunction, template) {
    timingFunction = timingFunction || ((v) => v);
    template = template || ((v) => v);
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction;
    this.template = template;
    this.delay = delay;
  }
  receive(time) {
    console.log("receiveTime time", time);
    let range = this.endValue - this.startValue;
    let progress = this.timingFunction(time / this.duration);

    this.object[this.property] = this.template(this.startValue + range * progress);
  }
}
