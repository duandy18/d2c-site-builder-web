import type { ContentField, JsonRecord } from "../model/templateContentModel";
import {
  asArray,
  asRecord,
  defaultCompositeValue,
  defaultFieldValue,
  fieldDisplayValue,
  optionDefault,
  valueToText
} from "../model/typedContentFieldHelpers";
import type { FieldValue } from "../model/typedContentFieldHelpers";

export function FieldReadonlyList({
  fields,
  values
}: {
  fields: ContentField[];
  values: JsonRecord;
}) {
  return (
    <div className="sb-readonly-fields">
      {fields.map((field) => (
        <div key={field.field_key} className="sb-readonly-row">
          <span>{field.label}</span>
          <strong>{fieldDisplayValue(field, values[field.field_key])}</strong>
        </div>
      ))}
    </div>
  );
}

export function TypedFieldEditor({
  field,
  value,
  disabled,
  onChange
}: {
  field: ContentField;
  value: FieldValue;
  disabled: boolean;
  onChange: (value: FieldValue) => void;
}) {
  if (
    field.value_type === "image" ||
    field.value_type === "link_target" ||
    field.value_type === "offer_source"
  ) {
    return (
      <CompositeFieldEditor
        field={field}
        value={asRecord(value)}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  if (field.value_type === "entry_list") {
    return (
      <EntryListEditor
        field={field}
        value={asArray(value)}
        disabled={disabled}
        onChange={onChange}
      />
    );
  }

  if (field.value_type === "textarea" || field.value_type === "json") {
    return (
      <textarea
        value={valueToText(value, field)}
        placeholder={field.placeholder ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.value_type === "select") {
    return (
      <select
        value={String(value ?? optionDefault(field.options))}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  if (field.value_type === "boolean") {
    return (
      <select
        value={String(value ?? false)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value === "true")}
      >
        <option value="true">是</option>
        <option value="false">否</option>
      </select>
    );
  }

  return (
    <input
      value={valueToText(value, field)}
      placeholder={field.placeholder ?? ""}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function CompositeFieldEditor({
  field,
  value,
  disabled,
  onChange
}: {
  field: ContentField;
  value: JsonRecord;
  disabled: boolean;
  onChange: (value: FieldValue) => void;
}) {
  return (
    <div className="sb-composite-field">
      {field.item_fields.map((item) => (
        <label key={item.field_key}>
          <span>
            {item.label}
            {item.required ? <strong> *</strong> : null}
          </span>
          <TypedFieldEditor
            field={item}
            value={value[item.field_key] ?? defaultFieldValue(item)}
            disabled={disabled}
            onChange={(nextValue) =>
              onChange({
                ...value,
                [item.field_key]: nextValue
              })
            }
          />
        </label>
      ))}
    </div>
  );
}

function EntryListEditor({
  field,
  value,
  disabled,
  onChange
}: {
  field: ContentField;
  value: unknown[];
  disabled: boolean;
  onChange: (value: FieldValue) => void;
}) {
  function addEntry() {
    onChange([...value, defaultCompositeValue(field)]);
  }

  function updateEntry(index: number, nextEntry: FieldValue) {
    onChange(value.map((entry, entryIndex) => (entryIndex === index ? nextEntry : entry)));
  }

  function removeEntry(index: number) {
    onChange(value.filter((_, entryIndex) => entryIndex !== index));
  }

  return (
    <div className="sb-entry-list-editor">
      {value.length === 0 ? <div className="sb-muted">当前还没有入口。</div> : null}

      {value.map((entry, index) => (
        <div key={index} className="sb-entry-card">
          <div className="sb-entry-card-header">
            <strong>入口 {index + 1}</strong>
            <button type="button" disabled={disabled} onClick={() => removeEntry(index)}>
              删除
            </button>
          </div>
          <CompositeFieldEditor
            field={field}
            value={asRecord(entry)}
            disabled={disabled}
            onChange={(nextValue) => updateEntry(index, nextValue)}
          />
        </div>
      ))}

      <button type="button" disabled={disabled} onClick={addEntry}>
        添加入口
      </button>
    </div>
  );
}
