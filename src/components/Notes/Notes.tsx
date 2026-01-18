import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { IconPlus, IconTrash, IconEdit, IconCheck, IconX, IconPalette } from '@tabler/icons-react';
import { useToast } from '../ui/toast';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  x: number;
  y: number;
  rotation: number;
  createdAt: string;
  updatedAt: string;
}

const STICKY_COLORS = [
  '#FFE066', // Yellow
  '#FFB3BA', // Pink
  '#BAFFC9', // Green
  '#BAE1FF', // Blue
  '#FFFFBA', // Light Yellow
  '#FFDFBA', // Peach
  '#E0BBE4', // Purple
  '#F0E68C', // Khaki
];

export const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Create refs for each note - use a ref to store refs map and keep them stable
  const noteRefsMap = useRef<Record<string, React.RefObject<HTMLDivElement>>>({});
  
  // Get or create ref for a note (called during render but stable)
  const getNoteRef = (id: string): React.RefObject<HTMLDivElement> => {
    if (!noteRefsMap.current[id]) {
      noteRefsMap.current[id] = React.createRef<HTMLDivElement>();
    }
    return noteRefsMap.current[id];
  };

  useEffect(() => {
    const saved = localStorage.getItem('privacy-tools-notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migrate old notes to new format
        const migrated = parsed.map((note: any) => ({
          ...note,
          color: note.color || STICKY_COLORS[0],
          x: note.x || Math.random() * 300 + 50,
          y: note.y || Math.random() * 200 + 50,
          rotation: note.rotation || (Math.random() - 0.5) * 6, // Random rotation between -3 and 3 degrees
        }));
        setNotes(migrated);
      } catch (err) {
        console.error('Failed to load notes:', err);
      }
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('privacy-tools-notes', JSON.stringify(newNotes));
  };

  const createNote = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      // Fallback if canvas ref is not ready
      const x = Math.random() * 400 + 50;
      const y = Math.random() * 300 + 50;
      const newNote: Note = {
        id: Date.now().toString(),
        title: 'New Note',
        content: '',
        color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
        x,
        y,
        rotation: (Math.random() - 0.5) * 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...notes, newNote];
      saveNotes(updated);
      setSelectedNote(newNote);
      setIsEditing(true);
      setEditTitle(newNote.title);
      setEditContent(newNote.content);
      showToast('Note created');
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(10, Math.random() * Math.max(100, rect.width - 250));
    const y = Math.max(10, Math.random() * Math.max(100, rect.height - 300));

    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
      x,
      y,
      rotation: (Math.random() - 0.5) * 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...notes, newNote];
    saveNotes(updated);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    showToast('Note created');
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const updated = notes.filter((note) => note.id !== id);
    saveNotes(updated);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
    showToast('Note deleted');
  };

  const handleDragStop = (id: string, _e: DraggableEvent, data: DraggableData) => {
    const updated = notes.map((note) =>
      note.id === id
        ? {
            ...note,
            x: data.x,
            y: data.y,
          }
        : note
    );
    saveNotes(updated);
    if (selectedNote?.id === id) {
      setSelectedNote(updated.find((n) => n.id === id) || null);
    }
  };

  const updateNoteColor = (id: string, color: string) => {
    const updated = notes.map((note) =>
      note.id === id ? { ...note, color, updatedAt: new Date().toISOString() } : note
    );
    saveNotes(updated);
    if (selectedNote?.id === id) {
      setSelectedNote(updated.find((n) => n.id === id) || null);
    }
    setShowColorPicker(null);
    showToast('Color updated');
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setIsEditing(true);
    setEditTitle(note.title);
    setEditContent(note.content);
    setShowColorPicker(null);
  };

  const saveNote = () => {
    if (!selectedNote) return;

    const updated = notes.map((note) =>
      note.id === selectedNote.id
        ? {
            ...note,
            title: editTitle || 'Untitled Note',
            content: editContent,
            updatedAt: new Date().toISOString(),
          }
        : note
    );
    saveNotes(updated);
    setSelectedNote(updated.find((n) => n.id === selectedNote.id) || null);
    setIsEditing(false);
    showToast('Note saved');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    }
  };

  return (
    <div className="w-full max-w-[100vw] mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Sticky Notes</h2>
          <p className="text-muted-foreground">Create, arrange, and organize your notes</p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={createNote}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold cursor-pointer flex items-center gap-2"
          >
            <IconPlus className="w-5 h-5" />
            New Note
          </button>
          <p className="text-sm text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasRef}
          className="relative w-full bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-dashed border-border overflow-hidden"
          style={{ minHeight: '600px', height: 'calc(100vh - 300px)' }}
        >
          {notes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <IconPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold">No notes yet</p>
                <p className="text-sm mt-2">Click "New Note" to create your first sticky note!</p>
              </div>
            </div>
          ) : (
            notes.map((note) => {
              const nodeRef = getNoteRef(note.id);
              return (
                <Draggable
                  key={note.id}
                  nodeRef={nodeRef}
                  position={{ x: note.x, y: note.y }}
                  onStop={(e, data) => handleDragStop(note.id, e, data)}
                  bounds="parent"
                >
                  <div
                    ref={nodeRef}
                    className={`absolute cursor-move group ${
                      selectedNote?.id === note.id ? 'z-50' : 'z-10'
                    }`}
                    style={{
                      transform: `rotate(${note.rotation}deg)`,
                    }}
                    onClick={() => {
                      if (!isEditing) {
                        setSelectedNote(note);
                        setEditTitle(note.title);
                        setEditContent(note.content);
                      }
                    }}
                  >
                  {/* Sticky Note */}
                  <div
                    className="w-64 p-4 shadow-lg transition-all hover:shadow-xl"
                    style={{
                      backgroundColor: note.color,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-800 flex-1 truncate">
                        {note.title || 'Untitled'}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowColorPicker(showColorPicker === note.id ? null : note.id);
                          }}
                          className="p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
                          title="Change color"
                        >
                          <IconPalette className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(note);
                          }}
                          className="p-1 hover:bg-black/10 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <IconEdit className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={(e) => deleteNote(note.id, e)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <IconTrash className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="text-sm text-gray-700 line-clamp-6 whitespace-pre-wrap">
                      {note.content || 'Click to edit...'}
                    </div>

                    {/* Color Picker */}
                    {showColorPicker === note.id && (
                      <div className="absolute top-12 right-2 bg-white rounded-lg shadow-xl p-2 z-50 border border-border">
                        <div className="grid grid-cols-4 gap-2">
                          {STICKY_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateNoteColor(note.id, color);
                              }}
                              className="w-8 h-8 rounded border-2 border-gray-300 hover:scale-110 transition-transform cursor-pointer"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  </div>
                </Draggable>
              );
            })
          )}
        </div>

        {/* Edit Modal */}
        {selectedNote && isEditing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              style={{ backgroundColor: selectedNote.color }}
            >
              <div className="flex items-center justify-between mb-4">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title..."
                  className="flex-1 px-4 py-2 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary font-semibold text-lg text-gray-800"
                />
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={saveNote}
                    className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer"
                    title="Save"
                  >
                    <IconCheck className="w-5 h-5" />
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your note here..."
                className="w-full h-96 p-4 rounded-lg bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-gray-800"
              />
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <IconPalette className="w-5 h-5 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">Color:</span>
                  <div className="flex gap-2">
                    {STICKY_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateNoteColor(selectedNote.id, color)}
                        className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 cursor-pointer ${
                          selectedNote.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
