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
          <KeyRound size={48} color="#ffffff" />
        </div>
        <h1
          style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 8 }}
        >
          Forgot Password
        </h1>
        <p style={{ fontSize: 14, color: "#a3a3a3", margin: 0 }}>
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
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#333";
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: "#fff",
              border: "none",
              borderRadius: 8,
              color: "#000",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#d4d4d4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fff";
            }}
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
            border: "1px solid #333",
            borderRadius: 8,
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#666";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#333";
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
