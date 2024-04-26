import express from "express";
import path from "path";
const app = express();
app.use(
  "/static",
  express.static(path.join(__dirname, "static"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);
app.get("/play", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.listen(8000, () => console.log("Server started"));
