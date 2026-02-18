import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await isAdmin();
    return NextResponse.json({ isAdmin: admin });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
