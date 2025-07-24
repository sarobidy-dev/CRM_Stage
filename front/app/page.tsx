"use client"
import { useState } from "react"
import type React from "react"

import { useRouter } from "next/navigation"
import { Formik, Form, Field } from "formik"
import { fetchUtilisateurs } from "@/service/Utlisateur.service"
import { FaFacebook, FaGlobe, FaEye, FaEyeSlash } from "react-icons/fa"

type LoginValues = {
  email: string
  password: string
  role: string
}

// Fonction améliorée pour sauvegarder les cookies avec photo_profil
const saveUserToCookies = (userData: any) => {
  const enhancedUserData = {
    ...userData,
    loginTime: new Date().toISOString(),
    sessionId: Math.random().toString(36).substring(2) + Date.now().toString(36),
    actif: true,
    // S'assurer que photo_profil est incluse
    photo_profil: userData.photo_profil || null,
  }

  // Cookie principal avec toutes les données (7 jours au lieu d'1 heure)
  document.cookie = `user=${encodeURIComponent(JSON.stringify(enhancedUserData))}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict; Secure=${process.env.NODE_ENV === "production"}`

  // Cookies séparés pour un accès rapide
  document.cookie = `userId=${userData.id}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
  document.cookie = `userRole=${encodeURIComponent(userData.role)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
  document.cookie = `userName=${encodeURIComponent(userData.nom)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`

  // Cookie spécial pour la photo de profil
  if (userData.photo_profil) {
    document.cookie = `userPhoto=${encodeURIComponent(userData.photo_profil)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
  }
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center space-x-3 group">
        <div className="relative overflow-hidden rounded-full">
          <img
            src="/images/logo.jpg"
            alt="Logo ITDC MADA"
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <span className="text-xl font-bold text-gray-800 tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          ITDC MADA
        </span>
      </div>
      <div className="flex space-x-3 items-center">
        <a
          href="https://www.facebook.com/ITDCMADA"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <FaFacebook className="w-5 h-5" />
          <span className="font-medium">Facebook</span>
        </a>
        <a
          href="https://itdcmada.mg/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 px-4 py-2 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
        >
          <FaGlobe className="w-5 h-5" />
          <span className="font-medium">Site Web</span>
        </a>
      </div>
    </nav>
  )
}

function LoginForm({
  onSubmit,
  formError,
  showPassword,
  setShowPassword,
  isSubmitting,
}: {
  onSubmit: (values: LoginValues, helpers: any) => void
  formError: string
  showPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  isSubmitting: boolean
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 transform transition-all duration-500 hover:shadow-3xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Connexion
          </h2>
          <p className="text-gray-600">Accédez à votre espace personnel</p>
        </div>

        <Formik<LoginValues> initialValues={{ email: "", password: "", role: "" }} onSubmit={onSubmit}>
          {() => (
            <Form className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse Email
                </label>
                <div className="relative">
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="votre@email.com"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                  >
                    {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-3 flex items-center">
                  <input
                    id="showPassword"
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword((prev) => !prev)}
                    className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
                  />
                  <label
                    htmlFor="showPassword"
                    className="ml-2 text-sm text-gray-600 cursor-pointer hover:text-indigo-600 transition-colors"
                  >
                    Afficher le mot de passe
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Rôle
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    name="role"
                    id="role"
                    required
                    className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    <option value="">-- Sélectionner un rôle --</option>
                    <option value="Administrateur">👑 Administrateur</option>
                    <option value="Commercial">💼 Commercial</option>
                    <option value="Superviseur">👥 Superviseur</option>
                  </Field>
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-pulse">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-700 font-medium" role="alert">
                      {formError}
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                        />
                      </svg>
                      Se connecter
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Problème de connexion ?
            <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium ml-1 transition-colors">
              Contactez le support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: LoginValues, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
    setFormError("")
    setIsSubmitting(true)

    try {
      const users = await fetchUtilisateurs()
      const user = users.find((u) => u.email === values.email && u.role === values.role)

      if (!user) {
        setFormError("Email ou rôle incorrect")
        return
      }

      if (user.mot2pass !== values.password) {
        setFormError("Mot de passe incorrect")
        return
      }

      if (!user.actif) {
        setFormError("Compte inactif, contactez un administrateur")
        return
      }

      const userData = {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        photo_profil: user.photo_profil, // S'assurer que photo_profil est incluse
        actif: user.actif,
      }

      // 🔐 Enregistrement amélioré des cookies avec photo_profil
      saveUserToCookies(userData)

      // ✅ Redirection avec animation
      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error) {
      console.error("Erreur de connexion:", error)
      setFormError("Impossible de joindre l'API – réessayez plus tard.")
    } finally {
      setSubmitting(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col overflow-hidden">
      {/* Éléments décoratifs d'arrière-plan avec beaucoup plus de cercles animés */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="w-full h-full filter blur-md">
          {/* Cercles principaux */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-orange-600 rounded-full opacity-10 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-orange-500 rounded-full opacity-10 animate-pulse delay-1000"></div>

          {/* Cercle central rotatif */}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-400 to-indigo-600 rounded-full opacity-5 animate-spin"
            style={{ animationDuration: "20s" }}
          ></div>

          {/* Nouveaux cercles animés partout */}
          <div
            className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-8 animate-bounce"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-br from-white to-orange-500 rounded-full opacity-8 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-white to-blue-500 rounded-full opacity-6 animate-ping"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-32 right-32 w-28 h-28 bg-gradient-to-br from-blue-400 to-orange-500 rounded-full opacity-8 animate-bounce"
            style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
          ></div>

          {/* Cercles moyens flottants */}
          <div
            className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-br from-white to-blue-500 rounded-full opacity-10 animate-pulse"
            style={{ animationDuration: "2s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full opacity-12 animate-bounce"
            style={{ animationDuration: "3.5s" }}
          ></div>
          <div
            className="absolute top-1/3 right-1/3 w-36 h-36 bg-gradient-to-br from-blue-400 to-orange-500 rounded-full opacity-6 animate-spin"
            style={{ animationDuration: "15s" }}
          ></div>
          <div
            className="absolute bottom-1/3 left-1/3 w-44 h-44 bg-gradient-to-br from-white to-blue-400 rounded-full opacity-8 animate-pulse"
            style={{ animationDuration: "4s", animationDelay: "2s" }}
          ></div>

          {/* Petits cercles dispersés */}
          <div
            className="absolute top-16 left-1/2 w-12 h-12 bg-gradient-to-br from-white to-blue-500 rounded-full opacity-15 animate-ping"
            style={{ animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-1/2 right-16 w-14 h-14 bg-gradient-to-br from-blue-400 to-yellow-500 rounded-full opacity-12 animate-bounce"
            style={{ animationDuration: "2.8s" }}
          ></div>
          <div
            className="absolute bottom-16 left-1/2 w-18 h-18 bg-gradient-to-br from-white to-blue-500 rounded-full opacity-10 animate-pulse"
            style={{ animationDuration: "3.2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-16 w-22 h-22 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full opacity-14 animate-spin"
            style={{ animationDuration: "12s" }}
          ></div>

          {/* Cercles très petits pour effet de particules */}
          <div
            className="absolute top-24 right-1/3 w-8 h-8 bg-gradient-to-br from-blue-400 to-orange-500 rounded-full opacity-20 animate-pulse"
            style={{ animationDuration: "1.5s" }}
          ></div>
          <div
            className="absolute bottom-24 left-1/4 w-6 h-6 bg-gradient-to-br from-orange-400 to-blue-500 rounded-full opacity-25 animate-bounce"
            style={{ animationDuration: "2.2s" }}
          ></div>
          <div
            className="absolute top-40 left-3/4 w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full opacity-18 animate-ping"
            style={{ animationDuration: "2.8s" }}
          ></div>
          <div
            className="absolute bottom-40 right-1/4 w-7 h-7 bg-gradient-to-br from-white to-blue-500 rounded-full opacity-22 animate-pulse"
            style={{ animationDuration: "1.8s" }}
          ></div>

          {/* Cercles en mouvement orbital */}
          <div className="absolute top-1/2 left-1/2 w-64 h-64 animate-spin" style={{ animationDuration: "30s" }}>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-500 rounded-full opacity-15"></div>
          </div>
          <div
            className="absolute top-1/2 left-1/2 w-48 h-48 animate-spin"
            style={{ animationDuration: "25s", animationDirection: "reverse" }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full opacity-20"></div>
          </div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 animate-spin" style={{ animationDuration: "40s" }}>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full opacity-12"></div>
          </div>

          {/* Cercles avec animation de scale */}
          <div
            className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full opacity-8 animate-pulse"
            style={{ animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-gradient-to-br from-teal-400 to-green-500 rounded-full opacity-10 animate-ping"
            style={{ animationDuration: "3.5s" }}
          ></div>
        </div>

      </div>
      <Navbar />

      <main className="flex flex-col lg:flex-row w-full h-[calc(100vh-80px)] mt-20 relative z-10 justify-center">
        <section className="w-full lg:w-1/2 flex flex-col justify-center bg-transparent p-10 space-y-16">
          <div className="animate-fade-in-up">
            <LoginForm
              onSubmit={handleSubmit}
              formError={formError}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSubmitting={isSubmitting}
            />
          </div>
        </section>


      </main>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        /* Animations personnalisées pour les cercles */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }

        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-reverse {
          animation: float-reverse 4s ease-in-out infinite;
        }

        .animate-scale-pulse {
          animation: scale-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
