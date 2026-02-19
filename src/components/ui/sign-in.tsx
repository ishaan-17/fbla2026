import React, { useState } from "react";
import { Eye, EyeOff, GraduationCap, BookOpen } from "lucide-react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

// --- HELPER COMPONENTS (ICONS) ---
const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 48 48"
    aria-hidden="true"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"
    />
    <path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"
    />
  </svg>
);

// --- TYPE DEFINITIONS ---
export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

export type UserRole = "student" | "instructor";

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onInstructorSignIn?: (password: string) => Promise<boolean>;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  googleOnly?: boolean;
  showRoleSelector?: boolean;
  instructorError?: string;
}

// --- SUB-COMPONENTS ---
const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-earth-700 bg-earth-800/30 backdrop-blur-sm transition-colors focus-within:border-primary-400/70 focus-within:bg-primary-500/10">
    {children}
  </div>
);

const TestimonialCard = ({
  testimonial,
  delay,
}: {
  testimonial: Testimonial;
  delay: string;
}) => (
  <div
    className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-earth-800/60 backdrop-blur-xl border border-earth-700/50 p-5 w-64`}
  >
    <img
      src={testimonial.avatarSrc}
      className="h-10 w-10 object-cover rounded-2xl"
      alt={`${testimonial.name}'s avatar`}
    />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">
        {testimonial.name}
      </p>
      <p className="text-earth-400">{testimonial.handle}</p>
      <p className="mt-1 text-earth-200">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
export const SignInPage: React.FC<SignInPageProps> = ({
  title = (
    <span className="font-light text-foreground tracking-tighter">Welcome</span>
  ),
  description = "Access your account and continue your journey with us",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onInstructorSignIn,
  onResetPassword,
  onCreateAccount,
  googleOnly = false,
  showRoleSelector = false,
  instructorError = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [adminPassword, setAdminPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleInstructorSubmit = async () => {
    if (!adminPassword.trim()) {
      setLocalError("Please enter the admin password");
      return;
    }
    setIsSubmitting(true);
    setLocalError("");
    try {
      const success = await onInstructorSignIn?.(adminPassword);
      if (!success) {
        setLocalError("Invalid password");
      }
    } catch {
      setLocalError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-[#121212] relative overflow-hidden">
      {/* Background gradient effects - matching HowItWorks section */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Left column: sign-in form */}
      <section className="relative flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight text-white">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-white">
              {description}
            </p>

            {!googleOnly ? (
              <>
                <form className="space-y-5" onSubmit={onSignIn}>
                  <div className="animate-element animate-delay-300">
                    <label
                      htmlFor="signin-email"
                      className="text-sm font-medium text-earth-400"
                    >
                      Email Address
                    </label>
                    <GlassInputWrapper>
                      <input
                        id="signin-email"
                        name="email"
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder:text-earth-500"
                      />
                    </GlassInputWrapper>
                  </div>

                  <div className="animate-element animate-delay-400">
                    <label
                      htmlFor="signin-password"
                      className="text-sm font-medium text-earth-400"
                    >
                      Password
                    </label>
                    <GlassInputWrapper>
                      <div className="relative">
                        <input
                          id="signin-password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder:text-earth-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute inset-y-0 right-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-earth-400 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="w-5 h-5 text-earth-400 hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                    </GlassInputWrapper>
                  </div>

                  <div className="animate-element animate-delay-500 flex items-center justify-between text-sm">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="custom-checkbox"
                      />
                      <span className="text-earth-200">Keep me signed in</span>
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onResetPassword?.();
                      }}
                      className="hover:underline text-primary-400 transition-colors"
                    >
                      Reset password
                    </a>
                  </div>

                  <div className="animate-element animate-delay-600">
                    <LiquidButton type="submit" variant="light" size="full">
                      Sign In
                    </LiquidButton>
                  </div>
                </form>

                <div className="animate-element animate-delay-700 relative flex items-center justify-center">
                  <span className="w-full border-t border-earth-700"></span>
                  <span className="px-4 text-sm text-earth-400 bg-[#121212] absolute">
                    Or continue with
                  </span>
                </div>

                <div className="animate-element animate-delay-800">
                  <LiquidButton
                    onClick={() => onGoogleSignIn?.()}
                    variant="dark"
                    size="full"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </LiquidButton>
                </div>

                <p className="animate-element animate-delay-900 text-center text-sm text-earth-400">
                  New to our platform?{" "}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onCreateAccount?.();
                    }}
                    className="text-primary-400 hover:underline transition-colors"
                  >
                    Create Account
                  </a>
                </p>
              </>
            ) : (
              <>
                {showRoleSelector && (
                  <div className="animate-element animate-delay-300 space-y-3">
                    <span
                      className="text-sm font-medium text-white relative -top-[4.5px]"
                      id="role-selector-label"
                    >
                      I am a
                    </span>
                    <div
                      className="grid grid-cols-2 gap-3"
                      role="radiogroup"
                      aria-labelledby="role-selector-label"
                    >
                      <div
                        className={`rounded-2xl transition-all duration-200 ${selectedRole === "student" ? "ring-1 ring-primary-400" : ""}`}
                      >
                        <LiquidButton
                          type="button"
                          onClick={() => {
                            setSelectedRole("student");
                            setLocalError("");
                          }}
                          variant={
                            selectedRole === "student" ? "light" : "dark"
                          }
                          size="full"
                        >
                          <GraduationCap className="w-5 h-5" />
                          Student
                        </LiquidButton>
                      </div>
                      <div
                        className={`rounded-2xl transition-all duration-200 ${selectedRole === "instructor" ? "ring-1 ring-primary-400" : ""}`}
                      >
                        <LiquidButton
                          type="button"
                          onClick={() => {
                            setSelectedRole("instructor");
                            setLocalError("");
                          }}
                          variant={
                            selectedRole === "instructor" ? "light" : "dark"
                          }
                          size="full"
                        >
                          <BookOpen className="w-5 h-5" />
                          Instructor
                        </LiquidButton>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRole === "student" ? (
                  <>
                    <div
                      className={`animate-element ${showRoleSelector ? "animate-delay-400" : "animate-delay-300"}`}
                    >
                      <LiquidButton
                        onClick={() => onGoogleSignIn?.()}
                        variant="dark"
                        size="full"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </LiquidButton>
                    </div>

                    <p
                      className={`animate-element ${showRoleSelector ? "animate-delay-500" : "animate-delay-400"} text-center text-sm text-white`}
                    >
                      Sign in with your Google account to get started
                    </p>
                  </>
                ) : (
                  <>
                    <div
                      className={`animate-element ${showRoleSelector ? "animate-delay-400" : "animate-delay-300"} space-y-3`}
                    >
                      <label
                        htmlFor="admin-password"
                        className="text-sm font-medium text-white relative -top-1"
                      >
                        Admin Password
                      </label>
                      <div className="relative">
                        <input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleInstructorSubmit()
                          }
                          placeholder="Enter admin password"
                          className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-white placeholder:text-white/40 transition-all duration-200 bg-white/10 backdrop-blur-sm border border-white/20 shadow-[0_2px_12px_rgba(0,0,0,0.2),inset_1px_1px_2px_rgba(255,255,255,0.1),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] focus:shadow-[0_2px_16px_rgba(0,0,0,0.3),inset_1px_1px_3px_rgba(255,255,255,0.15),inset_-1px_-1px_3px_rgba(255,255,255,0.08)] focus:outline-none focus:border-white/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          className="absolute inset-y-0 right-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
                          ) : (
                            <Eye className="w-5 h-5 text-white/40 hover:text-white transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>

                    {(localError || instructorError) && (
                      <div className="animate-element text-sm text-red-400 text-center">
                        {localError || instructorError}
                      </div>
                    )}

                    <div
                      className={`animate-element ${showRoleSelector ? "animate-delay-500" : "animate-delay-400"}`}
                    >
                      <LiquidButton
                        onClick={handleInstructorSubmit}
                        disabled={isSubmitting}
                        variant="light"
                        size="full"
                      >
                        {isSubmitting
                          ? "Signing in..."
                          : "Sign In as Instructor"}
                      </LiquidButton>
                    </div>

                    <p
                      className={`animate-element ${showRoleSelector ? "animate-delay-600" : "animate-delay-500"} text-center text-sm text-white`}
                    >
                      Enter your instructor credentials to access admin features
                    </p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          ></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard
                testimonial={testimonials[0]}
                delay="animate-delay-1000"
              />
              {testimonials[1] && (
                <div className="hidden xl:flex">
                  <TestimonialCard
                    testimonial={testimonials[1]}
                    delay="animate-delay-1200"
                  />
                </div>
              )}
              {testimonials[2] && (
                <div className="hidden 2xl:flex">
                  <TestimonialCard
                    testimonial={testimonials[2]}
                    delay="animate-delay-1400"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
