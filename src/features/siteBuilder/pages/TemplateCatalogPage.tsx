import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import { fetchTemplateCatalog } from "../api/templateCatalogApi";
import type {
  TemplateCatalogItem,
  TemplateCatalogResponse,
  TemplateCatalogSlot
} from "../model/templateCatalogModel";
import type { SlotSchema } from "../model/templateContentModel";
import { PageFrame } from "../../../shared/ui/PageFrame";

import type { SiteBuilderPageProps } from "./PlaceholderPage";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; catalog: TemplateCatalogResponse }
  | { status: "error"; error: string };

type SurfaceTab = {
  surfaceCode: string;
  routePath: string;
  label: string;
  status: "connected" | "planned";
  description: string;
};

const PC_WEB_SURFACE: SurfaceTab = {
  surfaceCode: "pc_web",
  routePath: "/templates/pc-web",
  label: "PC Web 模板",
  status: "connected",
  description: "适用于桌面端独立站页面。"
};

const SURFACE_TABS: SurfaceTab[] = [
  PC_WEB_SURFACE,
  {
    surfaceCode: "mobile_web",
    routePath: "/templates/mobile-web",
    label: "手机 Web 模板",
    status: "planned",
    description: "后续复用同类页面结构，并适配移动端布局、图片比例和交互方式。"
  },
  {
    surfaceCode: "mini_program",
    routePath: "/templates/mini-program",
    label: "小程序模板",
    status: "planned",
    description: "后续复用同类页面结构，并适配小程序组件能力和端内跳转方式。"
  }
];

const TEMPLATE_ORDER_BY_PAGE_CODE: Record<string, number> = {
  home: 10,
  product_detail_gallery: 20,
  product_detail_image_matrix: 30
};

function surfaceByPath(pathname: string): SurfaceTab {
  return (
    SURFACE_TABS.find((surface) => pathname.startsWith(surface.routePath)) ??
    PC_WEB_SURFACE
  );
}

function pageLabel(template: TemplateCatalogItem): string {
  return `${template.page_title} · ${template.template_key}`;
}

