import { usePuck, PuckContext } from "@measured/puck";

/**
 * Safe wrapper for usePuck().
 * Needed because Webstore runs without <Puck> context,
 * and calling usePuck() there would cause a runtime error.
 * Returns null when context is missing.
 */
export function useSafePuck() {
  try {
    const appState = usePuck();
    return appState;
  } catch (error) {
    return null;
  }
}
/**
 * useIsEditing
 * ------------
 * Determines if we are in Page-Builder (editing OR view mode).
 *
 * Why:
 * - `puck.isEditing` is true only during active editing.
 * - In Webstore, `puck.isEditing` may be undefined (view-only mode).
 * - We fallback to `useSafePuck()` — if context exists, we consider
 *   ourselves inside Page-Builder (return true).
 * - Returns `false` when no Puck context is present (avoids runtime error).
 *
 * @param puck Optional PuckContext from props.
 * @returns boolean — true if inside Page-Builder, false otherwise.
 */
export function useIsEditing(puck?: PuckContext) {
  const puckState = useSafePuck();

  if (puck?.isEditing) {
    return puck.isEditing;
  }

  if (puckState) {
    return true;
  }

  return false;
}
