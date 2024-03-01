// Get elements
// UI elements
let homeUI = document.getElementById("homeUI");
let sessionUI = document.getElementById("sessionUI");
let scoreboardUI = document.getElementById("scoreboardUI")
// Session UI
let diceAmountInput = document.getElementById("diceAmountInput");
let diceAmountButton = document.getElementById("diceAmountButton");
let matchDurationInput = document.getElementById("matchDurationInput");
let startButton = document.getElementById("startButton");
let classicButton = document.getElementById("classicButton");
let customButton = document.getElementById("customButton");
// Match UI
let startTab = document.getElementById("startTab");
let matchTab = document.getElementById("matchTab");
let correctTab = document.getElementById("correctTab");
let finishButton = document.getElementById("finishButton");
let nextButton = document.getElementById("nextButton");
let roundAmountInput = document.getElementById("roundAmountInput");

// Define element classes and ids
let diceDisplayClass = "diceDisplay border border-primary rounded text-center";
let dropDiceClass = "dropDice border border-primary rounded text-center";
let diceDisplayId = "diceDisplay";
let diceDropFieldId = "diceDropField";
let alreadyUsedDisplayClass = ["bg-primary", "text-white"];
let dropFieldSelectedClass = "dropFieldSelected";
let playerRowId = "playerRow";
let playerMatchElementId = "playerMatchElement";
let disableableElements = "disableableUiElement";
let undraggableElements = "undraggableUiElement";
let blurableElementsClass = "blurableElement";

// Set eventlisteners
document.getElementById("menuButton").onclick = returnToMenu;
nextButton.onclick = prepareNextRound;
document.getElementById("exitButton").onclick = exitGame;
finishButton.onclick = timeIsUp;
document.getElementById("deleteElementButton").onclick = deleteElements;
startButton.onclick = startButtonClicked;
diceAmountButton.onclick = diceAmountButtonClicked;
document.getElementById("addPlayerButton").onclick = addPlayer;
document.getElementById("removePlayerButton").onclick = removePlayer;

classicButton.addEventListener("click", function() {
  setupRules(0);
});
customButton.addEventListener("click", function() {
  setupRules(1);
});
document.getElementById("moveUpButton").addEventListener("click", function() {
  moveButton(DEFAULT_MOVE_STEPS * (-1), 1);
});
document.getElementById("moveDownButton").addEventListener("click", function() {
  moveButton(DEFAULT_MOVE_STEPS, 1);
});
document.getElementById("moveLeftButton").addEventListener("click", function() {
  moveButton(DEFAULT_MOVE_STEPS * (-1), 0);
});
document.getElementById("moveRightButton").addEventListener("click", function() {
  moveButton(DEFAULT_MOVE_STEPS, 0);
});

// Define functions for eventlisteners
function diceAmountButtonClicked() {
  if (setNames() == false) { return; }
  initializeSession();
}
function startButtonClicked() {
  initializeMatch();
}

// Define variables
let DEFAULT_DICE_AMOUNT = 13;
let DEFAULT_MATCH_DURATION = 30;
let DEFAULT_ROUND_AMOUNT = 3;
let DICE_AMOUNT = 13;
let MATCH_DURATION_SEC = 10;
let ROUND_AMOUNT = 3;
let BOARD_SIZE = 10;
let DICE_DEFAULT_VALUE = "?";
let DROP_FIELD_DEFAULT_VALUE = "...";
let DEFAULT_MOVE_STEPS = 1;
let MAX_AMOUNT_PLAYERS = playerNames.length;

let currentDices = [];
let currentPlayers = [];
let randomColorOrder = [];

let currentTurn = 0;
let currentRound = 1;
let interval;
let removingFalseLetters = false;

// Initialize session
function initializeSession() {
  currentRound = 1;
  currentTurn = 0;
  removingFalseLetters = false;
  ROUND_AMOUNT = document.getElementById("roundAmountInput").value;
  // If no player exists or no round is wished no need to start
  if (currentPlayers.length <= 0 || ROUND_AMOUNT <= 0 || DICE_AMOUNT <= 0 || MATCH_DURATION_SEC <= 0) { return; }
  MATCH_DURATION_SEC = document.getElementById("matchDurationInput").value;
  DICE_AMOUNT = document.getElementById("diceAmountInput").value;
  // Set current round
  document.getElementById("currentRoundDisplay").textContent = currentRound + " / " + ROUND_AMOUNT;
  // Add player profiles to ui
  addPlayersToUI();
  // Change UI
  switchUI(1);
  // Show correct nav tab element in match
  showNavTab(0); // Show Shuffle
  // Create dice display
  createDiceDisplays();
  // Create drop fields
  createDropFields()
  // Change applied in drop field
  changeAppliedinDropField();
  // Show current turn
  showCurrentTurn();
  // Set everything disabled before starting the game
  disableMatchUI(true);
}

// Creates dice displays and inserts in HTML
function createDiceDisplays() {
  // Contains html code for elements
  let displayString = "";
  // Create an element for each dice
  for (let i = 0; i < DICE_AMOUNT; i++) {
    displayString += createDisplayElement(i);
  }
  // Append string to container
  document.getElementById("diceDisplayContainer").innerHTML = displayString;
}

