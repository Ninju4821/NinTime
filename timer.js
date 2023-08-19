let isInit = true;
let canInspect = true;
let isInspecting = false;
let isHolding = false;
let isTiming = false;
let inspectStart = null;
let holdStart = null;
let timeStart = null;
let timePenalty = 0;
let dnf = false;
let elapsed = 0;
let tableTimes = []; //- TODO: Keep track of plus twos in the array (and cookie)
let timeModifiers = []; //0 for none, 1 for +2, 2 for DNF
//[session mean, mo3, ao5, ao12]
let averageTimes = [];
//[single, mo3, ao5, ao12]
let bestTimes = [Infinity, Infinity, Infinity, Infinity];


//VERSION VAR: Important to set this every update
let version = "3.1.0";

function Initialization() {
  console.log("init");
  //Track keydown and keyup
  window.addEventListener("keydown", function(event) {InputDown(event.key)});
  window.addEventListener("keyup", function(event) {InputUp(event.key)});
  //Start the loop
  window.requestAnimationFrame(Loop);
  //Generate the first scramble
  document.getElementById("scramble").innerHTML = GenerateScramble(25);
  let cookieTimeList = getCookie("times");
  let cookieModifierList = getCookie("modifiers");
  let cookieBestList = getCookie("bestTimes");
  if (cookieTimeList != "") {
    let cookieTimeListArray = cookieTimeList.split('-');
    cookieTimeListArray.forEach(string => tableTimes.push(parseInt(string)));
    let cookieModifierListArray = cookieModifierList.split('-');
    cookieModifierListArray.forEach(string => timeModifiers.push(parseInt(string)));
    SetTable();
  }
  if (cookieBestList != "") {
    let cookieBestListArray = cookieBestList.split('-');
    for (let i = 0; i < 4; i++) {
      bestTimes[i] = cookieBestListArray[i];
    }
  }
  UpdateAverages();
  isInit = false;


  let lastVersion = getCookie("version");
  if (version != lastVersion) {
    //VERSION CONVERSION CODE: Use for when a major change occurs that will need to be converted between versions.
  }
  document.getElementById("version").innerHTML = "Version=" + version;
  setCookie("version", version, 9999);
}

