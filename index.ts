const WEBRTC_OPTIONS: Peer.PeerConnectOption = {
  serialization: "json"
};

const FRAME_TIME = 1 / 60 * 1000;
const FRAMES_PER_PACKET = 2;

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
    let clientId = null
    while (clientId === null) {
      clientId = prompt(`Copy selected text\nEnter client id`, id);
      console.log("clientId", clientId);
    }

    const connection = peer.connect(clientId, WEBRTC_OPTIONS);
    console.log("connection:", connection);
    let connections: HostPeer[] = []
    connection.on("open", () => {
      connections.push({ dataConnection: connection, id: connections.length + 1 });
      console.log("open event");
      if (connections.length === 2) {
        startGame({
          type: "Host",
          clients: connections,
          shipId: 0
        });
      } else {
        let clientId2 = null
        while (clientId2 === null) {
          clientId2 = prompt(`Copy selected text\nEnter client id`, id);
          console.log("clientId", clientId2);
        }
      }
    });
  });
}

// Main function for client
function connectToServer(peerId: string, characterId: number): void {
  console.log("CLIENT");
  const peer = new Peer();
  peer.on("error", (err: any) => {
    console.log("ERROR", err);
  });
  peer.connect(peerId, WEBRTC_OPTIONS);
  peer.on("open", (id: string) => {
    console.log("open", id);
    prompt('give to server:', id)
  });

  peer.on("connection", (conn) => {
    console.log("connection", conn);

    conn.on("open", () => {
      console.log("open");
      startGame({
        type: "Client",
        server: conn,
        shipId: characterId
      });
    });
  });
}

interface Controller {
  upKey: boolean;
  downKey: boolean;
  leftKey: boolean;
  rightKey: boolean;
}

type NetworkConnection = NetworkConnection.Host | NetworkConnection.Client;
interface HostPeer {
  dataConnection: Peer.DataConnection;
  id: number;
}
namespace NetworkConnection {
  export interface Host {
    type: "Host";
    clients: HostPeer[];
    shipId: number;
  }

  export interface Client {
    type: "Client";
    server: Peer.DataConnection | null;
    shipId: number;
  }
}

// Packet from the client to the host
interface CharacterSnapshot {
  id: number;
  posx: number;
  posy: number;
  velx: number;
  vely: number;
}

interface CrateSnapshot {
  posx: number;
  posy: number;
  velx: number;
  vely: number;
  angularVel: number;
  angle: number;
}

interface HostToClient {
  frameNumber: number;
  createSnapshots: CrateSnapshot[];
  characterSnapshots: CharacterSnapshot[];
}

interface ClientToHost {
  /**
   * Length should be equalt to FRAMES_PER_PACKET
   */
  inputArray: Controller[];
}

const emptyController = (): Controller => {
  return {
    downKey: false,
    leftKey: false,
    rightKey: false,
    upKey: false
  }
}

