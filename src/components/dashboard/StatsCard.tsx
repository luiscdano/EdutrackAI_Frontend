import Card from "../ui/Card";

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle: string;
};

const StatsCard = ({
  title,
  value,
  subtitle,
}: StatsCardProps) => {
  return (
    <Card
      variant="elevated"
      padding="md"
      className="h-full"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-slate-400">
          {title}
        </h3>

        <p className="text-3xl font-bold text-white">
          {value}
        </p>

        <p className="text-sm text-slate-500">
          {subtitle}
        </p>
      </div>
    </Card>
  );
};

export default StatsCard;