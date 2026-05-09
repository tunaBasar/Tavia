import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { City, CityDisplayLabels } from '@/types';

const ALL_CITIES = Object.values(City);

export default function RegisterScreen() {
  const { register, isLoading, error, clearError } = useCustomerAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCity, setSelectedCity] = useState<City>(City.ISPARTA);
  const [showCities, setShowCities] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    clearError();
    const ok = await register({ name: name.trim(), email: email.trim(), password, city: selectedCity });
    if (ok) router.replace('/(tabs)');
  };

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.flex}>
          <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
            <View style={s.hdr}><Text style={s.t1}>Create Account</Text><Text style={s.t2}>Join the Tavia cafe loyalty network</Text></View>
            <View style={s.form}>
              <View style={s.ig}><Text style={s.lb}>Full Name</Text><TextInput style={s.inp} placeholder="John Doe" placeholderTextColor="rgba(255,255,255,0.25)" autoCapitalize="words" value={name} onChangeText={setName} /></View>
              <View style={s.ig}><Text style={s.lb}>Email</Text><TextInput style={s.inp} placeholder="your@email.com" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} /></View>
              <View style={s.ig}><Text style={s.lb}>Password</Text><TextInput style={s.inp} placeholder="Min. 6 characters" placeholderTextColor="rgba(255,255,255,0.25)" secureTextEntry value={password} onChangeText={setPassword} /></View>
              <View style={s.ig}>
                <Text style={s.lb}>City</Text>
                <Pressable style={s.sel} onPress={() => setShowCities(!showCities)}>
                  <Text style={s.selT}>📍 {CityDisplayLabels[selectedCity]}</Text><Text style={s.arr}>{showCities ? '▲' : '▼'}</Text>
                </Pressable>
                {showCities && <ScrollView style={s.cl} nestedScrollEnabled={true}>{ALL_CITIES.map(c => (
                  <Pressable key={c} style={[s.co, c===selectedCity && s.cos]} onPress={() => {setSelectedCity(c);setShowCities(false);}}>
                    <Text style={[s.cot, c===selectedCity && s.cots]}>{CityDisplayLabels[c]}</Text>
                  </Pressable>
                ))}</ScrollView>}
              </View>
              {error && <View style={s.eb}><Text style={s.et}>{error}</Text></View>}
              <Pressable style={({pressed}) => [s.btn, pressed && s.bp, isLoading && s.bd]} onPress={handleRegister} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={s.bt}>Create Account</Text>}
              </Pressable>
            </View>
            <View style={s.ft}><Text style={s.ftx}>Already have an account?</Text><Link href="/auth/login" asChild><Pressable><Text style={s.fl}> Sign In</Text></Pressable></Link></View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:'#0F0F1A'},safe:{flex:1},flex:{flex:1},
  scroll:{flexGrow:1,justifyContent:'center',paddingHorizontal:24,paddingVertical:20},
  hdr:{marginBottom:32},t1:{fontSize:30,fontWeight:'800',color:'#FFF',letterSpacing:-0.5},t2:{fontSize:15,color:'rgba(255,255,255,0.4)',marginTop:6},
  form:{gap:16},ig:{gap:6},lb:{fontSize:13,fontWeight:'600',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:0.5},
  inp:{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,paddingHorizontal:16,paddingVertical:14,fontSize:16,color:'#FFF',borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  sel:{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:12,paddingHorizontal:16,paddingVertical:14,flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  selT:{fontSize:16,color:'#FFF'},arr:{fontSize:12,color:'rgba(255,255,255,0.4)'},
  cl:{backgroundColor:'rgba(30,30,50,0.95)',borderRadius:12,borderWidth:1,borderColor:'rgba(255,255,255,0.08)',maxHeight:200},
  co:{paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'rgba(255,255,255,0.04)'},
  cos:{backgroundColor:'rgba(108,99,255,0.15)'},cot:{fontSize:14,color:'rgba(255,255,255,0.6)'},cots:{color:'#6C63FF',fontWeight:'700'},
  eb:{backgroundColor:'rgba(239,68,68,0.12)',borderRadius:10,paddingHorizontal:14,paddingVertical:10,borderWidth:1,borderColor:'rgba(239,68,68,0.2)'},
  et:{color:'#EF4444',fontSize:13,fontWeight:'500'},
  btn:{backgroundColor:'#6C63FF',borderRadius:12,paddingVertical:16,alignItems:'center',marginTop:8,shadowColor:'#6C63FF',shadowOffset:{width:0,height:6},shadowOpacity:0.35,shadowRadius:12,elevation:8},
  bp:{opacity:0.85},bd:{opacity:0.6},bt:{color:'#FFF',fontSize:16,fontWeight:'700'},
  ft:{flexDirection:'row',justifyContent:'center',marginTop:28,paddingBottom:24},ftx:{color:'rgba(255,255,255,0.4)',fontSize:14},fl:{color:'#6C63FF',fontSize:14,fontWeight:'700'},
});
