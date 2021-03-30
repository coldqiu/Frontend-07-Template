import { createElement } from "./framework";
import { Carousel } from "./carousel";
import { Timeline, Animation } from "./animation/animation.js";

let d = [
  "https://cn.bing.com/th?id=OHR.LyonAstronomical_ZH-CN8601552487_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp",
  "https://cn.bing.com/th?id=OHR.Rhododendron_ZH-CN8481644646_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp",
  "https://cn.bing.com/th?id=OHR.HinterseeRamsau_ZH-CN4043630556_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp",
];
let a = (
  <Carousel
    src={d}
    onChange={(event) => console.log(event.detail.position)}
    onClick={(event) => (window.location.href = event.detail.data)}
  />
);
a.mountTo(document.body);

// let tl = new Timeline();

// tl.start();
