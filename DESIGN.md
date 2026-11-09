---
name: Nebula
description: A tactile contribution workbench with calm data surfaces and geometric chrome accents.
colors:
  ink: "#20243a"
  muted: "#50587a"
  violet: "#7053d6"
  violet-hover: "#5e42be"
  lilac: "#a58af4"
  butter: "#b9caf3"
  canvas: "#eeeff6"
  rail: "#161c32"
  line: "#c7cce3"
  rail-text: "#adb3ca"
  nav-selected: "#dee2ef"
  nav-selected-ink: "#1c2134"
  card: "#e3e6f1"
  card-line: "#c1c8e1"
  control: "#fcfcff"
  control-line: "#bcc3de"
  table: "#fcfcff"
  table-heading: "#dfe2ef"
  row-line: "#dadeed"
  row-hover: "#e8ebf4"
  progress-bg: "#ced3e7"
  progress-ink: "#393f57"
  review-bg: "#e4e8fc"
  review-ink: "#45568f"
  changes-bg: "#f9e9d9"
  changes-ink: "#815923"
  merged-bg: "#e9e1f1"
  merged-ink: "#695184"
  research-bg: "#dde0ee"
  research-ink: "#48506e"
  closed-bg: "#dbdfee"
  closed-ink: "#3f4560"
typography:
  headline:
    fontFamily: "Syne, sans-serif"
    fontSize: "42px"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "-1.7px"
  metric:
    fontFamily: "Syne, sans-serif"
    fontSize: "47px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-1.5px"
  title:
    fontFamily: "Syne, sans-serif"
    fontSize: "21px"
    fontWeight: 650
    letterSpacing: "-0.5px"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "14px"
  row-title:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
rounded:
  chip: "4px"
  control: "6px"
  primary: "7px"
  container: "8px"
  metric: "10px"
spacing:
  small: "8px"
  medium: "12px"
  field-gap: "16px"
  section: "22px"
  drawer-gutter: "27px"
  main-gutter: "38px"
components:
  button-primary:
    backgroundColor: "{colors.violet}"
    textColor: "#ffffff"
    rounded: "{rounded.primary}"
    padding: "11px 16px"
  button-primary-hover:
    backgroundColor: "{colors.violet-hover}"
  button-secondary:
    backgroundColor: "{colors.control}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
  search:
    backgroundColor: "{colors.control}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
    width: "285px"
  navigation-selected:
    backgroundColor: "{colors.nav-selected}"
    textColor: "{colors.nav-selected-ink}"
    rounded: "{rounded.control}"
    padding: "12px"
  status-progress:
    backgroundColor: "{colors.progress-bg}"
    textColor: "{colors.progress-ink}"
    rounded: "{rounded.chip}"
    padding: "5px 7px"
  metric-active:
    backgroundColor: "{colors.violet}"
    textColor: "#ffffff"
    rounded: "{rounded.metric}"
    padding: "21px 22px 18px"
  table:
    backgroundColor: "{colors.table}"
    rounded: "{rounded.container}"
  editor:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    width: "550px"
---

# Design System: Nebula

## Overview

**Creative North Star: "The Tactile Contribution Workbench"**

Nebula blends the selected Bauhaus and De Stijl geometry with tactile controls, an inflated violet tile, and liquid-chrome accents. A midnight navy rail anchors an cool silver working surface. Lilac appears sparingly in the brand punctuation and small sculptural bead; violet carries activity and action.

The working area stays calm: Syne gives headings and metrics a geometric voice, while DM Sans carries records and controls. Chrome is confined to the logo and header sculpture. This records the shipped implementation in app/workbench.css, its inherited foundations in app/globals.css, and app/page.tsx. PRODUCT.md and DIRECTION.md establish the authorized blended world and automatic GitHub workflow.

**Key Characteristics:**

- Midnight navy navigation, cool silver canvas, and concentrated violet activity.
- Geometric Syne headings with DM Sans task text.
- Tactile controls and chrome geometry around a calm ruled table.
- One cohesive visual world with responsive icon navigation.

## Colors

The palette pairs neutral midnight navy and cool silver with concentrated violet, warm lilac punctuation, and muted categorical tints. Frontmatter values are normative; the retained source variable named green now resolves to violet.

### Primary

- **Violet:** sync and save actions, the active contribution metric, selected status filters, links on hover, and focus rings.
- **Violet Hover:** the deeper primary-action hover state.

### Secondary

