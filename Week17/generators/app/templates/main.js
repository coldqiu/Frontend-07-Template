import HelloWorld from "./HelloWorld.vue";
import Vue from "vue";

new Vue({
  el: "#app",
  //   components: { HelloWorld },
  render: (h) => h(HelloWorld),
});
