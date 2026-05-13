---
version: "alpha"
name: "Analyst Slide Deck / Warm Editorial"
description: "Presentation system for the GPT-5.5 x GPT Image 2 environment forecast. Built to avoid generic Codex neon-dashboard styling."
colors:
  ink: "#151411"
  graphite: "#34312C"
  muted: "#746F66"
  hairline: "#D8D0C4"
  paper: "#F7F1E8"
  paperDeep: "#EDE2D2"
  panel: "#FFFDF8"
  clay: "#A6472C"
  blue: "#315C8A"
  sage: "#6B7B52"
  amber: "#C48121"
typography:
  hero:
    fontFamily: "'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 7vw, 6.9rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.075em"
  heading:
    fontFamily: "'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 4.2rem)"
    fontWeight: 760
    lineHeight: 1.02
    letterSpacing: "-0.055em"
  body:
    fontFamily: "'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "clamp(1rem, 1.45vw, 1.28rem)"
    fontWeight: 400
    lineHeight: 1.68
  caption:
    fontFamily: "'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.08em"
rounded:
  sm: "8px"
  md: "16px"
  lg: "28px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "20px"
  lg: "36px"
  xl: "64px"
---

## Overview

Warm editorial slide deck for a strategy report. The deck should feel like a high-trust consulting memo converted into slides: calm, source-aware, sharply structured, and readable from a distance.

## Rules

- Do not use neon cyan/purple gradients, glowing dashboards, generic metric bars, or sci-fi grid backgrounds.
- Do not use thin, narrow, condensed, or typewriter-like fonts for visible slide text.
- The visual frame should feel like a PPT slide: large 16:9 canvas that uses most of the viewport.
- A slide must be one-screen complete. Do not rely on internal slide scrollbars for normal desktop/laptop viewing.
- Use imagegen illustrations for selected slides when the visual idea benefits from texture, composition, and a polished raster asset.
- Use one main accent at a time. Clay is for judgment, blue for evidence, sage for strategy, amber for caution.
- Slides must be actual slides, not a long scrolling article. One message per slide, with supporting evidence below.
- Keep typography to three levels: hero/title, heading, body/caption. Avoid decorative font stacks beyond one serif hero accent.
- Prefer diagrams, matrices, timelines, and cards over long bullet lists.
- Every slide should have a footer with slide number and enough source context to be credible.
- Mobile should reflow without fixed-width assumptions and keep tap targets at least 44px.

## Rationale

The source guidance used for this deck:

- Claude design guidance: native feel, clear hierarchy, accessibility, responsive layout, limited type scale.
- Google DESIGN.md concept: explicit tokens + rationale so agents stop guessing visual taste.
- Slide-specific guidance: do not treat a deck as markdown bullets; solve sparse slides with scale, rhythm, and layout.
