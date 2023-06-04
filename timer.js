let isTiming = false;
let start = new Date();
let elapsed = 1;

function Initialization() {
  window.addEventListener("keydown", function(event) {Input(event.key)});
  window.requestAnimationFrame(TimerLoop);
}

function Input (the_Key) {
  if (the_Key == " ") {
    console.log("Space Pressed");
    if (isTiming) {
      isTiming = false;
    } else if (!isTiming) {
      isTiming = true;
      start = new Date();
    }
  }
}

function TimerLoop () {
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
    let hours = 0;
    //Convert times to padded strings
    let dispMinutes = hours == 0 ? String(minutes) : minutes.toString().padStart(2, '0');
    let dispSeconds = seconds.toString().padStart(2, '0');
    let dispMilliseconds = milliseconds.toString().padStart(3, '0');
    document.getElementById("timer").innerHTML = dispMinutes + ":" + dispSeconds + "." + dispMilliseconds;
  }
  window.requestAnimationFrame(TimerLoop);
}
