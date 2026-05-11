import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, RefreshControl,
  StyleSheet, Text, View, Switch, TextInput, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
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
  const { theme, toggleTheme } = useThemeStore();
  const [loyalties, setLoyalties] = useState<TenantLoyaltyDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [newName, setNewName] = useState(customer?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFF' : '#3E2723';
  const subTextColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(62,39,35,0.6)';
  const bgColor = isDark ? '#1C2520' : '#FAFAFA';
  const cardColor = isDark ? 'rgba(255,255,255,0.06)' : '#FFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#E0E0E0';
  const primaryColor = isDark ? '#6B9E78' : '#2E5F3E';

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

  const handleUpdateName = async () => {
    if (!customer || !newName.trim()) return;
    try {
      await api.put(`/api/v1/crm/customers/${customer.id}`, { name: newName });
      Alert.alert('Success', 'Username updated successfully!');
      useCustomerAuthStore.setState({ customer: { ...customer, name: newName } });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update username');
    }
  };

  const handleChangePassword = async () => {
    if (!customer || !currentPassword || !newPassword) return;
    try {
      await api.post(`/api/v1/crm/auth/${customer.id}/change-password`, { currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  if (!customer) return null;

  return (
    <View style={[styles.root, { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}><Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text></View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* User Info Card */}
          <View style={[styles.userCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
              <Text style={styles.avatarText}>{customer.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: textColor }]}>{customer.name}</Text>
              <Text style={[styles.userEmail, { color: subTextColor }]}>{customer.email}</Text>
              <Text style={[styles.userCity, { color: subTextColor }]}>📍 {CityDisplayLabels[customer.city as City] ?? customer.city}</Text>
            </View>
          </View>

          {/* Theme Switcher */}
          <View style={[styles.settingsCard, { backgroundColor: cardColor, borderColor }]}>
            <Text style={[styles.settingsLabel, { color: textColor }]}>Dark Theme</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor={'#f4f3f4'}
            />
          </View>

          {/* Change Username */}
          <View style={[styles.settingsCard, { backgroundColor: cardColor, borderColor, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[styles.settingsLabel, { color: textColor, marginBottom: 8 }]}>Change Username</Text>
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor, flex: 1, marginRight: 8 }]}
                value={newName}
                onChangeText={setNewName}
                placeholder="New Username"
                placeholderTextColor={subTextColor}
              />
              <Pressable style={[styles.actionBtn, { backgroundColor: primaryColor }]} onPress={handleUpdateName}>
                <Text style={styles.actionBtnText}>Save</Text>
              </Pressable>
            </View>
          </View>

          {/* Change Password */}
          <View style={[styles.settingsCard, { backgroundColor: cardColor, borderColor, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <Text style={[styles.settingsLabel, { color: textColor, marginBottom: 8 }]}>Change Password</Text>
            <TextInput
              style={[styles.input, { color: textColor, borderColor, width: '100%', marginBottom: 8 }]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current Password"
              placeholderTextColor={subTextColor}
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <TextInput
                style={[styles.input, { color: textColor, borderColor, flex: 1, marginRight: 8 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New Password"
                placeholderTextColor={subTextColor}
                secureTextEntry
              />
              <Pressable style={[styles.actionBtn, { backgroundColor: primaryColor }]} onPress={handleChangePassword}>
                <Text style={styles.actionBtnText}>Update</Text>
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <Pressable style={({pressed}) => [styles.logoutBtn, pressed && styles.logoutPressed]} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{flex:1},safe:{flex:1},scrollContent: { paddingBottom: 40 },
  header:{paddingHorizontal:20,paddingTop:12,paddingBottom:8},headerTitle:{fontSize:28,fontWeight:'800'},
  userCard:{flexDirection:'row',alignItems:'center',borderRadius:16,marginHorizontal:16,padding:16,borderWidth:1, marginBottom: 16},
  avatar:{width:56,height:56,borderRadius:28,alignItems:'center',justifyContent:'center'},
  avatarText:{color:'#FFF',fontSize:24,fontWeight:'800'},
  userInfo:{flex:1,marginLeft:14},userName:{fontSize:18,fontWeight:'700'},userEmail:{fontSize:13,marginTop:2},userCity:{fontSize:13,marginTop:2},
  settingsCard:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderRadius:12,marginHorizontal:16,padding:16,borderWidth:1,marginBottom:12},
  settingsLabel:{fontSize:16,fontWeight:'600'},
  input:{borderWidth:1,borderRadius:8,paddingHorizontal:12,paddingVertical:10,fontSize:14},
  actionBtn:{paddingHorizontal:16,justifyContent:'center',alignItems:'center',borderRadius:8},
  actionBtnText:{color:'#FFF',fontWeight:'600'},
  logoutSection:{padding:16, marginTop: 12},logoutBtn:{backgroundColor:'rgba(239,68,68,0.12)',borderRadius:12,paddingVertical:14,alignItems:'center',borderWidth:1,borderColor:'rgba(239,68,68,0.2)'},logoutPressed:{opacity:0.7},logoutText:{color:'#EF4444',fontSize:15,fontWeight:'700'},
});
