import { useState } from "react";
import { LogIn } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
  onNavigateToForget: () => void;
}

export default function LoginScreen({
  onLogin,
  onNavigateToRegister,
  onNavigateToForget,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
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
          <LogIn size={48} color="var(--text)" />
        </div>
        <h1
          style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}
        >
          Verso
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Sign in to your account
        </p>
      </div>

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
          placeholder="Email or Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Sign In
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            margin: 0,
            marginBottom: 12,
          }}
        >
          Demo: Use any email and password
        </p>
        <button
          type="button"
          onClick={onNavigateToForget}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent)",
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            marginBottom: 12,
            display: "block",
            width: "100%",
          }}
        >
          Forgot password?
        </button>

        <button
          onClick={onNavigateToRegister}
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
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}
