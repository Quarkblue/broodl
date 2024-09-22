'use client'

import React, { useContext, useState, useEffect} from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = React.createContext();

export function useAuth(){
    return  useContext(AuthContext);
}

export function AuthProvider({children}){

    const [currentUser, setCurrentUser] = useState();
    const [userDataObj, setUserDataObj] = useState();
    const [loading, setLoading] = useState(true);

    function signup(email, password){
        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password){
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout(){
        setUserDataObj(null);
        setCurrentUser(null);
        return signOut(auth);
    }
    
    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, async (user)=>{
            try{
                setLoading(true);
                setCurrentUser(user);
                if(!user){
                    console.log("No user found");
                    return 
                }

                console.log("fetching user data");
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                let firebaseData = {};
                if(docSnap.exists()){
                    console.log("Found user data");
                    firebaseData = docSnap.data();
                    console.log(firebaseData);
                }
                setUserDataObj(firebaseData);
            }
            catch(err){
                console.log(err);
            }finally{
                setLoading(false);
            }
        });

        return unsubscribe;
        
    }, []);

    const value = {
        currentUser,
        userDataObj,
        signup,
        login,
        logout,
        loading,
        setUserDataObj
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}