function requiredText(required: boolean): string {
  return required ? "必填" : "可选";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function schemaFieldNames(schema: SlotSchema): string[] {
  const fields = schema.fields;

  return isRecord(fields) ? Object.keys(fields) : [];
}

function summarizeSlot(slot: TemplateCatalogSlot): string {
  const contentFields = schemaFieldNames(slot.content_schema);
  const presentationFields = schemaFieldNames(slot.presentation_schema);

  return `内容字段 ${contentFields.length} 个 / 表现字段 ${presentationFields.length} 个`;
}

function sortTemplates(templates: TemplateCatalogItem[]): TemplateCatalogItem[] {
  return [...templates].sort((a, b) => {
    const orderDiff =
      (TEMPLATE_ORDER_BY_PAGE_CODE[a.page_code] ?? 999) -
      (TEMPLATE_ORDER_BY_PAGE_CODE[b.page_code] ?? 999);

    if (orderDiff !== 0) {
      return orderDiff;
    }

    return a.template_name.localeCompare(b.template_name, "zh-CN");
  });
}

function defaultOpenRegionCodes(template: TemplateCatalogItem | null): string[] {
  const firstRegionCode = template?.regions[0]?.template_region_code;
  return firstRegionCode ? [firstRegionCode] : [];
}

export function TemplateCatalogPage({ page }: SiteBuilderPageProps) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [openRegionCodesByTemplate, setOpenRegionCodesByTemplate] = useState<
    Record<string, string[]>
  >({});

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

  const activeSurface = surfaceByPath(location.pathname);

  const templates = useMemo(() => {
    if (state.status !== "ok") {
      return [];
    }

    return sortTemplates(state.catalog.templates);
  }, [state]);

  const visibleTemplates = useMemo(
    () =>
      templates.filter(
        (template) => template.surface_code === activeSurface.surfaceCode
      ),
    [templates, activeSurface.surfaceCode]
  );

  const activeTemplate = useMemo(() => {
    const templateKey = searchParams.get("template");

    return (
      visibleTemplates.find((template) => template.template_key === templateKey) ??
      visibleTemplates[0] ??
      null
    );
  }, [searchParams, visibleTemplates]);

  const openRegionCodes = activeTemplate
    ? openRegionCodesByTemplate[activeTemplate.template_key] ??
      defaultOpenRegionCodes(activeTemplate)
    : [];

  function selectTemplate(template: TemplateCatalogItem) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("template", template.template_key);
    setSearchParams(nextParams);
  }

  function toggleRegion(regionCode: string) {
    if (!activeTemplate) {
      return;
    }

    const templateKey = activeTemplate.template_key;
    const currentOpenCodes =
      openRegionCodesByTemplate[templateKey] ??
      defaultOpenRegionCodes(activeTemplate);

    const nextOpenCodes = currentOpenCodes.includes(regionCode)
      ? currentOpenCodes.filter((item) => item !== regionCode)
      : [...currentOpenCodes, regionCode];

    setOpenRegionCodesByTemplate((current) => ({
      ...current,
      [templateKey]: nextOpenCodes
    }));
  }

  return (
    <PageFrame
      title={page.title}
      description="查看各终端页面模板、区域、Slot、内容 Schema 和表现 Schema，并进入对应页面填写内容。"
    >
      {state.status === "loading" ? (
        <section className="sb-card">正在加载模板目录...</section>
      ) : null}

      {state.status === "error" ? (
        <section className="sb-card sb-error">加载失败：{state.error}</section>
      ) : null}

      {state.status === "ok" ? (
        <>
          {activeSurface.status === "planned" ? (
            <section className="sb-card">
              <div className="sb-template-empty-state">
                <div className="sb-kicker">Planned Surface</div>
                <h2>{activeSurface.label}</h2>
                <p>{activeSurface.description}</p>
                <p>
                  当前阶段先完成 PC Web 模板闭环。手机 Web 和小程序后续会复用同类页面结构，
                  但会根据终端能力调整布局、图片比例、跳转方式和渲染组件。
                </p>
              </div>
            </section>
          ) : null}

          {activeSurface.status === "connected" && visibleTemplates.length > 0 ? (
            <>
              <section className="sb-card">
                <div className="sb-template-tab-row" role="tablist" aria-label="页面模板">
                  {visibleTemplates.map((template) => (
                    <button
                      key={template.template_key}
                      type="button"
                      className={
                        activeTemplate?.template_key === template.template_key
                          ? "sb-template-tab-button sb-template-tab-button-active"
                          : "sb-template-tab-button"
                      }
                      onClick={() => selectTemplate(template)}
                    >
                      <span>{template.template_name}</span>
                      <small>{template.template_key}</small>
                    </button>
                  ))}
                </div>
              </section>

              {activeTemplate ? (
                <article className="sb-template-card">
                  <div className="sb-template-card-header">
                    <div>
                      <h2>{activeTemplate.template_name}</h2>
                      <p>{pageLabel(activeTemplate)}</p>
                    </div>
                    <Link className="sb-primary-link" to={activeTemplate.route_path}>
                      填写内容
                    </Link>
                  </div>

                  <div className="sb-template-meta">
                    <span>页面：{activeTemplate.page_title}</span>
                    <span>路径：{activeTemplate.route_path}</span>
                    <span>区域：{activeTemplate.region_count}</span>
                    <span>Slot：{activeTemplate.slot_count}</span>
                    <span>字段：{activeTemplate.field_count}</span>
                  </div>

                  <div className="sb-template-regions">
                    {activeTemplate.regions.map((region) => {
                      const isOpen = openRegionCodes.includes(
                        region.template_region_code
                      );

                      return (
                        <section
                          key={`${activeTemplate.template_key}:${region.template_region_code}`}
                          className="sb-template-region"
                        >
                          <button
                            type="button"
                            className="sb-template-region-toggle"
                            onClick={() => toggleRegion(region.template_region_code)}
                          >
                            <div>
                              <h3>{region.label}</h3>
                              <p>
                                {region.template_region_code} · {region.description}
                              </p>
                            </div>
                            <span className="sb-template-region-actions">
                              <span className="sb-pill">
                                {requiredText(region.required)}
                              </span>
                              <span>{isOpen ? "收起" : "展开"}</span>
                            </span>
                          </button>

                          {isOpen ? (
                            <div className="sb-template-slots">
                              {region.slots.map((slot) => (
                                <div
                                  key={`${activeTemplate.template_key}:${region.template_region_code}:${slot.slot_code}`}
                                  className="sb-template-slot"
                                >
                                  <div>
                                    <strong>{slot.label}</strong>
                                    <p>
                                      {slot.slot_code} · {slot.renderer_key}
                                    </p>
                                    <p>{summarizeSlot(slot)}</p>
                                  </div>
                                  <span className="sb-pill">
                                    {requiredText(slot.required)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </section>
                      );
                    })}
                  </div>
                </article>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </PageFrame>
  );
}
