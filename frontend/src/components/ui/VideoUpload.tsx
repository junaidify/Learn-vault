import { useCallback, useState, useRef } from 'react';

interface Props {
  onFile: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  currentFileName?: string;
}

export default function VideoUpload({ onFile, accept = 'video/*', maxSizeMB = 500, currentFileName }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(currentFileName ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File must be smaller than ${maxSizeMB} MB.`);
        return;
      }
      if (!file.type.startsWith('video/')) {
        setError('Please upload a video file.');
        return;
      }
      setFileName(file.name);
      onFile(file);
    },
    [maxSizeMB, onFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all"
        style={{
          borderColor: dragOver ? 'var(--color-brand-500)' : 'var(--color-surface-200)',
          background: dragOver ? 'var(--color-brand-50)' : 'var(--color-surface-50)',
        }}
      >
        {/* Upload icon */}
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{ background: 'var(--color-brand-50)' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-500)"
               strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>

        {fileName ? (
          <>
            <p className="text-sm font-semibold" style={{ color: 'var(--color-brand-700)' }}>
              {fileName}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
              Click or drag to replace
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium" style={{ color: 'var(--color-surface-800)' }}>
              <span style={{ color: 'var(--color-brand-600)' }}>Click to upload</span> or drag and drop
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--color-surface-800)', opacity: 0.5 }}>
              Video files up to {maxSizeMB} MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
