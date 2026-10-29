const M="https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql",F=atob("cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU=");async function o(t){const a=await fetch(M,{method:"POST",headers:{"Neon-Connection-String":F},body:JSON.stringify({query:t})});if(!a.ok){const i=await a.text();throw new Error(`Neon SQL error (${a.status}): ${i}`)}return(await a.json()).rows||[]}async function H(){return o(`
    SELECT 
      m.id, m.email, m.name, m.role, m.status, m.approved_by, m.notes,
      m.mobile, COALESCE(m.plan, 'free_trial') as plan,
      COALESCE(m.agreed_price, 0) as agreed_price,
      COALESCE(m.paid_amount, 0) as paid_amount,
      m.anydesk_id,
      COALESCE(m.is_earning, false) as is_earning,
      COALESCE(m.is_supported, false) as is_supported,
      COALESCE(m.is_email_verified, false) as is_email_verified,
      m.created_at, m.updated_at,
      COALESCE(stats.req_count, 0)::int as requests_count,
      COALESCE(stats.total_tokens, 0)::bigint as tokens_count,
      COALESCE(prov.providers_json, '[]'::json) as connected_providers,
      stats.last_active
    FROM public.kyros_access_control m
    LEFT JOIN public."user" u ON LOWER(u.email) = LOWER(m.email)
    LEFT JOIN public.tenants t ON t.owner_user_id = u.id
    LEFT JOIN (
      SELECT 
        tenant_id,
        COUNT(*) as req_count,
        SUM(input_tokens + output_tokens) as total_tokens,
        MAX(timestamp) as last_active
      FROM public.agent_messages
      GROUP BY tenant_id
    ) stats ON stats.tenant_id = t.id
    LEFT JOIN (
      SELECT 
        tp.tenant_id,
        json_agg(DISTINCT COALESCE(cp.name, tp.provider)) FILTER (WHERE COALESCE(cp.name, tp.provider) IS NOT NULL AND COALESCE(cp.name, tp.provider) <> '') as providers_json
      FROM public.tenant_providers tp
      LEFT JOIN public.custom_providers cp ON tp.custom_provider_id = cp.id
      WHERE tp.is_active = true
      GROUP BY tp.tenant_id
    ) prov ON prov.tenant_id = t.id
    ORDER BY 
      CASE 
        WHEN m.status = 'pending' THEN 1
        WHEN m.status = 'approved' THEN 2
        ELSE 3
      END,
      requests_count DESC,
      m.updated_at DESC;
  `)}async function D(t,a){const r=t.replace(/'/g,"''"),l=`
    UPDATE public.kyros_access_control
    SET plan = '${a.replace(/'/g,"''")}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${r}');
  `;return o(l)}async function U(t,a,r){const i=t.replace(/'/g,"''"),l=`
    UPDATE public.kyros_access_control
    SET agreed_price = ${Number(a)||0}, paid_amount = ${Number(r)||0}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${i}');
  `;return o(l)}async function $(t,a,r,i){const l=t.replace(/'/g,"''"),c=`
    UPDATE public.kyros_access_control
    SET anydesk_id = '${a.replace(/'/g,"''")}', is_earning = ${r?"true":"false"}, is_supported = ${i?"true":"false"}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${l}');
  `;return o(c)}async function P(t,a,r,i){const l=t.trim().toLowerCase().replace(/'/g,"''"),d=a.trim().replace(/'/g,"''"),c=r.trim().replace(/'/g,"''"),p=i.trim().replace(/'/g,"''"),u=`
    INSERT INTO public.kyros_access_control (email, name, role, status, plan, approved_by, notes, created_at, updated_at)
    VALUES ('${l}', '${d}', '${c}', 'approved', '${p}', 'itstasdidnur@gmail.com', 'Pre-approved by Boss TN TAYYAB', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET role = EXCLUDED.role, status = 'approved', plan = EXCLUDED.plan, updated_at = NOW();
  `;return o(u)}async function Y(t,a="Boss TN TAYYAB"){const r=t.trim().toLowerCase().replace(/'/g,"''"),i=a.replace(/'/g,"''");return await o(`DELETE FROM public.session WHERE "userId" IN (SELECT id FROM public.user WHERE LOWER(email) = LOWER('${r}'));`),o(`
    UPDATE public.kyros_access_control
    SET status = 'rejected', approved_by = '${i}', notes = 'Blocked by Admin', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${r}');
  `)}async function B(t){const a=t.trim().toLowerCase().replace(/'/g,"''");return o(`
    UPDATE public.kyros_access_control
    SET status = 'pending', notes = 'Unblocked by Admin - Pending Review', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${a}');
  `)}async function h(t){const a=t.trim().toLowerCase().replace(/'/g,"''");return await o(`DELETE FROM public.session WHERE "userId" IN (SELECT id FROM public.user WHERE LOWER(email) = LOWER('${a}'));`),await o(`DELETE FROM public.account WHERE "userId" IN (SELECT id FROM public.user WHERE LOWER(email) = LOWER('${a}'));`),await o(`DELETE FROM public.user WHERE LOWER(email) = LOWER('${a}');`),await o(`DELETE FROM public.kyros_email_verifications WHERE LOWER(email) = LOWER('${a}');`),o(`DELETE FROM public.kyros_access_control WHERE LOWER(email) = LOWER('${a}');`)}function b(t){if(!t)return"None";let a=t.replace(/^custom:[^/]+\//,"");if(a.includes("/")){const r=a.split("/");return r[r.length-1]}return a}function O(t){if(!t)return"Unknown";if(t.startsWith("custom:"))return"Custom Gateway";const a=t.toLowerCase();return a==="openrouter"?"OpenRouter":a==="openai"?"OpenAI":a==="anthropic"?"Anthropic":a==="google"?"Google Gemini":a==="groq"?"Groq":a==="ollama"?"Ollama (Local)":t.charAt(0).toUpperCase()+t.slice(1)}function S(t,a){if(!t)return!1;const r=t.toLowerCase(),i=(a||"").toLowerCase();return!!(r.includes("free")||i.includes("free")||r==="openrouter/free")}async function j(){const t=`
    WITH user_base AS (
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.image as user_image,
        u."createdAt" as user_created_at,
        COALESCE(p.display_name, u.name) as display_name,
        p.headline,
        p.bio,
        p.location,
        p.website,
        p.banner_url,
        p.avatar_url,
        m.mobile,
        m.anydesk_id,
        COALESCE(m.is_earning, false) as is_earning,
        COALESCE(m.is_supported, false) as is_supported,
        COALESCE(m.plan, 'owner') as plan,
        COALESCE(m.role, 'superadmin') as member_role
      FROM "user" u
      LEFT JOIN kyros_user_profiles p ON LOWER(p.email) = LOWER(u.email)
      LEFT JOIN kyros_access_control m ON LOWER(m.email) = LOWER(u.email)
    ),
    agent_tiers AS (
      SELECT 
        a.id as agent_id,
        a.name as agent_name,
        a.display_name as agent_display_name,
        a.agent_category,
        a.agent_platform,
        t.owner_user_id as user_id,
        json_agg(json_build_object(
          'tier', ta.tier,
          'primary_route', ta.override_route,
          'fallback_routes', ta.fallback_routes
        )) as tiers
      FROM agents a
      JOIN tenants t ON t.id = a.tenant_id
      LEFT JOIN tier_assignments ta ON ta.agent_id = a.id
      WHERE a.deleted_at IS NULL
      GROUP BY a.id, a.name, a.display_name, a.agent_category, a.agent_platform, t.owner_user_id
    ),
    agent_metrics AS (
      SELECT 
        agent_name,
        count(*) as total_messages,
        COALESCE(sum(input_tokens + output_tokens), 0) as total_tokens,
        COALESCE(sum(cost_usd), 0) as total_cost,
        max(timestamp) as last_active,
        (SELECT model FROM agent_messages m2 WHERE m2.agent_name = m.agent_name ORDER BY timestamp DESC LIMIT 1) as last_model,
        (SELECT provider FROM agent_messages m3 WHERE m3.agent_name = m.agent_name ORDER BY timestamp DESC LIMIT 1) as last_provider
      FROM agent_messages m
      GROUP BY agent_name
    ),
    combined_agents AS (
      SELECT 
        at.*,
        COALESCE(am.total_messages, 0) as total_messages,
        COALESCE(am.total_tokens, 0) as total_tokens,
        COALESCE(am.total_cost, 0) as total_cost,
        am.last_active,
        am.last_model,
        am.last_provider
      FROM agent_tiers at
      LEFT JOIN agent_metrics am ON am.agent_name = at.agent_name
    ),
    grouped_user_agents AS (
      SELECT 
        user_id,
        json_agg(row_to_json(combined_agents)) as harnesses,
        COALESCE(sum(total_messages), 0) as total_messages,
        COALESCE(sum(total_tokens), 0) as total_tokens,
        COALESCE(sum(total_cost), 0) as total_cost,
        max(last_active) as last_active
      FROM combined_agents
      GROUP BY user_id
    )
    SELECT 
      ub.*,
      COALESCE(gua.harnesses, '[]'::json) as harnesses,
      COALESCE(gua.total_messages, 0) as total_messages,
      COALESCE(gua.total_tokens, 0) as total_tokens,
      COALESCE(gua.total_cost, 0) as total_cost,
      gua.last_active
    FROM user_base ub
    LEFT JOIN grouped_user_agents gua ON gua.user_id = ub.user_id;
  `,a=`
    SELECT 
      id,
      provider,
      label,
      key_prefix,
      auth_type,
      is_active,
      connected_at,
      CASE 
        WHEN provider = 'openrouter' OR provider LIKE '%free%' THEN true 
        ELSE false 
      END as is_free
    FROM tenant_providers;
  `,[r,i]=await Promise.all([o(t),o(a)]),l=i.map(e=>({id:e.id,provider:e.provider,clean_provider:O(e.provider),label:e.label||"Default",key_prefix:e.key_prefix,auth_type:e.auth_type,is_active:!!e.is_active,is_free:!!e.is_free,connected_at:e.connected_at}));let d=0,c=0,p=0,u=0;const y=[],R=r.map(e=>{c+=Number(e.total_tokens)||0,p+=Number(e.total_cost)||0;const N=typeof e.harnesses=="string"?JSON.parse(e.harnesses):e.harnesses||[];u+=N.length;const E=N.map(s=>{const g=(typeof s.tiers=="string"?JSON.parse(s.tiers):s.tiers||[]).map(_=>{const v=_.primary_route,L=v?.model||null,C=v?.provider||null,k=(_.fallback_routes||[]).map((m,w)=>(d++,{model:m.model,clean_model:b(m.model),provider:m.provider,clean_provider:O(m.provider),is_free:S(m.model,m.provider),rank:w+1}));return{tier:_.tier||"default",primary_model:L,clean_primary_model:b(L),primary_provider:C,clean_primary_provider:O(C),is_primary_free:S(L,C),fallbacks:k}}),W=g.find(_=>_.tier==="default"&&_.primary_model)||g.find(_=>_.primary_model)||g[0]||null,n={agent_id:s.agent_id,agent_name:s.agent_name,agent_display_name:s.agent_display_name||s.agent_name,agent_category:s.agent_category,agent_platform:s.agent_platform,tiers:g,primary_tier:W,total_messages:Number(s.total_messages)||0,total_tokens:Number(s.total_tokens)||0,total_cost:Number(s.total_cost)||0,last_model:s.last_model,clean_last_model:b(s.last_model),last_provider:s.last_provider,clean_last_provider:O(s.last_provider),last_active:s.last_active};return y.push({agent_id:n.agent_id,agent_name:n.agent_name,display_name:n.agent_display_name,agent_category:n.agent_category,agent_platform:n.agent_platform,user_email:e.user_email,user_name:e.user_name,connected_providers:l,tiers:n.tiers,primary_tier:n.primary_tier,total_messages:n.total_messages,total_tokens:n.total_tokens,total_cost:n.total_cost,last_model:n.last_model,clean_last_model:n.clean_last_model,last_provider:n.last_provider,last_active:n.last_active}),n}),A=E.slice().sort((s,f)=>f.total_messages-s.total_messages)[0]||E.find(s=>s.primary_tier?.primary_model)||E[0]||null;return{user_id:e.user_id,user_name:e.user_name||"TN TAYYAB",user_email:e.user_email||"itstasdidnur@gmail.com",user_image:e.user_image,user_created_at:e.user_created_at,display_name:e.display_name||e.user_name||"TN TAYYAB",headline:e.headline,bio:e.bio,location:e.location,website:e.website,banner_url:e.banner_url,avatar_url:e.avatar_url,mobile:e.mobile,anydesk_id:e.anydesk_id,is_earning:!!e.is_earning,is_supported:!!e.is_supported,plan:e.plan||"owner",member_role:e.member_role||"superadmin",harnesses:E,primary_harness:A,connected_providers:l,total_messages:Number(e.total_messages)||0,total_tokens:Number(e.total_tokens)||0,total_cost:Number(e.total_cost)||0,last_active:e.last_active}}),T={total_users:R.length,total_agents:u,total_providers:l.length,free_providers_count:l.filter(e=>e.is_free).length,paid_providers_count:l.filter(e=>!e.is_free).length,total_fallback_models:d,total_tokens_consumed:c,total_cost_usd:p};return{users:R,agents:y,providers:l,summary:T}}export{D as a,Y as b,U as c,h as d,j as e,$ as f,H as g,o as h,B as u,P as w};
