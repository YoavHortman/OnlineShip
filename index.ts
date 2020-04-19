export const x = 1;

function main1() {
    const localConnection = new RTCPeerConnection();

    localConnection.onicecandidateerror = (ev: RTCPeerConnectionIceErrorEvent) => {
        console.log("onicecandidateerror", ev);
        debugger;
    };

    localConnection.onnegotiationneeded = (ev: Event) => {
        console.log("onnegotiationneeded", ev);
        debugger;
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
    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    console.log("LOCAL DESCRIPTION:");
    console.log(btoa(JSON.stringify(localConnection.localDescription)));
    alert('Copy LocalDescription from console');

    const answerBlob = prompt("Paste Answer:");

    await localConnection.setRemoteDescription(JSON.parse(atob(answerBlob)));
}

main1();
