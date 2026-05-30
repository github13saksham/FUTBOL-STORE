with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\app\national-teams\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { useState } from "react";', '')
content = content.replace('import { motion } from "framer-motion";', 'import { useState } from "react";\nimport { motion } from "framer-motion";')
content = content.replace('import { BEST_SELLERS } from "@/data/mockData";', 'import { ALL_PRODUCTS } from "@/data/mockData";')

new_logic = '''
  const [filter, setFilter] = useState<"all" | "player" | "fan">("all");
  
  const nationalTeamsProducts = ALL_PRODUCTS.filter(p => p.club === "National Team");
  
  const filteredProducts = nationalTeamsProducts.filter(p => {
    if (filter === "all") return true;
    if (filter === "player") return p.category.toLowerCase().includes("player");
    if (filter === "fan") return p.category.toLowerCase().includes("fan");
    return true;
  });
'''

content = content.replace('  const { wishlist, toggleWishlist, setQuickAddProduct } = useStore();', '  const { wishlist, toggleWishlist, setQuickAddProduct } = useStore();\n' + new_logic)

new_filter_html = '''
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <span className="text-xs uppercase tracking-[0.25em] text-luxury-taupe font-semibold">Active Releases</span>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter("all")}
                className={px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all }
              >
                All
              </button>
              <button 
                onClick={() => setFilter("player")}
                className={px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all }
              >
                Player Version
              </button>
              <button 
                onClick={() => setFilter("fan")}
                className={px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all }
              >
                Fan Version
              </button>
            </div>
          </div>
'''

content = content.replace('''          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-luxury-taupe font-semibold">Active Releases</span>
           
          </div>''', new_filter_html)

content = content.replace('{BEST_SELLERS.map((product) => (', '{filteredProducts.map((product) => (')

with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\app\national-teams\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated national-teams/page.tsx")
