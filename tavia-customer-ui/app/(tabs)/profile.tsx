import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, RefreshControl,
  StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import api from '@/lib/axios';
import { ApiResponse, CityDisplayLabels, City, LoyaltyLevel, TenantLoyaltyDto } from '@/types';

const LOYALTY_COLORS: Record<LoyaltyLevel, string> = {
  [LoyaltyLevel.BRONZE]: '#CD7F32',
  [LoyaltyLevel.SILVER]: '#C0C0C0',
  [LoyaltyLevel.GOLD]: '#FFD700',
  [LoyaltyLevel.PLATINUM]: '#E5E4E2',
};

const LOYALTY_ICONS: Record<LoyaltyLevel, string> = {
  [LoyaltyLevel.BRONZE]: '🥉',
  [LoyaltyLevel.SILVER]: '🥈',
  [LoyaltyLevel.GOLD]: '🥇',
  [LoyaltyLevel.PLATINUM]: '💎',
};

export default function ProfileScreen() {
  const { customer, logout } = useCustomerAuthStore();
  const [loyalties, setLoyalties] = useState<TenantLoyaltyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLoyalties = useCallback(async () => {
    if (!customer) return;
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<TenantLoyaltyDto[]>>(
        `/api/v1/crm/auth/loyalties/${customer.id}`
      );
      setLoyalties(res.data.data ?? []);
    } catch {
      setLoyalties([]);
    } finally {
      setIsLoading(false);
    }
  }, [customer]);

  useEffect(() => { fetchLoyalties(); }, [fetchLoyalties]);

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  if (!customer) return null;

  const renderLoyalty = ({ item }: { item: TenantLoyaltyDto }) => (
    <View style={styles.loyaltyCard}>
      <Text style={styles.loyaltyIcon}>{LOYALTY_ICONS[item.loyaltyLevel]}</Text>
      <View style={styles.loyaltyInfo}>
        <Text style={styles.loyaltyLevel}>{item.loyaltyLevel}</Text>
        <Text style={styles.loyaltyTenant}>Tenant: {item.tenantId.slice(0, 8)}…</Text>
      </View>
      <View style={styles.loyaltyRight}>
        <Text style={[styles.loyaltyBadge, { color: LOYALTY_COLORS[item.loyaltyLevel] }]}>
          {item.loyaltyLevel}
        </Text>
        <Text style={styles.loyaltySpent}>₺{Number(item.totalSpent).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Profile</Text></View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{customer.name}</Text>
            <Text style={styles.userEmail}>{customer.email}</Text>
            <Text style={styles.userCity}>📍 {CityDisplayLabels[customer.city as City] ?? customer.city}</Text>
          </View>
        </View>

        {/* Loyalties Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Memberships</Text>
          <Text style={styles.sectionCount}>{loyalties.length} cafe{loyalties.length !== 1 ? 's' : ''}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#6C63FF" /></View>
        ) : (
          <FlatList
            data={loyalties}
            renderItem={renderLoyalty}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏪</Text>
                <Text style={styles.emptyTitle}>No memberships yet</Text>
                <Text style={styles.emptySub}>Visit a Tavia cafe to start earning loyalty rewards!</Text>
              </View>
            }
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchLoyalties} tintColor="#6C63FF" colors={['#6C63FF']} />}
          />
        )}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Pressable style={({pressed}) => [styles.logoutBtn, pressed && styles.logoutPressed]} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:'#0F0F1A'},safe:{flex:1},
  header:{paddingHorizontal:20,paddingTop:12,paddingBottom:8},headerTitle:{fontSize:28,fontWeight:'800',color:'#FFF'},
  userCard:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:16,marginHorizontal:16,padding:16,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  avatar:{width:56,height:56,borderRadius:28,backgroundColor:'#6C63FF',alignItems:'center',justifyContent:'center'},
  avatarText:{color:'#FFF',fontSize:24,fontWeight:'800'},
  userInfo:{flex:1,marginLeft:14},userName:{fontSize:18,fontWeight:'700',color:'#FFF'},userEmail:{fontSize:13,color:'rgba(255,255,255,0.5)',marginTop:2},userCity:{fontSize:13,color:'rgba(255,255,255,0.4)',marginTop:2},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,paddingTop:24,paddingBottom:12},
  sectionTitle:{fontSize:18,fontWeight:'700',color:'rgba(255,255,255,0.85)'},sectionCount:{fontSize:13,fontWeight:'600',color:'rgba(255,255,255,0.35)'},
  loadingContainer:{flex:1,justifyContent:'center',alignItems:'center'},
  listContent:{paddingBottom:16,flexGrow:1},
  loyaltyCard:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,marginHorizontal:16,marginBottom:8,padding:14,borderWidth:1,borderColor:'rgba(255,255,255,0.06)'},
  loyaltyIcon:{fontSize:28,marginRight:12},loyaltyInfo:{flex:1},loyaltyLevel:{fontSize:14,fontWeight:'600',color:'#FFF'},loyaltyTenant:{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:2},
  loyaltyRight:{alignItems:'flex-end'},loyaltyBadge:{fontSize:11,fontWeight:'800',letterSpacing:0.5},loyaltySpent:{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2},
  emptyContainer:{flex:1,justifyContent:'center',alignItems:'center',paddingTop:40},emptyIcon:{fontSize:48,marginBottom:12},emptyTitle:{fontSize:18,fontWeight:'700',color:'rgba(255,255,255,0.6)',marginBottom:6},emptySub:{fontSize:13,color:'rgba(255,255,255,0.3)',textAlign:'center',paddingHorizontal:40},
  logoutSection:{padding:16},logoutBtn:{backgroundColor:'rgba(239,68,68,0.12)',borderRadius:12,paddingVertical:14,alignItems:'center',borderWidth:1,borderColor:'rgba(239,68,68,0.2)'},logoutPressed:{opacity:0.7},logoutText:{color:'#EF4444',fontSize:15,fontWeight:'700'},
});
