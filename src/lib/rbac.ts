/**
 * RBAC Configuration for Student Frontend
 * 
 * SECURITY: This frontend is for STUDENT role only.
 */

export const STUDENT_ROLES = ['STUDENT'] as const;

export type StudentRole = typeof STUDENT_ROLES[number];

/**
 * Check if a role is authorized for student frontend access
 */
export function isStudentRole(role: string | undefined | null): boolean {
  if (!role) return false;
  return STUDENT_ROLES.includes(role as StudentRole);
}
