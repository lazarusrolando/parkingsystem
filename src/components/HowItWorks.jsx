import React from 'react';
import Header from './Header';
import Footer from './Footer';

const ParkAppHowItWorks = () => {
  const steps = [
    {
      phase: "PHASE_01",
      title: "Scan & Locate",
      description: "Our AI-driven grid identifies vacant spots in real-time. Simply open the map to see live availability with 99.9% accuracy.",
      icon: "lan",
      color: "text-[#00f2ff]",
      borderColor: "border-[#00f2ff]/30",
      image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=800"
    },
    {
      phase: "PHASE_02",
      title: "Instant Reserve",
      description: "Tap to book your spot. Our system generates a digital handshake between your vehicle and the parking sensor, locking it just for you.",
      icon: "vibration",
      color: "text-[#00ff9d]",
      borderColor: "border-[#00ff9d]/30",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800"
    },
    {
      phase: "PHASE_03",
      title: "Smart Navigation",
      description: "Get turn-by-turn AR guidance directly to your bay. Once you arrive, the barrier recognizes your digital ID and opens automatically.",
      icon: "explore",
      color: "text-[#ac89ff]",
      borderColor: "border-[#ac89ff]/30",
      glow: "shadow-[0_0_20px_rgba(172,137,255,0.2)]",
      image: "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <div className="bg-[#0a0f14] text-[#eaeef6] font-sans selection:bg-cyan-500/30 min-h-screen">

      <Header />

      {/* --- HEADER TAG WITH BACKGROUND IMAGE --- */}
      <header
        className="relative pt-60 pb-32 px-6 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(10, 15, 20, 0.7), #0a0f14), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAVz5n0_PgnrGP2LQG3Oa0V5lGumKB7n2a_AYOGvbiH1Xv7gDUUSrp4yhQBwxRKPFr-7zRBlGxfiQa-J7KuWrqk7rAv0vesAPYjfpnWjWQG-UMITE0p0fbft6rK53906CHoasWnjFcfHEvcrI8ZfjCbTtP2ROmTpyPev0wjITUMNKbZRF4hNRuUpDMAaGt4sTAPg97J4nQpAzSzcDUnr9b0YuTogcJGGJFHeifUQsZf07-KBRJxNS1uNbrRJEdcTH-ig3mvEC2Zerk')`
        }}
      >
        {/* Optional: Radial glow to pop the text */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)]"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
            How <span className="text-[#00f2ff] drop-shadow-[0_0_20px_rgba(0,242,255,0.5)]">SPS Works</span>
          </h1>
          <p className="text-gray-300 text-lg lg:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover the simple steps to reserve your parking spot with our Smart
            Parking System.
          </p>
        </div>
      </header>

      {/* --- CONTENT SECTION --- */}
      <section className="py-24 px-6 bg-[#0a0f14]">
        <div className="max-w-6xl mx-auto space-y-40">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-20 ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
              <div className="lg:w-1/2 space-y-6">
                <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border ${step.borderColor}`}>
                  <span className={`text-[11px] font-bold tracking-[0.2em] uppercase ${step.color}`}>{step.phase}</span>
                </div>
                <h2 className="text-4xl font-bold tracking-tight">{step.title}</h2>
                <p className="text-gray-400 text-lg leading-relaxed">{step.description}</p>
              </div>
              <div className="lg:w-1/2 w-full">
                <div className="bg-[#141a20] rounded-3xl overflow-hidden aspect-[16/10] border border-white/5">
                  <img src={step.image} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-700" alt={step.title} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ParkAppHowItWorks;