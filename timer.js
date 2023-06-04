let isTiming = false;
let isHolding = false;
let holdStart = null;
let start = new Date();
let elapsed = 1;

function Initialization() {
  console.log("init");
  window.addEventListener("keydown", function(event) {InputDown(event.key)});
  window.addEventListener("keyup", function(event) {InputUp(event.key)});
  window.requestAnimationFrame(Loop);
  document.getElementById("scramble").innerHTML = GenerateScramble(15);
}

function InputDown (the_Key) {
  if (the_Key == " ") {
    console.log("space pressed");
    if (!isTiming && !isHolding) {
      console.log("start hold");
      document.getElementById("timer").style = "text-align:center; font-size:100px; color:red";
      holdStart = new Date();
      isHolding = true;
    } else if (isTiming) {
      console.log("end time");
      isTiming = false;
      document.getElementById("scramble").innerHTML = GenerateScramble(15);
    }
  }
}

function InputUp (the_Key) {
  if (the_Key == " ") {
    console.log("space let go");
    if (isHolding && new Date() - holdStart >= 300) {
      console.log("held for 0.3 seconds");
      isTiming = true;
      start = new Date();
    }
    console.log("stop hold");
    document.getElementById("timer").style = "text-align:center; font-size:100px; color:black";
    isHolding = false;
  }
}

function GenerateScramble (length) {
  let scramble = "";
  const turns = ["U ", "U' ", "R ", "R' ", "B ", "B' ", "L ", "L' ", "F ", "F' ", "D ", "D' ", "U2 ", "R2 ", "B2 ", "L2 ", "F2 ", "D2 "];
  let lastTurn = null;
  let turnNum = 0;
  for (let i = 0; i < length; i++) {
    turnNum = randRange(0, 11);
    /*if (turnNum == lastTurn) {
      switch (turnNum) {
        case 0 || 1:
          turnNum = 12;
          break;
        case 2 || 3:
          turnNum = 13;
          break;
        case 4 || 5:
          turnNum = 14;
          break;
        case 6 || 7:
          turnNum = 15;
          break;
        case 8 || 9:
          turnNum = 16;
          break;
        case 10 || 11:
          turnNum = 17;
          break;
        default:
          let firstNum = turnNum;
          do {
            turnNum = randRange(0, 11);
          } while (turnNum == firstNum)
      }
    } */
    if ((turnNum == (lastTurn % 2 == 0) ? lastTurn + 1 : lastTurn - 1) && lastTurn < 12 && turnNum < 12) {
      let firstNum = turnNum;
      do {
        turnNum = randRange(0, 11);
      } while (turnNum == firstNum || turnNum == lastTurn)
    }
    scramble += turns[turnNum];
    lastTurn = turnNum;
  }
  return scramble;
}

function Loop () {

  if (isHolding && new Date() - holdStart >= 300) {
    document.getElementById("timer").style = "text-align:center; font-size:100px; color:green";
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
  window.requestAnimationFrame(Loop);
}

function randRange(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}
