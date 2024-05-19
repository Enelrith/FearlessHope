"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use("/static", express_1.default.static(path_1.default.join(__dirname, "static"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    },
}));
app.get("/play", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.listen(8000, () => console.log("Server started"));
