import { z } from "zod";
import type { Contribution } from "./contributions";

const issueSchema = z.object({
  id:z.number(),number:z.number(),title:z.string(),html_url:z.string().url(),repository_url:z.string().url(),
  state:z.enum(["open","closed"]),updated_at:z.string(),draft:z.boolean().optional(),
  labels:z.array(z.object({name:z.string()})).default([]),
  assignees:z.array(z.object({login:z.string()})).default([]),
  pull_request:z.object({merged_at:z.string().nullable().optional()}).optional(),
});
const searchSchema=z.object({items:z.array(issueSchema),total_count:z.number(),incomplete_results:z.boolean()});
const pullSchema=z.object({head:z.object({ref:z.string(),sha:z.string()}),draft:z.boolean(),merged_at:z.string().nullable()});
const reviewSchema=z.object({user:z.object({login:z.string()}).nullable(),body:z.string().nullable(),state:z.string(),submitted_at:z.string().nullable()});
type Issue=z.infer<typeof issueSchema>;
export class GitHubError extends Error {
  constructor(message:string, public readonly status:number, public readonly retryAfter:number=0){super(message);}
}
async function github(path:string):Promise<unknown>{
  const response=await fetch(`https://api.github.com${path}`,{headers:{Accept:"application/vnd.github+json","User-Agent":"Nebula-contribution-tracker","X-GitHub-Api-Version":"2022-11-28"},signal:AbortSignal.timeout(15000)});
  if(!response.ok){
    const reset=Number(response.headers.get("x-ratelimit-reset")||0)*1000;
    const limited=response.status===429||(response.status===403&&response.headers.get("x-ratelimit-remaining")==="0");
    const retry=Number(response.headers.get("retry-after")||0)||Math.max(60,Math.ceil((reset-Date.now())/1000));
    throw new GitHubError(limited?"GitHub's public API limit was reached. Your saved notes are safe. Try again after the limit resets.":"GitHub could not load your contributions. Try syncing again shortly.",limited?429:response.status===404?404:502,limited?retry:0);
  }
  return response.json();
}
function inferType(item:Issue):Contribution["type"]{
  const text=`${item.title} ${item.labels.map(label=>label.name).join(" ")}`.toLowerCase();
  if(/\b(docs?|documentation)\b/.test(text))return "Documentation";
  if(/\b(test|tests|testing)\b/.test(text))return "Tests";
  if(/\b(refactor|refactoring)\b/.test(text))return "Refactor";
  if(/\b(bug|fix|fixes)\b/.test(text))return "Bug fix";
  if(/\b(feat|feature|enhancement)\b/.test(text))return "Feature";
  return "Other";
}
export function toContribution(item:Issue,merged:Set<number>,changes:Set<number>,login:string):Contribution{
  const pr=Boolean(item.pull_request);
  const status:Contribution["status"]=merged.has(item.id)||item.pull_request?.merged_at?"Merged":item.state==="closed"?"Closed":changes.has(item.id)?"Changes needed":pr?(item.draft?"In progress":"Review requested"):item.assignees.some(user=>user.login.toLowerCase()===login.toLowerCase())?"In progress":"Researching";
  return {id:`github-${item.id}`,title:item.title,repository:item.repository_url.replace("https://api.github.com/repos/",""),url:item.html_url,type:inferType(item),status,feedback:"",changes:"",tests:"",branch:"",next:"",notes:"",updated:item.updated_at};
}
export async function fetchContributions(login:string){
  const warnings:string[]=[];
  async function search(query:string){
    const result=searchSchema.parse(await github(`/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=100`));
    if(result.incomplete_results||result.total_count>100)warnings.push("Showing the 100 most recently updated results per query. Older contributions may not be included.");
    return result.items;
  }
  try{await github(`/users/${encodeURIComponent(login)}`);}catch(error){
    if(error instanceof GitHubError&&error.status===404)throw new GitHubError("That GitHub username was not found. Check the spelling and try again.",404);
    throw error;
  }
  const [pulls,authored,assigned,mergedPulls,changesPulls]=await Promise.all([
    search(`is:pr author:${login}`),search(`is:issue author:${login}`),search(`is:issue assignee:${login}`),
    search(`is:pr author:${login} is:merged`),search(`is:pr author:${login} is:open review:changes_requested`),
  ]);
  const unique=new Map([...pulls,...authored,...assigned,...mergedPulls,...changesPulls].map(item=>[item.id,item]));
  const merged=new Set(mergedPulls.map(item=>item.id));
  const changes=new Set(changesPulls.map(item=>item.id));
  const items=[...unique.values()].map(item=>toContribution(item,merged,changes,login));
  const openPulls=pulls.filter(item=>item.state==="open").slice(0,4);
  for(const item of openPulls){
    const record=items.find(record=>record.id===`github-${item.id}`);
    if(!record)continue;
    const repo=record.repository.split("/").map(encodeURIComponent).join("/");
    try{
      const [rawPull,rawReviews]=await Promise.all([github(`/repos/${repo}/pulls/${item.number}`),github(`/repos/${repo}/pulls/${item.number}/reviews?per_page=100`)]);
      const pull=pullSchema.parse(rawPull);
      const reviews=z.array(reviewSchema).parse(rawReviews);
      record.branch=`${pull.head.ref} · ${pull.head.sha.slice(0,7)}`;
      record.feedback=reviews.slice(-10).map(review=>`${review.user?.login||"Reviewer"} (${review.state})${review.body?`\n${review.body}`:""}`).join("\n\n");
      const latest=new Map<string,z.infer<typeof reviewSchema>>();
      for(const review of reviews){if(review.user&&["APPROVED","CHANGES_REQUESTED","DISMISSED"].includes(review.state))latest.set(review.user.login,review);}
      record.changes=[...latest.values()].filter(review=>review.state==="CHANGES_REQUESTED").map(review=>`${review.user?.login}: ${review.body||"See the review on GitHub."}`).join("\n\n");
      if(pull.draft&&record.status!=="Changes needed")record.status="In progress";
      if(reviews.length===100)warnings.push("Some pull requests have additional review pages that are not loaded. Open GitHub for the full current review history.");
    }catch{warnings.push(`Review details could not be loaded for ${record.repository} #${item.number}. Open GitHub for the latest feedback.`);}
  }
  if(pulls.filter(item=>item.state==="open").length>4)warnings.push("Branch and review text are loaded for the four most recently updated open pull requests to stay within GitHub's public API limits. Status filters include all fetched contributions.");
  return {account:login,items:items.sort((a,b)=>b.updated.localeCompare(a.updated)),syncedAt:new Date().toISOString(),warnings:[...new Set(warnings)]};
}
