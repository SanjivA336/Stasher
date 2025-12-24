import { FoodGroup, type Label } from "@/apis/schemas";
import { SearchField, Spinner } from "@/components/Fields";
import Navbar from "@/components/Navbar";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { LabelCreator } from "@/features/creators/LabelCreator";
import { LabelTileRenderer, TileViewer } from "@/features/TileViewer";
import { getError } from "@/utils/utilities";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LabelsPage() {

    const data = useStashData();
    const toast = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);

    const [isFiltering, setIsFiltering] = useState<boolean>(false);
    const [filteredLabels, setFilteredLabels] = useState<Label[]>([]);

    const [showLabelCreator, setShowLabelCreator] = useState<boolean>(false);

    const openLabel = async (labelId: string) => {
        setLoading(true);
        try {
            navigate(`/labels/${labelId}`);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text mb-20">
            <Navbar />
            <h1 className="text-4xl font-bold"><span className="text-accent">{data.stash.name}</span> - Labels</h1>

            <h2 className="text-xl font-semibold text-center">You can manage your labels here.</h2>

            <div className="flex flex-row justify-center gap-3">
                <button
                    onClick={() => setShowLabelCreator(true)}
                    className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                >
                    Create a New Label
                </button>
            </div>

            {loading ? (
                <Spinner />
            ) : data.labels.size === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any labels for you.</p>
                    <p className="text-text">Why not create one?</p>
                </div>
            ) : (
                <div className="flex flex-col w-3/4 gap-5 justify-center items-center align-middle content-center">
                    <SearchField
                        arr={Array.from(data.labels.values())}
                        setFilteredArr={setFilteredLabels}
                        getName={(label: Label) => label.name}
                        setIsFiltering={setIsFiltering}
                        placeholder="Search labels..."
                    />

                    {isFiltering ? (
                        <div className="w-full">
                            <TileViewer
                                items={filteredLabels}
                                renderTile={LabelTileRenderer}
                                style="list"
                                pageLimit={8}
                                onClick={openLabel}
                            />
                        </div>
                    ) : (
                        Object.values(FoodGroup).map((group) => {
                            const labelsInGroup = Array.from(data.labels.values()).filter(label => label.food_group === group);
                            if (labelsInGroup.length === 0) return null;

                            return (
                                <div key={group} className="w-full">
                                    <h3 className="text-2xl font-semibold mb-3 text-center">{group}</h3>
                                    <TileViewer
                                        items={labelsInGroup}
                                        renderTile={LabelTileRenderer}
                                        style="carousel"
                                        pageLimit={6}
                                        onClick={openLabel}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            )}
                

            <LabelCreator
                showCreator={showLabelCreator}
                setShowCreator={setShowLabelCreator}
            />

        </div>
    );
}
