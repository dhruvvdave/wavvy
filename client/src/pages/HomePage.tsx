import { useState } from 'react';
import AudioPlayer from '../components/AudioPlayer/AudioPlayer';
import Visualizer from '../components/Visualizer/Visualizer';
import DirectURLPlayer from '../components/UI/DirectURLPlayer';
import SpotifySearch from '../components/Spotify/SpotifySearch';

type AudioSourceTab = 'upload' | 'spotify' | 'url';

export default function HomePage() {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [activeTab, setActiveTab] = useState<AudioSourceTab>('upload');

  const tabs: { id: AudioSourceTab; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'spotify', label: 'Spotify' },
    { id: 'url', label: 'URL' },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <section className="text-center py-10 md:py-14">
        <h1 className="text-4xl md:text-6xl font-semibold text-white/90 tracking-tight">Wavvy</h1>
        <p className="mt-3 text-sm md:text-base text-sky-100/70">Minimal audio visual studio</p>
      </section>

      <Visualizer audioElement={audioElement} />

      <section className="mx-auto max-w-4xl rounded-2xl border border-sky-200/15 bg-gradient-to-b from-sky-500/10 via-sky-900/10 to-black/20 backdrop-blur-xl overflow-hidden">
        <div className="grid grid-cols-3 gap-2 p-2 border-b border-sky-200/10">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-sky-300/20 text-sky-50 border border-sky-200/30'
                    : 'text-sky-100/60 hover:bg-sky-200/10 hover:text-sky-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 md:p-6">
          {activeTab === 'upload' && <AudioPlayer onAudioElement={setAudioElement} />}
          {activeTab === 'spotify' && <SpotifySearch />}
          {activeTab === 'url' && <DirectURLPlayer onAudioElement={setAudioElement} />}
        </div>
      </section>
    </div>
  );
}