- **Lilac:** the brand dot, not an alternate action color.
- **Butter:** a warm supporting accent in the palette; the built identity also uses related cream tones for avatars.
- **Progress Olive**, **Review Blue**, **Changes Amber**, **Merged Lilac**, **Research Sage**, and **Closed Sage:** paired foregrounds and backgrounds for read-only status chips. Type chips use related restrained tints.

### Neutral

- **Ink** and **Muted:** primary reading and supporting text.
- **Rail** and **Rail Text:** midnight navy navigation and its light labels.
- **Canvas**, **Card**, **Control**, and **Table:** cool silver surfaces with small tonal differences for reading and grouping.
- **Line**, **Card Line**, **Control Line**, and **Row Line:** fine structural borders.
- **Selected Navigation:** a pale selected row with dark text and a violet icon.

**The Violet Action Rule.** Use violet for primary actions, active filters, focus, and the active-work metric; reserve lilac for the observed small accents.

## Typography

**Display Font:** Syne with sans-serif fallback.

**Body Font:** DM Sans with sans-serif fallback.

**Label/Mono Font:** Browser monospace remains confined to the optional branch/commit table column.

**Character:** Broad geometric Syne shapes add the selected Bauhaus influence without making task content decorative. The scale is role-based, not a uniform ratio.

### Hierarchy

- **Headline:** the frontmatter headline role describes the desktop page title. It becomes 38px at 1250px, 34px at 700px, and 31px with a 1.12 line height at 500px.
- **Metric:** the metric role uses tabular numerals inherited from the base stylesheet. It becomes 43px at 1250px and 36px at 700px and below.
- **Title:** section titles use the title role, reducing to 19px at 700px and 18px at 500px. Editor headings use Syne at 25px, reducing to 23px at 500px.
- **Body:** the body role establishes the global baseline. Navigation uses 13px and repository navigation uses 12px.
- **Row title:** contribution titles use the row-title role. Repository and next-action text use 11px; table headings, metadata, status chips, and type chips use 10px.
- **Label:** editor labels and metric labels use the label role on desktop. Editor inputs use 13px and become 16px at 500px. Search uses 12px and becomes 16px at 500px; the inherited 580px mobile safeguard also applies between those breakpoints.

**The Task Type Rule.** Use Syne for headings and metrics, and DM Sans for record content and controls.

## Layout

The desktop shell uses a fixed midnight navy sidebar (236px) with a matching content offset. The top bar is 68px high. Main content has 38px horizontal gutters, 30px top padding, and a maximum width of 1630px. At 1600px and above, horizontal gutters become 48px.

The heading region is at least 160px high and accommodates the static header sculpture and sync action. Three separate metric tiles sit in equal columns with 12px gaps. The table area follows section controls, scrollable status filters, and the search/filter row. The table has a minimum width of 950px; its enclosure owns horizontal scrolling. The All fields toggle adds columns to the same row model.

At 1250px, the sidebar becomes 210px and gutters 28px. At 1000px, it becomes a 72px icon rail. At 700px, gutters become 21px, search spans the row, and the artwork scales down. At 500px, the rail becomes 54px, the top bar 59px, gutters 16px, summary tiles stack, and the artwork scales to 52 percent. The page heading becomes a block layout with a minimum height of 195px.

Spacing combines compact 8px, 12px, and 16px working gaps with roughly 22px to 27px section and editor padding. Preserve the denser table and the more open heading region as distinct spatial roles.

## Elevation & Depth

This world uses material cues selectively. Primary buttons have an inset highlight, ambient drop shadow, and one-pixel press movement. Metric tiles have shallow inset highlights, and selected navigation has a small resting shadow. The raster chrome geometry depicts reflective material and soft ambient shadows. The table remains flat and lightly ruled. Do not carry over the former rule that shadows belong only to overlays.

### Shadow Vocabulary

- **Primary resting:** `inset 0 1px 0 #ffffff45,0 3px 5px #7053d618`.
- **Primary hover:** `inset 0 1px 0 #fff3,0 4px 9px #7053d625`.
- **Primary pressed:** `inset 0 2px 4px #33216f55`.
- **Neutral metric:** `inset 0 1px 0 #fff9`.
- **Selected navigation:** `0 2px 3px #0002`.
- **Menu:** `0 8px 22px #1a1e3018`.
- **Editor:** `-10px 0 45px #11142025` with a `#191e2f66` backdrop.
- **Toast:** `0 8px 22px #13162322`.

**The Material Boundary Rule.** Keep chrome and inflated geometry in the identity and header sculpture; use fine rules and restrained fills in the contribution table.

The sidecar's synthesized eight-step OKLCH ramps are panel previews, not implemented application shades.

