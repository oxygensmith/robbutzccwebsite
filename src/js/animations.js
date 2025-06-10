// ===============================
// GSAP ANIMATION SYSTEM - v7.0
// Intended refactor: New simplified SAY HELLO animation.
// This file, after initializing GSAP and its plugins,
// begins with utility functions for text splitting, and
// other functions multiple animations are based on.
// We then define individual animations. We are always
// looking for opporunities to simplify the animation code
// itself and make what is happening in them more readable
// and reusable functions more reusable.
// ===============================

// import SVG definitions from external file
import { doOverSVG, sayHelloSVG, handDrawnCircleSVG, handDrawnCircleFilledSVG, handDrawnCircleFilledWithLettersSVG } from './svg-definitions.js';

// GSAP modules
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

// Lottie for Lottie animations
import lottie from 'lottie-web';
import myAnimation from '../public/animations/my-animation.json';

// ===============================
// UTILITY FUNCTIONS SECTION
// ===============================

/**
 * Splits text using GSAP's SplitText plugin with optional space preservation
 * @param {HTMLElement} element - Element containing text to split
 * @param {Object} options - Configuration options
 * @returns {Array} Array of character elements
 */
const splitTextIntoChars = (element, options = {}) => {
    const {
        type = "chars",
        initialOpacity = 0,
        charClass = "char",
        preserveSpaces = false
    } = options;

    // console.log('Before split - element text:', element.textContent);
    // console.log('Before split - element HTML:', element.innerHTML);
    
    if (!preserveSpaces) {
        // Use SplitText normally
        const split = new SplitText(element, { 
            type,
            charsClass: charClass || undefined
        });

        // console.log('After split - chars array:', split.chars);
        
        // Set initial opacity if specified
        if (initialOpacity !== 1) {
            gsap.set(split.chars, { opacity: initialOpacity });
        }
        
        return split.chars;
    } else {
        // Manual splitting to preserve spaces
        const originalText = element.textContent;
        const chars = [];
        
        // Clear the element
        element.innerHTML = '';
        
        // Create spans for each character, including spaces
        for (let i = 0; i < originalText.length; i++) {
            const char = originalText[i];
            const span = document.createElement('span');
            
            if (char === ' ') {
                span.className = 'space';
                span.innerHTML = '&nbsp;'; // Use non-breaking space to maintain width
            } else {
                span.className = charClass;
                span.textContent = char;
            }
            
            element.appendChild(span);
            chars.push(span);
        }
        
        // console.log('After manual split - chars array:', chars);
        
        // Set initial opacity if specified
        if (initialOpacity !== 1) {
            gsap.set(chars, { opacity: initialOpacity });
        }
        
        return chars;
    }
};

/**
 * Extract and organize SVG groups into arrays for animation
 * @param {SVGElement} svg - SVG element to parse
 * @param {Object} options - Configuration options
 * @returns {Object} Organized groups data
 */
const parseSVGGroups = (svg, options = {}) => {
    const {
        letterSelector = '.letter',
        groupSelector = 'g > path',
        reverse = false
    } = options;
    
    const letters = Array.from(svg.querySelectorAll(letterSelector));
    if (reverse) letters.reverse();
    
    const groupsData = {
        letters: [],
        allElements: [],
        letterGroups: []
    };
    
    letters.forEach((letter, index) => {
        const elements = Array.from(letter.querySelectorAll(groupSelector));
        letter.dots = elements; // Store reference on letter for convenience
        
        groupsData.letters.push(letter);
        groupsData.letterGroups.push(elements);
        groupsData.allElements.push(...elements);
    });
    
    return groupsData;
};

/**
 * Creates a human-like typing animation with realistic timing and occasional typos
 * @param {Array} chars - Array of character elements to animate
 * @param {Object} options - Animation configuration
 * @returns {gsap.Timeline} GSAP timeline
 */
const createHumanTyping = (chars, options = {}) => {
    const {
        baseDelay = 0.03,
        delayVariation = 0.015,
        typoChance = 0.05,
        startTime = 0,
        duration = 0.025,
        onComplete = null
    } = options;
    
    const tl = gsap.timeline({ onComplete });
    let currentDelay = startTime;
    let hasTypo = false;
    
    chars.forEach((char, charIndex) => {
        const randomDelay = baseDelay + (Math.random() - 0.01) * delayVariation;
        currentDelay += randomDelay;
        
        // Occasionally add a typo and correction
        if (!hasTypo && Math.random() < typoChance && charIndex > 2 && charIndex < chars.length - 2) {
            hasTypo = true;
            
            // Show character
            tl.to(char, { opacity: 1, duration }, currentDelay);
            
            // Thinking pause
            currentDelay += 0.1 + Math.random() * 0.2;
            
            // Backspace effect
            tl.to([char, chars[charIndex - 1]], {
                opacity: 0,
                duration: 0.03,
                stagger: 0.05
            }, currentDelay);
            
            currentDelay += 0.15;
            
            // Retype previous character
            tl.to(chars[charIndex - 1], { opacity: 1, duration }, currentDelay);
            currentDelay += baseDelay;
            
            // Retype current character
            tl.to(char, { opacity: 1, duration }, currentDelay);
            currentDelay += 0.1 + Math.random() * 0.2;
            
        } else {
            // Normal character appearance
            tl.to(char, { opacity: 1, duration }, currentDelay);
            
            // Occasional thinking pauses
            if (Math.random() < 0.1) {
                currentDelay += 0.15 + Math.random() * 0.25;
            }
        }
    });
    
    return tl;
};

const createCleanTyping = (chars, options = {}) => {
    const {
        delay = 0.04,
        duration = 0.05,
        ease = "none",
        onComplete = null
    } = options;
    
    return gsap.to(chars, {
        opacity: 1,
        duration,
        stagger: delay,
        ease,
        onComplete
    });
};

