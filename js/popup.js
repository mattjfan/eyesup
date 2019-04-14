// Popup menu is Source of Truth for extension settings.
// let devVisibility = false;

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

const initToggles = () => {
    chrome.runtime.sendMessage({
        type: 'init_toggles'
    }, (response) => {
        alert(response.dev_visibility);
        $('#toggle-dev-mode').prop("checked", response.dev_visibility ); 
    });
};

const getCurrentTabID = () => {
    chrome.tabs.query(
        { currentWindow: true, active: true },
        tabArray => tabArray[0].id
    );
};

const toggleDevVisibility = (val) => {
    chrome.runtime.sendMessage({
        type: 'toggle_dev_visibility',
        val
    }, () => {});
};

initToggles();


$('#toggle-dev-mode').change(() => {
    if($('#toggle-dev-mode').prop('checked')) {
        toggleDevVisibility(true); //toggles don't update in time, so they're inverted.
        // This is a kludge to overcome the delay due to CSS animation @TODO
        // alert('true');
    } else {
        toggleDevVisibility(false); 
        // alert('false');
    }
});

