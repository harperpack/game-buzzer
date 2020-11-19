document.addEventListener(
    "keydown", function(e) {
        console.log(e.keyCode);
        if (e.keyCode == 32) {
            activateBuzzer();
        }
//        } else if (e.keyCode == 13) {
//            submitName();       
//        }
    }
);

function submitName() {
    var newName = document.getElementById('enteredName');
    newName.innerHTML = getInputName();
    console.log(getInputName());
}

//// Get the input field
//var input = document.getElementById("playerName");
//// Execute a function when the user releases a key on the keyboard
//input.addEventListener("keyup", function(event) {
//  // Number 13 is the "Enter" key on the keyboard
//  if (event.keyCode === 13) {
//    var newName = document.getElementById('enteredName');
//    newName.innerHTML = getInputName();
//    // Trigger the button element with a click
//    //document.getElementById("myBtn").click();
//  }
//});

function getInputName() {
    var name = document.querySelector('[contenteditable]').textContent.trim();
    if (name === "" || name.length > 125) {
        var count = Math.floor((Math.random() * 100000) + 1);
        var nameHeader = document.getElementById("playerName");
        name = "Neuthaler #" + count;
        nameHeader.innerText = name;
    }
    return name;
//    var contenteditable = document.querySelector('[contenteditable]'),
//    text = contenteditable.textContent;
//    return document.getElementById('playerName').value;
}

function activateBuzzer() {
    console.log("Buzz");
    var playerBuzz = document.createElement('li'); 
    playerBuzz.innerHTML = getInputName();
    var buzzList = document.getElementById('buzzList');
    buzzList.appendChild(playerBuzz);
}

function resetBuzzer() {
    var buzzList = document.getElementById('buzzList');
    buzzList.innerHTML = '';
}