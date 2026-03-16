import { Link } from "react-router-dom";
import { ArrowRight, Gauge, Car, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#EB0A1E]/10 via-transparent to-[#EB0A1E]/10 pointer-events-none" />

        {/* Header removed; global navbar is provided by AppLayout */}

        <main className="relative z-10">
          <section className="container mx-auto px-6 pt-10 pb-16 md:pt-20 md:pb-28 grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-6 duration-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 px-3 py-1 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#EB0A1E]" />
                Personalized Toyota financing in minutes
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Finance your next Toyota with confidence
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 text-lg">
                See real-time affordability, simulate payments, and compare lease vs finance options tailored to your profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/quiz">
                  <Button size="lg" className="bg-[#EB0A1E] hover:bg-[#c10819] text-white">
                    Start Interactive Quiz
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="border-neutral-300 dark:border-neutral-700">
                    Explore Dashboard
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#EB0A1E]" /> No credit inquiry</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#EB0A1E]" /> Private & secure</div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#EB0A1E]" /> Free to use</div>
              </div>
            </div>

            <div className="relative animate-in fade-in slide-in-from-right-6 duration-700">
              <div className="absolute -inset-6 bg-[#EB0A1E]/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 backdrop-blur p-4 shadow-lg">
                <div className="aspect-[16/10] w-full overflow-hidden rounded-xl">
                  <img
                    src="/cars/camry-2023.jpg"
                    alt="Toyota Camry"
                    className="h-full w-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    "/cars/rav4-2024.jpg",
                    "/cars/prius-2024.jpg",
                    "/cars/tacoma-2024.jpg",
                  ].map((src) => (
                    <div key={src} className="overflow-hidden rounded-lg">
                      <img src={src} alt="Toyota" className="h-28 w-full object-cover hover:scale-110 transition-transform duration-700" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="container mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-md bg-[#EB0A1E]/10 text-[#EB0A1E] grid place-items-center mb-4">
                  <Gauge className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">Affordability Insights</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Get a clear view of monthly payments and loan terms that fit your budget.</p>
              </CardContent>
            </Card>
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-md bg-[#EB0A1E]/10 text-[#EB0A1E] grid place-items-center mb-4">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">Compare Vehicles</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">See how different Toyota models impact cost and long‑term value.</p>
              </CardContent>
            </Card>
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-md bg-[#EB0A1E]/10 text-[#EB0A1E] grid place-items-center mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-1">Lease vs Finance</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Model different scenarios to choose the best payment plan for you.</p>
              </CardContent>
            </Card>
          </section>
        </main>

        <footer className="relative z-10 border-t border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto px-6 py-6 text-xs text-neutral-500 dark:text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} Toyota Motor Credit Corporation. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#EB0A1E]">Privacy</a>
              <a href="#" className="hover:text-[#EB0A1E]">Terms</a>
              <a href="#" className="hover:text-[#EB0A1E]">Disclosures</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
