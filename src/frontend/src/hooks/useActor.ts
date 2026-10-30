// This file re-exports useActor from @caffeineai/core-infrastructure,
// bound to this project's createActor factory from backend.ts.
// It provides the no-argument useActor() signature used throughout the app.
import { useActor as _useActor } from "@caffeineai/core-infrastructure";
// @ts-ignore - backend.ts has @ts-nocheck; ExternalBlob type is compatible
import { createActor } from "../backend";

export function useActor() {
  // @ts-ignore - createActor signature is compatible at runtime
  return _useActor(createActor);
}
