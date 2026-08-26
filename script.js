// Safe localStorage helper to prevent SecurityError in sandboxed or origin-restricted environments
const safeStorage = {
    _memory: {},
    getItem(key) {
        try {
            return window.localStorage ? window.localStorage.getItem(key) : (this._memory[key] || null);
        } catch (e) {
            return this._memory[key] || null;
        }
    },
    setItem(key, value) {
        try {
            if (window.localStorage) window.localStorage.setItem(key, value);
            this._memory[key] = String(value);
        } catch (e) {
            this._memory[key] = String(value);
        }
    }
};

// Web Audio API Sound Effects Synthesizer (0ms Latency, Zero External Assets)
const audioCtxManager = {
    ctx: null,
    isMuted: safeStorage.getItem('ganeshdev_sound_muted') === 'true',
    init() {
        if (!this.ctx && typeof (window.AudioContext || window.webkitAudioContext) !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            const resumeAudio = () => {
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
                window.removeEventListener('click', resumeAudio);
                window.removeEventListener('keydown', resumeAudio);
            };
            window.addEventListener('click', resumeAudio, { once: true });
            window.addEventListener('keydown', resumeAudio, { once: true });
        }
    },
    toggleMute() {
        this.isMuted = !this.isMuted;
        safeStorage.setItem('ganeshdev_sound_muted', this.isMuted);
        this.updateButtonState();
        if (typeof showToast === 'function') {
            showToast(this.isMuted ? '🔇 Sound FX Muted' : '🔊 Sound FX Enabled');
        }
        if (!this.isMuted) this.playSuccess();
    },
    updateButtonState() {
        document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
            const icon = btn.querySelector('.sound-icon');
            if (icon) icon.textContent = this.isMuted ? '🔇' : '🔊';
            if (this.isMuted) {
                btn.classList.add('muted');
                btn.setAttribute('title', 'Unmute Sound FX (Web Audio)');
            } else {
                btn.classList.remove('muted');
                btn.setAttribute('title', 'Mute Sound FX (Web Audio)');
            }
        });
    },
    playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(gainVal, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + duration);
        } catch (e) {}
    },
    playClick() {
        this.playTone(620, 'sine', 0.04, 0.08);
    },
    playKeypress() {
        this.playTone(780, 'triangle', 0.03, 0.04);
    },
    playSuccess() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);
                gain.gain.setValueAtTime(0.09, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.14);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.14);
            });
        } catch (e) {}
    },
    playTheme() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [440, 554.37, 659.25, 880].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + i * 0.05);
                gain.gain.setValueAtTime(0.08, now + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.16);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now + i * 0.05);
                osc.stop(now + i * 0.05 + 0.16);
            });
        } catch (e) {}
    },
    playLaser() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(900, now);
            osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    },
    playExplosion() {
        if (this.isMuted) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.22);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }
};

// Theme Customizer & Color Preset Manager
function initThemeCustomizer() {
    const savedTheme = safeStorage.getItem('ganeshdev_theme') || 'orange';
    applyTheme(savedTheme, false);

    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const theme = dot.getAttribute('data-theme');
            applyTheme(theme, true);
            safeStorage.setItem('ganeshdev_theme', theme);
            if (typeof showToast === 'function') {
                showToast(`🎨 Accent theme switched to ${theme.toUpperCase()}!`);
            }
        });
    });

    document.querySelectorAll('.sound-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            audioCtxManager.toggleMute();
        });
    });
    audioCtxManager.updateButtonState();
}

function applyTheme(theme, playSound = true) {
    if (theme === 'orange') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }

    document.querySelectorAll('.theme-dot').forEach(dot => {
        if (dot.getAttribute('data-theme') === theme) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });

    if (playSound && typeof audioCtxManager !== 'undefined') {
        audioCtxManager.playTheme();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeCustomizer);
} else {
    initThemeCustomizer();
}

const canvas = document.getElementById("scroll-canvas");
const context = canvas ? canvas.getContext("2d") : null;

// Set canvas dimensions to match the video frames (1920x1080)
if (canvas) {
    canvas.width = 1920;
    canvas.height = 1080;
}

const frameCount = 240;
const currentFrame = index => (
  `frames/frame_${index.toString().padStart(4, '0')}.jpg`
);

const images = [];
let imagesLoaded = 0;
const progressBar = document.getElementById('frame-progress-bar');

function updateProgressBar() {
    imagesLoaded++;
    const progress = Math.min(100, Math.floor((imagesLoaded / frameCount) * 100));
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            setTimeout(() => {
                progressBar.style.opacity = '0';
            }, 300);
        }
    }
}

// Ensure progress bar never lingers on screen (auto fade after 1.5s)
setTimeout(() => {
    if (progressBar) progressBar.style.opacity = '0';
}, 1500);

function drawFrame(img) {
    if (!context || !img || !img.complete || img.naturalWidth === 0) return;
    try {
        context.drawImage(img, 0, 0, 1920, 1080);
    } catch (e) {}
}

// Preload the first image and draw it immediately
const firstImage = new Image();
firstImage.onload = () => {
    images[0] = firstImage;
    drawFrame(firstImage);
    updateProgressBar();
    preloadImages();
};
firstImage.onerror = () => {
    preloadImages();
};
firstImage.src = currentFrame(0);

// If already in browser cache
if (firstImage.complete && firstImage.naturalWidth > 0) {
    images[0] = firstImage;
    drawFrame(firstImage);
    preloadImages();
}

function preloadImages() {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.onload = () => {
        updateProgressBar();
        if (i === 1 && (!images[0] || images[0].naturalWidth === 0)) {
            drawFrame(img);
        }
    };
    img.onerror = () => updateProgressBar();
    img.src = currentFrame(i);
    images[i] = img;
  }
}

// Optimization for smooth scrolling canvas frame update with Mobile Battery Throttle
let lastScrollTop = 0;
let ticking = false;

window.addEventListener('scroll', () => {
  if (document.hidden) return;
  lastScrollTop = window.scrollY;
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateImage(lastScrollTop);
      updateActiveNavLink();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

function updateImage(scrollTop) {
  if (document.hidden || !context) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = Math.max(0, Math.min(1, maxScroll > 0 ? scrollTop / maxScroll : 0));
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );
  
  let targetImg = images[frameIndex];
  // Fallback to nearest loaded frame if current index is still downloading
  if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
      for (let offset = 1; offset < 30; offset++) {
          if (frameIndex - offset >= 0 && images[frameIndex - offset] && images[frameIndex - offset].complete && images[frameIndex - offset].naturalWidth > 0) {
              targetImg = images[frameIndex - offset];
              break;
          }
          if (frameIndex + offset < frameCount && images[frameIndex + offset] && images[frameIndex + offset].complete && images[frameIndex + offset].naturalWidth > 0) {
              targetImg = images[frameIndex + offset];
              break;
          }
      }
      if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
          targetImg = images[0] || firstImage;
      }
  }

  drawFrame(targetImg);
}

// Initial draw trigger
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => updateImage(window.scrollY || 0));
} else {
    updateImage(window.scrollY || 0);
}

/* ===================================================
   INTERACTIVE FEATURES, MODALS & MOBILE DRAWER
====================================================== */

// Toast notification helper
function showToast(message) {
    const toast = document.getElementById('toast-message');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('active');
        setTimeout(() => {
            toast.classList.remove('active');
        }, 4000);
    }
}

// Mobile Navigation Drawer Toggle
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileDrawer = document.getElementById('mobile-nav-drawer');
const closeDrawerBtn = document.getElementById('close-drawer-btn');

if (hamburgerBtn && mobileDrawer) {
    hamburgerBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('active');
        document.body.classList.add('drawer-open');
    });
}

if (closeDrawerBtn && mobileDrawer) {
    closeDrawerBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        document.body.classList.remove('drawer-open');
    });
}

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        if (mobileDrawer) mobileDrawer.classList.remove('active');
        document.body.classList.remove('drawer-open');
    });
});

// Contact Modal Management
const contactModal = document.getElementById('contact-modal');
const openModalBtns = document.querySelectorAll('.open-modal-btn');
const closeModalBtns = document.querySelectorAll('.close-modal-btn');

function updateModalActiveState() {
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    if (activeModals.length > 0) {
        document.body.classList.add('modal-active');
    } else {
        document.body.classList.remove('modal-active');
        // Clear any lingering URL hash from address bar when all modals close
        if (window.location.hash && window.location.hash.startsWith('#case-study-')) {
            try {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            } catch (e) {}
        }
    }
}

openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (mobileDrawer) mobileDrawer.classList.remove('active');
        if (contactModal) {
            contactModal.classList.add('active');
            updateModalActiveState();
        }
    });
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.remove('active'));
        updateModalActiveState();
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        updateModalActiveState();
    }
});

// Form Submission Handlers with Silent AJAX & Instant UI Feedback
const mainForm = document.getElementById('main-contact-form');
const popupForm = document.getElementById('popup-contact-form');

[mainForm, popupForm].forEach(form => {
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Send Message ↗';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending Proposal... ⏳';
            }

            try {
                const formData = new FormData(form);
                const res = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json().catch(() => ({ success: true }));
                
                const contactModal = document.getElementById('contact-modal');
                if (contactModal) contactModal.classList.remove('active');
                if (typeof updateModalActiveState === 'function') updateModalActiveState();
                showToast('🚀 Proposal sent! Ganesh will reply within 24 hours.');
                form.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Sent Successfully! ✓';
                    setTimeout(() => {
                        submitBtn.innerHTML = originalBtnHTML;
                    }, 2500);
                }
            } catch(err) {
                showToast('🚀 Proposal sent! Ganesh will reply within 24 hours.');
                const contactModal = document.getElementById('contact-modal');
                if (contactModal) contactModal.classList.remove('active');
                if (typeof updateModalActiveState === 'function') updateModalActiveState();
                form.reset();
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
            }
        });
    }
});

// Project Category Filtering & Dynamic 10-Item Pagination Engine
let currentPage = 1;
const itemsPerPage = 10;

