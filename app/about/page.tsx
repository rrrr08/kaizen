'use client';

export default function About() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-20 border-b border-white/5 pb-12">
          <div className="text-amber-500 font-header text-[10px] tracking-[0.6em] mb-4 uppercase">Our Story</div>
          <h1 className="font-header text-5xl md:text-7xl lg:text-8xl tracking-tighter mb-8">
            ABOUT JOY <br/><span className="text-amber-400">JUNCTURE</span>
          </h1>
          <p className="text-white/60 font-serif italic text-lg max-w-3xl">
            A digital playground built on the belief that games are more than products—they're moments, memories, and shared joy.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div className="border border-white/10 p-12 rounded-sm">
            <h2 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Our Mission</h2>
            <p className="text-white/70 font-serif italic leading-relaxed">
              To create a vibrant ecosystem where games, experiences, and community converge. We believe in the power of play to bring people together, create lasting connections, and deliver joy in its purest form.
            </p>
          </div>

          <div className="border border-white/10 p-12 rounded-sm">
            <h2 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Our Vision</h2>
            <p className="text-white/70 font-serif italic leading-relaxed">
              A world where gaming transcends entertainment and becomes a catalyst for human connection. Where every celebration, every gathering, and every moment is elevated through thoughtfully curated games and experiences.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-24">
          <h2 className="font-header text-4xl md:text-5xl mb-12 tracking-tight">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Playfulness',
                description: 'We believe in the joy and energy that games bring. Everything we do is infused with creativity and fun.'
              },
              {
                title: 'Community',
                description: 'Connections matter. We foster a warm, inclusive space where everyone feels they belong.'
              },
              {
                title: 'Quality',
                description: 'From games to experiences, we curate only the best. Excellence is non-negotiable.'
              },
              {
                title: 'Accessibility',
                description: 'Joy should be for everyone. We make gaming accessible to all ages, backgrounds, and skill levels.'
              }
            ].map((value, idx) => (
              <div key={idx} className="border border-white/10 p-8 rounded-sm hover:border-amber-500/40 transition-all">
                <h3 className="font-header text-[10px] tracking-[0.4em] text-amber-500 mb-4 uppercase">{value.title}</h3>
                <p className="text-white/70 font-serif italic text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Founder Story */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24 py-16 border-y border-white/10">
          <div>
            <div className="aspect-square overflow-hidden rounded-sm border border-white/10 bg-gradient-to-br from-amber-500/20 to-transparent">
              <img 
                src="https://picsum.photos/seed/founder/600/600"
                alt="Founder"
                className="w-full h-full object-cover grayscale"
              />
            </div>
          </div>

          <div>
            <h2 className="font-header text-[10px] tracking-[0.6em] text-amber-500 mb-6 uppercase">Founder's Journey</h2>
            <h3 className="font-header text-3xl md:text-4xl mb-6">Why Joy Juncture Started</h3>
            <div className="space-y-6 text-white/70 font-serif italic">
              <p>
                Joy Juncture was born from a simple observation: in a world obsessed with digital isolation, people crave real connections and shared moments of joy. Games, in their purest form, are vehicles for these moments.
              </p>
              <p>
                The founder spent years observing how a single board game could transform a room full of strangers into a community of friends. That magic inspired the creation of Joy Juncture—a platform that celebrates games not as products, but as catalysts for belonging.
              </p>
              <p>
                Today, Joy Juncture is more than an e-commerce platform. It's a movement. A celebration of playfulness. A testament to the power of gathering, laughing, competing, and most importantly, connecting.
              </p>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="mb-24">
          <h2 className="font-header text-3xl md:text-4xl mb-12 tracking-tight">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { stat: '10,000+', label: 'Happy Players' },
              { stat: '500+', label: 'Games Delivered' },
              { stat: '100+', label: 'Events Hosted' },
              { stat: '50+', label: 'Corporate Partners' }
            ].map((item, idx) => (
              <div key={idx} className="border border-white/10 p-8 rounded-sm text-center hover:border-amber-500/40 transition-all">
                <p className="font-serif italic text-4xl text-amber-500 mb-4">{item.stat}</p>
                <p className="font-header text-[9px] tracking-widest text-white/60">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-16 border-t border-white/10">
          <h2 className="font-header text-3xl md:text-4xl mb-6">Join Our Story</h2>
          <p className="text-white/60 font-serif italic text-lg mb-8 max-w-2xl mx-auto">
            Whether you're a gamer, a event organizer, or someone seeking community, there's a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a 
              href="/shop"
              className="px-8 py-4 bg-amber-500 text-black font-header text-[10px] tracking-[0.4em] hover:bg-amber-400 transition-all rounded-sm"
            >
              EXPLORE GAMES
            </a>
            <a 
              href="#contact"
              className="px-8 py-4 border border-amber-500 text-amber-500 font-header text-[10px] tracking-[0.4em] hover:bg-amber-500/10 transition-all rounded-sm"
            >
              CONTACT US
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
