import { Component } from "./framework";
import { enableGesture } from "./gesture/gesture.js";
import { Animation, Timeline } from "./animation/animation.js";
import { ease } from "./ease.js";

export class Carousel extends Component {
  constructor(params) {
    super();
    this.attributes = Object.create(null);
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }
  render() {
    this.root = document.createElement("div");

    this.root.classList.add("carousel");

    for (let record of this.attributes.src) {
      let child = document.createElement("div");
      child.style.backgroundImage = `url('${record}')`;
      this.root.appendChild(child);
    }

    enableGesture(this.root);
    let timeline = new Timeline();
    timeline.start();

    let handler = null;

    let children = this.root.children;
    let position = 0;

    let t = 0;
    let ax = 0;
    this.root.addEventListener("start", (event) => {
      timeline.pause();
      clearInterval(handler);
      let progress = (Date.now() - t) / 1500; // 动画播放进度
      ax = ease(progress) * 500 - 500; // 动画造成的位移
    });

    this.root.addEventListener("pan", (event) => {
      console.log("panend event", event);
      let x = event.clientX - event.startX - ax; // 计算拖拽位移时减去动画位移
      let current = position - (x - (x % 500)) / 500;

      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = ((pos % children.length) + children.length) % children.length;
        console.log("pos", pos);
        children[pos].style.transition = "none";
        children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + (x % 500)}px)`;
      }
    });

    this.root.addEventListener("end", (event) => {
      console.log("panend event", event);

      timeline.reset();
      timeline.start();
      handler = setInterval(nextPicture, 3000);

      let x = event.clientX - event.startX - ax; // 计算拖拽位移时减去动画位移
      let current = position - (x - (x % 500)) / 500;

      let direction = Math.round((x % 500) / 500);

      // flick
      if (event.isFlick) {
        // console.log("event.velocity", event.velocity);
        if (event.velocity > 0) {
          direction = Math.ceil((x % 500) / 500);
        } else {
          direction = Math.floor((x % 500) / 500);
        }
      }

      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = ((pos % children.length) + children.length) % children.length;

        children[pos].style.transition = "none";
        timeline.add(
          new Animation(
            children[pos].style,
            "transform",
            -pos * 500 + offset * 500 + (x % 500),
            -pos * 500 + offset * 500 + direction * 500,
            1500,
            0,
            ease,
            (v) => `translateX(${v}px)`
          )
        );
      }
      position = position - (x - (x % 500)) / 500 - direction;
      position = ((position % children.length) + children.length) % children.length;
    });

    // auto play
    // let currentIndex = 0;

    let nextPicture = () => {
      console.log("nextPicture");
      let children = this.root.children;
      let nextIndex = (position + 1) % children.length;

      let current = children[position];
      let next = children[nextIndex];

      timeline.add(
        new Animation(
          current.style,
          "transform",
          -position * 500,
          -500 - position * 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      );

      timeline.add(
        new Animation(
          next.style,
          "transform",
          500 - nextIndex * 500,
          -nextIndex * 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`
        )
      );

      position = nextIndex;
    };
    handler = setInterval(nextPicture, 3000);

    return this.root;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}

// let d = ["https://cn.bing.com/th?id=OHR.LyonAstronomical_ZH-CN8601552487_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", "https://cn.bing.com/th?id=OHR.Rhododendron_ZH-CN8481644646_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", "https://cn.bing.com/th?id=OHR.HinterseeRamsau_ZH-CN4043630556_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"];
// let a = <Carousel src={d} />;
// a.mountTo(document.body);

// cSpell:ignore panend
