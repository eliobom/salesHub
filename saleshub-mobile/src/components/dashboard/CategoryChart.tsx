import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';

interface CategoryChartProps {
  data: Array<{ category: string; sales: number }>;
}

export const CategoryChart: React.FC<CategoryChartProps> = React.memo(({ data }) => {
  const theme = useTheme();
  const screenWidth = useMemo(() => Dimensions.get('window').width - 32, []); // padding

  const chartData = useMemo(() => ({
    labels: data.map(item => item.category.length > 8 ? item.category.substring(0, 8) + '...' : item.category),
    datasets: [
      {
        data: data.map(item => item.sales),
      },
    ],
  }), [data]);

  const chartConfig = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`, // indigo
    labelColor: (opacity = 1) => `rgba(${theme.colors.onSurfaceVariant}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    barPercentage: 0.7,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: theme.colors.outline,
      strokeDasharray: '5, 5',
    },
  }), [theme.colors.surface, theme.colors.onSurfaceVariant, theme.colors.outline]);

  return (
    <Card style={styles.card}>
      <Card.Title title="Ventas por Categoría" />
      <Card.Content>
        <View style={styles.chartContainer}>
          <BarChart
            data={chartData}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
            withInnerLines={false}
            yAxisLabel=""
            yAxisSuffix=""
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