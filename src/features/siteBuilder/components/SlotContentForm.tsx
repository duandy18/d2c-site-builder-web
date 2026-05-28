import { useState } from "react";
import type { FormEvent } from "react";

import type {
  JsonRecord,
  PageContentSlot,
  SlotSchema,
  UpdateSlotContentRequest
} from "../model/templateContentModel";

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function objectKeys(value: JsonRecord | undefined): string[] {
  return Object.keys(value ?? {});
}

function prettyJson(value: JsonRecord): string {
  return JSON.stringify(value, null, 2);
}

function parseJsonObject(rawValue: string, label: string): JsonRecord {
  const parsed = JSON.parse(rawValue) as unknown;

  if (!isRecord(parsed)) {
    throw new Error(`${label} 必须是 JSON 对象`);
  }

  return parsed;
}

function schemaFields(schema: SlotSchema): Record<string, JsonRecord> {
  if (!isRecord(schema.fields)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(schema.fields).filter(([, value]) => isRecord(value))
  ) as Record<string, JsonRecord>;
}

function schemaFieldNames(schema: SlotSchema): string[] {
  return Object.keys(schemaFields(schema));
}

function isMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (isRecord(value)) {
    return Object.keys(value).length === 0;
  }

  return false;
}

function validateRequiredContent(slot: PageContentSlot, content: JsonRecord): void {
  const fields = schemaFields(slot.content_schema);

  for (const [fieldKey, schema] of Object.entries(fields)) {
    if (schema.required !== true) {
      continue;
    }

    if (isMissingValue(content[fieldKey])) {
      throw new Error(`请填写：${fieldKey}`);
    }
  }
}

function schemaSummary(schema: SlotSchema): string {
  const fieldNames = schemaFieldNames(schema);

  if (fieldNames.length === 0) {
    return "无字段";
  }

  return fieldNames.join(" / ");
}

function JsonReadonlyBlock({ title, value }: { title: string; value: JsonRecord }) {
  return (
    <div className="sb-json-preview">
      <span>{title}</span>
      <pre>{prettyJson(value)}</pre>
    </div>
  );
}

function SchemaBlock({ title, schema }: { title: string; schema: SlotSchema }) {
  return (
    <div className="sb-schema-block">
      <span>{title}</span>
      <strong>{schemaSummary(schema)}</strong>
      <pre>{prettyJson(schema)}</pre>
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
  const [contentText, setContentText] = useState(() => prettyJson(initialContent));
  const [presentationText, setPresentationText] = useState(() =>
    prettyJson(initialPresentation)
  );
  const [error, setError] = useState<string | null>(null);

  function resetValues() {
    setContentText(prettyJson(initialContent));
    setPresentationText(prettyJson(initialPresentation));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      const content = parseJsonObject(contentText, "内容 JSON");
      const presentation = parseJsonObject(presentationText, "表现 JSON");

      validateRequiredContent(slot, content);

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
          <SchemaBlock title="内容 Schema" schema={slot.content_schema} />
          <SchemaBlock title="表现 Schema" schema={slot.presentation_schema} />
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

      <label>
        <span>内容 JSON</span>
        <textarea
          value={contentText}
          disabled={disabled}
          onChange={(event) => setContentText(event.target.value)}
        />
      </label>

      <label>
        <span>表现 JSON</span>
        <textarea
          value={presentationText}
          disabled={disabled}
          onChange={(event) => setPresentationText(event.target.value)}
        />
      </label>

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
