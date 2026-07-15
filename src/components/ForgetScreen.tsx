import { useState } from "react";
import { KeyRound } from "lucide-react";

interface ForgetScreenProps {
  onNavigateToLogin: () => void;
}

export default function ForgetScreen({ onNavigateToLogin }: ForgetScreenProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
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
        <p style={{ fontSize: 14, color: "var(--text-tertiary)", margin: 0 }}>
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
            backgroundColor: "var(--bg-input)",
            border: "0.5px solid var(--border)",
            borderRadius: 12,
            color: "var(--text)",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 16px",
            backgroundColor: "var(--text)",
            border: "none",
            borderRadius: 40,
            color: "var(--bg)",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            Send Reset Link
          </button>
        </form>
      ) : (
        <button
          onClick={() => setSubmitted(false)}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "transparent",
            border: "0.5px solid var(--border)",
            borderRadius: 40,
            color: "var(--text)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
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
            color: "var(--accent)",
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
