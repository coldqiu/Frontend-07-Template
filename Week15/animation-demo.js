import { Timeline, Animation } from "./animation";
import { ease } from "./ease";

let tl = new Timeline();

window.tl = tl;

let animation = new Animation(document.querySelector("#el").style, "transform", 0, 500, 2000, 0, null, (v) => `translateX(${v}px)`);

tl.add(animation);

tl.start();

document.querySelector("#pause-btn").addEventListener("click", () => tl.pause());
document.querySelector("#resume-btn").addEventListener("click", () => tl.resume());
document.querySelector("#reset-btn").addEventListener("click", () => tl.reset());

document.querySelector("#el2").style.transition = "transform ease 2s";
document.querySelector("#el2").style.transform = "translateX(500px)";
