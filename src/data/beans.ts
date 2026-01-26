export const beans = [
  {
    id: "2026-01-25-bean1",
    beanKey: "bean1",
    slug: "2026-01-25-bean1",
    date: "2026-01-25",
    time: "05:33",
    title: "Reference cup, gentle balance",
    tags: ["bitterness", "balance", "cooling"],
    coffee: {
      name: "Parable Coffee Co. — Mocha Java",
      roast: "medium-dark",
      profile: "dense · earthy berry · complete"
    },
    brew: {
      brewer: { name: "Hario Switch", slug: "hario-switch" },
      method: "Easy Immersion",
      recipe: { name: "Easy Immersion", slug: "easy-immersion" },
      notes: ["Even release and a very level bed.", "Clean finish with minimal agitation."]
    },
    brewDetails: {
      dose: "15.9 g",
      water: "250.3 g",
      ratio: "~1 : 15.7",
      grinder: { name: "Timemore C5 ESP Pro", slug: "timemore-c5-esp-pro" },
      grind: "(same as prior)",
      release: "2:30",
      total: "3:37"
    },
    observations: [
      "The cup opened sparkly.",
      "Balanced acidity up front, nothing sharp.",
      "As it cooled, nutty overtones came forward and stayed.",
      "This felt like a reference cup.",
      "Nothing exaggerated.",
      "Everything in proportion."
    ],
    gear: []
  },
  {
    id: "2026-01-25-bean2",
    beanKey: "bean2",
    slug: "2026-01-25-bean2",
    date: "2026-01-25",
    time: "07:01",
    title: "Mocha edge with synesthesia",
    tags: ["mocha", "synesthesia", "weather"],
    coffee: {
      name: "Parable Coffee Co. — Mocha Java"
    },
    brew: {
      brewer: { name: "Hario Switch", slug: "hario-switch" },
      method: "Easy Immersion (minor workflow variations)",
      recipe: { name: "Easy Immersion", slug: "easy-immersion" },
      notes: [
        "Simulated RDT by wetting the mug before dosing.",
        "Slightly hotter slurry for the first minute."
      ]
    },
    brewDetails: {
      dose: "16.0 g",
      water: "256.8 g",
      ratio: "1 : 16",
      grinder: { name: "Timemore Chestnut", slug: "timemore-chestnut" },
      setting: "1.8.1 (coarser)",
      temp: "~90 °C",
      release: "2:30",
      total: "3:28"
    },
    observations: [
      "First sip was mocha-forward.",
      "A small, delicate burst right on the tongue.",
      "Bitterness dropped into the range I like.",
      "When I pressed my tongue to the roof of my mouth while swishing, the bitterness registered as a high-pitched tone — felt behind the eyes rather than on the tongue.",
      "Overcast.",
      "Snowstorm imminent but not yet started.",
      "The cup felt alert, not heavy."
    ],
    gear: []
  },
  {
    id: "2026-01-24-bean2",
    beanKey: "bean2",
    slug: "2026-01-24-bean2",
    date: "2026-01-24",
    time: "06:15",
    title: "Cold walk, music, grounded cup",
    tags: ["cold", "walking", "music"],
    coffee: {
      name: "Parable Coffee Co.",
      blend: "70% Sourdough · 30% Cold Winter"
    },
    brew: {
      brewer: { name: "Metal cone", slug: "metal-cone" },
      method: "No paper filter",
      recipe: { name: "Metal Cone Walk", slug: "metal-cone-walk" },
      notes: ["Outdoor brewing, wind shielding with the mug.", "Longer drawdown from cold air."]
    },
    brewDetails: {
      dose: "25.0 g",
      water: "354.4 g",
      time: "5:27"
    },
    observations: [
      "Walking outside.",
      "~10°F.",
      "Pink and purple on the horizon.",
      "Listening to the final minutes of Rachmaninoff Piano Concerto No. 3.",
      "Eyes watered while drinking.",
      "Then Bach: Partita No. 2 in C minor.",
      "Wanted to sit down and play.",
      "The cold sharpened everything.",
      "The coffee felt grounding against the music — less about flavor notes, more about staying present in the body."
    ],
    gear: []
  }
];

export const allTags = Array.from(new Set(beans.flatMap((bean) => bean.tags))).sort();
