import { useEffect, useState } from 'react'
import { getUserInfo } from '../utils/auth'
import { logout } from '../services/oidc'

/**
 * Dashboard page component
 * Displays authenticated user information and provides logout functionality
 */
function Dashboard() {
  const [userInfo, setUserInfo] = useState(null)

  useEffect(() => {
    // Load user info from storage
    const user = getUserInfo()
    setUserInfo(user)
  }, [])

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      logout()
    }
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="navbar bg-base-100 rounded-box shadow-lg mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold">تطبيق الحج</h1>
          </div>
          <div className="flex-none">
            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">معلومات المستخدم</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Arabic Name */}
              {(userInfo.prenomAr || userInfo.patronymeAr) && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">الاسم الكامل</span>
                  </label>
                  <div className="text-lg">
                    {userInfo.prenomAr} {userInfo.perePrenomAr} {userInfo.patronymeAr}
                  </div>
                </div>
              )}

              {/* French Name */}
              {(userInfo.prenomFr || userInfo.patronymeFr) && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Nom complet</span>
                  </label>
                  <div className="text-lg">
                    {userInfo.prenomFr} {userInfo.perePrenomFr} {userInfo.patronymeFr}
                  </div>
                </div>
              )}

              {/* NNI */}
              {userInfo.nni && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">الرقم الوطني</span>
                  </label>
                  <div className="text-lg">{userInfo.nni}</div>
                </div>
              )}

              {/* Email */}
              {userInfo.email && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">البريد الإلكتروني</span>
                  </label>
                  <div className="text-lg">{userInfo.email}</div>
                </div>
              )}

              {/* Phone */}
              {userInfo.numeroTelephone && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">رقم الهاتف</span>
                  </label>
                  <div className="text-lg">{userInfo.numeroTelephone}</div>
                </div>
              )}

              {/* Date of Birth */}
              {userInfo.dateNaissance && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">تاريخ الميلاد</span>
                  </label>
                  <div className="text-lg">{userInfo.dateNaissance}</div>
                </div>
              )}

              {/* Place of Birth (Arabic) */}
              {userInfo.lieuNaissanceAr && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">مكان الميلاد</span>
                  </label>
                  <div className="text-lg">{userInfo.lieuNaissanceAr}</div>
                </div>
              )}

              {/* Gender */}
              {userInfo.sexeCode && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">الجنس</span>
                  </label>
                  <div className="text-lg">
                    {userInfo.sexeCode === 'M' ? 'ذكر' : 'أنثى'}
                  </div>
                </div>
              )}

              {/* Nationality */}
              {userInfo.nationalitiesAr && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">الجنسية</span>
                  </label>
                  <div className="text-lg">{userInfo.nationalitiesAr}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>مرحباً بك في تطبيق الحج. تم تسجيل دخولك بنجاح.</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
