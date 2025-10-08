import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';
import type { Database } from '../../lib/supabase';

type Seller = Database['public']['Tables']['sellers']['Row'];

interface ProfileHeaderProps {
  seller: Seller;
  showCommission?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  seller,
  showCommission = true,
}) => {
  const theme = useTheme();

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatCommission = (rate: number) => {
    return `${rate}%`;
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.profileSection}>
          <Avatar.Text
            size={80}
            label={getInitials(seller.full_name)}
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.onPrimary }}
          />
          <View style={styles.profileInfo}>
            <Text
              variant="headlineSmall"
              style={[styles.name, { color: theme.colors.onSurface }]}
            >
              {seller.full_name}
            </Text>
            <Text
              variant="bodyLarge"
              style={[styles.email, { color: theme.colors.onSurfaceVariant }]}
            >
              {seller.email}
            </Text>
            {seller.phone && (
              <Text
                variant="bodyMedium"
                style={[styles.phone, { color: theme.colors.onSurfaceVariant }]}
              >
                {seller.phone}
              </Text>
            )}
          </View>
        </View>

        {showCommission && (
          <View style={styles.commissionSection}>
            <Text
              variant="bodyMedium"
              style={[styles.commissionLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Commission Rate
            </Text>
            <Text
              variant="titleLarge"
              style={[styles.commissionValue, { color: theme.colors.primary }]}
            >
              {formatCommission(seller.commission_rate)}
            </Text>
          </View>
        )}

        <View style={styles.statusSection}>
          <Text
            variant="bodySmall"
            style={[
              styles.status,
              {
                color: seller.is_active ? theme.colors.primary : theme.colors.error,
              },
            ]}
          >
            {seller.is_active ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
  },
  content: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    marginBottom: 2,
  },
  phone: {},
  commissionSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  commissionLabel: {
    marginBottom: 4,
  },
  commissionValue: {
    fontWeight: 'bold',
  },
  statusSection: {
    alignItems: 'center',
  },
  status: {
    fontWeight: '500',
  },
});