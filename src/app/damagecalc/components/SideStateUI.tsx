import { SideState } from "@/app/data/battleState";
import Checkbox from "@/components/Checkbox";
import { ReactNode, useState } from "react";

export default function SideStateUI({ onUpdate }: { onUpdate: (sideState: SideState) => void }): ReactNode {
    const [reflect, setReflect] = useState<boolean>(false);
    const [lightScreen, setLightScreen] = useState<boolean>(false);
    const [auroraVeil, setAuroraVeil] = useState<boolean>(false);

    function callOnUpdate(): void {
        onUpdate({ reflect: reflect, lightScreen: lightScreen, auroraVeil: auroraVeil });
    }

    return (
        <div className="flex gap-2 mb-2">
            <Checkbox
                checked={reflect}
                onChange={() => {
                    setReflect(!reflect);
                    callOnUpdate();
                }}
            >
                Reflect
            </Checkbox>
            <Checkbox
                checked={lightScreen}
                onChange={() => {
                    setLightScreen(!lightScreen);
                    callOnUpdate();
                }}
            >
                Light Screen
            </Checkbox>
            <Checkbox
                checked={auroraVeil}
                onChange={() => {
                    setAuroraVeil(!auroraVeil);
                    callOnUpdate();
                }}
            >
                Aurora Veil
            </Checkbox>
        </div>
    );
}
