import Link from "next/link";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

export default function ReportSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-24 pb-12 text-center">
      <div className="mb-8">
        {/* Checkmark */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#3a3a3a] flex items-center justify-center">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-3">
          Report Submitted!
        </h1>
        <p className="text-earth-400 mb-4">
          Thank you for helping someone find their lost item. Your report is now under review by an admin.
        </p>
        <p className="inline-block text-sm font-bold text-primary-500 bg-primary-50/10 px-4 py-2 mb-8">
          +10 reward points earned!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <LiquidButton asChild variant="dark" size="lg">
          <Link href="/report" className="text-white font-bold tracking-wide">
            Report Another
          </Link>
        </LiquidButton>
        <LiquidButton asChild variant="dark" size="lg">
          <Link href="/items" className="text-white font-bold tracking-wide">
            Browse Items
          </Link>
        </LiquidButton>
      </div>
    </div>
  );
}
