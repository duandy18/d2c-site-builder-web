import type { JsonRecord, SchemaField, SlotSchema } from "../../model/templateContentModel";

export type SchemaFieldKind =
  | "string"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "json"
  | "image";

export type SchemaSelectOption = {
  label: string;
  value: string;
};

const IMAGE_FIELD_KEYS = new Set(["image", "main_image", "cover_image", "banner_image"]);

const JSON_FIELD_KEYS = new Set([
  "items",
  "products",
  "images",
  "cards",
  "links",
  "sources",
  "collections"
]);

const TEXTAREA_FIELD_KEYS = new Set([
  "description",
  "subtitle",
  "promo",
  "body",
  "copyright_text"
]);

export function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function objectKeys(value: JsonRecord | undefined): string[] {
  return Object.keys(value ?? {});
}

export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function schemaFields(schema: SlotSchema): Record<string, SchemaField> {
  if (!isRecord(schema.fields)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(schema.fields).filter(([, value]) => isRecord(value))
  ) as Record<string, SchemaField>;
}

export function schemaFieldNames(schema: SlotSchema): string[] {
  return Object.keys(schemaFields(schema));
}

export function schemaHasFields(schema: SlotSchema): boolean {
  return schemaFieldNames(schema).length > 0;
}

export function isMissingValue(value: unknown): boolean {
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

export function fieldLabel(fieldKey: string, field: SchemaField): string {
  return typeof field.label === "string" && field.label.trim().length > 0
    ? field.label
    : fieldKey;
}

function optionLabel(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (isRecord(value)) {
    if (typeof value.label === "string") {
      return value.label;
    }

    if (typeof value.name === "string") {
      return value.name;
    }

    if (typeof value.value === "string" || typeof value.value === "number") {
      return String(value.value);
    }
  }

  return "";
}

function optionValue(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (isRecord(value)) {
    if (typeof value.value === "string" || typeof value.value === "number") {
      return String(value.value);
    }

    if (typeof value.code === "string" || typeof value.code === "number") {
      return String(value.code);
    }

    if (typeof value.key === "string" || typeof value.key === "number") {
      return String(value.key);
    }
  }

  return "";
}

export function fieldOptions(field: SchemaField): SchemaSelectOption[] {
  if (!Array.isArray(field.options)) {
    return [];
  }

  return field.options
    .map((option) => ({
      label: optionLabel(option),
      value: optionValue(option)
    }))
    .filter((option) => option.label.length > 0 && option.value.length > 0);
}

function explicitKind(field: SchemaField): SchemaFieldKind | null {
  if (typeof field.type !== "string") {
    return null;
  }

  switch (field.type) {
    case "string":
    case "text":
    case "url":
    case "link":
      return "string";
    case "textarea":
    case "markdown":
    case "rich_text":
      return "textarea";
    case "number":
    case "integer":
    case "decimal":
      return "number";
    case "boolean":
      return "boolean";
    case "enum":
    case "select":
      return "select";
    case "image":
      return "image";
    case "array":
    case "object":
    case "json":
      return "json";
    default:
      return null;
  }
}

export function inferFieldKind(
  fieldKey: string,
  field: SchemaField,
  currentValue: unknown
): SchemaFieldKind {
  const explicit = explicitKind(field);
  if (explicit) {
    return explicit;
  }

  if (fieldOptions(field).length > 0) {
    return "select";
  }

  if (typeof currentValue === "boolean") {
    return "boolean";
  }

  if (typeof currentValue === "number") {
    return "number";
  }

  if (IMAGE_FIELD_KEYS.has(fieldKey)) {
    return "image";
  }

  if (JSON_FIELD_KEYS.has(fieldKey) || Array.isArray(currentValue) || isRecord(currentValue)) {
    return "json";
  }

  if (TEXTAREA_FIELD_KEYS.has(fieldKey)) {
    return "textarea";
  }

  return "string";
}

export function stringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return prettyJson(value);
}

function defaultJsonValue(fieldKey: string): unknown {
  if (fieldKey === "main_image" || fieldKey === "image" || fieldKey.endsWith("_image")) {
    return {};
  }

  return [];
}

