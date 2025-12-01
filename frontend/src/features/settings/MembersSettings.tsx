import type { Member } from "@/apis/schemas";
import { TileViewer } from "../TileViewer";
import { useEffect, useState } from "react";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { ButtonField, SearchField } from "@/components/Fields";
import { MemberEditor } from "../editors/MemberEditor";

export function MembersSettings() {

    const data = useStashData();
    const [localMembers, setLocalMembers] = useState<Member[]>(Array.from(data.members.values()));

    const [filteredMembers, setFilteredMembers] = useState<Member[]>(localMembers);

    const [showEditor, setShowEditor] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string>("");
    
    useEffect(() => {
        setLocalMembers(Array.from(data.members.values()));
        setFilteredMembers(Array.from(data.members.values()));
    }, [data.members]);

    return (
        <div>
            {data.loadingContext ? (
                <p className="text-text text-center w-full">Loading...</p>
            ) : (
                <div className="flex flex-col gap-3 p-2">
                    <SearchField<Member>
                        arr={localMembers}
                        setFilteredArr={setFilteredMembers}
                        getName={(member) => member.nickname}
                        placeholder="Search members by nickname..."
                        loading={data.loadingMembers}
                    />

                    <TileViewer<Member>
                        items={filteredMembers}
                        pageLimit={5}
                        renderTile={({ item }) => {
                            const debtSum = Object.values(item.debts).map(v => Number(v) || 0).reduce((a, b) => a + b, 0);

                            return (
                                <div key={item.id} className={`p-4 rounded-2xl flex flex-row justify-between items-center text-text-alt border-2 border-border bg-foreground ${item.is_active ? "hover:bg-accent/20 hover:border-accent hover:text-text transition-all duration-200" : ""}`}>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h3 className="text-xl text-text font-semibold flex flex-row gap-2 items-center">{item.nickname} {item.is_admin && <span className="text-xs bg-accent px-1.5 py-1 rounded-md">Admin</span>}</h3>
                                        <p className="text-sm font-normal">Joined on {new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col gap-1 justify-center">
                                        <h3 className="text-sm font-thin">Debt: ${debtSum}</h3>
                                    </div>
                                    <div className="flex flex-row gap-2 justify-center items-center">
                                        <ButtonField
                                            onClick={() => {
                                                setEditingMemberId(item.id);
                                                setShowEditor(true);
                                            }}
                                            className="px-3 py-2 border-2 border-border text-text hover:bg-accent/20 hover:border-accent/80 hover:text-text"
                                            loading={data.loadingMembers}
                                        >
                                            Edit
                                        </ButtonField>

                                        <ButtonField
                                            onClick={() => {
                                                alert("Feature coming soon!");
                                            }}
                                            className={`px-3 py-2 border-2  bg-transparent ${item.is_active ? "border-danger text-danger hover:bg-danger" : "border-warning text-warning hover:bg-warning"} hover:text-text`}
                                            loading={data.loadingMembers}
                                        >
                                            {item.is_active ? "Revoke Access" : "Restore Access"}
                                        </ButtonField>


                                    </div>
                                </div>
                            );
                        }}
                    />

                    <MemberEditor
                        showEditor={showEditor}
                        setShowEditor={setShowEditor}
                        memberId={editingMemberId}
                    />
                </div>

            )}
        </div>
    );
};