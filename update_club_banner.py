with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\app\clubs\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

old_banner = '''              <div
                key={club.id}
                className={elative w-full rounded-3xl overflow-hidden p-8 md:p-16 bg-gradient-to-r  border border-luxury-taupe/10 flex flex-col md:flex-row justify-between items-center gap-12 min-h-[380px] shadow-xl}
              >
                {/* Background Shadow Textures */}
                <div className="absolute inset-0 bg-black/5 hover:bg-black/0 transition-all duration-1000 pointer-events-none" />
                <Image
                  src={club.image}
                  alt={club.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="opacity-15 mix-blend-luminosity pointer-events-none"
                />

                <div className="relative z-10 space-y-6 max-w-xl text-left">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-luxury-taupe font-bold block">{club.era}</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-light text-luxury-dark leading-tight">{club.name}</h2>
                  </div>
                  <p className="text-xs md:text-sm text-luxury-dark/75 leading-relaxed font-sans font-light">
                    An official hallmark signature drop representing historic football alliances. Crafted with premium collectible presentation, double-knit fabric, and custom detailing.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-luxury-taupe/20">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-luxury-taupe/60 font-semibold block">Exclusive Highlight</span>
                      <span className="text-xs font-semibold text-luxury-dark">{club.highlight}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 w-24 h-24 rounded-full bg-luxury-dark/10 flex items-center justify-center border border-luxury-dark/20 flex-shrink-0 animate-pulse-subtle">
                  <Sparkles className="w-10 h-10 text-luxury-taupe" />
                </div>
              </div>'''

new_banner = '''              <div
                key={club.id}
                className={elative w-full rounded-3xl overflow-hidden p-8 md:p-16 bg-gradient-to-r  border border-luxury-taupe/10 flex flex-col-reverse md:flex-row justify-between items-center gap-12 min-h-[300px] shadow-xl }
              >
                {/* Background Shadow Textures */}
                <div className="absolute inset-0 bg-black/10 hover:bg-black/5 transition-all duration-1000 pointer-events-none" />
                
                <div className="relative z-10 space-y-6 max-w-xl text-left">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-luxury-taupe font-bold block">{club.era}</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-light leading-tight">{club.name}</h2>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed font-sans font-light opacity-80">
                    An official hallmark signature drop representing historic football alliances. Crafted with premium collectible presentation, double-knit fabric, and custom detailing.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-luxury-taupe/20">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-luxury-taupe/80 font-semibold block">Exclusive Highlight</span>
                      <span className="text-xs font-semibold">{club.highlight}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex-shrink-0 animate-pulse-subtle bg-white/10 rounded-full p-4 backdrop-blur-sm border border-white/20">
                  <Image
                    src={club.image}
                    alt={club.name}
                    fill
                    style={{ objectFit: "contain" }}
                    className="drop-shadow-2xl rounded-full p-4"
                  />
                </div>
              </div>'''

content = content.replace(old_banner, new_banner)

with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\app\clubs\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated banner in clubs/page.tsx")
