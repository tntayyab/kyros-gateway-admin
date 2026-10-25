const d="https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql",i=atob("cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU=");async function c(a){const e=await fetch(d,{method:"POST",headers:{"Neon-Connection-String":i},body:JSON.stringify({query:a})});if(!e.ok){const t=await e.text();throw new Error(`Neon SQL error (${e.status}): ${t}`)}return(await e.json()).rows||[]}async function E(){return c(`
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
  `)}async function u(a,e,s){const t=a.replace(/'/g,"''"),r=s.replace(/'/g,"''"),n=`
    UPDATE public.kyros_access_control
    SET status = '${e}', approved_by = '${r}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${t}');
  `;return c(n)}async function _(a,e){const s=a.replace(/'/g,"''"),r=`
    UPDATE public.kyros_access_control
    SET plan = '${e.replace(/'/g,"''")}', updated_at = NOW()
    WHERE LOWER(email) = LOWER('${s}');
  `;return c(r)}async function m(a,e,s){const t=a.replace(/'/g,"''"),r=`
    UPDATE public.kyros_access_control
    SET agreed_price = ${Number(e)||0}, paid_amount = ${Number(s)||0}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${t}');
  `;return c(r)}async function y(a,e,s,t){const r=a.replace(/'/g,"''"),o=`
    UPDATE public.kyros_access_control
    SET anydesk_id = '${e.replace(/'/g,"''")}', is_earning = ${s?"true":"false"}, is_supported = ${t?"true":"false"}, updated_at = NOW()
    WHERE LOWER(email) = LOWER('${r}');
  `;return c(o)}async function N(a,e,s,t){const r=a.trim().toLowerCase().replace(/'/g,"''"),n=e.trim().replace(/'/g,"''"),o=s.trim().replace(/'/g,"''"),p=t.trim().replace(/'/g,"''"),l=`
    INSERT INTO public.kyros_access_control (email, name, role, status, plan, approved_by, notes, created_at, updated_at)
    VALUES ('${r}', '${n}', '${o}', 'approved', '${p}', 'itstasdidnur@gmail.com', 'Pre-approved by Boss TN TAYYAB', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE
    SET role = EXCLUDED.role, status = 'approved', plan = EXCLUDED.plan, updated_at = NOW();
  `;return c(l)}async function O(a){const s=`DELETE FROM public.kyros_access_control WHERE LOWER(email) = LOWER('${a.trim().toLowerCase().replace(/'/g,"''")}');`;return c(s)}export{_ as a,m as b,y as c,O as d,E as g,u,N as w};
