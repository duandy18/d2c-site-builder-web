import { PageFrame } from "../../../shared/ui/PageFrame";
import type { SiteBuilderPageProps } from "./PlaceholderPage";

export function PcWebOverviewPage({ page }: SiteBuilderPageProps) {
  return (
    <PageFrame
      title={page.title}
      description="PC Web 是当前 Site Builder 的第一条建站链路，后端模板 owner 已统一到数据库。"
    >
      <section className="sb-card">
        <h2>当前实现范围</h2>
        <ul>
          <li>页面目录由后端注册驱动</li>
          <li>模板目录由 sb_templates / sb_template_regions / sb_template_slots 驱动</li>
          <li>当前终态页面：首页、商品详情页 A、商品详情页 B</li>
          <li>购物车、结算、注册、登录暂时作为固定交易 / 账号模板</li>
        </ul>
      </section>
    </PageFrame>
  );
}
