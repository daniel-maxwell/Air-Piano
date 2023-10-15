let video;
let threshold = 200;
let thresholdSlider;
let button;
let prevImg;
let currImg;
let diffImg;
let grid;
let imgNum;
let currentScale = "major"; // Default scale
let concurrentNoteCount = 0; // Keeps track of number of notes currently playing
const MAX_CONCURRENT_SOUNDS = 3; // Maximum number of notes that can play at once
let currentNote = null; // Keeps track of the most recently played note
let noteCooldown = false; // Whether or not a note can be played
const cooldownDuration = 200; // 1 second cooldown, adjust as needed
let controlsPanel; // Div container for controls
var sel; // Scale selector dropdown
var scalesLabel; // Label for scale selector dropdown
var thresholdLabel; // Label for threshold slider
let volumeLabel; // Label for volume slider
let volumeSlider; // Volume slider
let authorLabel; // Label for author

let pianoKeys = {}; // Object to store all piano keys
const scales = {    // Object to store scales
    major: ["C", "D", "E", "F", "G", "A", "B"],
    minor: ["Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm"],
};

// Variables to store reaction images
let quaverImg,
    twoQuaverImg,
    twoQuaverFlippedImg,
    awesomeImg,
    starImg,
    star2Img,
    wowImg,
    heartImg,
    sunglassImg,
    partyImg;

function preload() {
    for (let type in scales) {  // Load all piano key sounds
        for (let note of scales[type]) {
            pianoKeys[note] = loadSound(`assets/audio/${note}.mp3`);
        }
    }
    // Load all reaction images
    quaverImg = loadImage("assets/images/Quaver.png");
    twoQuaverImg = loadImage("assets/images/TwoQuaver.png");
    twoQuaverFlippedImg = loadImage("assets/images/TwoQuaverFlipped.png");
    awesomeImg = loadImage("assets/images/Awesome.png");
    starImg = loadImage("assets/images/Star.png");
    star2Img = loadImage("assets/images/Star2.png");
    wowImg = loadImage("assets/images/Wow.png");
    heartImg = loadImage("assets/images/Heart.png");
    sunglassImg = loadImage("assets/images/Sunglass.png");
    partyImg = loadImage("assets/images/Party.png");
}

function setup() {
    cnv = createCanvas(480 * 2, 480);
    cnv.parent('canvas-container');
    cnv.style('box-shadow', '0px 0px 10px rgba(0, 0, 0, 0.5)');
    cnv.style('border-bottom-right-radius', '25px');
    cnv.style('border-top-right-radius', '25px');
    
    pixelDensity(1);
    video = createCapture(VIDEO);
    video.hide();
    noStroke();

    // Create a div container for the controls
    controlsPanel = createDiv('');
    controlsPanel.parent('main-container');
    controlsPanel.position('static');
    controlsPanel.style('left', '62.4%');
    controlsPanel.style('top', '16.2%');
    controlsPanel.size(300, 440); // Width of 200px and same height as canvas
    controlsPanel.style('background-color', '#333');
    controlsPanel.style('padding', '20px');
    controlsPanel.style('border-bottom-right-radius', '25px');
    controlsPanel.style('border-top-right-radius', '25px');
    controlsPanel.style('color', '#FFF');
    controlsPanel.style('font-family', 'Arial, sans-serif');

    // Label and Slider for volume
    volumeLabel = createElement("label", "Volume:");
    volumeSlider = createSlider(0, 1, 0.5, 0.01); // Ranges from 0 (muted) to 1 (full volume), with a default at 0.5 and a step of 0.01
    volumeLabel.parent(controlsPanel);
    volumeSlider.parent(controlsPanel);

    // Label and Slider for threshold
    thresholdLabel = createElement("label", "Threshold:");
    thresholdSlider = createSlider(0, 255, 200);
    thresholdLabel.parent(controlsPanel);
    thresholdSlider.parent(controlsPanel);
    
    // Label and dropdown menu for scale selector
    scalesLabel = createElement("label", "Choose a Scale:");
    sel = createSelect();
    sel.option("Major", "major");
    sel.option("Minor", "minor");
    sel.selected("major");
    sel.changed(() => {
        currentScale = sel.value();
    });
    scalesLabel.parent(controlsPanel);
    sel.parent(controlsPanel);

    // Label for author
    authorLabel = createElement("label", "Made with ❤ by Daniel White");
    authorLabel.parent(controlsPanel);

    styleControls(); // Call function to style the controls
    positionCanvas();
    grid = new Grid(640, 480); // Create a new grid
}

