const express = require("express");
const http = require("http");

const port = process.env.PORT || 4001;
const Routes = require("./routes/index");
const SocketHandler = require("./socket/SocketHandler");
const app = express();


const server = http.createServer(app);
const socketHandler = SocketHandler(server);
socketHandler.initSocket();

const routes = Routes(socketHandler)
app.use(routes);

server.listen(port, () => console.log(`Listening on port ${port}`));

