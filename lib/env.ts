export type AppEnvironment = "local" | "staging" | "production";

type EnvCategory = "environment" | "supabase" | "maps";

const RAW_ENV = process.env.NEXT_PUBLIC_APP_ENV;

export function resolveEnvironment(): AppEnvironment {
  if (RAW_ENV === "production") return "production";
  if (RAW_ENV === "staging") return "staging";
  return "local";
}

export const environment = resolveEnvironment();
export const isProduction = environment === "production";
export const isStaging = environment === "staging";
export const isLocal = environment === "local";

interface PublicVarDef {
  key: string;
  category: EnvCategory;
  requiredIn: AppEnvironment[];
}

const PUBLIC_VARS: PublicVarDef[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", category: "supabase", requiredIn: ["local", "staging", "production"] },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", category: "supabase", requiredIn: ["local", "staging", "production"] },
  { key: "NEXT_PUBLIC_SITE_URL", category: "environment", requiredIn: ["staging", "production"] },
  { key: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", category: "maps", requiredIn: [] },
];

export interface EnvIssue {
  key: string;
  category: EnvCategory;
  severity: "error" | "warning";
  message: string;
}

function isPresent(key: string): boolean {
  const value = process.env[key];
  return typeof value === "string" && value.length > 0;
}

export function validatePublicEnv(): EnvIssue[] {
  const issues: EnvIssue[] = [];

  if (!["local", "staging", "production"].includes(RAW_ENV || "")) {
    issues.push({
      key: "NEXT_PUBLIC_APP_ENV",
      category: "environment",
      severity: "warning",
      message: "NEXT_PUBLIC_APP_ENV is not set to local, staging or production",
    });
  }

  for (const def of PUBLIC_VARS) {
    if (def.requiredIn.includes(environment) && !isPresent(def.key)) {
      issues.push({
        key: def.key,
        category: def.category,
        severity: "error",
        message: `${def.key} is required in ${environment}`,
      });
    }
  }

  if (isProduction && (process.env.NEXT_PUBLIC_SITE_URL || "").includes("localhost")) {
    issues.push({
      key: "NEXT_PUBLIC_SITE_URL",
      category: "environment",
      severity: "error",
      message: "NEXT_PUBLIC_SITE_URL must not be a localhost URL in production",
    });
  }

  return issues;
}

export interface PublicEnvHealth {
  environment: AppEnvironment;
  isProduction: boolean;
  validatedAt: string;
  issues: EnvIssue[];
  publicVars: { key: string; category: EnvCategory; present: boolean }[];
}

export function getPublicEnvHealth(): PublicEnvHealth {
  return {
    environment,
    isProduction,
    validatedAt: new Date().toISOString(),
    issues: validatePublicEnv(),
    publicVars: PUBLIC_VARS.map((def) => ({
      key: def.key,
      category: def.category,
      present: isPresent(def.key),
    })),
  };
}