import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Animated,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useThemeStore } from '@/store/useThemeStore';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomerAuthStore } from '@/store/useCustomerAuthStore';
import { useActiveTenantStore } from '@/store/useActiveTenantStore';
import api from '@/lib/axios';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

/** Height of the bottom tab bar – used to calculate the keyboard vertical offset. */
const TAB_BAR_HEIGHT = 64;

const MascotAvatar = ({ isThinking }: { isThinking?: boolean }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mouthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Gentle float
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -3, duration: 1500, useNativeDriver: false }),
        Animated.timing(floatAnim, { toValue: 3, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isThinking) {
      // Pulse antenna
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 600, useNativeDriver: false }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: false }),
        ])
      ).start();
      // Mouth open/close "talking" animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(mouthAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 0, duration: 200, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 0.6, duration: 180, useNativeDriver: false }),
          Animated.timing(mouthAnim, { toValue: 0, duration: 220, useNativeDriver: false }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      mouthAnim.setValue(0);
    }
  }, [isThinking]);

  // Mouth height animates between 3 (closed smile) and 8 (open talking)
  const mouthHeight = mouthAnim.interpolate({ inputRange: [0, 1], outputRange: [3, 8] });
  // Mouth border-radius to keep it round when open
  const mouthRadius = mouthAnim.interpolate({ inputRange: [0, 1], outputRange: [6, 4] });

  return (
    <Animated.View style={{ transform: [{ translateY: floatAnim }], alignItems: 'center', justifyContent: 'center', width: 40, height: 40, backgroundColor: '#5D4037', borderRadius: 20, borderWidth: 2, borderColor: '#8D6E63', marginRight: 10 }}>
      {/* Antenna glow */}
      <Animated.View style={{ position: 'absolute', top: -4, width: 6, height: 6, borderRadius: 3, backgroundColor: isThinking ? '#FFD700' : '#A5D6A7', transform: [{ scale: pulseAnim }], shadowColor: isThinking ? '#FFD700' : 'transparent', shadowOpacity: 0.9, shadowRadius: 6 }} />
      {/* Eyes - happy curved */}
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginHorizontal: 3 }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF', marginHorizontal: 3 }} />
      </View>
      {/* Smile / Talking Mouth */}
      <Animated.View style={{
        width: 12,
        height: mouthHeight,
        backgroundColor: '#FFCCBC',
        borderBottomLeftRadius: mouthRadius,
        borderBottomRightRadius: mouthRadius,
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,
        marginTop: 3,
        overflow: 'hidden',
      }} />
    </Animated.View>
  );
};

export default function AiChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const customer = useCustomerAuthStore((state) => state.customer);
  const activeTenantId = useActiveTenantStore((state) => state.activeTenantId);
  const { theme } = useThemeStore();

  const isDark = theme === 'dark';
  const c = Colors[theme];
  const bgColor = c.background;
  const headerBg = c.card;
  const textColor = c.text;
  const inputBg = c.background;
  const borderColor = c.border;
  const aiBubbleBg = isDark ? '#3E2723' : '#EFEBE9';
  const aiTextColor = c.text;

  // ── Clear chat history when navigating away ──────────────────────────
  useFocusEffect(
    useCallback(() => {
      // Focus
      return () => {
        // Blur / Unmount
        setMessages([]);
        setInputText('');
        setIsLoading(false);
      };
    }, [])
  );

  // ── Auto-scroll to bottom when messages change ──────────────────────────
  useEffect(() => {
    // Small delay ensures the layout has settled before scrolling
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // ── Scroll to bottom when keyboard appears ──────────────────────────────
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const sub = Keyboard.addListener(showEvent, () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    });
    return () => sub.remove();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!customer) {
      alert('Please log in to use the AI Assistant.');
      return;
    }

    if (!activeTenantId) {
      alert('Please select a cafe to use the AI Assistant.');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/v1/ai/chat', {
        customerId: customer.id,
        message: userMsg.text,
      });

      const aiText = response.data?.data?.reply || 'Sorry, I could not generate a response.';

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiText,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? TAB_BAR_HEIGHT + insets.bottom : 0}
    >
      <View style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <View style={styles.headerTitleContainer}>
          <MascotAvatar isThinking={isLoading} />
          <Text style={[styles.headerTitle, { color: textColor }]}>TAVIA</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Ask me for recommendations or questions about our menu!
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userMessage : styles.aiMessage,
              ]}
            >
              <Text style={[styles.messageText, msg.role === 'ai' && { color: aiTextColor }]}>{msg.text}</Text>
            </View>
          ))
        )}
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiMessage, { backgroundColor: aiBubbleBg }, styles.loadingBubble]}>
            <Text style={{ color: aiTextColor, fontSize: 14, fontStyle: 'italic', opacity: 0.7 }}>Thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputArea, { backgroundColor: headerBg, borderTopColor: borderColor, paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TextInput
          style={[styles.textInput, { backgroundColor: inputBg, color: textColor, borderColor }]}
          placeholder="Type your message..."
          placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(62, 39, 35, 0.4)"}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isLoading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2520',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1C1C2E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMascot: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B9E78',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  loadingBubble: {
    padding: 18,
    width: 60,
    alignItems: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1C1C2E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1C2520',
    color: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: '#6B9E78',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
