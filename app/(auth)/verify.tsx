import { useEffect } from 'react';
import { router } from 'expo-router';

export default function VerifyScreen() {
  useEffect(() => {
    router.replace('/(auth)');
  }, []);
  return null;
}
