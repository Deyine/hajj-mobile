# Android WebView Configuration for Khidmaty Integration

## Pull-to-Refresh Issue

The current issue where scrolling triggers pull-to-refresh in the parent Khidmaty app **cannot be fixed from the web/JavaScript side**. The parent Android app is intercepting touch gestures before they reach the WebView.

## Required Android Code Changes

The Khidmaty Android developers need to make the following changes in their WebView configuration:

### 1. Disable SwipeRefreshLayout (If Used)

If the WebView is wrapped in a `SwipeRefreshLayout`, disable it:

```kotlin
// In the Activity/Fragment where WebView is embedded
swipeRefreshLayout.isEnabled = false
```

or

```java
// Java version
swipeRefreshLayout.setEnabled(false);
```

### 2. Detect Nested Scrolling

If disabling completely isn't desired, handle nested scrolling properly:

```kotlin
swipeRefreshLayout.setOnChildScrollUpCallback { parent, child ->
    // Check if WebView can scroll up
    webView.scrollY > 0
}
```

This prevents refresh when the WebView content is scrollable upward.

### 3. Intercept Touch Events

Handle touch events to prevent parent from capturing WebView scrolls:

```kotlin
webView.setOnTouchListener { v, event ->
    when (event.action) {
        MotionEvent.ACTION_DOWN -> {
            // Disable parent scrolling when touching WebView
            swipeRefreshLayout?.isEnabled = false
        }
        MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
            // Re-enable only if WebView is at top
            swipeRefreshLayout?.isEnabled = (webView.scrollY == 0)
        }
    }
    false // Don't consume the event, let WebView handle it
}
```

### 4. Configure WebView Settings

Ensure proper scroll handling:

```kotlin
webView.settings.apply {
    // Enable smooth scrolling
    setSupportZoom(false)
    builtInZoomControls = false
    displayZoomControls = false
}

// Disable overscroll glow effect if desired
webView.overScrollMode = View.OVER_SCROLL_NEVER
```

### 5. Recommended: Use NestedScrollView Pattern

For better control, use `NestedScrollWebView`:

```kotlin
class NestedScrollWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : WebView(context, attrs, defStyleAttr), NestedScrollingChild {

    private val childHelper = NestedScrollingChildHelper(this)

    init {
        isNestedScrollingEnabled = true
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        val result = super.onTouchEvent(event)

        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                startNestedScroll(ViewCompat.SCROLL_AXIS_VERTICAL)
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                stopNestedScroll()
            }
        }

        return result
    }

    override fun setNestedScrollingEnabled(enabled: Boolean) {
        childHelper.isNestedScrollingEnabled = enabled
    }

    override fun isNestedScrollingEnabled(): Boolean {
        return childHelper.isNestedScrollingEnabled
    }

    // Implement other NestedScrollingChild methods...
}
```

## Testing Checklist

After implementing the above changes, test:

- ✅ Scroll down in WebView content (should scroll smoothly)
- ✅ Scroll up in WebView content (should scroll smoothly)
- ✅ Pull down when WebView is at top (should NOT trigger refresh)
- ✅ Pull up when WebView is at bottom (should NOT cause issues)
- ✅ Modal scrolling inside WebView (should work independently)

## Alternative: Communication Bridge

If modifications aren't possible, implement a JavaScript bridge:

### Android Side:
```kotlin
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun disableRefresh() {
        runOnUiThread {
            swipeRefreshLayout?.isEnabled = false
        }
    }

    @JavascriptInterface
    fun enableRefresh() {
        runOnUiThread {
            swipeRefreshLayout?.isEnabled = true
        }
    }
}, "AndroidBridge")
```

### Web Side:
```javascript
// When page loads
if (window.AndroidBridge) {
    window.AndroidBridge.disableRefresh();
}

// When page unloads
window.addEventListener('beforeunload', () => {
    if (window.AndroidBridge) {
        window.AndroidBridge.enableRefresh();
    }
});
```

## Contact

For implementation assistance, please contact the Khidmaty Android development team with this documentation.
