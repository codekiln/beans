export const equipment = [
  {
    slug: "timemore-c5-esp-pro",
    name: "Timemore C5 ESP Pro",
    type: "grinder",
    aliases: [
      { slug: "timemore-chestnut", name: "Timemore Chestnut" }
    ],
    notes: [
      "Hand grinder with repeatable stepped adjustments.",
      "Reference point for daily brews and ratio experiments."
    ],
    references: [
      { label: "Amazon", url: "https://www.amazon.com/dp/B0FHH9GG1M" }
    ],
    related: []
  },
  {
    slug: "hario-switch",
    name: "Hario Switch",
    type: "brewer",
    notes: [
      "Immersion-capable dripper with clean release.",
      "Primary brewer for switchable immersion experiments."
    ],
    references: [
      { label: "Amazon", url: "https://www.amazon.com/dp/B09JL4R6SX" }
    ],
    related: []
  },
  {
    slug: "maestri-house-mini-scale",
    name: "Maestri House Mini Coffee Scale",
    type: "scale",
    notes: [
      "Compact USB-C rechargeable scale with timer.",
      "Used for pour-over and espresso weight tracking."
    ],
    references: [
      { label: "Amazon", url: "https://www.amazon.com/dp/B0CQY78HV6" }
    ],
    related: []
  },
  {
    slug: "mastery-house-scale-timer",
    name: "Mastery House Scale & Timer",
    type: "scale",
    notes: [
      "Simple scale with integrated timer.",
      "Used for early morning Hario Switch brews."
    ],
    related: []
  },
  {
    slug: "metal-cone",
    name: "Metal cone",
    type: "brewer",
    notes: [
      "No paper filter, more oils and weight in the cup.",
      "Useful for cold walks and outdoor brews."
    ],
    related: []
  }
];

export const equipmentTypes = Array.from(new Set(equipment.map((item) => item.type))).sort();
