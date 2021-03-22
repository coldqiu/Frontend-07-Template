import { Component } from "./framework";
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

    let position = 0;
    this.root.addEventListener("mousedown", (event) => {
      let children = this.root.children;
      let startX = event.clientX;

      let move = (event) => {
        let x = event.clientX - startX;

        let current = position - (x - (x % 500)) / 500;

        for (let offset of [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos + children.length) % children.length;

          children[pos].style.transition = "none";
          children[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + (x % 500)}px)`;
        }
      };

      let up = (event) => {
        let x = event.clientX - startX;
        position = position - Math.round(x / 500);

        for (let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset;
          pos = (pos + children.length) % children.length;

          children[pos].style.transition = "";
          children[pos].style.transform = `translateX(${-pos * 500 + offset * 500}px)`;
        }
        document.removeEventListener("mousemove", move);
        document.removeEventListener("mouseup", up);
      };

      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
    });

    // auto play
    // let currentIndex = 0;
    // setInterval(() => {
    //   let children = this.root.children;
    //   let nextIndex = (currentIndex + 1) % children.length;

    //   let current = children[currentIndex];
    //   let next = children[nextIndex];

    //   next.style.transition = "none";
    //   next.style.transform = `translateX(${100 - nextIndex * 100} %)`;

    //   setTimeout(() => {
    //     next.style.transition = "";
    //     current.style.transform = `translateX(${-100 - currentIndex * 100}%)`;
    //     next.style.transform = `translateX(${-nextIndex * 100}%)`;
    //     currentIndex = nextIndex;
    //   }, 16);
    // }, 3000);

    return this.root;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}

// let d = ["https://cn.bing.com/th?id=OHR.LyonAstronomical_ZH-CN8601552487_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", "https://cn.bing.com/th?id=OHR.Rhododendron_ZH-CN8481644646_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp", "https://cn.bing.com/th?id=OHR.HinterseeRamsau_ZH-CN4043630556_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp"];
// let a = <Carousel src={d} />;
// a.mountTo(document.body);
