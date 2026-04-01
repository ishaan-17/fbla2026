import { redirect } from "next/navigation";

export default function LostPage() {
  redirect("/report?tab=lost");
}
