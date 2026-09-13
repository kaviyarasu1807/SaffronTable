self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Saffron Table delivery update";
  const options = {
    body: data.body || "Your order status has changed.",
    icon: "/manus-storage/saffron-table-mark_c0a32ff3.png",
    badge: "/manus-storage/saffron-table-mark_c0a32ff3.png",
    tag: "saffron-table-delivery",
    data: { url: data.url || "/success" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/success";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    const existing = clientList.find((client) => "focus" in client);
    if (existing) {
      existing.navigate(url);
      return existing.focus();
    }
    return clients.openWindow(url);
  }));
});
