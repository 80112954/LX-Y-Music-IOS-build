import { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Content from './Content'
import QishuiHome from './QishuiHome'
import PlayerBar from '@/components/player/PlayerBar'
import commonState from '@/store/common/state'
import { setNavActiveId } from '@/core/common'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import type { NAV_ID_Type } from '@/config/constant'

export default ({ componentId }: { componentId: string }) => {
  // 汽水式布局：三 Tab 外壳为默认主界面；点卡片后进入完整功能页，
  // 功能页右下角悬浮「返回主页」按钮可随时回到外壳。
  // 底层 Content（DrawerLayout + Header + Main/PagerView + 音源/歌单/设置）
  // 完全保留，所有原有功能与数据都不受影响。
  const [showShell, setShowShell] = useState(true)
  const theme = useTheme()

  const handleOpenFeature = (navId?: NAV_ID_Type) => {
    if (navId) setNavActiveId(navId)
    setShowShell(false)
  }

  return (
    <View style={styles.root}>
      {showShell ? (
        <QishuiHome onOpenFeature={handleOpenFeature} />
      ) : (
        <>
          <Content />
          <PlayerBar componentId={commonState.componentIds[commonState.componentIds.length - 1]?.id!} isHome />
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme['c-primary'] }]}
            onPress={() => setShowShell(true)}
            activeOpacity={0.85}
          >
            <Icon name="chevron-left" color={theme.isDark ? '#04120C' : '#FFFFFF'} size={17} />
            <Text size={12} color={theme.isDark ? '#04120C' : '#FFFFFF'} style={styles.backText}>主页</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: {
    position: 'absolute',
    right: 12,
    bottom: 96,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 999,
  },
  backText: { marginLeft: 2, fontWeight: '600' },
})
