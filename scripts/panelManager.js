
function toggleFloatingWindow() {
    const floatingWindow = document.getElementById("floating-window");
    const overlay = document.getElementById("overlayTurtle");
    const isVisible =
        window.getComputedStyle(floatingWindow).display !== "none";


    if (isVisible) {
        floatingWindow.style.display = "none";
        overlay.style.display = "none";
    } else {
        floatingWindow.style.display = "block";
        overlay.style.display = "block";
        closeAllPanels();
    }
}
function toggleNewsPanel() {
    var newsPanel = document.getElementById('news-panel');
    var newsPanelStyle = window.getComputedStyle(newsPanel);
    var newsPanelRight = newsPanelStyle.getPropertyValue('right');
    var optionsPanel = document.getElementById('options-panel');
    var optionsPanelStyle = window.getComputedStyle(optionsPanel);
    var optionsPanelRight = optionsPanelStyle.getPropertyValue('right');



    if (newsPanelRight === '0px') {
        newsPanel.style.right = '-' + newsPanel.offsetWidth + 'px';
        newsPanel.classList.remove('slide-in-animation');
        newsPanel.addEventListener('transitionend', function () {
            newsPanel.style.display = 'none';
        }, { once: true });

        // Save the panel state in a cookie
        setCookie('newsPanelState', 'closed');
    } else {
        if (optionsPanelRight === '0px') {
            optionsPanel.style.right = '-' + optionsPanel.offsetWidth + 'px';
            optionsPanel.classList.remove('slide-in-animation');
            optionsPanel.addEventListener('transitionend', function () {
                optionsPanel.style.display = 'none';
            }, { once: true });

            // Save the panel state in a cookie
            setCookie('optionsPanelState', 'closed');
        }
        newsPanel.style.display = 'block';
        newsPanel.style.right = '0px';
        newsPanel.classList.add('slide-in-animation');

        // Save the panel state and the current version in cookies
        setCookie('newsPanelState', 'open');
        setCookie('lastVersion', document.querySelector('.version').innerText.trim());
    }
}
function toggleOptionsPanel() {
    var optionsPanel = document.getElementById('options-panel');
    var optionsPanelStyle = window.getComputedStyle(optionsPanel);
    var optionsPanelRight = optionsPanelStyle.getPropertyValue('right');
    var newsPanel = document.getElementById('news-panel');
    var newsPanelStyle = window.getComputedStyle(newsPanel);
    var newsPanelRight = newsPanelStyle.getPropertyValue('right');

    if (optionsPanelRight === '0px') {
        optionsPanel.style.right = '-' + optionsPanel.offsetWidth + 'px';
        optionsPanel.classList.remove('slide-in-animation');
        optionsPanel.addEventListener('transitionend', function () {
            optionsPanel.style.display = 'none';
        }, { once: true });

        // Save the panel state in a cookie
        setCookie('optionsPanelState', 'closed');
    } else {
        if (newsPanelRight === '0px') {
            newsPanel.style.right = '-' + newsPanel.offsetWidth + 'px';
            newsPanel.classList.remove('slide-in-animation');
            newsPanel.addEventListener('transitionend', function () {
                newsPanel.style.display = 'none';
            }, { once: true });
            setCookie('newsPanelState', 'closed');
        }
        optionsPanel.style.display = 'block';
        optionsPanel.style.right = '0px';
        optionsPanel.classList.add('slide-in-animation');

        // Save the panel state and the current version in cookies
        setCookie('optionsPanelState', 'open');
        setCookie('lastVersion', document.querySelector('.version').innerText.trim());
    }
}

// Helper function to set a cookie
function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
}

// Helper function to get a cookie value
function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function closeAllPanels() {
    var newsPanel = document.getElementById('news-panel');
    var optionsPanel = document.getElementById('options-panel');

    // Close news panel
    newsPanel.style.right = '-' + newsPanel.offsetWidth + 'px';
    newsPanel.classList.remove('slide-in-animation');
    newsPanel.addEventListener('transitionend', function () {
        newsPanel.style.display = 'none';
    }, { once: true });
    setCookie('newsPanelState', 'closed');

    // Close options panel
    optionsPanel.style.right = '-' + optionsPanel.offsetWidth + 'px';
    optionsPanel.classList.remove('slide-in-animation');
    optionsPanel.addEventListener('transitionend', function () {
        optionsPanel.style.display = 'none';
    }, { once: true });
    setCookie('optionsPanelState', 'closed');
}


document.addEventListener('DOMContentLoaded', function () {
    var newsPanel = document.getElementById('news-panel');
    var isPanelOpen = false;
    var optionsPanel = document.getElementById('options-panel');
    var optionsPanelStyle = window.getComputedStyle(optionsPanel);
    var optionsPanelRight = optionsPanelStyle.getPropertyValue('right');
    // Check the saved version and the current version
    var savedVersion = getCookie('lastVersion');
    var currentVersionElement = document.querySelector('.version');
    var currentVersion = currentVersionElement ? currentVersionElement.innerText.trim() : '';

    if (currentVersion !== savedVersion) {
        // Update the panel state and save the new version
        if (optionsPanelRight === '0px') {
            closeAllPanels();
            optionsPanel.style.right = '-' + optionsPanel.offsetWidth + 'px';
            optionsPanel.classList.remove('slide-in-animation');
            optionsPanel.addEventListener('transitionend', function () {
                optionsPanel.style.display = 'none';
            }, { once: true });

            // Save the panel state in a cookie
            setCookie('optionsPanelState', 'closed');
        }
        newsPanel.style.display = 'block';
        newsPanel.style.right = '0px';
        setCookie('newsPanelState', 'open');
        setCookie('lastVersion', currentVersion);
    } else if (isPanelOpen) {
        newsPanel.style.display = 'block';
        newsPanel.style.right = '0px';
    } else {
        newsPanel.style.right = '-350px';
    }
});