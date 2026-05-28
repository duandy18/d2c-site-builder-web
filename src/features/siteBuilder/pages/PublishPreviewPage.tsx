import { useEffect, useMemo, useState } from "react";

import { fetchRuntimePageContract } from "../api/runtimeContractApi";
import type {
  JsonRecord,
  RuntimeBlockContract,
  RuntimePageContractResponse
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

type BlockMap = Record<string, RuntimeBlockContract | undefined>;

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

function asText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function imageUrl(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  const record = asRecord(value);
  const directUrl = asText(record.url).trim();

  if (directUrl.length > 0) {
    return directUrl;
  }

  if (record.image !== undefined) {
    return imageUrl(record.image);
  }

  return "";
}

function imageAlt(value: unknown, fallback: string): string {
  const record = asRecord(value);
  return asText(record.alt).trim() || fallback;
}

function blockText(
  block: RuntimeBlockContract | undefined,
  fieldKey: string,
  fallback: string
): string {
  const value = block?.content[fieldKey];
  const text = asText(value).trim();

  return text.length > 0 ? text : fallback;
}

function blockRecords(block: RuntimeBlockContract | undefined, fieldKey: string): JsonRecord[] {
  return asRecordArray(block?.content[fieldKey]);
}

function blockTextList(block: RuntimeBlockContract | undefined, fieldKey: string): string[] {
  const value = block?.content[fieldKey];

  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (isRecord(item)) {
        return asText(item.label) || asText(item.title) || asText(item.name);
      }

      return asText(item);
    })
    .filter((item) => item.trim().length > 0);
}

function listLabel(item: JsonRecord, fallback: string): string {
  return asText(item.label) || asText(item.title) || asText(item.name) || fallback;
}

function buildBlockMap(contract: RuntimePageContractResponse): BlockMap {
  const result: BlockMap = {};

  for (const region of contract.regions) {
    for (const block of region.blocks) {
      result[block.slot_code] = block;
    }
  }

  return result;
}

function allBlocks(contract: RuntimePageContractResponse): RuntimeBlockContract[] {
  return contract.regions.flatMap((region) => region.blocks);
}

function blockStatusText(block: RuntimeBlockContract): string {
  if (block.status === "active" && block.is_filled) {
    return "已填写";
  }

  if (block.required) {
    return "必填未填";
  }

  return "未填写";
}

function renderCartIcon() {
  return (
    <svg viewBox="0 0 32 32" role="presentation" aria-hidden="true">
      <path
        className="sb-runtime-cart-body"
        d="M6.3 7.4h2.1c.8 0 1.5.6 1.7 1.4l.3 1.3h14.9c.8 0 1.4.8 1.2 1.6l-1.8 7.1c-.3 1.2-1.4 2.1-2.7 2.1H13c-1.3 0-2.4-.9-2.7-2.2L8.7 10.4 8.3 9H6.3c-.5 0-.9-.4-.9-.8s.4-.8.9-.8Z"
      />
      <path
        className="sb-runtime-cart-cut"
        d="M13.2 13.4h9.7l-.9 3.6h-8.1l-.7-3.6Z"
      />
      <circle className="sb-runtime-cart-wheel" cx="14.2" cy="24.3" r="1.8" />
      <circle className="sb-runtime-cart-wheel" cx="22.4" cy="24.3" r="1.8" />
    </svg>
  );
}

function RuntimeEmptyMedia({ label }: { label: string }) {
  return <div className="sb-runtime-empty-media">{label}</div>;
}

function PreviewReadinessPanel({ contract }: { contract: RuntimePageContractResponse }) {
  const blocks = allBlocks(contract);
  const requiredBlocks = blocks.filter((block) => block.required);
  const filledBlocks = blocks.filter((block) => block.is_filled);
  const missingRequiredBlocks = requiredBlocks.filter((block) => !block.is_filled);

  return (
    <section className="sb-runtime-readiness">
      <div>
        <span>Slot 总数</span>
        <strong>{blocks.length}</strong>
      </div>
      <div>
        <span>已填写</span>
        <strong>{filledBlocks.length}</strong>
      </div>
      <div>
        <span>必填未填</span>
        <strong>{missingRequiredBlocks.length}</strong>
      </div>
      <div>
        <span>预览状态</span>
        <strong>{contract.status}</strong>
      </div>
    </section>
  );
}

