import { useEffect, useMemo, useState } from "react";

import { fetchTemplateCatalog } from "../api/templateCatalogApi";
import type {
  TemplateCatalogItem,
  TemplateCatalogResponse,
  TemplateCatalogSlot
} from "../model/templateCatalogModel";
import { PageFrame } from "../../../shared/ui/PageFrame";

import type { SiteBuilderPageProps } from "./PlaceholderPage";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; catalog: TemplateCatalogResponse }
  | { status: "error"; error: string };

function pageLabel(template: TemplateCatalogItem): string {
  return `${template.page_title} · ${template.template_key}`;
}

function requiredText(required: boolean): string {
  return required ? "必填" : "可选";
}

function summarizeSlot(slot: TemplateCatalogSlot): string {
  const fieldTypes = Array.from(
    new Set(slot.content_fields.map((field) => field.value_type))
  );

  return fieldTypes.length > 0 ? fieldTypes.join(" / ") : "无字段";
}

function sortTemplates(templates: TemplateCatalogItem[]): TemplateCatalogItem[] {
  const orderByPageCode: Record<string, number> = {
    home: 10,
    category_entry: 20,
    product_list: 30,
    campaign: 40,
    content_page: 50
  };

  return [...templates].sort(
    (a, b) => (orderByPageCode[a.page_code] ?? 999) - (orderByPageCode[b.page_code] ?? 999)
  );
}

export function TemplateCatalogPage({ page }: SiteBuilderPageProps) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    fetchTemplateCatalog()
      .then((catalog) => {
        if (mounted) {
          setState({ status: "ok", catalog });
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setState({
            status: "error",
            error: err instanceof Error ? err.message : "加载失败"
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const templates = useMemo(() => {
    if (state.status !== "ok") {
      return [];
    }

    return sortTemplates(state.catalog.templates);
  }, [state]);

  return (
    <PageFrame
      title={page.title}
      description="查看 PC Web 可用页面模板、区域、Slot 和字段合同，并进入对应页面填写内容。"
    >
      {state.status === "loading" ? (
        <section className="sb-card">正在加载模板目录...</section>
      ) : null}

      {state.status === "error" ? (
        <section className="sb-card sb-error">加载失败：{state.error}</section>
      ) : null}

      {state.status === "ok" ? (
        <>
          <section className="sb-card">
            <div className="sb-section-title-row">
              <div>
                <div className="sb-kicker">Template Catalog</div>
                <h2>PC Web 模板目录</h2>
                <p>
                  当前共有 {templates.length} 个模板。模板决定页面结构、区域、Slot、字段合同和前端渲染方式；商家只进入内容填写页填写内容。
                </p>
              </div>
            </div>
          </section>

          <div className="sb-template-catalog">
            {templates.map((template) => (
              <article key={template.template_key} className="sb-template-card">
                <div className="sb-template-card-header">
                  <div>
                    <h2>{template.template_name}</h2>
                    <p>{pageLabel(template)}</p>
                  </div>
                  <a className="sb-primary-link" href={template.route_path}>
                    填写内容
                  </a>
                </div>

                <div className="sb-template-meta">
                  <span>页面：{template.page_title}</span>
                  <span>路径：{template.route_path}</span>
                  <span>区域：{template.region_count}</span>
                  <span>Slot：{template.slot_count}</span>
                  <span>字段：{template.field_count}</span>
                </div>

                <div className="sb-template-regions">
                  {template.regions.map((region) => (
                    <section
                      key={`${template.template_key}:${region.template_region_code}`}
                      className="sb-template-region"
                    >
                      <div className="sb-template-region-header">
                        <div>
                          <h3>{region.label}</h3>
                          <p>
                            {region.template_region_code} · {region.description}
                          </p>
                        </div>
                        <span className="sb-pill">{requiredText(region.required)}</span>
                      </div>

                      <div className="sb-template-slots">
                        {region.slots.map((slot) => (
                          <div
                            key={`${template.template_key}:${region.template_region_code}:${slot.slot_code}`}
                            className="sb-template-slot"
                          >
                            <div>
                              <strong>{slot.label}</strong>
                              <p>
                                {slot.slot_code} · {slot.renderer_key}
                              </p>
                              <p>字段类型：{summarizeSlot(slot)}</p>
                            </div>
                            <span className="sb-pill">{requiredText(slot.required)}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </PageFrame>
  );
}
