import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, CheckCheck, MessageCircle, ShoppingCart, Heart, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/lib/supabase';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export const NotificationsPage = ({ onNavigate }: NotificationsPageProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadNotifications = async () => {
    if (user) {
      try {
        setLoading(true);
        const userNotifications = await getNotifications(user.id);
        setNotifications(userNotifications || []);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadNotifications();

    // Real-time subscription to keep notifications in sync
    if (user) {
      const channel = supabase
        .channel(`notifications-page-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'new_order':
      case 'order_confirmed':
        return <ShoppingCart className="w-5 h-5 text-eco-green" />;
      case 'sale':
        return <ShoppingCart className="w-5 h-5 text-eco-blue" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-eco-brown" />;
      case 'favorite':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) return 'Agora há pouco';
    if (diffHours < 24) return `${Math.floor(diffHours)}h atrás`;
    if (diffDays < 7) return `${Math.floor(diffDays)} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para ver suas notificações.
            </p>
            <Button onClick={() => onNavigate('auth')}>
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" onClick={() => onNavigate('home')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Não lidas ({unreadCount})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {filter === 'unread'
                  ? 'Você não tem notificações não lidas.'
                  : 'Você ainda não tem notificações.'
                }
              </p>
              {filter === 'unread' && (
                <Button variant="outline" onClick={() => setFilter('all')}>
                  Ver todas as notificações
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? 'bg-background border-border'
                      : 'bg-eco-green-light/10 border-eco-green/20'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm">{notification.title}</h3>
                        <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <>
                            <Badge variant="secondary" className="text-xs">Nova</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                              title="Marcar como lida"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
