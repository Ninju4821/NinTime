let canInspect = true; //Can we start inspecting?
let isInspecting = false; //Are we inspecting?
let isHolding = false; //Are we holding during inspection?
let isTiming = false; //Are we timing?
let inspectStart = null; //What time did inspection start?
let holdStart = null; //What time did we start holding?
let timeStart = null; //What time did timing start?
let timePenalty = 0; //What is our current time penalty (in ____)
let dnf = false; //Is this solve a DNF?
let elapsed = 0; //How long has passed since timeStart?
let tableTimes = []; //Lists all saved times
let timeModifiers = []; //Lists the modifiers for all saved times; 0 for none, 1 for +2, 2 for DNF
let averageTimes = []; //Lists the current averages; [session mean, mo3, ao5, ao12]
let bestTimes = [Infinity, Infinity, Infinity, Infinity]; //Lists the best saved times/averages; [single, mo3, ao5, ao12]


//VERSION VAR: Important to set this every update
let version = "4.0.2";


function Initialization() {
  console.log("init");


  //Versioning code
  let lastVersion = getCookie("version");
  if (version != lastVersion) {
    //VERSION CONVERSION CODE: Use for when a major change occurs that will need to be converted between versions.
    console.log("version changed");
  }
  document.getElementById("version").innerHTML = "Version=" + version;
  setCookie("version", version, 9999);


  //Track keydown and keyup
  window.addEventListener("keydown", function(event) {InputDown(event.key)});
  window.addEventListener("keyup", function(event) {InputUp(event.key)});
  //Start the loop
  window.requestAnimationFrame(Loop);
  //Generate the first scramble
  document.getElementById("scramble").innerHTML = GenerateScramble(25);
  //Grab the time lists from the cookies
  let cookieTimeList = getCookie("times");
  let cookieModifierList = getCookie("modifiers");
  let cookieBestList = getCookie("bestTimes");
  //If we have times add them to the lists and set the table
  if (cookieTimeList != "") {
    let cookieTimeListArray = cookieTimeList.split('-');
    cookieTimeListArray.forEach(string => tableTimes.push(parseInt(string)));
    let cookieModifierListArray = cookieModifierList.split('-');
    cookieModifierListArray.forEach(string => timeModifiers.push(parseInt(string)));
    SetTable();
  }
  //If we have best times,  add them to the list
  if (cookieBestList != "") {
    let cookieBestListArray = cookieBestList.split('-');
    for (let i = 0; i < 4; i++) {
      bestTimes[i] = cookieBestListArray[i];
    }
  }
  //Update all the averages and their table
  UpdateAverages();
}

function InputDown (theKey) {
  //Only do the following for space down
  if (theKey == " ") {
    console.log("space pressed");
    if (isInspecting && !isHolding) { //If we're inspecting, and not yet holding, start holding
      console.log("start hold");
      //Make the timer red and start holding
      document.getElementById("timer").style = "text-align:center; font-size:80px; color:red; height:10%;";
      holdStart = new Date();
      isHolding = true;
    } else if (isTiming) { //If we're currently timing
      console.log("end time");
      //Don't let user inspect until the key goes up again
      canInspect = false;
      //Stop timing
      isTiming = false;
      //Generate a new scramble
      document.getElementById("scramble").innerHTML = GenerateScramble(25);
      //Add the time and its modifier to the lists
      tableTimes.unshift(elapsed);
      timeModifiers.unshift(dnf ? 2 : (timePenalty != 0 ? 1 : 0));
      //Set the table
      SetTable();
      //Reset the penalties
      timePenalty = 0;
      dnf = false;
      //Update the averages and bests
      UpdateAverages();
      //Enable the delete button
      document.getElementById("deleteButton").disabled = false;
    }
  }

  //If we press escape whilst inspecting, stop inspecting
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
    //If we aren't inspecting and we are allowed to inspect, start inspecting
    if (!isInspecting && canInspect) {
      isInspecting = true;
      inspectStart = new Date();
    }
    //If we can't inspect, start allowing inspection
    if (!canInspect) {
      canInspect = true;
    }
    //If we have held for 5 seconds
    if (isHolding && new Date() - holdStart >= 500) {
      console.log("held for 0.5 seconds");
      //Stop inspecting, start timing
      isInspecting = false;
      isTiming = true;
      start = new Date();
    }
    //Always stop holding
    console.log("stop hold");
    //Reset the timer color
    document.getElementById("timer").style = "text-align:center; font-size:80px; color:black; height:10%;";
    isHolding = false;
  }
}

