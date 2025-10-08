import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, useTheme } from 'react-native-paper';

interface CommissionCardProps {
  totalCommission: number;
  monthlyCommission: number;
  commissionRate: number;
  period?: string;
}

export const CommissionCard: React.FC<CommissionCardProps> = ({
  totalCommission,
  monthlyCommission,
  commissionRate,
  period = 'This Month',
}) => {
  const theme = useTheme();

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Calculate progress towards a monthly goal (assuming $1000 goal for demo)
  const monthlyGoal = 1000;
  const progress = Math.min(monthlyCommission / monthlyGoal, 1);

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Text
          variant="titleMedium"
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          Commission Overview
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text
              variant="bodyMedium"
              style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Total Earned
            </Text>
            <Text
              variant="titleLarge"
              style={[styles.statValue, { color: theme.colors.primary }]}
            >
              {formatCurrency(totalCommission)}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text
              variant="bodyMedium"
              style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              {period}
            </Text>
            <Text
              variant="titleLarge"
              style={[styles.statValue, { color: theme.colors.secondary }]}
            >
              {formatCurrency(monthlyCommission)}
            </Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text
              variant="bodyMedium"
              style={[styles.progressLabel, { color: theme.colors.onSurfaceVariant }]}
            >
              Monthly Goal Progress
            </Text>
            <Text
              variant="bodyMedium"
              style={[styles.progressValue, { color: theme.colors.onSurface }]}
            >
              {formatCurrency(monthlyCommission)} / {formatCurrency(monthlyGoal)}
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <Text
            variant="bodySmall"
            style={[styles.progressPercent, { color: theme.colors.onSurfaceVariant }]}
          >
            {Math.round(progress * 100)}% complete
          </Text>
        </View>

        <View style={styles.rateSection}>
          <Text
            variant="bodyMedium"
            style={[styles.rateLabel, { color: theme.colors.onSurfaceVariant }]}
          >
            Current Commission Rate
          </Text>
          <Text
            variant="titleMedium"
            style={[styles.rateValue, { color: theme.colors.tertiary }]}
          >
            {commissionRate}%
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
  title: {
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginBottom: 4,
  },
  statValue: {
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {},
  progressValue: {
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressPercent: {
    textAlign: 'center',
    marginTop: 4,
  },
  rateSection: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  rateLabel: {
    marginBottom: 4,
  },
  rateValue: {
    fontWeight: 'bold',
  },
});