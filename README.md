# AI-Powered Futuristic Portfolio

An innovative, minimalistic, and futuristic interactive portfolio with AI features, glassmorphism design, and liquid glass effects.

## Features

### 🤖 AI Interactive Elements
- **Voice Interaction**: AI voice greets visitors and responds to profile image clicks
- **Smart Chatbot**: Ask questions about skills, experience, projects, and more
- **Intelligent Responses**: Context-aware AI responses that navigate to relevant sections

### 🎨 Design Features
- **Glassmorphism**: Modern glass-like UI with blur effects
- **Liquid Glass Effect**: Interactive mouse-tracking glass effects
- **Smooth Animations**: Fluid transitions and loading effects
- **Glowing Effects**: Dynamic glowing animations on interactions
- **Responsive Design**: Works perfectly on all devices (mobile, tablet, desktop)

### 📍 Smart Features
- **Real-time Location**: Displays visitor's location using Geolocation API
- **Live Clock**: Shows visitor's local time updated every second
- **CV Download**: Easy access to download resume
- **Floating Particles**: Animated AI-themed particles in the background

### 📑 Sections
1. **About**: Personal introduction and background
2. **Skills**: Technical skills with animated progress bars
3. **Experience**: Professional timeline with work history
4. **Projects**: Showcase of notable projects with tags
5. **Achievements**: Awards and certifications
6. **Contact**: Multiple ways to get in touch

## How to Use

### Setup
1. Open `index.html` in a modern web browser
2. Allow location access when prompted (optional)
3. Allow audio/speech permissions for AI voice (optional)

### Customization

#### Replace Profile Image
In `index.html`, line 35, replace the placeholder image:
```html
<img src="https://via.placeholder.com/300" alt="Md. Kawsar Ahmad" id="profileImage">
```
Change to:
```html
<img src="your-image.jpg" alt="Md. Kawsar Ahmad" id="profileImage">
```

#### Add Your CV
In `script.js`, uncomment and modify the CV download section (around line 245):
```javascript
const link = document.createElement('a');
link.href = 'path/to/your/cv.pdf';
link.download = 'Kawsar_Ahmad_CV.pdf';
link.click();
```

#### Update Content
Edit the HTML sections in `index.html`:
- About section (line 100)
- Skills section (line 110)
- Experience section (line 145)
- Projects section (line 175)
- Achievements section (line 210)
- Contact section (line 240)

#### Customize Colors
In `style.css`, modify the CSS variables (lines 8-14):
```css
:root {
    --primary-color: #00f0ff;      /* Cyan */
    --secondary-color: #7b2ff7;    /* Purple */
    --accent-color: #ff006e;       /* Pink */
    --glass-bg: rgba(255, 255, 255, 0.05);
    --glass-border: rgba(255, 255, 255, 0.1);
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
}
```

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Note**: AI voice feature requires browser support for Web Speech API (works best in Chrome/Edge)

## Technologies Used

- HTML5
- CSS3 (Glassmorphism, Animations)
- JavaScript (ES6+)
- Bootstrap 5.3.2
- Font Awesome 6.4.2
- Web Speech API
- Geolocation API

## Features Breakdown

### AI Voice System
- Automatically greets visitors on page load
- Plays voice message when profile image is clicked
- Uses browser's Text-to-Speech API
- Visual voice indicator with animated waves

### Interactive Chatbot
- Natural language processing for queries
- Keyword-based intelligent responses
- Auto-navigation to relevant sections
- Smooth message animations

### Glassmorphism Design
- Frosted glass effect with backdrop blur
- Semi-transparent backgrounds
- Subtle borders and shadows
- Layered depth perception

### Animations
- Rotating AI rings around profile
- Pulsing glow effects
- Floating particles
- Smooth section transitions
- Skill bar fill animations
- Hover effects on all interactive elements

## Performance

- Lightweight and fast loading
- Optimized animations
- Efficient particle system
- Smooth 60fps animations

## Accessibility

- Semantic HTML structure
- ARIA labels (can be enhanced)
- Keyboard navigation support
- Screen reader friendly (can be improved)

## Future Enhancements

- [ ] Add more AI capabilities
- [ ] Integrate with real AI API (OpenAI, etc.)
- [ ] Add dark/light theme toggle
- [ ] Add more interactive 3D effects
- [ ] Implement actual backend for contact form
- [ ] Add blog section
- [ ] Add testimonials section

## License

Free to use and modify for personal projects.

## Credits

Developed by **Md. Kawsar Ahmad**
Software Engineer | AI Enthusiast | Researcher

---

**Enjoy your futuristic AI portfolio! 🚀**

