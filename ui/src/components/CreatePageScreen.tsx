import { useState } from 'react';
import { ArrowLeft, Globe, Users, Lock } from 'lucide-react';
import { usePages } from '../contexts/PageContext';

interface CreatePageScreenProps {
  onClose: () => void;
  currentUserId: string;
}

export default function CreatePageScreen({ onClose, currentUserId }: CreatePageScreenProps) {
  const { createPage } = usePages();
  const [step, setStep] = useState(1);
  const [pageData, setPageData] = useState({
    name: '',
    category: '',
    description: '',
    visibility: 'public',
    rulesText: '',
    avatar: null as string | null,
  });

  const categories = ['Technology', 'Art & Design', 'Music', 'Sports', 'Food', 'Travel', 'Fashion', 'Education'];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);
  const handleCreate = () => {
    if (!pageData.name.trim()) return;
    const rules = pageData.rulesText
      .split('\n')
      .map((rule) => rule.trim())
      .filter(Boolean);
    createPage(pageData.name, pageData.category, pageData.description, pageData.visibility, currentUserId, rules);
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0, marginBottom: 8 }}>Page Details</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Give your page a name and category</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Page Name</label>
                <input
                  value={pageData.name}
                  onChange={(e) => setPageData({ ...pageData, name: e.target.value })}
                  placeholder="Enter page name..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-elevated-2)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text)',
                    fontSize: 14,
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Category</label>
                <select
                  value={pageData.category}
                  onChange={(e) => setPageData({ ...pageData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-elevated-2)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text)',
                    fontSize: 14,
                    appearance: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Description</label>
                <textarea
                  value={pageData.description}
                  onChange={(e) => setPageData({ ...pageData, description: e.target.value })}
                  placeholder="Describe your page..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-elevated-2)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h3 style={{ fontWeight: 700, fontSize: 18, margin: 0, marginBottom: 8 }}>Privacy & Rules</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>Choose who can see and join your page, then add community rules</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { value: 'public', icon: Globe, label: 'Public', desc: 'Anyone can view and join' },
                  { value: 'private', icon: Lock, label: 'Private', desc: 'Only approved members can see content' },
                  { value: 'restricted', icon: Users, label: 'Restricted', desc: 'Members need approval to post' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPageData({ ...pageData, visibility: option.value })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      background: pageData.visibility === option.value ? 'var(--surface-subtle)' : 'transparent',
                      border: pageData.visibility === option.value ? '1px solid var(--text)' : '0.5px solid var(--border)',
                      borderRadius: 14,
                      color: 'var(--text)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <option.icon size={20} color={pageData.visibility === option.value ? 'var(--text)' : 'var(--text-tertiary)'} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{option.label}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{option.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Community Rules <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea
                  value={pageData.rulesText}
                  onChange={(e) => setPageData({ ...pageData, rulesText: e.target.value })}
                  placeholder={'Be respectful and constructive.\nNo spam or self-promotion.\nCredit sources and creators.'}
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-elevated-2)',
                    border: '0.5px solid var(--border)',
                    borderRadius: 12,
                    color: 'var(--text)',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>Add one rule per line.</div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 60,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '90%',
          background: 'var(--bg-elevated)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 20px',
        }}
      >
        {/* Drag Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2 }} />
        </div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={step === 1 ? onClose : handleBack} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Create Page</h2>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {[1, 2].map((s) => (
                <div
                  key={s}
                  style={{
                    width: 40,
                    height: 3,
                    background: s <= step ? 'var(--text)' : 'var(--border)',
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div style={{ paddingTop: 16, borderTop: '0.5px solid var(--border-subtle)' }}>
          <button
            onClick={step === 2 ? handleCreate : handleNext}
            disabled={step === 1 && (!pageData.name || !pageData.category)}
            style={{
              width: '100%',
              padding: '14px',
              background: (step === 1 && (!pageData.name || !pageData.category)) ? 'var(--border)' : 'var(--text)',
              color: (step === 1 && (!pageData.name || !pageData.category)) ? 'var(--text-tertiary)' : 'var(--bg)',
              border: 'none',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: 16,
              cursor: (step === 1 && (!pageData.name || !pageData.category)) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseDown={e => { if (!(step === 1 && (!pageData.name || !pageData.category))) e.currentTarget.style.transform = 'scale(0.96)' }}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {step === 2 ? 'Create Page' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
