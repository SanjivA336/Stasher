import type { Label } from "@/apis/schemas";
import { TileViewer } from "../TileViewer";
import { useEffect, useState } from "react";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { ButtonField, SearchField } from "@/components/Fields";
import { LabelEditor } from "../editors/LabelEditor";
import { LabelCreator } from "../creators/LabelCreator";

export function LabelsSettings() {

    const data = useStashData();
    const [localLabels, setLocalLabels] = useState<Label[]>(Array.from(data.labels.values()));

    const [filteredLabels, setFilteredLabels] = useState<Label[]>(localLabels);

    const [showEditor, setShowEditor] = useState(false);
    const [showCreator, setShowCreator] = useState<boolean>(false);
    const [editingLabelId, setEditingLabelId] = useState<string>("");
    
    useEffect(() => {
        setLocalLabels(Array.from(data.labels.values()));
        setFilteredLabels(Array.from(data.labels.values()));
    }, [data.labels]);

    return (
        <div>
            {data.loadingContext? (
                <p className="text-text text-center w-full">Loading...</p>
            ) : (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex flex-row justify-center items-center gap-2">
                        <SearchField<Label>
                            arr={localLabels}
                            setFilteredArr={setFilteredLabels}
                            getName={(label) => label.name}
                            placeholder="Search labels by name..."
                            loading={data.loadingLabels}
                        />

                        <ButtonField
                            onClick={() => setShowCreator(true)}
                            className="px-4 py-2 rounded-full bg-transparent text-accent border-accent border-2 hover:bg-accent hover:text-text hover:scale-105 transition-all duration-200"
                            loading={data.loadingLabels}
                        >
                            Create
                        </ButtonField>
                    </div>

                    <TileViewer<Label>
                        items={filteredLabels}
                        pageLimit={5}
                        renderTile={({ item }) => {
                            return (
                                <div key={item.id} className="p-4 rounded-2xl flex flex-row justify-between items-center text-text-alt border-2 border-border bg-foreground hover:bg-accent/20 hover:border-accent hover:text-text transition-all duration-200">
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h3 className="text-xl text-text font-semibold flex flex-row gap-2 items-center">{item.name} <span className="text-xs border-2 border-accent text-accent px-1.5 py-1 rounded-md">{item.food_group}</span></h3>
                                        <p className="text-sm font-normal">Joined on {new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h3 className="text-sm font-thin">{item.item_ids.length} Items</h3>
                                        <h3 className="text-sm font-thin">{item.current_quantity} {item.preferred_unit}</h3>
                                    </div>
                                    <div className="flex flex-row gap-2 justify-center items-center">
                                        <ButtonField
                                            onClick={() => {
                                                setEditingLabelId(item.id);
                                                setShowEditor(true);
                                            }}
                                            className="px-3 py-2 border-2 border-border text-text hover:bg-accent/20 hover:border-accent/80 hover:text-text"
                                            loading={data.loadingLabels}
                                        >
                                            Edit
                                        </ButtonField>
                                    </div>
                                </div>
                            );
                        }}
                    />

                    <LabelEditor
                        showEditor={showEditor}
                        setShowEditor={setShowEditor}
                        labelId={editingLabelId}
                    />

                    <LabelCreator
                        showCreator={showCreator}
                        setShowCreator={setShowCreator}
                    />
                </div>

            )}
        </div>
    );
};