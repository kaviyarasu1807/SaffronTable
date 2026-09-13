import { useEffect, useMemo, useState } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { io } from "socket.io-client";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { toast, Toaster } from "sonner";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  ChevronDown,
  Clock3,
  Flame,
  Heart,
  MapPin,
  Navigation,
  LocateFixed,
  Menu as MenuIcon,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  ThumbsUp,
  Gift,
  UserRound,
  User,
  X,
  Zap,
  LoaderCircle,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import { useTheme } from "./contexts/ThemeContext";

type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: string;
  time: string;
  image: string;
  tag?: string;
  veg?: boolean;
};



const logoSrc = "/logo.png";
const logoMarkSrc = "/logo.png";

const categories = [
  { label: "Signature plates", emoji: "✦", count: "12" },
  { label: "Mains & biryani", emoji: "◒", count: "16" },
  { label: "Sweet finish", emoji: "◌", count: "08" },
  { label: "Drinks", emoji: "⌁", count: "10" },
];

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function Header({ cartCount, onCart, user, onLoginClick, theme, toggleTheme }: { cartCount: number, onCart: () => void, user: any, onLoginClick: () => void, theme: string, toggleTheme: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [path] = useLocation();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand"><img className="brand-mark-img" src={logoSrc} alt="Saffron Table" /><div className="brand-copy"><strong>Saffron Table</strong><small>Indian Dining</small></div></Link>
        <div className="location-pill desktop-only"><MapPin size={12} strokeWidth={2.5} /><span>12th Main, Indiranagar</span></div>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          <Link href="/" className={path === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/menu" className={path === '/menu' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Menu</Link>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our Story</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button ghost mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <MenuIcon size={20} />}</button>
          <button className="icon-button ghost" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
          <button className="icon-button ghost" onClick={onLoginClick}>{user ? <LogOut size={18} /> : <User size={18} />}</button>
          <button className="cart-button" onClick={onCart}><ShoppingBag size={14} />{cartCount > 0 && <b>{cartCount}</b>}</button>
          {user?.points > 0 && <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--tomato)', marginLeft: '8px' }}>{user.points} pts</div>}
        </div>
      </div>
    </header>
  );
}

function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (user: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister ? { email, password, name } : { email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      
      localStorage.setItem("token", data.token);
      onLogin(data.user);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--paper)', padding: '40px', borderRadius: '16px', width: '90%', maxWidth: '420px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{fontFamily:'var(--serif)', fontSize:'28px', margin:0, lineHeight: 1}}>{isRegister ? "Create Account" : "Welcome Back"}</h3>
          <button onClick={onClose} style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '50%', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isRegister && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
              Name
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your Name" style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }} />
            </label>
          )}
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
            Password
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }} />
          </label>
          <button type="submit" className="primary-button wide" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={16} /> : (isRegister ? "Sign Up" : "Sign In")}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <button onClick={() => setIsRegister(!isRegister)} style={{ color: "var(--primary)", textDecoration: "underline" }}>
            {isRegister ? "Sign in" : "Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DishModal({ dish, onClose, onAdd }: { dish: Dish; onClose: () => void; onAdd: () => void }) {
  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="dish-card" style={{ width: '90%', maxWidth: '500px', cursor: 'default' }} onClick={e => e.stopPropagation()}>
        <div className="dish-image-wrap" style={{ height: '300px' }}>
          <img src={dish.image} alt={dish.name} style={{ height: '100%', objectFit: 'cover', width: '100%' }}/>
          <button className="favorite-button" onClick={onClose} style={{ background: 'var(--paper)', opacity: 1 }}><X size={17}/></button>
        </div>
        <div className="dish-content">
          <div className="dish-heading">
            <h3 style={{ fontSize: '24px' }}>{dish.name}</h3>
            {dish.veg && <span className="veg-dot" />}
          </div>
          <p style={{ fontSize: '16px', margin: '16px 0', color:'var(--muted-ink)' }}>{dish.description}</p>
          <div className="dish-meta" style={{ marginBottom: '24px' }}>
            <span className="rating"><Star size={13} fill="currentColor" /> {dish.rating}</span>
            <span><Clock3 size={13} /> {dish.time}</span>
            <span className="price">{formatPrice(dish.price)}</span>
            <span style={{ color: 'var(--tomato)', marginLeft:'auto' }}>🌶️ Medium</span>
          </div>
          <button className="primary-button wide" onClick={() => { onAdd(); onClose(); }}>Add to order <ArrowRight size={16}/></button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return <div className="section-title"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function CategoryStrip({ onSelect }: { onSelect: (category: string) => void }) {
  return <div className="category-strip">{categories.map((category) => <button key={category.label} className="category-card" onClick={() => onSelect(category.label)}><span className="category-symbol">{category.emoji}</span><span className="category-label">{category.label}</span><span className="category-count">{category.count} dishes <ArrowRight size={13} /></span></button>)}</div>;
}

function DishCard({ dish, addToCart, liked, toggleLike, onClick }: { dish: Dish; addToCart: (dish: Dish) => void; liked: boolean; toggleLike: (id: string) => void; onClick?: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding) return;
    setIsAdding(true);
    window.setTimeout(() => {
      addToCart(dish);
      setIsAdding(false);
    }, 420);
  };
  return <article className="dish-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="dish-image-wrap"><img src={dish.image} alt={dish.name} /><button className={`favorite-button ${liked ? "liked" : ""}`} onClick={(e) => { e.stopPropagation(); toggleLike(dish.id); }} aria-label="Save dish"><Heart size={17} fill={liked ? "currentColor" : "none"} /></button>{dish.tag && <span className="dish-tag">{dish.tag}</span>}</div>
    <div className="dish-content"><div className="dish-heading"><h3>{dish.name}</h3>{dish.veg && <span className="veg-dot" aria-label="Vegetarian" />}</div><p>{dish.description}</p><div className="dish-meta"><span className="rating"><Star size={13} fill="currentColor" /> {dish.rating}</span><span><Clock3 size={13} /> {dish.time}</span><span className="price">{formatPrice(dish.price)}</span></div><button className={`add-button ${isAdding ? "is-adding" : ""}`} onClick={handleAdd} disabled={isAdding}>{isAdding ? <><LoaderCircle size={16} className="spin" /> Adding...</> : <><Plus size={16} /> Add to order</>}</button></div>
  </article>;
}

