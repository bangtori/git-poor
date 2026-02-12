interface GroupHeaderProps {
  title: string;
  penalty: string;
}
export default function GroupHeader({ title, penalty }: GroupHeaderProps) {
  return (
    <div className="w-full text-text-primary flex flex-col gap-1">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="text-sm">
        <p className="text-text-secondary">커밋 안하면?</p>
        <p className="text-danger">{penalty}</p>
      </div>
    </div>
  );
}
