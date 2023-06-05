let isTiming = false;
let isHolding = false;
let holdStart = null;
let start = new Date();
let elapsed = 1;

function Initialization() {
  console.log("init");
  //Track keydown and keyup
  window.addEventListener("keydown", function(event) {InputDown(event.key)});
  window.addEventListener("keyup", function(event) {InputUp(event.key)});
  //Start the loop
  window.requestAnimationFrame(Loop);
  //Generate the first scramble
  document.getElementById("scramble").innerHTML = GenerateScramble(15);
}

function InputDown (theKey) {
  //Only do the following for space down
  if (theKey == " ") {
    console.log("space pressed");
    if (!isTiming && !isHolding) { //If we are not timing or holding, start timing
      console.log("start hold");
      //Make the timer red and start holding
      document.getElementById("timer").style = "text-align:center; font-size:100px; color:red";
      holdStart = new Date();
      isHolding = true;
    } else if (isTiming) { //If we are timing
      console.log("end time");
      //Stop timing and generate a new scramble
      isTiming = false;
      document.getElementById("scramble").innerHTML = GenerateScramble(15);
    }
  }
}

function InputUp (the_Key) {
    //Only do the following for space up
  if (the_Key == " ") {
    console.log("space let go");
    if (isHolding && new Date() - holdStart >= 500) { //If we have held for 5 seconds
      console.log("held for 0.5 seconds");
      //Start timing
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
  //Every possible turn
  const turns = ["U ", "U' ", "R ", "R' ", "B ", "B' ", "L ", "L' ", "F ", "F' ", "D ", "D' ", "U2 ", "R2 ", "B2 ", "L2 ", "F2 ", "D2 ", "N "];
  let lastTurn = 18; //Allows generation to work on the first cycle
  let turnNum = 0;
  for (let i = 0; i < length; i++) {
    do {
      turnNum = randRange(0, 17);
    } while (turns[turnNum].charAt(0) == turns[lastTurn].charAt(0)) //Generate again if the same face is turning again
    scramble += turns[turnNum]; //Add the turn to the scramble
    lastTurn = turnNum; //Keep track of the last turn
  }
  return scramble;
}

function Loop () {

  //Make the timer green when ready to start
  if (isHolding && new Date() - holdStart >= 500) {
    document.getElementById("timer").style = "text-align:center; font-size:100px; color:lime";
  }
  
  if (isTiming) {
    //Get the time elapsed in total milliseconds
    elapsed = new Date() - start;
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
  }
  //Continue to loop
  window.requestAnimationFrame(Loop);
}

function randRange(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
