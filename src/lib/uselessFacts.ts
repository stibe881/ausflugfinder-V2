/**
 * Unnützes Wissen über Natur, Ausflüge, Geschichte und Schweiz
 * für das Murmeltier-Maskottchen
 */

export interface UselessFact {
  text: string;
  category: 'natur' | 'ausflug' | 'geschichte' | 'schweiz';
}

export const uselessFacts: UselessFact[] = [
  // Natur
  {
    text: "Murmeltiere halten 6-7 Monate Winterschlaf und verlieren dabei bis zu 50% ihres Körpergewichts!",
    category: 'natur'
  },
  {
    text: "Murmeltiere pfeifen zur Warnung vor Gefahren - daher der Name 'Pfeiferli' in der Schweiz!",
    category: 'natur'
  },
  {
    text: "Ein Murmeltier kann bis zu 200 Mal pro Minute atmen, wenn es aufgeregt ist!",
    category: 'natur'
  },
  {
    text: "Murmeltiere leben in Kolonien von bis zu 20 Tieren und haben ein komplexes Sozialsystem!",
    category: 'natur'
  },
  {
    text: "Der Herzschlag eines Murmeltiers sinkt im Winterschlaf von 200 auf nur 5 Schläge pro Minute!",
    category: 'natur'
  },
  {
    text: "Edelweiss wächst nur in Höhen über 1800 Metern und ist streng geschützt!",
    category: 'natur'
  },
  {
    text: "Die Alpen wachsen jedes Jahr um etwa 1 Millimeter - durch die Kollision der Kontinentalplatten!",
    category: 'natur'
  },
  {
    text: "In der Schweiz gibt es über 1500 Seen - das sind mehr als in jedem anderen europäischen Land!",
    category: 'natur'
  },
  
  // Ausflüge
  {
    text: "Die Schweiz hat über 65'000 Kilometer markierte Wanderwege - das längste Wanderwegnetz der Welt!",
    category: 'ausflug'
  },
  {
    text: "Der Aletschgletscher ist mit 23 Kilometern der längste Gletscher der Alpen!",
    category: 'ausflug'
  },
  {
    text: "Die Pilatus-Bahn ist mit 48% Steigung die steilste Zahnradbahn der Welt!",
    category: 'ausflug'
  },
  {
    text: "In der Schweiz gibt es über 200 Berggipfel, die höher als 3000 Meter sind!",
    category: 'ausflug'
  },
  {
    text: "Der Rheinfall bei Schaffhausen ist mit 150 Metern Breite der größte Wasserfall Europas!",
    category: 'ausflug'
  },
  {
    text: "Die Schweiz hat mehr als 7000 Bergseen - perfekt für Wanderungen und Picknicks!",
    category: 'ausflug'
  },
  {
    text: "Das Jungfraujoch auf 3454m ist die höchstgelegene Bahnstation Europas!",
    category: 'ausflug'
  },
  
  // Geschichte
  {
    text: "Die Schweiz ist seit 1815 neutral und hat seither an keinem Krieg teilgenommen!",
    category: 'geschichte'
  },
  {
    text: "Der Gotthard-Basistunnel ist mit 57 Kilometern der längste Eisenbahntunnel der Welt!",
    category: 'geschichte'
  },
  {
    text: "Wilhelm Tell ist eine Legende - es gibt keine historischen Beweise für seine Existenz!",
    category: 'geschichte'
  },
  {
    text: "Die Schweizer Garde beschützt den Papst seit 1506 - über 500 Jahre!",
    category: 'geschichte'
  },
  {
    text: "Das Schweizerische Rote Kreuz wurde 1863 von Henry Dunant gegründet!",
    category: 'geschichte'
  },
  {
    text: "Die erste Zahnradbahn Europas wurde 1871 auf die Rigi gebaut!",
    category: 'geschichte'
  },
  
  // Schweiz
  {
    text: "In der Schweiz werden vier Landessprachen gesprochen: Deutsch, Französisch, Italienisch und Rätoromanisch!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz hat mehr als 450 verschiedene Käsesorten - Käsefondue ist Nationalgericht!",
    category: 'schweiz'
  },
  {
    text: "Schweizer essen durchschnittlich 11 Kilogramm Schokolade pro Jahr - Weltrekord!",
    category: 'schweiz'
  },
  {
    text: "In der Schweiz gibt es mehr Banken als Zahnärzte!",
    category: 'schweiz'
  },
  {
    text: "Das Matterhorn ist 4478 Meter hoch und einer der bekanntesten Berge der Welt!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz hat die höchste Dichte an Museen weltweit - über 1100 Museen!",
    category: 'schweiz'
  },
  {
    text: "Der Schweizer Taschenmesser-Hersteller Victorinox produziert täglich 45'000 Messer!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz recycelt 94% aller Glasflaschen - Weltmeister im Recycling!",
    category: 'schweiz'
  },
  {
    text: "In Zürich gibt es mehr Brunnen als in Rom - über 1200 öffentliche Trinkbrunnen!",
    category: 'schweiz'
  },
  {
    text: "Die Schweizer Uhrenindustrie exportiert jährlich Uhren im Wert von über 20 Milliarden Franken!",
    category: 'schweiz'
  },
  
  // Weitere Natur-Fakten
  {
    text: "Ein Steinbock kann bis zu 3,5 Meter hoch springen - das ist höher als ein Elefant!",
    category: 'natur'
  },
  {
    text: "Der Bartgeier ist der einzige Vogel, der sich hauptsächlich von Knochen ernährt!",
    category: 'natur'
  },
  {
    text: "Alpenblumen können Temperaturen bis -40°C überleben!",
    category: 'natur'
  },
  {
    text: "Der Enzian blüht erst nach 10-60 Jahren zum ersten Mal!",
    category: 'natur'
  },
  {
    text: "In den Schweizer Alpen leben über 30.000 verschiedene Tierarten!",
    category: 'natur'
  },
  {
    text: "Gämsen können auf nur 5cm breiten Felsvorsprüngen stehen!",
    category: 'natur'
  },
  {
    text: "Der Alpensalamander ist lebendgebärend und bringt nur 2 Junge zur Welt!",
    category: 'natur'
  },
  
  // Weitere Ausflug-Fakten
  {
    text: "Die Schweiz hat über 1500 Berghütten - mehr als jedes andere Land!",
    category: 'ausflug'
  },
  {
    text: "Der Vierwaldstättersee hat eine maximale Tiefe von 214 Metern!",
    category: 'ausflug'
  },
  {
    text: "Die Schöllenenschlucht war früher so gefährlich, dass sie 'Teufelsbrücke' genannt wurde!",
    category: 'ausflug'
  },
  {
    text: "Der Creux du Van ist ein 160 Meter hoher Felskessel - ein natürliches Amphitheater!",
    category: 'ausflug'
  },
  {
    text: "Die Trümmelbachfälle sind die einzigen unterirdischen Gletscherwasserfälle Europas!",
    category: 'ausflug'
  },
  {
    text: "Der Oeschinensee wurde 2007 zum schönsten Bergsee der Schweiz gewählt!",
    category: 'ausflug'
  },
  {
    text: "Die Gornergratbahn fährt seit 1898 und ist die zweithöchste Bergbahn Europas!",
    category: 'ausflug'
  },
  
  // Weitere Geschichte-Fakten
  {
    text: "Die Schweiz hatte nie einen König - sie ist seit 1291 eine Eidgenossenschaft!",
    category: 'geschichte'
  },
  {
    text: "Der Rütlischwur von 1291 gilt als Gründungsdatum der Schweiz!",
    category: 'geschichte'
  },
  {
    text: "Die erste Postkutsche fuhr 1849 zwischen Bern und Genf!",
    category: 'geschichte'
  },
  {
    text: "Das Frauenstimmrecht wurde in der Schweiz erst 1971 eingeführt!",
    category: 'geschichte'
  },
  {
    text: "Der Simplontunnel war bei seiner Eröffnung 1906 der längste Tunnel der Welt!",
    category: 'geschichte'
  },
  {
    text: "Die Schweizer Flagge ist neben der Vatikanflagge die einzige quadratische Nationalflagge!",
    category: 'geschichte'
  },
  
  // Weitere Schweiz-Fakten
  {
    text: "In der Schweiz gibt es mehr als 7000 registrierte Vereine - Vereinskultur ist riesig!",
    category: 'schweiz'
  },
  {
    text: "Schweizer trinken durchschnittlich 128 Liter Bier pro Jahr!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz hat 26 Kantone und jeder hat seine eigene Verfassung!",
    category: 'schweiz'
  },
  {
    text: "In Appenzell Innerrhoden wird noch per Handaufheben abgestimmt - die Landsgemeinde!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz produziert jährlich über 200.000 Tonnen Käse!",
    category: 'schweiz'
  },
  {
    text: "Der längste Bahnhof der Schweiz ist Bern mit 490 Metern Länge!",
    category: 'schweiz'
  },
  {
    text: "In der Schweiz werden pro Kopf und Jahr 9 Kilogramm Kaffee getrunken!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz hat die höchste Dichte an Seilbahnen weltweit - über 2000!",
    category: 'schweiz'
  },
  {
    text: "Schweizer Schokolade wurde 1875 von Daniel Peter erfunden - die erste Milchschokolade!",
    category: 'schweiz'
  },
  {
    text: "Die Schweiz hat mehr als 100 verschiedene Brotsorten!",
    category: 'schweiz'
  }
];

/**
 * Gibt einen zufälligen Fakt zurück
 */
export function getRandomFact(): UselessFact {
  const randomIndex = Math.floor(Math.random() * uselessFacts.length);
  return uselessFacts[randomIndex];
}

/**
 * Gibt einen zufälligen Fakt einer bestimmten Kategorie zurück
 */
export function getRandomFactByCategory(category: UselessFact['category']): UselessFact {
  const categoryFacts = uselessFacts.filter(fact => fact.category === category);
  const randomIndex = Math.floor(Math.random() * categoryFacts.length);
  return categoryFacts[randomIndex];
}
