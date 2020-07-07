const express = require("express");
const joint = require("jointjs");
const bodyParser = require("body-parser");
const router = express.Router();
const fs = require('fs');
const cmd = require('node-cmd');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post("/diagramToCode", async (req, res) => {

  let requestCode = req.body.sentString;
  let fullCode = requestCode.split('é'); //[ 'body,bd.guard,gr.removed,rh.kept,kh', 'kept,kh2' ]
  let code = ":- use_module(library(chr)).\n";
  let usedConstraints = [];
  for (let j = 0; j < fullCode.length; j++) {
    let preCode = fullCode[j].split('.'); //[ 'body,bd', 'guard,gr', 'removed,rh', 'kept,kh' ]
    let bodyStr = "",
      keptHeadStr = "",
      removedHeadStr = "",
      guardStr = "";

    if (preCode.length == 1) {
      let comp = preCode[0].split(',', 1);
      let type = comp[0];
      let text = preCode[0].substring(type.length + 1, preCode[0].length).trim();
      code += text + ".\n";
    }
    else {
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
      let splitConstraint = [];
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
      code += keptHeadStr;
      if (removedHeadStr != "Null")
        code += " \\ " + removedHeadStr;
      code += " <=> ";
      if (guardStr != "Null")
        code += guardStr + " | ";
      code += bodyStr + ".\n";
    }
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
  let createdFact = "";

  for (let i = 0; i < codeArray.length; i++) {
    let line = codeArray[i];

    // Rules.
    if (line.includes('<=>')) {
      // Splitting the code to a heads part and a guard, body part.
      let split1 = line.split('<=>');

      // Checking if it have a removed head.
      if (split1[0].includes('\\')) {
        createdHead += split1[0].split('\\')[0].trim();
        createdRemovedHead += split1[0].split('\\')[1].trim();
      } else {
        createdHead += split1[0].trim();
        createdRemovedHead += 'Null';
      }

      // Checking if it have a guard.
      if (split1[1].includes('|')) {
        createdGuard += split1[1].split('|')[0].trim();
        createdBody += split1[1].split('|')[1].substring(0, split1[1].split('|')[1].length - 1).trim();
      } else {
        createdBody += split1[1].substring(0, split1[1].length - 1).trim();
        createdGuard += 'Null';
      }
      // Splits each line of code.
      createdBody += "-";
      createdRemovedHead += "-";
      createdGuard += "-";
      createdHead += "-";
    }

    // Facts.
    if (!((line.includes("<=>")) || line.includes(":-")) && line != "") {
      createdFact += line.substring(0, line.length - 1).trim();
      createdFact += "-";
    }
  }

  // "Diagrams" array store all the elements in each slot.
  let diagrams = [];
  diagrams.push(createdHead.substring(0, createdHead.length - 1));
  diagrams.push(createdRemovedHead.substring(0, createdRemovedHead.length - 1));
  diagrams.push(createdGuard.substring(0, createdGuard.length - 1));
  diagrams.push(createdBody.substring(0, createdBody.length - 1));
  diagrams.push(createdFact.substring(0, createdFact.length - 1));
  console.log("Diagrams: ", diagrams);
  res.send(diagrams);
});

// Load the code from the .pl file.
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

// Execute query and save result in .txt file.
router.post('/executeChr', (req, res) => {
  fs.writeFile('queryResult.txt', "The query is not executed try again", err => {
    if (err) {
      console.log("7amra kbera!")
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

// Get result of query.
router.get('/getChrRes', (req, res) => {
  fs.readFile("queryResult.txt", function (err, buf) {
    if (err) res.send("error", err);
    else {
      res.send(buf.toString().replace('Content-type: text/html; charset=UTF-8', ''));
    }
  });
})

module.exports = router;
