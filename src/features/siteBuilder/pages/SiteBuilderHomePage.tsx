import { useEffect, useState } from "react";

import { PageFrame } from "../../../shared/ui/PageFrame";
import { fetchAdminHealth } from "../api/siteBuilderApi";
import type { HealthResponse } from "../model/siteBuilderModel";
import { HealthCard } from "../components/HealthCard";

export function SiteBuilderHomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchAdminHealth()
      .then((response) => {
        if (mounted) {
          setHealth(response);
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "unknown error");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageFrame
      title="Site Builder 首页"
      description="第一刀只建立独立建站服务工程骨架，不迁移页面装修业务。"
    >
      {error ? <section className="sb-card sb-error">加载失败：{error}</section> : null}
      <HealthCard health={health} />
      <section className="sb-card">
        <h2>第一刀范围</h2>
        <ul>
          <li>独立仓库</li>
          <li>基础 Layout / Router / API Client</li>
          <li>健康检查</li>
          <li>Base path 构建检查</li>
        </ul>
      </section>
    </PageFrame>
  );
}
