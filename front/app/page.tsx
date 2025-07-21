'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import { fetchUtilisateurs } from '@/service/Utlisateur.service';
import { FaFacebook, FaGlobe } from 'react-icons/fa';

type LoginValues = {
  email: string;
  password: string;
  role: string;
};

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <img src="/images/logo.jpg" alt="Logo ITDC MADA" className="h-10 w-auto" />
        <span className="text-xl font-bold text-gray-800 tracking-wide">ITDC MADA</span>
      </div>

      <div className="flex space-x-4 items-center">
        <a
          href="https://www.facebook.com/ITDCMADA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-100"
        >
          <FaFacebook className="w-5 h-5" />
          <span className="font-medium">Facebook</span>
        </a>

        <a
          href="https://itdcmada.mg/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-100"
        >
          <FaGlobe className="w-5 h-5" />
          <span className="font-medium">Site Web</span>
        </a>
      </div>
    </nav>
  );
}

function LoginForm({
  onSubmit,
  formError,
  showPassword,
  setShowPassword,
  isSubmitting,
}: {
  onSubmit: (values: LoginValues, helpers: any) => void;
  formError: string;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
}) {
  return (
    <Formik<LoginValues>
      initialValues={{ email: '', password: '', role: '' }}
      onSubmit={onSubmit}
    >
      {() => (
        <Form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <Field
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <Field
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="mt-2 flex items-center">
              <input
                id="showPassword"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(prev => !prev)}
                className="mr-2"
              />
              <label htmlFor="showPassword" className="text-sm text-gray-600 cursor-pointer">Afficher le mot de passe</label>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
            <Field
              as="select"
              name="role"
              id="role"
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">-- Sélectionner un rôle --</option>
              <option value="Administrateur">Administrateur</option>
              <option value="Commercial">Commercial</option>
              <option value="Superviseur">Superviseur</option>
            </Field>
          </div>

          {formError && (
            <p className="text-sm text-red-600 text-center" role="alert">{formError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
          >
            {isSubmitting ? 'Connexion…' : 'Se connecter'}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void }
  ) => {
    setFormError('');
    setIsSubmitting(true);

    try {
      const users = await fetchUtilisateurs();
      const user = users.find(
        (u) => u.email === values.email && u.role === values.role
      );

      if (!user) {
        setFormError('Email ou rôle incorrect');
        return;
      }

      if (user.mot2pass !== values.password) {
        setFormError('Mot de passe incorrect');
        return;
      }

      if (!user.actif) {
        setFormError('Compte inactif, contactez un administrateur');
        return;
      }

      const userData = {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        photo_profil: user.photo_profil,
      };

      // 🔐 Enregistrement des cookies
      document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=3600`;
      document.cookie = `userId=${user.id}; path=/; max-age=3600`;

      // ✅ Redirection
      router.push('/dashboard');
    } catch {
      setFormError("Impossible de joindre l'API – réessayez plus tard.");
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex flex-col lg:flex-row w-full h-[calc(100vh-80px)] mt-20">
        <section className="w-full lg:w-1/2 flex flex-col justify-center bg-white p-10 space-y-16">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">Connexion</h2>
            <LoginForm
              onSubmit={handleSubmit}
              formError={formError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSubmitting={isSubmitting}
            />
          </div>
        </section>

        <section className="hidden lg:block w-1/2 h-full overflow-hidden rounded-2xl shadow-xl">
          <img
            src="/images/Projet-Professionnel-1.png"
            alt="Illustration de la page de connexion"
            className="w-full h-full object-cover"
          />
        </section>
      </main>
    </div>
  );
}
