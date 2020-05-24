const express = require("express");
let joint = require("jointjs");
let bodyParser = require("body-parser");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.post("/diagramToCode", async (req, res) => {

  let requestCode = req.body.hamada;

  let preCode = requestCode.split('.');

  //main code
  let code = "",
    bodyStr = "",
    keptHeadStr = "",
    removedHeadStr = "",
    guardStr = "";
  for (let i = 0; i < preCode.length; i++) {
    const element = preCode[i];
    let comp = element.split(',');
    let type = comp[0];
    let text = comp[1];

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
    " \\ " +
    removedHeadStr +
    " <==> " +
    guardStr +
    " | " +
    bodyStr +
    ".";

  res.send(code);
});


router.post("/codeToDiagram", async (req, res) => {
  //   "kHead1, kHead2 \\ rHead1, rHead2 <==> Guard1, Guard2 | Body1, Body2";
  let codeArray = req.body.hamadaTany.split("\n");
  let createdHead = "";
  let createdGuard = "";
  let createdRemovedHead = "";
  let createdBody = "";
  for (let i = 0; i < codeArray.length; i++) {
    let inCode2 = codeArray[i].split("\\"); // First split to get the kept heads.
    let keptHeadArr = inCode2[0].split(",");
    let inCode3 = inCode2[1].split("<==>"); // Second split to get the removed heads.
    let removedHeadArr = inCode3[0].split(",");
    let inCode4 = inCode3[1].split("|"); // Third split to get the Guard and Body.
    let guard = inCode4[0];
    let bodyWP = inCode4[1];
    let body = bodyWP.substring(0, bodyWP.length - 1);


    if (guard.trim() != "Null") {
      createdGuard += guard.trim();
    }
    else createdGuard += "Null";
    if (body.trim() != "Null") {
      createdBody += body.trim();
    } else createdBody += "Null";
    for (let j = 0; j < keptHeadArr.length; j++) {
      const kHeadName = keptHeadArr[j];
      if (kHeadName.trim() != "Null") {
        createdHead += kHeadName.trim();
        if (j != keptHeadArr.length - 1 && keptHeadArr.length != 1)
          createdHead += ",";
      } else createdHead += "Null";
    }

    for (let j = 0; j < removedHeadArr.length; j++) {
      const rHeadName = removedHeadArr[j];
      if (rHeadName.trim() != "Null") {
        createdRemovedHead += rHeadName.trim();
        if (j != removedHeadArr.length - 1 && removedHeadArr.length != 1)
          createdRemovedHead += ",";
      } else createdRemovedHead += "Null";
    }
    if (i != codeArray.length - 1 && codeArray.length != 1) {
      createdBody += "-";
      createdRemovedHead += "-";
      createdGuard += "-";
      createdHead += "-";
    }
  }

  let diagrams = [];
  diagrams.push(createdHead);
  diagrams.push(createdRemovedHead);
  diagrams.push(createdGuard);
  diagrams.push(createdBody);
  res.send(diagrams);
});

module.exports = router;