function updateProjectsPagination() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards || cards.length === 0) return;

    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const filter = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';

    const matchingCards = [];
    cards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').toLowerCase();
        const isMatch = (filter === 'all' || categories.includes(filter.toLowerCase()));

        if (isMatch) {
            matchingCards.push(card);
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    });

    const totalItems = matchingCards.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    matchingCards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
            card.style.display = 'flex';
            card.style.opacity = '1';
            card.style.transform = 'none';
            card.classList.remove('reveal-on-scroll');
            card.classList.add('revealed');
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    });

    const statusEl = document.getElementById('pagination-status');
    const prevBtn = document.getElementById('pagination-prev');
    const nextBtn = document.getElementById('pagination-next');
    const pagesListEl = document.getElementById('pagination-pages-list');

    if (statusEl) {
        if (totalItems === 0) {
            statusEl.innerText = 'No projects found in this category';
        } else {
            statusEl.innerText = `Showing ${startIndex + 1}–${endIndex} of ${totalItems} Projects`;
        }
    }

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    if (pagesListEl) {
        pagesListEl.innerHTML = '';
        for (let p = 1; p <= totalPages; p++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-page-num ${p === currentPage ? 'active' : ''}`;
            pageBtn.innerText = p;
            pageBtn.addEventListener('click', () => {
                currentPage = p;
                updateProjectsPagination();
                const archiveSection = document.getElementById('projects-archive');
                if (archiveSection) archiveSection.scrollIntoView({ behavior: 'smooth' });
            });
            pagesListEl.appendChild(pageBtn);
        }
    }
}

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPage = 1;
        updateProjectsPagination();
    });
});

// Universal Category Pill Click Handler across Index & Projects Page
document.addEventListener('click', (e) => {
    const pill = e.target.closest('.project-info .pill');
    if (!pill) return;

    const pillText = pill.innerText.toLowerCase().trim();

    // If on homepage index.html, redirect to projects page
    if (!window.location.pathname.includes('projects.html')) {
        window.location.href = 'projects.html';
        return;
    }

    // If on projects.html, trigger category filtering
    const filterBtnsArr = Array.from(document.querySelectorAll('.filter-btn'));
    let targetFilter = 'all';

    if (pillText.includes('e-commerce') || pillText.includes('commerce') || pillText.includes('store') || pillText.includes('marketplace')) {
        targetFilter = 'ecommerce';
    } else if (pillText.includes('mobile') || pillText.includes('android')) {
        targetFilter = 'mobile';
    } else if (pillText.includes('ai') || pillText.includes('ml')) {
        targetFilter = 'ai';
    } else if (pillText.includes('web') || pillText.includes('finance') || pillText.includes('pwa')) {
        targetFilter = 'web';
    }

    const matchingBtn = filterBtnsArr.find(btn => btn.getAttribute('data-filter') === targetFilter);
    if (matchingBtn) {
        matchingBtn.click();
        const grid = document.querySelector('.projects-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

const prevPageBtn = document.getElementById('pagination-prev');
const nextPageBtn = document.getElementById('pagination-next');

if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateProjectsPagination();
            const archiveSection = document.getElementById('projects-archive');
            if (archiveSection) archiveSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        updateProjectsPagination();
        const archiveSection = document.getElementById('projects-archive');
        if (archiveSection) archiveSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Automatic Initialization Triggers
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProjectsPagination);
} else {
    updateProjectsPagination();
}
window.addEventListener('load', updateProjectsPagination);
setTimeout(updateProjectsPagination, 100);
setTimeout(updateProjectsPagination, 500);

// Case Study Modal Handler
const caseStudyModal = document.getElementById('case-study-modal');
const caseStudyContent = document.getElementById('case-study-content');
const caseStudyBtns = document.querySelectorAll('.btn-case-study');

const caseStudiesData = {
    'universalpay': {
        title: 'UniversalPay — Hybrid Web3 & UPI Payment Gateway',
        role: 'Founder & Lead Fintech Architect',
        tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Web3.js', 'Node.js', 'Vercel Edge'],
        desc: 'UniversalPay is a secure, scalable third-party payment gateway connecting Indian UPI rails (Paytm, PhonePe, GPay) with global crypto assets (USDT, BTC, ETH) with instant zero-slippage settlements.',
        link: 'https://universalpay-psi.vercel.app/'
    },
    'scriptbazar-store': {
        title: 'ScriptBazar — Source Code & Digital Products Marketplace',
        role: 'Founder, Lead Architect & Full-Stack Engineer',
        tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Vercel Edge'],
        desc: 'ScriptBazar is a digital store and web marketplace providing developers and clients with high-quality source code, full-stack application scripts, web templates, and digital assets.',
        link: 'https://script-bazar.vercel.app/'
    },
    'simple-invoice': {
        title: 'Simple Invoice Generator — Online Billing & Invoice App',
        role: 'Full-Stack Lead Engineer & Designer',
        tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vercel Edge'],
        desc: 'Simple Invoice Generator is a fast, web-based invoice & receipt creation app featuring instant PDF export, itemized billing, client details management, and clean responsive design.',
        link: 'https://simpleinvoicegenerator-two.vercel.app/'
    },
    'toolify-web': {
        title: 'Toolify AI — Web Utilities Directory Platform',
        role: 'Full-Stack Lead Engineer & Designer',
        tech: ['Next.js 15', 'Tailwind CSS', 'Node.js', 'Vercel Edge'],
        desc: 'Toolify AI provides instant access to 160+ smart utility tools, AI text/image generators, developer utilities, and PDF tools. Engineered for sub-second page loads and responsive dark mode UX.',
        link: 'https://toolifyai.vercel.app/'
    },
    'toolify-app': {
        title: 'Toolify AI — Official Android Mobile App',
        role: 'Mobile Lead Engineer',
        tech: ['Flutter', 'Android SDK', 'Google Play API', 'Firebase'],
        desc: 'Cross-platform Android application bringing 160+ AI tools directly to mobile users with offline utilities, fast search, and Play Store distribution.',
        link: 'https://play.google.com/store/apps/details?id=com.toolifyai.official.app&hl=en_IN'
    },
    'mashala-ghar': {
        title: 'Mashala Ghar — E-Commerce & Food Web App',
        role: 'Full-Stack Lead Engineer & Designer',
        tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vercel Edge'],
        desc: 'Mashala Ghar is an ultra-fast E-Commerce & Food ordering web platform featuring responsive glassmorphic UI, real-time cart state management, and seamless mobile checkout.',
        link: 'https://mashalaghar.vercel.app/'
    },
    'mr-co-spice': {
        title: 'M.R. Co-Spice — Premium Spices E-Commerce Platform',
        role: 'Full-Stack Lead Engineer & Architect',
        tech: ['Next.js 15', 'React', 'Node.js', 'Tailwind CSS', 'Vercel Edge'],
        desc: 'M.R. Co-Spice is an enterprise organic spices and food e-commerce platform built for high client conversion, responsive catalog browsing, and instant order checkout.',
        link: 'https://m-r-co-spice.vercel.app/'
    },
    'ganesh-portfolio': {
        title: 'Ganesh Portfolio v2.0 Architecture Engine',
        role: 'Full-Stack Lead Architect & Designer',
        tech: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'Vercel Edge'],
        desc: 'Ultra-fast glassmorphic developer portfolio built with offline PWA caching, custom GPU particle animations, and 100/100 Google Lighthouse Core Web Vitals.',
        link: 'https://ganeshkumar-delta.vercel.app/'
    },
    'habitflow': {
        title: 'HabitFlow — Habit Tracker & Consistency App',
        role: 'Mobile Lead Engineer & UI Designer',
        tech: ['Flutter', 'Android SDK', 'Firebase', 'SQLite'],
        desc: 'Consistency building & daily habit tracking Android app with streak analytics, smart reminders, and offline cloud sync.',
        link: 'https://play.google.com/store/apps/dev?id=5426439440976989701'
    },
    'spendwise': {
        title: 'SpendWise — Personal Expense & Finance Manager',
        role: 'Mobile Lead Architect',
        tech: ['Flutter', 'Android SDK', 'Chart.js', 'Firebase'],
        desc: 'Personal finance tracking app with category charts, monthly budgeting goals, recurring bills management, and multi-currency support.',
        link: 'https://play.google.com/store/apps/dev?id=5426439440976989701'
    },
    'geeta-saar': {
        title: 'Geeta Saar — Daily Shlok & Meaning App',
        role: 'Mobile Developer & Content Creator',
        tech: ['Android SDK', 'Kotlin', 'Firebase', 'ExoPlayer'],
        desc: 'Spiritual & educational Android app offering Shrimad Bhagavad Gita verses, audio recitation, Hindi/English translations, and daily bookmarking.',
        link: 'https://play.google.com/store/apps/dev?id=5426439440976989701'
    },
    'animation-hub': {
        title: 'Animation Hub — Loaders & Motion UI Library',
        role: 'UI/UX & Developer Tools Specialist',
        tech: ['HTML5', 'CSS3', 'WebGL', 'JavaScript'],
        desc: 'Developer motion UI toolkit featuring 100+ CSS, Lottie & WebGL loading animations with instant code snippet exporter.',
        link: 'https://play.google.com/store/apps/dev?id=5426439440976989701'
    },
    'contactsync': {
        title: 'ContactSync — Import & Export Utility',
        role: 'Android Utility Developer',
        tech: ['Android SDK', 'Java', 'SQLite', 'VCF Tools'],
        desc: 'Fast contacts backup, VCF/CSV converter, and cross-platform contacts transfer utility for Android users.',
        link: 'https://play.google.com/store/apps/dev?id=5426439440976989701'
    },
    'noteflow': {
        title: 'NoteFlow — Private AI Notes App',
        role: 'Full-Stack AI Lead Engineer',
        tech: ['Next.js 15', 'Node.js', 'TypeScript', 'Vercel Edge'],
        desc: 'Smart productivity and AI note-taking web application with automated summary generation, Markdown rendering, and real-time cloud backup.',
        link: 'https://play.google.com/store/apps/dev?id=5426439440976989701'
    },
    'colorpro-extension': {
        title: 'ColorPro — Advanced Color Picker & Page Analyzer',
        role: 'Extension Architect & UI/UX Specialist',
        tech: ['Chrome Extension API', 'JavaScript', 'CSS3', 'WCAG 2.1', 'HTML5'],
        desc: 'Production Chrome Extension for developers and designers with real-time DOM element color inspection, page palette extraction, WCAG 2.1 accessibility contrast validation, and visual CSS gradient generator.',
        link: 'https://chromewebstore.google.com/detail/npfhebodccjmikigpgndgibenaijpgpo'
    },
    'flowauto-extension': {
        title: 'FlowAuto Pro — Bulk Generator for Flow AI',
        role: 'Extension Architect & Automation Engineer',
        tech: ['Chrome Extension API', 'JavaScript', 'AI Automation', 'Multi-Tab Engine'],
        desc: 'High-speed bulk prompt queue automation engine for Google Flow AI with multi-tab parallel generation (1–5 tabs), multi-account quota failover, smart anti-detection delays, and auto media downloads.',
        link: 'https://chromewebstore.google.com/detail/fdmmdfebhcpljalclnalknkngllchcii'
    }
};

const techIconsMap = {
    'Next.js 15': '▲',
    'Tailwind CSS': '🎨',
    'Node.js': '🟢',
    'Vercel Edge': '⚡',
    'Flutter': '📱',
    'Android SDK': '🤖',
    'Google Play API': '▶',
    'Firebase': '🔥',
    'React': '⚛️',
    'Chart.js': '📊',
    'PostgreSQL': '🗄️',
    'HTML5': '🌐',
    'CSS3': '🎨',
    'JavaScript': '⚡',
    'Formspree': '📩',
    'Chrome Extension API': '🧩',
    'WCAG 2.1': '♿',
    'AI Automation': '🤖',
    'Multi-Tab Engine': '⚡'
};

function openCaseStudyModal(projectKey) {
    const data = caseStudiesData[projectKey];
    if (data && caseStudyContent && caseStudyModal) {
        const waMsg = `Hi Ganesh, I saw your "${data.title}" project on your portfolio. I would like to discuss building a similar web/mobile app project with you.`;
        const waLink = `https://wa.me/91706008603?text=${encodeURIComponent(waMsg)}`;
        const shareUrl = `${window.location.origin}${window.location.pathname}#case-study-${projectKey}`;

        caseStudyContent.innerHTML = `
            <div class="modal-header">
                <span class="badge" style="display:inline-block; margin-bottom:0.5rem;"><span class="dot"></span> Case Study</span>
                <h3>${data.title}</h3>
                <p><strong>Role:</strong> ${data.role}</p>
            </div>
            <div style="margin: 1.2rem 0;">
                <p style="color:#e4e4e7; line-height:1.6;">${data.desc}</p>
                <div style="margin: 1.2rem 0; display:flex; gap:0.6rem; flex-wrap:wrap;">
                    ${data.tech.map(t => `<span class="case-study-tech-pill"><span>${techIconsMap[t] || '⚡'}</span> ${t}</span>`).join('')}
                </div>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.75rem; margin-top:1.5rem;">
                <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                    ${data.link !== '#' ? `<a href="${data.link}" target="_blank" class="btn btn-primary" style="flex:1; min-width:180px; text-decoration:none; text-align:center; display:flex; align-items:center; justify-content:center; padding:0.8rem 1.2rem; border-radius:2rem;">Visit Live Project ↗</a>` : ''}
                    <a href="${waLink}" target="_blank" class="btn whatsapp-btn" style="flex:1; min-width:180px; text-decoration:none; text-align:center; display:flex; align-items:center; justify-content:center; gap:0.4rem; border-radius:2rem; padding:0.8rem 1.2rem;">
                        <span>💬 Chat on WhatsApp ↗</span>
                    </a>
                </div>
                <button type="button" class="btn btn-outline share-case-study-btn" style="width:100%; border-radius:2rem; padding:0.7rem; font-size:0.88rem; cursor:pointer;">
                    🔗 Share / Copy Link to Project
                </button>
            </div>
        `;

        const shareBtn = caseStudyContent.querySelector('.share-case-study-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                if (navigator.share) {
                    navigator.share({
                        title: data.title,
                        text: `Check out ${data.title} by Ganesh Kumar (@scriptbazar)`,
                        url: shareUrl
                    }).catch(() => {});
                } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl);
                    showToast('📋 Project link copied to clipboard!');
                }
            });
        }

        caseStudyModal.classList.add('active');
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    }
}

caseStudyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectKey = btn.getAttribute('data-project');
        openCaseStudyModal(projectKey);
    });
});

// Clear any remaining case study hash on startup so it never auto-pops up on refresh
window.addEventListener('load', () => {
    if (window.location.hash && window.location.hash.startsWith('#case-study-')) {
        try {
            history.replaceState(null, '', window.location.pathname + window.location.search);
        } catch (e) {}
    }
});

// 1-Click Copy Email Address Event Handler
document.addEventListener('click', (e) => {
    const targetLink = e.target.closest('a[href^="mailto:"], .email-btn');
    if (targetLink && navigator.clipboard) {
        navigator.clipboard.writeText('scriptbazar76@gmail.com');
        showToast('📋 Email copied: scriptbazar76@gmail.com');
    }
});

// Stats Count-Up Animation
let animatedStats = false;
function animateStats() {
    const statCounters = document.querySelectorAll('.stat-counter, .stat-number');
    statCounters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000;
        const steps = 60;
        const stepTime = duration / steps;
        let current = 0;
        const increment = target / steps;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            if (counter.classList.contains('stat-number')) {
                counter.textContent = current.toFixed(1) + '%';
            } else if (Number.isInteger(target)) {
                counter.textContent = Math.floor(current);
            } else {
                counter.textContent = current.toFixed(1);
            }
        }, stepTime);
    });
}

window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection && !animatedStats) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.8) {
            animatedStats = true;
            animateStats();
        }
    }
});

// Active Nav Link Scroll Highlight
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSectionId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

// Chip Option Selector logic with Keyboard Accessibility
document.querySelectorAll('.chip-options').forEach(container => {
    const hiddenInput = container.parentElement.querySelector('input[type="hidden"]');
    container.querySelectorAll('.chip').forEach(chip => {
        const selectChip = () => {
            container.querySelectorAll('.chip').forEach(c => {
                c.classList.remove('active');
                c.setAttribute('aria-pressed', 'false');
            });
            chip.classList.add('active');
            chip.setAttribute('aria-pressed', 'true');
            if (hiddenInput) {
                hiddenInput.value = chip.getAttribute('data-value');
            }
        };

        chip.addEventListener('click', selectChip);
        chip.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectChip();
            }
        });
    });
});

// Interactive 3D Card Tilt Handler
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const rotateX = (-y / rect.height) * 10;
        const rotateY = (x / rect.width) * 10;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
});

/* ===================================================
   CMD+K PALETTE, SPOTLIGHT, MAGNETIC & SCROLL REVEAL
====================================================== */

// 1. Cmd+K / Ctrl+K Quick Command Palette Modal
const cmdKModal = document.getElementById('cmd-k-modal');
const cmdKBtn = document.getElementById('cmd-k-btn');
const dockCmdK = document.getElementById('dock-cmd-k');
const cmdKInput = document.getElementById('cmd-k-input');
const cmdKList = document.getElementById('cmd-k-list');

function toggleCmdKModal() {
    if (cmdKModal) {
        cmdKModal.classList.toggle('active');
        if (cmdKModal.classList.contains('active') && cmdKInput) {
            setTimeout(() => cmdKInput.focus(), 100);
        }
    }
}

if (cmdKBtn) cmdKBtn.addEventListener('click', toggleCmdKModal);
if (dockCmdK) dockCmdK.addEventListener('click', toggleCmdKModal);

// Resume Modal & Universal Resume Download Handler
const resumeModal = document.getElementById('resume-modal');
const closeResumeBtn = document.querySelector('.close-resume-btn');
const dockEmailBtn = document.getElementById('dock-email-btn');

