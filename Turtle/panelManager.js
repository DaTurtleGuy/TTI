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
function adjustPanelForMobile() {
    var optionsPanel = document.getElementById('options-panel');
    if (window.innerWidth <= 768) { // Assumes 768px is the threshold for mobile
        // Apply mobile-specific styles
        optionsPanel.style.width = '100%';
        optionsPanel.style.position = 'fixed';
        optionsPanel.style.top = '0';
        optionsPanel.style.right = '0';
        optionsPanel.style.backgroundColor = 'black'; // Example mobile style
        optionsPanel.style.color = 'lightblue'; // Example mobile style
    } else {
        // Revert to desktop-specific styles
        optionsPanel.style.width = '30%';
        optionsPanel.style.position = 'fixed'; // Adjust as needed for desktop
        optionsPanel.style.top = '0'; // Ensure it's aligned properly
        optionsPanel.style.right = '0';
        optionsPanel.style.backgroundColor = 'black'; // Reapply desktop styles if needed
        optionsPanel.style.color = 'lightblue'; // Reapply desktop styles if needed
    }
}

function clickOptionsPanelButton() {
    // Only proceed if the viewport width is 768px or less
    if (window.innerWidth <= 768) {
        var button = document.querySelector("#options-panel > button");
        if (button) {
            button.click(); // Simulate a click on the button after a delay
        }
    }
}

// Adjust panel on initial load and delay the click on the options-panel button for mobile
document.addEventListener('DOMContentLoaded', function () {
    adjustPanelForMobile();
    setTimeout(clickOptionsPanelButton, 1000); // Delay the button click by 2000 milliseconds, but only on mobile
});

// Adjust panel whenever the window is resized
window.addEventListener('resize', adjustPanelForMobile);

setInterval(adjustNewsHeight, 500);
function adjustNewsHeight() {
    const footerHeight = $(".panel_footer").height();
    const newsHeight = $("#news-panel").height();
    const newsWrapper = $(".news_wrapper");
    newsWrapper.height(newsHeight - footerHeight - 130);
    
}
populateNews();

function parseString(str) {
    /**
     * Parses a string in the format "Author: MM/DD/YYYY: Comment" and returns
     * an object containing the author, date, and trimmed comment.
     *
     * @param {string} str The input string.
     * @returns {object} An object with the properties:
     *   - author: The author's name (string).
     *   - date: The date in MM/DD/YYYY format (string).
     *   - comment: The trimmed comment (string).  Returns null if string is invalid
     */
  
    if (typeof str !== 'string') {
      console.error("Input must be a string."); //Optional error logging.  Could also throw an error.
      return null; //Or throw new Error("Input must be a string");
    }
  
  
    const parts = str.split(':');
  
    if (parts.length < 3) {
      console.error("Invalid string format.  Expected 'Author: MM/DD/YYYY: Comment'."); //Optional error logging
      return null; //Or throw new Error("Invalid string format");
    }
  
    const author = parts[0].trim();
    const date = parts[1].trim();
    const comment = parts.slice(2).join(':').trim(); //Handles comments with colons
  
    return {
      author: author,
      date: date,
      comment: comment
    };
  }

function clearMessages(messages) {
    let returnMessages = [];
    for (const message of messages) {
        const lines = message.split('\n');
        let returnmessage = [];
        for (const line of lines) {
            const trimmedLine = line.trim();
            returnmessage.push(trimmedLine);
        }
        returnMessages.push(returnmessage.join('\n'));
    }
    return returnMessages;
}

const avatars = {
    Turtle: "https://files.catbox.moe/jx78sw.png",
    Elo: "https://files.catbox.moe/lkvnqq.png",
    Unknown: "https://files.catbox.moe/qhiwr6.png"
}
async function populateNews() {
    const newsText = await fetch("news.txt").then(response => response.text());
    const messages = clearMessages(newsText.split("///").map(message => message.trim()).filter(message => message !== ""));
    const newsWrapper = $(".news_wrapper");

    for (const message of messages) {
        const template = $(".templates .comment").clone();
        const { author, date, comment } = parseString(message);

        template.find(".commentAvatar").attr("src", avatars[author] || avatars.Unknown);
        template.find(".commentAuthor").text(author);
        template.find(".commentDate").text(date);
        template.find(".commentText p").text(comment);
        newsWrapper.append(template);

    }

}