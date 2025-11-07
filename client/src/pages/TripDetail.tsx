import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, MapPin, Users, MessageSquare, Plus, Trash2, Check, X, Clock, Loader2, Share2, Copy, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function TripDetail() {
  const params = useParams();
  const tripId = params.id ? parseInt(params.id) : 0;
  const { user } = useAuth();
  const [participantDialog, setParticipantDialog] = useState(false);
  const [shareDialog, setShareDialog] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [participantData, setParticipantData] = useState({ name: "", email: "" });

  const { data: trip, isLoading: tripLoading } = trpc.trips.getById.useQuery({ id: tripId });
  const { data: participants, refetch: refetchParticipants } = trpc.participants.list.useQuery({ tripId });
  const { data: comments, refetch: refetchComments } = trpc.comments.list.useQuery({ tripId });

  const addParticipantMutation = trpc.participants.add.useMutation({
    onSuccess: () => {
      toast.success("Teilnehmer hinzugefügt!");
      refetchParticipants();
      setParticipantDialog(false);
      setParticipantData({ name: "", email: "" });
    },
  });

  const deleteParticipantMutation = trpc.participants.delete.useMutation({
    onSuccess: () => {
      toast.success("Teilnehmer entfernt!");
      refetchParticipants();
    },
  });

  const updateStatusMutation = trpc.participants.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert!");
      refetchParticipants();
    },
  });

  const addCommentMutation = trpc.comments.add.useMutation({
    onSuccess: () => {
      toast.success("Kommentar hinzugefügt!");
      refetchComments();
      setCommentText("");
    },
  });

  const deleteCommentMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Kommentar gelöscht!");
      refetchComments();
    },
  });

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    addParticipantMutation.mutate({
      tripId,
      ...participantData,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate({
        tripId,
        content: commentText,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ongoing": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "completed": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "cancelled": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-600";
      case "pending": return "bg-yellow-500/10 text-yellow-600";
      case "declined": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  if (tripLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Ausflug nicht gefunden</h1>
        <Link href="/trips">
          <Button>Zurück zur Übersicht</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container max-w-5xl">
        <Link href="/trips">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Button>
        </Link>

        {/* Trip Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{trip.title}</CardTitle>
                <CardDescription className="text-base">{trip.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShareDialog(true)}
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Teilen
                </Button>
                <Badge className={getStatusColor(trip.status)} variant="outline">
                  {trip.status === "planned" && "Geplant"}
                  {trip.status === "ongoing" && "Laufend"}
                  {trip.status === "completed" && "Abgeschlossen"}
                  {trip.status === "cancelled" && "Abgesagt"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Destination</div>
                  <div className="font-medium text-foreground">{trip.destination}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Zeitraum</div>
                  <div className="font-medium text-foreground">
                    {format(new Date(trip.startDate), "dd.MM.yyyy", { locale: de })} - {format(new Date(trip.endDate), "dd.MM.yyyy", { locale: de })}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-xs">Teilnehmer</div>
                  <div className="font-medium text-foreground">{participants?.length || 0} / {trip.participants}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Participants */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Teilnehmer
                </CardTitle>
                {user && (
                  <Dialog open={participantDialog} onOpenChange={setParticipantDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <form onSubmit={handleAddParticipant}>
                        <DialogHeader>
                          <DialogTitle>Teilnehmer hinzufügen</DialogTitle>
                          <DialogDescription>Füge einen neuen Teilnehmer hinzu</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="pname">Name *</Label>
                            <Input
                              id="pname"
                              value={participantData.name}
                              onChange={(e) => setParticipantData({ ...participantData, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pemail">E-Mail</Label>
                            <Input
                              id="pemail"
                              type="email"
                              value={participantData.email}
                              onChange={(e) => setParticipantData({ ...participantData, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="submit" disabled={addParticipantMutation.isPending}>
                            Hinzufügen
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {participants && participants.length > 0 ? (
                <div className="space-y-2">
                  {participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium">{p.name}</div>
                        {p.email && <div className="text-sm text-muted-foreground">{p.email}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getParticipantStatusColor(p.status)} variant="secondary">
                          {p.status === "confirmed" && "Bestätigt"}
                          {p.status === "pending" && "Ausstehend"}
                          {p.status === "declined" && "Abgelehnt"}
                        </Badge>
                        {user && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteParticipantMutation.mutate({ id: p.id })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Noch keine Teilnehmer</p>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Kommentare & Notizen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user && (
                <form onSubmit={handleAddComment} className="mb-4">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Notiz hinzufügen..."
                    rows={2}
                    className="mb-2"
                  />
                  <Button type="submit" size="sm" disabled={addCommentMutation.isPending || !commentText.trim()}>
                    Hinzufügen
                  </Button>
                </form>
              )}
              {comments && comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border bg-muted/30">
                      <p className="text-sm mb-2">{c.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{format(new Date(c.createdAt), "dd.MM.yyyy HH:mm", { locale: de })}</span>
                        {user && user.id === c.userId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteCommentMutation.mutate({ id: c.id })}
                            className="h-6 px-2"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Noch keine Kommentare</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialog} onOpenChange={setShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ausflug teilen</DialogTitle>
              <DialogDescription>
                Teile diesen Ausflug mit Freunden und Familie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  const url = window.location.href;
                  const text = `Schau dir diesen Ausflug an: ${trip?.title}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3"
                onClick={() => {
                  const url = window.location.href;
                  const subject = `Ausflug: ${trip?.title}`;
                  const body = `Hallo,\n\nschau dir diesen Ausflug an:\n\n${trip?.title}\n${trip?.description}\n\n${url}`;
                  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
              >
                <Mail className="w-5 h-5" />
                E-Mail
              </Button>
              <div className="flex gap-2">
                <Input
                  value={window.location.href}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link kopiert!");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
