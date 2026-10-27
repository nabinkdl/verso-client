import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, MapPin, ArrowLeft, ShoppingCart, Plus, Minus, Trash2, Filter,
  Tag, Clock, User as UserIcon, Package, BadgeCheck,
} from "lucide-react";
import { Product, CartItem, Order, OrderItem, DeliveryMethod, OrderStatus } from "../types";
import { CURRENT_USER_ID, initialProducts } from "../data";

type View = "browse" | "detail" | "cart" | "sell" | "myListings" | "orderHistory" | "orderDetail";

interface MarketplaceScreenProps {
  onCartChange?: (count: number) => void;
  onMessageSeller?: (sellerId: string, productTitle: string, productId?: string) => void;
  revealProductId?: string | null;
}

const CATEGORIES = [
  "All", "Electronics", "Fashion", "Home & Garden", "Vehicles",
  "Sports", "Music", "Books", "Toys", "Property",
];

const CONDITIONS = ["New", "Like New", "Good", "Fair"];
const DELIVERY_OPTIONS: { label: string; value: DeliveryMethod }[] = [
  { label: "Local Meet-up", value: "local_meetup" },
  { label: "Delivery", value: "delivery" },
];

const makeMarketImage = (seed: string) => {
  if (seed.startsWith("data:")) return seed;
  const hue = Math.floor(Math.random() * 360);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f2f2f2"/>
        <stop offset="50%" stop-color="hsl(${hue},40%,30%)"/>
        <stop offset="100%" stop-color="#050505"/>
      </linearGradient></defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <circle cx="80" cy="90" r="40" fill="rgba(255,255,255,0.15)"/>
      <text x="40" y="260" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="700">${seed}</text>
    </svg>
  `.replace(/\s+/g, " ").trim();
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function formatPrice(price: number) {
  return `$${price.toLocaleString()}`;
}

export default function MarketplaceScreen({ onCartChange, onMessageSeller, revealProductId }: MarketplaceScreenProps) {

  useEffect(() => {
    if (revealProductId) {
      const product = products.find(p => p.id === revealProductId);
      if (product) {
        setSelectedProduct(product);
        setImageIndex(0);
        setView("detail");
      }
    }
    // Only reveal a product when the requested id changes; `products` is
    // intentionally read from the current render without re-triggering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealProductId]);
  const [view, setView] = useState<View>("browse");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [myListingIds, setMyListingIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCondition, setFilterCondition] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(0);

  const [sellForm, setSellForm] = useState({
    title: "", price: "", category: "Electronics", condition: "Good",
    description: "", location: "", deliveryMethod: "delivery" as DeliveryMethod, photos: [] as string[],
  });

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { onCartChange?.(cartCount); }, [cartCount, onCartChange]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) return prev.map((i) => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { productId, quantity: 1 }];
    });
    showToast("Added to cart");
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => prev.map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
    showToast("Removed from cart");
  };

  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const placeOrder = () => {
    if (cartProducts.length === 0) return;
    const orderItems: OrderItem[] = cartProducts.map(({ product, quantity }) => ({
      productId: product.id, title: product.title, price: product.price,
      quantity, image: product.image,
    }));
    const total = cartProducts.reduce((s, { product, quantity }) => s + product.price * quantity, 0);
    const now = Date.now();
    const newOrder: Order = {
      id: `ord_${now}`,
      items: orderItems,
      total,
      status: selectedDeliveryMethod === 'local_meetup' ? 'Confirmed' : 'Confirmed',
      deliveryMethod: selectedDeliveryMethod,
      deliveryAddress: selectedDeliveryMethod === 'delivery' ? deliveryAddress : undefined,
      createdAt: now,
      estimatedDelivery: now + 86400000 * 5,
      trackingNumber: `TRK${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setSelectedDeliveryMethod('delivery');
    setDeliveryAddress("");
    setView("orderHistory");
    showToast("Order placed! Thanks for your purchase.");
  };

  const handleListItem = () => {
    const price = parseFloat(sellForm.price);
    if (!sellForm.title || !price || !sellForm.location) return;
    if (editingProductId) {
      setProducts((prev) => prev.map((p) => p.id === editingProductId ? {
        ...p, title: sellForm.title, price, description: sellForm.description,
        category: sellForm.category, condition: sellForm.condition as Product['condition'],
        deliveryMethod: sellForm.deliveryMethod,
        image: sellForm.photos[0] || p.image, images: sellForm.photos.length > 0 ? sellForm.photos : p.images, location: sellForm.location,
      } : p));
      setEditingProductId(null);
      setSellForm({ title: "", price: "", category: "Electronics", condition: "Good", description: "", location: "", deliveryMethod: "delivery", photos: [] });
      setView("browse");
      showToast("Item updated!");
      return;
    }
    const newProduct: Product = {
      id: `my_${Date.now()}`,
      title: sellForm.title,
      price,
      description: sellForm.description,
      category: sellForm.category,
      condition: sellForm.condition as Product['condition'],
      deliveryMethod: sellForm.deliveryMethod,
      image: sellForm.photos[0] || sellForm.title.toUpperCase().slice(0, 8),
      images: sellForm.photos.length > 0 ? sellForm.photos : undefined,
      location: sellForm.location,
      sellerId: CURRENT_USER_ID,
      sellerName: "You",
      createdAt: Date.now(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    setMyListingIds((prev) => [newProduct.id, ...prev]);
    setSellForm({ title: "", price: "", category: "Electronics", condition: "Good", description: "", location: "", deliveryMethod: "delivery", photos: [] });
    setView("myListings");
    showToast("Item listed successfully!");
  };

  const unlistItem = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setMyListingIds((prev) => prev.filter((i) => i !== id));
    showToast("Item removed");
  };

  const canCancel = (order: Order) => {
    if (order.deliveryMethod === 'local_meetup') return order.status === 'Confirmed' || order.status === 'Seller Accepted';
    return order.status === 'Confirmed';
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: 'Cancelled' as OrderStatus } : o));
    showToast("Order cancelled");
  };

  const getProduct = (id: string) => products.find((p) => p.id === id);
  const cartProducts = cart.map((c) => ({ product: getProduct(c.productId)!, quantity: c.quantity })).filter((c) => c.product);
  const cartTotal = cartProducts.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);
  const myListings = products.filter((p) => myListingIds.includes(p.id));

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    const matchCondition = filterCondition.length === 0 || filterCondition.includes(p.condition);
    const matchPrice = !maxPrice || p.price <= maxPrice;
    return matchSearch && matchCategory && matchCondition && matchPrice;
  });

  // ──────────────── BROWSE ────────────────
  if (view === "browse") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "var(--text)" }}>Marketplace</h1>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setView("orderHistory")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, position: "relative" }}>
              <Clock size={20} />
            </button>
            <button onClick={() => setView("myListings")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, position: "relative" }}>
              <Package size={22} />
            </button>
            <button onClick={() => setView("cart")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 6, position: "relative" }}>
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: 0, right: 0, background: "var(--text)", color: "var(--bg)", fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto", padding: "8px 16px", display: "flex", gap: 8, flexShrink: 0, scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <motion.button key={cat} onClick={() => setActiveCategory(cat)} whileTap={{ scale: 0.93 }}
              style={{ padding: "6px 16px", borderRadius: 20, border: "none", whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: activeCategory === cat ? 600 : 400, background: activeCategory === cat ? "var(--text)" : "var(--bg-raised)", color: activeCategory === cat ? "var(--bg)" : "var(--text-muted)", transition: "all 0.15s" }}>
              {cat}
            </motion.button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 80px", scrollBehavior: "smooth" }}>
          <div style={{ padding: "8px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", background: "var(--bg-raised)", borderRadius: 24, padding: "8px 14px", gap: 8 }}>
              <Search size={18} color="var(--text-tertiary)" />
              <input placeholder="Search marketplace..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "inherit" }} />
            </div>
          </div>

          <div style={{ padding: "0 16px 8px", display: "flex", gap: 8 }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView("sell")} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "0.5px solid var(--border)", background: "none", color: "var(--text)", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              + Sell Item
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowFilters((s) => !s)} style={{ width: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "0.5px solid var(--border)", background: showFilters ? "var(--surface)" : "none", color: "var(--text)", cursor: "pointer" }}>
              <Filter size={18} />
            </motion.button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                style={{ overflow: "hidden", padding: "0 16px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Condition</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {CONDITIONS.map((c) => {
                        const active = filterCondition.includes(c);
                        return (
                          <motion.button key={c} whileTap={{ scale: 0.9 }} onClick={() => setFilterCondition((prev) => active ? prev.filter((x) => x !== c) : [...prev, c])}
                            style={{ padding: "4px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: active ? 600 : 400, background: active ? "var(--text)" : "var(--bg-raised)", color: active ? "var(--bg)" : "var(--text-muted)" }}>
                            {c}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Max price</div>
                    <input type="number" min="0" value={maxPrice || ""} onChange={(e) => setMaxPrice(Number(e.target.value))} placeholder="Any" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ padding: "4px 12px", display: "flex", flexWrap: "wrap", gap: 12, alignContent: "flex-start" }}>
            {filtered.map((product, i) => (
              <motion.div key={product.id} onClick={() => { setSelectedProduct(product); setImageIndex(0); setView("detail"); }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.25 }}
                whileTap={{ scale: 0.97 }}
                style={{ width: "calc(50% - 6px)", borderRadius: 12, overflow: "hidden", background: "var(--bg-elevated-2)", border: "0.5px solid var(--border-subtle)", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--bg-elevated-2)" }}>
                  <img src={makeMarketImage(product.image)} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "36px 10px 10px", background: "linear-gradient(transparent 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.9) 100%)" }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-on-media)" }}>{formatPrice(product.price)}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                      <MapPin size={9} /><span>{product.location}</span>
                    </div>
                  </div>
                  <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "var(--text-on-media)", fontSize: 10, padding: "2px 7px", borderRadius: 5 }}>{product.condition}</span>
                  <span style={{ position: "absolute", top: 32, left: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 500 }}>{product.deliveryMethod === 'local_meetup' ? 'Meet-up' : 'Delivery'}</span>
                  <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>{product.category}</span>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div style={{ width: "100%", textAlign: "center", color: "var(--text-tertiary)", padding: 40, fontSize: 14 }}>No items found. Try a different search.</div>
            )}
          </div>
        </div>

        {toast && (
          <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--text)", padding: "8px 20px", borderRadius: 20, fontSize: 13, zIndex: 90, whiteSpace: "nowrap" }}>
            {toast}
          </div>
        )}
      </div>
    );
  }

  // ──────────────── DETAIL ────────────────
  if (view === "detail" && selectedProduct) {
    const p = selectedProduct;
    const inCart = cart.find((c) => c.productId === p.id);
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => { setSelectedProduct(null); setView("browse"); }} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Details</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 0 100px" }}>
          <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--bg-elevated-2)" }}>
            <img src={makeMarketImage((p.images || [p.image])[imageIndex])} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {(p.images || [p.image]).length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setImageIndex((i) => Math.max(0, i - 1)); }}
                  style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", color: "var(--text-on-media)", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: imageIndex === 0 ? 0.3 : 1 }}>
                  ‹
                </button>
                <button onClick={(e) => { e.stopPropagation(); setImageIndex((i) => Math.min((p.images || [p.image]).length - 1, i + 1)); }}
                  style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.5)", border: "none", color: "var(--text-on-media)", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, opacity: imageIndex === (p.images || [p.image]).length - 1 ? 0.3 : 1 }}>
                  ›
                </button>
                <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
                  {(p.images || [p.image]).map((_, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); setImageIndex(i); }}
                      style={{ width: 7, height: 7, borderRadius: "50%", background: i === imageIndex ? "var(--text-on-media)" : "rgba(255,255,255,0.35)", cursor: "pointer", transition: "all 0.15s" }} />
                  ))}
                </div>
              </>
            )}
          </div>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{formatPrice(p.price)}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text)", marginTop: 4 }}>{p.title}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                <Tag size={12} />{p.category}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                <BadgeCheck size={12} />{p.condition}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                <MapPin size={12} />{p.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                {p.deliveryMethod === 'local_meetup' ? '🤝' : '📦'} {p.deliveryMethod === 'local_meetup' ? 'Local Meet-up' : 'Delivery'}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--bg-raised)", padding: "4px 10px", borderRadius: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                <Clock size={12} />{timeAgo(p.createdAt)}
              </span>
            </div>
            <div style={{ borderTop: "0.5px solid var(--border-subtle)", paddingTop: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>Description</div>
              <div style={{ fontSize: 14, color: "var(--text-soft-2)", lineHeight: 1.6 }}>{p.description}</div>
            </div>
            <div style={{ borderTop: "0.5px solid var(--border-subtle)", paddingTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserIcon size={18} color="var(--text)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{p.sellerName}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Seller</div>
              </div>
              {p.sellerId !== CURRENT_USER_ID && (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => onMessageSeller?.(p.sellerId, p.title, p.id)} style={{ background: "none", border: "0.5px solid var(--border)", color: "var(--text)", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                  Message
                </motion.button>
              )}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 24px", background: "var(--bg)", borderTop: "0.5px solid var(--border-2)", display: "flex", gap: 10 }}>
          {p.sellerId === CURRENT_USER_ID ? (
            <>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => {
                setSellForm({ title: p.title, price: String(p.price), category: p.category, condition: p.condition, deliveryMethod: p.deliveryMethod, description: p.description, location: p.location, photos: p.image.startsWith("data:") ? [p.image] : [] });
                setEditingProductId(p.id);
                setSelectedProduct(null);
                setView("sell");
              }} style={{ flex: 1, background: "none", border: "0.5px solid var(--border)", color: "var(--text)", borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Edit
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { unlistItem(p.id); setSelectedProduct(null); setView("browse"); }} style={{ background: "#ff4444", border: "none", color: "var(--text-on-media)", borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Remove
              </motion.button>
            </>
          ) : (
            <>
              {inCart ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "var(--bg-raised)", borderRadius: 12, padding: "10px 0" }}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(inCart.productId, -1)} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}><Minus size={18} /></motion.button>
                  <motion.span key={inCart.quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", minWidth: 20, textAlign: "center" }}>{inCart.quantity}</motion.span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateQuantity(inCart.productId, 1)} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}><Plus size={18} /></motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeFromCart(inCart.productId)} style={{ background: "none", border: "none", color: "#ff4444", cursor: "pointer", padding: 4, marginLeft: 4 }}><Trash2 size={16} /></motion.button>
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => addToCart(p.id)} style={{ flex: 1, background: "var(--text)", border: "none", color: "var(--bg)", borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Add to Cart
                </motion.button>
              )}
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => { if (!inCart) addToCart(p.id); setView("cart"); }} style={{ background: "#1a6dff", border: "none", color: "var(--text-on-media)", borderRadius: 12, padding: "12px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Buy Now
              </motion.button>
            </>            
          )}
        </div>
        {toast && (
          <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--text)", padding: "8px 20px", borderRadius: 20, fontSize: 13, zIndex: 90, whiteSpace: "nowrap" }}>
            {toast}
          </div>
        )}
      </div>
    );
  }

  // ──────────────── CART ────────────────
  if (view === "cart") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setView("browse")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Cart ({cartCount})</span>
          {cart.length > 0 && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView("orderHistory")} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginRight: 8 }}>
              Orders
            </motion.button>
          )}
          {cart.length > 0 && (
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setCart([])} style={{ background: "none", border: "none", color: "#ff4444", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Clear
            </motion.button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 100px", display: "flex", flexWrap: "wrap", gap: 12, alignContent: "flex-start" }}>
          {cartProducts.length === 0 && (
            <div style={{ width: "100%", textAlign: "center", color: "var(--text-tertiary)", padding: 60, fontSize: 14 }}>
              Your cart is empty. Start shopping!
            </div>
          )}
          {cartProducts.map(({ product, quantity }, i) => (
            <motion.div key={product.id} onClick={() => { setSelectedProduct(product); setImageIndex(0); setView("detail"); }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}
              whileTap={{ scale: 0.97 }}
              style={{ width: "calc(50% - 6px)", borderRadius: 12, overflow: "hidden", background: "var(--bg-elevated-2)", border: "0.5px solid var(--border-subtle)", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--bg-elevated-2)" }}>
                <img src={makeMarketImage(product.image)} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "36px 10px 10px", background: "linear-gradient(transparent 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.9) 100%)" }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-on-media)" }}>{formatPrice(product.price)}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    <MapPin size={9} /><span>{product.location}</span>
                  </div>
                </div>
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "var(--text-on-media)", fontSize: 10, padding: "2px 7px", borderRadius: 5 }}>{product.condition}</span>
                <span style={{ position: "absolute", top: 32, left: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 500 }}>{product.deliveryMethod === 'local_meetup' ? 'Meet-up' : 'Delivery'}</span>
                <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>{product.category}</span>
                <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "2px 6px" }}>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }} style={{ background: "none", border: "none", color: "var(--text-on-media)", cursor: "pointer", padding: 2, display: "flex" }}><Minus size={12} /></motion.button>
                  <motion.span key={quantity} initial={{ scale: 1.3 }} animate={{ scale: 1 }} style={{ fontSize: 12, fontWeight: 600, color: "var(--text-on-media)", minWidth: 14, textAlign: "center" }}>{quantity}</motion.span>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }} style={{ background: "none", border: "none", color: "var(--text-on-media)", cursor: "pointer", padding: 2, display: "flex" }}><Plus size={12} /></motion.button>
                </div>
                <motion.button whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); removeFromCart(product.id); }} style={{ position: "absolute", top: 36, right: 6, background: "rgba(0,0,0,0.5)", border: "none", color: "var(--text-on-media)", cursor: "pointer", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>×</motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        {cartProducts.length > 0 && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px 24px", background: "var(--bg)", borderTop: "0.5px solid var(--border-2)" }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6 }}>Delivery Method</div>
              <div style={{ display: "flex", gap: 6 }}>
                {DELIVERY_OPTIONS.map((opt) => (
                  <motion.button key={opt.value} whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDeliveryMethod(opt.value)}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: selectedDeliveryMethod === opt.value ? 600 : 400, background: selectedDeliveryMethod === opt.value ? "var(--text)" : "var(--bg-raised)", color: selectedDeliveryMethod === opt.value ? "var(--bg)" : "var(--text-muted)" }}>
                    {opt.label}
                  </motion.button>
                ))}
              </div>
              {selectedDeliveryMethod === 'delivery' && (
                <input value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Delivery address *" style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginTop: 6 }} />
              )}
              {selectedDeliveryMethod === 'local_meetup' && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Arrange meet-up location with the seller after ordering.</div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14, color: "var(--text-muted)" }}>
              <span>Subtotal ({cartCount} items)</span>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrice(cartTotal)}</span>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={placeOrder} style={{ width: "100%", background: "#1a6dff", border: "none", color: "var(--text-on-media)", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {selectedDeliveryMethod === 'local_meetup' ? 'Request Meet-up' : 'Place Order'}
            </motion.button>
          </div>
        )}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "var(--surface)", color: "var(--text)", padding: "8px 20px", borderRadius: 20, fontSize: 13, zIndex: 90, whiteSpace: "nowrap" }}>
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ──────────────── SELL ────────────────
  if (view === "sell") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => { setEditingProductId(null); setView("browse"); }} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{editingProductId ? "Edit Item" : "Sell an Item"}</span>
        </div>
        <div style={{ flex: 1, overflow: "hidden", padding: "8px 16px 80px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Title *</label>
            <input value={sellForm.title} onChange={(e) => setSellForm((f) => ({ ...f, title: e.target.value }))} placeholder="What are you selling?" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Price *</label>
              <input value={sellForm.price} onChange={(e) => setSellForm((f) => ({ ...f, price: e.target.value }))} placeholder="0.00" type="number" min="0" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Condition</label>
              <select value={sellForm.condition} onChange={(e) => setSellForm((f) => ({ ...f, condition: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none" }}>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Category</label>
            <select value={sellForm.category} onChange={(e) => setSellForm((f) => ({ ...f, category: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none" }}>
              {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Location *</label>
            <input value={sellForm.location} onChange={(e) => setSellForm((f) => ({ ...f, location: e.target.value }))} placeholder="City, State" style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Delivery Method</label>
            <select value={sellForm.deliveryMethod} onChange={(e) => setSellForm((f) => ({ ...f, deliveryMethod: e.target.value as DeliveryMethod }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", appearance: "none" }}>
              {DELIVERY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Photos ({sellForm.photos.length}/7)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sellForm.photos.map((photo, i) => (
                <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", position: "relative", flexShrink: 0 }}>
                  <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button onClick={() => setSellForm((f) => ({ ...f, photos: f.photos.filter((_, j) => j !== i) }))}
                    style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "var(--text-on-media)", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    ×
                  </button>
                </div>
              ))}
              {sellForm.photos.length < 7 && (
                <div onClick={() => document.getElementById("photo-input")?.click()}
                  style={{ width: 72, height: 72, borderRadius: 8, border: "0.5px dashed var(--border-strong)", background: "var(--bg-elevated-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Add</span>
                </div>
              )}
            </div>
            <input id="photo-input" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => {
              const files = Array.from(e.target.files || []);
              const remaining = 7 - sellForm.photos.length;
              files.slice(0, remaining).forEach((file) => {
                const reader = new FileReader();
                reader.onload = () => setSellForm((f) => ({ ...f, photos: [...f.photos, reader.result as string] }));
                reader.readAsDataURL(file);
              });
              e.target.value = "";
            }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Description</label>
            <textarea value={sellForm.description} onChange={(e) => setSellForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe your item..." rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-elevated-2)", color: "var(--text)", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
          </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleListItem} style={{ width: "100%", background: "var(--text)", border: "none", color: "var(--bg)", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginTop: 8 }}>
              {editingProductId ? "Save Changes" : "List Item"}
            </motion.button>
        </div>
      </div>
    );
  }

  // ──────────────── ORDER HISTORY ────────────────
  if (view === "orderHistory") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setView("browse")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Order History</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 80px", display: "flex", flexWrap: "wrap", gap: 12, alignContent: "flex-start" }}>
          {orders.length === 0 && (
            <div style={{ width: "100%", textAlign: "center", color: "var(--text-tertiary)", padding: 60, fontSize: 14 }}>
              No orders yet. Start shopping!
            </div>
          )}
          {orders.map((order, i) => (
            <motion.div key={order.id} onClick={() => { setSelectedOrderId(order.id); setView("orderDetail"); }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}
              whileTap={{ scale: 0.97 }}
              style={{ width: "calc(50% - 6px)", borderRadius: 12, overflow: "hidden", background: "var(--bg-elevated-2)", border: "0.5px solid var(--border-subtle)", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--bg-elevated-2)" }}>
                <img src={makeMarketImage(order.items[0]?.image || "")} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "36px 10px 10px", background: "linear-gradient(transparent 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.9) 100%)" }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-on-media)" }}>{formatPrice(order.total)}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {order.items[0]?.title}{order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Ordered {timeAgo(order.createdAt)}</div>
                </div>
                <span style={{ position: "absolute", top: 8, left: 8, background: order.status === "Cancelled" ? "#ff4444" : order.status === "Delivered" || order.status === "Completed" || order.status === "Seller Accepted" ? "#4ade80" : order.status === "In Transit" || order.status === "Meetup Scheduled" ? "#60a5fa" : order.status === "Shipped" ? "#fbbf24" : "#999", color: "#000", fontSize: 10, padding: "2px 7px", borderRadius: 5, fontWeight: 700 }}>
                  {order.status}
                </span>
                <span style={{ position: "absolute", top: 32, left: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 500 }}>
                  {order.deliveryMethod === 'local_meetup' ? '🤝 Meet-up' : '📦 Delivery'}
                </span>
                <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ──────────────── ORDER DETAIL / TRACKING ────────────────
  if (view === "orderDetail" && selectedOrderId) {
    const order = orders.find((o) => o.id === selectedOrderId);
    if (!order) return null;
    const deliverySteps: Order['status'][] = ["Confirmed", "Shipped", "In Transit", "Delivered"];
    const meetupSteps: Order['status'][] = ["Confirmed", "Seller Accepted", "Meetup Scheduled", "Completed"];
    const steps = order.deliveryMethod === 'local_meetup' ? meetupSteps : deliverySteps;
    const currentStep = steps.indexOf(order.status);
    const daysLeft = Math.max(0, Math.ceil((order.estimatedDelivery - Date.now()) / 86400000));
    const meetupStepLabels: Record<string, string> = {
      "Confirmed": "Your meet-up request has been sent to the seller",
      "Seller Accepted": "Seller has accepted your meet-up request",
      "Meetup Scheduled": "Meet-up location and time have been arranged",
      "Completed": "Meet-up completed",
    };
    const deliveryStepLabels: Record<string, string> = {
      "Confirmed": "Your order has been placed",
      "Shipped": "Package has been shipped",
      "In Transit": "Package is on its way",
      "Delivered": "Package has been delivered",
    };
    const stepLabels = order.deliveryMethod === 'local_meetup' ? meetupStepLabels : deliveryStepLabels;
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setView("orderHistory")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Track Order</span>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 80px" }}>
          <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16, border: "0.5px solid var(--border-subtle)", marginBottom: 16, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Tracking #{order.trackingNumber}</span>
              <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, fontWeight: 600, color: order.status === "Cancelled" ? "#ff4444" : order.status === "Delivered" || order.status === "Completed" || order.status === "Seller Accepted" ? "#4ade80" : order.status === "Meetup Scheduled" ? "#60a5fa" : "#fbbf24", background: order.status === "Cancelled" ? "rgba(255,68,68,0.1)" : order.status === "Delivered" || order.status === "Completed" || order.status === "Seller Accepted" ? "rgba(74,222,128,0.1)" : order.status === "Meetup Scheduled" ? "rgba(96,165,250,0.1)" : "rgba(251,191,36,0.1)" }}>
                {order.status}
              </span>
            </div>
            {order.status !== "Delivered" && order.status !== "Completed" && order.status !== "Cancelled" && (
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {order.deliveryMethod === 'local_meetup'
                  ? "Awaiting seller response"
                  : daysLeft === 0 ? "Delivering today" : `Estimated delivery in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`
                }
              </div>
            )}
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
              <span>{order.deliveryMethod === 'local_meetup' ? '🤝' : '📦'}</span>
              <span>{order.deliveryMethod === 'local_meetup' ? 'Local Meet-up' : 'Delivery'}</span>
              {order.deliveryAddress && <span>— {order.deliveryAddress}</span>}
            </div>
          </div>

          {order.deliveryMethod === 'local_meetup' && order.status !== "Cancelled" && (
            <div style={{ background: "var(--bg-elevated)", borderRadius: 12, padding: 16, border: "0.5px solid var(--border-subtle)", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 4 }}>Meet-up Info</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>🤝 Local Meet-up</div>
              {order.status === "Confirmed" && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Waiting for the seller to accept your meet-up request.</div>
              )}
              {order.status === "Seller Accepted" && (
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Seller accepted! Coordinate a meet-up location and time via chat.</div>
              )}
              {order.status === "Meetup Scheduled" && (
                <div style={{ fontSize: 12, color: "#60a5fa", marginTop: 4 }}>Meet-up arranged. Remember to bring payment and inspect the item.</div>
              )}
              {order.status === "Completed" && (
                <div style={{ fontSize: 12, color: "#4ade80", marginTop: 4 }}>Meet-up completed. Enjoy your item!</div>
              )}
            </div>
          )}

          {order.status !== "Cancelled" && (
          <div style={{ position: "relative", padding: "0 0 0 24px", marginBottom: 20 }}>
            <div style={{ position: "absolute", left: 8, top: 8, bottom: 8, width: 2, background: "var(--border-subtle)", zIndex: 0 }} />
            {steps.map((step, i) => {
              const done = i <= currentStep;
              return (
                <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24, position: "relative", zIndex: 1 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 2, background: done ? "var(--text)" : "var(--bg-raised)", border: done ? "none" : "2px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--bg)" }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: done ? 600 : 400, color: done ? "var(--text)" : "var(--text-tertiary)" }}>{step}</div>
                    {i === currentStep && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{stepLabels[step]}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          <div style={{ borderTop: "0.5px solid var(--border-subtle)", paddingTop: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>Items</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {order.items.map((item) => (
                <div key={item.productId} style={{ display: "flex", gap: 12, background: "var(--bg-elevated)", borderRadius: 10, padding: 10, border: "0.5px solid var(--border-subtle)" }}>
                  <div style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--bg-elevated-2)", position: "relative" }}>
                    <img src={makeMarketImage(item.image)} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "14px 5px 5px", background: "linear-gradient(transparent 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.9) 100%)" }}>
                      <div style={{ fontWeight: 700, fontSize: 12, color: "var(--text-on-media)" }}>{formatPrice(item.price)}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>Qty: {item.quantity} · {formatPrice(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "0.5px solid var(--border-subtle)", paddingTop: 12, marginTop: 4, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--text-muted)" }}>Total</span>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{formatPrice(order.total)}</span>
          </div>
          <div style={{ padding: "12px 0" }}>
            {canCancel(order) ? (
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => cancelOrder(order.id)}
                style={{ width: "100%", background: "#ff4444", border: "none", color: "var(--text-on-media)", borderRadius: 12, padding: "12px 0", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel Order
              </motion.button>
            ) : order.status === "Cancelled" ? (
              <div style={{ textAlign: "center", fontSize: 13, color: "#ff4444", padding: "8px 0", border: "0.5px solid #ff4444", borderRadius: 12, opacity: 0.7 }}>Order Cancelled</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ──────────────── MY LISTINGS ────────────────
  if (view === "myListings") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setView("browse")} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <ArrowLeft size={22} />
          </button>
          <span style={{ fontSize: 16, fontWeight: 600 }}>My Listings</span>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setView("sell")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#1a6dff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            + New
          </motion.button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 80px", display: "flex", flexWrap: "wrap", gap: 12, alignContent: "flex-start" }}>
          {myListings.length === 0 && (
            <div style={{ width: "100%", textAlign: "center", color: "var(--text-tertiary)", padding: 60, fontSize: 14 }}>
              You haven't listed anything yet.
            </div>
          )}
          {myListings.map((product, i) => (
            <motion.div key={product.id} onClick={() => { setSelectedProduct(product); setImageIndex(0); setView("detail"); }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}
              whileTap={{ scale: 0.97 }}
              style={{ width: "calc(50% - 6px)", borderRadius: 12, overflow: "hidden", background: "var(--bg-elevated-2)", border: "0.5px solid var(--border-subtle)", cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
              <div style={{ position: "relative", aspectRatio: "1/1", background: "var(--bg-elevated-2)" }}>
                <img src={makeMarketImage(product.image)} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "36px 10px 10px", background: "linear-gradient(transparent 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.9) 100%)" }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text-on-media)" }}>{formatPrice(product.price)}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{product.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                    <MapPin size={9} /><span>{product.location}</span>
                  </div>
                </div>
                <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "var(--text-on-media)", fontSize: 10, padding: "2px 7px", borderRadius: 5 }}>{product.condition}</span>
                <span style={{ position: "absolute", top: 32, left: 8, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 500 }}>{product.deliveryMethod === 'local_meetup' ? 'Meet-up' : 'Delivery'}</span>
                <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "var(--text-on-media)", fontSize: 9, padding: "2px 7px", borderRadius: 5, fontWeight: 600 }}>{product.category}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); unlistItem(product.id); }} style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(255,68,68,0.85)", border: "none", color: "var(--text-on-media)", fontSize: 10, padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
                  Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
