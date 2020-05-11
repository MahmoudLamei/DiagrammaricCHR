let joint = require("jointjs");
console.log("hi");
var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
  el: document.getElementById("myholder"),
  model: graph,
  width: 1000,
  height: 1000,
  gridSize: 10,
  drawGrid: true,
  background: {
    color: "rgba(0, 0, 0, 0.3)",
  },
});
