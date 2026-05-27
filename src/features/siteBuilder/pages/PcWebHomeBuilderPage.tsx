import { PageFrame } from "../../../shared/ui/PageFrame";
import type { SiteBuilderPageProps } from "./PlaceholderPage";

export function PcWebHomeBuilderPage({ page }: SiteBuilderPageProps) {
  return (
    <PageFrame
      title={page.title}
      description="第二刀-B 会在这里接入 PC Web 首页 Draft、Planner Options、Region 和 Block 编辑。"
    >
      <section className="sb-card">
        <h2>编辑对象</h2>
        <div className="sb-grid">
          <span>site_code: default</span>
          <span>surface_code: pc_web</span>
          <span>page_code: home</span>
        </div>
      </section>

      <section className="sb-card">
        <h2>下一步能力</h2>
        <ul>
          <li>读取首页 Draft</li>
          <li>读取 Planner Options</li>
          <li>添加 / 编辑 Region</li>
          <li>添加 / 编辑 Block</li>
          <li>后端生成 region_code / block_code / renderer_key</li>
        </ul>
      </section>
    </PageFrame>
  );
}