// Return html code for single dice display
function createDisplayElement(index) {
  return "<div id=\"" + diceDisplayId + "" + index + "\" class=\"" + diceDisplayClass + " " + undraggableElements + " " + blurableElementsClass + "\" draggable=\"true\" ondragstart=\"drag(event)\">" + DICE_DEFAULT_VALUE + "</div>";
}

// Initialize Match
function initializeMatch() {
  // Allow interaction
  removingFalseLetters = false;
  // Set current round
  document.getElementById("currentRoundDisplay").textContent = currentRound + " / " + ROUND_AMOUNT;
  document.getElementById("currentTurnContainer").classList.add("d-none");
  resetDisplayFields();
  resetDropFields();
  // Change applied in drop field
  changeAppliedinDropField();
  showNavTab(1)
  // Shuffle current dices
  shuffleCurrentDices();
  // Clean the dropfields
  resetDropFields();
  // Show dices in display
  displayCurrentDices();
  // Start timer
  prepareTimer();
  // Enable UI elements
  disableMatchUI(false);
}

// Display current turn in session
function showCurrentTurn() {
  document.getElementById("currentTurnContainer").innerHTML = "<div class=\"container w-auto rounded bg-" + colors[currentPlayers[currentTurn].color] + " text-white stackChild\">" + 
  "<div class=\"row justify-content-center\"><div class=\"col-auto\">Current turn</div></div>" +
  "<div class=\"row justify-content-center\"><div class=\"col-auto h4\">" + currentPlayers[currentTurn].name + "</div></div>" +
  "</div>"
}

// Deletes selected elements
function deleteElements() {
  let elems = getSelectedDrops();
  // Leave if no elements need to be deleted
  if (elems.length <= 0) { return; }
  // Delete all elements
  for (let i = 0; i < elems.length; i++) {
    // Delete specific element
    dropFieldRightClicked(undefined, elems[i].getAttribute("posY"), elems[i].getAttribute("posX"))
  }
}

// Reset all drop field in container
function resetDropFields() {
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      resetDropField(y, x);
    }
  }
}

// Reset a single drop field
function resetDropField(y, x) {
  let dropElem = document.getElementById(diceDropFieldId + "Y" + y + "X" + x);
  dropElem.innerHTML = DROP_FIELD_DEFAULT_VALUE;
  dropElem.setAttribute("caughtDiceIndex", -1);
  dropElem.setAttribute("dropFieldSelected", "false");
  dropElem.classList.remove(...alreadyUsedDisplayClass);
}

// Reset all display fields
function resetDisplayFields() {
  for (let i = 0; i < DICE_AMOUNT; i++) {
    resetDisplayField(i);
  }
}

// Reset a single display field
function resetDisplayField(i) {
  let disElem = document.getElementById(diceDisplayId + i);
  disElem.classList.remove(...alreadyUsedDisplayClass);
}

// Shuffle all dices
function shuffleCurrentDices() {
  // Reset dices
  currentDices = [];
  // Iterate through all dices
  for (let i = 0; i < DICE_AMOUNT; i++) {
    // Get random value
    currentDices.push(dices[i%dices.length][getRandomInt(0, dices[i%dices.length].length - 1)]);
  }
}

// Inserts dice values in it's displays
function displayCurrentDices() {
  // Insert values for all dices
  for (let i = 0; i < DICE_AMOUNT; i++) {
    // Insert value in specific dice
    displayCurrentDice(i, currentDices[i]);
  }
}

// Insert value in specific dice 
function displayCurrentDice(index, value) {
  // Change value of element
  document.getElementById(diceDisplayId + "" + index).innerHTML = "<div class=\container w-100\">" + 
  "<div class=\"row justify-content-center\"><div class=\"col-auto letterFontSize\">" + value + "</div></div>" + 
  "<div class=\"row justify-content-center\"><div class=\"col-auto valueFontSize\">" + values["" + value] + "</div></div>" + 
  "</div>"
}

// Create fields to drop dices in
function createDropFields() {
  // String contains html code for all rows
  let rowsString = "";
  // Creates all dropfields
  for (let y = 0; y < BOARD_SIZE; y++) {
    // Create a single row of drop fields
    rowsString += createDropFieldRow(y);
  }
  // Append rows to container
  document.getElementById("diceDropContainer").innerHTML = rowsString;
}

// Create a single row of drop fields
function createDropFieldRow(y) {
  // String contains html code for a single row
  let rowString = "<tr>";
  for (let x = 0; x < BOARD_SIZE; x++) {
    // Create single drop field
    rowString += createDropField(y, x);
  }
  // Add end of row
  rowString += "</tr>";
  return rowString;
}

// Return html code for single drop field row
function createDropField(y, x) {
  return "<td><div id=\"" + diceDropFieldId + "Y" + y + "X" + x + "\" class=\"" + dropDiceClass + " " + disableableElements + " " + undraggableElements + " " + blurableElementsClass + "\" dropFieldSelected=\"false\" posY=\"" + y + "\" posX=\"" + x + "\" caughtDiceIndex=\"-1\" ondrop=\"drop(event)\" ondragover=\"allowDrop(event)\" ondragstart=\"drag(event)\" onclick=\"dropFieldLeftClicked(" + y + ", " + x + ")\" oncontextmenu=\"dropFieldRightClicked(event, " + y + ", " + x + ")\">" + DROP_FIELD_DEFAULT_VALUE + "</div></td>";
}

