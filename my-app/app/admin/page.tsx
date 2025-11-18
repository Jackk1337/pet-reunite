"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Users, PawPrint, Receipt, MessageSquare } from "lucide-react";

type DashboardStat = {
  key: "users" | "pets" | "orders" | "support";
  label: string;
  icon: React.ReactNode;
  collection: string;
  accent: string;
};

const STAT_CONFIG: DashboardStat[] = [
  {
    key: "users",
    label: "Users",
    icon: <Users className="h-5 w-5" />,
    collection: "users",
    accent: "from-blue-500/10 to-blue-500/5 text-blue-700 border-blue-100",
  },
  {
    key: "pets",
    label: "Pets",
    icon: <PawPrint className="h-5 w-5" />,
    collection: "pets",
    accent: "from-green-500/10 to-green-500/5 text-green-700 border-green-100",
  },
  {
    key: "orders",
    label: "Orders",
    icon: <Receipt className="h-5 w-5" />,
    collection: "orders",
    accent: "from-orange-500/10 to-orange-500/5 text-orange-700 border-orange-100",
  },
  {
    key: "support",
    label: "Support Queries",
    icon: <MessageSquare className="h-5 w-5" />,
    collection: "supportQueries",
    accent: "from-purple-500/10 to-purple-500/5 text-purple-700 border-purple-100",
  },
];

type AdminSection = "overview" | "users" | "pets" | "orders" | "support";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Record<DashboardStat["key"], number>>({
    users: 0,
    pets: 0,
    orders: 0,
    support: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<AdminSection>("overview");
  const [sectionData, setSectionData] = useState<{
    users: any[];
    pets: any[];
    orders: any[];
    support: any[];
  }>({ users: [], pets: [], orders: [], support: [] });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsCheckingAuth(false);
        router.replace("/");
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userSnap.data();
        if (!userSnap.exists() || userData?.isAdmin !== true) {
          router.replace("/");
          return;
        }

        setIsAdmin(true);
      } catch (authError) {
        console.error("Failed to verify admin privileges", authError);
        router.replace("/");
      } finally {
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;
      setIsLoadingStats(true);
      setError(null);
      try {
        const results = await Promise.all(
          STAT_CONFIG.map(async (config) => {
            const snapshot = await getDocs(collection(db, config.collection));
            const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            return { key: config.key, count: snapshot.size, records: docs };
          })
        );
        setStats((prev) => {
          const updated = { ...prev };
          results.forEach((result) => {
            updated[result.key] = result.count;
          });
          return updated;
        });
        setSectionData((prev) => {
          const updated = { ...prev };
          results.forEach((result) => {
            updated[result.key] = result.records;
          });
          return updated;
        });
      } catch (statsError) {
        console.error("Failed to load admin stats", statsError);
        setError("Unable to load dashboard data. Please try again shortly.");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  const sidebarItems = useMemo(
    () => [
      { label: "Overview", key: "overview" as AdminSection },
      { label: "Users", key: "users" as AdminSection },
      { label: "Pets", key: "pets" as AdminSection },
      { label: "Orders", key: "orders" as AdminSection },
      { label: "Support", key: "support" as AdminSection },
    ],
    []
  );

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-screen p-6">
          <div className="flex items-center gap-2 mb-10">
            <ShieldCheck className="h-6 w-6 text-orange-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Admin</p>
              <p className="font-semibold text-gray-900">PetReunite.io</p>
            </div>
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = selectedSection === item.key;
              return (
                <button
                  key={item.key}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                  onClick={() => setSelectedSection(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Admin Console</p>
              <h1 className="text-3xl font-bold text-gray-900">
                {selectedSection === "overview"
                  ? "Overview"
                  : sidebarItems.find((item) => item.key === selectedSection)?.label}
              </h1>
            </div>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 flex items-center gap-2"
              onClick={() => router.refresh()}
            >
              Refresh Data
            </Button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {selectedSection === "overview" && (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 mb-10">
                {STAT_CONFIG.map((stat) => (
                  <Card
                    key={stat.key}
                    className={`p-5 border ${stat.accent} bg-gradient-to-br`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-sm font-medium">{stat.label}</div>
                      <div className="rounded-full bg-white/70 p-2 text-current">{stat.icon}</div>
                    </div>
                    <div className="text-4xl font-bold text-gray-900">
                      {isLoadingStats ? (
                        <span className="text-lg text-gray-500 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading
                        </span>
                      ) : (
                        stats[stat.key].toLocaleString()
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="p-6 border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent activity</h2>
                  <p className="text-sm text-gray-600">
                    Hook up activity logs here (orders, new pets, alerts) to keep your team informed.
                  </p>
                  <div className="mt-6 space-y-3 text-sm text-gray-500">
                    <p>• No activity yet. Connect events to see real-time updates.</p>
                  </div>
                </Card>
                <Card className="p-6 border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Support queue</h2>
                  <p className="text-sm text-gray-600">
                    Show incoming support conversations or FAQs for faster triage.
                  </p>
                    <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                      No support queries have been submitted yet.
                    </div>
                  </Card>
                </div>
              </>
            )}

          {selectedSection !== "overview" && (
            <Card className="p-0 border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      {selectedSection === "users" && (
                        <>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Email</th>
                          <th className="px-4 py-3 text-left">Role</th>
                        </>
                      )}
                      {selectedSection === "pets" && (
                        <>
                          <th className="px-4 py-3 text-left">Name</th>
                          <th className="px-4 py-3 text-left">Species</th>
                          <th className="px-4 py-3 text-left">Owner</th>
                        </>
                      )}
                      {selectedSection === "orders" && (
                        <>
                          <th className="px-4 py-3 text-left">Plan</th>
                          <th className="px-4 py-3 text-left">Price</th>
                          <th className="px-4 py-3 text-left">Status</th>
                        </>
                      )}
                      {selectedSection === "support" && (
                        <>
                          <th className="px-4 py-3 text-left">Subject</th>
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Created</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {sectionData[selectedSection === "support" ? "support" : selectedSection].length === 0 ? (
                      <tr>
                        <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={4}>
                          No {selectedSection} found.
                        </td>
                      </tr>
                    ) : (
                      sectionData[selectedSection === "support" ? "support" : selectedSection].map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.id}</td>
                          {selectedSection === "users" && (
                            <>
                              <td className="px-4 py-3">{item.fullName || item.displayName || "—"}</td>
                              <td className="px-4 py-3">{item.email || "—"}</td>
                              <td className="px-4 py-3">{item.isAdmin ? "Admin" : "User"}</td>
                            </>
                          )}
                          {selectedSection === "pets" && (
                            <>
                              <td className="px-4 py-3">{item.name || "—"}</td>
                              <td className="px-4 py-3">{item.species || "—"}</td>
                              <td className="px-4 py-3">{item.OwnerID || "—"}</td>
                            </>
                          )}
                          {selectedSection === "orders" && (
                            <>
                              <td className="px-4 py-3">{item.planName || item.planKey || "—"}</td>
                              <td className="px-4 py-3">£{item.planPrice ?? "—"}</td>
                              <td className="px-4 py-3 capitalize">{item.status || "pending"}</td>
                            </>
                          )}
                          {selectedSection === "support" && (
                            <>
                              <td className="px-4 py-3">{item.subject || "—"}</td>
                              <td className="px-4 py-3 capitalize">{item.status || "open"}</td>
                              <td className="px-4 py-3">{item.createdAt || "—"}</td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

