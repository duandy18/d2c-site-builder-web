import { useEffect, useMemo, useState } from "react";

import { TemplateContentForm } from "../components/TemplateContentForm";
import {
  fetchTemplateContentForm,
  resolveTemplateContentTarget,
  updateTemplateSlotContent
} from "../api/templateContentApi";
import type {
  JsonRecord,
  PageContentFormResponse,
  TemplateContentTarget
} from "../model/templateContentModel";
import { PageFrame } from "../../../shared/ui/PageFrame";

import type { SiteBuilderPageProps } from "./PlaceholderPage";

type LoadState =
  | { status: "loading" }
  | { status: "ok"; form: PageContentFormResponse }
  | { status: "error"; error: string };

type NoticeState = {
  type: "success" | "error";
  message: string;
} | null;

function targetText(target: TemplateContentTarget): string {
  return `${target.siteCode}/${target.surfaceSlug}/${target.pageSlug}`;
}

export function TemplateContentPage({ page }: SiteBuilderPageProps) {
  const target = useMemo(
    () => resolveTemplateContentTarget(page.route_path),
    [page.route_path]
  );

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [notice, setNotice] = useState<NoticeState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadContentForm() {
    setState({ status: "loading" });

    try {
      setState({ status: "ok", form: await fetchTemplateContentForm(target) });
    } catch (err: unknown) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "加载失败"
      });
    }
  }

  useEffect(() => {
    let mounted = true;

    fetchTemplateContentForm(target)
      .then((form) => {
        if (mounted) {
          setState({ status: "ok", form });
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
  }, [target]);

  async function handleSaveSlot(slotCode: string, content: JsonRecord) {
    setIsSubmitting(true);
    setNotice(null);

    try {
      await updateTemplateSlotContent(target, slotCode, content);
      await loadContentForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "保存失败";
      setNotice({ type: "error", message });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageFrame
      title={page.title}
      description="按前端模板填写页面内容。区域、顺序、字体、布局和响应式由模板负责。"
    >
      {notice ? (
        <section
          className={
            notice.type === "success"
              ? "sb-notice sb-notice-success"
              : "sb-notice sb-notice-error"
          }
        >
          {notice.message}
        </section>
      ) : null}

      {state.status === "loading" ? (
        <section className="sb-card">正在加载模板内容表单...</section>
      ) : null}

      {state.status === "error" ? (
        <section className="sb-card sb-error">
          加载失败：{state.error}，target={targetText(target)}
        </section>
      ) : null}

      {state.status === "ok" ? (
        <>
          <section className="sb-card">
            <div className="sb-section-title-row">
              <div>
                <div className="sb-kicker">Template Content Form</div>
                <h2>{state.form.page_title}</h2>
                <p>
                  site={state.form.site_code} · surface={state.form.surface_code} · page=
                  {state.form.page_code}
                </p>
                <p>
                  template={state.form.template_name} · {state.form.template_key}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  void loadContentForm();
                }}
                disabled={isSubmitting}
              >
                刷新
              </button>
            </div>
          </section>

          <TemplateContentForm
            form={state.form}
            disabled={isSubmitting}
            onSaveSlot={handleSaveSlot}
            onSaved={(message) => setNotice({ type: "success", message })}
          />
        </>
      ) : null}
    </PageFrame>
  );
}
