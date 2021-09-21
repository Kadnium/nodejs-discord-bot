const socketIo = require("socket.io");
const SocketEmitter = require("./SocketEmitter")
const { v4: uuid } = require('uuid');

module.exports = (server) => {

    const pub = {}

    const io = socketIo(server, {
        cors: {
            origins: "*",
            credentials: true
        }
    });

    const connections = {};


    const initSocket = () => {
        io.on("connection", (socket) => {
            console.log("New client connected");
            let socketId = uuid();
            connections[socketId] = SocketEmitter(socket);
            socket.on("disconnect", () => {
                console.log("Client disconnected");
                delete connections[socketId];
            });
        });
    }
    pub.initSocket = initSocket;


    const emitCountryStatusChanged = (argObj) => {
        Object.keys(connections).forEach(key => {
            let emitter = connections[key];
            if (emitter != null) {
                emitter.countryStatusChanged(argObj);
            }
        })
    }
    pub.emitCountryStatusChanged = emitCountryStatusChanged;

    return pub;

}
