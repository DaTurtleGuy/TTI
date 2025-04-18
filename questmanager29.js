document.addEventListener('DOMContentLoaded', function() {
  let isProcessing = false;
  let lastProcessedTime = 0;
  const PROCESS_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
  let questMessageCounter = 0; // Initialize the quest message counter

  // Fetch the XML file
  fetch('textDatabase9.xml')
    .then(response => response.text())
    .then(data => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, 'text/xml');

// Continuously monitor the main message feed
const mainObserver = new MutationObserver(mutations => {
  if (!isProcessing && Date.now() - lastProcessedTime > PROCESS_INTERVAL) {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const triggers = xmlDoc.getElementsByTagName('trigger');
          const characters = xmlDoc.getElementsByTagName('character');
          
          for (let i = 0; i < triggers.length; i++) {
            const trigger = triggers[i].textContent;
            const character = characters[i].textContent;

            if (node.textContent.includes(trigger) && node.textContent.includes(character)) {
              const messageContent = triggers[i].parentNode.getElementsByTagName('message')[0].textContent;
              isProcessing = true;
              lastProcessedTime = Date.now();
              editAndSubmit(messageContent);
              break;
            }
          }
        }
      });
    });
  }
});

      // Start observing the main message feed
      mainObserver.observe(document.querySelector('#messageFeed'), {
        childList: true,
        subtree: true
      });

      // Observer for quest-related messages
      const questObserver = new MutationObserver(() => {
        let questMessages = document.querySelectorAll('#messageFeed > .message, #messageFeed > .message.hiddenFromUser');
        if (questMessages.length > 0) {
          questMessageCounter++;
          console.log("Quest Message Counter:", questMessageCounter);

          // Clear quest text after 10 or more messages
          if (questMessageCounter >= 20) {
            clearQuestText();
            questMessageCounter = 0; // Reset the message counter
          }
        }
      });

      // Start observing for quest-related messages
      questObserver.observe(document.querySelector('#messageFeed'), {
        childList: true
      });

      function editAndSubmit(content) {
        let checkExist = setInterval(function() {
          let selectedThread = document.querySelector('div.thread.selected');
          if (selectedThread) {
            let characterEditButton = selectedThread.getElementsByClassName('characterEditButton')[0];
            if (characterEditButton) {
              characterEditButton.click();
              clearInterval(checkExist);

              setTimeout(function() {
                var textareaElement = document.querySelector('textarea[data-spec-key="reminderMessage"]');
                if (textareaElement) {
                  textareaElement.value = content;
                  submitChanges();
                }
              }, 500);
            }
          }
        }, 100);
      }

      function clearQuestText() {
        let checkExist = setInterval(function() {
          let selectedThread = document.querySelector('div.thread.selected');
          if (selectedThread) {
            let characterEditButton = selectedThread.getElementsByClassName('characterEditButton')[0];
            if (characterEditButton) {
              characterEditButton.click();
              clearInterval(checkExist);

              setTimeout(function() {
                var textareaElement = document.querySelector('textarea[data-spec-key="reminderMessage"]');
                if (textareaElement) {
                  textareaElement.value = '';
                  submitChanges();
                }
              }, 500);
            }
          }
        }, 100);
      }

      function submitChanges() {
        let checkSaveExist = setInterval(function() {
          let saveButton = document.querySelector('button.submit');
          if (saveButton) {
            saveButton.click();
            clearInterval(checkSaveExist);

            // Reset the flag and reconnect the observer
            setTimeout(() => {
              isProcessing = false; // Reset the flag
            }, 1000); // Wait for 1 second before resetting
          }
        }, 100);
      }
    });
});