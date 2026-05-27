import type { HealthResponse } from "../model/siteBuilderModel";

export function HealthCard({ health }: { health: HealthResponse | null }) {
  return (
    <section className="sb-card">
      <h2>服务状态</h2>
      {health ? (
        <div className="sb-grid">
          <span>service: {health.service}</span>
          <span>status: {health.status}</span>
          <span>environment: {health.environment ?? "—"}</span>
        </div>
      ) : (
        <span>等待加载...</span>
      )}
    </section>
  );
}
