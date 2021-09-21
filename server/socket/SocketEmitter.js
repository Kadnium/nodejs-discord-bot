
module.exports = (socket) => {
    const pub = {}
    const countryStatusChanged = (args) => {
        console.log(args, "HERE")
        // Emitting a new message. Will be consumed by the client
        socket.emit("statusChanged", args);
    };
    pub.countryStatusChanged = countryStatusChanged;


    return pub;

}
