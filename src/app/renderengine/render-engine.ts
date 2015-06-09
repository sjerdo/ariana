/**
 * Created by zeta on 6/2/15.
 */
/// <reference path="render-helper"/>
/// <reference path="layer"/>
/// <reference path="drawbuffer"/>
/// <reference path="filter"/>
/// <reference path="image-layer"/>

class RenderEngine {
    private gl : WebGLRenderingContext;

    /* Array of layers in the order that the user sees them */
    private layers : Array<Layer>;
    private drawbuffer1 : DrawBuffer;
    private drawbuffer2 : DrawBuffer;

    /* Width and height of the framebuffer */
    private width : number;
    private height : number;
    private canvas : HTMLCanvasElement;

    constructor (canvas : HTMLCanvasElement) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.canvas = canvas;

        this.layers = new Array();

        try {
            /* Try to grab the standard context. If it fails, fallback to experimental. */
            this.gl = <WebGLRenderingContext> (
                canvas.getContext("webgl", {stencil:true, preserveDrawingBuffer: true}) ||
                canvas.getContext("experimental-webgl", {stencil:true, preserveDrawingBuffer: true})
            );
            var contextAttributes = this.gl.getContextAttributes();

            var haveStencilBuffer = contextAttributes.stencil;

            if (!haveStencilBuffer) {
                console.log("Your browser has limited support for WebGL (missing stencil buffer).\nSelection will not work!");
            }

            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        }
        catch(e) {
            alert("Your device/browser doesnt support WebGL!\ncheck console for stacktrace.");
            console.log(e.stack);
        }
        this.gl.viewport(0, 0, this.width, this.height);
        this.drawbuffer1 = new DrawBuffer(this.gl, this.width, this.height);
        this.drawbuffer2 = new DrawBuffer(this.gl, this.width, this.height);
    }

    addLayer(layer : Layer) {
        /* Append layer to user array */
        this.layers.push(layer);
    }
 
    removeLayer(index : number) {
        var layer : Layer = this.layers[index];
        this.layers.splice(layer.getID(), 1);
        layer.destroy();
    }

    reorder(i : number, j : number) {
        /* Switch places in the user array */
        var temp = this.layers[i];
        this.layers[i] = this.layers[j];
        this.layers[j] = temp;
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
        var aspectRatio = 1. * this.width / this.height;
        console.log(aspectRatio);
        var oldType = -1;
        var numItems = this.layers.length;

        /* Draw all layers to the currently bound framebuffer */
        for (var i = 0; i < numItems; i++) {
            var layer = this.layers[i];
            if (layer.getLayerType() != oldType) {
                /*
                 * We're drawing a different type of layer then our previous one,
                 * so we need to do some extra stuff.
                 */
                layer.setupRender();
                oldType = layer.getLayerType();
            }

            layer.render(aspectRatio);
        }
    }

    filterLayers(layerIndices : number[], filter : Filter) {
        var aspectRatio = this.width / this.height;
        for (var i = 0; i < layerIndices.length; i ++) {
            var layer = this.layers[layerIndices[i]];
            if (layer.getLayerType() !== LayerType.ImageLayer) {
                continue;
            }

            var imageLayer = <ImageLayer> layer;
            this.drawbuffer1.bind();
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
            imageLayer.setupRender();
            imageLayer.render(aspectRatio);
            this.drawbuffer1.unbind();

            this.drawbuffer2.bind();
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
            filter.render(this.drawbuffer1.getWebGlTexture());
            imageLayer.copyFramebuffer(this.width, this.height);
            this.drawbuffer2.unbind();

            imageLayer.setDefaults();
        }
        this.drawbuffer2.unbind();
    }

    renderToImg() {
        /* Render all layers to a framebuffer and return a 64base encoded image */
        this.drawbuffer1.bind();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
        this.render();
        var val = this.drawbuffer1.getImage();
        this.drawbuffer1.unbind();

        return val;
    }

    getWebGLRenderingContext() : WebGLRenderingContext {
        return this.gl;
    }

    getPixelColor(x : number, y : number) : Uint8Array {
        var value = new Uint8Array(4);
        this.gl.readPixels(x, this.height-y-1, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, value);
        return value;
    }

    resize(width : number, height : number) {
        if ((width * height) % 4 != 0) {
            console.log("Width * height needs to be dividable by 4");
            return;
        }
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;

        this.drawbuffer1.resize(width, height);
        this.drawbuffer2.resize(width, height);
        this.gl.viewport(0, 0, width, height);
    }

    destroy() {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].destroy();
        }

        this.drawbuffer1.destroy();
        this.drawbuffer2.destroy();
    }
}