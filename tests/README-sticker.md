# 🌈 IridescentSticker

A reusable JavaScript class that creates beautiful gyroscopic iridescent effects using WebGL shaders. Perfect for adding magical, holographic elements to any webpage!

## ✨ Features

- **Device-responsive**: Reacts to device orientation (gyroscope)
- **Customizable**: Adjustable plasma patterns and highlight effects
- **Lightweight**: Built on miniGL for minimal overhead
- **Reusable**: Drop into any HTML page as a component
- **Real-time controls**: Update effects dynamically

## 🚀 Quick Start

```javascript
import IridescentSticker from './IridescentSticker.js';

// Basic usage
const sticker = new IridescentSticker('#my-element');

// With custom options
const fancySticker = new IridescentSticker('#fancy-element', {
    plasmaScale: 3.0,
    highlightPower: 12.0,
    highlightMix: 0.4
});
```

## 📖 API Reference

### Constructor

```javascript
new IridescentSticker(selector, options)
```

**Parameters:**
- `selector` (string|Element): CSS selector or DOM element
- `options` (object): Configuration options

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `plasmaScale` | number | 2.0 | Scale of the plasma pattern (0.5-5.0) |
| `highlightPower` | number | 8.0 | Intensity of highlights (1-20) |
| `highlightMix` | number | 0.25 | Blend amount of highlights (0-1) |

### Methods

#### `updateOptions(newOptions)`
Update sticker settings in real-time:
```javascript
sticker.updateOptions({
    plasmaScale: 2.5,
    highlightPower: 10
});
```

#### `start()` / `stop()`
Control animation:
```javascript
sticker.stop();  // Pause animation
sticker.start(); // Resume animation
```

#### `destroy()`
Clean up and remove the sticker:
```javascript
sticker.destroy();
```

### Static Methods

#### `IridescentSticker.createSticker(selector, options)`
Factory method for creating a single sticker:
```javascript
const sticker = IridescentSticker.createSticker('.my-class', { plasmaScale: 3 });
```

#### `IridescentSticker.createMultiple(selector, options)`
Create stickers on multiple elements:
```javascript
const stickers = IridescentSticker.createMultiple('.sticker', { highlightPower: 15 });
```

## 🎯 Usage Examples

### Simple Card Effect
```html
<div class="card" id="holographic-card">
    <h3>Holographic Card</h3>
</div>

<script type="module">
import IridescentSticker from './IridescentSticker.js';
new IridescentSticker('#holographic-card');
</script>
```

### Multiple Stickers with Different Effects
```javascript
// Subtle effect for backgrounds
const background = new IridescentSticker('.bg', {
    plasmaScale: 1.0,
    highlightPower: 4.0,
    highlightMix: 0.1
});

// Intense effect for focal elements
const highlight = new IridescentSticker('.focal', {
    plasmaScale: 4.0,
    highlightPower: 20.0,
    highlightMix: 0.6
});
```

### Dynamic Control Panel
```javascript
const sticker = new IridescentSticker('#demo');

// Real-time controls
document.getElementById('intensity').addEventListener('input', (e) => {
    sticker.updateOptions({ highlightPower: e.target.value });
});
```

## 📱 Device Requirements

- **HTTPS required** for device orientation on mobile
- **WebGL support** (available in all modern browsers)
- **Device orientation sensors** for gyroscopic effects

## 🎨 Styling Tips

```css
.iridescent-sticker {
    border-radius: 20px; /* Rounded corners */
    overflow: hidden;    /* Clip shader to bounds */
    position: relative;  /* For overlay text */
}

.sticker-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;        /* Above the shader */
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
```

## 🔧 Dependencies

- `miniGL.js` - Lightweight WebGL wrapper (included)

## 📄 License

This project is open source. Feel free to use and modify! ✨ 