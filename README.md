# Nebula

A personal open-source contribution tracker built with React and Vinext.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by the server, normally http://127.0.0.1:5173/.

## Use the workspace

- Click the **@username** control in the top-right corner, enter another GitHub username, and select **Switch account**. Public contributions load automatically. The selected account is remembered on this device. There is no manual contribution creation flow.
- Click a contribution title or its next action to edit every field.
- GitHub supplies titles, repositories, links, statuses, and available review details. These fields are read only. Edit tests run, next actions, notes, and the inferred contribution type locally.
- Search across every saved field. Combine status, repository, and contribution type filters.
- Use **All fields** to display feedback, changes, tests, branch, and notes as table columns.
- Select a dashboard total to see its matching contributions.
- Use **Export your work** for a JSON backup. Import it from the table's three-dot menu. Matching IDs update existing records.
- Automatic sync runs on page load and every 15 minutes while visible. **Sync GitHub** refreshes on demand. The server reuses successful results for five minutes to respect API limits.

Public GitHub data is fetched live through the server. There is no default account. The workspace starts empty until a username is entered. Only a deliberately selected username is remembered on this device. Server caches, browser caches, and workflow notes are scoped by normalized username. Previously saved per-account notes are retained. Failed switches preserve the active account and notes. Private repositories are not included because Sites connector eligibility and hosting tools are unavailable in this session. Personal workflow notes stay in the current browser and are merged by GitHub ID on every sync. Export before clearing browser data. Import restores annotations without creating contributions. Previous manual workspace data is retained in its old browser storage key but is no longer displayed.

## Verification

```sh
npx tsc --noEmit
npm run build
```

Build and type checks passed. Live fetching and account switching were verified. Source records are read only and workflow notes are stored separately. Desktop and mobile captures are in `output/playwright/`.

The Sites starter integration is retained. This session has no native Sites registration or deployment tools, so no hosted URL has been created.
