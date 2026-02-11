import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-earth-900 tracking-tight">
          About Reclaimr
        </h1>
        <p className="text-earth-500 mt-3 max-w-xl mx-auto">
          Everything you need to know about how our school&apos;s lost and found system works.
        </p>
      </div>

      <div className="space-y-16">
        {/* Mission */}
        <section>
          <h2 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-4">Our Mission</h2>
          <p className="text-earth-600 leading-relaxed">
            Our Lost & Found platform is built to help our school community reunite with their belongings quickly and efficiently.
            Powered by AI image recognition, the system automatically categorizes found items to make searching easier.
            We reward students who take the time to report items they find, building a culture of kindness and responsibility.
          </p>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-8">How It Works</h2>
          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Report a Found Item",
                desc: "Found something on campus? Take a photo and submit a report. Our AI will automatically categorize the item, making it easier to find. You earn 10 reward points for every item you report.",
              },
              {
                step: "02",
                title: "Admin Review",
                desc: "An administrator reviews submitted reports to ensure they are genuine and appropriately categorized. Once approved, the item becomes visible in the public listing.",
              },
              {
                step: "03",
                title: "Search & Claim",
                desc: "Lost something? Browse the listings or search by keyword and category. When you find your item, submit a claim describing why it belongs to you.",
              },
              {
                step: "04",
                title: "Verification & Collection",
                desc: "An admin verifies your claim by checking your description against the item details. Once verified, you can collect your item from the lost and found office. The finder earns an additional 25 bonus points!",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-6">
                <span className="text-4xl font-extrabold text-earth-200 flex-shrink-0 w-12">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-bold text-earth-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-earth-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 30-Day Donation Policy */}
        <section className="bg-primary-50 border border-primary-200 p-8">
          <h2 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-4">30-Day Donation Policy</h2>
          <p className="text-earth-700 leading-relaxed mb-6">
            To keep our lost and found system manageable and give items the best chance of being useful, we have a <strong>30-day policy</strong> on all unclaimed items.
          </p>
          <div className="space-y-4">
            {[
              { label: "Days 1-14", desc: "Items are actively listed and available for claiming. Full search and claim functionality." },
              { label: "Days 15-30", desc: "Items are marked as \"expiring soon\" with a visible countdown. Last chance to claim!" },
              { label: "After 30 days", desc: "Unclaimed items are donated to local charities to benefit those in need. Nothing goes to waste!" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-earth-700">
                  <strong>{item.label}:</strong> {item.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="text-sm text-earth-500 mt-6">
            This policy helps ensure that items are either returned to their owners or go to someone who can use them.
            If you know you&apos;ve lost something, please check the listings regularly!
          </p>
        </section>

        {/* Rewards */}
        <section>
          <h2 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-4">Reward Points System</h2>
          <p className="text-earth-600 mb-6 leading-relaxed">
            We believe in recognizing people who help our community. Our points system rewards you for being a good citizen:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-earth-200">
            <div className="bg-earth-50 p-6">
              <p className="text-3xl font-extrabold text-earth-900">+10</p>
              <p className="text-sm font-bold text-earth-700 mt-1">Report a Found Item</p>
              <p className="text-xs text-earth-500 mt-1">Earned when you submit a report with your info</p>
            </div>
            <div className="bg-earth-50 p-6">
              <p className="text-3xl font-extrabold text-primary-500">+25</p>
              <p className="text-sm font-bold text-earth-700 mt-1">Item Successfully Returned</p>
              <p className="text-xs text-earth-500 mt-1">Bonus when the item you found is claimed and verified</p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/leaderboard"
              className="text-sm font-bold text-earth-900 underline underline-offset-4 decoration-primary-500 decoration-2 hover:decoration-primary-400 transition-colors"
            >
              View the leaderboard
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-6">Contact & Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-earth-200">
            <div className="bg-earth-50 p-6">
              <p className="text-sm font-bold text-earth-900">Lost & Found Office</p>
              <p className="text-sm text-earth-500 mt-2">Main Office, Room 101</p>
              <p className="text-sm text-earth-500">Monday - Friday: 8:00 AM - 4:00 PM</p>
            </div>
            <div className="bg-earth-50 p-6">
              <p className="text-sm font-bold text-earth-900">Questions?</p>
              <p className="text-sm text-earth-500 mt-2">Email: lostandfound@school.edu</p>
              <p className="text-sm text-earth-500">Or visit the main office in person</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