// Prepares timer
function prepareTimer() {
  let barElem = document.getElementById("timerBar");
  initializeProgressBar(barElem, MATCH_DURATION_SEC);
  startTimer(barElem, MATCH_DURATION_SEC);
}

// Prepare progress bar by setting values
function initializeProgressBar(barElem, maxSeconds) {
  barElem.ariaValueMax = maxSeconds;
  barElem.ariaValueMin = "0";
  barElem.ariaValueNow = "" + maxSeconds;
  barElem.innerHTML = maxSeconds + "s";
  barElem.style.width = "100%";
}

// Starts timer for a single match
function startTimer(barElem, maxSeconds) {
  let start = Date.now();
  interval = setInterval(function() {
      let delta = Date.now() - start; // milliseconds elapsed since start
      // Calculate remaining seconds
      let secondsLeft = MATCH_DURATION_SEC - (Math.floor(delta / 1000));
      updateProgressBar(barElem, secondsLeft, maxSeconds);
      handleColorProgressBar(barElem, secondsLeft);
      // Check if time is up
      if (secondsLeft == 0) {
        timeIsUp(interval, barElem, maxSeconds);
      }
  }, 1000);
}

// Update colors of progress bar
function handleColorProgressBar(elem, secondsLeft) {
  if (secondsLeft > 10) {
    // default color
    elem.classList.add("bg-primary");
    elem.classList.remove("bg-warning");
    elem.classList.remove("bg-danger");
  } else if (secondsLeft > 3) {
    // yellow color
    elem.classList.add("bg-warning");
    elem.classList.remove("bg-primary");
    elem.classList.remove("bg-danger");
  } else {
    // red color
    elem.classList.add("bg-danger");
    elem.classList.remove("bg-warning");
    elem.classList.remove("bg-primary");
  }
}

// Update value of progress bar
function updateProgressBar(barElem, secondsLeft, maxSeconds) {
  barElem.ariaValueNow = "" + secondsLeft;
  barElem.textContent = secondsLeft + "s";
  barElem.style.width = getPercentage(secondsLeft, maxSeconds) + "%";
}

// Calculate percentage of a specific value
function getPercentage(value, maxValue) {
  return ((value * 100) / maxValue)
}

// Interaction buttons
function moveButton(steps, direction) {
  // If correction no movement is allowed
  if (removingFalseLetters == true) { return; }
  // Get selected elements
  let elems = getSelectedDrops();
  // No need to move elements if none are selected
  if (elems.length <= 0) { return; }
  // Check if elements are allowed to be moved sideways
  if (direction == 0) {
    if (!checkDropsMoveHoriz(elems, BOARD_SIZE, steps)) {
      return;
    }
    // Move elements sideways
    moveDropsHorizNow(elems, steps);
  } else {
    // Check if elements are allowed to be moved vertically
    if (!checkDropsMoveVert(elems, BOARD_SIZE, steps)) {
      return;
    }
    // Move elements vertical
    moveDropsVertNow(elems, steps);
  }
  // Deselect older elements
  deselectDropFields(elems);
  // Get new elements
  elems = getNewElements(elems, direction, steps);
  // Select new elements
  selectDropFields(elems);
  // Change applied in drop field
  changeAppliedinDropField();
}

// Get new elements after moving
function getNewElements(oldElems, direction, steps) {
  let elems = [];
  // Iterate all old elements
  for (let i = 0; i < oldElems.length; i++) {
    // Get new elements
    if (direction == 0) {
      elems.push(document.getElementById(diceDropFieldId + "Y" + oldElems[i].getAttribute("posY") + "X" + (parseInt(oldElems[i].getAttribute("posX")) + steps)));
    } else {
      elems.push(document.getElementById(diceDropFieldId + "Y" + (parseInt(oldElems[i].getAttribute("posY")) + steps) + "X" + oldElems[i].getAttribute("posX")));
    }
  }
  return elems;
}

// Selects given drop fields
function selectDropFields(elems) {
  for (let i = 0; i < elems.length; i++) {
    selectDropField(elems[i]);
  }
}

// Deselects given drop fields
function deselectDropFields(elems) {
  for (let i = 0; i < elems.length; i++) {
    deselectDropField(elems[i]);
  }
}

// Move all submitted elements sideways
function moveDropsHorizNow(elems, steps) {
  // Iterate drop fields to the side
  for (let i = 0; i < elems.length; i++ ) {
    let targetElem = document.getElementById(diceDropFieldId + "Y" + elems[i].getAttribute("posY") + "X" + (parseInt(elems[i].getAttribute("posX")) + steps));
    dropFromDropField(elems[i], targetElem);
  }
}

// Move all submitted elements vertically
function moveDropsVertNow(elems, steps) {
  // Iterate drop fields vertically
  for (let i = 0; i < elems.length; i++ ) {
    let targetElem = document.getElementById(diceDropFieldId + "Y" + (parseInt(elems[i].getAttribute("posY")) + steps) + "X" + elems[i].getAttribute("posX"));
    dropFromDropField(elems[i], targetElem);
  }
}

// Get all selected drop fields
function getSelectedDrops() {
  let elems = [];
  // Iterate through all drop fields
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      // Get current element
      let elem = document.getElementById(diceDropFieldId + "Y" + y + "X" + x);
      // Add element to array if selected
      if (elem.getAttribute("dropFieldSelected") == "true") {
        elems.push(elem)
      }
    }
  }
  return elems;
}

