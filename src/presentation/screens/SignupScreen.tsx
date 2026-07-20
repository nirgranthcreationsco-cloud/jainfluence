import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Text } from '../components/ui/Text';
import { uploadToCloudinary } from '../../data/services/cloudinary';
import type { UserRole, CreatorCategory } from '../../data/types';
import { ALL_USER_ROLES, ALL_CREATOR_CATEGORIES } from '../../data/types';

type Step = 1 | 2 | 3;

const inputStyle: React.CSSProperties = {
  border: 'none',
  outline: 'none',
  backgroundColor: 'transparent',
  fontSize: '16px',
  fontFamily: 'var(--font-family)',
  color: '#111111',
  width: '100%',
  padding: 0,
};

const ROLE_ACCENT: Record<UserRole, string> = {
  Creator: '#7C3AED',
  Business: '#2563EB',
  Individual: '#059669',
  Organization: '#D4AF37',
};

const ROLE_DESC: Record<UserRole, string> = {
  Creator: 'Share your craft, build an audience',
  Business: 'Post opportunities, hire talent',
  Individual: 'Participate as a community member',
  Organization: 'Represent trusts, NGOs, foundations',
};

export const SignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setSignupDraft, completeSignup, isLoading, error } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Step 3
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<CreatorCategory[]>([]);
  const [businessName, setBusinessName] = useState('');
  const [businessIndustry, setBusinessIndustry] = useState('');
  const [businessWebsite, setBusinessWebsite] = useState('');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [step1Error, setStep1Error] = useState('');

  const fieldWrap = (field: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 0',
    borderBottom: focusedField === field
      ? '1.5px solid #D4AF37'
      : '1px solid rgba(17,17,17,0.1)',
    transition: 'border-color 0.15s ease',
    marginBottom: '4px',
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleStep1Next = () => {
    if (!name.trim()) { setStep1Error('Please enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { setStep1Error('Please enter a valid email.'); return; }
    if (password.length < 6) { setStep1Error('Password must be at least 6 characters.'); return; }
    setStep1Error('');
    setSignupDraft({ name: name.trim(), email: email.trim(), password });
    setStep(2);
  };

  const handleStep2Next = async () => {
    let profilePhotoUrl: string | undefined;
    if (avatarFile) {
      setIsUploadingPhoto(true);
      try { profilePhotoUrl = await uploadToCloudinary(avatarFile); }
      finally { setIsUploadingPhoto(false); }
    }
    setSignupDraft({ bio: bio.trim() || 'Proud member of the Jain community.', city: city.trim(), profilePhoto: profilePhotoUrl });
    setStep(3);
  };

  const toggleRole = (role: UserRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleCategory = (cat: CreatorCategory) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleFinalSubmit = async () => {
    setSignupDraft({
      roles: selectedRoles,
      creatorCategories: selectedCategories,
      businessName: businessName.trim() || undefined,
      businessIndustry: businessIndustry.trim() || undefined,
      businessWebsite: businessWebsite.trim() || undefined,
    });
    const success = await completeSignup();
    if (success) navigate('/');
  };

  const isCreator = selectedRoles.includes('Creator');
  const isBusiness = selectedRoles.includes('Business') || selectedRoles.includes('Organization');

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#FAFAFA',
        backgroundImage: `url('https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1080&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        animation: 'pageFadeIn 0.5s ease',
      }}
    >
      {/* Blur Overlay */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(250,250,250,0.85)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', zIndex: 1,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 2,
        backgroundColor: '#FFFFFF',
        padding: '32px 24px',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
        border: '1px solid rgba(17,17,17,0.04)',
        animation: 'pageFadeIn 0.8s var(--spring-smooth) both',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              Step {step} of 3
            </span>
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as Step)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#737373', fontSize: '13px', fontFamily: 'var(--font-family)' }}>
                <ChevronLeft size={14} /> Back
              </button>
            )}
          </div>
          <div style={{ height: '3px', backgroundColor: 'rgba(17,17,17,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#D4AF37', borderRadius: '999px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div style={{ animation: 'pageFadeIn 0.35s ease both' }}>
            <Text variant="hero" style={{ fontWeight: 800, marginBottom: '6px' }}>Create Account</Text>
            <Text variant="body" style={{ color: '#737373', marginBottom: '28px' }}>Join the Jain community marketplace.</Text>

            <div style={fieldWrap('name')}>
              <input style={inputStyle} placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
            </div>
            <div style={fieldWrap('email')}>
              <input style={inputStyle} type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />
            </div>
            <div style={{ ...fieldWrap('password'), justifyContent: 'space-between' }}>
              <input style={{ ...inputStyle, flex: 1 }} type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
              <button onClick={() => setShowPassword(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A3A3A3', fontSize: '12px', fontFamily: 'var(--font-family)', flexShrink: 0, paddingLeft: '8px' }}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {step1Error && <div style={{ marginTop: '12px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,59,48,0.05)', color: '#FF3B30', fontSize: '13px', border: '1px solid rgba(255,59,48,0.1)' }}>{step1Error}</div>}

            <Button variant="primary" fullWidth onClick={handleStep1Next} style={{ height: '52px', borderRadius: '14px', marginTop: '24px' }}>
              Continue <ChevronRight size={16} />
            </Button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div style={{ animation: 'pageFadeIn 0.35s ease both' }}>
            <Text variant="hero" style={{ fontWeight: 800, marginBottom: '6px' }}>Your Profile</Text>
            <Text variant="body" style={{ color: '#737373', marginBottom: '24px' }}>Let the community know who you are.</Text>

            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div style={{ position: 'relative', width: '84px', height: '84px', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" style={{ width: '84px', height: '84px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '84px', height: '84px', borderRadius: '50%', backgroundColor: 'rgba(212,175,55,0.08)', border: '2px dashed rgba(212,175,55,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '4px' }}>
                    <Camera size={20} color="#D4AF37" />
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#D4AF37', textAlign: 'center' }}>ADD PHOTO</span>
                  </div>
                )}
                {avatarPreview && (
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    <Camera size={12} color="white" />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} style={{ display: 'none' }} />
            </div>

            <div style={{ ...fieldWrap('bio'), alignItems: 'flex-start' }}>
              <textarea
                style={{ ...inputStyle, resize: 'none', minHeight: '60px', lineHeight: 1.6 }}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={e => setBio(e.target.value)}
                onFocus={() => setFocusedField('bio')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            <div style={fieldWrap('city')}>
              <input style={inputStyle} placeholder="City (e.g. Mumbai, Jaipur...)" value={city} onChange={e => setCity(e.target.value)} onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)} />
            </div>

            <Button variant="primary" fullWidth onClick={handleStep2Next} disabled={isUploadingPhoto} style={{ height: '52px', borderRadius: '14px', marginTop: '24px' }}>
              {isUploadingPhoto ? 'Uploading photo…' : (<>Continue <ChevronRight size={16} /></>)}
            </Button>
          </div>
        )}

        {/* ── STEP 3 ── */}
        {step === 3 && (
          <div style={{ animation: 'pageFadeIn 0.35s ease both' }}>
            <Text variant="hero" style={{ fontWeight: 800, marginBottom: '6px' }}>Your Identity</Text>
            <Text variant="body" style={{ color: '#737373', marginBottom: '24px' }}>Select all that apply. You can change this later.</Text>

            {/* Roles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {ALL_USER_ROLES.map(role => {
                const active = selectedRoles.includes(role);
                const accent = ROLE_ACCENT[role];
                return (
                  <div
                    key={role}
                    onClick={() => toggleRole(role)}
                    style={{
                      border: `1.5px solid ${active ? accent : 'rgba(17,17,17,0.08)'}`,
                      borderRadius: '14px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: active ? `${accent}08` : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111111', fontFamily: 'var(--font-family)' }}>{role}</div>
                      <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px', fontFamily: 'var(--font-family)' }}>{ROLE_DESC[role]}</div>
                    </div>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: active ? accent : 'transparent',
                      border: `1.5px solid ${active ? accent : 'rgba(17,17,17,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}>
                      {active && <Check size={13} color="white" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Creator Categories */}
            {isCreator && (
              <div style={{ marginBottom: '24px', animation: 'pageFadeIn 0.25s ease both' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                  Creator Categories
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_CREATOR_CATEGORIES.map(cat => {
                    const active = selectedCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '20px',
                          border: `1.5px solid ${active ? '#7C3AED' : 'rgba(17,17,17,0.1)'}`,
                          backgroundColor: active ? 'rgba(124,58,237,0.08)' : 'transparent',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: active ? 700 : 500,
                          color: active ? '#7C3AED' : '#555555',
                          transition: 'all 0.15s ease',
                          fontFamily: 'var(--font-family)',
                        }}
                      >
                        {cat}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Business Info */}
            {isBusiness && (
              <div style={{ marginBottom: '24px', animation: 'pageFadeIn 0.25s ease both' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '12px' }}>
                  Business Details
                </div>
                <div style={fieldWrap('bizName')}>
                  <input style={inputStyle} placeholder="Business / Organisation Name" value={businessName} onChange={e => setBusinessName(e.target.value)} onFocus={() => setFocusedField('bizName')} onBlur={() => setFocusedField(null)} />
                </div>
                <div style={fieldWrap('bizIndustry')}>
                  <input style={inputStyle} placeholder="Industry (e.g. Media, Textiles, NGO)" value={businessIndustry} onChange={e => setBusinessIndustry(e.target.value)} onFocus={() => setFocusedField('bizIndustry')} onBlur={() => setFocusedField(null)} />
                </div>
                <div style={fieldWrap('bizWeb')}>
                  <input style={inputStyle} placeholder="Website (optional)" value={businessWebsite} onChange={e => setBusinessWebsite(e.target.value)} onFocus={() => setFocusedField('bizWeb')} onBlur={() => setFocusedField(null)} type="url" />
                </div>
              </div>
            )}

            {error && <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(255,59,48,0.05)', color: '#FF3B30', fontSize: '13px', border: '1px solid rgba(255,59,48,0.1)', marginBottom: '16px' }}>{error}</div>}

            <Button variant="primary" fullWidth onClick={handleFinalSubmit} disabled={isLoading} style={{ height: '52px', borderRadius: '14px' }}>
              {isLoading ? 'Creating Account…' : 'Finish & Enter Community'}
            </Button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '11px', color: '#A3A3A3', fontFamily: 'var(--font-family)' }}>By continuing you agree to our Terms & Conditions</span>
            </div>
          </div>
        )}

        {/* Login link */}
        {step === 1 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#737373', cursor: 'pointer', fontSize: '14px', fontFamily: 'var(--font-family)' }}>
              Already have an account? <strong style={{ color: '#D4AF37' }}>Log In</strong>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
