"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchSalesStats } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import type { SalesStats } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) return;
    fetchSalesStats(token)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          icon: DollarSign,
          label: "Total Revenue",
          value: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
          }).format(stats.total_revenue),
          color: "text-green-500",
          bg: "bg-green-500/10",
        },
        {
          icon: CheckCircle,
          label: "Successful Orders",
          value: stats.successful_orders.toString(),
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        },
        {
          icon: Clock,
          label: "Pending Orders",
          value: stats.pending_orders.toString(),
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        },
        {
          icon: BookOpen,
          label: "Total Books",
          value: stats.total_books.toString(),
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1">Sales Overview</h2>
        <p className="text-muted-foreground text-sm">
          Your eBook store performance at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <Card key={i} className="border-border/60">
                <CardContent className="py-8">
                  <div className="h-4 animate-shimmer rounded w-3/4 mb-3" />
                  <div className="h-8 animate-shimmer rounded w-1/2" />
                </CardContent>
              </Card>
            ))
          : statCards.map(({ icon: Icon, label, value, color, bg }) => (
              <Card key={label} className="border-border/60 card-hover">
                <CardContent className="py-6 px-5">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Recent Orders */}
      {stats && stats.recent_orders.length > 0 && (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Recent Successful Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-3 border-b border-border/40 last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">{order.book_title}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.buyer_name} ·{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-500">
                      +₹{order.amount.toLocaleString("en-IN")}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-500/10 text-green-600"
                    >
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && stats?.total_orders === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No orders yet</p>
          <p className="text-sm">Share your store to start selling!</p>
        </div>
      )}
    </div>
  );
}