// Check if borders would be exceeded
function checkDropsMoveHoriz(elems, dimX, steps) {
  let posX = 0;
  // Iterate through all selected elements
  for (let i = 0; i < elems.length; i++) {
    posX = parseInt(elems[i].getAttribute("posX"));
    // If movement to right
    if (steps >= 0) {
      // dimX starts with 1 -> >= would exceed right border
      if (posX + steps >= dimX) { return false; }
    } else {
      // Check exceeding of left border
      if (posX + steps < 0) { return false; }
    }
  }
  // No exceeding found
  return true;
}

// Check if borders would be exceeded
function checkDropsMoveVert(elems, dimY, steps) {
  let posY = 0;
  // Iterate through all selected elements
  for (let i = 0; i < elems.length; i++) {
    posY = parseInt(elems[i].getAttribute("posY"));
    // If movement to bottom
    if (steps >= 0) {
      // dimX starts with 1 -> >= would exceed lower border
      if (posY + steps >= dimY) { return false; }
    } else {
      // Check exceeding of upper border
      if (posY + steps < 0) { return false; }
    }
  }
  // No exceeding found
  return true;
}

// Makes element (in)visible
function makeVisible(element, toVisible) {
  if (toVisible) { element.classList.remove("invisible") }
  else { element.classList.add("invisible")}
}

// Return number between min and max (both inclusive)
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Enable drag
function allowDrop(ev) {
  ev.preventDefault();
}

// Proccess drag event
function drag(ev) {
  ev.dataTransfer.setData("elementId", ev.target.id);
}

// Submit data from dragged element
function drop(ev) {
  // Avoid opening link
  ev.preventDefault();
  // Get value stored
  var data = ev.dataTransfer.getData("elementId");
  // Store variables
  let senderElem = document.getElementById(data);
  let targetElem = ev.target;
  handleDrop(senderElem, targetElem)
}

// Check where drop is from
function handleDrop(senderElem, targetElem) {
  // If correcting false letters is set dont allow access
  if (removingFalseLetters == true) { return; }
  // Distinguish if senderElement is from display (top row) or is another drop field
  if (senderElem.id.startsWith(diceDisplayId)) {
    dropFromDisplayField(senderElem, targetElem);
  } else {
    dropFromDropField(senderElem, targetElem);
  }
  // Change applied in drop field
  changeAppliedinDropField();
}

// Set behaviour for drop from display elements
function dropFromDisplayField(senderElem, targetElem) {
  // Transfer letter to new field
  targetElem.innerHTML = senderElem.innerHTML;
  // Sender element is from display
  // Insert dice value into drop field and mark sender as used
  targetElem.setAttribute("caughtDiceIndex", senderElem.id.replace(diceDisplayId, ""));
  senderElem.classList.add(...alreadyUsedDisplayClass); 
  // Mark new field as set
  targetElem.classList.add(...alreadyUsedDisplayClass);
  // Make elements (un)draggable
  senderElem.draggable = false;
  targetElem.draggable = true;
}

// Set behaviour for drop from drop field elements
function dropFromDropField(senderElem, targetElem) {
  // Distinguish if new field is already set
  if (targetElem.textContent != DROP_FIELD_DEFAULT_VALUE) {
    switchDropField(senderElem, targetElem);
  } else {
    setNewDropField(senderElem, targetElem);
  }
}

// Set value in drop field
function setNewDropField(senderElem, targetElem) {
  // Get all selected elements
  let selectedElems = getSelectedDrops();
  // Move all selected elements
  if (selectedElems.length <= 1) {
    setSingleNewDropField(senderElem, targetElem);
  } else {
    setMultipleNewDropField(senderElem, targetElem, selectedElems);
  }
}

// Set all selected drop fields
function setMultipleNewDropField(senderElem, targetElem, selectedElems) {
  // Get all attributes to faciliate process
  let senderX = parseInt(senderElem.getAttribute("posX"));
  let senderY = parseInt(senderElem.getAttribute("posY"));
  let targetX = parseInt(targetElem.getAttribute("posX"));
  let targetY = parseInt(targetElem.getAttribute("posY"));
  // Check how many steps are done in each direction
  let dX = parseInt(targetX - senderX);
  let dY = parseInt(targetY - senderY);
  // Move every element
  let newElems = [];
  for (let i = 0; i < selectedElems.length; i++) {
    // Get new element by applying difference in x and y
    let currentX = parseInt(selectedElems[i].getAttribute("posX"));
    let currentY = parseInt(selectedElems[i].getAttribute("posY"));
    let newID = diceDropFieldId + "Y" + parseInt(currentY + dY) + 
    "X" + parseInt(currentX + dX);
    let newElem = document.getElementById(newID);
    // Check if all element does not exist
    if (newElem == undefined) { return; }
    // Add existing element to array
    newElems.push(newElem);
  }
  for (let i = 0; i < newElems.length; i++) {
    setSingleNewDropField(selectedElems[i], newElems[i]);
  }
}

