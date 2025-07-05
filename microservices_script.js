// Microservices Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize page
    initializeAnimations();
    initializeCalculator();
    initializeMicroserviceNodes();
    initializeScrollEffects();
    
    // Auto-calculate ROI on page load
    calculateROI();
});

// Animation on scroll
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe cards and items
    document.querySelectorAll('.problem-item, .solution-item, .use-case-item, .testimonial-item, .pricing-card').forEach(item => {
        observer.observe(item);
    });
}

// Initialize ROI Calculator
function initializeCalculator() {
    const inputs = document.querySelectorAll('#developers, #salary, #projects');
    inputs.forEach(input => {
        input.addEventListener('input', calculateROI);
    });
}

// Calculate ROI function
function calculateROI() {
    const developers = parseInt(document.getElementById('developers').value) || 10;
    const salary = parseInt(document.getElementById('salary').value) || 12000;
    const projects = parseInt(document.getElementById('projects').value) || 4;
    
    // Current development cost calculation
    const monthsPerProject = 6; // Average months per project
    const currentCost = developers * salary * monthsPerProject * projects;
    
    // Cost with AigroNovaTech (60% reduction)
    const newCost = currentCost * 0.4;
    
    // Savings and ROI
    const savings = currentCost - newCost;
    const roi = ((savings / newCost) * 100).toFixed(0);
    
    // Update display
    document.getElementById('currentCost').textContent = `R$ ${currentCost.toLocaleString('pt-BR')}`;
    document.getElementById('newCost').textContent = `R$ ${newCost.toLocaleString('pt-BR')}`;
    document.getElementById('savings').textContent = `R$ ${savings.toLocaleString('pt-BR')}`;
    document.getElementById('roi').textContent = `${roi}%`;
    
    // Add animation to results
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'none';
            item.offsetHeight; // Trigger reflow
            item.style.animation = 'slideUp 0.5s ease-out';
        }, index * 100);
    });
}

// Initialize microservice nodes animation
function initializeMicroserviceNodes() {
    const nodes = document.querySelectorAll('.microservice-node');
    let currentIndex = 0;
    
    function animateNodes() {
        // Remove active class from all nodes
        nodes.forEach(node => node.classList.remove('active'));
        
        // Add active class to current node
        if (nodes[currentIndex]) {
            nodes[currentIndex].classList.add('active');
        }
        
        // Move to next node
        currentIndex = (currentIndex + 1) % nodes.length;
    }
    
    // Start animation
    setInterval(animateNodes, 2000);
}

// Scroll effects
function initializeScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const header = document.querySelector('.header');
        
        // Header background on scroll
        if (scrolled > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
        
        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Modal functions
function openDemo() {
    document.getElementById('demoModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Track event
    trackEvent('demo_modal_opened');
}

function openROICalculator() {
    // Smooth scroll to calculator
    document.querySelector('.roi-calculator').scrollIntoView({
        behavior: 'smooth'
    });
    
    // Highlight calculator
    const calculator = document.querySelector('.calculator-container');
    calculator.style.animation = 'pulse 1s ease-in-out';
    
    // Track event
    trackEvent('roi_calculator_accessed');
}

function openContact() {
    // Smooth scroll to footer contact
    document.querySelector('.footer').scrollIntoView({
        behavior: 'smooth'
    });
    
    // Track event
    trackEvent('contact_accessed');
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Form submission handlers
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('demo-form')) {
        e.preventDefault();
        handleDemoSubmission(e.target);
    }
});

function handleDemoSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Agendando...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Show success message
        showNotification('Demo agendada com sucesso! Entraremos em contato em breve.', 'success');
        
        // Reset form
        form.reset();
        closeModal('demoModal');
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Track conversion
        trackEvent('demo_scheduled', data);
        
        // Redirect to thank you page or show confirmation
        setTimeout(() => {
            window.location.href = '#obrigado';
        }, 2000);
    }, 2000);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Pricing card interactions
document.querySelectorAll('.pricing-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-12px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        if (!this.classList.contains('featured')) {
            this.style.transform = 'translateY(0) scale(1)';
        } else {
            this.style.transform = 'translateY(0) scale(1.05)';
        }
    });
});

// Pricing button handlers
document.querySelectorAll('.btn-pricing').forEach(btn => {
    btn.addEventListener('click', function() {
        const card = this.closest('.pricing-card');
        const planName = card.querySelector('h3').textContent;
        
        if (this.textContent.includes('Falar com Vendas')) {
            // Enterprise plan - open contact
            openContact();
            trackEvent('enterprise_contact_clicked', { plan: planName });
        } else {
            // Other plans - open demo
            openDemo();
            trackEvent('plan_selected', { plan: planName });
        }
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Testimonial carousel (if needed)
function initializeTestimonialCarousel() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    let currentTestimonial = 0;
    
    function showNextTestimonial() {
        testimonials.forEach((testimonial, index) => {
            testimonial.style.opacity = index === currentTestimonial ? '1' : '0.7';
            testimonial.style.transform = index === currentTestimonial ? 'scale(1)' : 'scale(0.95)';
        });
        
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }
    
    // Auto-rotate testimonials every 5 seconds
    setInterval(showNextTestimonial, 5000);
}

// Analytics and tracking
function trackEvent(eventName, data = {}) {
    // Google Analytics 4
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            custom_parameter_1: data.plan || '',
            custom_parameter_2: data.company || '',
            custom_parameter_3: data.role || ''
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, data);
    }
    
    // Custom analytics
    console.log('Event tracked:', eventName, data);
}

// Performance monitoring
function initializePerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackEvent('page_load_time', { load_time: loadTime });
    });
    
    // Monitor scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', function() {
        const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollDepth > maxScrollDepth) {
            maxScrollDepth = scrollDepth;
            
            // Track milestone scroll depths
            if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
                trackEvent('scroll_depth_25');
            } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
                trackEvent('scroll_depth_50');
            } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
                trackEvent('scroll_depth_75');
            } else if (maxScrollDepth >= 100) {
                trackEvent('scroll_depth_100');
            }
        }
    });
}

// Initialize performance monitoring
initializePerformanceMonitoring();

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                closeModal(modal.id);
            }
        });
    }
});

// Click outside modal to close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Form validation
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            field.style.borderColor = '#e5e7eb';
        }
    });
    
    // Email validation
    const emailFields = form.querySelectorAll('input[type="email"]');
    emailFields.forEach(field => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (field.value && !emailRegex.test(field.value)) {
            field.style.borderColor = '#ef4444';
            isValid = false;
        }
    });
    
    return isValid;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    initializeAll();
}

function initializeAll() {
    // Re-run initialization if needed
    console.log('Microservices landing page initialized successfully!');
}

// Export functions for global access
window.openDemo = openDemo;
window.openROICalculator = openROICalculator;
window.openContact = openContact;
window.closeModal = closeModal;
window.calculateROI = calculateROI;