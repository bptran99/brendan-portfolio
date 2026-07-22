# Sonic Archive Design System

This document is the source of truth for the portfolio’s visual language and interface requirements. The system follows a **Polished Brutalist** direction: archival music culture expressed through precise layouts, bold hierarchy, tactile borders, and clean light-mode surfaces.

## 1. Brand Direction

### Design philosophy

- Combine the raw energy of archival music culture with a sophisticated, modern execution.
- Favor clarity, confidence, precision, and tactile satisfaction.
- Present the interface as a curated gallery or archive rather than a dark recording studio.
- Keep layouts editorial, structured, and intentional.
- Use bold typography and structural strokes as the primary visual devices.

### Audience

- Audiophiles
- Archivists
- Creators
- People who value clarity, craft, and intentionality

### Core visual characteristics

- Light-mode foundation
- High-contrast hierarchy
- Massive, condensed display typography
- Heavy structural borders
- Generous whitespace
- Tonal surface layering
- Rounded interface objects
- Minimal or no shadows

## 2. Color Tokens

All colors should be referenced through semantic tokens rather than repeated as arbitrary values.

### Surface colors

| Token | Value | Intended use |
| --- | --- | --- |
| `surface` | `#f9f9f9` | Default page surface |
| `surface-dim` | `#dadada` | Dimmed or de-emphasized surface |
| `surface-bright` | `#f9f9f9` | Bright surface |
| `surface-container-lowest` | `#ffffff` | Highest-contrast container |
| `surface-container-low` | `#f3f3f3` | Subtle grouped content |
| `surface-container` | `#eeeeee` | Standard container |
| `surface-container-high` | `#e8e8e8` | More prominent container |
| `surface-container-highest` | `#e2e2e2` | Strongest neutral container |
| `surface-variant` | `#e2e2e2` | Alternate neutral surface |
| `background` | `#f9f9f9` | Page background |

### Text and outline colors

| Token | Value | Intended use |
| --- | --- | --- |
| `on-surface` | `#1a1c1c` | Primary text and icons |
| `on-surface-variant` | `#434656` | Secondary text and metadata |
| `on-background` | `#1a1c1c` | Text on the page background |
| `outline` | `#747688` | Strong neutral outlines |
| `outline-variant` | `#c4c5d9` | Dividers and subtle outlines |
| `inverse-surface` | `#2f3131` | Dark inverse surface |
| `inverse-on-surface` | `#f1f1f1` | Text on an inverse surface |

### Primary colors

| Token | Value |
| --- | --- |
| `surface-tint` | `#124af0` |
| `primary` | `#0040e0` |
| `on-primary` | `#ffffff` |
| `primary-container` | `#2e5bff` |
| `on-primary-container` | `#efefff` |
| `inverse-primary` | `#b8c3ff` |
| `primary-fixed` | `#dde1ff` |
| `primary-fixed-dim` | `#b8c3ff` |
| `on-primary-fixed` | `#001356` |
| `on-primary-fixed-variant` | `#0035be` |

The primary visual accent is **Vibrant Cobalt**. Use it for primary actions, links, active states, focus states, and important navigation.

### Secondary colors

| Token | Value |
| --- | --- |
| `secondary` | `#4959a3` |
| `on-secondary` | `#ffffff` |
| `secondary-container` | `#9fafff` |
| `on-secondary-container` | `#2f3f88` |
| `secondary-fixed` | `#dde1ff` |
| `secondary-fixed-dim` | `#b9c3ff` |
| `on-secondary-fixed` | `#001356` |
| `on-secondary-fixed-variant` | `#30418a` |

Use secondary slate blue to distinguish supporting information and controls without competing with the primary action.

### Tertiary colors

| Token | Value |
| --- | --- |
| `tertiary` | `#8f0dab` |
| `on-tertiary` | `#ffffff` |
| `tertiary-container` | `#ab35c6` |
| `on-tertiary-container` | `#ffeafd` |
| `tertiary-fixed` | `#fed6ff` |
| `tertiary-fixed-dim` | `#f5adff` |
| `on-tertiary-fixed` | `#350041` |
| `on-tertiary-fixed-variant` | `#7a0093` |

Use **Digital Magenta** sparingly for badges, special statuses, creative highlights, and secondary accents.

### Error colors

| Token | Value |
| --- | --- |
| `error` | `#ba1a1a` |
| `on-error` | `#ffffff` |
| `error-container` | `#ffdad6` |
| `on-error-container` | `#93000a` |

### Color usage requirements

- Use off-white surfaces as the default environment.
- Reserve cobalt for actions and the strongest points of emphasis.
- Use magenta as a highlight, not a dominant page background.
- Maintain sufficient text and control contrast.
- Prefer semantic color tokens over literal hex values in component styles.
- Never rely on color alone to communicate status or selection.

### Light and dark themes

