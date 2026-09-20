# Update eyebrow text on browse screen

## Goal
Replace the intro eyebrow line on the Hobby Hopper browse screen with a clearer, action-oriented label.

## Change
In `src/routes/index.tsx`, update the `.eyebrow` element:

- From: `DEUTSCHLAND / MATERIALBÖRSE / 09—26`
- To: `GEBEN / NEHMEN / TAUSCHEN`

## Verification
- Run a mobile and desktop preview check to confirm the new text renders correctly.
- Confirm the build remains clean.