function Home({ dishes, addToCart, liked, toggleLike, onCart, onDishClick }: { dishes: Dish[]; addToCart: (dish: Dish) => void; liked: string[]; toggleLike: (id: string) => void; onCart: () => void; onDishClick?: (dish: Dish) => void; }) {
  const [, navigate] = useLocation();
  return <div>
    <section className="hero-section">
      <div className="hero-copy">
        <div className="hero-kicker"><span className="pulse-dot" /> Now delivering across Bengaluru</div>
        <h1>Good food is<br /><em>a feeling.</em></h1>
        <p>Season-led Indian cooking, made for the table. Order something comforting, curious, or a little bit of both.</p>
        <div className="hero-actions"><button className="primary-button" onClick={() => navigate("/menu")}>Explore the menu <ArrowRight size={17} /></button><button className="text-button" onClick={() => window.dispatchEvent(new Event('open-reservation'))}>Book a table <span>↗</span></button></div>
        <div className="hero-trust"><div className="avatar-stack"><span>R</span><span>A</span><span>M</span><span>+</span></div><div><strong>4.9 / 5</strong><small>Loved by 2,000+ food people</small></div></div>
      </div>
      <div className="hero-visual"><div className="hero-stamp"><Sparkles size={15} /><span>Small batch.<br />Big comfort.</span></div><img src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1400&q=90" alt="A colourful Indian thali on a wooden table" /><div className="hero-caption"><span>01 / 03</span><strong>From our kitchen</strong><small>Thali for one, joy for many.</small></div></div>
    </section>

    <FoodCarousel dishes={dishes} addToCart={addToCart} />

    <section className="home-section intro-section" id="about"><div className="container-wide intro-grid"><div><span className="eyebrow">A little about us</span><h2>Thoughtful food,<br /><em>not fussy food.</em></h2></div><div className="intro-copy"><p>We cook the food we grew up with, then take it somewhere new. Expect bold spices, seasonal produce, and the kind of plates that make you pause mid-conversation.</p><button className="arrow-link" onClick={() => toast("Our full story is coming to the journal")}>Meet the people behind the plates <ArrowRight size={16} /></button></div></div></section>

    <section className="home-section cream-section"><div className="container-wide"><SectionTitle eyebrow="Find your mood" title="What's on your mind?" copy="Start with a feeling. We'll take care of the rest." action={<button className="text-button desktop-only" onClick={() => navigate("/menu")}>View all dishes <ArrowRight size={16} /></button>} /><CategoryStrip onSelect={() => navigate("/menu")} /></div></section>

    <section className="home-section menu-preview" id="journal"><div className="container-wide"><SectionTitle eyebrow="The good stuff" title="Made for sharing." copy="Our most-ordered plates, ready when you are." action={<button className="text-button desktop-only" onClick={() => navigate("/menu")}>See full menu <ArrowRight size={16} /></button>} /><div className="dish-grid">{dishes.slice(0, 4).map((dish) => <DishCard key={dish.id} dish={dish} addToCart={addToCart} liked={liked.includes(dish.id)} toggleLike={toggleLike} onClick={() => onDishClick && onDishClick(dish)} />)}</div><button className="mobile-only outline-button" onClick={() => navigate("/menu")}>View full menu <ArrowRight size={16} /></button></div></section>

    <section className="feature-band"><div className="feature-image"><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85" alt="Chef preparing a fresh dish" /></div><div className="feature-copy"><span className="eyebrow">How we do it</span><h2>From our kitchen,<br /><em>with intention.</em></h2><p>We work with small farms, local makers, and a very patient tandoor. Every dish is built around a few good ingredients, treated with the respect they deserve.</p><div className="feature-stats"><div><strong>28</strong><span>local growers</span></div><div><strong>0</strong><span>shortcuts</span></div><div><strong>100%</strong><span>good mood</span></div></div></div></section>

    <section className="home-section testimonial-section"><div className="container-narrow"><span className="quote-mark">“</span><blockquote>The kind of place that makes you want to order one more thing, just to keep the evening going.</blockquote><div className="quote-byline"><span className="avatar peach">K</span><span><strong>Karishma P.</strong><small>Regular, Indiranagar</small></span><div className="stars">★★★★★</div></div></div></section>

    <Footer />
  </div>;
}

