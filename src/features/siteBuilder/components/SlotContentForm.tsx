import { useState } from "react";
import type { FormEvent } from "react";

import type { JsonRecord, PageContentSlot } from "../model/templateContentModel";
import { buildContent, initialValues } from "../model/typedContentFieldHelpers";

import { FieldReadonlyList, TypedFieldEditor } from "./TypedFieldEditor";

export function SlotContentForm({
  slot,
  disabled,
  onSubmit,
  onSaved
}: {
  slot: PageContentSlot;
  disabled: boolean;
  onSubmit: (slotCode: string, content: JsonRecord) => Promise<void>;
  onSaved: (message: string) => void;
}) {
  const hasContent = Object.keys(slot.content).length > 0;
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<JsonRecord>(() =>
    initialValues(slot.content_fields, slot.content)
  );
  const [error, setError] = useState<string | null>(null);

  function resetValues() {
    setValues(initialValues(slot.content_fields, slot.content));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await onSubmit(slot.slot_code, buildContent(slot.content_fields, values));
      setIsEditing(false);
      onSaved(`已保存：${slot.label}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "保存失败");
    }
  }

  if (!isEditing) {
    return (
      <div className="sb-slot-view">
        <FieldReadonlyList fields={slot.content_fields} values={slot.content} />
        <div className="sb-slot-actions">
          <button type="button" disabled={disabled} onClick={() => setIsEditing(true)}>
            {hasContent ? "修改" : "填写"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="sb-slot-form" onSubmit={handleSubmit}>
      {error ? <div className="sb-form-error">{error}</div> : null}

      {slot.content_fields.map((field) => (
        <label key={field.field_key}>
          <span>
            {field.label}
            {field.required ? <strong> *</strong> : null}
          </span>

          <TypedFieldEditor
            field={field}
            value={values[field.field_key]}
            disabled={disabled}
            onChange={(value) =>
              setValues((current) => ({
                ...current,
                [field.field_key]: value
              }))
            }
          />

          {field.help_text ? <em>{field.help_text}</em> : null}
        </label>
      ))}

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
