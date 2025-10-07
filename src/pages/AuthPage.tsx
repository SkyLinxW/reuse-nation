import { useState, useEffect } from 'react';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export const AuthPage = ({ onNavigate }: AuthPageProps) => {
  // Check URL params for tab
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'register' ? 'register' : 'login');

  const handleNavigateToRegister = () => {
    setActiveTab('register');
  };

  const handleNavigateToLogin = () => {
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <div className="hidden">
          <TabsList>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="login" className="h-full m-0">
          <LoginPage onNavigate={(page) => {
            if (page === 'register') {
              handleNavigateToRegister();
            } else {
              onNavigate(page);
            }
          }} />
        </TabsContent>
        
        <TabsContent value="register" className="h-full m-0">
          <RegisterPage onNavigate={(page) => {
            if (page === 'login') {
              handleNavigateToLogin();
            } else {
              onNavigate(page);
            }
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};