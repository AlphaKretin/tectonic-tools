import Link from "next/link";
import { JSX, ReactNode, SVGProps } from "react";
import BuilderIcon from "./svg_icons/BuilderIcon";
import CalcsIcon from "./svg_icons/CalcsIcon";
import HomeIcon from "./svg_icons/HomeIcon";
import PokeballIcon from "./svg_icons/PokeballIcon";

export enum PageType {
    Home,
    Pokedex,
    Builder,
    Calc,
}

export default function PageHeader({ currentPage }: { currentPage: PageType }): ReactNode {
    function HeaderButton({
        type,
        url,
        icon,
        text,
    }: {
        type: PageType;
        url: string;
        icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
        text: string;
    }) {
        return (
            <Link
                href={url}
                className={`my-auto px-4 py-2 text-xl text-white hover:text-amber-200 ${
                    type == currentPage ? "border-b-2" : ""
                }`}
            >
                <span>
                    {icon({ className: "inline", width: 25, height: 25 })}
                    <span className="hidden sm:inline ml-1">{text}</span>
                </span>
            </Link>
        );
    }

    return (
        <>
            <nav className="w-full flex justify-around sm:justify-center bg-white/10 border-b border-white/25">
                <HeaderButton type={PageType.Home} url="../" icon={HomeIcon} text={"Tectonic Tools"} />
                <HeaderButton type={PageType.Calc} url="/damagecalc" icon={CalcsIcon} text={"Calculator"} />
                <HeaderButton type={PageType.Pokedex} url="/pokedex" icon={PokeballIcon} text={"Pokédex"} />
                <HeaderButton type={PageType.Builder} url="/teambuilder" icon={BuilderIcon} text={"Builder"} />
            </nav>
        </>
    );
}
