import { Header } from "@/components/screens/home/sections/Header";
import { Hero } from "@/components/screens/home/sections/Hero";
import { LogoTicker } from "@/components/screens/home/sections/LogoTicker";
import { ProductShowcase } from "@/components/screens/home/sections/ProductShowcase";
import { Pricing } from "@/components/screens/home/sections/Pricing";
import { Integrations } from "@/components/screens/home/sections/Integrations";
import { CallToAction } from "@/components/screens/home/sections/CallToAction";
import { Footer } from "@/components/screens/home/sections/Footer";

// Home page
export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <LogoTicker />
      <ProductShowcase />
      <Pricing />
      <Integrations />
      <CallToAction />
      <Footer />
    </>
  );
}
