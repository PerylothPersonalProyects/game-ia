# Mobile Layout Options for Clicker Game

**Project:** cliker-ia  
**Date:** 2026-03-15  
**Type:** Layout Design Proposal

---

## Current Problem
The current layout (MainScene.ts) was designed primarily for desktop:
- Stats panel at top
- Click button at ~30% from top
- Upgrades panel at ~60% from top (right side on desktop)

On mobile, this leaves upgrades too low, potentially cut off on small screens.

---

## Option 1: Classic Vertical Stack

### Layout Concept
Traditional mobile-first layout where everything is stacked vertically from top to bottom in a single scrollable column.

### Screen Sections
```
┌─────────────────────────────┐
│      STATS PANEL            │  ← Top (fixed height ~80px)
│  [Coins] [CPS] [CPC]        │
├─────────────────────────────┤
│                             │
│      CLICK BUTTON           │  ← Middle (large, ~25% screen)
│         (●)                 │
│                             │
├─────────────────────────────┤
│      UPGRADES PANEL         │  ← Bottom (scrollable)
│  ┌─────────────────────┐    │
│  │ Upgrade 1      [✓] │    │
│  │ Upgrade 2      [✓] │    │
│  │ Upgrade 3      [✕] │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Mobile Considerations
- **Orientation:** Works best in portrait mode
- **Touch targets:** Minimum 44px touch areas for all buttons
- **Scrolling:** Upgrades panel scrolls independently (use Phaser scroll or custom implementation)
- **Visibility:** Stats always visible at top, click button always visible, upgrades need scroll
- **Safe areas:** Account for mobile browser address bars

### Pros
- ✓ Familiar pattern for mobile users
- ✓ All elements visible without complex UI
- ✓ Easy to implement (simple vertical positioning)
- ✓ Good for portrait orientation
- ✓ Can use native scroll for upgrades

### Cons
- ✗ Upgrades require scrolling to see all items
- ✗ Click button takes up significant vertical space
- ✗ On very small screens (<320px wide), might feel cramped
- ✗ Less elegant in landscape mode

---

## Option 2: Bottom-Heavy Split (Recommended)

### Layout Concept
Split the screen into two zones: interaction zone at top, content zone at bottom. Inspired by popular mobile games like "Coin Master" style layouts.

### Screen Sections
```
┌─────────────────────────────┐
│     STATS + CLICK AREA     │  ← Top half (fixed)
│                             │
│         [Coins]            │
│         (●) CLICK          │
│     [CPS]      [CPC]       │
├─────────────────────────────┤
│      UPGRADES PANEL         │  ← Bottom half (scrollable)
│  ┌─────────────────────┐    │
│  │ Upgrade 1    100G ✓│    │
│  │ Upgrade 2    500G ✓│    │
│  │ Upgrade 3   1000G ✕│    │
│  │ Upgrade 4   5000G ✕│    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Mobile Considerations
- **Orientation:** Works in both portrait and landscape
- **Touch targets:** Click button gets full top section, upgrades are easy to tap
- **Scrolling:** Upgrades panel scrolls in bottom half only
- **Visibility:** Stats and click always visible, upgrades need scroll but start at top
- **Thumb zone:** Important interactions in bottom half (easier reach)

### Pros
- ✓ Optimized for thumb reach (most interactions at bottom)
- ✓ Clear visual separation between action and shop
- ✓ Works in both portrait and landscape
- ✓ Upgrades are front-and-center in the lower half
- ✓ Can add "pull down" gesture to show more upgrades

### Cons
- ✗ Click area smaller than Option 1
- ✗ Landscape mode shows empty space on sides
- ✗ Requires careful handling of screen orientation changes

---

## Option 3: Floating Action Center

### Layout Concept
Central "hero" click area with floating UI panels around the edges. Uses Phaser's ability to layer elements freely rather than HTML-like stacking.

### Screen Sections
```
┌───────────────────────────────────────────┐
│ STATS    ╔═══════════════╗                │
│ (corner) ║               ║   UPGRADES     │
│          ║   CLICK (●)   ║   (right side  │
│          ║               ║    or drawer)  │
│          ╚═══════════════╝                │
│                              [SHOP ▼]     │
└───────────────────────────────────────────┘
```

### Mobile Variations

**Portrait Mode:**
```
┌─────────────────────────────┐
│  [Coins: 1,234]   [?]       │  ← Top-right corner stats
│                             │
│         ┌───┐              │
│         │ ● │   ← Click    │
│         └───┘   ← Center    │
│                             │
│   [CPS: 5]    [CPC: 2]     │  ← Just below click
│                             │
│ ──── UPGRADES (swipe up) ───│  ← Bottom drawer
│  Item 1  [100G] [✓]        │
│  Item 2  [500G] [✓]        │
└─────────────────────────────┘
```

### Mobile Considerations
- **Orientation:** Requires orientation-specific layouts
- **Touch targets:** Use edge swipe for panels, center for click
- **Scrolling:** Upgrades in collapsible bottom drawer or right-side panel
- **Visibility:** Click always visible, stats minimal in corners, upgrades hidden in drawer
- **Progressive disclosure:** Start minimal, expand on interaction

### Pros
- ✓ Maximum click button size and visibility
- ✓ Clean, modern aesthetic
- ✓ Good use of screen real estate
- ✓ Can hide complexity until needed

### Cons
- ✗ More complex to implement
- ✗ Upgrades require additional interaction to reveal
- ✗ Stats might be harder to read (smaller, in corners)
- ✗ Requires drawer/modal component logic

---

## Summary Comparison

| Aspect | Option 1: Vertical Stack | Option 2: Bottom-Heavy | Option 3: Floating Center |
|--------|-------------------------|------------------------|---------------------------|
| **Implementation** | Easy | Medium | Complex |
| **Click Button Size** | Large | Medium | Largest |
| **Upgrades Visibility** | Requires scroll | Always in view | Hidden in drawer |
| **Portrait Optimized** | ★★★ | ★★★ | ★★ |
| **Landscape Optimized** | ★ | ★★★ | ★★ |
| **Thumb-Friendly** | ★★ | ★★★ | ★★ |
| **Mobile Familiarity** | ★★★ | ★★ | ★ |

---

## Recommendation

**Option 2 (Bottom-Heavy Split)** is recommended for this project because:
1. It balances click button prominence with easy upgrade access
2. Works well in both orientations
3. Aligns with common mobile game patterns
4. Keeps upgrade panel immediately visible without scrolling
5. Moderate implementation complexity

---

## Next Steps
1. Review these options with stakeholders
2. Select preferred approach
3. Define responsive breakpoints (e.g., <400px, 400-600px, >600px)
4. Create implementation tasks for MainScene.ts refactoring

---

*Save this document to engram with topic_key: cliker-ia/mobile-layout-options*