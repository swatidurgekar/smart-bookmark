"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface Bookmark {
    id: string;
    title: string;
    url: string;
}

export default function Dashboard() {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [user, setUser] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setup = async () => {
            const { data } = await supabase.auth.getUser();

            if (!data.user) {
                router.push("/");
                return;
            }

            setUser(data.user);
            fetchBookmarks();

            // REALTIME SUBSCRIPTION
            const channel = supabase
                .channel("bookmarks-realtime")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "bookmarks",
                    },
                    () => {
                        fetchBookmarks();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setup();
    }, [router]);


    const fetchBookmarks = async () => {
        setLoading(true);

        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) setBookmarks(data);

        setLoading(false);
    };


    const addBookmark = async () => {
        if (!title || !url) {
            alert("Title and URL are required");
            return;
        }

        try {
            const validatedUrl = new URL(url);

            await supabase.from("bookmarks").insert([
                {
                    title,
                    url: validatedUrl.toString(),
                    user_id: user.id,
                },
            ]);

            setTitle("");
            setUrl("");
        } catch (error) {
            alert("Please enter a valid URL (including https://)");
        }
    };


    const deleteBookmark = async (id: string) => {
        await supabase.from("bookmarks").delete().eq("id", id);
        fetchBookmarks();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">My Bookmarks</h1>
                <button onClick={handleLogout} className="text-red-500 cursor-pointer">
                    Logout
                </button>
            </div>

            <div className="mb-4">
                <input
                    className="border p-2 w-full mb-2"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    className="border p-2 w-full mb-2"
                    placeholder="URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    onClick={addBookmark}
                    className="bg-white text-black px-4 py-2 rounded cursor-pointer"
                >
                    Add Bookmark
                </button>
            </div>

            <div>
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-700 rounded animate-pulse"
                            ></div>
                        ))}
                    </div>
                ) : bookmarks.length === 0 ? (
                    <div className="text-gray-400 text-center py-10">
                        <p className="text-lg">No bookmarks yet</p>
                        <p className="text-sm mt-2">
                            Add your first bookmark above 🚀
                        </p>
                    </div>
                ) : (
                    bookmarks.map((bookmark) => {
                        const domain = new URL(bookmark.url).hostname;

                        return (
                            <div
                                key={bookmark.id}
                                className="border border-gray-700 bg-gray-800 p-3 mb-2 rounded flex justify-between items-center"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                                        alt="favicon"
                                        className="w-6 h-6 rounded"
                                    />

                                    <div>
                                        <p className="font-semibold text-white">
                                            {bookmark.title}
                                        </p>
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            className="text-blue-400 text-sm"
                                        >
                                            {bookmark.url}
                                        </a>
                                    </div>
                                </div>

                                <button
                                    onClick={() => deleteBookmark(bookmark.id)}
                                    className="text-red-400 hover:text-red-500 cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        );
                    })

                )}
            </div>

        </div>
    );
}
