"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronDown, ChevronRight, Circle, CircleCheck, CircleDot, Code2, Columns3, ExternalLink, FolderGit2, GitBranch, GitMerge, GitPullRequest, LayoutDashboard, ListFilter, MoreHorizontal, Search, RefreshCw, X } from "lucide-react";
import { z } from "zod";

import { statuses, types, contributionSchema, syncSchema, annotationsSchema, applyAnnotations, type Contribution, type Annotations } from "../lib/contributions";
import { githubLoginSchema, accountCacheKey, accountNotesKey, selectedAccountKey } from "../lib/github-account";
type Status = Contribution["status"];
type View = "all" | "active" | "reviews" | "completed" | "repositories";

const isComplete = (item: Contribution) => item.status === "Merged" || item.status === "Closed";
const slug = (status: string) => status.toLowerCase().replaceAll(" ", "-");
function StatusIcon({status}:{status:Status}) { if(status === "Merged") return <GitMerge size={13}/>; if(status === "Closed") return <CircleCheck size={13}/>; if(status === "In progress") return <CircleDot size={13}/>; if(status === "Review requested") return <GitPullRequest size={13}/>; if(status === "Changes needed") return <Code2 size={13}/>; return <Circle size={13}/>; }
function RepoMark({name}:{name:string}) { return <span className={`repo-mark repo-${name.toLowerCase()}`}>{name.substring(0,1).toUpperCase()}</span>; }

