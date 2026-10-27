import { useState } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";

interface ResetPasswordScreenProps {
  token: string;
  onResetPassword: (token: string, password: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

const inputStyle: React.CSSProperties = {
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
};

export default function ResetPasswordScreen({
  token,
  onResetPassword,
  onNavigateToLogin,
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await onResetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset your password.",
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
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {done ? (
            <CheckCircle2 size={48} color="#22c55e" />
          ) : (
            <KeyRound size={48} color="var(--text)" />
          )}
        </div>
        <h1
          style={{ fontSize: 24, fontWeight: 700, margin: 0, marginBottom: 8 }}
        >
          {done ? "Password updated" : "Set a new password"}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          {done
            ? "You can now sign in with your new password."
            : "Choose a password with at least 8 characters."}
        </p>
      </div>

      {done ? (
        <button
          onClick={onNavigateToLogin}
          style={{
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "var(--text)",
            border: "none",
            borderRadius: 8,
            color: "var(--bg)",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back to Sign In
        </button>
      ) : (
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
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
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
            }}
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}

      {!done && (
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
      )}
    </div>
  );
}
