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
        const { data } = await supabase
            .from("bookmarks")
            .select("*")
            .order("created_at", { ascending: false });

        if (data) setBookmarks(data);
    };

    const addBookmark = async () => {
        if (!title || !url.startsWith("http")) {
            alert("Please enter title and valid URL starting with http/https")
            return;
        }

        await supabase.from("bookmarks").insert([
            {
                title,
                url,
                user_id: user.id,
            },
        ]);

        setTitle("");
        setUrl("");
        fetchBookmarks();
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
                    className="bg-black text-white px-4 py-2 rounded cursor-pointer"
                >
                    Add Bookmark
                </button>
            </div>

            <div>
                {bookmarks.map((bookmark) => (
                    <div
                        key={bookmark.id}
                        className="border p-3 mb-2 flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{bookmark.title}</p>
                            <a
                                href={bookmark.url}
                                target="_blank"
                                className="text-blue-500 text-sm"
                            >
                                {bookmark.url}
                            </a>
                        </div>
                        <button
                            onClick={() => deleteBookmark(bookmark.id)}
                            className="text-red-500"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
