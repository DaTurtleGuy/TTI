var displayAddCharacterButton = true; // You can change this value as needed
let CharacterData = {};
let Avatar = "";
let isPng = false;
function updateAddCharacterButtonVisibility() {
  const addCharacterButton = document.getElementById("floating-window-btn");
  addCharacterButton.style.display = displayAddCharacterButton
    ? "block"
    : "none";
}
function uploadImage(imageFile) {
  const formData = new FormData();
  formData.append("file", imageFile);

  return fetch("https://api.put.re/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const imageURL = data.data.link;
      return imageURL;
    })
    .catch((error) => {
      console.error("Error uploading image:", error);
      throw error; // Rethrow the error for handling outside this function
    });
}

function getAlternateGreetings() {
  try {
    const fileInput = document.getElementById("file");
    const file = fileInput.files[0];

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
          alert("Error parsing JSON file. Please try again.");
        }
      };
      reader.readAsText(file);
    } else if (file.type === "image/png") {
      // Check if the uploaded file is a PNG image
      // Extract character data from the image
      isPng = true;
      const characterData = extractCharacterData(file);
      // Save the extracted character data
      CharacterData = characterData;
      displayGreetings(characterData);
    } else {
      alert("Unsupported file type. Please upload a PNG image or a JSON file.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error processing file. Please try again.");
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
        <p id="greeting-${index + 1}">${greeting.replace(/\n/g, "<br>")}</p>
    </div>
    <button onclick="selectGreeting(${
      index + 1
    })" class="select-button">Select</button>
  </div>`;
    });
  } else {
    greetingsElement.innerHTML = "<p>No greetings found.</p>";
  }
}

function selectGreeting(index) {
  const greetingElement = document.getElementById(`greeting-${index}`);
  console.log(`Element ID: greeting-${index}`);
  if (greetingElement) {
    const selectedGreeting = greetingElement.innerText
      .replace(/^\d+ - /, "") // Remove the index and hyphen
      .replace(/\s*Select$/, "") // Remove trailing " Select" if present
      .trim();

    const selectedGreetingParam = encodeURIComponent(selectedGreeting);

    const url = generate_url(CharacterData, selectedGreeting);

    if (url) {
      window.location.href = url; // Redirect to the generated URL
    } else {
      console.error("Error generating URL.");
    }
  } else {
    console.error(`Element with ID 'greeting-${index}' not found.`);
  }
}

function generate_url(characterData, greeting) {
  // Extracting relevant data from the JSON
  const name = characterData.data.name;
  const roleInstruction = characterData.data.description || "";
  if (isPng) {
    Avatar = uploadImage(characterData.data.image);
  }
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
      initialMessages: [{ content: speech, author: "ai", hiddenFrom: [] }],
      avatar: Avatar,
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

  const finalUrl = `http://localhost:8000/#${urlEncodedJson}`;

  return finalUrl;
}

function toggleFloatingWindow() {
  const floatingWindow = document.getElementById("floating-window");
  const isVisible = window.getComputedStyle(floatingWindow).display !== "none";

  if (isVisible) {
    floatingWindow.style.display = "none";
  } else {
    floatingWindow.style.display = "block";
  }
}

updateAddCharacterButtonVisibility(); // Call the function initially

class Png {
  // Parse and extract PNG tEXt chunk
  static #decodeText(data) {
    let naming = true;
    let keyword = "";
    let text = "";

    for (let index = 0; index < data.length; index++) {
      const code = data[index];

      if (naming) {
        if (code) {
          keyword += String.fromCharCode(code);
        } else {
          naming = false;
        }
      } else {
        if (code) {
          text += String.fromCharCode(code);
        } else {
          throw new PngDecodeError(
            "Invalid NULL character found in PNG tEXt chunk"
          );
        }
      }
    }

