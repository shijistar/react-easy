import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useAudioPlayer } from '../../../src/hooks';

const meta: Meta = {
  title: 'Hooks/useAudioPlayer',
  component: useAudioPlayer,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function UseAudioPlayerDemo() {
    const { play, stop, setAudioUrl } = useAudioPlayer();
    const [url, setUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <label htmlFor="audio-url">Audio URL:</label>
        <input
          id="audio-url"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginLeft: '10px', width: '300px' }}
        />
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => {
              setAudioUrl(url);
              play();
            }}
            style={{ marginRight: '10px' }}
          >
            Play
          </button>
          <button onClick={stop}>Stop</button>
        </div>
      </div>
    );
  },
};
