var path = require("path"),
    express = require("express");

var DIST_DIR = path.join(__dirname, "dist"),
    PORT = 3000,
    app = express();

app.use(express.static(DIST_DIR));

app.get("/", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});


app.get("/wallets", function (req, res) {
    res.sendFile(path.join(DIST_DIR, "wallets.html"));
});
  

app.listen(PORT);
