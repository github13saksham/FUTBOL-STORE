export interface Product {
  id: string;
  name: string;
  club: string;
  price: number;
  priceStr: string;
  image: string;
  category: string;
  color: string;
  desc: string;
  inventory?: Record<string, number>;
  inStock?: boolean;
  rating?: number;
  createdAt?: string;
  visibility?: {
    active: boolean;
    featured: boolean;
    bestSeller: boolean;
    newArrival: boolean;
  };
}


export interface Club {
  id: string;
  name: string;
  era: string;
  bgClass: string;
  colorTheme: string;
  highlight: string;
  textClass: string;
  image: string;
  logoBg?: string;
  logoScaleBase?: number;
  logoScaleHover?: number;
  logoObjectFit?: "cover" | "contain";
}

export const BEST_SELLERS: Product[] = [
  {
    id: "bs-1",
    name: "ARGENTINA AWAY PLAYER VERSION 2026",
    club: "National Team",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/ARGENTINA_PLAYER_VERSION.jpeg",
    category: "Player Version",
    color: "Albiceleste Blue",
    desc: "Engineered for pure matchday performance."
  },
  {
    id: "bs-2",
    name: "SPAIN AWAY FAN VERSION 2026",
    club: "National Team",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/SPAIN_FAN_VERSION.jpeg",
    category: "Fan Version",
    color: "Furia Red",
    desc: "Crafted for comfort and everyday wear."
  },
  {
    id: "bs-3",
    name: "GERMANY HOME PLAYER VERSION 2026",
    club: "National Team",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/GERMANY_PLAYER_VERSION.jpeg",
    category: "Player Version",
    color: "Classic White",
    desc: "Constructed with breathable technical knit fabric."
  },
  {
    id: "bs-4",
    name: "PORTUGAL AWAY FAN VERSION 2026",
    club: "National Team",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/PORTUGAL_FAN_VERSION.jpeg",
    category: "Fan Version",
    color: "Pepper Red",
    desc: "A beautifully structured lifestyle jersey."
  },
  {
    id: "bs-5",
    name: "BRAZIL AWAY PLAYER VERSION 2026",
    club: "National Team",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/BRAZIL_PLAYER_VERSION.jpeg",
    category: "Player Version",
    color: "Dynamic Yellow",
    desc: "A stunning jersey silhouette featuring performance construction."
  }
];

