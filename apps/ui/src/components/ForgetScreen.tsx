import { useState } from "react";
import { KeyRound } from "lucide-react";

interface ForgetScreenProps {
  onRequestReset: (email: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

export default function ForgetScreen({ onRequestReset, onNavigateToLogin }: ForgetScreenProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await onRequestReset(email.trim());
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send the reset email.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <KeyRound size={48} color="var(--text)" />
        </div>
        <h1
          style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 8 }}
        >
          Forgot Password
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          {submitted
            ? "Check your email for reset instructions."
            : "Enter your email to reset your password."}
        </p>
      </div>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "var(--bg-raised)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text)",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          />

          {error && (
            <p style={{ margin: 0, color: "#ff4d4d", fontSize: 13 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "var(--text)",
              border: "none",
              borderRadius: 8,
              color: "var(--bg)",
              fontSize: 16,
              fontWeight: 600,
              cursor: submitting ? "wait" : "pointer",
              opacity: submitting ? 0.6 : 1,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--text-soft)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--text)";
            }}
          >
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <button
          onClick={() => {
            setSubmitted(false);
            setError(null);
          }}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--text)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--text-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          Try Another Email
        </button>
      )}

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button
          onClick={onNavigateToLogin}
          style={{
            background: "none",
            border: "none",
            color: "#3b82f6",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
          }}
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
