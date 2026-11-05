"use client";

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';
import { FirebaseDatabaseService } from '@/backend/firebase/db.service';
import { Product } from '@/data/mockData';

type Order = {
  createdAt?: string | { toDate?: () => Date };
  status?: string;
  amount?: number;
  totalAmount?: number;
  shippingCharges?: number;
  merchandiseRevenue?: number;
  items?: Array<{
    id?: string;
    price?: number;
    costPrice?: number;
    quantity?: number;
  }>;
  subTotal?: number;
  discountAmount?: number;
};

type MonthSummary = {
  key: string;
  label: string;
  shortLabel: string;
  sales: number;
  profit: number;
  orders: number;
  ordersWithoutCost: number;
};

type ChartMetric = 'sales' | 'profit' | 'orders';
type Period = 3 | 6 | 12;

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const metricDetails: Record<ChartMetric, { label: string; color: string; tint: string }> = {
  sales: { label: 'Sales', color: '#16a36a', tint: 'bg-emerald-500' },
  profit: { label: 'Gross profit', color: '#6657e8', tint: 'bg-violet-500' },
  orders: { label: 'Orders', color: '#f59e0b', tint: 'bg-amber-500' },
};

function getOrderDate(value: Order['createdAt']): Date | null {
  const date = value && typeof value === 'object' && value.toDate
    ? value.toDate()
    : value ? new Date(value as string) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

function formatMetric(value: number, metric: ChartMetric) {
  return metric === 'orders' ? value.toLocaleString('en-IN') : currency.format(value);
}

function getChange(current: number, previous: number) {
  if (!previous) return current ? null : 0;
  return ((current - previous) / previous) * 100;
}

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<Period>(6);
  const [metric, setMetric] = useState<ChartMetric>('sales');
  const [selectedMonthKey, setSelectedMonthKey] = useState('');
  const [hoveredMonthKey, setHoveredMonthKey] = useState('');
  const dbService = useMemo(() => new FirebaseDatabaseService(), []);

  useEffect(() => {
    let active = true;
    dbService.getProducts((loadError) => {
      console.error('Failed to load products for analytics:', loadError);
      if (active) setError('Could not load product costs. Please refresh to try again.');
    })
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch((loadError: Error) => {
        console.error('Failed to load products for analytics:', loadError);
        if (active) setError('Could not load product costs. Please refresh to try again.');
      })
      .finally(() => {
        if (active) setProductsLoaded(true);
      });

    const unsubscribe = dbService.listenToAllOrders(
      (result) => {
        if (!active) return;
        setOrders(result);
        setOrdersLoaded(true);
      },
      () => {
        if (!active) return;
        setError('Could not load order analytics. Please refresh to try again.');
        setOrdersLoaded(true);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [dbService]);

  const monthlySummaries = useMemo(() => {
    const productCosts = new Map(products.map((product) => [product.id, product.costPrice]));
    const summaries = new Map<string, MonthSummary>();
    const now = new Date();

    for (let offset = 0; offset < 12; offset += 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      summaries.set(key, {
        key,
        label: monthDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        shortLabel: monthDate.toLocaleDateString('en-IN', { month: 'short' }),
        sales: 0,
        profit: 0,
        orders: 0,
        ordersWithoutCost: 0,
      });
    }

    for (const order of orders) {
      if (['cancelled', 'canceled', 'failed', 'rejected'].some((status) => order.status?.toLowerCase().includes(status))) continue;
      const orderDate = getOrderDate(order.createdAt);
      if (!orderDate) continue;

      const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      const summary = summaries.get(key);
      if (!summary) continue;

      const items = Array.isArray(order.items) ? order.items : [];
      const itemRevenue = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
      const netSales = Math.max(
        0,
        Number.isFinite(Number(order.merchandiseRevenue))
          ? Number(order.merchandiseRevenue)
          : (Number(order.subTotal) || itemRevenue) - Math.min(Number(order.discountAmount) || 0, Number(order.subTotal) || itemRevenue)
      );
      summary.sales += netSales;
      summary.orders += 1;

      const hasCompleteCosts = items.length > 0 && items.every((item) => {
        const cost = item.costPrice ?? (item.id ? productCosts.get(item.id) : undefined);
        return cost !== undefined && cost !== null && Number.isFinite(Number(cost));
      });
      if (!hasCompleteCosts) {
        summary.ordersWithoutCost += 1;
        continue;
      }

      const costOfGoods = items.reduce((sum, item) => {
        const cost = item.costPrice ?? (item.id ? productCosts.get(item.id) : 0);
        return sum + Number(cost) * (Number(item.quantity) || 0);
      }, 0);
      summary.profit += netSales - costOfGoods;
    }

    return Array.from(summaries.values());
  }, [orders, products]);

  const chartMonths = useMemo(() => monthlySummaries.slice(0, period).reverse(), [monthlySummaries, period]);
  const selectedMonth = monthlySummaries.find((month) => month.key === selectedMonthKey) || monthlySummaries[0];
  const activeMonth = monthlySummaries.find((month) => month.key === hoveredMonthKey) || selectedMonth;
  const previousMonth = monthlySummaries[1];
  const loading = !ordersLoaded || !productsLoaded;
  const maxChartValue = Math.max(1, ...chartMonths.map((month) => Math.max(0, month[metric])));
  const salesChange = getChange(monthlySummaries[0]?.sales || 0, previousMonth?.sales || 0);
  const profitChange = getChange(monthlySummaries[0]?.profit || 0, previousMonth?.profit || 0);

  const selectMonth = (month: MonthSummary) => {
    setSelectedMonthKey(month.key);
    setHoveredMonthKey('');
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-2xl bg-[#111827] px-6 py-7 text-white shadow-lg sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Store performance
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Sales Analytics</h1>
            <p className="mt-2 max-w-xl text-sm text-gray-300">Explore sales, gross profit and orders by month. Select any bar to inspect its performance.</p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 sm:self-auto">
            <CalendarDays className="h-4 w-4 text-emerald-300" />
            Live order data
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Sales this month"
          value={loading ? '—' : currency.format(monthlySummaries[0]?.sales || 0)}
          note={salesChange === null ? 'No previous month to compare' : `${salesChange >= 0 ? '+' : ''}${salesChange.toFixed(1)}% vs last month`}
          trend={salesChange}
          icon={<CircleDollarSign className="h-5 w-5" />}
          color="emerald"
        />
        <MetricCard
          label="Gross profit"
          value={loading ? '—' : currency.format(monthlySummaries[0]?.profit || 0)}
          note={profitChange === null ? 'No previous month to compare' : `${profitChange >= 0 ? '+' : ''}${profitChange.toFixed(1)}% vs last month`}
          trend={profitChange}
          icon={<BarChart3 className="h-5 w-5" />}
          color="violet"
        />
        <MetricCard
          label="Orders this month"
          value={loading ? '—' : (monthlySummaries[0]?.orders || 0).toLocaleString('en-IN')}
          note={`${monthlySummaries[0]?.ordersWithoutCost || 0} order${monthlySummaries[0]?.ordersWithoutCost === 1 ? '' : 's'} missing cost data`}
          icon={<ShoppingBag className="h-5 w-5" />}
          color="amber"
        />
        <MetricCard
          label="Average order value"
          value={loading ? '—' : currency.format((monthlySummaries[0]?.orders || 0) ? (monthlySummaries[0]?.sales || 0) / monthlySummaries[0].orders : 0)}
          note="Merchandise revenue per order"
          icon={<PackageCheck className="h-5 w-5" />}
          color="blue"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Performance over time</h2>
            <p className="mt-1 text-xs text-gray-500">Hover or focus a bar for its value, click to lock the month below.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg bg-gray-100 p-1" aria-label="Select chart metric">
              {(['sales', 'profit', 'orders'] as ChartMetric[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setMetric(option)}
                  aria-pressed={metric === option}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${metric === option ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {metricDetails[option].label}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg border border-gray-200 p-1" aria-label="Select time period">
              {([3, 6, 12] as Period[]).map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setPeriod(option)}
                  aria-pressed={period === option}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${period === option ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  {option}M
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 pb-5 pt-4 sm:px-6">
          <div className="mb-3 flex items-end justify-between">
            <p className="text-2xl font-bold tracking-tight text-gray-900">
              {loading ? '—' : formatMetric(activeMonth?.[metric] || 0, metric)}
            </p>
            <p className="text-xs font-medium text-gray-500">{activeMonth?.label} · {metricDetails[metric].label}</p>
          </div>
          <div className="overflow-x-auto border-b border-gray-100">
            <div
              className="grid h-60 gap-2 sm:gap-4"
              style={{
                gridTemplateColumns: `repeat(${chartMonths.length}, minmax(0, 1fr))`,
                minWidth: chartMonths.length > 6 ? '620px' : '100%',
              }}
            >
              {chartMonths.map((month) => {
                const value = month[metric];
                const height = value > 0 ? Math.max(6, (value / maxChartValue) * 100) : 0;
                const isSelected = selectedMonth?.key === month.key;
                const isHovered = hoveredMonthKey === month.key;
                return (
                  <button
                    type="button"
                    key={month.key}
                    aria-label={`${month.label}: ${formatMetric(value, metric)}. Select month`}
                    onMouseEnter={() => setHoveredMonthKey(month.key)}
                    onMouseLeave={() => setHoveredMonthKey('')}
                    onFocus={() => setHoveredMonthKey(month.key)}
                    onBlur={() => setHoveredMonthKey('')}
                    onClick={() => selectMonth(month)}
                    className="group relative flex min-w-0 flex-col items-center justify-end rounded-t-lg outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                  >
                    <span className={`mb-2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-semibold text-white shadow transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                      {formatMetric(value, metric)}
                    </span>
                    <span className="flex h-[165px] w-full items-end justify-center rounded-t-md bg-gray-50 transition-colors group-hover:bg-gray-100">
                      <span
                        className={`w-1/2 min-w-3 rounded-t-md transition-all duration-500 ${metricDetails[metric].tint} ${isSelected ? 'ring-2 ring-gray-900 ring-offset-2' : 'opacity-80 group-hover:opacity-100'}`}
                        style={{ height: `${height}%` }}
                      />
                    </span>
                    <span className={`mt-2 pb-2 text-[10px] font-medium sm:text-xs ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                      {month.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {!loading && chartMonths.every((month) => month.orders === 0) && (
            <p className="py-6 text-center text-sm text-gray-500">No orders found in this period yet.</p>
          )}
        </div>
      </section>

      {selectedMonth && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Selected month</p>
              <h2 className="mt-1 text-lg font-bold text-gray-900">{selectedMonth.label}</h2>
            </div>
            <div className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600">
              {selectedMonth.orders} order{selectedMonth.orders === 1 ? '' : 's'}
            </div>
          </div>
          <div className="grid divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
            <DetailItem label="Merchandise sales" value={currency.format(selectedMonth.sales)} />
            <DetailItem label="Gross profit" value={currency.format(selectedMonth.profit)} />
            <DetailItem label="Average order value" value={currency.format(selectedMonth.orders ? selectedMonth.sales / selectedMonth.orders : 0)} />
            <DetailItem label="Missing cost data" value={`${selectedMonth.ordersWithoutCost} order${selectedMonth.ordersWithoutCost === 1 ? '' : 's'}`} />
          </div>
        </section>
      )}

      <p className="px-1 text-xs leading-relaxed text-gray-500">
        Gross profit is merchandise revenue after discounts minus product unit costs; shipping is excluded. Orders without complete cost data are excluded from profit. Costs use the product&apos;s current unit cost, so profit may be estimated if costs have changed since an order.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  trend,
  icon,
  color,
}: {
  label: string;
  value: string;
  note: string;
  trend?: number | null;
  icon: React.ReactNode;
  color: 'emerald' | 'violet' | 'amber' | 'blue';
}) {
  const palette = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  }[color];

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`rounded-xl p-2.5 ring-1 transition-transform group-hover:scale-105 ${palette}`}>{icon}</span>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
      <div className="mt-2 flex min-h-5 items-center gap-1.5 text-xs text-gray-500">
        {trend !== undefined && trend !== null && (
          trend >= 0
            ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
            : <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
        )}
        <span className={trend === null ? 'text-gray-400' : trend !== undefined && trend < 0 ? 'text-rose-600' : trend !== undefined ? 'text-emerald-700' : ''}>
          {note}
        </span>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1.5 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