//TODO: Generate random face (must be different), then random direction (including 2 moves) to add to the scramble
function GenerateScramble (length) {
  let scramble = ""; //Scramble string
  let lastAxis = 3; //Track the last axis used
  let axis = 0; //Current axis
  let face = 0; //Current face
  let dir = 0; //Current direction
  let turn = ""; //Current turn string
  //Loop for the length of the scramble
  for (let i = 0; i < length; i++) {
    //Get a new axis
    do {
      axis = randRange(0, 2);
    } while (axis == lastAxis)
    //Get a random face
    face = randRange(0, 1);
    //Get a random direction
    dir = randRange(0, 2);
    //Check the axis
      //Check the face
      //Check the direction
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
    //Add the turn to the scramble and keep track of the last turn
    scramble += turn;
    lastAxis = axis;
  }
  return scramble;
}

function SetTable () {
  //Sets the first row to say "Times"
  document.getElementById("timeTable").innerHTML = "<tr><th>Times</th></tr>";
  //For each time (and modifier)
  for (let i = 0; i < tableTimes.length; i++) {
    //Format the time
    const time = formatTime(tableTimes[i]);
    //Select the proper modifier
    const modifier = timeModifiers[i] == 0 ? "" : "+";
    //Modify the time
    let modifiedTime = timeModifiers[i] != 2 ? time + modifier : "DNF";
    //Add the modified time to the table
    document.getElementById("timeTable").innerHTML += "<tr><td>" + modifiedTime + "</td></tr>";
  }
  //Make the cookie strings
  let timeCookieString = "";
  let modifierCookieString = "";
  //For each time, add it to the string. Split by dashes
  tableTimes.forEach(time => timeCookieString += String(time) + "-");
  timeCookieString = timeCookieString.substring(0, timeCookieString.length-1);
  //Set the cookie
  setCookie("times", timeCookieString, 9999);
  //For each modifier, add it to the string. Split by dashes.
  timeModifiers.forEach(modifier => modifierCookieString += String(modifier) + "-");
  modifierCookieString = modifierCookieString.substring(0, modifierCookieString.length-1);
  //Set the cookie
  setCookie("modifiers", modifierCookieString, 9999);
  //Log the times, and cookies
  console.log(tableTimes);
  console.log(getCookie("times"));
  console.log(getCookie("modifiers"));
}

