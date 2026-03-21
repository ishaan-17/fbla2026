"use client";

import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://i.imgur.com/J5YVgYs.jpeg",
    avatarPosition: "center 25%",
    name: "Manan Dua",
    handle: "@mandzzz",
    text: "Reclaimr made it so easy to reunite with my lost items. The platform is intuitive and fast!",
  },
  {
    avatarSrc: "https://i.imgur.com/1xoQLfQ.jpeg",
    name: "Elaina Pan",
    handle: "@elaina.pan231",
    text: "Found my lost wallet within hours of posting. This service is a game-changer for our community.",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Redirect to home page after successful login
    if (data.email) {
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    localStorage.setItem("userRole", "student");
    await signIn("google", { redirectTo: "/items" });
  };

  const handleInstructorSignIn = async (password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        return false;
      }

      // Successfully authenticated as admin/instructor
      localStorage.setItem("userRole", "instructor");
      router.push("/admin");
      return true;
    } catch {
      return false;
    }
  };

  const handleResetPassword = () => {
    // Password reset is not applicable — students use Google OAuth
  };

  const handleCreateAccount = () => {
    // Account creation is handled via Google OAuth
    router.push("/login");
  };

  return (
    <SignInPage
      title={
        <>
          Welcome to <span className="text-primary-400">Reclaimr</span>
        </>
      }
      description="Sign in to report lost items, browse found items, and help reunite people with their belongings"
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={sampleTestimonials}
      onGoogleSignIn={handleGoogleSignIn}
      onInstructorSignIn={handleInstructorSignIn}
      googleOnly={true}
      showRoleSelector={true}
    />
  );
}
