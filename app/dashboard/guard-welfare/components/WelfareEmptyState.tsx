import GlassCard from '@/app/components/GlassCard';

interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function WelfareEmptyState({ title, description, icon }: Props) {
  return (
    <GlassCard className="p-8">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-3">
          <div className="w-6 h-6 flex items-center justify-center text-gray-400">
            <i className={icon}></i>
          </div>
        </div>
        <h4 className="text-sm font-medium text-white mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </GlassCard>
  );
}