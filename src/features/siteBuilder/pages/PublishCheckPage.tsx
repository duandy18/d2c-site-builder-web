import { useEffect, useMemo, useState } from "react";

import { fetchPublishReadiness } from "../api/publishReadinessApi";
import type {
  PublishReadinessIssue,
  PublishReadinessRegion,
  PublishReadinessResponse,
  PublishReadinessSlot,
  ReadinessStatus
} from "../model/publishReadinessModel";
import { PageFrame } from "../../../shared/ui/PageFrame";

import type { SiteBuilderPageProps } from "./PlaceholderPage";

type PublishCheckPageOption = {
  routePageCode: string;
  label: string;
  description: string;
};

type LoadState =
  | { status: "loading"; page: PublishCheckPageOption }
  | { status: "ok"; page: PublishCheckPageOption; readiness: PublishReadinessResponse }
  | { status: "error"; page: PublishCheckPageOption; error: string };

const DEFAULT_CHECK_PAGE: PublishCheckPageOption = {
  routePageCode: "home",
  label: "首页",
  description: "极简商品型首页发布检查"
};

const CHECK_PAGE_OPTIONS: PublishCheckPageOption[] = [
  DEFAULT_CHECK_PAGE,
  {
    routePageCode: "product-detail-gallery",
    label: "商品详情页 A",
    description: "标准图册商品详情页发布检查"
  },
  {
    routePageCode: "product-detail-image-matrix",
    label: "商品详情页 B",
    description: "多图展示商品详情页发布检查"
  }
];

function statusLabel(status: ReadinessStatus | "ready" | "blocked"): string {
  switch (status) {
    case "ready":
      return "可发布";
    case "blocked":
      return "阻塞";
    case "warning":
      return "有警告";
    case "empty":
      return "未填写";
  }
}

function issueLevelLabel(level: "error" | "warning"): string {
  return level === "error" ? "错误" : "警告";
}

function pageStatusText(readiness: PublishReadinessResponse): string {
  return readiness.ready ? "当前页面已满足发布条件" : "当前页面暂不可发布";
}

function issuesForSlot(
  issues: PublishReadinessIssue[],
  slotCode: string
): PublishReadinessIssue[] {
  return issues.filter((issue) => issue.slot_code === slotCode);
}

function IssueList({
  issues,
  emptyText
}: {
  issues: PublishReadinessIssue[];
  emptyText: string;
}) {
  if (issues.length === 0) {
    return <div className="sb-readiness-empty">{emptyText}</div>;
  }

  return (
    <div className="sb-readiness-issue-list">
      {issues.map((issue, index) => (
        <article
          className={
            issue.level === "error"
              ? "sb-readiness-issue sb-readiness-issue-error"
              : "sb-readiness-issue sb-readiness-issue-warning"
          }
          key={`${issue.code}:${issue.slot_code ?? "page"}:${issue.field_key ?? "field"}:${index}`}
        >
          <div>
            <strong>{issue.message}</strong>
            <span>
              {issueLevelLabel(issue.level)} · {issue.code}
            </span>
          </div>
          <p>
            {issue.template_region_code ? `Region：${issue.template_region_code}` : null}
            {issue.slot_code ? ` / Slot：${issue.slot_code}` : null}
            {issue.field_key ? ` / 字段：${issue.field_key}` : null}
          </p>
        </article>
      ))}
    </div>
  );
}

function SummaryCard({ readiness }: { readiness: PublishReadinessResponse }) {
  return (
    <section
      className={
        readiness.ready
          ? "sb-readiness-hero sb-readiness-hero-ready"
          : "sb-readiness-hero sb-readiness-hero-blocked"
      }
    >
      <div>
        <div className="sb-kicker">Publish Readiness</div>
        <h2>{pageStatusText(readiness)}</h2>
        <p>
          {readiness.template_name} · {readiness.template_key}
        </p>
      </div>
      <strong>{readiness.ready ? "READY" : "BLOCKED"}</strong>
    </section>
  );
}

function SummaryGrid({ readiness }: { readiness: PublishReadinessResponse }) {
  const summary = readiness.summary;

  return (
    <section className="sb-readiness-summary-grid">
      <div>
        <span>Region</span>
        <strong>{summary.region_count}</strong>
      </div>
      <div>
        <span>Slot</span>
        <strong>{summary.slot_count}</strong>
      </div>
      <div>
        <span>必填 Slot</span>
        <strong>{summary.required_slot_count}</strong>
      </div>
      <div>
        <span>已填写</span>
        <strong>{summary.filled_slot_count}</strong>
      </div>
      <div>
        <span>错误</span>
        <strong>{summary.issue_count}</strong>
      </div>
      <div>
        <span>警告</span>
        <strong>{summary.warning_count}</strong>
      </div>
      <div>
        <span>缺失必填</span>
        <strong>{summary.missing_required_slot_count}</strong>
      </div>
      <div>
        <span>状态</span>
        <strong>{statusLabel(readiness.status)}</strong>
      </div>
    </section>
  );
}

function SlotRow({
  slot,
  issues
}: {
  slot: PublishReadinessSlot;
  issues: PublishReadinessIssue[];
}) {
  const relatedIssues = issuesForSlot(issues, slot.slot_code);

  return (
    <article className={`sb-readiness-slot sb-readiness-slot-${slot.status}`}>
      <div className="sb-readiness-slot-main">
        <div>
          <strong>{slot.label}</strong>
          <span>{slot.slot_code}</span>
        </div>
        <em>{statusLabel(slot.status)}</em>
      </div>

      <div className="sb-readiness-slot-meta">
        <span>{slot.renderer_key}</span>
        <span>{slot.required ? "必填" : "可选"}</span>
        <span>{slot.is_filled ? "已填写" : "未填写"}</span>
        <span>错误 {slot.issue_count}</span>
        <span>警告 {slot.warning_count}</span>
      </div>

      {relatedIssues.length > 0 ? (
        <IssueList issues={relatedIssues} emptyText="该 Slot 暂无问题。" />
      ) : null}
    </article>
  );
}

