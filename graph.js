// let axios = require("../node_modules/axios/dist/axios");
let joint = require("jointjs");
let lodash = require("lodash");
let backbone = require("backbone");
let jquery = require("jquery");
let point = joint.g.Point(3, 4);
console.log(point);
//import joint from "./node_modules/jointjs/dist/jointjs";

var createdElements = []; //push/pop
var links = [];
var elementsAndLinks = [];


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

var button = document.getElementById("KH-button"); // add id="my-button" into html
button.addEventListener("click", keptHead);
var button = document.getElementById("RH-button"); // add id="my-button" into html
button.addEventListener("click", removedHead);
var button = document.getElementById("GR-button"); // add id="my-button" into html
button.addEventListener("click", guard);
var button = document.getElementById("BD-button"); // add id="my-button" into html
button.addEventListener("click", bodyFun);

//-------HEAD----------------
var Circle = joint.dia.Element.define(
  "standard.Circle",
  {
    attrs: {
      body: {
        type: "",
        r: 50,
        strokeWidth: 1,
        stroke: "#000000",
        fill: "#FFFFFF",
      },
      label: {
        text: "Head",
        textVerticalAnchor: "middle",
        textAnchor: "middle",
        fontSize: 14,
        fill: "#333333",
      },
    },
  },
  {
    markup: [
      {
        tagName: "circle",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],
  }
);

//-------GUARD----------------
var Polygon = joint.dia.Element.define(
  "standard.Polygon",
  {
    attrs: {
      body: {
        points: "60,0 0,40 60,80 120,40",
        strokeWidth: 1,
        stroke: "#000000",
        fill: "#8080FF",
      },
      label: {
        text: "Guard",
        x: 60,
        y: 40,
        textVerticalAnchor: "middle",
        textAnchor: "middle",
        fontSize: 14,
        fill: "#333333",
      },
    },
  },
  {
    markup: [
      {
        tagName: "polygon",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],
  }
);

//-------BODY----------------
var Rectangle = joint.dia.Element.define(
  "standard.Rectangle",
  {
    attrs: {
      body: {
        points: "60,0 0,40 60,80 120,40",
        strokeWidth: 1,
        stroke: "#000000",
        x: 0,
        y: 0,
        width: 200,
        height: 50,
        rx: 50,
        fill: "#D580FF",
      },
      label: {
        text: "Body",
        textVerticalAnchor: "middle",
        textAnchor: "middle",
        fontSize: 14,
        x: 100,
        y: 25,
      },
    },
  },
  {
    markup: [
      {
        tagName: "rect",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],
  }
);

function keptHead() {
  var kHeadName = prompt("Kept Head Input");
  var kHead = new Circle()
    .position(250, 250)
    .size(120, 50)
    .attr("label/text", kHeadName)
    .attr("body/fill", "#177bec")
    .attr("body/type", "kept")
    .addTo(graph);
  createdElements.push(kHead);
}

function removedHead() {
  var rHeadName = prompt("Removed Head Input");
  createdElements.push(
    new Circle()
      .position(250, 250)
      .size(120, 50)
      .attr("label/text", rHeadName)
      .attr("body/fill", "#FF0000")
      .attr("body/type", "removed")
      .addTo(graph)
  );
}

function guard() {
  var guardName = prompt("Guard Input");
  createdElements.push(
    new Polygon()
      .position(250, 250)
      .size(120, 50)
      .attr("label/text", guardName)
      .addTo(graph)
  );
}

function bodyFun() {
  var bodyName = prompt("Body Input");
  createdElements.push(
    new Rectangle().position(250, 250).attr("label/text", bodyName).addTo(graph)
  );
}

paper.on({
  "element:pointerdown": function (elementView, evt) {
    //evt.data = elementView.model.position();
    evt.data = { startPosition: elementView.model.position() };
  },

  "element:pointerup": function (elementView, evt, x, y) {
    var coordinates = new g.Point(x, y);
    var elementAbove = elementView.model;
    var elementBelow = this.model
      .findModelsFromPoint(coordinates)
      .find(function (el) {
        return el.id !== elementAbove.id;
      });

    // If the two elements are connected already, don't
    // connect them again (this is application-specific though).
    if (
      elementBelow &&
      graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1
    ) {
      // Move the element to the position before dragging.
      const { x, y } = evt.data.startPosition;
      elementAbove.position(x, y);

      // Create a connection between elements.
      link = new joint.dia.Link({
        source: { id: elementAbove.id },
        target: { id: elementBelow.id },
        attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
      });
      links.push(link);
      link.addTo(graph);

      // Add remove button to the link.
      var tools = new joint.dia.ToolsView({
        tools: [new joint.linkTools.Vertices(), new joint.linkTools.Remove()],
      });
      link.findView(this).addTools(tools);
    }

    if (
      elementBelow &&
      graph.isNeighbor(elementBelow, elementAbove, { deep: true })
    ) {
      const { x, y } = evt.data.startPosition;
      elementAbove.position(x, y);
    }
  },
  "element:pointerdown": function (elementView, evt) {
    //evt.data = elementView.model.position();
    evt.data = { startPosition: elementView.model.position() };
  },

  "element:pointerup": function (elementView, evt, x, y) {
    var coordinates = new g.Point(x, y);
    var elementAbove = elementView.model;
    var elementBelow = this.model
      .findModelsFromPoint(coordinates)
      .find(function (el) {
        return el.id !== elementAbove.id;
      });

    // If the two elements are connected already, don't
    // connect them again (this is application-specific though).
    if (
      elementBelow &&
      graph.getNeighbors(elementBelow).indexOf(elementAbove) === -1
    ) {
      // Move the element to the position before dragging.
      const { x, y } = evt.data.startPosition;
      elementAbove.position(x, y);

      // Create a connection between elements.
      link = new joint.dia.Link({
        source: { id: elementAbove.id },
        target: { id: elementBelow.id },
        attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
      });
      links.push(link);
      link.addTo(graph);

      // Add remove button to the link.
      var tools = new joint.dia.ToolsView({
        tools: [new joint.linkTools.Vertices(), new joint.linkTools.Remove()],
      });
      link.findView(this).addTools(tools);
    }

    if (
      elementBelow &&
      graph.isNeighbor(elementBelow, elementAbove, { deep: true })
    ) {
      const { x, y } = evt.data.startPosition;
      elementAbove.position(x, y);
    }
  },
});

// function diagramToCode() {
//   axios.get("http://localhost:5000");
// }
