import { useState } from 'react';
import { sound } from '@/services/sound';
import { Icon } from '../ui/Icon';

export function AudioToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(sound.enabled);
  return (
    <button
      type="button"
      onClick={() => {
        sound.setEnabled(!on);
        setOn(!on);
        if (!on) sound.play('click');
      }}
      aria-pressed={on}
      aria-label={on ? 'Mute sound' : 'Turn sound on'}
      className={`glass grid h-11 w-11 place-items-center rounded-full text-white transition hover:bg-white/10 ${className}`}
    >
      <Icon name={on ? 'sound' : 'mute'} size={20} />
    </button>
  );
}
