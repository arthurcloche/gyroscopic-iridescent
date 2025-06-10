import miniGL from "./miniGL/miniGL.js";

const gl = new miniGL("#container", {
  z: -10,
});

// Device orientation tracking
let orientation = { alpha: 0, beta: 0, gamma: 0 };

const setupOrientationListener = () => {
  // Add both deviceorientation and deviceorientationabsolute for Android
  const handleOrientation = (event) => {
    orientation.alpha = event.alpha || 0;
    orientation.beta = event.beta || 0;
    orientation.gamma = event.gamma || 0;
  };

  window.addEventListener("deviceorientation", handleOrientation);
  window.addEventListener("deviceorientationabsolute", handleOrientation);
};

const test = gl.shader(
  `#version 300 es
    precision highp float;
    uniform float glTime;
    uniform float uAlpha;
    uniform float uBeta;
    uniform float uGamma;
    // uniform sampler2D uTexture;
    in vec2 glUV;
    uniform vec3 glMouse;
    
    out vec4 fragColor;

    vec3 irri(float x){
        vec3 a = vec3(0.5);
        vec3 b = vec3(0.5);
        vec3 c = vec3(1.);
        vec3 d = vec3(0.,0.334,0.667);
        return a + b * cos( 6.28318 * ( c * x + d ));
    }

    vec3 plasma(vec2 uv ){
         uv *= 2.;
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
    // uv += .5;


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

    const float PI = ${Math.PI};
    void main() {
      float x = mix(glUV.x, 1.-glUV.x, uGamma);
      float y = mix(glUV.y, 1.-glUV.y, uBeta);
      vec2 center = vec2(x,y);
      float hilit = hilits(glUV, uGamma, uBeta, center);
      
      
      vec3 color = plasma(glUV-center);
      vec3 m = mix(color, color *.75+.25, pow(hilit,8.));
      vec3 render = clamp(m, vec3(0.), vec3(1.));
      render = pow(render, vec3(1.0/2.2)); // gamma correction
      fragColor = vec4(render,1.);
    }
  `,
  {
    uAlpha: 0,
    uBeta: 0,
    uGamma: 0,
  }
);

gl.output(test);
const animate = () => {
  test.updateUniform("uBeta", orientation.beta / 180);
  test.updateUniform("uGamma", orientation.gamma / 90);

  gl.render();
  requestAnimationFrame(animate);
};
setupOrientationListener();
animate();
