// const d3 = require("d3");
const graphlib = require("graphlib");
const dagre = require("dagre");
const axios = require("axios");
const joint = require("jointjs")
// const lodash = require("lodash");
// const backbone = require("backbone");
// const jquery = require("jquery");
// const { countBy } = require("lodash");

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

document.getElementById("KH_button").addEventListener("click", keptHead);
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

document.getElementById("RH_button").addEventListener("click", removedHead);
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

document.getElementById("GR_button").addEventListener("click", guard);
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

document.getElementById("BD_button").addEventListener("click", bodyFun);
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

      // Dividing the elements to groups.
      let countAbove = -1;
      let countBelow = -1;
      // console.log("1\n");
      // printDivided();
      if (divided.length == 0) {
        divided.push([elementAbove, elementBelow]);
      }
      // console.log("2\n");
      // printDivided();
      for (let i = 0; i < divided.length; i++) {
        const group = divided[i];

        for (let j = 0; j < group.length; j++) {
          const element = group[j];

          if (element.id == elementAbove.id) {
            countAbove = i;
          }
          if (element.id == elementBelow.id) {
            countBelow = i;
          }
        }
      }
      // console.log("3\n");
      // printDivided();
      // Both in groups.
      if (countAbove != -1 && countBelow != -1 && countAbove != countBelow) {
        // Adding the source group to the target group and deleting the main source group.
        divided[countBelow] = divided[countBelow].concat(divided[countAbove]);
        divided.splice(1, countAbove);
      }
      // console.log("4\n");
      // printDivided();
      // Only the target is in a group.
      if (countAbove == -1 && countBelow != -1) {
        divided[countBelow].push(elementAbove);
      }
      // console.log("5\n");
      // printDivided();
      // Only the source is in a group.
      if (countAbove != -1 && countBelow == -1) {
        divided[countAbove].push(elementBelow);
      }
      // console.log("6\n");
      // printDivided();
      // Neither are in groups.
      if (countAbove == -1 && countBelow == -1) {
        divided.push([elementAbove, elementBelow]);
      }
      // console.log("7\n");
      // printDivided();
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

document.getElementById("diagram_code").addEventListener("click", diagramToCode);
async function diagramToCode() {
  // Puting the facts in divided.
  for (let i = 0; i < createdElements.length; i++) {
    const element = createdElements[i];
    let found = false;
    for (let j = 0; j < divided.length; j++) {
      for (let k = 0; k < divided[j].length; k++) {
        const element2 = divided[j][k];
        if (element.id == element2.id)
          found = true;
      }
    }
    if (!found) {
      divided.push([element]);
    }
  }

  let sentString = "";
  //divide the connected shapes in a string (divide)
  for (let i = 0; i < divided.length; i++) {
    let elements = divided[i];
    for (let j = 0; j < elements.length; j++) {
      let element = elements[j];
      let shapeType = element.attr("body/type");
      let shapeText = element.attr("label/text");
      sentString += shapeType + "," + shapeText
      if (j != elements.length - 1)
        sentString += ".";
    }
    if (i != divided.length - 1)
      sentString += "é";
  }

  printDivided();

  let code = await axios({
    method: "POST",
    url: "/process/diagramToCode",
    data: { sentString: sentString }
  })
  console.log("before assigning value to text area");
  document.getElementById("myCode").value = code.data;

}

