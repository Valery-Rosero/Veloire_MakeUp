'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  value: string
  onChange: (url: string) => void
  hint?: string
  size?: 'sm' | 'md'
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_INPUT_BYTES = 20 * 1024 * 1024
const MAX_BYTES = 5 * 1024 * 1024
const MAX_DIMENSION = 1600
const WEBP_QUALITY = 0.82

const EXTENSIONS: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/jpeg': 'jpg' }

// Redimensiona a máx. 1600 px por lado y re-codifica a WebP antes de subir: una
// foto de celular de 4–8 MB queda en unos cientos de KB, sin pérdida visible.
// Safari no codifica WebP en canvas (devuelve PNG): en ese caso, o si el
// resultado no pesa menos, se sube el archivo original.
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY))
  return blob && blob.type === 'image/webp' && blob.size < file.size ? blob : file
}

export function ImageUploader({ value, onChange, hint, size = 'md' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  async function handleFile(file: File) {
    if (!ALLOWED.includes(file.type)) {
      setError('Solo JPG, PNG o WebP.')
      return
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError('Máximo 20MB.')
      return
    }
    setError(null)
    setUploading(true)

    const image = await compressImage(file).catch(() => file)
    if (image.size > MAX_BYTES) {
      setError('La imagen sigue pesando más de 5MB después de comprimirla. Prueba con otra.')
      setUploading(false)
      return
    }

    const ext = EXTENSIONS[image.type] ?? 'jpg'
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const supabase = createClient()
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(path, image, { cacheControl: '31536000', contentType: image.type, upsert: false })

    if (uploadError) {
      setError('Error al subir la imagen. Verifica los permisos del bucket.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path)
    onChange(publicUrl)
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const previewSize = size === 'sm' ? 'w-20 h-20' : 'w-32 h-32'

  if (value) {
    return (
      <div className="flex items-start gap-3">
        <div className={`relative ${previewSize} rounded-xl overflow-hidden border border-rim shrink-0`}>
          <Image src={value} alt="Preview" fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-2 justify-center">
          <button
            type="button"
            onClick={() => { onChange(''); setError(null) }}
            className="flex items-center gap-1.5 text-xs font-body text-error hover:opacity-80 transition-opacity"
          >
            <X size={13} />
            Eliminar imagen
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs font-body text-fg-2 hover:text-fg transition-colors"
          >
            <Upload size={13} />
            Cambiar imagen
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        disabled={uploading}
        className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-colors ${
          isDragging
            ? 'border-accent bg-accent/5'
            : 'border-rim hover:border-rim-2 hover:bg-highlight'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {uploading ? (
          <Loader2 size={20} className="text-accent animate-spin" />
        ) : (
          <Upload size={20} className="text-fg-3" />
        )}
        <span className="font-body text-sm text-fg-2">
          {uploading ? 'Subiendo...' : 'Arrastra o haz clic para subir'}
        </span>
        {hint && <span className="font-body text-xs text-fg-3">{hint}</span>}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {error && <p className="text-xs font-body text-error mt-1">{error}</p>}
    </div>
  )
}
