import { PageFrame } from "../../../shared/ui/PageFrame";

export function RuntimePublishPage() {
  return (
    <PageFrame
      title="Runtime 发布"
      description="后续第三刀会在这里接入 manifest 和 pc_web/home.json。"
    >
      <section className="sb-card">第一刀仅保留页面入口。</section>
    </PageFrame>
  );
}
