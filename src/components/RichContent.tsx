import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function RichContent({ data }: { data?: SerializedEditorState | null }) {
  return data ? (
    <div className="prose">
      <RichText data={data} />
    </div>
  ) : null
}
