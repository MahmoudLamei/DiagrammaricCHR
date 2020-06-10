const d3 = require("d3");
const graphlib = require("graphlib");
const dagre = require("dagre");
const axios = require("axios");
const joint = require("jointjs")
const lodash = require("lodash");
const backbone = require("backbone");
const jquery = require("jquery");

let createdElements = [];
let links = [];
let divided = [];

var graph = new joint.dia.Graph();
var paper = new joint.dia.Paper({
  el: document.getElementById("myholder"),
  model: graph,
  width: 1000,
  height: 1060,
  gridSize: 10,
  drawGrid: true,
  background: {
    color: "rgba(0, 0, 0, 0.3)",
  },
});

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
  // get all the guards and put them in the heads of the 2D array (divided)
  let sentString = "";
  let elementsTemp = createdElements;
  for (let i = 0; i < elementsTemp.length; i++) {
    let element = elementsTemp[i];
    if (element.attr("body/type") == "guard") {
      divided.push([element]);
      //let indx = elementsTemp.indexOf(element);
    }
  }

  //divide the connected shapes in a 2D array (divided)
  for (let i = 0; i < divided.length; i++) {
    let guard2 = divided[i][0];
    for (let j = 0; j < createdElements.length; j++) {
      let element = createdElements[j];
      for (let k = 0; k < links.length; k++) {
        let link = links[k];
        if ((link.prop('source/id') == guard2.id && link.prop('target/id') == element.id) ||
          (link.prop('source/id') == element.id && link.prop('target/id') == guard2.id)) {
          divided[i].push(element);
        }
      }
    }
  }

  //divide the connected shapes in a string (divide)
  for (let i = 0; i < divided.length; i++) {
    let elements = divided[i];
    for (let j = 0; j < elements.length; j++) {
      let element = elements[j];
      let shapeType = element.attr("body/type");
      let shapeText = element.attr("label/text");
      sentString += shapeType + "," + shapeText
      if (i != createdElements.length - 1)
        sentString += ".";
    }
    if (i != divided.length - 1)
      sentString += "é";
  }

  // Printing divided.
  let log = "";
  for (let i = 0; i < divided.length; i++) {
    const element = divided[i];
    log += "[";
    for (let j = 0; j < element.length; j++) {
      const subElement = element[j];
      log += subElement.attr("label/text");
      if (i != subElement.length - 1)
        log += ", ";
    }
    log += "]";
    if (i != element.length - 1)
      log += ", ";
  }
  console.log("divided: \n" + log);

  let code = await axios({
    method: "POST",
    url: "http://localhost:5000/process/diagramToCode",
    data: { sentString: sentString }
  })
  document.getElementById("myCode").value = code.data;

}

async function codeToDiagram() {
  let res = await axios({
    method: "POST",
    url: "http://localhost:5000/process/codeToDiagram",
    data: { codeString: document.getElementById("myCode").value }
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
    let keptHead = kHeads[i];
    let removedHead = rHeads[i];
    let guard = Guards[i];
    let body = Bodies[i];
    let keptHeadArr = [];
    let removedHeadArr = [];

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

    let bracketOpen = false;
    for (let i = 0; i < keptHead.length; i++) {
      const chr = keptHead.charAt(i);
      if (chr == '(')
        bracketOpen = true;

      if (bracketOpen == false) {
        if (chr == ',') {
          let part = keptHead.substring(0, i);
          keptHeadArr.push(part);
          keptHead = keptHead.substring(i + 1, keptHead.length);
          i = 0;
        }
      }
      if (chr == ')')
        bracketOpen = false;

      if (keptHead.trim() != "" && i == keptHead.length - 1)
        keptHeadArr.push(keptHead);
    }

    bracketOpen = false;
    for (let i = 0; i < removedHead.length; i++) {
      const chr = removedHead.charAt(i);
      if (chr == '(')
        bracketOpen = true;

      if (bracketOpen == false) {
        if (chr == ',') {
          let part = removedHead.substring(0, i);
          removedHeadArr.push(part);
          removedHead = removedHead.substring(i + 1, removedHead.length);
          i = 0;
        }
      }
      if (chr == ')')
        bracketOpen = false;

      if (removedHead.trim() != "" && i == removedHead.length - 1)
        removedHeadArr.push(removedHead);
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

document.getElementById("runQuery1").addEventListener("click", runQuery);

async function runQuery() {
  console.log("in runQuery");
  let query = await axios({
    method: "POST",
    url: "http://localhost:5000/process/runQuery",
    data: {
      sentQuery: document.getElementById("queryArea").value,
      codeString: document.getElementById("myCode").value
    }
  });
  document.getElementById("resultArea").value = query.data;
}
//browserify graph.js -o bundle.js