import miniGL from "./miniGL/miniGL.js";

const gl = new miniGL("#container", {
  z: -10,
});

// Device orientation tracking
let orientation = { alpha: 0, beta: 0, gamma: 0 };

// Create debug overlay
const createDebugOverlay = () => {
  const debug = document.createElement("div");
  debug.id = "debug";
  debug.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 10px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1001;
    max-width: 200px;
    word-wrap: break-word;
  `;
  document.body.appendChild(debug);
  return debug;
};

const debugOverlay = createDebugOverlay();

const updateDebug = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  debugOverlay.innerHTML += `<div>${timestamp}: ${message}</div>`;
  debugOverlay.scrollTop = debugOverlay.scrollHeight;
};

// Add live orientation values display
const liveValues = document.createElement("div");
liveValues.id = "liveValues";
liveValues.style.cssText = `
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0,128,0,0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  z-index: 1002;
`;
liveValues.innerHTML = "α:0.0 β:0.0 γ:0.0";
document.body.appendChild(liveValues);

// Request permission for iOS 13+ and Android
const requestPermission = async () => {
  try {
    updateDebug(`User agent: ${navigator.userAgent.slice(0, 50)}...`);
    updateDebug(`HTTPS: ${location.protocol === "https:"}`);

    // iOS 13+ permission
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      updateDebug("iOS device detected");
      const permission = await DeviceOrientationEvent.requestPermission();
      if (permission === "granted") {
        setupOrientationListener();
        updateDebug("iOS permission granted");
        return true;
      } else {
        updateDebug("iOS permission denied");
        return false;
      }
    } else {
      // Android and other browsers
      updateDebug("Android/other browser detected");

      // Check if running on HTTPS (required by most browsers)
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        updateDebug(
          "⚠️ HTTPS required for device orientation on most browsers"
        );
      }

      // Try navigator.permissions API first (Chrome Android)
      if ("permissions" in navigator) {
        try {
          const permission = await navigator.permissions.query({
            name: "accelerometer",
          });
          updateDebug(`Accelerometer permission: ${permission.state}`);
        } catch (e) {
          updateDebug("Accelerometer permission check failed");
        }
      }

      setupOrientationListener();
      return true;
    }
  } catch (error) {
    updateDebug(`Permission error: ${error.message}`);
    return false;
  }
};

const setupOrientationListener = () => {
  updateDebug("Setting up orientation listeners");

  // Add both deviceorientation and deviceorientationabsolute for Android
  const handleOrientation = (event) => {
    orientation.alpha = event.alpha || 0;
    orientation.beta = event.beta || 0;
    orientation.gamma = event.gamma || 0;

    // Update debug with live values
    document.getElementById(
      "liveValues"
    ).innerHTML = `α:${orientation.alpha.toFixed(
      1
    )} β:${orientation.beta.toFixed(1)} γ:${orientation.gamma.toFixed(1)}`;
  };

  window.addEventListener("deviceorientation", handleOrientation);
  window.addEventListener("deviceorientationabsolute", handleOrientation);
  updateDebug("Listeners added");
};

// Create button for user gesture (required by many browsers)
const createPermissionButton = () => {
  updateDebug("Creating permission button");

  const button = document.createElement("button");
  button.textContent = "Enable Motion";
  button.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1010;
    padding: 20px 30px;
    background: #007AFF;
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 6px 12px rgba(0,0,0,0.4);
    min-width: 200px;
    text-align: center;
  `;

  button.onclick = async () => {
    updateDebug("Permission button clicked");
    button.textContent = "Requesting...";
    button.disabled = true;

    const success = await requestPermission();
    if (success) {
      updateDebug("Permission successful, removing button");
      button.remove();
    } else {
      updateDebug("Permission failed");
      button.textContent = "Try Again";
      button.disabled = false;
    }
  };

  // Add to the main container, not body
  const container = document.querySelector(".main");
  if (container) {
    container.appendChild(button);
  } else {
    document.body.appendChild(button);
  }
};

// Initialize orientation
updateDebug("Initializing orientation system");

if (window.DeviceOrientationEvent) {
  updateDebug("DeviceOrientationEvent supported");

  // Try direct setup first
  const testListener = (event) => {
    updateDebug(
      `Test event: α:${event.alpha} β:${event.beta} γ:${event.gamma}`
    );

    if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
      // Orientation is working, remove test listener
      window.removeEventListener("deviceorientation", testListener);
      updateDebug("Orientation data detected, requesting permission");
      requestPermission();
    } else {
      updateDebug("No orientation data, will show button");
      createPermissionButton();
    }
  };

  window.addEventListener("deviceorientation", testListener);

  // Fallback: show button after 3 seconds if no orientation data
  setTimeout(() => {
    window.removeEventListener("deviceorientation", testListener);
    if (
      orientation.alpha === 0 &&
      orientation.beta === 0 &&
      orientation.gamma === 0
    ) {
      updateDebug("Timeout reached, showing permission button");
      createPermissionButton();
    }
  }, 3000);
} else {
  updateDebug("DeviceOrientationEvent NOT supported - showing button anyway");
  createPermissionButton();
}

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

    vec3 SpectrumPoly(float x) {
    // https://www.shadertoy.com/view/wlSBzD
    return (vec3( 1.220023e0,-1.933277e0, 1.623776e0)
          +(vec3(-2.965000e1, 6.806567e1,-3.606269e1)
          +(vec3( 5.451365e2,-7.921759e2, 6.966892e2)
          +(vec3(-4.121053e3, 4.432167e3,-4.463157e3)
          +(vec3( 1.501655e4,-1.264621e4, 1.375260e4)
          +(vec3(-2.904744e4, 1.969591e4,-2.330431e4)
          +(vec3( 3.068214e4,-1.698411e4, 2.229810e4)
          +(vec3(-1.675434e4, 7.594470e3,-1.131826e4)
          + vec3( 3.707437e3,-1.366175e3, 2.372779e3)
            *x)*x)*x)*x)*x)*x)*x)*x)*x;
}


    vec3 plasma(vec2 uv ){
         uv *= 6.;
        float t = glTime * 0.00;
        float f = sin(uv.x + sin(2.0*uv.y + t)) +
              sin(length(uv)+t) +
              0.5*sin(uv.x*2.5+t);
        return irri(f*.5+.5)*.5+.5;
    }


    const float PI = ${Math.PI};
    void main() {
      float x = mix(glUV.x, 1.-glUV.x, smoothstep(-.5,0.5,uGamma));
      float y = mix(glUV.y, 1.-glUV.y, uBeta);


      vec2 center = vec2(x,y);
      vec3 color = plasma(glUV-center);
      float betaRad = uBeta;
      float gammaRad = uGamma;
      fragColor = vec4(color,1.);
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
  test.updateUniform("uBeta", (orientation.beta / 180) * 2 - 1);
  test.updateUniform("uGamma", orientation.gamma / 90);

  gl.render();
  requestAnimationFrame(animate);
};
animate();
