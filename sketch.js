var video;
var threshold = 200;
var thresholdSlider;
var button;
var prevImg;
var currImg;
var diffImg;

var grid;
var imgNum;
let currentScale = "major"; // Default scale
let concurrentNoteCount = 0; // Keeps track of number of notes currently playing
const MAX_CONCURRENT_SOUNDS = 3; // Maximum number of notes that can play at once
let currentNote = null; // Keeps track of the most recently played note
let noteCooldown = false; // Whether or not a note can be played
const cooldownDuration = 200; // 1 second cooldown, adjust as needed
var sel; // Scale selector dropdown
var scalesLabel; // Label for scale selector dropdown
var thresholdLabel; // Label for threshold slider

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
    createCanvas(640 * 2, 480);
    pixelDensity(1);
    video = createCapture(VIDEO);
    video.hide();
    noStroke();
    
    // Label and Slider for threshold
    thresholdLabel = createElement("label", "Threshold:");
    thresholdSlider = createSlider(0, 255, 200);
    thresholdSlider.position(20, 500);
    
    // Label and dropdown menu for scale selector
    scalesLabel = createElement("label", "Choose a Scale:");
    sel = createSelect();
    sel.position(20, 520);
    sel.option("Major", "major");
    sel.option("Minor", "minor");
    sel.selected("major");
    sel.changed(() => {
        currentScale = sel.value();
    });
    styleControls(); // Call function to style the controls
    grid = new Grid(640, 480); // Create a new grid
}

function draw() {
    background(0);
    
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
    // Style the Threshold slider and label
    thresholdLabel.position(20, 510);
    thresholdLabel.style("color", "#000000");
    thresholdLabel.style("font-family", "Helvetica");
    thresholdSlider.position(110, 510);
    thresholdSlider.style("width", "200px");

    // Style the Scale dropdown and label
    scalesLabel.position(350, 510);
    scalesLabel.style("color", "#000000");
    scalesLabel.style("font-family", "Helvetica");
    sel.position(490, 505);
    sel.style("width", "150px");
    sel.style("background-color", "#222");
    sel.style("color", "#FFF");
    sel.style("border", "1px solid #888");
    sel.style("border-radius", "5px");
    sel.style("padding", "5px 10px");
}

// Attributions: 
// Piano Chords by blakengouda (Creative Commons License) https://freesound.org/people/blakengouda/packs/29677/
// All icon images from Flaticon (MIT Licence) https://www.flaticon.com/