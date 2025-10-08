import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';

interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

interface StatsCardProps {
  title: string;
  stats: StatItem[];
  columns?: number;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  stats,
  columns = 2,
}) => {
  const theme = useTheme();

  const getStatColor = (color?: string) => {
    return color || theme.colors.primary;
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {title}
        </Text>

        <View style={[styles.statsGrid, { flexDirection: columns === 1 ? 'column' : 'row' }]}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statItem,
                columns > 1 && { flex: 1 },
                index < stats.length - (columns === 1 ? 0 : columns) && styles.statItemSpacing,
              ]}
            >
              <Text
                variant="bodyMedium"
                style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
              >
                {stat.label}
              </Text>
              <Text
                variant="titleLarge"
                style={[styles.statValue, { color: getStatColor(stat.color) }]}
              >
                {stat.value}
              </Text>
            </View>
          ))}
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
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statItemSpacing: {
    marginRight: 16,
  },
  statLabel: {
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});