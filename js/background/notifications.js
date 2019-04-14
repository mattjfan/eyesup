chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type == 'notification') {
        chrome.notifications.create(message.id, message.notification)
    } else if (message.type == 'clear_notifications') {
        chrome.notifications.getAll(notifications => notifications.foreach(
            id => {
                if (/eyesup/.test(id)){
                    chrome.notifications.clear(id,()=>{});
                }
            }
        ));
    } else {
        console.log('unrecognized message type')
        console.log(message);
    }
    sendResponse();
  });