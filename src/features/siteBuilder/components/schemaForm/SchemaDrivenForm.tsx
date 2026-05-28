import type { JsonRecord, SlotSchema } from "../../model/templateContentModel";

import {
  fieldLabel,
  fieldOptions,
  inferFieldKind,
  isRecord,
  prettyJson,
  schemaFields,
  schemaHasFields,
  stringValue
} from "./schemaFormModel";

function imageRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : { url: stringValue(value), alt: "" };
}

function jsonTextValue(value: unknown): string {
  return typeof value === "string" ? value : prettyJson(value ?? {});
}

export function SchemaDrivenForm({
  title,
  schema,
  value,
  disabled,
  emptyText,
  onChange
}: {
  title: string;
  schema: SlotSchema;
  value: JsonRecord;
  disabled: boolean;
  emptyText: string;
  onChange: (nextValue: JsonRecord) => void;
}) {
  function updateField(fieldKey: string, nextValue: unknown) {
    onChange({
      ...value,
      [fieldKey]: nextValue
    });
  }

  return (
    <section className="sb-schema-form-panel">
      <div className="sb-schema-form-header">
        <h4>{title}</h4>
      </div>

      {!schemaHasFields(schema) ? (
        <div className="sb-empty-schema-note">{emptyText}</div>
      ) : (
        <div className="sb-schema-form-fields">
          {Object.entries(schemaFields(schema)).map(([fieldKey, field]) => {
            const currentValue = value[fieldKey];
            const kind = inferFieldKind(fieldKey, field, currentValue);
            const label = fieldLabel(fieldKey, field);
            const options = fieldOptions(field);

            return (
              <label key={fieldKey} className="sb-schema-form-field">
                <span className="sb-schema-field-label">
                  <span>
                    {label}
                    {field.required === true ? <em className="sb-required-mark">*</em> : null}
                  </span>
                  <small>{fieldKey}</small>
                </span>

                {kind === "boolean" ? (
                  <span className="sb-schema-checkbox-row">
                    <input
                      type="checkbox"
                      checked={currentValue === true}
                      disabled={disabled}
                      onChange={(event) => updateField(fieldKey, event.target.checked)}
                    />
                    <span>{currentValue === true ? "是" : "否"}</span>
                  </span>
                ) : null}

                {kind === "number" ? (
                  <input
                    className="sb-schema-input"
                    type="number"
                    value={stringValue(currentValue)}
                    disabled={disabled}
                    onChange={(event) => updateField(fieldKey, event.target.value)}
                  />
                ) : null}

                {kind === "select" ? (
                  <select
                    className="sb-schema-input"
                    value={stringValue(currentValue)}
                    disabled={disabled}
                    onChange={(event) => updateField(fieldKey, event.target.value)}
                  >
                    <option value="">请选择</option>
                    {options.map((option) => (
                      <option key={`${fieldKey}:${option.value}`} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : null}

                {kind === "textarea" ? (
                  <textarea
                    className="sb-schema-textarea sb-schema-textarea-compact"
                    value={stringValue(currentValue)}
                    disabled={disabled}
                    onChange={(event) => updateField(fieldKey, event.target.value)}
                  />
                ) : null}

                {kind === "image" ? (
                  <span className="sb-schema-image-field">
                    <input
                      className="sb-schema-input"
                      type="url"
                      placeholder="图片 URL"
                      value={stringValue(imageRecord(currentValue).url)}
                      disabled={disabled}
                      onChange={(event) =>
                        updateField(fieldKey, {
                          ...imageRecord(currentValue),
                          url: event.target.value
                        })
                      }
                    />
                    <input
                      className="sb-schema-input"
                      type="text"
                      placeholder="图片说明 alt"
                      value={stringValue(imageRecord(currentValue).alt)}
                      disabled={disabled}
                      onChange={(event) =>
                        updateField(fieldKey, {
                          ...imageRecord(currentValue),
                          alt: event.target.value
                        })
                      }
                    />
                  </span>
                ) : null}

                {kind === "json" ? (
                  <>
                    <textarea
                      className="sb-schema-textarea"
                      value={jsonTextValue(currentValue)}
                      disabled={disabled}
                      onChange={(event) => updateField(fieldKey, event.target.value)}
                    />
                    <small className="sb-schema-help">
                      当前字段是列表/对象结构，请填写合法 JSON。后续后端 schema 补充类型后可继续增强为专用控件。
                    </small>
                  </>
                ) : null}

                {kind === "string" ? (
                  <input
                    className="sb-schema-input"
                    type="text"
                    value={stringValue(currentValue)}
                    disabled={disabled}
                    onChange={(event) => updateField(fieldKey, event.target.value)}
                  />
                ) : null}
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
