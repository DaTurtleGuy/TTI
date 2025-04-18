
var displayAddCharacterButton = true; // You can change this value as needed
let CharacterData = {};
let isPng = false;
let fileGlobal = "";
function updateAddCharacterButtonVisibility() {
    const addCharacterButton = document.getElementById(
        "floating-window-btn"
    );
    addCharacterButton.style.display = displayAddCharacterButton
        ? "block"
        : "none";
}
function uploadImage(imageFile) {
    const apiKey = getCookie("ImageToken"); // Replace with your actual API key
    const formData = new FormData();
    formData.append('key', apiKey);
    formData.append('image', imageFile);

    return fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return "Failed to upload image"
        })
        .then(data => {
            if (data.success) {
                const imageURL = data.data.url;
                return imageURL;
            } else {
                throw new Error('Upload failed: ' + data.error.message);
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            throw error; // Rethrow the error for handling outside this function
        });
}

function getAlternateGreetings() {
    try {
        const fileInput = document.getElementById("file");
        const file = fileInput.files[0];

        if (!file) {
            return;
        }

        // Check if the uploaded file is a JSON file
        if (file.type === "application/json") {
            isPng = false;
            const reader = new FileReader();
            reader.onload = async function (event) {
                try {
                    const characterData = JSON.parse(event.target.result);
                    // Save the extracted character data
                    CharacterData = characterData;
                    displayGreetings(characterData);
                } catch (error) {
                    console.error("Error parsing JSON file:", error);
                    showError("Error parsing JSON file. Please ensure the file is in the correct format.");
                }
            };
            reader.readAsText(file);
        } else if (file.type === "image/png") {
            // Check if the uploaded file is a PNG image
            // Extract character data from the image
            isPng = true;
            extractCharacterData(file)
                .then((characterData) => {
                    // Save the extracted character data
                    CharacterData = characterData;
                    displayGreetings(characterData);
                })
                .catch((error) => {
                    console.error("Error extracting character data from PNG:", error);
                    showError("Error processing PNG file. Please ensure the file is in the correct format.");
                });
        } else {
            showError("Unsupported file type. Please upload a PNG image or a JSON file.");
        }
    } catch (error) {
        console.error("Error:", error);
        showError("Error processing file. Please try again.");
    }
}
function showError(text) {
    if (window.innerWidth <= 768) {
        alert(text);
    } else {
        Toastify({
            text: text,
            duration: 6000,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
                background: "red",
            },
        }).showToast();
    }
}


function displayGreetings(characterData) {
    const firstGreeting = characterData.data.first_mes;
    const alternateGreetings = characterData.data.alternate_greetings;
    const allGreetings = [firstGreeting, ...alternateGreetings];
    const greetingsElement = document.getElementById("alternateGreetings");
    greetingsElement.innerHTML = ""; // Clear previous greetings
    if (allGreetings && allGreetings.length > 0) {
        allGreetings.forEach((greeting, index) => {
            greetingsElement.innerHTML += `
  <div class="greeting-container">
    <div class="greeting-content">
        <p id="greeting-${index + 1}">${greeting.replace(
                /\n/g,
                "<br>"
            )}</p>
    </div>
    <button onclick="selectGreeting(${index + 1
                })" class="select-button">Select</button>
  </div>`;
        });
    } else {
        greetingsElement.innerHTML = "<p>No greetings found.</p>";
    }
}

async function selectGreeting(index) {
    const greetingElement = document.getElementById(`greeting-${index}`);
    console.log(`Element ID: greeting-${index}`);

    if (greetingElement) {
        const selectedGreeting = greetingElement.innerText
            .replace(/^\d+ - /, "") // Remove the index and hyphen
            .replace(/\s*Select$/, "") // Remove trailing " Select" if present
            .trim();

        const selectedGreetingParam = encodeURIComponent(selectedGreeting);

        try {
            const url = await generate_url(CharacterData, selectedGreeting);

            if (url) {
                toggleFloatingWindow();
                window.location.href = url; // Redirect to the generated URL
            } else {
                console.error("Error generating URL.");
            }
        } catch (error) {
            console.error("Error generating URL:", error);
        }
    } else {
        console.error(`Element with ID 'greeting-${index}' not found.`);
    }
}


async function generate_url(characterData, greeting) {
    // Extracting relevant data from the JSON
    const name = characterData.data.name;
    const roleInstruction = characterData.data.description || "";
    let Avatar = '';

    // Define a function to upload the image
    // Define a function to upload the image
    async function uploadImageAsync() {
        try {
            if (isPng) {
                Avatar = await uploadImage(fileGlobal);
                while (Avatar === "") {
                    console.log("Waiting for image upload...");
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            // Handle the error here (e.g., log it or show a message to the user)
            // If you want to continue execution even if this error occurs, you don't need to rethrow it
        }
    }


    // Call the function to upload the image
    await uploadImageAsync();

    let behavior = characterData.data.description || "";
    if (characterData.data.description && characterData.data.personality) {
        behavior += "\n\n" + characterData.data.personality;
    } else if (
        !characterData.data.description &&
        characterData.data.personality
    ) {
        behavior = characterData.data.personality;
    }

    const speech = greeting || characterData.data.first_mes;
    const systemPrompt = characterData.data.system_prompt || "";
    const postHistoryInstructions =
        characterData.data.post_history_instructions || "";

    // Choose reminderMessage based on the conditions
    const reminderMessage = systemPrompt || postHistoryInstructions || "";

    // Constructing the character object
    const characterObject = {
        addCharacter: {
            name: name,
            roleInstruction: roleInstruction,
            behavior: behavior,
            speech: speech,
            reminderMessage: reminderMessage,
            modelName: "good",
            maxTokensPerMessage: null,
            fitMessagesInContextMethod: "summarizeOld",
            textEmbeddingModelName: "text-embedding-ada-002",
            autoGenerateMemories: "v1",
            temperature: 0.85,
            customCode: "",
            initialMessages: [
                { content: speech, author: "ai", hiddenFrom: [] },
            ],
            avatar: { url: Avatar }, // Include Avatar URL in the object
            scene: {
                background: { url: "" },
                music: { url: "" },
            },
            userCharacter: { avatar: {} },
            systemCharacter: { avatar: {} },
            streamingResponse: true,
            folderPath: "",
            customData: {},
            uuid: null,
            folderName: "",
        },
    };

    // Convert the character object to a JSON string
    const characterJson = JSON.stringify(characterObject);

    // URL encode the JSON string
    const urlEncodedJson = encodeURIComponent(characterJson);

    const finalUrl = `https://ttalesinteractive.com/beta/oai/play.html#${urlEncodedJson}`;

    return finalUrl;
}