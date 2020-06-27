const WEBRTC_OPTIONS: Peer.PeerConnectOption = {
    serialization: "json"
};

function connect(peer: Peer): void {
    var conn = peer.connect('another-peers-id');
    // on open will be launch when you successfully connect to PeerServer
    conn.on('open', function () {
        // here you have conn.id
        conn.send('hi!');
    });
}

// Main function for server host
function hostServer(idCallback: (id: string) => void): void {
    console.log("SERVER");
    const peer = new Peer();
    peer.on("error", (err: any) => {
        console.log("ERROR", err);
    });

    peer.on("open", (id: string) => {
        console.log("server id", id);
        idCallback(id);

        const clientId = prompt("Enter client id");
        console.log("clientId", clientId);

        const connection = peer.connect(clientId, WEBRTC_OPTIONS);
        console.log("connection:", connection);

        connection.on("open", () => {
            console.log("open event");
        });

        let pingSent: Date = new Date();

        connection.on("data", (data) => {
            const pingMillis = new Date().getTime() - pingSent.getTime()
            console.log("ping time:", pingMillis);

            console.log("data", data);
            setTimeout(() => {
                pingSent = new Date();
                connection.send({ ping: 5 });
            }, 100);
        });

        setTimeout(() => {
            console.log("sending");
            connection.send({ hello: "world" });
        }, 3000);
    });
}

// Main function for client
function connectToServer(id: string): void {
    console.log("CLIENT");
    const peer = new Peer();
    peer.on("error", (err: any) => {
        console.log("ERROR", err);
    });
    peer.connect(id, WEBRTC_OPTIONS);
    peer.on("open", (id: string) => {
        console.log("open", id);
    });

    peer.on("connection", (conn) => {
        console.log("connection", conn);

        conn.on("data", (data: any) => {
            console.log("data", data);
            conn.send({ "reply": "hello" });
        });

        conn.on("open", () => {
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