function RegionPanel({
  region,
  issues
}: {
  region: PublishReadinessRegion;
  issues: PublishReadinessIssue[];
}) {
  return (
    <section className={`sb-readiness-region sb-readiness-region-${region.status}`}>
      <div className="sb-readiness-region-header">
        <div>
          <h3>{region.label}</h3>
          <p>{region.template_region_code}</p>
        </div>
        <span>{statusLabel(region.status)}</span>
      </div>

      <div className="sb-readiness-region-meta">
        <span>{region.required ? "必填 Region" : "可选 Region"}</span>
        <span>错误 {region.issue_count}</span>
        <span>警告 {region.warning_count}</span>
      </div>

      <div className="sb-readiness-slot-list">
        {region.slots.map((slot) => (
          <SlotRow key={slot.slot_code} slot={slot} issues={issues} />
        ))}
      </div>
    </section>
  );
}

function PublishReadinessResult({
  readiness
}: {
  readiness: PublishReadinessResponse;
}) {
  const errorIssues = readiness.issues.filter((issue) => issue.level === "error");
  const warningIssues = readiness.issues.filter((issue) => issue.level === "warning");

  return (
    <>
      <SummaryCard readiness={readiness} />
      <SummaryGrid readiness={readiness} />

      <section className="sb-card">
        <div className="sb-section-title-row">
          <div>
            <div className="sb-kicker">Errors</div>
            <h2>阻塞项</h2>
            <p>这些问题必须解决后才允许进入发布动作。</p>
          </div>
        </div>
        <IssueList issues={errorIssues} emptyText="没有阻塞项。" />
      </section>

      <section className="sb-card">
        <div className="sb-section-title-row">
          <div>
            <div className="sb-kicker">Warnings</div>
            <h2>提醒项</h2>
            <p>提醒项不阻塞发布，但发布前建议处理。</p>
          </div>
        </div>
        <IssueList issues={warningIssues} emptyText="没有提醒项。" />
      </section>

      <section className="sb-readiness-region-list">
        {readiness.regions.map((region) => (
          <RegionPanel
            key={region.template_region_code}
            region={region}
            issues={readiness.issues}
          />
        ))}
      </section>
    </>
  );
}

export function PublishCheckPage({ page }: SiteBuilderPageProps) {
  const [selectedPage, setSelectedPage] =
    useState<PublishCheckPageOption>(DEFAULT_CHECK_PAGE);
  const [state, setState] = useState<LoadState>({
    status: "loading",
    page: DEFAULT_CHECK_PAGE
  });

  useEffect(() => {
    let mounted = true;
    const pageToLoad = selectedPage;

    fetchPublishReadiness(pageToLoad.routePageCode)
      .then((readiness) => {
        if (mounted) {
          setState({ status: "ok", page: pageToLoad, readiness });
        }
      })
      .catch((err: unknown) => {
        if (mounted) {
          setState({
            status: "error",
            page: pageToLoad,
            error: err instanceof Error ? err.message : "加载失败"
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedPage]);

  function selectCheckPage(option: PublishCheckPageOption) {
    setSelectedPage(option);
    setState({ status: "loading", page: option });
  }

  function reloadCurrentPage() {
    setState({ status: "loading", page: selectedPage });
    fetchPublishReadiness(selectedPage.routePageCode)
      .then((readiness) => setState({ status: "ok", page: selectedPage, readiness }))
      .catch((err: unknown) =>
        setState({
          status: "error",
          page: selectedPage,
          error: err instanceof Error ? err.message : "加载失败"
        })
      );
  }

  const currentReadiness = useMemo(
    () =>
      state.status === "ok" && state.page.routePageCode === selectedPage.routePageCode
        ? state.readiness
        : null,
    [selectedPage.routePageCode, state]
  );

  return (
    <PageFrame
      title={page.title}
      description="检查页面草稿是否满足发布条件。这里只做只读检查，不执行发布。"
    >
      <div className="sb-readiness-page">
        <section className="sb-card">
          <div className="sb-section-title-row">
            <div>
              <div className="sb-kicker">Publish Check</div>
              <h2>发布前检查</h2>
              <p>先确认页面内容、必填 Slot、图片规则和模板特殊规则，再进入发布动作。</p>
            </div>
            <button
              className="sb-primary-action-button"
              type="button"
              onClick={reloadCurrentPage}
              disabled={state.status === "loading"}
            >
              重新检查
            </button>
          </div>

          <div className="sb-readiness-tabs">
            {CHECK_PAGE_OPTIONS.map((option) => (
              <button
                key={option.routePageCode}
                type="button"
                className={
                  option.routePageCode === selectedPage.routePageCode
                    ? "sb-readiness-tab sb-readiness-tab-active"
                    : "sb-readiness-tab"
                }
                onClick={() => selectCheckPage(option)}
              >
                <span>{option.label}</span>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </section>

        {state.status === "loading" ? (
          <section className="sb-card">正在执行发布检查...</section>
        ) : null}

        {state.status === "error" ? (
          <section className="sb-card sb-error">
            发布检查失败：{state.error}，page={state.page.routePageCode}
          </section>
        ) : null}

        {currentReadiness ? <PublishReadinessResult readiness={currentReadiness} /> : null}
      </div>
    </PageFrame>
  );
}
