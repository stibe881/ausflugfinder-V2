/**
 * AusflugFinder Maskottchen Widget
 * Standalone JavaScript Widget für einfache Integration
 */

(function() {
  'use strict';

  const MASCOT_IMAGES = {
    neutral: "mascot_neutral.png",
    waving: "mascot_waving.png",
    jumping: "mascot_jumping.png",
    thinking: "mascot_thinking.png",
    celebrating: "mascot_celebrating.png",
    sleeping: "mascot_sleeping.png",
    eating: "mascot_eating.png",
    curious: "mascot_curious.png",
  };

  const TRICKS = ["waving", "jumping", "celebrating", "sleeping", "eating", "curious"];

  class MascotWidget {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      if (!this.container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
      }

      this.options = {
        basePath: options.basePath || '',
        position: options.position || 'bottom-right',
        ...options
      };

      this.currentImage = MASCOT_IMAGES.neutral;
      this.showFact = false;
      this.currentFact = "";
      this.facts = [];
      this.isAnimating = false;

      this.init();
    }

    async init() {
      await this.loadFacts();
      this.render();
      this.attachEventListeners();
    }

    async loadFacts() {
      try {
        const response = await fetch(this.options.basePath + 'facts_data.json');
        const data = await response.json();
        this.facts = data.facts;
      } catch (err) {
        console.error('Fehler beim Laden der Fakten:', err);
      }
    }

    getImagePath(imageName) {
      return this.options.basePath + imageName;
    }

    render() {
      const positionClasses = {
        'bottom-right': 'mascot-position-bottom-right',
        'bottom-left': 'mascot-position-bottom-left',
        'top-right': 'mascot-position-top-right',
        'top-left': 'mascot-position-top-left',
      };

      const positionClass = positionClasses[this.options.position] || positionClasses['bottom-right'];

      this.container.innerHTML = `
        <div class="ausflugfinder-mascot-widget ${positionClass}">
          <div class="mascot-fact-bubble" style="display: none;">
            <button class="mascot-fact-close" aria-label="Schließen">×</button>
            <p class="mascot-fact-text"></p>
          </div>
          <div class="mascot-container">
            <img 
              src="${this.getImagePath(this.currentImage)}" 
              alt="Murmeltier Maskottchen" 
              class="mascot-image"
              draggable="false"
            />
          </div>
          <div class="mascot-hint">Klick mich! 👆</div>
        </div>
      `;

      this.elements = {
        widget: this.container.querySelector('.ausflugfinder-mascot-widget'),
        factBubble: this.container.querySelector('.mascot-fact-bubble'),
        factText: this.container.querySelector('.mascot-fact-text'),
        factClose: this.container.querySelector('.mascot-fact-close'),
        mascotContainer: this.container.querySelector('.mascot-container'),
        mascotImage: this.container.querySelector('.mascot-image'),
        hint: this.container.querySelector('.mascot-hint'),
      };
    }

    attachEventListeners() {
      this.elements.mascotContainer.addEventListener('click', () => this.handleMascotClick());
      this.elements.factClose.addEventListener('click', () => this.closeFact());
    }

  performTrick(trick) {
    this.isAnimating = true;
    this.elements.mascotImage.src = this.getImagePath(MASCOT_IMAGES[trick]);

    // Sound abspielen
    if (window.MascotSounds) {
      if (trick === 'celebrating' || trick === 'jumping') {
        window.MascotSounds.playHappy();
      } else {
        window.MascotSounds.playWhistle();
      }
    }

    setTimeout(() => {
      this.elements.mascotImage.src = this.getImagePath(MASCOT_IMAGES.neutral);
      this.isAnimating = false;
    }, 2000);
  }

    showRandomFact() {
      if (this.facts.length === 0) return;

      this.isAnimating = true;
      this.elements.mascotImage.src = this.getImagePath(MASCOT_IMAGES.thinking);

      // Click Sound
      if (window.MascotSounds) {
        window.MascotSounds.playClick();
      }

      setTimeout(() => {
        const randomFact = this.facts[Math.floor(Math.random() * this.facts.length)];
        this.elements.factText.textContent = randomFact.text;
        this.elements.factBubble.style.display = 'block';
        this.elements.factBubble.classList.add('mascot-fact-show');
        this.elements.hint.style.display = 'none';
        this.elements.mascotImage.src = this.getImagePath(MASCOT_IMAGES.neutral);
        this.isAnimating = false;

        // Pop Sound
        if (window.MascotSounds) {
          window.MascotSounds.playPop();
        }
      }, 800);
    }

    closeFact() {
      this.elements.factBubble.classList.remove('mascot-fact-show');
      setTimeout(() => {
        this.elements.factBubble.style.display = 'none';
      }, 300);
    }

    handleMascotClick() {
      if (this.isAnimating) return;
      
      // Click Sound
      if (window.MascotSounds) {
        window.MascotSounds.playClick();
      }

      // 50% Chance für Kunststück oder Fakt
      const showTrick = Math.random() > 0.5;

      if (showTrick) {
        const randomTrick = TRICKS[Math.floor(Math.random() * TRICKS.length)];
        this.performTrick(randomTrick);
      } else {
        this.showRandomFact();
      }
    }
  }

  // Widget global verfügbar machen
  window.AusflugFinderMascot = MascotWidget;

  // Auto-Initialisierung wenn Container existiert
  document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('ausflugfinder-mascot');
    if (container) {
      // Basis-Pfad aus dem Script-Tag auslesen oder leer lassen für gleichen Ordner
      const scripts = document.getElementsByTagName('script');
      let basePath = '';
      for (let script of scripts) {
        if (script.src && script.src.includes('mascot-widget.js')) {
          const scriptUrl = script.src;
          basePath = scriptUrl.substring(0, scriptUrl.lastIndexOf('/') + 1);
          break;
        }
      }
      // Wenn kein Pfad gefunden wurde, versuche relativen Pfad
      if (!basePath) {
        basePath = './';
      }
      new MascotWidget('ausflugfinder-mascot', { basePath });
    }
  });
})();
