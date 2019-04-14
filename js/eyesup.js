let counter =  0;
let lastUITick = 0;
let mouseX = 0;
let mouseY = 0;
let chatter = 0;
const dist_threshold = 30; //set distance threshold to reset counter
const cycle_tolerance = 75; // set number of cycles to wait before sending alert
const interval_period = 1000; // set time delay
const chatter_threshold = 45; // max std to accept as 'focused'
const chatter_tolerance = 45; // extra number of cycles to wait even if chatter is active
const UI_stale_tolerance = 150; //number of cycles to wait if UI input is stale...
dist_buffer_length = 30;
const dist_buffer  = [];
let devMode = true;
let is_initialized = false;

const addToDistBuffer = dist => {
    if (dist_buffer.length >= dist_buffer_length ) {
        dist_buffer.shift();
    } 
    dist_buffer.push(dist);
}

const getMovingMed = arr => [...arr].sort(function(a, b){return b-a})[Math.floor(arr.length / 2)];
const getMovingAvg = arr => arr.reduce((a,c)  => a+c) / arr.length;
const getStd = arr => {
    const avg = getMovingAvg(arr);
    return Math.sqrt(arr.reduce((a,c)  => a + (c - avg) * (c-avg)) / arr.length)
}

const resetCounters = () => {
    lastUITick -= counter; //keeps our counters in a handleable range
    counter = 0;
}



const createNotification = (title, message) => {
    chrome.runtime.sendMessage({
        type: 'notification',
        id: 'eyesup'+Math.random().toString(36).substr(2, 9),
        notification: {
            type: 'basic',
            iconUrl: '../../img/logo.png',
            title,
            message
        }
    }, () => {});
};

const update = () => {
    let prediction = null;
    let xp = 0;
    let yp = 0;
    let xa = 0;
    let ya = 0;
    prediction = webgazer.getCurrentPrediction();
    if ( prediction ) {
        is_initialized = true;
        xa += mouseX;
        ya += mouseY;
        xp += prediction.x;
        yp += prediction.y;
        const x_avg_delta = Math.abs(xp - xa); 
        const y_avg_delta = Math.abs(yp - ya); 
        const dist = Math.sqrt((x_avg_delta * x_avg_delta) + (y_avg_delta * y_avg_delta));
        // chatter = dist / (counter+1) + chatter * (counter) / (counter + 1); //avg distance for chatter
        addToDistBuffer(dist);
        chatter = getStd(dist_buffer);
    }
    if (is_initialized){
        counter++;
        if (devMode) {
            console.log('hi');
            console.log(`cycle_count: ${counter}    median_delta: ${getMovingMed(dist_buffer)}  std: ${getStd(dist_buffer)}`)
        }
    }
    
    //Now evaluate if we need to send alerts;

    // if (dist < dist_threshold) {
    //     resetCounters();
    // }
    if (counter >= cycle_tolerance && chatter < chatter_threshold && getMovingMed(dist_buffer)<dist_threshold) {
        // maybe try a harsher reset condition?
        resetCounters();
    }
    if (counter > cycle_tolerance && chatter > chatter_threshold) {
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

const setDevMode = (val) => {
    webgazer.showVideo(val);
    webgazer.showFaceOverlay(val);
    webgazer.showFaceFeedbackBox(val);
    webgazer.showPredictionPoints(val);
    devMode = val;
}

const initialize = () => {
    createNotification('Hello World!', 'Eyesup has initialized! Click around to calibrate.')
    webgazer.begin();
    setDevMode(devMode);
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