function startGame(networkConnection: NetworkConnection) {
  const world = new GameWorld();
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 500;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("No ctx");
  }
  ctx.scale(10, 10);
  const controller: Controller = emptyController();

  document.addEventListener("keydown", (e) => {
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
  document.addEventListener("keyup", (e) => {
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

  let frameCount = 0;
  let gameStartedTime: number;
  let clientControllerHistory: Controller[] = []
  const frame = (time: number) => {
    const currTime = time - gameStartedTime;
    const msSinceStep = currTime - frameCount * FRAME_TIME;
    const numSteps = Math.floor(msSinceStep / FRAME_TIME);
    switch (networkConnection.type) {
      case "Host": {
        for (let i = 0; i < numSteps; i++) {
          frameCount++;
          const ship = world.getCharacterById(networkConnection.shipId);
          if (ship === undefined) {
            throw new Error("Big issue " + networkConnection.shipId);
          }
          ship.futureInputs = [controller];

          world.step();

          if (frameCount % FRAMES_PER_PACKET === 0) {
            const packet: HostToClient = {
              frameNumber: frameCount,
              characterSnapshots: world.characters.map((character) => {
                return {
                  id: character.id,
                  posx: character.body.GetPosition().x,
                  posy: character.body.GetPosition().y,
                  velx: character.body.GetLinearVelocity().x,
                  vely: character.body.GetLinearVelocity().y,
                }
              }),
              createSnapshots: world.crates.map((crate) => {
                return {
                  angle: crate.body.GetAngle(),
                  angularVel: crate.body.GetAngularVelocity(),
                  posx: crate.body.GetPosition().x,
                  posy: crate.body.GetPosition().y,
                  velx: crate.body.GetLinearVelocity().x,
                  vely: crate.body.GetLinearVelocity().y,
                }
              })
            };
            for (const client of networkConnection.clients) {
              client.dataConnection.send(packet);
            }
          }
        }
        break;
      }
      case "Client": {
        for (let i = 0; i < numSteps; i++) {
          frameCount++;
          const ship = world.getCharacterById(networkConnection.shipId);
          if (ship === undefined) {
            throw new Error("Big issue " + networkConnection.shipId);
          }
          ship.futureInputs = [controller];
          world.step();
          clientControllerHistory.push(controller);
          if (clientControllerHistory.length === FRAMES_PER_PACKET) {
            const packet: ClientToHost = {
              inputArray: clientControllerHistory
            };
            networkConnection.server?.send(packet);
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
  requestAnimationFrame((time) => {
    gameStartedTime = time;
    requestAnimationFrame(frame);
  });
  switch (networkConnection.type) {
    case "Host": {
      for (const client of networkConnection.clients) {
        client.dataConnection.on("data", (data: any) => {
          const packet: ClientToHost = data;

          const character = world.getCharacterById(client.id);
          if (character === undefined) {
            throw new Error("Impssoible");
          }
          console.log(packet);
          character.futureInputs = character.futureInputs.concat(packet.inputArray);
        });
      }
      break;
    }
    case "Client": {
      if (networkConnection.server !== null) {
        networkConnection.server.on("data", (data) => {
          const packet: HostToClient = data;
          console.log('server data', data)
          for (const snapshot of packet.characterSnapshots) {
            const character = world.getCharacterById(snapshot.id);
            if (character === undefined) {
              throw new Error("impossible..")
            }
            character.body.SetTransform(new b2Vec2(snapshot.posx, snapshot.posy), 0);
            character.body.SetLinearVelocity(new b2Vec2(snapshot.velx, snapshot.vely));
          }
          for (let i = 0; i < world.crates.length; i++) {
            const crateSnapshot = packet.createSnapshots[i];
            const crate = world.crates[i];
            crate.body.SetTransform(new b2Vec2(crateSnapshot.posx, crateSnapshot.posy), crateSnapshot.angle);
            crate.body.SetLinearVelocity(new b2Vec2(crateSnapshot.velx, crateSnapshot.vely));
            crate.body.SetAngularVelocity(crateSnapshot.angularVel);
          }
        });
      }
      break;
    }
  }
}

const GAME_WIDTH: number = 500;
const GAME_HEIGHT: number = 500;
class Crate {
  readonly width: number = 3;
  readonly height: number = 3;
  readonly body: b2Body;

  constructor(world: b2World) {
    const bodyDef = new b2BodyDef();
    bodyDef.allowSleep = false;
    bodyDef.set_type(b2_dynamicBody);
    bodyDef.position.Set(Math.random() * 100, 20);
    this.body = world.CreateBody(bodyDef);
    const shape = new b2PolygonShape();
    shape.SetAsBox(this.width, this.height);
    const fixt = this.body.CreateFixture(shape, 0.1);
    fixt.SetRestitution(0.9);
    fixt.SetFriction(0);
  }

  render(ctx: CanvasRenderingContext2D) {
    const x = this.body.GetPosition().x;
    const y = this.body.GetPosition().y;
    ctx.translate(x, y);
    ctx.rotate(this.body.GetAngle());
    ctx.fillStyle = "red";
    ctx.fillRect(-this.width, -this.height, this.width * 2, this.height * 2);
    ctx.rotate(-this.body.GetAngle());
    ctx.translate(-x, -y);
  }
}
class Character {
  readonly id: number
  readonly radius: number = 3;
  readonly body: b2Body;
  /** 
   * Only used on host
   */
  public futureInputs: Controller[] = [];


  constructor(id: number, world: b2World) {
    this.id = id;
    const bodyDef = new b2BodyDef();
    bodyDef.allowSleep = false;
    bodyDef.fixedRotation = true;
    bodyDef.set_type(b2_dynamicBody);
    bodyDef.position.Set(Math.random() * 25, Math.random() * 25);
    this.body = world.CreateBody(bodyDef);
    const shape = new b2CircleShape();
    shape.set_m_radius(this.radius);
    this.body.CreateFixture(shape, 0.1);
    this.body.SetLinearDamping(7);
  }

  step(contoller: Controller) {
    if (contoller.upKey) {
      this.move(0, -1);
    } else if (contoller.downKey) {
      this.move(0, 1)
    }
    if (contoller.leftKey) {
      this.move(-1, 0);
    } else if (contoller.rightKey) {
      this.move(1, 0);
    }

  }
  move(x: number, y: number) {
    const vec = new b2Vec2(x * 1000, y * 1000);
    this.body.ApplyForceToCenter(vec);
  }
  jump() {
    const vec = new b2Vec2(0, -10);
    this.body.ApplyLinearImpulse(vec, this.body.GetPosition());
  }
  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.body.GetPosition().x, this.body.GetPosition().y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    if (this.id === 0) {
      ctx.fillStyle = "blue";
      ctx.fill();
    }
  }
}

class Ship {
  readonly id: number;

  public radius: number = 30;

  public x: number = 30;
  public y: number = 30;
  public velx: number = 0;
  public vely: number = 0;

  /** 
   * Only used on host
   */
  public futureInputs: Controller[] = [];

  constructor(id: number) {
    this.id = id;
    this.x += this.x * id;
    this.y += this.y * id;
  }

  public step(controller: Controller) {
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
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 30, 0, Math.PI * 2);
    ctx.stroke();
  }
}


const VectorLength = (x: number, y: number) => {
  return Math.sqrt(x * x + y * y);
}
const dotProduct = (x1: number, y1: number, x2: number, y2: number) => {
  return x1 * x2 + y1 * y2;
}

/**
 * normal must be normalized
 */
const elasticCollision = (normalX: number, normalY: number, velX: number, velY: number): [number, number] => {
  const dot = dotProduct(normalX, normalY, velX, velY);
  const projX = dot * normalX;
  const projY = dot * normalY;

  return [velX - 2 * projX, velY - 2 * projY];
}

(window as any).Box2D().then((box2D: any) => {
  console.log("Box2D - INIT");
  const names = ["b2Vec2",
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
  (window as any).box2D = box2D;

  for (const name of names) {
    (window as any)[name] = box2D[name];
  }

  // singlePlayerHost();
})
class GameWorld {
  crates: Crate[];
  public ships: readonly Ship[] = [new Ship(0), new Ship(1)];

  characters: Character[];
  groundBody: RigidBody;
  readonly world: b2World;


  public constructor() {
    this.crates = [];
    this.world = new b2World(new b2Vec2(0, 30), true);
    for (let i = 0; i < 10; i++) {
      this.crates.push(new Crate(this.world))
    }

    // circle
    const bodyDef = new b2BodyDef();
    bodyDef.set_type(b2_dynamicBody);
    bodyDef.position.Set(20, 20);
    bodyDef.linearDamping = 0;
    bodyDef.angularDamping = 0;
    this.characters = [new Character(0, this.world), new Character(1, this.world)];

    // ground
    const vertices = [
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

    const groundBody = this.world.CreateBody(new b2BodyDef());
    const fixtureDef = new b2FixtureDef();
    fixtureDef.restitution = 0.2;
    this.groundBody = new RigidBody(groundBody);
    this.groundBody.addChain(fixtureDef, vertices);

  }

  public getCharacterById(id: number): Character | undefined {
    for (const character of this.characters) {
      if (character.id === id) {
        return character;
      }
    }
  }

  public step() {
    for (const character of this.characters) {
      if (character.futureInputs.length === 0) {
        character.step(emptyController());
      } else {
        character.step(character.futureInputs[0]);
        character.futureInputs.shift();
      }
    }
    this.world.Step(FRAME_TIME / 1000, 10, 8);
  }


  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(0, 0, 100, 50);
    ctx.beginPath();
    for (const chain of this.groundBody.chains) {
      ctx.moveTo(chain.vertices[0].x, chain.vertices[0].y);
      for (const vert of chain.vertices) {
        ctx.lineTo(vert.x, vert.y);
      }
    }
    for (const crate of this.crates) {
      crate.render(ctx);
    }
    ctx.lineWidth = 0.1;
    ctx.stroke();

    for (const character of this.characters) {
      character.render(ctx);
    }
  }
}
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
