const v="https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql",S=atob("cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU=");async function o(a){const t=await fetch(v,{method:"POST",headers:{"Neon-Connection-String":S},body:JSON.stringify({query:a})});if(!t.ok){const n=await t.text();throw new Error(`Neon SQL error (${t.status}): ${n}`)}return(await t.json()).rows||[]}async function A(){return o(`
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
  `)}async function k(a,t,s){const n=a.replace(/'/g,"''"),r=s.replace(/'/g,"''"),l=`
    UPDATE public.kyros_access_control
    SET status = '${t}', approved_by = '${r}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${n}');
  `;return o(l)}async function W(a,t){const s=a.replace(/'/g,"''"),r=`
    UPDATE public.kyros_access_control
    SET plan = '${t.replace(/'/g,"''")}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${s}');
  `;return o(r)}async function w(a,t,s){const n=a.replace(/'/g,"''"),r=`
    UPDATE public.kyros_access_control
    SET agreed_price = ${Number(t)||0}, paid_amount = ${Number(s)||0}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${n}');
  `;return o(r)}async function M(a,t,s,n){const r=a.replace(/'/g,"''"),c=`
    UPDATE public.kyros_access_control
    SET anydesk_id = '${t.replace(/'/g,"''")}', is_earning = ${s?"true":"false"}, is_supported = ${n?"true":"false"}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${r}');
  `;return o(c)}async function D(a,t,s,n){const r=a.trim().toLowerCase().replace(/'/g,"''"),l=t.trim().replace(/'/g,"''"),c=s.trim().replace(/'/g,"''"),d=n.trim().replace(/'/g,"''"),m=`
    INSERT INTO public.kyros_access_control (email, name, role, status, plan, approved_by, notes, created_at, updated_at)
    VALUES ('${r}', '${l}', '${c}', 'approved', '${d}', 'itstasdidnur@gmail.com', 'Pre-approved by Boss TN TAYYAB', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET role = EXCLUDED.role, status = 'approved', plan = EXCLUDED.plan, updated_at = NOW();
  `;return o(m)}async function h(a){const s=`DELETE FROM public.kyros_access_control WHERE LOWER(email) = LOWER('${a.trim().toLowerCase().replace(/'/g,"''")}');`;return o(s)}function g(a){if(!a)return"None";let t=a.replace(/^custom:[^/]+\//,"");if(t.includes("/")){const s=t.split("/");return s[s.length-1]}return t}function y(a){if(!a)return"Unknown";if(a.startsWith("custom:"))return"Custom Gateway";const t=a.toLowerCase();return t==="openrouter"?"OpenRouter":t==="openai"?"OpenAI":t==="anthropic"?"Anthropic":t==="google"?"Google Gemini":t==="groq"?"Groq":t==="ollama"?"Ollama (Local)":a.charAt(0).toUpperCase()+a.slice(1)}function O(a,t){if(!a)return!1;const s=a.toLowerCase(),n=(t||"").toLowerCase();return!!(s.includes("free")||n.includes("free")||s==="openrouter/free")}async function $(){const a=`
    WITH agent_summary AS (
      SELECT 
        a.id as agent_id,
        a.name as agent_name,
        a.display_name,
        a.agent_category,
        a.agent_platform,
        COALESCE(u.email, 'itstasdidnur@gmail.com') as user_email,
        COALESCE(u.name, 'TN TAYYAB') as user_name
      FROM agents a
      LEFT JOIN "user" u ON u.id = a.tenant_id
      WHERE a.deleted_at IS NULL
    ),
    tiers_data AS (
      SELECT 
        agent_id,
        json_agg(json_build_object(
          'tier', tier,
          'primary_route', override_route,
          'fallback_routes', fallback_routes
        )) as tiers
      FROM tier_assignments
      GROUP BY agent_id
    ),
    messages_data AS (
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
    )
    SELECT 
      s.*,
      COALESCE(t.tiers, '[]'::json) as tiers,
      COALESCE(m.total_messages, 0) as total_messages,
      COALESCE(m.total_tokens, 0) as total_tokens,
      COALESCE(m.total_cost, 0) as total_cost,
      m.last_active,
      m.last_model,
      m.last_provider
    FROM agent_summary s
    LEFT JOIN tiers_data t ON t.agent_id = s.agent_id
    LEFT JOIN messages_data m ON m.agent_name = s.agent_name;
  `,t=`
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
  `,[s,n]=await Promise.all([o(a),o(t)]),r=n.map(e=>({id:e.id,provider:e.provider,clean_provider:y(e.provider),label:e.label||"Default",key_prefix:e.key_prefix,auth_type:e.auth_type,is_active:!!e.is_active,is_free:!!e.is_free,connected_at:e.connected_at}));let l=0,c=0,d=0;const m=s.map(e=>{c+=Number(e.total_tokens)||0,d+=Number(e.total_cost)||0;const u=(typeof e.tiers=="string"?JSON.parse(e.tiers):e.tiers||[]).map(i=>{const f=i.primary_route,p=f?.model||null,E=f?.provider||null,C=(i.fallback_routes||[]).map((_,b)=>(l++,{model:_.model,clean_model:g(_.model),provider:_.provider,clean_provider:y(_.provider),is_free:O(_.model,_.provider),rank:b+1}));return{tier:i.tier,primary_model:p,clean_primary_model:g(p),primary_provider:E,clean_primary_provider:y(E),is_primary_free:O(p,E),fallbacks:C}}),N=u.find(i=>i.tier==="default"&&i.primary_model)||u.find(i=>i.primary_model)||u[0]||null;return{agent_id:e.agent_id,agent_name:e.agent_name,display_name:e.display_name||e.agent_name,agent_category:e.agent_category,agent_platform:e.agent_platform,user_email:e.user_email,user_name:e.user_name,connected_providers:r,tiers:u,primary_tier:N,total_messages:Number(e.total_messages)||0,total_tokens:Number(e.total_tokens)||0,total_cost:Number(e.total_cost)||0,last_model:e.last_model,clean_last_model:g(e.last_model),last_provider:e.last_provider,last_active:e.last_active}}),L={total_agents:m.length,total_providers:r.length,free_providers_count:r.filter(e=>e.is_free).length,paid_providers_count:r.filter(e=>!e.is_free).length,total_fallback_models:l,total_tokens_consumed:c,total_cost_usd:d};return{agents:m,providers:r,summary:L}}export{W as a,w as b,$ as c,h as d,M as e,A as g,k as u,D as w};
