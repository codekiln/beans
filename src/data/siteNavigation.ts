export type SiteNavigationItem = {
  command: string;
  href: string;
  label: string;
  matchPrefix?: string;
};

export const siteNavigation: SiteNavigationItem[] = [
  { command: "bean about", href: "/about/", label: "about" },
  { command: "bean equipment", href: "/equipment/", label: "equipment", matchPrefix: "/equipment/" },
  { command: "bean recipes", href: "/recipes/", label: "recipes", matchPrefix: "/recipes/" },
  { command: "bean roasters", href: "/roasters/", label: "roasters", matchPrefix: "/roasters/" },
  { command: "bean coffees", href: "/coffees/", label: "coffees", matchPrefix: "/coffees/" },
  { command: "bean companions", href: "/companion/", label: "companions", matchPrefix: "/companion/" },
  { command: "bean questions", href: "/questions/", label: "questions", matchPrefix: "/questions/" },
  { command: "bean terms", href: "/terms/", label: "terms", matchPrefix: "/terms/" }
];
