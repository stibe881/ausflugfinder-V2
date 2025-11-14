/**
 * Murmeltier-Maskottchen Widget
 * Standalone JavaScript Version für einfache Integration
 */

(function() {
  'use strict';

  // Konfiguration
  const CONFIG = {
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    size: 'medium', // small, medium, large
    basePath: '', // Pfad zu den Bildern (leer = gleiches Verzeichnis)
    factsPath: 'facts_data.json', // Pfad zur Fakten-Datei
    bubbleDisplayTime: 8000, // Zeit in ms, wie lange die Sprechblase angezeigt wird
  };

  // Globale Variablen
  let facts = [];
  let currentAnimation = 'waving';
  let lastAnimation = 'waving';
  let isAnimating = false;
  let container, image, speechBubble, speechText;

  // Animations-Typen
  const animations = ['jumping', 'dancing', 'surprised'];

  // Saisonerkennung
  function getCurrentSeason() {
    const month = new Date().getMonth(); // 0-11
    
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

  // Bildpfad generieren
  function getImagePath(animationType) {
    const season = getCurrentSeason();
    const basePath = CONFIG.basePath ? CONFIG.basePath + '/' : '';
    
    if (animationType === 'waving') {
      return basePath + 'marmot_' + season + '.png';
    } else {
      return basePath + 'marmot_family_' + animationType + '.png';
    }
  }

  // Zufälligen Fakt auswählen
  function getRandomFact() {
    if (facts.length === 0) return { text: 'Willkommen!', category: 'info' };
    const randomIndex = Math.floor(Math.random() * facts.length);
    return facts[randomIndex];
  }

  // Zufällige Animation auswählen (ohne Wiederholung)
  function getRandomAnimation() {
    const availableAnimations = animations.filter(anim => anim !== lastAnimation);
    
    if (availableAnimations.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAnimations.length);
      return availableAnimations[randomIndex];
    } else {
      // Fallback
      const randomIndex = Math.floor(Math.random() * animations.length);
      return animations[randomIndex];
    }
  }

  // Sprechblase anzeigen
  function showSpeechBubble(text) {
    speechText.textContent = text;
    speechBubble.classList.remove('hidden');
    speechBubble.classList.add('visible');

    // Nach X Sekunden ausblenden
    setTimeout(function() {
      hideSpeechBubble();
    }, CONFIG.bubbleDisplayTime);
  }

  // Sprechblase ausblenden
  function hideSpeechBubble() {
    speechBubble.classList.remove('visible');
    speechBubble.classList.add('hidden');
  }

  // Animation zurücksetzen
  function resetToWaving() {
    setTimeout(function() {
      if (!isAnimating) {
        currentAnimation = 'waving';
        image.src = getImagePath('waving');
      }
    }, 2000);
  }

  // Click-Handler
  function handleClick() {
    if (isAnimating) return;

    isAnimating = true;
    image.classList.add('mascot-animating');

    // Zufällige Animation auswählen
    const randomAnimation = getRandomAnimation();
    currentAnimation = randomAnimation;
    lastAnimation = randomAnimation;
    image.src = getImagePath(randomAnimation);

    // Zufälligen Fakt anzeigen
    const fact = getRandomFact();
    showSpeechBubble(fact.text);

    // Animation-Lock nach 2 Sekunden aufheben
    setTimeout(function() {
      isAnimating = false;
      image.classList.remove('mascot-animating');
      resetToWaving();
    }, 2000);
  }

  // Fakten laden
  function loadFacts() {
    fetch(CONFIG.factsPath)
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Fakten konnten nicht geladen werden');
        }
        return response.json();
      })
      .then(function(data) {
        facts = data.facts || [];
        console.log('Murmeltier-Maskottchen: ' + facts.length + ' Fakten geladen');
      })
      .catch(function(error) {
        console.error('Murmeltier-Maskottchen Fehler:', error);
        // Fallback-Fakten
        facts = [
          { text: 'Willkommen bei ausflugfinder.ch!', category: 'info' },
          { text: 'Klicken Sie mich für mehr Informationen!', category: 'info' }
        ];
      });
  }

      // Widget initialisieren
    function initWidget() {
      const widget = document.getElementById('ausflugfinder-mascot');
      if (!widget) {
        console.error('Murmeltier-Maskottchen: Element #ausflugfinder-mascot nicht gefunden');
        return;
      }
  
      // Position und Größe setzen
      widget.className = 'mascot-' + CONFIG.position + ' mascot-' + CONFIG.size;
  
      // HTML-Struktur erstellen
      widget.innerHTML = `
        <div class="mascot-container">
          <div class="mascot-speech-bubble hidden">
            <p class="mascot-speech-text"></p>
            <div class="mascot-speech-arrow"></div>
          </div>
          <img class="mascot-image" src="${getImagePath('waving')}" alt="Murmeltier-Familie" draggable="false">
          <div class="mascot-hover-ring"></div>
        </div>
      `;
  
      // Elemente referenzieren
      container = widget.querySelector('.mascot-container');
      image = widget.querySelector('.mascot-image');
      speechBubble = widget.querySelector('.mascot-speech-bubble');
      speechText = widget.querySelector('.mascot-speech-text');
  
      // Event-Listener
      widget.addEventListener('click', handleClick);
  
      // Fakten laden
      loadFacts();
  
      // Initial greeting
      const username = widget.dataset.username;
      console.log('Mascot username:', username);
      let greeting = `Hallo! Ich bin Lumi, dein persönliches Murmeltier-Maskottchen. Ich helfe dir, spannende Ausflüge zu finden und zu planen. Klick mich an, um mehr zu erfahren!`;
      if (username) {
        greeting = `Hallo ${username}! Ich bin Lumi, dein persönliches Murmeltier-Maskottchen. Ich helfe dir, spannende Ausflüge zu finden und zu planen. Klick mich an, um mehr zu erfahren!`;
      }
      showSpeechBubble(greeting);
  
      console.log('Murmeltier-Maskottchen initialisiert (Saison: ' + getCurrentSeason() + ')');
    }
  // Konfiguration überschreiben (optional)
  window.MarmotMascotConfig = function(options) {
    if (options.position) CONFIG.position = options.position;
    if (options.size) CONFIG.size = options.size;
    if (options.basePath) CONFIG.basePath = options.basePath;
    if (options.factsPath) CONFIG.factsPath = options.factsPath;
    if (options.bubbleDisplayTime) CONFIG.bubbleDisplayTime = options.bubbleDisplayTime;
  };

  // Widget beim Laden der Seite initialisieren
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