export default function Home() {
  const [items,setItems] = useState<Contribution[]>([]);
  const [ready,setReady] = useState(false);
  const [login,setLogin]=useState("");
  const [loginInput,setLoginInput]=useState("");
  const [accountOpen,setAccountOpen]=useState(false);
  const [accountError,setAccountError]=useState("");
  const accountRef=useRef("");
  const accountControlRef=useRef<HTMLDivElement>(null);
  const accountInputRef=useRef<HTMLInputElement>(null);
  const syncAbortRef=useRef<AbortController|null>(null);
  const requestIdRef=useRef(0);
  const [query,setQuery] = useState("");
  const [status,setStatus] = useState<Status | "All">("All");
  const [repo,setRepo] = useState("All repositories");
  const [type,setType] = useState("All types");
  const [view,setView] = useState<View>("all");
  const [draft,setDraft] = useState<Contribution | null>(null);
  const [notice,setNotice] = useState("");
  const [saveError,setSaveError] = useState("");
  const [formError,setFormError] = useState("");
  const [details,setDetails] = useState(false);
  const [menu,setMenu] = useState(false);
  const [syncing,setSyncing] = useState(false);
  const [syncError,setSyncError] = useState("");
  const [syncedAt,setSyncedAt] = useState("");
  const [warnings,setWarnings] = useState<string[]>([]);
  const annotationsRef=useRef<Annotations>({});

  const retryAtRef=useRef(0);
  const [sort,setSort] = useState("recent");
  const importRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);
  function readNotes(target:string):Annotations{
    const raw=localStorage.getItem(accountNotesKey(target));
    if(!raw)return {};
    const result=annotationsSchema.safeParse(JSON.parse(raw));
    if(!result.success)throw new Error("Saved notes for this account could not be read. Export a backup before clearing browser data.");
    return result.data;
  }
  const sync=useCallback(async(target=accountRef.current)=>{
    if(!target){setAccountOpen(true);return;}
    if(Date.now()<retryAtRef.current){const message="GitHub's API limit has not reset yet. Please try again later.";setSyncError(message);setAccountError(message);return;}
    syncAbortRef.current?.abort();
    const controller=new AbortController();syncAbortRef.current=controller;
    const requestId=++requestIdRef.current;
    setSyncing(true);setSyncError("");setAccountError("");
    try{
      const response=await fetch("/api/github",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({login:target}),signal:controller.signal});
      const payload:unknown=await response.json();
      if(requestId!==requestIdRef.current)return;
      if(!response.ok){const failure=z.object({message:z.string(),retryAfter:z.number().optional()}).parse(payload);if(failure.retryAfter)retryAtRef.current=Date.now()+failure.retryAfter*1000;throw new Error(failure.message);}
      const result=syncSchema.parse(payload);
      if(result.account.toLowerCase()!==target.toLowerCase())throw new Error("GitHub returned a different account. Please try again.");
      const switched=target!==accountRef.current;
      const annotations=switched?readNotes(target):annotationsRef.current;
      accountRef.current=target;annotationsRef.current=annotations;
      setLogin(target);setLoginInput(target);setItems(applyAnnotations(result.items,annotations));setSyncedAt(result.syncedAt);setWarnings(result.warnings);
      if(switched){navigate("all");setDraft(null);setMenu(false);setNotice("Switched to @"+target);}
      setAccountOpen(false);
      try{localStorage.setItem(accountCacheKey(target),JSON.stringify(result));localStorage.setItem(selectedAccountKey,target);}catch{setSaveError("This browser could not remember the account. Export your work to keep a copy.");}
    }catch(error){
      if(controller.signal.aborted||requestId!==requestIdRef.current)return;
      const message=error instanceof Error?error.message:"GitHub sync failed. Existing contributions have been kept.";
      setSyncError(message);setAccountError(message);
    }finally{if(requestId===requestIdRef.current)setSyncing(false);}
  },[]);
  useEffect(()=>{
    let target="";
    try{
      const stored=githubLoginSchema.safeParse(localStorage.getItem(selectedAccountKey));
      if(stored.success)target=stored.data;
      if(!target){accountRef.current="";setLogin("");setLoginInput("");setItems([]);setSyncedAt("");setWarnings([]);annotationsRef.current={};}
      if(target){
        accountRef.current=target;setLogin(target);setLoginInput(target);annotationsRef.current=readNotes(target);
        const cached=localStorage.getItem(accountCacheKey(target));
        if(cached){const result=syncSchema.parse(JSON.parse(cached));if(result.account.toLowerCase()===target){setItems(applyAnnotations(result.items,annotationsRef.current));setSyncedAt(result.syncedAt);setWarnings(result.warnings);}}
      }
    }catch{setSaveError("Saved workspace data could not be read. Export your work before clearing browser data.");}
    setReady(true);if(target)void sync(target);
    const timer=setInterval(()=>{if(accountRef.current&&document.visibilityState==="visible")void sync();},15*60_000);
    return ()=>{clearInterval(timer);++requestIdRef.current;syncAbortRef.current?.abort();};
  },[sync]);
  useEffect(()=>{
    if(!accountOpen)return;
    accountInputRef.current?.focus();
    function onPointer(event:PointerEvent){if(event.target instanceof Node&&!accountControlRef.current?.contains(event.target))setAccountOpen(false);}
    function onKey(event:KeyboardEvent){if(event.key==="Escape")setAccountOpen(false);}
    document.addEventListener("pointerdown",onPointer);document.addEventListener("keydown",onKey);
    return ()=>{document.removeEventListener("pointerdown",onPointer);document.removeEventListener("keydown",onKey);};
  },[accountOpen]);
  function switchAccount(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();const parsed=githubLoginSchema.safeParse(loginInput);
    if(!parsed.success){setAccountError(parsed.error.issues[0]?.message||"Enter a valid GitHub username.");return;}
    void sync(parsed.data);
  }
  useEffect(() => { if(draft) panelRef.current?.showModal(); else panelRef.current?.close(); },[draft]);
  useEffect(() => { if(!notice) return; const timer=setTimeout(()=>setNotice(""),3500); return ()=>clearTimeout(timer); },[notice]);
  const repositoryNames = [...new Set(items.map(item=>item.repository))].sort();
  const active=items.filter(item=>!isComplete(item));
  const reviews=items.filter(item=>item.status === "Review requested");
  const completed=items.filter(isComplete);
  const needsChanges=items.filter(item=>item.status === "Changes needed");
  const filtered = items.filter(item => (view!=="active" || !isComplete(item)) && (view!=="reviews" || item.status === "Review requested") && (view!=="completed" || isComplete(item)) && (status === "All" || item.status === status) && (repo === "All repositories" || item.repository === repo) && (type === "All types" || item.type === type) && Object.values(item).join(" ").toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort === "repository" ? a.repository.localeCompare(b.repository) : sort === "title" ? a.title.localeCompare(b.title) : b.updated.localeCompare(a.updated));
  function navigate(nextView:View) { setView(nextView);setStatus("All");setRepo("All repositories");setQuery("");setType("All types"); }
  function edit(item:Contribution) { setDraft({...item});setFormError(""); }
  function save(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(!draft)return;
    const annotation={tests:draft.tests,next:draft.next,notes:draft.notes,type:draft.type};
    annotationsRef.current={...annotationsRef.current,[draft.id]:annotation};
    try{localStorage.setItem(accountNotesKey(accountRef.current),JSON.stringify(annotationsRef.current));setSaveError("");}catch{setSaveError("Your notes could not be saved in this browser. Export your work before closing.");}
    setItems(previous=>applyAnnotations(previous,annotationsRef.current));setDraft(null);setNotice("Workflow notes saved. GitHub fields stay in sync.");
  }
  function download() {const blob=new Blob([JSON.stringify(items,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`nebula-${accountRef.current}-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);setMenu(false);setNotice("Backup exported");}
  async function importData(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];if(!file)return;
    const importAccount=accountRef.current;
    try{
      const imported=z.array(contributionSchema).max(10000).parse(JSON.parse(await file.text()));
      if(importAccount!==accountRef.current)throw new Error("Account changed during import");
      const notes={...annotationsRef.current};
      for(const item of imported){if(item.id.startsWith("github-"))notes[item.id]={tests:item.tests,next:item.next,notes:item.notes,type:item.type};}
      localStorage.setItem(accountNotesKey(accountRef.current),JSON.stringify(notes));annotationsRef.current=notes;setItems(previous=>applyAnnotations(previous,notes));setNotice("Workflow notes restored. Contributions are fetched from GitHub.");
    }catch{setNotice("Could not import this backup. Choose a Nebula GitHub export and check browser storage.");}
    event.target.value="";setMenu(false);
  }
  const pageTitle=view==="active"?"Active contributions":view==="reviews"?"Pending reviews":view==="completed"?"Completed contributions":view==="repositories"?"Your repositories":"Contribution overview";
  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="Nebula home"><span className="brand-symbol"><img src="/art/contribution-sculpture.webp" alt="" width={36} height={36}/></span>nebula<span className="brand-dot">.</span></a>
      <div className="workspace"><span className="workspace-avatar">M</span><div>{login||"Choose an account"}<small>GitHub contributions</small></div><ChevronDown size={15}/></div>
      <div className="nav-caption">Workspace</div>
      <nav aria-label="Workspace navigation">
        <button aria-label="Overview" className={(view==="all"||view==="active")?"nav-item selected":"nav-item"} onClick={()=>navigate("all")}><LayoutDashboard size={18}/>Overview</button>
        <button aria-label="Pending reviews" className={view==="reviews"?"nav-item selected":"nav-item"} onClick={()=>navigate("reviews")}><GitPullRequest size={18}/>Pending reviews<span className="nav-count">{reviews.length}</span></button>
        <button aria-label="Completed" className={view==="completed"?"nav-item selected":"nav-item"} onClick={()=>navigate("completed")}><CircleCheck size={18}/>Completed<span className="nav-count neutral">{completed.length}</span></button>
        <button aria-label="Repositories" className={view==="repositories"?"nav-item selected":"nav-item"} onClick={()=>navigate("repositories")}><FolderGit2 size={18}/>Repositories</button>
      </nav>
      <div className="nav-caption repo-heading">Repositories<span>{repositoryNames.length}</span></div>
      <nav aria-label="Repository filters">{repositoryNames.map(name=><button key={name} className={`nav-item repo-nav ${repo===name?"repo-active":""}`} onClick={()=>{navigate("all");setRepo(name);}}><span className={`repo-dot dot-${name.toLowerCase()}`}/><span className="repo-name">{name}</span><span className="repo-count">{items.filter(item=>item.repository===name).length}</span></button>)}</nav>
      {login&&<a className="add-repo" href={`https://github.com/${login}`} target="_blank" rel="noreferrer"><ExternalLink size={15}/>View GitHub profile</a>}
      <div className="sidebar-bottom"><div className="small-note"><GitBranch size={19}/><strong>Small patches. Big impact.</strong><p>A little progress, across every project.</p></div><div className="profile"><span className="profile-avatar">ME</span><div>{login||"No account selected"}<small>Public GitHub activity</small></div><span className="online-dot"/></div></div>
    </aside>
    <div className="main-shell">
      <header className="topbar"><div className="breadcrumb">Workspace<ChevronRight size={14}/><span>{(view==="all"||view==="active")?"Overview":view==="reviews"?"Reviews":view==="completed"?"Completed":"Repositories"}</span></div><div className="topbar-right"><div className="account-switch" ref={accountControlRef}>
        <button className="account-trigger" aria-label="Switch GitHub account" aria-expanded={accountOpen} aria-controls="account-switch-form" onClick={()=>{setAccountOpen(!accountOpen);setLoginInput(login);setAccountError("");}}><span className="online-dot"/><span>{login?"@"+login:"Choose account"}</span><ChevronDown size={13}/></button>
        {accountOpen&&<form id="account-switch-form" className="account-menu" aria-label="Switch GitHub account" onSubmit={switchAccount}>
          <h2>{login?"Switch GitHub account":"Choose a GitHub account"}</h2><p>Load public contributions for any GitHub username. Notes stay separate for each account.</p>
          <label htmlFor="github-username">GitHub username</label><input id="github-username" ref={accountInputRef} value={loginInput} autoComplete="off" spellCheck={false} placeholder="e.g. octocat" onChange={event=>{setLoginInput(event.target.value);setAccountError("");}} aria-invalid={Boolean(accountError)} aria-describedby={accountError?"account-error":undefined}/>
          {accountError&&<p id="account-error" className="account-error" role="alert">{accountError}</p>}
          <div className="account-menu-actions"><button type="button" className="secondary" onClick={()=>setAccountOpen(false)}>Cancel</button><button type="submit" className="primary" disabled={syncing}>{syncing?"Loading…":login?"Switch account":"Load contributions"}</button></div>
        </form>}
      </div><span className="top-avatar">ME</span></div></header>
      <main>
        <section className="page-heading"><div className="branch-sculpture" aria-hidden="true"><img src="/art/contribution-sculpture.webp" alt="" width={200} height={140}/></div><div><h1>{view==="all"?<>Contribution<br/>workbench</>:pageTitle}<span className="heading-dot">.</span></h1><p>Good work, across every repository. Keep your next move in sight.</p></div><button className="primary" onClick={()=>void sync()} disabled={syncing}><RefreshCw size={16} className={syncing?"sync-spin":""}/>{syncing?"Syncing GitHub…":login?"Sync GitHub":"Choose GitHub account"}</button></section>
        {saveError && <div className="error-banner" role="alert">{saveError}<button onClick={download}>Export backup</button></div>}
        <div className="sync-info"><span>{login?<>Fetching public issues authored by or assigned to @{login}, and pull requests they authored.</>:"Choose a GitHub username to load public contributions."}</span><span>{syncedAt?"Updated "+new Date(syncedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}):"Waiting for first sync"} · every 15 min</span></div>
        {syncError&&<div className="error-banner" role="alert">{syncError}{syncedAt&&" Showing the last successful sync."}</div>}
        {warnings.length>0&&<details className="sync-warnings"><summary>Sync details and limits</summary>{warnings.map(warning=><p key={warning}>{warning}</p>)}</details>}
        <section className="summary" aria-label="Contribution dashboard">
          <button className="stat" onClick={()=>navigate("active")}><div className="stat-label">Active contributions<GitBranch size={17}/></div><div className="stat-value">{active.length}<span className="stat-tag green">In motion</span></div><p>Across {new Set(active.map(item=>item.repository)).size} repositories</p></button>
          <button className="stat" onClick={()=>navigate("reviews")}><div className="stat-label">Pending reviews<GitPullRequest size={17}/></div><div className="stat-value">{reviews.length}<span className="stat-tag amber">Awaiting feedback</span></div><p>{needsChanges.length} {needsChanges.length===1?"contribution needs":"contributions need"} your changes</p></button>
          <button className="stat" onClick={()=>navigate("completed")}><div className="stat-label">Completed work<CheckCheck size={18}/></div><div className="stat-value">{completed.length}<span className="stat-tag purple">Nice work</span></div><p>{items.filter(item=>item.status==="Merged").length} merged · {items.filter(item=>item.status==="Closed").length} closed</p></button>
        </section>
        {needsChanges.length>0 && view==="all" && <button className="attention-strip" onClick={()=>{setStatus("Changes needed");setRepo("All repositories");}}><span className="attention-icon"><Code2 size={17}/></span><span><strong>A little follow-up goes a long way.</strong> {needsChanges.length} {needsChanges.length===1?"contribution is":"contributions are"} waiting on your changes.</span><span className="attention-link">View contributions<ArrowUpRight size={15}/></span></button>}
        {view==="repositories" && <section className="repository-grid" aria-label="Repository overview">{repositoryNames.map(name=><button key={name} onClick={()=>{navigate("all");setRepo(name);}}><RepoMark name={name}/><strong>{name}</strong><span>{items.filter(item=>item.repository===name&&!isComplete(item)).length} active contributions</span><ArrowUpRight size={17}/></button>)}</section>}
        <section className="tracker" aria-label="Contribution tracker">
          <div className="section-heading"><div><h2>{view==="active"?"Active contributions":view==="reviews"?"Waiting for review":view==="completed"?"Finished work":"All contributions"}</h2><span className="count-badge">{items.filter(item=>view==="active"?!isComplete(item):view==="reviews"?item.status==="Review requested":view==="completed"?isComplete(item):true).length}</span></div><div className="table-actions"><button className="subtle" onClick={()=>setDetails(!details)} aria-pressed={details}><Columns3 size={15}/>{details?"Compact view":"All fields"}</button><div className="menu-wrap"><button className="icon-button" aria-label="Backup options" aria-expanded={menu} onClick={()=>setMenu(!menu)}><MoreHorizontal size={20}/></button>{menu&&<div className="dropdown"><button onClick={download}><ArrowDownToLine size={15}/>Export backup</button><button onClick={()=>importRef.current?.click()}><ArrowUpFromLine size={15}/>Import backup</button></div>}</div></div></div>
          <div className="status-tabs" role="group" aria-label="Filter by status">{["All",...statuses].map(s=><button key={s} aria-pressed={status===s} className={status===s?"active":""} onClick={()=>setStatus(s==="All"?"All":statuses.find(value=>value===s) || "All")}>{s==="All"?"All contributions":s}<span>{items.filter(item=>(view!=="active"||!isComplete(item))&&(view!=="reviews"||item.status==="Review requested")&&(view!=="completed"||isComplete(item))&&(s==="All"||item.status===s)).length}</span></button>)}</div>
          <div className="filterbar"><label className="search"><Search size={17}/><input placeholder="Search contributions..." aria-label="Search contributions" value={query} onChange={event=>setQuery(event.target.value)}/>{query&&<button aria-label="Clear search" onClick={()=>setQuery("")}><X size={14}/></button>}</label><div className="filter-controls"><label className="select-filter"><FolderGit2 size={14}/><select aria-label="Filter by repository" value={repo} onChange={event=>setRepo(event.target.value)}><option>All repositories</option>{repositoryNames.map(name=><option key={name}>{name}</option>)}</select></label><label className="select-filter"><ListFilter size={14}/><select aria-label="Filter by contribution type" value={type} onChange={event=>setType(event.target.value)}><option>All types</option>{types.map(name=><option key={name}>{name}</option>)}</select></label><label className="select-filter sort"><select aria-label="Sort contributions" value={sort} onChange={event=>setSort(event.target.value)}><option value="recent">Recently updated</option><option value="repository">Repository A–Z</option><option value="title">Title A–Z</option></select></label></div></div>
          <div className="table-scroll"><table><thead><tr><th className="contribution-col">Contribution</th><th>Repository</th><th>Type</th><th>Status</th><th className="next-col">Next action</th>{details&&<><th>Reviewer feedback</th><th>Requested changes</th><th>Tests run</th><th>Commit or branch</th><th>Notes</th></>}<th><span className="sr-only">Edit</span></th></tr></thead><tbody>{filtered.map(item=><tr key={item.id}><td><div className="contribution-cell"><span className={`row-icon ${slug(item.status)}`}><StatusIcon status={item.status}/></span><div><button className="title-button" onClick={()=>edit(item)}>{item.title}</button><div className="contribution-meta">{item.url?<a href={item.url} target="_blank" rel="noreferrer">{item.url.includes("/pull/")?"Pull request #"+item.url.split("/").pop():"Issue #"+item.url.split("/").pop()}<ExternalLink size={10}/></a>:<span>No GitHub link yet</span>}</div></div></div></td><td><div className="repo-cell"><RepoMark name={item.repository}/>{item.repository}</div></td><td><span className={`type-chip type-${slug(item.type)}`}>{item.type}</span></td><td><label className={`status-chip ${slug(item.status)}`}><StatusIcon status={item.status}/><span>{item.status}</span></label></td><td><button className={`next-action ${!item.next?"finished":""}`} onClick={()=>edit(item)}>{item.next|| (isComplete(item)?<><Check size={12}/>All wrapped up</>:"Add next action")}</button></td>{details&&<><td className="detail-cell">{item.feedback||"—"}</td><td className="detail-cell">{item.changes||"—"}</td><td className="detail-cell">{item.tests||"—"}</td><td className="detail-cell branch-cell">{item.branch||"—"}</td><td className="detail-cell">{item.notes||"—"}</td></>}<td><button className="row-edit" onClick={()=>edit(item)} aria-label={`Edit ${item.title}`}><MoreHorizontal size={18}/></button></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty-state"><Search size={28}/><h3>{syncing?"Fetching your GitHub contributions":syncError?"GitHub sync needs attention":!login?"Choose a GitHub account":"No matching contributions"}</h3><p>{items.length?"Try another search or clear your filters.":login?"Public issues and pull requests from @"+login+" appear here automatically. Private repositories are not included.":"Enter a GitHub username to see their public issues and pull requests. No account is preselected."}</p><button className="secondary" disabled={syncing} onClick={()=>items.length?navigate("all"):void sync()}>{items.length?"Clear all filters":login?"Retry GitHub sync":"Choose account"}</button></div>}</div>
          <div className="table-footer"><span>Showing {filtered.length} of {items.length} contributions</span><span><span className="online-dot"/>{syncing?"Syncing GitHub…":syncError?"Sync unavailable":syncedAt?"Synced from GitHub":ready?(login?"Waiting for GitHub":"No account selected"):"Loading workspace"}</span></div>
        </section>
        <footer className="page-footer"><span><BookOpen size={14}/>Public GitHub data · Workflow notes saved on this device.</span><button onClick={download}><ArrowDownToLine size={13}/>Export your work</button></footer>
      </main>
    </div>
    <input type="file" accept=".json,application/json" hidden ref={importRef} onChange={importData}/>
    <dialog ref={panelRef} aria-label="Contribution editor" className="editor" onCancel={()=>setDraft(null)} onClick={event=>{if(event.target===event.currentTarget)setDraft(null);}}>{draft&&<form onSubmit={save}>
      <header className="editor-heading"><div><h2>Keep things moving</h2><p>GitHub details and your workflow notes</p></div><button className="icon-button" type="button" aria-label="Close contribution editor" onClick={()=>setDraft(null)}><X size={21}/></button></header>
      <div className="editor-content">
        <label>Contribution title<input readOnly value={draft.title}/></label>
        <label>Repository<input readOnly value={draft.repository}/></label>
        <a className="github-source" href={draft.url} target="_blank" rel="noreferrer">Open on GitHub<ExternalLink size={13}/></a>
        <label>Status<input readOnly value={draft.status}/></label>
        <label>Contribution type<select value={draft.type} onChange={event=>setDraft({...draft,type:z.enum(types).parse(event.target.value)})}>{types.map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="next-field">Next action<input autoFocus value={draft.next} placeholder="One small step to move this forward" onChange={event=>setDraft({...draft,next:event.target.value})}/></label>
        <label>Reviewer feedback<textarea readOnly rows={4} value={draft.feedback||"No review text loaded. Open GitHub for full feedback."}/></label>
        <label>Requested changes<textarea readOnly rows={3} value={draft.changes||"No requested change text loaded."}/></label>
        <label>Commit or branch<input readOnly value={draft.branch||"Open GitHub for branch details"}/></label>
        <label>Tests run<textarea rows={3} value={draft.tests} placeholder="Commands, results, and anything still to check" onChange={event=>setDraft({...draft,tests:event.target.value})}/></label>
        <label>Notes<textarea rows={4} value={draft.notes} placeholder="Context to keep alongside the GitHub contribution" onChange={event=>setDraft({...draft,notes:event.target.value})}/></label>
        {formError&&<p className="form-error" role="alert">{formError}</p>}
      </div>
      <footer className="editor-footer"><button type="button" className="secondary" onClick={()=>setDraft(null)}>Cancel</button><button type="submit" className="primary"><Check size={16}/>Save workflow notes</button></footer>
    </form>}</dialog>
    {notice&&<div className="toast" role="status"><CircleCheck size={17}/>{notice}</div>}
  </div>;
}
