var d3 = require("d3");
let graphlib = require("graphlib");
let dagre = require("dagre");
let axios = require("axios");
let joint = require("jointjs")
let lodash = require("lodash");
let backbone = require("backbone");
let jquery = require("jquery");

let createdElements = []; //push/pop
let links = [];
let elementsAndLinks = [];

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

// var paperScroller = new joint.ui.PaperScroller({
//   paper: paper
// });

// $('#paper-container').append(paperScroller.render().el);

// var nav = new joint.ui.Navigator({
//   paperScroller: paperScroller,
//   width: 300,
//   height: 200,
//   padding: 10,
//   zoomOptions: { max: 2, min: 0.2 }
// });
// nav.$el.appendTo('#navigator');
// nav.render();

// HTML components
let button1 = document.getElementById("KH-button");
button1.addEventListener("click", keptHead);
let button2 = document.getElementById("RH-button");
button2.addEventListener("click", removedHead);
let button3 = document.getElementById("GR-button");
button3.addEventListener("click", guard);
let button4 = document.getElementById("BD-button");
button4.addEventListener("click", bodyFun);
let button5 = document.getElementById("diagram-code");
button5.addEventListener("click", diagramToCode);
var button6 = document.getElementById("code_diagram");
button6.addEventListener("click", codeToDiagram);

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
        type: "circle",
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
        type: "guard",
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
        type: "body",
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
      .attr("label/type", "guard")
      .attr("label/text", guardName)
      .addTo(graph)
  );
}

function bodyFun() {
  var bodyName = prompt("Body Input");
  createdElements.push(
    new Rectangle().position(250, 250).attr("label/text", bodyName).attr("label/type", "body").addTo(graph)
  );
}

paper.on({
  "element:pointerdown": function (elementView, evt) {
    //evt.data = elementView.model.position();
    evt.data = { startPosition: elementView.model.position() };
  },

  "element:pointerup": function (elementView, evt, x, y) {
    var coordinates = new joint.g.Point(x, y);
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
    var coordinates = new joint.g.Point(x, y);
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

async function diagramToCode() {
  let sentString = "";
  for (let i = 0; i < createdElements.length; i++) {
    let element = createdElements[i];
    let shapeType = element.attr("body/type");
    let shapeText = element.attr("label/text");
    sentString += shapeType + "," + shapeText
    if (i != createdElements.length - 1)
      sentString += ".";
  }

  let code = await axios({
    method: "POST",
    url: "http://localhost:5000/process/diagramToCode",
    data: { hamada: sentString }
  });
  console.log("1");
  console.log(code.data);
  document.getElementById("myCode").value = code.data;

}

async function codeToDiagram() {
  let res = await axios({
    method: "POST",
    url: "http://localhost:5000/process/codeToDiagram",
    data: { hamadaTany: document.getElementById("myCode").value }
  });
  let diagrams = res.data;
  console.log(diagrams);
  let kHeads = diagrams[0].split("-");
  let rHeads = diagrams[1].split("-");
  let Guards = diagrams[2].split("-");
  let Bodies = diagrams[3].split("-");

  for (let i = 0; i < Guards.length; i++) {
    let createdHead = "";
    let createdGuard = "";
    let createdRemovedHead = "";
    let createdBody = "";
    let keptHeadArr = kHeads[i].split(",");
    let removedHeadArr = rHeads[i].split(",");
    let guard = Guards[i];
    let body = Bodies[i];

    if (guard.trim() != "Null") {
      createdGuard = new Polygon()
        .position(250, 250)
        .size(120, 50)
        .attr("label/text", guard)
        .addTo(graph);
      createdElements.push(createdGuard);
    }

    if (body.trim() != "Null") {
      createdBody = new Rectangle()
        .position(250, 250)
        .attr("label/text", body)
        .addTo(graph);

      createdElements.push(createdBody);
      let link = new joint.dia.Link({
        source: createdBody,
        target: createdGuard,
        attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
      });
      link.addTo(graph);
      links.push(link);
    }

    for (let j = 0; j < keptHeadArr.length; j++) {
      let kHeadName = keptHeadArr[j];
      if (kHeadName.trim() != "Null") {
        createdHead = new Circle()
          .position(250, 250)
          .size(120, 50)
          .attr("label/text", kHeadName)
          .attr("body/fill", "#177bec")
          .attr("body/type", "kept")
          .addTo(graph);

        createdElements.push(createdHead);
        let link = new joint.dia.Link({
          source: createdHead,
          target: createdGuard,
          attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
        });
        link.addTo(graph);
        links.push(link);
      }
    }

    for (let j = 0; j < removedHeadArr.length; j++) {
      let rHeadName = removedHeadArr[j];
      if (rHeadName.trim() != "Null") {
        createdRemovedHead = new Circle()
          .position(350, 350)
          .size(120, 50)
          .attr("label/text", rHeadName)
          .attr("body/fill", "#FF0000")
          .attr("body/type", "removed")
          .addTo(graph);

        createdElements.push(createdRemovedHead);

        let link = new joint.dia.Link({
          source: createdRemovedHead,
          target: createdGuard,
          attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
        });
        link.addTo(graph);
        links.push(link);
      }
    }
    // <Layout
    var graphBBox = joint.layout.DirectedGraph.layout(graph, {
      dagre: dagre,
      graphlib: graphlib,
      nodeSep: 80,
      edgeSep: 140,
      rankDir: "LR"
    });
    // Layout/>
  }
}

//browserify graph.js -o bundle.js