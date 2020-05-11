const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(express.static("."));
app.use("/api/main", require("./routes/api/main"));
app.use("/page", require("./public/page.js"));
app.use(bodyParser.urlencoded({ extended: false }));

//app.get("/", (req, res) => res.send("API Running"));
app.post("/write_code", (req, res) => {});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
