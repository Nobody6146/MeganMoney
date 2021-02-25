//3d Party Modules
const express = require("express");
//My Custom Modules
//const homeRouter = require("./routers/homeRouter");

const app = express();
app.listen(5000);
app.use(express.static('public'));