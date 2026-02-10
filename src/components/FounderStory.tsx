import { useFadeIn } from '@/hooks/useFadeIn'

export default function FounderStory() {
  const fadeIn = useFadeIn()

  return (
    <section id="founder-story" className="py-24 sm:py-32 px-6 sm:px-8 bg-white" ref={fadeIn.ref}>
      <div className={`max-w-3xl mx-auto ${fadeIn.className}`}>
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-center text-navy mb-16">
          The Story Behind Rebloom
        </h2>

        <div className="bg-warm-cream rounded-2xl p-8 sm:p-14 relative">
          {/* Decorative quote mark */}
          <div className="absolute top-4 left-6 text-bloom-pink text-8xl font-heading leading-none select-none opacity-50">
            &ldquo;
          </div>

          <div className="relative space-y-7 text-navy/80 leading-relaxed text-lg">
            <p>
              My name is <strong className="text-navy">Darryl James</strong>, and I created Rebloom SA
              because I watched my mother navigate one of the most difficult journeys anyone can face —
              finding connection again after losing my father.
            </p>
            <p>
              After his passing, I saw her struggle with loneliness and the desire for companionship,
              but the existing options felt wrong. Dating apps were superficial and intimidating.
              Facebook groups lacked privacy and verification. There was simply no space designed
              for people like her.
            </p>
            <p>
              That's why I built Rebloom — a place where widows and widowers across South Africa
              can find understanding, safety, and meaningful connections. Every member is personally
              verified by me because I believe this community deserves nothing less than genuine care.
            </p>
            <p className="font-semibold text-navy italic">
              After loss, life doesn't end — it blooms again.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-bloom-pink/30">
            <p className="font-heading text-xl font-semibold text-navy">Darryl James</p>
            <p className="text-navy/60">Founder, Rebloom SA</p>
          </div>
        </div>
      </div>
    </section>
  )
}
