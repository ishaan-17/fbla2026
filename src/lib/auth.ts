import { cookies } from "next/headers";

const ADMIN_TOKEN_VALUE = "lost-found-admin-authenticated";

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token");
  return token?.value === ADMIN_TOKEN_VALUE;
}

export function getAdminTokenValue(): string {
  return ADMIN_TOKEN_VALUE;
}
