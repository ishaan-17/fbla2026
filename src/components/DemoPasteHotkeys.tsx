"use client";

import { useEffect, useRef } from "react";

type EditableTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

// Add new demo shortcuts here: key = KeyboardEvent.code, value = pasted text.
const DEMO_HOTKEY_PASTES: Record<string, string> = {
  F1: "Report Form Description",
  F2: "Inquiry Form",
  F3: "Claim Form",
  F4: "AI Chatbot",
};

const ALLOWED_INPUT_TYPES = new Set([
  "text",
  "search",
  "url",
  "tel",
  "email",
  "password",
  "number",
]);

function isTextInput(el: Element): el is HTMLInputElement {
  if (!(el instanceof HTMLInputElement)) return false;
  if (el.disabled || el.readOnly) return false;

  const type = (el.type || "text").toLowerCase();
  return ALLOWED_INPUT_TYPES.has(type);
}

function isEditableTarget(el: Element | null): el is EditableTarget {
  if (!el) return false;

  if (el instanceof HTMLTextAreaElement) {
    return !el.disabled && !el.readOnly;
  }

  if (isTextInput(el)) return true;

  return el instanceof HTMLElement && el.isContentEditable;
}

function isVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden") return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function insertTextIntoInput(
  target: HTMLInputElement | HTMLTextAreaElement,
  text: string,
) {
  target.focus();

  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  target.setRangeText(text, start, end, "end");
  target.dispatchEvent(new Event("input", { bubbles: true }));
}

function insertTextIntoContentEditable(target: HTMLElement, text: string) {
  target.focus();

  const selection = window.getSelection();
  if (!selection) {
    target.textContent = `${target.textContent ?? ""}${text}`;
    return;
  }

  if (selection.rangeCount === 0 || !target.contains(selection.anchorNode)) {
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(text));
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function getFirstEditableTarget(): EditableTarget | null {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(
      "textarea, input, [contenteditable]:not([contenteditable='false'])",
    ),
  );

  for (const candidate of candidates) {
    if (isEditableTarget(candidate) && isVisible(candidate)) return candidate;
  }

  return null;
}

function insertTextIntoTarget(target: EditableTarget, text: string) {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    insertTextIntoInput(target, text);
    return;
  }
  insertTextIntoContentEditable(target, text);
}

export default function DemoPasteHotkeys() {
  const lastEditableRef = useRef<EditableTarget | null>(null);

  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const element = event.target as Element | null;
      if (isEditableTarget(element)) {
        lastEditableRef.current = element;
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const pasteText = DEMO_HOTKEY_PASTES[event.code];
      if (!pasteText) return;

      event.preventDefault();
      event.stopPropagation();

      const activeElement = document.activeElement;
      const preferredTarget =
        (isEditableTarget(activeElement) ? activeElement : null) ??
        (lastEditableRef.current &&
        document.contains(lastEditableRef.current) &&
        isVisible(lastEditableRef.current)
          ? lastEditableRef.current
          : null) ??
        getFirstEditableTarget();

      if (!preferredTarget) {
        if (navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText(pasteText);
        }
        return;
      }

      insertTextIntoTarget(preferredTarget, pasteText);
    };

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
