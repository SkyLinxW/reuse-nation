import { useState } from 'react';
import { Header } from '@/components/Header';
import { HomePage } from '@/pages/HomePage';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {/* Outras páginas serão implementadas gradualmente */}
    </div>
  );
};

export default Index;