function InputDown (theKey) {
  //Only do the following for space down
  if (theKey == " ") {
    console.log("space pressed");
    if (isInspecting && !isHolding) { //If we are not timing or holding, start timing
      console.log("start hold");
      //Make the timer red and start holding
      document.getElementById("timer").style = "text-align:center; font-size:80px; color:red; height:10%;";
      holdStart = new Date();
      isHolding = true;
    } else if (isTiming) { //If we are timing
      console.log("end time");
      //Stop timing and generate a new scramble
      canInspect = false;
      isTiming = false;
      document.getElementById("scramble").innerHTML = GenerateScramble(25);
      tableTimes.unshift(elapsed);
      timeModifiers.unshift(dnf ? 2 : (timePenalty != 0 ? 1 : 0));
      SetTable();
      timePenalty = 0;
      dnf = false;
      UpdateAverages();
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
    document.getElementById("timer").style = "text-align:center; font-size:80px; color:black; height:10%;";
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

function SetTable () {
  document.getElementById("timeTable").innerHTML = "<tr><th>Times</th></tr>";
  for (let i = 0; i < tableTimes.length; i++) {
    const time = formatTime(tableTimes[i]);
    const modifier = timeModifiers[i] == 0 ? "" : "+";
    let modifiedTime = timeModifiers[i] != 2 ? time + modifier : "DNF";
    document.getElementById("timeTable").innerHTML += "<tr><td>" + modifiedTime + "</td></tr>";
  }
  //cookie
  let timeCookieString = "";
  let modifierCookieString = "";
  tableTimes.forEach(time => timeCookieString += String(time) + "-");
  timeCookieString = timeCookieString.substring(0, timeCookieString.length-1);
  setCookie("times", timeCookieString, 9999);
  timeModifiers.forEach(modifier => modifierCookieString += String(modifier) + "-");
  modifierCookieString = modifierCookieString.substring(0, modifierCookieString.length-1);
  setCookie("modifiers", modifierCookieString, 9999);
  console.log(tableTimes);
  console.log(getCookie("times"));
  console.log(getCookie("modifiers"));
}

function UpdateAverages () {
  let sessionMean = 0;
  let mo3 = 0;
  let ao5 = 0;
  let ao12 = 0;
  if (tableTimes.length != 0) {
    tableTimes.forEach(time => sessionMean += time);
    sessionMean /= tableTimes.length;
  }
  if (tableTimes.length >= 3) {
    for (let i = 0; i < 3; i++) {
      mo3 += tableTimes[i];
    }
    mo3 /= 3;
  }
  if (tableTimes.length >= 5) {
    ao5 = calcAvg(tableTimes.slice(0, 5));
  }
  if (tableTimes.length >= 12) {
    ao12 = calcAvg(tableTimes.slice(0, 12));
  }
  if (tableTimes[0] < bestTimes[0]) {
    bestTimes[0] = tableTimes[0];
  }
  if (mo3 < bestTimes[1] && mo3 != 0) {
    bestTimes[1] = mo3;
  }
  if (ao5 < bestTimes[2] && ao5 != 0) {
    bestTimes[2] = ao5;
  }
  if (ao12 < bestTimes[3] && ao12 != 0) {
    bestTimes[3] = ao12;
  }
  document.getElementById("meanTable").innerHTML = "<tr><th>Session Mean:</th></tr><tr><td>" + formatTime(sessionMean) + "</td></tr>";
  document.getElementById("sessionTable").innerHTML = "<tr><th></th><th>Current:</th><th>Best:</th></tr>"
  + "<tr><th>Single:</th>" 
    + "<td>" + formatTime(elapsed != 0 ? elapsed : (tableTimes[0] != null ? tableTimes[0] : 0)) + "</td>" 
    + "<td>" + formatTime(bestTimes[0]) + "</td>"
  + "</tr>"
  + "<tr>"
    + "<th>mo3:</th>"
    + "<td>" + formatTime(mo3) + "</td>"
    + "<td>" + formatTime(bestTimes[1]) + "</td>"
  + "</tr>"
  + "<tr>"
    + "<th>ao5:</th>"
    + "<td>" + formatTime(ao5) + "</td>"
    + "<td>" + formatTime(bestTimes[2]) + "</td>"
  + "</tr>"
  + "<tr>"
    + "<th>ao12:</th>"
    + "<td>" + formatTime(ao12) + "</td>"
    + "<td>" + formatTime(bestTimes[3]) + "</td>"
  + "</tr>";
  let bestTimesString = "";
  bestTimes.forEach(time => bestTimesString += String(time) + "-");
  bestTimesString = bestTimesString.substring(0, bestTimesString.length-1);
  setCookie("bestTimes", bestTimesString, 9999);
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
    document.getElementById("timer").style = "text-align:center; font-size:80px; color:lime; height:10%;";
  }
  
  if (isTiming) {
    //Get the time elapsed in total milliseconds
    elapsed = new Date() - start;
    elapsed += timePenalty;
    document.getElementById("timer").innerHTML = formatTime(elapsed);
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

//Utilities below

function Delete () {
  tableTimes = [];
  bestTimes = [Infinity, Infinity, Infinity, Infinity];
  timeModifiers = [];
  averageTimes = [];
  setCookie("times", "", 9999);
  setCookie("modifiers", "", 9999);
  setCookie("bestTimes", "", 9999);
  UpdateAverages();
  document.getElementById("timeTable").innerHTML = "<tr><th>Times</th></tr>";
  document.getElementById("deleteButton").blur();
}

function formatTime (time) {
  if (time == Infinity) {
    return "0:00.000";
  }
  //Find the seconds of those milliseconds
  let seconds = Math.floor(time / 1000);
  //Find the milliseconds alone
  let milliseconds = time - seconds * 1000;
  //Round the milliseconds to only have three decimal places
  milliseconds = parseInt(String(milliseconds).substring(0, 3));
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
  return hours == 0 ? dispMinutes + ":" + dispSeconds + "." + dispMilliseconds : dispHours + ":" + dispMinutes + ":" + dispSeconds + "." + dispMilliseconds;
}

function calcAvg (times) {
  console.log("times are " + times);
  let shortestTime = Infinity;
  let longestTime = 0;
  let newTimes = [];
  let average = 0;
  for(let i = 0; i < times.length; i++) {
    if (times[i] < shortestTime) {
      shortestTime = times[i];
    }
    if (times[i] > longestTime) {
      longestTime = times[i];
    }
  }
  for (let i = 0; i < times.length; i++) {
    if (times[i] != shortestTime && times[i] != longestTime) {
      newTimes.push(times[i]);
    }
  }
  console.log(newTimes);
  newTimes.forEach(time => average += time);
  average /= newTimes.length;
  return average;
}

function randRange(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
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
