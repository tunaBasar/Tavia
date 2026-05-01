import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import api from '@/lib/axios';
import { ApiResponse } from '@/types';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestReset = async () => {
    if (!email.trim()) return;
    setIsLoading(true); setError(null);
    try {
      const res = await api.post<ApiResponse<null>>('/api/v1/crm/auth/forgot-password', { email: email.trim() });
      setMessage(res.data.message);
      setStep('reset');
    } catch (err: unknown) {
      setError('Failed to send reset request.');
    } finally { setIsLoading(false); }
  };

  const handleResetPassword = async () => {
    if (!token.trim() || !newPassword.trim()) return;
    setIsLoading(true); setError(null);
    try {
      await api.post<ApiResponse<null>>('/api/v1/crm/auth/reset-password', { token: token.trim(), newPassword });
      setStep('done');
    } catch (err: unknown) {
      setError('Invalid or expired reset token.');
    } finally { setIsLoading(false); }
  };

  if (step === 'done') {
    return (
      <View style={s.root}><SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={s.doneIcon}>✅</Text>
          <Text style={s.doneTitle}>Password Reset!</Text>
          <Text style={s.doneSub}>Your password has been updated. Sign in with your new password.</Text>
          <Pressable style={s.btn} onPress={() => router.replace('/auth/login')}><Text style={s.bt}>Go to Login</Text></Pressable>
        </View>
      </SafeAreaView></View>
    );
  }

  return (
    <View style={s.root}><SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.hdr}>
            <Text style={s.t1}>{step === 'request' ? 'Forgot Password' : 'Reset Password'}</Text>
            <Text style={s.t2}>{step === 'request' ? 'Enter your email to receive a reset token' : 'Enter the token and your new password'}</Text>
          </View>
          <View style={s.form}>
            {step === 'request' ? (
              <View style={s.ig}><Text style={s.lb}>Email</Text><TextInput style={s.inp} placeholder="your@email.com" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} /></View>
            ) : (<>
              {message && <View style={s.mb}><Text style={s.mt}>{message}</Text></View>}
              <View style={s.ig}><Text style={s.lb}>Reset Token</Text><TextInput style={s.inp} placeholder="Paste token from email/console" placeholderTextColor="rgba(255,255,255,0.25)" autoCapitalize="none" value={token} onChangeText={setToken} /></View>
              <View style={s.ig}><Text style={s.lb}>New Password</Text><TextInput style={s.inp} placeholder="Min. 6 characters" placeholderTextColor="rgba(255,255,255,0.25)" secureTextEntry value={newPassword} onChangeText={setNewPassword} /></View>
            </>)}
            {error && <View style={s.eb}><Text style={s.et}>{error}</Text></View>}
            <Pressable style={({pressed}) => [s.btn, pressed && s.bp, isLoading && s.bd]} onPress={step === 'request' ? handleRequestReset : handleResetPassword} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.bt}>{step === 'request' ? 'Send Reset Token' : 'Reset Password'}</Text>}
            </Pressable>
          </View>
          <Pressable style={s.back} onPress={() => router.back()}><Text style={s.backT}>← Back to Login</Text></Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView></View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#0F0F1A'},safe:{flex:1},flex:{flex:1},center:{flex:1,justifyContent:'center',alignItems:'center',paddingHorizontal:32},
  scroll:{flexGrow:1,justifyContent:'center',paddingHorizontal:24},
  hdr:{marginBottom:32},t1:{fontSize:28,fontWeight:'800',color:'#FFF'},t2:{fontSize:14,color:'rgba(255,255,255,0.4)',marginTop:6},
  form:{gap:16},ig:{gap:6},lb:{fontSize:13,fontWeight:'600',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5},
  inp:{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,paddingHorizontal:16,paddingVertical:14,fontSize:16,color:'#FFF',borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  mb:{backgroundColor:'rgba(34,197,94,0.12)',borderRadius:10,padding:12,borderWidth:1,borderColor:'rgba(34,197,94,0.2)'},
  mt:{color:'#22C55E',fontSize:13,fontWeight:'500'},
  eb:{backgroundColor:'rgba(239,68,68,0.12)',borderRadius:10,paddingHorizontal:14,paddingVertical:10,borderWidth:1,borderColor:'rgba(239,68,68,0.2)'},
  et:{color:'#EF4444',fontSize:13,fontWeight:'500'},
  btn:{backgroundColor:'#6C63FF',borderRadius:12,paddingVertical:16,alignItems:'center',marginTop:8,elevation:8},
  bp:{opacity:0.85},bd:{opacity:0.6},bt:{color:'#FFF',fontSize:16,fontWeight:'700'},
  back:{alignSelf:'center',marginTop:24,paddingVertical:8},backT:{color:'#6C63FF',fontSize:14,fontWeight:'600'},
  doneIcon:{fontSize:64,marginBottom:20},doneTitle:{fontSize:24,fontWeight:'800',color:'#FFF',marginBottom:8},doneSub:{fontSize:14,color:'rgba(255,255,255,0.5)',textAlign:'center',marginBottom:28,lineHeight:20},
});
