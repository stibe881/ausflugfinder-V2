/**
 * WebSocket Debug Page
 * Shows real-time WebSocket connection status and logs
 * Useful for diagnosing connection issues on mobile devices
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Wifi, WifiOff, Zap, Trash2, Copy } from 'lucide-react';
import { Link } from 'wouter';
import { toast } from 'sonner';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'error' | 'success' | 'warning';
  message: string;
}

export default function WebSocketDebug() {
  const { user, isAuthenticated } = useAuth();
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [wsUrl, setWsUrl] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, level: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, level, message }]);
    console.log(`[${level.toUpperCase()}] ${message}`);
  };

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const handleConnect = () => {
    if (!isAuthenticated || !user) {
      addLog('❌ Not authenticated', 'error');
      return;
    }

    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      addLog('⚠️ WebSocket already connected or connecting', 'warning');
      return;
    }

    addLog('🔍 Starting WebSocket connection...', 'info');
    setWsStatus('connecting');

    const token = localStorage.getItem('auth_token');
    if (!token) {
      addLog('❌ No auth token found', 'error');
      setWsStatus('error');
      return;
    }

    const decodedToken = decodeURIComponent(token);
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(decodedToken)}`;

    setWsUrl(url.replace(decodedToken, '***'));
    addLog(`Protocol: ${protocol}`, 'info');
    addLog(`Host: ${window.location.host}`, 'info');
    addLog(`Full URL: ${url.replace(decodedToken, '***')}`, 'info');
    addLog(`Token length: ${decodedToken.length}`, 'info');

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        addLog('✅ WebSocket connected!', 'success');
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'ping') {
            addLog('📍 Received ping from server', 'info');
            ws.send(JSON.stringify({ type: 'pong' }));
            addLog('📤 Sent pong response', 'info');
          } else if (message.type === 'notification') {
            addLog(`🔔 Received notification: ${message.data?.title}`, 'success');
          }
        } catch (err) {
          addLog(`Error processing message: ${err}`, 'error');
        }
      };

      ws.onerror = (event) => {
        const errorMsg = event instanceof Event ? 'Connection failed' : String(event);
        addLog(`❌ WebSocket error: ${errorMsg}`, 'error');
        setWsStatus('error');
      };

      ws.onclose = () => {
        addLog('🔌 WebSocket closed', 'warning');
        setWsStatus('disconnected');
        wsRef.current = null;
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Error creating WebSocket: ${errorMsg}`, 'error');
      setWsStatus('error');
    }
  };

  const handleDisconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      addLog('🔌 Disconnected', 'info');
      setWsStatus('disconnected');
    }
  };

  const handleSendMessage = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog('❌ WebSocket not connected', 'error');
      return;
    }

    const message = { type: 'ping' };
    wsRef.current.send(JSON.stringify(message));
    addLog('📤 Sent ping message', 'info');
  };

  const handleClearLogs = () => {
    setLogs([]);
    addLog('📋 Logs cleared', 'info');
  };

  const handleCopyLogs = () => {
    const logsText = logs.map((log) => `[${log.timestamp}] ${log.message}`).join('\n');
    navigator.clipboard.writeText(logsText);
    toast.success('Logs copied to clipboard');
  };

  const getStatusColor = () => {
    switch (wsStatus) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'connecting':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (wsStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4" />;
      case 'connecting':
        return <Zap className="w-4 h-4 animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusLabel = () => {
    switch (wsStatus) {
      case 'connected':
        return 'Verbunden';
      case 'connecting':
        return 'Verbindung wird hergestellt...';
      case 'error':
        return 'Fehler';
      default:
        return 'Getrennt';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">WebSocket Debug</h1>
          </div>
          <Badge className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-2">{getStatusLabel()}</span>
          </Badge>
        </div>

        {/* Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verbindungsinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">User</p>
              <p className="font-mono text-sm">{user?.name || 'Nicht angemeldet'}</p>
            </div>
            {wsUrl && (
              <div>
                <p className="text-sm text-muted-foreground">WebSocket URL</p>
                <p className="font-mono text-xs break-all">{wsUrl}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontrollen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={handleConnect}
              disabled={wsStatus === 'connected' || wsStatus === 'connecting'}
              className="w-full"
              variant={wsStatus === 'connected' ? 'secondary' : 'default'}
            >
              {wsStatus === 'connected' ? '✅ Verbunden' : 'Verbindung herstellen'}
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={wsStatus !== 'connected'}
              className="w-full"
              variant="destructive"
            >
              Trennen
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={wsStatus !== 'connected'}
              className="w-full"
              variant="outline"
            >
              Ping senden
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card className="flex flex-col h-96">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Debug Logs</CardTitle>
              <CardDescription>Echtzeit-WebSocket-Aktivität</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLogs}
                size="sm"
                variant="outline"
                disabled={logs.length === 0}
              >
                <Copy className="w-4 h-4 mr-1" />
                Kopieren
              </Button>
              <Button
                onClick={handleClearLogs}
                size="sm"
                variant="outline"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Löschen
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto bg-slate-900 text-green-400 p-4 rounded font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-gray-500">Keine Logs vorhanden...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="whitespace-pre-wrap break-words">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span
                    className={
                      log.level === 'error'
                        ? 'text-red-400'
                        : log.level === 'success'
                          ? 'text-green-400'
                          : log.level === 'warning'
                            ? 'text-yellow-400'
                            : 'text-cyan-400'
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </CardContent>
        </Card>

        {/* Debugging Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Debugging Tipps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>✅ Verbunden:</strong> Der WebSocket ist erfolgreich mit dem Server verbunden und kann Daten austauschen.
            </p>
            <p>
              <strong>⚠️ Verbindung wird hergestellt:</strong> Die WebSocket-Verbindung wird derzeit aufgebaut. Bitte warten...
            </p>
            <p>
              <strong>❌ Fehler:</strong> Die WebSocket-Verbindung konnte nicht hergestellt werden. Überprüfe deine Internetverbindung und die Server-Adresse.
            </p>
            <p>
              <strong>Mögliche Probleme:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Netzwerkverbindung unterbrochen</li>
              <li>Falsche Server-Adresse oder Port</li>
              <li>Firewall blockiert WebSocket-Protokoll</li>
              <li>Server nicht erreichbar</li>
              <li>Ungültiger Auth-Token</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