function FoodCarousel({ dishes, addToCart }: { dishes: Dish[]; addToCart: (dish: Dish) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dietFilter, setDietFilter] = useState<"All" | "Veg" | "Non-Veg">("All");

  const carouselDishes = useMemo(() => {
    return dishes.filter(dish => {
      if (dietFilter === "Veg") return dish.veg === true;
      if (dietFilter === "Non-Veg") return dish.veg !== true;
      return true;
    }).slice(0, 5);
  }, [dietFilter]);

  useEffect(() => {
    setActiveIndex(0);
  }, [dietFilter]);

  useEffect(() => {
    if (carouselDishes.length === 0) return;
    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % carouselDishes.length), 4200);
    return () => window.clearInterval(timer);
  }, [carouselDishes.length]);

  const move = (direction: number) => {
    if (carouselDishes.length === 0) return;
    setActiveIndex((index) => (index + direction + carouselDishes.length) % carouselDishes.length);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      move(-1); // Swipe right -> prev
    } else if (info.offset.x < -swipeThreshold) {
      move(1); // Swipe left -> next
    }
  };

  if (carouselDishes.length === 0) return <section className="carousel-section"><div className="container-wide"><div className="carousel-intro"><div><span className="eyebrow">On the table right now</span><h2>A little theatre<br /><em>for your appetite.</em></h2></div></div></div></section>;

  return <section className="carousel-section"><div className="container-wide"><div className="carousel-intro"><div><span className="eyebrow">On the table right now</span><h2>A little theatre<br /><em>for your appetite.</em></h2></div><div><p>Spin through the dishes that are making our kitchen feel especially alive today.</p><div className="filter-pills" style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>{["All", "Veg", "Non-Veg"].map((filter) => <button key={filter} className={`outline-button ${dietFilter === filter ? "active" : ""}`} style={dietFilter === filter ? { borderColor: 'var(--tomato)', color: 'var(--tomato)' } : { borderColor: '#526056', color: '#b9c0b7' }} onClick={() => setDietFilter(filter as any)}>{filter}</button>)}</div></div></div><div className="food-carousel" aria-label="Featured dishes carousel"><motion.div className="carousel-orbit" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={handleDragEnd} whileTap={{ cursor: "grabbing" }}>{carouselDishes.map((dish, index) => { const offset = (index - activeIndex + carouselDishes.length) % carouselDishes.length; const normalized = offset > (carouselDishes.length / 2) ? offset - carouselDishes.length : offset; return <button key={dish.id} className={`carousel-card ${normalized === 0 ? "is-active" : ""}`} style={{ transform: `translate(-50%, -50%) translateX(${normalized * 188}px) translateZ(${normalized === 0 ? 105 : -Math.abs(normalized) * 22}px) rotateY(${normalized * -8}deg) scale(${normalized === 0 ? 1 : .82})`, zIndex: 10 - Math.abs(normalized) }} onClick={() => setActiveIndex(index)} aria-label={`Show ${dish.name}`}><img src={dish.image} alt={dish.name} /><span className="carousel-card-info"><strong>{dish.name}</strong><small>{formatPrice(dish.price)} · {dish.rating} ★</small></span>{normalized === 0 && <span className="carousel-card-glow" />}</button>; })}</motion.div><button className="carousel-arrow carousel-prev" onClick={() => move(-1)} aria-label="Previous dish">←</button><button className="carousel-arrow carousel-next" onClick={() => move(1)} aria-label="Next dish">→</button><div className="carousel-dots">{carouselDishes.map((dish, index) => <button key={dish.id} className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Go to ${dish.name}`} />)}</div></div><div className="carousel-cta"><span>Featured dish · {carouselDishes[activeIndex]?.name}</span><button onClick={() => addToCart(carouselDishes[activeIndex])}>Add this to your order <ArrowRight size={15} /></button></div></div></section>;
}

function MenuPage({ dishes, addToCart, liked, toggleLike, onDishClick }: { dishes: Dish[]; addToCart: (dish: Dish) => void; liked: string[]; toggleLike: (id: string) => void; onDishClick?: (dish: Dish) => void; }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("All dishes");
  const [aiMood, setAiMood] = useState<string | null>(null);

  const moodFilters: Record<string, string[]> = {
    "Spicy & Comforting": ["chicken-ghee-roast", "saffron-biryani", "gunpowder-calamari"],
    "Light & Fresh": ["malabar-fish", "tandoori-malai-broccoli"],
    "Rich & Decadent": ["nalli-nihari", "dal-makhani", "palak-guchhi-risotto"]
  };

  const filtered = useMemo(() => {
    let result = dishes;
    if (aiMood) {
      result = result.filter(d => moodFilters[aiMood].includes(d.id));
    } else {
      result = result.filter((dish) => (selected === "All dishes" || (selected === "Vegetarian" ? dish.veg : dish.category === selected)) && `${dish.name} ${dish.description}`.toLowerCase().includes(search.toLowerCase()));
    }
    return result;
  }, [search, selected, aiMood, dishes]);

  return <div className="menu-page"><div className="menu-header"><div><span className="eyebrow">Order online</span><h1>A table for<br /><em>every mood.</em></h1></div><p>Comforting classics, little surprises, and plenty of things to pass around. Delivered warm from our kitchen in Indiranagar.</p></div><div className="menu-toolbar"><div className="search-field"><Search size={17} /><input value={search} onChange={(e) => { setSearch(e.target.value); setAiMood(null); }} placeholder="Search dishes, ingredients..." /></div><div className="filter-pills">{["All dishes", "Small plates", "Mains", "Breads", "Sweet finish", "Drinks", "Vegetarian"].map((filter) => <button key={filter} className={selected === filter && !aiMood ? "selected" : ""} onClick={() => { setSelected(filter); setAiMood(null); }}>{filter}</button>)}</div></div><div className="menu-results">
    
    <div style={{ background: 'var(--sage)', padding: '24px', borderRadius: '12px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={20} color="var(--tomato)" />
        <strong style={{ fontFamily: 'var(--serif)', fontSize: '20px' }}>Chef's Recommendations</strong>
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted-ink)' }}>Not sure what to order? Pick a mood and let us curate a perfect meal for you.</p>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {Object.keys(moodFilters).map(mood => (
          <button key={mood} className={`outline-button ${aiMood === mood ? 'active' : ''}`} style={aiMood === mood ? { background: 'var(--tomato)', color: 'white', borderColor: 'var(--tomato)' } : { background: 'var(--paper)', marginTop: 0 }} onClick={() => setAiMood(aiMood === mood ? null : mood)}>{mood}</button>
        ))}
      </div>
    </div>

    <div className="results-top"><span>{filtered.length} dishes to make your day</span><button onClick={() => toast("Showing our most popular dishes")}>Sort: Popular <ChevronDown size={15} /></button></div><div className="dish-grid menu-grid">{filtered.map((dish) => <DishCard key={dish.id} dish={dish} addToCart={addToCart} liked={liked.includes(dish.id)} toggleLike={toggleLike} onClick={() => onDishClick && onDishClick(dish)} />)}</div>{filtered.length === 0 && <div className="empty-state"><span>◌</span><h3>Nothing on this mood yet.</h3><p>Try another search or browse all dishes.</p><button className="primary-button" onClick={() => { setSearch(""); setSelected("All dishes"); setAiMood(null); }}>Reset menu</button></div>}</div><Footer /></div>;
}

function CartDrawer({ dishes, items, setItems, onClose, onCheckout }: { dishes: Dish[]; items: { dish: Dish; quantity: number }[]; setItems: React.Dispatch<React.SetStateAction<{ dish: Dish; quantity: number }[]>>; onClose: () => void; onCheckout: () => void }) {
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const rawSubtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const subtotal = Math.max(0, rawSubtotal - discount);
  const delivery = subtotal > 699 || subtotal === 0 ? 0 : 49;
  const total = subtotal + delivery;
  const update = (id: string, delta: number) => setItems((current) => current.map((item) => item.dish.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
  
  const handlePromo = () => {
    if (promo.toUpperCase() === "SAFFRON10") {
      setDiscount(50);
      toast.success("Promo applied", { description: "₹50 off your order!" });
    } else {
      toast.error("Invalid promo code");
    }
  };

  const hasDrink = items.some(i => i.dish.category === "Drinks");
  const suggestedDrink = dishes.find(d => d.category === "Drinks");

  return <div className="drawer-backdrop" onClick={onClose}><aside className="cart-drawer" onClick={(e) => e.stopPropagation()}><div className="drawer-head"><div><span className="eyebrow">Your order</span><h2>Good choice.</h2></div><button className="close-button" onClick={onClose}><X size={20} /></button></div>{items.length === 0 ? <div className="drawer-empty"><ShoppingBag size={35} strokeWidth={1.2} /><h3>Your basket is waiting.</h3><p>Add a few things you love and we'll bring them to your door.</p><Link href="/menu" className="primary-button" onClick={onClose}>Browse menu <ArrowRight size={16} /></Link></div> : <><div className="cart-items">{items.map(({ dish, quantity }) => <div className="cart-item" key={dish.id}><img src={dish.image} alt="" /><div className="cart-item-copy"><strong>{dish.name}</strong><span>{formatPrice(dish.price)}</span><div className="quantity"><button onClick={() => update(dish.id, -1)}><Minus size={14} /></button><b>{quantity}</b><button onClick={() => update(dish.id, 1)}><Plus size={14} /></button></div></div></div>)}</div><div className="cart-note"><Sparkles size={15} /> You unlock free delivery over ₹699</div>
  
  <div style={{ padding: '0 24px', display: 'flex', gap: '8px' }}>
    <input value={promo} onChange={e => setPromo(e.target.value)} placeholder="Promo code (try SAFFRON10)" style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }} />
    <button className="outline-button" onClick={handlePromo}>Apply</button>
  </div>

  {!hasDrink && suggestedDrink && (
    <div style={{ margin: '16px 24px', padding: '16px', background: 'var(--cream)', borderRadius: '8px' }}>
      <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600 }}>Thirsty? You might also like:</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src={suggestedDrink.image} alt={suggestedDrink.name} style={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover' }}/>
        <div style={{ flex: 1 }}>
          <strong style={{ display: 'block', fontSize: '14px' }}>{suggestedDrink.name}</strong>
          <span style={{ fontSize: '13px', color: 'var(--muted-ink)' }}>{formatPrice(suggestedDrink.price)}</span>
        </div>
        <button className="primary-button" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => update(suggestedDrink.id, 1)}>Add</button>
      </div>
    </div>
  )}

  <div className="cart-summary"><div><span>Subtotal</span><b>{formatPrice(subtotal)}</b></div><div><span>Delivery fee</span><b>{delivery ? formatPrice(delivery) : "Free"}</b></div><div className="total"><span>Total</span><b>{formatPrice(total)}</b></div><button className="primary-button wide" onClick={onCheckout}>Continue to checkout <ArrowRight size={16} /></button></div></>}</aside></div>;
}

function Checkout({ items, onBack, onSuccess }: { items: { dish: Dish; quantity: number }[]; onBack: () => void; onSuccess: () => void }) {
  const rawSubtotal = items.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [wheelSpun, setWheelSpun] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const subtotal = Math.floor(rawSubtotal * (1 - discountPercent / 100));
  
  const handleSpin = () => {
    if (wheelSpun) return;
    setWheelSpun(true);
    const prizes = [0, 5, 0, 10, 0, 5, 0, 10]; // Alternating prizes
    const stopIndex = Math.floor(Math.random() * prizes.length);
    const rotations = 360 * 5; // Spin 5 times
    const extraDeg = (360 / prizes.length) * stopIndex;
    setSpinRotation(rotations + extraDeg);
    
    setTimeout(() => {
      const won = prizes[stopIndex];
      setDiscountPercent(won);
      if (won > 0) toast.success(`You won ${won}% off!`);
      else toast("Better luck next time!");
    }, 3000);
  };

  const [isPlacing, setIsPlacing] = useState(false);
  const handlePlaceOrder = async () => {
    if (isPlacing) return;
    setIsPlacing(true);
    const paymentToast = toast.loading("Confirming your payment...", { description: "Securely connecting to UPI" });
    
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, total: subtotal }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Payment confirmed", { id: paymentToast, description: `Order ${data.orderId} is now with the kitchen` });
        onSuccess();
      } else {
        toast.error("Failed to place order", { id: paymentToast });
        setIsPlacing(false);
      }
    } catch (e) {
      toast.error("Network error", { id: paymentToast });
      setIsPlacing(false);
    }
  };
  return <div className="checkout-page"><div className="checkout-top"><button className="back-link" onClick={onBack}>← Back to basket</button><span className="checkout-logo">Saffron Table</span><span className="secure-check"><BadgeCheck size={15} /> Secure checkout</span></div><div className="checkout-layout"><div className="checkout-form"><span className="eyebrow">Almost there</span><h1>Make it yours.</h1><p className="checkout-intro">We'll deliver your order warm and wonderful.</p>
  
  <div className="form-section" style={{ background: 'var(--card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
    <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', marginBottom: '8px' }}>Spin to Win!</h3>
    <p style={{ color: 'var(--muted-ink)', fontSize: '13px', marginBottom: '24px' }}>Spin the wheel for a chance to win up to 10% off your order.</p>
    <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 24px' }}>
      <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: '20px solid var(--tomato)' }} />
      <motion.div animate={{ rotate: -spinRotation }} transition={{ duration: 3, ease: "easeOut" }} style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid var(--ink)', background: 'conic-gradient(#fffdf7 0deg 45deg, #e9eedf 45deg 90deg, #fffdf7 90deg 135deg, #e9eedf 135deg 180deg, #fffdf7 180deg 225deg, #e9eedf 225deg 270deg, #fffdf7 270deg 315deg, #e9eedf 315deg 360deg)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(0deg)' }}>0%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(45deg)' }}>5%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(90deg)' }}>0%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(135deg)' }}>10%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(180deg)' }}>0%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(225deg)' }}>5%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(270deg)' }}>0%</div>
         <div style={{ position: 'absolute', textAlign: 'center', width: '100%', top: '15%', fontWeight: 'bold', fontSize: '12px', transform: 'rotate(315deg)' }}>10%</div>
      </motion.div>
    </div>
    <button className="primary-button" onClick={handleSpin} disabled={wheelSpun}>{wheelSpun ? 'Reward Applied' : 'Spin the Wheel'}</button>
  </div>

  <div className="form-section"><div className="form-section-head"><span>01</span><h3>Your details</h3></div><div className="form-grid"><label>First name<input placeholder="Aarav" /></label><label>Phone number<input placeholder="+91 98765 43210" /></label><label className="full">Email address<input placeholder="you@example.com" /></label></div></div><div className="form-section"><div className="form-section-head"><span>02</span><h3>Delivery address</h3></div><div className="form-grid"><label className="full">Flat / house no.<input placeholder="12B, Palm Grove Apartments" /></label><label>Street / area<input placeholder="12th Main, Indiranagar" /></label><label>PIN code<input placeholder="560038" /></label></div><button className="address-toggle" onClick={() => toast("Address saved for your next order")}>+ Add delivery instructions</button></div><div className="form-section"><div className="form-section-head"><span>03</span><h3>Payment</h3></div><div className="payment-options"><button className="payment-option active"><span className="payment-icon">UPI</span><span><strong>UPI</strong><small>GPay, PhonePe, Paytm</small></span><span className="radio-dot" /></button><button className="payment-option" onClick={() => toast("Card payments are available at launch") }><span className="payment-icon">▭</span><span><strong>Card</strong><small>Credit or debit card</small></span><span className="radio-dot" /></button></div></div><button className={`primary-button wide ${isPlacing ? "is-processing" : ""}`} onClick={handlePlaceOrder} disabled={isPlacing}>{isPlacing ? <><LoaderCircle size={16} className="spin" /> Confirming payment...</> : <>Place order · {formatPrice(subtotal + (subtotal > 699 ? 0 : 49))} <ArrowRight size={16} /></>}</button></div><div className="checkout-summary"><span className="eyebrow">Order summary</span><h3>From Saffron Table</h3><div className="summary-items">{items.map(({ dish, quantity }) => <div key={dish.id}><span>{quantity} × {dish.name}</span><b>{formatPrice(dish.price * quantity)}</b></div>)}</div><div className="summary-lines"><div><span>Subtotal</span><b>{formatPrice(rawSubtotal)}</b></div>{discountPercent > 0 && <div><span style={{ color: 'var(--tomato)' }}>Discount ({discountPercent}%)</span><b style={{ color: 'var(--tomato)' }}>-{formatPrice(rawSubtotal - subtotal)}</b></div>}<div><span>Delivery fee</span><b>{subtotal > 699 ? "Free" : "₹49"}</b></div><div className="total"><span>Total</span><b>{formatPrice(subtotal + (subtotal > 699 ? 0 : 49))}</b></div></div><div className="estimated"><Clock3 size={16} /><span><strong>Estimated arrival</strong><small>35–45 min · Indiranagar</small></span></div></div></div></div>;
}

function DeliveryMap({ statusStep }: { statusStep: number }) {
  const [progress, setProgress] = useState(statusStep >= 3 ? 72 : 42);
  useEffect(() => {
    const interval = window.setInterval(() => setProgress((value) => value >= 92 ? 42 : value + 2), 700);
    return () => window.clearInterval(interval);
  }, []);
  const riderX = 22 + progress * 0.62;
  const riderY = 73 - progress * 0.42;
  return <div className="delivery-map" aria-label="Simulated live delivery map">
    <div className="map-grid-lines" />
    <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
    <svg className="route-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path className="route-shadow" d="M18 78 C30 62, 34 66, 42 50 S57 29, 77 23" /><path className="route-line" d="M18 78 C30 62, 34 66, 42 50 S57 29, 77 23" /></svg>
    <div className="map-place restaurant-pin" style={{ left: "16%", top: "75%" }}><span><ShoppingBag size={13} /></span><small>Saffron Table</small></div>
    <div className="map-place destination-pin" style={{ left: "74%", top: "19%" }}><span><MapPin size={13} /></span><small>Your table</small></div>
    <div className="rider-pin" style={{ left: `${riderX}%`, top: `${riderY}%` }}><span><Navigation size={15} fill="currentColor" /></span><small>Rider is here</small></div>
    <div className="map-status"><span className="live-pulse" /> Live route · updating</div>
    <button className="recenter-map" onClick={() => toast("Route centered on your delivery") }><LocateFixed size={15} /> Recenter</button>
  </div>;
}

function sendBrowserNotification(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window) || Notification.permission !== "granted") return;
  new Notification(title, { body, icon: logoSrc });
}

function Success({ onHome }: { onHome: () => void }) {
  const [statusStep, setStatusStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState("0");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted");
  const updates = [
    { after: 1800, step: 2, title: "Kitchen is on it", description: "Your order has started cooking" },
    { after: 5200, step: 3, title: "Rider is on the way", description: "Your order just left Saffron Table" },
    { after: 9000, step: 4, title: "Nearly at your door", description: "Your order should arrive in a few minutes" },
  ];
  useEffect(() => {
    toast.success("Order confirmed", { description: "We sent your order to the kitchen", duration: 3200 });
    const timers = updates.map((update) => window.setTimeout(() => {
      setStatusStep(update.step);
      toast.success(update.title, { description: update.description, duration: 3200 });
      sendBrowserNotification(`Saffron Table · ${update.title}`, update.description);
    }, update.after));
    return () => timers.forEach(window.clearTimeout);
  }, []);
  const statusCopy = statusStep === 1 ? "Your order is confirmed and the kitchen is getting ready." : statusStep === 2 ? "Your order is being prepared with care." : statusStep === 3 ? "Your order is on the way to Indiranagar." : "Your order is nearly at your door.";
  return <div className="success-page"><div className="success-card"><span className="success-icon"><BadgeCheck size={30} /></span><span className="eyebrow">Order confirmed</span><h1>{statusStep === 4 ? <>Almost at<br /><em>your table.</em></> : <>It's on its way<br /><em>to your table.</em></>}</h1><p>{statusCopy} <strong>#ST-2409</strong> is being tracked live, so we'll keep you posted.</p><div className="order-track"><div className="track-line" />{[{ label: "Placed", icon: "✓" }, { label: "Preparing", icon: <Flame size={15} /> }, { label: "On the way", icon: "3" }, { label: "Delivered", icon: "4" }].map((track, index) => <div className={`track-step ${index < statusStep ? "done" : ""} ${index === statusStep ? "active" : ""}`} key={track.label}><span>{index < statusStep ? "✓" : track.icon}</span><small>{track.label}</small></div>)}</div><div className="live-status-pill"><span className="live-pulse" /> Live updates on · {statusStep === 1 ? "Kitchen notified" : statusStep === 2 ? "Preparing now" : statusStep === 3 ? "Out for delivery" : "Arriving soon"}</div><div className="success-meta"><span><MapPin size={15} /> Indiranagar, Bengaluru</span><span><Clock3 size={15} /> {statusStep >= 3 ? "10–15 min" : "35–45 min"}</span></div><DeliveryMap statusStep={statusStep} /><div className="delivery-alerts"><div><Bell size={15} /><span><strong>Get delivery alerts</strong><small>Keep this page closed and we'll notify you</small></span></div><button className={notificationsEnabled ? "enabled" : ""} onClick={async () => { if (!("Notification" in window)) { toast("Browser notifications aren't supported here"); return; } const permission = await Notification.requestPermission(); if (permission === "granted") { setNotificationsEnabled(true); toast.success("Delivery alerts enabled", { description: "We'll keep you posted in the background" }); } else { toast("Delivery alerts were not enabled"); } }}>{notificationsEnabled ? "Enabled" : "Enable"}</button></div><div className="feedback-card"><div className="feedback-heading"><span><ThumbsUp size={16} /> Order complete?</span><small>Tell us how it went</small></div><div className="rating-row">{[1, 2, 3, 4, 5].map((value) => <button className={rating >= value ? "selected" : ""} onClick={() => setRating(value)} aria-label={`${value} stars`} key={value}><Star size={21} fill={rating >= value ? "currentColor" : "none"} /></button>)}</div><div className="tip-row"><span><Gift size={15} /> Tip your rider</span><div>{["0", "20", "40", "60"].map((value) => <button className={tip === value ? "selected" : ""} key={value} onClick={() => setTip(value)}>{value === "0" ? "No tip" : `₹${value}`}</button>)}</div></div><button className="feedback-submit" onClick={() => toast.success("Thanks for the love", { description: `${rating || 5}-star rating${tip !== "0" ? ` · ₹${tip} rider tip` : ""} saved` })}>Save feedback <ArrowRight size={15} /></button></div><button className="primary-button" onClick={onHome}>Back to home <ArrowRight size={16} /></button></div></div> }

function Footer() { return <footer className="site-footer"><div className="footer-top"><div><Link href="/" className="brand footer-brand"><img className="brand-logo-img" src={logoSrc} alt="Saffron Table" /></Link><p>Good food, thoughtfully made.<br />Indiranagar · Bengaluru</p></div><div className="footer-links"><div><strong>Explore</strong><a href="#about">Our story</a><a href="#journal">Journal</a><Link href="/menu">Order online</Link></div><div><strong>Events & Bulk</strong><a href="mailto:events@saffrontable.in">events@saffrontable.in</a><a href="tel:+919876543210">+91 98765 43210</a></div><div><strong>Visit</strong><a href="#contact">Instagram ↗</a><a href="mailto:hello@saffrontable.in">Say hello</a><a href="#contact">11:30am — 11:00pm</a></div></div></div><div className="footer-bottom"><span>© 2026 Saffron Table</span><span>Made for kaviyarasur013@gmail.com</span></div></footer> }

function ReservationModal({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("19:00");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !name) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: date.toISOString().split('T')[0], time, guests: parseInt(guests, 10), name, notes })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Table booked!", { description: `See you on ${date.toDateString()} at ${time}` });
        onClose();
      } else {
        toast.error("Failed to book table");
      }
    } catch {
      toast.error("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="checkout-layout" style={{ background: 'var(--card)', padding: '32px', borderRadius: '12px', width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <span className="eyebrow">Reservation</span>
            <h3 style={{fontFamily:'var(--serif)', fontSize:'32px', margin:0}}>Book a table</h3>
          </div>
          <button onClick={onClose} style={{ alignSelf: 'flex-start' }}><X size={24}/></button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <div>
            <label style={{ display: 'block', fontSize:'13px', fontWeight:600, marginBottom:'8px' }}>Select Date</label>
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--background)' }}>
              <DayPicker mode="single" selected={date} onSelect={setDate} disabled={{ before: new Date() }} />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
                Time
                <select value={time} onChange={e => setTime(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }}>
                  <option value="18:30">18:30</option><option value="19:00">19:00</option>
                  <option value="19:30">19:30</option><option value="20:00">20:00</option>
                  <option value="20:30">20:30</option><option value="21:00">21:00</option>
                </select>
              </label>
              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
                Guests
                <select value={guests} onChange={e => setGuests(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                </select>
              </label>
            </div>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
              Full Name
              <input required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)' }} />
            </label>
            
            <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize:'13px', fontWeight:600 }}>
              Special Requests
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Allergies, anniversaries..." rows={3} style={{ padding: '12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--background)', resize: 'vertical' }} />
            </label>
            
            <button type="submit" className="primary-button wide" disabled={loading} style={{ marginTop: 'auto', padding: '16px' }}>
              {loading ? <LoaderCircle className="spin" size={16} /> : `Confirm Booking for ${guests} guests`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function KitchenView() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/orders").then(res => res.json()).then(setOrders).catch(console.error);
    const socket = io(); // Connects automatically via Vite proxy
    socket.on("new-order", (order) => {
      setOrders(prev => [order, ...prev]);
      toast("New Order Arrived!", { description: `Order ${order.id} received` });
    });
    return () => { socket.disconnect(); };
  }, []);

  return (
    <div style={{ padding: '24px', background: 'var(--background)', minHeight: '100vh', fontFamily: 'var(--sans)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>Kitchen Display</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
           <span style={{ padding: '4px 12px', background: 'var(--primary)', color: 'white', borderRadius: '16px', fontSize: '13px', fontWeight: 600 }}>{orders.length} Active Orders</span>
           <Link href="/" style={{ color: 'var(--muted-ink)' }}>Back to App</Link>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {orders.length === 0 && <p style={{ color: 'var(--muted-ink)' }}>No active orders. Kitchen is quiet.</p>}
        {orders.map(order => (
          <div key={order.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', background: 'var(--card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong style={{ fontSize: '18px' }}>{order.id}</strong>
              <small style={{ color: 'var(--muted-ink)' }}>{new Date(order.timestamp).toLocaleTimeString()}</small>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', borderTop: '1px dashed var(--border)', paddingTop: '12px' }}>
              {order.items.map((item: any, i: number) => (
                <li key={i} style={{ display: 'flex', padding: '6px 0', fontSize: '15px' }}>
                  <b style={{marginRight:'8px', minWidth: '24px'}}>{item.quantity}×</b>
                  <span style={{flex: 1}}>{item.dish.name}</span>
                </li>
              ))}
            </ul>
            <button className="primary-button wide" style={{ padding: '8px' }} onClick={() => {
              setOrders(prev => prev.filter(o => o.id !== order.id));
              toast.success(`Order ${order.id} marked as ready!`);
            }}>Mark Ready</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [cartItems, setCartItems] = useState<{ dish: Dish; quantity: number }[]>([]);
  const [liked, setLiked] = useState<string[]>(["saffron-biryani"]);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; points: number } | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [theme, setTheme] = useState('light');
  const [path, navigate] = useLocation();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.className = newTheme === 'dark' ? 'dark' : '';
  };

  useEffect(() => {
    const handleRes = () => setResOpen(true);
    window.addEventListener('open-reservation', handleRes);
    return () => window.removeEventListener('open-reservation', handleRes);
  }, []);

  useEffect(() => {
    fetch("/api/menu")
      .then(res => res.json())
      .then(data => {
        setDishes(data);
        setLoadingMenu(false);
      })
      .catch(err => {
        console.error("Failed to fetch menu", err);
        setLoadingMenu(false);
      });
      
    // Auto-login
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => localStorage.removeItem("token"));
    }
  }, []);

  const addToCart = (dish: Dish) => { setCartItems((items) => { const found = items.find((item) => item.dish.id === dish.id); return found ? items.map((item) => item.dish.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { dish, quantity: 1 }]; }); const nextCount = cartCount + 1; toast.success(`${dish.name} added to your order`, { description: `${nextCount} ${nextCount === 1 ? "item" : "items"} in your basket`, duration: 2600 }); };
  const toggleLike = (id: string) => setLiked((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loadingMenu) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoaderCircle className="spin" size={32} /></div>;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const PageTransition = ({ children }: { children: React.ReactNode }) => (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }}>
      {children}
    </motion.div>
  );

  const HomeWrapped = () => <PageTransition><Home dishes={dishes} addToCart={addToCart} liked={liked} toggleLike={toggleLike} onCart={() => setCartOpen(true)} onDishClick={setSelectedDish} /></PageTransition>;
  const MenuPageWrapped = () => <PageTransition><MenuPage dishes={dishes} addToCart={addToCart} liked={liked} toggleLike={toggleLike} onDishClick={setSelectedDish} /></PageTransition>;

  return <><Switch><Route path="/kitchen" component={KitchenView} /><Route><Header cartCount={cartCount} onCart={() => setCartOpen(true)} user={user} theme={theme} toggleTheme={toggleTheme} onLoginClick={() => { if (user) { localStorage.removeItem("token"); setUser(null); toast("Logged out successfully"); } else setAuthOpen(true); }} /><AnimatePresence mode="wait"><Switch location={path} key={path}><Route path="/" component={HomeWrapped} /><Route path="/menu" component={MenuPageWrapped} /><Route path="/checkout" component={() => <PageTransition><Checkout items={cartItems} onBack={() => setCartOpen(true)} onSuccess={() => {
    if (user) {
      const earned = Math.floor(cartItems.reduce((sum, item) => sum + item.dish.price * item.quantity, 0) / 100);
      setUser({ ...user, points: user.points + earned });
      toast.success(`You earned ${earned} Saffron Points!`);
    }
    setCartItems([]);
    navigate("/success");
  }} /></PageTransition>} /><Route path="/success" component={() => <PageTransition><Success onHome={() => navigate("/")} /></PageTransition>} /><Route component={HomeWrapped} /></Switch></AnimatePresence></Route></Switch>{cartOpen && <CartDrawer dishes={dishes} items={cartItems} setItems={setCartItems} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); navigate("/checkout"); }} />}
  {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={(u) => { setUser(u); toast.success(`Welcome, ${u.name}!`); }} />}
  {resOpen && <ReservationModal onClose={() => setResOpen(false)} />}
  {selectedDish && <DishModal dish={selectedDish} onClose={() => setSelectedDish(null)} onAdd={() => addToCart(selectedDish)} />}
  <Toaster position="bottom-right" toastOptions={{ style: { background: "#1f2a22", color: "#fffdf7", border: "0" } }} /></>;
}

export default App;
