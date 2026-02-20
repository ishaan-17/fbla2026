"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function UserAvatar() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />;
  }

  if (!session?.user?.image) return null;

  return (
    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden shadow-lg">
      <Image
        src={session.user.image}
        alt={session.user.name || "User Avatar"}
        width={40}
        height={40}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
