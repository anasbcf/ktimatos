import { getConversationsAction } from "./actions";
import InboxClient from "./inbox-client";

export const metadata = {
    title: "WhatsApp Inbox | KtimatOS",
    description: "Real-time Omnichannel Dashboard",
};

export default async function InboxPage() {
    // 1. Fetch initial server-side snapshot of conversations
    const initialConversations = await getConversationsAction();

    // 2. Pass to the rich Client Component
    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] w-full bg-zinc-950 text-white overflow-hidden">
            <InboxClient initialConversations={initialConversations} />
        </div>
    );
}
