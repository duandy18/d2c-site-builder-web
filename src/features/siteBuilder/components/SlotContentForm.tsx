import { useState } from "react";
import type { FormEvent } from "react";

import { resolveOfferForProductGrid } from "../api/offerResolveApi";
import type { ResolvedOffer } from "../model/offerResolveModel";
import type {
  JsonRecord,
  PageContentSlot,
  SlotSchema,
  UpdateSlotContentRequest
} from "../model/templateContentModel";

import { SchemaDrivenForm } from "./schemaForm/SchemaDrivenForm";
import {
  buildDraftValues,
  normalizeDraftValues,
  objectKeys,
  prettyJson,
  schemaSummary,
  validateRequiredValues
} from "./schemaForm/schemaFormModel";

const PRODUCT_GRID_SLOT_CODE = "product_grid.list";

type OfferResolveState =
  | { status: "idle" }
  | { status: "resolving" }
  | { status: "success"; message: string }
  | { status: "error"; error: string };

function JsonReadonlyBlock({ title, value }: { title: string; value: JsonRecord }) {
  return (
    <div className="sb-json-preview">
      <span>{title}</span>
      <pre>{prettyJson(value)}</pre>
    </div>
  );
}

function SchemaSummaryBlock({ title, schema }: { title: string; schema: SlotSchema }) {
  return (
    <div className="sb-schema-summary-block">
      <span>{title}</span>
      <strong>{schemaSummary(schema)}</strong>
    </div>
  );
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "";
}

function parseProductsDraft(value: unknown): JsonRecord[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is JsonRecord => isRecord(item));
  }

  if (typeof value !== "string") {
    return [];
  }

  if (value.trim().length === 0) {
    return [];
  }

  const parsed = JSON.parse(value) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error("products 必须是数组 JSON，才能自动回填商品。");
  }

  return parsed.filter((item): item is JsonRecord => isRecord(item));
}

function safeProductCount(value: unknown): string {
  try {
    return `当前 products：${parseProductsDraft(value).length} 个商品`;
  } catch {
    return "当前 products 不是合法数组 JSON";
  }
}

function offerToProduct(offer: ResolvedOffer): JsonRecord {
  const product: JsonRecord = {
    offer_code: offer.offer_code,
    title: offer.title,
    category: offer.category,
    sale_price: offer.display_price
  };

  if (offer.image_url) {
    product.image = {
      url: offer.image_url,
      alt: offer.title
    };
  }

  return product;
}

function upsertProduct(products: JsonRecord[], product: JsonRecord): JsonRecord[] {
  const offerCode = stringValue(product.offer_code);
  const nextProducts = [...products];
  const existingIndex = nextProducts.findIndex(
    (item) => stringValue(item.offer_code) === offerCode
  );

  if (existingIndex >= 0) {
    nextProducts[existingIndex] = {
      ...nextProducts[existingIndex],
      ...product
    };
    return nextProducts;
  }

  return [...nextProducts, product];
}

function ProductGridOfferResolver({
  contentDraft,
  disabled,
  onChange
}: {
  contentDraft: JsonRecord;
  disabled: boolean;
  onChange: (nextValue: JsonRecord) => void;
}) {
  const [offerCode, setOfferCode] = useState("");
  const [state, setState] = useState<OfferResolveState>({ status: "idle" });

  async function handleResolve() {
    const normalizedOfferCode = offerCode.trim();

    if (!normalizedOfferCode) {
      setState({ status: "error", error: "请先输入 offer_code。" });
      return;
    }

    setState({ status: "resolving" });

    try {
      const response = await resolveOfferForProductGrid(normalizedOfferCode);
      const products = parseProductsDraft(contentDraft.products);
      const nextProducts = upsertProduct(products, offerToProduct(response.offer));
      const currentSource = stringValue(contentDraft.source).trim();

      onChange({
        ...contentDraft,
        source: currentSource.length > 0 ? currentSource : "全部商品",
        products: prettyJson(nextProducts)
      });

      setState({
        status: "success",
        message: `已回填：${response.offer.title} / ${response.offer.display_price}`
      });
    } catch (err: unknown) {
      setState({
        status: "error",
        error: err instanceof Error ? err.message : "offer 解析失败"
      });
    }
  }

  return (
    <section className="sb-offer-resolver">
      <div className="sb-offer-resolver-header">
        <div>
          <strong>商品 Offer 解析</strong>
          <span>
            输入 D2C published Offer 的 offer_code，自动回填商品标题、分类、真实价格和图片。
          </span>
          <em>{safeProductCount(contentDraft.products)}</em>
        </div>
      </div>

      <div className="sb-offer-resolver-row">
        <input
          className="sb-schema-input"
          type="text"
          value={offerCode}
          placeholder="例如：offer.cat_litter.tofu_6l"
          disabled={disabled || state.status === "resolving"}
          onChange={(event) => setOfferCode(event.target.value)}
        />
        <button
          type="button"
          disabled={disabled || state.status === "resolving"}
          onClick={() => {
            void handleResolve();
          }}
        >
          {state.status === "resolving" ? "解析中..." : "解析并回填"}
        </button>
      </div>

      {state.status === "success" ? (
        <div className="sb-offer-resolver-notice sb-offer-resolver-success">
          {state.message}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div className="sb-offer-resolver-notice sb-offer-resolver-error">
          {state.error}
        </div>
      ) : null}
    </section>
  );
}

