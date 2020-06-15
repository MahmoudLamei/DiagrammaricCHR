const express = require("express");
const joint = require("jointjs");
const bodyParser = require("body-parser");
const Pengine = require('pengines');
const CHR = require('chr');
const pl = require('tau-prolog');
const router = express.Router();
const fs = require('fs');
const cmd = require('node-cmd');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post("/diagramToCode", async (req, res) => {

  let requestCode = req.body.sentString;
  let fullCode = requestCode.split('é');
  let code = ":- use_module(library(chr)).\n";

  for (let j = 0; j < fullCode.length; j++) {
    let preCode = fullCode[j].split('.');
    let bodyStr = "",
      keptHeadStr = "",
      removedHeadStr = "",
      guardStr = "";
    for (let i = 0; i < preCode.length; i++) {
      const element = preCode[i];
      let comp = element.split(',', 1);
      let type = comp[0];
      let text = element.substring(type.length + 1, element.length).trim();

      // Body Case.
      if (type == "body") {
        if (bodyStr == "") bodyStr += text;
        else bodyStr += ", " + text;
      }

      // Guard Case.
      else if (type == "guard") {
        if (guardStr == "") guardStr += text;
        else guardStr += ", " + text;
      }
      // keptHead Case.
      else if (type == "kept"
      ) {
        if (keptHeadStr == "") keptHeadStr += text;
        else keptHeadStr += ", " + text;
      }
      // removedHead Case.
      else if (type == "removed"
      ) {
        if (removedHeadStr == "") removedHeadStr += text;
        else removedHeadStr += ", " + text;
      }
    }

    // In case there was no text.
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

    // Dividing constraints in an array.
    let temp = keptHeadStr;
    let bracket = false;
    let keptHeads = [];
    for (let i = 0; i < temp.length; i++) {
      let chr = temp.charAt(i);
      if (chr == '(') {
        bracket = true;
      }
      if (chr == ')') {
        bracket = false;
      }
      if (bracket == false && chr == ',') {
        let str = temp.substring(0, i);
        keptHeads.push(str);
        temp = temp.substring(i + 1, temp.length);
        i = -1;
      }
    }
    keptHeads.push(temp);

    temp = removedHeadStr;
    bracket = false;
    let removedHeads = [];
    for (let i = 0; i < temp.length; i++) {
      let chr = temp.charAt(i);
      if (chr == '(') {
        bracket = true;
      }
      if (chr == ')') {
        bracket = false;
      }
      if (bracket == false && chr == ',') {
        let str = temp.substring(0, i);
        removedHeads.push(str);
        temp = temp.substring(i + 1, temp.length);
        i = -1;
      }
    }
    removedHeads.push(temp);

    temp = guardStr;
    bracket = false;
    let guards = [];
    for (let i = 0; i < temp.length; i++) {
      let chr = temp.charAt(i);
      if (chr == '(') {
        bracket = true;
      }
      if (chr == ')') {
        bracket = false;
      }
      if (bracket == false && chr == ',') {
        let str = temp.substring(0, i);
        guards.push(str);
        temp = temp.substring(i + 1, temp.length);
        i = -1;
      }
    }
    guards.push(temp);

    temp = bodyStr;
    bracket = false;
    let bodies = [];
    for (let i = 0; i < temp.length; i++) {
      let chr = temp.charAt(i);
      if (chr == '(') {
        bracket = true;
      }
      if (chr == ')') {
        bracket = false;
      }
      if (bracket == false && chr == ',') {
        let str = temp.substring(0, i);
        bodies.push(str);
        temp = temp.substring(i + 1, temp.length);
        i = -1;
      }
    }
    bodies.push(temp);

    // Define the new constraints.
    let usedConstraints = [], splitConstraint = [];
    let constraint = "", predicates = "", fullConstraint = "";

    for (let i = 0; i < keptHeads.length; i++) {
      let element = keptHeads[i];
      if (element.includes("(" && ")")) {
        fullConstraint = element.substring(0, element.indexOf("(")).trim() + "/" + (element.split(",").length);
        splitConstraint = fullConstraint.split("/");
        if (!usedConstraints.includes(fullConstraint)) {
          usedConstraints.push(fullConstraint);
          constraint = splitConstraint[0].trim();
          predicates = splitConstraint[1].trim();
          code += ":- chr_constraint " + constraint + "/" + predicates + ".\n";
        }
      }
    }

    for (let i = 0; i < removedHeads.length; i++) {
      let element = removedHeads[i];
      if (element.includes("(" && ")")) {
        fullConstraint = element.substring(0, element.indexOf("(")).trim() + "/" + (element.split(",").length);
        splitConstraint = fullConstraint.split("/");
        if (!usedConstraints.includes(fullConstraint)) {
          usedConstraints.push(fullConstraint);
          constraint = splitConstraint[0].trim();
          predicates = splitConstraint[1].trim();
          code += ":- chr_constraint " + constraint + "/" + predicates + ".\n";
        }
      }
    }

    for (let i = 0; i < guards.length; i++) {
      let element = guards[i];
      if (element.includes("(" && ")")) {
        fullConstraint = element.substring(0, element.indexOf("(")).trim() + "/" + (element.split(",").length);
        splitConstraint = fullConstraint.split("/");
        if (!usedConstraints.includes(fullConstraint)) {
          usedConstraints.push(fullConstraint);
          constraint = splitConstraint[0].trim();
          predicates = splitConstraint[1].trim();
          code += ":- chr_constraint " + constraint + "/" + predicates + ".\n";
        }
      }
    }

    for (let i = 0; i < bodies.length; i++) {
      let element = bodies[i];
      if (element.includes("(" && ")")) {
        fullConstraint = element.substring(0, element.indexOf("(")).trim() + "/" + (element.split(",").length);
        splitConstraint = fullConstraint.split("/");
        if (!usedConstraints.includes(fullConstraint)) {
          usedConstraints.push(fullConstraint);
          constraint = splitConstraint[0].trim();
          predicates = splitConstraint[1].trim();
          code += ":- chr_constraint " + constraint + "/" + predicates + ".\n";
        }
      }
    }


    // Constucting the line of code.
    code +=
      keptHeadStr +
      " \\ " +
      removedHeadStr +
      " <=> " +
      guardStr +
      " | " +
      bodyStr +
      ".\n";
  }

  // Save the code in a txt file.
  // fs.writeFile('Output.txt', code, (err) => {
  //   // In case of a error throw err. 
  //   if (err) throw err;
  //   console.log('The file has been saved!');
  // })
  res.send(code);
});

