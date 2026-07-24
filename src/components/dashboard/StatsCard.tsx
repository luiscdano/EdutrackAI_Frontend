import Card from "../ui/Card";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
}

const StatsCard = ({
  title,
  value,
  subtitle,
}: Props) => (
  <Card padding="md" className="h-full">
    <p className="text-sm font-medium text-muted">{title}</p>
    <p className="mt-2 text-3xl font-bold text-content">
      {value}
    </p>
    {subtitle && (
      <p className="mt-2 text-sm text-muted">{subtitle}</p>
    )}
  </Card>
);

export default StatsCard;
