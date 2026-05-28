import type {
  PageContentFormResponse,
  PageContentSlot,
  UpdateSlotContentRequest
} from "../model/templateContentModel";

import { SlotContentForm } from "./SlotContentForm";

function sortByOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function slotStateText(slot: PageContentSlot): string {
  if (slot.status === "active") {
    return "已填写";
  }

  if (slot.required) {
    return "必填";
  }

  return "可选";
}

export function TemplateContentForm({
  form,
  disabled,
  onSaveSlot,
  onSaved
}: {
  form: PageContentFormResponse;
  disabled: boolean;
  onSaveSlot: (slotCode: string, request: UpdateSlotContentRequest) => Promise<void>;
  onSaved: (message: string) => void;
}) {
  return (
    <div className="sb-content-form">
      {sortByOrder(form.groups).map((group) => (
        <section key={group.template_region_code} className="sb-content-group">
          <div className="sb-content-group-header">
            <div>
              <h2>{group.label}</h2>
              <p>
                {group.template_region_code} · {group.description}
              </p>
            </div>
            <span className="sb-pill">{group.required ? "必填区域" : "可选区域"}</span>
          </div>

          <div className="sb-slot-list">
            {sortByOrder(group.slots).map((slot) => (
              <article
                key={`${slot.slot_code}:${slot.block_code ?? "empty"}:${JSON.stringify(
                  slot.content
                )}:${JSON.stringify(slot.presentation)}`}
                className="sb-slot-card"
              >
                <div className="sb-slot-card-header">
                  <div>
                    <h3>{slot.label}</h3>
                    <p>
                      {slot.slot_code} · {slot.renderer_key}
                    </p>
                    <p>{slot.description}</p>
                  </div>
                  <span className="sb-pill">{slotStateText(slot)}</span>
                </div>

                <SlotContentForm
                  slot={slot}
                  disabled={disabled}
                  onSubmit={onSaveSlot}
                  onSaved={onSaved}
                />
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
