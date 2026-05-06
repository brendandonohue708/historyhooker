import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { palette, type, space, radius, rarityColors } from '@/theme';
import { useAppStore, seedSwag } from '@/state/store';
import { CoinPill } from '@/components/CoinPill';
import type { SwagItem } from '@/data/types';
import { useHasMounted } from '@/lib/useHasMounted';

const TABS: SwagItem['type'][] = ['badge', 'frame', 'title'];

export default function ShopScreen() {
  const mounted = useHasMounted();
  if (!mounted) {
    return <View style={{ flex: 1, backgroundColor: palette.bg }} />;
  }
  return <ShopScreenInner />;
}

function ShopScreenInner() {
  const profile = useAppStore((s) => s.profile);
  const purchaseSwag = useAppStore((s) => s.purchaseSwag);
  const equipSwag = useAppStore((s) => s.equipSwag);
  const [tab, setTab] = useState<SwagItem['type']>('badge');
  const [flash, setFlash] = useState<{ id: string; kind: 'bought' | 'equipped' } | null>(null);

  const items = useMemo(() => seedSwag.filter((s) => s.type === tab), [tab]);
  const owned = new Set(profile.unlockedSwag);
  const equippedId =
    tab === 'badge' ? profile.equippedBadge : tab === 'frame' ? profile.equippedFrame : profile.equippedTitle;

  const tryBuy = (item: SwagItem) => {
    if (item.setUnlockId) return; // legendary set-gated
    if (owned.has(item.id)) return;
    const ok = purchaseSwag(item.id, item.cost);
    if (ok) setFlash({ id: item.id, kind: 'bought' });
    setTimeout(() => setFlash(null), 1100);
  };
  const equip = (item: SwagItem) => {
    if (!owned.has(item.id)) return;
    equipSwag(item.id, item.type);
    setFlash({ id: item.id, kind: 'equipped' });
    setTimeout(() => setFlash(null), 800);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>← back</Text>
        </Pressable>
        <CoinPill amount={profile.coins} label="coins" />
      </View>

      <Text style={styles.title}>Swag Shop</Text>
      <Text style={styles.kicker}>spend coins. wear them. flex.</Text>

      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
              {t === 'badge' ? 'Badges' : t === 'frame' ? 'Frames' : 'Titles'}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.grid}>
        {items.map((item) => {
          const ownedNow = owned.has(item.id);
          const equipped = equippedId === item.id;
          const setGated = !!item.setUnlockId && !ownedNow;
          const cantAfford = !ownedNow && !setGated && profile.coins < item.cost;
          const flashOn = flash?.id === item.id;

          return (
            <View
              key={item.id}
              style={[
                styles.card,
                equipped && { borderColor: palette.coin },
                flashOn && flash?.kind === 'bought' && styles.cardFlashBought,
                flashOn && flash?.kind === 'equipped' && styles.cardFlashEquipped,
              ]}
            >
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.rarityPill,
                    { borderColor: rarityColors[item.rarity] },
                  ]}
                >
                  <Text style={[styles.rarityText, { color: rarityColors[item.rarity] }]}>
                    {item.rarity}
                  </Text>
                </View>
                {equipped && <Text style={styles.equippedTag}>EQUIPPED</Text>}
              </View>

              <View style={styles.preview}>
                {item.type === 'title' ? (
                  <Text style={styles.previewTitle}>{item.previewAsset}</Text>
                ) : (
                  <Text style={styles.previewGlyph}>{item.previewAsset}</Text>
                )}
              </View>

              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDesc}>{item.description}</Text>

              {!ownedNow ? (
                setGated ? (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockBadgeText}>
                      Complete a set to earn
                    </Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => tryBuy(item)}
                    disabled={cantAfford}
                    style={({ pressed }) => [
                      styles.buyBtn,
                      cantAfford && { opacity: 0.4 },
                      pressed && !cantAfford && { opacity: 0.7 },
                    ]}
                  >
                    <View style={styles.coin} />
                    <Text style={styles.buyBtnText}>{item.cost}</Text>
                  </Pressable>
                )
              ) : equipped ? (
                <View style={styles.equippedBtn}>
                  <Text style={styles.equippedBtnText}>equipped</Text>
                </View>
              ) : (
                <Pressable
                  onPress={() => equip(item)}
                  style={({ pressed }) => [
                    styles.equipBtn,
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <Text style={styles.equipBtnText}>equip</Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  content: { paddingTop: 56, paddingBottom: space.xxxl, gap: space.lg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
  },
  back: { ...type.label, color: palette.textMuted, textTransform: 'lowercase' },
  title: {
    ...type.title,
    color: palette.text,
    fontSize: 28,
    paddingHorizontal: space.lg,
  },
  kicker: {
    ...type.body,
    color: palette.textMuted,
    paddingHorizontal: space.lg,
    fontStyle: 'italic',
  },
  tabs: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginTop: space.sm,
  },
  tab: {
    paddingVertical: space.sm,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.bgElevated,
  },
  tabActive: { borderColor: palette.text, backgroundColor: palette.bgCard },
  tabLabel: { ...type.label, color: palette.textMuted },
  tabLabelActive: { color: palette.text },
  grid: {
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.md,
  },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: palette.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: space.md,
    gap: space.sm,
  },
  cardFlashBought: {
    borderColor: palette.coin,
    backgroundColor: 'rgba(245,199,106,0.08)',
  },
  cardFlashEquipped: {
    borderColor: palette.success,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rarityPill: {
    paddingHorizontal: space.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  rarityText: { ...type.labelSm, fontSize: 9 },
  equippedTag: { ...type.labelSm, fontSize: 9, color: palette.coin, letterSpacing: 1.5 },
  preview: {
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewGlyph: {
    fontSize: 40,
    color: palette.text,
  },
  previewTitle: {
    ...type.clue,
    fontSize: 18,
    color: palette.text,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  itemName: { ...type.label, color: palette.text, fontSize: 13, textTransform: 'none' },
  itemDesc: {
    ...type.bodySm,
    color: palette.textMuted,
    minHeight: 36,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: space.sm,
    backgroundColor: palette.bg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.coin,
  },
  buyBtnText: { ...type.label, color: palette.coin, fontVariant: ['tabular-nums'] },
  coin: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.coin },
  equippedBtn: {
    paddingVertical: space.sm,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
  },
  equippedBtnText: { ...type.label, color: palette.textMuted, fontSize: 11 },
  equipBtn: {
    paddingVertical: space.sm,
    backgroundColor: palette.text,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  equipBtnText: { ...type.label, color: palette.bg, fontSize: 11 },
  lockBadge: {
    paddingVertical: space.sm,
    backgroundColor: palette.bgElevated,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  lockBadgeText: { ...type.labelSm, color: palette.textMuted, fontSize: 10, textTransform: 'none' },
});
