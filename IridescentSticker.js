import miniGL from "./miniGL/miniGL.js";

class IridescentSticker {
  constructor(selector, options = {}) {
    // Default options
    this.options = {
      plasmaScale: 2.0,
      highlightPower: 8.0,
      highlightMix: 0.25,
      useMousePosition: false,
      mousePosition: { x: 0.5, y: 0.5 },
      rotation: 0,
      onReady: null,
      ...options,
    };

    // Device orientation tracking
    this.orientation = { alpha: 0, beta: 0, gamma: 0 };
    this.isAnimating = false;
    this.shader = null;
    this.gl = null;
    this.isReady = false;

    // Initialize
    this.init(selector);
  }

  init(selector) {
    // Initialize miniGL
    this.gl = new miniGL(selector, {
      z: -10,
    });

    // Setup device orientation (for mobile) or mouse position (for desktop)
    if (!this.options.useMousePosition) {
      this.setupOrientationListener();
    }

    // Create shader
    this.createShader();

    // Start animation
    this.start();

    // Mark as ready and call callback
    this.isReady = true;
    if (this.options.onReady && typeof this.options.onReady === "function") {
      // Small delay to ensure shader is fully initialized
      setTimeout(() => {
        this.options.onReady();
      }, 100);
    }
  }

  setupOrientationListener() {
    const handleOrientation = (event) => {
      this.orientation.alpha = event.alpha || 0;
      this.orientation.beta = event.beta || 0;
      this.orientation.gamma = event.gamma || 0;
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("deviceorientationabsolute", handleOrientation);
  }

  createShader() {
    this.shader = this.gl.shader(
      `#version 300 es
        precision highp float;
        uniform float glTime;
        uniform float uAlpha;
        uniform float uBeta;
        uniform float uGamma;
        uniform float uPlasmaScale;
        uniform float uHighlightPower;
        uniform float uHighlightMix;
        uniform float uRotation;
        in vec2 glUV;
        out vec4 fragColor;

        vec3 irri(float x){
            vec3 a = vec3(0.5);
            vec3 b = vec3(0.5);
            vec3 c = vec3(1.);
            vec3 d = vec3(0.,0.334,0.667);
            return a + b * cos( 6.28318 * ( c * x + d ));
        }

        vec3 plasma(vec2 uv, float scale){
             uv *= scale;
            float t = glTime * 0.00;
            float f = sin(uv.x + sin(2.0*uv.y + t)) +
                  sin(length(uv)+t) +
                  0.5*sin(uv.x*2.5+t);
            return irri(f*.5+.5)*.5+.5;
        }

        mat2 rot(float angle) {
            float c = cos(angle);
            float s = sin(angle);
            return mat2(c, -s, s, c);
        }

        float hilits(vec2 uv, float ga, float bet, vec2 center){
            float s = 0.;
            uv -= .5;
            uv *= rot(-atan(bet,ga));
            uv += vec2(bet, ga);

            for (float i = 0.00; i < 3.0; i++) {
                uv = (uv * 0.5) - 10.0;
                float d = length(uv);    
                d = sin(d * 16.0 + ga + bet ) / 6.0;
                d = abs(d);
                d = 0.065 / d;
                s +=  d;
            }
            return min(normalize(vec2(s,1.5)).x,1.);
        }

        void main() {
          // Counter-rotate UV coordinates to counteract container rotation
          vec2 uv = glUV - 0.5; // Center the coordinates
          uv *= rot(-uRotation); // Counter-rotate by negative rotation angle
          uv += 0.5; // Move back to 0-1 range
          
          float x = mix(uv.x, 1.-uv.x, uGamma);
          float y = mix(uv.y, 1.-uv.y, uBeta);
          vec2 center = vec2(x,y);
          float hilit = hilits(uv, uGamma, uBeta, center);
          
          vec3 color = plasma(uv-center, uPlasmaScale);
          vec3 m = color;//mix(color, color * (1.0 - uHighlightMix) + uHighlightMix, pow(hilit, uHighlightPower));
          vec3 render = clamp(m, vec3(0.), vec3(1.));
          render = pow(render, vec3(1.0/2.2)); // gamma correction
          fragColor = vec4(render,1.);
        }
      `,
      {
        uAlpha: 0,
        uBeta: 0,
        uGamma: 0,
        uPlasmaScale: this.options.plasmaScale,
        uHighlightPower: this.options.highlightPower,
        uHighlightMix: this.options.highlightMix,
        uRotation: this.options.rotation || 0,
      }
    );

    this.gl.output(this.shader);
  }

  animate() {
    if (!this.isAnimating) return;

    if (this.options.useMousePosition && this.options.mousePosition) {
      // Use mouse position for desktop
      const beta = (this.options.mousePosition.y - 0.5) * 2; // -1 to 1
      const gamma = (this.options.mousePosition.x - 0.5) * 2; // -1 to 1

      this.shader.updateUniform("uBeta", beta);
      this.shader.updateUniform("uGamma", gamma);
    } else {
      // Use device orientation for mobile
      this.shader.updateUniform("uBeta", this.orientation.beta / 180);
      this.shader.updateUniform("uGamma", this.orientation.gamma / 90);
    }

    this.gl.render();
    requestAnimationFrame(() => this.animate());
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.animate();
  }

  stop() {
    this.isAnimating = false;
  }

  // Update options dynamically
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    if (this.shader) {
      if (newOptions.plasmaScale !== undefined) {
        this.shader.updateUniform("uPlasmaScale", newOptions.plasmaScale);
      }
      if (newOptions.highlightPower !== undefined) {
        this.shader.updateUniform("uHighlightPower", newOptions.highlightPower);
      }
      if (newOptions.highlightMix !== undefined) {
        this.shader.updateUniform("uHighlightMix", newOptions.highlightMix);
      }
      if (newOptions.rotation !== undefined) {
        this.shader.updateUniform("uRotation", newOptions.rotation);
      }
    }
  }

  // Destroy the sticker and clean up
  destroy() {
    this.stop();
    // Remove event listeners if needed
    // Clean up WebGL context if miniGL supports it
  }

  // Static method to create multiple stickers easily
  static createSticker(selector, options) {
    return new IridescentSticker(selector, options);
  }

  // Static method to create stickers on all matching elements
  static createMultiple(selector, options) {
    const elements = document.querySelectorAll(selector);
    return Array.from(elements).map((el) => new IridescentSticker(el, options));
  }
}

export default IridescentSticker;
