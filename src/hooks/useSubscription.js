"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export function useSubscription() {
    const { user, userProfile } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            if (!user || !userProfile) {
                setLoading(false);
                return;
            }

            try {
                // Calculate trial expiration
                const createdAt = userProfile.createdAt?.toDate?.() || new Date();
                const trialDays = 7;
                const expiresAt = new Date(createdAt);
                expiresAt.setDate(expiresAt.getDate() + trialDays);

                // GOD MODE for specific user
                const isGodUser = user.email === "cleber.ihs@gmail.com";

                let isExpired = new Date() > expiresAt;
                let daysRemaining = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)));

                if (isGodUser) {
                    isExpired = false;
                    daysRemaining = 9999;
                }

                // Define limits based on plan
                const limits = {
                    trial: { jobs: 1, cvs: 2 },
                    tier1: { jobs: 4, cvs: 20 },
                    tier2: { jobs: Infinity, cvs: Infinity }
                };

                let currentLimits = limits[userProfile.plan || "trial"];

                if (isGodUser) {
                    currentLimits = limits.tier2;
                }

                const hasReachedJobLimit = (userProfile.jobsCount || 0) >= currentLimits.jobs;
                const hasReachedCVLimit = (userProfile.cvCount || 0) >= currentLimits.cvs;

                // Check for 80% warning threshold
                const jobUsagePercent = (userProfile.jobsCount || 0) / currentLimits.jobs;
                const cvUsagePercent = (userProfile.cvCount || 0) / currentLimits.cvs;
                const isNearLimit = jobUsagePercent >= 0.8 || cvUsagePercent >= 0.8;

                setSubscription({
                    ...userProfile,
                    id: user.uid,
                    name: userProfile.companyName || userProfile.displayName,
                    isExpired,
                    daysRemaining,
                    currentLimits,
                    hasReachedJobLimit,
                    hasReachedCVLimit,
                    isNearLimit,
                    canCreateJob: !isExpired && !hasReachedJobLimit,
                    canAnalyzeCV: !isExpired && !hasReachedCVLimit
                });
            } catch (err) {
                console.error("Error fetching subscription:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [user, userProfile]);

    const incrementUsage = async (type) => {
        if (!user) return;

        const profileRef = doc(db, "users", user.uid);
        const field = type === "job" ? "jobsCount" : "cvCount";
        const currentCount = subscription?.[field] || 0;

        await updateDoc(profileRef, {
            [field]: currentCount + 1
        });

        // Update local state
        setSubscription(prev => ({
            ...prev,
            [field]: currentCount + 1
        }));
    };

    return { subscription, loading, error, incrementUsage };
}
