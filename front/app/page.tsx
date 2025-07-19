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
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md px-6 py-4 flex justify-between items-center"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <img src="/images/logo.jpg" alt="Logo ITDC MADA" className="h-10 w-auto" />
        <span className="text-xl font-bold text-gray-800 tracking-wide">ITDC MADA</span>
      </div>

      {/* External links */}
      <div className="flex space-x-4 items-center">
        <a
          href="https://www.facebook.com/ITDCMADA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          aria-label="Facebook ITDC MADA"
        >
          <FaFacebook className="w-5 h-5" />
          <span className="font-medium">Facebook</span>
        </a>

        <a
          href="https://itdcmada.mg/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          aria-label="Site Web ITDC MADA"
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
        <Form className="space-y-6" noValidate>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Field
              type="email"
              name="email"
              id="email"
              required
              aria-required="true"
              autoComplete="email"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <Field
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              required
              aria-required="true"
              autoComplete="current-password"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <div className="mt-2 flex items-center">
              <input
                id="showPassword"
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword((prev) => !prev)}
                className="mr-2 focus:ring-indigo-500 cursor-pointer"
              />
              <label
                htmlFor="showPassword"
                className="text-sm text-gray-600 cursor-pointer select-none"
              >
                Afficher le mot de passe
              </label>
            </div>
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Rôle
            </label>
            <Field
              as="select"
              name="role"
              id="role"
              required
              aria-required="true"
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="">-- Sélectionner un rôle --</option>
              <option value="Administrateur">Administrateur</option>
              <option value="Commercial">Commercial</option>
              <option value="Superviseur">Superviseur</option>
            </Field>
          </div>

          {/* Error message */}
          {formError && (
            <p
              className="text-sm text-red-600 text-center"
              role="alert"
              aria-live="assertive"
            >
              {formError}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition"
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
    { setSubmitting }: { setSubmitting: (v: boolean) => void },
  ) => {
    setFormError('');
    setIsSubmitting(true);
    try {
      const users = await fetchUtilisateurs();
      const user = users.find(
        (u) => u.email === values.email && u.role === values.role,
      );

      if (!user) {
        setFormError('Email ou rôle incorrect');
        setSubmitting(false);
        setIsSubmitting(false);
        return;
      }

      if (user.mot2pass !== values.password) {
        setFormError('Mot de passe incorrect');
        setSubmitting(false);
        setIsSubmitting(false);
        return;
      }

      if (!user.actif) {
        setFormError('Compte inactif, contactez un administrateur');
        setSubmitting(false);
        setIsSubmitting(false);
        return;
      }

      document.cookie = `userId=${user.id}; path=/; max-age=3600`;
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

      <main
        className="flex flex-col lg:flex-row w-full h-[calc(100vh-80px)] mt-20"
        role="main"
      >
        {/* Left side: presentation + form */}
        <section
          className="w-full lg:w-1/2 flex flex-col justify-center bg-white p-10 space-y-16"
          aria-labelledby="login-title"
        >

          <div className="w-full max-w-md mx-auto">
            <h2
              id="login-title"
              className="text-3xl font-bold mb-6 text-center text-indigo-700"
            >
              Connexion
            </h2>
            <LoginForm
              onSubmit={handleSubmit}
              formError={formError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSubmitting={isSubmitting}
            />
          </div>
        </section>

        {/* Right side: illustration */}
        <section
          className="hidden lg:block w-1/2 h-full overflow-hidden rounded-2xl shadow-xl"
          aria-label="Illustration"
        >
          <img
            src="/images/Projet-Professionnel-1.png"
            alt="Illustration de la page de connexion"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </section>
      </main>
    </div>
  );
}
