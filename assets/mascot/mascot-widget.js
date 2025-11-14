/**
 * Murmeltier-Maskottchen Widget
 * Class-based JavaScript Version für einfache Integration
 */

class AusflugFinderMascot {
  constructor(elementId, options = {}) {
    this.elementId = elementId;
    this.CONFIG = {
      position: options.position || 'bottom-right',
      size: options.size || 'medium',
      basePath: options.basePath || '',
      factsPath: options.factsPath || 'facts_data.json',
      bubbleDisplayTime: options.bubbleDisplayTime || 8000,
    };

    this.facts = [];
    this.currentAnimation = 'waving';
    this.lastAnimation = 'waving';
    this.isAnimating = false;
    this.container = null;
    this.image = null;
    this.speechBubble = null;
    this.speechText = null;
    this.animations = ['jumping', 'dancing', 'surprised'];

    this.init();
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month === 11 || month === 0 || month === 1) {
      return 'winter';
    } else if (month >= 2 && month <= 4) {
      return 'spring';
    } else if (month >= 5 && month <= 7) {
      return 'summer';
    } else {
      return 'autumn';
    }
  }

  getImagePath(animationType) {
    const season = this.getCurrentSeason();
    const basePath = this.CONFIG.basePath ? this.CONFIG.basePath + '/' : '';

    if (animationType === 'waving') {
      return basePath + 'mascot_' + season + '.png';
    } else {
      return basePath + 'mascot_' + animationType + '.png';
    }
  }

  getRandomFact() {
    if (this.facts.length === 0) return { text: 'Willkommen!', category: 'info' };
    const randomIndex = Math.floor(Math.random() * this.facts.length);
    return this.facts[randomIndex];
  }

  getRandomAnimation() {
    const availableAnimations = this.animations.filter(anim => anim !== this.lastAnimation);

    if (availableAnimations.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAnimations.length);
      return availableAnimations[randomIndex];
    } else {
      const randomIndex = Math.floor(Math.random() * this.animations.length);
      return this.animations[randomIndex];
    }
  }

  showSpeechBubble(text) {
    if (!this.speechText || !this.speechBubble) {
      console.warn('✗ Sprechblase oder Text-Element nicht gefunden');
      return;
    }

    console.log('→ Zeige Sprechblase:', text.substring(0, 50) + '...');
    this.speechText.textContent = text;
    this.speechBubble.classList.remove('hidden');
    this.speechBubble.classList.add('visible');

    setTimeout(() => {
      this.hideSpeechBubble();
    }, this.CONFIG.bubbleDisplayTime);
  }

  hideSpeechBubble() {
    if (!this.speechBubble) return;

    this.speechBubble.classList.remove('visible');
    this.speechBubble.classList.add('hidden');
  }

  resetToWaving() {
    setTimeout(() => {
      if (!this.isAnimating && this.image) {
        this.currentAnimation = 'waving';
        this.image.src = this.getImagePath('waving');
      }
    }, 2000);
  }

  handleClick = () => {
    if (this.isAnimating) return;

    this.isAnimating = true;
    if (this.image) {
      this.image.classList.add('mascot-animating');
    }

    const randomAnimation = this.getRandomAnimation();
    this.currentAnimation = randomAnimation;
    this.lastAnimation = randomAnimation;
    if (this.image) {
      this.image.src = this.getImagePath(randomAnimation);
    }

    const fact = this.getRandomFact();
    this.showSpeechBubble(fact.text);

    setTimeout(() => {
      this.isAnimating = false;
      if (this.image) {
        this.image.classList.remove('mascot-animating');
      }
      this.resetToWaving();
    }, 2000);
  }

  loadFacts() {
    fetch(this.CONFIG.factsPath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Fakten konnten nicht geladen werden');
        }
        return response.json();
      })
      .then(data => {
        this.facts = data.facts || [];
        console.log('✓ Murmeltier-Maskottchen: ' + this.facts.length + ' Fakten geladen');
      })
      .catch(error => {
        console.error('✗ Murmeltier-Maskottchen Fehler:', error);
        this.facts = [
          { text: 'Willkommen bei ausflugfinder.ch!', category: 'info' },
          { text: 'Klicken Sie mich für mehr Informationen!', category: 'info' }
        ];
      });
  }

  initWidget() {
    const widget = document.getElementById(this.elementId);
    if (!widget) {
      console.error('✗ Murmeltier-Maskottchen: Element #' + this.elementId + ' nicht gefunden');
      return;
    }

    widget.className = 'mascot-' + this.CONFIG.position + ' mascot-' + this.CONFIG.size;

    widget.innerHTML = `
      <div class="mascot-container">
        <div class="mascot-speech-bubble hidden">
          <p class="mascot-speech-text"></p>
          <div class="mascot-speech-arrow"></div>
        </div>
        <img class="mascot-image" src="${this.getImagePath('waving')}" alt="Murmeltier-Familie" draggable="false">
        <div class="mascot-hover-ring"></div>
      </div>
    `;

    this.container = widget.querySelector('.mascot-container');
    this.image = widget.querySelector('.mascot-image');
    this.speechBubble = widget.querySelector('.mascot-speech-bubble');
    this.speechText = widget.querySelector('.mascot-speech-text');

    widget.addEventListener('click', this.handleClick);

    this.loadFacts();

    const username = widget.dataset.username;
    console.log('→ Mascot username:', username);
    let greeting = `Hallo! Ich bin Lumi, dein persönliches Murmeltier-Maskottchen. Ich helfe dir, spannende Ausflüge zu finden und zu planen. Klick mich an, um mehr zu erfahren!`;
    if (username && username.trim()) {
      greeting = `Hallo ${username}! Ich bin Lumi, dein persönliches Murmeltier-Maskottchen. Ich helfe dir, spannende Ausflüge zu finden und zu planen. Klick mich an, um mehr zu erfahren!`;
    }
    this.showSpeechBubble(greeting);

    console.log('✓ Murmeltier-Maskottchen initialisiert (Saison: ' + this.getCurrentSeason() + ')');
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initWidget());
    } else {
      this.initWidget();
    }
  }
}

// Expose to window for global access
window.AusflugFinderMascot = AusflugFinderMascot;
