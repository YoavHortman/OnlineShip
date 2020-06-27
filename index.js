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
var Controller = /** @class */ (function () {
    function Controller() {
        this.upKey = false;
        this.downKey = false;
        this.leftKey = false;
        this.rightKey = false;
    }
    return Controller;
}());
function startGame() {
    var world = new World();
    var canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var controller = new Controller();
    document.addEventListener("keydown", function (e) {
        switch (e.keyCode) {
            case 38: // Up
                controller.upKey = true;
                break;
            case 40: // Down
                controller.downKey = true;
                break;
            case 37: // Left
                controller.leftKey = true;
                break;
            case 39: // Right
                controller.rightKey = true;
                break;
        }
    });
    document.addEventListener("keyup", function (e) {
        switch (e.keyCode) {
            case 38: // Up
                controller.upKey = false;
                break;
            case 40: // Down
                controller.downKey = false;
                break;
            case 37: // Left
                controller.leftKey = false;
                break;
            case 39: // Right
                controller.rightKey = false;
                break;
        }
    });
    var frame = function (time) {
        console.log("frame", time);
        world.step(controller);
        world.render(ctx);
        requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}
var GAME_WIDTH = 500;
var GAME_HEIGHT = 500;
var Ship = /** @class */ (function () {
    function Ship() {
        this.radius = 30;
        this.x = 30;
        this.y = 30;
        this.velx = 0;
        this.vely = 0;
    }
    Ship.prototype.step = function (controller) {
        if (controller.rightKey) {
            this.velx += 0.2;
        }
        if (controller.leftKey) {
            this.velx -= 0.2;
        }
        if (controller.upKey) {
            this.vely -= 0.2;
        }
        if (controller.downKey) {
            this.vely += 0.2;
        }
        this.velx *= 0.98;
        this.vely *= 0.98;
        this.x += this.velx;
        this.y += this.vely;
        if (this.x > GAME_WIDTH - this.radius && this.velx > 0) {
            this.velx *= -1;
            this.x = GAME_WIDTH - this.radius;
        }
        if (this.y > GAME_HEIGHT - this.radius && this.vely > 0) {
            this.vely *= -1;
            this.y = GAME_HEIGHT - this.radius;
        }
        if (this.x < this.radius && this.velx < 0) {
            this.velx *= -1;
            this.x = this.radius;
        }
        if (this.y < this.radius && this.vely < 0) {
            this.vely *= -1;
            this.y = this.radius;
        }
    };
    Ship.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
        ctx.stroke();
    };
    return Ship;
}());
var World = /** @class */ (function () {
    function World() {
        this.ships = [new Ship()];
        this.ships[0].playerControlled = true;
    }
    World.prototype.step = function (controller) {
        console.log(controller);
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            if (ship.playerControlled) {
                ship.step(controller);
            }
            else {
                ship.step(new Controller());
            }
        }
    };
    World.prototype.render = function (ctx) {
        ctx.fillStyle = "#cccccc";
        ctx.fillRect(0, 0, 500, 500);
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            ship.render(ctx);
        }
    };
    return World;
}());
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
startGame();
//# sourceMappingURL=index.js.map