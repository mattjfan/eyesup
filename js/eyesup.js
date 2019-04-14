let counter =  0;
let mouseX = 0;
let mouseY = 0;
// const update = () => {
//     const num_iter = 1;
//     let prediction = null;
//     let xp = 0;
//     let yp = 0;
//     let xa = 0;
//     let ya = 0;
//     for (i = 0; i < num_iter; i++) {
//         prediction = webgazer.getCurrentPrediction();
//         if ( prediction ) {
//             xa += mouseX;
//             ya += mouseY;
//             xp += prediction.x;
//             yp += prediction.y;
//             // $('#x').text(prediction.x);
//             // $('#y').text(prediction.y);
//             // $('#x').text(prediction.x);
//             // $('#y').text(prediction.y);
//             // webgazer.showPredictionPoints();
//         }
//     }
//     const x_avg_delta = Math.abs(xp - xa) / num_iter; 
//     const y_avg_delta = Math.abs(yp - ya) / num_iter; 
//     $('#x').text(x_avg_delta);
//     $('#y').text(y_avg_delta);
//     // $('#x').text('hello'+counter);
//     // $('#y').text('there'+counter);
//     // counter = counter + 1;
// };

document.onmousemove = (e) => {
    var event = e || window.event;
    mouseX = event.clientX;
    mouseY = event.clientY;
}


const createNotification = (title, message) => {
    chrome.runtime.sendMessage({
        type: 'notification',
        id:title+Date.now(),
        notification: {
            type: 'basic',
            iconUrl: '../../img/logo.png',
            title,
            message
        }
    }, () => {});
};

const initialize = () => {
    // createNotification('Hello World!', 'Eyesup has initialized! Click around to calibrate.')
    // webgazer.clearData
    webgazer.begin();
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(true);
    // setInterval(update, 100);
}


// window.addEventListener("beforeunload", () => { webgazer.end() })
// initialize();
window.addEventListener("load", initialize, false);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type == 'toggle_dev_visibility_p') {
        alert(`toggling dev visibility to ${message.val}`);
    } else {
        console.log('unrecognized message type')
    }
    sendResponse();
});

// createNotification('Test','This is a test message');
// chrome.runtime.sendMessage({type: 'notification', id: 'test', notification }, () => {});
// chrome.notifications.create("test", notification);
