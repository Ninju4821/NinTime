let isTiming = false;
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
      let start = new Date();
    }
  }
}

function TimerLoop () {
  if (isTiming) {
    elapsed = new Date() - start;
    document.getElementById("timer").innerHTML = elapsed;
  }
  window.requestAnimationFrame(TimerLoop);
}
