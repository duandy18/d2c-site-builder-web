import { PageFrame } from "../../../shared/ui/PageFrame";
import type { SiteBuilderPageNode } from "../model/navigationModel";

export type SiteBuilderPageProps = {
  page: SiteBuilderPageNode;
};

function statusText(value: string): string {
  if (value === "connected") {
    return "已接入";
  }

  if (value === "planned") {
    return "已规划";
  }

  if (value === "disabled") {
    return "不可用";
  }

  return value;
}

export function PlaceholderPage({ page }: SiteBuilderPageProps) {
  return (
    <PageFrame
      title={page.title}
      description="该页面已由 Site Builder 后端注册，前端组件将按计划逐步接入。"
    >
      <section className="sb-card">
        <div className="sb-grid">
          <span>页面编码：{page.page_code}</span>
          <span>路由路径：{page.route_path}</span>
          <span>组件 Key：{page.component_key}</span>
          <span>状态：{statusText(page.status)}</span>
        </div>
      </section>
    </PageFrame>
  );
}
