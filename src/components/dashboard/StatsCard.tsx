import Card from "../ui/Card";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatsCard = ({ title, value, subtitle }: Props) => (
  <Card padding="sm" className="h-full">
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted">{title}</p>
    <p className="mt-2 text-2xl font-bold tracking-[-0.02em] text-content">{value}</p>
    {subtitle && <p className="mt-1 text-[11px] text-muted">{subtitle}</p>}
  </Card>
);

export default StatsCard;
