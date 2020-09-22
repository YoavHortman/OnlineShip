"use strict";
var WEBRTC_OPTIONS = {
    serialization: "json"
};
var FRAME_TIME = 1 / 60 * 1000;
var FRAMES_PER_PACKET = 2;
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
        var clientId = null;
        while (clientId === null) {
            clientId = prompt("Copy selected text\nEnter client id", id);
            console.log("clientId", clientId);
        }
        var connection = peer.connect(clientId, WEBRTC_OPTIONS);
        console.log("connection:", connection);
        connection.on("open", function () {
            console.log("open event");
            startGame({
                type: "Host",
                clients: [{ dataConnection: connection, shipId: 1 }],
                shipId: 0
            });
        });
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
        prompt('give to server:', id);
    });
    peer.on("connection", function (conn) {
        console.log("connection", conn);
        conn.on("open", function () {
            console.log("open");
            startGame({
                type: "Client",
                server: conn,
                shipId: 1
            });
        });
    });
}
var emptyController = function () {
    return {
        downKey: false,
        leftKey: false,
        rightKey: false,
        upKey: false
    };
};
function startGame(networkConnection) {
    var world = new GameWorld();
    var canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("No ctx");
    }
    ctx.scale(10, 10);
    // ctx?.scale()
    var controller = emptyController();
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
    var frameCount = 0;
    var gameStartedTime;
    var clientControllerHistory = [];
    var frame = function (time) {
        var _a;
        var currTime = time - gameStartedTime;
        var msSinceStep = currTime - frameCount * FRAME_TIME;
        var numSteps = Math.floor(msSinceStep / FRAME_TIME);
        switch (networkConnection.type) {
            case "Host": {
                for (var i = 0; i < numSteps; i++) {
                    frameCount++;
                    var ship = world.getShipById(networkConnection.shipId);
                    if (ship === undefined) {
                        throw new Error("Big issue");
                    }
                    ship.futureInputs = [controller];
                    world.step();
                    if (frameCount % FRAMES_PER_PACKET === 0) {
                        var packet = {
                            frameNumber: frameCount,
                            ships: world.ships.map(function (ship) {
                                return {
                                    shipId: ship.id,
                                    x: ship.x,
                                    y: ship.y,
                                    velx: ship.velx,
                                    vely: ship.vely
                                };
                            })
                        };
                        for (var _i = 0, _b = networkConnection.clients; _i < _b.length; _i++) {
                            var client = _b[_i];
                            client.dataConnection.send(packet);
                        }
                    }
                }
                break;
            }
            case "Client": {
                for (var i = 0; i < numSteps; i++) {
                    frameCount++;
                    var ship = world.getShipById(networkConnection.shipId);
                    if (ship === undefined) {
                        throw new Error("Big issue");
                    }
                    ship.futureInputs = [controller];
                    world.step();
                    clientControllerHistory.push(controller);
                    if (clientControllerHistory.length === FRAMES_PER_PACKET) {
                        var packet = {
                            inputArray: clientControllerHistory
                        };
                        (_a = networkConnection.server) === null || _a === void 0 ? void 0 : _a.send(packet);
                        clientControllerHistory = [];
                    }
                }
                break;
            }
        }
        world.render(ctx);
        requestAnimationFrame(frame);
    };
    // Kick off
    requestAnimationFrame(function (time) {
        gameStartedTime = time;
        requestAnimationFrame(frame);
    });
    switch (networkConnection.type) {
        case "Host": {
            var _loop_1 = function (client) {
                client.dataConnection.on("data", function (data) {
                    var packet = data;
                    var ship = world.getShipById(client.shipId);
                    if (ship === undefined) {
                        throw new Error("Impssoible");
                    }
                    console.log(packet);
                    ship.futureInputs = ship.futureInputs.concat(packet.inputArray);
                });
            };
            for (var _i = 0, _a = networkConnection.clients; _i < _a.length; _i++) {
                var client = _a[_i];
                _loop_1(client);
            }
            break;
        }
        case "Client": {
            if (networkConnection.server !== null) {
                networkConnection.server.on("data", function (data) {
                    var packet = data;
                    console.log('server data', data);
                    for (var _i = 0, _a = packet.ships; _i < _a.length; _i++) {
                        var shipPacket = _a[_i];
                        var ship = world.getShipById(shipPacket.shipId);
                        if (ship === undefined) {
                            throw new Error("impossible..");
                        }
                        ship.x = shipPacket.x;
                        ship.y = shipPacket.y;
                        ship.velx = shipPacket.velx;
                        ship.vely = shipPacket.vely;
                    }
                });
            }
            break;
        }
    }
}
var GAME_WIDTH = 500;
var GAME_HEIGHT = 500;
var Ship = /** @class */ (function () {
    function Ship(id) {
        this.radius = 30;
        this.x = 30;
        this.y = 30;
        this.velx = 0;
        this.vely = 0;
        /**
         * Only used on host
         */
        this.futureInputs = [];
        this.id = id;
        this.x += this.x * id;
        this.y += this.y * id;
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
var VectorLength = function (x, y) {
    return Math.sqrt(x * x + y * y);
};
var dotProduct = function (x1, y1, x2, y2) {
    return x1 * x2 + y1 * y2;
};
/**
 * normal must be normalized
 */
var elasticCollision = function (normalX, normalY, velX, velY) {
    var dot = dotProduct(normalX, normalY, velX, velY);
    var projX = dot * normalX;
    var projY = dot * normalY;
    return [velX - 2 * projX, velY - 2 * projY];
};
window.Box2D().then(function (box2D) {
    console.log("Box2D - INIT");
    window.box2D = box2D;
    window.b2Vec2 = box2D.b2Vec2;
    window.b2World = box2D.b2World;
    window.b2_dynamicBody = box2D.b2_dynamicBody;
    window.b2BodyDef = box2D.b2BodyDef;
    window.b2_staticBody = box2D.b2_staticBody;
    window.b2_kinematicBody = box2D.b2_kinematicBody;
    window.b2CircleShape = box2D.b2CircleShape;
    window.b2EdgeShape = box2D.b2EdgeShape;
    window.b2FixtureDef = box2D.b2FixtureDef;
    window.b2Transform = box2D.b2Transform;
    window.b2Mat22 = box2D.b2Mat22;
});
var GameWorld = /** @class */ (function () {
    function GameWorld() {
        this.ships = [new Ship(0), new Ship(1)];
        this.world = new b2World(new b2Vec2(0, 30), true);
        // circle
        var bodyDef = new b2BodyDef();
        bodyDef.set_type(b2_dynamicBody);
        bodyDef.position.Set(20, 20);
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        this.dynamicBody = this.world.CreateBody(bodyDef);
        var circleShape = new b2CircleShape();
        circleShape.set_m_radius(1);
        var fixt = this.dynamicBody.CreateFixture(circleShape, 1.0);
        fixt.SetRestitution(0.2);
        // ground
        this.groundBody = this.world.CreateBody(new b2BodyDef());
        var edgeShape = new b2EdgeShape();
        edgeShape.Set(new b2Vec2(0, 40), new b2Vec2(50, 30));
        var fixtureDef = new b2FixtureDef();
        fixtureDef.set_shape(edgeShape);
        fixtureDef.restitution = 0.2;
        this.groundBody.CreateFixture(fixtureDef);
    }
    GameWorld.prototype.getShipById = function (id) {
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            if (ship.id === id) {
                return ship;
            }
        }
    };
    GameWorld.prototype.step = function () {
        for (var _i = 0, _a = this.ships; _i < _a.length; _i++) {
            var ship = _a[_i];
            if (ship.futureInputs.length === 0) {
                ship.step(emptyController());
            }
            else {
                // ship.step(ship.futureInputs[0]);
                if (ship.futureInputs[0].leftKey) {
                    this.dynamicBody.ApplyForce(new b2Vec2(-100, 0), this.dynamicBody.GetPosition());
                }
                if (ship.futureInputs[0].rightKey) {
                    this.dynamicBody.ApplyForce(new b2Vec2(100, 0), this.dynamicBody.GetPosition());
                }
                if (ship.futureInputs[0].upKey) {
                    this.dynamicBody.ApplyForce(new b2Vec2(0, -100), this.dynamicBody.GetPosition());
                }
                if (ship.futureInputs[0].downKey) {
                    this.dynamicBody.ApplyForce(new b2Vec2(0, 100), this.dynamicBody.GetPosition());
                }
                ship.futureInputs.shift();
            }
        }
        this.world.Step(FRAME_TIME / 1000, 8, 3);
    };
    GameWorld.prototype.render = function (ctx) {
        ctx.fillStyle = "#cccccc";
        ctx.fillRect(0, 0, 50, 50);
        ctx.beginPath();
        console.log(this.groundBody.GetFixtureList());
        ctx.moveTo(0, 40);
        ctx.lineTo(50, 30);
        ctx.stroke();
        // for (const ship of this.ships) {
        //   ship.render(ctx);
        // }
        // Box2D stuff:
        var x = this.dynamicBody.GetPosition().x;
        var y = this.dynamicBody.GetPosition().y;
        ctx.translate(x, y);
        ctx.rotate(this.dynamicBody.GetAngle());
        ctx.fillStyle = "red";
        ctx.fillRect(-0.5, -0.5, 1, 1);
        ctx.rotate(-this.dynamicBody.GetAngle());
        ctx.translate(-x, -y);
    };
    return GameWorld;
}());
function singlePlayerClient() {
    startGame({ type: 'Client', server: null, shipId: 1 });
}
function singlePlayerHost() {
    startGame({ type: 'Host', clients: [], shipId: 0 });
}
window.hostServer = hostServer;
window.connectToServer = connectToServer;
window.singlePlayerClient = singlePlayerClient;
window.singlePlayerHost = singlePlayerHost;
//# sourceMappingURL=index.js.map