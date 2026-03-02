class AppHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <header class="bg-sand-white/80 backdrop-blur-lg sticky top-0 z-50">
            <nav class="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="index.html" class="flex items-center gap-3">
                    <img src="assets/images/logo.png" alt="Rashu Plastic Project Logo" class="h-12">
                    <span class="brand-title text-lagoon-teal text-xl font-bold">RASHU PLASTIC PROJECT</span>
                </a>
                <div class="hidden lg:flex items-center space-x-8">
                    <div class="nav-dropdown">
                        <button class="nav-dropdown-trigger">About Us 
                            <svg class="nav-dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="about.html">Our Story</a>
                            <a href="collaborations.html">Collaborations</a>
                            <a href="future.html">Our Future</a>
                            <a href="faq.html">FAQs</a>
                            <a href="blog.html">Blog</a>
                        </div>
                    </div>
                    
                    <div class="nav-dropdown">
                        <button class="nav-dropdown-trigger">About Plastic
                            <svg class="nav-dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="problem.html">The Problem</a>
                            <a href="solution.html">Our Solution</a>
                        </div>
                    </div>

                    <div class="nav-dropdown">
                        <button class="nav-dropdown-trigger">Programs & Products
                            <svg class="nav-dropdown-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        <div class="nav-dropdown-menu">
                            <a href="catalogue.html">Rashu Creations</a>
                            <a href="experiences.html">Plastic Experiences</a>
                        </div>
                    </div>

                    <a href="contact.html" class="nav-link">Contact Us</a>
                </div>
                <div class="hidden lg:block">
                    <a href="involved.html" class="btn-primary" id="header-cta">Get Involved</a>
                </div>
                <button id="mobile-menu-button" class="lg:hidden text-deep-ocean focus:outline-none"
                    aria-controls="mobile-menu" aria-expanded="false">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-4 6h4">
                        </path>
                    </svg>
                </button>
            </nav>
            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden lg:hidden bg-sand-white py-4">
                <div>
                    <button class="mobile-dropdown-trigger">About Us
                        <svg class="mobile-dd-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="mobile-dropdown-content">
                        <a href="about.html">Our Story</a>
                        <a href="collaborations.html">Collaborations</a>
                        <a href="future.html">Our Future</a>
                        <a href="faq.html">FAQs</a>
                        <a href="blog.html">Blog</a>
                    </div>
                </div>

                <div>
                    <button class="mobile-dropdown-trigger">About Plastic
                        <svg class="mobile-dd-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="mobile-dropdown-content">
                        <a href="problem.html">The Problem</a>
                        <a href="solution.html">Our Solution</a>
                    </div>
                </div>

                <div>
                    <button class="mobile-dropdown-trigger">Programs & Products
                        <svg class="mobile-dd-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div class="mobile-dropdown-content">
                        <a href="catalogue.html">Rashu Creations</a>
                        <a href="experiences.html">Plastic Experiences</a>
                    </div>
                </div>

                <a href="contact.html" class="mobile-nav-link">Contact Us</a>
                <div class="px-6 mt-4">
                    <a href="involved.html" class="btn-primary w-full text-center">Get Involved</a>
                </div>
            </div>
        </header>
        `;

        this.highlightActiveLink();
        this.initMobileMenu();
        this.initScrollEffect();
    }

    highlightActiveLink() {
        const currentPath = window.location.pathname;
        const page = currentPath.split("/").pop() || "index.html";

        const links = this.querySelectorAll('.nav-link, .mobile-nav-link');
        links.forEach(link => {
            if (link.getAttribute('href') === page) {
                // Add a visual indicator style directly or via class
                link.classList.add('text-hermit-orange'); // Using existing orange color for active state
                // Keep the underline effect for desktop
                if (link.classList.contains('nav-link')) {
                    link.style.setProperty('--tw-content', '""'); // Ensure pseudo-element triggers if reliant on it
                    // The CSS for .nav-link:hover::after handles underline. 
                    // We can force it by adding a class if we modify CSS, but for now specific text color is checking.
                }
            }
        });
    }

    initMobileMenu() {
        // Mobile menu toggle
        const menuButton = this.querySelector('#mobile-menu-button');
        const mobileMenu = this.querySelector('#mobile-menu');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
                mobileMenu.classList.toggle('hidden');
                menuButton.setAttribute('aria-expanded', !isExpanded);
            });
        }

        // Mobile dropdown toggles
        const dropdownTriggers = this.querySelectorAll('.mobile-dropdown-trigger');
        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                // Toggle the current dropdown
                trigger.classList.toggle('open');
                const content = trigger.nextElementSibling;
                if (content && content.classList.contains('mobile-dropdown-content')) {
                    content.classList.toggle('open');
                }
            });
        });
    }

    initScrollEffect() {
        // --- Hide header when hero is in view on mobile ---
        // This was in the original index.html script
        const headerEl = this.querySelector('header');
        const heroSection = document.querySelector('.hero-mobile');

        if (headerEl && heroSection) {
            const observer = new IntersectionObserver((entries) => {
                const isMobile = window.matchMedia('(max-width: 767px)').matches;
                entries.forEach(entry => {
                    if (!isMobile) {
                        headerEl.classList.remove('header-hidden');
                        return;
                    }
                    if (entry.isIntersecting) {
                        headerEl.classList.add('header-hidden');
                    } else {
                        headerEl.classList.remove('header-hidden');
                    }
                });
            }, { threshold: 0.4 });
            observer.observe(heroSection);

            // Keep behavior responsive on resize
            window.addEventListener('resize', () => {
                const isMobile = window.matchMedia('(max-width: 767px)').matches;
                if (!isMobile) headerEl.classList.remove('header-hidden');
            });
        }
    }
}

class AppFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
        <footer class="bg-deep-ocean text-sand-white">
            <div class="container mx-auto px-6 py-12">
                <div class="footer-grid">
                    <div>
                        <div class="footer-brand mb-3">
                            <img src="assets/images/logo.png" alt="Rashu Plastic Project Logo">
                            <h3 class="brand-title text-xl font-bold text-lagoon-teal">RASHU PLASTIC PROJECT</h3>
                        </div>
                        <p class="mt-2 text-sand-white/80">Giving plastic a new home,
                            not the wildlife.</p>
                    </div>
                    <div>
                        <h3 class="font-heading text-xl font-bold text-lagoon-teal footer-column-title">Quick Links</h3>
                        <ul class="space-y-1">
                            <li><a href="about.html" class="footer-link">About Us</a></li>
                            <li><a href="problem.html" class="footer-link">About Plastic</a></li>
                            <li><a href="catalogue.html" class="footer-link">Rashu Creations</a></li>
                            <li><a href="experiences.html" class="footer-link">Plastic Experiences</a></li>
                            <li><a href="collaborations.html" class="footer-link">Collaborations</a></li>
                            <li><a href="faq.html" class="footer-link">FAQs</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="font-heading text-xl font-bold text-lagoon-teal footer-column-title">Connect With Us</h3>
                        <p class="text-sand-white/80">Follow our journey or get in touch directly.</p>
                        <div class="mt-4 flex gap-4">
                            <a href="https://instagram.com/rashuplasticproject" target="_blank" rel="noopener noreferrer"
                                class="instagram-link" aria-label="Follow us on Instagram">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="contact.html" class="btn-secondary">Contact Us</a>
                        </div>
                    </div>
                </div>
                <div class="mt-10 footer-bottom">
                    <p>&copy;
                        <span id="year">${new Date().getFullYear()}</span> Rashu Plastic Project. All Rights
                        Reserved.
                    </p>
                </div>
            </div>
        </footer>
        `;
    }
}

customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);
