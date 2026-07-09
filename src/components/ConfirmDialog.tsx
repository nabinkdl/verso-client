import Dialog from "./Dialog";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBg = variant === "danger" ? "#ef4444" : "#fff";
  const confirmColor = variant === "danger" ? "#fff" : "#000";
  const confirmShadow =
    variant === "danger" ? "0 2px 12px rgba(239, 68, 68, 0.3)" : "none";

  return (
    <Dialog open={open} onClose={onCancel} variant="center" showClose={false}>
      <div style={{ padding: "28px 24px 22px", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 22,
            background:
              variant === "danger"
                ? "rgba(239, 68, 68, 0.1)"
                : "rgba(59, 130, 246, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={variant === "danger" ? "#ef4444" : "#3b82f6"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {variant === "danger" ? (
              <>
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </>
            )}
          </svg>
        </div>
        <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, letterSpacing: -0.3 }}>
          {title}
        </h3>
        <p
          style={{
            margin: "10px auto 22px",
            color: "#888",
            fontSize: 14,
            lineHeight: 1.5,
            maxWidth: 320,
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "13px",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              border: "1px solid #2a2a2a",
              borderRadius: 14,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
            }
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "13px",
              background: confirmBg,
              color: confirmColor,
              border: "none",
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: confirmShadow,
              transition: "transform 0.2s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
