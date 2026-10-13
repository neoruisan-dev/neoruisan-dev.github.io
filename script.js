// ==================== CONFIGURACIÓN E INICIALIZACIÓN ====================
const config = {
  navbarHeight: 70,
  scrollOffset: 100,
  parallaxRate: 0.5,
  observerThreshold: 0.1,
  observerMargin: "0px 0px -50px 0px",
};

// loading screen 
window.addEventListener('load', function() {
    setTimeout(function() {
        const loader = document.getElementById('loader-wrapper'); // selection of the loader element
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    }, 500);
});

// ==================== UTILIDADES ====================
const utils = {
  getElement: (selector) => document.querySelector(selector),
  getAllElements: (selector) => document.querySelectorAll(selector),

  smoothScroll: (targetPosition, offset = 0) => {
    window.scrollTo({
      top: targetPosition - offset,
      behavior: "smooth",
    });
  },

  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

const today = new Date();
const year = today.getFullYear();
const month = today.toLocaleString("default", { month: "long" });
const day = today.getDate();

const footerText = document.getElementById("footer-text");
if (footerText) {
  footerText.innerHTML = `&copy; Building ideas in code! — ${day} ${month} ${year}`;
}

// ==================== NAVEGACIÓN Y SCROLL ====================
class Navigation {
  constructor() {
    this.navbar = utils.getElement(".navbar");
    this.navLinks = utils.getAllElements(".nav-link");
    this.sections = utils.getAllElements("section[id]");
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
    this.setupScrollEffects();
    this.setupMobileMenu();
  }

  setupSmoothScrolling() {
    utils.getAllElements('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const targetElement = utils.getElement(anchor.getAttribute("href"));

        if (targetElement) {
          const extraOffset = -40;
          const offsetPosition =
            targetElement.offsetTop - config.navbarHeight - extraOffset;
          utils.smoothScroll(offsetPosition);
        }
      });
    });
  }

  setupScrollEffects() {
    const debouncedScrollHandler = utils.debounce(() => {
      this.updateNavbarStyle();
      this.updateActiveLink();
    }, 10);

    window.addEventListener("scroll", debouncedScrollHandler);
  }

  updateNavbarStyle() {
    if (!this.navbar) return;

    const isScrolled = window.scrollY > 50;
    this.navbar.classList.toggle("scrolled", isScrolled);
  }

  updateActiveLink() {
    const scrollY = window.scrollY + config.scrollOffset;
    let currentId = window.scrollY < 100 ? "home" : "";

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentId = section.id;
      }
    });

    this.navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${currentId}`;
      link.classList.toggle("active", isActive);
    });
  }

  setupMobileMenu() {
    this.navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const navbarCollapse = utils.getElement(".navbar-collapse");
        if (navbarCollapse?.classList.contains("show")) {
          new bootstrap.Collapse(navbarCollapse).hide();
        }
      });
    });
  }
}

// ==================== ANIMACIONES ====================
class Animations {
  constructor() {
    this.hero = utils.getElement(".hero");
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupSkillObserver();
    this.setupParallax();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: config.observerThreshold,
        rootMargin: config.observerMargin,
      }
    );

    utils.getAllElements(".fade-in").forEach((el) => observer.observe(el));
  }

  setupSkillObserver() {
    const skillsSection = utils.getElement(".skills");
    if (!skillsSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll(".skill-progress").forEach((bar) => {
              bar.style.width = bar.dataset.width;
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(skillsSection);
  }

  setupParallax() {
    if (!this.hero) return;

    const debouncedParallax = utils.debounce(() => {
      const scrolled = window.pageYOffset;
      this.hero.style.transform = `translateY(${
        scrolled * config.parallaxRate
      }px)`;
    }, 5);

    window.addEventListener("scroll", debouncedParallax);
  }
}

// ==================== COPIAR CORREO AL PORTAPAPELES ====================
document.addEventListener("DOMContentLoaded", function () {
  const copyBtn = document.getElementById("copyEmailBtn");
  const emailInput = document.getElementById("emailInput");
  const copyMsg = document.getElementById("copyMsg");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(emailInput.value).then(function () {
        copyMsg.style.display = "inline";
        setTimeout(() => (copyMsg.style.display = "none"), 1500);
      });
    });
  }
});

// ==================== INICIALIZACIÓN ====================
class App {
  constructor() {
    this.navigation = null;
    this.animations = null;
    this.init();
  }

  init() {
    // Configuración inicial
    this.setupInitialStyles();

    // Inicializar componentes
    this.navigation = new Navigation();
    this.animations = new Animations();

    // Alinear secciones a la cuadrícula de fondo (múltiplos exactos de 36px)
    this.setupGridAlignment();

    // Eventos de carga
    this.setupLoadEvents();
  }

  setupInitialStyles() {
    document.body.style.opacity = "0";
    document.body.style.transition = "opacity 0.3s ease";
  }

  setupGridAlignment() {
    const align = () => {
      const GRID_SIZE = 36;
      const sections = utils.getAllElements("section.section-padding");
      if (!sections || !sections.length) return;

      // 1. Resetear padding-bottom inline para medir layout base
      sections.forEach((section) => {
        section.style.paddingBottom = "";
      });

      // 2. Medir y ajustar padding-bottom para que offsetHeight sea múltiplo exacto de GRID_SIZE
      sections.forEach((section) => {
        const height = section.offsetHeight;
        const remainder = height % GRID_SIZE;
        if (remainder !== 0) {
          const needed = GRID_SIZE - remainder;
          const basePadding = parseFloat(window.getComputedStyle(section).paddingBottom) || 0;
          section.style.paddingBottom = `${basePadding + needed}px`;
        }
      });
    };

    // Ejecución inmediata inicial
    align();

    // Ejecutar tras carga de fuentes web (Google Fonts Poppins)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(align);
    }

    // Ejecutar tras carga completa de recursos (imágenes, iconos)
    window.addEventListener("load", align);

    // Ejecutar en redimensionamiento de ventana con debounce
    const debouncedAlign = utils.debounce(align, 100);
    window.addEventListener("resize", debouncedAlign);
    window.addEventListener("orientationchange", () => setTimeout(align, 150));
  }

  setupLoadEvents() {
    window.addEventListener("load", () => {
      document.body.style.opacity = "1";
    });
  }
}

// ==================== INICIO DE LA APLICACIÓN ==================== 
document.addEventListener("DOMContentLoaded", () => {
  new App();
});

console.log(
  "%cHEY WHAT ARE YOU DOING HERE!!!? \n\n%c" +
  `⠀⠀⢀⣠⠤⠶⠖⠒⠒⠶⠦⠤⣄⠀⠀⠀⣀⡤⠤⠤⠤⠤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⣴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⣦⠞⠁⠀⠀⠀⠀⠀⠀⠉⠳⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⡾⠁⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⣀⣀⣘⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢀⡴⠚⠉⠁⠀⠀⠀⠀⠈⠉⠙⠲⣄⣤⠤⠶⠒⠒⠲⠦⢤⣜⣧⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⡄⠀⠀⠀⠀⠀⠀⠀⠉⠳⢄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⠹⣆⠀⠀⠀⠀⠀⠀⣀⣀⣀⣹⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⣠⠞⣉⣡⠤⠴⠿⠗⠳⠶⣬⣙⠓⢦⡈⠙⢿⡀⠀⠀⢀⣼⣿⣿⣿⣿⣿⡿⣷⣤⡀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⣾⣡⠞⣁⣀⣀⣀⣠⣤⣤⣤⣄⣭⣷⣦⣽⣦⡀⢻⡄⠰⢟⣥⣾⣿⣏⣉⡙⠓⢦⣻⠃⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠉⠉⠙⠻⢤⣄⣼⣿⣽⣿⠟⠻⣿⠄⠀⠀⢻⡝⢿⡇⣠⣿⣿⣻⣿⠿⣿⡉⠓⠮⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠙⢦⡈⠛⠿⣾⣿⣶⣾⡿⠀⠀⠀⢀⣳⣘⢻⣇⣿⣿⣽⣿⣶⣾⠃⣀⡴⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⠤⢄⣈⣉⣙⣓⣒⣒⣚⣉⣥⠟⠀⢯⣉⡉⠉⠉⠛⢉⣉⣡⡾⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⣠⣤⡤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⡿⠋⠀⠀⠀⠀⠈⠻⣍⠉⠀⠺⠿⠋⠙⣦⠀⠀⠀⠀⠀⠀⠀
