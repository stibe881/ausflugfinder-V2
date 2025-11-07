import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Trash2, ArrowLeft, Loader2, UserPlus, MapPin, Plane } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function Friends() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [newFriendEmail, setNewFriendEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Demo friends data
  const [friends, setFriends] = useState([
    {
      id: 1,
      name: "Max Müller",
      email: "max.mueller@example.com",
      shared_trips: 3,
      shared_destinations: 5,
      avatar: "👨"
    },
    {
      id: 2,
      name: "Anna Schmidt",
      email: "anna.schmidt@example.com",
      shared_trips: 2,
      shared_destinations: 4,
      avatar: "👩"
    },
    {
      id: 3,
      name: "Peter Weber",
      email: "peter.weber@example.com",
      shared_trips: 1,
      shared_destinations: 2,
      avatar: "👨‍🦱"
    }
  ]);

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
      toast.error("Bitte geben Sie eine E-Mail-Adresse ein");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const newFriend = {
        id: friends.length + 1,
        name: newFriendEmail.split("@")[0],
        email: newFriendEmail,
        shared_trips: 0,
        shared_destinations: 0,
        avatar: "👤"
      };

      setFriends([...friends, newFriend]);
      toast.success("Freund hinzugefügt!");
      setNewFriendEmail("");
      setIsAddOpen(false);
    } catch (error) {
      toast.error("Fehler beim Hinzufügen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFriend = (id: number) => {
    if (confirm("Möchtest du diesen Freund wirklich löschen?")) {
      setFriends(friends.filter(f => f.id !== id));
      if (selectedFriend?.id === id) {
        setSelectedFriend(null);
      }
      toast.success("Freund gelöscht!");
    }
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
            <CardTitle>Anmeldung erforderlich</CardTitle>
            <CardDescription>
              Du musst angemeldet sein, um deine Freunde zu verwalten.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button variant="outline">Zurück</Button>
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
                  Zurück
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Meine Freunde
                </h1>
              </div>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md">
                  <Plus className="w-4 h-4" />
                  Freund hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-border">
                <form onSubmit={handleAddFriend}>
                  <DialogHeader>
                    <DialogTitle className="text-card-foreground">Freund hinzufügen</DialogTitle>
                    <DialogDescription>
                      Geben Sie die E-Mail-Adresse eines Freundes ein
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">E-Mail-Adresse</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="freund@example.com"
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
                      Abbrechen
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Hinzufügen...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Hinzufügen
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Friends List */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Freundesliste ({friends.length})</h2>
            <div className="space-y-2">
              {friends.length > 0 ? (
                friends.map((friend) => (
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
                    <p className="text-muted-foreground text-sm">Keine Freunde hinzugefügt</p>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">Gemeinsame Ausflüge</p>
                        <p className="text-2xl font-bold text-primary">
                          {friendDetails[selectedFriend.id]?.trips?.length || 0}
                        </p>
                      </div>
                      <div className="bg-background/50 rounded-lg p-3">
                        <p className="text-sm text-muted-foreground">Gemeinsame Destinationen</p>
                        <p className="text-2xl font-bold text-secondary">
                          {friendDetails[selectedFriend.id]?.destinations?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shared Trips */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    Gemeinsame Ausflüge ({friendDetails[selectedFriend.id]?.trips?.length || 0})
                  </h3>
                  <div className="space-y-2">
                    {friendDetails[selectedFriend.id]?.trips?.length ? (
                      friendDetails[selectedFriend.id].trips.map((trip) => (
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
                          <p className="text-muted-foreground text-sm">Noch keine gemeinsamen Ausflüge</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Shared Destinations */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Gemeinsame Destinationen ({friendDetails[selectedFriend.id]?.destinations?.length || 0})
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {friendDetails[selectedFriend.id]?.destinations?.length ? (
                      friendDetails[selectedFriend.id].destinations.map((dest) => (
                        <Badge key={dest.id} variant="outline" className="justify-center py-2 text-sm">
                          <span className="block text-center w-full">
                            {dest.name}<br/>
                            <span className="text-xs text-muted-foreground">{dest.location}</span>
                          </span>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm col-span-2">Noch keine gemeinsamen Destinationen</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <Card className="bg-muted/50 border-dashed border-2 h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Wähle einen Freund aus, um Details zu sehen</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
