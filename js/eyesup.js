let counter =  0;
let lastUITick = 0;
let mouseX = 0;
let mouseY = 0;
let chatter = 0;
const dist_threshold = 100; //set distance threshold to reset counter
const cycle_tolerance = 75; // set number of cycles to wait before sending alert
const interval_period = 200; // set time delay
const chatter_mult = 2; // chatter multiplier in terms of dist_threshold
const chatter_tolerance = 45; // extra number of cycles to wait even if chatter is active
const UI_stale_tolerance = 150; //number of cycles to wait if UI input is stale...

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

const resetCounters = () => {
    lastUITick -= counter; //keeps our counters in a handleable range
    counter = 0;
}

const update = () => {
    const num_iter = 1;
    let prediction = null;
    let xp = 0;
    let yp = 0;
    let xa = 0;
    let ya = 0;
    for (i = 0; i < num_iter; i++) {
        prediction = webgazer.getCurrentPrediction();
        if ( prediction ) {
            xa += mouseX;
            ya += mouseY;
            xp += prediction.x;
            yp += prediction.y;
        }
    }
    const x_avg_delta = Math.abs(xp - xa) / num_iter; 
    const y_avg_delta = Math.abs(yp - ya) / num_iter; 
    const dist = Math.sqrt((x_avg_delta * x_avg_delta) + (y_avg_delta * y_avg_delta));
    chatter = dist/(counter+1) + chatter * (counter) / (counter + 1); //avg distance for chatter
    counter = counter + 1;
    //Now evaluate if we need to send alerts;
     
    if (dist < dist_threshold) {
        resetCounters();
    }
    if (counter > cycle_tolerance && chatter < chatter_mult * dist_threshold) {
        resetCounters();
        createNotification("Doze off?","Let's get back to work!");
    } else if (counter > cycle_tolerance + chatter_tolerance) {
        resetCounters();
        createNotification("You still there?","Let's get back to work!");
    } else if (counter - lastUITick > UI_stale_tolerance) {
        resetCounters();
        createNotification("Seems awfully still...","Let's get back to work!");
    }
};

document.onmousemove = (e) => {
    var event = e || window.event;
    mouseX = event.clientX;
    mouseY = event.clientY;
    lastUITick = counter;
}

document.addEventListener("keypress", () => {
    lastUITick = counter;
});

const initialize = () => {
    // createNotification('Hello World!', 'Eyesup has initialized! Click around to calibrate.')
    // webgazer.clearData
    webgazer.begin();
    webgazer.showVideo(false);
    webgazer.showFaceOverlay(false);
    webgazer.showFaceFeedbackBox(false);
    webgazer.showPredictionPoints(true);
    setInterval(update, interval_period);
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
