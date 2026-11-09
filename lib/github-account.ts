import { z } from "zod";

export const githubLoginSchema = z.string().trim().transform(value=>value.replace(/^@/, "").toLowerCase()).pipe(
  z.string().min(1, "Enter a GitHub username.").max(39, "GitHub usernames can have up to 39 characters.").regex(/^[a-z\d]+(?:-[a-z\d]+)*$/, "Use a GitHub username with letters, numbers, or single hyphens.")
);
export const accountNotesKey=(login:string)=>`patchwork-github-notes-v3:${login.toLowerCase()}`;
export const accountCacheKey=(login:string)=>`patchwork-github-cache-v3:${login.toLowerCase()}`;
export const selectedAccountKey="patchwork-selected-github-account-v2";
