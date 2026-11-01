import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { dashboardApi } from "@/api/dashboardApi";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/pages/dashboard/StatCard";
import { formatPaise } from "@/utils/money";
import { getErrorMessage } from "@/utils/error";
import "@/pages/dashboard/dashboard.css";

const count = (n) => (n ?? 0).toLocaleString("en-IN");

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    dashboardApi
      .get()
      .then((result) => {
        if (!ignore) {
          setData(result);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const refresh = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  // Highlights a card only when there is something to do
  const attention = (value, tone = "warning") => (value > 0 ? tone : "neutral");

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Sales are paid, shipped and delivered orders, minus refunds"
        actions={
          <button
            type="button"
            className="btn"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="dashboard__error">
          {error}
          <button type="button" className="btn btn--sm" onClick={refresh}>
            Try again
          </button>
        </div>
      )}

      {loading && !data && <p className="dashboard__loading">Loading...</p>}

      {data && (
        <>
          <section className="dashboard__section">
            <h2 className="dashboard__heading">Sales</h2>
            <div className="dashboard__grid">
              <StatCard
                label="Today"
                value={formatPaise(data.salesToday)}
                hint={`${count(data.ordersToday)} orders`}
              />
              <StatCard
                label="Last 30 days"
                value={formatPaise(data.salesLast30Days)}
                hint={`${count(data.ordersLast30Days)} orders`}
              />
              <StatCard
                label="All time"
                value={formatPaise(data.totalSales)}
                hint={`${count(data.totalOrders)} orders`}
              />
            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__heading">Needs your attention</h2>
            <div className="dashboard__grid">
              <StatCard
                label="Orders to ship"
                value={count(data.ordersToShip)}
                to="/orders?status=PAID"
                tone={attention(data.ordersToShip)}
              />
              <StatCard
                label="Shipments needing attention"
                value={count(data.shipmentsNeedingAttention)}
                hint="Failed or not yet booked"
                to="/orders"
                tone={attention(data.shipmentsNeedingAttention, "danger")}
              />
              <StatCard
                label="Returns awaiting review"
                value={count(data.returnsAwaitingReview)}
                to="/returns"
                tone={attention(data.returnsAwaitingReview)}
              />
              <StatCard
                label="New messages"
                value={count(data.newMessages)}
                to="/messages"
                tone={attention(data.newMessages)}
              />
              <StatCard
                label="Low stock products"
                value={count(data.lowStockProducts)}
                to="/products"
                tone={attention(data.lowStockProducts)}
              />
              <StatCard
                label="Out of stock products"
                value={count(data.outOfStockProducts)}
                to="/products"
                tone={attention(data.outOfStockProducts, "danger")}
              />
            </div>
          </section>

          <section className="dashboard__section">
            <h2 className="dashboard__heading">Audience</h2>
            <div className="dashboard__grid">
              <StatCard label="Customers" value={count(data.totalCustomers)} />
              <StatCard
                label="Newsletter subscribers"
                value={count(data.newsletterSubscribers)}
              />
            </div>
          </section>
        </>
      )}
    </>
  );
}
