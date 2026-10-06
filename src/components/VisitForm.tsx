"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

type PreviewRequest = {
  name: string;
  email: string;
  occasion: string;
  date: string;
};
type FieldName = keyof PreviewRequest;
const storageKey = "aira-styling-preview";
const emptyRequest: PreviewRequest = {
  name: "",
  email: "",
  occasion: "",
  date: "",
};
const occasions = [
  "A wedding",
  "A festive gathering",
  "An evening occasion",
  "Everyday dressing",
  "Just exploring",
];

function earliestDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function VisitForm() {
  const [request, setRequest] = useState<PreviewRequest>(emptyRequest);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [minDate, setMinDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [message, setMessage] = useState("");
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinDate(earliestDate());
  }, []);

  function update(field: FieldName, value: string) {
    setRequest((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaved(false);
    setStorageError("");
    setMessage("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Read the submitted values as well as normal React input updates, so native
    // date editing and browser autofill are included when they commit on blur.
    const formData = new FormData(event.currentTarget);
    const submitted: PreviewRequest = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      occasion: String(formData.get("occasion") || ""),
      date: String(formData.get("date") || ""),
    };
    setRequest(submitted);
    const nextErrors: Partial<Record<FieldName, string>> = {};
    if (submitted.name.length < 2)
      nextErrors.name = "Please enter your name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitted.email))
      nextErrors.email = "Please enter a valid email address.";
    if (!occasions.includes(submitted.occasion))
      nextErrors.occasion = "Please choose an occasion.";
    const date = new Date(`${submitted.date}T00:00:00`);
    const parsedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(submitted.date) ||
      Number.isNaN(date.getTime()) ||
      parsedDate !== submitted.date ||
      submitted.date < earliestDate()
    )
      nextErrors.date = "Please choose a date after today.";
    setErrors(nextErrors);
    setStorageError("");
    setMessage("");
    if (Object.keys(nextErrors).length) {
      const firstField = Object.keys(nextErrors)[0];
      event.currentTarget
        .querySelector<HTMLElement>(`[name="${firstField}"]`)
        ?.focus();
      return;
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(submitted));
      setSaved(true);
    } catch {
      setStorageError(
        "Your browser could not save this preview. Please allow local storage and try again. No appointment has been booked.",
      );
    }
    requestAnimationFrame(() => feedbackRef.current?.focus());
  }

  function clearSaved() {
    try {
      localStorage.removeItem(storageKey);
      setRequest(emptyRequest);
      setSaved(false);
      setErrors({});
      setStorageError("");
      setMessage("The locally saved preview has been removed.");
    } catch {
      setStorageError(
        "Your browser could not remove the preview. You can remove it through your browser’s site data settings.",
      );
    }
  }

  return (
    <form className="visit-form" onSubmit={submit} noValidate>
      <p className="editorial-eyebrow">Your styling preview</p>
      <h2>
        A few details,
        <br />
        <em>a little inspiration.</em>
      </h2>
      <p className="visit-form-intro" id="preview-privacy">
        This is a demonstration. Your details stay in this browser. Nothing is
        sent, and no real appointment or email follows.
      </p>
      <div className="visit-form-fields">
        <div className="visit-form-field">
          <label htmlFor="visit-name">Your name</label>
          <input
            id="visit-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            value={request.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "visit-name-error" : undefined}
            placeholder="First and last name"
          />
          {errors.name && (
            <p id="visit-name-error" className="visit-form-error">
              {errors.name}
            </p>
          )}
        </div>
        <div className="visit-form-field">
          <label htmlFor="visit-email">Email address</label>
          <input
            id="visit-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            value={request.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={!!errors.email}
            aria-describedby={
              errors.email
                ? "visit-email-error preview-privacy"
                : "preview-privacy"
            }
            placeholder="you@example.com"
          />
          {errors.email && (
            <p id="visit-email-error" className="visit-form-error">
              {errors.email}
            </p>
          )}
        </div>
        <div className="visit-form-field">
          <label htmlFor="visit-occasion">The occasion</label>
          <select
            id="visit-occasion"
            name="occasion"
            required
            value={request.occasion}
            onChange={(event) => update("occasion", event.target.value)}
            aria-invalid={!!errors.occasion}
            aria-describedby={
              errors.occasion ? "visit-occasion-error" : undefined
            }
          >
            <option value="">Choose your occasion</option>
            {occasions.map((occasion) => (
              <option key={occasion}>{occasion}</option>
            ))}
          </select>
          {errors.occasion && (
            <p id="visit-occasion-error" className="visit-form-error">
              {errors.occasion}
            </p>
          )}
        </div>
        <div className="visit-form-field">
          <label htmlFor="visit-date">Preferred date</label>
          <input
            id="visit-date"
            name="date"
            type="date"
            required
            min={minDate || undefined}
            value={request.date}
            onChange={(event) => update("date", event.target.value)}
            aria-invalid={!!errors.date}
            aria-describedby={
              errors.date ? "visit-date-error" : "visit-date-note"
            }
          />
          <p id="visit-date-note" className="visit-field-note">
            Choose a date after today.
          </p>
          {errors.date && (
            <p id="visit-date-error" className="visit-form-error">
              {errors.date}
            </p>
          )}
        </div>
      </div>
      <button type="submit" className="editorial-solid-link">
        Save my preview <span aria-hidden="true">↗</span>
      </button>
      <div
        className="visit-form-feedback"
        ref={feedbackRef}
        tabIndex={-1}
        aria-live="polite"
        aria-atomic="true"
      >
        {saved && (
          <>
            <p className="visit-form-success">
              Preview request saved. No appointment has been booked.
            </p>
            <p>
              Your details are stored on this device only. You can remove them
              below.
            </p>
          </>
        )}
        {storageError && <p className="visit-form-error">{storageError}</p>}
        {message && <p>{message}</p>}
      </div>
      <button type="button" className="visit-clear-button" onClick={clearSaved}>
        Clear saved preview details
      </button>
    </form>
  );
}