export const CLUB_PRODUCTS: Product[] = [
  {
    id: "club-rm-home",
    name: "REAL MADRID HOME PLAYER VERSION 2026",
    club: "REAL MADRID CF",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/media__1779483918893.jpg",
    category: "Player Version",
    color: "Realeza White",
    desc: "Crafted with gold details representing the Realeza legacy. Engineered with premium ultra-light piqué weave and heat-pressed elements."
  },
  
  {
    id: "club-acm-home",
    name: "AC MILAN HOME FAN VERSION 2026",
    club: "AC MILAN",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/SPAIN_FAN_VERSION.jpeg",
    category: "Fan Version",
    color: "Diavolo Black & Crimson",
    desc: "Everyday luxury comfort inspired by Diavolo Classico history. Tailored for lifestyle layering and off-pitch elegance."
  },
  {
    id: "club-bay-away",
    name: "FC BAYERN MÜNCHEN AWAY FAN VERSION 2026",
    club: "FC BAYERN MÜNCHEN",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/PORTUGAL_FAN_VERSION.jpeg",
    category: "Fan Version",
    color: "Bavaria Burgundy",
    desc: "Classic Bavaria heritage design woven for regular comfortable fit. Finished with a subtle mock collar and woven badges."
  },
  {
    id: "club-psg-home",
    name: "PARIS SAINT-GERMAIN HOME PLAYER VERSION 2026",
    club: "PARIS SAINT-GERMAIN",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/BESTSELLER_JERSEYS/BRAZIL_PLAYER_VERSION.jpeg",
    category: "Player Version",
    color: "Luminescence Navy",
    desc: "Designed with double-pitted premium knit mesh patterns and metallic crests. Employing luxury structural drapes."
  },
  {
    id: "club-ars-2526-home",
    name: "ARSENAL HOME PLAYER VERSION 25-26",
    club: "ARSENAL FC",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/Arsenal_25-26_Home_Player_Version.jpeg",
    category: "Player Version",
    color: "Red & White",
    desc: "The 25-26 season home jersey engineered for pure matchday performance."
  },
  {
    id: "club-fcb-2526-away",
    name: "FC BARCELONA AWAY PLAYER VERSION 25-26",
    club: "FC BARCELONA",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/FCB_25-26_APV.jpeg",
    category: "Player Version",
    color: "Away Colors",
    desc: "The 25-26 season away jersey crafted with premium details."
  },
  {
    id: "club-fcb-2526-home",
    name: "FC BARCELONA HOME PLAYER VERSION 25-26",
    club: "FC BARCELONA",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/FCB_25-26_HPV.jpeg",
    category: "Player Version",
    color: "Blaugrana",
    desc: "The 25-26 season home jersey engineered for pure matchday performance."
  },
  {
    id: "club-mci-2526-away",
    name: "MANCHESTER CITY AWAY PLAYER VERSION 25-26",
    club: "MANCHESTER CITY",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/MC25-26_AWAYPV.jpeg",
    category: "Player Version",
    color: "Away Colors",
    desc: "The 25-26 season away jersey featuring advanced breathable knit."
  },
  {
    id: "club-mci-2526-home",
    name: "MANCHESTER CITY HOME PLAYER VERSION 25-26",
    club: "MANCHESTER CITY",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/MC25-26_HPV.jpeg",
    category: "Player Version",
    color: "Sky Blue",
    desc: "The 25-26 season home jersey engineered for pure matchday performance."
  },
  {
    id: "club-mun-2526-away",
    name: "MANCHESTER UNITED AWAY PLAYER VERSION 25-26",
    club: "MANCHESTER UNITED",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/MU_25-26_APV.jpeg",
    category: "Player Version",
    color: "Away Colors",
    desc: "The 25-26 season away jersey crafted with premium details."
  },
  {
    id: "club-mun-2526-home",
    name: "MANCHESTER UNITED HOME PLAYER VERSION 25-26",
    club: "MANCHESTER UNITED",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/MU_25-26_HPV.jpeg",
    category: "Player Version",
    color: "Red",
    desc: "The 25-26 season home jersey engineered for pure matchday performance."
  },
  {
    id: "club-rm-2526-home",
    name: "REAL MADRID HOME PLAYER VERSION 25-26",
    club: "REAL MADRID CF",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/real_madrid25-26_HPV.jpeg",
    category: "Player Version",
    color: "White",
    desc: "The 25-26 season home jersey crafted with classic elegance."
  },
  {
    id: "club-generic-2526",
    name: "SPECIAL EDITION JERSEY 25-26",
    club: "LIVERPOOL FC",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/jersey1.jpeg",
    category: "Player Version",
    color: "Special",
    desc: "A special edition 25-26 season jersey."
  },
  {
    id: "club-rm-2526-away",
    name: "REAL MADRID AWAY PLAYER VERSION 25-26",
    club: "REAL MADRID CF",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/REAL_MADRID25-26_APV.jpeg",
    category: "Player Version",
    color: "Away Colors",
    desc: "The 25-26 season away jersey crafted with premium details."
  },
  {
    id: "club-psg-2526-away",
    name: "PARIS SAINT-GERMAIN AWAY PLAYER VERSION 25-26",
    club: "PARIS SAINT-GERMAIN",
    price: 799.00,
    priceStr: "₹799.00",
    image: "/images/25-26_club-jerseys/PSG25-26_AWP.jpeg",
    category: "Player Version",
    color: "Away Colors",
    desc: "The 25-26 season away jersey crafted with premium details."
  }
];

