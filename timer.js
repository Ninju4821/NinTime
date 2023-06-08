let canInspect = true;
let isInspecting = false;
let isHolding = false;
let isTiming = false;
let inspectStart = null;
let holdStart = null;
let timeStart = null;
let timePenalty = 0;
let dnf = false;
let elapsed = 1;
let tableTimes = [39454, 40231, 38422];

function Initialization() {
  console.log("init");
  //Track keydown and keyup
  window.addEventListener("keydown", function(event) {InputDown(event.key)});
  window.addEventListener("keyup", function(event) {InputUp(event.key)});
  //Start the loop
  window.requestAnimationFrame(Loop);
  //Generate the first scramble
  document.getElementById("scramble").innerHTML = GenerateScramble(15);
  let cookieList = getCookie("times");
  if (cookieList != "") {
    let cookieListArray = cookieList.split('-');
    cookieListArray.forEach(string => tableTimes.push(parseInt(string)));
  }
  tableTimes.forEach(time => addToTable(time));
}

function InputDown (theKey) {
  //Only do the following for space down
  if (theKey == " ") {
    console.log("space pressed");
    if (isInspecting && !isHolding) { //If we are not timing or holding, start timing
      console.log("start hold");
      //Make the timer red and start holding
      document.getElementById("timer").style = "text-align:center; font-size:100px; color:red";
      holdStart = new Date();
      isHolding = true;
    } else if (isTiming) { //If we are timing
      console.log("end time");
      //Stop timing and generate a new scramble
      canInspect = false;
      isTiming = false;
      document.getElementById("scramble").innerHTML = GenerateScramble(15);
      timePenalty = 0;
      dnf = false;
      tableTimes.unshift(elapsed);
      addToTable(elapsed);
    }
  }
  if (theKey == "Escape") {
    if (isInspecting) {
      isInspecting = false;
      document.getElementById("timer").innerHTML = "0:00.000";
      timePenalty = 0;
      dnf = false;
    }
  }
}

function InputUp (theKey) {
  //Only do the following for space up
  if (theKey == " ") {
    console.log("space let go");
    if (!isInspecting && canInspect) {
      isInspecting = true;
      inspectStart = new Date();
    }
    if (!canInspect) {
      canInspect = true;
    }
    if (isHolding && new Date() - holdStart >= 500) { //If we have held for 5 seconds
      console.log("held for 0.5 seconds");
      //Start timing
      isInspecting = false;
      isTiming = true;
      start = new Date();
    }
    console.log("stop hold");
    //Reset the timer color and stop holding
    document.getElementById("timer").style = "text-align:center; font-size:100px; color:black";
    isHolding = false;
  }
}

function GenerateScramble (length) {
  let scramble = "";
  let lastAxis = 3;
  let axis = 0;
  let face = 0;
  let dir = 0;
  let turn = "";
  for (let i = 0; i < length; i++) {
    do {
      axis = randRange(0, 2);
    } while (axis == lastAxis)
    face = randRange(0, 1);
    dir = randRange(0, 2);
    switch (axis) {
      case 0:
        turn = face == 0 ? "L" : "R";
        turn += dir < 2 ? (dir == 0 ? " " : "' ") : "2 ";
        break;
      case 1:
        turn = face == 0 ? "D" : "U";
        turn += dir < 2 ? (dir == 0 ? " " : "' ") : "2 ";
        break;
      case 2:
        turn = face == 0 ? "F" : "B";
        turn += dir < 2 ? (dir == 0 ? " " : "' ") : "2 ";
        break;
    }
    scramble += turn; //Add the turn to the scramble
    lastAxis = axis; //Keep track of the last turn
  }
  return scramble;
}

function addToTable (time) {
  //Find the seconds of those milliseconds
  let seconds = Math.floor(time / 1000);
  //Find the milliseconds alone
  let milliseconds = time - seconds * 1000;
  //Find the minutes of those seconds
  let minutes = Math.floor(seconds / 60);
  //Correct the seconds to not include the minutes
  seconds = seconds - minutes * 60;
  //Find the hours of those minutes
  let hours = Math.floor(minutes / 60);
  //Correct the minutes to not include the hours
  minutes = minutes - hours * 60;
  //Convert times to padded strings
  let dispHours = String(hours);
  let dispMinutes = hours == 0 ? String(minutes) : minutes.toString().padStart(2, '0');
  let dispSeconds = seconds.toString().padStart(2, '0');
  let dispMilliseconds = milliseconds.toString().padStart(3, '0');
  document.getElementById("table").innerHTML = "<tr><th>Time</th></tr>" + "<tr><td>" + (hours == 0 ? dispMinutes + ":" + dispSeconds + "." + dispMilliseconds : dispHours + ":" + dispMinutes + ":" + dispSeconds + "." + dispMilliseconds) + "</td></tr>" + document.getElementById("table").innerHTML.slice(24);
  let cookieString = "";
  tableTimes.forEach(time => cookieString += String(time) + "-");
  setCookie("times", cookieString, 9999);
  console.log(tableTimes);
  console.log(getCookie("times"));
}

function Loop () {


  if (isInspecting) {
    let inspectionTime = new Date() - inspectStart;
    if (inspectionTime <= 15000) {
      document.getElementById("timer").innerHTML = Math.floor(inspectionTime / 1000);
    } else if (inspectionTime <= 17000) {
      document.getElementById("timer").innerHTML = String(Math.floor(inspectionTime / 1000)) + " (+2)";
      timePenalty = 2000;
    } else {
      timePenalty = 0;
      document.getElementById("timer").innerHTML = "DNF";
      dnf = true;
    }
  }

  //Make the timer green when ready to start
  if (isHolding && new Date() - holdStart >= 500) {
    document.getElementById("timer").style = "text-align:center; font-size:100px; color:lime";
  }
  
  if (isTiming) {
    //Get the time elapsed in total milliseconds
    elapsed = new Date() - start;
    elapsed += timePenalty;
    //Find the seconds of those milliseconds
    let seconds = Math.floor(elapsed / 1000);
    //Find the milliseconds alone
    let milliseconds = elapsed - seconds * 1000;
    //Find the minutes of those seconds
    let minutes = Math.floor(seconds / 60);
    //Correct the seconds to not include the minutes
    seconds = seconds - minutes * 60;
    //Find the hours of those minutes
    let hours = Math.floor(minutes / 60);
    //Correct the minutes to not include the hours
    minutes = minutes - hours * 60;
    //Convert times to padded strings
    let dispHours = String(hours);
    let dispMinutes = hours == 0 ? String(minutes) : minutes.toString().padStart(2, '0');
    let dispSeconds = seconds.toString().padStart(2, '0');
    let dispMilliseconds = milliseconds.toString().padStart(3, '0');
    document.getElementById("timer").innerHTML = hours == 0 ? dispMinutes + ":" + dispSeconds + "." + dispMilliseconds : dispHours + ":" + dispMinutes + ":" + dispSeconds + "." + dispMilliseconds;
    if (timePenalty != 0) {
      document.getElementById("timer").innerHTML += "+";
    }
    if (dnf) {
      document.getElementById("timer").innerHTML += " (DNF)";
    }
  }
  //Continue to loop
  window.requestAnimationFrame(Loop);
}

function randRange(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function test () {
  document.getElementById("table").innerHTML += "<tr><td>0:00.000</td></tr>";
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}