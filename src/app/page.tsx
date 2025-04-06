import type { NextPage } from "next";
import Link from "next/link";

const HomePage: NextPage = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-8">
            <div className="max-w-2xl w-full bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-700">
                <h1 className="text-4xl font-bold text-blue-400 mb-6 text-center">Pokémon Tectonic Tools</h1>

                <div className="space-y-6">
                    <Link
                        href="/damagecalc"
                        className="block p-6 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600 group"
                    >
                        <h2 className="text-2xl font-semibold text-blue-400 group-hover:text-blue-300 mb-2">
                            Damage Calculator
                        </h2>
                        <p className="text-gray-300">
                            A damage calculator using the modified mechanics of Pokémon Tectonic.
                        </p>
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
                    <p>Created by LunaFlare • Not affiliated with Nintendo or The Pokémon Company</p>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
