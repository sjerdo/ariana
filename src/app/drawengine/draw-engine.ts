/*
 * Project ariana
 * File: draw.ts
 * Author: Sjoerd Wenker
 * Date: June 3th, 2015
 * Description: this file contains a class to draw lines on a canvas.
 */

/*
 * Position2D class for addressing a point in the draw canvas.
 */
class Position2D {
    constructor(public x : number, public y : number) {

    }

    distanceTo(otherpoint : Position2D) : number {
        return Math.sqrt(Math.pow( otherpoint.x - this.x, 2) + Math.pow(otherpoint.y - this.y, 2));  
    }

    angleWith(otherpoint : Position2D) : number {
        return Math.atan2(otherpoint.x - this.x, otherpoint.y - this.y);
    }

    /*
     * Calculate which point is in the direction of otherpoint with a given distance.
     */
    pointInDirection(otherpoint : Position2D, distance : number) : Position2D {
        var dx : number = otherpoint.x - this.x;
        var dy : number = otherpoint.y - this.y;

        var origDistance : number = this.distanceTo(otherpoint);

        if (distance == origDistance) {
            return otherpoint;
        }
        if (distance == 0.0 || origDistance == 0.0) {
            return this;
        }

        var fraction : number = distance / origDistance;

        var newX : number = this.x + fraction * dx;
        var newY : number = this.y + fraction * dy;

        return new Position2D(newX, newY);

    }
}

/*
 * Class that defines a path
 */

class Path {
    path : Array<Position2D>;
    lastDrawnItem : number = 0;

    constructor(public start : Position2D) {
        this.path  = [];
        this.path.push(start);
    }

    addPosition(position : Position2D) : void {
        this.path.push(position);
    }

    setLastPosition(position : Position2D) : void {
        this.path[this.length() - 1] = position;
    }

    length() : number {
        return this.path.length;
    }
}

/*
 * Class that defines a color
 */
class Color {

    constructor(public r : number, public g : number, public b : number, public a : number) {

    }

    getRGBA() {
        return 'rgba('+ this.r + ', '+ this.g + ', '+ this.b + ', '+ this.a + ')';
    }

    getRGBWithOpacity(alpha : number) {
        return 'rgba('+ this.r + ', '+ this.g + ', '+ this.b + ', '+ alpha + ')';
    }
}

/*
 * Draw Types
 *
 * NORMAL : normal line (or a dot)
 * BRUSH : Draw lines using a brush image
 * LINE : draw lines
 * RECTANGLE : draw rectangles
 * 
 */
enum drawType { NORMAL, DASHED, BRUSH, LINE, RECTANGLE }

/*
 * Brushes
 *
 * THIN : thin line
 * PEN : line with changing width
 * NEIGHBOR : stroke nearby lines
 * FUR : fur effect with nearby points
 */
enum brushType { THIN, PEN, NEIGHBOR, FUR, MULTISTROKE }

/*
 * Drawing class
 *
 * This class allows the user to draw lines, and anything else you can imagine,
 * on the canvas.
 */
class DrawEngine {

    isActive : boolean;
    isCleared : boolean = true; /* Boolean that tells the drawer if the canvas is cleared */
    currentPath : Path;

    /* Information about the drawstyle */
    drawType : drawType = drawType.NORMAL;
    color : Color = new Color(255, 255, 255, 1.0);
    opacity : number = 1.0;
    intensity : number = 1.0;
    lineWidth : number = 5;

    brush : brushType;
    brushImage : HTMLImageElement;

    /* Canvas elements and its contexts */
    memCanvas : HTMLCanvasElement;
    memContext : CanvasRenderingContext2D;
    drawCanvas : HTMLCanvasElement;
    drawContext : CanvasRenderingContext2D;
    tmpDrawCanvas : HTMLCanvasElement;
    tmpDrawContext : CanvasRenderingContext2D;

    width : number;
    height : number;

    dashedDistance : number;

    constructor(canvas : HTMLCanvasElement) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.drawCanvas = canvas;

        this.memCanvas = document.createElement('canvas');
        this.memCanvas.width = this.width;
        this.memCanvas.height = this.height;
        this.memContext = <CanvasRenderingContext2D>this.memCanvas.getContext('2d');
        this.drawContext = <CanvasRenderingContext2D>this.drawCanvas.getContext('2d');

        this.dashedDistance = 0.0;

