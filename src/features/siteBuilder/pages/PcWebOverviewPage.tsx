import { PageFrame } from "../../../shared/ui/PageFrame";
import type { SiteBuilderPageProps } from "./PlaceholderPage";

export function PcWebOverviewPage({ page }: SiteBuilderPageProps) {
  return (
    <PageFrame
      title={page.title}
      description="PC Web 是当前 Site Builder 的第一条建站链路，先跑通首页搭建，再扩展分类、商品详情、活动页和内容页。"
    >
      <section className="sb-card">
        <h2>当前实现范围</h2>
        <ul>
          <li>后端页面注册驱动导航</li>
          <li>首页搭建页面入口</li>
          <li>分类入口页、商品列表页、商品详情页、活动页、内容页已规划</li>
        </ul>
      </section>
    </PageFrame>
  );
}
