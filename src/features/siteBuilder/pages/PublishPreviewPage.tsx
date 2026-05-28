import { useEffect, useMemo, useState } from "react";

import { fetchRuntimePageContract } from "../api/runtimeContractApi";
import type {
  JsonRecord,
  RuntimeBlockContract,
  RuntimePageContractResponse,
  RuntimeRegionContract
} from "../model/runtimeContractModel";
import { PageFrame } from "../../../shared/ui/PageFrame";

import type { SiteBuilderPageProps } from "./PlaceholderPage";

type PreviewPageOption = {
  routePageCode: string;
  label: string;
  description: string;
};

type LoadState =
  | { status: "loading"; page: PreviewPageOption }
  | { status: "ok"; page: PreviewPageOption; contract: RuntimePageContractResponse }
  | { status: "error"; page: PreviewPageOption; error: string };

const DEFAULT_PREVIEW_PAGE: PreviewPageOption = {
  routePageCode: "home",
  label: "首页",
  description: "极简商品型首页草稿预览"
};

const PREVIEW_PAGE_OPTIONS: PreviewPageOption[] = [
  DEFAULT_PREVIEW_PAGE,
  {
    routePageCode: "product-detail-gallery",
    label: "商品详情页 A",
    description: "标准图册商品详情页草稿预览"
  },
  {
    routePageCode: "product-detail-image-matrix",
    label: "商品详情页 B",
    description: "多图展示商品详情页草稿预览"
  }
];

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function asRecordArray(value: unknown): JsonRecord[] {
  return Array.isArray(value)
    ? value.filter((item): item is JsonRecord => isRecord(item))
    : [];
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function statusText(block: RuntimeBlockContract): string {
  if (block.status === "active" && block.is_filled) {
    return "已填写";
  }

  if (block.required) {
    return "必填未填";
  }

  return "未填写";
}

function imageUrl(value: unknown): string {
  const image = asRecord(value);
  return asString(image.url);
}

function imageAlt(value: unknown, fallback: string): string {
  const image = asRecord(value);
  return asString(image.alt) || fallback;
}

function renderSimpleTitle(block: RuntimeBlockContract) {
  return (
    <div className="sb-preview-title-block">
      <p>{asString(block.content.kicker)}</p>
      <h2>{asString(block.content.title) || "首页标题未填写"}</h2>
    </div>
  );
}

function renderCampaignBanner(block: RuntimeBlockContract) {
  return (
    <div className="sb-preview-banner">
      <span>{asString(block.content.label) || "广告位"}</span>
      <h2>{asString(block.content.title) || "广告标题未填写"}</h2>
      <p>{asString(block.content.subtitle)}</p>
    </div>
  );
}

function renderCollectionTabs(block: RuntimeBlockContract) {
  const items = asRecordArray(block.content.items);

  return (
    <div className="sb-preview-collection-tabs">
      {items.length > 0 ? (
        items.map((item, index) => (
          <span key={`${block.block_code}:collection:${index}`}>
            {asString(item.label) || `集合 ${index + 1}`}
          </span>
        ))
      ) : (
        <span>集合导航未填写</span>
      )}
    </div>
  );
}

function renderCategoryNav(block: RuntimeBlockContract) {
  const items = asRecordArray(block.content.items);

  return (
    <div className="sb-preview-category-nav">
      {items.length > 0 ? (
        items.map((item, index) => (
          <span key={`${block.block_code}:category:${index}`}>
            {asString(item.label) || `分类 ${index + 1}`}
          </span>
        ))
      ) : (
        <span>分类导航未填写</span>
      )}
    </div>
  );
}

function renderServiceBar(block: RuntimeBlockContract) {
  const items = Array.isArray(block.content.items) ? block.content.items : [];

  return (
    <div className="sb-preview-service-bar">
      {items.length > 0 ? (
        items.map((item, index) => (
          <span key={`${block.block_code}:service:${index}`}>
            {asString(item) || `服务 ${index + 1}`}
          </span>
        ))
      ) : (
        <span>服务承诺未填写</span>
      )}
    </div>
  );
}

function renderProductGrid(block: RuntimeBlockContract) {
  const products = asRecordArray(block.content.products);

  if (products.length === 0) {
    return <div className="sb-preview-block">商品列表未填写</div>;
  }

  return (
    <div className="sb-preview-product-grid">
      {products.map((product, index) => {
        const title = asString(product.title) || `商品 ${index + 1}`;
        const mediaUrl = imageUrl(product.image);
        const salePrice = asString(product.sale_price);
        const originalPrice = asString(product.original_price);

        return (
          <div key={`${block.block_code}:product:${index}`} className="sb-preview-product-card">
            <div className="sb-preview-product-media">
              {mediaUrl ? <img src={mediaUrl} alt={title} /> : <span>商品图</span>}
            </div>
            <strong>{title}</strong>
            <span>{asString(product.category)}</span>
            <div className="sb-preview-price">
              {salePrice || "价格未填"}
              {originalPrice ? <del>{originalPrice}</del> : null}
            </div>
            <span>
              {asString(product.sold_count)}
              {asString(product.paid_buyers) ? ` · ${asString(product.paid_buyers)}` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function renderGalleryMain(block: RuntimeBlockContract) {
  const mediaUrl = imageUrl(block.content.main_image);

  return (
    <div className="sb-preview-gallery-main">
      {mediaUrl ? (
        <img src={mediaUrl} alt={imageAlt(block.content.main_image, "商品主图")} />
      ) : (
        <span>商品主图未填写</span>
      )}
    </div>
  );
}

function renderThumbs(block: RuntimeBlockContract) {
  const images = asRecordArray(block.content.images);

  return (
    <div className="sb-preview-thumbs">
      {images.length > 0 ? (
        images.map((item, index) => {
          const mediaUrl = imageUrl(item.image ?? item);

          return (
            <div key={`${block.block_code}:thumb:${index}`} className="sb-preview-thumb">
              {mediaUrl ? <img src={mediaUrl} alt={imageAlt(item, "缩略图")} /> : "缩略图"}
            </div>
          );
        })
      ) : (
        <div className="sb-preview-thumb">缩略图未填写</div>
      )}
    </div>
  );
}

function renderImageMatrixMain(block: RuntimeBlockContract) {
  const mediaUrl = imageUrl(block.content.main_image);

  return (
    <div className="sb-preview-image-matrix-main">
      {mediaUrl ? (
        <img src={mediaUrl} alt={imageAlt(block.content.main_image, "多图主图")} />
      ) : (
        <span>多图主图未填写</span>
      )}
    </div>
  );
}

function renderProductSummary(block: RuntimeBlockContract) {
  return (
    <div className="sb-preview-summary">
      <span>{asString(block.content.category)}</span>
      <h2>{asString(block.content.title) || "商品标题未填写"}</h2>
      <p>{asString(block.content.description)}</p>
    </div>
  );
}

function renderProductPrice(block: RuntimeBlockContract) {
  return (
    <div className="sb-preview-price">
      {asString(block.content.sale_price) || "实际价未填写"}
      {asString(block.content.original_price) ? (
        <del>{asString(block.content.original_price)}</del>
      ) : null}
    </div>
  );
}

function renderPromotion(block: RuntimeBlockContract) {
  return (
    <div className="sb-preview-banner">
      <span>{asString(block.content.badge) || "优惠"}</span>
      <strong>{asString(block.content.promo) || "优惠信息未填写"}</strong>
    </div>
  );
}

function renderSalesStats(block: RuntimeBlockContract) {
  return (
    <p>
      {asString(block.content.sold_count) || "已售未填写"}
      {asString(block.content.paid_buyers) ? ` · ${asString(block.content.paid_buyers)}` : ""}
    </p>
  );
}

function renderHighlights(block: RuntimeBlockContract) {
  const items = Array.isArray(block.content.items) ? block.content.items : [];

  return (
    <ul className="sb-preview-highlight-list">
      {items.length > 0 ? (
        items.map((item, index) => (
          <li key={`${block.block_code}:highlight:${index}`}>{asString(item)}</li>
        ))
      ) : (
        <li>商品卖点未填写</li>
      )}
    </ul>
  );
}

function renderDetailCards(block: RuntimeBlockContract) {
  const cards = asRecordArray(block.content.cards);

  return (
    <div className="sb-preview-block-list">
      {cards.length > 0 ? (
        cards.map((card, index) => (
          <div key={`${block.block_code}:card:${index}`} className="sb-preview-block">
            <strong>{asString(card.title) || `详情 ${index + 1}`}</strong>
            <p>{asString(card.body)}</p>
          </div>
        ))
      ) : (
        <div className="sb-preview-block">详情说明未填写</div>
      )}
    </div>
  );
}

function renderRawBlock(block: RuntimeBlockContract) {
  return (
    <pre className="sb-preview-raw-block">
      {JSON.stringify(
        {
          content: block.content,
          presentation: block.presentation
        },
        null,
        2
      )}
    </pre>
  );
}

function renderBlockBody(block: RuntimeBlockContract) {
  switch (block.renderer_key) {
    case "pc_web.simple_title":
      return renderSimpleTitle(block);
    case "pc_web.campaign_banner":
      return renderCampaignBanner(block);
    case "pc_web.product_collection_tabs":
      return renderCollectionTabs(block);
    case "pc_web.product_category_nav":
      return renderCategoryNav(block);
    case "pc_web.service_promise_bar":
      return renderServiceBar(block);
    case "pc_web.product_grid":
      return renderProductGrid(block);
    case "pc_web.product_gallery_main":
      return renderGalleryMain(block);
    case "pc_web.product_gallery_thumbs":
      return renderThumbs(block);
    case "pc_web.product_image_matrix_main":
      return renderImageMatrixMain(block);
    case "pc_web.product_image_matrix_side_images":
      return renderThumbs(block);
    case "pc_web.product_summary_info":
      return renderProductSummary(block);
    case "pc_web.product_price":
      return renderProductPrice(block);
    case "pc_web.product_promotion":
      return renderPromotion(block);
    case "pc_web.product_sales_stats":
      return renderSalesStats(block);
    case "pc_web.product_highlight_list":
      return renderHighlights(block);
    case "pc_web.product_detail_cards":
      return renderDetailCards(block);
    default:
      return renderRawBlock(block);
  }
}

function RuntimeBlockPreview({ block }: { block: RuntimeBlockContract }) {
  return (
    <div
      className={
        block.is_filled ? "sb-preview-block" : "sb-preview-block sb-preview-block-empty"
      }
    >
      <div className="sb-preview-block-toolbar">
        <span>{block.slot_code}</span>
        <span>{block.renderer_key}</span>
        <span>{statusText(block)}</span>
      </div>
      {renderBlockBody(block)}
    </div>
  );
}

function RuntimeRegionPreview({ region }: { region: RuntimeRegionContract }) {
  return (
    <section className="sb-preview-region">
      <div className="sb-preview-region-header">
        <div>
          <h3>{region.region_name}</h3>
          <p>{region.template_region_code}</p>
        </div>
        <span className="sb-pill">{region.status}</span>
      </div>

      <div className="sb-preview-block-list">
        {region.blocks.map((block) => (
          <RuntimeBlockPreview key={block.block_code} block={block} />
        ))}
      </div>
    </section>
  );
}

export function PublishPreviewPage({ page }: SiteBuilderPageProps) {
  const [selectedPage, setSelectedPage] =
    useState<PreviewPageOption>(DEFAULT_PREVIEW_PAGE);
  const [state, setState] = useState<LoadState>({
    status: "loading",
    page: DEFAULT_PREVIEW_PAGE
  });

  useEffect(() => {
    let mounted = true;
    const pageToLoad = selectedPage;

    fetchRuntimePageContract(pageToLoad.routePageCode)
      .then((contract) => {
        if (mounted) {
          setState({ status: "ok", page: pageToLoad, contract });
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

  function selectPreviewPage(option: PreviewPageOption) {
    setSelectedPage(option);
    setState({ status: "loading", page: option });
  }

  const currentContract =
    state.status === "ok" && state.page.routePageCode === selectedPage.routePageCode
      ? state.contract
      : null;

  const sortedRegions = useMemo(
    () =>
      currentContract
        ? [...currentContract.regions].sort((a, b) => a.sort_order - b.sort_order)
        : [],
    [currentContract]
  );

  return (
    <PageFrame
      title={page.title}
      description="预览当前草稿 Runtime Contract。只有预览通过后，后续才进入发布链路。"
    >
      <div className="sb-preview-page">
        <section className="sb-card">
          <div className="sb-preview-tabs">
            {PREVIEW_PAGE_OPTIONS.map((option) => (
              <button
                key={option.routePageCode}
                type="button"
                className={
                  option.routePageCode === selectedPage.routePageCode
                    ? "sb-preview-tab sb-preview-tab-active"
                    : "sb-preview-tab"
                }
                onClick={() => selectPreviewPage(option)}
              >
                <span>{option.label}</span>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </section>

        {state.status === "loading" ? (
          <section className="sb-card">正在加载预览...</section>
        ) : null}

        {state.status === "error" ? (
          <section className="sb-card sb-error">
            加载失败：{state.error}，page={state.page.routePageCode}
          </section>
        ) : null}

        {currentContract ? (
          <>
            <section className="sb-card">
              <div className="sb-section-title-row">
                <div>
                  <div className="sb-kicker">Runtime Preview</div>
                  <h2>{currentContract.page_title}</h2>
                  <p>
                    {currentContract.template_name} · {currentContract.template_key}
                  </p>
                </div>
              </div>
              <div className="sb-preview-contract-meta">
                <span>site={currentContract.site_code}</span>
                <span>surface={currentContract.surface_code}</span>
                <span>page={currentContract.page_code}</span>
                <span>contract={currentContract.contract_version}</span>
              </div>
            </section>

            <section className="sb-preview-canvas">
              {sortedRegions.map((region) => (
                <RuntimeRegionPreview key={region.region_code} region={region} />
              ))}
            </section>
          </>
        ) : null}
      </div>
    </PageFrame>
  );
}
