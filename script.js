const canvas = document.getElementById("scroll-canvas");
const context = canvas.getContext("2d");

// Set canvas dimensions to match the video frames (1920x1080)
canvas.width = 1920;
canvas.height = 1080;

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
            }, 500);
        }
    }
}

// Preload the first image and draw it immediately
const firstImage = new Image();
firstImage.src = currentFrame(0);
firstImage.onload = () => {
    context.drawImage(firstImage, 0, 0);
    images[0] = firstImage;
    updateProgressBar();
    preloadImages();
};

function preloadImages() {
  for (let i = 1; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    img.onload = () => updateProgressBar();
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
  if (document.hidden) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const scrollFraction = Math.max(0, Math.min(1, scrollTop / maxScroll));
  const frameIndex = Math.min(
    frameCount - 1,
    Math.floor(scrollFraction * frameCount)
  );
  
  if (images[frameIndex] && images[frameIndex].complete) {
      context.drawImage(images[frameIndex], 0, 0);
  }
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

// Form Submission Handlers
const mainForm = document.getElementById('main-contact-form');
const popupForm = document.getElementById('popup-contact-form');

[mainForm, popupForm].forEach(form => {
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (contactModal) contactModal.classList.remove('active');
            showToast('🚀 Proposal sent! Ganesh will reply within 24 hours.');
            form.reset();
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
        const categories = card.getAttribute('data-category');
        if (filter === 'all' || (categories && categories.includes(filter))) {
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
    'Formspree': '📩'
};

caseStudyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const projectKey = btn.getAttribute('data-project');
        const data = caseStudiesData[projectKey];
        if (data && caseStudyContent && caseStudyModal) {
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
                ${data.link !== '#' ? `<a href="${data.link}" target="_blank" class="btn btn-primary btn-block" style="text-decoration:none;">Visit Live Project ↗</a>` : ''}
            `;
            caseStudyModal.classList.add('active');
            updateModalActiveState();
        }
    });
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
            } else {
                counter.textContent = Math.floor(current) + (target === 99 ? '%' : '+');
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
    showToast('📄 Downloading Ganesh_Kumar_Resume.txt...');
    const resumeText = `GANESH KUMAR - SENIOR FULL-STACK ENGINEER & MOBILE APP ARCHITECT
Email: scriptbazar76@gmail.com | Telegram: @Scriptbazar | GitHub: https://github.com/scriptbazar/

EXECUTIVE OVERVIEW:
High-impact Full-Stack Engineer with 6+ years of experience architecting ultra-fast web platforms, native mobile applications, and serverless AI workflows. Delivered 299+ completed client projects globally with a 99% satisfaction rate.

TECHNICAL SKILL MATRIX:
- Frontend Engineering: Next.js 15 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS, WebGL, Glassmorphism UI
- Backend & Cloud Systems: Node.js, Express, Fastify, PostgreSQL, MongoDB, Redis Caching, Serverless Edge APIs, Docker
- Mobile & AI Integrations: React Native, Expo, Flutter, OpenAI GPT-4o, Claude 3.5 Sonnet Workflows, Vector Search

FLAGSHIP WORK EXPERIENCE:
- Founder & Lead Architect • Toolify AI Ecosystem (2024 – Present)
  Architected and deployed 160+ AI web tools and official Play Store Android App reaching 50,000+ active monthly users with 0.2s ultra-low latency speed.
- Senior Full-Stack Freelance Consultant (2020 – Present)
  Spearheaded 299+ bespoke web & mobile applications for global enterprise clients, startups, and e-commerce platforms with a 99% 5-star rating.

EDUCATION & CERTIFICATIONS:
- B.Tech in Computer Science & Engineering — CSE Honors Degree
- Next.js 15 Full-Stack Enterprise Certification — Advanced Architecture`;

    const blob = new Blob([resumeText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ganesh_Kumar_Resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

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

// Cmd+K Filter Options
if (cmdKInput && cmdKList) {
    cmdKInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const options = cmdKList.querySelectorAll('.cmd-k-option');
        options.forEach(opt => {
            const text = opt.innerText.toLowerCase();
            if (text.includes(query)) {
                opt.style.display = 'flex';
            } else {
                opt.style.display = 'none';
            }
        });
    });
}

// Cmd+K Option Execution
document.querySelectorAll('.cmd-k-option').forEach(opt => {
    opt.addEventListener('click', () => {
        const action = opt.getAttribute('data-action');
        if (cmdKModal) cmdKModal.classList.remove('active');
        
        if (action === 'contact-modal') {
            const modal = document.getElementById('contact-modal');
            if (modal) modal.classList.add('active');
        } else if (action === 'play-game') {
            if (arcadeModal) arcadeModal.classList.add('active');
        } else if (action === 'goto-projects') {
            const sec = document.getElementById('projects');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        } else if (action === 'goto-services') {
            const sec = document.getElementById('services');
            if (sec) sec.scrollIntoView({ behavior: 'smooth' });
        } else if (action === 'telegram') {
            window.open('https://t.me/Scriptbazar', '_blank');
        } else if (action === 'github') {
            window.open('https://github.com/scriptbazar/', '_blank');
        } else if (action === 'copy-email') {
            navigator.clipboard.writeText('scriptbazar76@gmail.com');
            showToast('📋 Email address copied to clipboard!');
        }
    });
});

// 2. Linear.app Cursor Spotlight Glow on Cards
document.querySelectorAll('.project-card, .service-card, .stat-card, .tilt-card').forEach(card => {
    card.classList.add('spotlight-card');
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// 3. Magnetic Hover Button Physics
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
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
   INTERACTIVE FEATURES LOGIC
====================================================== */

// 1. Accent Color Switcher Logic
const colorDots = document.querySelectorAll('.color-dot');
colorDots.forEach(dot => {
    dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const hex = dot.getAttribute('data-color');
        
        // Update CSS Root variables
        document.documentElement.style.setProperty('--accent-color', hex);
        
        // Update all inline accent elements
        document.querySelectorAll('.stat-counter, .highlight-text, .t-cursor, .gh-number').forEach(el => {
            el.style.color = hex;
        });
        
        document.querySelectorAll('.btn-primary, .handle-icon').forEach(btn => {
            btn.style.background = hex;
            btn.style.borderColor = hex;
        });

        showToast(`✨ Accent Theme updated to ${hex.toUpperCase()}!`);
    });
});

// 2. Interactive Terminal Playground Logic
const terminalInput = document.getElementById('terminal-input');
const terminalHistory = document.getElementById('terminal-history');
const termChips = document.querySelectorAll('.term-chip');

const termCommands = {
    'help': 'Available commands: <span class="t-yellow">skills</span>, <span class="t-yellow">projects</span>, <span class="t-yellow">stats</span>, <span class="t-yellow">hire</span>, <span class="t-yellow">clear</span>',
    'skills': 'Core Stack: <span class="t-green">Next.js 15, React, Node.js, Tailwind CSS, Flutter, AI APIs</span>',
    'projects': 'Featured: <span class="t-purple">Toolify AI Web</span> & <span class="t-purple">Toolify AI Android App</span> (160+ AI Utilities)',
    'stats': 'Deliveries: <span class="t-orange">299</span> | Experience: <span class="t-orange">6 Yrs</span> | Positive Rating: <span class="t-green">99%</span>',
    'hire': 'Status: <span class="t-green">Available for Freelance & Contract Work 🚀</span>. Click <span class="t-yellow">Start a Project</span> to propose!',
};

function executeTermCommand(cmd) {
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;
    
    if (cleanCmd === 'clear') {
        if (terminalHistory) terminalHistory.innerHTML = '';
        return;
    }

    const output = termCommands[cleanCmd] || `Command not found: <span class="t-red">'${cleanCmd}'</span>. Type <span class="t-yellow">'help'</span> for list of commands.`;
    
    if (terminalHistory) {
        const line = document.createElement('div');
        line.style.margin = '0.4rem 0';
        line.innerHTML = `<div><span class="t-prompt">$</span> ${cleanCmd}</div><div style="color:#d4d4d8; padding-left:1rem;">${output}</div>`;
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
        <p class="t-indent"><span class="t-blue">deliveries</span>: <span class="t-orange">299</span>,</p>
        <p class="t-indent"><span class="t-blue">status</span>: <span class="t-green">'Available for contract work 🚀'</span></p>
        <p>};</p>`,
    'experience.json': `<p>{</p>
        <p class="t-indent"><span class="t-blue">"yearsExperience"</span>: <span class="t-orange">6</span>,</p>
        <p class="t-indent"><span class="t-blue">"completedDeliveries"</span>: <span class="t-orange">299</span>,</p>
        <p class="t-indent"><span class="t-blue">"positiveReviews"</span>: <span class="t-green">"99%"</span>,</p>
        <p class="t-indent"><span class="t-blue">"specialties"</span>: [<span class="t-green">"Ultra-Fast Next.js 15 Web Apps"</span>, <span class="t-green">"Flutter/React Native Apps"</span>, <span class="t-green">"LLM AI Workflows"</span>]</p>
        <p>}</p>`,
    'contact.config': `<p><span class="t-purple">export const</span> <span class="t-yellow">contactConfig</span> = {</p>
        <p class="t-indent"><span class="t-blue">telegram</span>: <span class="t-green">'https://t.me/Scriptbazar'</span>,</p>
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

// Asynchronous Live GitHub REST API Data Sync for @scriptbazar
async function fetchLiveGitHubStats() {
    try {
        const userRes = await fetch('https://api.github.com/users/scriptbazar');
        if (userRes.ok) {
            const userData = await userRes.json();
            const reposEl = document.getElementById('gh-stat-repos');
            const bioEl = document.getElementById('gh-user-bio');
            const sinceEl = document.getElementById('gh-stat-since');
            
            if (reposEl) reposEl.innerText = userData.public_repos || '8';
            if (bioEl && userData.name) bioEl.innerText = `${userData.name} • Active GitHub Contributor since ${new Date(userData.created_at).getFullYear()}`;
            if (sinceEl && userData.created_at) sinceEl.innerText = new Date(userData.created_at).getFullYear();
        }

        const reposRes = await fetch('https://api.github.com/users/scriptbazar/repos?per_page=100&sort=updated');
        if (reposRes.ok) {
            const reposData = await reposRes.json();
            const reposContainer = document.getElementById('gh-repos-container');
            if (reposContainer && Array.isArray(reposData) && reposData.length > 0) {
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
    } catch (err) {
        console.log('GitHub Live API Sync initialized with cached data.', err);
    }
}
fetchLiveGitHubStats();

// 4. Performance Comparison Draggable Slider
const sliderContainer = document.getElementById('comparison-container');
const fastLayer = document.getElementById('comparison-fast-layer');
const sliderHandle = document.getElementById('slider-handle');

if (sliderContainer && fastLayer && sliderHandle) {
    let isDragging = false;

    const setSliderPos = (x) => {
        const rect = sliderContainer.getBoundingClientRect();
        let offsetX = x - rect.left;
        if (offsetX < 0) offsetX = 0;
        if (offsetX > rect.width) offsetX = rect.width;
        
        const pct = (offsetX / rect.width) * 100;
        fastLayer.style.width = `${pct}%`;
        sliderHandle.style.left = `${pct}%`;
    };

    sliderContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        setSliderPos(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        setSliderPos(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Touch events for mobile
    sliderContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        setSliderPos(e.touches[0].clientX);
    });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        setSliderPos(e.touches[0].clientX);
    });

    window.addEventListener('touchend', () => {
        isDragging = false;
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

let highScore = parseInt(localStorage.getItem('arcade_high_score') || '0', 10);
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
    arcadeCanvas.addEventListener('click', (e) => {
        if (!isPlaying) return;
        const rect = arcadeCanvas.getBoundingClientRect();
        const clickX = (e.clientX - rect.left) * (arcadeCanvas.width / rect.width);
        const clickY = (e.clientY - rect.top) * (arcadeCanvas.height / rect.height);

        for (let i = targets.length - 1; i >= 0; i--) {
            const t = targets[i];
            const dist = Math.hypot(clickX - t.x, clickY - t.y);
            if (dist < t.radius + 18) {
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
                spawnFloatingText(t.x, t.y, multiplier > 1 ? `🔥 ${multiplier}X COMBO! +${earnedPts}` : `+${earnedPts}`, t.color);
                targets.splice(i, 1);
                showToast(multiplier > 1 ? `🔥 ${multiplier}X COMBO! +${earnedPts} PTS` : `💥 +${earnedPts} PTS (${t.label})`);
                break;
            }
        }
    });
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
        localStorage.setItem('arcade_high_score', highScore.toString());
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

// Smart Auto-Hide Floating Dock & Scroll-To-Top Button on Scroll Direction
let lastScrollY = window.scrollY;
const bottomDockContainer = document.getElementById('bottom-dock-container');
const floatingDockWrapper = document.getElementById('floating-dock');
const standaloneScrollTopBtn = document.getElementById('standalone-scroll-top');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const isScrollingDown = currentScrollY > lastScrollY;
    const delta = Math.abs(currentScrollY - lastScrollY);

    if (currentScrollY > 150) {
        if (isScrollingDown && delta > 4) {
            // Scrolling DOWN -> Hide BOTH floating dock and scroll-to-top button!
            if (bottomDockContainer) bottomDockContainer.classList.add('scroll-hidden');
            if (floatingDockWrapper) floatingDockWrapper.classList.add('scroll-hidden');
            if (standaloneScrollTopBtn) {
                standaloneScrollTopBtn.classList.remove('visible');
                standaloneScrollTopBtn.classList.add('scroll-hidden');
            }
        } else if (!isScrollingDown && delta > 4) {
            // Scrolling UP -> Reveal BOTH floating dock and right-aligned scroll-to-top button!
            if (bottomDockContainer) bottomDockContainer.classList.remove('scroll-hidden');
            if (floatingDockWrapper) floatingDockWrapper.classList.remove('scroll-hidden');
            if (standaloneScrollTopBtn) {
                standaloneScrollTopBtn.classList.add('visible');
                standaloneScrollTopBtn.classList.remove('scroll-hidden');
            }
        }
    } else {
        // At or near top of page (scrollY <= 150px)
        // Always show floating dock at top, hide scroll-to-top button at top
        if (bottomDockContainer) bottomDockContainer.classList.remove('scroll-hidden');
        if (floatingDockWrapper) floatingDockWrapper.classList.remove('scroll-hidden');
        if (standaloneScrollTopBtn) {
            standaloneScrollTopBtn.classList.remove('visible');
            standaloneScrollTopBtn.classList.remove('scroll-hidden');
        }
    }

    lastScrollY = currentScrollY;
}, { passive: true });

// Register PWA Service Worker for 0ms Offline Cache
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('GANESHWEB ServiceWorker registered:', reg.scope))
            .catch(err => console.log('ServiceWorker registration failed:', err));
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
            if (tooltipTitle) tooltipTitle.innerText = title;
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