// Set a single drop field value
function setSingleNewDropField(senderElem, targetElem) {
  // Transfer letter to new field
  targetElem.innerHTML = senderElem.innerHTML;
  // Distinguish if new field is already set
  // Sender element is another drop element
  // Set attributes
  targetElem.setAttribute("caughtDiceIndex", senderElem.getAttribute("caughtDiceIndex"));
  senderElem.setAttribute("caughtDiceIndex", -1);
  if (isDropFieldSelected(senderElem)) {
    selectDropField(targetElem)
  }
  deselectDropField(senderElem);
  // Reset sender element to default
  senderElem.innerHTML = DROP_FIELD_DEFAULT_VALUE ;
  // Remove mark as set on sender element
  senderElem.classList.remove(...alreadyUsedDisplayClass);
  // Mark new field as set
  targetElem.classList.add(...alreadyUsedDisplayClass);
  // Make elements (un)draggable
  senderElem.draggable = false;
  targetElem.draggable = true;
}

// The target element is already set
function switchDropField(senderElem, targetElem) {
  // Cancel if multiple elements are selected 
  if (getSelectedDrops().length > 1) { return; }
  // Switch values of Elements
  let senderValue = senderElem.innerHTML;
  senderElem.innerHTML = targetElem.innerHTML;
  targetElem.innerHTML = senderValue;
  // Switch attributes
  senderValue = senderElem.getAttribute("caughtDiceIndex");
  senderElem.setAttribute("caughtDiceIndex", targetElem.getAttribute("caughtDiceIndex"));
  targetElem.setAttribute("caughtDiceIndex", senderValue);
}

// Remove element on right click
function dropFieldRightClicked(event, y, x) {
  // Prevent opening of context menu
  if (event != undefined) { event.preventDefault(); }
  // Get selected element
  let dropElem = document.querySelector("[posY='" + y + "'][posX='" + x + "']");
  // No need to remove if not set
  if (dropElem.textContent == DROP_FIELD_DEFAULT_VALUE) { return; }
  // Reset value of dropField to default
  dropElem.textContent = DROP_FIELD_DEFAULT_VALUE;
  // Make dropElem undraggable
  dropElem.draggable = false;
  // Remove mark as set on dropField
  dropElem.classList.remove(...alreadyUsedDisplayClass)
  // Make dice field draggable
  let disElem = document.getElementById(diceDisplayId + "" + dropElem.getAttribute("caughtDiceIndex"));
  // Reset attribute to default
  dropElem.setAttribute("caughtDiceIndex", -1);
  // Make display element (top row) usable again
  if (disElem != undefined) {
    disElem.draggable = true;
    disElem.classList.remove(...alreadyUsedDisplayClass);
  }
  // Change applied inside drop field
  changeAppliedinDropField();
}

// Select a filled drop field
function dropFieldLeftClicked(y, x) {
  // Get the element
  let dropElem = document.querySelector("[posY='" + y + "'][posX='" + x + "']");
  // No need to select an unset field
  if (dropElem.textContent == DROP_FIELD_DEFAULT_VALUE) { return; }
  // Check if element is already set
  if (dropElem.getAttribute("dropFieldSelected") == "false") {
    // Select deselected element
    selectDropField(dropElem);
  } else {
    // Deselect selected element
    deselectDropField(dropElem);
  }
}

// Selects drop field
function selectDropField(elem) {
  // Mark element as selected
  elem.classList.add(dropFieldSelectedClass);
  elem.setAttribute("dropFieldSelected", "true");
}

// Check if drop field is selected
function isDropFieldSelected(elem) {
  return (elem.getAttribute("dropFieldSelected") == "true");
}

// Deselects drop field
function deselectDropField(elem) {
  // Remove mark of element
  elem.classList.remove(dropFieldSelectedClass);
  elem.setAttribute("dropFieldSelected", "false");
}

// Triggered after time is up
function timeIsUp() {
  // Activate removing false set letters 
  removingFalseLetters = true;
  // Set bar element
  let barElem = document.getElementById("timerBar");
  barElem.ariaValueNow = "" + 0;
  barElem.style.width = getPercentage(0, 100) + "%";
  // Turn bar primary color
  handleColorProgressBar(barElem, 99);
  // Cancels interval
  clearInterval(interval);
  // Show next button
  showNavTab(2);
}

// Add a player to game
function addPlayer() {
  // Not more than max players allowed
  if (currentPlayers.length >= MAX_AMOUNT_PLAYERS) { return; }
  // Create a new player object
  let id = getLowestPlayerIdAvailable();
  let name = getRandomPlayerNameAvailable();
  let currentScore = 0;
  let totalScore = 0;
  let color = getRandomColorAvailable();
  currentPlayers.push(createPlayerObject(id, name, currentScore, totalScore, color)); 
  // Create HTML Code for a player
  let elem = document.createElement("div");
  elem.innerHTML = createPlayerRowHtml(currentPlayers.length, name, id, color)
  document.getElementById("playerListContainer").appendChild(elem);
  // Update player count on the bottom of the list
  updatePlayerCount();
}

// Return lowest id available
function getLowestPlayerIdAvailable() {
  // Initialize with lowest id possible
  let allIds = [];
  for (let i = 0; i < MAX_AMOUNT_PLAYERS; i++) {
    allIds.push(i);
  }
  // Get all used ids
  let usedIds = [];
  for (let i = 0; i < currentPlayers.length; i++) {
    // Get id of current player if it is smaller
    usedIds.push(currentPlayers[i].id);
  }
  usedIds.sort();
  // Remove all used ids
  for (let i = 0; i < currentPlayers.length; i++) {
    let foundIndex = allIds.indexOf(currentPlayers[i].id);
    if (foundIndex >= 0) {
      allIds.splice(foundIndex, 1); 
    }
  }
  allIds.sort();
  return allIds[0];
}