/**
 * Creates a staggered reveal animation for multiple text versions with strikethrough
 * @param {Array} versions - Array of text version elements
 * @param {Object} options - Animation configuration
 * @returns {gsap.Timeline} GSAP timeline
 */
const createTextRevisions = (versions, options = {}) => {
    const {
        gapBetweenVersions = 0.5,
        strikethroughDuration = 0.5,
        fadeOutDuration = 0.3,
        typingOptions = {}, // New parameter for typing settings
        onComplete = null
    } = options;

    // console.log('Text versions received:', versions.length);
    
    // Setup positioning (same as before)
    versions.forEach((version, index) => {
        // console.log(`Version ${index} original text:`, version.textContent);
        version.style.position = 'absolute';
        version.style.top = '0';
        version.style.left = '0';
        version.style.width = '100%';
        
        const chars = splitTextIntoChars(version);
        // console.log(`Version ${index} chars created:`, chars.length);
        // console.log(`Version ${index} chars:`, chars);
        
        // Add strikethrough for non-final versions
        if (index < versions.length - 1) {
            // console.log(`Adding strikethrough for version ${index}`);
            version.style.width = 'auto';
            const textWidth = version.offsetWidth;
            // console.log(`Text width for version ${index}:`, textWidth);
            version.style.width = '100%';
            
            const strikeEl = document.createElement('div');
            strikeEl.className = 'strike-through';
            strikeEl.style.cssText = `
                position: absolute;
                top: 50%;
                left: 0;
                width: ${textWidth}px;
                height: 2px;
                background-color: currentColor;
                transform: scaleX(0);
                transform-origin: left center;
                pointer-events: none;
            `;
            version.appendChild(strikeEl);
        }
    });
    
    const tl = gsap.timeline({ onComplete });
    let nextStartTime = 0;
    
    versions.forEach((version, index) => {
        const chars = version.querySelectorAll('.char');
        const isLast = index === versions.length - 1;
        const strikeEl = version.querySelector('.strike-through');
        
        // Show version container
        tl.set(version, { opacity: 1 }, nextStartTime);
        
        // Create typing animation with passed options
        const typingTl = createHumanTyping(chars, { 
            startTime: 0,
            ...typingOptions // Spread the typing options here
        });
        tl.add(typingTl, nextStartTime);
        
        // Calculate when typing ends
        const typingEndTime = nextStartTime + typingTl.duration();
        
        if (!isLast && strikeEl) {
            // Strike-through and fade out
            tl.to(strikeEl, {
                scaleX: 1,
                duration: strikethroughDuration,
                ease: "power2.inOut"
            }, typingEndTime + 0.3);
            
            tl.to(version, {
                opacity: 0,
                duration: fadeOutDuration
            }, typingEndTime + 1.7);
            
            nextStartTime = typingEndTime + 2.0 + gapBetweenVersions;
        } else {
            nextStartTime = typingEndTime;
        }
    });
    
    return tl;
};

/**
 * Creates a parallax scroll effect for multiple elements
 * @param {Array} elements - Elements to animate
 * @param {Object} options - Animation configuration
 * @returns {Array} Array of ScrollTrigger instances
 */
const createParallaxScroll = (elements, options = {}) => {
    const {
        trigger,
        start = "bottom 50%",
        end = "bottom top",
        speeds = [-2.0],
        opacityStart = 1,
        opacityThreshold = 0.3,
        opacityMin = 0.5,
        easing = "power2.out"
    } = options;
    
    const scrollTriggers = [];
    
    elements.forEach((element, index) => {
        const speed = speeds[index] || speeds[0] || -2.0;
        
        const st = ScrollTrigger.create({
            trigger,
            start,
            end,
            scrub: 1,
            onUpdate: (self) => {
                const easedProgress = gsap.parseEase(easing)(self.progress);
                const yOffset = easedProgress * speed * 100;
                
                let opacity;
                if (self.progress <= opacityThreshold) {
                    opacity = opacityStart - (self.progress / opacityThreshold) * (opacityStart - opacityMin);
                } else {
                    opacity = opacityMin;
                }
                
                gsap.set(element, {
                    y: yOffset,
                    opacity: opacity,
                    force3D: true
                });
            },
            onRefresh: () => gsap.set(element, { y: 0, opacity: opacityStart }),
            onToggle: (self) => {
                if (!self.isActive) {
                    gsap.set(element, { y: 0, opacity: opacityStart });
                }
            }
        });
        
        scrollTriggers.push(st);
    });
    
    return scrollTriggers;
};

function startBobbingAnimation(element, config) {
    // Create infinite bobbing animation
    gsap.to(element, {
        y: `+=${config.yMovement}`, // Move down relative to current position
        duration: config.duration,
        ease: config.ease,
        yoyo: true, // Reverse the animation
        repeat: -1, // Infinite repeat
        transformOrigin: "center center"
    });
}

// Add this import to animations.js
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

// Register the plugin
gsap.registerPlugin(DrawSVGPlugin);


/**
 * Creates a Lottie animation with ScrollTrigger integration
 * @param {Object} options - Configuration options
 * @returns {Object} Lottie animation instance
 */
