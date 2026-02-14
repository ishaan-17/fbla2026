"use client";

import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Reclaimr made it so easy to reunite with my lost items. The platform is intuitive and fast!",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "Found my lost wallet within hours of posting. This service is a game-changer for our community.",
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "Clean interface and excellent support. Highly recommend for anyone who's lost something valuable.",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);

    // TODO: Implement actual authentication logic here
    alert(`Sign In Submitted! Email: ${data.email}`);

    // Redirect to home page after successful login
    // router.push('/');
  };

  const handleGoogleSignIn = async () => {
    console.log("Continue with Google clicked");
    // TODO: Implement Google OAuth here
    //alert("Continue with Google clicked");
    await signIn("google", { redirectTo: "/items" });
  };

  const handleResetPassword = () => {
    // TODO: Navigate to password reset page
    alert("Reset Password clicked");
  };

  const handleCreateAccount = () => {
    // TODO: Navigate to signup page
    router.push("/signup");
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
      googleOnly={true}
    />
  );
}
