// import jquery, { static } from "jquery";
// import lodash, { static } from "lodash";
// import backbone, { static } from "backbone";
// import jointjs, { static } from "jointjs";
// import express, { static } from "express";
// import dagre from "C:\\Users\\mahmoud\\Desktop\\DiagrammaticTest\\node_modules\\dagre\\dist\\dagre.js";
// import graphlib from "C:\\Users\\mahmoud\\Desktop\\DiagrammaticTest\\node_modules\\graphlib\\dist\\graphlib.js";
//import * as joint from "C:\\Users\\mahmoud\\DesktopDiagrammaticTest\\node_modules\\jointjs\\dist\\joint.js";
let joint = require("jointjs");
// let dagre = require("node_modules\\dagre\\dist\\dagre.js");
// let graphlib = require("node_modules\\graphlib\\dist\\graphlib.js");

const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
  function diagramToCode() {
    var code = "",
      bodyStr = "",
      keptHeadStr = "",
      removedHeadStr = "",
      guardStr = "";
    for (let i = 0; i < createdElements.length; i++) {
      const element = createdElements[i];
      // Body Case.
      if (element.markup[0].tagName == "rect") {
        if (bodyStr == "") bodyStr += element.attr("label/text");
        else bodyStr += ", " + element.attr("label/text");
      }
      // Guard Case.
      else if (element.markup[0].tagName == "polygon") {
        if (guardStr == "") guardStr += element.attr("label/text");
        else guardStr += ", " + element.attr("label/text");
      }
      // keptHead Case.
      else if (
        element.markup[0].tagName == "circle" &&
        element.attr("body/type") == "kept"
      ) {
        if (keptHeadStr == "") keptHeadStr += element.attr("label/text");
        else keptHeadStr += ", " + element.attr("label/text");
      }
      // removedHead Case.
      else if (
        element.markup[0].tagName == "circle" &&
        element.attr("body/type") == "removed"
      ) {
        if (removedHeadStr == "") removedHeadStr += element.attr("label/text");
        else removedHeadStr += ", " + element.attr("label/text");
      }
    }

    if (bodyStr == "") bodyStr = "Null";
    if (guardStr == "") guardStr = "Null";
    if (keptHeadStr == "") keptHeadStr = "Null";
    if (removedHeadStr == "") removedHeadStr = "Null";

    if (bodyStr.substring(bodyStr.length - 2) == ",")
      bodyStr = bodyStr.slice(0, bodyStr.length - 2);

    if (guardStr.substring(guardStr.length - 2) == ",")
      guardStr = bguardStrdyStr.slice(0, guardStr.length - 2);

    if (keptHeadStr.substring(keptHeadStr.length - 2) == ",")
      keptHeadStr = keptHeadStr.slice(0, keptHeadStr.length - 2);

    if (removedHeadStr.substring(removedHeadStr.length - 2) == ",")
      removedHeadStr = removedHeadStr.slice(0, removedHeadStr.length - 2);

    code =
      keptHeadStr +
      " \\\\ " +
      removedHeadStr +
      " <==> " +
      guardStr +
      " | " +
      bodyStr;
    document.getElementById("myCode").value = code;
  }

  function codeToDiagram() {
    // var inCode =
    //   "kHead1, kHead2 \\\\ rHead1, rHead2 <==> Guard1, Guard2 | Body1, Body2";
    var inCode = document.getElementById("myCode").value;
    var codeArray = inCode.split("\n");

    for (let i = 0; i < codeArray.length; i++) {
      var inCode2 = codeArray[i].split("\\\\"); // First split to get the kept heads.
      var keptHeadArr = inCode2[0].split(",");
      var inCode3 = inCode2[1].split("<==>"); // Second split to get the removed heads.
      var removedHeadArr = inCode3[0].split(",");
      var inCode4 = inCode3[1].split("|"); // Third split to get the Guard and Body.
      var guard = inCode4[0];
      var body = inCode4[1];

      if (guard.trim() != "Null") {
        var createdGurad = new Polygon()
          .position(250, 250)
          .size(120, 50)
          .attr("label/text", guard)
          .addTo(graph);
        createdElements.push(createdGurad);
      }
      if (body.trim() != "Null") {
        var createdBody = new Rectangle()
          .position(250, 250)
          .attr("label/text", body)
          .addTo(graph);

        createdElements.push(createdBody);
        var link = new joint.dia.Link({
          source: createdBody,
          target: createdGurad,
          attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
        });
        link.addTo(graph);
        links.push(link);
      }
      for (let i = 0; i < keptHeadArr.length; i++) {
        const kHeadName = keptHeadArr[i];
        if (kHeadName.trim() != "Null") {
          var createdHead = new Circle()
            .position(250, 250)
            .size(120, 50)
            .attr("label/text", kHeadName)
            .attr("body/fill", "#177bec")
            .attr("body/type", "kept")
            .addTo(graph);

          createdElements.push(createdHead);
          var link = new joint.dia.Link({
            source: createdHead,
            target: createdGurad,
            attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
          });
          link.addTo(graph);
          links.push(link);
        }
      }

      for (let i = 0; i < removedHeadArr.length; i++) {
        const rHeadName = removedHeadArr[i];
        if (rHeadName.trim() != "Null") {
          var createdRemovedHead = new Circle()
            .position(350, 350)
            .size(120, 50)
            .attr("label/text", rHeadName)
            .attr("body/fill", "#FF0000")
            .attr("body/type", "removed")
            .addTo(graph);

          createdElements.push(createdRemovedHead);

          var link = new joint.dia.Link({
            source: createdRemovedHead,
            target: createdGurad,
            attrs: { ".connection": { "stroke-width": 3, stroke: "#000000" } },
          });
          link.addTo(graph);
          links.push(link);
        }
      }
    }
    // elementsAndLinks = createdElements.concat(links);
    // graph.resetCells(elementsAndLinks);
    // joint.layout.DirectedGraph.layout(elementsAndLinks, {
    //   setLinkVertices: false,
    // });
  }
});

module.exports = router;
