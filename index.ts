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

    connection.on("open", () => {
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
function connectToServer(id: string): void {
  console.log("CLIENT");
  const peer = new Peer();
  peer.on("error", (err: any) => {
    console.log("ERROR", err);
  });
  peer.connect(id, WEBRTC_OPTIONS);
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
        shipId: 1
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
  shipId: number;
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
interface ShipStatus {
  shipId: number;
  x: number;
  y: number;
  velx: number;
  vely: number;
}

interface HostToClient {
  frameNumber: number;
  ships: ShipStatus[];
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
  const world = new World();
  const canvas = document.createElement("canvas");
  canvas.width = 500;
  canvas.height = 500;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (ctx === null) {
    throw new Error("No ctx");
  }

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
          const ship = world.getShipById(networkConnection.shipId);
          if (ship === undefined) {
            throw new Error("Big issue");
          }
          ship.futureInputs = [controller];

          world.step();

          if (frameCount % FRAMES_PER_PACKET === 0) {
            const packet: HostToClient = {
              frameNumber: frameCount,
              ships: world.ships.map((ship) => {
                return {
                  shipId: ship.id,
                  x: ship.x,
                  y: ship.y,
                  velx: ship.velx,
                  vely: ship.vely,
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
          const ship = world.getShipById(networkConnection.shipId);
          if (ship === undefined) {
            throw new Error("Big issue");
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
        client.dataConnection.on("data", (data) => {
          const packet: ClientToHost = data;

          const ship = world.getShipById(client.shipId);
          if (ship === undefined) {
            throw new Error("Impssoible");
          }
          console.log(packet);
          ship.futureInputs = ship.futureInputs.concat(packet.inputArray);
        });
      }
      break;
    }
    case "Client": {
      if (networkConnection.server !== null) {
        networkConnection.server.on("data", (data) => {
          const packet: HostToClient = data;
          console.log('server data', data)
          for (const shipPacket of packet.ships) {
            const ship = world.getShipById(shipPacket.shipId);
            if (ship === undefined) {
              throw new Error("impossible..")
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

const GAME_WIDTH: number = 500;
const GAME_HEIGHT: number = 500;

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

class World {
  public ships: readonly Ship[] = [new Ship(0), new Ship(1)];

  public constructor() {

  }

  public getShipById(id: number): Ship | undefined {
    for (const ship of this.ships) {
      if (ship.id === id) {
        return ship;
      }
    }
  }

  public step() {
    for (const ship of this.ships) {
      if (ship.futureInputs.length === 0) {
        ship.step(emptyController())
      } else {
        ship.step(ship.futureInputs[0]);
        ship.futureInputs.shift();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#cccccc";
    ctx.fillRect(0, 0, 500, 500);
    for (const ship of this.ships) {
      ship.render(ctx);
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
// function main2() {
//     const peer = new Peer();
//     peer.on("open", (id: string) => {
//         console.log(id);
//     });
//     console.log("main2");
// }

// main2();
