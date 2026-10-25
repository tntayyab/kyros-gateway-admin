const M="https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql",D=atob("cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU=");async function i(t){const a=await fetch(M,{method:"POST",headers:{"Neon-Connection-String":D},body:JSON.stringify({query:t})});if(!a.ok){const l=await a.text();throw new Error(`Neon SQL error (${a.status}): ${l}`)}return(await a.json()).rows||[]}async function H(){return i(`
    SELECT 
      id, email, name, role, status, approved_by, notes,
      mobile, COALESCE(plan, 'free_trial') as plan,
      COALESCE(agreed_price, 0) as agreed_price,
      COALESCE(paid_amount, 0) as paid_amount,
      anydesk_id,
      COALESCE(is_earning, false) as is_earning,
      COALESCE(is_supported, false) as is_supported,
      created_at, updated_at
    FROM public.kyros_access_control
    ORDER BY 
      CASE 
        WHEN status = 'pending' THEN 1
        WHEN status = 'approved' THEN 2
        ELSE 3
      END,
      updated_at DESC;
  `)}async function h(t,a,r){const l=t.replace(/'/g,"''"),n=r.replace(/'/g,"''"),c=`
    UPDATE public.kyros_access_control
    SET status = '${a}', approved_by = '${n}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${l}');
  `;return i(c)}async function P(t,a){const r=t.replace(/'/g,"''"),n=`
    UPDATE public.kyros_access_control
    SET plan = '${a.replace(/'/g,"''")}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${r}');
  `;return i(n)}async function $(t,a,r){const l=t.replace(/'/g,"''"),n=`
    UPDATE public.kyros_access_control
    SET agreed_price = ${Number(a)||0}, paid_amount = ${Number(r)||0}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${l}');
  `;return i(n)}async function I(t,a,r,l){const n=t.replace(/'/g,"''"),m=`
    UPDATE public.kyros_access_control
    SET anydesk_id = '${a.replace(/'/g,"''")}', is_earning = ${r?"true":"false"}, is_supported = ${l?"true":"false"}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${n}');
  `;return i(m)}async function Y(t,a,r,l){const n=t.trim().toLowerCase().replace(/'/g,"''"),c=a.trim().replace(/'/g,"''"),m=r.trim().replace(/'/g,"''"),p=l.trim().replace(/'/g,"''"),u=`
    INSERT INTO public.kyros_access_control (email, name, role, status, plan, approved_by, notes, created_at, updated_at)
    VALUES ('${n}', '${c}', '${m}', 'approved', '${p}', 'itstasdidnur@gmail.com', 'Pre-approved by Boss TN TAYYAB', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET role = EXCLUDED.role, status = 'approved', plan = EXCLUDED.plan, updated_at = NOW();
  `;return i(u)}async function U(t){const r=`DELETE FROM public.kyros_access_control WHERE LOWER(email) = LOWER('${t.trim().toLowerCase().replace(/'/g,"''")}');`;return i(r)}function f(t){if(!t)return"None";let a=t.replace(/^custom:[^/]+\//,"");if(a.includes("/")){const r=a.split("/");return r[r.length-1]}return a}function y(t){if(!t)return"Unknown";if(t.startsWith("custom:"))return"Custom Gateway";const a=t.toLowerCase();return a==="openrouter"?"OpenRouter":a==="openai"?"OpenAI":a==="anthropic"?"Anthropic":a==="google"?"Google Gemini":a==="groq"?"Groq":a==="ollama"?"Ollama (Local)":t.charAt(0).toUpperCase()+t.slice(1)}function A(t,a){if(!t)return!1;const r=t.toLowerCase(),l=(a||"").toLowerCase();return!!(r.includes("free")||l.includes("free")||r==="openrouter/free")}async function B(){const t=`
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
  `,[r,l]=await Promise.all([i(t),i(a)]),n=l.map(e=>({id:e.id,provider:e.provider,clean_provider:y(e.provider),label:e.label||"Default",key_prefix:e.key_prefix,auth_type:e.auth_type,is_active:!!e.is_active,is_free:!!e.is_free,connected_at:e.connected_at}));let c=0,m=0,p=0,u=0;const b=[],C=r.map(e=>{m+=Number(e.total_tokens)||0,p+=Number(e.total_cost)||0;const N=typeof e.harnesses=="string"?JSON.parse(e.harnesses):e.harnesses||[];u+=N.length;const E=N.map(s=>{const g=(typeof s.tiers=="string"?JSON.parse(s.tiers):s.tiers||[]).map(_=>{const S=_.primary_route,O=S?.model||null,L=S?.provider||null,W=(_.fallback_routes||[]).map((d,w)=>(c++,{model:d.model,clean_model:f(d.model),provider:d.provider,clean_provider:y(d.provider),is_free:A(d.model,d.provider),rank:w+1}));return{tier:_.tier||"default",primary_model:O,clean_primary_model:f(O),primary_provider:L,clean_primary_provider:y(L),is_primary_free:A(O,L),fallbacks:W}}),T=g.find(_=>_.tier==="default"&&_.primary_model)||g.find(_=>_.primary_model)||g[0]||null,o={agent_id:s.agent_id,agent_name:s.agent_name,agent_display_name:s.agent_display_name||s.agent_name,agent_category:s.agent_category,agent_platform:s.agent_platform,tiers:g,primary_tier:T,total_messages:Number(s.total_messages)||0,total_tokens:Number(s.total_tokens)||0,total_cost:Number(s.total_cost)||0,last_model:s.last_model,clean_last_model:f(s.last_model),last_provider:s.last_provider,clean_last_provider:y(s.last_provider),last_active:s.last_active};return b.push({agent_id:o.agent_id,agent_name:o.agent_name,display_name:o.agent_display_name,agent_category:o.agent_category,agent_platform:o.agent_platform,user_email:e.user_email,user_name:e.user_name,connected_providers:n,tiers:o.tiers,primary_tier:o.primary_tier,total_messages:o.total_messages,total_tokens:o.total_tokens,total_cost:o.total_cost,last_model:o.last_model,clean_last_model:o.clean_last_model,last_provider:o.last_provider,last_active:o.last_active}),o}),k=E.slice().sort((s,v)=>v.total_messages-s.total_messages)[0]||E.find(s=>s.primary_tier?.primary_model)||E[0]||null;return{user_id:e.user_id,user_name:e.user_name||"TN TAYYAB",user_email:e.user_email||"itstasdidnur@gmail.com",user_image:e.user_image,user_created_at:e.user_created_at,display_name:e.display_name||e.user_name||"TN TAYYAB",headline:e.headline,bio:e.bio,location:e.location,website:e.website,banner_url:e.banner_url,avatar_url:e.avatar_url,mobile:e.mobile,anydesk_id:e.anydesk_id,is_earning:!!e.is_earning,is_supported:!!e.is_supported,plan:e.plan||"owner",member_role:e.member_role||"superadmin",harnesses:E,primary_harness:k,connected_providers:n,total_messages:Number(e.total_messages)||0,total_tokens:Number(e.total_tokens)||0,total_cost:Number(e.total_cost)||0,last_active:e.last_active}}),R={total_users:C.length,total_agents:u,total_providers:n.length,free_providers_count:n.filter(e=>e.is_free).length,paid_providers_count:n.filter(e=>!e.is_free).length,total_fallback_models:c,total_tokens_consumed:m,total_cost_usd:p};return{users:C,agents:b,providers:n,summary:R}}export{P as a,$ as b,B as c,U as d,I as e,H as g,h as u,Y as w};
