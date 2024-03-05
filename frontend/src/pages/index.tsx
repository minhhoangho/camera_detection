import { useEffect } from 'react';
import { useRouter } from 'next/router';
import CookiesStorage from 'src/utils/cookie-storage';

export default function Index() {
  const isAuthenticated = CookiesStorage.isAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/home');
    }
    if (router.pathname === '/') {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);
  return null;
}