export const DOCX_PRODUCTS: Product[] = [
  { id: "docx-1", name: "Germany 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image1.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-2", name: "Argentina 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image2.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-3", name: "Brazil 2026 Away Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image3.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-4", name: "Argentina 2026 Black Edition Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image4.jpeg", category: "Player Version", color: "Black Edition", desc: "Engineered for pure matchday performance." },
  { id: "docx-5", name: "Japan 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image5.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-6", name: "Brazil 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image6.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-7", name: "Spain 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image7.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-8", name: "Belgium 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image8.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-9", name: "Italy 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image9.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-10", name: "Argentina 2026 Away Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image10.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-11", name: "Japan 2026 Away Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image11.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-12", name: "France 2026 Away Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image12.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-13", name: "England 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image13.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-14", name: "England 2026 Away Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image14.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-15", name: "Netherlands 2026 Away Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image15.jpeg", category: "Player Version", color: "Away", desc: "Engineered for pure matchday performance." },
  { id: "docx-16", name: "Portugal 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image16.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." },
  { id: "docx-17", name: "Argentina 2026 Navy Blue Concept Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image17.jpeg", category: "Player Version", color: "Navy Blue Concept", desc: "Engineered for pure matchday performance." },
  { id: "docx-18", name: "Portugal 2026 Black Special Edition Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image18.jpeg", category: "Player Version", color: "Black Special Edition", desc: "Engineered for pure matchday performance." },
  { id: "docx-19", name: "France 2026 Home Player Version", club: "National Team", price: 799.00, priceStr: "₹799.00", image: "/DOCX_JERSEYS/image19.jpeg", category: "Player Version", color: "Home", desc: "Engineered for pure matchday performance." }
];

export const ALL_PRODUCTS: Product[] = [...BEST_SELLERS, ...CLUB_PRODUCTS, ...DOCX_PRODUCTS];

export const CLUBS: Club[] = [
  {
    id: "club-ars",
    name: "ARSENAL FC",
    era: "The Arsenal Archive",
    bgClass: "from-[#101010] to-[#1C1C1C]",
    colorTheme: "#D2BBA0",
    highlight: "Red & Green",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/Arsenal_logo.jpeg",
    logoBg: "#EF0107",
    logoScaleBase: 1.15,
    logoScaleHover: 1.25,
    logoObjectFit: "contain"
  },
  {
    id: "club-barca",
    name: "FC BARCELONA",
    era: "Blaugrana Legacy",
    bgClass: "from-[#004D98] to-[#A50044]",
    colorTheme: "#EDBB00",
    highlight: "Catalan Pride",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/F.CBarcelona_logo.jpeg",
    logoScaleBase: 1.0,
    logoScaleHover: 1.1,
    logoObjectFit: "cover"
  },
  {
    id: "club-lfc",
    name: "LIVERPOOL FC",
    era: "Anfield Glory",
    bgClass: "from-[#C8102E] to-[#60000B]",
    colorTheme: "#F6EB61",
    highlight: "YNWA Spirit",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/L.F.C_Logo.jpeg",
    logoBg: "#C8102E",
    logoScaleBase: 1.20,
    logoScaleHover: 1.30,
    logoObjectFit: "contain"
  },
  {
    id: "club-mci",
    name: "MANCHESTER CITY",
    era: "Cityzens Era",
    bgClass: "from-[#6CABDD] to-[#1C2C5B]",
    colorTheme: "#FFC659",
    highlight: "Sky Blue Dominance",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/Manchester_city.png",
    logoBg: "transparent",
    logoScaleBase: 1.0,
    logoScaleHover: 1.1,
    logoObjectFit: "contain"
  },
  {
    id: "club-mun",
    name: "MANCHESTER UNITED",
    era: "Red Devils Heritage",
    bgClass: "from-[#DA291C] to-[#000000]",
    colorTheme: "#FBE122",
    highlight: "Theatre of Dreams",
    textClass: "text-luxury-ivory",
    image: "/Club_Logos/Manchester_United_logo.jpeg",
    logoBg: "#DA291C",
    logoScaleBase: 1.0,
    logoScaleHover: 1.1,
    logoObjectFit: "contain"
  },
  {
    id: "club-rm",
    name: "REAL MADRID CF",
    era: "Classic Edition",
    bgClass: "from-[#FDFBF7] to-[#ECEAE2]",
    colorTheme: "#9F7E69",
    highlight: "Gold Trim & Crest",
    textClass: "text-luxury-dark",
    image: "/Club_Logos/Real_madrid_logo.png",
    logoBg: "transparent",
    logoScaleBase: 1.0,
    logoScaleHover: 1.1,
    logoObjectFit: "contain"
  }
];

