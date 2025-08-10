import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { CreateListingPage } from '@/pages/CreateListingPage';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { CartPage } from '@/pages/CartPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { MyListingsPage } from '@/pages/MyListingsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SellerProfilePage } from '@/pages/SellerProfilePage';
import { SearchPage } from '@/pages/SearchPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const { user, loading } = useAuth();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (user && currentPage === 'auth') {
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  const handleNavigate = (page: string) => {
    const [pageName, queryString] = page.split('?');
    
    // Protected routes that require authentication
    const protectedRoutes = ['cart', 'favorites', 'create-listing', 'my-listings', 'profile', 'transactions', 'notifications', 'messages'];
    
    if (protectedRoutes.includes(pageName) && !user) {
      setCurrentPage('auth');
      return;
    }
    
    setCurrentPage(pageName);
    
    // Parse query parameters
    const params: Record<string, string> = {};
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      urlParams.forEach((value, key) => {
        params[key] = value;
      });
    }
    setPageParams(params);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-eco-green"></div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'create-listing':
        return <CreateListingPage onNavigate={handleNavigate} />;
      case 'product':
        return <ProductDetailsPage onNavigate={handleNavigate} productId={pageParams.id || ''} />;
      case 'favorites':
        return <FavoritesPage onNavigate={handleNavigate} />;
      case 'cart':
        return <CartPage onNavigate={handleNavigate} />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'my-listings':
        return <MyListingsPage onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesPage onNavigate={handleNavigate} chatId={pageParams.chatId} />;
      case 'transactions':
        return <TransactionsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'seller-profile':
        return <SellerProfilePage onNavigate={handleNavigate} sellerId={pageParams.id || ''} />;
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
};

export default Index;