    return {
      keyword,
      text,
    };
  }

  // Read PNG format chunk
  static #readChunk(data, idx) {
    // Read length field
    const uint8 = new Uint8Array(4);
    const uint32 = new Uint32Array(uint8.buffer);
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];
    const length = uint32[0];

    // Read chunk type field
    const chunkType =
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]) +
      String.fromCharCode(data[idx++]);

    // Read chunk data field
    const chunkData = data.slice(idx, idx + length);
    idx += length;

    // Read CRC field
    uint8[3] = data[idx++];
    uint8[2] = data[idx++];
    uint8[1] = data[idx++];
    uint8[0] = data[idx++];
    const crc = new Int32Array(uint8.buffer)[0];

    // Compare stored CRC to actual
    if (crc !== CRC32.buf(chunkData, CRC32.str(chunkType)))
      throw new PngDecodeError(
        'CRC for "' +
          chunkType +
          '" header is invalid, file is likely corrupted'
      );

    return {
      type: chunkType,
      data: chunkData,
      crc,
    };
  }

  // Read PNG file and extract chunks
  static #readChunks(data) {
    if (
      data[0] !== 0x89 ||
      data[1] !== 0x50 ||
      data[2] !== 0x4e ||
      data[3] !== 0x47 ||
      data[4] !== 0x0d ||
      data[5] !== 0x0a ||
      data[6] !== 0x1a ||
      data[7] !== 0x0a
    )
      throw new PngFormatError("Invalid PNG header");

    const chunks = [];

    let idx = 8; // Skip signature
    while (idx < data.length) {
      const chunk = Png.#readChunk(data, idx);

      if (!chunks.length && chunk.type !== "IHDR")
        throw new PngDecodeError("PNG missing IHDR header");

      chunks.push(chunk);
      idx += 4 + 4 + chunk.data.length + 4; // Skip length, chunk type, chunk data, CRC
    }

    if (chunks.length === 0)
      throw new PngDecodeError("PNG ended prematurely, no chunks");
    if (chunks[chunks.length - 1].type !== "IEND")
      throw new PngDecodeError("PNG ended prematurely, missing IEND header");

    return chunks;
  }

  // Parse PNG file and return decoded UTF8 "chara" base64 tEXt chunk value
  static Parse(arrayBuffer) {
    const chunks = Png.#readChunks(new Uint8Array(arrayBuffer));

    const text = chunks
      .filter((c) => c.type === "tEXt")
      .map((c) => Png.#decodeText(c.data));
    if (text.length < 1)
      throw new PngMissingCharacterError("No PNG text fields found in file");

    const chara = text.find((t) => t.keyword === "chara");
    if (chara === undefined)
      throw new PngMissingCharacterError(
        'No PNG text field named "chara" found in file'
      );

    try {
      return new TextDecoder().decode(
        Uint8Array.from(atob(chara.text), (c) => c.charCodeAt(0))
      );
    } catch (e) {
      throw new PngInvalidCharacterError(
        'Unable to parse "chara" field as base64',
        {
          cause: e,
        }
      );
    }
  }
}

// Function to extract character data from a PNG file
function extractCharacterData(pngFile) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(pngFile);

    fileReader.onload = function () {
      try {
        const characterDataJson = Png.Parse(fileReader.result);
        const characterData = JSON.parse(characterDataJson);
        resolve(characterData);
      } catch (error) {
        reject(error);
      }
    };
  });
}

