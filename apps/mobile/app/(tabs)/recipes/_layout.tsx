import { Stack } from 'expo-router';
import React from 'react';

export default function RecipesLayout() {
  return (
    <Stack initialRouteName='index' screenOptions={{ headerShown: false }} />
  );
}