export const FAQS = [
  { q: "Do you deliver all over India?", a: "Yes, we ship football jerseys across all major cities and regions in India. Delivery usually takes 5–10 business days depending on your location." },
  { q: "Can I customize my jersey?", a: "Yes! Selected jerseys are available with custom name & number printing. Please note that customized jerseys are non-returnable, unless the item received is damaged or incorrect." },
  { q: "How can I track my order?", a: "Once your order is confirmed, you’ll receive confirmation updates via email/message. Tracking details are shared as soon as your order is packed and shipped." },
  { q: "What is the difference between Player Version and Fan Version jerseys?", a: "Player Version jerseys come with a slimmer athletic fit and premium performance material, similar to what players wear on the field. Fan Version jerseys offer a more regular and comfortable fit designed for everyday wear." },
  { q: "What should I know before placing an order?", a: "Orders cannot be cancelled once they are processed. If you face any issue regarding damaged or incorrect products feel free to contact us anytime through Instagram DM or at thefutbolstore.in@gmail.com" }
];

export const POLICIES_DATA = {
  "privacy-policy": {
    title: "Privacy Policy",
    subtitle: "How we protect and handle your personal data",
    icon: "Shield",
    sections: [
      {
        title: "Guidelines",
        content: "Your privacy is important to us. We collect customer information such as your name, address, email address, and phone number only for order processing, delivery, customer support, and improving your shopping experience on our website."
      },
      {
        title: "Sharing of Information",
        content: "We do not sell, trade, or share your personal information with third parties except trusted delivery partners and secure payment providers required to complete your order safely and efficiently."
      },
      {
        title: "Consent & Usage",
        content: "By using our website, you consent to the collection and use of your information in accordance with this Privacy Policy."
      },
      {
        title: "Queries & Support",
        content: "For any privacy-related concerns, contact us at thefutbolstore.in@gmail.com."
      }
    ]
  },
  "terms-of-service": {
    title: "Terms of Service",
    subtitle: "Rules and terms governing website usage",
    icon: "FileText",
    sections: [
      {
        title: "Acceptance of Terms",
        content: "By accessing and using this website, you agree to comply with our store policies, terms, and conditions. All content is protected by international copyright laws."
      },
      {
        title: "Product Representation",
        content: "Product images displayed on the website are for aesthetic and reference purposes only. Actual colors and textures may vary slightly due to digital rendering variations."
      },
      {
        title: "Pricing & Availability",
        content: "Prices, availability, and product details are subject to change without prior notice as we source premium player-spec fabrics dynamically."
      },
      {
        title: "Order Discretion",
        content: "We reserve the right to cancel suspicious, fraudulent, duplicate, or incomplete orders at our sole discretion."
      },
      {
        title: "Acceptance",
        content: "Continued use of the website indicates your absolute acceptance of these terms and conditions."
      }
    ]
  },
  "return-policy": {
    title: "Refund, Return, and Cancellation Policy",
    subtitle: "Our policy on returns, exchanges, refunds, and cancellations",
    icon: "RefreshCw",
    sections: [
      {
        title: "Guidelines",
        content: "Customer satisfaction is our priority. If you receive a damaged, defective, or wrong product, please contact us within 24 hours of delivery with clear photos/videos at thefutbolstore.in@gmail.com."
      },
      {
        title: "Returns & Exchanges",
        content: "• Returns are accepted only for damaged or incorrect items.\n• Customized jerseys (name/number printing) are non-returnable unless damaged or incorrect.\n• Items must be unused and in original condition."
      },
      {
        title: "Refunds",
        content: "• Once approved, refunds are processed to the original payment method within 5–7 business days.\n• Shipping charges are non-refundable."
      },
      {
        title: "Cancellations",
        content: "• Orders cannot be cancelled once they have been accepted and processed.\n• Customized jerseys cannot be cancelled once customization or production has started.\n• Cancellation requests are accepted only before the order processing stage begins.\n• In case of duplicate or accidental orders, please contact us immediately for assistance."
      },
      {
        title: "Support",
        content: "For any refund, return, or cancellation queries, contact us at thefutbolstore.in@gmail.com."
      }
    ]
  },
  "shipping-policy": {
    title: "Shipping Policy",
    subtitle: "Shipping, delivery times, and order tracking",
    icon: "Truck",
    sections: [
      {
        title: "Guidelines",
        content: "We provide shipping across all major cities and regions in India."
      },
      {
        title: "Processing Time",
        content: "• Orders are usually processed within 1–3 business days.\n• Customized orders may require additional processing time."
      },
      {
        title: "Order Confirmation",
        content: "• Once your order is successfully placed, you will receive a confirmation email/message.\n• A separate notification will be sent once your order is packed and shipped."
      },
      {
        title: "Delivery Time",
        content: "• Standard delivery generally takes 5–10 business days, depending on your location."
      },
      {
        title: "Tracking Information",
        content: "• Tracking details will be shared through email/message once the order has been shipped."
      }
    ]
  },
  "faqs": {
    title: "Frequently Asked Questions",
    subtitle: "Your queries answered in detail",
    icon: "HelpCircle",
    sections: [
      {
        title: "Do you deliver all over India?",
        content: "Yes, we provide shipping across India."
      },
      {
        title: "How long does delivery take?",
        content: "Orders are usually delivered within 5–10 business days depending on your location."
      },
      {
        title: "Will I receive order confirmation updates?",
        content: "Yes, you will receive an email once your order is confirmed and another update when your order is packed and shipped."
      },
      {
        title: "Can I customize my jersey?",
        content: "Yes, we offer name and number printing on selected jerseys."
      },
      {
        title: "Are customized jerseys returnable?",
        content: "Customized jerseys are non-returnable unless the product received is damaged or incorrect."
      },
      {
        title: "What payment methods do you accept?",
        content: "We accept UPI, Debit/Credit Cards, Net Banking, Wallets, and other secure payment methods."
      },
      {
        title: "How can I track my order?",
        content: "Tracking details will be shared through email or message once your order is shipped."
      },
      {
        title: "Can I cancel my order?",
        content: "Orders cannot be cancelled once they are accepted and processed."
      },
      {
        title: "What should I do if I receive a damaged or wrong product?",
        content: "Please contact us within 48 hours of delivery with clear photos/videos for assistance."
      },
      {
        title: "Do jerseys come with player name printing?",
        content: "Some jerseys come with official-style player printing, while custom printing options are also available on selected products."
      },
      {
        title: "How do I choose the correct size?",
        content: "You can refer to our Size Guide available on the website before placing your order."
      },
      {
        title: "Are these original jerseys?",
        content: "We provide premium imported quality football jerseys inspired by official designs."
      },
      {
        title: "Do Player Version and Fan Version fit differently?",
        content: "Yes. Player Version jerseys have a slimmer athletic fit, while Fan Version jerseys offer a more regular and comfortable fit."
      },
      {
        title: "Will sold-out products restock?",
        content: "Popular products may restock depending on availability. Follow our updates for latest drops and restocks."
      },
      {
        title: "How can I contact customer support?",
        content: "You can reach us through Instagram DM or email at thefutbolstore.in@gmail.com."
      }
    ]
  },
  "accessibility-statement": {
    title: "Accessibility Statement",
    subtitle: "Our commitment to digital accessibility",
    icon: "User",
    sections: [
      {
        title: "Digital Elegance for All",
        content: "The Fútbol Store is committed to ensuring digital accessibility for all users, including individuals with disabilities. We continuously improve the user experience and apply the relevant accessibility standards to our luxury interface."
      },
      {
        title: "Feedback & Assistance",
        content: "We welcome your feedback on the accessibility of our website. If you encounter any barriers or need specialized concierge assistance, please contact us at thefutbolstore.in@gmail.com."
      }
    ]
  }
};
