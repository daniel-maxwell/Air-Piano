class Grid {
    reactIcons = []; // Array to store all reactIcons 
    /////////////////////////////////
    constructor(_w, _h) {
        this.gridWidth = _w;
        this.gridHeight = _h;
        this.noteSize = 40;
        this.notePos = [];
        this.noteState = [];

        // initalise grid structure and state
        for (var x = 0; x < _w; x += this.noteSize) {
            var posColumn = [];
            var stateColumn = [];
            for (var y = 0; y < _h; y += this.noteSize) {
                posColumn.push(
                    createVector(x + this.noteSize / 2, y + this.noteSize / 2)
                );
                stateColumn.push(0);
            }
            this.notePos.push(posColumn);
            this.noteState.push(stateColumn);
        }
    }
    /////////////////////////////////
    run(img) {
        img.loadPixels();
        this.findActiveNotes(img);
        this.drawActiveNotes(img);
    }
    /////////////////////////////////
    drawActiveNotes(img) {
        // draw active notes
        fill(255);
        noStroke();

        for (var i = 0; i < this.notePos.length; i++) {
            for (var j = 0; j < this.notePos[i].length; j++) {
                // I modified this code
                // Flip the x coordinate so that animations are mirrored
                var x = this.gridWidth - this.notePos[i][j].x;
                // End of code I modified
                var y = this.notePos[i][j].y;
                if (this.noteState[i][j] > 0) {
                    var alpha = this.noteState[i][j] * 200;
                    var c1 = color(255, 0, 0, alpha);
                    var c2 = color(0, 255, 0, alpha);
                    var mix = lerpColor(c1, c2,map(i, 0, this.notePos.length, 0, 1));
                    fill(mix);
                    var s = this.noteState[i][j];
                    ellipse(x, y, this.noteSize * s, this.noteSize * s);
                }
                this.noteState[i][j] -= 0.05;
                this.noteState[i][j] = constrain(this.noteState[i][j], 0, 1);
            }
        }

        
        strokeWeight(1);
        // Update and display react icons
        for (let i = 0; i < this.reactIcons.length; i++) {
            this.reactIcons[i].update();
            this.reactIcons[i].display();
        }

        // Filter out "dead" reactions
        this.reactIcons = this.reactIcons.filter((icon) => icon.isAlive());
        
    }
    /////////////////////////////////
    findActiveNotes(img) {
        for (var x = 0; x < img.width; x += 1) {
            for (var y = 0; y < img.height; y += 1) {
                var index = (x + y * img.width) * 4;
                var state = img.pixels[index + 0];
                if (state == 0) { // if pixel is black (ie there is movement)
                    // find which note to activate
                    var screenX = map(x, 0, img.width, 0, this.gridWidth);
                    var screenY = map(y, 0, img.height, 0, this.gridHeight);
                    
                    // Play a piano key if cooldown is not active
                    if (!noteCooldown) this.playPianoKey(screenX);
                    
                    var i = int(screenX / this.noteSize);
                    var j = int(screenY / this.noteSize);
                    this.noteState[i][j] = 1;
                    
                    // Add a react icon if small random chance is met (prevents spamming)
                    if (random(1) < 0.0005) {
                        let flippedX = this.gridWidth - screenX;
                        this.reactIcons.push(new AnimIcon(flippedX, screenY));
                    }
                    
                }
            }
        }
    }
    
    // Play a piano key based on the x coordinate of detected movement
    playPianoKey(screenX) {
        if (concurrentNoteCount >= MAX_CONCURRENT_SOUNDS) return; // Prevent playing too many notes at once
        if (currentNote) { // Stop the current note if it is playing
            currentNote.stop();
        }
        // Calculate the width of each key from grid width and number of keys
        const keyWidth = Math.floor( 
            this.gridWidth / scales[currentScale].length
        );
        // Calculate the index of the key to play
        const keyIndex = Math.floor(
            (((screenX + 1) % keyWidth) / keyWidth) *
                scales[currentScale].length
        );
        // Play the key
        const key = scales[currentScale][keyIndex];
        pianoKeys[key].play(0, 1, 1, 0, 1.5); // Limit the note duration to 1.5 seconds
        currentNote = pianoKeys[key];
        concurrentNoteCount++;

        this.activateCooldown(); // Activate cooldown to prevent too many notes from playing at once

        pianoKeys[key].onended(() => { // Decrement the concurrent note count when the note ends
            concurrentNoteCount--;
        });
    }

    // Activate cooldown to prevent too many notes from playing at once
    activateCooldown() {
        noteCooldown = true;

        setTimeout(() => {
            noteCooldown = false;
        }, cooldownDuration);
    }
    
}


// Class to store and display reaction icons
class AnimIcon {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.velocity = p5.Vector.random2D().mult(random(3, 9)); // Random direction and speed
        this.iconType = int(random(9));
        this.alpha = 255;
        this.lifeSpan = random(20, 40); // Some number of frames for fading and movement

        // Set the image based on the randomly assigned icon type
        switch (this.iconType) {
            case 0: // Quaver
                this.img = quaverImg;
                break;
            case 1: // Two Quavers
                this.img = twoQuaverImg;
                break;
            case 2: // Two Quavers Flipped
                this.img = twoQuaverFlippedImg;
                break;
            case 3: // Awesome
                this.img = awesomeImg;
                break;
            case 4: // Star
                this.img = starImg;
                break;
            case 5: // Star 2
                this.img = star2Img;
                break;
            case 6: // Wow
                this.img = wowImg;
                break;
            case 7: // Heart
                this.img = heartImg;
                break;
            case 8: // Sunglasses
                this.img = sunglassImg;
                break;
            case 9: // Party
                this.img = partyImg;
                break;
        }
    }
    
    update() { // Update position and alpha to fade out
        this.pos.add(this.velocity);
        this.alpha -= 255 / this.lifeSpan;
    }

    display() { // Display the icon with the assigned alpha value
        push();
        tint(255, this.alpha); // Adjusts the alpha transparency of the icon
        image(
            this.img,
            this.pos.x,
            this.pos.y,
            this.img.width * 0.8,
            this.img.height * 0.8
        );
        pop();
    }

    isAlive() { // Returns true if the icon is still visible, else the icon is "dead"
        return this.alpha > 0;
    }
}
