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
          fill="none"
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-in-out"
        />
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
      {/* Unified header with progress - single gradient background */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border/50 mb-6">
        {/* Hajj Header Section */}
        <div
          className="py-4 px-6"
          onClick={onHeaderClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="flex items-center gap-4">
            {/* Hajj Photo */}
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
            {/* Greeting */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">
                مرحباً {hajjData?.full_name_ar}
              </h2>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">رقم الحاج:</span> {hajjData?.full_reference}
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-primary/20"></div>

        {/* Progress Section */}
        <div className="p-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Step information */}
          <div className="flex-1">
            {/* Current step title */}
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {current?.title || 'جارٍ التحميل...'}
            </h2>

            {/* Next step preview */}
            {next ? (
              <p className="text-sm text-muted-foreground">
                المرحلة التالية: <span className="font-semibold text-foreground">{next.title}</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-primary">
                🎉 اكتملت جميع المراحل
              </p>
            )}
          </div>

          {/* Right side: Circular progress ring indicator */}
          <div className="flex-shrink-0">
            <CircularProgress
              percentage={percentage}
              currentStep={currentStep}
              totalSteps={totalSteps}
            />
          </div>
        </div>

        {/* Current step description */}
        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-sm text-muted-foreground">
            {current?.description}
          </p>
        </div>
        </div>
      </div>
    </>
  )
}

export default MobileProgressIndicator
