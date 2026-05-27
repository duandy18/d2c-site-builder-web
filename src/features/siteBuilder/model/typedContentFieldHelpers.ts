import type { ContentField, JsonRecord, OptionItem } from "./templateContentModel";

export type FieldValue = unknown;

export function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function asRecord(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function optionDefault(options: OptionItem[]): string {
  return options[0]?.value ?? "";
}

export function defaultFieldValue(field: ContentField): FieldValue {
  switch (field.value_type) {
    case "image":
      return defaultCompositeValue(field);
    case "link_target":
      return {
        type: "none"
      };
    case "offer_source":
      return defaultCompositeValue(field);
    case "entry_list":
      return [];
    case "boolean":
      return false;
    case "select":
      return optionDefault(field.options);
    case "json":
      return "";
    default:
      return "";
  }
}

export function defaultCompositeValue(field: ContentField): JsonRecord {
  return Object.fromEntries(
    field.item_fields.map((item) => [item.field_key, defaultFieldValue(item)])
  );
}

function isEmptyComposite(field: ContentField, value: unknown): boolean {
  if (field.value_type === "entry_list") {
    return asArray(value).length === 0;
  }

  const record = asRecord(value);

  if (field.value_type === "image") {
    return !String(record.url ?? "").trim() && !String(record.alt ?? "").trim();
  }

  if (field.value_type === "link_target") {
    const targetType = String(record.type ?? "none");

    return (
      targetType === "none" &&
      !String(record.path ?? "").trim() &&
      !String(record.url ?? "").trim() &&
      !String(record.ref ?? "").trim()
    );
  }

  if (field.value_type === "offer_source") {
    return (
      !String(record.ref ?? "").trim() &&
      (!Array.isArray(record.refs) || record.refs.length === 0)
    );
  }

  return Object.keys(record).length === 0;
}

function isEmptyValue(field: ContentField, value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (
    field.value_type === "image" ||
    field.value_type === "link_target" ||
    field.value_type === "offer_source" ||
    field.value_type === "entry_list"
  ) {
    return isEmptyComposite(field, value);
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

export function normalizeFieldValue(field: ContentField, value: FieldValue): unknown {
  if (!field.required && isEmptyValue(field, value)) {
    return undefined;
  }

  if (field.required && isEmptyValue(field, value)) {
    throw new Error(`请填写：${field.label}`);
  }

  if (field.value_type === "entry_list") {
    const entries = asArray(value);

    if (field.required && entries.length === 0) {
      throw new Error(`请填写：${field.label}`);
    }

    return entries
      .map((entry) => normalizeObjectFields(field.item_fields, asRecord(entry)))
      .filter((entry) => Object.keys(entry).length > 0);
  }

  if (
    field.value_type === "image" ||
    field.value_type === "link_target" ||
    field.value_type === "offer_source"
  ) {
    return normalizeObjectFields(field.item_fields, asRecord(value));
  }

  if (field.value_type === "number") {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new Error(`${field.label} 必须是数字`);
    }

    return parsed;
  }

  if (field.value_type === "boolean") {
    if (typeof value === "boolean") {
      return value;
    }

    return String(value) === "true";
  }

  if (field.value_type === "json") {
    if (typeof value !== "string") {
      return value;
    }

    try {
      return JSON.parse(value) as unknown;
    } catch {
      throw new Error(`${field.label} 必须是合法 JSON`);
    }
  }

  return value;
}

function normalizeObjectFields(fields: ContentField[], record: JsonRecord): JsonRecord {
  const output: JsonRecord = {};

  for (const field of fields) {
    const normalizedValue = normalizeFieldValue(field, record[field.field_key]);

    if (normalizedValue !== undefined) {
      output[field.field_key] = normalizedValue;
    }
  }

  return output;
}

export function buildContent(fields: ContentField[], values: JsonRecord): JsonRecord {
  return normalizeObjectFields(fields, values);
}

export function valueToText(value: unknown, field: ContentField): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (field.value_type === "json") {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

export function initialValues(fields: ContentField[], content: JsonRecord): JsonRecord {
  return Object.fromEntries(
    fields.map((field) => [
      field.field_key,
      content[field.field_key] ?? defaultFieldValue(field)
    ])
  );
}

export function fieldDisplayValue(field: ContentField, value: unknown): string {
  if (isEmptyValue(field, value)) {
    return "未填写";
  }

  if (field.value_type === "image") {
    const record = asRecord(value);
    return String(record.url ?? record.alt ?? "已填写图片");
  }

  if (field.value_type === "link_target") {
    const record = asRecord(value);
    const targetType = String(record.type ?? "none");

    if (targetType === "none") {
      return "不跳转";
    }

    return [targetType, record.path, record.url, record.ref].filter(Boolean).join(" / ");
  }

  if (field.value_type === "offer_source") {
    const record = asRecord(value);
    return [record.type, record.ref].filter(Boolean).join(" / ") || "已填写商品来源";
  }

  if (field.value_type === "entry_list") {
    return `共 ${asArray(value).length} 个入口`;
  }

  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
}
