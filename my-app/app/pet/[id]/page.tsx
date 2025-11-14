"use client";

import type React from "react";

import { useState, useEffect, useMemo, use, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth, db, storage } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  addDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Image, Video, X } from "lucide-react";

export default function PetProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [pet, setPet] = useState<any | null>(null);
  const [owner, setOwner] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFound, setIsFound] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [replyName, setReplyName] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyFile, setReplyFile] = useState<File | null>(null);
  const [replyFilePreview, setReplyFilePreview] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const replyImageInputRef = useRef<HTMLInputElement>(null);
  const replyVideoInputRef = useRef<HTMLInputElement>(null);

  // Fetch pet by QR code
  useEffect(() => {
    const fetchPet = async () => {
      // Validate resolvedParams.id exists
      if (!resolvedParams?.id) {
        console.error("No QR code provided in URL");
        setPet(null);
        setIsLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, "pets"),
          where("qrCode", "==", resolvedParams.id)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const petDoc = querySnapshot.docs[0];
          const petData: any = {
            id: petDoc.id,
            ...petDoc.data(),
          };
          setPet(petData);
          setIsFound(petData.isMissing === true);

          // Fetch owner information
          if (petData.OwnerID) {
            try {
              const ownerRef = doc(db, "users", petData.OwnerID);
              const ownerSnap = await getDoc(ownerRef);
              if (ownerSnap.exists()) {
                setOwner(ownerSnap.data());
              }
            } catch (ownerError) {
              console.error("Error fetching owner:", ownerError);
              // Continue even if owner fetch fails
            }
          }
        } else {
          setPet(null);
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
        // Don't show alert, just set pet to null and let the UI handle it
        setPet(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPet();
  }, [resolvedParams.id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!pet?.id) {
      return;
    }

    setIsLoadingUpdates(true);
    const updatesRef = collection(db, "petUpdates");
    const updatesQuery = query(
      updatesRef,
      where("petId", "==", pet.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      updatesQuery,
      (snapshot) => {
        const formatted = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          let createdAt: Date | null = null;
          if (data.createdAt?.toDate) {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt) {
            createdAt = new Date(data.createdAt);
          }
          return {
            id: docSnap.id,
            ...data,
            createdAt,
          };
        });
        setUpdates(formatted);
        setIsLoadingUpdates(false);
      },
      (error) => {
        console.error("Error loading updates:", error);
        setIsLoadingUpdates(false);
      }
    );

    return () => unsubscribe();
  }, [pet?.id]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      if (replyFilePreview) {
        URL.revokeObjectURL(replyFilePreview);
      }
    };
  }, [filePreview, replyFilePreview]);

  useEffect(() => {
    if (
      currentUser?.uid &&
      pet?.OwnerID &&
      currentUser.uid === pet.OwnerID &&
      owner?.displayName
    ) {
      setUpdateName(owner.displayName);
    }
  }, [currentUser?.uid, pet?.OwnerID, owner?.displayName]);

  const handleFoundPet = async () => {
    if (!pet) return;

    setIsGettingLocation(true);
    setLocationError(null);

    // Request user's location
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latLong = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          // Update pet in Firestore
          const petRef = doc(db, "pets", pet.id);
          await updateDoc(petRef, {
            LatLong: latLong,
            isMissing: true,
            lastFoundAt: new Date().toISOString(),
          });

          // Update local state
          setPet({
            ...pet,
            LatLong: latLong,
            isMissing: true,
          });
          setIsFound(true);
        } catch (error) {
          console.error("Error updating pet location:", error);
          alert("Failed to update pet location. Please try again.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationError(
          "Failed to get your location. Please enable location services."
        );
        setIsGettingLocation(false);
      }
    );
  };

  const handleCallOwner = () => {
    if (owner?.phone || owner?.email) {
      // Try phone first, fallback to email
      const phone = owner.phone || owner.email;
      window.location.href = `tel:${phone}`;
    }
  };

  const handleTextOwner = () => {
    if (owner?.phone) {
      window.location.href = `sms:${owner.phone}`;
    } else if (owner?.email) {
      window.location.href = `mailto:${owner.email}`;
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    const maxSize = 12 * 1024 * 1024; // 12MB
    if (file.size > maxSize) {
      alert("Please upload a file smaller than 12MB.");
      return;
    }

    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleClearAttachment = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleReplyFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (replyFilePreview) {
        URL.revokeObjectURL(replyFilePreview);
      }
      setReplyFile(null);
      setReplyFilePreview(null);
      return;
    }

    const maxSize = 12 * 1024 * 1024; // 12MB
    if (file.size > maxSize) {
      alert("Please upload a file smaller than 12MB.");
      return;
    }

    if (replyFilePreview) {
      URL.revokeObjectURL(replyFilePreview);
    }

    setReplyFile(file);
    setReplyFilePreview(URL.createObjectURL(file));
  };

  const handleClearReplyAttachment = () => {
    if (replyFilePreview) {
      URL.revokeObjectURL(replyFilePreview);
    }
    setReplyFile(null);
    setReplyFilePreview(null);
  };

  const handlePostUpdate = async () => {
    if (!pet) {
      return;
    }
    if (!updateName.trim() || !updateMessage.trim()) {
      alert("Please enter your name and an update before posting.");
      return;
    }

    setIsPostingUpdate(true);
    try {
      let mediaUrl: string | null = null;
      let mediaType: "image" | "video" | null = null;

      if (selectedFile) {
        const storageRef = ref(
          storage,
          `pet-updates/${pet.id}/${Date.now()}-${selectedFile.name}`
        );
        await uploadBytes(storageRef, selectedFile);
        mediaUrl = await getDownloadURL(storageRef);
        mediaType = selectedFile.type.startsWith("video") ? "video" : "image";
      }

      await addDoc(collection(db, "petUpdates"), {
        petId: pet.id,
        authorName: updateName.trim(),
        authorId: currentUser?.uid || null,
        isOwner:
          currentUser?.uid && pet.OwnerID
            ? currentUser.uid === pet.OwnerID
            : false,
        message: updateMessage.trim(),
        mediaUrl,
        mediaType,
        parentId: null,
        reactions: {
          like: 0,
          love: 0,
          shock: 0,
        },
        createdAt: serverTimestamp(),
      });

      setUpdateName("");
      setUpdateMessage("");
      handleClearAttachment();
    } catch (error) {
      console.error("Error posting update:", error);
      alert("Unable to post your update. Please try again.");
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handlePostReply = async (parentUpdate: any) => {
    if (!pet || !parentUpdate) {
      return;
    }
    if (!replyName.trim() || !replyMessage.trim()) {
      alert("Please enter your name and a reply before posting.");
      return;
    }

    setIsPostingUpdate(true);
    try {
      let mediaUrl: string | null = null;
      let mediaType: "image" | "video" | null = null;

      if (replyFile) {
        const storageRef = ref(
          storage,
          `pet-updates/${pet.id}/${Date.now()}-${replyFile.name}`
        );
        await uploadBytes(storageRef, replyFile);
        mediaUrl = await getDownloadURL(storageRef);
        mediaType = replyFile.type.startsWith("video") ? "video" : "image";
      }

      await addDoc(collection(db, "petUpdates"), {
        petId: pet.id,
        authorName: replyName.trim(),
        authorId: currentUser?.uid || null,
        isOwner:
          currentUser?.uid && pet.OwnerID
            ? currentUser.uid === pet.OwnerID
            : false,
        message: replyMessage.trim(),
        mediaUrl,
        mediaType,
        parentId: parentUpdate.id,
        reactions: {
          like: 0,
          love: 0,
          shock: 0,
        },
        createdAt: serverTimestamp(),
      });

      setReplyName("");
      setReplyMessage("");
      setReplyTo(null);
      handleClearReplyAttachment();
    } catch (error) {
      console.error("Error posting reply:", error);
      alert("Unable to post your reply. Please try again.");
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleReaction = async (
    updateId: string,
    reaction: "like" | "love" | "shock"
  ) => {
    try {
      const updateRef = doc(db, "petUpdates", updateId);
      await updateDoc(updateRef, {
        [`reactions.${reaction}`]: increment(1),
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
      alert("Failed to register reaction. Please try again.");
    }
  };

  const reactionOptions = [
    { type: "like" as const, label: "Like", icon: "👍" },
    { type: "love" as const, label: "Love", icon: "❤️" },
    { type: "shock" as const, label: "Shock", icon: "😮" },
  ];

  const threadedUpdates = useMemo(() => {
    if (!updates.length) return [];

    const updateMap = new Map<string, any>();
    updates.forEach((update) => {
      updateMap.set(update.id, { ...update, replies: [] });
    });

    const sortByNewest = (a: any, b: any) => {
      const aTime = a.createdAt?.getTime?.() || 0;
      const bTime = b.createdAt?.getTime?.() || 0;
      return bTime - aTime;
    };

    const roots: any[] = [];
    updateMap.forEach((update) => {
      if (update.parentId && updateMap.has(update.parentId)) {
        updateMap.get(update.parentId).replies.push(update);
      } else {
        roots.push(update);
      }
    });

    roots.forEach((root) => root.replies.sort(sortByNewest));
    roots.sort(sortByNewest);

    const ownerThreads = roots.filter((update) => update.isOwner);
    const communityThreads = roots.filter((update) => !update.isOwner);

    return [...ownerThreads, ...communityThreads];
  }, [updates]);

  const formatDateTime = (date?: Date | null) => {
    if (!date) {
      return "Just now";
    }
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const renderUpdateThread = (update: any, depth = 0): React.ReactNode => {
    const reactions = update.reactions || {};
    const paddingLeft = depth ? depth * 20 : 0;
    return (
      <div key={update.id} style={{ marginLeft: paddingLeft }}>
        <Card
          className={`p-5 space-y-3 ${
            update.isOwner
              ? "border-2 border-orange-300 bg-orange-50/60"
              : "border border-gray-200"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">
              {update.authorName || "Community member"}
            </p>
            {update.isOwner && (
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                Pet Owner
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDateTime(update.createdAt)}
            </span>
          </div>
          <p className="text-gray-800 whitespace-pre-line">{update.message}</p>
          {update.mediaUrl && update.mediaType === "image" && (
            <img
              src={update.mediaUrl}
              alt="Community update attachment"
              className="max-h-96 w-full rounded-lg object-cover"
            />
          )}
          {update.mediaUrl && update.mediaType === "video" && (
            <video
              controls
              className="w-full rounded-lg"
              src={update.mediaUrl}
            />
          )}
          <div className="flex flex-wrap items-center gap-2">
            {reactionOptions.map((reaction) => (
              <Button
                key={`${update.id}-${reaction.type}`}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(update.id, reaction.type)}
              >
                {reaction.icon} {reaction.label} (
                {reactions?.[reaction.type] || 0})
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReplyTo(update);
                if (
                  currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID &&
                  owner?.displayName
                ) {
                  setReplyName(owner.displayName);
                } else if (!replyName) {
                  setReplyName("");
                }
              }}
            >
              💬 Reply
            </Button>
          </div>
        </Card>
        {replyTo?.id === update.id && (
          <Card className="mt-3 p-4 space-y-3 border border-orange-200 bg-orange-50/30">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-orange-900">
                Replying to {update.authorName || "this update"}
              </p>
              <button
                type="button"
                className="text-xs font-semibold text-orange-700 underline"
                onClick={() => {
                  setReplyTo(null);
                  setReplyMessage("");
                  setReplyName("");
                  handleClearReplyAttachment();
                }}
              >
                Cancel
              </button>
            </div>
            <div className="flex flex-col">
              <label
                htmlFor={`reply-name-${update.id}`}
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Your name
                {currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Auto-filled as pet owner)
                    </span>
                  )}
              </label>
              <input
                id={`reply-name-${update.id}`}
                type="text"
                value={replyName}
                onChange={(e) => setReplyName(e.target.value)}
                placeholder="Your name"
                readOnly={
                  currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID
                }
                className={`mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 ${
                  currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID
                    ? "bg-gray-50 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>
            <div className="flex flex-col">
              <textarea
                id={`reply-message-${update.id}`}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your reply..."
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
              />
              {replyFilePreview && (
                <div className="mt-3 relative">
                  {replyFile?.type.startsWith("video") ? (
                    <video
                      controls
                      className="w-full rounded-lg max-h-32"
                      src={replyFilePreview}
                    />
                  ) : (
                    <img
                      src={replyFilePreview}
                      alt="Reply preview"
                      className="w-full rounded-lg max-h-32 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleClearReplyAttachment}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    ref={replyImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleReplyFileChange}
                    className="hidden"
                  />
                  <input
                    ref={replyVideoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleReplyFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => replyImageInputRef.current?.click()}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-orange-600"
                    title="Add photo"
                  >
                    <Image size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => replyVideoInputRef.current?.click()}
                    className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-orange-600"
                    title="Add video"
                  >
                    <Video size={18} />
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={() => handlePostReply(update)}
                  disabled={isPostingUpdate}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isPostingUpdate ? "Posting..." : "Reply"}
                </Button>
              </div>
            </div>
          </Card>
        )}
        {update.replies?.length > 0 && (
          <div className="mt-3 space-y-3">
            {update.replies.map((reply: any) =>
              renderUpdateThread(reply, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🐾</div>
          <p className="text-gray-600">Loading pet information...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pet Not Found
          </h1>
          <p className="text-gray-600">
            The QR code you scanned does not match any pet in our database.
          </p>
        </div>
      </div>
    );
  }

  const missingReport = (pet as any).missingReport;
  const lostDateTime =
    missingReport?.lostDate && typeof missingReport.lostDate === "string"
      ? new Date(
          `${missingReport.lostDate}${
            missingReport.lostTime ? `T${missingReport.lostTime}` : "T00:00"
          }`
        )
      : null;
  const missingNotes =
    typeof missingReport?.notes === "string" ? missingReport.notes.trim() : "";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Status Badge */}
        {pet.isMissing && (
          <div className="mb-6">
            <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded-full font-semibold text-sm">
              🚨 Missing Pet Alert
            </span>
          </div>
        )}

        {/* Pet Image - Full width at top */}
        <div className="relative mb-8">
          {pet.image ? (
            <>
              <img
                src={pet.image}
                alt={pet.name}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
              {pet.isMissing && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                  Missing
                </div>
              )}
            </>
          ) : (
            <div
              className="w-full h-96 rounded-xl flex items-center justify-center text-6xl relative"
              style={{ backgroundColor: "#fff5f0" }}
            >
              🐾
              {pet.isMissing && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg shadow-lg">
                  Missing
                </div>
              )}
            </div>
          )}
        </div>

        {/* Missing Details and Pet Details - Side by side */}
        <div
          className={`grid gap-6 mb-8 ${
            pet.isMissing && missingReport
              ? "md:grid-cols-2"
              : "md:grid-cols-1 max-w-2xl mx-auto"
          }`}
        >
          {/* Missing Details */}
          {pet.isMissing && missingReport && (
            <Card className="p-6 space-y-4">
              <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900">
                  Missing Details
                </h2>
                <p className="text-sm text-gray-600">
                  Help {pet.name} get home faster by sharing the latest info
                  below.
                </p>
              </div>
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-gray-500">Approximate date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lostDateTime
                      ? lostDateTime.toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })
                      : missingReport.lostDate || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Approximate time</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {missingReport?.lostTime || "Not provided"}
                  </p>
                </div>
              </div>
              {missingNotes && (
                <div>
                  <p className="text-sm text-gray-500">Additional details</p>
                  <p className="text-gray-800 whitespace-pre-line text-sm">
                    {missingNotes}
                  </p>
                </div>
              )}
            </Card>
          )}

          {/* Pet Details */}
          <Card className="p-6 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {pet.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {pet.species} {pet.breed && `• ${pet.breed}`}
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-b pb-3">
                <p className="text-sm text-gray-600">Species</p>
                <p className="text-lg font-semibold text-gray-900">
                  {pet.species}
                </p>
              </div>
              {pet.breed && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">Breed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.breed}
                  </p>
                </div>
              )}
              {pet.age && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.age} years
                  </p>
                </div>
              )}
              {pet.color && (
                <div className="border-b pb-3">
                  <p className="text-sm text-gray-600">Color/Markings</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {pet.color}
                  </p>
                </div>
              )}
              {pet.microchip && (
                <div>
                  <p className="text-sm text-gray-600">Microchip ID</p>
                  <p className="text-lg font-semibold text-gray-900 font-mono">
                    {pet.microchip}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {!isFound && (
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleFoundPet}
                  disabled={isGettingLocation}
                >
                  {isGettingLocation
                    ? "Getting your location..."
                    : "I've found this pet"}
                </Button>
              )}

              {locationError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {locationError}
                </div>
              )}

              {isFound && (
                <>
                  <Button
                    size="lg"
                    className="w-full hover:opacity-90"
                    style={{ backgroundColor: "#ffb067" }}
                    onClick={handleCallOwner}
                  >
                    📞 Call Owner
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={handleTextOwner}
                  >
                    💬 Text Owner
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Last Known Location */}
        {isFound && pet.LatLong && (
          <div className="mb-8">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Last Known Location
              </h2>
              <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
                {googleMapsApiKey ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${pet.LatLong.latitude},${pet.LatLong.longitude}&zoom=15`}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-600">
                    Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to display
                    the embedded map for last known location.
                  </div>
                )}
              </div>
              {pet.lastFoundAt && (
                <p className="text-sm text-gray-600 mt-2">
                  Last reported: {new Date(pet.lastFoundAt).toLocaleString()}
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Community Updates */}
        <section className="mt-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Community Updates
              </h2>
              <p className="text-sm text-gray-600">
                Share sightings, encouragement, and tips to help reunite{" "}
                {pet.name} with their family. Owner updates are pinned to the
                top.
              </p>
            </div>
          </div>

          <Card className="mt-6 p-6 space-y-4">
            <div className="flex flex-col">
              <label
                htmlFor="update-name"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                Your name
                {currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Auto-filled as pet owner)
                    </span>
                  )}
              </label>
              <input
                id="update-name"
                type="text"
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="Let the community know who's posting"
                readOnly={
                  currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID
                }
                className={`mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 ${
                  currentUser?.uid &&
                  pet?.OwnerID &&
                  currentUser.uid === pet.OwnerID
                    ? "bg-gray-50 cursor-not-allowed"
                    : ""
                }`}
              />
            </div>

            <div className="flex flex-col">
              <textarea
                id="update-message"
                value={updateMessage}
                onChange={(e) => setUpdateMessage(e.target.value)}
                placeholder="Share an update about this pet..."
                rows={4}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 resize-none"
              />
              {filePreview && (
                <div className="mt-3 relative">
                  {selectedFile?.type.startsWith("video") ? (
                    <video
                      controls
                      className="w-full rounded-lg max-h-64"
                      src={filePreview}
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full rounded-lg max-h-64 object-cover"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleClearAttachment}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-orange-600"
                    title="Add photo"
                  >
                    <Image size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 hover:text-orange-600"
                    title="Add video"
                  >
                    <Video size={20} />
                  </button>
                </div>
                <Button onClick={handlePostUpdate} disabled={isPostingUpdate}>
                  {isPostingUpdate ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="mt-8 space-y-4">
            {isLoadingUpdates ? (
              <Card className="p-6 text-center text-gray-600">
                Gathering the latest community updates...
              </Card>
            ) : threadedUpdates.length === 0 ? (
              <Card className="p-6 text-center text-gray-600">
                Be the first to share an update for {pet.name}.
              </Card>
            ) : (
              threadedUpdates.map((update) => renderUpdateThread(update))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
