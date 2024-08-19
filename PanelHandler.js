let panelStatus = {};

function setCookie(name, value, daysToExpire) {
  var expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + daysToExpire);
  var expires = "; expires=" + expirationDate.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
  var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

$(document).ready(function () {
  adjustSizes();
  $(document).on("resize", adjustSizes);
  loadPanelStatus();
});

function adjustSizes() {
  $("#newsPanel").height($(window).height() * 0.98);
  $("#optionsPanel").height($(window).height() * 0.98);
}

function loadPanelStatus() {
  panelStatus = JSON.parse(getCookie("panelStatus") || "{}");
  console.log(panelStatus);

  for (var panelId in panelStatus) {
    if (panelStatus[panelId]) {
      openPanel(panelId);
    } else {
      closePanel(panelId);
    }
  }
}

var animationInProgress = {};

async function togglePanel(panelId) {
  if (animationInProgress[panelId]) return; // If an animation is in progress, do nothing

  panelStatus[panelId] = !panelStatus[panelId];
  setCookie("panelStatus", JSON.stringify(panelStatus), 999);
  var $div = $("#" + panelId);
  var width = $div.width();
  var expandedWidth = width;
  var collapsedWidth = 0;

  animationInProgress[panelId] = true; // Set the animation flag

  if (panelStatus[panelId]) {
    // Show the div before starting the animation
    $div.show();

    $div.css("width", collapsedWidth); // Start from collapsed width
    $div.animate(
      {
        width: expandedWidth,
        translateX: 0,
      },
      {
        duration: 500,
        step: function (now, fx) {
          if (fx.prop === "width") {
            $(this).css("width", now + "px");
          }
          if (fx.prop === "translateX") {
            $(this).css("transform", "translateX(" + now + "px)");
          }
        },
        complete: function () {
          animationInProgress[panelId] = false; // Reset the animation flag
          $(this).css("width", ""); // Reset the width to auto
        },
      }
    );
  } else {
    $div.animate(
      {
        width: collapsedWidth,
        translateX: width + 10, // Translate out of view
      },
      {
        duration: 500,
        step: function (now, fx) {
          if (fx.prop === "width") {
            $(this).css("width", now + "px");
          }
          if (fx.prop === "translateX") {
            $(this).css("transform", "translateX(" + now + "px)");
          }
        },
        complete: function () {
          $div.hide();
          $(this).css("width", expandedWidth + "px"); // Reset the width
          animationInProgress[panelId] = false; // Reset the animation flag
        },
      }
    );
  }
}

async function openPanel(panelId) {
  if (animationInProgress[panelId]) return; // If an animation is in progress, do nothing

  panelStatus[panelId] = true;
  setCookie("panelStatus", JSON.stringify(panelStatus), 999);
  var $div = $("#" + panelId);
  var width = $div.width();
  var expandedWidth = width;
  var collapsedWidth = 0;

  animationInProgress[panelId] = true; // Set the animation flag

  // Show the div before starting the animation
  $div.show();

  $div.css("width", collapsedWidth); // Start from collapsed width
  $div.animate(
    {
      width: expandedWidth,
      translateX: 0,
    },
    {
      duration: 500,
      step: function (now, fx) {
        if (fx.prop === "width") {
          $(this).css("width", now + "px");
        }
        if (fx.prop === "translateX") {
          $(this).css("transform", "translateX(" + now + "px)");
        }
      },
      complete: function () {
        animationInProgress[panelId] = false; // Reset the animation flag
        $(this).css("width", ""); // Reset the width to auto
      },
    }
  );
}

async function closePanel(panelId) {
  if (animationInProgress[panelId]) return; // If an animation is in progress, do nothing

  panelStatus[panelId] = false;
  setCookie("panelStatus", JSON.stringify(panelStatus), 999);
  var $div = $("#" + panelId);
  var width = $div.width();
  var collapsedWidth = 0;

  animationInProgress[panelId] = true; // Set the animation flag

  $div.animate(
    {
      width: collapsedWidth,
      translateX: width + 10, // Translate out of view
    },
    {
      duration: 500,
      step: function (now, fx) {
        if (fx.prop === "width") {
          $(this).css("width", now + "px");
        }
        if (fx.prop === "translateX") {
          $(this).css("transform", "translateX(" + now + "px)");
        }
      },
      complete: function () {
        $div.hide();
        $(this).css("width", width + "px"); // Reset the width
        animationInProgress[panelId] = false; // Reset the animation flag
      },
    }
  );
}

function closeAllPanels() {
  for (var panelId in panelStatus) {
    if (panelStatus[panelId]) {
      closePanel(panelId);
    }
  }
}

function showInfo(text, color) {
  Toastify({
    text: text,
    duration: 6000,
    gravity: "top",
    position: "center",
    stopOnFocus: true,
    style: {
      background: color,
    },
  }).showToast();
}

function toggleAddCharacter() {
  showInfo("Add Character", "green");
}
