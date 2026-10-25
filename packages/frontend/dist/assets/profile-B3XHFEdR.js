const b=[{id:"cyber-grid",name:"Cyber Grid",url:"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"},{id:"neon-mesh",name:"Neon Horizon",url:"https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80"},{id:"aurora",name:"Aurora Borealis",url:"https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"},{id:"deep-space",name:"Cosmic Nebula",url:"https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80"},{id:"tech-minimal",name:"Executive Dark",url:"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"}],E=[{id:"avatar-1",name:"Executive 3D",url:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80"},{id:"avatar-2",name:"Tech Leader",url:"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80"},{id:"avatar-3",name:"Cyber Architect",url:"https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=500&q=80"},{id:"avatar-4",name:"Product Master",url:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"},{id:"avatar-5",name:"Golden Crown",url:"https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80"}],f="https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql",g=atob("cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU="),w="kyros_user_profile_";function _(o,a){const e=o.toLowerCase()==="itstasdidnur@gmail.com";return{email:o,display_name:e?"TN TAYYAB":a||o.split("@")[0],avatar_url:E[0].url,banner_url:b[0].url,headline:e?"Founder & Supreme Commander • KYROS Digital Systems":"KYROS AI Gateway Member",bio:e?"Leading autonomous AI agent swarms, high-performance web platforms, and unified multi-model LLM gateway infrastructure.":"Active collaborator and engineer operating on KYROS Manifest Gateway.",location:e?"Dhaka, Bangladesh":"Remote",website:e?"https://writerify.org":"",github:"",twitter:"",is_configured:!1}}function y(o,a=1400,e=600,t=.85){return new Promise((i,c)=>{if(!o.type.startsWith("image/")){c(new Error("Selected file is not an image"));return}const n=new FileReader;n.onload=r=>{const s=new Image;s.onload=()=>{let l=s.width,u=s.height;l>a&&(u=Math.round(u*a/l),l=a),u>e&&(l=Math.round(l*e/u),u=e);const d=document.createElement("canvas");d.width=l,d.height=u;const p=d.getContext("2d");if(!p){i(r.target?.result);return}p.imageSmoothingEnabled=!0,p.imageSmoothingQuality="high",p.drawImage(s,0,0,l,u);try{const m=d.toDataURL("image/webp",t);if(m.startsWith("data:image/webp")&&m.length>50){i(m);return}}catch{}i(d.toDataURL("image/jpeg",t))},s.onerror=()=>c(new Error("Failed to load image for compression")),s.src=r.target?.result},n.onerror=()=>c(new Error("Failed to read image file")),n.readAsDataURL(o)})}async function L(o,a){const e=_(o,a);if(!o)return e;const t=`${w}${o.toLowerCase()}`;try{const i=localStorage.getItem(t);if(i){const c=JSON.parse(i);return h(o,t,e),{...e,...c}}}catch{}return await h(o,t,e)}async function h(o,a,e){try{const t=`SELECT * FROM public.kyros_user_profiles WHERE LOWER(email) = LOWER('${o.replace(/'/g,"''")}');`,i=await fetch(f,{method:"POST",headers:{"Neon-Connection-String":g,"Content-Type":"application/json"},body:JSON.stringify({query:t})});if(i.ok){const n=(await i.json()).rows||[];if(n.length>0){const r=n[0],s={email:r.email,display_name:r.display_name||e.display_name,avatar_url:r.avatar_url||e.avatar_url,banner_url:r.banner_url||e.banner_url,headline:r.headline||e.headline,bio:r.bio||e.bio,location:r.location||e.location,website:r.website||e.website,github:r.github||"",twitter:r.twitter||"",is_configured:!!r.is_configured,updated_at:r.updated_at};try{localStorage.setItem(a,JSON.stringify(s))}catch{}return s}}}catch(t){console.warn("Neon profile fetch fallback:",t)}return e}async function N(o){if(!o.email)return!1;const a={...o,is_configured:!0},e=`${w}${o.email.toLowerCase()}`;try{localStorage.setItem(e,JSON.stringify(a)),window.dispatchEvent(new CustomEvent("kyros-profile-updated",{detail:a}))}catch(t){console.warn("Local profile save warning:",t)}try{const t=n=>n?`'${n.replace(/'/g,"''")}'`:"NULL",i=`
      INSERT INTO public.kyros_user_profiles (
        email, display_name, avatar_url, banner_url, headline, bio, location, website, github, twitter, is_configured, updated_at
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
        TRUE,
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
        is_configured = TRUE,
        updated_at = NOW();
    `;return(await fetch(f,{method:"POST",headers:{"Neon-Connection-String":g,"Content-Type":"application/json"},body:JSON.stringify({query:i})})).ok}catch(t){return console.error("Failed to persist profile to Neon DB:",t),!1}}export{E as P,b as a,y as c,L as g,N as s};
