import InlineLink from "@/components/InlineLink";
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
                <ToolLink url="/teambuilder" title="Team Builder">
                    Build a team of six and see their strengths and weaknesses
                </ToolLink>
                <ToolLink url="/tracker" title="Encounter Tracker">
                    Track encounters through the game
                </ToolLink>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
                    <p>
                        Created by <InlineLink url="https://www.alphakretin.com">LunaFlare</InlineLink> and{" "}
                        <InlineLink url="https://github.com/AlphaKretin/tectonic-tools/graphs/contributors">
                            contributors
                        </InlineLink>
                        .
                    </p>
                    <p>Not affiliated with Nintendo or The Pokémon Company.</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