const createLottieScrollAnimation = (options = {}) => {
    const {
        containerId,
        animationPath,
        trigger = null, // Use container as trigger if not specified
        start = "top 80%",
        end = "bottom 20%",
        scrub = false,
        loop = false,
        autoplay = false,
        renderer = 'svg',
        fadeIn = true,
        onEnterCallback = null,
        onLeaveCallback = null
    } = options;

    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return null;
    }

    const animation = lottie.loadAnimation({
        container,
        renderer,
        loop,
        autoplay,
        path: animationPath
    });

    animation.addEventListener('complete', () => {
        const scrollTriggerConfig = {
            trigger: trigger || container,
            start,
            end,
            
            onEnter: () => {
                if (fadeIn) {
                    gsap.to(container, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                }
                
                if (!scrub) animation.play();
                if (onEnterCallback) onEnterCallback(animation);
            },
            
            onLeave: () => {
                if (!scrub) animation.stop();
                if (onLeaveCallback) onLeaveCallback(animation);
            }
        };

        if (scrub) {
            scrollTriggerConfig.scrub = typeof scrub === 'number' ? scrub : 1;
            scrollTriggerConfig.onUpdate = (self) => {
                const frame = Math.round(self.progress * (animation.totalFrames - 1));
                animation.goToAndStop(frame, true);
            };
        }

        ScrollTrigger.create(scrollTriggerConfig);
    });

    return animation;
};

/**
 * Creates a clock/radial wipe reveal for an SVG, like a minute hand sweeping around
 * @param {string} pathSelector - CSS selector for the path element
 * @param {Object} options - Animation configuration
 * @returns {gsap.Timeline} GSAP timeline
 */
const createRadialWipeReveal = (pathSelector, options = {}) => {
    const {
        duration = 3,
        ease = "none",
        startAngle = -90, // Start at 12 o'clock
        endAngle = 270,   // Complete circle (270° from start = 360° total)
        onComplete = null,
        onStart = null
    } = options;

    // console.log('Starting radial wipe reveal for:', pathSelector);

    const path = document.querySelector(pathSelector);
    if (!path) {
        console.error(`Path element not found: ${pathSelector}`);
        return gsap.timeline();
    }

    const svg = path.closest('svg');
    const pathBounds = path.getBBox();
    const maskId = `radial-mask-${Date.now()}`;
    
    // Get center point and radius
    const centerX = pathBounds.x + pathBounds.width / 2;
    const centerY = pathBounds.y + pathBounds.height / 2;
    const radius = Math.max(pathBounds.width, pathBounds.height) / 2 + 50; // Extra padding
    
    // console.log('Center:', centerX, centerY, 'Radius:', radius);
    
    // Create defs if it doesn't exist
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.insertBefore(defs, svg.firstChild);
    }
    
    // Create mask
    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.id = maskId;
    
    // Black background (hidden)
    const background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    background.setAttribute("width", "100%");
    background.setAttribute("height", "100%");
    background.setAttribute("fill", "black");
    mask.appendChild(background);
    
    // White pie slice that will grow (visible area)
    const pieSlice = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pieSlice.setAttribute("fill", "white");
    pieSlice.id = `pie-slice-${Date.now()}`;
    
    mask.appendChild(pieSlice);
    defs.appendChild(mask);
    
    // Apply mask to the path
    path.style.mask = `url(#${maskId})`;
    
    // console.log('Mask applied');
    
    const tl = gsap.timeline({ 
        onComplete: () => {
            // console.log('Radial wipe complete, cleaning up');
            // Clean up when done
            path.style.mask = 'none';
            mask.remove();
            if (onComplete) onComplete();
        },
        onStart: () => {
            // console.log('Radial wipe started');
            if (onStart) onStart();
        }
    });

    // Animate the pie slice from 0° to desired angle
    tl.to({}, {
        duration,
        ease,
        onUpdate: function() {
            const progress = this.progress();
            const currentAngle = startAngle + (progress * (endAngle - startAngle));
            
            // Create pie slice path
            const startAngleRad = (startAngle * Math.PI) / 180;
            const currentAngleRad = (currentAngle * Math.PI) / 180;
            
            // Start point (12 o'clock)
            const startX = centerX + radius * Math.cos(startAngleRad);
            const startY = centerY + radius * Math.sin(startAngleRad);
            
            // Current point
            const endX = centerX + radius * Math.cos(currentAngleRad);
            const endY = centerY + radius * Math.sin(currentAngleRad);
            
            // Large arc flag (1 if angle > 180°)
            const largeArcFlag = (currentAngle - startAngle) > 180 ? 1 : 0;
            
            let pathData;
            if (progress === 0) {
                // Start with tiny slice to avoid empty path
                pathData = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 0,1 ${startX + 0.1},${startY} Z`;
            } else {
                pathData = `M ${centerX},${centerY} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;
            }
            
            pieSlice.setAttribute("d", pathData);
        }
    });

    return tl;
};



/**
 * Creates a staggered text reveal animation for letters inside the SVG
 * @param {SVGElement} svg - The SVG containing the text elements
 * @param {Object} options - Animation configuration
 * @returns {gsap.Timeline} GSAP timeline
 */
const createTextRevealAfterCircle = (svg, options = {}) => {
    const {
        delay = 0.1,
        stagger = 0.04,
        duration = 0.2,
        ease = "power2.out",
        letterSelector = 'g[class*="letter"]',
        groupSelector = 'path',
        reverse = false // New parameter to reverse letter order
    } = options;
    
    // console.log('Creating text reveal animation, reverse:', reverse);
    
    // Parse the text groups using the existing utility
    const groupsData = parseSVGGroups(svg, {
        letterSelector,
        groupSelector,
        reverse // Pass reverse to parseSVGGroups
    });
    
    // console.log('Found letter groups:', groupsData.letters.length);
    
    if (groupsData.letters.length === 0) {
        // console.warn('No letter groups found with selector:', letterSelector);
        return gsap.timeline();
    }
    
    // Set initial state - all letters invisible
    gsap.set(groupsData.letters, { opacity: 0 });
    
    // Create staggered reveal
    const tl = gsap.timeline();
    
    tl.to(groupsData.letters, {
        opacity: 1,
        duration,
        stagger,
        ease,
        delay
    });
    
    return tl;
};

