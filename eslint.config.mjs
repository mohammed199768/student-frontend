import { defineConfig } from "eslint/config";
import nextConfig from "eslint-config-next";

// 1. تعريف المصفوفة في متغير (Variable)
const eslintConfig = [
  ...nextConfig,
  {
    rules: {
      "@next/next/no-html-link-for-pages": ["error", "student-frontend/pages/"] 
    }
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"]
  }
];

// 2. تصدير المتغير كـ default
export default eslintConfig;