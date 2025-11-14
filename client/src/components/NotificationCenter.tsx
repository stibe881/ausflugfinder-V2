/**
 * Notification Center Component
 * Displays notification history and manages read status
 * Features a bell icon with unread count
 */

import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Users, MapPin, Loader2 } from 'lucide-react';
import { usePushNotifications, type Notification } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export const NotificationCenter = () => {
  const {
    notifications,
    markNotificationAsRead,
    isLoadingNotifications,
    refetchNotifications,
  } = usePushNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Auto-refetch notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetchNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'friend_accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'nearby_trip':
        return <MapPin className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get notification title based on type
  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'friend_request':
        return 'Freundschaftsanfrage';
      case 'friend_accepted':
        return 'Freund akzeptiert';
      case 'nearby_trip':
        return 'Ausflug in der Nähe';
      default:
        return 'System';
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);

    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate based on type
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    for (const notification of notifications) {
      if (!notification.isRead) {
        await markNotificationAsRead(notification.id);
      }
    }
    refetchNotifications();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg"
          title="Benachrichtigungen"
        >
          <Bell className="w-5 h-5" />

          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 max-h-96 p-0">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
          <div>
            <DropdownMenuLabel className="p-0 mb-1">Benachrichtigungen</DropdownMenuLabel>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unreadCount} ungelesen
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-xs h-6"
            >
              Alles lesen
            </Button>
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Notifications List */}
        <ScrollArea className="h-80">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Keine Benachrichtigungen</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'p-4 cursor-pointer transition-colors hover:bg-accent',
                    !notification.isRead && 'bg-blue-50 dark:bg-blue-950'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="mt-1 flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {getNotificationTypeLabel(notification.type)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(new Date(notification.createdAt))}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator className="m-0" />

        {/* Footer */}
        <div className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              // Navigate to full notification history page (can be implemented later)
              setIsOpen(false);
            }}
          >
            Alle Benachrichtigungen
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Format timestamp to relative time
 */
function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'gerade eben';
  if (diffMins < 60) return `vor ${diffMins}m`;
  if (diffHours < 24) return `vor ${diffHours}h`;
  if (diffDays < 7) return `vor ${diffDays}d`;

  return date.toLocaleDateString('de-CH');
}

export type NotificationCenterProps = object;