// Function to initialize the hand-drawn circle animation
function initHandDrawnCircle(options = {}) {
    const {
        containerId = 'container-hand-circle',
        svgContent = handDrawnCircleFilledWithLettersSVG,
        pathSelector = '#hand-drawn-circle',
        triggerSelector = '#draw',
        animationConfig = {
            duration: 0.25,
            ease: "power1.inOut",
            startAngle: -122,  // Start at 11
            endAngle: 233  // most of circle (100% = 360-120 = 240)
        },
        textConfig = {
            delay: 0.0, // Pause after circle completes
            stagger: 0.02,
            duration: 0.1,
            ease: "power2.out",
            letterSelector: 'g[class*="letter"]', // Adjust based on the SVG structure
            groupSelector: 'path',
            reverse: true
        }
    } = options;

    // console.log('Initializing radial wipe circle with text reveal');

    return new Promise((resolve) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`SVG container (${containerId}) not found!`);
            resolve();
            return;
        }
        
        container.innerHTML = svgContent;
        const path = container.querySelector(pathSelector);
        const svg = container.querySelector('svg');
        
        if (!path) {
            console.error('Hand-drawn circle path not found!');
            resolve();
            return;
        }

        if (!svg) {
            console.error('SVG element not found!');
            resolve();
            return;
        }

        // Create the radial wipe animation for the circle
        const circleReveal = createRadialWipeReveal(pathSelector, {
            ...animationConfig
            // Remove onComplete from here since we'll handle it in the master timeline
        });

        // Create the text reveal animation
        const textReveal = createTextRevealAfterCircle(svg, textConfig);

        // Create master timeline that chains both animations
        const masterTimeline = gsap.timeline({
            onComplete: resolve
        });

        masterTimeline
            .add(circleReveal)
            .add(textReveal, `-=${textConfig.delay}`); // Start text with specified delay from circle end

        // Add ScrollTrigger to the master timeline
        ScrollTrigger.create({
            trigger: triggerSelector,
            start: "top 70%",
            end: "bottom 30%",
            toggleActions: "play none none reverse",
            animation: masterTimeline
        });
    });
}

// ===============================
// =LOTTIE ANIMATIONS
// ===============================

function initLottieAnimation() {
    const container = document.getElementById('my-lottie-container');
    if (!container) {
        // console.log('Lottie container not found');
        return;
    }

    try {
        const animation = lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: myAnimation
        });

        animation.addEventListener('DOMLoaded', () => {
            // console.log('Lottie animation loaded successfully');
            
            // OPTION A: Autoplay version (plays once when scrolled into view)
            ScrollTrigger.create({
                trigger: container,
                start: "top 80%",
                end: "bottom 20%",
                
                onEnter: () => {
                    // Fade in the container
                    gsap.to(container, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.6,
                        ease: "power2.out"
                    });
                    
                    // Play the animation
                    animation.play();
                },
                
                onLeave: () => {
                    animation.stop();
                },
                
                onEnterBack: () => {
                    animation.play();
                },
                
                onLeaveBack: () => {
                    gsap.to(container, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3
                    });
                    animation.stop();
                }
            });

            // OPTION B: Scrub version (uncomment this and comment out Option A when I  want scrubbing)
            /*
            ScrollTrigger.create({
                trigger: container,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                
                onUpdate: (self) => {
                    // Fade in the container based on progress
                    const opacity = Math.sin(self.progress * Math.PI);
                    gsap.set(container, { 
                        opacity: opacity,
                        scale: 0.8 + (opacity * 0.2) 
                    });
                    
                    // Scrub through animation frames
                    const frame = Math.round(self.progress * (animation.totalFrames - 1));
                    animation.goToAndStop(frame, true);
                }
            });
            */
        });

        return animation;
        
    } catch (error) {
        console.error('Failed to create Lottie animation:', error);
        return null;
    }
}


// ===============================
// =MAIN ANIMATION FUNCTIONS
// ===============================

function initTextRevisionAnimation() {
    return new Promise((resolve) => {
        const element = document.querySelector('.do-over-slug-animated');
        if (!element) {
            resolve();
            return;
        }
        
        const textVersions = Array.from(element.querySelectorAll('.text-version'));
        if (textVersions.length === 0) {
            resolve();
            return;
        }
        
        // Wait for fonts to load before splitting text
        document.fonts.ready.then(() => {
            // console.log('Fonts loaded, starting text revision animation');
            
            // Set up container positioning
            element.style.position = 'relative';
            textVersions.forEach(version => {
                version.style.visibility = 'visible';
                version.style.opacity = '1';
            });
            
            // Use the utility function with custom timing controls
            createTextRevisions(textVersions, {
                gapBetweenVersions: 0.15,
                strikethroughDuration: 0.15,
                fadeOutDuration: 0.1,
                typingOptions: {
                    baseDelay: 0.02,
                    delayVariation: 0.01,
                    typoChance: 0.05,
                    duration: 0.015
                },
                onComplete: resolve
            });
        });
    });
}


function setupScrollWatcher() {
    ScrollTrigger.create({
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        onUpdate: () => {
            const slugElement = document.querySelector('.new-website-slug-animated');
            const navbarElement = document.querySelector('.navbar-container');
            const targetElement = document.querySelector('.coming-soon-container');
            
            if (!slugElement || !navbarElement || !targetElement) return;
            
            const slugRect = slugElement.getBoundingClientRect();
            const navbarRect = navbarElement.getBoundingClientRect();
            
            const shouldReveal = slugRect.bottom <= navbarRect.bottom;
            
            if (shouldReveal && !targetElement.classList.contains('reveal')) {
                targetElement.classList.add('reveal');
            } else if (!shouldReveal && targetElement.classList.contains('reveal')) {
                targetElement.classList.remove('reveal');
            }
        }
    });
}

