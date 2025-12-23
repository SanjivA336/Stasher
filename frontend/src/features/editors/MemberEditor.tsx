import { MemberAPI } from "@/apis/identityApi";
import { DEFAULT_MEMBER } from "@/apis/default";
import { EventType, type Event, type Member } from "@/apis/schemas";
import { ButtonField, SearchField, Spinner, TextField, ToggleField } from "@/components/Fields";
import Modal from "@/components/Modal";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";
import TabGroup from "@/components/TabGroup";


type MemberEditorProps = {
    showEditor: boolean;
    setShowEditor: (show: boolean) => void;

    memberId: string;
};

export function MemberEditor({ showEditor, setShowEditor, memberId }: MemberEditorProps) {

    const toast = useToast();
    const data = useStashData();

    const [localMember, setLocalMember] = useState<Member>(data.members.get(memberId) || DEFAULT_MEMBER);
    const [loading, setLoading] = useState(false);


    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);


    const [tab, setTab] = useState<number>(0);


    async function fetchMember() {
        setLoading(true);
        try {
            const member: Member | undefined = data.members.get(memberId);
            if (!member){
                throw new Error("Member not found in context");
            }
            setLocalMember(member);
        } catch (error) {
            toast("danger", "Failed to load member: " + getError(error));
        } finally {
            setLoading(false);
        }
    }

    async function fetchEvents() {
        setLoadingEvents(true);
        try {
            const eventsResponse: Event[] = await MemberAPI.get_events(memberId);
            eventsResponse.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            setEvents(eventsResponse);
            setFilteredEvents(eventsResponse);
        } catch (error) {
            toast("danger", "Failed to load member history: " + getError(error));
        } finally {
            setLoadingEvents(false);
        }
    }

    useEffect(() => {
        if (showEditor) {
            fetchMember();
        }
    }, [showEditor]);

    useEffect(() => {
        if (showEditor && tab === 1) {
            fetchEvents();
        }
    }, [showEditor, tab]);

    const saveMember = async () => {
        if (!localMember || loading) return;

        setLoading(true);
        try {
            const response: Member = await MemberAPI.update(localMember);
            toast("success", `Member "${response.nickname}" updated successfully.`);
        } catch (error) {
            toast("danger", "Failed to update member: " + getError(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Member - ${localMember.nickname}`}
            show={showEditor}
            setShow={setShowEditor}
            onConfirm={saveMember}
            onCancel={() => { setLocalMember(data.members.get(memberId) || DEFAULT_MEMBER); }}
            tabs={<TabGroup tab={tab} setTab={setTab} tabs={["General", "Debts", "History"]} />}
        >
            <div className="w-full flex flex-row relative">
                <form className="w-3/4 ps-2  h-full flex flex-grow flex-col gap-2">
                    {tab === 0 && (
                        <>
                            <TextField
                                value={localMember?.nickname || ''}
                                setValue={(value: string) => setLocalMember(prev => ({...prev, nickname: value}))}
                                label="Nickname"
                                disabled={loading}
                            />

                            <div className="flex flex-row gap-2">
                                <ToggleField
                                    value={localMember?.is_admin || false}
                                    setValue={(value: boolean) => setLocalMember(prev => ({...prev, is_admin: value}))}
                                    disabled={loading}
                                >
                                    Administrator Privileges: {localMember?.is_admin ? "Enabled" : "Disabled"}
                                </ToggleField>

                                <ButtonField
                                    onClick={() => { alert("Feature coming soon!"); }}
                                    loading={loading}
                                    className="w-full px-4 py-2 rounded-full border-danger border-2 bg-danger hover:bg-danger/80 hover:text-text transition-all duration-200"
                                >
                                    Delete Member Data
                                </ButtonField>
                            </div>
                        </>
                    )}
                    
                    {tab === 1 && (
                        <>
                            {loading ? (
                                <Spinner />
                            ) : localMember.debts.length === 0 ? (
                                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                                    <p className="text-text text-lg">We couldn't find any debts for this member.</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl flex flex-col gap-2">
                                    <div className="text-lg font-semibold mb-2 rounded-lg border-2 border-border bg-foreground p-4 text-center">
                                        Total Debt: ${Object.values(localMember.debts).reduce((acc, val) => acc + val, 0).toPrecision(3)}
                                    </div>
                                    {Object.entries(localMember.debts).map(([member_id, amount]) => (
                                        <div
                                            key={member_id}
                                            className={`
                                            p-4 gap-2 rounded flex flex-col justify-between text-text-alt border-2 bg-foreground hover:text-text transition-all duration-200
                                            `}
                                        >
                                            <div className="flex flex-row gap-1 justify-between items-start">
                                                <h3 className="text-lg text-text font-semibold">{data.members.get(member_id)?.nickname || "Unknown Member"}</h3>
                                                <h3 className="text-sm font-thin text-nowrap">{amount.toPrecision(3)}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    
                    {tab === 2 && (
                        <>
                            {loadingEvents ? (
                                <Spinner />
                            ) : events.length === 0 ? (
                                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                                    <p className="text-text text-lg">We couldn't find any events for this member.</p>
                                </div>
                            ) : (
                                <div className="w-full max-w-2xl flex flex-col gap-2">
                                    <SearchField<Event>
                                        arr={events}
                                        setFilteredArr={setFilteredEvents}
                                        getName={(event: Event) => event.title}
                                        placeholder="Search by title..."
                                    />
                                    {filteredEvents.map((event: Event) => (
                                        <div
                                            key={event.id}
                                        className={`
                                            p-4 gap-2 rounded-lg flex flex-col justify-between text-text-alt border-2 bg-foreground hover:text-text transition-all duration-200
                                            ${event.type === EventType.INFO ? 'border-info/30 hover:bg-info/20 hover:border-info' : ''}
                                            ${event.type === EventType.WARNING ? 'border-warning/30 hover:bg-warning/20 hover:border-warning' : ''}
                                            ${event.type === EventType.DANGER ? 'border-danger/30 hover:bg-danger/20 hover:border-danger' : ''}
                                            ${event.type === EventType.SUCCESS ? 'border-success/30 hover:bg-success/20 hover:border-success' : ''}
                                            `}
                                        >
                                            <div className="flex flex-row gap-1 justify-between items-start">
                                                <h3 className="text-lg text-text font-semibold">{event.title}</h3>
                                                <div className="flex flex-col gap-1 justify-center">
                                                    <h3 className="text-sm font-thin text-nowrap">{new Date(event.updated_at).toLocaleString()}</h3>
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-1 justify-between items-center">
                                                <p className="text-sm font-normal">{event.message}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </form>
            </div>
        </Modal>
    );
};