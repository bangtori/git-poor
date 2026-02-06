import type { PropsWithChildren } from 'react';

interface DefaultCardProps {
  title: string;
}

const DefaultCard = ({
  children,
  title = '',
}: PropsWithChildren<DefaultCardProps>) => {
  return (
    <div className="w-full">
      {title.length > 0 ? (
        <h2 className="mb-4 text-xl text-text-primary font-bold">{title}</h2>
      ) : undefined}
      <div className="card bg-background-card rounded-2xl p-6 border border-border shadow-xl">
        {children}
      </div>
    </div>
  );
};

export default DefaultCard;
