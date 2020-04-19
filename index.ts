export const x = 1;

const config: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.stunprotocol.org:3478" }]
};


function main1() {
    const localConnection = new RTCPeerConnection(config);

    localConnection.onicecandidateerror = (ev: RTCPeerConnectionIceErrorEvent) => {
        console.log("onicecandidateerror", ev);
        debugger;
    };

    localConnection.onnegotiationneeded = (ev: Event) => {
        console.log("onnegotiationneeded", ev);
        debugger;
    };

    localConnection.oniceconnectionstatechange = () => {
        console.log("oniceconnectionstatechange", localConnection.iceConnectionState);
    };

    const sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = (ev: Event) => {
        console.log("onopen event");
        setTimeout(() => {
            console.log("Sending HELLO");
            sendChannel.send("HELLO");
        }, 10000);
    };

    sendChannel.onerror = (err: RTCErrorEvent) => {
        console.log("error", err);
        debugger;
    };

    sendChannel.onclose = (ev: Event) => {
        console.log("close", close);
        debugger;
    };


    // const remoteConnection = new RTCPeerConnection();
    // remoteConnection.ondatachannel = (ev: RTCDataChannelEvent) => {
    //     debugger;
    // };



    localConnection.onicecandidate = (ev: RTCPeerConnectionIceEvent) => {
        if (!ev.candidate) {
            return;
        }

        console.log("ICE CANDIDATE:");
        console.log(btoa(JSON.stringify(ev.candidate)));
        alert('Copy ICE Candidate from console');
        setTimeout(async () => {
            const otherCanddiateBlob = prompt("Paste other's ICE candidate");
            if (otherCanddiateBlob) {
                await localConnection.addIceCandidate(JSON.parse(atob(otherCanddiateBlob)));
                console.log("Added Ice Candidate");
            }
        }, 1000);
    }

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

async function localShit(localConnection: RTCPeerConnection) {
    await (localConnection as any).setLocalDescription();
    console.log("LOCAL DESCRIPTION:");
    console.log(btoa(JSON.stringify(localConnection.localDescription)));
    alert('Copy LocalDescription from console');

    const answerBlob = prompt("Paste Answer:");

    await localConnection.setRemoteDescription(JSON.parse(atob(answerBlob)));

    console.log("Added Remote Description");
}

main1();
