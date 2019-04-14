chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type == 'notification') {
        chrome.notifications.create(message.id, message.notification)
    } else {
        console.log('unrecognized message type')
    }
    sendResponse();
  });