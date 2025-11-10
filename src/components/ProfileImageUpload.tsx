import { useState, useRef } from 'react'
import { Upload, User, Loader2, X, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

interface ProfileImageUploadProps {
  currentAvatarUrl: string | null
  onUploadComplete: (avatarUrl: string) => void
}

export default function ProfileImageUpload({
  currentAvatarUrl,
  onUploadComplete,
}: ProfileImageUploadProps) {
  const { user } = useAuth()
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Criar canvas para redimensionamento
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Redimensionar para 200x200px
          const targetSize = 200
          canvas.width = targetSize
          canvas.height = targetSize

          // Calcular dimensões para crop central
          const sourceSize = Math.min(img.width, img.height)
          const sourceX = (img.width - sourceSize) / 2
          const sourceY = (img.height - sourceSize) / 2

          // Desenhar imagem redimensionada e cortada
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceSize,
            sourceSize,
            0,
            0,
            targetSize,
            targetSize
          )

          // Converter para blob (JPEG com qualidade 0.9)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error('Failed to create blob'))
              }
            },
            'image/jpeg',
            0.9
          )
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Formato de imagem não suportado. Use JPG, PNG ou WEBP.')
      return
    }

    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      alert('Imagem muito grande. Tamanho máximo: 5MB.')
      return
    }

    try {
      // Redimensionar imagem para 200x200px
      const resizedBlob = await resizeImage(file)
      const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' })
      
      setSelectedFile(resizedFile)

      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(resizedFile)
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error)
      alert('Erro ao processar imagem. Tente novamente.')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Converter para base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedFile)

      reader.onloadend = async () => {
        const base64Data = reader.result as string

        // Simular progresso
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90))
        }, 300)

        try {
          // Usar Edge Function para upload seguro
          const { data, error } = await supabase.functions.invoke('profile-image-upload', {
            body: {
              imageData: base64Data,
              fileName: `avatar-${user.id}-${Date.now()}.jpg`, // Sempre JPEG após redimensionamento
              userId: user.id,
            },
          })

          clearInterval(progressInterval)
          setUploadProgress(100)

          if (error) throw error

          // Atualizar perfil com nova URL
          onUploadComplete(data.publicUrl)
          setSelectedFile(null)

          setTimeout(() => {
            setUploadProgress(0)
          }, 1000)
        } catch (error: any) {
          clearInterval(progressInterval)
          console.error('Erro ao fazer upload:', error)
          alert('Erro ao fazer upload da imagem. Tente novamente.')
          setIsUploading(false)
          setUploadProgress(0)
        }
      }
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
      setIsUploading(false)
      setUploadProgress(0)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setPreviewUrl(currentAvatarUrl)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Formato de imagem não suportado. Use JPG, PNG ou WEBP.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('Imagem muito grande. Tamanho máximo: 5MB.')
      return
    }

    try {
      // Redimensionar imagem para 200x200px
      const resizedBlob = await resizeImage(file)
      const resizedFile = new File([resizedBlob], file.name, { type: 'image/jpeg' })
      
      setSelectedFile(resizedFile)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(resizedFile)
    } catch (error) {
      console.error('Erro ao redimensionar imagem:', error)
      alert('Erro ao processar imagem. Tente novamente.')
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary-50 text-primary-600 rounded-lg">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Foto de Perfil</h2>
          <p className="text-sm text-neutral-600">Atualize sua foto de perfil</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Preview da Imagem */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-40 h-40 rounded-full overflow-hidden bg-neutral-100 border-4 border-neutral-200">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-20 h-20 text-neutral-400" />
                </div>
              )}
            </div>
            {selectedFile && !isUploading && (
              <button
                onClick={handleCancel}
                className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Área de Upload */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <p className="text-sm font-medium text-neutral-700 mb-1">
            Clique para selecionar ou arraste uma imagem
          </p>
          <p className="text-xs text-neutral-500">JPG, PNG ou WEBP (máx. 5MB)</p>
        </div>

        {/* Barra de Progresso */}
        {isUploading && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-neutral-700">Fazendo upload...</p>
              <p className="text-sm font-medium text-neutral-700">{uploadProgress}%</p>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        {selectedFile && !isUploading && (
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              <Check className="w-5 h-5" />
              Salvar Foto
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Informações */}
        <div className="text-xs text-neutral-600 space-y-1">
          <p>✓ Formatos aceitos: JPG, PNG, WEBP</p>
          <p>✓ Tamanho máximo: 5MB</p>
          <p>✓ Redimensionamento automático para 200x200px</p>
          <p>✓ Conversão automática para JPEG (qualidade 90%)</p>
          <p>✓ A imagem será redimensionada automaticamente</p>
        </div>
      </div>
    </div>
  )
}
