import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  Flame,
  Footprints,
  Map,
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
  cardClassName: string;
  iconClassName: string;
  titleClassName: string;
  descriptionClassName: string;
}

const features: Feature[] = [
  {
    title: "Discover Trails",
    description:
      "Search curated Christchurch and Canterbury hikes by terrain, distance, and difficulty.",
    icon: Map,
    cardClassName:
      "border-emerald-200 bg-white dark:border-emerald-300/20 dark:bg-emerald-950/70",
    iconClassName:
      "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/18 dark:text-emerald-200 dark:ring-emerald-300/25",
    titleClassName: "text-emerald-900 dark:text-emerald-100",
    descriptionClassName: "text-[#56655D] dark:text-white/72",
  },
  {
    title: "Check In",
    description:
      "Record completed hikes with notes and progress that stays attached to your profile.",
    icon: CalendarCheck,
    cardClassName:
      "border-sky-200 bg-white dark:border-sky-300/20 dark:bg-sky-950/55",
    iconClassName:
      "bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-500/18 dark:text-sky-100 dark:ring-sky-300/25",
    titleClassName: "text-sky-900 dark:text-sky-100",
    descriptionClassName: "text-[#56655D] dark:text-white/72",
  },
  {
    title: "Earn Rewards",
    description:
      "Gain XP, unlock badges, maintain streaks, and climb the leaderboard.",
    icon: Trophy,
    cardClassName:
      "border-amber-200 bg-white dark:border-amber-300/20 dark:bg-amber-950/45",
    iconClassName:
      "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/18 dark:text-amber-100 dark:ring-amber-200/25",
    titleClassName: "text-amber-900 dark:text-amber-100",
    descriptionClassName: "text-[#56655D] dark:text-white/72",
  },
];

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#EEF4E8] text-[#0B1511] dark:bg-[#061813] dark:text-white">
      <div className="absolute inset-0">
        <img
          alt=""
          className="h-full w-full object-cover opacity-35 dark:opacity-100"
          src={trailHeroImage}
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#F7F8F3] via-[#F7F8F3]/90 to-[#F7F8F3]/45 dark:from-[#03130F] dark:via-[#03130F]/80 dark:to-[#03130F]/35" />
        <div className="absolute inset-0 bg-linear-to-t from-[#EEF4E8] via-transparent to-[#F7F8F3]/20 dark:from-[#061813] dark:to-[#061813]/20" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="flex max-w-3xl flex-col justify-center">
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Explore{" "}
            <span className="block text-[#1F7A3A] dark:text-[#65D46E]">
              Christchurch Trails.
            </span>
            Level Up Your Hiking Journey.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#34463C] sm:text-lg dark:text-white/82">
            Discover stunning local trails, track your adventures, earn
            achievements, and turn every hike into visible progress.
          </p>

        </div>

        <div className="flex items-center justify-center lg:justify-end">
          <Card className="w-full max-w-md border-black/10 bg-white/90 text-[#0B1511] shadow-2xl shadow-black/15 backdrop-blur-md dark:border-white/20 dark:bg-[#06130F]/75 dark:text-white dark:shadow-black/30">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-5">
                <div className="flex size-20 items-center justify-center rounded-2xl border border-[#2E7D32]/20 bg-[#E4F5E5] text-[#1F7A3A] dark:border-[#86EFAC]/40 dark:bg-[#14532D]/70 dark:text-[#BBF7D0]">
                  <Mountain aria-hidden="true" className="size-11" />
                </div>
                <div>
                  <p className="text-3xl font-black">Level 4</p>
                  <p className="font-semibold text-[#1F7A3A] dark:text-[#65D46E]">
                    Explorer
                  </p>
                </div>
              </div>

              <div className="my-7 h-px bg-black/10 dark:bg-white/12" />

              <div className="grid gap-5">
                <div className="flex items-center gap-4">
                  <Award className="size-7 text-[#F59E0B]" />
                  <div>
                    <p className="font-black">1,240 XP</p>
                    <p className="text-sm text-[#56655D] dark:text-white/68">
                      Total Experience
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Footprints className="size-7 text-[#86EFAC]" />
                  <div>
                    <p className="font-black">12</p>
                    <p className="text-sm text-[#56655D] dark:text-white/68">
                      Trails Completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Flame className="size-7 text-orange-400" />
                  <div>
                    <p className="font-black">4 Week Streak</p>
                    <p className="text-sm text-[#56655D] dark:text-white/68">
                      Keep it going
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <div className="h-3 overflow-hidden rounded-full bg-black/10 dark:bg-white/12">
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
          className={`border shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:shadow-xl ${feature.cardClassName}`}
          key={feature.title}
        >
          <CardContent className="flex h-full gap-5 p-6">
            <div
              className={`flex size-14 shrink-0 items-center justify-center rounded-full ${feature.iconClassName}`}
            >
              <feature.icon aria-hidden="true" className="size-7" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className={`text-xl font-black ${feature.titleClassName}`}>
                {feature.title}
              </h2>
              <p className={`mt-2 text-sm leading-6 ${feature.descriptionClassName}`}>
                {feature.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function CtaSection() {
  return (
    <section className="bg-[#E8F1E7] text-[#0B1511] dark:bg-[#061813] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black">
          Ready to start your next adventure?
        </h2>
        <p className="mt-3 text-[#56655D] dark:text-white/75">
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
            className="h-11 border-[#2E7D32]/30 bg-white px-6 font-bold text-[#1F7A3A] hover:bg-[#F7F8F3] dark:border-white/30 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
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
      <CtaSection />
    </main>
  );
}

export { HomePage };
