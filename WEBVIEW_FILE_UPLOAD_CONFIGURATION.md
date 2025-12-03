# Android WebView File Upload Configuration

## Problem

File upload (`<input type="file">`) **does not work by default** in Android WebView. When users click on file input fields, nothing happens because WebView needs explicit configuration to handle file chooser dialogs.

## How to Check if File Upload is Enabled

### Test from Web Side

Add this JavaScript to test if file chooser is working:

```javascript
// In browser console or add to your page temporarily
const input = document.createElement('input');
input.type = 'file';
input.click();

// If nothing happens → WebView file upload not configured
// If file picker opens → Configuration is correct ✅
```

### Test in Production

1. Navigate to the passport photo upload page (Step 5)
2. Click on the dashed border upload area
3. **Expected**: Camera/gallery picker should open
4. **If nothing happens**: File upload is not configured in WebView

## Required Android Implementation

WebView requires implementing `WebChromeClient` with file chooser callbacks. Here's the complete solution:

### Step 1: Add Permissions to AndroidManifest.xml

```xml
<manifest>
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />

    <!-- For Android 13+ (API 33+) -->
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />

    <application>
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>
    </application>
</manifest>
```

### Step 2: Create File Provider Paths

Create `res/xml/file_paths.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths>
    <external-path
        name="external_files"
        path="." />
    <cache-path
        name="cache"
        path="." />
</paths>
```

### Step 3: Implement Custom WebChromeClient

```kotlin
class FileChooserWebChromeClient(
    private val activity: Activity
) : WebChromeClient() {

    companion object {
        const val FILE_CHOOSER_REQUEST_CODE = 1001
    }

    // For Android 5.0+ (API 21+)
    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        // Store callback for result handling
        activity.filePathCallback = filePathCallback

        try {
            val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                type = "image/*"
                addCategory(Intent.CATEGORY_OPENABLE)
            }

            // Create chooser with camera option
            val chooserIntent = Intent.createChooser(intent, "اختر صورة")

            // Add camera intent
            val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            if (cameraIntent.resolveActivity(activity.packageManager) != null) {
                val photoFile = createImageFile(activity)
                if (photoFile != null) {
                    val photoURI = FileProvider.getUriForFile(
                        activity,
                        "${activity.packageName}.fileprovider",
                        photoFile
                    )
                    activity.cameraPhotoPath = photoFile.absolutePath
                    cameraIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
                    chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(cameraIntent))
                }
            }

            activity.startActivityForResult(chooserIntent, FILE_CHOOSER_REQUEST_CODE)
            return true

        } catch (e: Exception) {
            filePathCallback?.onReceiveValue(null)
            return false
        }
    }

    private fun createImageFile(context: Context): File? {
        return try {
            val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
            val imageFileName = "JPEG_${timeStamp}_"
            val storageDir = context.getExternalFilesDir(Environment.DIRECTORY_PICTURES)
            File.createTempFile(imageFileName, ".jpg", storageDir)
        } catch (e: Exception) {
            null
        }
    }
}
```

### Step 4: Handle File Chooser Result in Activity

```kotlin
class HajjWebViewActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    var filePathCallback: ValueCallback<Array<Uri>>? = null
    var cameraPhotoPath: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true

                // Enable file access
                allowFileAccess = true
                allowContentAccess = true
            }

            // Set custom WebChromeClient
            webChromeClient = FileChooserWebChromeClient(this@HajjWebViewActivity)
        }

        setContentView(webView)

        // Check and request permissions
        checkPermissions()

        // Load URL
        webView.loadUrl("https://hajj-mobile.next-version.com")
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == FileChooserWebChromeClient.FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback == null) return

            val results = when {
                resultCode == Activity.RESULT_OK && data != null -> {
                    // File selected from gallery
                    data.data?.let { arrayOf(it) }
                }
                resultCode == Activity.RESULT_OK && cameraPhotoPath != null -> {
                    // Photo taken with camera
                    val file = File(cameraPhotoPath!!)
                    if (file.exists()) {
                        arrayOf(Uri.fromFile(file))
                    } else null
                }
                else -> null
            }

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
            cameraPhotoPath = null
        }
    }

    private fun checkPermissions() {
        val permissions = mutableListOf<String>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.READ_MEDIA_IMAGES) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_MEDIA_IMAGES)
            }
        } else {
            if (checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
        }

        if (checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.CAMERA)
        }

        if (permissions.isNotEmpty()) {
            requestPermissions(permissions.toTypedArray(), 100)
        }
    }
}
```

