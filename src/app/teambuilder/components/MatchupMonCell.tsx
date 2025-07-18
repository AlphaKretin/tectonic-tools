import { nullBattleState } from "@/app/data/battleState";
import { PartyPokemon } from "@/app/data/types/PartyPokemon";
import { uniq } from "@/app/data/util";
import ImageFallback from "@/components/ImageFallback";
import TypeBadge, { TypeBadgeElementEnum } from "@/components/TypeBadge";

export default function MatchupMonCell({ c, useMoves }: { c: PartyPokemon; useMoves: boolean }) {
    return (
        <th className={`p-1 border border-gray-600 ${useMoves ? "w-20" : ""}`}>
            <div className="flex flex-col items-center">
                <ImageFallback
                    src={c.species.getIcon(c.form)}
                    alt={c.species.getFormName(c.form) ?? c.species.name}
                    title={c.species.getFormName(c.form) ?? c.species.name}
                    className="w-15 h-15"
                    height={64}
                    width={64}
                />
                <TypeBadge
                    types={
                        useMoves
                            ? uniq(c.moves.filter((m) => m.isAttackingMove()).map((m) => m.getType(c, nullBattleState)))
                            : [c.types.type1, c.types.type2]
                    }
                    element={TypeBadgeElementEnum.ICONS}
                    widthHeight={20}
                />
            </div>
        </th>
    );
}
