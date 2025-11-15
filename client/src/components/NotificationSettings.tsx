/**
 * Notification Settings Component
 * Allows users to configure push notification preferences
 */

import { useState, useEffect } from 'react';
import { usePushNotifications, type PushNotificationSettings } from '@/hooks/usePushNotifications';
import { useLocation } from '@/hooks/useLocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MapPinOff,
} from 'lucide-react';
import { toast } from 'sonner';

export const NotificationSettings = () => {
  const {
    settings,
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    updateSettings,
    isLoadingSettings,
  } = usePushNotifications();

  const { isTracking, startTracking, stopTracking } = useLocation();

  const [isSaving, setIsSaving] = useState(false);

  const defaultSettings: PushNotificationSettings = {
    notificationsEnabled: true,
    friendRequestNotifications: true,
    friendRequestAcceptedNotifications: true,
    nearbyTripNotifications: true,
    nearbyTripDistance: 5000,
    locationTrackingEnabled: true,
  };

  const [localSettings, setLocalSettings] = useState<PushNotificationSettings>(
    settings || defaultSettings
  );

  // Sync local settings with fetched settings
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleToggleSetting = async (
    key: 'notificationsEnabled' | 'friendRequestNotifications' | 'friendRequestAcceptedNotifications' | 'nearbyTripNotifications' | 'locationTrackingEnabled',
    value: boolean
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    setIsSaving(true);
    try {
      const success = await updateSettings({ [key]: value });
      if (!success) {
        toast.error('Fehler beim Speichern der Einstellungen');
        setLocalSettings(settings);
      } else {
        toast.success('Einstellungen gespeichert');
      }
    } catch (err) {
      toast.error('Fehler beim Speichern der Einstellungen');
      setLocalSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDistanceChange = async (value: number[]) => {
    const newDistance = value[0];
    setLocalSettings((prev) => ({
      ...prev,
      nearbyTripDistance: newDistance,
    }));

    setIsSaving(true);
    try {
      const success = await updateSettings({ nearbyTripDistance: newDistance });
      if (!success) {
        toast.error('Fehler beim Speichern der Entfernung');
        setLocalSettings(settings);
      } else {
        toast.success(`Entfernung auf ${formatDistance(newDistance)} gesetzt`);
      }
    } catch (err) {
      toast.error('Fehler beim Speichern der Entfernung');
      setLocalSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubscribePush = async () => {
    setIsSaving(true);
    try {
      console.log('Attempting to subscribe to push notifications...');
      const success = await subscribe();
      console.log('Subscribe result:', success);

      if (success) {
        toast.success('Push-Benachrichtigungen aktiviert');
      } else {
        toast.error('Fehler beim Aktivieren von Push-Benachrichtigungen');
      }
    } catch (err) {
      console.error('Error in handleSubscribePush:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      toast.error(`Fehler: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribePush = async () => {
    setIsSaving(true);
    try {
      const success = await unsubscribe();
      if (success) {
        toast.success('Push-Benachrichtigungen deaktiviert');
      } else {
        toast.error('Fehler beim Deaktivieren von Push-Benachrichtigungen');
      }
    } catch (err) {
      toast.error('Fehler beim Deaktivieren von Push-Benachrichtigungen');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLocationTracking = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      console.log('Toggling location tracking:', enabled);

      if (enabled) {
        console.log('Starting real-time location tracking...');
        const success = await startTracking(); // Real-time tracking (no interval)
        console.log('startTracking result:', success);

        if (success) {
          console.log('Updating settings to enable location tracking...');
          await updateSettings({ locationTrackingEnabled: true });
          toast.success('Echtzeit-Standort-Tracking gestartet');
        } else {
          toast.error('Fehler beim Starten des Standort-Tracking');
        }
      } else {
        console.log('Stopping location tracking...');
        stopTracking();
        console.log('Updating settings to disable location tracking...');
        await updateSettings({ locationTrackingEnabled: false });
        toast.success('Standort-Tracking gestoppt');
      }
    } catch (err) {
      console.error('Error in handleLocationTracking:', err);
      const errorMsg = err instanceof Error ? err.message : 'Unbekannter Fehler';
      toast.error(`Fehler: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Benachrichtigungseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Benachrichtigungseinstellungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Push-Benachrichtigungen werden von deinem Browser nicht unterstützt. Bitte verwende einen modernen Browser wie Chrome, Firefox oder Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Push Notifications Setting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push-Benachrichtigungen
          </CardTitle>
          <CardDescription>
            Verwalte deine Push-Benachrichtigungen und Einstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Push Subscription Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-semibold">
                Push-Benachrichtigungen abonnieren
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {isSubscribed
                  ? 'Du erhältst Push-Benachrichtigungen auf diesem Gerät'
                  : 'Aktiviere Push-Benachrichtigungen für dieses Gerät'}
              </p>
            </div>
            {isSubscribed ? (
              <Button
                onClick={handleUnsubscribePush}
                disabled={isSaving}
                variant="outline"
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Abmelden'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubscribePush}
                disabled={isSaving}
                size="sm"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Abonnieren'
                )}
              </Button>
            )}
          </div>

          {isSubscribed && (
            <>
              {/* Notification Types */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">
                  Benachrichtigungstypen
                </h3>

                {/* Main Toggle */}
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">
                      Alle Benachrichtigungen
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Aktiviere oder deaktiviere alle Benachrichtigungen
                    </p>
                  </div>
                  <Switch
                    checked={localSettings?.notificationsEnabled ?? true}
                    onCheckedChange={(value) =>
                      handleToggleSetting('notificationsEnabled', value)
                    }
                    disabled={isSaving}
                  />
                </div>

                {/* Friend Request Notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <Users className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <Label className="text-sm font-medium">
                        Freundschaftsanfragen
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Benachrichtigungen bei neuen Freundschaftsanfragen
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      localSettings?.friendRequestNotifications ?? true
                    }
                    onCheckedChange={(value) =>
                      handleToggleSetting('friendRequestNotifications', value)
                    }
                    disabled={isSaving || !localSettings?.notificationsEnabled}
                  />
                </div>

                {/* Friend Accepted Notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <Label className="text-sm font-medium">
                        Freundschaften akzeptiert
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Benachrichtigungen wenn jemand deine Anfrage akzeptiert
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      localSettings?.friendRequestAcceptedNotifications ?? true
                    }
                    onCheckedChange={(value) =>
                      handleToggleSetting(
                        'friendRequestAcceptedNotifications',
                        value
                      )
                    }
                    disabled={isSaving || !localSettings?.notificationsEnabled}
                  />
                </div>

                {/* Nearby Trip Notifications */}
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <MapPin className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <Label className="text-sm font-medium">
                        Ausflüge in der Nähe
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Benachrichtigungen wenn ein Ausflug in der Nähe ist
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={
                      localSettings?.nearbyTripNotifications ?? true
                    }
                    onCheckedChange={(value) =>
                      handleToggleSetting('nearbyTripNotifications', value)
                    }
                    disabled={isSaving || !localSettings?.notificationsEnabled}
                  />
                </div>
              </div>

              {/* Distance Threshold */}
              {localSettings?.nearbyTripNotifications && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm font-semibold">
                      Entfernung für Benachrichtigungen
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Du wirst benachrichtigt, wenn ein Ausflug innerhalb dieser
                      Entfernung liegt
                    </p>
                  </div>

                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Slider
                        value={[localSettings?.nearbyTripDistance ?? 5000]}
                        onValueChange={handleDistanceChange}
                        min={100}
                        max={100000}
                        step={500}
                        disabled={isSaving}
                        className="w-full"
                      />
                    </div>
                    <div className="min-w-fit">
                      <span className="text-sm font-medium whitespace-nowrap">
                        {formatDistance(
                          localSettings?.nearbyTripDistance ?? 5000
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {[1000, 5000, 10000, 50000].map((distance) => (
                      <button
                        key={distance}
                        onClick={() => handleDistanceChange([distance])}
                        disabled={isSaving}
                        className={`text-xs py-1 px-2 rounded border transition-colors ${
                          (localSettings?.nearbyTripDistance ?? 5000) ===
                          distance
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary'
                        }`}
                      >
                        {formatDistance(distance)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Location Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Standort-Tracking
          </CardTitle>
          <CardDescription>
            Aktiviere Standort-Tracking für genaue Benachrichtigungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Standort-Tracking wird regelmäßig deine GPS-Koordinaten an die
              Server senden. Dies verbraucht Batterie und Datenvolumen.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-semibold">
                Aktives Standort-Tracking
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {isTracking
                  ? 'Dein Standort wird aktiv verfolgt'
                  : 'Standort-Tracking ist deaktiviert'}
              </p>
            </div>
            <Button
              onClick={() =>
                handleLocationTracking(!isTracking)
              }
              disabled={isSaving}
              variant={isTracking ? 'destructive' : 'default'}
              size="sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isTracking ? (
                <>
                  <MapPinOff className="w-4 h-4 mr-2" />
                  Stoppen
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 mr-2" />
                  Starten
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted rounded-lg">
            <p>
              <strong>Standort-Daten:</strong> Werden in Echtzeit aktualisiert
            </p>
            <p>
              <strong>Genauigkeit:</strong> Nutzt hochgenaue GPS-Koordinaten
            </p>
            <p>
              <strong>Hintergrund:</strong> Läuft im Hintergrund wenn aktiviert
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Format distance in meters to km or m
 */
function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(0)} km`;
  }
  return `${meters} m`;
}

export type NotificationSettingsProps = object;
