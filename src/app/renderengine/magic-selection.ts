class Point {
    x : number;
    y : number;

    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
}

class MagicSelection implements SelectionInterface {
    private magicWandColor : number[];
    private imageData : ImageData;
    private bmON : number;
    private maskWand : Uint8Array[];
    private maskBorder : Uint8Array;
    private width : number;
    private height : number;

    constructor(image : HTMLImageElement) {
        this.maskBorder = new Uint8Array(image.width * image.height);
        this.bmON = 1;
        this.magicWandColor = null;

        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        
        this.width = image.width;
        this.height = image.height;

        var context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        this.imageData = context.getImageData(0, 0, image.width, image.height);

        this.maskWand = [];
        this.maskWand[0] = new Uint8Array(this.imageData.width * this.imageData.height);
    }

    /* Return borders (bitmask) of magic wand mask. */
    getMaskBorder() {
        /* Check whether a maskwand has been created. */
        if (this.maskWand[0] == undefined) {
            this.maskBorder = new Uint8Array(this.imageData.width * this.imageData.height);
            return undefined;
        }
        
        for (var i = 0; i < this.maskWand[0].length; i++) {
            if (this.maskWand[0][i] == this.bmON) {
                /* Check for borders of image (pixel on border of image is edge). */
                if (i % this.imageData.width == 0 ||
                  i % this.imageData.width == this.imageData.width - 1 ||
                  Math.floor( i / this.imageData.width) == 0 || 
                  Math.floor( i / this.imageData.width) >= this.imageData.height - 1) { /// aanpassing <--
                    this.maskBorder[i] = this.bmON;
                /* Check if one 8 neighbor pixels is off then it is an "inside" pixel. */
                } else if ( this.maskWand[0][i - this.imageData.width - 1] == 0 ||
                    this.maskWand[0][i - this.imageData.width ] == 0 ||
                    this.maskWand[0][i - this.imageData.width + 1] == 0 ||
                    this.maskWand[0][i - 1] == 0 ||
                    this.maskWand[0][i + 1] == 0 ||
                    this.maskWand[0][i + this.imageData.width - 1] == 0 ||
                    this.maskWand[0][i + this.imageData.width] == 0 ||
                    this.maskWand[0][i + this.imageData.width + 1] == 0 ) {
                    this.maskBorder[i] = this.bmON;
                }
            }
        }

        return this.maskBorder;
    }

    /* Given pixel and treshold value (1-100) a bitmask for the borders of the magic wand is returned. 
        Algorithm checks for lines horizontally and adds line elements above and below to the 
        stack when they match the color of the given point. */
    getMaskWand(x : number, y : number, treshold : number) {
    
        x = Math.round(0.5 * (x + 1) * this.width); 
        y = Math.round(0.5 * (y + 1) * this.height);
        console.log("magic " + x + " " + y);
    
        var stack = [];
        var curLine = [];
        var newLine = [];
        var scaledTreshold = Math.pow(10, 1 - (100 / treshold));

        this.magicWandColor = this.getColorPoint(x, y);

        /* Create new empty maskWand for selection. */
        this.maskWand.push(new Uint8Array(this.maskWand[0].length));

        /* Use searchLine to get a horizontal line of points with colors next to given point
            and push to stack. */
        curLine = this.searchLine(x, y, scaledTreshold);
        stack.push(curLine);

        /* Keep popping line elements from stack until stack is empty. Push first all line elements
            above current line and then push all line elements below current line.  */
        while (stack.length > 0 && curLine != null) {
            curLine = stack.pop();

            for (var i = 0; i < curLine.length; i++) {
                /* Check if there is a line element above current position. */
                newLine = this.searchLine(curLine[i].x, curLine[i].y - 1, scaledTreshold);
                if (newLine != null) {
                    stack.push(newLine);
                }           
            }

            for (var i = 0; i < curLine.length; i++) {
                /* Check if there is a line element below current position. */
                newLine = this.searchLine(curLine[i].x, curLine[i].y + 1, scaledTreshold);
                if (newLine != null) {
                    stack.push(newLine);
                }   
            }
        }
        
        /* Merge maskWand[0] with current maskWand. */
        this.mergeMaskWand();

        /* Return current maskWand. */
        return this.maskWand[this.maskWand.length - 1];
    }