- Support both light and dark color modes through semantic CSS variables.
- Default to the operating-system preference until a visitor explicitly selects a theme.
- Persist an explicit theme choice between visits when browser storage is available.
- Apply the saved theme before the page renders to avoid a flash of the wrong color mode.
- Pair every action and accent token with an appropriate foreground token, such as `primary` with `on-primary`.
- Maintain WCAG AA contrast in both themes: at least `4.5:1` for normal text and `3:1` for large text and essential interface boundaries.
- Theme controls must expose their current state and next action to assistive technology.
- Do not invert colors mechanically; adjust surfaces, artwork treatments, borders, and foregrounds intentionally.

## 3. Typography

The typography system uses three distinct voices.

1. **Archivo Narrow** for display and headline typography. It should feel authoritative, compressed, and archival.
2. **Inter** for body content. It prioritizes readability in descriptions and long-form content.
3. **JetBrains Mono** for labels, metadata, timestamps, technical details, and interface status.

### Type scale

| Token | Family | Size | Weight | Line height | Letter spacing |
| --- | --- | ---: | ---: | ---: | ---: |
| `display-lg` | Archivo Narrow | `80px` | `700` | `80px` | `-0.04em` |
| `headline-lg` | Archivo Narrow | `48px` | `700` | `52px` | `-0.02em` |
| `headline-lg-mobile` | Archivo Narrow | `32px` | `700` | `36px` | Default |
| `headline-md` | Archivo Narrow | `24px` | `600` | `28px` | Default |
| `body-lg` | Inter | `18px` | `400` | `28px` | Default |
| `body-md` | Inter | `16px` | `400` | `24px` | Default |
| `label-md` | JetBrains Mono | `14px` | `500` | `20px` | Default |
| `label-sm` | JetBrains Mono | `12px` | `500` | `16px` | Default |

### Typography requirements

- Use tight letter spacing on large display and headline text.
- Use Archivo Narrow only where strong hierarchy is intended.
- Use Inter for paragraphs and explanatory content.
- Use JetBrains Mono for technical, navigational, and status-oriented content.
- Avoid long paragraphs in uppercase or monospaced text.
- Keep line lengths comfortable for reading, ideally around 45–75 characters for body copy.
- Scale large headings down to `headline-lg-mobile` or an equivalent fluid size on small screens.

## 4. Layout and Responsive Grid

The system uses a strict responsive grid with a maximum content width of `1440px`.

| Breakpoint | Columns | Gutter | Outer margin |
| --- | ---: | ---: | ---: |
| Desktop | 12 | `24px` | `48px` |
| Tablet | 8 | `20px` | `32px` |
| Mobile | 4 | `16px` | `16px` |

### Layout requirements

- Align primary content to the responsive grid.
- Use a centered container with a maximum width of `1440px`.
- Preserve generous whitespace around large typography.
- Let display typography occupy multiple columns rather than constraining it to narrow text blocks.
- Stack multi-column layouts intentionally at tablet and mobile sizes.
- Avoid arbitrary horizontal offsets that break grid alignment.

## 5. Spacing

Spacing is based on a `4px` unit.

### Core tokens

| Token | Value |
| --- | ---: |
| `unit` | `4px` |
| `gutter` | `24px` |
| `margin-mobile` | `16px` |
| `margin-desktop` | `48px` |
| `container-max` | `1440px` |

### Recommended spacing scale

Use multiples of the base unit, including:

- `4px`
- `8px`
- `12px`
- `16px`
- `20px`
- `24px`
- `32px`
- `40px`
- `48px`
- `64px`
- `80px`
- `96px`
- `120px`

### Spacing requirements

- Use at least `16px` internal padding for small controls and compact containers.
- Use at least `24px` internal padding for cards.
- Use generous vertical spacing between major page sections.
- Keep related labels and values visually close.
- Use spacing tokens rather than one-off values whenever practical.

## 6. Shape and Radius

Rounded geometry softens the system’s heavy borders and dense typography.

| Token | Value | Typical use |
| --- | ---: | --- |
| `rounded-sm` | `0.25rem` / `4px` | Small details |
| `rounded` | `0.5rem` / `8px` | Default small component radius |
| `rounded-md` | `0.75rem` / `12px` | Medium controls |
| `rounded-lg` | `1rem` / `16px` | Buttons and larger controls |
| `rounded-xl` | `1.5rem` / `24px` | Cards, panels, and modals |
| `rounded-full` | `9999px` | Pills, badges, and circular controls |

### Shape requirements

- Buttons must use `rounded-lg`.
- Cards and large containers must use `rounded-xl`.
- Badges and tags must use `rounded-full`.
- Use the default `8px` radius for small, general-purpose components.
- Keep radius usage consistent across components of the same type.

## 7. Elevation and Depth

Depth is created with structural borders and tonal layering instead of conventional shadows.

### Surface hierarchy

1. **Base:** off-white `surface` or `background`.
2. **Grouped content:** pearl-toned surface containers.
3. **Raised object:** pearl or white surface with a `2px` secondary or primary border.
4. **Overlay:** foreground panel isolated by a translucent neutral backdrop and optional blur.

