const m=[{id:"cyber-grid",name:"Cyber Grid (Default)",url:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"},{id:"neon-mesh",name:"Neon Horizon",url:"https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80"},{id:"aurora",name:"Aurora Borealis",url:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"},{id:"deep-space",name:"Cosmic Nebula",url:"https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80"},{id:"tech-minimal",name:"Executive Dark",url:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"}],p=[{id:"avatar-1",name:"Executive 3D",url:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"},{id:"avatar-2",name:"Tech Leader",url:"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"},{id:"avatar-3",name:"Cyber Architect",url:"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=500&q=80"},{id:"avatar-4",name:"Product Master",url:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"},{id:"avatar-5",name:"Golden Crown",url:"https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80"}],l="https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql",d=atob("cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU="),h="kyros_user_profile_";function b(a,r){const t=a.toLowerCase()==="itstasdidnur@gmail.com";return{email:a,display_name:t?"TN TAYYAB":r||a.split("@")[0],avatar_url:p[0].url,banner_url:m[0].url,headline:t?"Founder & Supreme Commander • KYROS Digital Systems":"KYROS AI Gateway Member",bio:t?"Leading autonomous AI agent swarms, high-performance web platforms, and unified multi-model LLM gateway infrastructure.":"Active collaborator and engineer operating on KYROS Manifest Gateway.",location:t?"Dhaka, Bangladesh":"Remote",website:t?"https://writerify.org":"",github:"",twitter:""}}async function f(a,r){const t=b(a,r);if(!a)return t;const o=`${h}${a.toLowerCase()}`;try{const n=localStorage.getItem(o);if(n){const s=JSON.parse(n);return u(a,o,t),{...t,...s}}}catch{}return await u(a,o,t)}async function u(a,r,t){try{const o=`SELECT * FROM public.kyros_user_profiles WHERE LOWER(email) = LOWER('${a.replace(/'/g,"''")}');`,n=await fetch(l,{method:"POST",headers:{"Neon-Connection-String":d,"Content-Type":"application/json"},body:JSON.stringify({query:o})});if(n.ok){const i=(await n.json()).rows||[];if(i.length>0){const e=i[0],c={email:e.email,display_name:e.display_name||t.display_name,avatar_url:e.avatar_url||t.avatar_url,banner_url:e.banner_url||t.banner_url,headline:e.headline||t.headline,bio:e.bio||t.bio,location:e.location||t.location,website:e.website||t.website,github:e.github||"",twitter:e.twitter||"",updated_at:e.updated_at};try{localStorage.setItem(r,JSON.stringify(c))}catch{}return c}}}catch(o){console.warn("Neon profile fetch fallback:",o)}return t}async function w(a){if(!a.email)return!1;const r=`${h}${a.email.toLowerCase()}`;try{localStorage.setItem(r,JSON.stringify(a)),window.dispatchEvent(new CustomEvent("kyros-profile-updated",{detail:a}))}catch(t){console.warn("Local profile save warning:",t)}try{const t=s=>s?`'${s.replace(/'/g,"''")}'`:"NULL",o=`
      INSERT INTO public.kyros_user_profiles (
        email, display_name, avatar_url, banner_url, headline, bio, location, website, github, twitter, updated_at
      ) VALUES (
        ${t(a.email.toLowerCase())},
        ${t(a.display_name)},
        ${t(a.avatar_url)},
        ${t(a.banner_url)},
        ${t(a.headline)},
        ${t(a.bio)},
        ${t(a.location)},
        ${t(a.website)},
        ${t(a.github)},
        ${t(a.twitter)},
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        banner_url = EXCLUDED.banner_url,
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        location = EXCLUDED.location,
        website = EXCLUDED.website,
        github = EXCLUDED.github,
        twitter = EXCLUDED.twitter,
        updated_at = NOW();
    `;return(await fetch(l,{method:"POST",headers:{"Neon-Connection-String":d,"Content-Type":"application/json"},body:JSON.stringify({query:o})})).ok}catch(t){return console.error("Failed to persist profile to Neon DB:",t),!1}}export{p as P,m as a,b,f as g,w as s};
