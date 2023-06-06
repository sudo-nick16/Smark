import { getItem, Event } from "@smark/common";

const getSmarkEvents = async (): Promise<Event[]> =>
    await getItem<Event[]>("smark_events", [
        {
            type: "create_list",
            data: {
                title: "Home",
            },
        },
    ]);

export default getSmarkEvents;
