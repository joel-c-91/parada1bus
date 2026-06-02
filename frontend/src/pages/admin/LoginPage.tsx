import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bus, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const loginSchema = z.object({
  email: z.string().min(1, 'El email o usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Credenciales inválidas. Verificá tu email y contraseña.');
      } else {
        setError('Error de conexión. Verificá tu conexión a internet.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-francia-oscuro via-francia to-francia-claro px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Bus className="w-12 h-12 text-white mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
          <p className="text-francia-claro/70 text-sm mt-1">Parada 1 Bus</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-lg p-6 space-y-4"
          noValidate
        >
          {error && (
            <div className="bg-rojo-claro border border-rojo/20 text-rojo-oscuro text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email o Usuario
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent disabled:opacity-50"
              placeholder="admin@parada1bus.com"
              disabled={isSubmitting}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-rojo text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-francia focus:border-transparent disabled:opacity-50"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-rojo text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-francia text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-francia-claro transition-colors disabled:opacity-50 min-h-[44px]"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Ingresando...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Ingresar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
