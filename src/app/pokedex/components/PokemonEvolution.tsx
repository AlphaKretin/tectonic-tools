import { LoadedEvolution } from "@/app/data/loading/pokemon";
import { Item } from "@/app/data/types/Item";
import { Move } from "@/app/data/types/Move";
import { NTreeNode } from "@/app/data/types/NTreeNode";
import { Pokemon } from "@/app/data/types/Pokemon";
import Image from "next/image";

interface PokemonEvolutionProps {
    pokemon: Record<string, Pokemon>;
    moves: Record<string, Move>;
    items: Record<string, Item>;
    node: NTreeNode<LoadedEvolution>;
    index: number;
    onClick: (evo: Pokemon) => void;
}

class EvolutionDisplay {
    text: string;
    itemImg: string | null;

    constructor(text: string, itemImg: string | null = null) {
        this.text = text;
        this.itemImg = itemImg;
    }
}

const PokemonEvolution: React.FC<PokemonEvolutionProps> = ({ pokemon, moves, items, node, onClick }) => {
    function getEvoDisplay(evo: LoadedEvolution): EvolutionDisplay {
        switch (evo.method) {
            case "Level":
            case "Ninjask":
                return new EvolutionDisplay(`At level ${evo.condition}`);
            case "LevelMale":
                return new EvolutionDisplay(`At level ${evo.condition} if it's male`);
            case "LevelFemale":
                return new EvolutionDisplay(`At level ${evo.condition} if it's female`);
            case "LevelDay":
                return new EvolutionDisplay(`At level ${evo.condition} during the day`);
            case "LevelNight":
                return new EvolutionDisplay(`At level ${evo.condition} during nighttime`);
            case "LevelRain":
                return new EvolutionDisplay(`At level ${evo.condition} while raining`);
            case "LevelDarkInParty":
                return new EvolutionDisplay(`At level ${evo.condition} while a dark type is in the party`);
            case "AttackGreater":
                return new EvolutionDisplay(`At level ${evo.condition} if it has more attack than defense`);
            case "AtkDefEqual":
                return new EvolutionDisplay(`At level ${evo.condition} if it has attack equal to defense`);
            case "DefenseGreater":
                return new EvolutionDisplay(`At level ${evo.condition} if it has more defense than attack`);
            case "Silcoon":
                return new EvolutionDisplay(`At level ${evo.condition} half of the time`);
            case "Cascoon":
                return new EvolutionDisplay(`At level ${evo.condition} the other half of the time`);
            case "Ability0":
                return new EvolutionDisplay(`At level ${evo.condition} if it has its first ability`);
            case "Ability1":
                return new EvolutionDisplay(`At level ${evo.condition} if it has its second ability`);
            case "Happiness":
                return new EvolutionDisplay("Case leveled up while it has high happiness");
            case "MaxHappiness":
                return new EvolutionDisplay("Case leveled up while it has maximum happiness");
            case "Beauty":
                return new EvolutionDisplay("Case leveled up while it has maximum beauty");
            case "HasMove":
                return new EvolutionDisplay(`Case leveled up while it knows the move ${moves[evo.condition].name}`);
            case "HasMoveType":
                return new EvolutionDisplay(`Case leveled up while it knows a move of the ${evo.condition} type`);
            case "Location":
                return new EvolutionDisplay("Case leveled up near a special location");
            case "Item":
                return new EvolutionDisplay(`${items[evo.condition].name}`, evo.condition);
            case "ItemMale":
                return new EvolutionDisplay(`By using a ${items[evo.condition].name} if it's male`, evo.condition);
            case "ItemFemale":
                return new EvolutionDisplay(`By using a ${items[evo.condition].name} if it's female`, evo.condition);
            case "Trade":
                return new EvolutionDisplay("Case traded");
            case "TradeItem":
                return new EvolutionDisplay(`Case traded holding an ${items[evo.condition].name}`, evo.condition);
            case "HasInParty":
                return new EvolutionDisplay(`Case leveled up while a ${pokemon[evo.condition]} is also in the party`);
            case "Shedinja":
                return new EvolutionDisplay("Also if you have an empty Poké Ball and party slot");
            case "Originize":
                return new EvolutionDisplay(`At level ${evo.condition} via Origin Ore`, "ORIGINORE");
            default:
                return new EvolutionDisplay("Via a method the programmer was too lazy to describe");
        }
    }

    const evoDisplay = getEvoDisplay(node.getData());
    return (
        <>
            {node.isRoot() ? (
                <></>
            ) : (
                <div className="text-center">
                    <div>{node.isRoot() ? "" : "➡"}</div>
                    {evoDisplay.itemImg == null ? (
                        <></>
                    ) : (
                        <Image
                            src={items[evoDisplay.itemImg].getImage()}
                            alt={evoDisplay.itemImg}
                            height="48"
                            width="48"
                            className="size-9 mr-1 inline"
                        />
                    )}
                    <span>{evoDisplay.text}</span>
                </div>
            )}
            <div
                className="text-center hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer"
                onClick={() => onClick(pokemon[node.getData().pokemon])}
            >
                <Image
                    src={pokemon[node.getData().pokemon].getImage()}
                    alt={node.getData().pokemon}
                    height="160"
                    width="160"
                    className="w-24 h-24"
                />
                <span>{pokemon[node.getData().pokemon].name}</span>
            </div>
        </>
    );
};
export default PokemonEvolution;
