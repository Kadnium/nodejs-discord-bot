const express = require("express");
const router = express.Router();

module.exports = (socketHandler) => {
    router.get("/", (req, res) => {
        socketHandler.emitCountryStatusChanged({ country: "FIN" })
        res.send({ response: "I am alive" }).status(200);
    });


    return router;
}