function defaultDraftValue(fieldKey: string, field: SchemaField): unknown {
  if (field.default !== undefined) {
    return field.default;
  }

  const kind = inferFieldKind(fieldKey, field, undefined);

  if (kind === "boolean") {
    return false;
  }

  if (kind === "json") {
    return prettyJson(defaultJsonValue(fieldKey));
  }

  if (kind === "image") {
    return { url: "", alt: "" };
  }

  return "";
}

export function buildDraftValues(schema: SlotSchema, source: JsonRecord): JsonRecord {
  const result: JsonRecord = {};

  for (const [fieldKey, field] of Object.entries(schemaFields(schema))) {
    const sourceValue = source[fieldKey] ?? defaultDraftValue(fieldKey, field);
    const kind = inferFieldKind(fieldKey, field, sourceValue);

    if (kind === "json" && typeof sourceValue !== "string") {
      result[fieldKey] = prettyJson(sourceValue);
      continue;
    }

    if (kind === "image") {
      if (isRecord(sourceValue)) {
        result[fieldKey] = {
          url: stringValue(sourceValue.url),
          alt: stringValue(sourceValue.alt)
        };
      } else {
        result[fieldKey] = {
          url: stringValue(sourceValue),
          alt: ""
        };
      }
      continue;
    }

    result[fieldKey] = sourceValue;
  }

  return result;
}

function parseJsonField(rawValue: unknown, fieldLabelText: string): unknown {
  if (typeof rawValue !== "string") {
    return rawValue;
  }

  if (rawValue.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    throw new Error(`${fieldLabelText} 必须是合法 JSON`);
  }
}

function normalizeNumberField(rawValue: unknown, fieldLabelText: string): number | undefined {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return undefined;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldLabelText} 必须是数字`);
  }

  return parsed;
}

function normalizeImageField(rawValue: unknown): JsonRecord {
  if (isRecord(rawValue)) {
    const url = stringValue(rawValue.url).trim();
    const alt = stringValue(rawValue.alt).trim();

    const result: JsonRecord = {};
    if (url.length > 0) {
      result.url = url;
    }
    if (alt.length > 0) {
      result.alt = alt;
    }

    return result;
  }

  const url = stringValue(rawValue).trim();
  return url.length > 0 ? { url } : {};
}

export function normalizeDraftValues(sectionLabel: string, schema: SlotSchema, draft: JsonRecord): JsonRecord {
  const result: JsonRecord = {};

  for (const [fieldKey, field] of Object.entries(schemaFields(schema))) {
    const label = `${sectionLabel}字段：${fieldLabel(fieldKey, field)}`;
    const rawValue = draft[fieldKey];
    const kind = inferFieldKind(fieldKey, field, rawValue);

    if (kind === "json") {
      const parsed = parseJsonField(rawValue, label);
      if (parsed !== undefined) {
        result[fieldKey] = parsed;
      }
      continue;
    }

    if (kind === "number") {
      const parsed = normalizeNumberField(rawValue, label);
      if (parsed !== undefined) {
        result[fieldKey] = parsed;
      }
      continue;
    }

    if (kind === "boolean") {
      result[fieldKey] = Boolean(rawValue);
      continue;
    }

    if (kind === "image") {
      result[fieldKey] = normalizeImageField(rawValue);
      continue;
    }

    result[fieldKey] = stringValue(rawValue);
  }

  return result;
}

export function validateRequiredValues(sectionLabel: string, schema: SlotSchema, values: JsonRecord): void {
  for (const [fieldKey, field] of Object.entries(schemaFields(schema))) {
    if (field.required !== true) {
      continue;
    }

    if (isMissingValue(values[fieldKey])) {
      throw new Error(`请填写${sectionLabel}字段：${fieldLabel(fieldKey, field)}`);
    }
  }
}

export function schemaSummary(schema: SlotSchema): string {
  const fieldNames = schemaFieldNames(schema);

  if (fieldNames.length === 0) {
    return "无字段";
  }

  return fieldNames.join(" / ");
}
