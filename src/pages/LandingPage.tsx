import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ValueProps from '@/components/ValueProps'
import HowItWorks from '@/components/HowItWorks'
import CommunicationFlow from '@/components/CommunicationFlow'
import ComparisonTable from '@/components/ComparisonTable'
import FounderStory from '@/components/FounderStory'
import Testimonials from '@/components/Testimonials'
import Stats from '@/components/Stats'
import SignupForm from '@/components/SignupForm'
import FAQ from '@/components/FAQ'
import Newsletter from '@/components/Newsletter'
import Footer from '@/components/Footer'
import WhatsAppButton from '@/components/WhatsAppButton'

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <main className="w-full">
        <Hero />
        <ValueProps />
        <HowItWorks />
        <CommunicationFlow />
        <ComparisonTable />
        <FounderStory />
        <Testimonials />
        <Stats />
        <SignupForm />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
