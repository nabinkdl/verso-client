import { useState } from 'react';
import { ImagePlus } from 'lucide-react';

interface NewPostScreenProps {
  onPublish: (caption: string) => void;
}

export default function NewPostScreen({ onPublish }: NewPostScreenProps) {
  const [caption, setCaption] = useState('');

  const handlePublish = () => {
    onPublish(caption || 'no caption');
    setCaption('');
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
      <div
        style={{
          background: '#0c0c0c',
          borderRadius: 24,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>new post</h2>

        <div
          style={{
            background: '#1a1a1a',
            height: 180,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#444',
            gap: 8,
            border: '0.5px solid #2c2c2c',
          }}
        >
          <ImagePlus size={32} />
          <span style={{ fontSize: 13 }}>mock image (auto)</span>
        </div>

        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="write a caption..."
          rows={3}
          style={{
            background: '#111',
            border: '0.5px solid #333',
            borderRadius: 16,
            padding: 12,
            color: 'white',
            width: '100%',
            fontFamily: 'inherit',
            fontSize: 15,
            resize: 'vertical',
          }}
        />

        <button
          onClick={handlePublish}
          style={{
            background: 'white',
            color: 'black',
            border: 'none',
            padding: '13px',
            borderRadius: 40,
            fontWeight: 700,
            fontSize: 15,
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + publish post
        </button>
      </div>
    </div>
  );
}
