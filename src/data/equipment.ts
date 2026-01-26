export const equipment = [
  {
    slug: "timemore-c5-esp-pro",
    name: "Timemore C5 ESP Pro",
    type: "grinder",
    notes: [
      "Hand grinder with repeatable stepped adjustments.",
      "Reference point for daily brews and ratio experiments."
    ],
    related: ["timemore-chestnut"]
  },
  {
    slug: "timemore-chestnut",
    name: "Timemore Chestnut",
    type: "grinder",
    notes: [
      "Older hand grinder with slightly broader particle spread.",
      "Used here for coarser settings and tactile comparisons."
    ],
    related: ["timemore-c5-esp-pro"]
  },
  {
    slug: "hario-switch",
    name: "Hario Switch",
    type: "brewer",
    notes: [
      "Immersion-capable dripper with clean release.",
      "Primary brewer for switchable immersion experiments."
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
