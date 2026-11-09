import test from "node:test";
import assert from "node:assert/strict";
import { toContribution } from "../lib/github.ts";
import { applyAnnotations } from "../lib/contributions.ts";
import { githubLoginSchema, accountCacheKey, accountNotesKey } from "../lib/github-account.ts";

const issue = {
  id: 42, number: 7, title: "fix: empty results", html_url: "https://github.com/example/project/pull/7",
  repository_url: "https://api.github.com/repos/example/project", state: "open", updated_at: "2026-11-09T00:00:00Z",
  labels: [], assignees: [], pull_request: {},
};
const convert = (input = issue, merged = [], changes = []) => toContribution(input, new Set(merged), new Set(changes), "alice");

test("merged and closed records override pending review states", () => {
  assert.equal(convert({...issue, state: "closed"}, [42], [42]).status, "Merged");
  assert.equal(convert({...issue, state: "closed"}, [], [42]).status, "Closed");
});
test("requested changes override draft and ordinary review status", () => {
  assert.equal(convert({...issue, draft: true}, [], [42]).status, "Changes needed");
  assert.equal(convert({...issue, draft: true}).status, "In progress");
  assert.equal(convert().status, "Review requested");
});
test("assigned issues and authored unassigned issues map to different workflow stages", () => {
  assert.equal(convert({...issue, pull_request: undefined, assignees: [{login: "alice"}]}).status, "In progress");
  assert.equal(convert({...issue, pull_request: undefined}).status, "Researching");
});
test("provider identity remains stable across refreshes", () => {
  const item = convert();
  assert.equal(item.id, "github-42");
  assert.equal(item.repository, "example/project");
  assert.equal(item.url, issue.html_url);
  assert.equal(item.type, "Bug fix");
});
test("workflow notes survive a source status and title update", () => {
  const annotations = {"github-42": {tests: "npm test passed", next: "Respond to review", notes: "Context", type: "Tests"}};
  const fresh = convert({...issue, title: "Updated on GitHub"}, [42]);
  const [item] = applyAnnotations([fresh], annotations);
  assert.equal(item.title, "Updated on GitHub");
  assert.equal(item.status, "Merged");
  assert.equal(item.next, "Respond to review");
  assert.equal(item.tests, "npm test passed");
  assert.equal(item.type, "Tests");
});
test("annotations do not introduce records that GitHub did not return", () => {
  assert.deepEqual(applyAnnotations([], {"github-42": {tests: "", next: "Saved", notes: "", type: "Other"}}), []);
});

test("account input normalizes handles and rejects URLs or query injection", () => {
  assert.equal(githubLoginSchema.parse(" @OctoCat "), "octocat");
  for (const value of ["", "-bad", "bad-", "bad--name", "https://github.com/octocat", "octocat is:merged", "a".repeat(40)]) {
    assert.equal(githubLoginSchema.safeParse(value).success, false);
  }
});

test("notes and caches are isolated by account and ignore case", () => {
  assert.notEqual(accountNotesKey("alice"), accountNotesKey("bob"));
  assert.notEqual(accountCacheKey("alice"), accountCacheKey("bob"));
  assert.equal(accountNotesKey("Alice"), accountNotesKey("alice"));
});

test("assigned issue status follows the selected account", () => {
  const assigned = {...issue, pull_request: undefined, assignees: [{login: "alice"}]};
  assert.equal(toContribution(assigned, new Set(), new Set(), "alice").status, "In progress");
  assert.equal(toContribution(assigned, new Set(), new Set(), "bob").status, "Researching");
});
