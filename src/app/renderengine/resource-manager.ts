/// <reference path="image-shader-program"/>
/// <reference path="filters/brightness-filter"/>
/// <reference path="filters/invert-colors-filter"/>
/// <reference path="filters/contrast-filter"/>
/// <reference path="filters/saturation-filter"/>
/// <reference path="filters/noise-filter"/>
/// <reference path="filters/sepia-filter"/>
/// <reference path="filters/colorize-filter"/>

class ResourceManager {
    private gl : WebGLRenderingContext;
    private imageShaderProgram : ImageShaderProgram;

    private brightnessProgram : BrightnessProgram;
    private contrastProgram : ContrastProgram;
    private sepiaProgram : SepiaProgram;
    private invertColorsProgram : InvertColorsProgram;
    private saturationProgram : SaturationProgram;
    private noiseProgram : NoiseProgram;
    private colorizeProgram : ColorizeProgram;

    constructor(gl : WebGLRenderingContext) {
        this.gl = gl;
    }

    getWebGLContext() : WebGLRenderingContext {
        return this.gl;
    }

    imageShaderProgramInstance() : ImageShaderProgram {
        if (!this.imageShaderProgram) {
            this.imageShaderProgram = new ImageShaderProgram(this.gl);
        }
        return this.imageShaderProgram;
    }

    brightnessProgramInstance() : BrightnessProgram {
        if (!this.brightnessProgram) {
            this.brightnessProgram = new BrightnessProgram(this.gl);
        }
        return this.brightnessProgram;
    }

    contrastProgramInstance() : ContrastProgram {
        if (!this.contrastProgram) {
            this.contrastProgram = new ContrastProgram(this.gl);
        }

        return this.contrastProgram;
    }

    sepiaProgramInstance() : SepiaProgram {
        if (!this.sepiaProgram) {
            this.sepiaProgram = new SepiaProgram(this.gl);
        }

        return this.sepiaProgram;
    }

    invertColorsProgramInstance() : InvertColorsProgram {
        if (!this.invertColorsProgram) {
            this.invertColorsProgram = new InvertColorsProgram(this.gl);
        }

        return this.invertColorsProgram;
    }

    saturationProgramInstance() : SaturationProgram {
        if (!this.saturationProgram) {
            this.saturationProgram = new SaturationProgram(this.gl);
        }

        return this.saturationProgram;
    }

    noiseProgramInstance() : NoiseProgram {
        if (!this.noiseProgram) {
            this.noiseProgram = new NoiseProgram(this.gl);
        }

        return this.noiseProgram;
    }

    colorizeProgramInstance() : ColorizeProgram{
        if (!this.colorizeProgram) {
            this.colorizeProgram = new ColorizeProgram(this.gl);
        }

        return this.colorizeProgram;
    }
}