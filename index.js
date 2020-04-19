var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export var x = 1;
var config = {
    iceServers: [{ urls: "stun:stun.1und1.de" }]
};
function main1() {
    var _this = this;
    var localConnection = new RTCPeerConnection(config);
    localConnection.onicecandidateerror = function (ev) {
        console.log("onicecandidateerror", ev);
        debugger;
    };
    localConnection.onnegotiationneeded = function (ev) {
        console.log("onnegotiationneeded", ev);
        debugger;
    };
    localConnection.oniceconnectionstatechange = function () {
        console.log("oniceconnectionstatechange", localConnection.iceConnectionState);
    };
    var sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = function (ev) {
        console.log("onopen event");
        setTimeout(function () {
            console.log("Sending HELLO");
            sendChannel.send("HELLO");
        }, 10000);
    };
    sendChannel.onerror = function (err) {
        console.log("error", err);
        debugger;
    };
    sendChannel.onclose = function (ev) {
        console.log("close", close);
        debugger;
    };
    // const remoteConnection = new RTCPeerConnection();
    // remoteConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
    //     debugger;
    // };
    localConnection.onicecandidate = function (ev) {
        if (!ev.candidate) {
            return;
        }
        console.log("ICE CANDIDATE:");
        console.log(btoa(JSON.stringify(ev.candidate)));
        alert('Copy ICE Candidate from console');
        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            var otherCanddiateBlob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        otherCanddiateBlob = prompt("Paste other's ICE candidate");
                        if (!otherCanddiateBlob) return [3 /*break*/, 2];
                        return [4 /*yield*/, localConnection.addIceCandidate(JSON.parse(atob(otherCanddiateBlob)))];
                    case 1:
                        _a.sent();
                        console.log("Added Ice Candidate");
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }, 1000);
    };
    // remoteConnection.onicecandidate = e => !e.candidate
    //     || localConnection.addIceCandidate(e.candidate);
    // localConnection.createOffer()
    //     .then(offer => localConnection.setLocalDescription(offer))
    //     .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
    //     .then(() => remoteConnection.createAnswer())
    //     .then(answer => remoteConnection.setLocalDescription(answer))
    //     .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription));
    localShit(localConnection);
}
function localShit(localConnection) {
    return __awaiter(this, void 0, void 0, function () {
        var answerBlob;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, localConnection.setLocalDescription()];
                case 1:
                    _a.sent();
                    console.log("LOCAL DESCRIPTION:");
                    console.log(btoa(JSON.stringify(localConnection.localDescription)));
                    alert('Copy LocalDescription from console');
                    answerBlob = prompt("Paste Answer:");
                    return [4 /*yield*/, localConnection.setRemoteDescription(JSON.parse(atob(answerBlob)))];
                case 2:
                    _a.sent();
                    console.log("Added Remote Description");
                    return [2 /*return*/];
            }
        });
    });
}
main1();
//# sourceMappingURL=index.js.map