import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
export const useFirestoreCollection = (collectionName) => {
    return useQuery({
        queryKey: [collectionName],
        queryFn: async () => {
            const querySnapshot = await getDocs(collection(db, collectionName));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
};
export const useFirestoreDocument = (collectionName, id) => {
    return useQuery({
        queryKey: [collectionName, id],
        queryFn: async () => {
            const docRef = doc(db, collectionName, id);
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists())
                return null;
            return { id: snapshot.id, ...snapshot.data() };
        },
        enabled: !!id,
    });
};
export const useUpdateDocument = (collectionName) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [collectionName] });
        },
    });
};
