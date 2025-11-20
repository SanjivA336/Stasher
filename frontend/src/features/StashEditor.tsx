import { StashAPI } from "@apis/containerApi";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
import type { Member, Stash } from "@/apis/schemas";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { copyToClipboard, getError } from "@/utils/utilities";
import TabGroup from "../components/TabGroup";
import { useStash } from "@/contexts/stash/StashContextValue";

type StashEditorProps = {
    show: boolean;
    setShow: (show: boolean) => void;
};

const StashEditor = ({ show, setShow }: StashEditorProps) => {

    const toast = useToast();
    const { stashId } = useStash();
    const [stash, setStash] = useState<Stash | null>(null);
    const [localStash, setLocalStash] = useState<Stash | null>(null);

    const [members, setMembers] = useState<Member[]>([]);

    const [tab, setTab] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchStash = async () => {
        setLoading(true);
        try {
            const response: Stash = await StashAPI.get(stashId);
            setStash(response);
            setLocalStash(response);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!show) {
            setTab(0);
            return;
        }

        fetchStash();        
    }, [show, stashId]);


    const fetchMembers = async () => {
        if (!stash) {
            toast('danger', 'No stash to load members for.');
            return;
        }

        setLoading(true);
        try {
            const response: Member[] = await StashAPI.get_all_members(stash.id);

            response.sort((a, b) => a.nickname.localeCompare(b.nickname));
            response.sort((a, b) => Number(b.is_admin) - Number(a.is_admin));
            response.sort((a, b) => Number(b.is_active) - Number(a.is_active));

            setMembers(response);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!show) return;

        if (tab === 1) {
            fetchMembers();
        }

    }, [tab]);


    const saveStash = async () => {
        if (!localStash || !stash){
            toast('danger', 'No stash to save edits to.');
            return;
        }

        if (localStash.name.trim() === '') {
            toast('warning', 'Stash name cannot be empty.');
            return;
        }

        if (localStash.address && localStash.address.trim() === '') {
            localStash.address = undefined;
        }

        setLoading(true);
        try {
            const response: Stash = await StashAPI.update({
                id: stash.id,
                name: localStash.name,
                address: localStash.address,
            });
            setStash(response);
            setLocalStash(response);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Modal
                show={show}
                setShow={setShow}
                title={stash ? `Edit Stash: ${stash.name}` : 'Edit Stash'}
                onConfirm={() => saveStash()}
                onCancel={() => setLocalStash(stash)}
            >
                <div className="w-full min-h-96 flex flex-row gap-2">
                    {/* Tab Selector */}
                    <div className="w-1/4 min-h-96 border-r-1 border-border">
                        <TabGroup
                            tab={tab}
                            setTab={setTab}
                            tabs={['General', 'Members', 'Information']}
                            horizontal={false}
                        />
                    </div>

                    {/* Tab Contents */}
                    <div className="w-3/4 overflow-y-auto no-scrollbar">
                        {/* General Tab */}
                        {tab === 0 && (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block mb-1 font-semibold">Stash Name:</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border-2 border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                                        value={localStash?.name || ''}
                                        placeholder=""
                                        onChange={(e) => setLocalStash(localStash ? { ...localStash, name: e.target.value } : null)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-semibold">Stash Address:</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border-2 border-border rounded-xl bg-background text-text focus:outline-none focus:border-accent"
                                        value={localStash?.address || ''}
                                        onChange={(e) => setLocalStash(localStash ? { ...localStash, address: e.target.value } : null)}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-semibold">Delete Stash?</label>
                                    <button
                                        onClick={() => toast('warning', 'Feature coming soon!')}
                                        className="w-full px-4 py-2 rounded-full bg-transparent border-danger border-2 text-danger hover:bg-danger hover:text-text transition-all duration-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Members Tab */}
                        {tab === 1 && (
                            <div className="flex flex-col gap-3">
                                {loading ? (
                                    <p>Loading...</p>
                                ) : members.length === 0 ? (
                                    <p>No members found for this stash.</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {members.map((member) => (
                                            <div key={member.id} className={`p-4 rounded-2xl flex flex-row justify-between border-2 ${member.is_active ? 'border-border bg-foreground hover:bg-accent hover:border-accent text-text' : 'border-transparent bg-transparent hover:bg-foreground hover:border-border text-alt'} transition-all duration-200`}>
                                                <div className="flex flex-col gap-1 justify-center">
                                                    <h3 className="text-xl text-text font-semibold">{member.nickname}&nbsp; {member.is_admin && <span className="text-sm font-normal text-text bg-accent/70 rounded-full px-2">Administrator</span>}</h3>
                                                    <p className="text-sm font-thin">Joined on {member.created_at.substring(0, 10).replace(/-/g, '/')}</p>
                                                </div>
                                                <div className="flex flex-col gap-1 justify-center">
                                                    <h3 className="text-sm font-thin">Unsettled Debt: ${Object.values(member.debts).reduce((acc, curr) => acc + curr, 0).toPrecision(3)}</h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Info (read-only) */}
                        {tab === 2 && (
                            <div className="w-1/2 flex flex-col gap-3">
                                <div className="block font-normal">Join Code: {localStash?.join_code || ''}&nbsp; <button className="border-border border-2 rounded-md p-1 text-sm hover:bg-border transition-all duration-200" onClick={() => {if(copyToClipboard(localStash?.join_code || '')) { toast('success', 'Join code copied to clipboard'); } else { toast('danger', 'Failed to copy join code'); }}}>Copy</button></div>
                                <div className="block font-normal">{localStash?.member_ids.length || 0} Members</div>
                                <div className="block font-normal">{localStash?.storage_ids.length || 0} Storages</div>
                                <div className="block font-normal">{localStash?.label_ids.length || 0} Labels</div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default StashEditor;