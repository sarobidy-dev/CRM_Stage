'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import { fetchUtilisateurs } from '@/service/Utlisateur.service';


type LoginValues = {
  email: string;
  password: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  /** Soumission du formulaire */
  const handleSubmit = async (
    values: LoginValues,
    { setSubmitting }: { setSubmitting: (v: boolean) => void },
  ) => {
    setFormError('');
    try {
      // 1) Récupère tous les utilisateurs
      const users = await fetchUtilisateurs();

      // 2) Cherche celui qui correspond à l’email + rôle
      const user = users.find(
        (u) => u.email === values.email && u.role === values.role,
      );

      if (!user) {
        setFormError('Email ou rôle incorrect');
        return;
      }

    
      if (user.mot2pass !== values.password) {
        setFormError('Mot de passe incorrect');
        return;
      }

      // 4) Vérifie si le compte est actif
      if (!user.actif) {
        setFormError('Compte inactif, contactez un administrateur');
        return;
      }

      // 5) Connexion réussie – stockez ce que vous voulez
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/');
    } catch {
      setFormError("Impossible de joindre l'API – réessayez plus tard.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* --- VIDÉO DE FOND --- */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/videos/crm.mp4" type="video/mp4" />
      </video>

      {/* --- DÉGRADÉ LINÉAIRE NOIR TRANSPARENT --- */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* --- FORMULAIRE --- */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-700">
          Connexion
        </h2>

        <Formik<LoginValues>
          initialValues={{ email: '', password: '', role: '' }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <Field
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-2 flex items-center">
                  <input
                    id="showPassword"
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="showPassword"
                    className="text-sm text-gray-600"
                  >
                    Afficher le mot de passe
                  </label>
                </div>
              </div>

              {/* Rôle */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Rôle
                </label>
                <Field
                  as="select"
                  name="role"
                  id="role"
                  required
                  className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Sélectionner un rôle --</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Superviseur">Superviseur</option>
                </Field>
              </div>

              {/* Message d'erreur global */}
              {formError && (
                <p className="text-sm text-red-600 text-center">{formError}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Connexion…' : 'Se connecter'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
