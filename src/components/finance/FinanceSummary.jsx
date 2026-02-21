import { formatCurrency } from '../../lib/utils';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';

export default function FinanceSummary({ totalCollected, totalExpenses, pendingFees }) {
  const stats = [
    {
      title: 'Total Collected',
      value: formatCurrency(totalCollected),
      icon: TrendingUp,
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'red',
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(pendingFees),
      icon: Wallet,
      color: 'yellow',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