    /* Return true when point is within selection. */
    isInSelection(x : number, y : number) {
        if (this.maskWand.length > 0 && this.maskWand[0][y * this.imageData.width + x] != 0) {
            return true;
        } else {
            return false;
        }
    }

    marchingAnts(imageData : ImageData, size : number, offset : number) : void {
        var width = this.imageData.width;
        var height = this.imageData.height;

        for (var i = 0; i < height; i++) {
            for (var j = 0; j < width; j++) {
                var val;
                if (this.maskBorder[i*width + j] == 0) {
                    val = 0;
                } else if ((i + j + offset) % size < size / 2) {
                    val = 255;
                } else {
                    val = 0;
                }
                imageData.data[(i*this.imageData.width+j)*4 + 3] = val;
            }
        }
    }

    /* Remove bitmask of magic wand that contains point. Do not remove first bitmask
        but adjust to the missing bitmask. */
    removeSelection(startX : number, startY : number) {
        var indexRemove = -1;

        for (var i = 1; i < this.maskWand.length; i++) {
            if (this.maskWand[i][startY * this.imageData.width + startX] != 0) {
                indexRemove = i;
            }
        }

        if (indexRemove != -1){
            for (var i = 0; i < this.maskWand[indexRemove].length; i++) {
                if (this.maskWand[indexRemove][i] == this.bmON) {
                    this.maskWand[0][i] = 0;
                }
            }

            this.maskWand.splice(indexRemove, 1);// = [];
        }

        /* Merge because removed selection could also be part of another selection. Make
            sure that maskWand[0] contains complete selection. */
        this.mergeMaskWand();

        return indexRemove;
    }

    /* Return array of points on same line as given point. */
    searchLine(startX : number, startY : number, treshold : number) {
        var line = [];
        var left = startX;
        var right = startX;
    
        /* Check if a valid position is given. */
        if (startY < 0 || startY >= this.imageData.height || startX < 0 || startX >= this.imageData.width ) {
            return null;
        }

        /* Check if point is marked in current maskWand as part of the selection. */ 
        if (this.maskWand[this.maskWand.length - 1][startX + startY * this.imageData.width] != 0) {
            return null;
        }

        /* Check if point matches magicWandColor. */
        if (this.matchPoint(startX, startY, treshold) == false) {
            return null;
        }

        /* Search left from starting point. */
        for (var x = startX - 1; x >= 0; x--) {
            if (this.matchPoint(x, startY, treshold) == false) {
                left = x + 1;
                break;
            } else if( x == 0) {
                left = 0;
                break;
            }
        }

        /* Search right from starting point. */
        for (var x = startX + 1; x < this.imageData.width; x++) {
            if (this.matchPoint(x, startY, treshold) == false) {
                right = x - 1;
                break;
            } else if( x == this.imageData.width - 1) {
                right = this.imageData.width - 1;
                break;
            }
        }
        
        /* Make line by adding all points that are found and adjust bitmask */
        for (var x = left; x <= right; x++) {
            line.push(new Point(x, startY));
            this.maskWand[this.maskWand.length - 1][x + startY * this.imageData.width] = this.bmON;
        }

        return line;
    }

    /* Return RGB values of point. */
    getColorPoint(x : number, y : number) {
        var Red     = this.imageData.data[(x + y * this.imageData.width) * 4];
        var Green   = this.imageData.data[(x + y * this.imageData.width) * 4 + 1];
        var Blue    = this.imageData.data[(x + y * this.imageData.width) * 4 + 2];
        // var Alpha    = this.imageData.data[(x + y * this.imageData.width) * 4 + 3];

        return [Red, Green, Blue];
    }   

    matchPoint(x : number, y : number, treshold : number) {
        var curColor = this.getColorPoint(x, y);
        var value = 0.0;

        for (var i = 0; i < 3; i++) {
            value += Math.pow(this.magicWandColor[i] - curColor[i], 2);
        }

        value /= 3.0 * 255.0 * 255.0; 

        return (value <= treshold);
    }

    mergeMaskWand() {
        for (var i = 1; i < this.maskWand.length; i++) {
            for (var j = 0; j < this.maskWand[0].length; j++) {
                this.maskWand[0][j] = this.maskWand[0][j] || this.maskWand[i][j];
            }   
        }
    }
}