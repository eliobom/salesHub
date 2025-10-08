import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';

interface SalesChartProps {
  data: Array<{ month: string; sales: number; revenue: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = React.memo(({ data }) => {
  const theme = useTheme();
  const screenWidth = useMemo(() => Dimensions.get('window').width - 32, []); // padding

  const chartData = useMemo(() => ({
    labels: data.map(item => item.month),
    datasets: [
      {
        data: data.map(item => item.sales),
        color: () => '#6366f1',
        strokeWidth: 2,
      },
      {
        data: data.map(item => item.revenue),
        color: () => '#f97316',
        strokeWidth: 2,
      },
    ],
    legend: ['Ventas', 'Ingresos ($)'],
  }), [data]);

  const chartConfig = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${theme.colors.onSurface}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${theme.colors.onSurfaceVariant}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary,
    },
  }), [theme.colors.surface, theme.colors.onSurface, theme.colors.onSurfaceVariant, theme.colors.primary]);

  return (
    <Card style={styles.card}>
      <Card.Title title="Tendencia de Ventas" />
      <Card.Content>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </Card.Content>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    margin: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});