## Shapes

Compact chips use 4px corners; fields and navigation use 6px; primary buttons use 7px. Data containers use 8px, desktop metrics 10px. Mobile metric corners reduce to 8px and the table to 6px. The raster sculpture contrasts a rotated soft square, circular chrome disc, and small coral sphere; those silhouettes belong to the artwork rather than CSS corner tokens. The right-edge dialog remains a flush panel, capped at viewport width.

## Components

### Buttons

The tactile violet primary uses a one-pixel dark blue border, white text, an inset highlight, and the primary radius. Hover deepens its fill and shadow; pressing shifts it down one pixel and replaces the outer depth with an inset shadow. Transitions take 150ms. Disabled primary buttons use 65 percent opacity. Secondary actions use cool silver fill, a pale border, and 10px by 14px padding. Keyboard focus uses a two-pixel violet outline with a four-pixel offset.

### Chips

Read-only status chips pair a line icon and text in a tinted enclosure with 5px by 7px padding. Type chips use 3px by 6px padding and a thin border. Labels remain visible with the color. GitHub status is source information, not an inline editing control.

### Cards / Containers

Summary tiles are separate tactile cards, not the previous joined dashboard strip. The first tile uses violet with pale text; other tiles use silver blue with dark text. Desktop padding is 21px by 22px with 18px at the bottom, and a minimum height of 158px. On phones they become compact horizontal summary rows. Repository cards use a pale surface, fine border, 8px radius, and Syne names.

### Inputs / Fields

Search has a shallow inset shadow, cool silver fill, a pale border, and focus on the full enclosure. Native repository and type filters share the field language. Editor fields use 11px by 12px padding and the control radius. Read-only GitHub fields have a slightly deeper sage-gray background and muted text. The next-action field sits in a pale green bordered group. Editable notes and tests remain visually available alongside source details. Input focus is a two-pixel violet outline with a two-pixel offset.

### Navigation

Navigation uses light labels on midnight navy, a darker hover fill, and an cool silver selected row with dark text and a violet icon. Repository markers are small rotated squares. Below 1000px, the icon rail hides labels and counts while retaining accessible names. The selected row keeps its pale fill.

### Contribution Table

A pale heading strip and fine horizontal rules organize the cool silver table. Row hover changes the surface tint. The first column combines status icon, editable-note entry title, and external GitHub link; repository names wrap within their column. Titles truncate visually. Source status chips remain read only. The optional detail columns expose reviewer feedback, requested changes, tests, branch or commit, and notes without replacing the table model.

### Chrome Branch Sculpture

The static, decorative header composition uses the transparent raster asset `/art/contribution-sculpture.webp` (640 by 427 pixels). It depicts an inflated blue tile, chrome branch disc, and coral bead. The source image and generation prompt live in `assets/contribution-sculpture-source.png` and `assets/contribution-sculpture.prompt.txt`. The header contains the whole artwork with object-fit contain; the logo crops the same asset with object-fit cover and object-position 72% 50%. It ignores pointer events, is hidden from assistive technology, and scales down at narrower breakpoints. Do not recreate this approved artwork with CSS gradients or inline SVG.

### Editor Drawer

A native modal dialog opens at the right edge, 550px wide and capped at the viewport width. The independently scrolling form sits between fixed header and footer regions. Source title, repository, status, review feedback, requested changes, and branch fields are read only; workflow notes, tests, next action, and type overrides are local annotations. Opening uses the inherited 220ms translate-and-fade animation with `cubic-bezier(.16,1,.3,1)`. Reduced-motion preferences disable transitions and animation.

## Do's and Don'ts

### Do:

- **Do** retain labels and line icons alongside status colors.
- **Do** keep source fields visually distinct from editable workflow notes.
- **Do** contain horizontal overflow in the table and status filters.
- **Do** preserve mobile 16px entry fields and reduced-motion support.

### Don't:

- **Don't** introduce a theme switcher; this is one blended visual world.
- **Don't** present GitHub status as an editable select or add manual contribution creation.
- **Don't** extend chrome ornament into data rows or replace the table with individually shadowed cards.

Not canonized: very small supplementary text in metric tags and mobile footers remains a legibility concern, not an additional reusable typography role. This documentation pass does not alter UI code. No system-wide prohibition on gradients, soft shadows, or sculptural geometry applies to this selected world.

The account switcher sits in the top-right bar as a bordered cool silver control. Its anchored form uses the existing field, focus, primary-action, and error colors. On phones it fits within the content viewport. The form names the public-data scope and notes isolation, with loading and error states.
