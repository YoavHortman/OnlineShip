var WEBRTC_OPTIONS = {
    serialization: "json"
};
function connect(peer) {
    var conn = peer.connect('another-peers-id');
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function () {
        // here you have conn.id
        conn.send('hi!');
    });
}
// Main function for server host
function hostServer(idCallback) {
    console.log("SERVER");
    var peer = new Peer();
    peer.on("error", function (err) {
        console.log("ERROR", err);
    });
    peer.on("open", function (id) {
        console.log("server id", id);
        idCallback(id);
        var clientId = prompt("Enter client id");
        console.log("clientId", clientId);
        var connection = peer.connect(clientId, WEBRTC_OPTIONS);
        console.log("connection:", connection);
        connection.on("open", function () {
            console.log("open event");
        });
        var pingSent = new Date();
        connection.on("data", function (data) {
            var pingMillis = new Date().getTime() - pingSent.getTime();
            console.log("ping time:", pingMillis);
            console.log("data", data);
            setTimeout(function () {
                pingSent = new Date();
                connection.send({ ping: 5 });
            }, 100);
        });
        setTimeout(function () {
            console.log("sending");
            connection.send({ hello: "world" });
        }, 3000);
    });
}
// Main function for client
function connectToServer(id) {
    console.log("CLIENT");
    var peer = new Peer();
    peer.on("error", function (err) {
        console.log("ERROR", err);
    });
    peer.connect(id, WEBRTC_OPTIONS);
    peer.on("open", function (id) {
        console.log("open", id);
    });
    peer.on("connection", function (conn) {
        console.log("connection", conn);
        conn.on("data", function (data) {
            console.log("data", data);
            conn.send({ "reply": "hello" });
        });
        conn.on("open", function () {
            console.log("open");
        });
    });
}
window.hostServer = hostServer;
window.connectToServer = connectToServer;
// function main2() {
//     const peer = new Peer();
//     peer.on("open", (id: string) => {
//         console.log(id);
//     });
//     console.log("main2");
// }
// main2();
//# sourceMappingURL=index.js.map