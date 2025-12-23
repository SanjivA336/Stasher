import { StashAPI } from "@/apis/containerApi";
import { EventType, type Event } from "@/apis/schemas";
import { SearchField, Spinner } from "@/components/Fields";
import Navbar from "@/components/Navbar";
import { useStashData } from "@/contexts/stash/StashContextValue";
import { useToast } from "@/contexts/toasts/ToastContextValue";
import { getError } from "@/utils/utilities";
import { useEffect, useState } from "react";

export default function HistoryPage() {

    const data = useStashData();
    const toast = useToast();

    const [loading, setLoading] = useState<boolean>(false);


    const [events, setEvents] = useState<Event[]>([]);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response: Event[] = await StashAPI.get_events(data.stash.id);

            const sortedEvents = response.sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });

            setEvents(sortedEvents);
            setFilteredEvents(sortedEvents);
        } catch (error) {
            toast('danger', getError(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchEvents();
    }, [data.stash.id]);

    return (
        <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-background text-text">
            <Navbar />
            <h1 className="text-4xl font-bold"><span className="text-accent">{data.stash.name}</span> - History</h1>

            <h2 className="text-xl font-semibold text-center">You can view your stash's history here.</h2>

            {loading ? (
                <Spinner />
            ) : events.length === 0 ? (
                <div className="w-full max-w-2xl p-4 rounded-2xl flex flex-col text-center justify-center gap-2 border-2 border-dashed border-border/70 bg-foreground/70">
                    <p className="text-text text-lg">We couldn't find any events for you.</p>
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
                                            p-4 gap-2 rounded-lg flex flex-col justify-between text-text-alt border-2 bg-foreground hover:text-text hover:scale-105 transition-all duration-200
                                            ${event.type === EventType.INFO ? 'border-info/30 hover:bg-info/20 hover:border-info' : ''}
                                            ${event.type === EventType.WARNING ? 'border-warning/30 hover:bg-warning/20 hover:border-warning' : ''}
                                            ${event.type === EventType.DANGER ? 'border-danger/30 hover:bg-danger/20 hover:border-danger' : ''}
                                            ${event.type === EventType.SUCCESS ? 'border-success/30 hover:bg-success/20 hover:border-success' : ''}
                                `}
                        >
                            <div className="flex flex-row gap-1 justify-between items-start">
                                <h3 className="text-xl text-text font-semibold">{event.title}</h3>
                                <div className="flex flex-col gap-1 justify-center">
                                    <h3 className="text-sm font-thin text-nowrap">{new Date(event.updated_at).toLocaleString()}</h3>
                                    <h3 className="text-sm font-thin text-nowrap">Edited by: {data.members.get(event.member_id)?.nickname ?? "Unknown Member"}</h3>
                                </div>
                            </div>
                            <div className="flex flex-row gap-1 justify-between items-center">
                                <p className="text-sm font-normal">{event.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
