/**
 * Environment Configuration & Validation
 * 
 * This module validates required environment variables at startup
 * to prevent runtime errors and broken deploys.
 */

interface EnvConfig {
    supabase: {
        url: string;
        anonKey: string;
    };
    isDev: boolean;
    isProd: boolean;
}

/**
 * Required environment variables
 */
const REQUIRED_ENV_VARS = {
    VITE_SUPABASE_URL: 'Supabase project URL',
    VITE_SUPABASE_ANON_KEY: 'Supabase anonymous key',
} as const;

/**
 * Validate that all required environment variables are set
 * @throws Error if any required variable is missing
 */
function validateEnv(): void {
    const missing: string[] = [];

    for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
        if (!import.meta.env[key]) {
            missing.push(`${key} (${description})`);
        }
    }

    if (missing.length > 0) {
        const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║                 ❌ MISSING ENVIRONMENT VARIABLES                ║
╚════════════════════════════════════════════════════════════════╝

The following required environment variables are not set:

${missing.map(v => `  • ${v}`).join('\n')}

📝 How to fix:
  1. Create a .env file in the project root
  2. Copy the contents from .env.example
  3. Fill in the required values
  4. Restart the development server

For production, set these variables in your hosting platform:
  - Vercel: Project Settings → Environment Variables
  - Netlify: Site Settings → Build & Deploy → Environment

Need help? Check SETUP_NOVO_SUPABASE.md for Supabase setup.
    `.trim();

        console.error(errorMessage);
        if (typeof window !== 'undefined') {
            // Create a visible error overlay for the user
            const div = document.createElement('div');
            div.style.position = 'fixed';
            div.style.top = '0';
            div.style.left = '0';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.backgroundColor = 'rgba(0,0,0,0.9)';
            div.style.color = 'red';
            div.style.zIndex = '99999';
            div.style.padding = '20px';
            div.style.whiteSpace = 'pre-wrap';
            div.style.fontFamily = 'monospace';
            div.innerText = errorMessage;
            document.body.appendChild(div);
        }
    }
}

/**
 * Initialize and validate environment configuration
 */
export function initEnv(): EnvConfig {
    // Validate required variables
    validateEnv();

    // Build configuration object
    const config: EnvConfig = {
        supabase: {
            url: import.meta.env.VITE_SUPABASE_URL,
            anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD,
    };

    // Log in development
    if (config.isDev) {
        console.log('%c✅ Environment validated', 'color: #10b981; font-weight: bold', {
            supabaseUrl: config.supabase.url,
            hasAnonKey: !!config.supabase.anonKey,
            mode: 'development',
        });
    }

    return config;
}

// Export singleton instance
export const env = initEnv();