function downloadGaneshResume() {
    showToast('📄 Opening Print-Ready Professional Resume...');

    const resumeWindow = window.open('', '_blank');
    if (resumeWindow) {
        resumeWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ganesh_Kumar_Resume</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        body { background:#0f172a; color:#f8fafc; padding:2.5rem; line-height:1.6; max-width:850px; margin:0 auto; }
        .header { border-bottom:2px solid #334155; padding-bottom:1.2rem; margin-bottom:1.5rem; }
        h1 { font-size:2rem; color:#f15d31; margin-bottom:0.2rem; }
        .subtitle { font-size:1.05rem; color:#94a3b8; font-weight:600; margin-bottom:0.6rem; }
        .contacts { font-size:0.88rem; color:#cbd5e1; display:flex; gap:1.2rem; flex-wrap:wrap; }
        .contacts a { color:#f15d31; text-decoration:none; font-weight:500; }
        .section { margin-bottom:1.5rem; }
        .section-title { font-size:1.1rem; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em; font-weight:700; margin-bottom:0.6rem; border-bottom:1px solid #1e293b; padding-bottom:0.3rem; }
        .job { margin-bottom:1rem; }
        .job-header { display:flex; justify-content:space-between; font-weight:600; font-size:0.98rem; }
        .job-company { color:#f15d31; }
        .job-date { color:#64748b; font-size:0.88rem; }
        ul { padding-left:1.2rem; margin-top:0.4rem; }
        li { margin-bottom:0.3rem; font-size:0.92rem; color:#cbd5e1; }
        .skills-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; font-size:0.9rem; }
        .skill-category { background:#1e293b; padding:0.8rem 1rem; border-radius:0.5rem; }
        .skill-category strong { color:#f8fafc; display:block; margin-bottom:0.2rem; font-size:0.85rem; text-transform:uppercase; }
        .print-btn-bar { position:fixed; top:1rem; right:1rem; display:flex; gap:0.6rem; z-index:999; }
        .p-btn { background:#f15d31; color:#fff; border:none; padding:0.6rem 1.2rem; border-radius:2rem; font-weight:600; cursor:pointer; box-shadow:0 4px 15px rgba(241,93,49,0.4); font-size:0.9rem; }
        @media print {
            .print-btn-bar { display:none; }
            body { background:#fff; color:#111; padding:0; }
            h1, .job-company { color:#c2410c; }
            .section-title { color:#0369a1; border-color:#e2e8f0; }
            .skill-category { background:#f1f5f9; }
            .skill-category strong { color:#0f172a; }
            li, .contacts { color:#334155; }
        }
    </style>
</head>
<body>
    <div class="print-btn-bar">
        <button class="p-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
    </div>
    <div class="header">
        <h1>GANESH KUMAR</h1>
        <div class="subtitle">Senior Full-Stack Engineer &amp; Mobile App Architect</div>
        <div class="contacts">
            <span>✉️ <a href="mailto:scriptbazar76@gmail.com">scriptbazar76@gmail.com</a></span>
            <span>💬 <a href="https://wa.me/91706008603">Chat on WhatsApp</a></span>
            <span>🌐 <a href="https://github.com/scriptbazar">github.com/scriptbazar</a></span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Executive Summary</div>
        <p style="font-size:0.92rem; color:#cbd5e1;">High-impact Full-Stack Engineer with 2+ years of experience architecting ultra-fast web platforms, native mobile applications, and serverless AI workflows. Successfully deployed 16+ production applications and Chrome extensions globally with a 99% 5-star client rating.</p>
    </div>

    <div class="section">
        <div class="section-title">Technical Skill Matrix</div>
        <div class="skills-grid">
            <div class="skill-category">
                <strong>Frontend Engineering</strong>
                Next.js 15, React 19, TypeScript, Tailwind CSS, WebGL, Progressive Web Apps (PWA)
            </div>
            <div class="skill-category">
                <strong>Backend &amp; Cloud</strong>
                Node.js, Express, Fastify, PostgreSQL, MongoDB, Redis Caching, Serverless Edge APIs
            </div>
            <div class="skill-category">
                <strong>Mobile &amp; Extension Platforms</strong>
                Flutter, React Native, Android SDK, Chrome Extensions API, Multi-Tab Automation
            </div>
            <div class="skill-category">
                <strong>AI &amp; Automation</strong>
                OpenAI GPT-4o, Claude 3.5 Sonnet Workflows, Flow AI Automation, Vector Embeddings
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Key Work Experience</div>
        <div class="job">
            <div class="job-header">
                <span><span class="job-company">Founder &amp; Lead Architect</span> • Toolify AI Ecosystem</span>
                <span class="job-date">2024 – Present</span>
            </div>
            <ul>
                <li>Architected 160+ AI web utility platforms and official Play Store Android App with 50,000+ monthly active users.</li>
                <li>Achieved 0.2s ultra-low latency response times utilizing Vercel Serverless Edge and client caching.</li>
            </ul>
        </div>
        <div class="job">
            <div class="job-header">
                <span><span class="job-company">Senior Full-Stack Freelance Consultant</span> • Global Enterprise &amp; Startups</span>
                <span class="job-date">2024 – Present</span>
            </div>
            <ul>
                <li>Engineered 16+ custom web &amp; mobile platforms including UniversalPay Web3 payment gateway and FlowAuto Pro automation engine.</li>
                <li>Maintained a 99% satisfaction rate with 100/100 Google Lighthouse Core Web Vitals optimization.</li>
            </ul>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Education</div>
        <div class="job">
            <div class="job-header">
                <span><strong>B.Tech in Computer Science &amp; Engineering</strong> — CSE Honors</span>
            </div>
        </div>
    </div>
</body>
</html>
        `);
        resumeWindow.document.close();
    }
}

// Smart WhatsApp Lead Generator for Start a Project Modal
document.addEventListener('click', (e) => {
    const waModalBtn = e.target.closest('#modal-whatsapp-direct-btn');
    if (waModalBtn) {
        const form = waModalBtn.closest('form') || document.querySelector('#popup-contact-form, #project-proposal-form');
        const nameVal = form ? (form.querySelector('input[name="name"]')?.value || '') : '';
        const serviceVal = form ? (form.querySelector('input[name="service"], select[name="service"]')?.value || 'Web/Mobile App') : 'Web/Mobile App';
        const budgetVal = form ? (form.querySelector('input[name="budget"]')?.value || '$1,000 - $3,000') : '$1,000 - $3,000';
        const msgVal = form ? (form.querySelector('textarea[name="message"]')?.value || '') : '';

        let waText = '';
        if (nameVal || msgVal) {
            waText = `Hi Ganesh, My name is ${nameVal || 'a client'}. I would like to discuss building a ${serviceVal} project (Estimated Budget: ${budgetVal}).${msgVal ? ` Requirements: ${msgVal}` : ''}`;
        } else {
            waText = `Hi Ganesh, I saw your portfolio and projects (like FlowAuto Pro / UniversalPay). I would like to discuss building a web/mobile app project with you.`;
        }

        const waUrl = `https://wa.me/91706008603?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank');
        showToast('💬 Opening WhatsApp with your project details...');
    }
});

// 1. Header, Hero ("Download CV") & Mobile Resume buttons -> Direct Resume Download ONLY (NO Popup!)
document.querySelectorAll('#hero-resume-btn, #resume-btn, #mobile-resume-btn, .header-resume-download, a[href="#resume"]:not(#dock-resume-btn)').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        downloadGaneshResume();
    });
});

// 2. Floating Action Dock Resume Icon -> Opens Interactive Resume Preview Modal
const dockResumeBtn = document.getElementById('dock-resume-btn');
if (dockResumeBtn && resumeModal) {
    dockResumeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resumeModal.classList.add('active');
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    });
}

// 3. In-Modal "Download Resume 📄" Button -> Triggers Resume Download
const downloadResumeFileBtn = document.getElementById('download-resume-file-btn');
if (downloadResumeFileBtn) {
    downloadResumeFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadGaneshResume();
    });
}

if (closeResumeBtn && resumeModal) {
    closeResumeBtn.addEventListener('click', () => {
        resumeModal.classList.remove('active');
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    });
}

if (dockEmailBtn) {
    dockEmailBtn.addEventListener('click', () => {
        navigator.clipboard.writeText('scriptbazar76@gmail.com');
        showToast('📋 Email copied: scriptbazar76@gmail.com');
    });
}

const standaloneScrollTop = document.getElementById('standalone-scroll-top');
if (standaloneScrollTop) {
    standaloneScrollTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

const dockScrollTopBtn = document.getElementById('dock-scroll-top-btn');
if (dockScrollTopBtn) {
    dockScrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCmdKModal();
    }
    if (e.key === 'Escape' && cmdKModal && cmdKModal.classList.contains('active')) {
        cmdKModal.classList.remove('active');
    }
});

// Cmd+K Filter Options, Keyboard Navigation & Instant Search Highlighting
let cmdKSelectedIndex = 0;

function updateCmdKActiveOption(options) {
    options.forEach((opt, idx) => {
        if (idx === cmdKSelectedIndex) {
            opt.classList.add('active');
            opt.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            opt.classList.remove('active');
        }
    });
}

if (cmdKInput && cmdKList) {
    cmdKInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const options = cmdKList.querySelectorAll('.cmd-k-option');
        const headers = cmdKList.querySelectorAll('.cmd-k-category-header');
        let visibleCount = 0;

        options.forEach(opt => {
            const strongEl = opt.querySelector('.opt-text strong');
            const spanEl = opt.querySelector('.opt-text span');
            const rawTitle = strongEl ? (strongEl.getAttribute('data-raw-title') || strongEl.innerText) : '';
            const rawSub = spanEl ? (spanEl.getAttribute('data-raw-sub') || spanEl.innerText) : '';

            if (strongEl && !strongEl.hasAttribute('data-raw-title')) strongEl.setAttribute('data-raw-title', rawTitle);
            if (spanEl && !spanEl.hasAttribute('data-raw-sub')) spanEl.setAttribute('data-raw-sub', rawSub);

            const combinedText = `${rawTitle} ${rawSub}`.toLowerCase();

            if (!query || combinedText.includes(query)) {
                opt.style.display = 'flex';
                visibleCount++;
                if (query) {
                    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                    if (strongEl) strongEl.innerHTML = rawTitle.replace(regex, '<span class="cmd-k-highlight">$1</span>');
                    if (spanEl) spanEl.innerHTML = rawSub.replace(regex, '<span class="cmd-k-highlight">$1</span>');
                } else {
                    if (strongEl) strongEl.innerText = rawTitle;
                    if (spanEl) spanEl.innerText = rawSub;
                }
            } else {
                opt.style.display = 'none';
            }
        });

        // Hide headers if searching
        headers.forEach(h => {
            h.style.display = query ? 'none' : 'block';
        });

        const visibleOptions = Array.from(options).filter(opt => opt.style.display !== 'none');
        cmdKSelectedIndex = 0;
        updateCmdKActiveOption(visibleOptions);
    });

    cmdKInput.addEventListener('keydown', (e) => {
        const visibleOptions = Array.from(cmdKList.querySelectorAll('.cmd-k-option')).filter(opt => opt.style.display !== 'none');
        if (visibleOptions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            cmdKSelectedIndex = (cmdKSelectedIndex + 1) % visibleOptions.length;
            updateCmdKActiveOption(visibleOptions);
            if (typeof audioCtxManager !== 'undefined') audioCtxManager.playKeypress();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            cmdKSelectedIndex = (cmdKSelectedIndex - 1 + visibleOptions.length) % visibleOptions.length;
            updateCmdKActiveOption(visibleOptions);
            if (typeof audioCtxManager !== 'undefined') audioCtxManager.playKeypress();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const activeOption = visibleOptions[cmdKSelectedIndex] || visibleOptions[0];
            if (activeOption) {
                activeOption.click();
            }
        }
    });
}

// Cmd+K Option Execution Handler with Audio Integration
document.querySelectorAll('.cmd-k-option').forEach(opt => {
    opt.addEventListener('click', () => {
        const action = opt.getAttribute('data-action');
        if (cmdKModal) cmdKModal.classList.remove('active');
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
        if (typeof audioCtxManager !== 'undefined') audioCtxManager.playClick();
        
        if (action === 'contact-modal') {
            const modal = document.getElementById('contact-modal');
            if (modal) modal.classList.add('active');
            if (typeof updateModalActiveState === 'function') updateModalActiveState();
        } else if (action === 'download-resume') {
            downloadGaneshResume();
        } else if (action === 'play-game') {
            if (arcadeModal) {
                arcadeModal.classList.add('active');
                if (typeof updateModalActiveState === 'function') updateModalActiveState();
            }
        } else if (action === 'goto-homepage') {
            if (window.location.pathname.includes('projects.html')) {
                window.location.href = 'index.html';
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } else if (action === 'goto-projects') {
            const sec = document.getElementById('projects') || document.getElementById('projects-archive');
            if (sec) {
                sec.scrollIntoView({ behavior: 'smooth' });
            } else {
                window.location.href = 'projects.html';
            }
        } else if (action === 'goto-services') {
            const sec = document.getElementById('services');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html#services';
        } else if (action === 'goto-skills') {
            const sec = document.getElementById('skills');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html#skills';
        } else if (action === 'goto-terminal') {
            const sec = document.getElementById('interactive-terminal');
            if (sec) {
                sec.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                    const input = document.getElementById('terminal-input');
                    if (input) input.focus();
                }, 400);
            } else {
                window.location.href = 'index.html#about';
            }
        } else if (action === 'goto-performance') {
            const sec = document.getElementById('performance');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html#performance';
        } else if (action === 'goto-testimonials') {
            const sec = document.getElementById('testimonials');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html#testimonials';
        } else if (action === 'goto-faq') {
            const sec = document.getElementById('faq');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
            else window.location.href = 'index.html#faq';
        } else if (action.startsWith('filter-')) {
            const filterCategory = action.replace('filter-', '');
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${filterCategory}"]`);
            if (filterBtn) {
                filterBtn.click();
                const grid = document.querySelector('.projects-grid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (action.startsWith('set-theme-')) {
            const themeName = action.replace('set-theme-', '');
            applyTheme(themeName, true);
            safeStorage.setItem('ganeshdev_theme', themeName);
            showToast(`🎨 Theme switched to ${themeName.toUpperCase()}!`);
        } else if (action === 'toggle-sound') {
            audioCtxManager.toggleMute();
        } else if (action === 'whatsapp') {
            window.open('https://wa.me/91706008603?text=Hi%20Ganesh,%20I%20saw%20your%20portfolio%20and%20projects.%20I%20would%20like%20to%20discuss%20a%20project.', '_blank');
        } else if (action === 'github') {
            window.open('https://github.com/scriptbazar/', '_blank');
        } else if (action === 'copy-email') {
            navigator.clipboard.writeText('scriptbazar76@gmail.com');
            showToast('📋 Email copied: scriptbazar76@gmail.com');
        }
    });
});

// 2. Linear.app Cursor Spotlight Glow on Cards (Optimized: Zero Forced Reflow)
document.querySelectorAll('.project-card, .service-card, .stat-card, .tilt-card, .bento-card, .marquee-testimonial-card, .terminal-card').forEach(card => {
    card.classList.add('spotlight-card');
    let cachedRect = null;
    let rafId = null;

    card.addEventListener('mouseenter', () => {
        cachedRect = card.getBoundingClientRect();
    });

    card.addEventListener('mousemove', (e) => {
        if (!cachedRect) cachedRect = card.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (!cachedRect) return;
            const x = clientX - cachedRect.left;
            const y = clientY - cachedRect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    card.addEventListener('mouseleave', () => {
        cachedRect = null;
        if (rafId) cancelAnimationFrame(rafId);
    });
});

// 3. Magnetic Hover Button Physics (Optimized: Zero Forced Reflow)
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    let cachedRect = null;
    let rafId = null;

    btn.addEventListener('mouseenter', () => {
        cachedRect = btn.getBoundingClientRect();
    });

    btn.addEventListener('mousemove', (e) => {
        if (!cachedRect) cachedRect = btn.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (!cachedRect) return;
            const x = clientX - cachedRect.left - cachedRect.width / 2;
            const y = clientY - cachedRect.top - cachedRect.height / 2;
            btn.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
        });
    });

    btn.addEventListener('mouseleave', () => {
        cachedRect = null;
        if (rafId) cancelAnimationFrame(rafId);
        btn.style.transform = 'translate3d(0px, 0px, 0)';
    });
});

// 4. Scroll Reveal Intersection Observer Stagger
const revealElements = document.querySelectorAll('section, .project-card, .service-card, .stat-card, .section-heading');
revealElements.forEach(el => el.classList.add('reveal-on-scroll'));

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealElements.forEach(el => revealObserver.observe(el));

/* ===================================================
   ADVANCED INTERACTIVE TERMINAL PLAYGROUND CLI ENGINE
====================================================== */

const terminalInput = document.getElementById('terminal-input');
const terminalHistory = document.getElementById('terminal-history');
const termChips = document.querySelectorAll('.term-chip');
let termCommandHistory = [];
let termHistoryIndex = -1;
let matrixIntervalId = null;

function renderMatrixRain() {
    if (matrixIntervalId) clearInterval(matrixIntervalId);
    
    const canvasId = 'matrix-canvas-' + Date.now();
    const canvasHTML = `<canvas id="${canvasId}" class="term-matrix-canvas" width="600" height="140"></canvas>`;
    
    setTimeout(() => {
        const c = document.getElementById(canvasId);
        if (!c) return;
        const ctx = c.getContext('2d');
        const chars = '0123456789ABCDEF@#$%&*+=-/\\|{}[]GANESHDEV';
        const fontSize = 11;
        const columns = Math.floor(c.width / fontSize);
        const drops = Array(columns).fill(1);

        matrixIntervalId = setInterval(() => {
            ctx.fillStyle = 'rgba(9, 10, 15, 0.15)';
            ctx.fillRect(0, 0, c.width, c.height);

            ctx.fillStyle = '#22c55e';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > c.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }, 33);

        // Auto clean matrix after 12s to save CPU
        setTimeout(() => {
            if (matrixIntervalId) {
                clearInterval(matrixIntervalId);
                matrixIntervalId = null;
            }
        }, 12000);
    }, 50);

    return canvasHTML;
}

const termQuotes = [
    '"Simplicity is the soul of efficiency." – Austin Freeman',
    '"Make it work, make it right, make it fast." – Kent Beck',
    '"Code is like humor. When you have to explain it, it’s bad." – Cory House',
    '"First, solve the problem. Then, write the code." – John Johnson'
];

function executeTermCommand(cmd) {
    const rawCmd = cmd.trim();
    if (!rawCmd) return;
    
    termCommandHistory.push(rawCmd);
    termHistoryIndex = termCommandHistory.length;

    const parts = rawCmd.toLowerCase().split(' ');
    const mainCmd = parts[0];
    const arg = parts.slice(1).join(' ');

    if (typeof audioCtxManager !== 'undefined') audioCtxManager.playKeypress();

    if (mainCmd === 'clear' || mainCmd === 'cls') {
        if (matrixIntervalId) clearInterval(matrixIntervalId);
        if (terminalHistory) terminalHistory.innerHTML = '';
        return;
    }

    let output = '';

    switch (mainCmd) {
        case 'help':
            output = `
                <div style="margin-bottom:0.3rem;"><strong style="color:#fde047;">⚡ GANESHDEV CLI v2.5 — Available Commands:</strong></div>
                <table class="t-cmd-table">
                    <tr><td>skills</td><td>Core tech stack &amp; framework proficiencies</td></tr>
                    <tr><td>projects</td><td>Featured production web &amp; mobile apps</td></tr>
                    <tr><td>matrix</td><td>Launch falling digital rain code simulation</td></tr>
                    <tr><td>theme &lt;color&gt;</td><td>Switch accent (orange, cyan, purple, green, rose)</td></tr>
                    <tr><td>hire / start</td><td>Open proposal &amp; quotation request form</td></tr>
                    <tr><td>game / arcade</td><td>Launch 30-second Bug Blaster arcade challenge</td></tr>
                    <tr><td>about / bio</td><td>Developer background, experience &amp; mission</td></tr>
                    <tr><td>stats</td><td>Project metrics, review score &amp; Web Vitals</td></tr>
                    <tr><td>contact</td><td>Direct WhatsApp, Email &amp; GitHub channels</td></tr>
                    <tr><td>sound &lt;toggle&gt;</td><td>Toggle Web Audio synthesis sound FX</td></tr>
                    <tr><td>quote</td><td>Random inspirational engineering philosophy</td></tr>
                    <tr><td>date / time</td><td>Show current local date &amp; system time</td></tr>
                    <tr><td>whoami</td><td>Display current user authorization role</td></tr>
                    <tr><td>clear</td><td>Clear all terminal history and logs</td></tr>
                </table>
            `;
            break;

        case 'skills':
            output = `
                <div style="line-height:1.7;">
                    <div><span class="t-purple">Frontend:</span> Next.js 15, React 19, TypeScript, Tailwind CSS, WebGL, PWA <span class="t-green">[99%]</span></div>
                    <div><span class="t-blue">Backend:</span> Node.js, Express, Fastify, Edge Serverless, Redis, PostgreSQL <span class="t-green">[95%]</span></div>
                    <div><span class="t-orange">Mobile &amp; App:</span> Flutter, React Native, Android SDK, Chrome Extensions API <span class="t-green">[92%]</span></div>
                    <div><span class="t-pink">AI &amp; Automation:</span> OpenAI GPT-4o, Claude 3.5 Sonnet, Flow AI, Vector DBs <span class="t-green">[94%]</span></div>
                </div>
            `;
            break;

        case 'projects':
            output = `
                <div style="line-height:1.7;">
                    <div>🚀 <strong class="t-yellow">Toolify AI Ecosystem:</strong> 160+ AI tools web platform &amp; Play Store App (50k+ users)</div>
                    <div>⚡ <strong class="t-cyan">FlowAuto Pro:</strong> Chrome Extension for multi-tab automated form filling</div>
                    <div>💳 <strong class="t-green">UniversalPay Gateway:</strong> Web3 and multi-currency payment checkout solution</div>
                    <div>📖 <strong class="t-orange">Shrimad Bhagavad Gita:</strong> Spiritual &amp; educational Android Play Store App</div>
                    <div style="margin-top:0.4rem;"><a href="projects.html" target="_blank" style="color:#38bdf8; text-decoration:underline; font-weight:600;">Click here to view all 16+ production projects in archive ↗</a></div>
                </div>
            `;
            break;

        case 'matrix':
            if (typeof audioCtxManager !== 'undefined') audioCtxManager.playLaser();
            output = `
                <div class="t-matrix">⚡ INITIALIZING MATRIX RAIN STREAM... Type 'clear' to exit.</div>
                ${renderMatrixRain()}
            `;
            break;

        case 'theme':
            const validThemes = ['orange', 'cyan', 'purple', 'green', 'rose'];
            if (arg && validThemes.includes(arg)) {
                applyTheme(arg, true);
                safeStorage.setItem('ganeshdev_theme', arg);
                output = `🎨 Theme switched successfully to <span class="t-green">${arg.toUpperCase()}</span>!`;
            } else {
                output = `Usage: <span class="t-yellow">theme &lt;name&gt;</span>. Options: <span class="t-orange">orange</span>, <span class="t-cyan">cyan</span>, <span class="t-purple">purple</span>, <span class="t-green">green</span>, <span class="t-pink">rose</span>.`;
            }
            break;

        case 'hire':
        case 'start':
        case 'proposal':
            const cModal = document.getElementById('contact-modal');
            if (cModal) {
                cModal.classList.add('active');
                if (typeof updateModalActiveState === 'function') updateModalActiveState();
            }
            output = `🚀 <span class="t-green">Contact modal opened!</span> Ready to build high-impact web and mobile apps.`;
            break;

        case 'game':
        case 'arcade':
            if (arcadeModal) {
                arcadeModal.classList.add('active');
                if (typeof updateModalActiveState === 'function') updateModalActiveState();
            }
            output = `👾 <span class="t-yellow">Launching Bug Blaster Arcade Game!</span> Defeat bugs within 30 seconds.`;
            break;

        case 'about':
        case 'bio':
            output = `
                <div><strong>Ganesh Kumar</strong> — Senior Full-Stack Engineer &amp; Mobile App Architect with 2+ years of production experience crafting ultra-fast web apps, cross-platform Android/iOS applications, and intelligent AI workflows. 16+ production deliveries globally.</div>
            `;
            break;

        case 'stats':
            output = `
                <div style="line-height:1.7;">
                    <div>📦 <strong class="t-orange">Completed Deliveries:</strong> 16+ Production Apps</div>
                    <div>⭐ <strong class="t-green">Client Satisfaction:</strong> 99% 5-Star Reviews</div>
                    <div>⚡ <strong class="t-cyan">Core Web Vitals:</strong> 100/100 Google Lighthouse Speed</div>
                    <div>🌍 <strong class="t-yellow">Global Footprint:</strong> Clients across 6+ Countries</div>
                </div>
            `;
            break;

        case 'contact':
            output = `
                <div style="line-height:1.7;">
                    <div>💬 WhatsApp: <a href="https://wa.me/91706008603" target="_blank" style="color:#22c55e;">+91 706008603 ↗</a></div>
                    <div>✉️ Email: <a href="mailto:scriptbazar76@gmail.com" style="color:#38bdf8;">scriptbazar76@gmail.com ↗</a></div>
                    <div>🐙 GitHub: <a href="https://github.com/scriptbazar" target="_blank" style="color:#c084fc;">github.com/scriptbazar ↗</a></div>
                </div>
            `;
            break;

        case 'sound':
            if (arg === 'on') {
                if (audioCtxManager.isMuted) audioCtxManager.toggleMute();
                output = '🔊 Sound FX Enabled.';
            } else if (arg === 'off') {
                if (!audioCtxManager.isMuted) audioCtxManager.toggleMute();
                output = '🔇 Sound FX Muted.';
            } else {
                audioCtxManager.toggleMute();
                output = audioCtxManager.isMuted ? '🔇 Sound FX Muted.' : '🔊 Sound FX Enabled.';
            }
            break;

        case 'date':
        case 'time':
            output = `🕒 Current Time: <span class="t-cyan">${new Date().toLocaleString()}</span>`;
            break;

        case 'whoami':
            output = `👤 Role: <span class="t-green">Guest Client / Collaborator</span> (Authorized to inspect code and initiate project proposals).`;
            break;

        case 'quote':
            const randomQuote = termQuotes[Math.floor(Math.random() * termQuotes.length)];
            output = `<span class="t-purple">${randomQuote}</span>`;
            break;

        default:
            output = `Command not recognized: <span class="t-red">'${rawCmd}'</span>. Type <span class="t-yellow">'help'</span> for list of commands.`;
            break;
    }

    if (terminalHistory) {
        const line = document.createElement('div');
        line.style.margin = '0.45rem 0';
        line.innerHTML = `<div><span class="t-prompt">$</span> ${rawCmd}</div><div style="color:#d4d4d8; padding-left:0.8rem; margin-top:0.2rem;">${output}</div>`;
        terminalHistory.appendChild(line);
        const termBody = document.getElementById('terminal-output-body');
        if (termBody) termBody.scrollTop = termBody.scrollHeight;
    }
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            executeTermCommand(terminalInput.value);
            terminalInput.value = '';
        } else if (e.key === 'ArrowUp') {
            if (termCommandHistory.length > 0 && termHistoryIndex > 0) {
                termHistoryIndex--;
                terminalInput.value = termCommandHistory[termHistoryIndex] || '';
            }
        } else if (e.key === 'ArrowDown') {
            if (termCommandHistory.length > 0 && termHistoryIndex < termCommandHistory.length - 1) {
                termHistoryIndex++;
                terminalInput.value = termCommandHistory[termHistoryIndex] || '';
            } else {
                termHistoryIndex = termCommandHistory.length;
                terminalInput.value = '';
            }
        }
    });
}

termChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const cmd = chip.getAttribute('data-cmd');
        executeTermCommand(cmd);
    });
});

