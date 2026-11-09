import { z } from "zod";

export const statuses = ["Researching", "In progress", "Review requested", "Changes needed", "Merged", "Closed"] as const;
export const types = ["Bug fix", "Feature", "Documentation", "Tests", "Refactor", "Other"] as const;
export const contributionSchema = z.object({
  id: z.string(), title: z.string().trim().min(1), repository: z.string().trim().min(1),
  url: z.string().regex(/^https:\/\/github\.com\/[^\s]+$/i), type: z.enum(types), status: z.enum(statuses),
  feedback: z.string(), changes: z.string(), tests: z.string(), branch: z.string(), next: z.string(), notes: z.string(), updated: z.string(),
});
export type Contribution = z.infer<typeof contributionSchema>;
export const syncSchema = z.object({
  account: z.string(), items: z.array(contributionSchema), syncedAt: z.string(), warnings: z.array(z.string()),
});
export const annotationsSchema = z.record(z.string(), z.object({tests:z.string(),next:z.string(),notes:z.string(),type:z.enum(types)}));
export type Annotations = z.infer<typeof annotationsSchema>;
export function applyAnnotations(items: Contribution[], annotations: Annotations): Contribution[] {
  return items.map(item => ({...item,...annotations[item.id]}));
}
