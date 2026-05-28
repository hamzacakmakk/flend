import React from 'react';
import { StatusBar } from 'react-native';
import CompetitorListScreen from './src/screens/CompetitorListScreen';

export default function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <CompetitorListScreen />
    </>
  );
}
