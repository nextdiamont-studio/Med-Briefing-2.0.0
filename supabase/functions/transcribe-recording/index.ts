// Edge Function: transcribe-recording
// Triggered when a new recording is created
// Downloads audio from Storage, transcribes using Gemini API, saves TXT to Storage

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    user_id: string
    name: string
    audio_url: string
    audio_file_path: string
    status: string
  }
  schema: string
  old_record: null | Record<string, unknown>
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[Transcribe] Function invoked')

    // 1. Parse webhook payload
    const payload: WebhookPayload = await req.json()
    console.log('[Transcribe] Payload:', JSON.stringify(payload))

    // Only process UPDATE events where status changes to 'processing'
    if (payload.type === 'INSERT') {
      console.log('[Transcribe] Skipping INSERT - waiting for manual transcription trigger')
      return new Response(JSON.stringify({ skipped: true, reason: 'INSERT event ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (payload.type !== 'UPDATE') {
      console.log('[Transcribe] Skipping non-UPDATE event')
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const recording = payload.record

    // Only process if status is 'processing'
    if (recording.status !== 'processing') {
      console.log('[Transcribe] Skipping - status is not processing:', recording.status)
      return new Response(JSON.stringify({ skipped: true, reason: 'Not processing status' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if transcription already exists
    if (recording.transcription_url || recording.transcription_text) {
      console.log('[Transcribe] Skipping - transcription already exists')
      return new Response(JSON.stringify({ skipped: true, reason: 'Already transcribed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('[Transcribe] Processing recording:', recording.id)

    // 3. Download audio from Storage
    console.log('[Transcribe] Downloading audio from:', recording.audio_file_path)
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('recordings')
      .download(recording.audio_file_path)

    if (downloadError) {
      throw new Error(`Failed to download audio: ${downloadError.message}`)
    }

    console.log('[Transcribe] Audio downloaded, size:', audioData.size, 'bytes')

    // 4. Convert Blob to ArrayBuffer then to Base64
    const arrayBuffer = await audioData.arrayBuffer()
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    )

    console.log('[Transcribe] Audio converted to base64')

    // 5. Call Gemini API for transcription
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!

    console.log('[Transcribe] Calling Gemini API...')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Transcreva o áudio a seguir em português brasileiro, mantendo toda a pontuação e parágrafos apropriados. Não adicione comentários ou análises, apenas a transcrição literal do que foi dito:',
                },
                {
                  inline_data: {
                    mime_type: 'audio/webm',
                    data: base64Audio,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 8192,
          },
        }),
      }
    )

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text()
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
    }

    const geminiData = await geminiResponse.json()
    const transcriptionText =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    if (!transcriptionText) {
      throw new Error('No transcription returned from Gemini API')
    }

    console.log('[Transcribe] Transcription received, length:', transcriptionText.length)

    // 6. Upload transcription TXT to Storage
    const timestamp = Date.now()
    const sanitizedName = recording.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const transcriptionFileName = `${recording.user_id}/${timestamp}-${sanitizedName}.txt`

    console.log('[Transcribe] Uploading transcription to:', transcriptionFileName)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('transcriptions')
      .upload(transcriptionFileName, transcriptionText, {
        contentType: 'text/plain',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Failed to upload transcription: ${uploadError.message}`)
    }

    console.log('[Transcribe] Transcription uploaded:', uploadData.path)

    // 7. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('transcriptions')
      .getPublicUrl(transcriptionFileName)

    // 8. Update recording in database
    console.log('[Transcribe] Updating recording status...')
    const { error: updateError } = await supabase
      .from('recordings')
      .update({
        transcription_url: publicUrl,
        transcription_text: transcriptionText,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', recording.id)

    if (updateError) {
      throw new Error(`Failed to update recording: ${updateError.message}`)
    }

    console.log('[Transcribe] Recording updated successfully')

    return new Response(
      JSON.stringify({
        success: true,
        recording_id: recording.id,
        transcription_url: publicUrl,
        transcription_length: transcriptionText.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[Transcribe] Error:', error)

    // Try to update recording status to failed
    try {
      const payload: WebhookPayload = await req.json()
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      await supabase
        .from('recordings')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : String(error),
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.record.id)
    } catch (updateError) {
      console.error('[Transcribe] Failed to update error status:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
