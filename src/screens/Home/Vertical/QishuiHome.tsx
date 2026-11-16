import { memo, useMemo, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useWindowSize } from '@/utils/hooks'
import { useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { usePlayerMusicInfo, useIsPlay, useProgress } from '@/store/player/hook'
import { togglePlay, playNext, playPrev } from '@/core/player/player'
import { navigations } from '@/navigation'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import commonState from '@/store/common/state'
import type { NAV_ID_Type } from '@/config/constant'

type TabKey = 'music' | 'discover' | 'mine'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'music', label: '音乐', icon: 'play-outline' },
  { key: 'discover', label: '发现', icon: 'album' },
  { key: 'mine', label: '我的', icon: 'love' },
]

const DISCOVER_CARDS: { title: string; sub: string; icon: string; nav: NAV_ID_Type }[] = [
  { title: '搜索歌曲', sub: '歌名 / 歌手 / 专辑', icon: 'search-2', nav: 'nav_search' },
  { title: '歌单广场', sub: '精选歌单 · 打开歌单', icon: 'album', nav: 'nav_songlist' },
  { title: '排行榜', sub: '热歌榜 · 新歌榜', icon: 'leaderboard', nav: 'nav_top' },
  { title: '汽水歌单', sub: '按链接 / ID 打开', icon: 'love', nav: 'nav_songlist' },
]

const MINE_ITEMS: { title: string; sub: string; icon: string; nav: NAV_ID_Type }[] = [
  { title: '我的列表', sub: '我喜欢的音乐与收藏歌单', icon: 'love', nav: 'nav_love' },
  { title: '本地与下载', sub: '已下载歌曲 / 本地文件', icon: 'download-2', nav: 'nav_local_download' },
  { title: '播放历史', sub: '最近听过的歌', icon: 'music_time', nav: 'nav_play_history' },
  { title: '设置', sub: '音源管理 · 主题 · 蓝牙歌词', icon: 'setting', nav: 'nav_setting' },
]

// 主页配色完全由当前主题派生：跟随系统深色 -> 纯黑 + 荧光绿（汽水），
// 跟随系统浅色 / 手动浅色 -> 白卡片 + 深绿（汽水·浅色）。
// 不再写死任何颜色，主题切换时 useTheme() 触发重渲染即整体换肤。
const buildColors = (theme: LX.ActiveTheme) => {
  const dark = theme.isDark
  return {
    dark,
    bg: dark ? '#060807' : '#F4F7F5',
    topBarBg: dark ? 'rgba(6, 8, 7, 0.96)' : 'rgba(255, 255, 255, 0.92)',
    tabBarBg: dark ? 'rgba(6, 8, 7, 0.98)' : 'rgba(255, 255, 255, 0.96)',
    card: dark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 255, 255, 1)',
    cardBorder: dark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)',
    divider: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    accent: theme['c-primary'],
    accentSoft: theme['c-primary-alpha-900'],
    accentSoft2: theme['c-primary-alpha-800'],
    onAccent: dark ? '#04120C' : '#FFFFFF',
    font: theme['c-font'],
    label: theme['c-font-label'],
    shadow: dark ? '#000000' : '#123A2B',
    shadowOpacity: dark ? 0.4 : 0.1,
    coverGlow: theme['c-primary-alpha-900'],
    track: dark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.10)',
  }
}
type Colors = ReturnType<typeof buildColors>

