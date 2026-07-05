import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Clock3,
  Flame,
  Footprints,
  Map,
  MapPin,
  Mountain,
  Trophy,
} from "lucide-react";

import trailHeroImage from "@/assets/trail-hero.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Feature {
  title: string;
  description: string;
  icon: typeof Map;
}

interface Trail {
  name: string;
  location: string;
  difficulty: "Easy" | "Intermediate" | "Advanced";
  distance: string;
  elevation: string;
  duration: string;
  imageClassName: string;
}

const features: Feature[] = [
  {
    title: "Discover Trails",
    description:
      "Search curated Christchurch and Canterbury hikes by terrain, distance, and difficulty.",
    icon: Map,
  },
  {
    title: "Check In",
    description:
      "Record completed hikes with notes and progress that stays attached to your profile.",
    icon: CalendarCheck,
  },
  {
    title: "Earn Rewards",
    description:
      "Gain XP, unlock badges, maintain streaks, and climb the leaderboard.",
    icon: Trophy,
  },
];

const featuredTrails: Trail[] = [
  {
    name: "Rapaki Track",
    location: "Port Hills",
    difficulty: "Intermediate",
    distance: "7.2 km",
    elevation: "545 m",
    duration: "2.5 hr",
    imageClassName: "from-lime-900 via-amber-700 to-sky-700",
  },
  {
    name: "Godley Head Track",
    location: "Banks Peninsula",
    difficulty: "Advanced",
    distance: "8.0 km",
    elevation: "320 m",
    duration: "3.0 hr",
    imageClassName: "from-stone-800 via-cyan-700 to-sky-400",
  },
  {
    name: "Bottle Lake Forest",
    location: "Christchurch",
    difficulty: "Easy",
    distance: "10.0 km",
    elevation: "50 m",
    duration: "2.0 hr",
    imageClassName: "from-emerald-950 via-green-800 to-lime-500",
  },
];

const badges = ["Summit", "Trail", "Planner", "Pace"];

