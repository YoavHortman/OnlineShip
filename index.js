"use strict";
var WEBRTC_OPTIONS = {
    serialization: "json"
};
var FRAME_TIME = 1 / 60 * 1000;
// Maybe split server and client frames per packet
var FRAMES_PER_PACKET = 2;
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
    canvas.width = 1000;
    canvas.height = 500;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (ctx === null) {
        throw new Error("No ctx");
    }
    ctx.scale(10, 10);
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
    var clientControllerPacket = [];
    var clientControllerHistory = [];
    var clientControllerId = 1;
    var frame = function (time) {
        var _a;
        var currTime = time - gameStartedTime;
        var msSinceStep = currTime - frameCount * FRAME_TIME;
        var numSteps = Math.floor(msSinceStep / FRAME_TIME);
        switch (networkConnection.type) {
            case "Host": {
                for (var i = 0; i < numSteps; i++) {
                    frameCount++;
                    var character = world.getCharacterById(networkConnection.shipId);
                    if (character === undefined) {
                        throw new Error("Big issue");
                    }
                    // ID gets ignored
                    character.futureInputs = [{ id: 0, controller: controller }];
                    world.step();
                    if (frameCount % FRAMES_PER_PACKET === 0) {
                        var characterSnapshots = world.characters.map(function (character) {
                            return {
                                id: character.id,
                                posx: character.body.GetPosition().x,
                                posy: character.body.GetPosition().y,
                                velx: character.body.GetLinearVelocity().x,
                                vely: character.body.GetLinearVelocity().y
                            };
                        });
                        var crateSnapshots = world.crates.map(function (crate) {
                            return {
                                angle: crate.body.GetAngle(),
                                angularVel: crate.body.GetAngularVelocity(),
                                posx: crate.body.GetPosition().x,
                                posy: crate.body.GetPosition().y,
                                velx: crate.body.GetLinearVelocity().x,
                                vely: crate.body.GetLinearVelocity().y
                            };
                        });
                        for (var _i = 0, _b = networkConnection.clients; _i < _b.length; _i++) {
                            var client = _b[_i];
                            var clientChar = world.getCharacterById(client.shipId);
                            if (clientChar === undefined) {
                                throw new Error("Cant find client: " + client.shipId);
                            }
                            var packet = {
                                frameNumber: frameCount,
                                controllerPacketId: clientChar.lastAppliedInputId,
                                characterSnapshots: characterSnapshots,
                                crateSnapshots: crateSnapshots
                            };
                            client.dataConnection.send(packet);
                        }
                    }
                }
                break;
            }
            case "Client": {
                for (var i = 0; i < numSteps; i++) {
                    frameCount++;
                    var ship = world.getCharacterById(networkConnection.shipId);
                    if (ship === undefined) {
                        throw new Error("Big issue");
                    }
                    var controllerPacket = { id: clientControllerId, controller: controller };
                    ship.futureInputs = [controllerPacket];
                    world.step();
                    clientControllerHistory.push(controllerPacket);
                    clientControllerPacket.push(controllerPacket);
                    clientControllerId++;
                    if (clientControllerPacket.length === FRAMES_PER_PACKET) {
                        var packet = {
                            inputArray: clientControllerPacket
                        };
                        (_a = networkConnection.server) === null || _a === void 0 ? void 0 : _a.send(packet);
                        clientControllerPacket = [];
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
    var clientLastReceviedFrame = 0;
    switch (networkConnection.type) {
        case "Host": {
            var _loop_1 = function (client) {
                client.dataConnection.on("data", function (data) {
                    var packet = data;
                    var character = world.getCharacterById(client.shipId);
                    if (character === undefined) {
                        throw new Error("Impssoible");
                    }
                    console.log(packet);
                    character.futureInputs = character.futureInputs.concat(packet.inputArray);
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
                    if (clientLastReceviedFrame > packet.frameNumber) {
                        return;
                    }
                    clientLastReceviedFrame = packet.frameNumber;
                    console.log('server data', data);
                    for (var _i = 0, _a = packet.characterSnapshots; _i < _a.length; _i++) {
                        var snapshot = _a[_i];
                        var character_1 = world.getCharacterById(snapshot.id);
                        if (character_1 === undefined) {
                            throw new Error("impossible..");
                        }
                        character_1.body.SetTransform(new b2Vec2(snapshot.posx, snapshot.posy), 0);
                        character_1.body.SetLinearVelocity(new b2Vec2(snapshot.velx, snapshot.vely));
                    }
                    for (var i = 0; i < world.crates.length; i++) {
                        var crateSnapshot = packet.crateSnapshots[i];
                        var crate = world.crates[i];
                        crate.body.SetTransform(new b2Vec2(crateSnapshot.posx, crateSnapshot.posy), crateSnapshot.angle);
                        crate.body.SetLinearVelocity(new b2Vec2(crateSnapshot.velx, crateSnapshot.vely));
                        crate.body.SetAngularVelocity(crateSnapshot.angularVel);
                    }
                    while (clientControllerHistory.length > 0 && clientControllerHistory[0].id <= packet.controllerPacketId) {
                        clientControllerHistory.shift();
                    }
                    var character = world.getCharacterById(networkConnection.shipId);
                    if (character === undefined) {
                        throw new Error("Ship id not found " + networkConnection.shipId);
                    }
                    console.log("history len", clientControllerHistory.length);
                    for (var _b = 0, clientControllerHistory_1 = clientControllerHistory; _b < clientControllerHistory_1.length; _b++) {
                        var history_1 = clientControllerHistory_1[_b];
                        character.futureInputs = [history_1];
                        world.step();
                    }
                });
            }
            break;
        }
    }
}
var GAME_WIDTH = 500;
var GAME_HEIGHT = 500;
var Crate = /** @class */ (function () {
    function Crate(world) {
        this.width = 3;
        this.height = 3;
        var bodyDef = new b2BodyDef();
        bodyDef.allowSleep = false;
        bodyDef.set_type(b2_dynamicBody);
        bodyDef.position.Set(Math.random() * 100, 20);
        this.body = world.CreateBody(bodyDef);
        var shape = new b2PolygonShape();
        shape.SetAsBox(this.width, this.height);
        var fixt = this.body.CreateFixture(shape, 0.1);
        fixt.SetRestitution(0.9);
        fixt.SetFriction(0);
    }
    Crate.prototype.render = function (ctx) {
        var x = this.body.GetPosition().x;
        var y = this.body.GetPosition().y;
        ctx.translate(x, y);
        ctx.rotate(this.body.GetAngle());
        ctx.fillStyle = "red";
        ctx.fillRect(-this.width, -this.height, this.width * 2, this.height * 2);
        ctx.rotate(-this.body.GetAngle());
        ctx.translate(-x, -y);
    };
    return Crate;
}());
var Character = /** @class */ (function () {
    function Character(id, world) {
        this.radius = 3;
        /**
         * Only used on host
         */
        this.futureInputs = [];
        this.lastAppliedInputId = 0;
        this.id = id;
        var bodyDef = new b2BodyDef();
        bodyDef.allowSleep = false;
        bodyDef.fixedRotation = true;
        bodyDef.set_type(b2_dynamicBody);
        bodyDef.position.Set(Math.random() * 25, Math.random() * 25);
        this.body = world.CreateBody(bodyDef);
        var shape = new b2CircleShape();
        shape.set_m_radius(this.radius);
        this.body.CreateFixture(shape, 0.1);
        this.body.SetLinearDamping(7);
    }
    Character.prototype.step = function (contoller) {
        if (contoller.upKey) {
            this.move(0, -1);
        }
        else if (contoller.downKey) {
            this.move(0, 1);
        }
        if (contoller.leftKey) {
            this.move(-1, 0);
        }
        else if (contoller.rightKey) {
            this.move(1, 0);
        }
    };
    Character.prototype.move = function (x, y) {
        var vec = new b2Vec2(x * 1000, y * 1000);
        this.body.ApplyForceToCenter(vec);
    };
    Character.prototype.jump = function () {
        var vec = new b2Vec2(0, -10);
        this.body.ApplyLinearImpulse(vec, this.body.GetPosition());
    };
    Character.prototype.render = function (ctx) {
        ctx.beginPath();
        ctx.arc(this.body.GetPosition().x, this.body.GetPosition().y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        if (this.id === 0) {
            ctx.fillStyle = "blue";
            ctx.fill();
        }
    };
    return Character;
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
    var names = ["b2Vec2",
        "b2World",
        "b2_dynamicBody",
        "b2BodyDef",
        "b2_staticBody",
        "b2_kinematicBody",
        "b2CircleShape",
        "b2EdgeShape",
        "b2FixtureDef",
        "b2Transform",
        "b2Mat22",
        "b2Shape",
        "b2ChainShape",
        "b2PolygonShape"
    ];
    window.box2D = box2D;
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name_1 = names_1[_i];
        window[name_1] = box2D[name_1];
    }
    // singlePlayerHost();
});
var GameWorld = /** @class */ (function () {
    function GameWorld() {
        this.crates = [];
        this.world = new b2World(new b2Vec2(0, 30), true);
        for (var i = 0; i < 10; i++) {
            this.crates.push(new Crate(this.world));
        }
        // circle
        var bodyDef = new b2BodyDef();
        bodyDef.set_type(b2_dynamicBody);
        bodyDef.position.Set(20, 20);
        bodyDef.linearDamping = 0;
        bodyDef.angularDamping = 0;
        this.characters = [new Character(0, this.world), new Character(1, this.world)];
        // ground
        var vertices = [
            new b2Vec2(0, 0),
            new b2Vec2(0, 35),
            new b2Vec2(5, 40),
            new b2Vec2(25, 40),
            new b2Vec2(50, 50),
            new b2Vec2(70, 50),
            new b2Vec2(80, 45),
            new b2Vec2(100, 40),
            new b2Vec2(100, 0),
            new b2Vec2(0, 0),
        ];
        var groundBody = this.world.CreateBody(new b2BodyDef());
        var fixtureDef = new b2FixtureDef();
        fixtureDef.restitution = 0.2;
        this.groundBody = new RigidBody(groundBody);
        this.groundBody.addChain(fixtureDef, vertices);
    }
    GameWorld.prototype.getCharacterById = function (id) {
        for (var _i = 0, _a = this.characters; _i < _a.length; _i++) {
            var character = _a[_i];
            if (character.id === id) {
                return character;
            }
        }
    };
    GameWorld.prototype.step = function () {
        for (var _i = 0, _a = this.characters; _i < _a.length; _i++) {
            var character = _a[_i];
            if (character.futureInputs.length === 0) {
                character.step(emptyController());
            }
            else {
                character.step(character.futureInputs[0].controller);
                character.lastAppliedInputId = character.futureInputs[0].id;
                character.futureInputs.shift();
            }
        }
        this.world.Step(FRAME_TIME / 1000, 10, 8);
    };
    GameWorld.prototype.render = function (ctx) {
        ctx.fillStyle = "#cccccc";
        ctx.fillRect(0, 0, 100, 50);
        ctx.beginPath();
        for (var _i = 0, _a = this.groundBody.chains; _i < _a.length; _i++) {
            var chain = _a[_i];
            ctx.moveTo(chain.vertices[0].x, chain.vertices[0].y);
            for (var _b = 0, _c = chain.vertices; _b < _c.length; _b++) {
                var vert = _c[_b];
                ctx.lineTo(vert.x, vert.y);
            }
        }
        for (var _d = 0, _e = this.crates; _d < _e.length; _d++) {
            var crate = _e[_d];
            crate.render(ctx);
        }
        ctx.lineWidth = 0.1;
        ctx.stroke();
        for (var _f = 0, _g = this.characters; _f < _g.length; _f++) {
            var character = _g[_f];
            character.render(ctx);
        }
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