import ToolLink from "@/components/ToolLink";
import type { NextPage } from "next";

const HomePage: NextPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
                <h1 className="text-4xl font-bold text-blue-400 mb-6 text-center">Pokémon Tectonic Tools</h1>

                <ToolLink url="/damagecalc" title="Damage Calculator">
                    A damage calculator using the modified mechanics of Pokémon Tectonic
                </ToolLink>
                <ToolLink url="/pokedex" title="Online Pokédex">
                    Information on all of the available Pokémon
                </ToolLink>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
                    <p>Created by LunaFlare • Not affiliated with Nintendo or The Pokémon Company</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
