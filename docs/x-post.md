# X Post — Meridian Design System (thread, American English)

> Live: https://meridian-olive-phi.vercel.app · Repo: https://github.com/jhosephebtc/Meridian
> Install the skills: `npx skills add jhosephebtc/Meridian`
> Names and repos below come from [`skills/CREDITS.md`](../skills/CREDITS.md). Tag each person's X profile manually before posting.

---

**1/8**
Meet Meridian: a Single-Ink editorial design system built to help people find their way, not to chase attention.

40 paper surfaces · 28 inks · 8 color roles with transparency sliders · 90 components · 4 languages · 11 installable agent skills.

https://meridian-olive-phi.vercel.app

**2/8**
Color: every level of hierarchy comes from one ink (`--ds-fg`) over one paper (`--ds-bg`) via `color-mix()`. Swap the paper and everything follows: borders, focus rings, SVG, canvas.

Customize the text colors however you like. They stay readable: at least 4.5:1 against the active background, always.

**3/8**
Layout: one 1440px shell on all 6 pages, a `1fr auto 1fr` masthead, a consolidated Preferences menu, and a top-right hamburger below 1120px.

Pages settle in with a short translateY (≤ 420ms). No full-page zoom.

**4/8**
The skills behind it, and where each one was used:

• Emil Kowalski (`emilkowalski/skills`): Frequency Gate, easing curves, clip-path tabs, 1:1 drag with momentum, Before/After/Why reviews → `meridian-motion` and `meridian-taste`.
• Pasquale Vitiello (`pasqualevitiello/plotter`): blueprint SVG grammar with 13 `data-plotter-role` layers → `meridian-plotter-svg`, the 81k-dot globe, and the Gann instruments.

**5/8**
• Lucas Marques (`lucasmarkes/hairline`): interactive 2:1 isometric figures, 10 rules (rest-pose hit testing, opaque occlusion) → `meridian-hairline-figure`, the isometric specimen on the home page.
• Pritam (`pritamux/gridlines`): `probe.js` alignment audit at 1440px and 390px → `meridian-gridlines`, grounded in Karri Saarinen's Linear sidebar notes and Apple HIG (Layout).
• Jhosephe UI (`jhosephebtc`): tactile gesture physics and the 90-component lab → `meridian-components`.

**6/8**
Design references:
• Evil Rabbit (Deimos / Design Zeitgeist + Geist): the Single-Ink engine, the 3-column reader, Geist typography → tokens, `gann.html`, `historia.html`, `manifesto.html`.
• Anthropic Research (econ-scenarios, 81k interviews): ivory ground, dual-radius shapes, earthy organic palette → tokens and the dotted globe.

**7/8**
Tools and research:
• Paper Design (`@paper-design/shaders`): WebGL halftone for the archive plates.
• shadcn/ui: JSON registry for `npx shadcn@latest add`.
• Tyler Hobbs and `p5.brush`: the starting point for our TypeScript-only watercolor engine.
• Maxime Heckel (painterly shaders) + Kyprianidis et al. (2009): the anisotropic Kuwahara pipeline in Atelier.

**8/8**
All open, with docs and skills you can install in your own project:

`npx skills add jhosephebtc/Meridian`

Repo: https://github.com/jhosephebtc/Meridian

If it's useful, drop a ⭐. Thank you to everyone who shared what they know.
</Content>