function UpdateAverages () {
  let sessionMean = 0; //Mean of all completed solves
  let mo3 = 0; //Mean of the 3 most recent solves
  let ao5 = 0; //Average of the 5 most recent solves
  let ao12 = 0; //Average of the 12 most recent solves
  let dnfs = [false, false, false]; //Average dnf array; [mo3, ao5, ao12]
  let completeSolves = tableTimes.length; //Number of completed solves
  //If we have times in the table
  if (tableTimes.length != 0) {
    let timeCount = 0; //Number of times used
    //For each time and modifier
    for (let i = 0; i < tableTimes.length; i++) {
      //If it wasn't a dnf, add it to the mean and add one to the time count.
      sessionMean += timeModifiers[i] != 2 ? tableTimes[i] : 0;
      timeCount += timeModifiers[i] != 2 ? 1 : 0;
    }
    //Average it out
    sessionMean /= timeCount;
  }
  //If we have at least 3 times
  if (tableTimes.length >= 3) {
    //For each of the 3 most recent times
    for (let i = 0; i < 3; i++) {
      //Add the time to the mo3
      mo3 += tableTimes[i];
      //If the time was a DNF, then DNF the mo3
      if (timeModifiers[i] == 2) {
        dnfs[0] = true;
      }
    }
    //Average it out
    mo3 /= 3;
  }
  //If we have at least 5 times
  if (tableTimes.length >= 5) {
    //Calculate the average 
    ao5 = calcAvg(tableTimes.slice(0, 5));
    //If the average calculated to -1, DNF the ao5 (used to DNF the ao5 from within the calcAvg function)
    if (ao5 == -1) {
      dnfs[1] = true;
    }
  }
  //If we have at least 12 times
  if (tableTimes.length >= 12) {
    //Calculate the average
    ao12 = calcAvg(tableTimes.slice(0, 12));
    //If the average calculated to -1, DNF the ao12 (used to DNF the ao12 from within the calcAvg function)
    if (ao12 == -1) {
      dnfs[2] = true;
    }
  }
  //Update the best times
  if (tableTimes[0] < bestTimes[0]) {
    bestTimes[0] = tableTimes[0];
  }
  if (mo3 < bestTimes[1] && mo3 != 0 && !dnfs[0]) {
    bestTimes[1] = mo3;
  }
  if (ao5 < bestTimes[2] && ao5 != 0 && !dnfs[1]) {
    bestTimes[2] = ao5;
  }
  if (ao12 < bestTimes[3] && ao12 != 0 && !dnfs[2]) {
    bestTimes[3] = ao12;
  }
  //For each modifier, if its a DNF, subtract one from the complete solves count.
  timeModifiers.forEach(modifier => completeSolves -= modifier == 2 ? 1 : 0);
  //Set the mean on the mean table
  document.getElementById("meanTable").innerHTML = "<tr><th>Session Mean:</th></tr><tr><td>" + formatTime(sessionMean) + " (" + String(completeSolves) + "/" + String(tableTimes.length) + ")" + "</td></tr>";
  //Set the current and bests for the average/session table
  document.getElementById("sessionTable").innerHTML = "<tr><th></th><th>Current:</th><th>Best:</th></tr>"
  + "<tr><th>Single:</th>" 
    + "<td>" + (timeModifiers[0] != 2 ? formatTime(elapsed != 0 ? elapsed : (tableTimes[0] != null ? tableTimes[0] : 0)) : "DNF") + (timeModifiers[0] == 1 ? "+" : "") + "</td>" 
    + "<td>" + formatTime(bestTimes[0]) + "</td>"
  + "</tr>"
  + "<tr>"
    + "<th>mo3:</th>"
    + "<td>" + (!dnfs[0] ? formatTime(mo3) : "DNF") + "</td>"
    + "<td>" + formatTime(bestTimes[1]) + "</td>"
  + "</tr>"
  + "<tr>"
    + "<th>ao5:</th>"
    + "<td>" + (!dnfs[1] ? formatTime(ao5) : "DNF") + "</td>"
    + "<td>" + formatTime(bestTimes[2]) + "</td>"
  + "</tr>"
  + "<tr>"
    + "<th>ao12:</th>"
    + "<td>" + (!dnfs[2] ? formatTime(ao12) : "DNF") + "</td>"
    + "<td>" + formatTime(bestTimes[3]) + "</td>"
  + "</tr>";
  let bestTimesString = ""; //String for the best times cookie
  //For each time, add it to the string. Split by dashes
  bestTimes.forEach(time => bestTimesString += String(time) + "-");
  bestTimesString = bestTimesString.substring(0, bestTimesString.length-1);
  //Set the cookie
  setCookie("bestTimes", bestTimesString, 9999);
}

function Loop () {
  //If we are inspecting
  if (isInspecting) {
    //Set the inspection time
    let inspectionTime = new Date() - inspectStart;
    //If it's been less than 15 seconds
    if (inspectionTime <= 15000) {
      //Set the timer to show the inspection time
      document.getElementById("timer").innerHTML = Math.floor(inspectionTime / 1000);
    } else if (inspectionTime <= 17000) { //If it's between 15 and 17 seconds
      //Set the timer to show inspection time and "(+2)"
      document.getElementById("timer").innerHTML = String(Math.floor(inspectionTime / 1000)) + " (+2)";
      //Make the time penalty 2 seconds
      timePenalty = 2000;
    } else { //If it's been longer than 17 seconds
      //Remove the time penalty
      timePenalty = 0;
      //Set the timer to show "DNF"
      document.getElementById("timer").innerHTML = "DNF";
      //Set the dnf
      dnf = true;
    }
  }

  //Make the timer green when ready to start (held for .5 seconds)
  if (isHolding && new Date() - holdStart >= 500) {
    document.getElementById("timer").style = "text-align:center; font-size:80px; color:lime; height:10%;";
  }
  
  //If we are timing
  if (isTiming) {
    //Get the time elapsed in total milliseconds
    elapsed = new Date() - start;
    //Add the time penalty
    elapsed += timePenalty;
    //Set the timer to show the formatted time
    document.getElementById("timer").innerHTML = formatTime(elapsed);
    if (timePenalty != 0) {
      //If it's a plus 2, add a +
      document.getElementById("timer").innerHTML += "+";
    }
    if (dnf) {
      //If it's a DNF, set it to "DNF"
      document.getElementById("timer").innerHTML += " (DNF)";
    }
  }
  //Continue to loop
  window.requestAnimationFrame(Loop);
}


