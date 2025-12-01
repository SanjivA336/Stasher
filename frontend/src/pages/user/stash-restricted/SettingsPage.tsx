import { ButtonField, ScrollspyField, Spinner } from "@/components/Fields";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { LabelsSettings } from "@/features/settings/LabelsSettings";
import { MembersSettings } from "@/features/settings/MembersSettings";
import { StashSettings } from "@/features/settings/StashSettings";
import { StoragesSettings } from "@/features/settings/StoragesSettings";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {

    const data = useStashData();
    const navigate = useNavigate();

    const sections = [
        { label: "Stash Settings", value: "stash-settings" },
        { label: "Member Management", value: "members-settings" },
        { label: "Storage Management", value: "storages-settings" },
        { label: "Label Management", value: "labels-settings" },
    ];

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-midground">
            <div className="w-4/5 flex flex-grow items-start justify-center">
                {data.loadingContext ? (
                    <div className="flex flex-col items-center justify-center">
                        <Spinner size={128} thickness={8} />
                    </div>
                ) : (
                    <>
                        <div className="w-1/5 flex items-center justify-center min-h-screen max-h-screen">
                            <div className="flex flex-col gap-2 fixed my-auto">
                                <ScrollspyField options={sections} offset={20} />
                                <ButtonField
                                    onClick={() => navigate("/")}
                                >
                                    Return to Home
                                </ButtonField>
                            </div>
                        </div>
                        <div className="w-4/5 flex flex-col gap-6 ps-4 border-s-2 border-border" style={{ paddingTop: `${20}px`, paddingBottom: `${window.innerHeight / 1.33}px` }}>
                            <div id="stash-settings" className=" bg-foreground/70 w-full flex flex-col gap-4 max-h-screen border-border border-2 rounded-xl shadow-lg p-3">
                                <h1 className="text-2xl font-bold p-2 border-border border-b-2">Stash Settings</h1>
                                <StashSettings />
                            </div>
                            <div id="members-settings" className="bg-foreground/70 w-full flex flex-col gap-4 max-h-screen border-border border-2 rounded-xl shadow-lg p-3">
                                <h1 className="text-2xl font-bold p-2 border-border border-b-2">Member Management</h1>
                                <MembersSettings />
                            </div>
                            <div id="storages-settings" className="bg-foreground/70 w-full flex flex-col gap-4 max-h-screen border-border border-2 rounded-xl shadow-lg p-3">
                                <h1 className="text-2xl font-bold p-2 border-border border-b-2">Storage Management</h1>
                                <StoragesSettings />
                            </div>
                            <div id="labels-settings" className="bg-foreground/70 w-full flex flex-col gap-4 max-h-screen border-border border-2 rounded-xl shadow-lg p-3">
                                <h1 className="text-2xl font-bold p-2 border-border border-b-2">Label Management</h1>
                                <LabelsSettings />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
