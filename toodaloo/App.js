import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import BathroomMap from './components/BathroomMap';
import TopNavbar from './components/TopNavbar';

export default function App() {
  return (
    <View style={styles.container}>
      <BathroomMap></BathroomMap>
      <TopNavbar></TopNavbar>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 600
  }
});