export function SlotContentForm({
  slot,
  disabled,
  onSubmit,
  onSaved
}: {
  slot: PageContentSlot;
  disabled: boolean;
  onSubmit: (slotCode: string, request: UpdateSlotContentRequest) => Promise<void>;
  onSaved: (message: string) => void;
}) {
  const initialContent =
    objectKeys(slot.content).length > 0 ? slot.content : slot.default_content;
  const initialPresentation =
    objectKeys(slot.presentation).length > 0
      ? slot.presentation
      : slot.default_presentation;

  const hasSavedValue =
    objectKeys(slot.content).length > 0 || objectKeys(slot.presentation).length > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [contentDraft, setContentDraft] = useState<JsonRecord>(() =>
    buildDraftValues(slot.content_schema, initialContent)
  );
  const [presentationDraft, setPresentationDraft] = useState<JsonRecord>(() =>
    buildDraftValues(slot.presentation_schema, initialPresentation)
  );
  const [error, setError] = useState<string | null>(null);

  function resetValues() {
    setContentDraft(buildDraftValues(slot.content_schema, initialContent));
    setPresentationDraft(buildDraftValues(slot.presentation_schema, initialPresentation));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const content = normalizeDraftValues("内容", slot.content_schema, contentDraft);
      const presentation = normalizeDraftValues(
        "表现",
        slot.presentation_schema,
        presentationDraft
      );

      validateRequiredValues("内容", slot.content_schema, content);
      validateRequiredValues("表现", slot.presentation_schema, presentation);

      await onSubmit(slot.slot_code, { content, presentation });
      setIsEditing(false);
      onSaved(`已保存：${slot.label}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  if (!isEditing) {
    return (
      <div className="sb-slot-view">
        <div className="sb-slot-schema-grid">
          <SchemaSummaryBlock title="内容字段" schema={slot.content_schema} />
          <SchemaSummaryBlock title="表现字段" schema={slot.presentation_schema} />
        </div>

        <div className="sb-slot-schema-grid">
          <JsonReadonlyBlock title="当前内容" value={initialContent} />
          <JsonReadonlyBlock title="当前表现" value={initialPresentation} />
        </div>

        <div className="sb-slot-actions">
          <button type="button" disabled={disabled} onClick={() => setIsEditing(true)}>
            {hasSavedValue ? "修改" : "填写"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="sb-slot-form" onSubmit={handleSubmit}>
      {error ? <div className="sb-form-error">{error}</div> : null}

      {slot.slot_code === PRODUCT_GRID_SLOT_CODE ? (
        <ProductGridOfferResolver
          contentDraft={contentDraft}
          disabled={disabled}
          onChange={setContentDraft}
        />
      ) : null}

      <SchemaDrivenForm
        title="内容表单"
        schema={slot.content_schema}
        value={contentDraft}
        disabled={disabled}
        emptyText="该 Slot 没有可编辑内容字段。"
        onChange={setContentDraft}
      />

      <SchemaDrivenForm
        title="表现配置"
        schema={slot.presentation_schema}
        value={presentationDraft}
        disabled={disabled}
        emptyText="该 Slot 暂无表现配置字段，模板会使用默认表现。"
        onChange={setPresentationDraft}
      />

      <div className="sb-slot-actions">
        <button type="submit" disabled={disabled}>
          {disabled ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          className="sb-secondary-button"
          disabled={disabled}
          onClick={() => {
            resetValues();
            setIsEditing(false);
            setError(null);
          }}
        >
          取消
        </button>
      </div>
    </form>
  );
}
