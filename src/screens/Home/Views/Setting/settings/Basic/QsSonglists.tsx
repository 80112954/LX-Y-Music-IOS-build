import { memo, useCallback } from 'react'
import { View, TextInput } from 'react-native'
import Button from '@/components/common/Button'
import Text from '@/components/common/Text'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import commonState from '@/store/common/state'
import { navigations } from '@/navigation'
import { useTheme } from '@/store/theme/hook'
import { createStyle, toast } from '@/utils/tools'
import type { ListInfoItem } from '@/store/songlist/state'

// 汽水音乐没有可登录的网页版，无法像网易/QQ/酷狗一样绑定 Cookie。
// 该卡片提供“歌单收藏夹”：集中保存汽水歌单分享链接（每行一条），
// 逐个打开歌单详情页，由用户收藏到「我的列表」，达到接近绑定的效果。

const parseLines = (raw: string) =>
  String(raw ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

export default memo(() => {
  const theme = useTheme()
  const lists = useSettingValue('common.qs_songlists')
  const cursor = Number(useSettingValue('common.qs_songlists_cursor') ?? 0)

  const handleChanged = (text: string) => {
    updateSetting({ 'common.qs_songlists': text })
  }

  const openAt = useCallback(
    (index: number) => {
      const lines = parseLines(lists)
      const id = lines[index]
      if (!id) {
        toast('清单里的歌单都已打开过，点「重置进度」可重新开始', 'long')
        return
      }
      const componentId = commonState.componentIds[commonState.componentIds.length - 1]?.id
      if (!componentId) {
        toast('未找到主界面容器，请回到首页后重试', 'long')
        return
      }
      const info: ListInfoItem = {
        play_count: undefined,
        id,
        author: '',
        name: '',
        img: undefined,
        desc: undefined,
        source: 'qs',
      }
      navigations.pushSonglistDetailScreen(componentId, info)
      updateSetting({ 'common.qs_songlists_cursor': index + 1 })
      toast(`已打开第 ${index + 1}/${lines.length} 个歌单，收藏后返回再点继续`, 'long')
    },
    [lists]
  )

  const handleOpenNext = useCallback(() => {
    openAt(Number(cursor ?? 0))
  }, [cursor, openAt])

  const handleReset = useCallback(() => {
    updateSetting({ 'common.qs_songlists_cursor': 0 })
    toast('导入进度已重置', 'short')
  }, [])

  const lines = parseLines(lists)
  const doneCount = Math.min(Number(cursor ?? 0), lines.length)

  return (
    <View style={styles.content}>
      <Text style={styles.label}>汽水音乐歌单收藏夹</Text>
      <Text style={styles.tip}>
        汽水音乐没有网页版登录，无法绑定 Cookie。把汽水 App 里分享出来的歌单链接粘贴到下面（每行一条），然后点「打开下一个歌单」，在详情页收藏进「我的列表」后返回继续。
      </Text>
      <TextInput
        style={{
          ...styles.input,
          color: theme['c-font'],
          borderColor: theme['c-primary-dark-100-alpha-600'],
        }}
        multiline
        value={lists}
        onChangeText={handleChanged}
        placeholder={
          'https://qishui.douyin.com/s/xxxx\nhttps://music.douyin.com/qishui/share/playlist?playlist_id=123456\n或直接粘贴纯数字歌单 ID'
        }
        placeholderTextColor={theme['c-primary-dark-100-alpha-600']}
        selectionColor={theme['c-primary-light-100-alpha-300']}
      />
      <Text style={styles.stat}>
        共 {lines.length} 条 · 已打开 {doneCount} 条
      </Text>
      <View style={styles.btns}>
        <Button style={{ ...styles.btn, marginRight: 10 }} onPress={handleOpenNext}>
          <Text>打开下一个歌单</Text>
        </Button>
        <Button style={styles.btn} onPress={handleReset}>
          <Text>重置进度</Text>
        </Button>
      </View>
    </View>
  )
})

const styles = createStyle({
  content: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  tip: {
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 8,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 13,
    textAlignVertical: 'top',
  },
  stat: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.8,
  },
  btns: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 4,
  },
})
