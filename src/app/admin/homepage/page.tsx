"use client";

import React, { useState, useEffect } from 'react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Save, Loader2, Upload, LayoutGrid, LayoutTemplate, Link as LinkIcon, Image as ImageIcon, Search, Video, Monitor, Smartphone, Tablet, Flag, Shield, Plus, Trash2, Palette, ChevronRight } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/backend/firebase/config';
import { motion } from 'framer-motion';
import HomepageClient from '@/app/HomepageClient';

export default function HomepageManagerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hero' | 'featured' | 'seo' | 'clubs' | 'national' | 'banner' | 'styling' | 'collectionPromo'>('hero');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const defaultNationalTeams = [
    {
      id: 1,
      name: "ARGENTINA",
      sub: "Rinascimento Edition",
      price: "₹999.00",
      link: "/product/bs-1",
      color: "from-[#0F1C3F] to-[#1E3066]",
      badgeColor: "bg-[#D2BBA0]",
      accent: "#D2BBA0",
      jerseyColor: "#0A142F",
      logo: "/NATIONAL_TEAM_LOGO/national_team1.jpeg",
      stripes: "linear-gradient(135deg, rgba(210,187,160,0.1) 0%, rgba(210,187,160,0) 70%)",
      desc: "A stunning celebration of Italian art and footballing pedigree, featuring complex Renaissance fabric engraving and fine gold stitchwork.",
      stats: [
        { title: "Fit", val: "Aero Tailored" },
        { title: "Fabric", val: "Knit Jaquard" },
        { title: "Crest", val: "Gold 3D TPU" }
      ]
    },
    {
      id: 2,
      name: "GERMANY",
      sub: "Ouro Eterno Edition",
      price: "₹949.00",
      link: "/product/bs-3",
      color: "from-[#E6B022] to-[#fd0d00ff]",
      badgeColor: "bg-[#0A5F38]",
      accent: "#0A5F38",
      jerseyColor: "#000000ff",
      logo: "/NATIONAL_TEAM_LOGO/national_team2.jpeg",
      stripes: "repeating-linear-gradient(90deg, rgba(10,95,56,0.03) 0px, rgba(10,95,56,0.03) 10px, transparent 10px, transparent 20px)",
      desc: "Capturing the golden essence of Jogo Bonito. Tailored with a luxury mock collar, hand-stitched detailing, and royal green cuff-ribbing.",
      stats: [
        { title: "Fit", val: "Slim Fit" },
        { title: "Fabric", val: "Breathe Knit" },
        { title: "Crest", val: "Premium Felt" }
      ]
    },
    {
      id: 3,
      name: "BRAZIL",
      sub: "Bleu Impérial Edition",
      price: "₹949.00",
      link: "/product/bs-5",
      color: "from-[#DDB014] to-[#0A5F38]",
      badgeColor: "bg-[#D2BBA0]",
      accent: "#0A5F38",
      jerseyColor: "#DDB014",
      logo: "/NATIONAL_TEAM_LOGO/national_team3.jpeg",
      stripes: "linear-gradient(to right, transparent, rgba(255,238,226,0.05), transparent)",
      desc: "Minimalist French haute-couture meets the pitch. Finished with a subtle tricolour button placket and metallic gold cockerel embroidery.",
      stats: [
        { title: "Fit", val: "Atelier Custom" },
        { title: "Fabric", val: "Fine Piqué" },
        { title: "Crest", val: "18ct Gold Thread" }
      ]
    },
    {
      id: 4,
      name: "SPAIN",
      sub: "La Roja Edition",
      price: "₹949.00",
      link: "/product/bs-2",
      color: "from-[#8B0000] to-[#E2001A]",
      badgeColor: "bg-[#F1BF00]",
      accent: "#F1BF00",
      jerseyColor: "#E2001A",
      logo: "/NATIONAL_TEAM_LOGO/national_team5.png",
      stripes: "linear-gradient(135deg, rgba(241,191,0,0.1) 0%, transparent 70%)",
      desc: "A passionate tribute to Spanish football heritage. Woven with intense crimson threads and adorned with gold crest detailing.",
      stats: [
        { title: "Fit", val: "Slim Fit" },
        { title: "Fabric", val: "Breathe Knit" },
        { title: "Crest", val: "Gold 3D TPU" }
      ]
    },
    {
      id: 5,
      name: "FRANCE",
      sub: "L'Élégance Edition",
      price: "₹999.00",
      link: "/national-teams?team=france",
      color: "from-[#002395] to-[#1434A4]",
      badgeColor: "bg-[#FFFFFF]",
      accent: "#ED2939",
      jerseyColor: "#002395",
      logo: "/NATIONAL_TEAM_LOGO/france_logo.jpg",
      stripes: "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, transparent 50%)",
      desc: "Experience French excellence. A perfect blend of classic Parisian tailoring and modern athletic performance technology.",
      stats: [
        { title: "Fit", val: "Aero Tailored" },
        { title: "Fabric", val: "Performance Knit" },
        { title: "Crest", val: "Premium Gold TPU" }
      ]
    },
    {
      id: 6,
      name: "ENGLAND",
      sub: "Three Lions Edition",
      price: "₹999.00",
      link: "/national-teams?team=england",
      color: "from-[#FFFFFF] to-[#F3F4F6]",
      badgeColor: "bg-[#00247D]",
      accent: "#CE1126",
      jerseyColor: "#FFFFFF",
      logo: "/NATIONAL_TEAM_LOGO/england_logo.png",
      stripes: "linear-gradient(to right, transparent, rgba(206,17,38,0.03), transparent)",
      desc: "Classic English heritage woven into every thread. Clean, crisp white design complemented by bold navy accents and the iconic Three Lions crest.",
      stats: [
        { title: "Fit", val: "Classic Fit" },
        { title: "Fabric", val: "Breathe Elite" },
        { title: "Crest", val: "High-Density Woven" }
      ]
    }
  ];

  const defaultClubs = [
    { id: "club-ars", query: "ARSENAL", name: "ARSENAL FC", image: "/images/25-26_club-jerseys/Arsenal_25-26_Home_Player_Version.jpeg" },
    { id: "club-fcb", query: "BARCELONA", name: "FC BARCELONA", image: "/images/25-26_club-jerseys/FCB_25-26_HPV.jpeg" },
    { id: "club-mci", query: "MANCHESTER CITY", name: "MANCHESTER CITY", image: "/images/25-26_club-jerseys/MC25-26_HPV.jpeg" },
    { id: "club-rm", query: "MADRID", name: "REAL MADRID CF", image: "/images/25-26_club-jerseys/real_madrid25-26_HPV.jpeg" },
  ];

  const defaultBestSellers = [
    { id: "bs-1", name: "SPAIN 2026 AWAY PLAYER", category: "PLAYER VERSION", club: "SPAIN", priceStr: "₹949.00", image: "/NATIONAL_TEAM_LOGO/national_team5.png", link: "" },
    { id: "bs-2", name: "PORTUGAL 2026 AWAY FAN", category: "FAN VERSION", club: "PORTUGAL", priceStr: "₹799.00", image: "/NATIONAL_TEAM_LOGO/national_team4.jpeg", link: "" },
    { id: "bs-3", name: "REAL MADRID 25/26 HOME PLAYER", category: "PLAYER VERSION", club: "REAL MADRID CF", priceStr: "₹999.00", image: "/images/25-26_club-jerseys/real_madrid25-26_HPV.jpeg", link: "" },
    { id: "bs-4", name: "ARGENTINA 2026 AWAY PLAYER", category: "PLAYER VERSION", club: "ARGENTINA", priceStr: "₹999.00", image: "/NATIONAL_TEAM_LOGO/national_team1.jpeg", link: "" },
    { id: "bs-5", name: "MANCHESTER CITY 25/26 AWAY PLAYER", category: "PLAYER VERSION", club: "MANCHESTER CITY", priceStr: "₹999.00", image: "/images/25-26_club-jerseys/MC25-26_HPV.jpeg", link: "" }
  ];

  const [settings, setSettings] = useState({
    banner: {
      enabled: true,
      text: 'Get Flat ₹100 OFF on all orders above ₹999.'
    },
    hero: {
      mediaType: 'video',
      desktopMediaUrl: '/images/Hero_Section_vid.MP4',
      mobileMediaUrl: '/images/Hero_Section_vid.MP4',
      mediaFit: 'cover',
      mediaPosition: 'top',
      mediaPositionCustomX: 50,
      mediaPositionCustomY: 50,
      mediaVolume: 0,
      mediaZoom: 100,
      mobileMediaFit: 'cover',
      mobileMediaPosition: 'top',
      mobileMediaPositionCustomX: 50,
      mobileMediaPositionCustomY: 50,
      mobileMediaZoom: 100,
      title: 'Inspired By Greatness',
      desktopTitle: 'Inspired By Greatness',
      tabletTitle: 'Inspired By Greatness',
      mobileTitle: 'Inspired By Greatness',
      subtitle: 'The Road to Glory Begins Now.',
      ctaText: 'SHOP NOW',
      ctaLink: '/clubs',
      overlayOpacity: 40,
    },
    collectionPromo: {
      enabled: true,
      eyebrow: 'LIMITED TIME ARRIVAL',
      heading1: 'The Road to Glory',
      heading2Italic: 'Begins Now.',
      description: 'Discover the FIFA World Cup 2026 Collection and wear the pride of your nation.',
      ctaText: 'DISCOVER NOW',
      ctaLink: '/national-teams',
      imageUrl: '',
      desktopImageUrl: '',
      mobileImageUrl: ''
    },
    featured: {
      layout: 'carousel',
      sectionTitle: 'Best Sellers',
      itemsCount: 8,
    },
    seo: {
      title: 'THE FÚTBOL STORE | Premium Football Jerseys',
      description: 'Shop the latest and greatest authentic football jerseys from top clubs and national teams.',
      keywords: 'football jerseys, authentic kits, player version, fan version',
    },
    clubs: defaultClubs,
    nationalTeams: defaultNationalTeams,
    bestSellersItems: defaultBestSellers,
    styling: {
      textSize: 100,
      sectionPadding: 100,
      desktopTextSize: 100,
      desktopSectionPadding: 100,
      mobileTextSize: 100,
      mobileSectionPadding: 100,
    },
    nationalTeamsSection: {
      eyebrow: 'GLOBAL TEAMS',
      heading: 'Find Your National Team',
      description: "An immersive journey through the world's most elegant colors. Experience custom tailoring and historical pride in perfect 3D fidelity."
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('homepage_preview_settings', JSON.stringify(settings));
      const iframe = document.getElementById('homepage-preview-iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'UPDATE_HOMEPAGE_SETTINGS',
          settings: settings
        }, '*');
      }
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'homepage');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        if (data.hero && data.hero.backgroundImage && !data.hero.desktopMediaUrl) {
          data.hero.mediaType = 'image';
          data.hero.desktopMediaUrl = data.hero.backgroundImage;
          data.hero.mobileMediaUrl = data.hero.backgroundImage;
        }
        if (data.hero) {
          if (!data.hero.desktopTitle) data.hero.desktopTitle = data.hero.title || 'Inspired By Greatness';
          if (!data.hero.tabletTitle) data.hero.tabletTitle = data.hero.desktopTitle || data.hero.title || 'Inspired By Greatness';
          if (!data.hero.mobileTitle) data.hero.mobileTitle = data.hero.title || 'Inspired By Greatness';
        }
        // Ensure arrays exist
        if (!data.clubs) data.clubs = defaultClubs;
        if (!data.nationalTeams) {
          data.nationalTeams = defaultNationalTeams;
        } else if (data.nationalTeams.length < defaultNationalTeams.length) {
          data.nationalTeams = [...data.nationalTeams, ...defaultNationalTeams.slice(data.nationalTeams.length)];
        }
        if (!data.bestSellersItems) data.bestSellersItems = defaultBestSellers;
        if (!data.banner) data.banner = { enabled: true, text: 'Get Flat ₹100 OFF on all orders above ₹999.' };
        if (!data.styling) data.styling = { textSize: 100, sectionPadding: 100 };
        if (!data.collectionPromo) {
          data.collectionPromo = {
            enabled: false,
            eyebrow: 'LIMITED TIME ARRIVAL',
            heading1: 'The Road to Glory',
            heading2Italic: 'Begins Now.',
            description: 'Discover the FIFA World Cup 2026 Collection and wear the pride of your nation.',
            ctaText: 'DISCOVER NOW',
            ctaLink: '/national-teams',
            imageUrl: '',
            desktopImageUrl: '',
            mobileImageUrl: ''
          };
        } else {
          // If collectionPromo exists but desktop/mobile fields don't, ensure they exist
          if (!data.collectionPromo.desktopImageUrl) data.collectionPromo.desktopImageUrl = '';
          if (!data.collectionPromo.mobileImageUrl) data.collectionPromo.mobileImageUrl = '';
        }

        if (!data.nationalTeamsSection) {
          data.nationalTeamsSection = {
            eyebrow: 'GLOBAL TEAMS',
            heading: 'Find Your National Team',
            description: "An immersive journey through the world's most elegant colors. Experience custom tailoring and historical pride in perfect 3D fidelity."
          };
        }

        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching homepage settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'homepage');
      await setDoc(docRef, settings);

      // Revalidate the homepage cache
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' })
      });

      alert('Homepage settings saved successfully!');
    } catch (error) {
      console.error("Error saving homepage settings:", error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setterCallback: (url: string) => void, uploadId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(uploadId);
    try {
      const dbService = new FirebaseDatabaseService();
      const url = await dbService.uploadProductImage(file);
      setterCallback(url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. " + (err instanceof Error ? err.message : ''));
    } finally {
      setUploading(null);
      // Reset input so the same file can be selected again
      e.target.value = '';
    }
  };

  // --- Change Handlers ---
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      banner: {
        ...prev.banner,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleStylingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      styling: {
        ...prev.styling,
        [name]: parseInt(value) || 100
      }
    }));
  };

  const handleHeroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, [name]: value } }));
  };
  const setHeroMediaType = (type: 'video' | 'image') => {
    setSettings(prev => ({ ...prev, hero: { ...prev.hero, mediaType: type } }));
  };

  const handleFeaturedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, featured: { ...prev.featured, [name]: value } }));
  };
  const setFeaturedLayout = (layout: 'grid' | 'carousel') => {
    setSettings(prev => ({ ...prev, featured: { ...prev.featured, layout } }));
  };

  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, seo: { ...prev.seo, [name]: value } }));
  };

  const handleCollectionPromoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings(prev => ({ ...prev, collectionPromo: { ...prev.collectionPromo, [name]: type === 'checkbox' ? checked : value } }));
  };

  const handleClubChange = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const newClubs = [...prev.clubs];
      newClubs[index] = { ...newClubs[index], [field]: value };
      return { ...prev, clubs: newClubs };
    });
  };

  const handleAddClub = () => {
    setSettings(prev => ({
      ...prev,
      clubs: [...prev.clubs, { id: `club-${Date.now()}`, query: "", name: "", image: "" }]
    }));
  };

  const handleRemoveClub = (index: number) => {
    if (!confirm("Are you sure you want to remove this club card?")) return;
    setSettings(prev => {
      const newClubs = [...prev.clubs];
      newClubs.splice(index, 1);
      return { ...prev, clubs: newClubs };
    });
  };

  const handleNationalTeamChange = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const newTeams = [...prev.nationalTeams];
      newTeams[index] = { ...newTeams[index], [field]: value };
      return { ...prev, nationalTeams: newTeams };
    });
  };

  const handleBestSellerChange = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const newBS = [...prev.bestSellersItems];
      newBS[index] = { ...newBS[index], [field]: value };
      return { ...prev, bestSellersItems: newBS };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Common Save Button for reuse in tabs
  const SaveButton = () => (
    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors font-bold text-sm disabled:opacity-70 shadow-lg hover:shadow-xl"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save & Publish Changes'}
      </button>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black mb-1">Homepage Manager</h1>
          <p className="text-gray-500 text-sm">Control the content, layout, and SEO of your storefront.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors font-bold text-sm disabled:opacity-70 shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Publish Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar Nav */}
        <div className="w-full lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2 flex flex-col gap-1 sticky top-8">
            <button
              onClick={() => setActiveTab('hero')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'hero' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <ImageIcon className="w-4 h-4" /> Hero Section
            </button>
            <button
              onClick={() => setActiveTab('banner')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'banner' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Promo Banner
            </button>
            <button
              onClick={() => setActiveTab('collectionPromo')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'collectionPromo' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Collection Promo
            </button>
            <button
              onClick={() => setActiveTab('clubs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'clubs' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Shield className="w-4 h-4" /> Shop By Clubs
            </button>
            <button
              onClick={() => setActiveTab('national')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'national' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Flag className="w-4 h-4" /> National Teams
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'featured' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Best Sellers
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'seo' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Search className="w-4 h-4" /> SEO & Meta
            </button>
            <button
              onClick={() => setActiveTab('styling')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${activeTab === 'styling' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <Palette className="w-4 h-4" /> Styling & Layout
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">

          {/* Hero Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

              {/* Media Configuration */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Hero Background Media</h2>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Media Type</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setHeroMediaType('image')} className={`flex items-center justify-center gap-3 py-3 border-2 rounded-lg font-bold transition-colors ${settings.hero.mediaType === 'image' ? 'border-black bg-gray-50 text-black' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      <ImageIcon className="w-5 h-5" /> Image
                    </button>
                    <button onClick={() => setHeroMediaType('video')} className={`flex items-center justify-center gap-3 py-3 border-2 rounded-lg font-bold transition-colors ${settings.hero.mediaType === 'video' ? 'border-black bg-gray-50 text-black' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      <Video className="w-5 h-5" /> Video
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      <Monitor className="w-4 h-4" /> Desktop Media URL
                    </label>
                    <div className="flex gap-2">
                      <input type="text" name="desktopMediaUrl" value={settings.hero.desktopMediaUrl} onChange={handleHeroChange} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                      <label className="cursor-pointer flex items-center justify-center bg-gray-100 border border-gray-200 px-4 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                        {uploading === 'hero-desktop' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, (url) => setSettings(p => ({ ...p, hero: { ...p.hero, desktopMediaUrl: url } })), 'hero-desktop')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      <Smartphone className="w-4 h-4" /> Mobile Media URL
                    </label>
                    <div className="flex gap-2">
                      <input type="text" name="mobileMediaUrl" value={settings.hero.mobileMediaUrl} onChange={handleHeroChange} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                      <label className="cursor-pointer flex items-center justify-center bg-gray-100 border border-gray-200 px-4 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                        {uploading === 'hero-mobile' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileUpload(e, (url) => setSettings(p => ({ ...p, hero: { ...p.hero, mobileMediaUrl: url } })), 'hero-mobile')} />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Optional. If empty, desktop media will be used.</p>
                  </div>
                </div>
                {/* DESKTOP CONFIGURATION */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-black border-b border-gray-200 pb-2 mb-4 flex items-center gap-2"><Monitor className="w-4 h-4"/> Desktop Tweaks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Media Fit</label>
                      <select name="mediaFit" value={settings.hero.mediaFit || 'cover'} onChange={handleHeroChange} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:border-gray-400 transition-all">
                        <option value="cover">Cover (Fills Area, May Crop)</option>
                        <option value="contain">Contain (Shows Full Video)</option>
                        <option value="none">Manual (Original Size)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">X Offset (Horizontal): {settings.hero.mediaPositionCustomX ?? 50}%</label>
                      <input 
                        type="range" 
                        name="mediaPositionCustomX" 
                        min="0" max="100" 
                        value={settings.hero.mediaPositionCustomX ?? 50} 
                        onChange={(e) => {
                          handleHeroChange(e);
                          setSettings(prev => ({ ...prev, hero: { ...prev.hero, mediaPosition: 'custom' } }));
                        }} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Y Offset (Vertical): {settings.hero.mediaPositionCustomY ?? 50}%</label>
                      <input 
                        type="range" 
                        name="mediaPositionCustomY" 
                        min="0" max="100" 
                        value={settings.hero.mediaPositionCustomY ?? 50} 
                        onChange={(e) => {
                          handleHeroChange(e);
                          setSettings(prev => ({ ...prev, hero: { ...prev.hero, mediaPosition: 'custom' } }));
                        }} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Desktop Media Zoom: {settings.hero.mediaZoom ?? 100}%
                    </label>
                    <input type="range" name="mediaZoom" min="100" max="300" value={settings.hero.mediaZoom ?? 100} onChange={handleHeroChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                  </div>
                </div>

                {/* MOBILE CONFIGURATION */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4 mt-6">
                  <h3 className="text-sm font-bold text-black border-b border-gray-200 pb-2 mb-4 flex items-center gap-2"><Smartphone className="w-4 h-4"/> Mobile Tweaks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mobile Fit</label>
                      <select name="mobileMediaFit" value={settings.hero.mobileMediaFit || settings.hero.mediaFit || 'cover'} onChange={handleHeroChange} className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:border-gray-400 transition-all">
                        <option value="cover">Cover (Fills Area, May Crop)</option>
                        <option value="contain">Contain (Shows Full Video)</option>
                        <option value="none">Manual (Original Size)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-lg border border-gray-200 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">X Offset (Horizontal): {settings.hero.mobileMediaPositionCustomX ?? settings.hero.mediaPositionCustomX ?? 50}%</label>
                      <input 
                        type="range" 
                        name="mobileMediaPositionCustomX" 
                        min="0" max="100" 
                        value={settings.hero.mobileMediaPositionCustomX ?? settings.hero.mediaPositionCustomX ?? 50} 
                        onChange={(e) => {
                          handleHeroChange(e);
                          setSettings(prev => ({ ...prev, hero: { ...prev.hero, mobileMediaPosition: 'custom' } }));
                        }} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Y Offset (Vertical): {settings.hero.mobileMediaPositionCustomY ?? settings.hero.mediaPositionCustomY ?? 50}%</label>
                      <input 
                        type="range" 
                        name="mobileMediaPositionCustomY" 
                        min="0" max="100" 
                        value={settings.hero.mobileMediaPositionCustomY ?? settings.hero.mediaPositionCustomY ?? 50} 
                        onChange={(e) => {
                          handleHeroChange(e);
                          setSettings(prev => ({ ...prev, hero: { ...prev.hero, mobileMediaPosition: 'custom' } }));
                        }} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Mobile Media Zoom: {settings.hero.mobileMediaZoom ?? settings.hero.mediaZoom ?? 100}%
                    </label>
                    <input type="range" name="mobileMediaZoom" min="100" max="300" value={settings.hero.mobileMediaZoom ?? settings.hero.mediaZoom ?? 100} onChange={handleHeroChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                  </div>
                </div>

                {settings.hero.mediaType === 'video' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Video Volume: {settings.hero.mediaVolume ?? 0}%
                    </label>
                    <input type="range" name="mediaVolume" min="0" max="100" value={settings.hero.mediaVolume ?? 0} onChange={handleHeroChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                    <p className="text-[10px] text-gray-500 mt-1">If volume is 0%, the video is muted and will reliably autoplay. Unmuted videos may be blocked from autoplaying by some browsers.</p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Dark Overlay Opacity: {settings.hero.overlayOpacity}%</label>
                  <input type="range" name="overlayOpacity" min="0" max="100" value={settings.hero.overlayOpacity} onChange={handleHeroChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black" />
                </div>
              </div>

              {/* Text & Content */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Hero Content</h2>
                
                <div className="space-y-4 bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-200 pb-2 flex items-center justify-between">
                    <span>Hero Section Headings (Per Device)</span>
                    <span className="text-[11px] font-normal text-gray-500 lowercase">custom headings for phone, tab & laptop</span>
                  </h3>
                  
                  {/* Laptop / Desktop Heading */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      <Monitor className="w-4 h-4 text-black" /> Laptop / Desktop Heading
                    </label>
                    <input 
                      type="text" 
                      name="desktopTitle" 
                      value={settings.hero.desktopTitle ?? settings.hero.title ?? ''} 
                      onChange={(e) => {
                        handleHeroChange(e);
                        setSettings(prev => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            desktopTitle: e.target.value,
                            title: e.target.value
                          }
                        }));
                      }} 
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:border-gray-400 transition-all font-serif" 
                      placeholder="Inspired By Greatness"
                    />
                  </div>

                  {/* Tablet / Tab Heading */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      <Tablet className="w-4 h-4 text-black" /> Tab / Tablet Heading
                    </label>
                    <input 
                      type="text" 
                      name="tabletTitle" 
                      value={settings.hero.tabletTitle ?? settings.hero.desktopTitle ?? settings.hero.title ?? ''} 
                      onChange={handleHeroChange} 
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:border-gray-400 transition-all font-serif" 
                      placeholder="Inspired By Greatness"
                    />
                  </div>

                  {/* Phone / Mobile Heading */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      <Smartphone className="w-4 h-4 text-black" /> Phone / Mobile Heading
                    </label>
                    <input 
                      type="text" 
                      name="mobileTitle" 
                      value={settings.hero.mobileTitle ?? settings.hero.title ?? ''} 
                      onChange={handleHeroChange} 
                      className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:border-gray-400 transition-all font-serif" 
                      placeholder="Inspired By Greatness"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Subtitle</label>
                  <input type="text" name="subtitle" value={settings.hero.subtitle} onChange={handleHeroChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Button Text</label>
                    <input type="text" name="ctaText" value={settings.hero.ctaText} onChange={handleHeroChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Button Link</label>
                    <input type="text" name="ctaLink" value={settings.hero.ctaLink} onChange={handleHeroChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                  </div>
                </div>
                <SaveButton />
              </div>
            </div>
          )}

          {/* Collection Promo Tab */}
          {activeTab === 'collectionPromo' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-2">
                  <h2 className="text-base font-bold text-black">Collection Promo Section</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-bold text-gray-700">Enable Section</span>
                    <input type="checkbox" name="enabled" checked={settings.collectionPromo.enabled} onChange={handleCollectionPromoChange} className="w-4 h-4 accent-black" />
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Eyebrow Text</label>
                      <input type="text" name="eyebrow" value={settings.collectionPromo.eyebrow} onChange={handleCollectionPromoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Heading Line 1</label>
                      <input type="text" name="heading1" value={settings.collectionPromo.heading1} onChange={handleCollectionPromoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Heading Line 2 (Italic)</label>
                      <input type="text" name="heading2Italic" value={settings.collectionPromo.heading2Italic} onChange={handleCollectionPromoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description</label>
                      <textarea name="description" value={settings.collectionPromo.description} onChange={handleCollectionPromoChange} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all resize-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Desktop Image URL</label>
                      <div className="flex gap-2">
                        <input type="text" name="desktopImageUrl" value={settings.collectionPromo.desktopImageUrl || settings.collectionPromo.imageUrl || ''} onChange={handleCollectionPromoChange} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                        <label className="cursor-pointer flex items-center justify-center bg-gray-100 border border-gray-200 px-4 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                          {uploading === 'collection-promo-desktop' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setSettings(p => ({ ...p, collectionPromo: { ...p.collectionPromo, desktopImageUrl: url } })), 'collection-promo-desktop')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Mobile Image URL</label>
                      <div className="flex gap-2">
                        <input type="text" name="mobileImageUrl" value={settings.collectionPromo.mobileImageUrl || settings.collectionPromo.imageUrl || ''} onChange={handleCollectionPromoChange} className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                        <label className="cursor-pointer flex items-center justify-center bg-gray-100 border border-gray-200 px-4 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors">
                          {uploading === 'collection-promo-mobile' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => setSettings(p => ({ ...p, collectionPromo: { ...p.collectionPromo, mobileImageUrl: url } })), 'collection-promo-mobile')} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">CTA Button Text</label>
                      <input type="text" name="ctaText" value={settings.collectionPromo.ctaText} onChange={handleCollectionPromoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">CTA Button Link</label>
                      <input type="text" name="ctaLink" value={settings.collectionPromo.ctaLink} onChange={handleCollectionPromoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                    </div>
                  </div>
                </div>

                <SaveButton />
              </div>
            </div>
          )}

          {/* Clubs Tab */}
          {activeTab === 'clubs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3 mb-2">Shop By Clubs ({settings.clubs.length} Cards)</h2>
                  <p className="text-sm text-gray-500 mb-6">These are the club cards displayed in the dark luxury section on the homepage.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {settings.clubs.map((club, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">Card {index + 1}</span>
                        <button onClick={() => handleRemoveClub(index)} className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors" title="Remove Club">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Club Name</label>
                        <input type="text" value={club.name} onChange={(e) => handleClubChange(index, 'name', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Search Query (Link filter)</label>
                        <input type="text" value={club.query} onChange={(e) => handleClubChange(index, 'query', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        <p className="text-[10px] text-gray-500 mt-1">Example: ARSENAL. Link becomes /clubs?club=ARSENAL</p>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                        <div className="flex gap-2">
                          <input type="text" value={club.image} onChange={(e) => handleClubChange(index, 'image', e.target.value)} className="flex-1 border-gray-300 rounded-md p-2 text-sm" />
                          <label className="cursor-pointer flex items-center justify-center bg-gray-200 px-3 rounded-md text-xs font-bold hover:bg-gray-300 transition-colors">
                            {uploading === `club-${index}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleClubChange(index, 'image', url), `club-${index}`)} />
                          </label>
                        </div>
                        {club.image && <img src={club.image} alt={club.name} className="mt-2 w-full h-32 object-cover rounded-md border border-gray-200 shadow-inner" />}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  onClick={handleAddClub}
                  className="mt-6 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 cursor-pointer transition-all text-gray-600 hover:text-black group"
                >
                  <Plus className="w-6 h-6 mb-2 text-gray-400 group-hover:text-black transition-colors" />
                  <span className="text-sm font-bold">Add Another Club</span>
                </div>
                <SaveButton />
              </div>
            </div>
          )}

          {/* National Teams Tab */}
          {activeTab === 'national' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                
                {/* Heading Configuration */}
                <div>
                  <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3 mb-2">Section Headings</h2>
                  <p className="text-sm text-gray-500 mb-6">Customize the title and description for the National Teams section.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Eyebrow Text (Small Top Text)</label>
                      <input 
                        type="text" 
                        value={settings.nationalTeamsSection?.eyebrow ?? 'GLOBAL TEAMS'} 
                        onChange={(e) => setSettings(prev => ({ ...prev, nationalTeamsSection: { ...prev.nationalTeamsSection, eyebrow: e.target.value } }))} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Main Heading</label>
                      <input 
                        type="text" 
                        value={settings.nationalTeamsSection?.heading ?? 'Find Your National Team'} 
                        onChange={(e) => setSettings(prev => ({ ...prev, nationalTeamsSection: { ...prev.nationalTeamsSection, heading: e.target.value } }))} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description / Subtitle</label>
                      <textarea 
                        value={settings.nationalTeamsSection?.description ?? "An immersive journey through the world's most elegant colors. Experience custom tailoring and historical pride in perfect 3D fidelity."} 
                        onChange={(e) => setSettings(prev => ({ ...prev, nationalTeamsSection: { ...prev.nationalTeamsSection, description: e.target.value } }))} 
                        rows={2} 
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3 mb-2">National Teams 3D Carousel (6 Cards)</h2>
                  <p className="text-sm text-gray-500 mb-6">Edit the 6 jerseys shown in the 3D rotating section.</p>
                </div>

                <div className="space-y-8">
                  {settings.nationalTeams.map((team, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4 shadow-sm">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">Team {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Country Name</label>
                          <input type="text" value={team.name} onChange={(e) => handleNationalTeamChange(index, 'name', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Edition Subtitle</label>
                          <input type="text" value={team.sub} onChange={(e) => handleNationalTeamChange(index, 'sub', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Logo URL (Floating Center Image)</label>
                          <div className="flex gap-2">
                            <input type="text" value={team.logo} onChange={(e) => handleNationalTeamChange(index, 'logo', e.target.value)} className="flex-1 border-gray-300 rounded-md p-2 text-sm" />
                            <label className="cursor-pointer flex items-center justify-center bg-gray-200 px-3 rounded-md text-xs font-bold hover:bg-gray-300 transition-colors">
                              {uploading === `nat-${index}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleNationalTeamChange(index, 'logo', url), `nat-${index}`)} />
                            </label>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">Should be a transparent PNG or high quality image</p>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Product Link</label>
                          <input type="text" value={team.link} onChange={(e) => handleNationalTeamChange(index, 'link', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                          <textarea value={team.desc} onChange={(e) => handleNationalTeamChange(index, 'desc', e.target.value)} rows={2} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                      </div>
                      <div className="flex justify-center bg-gray-100 rounded-lg p-2 mt-2">
                        {team.logo && <img src={team.logo} alt={team.name} className="w-16 h-16 rounded-full shadow-lg border-2 border-white object-cover" />}
                      </div>
                    </div>
                  ))}
                </div>
                <SaveButton />
              </div>
            </div>
          )}

          {/* Featured Tab (Best Sellers) */}
          {activeTab === 'featured' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3 mb-2">Best Sellers (5 Cards)</h2>
                  <p className="text-sm text-gray-500 mb-6">Edit the 5 jerseys shown in the Best Sellers horizontal scrolling section on the homepage.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {settings.bestSellersItems.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded">Card {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                          <input type="text" value={item.name} onChange={(e) => handleBestSellerChange(index, 'name', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Category (e.g. PLAYER VERSION)</label>
                          <input type="text" value={item.category} onChange={(e) => handleBestSellerChange(index, 'category', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Club/Nation Name</label>
                          <input type="text" value={item.club} onChange={(e) => handleBestSellerChange(index, 'club', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Price String (e.g. ₹999.00)</label>
                          <input type="text" value={item.priceStr} onChange={(e) => handleBestSellerChange(index, 'priceStr', e.target.value)} className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Product Link (Optional)</label>
                          <input type="text" value={item.link || ''} onChange={(e) => handleBestSellerChange(index, 'link', e.target.value)} placeholder="/product/some-id or /national-teams?team=..." className="w-full border-gray-300 rounded-md p-2 text-sm" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                          <div className="flex gap-2">
                            <input type="text" value={item.image} onChange={(e) => handleBestSellerChange(index, 'image', e.target.value)} className="flex-1 border-gray-300 rounded-md p-2 text-sm" />
                            <label className="cursor-pointer flex items-center justify-center bg-gray-200 px-3 rounded-md text-xs font-bold hover:bg-gray-300 transition-colors">
                              {uploading === `bs-${index}` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleBestSellerChange(index, 'image', url), `bs-${index}`)} />
                            </label>
                          </div>
                          {item.image && <img src={item.image} alt={item.name} className="mt-2 h-32 object-contain bg-white rounded-md border border-gray-200" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <SaveButton />
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Search Engine Optimization</h2>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Meta Title</label>
                  <input type="text" name="title" value={settings.seo.title} onChange={handleSeoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Meta Description</label>
                  <textarea name="description" value={settings.seo.description} onChange={handleSeoChange} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Meta Keywords</label>
                  <input type="text" name="keywords" value={settings.seo.keywords} onChange={handleSeoChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all" />
                </div>
                <SaveButton />
              </div>
            </div>
          )}

          {/* Banner Tab */}
          {activeTab === 'banner' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3">Promo Banner Configuration</h2>

                <div className="flex items-center gap-3 mb-6">
                  <input
                    type="checkbox"
                    id="bannerEnabled"
                    name="enabled"
                    checked={settings.banner.enabled}
                    onChange={handleBannerChange}
                    className="w-5 h-5 accent-black cursor-pointer rounded border-gray-300"
                  />
                  <label htmlFor="bannerEnabled" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                    Enable Promo Banner
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Banner Text</label>
                  <input
                    type="text"
                    name="text"
                    value={settings.banner.text}
                    onChange={handleBannerChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-black outline-none focus:bg-white focus:border-gray-400 transition-all"
                    placeholder="e.g. Get Flat ₹100 OFF on all orders above ₹999."
                  />
                  <p className="text-xs text-gray-500 mt-2">This text will scroll horizontally at the top of the homepage.</p>
                </div>

                {/* Live Preview of Banner */}
                {settings.banner.enabled && (
                  <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden relative bg-black">
                    <style>{`
                      @keyframes marquee {
                        0% { transform: translateX(0%); }
                        100% { transform: translateX(-50%); }
                      }
                      .animate-marquee {
                        animation: marquee 20s linear infinite;
                      }
                    `}</style>
                    <div className="bg-luxury-dark text-luxury-ivory py-2 overflow-hidden flex whitespace-nowrap">
                      <div className="animate-marquee px-4 font-sans text-xs md:text-sm tracking-widest uppercase font-semibold">
                        {settings.banner.text} &nbsp; • &nbsp; {settings.banner.text} &nbsp; • &nbsp; {settings.banner.text} &nbsp; • &nbsp; {settings.banner.text}
                      </div>
                    </div>
                  </div>
                )}

                <SaveButton />
              </div>
            </div>
          )}

          {/* Styling & Layout Tab */}
          {activeTab === 'styling' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-base font-bold text-black border-b border-gray-100 pb-3 mb-2">Styling & Layout Controls</h2>
                  <p className="text-sm text-gray-500 mb-6">Adjust the overall text sizes and section spacing for the storefront homepage. Changes apply globally across the homepage.</p>
                </div>

                <div className="space-y-8">
                  
                  {/* Desktop Styling */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-6">
                    <h3 className="text-sm font-bold text-black border-b border-gray-200 pb-2 flex items-center gap-2"><Monitor className="w-4 h-4"/> Desktop Styling</h3>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Desktop Text Size Scaling</label>
                        <span className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-full">{settings.styling?.desktopTextSize ?? settings.styling?.textSize ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        name="desktopTextSize"
                        min="80"
                        max="150"
                        step="5"
                        value={settings.styling?.desktopTextSize ?? settings.styling?.textSize ?? 100}
                        onChange={handleStylingChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Desktop Section Padding</label>
                        <span className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-full">{settings.styling?.desktopSectionPadding ?? settings.styling?.sectionPadding ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        name="desktopSectionPadding"
                        min="50"
                        max="200"
                        step="10"
                        value={settings.styling?.desktopSectionPadding ?? settings.styling?.sectionPadding ?? 100}
                        onChange={handleStylingChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  </div>

                  {/* Mobile Styling */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-6">
                    <h3 className="text-sm font-bold text-black border-b border-gray-200 pb-2 flex items-center gap-2"><Smartphone className="w-4 h-4"/> Mobile Styling</h3>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Text Size Scaling</label>
                        <span className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-full">{settings.styling?.mobileTextSize ?? settings.styling?.textSize ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        name="mobileTextSize"
                        min="80"
                        max="150"
                        step="5"
                        value={settings.styling?.mobileTextSize ?? settings.styling?.textSize ?? 100}
                        onChange={handleStylingChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile Section Padding</label>
                        <span className="text-sm font-bold text-black bg-gray-100 px-3 py-1 rounded-full">{settings.styling?.mobileSectionPadding ?? settings.styling?.sectionPadding ?? 100}%</span>
                      </div>
                      <input
                        type="range"
                        name="mobileSectionPadding"
                        min="50"
                        max="200"
                        step="10"
                        value={settings.styling?.mobileSectionPadding ?? settings.styling?.sectionPadding ?? 100}
                        onChange={handleStylingChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  </div>

                </div>

                <SaveButton />
              </div>
            </div>
          )}

        </div>
        <div className="w-full lg:w-[480px] flex-shrink-0 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-8">
            <div className="bg-gray-50 border-b border-gray-200 p-3 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Storefront Preview</span>
                <span className="text-[10px] text-gray-400">Scroll to view full page</span>
              </div>
              <div className="flex bg-white rounded border border-gray-200">
                <button onClick={() => setPreviewDevice('desktop')} className={`p-1.5 ${previewDevice === 'desktop' ? 'bg-gray-200 text-black' : 'text-gray-400 hover:text-black'}`} title="Desktop View">
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setPreviewDevice('mobile')} className={`p-1.5 ${previewDevice === 'mobile' ? 'bg-gray-200 text-black' : 'text-gray-400 hover:text-black'}`} title="Mobile View">
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport container */}
            <div className="bg-gray-100 p-4 flex justify-start sm:justify-center overflow-x-auto w-full">
              <div 
                className={`bg-white relative transition-all duration-300 shadow-xl border-gray-900 overflow-hidden shrink-0 ${
                  previewDevice === 'desktop' 
                    ? 'w-[448px] h-[650px]' 
                    : 'w-[320px] h-[600px] rounded-[36px] border-[10px]'
                }`}
              >
                <iframe 
                  id="homepage-preview-iframe"
                  src="/?preview=true"
                  className={`border-none origin-top-left ${
                    previewDevice === 'desktop'
                      ? 'w-[1280px] h-[1857px] scale-[0.35]'
                      : 'w-[375px] h-[725px] scale-[0.8]'
                  }`}
                  style={{
                    pointerEvents: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

