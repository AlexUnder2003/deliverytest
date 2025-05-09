import React, { createContext, ReactNode, useContext, useState } from 'react';

export type FileItem = { uri: string; name: string };

type MediaContextValue = {
  mediaFiles: FileItem[];
  addFile: (file: FileItem) => void;
  updateFile: (idx: number, name: string) => void;
};

const MediaContext = createContext<MediaContextValue | null>(null);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [mediaFiles, setMediaFiles] = useState<FileItem[]>([]);

  const addFile = (file: FileItem) =>
    setMediaFiles((cur) => [...cur, file]);

  const updateFile = (idx: number, name: string) =>
    setMediaFiles((cur) =>
      cur.map((f, i) => (i === idx ? { ...f, name } : f))
    );

  return (
    <MediaContext.Provider value={{ mediaFiles, addFile, updateFile }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error('useMedia must be inside MediaProvider');
  return ctx;
}
