import { useRef, useState } from "react";
import { ImagePlus, Video, Upload, X } from "lucide-react";

type MediaDraft = {
  url: string;
  type: "image" | "video";
  name: string;
};

interface NewPostScreenProps {
  onPublish: (caption: string, media?: MediaDraft) => void;
  onClose: () => void;
}

export default function NewPostScreen({ onPublish, onClose }: NewPostScreenProps) {
  const [caption, setCaption] = useState("");
  const [draft, setDraft] = useState<MediaDraft | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const type = file.type.startsWith("video/") ? "video" : "image";

    const reader = new FileReader();
    reader.onload = () => {
      setDraft({
        url: String(reader.result),
        type,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handlePublish = () => {
    onPublish(caption || "no caption", draft ?? undefined);
    setCaption("");
    setDraft(null);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: 24,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18 }}>new post</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text)", cursor: "pointer", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={openFilePicker}
          style={{
            background: "var(--bg-input)",
            minHeight: 180,
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-tertiary)",
            gap: 8,
            border: "0.5px solid var(--border)",
            width: "100%",
            padding: 18,
            cursor: "pointer",
          }}
        >
          {draft ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: 260,
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "0.5px solid var(--border)",
                  background: "var(--bg)",
                }}
              >
                {draft.type === "video" ? (
                  <video
                    src={draft.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      backgroundImage: `url(${draft.url})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {draft.type === "video" ? (
                  <Video size={16} />
                ) : (
                  <ImagePlus size={16} />
                )}
                <span
                  style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "center" }}
                >
                  {draft.name}
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                {draft.type === "video" ? "video selected" : "image selected"}
              </span>
            </div>
          ) : (
            <>
              <Upload size={32} />
              <span style={{ fontSize: 13 }}>click to add photo or video</span>
            </>
          )}
        </button>

        {draft && (
          <button
            type="button"
            onClick={() => {
              setDraft(null);
            }}
            style={{
              alignSelf: "flex-end",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              padding: 0,
            }}
          >
            <X size={14} />
            remove media
          </button>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="write a caption..."
          rows={3}
          style={{
            background: "var(--bg-card)",
            border: "0.5px solid var(--border)",
            borderRadius: 16,
            padding: 12,
            color: "var(--text)",
            width: "100%",
            fontFamily: "inherit",
            fontSize: 15,
            resize: "vertical",
          }}
        />

        <button
          onClick={handlePublish}
          style={{
            background: "var(--text)",
            color: "var(--bg)",
            border: "none",
            padding: "13px",
            borderRadius: 40,
            fontWeight: 700,
            fontSize: 15,
            width: "100%",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          publish post
        </button>
      </div>
    </div>
  );
}
