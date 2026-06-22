// @flow
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  getUuid(): string;
}

export default (TurboModuleRegistry.getEnforcing<Spec>(
  "NativeCherryLib",
): Spec);
