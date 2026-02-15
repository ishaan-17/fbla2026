import Link from "next/link";
import { Camera, Users, Trophy, Heart, MapPin, Mail, Phone, Search, AlertCircle, Gift, Clock } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-20">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          About Reclaimr
        </h1>
        <p className="text-earth-400 mt-4 max-w-2xl mx-auto text-lg">
          Everything you need to know about how our school&apos;s lost and found system works.
        </p>
      </div>

      <div className="space-y-24">
        {/* Mission - Split Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Our Mission</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
              Reuniting Communities,<br />One Item at a Time
            </h2>
            <p className="text-earth-300 leading-relaxed mb-4">
              Our Lost & Found platform is built to help our school community reunite with their belongings quickly and efficiently. Powered by <strong className="text-white">AI image recognition</strong>, the system automatically categorizes found items to make searching easier.
            </p>
            <p className="text-earth-300 leading-relaxed">
              We reward students who take the time to report items they find, building a culture of <strong className="text-white">kindness and responsibility</strong>.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Camera, label: "AI Recognition" },
                { icon: Users, label: "Community Driven" },
                { icon: Trophy, label: "Rewards System" },
                { icon: Heart, label: "Give Back" },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center text-center border border-white/20">
                  <item.icon className="w-8 h-8 text-white/80 mb-3" strokeWidth={1.5} />
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 30-Day Donation Policy - Bento Cards */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Gift className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Donation Policy</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              30-Day Donation Policy
            </h2>
            <p className="text-earth-400 max-w-2xl mx-auto">
              To keep our lost and found system manageable and give items the best chance of being useful, we have a 30-day policy on all unclaimed items.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                color: "bg-cyan-500",
                iconBg: "bg-cyan-500",
                icon: Search,
                badge: "Days 1-14",
                title: "Active Listing",
                desc: "Items are actively listed and available for claiming. Full search and claim functionality.",
              },
              {
                color: "bg-sky-600",
                iconBg: "bg-sky-600",
                icon: AlertCircle,
                badge: "Days 15-30",
                title: "Expiring Soon",
                desc: "Items are marked as \"expiring soon\" with a visible countdown. Last chance to claim!",
              },
              {
                color: "bg-primary-500",
                iconBg: "bg-primary-500",
                icon: Gift,
                badge: "After 30 Days",
                title: "Donated to Charity",
                desc: "Unclaimed items are donated to local charities to benefit those in need. Nothing goes to waste!",
              },
            ].map((item, i) => (
              <div key={i} className="bg-earth-800 rounded-xl overflow-hidden border border-earth-700">
                <div className={`h-1.5 ${item.color}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-5`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-earth-700 rounded-full mb-4">
                    <Clock className="w-3 h-3 text-earth-400" />
                    <span className="text-xs font-semibold text-earth-300">{item.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-earth-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-earth-500 mt-8 max-w-2xl mx-auto">
            This policy helps ensure that items are either returned to their owners or go to someone who can use them. If you know you&apos;ve lost something, please check the listings regularly!
          </p>
        </section>

        {/* Rewards - Bento Grid */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Rewards</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">
              Earn Points for Helping
            </h2>
            <p className="text-earth-400 max-w-2xl mx-auto">
              We believe in recognizing people who help our community. Our points system rewards you for being a good citizen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-earth-800 to-earth-900 rounded-xl p-8 border border-earth-700">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center">
                  <Camera className="w-7 h-7 text-primary-400" />
                </div>
                <span className="text-4xl font-extrabold text-primary-500">+10</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Report a Found Item</h3>
              <p className="text-earth-400">Earned when you submit a report with your information. Help someone find their belongings!</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/50 to-earth-900 rounded-xl p-8 border border-cyan-800/50">
              <div className="flex items-start justify-between mb-6">
                <div className="w-14 h-14 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-cyan-400" />
                </div>
                <span className="text-4xl font-extrabold text-cyan-500">+25</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Item Successfully Returned</h3>
              <p className="text-earth-400">Bonus points when the item you found is claimed and verified by the owner.</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors"
            >
              View the leaderboard
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* How It Works - Steps */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Search className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Process</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                step: "01",
                title: "Report a Found Item",
                desc: "Found something on campus? Take a photo and submit a report. Our AI will automatically categorize the item.",
                color: "from-primary-500/20 to-transparent",
              },
              {
                step: "02",
                title: "Admin Review",
                desc: "An administrator reviews submitted reports to ensure they are genuine and appropriately categorized.",
                color: "from-cyan-500/20 to-transparent",
              },
              {
                step: "03",
                title: "Search & Claim",
                desc: "Lost something? Browse the listings or search by keyword. When you find your item, submit a claim.",
                color: "from-sky-500/20 to-transparent",
              },
              {
                step: "04",
                title: "Verification & Collection",
                desc: "An admin verifies your claim. Once verified, collect your item and the finder earns bonus points!",
                color: "from-indigo-500/20 to-transparent",
              },
            ].map((item) => (
              <div key={item.step} className={`bg-gradient-to-br ${item.color} bg-earth-800/50 rounded-xl p-6 border border-earth-700`}>
                <span className="text-5xl font-extrabold text-earth-700">{item.step}</span>
                <h3 className="text-lg font-bold text-white mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-earth-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact - 3 Cards */}
        <section>
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-bold text-primary-500 uppercase tracking-wider">Get in Touch</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Contact & Location
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: MapPin,
                title: "Visit Us",
                lines: ["Lost & Found Office", "Building A, Room 102", "Open Mon-Fri, 8am-4pm"],
              },
              {
                icon: Mail,
                title: "Email Us",
                lines: ["General Inquiries:", "lostandfound@school.edu", "We reply within 24 hours"],
              },
              {
                icon: Phone,
                title: "Call Us",
                lines: ["Office Phone:", "(555) 123-4567", "During office hours"],
              },
            ].map((item, i) => (
              <div key={i} className="bg-earth-800 rounded-xl p-8 border border-earth-700 text-center">
                <div className="w-14 h-14 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary-500/20">
                  <item.icon className="w-6 h-6 text-primary-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-4">{item.title}</h3>
                {item.lines.map((line, j) => (
                  <p key={j} className={`text-sm ${j === 0 ? "text-earth-500" : "text-earth-300"}`}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
