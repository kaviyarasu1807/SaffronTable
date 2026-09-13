import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LayoutDashboard, Mail, Bell, Download, Users, DollarSign, TrendingUp, Send } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage({ user }: { user: any }) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [salesData, setSalesData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      toast.error("Admin access required.");
      navigate("/");
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        const [salesRes, custRes, invRes] = await Promise.all([
          fetch("/api/admin/analytics/sales", { headers }),
          fetch("/api/admin/analytics/customers", { headers }),
          fetch("/api/menu")
        ]);

        if (salesRes.ok) setSalesData(await salesRes.json());
        if (custRes.ok) setCustomerData(await custRes.json());
        if (invRes.ok) setInventory(await invRes.json());
      } catch (err) {
        toast.error("Failed to load analytics");
      }
    };

    fetchAnalytics();
  }, [user, navigate]);

  if (!user || user.role !== "admin") return null;

  const handleExport = () => {
    window.open("/api/export/sales.csv", "_blank");
  };

  const handleEmailCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/marketing/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ subject: fd.get("subject"), body: fd.get("body") })
      });
      if (res.ok) toast.success("Email campaign dispatched successfully!");
      else toast.error("Failed to dispatch campaign");
    } catch (e) {
      toast.error("Network error");
    }
  };

  const handlePushNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/marketing/push", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ title: fd.get("title"), message: fd.get("message") })
      });
      if (res.ok) toast.success("Push notification sent to active users!");
      else toast.error("Failed to send push notification");
    } catch (e) {
      toast.error("Network error");
    }
  };

  const chartData = salesData?.recentOrders?.map((o: any, i: number) => ({
    name: `Order ${i + 1}`,
    amount: o.total,
  })) || [{ name: 'No Data', amount: 0 }];

  return (
    <div className="admin-page" style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex' }}>
      <aside className="admin-sidebar" style={{ width: '250px', background: 'var(--paper)', borderRight: '1px solid var(--line)', padding: '30px 20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '40px', color: 'var(--ink)' }}>Saffron Admin</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === 'dashboard' ? 'var(--sage)' : 'transparent', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '600', color: activeTab === 'dashboard' ? 'var(--ink)' : 'var(--muted-ink)' }}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("inventory")} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === 'inventory' ? 'var(--sage)' : 'transparent', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '600', color: activeTab === 'inventory' ? 'var(--ink)' : 'var(--muted-ink)' }}
          >
            <Package size={18} /> Inventory
          </button>
          <button 
            onClick={() => setActiveTab("marketing")} 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === 'marketing' ? 'var(--sage)' : 'transparent', borderRadius: '8px', border: 'none', textAlign: 'left', fontWeight: '600', color: activeTab === 'marketing' ? 'var(--ink)' : 'var(--muted-ink)' }}
          >
            <Bell size={18} /> Marketing
          </button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        {activeTab === "dashboard" && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '32px', color: 'var(--ink)' }}>Analytics Overview</h1>
                <p style={{ color: 'var(--muted-ink)' }}>Monitor your restaurant's performance and BI integrations.</p>
              </div>
              <button onClick={handleExport} className="primary-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={16} /> Export to Power BI (CSV)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              <div style={{ background: 'var(--paper)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted-ink)', marginBottom: '12px' }}><DollarSign size={18} /> Total Revenue</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>₹{salesData?.totalRevenue?.toLocaleString() || 0}</div>
              </div>
              <div style={{ background: 'var(--paper)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted-ink)', marginBottom: '12px' }}><TrendingUp size={18} /> Orders Today</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{salesData?.todayOrders || 0}</div>
              </div>
              <div style={{ background: 'var(--paper)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted-ink)', marginBottom: '12px' }}><Users size={18} /> Active Customers</div>
                <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{customerData?.activeCustomers || 0}</div>
              </div>
            </div>

            <div style={{ background: 'var(--paper)', padding: '24px', borderRadius: '12px', border: '1px solid var(--line)', marginBottom: '40px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Recent Sales (Last 5 Orders)</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="var(--muted-ink)" />
                    <YAxis stroke="var(--muted-ink)" />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid var(--line)' }} />
                    <Bar dataKey="amount" fill="var(--tomato)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "marketing" && (
          <div className="fade-in">
            <h1 style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '8px' }}>Marketing Campaigns</h1>
            <p style={{ color: 'var(--muted-ink)', marginBottom: '40px' }}>Engage your audience with targeted emails and push notifications.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
              
              <div style={{ background: 'var(--paper)', padding: '32px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--sage)', padding: '12px', borderRadius: '50%', color: '#6b9b5b' }}><Bell size={24} /></div>
                  <h3 style={{ fontSize: '20px' }}>Live Push Notification</h3>
                </div>
                <form onSubmit={handlePushNotification} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted-ink)', marginBottom: '8px' }}>Offer Title</label>
                    <input name="title" required placeholder="e.g. Flash Sale: 20% Off!" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted-ink)', marginBottom: '8px' }}>Message</label>
                    <textarea name="message" required placeholder="Describe your special offer..." rows={3} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}></textarea>
                  </div>
                  <button type="submit" className="primary-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Send size={16} /> Broadcast Now
                  </button>
                </form>
              </div>

              <div style={{ background: 'var(--paper)', padding: '32px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: 'var(--cream)', padding: '12px', borderRadius: '50%', color: 'var(--tomato)' }}><Mail size={24} /></div>
                  <h3 style={{ fontSize: '20px' }}>Email Campaign</h3>
                </div>
                <form onSubmit={handleEmailCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted-ink)', marginBottom: '8px' }}>Subject Line</label>
                    <input name="subject" required placeholder="e.g. Try our new Summer Menu" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted-ink)', marginBottom: '8px' }}>Email Content</label>
                    <textarea name="body" required placeholder="HTML content allowed..." rows={5} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--line)' }}></textarea>
                  </div>
                  <button type="submit" className="primary-button" style={{ background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Mail size={16} /> Send to {customerData?.activeCustomers || 'All'} Customers
                  </button>
                </form>
              </div>
              
            </div>
          </div>
        )}
        {activeTab === "inventory" && (
          <div className="fade-in">
            <h1 style={{ fontSize: '32px', color: 'var(--ink)', marginBottom: '8px' }}>Inventory Tracking</h1>
            <p style={{ color: 'var(--muted-ink)', marginBottom: '40px' }}>Monitor stock levels for your dishes and ingredients.</p>

            <div style={{ background: 'var(--paper)', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--cream)', borderBottom: '1px solid var(--line)' }}>
                  <tr>
                    <th style={{ padding: '16px 24px', fontWeight: '600', fontSize: '13px' }}>Dish Name</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', fontSize: '13px' }}>Category</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', fontSize: '13px' }}>Stock Level</th>
                    <th style={{ padding: '16px 24px', fontWeight: '600', fontSize: '13px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(dish => (
                    <tr key={dish.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '500' }}>{dish.name}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--muted-ink)' }}>{dish.category}</td>
                      <td style={{ padding: '16px 24px', fontSize: '14px' }}>{dish.inventory_count ?? 50} units</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold',
                          background: (dish.inventory_count ?? 50) > 10 ? '#e8f5e9' : '#ffebee',
                          color: (dish.inventory_count ?? 50) > 10 ? '#2e7d32' : '#c62828'
                        }}>
                          {(dish.inventory_count ?? 50) > 10 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
