/**
 * 嘻嘻嘻根本不懂安卓开发捏
 *
 * @format
 */

import {
  StatusBar,
  useColorScheme,
  View,
  BackHandler,
  Keyboard,
  Animated
} from 'react-native'
import { WebView } from 'react-native-webview'
import {
  SafeAreaProvider,
  SafeAreaView
} from 'react-native-safe-area-context'
import { useEffect, useRef, useState } from 'react'
import { notice, webviewScripts } from './assets'


let firstStart = true

function App() {
  const isDarkMode = useColorScheme() === 'dark'
  const bgColor = isDarkMode ? (!firstStart ? '#1A2335' : '#1D273B') : '#F1F5F9'
  const headerColor = isDarkMode ? '#1D273B' : '#FFF'
  const [ isGetHeader, setIsGetHeader ] = useState(false)
  const [ isSplashVisible, setSplashVisible ] = useState(true)
  const fadeAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // 模拟数据加载完成的时间
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400, // 淡出时长（毫秒）
        useNativeDriver: true,
      }).start(() => setSplashVisible(false))
    }, 100) // 这里 1000ms 只是示例，在数据加载完成后触发
  }, [])

  return (
    <>
      <SafeAreaProvider>
        <StatusBar barStyle={ isDarkMode ? 'light-content' : 'dark-content' } />
        <SafeAreaView style={ { flex: 1, backgroundColor: isGetHeader ? headerColor : bgColor } }>
          <AppContent bgColor={ bgColor } setIsGetHeader={ setIsGetHeader } />
        </SafeAreaView>
      </SafeAreaProvider>
      { isSplashVisible && (<Animated.View
        style={ { position: 'absolute', height: '100%', width: '100%', zIndex: 999, opacity: fadeAnim } }>
        <View style={ { flex: 1, backgroundColor: '#E95555' } } />
      </Animated.View>) }
    </>
  )
}

function AppContent({ bgColor = '#FFFFFF', setIsGetHeader }: {
  bgColor?: string,
  setIsGetHeader: React.Dispatch<React.SetStateAction<boolean>>
}) {
  // const safeAreaInsets = useSafeAreaInsets()
  const [ bottom, setBottom ] = useState(0)
  const webViewRef = useRef<WebView>(null)
  const [ inputFocus, setInputFocus ] = useState(false)
  const inputFocusRef = useRef(false)

  inputFocusRef.current = inputFocus
  // const translateY = useRef(new Animated.Value(0)).current

  const onAndroidBackPress = () => {
    webViewRef.current?.goBack()
    return true
  }

  useEffect(() => {

    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      // console.log('[太极Ai] 键盘弹起')
      if (inputFocusRef.current) {
        StatusBar.setHidden(true)
      }
      setBottom(e.endCoordinates.height - 52)
      webViewRef.current?.injectJavaScript(`document.body.classList.add('hide-menu')`)

      // Animated.timing(translateY, {
      //   toValue: -(e.endCoordinates.height - 52), // 上移
      //   duration: 200,
      //   useNativeDriver: true, // ✅ 原生驱动
      // }).start()
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      // console.log('[太极Ai] 键盘收起')
      // StatusBar.setHidden(false)
      setBottom(0) // 关键：收起直接设 0，不保留 38
      StatusBar.setHidden(false)
      webViewRef.current?.injectJavaScript(`document.body.classList.remove('hide-menu')`)
      // Animated.timing(translateY, {
      //   toValue: 0,  // 回到原位
      //   duration: 100,
      //   useNativeDriver: true, // ✅ 原生驱动
      // }).start()
    })
    const listener = BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)
    return () => {
      listener.remove()
      showSub.remove()
      hideSub.remove()
    }

  }, [])

  function webviewMassages(event: any) {
    const text = event.nativeEvent.data
    console.log('[太极Ai] 接收到消息：', text)
    switch (text) {
      case '找到全局头部':
        setIsGetHeader(true)
        // 永久不主动弹出公告板
        webViewRef.current?.injectJavaScript(notice)
        firstStart = false
        break
      case '输入框聚焦':
        setInputFocus(true)
        break
      case '输入框失焦':
        setInputFocus(false)
        break
      case '状态栏颜色青':
        setIsGetHeader(false)
        break
      case '状态栏颜色白':
        setIsGetHeader(true)
        break
    }
  }

  return (
    // 两套样式，用于适配不同input聚焦场景
    <View
      style={ inputFocus ? {
        flex: 1,
        backgroundColor: bgColor,
        bottom
      } : {
        flex: 1,
        backgroundColor: bgColor,
        paddingBottom: bottom
      } }>
      <WebView overScrollMode={ 'never' } mixedContentMode={ 'always' } ref={ webViewRef }
               style={ { backgroundColor: bgColor } }
               injectedJavaScript={ webviewScripts }
               injectedJavaScriptForMainFrameOnly={ true }
               source={ { uri: 'https://www.aiboss.chat/chat' } }
               onMessage={ webviewMassages }
      />

    </View>

  )
}

export default App