⠀⣀⣥⣤⠴⠆⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⠖⠋⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⠀⠀⠀⠀⠀⢸⣧⠀⠀⠀⠀⠀⠀
⠸⢫⡟⠙⣛⠲⠤⣄⣀⣀⠀⠈⠋⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠏⣨⠇⠀⠀⠀⠀⠀
⠀⠀⠻⢦⣈⠓⠶⠤⣄⣉⠉⠉⠛⠒⠲⠦⠤⠤⣤⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣀⣠⠴⢋⡴⠋⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠉⠓⠦⣄⡀⠈⠙⠓⠒⠶⠶⠶⠶⠤⣤⣀⣀⣀⣀⣀⣉⣉⣉⣉⣉⣀⣠⠴⠋⣿⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠉⠓⠦⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⡼⠁⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠙⠛⠒⠒⠒⠒⠒⠤⠤⠤⠒⠒⠒⠒⠒⠒⠚⢉⡇⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠴⠚⠛⠳⣤⠞⠁⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⠚⠁⠀⠀⠀⠀⠘⠲⣄⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⠋⠙⢷⡋⢙⡇⢀⡴⢒⡿⢶⣄⡴⠀⠙⠳⣄⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢦⡀⠈⠛⢻⠛⢉⡴⣋⡴⠟⠁⠀⠀⠀⠀⠈⢧⡀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⡄⠀⠘⣶⢋⡞⠁⠀⠀⢀⡴⠂⠀⠀⠀⠀⠹⣄⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⠈⠻⢦⡀⠀⣰⠏⠀⠀⢀⡴⠃⢀⡄⠙⣆⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡾⢷⡄⠀⠀⠀⠀⠉⠙⠯⠀⠀⡴⠋⠀⢠⠟⠀⠀⢹⡄`,
  "color: red; font-size: 20px; font-weight: bold;",
  "color: lightgreen; font-family: monospace;"
);