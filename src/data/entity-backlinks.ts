import { getBeanRouteInfoMap, getBeans, getInlineCompanionSlugs } from "./beans";
import { getCoffees } from "./coffees";
import { getCompanions } from "./companions";
import { getEquipment } from "./equipment";
import { getQuestions } from "./questions";
import { getRecipes } from "./recipes";
import { getRoasters } from "./roasters";
import { getTerms } from "./terms";

export type EntityKind =
  | "term"
  | "coffee"
  | "roaster"
  | "companion"
  | "equipment"
  | "recipe"
  | "question";

export type BacklinkSourceKind =
  | "beans"
  | "coffees"
  | "roasters"
  | "companions"
  | "equipment"
  | "recipes"
  | "questions"
  | "terms";

export type EntityBacklink = {
  command?: string;
  href: string;
  label: string;
  meta?: string;
};

export type EntityBacklinkGroup = {
  kind: BacklinkSourceKind;
  label: string;
  links: EntityBacklink[];
};

type TargetEntity = {
  kind: EntityKind;
  slug: string;
};

type SourceDescriptor = {
  body: string;
  command?: string;
  href: string;
  kind: BacklinkSourceKind;
  label: string;
  meta?: string;
  slug?: string;
  targetKind?: EntityKind;
};

const SOURCE_ORDER: BacklinkSourceKind[] = [
  "beans",
  "coffees",
  "roasters",
  "companions",
  "equipment",
  "recipes",
  "questions",
  "terms"
];

const SOURCE_LABELS: Record<BacklinkSourceKind, string> = {
  beans: "Beans",
  coffees: "Coffees",
  roasters: "Roasters",
  companions: "Companions",
  equipment: "Equipment",
  recipes: "Recipes",
  questions: "Questions",
  terms: "Terms"
};

