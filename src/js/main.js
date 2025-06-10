// ==========================================
// MAIN.js - this file contains sitewide 
// Javascript functionality that does not
// rely on GSAP, such as smooth scrolling
// mobile menu toggling, and scrollSpy
// functionality. It is loaded before the GSAP
// animation to ensure that basic DOM interactions
// are ready. 
// ==========================================

const remToPx = (remValue = 1) => {
  return remValue * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

// Smooth scroll initialization
const initSmoothScroll = () => {
    const DEFAULT_DURATION = 1500;
    const smoothScroll = (targetId, duration = DEFAULT_DURATION) => {
        const target = document.querySelector(targetId);
        if (!target) return;
        
        // Calculate offset: navbar height + 2rem
        const navbar = document.querySelector('#mainNav');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        const offset = navbarHeight; // used to add "remToPx(2);"
        
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const scrollY = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, scrollY);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        // Easing function for smooth scroll
        const ease = (t, b, c, d) => {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        };
        
        requestAnimationFrame(animation);
    };

    // Helper function to get duration from data attribute
    const getDuration = (element) => {
        const scrollSpeed = element.getAttribute('data-scroll-speed');
        
        if (!scrollSpeed || scrollSpeed === 'default') {
            return DEFAULT_DURATION;
        }
        
        const customDuration = parseInt(scrollSpeed, 10);
        return isNaN(customDuration) ? DEFAULT_DURATION : customDuration;
    };

    // Universal click handler for smooth scroll links
    const handleSmoothScrollClick = (element) => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = element.getAttribute('href');
            const duration = getDuration(element);
            smoothScroll(targetId, duration);
        });
    };
    
    // Add click event to all smooth scroll elements
    const smoothScrollLinks = document.querySelectorAll('a[data-scroll-speed]');
    smoothScrollLinks.forEach(link => handleSmoothScrollClick(link));
    
};

// Mobile menu toggle initialization
const initMobileMenu = () => {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarNav = document.querySelector('.navbar-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (navbarToggler && navbarNav) {
        navbarToggler.addEventListener('click', () => {
            navbarNav.classList.toggle('active');
        });
        
        // Close menu when clicking a link on mobile
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navbarNav.classList.contains('active')) {
                    navbarNav.classList.remove('active');
                }
            });
        });
    }
};

// Navbar scroll effects initialization
const initNavbarScrollEffects = () => {
    const navContainer = document.querySelector('.navbar-container');
    
    if (navContainer) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navContainer.classList.add('scrolled');
            } else {
                navContainer.classList.remove('scrolled');
            }
        });
    }
};

// ScrollSpy functionality using Intersection Observer
const initScrollSpy = () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    let currentSection = '';
    
    // Create intersection observer with 25% threshold from top
    const observerOptions = {
        root: null,
        rootMargin: '-25% 0px -75% 0px', // This creates the 25% from top trigger point
        threshold: 0
    };

    const handleIntersection = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                updateNavigation(sectionId);
            }
        });
    };

    const updateNavigation = (activeSectionId) => {
        // Don't update if it's the same section
        if (currentSection === activeSectionId) return;
        
        currentSection = activeSectionId;

        // Remove current class from all nav links
        navLinks.forEach(link => {
            link.classList.remove('current');
        });

        // Add current class to the active nav link
        const activeNavLink = document.querySelector(`.nav-link[href="#${activeSectionId}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('current');
        }
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Start observing all sections
    sections.forEach(section => {
        observer.observe(section);
    });
};

const initServicesBackgroundReveal = () => {
    console.log('🎯 Initializing Services Background Reveal...');
    
    const servicesList = document.querySelector('#services .unformatted-list');
    const backgroundImages = document.querySelectorAll('#services .service-images .bg-image');
    const listItems = servicesList?.querySelectorAll('li[data-service]');
    
    console.log('📍 Elements found:', {
        servicesList: !!servicesList,
        backgroundImages: backgroundImages.length,
        listItems: listItems?.length
    });
    
    if (!servicesList || !backgroundImages.length || !listItems?.length) {
        console.error('❌ Required elements not found!');
        return;
    }
    
    // Add event listeners
    listItems.forEach((item) => {
        item.addEventListener('mouseenter', () => {
            const serviceIndex = parseInt(item.dataset.service);
            const itemText = item.textContent.trim();
            
            console.log(`🐭 MOUSE ENTER on "${itemText}" (service index: ${serviceIndex})`);
            
            // Remove active from all images
            backgroundImages.forEach((img, index) => {
                const hadActive = img.classList.contains('active');
                img.classList.remove('active');
                if (hadActive) {
                    console.log(`🔄 Removed active from image ${index}`);
                }
            });
            
            // Add active to the corresponding image
            const targetImage = backgroundImages[serviceIndex];
            if (targetImage) {
                targetImage.classList.add('active');
                console.log(`✨ Added active to image ${serviceIndex}: ${targetImage.src}`);
            } else {
                console.error(`❌ No image found for service index ${serviceIndex}`);
            }
        });
    });
    
    // Remove all active classes when leaving the list
    servicesList.addEventListener('mouseleave', () => {
        console.log('🐭 MOUSE LEAVE from services list');
        backgroundImages.forEach((img, index) => {
            const hadActive = img.classList.contains('active');
            img.classList.remove('active');
            if (hadActive) {
                console.log(`🔄 Removed active from image ${index} on list leave`);
            }
        });
    });
    
    console.log('🎉 Services Background Reveal initialization complete!');
};

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initMobileMenu();
    initNavbarScrollEffects();
    initScrollSpy();
    initServicesBackgroundReveal();
});