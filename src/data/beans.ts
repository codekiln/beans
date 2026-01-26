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
      recipe: { name: "Switch easy immersion", slug: "switch-easy-immersion" },
      notes: ["Immersion release at 2:30.", "Clean, even drawdown."]
    },
    brewTable: {
      coffee: "Parable Coffee Co. — Mocha Java",
      dose: "15.9 g",
      water: "250.3 g",
      ratio: "~1 : 15.7",
      grind: "(same as prior)",
      release: "2:30",
      total: "3:37"
    },
    observations: [
      "Very even bed at finish.",
      "Drawdown was clean and unremarkable — in a good way.",
      "The cup opened sparkly.",
      "Balanced acidity up front, nothing sharp.",
      "As it cooled, nutty overtones came forward and stayed.",
      "This felt like a reference cup.",
      "Nothing exaggerated.",
      "Everything in proportion."
    ],
    gear: [
      { label: "grinder", value: "Timemore C5 ESP Pro", slug: "timemore-c5-esp-pro" },
      { label: "brewer", value: "Hario Switch", slug: "hario-switch" }
    ]
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
      recipe: { name: "Switch easy immersion", slug: "switch-easy-immersion" },
      notes: ["Minor workflow variations.", "Slightly hotter than the earlier cup."]
    },
    brewTable: {
      coffee: "Parable Coffee Co. — Mocha Java",
      dose: "16.0 g",
      water: "256.8 g",
      ratio: "1 : 16",
      grind: "1.8.1 (coarser)",
      temp: "~90 °C",
      release: "2:30",
      total: "3:28"
    },
    observations: [
      "Simulated RDT — beans contacted residual water in the mug.",
      "First sip was mocha-forward.",
      "A small, delicate burst right on the tongue.",
      "Bitterness dropped into the range I like.",
      "When I pressed my tongue to the roof of my mouth while swishing, the bitterness registered as a high-pitched tone — felt behind the eyes rather than on the tongue.",
      "Overcast.",
      "Snowstorm imminent but not yet started.",
      "The cup felt alert, not heavy."
    ],
    gear: [
      { label: "grinder", value: "Timemore Chestnut", slug: "timemore-chestnut" },
      { label: "brewer", value: "Hario Switch", slug: "hario-switch" }
    ]
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
      recipe: { name: "Metal cone (no paper)", slug: "metal-cone-no-paper" },
      notes: ["No paper filter.", "Heavier oils in the cup."]
    },
    brewTable: {
      coffee: "Parable Coffee Co.",
      dose: "25.0 g",
      water: "354.4 g",
      total: "5:27"
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
    gear: [
      { label: "brewer", value: "Metal cone", slug: "metal-cone" }
    ]
  }
];

export const allTags = Array.from(new Set(beans.flatMap((bean) => bean.tags))).sort();
