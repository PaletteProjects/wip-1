import type { InjectionKey } from "vue";

export const ScrollArea = Symbol("ScrollArea") as InjectionKey<Ref<HTMLDivElement | null>>;
export const ModuleCache = Symbol("ModuleCache") as InjectionKey<Ref<Map<string, string>>>;
export const CurrentModule = Symbol("CurrentModule") as InjectionKey<Ref<string | null>>;
