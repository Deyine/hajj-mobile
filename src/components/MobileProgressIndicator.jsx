/**
 * Circular Progress Ring Component
 * SVG-based circular progress indicator showing completion percentage
 */
function CircularProgress({ percentage, currentStep, totalSteps }) {
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="white"
          className="text-muted-foreground/20"
        />
        {/* Progress circle with gradient */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2C5F2D" />
            <stop offset="100%" stopColor="#97CC04" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center leading-tight">
          <div className="text-xl font-bold text-foreground">
            {currentStep}
          </div>
          <div className="text-xs text-muted-foreground">من {totalSteps}</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Mobile-optimized progress indicator component with integrated header
 * Shows hajj info, photo, and progress in one unified section
 * Based on mobile UX best practices for multi-step forms
 *
 * Design: Unified header block with gradient background
 */
function MobileProgressIndicator({ currentStep, totalSteps, steps, hajjData, onHeaderClick }) {
  // Get current and next step info
  const current = steps.find(s => s.number === currentStep)
  const next = steps.find(s => s.number === currentStep + 1)

  // Calculate progress percentage
  const percentage = (currentStep / totalSteps) * 100

  return (
    <>
      {/* Crystal Glassmorphism Header - Modern & Clean */}
      <div className="mb-6 relative">
        {/* Gradient Background Layer */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-purple-100/20 to-teal-100/30"
          style={{
            borderRadius: '20px'
          }}
        />

        {/* Glass Effect Layer */}
        <div
          className="relative"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.8)'
          }}
        >
          {/* Subtle shine overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)',
              borderRadius: '20px'
            }}
          />

          {/* Hajj Header Section */}
          <div
            className="py-6 px-6 relative z-10"
            onClick={onHeaderClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-4">
              {/* Hajj Photo with Glass Effect */}
              <div className="flex-shrink-0">
                {hajjData?.photo_url ? (
                  <div
                    className="h-[80px] overflow-hidden relative"
                    style={{
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <img
                      src={hajjData.photo_url}
                      alt={hajjData.full_name_ar}
                      className="h-full w-auto object-contain"
                      style={{ borderRadius: '14px' }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-[80px] h-[80px] flex items-center justify-center"
                    style={{
                      borderRadius: '16px',
                      background: 'rgba(99, 102, 241, 0.1)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '2px solid rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <span className="text-3xl font-bold" style={{ color: '#6366f1' }}>
                      {hajjData?.full_name_ar?.charAt(0) || '👤'}
                    </span>
                  </div>
                )}
              </div>

              {/* Greeting */}
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: '#1e293b' }}>
                  مرحباً {hajjData?.full_name_ar}
                </h2>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  <span className="font-medium">رقم الحاج:</span> {hajjData?.full_reference}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section with Glass Card */}
          <div className="px-6 pb-6 relative z-10">
            <div
              className="p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                borderRadius: '16px',
                boxShadow: '0 4px 16px rgba(31, 38, 135, 0.1)'
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left side: Step information */}
                <div className="flex-1">
                  {/* Current step title */}
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#1e293b' }}>
                    {current?.title || 'جارٍ التحميل...'}
                  </h2>

                  {/* Next step preview */}
                  {next ? (
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      الخطوة التالية: <span className="font-semibold" style={{ color: '#1e293b' }}>{next.title}</span>
                    </p>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: '#10b981' }}>
                      🎉 اكتملت جميع المراحل
                    </p>
                  )}
                </div>

                {/* Right side: Circular progress ring */}
                <div className="flex-shrink-0">
                  <CircularProgress
                    percentage={percentage}
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MobileProgressIndicator
