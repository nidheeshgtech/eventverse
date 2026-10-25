import { ButtonLink } from '@/components/ui/Button';
import { GiftArt } from '@/components/ui/Misc';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-6 text-center">
      <div>
        <GiftArt kind="snowball" size={88} className="mx-auto" />
        <h1 className="mt-6 text-4xl font-bold">Missed that one</h1>
        <p className="mt-2 text-slate-400">This page doesn&apos;t exist.</p>
        <ButtonLink to="/" className="mt-8">
          Back to EventVerse
        </ButtonLink>
      </div>
    </div>
  );
}
