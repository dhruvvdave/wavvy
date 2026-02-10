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
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-12">
      <section className="text-center space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-sky-100/50">Wavvy</p>
        <h1 className="text-4xl md:text-6xl font-light text-white/90 tracking-tight">Audio Canvas</h1>
        <p className="text-sm md:text-base text-sky-100/60">Load a source. Press play. Watch it breathe.</p>
      </section>

      <Visualizer audioElement={audioElement} />

      <section className="space-y-6">
        <div className="flex items-center justify-center gap-6 text-xs uppercase tracking-[0.25em] text-sky-100/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b border-sky-200/60'
                  : 'text-sky-100/50 hover:text-sky-100/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          {activeTab === 'upload' && <AudioPlayer onAudioElement={setAudioElement} />}
          {activeTab === 'spotify' && <SpotifySearch />}
          {activeTab === 'url' && <DirectURLPlayer onAudioElement={setAudioElement} />}
        </div>
      </section>
    </div>
  );
}
