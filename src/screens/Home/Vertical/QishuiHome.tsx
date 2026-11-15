import { memo, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useWindowSize } from '@/utils/hooks'
import { useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { usePlayerMusicInfo, useIsPlay } from '@/store/player/hook'
import { togglePlay, playNext, playPrev } from '@/core/player/player'
import { navigations } from '@/navigation'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import commonState from '@/store/common/state'
import type { NAV_ID_Type } from '@/config/constant'

const GREEN = '#00F096'
const CARD = 'rgba(255, 255, 255, 0.07)'
const CARD_BORDER = 'rgba(255, 255, 255, 0.10)'

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

const QishuiHome = memo(({ onOpenFeature }: { onOpenFeature: (navId?: NAV_ID_Type) => void }) => {
  const [tab, setTab] = useState<TabKey>('music')
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  const { width } = useWindowSize()
  const musicInfo = usePlayerMusicInfo() as unknown as {
    name?: string; singer?: string; pic?: string | null; id?: string
  }
  const isPlay = useIsPlay()

  const coverSize = Math.min(width * 0.68, 320)
  const labelColor = theme['c-font-label']

  const openDetail = () => {
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds[commonState.componentIds.length - 1]?.id!)
  }

  const renderMusic = () => (
    <ScrollView contentContainerStyle={styles.musicContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity activeOpacity={0.9} onPress={openDetail} style={styles.coverWrap}>
        <Image url={musicInfo.pic ?? undefined} style={{ width: coverSize, height: coverSize, borderRadius: 20 }} />
        <View style={styles.coverGlow} pointerEvents="none" />
      </TouchableOpacity>
      <Text size={20} color={theme['c-font']} numberOfLines={1} style={styles.songName}>
        {musicInfo.name || '还没有播放歌曲'}
      </Text>
      <Text size={13} color={labelColor} numberOfLines={1} style={styles.songSinger}>
        {musicInfo.singer || '去「发现」找一首歌吧'}
      </Text>

      <View style={styles.controlRow}>
        <TouchableOpacity style={styles.ctrlSide} onPress={() => void playPrev()} activeOpacity={0.7}>
          <Icon name="prevMusic" color={theme['c-font']} size={26} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlMain} onPress={() => togglePlay()} activeOpacity={0.8}>
          <Icon name={isPlay ? 'pause' : 'play'} color="#04120C" size={30} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.ctrlSide} onPress={() => void playNext()} activeOpacity={0.7}>
          <Icon name="nextMusic" color={theme['c-font']} size={26} />
        </TouchableOpacity>
      </View>

      <Text size={12} color={labelColor} style={styles.hint}>上下滑动切歌 · 点击封面进入全屏播放页</Text>

      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickCard} onPress={() => onOpenFeature('nav_love')} activeOpacity={0.75}>
          <Icon name="love" color={GREEN} size={20} />
          <Text size={14} color={theme['c-font']} style={styles.quickText}>我喜欢的</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => onOpenFeature('nav_top')} activeOpacity={0.75}>
          <Icon name="leaderboard" color={GREEN} size={20} />
          <Text size={14} color={theme['c-font']} style={styles.quickText}>热歌榜</Text>
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

      <Text size={17} color={theme['c-font']} style={styles.sectionTitle}>发现音乐</Text>
      <View style={styles.grid}>
        {DISCOVER_CARDS.map(item => (
          <TouchableOpacity key={item.title} style={styles.gridCard} onPress={() => onOpenFeature(item.nav)} activeOpacity={0.75}>
            <View style={styles.gridIcon}><Icon name={item.icon} color={GREEN} size={24} /></View>
            <Text size={15} color={theme['c-font']} numberOfLines={1} style={styles.gridTitle}>{item.title}</Text>
            <Text size={11} color={labelColor} numberOfLines={1} style={styles.gridSub}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipCard}>
        <Icon name="menu" color={GREEN} size={18} />
        <Text size={12} color={labelColor} style={styles.tipText}>
          汽水音乐歌单：进入「歌单广场」后把来源切到「汽水音乐」，用「打开歌单」粘贴分享链接或 ID 即可。
        </Text>
      </View>
    </ScrollView>
  )

  const renderMine = () => (
    <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}><Icon name="love" color="#04120C" size={28} /></View>
        <View style={styles.profileText}>
          <Text size={19} color={theme['c-font']}>我的音乐</Text>
          <Text size={12} color={labelColor} style={styles.profileSub}>收藏 · 下载 · 最近播放</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        {MINE_ITEMS.map((item, index) => (
          <TouchableOpacity key={item.title} style={[styles.listItem, index === MINE_ITEMS.length - 1 && styles.listItemLast]} onPress={() => onOpenFeature(item.nav)} activeOpacity={0.7}>
            <View style={styles.listIcon}><Icon name={item.icon} color={GREEN} size={20} /></View>
            <View style={styles.listText}>
              <Text size={15} color={theme['c-font']}>{item.title}</Text>
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
        <Text size={17} color={theme['c-font']} style={styles.topTitle}>
          {tab === 'music' ? '音乐' : tab === 'discover' ? '发现' : '我的'}
        </Text>
        <TouchableOpacity style={styles.topSearch} onPress={() => onOpenFeature('nav_search')} activeOpacity={0.7}>
          <Icon name="search-2" color={theme['c-font']} size={20} />
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
              <Icon name={item.icon} color={active ? GREEN : labelColor} size={22} />
              <Text size={11} color={active ? GREEN : labelColor} style={styles.tabLabel}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
})

export default QishuiHome

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060807' },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: { fontWeight: '700', letterSpacing: 1 },
  topSearch: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },

  musicContent: { flexGrow: 1, alignItems: 'center', paddingTop: 24, paddingBottom: 28, paddingHorizontal: 20 },
  coverWrap: { position: 'relative', borderRadius: 20 },
  coverGlow: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%',
    backgroundColor: 'rgba(0, 240, 150, 0.06)', borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  songName: { marginTop: 26, fontWeight: '700', textAlign: 'center', maxWidth: '92%' },
  songSinger: { marginTop: 8, textAlign: 'center', maxWidth: '92%' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 28 },
  ctrlSide: {
    width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD, borderWidth: StyleSheet.hairlineWidth, borderColor: CARD_BORDER, marginHorizontal: 18,
  },
  ctrlMain: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  hint: { marginTop: 26, textAlign: 'center' },
  quickRow: { flexDirection: 'row', marginTop: 30, width: '100%' },
  quickCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, marginHorizontal: 6, borderRadius: 16,
    backgroundColor: CARD, borderWidth: StyleSheet.hairlineWidth, borderColor: CARD_BORDER,
  },
  quickText: { marginLeft: 10 },

  pageContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 44,
    borderRadius: 22, backgroundColor: CARD, borderWidth: StyleSheet.hairlineWidth, borderColor: CARD_BORDER,
  },
  searchPlaceholder: { marginLeft: 10 },
  sectionTitle: { marginTop: 28, marginBottom: 14, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    width: '47%', padding: 16, marginBottom: 14, borderRadius: 18,
    backgroundColor: CARD, borderWidth: StyleSheet.hairlineWidth, borderColor: CARD_BORDER,
  },
  gridIcon: {
    width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0, 240, 150, 0.12)', marginBottom: 14,
  },
  gridTitle: { fontWeight: '600' },
  gridSub: { marginTop: 5 },
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 150, 0.08)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0, 240, 150, 0.20)',
  },
  tipText: { flex: 1, marginLeft: 10, lineHeight: 18 },

  profileCard: {
    flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20,
    backgroundColor: CARD, borderWidth: StyleSheet.hairlineWidth, borderColor: CARD_BORDER,
  },
  avatar: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  profileText: { marginLeft: 16, flex: 1 },
  profileSub: { marginTop: 6 },
  listCard: { marginTop: 22, borderRadius: 18, backgroundColor: CARD, borderWidth: StyleSheet.hairlineWidth, borderColor: CARD_BORDER, overflow: 'hidden' },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: CARD_BORDER },
  listItemLast: { borderBottomWidth: 0 },
  listIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 240, 150, 0.12)' },
  listText: { flex: 1, marginLeft: 14 },
  listSub: { marginTop: 4 },
  mineTip: { marginTop: 20, textAlign: 'center', lineHeight: 18 },

  tabBar: {
    flexDirection: 'row', paddingTop: 8, paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: CARD_BORDER, backgroundColor: 'rgba(6, 8, 7, 0.98)',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { marginTop: 4 },
})