const TARGET_PATH_SEGMENTS: Record<EntityKind, string> = {
  term: "terms",
  coffee: "coffees",
  roaster: "roasters",
  companion: "companion",
  equipment: "equipment",
  recipe: "recipes",
  question: "questions"
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCanonicalTargetPath = (target: TargetEntity) =>
  `/beans/${TARGET_PATH_SEGMENTS[target.kind]}/${target.slug}/`;

const getTargetPattern = (target: TargetEntity) =>
  new RegExp(`${escapeRegExp(getCanonicalTargetPath(target))}(?=[)#\\s"'\\]|>]|$)`, "i");

const isSelfReference = (source: SourceDescriptor, target: TargetEntity) =>
  source.targetKind === target.kind && source.slug === target.slug;

const addBacklink = (
  groups: Map<BacklinkSourceKind, Map<string, EntityBacklink>>,
  source: SourceDescriptor,
  target: TargetEntity
) => {
  if (isSelfReference(source, target)) {
    return;
  }

  const group = groups.get(source.kind) ?? new Map<string, EntityBacklink>();

  if (!group.has(source.href)) {
    group.set(source.href, {
      command: source.command,
      href: source.href,
      label: source.label,
      meta: source.meta
    });
  }

  groups.set(source.kind, group);
};

const addBodyLinkBacklinks = (
  groups: Map<BacklinkSourceKind, Map<string, EntityBacklink>>,
  sources: SourceDescriptor[],
  target: TargetEntity
) => {
  const targetPattern = getTargetPattern(target);

  sources.forEach((source) => {
    if (targetPattern.test(source.body)) {
      addBacklink(groups, source, target);
    }
  });
};

export const getEntityBacklinks = async (target: TargetEntity): Promise<EntityBacklinkGroup[]> => {
  const [beans, coffees, companions, equipment, questions, recipes, roasters, terms] = await Promise.all([
    getBeans(),
    getCoffees(),
    getCompanions(),
    getEquipment(),
    getQuestions(),
    getRecipes(),
    getRoasters(),
    getTerms()
  ]);

  const beanRouteInfo = getBeanRouteInfoMap(beans);
  const groups = new Map<BacklinkSourceKind, Map<string, EntityBacklink>>();

  const beanSources: SourceDescriptor[] = beans.map((bean) => {
    const routeInfo = beanRouteInfo.get(bean.slug);
    const displayLabel = routeInfo?.displayLabel ?? bean.data.date;
    const commandLabel = routeInfo?.commandText
      ? `bean ${routeInfo.commandText}`
      : `bean log ${displayLabel}`;

    return {
      body: bean.body,
      command: commandLabel,
      href: routeInfo?.path ?? `/log/${bean.slug}/`,
      kind: "beans",
      label: bean.data.title,
      meta: undefined,
      slug: bean.slug
    };
  });

  beanSources.forEach((source, index) => {
    const bean = beans[index];

    if (bean.data.coffee.roast?.slug === target.slug && target.kind === "coffee") {
      addBacklink(groups, source, target);
    }

    if (bean.data.coffee.roaster?.slug === target.slug && target.kind === "roaster") {
      addBacklink(groups, source, target);
    }

    if (bean.data.brew.brewer?.slug === target.slug && target.kind === "equipment") {
      addBacklink(groups, source, target);
    }

    if (bean.data.brew.recipe?.slug === target.slug && target.kind === "recipe") {
      addBacklink(groups, source, target);
    }

    if (bean.data.brewDetails.grinder?.slug === target.slug && target.kind === "equipment") {
      addBacklink(groups, source, target);
    }

    if (
      target.kind === "equipment" &&
      (bean.data.gear ?? []).some((item) => item.slug === target.slug)
    ) {
      addBacklink(groups, source, target);
    }

    if (target.kind === "companion") {
      const companionSlugs = new Set([
        bean.data.personaComment?.companion,
        ...getInlineCompanionSlugs(bean.body)
      ]);

      if (companionSlugs.has(target.slug)) {
        addBacklink(groups, source, target);
      }
    }
  });

  const coffeeSources: SourceDescriptor[] = coffees.map((coffee) => ({
    body: coffee.body,
    href: `/coffees/${coffee.slug}/`,
    kind: "coffees",
    label: coffee.name,
    slug: coffee.slug,
    targetKind: "coffee"
  }));

  coffeeSources.forEach((source, index) => {
    if (target.kind === "roaster" && coffees[index].roaster === target.slug) {
      addBacklink(groups, source, target);
    }
  });

  const roasterSources: SourceDescriptor[] = roasters.map((roaster) => ({
    body: roaster.body,
    href: `/roasters/${roaster.slug}/`,
    kind: "roasters",
    label: roaster.name,
    slug: roaster.slug,
    targetKind: "roaster"
  }));

  const companionSources: SourceDescriptor[] = companions.map((companion) => ({
    body: companion.body,
    href: `/companion/${companion.slug}/`,
    kind: "companions",
    label: companion.data.name,
    slug: companion.slug,
    targetKind: "companion"
  }));

  const equipmentSources: SourceDescriptor[] = equipment.map((item) => ({
    body: item.body,
    href: `/equipment/${item.slug}/`,
    kind: "equipment",
    label: item.name,
    meta: item.type,
    slug: item.slug,
    targetKind: "equipment"
  }));

  equipmentSources.forEach((source, index) => {
    if (target.kind === "equipment" && equipment[index].related.includes(target.slug)) {
      addBacklink(groups, source, target);
    }
  });

  const recipeSources: SourceDescriptor[] = recipes.map((recipe) => ({
    body: recipe.body,
    href: `/recipes/${recipe.slug}/`,
    kind: "recipes",
    label: recipe.name,
    slug: recipe.slug,
    targetKind: "recipe"
  }));

  recipeSources.forEach((source, index) => {
    if (
      target.kind === "equipment" &&
      (recipes[index].gear ?? []).some((item) => item.slug === target.slug)
    ) {
      addBacklink(groups, source, target);
    }
  });

  const questionSources: SourceDescriptor[] = questions.map((question) => ({
    body: question.body,
    href: `/questions/${question.slug}/`,
    kind: "questions",
    label: question.data.title,
    slug: question.slug,
    targetKind: "question"
  }));

  const termSources: SourceDescriptor[] = terms.map((term) => ({
    body: term.body,
    href: `/terms/${term.slug}/`,
    kind: "terms",
    label: term.name,
    slug: term.slug,
    targetKind: "term"
  }));

  [
    beanSources,
    coffeeSources,
    roasterSources,
    companionSources,
    equipmentSources,
    recipeSources,
    questionSources,
    termSources
  ].forEach((sources) => addBodyLinkBacklinks(groups, sources, target));

  return SOURCE_ORDER.flatMap((kind) => {
    const entries = groups.get(kind);

    if (!entries?.size) {
      return [];
    }

    return [
      {
        kind,
        label: SOURCE_LABELS[kind],
        links: Array.from(entries.values())
      }
    ];
  });
};
