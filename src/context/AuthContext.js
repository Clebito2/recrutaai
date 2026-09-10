"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
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

                    // Recuperar empresas cadastradas pelo usuário (inclusive de vagas anteriores)
                    let userCompanies = [];

                    try {
                        const jobsQ = query(collection(db, "jobs"), where("userId", "==", firebaseUser.uid));
                        const jobsSnap = await getDocs(jobsQ);
                        jobsSnap.forEach(jDoc => {
                            const cName = jDoc.data()?.companyName;
                            if (cName && typeof cName === 'string' && !userCompanies.includes(cName)) {
                                userCompanies.push(cName);
                            }
                        });
                    } catch (e) {
                        console.warn("[Auth] Aviso ao buscar vagas do usuario:", e);
                    }

                    if (profileSnap.exists()) {
                        const existingData = profileSnap.data();
                        const isMasterAdmin = [
                            "cleber.ihs@gmail.com",
                            "cleberdonato@ecossistemalive.com.br"
                        ].includes(firebaseUser.email?.toLowerCase());

                        // Combinar empresas salvas no perfil com as encontradas nas vagas
                        const savedCompanies = Array.isArray(existingData.companies) ? existingData.companies : [];
                        savedCompanies.forEach(c => {
                            if (c && !userCompanies.includes(c)) userCompanies.push(c);
                        });
                        if (existingData.companyName && !userCompanies.includes(existingData.companyName)) {
                            userCompanies.unshift(existingData.companyName);
                        }

                        const activeCompany = existingData.companyName || userCompanies[0] || (isMasterAdmin ? "Live Consultoria" : null);

                        const profileUpdates = {
                            companies: userCompanies,
                            companyName: activeCompany
                        };

                        if (isMasterAdmin && (!existingData.paymentApproved || existingData.status !== "active")) {
                            profileUpdates.status = "active";
                            profileUpdates.paymentApproved = true;
                            profileUpdates.plan = "elite";
                        }

                        await setDoc(profileRef, profileUpdates, { merge: true });
                        setUserProfile({ ...existingData, ...profileUpdates });
                    } else {
                        // Novo usuário — criação condicionada à aprovação de pagamento
                        const isMasterAdmin = [
                            "cleber.ihs@gmail.com",
                            "cleberdonato@ecossistemalive.com.br"
                        ].includes(firebaseUser.email?.toLowerCase());

                        const defaultCompany = isMasterAdmin ? "Live Consultoria" : (userCompanies[0] || null);
                        if (defaultCompany && !userCompanies.includes(defaultCompany)) {
                            userCompanies.push(defaultCompany);
                        }

                        const newProfile = {
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Usuário"),
                            createdAt: serverTimestamp(),
                            status: isMasterAdmin ? "active" : "pending_payment",
                            paymentApproved: isMasterAdmin ? true : false,
                            plan: isMasterAdmin ? "elite" : "pending",
                            companyName: defaultCompany,
                            companies: userCompanies,
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
                        companyName: isMasterAdmin ? "Live Consultoria" : null,
                        companies: isMasterAdmin ? ["Live Consultoria"] : []
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

    // Adicionar nova empresa à conta mantendo o histórico de todas
    const addCompany = async (companyName) => {
        if (!user || !companyName?.trim()) return;
        const trimmed = companyName.trim();
        const profileRef = doc(db, "users", user.uid);
        
        const currentCompanies = Array.isArray(userProfile?.companies) ? userProfile.companies : [];
        const updatedCompanies = currentCompanies.includes(trimmed) 
            ? currentCompanies 
            : [...currentCompanies, trimmed];

        await setDoc(profileRef, { 
            companyName: trimmed,
            companies: updatedCompanies 
        }, { merge: true });

        setUserProfile(prev => ({ 
            ...prev, 
            companyName: trimmed,
            companies: updatedCompanies 
        }));
    };

    // Alternar entre empresas já cadastradas
    const switchCompany = async (companyName) => {
        if (!user || !companyName) return;
        const profileRef = doc(db, "users", user.uid);
        await setDoc(profileRef, { companyName }, { merge: true });
        setUserProfile(prev => ({ ...prev, companyName }));
    };

    // Retrocompatibilidade
    const updateCompanyName = addCompany;

    const value = {
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        logout,
        addCompany,
        switchCompany,
        updateCompanyName,
        refreshUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
