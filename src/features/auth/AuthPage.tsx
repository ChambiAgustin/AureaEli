import React, { useState } from 'react';
import { Lock, Mail, User, Sparkles, Wind, Eye, EyeOff } from 'lucide-react';
import Typography from '../../shared/components/Typography';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import { apiRepository } from '../../core/api';
import type { UserProfile } from '../../core/api';
import { supabase } from '../../core/supabase/client';

interface AuthPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
  triggerToast: (msg: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  triggerToast,
}) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      triggerToast('Por favor, completa los campos requeridos.');
      return;
    }

    if (!isLogin && !name.trim()) {
      triggerToast('Por favor, ingresa tu nombre de Alma.');
      return;
    }

    setLoading(true);
    const userEmail = email.toLowerCase().trim();

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: userEmail, password });
        if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos.' : error.message);

        const profile = await apiRepository.getUserProfile();
        onLoginSuccess(profile);
        triggerToast(`Bienvenida de regreso, ${profile.name}.`);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: userEmail,
          password,
          options: { data: { name: name.trim() } },
        });
        if (error) throw new Error(error.message);

        if (!data.session) {
          // El proyecto pide confirmar el email antes de dar sesión
          triggerToast('Alma registrada. Revisá tu correo para confirmar la cuenta antes de ingresar.');
          setIsLogin(true);
          return;
        }

        const profile = await apiRepository.getUserProfile();
        onLoginSuccess(profile);
        triggerToast('Alma registrada con éxito. Iniciando diario de calma...');
      }
    } catch (err) {
      console.error('Error during ritual authentication:', err);
      triggerToast(err instanceof Error ? err.message : 'Error al conectar con tu espacio sagrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '450px', margin: '40px auto 80px', padding: '0 20px' }}>
      
      {/* Cabecera de autenticación */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(197, 168, 128, 0.1)',
          border: '1px solid var(--color-dorado-mate)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <Wind size={24} color="var(--color-dorado-mate)" />
        </div>
        <Typography variant="caption" color="gold" weight="semibold">Portal de Autenticación</Typography>
        <Typography variant="h2" style={{ textTransform: 'uppercase', marginTop: '6px', fontSize: '1.8rem' }}>
          {isLogin ? 'Acceso Ritual' : 'Registro de Alma'}
        </Typography>
        <div style={{ width: '30px', height: '1px', backgroundColor: 'var(--color-dorado-mate)', margin: '10px auto' }} />
      </div>

      <Card className="glass-panel" style={{ padding: '28px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {!isLogin && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                Tu Nombre de Alma *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="var(--color-dorado-mate)" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Alma Aurea"
                  style={{ ...inputStyle, paddingLeft: '38px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              Correo Electrónico *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="var(--color-dorado-mate)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alma@aurea.com"
                style={{ ...inputStyle, paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
              Clave de Calma *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="var(--color-dorado-mate)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingLeft: '38px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '8px'
            }}
          >
            {loading ? (
              <span>Conectando...</span>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{isLogin ? 'Iniciar Conexión' : 'Registrar Alma'}</span>
              </>
            )}
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setName('');
              setPassword('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-dorado-mate)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? '¿Primera vez aquí? Registrá tu Alma' : '¿Ya tenés un espacio? Iniciá sesión'}
          </button>
        </div>
      </Card>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  backgroundColor: 'rgba(255, 255, 255, 0.6)',
  border: '1px solid rgba(176, 142, 98, 0.25)',
  borderRadius: '12px',
  color: 'var(--color-text-dark)',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'all 0.3s ease',
};

export default AuthPage;
