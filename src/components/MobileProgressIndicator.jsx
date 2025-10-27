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
            className="py-6 px-6 relative overflow-hidden"
            onClick={onHeaderClick}
            style={{ cursor: 'pointer' }}
          >
            {/* Vector Art Background - Oblique Crystal Pattern */}
            <svg
              className="absolute inset-0 w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 400 120"
            >
              <defs>
                {/* Oblique Crystal Pattern */}
                <pattern id="crystalPattern" x="0" y="0" width="120" height="100" patternUnits="userSpaceOnUse">
                  {/* Large oblique crystal - bottom left */}
                  <polygon
                    points="10,60 35,40 50,55 25,75"
                    fill="#2C5F2D"
                    opacity="0.5"
                  />
                  {/* Medium crystal - top right */}
                  <polygon
                    points="70,20 90,10 100,30 80,40"
                    fill="#97CC04"
                    opacity="0.6"
                  />
                  {/* Small crystal - center */}
                  <polygon
                    points="45,45 55,40 60,50 50,55"
                    fill="#2C5F2D"
                    opacity="0.7"
                  />
                  {/* Thin oblique line accent */}
                  <line
                    x1="0" y1="80" x2="30" y2="60"
                    stroke="#97CC04"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                  <line
                    x1="85" y1="50" x2="115" y2="30"
                    stroke="#2C5F2D"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                  {/* Scattered oblique crystals */}
                  <polygon
                    points="95,70 105,65 110,80 100,85"
                    fill="#97CC04"
                    opacity="0.5"
                  />
                  <polygon
                    points="15,15 25,10 30,20 20,25"
                    fill="#2C5F2D"
                    opacity="0.4"
                  />
                </pattern>
              </defs>
              <rect width="400" height="120" fill="url(#crystalPattern)" opacity="0.06" />

              {/* Wave Elements - Top waves flowing down */}
              <path
                d="M0,80 Q50,70 100,80 T200,80 T300,80 T400,80 L400,120 L0,120 Z"
                fill="#2C5F2D"
                opacity="0.08"
              />
              <path
                d="M0,90 Q50,82 100,90 T200,90 T300,90 T400,90 L400,120 L0,120 Z"
                fill="#4A9B4D"
                opacity="0.08"
              />

              {/* Bottom waves - Symmetrical, flowing up */}
              <path
                d="M0,120 L0,110 Q50,118 100,110 T200,110 T300,110 T400,110 L400,120 Z"
                fill="#2C5F2D"
                opacity="0.08"
              />
              <path
                d="M0,120 L0,102 Q50,110 100,102 T200,102 T300,102 T400,102 L400,120 Z"
                fill="#6BBF73"
                opacity="0.08"
              />
            </svg>

            {/* Gradient Overlay - Harmonious Green Tones */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/85 via-emerald-50/75 to-green-50/60" />

            {/* Content wrapper with relative positioning */}
            <div className="relative z-10">
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
                  مرحباً بكم
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
          </div>

          {/* Progress Section - Spacious Layout */}
          <div className="p-6 bg-white relative overflow-hidden">
            {/* Reversed Wave from Top - Harmonious Green Transition */}
            <svg
              className="absolute top-0 left-0 w-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              viewBox="0 0 400 40"
              style={{ height: '40px' }}
            >
              {/* Wave flowing downward from top - Matches last wave from first section */}
              <path
                d="M0,0 L400,0 L400,10 Q350,18 300,10 T200,10 T100,10 T0,10 Z"
                fill="#6BBF73"
                opacity="0.12"
              />
              <path
                d="M0,0 L400,0 L400,18 Q350,26 300,18 T200,18 T100,18 T0,18 Z"
                fill="#8FD694"
                opacity="0.10"
              />
            </svg>

            <div className="flex items-center justify-between gap-6 relative z-10">
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
