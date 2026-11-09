export function isSameOriginRequest(request:Request):boolean{
  const origin=request.headers.get("origin");
  if(!origin)return false;
  try{
    const source=new URL(origin);
    const host=request.headers.get("host")||new URL(request.url).host;
    return source.origin===origin&&source.host===host;
  }catch{return false;}
}
