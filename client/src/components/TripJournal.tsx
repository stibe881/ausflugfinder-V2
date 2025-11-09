import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface JournalEntry {
  id: number;
  content: string;
  entryDate: Date;
  mood?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TripJournalProps {
  tripId: number;
  entries: JournalEntry[];
  onRefresh: () => void;
}

const MOOD_OPTIONS = [
  { value: "happy", label: "😊 Glücklich", color: "bg-yellow-100 text-yellow-700" },
  { value: "excited", label: "🤩 Aufgeregt", color: "bg-orange-100 text-orange-700" },
  { value: "relaxed", label: "😌 Entspannt", color: "bg-green-100 text-green-700" },
  { value: "tired", label: "😴 Müde", color: "bg-blue-100 text-blue-700" },
  { value: "adventurous", label: "🏔️ Abenteuerlustig", color: "bg-purple-100 text-purple-700" },
  { value: "grateful", label: "🙏 Dankbar", color: "bg-pink-100 text-pink-700" },
];

export function TripJournal({ tripId, entries, onRefresh }: TripJournalProps) {
  const [showForm, setShowForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    content: "",
    entryDate: new Date().toISOString().split("T")[0],
    mood: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState("");

  const addEntryMutation = trpc.journal.add.useMutation({
    onSuccess: () => {
      toast.success("Tagebucheintrag erstellt");
      setNewEntry({ content: "", entryDate: new Date().toISOString().split("T")[0], mood: "" });
      setShowForm(false);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Erstellen des Eintrags");
    },
  });

  const updateEntryMutation = trpc.journal.update.useMutation({
    onSuccess: () => {
      toast.success("Tagebucheintrag aktualisiert");
      setEditingId(null);
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Aktualisieren des Eintrags");
    },
  });

  const deleteEntryMutation = trpc.journal.delete.useMutation({
    onSuccess: () => {
      toast.success("Tagebucheintrag gelöscht");
      onRefresh();
    },
    onError: (error) => {
      toast.error(error.message || "Fehler beim Löschen des Eintrags");
    },
  });

  const handleAddEntry = async () => {
    if (!newEntry.content.trim()) {
      toast.error("Bitte einen Tagebucheintrag eingeben");
      return;
    }

    addEntryMutation.mutate({
      tripId,
      content: newEntry.content,
      entryDate: new Date(newEntry.entryDate),
      mood: newEntry.mood || undefined,
    });
  };

  const handleUpdateEntry = (id: number) => {
    if (!editContent.trim()) {
      toast.error("Bitte einen Tagebucheintrag eingeben");
      return;
    }

    updateEntryMutation.mutate({
      id,
      content: editContent,
      mood: editMood || undefined,
    });
  };

  const startEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setEditMood(entry.mood || "");
  };

  const getMoodLabel = (mood?: string) => {
    if (!mood) return null;
    const moodOption = MOOD_OPTIONS.find((m) => m.value === mood);
    return moodOption;
  };

  const sortedEntries = [...entries].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Reisetagebuch
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Entries List */}
        {entries.length > 0 && (
          <div className="space-y-4">
            {sortedEntries.map((entry) => {
              const moodOption = getMoodLabel(entry.mood);
              const isEditing = editingId === entry.id;

              return (
                <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(entry.entryDate), "d. MMMM yyyy", { locale: de })}
                        </p>
                        {moodOption && (
                          <span className={`text-xs px-2 py-1 rounded ${moodOption.color}`}>
                            {moodOption.label}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isEditing && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(entry)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEntryMutation.mutate({ id: entry.id })}
                          disabled={deleteEntryMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Tagebucheintrag..."
                        className="min-h-24"
                      />
                      <select
                        value={editMood}
                        onChange={(e) => setEditMood(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background text-foreground"
                      >
                        <option value="">Stimmung (optional)</option>
                        {MOOD_OPTIONS.map((mood) => (
                          <option key={mood.value} value={mood.value}>
                            {mood.label}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateEntry(entry.id)}
                          disabled={updateEntryMutation.isPending}
                          size="sm"
                        >
                          Speichern
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditingId(null)}
                          size="sm"
                        >
                          Abbrechen
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {entry.content}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* No Entries */}
        {entries.length === 0 && !showForm && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Noch keine Einträge</p>
          </div>
        )}

        {/* Add Entry Form */}
        {showForm && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-semibold">Neuer Eintrag</h4>
            <Input
              type="date"
              value={newEntry.entryDate}
              onChange={(e) => setNewEntry({ ...newEntry, entryDate: e.target.value })}
              className="w-full"
            />
            <select
              value={newEntry.mood}
              onChange={(e) => setNewEntry({ ...newEntry, mood: e.target.value })}
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="">Stimmung (optional)</option>
              {MOOD_OPTIONS.map((mood) => (
                <option key={mood.value} value={mood.value}>
                  {mood.label}
                </option>
              ))}
            </select>
            <Textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              placeholder="Schreibe deine Erlebnisse, Gefühle und Erinnerungen..."
              className="min-h-24"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddEntry}
                disabled={addEntryMutation.isPending}
                className="flex-1 gap-2"
              >
                <Plus className="w-4 h-4" />
                Eintrag hinzufügen
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Add Entry Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Neuer Eintrag
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
