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

class Controller {
    upKey: boolean = false;
    downKey: boolean = false;
    leftKey: boolean = false;
    rightKey: boolean = false;
}

function startGame() {
    const world = new World();
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    const controller = new Controller();

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

    const frame = (time: number) => {
        console.log("frame", time);
        world.step(controller);
        world.render(ctx);
        requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
}

const GAME_WIDTH: number = 500;
const GAME_HEIGHT: number = 500;

class Ship {
    public playerControlled: boolean;

    public radius: number = 30;

    public x: number = 30;
    public y: number = 30;
    public velx: number = 0;
    public vely: number = 0;

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
    public ships: Ship[] = [new Ship()];

    public constructor() {
        this.ships[0].playerControlled = true;
    }

    public step(controller: Controller) {
        console.log(controller);
        for (const ship of this.ships) {
            if (ship.playerControlled) {
                ship.step(controller);
            } else {
                ship.step(new Controller());
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
