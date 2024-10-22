import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const initialDeepfakeCases = [
  {name: 'Reported', value: 400},
  {name: 'Solved', value: 300},
];

const initialPlatformData = [
  {name: 'Facebook', value: 400},
  {name: 'Twitter', value: 300},
  {name: 'Instagram', value: 200},
  {name: 'TikTok', value: 100},
];

const initialMonthlyData = [
  {name: 'Jan', blocked: 40},
  {name: 'Feb', blocked: 35},
  {name: 'Mar', blocked: 55},
  {name: 'Apr', blocked: 60},
  {name: 'May', blocked: 45},
  {name: 'Jun', blocked: 48},
  {name: 'Jul', blocked: 30},
];

const initialManipulationData = [
  {name: 'Face Swapping', value: 35},
  {name: 'Voice Cloning', value: 25},
  {name: 'Lip Syncing', value: 20},
  {name: 'Body Manipulation', value: 15},
  {name: 'Other', value: 5},
];

const initialTableData = [
  {
    id: 1,
    date: '2023-06-01',
    type: 'Video',
    platform: 'TikTok',
    status: 'Fake',
    confidence: 0.92,
    nature: 'Face swapping',
    technology: 'GANs',
  },
  {
    id: 2,
    date: '2023-06-02',
    type: 'Image',
    platform: 'Instagram',
    status: 'Real',
    confidence: 0.88,
    nature: 'N/A',
    technology: 'N/A',
  },
  {
    id: 3,
    date: '2023-06-03',
    type: 'Audio',
    platform: 'Twitter',
    status: 'Fake',
    confidence: 0.95,
    nature: 'Voice cloning',
    technology: 'WaveNet',
  },
  {
    id: 4,
    date: '2023-06-04',
    type: 'Video',
    platform: 'Facebook',
    status: 'Fake',
    confidence: 0.89,
    nature: 'Lip syncing',
    technology: 'AutoEncoder',
  },
  {
    id: 5,
    date: '2023-06-05',
    type: 'Image',
    platform: 'Instagram',
    status: 'Real',
    confidence: 0.91,
    nature: 'N/A',
    technology: 'N/A',
  },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [platform, setPlatform] = useState('all');
  const [mediaType, setMediaType] = useState('all');
  const [deepfakeCases, setDeepfakeCases] = useState(initialDeepfakeCases);
  const [platformData, setPlatformData] = useState(initialPlatformData);
  const [monthlyData, setMonthlyData] = useState(initialMonthlyData);
  const [manipulationData, setManipulationData] = useState(
    initialManipulationData,
  );
  const [tableData, setTableData] = useState(initialTableData);

  useEffect(() => {
    // Simulating data filtering based on selected filters
    const filteredTableData = initialTableData.filter(
      item =>
        (platform === 'all' || item.platform === platform) &&
        (mediaType === 'all' || item.type === mediaType),
    );
    setTableData(filteredTableData);

    // Update chart data based on filters (simplified simulation)
    setDeepfakeCases(
      deepfakeCases.map(item => ({
        ...item,
        value: item.value * Math.random() * 0.5 + 0.5,
      })),
    );
    setPlatformData(
      platformData.map(item => ({
        ...item,
        value: item.value * Math.random() * 0.5 + 0.5,
      })),
    );
    setMonthlyData(
      monthlyData.map(item => ({
        ...item,
        blocked: item.blocked * Math.random() * 0.5 + 0.5,
      })),
    );
    setManipulationData(
      manipulationData.map(item => ({
        ...item,
        value: item.value * Math.random() * 0.5 + 0.5,
      })),
    );
  }, [timeRange, platform, mediaType]);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const downloadReport = format => {
    console.log(`Downloading ${format} report...`);
  };

  return (
    <View>
      <Text>Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
