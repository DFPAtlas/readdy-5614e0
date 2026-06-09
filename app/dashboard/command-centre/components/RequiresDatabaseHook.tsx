interface RequiresDatabaseHookProps {
  feature: string;
}

export default function RequiresDatabaseHook({ feature }: RequiresDatabaseHookProps) {
  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 border-dashed rounded-xl p-6 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-gray-500">
          <i className="ri-database-2-line"></i>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-400">{feature}</p>
      <p className="text-xs text-gray-600 mt-1">Requires database hook</p>
    </div>
  );
}