//Utilities below

function Delete () {
  //Reset all times, modifiers, best times, and current averages
  tableTimes = [];
  bestTimes = [Infinity, Infinity, Infinity, Infinity];
  timeModifiers = [];
  averageTimes = [];
  //Reset all time related cookies
  setCookie("times", "", 9999);
  setCookie("modifiers", "", 9999);
  setCookie("bestTimes", "", 9999);
  //Update the averages (to set the average table)
  UpdateAverages();
  //Set the time table to be empty.
  document.getElementById("timeTable").innerHTML = "<tr><th>Times</th></tr>";
  //Disable the delete button
  document.getElementById("deleteButton").disabled = true;
}

function formatTime (time) {
  //If the time is Infinity, return 0 seconds
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
  //Return the formatted time
  return hours == 0 ? dispMinutes + ":" + dispSeconds + "." + dispMilliseconds : dispHours + ":" + dispMinutes + ":" + dispSeconds + "." + dispMilliseconds;
}

function calcAvg (times) {
  let shortestTime = Infinity; //Shortest time
  let shortestIndex = -1; //Index of the shortest time
  let longestTime = 0; //Longest time
  let longestIndex = -1; //Index of the longest time
  let newTimes = []; //Times after removing the longest and shortest
  let average = 0; //Final average
  let dnfCount = 0; //Number of DNF'd solves
  //Loop through all times (and modifiers)
  for(let i = 0; i < times.length; i++) {
    //If this is the shortest time so far
    if (times[i] < shortestTime) {
      //Track the time and index
      shortestTime = times[i];
      shortestIndex = i;
    }
    //If this is the longest time so far
    if (times[i] > longestTime) {
      //Track the time and index
      longestTime = times[i];
      longestIndex = i;
    }
    //If the solve was a DNF
    if (timeModifiers[i] == 2) {
      //Add 1 to the DNF count
      dnfCount++;
      //This is the longest time possible, no time can be longer
      longestTime = Infinity;
      longestIndex = i;
    }
  }
  //If we have more than 1 DNF, return -1 (used to set DNFs from within CalcAvg function)
  if (dnfCount > 1) {
    return -1;
  }
  //For each time, if it's not the shortest or longest time, add it to the new times array
  for (let i = 0; i < times.length; i++) {
    if (i != shortestIndex && i != longestIndex) {
      newTimes.push(times[i]);
    }
  }
  //For each new time, add it to the average
  newTimes.forEach(time => average += time);
  //Average it out
  average /= newTimes.length;
  //Return this average
  return average;
}

//Generate a random number between two numbers; min and max included
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function setCookie(name, value, exdays) {
  const exdate = new Date(); //Date of expiration
  //Set the time to be now + expiration days
  exdate.setTime(exdate.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString(); //Expiration time
  //Set the cookie with name, value, and expiration date provided
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
  let cname = name + "="; //Add an "=" to the inputted name
  let decodedCookie = decodeURIComponent(document.cookie); //Decoded version of the pages cookies
  let cookieArray = decodedCookie.split(';'); //Split the pages cookies into an array
  //For each cookie
  for (let i = 0; i < cookieArray.length; i++) {
    //Track the current cookie in one variable
    let cookie = cookieArray[i];
    //Loop through the cookie until there are no spaces infront of it
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    //If this cookie is the one we want
    if (cookie.indexOf(cname) == 0) {
      //Return the cookies value
      return cookie.substring(cname.length, c.length);
    }
  }
  //If it wasn't found, return an empty string
  return "";
}
