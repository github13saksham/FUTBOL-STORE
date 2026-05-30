with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\data\mockData.ts', 'r', encoding='utf-8') as f:
    content = f.read()

import re

new_clubs = '''export const CLUBS: Club[] = [
  {
    id: "club-ars",
    name: "ARSENAL FC",
    era: "The Arsenal Archive",
    bgClass: "from-[#101010] to-[#1C1C1C]",
    colorTheme: "#D2BBA0",
    highlight: "Red & Green",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/Arsenal_logo.jpeg"
  },
  {
    id: "club-barca",
    name: "FC BARCELONA",
    era: "Blaugrana Legacy",
    bgClass: "from-[#004D98] to-[#A50044]",
    colorTheme: "#EDBB00",
    highlight: "Catalan Pride",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/F.CBarcelona_logo.jpeg"
  },
  {
    id: "club-lfc",
    name: "LIVERPOOL FC",
    era: "Anfield Glory",
    bgClass: "from-[#C8102E] to-[#60000B]",
    colorTheme: "#F6EB61",
    highlight: "YNWA Spirit",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/L.F.C_Logo.jpeg"
  },
  {
    id: "club-mci",
    name: "MANCHESTER CITY",
    era: "Cityzens Era",
    bgClass: "from-[#6CABDD] to-[#1C2C5B]",
    colorTheme: "#FFC659",
    highlight: "Sky Blue Dominance",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/Manchester_city.jpeg"
  },
  {
    id: "club-mun",
    name: "MANCHESTER UNITED",
    era: "Red Devils Heritage",
    bgClass: "from-[#DA291C] to-[#000000]",
    colorTheme: "#FBE122",
    highlight: "Theatre of Dreams",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/Manchester_United_logo.jpeg"
  },
  {
    id: "club-rm",
    name: "REAL MADRID CF",
    era: "Classic Edition",
    bgClass: "from-[#FDFBF7] to-[#ECEAE2]",
    colorTheme: "#9F7E69",
    highlight: "Gold Trim & Crest",
    textClass: "text-luxury-dark",
    image: "/Club_Logos/Real_madrid_logo.jpeg"
  }
];'''

content = re.sub(r'export const CLUBS: Club\[\] = \[.*?\];', new_clubs, content, flags=re.DOTALL)

with open(r'c:\Users\SAKSHAM\Downloads\Futbol Store\src\data\mockData.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated CLUBS in mockData.ts")
