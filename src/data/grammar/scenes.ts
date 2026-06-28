// Pure scene-key vocabulary for the prepositions structure — shared by the data
// (which builds the keys) and the SVG renderer (which resolves them). Kept free
// of JSX / "use client" so the content layer and unit tests don't pull a client
// component. A Choice.emoji of "scene:ball-under-box" means "render this scene".
export type Relation = "in" | "on" | "under" | "next to";

const SCENE_PREFIX = "scene:";

export const SCENE_RELATIONS = {
  "ball-in-box": "in",
  "ball-on-box": "on",
  "ball-under-box": "under",
  "ball-next-to-box": "next to",
} as const satisfies Record<string, Relation>;

export type SceneName = keyof typeof SCENE_RELATIONS;

export function sceneKey(name: SceneName): string {
  return `${SCENE_PREFIX}${name}`;
}

export function relationForKey(key: string): Relation | undefined {
  if (!key.startsWith(SCENE_PREFIX)) return undefined;
  return SCENE_RELATIONS[key.slice(SCENE_PREFIX.length) as SceneName];
}
