"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Listen for redirect results & auth state changes
    useEffect(() => {
        // Captura retorno de signInWithRedirect caso o popup tenha sido bloqueado
        if (typeof window !== "undefined") {
            getRedirectResult(auth).catch((redirectErr) => {
                console.warn("[Auth] getRedirectResult:", redirectErr.message);
            });
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    // Fetch or create user profile in Firestore
                    const profileRef = doc(db, "users", firebaseUser.uid);
                    const profileSnap = await getDoc(profileRef);

                    if (profileSnap.exists()) {
                        setUserProfile(profileSnap.data());
                    } else {
                        // New user - create profile with trial
                        const newProfile = {
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Usuário"),
                            createdAt: serverTimestamp(),
                            trialStart: serverTimestamp(),
                            plan: "trial",
                            companyName: null,
                            jobsCount: 0,
                            cvCount: 0
                        };
                        await setDoc(profileRef, newProfile);
                        setUserProfile(newProfile);
                    }
                } catch (firestoreErr) {
                    console.warn("[Auth] Aviso ao sincronizar perfil no Firestore:", firestoreErr.message);
                    // Resiliência: não bloqueia a sessão se o Firestore tiver regras restritivas
                    setUserProfile({
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || "Usuário",
                        plan: "trial",
                        companyName: "Minha Empresa"
                    });
                }
            } else {
                setUserProfile(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

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

    // Sign in with Google (Popup com Fallback Automático para Redirect)
    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: "select_account" });

        try {
            const result = await signInWithPopup(auth, provider);
            return result.user;
        } catch (popupError) {
            console.warn("[Auth] signInWithPopup falhou, avaliando fallback...", popupError.code, popupError.message);
            
            const shouldFallbackToRedirect = [
                "auth/internal-error",
                "auth/popup-blocked",
                "auth/cancelled-popup-request",
                "auth/popup-closed-by-user"
            ].includes(popupError.code);

            if (shouldFallbackToRedirect && typeof window !== "undefined") {
                console.log("[Auth] Executando signInWithRedirect como fallback...");
                await signInWithRedirect(auth, provider);
                return null;
            }

            throw popupError;
        }
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
        signInWithGoogle,
        logout,
        updateCompanyName
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
