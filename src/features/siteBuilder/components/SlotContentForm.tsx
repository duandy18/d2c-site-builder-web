import { useState } from "react";
import type { FormEvent } from "react";

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