function difficultyClassName(difficulty: Trail["difficulty"]) {
  if (difficulty === "Advanced") {
    return "bg-orange-600 text-white";
  }

  if (difficulty === "Intermediate") {
    return "bg-[#43A047] text-white";
  }

  return "bg-[#66BB6A] text-[#062815]";
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#061813] text-white">
      <div className="absolute inset-0">
        <img
          alt=""
          className="h-full w-full object-cover"
          src={trailHeroImage}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03130F] via-[#03130F]/78 to-[#03130F]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061813] via-transparent to-[#061813]/20" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex max-w-3xl flex-col justify-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Explore{" "}
            <span className="block text-[#65D46E]">
              Christchurch Trails.
            </span>
            Level Up Your Hiking Journey.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-white/82 sm:text-lg">
            Discover stunning local trails, track your adventures, earn
            achievements, and turn every hike into visible progress.
          </p>

        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <Card className="w-full max-w-md border-white/18 bg-[#06130F]/75 text-white shadow-2xl shadow-black/30 backdrop-blur-md">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-5">
                <div className="flex size-20 items-center justify-center rounded-2xl border border-[#86EFAC]/40 bg-[#14532D]/70 text-[#BBF7D0]">
                  <Mountain aria-hidden="true" className="size-11" />
                </div>
                <div>
                  <p className="text-3xl font-black">Level 4</p>
                  <p className="font-semibold text-[#65D46E]">Explorer</p>
                </div>
              </div>

              <div className="my-7 h-px bg-white/12" />

              <div className="grid gap-5">
                <div className="flex items-center gap-4">
                  <Award className="size-7 text-[#F59E0B]" />
                  <div>
                    <p className="font-black">1,240 XP</p>
                    <p className="text-sm text-white/68">Total Experience</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Footprints className="size-7 text-[#86EFAC]" />
                  <div>
                    <p className="font-black">12</p>
                    <p className="text-sm text-white/68">Trails Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Flame className="size-7 text-orange-400" />
                  <div>
                    <p className="font-black">4 Week Streak</p>
                    <p className="text-sm text-white/68">Keep it going</p>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <div className="h-3 overflow-hidden rounded-full bg-white/12">
                  <div className="h-full w-[62%] rounded-full bg-[#65D46E]" />
                </div>
                <p className="mt-3 text-right text-sm font-semibold">
                  1,240 / 2,000 XP
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
      {features.map((feature) => (
        <Card
          className="group border-black/5 bg-white text-[#0B1511] shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-[#10221A] dark:text-white"
          key={feature.title}
        >
          <CardContent className="flex h-full gap-5 p-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#2E7D32] text-white">
              <feature.icon aria-hidden="true" className="size-7" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="text-xl font-black">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#33443B] dark:text-white/70">
                {feature.description}
              </p>
              <ArrowRight
                aria-hidden="true"
                className="mt-auto self-end text-[#0B1511] transition group-hover:translate-x-1 dark:text-white"
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function FeaturedTrailsSection() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8"
      id="featured-trails"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-black">Featured Trails</h2>
        <Link
          className="flex items-center gap-2 text-sm font-bold text-[#0B6B2B] transition hover:text-[#2E7D32] dark:text-[#86EFAC]"
          to="/"
        >
          View all trails
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {featuredTrails.map((trail) => (
          <Card
            className="overflow-hidden border-black/5 bg-white shadow-lg shadow-black/5 dark:border-white/10 dark:bg-[#10221A]"
            key={trail.name}
          >
            <div
              className={`relative aspect-[16/8] bg-gradient-to-br ${trail.imageClassName}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,rgba(255,255,255,0.35),transparent_22%),linear-gradient(135deg,transparent_45%,rgba(255,255,255,0.22)_46%,transparent_52%)]" />
              <span
                className={`absolute left-4 top-4 rounded-lg px-3 py-1 text-xs font-bold ${difficultyClassName(
                  trail.difficulty,
                )}`}
              >
                {trail.difficulty}
              </span>
            </div>
            <CardContent className="p-5">
              <div className="flex gap-3">
                <MapPin
                  aria-hidden="true"
                  className="mt-1 size-6 shrink-0 text-[#2E7D32]"
                />
                <div>
                  <h3 className="text-lg font-black">{trail.name}</h3>
                  <p className="text-sm text-[#56655D] dark:text-white/62">
                    {trail.location}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-black/8 pt-4 text-sm dark:border-white/10">
                <span className="flex items-center gap-1.5">
                  <Trophy aria-hidden="true" className="size-4" />
                  {trail.distance}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mountain aria-hidden="true" className="size-4" />
                  {trail.elevation}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="size-4" />
                  {trail.duration}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ProgressSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8" id="progress">
      <Card className="border-[#DDE9DA] bg-[#EAF3E9] text-[#0B1511] shadow-lg shadow-black/5 dark:border-white/10 dark:bg-[#10221A] dark:text-white">
        <CardContent className="grid gap-8 p-6 md:grid-cols-[0.8fr_2fr_0.85fr] lg:p-8">
          <div>
            <h2 className="text-2xl font-black">Your Progress</h2>
            <div className="mt-6 grid gap-5">
              <div className="flex items-center gap-3">
                <Award className="size-6 text-[#2E7D32]" />
                <div>
                  <p className="text-sm text-[#56655D] dark:text-white/62">
                    Total XP
                  </p>
                  <p className="text-3xl font-black">1,240</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mountain className="size-6 text-[#2E7D32]" />
                <div>
                  <p className="text-sm text-[#56655D] dark:text-white/62">
                    Current Level
                  </p>
                  <p className="text-3xl font-black">4</p>
                </div>
              </div>
            </div>
            <Button
              asChild
              className="mt-7 h-11 border-[#2E7D32]/60 bg-transparent text-[#14532D] hover:bg-[#2E7D32]/10 dark:text-[#BBF7D0]"
              variant="outline"
            >
              <Link to="/dashboard">
                View Dashboard
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-8 md:border-x md:border-[#C9D9C6] md:px-8 dark:md:border-white/10">
            <div>
              <div className="mb-3 flex items-center justify-between gap-4 text-sm font-bold">
                <span>XP Progress</span>
                <span>1,240 / 2,000 XP</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#CEDCCB] dark:bg-white/12">
                <div className="h-full w-[62%] rounded-full bg-[#2E7D32]" />
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="font-black">Recent Badges</h3>
                <div className="mt-5 flex flex-wrap gap-3">
                  {badges.map((badge, index) => (
                    <div
                      className="flex size-14 items-center justify-center rounded-2xl border border-[#2E7D32]/30 bg-[#103A24] text-white shadow-sm"
                      key={badge}
                      title={badge}
                    >
                      {index === 0 ? (
                        <Mountain aria-hidden="true" />
                      ) : index === 1 ? (
                        <Footprints aria-hidden="true" />
                      ) : index === 2 ? (
                        <CalendarCheck aria-hidden="true" />
                      ) : (
                        <Clock3 aria-hidden="true" />
                      )}
                    </div>
                  ))}
                </div>
                <Link
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0B6B2B] dark:text-[#86EFAC]"
                  to="/#progress"
                >
                  View all badges
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>

              <div id="leaderboard">
                <h3 className="font-black">Weekly Streak</h3>
                <p className="mt-4 text-5xl font-black">
                  4 <span className="text-base font-medium">weeks</span>
                </p>
                <div className="mt-4 flex gap-2 text-2xl" aria-label="4 week streak">
                  <span>🔥</span>
                  <span>🔥</span>
                  <span>🔥</span>
                  <span>🔥</span>
                  <span className="grayscale">🔥</span>
                </div>
                <p className="mt-3 text-sm text-[#56655D] dark:text-white/62">
                  Keep it up
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-black">Leaderboard Rank</h3>
            <p className="mt-3 text-5xl font-black">#28</p>
            <p className="mt-1 text-sm text-[#56655D] dark:text-white/62">
              Top 5% of hikers
            </p>
            <div className="mt-8 h-20 rounded-lg bg-[linear-gradient(135deg,transparent_0_14%,rgba(46,125,50,0.35)_14%_16%,transparent_16%_30%,rgba(46,125,50,0.55)_30%_32%,transparent_32%_48%,rgba(46,125,50,0.45)_48%_50%,transparent_50%_66%,rgba(46,125,50,0.6)_66%_68%,transparent_68%)]" />
            <Link
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0B6B2B] dark:text-[#86EFAC]"
              to="/#leaderboard"
            >
              View Leaderboard
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-[#061813] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black">
          Ready to start your next adventure?
        </h2>
        <p className="mt-3 text-white/75">
          Join Trail Explorer and turn every hike into progress.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 bg-[#43A047] px-6 font-bold text-white hover:bg-[#2E7D32]"
          >
            <Link to="/register">Create Account</Link>
          </Button>
          <Button
            asChild
            className="h-11 border-white/30 bg-white/5 px-6 font-bold text-white hover:bg-white/10"
            variant="outline"
          >
            <Link to="/login">
              <ArrowRight aria-hidden="true" className="size-4" />
              Log In
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeatureSection />
      <FeaturedTrailsSection />
      <ProgressSection />
      <CtaSection />
    </main>
  );
}

export { HomePage };
