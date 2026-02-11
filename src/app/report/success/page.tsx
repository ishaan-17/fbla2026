import Link from "next/link";

export default function ReportSuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-earth-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-earth-900 tracking-tight mb-3">
          Report Submitted!
        </h1>
        <p className="text-earth-500 mb-4">
          Thank you for helping someone find their lost item. Your report is now under review by an admin.
        </p>
        <p className="inline-block text-sm font-bold text-primary-500 bg-primary-50 px-4 py-2 mb-8">
          +10 reward points earned!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/report"
          className="flex-1 py-3.5 px-6 border-2 border-earth-900 text-earth-900 text-sm font-bold tracking-wide hover:bg-earth-900 hover:text-white transition-all text-center"
        >
          Report Another
        </Link>
        <Link
          href="/items"
          className="flex-1 py-3.5 px-6 bg-earth-900 text-white text-sm font-bold tracking-wide hover:bg-earth-800 transition-colors text-center"
        >
          Browse Items
        </Link>
      </div>
    </div>
  );
}
