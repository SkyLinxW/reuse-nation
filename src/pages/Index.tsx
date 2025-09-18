import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { AuthPage } from '@/pages/AuthPage';
import { CreateListingPage } from '@/pages/CreateListingPage';
import { EditListingPage } from '@/pages/EditListingPage';
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
import { AboutPage } from '@/pages/AboutPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { NewsPage } from '@/pages/NewsPage';
import { AnnouncementsPage } from '@/pages/AnnouncementsPage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const { user, loading } = useAuth();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (user && currentPage === 'auth') {
      console.log('User authenticated, redirecting from auth to home');
      setCurrentPage('home');
    }
  }, [user, currentPage]);

  const handleNavigate = (page: string) => {
    console.log('Navigating to:', page);
    const [pageName, queryString] = page.split('?');
    
    // Protected routes that require authentication
    const protectedRoutes = ['cart', 'favorites', 'create-listing', 'edit-listing', 'my-listings', 'profile', 'transactions', 'notifications', 'messages'];
    
    if (protectedRoutes.includes(pageName) && !user) {
      console.log('Protected route requires auth, redirecting to auth page');
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
    console.log('renderPage called, currentPage:', currentPage, 'user:', user?.id);
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'auth':
        return <AuthPage onNavigate={handleNavigate} />;
      case 'create-listing':
        return <CreateListingPage onNavigate={handleNavigate} />;
      case 'edit-listing':
        return <EditListingPage onNavigate={handleNavigate} listingId={pageParams.id || ''} />;
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
        return <MessagesPage onNavigate={handleNavigate} chatId={pageParams.conversationId} sellerId={pageParams.sellerId} />;
      case 'transactions':
        return <TransactionsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      case 'seller-profile':
        return <SellerProfilePage onNavigate={handleNavigate} sellerId={pageParams.id || ''} />;
      case 'search':
        return <SearchPage onNavigate={handleNavigate} />;
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'services':
        return <ServicesPage onNavigate={handleNavigate} />;
      case 'news':
        return <NewsPage onNavigate={handleNavigate} />;
      case 'announcements':
        return <AnnouncementsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      <div className="relative flex-1">
        {renderPage()}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