### Elevation requirements

- Do not use ambient drop shadows on standard cards or controls.
- Use `2px` borders for raised cards and primary controls.
- Use `1px` borders for internal dividers and list separation.
- Hover states may change border color or thickness.
- Hover states must not visually shift the component along the z-axis.
- Use backdrop blur only for overlays such as modals or drawers.

## 8. Components

### Buttons

- Use a `2px` solid border.
- Use `rounded-lg` corners.
- Use `label-md` or an equivalent monospaced label style.
- Primary buttons use a solid cobalt fill with light text.
- Secondary buttons use a secondary-color border with a transparent background.
- Hover states should change color or border emphasis without changing layout position.
- Focus states must be clearly visible and use the primary or tertiary accent.
- Disabled states must remain identifiable without relying solely on reduced opacity.

### Badges and tags

- Use `label-sm` typography.
- Use pill geometry with `rounded-full`.
- Use tertiary magenta fill with light text for highlighted tags.
- Keep labels concise.

### Cards

- Use a `2px` solid secondary border by default.
- Use `rounded-xl` for the outer container.
- Use at least `24px` internal padding.
- Use surface layering rather than shadows.
- Interactive cards should change border color or reveal a clear action affordance on hover and focus.

### Inputs

- Use high-contrast text.
- Use a light neutral surface such as `#f5f5f5`.
- Place `label-md` field labels above the input.
- Use a primary-colored border on focus.
- Preserve a visible neutral border when the field is not focused.
- Provide clear error text and an error border for invalid states.

### Lists

- Separate items with a `1px` solid border.
- Use a `4px` primary left-border accent for active items.
- Ensure active state is also conveyed by text, weight, or an icon.

### Checkboxes and radio controls

- Use an oversized `24px` control.
- Use a `2px` border.
- Use a solid primary fill when checked.
- Provide a visible keyboard-focus state.
- Maintain an accessible label and touch target around the control.

### Navigation

- Use clear active and hover states.
- Use JetBrains Mono for compact technical navigation labels where appropriate.
- Ensure mobile navigation is keyboard accessible and communicates expanded/collapsed state.
- Keep critical navigation available without hover.

## 9. Interaction States

Every interactive component should account for the following states where applicable:

- Default
- Hover
- Focus-visible
- Active or pressed
- Selected or current
- Disabled
- Loading
- Error

### Interaction requirements

- Do not use movement or shadows as the only hover feedback.
- Prefer border, fill, and text-color transitions.
- Keep transitions brief and purposeful.
- Respect `prefers-reduced-motion`.
- Never remove the browser focus outline without providing a stronger replacement.
- Ensure touch targets are comfortably sized, ideally at least `44px × 44px`.

## 10. Accessibility

- Target WCAG AA contrast for text and interface elements.
- Use semantic HTML landmarks and heading order.
- Provide descriptive text alternatives for meaningful images.
- Hide purely decorative artwork from assistive technology.
- Support keyboard navigation for all actions.
- Include visible focus states.
- Do not rely on color alone to communicate meaning.
- Use accessible labels for icon-only controls.
- Respect reduced-motion preferences.
- Test layouts at zoomed text sizes and narrow viewports.

## 11. Content and Voice

- Write with confidence and precision.
- Prefer short, direct labels and concise metadata.
- Use technical language only where it adds useful specificity.
- Keep project descriptions human and outcome-oriented.
- Use archive-inspired terms such as “index,” “selected archive,” or “signal” sparingly so the portfolio remains clear.
- Avoid decorative copy that obscures the purpose of a section or action.

## 12. Implementation Checklist

Before considering a page or component complete, confirm that:

- [ ] Colors use the documented semantic tokens.
- [ ] Display text uses Archivo Narrow with tight spacing.
- [ ] Body content uses Inter.
- [ ] Labels and metadata use JetBrains Mono.
- [ ] The page follows the 12/8/4-column responsive grid.
- [ ] Spacing uses the `4px` base system.
- [ ] Buttons have `2px` borders and `rounded-lg` corners.
- [ ] Cards have `2px` borders, `rounded-xl` corners, and at least `24px` padding.
- [ ] Depth is created without ambient shadows.
- [ ] Hover, focus, active, and disabled states are defined.
- [ ] Keyboard navigation works.
- [ ] Focus indicators are visible.
- [ ] Color contrast is sufficient.
- [ ] The page works at desktop, tablet, and mobile widths.
- [ ] Reduced-motion preferences are respected.
- [ ] Decorative visuals are hidden from assistive technology.

## 13. Current CSS Mapping

The current landing-page implementation stores its primary tokens in `styles.css` under `:root`. Future pages should reuse those variables and extend them only when a new semantic need is identified.

Avoid adding arbitrary colors, radii, shadows, or font families directly to components. If a new value is genuinely required, document it here and add it as a named token first.
