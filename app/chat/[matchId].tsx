import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '@/constants';
import { useChatStore, useAuthStore, useMatchingStore } from '@/stores';
import { useTranslation } from '@/hooks';
import { Avatar, Button } from '@/components/ui';
import { Message } from '@/types';
import { sendMatchNotification } from '@/services/sms';

const AI_ICEBREAKERS = [
  "What's your favorite local food spot?",
  "If you could travel anywhere in Africa, where would you go?",
  "What's the best concert you've been to recently?",
  "Do you have a favorite local language phrase?",
  "What's your community's best tradition?",
  "Are you more of a city person or countryside?",
  "What's a skill you'd love to learn?",
  "What's your favorite way to spend weekends?",
];

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { conversations, sendMessage, isLoading } = useChatStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [showIcebreakers, setShowIcebreakers] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const messages = conversations[matchId || ''] || [];

  useEffect(() => {
    if (matchId) {
      useChatStore.getState().fetchMessages(matchId);
    }
  }, [matchId]);

  const handleSend = () => {
    if (!message.trim()) return;
    const isFirstMessage = messages.length === 0;
    sendMessage(matchId || '', message.trim());
    if (isFirstMessage && user?.phone) {
      const matchedUser = useMatchingStore.getState().matches.find((m) => m.id === matchId);
      if (matchedUser) {
        sendMatchNotification(user.phone, matchedUser.matchedUserId);
      }
    }
    setMessage('');
  };

  const handleIcebreaker = (starter: string) => {
    sendMessage(matchId || '', starter, 'icebreaker');
    setShowIcebreakers(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        {item.type === 'icebreaker' && (
          <View style={styles.icebreakerBadge}>
            <Text style={styles.icebreakerText}>AI Icebreaker</Text>
          </View>
        )}
        <Text style={[styles.messageText, isMe && styles.myMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, isMe && styles.myMessageTime]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Avatar size={36} isVerified />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Match</Text>
          <Text style={styles.headerStatus}>Online</Text>
        </View>
        <TouchableOpacity style={styles.safetyButton} onPress={() => router.push('/safety')}>
          <Text style={styles.safetyIcon}>🛡️</Text>
        </TouchableOpacity>
      </View>

      {showIcebreakers && (
        <View style={styles.icebreakersPanel}>
          <Text style={styles.icebreakersTitle}>{t('ai_starters')}</Text>
          <FlatList
            data={AI_ICEBREAKERS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.icebreakerOption}
                onPress={() => handleIcebreaker(item)}
              >
                <Text style={styles.icebreakerOptionText}>{item}</Text>
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatIcon}>💬</Text>
            <Text style={styles.emptyChatText}>Start the conversation!</Text>
            <Button
              title={t('ai_starters')}
              onPress={() => setShowIcebreakers(!showIcebreakers)}
              variant="outline"
              size="sm"
            />
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.icebreakerButton}
          onPress={() => setShowIcebreakers(!showIcebreakers)}
        >
          <Text style={styles.icebreakerButtonText}>✨</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder={t('chat_placeholder')}
          placeholderTextColor={COLORS.textLight}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.primary,
    gap: SPACING.sm,
  },
  backText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerStatus: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.xs,
    opacity: 0.8,
  },
  safetyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safetyIcon: {
    fontSize: 18,
  },
  icebreakersPanel: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  icebreakersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  icebreakerOption: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  icebreakerOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  messageList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: SPACING.xs,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: SPACING.xs,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    lineHeight: 20,
  },
  myMessageText: {
    color: COLORS.textInverse,
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: COLORS.textInverse,
    opacity: 0.7,
  },
  icebreakerBadge: {
    backgroundColor: COLORS.accent + '30',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginBottom: SPACING.xs,
    alignSelf: 'flex-start',
  },
  icebreakerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accentDark,
    fontWeight: '600',
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyChatIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyChatText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  icebreakerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  icebreakerButtonText: {
    fontSize: 18,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    backgroundColor: COLORS.surface,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.textInverse,
    fontSize: 16,
  },
});
