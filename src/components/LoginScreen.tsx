import { useState } from "react";
import { LogIn } from "lucide-react";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
}

export default function LoginScreen({
  onLogin,
  onNavigateToRegister,
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
          <LogIn size={48} color="#fffff" />
        </div>
        <h1
          style={{ fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}
        >
          Verso
        </h1>
        <p style={{ fontSize: 14, color: "#ffff", margin: 0 }}>
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

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            backgroundColor: "#fff", // black background
            border: "none",
            borderRadius: 8,
            color: "#000", // white text
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333333"; // dark gray on hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff"; // back to black
          }}
        >
          Sign In
        </button>
      </form>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <p
          style={{
            fontSize: 13,
            color: "#666",
            margin: 0,
            marginBottom: 12,
          }}
        >
          Demo: Use any email and password
        </p>
        <button
          type="button"
          // onClick={onForgotPassword}
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
          Forgot password?
        </button>

        <button
          onClick={onNavigateToRegister}
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
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}