        this.tmpDrawCanvas = document.createElement('canvas');
        this.tmpDrawCanvas.width = this.width;
        this.tmpDrawCanvas.height = this.height;
        this.tmpDrawContext = <CanvasRenderingContext2D>this.tmpDrawCanvas.getContext("2d");
    }

    resize(width : number, height : number) : void {
        this.memCanvas.width = width;
        this.memCanvas.height = height;
        this.tmpDrawCanvas.width = width;
        this.tmpDrawCanvas.height = height;
        this.width = width;
        this.height = height;
        this.clearCanvases();
    }
    
    /*
     * Function that is called at mousepress
     */
    onMousedown = (x : number, y : number) : void => {
        if (!this.currentPath) {
            this.dashedDistance = 0.0;
            this.saveCanvas();
            this.currentPath = new Path(new Position2D(x, y));
            if (this.drawType == drawType.RECTANGLE) {
                this.currentPath.addPosition(new Position2D(x, y));
            }
        }

        if (this.drawType == drawType.LINE) {
            this.currentPath.addPosition(new Position2D(x, y));
        }
    }

    /*
     * Funtion that is called when the mouse is moved
     */
    onMousemove = (x : number, y : number) : void => {
        if (this.currentPath) {

            if (this.drawType == drawType.LINE || this.drawType == drawType.RECTANGLE) {
                this.currentPath.setLastPosition(new Position2D(x, y));
            }
            else {
                this.currentPath.addPosition(new Position2D(x, y));
            }
            this.draw(this.currentPath);
        }
    };

    /*
     * Function being called when the mouse is no longer being pressed
     */
    onMouseup = (x : number, y : number) : void => {
        if (!this.currentPath) return;
        
        if (this.drawType == drawType.RECTANGLE) {
            this.currentPath.setLastPosition(new Position2D(x, y));
        }
        else if (this.drawType == drawType.LINE) {
            this.currentPath.setLastPosition(new Position2D(x, y));
        }
        else {
            this.currentPath.addPosition(new Position2D(x, y));
        }

        this.draw(this.currentPath);
        this.currentPath = null;
    };

    /*
     * Set the size of the brush/line
     */
    setLineWidth(size : number) : void {
        this.lineWidth = size;
    }

    /*
     * Set the draw type
     */
    setDrawType(drawType : drawType) : void {
        this.drawType = drawType;
    }

    /*
     * Set the color of the line
     */
    setColor(r : number, g : number, b : number, a : number) : void {
        this.color = new Color(r, g, b, a);
        if (this.drawType == drawType.BRUSH) {
            this.setBrush(this.brush);
        }
    }

    /*
     * getColorString
     */
    getColorString() : string {
        return this.color.getRGBA();
    }

    /*
     * Set the opacity
     */
    setOpacity(opacity : number) : void {
        if (opacity < 0.8) {
            this.opacity = opacity / 8;
        }
        else {
            this.opacity = 4.5 * opacity - 3.5;
        }
    }

    setIntensity(intensity : number) : void {
        this.intensity = intensity;
    }

    /*
     * Set the brush
     */
    setBrush(brush : brushType) : void {
        this.brush = brush;
        var brushImageURL : string = this.getBrushImage(brush);
        if (brushImageURL == null) {
            return;
        }
        if (brushImageURL.indexOf('.svg') > 0) {
            return this.loadBrushSVG(brushImageURL);
        }
        this.brushImage = new Image();
        this.brushImage.src = brushImageURL;
        this.brushImage.addEventListener('load', this.brushLoaded);
    }

    /*
     * Get the brush image url
     */
    getBrushImage(brush : brushType) : string {
        if (brush == brushType.THIN) {
            return 'assets/img/thin.svg';
        }
        this.setDrawType(drawType.BRUSH);
        return null;
    }

    /*
     * Function that is called if a brush is loaded
     */
    brushLoaded = () : void => {
        this.setDrawType(drawType.BRUSH);
    }

    /*
     * Save the canvas (use this before drawing)
     */
    saveCanvas = () : void => {
        this.memContext.clearRect(0, 0, this.width, this.height);
        this.memContext.drawImage(this.drawCanvas, 0, 0);
    };

    /*
     * Reset the canvas to its original state (the saved state)
     */
    clearCanvas = () : void => {
        var context =  this.drawContext;
        context.globalAlpha = 1.0;
        context.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        context.drawImage(this.memCanvas, 0, 0);

        this.tmpDrawContext.globalAlpha = 1.0;
        this.tmpDrawContext.clearRect(0, 0, this.tmpDrawCanvas.width, this.tmpDrawCanvas.height);

        this.isCleared = true;

        if (this.currentPath) {
            this.currentPath.lastDrawnItem = 0;
        }
    };

    clearTempCanvas = () : void => {
        this.tmpDrawContext.globalAlpha = 1.0;
        this.tmpDrawContext.clearRect(0, 0, this.tmpDrawCanvas.width, this.tmpDrawCanvas.height);
    };

    clearCanvases() : void {
        this.memContext.clearRect(0, 0, this.memCanvas.width, this.memCanvas.height);
        this.tmpDrawContext.clearRect(0, 0, this.tmpDrawCanvas.width, this.tmpDrawCanvas.height);
        this.clearCanvas();
    }

    /*
     * Function to call when the drawing must be saved to the renderengine.
     */
    getCanvasImageData() : ImageData {
        if (this.drawCanvas)
            return this.drawContext.getImageData(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        
        return null;
    }

    getCanvasHTMLImageElement() : HTMLImageElement {
        if (this.drawCanvas) {
            var image = new Image();
            image.width = this.drawCanvas.width;
            image.height = this.drawCanvas.height;
            image.src = this.drawCanvas.toDataURL();
            return image;
        } else {
            return null;
        }
    }

    /*
     * Draw the given path to the canvas using the selected drawType
     */
    draw(path : Path) : void {
        var context = this.tmpDrawContext;
        if (context == null) {
            console.log("Can't draw path, canvas context could not be rendered.");
            return;
        }

        this.clearTempCanvas();

        /* Append the right brush settings */
        context.strokeStyle = this.color.getRGBA();
        context.lineWidth = this.lineWidth;
        context.lineCap = 'round';
        context.globalAlpha = this.opacity;

        var points = path.path;

        /* Normal draw */
        if (this.drawType == drawType.NORMAL) {
            this.drawNormal(points, path, context);
        }

        /* Draw dashed line */
        if (this.drawType == drawType.DASHED) {
            this.drawDashedLine(points, path, context);
        }

        /*
         * Paint brush 
         */
        if (this.drawType == drawType.BRUSH) {
            this.drawBrush(points, path, context);
        }

        /*
         * Draw a line between the given points in a path
         */
        if (this.drawType == drawType.LINE) {
            this.drawLines(points, context);
        }

        /*
         * Draw a rectangle
         */
        if (this.drawType == drawType.RECTANGLE) {
            this.drawRectangle(points, context);
        }

        this.drawContext.drawImage(this.tmpDrawCanvas, 0, 0);

        this.isCleared = false;
    }

    /*
     * Function to draw a line between each point in a path
     */
    drawNormal(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {
        var i : number = path.lastDrawnItem;

        context.beginPath();
        context.moveTo(points[i].x, points[i].y);
        for (i = i + 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.stroke();

        path.lastDrawnItem = i - 1;
    }

    /*
     * Draw a dashed line (black and white) for the loose selection
     */
    drawDashedLine(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {
        var nrLastDrawn : number = path.lastDrawnItem;

        for (var i = nrLastDrawn + 1; i < points.length; i++) {
            var lastPoint : Position2D = points[i-1];
            var nextPoint : Position2D;
            
            while (lastPoint.distanceTo(points[i]) > 0) {
                if (lastPoint.distanceTo(points[i]) > 5 - this.dashedDistance % 5) {
                    nextPoint = lastPoint.pointInDirection(points[i], 5 - this.dashedDistance % 5);
                }
                else {
                    nextPoint = points[i];
                }

                context.beginPath();
                context.moveTo(lastPoint.x, lastPoint.y);
                if (this.dashedDistance % 10 >= 5.0) {
                    context.strokeStyle = 'rgba(0,0,0,255)';
                }
                else {
                    context.strokeStyle = 'rgba(255,255,255,255)';
                }
                context.lineTo(nextPoint.x, nextPoint.y);
                context.stroke();

                if (nextPoint == points[i]) {
                    this.dashedDistance += lastPoint.distanceTo(points[i]);
                    break;
                }
                this.dashedDistance += 5 - this.dashedDistance % 5;
                lastPoint = nextPoint;
            }

        }

        path.lastDrawnItem = points.length - 1;
    }

    /*
     * Function to draw lines by given points to a given canvas-context
     */
    drawLines(points : Array<Position2D>, context : CanvasRenderingContext2D) {
        if (!this.isCleared) {
            this.clearCanvas();
        }

        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (var i : number = 1; i < points.length; i++) {
            context.lineTo(points[i].x, points[i].y);
        }
        context.stroke();
    }

    /*
     * Function to draw a rectangle
     */
    drawRectangle(points : Array<Position2D>, context : CanvasRenderingContext2D) {
        if (!this.isCleared) {
            this.clearCanvases();
        }
        this.dashedDistance = 0.0;

        var corners: Array<Position2D> = [];
        corners.push(new Position2D(points[0].x, points[0].y));
        corners.push(new Position2D(points[0].x, points[1].y));
        corners.push(new Position2D(points[1].x, points[1].y));
        corners.push(new Position2D(points[1].x, points[0].y));

        this.drawDashedLineParticle(corners[0], corners[1], context);
        this.dashedDistance = 0.0;
        this.drawDashedLineParticle(corners[1], corners[2], context);
        this.dashedDistance = 0.0;
        this.drawDashedLineParticle(corners[3], corners[2], context);
        this.dashedDistance = 0.0;
        this.drawDashedLineParticle(corners[0], corners[3], context);
    }

    drawDashedLineParticle(start : Position2D, end : Position2D, context : CanvasRenderingContext2D) {
        var lastPoint : Position2D = start;
        var nextPoint : Position2D;

        while (lastPoint.distanceTo(end) > 0) {
            if (lastPoint.distanceTo(end) > 5 - this.dashedDistance % 5) {
                nextPoint = lastPoint.pointInDirection(end, 5 - this.dashedDistance % 5);
            }
            else {
                nextPoint = end;
            }

            context.beginPath();
            context.moveTo(lastPoint.x, lastPoint.y);
            if (this.dashedDistance % 10 >= 5.0) {
                context.strokeStyle = 'rgba(0,0,0,255)';
            }
            else {
                context.strokeStyle = 'rgba(255,255,255,255)';
            }
            context.lineTo(nextPoint.x, nextPoint.y);
            context.stroke();

            if (nextPoint == end) {
                this.dashedDistance += lastPoint.distanceTo(end);
                break;
            }
            this.dashedDistance += 5 - this.dashedDistance % 5;
            lastPoint = nextPoint;
        }
    }

    /*
     * Function to draw using a brush image.
     */
    drawBrushImage(points, path : Path, context : CanvasRenderingContext2D) {
        var i : number = path.lastDrawnItem - 2;

        var brushCanvas = document.createElement("canvas");
        brushCanvas.width = this.lineWidth;
        brushCanvas.height = this.lineWidth;
        var brushContext = brushCanvas.getContext("2d");
        brushContext.drawImage(this.brushImage, 0, 0, this.lineWidth, this.lineWidth);

        if (path.path.length < 3)
        {
            context.drawImage(
                brushCanvas,
                points[0].x - this.lineWidth/2,
                points[0].y - this.lineWidth/2
            );
        }
        if (i < 1) {
            i = 1;
        }

        /* Iterate over the not-drawn points in the path */
        for (i; i < points.length - 2; i++) {
            var start = points[i - 1];
            var end = points[i];
            
            var distance : number = start.distanceTo(end);
            var angle = start.angleWith(end);
            
            var x, y;

            var zDiff : number = this.brushImage.width;
            if (this.brush == brushType.THIN) {
                zDiff = 1;
            }
            
            /* Draw images between the two points */
            for ( var z=0; (z<=distance || z==0); z += zDiff)
            {
                x = start.x + (Math.sin(angle) * z) - this.lineWidth/2;
                y = start.y + (Math.cos(angle) * z) - this.lineWidth/2;
                context.drawImage(brushCanvas, x, y);
            }
        }
        path.lastDrawnItem = i;
    }


    drawBrush(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {
        if (this.brush == brushType.THIN) {
            return this.drawBrushImage(points, path, context);
        }

        if (this.brush == brushType.PEN) {
            return this.drawBrushPen(points, path, context);
        }

        if (this.brush == brushType.NEIGHBOR) {
            return this.drawBrushNeighbor(points, path, context);
        }

        if (this.brush == brushType.FUR) {
            return this.drawBrushFur(points, path, context);
        }

        if (this.brush == brushType.MULTISTROKE) {
            return this.drawBrushMultiStroke(points, path, context);
        }
    }

    /*
     * Draw using the pen brush
     */
    drawBrushPen(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {

        var i : number = path.lastDrawnItem;

        context.beginPath();
        context.moveTo(points[i].x, points[i].y);
        for (i = i + 1; i < points.length; i++) {
            context.lineWidth = (Math.random() * 0.4 + 0.8) * this.lineWidth;
            context.lineTo(points[i].x, points[i].y);
        }
        context.stroke();

        path.lastDrawnItem = i - 1;
    }

    /*
     * Draw using the neighbor brush. This will connect lines when their distance is small
     */
    drawBrushNeighbor(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {

        var i : number = path.lastDrawnItem;

        if (i == 0) {
            i = 1;
        }

        for (; i > 0 && i < points.length; i++) {

            var lastpoint = points[i];
            context.beginPath();
            context.strokeStyle = this.color.getRGBA();
            context.lineWidth = this.lineWidth;
            context.moveTo(points[i - 1].x, points[i - 1].y);
            context.lineTo(lastpoint.x, lastpoint.y);
            context.stroke();

            for (var j = 0; j < i; j++) {
                if (lastpoint.distanceTo(points[j]) < 16*this.intensity) {
                    context.beginPath();
                    context.strokeStyle = this.color.getRGBWithOpacity(0.5);
                    context.lineWidth = Math.ceil(this.lineWidth / 10);
                    context.moveTo( lastpoint.x, lastpoint.y);
                    context.lineTo( points[j].x, points[j].y);
                    context.stroke();
                }
            }
        }

        path.lastDrawnItem = i;
    }

    /*
     * Draw using the fur brush, which will give a furry effect
     */
    drawBrushFur(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {

        var i : number = path.lastDrawnItem;

        if (i == 0) {
            i = 1;
        }

        for (; i > 0 && i < points.length; i++) {

            var lastpoint = points[i];
            context.beginPath();
            context.strokeStyle = this.color.getRGBA();
            context.lineWidth = this.lineWidth;
            context.moveTo(points[i - 1].x, points[i - 1].y);
            context.lineTo(lastpoint.x, lastpoint.y);
            context.stroke();

            for (var j = 0; j < i; j++) {

                var dx = points[j].x - lastpoint.x;
                var dy = points[j].y - lastpoint.y;
                
                var distance = lastpoint.distanceTo(points[j]);

                if (distance < 16*this.intensity && Math.random() > distance / (32*this.intensity)) {
                    context.beginPath();
                    context.strokeStyle = this.color.getRGBWithOpacity(0.5);
                    context.lineWidth = Math.ceil(this.lineWidth / 10);
                    context.moveTo( lastpoint.x + (dx * 0.5), lastpoint.y + (dy * 0.5));
                    context.lineTo( lastpoint.x - (dx * 0.5), lastpoint.y - (dy * 0.5));
                    context.stroke();
                }
            }
        }

        path.lastDrawnItem = i;
    }

    /*
     * Draw using the multistroke brush. The multistroke draws multiple strokes between two points in a path.
     */
    drawBrushMultiStroke(points : Array<Position2D>, path : Path, context : CanvasRenderingContext2D) {

        var i : number = path.lastDrawnItem;

        context.beginPath();
        for (i = i + 1; i < points.length; i++) {
  
          context.moveTo(points[i-1].x - this.getRandomInt(0, this.intensity), points[i-1].y - this.getRandomInt(0, this.intensity));
          context.lineTo(points[i].x - this.getRandomInt(0, this.intensity), points[i].y - this.getRandomInt(0, this.intensity));
          context.stroke();
          /*
          context.moveTo(points[i-1].x, points[i-1].y);
          context.lineTo(points[i].x, points[i].y);
          context.stroke();
          */
          context.moveTo(points[i-1].x + this.getRandomInt(0, this.intensity), points[i-1].y + this.getRandomInt(0, this.intensity));
          context.lineTo(points[i].x + this.getRandomInt(0, this.intensity), points[i].y + this.getRandomInt(0, this.intensity));
          context.stroke();

        }
        context.stroke();

        path.lastDrawnItem = i - 1;
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /*
     * Load a svg brush file to an image element for drawing it on the canvas
     */
    loadBrushSVG(url : string) : void {
        var thisPointer = this;
        $.get(
            url,
            function(data) {
                var paths = data.getElementsByTagName("path");
                for (var i = 0; i < paths.length; i++) {
                    paths[i].style.fill = thisPointer.getColorString();
                }

                var dataString = new XMLSerializer().serializeToString(data);
                var src = 'data:image/svg+xml;base64,' + window.btoa(dataString);
                thisPointer.brushImage = new Image();
                thisPointer.brushImage.src = src;
                thisPointer.brushLoaded();
            }
        );
    }
}
