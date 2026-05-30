with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\app\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import re

# Find the grid that maps over CLUBS
old_grid_pattern = re.compile(r'\{\/\* Premium layout Grid \*\/\}.*?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">.*?<\/div>\s*<\/div>\s*<\/section>', re.DOTALL)

new_grid = '''{/* Premium layout Grid */}
          <div className="flex flex-wrap lg:flex-nowrap justify-center items-center gap-6 md:gap-10">
            {CLUBS.map((club) => (
              <Link key={club.id} href={/clubs?id=}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-28 h-28 md:w-40 md:h-40 rounded-full bg-white/5 border border-luxury-sand/10 hover:border-luxury-sand/40 hover:bg-white/10 flex items-center justify-center p-6 shadow-xl hover:shadow-[0_0_30px_rgba(205,164,145,0.15)] transition-all cursor-pointer group"
                >
                  <div className="relative w-full h-full">
                    <Image 
                      src={club.image}
                      alt={club.name}
                      fill
                      style={{ objectFit: "contain" }}
                      className="drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>'''

if old_grid_pattern.search(content):
    content = old_grid_pattern.sub(new_grid, content)
    with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\app\page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated homepage clubs grid")
else:
    print("Pattern not found!")
