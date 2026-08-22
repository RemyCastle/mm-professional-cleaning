import { aboutLines } from "@/lib/public"

export function AboutLines({ text }: { text: string }) {
  return (
    <div className="mt-6 max-w-xl space-y-3 text-xl font-medium">
      {aboutLines(text).map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}
