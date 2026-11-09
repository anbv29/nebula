# Nebula

A personal workspace for tracking open-source contributions across GitHub repositories. The product requirements come from the user's brief. The Nebula name is an implementation choice. The user explicitly requires automatic GitHub fetching rather than manual creation.

## Platform

Responsive web application.

## Core workflow

Research an issue, record a contribution, implement the change, request review, respond to requested changes, and mark it merged or closed. Keep the next action visible alongside repository, contribution type, and status. Store reviewer feedback, requested changes, tests run, commit or branch, and notes in the editable record.

## Projects

Rivet, FOSSASIA, Kestra, Visdom, and user-defined repositories.

## Data

Public issues authored by or assigned to the selected GitHub username and authored pull requests are fetched live. No account is preselected. The user must enter a GitHub username before the first fetch. A top-right account switcher accepts other public usernames, remembers the selection, and keeps notes and caches isolated per username. Failed switches retain the current account. Private connected access is unavailable to the local Site. Records refresh on load and every 15 minutes while visible, with an on-demand sync and five-minute server cache. GitHub source fields are read only. Tests, next actions, notes, and contribution type overrides are browser annotations keyed by GitHub ID and survive synchronization. No examples or manual creation actions are displayed. JSON import restores annotations only.

## Visual preference

The user supplied a list of eighteen design styles and chose to blend selected styles into one cohesive interface. Preserve the operational workflow and automatic GitHub fetching. Do not add a theme switcher or manual contribution creation.

## Stack

Vinext, React, TypeScript, Zod, Lucide icons, CSS. Sites starter build integration is retained. Publishing is pending availability of native Sites tools.
