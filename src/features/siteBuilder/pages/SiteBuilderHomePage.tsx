import { useEffect, useState } from "react";

import { PageFrame } from "../../../shared/ui/PageFrame";
import { fetchAdminHealth } from "../api/siteBuilderApi";
import type { HealthResponse } from "../model/siteBuilderModel";

import { HealthCard } from "../components/HealthCard";
import type { SiteBuilderPageProps } from "./PlaceholderPage";

export function SiteBuilderHomePage({ page }: SiteBuilderPageProps) {
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
      title={page.title}
      description="Site Builder 是 D2C 内部购物网站搭建控制台，页面目录和模板目录由后端注册驱动。"
    >
      {error ? <section className="sb-card sb-error">服务状态加载失败：{error}</section> : null}
      <HealthCard health={health} />

      <section className="sb-card">
        <h2>当前阶段</h2>
        <ul>
          <li>模板 owner 已迁入数据库</li>
          <li>PC Web 当前保留首页、商品详情页 A、商品详情页 B</li>
          <li>内容填写采用 content + presentation 合同</li>
        </ul>
      </section>
    </PageFrame>
  );
}
