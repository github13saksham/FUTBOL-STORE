import re

new_products = '''
export const DOCX_PRODUCTS: Product[] = [
  { id: "docx-1", name: "Germany 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image1.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-2", name: "Argentina 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image2.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-3", name: "Brazil 2026 Away Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image3.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-4", name: "Argentina 2026 Black Edition Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image4.jpeg", category: "Player Version", color: "Black Edition", desc: "Engineered for pure matchday performance." },
  { id: "docx-5", name: "Japan 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image5.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-6", name: "Brazil 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image6.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-7", name: "Spain 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image7.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-8", name: "Belgium 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image8.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-9", name: "Italy 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image9.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-10", name: "Argentina 2026 Away Player Version", club: "National Team", price: 999, priceStr: "?999.00", image: "/DOCX_JERSEYS/image10.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-11", name: "Japan 2026 Away Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image11.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-12", name: "France 2026 Away Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image12.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-13", name: "England 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image13.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-14", name: "England 2026 Away Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image14.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-15", name: "Netherlands 2026 Away Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image15.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-16", name: "Portugal 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image16.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-17", name: "Argentina 2026 Navy Blue Concept Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image17.jpeg", category: "Player Version", color: "Navy Blue Concept", desc: "Engineered for pure matchday performance." },
  { id: "docx-18", name: "Portugal 2026 Black Special Edition Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image18.jpeg", category: "Player Version", color: "Black Special Edition", desc: "Engineered for pure matchday performance." },
  { id: "docx-19", name: "France 2026 Home Player Version", club: "National Team", price: 949, priceStr: "?949.00", image: "/DOCX_JERSEYS/image19.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." }
];
'''

with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\data\mockData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add DOCX_PRODUCTS before ALL_PRODUCTS
content = content.replace('export const ALL_PRODUCTS', new_products + '\nexport const ALL_PRODUCTS')

# Update ALL_PRODUCTS to include DOCX_PRODUCTS
content = content.replace('export const ALL_PRODUCTS: Product[] = [...BEST_SELLERS, ...CLUB_PRODUCTS];', 'export const ALL_PRODUCTS: Product[] = [...BEST_SELLERS, ...CLUB_PRODUCTS, ...DOCX_PRODUCTS];')

with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\data\mockData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated mockData.ts")