const buildStyles = (C: Colors) => StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.topBarBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.divider,
  },
  topTitle: { fontWeight: '700', letterSpacing: 1 },
  topSearch: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },

  musicContent: { flexGrow: 1, alignItems: 'center', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
  coverWrap: {
    position: 'relative', borderRadius: 22,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: C.shadowOpacity, shadowRadius: 22, elevation: 10,
  },
  coverImg: { borderRadius: 22 },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
  coverGlow: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%',
    backgroundColor: C.coverGlow, borderBottomLeftRadius: 22, borderBottomRightRadius: 22,
  },
  songName: { marginTop: 28, fontWeight: '700', textAlign: 'center', maxWidth: '92%' },
  songSinger: { marginTop: 8, textAlign: 'center', maxWidth: '92%' },

  progressWrap: { width: '84%', marginTop: 30, alignSelf: 'center' },
  progressTrack: { height: 3, borderRadius: 2, backgroundColor: C.track, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 2, backgroundColor: C.accent },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },

  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 22 },
  ctrlSide: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card, borderWidth: StyleSheet.hairlineWidth, borderColor: C.cardBorder, marginHorizontal: 18,
  },
  ctrlMain: {
    width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.accent,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: C.dark ? 0.35 : 0.28, shadowRadius: 14, elevation: 8,
  },
  hint: { marginTop: 24, textAlign: 'center' },
  quickRow: { flexDirection: 'row', marginTop: 28, width: '100%' },
  quickCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, marginHorizontal: 6, borderRadius: 16,
    backgroundColor: C.card, borderWidth: StyleSheet.hairlineWidth, borderColor: C.cardBorder,
  },
  quickText: { marginLeft: 10 },

  pageContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 28 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 46,
    borderRadius: 23, backgroundColor: C.card, borderWidth: StyleSheet.hairlineWidth, borderColor: C.cardBorder,
  },
  searchPlaceholder: { marginLeft: 10 },
  sectionTitle: { marginTop: 28, marginBottom: 14, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    width: '47%', padding: 16, marginBottom: 14, borderRadius: 18,
    backgroundColor: C.card, borderWidth: StyleSheet.hairlineWidth, borderColor: C.cardBorder,
    shadowColor: C.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: C.shadowOpacity, shadowRadius: 10, elevation: C.dark ? 0 : 3,
  },
  gridIcon: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.accentSoft, marginBottom: 14,
  },
  gridTitle: { fontWeight: '600' },
  gridSub: { marginTop: 5 },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 14,
    backgroundColor: C.accentSoft, borderWidth: StyleSheet.hairlineWidth, borderColor: C.accentSoft2,
  },
  tipText: { flex: 1, marginLeft: 10, lineHeight: 18 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20,
    backgroundColor: C.card, borderWidth: StyleSheet.hairlineWidth, borderColor: C.cardBorder,
  },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accent },
  profileText: { marginLeft: 16, flex: 1 },
  profileSub: { marginTop: 6 },
  listCard: {
    marginTop: 22, borderRadius: 18, backgroundColor: C.card,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.cardBorder, overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.divider,
  },
  listItemLast: { borderBottomWidth: 0 },
  listIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: C.accentSoft },
  listText: { flex: 1, marginLeft: 14 },
  listSub: { marginTop: 4 },
  mineTip: { marginTop: 20, textAlign: 'center', lineHeight: 18 },

  tabBar: {
    flexDirection: 'row', paddingTop: 8, paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.divider, backgroundColor: C.tabBarBg,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIndicator: { width: 18, height: 3, borderRadius: 2, backgroundColor: C.accent, marginTop: 5 },
  tabIndicatorHidden: { opacity: 0 },
  tabLabel: { marginTop: 4 },
})