// Return random name that is not used already
function getRandomPlayerNameAvailable() {
  // Copy values of array containing all names
  let allNames = [...playerNames];
  // Remove all used names
  for (let i = 0; i < currentPlayers.length; i++) {
    let foundIndex = allNames.indexOf(currentPlayers[i].name);
    if (foundIndex >= 0) { 
      allNames.splice(foundIndex, 1)
    }
  }
  // Return random name left
  return allNames[getRandomInt(0, allNames.length - 1)];
}

// Return random color that is (if possible) not already used
function getRandomColorAvailable() {
  // If no player exists create new order of colors
  if (currentPlayers.length <= 0) {
    // set random color order
    setRandomColorOrder();
  }
  let currentColor = randomColorOrder[currentPlayers.length % randomColorOrder.length]
  return colors.indexOf(currentColor);
}

// Set random color order for users
function setRandomColorOrder() {
  // Reset color order
  randomColorOrder = [];
  // Copy color array
  let allColors = [...colors];
  // Set random order
  while (allColors.length > 0) {
    randomColor = getRandomInt(0, allColors.length - 1);
    randomColorOrder.push(allColors[randomColor]);
    allColors.splice(randomColor, 1);
  }
}

// Return HTML code for a player in menu UI
function createPlayerRowHtml(index, name, id, color) {
  return "<div class=\"row p-1 m-1 border border-" + colors[color] + " rounded text-white bg-" + colors[color] + "\" id=\"" + playerRowId + "" + id + "\">" +
  "<div class=\"col-auto\">Player " + index + ": </div>" +
  "<div class=\"col\">" +
  "<div class=\"input-group\">" +
  "<input maxlength=\"7\" oninput=\"updateNamePlayer(" + id +")\" id=\"playerNameInput" + id + "\" type=\"text\" aria-label=\"Edit Name\" aria-describedby=\"basic-addon22\" class=\"py-0 px-1 form-control bg-" + colors[color] + " text-white\" value=\"" + name + "\">" +
  "<span class=\"input-group-text py-0\" id=\"basic-addon22\">" +
  "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-pencil-square text-" + colors[color] + "\" viewBox=\"0 0 16 16\">" +
  "<path d=\"M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z\"/>" +
  "<path fill-rule=\"evenodd\" d=\"M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z\"/>"+
  "</svg>" +
  "</span>" +
  "</div>" +
  "</div>" +
  "</div>";
}

// Update the edited name of a player
function updateNamePlayer(id) {
  currentPlayers[id].name = document.getElementById("playerNameInput" + id).value;
}

// Create player object
function createPlayerObject(id, name, currentScore, totalScore, color) {
  let player = {
    id: id,
    name: name, 
    currentScore: currentScore,
    totalScore: totalScore, 
    color: color
  };
  return player;
}

// Remove last player from the game
function removePlayer() {
  // No need to delete if no player exists
  if (currentPlayers.length <= 0) { return; }
  // Get last player
  let lastPlayer = currentPlayers[currentPlayers.length - 1];
  // Delete HTML dode
  document.getElementById(playerRowId + "" + lastPlayer.id).remove();
  // Remove player from array
  for (let i = 0; i < currentPlayers.length; i++) {
    if (currentPlayers[i].id == lastPlayer.id) {
      currentPlayers.splice(i, 1);
    }
  }
  // Update player count
  updatePlayerCount();
}

// Update amount of current players
function updatePlayerCount() {
  // Get titles
  let elem = document.getElementById("playersAmountTitle");
  // Add amount of players to title
  let amount = currentPlayers.length;
  elem.textContent = amount == 1 ? "1 Player" : amount + " Players"
}

// Adds all players to UI in match
function addPlayersToUI() {
  let profilesString = "";
  for (let i = currentTurn; i < currentPlayers.length; i++) {
    profilesString += addProfileElement(i);
  }
  for (let i = 0; i < currentTurn; i++) {
    profilesString += addProfileElement(i);
  }
  document.getElementById("playerMatchContainer").innerHTML = profilesString;
}

// Return HTML code for a player during match
function addProfileElement(index) {
  // Marking current turn on player
  if (index == currentTurn) {
    return "<div class=\"row mb-3 border border-black rounded\">" +
    "<div class=\"row justify-content-center\">" +
    "<div class=\"col-auto\">Current turn</div>" +
    "</div>" +
    "<div class=\"row px-0 mx-0\" id=\"" + playerMatchElementId + "" + index + "\">" +
    "<div class=\"container\">" +
    "<div class=\"row p-1\">" +
    "<div class=\"col-auto bg-" + colors[currentPlayers[index].color] + " border border-" + colors[currentPlayers[index].color] + " rounded-circle\"></div>" +
    "<div class=\"col\">" + currentPlayers[index].name + "</div>" +
    "<div class=\"col-auto text-end\">" + currentPlayers[index].totalScore + "</div>" +
    "</div>" +
    "</div>" +
    "</div>" + 
    "</div>"
  } else {
    return "<div class=\"row p-1 mb-2 border border-black rounded\">" +
    "<div class=\"row p-0 m-0 justify-content-around\" id=\"" + playerMatchElementId + "" + index + "\">" +
    "<div class=\"col-auto bg-" + colors[currentPlayers[index].color] + " border border-" + colors[currentPlayers[index].color] + " rounded-circle\"></div>" +
    "<div class=\"col\">" + currentPlayers[index].name + "</div>" +
    "<div class=\"col-auto text-end\">" + currentPlayers[index].totalScore + "</div>" +
    "</div>" + 
    "</div>"
  }
}