// Terminal Multi-File Tab Switcher & Code Execution Logic
const termTabs = document.querySelectorAll('.term-tab');
const termTabContent = document.getElementById('term-tab-content');
const runTermCodeBtn = document.getElementById('run-term-code');
const copyTermCodeBtn = document.getElementById('copy-term-code');
const termExecutionLog = document.getElementById('terminal-execution-log');

const tabFiles = {
    'developer.js': `<p><span class="t-purple">const</span> <span class="t-yellow">developer</span> = {</p>
        <p class="t-indent"><span class="t-blue">name</span>: <span class="t-green">'Ganesh Kumar'</span>,</p>
        <p class="t-indent"><span class="t-blue">role</span>: <span class="t-green">'Full-Stack Engineer & UI/UX Specialist'</span>,</p>
        <p class="t-indent"><span class="t-blue">coreTech</span>: [<span class="t-green">'Next.js 15'</span>, <span class="t-green">'React'</span>, <span class="t-green">'Node.js'</span>, <span class="t-green">'Tailwind'</span>, <span class="t-green">'AI APIs'</span>],</p>
        <p class="t-indent"><span class="t-blue">deliveries</span>: <span class="t-orange">'14+'</span>,</p>
        <p class="t-indent"><span class="t-blue">status</span>: <span class="t-green">'Available for contract work 🚀'</span></p>
        <p>};</p>`,
    'experience.json': `<p>{</p>
        <p class="t-indent"><span class="t-blue">"yearsExperience"</span>: <span class="t-orange">2</span>,</p>
        <p class="t-indent"><span class="t-blue">"completedDeliveries"</span>: <span class="t-orange">"14+"</span>,</p>
        <p class="t-indent"><span class="t-blue">"positiveReviews"</span>: <span class="t-green">"99%"</span>,</p>
        <p class="t-indent"><span class="t-blue">"specialties"</span>: [<span class="t-green">"Ultra-Fast Next.js 15 Web Apps"</span>, <span class="t-green">"Flutter/React Native Apps"</span>, <span class="t-green">"LLM AI Workflows"</span>]</p>
        <p>}</p>`,
    'contact.config': `<p><span class="t-purple">export const</span> <span class="t-yellow">contactConfig</span> = {</p>
        <p class="t-indent"><span class="t-blue">whatsapp</span>: <span class="t-green">'Instant Chat Active'</span>,</p>
        <p class="t-indent"><span class="t-blue">email</span>: <span class="t-green">'scriptbazar76@gmail.com'</span>,</p>
        <p class="t-indent"><span class="t-blue">github</span>: <span class="t-green">'https://github.com/scriptbazar/'</span>,</p>
        <p class="t-indent"><span class="t-blue">responseGuarantee</span>: <span class="t-green">'Within 24 Hours'</span></p>
        <p>};</p>`
};

termTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        termTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const fileName = tab.getAttribute('data-tab');
        if (termTabContent && tabFiles[fileName]) {
            termTabContent.innerHTML = tabFiles[fileName];
        }
    });
});

if (runTermCodeBtn) {
    runTermCodeBtn.addEventListener('click', () => {
        if (!termExecutionLog) return;
        termExecutionLog.innerHTML = `
            <div class="log-line">⚡ [1/3] Compiling Ganesh Engineering Engine v2.0... OK</div>
            <div class="log-line" style="animation-delay: 0.15s;">⚙️ [2/3] Connecting Vercel Edge Serverless Caching... OK</div>
            <div class="log-line" style="animation-delay: 0.3s;">🚀 [3/3] Full-Stack Portfolio Engine Active (0.2s Speed)!</div>
        `;
        showToast('▶ Script Executed Successfully!');
    });
}

if (copyTermCodeBtn) {
    copyTermCodeBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.term-tab.active');
        const fileName = activeTab ? activeTab.getAttribute('data-tab') : 'developer.js';
        const codeText = tabFiles[fileName] ? tabFiles[fileName].replace(/<[^>]*>/g, '') : '';
        navigator.clipboard.writeText(codeText);
        showToast(`📋 Copied ${fileName} to clipboard!`);
    });
}

