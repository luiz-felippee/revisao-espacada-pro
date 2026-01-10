import { Trophy } from 'lucide-react';

interface AchievementsTabProps {
    achievements: any[];
}

export const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
    return (
        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {achievements.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-500">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhuma conquista desbloqueada ainda.</p>
                    <p className="text-xs">Continue estudando para ganhar!</p>
                </div>
            ) : (
                achievements.map((ach) => (
                    <div key={ach.id} className="bg-slate-900/50 p-4 rounded-xl border border-yellow-500/20 flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-yellow-500/30">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">{ach.title}</h4>
                            <p className="text-[10px] text-slate-400 leading-tight">{ach.description}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