// Sets values for next round
function prepareNextRound() {
  // Disable interaction
  disableMatchUI(true);
  // Insert value to player 
  currentPlayers[currentTurn].totalScore += countValues()
  // Increase current turn
  currentTurn = (currentTurn + 1) % currentPlayers.length;
  // Check if a round is finished
  if (currentTurn == 0) {
    // A new round has started
    currentRound++;
  }
  // Check if all rounds are finished
  if (currentRound > ROUND_AMOUNT) {
    roundsFinished();
    return;
  }
  resetDisplayFields();
  resetDropFields();
  // Change applied in drop field
  changeAppliedinDropField();
  // Refresh player list
  addPlayersToUI();
  // Show current turn
  showCurrentTurn();
  document.getElementById("currentTurnContainer").classList.remove("d-none");
  // Start new match
  showNavTab(0);
}

// Triggered if a session is finished
function roundsFinished() {
  resetDisplayFields();
  resetDropFields();
  // Change applied in drop field
  changeAppliedinDropField();
  switchUI(2);
  // Build scoreboard
  buildScoreboard();
}

// Build the scoreboard
function buildScoreboard() {
  // Sort player array
  let scores = [...currentPlayers];
  scores.sort((a, b) => parseInt(b.totalScore) - parseInt(a.totalScore));
  let html = "";
  for (let i = 1; i <= currentPlayers.length; i++) {
    if(i == 1) { html += getScoreboardHTMLFirst(i-1); }
    else if (i <= 3) { html += getScoreboardHTMLSecondThird(i-1, i); }
    else { html += getScoreboardHTMLRest(i-1, i) }
  }
  document.getElementById("scoreboardContainer").innerHTML = html;
}

// Finish game
function exitGame() {
  timeIsUp();
  returnToMenu();
}

// Return to home menu
function returnToMenu() {
  switchUI(0);
}

// Switches active UI
function switchUI(uiIndex) {
  if (uiIndex == 0) {
    // Show homeUI
    homeUI.classList.remove("d-none");
    sessionUI.classList.add("d-none");
    scoreboardUI.classList.add("d-none");
  } else if (uiIndex == 1) {
    // Show sessionUI
    homeUI.classList.add("d-none");
    sessionUI.classList.remove("d-none");
    scoreboardUI.classList.add("d-none");
  } else {
    // Show scoreboardUI
    homeUI.classList.add("d-none");
    sessionUI.classList.add("d-none");
    scoreboardUI.classList.remove("d-none");
  }
}

// Disable elements to prevent interaction
function disableMatchUI(disable) {
  // Dis-/enable button elements
  let uiElems = document.getElementsByClassName(disableableElements);
  for (let i = 0; i < uiElems.length; i++) {
    uiElems[i].disabled = disable;
  }
  // Blur drop elements
  uiElems = document.getElementsByClassName(blurableElementsClass);
  for (let i = 0; i < uiElems.length; i++) {
    disable ? uiElems[i].classList.add("blur") : uiElems[i].classList.remove("blur")
  }
  // Dis-/enable dragging of elements
  uiElems = document.getElementsByClassName(undraggableElements);
  for (let i = 0; i < uiElems.length; i++) {
    uiElems[i].draggable = !disable;
  }
  // Hide/Show shuffle button
  disable ? startButton.classList.remove("d-none") : startButton.classList.add("d-none")
}

// Setup rules (0 = classic | 1 = custom)
function setupRules(mode) {
  if (mode == 0) {
    // Make classic label active
    classicButton.classList.add("active");
    customButton.classList.remove("active");
    // Set default values and make uneditable
    diceAmountInput.disabled = true;
    diceAmountInput.value = DEFAULT_DICE_AMOUNT;
    matchDurationInput.disabled = true;
    matchDurationInput.value = DEFAULT_MATCH_DURATION;
    roundAmountInput.disabled = true;
    roundAmountInput.value = DEFAULT_ROUND_AMOUNT;
  } else {
    // Make classic label active
    customButton.classList.add("active");
    classicButton.classList.remove("active");
    // Make values editable
    diceAmountInput.disabled = false;
    matchDurationInput.disabled = false;
    roundAmountInput.disabled = false;
  }

}

// Counts values of all set elements together
function countValues() {
  // Store total value
  let totalValue = 0;
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      // Get values of all dices just once
      // Math.Max because -1 returned if not selected -> add nothing
      let currentValue = getValueOfDropElement(y, x);
      totalValue += Math.max(0, currentValue);
      // Check if element is connected to at least two set fields
      if (currentValue > 0 && isCrossingDropElement(y, x)) {
        totalValue += Math.max(0, getValueOfDropElement(y, x));
      }
    }
  }
  return totalValue;
}

// Return -1 if not set otherwise return value of set dice
function getValueOfDropElement(y, x) {
  // Get dropped display element value
  let caughtDice = document.getElementById(diceDropFieldId + "Y" + y + "X" + x).getAttribute("caughtDiceIndex");
  // No value is stored
  if (caughtDice == -1) { return -1; }
  // Return value of dropped display element
  return document.getElementById(diceDisplayId + caughtDice).textContent.substring(1);
}

