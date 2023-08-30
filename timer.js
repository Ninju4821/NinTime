let canInspect = true; //Can we start inspecting?
let isInspecting = false; //Are we inspecting?
let inspectStart = null; //What time did inspection start?
let isHolding = false; //Are we holding during inspection?
let holdStart = null; //What time did we start holding?
let isTiming = false; //Are we timing?
let timeStart = null; //What time did timing start?
let elapsed = 0; //How long has passed since timeStart?
let timePenalty = 0; //What is our current time penalty (in milliseconds)
let dnf = false; //Is this solve a DNF?
let solves = []; //Lists all solves
let bestTimes = [Infinity, Infinity, Infinity, Infinity]; //Lists the best saved times/averages; [single, mo3, ao5, ao12]


//VERSION VAR: Important to set this every update
let version = "5.1.0";


function Initialization() {
  console.log("init");


  //Versioning code
  let lastVersion = getCookie("version");
  if (version != lastVersion && lastVersion != "") {
    //VERSION CONVERSION CODE: Use for when a major change occurs that will need to be converted between versions.
    console.log("version changed");
    if (isEarlierVersion(lastVersion)) {
      let cookieTimeList = getCookie("times");
      let cookieModifierList = getCookie("modifiers");
      let cookieTimeListArray = cookieTimeList.split("-");
      let cookieModifierListArray = cookieModifierList.split("-");
      for (let i = 0; i < cookieTimeListArray.length; i++) {
        solves.push(new Solve(cookieTimeListArray[i], cookieModifierListArray[i], "Unknown (pre v5.0.0)"));
      }
      setCookie("times", "", 1);
      setCookie("modifiers", "", 1);
      let solveCookieList = "";
      solves.forEach(solve => {
        solveCookieList += encodeSolveString(solve) + "-"; 
        console.log(encodeSolveString(solve))
      });
    }
  }
  document.getElementById("version").innerHTML = "Version=" + version;
  setCookie("version", version, 9999);


  //Track keydown and keyup
  window.addEventListener("keydown", function(event) {InputDown(event.key)});
  window.addEventListener("keyup", function(event) {InputUp(event.key)});
  //Start the loop
  window.requestAnimationFrame(Loop);
  //Generate the first scramble
  document.getElementById("scramble").innerHTML = GenerateScramble(randRange(15,20));
  //Grab the time lists from the cookies
  //TODO: Encrypt/Decrypt cookies to prevent modification
  let cookieSolveString = getCookie("solves");
  let cookieBestList = getCookie("bestTimes");
  //If we have times add them to the lists and set the table
  if (cookieSolveString != "") {
    let cookieSolveArray = cookieSolveString.split('-');
    cookieSolveArray.forEach(string => solves.push(decodeSolveString(string)));
  }
  //If we have best times,  add them to the list
  if (cookieBestList != "") {
    let cookieBestListArray = cookieBestList.split('-');
    for (let i = 0; i < 4; i++) {
      bestTimes[i] = cookieBestListArray[i];
    }
  }
  SetTable();
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
      solves.unshift(new Solve(elapsed, dnf ? 2 : (timePenalty != 0 ? 1 : 0), document.getElementById("scramble").innerHTML));
      //Generate a new scramble
      document.getElementById("scramble").innerHTML = GenerateScramble(randRange(15,20));
      //Set the table
      SetTable();
      //Reset the penalties
      timePenalty = 0;
      dnf = false;
      //Update the averages and bests
      UpdateAverages();
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

function GenerateScramble (length) {
  let scramble = ""; //Scramble string
  let face = 0; //Current face
  let lastFace = 6;
  let dir = 0; //Current direction
  let turn = ""; //Current turn string
  //Loop for the length of the scramble
  for (let i = 0; i < length; i++) {
    //Get a new axis
    do {
      face = randRange(0, 5);
    } while (face == lastFace)
    //Get a random direction
    dir = randRange(0, 2);
    //Check the face
      //Check the direction
    switch (face) {
      case 0:
        turn = "U";
        break;
      case 1:
        turn = "R";
        break;
      case 2:
        turn = "F";
        break;
      case 3:
        turn = "L";
        break;
      case 4:
        turn = "B";
        break;
      case 5:
        turn = "D";
        break;
    }
    turn += dir != 2 ? (dir == 0 ? " " : "' ") : "2 ";
    //Add the turn to the scramble and keep track of the last turn
    scramble += turn;
    lastFace = face;
  }
  scramble.substring(0, scramble.length-1);
  return scramble;
}

function SetTable () {
  //Sets the first row to say "#|Times|mo3|ao5"
  document.getElementById("timeTable").innerHTML = "<tr><th style=\"width:10%;\">#</th><th>Times</th><th>mo3</th><th>ao5</th></tr>";
  //For each solve
  for (let i = 0; i < solves.length; i++) {
    //Format the time
    const time = formatTime(solves[i].time);
    //Select the proper modifier
    const modifier = solves[i].modifier == 0 ? "" : "+";
    //Modify the time
    let modifiedTime = solves[i].modifier != 2 ? time + modifier : "DNF";
    //Add the modified time to the table
    document.getElementById("timeTable").innerHTML += "<tr>"
      + "<td class=\"timeTableCell\"><button onclick=\"SolveButton(" + String(i) + ")\" class=\"timeButton\">" + String(solves.length - i) + "</button></td>"
      + "<td>" + modifiedTime + "</td>"
      + "<td>" + "<button class=\"mo3Button\" onclick=\"ToggleCopyWindow(" + String(i) + ", 3)\">" + (solves.length - i >= 3 ? formatTime(calcMean(solves.slice(i, i + 2))) : "--") + "</button>" + "</td>"
      + "<td><button onclick=\"ToggleCopyWindow(" + String(i) + ", 5)\" class=\"ao5Button\">" + (solves.length - i >= 5 ? formatTime(calcAvg(solves.slice(i, i + 4))) : "--") + "</button></td>"
    + "</tr>";
  }
  //Make the cookie strings
  let solveCookieString = "";
  //For each solve, add it to the string. Split by dashes
  solves.forEach(solve => solveCookieString += encodeSolveString(solve) + "-");
  solveCookieString = solveCookieString.substring(0, solveCookieString.length-1);
  //Set the cookie
  setCookie("solves", solveCookieString, 9999);
  //Log the solves, and cookie
  console.log(solves);
  console.log("Cookie is " + getCookie("solves"));
  //Enable the delete button
  document.getElementById("deleteButton").disabled = solves != 0 ? false : true;
}

function UpdateAverages () {
  let sessionMean = 0; //Mean of all completed solves
  let mo3 = 0; //Mean of the 3 most recent solves
  let ao5 = 0; //Average of the 5 most recent solves
  let ao12 = 0; //Average of the 12 most recent solves\
  let completeSolves = solves.length; //Number of completed solves
  //If we have solves
  if (solves.length != 0) {
    let timeCount = 0; //Number of times used
    //For each time and modifier
    for (let i = 0; i < solves.length; i++) {
      //If it wasn't a dnf, add it to the mean and add one to the time count.
      sessionMean += solves[i].modifier != 2 ? solves[i].time : 0;
      timeCount += solves[i].modifier != 2 ? 1 : 0;
    }
    //Average it out
    sessionMean /= timeCount;
  }
  //If we have at least 3 solves
  if (solves.length >= 3) {
    mo3 = calcMean(solves.slice(0, 2));
  }
  //If we have at least 5 times
  if (solves.length >= 5) {
    //Calculate the average 
    ao5 = calcAvg(solves.slice(0, 4));
  }
  //If we have at least 12 times
  if (solves.length >= 12) {
    //Calculate the average
    ao12 = calcAvg(solves.slice(0, 12));
  }
  //Update the best times
  if (solves[0] != null) {
    if (solves[0].time < bestTimes[0]) {
      bestTimes[0] = solves[0].time;
    }
  }
  if (mo3 < bestTimes[1] && mo3 > 0) {
    bestTimes[1] = mo3;
  }
  if (ao5 < bestTimes[2] && ao5 > 0) {
    bestTimes[2] = ao5;
  }
  if (ao12 < bestTimes[3] && ao12 > 0) {
    bestTimes[3] = ao12;
  }
  //For each modifier, if its a DNF, subtract one from the complete solves count.
  solves.forEach(solve => completeSolves -= solve.modifier == 2 ? 1 : 0);
  //Set the mean on the mean table
  document.getElementById("meanTable").innerHTML = "<tr><th>Session Mean:</th></tr><tr><td>" + formatTime(sessionMean) + " (" + String(completeSolves) + "/" + String(solves.length) + ")" + "</td></tr>";
  //Set the current and bests for the average/session table
  document.getElementById("sessionTable").innerHTML = "<tr><th></th><th>Current:</th><th>Best:</th></tr>"
  + "<tr><th>Single:</th>" 
    + "<td>" + (solves[0] != null ? (solves[0].modifier != 2 ? formatTime(elapsed != 0 ? elapsed : (solves[0].time != null ? solves[0].time : 0)) : "DNF") + (solves[0].modifier == 1 ? "+" : "") : "0:00.000") + "</td>" 
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

let displayedSolveIndex = 0; //Tracks the displayed solve index across utils

class Solve {
  constructor (time, modifier, scramble) {
    this.time = time;
    this.modifier = modifier;
    this.scramble = scramble;
  }
}

function SolveButton (index) {
  let solve = solves[index];
  let timeDisplayString = "";
  document.getElementById("solveDetails").style.display = "block";
  switch (solve.modifier) {
    case 0:
      timeDisplayString = formatTime(solve.time);
      break;
    case 1:
      timeDisplayString = formatTime(solve.time) + "+";
      break;
    case 2:
      timeDisplayString = "DNF (" + formatTime(solve.time) + ")";
      break;
  }
  document.getElementById("detailsTime").innerHTML = timeDisplayString;
  document.getElementById("detailsScramble").innerHTML = solve.scramble;
  displayedSolveIndex = index;
}

function CloseSolveDetails () {
  document.getElementById("solveDetails").style.display = "none";
}

function ToggleCopyWindow (solveIndex = displayedSolveIndex, numberOfSolves = 1) {
  let currentDisplay = document.getElementById("copyWindow").style.display;
  currentDisplay = currentDisplay != "" ? currentDisplay : "none";
  document.getElementById("copyWindow").style.display = currentDisplay == "none" ? "block" : "none";
  switch (numberOfSolves) {
    case 1:
      document.getElementById("copyDetails").innerHTML = "Single: " + formatTime(solves[solveIndex].time);
      break;
    case 3:
      if (solves.length >= 3) {
        document.getElementById("copyDetails").innerHTML = "mo3: " + formatTime(calcMean(solves.slice(solveIndex, solveIndex + 2)));
      } else {
        document.getElementById("copyWindow").style.display = "none";
      }
      break;
    case 5:
      if (solves.length >= 5) {
        document.getElementById("copyDetails").innerHTML = "ao5: " + formatTime(calcMean(solves.slice(solveIndex, solveIndex + 4)));
      } else {
        document.getElementById("copyWindow").style.display = "none";
      }
      break;
  }
  document.getElementById("copyDetails").innerHTML += "<br><br>Time List:<br>";
  let timeListTimes = [];
  for (let i = 0; i < numberOfSolves; i++) {
    //TODO: If it's an ao5, include parenthesis around the best and worst solve to show their removal
    timeListTimes.push(String(numberOfSolves - i) + ") " + formatSolve(solves[solveIndex + i]) + "&nbsp;&nbsp;&nbsp;" + solves[solveIndex + i].scramble + "<br>");
  }
  timeListTimes.forEach(string => document.getElementById("copyDetails").innerHTML += string);
}

function RemodifySolve (newModifier) {
  solves[displayedSolveIndex].time += newModifier == 1 ? (solves[displayedSolveIndex].modifier != 1 ? 2000 : 0) : (solves[displayedSolveIndex].modifier == 1 ? -2000 : 0);
  solves[displayedSolveIndex].modifier = newModifier;
  SetTable();
  UpdateAverages();
  SolveButton (displayedSolveIndex);
}

function Delete (startingIndex, numberToDelete) {
  //Delete the times within the range provided
  solves.splice(startingIndex, numberToDelete);
  //Resets the best times to ensure that we don't leave a deleted time
  bestTimes = [Infinity, Infinity, Infinity, Infinity];
  //Reset all time related cookies
  setCookie("solves", "", 9999);
  setCookie("bestTimes", "", 9999);
  //Set both tables (also sets the cookies)
  SetTable();
  UpdateAverages();
  //Close the solve details if they were open
  CloseSolveDetails();
  //Disable the delete button if solves is empty now.
  document.getElementById("deleteButton").disabled = solves.length == 0 ? true : false;
}

function formatTime (time) {
  //If the time is Infinity, return 0 seconds
  if (time == Infinity) {
    return "0:00.000";
  }
  if (time == -1) {
    return "DNF";
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

function formatSolve (solve, space = false) {
  let formattedTime = formatTime(solve.time);
  return solve.modifier != 2 ? (formattedTime + (solve.modifier == 0 ? "" : "+") + (space ? " " : "")) : "DNF (" + formattedTime + ")";
}

function encodeSolveString (solve) {
  return "(" + String(solve.time) + "," + String(solve.modifier) + "," + solve.scramble + ")";
}

function decodeSolveString (solveString) { //Solve string format (pre-encryption) : (time,modifier,scramble)
  //Remove the parenthesis from the string
  let pureSolveString = solveString.substring(1, solveString.length-1);
  //Split the string to seperate the values
  let pureSolveArray = pureSolveString.split(",");
  return new Solve(parseInt(pureSolveArray[0]), parseInt(pureSolveArray[1]), pureSolveArray[2]);
}

function isEarlierVersion (inputVersion) {
  //Split both versions
  let versionPartsArray = version.split(".");
  let inputVersionPartsArray = inputVersion.split(".");
  //Track both groups of ints
  let versionPartsInts = [];
  let inputVersionPartsInts = [];
  //Add the ints from the strings
  versionPartsArray.forEach(part => versionPartsInts.push(parseInt(part)));
  inputVersionPartsArray.forEach(part => inputVersionPartsInts.push(parseInt(part)));
  //Go through checking if the version is earlier from greatest to least dominance
  if (inputVersionPartsInts[0] < versionPartsInts[0]) {
    return true;
  } else if (inputVersionPartsInts[1] < versionPartsInts[1]) {
    return true;
  } else if (inputVersionPartsInts[2] < versionPartsInts[2]) {
    return true;
  }
  return false;
}

function calcMean (meanSolves) {
  let mean = 0;
  let dnf = false;
  meanSolves.forEach(solve => {
    if (solve.modifier == 2) {
      dnf = true;
    }
    mean += solve.time;
  });
  mean /= meanSolves.length;
  return !dnf ? mean : -1;
}

function calcAvg (avgSolves) {
  let shortestTime = Infinity; //Shortest time
  let shortestIndex = -1; //Index of the shortest time
  let longestTime = 0; //Longest time
  let longestIndex = -1; //Index of the longest time
  let avgTimes = []; //Times after removing the longest and shortest
  let average = 0; //Final average
  let dnfCount = 0; //Number of DNF'd solves
  //Loop through all times (and modifiers)
  for(let i = 0; i < avgSolves.length; i++) {
    //If this is the shortest time so far
    if (avgSolves[i].time < shortestTime) {
      //Track the time and index
      shortestTime = avgSolves[i].time;
      shortestIndex = i;
    }
    //If this is the longest time so far
    if (avgSolves[i].time > longestTime) {
      //Track the time and index
      longestTime = avgSolves[i].time;
      longestIndex = i;
    }
    //If the solve was a DNF
    if (avgSolves[i].modifier == 2) {
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
  for (let i = 0; i < avgSolves.length; i++) {
    if (i != shortestIndex && i != longestIndex) {
      avgTimes.push(avgSolves[i].time);
    }
  }
  //For each new time, add it to the average
  avgTimes.forEach(time => average += time);
  //Average it out
  average /= avgTimes.length;
  //Return this average
  return average;
}

//Generate a random number between two numbers; min and max included
function randRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}


//Source: https://www.w3schools.com/js/js_cookies.asp
function setCookie(name, value, exdays) {
  const exdate = new Date(); //Date of expiration
  //Set the time to be now + expiration days
  exdate.setTime(exdate.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ exdate.toUTCString(); //Expiration time
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
      return cookie.substring(cname.length, cookie.length);
    }
  }
  //If it wasn't found, return an empty string
  return "";
}
