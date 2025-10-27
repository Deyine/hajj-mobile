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
      {/* Flat 3.0 Design - Modern Minimalism with Subtle Depth */}
      <div className="mb-8">
        {/* Main Container - Clean with Subtle Elevation */}
        <div
          className="rounded-[20px] bg-white overflow-hidden"
          style={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Hajj Header Section - Minimal & Spacious */}
          <div
            className="py-6 px-6 bg-gradient-to-br from-emerald-50/50 to-lime-50/30"
            onClick={onHeaderClick}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center gap-4">
              {/* Hajj Photo - Original Proportions */}
              <div className="flex-shrink-0">
                {hajjData?.photo_url ? (
                  <div
                    className="h-[80px] rounded-[5px]"
                    style={{
                      display: 'flex',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)'
                    }}
                  >
                    <img
                      src={hajjData.photo_url}
                      alt={hajjData.full_name_ar}
                      className="h-full w-auto object-contain"
                      style={{
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="w-[80px] h-[80px] rounded-[5px] bg-primary/10 flex items-center justify-center"
                    style={{ boxShadow: '0 1px 4px 0 rgba(0, 0, 0, 0.37)' }}
                  >
                    <span className="text-3xl text-primary font-bold">
                      {hajjData?.full_name_ar?.charAt(0) || '👤'}
                    </span>
                  </div>
                )}
              </div>
              {/* Greeting - Large Typography */}
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#9CA3AF' }}>
                  مرحباً بك
                </p>
                <h2 className="text-lg font-bold mb-0.5" style={{ color: '#1F2937', letterSpacing: '-0.01em' }}>
                  {hajjData?.full_name_ar}
                </h2>
                <p className="text-xs font-medium" style={{ color: '#6B7280' }}>
                  <span className="font-semibold">رقم الحاج:</span> {hajjData?.full_reference}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Section - Spacious Layout */}
          <div className="p-6 bg-white">
            <div className="flex items-center justify-between gap-6">
              {/* Left side: Step information with large typography */}
              <div className="flex-1">
                {/* Current step title - Extra Large */}
                <h2
                  className="text-2xl font-extrabold mb-2 leading-tight"
                  style={{ color: '#111827', letterSpacing: '-0.02em' }}
                >
                  {current?.title || 'جارٍ التحميل...'}
                </h2>

                {/* Next step preview */}
                {next ? (
                  <p className="text-sm font-medium" style={{ color: '#6B7280' }}>
                    التالي: <span className="text-primary font-semibold">{next.title}</span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold" style={{ color: '#10B981' }}>
                    ✓ مكتمل
                  </p>
                )}
              </div>

              {/* Right side: Minimal Progress Ring */}
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
    </>
  )
}

export default MobileProgressIndicator
