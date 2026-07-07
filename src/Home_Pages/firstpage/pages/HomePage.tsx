import Hero from '@/Home_Pages/firstpage/components/Hero'
import HowItWorks from '@/Home_Pages/firstpage/components/HowItWorks'
import Audiences from '@/Home_Pages/firstpage/components/Audiences'
import Features from '@/Home_Pages/firstpage/components/Features'
import CtaBand from '@/Home_Pages/firstpage/components/CtaBand'
import '@/Home_Pages/firstpage/styles/home-page.css'

// Homepage of the Land Valuation System.
// The background and Header come from the shared Layout; this file composes the
// page's sections top to bottom. Sections below the hero reveal on scroll.
const Home = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Audiences />
      <Features />
      <CtaBand />
    </>
  )
}

export default Home
