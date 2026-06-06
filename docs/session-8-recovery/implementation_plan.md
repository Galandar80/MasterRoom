# Implementation Plan - Redesign Player Action Hotbar

The user wants to remove the dice rolling buttons from the Player Action Hotbar and repurpose it as a quick-access utility panel and notification hub.

---

## Proposed Changes

We will redesign the `PlayerActionHotbar` component to:
1. **Remove Dice Components:** Completely remove the manual dice buttons (`d4`, `d6`, etc.) and the dice modifier settings popover (triggered by the `Sparkles` icon).
2. **Add Notification Hub (`Notifiche`):**
   - Add a `Bell` icon button displaying a glowing badge count of active events.
   - Active events include pending dice requests from the Master (`visibleDiceRequests`) and whether an NPC is currently highlighted in scenographic Spotlight (`spotlightVisible`).
   - Clicking the `Bell` icon will toggle a beautiful popup panel detailing the active notifications (e.g. "Il Master richiede un tiro di d20", "NPC Leo in evidenza").
3. **Add Quick Access Panel Shortcuts:**
   - **Scheda Eroe** (`UserRound` icon) -> Opens character dossier.
   - **Inventario** (`Backpack` icon) -> Opens inventory list.
   - **Mappa** (`MapPinned` icon) -> Opens map stage.
   - **Note personali** (`ScrollText` icon) -> Opens note composition & list.
   - **Sussurri Master** (`BookOpenText` icon) -> Opens private messaging threads.
4. **Retain HUD Settings:** Keep the Immersive Mode toggle and Copy Invite Code actions at the far right.

---

## Detailed Component Changes

### [components/player-room.tsx](file:///e:/Progetti/MasterRoom%20-%20Antigravity/src/components/player-room.tsx)
- Import `Bell`, `Check`, and `ShieldAlert` from `lucide-react`.
- Pass `state={state}` to `<PlayerActionHotbar>`.
- In `PlayerActionHotbar`:
  - Calculate active notification count.
  - Render the **Notifiche** button and its popover.
  - Render the quick-access buttons matching the visual style.
  - Remove all manual dice rolling state and functions.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to confirm no compilation issues.

### Manual Verification
1. Launch the app and join a room as a player.
2. Verify the hotbar at the bottom:
   - It should have no dice buttons.
   - It should display: Notification Bell (with separator), Scheda, Inventario, Mappa, Note, Sussurri (with separator), Immersive, and Copy Invite Code.
3. Verify clicking each quick access button immediately opens the correct utility modal panel (e.g. clicking backpack opens Inventario).
4. Request a dice roll from the Master panel and verify:
   - A red notification badge `1` appears on the Bell icon.
   - Clicking the Bell opens a popover showing: "Richiesta tiro dadi: [Motivo]".
5. Clear the dice request or close it, and check that the notification badge disappears.
