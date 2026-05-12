import React, { useState } from 'react';
import {
  FlatList, Pressable, StyleSheet, Text, TextInput, View, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';
import { Coupon } from '@/types';

/** UI-local mock coupons for design — will be replaced with real API */
const MOCK_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', title: 'Welcome Discount', description: 'Get 10% off your first order at any Tavia cafe', discount: '10%', expiresAt: '2026-06-01', isUsed: false },
  { id: '2', code: 'SUMMER25', title: 'Summer Special', description: '₺25 off on orders above ₺100', discount: '₺25', expiresAt: '2026-08-31', isUsed: false },
  { id: '3', code: 'LOYALTY15', title: 'Loyalty Reward', description: '15% off for Gold members and above', discount: '15%', expiresAt: '2026-07-15', isUsed: false },
  { id: '4', code: 'FREECOFFE', title: 'Free Coffee Friday', description: 'Get a free drip coffee every Friday', discount: 'Free', expiresAt: '2026-05-30', isUsed: true },
];

export default function CouponsScreen() {
  const { theme } = useThemeStore();
  const activeColors = Colors[theme];
  const [promoCode, setPromoCode] = useState('');
  const [coupons] = useState<Coupon[]>(MOCK_COUPONS);

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    Alert.alert('Promo Code', `Code "${promoCode.trim()}" submitted. This will be validated once the backend is ready.`);
    setPromoCode('');
  };

  const renderCoupon = ({ item }: { item: Coupon }) => (
    <View style={[styles.coupon, item.isUsed && styles.couponUsed]}>
      <View style={styles.couponLeft}>
        <View style={[styles.discountBadge, { backgroundColor: activeColors.tint }, item.isUsed && styles.discountBadgeUsed]}>
          <Text style={[styles.discountText, item.isUsed && styles.discountTextUsed]}>{item.discount}</Text>
        </View>
      </View>
      <View style={styles.couponRight}>
        <View style={styles.couponTop}>
          <Text style={[styles.couponTitle, { color: activeColors.text }, item.isUsed && styles.textUsed]}>{item.title}</Text>
          {item.isUsed && <View style={styles.usedBadge}><Text style={styles.usedText}>Used</Text></View>}
        </View>
        <Text style={[styles.couponDesc, item.isUsed && styles.textUsed]} numberOfLines={2}>{item.description}</Text>
        <View style={styles.couponFooter}>
          <Text style={[styles.couponCode, { color: activeColors.tint }]}>{item.code}</Text>
          <Text style={styles.couponExpiry}>Expires {item.expiresAt}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: activeColors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: activeColors.text }]}>Coupons</Text>
          <Text style={[styles.headerSub, { color: activeColors.text }]}>Redeem promo codes and browse deals</Text>
        </View>

        {/* Promo Code Input */}
        <View style={styles.promoSection}>
          <TextInput
            style={[styles.promoInput, { color: activeColors.text, borderColor: activeColors.border }]}
            placeholder="Enter promo code"
            placeholderTextColor={theme === 'dark' ? "rgba(255,255,255,0.25)" : "rgba(62,39,35,0.4)"}
            autoCapitalize="characters"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <Pressable style={({pressed}) => [styles.promoBtn, { backgroundColor: activeColors.tint }, pressed && styles.promoBtnP]} onPress={handleApplyPromo}>
            <Text style={styles.promoBtnText}>Apply</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: activeColors.text }]}>Active Deals</Text>
          <Text style={[styles.sectionCount, { color: activeColors.text }]}>{coupons.filter(c => !c.isUsed).length} available</Text>
        </View>

        <FlatList
          data={coupons}
          renderItem={renderCoupon}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{flex:1},safe:{flex:1},
  header:{paddingHorizontal:20,paddingTop:12,paddingBottom:4},headerTitle:{fontSize:28,fontWeight:'800'},headerSub:{fontSize:14,opacity:0.6,marginTop:4},
  promoSection:{flexDirection:'row',paddingHorizontal:16,paddingVertical:16,gap:10},
  promoInput:{flex:1,backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,paddingHorizontal:16,paddingVertical:12,fontSize:15,color:'#FFF',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',letterSpacing:1},
  promoBtn:{backgroundColor:'#6B9E78',borderRadius:12,paddingHorizontal:20,justifyContent:'center',shadowColor:'#6B9E78',shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:6},
  promoBtnP:{opacity:0.8},promoBtnText:{color:'#FFF',fontSize:14,fontWeight:'700'},
  divider:{height:1,backgroundColor:'rgba(255,255,255,0.06)',marginHorizontal:16},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:20,paddingTop:16,paddingBottom:12},sectionTitle:{fontSize:16,fontWeight:'700',color:'rgba(255,255,255,0.85)'},sectionCount:{fontSize:13,fontWeight:'600',color:'rgba(255,255,255,0.35)'},
  listContent:{paddingBottom:24},
  coupon:{flexDirection:'row',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:14,marginHorizontal:16,marginBottom:10,overflow:'hidden',borderWidth:1,borderColor:'rgba(255,255,255,0.06)'},
  couponUsed:{opacity:0.5},
  couponLeft:{width:72,backgroundColor:'rgba(107,158,120,0.1)',alignItems:'center',justifyContent:'center',paddingVertical:16},
  discountBadge:{backgroundColor:'#6B9E78',borderRadius:8,paddingHorizontal:8,paddingVertical:4},discountBadgeUsed:{backgroundColor:'rgba(255,255,255,0.15)'},
  discountText:{color:'#FFF',fontSize:14,fontWeight:'800'},discountTextUsed:{color:'rgba(255,255,255,0.5)'},
  couponRight:{flex:1,padding:14,justifyContent:'space-between'},
  couponTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  couponTitle:{fontSize:14,fontWeight:'700',color:'#FFF',flex:1},textUsed:{color:'rgba(255,255,255,0.4)'},
  usedBadge:{backgroundColor:'rgba(255,255,255,0.1)',borderRadius:4,paddingHorizontal:6,paddingVertical:2},usedText:{color:'rgba(255,255,255,0.4)',fontSize:10,fontWeight:'700'},
  couponDesc:{fontSize:12,color:'rgba(255,255,255,0.45)',marginTop:4,lineHeight:16},
  couponFooter:{flexDirection:'row',justifyContent:'space-between',marginTop:8},couponCode:{fontSize:11,fontWeight:'700',color:'#6B9E78',letterSpacing:0.5},couponExpiry:{fontSize:10,color:'rgba(255,255,255,0.25)'},
});
