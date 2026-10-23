"use client";

import { useState, type FormEvent } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";

type ContactDraft = {
  name: string;
  email: string;
  message: string;
};

type ContactField = keyof ContactDraft;

const emptyDraft: ContactDraft = { name: "", email: "", message: "" };

function isContactDraft(value: unknown): value is ContactDraft {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "email" in value &&
    "message" in value &&
    typeof value.name === "string" &&
    typeof value.email === "string" &&
    typeof value.message === "string"
  );
}

const fieldClassName =
  "mt-2 w-full rounded-xl border border-[#deded5] bg-[#fbfbf9] px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#78917a] focus:ring-4 focus:ring-[#315b49]/10 disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

export default function ContactForm() {
  const { value, setValue, removeValue, isReady } =
    useLocalStorage<ContactDraft>(STORAGE_KEYS.contactDraft, emptyDraft);
  const [status, setStatus] = useState("");
  const draft = isContactDraft(value) ? value : emptyDraft;

  function updateField(field: ContactField, nextValue: string) {
    setStatus("");
    try {
      setValue({ ...draft, [field]: nextValue });
    } catch {
      setStatus("Your draft could not be saved. Check browser storage and try again.");
    }
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(
      "Your message draft is saved in this browser. It has not been sent.",
    );
  }

  function clearDraft() {
    try {
      removeValue();
      setStatus("Your saved message draft was cleared.");
    } catch {
      setStatus("Your saved draft could not be cleared. Please try again.");
    }
  }

  return (
    <form
      className="space-y-6 rounded-[1.5rem] border border-[#e8e6df] bg-white p-6 shadow-[0_24px_70px_-48px_rgba(31,42,34,0.4)] dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      onSubmit={saveDraft}
    >
      <div>
        <label
          className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          htmlFor="contact-name"
        >
          Name
        </label>
        <input
          autoComplete="name"
          className={fieldClassName}
          disabled={!isReady}
          id="contact-name"
          maxLength={100}
          onChange={(event) => updateField("name", event.target.value)}
          required
          value={draft.name}
        />
      </div>
      <div>
        <label
          className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          htmlFor="contact-email"
        >
          Email
        </label>
        <input
          autoComplete="email"
          className={fieldClassName}
          disabled={!isReady}
          id="contact-email"
          maxLength={254}
          onChange={(event) => updateField("email", event.target.value)}
          required
          type="email"
          value={draft.email}
        />
      </div>
      <div>
        <label
          className="text-sm font-semibold text-slate-800 dark:text-slate-200"
          htmlFor="contact-message"
        >
          Message
        </label>
        <textarea
          className={fieldClassName}
          disabled={!isReady}
          id="contact-message"
          maxLength={2000}
          onChange={(event) => updateField("message", event.target.value)}
          required
          rows={6}
          value={draft.message}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#315b49] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#244536] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] disabled:cursor-wait disabled:opacity-60 dark:bg-[#a7c4ad] dark:text-slate-950 dark:hover:bg-[#c0d5c4]"
          disabled={!isReady}
          type="submit"
        >
          Save message locally
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#deded5] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f7f6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b49] disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          disabled={!isReady}
          onClick={clearDraft}
          type="button"
        >
          Clear draft
        </button>
      </div>
      {status && (
        <p
          aria-live="polite"
          className="text-sm text-slate-600 dark:text-slate-300"
          role="status"
        >
          {status}
        </p>
      )}
    </form>
  );
}
