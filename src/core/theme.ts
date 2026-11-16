import themeActions from '@/store/theme/action'
import { getTheme } from '@/theme/themes'
import { updateSetting } from './common'
import themeState from '@/store/theme/state'

export const setShouldUseDarkColors = (shouldUseDarkColors: boolean) => {
  themeActions.setShouldUseDarkColors(shouldUseDarkColors)
}

export const applyTheme = (theme: LX.Theme) => {
  themeActions.setTheme(theme)
}

export const setTheme = (id: string) => {
  // 用户在主题列表主动选主题 = 明确要用这个固定主题，退出「跟随系统」，
  // 否则 getTheme() 会按系统深浅使用 lightId/darkId，导致手动选择不生效。
  // 想恢复跟随系统，可到 设置 → 主题 → 外观模式 里重新选「跟随系统」。
  updateSetting({
    'theme.id': id,
    'common.isAutoTheme': false,
    'common.isDarkMode': false,
  })
  void getTheme().then((theme) => {
    if (theme.id == themeState.theme.id) return
    applyTheme(theme)
  })
}
