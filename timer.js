let isTiming = false;
let elapsed = 1;

function setMyKeyDownListener() {
  window.addEventListener("keydown", function(event) {MyFunction(event.key)})
}

function MyFunction (the_Key) {
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

while (isTiming) {
  elapsed = new Date() - start;
  document.getElementById("timer").innerHTML = elapsed;
}