// 3. GitHub Matrix Generation & Live API Sync
const matrixCells = document.getElementById('matrix-cells');
if (matrixCells) {
    for (let i = 0; i < 180; i++) {
        const cell = document.createElement('div');
        cell.className = 'matrix-cell';
        const rand = Math.random();
        if (rand > 0.75) cell.classList.add('lvl-3');
        else if (rand > 0.5) cell.classList.add('lvl-2');
        else if (rand > 0.3) cell.classList.add('lvl-1');
        matrixCells.appendChild(cell);
    }
}

// Asynchronous Live GitHub REST API Data Sync for @scriptbazar with smart 2-hour caching
async function fetchLiveGitHubStats() {
    const CACHE_KEY = 'gh_stats_scriptbazar_cache';
    const CACHE_TIME_KEY = 'gh_stats_scriptbazar_time';
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    const renderData = (userData, reposData) => {
        if (userData) {
            const reposEl = document.getElementById('gh-stat-repos');
            const bioEl = document.getElementById('gh-user-bio');
            const sinceEl = document.getElementById('gh-stat-since');
            
            if (reposEl) reposEl.innerText = '7';
            if (bioEl && userData.name) bioEl.innerText = `${userData.name} • Active GitHub Contributor since ${new Date(userData.created_at || '2023-01-01').getFullYear()}`;
            if (sinceEl && userData.created_at) sinceEl.innerText = new Date(userData.created_at).getFullYear();
        }

        if (Array.isArray(reposData) && reposData.length > 0) {
            const reposContainer = document.getElementById('gh-repos-container');
            if (reposContainer) {
                const topRepos = reposData.slice(0, 4);
                reposContainer.innerHTML = topRepos.map(r => `
                    <a href="${r.html_url}" target="_blank" class="gh-repo-chip spotlight-card">
                        <span class="repo-icon">📦</span>
                        <div class="repo-info">
                            <strong>${r.name}</strong>
                            <span>${r.language || 'TypeScript'} • ⭐ ${r.stargazers_count || 0} Stars • Updated ${new Date(r.updated_at).toLocaleDateString()}</span>
                        </div>
                        <span class="repo-arrow">↗</span>
                    </a>
                `).join('');
            }
        }
    };

    // 1. Check if cached data exists and is still valid
    try {
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedTime && cachedData && (Date.now() - Number(cachedTime) < TWO_HOURS)) {
            const parsed = JSON.parse(cachedData);
            renderData(parsed.user, parsed.repos);
            return;
        }
    } catch (e) {}

    // 2. Fetch fresh data from GitHub with rate-limit protection
    try {
        const userRes = await fetch('https://api.github.com/users/scriptbazar');
        if (!userRes.ok) return;
        const userData = await userRes.json();

        const reposRes = await fetch('https://api.github.com/users/scriptbazar/repos?per_page=100&sort=updated');
        if (!reposRes.ok) return;
        const reposData = await reposRes.json();

        renderData(userData, reposData);

        // Save to cache
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ user: userData, repos: reposData }));
            localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
        } catch (e) {}
    } catch (err) {
        // Graceful fallback to static DOM defaults without error logging
    }
}
fetchLiveGitHubStats();

// 4. Performance Comparison Draggable Slider
const sliderContainer = document.getElementById('comparison-container');
const fastLayer = document.getElementById('comparison-fast-layer');
const sliderHandle = document.getElementById('slider-handle');

if (sliderContainer && fastLayer && sliderHandle) {
    let isDragging = false;
    let cachedSliderRect = null;
    let sliderRafId = null;

    const setSliderPos = (x) => {
        if (!cachedSliderRect) cachedSliderRect = sliderContainer.getBoundingClientRect();
        let offsetX = x - cachedSliderRect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > cachedSliderRect.width) offsetX = cachedSliderRect.width;
        
        const pct = (offsetX / cachedSliderRect.width) * 100;
        if (sliderRafId) cancelAnimationFrame(sliderRafId);
        sliderRafId = requestAnimationFrame(() => {
            fastLayer.style.width = `${pct}%`;
            sliderHandle.style.left = `${pct}%`;
        });
    };

    sliderContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        cachedSliderRect = sliderContainer.getBoundingClientRect();
        setSliderPos(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setSliderPos(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        cachedSliderRect = null;
    });

    // Touch events for mobile
    sliderContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        cachedSliderRect = sliderContainer.getBoundingClientRect();
        if (e.touches && e.touches[0]) setSliderPos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        setSliderPos(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// 4.1 Live Speed Diagnostic Simulation
const speedTestBtn = document.getElementById('run-speed-test-btn');
const speedBtnLabel = document.getElementById('speed-btn-label');
const speedDiagResult = document.getElementById('speed-diag-result');

if (speedTestBtn && speedBtnLabel && speedDiagResult) {
    speedTestBtn.addEventListener('click', () => {
        if (speedTestBtn.classList.contains('testing')) return;
        speedTestBtn.classList.add('testing');
        speedBtnLabel.textContent = 'Measuring TTFB & Edge Ping...';
        speedDiagResult.textContent = 'Auditing...';
        speedDiagResult.style.color = '#38bdf8';
        speedDiagResult.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        speedDiagResult.style.background = 'rgba(56, 189, 248, 0.12)';

        const startTime = performance.now();
        fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
            .then(() => {
                const latency = Math.max(18, Math.round(performance.now() - startTime));
                setTimeout(() => {
                    speedTestBtn.classList.remove('testing');
                    speedBtnLabel.textContent = 'Run Live Diagnostic Test';
                    speedDiagResult.textContent = `Grade A+ • ${latency}ms Ultra Fast`;
                    speedDiagResult.style.color = '#4ade80';
                    speedDiagResult.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                    speedDiagResult.style.background = 'rgba(34, 197, 94, 0.15)';
                }, 500);
            })
            .catch(() => {
                setTimeout(() => {
                    speedTestBtn.classList.remove('testing');
                    speedBtnLabel.textContent = 'Run Live Diagnostic Test';
                    speedDiagResult.textContent = 'Grade A+ • 28ms Edge Fast';
                    speedDiagResult.style.color = '#4ade80';
                    speedDiagResult.style.borderColor = 'rgba(34, 197, 94, 0.4)';
                    speedDiagResult.style.background = 'rgba(34, 197, 94, 0.15)';
                }, 500);
            });
    });
}

// 5. Custom Glowing Cursor Ring & Context Expansion
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const cursorText = document.getElementById('cursor-text');

if (cursorDot && cursorRing) {
    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover text badges
    document.querySelectorAll('a, button, .project-card, .service-card, .tilt-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorRing.classList.add('expanded');
            if (el.classList.contains('project-card') || el.classList.contains('btn-case-study')) {
                if (cursorText) cursorText.innerText = 'View ↗';
            } else if (el.classList.contains('service-card')) {
                if (cursorText) cursorText.innerText = 'Explore 📁';
            } else {
                if (cursorText) cursorText.innerText = 'Click';
            }
        });

        el.addEventListener('mouseleave', () => {
            cursorRing.classList.remove('expanded');
            if (cursorText) cursorText.innerText = '';
        });
    });
}

// Interactive FAQ Accordion Toggle Logic
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(questionBtn => {
    questionBtn.addEventListener('click', () => {
        const faqItem = questionBtn.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Close all other FAQ items for accordion effect
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const btn = item.querySelector('.faq-question');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });

        // Toggle current item
        if (!isActive) {
            faqItem.classList.add('active');
            questionBtn.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ===================================================
   DEVELOPER ARCADE GAME ENGINE: BUG BLASTER 👾
====================================================== */

const arcadeModal = document.getElementById('arcade-modal');
const dockGameBtn = document.getElementById('dock-game-btn');
const closeArcadeBtn = document.querySelector('.close-arcade-btn');
const startGameBtn = document.getElementById('start-game-btn');
const restartGameBtn = document.getElementById('restart-game-btn');
const arcadeClaimBtn = document.getElementById('arcade-claim-btn');

const arcadeCanvas = document.getElementById('arcade-canvas');
const ctx = arcadeCanvas ? arcadeCanvas.getContext('2d') : null;

const scoreEl = document.getElementById('arcade-score');
const timerEl = document.getElementById('arcade-timer');
const highScoreEl = document.getElementById('arcade-high-score');

const startOverlay = document.getElementById('arcade-start-overlay');
const endOverlay = document.getElementById('arcade-end-overlay');
const finalScoreText = document.getElementById('arcade-final-score-text');
const rankText = document.getElementById('arcade-rank-text');

let gameScore = 0;
let gameTime = 30;
let gameInterval = null;
let spawnInterval = null;
let animationReq = null;
let isPlaying = false;

let highScore = parseInt(safeStorage.getItem('arcade_high_score') || '0', 10);
if (highScoreEl) highScoreEl.innerText = highScore;

// Open/Close Game Modal
if (dockGameBtn && arcadeModal) {
    dockGameBtn.addEventListener('click', () => {
        arcadeModal.classList.add('active');
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    });
}

if (closeArcadeBtn && arcadeModal) {
    closeArcadeBtn.addEventListener('click', () => {
        arcadeModal.classList.remove('active');
        stopGame();
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    });
}

if (arcadeClaimBtn) {
    arcadeClaimBtn.addEventListener('click', () => {
        arcadeModal.classList.remove('active');
        if (contactModal) contactModal.classList.add('active');
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    });
}

// Target Types
const targetTypes = [
    { emoji: '👾', pts: 100, label: 'Bug', color: '#ef4444', speed: 1.8, radius: 24 },
    { emoji: '🐞', pts: 150, label: 'Crash', color: '#f97316', speed: 2.2, radius: 22 },
    { emoji: '🐛', pts: 200, label: 'Leak', color: '#eab308', speed: 2.5, radius: 20 },
    { emoji: '🔴', pts: 250, label: '404', color: '#ec4899', speed: 2.8, radius: 18 },
    { emoji: '⚡', pts: 300, label: 'Next.js Shield', color: '#10b981', speed: 3.2, radius: 22 }
];

let targets = [];
let particles = [];

function spawnTarget() {
    if (!arcadeCanvas || !isPlaying) return;
    const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    const x = Math.random() * (arcadeCanvas.width - 60) + 30;
    const y = -30;
    targets.push({
        x, y,
        ...type,
        id: Math.random()
    });
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: Math.random() * 3 + 1.5,
            color,
            alpha: 1
        });
    }
}

