import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import TrustStrip from './components/TrustStrip.jsx';
import Services from './components/Services.jsx';
import Gallery from './components/Gallery.jsx';
import RealClientResults from './components/RealClientResults.jsx';
import BookingCTA from './components/BookingCTA.jsx';
import ContactForm from './components/ContactForm.jsx';
import QRSection from './components/QRSection.jsx';
import SocialContact from './components/SocialContact.jsx';
import FinalCTA from './components/FinalCTA.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-silver">
      <div className="pointer-events-none fixed inset-0 grain opacity-60" />
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <Services />
        <Gallery />
        <RealClientResults />
        <BookingCTA />
        <ContactForm />
        <QRSection />
        <SocialContact />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