document.getElementById("code_diagram").addEventListener("click", codeToDiagram);
async function codeToDiagram() {
  let res = await axios({
    method: "POST",
    url: "/process/codeToDiagram",
    data: { codeString: document.getElementById("myCode").value }
  });

  let diagrams = res.data; // [ "color(X), color(Y)-color(brown)", "Null-color(_)", "mix(X,Y,Z)-Null", "color(Z)-true" ]
  let kHeads = diagrams[0].split("-"); // [ "color(X), color(Y)", "color(brown)" ]
  let rHeads = diagrams[1].split("-"); // [ "Null", "color(_)" ]
  let Guards = diagrams[2].split("-"); // [ "mix(X,Y,Z)", "Null" ]
  let Bodies = diagrams[3].split("-"); // [ "color(Z)", "true" ]
  let facts = diagrams[4].split("-");
  console.log("Diagrams: ", diagrams, "\nKept: ", kHeads, "\nRemoved: ", rHeads, "\nGuard: ", Guards, "\nBody: ", Bodies, "\nFact: ", facts);
  let max = Math.max(kHeads.length, rHeads.length, Guards.length, Bodies.length)
  for (let i = 0; i < max; i++) {
    // Elements.
    let createdHead = "";
    let createdGuard = "";
    let createdRemovedHead = "";
    let createdBody = "";
    let createdFact = "";
    let linkedElement = "";
    // Elements labels.
    let keptHead = kHeads[i]; // With predicates.
    let removedHead = rHeads[i]; // With predicates.
    let keptHeadArr = []; // Without predicates.
    let removedHeadArr = []; // Without predicates.
    let guard = Guards[i];
    let body = Bodies[i];

    // If there's a guard create it and make it the linking element.
    if (guard.trim() != "Null") {
      createdGuard = new Polygon()
        .position(250, 250)
        .size(120, 50)
        .attr("label/text", guard)
        .addTo(graph);
      createdElements.push(createdGuard);

      createdBody = new Rectangle()
        .position(250, 250)
        .attr("label/text", body)
        .addTo(graph);
      createdElements.push(createdBody);
      linkedElement = createdBody;

      let link = new joint.dia.Link({
        source: createdBody,
        target: createdGuard,
        attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
      });
      link.addTo(graph);
      links.push(link);
      linkedElement = createdGuard;
    }

    // If there's no Guard create the body and make it the linking element.
    else if (body.trim() != "Null") {
      createdBody = new Rectangle()
        .position(250, 250)
        .attr("label/text", body)
        .addTo(graph);
      createdElements.push(createdBody);
      linkedElement = createdBody;
    }

    // Split the kept heads without splitting the parameters inside.
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

    // Split the removed heads without splitting the parameters inside.
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

    // Create the kept heads.
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
          target: linkedElement,
          attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
        });
        link.addTo(graph);
        links.push(link);
      }
    }

    // Create the removed heads.
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
          target: linkedElement,
          attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
        });
        link.addTo(graph);
        links.push(link);
      }
    }
  }
  // Create the facts.
  for (let i = 0; i < facts.length; i++) {
    let fact = facts[i];
    createdFact = new Circle()
      .position(250, 250)
      .size(120, 50)
      .attr("label/text", fact)
      .attr("body/fill", "#177bec")
      .attr("body/type", "kept")
      .addTo(graph);

    createdElements.push(createdFact);
  }

  // Arranging the elements in the graph using Directed graph layout.
  var graphBBox = joint.layout.DirectedGraph.layout(graph, {
    dagre: dagre,
    graphlib: graphlib,
    nodeSep: 80,
    edgeSep: 140,
    rankDir: "LR"
  });
}

document.getElementById("runQuery").addEventListener("click", loadChr);
async function loadChr() {
  await axios({
    method: "POST",
    url: "/process/loadCHR",
    data: {
      code: document.getElementById("myCode").value
    }
  });
  executeChr();
}

async function executeChr() {
  await axios({
    method: "POST",
    url: "/process/executeChr",
    data: {
      query: document.getElementById("queryArea").value
    }
  });
  setTimeout(getChrRes, 1000);
}

async function getChrRes() {
  let result = await axios({
    method: "GET",
    url: "/process/getChrRes",
  });
  document.getElementById("resultArea").value = result.data;
}

function printDivided() {
  let log = "";
  log += "[";
  for (let i = 0; i < divided.length; i++) {
    const element = divided[i];
    log += "[";
    for (let j = 0; j < element.length; j++) {
      const subElement = element[j];
      log += subElement.attr("label/text");
      if (j != element.length - 1)
        log += ", ";
    }
    log += "]";
    if (i != divided.length - 1)
      log += ", ";
  }
  log += "]";
  console.log("divided: \n" + log);
}

//browserify graph.js -o bundle.js