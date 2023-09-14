
var video;
var threshold = 200;
var thresholdSlider;
var button;
var backImg;
var currImg;
var diffImg;

function setup() {
    createCanvas(640 * 2, 480);
    pixelDensity(1);
    video = createCapture(VIDEO);
    video.hide();
    noStroke();

    thresholdSlider = createSlider(0, 255, 50);
    thresholdSlider.position(20, 500);
}

function draw() {
    background(0);

    // draw the video
    image(video, 0, 0);

    currImg = createImage(video.width, video.height);
    currImg.copy(video, 0, 0, video.width, video.height, 0, 0, video.width, video.height);

    diffImg = createImage(video.width, video.height);
    diffImg.loadPixels();

    threshold = thresholdSlider.value();

    if (backImg) {
        backImg.loadPixels();
        currImg.loadPixels();

        // loop through every pixel
        for (var x = 0; x< video.width; x++) {
            for (var y = 0; y < video.height; y++) {

                var index = (x + y * video.width) * 4;

                // get the r,g,b values from the video
                var redSource = currImg.pixels[index + 0];
                var greenSource = currImg.pixels[index + 1];
                var blueSource = currImg.pixels[index + 2];

                var redBack = backImg.pixels[index + 0];
                var greenBack = backImg.pixels[index + 1];
                var blueBack = backImg.pixels[index + 2];

                // Calculate the distance between source and target colors
                var d = dist(redSource, greenSource, blueSource, redBack, greenBack, blueBack);
                if (d > threshold) {
                    diffImg.pixels[index + 0] = 0;
                    diffImg.pixels[index + 1] = 0;
                    diffImg.pixels[index + 2] = 0;
                    diffImg.pixels[index + 3] = 255;
                }
                else {
                    diffImg.pixels[index + 0] = 255;
                    diffImg.pixels[index + 1] = 255;
                    diffImg.pixels[index + 2] = 255;
                    diffImg.pixels[index + 3] = 255;
                }
            }
        }
    }
    diffImg.updatePixels();
    image(diffImg, 640, 0 );
}

// savew target color when mouse is pressed
function keyPressed () {
    backImg = createImage(currImg.width, currImg.height);
    backImg.copy(currImg, 0, 0,
                 currImg.width,
                 currImg.height,
                 0, 0, currImg.width,
                 currImg.height);
    console.log("updated background");
}