// Check if set element is connected to at least two other set element in distinct direction (horiz/vert)
function isCrossingDropElement(y, x) {
  let horiz = false;
  let vert = false;
  let elem;
  // Check upper
  elem = document.getElementById(diceDropFieldId + "Y" + parseInt(y + 1) + "X" + x);
  if (elem != undefined && elem.getAttribute("caughtDiceIndex") != -1) { vert = true; }
  // Check lower
  elem = document.getElementById(diceDropFieldId + "Y" + parseInt(y - 1) + "X" + x);
  if (elem != undefined && elem.getAttribute("caughtDiceIndex") != -1) { vert = true; }
  // Check right
  elem = document.getElementById(diceDropFieldId + "Y" + y + "X" + parseInt(x + 1));
  if (elem != undefined && elem.getAttribute("caughtDiceIndex") != -1) { horiz = true; }
  // Check left
  elem = document.getElementById(diceDropFieldId + "Y" + y + "X" + parseInt(x - 1));
  if (elem != undefined && elem.getAttribute("caughtDiceIndex") != -1) { horiz = true; }  
  return (horiz && vert)
}

// Show specific step in match
function showNavTab(showIndex) {
  if (showIndex == 0) {
    // Activate nav tab
    startTab.classList.add("active");
    matchTab.classList.remove("active");
    correctTab.classList.remove("active");
    // Show shuffle
    document.getElementById(startButton.id + "Container").classList.remove("d-none");
    // Hide finish and next
    document.getElementById(finishButton.id + "Container").classList.add("d-none");
    document.getElementById(nextButton.id + "Container").classList.add("d-none");
  }
  if (showIndex == 1) {
    // Activate nav tab
    startTab.classList.remove("active");
    matchTab.classList.add("active");
    correctTab.classList.remove("active");
    // Show finish
    document.getElementById(finishButton.id + "Container").classList.remove("d-none");
    // Hide shuffle and next
    document.getElementById(startButton.id + "Container").classList.add("d-none");
    document.getElementById(nextButton.id + "Container").classList.add("d-none");
  }
  if (showIndex == 2) {
    // Activate nav tab
    startTab.classList.remove("active");
    matchTab.classList.remove("active");
    correctTab.classList.add("active");
    // Show next
    document.getElementById(nextButton.id + "Container").classList.remove("d-none");
    // Hide shuffle and finish
    document.getElementById(startButton.id + "Container").classList.add("d-none");
    document.getElementById(finishButton.id + "Container").classList.add("d-none");
  }
}

// Return HTML code for winner
function getScoreboardHTMLFirst(index) {
  return "<div class=\"row mt-2 p-2 border border-" + colors[currentPlayers[index].color] + " bg-" + colors[currentPlayers[index].color] + " rounded\">" +
  "<div class=\"col-auto p-0 pt-1 bg-white border border-" + colors[currentPlayers[index].color] + " rounded-circle scoreboardCircleTop text-center\">" +
  "<div class=\"center-scoreboard-number text-danger\">1</div>" +
  "</div>" +
  "<div class=\"col pt-1 text-white\">" + currentPlayers[index].name + "</div>" +
  "<div class=\"col-auto text-end pt-1 text-white\">" + currentPlayers[index].totalScore + "</div>" +
  "</div>";
} 

// Return HTML code for second and third place
function getScoreboardHTMLSecondThird(index, rank) {
  return "<div class=\"row mt-2 p-2 border border-" + colors[currentPlayers[index].color] + " rounded\">" +
  "<div class=\"col-auto p-0 pt-1 bg-" + colors[currentPlayers[index].color] + " border border-" + colors[currentPlayers[index].color] + " rounded-circle scoreboardCircleTop text-center\">" +
  "<div class=\"center-scoreboard-number text-white\">" + rank + "</div>" +
  "</div>" +
  "<div class=\"col pt-1\">" + currentPlayers[index].name + "</div>" +
  "<div class=\"col-auto text-end pt-1\">" + currentPlayers[index].totalScore + "</div>" +
  "</div>";
}

// Return HTML code for all the rest
function getScoreboardHTMLRest(index, rank) {
  return "<div class=\"row p-2\">" +
  "<div class=\"col-auto p-0 bg-" + colors[currentPlayers[index].color] + " border border-" + colors[currentPlayers[index].color] + " rounded-circle scoreboardCircleLow text-center\">" +
  "<div class=\"center-scoreboard-number text-white\">" + rank + "</div>" +
  "</div>" +
  "<div class=\"col\">" + currentPlayers[index].name + "</div>" +
  "<div class=\"col-auto text-end\">" + currentPlayers[index].totalScore + "</div>" + 
  "</div>";
}

// Trigger if a change happened inside the drop field
function changeAppliedinDropField() {
  // update current score 
  updateCurrentScore();
}

// Refresh current score
function updateCurrentScore() {
  document.getElementById("currentScore").textContent = countValues();
}

// Sets names for all players according to belonging input field
function setNames() {
  for (let i = 0; i < currentPlayers.length; i++) {
    let name = document.getElementById("playerNameInput" + i).value;
    if (name.length <= 0) { return false; }
    currentPlayers[i].name = name;
  }
  return true;
}