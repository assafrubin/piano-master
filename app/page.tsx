import MusicPracticeApp from "@/components/music-practice-app"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-8">Music Note Recognition & Practice</h1>
        <MusicPracticeApp />
      </div>
    </main>
  )
}

