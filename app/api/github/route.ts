import { z } from "zod";
import { fetchContributions, GitHubError } from "../../../lib/github";
import { githubLoginSchema } from "../../../lib/github-account";
import { isSameOriginRequest } from "../../../lib/request-origin";

type Snapshot=Awaited<ReturnType<typeof fetchContributions>>;
const cached=new Map<string,Snapshot>();
const pending=new Map<string,Promise<Snapshot>>();
const requestSchema=z.object({login:githubLoginSchema});
let blockedUntil=0;

export async function POST(request:Request){
  const headers={"Cache-Control":"private, no-store"};
  if(!isSameOriginRequest(request))return Response.json({message:"This request must come from Nebula."},{status:403,headers});
  let payload:unknown;
  try{payload=await request.json();}catch{return Response.json({message:"Enter a GitHub username."},{status:400,headers});}
  const parsed=requestSchema.safeParse(payload);
  if(!parsed.success)return Response.json({message:parsed.error.issues[0]?.message||"Enter a valid GitHub username."},{status:400,headers});
  const {login}=parsed.data;
  const existing=cached.get(login);
  if(existing&&Date.now()-Date.parse(existing.syncedAt)<5*60_000)return Response.json(existing,{headers});
  if(Date.now()<blockedUntil)return Response.json({message:"GitHub's API limit has not reset yet. Please try again later.",retryAfter:Math.ceil((blockedUntil-Date.now())/1000)},{status:429,headers});
  try{
    let job=pending.get(login);
    if(!job){
      if(pending.size>=10)return Response.json({message:"GitHub sync is busy. Please try again shortly."},{status:503,headers});
      job=fetchContributions(login);
      pending.set(login,job);
    }
    const result=await job;
    cached.delete(login);cached.set(login,result);
    if(cached.size>20){const oldest=cached.keys().next().value;if(oldest)cached.delete(oldest);}
    return Response.json(result,{headers});
  }catch(error){
    if(error instanceof GitHubError){if(error.retryAfter)blockedUntil=Date.now()+error.retryAfter*1000;return Response.json({message:error.message,retryAfter:error.retryAfter},{status:error.status,headers});}
    return Response.json({message:"GitHub sync could not finish. Your existing data and notes have been kept."},{status:502,headers});
  }finally{pending.delete(login);}
}
