import { useAuth } from "@/_core/hooks/useAuth";
import { useI18n } from "@/contexts/i18nContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Trash2, ArrowLeft, Loader2, UserPlus, MapPin, Plane, Mail, MessageCircle, Check, X } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Friends() {
  const { t } = useI18n();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch accepted friends
  const { data: acceptedFriendsData, isLoading: isLoadingAccepted } = trpc.push.getFriends.useQuery(
    { status: "accepted" },
    { enabled: isAuthenticated }
  );

  // Fetch pending requests (received)
  const { data: pendingRequestsData, isLoading: isLoadingPending } = trpc.push.getFriends.useQuery(
    { status: "pending" },
    { enabled: isAuthenticated }
  );

  // tRPC mutations
  const sendFriendRequestMutation = trpc.push.sendFriendRequest.useMutation();
  const acceptFriendRequestMutation = trpc.push.acceptFriendRequest.useMutation();

  const friends = acceptedFriendsData?.friends || [];
  const pendingRequests = (pendingRequestsData?.friends || []).filter(
    (f: any) => f.requestedBy !== user?.id
  );
  const pendingInvitations = (pendingRequestsData?.friends || []).filter(
    (f: any) => f.requestedBy === user?.id
  );

  // Demo friend details
  const friendDetails: Record<number, { trips: any[]; destinations: any[] }> = {
    1: {
      trips: [
        { id: 1, title: "Alpenüberquerung", destination: "Schweiz", date: "2024-08-15" },
        { id: 2, title: "Schwarzwaldwanderung", destination: "Deutschland", date: "2024-06-10" },
        { id: 3, title: "Bodenseereise", destination: "Deutschland", date: "2024-05-20" }
      ],
      destinations: [
        { id: 1, name: "Interlaken", location: "Schweiz" },
        { id: 2, name: "Zermatt", location: "Schweiz" },
        { id: 3, name: "Schwarzwald", location: "Deutschland" },
        { id: 4, name: "Konstanz", location: "Deutschland" },
        { id: 5, name: "Liechtenstein", location: "Liechtenstein" }
      ]
    },
    2: {
      trips: [
        { id: 4, title: "Gardasee Abenteuer", destination: "Italien", date: "2024-07-01" },
        { id: 5, title: "Dolomiten Trekking", destination: "Italien", date: "2024-09-05" }
      ],
      destinations: [
        { id: 6, name: "Gardasee", location: "Italien" },
        { id: 7, name: "Verona", location: "Italien" },
        { id: 8, name: "Bozen", location: "Italien" },
        { id: 9, name: "Trient", location: "Italien" }
      ]
    },
    3: {
      trips: [
        { id: 6, title: "Jurassic Park Tour", destination: "Frankreich", date: "2024-10-12" }
      ],
      destinations: [
        { id: 10, name: "Juragebirge", location: "Frankreich" },
        { id: 11, name: "Besançon", location: "Frankreich" }
      ]
    }
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendEmail.trim()) {
      toast.error(t("friends.emailRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, we need to get the user ID from email
      // This would require a lookup endpoint - for demo, we'll show an error
      // In production, you'd have a user search/lookup feature

      toast.error("Benutzersuche nach E-Mail ist nicht implementiert. Verwende bitte die Friend-ID oder einen anderen Mechanismus.");

      /* TODO: Implement proper user lookup by email
      const response = await sendFriendRequestMutation.mutateAsync({
        toUserId: userId
      });

      if (response.success) {
        toast.success(t("friends.requestSent"));
        setNewFriendEmail("");
        setIsAddOpen(false);
      }
      */
    } catch (error) {
      toast.error(t("friends.addError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFriend = (id: number) => {
    if (confirm(t("friends.deleteConfirm"))) {
      // TODO: Implement friend deletion via API
      toast.error("Freund löschen ist noch nicht implementiert");
    }
  };

  const handleAcceptRequest = async (requestFromUserId: number) => {
    try {
      await acceptFriendRequestMutation.mutateAsync({
        fromUserId: requestFromUserId
      });
      toast.success(t("friends.requestAccepted"));
    } catch (error) {
      toast.error("Fehler beim Akzeptieren der Anfrage");
    }
  };

  const handleDeclineRequest = async (requestFromUserId: number) => {
    // TODO: Implement decline functionality
    toast.error("Anfrage ablehnen ist noch nicht implementiert");
  };

  const handleInviteViaEmail = (friendEmail: string) => {
    const subject = encodeURIComponent(t("friends.emailSubject"));
    const body = encodeURIComponent(t("friends.emailBody"));
    window.location.href = `mailto:${friendEmail}?subject=${subject}&body=${body}`;
  };

  const handleInviteViaWhatsApp = (friendEmail: string) => {
    const message = encodeURIComponent(t("friends.whatsappMessage"));
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleDeleteInvitation = (invitationId: number) => {
    if (confirm(t("friends.deleteInviteConfirm") || "Are you sure?")) {
      setPendingInvitations(pendingInvitations.filter(i => i.id !== invitationId));
      toast.success(t("friends.invitationDeleted") || "Invitation removed");
    }
  };

  const handleRemindInvitation = (email: string) => {
    handleInviteViaEmail(email);
    toast.success(t("friends.reminderSent") || "Reminder sent!");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 border-2">
          <CardHeader>
            <CardTitle>{t("friends.loginRequired")}</CardTitle>
            <CardDescription>
              {t("friends.loginDesc")}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button variant="outline">{t("friends.back")}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-lg bg-card/80 sticky top-0 z-50 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10">
                  <ArrowLeft className="w-4 h-4" />
                  {t("friends.back")}
                </Button>
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">Meine Freunde</h1>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="w-4 h-4" />
                  {t("friends.addFriendBtn")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border">
                <form onSubmit={handleAddFriend}>
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">{t("friends.addFriendTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("friends.addFriendDesc")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">{t("friends.emailLabel")}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("friends.emailPlaceholder")}
                        value={newFriendEmail}
                        onChange={(e) => setNewFriendEmail(e.target.value)}
                        required
                        className="bg-background border-input"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddOpen(false)}
                      disabled={isSubmitting}
                    >
                      {t("friends.cancel")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("friends.adding")}
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t("friends.add")}
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Sent Invitations Section */}
        {pendingInvitations.length > 0 && (
          <div className="mb-8 p-4 md:p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
            <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              {t("friends.sentInvitations") || "Gesendete Einladungen"} ({pendingInvitations.length})
            </h2>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <Card key={invitation.id} className="bg-white dark:bg-card border-blue-200 dark:border-blue-800">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 w-full">
                        <span className="text-2xl flex-shrink-0">{invitation.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm md:text-base truncate">{invitation.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{invitation.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-start sm:justify-end">
                        <Button
                          onClick={() => handleRemindInvitation(invitation.email)}
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs md:text-sm"
                          title="Send reminder"
                        >
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="hidden md:inline">{t("friends.remind") || "Erinnern"}</span>
                        </Button>
                        <Button
                          onClick={() => handleDeleteInvitation(invitation.id)}
                          variant="destructive"
                          size="sm"
                          className="gap-1 text-xs md:text-sm"
                          title="Delete invitation"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden md:inline">{t("friends.delete") || "Löschen"}</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests Section (RECEIVED) */}
        {pendingRequests.length > 0 && (
          <div className="mb-8 p-4 md:p-6 bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
            <h2 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-600" />
              {t("friends.pendingRequests")} ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-white dark:bg-card border-amber-200 dark:border-amber-800">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 w-full">
                        <span className="text-2xl flex-shrink-0">👤</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm md:text-base truncate">Benutzer #{request.friendId}</p>
                          <p className="text-xs text-muted-foreground truncate">Freundschaftsanfrage erhalten</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-start sm:justify-end">
                        <Button
                          onClick={() => handleAcceptRequest(request.friendId)}
                          disabled={acceptFriendRequestMutation.isPending}
                          variant="default"
                          size="sm"
                          className="gap-1 text-xs md:text-sm bg-green-600 hover:bg-green-700"
                        >
                          {acceptFriendRequestMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          <span className="hidden md:inline">{t("friends.accept")}</span>
                        </Button>
                        <Button
                          onClick={() => handleDeclineRequest(request.friendId)}
                          variant="destructive"
                          size="sm"
                          className="gap-1 text-xs md:text-sm"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Friends List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">{t("friends.friendsList")} ({friends.length})</h2>
            <div className="space-y-2">
              {friends.length > 0 ? (
                friends?.map((friend) => (
                  <Card
                    key={friend.id}
                    className={`cursor-pointer border-2 transition-all ${
                      selectedFriend?.id === friend.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{friend.avatar}</span>
                          <div>
                            <p className="font-semibold text-sm">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFriend(friend.id);
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-muted/50 border-dashed border-2">
                  <CardContent className="pt-6 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-muted-foreground text-sm">{t("friends.noFriends")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Friend Details */}
          <div className="lg:col-span-2">
            {selectedFriend ? (
              <div className="space-y-6">
                {/* Friend Info */}
                <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{selectedFriend.avatar}</span>
                      <div>
                        <CardTitle className="text-2xl">{selectedFriend.name}</CardTitle>
                        <CardDescription>{selectedFriend.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">{t("friends.sharedTrips")}</p>
                        <p className="text-2xl font-bold text-primary">
                          {friendDetails[selectedFriend.id]?.trips?.length || 0}
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">{t("friends.sharedDestinations")}</p>
                        <p className="text-2xl font-bold text-secondary">
                          {friendDetails[selectedFriend.id]?.destinations?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleInviteViaEmail(selectedFriend.email)}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        {t("friends.inviteEmail")}
                      </Button>
                      <Button
                        onClick={() => handleInviteViaWhatsApp(selectedFriend.email)}
                        variant="outline"
                        className="flex-1 gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {t("friends.inviteWhatsApp")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Shared Trips */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    {t("friends.sharedTripsTitle")} ({friendDetails[selectedFriend.id]?.trips?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {friendDetails[selectedFriend.id]?.trips?.length ? (
                      friendDetails[selectedFriend.id]?.trips?.map((trip) => (
                        <Card key={trip.id} className="border-border hover:border-primary/50">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{trip.title}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {trip.destination} • {trip.date}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Card className="bg-muted/50 border-dashed border-2">
                        <CardContent className="pt-6 text-center">
                          <p className="text-muted-foreground text-sm">{t("friends.noSharedTrips")}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Shared Destinations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    {t("friends.sharedDestinationsTitle")} ({friendDetails[selectedFriend.id]?.destinations?.length || 0})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {friendDetails[selectedFriend.id]?.destinations?.length ? (
                      friendDetails[selectedFriend.id]?.destinations?.map((dest) => (
                        <Badge key={dest.id} variant="outline" className="justify-center py-2 text-sm">
                          <span className="block text-center w-full">
                            {dest.name}<br/>
                            <span className="text-xs text-muted-foreground">{dest.location}</span>
                          </span>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm col-span-2">{t("friends.noSharedDestinations")}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-muted/50 border-dashed border-2 h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">{t("friends.selectFriend")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
