import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Facebook,
  Flag,
  Home as HomeIcon,
  Instagram,
  LandPlot,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";

const logo = "/manus-storage/AandO_37864f82.jpeg";
const whatsappNumber = "256700123456";

type Property = {
  id: string;
  status: "For Sale" | "For Rent";
  type: "House" | "Apartment" | "Land" | "Commercial";
  price: string;
  priceValue: number;
  title: string;
  meta: string;
  location: string;
  image: string;
  images: string[];
  description: string;
  seller: string;
  sellerPhone: string;
};

const categories = [
  { eyebrow: "LAND & ACREAGE", title: "Land for sale", description: "Residential plots, agricultural land, commercial and investment acreage.", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85", icon: LandPlot },
  { eyebrow: "HOMES", title: "Houses for sale", description: "Family homes, villas, apartments and newly constructed houses.", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=85", icon: HomeIcon },
  { eyebrow: "FLEXIBLE LIVING", title: "Rentals", description: "Apartments, single rooms, furnished homes and commercial rentals.", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85", icon: Sparkles },
  { eyebrow: "BUSINESS SPACES", title: "Commercial property", description: "Offices, shops, warehouses and commercial buildings for sale or rent.", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85", icon: Building2 },
];

const properties: Property[] = [
  { id: "kisaasi-apartment", status: "For Rent", type: "Apartment", price: "UGX 1,200,000 / month", priceValue: 1200000, title: "2 Bedroom Apartment — Kisaasi", meta: "2 Beds   2 Baths   1,200 Sqft", location: "Kisaasi, Kampala", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=88", images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=88"], description: "A bright, well-kept apartment with generous living spaces, secure parking and easy access to Kisaasi amenities.", seller: "Sarah Namusoke", sellerPhone: "256700123456" },
  { id: "bwebajja-house", status: "For Rent", type: "House", price: "UGX 2,000,000 / month", priceValue: 2000000, title: "3 Bedroom House — Bwebajja", meta: "3 Beds   3 Baths   2,500 Sqft", location: "Bwebajja, Wakiso", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1000&q=88", images: ["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=88"], description: "A comfortable family home in a quiet Bwebajja neighborhood with a private yard and modern finishes.", seller: "A&O Verified Agent", sellerPhone: "256700123456" },
  { id: "kololo-house", status: "For Sale", type: "House", price: "UGX 850,000,000", priceValue: 850000000, title: "4 Bedroom House — Kololo", meta: "4 Beds   4 Baths   3,500 Sqft", location: "Kololo, Kampala", image: "https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1000&q=88", images: ["https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=88"], description: "A polished four-bedroom residence in one of Kampala's most established neighborhoods, with spacious entertaining areas.", seller: "Michael Okello", sellerPhone: "256700123456" },
  { id: "mukono-land", status: "For Sale", type: "Land", price: "UGX 120,000,000", priceValue: 120000000, title: "50 Acres Agricultural Land", meta: "50 Acres   Freehold   Road Access", location: "Mukono", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=88", images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=88"], description: "Productive acreage with road access and a freehold title, suitable for farming or long-term investment.", seller: "A&O Land Desk", sellerPhone: "256700123456" },
  { id: "ntinda-commercial", status: "For Sale", type: "Commercial", price: "UGX 2,500,000,000", priceValue: 2500000000, title: "Commercial Building — Ntinda", meta: "12 Rooms   6 Baths   5,000 Sqft", location: "Ntinda, Kampala", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=88", images: ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=88", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=88"], description: "A high-visibility commercial building in Ntinda with flexible rooms for office, retail or professional use.", seller: "A&O Commercial Desk", sellerPhone: "256700123456" },
];

const locations = [
  ["Kampala", "1,245 properties", "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?auto=format&fit=crop&w=700&q=82"],
  ["Entebbe", "412 properties", "https://images.unsplash.com/photo-1507525428034-b723cf4d019e?auto=format&fit=crop&w=700&q=82"],
  ["Mukono", "356 properties", "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=700&q=82"],
  ["Jinja", "289 properties", "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=82"],
  ["Kira", "276 properties", "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=700&q=82"],
  ["Nansana", "198 properties", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=700&q=82"],
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function whatsappUrl(property: Property) {
  return `https://wa.me/${property.sellerPhone}?text=${encodeURIComponent(`Hello ${property.seller}, I'm interested in ${property.title} in ${property.location}. Is it still available?`)}`;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [searchType, setSearchType] = useState("Any type");
  const [searchPrice, setSearchPrice] = useState("Any price");
  const [statusFilter, setStatusFilter] = useState("All listings");
  const [typeFilter, setTypeFilter] = useState("All property types");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [reportProperty, setReportProperty] = useState<Property | null>(null);
  const [propertyPrice, setPropertyPrice] = useState(850000000);
  const [downPayment, setDownPayment] = useState(170000000);
  const [interestRate, setInterestRate] = useState(16);
  const [term, setTerm] = useState(15);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem("ao-favourites") || "[]")); } catch { setSaved([]); }
  }, []);

  useEffect(() => {
    localStorage.setItem("ao-favourites", JSON.stringify(saved));
  }, [saved]);

  const filteredProperties = useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase();
    return properties.filter((property) => {
      const matchesLocation = !normalizedLocation || `${property.location} ${property.title}`.toLowerCase().includes(normalizedLocation);
      const matchesType = searchType === "Any type" || property.type === searchType;
      const matchesPrice = searchPrice === "Any price" || (searchPrice === "Under UGX 500M" ? property.priceValue < 500000000 : searchPrice === "UGX 500M – 1B" ? property.priceValue >= 500000000 && property.priceValue <= 1000000000 : property.priceValue > 1000000000);
      const matchesStatus = statusFilter === "All listings" || property.status === statusFilter;
      const matchesPanelType = typeFilter === "All property types" || property.type === typeFilter;
      const matchesMin = !minPrice || property.priceValue >= Number(minPrice);
      const matchesMax = !maxPrice || property.priceValue <= Number(maxPrice);
      const matchesSaved = !showSavedOnly || saved.includes(property.id);
      return matchesLocation && matchesType && matchesPrice && matchesStatus && matchesPanelType && matchesMin && matchesMax && matchesSaved;
    });
  }, [location, searchType, searchPrice, statusFilter, typeFilter, minPrice, maxPrice, saved, showSavedOnly]);

  const monthly = useMemo(() => {
    const principal = Math.max(0, propertyPrice - downPayment);
    const months = term * 12;
    const rate = interestRate / 100 / 12;
    if (!rate) return Math.round(principal / months);
    return Math.round((principal * rate * (1 + rate) ** months) / ((1 + rate) ** months - 1));
  }, [propertyPrice, downPayment, interestRate, term]);
  const loanAmount = Math.max(0, propertyPrice - downPayment);
  const totalInterest = Math.max(0, monthly * term * 12 - loanAmount);
  const money = (n: number) => `UGX ${Math.round(n).toLocaleString("en-US")}`;

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    setShowSavedOnly(false);
    toast.success(`${filteredProperties.length} ${filteredProperties.length === 1 ? "property" : "properties"} match your search`);
    scrollToId("listings");
  };

  const submitInquiry = (e: FormEvent) => {
    e.preventDefault();
    toast.success("Thanks — an A&O advisor will be in touch shortly.");
  };

  const toggleSave = (property: Property) => {
    setSaved((current) => current.includes(property.id) ? current.filter((item) => item !== property.id) : [...current, property.id]);
    toast.success(saved.includes(property.id) ? "Removed from favourites" : "Saved to your favourites");
  };

  const openDetails = (property: Property) => { setSelectedProperty(property); setGalleryIndex(0); };

  const resetFilters = () => {
    setLocation(""); setSearchType("Any type"); setSearchPrice("Any price"); setStatusFilter("All listings"); setTypeFilter("All property types"); setMinPrice(""); setMaxPrice(""); setShowSavedOnly(false);
    toast.info("Filters reset");
  };

  const submitViewing = (e: FormEvent) => {
    e.preventDefault();
    setViewingProperty(null);
    toast.success("Viewing request received — an advisor will confirm the appointment.");
  };

  const submitReport = (e: FormEvent) => {
    e.preventDefault();
    setReportProperty(null);
    toast.success("Report received. Our verification team will review this listing.");
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand" onClick={() => scrollToId("top")} aria-label="A&O Real Estate Solutions home"><img src={logo} alt="A&O Real Estate Solutions" /><span className="brand-copy"><strong>A&O</strong><small>REAL ESTATE SOLUTIONS</small><em>Building Dreams, Finding Homes</em></span></button>
          <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>{["Home", "Buy", "Rent", "Land", "Commercial", "List a Property", "About Us", "Contact"].map((item) => <button key={item} onClick={() => { setMenuOpen(false); scrollToId(item === "Home" ? "top" : item === "List a Property" ? "owners" : item === "Contact" ? "footer" : "listings"); }}>{item}</button>)}</nav>
          <div className="header-actions"><button className={showSavedOnly ? "saved-nav active" : "saved-nav"} onClick={() => { setShowSavedOnly(true); scrollToId("listings"); }}><Star size={15} fill={saved.length ? "currentColor" : "none"} /> Saved <span>{saved.length}</span></button><button className="icon-btn" aria-label="Search" onClick={() => scrollToId("search")}><Search size={17} /></button><button className="signin" onClick={() => toast.info("Sign in is coming soon.")}><UserRound size={15} /> Sign In</button><button className="gold-btn small" onClick={() => scrollToId("owners")}>Get Started</button></div>
          <button className="mobile-menu" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section"><div className="container hero-content"><p className="eyebrow light">UGANDA'S TRUSTED REAL ESTATE MARKETPLACE</p><h1>Find Land.<br />Discover Homes.<br /><span>Make Your Next Move.</span></h1><p className="hero-copy">Buy, sell, rent and invest in properties across Uganda.<br />From residential homes to prime land and commercial spaces —<br className="desktop-only" /> we make it simple, secure and seamless.</p><div className="hero-actions"><button className="gold-btn" onClick={() => scrollToId("listings")}>Explore listings <ArrowRight size={15} /></button><button className="ghost-btn" onClick={() => scrollToId("owners")}>List your property <ArrowRight size={15} /></button></div></div></section>

        <section className="search-panel-wrap" id="search"><form className="search-panel" onSubmit={submitSearch}><label><MapPin size={18} /><span>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kampala, Entebbe, Mukono..." /></span></label><label><Building2 size={18} /><span>Property Type<select value={searchType} onChange={(e) => setSearchType(e.target.value)}><option>Any type</option><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></span></label><label><CircleDollarSign size={18} /><span>Price Range<select value={searchPrice} onChange={(e) => setSearchPrice(e.target.value)}><option>Any price</option><option>Under UGX 500M</option><option>UGX 500M – 1B</option><option>Over UGX 1B</option></select></span></label><label><BedDouble size={18} /><span>Bedrooms<select defaultValue="Any"><option>Any</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></span></label><button className="gold-btn search-btn" type="submit"><Search size={16} /> Search Properties</button></form></section>

        <section className="content-section category-section"><div className="container"><div className="section-heading"><div><p className="eyebrow">FIND YOUR PLACE</p><h2>Ways To Move Forward</h2></div><p>From a first plot to a forever home, discover spaces that<br className="desktop-only" /> match your next chapter.</p></div><div className="category-grid">{categories.map(({ eyebrow, title, description, image, icon: Icon }) => <button className="category-card" key={title} onClick={() => { if (title === "Rentals") setSearchType("Apartment"); if (title === "Land for sale") setSearchType("Land"); if (title === "Houses for sale") setSearchType("House"); if (title === "Commercial property") setSearchType("Commercial"); scrollToId("listings"); }}><div className="category-photo" style={{ backgroundImage: `url(${image})` }} /><div className="category-body"><span className="round-icon"><Icon size={17} /></span><p className="eyebrow">{eyebrow}</p><h3>{title}</h3><p>{description}</p><span className="round-arrow"><ArrowRight size={15} /></span></div></button>)}</div></div></section>

        <section className="content-section featured-section" id="listings"><div className="container"><div className="section-heading compact"><div><p className="eyebrow">CURATED FOR YOU</p><h2>{showSavedOnly ? "Your Favourites" : "Premium Listings"}</h2></div><div className="section-meta"><span>{filteredProperties.length} of {properties.length} matches</span><button onClick={() => setFiltersOpen((v) => !v)}><SlidersIcon /> {filtersOpen ? "Hide filters" : "Filter properties"}</button></div></div><div className={filtersOpen ? "filter-panel is-open" : "filter-panel"}><div><label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Any Uganda location" /></label><label>Listing status<select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All listings</option><option>For Sale</option><option>For Rent</option></select></label><label>Property type<select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option>All property types</option><option>House</option><option>Apartment</option><option>Land</option><option>Commercial</option></select></label></div><div><label>Min. price (UGX)<input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="No minimum" /></label><label>Max. price (UGX)<input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="No maximum" /></label><label>Bedrooms<select defaultValue="Any bedrooms"><option>Any bedrooms</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></label><button className="reset-btn" onClick={resetFilters}>Reset</button></div></div>{filteredProperties.length ? <div className="listing-grid">{filteredProperties.map((property) => <article className="listing-card" key={property.id}><div className="listing-image" style={{ backgroundImage: `url(${property.image})` }}><span className={property.status === "For Sale" ? "status sale" : "status"}>{property.status}</span><button className={saved.includes(property.id) ? "save-btn saved" : "save-btn"} onClick={() => toggleSave(property)} aria-label="Save property"><Star size={16} fill={saved.includes(property.id) ? "currentColor" : "none"} /></button><button className="photo-count" onClick={() => openDetails(property)}><Eye size={12} /> {property.images.length} photos</button></div><div className="listing-body"><p className="listing-price">{property.price}</p><h3>{property.title}</h3><p className="listing-meta">{property.meta}</p><p className="listing-location"><MapPin size={14} /> {property.location}</p><div className="listing-actions"><button className="details-btn" onClick={() => openDetails(property)}>View details <ArrowRight size={14} /></button><a className="whatsapp-btn" href={whatsappUrl(property)} target="_blank" rel="noreferrer" aria-label="Contact seller on WhatsApp"><MessageCircle size={15} /></a></div></div></article>)}</div> : <div className="empty-state"><Star size={26} /><h3>No properties match those filters.</h3><p>Try a different location, price range, or property type.</p><button className="gold-btn" onClick={resetFilters}>Clear filters</button></div>}</div></section>

        <section className="content-section decision-section"><div className="container decision-grid"><div><p className="eyebrow">PLAN WITH CONFIDENCE</p><h2>Mortgage calculator</h2><p className="section-lead">Estimate your monthly repayment before you make your next move. Adjust the figures to see what feels comfortable.</p><div className="calc-form"><label>Property price (UGX)<input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(Number(e.target.value))} /></label><label>Down payment (UGX)<input type="number" value={downPayment} onChange={(e) => setDownPayment(Number(e.target.value))} /></label><label>Interest rate %<input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} /></label><label>Loan term<select value={term} onChange={(e) => setTerm(Number(e.target.value))}><option value={5}>5 years</option><option value={10}>10 years</option><option value={15}>15 years</option><option value={20}>20 years</option><option value={25}>25 years</option></select></label></div></div><div className="mortgage-result"><p>Estimated monthly payment</p><strong>{money(monthly)}</strong><small>Principal + interest only</small><div className="result-divider" /><div><span>Total interest</span><b>{money(totalInterest)}</b></div><div><span>Loan amount</span><b>{money(loanAmount)}</b></div></div></div></section>

        <section className="content-section inquiry-section" id="inquiry"><div className="container inquiry-grid"><div className="inquiry-copy"><p className="eyebrow">TALK TO A PROPERTY ADVISOR</p><h2>Property inquiry</h2><p>Have a question or ready to view? Send us your details and we’ll connect you with the right A&O advisor.</p><div className="advisor-card"><div className="advisor-avatar">A&O</div><div><strong>Real guidance, from people who know Uganda.</strong><span>Mon–Sat · 8:00am–6:00pm</span></div></div></div><form className="inquiry-form" onSubmit={submitInquiry}><div className="field-row"><label>Your name<input required placeholder="e.g. Sarah Namusoke" /></label><label>Email address<input required type="email" placeholder="you@example.com" /></label></div><div className="field-row"><label>Phone number<input required placeholder="+256 700 000 000" /></label><label>I'm interested in<select defaultValue=""><option value="" disabled>Select a property</option>{properties.map((p) => <option key={p.id}>{p.title}</option>)}</select></label></div><label>Your message<textarea rows={4} defaultValue="I would like to schedule a viewing and learn more about this property." /></label><button className="gold-btn" type="submit">Send inquiry <ArrowRight size={15} /></button></form></div></section>

        <section className="content-section locations-section"><div className="container"><div className="section-heading compact"><div><p className="eyebrow">POPULAR LOCATIONS</p><h2>Explore Top Locations</h2></div><button className="text-btn" onClick={() => toast.info("More locations coming soon")}>View all locations <ArrowRight size={14} /></button></div><div className="locations-grid">{locations.map(([name, count, image]) => <button className="location-card" key={name} style={{ backgroundImage: `linear-gradient(0deg, rgba(4,23,43,.82), rgba(4,23,43,.04) 72%), url(${image})` }} onClick={() => { setLocation(name); scrollToId("search"); }}><span><strong>{name}</strong><small>{count}</small></span><ArrowRight size={16} /></button>)}</div></div></section>

        <section className="trust-section"><div className="container"><div className="trust-heading"><p className="eyebrow light">WHY CHOOSE A&O?</p><h2>Trusted. Simple. Secure.</h2><p>We connect you with verified property owners, trusted agents and genuine listings. Your dream property is just a few clicks away.</p><button className="ghost-btn" onClick={() => toast.info("Our advisor team is ready to help.")}>How it works <ArrowRight size={15} /></button></div><div className="trust-grid">{[[ShieldCheck, "Verified Listings", "Real properties, real owners, real details."], [Users, "Trusted Agents", "Work with verified and rated agents."], [Check, "Secure Transactions", "Your data and conversations are protected."], [MessageCircle, "24/7 Support", "We're always here to help."]].map(([Icon, title, text]) => <div className="trust-item" key={String(title)}><span className="trust-icon"><Icon size={21} /></span><h3>{String(title)}</h3><p>{String(text)}</p></div>)}</div></div></section>

        <section className="listing-cta" id="owners"><div className="container cta-inner"><div><p className="eyebrow light">FOR PROPERTY OWNERS & AGENTS</p><h2>Get more exposure.<br />Find the right buyers or tenants.</h2><p>List your land, house or commercial property in minutes and reach thousands of potential buyers and renters across Uganda.</p><button className="gold-btn" onClick={() => toast.success("We'll help you get your property listed.")}>List a Property <ArrowRight size={15} /></button></div><div className="cta-mark">Your property journey<strong>starts here</strong></div></div></section>
      </main>

      <footer className="site-footer" id="footer"><div className="container footer-grid"><div className="footer-brand"><div className="brand"><img src={logo} alt="A&O Real Estate Solutions" /><span className="brand-copy"><strong>A&O</strong><small>REAL ESTATE SOLUTIONS</small><em>Building Dreams, Finding Homes</em></span></div><p>Your trusted partner for land, homes, rentals and commercial property in Uganda.</p><div className="socials"><a href="https://facebook.com" aria-label="Facebook"><Facebook size={16} /></a><a href="https://instagram.com" aria-label="Instagram"><Instagram size={16} /></a><a href="https://youtube.com" aria-label="YouTube"><Youtube size={16} /></a></div></div><div><h4>Quick Links</h4><button onClick={() => scrollToId("top")}>Home</button><button onClick={() => scrollToId("listings")}>Buy</button><button onClick={() => scrollToId("listings")}>Rent</button><button onClick={() => scrollToId("listings")}>Land</button><button onClick={() => scrollToId("owners")}>List a Property</button></div><div><h4>Support</h4><button>FAQ</button><button onClick={() => scrollToId("inquiry")}>Contact Us</button><button>Terms & Conditions</button><button>Privacy Policy</button><button>How It Works</button></div><div><h4>Contact Us</h4><a href="tel:+256700123456"><Phone size={14} /> +256 700 123 456</a><a href="mailto:info@aorealestatesolutions.ug"><Mail size={14} /> info@aorealestatesolutions.ug</a><span><MapPin size={14} /> Kampala, Uganda</span><h4 className="updates-title">Get property updates</h4><p className="updates-copy">Be the first to know about new listings, price drops and exclusive deals.</p><div className="subscribe"><input placeholder="Enter your email address" type="email" /><button aria-label="Subscribe" onClick={() => toast.success("You're on the list!")}><ArrowRight size={15} /></button></div></div></div><div className="footer-bottom container"><span>© 2025 A&O Real Estate Solutions. All rights reserved.</span><span>Building Dreams, Guided by Faith&nbsp; | &nbsp;Proverbs 16:3</span></div></footer>

      {selectedProperty && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedProperty(null); }}><div className="property-modal" role="dialog" aria-modal="true" aria-label={selectedProperty.title}><button className="modal-close" onClick={() => setSelectedProperty(null)} aria-label="Close"><X size={18} /></button><div className="modal-gallery"><img src={selectedProperty.images[galleryIndex]} alt={selectedProperty.title} /><button className="gallery-arrow left" onClick={() => setGalleryIndex((galleryIndex - 1 + selectedProperty.images.length) % selectedProperty.images.length)} aria-label="Previous photo"><ChevronLeft /></button><button className="gallery-arrow right" onClick={() => setGalleryIndex((galleryIndex + 1) % selectedProperty.images.length)} aria-label="Next photo"><ChevronRight /></button><div className="gallery-dots">{selectedProperty.images.map((_, index) => <button key={index} className={index === galleryIndex ? "active" : ""} onClick={() => setGalleryIndex(index)} aria-label={`View photo ${index + 1}`} />)}</div></div><div className="modal-content"><div className="modal-title-row"><div><span className="modal-status">{selectedProperty.status}</span><h2>{selectedProperty.title}</h2><p className="modal-location"><MapPin size={15} /> {selectedProperty.location}</p></div><button className={saved.includes(selectedProperty.id) ? "modal-save saved" : "modal-save"} onClick={() => toggleSave(selectedProperty)}><Star size={17} fill={saved.includes(selectedProperty.id) ? "currentColor" : "none"} /> {saved.includes(selectedProperty.id) ? "Saved" : "Save"}</button></div><strong className="modal-price">{selectedProperty.price}</strong><p className="modal-meta">{selectedProperty.meta}</p><p className="modal-description">{selectedProperty.description}</p><div className="modal-actions"><a className="whatsapp-large" href={whatsappUrl(selectedProperty)} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp seller</a><button className="gold-btn" onClick={() => { setViewingProperty(selectedProperty); setSelectedProperty(null); }}>Request a viewing <CalendarDays size={16} /></button></div><button className="report-link" onClick={() => { setReportProperty(selectedProperty); setSelectedProperty(null); }}><Flag size={14} /> Report suspicious listing</button></div></div></div>}

      {viewingProperty && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setViewingProperty(null); }}><div className="form-modal" role="dialog" aria-modal="true" aria-label="Request a viewing"><button className="modal-close" onClick={() => setViewingProperty(null)} aria-label="Close"><X size={18} /></button><p className="eyebrow">REQUEST A VIEWING</p><h2>{viewingProperty.title}</h2><p className="modal-location"><MapPin size={15} /> {viewingProperty.location}</p><form className="modal-form" onSubmit={submitViewing}><div className="field-row"><label>Your name<input required placeholder="e.g. Sarah Namusoke" /></label><label>Phone number<input required placeholder="+256 700 000 000" /></label></div><div className="field-row"><label>Preferred date<input required type="date" /></label><label>Preferred time<select required defaultValue=""><option value="" disabled>Select a time</option><option>Morning · 9am–12pm</option><option>Afternoon · 12pm–3pm</option><option>Evening · 3pm–6pm</option></select></label></div><label>Message<textarea rows={3} placeholder="Any questions for the seller?" /></label><button className="gold-btn" type="submit">Send viewing request <ArrowRight size={15} /></button></form></div></div>}

      {reportProperty && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setReportProperty(null); }}><div className="form-modal report-modal" role="dialog" aria-modal="true" aria-label="Report suspicious listing"><button className="modal-close" onClick={() => setReportProperty(null)} aria-label="Close"><X size={18} /></button><p className="eyebrow">SAFETY FIRST</p><h2>Report suspicious listing</h2><p className="modal-description">Help us keep A&O safe. Tell us what looks wrong about <strong>{reportProperty.title}</strong>.</p><form className="modal-form" onSubmit={submitReport}><label>Reason<select required defaultValue=""><option value="" disabled>Select a reason</option><option>Price or property details seem misleading</option><option>Seller is requesting payment before viewing</option><option>Duplicate or stolen listing</option><option>Something else</option></select></label><label>Additional details<textarea required rows={4} placeholder="Share anything that can help our team investigate." /></label><label className="consent-check"><input type="checkbox" required /> I confirm this report is made in good faith.</label><button className="gold-btn" type="submit">Submit report <Flag size={15} /></button></form></div></div>}
    </div>
  );
}

function SlidersIcon() { return <span className="sliders-icon">☷</span>; }
