interface RequiresDatabaseHookProps {
  feature: string;
}

export default function RequiresDatabaseHook({ feature }: RequiresDatabaseHookProps) {
  return (
    <div className="bg-[#0f172a]/40 border border-dashed border-gray-700 rounded-xl p-4 text-center">
      <div className="w-8 h-8 rounded-full bg-gray-700/30 flex items-center justify-center mx-auto mb-2">
        <div className="w-4 h-4 flex items-center justify-center text-gray-600">
          <i className="ri-database-2-line text-sm"></i>
        </div>
      </div>
      <p className="text-xs text-gray-600 font-medium">{feature}</p>
      <p className="text-[10px] text-gray-700 mt-0.5">Requires database hook</p>
    </div>
  );
}