router.post("/codeToDiagram", async (req, res) => {
  // "color(X,M), color(Y) \\ Null <=> mix(X,Y,Z) | color(Z).";
  //session.consult(req.body.codeString);
  let codeArray = req.body.codeString.split("\n");
  let createdHead = "";
  let createdGuard = "";
  let createdRemovedHead = "";
  let createdBody = "";
  for (let i = 0; i < codeArray.length; i++) {
    if (codeArray[i].includes('<=>')) {
      let inCode2 = codeArray[i].split("\\"); // First split to get the kept heads.
      let keptHeadArr = inCode2[0];
      let inCode3 = inCode2[1].split("<=>"); // Second split to get the removed heads.
      let removedHeadArr = inCode3[0];
      let inCode4 = inCode3[1].split("|"); // Third split to get the Guard and Body.
      let guard = inCode4[0];
      let bodyWP = inCode4[1];
      let body = bodyWP.substring(0, bodyWP.length - 1);

      if (guard.trim() != "Null")
        createdGuard += guard.trim();
      else createdGuard += "Null";

      if (body.trim() != "Null")
        createdBody += body.trim();
      else createdBody += "Null";

      createdHead += keptHeadArr.trim();
      createdRemovedHead += removedHeadArr.trim()
      createdBody += "-";
      createdRemovedHead += "-";
      createdGuard += "-";
      createdHead += "-";

    }
  }
  // if (i != createdElements.length - 1)
  let diagrams = [];
  diagrams.push(createdHead.substring(0, createdHead.length - 1));
  diagrams.push(createdRemovedHead.substring(0, createdRemovedHead.length - 1));
  diagrams.push(createdGuard.substring(0, createdGuard.length - 1));
  diagrams.push(createdBody.substring(0, createdBody.length - 1));
  console.log(diagrams);
  res.send(diagrams);
});

// let res2 = "";
// let callbackStr = true;
// function postQuery(str) {
//   res2 += str + "\n";
//   if (str == false)
//     callbackStr = false;
// }

router.post('/loadChr', (req, res) => {
  var code = req.body.code;

  fs.writeFile('code.pl', code, err => { // chrFiles/main.pl
    if (err) {
      console.error(err)
      return
    }
  })

  res.send(code)
})

//execute query and save result in txt file
router.post('/executeChr', (req, res) => {
  console.log(req.body.query);
  fs.writeFile('queryResult.txt', "The query is not executed try again", err => {
    if (err) {
      console.error(err)
      return
    }
  })


  const processRef = cmd.get('swipl code.pl');
  let data_line = '';

  var query = req.body.query + "\n";

  var or = `;`;
  var and = `.`;

  processRef.stdin.write(query);

  processRef.stdout.on(
    'data',
    function (data) {
      var x = data.split("\n")
      data_line += data;
      if (x.length > 1) {

        fs.writeFile('queryResult.txt', data_line, function (err, data) {
          if (err) {
            return console.log(err);
          }
        }
        );
      }
      else {
        if (data_line.length <= 100000) {
          processRef.stdin.write(or);
        }
        else {
          console.log("exeeds limit");

          processRef.stdin.write(and);
          alert("this is only part of the solutions as there are too many possible solutions !!")

        }
      }
    }
  );
  res.send("done");
})

//get result of query
router.get('/getChrRes', (req, res) => {
  fs.readFile("queryResult.txt", function (err, buf) {
    if (err) res.send("error", err);
    else {
      res.send(buf.toString().replace('Content-type: text/html; charset=UTF-8', ''));
    }
  });
})



module.exports = router;
