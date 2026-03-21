"use client";

import { useSession } from "next-auth/react";
import {
  useState,
  useCallback,
  useEffect,
  useSyncExternalStore,
  useRef,
} from "react";

// External store for terms acceptance to avoid setState-in-effect warnings
function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getShowTerms(status: string, hasUser: boolean): boolean {
  if (typeof window === "undefined") return false;
  if (status !== "authenticated" || !hasUser) return false;
  const userRole = localStorage.getItem("userRole");
  const termsAccepted = localStorage.getItem("termsAccepted");
  return userRole !== "instructor" && !termsAccepted;
}

export default function TermsModal() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const getSnapshot = useCallback(
    () => getShowTerms(status, !!session?.user),
    [status, session],
  );
  const getServerSnapshot = useCallback(() => false, []);
  const shouldShow = useSyncExternalStore(
    subscribeToStorage,
    getSnapshot,
    getServerSnapshot,
  );

  const show = shouldShow && !dismissed;

  // Lock body scroll when modal is visible
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true");
    setDismissed(true);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 w-[95vw] max-w-2xl max-h-[90vh] flex flex-col bg-earth-900 border border-earth-700/40 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-earth-800/60">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-700/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-primary-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Terms &amp; Conditions
            </h2>
            <p className="text-sm text-earth-500">
              Please review before continuing
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-sm leading-relaxed text-earth-400 scroll-smooth"
          style={{ maxHeight: "55vh" }}
        >
          <p className="text-earth-300 font-semibold text-base">
            Welcome to Reclaimr! By using our platform, you agree to the
            following terms and conditions. Please read them carefully.
          </p>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              1. Acceptance of Terms
            </h3>
            <p>
              By accessing or using Reclaimr (&quot;the Service&quot;), you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms &amp; Conditions. If you do not agree, please do
              not use the Service.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              2. Description of Service
            </h3>
            <p>
              Reclaimr is a school-based lost-and-found platform that enables
              students and staff to report found items, search for lost
              belongings, and submit claims. The Service is provided to
              facilitate the reunification of lost items with their rightful
              owners.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              3. User Accounts &amp; Authentication
            </h3>
            <p>
              You must sign in using your Google account to access certain
              features of the Service. You are responsible for maintaining the
              security of your account credentials. You agree not to share your
              account access with others or use another person&apos;s account
              without permission.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">4. User Conduct</h3>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside ml-2 mt-1 space-y-1 text-earth-400">
              <li>
                Submit false, misleading, or fraudulent reports or claims.
              </li>
              <li>Claim items that do not belong to you.</li>
              <li>Upload inappropriate, offensive, or copyrighted content.</li>
              <li>
                Attempt to disrupt, hack, or exploit the Service in any way.
              </li>
              <li>
                Harass, impersonate, or violate the rights of other users.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              5. Content &amp; Submissions
            </h3>
            <p>
              By uploading images, descriptions, or other content, you grant
              Reclaimr a non-exclusive, royalty-free right to display and use
              that content within the Service for the purpose of facilitating
              lost-and-found operations. You represent that you have the right
              to submit any content you provide.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              6. Privacy &amp; Data Usage
            </h3>
            <p>
              We collect and store your name, email address, and profile image
              from your Google account for authentication and identification
              purposes. Item reports, claims, and inquiry data are stored to
              operate the Service. We do not sell your personal data to third
              parties. Data may be reviewed by school administrators to resolve
              disputes.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">7. Rewards Program</h3>
            <p>
              Users may earn reward points for reporting found items and
              participating in the community. Points have no monetary value and
              are for recognition purposes within the platform only. Reclaimr
              reserves the right to modify or discontinue the rewards program at
              any time.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              8. Limitation of Liability
            </h3>
            <p>
              Reclaimr acts solely as a platform to connect finders and owners.
              We are not responsible for the condition, authenticity, or value
              of any reported items. We do not guarantee that lost items will be
              recovered. The Service is provided &quot;as is&quot; without
              warranties of any kind.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">
              9. Modifications to Terms
            </h3>
            <p>
              We reserve the right to update or modify these Terms &amp;
              Conditions at any time. Continued use of the Service after changes
              constitutes acceptance of the revised terms. Users will be
              notified of significant changes.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold mb-1.5">10. Termination</h3>
            <p>
              We reserve the right to suspend or terminate your access to the
              Service at any time for violations of these terms or for any
              conduct that we determine to be harmful to the platform or its
              users.
            </p>
          </section>

          <section className="pb-2">
            <h3 className="text-white font-bold mb-1.5">11. Contact</h3>
            <p>
              If you have questions about these Terms &amp; Conditions, please
              reach out to a school administrator or contact the Reclaimr
              support team through the platform.
            </p>
          </section>
        </div>

        {/* Scroll hint */}
        {!scrolledToBottom && (
          <div className="px-6 py-2 text-center border-t border-earth-800/60">
            <p className="text-xs text-earth-600 flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-3.5 h-3.5 animate-bounce"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Scroll down to read all terms
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t border-earth-800/60 bg-earth-900/90">
          <button
            onClick={handleAccept}
            disabled={!scrolledToBottom}
            className={`w-full py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${
              scrolledToBottom
                ? "bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 cursor-pointer"
                : "bg-earth-800 text-earth-500 cursor-not-allowed"
            }`}
          >
            {scrolledToBottom
              ? "I Accept the Terms & Conditions"
              : "Please read the full terms to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
