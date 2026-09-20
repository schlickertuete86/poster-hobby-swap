# Hobby Hopper — Less black in the background

## Goal
Improve contrast for the black foreground text by reducing dark/near-black passages in the page background.

## Changes

1. **Regenerate the background image**
   - Replace `src/assets/hobby-hopper-gradient.jpg` with a softer, lighter version.
   - Keep the hazy coral-to-periwinkle flow and analog grain, but push dark tones toward deep coral/blue instead of near-black.
   - Keep it fully abstract, borderless, and blurred at the CSS layer.

2. **Add a light content-safe overlay**
   - Introduce a very subtle warm/light scrim between the background and the foreground content areas.
   - This lifts black typography off any remaining mid-to-dark background passages without killing the poster feel.

3. **Tune the grain layer**
   - Slightly reduce grain opacity and switch its blend mode away from `multiply` so it no longer deepens dark areas.
   - Goal: texture stays visible, contrast improves.

4. **Verify across viewports**
   - Check mobile (~400x844) and desktop (1280x1800) screenshots.
   - Confirm the headline, card text, and buttons still read clearly against the new backdrop.

## Out of scope
- No changes to listing cards, layout, typefaces, buttons, or search behavior.
- No reintroduction of sharp marbling lines or geometric background shapes.
