// User Profile Service with Neon PostgreSQL Persistence, Local Cache & Client-Side Image Compression

export interface UserProfile {
  email: string;
  display_name: string;
  avatar_url: string;
  banner_url: string;
  headline: string;
  bio: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  is_configured?: boolean;
  updated_at?: string;
}

export const PROFILE_BANNER_PRESETS = [
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'neon-mesh',
    name: 'Neon Horizon',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'deep-space',
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'tech-minimal',
    name: 'Executive Dark',
    url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80',
  },
];

export const PROFILE_AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    name: 'Executive 3D',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'avatar-2',
    name: 'Tech Leader',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'avatar-3',
    name: 'Cyber Architect',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'avatar-4',
    name: 'Product Master',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: 'avatar-5',
    name: 'Golden Crown',
    url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=500&q=80',
  },
];

const NEON_SQL_URL = 'https://ep-sparkling-violet-b5wgue4f.c-7.us-east-2.aws.neon.tech/sql';
const NEON_CONN = atob(
  'cG9zdGdyZXNxbDovL25lb25kYl9vd25lcjpucGdfUHlMdHBjbEFFNEk2QGVwLXNwYXJrbGluZy12aW9sZXQtYjV3Z3VlNGYuYy03LnVzLWVhc3QtMi5hd3MubmVvbi50ZWNoL25lb25kYj9zc2xtb2RlPXJlcXVpcmU=',
);

const PROFILE_CACHE_PREFIX = 'kyros_user_profile_';

export function getDefaultProfile(email: string, userName?: string): UserProfile {
  const isBoss = email.toLowerCase() === 'itstasdidnur@gmail.com';
  return {
    email,
    display_name: isBoss ? 'TN TAYYAB' : userName || email.split('@')[0],
    avatar_url: PROFILE_AVATAR_PRESETS[0].url,
    banner_url: PROFILE_BANNER_PRESETS[0].url,
    headline: isBoss
      ? 'Founder & Supreme Commander • KYROS Digital Systems'
      : 'KYROS AI Gateway Member',
    bio: isBoss
      ? 'Leading autonomous AI agent swarms, high-performance web platforms, and unified multi-model LLM gateway infrastructure.'
      : 'Active collaborator and engineer operating on KYROS Manifest Gateway.',
    location: isBoss ? 'Dhaka, Bangladesh' : 'Remote',
    website: isBoss ? 'https://writerify.org' : '',
    github: '',
    twitter: '',
    is_configured: false, // Default is FALSE until configured in Account settings
  };
}

/**
 * Compresses and scales an uploaded image file into an optimized Base64 data URL.
 * Preserves crisp visual fidelity while keeping payload small for Postgres storage.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 600,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const webpUrl = canvas.toDataURL('image/webp', quality);
          if (webpUrl.startsWith('data:image/webp') && webpUrl.length > 50) {
            resolve(webpUrl);
            return;
          }
        } catch {
          // Fallback to jpeg
        }
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export async function getUserProfile(email: string, userName?: string): Promise<UserProfile> {
  const fallback = getDefaultProfile(email, userName);
  if (!email) return fallback;

  // 1. Try local cache for instantaneous first-paint
  const cacheKey = `${PROFILE_CACHE_PREFIX}${email.toLowerCase()}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as UserProfile;
      // Background revalidate from Neon
      void fetchNeonProfile(email, cacheKey, fallback);
      return { ...fallback, ...parsed };
    }
  } catch {
    // Ignore cache error
  }

  // 2. Fetch from Neon DB
  return await fetchNeonProfile(email, cacheKey, fallback);
}

async function fetchNeonProfile(
  email: string,
  cacheKey: string,
  fallback: UserProfile,
): Promise<UserProfile> {
  try {
    const query = `SELECT * FROM public.kyros_user_profiles WHERE LOWER(email) = LOWER('${email.replace(/'/g, "''")}');`;
    const res = await fetch(NEON_SQL_URL, {
      method: 'POST',
      headers: {
        'Neon-Connection-String': NEON_CONN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (res.ok) {
      const data = await res.json();
      const rows = data.rows || [];
      if (rows.length > 0) {
        const row = rows[0];
        const profile: UserProfile = {
          email: row.email,
          display_name: row.display_name || fallback.display_name,
          avatar_url: row.avatar_url || fallback.avatar_url,
          banner_url: row.banner_url || fallback.banner_url,
          headline: row.headline || fallback.headline,
          bio: row.bio || fallback.bio,
          location: row.location || fallback.location,
          website: row.website || fallback.website,
          github: row.github || '',
          twitter: row.twitter || '',
          is_configured: Boolean(row.is_configured),
          updated_at: row.updated_at,
        };
        try {
          localStorage.setItem(cacheKey, JSON.stringify(profile));
        } catch {}
        return profile;
      }
    }
  } catch (err) {
    console.warn('Neon profile fetch fallback:', err);
  }

  return fallback;
}

export async function saveUserProfile(profile: UserProfile): Promise<boolean> {
  if (!profile.email) return false;

  const profileToSave: UserProfile = {
    ...profile,
    is_configured: true, // Marking explicitly as configured upon save
  };

  const cacheKey = `${PROFILE_CACHE_PREFIX}${profile.email.toLowerCase()}`;

  // 1. Cache immediately and notify active views
  try {
    localStorage.setItem(cacheKey, JSON.stringify(profileToSave));
    window.dispatchEvent(new CustomEvent('kyros-profile-updated', { detail: profileToSave }));
  } catch (err) {
    console.warn('Local profile save warning:', err);
  }

  // 2. Persist to Neon DB
  try {
    const esc = (val?: string) => (val ? `'${val.replace(/'/g, "''")}'` : 'NULL');

    const query = `
      INSERT INTO public.kyros_user_profiles (
        email, display_name, avatar_url, banner_url, headline, bio, location, website, github, twitter, is_configured, updated_at
      ) VALUES (
        ${esc(profileToSave.email.toLowerCase())},
        ${esc(profileToSave.display_name)},
        ${esc(profileToSave.avatar_url)},
        ${esc(profileToSave.banner_url)},
        ${esc(profileToSave.headline)},
        ${esc(profileToSave.bio)},
        ${esc(profileToSave.location)},
        ${esc(profileToSave.website)},
        ${esc(profileToSave.github)},
        ${esc(profileToSave.twitter)},
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
    `;

    const res = await fetch(NEON_SQL_URL, {
      method: 'POST',
      headers: {
        'Neon-Connection-String': NEON_CONN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to persist profile to Neon DB:', err);
    return false;
  }
}
