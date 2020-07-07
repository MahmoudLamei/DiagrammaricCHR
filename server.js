const express = require("express");
const Pengine = require('pengines');
const app = express();
const bodyParser = require("body-parser");
const cors = require('cors')

app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get("/", async (req, res) => {
    res.redirect("/page.html");
});
app.use(express.static("."));
app.use("/process", require("./page.js"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
