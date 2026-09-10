"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for auth state changes
    useEffect(() => {

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Fetch or create user profile in Firestore
                    const profileRef = doc(db, "users", firebaseUser.uid);
                    const profileSnap = await getDoc(profileRef);

                    if (profileSnap.exists()) {
                        const existingData = profileSnap.data();
                        const isMasterAdmin = [
                            "cleber.ihs@gmail.com",
                            "cleberdonato@ecossistemalive.com.br"
                        ].includes(firebaseUser.email?.toLowerCase());

                        if (isMasterAdmin && (!existingData.paymentApproved || existingData.status !== "active")) {
                            const adminOverride = { status: "active", paymentApproved: true, plan: "elite" };
                            await setDoc(profileRef, adminOverride, { merge: true });
                            setUserProfile({ ...existingData, ...adminOverride });
                        } else {
                            setUserProfile(existingData);
                        }
                    } else {
                        // Novo usuário — criação condicionada à aprovação de pagamento
                        const isMasterAdmin = [
                            "cleber.ihs@gmail.com",
                            "cleberdonato@ecossistemalive.com.br"
                        ].includes(firebaseUser.email?.toLowerCase());

                        const newProfile = {
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Usuário"),
                            createdAt: serverTimestamp(),
                            status: isMasterAdmin ? "active" : "pending_payment",
                            paymentApproved: isMasterAdmin ? true : false,
                            plan: isMasterAdmin ? "elite" : "pending",
                            companyName: isMasterAdmin ? "Live Consultoria" : null,
                            jobsCount: 0,
                            cvCount: 0
                        };
                        await setDoc(profileRef, newProfile);
                        setUserProfile(newProfile);
                    }
                } catch (firestoreErr) {
                    console.warn("[Auth] Aviso ao sincronizar perfil no Firestore:", firestoreErr.message);
                    const isMasterAdmin = [
                        "cleber.ihs@gmail.com",
                        "cleberdonato@ecossistemalive.com.br"
                    ].includes(firebaseUser.email?.toLowerCase());

                    setUserProfile({
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || "Usuário",
                        status: isMasterAdmin ? "active" : "pending_payment",
                        paymentApproved: isMasterAdmin ? true : false,
                        plan: isMasterAdmin ? "elite" : "pending",
                        companyName: isMasterAdmin ? "Live Consultoria" : null
                    });
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Recarregar perfil para verificar se o pagamento foi aprovado pelo admin
    const refreshUserProfile = async () => {
        if (!auth.currentUser) return null;
        try {
            const profileRef = doc(db, "users", auth.currentUser.uid);
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
                const data = profileSnap.data();
                setUserProfile(data);
                return data;
            }
        } catch (err) {
            console.error("[Auth] Erro ao recarregar perfil:", err);
        }
        return null;
    };

    // Sign up with email/password
    const signUp = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    // Sign in with email/password
    const signIn = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    // Log out
    const logout = async () => {
        await signOut(auth);
        setUserProfile(null);
    };

    // Update company name after onboarding
    const updateCompanyName = async (companyName) => {
        if (!user) return;

        const profileRef = doc(db, "users", user.uid);
        await setDoc(profileRef, { companyName }, { merge: true });
        setUserProfile(prev => ({ ...prev, companyName }));
    };

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        logout,
        updateCompanyName,
        refreshUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
