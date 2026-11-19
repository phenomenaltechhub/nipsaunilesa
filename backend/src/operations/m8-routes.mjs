export function m8Route(ops,session,method,url,body){const p=url.pathname.replace('/api/v1',''),parts=p.split('/'),id=parts[3];
 if(/^\/admin\/community\/messages\/\d+$/.test(p)&&method==='DELETE')return ops.community.removeMessage(session,Number(parts[4]),body);
 if(/^\/community\/messages\/\d+\/context$/.test(p)&&method==='GET')return ops.community.context(session,Number(id));
 if(p==='/admin/community/reports'&&method==='GET')return ops.community.reports(session,Number(url.searchParams.get('offset')??0));
 if(p==='/website/catalogue'&&method==='GET')return ops.website.catalogue(session);
 if(p==='/website/references'&&method==='GET')return ops.website.search(session,url.searchParams.get('q')??'');
 if(p==='/community/live'&&method==='GET')return ops.community.live(session);
 if(p==='/community/typing'&&method==='PUT')return ops.community.typing(session,body);
 if(p==='/community/reads'&&method==='POST')return ops.community.acknowledge(session,body);
 if(/^\/community\/messages\/\d+\/read-by$/.test(p)&&method==='GET')return ops.community.readBy(session,Number(id),Number(url.searchParams.get('offset')??0));
 if(p==='/community/search'&&method==='GET')return ops.community.search(session,{q:url.searchParams.get('q')??'',pinned:url.searchParams.get('pinned')==='true',before:Number(url.searchParams.get('before')??Number.MAX_SAFE_INTEGER),around:url.searchParams.has('around')?Number(url.searchParams.get('around')):null});
 if(/^\/community\/messages\/\d+\/pin$/.test(p)&&method==='PUT')return ops.community.pin(session,Number(id),body);
 if(p==='/community/preferences'&&['GET','PUT'].includes(method))return ops.community.preferences(session,method==='PUT'?body:undefined);
 if(p==='/community/images'&&method==='POST')return ops.community.upload(session,body);
 if(/^\/community\/images\/[a-f0-9-]{36}$/.test(p)&&method==='GET')return ops.community.image(session,id);
 if(/^\/admin\/community\/offices\/[a-f0-9-]{36}$/.test(p)&&method==='PUT')return ops.community.office(session,parts[4],body);
 if(p==='/community/threads'&&method==='GET')return ops.threads.list(session,Number(url.searchParams.get('offset')??0));
 if(p==='/community/threads'&&method==='POST')return ops.threads.request(session,body);
 if(p==='/community/support'&&method==='POST')return ops.threads.support(session,body);
 if(/^\/community\/threads\/[a-f0-9-]{36}$/.test(p)){if(method==='GET')return ops.threads.detail(session,id,Number(url.searchParams.get('before')??Number.MAX_SAFE_INTEGER));if(method==='PATCH')return ops.threads.action(session,id,body);}
 if(/^\/community\/threads\/[a-f0-9-]{36}\/messages$/.test(p)&&method==='POST')return ops.threads.send(session,id,body);
 if(/^\/community\/threads\/[a-f0-9-]{36}\/reports$/.test(p)&&method==='POST')return ops.threads.report(session,id,body);
 if(p==='/admin/community/private-reports'&&method==='GET')return ops.threads.reports(session,Number(url.searchParams.get('offset')??0));
 if(/^\/admin\/community\/private-reports\/[a-f0-9-]{36}$/.test(p)&&method==='PATCH')return ops.threads.decideReport(session,parts[4],body);
}
