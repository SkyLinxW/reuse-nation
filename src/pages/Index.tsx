import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { CreateListingPage } from '@/pages/CreateListingPage';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { MyListingsPage } from '@/pages/MyListingsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { initializeDemoData } from '@/lib/localStorage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  useEffect(() => {
    // Inicializar dados demo na primeira visita
    initializeDemoData();
  }, []);

  const handleNavigate = (page: string) => {
    const [pageName, queryString] = page.split('?');
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

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'create-listing':
        return <CreateListingPage onNavigate={handleNavigate} />;
      case 'product':
        return <ProductDetailsPage onNavigate={handleNavigate} productId={pageParams.id || ''} />;
      case 'favorites':
        return <FavoritesPage onNavigate={handleNavigate} />;
      case 'my-listings':
        return <MyListingsPage onNavigate={handleNavigate} />;
      case 'messages':
        return <MessagesPage onNavigate={handleNavigate} chatId={pageParams.chatId} />;
      case 'transactions':
        return <TransactionsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
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