function toggleNewsPanel() {
  var newsPanel = document.getElementById("news-panel");
  var newsPanelStyle = window.getComputedStyle(newsPanel);
  var newsPanelRight = newsPanelStyle.getPropertyValue("right");
  var optionsPanel = document.getElementById("options-panel");
  var optionsPanelStyle = window.getComputedStyle(optionsPanel);
  var optionsPanelRight = optionsPanelStyle.getPropertyValue("right");

  if (newsPanelRight === "0px") {
    newsPanel.style.right = "-" + newsPanel.offsetWidth + "px";
    newsPanel.classList.remove("slide-in-animation");
    newsPanel.addEventListener(
      "transitionend",
      function () {
        newsPanel.style.display = "none";
      },
      { once: true }
    );

    // Save the panel state in a cookie
    setCookie("newsPanelState", "closed");
  } else {
    if (optionsPanelRight === "0px") {
      optionsPanel.style.right = "-" + optionsPanel.offsetWidth + "px";
      optionsPanel.classList.remove("slide-in-animation");
      optionsPanel.addEventListener(
        "transitionend",
        function () {
          optionsPanel.style.display = "none";
        },
        { once: true }
      );

      // Save the panel state in a cookie
      setCookie("optionsPanelState", "closed");
    }
    newsPanel.style.display = "block";
    newsPanel.style.right = "0px";
    newsPanel.classList.add("slide-in-animation");

    // Save the panel state and the current version in cookies
    setCookie("newsPanelState", "open");
    setCookie(
      "lastVersion",
      document.querySelector(".version").innerText.trim()
    );
  }
}
function toggleOptionsPanel() {
  var optionsPanel = document.getElementById("options-panel");
  var optionsPanelStyle = window.getComputedStyle(optionsPanel);
  var optionsPanelRight = optionsPanelStyle.getPropertyValue("right");
  var newsPanel = document.getElementById("news-panel");
  var newsPanelStyle = window.getComputedStyle(newsPanel);
  var newsPanelRight = newsPanelStyle.getPropertyValue("right");

  if (optionsPanelRight === "0px") {
    optionsPanel.style.right = "-" + optionsPanel.offsetWidth + "px";
    optionsPanel.classList.remove("slide-in-animation");
    optionsPanel.addEventListener(
      "transitionend",
      function () {
        optionsPanel.style.display = "none";
      },
      { once: true }
    );

    // Save the panel state in a cookie
    setCookie("optionsPanelState", "closed");
  } else {
    if (newsPanelRight === "0px") {
      newsPanel.style.right = "-" + newsPanel.offsetWidth + "px";
      newsPanel.classList.remove("slide-in-animation");
      newsPanel.addEventListener(
        "transitionend",
        function () {
          newsPanel.style.display = "none";
        },
        { once: true }
      );
      setCookie("newsPanelState", "closed");
    }
    optionsPanel.style.display = "block";
    optionsPanel.style.right = "0px";
    optionsPanel.classList.add("slide-in-animation");

    // Save the panel state and the current version in cookies
    setCookie("optionsPanelState", "open");
    setCookie(
      "lastVersion",
      document.querySelector(".version").innerText.trim()
    );
  }
}

// Helper function to set a cookie
function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/`;
}

// Helper function to get a cookie value
function getCookie(name) {
  var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function closeAllPanels() {
  var newsPanel = document.getElementById("news-panel");
  var optionsPanel = document.getElementById("options-panel");

  // Close news panel
  newsPanel.style.right = "-" + newsPanel.offsetWidth + "px";
  newsPanel.classList.remove("slide-in-animation");
  newsPanel.addEventListener(
    "transitionend",
    function () {
      newsPanel.style.display = "none";
    },
    { once: true }
  );
  setCookie("newsPanelState", "closed");

  // Close options panel
  optionsPanel.style.right = "-" + optionsPanel.offsetWidth + "px";
  optionsPanel.classList.remove("slide-in-animation");
  optionsPanel.addEventListener(
    "transitionend",
    function () {
      optionsPanel.style.display = "none";
    },
    { once: true }
  );
  setCookie("optionsPanelState", "closed");
}

document.addEventListener("DOMContentLoaded", function () {
  var newsPanel = document.getElementById("news-panel");
  var isPanelOpen = false;
  var optionsPanel = document.getElementById("options-panel");
  var optionsPanelStyle = window.getComputedStyle(optionsPanel);
  var optionsPanelRight = optionsPanelStyle.getPropertyValue("right");
  // Check the saved version and the current version
  var savedVersion = getCookie("lastVersion");
  var currentVersionElement = document.querySelector(".version");
  var currentVersion = currentVersionElement
    ? currentVersionElement.innerText.trim()
    : "";

  if (currentVersion !== savedVersion) {
    // Update the panel state and save the new version
    if (optionsPanelRight === "0px") {
      closeAllPanels();
      optionsPanel.style.right = "-" + optionsPanel.offsetWidth + "px";
      optionsPanel.classList.remove("slide-in-animation");
      optionsPanel.addEventListener(
        "transitionend",
        function () {
          optionsPanel.style.display = "none";
        },
        { once: true }
      );

      // Save the panel state in a cookie
      setCookie("optionsPanelState", "closed");
    }
    newsPanel.style.display = "block";
    newsPanel.style.right = "0px";
    setCookie("newsPanelState", "open");
    setCookie("lastVersion", currentVersion);
  } else if (isPanelOpen) {
    newsPanel.style.display = "block";
    newsPanel.style.right = "0px";
  } else {
    newsPanel.style.right = "-350px";
  }
});
