"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAdminOrders } from "@/lib/api";
import { getAdminToken } from "@/lib/auth";
import type { AdminOrder } from "@/types";
import { toast } from "sonner";

const statusConfig = {
  SUCCESS: { icon: CheckCircle, color: "bg-green-500/10 text-green-600", label: "Paid" },
  PENDING: { icon: Clock, color: "bg-amber-500/10 text-amber-600", label: "Pending" },
  FAILED: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Failed" },
  CANCELLED: { icon: XCircle, color: "bg-muted text-muted-foreground", label: "Cancelled" },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, status = statusFilter) => {
    const token = getAdminToken();
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchAdminOrders(token, { page: p, limit: 20, status: status || undefined });
      setOrders(data.orders);
      setTotal(data.total);
      setPage(p);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, ""); }, []);

  const handleStatusFilter = (val: string) => {
    const s = val === "ALL" ? "" : val;
    setStatusFilter(s);
    load(1, s);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Orders</h2>
          <p className="text-sm text-muted-foreground">{total} total orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Select onValueChange={(val: string | null) => val && handleStatusFilter(val)} defaultValue="ALL">
            <SelectTrigger className="w-36 rounded-xl" id="status-filter">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Orders</SelectItem>
              <SelectItem value="SUCCESS">Paid</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl"
            onClick={() => load(page)}
            id="refresh-orders"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Book</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Order ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(6)].map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 animate-shimmer rounded w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                  <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const st = statusConfig[order.payment_status] || statusConfig.PENDING;
                const Icon = st.icon;
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium max-w-[160px] truncate">
                      {order.book_title}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.buyer_name}</div>
                      <div className="text-xs text-muted-foreground">{order.buyer_email}</div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                        <Icon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {order.cashfree_order_id?.slice(0, 12) || "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page === 1}
              onClick={() => load(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page * 20 >= total}
              onClick={() => load(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
