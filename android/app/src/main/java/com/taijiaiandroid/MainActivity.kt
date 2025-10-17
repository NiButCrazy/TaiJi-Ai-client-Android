package com.taijiaiandroid


import android.os.Build
import android.view.WindowManager
import android.view.Display
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "TaiJiAiAndroid"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
	override fun onResume() {
		super.onResume()


        // 读取设备支持的最高刷新率
        val maxRefreshRate = getMaxSupportedRefreshRate()

        // 设置首选刷新率为最高值
        val params: WindowManager.LayoutParams = window.attributes
        params.preferredRefreshRate = maxRefreshRate
        window.attributes = params

	}

	private fun getMaxSupportedRefreshRate(): Float {
		val display: Display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
			display ?: return 60f  // Android 11+ 从 Activity 获取 Display
		} else {
			@Suppress("DEPRECATION")
			windowManager.defaultDisplay
		}

		val modes = display.supportedModes
		if (modes.isNullOrEmpty()) return display.refreshRate

		// 找出最高的 refreshRate
		var highestRate = display.refreshRate
		for (mode in modes) {
			if (mode.refreshRate > highestRate) {
				highestRate = mode.refreshRate
			}
		}
		return highestRate
	}
}