/**
 * Creates an odometer-style rolling text effect
 * @param {Array} letters - Letter elements to animate
 * @param {HTMLElement} arrow - Arrow element (optional)
 * @param {Object} options - Animation options
 * @returns {gsap.Timeline} GSAP timeline
 */
const createRollingAnimation = (letters, arrow, options = {}) => {
    const {
        duration = 0.8,
        stagger = 0.08,
        ease = 'power2.inOut',
        direction = 'down',
        arrowBounce = true,
        arrowDistance = -5,
        arrowDelay = 0.2
    } = options;
    
    // Filter to only actual letters (not spaces)
    const actualLetters = letters.filter(letter => letter.classList.contains('letter'));
    
    // Setup: Create wrapper and duplicate for each letter (only once)
    actualLetters.forEach((letter, index) => {
        if (letter.dataset.setupComplete) return; // Skip if already setup
        
        const originalContent = letter.textContent;
        
        // Measure the natural width of this letter
        const tempSpan = document.createElement('span');
        tempSpan.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
            letter-spacing: inherit;
        `;
        tempSpan.textContent = originalContent;
        letter.parentNode.appendChild(tempSpan);
        const letterWidth = tempSpan.offsetWidth;
        tempSpan.remove();
        
        // Add some padding to prevent squishing
        const wrapperWidth = Math.max(letterWidth * 1.1, 16); // At least 16px or 110% of natural width
        
        // Create wrapper with overflow hidden
        const wrapper = document.createElement('div');
        wrapper.className = 'letter-wrapper';
        wrapper.style.cssText = `
            overflow: hidden;
            display: inline-block;
            height: 1.2em;
            line-height: 1.2;
            vertical-align: baseline;
            position: relative;
            width: ${wrapperWidth}px;
        `;
        
        // Insert wrapper and move letter into it
        letter.parentNode.insertBefore(wrapper, letter);
        wrapper.appendChild(letter);
        
        // Create duplicate letter
        const duplicate = letter.cloneNode(true);
        duplicate.className = 'letter-duplicate';
        
        // Style both letters with identical positioning
        const letterStyles = `
            display: block;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            margin: 0 auto;
            white-space: nowrap;
            text-align: center;
        `;
        
        letter.style.cssText += letterStyles;
        duplicate.style.cssText += letterStyles;
        
        // Explicitly set initial transforms
        gsap.set(letter, { 
            y: 0,
            x: 0,
            xPercent: 0,
            yPercent: 0
        });
        gsap.set(duplicate, { 
            y: direction === 'up' ? '100%' : '-100%',
            x: 0,
            xPercent: 0,
            yPercent: 0
        });
        
        wrapper.appendChild(duplicate);
        
        // Store references
        letter.dataset.setupComplete = 'true';
        wrapper._originalLetter = letter;
        wrapper._duplicateLetter = duplicate;
    });
    
    // Create the animation timeline
    const tl = gsap.timeline();
    
    // Animate each letter with stagger
    actualLetters.forEach((letter, index) => {
        const wrapper = letter.parentNode;
        const original = wrapper._originalLetter;
        const duplicate = wrapper._duplicateLetter;
        
        // Calculate delay for this letter
        const delay = index * stagger;
        
        // Roll original letter out and duplicate letter in
        tl.to(original, {
            y: direction === 'up' ? '-100%' : '100%',
            duration: duration,
            ease: ease
        }, delay)
        .to(duplicate, {
            y: '0%',
            duration: duration,
            ease: ease,
            onComplete: () => {
                // Reset both letters to proper positions for next cycle
                gsap.set(original, { y: direction === 'up' ? '100%' : '-100%' });
                gsap.set(duplicate, { y: '0%' });
                
                // Swap references for next animation
                wrapper._originalLetter = duplicate;
                wrapper._duplicateLetter = original;
            }
        }, delay);
    });
    
    // Arrow bounce animation
    if (arrowBounce && arrow) {
        tl.to(arrow, {
            y: arrowDistance,
            duration: 0.3,
            ease: 'power2.out'
        }, arrowDelay)
        .to(arrow, {
            y: 0,
            duration: 0.3,
            ease: 'power2.inOut'
        }, arrowDelay + 0.3);
    }
    
    return tl;
};

// ===============================
// INK REVEAL EFFECT
// ===============================

/**
 * Creates an ink reveal effect for a specific section
 * @param {string|HTMLElement} target - Section selector or element
 * @param {Object} options - Configuration options
 * @returns {Object} Cleanup functions and references
 */
function createInkReveal(target, options = {}) {
    const {
        svgPath = "M548.67,900C527.641,908.715 513.869,916.818 509.066,919.644C487.088,932.575 407.197,943.89 378.042,939.214C375.639,938.829 377.46,933.261 375.144,932.511C363.236,928.656 71.706,967.465 26.222,944.277C4.448,933.177 -10.224,923.634 5.136,876.019L2.808,881.019C26.436,791.464 20.934,735.099 161.675,711.167C265.785,693.465 255.574,514.636 395.12,505.839C599.123,492.98 542.429,396.232 604.324,331.331C692.041,239.355 708.642,268.664 824.535,254.894C932.903,242.018 964.31,102.967 1099.68,43.214C1179.09,8.166 1254.87,-7.763 1272.82,0L3600,0L3600,900L548.67,900Z", // Use original blob path
        movementType = 'linear', // 'linear', 'sway'
        direction = 'left-to-right',
        morphConfig = {
            scale: { from: 1, to: 1.1 },
            duration: 4,
            ease: 'sine.inOut'
        },
        scrollConfig = {
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
        },
        swayConfig = {
            amplitude: 20,
            frequency: 2
        }
    } = options;

    const section = typeof target === 'string' ? document.querySelector(target) : target;
    if (!section) {
        console.error('Ink reveal target section not found:', target);
        return null;
    }

    // Check if this section already has an ink reveal
    if (section.querySelector('.ink-blob-container')) {
        console.warn('Section already has ink reveal:', target);
        return null;
    }

    // Create blob container for this section
    const blobContainer = document.createElement('div');
    blobContainer.className = 'ink-blob-container';
    
    // Create the SVG with the blob path
    const svgContent = `
        <svg class="ink-blob-svg" viewBox="0 0 3600 900" xmlns="http://www.w3.org/2000/svg">
            <path class="ink-blob-path" d="${svgPath}" />
        </svg>
    `;
    
    blobContainer.innerHTML = svgContent;
    const blobPath = blobContainer.querySelector('.ink-blob-path');
    
    if (!blobPath) {
        console.error('No path found in SVG content');
        return null;
    }

    // Add container to section
    section.appendChild(blobContainer);
    
    // Ensure section has relative positioning for absolute blob
    const sectionStyle = getComputedStyle(section);
    if (sectionStyle.position === 'static') {
        section.style.position = 'relative';
    }

    // Set initial position based on direction
    const getInitialPosition = () => {
        switch (direction) {
            case 'left-to-right':
                return { x: '-100%', y: '0%' };
            case 'right-to-left':
                return { x: '100%', y: '0%' };
            default:
                return { x: '-100%', y: '0%' };
        }
    };

    const getEndPosition = () => {
        switch (direction) {
            case 'left-to-right':
                return { x: '100%', y: '0%' };
            case 'right-to-left':
                return { x: '-100%', y: '0%' };
            default:
                return { x: '100%', y: '0%' };
        }
    };

    // Set initial position
    const initialPos = getInitialPosition();
    gsap.set(blobContainer, initialPos);

    // Create morphing animation
    const morphTl = gsap.to(blobPath, {
        scale: morphConfig.scale.to,
        duration: morphConfig.duration,
        repeat: -1,
        yoyo: true,
        ease: morphConfig.ease,
        transformOrigin: 'center center'
    });

    // Create movement animation
    const endPos = getEndPosition();
    let movementAnimation;

    if (movementType === 'sway') {
        // Sway movement
        movementAnimation = gsap.to(blobContainer, {
            x: endPos.x,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: scrollConfig.start,
                end: scrollConfig.end,
                scrub: scrollConfig.scrub,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const swayY = Math.sin(progress * Math.PI * swayConfig.frequency) * swayConfig.amplitude;
                    gsap.set(blobContainer, {
                        y: swayY + 'px'
                    });
                }
            }
        });
    } else {
        // Linear movement
        movementAnimation = gsap.to(blobContainer, {
            x: endPos.x,
            y: endPos.y,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: scrollConfig.start,
                end: scrollConfig.end,
                scrub: scrollConfig.scrub
            }
        });
    }

    // console.log('✅ Ink reveal created for section:', target);

    // Return cleanup object
    return {
        container: blobContainer,
        morphAnimation: morphTl,
        movementAnimation: movementAnimation,
        destroy: () => {
            morphTl.kill();
            if (movementAnimation.scrollTrigger) {
                movementAnimation.scrollTrigger.kill();
            }
            movementAnimation.kill();
            blobContainer.remove();
        }
    };
}

// ===============================
// INDIVIDUAL ANIMATIONS
// ===============================

/**
 * Initialize ink reveal effects for specific sections
 */
// Global variable to prevent multiple initializations
let inkRevealsInitialized = false;

/**
 * Initialize ink reveal effects for specific sections
 */
function initInkRevealEffects() {
    if (inkRevealsInitialized) {
        // console.log('Ink reveals already initialized, skipping...');
        return [];
    }

    const inkReveals = [];

    // About section - left to right linear movement
    const aboutReveal = createInkReveal('#about', {
        movementType: 'linear',
        direction: 'left-to-right',
        scrollConfig: {
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: 1
        }
    });
    if (aboutReveal) inkReveals.push(aboutReveal);

    // Services section - sway movement
    /* const servicesReveal = createInkReveal('#services', {
        movementType: 'sway',
        direction: 'left-to-right',
        swayConfig: {
            amplitude: 30,
            frequency: 1.5
        },
        scrollConfig: {
            start: 'top 90%',
            end: 'bottom 10%',
            scrub: 1
        }
    });
    if (servicesReveal) inkReveals.push(servicesReveal); */

    inkRevealsInitialized = true;
    return inkReveals;
}

// Updated init function with better restart handling
function initScrollDownAnimation() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    const textContainer = scrollIndicator?.querySelector('.text-container');
    const arrow = scrollIndicator?.querySelector('.down-arrow');
    
    if (!textContainer || !arrow) return;
    
    // Reveal the scroll indicator
    gsap.to(scrollIndicator, {
        opacity: 1,
        x: 0,
        duration: 0.5,
        ease: "power2.out"
    });

    // Use utility to split text into letter spans
    const letters = splitTextIntoChars(textContainer, {
        charClass: 'letter',
        preserveSpaces: true,
        initialOpacity: 1
    });
    
    // Post-process to add data attributes and fix classes
    letters.forEach((letterElement) => {
        const char = letterElement.textContent;
        if (char === ' ' || char.trim() === '') {
            letterElement.className = 'space';
        } else {
            letterElement.setAttribute('data-letter', char);
            letterElement.className = 'letter'; // Ensure it has the letter class
        }
    });
    
    // Create the rolling animation
    const createAnimation = () => createRollingAnimation(letters, arrow, {
        direction: 'down',
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.inOut',
        arrowBounce: true,
        arrowDistance: -5
    });
    
    // Initial animation
    let currentAnimation = createAnimation();
    
    // Set up repeating animation with proper cleanup
    const startRepeatingAnimation = () => {
        setInterval(() => {
            // Kill any existing animation
            if (currentAnimation) {
                currentAnimation.kill();
            }
            
            // Create and play new animation
            currentAnimation = createAnimation();
            currentAnimation.play();
        }, 3000);
    };
    
    // Start the cycle after initial delay
    setTimeout(startRepeatingAnimation, 1000);
}

// Updated main animation function with configurable options
function initDoOverAnimation(options = {}) {
    const {
        containerId = 'container-do-over',
        svgContent = doOverSVG,
        parallaxSpeeds = [-0.5, -0.8, -1.2, -0.4, -1.2, -0.8, -1.1, -1.5, -0.5, -1.2, -1.0],
        fadeConfig = {
            duration: 0.5,
            stagger: 0.1,
            delay: 0.3
        },
        parallaxConfig = {
            start: "bottom 70%",
            end: "bottom top",
            opacityStart: 1,
            opacityThreshold: 0.3,
            opacityMin: 0.5,
            easing: "power2.out"
        },
        parseConfig = {
            letterSelector: 'g > g',
            groupSelector: 'path',
            reverse: false
        }
    } = options;

    return new Promise((resolve) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`SVG container (${containerId}) not found!`);
            resolve();
            return;
        }
        
        // Insert SVG
        container.innerHTML = svgContent;
        const svg = container.querySelector('svg');
        if (!svg) {
            console.error('SVG not found after insertion!');
            resolve();
            return;
        }
        
        // Parse SVG structure using utility
        const groupsData = parseSVGGroups(svg, parseConfig);
        const letters = groupsData.letters;
        
        // Initial fade-in animation
        gsap.set(letters, { opacity: 0 });
        
        gsap.to(letters, {
            opacity: 1,
            duration: fadeConfig.duration,
            stagger: fadeConfig.stagger,
            delay: fadeConfig.delay,
            onComplete: () => {
                setupDoOverParallax(letters, container, parallaxSpeeds, parallaxConfig);
            }
        });

        // Resolve when animation setup is complete
        const totalAnimationTime = fadeConfig.delay + fadeConfig.duration + (letters.length * fadeConfig.stagger);
        gsap.delayedCall(totalAnimationTime + 0, () => {
            resolve();
        });
    });
}

function setupDoOverParallax(letters, container, speeds, config = {}) {
    // Use provided speeds or fallback to default
    const parallaxSpeeds = speeds || [-0.5, -0.8, -1.2, -0.4, -1.2, -0.8, -1.1, -1.5, -0.5, -1.2, -1.0];
    
    // Use utility function for parallax with passed configuration
    createParallaxScroll(letters, {
        trigger: container,
        speeds: parallaxSpeeds,
        ...config
    });
}

function initNewWebsiteAnimation() {
    return new Promise((resolve) => {
        const element = document.querySelector('.new-website-slug-animated');
        if (!element) {
            resolve();
            return;
        }
        
        // Make element visible
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        
        // Split text using utility
        const chars = splitTextIntoChars(element);
        
        // Clean, consistent typewriter effect
        createCleanTyping(chars, {
            delay: 0.005,
            duration: 0.05,
            onComplete: () => {
                setupScrollWatcher();
                resolve();
            }
        }).delay(0.25);
    });
}

// Say Hello vertical bookend animation - mirrors the masthead DO-OVER effect
function initSayHelloAnimation(options = {}) {
    const {
        containerId = 'container-say-hello',
        svgContent = sayHelloSVG,
        triggerSelector = '#contact',
        parseConfig = {
            letterSelector: 'g[id]', // Select g elements with ID attributes (S1, A1, Y1, etc.)
            groupSelector: 'path',
            reverse: false
        },
        // Vertical scatter distances for each letter (mirrors masthead speeds but as positions)
        verticalScatter = [240, 1600, 1300, 820, 1280, 2080, 220, 890], // Y offsets for S-A-Y H-E-L-L-O
        convergenceConfig = {
            duration: 1.5,
            stagger: 0,
            ease: "power2.out",
            opacityStart: 0,  // Start faded
            opacityEnd: 0.6     // End bright
        },
        scrollTriggerConfig = {
            start: "top 60%",
            end: "top 30%",
            scrub: 1, // Smooth scrubbing like the masthead
            toggleActions: "play none none reverse"
        }
    } = options;

    return new Promise((resolve) => {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`SVG container (${containerId}) not found!`);
            resolve();
            return;
        }
        
        // Insert SVG
        container.innerHTML = svgContent;
        const svg = container.querySelector('svg');
        if (!svg) {
            console.error('SVG not found after insertion!');
            resolve();
            return;
        }
        
        // Parse SVG structure using existing utility
        const groupsData = parseSVGGroups(svg, parseConfig);
        const letters = groupsData.letters;
        
        // Create the convergence animation using gsap.from() - pure vertical movement
        gsap.fromTo(letters, {
            // From (starting-state - below baseline)
            y: (index) => verticalScatter[index] || 100,
            opacity: convergenceConfig.opacityStart,
        },    
        // TO (ending state - above baseline) 
        {
            y: 0, // move all letters slightly above baseline?
            opacity: convergenceConfig.opacityEnd,
            // Animation properties
            duration: convergenceConfig.duration,
            stagger: convergenceConfig.stagger,
            ease: convergenceConfig.ease,
            
            // ScrollTrigger integration - mirrors the masthead behavior
            scrollTrigger: {
                trigger: triggerSelector,
                start: scrollTriggerConfig.start,
                end: scrollTriggerConfig.end,
                scrub: scrollTriggerConfig.scrub, // Smooth scrubbing
                toggleActions: scrollTriggerConfig.toggleActions,
                
                onComplete: () => {
                    // console.log('Say Hello vertical convergence complete');
                    resolve();
                },
                onReverseComplete: () => {
                    // console.log('Say Hello animation reversed');
                }
            }
        });
        
        // Fallback resolve
        gsap.delayedCall(convergenceConfig.duration + (convergenceConfig.stagger * letters.length) + 0.5, () => {
            resolve();
        });
    });
}



function initFooterSlideUp() {
    const footer = document.getElementById('footer');
    if (!footer) {
        console.error('Footer element not found!');
        return;
    }

    // Get the footer's height for the animation
    const footerHeight = footer.offsetHeight;

    ScrollTrigger.create({
        trigger: "#contact",
        start: "top 80%", // When 20% of contact is visible from bottom
        end: "bottom bottom",
        onEnter: () => {
            // Animate footer sliding up from below
            gsap.set(footer, {
                position: 'fixed',
                bottom: -footerHeight, // Start below viewport
                left: 0,
                width: '100%'
            });
            
            gsap.to(footer, {
                bottom: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        },
        /* onLeave: () => {
            // Optional: hide footer when scrolling past
            gsap.to(footer, {
                bottom: -footerHeight,
                duration: 0.5,
                ease: "power2.in"
            });
        }, */
        onEnterBack: () => {
            // Slide back up when scrolling back
            gsap.to(footer, {
                bottom: 0,
                duration: 0.5,
                ease: "power2.out"
            });
        },
        onLeaveBack: () => {
            // Return to static positioning when scrolling back up
            gsap.to(footer, {
                bottom: -footerHeight,
                duration: 0.5,
                ease: "power2.in",
                onComplete: () => {
                    gsap.set(footer, {
                        position: 'static',
                        bottom: 'auto',
                        left: 'auto',
                        width: 'auto'
                    });
                }
            });
        }
    });
}

function initEmailFloatingAnimation(options = {}) {
    const {
        emailSelector = '.email-floating',
        triggerSelector = '#contact',
        animationConfig = {
            duration: 1.5,
            delay: 0.3, // Slight delay after letters start
            ease: "power2.out",
            yOffset: 100, // How far below to start
            opacityStart: 0,
            opacityEnd: 1
        },
        bobbingConfig = {
            yMovement: 8, // How many pixels up and down
            duration: 2.5, // How long each bob cycle takes
            ease: "power1.inOut"
        },
        scrollTriggerConfig = {
            start: "top 60%",
            end: "top 30%",
            scrub: 1,
            toggleActions: "play none none reverse"
        }
    } = options;

    const emailElement = document.querySelector(emailSelector);
    if (!emailElement) {
        console.error('Email element not found!');
        return;
    }

    // Create the initial floating animation using gsap.from()
    gsap.from(emailElement, {
        y: animationConfig.yOffset, // Start below final position
        opacity: animationConfig.opacityStart,
        
        duration: animationConfig.duration,
        delay: animationConfig.delay,
        ease: animationConfig.ease,
        
        scrollTrigger: {
            trigger: triggerSelector,
            start: scrollTriggerConfig.start,
            end: scrollTriggerConfig.end,
            scrub: scrollTriggerConfig.scrub,
            toggleActions: scrollTriggerConfig.toggleActions,
            
            // Start bobbing when the initial animation completes
            onComplete: () => {
                startBobbingAnimation(emailElement, bobbingConfig);
            },
            
            // Stop bobbing when scrolling back out
            onReverseComplete: () => {
                gsap.killTweensOf(emailElement, "y");
            }
        }
    });
}


// ===============================
// INITIALIZATION
// ===============================

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // console.log('DOM fully loaded - initializing refactored animations');
    
    // Chain masthead animations
    initTextRevisionAnimation() // uncomment when I want this back
    // Promise.resolve() // comment when I want the textrevision animation back
        .then(() => {
            // console.log('Text revision complete - starting DO-OVER animation');
            return initDoOverAnimation();
        })
        .then(() => {
            // console.log('DO-OVER complete - starting new website animation');
            return initNewWebsiteAnimation();
        })
        .then(() => {
            // console.log('New website complete - starting scroll down animation');
            return initScrollDownAnimation();
        })
        .catch((error) => {
            // console.error('Masthead animation chain error:', error);
            // Fallback: still run DO-OVER even if other animations fail
            initDoOverAnimation();
        });
    
    // Initialize scroll-dependent animations independently with error handling
    try {
        initSayHelloAnimation();
        initEmailFloatingAnimation();
        // console.log('✅ Say Hello and email animations initialized');
    } catch (error) {
        console.error('❌ Say Hello or email animation error:', error);
    }

    try {
        initHandDrawnCircle();
    } catch (error) {
        console.error('❌ Hand-drawn circle animation error:', error);
    }
    
    // Initialize ink reveals only once
    try {
        const inkReveals = initInkRevealEffects();
        // console.log('✅ Section-specific ink reveal effects initialized:', inkReveals.length);
    } catch (error) {
        console.error('❌ Ink reveal effects error:', error);
    }

    // Lottie animation(s)
    /* try {
        initLottieAnimation();
        console.log('✅ Lottie animation initialized');
    } catch (error) {
        console.error('❌ Lottie animation error:', error);
    } */

    try {
        initFooterSlideUp();
        // console.log('✅ Footer slide-up animation initialized'); 
    } catch (error) {
        console.error('❌ Footer slide-up animation error:', error);
    }
    
    // console.log('All animations initialized with new utility system');
});