function SlotStatusPanel({ contract }: { contract: RuntimePageContractResponse }) {
  return (
    <section className="sb-card">
      <div className="sb-section-title-row">
        <div>
          <div className="sb-kicker">Slot Status</div>
          <h2>预览检查提示</h2>
          <p>这里只做前端可读提示，不替代后续发布前校验 API。</p>
        </div>
      </div>

      <div className="sb-runtime-slot-status-grid">
        {allBlocks(contract).map((block) => (
          <div
            key={block.block_code}
            className={
              block.is_filled
                ? "sb-runtime-slot-status sb-runtime-slot-status-filled"
                : block.required
                  ? "sb-runtime-slot-status sb-runtime-slot-status-required"
                  : "sb-runtime-slot-status"
            }
          >
            <strong>{block.slot_code}</strong>
            <span>{block.renderer_key}</span>
            <em>{blockStatusText(block)}</em>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomePreview({ contract }: { contract: RuntimePageContractResponse }) {
  const blocks = buildBlockMap(contract);
  const brandBlock = blocks["header.brand"];
  const loginBlock = blocks["header.login_link"];
  const collectionBlock = blocks["product_collection.tabs"];
  const heroBlock = blocks["hero.title"];
  const campaignBlock = blocks["campaign.banner"];
  const categoryBlock = blocks["product_category.nav"];
  const cartBlock = blocks["cart.entry"];
  const productGridBlock = blocks["product_grid.list"];
  const serviceBlock = blocks["service.promise_bar"];
  const legalBlock = blocks["site.legal_footer"];

  const collectionItems = blockRecords(collectionBlock, "items");
  const categoryItems = blockRecords(categoryBlock, "items");
  const products = blockRecords(productGridBlock, "products");
  const services = blockTextList(serviceBlock, "items");
  const cartTarget = blockText(cartBlock, "link_target", "#cart");

  return (
    <main className="sb-runtime-shop">
      <header className="sb-runtime-shop-header">
        <a className="sb-runtime-shop-logo" href="#top">
          {blockText(brandBlock, "brand_name", "品牌名称未填写")}
        </a>
        <a className="sb-runtime-login-link" href={blockText(loginBlock, "link_target", "#login")}>
          {blockText(loginBlock, "label", "登录")}
        </a>
      </header>

      <nav className="sb-runtime-tabs" aria-label="商品集合导航">
        {collectionItems.length > 0 ? (
          collectionItems.map((item, index) => (
            <button
              className={index === 0 ? "active" : undefined}
              key={`collection:${index}`}
              type="button"
            >
              {listLabel(item, `集合 ${index + 1}`)}
            </button>
          ))
        ) : (
          <span>商品集合导航未填写</span>
        )}
      </nav>

      <section className="sb-runtime-hero" id="top">
        <p>{blockText(heroBlock, "kicker", "首页副标题未填写")}</p>
        <h1>{blockText(heroBlock, "title", "首页标题未填写")}</h1>
      </section>

      <section className="sb-runtime-ad" id="campaign">
        <div>
          <span>{blockText(campaignBlock, "label", "广告位")}</span>
          <strong>{blockText(campaignBlock, "title", "广告标题未填写")}</strong>
          <p>{blockText(campaignBlock, "subtitle", "广告说明未填写")}</p>
        </div>
        <a href={blockText(campaignBlock, "link_target", "#products")}>去选购</a>
      </section>

      <div className="sb-runtime-category-bar">
        <section className="sb-runtime-category-row" id="categories" aria-label="商品分类">
          {categoryItems.length > 0 ? (
            categoryItems.map((category, index) => (
              <button
                className={index === 0 ? "primary-category active" : undefined}
                key={`category:${index}`}
                type="button"
              >
                {listLabel(category, `分类 ${index + 1}`)}
              </button>
            ))
          ) : (
            <span>商品分类导航未填写</span>
          )}
        </section>
        <a className="sb-runtime-category-cart" href={cartTarget} aria-label="进入购物车">
          {renderCartIcon()}
        </a>
      </div>

      <section className="sb-runtime-products" id="products">
        <div className="sb-runtime-section-title">
          <h2>{blockText(productGridBlock, "source", "全部商品")}</h2>
          <span>{products.length > 0 ? `${products.length} 件商品` : "商品列表未填写"}</span>
        </div>

        {products.length > 0 ? (
          <div className="sb-runtime-product-grid">
            {products.map((product, index) => {
              const title = asText(product.title) || `商品 ${index + 1}`;
              const mediaUrl = imageUrl(product.image);

              return (
                <article className="sb-runtime-product-card" key={`product:${index}`}>
                  <div className="sb-runtime-product-image">
                    {mediaUrl ? <img alt={title} src={mediaUrl} /> : <RuntimeEmptyMedia label="商品图未填写" />}
                    <span>{asText(product.badge) || asText(product.category) || "商品"}</span>
                  </div>

                  <div className="sb-runtime-product-body">
                    <p>{asText(product.category) || "分类未填写"}</p>
                    <h3>{title}</h3>

                    <div className="sb-runtime-buy-row">
                      <div className="sb-runtime-price-row">
                        <strong>{asText(product.sale_price) || "价格未填"}</strong>
                        {asText(product.original_price) ? <span>{asText(product.original_price)}</span> : null}
                      </div>

                      <label className="sb-runtime-quantity-select">
                        <span>数量</span>
                        <select defaultValue="1">
                          {[1, 2, 3, 4, 5].map((quantity) => (
                            <option key={quantity} value={quantity}>
                              {quantity}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="sb-runtime-promo">{asText(product.promo) || "优惠信息未填写"}</div>

                    <div className="sb-runtime-product-stats">
                      <span>已售 {asText(product.sold_count) || "未填写"}</span>
                      <span>{asText(product.paid_buyers) || "未填写"} 人已付款</span>
                    </div>

                    <button type="button">加入购物车</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="sb-runtime-empty-state">商品列表未填写。请在首页搭建的商品列表 Slot 中补充 products。</div>
        )}
      </section>

      {services.length > 0 ? (
        <section className="sb-runtime-services">
          {services.map((service) => (
            <span key={service}>{service}</span>
          ))}
        </section>
      ) : null}

      <footer className="sb-runtime-footer">
        <span>{blockText(legalBlock, "copyright_text", "版权信息未填写")}</span>
        <span>{blockText(legalBlock, "icp_record_number", "ICP备案号待填写")}</span>
        <span>{blockText(legalBlock, "police_record_number", "公安备案号待填写")}</span>
      </footer>
    </main>
  );
}

function collectImageUrls(
  mainBlock: RuntimeBlockContract | undefined,
  imageBlock: RuntimeBlockContract | undefined
): string[] {
  const urls = [
    imageUrl(mainBlock?.content.main_image),
    ...blockRecords(imageBlock, "images").map((item) => imageUrl(item))
  ].filter((url) => url.length > 0);

  return [...new Set(urls)];
}

function GalleryViewer({
  mainBlock,
  imageBlock,
  variant
}: {
  mainBlock: RuntimeBlockContract | undefined;
  imageBlock: RuntimeBlockContract | undefined;
  variant: "gallery" | "matrix";
}) {
  const images = collectImageUrls(mainBlock, imageBlock);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images[activeImageIndex] ?? images[0] ?? "";

  if (variant === "matrix") {
    return (
      <div className="sb-runtime-image-matrix-viewer">
        <figure className="sb-runtime-image-matrix-main">
          {activeImage ? (
            <img alt="商品主图" src={activeImage} />
          ) : (
            <RuntimeEmptyMedia label="多图主图未填写" />
          )}
          <figcaption>{activeImage ? imageCaption(activeImageIndex) : "主图"}</figcaption>
        </figure>

        <div className="sb-runtime-image-matrix-thumbs" aria-label="商品多角度图片">
          {images.length > 0 ? (
            images.slice(0, 6).map((image, index) => (
              <button
                className={activeImageIndex === index ? "active" : undefined}
                key={`${image}:${index}`}
                onClick={() => setActiveImageIndex(index)}
                type="button"
              >
                <img alt={`商品多角度图 ${index + 1}`} src={image} />
                <span>{imageCaption(index)}</span>
              </button>
            ))
          ) : (
            <div className="sb-runtime-empty-state">多角度图片未填写，建议 6 张，最少 4 张。</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sb-runtime-gallery">
      <div className="sb-runtime-main-image">
        {activeImage ? (
          <img alt={imageAlt(mainBlock?.content.main_image, "商品主图")} src={activeImage} />
        ) : (
          <RuntimeEmptyMedia label="商品主图未填写" />
        )}
      </div>

      <div className="sb-runtime-thumb-row">
        {images.length > 0 ? (
          images.map((image, index) => (
            <button
              className={activeImageIndex === index ? "active" : undefined}
              key={`${image}:${index}`}
              onClick={() => setActiveImageIndex(index)}
              type="button"
            >
              <img alt={`商品详情图 ${index + 1}`} src={image} />
            </button>
          ))
        ) : (
          <div className="sb-runtime-empty-state">缩略图未填写。</div>
        )}
      </div>
    </div>
  );
}

function imageCaption(index: number): string {
  const captions = ["主图", "场景", "细节", "包装", "搭配", "参考"];
  return captions[index] ?? `图片 ${index + 1}`;
}

function ProductSummaryPanel({
  blocks,
  compact
}: {
  blocks: BlockMap;
  compact: boolean;
}) {
  const summaryBlock = blocks["product.summary.info"];
  const priceBlock = blocks["product.price"];
  const promotionBlock = blocks["product.promotion"];
  const salesBlock = blocks["product.sales_stats"];
  const highlightsBlock = blocks["product.highlights"];
  const cartActionBlock = blocks["product.cart_action"];
  const highlightItems = blockTextList(highlightsBlock, "items");
  const title = blockText(summaryBlock, "title", "商品标题未填写");

  return (
    <aside className={compact ? "sb-runtime-image-matrix-info" : "sb-runtime-product-summary"}>
      <p className="sb-runtime-kicker">{blockText(summaryBlock, "category", "分类未填写")}</p>
      {compact ? <h3>{title}</h3> : <h1>{title}</h1>}
      <p className="sb-runtime-description">
        {blockText(summaryBlock, "description", "商品描述未填写")}
      </p>

      <div className={compact ? "sb-runtime-compact-price-row" : "sb-runtime-detail-price-row"}>
        <strong>{blockText(priceBlock, "sale_price", "实际价未填写")}</strong>
        <span>{blockText(priceBlock, "original_price", "原价未填写")}</span>
      </div>

      <div className={compact ? "sb-runtime-compact-promo-row" : "sb-runtime-promo-row"}>
        {blockText(promotionBlock, "badge", "").trim().length > 0 ? (
          <span>{blockText(promotionBlock, "badge", "优惠")}</span>
        ) : null}
        <strong>{blockText(promotionBlock, "promo", "优惠信息未填写")}</strong>
      </div>

      <div className="sb-runtime-sales-row">
        <span>已售 {blockText(salesBlock, "sold_count", "未填写")}</span>
        <span>{blockText(salesBlock, "paid_buyers", "未填写")} 人已付款</span>
      </div>

      <div className={compact ? "sb-runtime-compact-highlight-row" : "sb-runtime-highlight-list"}>
        {highlightItems.length > 0 ? (
          highlightItems.map((highlight) => <span key={highlight}>{highlight}</span>)
        ) : (
          <span>商品卖点未填写</span>
        )}
      </div>

      <div className={compact ? "sb-runtime-compact-action-row" : "sb-runtime-detail-action-row"}>
        <label>
          数量
          <select defaultValue="1">
            {[1, 2, 3, 4, 5].map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity}
              </option>
            ))}
          </select>
        </label>

        <button type="button">{blockText(cartActionBlock, "label", "加入购物车")}</button>
      </div>
    </aside>
  );
}

function detailCards(block: RuntimeBlockContract | undefined): JsonRecord[] {
  return blockRecords(block, "cards");
}

function DetailCardsSection({
  block,
  title
}: {
  block: RuntimeBlockContract | undefined;
  title: string;
}) {
  const cards = detailCards(block);

  return (
    <section className="sb-runtime-detail-content">
      <h2>{title}</h2>
      {cards.length > 0 ? (
        <div className="sb-runtime-detail-cards">
          {cards.map((card, index) => (
            <article key={`detail-card:${index}`}>
              <strong>{asText(card.title) || `详情 ${index + 1}`}</strong>
              <p>{asText(card.body) || asText(card.description) || "详情说明未填写"}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="sb-runtime-empty-state">详情说明未填写。</div>
      )}
    </section>
  );
}

function RecommendSection({ block }: { block: RuntimeBlockContract | undefined }) {
  const products = blockRecords(block, "products");
  const source = blockText(block, "source", "相关推荐");

  return (
    <section className="sb-runtime-recommend">
      <div className="sb-runtime-section-title">
        <h2>相关推荐</h2>
        <span>{source}</span>
      </div>

      {products.length > 0 ? (
        <div className="sb-runtime-recommend-grid">
          {products.map((product, index) => {
            const title = asText(product.title) || `推荐商品 ${index + 1}`;
            const mediaUrl = imageUrl(product.image);

            return (
              <article key={`recommend:${index}`}>
                {mediaUrl ? <img alt={title} src={mediaUrl} /> : <RuntimeEmptyMedia label="推荐商品图" />}
                <strong>{title}</strong>
                <div>
                  <span>{asText(product.sale_price) || "价格未填"}</span>
                  {asText(product.original_price) ? <del>{asText(product.original_price)}</del> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="sb-runtime-empty-state">相关推荐未填写，后续可接商品推荐来源。</div>
      )}
    </section>
  );
}

function ProductGalleryPreview({ contract }: { contract: RuntimePageContractResponse }) {
  const blocks = buildBlockMap(contract);

  return (
    <main className="sb-runtime-detail-page">
      <header className="sb-runtime-detail-header">
        <a className="sb-runtime-shop-logo" href="#top">Paw Home</a>
        <span>商品详情模板 A · 标准图册</span>
      </header>

      <section className="sb-runtime-detail-layout" id="top">
        <GalleryViewer
          mainBlock={blocks["product.gallery.main"]}
          imageBlock={blocks["product.gallery.thumbs"]}
          variant="gallery"
        />
        <ProductSummaryPanel blocks={blocks} compact={false} />
      </section>

      <DetailCardsSection block={blocks["product.detail_content.cards"]} title="商品详情" />
      <RecommendSection block={blocks["product.recommend_shelf"]} />
    </main>
  );
}

function ProductImageMatrixPreview({ contract }: { contract: RuntimePageContractResponse }) {
  const blocks = buildBlockMap(contract);

  return (
    <main className="sb-runtime-detail-page">
      <header className="sb-runtime-detail-header">
        <a className="sb-runtime-shop-logo" href="#top">Paw Home</a>
        <span>商品详情模板 B · 多图展示</span>
      </header>

      <section className="sb-runtime-image-matrix-section" id="top">
        <div className="sb-runtime-section-title">
          <h2>多图商品详情模板</h2>
          <span>点击周围图片切换主图</span>
        </div>

        <article className="sb-runtime-image-matrix-card">
          <GalleryViewer
            mainBlock={blocks["product.image_matrix.main"]}
            imageBlock={blocks["product.image_matrix.side_images"]}
            variant="matrix"
          />
          <ProductSummaryPanel blocks={blocks} compact />
        </article>
      </section>

      <DetailCardsSection block={blocks["product.detail_content.cards"]} title="图文说明" />
    </main>
  );
}

function RuntimeContractPreview({ contract }: { contract: RuntimePageContractResponse }) {
  if (contract.page_code === "home") {
    return <HomePreview contract={contract} />;
  }

  if (contract.page_code === "product_detail_gallery") {
    return <ProductGalleryPreview contract={contract} />;
  }

  if (contract.page_code === "product_detail_image_matrix") {
    return <ProductImageMatrixPreview contract={contract} />;
  }

  return <div className="sb-runtime-empty-state">暂不支持该页面模板预览：{contract.page_code}</div>;
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

  const currentReadiness = useMemo(
    () => (currentContract ? <PreviewReadinessPanel contract={currentContract} /> : null),
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
              {currentReadiness}
            </section>

            <section className="sb-runtime-preview-stage">
              <RuntimeContractPreview contract={currentContract} />
            </section>

            <SlotStatusPanel contract={currentContract} />
          </>
        ) : null}
      </div>
    </PageFrame>
  );
}
