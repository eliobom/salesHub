import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Icon, useTheme } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  gradient: string[];
}

export const StatCard: React.FC<StatCardProps> = React.memo(({
  title,
  value,
  change,
  icon,
  gradient,
}) => {
  const theme = useTheme();
  const isPositive = useMemo(() => change ? change > 0 : true, [change]);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <LinearGradient colors={gradient} style={styles.iconContainer}>
            <Icon source={icon} size={24} color="white" />
          </LinearGradient>
          {change !== undefined && (
            <View
              style={[
                styles.changeContainer,
                {
                  backgroundColor: isPositive
                    ? theme.colors.primaryContainer
                    : theme.colors.errorContainer,
                },
              ]}
            >
              <Icon
                source={isPositive ? 'trending-up' : 'trending-down'}
                size={16}
                color={
                  isPositive
                    ? theme.colors.primary
                    : theme.colors.error
                }
              />
              <Text
                style={[
                  styles.changeText,
                  {
                    color: isPositive
                      ? theme.colors.primary
                      : theme.colors.error,
                  },
                ]}
              >
                {Math.abs(change)}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: theme.colors.onSurfaceVariant }]}>
          {title}
        </Text>
        <Text style={[styles.value, { color: theme.colors.onSurface }]}>
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
  },
});