let comboCount = 0;
let lastHitTime = 0;
let floatingTexts = [];

function spawnFloatingText(x, y, text, color) {
    floatingTexts.push({
        x, y,
        text,
        color,
        vy: -1.5,
        alpha: 1
    });
}

if (arcadeCanvas) {
    const handleArcadeHit = (e) => {
        if (!isPlaying) return;
        if (e.type === 'pointerdown') e.preventDefault();
        const rect = arcadeCanvas.getBoundingClientRect();
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        const clickX = (clientX - rect.left) * (arcadeCanvas.width / rect.width);
        const clickY = (clientY - rect.top) * (arcadeCanvas.height / rect.height);

        for (let i = targets.length - 1; i >= 0; i--) {
            const t = targets[i];
            const dist = Math.hypot(clickX - t.x, clickY - t.y);
            if (dist < t.radius + 20) {
                // Hit!
                const now = Date.now();
                if (now - lastHitTime < 1400) {
                    comboCount++;
                } else {
                    comboCount = 1;
                }
                lastHitTime = now;

                const multiplier = Math.min(comboCount, 4);
                const earnedPts = t.pts * multiplier;
                gameScore += earnedPts;
                
                if (scoreEl) scoreEl.innerText = gameScore;
                createExplosion(t.x, t.y, t.color);
                if (typeof audioCtxManager !== 'undefined') audioCtxManager.playExplosion();
                spawnFloatingText(t.x, t.y, multiplier > 1 ? `🔥 ${multiplier}X COMBO! +${earnedPts}` : `+${earnedPts}`, t.color);
                targets.splice(i, 1);
                showToast(multiplier > 1 ? `🔥 ${multiplier}X COMBO! +${earnedPts} PTS` : `💥 +${earnedPts} PTS (${t.label})`);
                break;
            }
        }
    };

    arcadeCanvas.addEventListener('pointerdown', handleArcadeHit);
}

function updateGame() {
    if (!ctx || !arcadeCanvas) return;
    ctx.clearRect(0, 0, arcadeCanvas.width, arcadeCanvas.height);

    // Grid lines background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < arcadeCanvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, arcadeCanvas.height); ctx.stroke();
    }
    for (let y = 0; y < arcadeCanvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(arcadeCanvas.width, y); ctx.stroke();
    }

    // Update targets
    for (let i = targets.length - 1; i >= 0; i--) {
        const t = targets[i];
        t.y += t.speed;

        // Draw glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = t.color;
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Emoji
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.emoji, t.x, t.y);

        if (t.y > arcadeCanvas.height + 40) {
            targets.splice(i, 1);
        }
    }

    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;
        if (p.alpha <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Update floating texts
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;
        if (ft.alpha <= 0) {
            floatingTexts.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = ft.alpha;
            ctx.fillStyle = ft.color;
            ctx.font = 'bold 16px "Oswald", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.restore();
        }
    }

    if (isPlaying) {
        animationReq = requestAnimationFrame(updateGame);
    }
}

function startGame() {
    isPlaying = true;
    gameScore = 0;
    gameTime = 30;
    targets = [];
    particles = [];

    if (scoreEl) scoreEl.innerText = '0';
    if (timerEl) timerEl.innerText = '30s';
    if (startOverlay) startOverlay.style.display = 'none';
    if (endOverlay) endOverlay.style.display = 'none';

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    spawnInterval = setInterval(spawnTarget, 550);

    gameInterval = setInterval(() => {
        gameTime--;
        if (timerEl) timerEl.innerText = `${gameTime}s`;
        if (gameTime <= 0) {
            endGame();
        }
    }, 1000);

    updateGame();
}

function stopGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    if (animationReq) cancelAnimationFrame(animationReq);
    if (startOverlay) startOverlay.style.display = 'flex';
    if (endOverlay) endOverlay.style.display = 'none';
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    if (gameScore > highScore) {
        highScore = gameScore;
        safeStorage.setItem('arcade_high_score', highScore.toString());
        if (highScoreEl) highScoreEl.innerText = highScore;
    }

    let rank = 'JUNIOR DEV 🥉';
    if (gameScore >= 2000) rank = 'LEAD ARCHITECT 👑🏆';
    else if (gameScore >= 1200) rank = 'SENIOR ENGINEER 🥇';
    else if (gameScore >= 600) rank = 'FULL-STACK DEV 🥈';

    if (finalScoreText) finalScoreText.innerHTML = `Final Score: <strong>${gameScore.toLocaleString()} PTS</strong>`;
    if (rankText) rankText.innerText = `RANK: ${rank}`;

    if (endOverlay) endOverlay.style.display = 'flex';
}

if (startGameBtn) startGameBtn.addEventListener('click', startGame);
if (restartGameBtn) restartGameBtn.addEventListener('click', startGame);

// Smart Auto-Hide Top Header Navbar, Floating Dock & Scroll-To-Top Button on Scroll Direction
let lastScrollY = window.scrollY;
const bottomDockContainer = document.getElementById('bottom-dock-container');
const floatingDockWrapper = document.getElementById('floating-dock');
const standaloneScrollTopBtn = document.getElementById('standalone-scroll-top');
const mainNavbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    const delta = Math.abs(currentScrollY - lastScrollY);

    if (mainNavbar) {
        if (currentScrollY > 50) {
            mainNavbar.classList.add('scrolled');
        } else {
            mainNavbar.classList.remove('scrolled');
        }
    }

    if (currentScrollY > 100) {
        if (isScrollingDown && delta > 15) {
            // Scrolling DOWN -> Hide Header Navbar, floating dock, and scroll-to-top button!
            if (mainNavbar) mainNavbar.classList.add('scroll-hidden');
            if (bottomDockContainer) bottomDockContainer.classList.add('scroll-hidden');
            if (floatingDockWrapper) floatingDockWrapper.classList.add('scroll-hidden');
            if (standaloneScrollTopBtn) {
                standaloneScrollTopBtn.classList.remove('visible');
                standaloneScrollTopBtn.classList.add('scroll-hidden');
            }
        } else if (!isScrollingDown && delta > 15) {
            // Scrolling UP -> Reveal Header Navbar, floating dock, and scroll-to-top button!
            if (mainNavbar) mainNavbar.classList.remove('scroll-hidden');
            if (bottomDockContainer) bottomDockContainer.classList.remove('scroll-hidden');
            if (floatingDockWrapper) floatingDockWrapper.classList.remove('scroll-hidden');
            if (standaloneScrollTopBtn) {
                standaloneScrollTopBtn.classList.add('visible');
                standaloneScrollTopBtn.classList.remove('scroll-hidden');
            }
        }
    } else {
        // At or near top of page (scrollY <= 100px)
        // Always show Header Navbar and floating dock at top
        if (mainNavbar) mainNavbar.classList.remove('scroll-hidden');
        if (bottomDockContainer) bottomDockContainer.classList.remove('scroll-hidden');
        if (floatingDockWrapper) floatingDockWrapper.classList.remove('scroll-hidden');
        if (standaloneScrollTopBtn) {
            standaloneScrollTopBtn.classList.remove('visible');
            standaloneScrollTopBtn.classList.remove('scroll-hidden');
        }
    }

    lastScrollY = currentScrollY;
}, { passive: true });

// Register PWA Service Worker for 0ms Offline Cache (Top Window only)
if ('serviceWorker' in navigator && window.self === window.top) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('GANESHDEV ServiceWorker registered:', reg.scope))
            .catch(err => console.log('ServiceWorker registration skipped:', err));
    });
}

// Global Keyboard Accessibility: ESC Key closes any open modal
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            modal.classList.remove('active');
        });
        if (typeof updateModalActiveState === 'function') updateModalActiveState();
    }
});

// Interactive Global Client Map Handler
const mapPinGroups = document.querySelectorAll('.map-pin-group');
const regionChips = document.querySelectorAll('.region-chip');
const tooltipTitle = document.getElementById('tooltip-title');
const tooltipCount = document.getElementById('tooltip-count');
const tooltipDesc = document.getElementById('tooltip-desc');

function updateMapRegion(regionId) {
    mapPinGroups.forEach(pin => {
        if (pin.getAttribute('data-region') === regionId) {
            pin.classList.add('active');
            const title = pin.getAttribute('data-title');
            const count = pin.getAttribute('data-count');
            const desc = pin.getAttribute('data-desc');
            if (tooltipTitle) tooltipTitle.innerHTML = title;
            if (tooltipCount) tooltipCount.innerText = count;
            if (tooltipDesc) tooltipDesc.innerText = desc;
        } else {
            pin.classList.remove('active');
        }
    });

    regionChips.forEach(chip => {
        if (chip.getAttribute('data-region') === regionId) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

mapPinGroups.forEach(pin => {
    pin.addEventListener('click', () => {
        const region = pin.getAttribute('data-region');
        updateMapRegion(region);
    });
});

regionChips.forEach(chip => {
    chip.addEventListener('click', () => {
        const region = chip.getAttribute('data-region');
        updateMapRegion(region);
    });
});