const QishuiHome = memo(({ onOpenFeature }: { onOpenFeature: (navId?: NAV_ID_Type) => void }) => {
  const [tab, setTab] = useState<TabKey>('music')
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const { width } = useWindowSize()
  const musicInfo = usePlayerMusicInfo() as unknown as {
    name?: string; singer?: string; pic?: string | null; id?: string
  }
  const isPlay = useIsPlay()
  const progress = useProgress()

  const C = useMemo(() => buildColors(theme), [theme])
  const styles = useMemo(() => buildStyles(C), [C])

  const coverSize = Math.min(width * 0.68, 320)
  const labelColor = C.label
  // 上游 state.progress.progress 有一处除以 currentTime 的笔误，这里直接用时间自算比例，避免进度条乱跳。
  const percent = progress.maxPlayTime > 0
    ? Math.min(100, Math.max(0, (progress.nowPlayTime / progress.maxPlayTime) * 100))
    : 0

  const openDetail = () => {
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds[commonState.componentIds.length - 1]?.id!)
  }

  const renderMusic = () => (
    <ScrollView contentContainerStyle={styles.musicContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.9} onPress={openDetail} style={styles.coverWrap}>
        {musicInfo.pic ? (
          <Image url={musicInfo.pic} style={[styles.coverImg, { width: coverSize, height: coverSize }]} />
        ) : (
          <View style={[styles.coverPlaceholder, { width: coverSize, height: coverSize, backgroundColor: C.accentSoft }]}>
            <Icon name="album" color={C.accent} size={76} />
          </View>
        )}
        <View style={styles.coverGlow} pointerEvents="none" />
      </TouchableOpacity>
      <Text size={20} color={C.font} numberOfLines={1} style={styles.songName}>
        {musicInfo.name || '还没有播放歌曲'}
      </Text>
      <Text size={13} color={labelColor} numberOfLines={1} style={styles.songSinger}>
        {musicInfo.singer || '去「发现」找一首歌吧'}
      </Text>

      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text size={11} color={labelColor}>{progress.nowPlayTimeStr}</Text>
          <Text size={11} color={labelColor}>{progress.maxPlayTimeStr}</Text>
        </View>
      </View>

      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.ctrlSide} onPress={() => void playPrev()} activeOpacity={0.7}>
          <Icon name="prevMusic" color={C.font} size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlMain} onPress={() => togglePlay()} activeOpacity={0.8}>
          <Icon name={isPlay ? 'pause' : 'play'} color={C.onAccent} size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlSide} onPress={() => void playNext()} activeOpacity={0.7}>
          <Icon name="nextMusic" color={C.font} size={26} />
        </TouchableOpacity>
      </View>

      <Text size={12} color={labelColor} style={styles.hint}>上下滑动切歌 · 点击封面进入全屏播放页</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard} onPress={() => onOpenFeature('nav_love')} activeOpacity={0.75}>
          <Icon name="love" color={C.accent} size={20} />
          <Text size={14} color={C.font} style={styles.quickText}>我喜欢的</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => onOpenFeature('nav_top')} activeOpacity={0.75}>
          <Icon name="leaderboard" color={C.accent} size={20} />
          <Text size={14} color={C.font} style={styles.quickText}>热歌榜</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )

  const renderDiscover = () => (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.searchBar} onPress={() => onOpenFeature('nav_search')} activeOpacity={0.7}>
        <Icon name="search-2" color={labelColor} size={18} />
        <Text size={14} color={labelColor} style={styles.searchPlaceholder}>搜索歌曲、歌手、歌单</Text>
      </TouchableOpacity>

      <Text size={17} color={C.font} style={styles.sectionTitle}>发现音乐</Text>
      <View style={styles.grid}>
        {DISCOVER_CARDS.map(item => (
          <TouchableOpacity key={item.title} style={styles.gridCard} onPress={() => onOpenFeature(item.nav)} activeOpacity={0.75}>
            <View style={styles.gridIcon}><Icon name={item.icon} color={C.accent} size={24} /></View>
            <Text size={15} color={C.font} numberOfLines={1} style={styles.gridTitle}>{item.title}</Text>
            <Text size={11} color={labelColor} numberOfLines={1} style={styles.gridSub}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipCard}>
        <Icon name="menu" color={C.accent} size={18} />
        <Text size={12} color={labelColor} style={styles.tipText}>
          汽水音乐歌单：进入「歌单广场」后把来源切到「汽水音乐」，用「打开歌单」粘贴分享链接或 ID 即可。
        </Text>
      </View>
    </ScrollView>
  )

  const renderMine = () => (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Icon name="love" color={C.onAccent} size={28} /></View>
        <View style={styles.profileText}>
          <Text size={19} color={C.font}>我的音乐</Text>
          <Text size={12} color={labelColor} style={styles.profileSub}>收藏 · 下载 · 最近播放</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        {MINE_ITEMS.map((item, index) => (
          <TouchableOpacity key={item.title} style={[styles.listItem, index === MINE_ITEMS.length - 1 && styles.listItemLast]} onPress={() => onOpenFeature(item.nav)} activeOpacity={0.7}>
            <View style={styles.listIcon}><Icon name={item.icon} color={C.accent} size={20} /></View>
            <View style={styles.listText}>
              <Text size={15} color={C.font}>{item.title}</Text>
              <Text size={11} color={labelColor} numberOfLines={1} style={styles.listSub}>{item.sub}</Text>
            </View>
            <Icon name="chevron-right" color={labelColor} size={16} />
          </TouchableOpacity>
        ))}
      </View>

      <Text size={11} color={labelColor} style={styles.mineTip}>
        需要更多页面？进入「设置 → 侧边栏导航」可随时恢复全部功能页。
      </Text>
    </ScrollView>
  )

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: statusBarHeight, height: 56 + statusBarHeight }]}>
        <Text size={17} color={C.font} style={styles.topTitle}>
          {tab === 'music' ? '音乐' : tab === 'discover' ? '发现' : '我的'}
        </Text>
        <TouchableOpacity style={styles.topSearch} onPress={() => onOpenFeature('nav_search')} activeOpacity={0.7}>
          <Icon name="search-2" color={C.font} size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {tab === 'music' ? renderMusic() : tab === 'discover' ? renderDiscover() : renderMine()}
      </View>

      <View style={styles.tabBar}>
        {TABS.map(item => {
          const active = tab === item.key
          return (
            <TouchableOpacity key={item.key} style={styles.tabItem} onPress={() => setTab(item.key)} activeOpacity={0.8}>
              <Icon name={item.icon} color={active ? C.accent : labelColor} size={22} />
              <Text size={11} color={active ? C.accent : labelColor} style={styles.tabLabel}>{item.label}</Text>
              <View style={[styles.tabIndicator, !active && styles.tabIndicatorHidden]} />
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
})

export default QishuiHome