function draw() {
    background(31, 40, 53);
    
    // Draw the video flipped on the x axis for intuitive piano playing
    push();
    translate(video.width, 0);
    scale(-1, 1);
    image(video, 0, 0);
    pop();
    
    currImg = createImage(video.width, video.height);
    currImg.copy(video, 0, 0, video.width, video.height,
                  0, 0, video.width, video.height);
   
    // Resize and blur the image for improved background subtraction performance
    currImg.resize(currImg.width / 4, currImg.height / 4);
    currImg.filter(BLUR, 3);
    
    diffImg = createImage(video.width, video.height);
    diffImg.loadPixels();
    diffImg.resize(diffImg.width / 4, diffImg.height / 4);
    
    threshold = thresholdSlider.value();

    if (prevImg) {
        prevImg.loadPixels();
        currImg.loadPixels();

        // loop through every pixel
        for (var x = 0; x < video.width; x++) {
            for (var y = 0; y < video.height; y++) {
                var index = (x + y * video.width) * 4;

                // get the r,g,b values from the video
                var redSource = currImg.pixels[index + 0];
                var greenSource = currImg.pixels[index + 1];
                var blueSource = currImg.pixels[index + 2];

                var redBack = prevImg.pixels[index + 0];
                var greenBack = prevImg.pixels[index + 1];
                var blueBack = prevImg.pixels[index + 2];

                // Calculate the distance between source and target colors
                var d = dist(
                    redSource,
                    greenSource,
                    blueSource,
                    redBack,
                    greenBack,
                    blueBack
                );
                if (d > threshold) {
                    diffImg.pixels[index + 0] = 0;
                    diffImg.pixels[index + 1] = 0;
                    diffImg.pixels[index + 2] = 0;
                    diffImg.pixels[index + 3] = 255;
                } else {
                    diffImg.pixels[index + 0] = 255;
                    diffImg.pixels[index + 1] = 255;
                    diffImg.pixels[index + 2] = 255;
                    diffImg.pixels[index + 3] = 255;
                }
            }
        }
    }
    diffImg.updatePixels();
    
    // Draw the diffImg flipped on the x axis to match main webcam feed
    push();
    translate(width, 0);
    scale(-1, 1);
    image(diffImg, width / 2 - diffImg.width, 0);
    pop();

    prevImg = createImage(currImg.width, currImg.height);
    prevImg.copy(currImg, 0, 0, currImg.width, currImg.height,
                  0, 0, currImg.width, currImg.height);

    grid.run(diffImg);
}


// Style the controls
function styleControls() {

    // Style the Volume slider and label
    volumeLabel.style("color", "#FFF");
    volumeLabel.style("font-size", "16px");
    volumeLabel.style("margin-bottom", "15px");
    volumeSlider.style("width", "273px");
    volumeSlider.style("margin-bottom", "45px");

    // Style the Threshold slider and label
    thresholdLabel.style("color", "#FFF");
    thresholdLabel.style("font-size", "16px");
    thresholdLabel.style("margin-bottom", "15px");
    thresholdSlider.style("width", "273px"); // Adjusted width
    thresholdSlider.style("margin-bottom", "40px");

    // Style the Scale dropdown and label
    scalesLabel.style("color", "#FFF");
    scalesLabel.style("font-size", "16px");
    scalesLabel.style("margin-bottom", "15px");
    sel.style("width", "298px");
    sel.style("background-color", "#444");
    sel.style("color", "#FFF");
    sel.style("border", "1px solid #555");
    sel.style("border-radius", "5px");
    sel.style("padding", "5px 10px");

    // Style the author label
    authorLabel.style("color", "#808080");
    authorLabel.style("font-size", "12px");
    authorLabel.style("margin-top", "125px");
    authorLabel.style("text-align", "right");
}

function positionCanvas() {
    cnv.center();
    let x = (windowWidth - width) / 2;
    let y = (windowHeight - height) / 4;
    cnv.position(x, y);
    controlsPanel.center();
    controlsPanel.position(x + (width) - 320, y + 32);
}

function windowResized() {
    positionCanvas();
}

// Attributions: 
// Piano Chords by blakengouda (Creative Commons License) https://freesound.org/people/blakengouda/packs/29677/
// All icon images from Flaticon (MIT Licence) https://www.flaticon.com/