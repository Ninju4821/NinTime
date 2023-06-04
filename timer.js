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
    elapsed = new Date() - start;
    let seconds = Math.floor(elapsed / 1000);
    document.getElementById("timer").innerHTML = seconds + ":" + elapsed - seconds;
  }
  window.requestAnimationFrame(TimerLoop);
}
