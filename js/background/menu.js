const properties = {
    dev_visibility: false
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type == 'init_toggles') {
        sendResponse(properties);
    } else if (message.type=='toggle_dev_visibility') {
        //recieve, set, and propogate
        properties.dev_visibility = message.val;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {type: "toggle_dev_visibility_p", val: message.val}, () => {});
        });
        sendResponse();

    } else {
        console.log('unrecognized message type')
    }
    
  });