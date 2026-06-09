'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import GlassCard from '../components/GlassCard';
import { useInView } from '../hooks/useInView';

export default function AboutPage() {
  const { ref: storyRef, isInView: storyInView } = useInView();
  const { ref: missionRef, isInView: missionInView } = useInView();

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <Navbar />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
              About
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Built by security people, for security people
            </h1>
          </div>

          <div
            ref={storyRef}
            className={`grid lg:grid-cols-2 gap-12 mb-24 transition-all duration-700 ${storyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Our story
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  GuardianHub started in 2022 when a group of former security operations managers sat down with software engineers and asked a simple question: why is security ops software still stuck in the 1990s?
                </p>
                <p>
                  We had all run control rooms, managed guard rotas on spreadsheets, and dealt with the chaos of missed patrols and undocumented incidents. The tools available were either ancient on-premise systems or generic workforce apps that did not understand the unique demands of security operations.
                </p>
                <p>
                  So we built what we wished we had: a modern, cloud-native platform that thinks like a control room manager. AI that understands shift patterns. Real-time maps that show you exactly where your guards are. Incident reports that write themselves.
                </p>
                <p>
                  Today, GuardianHub powers security operations for firms across the UK, from boutique providers with a handful of sites to national companies managing hundreds of guards daily. And we are just getting started.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <img
                  src="https://readdy.ai/api/search-image?query=Modern%20security%20operations%20team%20in%20a%20sleek%20control%20room%20with%20multiple%20screens%20showing%20maps%20and%20analytics%2C%20diverse%20professionals%20collaborating%20at%20a%20large%20desk%2C%20dark%20navy%20interior%20with%20blue%20ambient%20lighting%2C%20glass%20walls%2C%20modern%20office%20design%2C%20professional%20photography%2C%20high%20quality&width=800&height=600&seq=about-team&orientation=landscape"
                  alt="GuardianHub team"
                  className="w-full h-80 lg:h-96 object-cover object-top"
                />
              </div>
            </div>
          </div>

          <div
            ref={missionRef}
            className={`mb-24 transition-all duration-700 ${missionInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              What drives us
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <GlassCard className="p-8 text-center" hover>
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-focus-3-line text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Precision</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Security is about the details. Every patrol missed is a risk. Every unlogged incident is a liability. We build tools that leave nothing to chance.
                </p>
              </GlassCard>
              <GlassCard className="p-8 text-center" hover>
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-lightbulb-flash-line text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Intelligence</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  AI should not replace human judgment — it should amplify it. We use machine learning to surface insights, not to make decisions for you.
                </p>
              </GlassCard>
              <GlassCard className="p-8 text-center" hover>
                <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-shield-star-line text-blue-400 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">Reliability</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  When a guard needs to raise an alarm, the system must work. Every time. No exceptions. We engineer for 99.99% uptime because lives depend on it.
                </p>
              </GlassCard>
            </div>
          </div>

          <SectionHeading
            eyebrow="Team"
            title="The people behind GuardianHub"
            subtitle="A mix of security veterans, software engineers, and design obsessives."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'James Crawford', role: 'Co-Founder & CEO', bg: 'bg-blue-600' },
              { name: 'Sarah Okonkwo', role: 'Co-Founder & CTO', bg: 'bg-purple-600' },
              { name: 'Marcus Webb', role: 'Head of Operations', bg: 'bg-emerald-600' },
              { name: 'Aisha Patel', role: 'Head of Product', bg: 'bg-orange-600' },
              { name: 'David O\'Brien', role: 'Lead AI Engineer', bg: 'bg-cyan-600' },
              { name: 'Priya Sharma', role: 'Head of Customer Success', bg: 'bg-pink-600' },
              { name: 'Tom Bradley', role: 'Security Advisor', bg: 'bg-amber-600' },
              { name: 'Laura Chen', role: 'Lead Designer', bg: 'bg-indigo-600' },
            ].map((person) => (
              <GlassCard key={person.name} className="p-6 text-center" hover>
                <div
                  className={`w-20 h-20 rounded-full ${person.bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="text-white text-xl font-bold">
                    {person.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <h4 className="text-base font-semibold text-white mb-1">
                  {person.name}
                </h4>
                <p className="text-gray-400 text-sm">{person.role}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}