### Step 5: Add Required Imports

```kotlin
import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.core.content.FileProvider
import java.io.File
import java.text.SimpleDateFormat
import java.util.*
```

## Simplified Implementation (Gallery Only)

If you only need gallery selection (no camera), use this simpler version:

```kotlin
class SimpleFileChooserWebChromeClient(
    private val activity: Activity
) : WebChromeClient() {

    companion object {
        const val FILE_CHOOSER_REQUEST_CODE = 1001
    }

    override fun onShowFileChooser(
        webView: WebView?,
        filePathCallback: ValueCallback<Array<Uri>>?,
        fileChooserParams: FileChooserParams?
    ): Boolean {
        activity.filePathCallback = filePathCallback

        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }

        try {
            activity.startActivityForResult(
                Intent.createChooser(intent, "اختر صورة"),
                FILE_CHOOSER_REQUEST_CODE
            )
            return true
        } catch (e: Exception) {
            filePathCallback?.onReceiveValue(null)
            return false
        }
    }
}
```

## Testing Checklist

After implementing the above code:

- [ ] Click on file input → File picker opens
- [ ] Select image from gallery → Image preview shows
- [ ] Take photo with camera → Photo preview shows
- [ ] Upload button appears after selection
- [ ] Upload completes successfully
- [ ] Check browser console for any errors

## Debugging

### Enable WebView Debugging

```kotlin
if (BuildConfig.DEBUG) {
    WebView.setWebContentsDebuggingEnabled(true)
}
```

Then open Chrome DevTools:
1. Open `chrome://inspect` in Chrome desktop
2. Find your device and WebView
3. Click "Inspect"
4. Check Console for errors

### Common Issues

**Issue**: File picker doesn't open at all
- **Cause**: `onShowFileChooser` not implemented
- **Fix**: Add custom `WebChromeClient` as shown above

**Issue**: Permission denied errors
- **Cause**: Missing runtime permissions
- **Fix**: Request `READ_EXTERNAL_STORAGE`/`READ_MEDIA_IMAGES` and `CAMERA` permissions

**Issue**: Camera option doesn't appear
- **Cause**: Camera intent not added to chooser
- **Fix**: Add camera intent to chooser as shown in Step 3

**Issue**: `filePathCallback` is null in `onActivityResult`
- **Cause**: Activity recreated (screen rotation, etc.)
- **Fix**: Save callback in `onSaveInstanceState` and restore in `onCreate`

## Security Considerations

1. **File Provider**: Use FileProvider instead of file:// URIs (required for Android 7.0+)
2. **Permissions**: Request only necessary permissions
3. **File Size**: Consider adding file size validation on Android side
4. **File Type**: Validate file MIME type before upload

## Production Checklist

- [ ] File upload works in WebView
- [ ] Camera and gallery both work
- [ ] Permissions properly requested
- [ ] FileProvider configured
- [ ] File size limits enforced
- [ ] Error handling implemented
- [ ] Testing on multiple Android versions (API 21-34)

## Alternative: JavaScript Bridge

If modifying WebChromeClient is not possible, you can implement a custom bridge:

```kotlin
webView.addJavascriptInterface(object {
    @JavascriptInterface
    fun selectImage() {
        runOnUiThread {
            // Open native file picker
            // Return result via evaluateJavascript
        }
    }
}, "AndroidFileUpload")
```

However, this requires modifying the web code and is not recommended.

## Contact

For implementation assistance, share this document with the Khidmaty Android development team.

---

**Last Updated**: 2025-12-02
