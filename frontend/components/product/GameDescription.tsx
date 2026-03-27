export function GameDescription({
  title,
  detailedDescription,
  aboutTheGame,
}: {
  title: string;
  detailedDescription: string;
  aboutTheGame: string;
}) {
  return (
    <>
      <h2 className="flex items-center gap-3 font-headline text-lg font-bold uppercase tracking-tight text-on-surface mb-4">
        <span className="text-on-surface-variant">—</span>
        {title}
      </h2>

      <div className="text-sm leading-relaxed text-on-surface-variant">
        <div dangerouslySetInnerHTML={{ __html: detailedDescription }} />
        {aboutTheGame && aboutTheGame !== detailedDescription ? (
          <div className="mt-6" dangerouslySetInnerHTML={{ __html: aboutTheGame }} />
        ) : null}
      </div>
    </>
  );
}
