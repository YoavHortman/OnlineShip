export const x = 1;

function main2() {
    const localConnection = new RTCPeerConnection();

    localConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
        console.log("Connected to datachannel");
        const channel = ev.channel;
        channel.onmessage = (ev: MessageEvent) => {
            console.log("message", ev.data);
        };
    };

    localConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
        console.log("ICE CANDIDATE:");
        console.log(btoa(JSON.stringify(ev.candidate)));
        alert('Copy ICE Candidate from console');
        setTimeout(() => {
            const otherCanddiateBlob = prompt("Paste other's ICE candidate");
            if (otherCanddiateBlob) {
                localConnection.addIceCandidate(JSON.parse(atob(otherCanddiateBlob)));
            }
        }, 1000);
     }

    localShit(localConnection);
}

async function respond(localConnection: RTCPeerConnection) {
}

async function localShit(localConnection: RTCPeerConnection) {
    const remoteDescription = prompt("Paste Otehr's LocalDescription:");

    await localConnection.setRemoteDescription(JSON.parse(atob(remoteDescription)));
    const answer = await localConnection.createAnswer();
    await localConnection.setLocalDescription(answer)
 
    console.log("ANSWER:");
    console.log(btoa(JSON.stringify(answer)));
    alert("Copy Answer from console");
}

main2();
