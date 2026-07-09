import { useState } from "react";
import { ArrowLeft, Globe, Lock, Users, Check, Sparkles } from "lucide-react";
import Dialog from "./Dialog";
import { usePages } from "../contexts/PageContext";

interface CreatePageDialogProps {
  open: boolean;
  onClose: () => void;
  currentUserId: string;
  onCreated?: (pageId: string) => void;
}

const categories = [
  "Technology",
  "Art & Design",
  "Music",
  "Sports",
  "Food",
  "Travel",
  "Fashion",
  "Education",
];

const visibilityOptions = [
  {
    value: "public",
    Icon: Globe,
    label: "Public",
    desc: "Anyone can view and join",
    color: "#3b82f6",
  },
  {
    value: "restricted",
    Icon: Users,
    label: "Restricted",
    desc: "Members need approval to post",
    color: "#f59e0b",
  },
  {
    value: "private",
    Icon: Lock,
    label: "Private",
    desc: "Only approved members can see content",
    color: "#8b5cf6",
  },
];

type Stage = "form" | "success";

export default function CreatePageDialog({
  open,
  onClose,
  currentUserId,
  onCreated,
}: CreatePageDialogProps) {
  const { createPage } = usePages();
  const [stage, setStage] = useState<Stage>("form");
  const [step, setStep] = useState(1);
  const [pageData, setPageData] = useState({
    name: "",
    category: "",
    description: "",
    visibility: "public",
    rulesText: "",
  });
  const [createdPageId, setCreatedPageId] = useState<string | null>(null);
  const [createdPageName, setCreatedPageName] = useState("");

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  const canProceed =
    pageData.name.trim().length > 0 && pageData.category.length > 0;

  const handleCreate = () => {
    if (!pageData.name.trim()) return;
    const rules = pageData.rulesText
      .split("\n")
      .map((rule) => rule.trim())
      .filter(Boolean);
    const id = createPage(
      pageData.name,
      pageData.category,
      pageData.description,
      pageData.visibility,
      currentUserId,
      rules,
    );
    setCreatedPageId(id);
    setCreatedPageName(pageData.name);
    setStage("success");
    if (onCreated) onCreated(id);
  };

  const reset = () => {
    setStage("form");
    setStep(1);
    setPageData({
      name: "",
      category: "",
      description: "",
      visibility: "public",
      rulesText: "",
    });
    setCreatedPageId(null);
    setCreatedPageName("");
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    background: "#0f0f0f",
    border: "1px solid #2a2a2a",
    borderRadius: 14,
    color: "#fff",
    fontSize: 15,
    boxSizing: "border-box" as const,
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#a0a0a0",
    display: "block",
    marginBottom: 8,
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Drag Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              background: "#2a2a2a",
              borderRadius: 2,
            }}
          />
        </div>

        {stage === "form" && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 20px 8px",
              }}
            >
              {step === 2 && (
                <button
                  onClick={handleBack}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.06)")
                  }
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: -0.4,
                  }}
                >
                  {step === 1 ? "Create Page" : "Privacy Settings"}
                </h2>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {[1, 2].map((s) => (
                    <div
                      key={s}
                      style={{
                        flex: 1,
                        height: 4,
                        background: s <= step ? "#fff" : "#2a2a2a",
                        borderRadius: 2,
                        transition: "background 0.3s",
                        maxWidth: 60,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div
              style={{ flex: 1, overflowY: "auto", padding: "20px 20px 20px" }}
            >
              {step === 1 ? (
                <div>
                  <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
                    Tell us about the community you want to build.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 22,
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Page Name</label>
                      <input
                        value={pageData.name}
                        onChange={(e) =>
                          setPageData({ ...pageData, name: e.target.value })
                        }
                        placeholder="e.g. Indie Hackers Kathmandu"
                        autoFocus
                        onFocus={(e) => {
                          e.target.style.borderColor = "#444";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(255,255,255,0.05)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#2a2a2a";
                          e.target.style.boxShadow = "none";
                        }}
                        style={inputStyle}
                      />
                      <div
                        style={{ fontSize: 12, color: "#555", marginTop: 6 }}
                      >
                        {pageData.name.length}/60
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Category</label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                        }}
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() =>
                              setPageData({ ...pageData, category: cat })
                            }
                            style={{
                              padding: "12px 14px",
                              background:
                                pageData.category === cat
                                  ? "rgba(59,130,246,0.1)"
                                  : "#0f0f0f",
                              border:
                                pageData.category === cat
                                  ? "1px solid rgba(59,130,246,0.4)"
                                  : "1px solid #2a2a2a",
                              borderRadius: 12,
                              color:
                                pageData.category === cat ? "#60a5fa" : "#888",
                              fontWeight: 600,
                              fontSize: 13,
                              cursor: "pointer",
                              textAlign: "left",
                              transition: "all 0.2s",
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>
                        Description{" "}
                        <span style={{ fontWeight: 400, color: "#555" }}>
                          (optional)
                        </span>
                      </label>
                      <textarea
                        value={pageData.description}
                        onChange={(e) =>
                          setPageData({
                            ...pageData,
                            description: e.target.value,
                          })
                        }
                        placeholder="What is this community about?"
                        rows={3}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#444";
                          e.target.style.boxShadow =
                            "0 0 0 3px rgba(255,255,255,0.05)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#2a2a2a";
                          e.target.style.boxShadow = "none";
                        }}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>
                    Choose who can see and join{" "}
                    <strong style={{ color: "#fff" }}>{pageData.name}</strong>,
                    then add a few community rules.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                    }}
                  >
                    {visibilityOptions.map((opt) => {
                      const isSelected = pageData.visibility === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setPageData({ ...pageData, visibility: opt.value })
                          }
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 14,
                            padding: "16px",
                            background: isSelected
                              ? `${opt.color}10`
                              : "transparent",
                            border: isSelected
                              ? `1px solid ${opt.color}50`
                              : "1px solid #2a2a2a",
                            borderRadius: 16,
                            color: "#fff",
                            cursor: "pointer",
                            textAlign: "left",
                            width: "100%",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "rgba(255,255,255,0.02)";
                              e.currentTarget.style.borderColor = "#3a3a3a";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.borderColor = "#2a2a2a";
                            }
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: isSelected
                                ? `${opt.color}25`
                                : "rgba(255,255,255,0.05)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s",
                            }}
                          >
                            <opt.Icon
                              size={20}
                              color={isSelected ? opt.color : "#666"}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>
                              {opt.label}
                            </div>
                            <div
                              style={{
                                color: "#666",
                                fontSize: 13,
                                marginTop: 2,
                              }}
                            >
                              {opt.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <div
                              style={{
                                marginLeft: "auto",
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                background: opt.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Check size={13} color="#fff" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <label style={labelStyle}>
                      Community Rules{" "}
                      <span style={{ fontWeight: 400, color: "#555" }}>
                        (optional)
                      </span>
                    </label>
                    <textarea
                      value={pageData.rulesText}
                      onChange={(e) =>
                        setPageData({ ...pageData, rulesText: e.target.value })
                      }
                      placeholder={
                        "Be respectful and constructive.\nNo spam or self-promotion.\nCredit sources and creators."
                      }
                      rows={5}
                      onFocus={(e) => {
                        e.target.style.borderColor = "#444";
                        e.target.style.boxShadow =
                          "0 0 0 3px rgba(255,255,255,0.05)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "#2a2a2a";
                        e.target.style.boxShadow = "none";
                      }}
                      style={{
                        ...inputStyle,
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                    <div style={{ fontSize: 12, color: "#555", marginTop: 6 }}>
                      Add one rule per line.
                    </div>
                  </div>

                  {/* Summary preview */}
                  <div
                    style={{
                      marginTop: 28,
                      padding: 16,
                      background: "#0f0f0f",
                      border: "1px solid #2a2a2a",
                      borderRadius: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#666",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginBottom: 12,
                      }}
                    >
                      Summary
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          background: "#0f0f0f",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {pageData.name.charAt(0).toUpperCase() || "P"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>
                          {pageData.name || "Unnamed"}
                        </div>
                        <div
                          style={{ color: "#888", fontSize: 13, marginTop: 2 }}
                        >
                          {pageData.category || "No category"} ·{" "}
                          {pageData.visibility}
                        </div>
                        {pageData.rulesText.trim() && (
                          <div
                            style={{
                              color: "#666",
                              fontSize: 12,
                              marginTop: 6,
                            }}
                          >
                            {
                              pageData.rulesText.split("\n").filter(Boolean)
                                .length
                            }{" "}
                            community rule(s)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "16px 20px 24px",
                borderTop: "1px solid #1a1a1a",
              }}
            >
              <button
                onClick={step === 2 ? handleCreate : handleNext}
                disabled={!canProceed}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: !canProceed ? "#1f1f1f" : "#fff",
                  color: !canProceed ? "#555" : "#000",
                  border: "none",
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: !canProceed ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  transform: "scale(1)",
                }}
                onMouseDown={(e) => {
                  if (canProceed)
                    e.currentTarget.style.transform = "scale(0.98)";
                }}
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {step === 2 ? "Create Page" : "Continue"}
              </button>
            </div>
          </>
        )}

        {stage === "success" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 28px 32px",
              textAlign: "center",
              flex: 1,
            }}
          >
            <style>
              {`
                @keyframes successPop {
                  0% { transform: scale(0); }
                  50% { transform: scale(1.15); }
                  100% { transform: scale(1); }
                }
                @keyframes ringExpand {
                  0% { transform: scale(0.5); opacity: 0.6; }
                  100% { transform: scale(2); opacity: 0; }
                }
              `}
            </style>

            <div style={{ position: "relative", marginBottom: 28 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.25)",
                  animation: "ringExpand 1.6s ease-out infinite",
                }}
              />
              <div
                style={{
                  position: "relative",
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(16, 185, 129, 0.35)",
                  animation: "successPop 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
                }}
              >
                <Check size={44} color="#fff" strokeWidth={3} />
              </div>
            </div>

            <h3
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: -0.5,
              }}
            >
              Page Created!
            </h3>
            <p
              style={{
                margin: "10px 0 0",
                color: "#888",
                fontSize: 15,
                maxWidth: 320,
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: "#fff" }}>{createdPageName}</strong> is
              now live. Share it with your community and start adding members.
            </p>

            <div
              style={{
                display: "flex",
                gap: 6,
                marginTop: 14,
                padding: "6px 12px",
                background: "rgba(139, 92, 246, 0.1)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                borderRadius: 20,
              }}
            >
              <Sparkles size={14} color="#a78bfa" />
              <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
                You're the admin
              </span>
            </div>

            <div
              style={{
                width: "100%",
                marginTop: 32,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <button
                onClick={handleClose}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  transition: "transform 0.2s",
                }}
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.98)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                Done
              </button>
              <button
                onClick={reset}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "transparent",
                  color: "#888",
                  border: "none",
                  borderRadius: 14,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
              >
                Create another page
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
