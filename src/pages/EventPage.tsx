import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EventBackdrop } from '@/components/game/EventBackdrop';
import { GameStage } from '@/components/game/GameStage';
import { ResultScreen } from '@/components/game/ResultScreen';
import { formatDate } from '@/components/game/VoucherCard';
import { WelcomeScreen } from '@/components/game/WelcomeScreen';
import { BrandMark } from '@/components/ui/Brand';
import { Button, ButtonLink } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Misc';
import { useAsync } from '@/hooks/useAsync';
import { data } from '@/services/data';
import { localISODate } from '@/services/dates';
import { sound } from '@/services/sound';
import type { EventConfig, Voucher } from '@/types/event';
import type { GameResult } from '@/types/game';

type Screen = 'welcome' | 'playing' | 'result';

function liveState(ev: EventConfig): 'upcoming' | 'live' | 'ended' {
  const today = localISODate();
  if (today < ev.startDate) return 'upcoming';
  if (today > ev.endDate) return 'ended';
  return 'live';
}

export default function EventPage() {
  const { slug = '' } = useParams();
  const { data: event, loading, error } = useAsync(() => data.getEventBySlug(slug), [slug]);

  if (loading) return <PageLoader />;
  if (error || !event) {
    return (
      <div className="grid min-h-[100dvh] place-items-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-slate-400">This QR code or link may have expired.</p>
          <ButtonLink to="/" variant="secondary" className="mt-6">
            Go to EventVerse
          </ButtonLink>
        </div>
      </div>
    );
  }
  return <EventExperience key={event.id} event={event} />;
}

function EventExperience({ event }: { event: EventConfig }) {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [round, setRound] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [previousVoucher, setPreviousVoucher] = useState<Voucher | null>(null);
  const [status, setStatus] = useState<'saving' | 'done' | 'error'>('saving');
  const [previewAnyway, setPreviewAnyway] = useState(false);
  const session = useRef<Promise<string> | null>(null);
  const play = useRef<Promise<string> | null>(null);

  const state = liveState(event);
  const available = state === 'live' || (previewAnyway && event.environment === 'demo');

  useEffect(() => {
    document.title = `${event.brandName} · Catch the Gift`;
  }, [event.brandName]);

  // Count the visit once the event is open to play.
  useEffect(() => {
    if (!available || session.current) return;
    session.current = data.registerVisit(event);
    session.current.catch(() => (session.current = null));
  }, [available, event]);

  const start = () => {
    sound.unlock(); // must happen inside the tap for iOS audio
    const sid = session.current ?? data.registerVisit(event);
    session.current = sid;
    play.current = sid.then((id) => data.startPlay(event, id));
    play.current.catch(() => undefined);
    setResult(null);
    setVoucher(null);
    setRound((r) => r + 1);
    setScreen('playing');
  };

  const finish = async (r: GameResult) => {
    setResult(r);
    setStatus('saving');
    setScreen('result');
    try {
      const sid = await session.current!;
      const pid = await play.current!;
      const v = await data.completePlay(event, sid, pid, r);
      setVoucher(v);
      if (v) setPreviousVoucher(v);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  return (
    <EventBackdrop event={event} particles={screen !== 'playing'} className="min-h-[100dvh]">

      {/* Portrait-first column; on desktop it reads like a phone in the centre of the screen. */}
      <main className="relative mx-auto flex h-[100dvh] max-w-[480px] flex-col sm:py-4">
        <div className="relative flex-1 overflow-y-auto overflow-x-hidden sm:rounded-[2rem] sm:border sm:border-white/10 sm:bg-midnight-950/30 sm:shadow-2xl">
          {!available ? (
            <NotLive event={event} state={state} onPreview={() => setPreviewAnyway(true)} />
          ) : screen === 'welcome' ? (
            <WelcomeScreen event={event} onStart={start} />
          ) : screen === 'playing' ? (
            <GameStage key={round} event={event} onEnd={finish} onQuit={() => setScreen('welcome')} />
          ) : (
            result && (
              <ResultScreen
                event={event}
                result={result}
                voucher={voucher}
                previousVoucher={previousVoucher}
                status={status}
                onReplay={start}
              />
            )
          )}
        </div>
      </main>
    </EventBackdrop>
  );
}

function NotLive({ event, state, onPreview }: { event: EventConfig; state: 'upcoming' | 'ended' | 'live'; onPreview: () => void }) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <BrandMark event={event} size={72} />
      <h1 className="mt-6 text-2xl font-bold">{event.eventName}</h1>
      <p className="mt-2 text-slate-300">
        {state === 'upcoming' ? `The game opens on ${formatDate(event.startDate)}.` : `This event ended on ${formatDate(event.endDate)}. Thanks for playing!`}
      </p>
      {event.environment === 'demo' && (
        <Button variant="secondary" className="mt-8" onClick={onPreview}>
          Preview anyway (demo)
        </Button>
      )}
      <Link to="/" className="mt-6 text-sm text-slate-400 underline-offset-4 hover:underline">
        Powered by EventVerse
      </Link>
    </div>
  );
}
